/**
 * 模板字符串内 // 中文注释检测门禁（CI 用）
 * 用 acorn AST 精确定位 TemplateLiteral 文本段(quasi)内的 // 中文注释，
 * 发现违规返回非零退出码（供 GitHub Actions 门禁阻断）。
 * 用法: node tools/_check_tpl_comments.mjs
 */
import { parse } from "acorn";
import { readFileSync } from "fs";
import { execSync } from "child_process";

function walk(node, out) {
  if (!node || typeof node !== "object") return;
  if (node.type === "TemplateLiteral") {
    for (const q of node.quasis) {
      const m = q.value.raw.match(/\/\/\s*[\u4e00-\u9fa5]/g);
      if (m) out.push({ count: m.length });
    }
  }
  for (const k of Object.keys(node)) {
    if (k === "quasis" || k === "start" || k === "end" || k === "loc" || k === "range") continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach((x) => x && x.type && walk(x, out));
    else if (v && typeof v === "object" && v.type) walk(v, out);
  }
}

const files = execSync('find src -name "*.js"').toString().trim().split("\n").filter(Boolean);
let total = 0;
for (const f of files) {
  let src;
  try { src = readFileSync(f, "utf8"); } catch { continue; }
  let ast;
  try { ast = parse(src, { ecmaVersion: "latest", sourceType: "module" }); } catch { continue; }
  const hits = [];
  walk(ast, hits);
  if (hits.length) {
    const n = hits.reduce((s, h) => s + h.count, 0);
    total += n;
    console.log(`  ✖ ${f}: ${n} 处`);
  }
}

if (total > 0) {
  console.error(`\n❌ 发现 ${total} 处模板字符串内 // 中文注释（会渲染成可见垃圾文字）。`);
  console.error("   请运行: node tools/_fix_tpl_comments.mjs");
  process.exit(1);
}
console.log("✅ 无模板字符串内 // 中文注释");
