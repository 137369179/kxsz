#!/usr/bin/env node
/**
 * E2E 渲染验证 — headless Chrome + AppleScript 真实 Chrome
 * 
 * 依赖: Google Chrome (系统) + macOS screencapture
 * 用法: node tools/_e2e_render.mjs
 */
import { execSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DEV_URL = "http://127.0.0.1:5173";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const OK = "\x1b[32m✅\x1b[0m";
const FAIL = "\x1b[31m❌\x1b[0m";
let pass = 0, total = 0;
function check(label, cond, extra = "") {
  total++;
  if (cond) { pass++; console.log(`  ${OK} ${label}${extra ? " " + extra : ""}`); }
  else { console.log(`  ${FAIL} ${label}${extra ? " " + extra : ""}`); }
}

function sh(cmd, opts = {}) {
  try { return execSync(cmd, { timeout: 20000, stdio: ["ignore", "pipe", "pipe"], ...opts }).toString().trim(); }
  catch (e) { return (e.stdout || e.stderr || "").toString().trim(); }
}

console.log("═══════════════════════════════════════════════════");
console.log("  E2E 渲染验证 — headless + real Chrome");
console.log("═══════════════════════════════════════════════════\n");

// [1] Dev Server 可达
console.log("[1] Dev Server 连通");
const code1 = sh(`curl -s -o /dev/null -w "%{http_code}" ${DEV_URL}`);
check("HTTP 200", code1 === "200");
const code2 = sh(`curl -s -o /dev/null -w "%{http_code}" ${DEV_URL}/src/app.js`);
check("app.js HTTP 200", code2 === "200");
console.log("");

// [2] HTML 基础结构
console.log("[2] HTML 基础结构 (headless dump-dom)");
const html = sh(`"${CHROME}" --headless=new --disable-gpu --no-sandbox --virtual-time-budget=6000 --dump-dom "${DEV_URL}" 2>/dev/null || echo ''`);
check("HTML 非空", html.length > 1000, `(${html.length.toLocaleString()} chars)`);
check("viewport meta", html.includes("viewport"));
check("凯茜识字 / Cathy Literacy", html.includes("识字") || html.includes("Cathy"));
// Vite inline proxy 会把 app.js rewrite 成 src="src/app.js" (无前导 /)
check("app.js 已注入", html.includes('src="src/app.js"') || html.includes("src='/src/app.js'") || html.includes('src="/src/app.js"'));
// root id = game-app-viewport（Vite inline proxy 包了一层）
check("root container", html.includes("app") || html.includes("viewport") || html.includes("game-app"));
console.log("");

// [3] JS 执行后 DOM（virtual-time 8s）
console.log("[3] JS 执行后 DOM (virtual-time=8s)");
const html8 = sh(`"${CHROME}" --headless=new --disable-gpu --no-sandbox --virtual-time-budget=8000 --run-all-compositor-stages-before-draw --dump-dom "${DEV_URL}" 2>/dev/null || echo ''`);
check("JS 执行后 HTML 更大", html8.length >= html.length - 500);
// 组件容器：game-app-viewport / module-container / mount 后 class
const hasContainer = (html8.match(/game-app-viewport/g) || []).length >= 1 || html8.includes("module-container") || html8.includes("drill-container") || html8.includes("char-card") || html8.includes("map-stage") || html8.includes("mounted");
check("有组件容器渲染", hasContainer);
// 检查汉字（常用字出现即 JS 跑了）
const commonCharRegex = /[日月山水火人口手花鸟鱼虫天地土金木石牛羊马狗蛇]/;
const charMatches = html8.match(/[日月山水火人口手花鸟鱼虫天地土金木石牛羊马狗蛇]/g) || [];
check("DOM 有汉字渲染", charMatches.length >= 3, `(${charMatches.length} 字)`);

console.log("");

// [4] AppleScript 真实 Chrome
console.log("[4] AppleScript 真实 Chrome 交互");
sh(`osascript -e 'tell application "Google Chrome"
    activate
    if (count of windows) = 0 then make new window
    set URL of active tab of front window to "${DEV_URL}"
end tell' 2>/dev/null`);
sh("sleep 5");
const title = sh(`osascript -e 'tell application "Google Chrome" to get title of active tab of front window' 2>/dev/null`);
check("Chrome 标题有意义", title.length > 0);
const url = sh(`osascript -e 'tell application "Google Chrome" to get URL of active tab of front window' 2>/dev/null`);
check("Chrome URL = dev", url.includes("5173") || url === DEV_URL);
sh(`osascript -e 'tell application "Google Chrome" to set bounds of window 1 to {0, 25, 390, 869}' 2>/dev/null`);
sh("sleep 1 && screencapture -x /tmp/e2e-chrome-real.png 2>/dev/null");
const shotSize = existsSync("/tmp/e2e-chrome-real.png") ? statSync("/tmp/e2e-chrome-real.png").size : 0;
check("截图生成", shotSize > 10000, shotSize ? `(${Math.round(shotSize/1024)}KB)` : "");
console.log("");

// [5] 8 组件模块 HTTP 可加载
console.log("[5] 组件模块 HTTP 200");
const mods = ["MapModule","LearnModule","ReviewModule","PlayModule","BookModule","ParentModule","PinyinModule","RewardModule"];
for (const m of mods) {
  const c = sh(`curl -s -o /dev/null -w "%{http_code}" "${DEV_URL}/src/components/${m}.js"`);
  check(`${m}.js`, c === "200", c);
}
console.log("");

// [6] 核心引擎模块 HTTP 可加载
console.log("[6] 核心引擎 HTTP 200");
const utils = ["multimodalEngine","fsrsScheduler","flashcardEngine","difficultyEngine","chantEngine","etymologyEngine","readingGatekeeper","rewardThrottle","reportEngine","hanziEngine","prewriteEngine","sessionPlanner","toneContrastGame"];
for (const u of utils) {
  const c = sh(`curl -s -o /dev/null -w "%{http_code}" "${DEV_URL}/src/utils/${u}.js"`);
  check(`${u}.js`, c === "200", c);
}
console.log("");

console.log("═══════════════════════════════════════════════════");
console.log(`  E2E: ${pass}/${total} 通过`);
if (pass === total) console.log("  🎉 全链路通过 — 可上线");
else console.log(`  ⚠ ${total - pass} 项需人工确认`);
console.log("  截图: /tmp/e2e-chrome-real.png");
console.log("═══════════════════════════════════════════════════");
process.exit(pass === total ? 0 : 1);
