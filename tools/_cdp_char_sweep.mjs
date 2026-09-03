/**
 * 变态级别探针 2：跨字符学习流扫荡。
 * 按 stage × mechanism 抽样汉字，逐个走完学习六步，验证：
 *   - 每步交互元素是否存在且可点击（玩/认/读/练/写/测）
 *   - 步骤能否正常推进
 *   - 是否产生 JS 异常 / console.error
 *
 * 用法：node tools/_cdp_char_sweep.mjs [baseUrl] [sampleSize]
 */
import { spawn } from "child_process";
import { setTimeout as delay } from "timers/promises";

const BASE = process.argv[2] || "http://127.0.0.1:8902";
const SAMPLE = Number(process.argv[3] || 12);
const PORT = 9334;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PROFILE = "/tmp/cathy-sweep-profile";

const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`,
  "--no-sandbox", "--disable-gpu", "--no-proxy-server", "--proxy-bypass-list=*",
  "--window-size=1280,900", "--autoplay-policy=no-user-gesture-required", "about:blank",
], { stdio: "ignore" });
const cleanup = () => { try { chrome.kill("SIGKILL"); } catch {} };
process.on("exit", cleanup);

async function waitForDevTools() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok) return; } catch {}
    await delay(250);
  }
  throw new Error("DevTools 未就绪");
}
async function getPageTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page?.webSocketDebuggerUrl) return page;
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
let currentChar = "(boot)";

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
    const t = (d.exception && d.exception.description) || d.text || "?";
    if (!/getUserMedia|NotSupported|Not allowed/i.test(t)) {
      exceptions.push({ char: currentChar, text: t.split("\n")[0].slice(0, 200) });
    }
  } else if (msg.method === "Runtime.consoleAPICalled" && p.type === "error") {
    const txt = (p.args || []).map((a) => a.value ?? a.description ?? a.type).join(" ");
    if (!/getUserMedia|NotSupported|Not allowed/i.test(txt)) {
      consoleErrors.push({ char: currentChar, text: txt.slice(0, 200) });
    }
  }
};

const send = (method, params = {}) => {
  const id = ++msgId;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((res, rej) => pending.set(id, { resolve: res, reject: rej }));
};
async function evalJS(expression) {
  // 若调用方已自带 async IIFE 表达式，直接求值；否则包一层以支持 `return ...` 语句
  const src = /^\s*\(?async[\s(]/.test(expression) ? expression : `(() => { ${expression} })()`;
  const r = await send("Runtime.evaluate", {
    expression: src, awaitPromise: true, returnByValue: true,
  });
  if (r.exceptionDetails) {
    const d = r.exceptionDetails;
    return { __error: (d.exception && d.exception.description) || d.text };
  }
  return r.result?.value;
}
const sleep = (ms) => evalJS(`return new Promise(r => setTimeout(() => r(1), ${ms}));`);

await send("Runtime.enable");
await send("Page.enable");
await send("Page.navigate", { url: `${BASE}/?v=2.8.1&sweep=1` });
await delay(2500);

// 1. 抽样：按 stage × mechanism 分层
const samples = await evalJS(`
  (async () => {
    const m = await import('/src/data/characters.js');
    const db = m.CHARACTER_DATABASE;
    const buckets = new Map();
    for (const c of db) {
      const k = (c.stage || 1) + '|' + (c.mechanism || '?');
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k).push(c);
    }
    const keys = [...buckets.keys()];
    const out = [];
    for (let i = 0; i < keys.length && out.length < ${SAMPLE}; i++) {
      const arr = buckets.get(keys[i]);
      out.push({ char: arr[0].char, id: arr[0].id, stage: arr[0].stage, mechanism: arr[0].mechanism, interaction: arr[0].interaction, bucketSize: arr.length });
    }
    return out;
  })();
`);
console.log(`抽样 ${samples.length} 个汉字（按 stage×mechanism 分层）:`, samples.map((s) => `${s.char}(${s.stage}/${s.mechanism})`).join(" "));

// 2. 逐字走学习六步
const STEP_TARGETS = [
  { nav: "#btn-next-to-rec", name: "玩", sels: ["#play-interactive-stage", "#rub-canvas", "#interactive-actor"] },
  { nav: "#btn-finish-rec-step", name: "认", sels: ["#btn-jelly-char", "#sentence-card"] },
  { nav: "#btn-finish-read-step", name: "读", sels: ["#btn-start-record", "#manual-rating-panel", "#mic-interaction-zone"] },
  { nav: "#btn-next-to-write", name: "练", sels: ["#space-shooting-range button", ".balloon-target-btn"] },
  { nav: "#btn-finish-write-step", name: "写", sels: ["#hanzi-magic-canvas", "#btn-demo-write", "#write-stroke-beads"] },
  { nav: null, name: "测", sels: ["#golden-chest-stage", "#btn-open-golden-chest", "#star-slot-1"] },
];

const rows = [];
for (const s of samples) {
  currentChar = `${s.char}(${s.mechanism})`;
  const before = exceptions.length + consoleErrors.length;
  await evalJS(`
    (async () => {
      const m = await import('/src/data/characters.js');
      const c = m.CHARACTER_DATABASE.find(x => x.id === ${JSON.stringify(s.id)});
      window.cathyApp.startLearnFlow(c);
      return 1;
    })();
  `);
  await sleep(750);

  const stepResults = [];
  for (const st of STEP_TARGETS) {
    const r = await evalJS(`
      const vp = document.querySelector('#game-app-viewport');
      const cur = (window.cathyApp.learnModule && window.cathyApp.learnModule.currentStep) || 0;
      let hit = null;
      for (const sel of ${JSON.stringify(st.sels)}) {
        const el = vp && vp.querySelector(sel);
        if (el) { hit = sel; try { el.click(); } catch (e) { hit = sel + '(clickErr)'; } break; }
      }
      return { step: cur, hit };
    `);
    await sleep(450);
    if (st.nav) {
      await evalJS(`
        const vp = document.querySelector('#game-app-viewport');
        const nb = vp && vp.querySelector(${JSON.stringify(st.nav)});
        if (nb) nb.click();
        return !!nb;
      `);
      await sleep(450);
    }
    const after = await evalJS(`
      const vp = document.querySelector('#game-app-viewport');
      const cur = (window.cathyApp.learnModule && window.cathyApp.learnModule.currentStep) || 0;
      const txt = (vp && vp.innerText) || "";
      return { step: cur, bad: ["undefined", "NaN", "[object"].filter((s) => txt.includes(s)).slice(0, 2) };
    `);
    const badList = (after && after.bad) || [];
    stepResults.push(`${st.name}:步${r.step}→${after ? after.step : "?"}[${r.hit || "无元素"}]${badList.length ? "可疑:" + badList.join(",") : ""}`);
  }
  const newErr = exceptions.length + consoleErrors.length - before;
  rows.push(`${s.char.padEnd(2)} stage${s.stage} ${String(s.mechanism).padEnd(6)} ${newErr ? "❌错误" + newErr : "✅"} ${stepResults.join(" | ")}`);
}

console.log("\n============ 跨字符学习流扫荡 ============");
rows.forEach((r) => console.log("  " + r));
console.log(`\n---- 异常 (${exceptions.length}) ----`);
exceptions.slice(0, 20).forEach((e) => console.log(`  ✖ [${e.char}] ${e.text}`));
console.log(`---- console.error (${consoleErrors.length}) ----`);
consoleErrors.slice(0, 20).forEach((e) => console.log(`  ! [${e.char}] ${e.text}`));

ws.close();
chrome.kill("SIGKILL");
process.exit(0);
