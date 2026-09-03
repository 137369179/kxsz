/**
 * 深度契约审计（变态级调试工具）
 *
 * 覆盖四类 Node 侧静态可判定的 BUG：
 *  A. DOM 契约：querySelector("#id") 引用的 id 在全仓库模板中从未被渲染 → 空指针
 *  B. 事件契约：EVENTS.X 使用了但 eventBus 未定义 → undefined 事件，监听永不触发
 *  C. 导入契约：named import 的绑定在目标模块中未导出 → ReferenceError / undefined
 *  D. 资源契约：代码/数据中引用的 assets/* 文件在磁盘上不存在 → 404 破图
 *
 * 用法: node tools/_deep_contract_audit.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname, extname } from "path";

const ROOT = process.cwd();
const SKIP = new Set(["node_modules", ".git", ".workbuddy", ".trae", "_backup", "dist", "mos_test"]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(js|mjs|html)$/.test(extname(p))) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const jsFiles = files.filter((f) => /\.(js|mjs)$/.test(extname(f)));
const htmlFiles = files.filter((f) => /\.html$/.test(extname(f)));
const allFiles = files;

// ---------- A. DOM id 契约（跳过本工具自身，避免正则自匹配）----------
const isSelfTool = (f) => f.includes(`${ROOT}/tools/_`);
// 收集全仓库所有被渲染的 id（模板字符串里的 id="..." / id='...' / id="${...}" 前静态部分）
const renderedIds = new Set();
for (const f of allFiles) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/id=["']([a-zA-Z0-9_-]+)["']/g)) renderedIds.add(m[1]);
  // 动态拼接的 id 前缀，如 id="char-${x}" 记录前缀以便人工判断
}
// 动态创建的元素: overlay.id = "..."; el.id = "..."
for (const f of jsFiles) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/\.id\s*=\s*["']([a-zA-Z0-9_-]+)["']/g)) renderedIds.add(m[1]);
}

const domIssues = [];
for (const f of jsFiles) {
  if (isSelfTool(f) || f.includes("/tests/")) continue;
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/querySelector(?:All)?\(\s*["']#([a-zA-Z0-9_-]+)["']\s*\)/g)) {
    const id = m[1];
    if (!renderedIds.has(id)) {
      domIssues.push({ file: f, id });
    }
  }
}

// ---------- B. 事件常量契约 ----------
const eventBusSrc = (() => {
  const p = join(ROOT, "src/utils/eventBus.js");
  return existsSync(p) ? readFileSync(p, "utf8") : "";
})();
const definedEvents = new Set();
for (const m of eventBusSrc.matchAll(/^\s{2}([A-Z0-9_]+):\s*["'`]/gm)) definedEvents.add(m[1]);
const eventIssues = [];
for (const f of allFiles) {
  if (f.endsWith("eventBus.js") || isSelfTool(f)) continue;
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/EVENTS\.([A-Z0-9_]+)/g)) {
    if (!definedEvents.has(m[1])) eventIssues.push({ file: f, event: m[1] });
  }
}

// ---------- C. 命名导入契约 ----------
function exportedNames(file) {
  const src = readFileSync(file, "utf8");
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z0-9_$]+)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const as = t.split(/\s+as\s+/);
      names.add((as[1] || as[0]).trim());
    }
  }
  if (/export\s+default/.test(src)) names.add("default");
  return names;
}
const exportCache = new Map();
const importIssues = [];
for (const f of jsFiles) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/import\s*\{([^}]+)\}\s*from\s*["'](\.[^"']+)["']/g)) {
    const target = join(dirname(f), m[2]);
    if (!existsSync(target)) continue; // 悬空路径由其他检查负责
    if (!exportCache.has(target)) exportCache.set(target, exportedNames(target));
    const exp = exportCache.get(target);
    for (const raw of m[1].split(",")) {
      const t = raw.trim();
      if (!t) continue;
      const name = t.split(/\s+as\s+/)[0].trim();
      if (!exp.has(name)) importIssues.push({ file: f, name, from: m[2] });
    }
  }
}

// ---------- D. 资源文件契约 ----------
const assetIssues = [];
const assetCache = new Map();
for (const f of allFiles) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/["'(]((?:assets|src\/assets)\/[A-Za-z0-9_\-./]+)["')]/g)) {
    let rel = m[1];
    if (rel.includes("*") || rel.includes("${")) continue;
    if (!assetCache.has(rel)) assetCache.set(rel, existsSync(join(ROOT, rel)));
    if (!assetCache.get(rel)) assetIssues.push({ file: f, asset: rel });
  }
}

// ---------- E. 循环模板内的静态 id（重复 id → querySelector 取错元素）----------
const loopIdIssues = [];
for (const f of jsFiles) {
  if (isSelfTool(f)) continue;
  const lines = readFileSync(f, "utf8").split("\n");
  let window_ = 0;
  lines.forEach((ln, i) => {
    if (/\.map\(|\.forEach\(|Array\.from\(/.test(ln)) window_ = 8; // 模板通常紧跟在 map 之后若干行
    if (window_ > 0) {
      const m = ln.match(/id=["']([a-zA-Z0-9_-]+)["']/);
      if (m) loopIdIssues.push({ file: f, line: i + 1, id: m[1], code: ln.trim().slice(0, 80) });
    }
    if (window_ > 0) window_--;
  });
}

// ---------- F. Service Worker 预缓存文件存在性 ----------
const swIssues = [];
const swPath = join(ROOT, "sw.js");
if (existsSync(swPath)) {
  const swSrc = readFileSync(swPath, "utf8");
  const m = swSrc.match(/CORE_ASSETS\s*=\s*\[([\s\S]*?)\]/);
  if (m) {
    const list = [...m[1].matchAll(/["'](\.[^"']+)["']/g)].map((x) => x[1]);
    for (const p of list) {
      if (!existsSync(join(ROOT, p.replace(/^\.\//, "")))) swIssues.push(p);
    }
  }
}

// ---------- 报告 ----------
const uniq = (arr, keyFn) => {
  const seen = new Set();
  return arr.filter((x) => { const k = keyFn(x); if (seen.has(k)) return false; seen.add(k); return true; });
};

console.log("================ 深度契约审计 ================");
console.log(`扫描文件: ${allFiles.length} (js ${jsFiles.length} / html ${htmlFiles.length})`);
console.log(`已渲染 id: ${renderedIds.size}`);

console.log(`\n[A] DOM 契约 — querySelector("#id") 找不到对应渲染 (${domIssues.length})`);
uniq(domIssues, (x) => x.file + x.id).forEach((x) => console.log(`   ⚠️  ${x.file.replace(ROOT + "/", "")}  ->  #${x.id}`));
if (!domIssues.length) console.log("   ✅ 无悬空 DOM 引用");

console.log(`\n[B] 事件契约 — EVENTS.X 未定义 (${uniq(eventIssues, (x) => x.event).length})`);
[...new Set(eventIssues.map((x) => x.event))].forEach((e) => console.log(`   ⚠️  EVENTS.${e}  (使用于 ${eventIssues.find((x) => x.event === e).file.replace(ROOT + "/", "")})`));
if (!uniq(eventIssues, (x) => x.event).length) console.log("   ✅ 无未定义事件常量");

console.log(`\n[C] 导入契约 — named import 未导出 (${importIssues.length})`);
uniq(importIssues, (x) => x.file + x.name).forEach((x) => console.log(`   ⚠️  ${x.file.replace(ROOT + "/", "")}  ->  ${x.name}  from ${x.from}`));
if (!importIssues.length) console.log("   ✅ 无未导出命名导入");

console.log(`\n[D] 资源契约 — 引用的 assets 文件不存在 (${uniq(assetIssues, (x) => x.asset).length})`);
[...new Set(assetIssues.map((x) => x.asset))].forEach((a) => console.log(`   ⚠️  ${a}  (引用自 ${assetIssues.find((x) => x.asset === a).file.replace(ROOT + "/", "")})`));
if (!uniq(assetIssues, (x) => x.asset).length) console.log("   ✅ 无缺失资源引用");

console.log(`\n[E] 循环模板内静态 id — 可能重复 id (${loopIdIssues.length})`);
loopIdIssues.forEach((x) => console.log(`   ⚠️  ${x.file.replace(ROOT + "/", "")}:${x.line}  id="${x.id}"  ${x.code}`));
if (!loopIdIssues.length) console.log("   ✅ 无循环内静态 id");

console.log(`\n[F] SW 预缓存 — CORE_ASSETS 缺失文件 (${swIssues.length})`);
swIssues.forEach((p) => console.log(`   ⚠️  ${p}`));
if (!swIssues.length) console.log("   ✅ 预缓存条目全部存在");

const total =
  domIssues.length +
  uniq(eventIssues, (x) => x.event).length +
  importIssues.length +
  uniq(assetIssues, (x) => x.asset).length +
  loopIdIssues.length +
  swIssues.length;
console.log(`\n================ 合计可疑: ${total} ================`);
