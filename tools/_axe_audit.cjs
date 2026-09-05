/* axe-core 无障碍审计：加载页面 → 注入 axe → 输出违规清单
 * 用法：node tools/_axe_audit.cjs [url]
 *   默认 http://127.0.0.1:8099/（可先 node server.js 起服务）
 * 依赖：playwright 库（NODE_PATH 指向 workspace/node_modules）+ /tmp/axe.min.js
 *   curl -sL https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js -o /tmp/axe.min.js
 * 经验：channel:'chrome' 用系统 Chrome；bypassCSP 绕过 nonce CSP 才能注入 axe。
 */
const { chromium } = require("playwright");
const TARGET = process.argv[2] || "http://127.0.0.1:8099/";

(async () => {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--no-proxy-server", "--no-sandbox", "--disable-gpu"],
  });
  const context = await browser.newContext({ bypassCSP: true, viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(TARGET, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2500); // 等待 SPA 异步渲染
  await page.addScriptTag({ path: "/tmp/axe.min.js" });
  const violations = await page.evaluate(async () => {
    const r = await axe.run(document, { resultTypes: ["violations"] });
    return r.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      count: v.nodes.length,
      sample: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
    }));
  });
  console.log(JSON.stringify({ url: "http://127.0.0.1:8899/", total: violations.reduce((a, v) => a + v.count, 0), violations }, null, 1));
  await browser.close();
})().catch((e) => { console.error("AUDIT_FAIL:", e.message); process.exit(1); });
