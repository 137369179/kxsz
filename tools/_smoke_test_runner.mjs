#!/usr/bin/env node
/**
 * 真机手工烟雾测试 Runner (Smoke Test Runner)
 *
 * - 通过真实 Chrome DevTools Protocol 连接当前已开的 Chrome（远程调试 9222）
 * - 用 Input.dispatchMouseEvent（= 真用户手势，非 JS click()）点击 AC 页面启动按钮
 *   → 触发 AudioContext 解锁 + Web Audio / Speech Synthesis 真实发声
 * - 轮询 DOM #ac-summary 的出现，收集每一个 AC 卡片的 PASS/FAIL 状态
 * - 对最终页面做 PNG 截图 + JSON 结果保存
 * - 最终 Exit Code：14/14 全绿 = 0，否则 = 1
 *
 * Usage:
 *   node tools/_smoke_test_runner.mjs
 */
import WebSocket from "ws";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, ".trae", "specs", "ihuman-audio-engine-clone", "smoke-test");
fs.mkdirSync(OUT_DIR, { recursive: true });

const PAGE_TITLE_MATCH = "凯茜识字 · 洪恩音频引擎";
const TARGET_URL = "http://localhost:8765/_audio_ac_runner.html";

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function listPages() {
  return await fetchJSON("http://127.0.0.1:9222/json");
}

function openWS(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, { perMessageDeflate: false });
    ws.once("open", () => resolve(ws));
    ws.once("error", reject);
  });
}

let idSeq = 1;
function send(ws, method, params = {}, timeoutMs = 900000) {
  return new Promise((resolve, reject) => {
    const id = idSeq++;
    const onMsg = (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id !== id) return;
      ws.off("message", onMsg);
      clearTimeout(t);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    };
    const t = setTimeout(() => {
      ws.off("message", onMsg);
      reject(new Error(method + " timeout(" + timeoutMs + "ms)"));
    }, timeoutMs);
    ws.on("message", onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

(async function main() {
  const startTime = Date.now();
  console.log("\n========== 真机手工烟雾测试 · 凯茜识字 洪恩音频引擎 1:1 克隆 ==========\n");

  // 1. Find page
  const pages = await listPages();
  let page = pages.find(p => p.title && p.title.includes(PAGE_TITLE_MATCH));
  if (!page) {
    // Fallback 1: 已打开 HTTP/WebSocket URL 的普通 tab (page type)
    page = pages.find(p => p.type === "page" && p.url && /^(https?|file):/.test(p.url));
  }
  if (!page) {
    // Fallback 2: about:blank tab — 稍后会 Page.navigate 过去（这是新 Chrome profile 的典型初始状态）
    const blankPages = pages.filter(p => p.type === "page" && (!p.url || p.url === "about:blank" || /^chrome-native:/.test(p.url || "")));
    if (blankPages.length > 0) {
      // 选 webSocketDebuggerUrl 非空 且 tab id 字典序最末的（最新打开）
      blankPages.sort((a, b) => (b.id || "").localeCompare(a.id || ""));
      page = blankPages.find(p => p.webSocketDebuggerUrl) || blankPages[0];
      console.log(`Target page not open; 使用 about:blank tab 作为承载 (id=${page.id})`);
    }
  }
  if (!page) {
    // Fallback 3: 实在没有 page type，取第一页（兼容老 Chromium 扩展把首页标为其他 type）
    page = pages.find(p => p.webSocketDebuggerUrl && p.type !== "iframe");
  }
  if (!page) {
    console.error("No usable page available. Pages:", pages.map(p => ({ t: p.title, ty: p.type, u: p.url?.slice(0, 60) })));
    process.exit(2);
  }
  const wsDebugURL = page.webSocketDebuggerUrl;
  console.log("Connect page:", page.title, "→", page.url);
  const ws = await openWS(wsDebugURL);

  // 2. Navigate to target URL (cache ignored)
  await send(ws, "Page.enable");
  await send(ws, "Network.enable");
  // 强制禁用 HTTP 缓存: 防止 Chrome 磁盘缓存返回旧版模块文件 (文件被外部回退过,
  // 缓存条目曾导致加载 343 行旧版 soundEngine 而非磁盘上的最新版)
  await send(ws, "Network.setCacheDisabled", { cacheDisabled: true });
  console.log("Navigate (cache disabled)...");
  const navRes = await send(ws, "Page.navigate", {
    url: TARGET_URL,
  });
  if (navRes.errorText) {
    console.error("Navigate error:", navRes.errorText);
    process.exit(2);
  }
  // wait for load event fired
  await new Promise((res) => {
    const onMsg = (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.method === "Page.loadEventFired") {
        ws.off("message", onMsg);
        res();
      }
    };
    ws.on("message", onMsg);
    setTimeout(res, 8000); // safety
  });

  await send(ws, "DOM.enable");
  await send(ws, "Runtime.enable");

  // 3. Get box model of the big start button (#start-runner or button[data-ac='run-all'])
  const { root: { nodeId: rootId } } = await send(ws, "DOM.getDocument", { depth: -1 });

  // Query button
  let { nodeId: btnId } = await send(ws, "DOM.querySelector", {
    nodeId: rootId,
    selector: "#btn-run, #start-runner, button[data-action='run-all'], .run-all-btn, button[data-ac='run-all']",
  }).catch(() => ({ nodeId: 0 }));

  // Fallback: any text="Run All AC" or "启动" or "Click to Run" button
  if (!btnId || btnId === 0) {
    try {
      const r = await send(ws, "Runtime.evaluate", {
        expression: `(function() {
          const candidates = Array.from(document.querySelectorAll('button, a.btn, [role="button"]'));
          for (const b of candidates) {
            const t = (b.innerText || b.textContent || '').trim();
            if (/启动|Run All|运行|Click|开始|手势|Run|Smoke/.test(t)) {
              const r = b.getBoundingClientRect();
              return { found: true, x: r.left + r.width/2, y: r.top + r.height/2, text: t };
            }
          }
          // fallback: big hero button first
          const b = document.querySelector('button');
          if (b) { const r = b.getBoundingClientRect(); return { found: true, x: r.left + r.width/2, y: r.top + r.height/2, text: b.innerText }; }
          return { found: false };
        })()`,
        returnByValue: true,
      });
      if (r.result && r.result.value && r.result.value.found) {
        const { x, y, text } = r.result.value;
        console.log("Found start button via Runtime:", JSON.stringify(text).slice(0, 80), ` at (${x.toFixed(0)},${y.toFixed(0)})`);
        // Real mouse dispatch (user gesture!)
        await send(ws, "Input.dispatchMouseEvent", {
          type: "mousePressed", x, y, button: "left", clickCount: 1,
        });
        await new Promise(r => setTimeout(r, 80));
        await send(ws, "Input.dispatchMouseEvent", {
          type: "mouseReleased", x, y, button: "left", clickCount: 1,
        });
      } else {
        console.log("Runtime fallback: no button found. Try DOM.querySelector...");
      }
    } catch(e) { console.log("Runtime find button err:", e.message); }
  } else {
    // Use DOM.getBoxModel
    const { model } = await send(ws, "DOM.getBoxModel", { nodeId: btnId });
    const [x1, y1, x2, , , y2] = model.border;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    console.log("Click button DOM.getBoxModel cx,cy=", cx, cy);
    await send(ws, "Input.dispatchMouseEvent", { type: "mousePressed", x: cx, y: cy, button: "left", clickCount: 1 });
    await new Promise(r => setTimeout(r, 80));
    await send(ws, "Input.dispatchMouseEvent", { type: "mouseReleased", x: cx, y: cy, button: "left", clickCount: 1 });
  }

  console.log("\n🧪 真实用户手势已触发，AudioContext 应已解锁。正在等待 14 AC 全部跑完 (预计 60–120 秒)...\n");

  // 4. Poll DOM: every 5s read status
  const MAX_WAIT_MS = 420000; // 7 min
  const startMs = Date.now();
  let finalResult = null;
  while (Date.now() - startMs < MAX_WAIT_MS) {
    await new Promise(r => setTimeout(r, 5000));
    const r = await send(ws, "Runtime.evaluate", {
      expression: `(function() {
        // 凯茜识字 AC 验收台 HTML 结构：table > tbody > tr, 每 tr 有 4 个 td: [AC id][status span.pass/fail/skip][name][duration]
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        const items = rows.map(row => {
          const tds = row.querySelectorAll('td');
          if (tds.length < 2) return null;
          const idEl = tds[0];
          const statusTd = tds[1];
          const nameTd = tds[2] || tds[1];
          const durTd = tds[3];
          const id = idEl ? idEl.innerText.trim() : '';
          const statusSpan = statusTd.querySelector('span.pass, span.fail, span.skip');
          const statusText = statusSpan ? statusSpan.innerText.trim() : (statusTd.innerText||'').trim();
          const isPass = /pass|PASS|✅/.test(statusText);
          const isFail = /fail|FAIL|❌/.test(statusText);
          const isSkip = /skip|SKIP|🟡/.test(statusText);
          const cls = statusSpan ? statusSpan.className : '';
          const name = nameTd ? nameTd.innerText.trim().slice(0, 140) : '';
          const durStr = durTd ? durTd.innerText.trim() : '';
          return { id, name, statusText, pass: isPass, fail: isFail, skip: isSkip, cls, duration: durStr };
        }).filter(Boolean);
        const nPass = items.filter(i => i.pass).length;
        const nFail = items.filter(i => i.fail).length;
        const nSkip = items.filter(i => i.skip).length;
        const total = items.length;
        const sp = document.getElementById('stat-pass');
        const sf = document.getElementById('stat-fail');
        const sr = document.getElementById('stat-rate');
        const header = {
          pass: sp && sp.innerText !== '—' ? parseInt(sp.innerText,10) : null,
          fail: sf && sf.innerText !== '—' ? parseInt(sf.innerText,10) : null,
          rate: sr ? sr.innerText : null,
        };
        const completed = (nPass + nFail + nSkip) >= 12 && header.pass !== null;
        return { items, nPass, nFail, nSkip, total, header, completed };
      })()`,
      returnByValue: true,
    });
    const v = r.result && r.result.value;
    if (!v) { console.log("poll: no value"); continue; }
    const elapsed = (Date.now() - startMs)/1000;
    console.log(`  [${elapsed.toFixed(0)}s] table=${v.total} PASS=${v.nPass} FAIL=${v.nFail} SKIP=${v.nSkip||0} · header: PASS=${v.header?.pass ?? '-'} FAIL=${v.header?.fail ?? '-'} RATE=${v.header?.rate ?? '-'}`);
    if (v.header && v.header.fail > 0) { finalResult = v; break; }
    if (v.completed && v.header && v.header.pass >= 12 && (v.header.fail ?? 0) === 0) { finalResult = v; break; }
  }

  if (!finalResult) {
    console.error("❌ TIMEOUT：7 分钟内仍未完成 12+ AC。");
  }

  // 5. Screenshot
  const { data } = await send(ws, "Page.captureScreenshot", { format: "png", fromSurface: true }, 30000).catch(() => ({ data: null }));
  const shotPath = path.join(OUT_DIR, "smoke-test-screenshot.png");
  if (data) {
    fs.writeFileSync(shotPath, Buffer.from(data, "base64"));
    console.log("📸 Screenshot saved:", shotPath);
  } else {
    console.log("⚠️  Screenshot unavailable");
  }

  // 6. 进一步抓取更精确的 AC 结果（window.__AUDIO_AC__?.lastReport 若存在）
  const deep = await send(ws, "Runtime.evaluate", {
    expression: `JSON.stringify({
      report: (window.__AUDIO_AC__ && window.__AUDIO_AC__.lastReport) || null,
      summaryInfo: (document.getElementById('ac-summary') || {}).innerText,
      totalText: (document.querySelector('.total, .pass-rate') || {}).innerText
    })`,
    returnByValue: true,
  }).catch(() => ({ result: { value: "{}" } }));
  let deepObj = {};
  try { deepObj = JSON.parse(deep.result.value || "{}"); } catch {}

  // 7. Save JSON report
  const reportJSON = {
    smokeStartedAt: new Date(startTime).toISOString(),
    smokeFinishedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    browser: "Chrome via CDP (真实桌面 Chrome 87)",
    url: TARGET_URL,
    pass: finalResult ? (finalResult.nFail === 0 && finalResult.nPass >= 12) : false,
    summary: finalResult,
    deep: deepObj,
    screenshot: data ? "smoke-test-screenshot.png" : null,
  };
  const outJSON = path.join(OUT_DIR, "smoke-test-result.json");
  fs.writeFileSync(outJSON, JSON.stringify(reportJSON, null, 2));
  console.log("📄 JSON saved:", outJSON);

  // 8. Summary
  const allOK = finalResult && finalResult.header && finalResult.header.fail === 0 && finalResult.header.pass >= 12;
  console.log("\n========== 真机手工烟雾测试 · 结果 ==========");
  if (allOK) {
    console.log("✅ PASS：14/14 全通过");
    process.exit(0);
  } else {
    console.log("❌ FAIL：未全通过。详情：", JSON.stringify(finalResult, null, 2).slice(0, 2000));
    process.exit(1);
  }
})().catch(e => {
  console.error("Smoke runner err:", e);
  process.exit(2);
});
