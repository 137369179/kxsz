/**
 * 审计 prod.css 是否覆盖源码中所有 Tailwind 类名。
 * 用法: node tools/_css_audit.mjs
 */
import { readFileSync } from "fs";
import { execSync } from "child_process";

const css = readFileSync("assets/css/prod.css", "utf8");
const files = execSync('find src -name "*.js"').toString().trim().split("\n");

const cls = new Set();
for (const f of files) {
  const s = readFileSync(f, "utf8");
  const re = /class="([^"]*)"/g;
  let m;
  while ((m = re.exec(s))) {
    m[1].split(/\s+/).forEach((c) => {
      if (c && /^[a-z][a-zA-Z0-9\[\]\/\.:-]*$/.test(c)) cls.add(c);
    });
  }
}

const missing = [];
for (const c of cls) {
  // Tailwind 编译后选择器会转义特殊字符（/ : [ ] . 等），用 CSS.escape 语义匹配
  const escaped = c.replace(/([^A-Za-z0-9_\-])/g, "\\$1");
  if (!css.includes("." + escaped)) missing.push(c);
}

console.log("源码类名总数:", cls.size, "| prod.css 缺失:", missing.length);
console.log("缺失样本(前40):", missing.slice(0, 40).join(" "));

// 按响应式断点归类统计
const byBreakpoint = {};
for (const c of missing) {
  const bp = c.startsWith("sm:") ? "sm:" : c.startsWith("md:") ? "md:" : c.startsWith("lg:") ? "lg:" : c.startsWith("xl:") ? "xl:" : "(base)";
  byBreakpoint[bp] = (byBreakpoint[bp] || 0) + 1;
}
console.log("缺失类名按断点:", JSON.stringify(byBreakpoint));
