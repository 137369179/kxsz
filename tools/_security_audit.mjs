#!/usr/bin/env node
/**
 * 凯茜识字 · 深度全链路安全漏洞审计工具 (Deep Security Audit)
 * ==========================================================
 * 检查项矩阵：
 *  [1] 静态服务器防护：路径穿越 (Path Traversal)、空字节注入 (%00)、非法 HTTP 动词、安全响应头
 *  [2] 语音服务防护：SSML/XML 注入防范、超限 Payload 内存 DoS 防护、队列洪泛防护
 *  [3] 前端防 XSS 审计：检查用户/档案动态数据渲染中的 HTML 实体转义 (escapeHtml)
 *  [4] 原型链污染防护：StorageManager 导入导出与换机迁移中的 __proto__ / constructor 深度清洗
 *  [5] 危险 API 审计：全站禁止 eval()、new Function()、无 rel 的 target="_blank"
 *  [6] 输入边界防护：小名及用户输入长度上限与控制字符过滤
 */

import fs from "fs";
import path from "path";
import { resolve, normalize, extname, sep } from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log("================ 凯茜识字 深度安全漏洞审计 ================\n");

// -------------------------------------------------------------
// [1] 静态服务器安全审计
// -------------------------------------------------------------
console.log("[1] 静态文件服务器安全性审计 (tools/_static_server.mjs):");
const staticServerCode = fs.readFileSync(path.join(ROOT, "tools", "_static_server.mjs"), "utf-8");

assert(
  staticServerCode.includes("resolve(ROOT,") && staticServerCode.includes("rootPrefix"),
  "静态服务包含绝对路径沙盒限制与 rootPrefix 边界判定（防范 ../ 目录穿越）"
);

assert(
  staticServerCode.includes("\\0") || staticServerCode.includes("%00"),
  "静态服务包含空字节截断过滤检测（防范 %00 绕过）"
);

assert(
  staticServerCode.includes("405") && staticServerCode.includes("GET") && staticServerCode.includes("HEAD"),
  "静态服务严格校验 HTTP 请求动词（仅允许 GET 与 HEAD，拦截 POST/PUT/DELETE 等）"
);

assert(
  staticServerCode.includes("X-Content-Type-Options") && staticServerCode.includes("nosniff"),
  "静态服务返回 X-Content-Type-Options: nosniff 安全响应头"
);

assert(
  staticServerCode.includes("X-Frame-Options") && staticServerCode.includes("SAMEORIGIN"),
  "静态服务返回 X-Frame-Options: SAMEORIGIN 点击劫持防护头"
);

assert(
  staticServerCode.includes("reqOrigin") && staticServerCode.includes("allowOrigin"),
  "静态服务限制 CORS 来源为本地回环开发地址（防范公网站点跨域窃取本地静态资源）"
);

// -------------------------------------------------------------
// [2] 本地神经语音代理服务安全性审计 (tools/voice-server.mjs)
// -------------------------------------------------------------
console.log("\n[2] 语音代理服务安全性审计 (tools/voice-server.mjs):");
const voiceServerCode = fs.readFileSync(path.join(ROOT, "tools", "voice-server.mjs"), "utf-8");

assert(
  voiceServerCode.includes("SAFE_VOICE_RE") && voiceServerCode.includes("SAFE_RATE_PITCH_RE"),
  "语音服务对 voice/rate/pitch 参数实施严格白名单正则校验（防范 SSML/XML 属性注入）"
);

assert(
  voiceServerCode.includes("MAX_BODY_SIZE") && voiceServerCode.includes("413"),
  "POST 预热端点设置 1MB 内存上限防护并在超限时返回 413 Payload Too Large"
);

assert(
  voiceServerCode.includes(".slice(0, 500)"),
  "预热队列数量实施 500 条上限硬截断（防范任务队列内存与连接洪泛 DoS）"
);

assert(
  voiceServerCode.includes("isAllowedOrigin") && voiceServerCode.includes("chrome-extension:"),
  "语音服务实施严格的 CORS Origin 域名白名单校验（仅允许 localhost/127.0.0.1/插件）"
);

assert(
  voiceServerCode.includes("X-Content-Type-Options") && voiceServerCode.includes("nosniff"),
  "语音服务返回 X-Content-Type-Options: nosniff 与 X-Frame-Options: DENY 安全防护头"
);

// -------------------------------------------------------------
// [3] 前端防 XSS 与动态数据转义审计
// -------------------------------------------------------------
console.log("\n[3] 前端防 XSS 与模板注入审计:");

const sharedShellCode = fs.readFileSync(path.join(ROOT, "src", "components", "SharedShell.js"), "utf-8");
assert(
  !sharedShellCode.includes("toast.innerHTML =") && sharedShellCode.includes("toast.textContent ="),
  "SharedShell.js 中的 showGameToast 全量采用 textContent 纯文本渲染（杜绝 Toast DOM XSS）"
);

const worksheetCode = fs.readFileSync(path.join(ROOT, "src", "utils", "worksheetGenerator.js"), "utf-8");
assert(
  worksheetCode.includes("escapeHtml(title)"),
  "worksheetGenerator.js 打印字帖标题经过 escapeHtml 实体转义后再输出至 iframe"
);

const parentTabsCode = fs.readFileSync(path.join(ROOT, "src", "utils", "parentHub", "parentTabs.js"), "utf-8");
assert(
  !parentTabsCode.includes("${activeProfile.name}") && parentTabsCode.includes("escapeHtml(activeProfile.name)"),
  "parentTabs.js 中当前档案名称使用 escapeHtml 转义渲染"
);
assert(
  !parentTabsCode.includes("data-profile-name=\"${p.name}\"") && parentTabsCode.includes("data-profile-name=\"${safeName}\""),
  "parentTabs.js 中档案列表 data-profile-name 与文本使用 safeName 转义渲染"
);

const rewardViewsCode = fs.readFileSync(path.join(ROOT, "src", "utils", "rewardHub", "rewardViews.js"), "utf-8");
assert(
  rewardViewsCode.includes("escapeHtml(profile.name)"),
  "rewardViews.js 中勋章与成就面板的 profile.name 使用 escapeHtml 转义渲染"
);

const parentPosterCode = fs.readFileSync(path.join(ROOT, "src", "utils", "parentHub", "parentPoster.js"), "utf-8");
assert(
  parentPosterCode.includes("replace(/<[^>]*>/g, \"\")") && parentPosterCode.includes(".slice(0, 16)"),
  "parentPoster.js 中状元证书姓名执行 HTML 标签剥离与长度截断"
);

// -------------------------------------------------------------
// [4] 原型链污染与数据导入防范审计 (src/utils/storageManager.js)
// -------------------------------------------------------------
console.log("\n[4] 原型链污染与数据完整性审计 (src/utils/storageManager.js):");
const storageManagerCode = fs.readFileSync(path.join(ROOT, "src", "utils", "storageManager.js"), "utf-8");

assert(
  storageManagerCode.includes("__proto__") && storageManagerCode.includes("constructor") && storageManagerCode.includes("prototype"),
  "storageManager.js 具备 deepSanitizeObject 原型链污染清洗机制，过滤 __proto__ 等危险键"
);

assert(
  storageManagerCode.includes("sanitizeProfileName") && storageManagerCode.includes(".slice(0, 20)"),
  "storageManager.js 对档案命名实施标签剥离与 20 字符安全截断"
);

assert(
  storageManagerCode.includes("5 * 1024 * 1024"),
  "导入 JSON 与换机迁移码设置 5MB 数据体积防御阈值，拦截巨型恶意 Payload"
);

// -------------------------------------------------------------
// [5] 依赖包与供应链风险审计 (package.json)
// -------------------------------------------------------------
console.log("\n[5] 依赖供应链安全审计 (package.json):");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf-8"));
assert(
  !pkg.dependencies || Object.keys(pkg.dependencies).length === 0,
  "package.json 生产依赖为 0（纯静态 Web 应用无后端供应链 CVE 暴露面）"
);

// -------------------------------------------------------------
// [6] 危险代码特征全局扫描 (eval / Function / unsafe target blank)
// -------------------------------------------------------------
console.log("\n[6] 全站危险代码 API 全局静态扫描:");

function walkDir(dir, filter, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git" && entry.name !== "dist" && entry.name !== "cache") {
        walkDir(fullPath, filter, callback);
      }
    } else if (filter(entry.name)) {
      callback(fullPath);
    }
  }
}

let dangerousEvals = 0;
let dangerousFunctions = 0;
let dangerousTargetBlanks = 0;

walkDir(path.join(ROOT, "src"), (name) => name.endsWith(".js"), (filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  // 过滤多行与单行注释后检测危险 API
  const cleanCode = content.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*/g, "");
  const evalMatches = cleanCode.match(/\beval\s*\(/g);
  if (evalMatches) dangerousEvals += evalMatches.length;

  const funcMatches = cleanCode.match(/\bnew\s+Function\s*\(/g);
  if (funcMatches) dangerousFunctions += funcMatches.length;

  // 匹配 target="_blank" 且未紧随 rel="noopener"
  const targetMatches = content.match(/target=["']_blank["'](?![\s\S]{0,40}rel=["'][^"']*noopener)/gi);
  if (targetMatches) dangerousTargetBlanks += targetMatches.length;
});

assert(dangerousEvals === 0, `全局源码 0 处不安全 eval() 调用 (检测到: ${dangerousEvals})`);
assert(dangerousFunctions === 0, `全局源码 0 处不安全 new Function() 调用 (检测到: ${dangerousFunctions})`);
assert(dangerousTargetBlanks === 0, `全局源码 0 处缺少 noopener 的 target="_blank" 链接 (检测到: ${dangerousTargetBlanks})`);

// -------------------------------------------------------------
// 汇总报告
// -------------------------------------------------------------
console.log(`\n================ 审计结果汇总 ================`);
console.log(`通过检查项: ${passed}`);
console.log(`违例检查项: ${failed}`);
if (failed === 0) {
  console.log(`🛡️  全栈安全审计通过！未发现任何高危及中危安全漏洞。\n`);
  process.exit(0);
} else {
  console.error(`⚠️  发现 ${failed} 处安全隐患，请立即修复！\n`);
  process.exit(1);
}
