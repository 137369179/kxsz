// Node 脚本：通过 CDP 连接 Chrome 9222，调用 page 中 window.__integrationTestSuite.runAllAC({runStress:false})
// 拿到报告保存 JSON
import WebSocket from "ws";
import http from "http";
import fs from "fs";
import path from "path";

function req(url) {
  return new Promise((res, rej) => {
    http.get(url, r => {
      let d = "";
      r.on("data", c => d += c);
      r.on("end", () => { try { res(JSON.parse(d)); } catch(e) { rej(e); } });
    }).on("error", rej);
  });
}

function send(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1e9);
    const onMsg = (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id === id) {
        ws.off("message", onMsg);
        clearTimeout(t);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    const t = setTimeout(() => { ws.off("message", onMsg); reject(new Error(method + " timeout")); }, 900000); // 15 分钟
    ws.on("message", onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalRuntime(ws, expr) {
  return send(ws, "Runtime.evaluate", {
    expression: expr,
    returnByValue: true,
    awaitPromise: true,
    timeout: 300000,
  });
}

async function main() {
  const list = await req("http://127.0.0.1:9222/json/list");
  const page = list.find(p => p.type === "page");
  if (!page) throw new Error("No page");
  console.log("Connecting page:", page.title, page.url);
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.once("open", r));
  // enable Runtime
  await send(ws, "Runtime.enable");
  console.log("Waiting AudioContext gesture (first start) + runAllAC...");
  // Need user gesture for AudioContext in Chrome 87. Simulate by clicking element first.
  // Dispatch click on document.
  try {
    await evalRuntime(ws, `(() => { const btn = document.getElementById('btn-run') || document.body; const e = new MouseEvent('click', {bubbles:true}); btn.dispatchEvent(e); return 'clicked: '+!!btn; })()`);
    await new Promise(r => setTimeout(r, 500));
  } catch(e) { console.warn("click warn:", e.message); }
  const r = await evalRuntime(ws, `(async () => { const suite = window.__integrationTestSuite; if (!suite) return {error:'no suite'}; const rep = await suite.runAllAC({ runStress: false }); return rep; })()`);
  const report = r && r.result ? r.result.value : r;
  const outDir = new URL("./.trae/specs/ihuman-audio-engine-clone/reports/", import.meta.url).pathname;
  const outPath = path.join(outDir, `browser-ac-report-${Date.now()}.json`);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log("\n=== BROWSER AC RESULT SUMMARY ===");
  console.log("Out:", outPath);
  if (report && report.summary) console.log("Summary:", JSON.stringify(report.summary, null, 2));
  if (report && report.results) for (const row of report.results) {
    console.log(`${row.ok ? "✅ PASS" : "❌ FAIL"}  ${row.ac}  ${row.name}`);
  }
  ws.close();
}
main().catch(e => { console.error(e); process.exit(1); });
