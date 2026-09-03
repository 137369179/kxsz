/**
 * 生成全流程运行时压测探针页 _flow_probe.html
 * 在 index.html 基础上注入：
 *   1) 早期错误捕获（console.error / console.warn / window.onerror / unhandledrejection）
 *   2) 晚期模式遍历脚本：逐个 switchMode 并在每个模式捕获异常与渲染状态
 * 结果写入 <pre id="__probe_result"> 供 --dump-dom 提取
 */
import { readFileSync, writeFileSync } from "fs";

const src = readFileSync("index.html", "utf8");

const earlyHook = `
<script>
  window.__ERRS = [];
  window.__origErr = console.error.bind(console);
  window.__origWarn = console.warn.bind(console);
  console.error = function (...a) { window.__ERRS.push(["error", a.map(String).join(" ")]); window.__origErr(...a); };
  console.warn = function (...a) { window.__ERRS.push(["warn", a.map(String).join(" ")]); window.__origWarn(...a); };
  window.addEventListener("error", (e) => window.__ERRS.push(["onerror", String(e.message || e.error)]));
  window.addEventListener("unhandledrejection", (e) => window.__ERRS.push(["rejection", String(e.reason)]));
</script>
`;

const probe = `
<pre id="__probe_result" style="position:fixed;left:-9999px;top:0;">PENDING</pre>
<script type="module">
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const out = { modes: [], learn: null, errors: [], globalErrors: [] };

  function waitForApp() {
    return new Promise(async (resolve) => {
      for (let i = 0; i < 200; i++) {
        if (window.cathyApp && window.cathyApp.mapModule) return resolve(true);
        await sleep(50);
      }
      resolve(false);
    });
  }

  const MODES = ["map", "books", "play", "arcade", "cards", "parent", "reward", "review", "pk", "pinyin", "treehouse", "idiom", "poem", "family"];

  (async () => {
    const ok = await waitForApp();
    out.appReady = ok;
    if (!ok) {
      document.getElementById("__probe_result").textContent = JSON.stringify(out);
      return;
    }
    const app = window.cathyApp;
    const viewport = document.getElementById("game-app-viewport");

    for (const m of MODES) {
      const before = window.__ERRS.length;
      let crashed = null;
      let htmlLen = 0;
      try {
        app.switchMode(m);
        await sleep(160);
        htmlLen = (viewport.innerHTML || "").length;
      } catch (e) {
        crashed = String(e && e.message || e);
      }
      const newErrs = window.__ERRS.slice(before).map((x) => x[0] + ": " + x[1].slice(0, 160));
      out.modes.push({ mode: m, crashed, htmlLen, errors: newErrs });
    }

    // 学习五步流压测（多字抽样，覆盖三大阶段的自动扩字）
    try {
      const dbMod = await import("./src/data/characters.js");
      const db = dbMod.CHARACTER_DATABASE;
      const pick = db.find((c) => c.stage === 1) || db[0];
      app.startLearnFlow(pick);
      await sleep(400);
      const steps = [];
      for (let s = 1; s <= 5; s++) {
        const before = window.__ERRS.length;
        let stepErr = null;
        try {
          app.learnModule.currentStep = s;
          app.learnModule.render();
          await sleep(260);
        } catch (e) {
          stepErr = String(e && e.message || e);
        }
        const newErrs = window.__ERRS.slice(before).map((x) => x[0] + ": " + x[1].slice(0, 160));
        steps.push({ step: s, stepErr, errors: newErrs, htmlLen: (viewport.innerHTML || "").length });
      }
      out.learn = { char: pick.char, steps };

      // 多字抽样：三大阶段 × 每阶段取样，完整跑五步
      const sample = [];
      for (const st of [1, 2, 3]) {
        const pool = db.filter((c) => c.stage === st);
        if (!pool.length) continue;
        const n = Math.min(4, pool.length);
        for (let i = 0; i < n; i++) sample.push(pool[Math.floor((i * pool.length) / n)]);
      }
      out.charSweep = [];
      for (const c of sample) {
        const rec = { char: c.char, stage: c.stage, id: c.id, stepErrs: [], errors: [] };
        try {
          app.startLearnFlow(c);
          await sleep(200);
          for (let s = 1; s <= 5; s++) {
            const before = window.__ERRS.length;
            try {
              app.learnModule.currentStep = s;
              app.learnModule.render();
              await sleep(180);
            } catch (e) {
              rec.stepErrs.push("step" + s + ": " + String(e && e.message || e));
            }
            const ne = window.__ERRS.slice(before).map((x) => x[0] + ": " + x[1].slice(0, 140));
            if (ne.length) rec.errors.push(...ne.map((x) => "step" + s + " " + x));
          }
        } catch (e) {
          rec.stepErrs.push("fatal: " + String(e && e.message || e));
        }
        out.charSweep.push(rec);
      }
    } catch (e) {
      out.learn = { fatal: String(e && e.message || e) };
    }

    out.globalErrors = window.__ERRS.slice(0, 40).map((x) => x[0] + ": " + x[1].slice(0, 200));
    out.totalErrors = window.__ERRS.length;
    document.getElementById("__probe_result").textContent = JSON.stringify(out, null, 1);
  })();
</script>
`;

let html = src.replace("<head>", "<head>" + earlyHook);
html = html.replace("</body>", probe + "\n</body>");
writeFileSync("_flow_probe.html", html);
console.log("已生成 _flow_probe.html");
