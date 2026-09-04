#!/usr/bin/env node
/**
 * 端到端真机验证 v2: 点击验收台「🎤 神经童声」按钮 (真实用户路径)
 * 1. 导航验收台 → 等加载 + neural 探测
 * 2. 真实鼠标点击 #btn-neural-play (手势解锁 AudioContext)
 * 3. 等待合成+播放完成, 读页面 log + stats
 */
import http from "node:http";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const pages = await new Promise((res, rej) => {
    http.get("http://127.0.0.1:9222/json", (r) => {
      let d = ""; r.on("data", c => d += c); r.on("end", () => {
        try { res(JSON.parse(d)); } catch (e) { rej(e); }
      });
    }).on("error", rej);
  }).catch((err) => {
    console.warn(`⚠️ [neural_e2e_probe] 跳过: 无法连接到 Chrome CDP (http://127.0.0.1:9222): ${err.message}`);
    process.exit(0);
  });
  if (!pages || !Array.isArray(pages)) {
    console.warn("⚠️ [neural_e2e_probe] 跳过: 未检测到可用的 Chrome CDP 页面目标");
    process.exit(0);
  }
  const page = pages.find(p => p.type === "page" && p.webSocketDebuggerUrl);
  if (!page) {
    console.warn("⚠️ [neural_e2e_probe] 跳过: 未找到包含 WebSocket 调试器的活动页面");
    process.exit(0);
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let idSeq = 1;
  const pending = new Map();
  const send = (method, params = {}) => new Promise((res) => {
    const id = idSeq++;
    pending.set(id, res);
    ws.send(JSON.stringify({ id, method, params }));
  });
  ws.on("message", raw => {
    const m = JSON.parse(raw.toString());
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  });
  await new Promise(r => ws.once("open", r));
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Page.navigate", { url: "http://localhost:8765/_audio_ac_runner.html?e2e=" + Date.now() });
  await sleep(6000); // 等模块加载 + 自动 AC 跑一轮 + neural probe

  // 找 #btn-neural-play 的 box model
  const doc = await send("DOM.getDocument", { depth: -1 });
  const rootId = doc.result && doc.result.root ? doc.result.root.nodeId : 0;
  const btn = await send("DOM.querySelector", { nodeId: rootId, selector: "#btn-neural-play" });
  const btnId = (btn.result && btn.result.nodeId) || 0;
  let clicked = false;
  if (btnId) {
    const boxResp = await send("DOM.getBoxModel", { nodeId: btnId }).catch(() => null);
    const model = boxResp && boxResp.result && boxResp.result.model;
    if (model) {
      const [x1, y1, , , x2, y2] = model.border || model.content;
      const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
      await send("Input.dispatchMouseEvent", { type: "mousePressed", x: cx, y: cy, button: "left", clickCount: 1 });
      await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: cx, y: cy, button: "left", clickCount: 1 });
      clicked = true;
      console.log(`🖱️ 已真实点击 🎤神经童声 按钮 @ (${cx.toFixed(0)}, ${cy.toFixed(0)})`);
    }
  }
  if (!clicked) { console.error("❌ 找不到/无法点击 #btn-neural-play"); process.exit(1); }

  // 等播放完成 (最多 25s)
  for (let i = 0; i < 12; i++) {
    await sleep(2000);
    const r = await send("Runtime.evaluate", {
      expression: `(window.__neuralVoice ? window.__neuralVoice.stats.plays : -1) + "|" +
        (document.getElementById("btn-neural-play").textContent)`,
      returnByValue: true,
    });
    const v = r.result && r.result.result && r.result.result.value;
    console.log(`  [${(i + 1) * 2}s] plays=${String(v).split("|")[0]} btn="${String(v).split("|")[1]}"`);
    if (v && v.startsWith("1") && String(v).includes("神经童声") && !String(v).includes("合成")) break;
  }

  // 读取最终状态 (含长句 batch 路径验证: 输入框填长句 → 再点一次)
  const r3 = await send("Runtime.evaluate", {
    expression: `(async () => {
      try {
        const inp = document.getElementById("neural-text");
        inp.value = "小朋友们好，今天我们来学习汉字。大字的写法是横撇捺。小朋友们加油哦！";
        inp.dispatchEvent(new Event("input", { bubbles: true }));
        return { filled: true };
      } catch (e) { return { filled: false, e: String(e) }; }
    })()`,
    awaitPromise: true, returnByValue: true,
  }).catch(() => null);

  // 再点一次按钮 (长句 → 应走 batch 并行路径)
  if (btnId) {
    const boxResp = await send("DOM.getBoxModel", { nodeId: btnId }).catch(() => null);
    const model = boxResp && boxResp.result && boxResp.result.model;
    if (model) {
      const [x1, y1, , , x2, y2] = model.border || model.content;
      const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
      await send("Input.dispatchMouseEvent", { type: "mousePressed", x: cx, y: cy, button: "left", clickCount: 1 });
      await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: cx, y: cy, button: "left", clickCount: 1 });
      console.log("🖱️ 二次点击 (长句 → batch 并行路径)");
    }
  }
  for (let i = 0; i < 12; i++) {
    await sleep(2000);
    const r = await send("Runtime.evaluate", {
      expression: `(window.__neuralVoice ? (window.__neuralVoice.stats.batchPlays || 0) + "/" + window.__neuralVoice.stats.plays : "-1/-1") + "|" + document.getElementById("btn-neural-play").textContent`,
      returnByValue: true,
    });
    const v = r.result && r.result.result && r.result.result.value;
    console.log(`  [${(i + 1) * 2}s] batch/total=${String(v).split("|")[0]} btn="${String(v).split("|")[1]}"`);
    if (v && !String(v).includes("合成") && !String(v).endsWith("…")) break;
  }

  const r2 = await send("Runtime.evaluate", {
    expression: `(function () {
      const nv = window.__neuralVoice;
      const statusEl = document.getElementById("neural-status");
      const logEl = document.getElementById("log");
      return {
        plays: nv ? nv.stats.plays : -1,
        batchPlays: nv ? (nv.stats.batchPlays || 0) : -1,
        cacheHits: nv ? nv.stats.cacheHits : -1,
        netFetch: nv ? nv.stats.netFetch : -1,
        fallbacks: nv ? nv.stats.fallbacks : -1,
        neuralStatus: statusEl ? statusEl.textContent.trim() : "",
        logHead: logEl ? logEl.textContent.split("\\n").slice(0, 4).join(" ⏎ ") : "",
      };
    })()`,
    returnByValue: true,
  });
  console.log("\n========== 端到端结果 ==========");
  console.log(JSON.stringify(r2.result && r2.result.result && r2.result.result.value, null, 2));

  const v = (r2.result && r2.result.result && r2.result.result.value) || {};
  const ok = v.plays >= 2 && v.batchPlays >= 1 && v.fallbacks === 0;
  console.log(ok ? "\n✅ 神经童声端到端真实发声成功!" : "\n❌ 未确认发声");
  ws.close();
  process.exit(ok ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
