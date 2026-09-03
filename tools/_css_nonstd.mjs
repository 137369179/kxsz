/**
 * 精确找出「非标准 Tailwind 类」：符合 Tailwind 前缀-值 命名格式，但重新编译的 prod.css 里没有。
 * 用 acorn 提取 class="..." 字符串字面量（不含 ${} 插值），避免模板嵌套误报。
 * 用法: node tools/_css_nonstd.mjs
 */
import { parse } from "acorn";
import { readFileSync } from "fs";
import { execSync } from "child_process";

const css = readFileSync("assets/css/prod.css", "utf8");
const files = execSync('find src -name "*.js"').toString().trim().split("\n");

// 收集所有 class 字符串字面量 + 模板 quasi 文本里 class="..." 的完整 tokens
const classes = new Set();
function addFromClassString(s) {
  // s 形如 "a b c" 或含 ${} 的模板片段，这里只处理纯字面量
  s.split(/\s+/).forEach((c) => { if (c) classes.add(c); });
}
function walk(n) {
  if (!n || typeof n !== "object") return;
  if (n.type === "TemplateLiteral") {
    for (const q of n.quasis) {
      const raw = q.value.raw;
      const re = /class="([^"]*)"/g;
      let m;
      while ((m = re.exec(raw))) addFromClassString(m[1]);
    }
  }
  for (const k of Object.keys(n)) {
    if (k === "quasis" || k === "start" || k === "end" || k === "loc" || k === "range") continue;
    const v = n[k];
    if (Array.isArray(v)) v.forEach((x) => x && x.type && walk(x));
    else if (v && typeof v === "object" && v.type) walk(v);
  }
}
for (const f of files) {
  let s; try { s = readFileSync(f, "utf8"); } catch { continue; }
  let ast; try { ast = parse(s, { ecmaVersion: "latest", sourceType: "module" }); } catch { continue; }
  walk(ast);
}

// Tailwind 工具类前缀
const TW_PREFIX = /^(w|h|min-w|max-w|min-h|max-h|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y|text|font|leading|tracking|bg|from|via|to|border|rounded|shadow|ring|ring-offset|z|top|bottom|left|right|inset|flex|grid|items|justify|content|self|place|order|col|row|overflow|opacity|rotate|scale|translate|skew|animate|transition|duration|delay|ease|blur|brightness|contrast|grayscale|saturate|sepia|backdrop|cursor|select|pointer-events|resize|object|aspect|columns|basis|grow|shrink|fill|stroke|accent|appearance|outline|divide|decoration|underline|indent|align|whitespace|break|list|table|border-collapse|origin|perspective|transform|will-change|touch|scroll|snap|container|clear|float|static|fixed|absolute|relative|sticky|hidden|block|inline|visible|invisible|sr-only|truncate|overflow-ellipsis|italic|not-italic|antialiased|subpixel-antialiased)-/;

const nonstd = [];
for (const c of classes) {
  if (!TW_PREFIX.test(c)) continue; // 只看 Tailwind 格式的
  const esc = c.replace(/([^A-Za-z0-9_\-])/g, "\\$1");
  if (!css.includes("." + esc)) nonstd.push(c);
}

console.log("非标准 Tailwind 类(格式匹配但 prod.css 无):", nonstd.length);
console.log([...new Set(nonstd)].sort().join(" "));
