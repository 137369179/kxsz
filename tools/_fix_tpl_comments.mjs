/**
 * 修复「模板字符串文本段内误用的 // 中文注释」—— 这些注释会被当作可见文字渲染到界面。
 * 基于 acorn AST 精确定位 TemplateLiteral 的文本段(quasi)，仅删除「整行仅含空白+//中文注释」的行。
 * 用法: node tools/_fix_tpl_comments.mjs [--dry]
 */
import { parse } from "acorn";
import { readFileSync, writeFileSync, statSync } from "fs";
import { execSync } from "child_process";

const DRY = process.argv.includes("--dry");

function collectQuasis(node, out) {
  if (!node || typeof node !== "object") return;
  if (node.type === "TemplateLiteral") {
    for (const q of node.quasis) {
      if (/\/\/\s*[\u4e00-\u9fa5]/.test(q.value.raw)) out.push(q);
    }
  }
  for (const k of Object.keys(node)) {
    if (k === "quasis" || k === "start" || k === "end" || k === "loc" || k === "range") continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach((n) => n && n.type && collectQuasis(n, out));
    else if (v && typeof v === "object" && v.type) collectQuasis(v, out);
  }
}

// 删除「整行仅空白+//注释」的行（含其行尾换行）
function cleanQuasi(raw) {
  return raw.replace(/^[ \t]*\/\/[^\n]*\n/gm, "");
}

const files = execSync('find src -name "*.js"').toString().trim().split("\n").filter(Boolean);
let totalRemoved = 0;

for (const f of files) {
  let src;
  try { src = readFileSync(f, "utf8"); } catch { continue; }
  let ast;
  try { ast = parse(src, { ecmaVersion: "latest", sourceType: "module" }); } catch (e) { console.log("⚠️ 解析失败(跳过):", f, e.message); continue; }

  const quasis = [];
  collectQuasis(ast, quasis);
  if (quasis.length === 0) continue;

  // 倒序替换，避免位置偏移
  quasis.sort((a, b) => b.start - a.start);
  let removed = 0;
  for (const q of quasis) {
    const raw = q.value.raw;
    const cleaned = cleanQuasi(raw);
    if (cleaned !== raw) {
      removed += (raw.match(/\/\/\s*[\u4e00-\u9fa5]/g) || []).length;
      src = src.slice(0, q.start) + cleaned + src.slice(q.end);
    }
  }
  if (removed > 0) {
    totalRemoved += removed;
    if (!DRY) writeFileSync(f, src);
    console.log(`${DRY ? "[dry]" : "✅"} ${f}: 删除 ${removed} 处`);
  }
}

console.log(`\n${DRY ? "【试运行】" : "【已完成】"} 共处理 ${totalRemoved} 处模板内 // 注释`);
