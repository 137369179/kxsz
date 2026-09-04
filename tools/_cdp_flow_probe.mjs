/**
 * 变态级别运行时探针：CDP (Chrome DevTools Protocol) 驱动真实页面，遍历所有模块与学习六步，
 * 捕获：JS 异常 / console.error / 资源 404 / DOM 异常值(undefined|NaN) / 空渲染。
 *
 * 前置：需已启动静态服务（如 node tools/_static_server.mjs 8902）
 * 用法：node tools/_cdp_flow_probe.mjs [baseUrl]
 */
import { spawn } from "child_process";
import { setTimeout as delay } from "timers/promises";

const BASE = process.argv[2] || "http://127.0.0.1:8902";
const PORT = 9333;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PROFILE = "/tmp/cathy-cdp-profile";

const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE}`,
  "--no-sandbox", "--disable-gpu", "--no-proxy-server",
  "--proxy-bypass-list=*", "--window-size=1280,900",
  "--disable-features=AudioServiceOutOfProcess",
  "--autoplay-policy=no-user-gesture-required",
  "about:blank",
], { stdio: "ignore" });

const cleanup = () => { try { chrome.kill("SIGKILL"); } catch {} };
process.on("exit", cleanup);

async function waitForDevTools() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return true;
    } catch {}
    await delay(250);
  }
  throw new Error("DevTools 未就绪");
}

async function getPageTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page && page.webSocketDebuggerUrl) return page;
    } catch {}
    await delay(250);
  }
  throw new Error("未找到 page target");
}

await waitForDevTools();
const target = await getPageTarget();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let msgId = 0;
const pending = new Map();
const exceptions = [];
const consoleErrors = [];
const badResponses = [];
const logErrors = [];
let cdp = null;

ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    return;
  }
  if (!msg.method) return;
  const p = msg.params || {};
  if (msg.method === "Runtime.exceptionThrown") {
    const d = p.exceptionDetails || {};
    exceptions.push({
      text: (d.exception && d.exception.description) || d.text || "unknown",
      line: d.lineNumber, url: d.url,
    });
  } else if (msg.method === "Runtime.consoleAPICalled" && (p.type === "error" || p.type === "warning")) {
    const txt = (p.args || []).map((a) => a.value ?? a.description ?? a.type).join(" ").slice(0, 400);
    consoleErrors.push(`[${p.type}] ${txt}`);
  } else if (msg.method === "Log.entryAdded" && ["error", "warning"].includes(p.entry?.level)) {
    logErrors.push(`[${p.entry.level}] ${p.entry.text} ${p.entry.url || ""}`.slice(0, 300));
  } else if (msg.method === "Network.responseReceived") {
    const st = p.response?.status || 0;
    if (st >= 400) badResponses.push(`${st} ${p.response.url}`);
  } else if (msg.method === "Network.loadingFailed") {
    badResponses.push(`FAILED ${p.errorText} ${p.type || ""}`);
  }
};

function send(method, params = {}) {
  const id = ++msgId;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evalJS(expression) {
  const r = await send("Runtime.evaluate", {
    expression: `(() => { ${expression} })()`,
    awaitPromise: true, returnByValue: true,
  });
  if (r.exceptionDetails) {
    const d = r.exceptionDetails;
    return { __error: (d.exception && d.exception.description) || d.text };
  }
  return r.result?.value;
}

const sleep = (ms) => evalJS(`return new Promise(r => setTimeout(() => r(1), ${ms}));`);

// ---------- 启动采集 ----------
await send("Runtime.enable");
await send("Page.enable");
await send("Log.enable");
await send("Network.enable");

const MODES = ["map", "books", "play", "cards", "parent", "reward", "review", "pk", "pinyin", "treehouse", "idiom", "poem", "family"];
const report = [];

await send("Page.navigate", { url: `${BASE}/?v=2.8.1&probe=1` });
await delay(2500);
await evalJS(`return 1;`); // warm

const bootOk = await evalJS(`
  if (!window.cathyApp) return { ok: false, why: "window.cathyApp 未暴露" };
  return { ok: true, mode: window.cathyApp.currentMode };
`);
report.push(`启动: ${JSON.stringify(bootOk)}`);

// ---------- 遍历所有模式 ----------
for (const mode of MODES) {
  const before = exceptions.length + consoleErrors.length;
  const snap = await evalJS(`
    try {
      window.cathyApp.switchMode(${JSON.stringify(mode)});
    } catch (e) { return { mode: ${JSON.stringify(mode)}, crash: String(e && e.message || e) }; }
    return null;
  `);
  await sleep(600);
  const state = await evalJS(`
    const vp = document.querySelector('#game-app-viewport');
    if (!vp) return { mode: ${JSON.stringify(mode)}, err: "viewport 丢失" };
    const txt = vp.innerText || "";
    return {
      mode: ${JSON.stringify(mode)},
      htmlLen: vp.innerHTML.length,
      textLen: txt.length,
      bad: (txt.match(/undefined|NaN|\\[object/g) || []).slice(0, 3),
      nodes: vp.querySelectorAll('button').length,
    };
  `);
  const newErrors = exceptions.length + consoleErrors.length - before;
  report.push(`模式 ${state.mode}: html=${state.htmlLen} 按钮=${state.nodes} 可疑=${JSON.stringify(state.bad || [])} 新增错误=${newErrors}${snap?.crash ? " CRASH:" + snap.crash : ""}${state.err ? " ERR:" + state.err : ""}`);
}

// ---------- 学习六步全流程 ----------
await evalJS(`
  window.__probeChar = (window.CHARACTER_DATABASE && window.CHARACTER_DATABASE[0]) || null;
  if (!window.__probeChar) {
    const mod = document.createElement('script'); mod.type = 'module';
    document.body.appendChild(mod);
  }
  return 1;
`);
const learnStart = await evalJS(`
  (async () => {
    if (!window.__probeChar) {
      const m = await import('/src/data/characters.js');
      window.__probeChar = m.CHARACTER_DATABASE[0];
    }
    window.cathyApp.startLearnFlow(window.__probeChar);
    return { started: true, char: window.__probeChar.char };
  })();
`);
report.push(`学习流启动: ${JSON.stringify(learnStart)}`);
await sleep(900);

const STEP_FLOW = [
  { step: 1, target: "#play-interactive-stage, #interactive-actor, #play-target-anim", nav: "#btn-next-to-rec", name: "玩" },
  { step: 2, target: "#btn-jelly-char, #rec-char-circle, [data-char-circle]", nav: "#btn-finish-rec-step", name: "认" },
  { step: 3, target: "#btn-start-record", nav: "#btn-finish-read-step", name: "读" },
  { step: 4, target: ".balloon-target-btn", nav: "#btn-next-to-write", name: "练" },
  { step: 5, target: "#write-canvas, canvas", nav: "#btn-finish-write-step", name: "写" },
  { step: 6, target: ".quiz-option, [data-quiz]", nav: null, name: "测" },
];

for (const f of STEP_FLOW) {
  const before = exceptions.length + consoleErrors.length;
  const stepInfo = await evalJS(`
    const st = document.querySelector('#game-app-viewport');
    const cur = (window.cathyApp.learnModule && window.cathyApp.learnModule.currentStep) || 0;
    let interacted = false;
    const el = st && st.querySelector(${JSON.stringify(f.target)});
    if (el) { try { el.click(); interacted = true; } catch (e) { interacted = "clickErr:" + e.message; } }
    return { currentStep: cur, targetFound: !!el, interacted };
  `);
  await sleep(700);
  const navRes = await evalJS(`
    const st = document.querySelector('#game-app-viewport');
    ${f.nav ? `
    const nb = st && st.querySelector(${JSON.stringify(f.nav)});
    if (nb) { nb.click(); const cur2 = (window.cathyApp.learnModule && window.cathyApp.learnModule.currentStep) || 0;
      return { clicked: true, afterStep: cur2 }; }
    return { clicked: false, why: "导航按钮缺失" };` : `return { clicked: false, why: "末步无导航" };`}
  `);
  await sleep(600);
  // T15 字理问答等模态：导航后若出现弹窗（未推进），点击跳过/关闭让其走完 callback
  const modalHandled = await evalJS(`
    const skip = document.querySelector('#btn-quiz-skip, .etymology-quiz-modal [data-skip], .quiz-modal .btn-close, #btn-skip-quiz');
    if (skip) { skip.click(); return true; }
    return false;
  `);
  await sleep(500);
  const dom = await evalJS(`
    const vp = document.querySelector('#game-app-viewport');
    const txt = (vp && vp.innerText) || "";
    const cur = (window.cathyApp.learnModule && window.cathyApp.learnModule.currentStep) || 0;
    return { step: cur, htmlLen: vp ? vp.innerHTML.length : 0, bad: (txt.match(/undefined|NaN|\\[object/g) || []).slice(0, 3) };
  `);
  const newErrors = exceptions.length + consoleErrors.length - before;
  report.push(`  步骤${f.step}(${f.name}): 当前步=${stepInfo.currentStep} 交互元素=${stepInfo.targetFound} 交互=${stepInfo.interacted} 导航=${JSON.stringify(navRes)}${modalHandled ? " [T15弹窗已跳过]" : ""} → 步=${dom.step} html=${dom.htmlLen} 可疑=${JSON.stringify(dom.bad)} 新增错误=${newErrors}`);
}

// ---------- 关键交互点突击 ----------
const probes = [
  ["map", "#btn-open-world-overview", "世界全景 Modal"],
  ["map", ".island-teleport-card", "岛屿传送卡片"],
  ["map", ".level-node", "关卡节点"],
  ["map", "#btn-quick-target-char", "直达最新生字"],
  ["map", "#btn-daily-signin", "每日签到"],
  ["reward", "[data-tab]", "奖励城堡标签"],
  ["cards", "#flip-card, [data-card]", "字卡翻转"],
  ["books", "[data-book-id]", "绘本卡片"],
];
for (const [mode, sel, label] of probes) {
  const before = exceptions.length + consoleErrors.length;
  await evalJS(`try { window.cathyApp.switchMode(${JSON.stringify(mode)}); } catch {}`);
  await sleep(500);
  const r = await evalJS(`
    const vp = document.querySelector('#game-app-viewport');
    const el = vp && vp.querySelector(${JSON.stringify(sel)});
    if (!el) return { found: false };
    try { el.click(); } catch (e) { return { found: true, clickErr: e.message }; }
    return { found: true, clicked: true };
  `);
  await sleep(700);
  const dom = await evalJS(`
    const vp = document.querySelector('#game-app-viewport');
    const txt = (vp && vp.innerText) || "";
    return { htmlLen: vp ? vp.innerHTML.length : 0, bad: (txt.match(/undefined|NaN|\\[object/g) || []).slice(0, 3) };
  `);
  const newErrors = exceptions.length + consoleErrors.length - before;
  report.push(`交互 ${label} (${mode} ${sel}): ${JSON.stringify(r)} html=${dom.htmlLen} 可疑=${JSON.stringify(dom.bad)} 新增错误=${newErrors}`);
}

// ---------- 输出报告 ----------
console.log("\n================ CDP 全流程探针报告 ================");
report.forEach((l) => console.log(l));

console.log(`\n---- JS 异常 (${exceptions.length}) ----`);
[...new Set(exceptions.map((e) => e.text))].slice(0, 25).forEach((t) => console.log("  ✖ " + t.split("\n")[0].slice(0, 220)));

console.log(`\n---- console.error/warn (${consoleErrors.length}) ----`);
[...new Set(consoleErrors)].slice(0, 25).forEach((t) => console.log("  ! " + t.slice(0, 220)));

console.log(`\n---- 资源 404/失败 (${badResponses.length}) ----`);
[...new Set(badResponses)].slice(0, 25).forEach((t) => console.log("  4 " + t.slice(0, 200)));

console.log(`\n---- Log entry 错误 (${logErrors.length}) ----`);
[...new Set(logErrors)].slice(0, 12).forEach((t) => console.log("  L " + t.slice(0, 200)));

ws.close();
chrome.kill("SIGKILL");
process.exit(0);
