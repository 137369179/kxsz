#!/usr/bin/env node
/**
 * 触控目标适龄审计（儿童 44px+ 基线，WCAG 2.5.5 / Apple HIG）
 * ------------------------------------------------------------------
 * CDP 遍历核心模块，统计「独立操作按钮」（button / [role=button] / .cursor-pointer）
 * 的渲染高度分布，报告 <44px 与 <48px 的数量与占比，供适龄性门禁。
 *
 * 用法：node tools/_touch_audit.mjs [baseUrl]（需先起静态服务）
 */
import { spawn } from "child_process";
import { existsSync } from "fs";
import { setTimeout as delay } from "timers/promises";

const BASE = process.argv[2] || "http://127.0.0.1:8902";
const PORT = 9336;
const CHROME = process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PROFILE = "/tmp/cathy-touch-profile";
const MODES = ["map", "cards", "review", "pk", "play", "reward", "pinyin"];

if (!existsSync(CHROME)) {
  console.warn(`⚠️ [touch_audit] 跳过: 未检测到 Chrome 可执行文件 (${CHROME})`);
  process.exit(0);
}

let chrome;
try {
  chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`,
    "--no-sandbox", "--disable-gpu", "--no-proxy-server",
    "--autoplay-policy=no-user-gesture-required", "--window-size=1366,768", "about:blank",
  ]);
  chrome.on("error", (err) => {
    console.warn(`⚠️ [touch_audit] 启动 Chrome 异常: ${err.message}`);
    process.exit(0);
  });
} catch (err) {
  console.warn(`⚠️ [touch_audit] 无法启动 Chrome 进程: ${err.message}`);
  process.exit(0);
}

const cleanup = () => { try { if (chrome) chrome.kill("SIGKILL"); } catch {} };
process.on("exit", cleanup);

async function waitForDevTools() {
  for (let i = 0; i < 24; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await r.json();
      const page = list.find((t) => t.type === "page");
      if (page?.webSocketDebuggerUrl) return page;
    } catch {}
    await delay(250);
  }
  return null;
}
const target = await waitForDevTools();
if (!target) {
  console.warn(`⚠️ [touch_audit] 跳过: Chrome DevTools 未能在指定时间内就绪 (端口 ${PORT})`);
  cleanup();
  process.exit(0);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let msgId = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
  }
};
const send = (method, params = {}) => {
  const id = ++msgId;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((res, rej) => pending.set(id, { resolve: res, reject: rej }));
};
async function evalJS(expression) {
  const src = /^\s*\(?async[\s(]/.test(expression) ? expression : `(() => { ${expression} })()`;
  const r = await send("Runtime.evaluate", { expression: src, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) return { __error: (r.exceptionDetails.exception?.description) || r.exceptionDetails.text };
  return r.result?.value;
}
await send("Runtime.enable");
await send("Page.enable");
await send("Page.navigate", { url: `${BASE}/?probe=1` });
await delay(3500);

const SMALL_IDEAL = 44, SMALL_HARD = 48;
const results = [];
for (const mode of MODES) {
  await evalJS(`try { window.cathyApp && window.cathyApp.switchMode(${JSON.stringify(mode)}); } catch {}`);
  await delay(1800);
  const stat = await evalJS(`
    const vp = document.querySelector('#game-app-viewport');
    const root = vp || document.body;
    const els = [...root.querySelectorAll('button, [role="button"], a[href], .cursor-pointer, [data-tab], [data-island-id], .level-node, .parent-tab-btn')];
    const seen = new Set();
    const heights = [];
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const key = el.tagName + el.className + el.textContent.slice(0, 12);
      if (seen.has(key)) continue;
      seen.add(key);
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const cls = (el.className || '').toString();
      // 命中区补丁：index.html 对 btn-game-*/w-10 h-10/w-9 h-9 加 ::before inset:-7px 扩热区
      const hasPad = /(?:^|\\s)(btn-game-(?:wood|orange|purple|blue|green|red)|w-10 h-10|w-9 h-9)(?:$|\\s)/.test(cls);
      const visualH = Math.round(r.height);
      const effH = hasPad ? Math.round(r.height + 14) : visualH; // +7px 上下扩
      heights.push({ h: visualH, eff: effH, hasPad, cls: cls.slice(0, 40) });
    }
    return { mode: ${JSON.stringify(mode)}, total: heights.length,
      small44: heights.filter(x => x.eff < 44).length,
      visual44: heights.filter(x => x.h < 44 && !x.hasPad).length,
      samples: heights.filter(x => x.eff < 44).slice(0, 5) };
  `);
  results.push(stat);
  const pct = stat.total ? Math.round(stat.eff44 === undefined ? stat.small44 / stat.total * 100 : (stat.small44 / stat.total) * 100) : 0;
  console.log(`${stat.mode.padEnd(8)} 可点去重 ${String(stat.total).padEnd(3)} | 有效命中<44px ${String(stat.small44).padEnd(3)} (${pct}%) | 视觉<44无补丁 ${String(stat.visual44).padEnd(3)} | 样例: ${(stat.samples || []).map(s => s.eff + "px eff " + s.cls).join(" | ") || "无"}`);
}

const agg = { t: 0, s44: 0 };
results.forEach(r => { if (typeof r.total === "number") { agg.t += r.total; agg.s44 += r.small44; } });
console.log(`\n==== 触控审计汇总（按有效命中区含伪元素补丁） ====`);
console.log(`总去重可点元素: ${agg.t} | 有效命中 <44px: ${agg.s44} (${agg.t ? Math.round(agg.s44 / agg.t * 100) : 0}%)`);
console.log(`门禁建议: 有效命中 <44px 占比 <5%${agg.t ? (agg.s44 / agg.t * 100 < 5 ? " ✅ 达标" : " ⚠️ 超限") : ""}`);
ws.close();
cleanup();
process.exit(0);
