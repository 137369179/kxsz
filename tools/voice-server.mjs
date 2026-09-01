#!/usr/bin/env node
/**
 * 凯茜识字 · 本地神经语音代理服务 (Neural Voice Proxy Server)
 * ============================================================
 * 解决「声音像机器人」的根本方案：
 *   系统 speechSynthesis (拼接式机械音, 无法 DSP) 
 *   → 微软 Edge 神经 TTS (zh-CN-XiaoxiaoNeural 晓晓童声, 48kHz 真人级)
 *
 * 为什么需要本服务：
 *   Edge TTS WSS 端点校验 Origin (必须是 chrome-extension://...)，
 *   浏览器页面 WebSocket 无法伪造 Origin → 必须由 Node 代理。
 *
 * 能力：
 *   - GET /tts?text=&voice=&rate=&pitch=  → audio/mpeg (CORS 开放)
 *   - 磁盘缓存 tools/cache/tts/<sha1>.mp3  → 同句只合成一次, 后续 <5ms
 *   - 并发去重 (同 key 并发请求合并为一次合成)
 *   - 403 自动重算 Sec-MS-GEC 重试 (token 5min 窗口边界保护)
 *   - GET /health  → 存活/缓存统计
 *   - GET /warmup  → 批量预热高频字表 (后台并发限流)
 *
 * 用法：
 *   node tools/voice-server.mjs            # 默认 8766
 *   PORT=9000 node tools/voice-server.mjs
 */
import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CACHE_DIR = path.join(ROOT, "tools", "cache", "tts");
fs.mkdirSync(CACHE_DIR, { recursive: true });

const PORT = parseInt(process.env.PORT || "8766", 10);
const HOST = "127.0.0.1";

// ---------------- Edge TTS 常量 (对齐 edge-tts 7.2.8) ----------------
const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const CHROMIUM_FULL_VERSION = "143.0.3650.75";
const BASE_WSS =
  "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1" +
  `?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}`;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
  `Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0`;
const ORIGIN = "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold";

// 输出格式：24kHz/96kbps 单声道 mp3
// 实测(2026-09-01)：readaloud 端点仅支持 24kHz 系(48kbps/96kbps)与 webm-opus；
// 32kHz/48kHz/wav-pcm 均被拒。96kbps 较 48kbps 码率翻倍、延迟相同 → 音质免费升级。
const OUTPUT_FORMAT = "audio-24khz-96kbitrate-mono-mp3";
// 缓存版本随格式升级递增, 避免新旧格式缓存混用
const CACHE_VERSION = "v2-96k";

// ---------------- 默认音色 ----------------
// MOS 盲测冠军: 晓晓·明亮少女 (zh-CN-XiaoxiaoNeural, MOS 4.10) 取代原晓依 (3.80)
const DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural";

// ---------------- DRM: Sec-MS-GEC + MUID ----------------
// 官方算法 (edge-tts drm.py): sha256( f"{ticks:.0f}{TOKEN}" ) 大写 hex
// 注意: ticks 在前, TOKEN 在后!
function secMsGec() {
  const WIN_EPOCH = 11644473600;
  let ticks = Math.floor(Date.now() / 1000) + WIN_EPOCH;
  ticks -= ticks % 300; // 5 分钟窗口
  ticks *= 1e7; // 100ns
  return crypto
    .createHash("sha256")
    .update(`${ticks}${TRUSTED_CLIENT_TOKEN}`)
    .digest("hex")
    .toUpperCase();
}
function muid() {
  return crypto.randomBytes(16).toString("hex").toUpperCase();
}
function rid() {
  return crypto.randomUUID().replace(/-/g, "");
}

// ---------------- SSML 构造 ----------------
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function buildSSML(text, voice, rate, pitch) {
  const pros = [];
  if (rate) pros.push(`rate='${rate}'`);
  if (pitch) pros.push(`pitch='${pitch}'`);
  const pOpen = pros.length ? `<prosody ${pros.join(" ")}>` : "";
  const pClose = pros.length ? "</prosody>" : "";
  return (
    "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='zh-CN'>" +
    `<voice name='${voice}'>${pOpen}${esc(text)}${pClose}</voice></speak>`
  );
}

// ---------------- 核心: 单次合成 (WSS) ----------------
function synthesizeOnce(text, voice, rate, pitch, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(
      `${BASE_WSS}&Sec-MS-GEC=${secMsGec()}&Sec-MS-GEC-Version=1-${CHROMIUM_FULL_VERSION}&ConnectionId=${rid()}`,
      {
        headers: {
          "User-Agent": UA,
          Origin: ORIGIN,
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
          "Accept-Language": "en-US,en;q=0.9",
          Cookie: `muid=${muid()}`,
        },
        handshakeTimeout: 12000,
      }
    );
    const chunks = [];
    let settled = false;
    const finish = (fn, arg) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { ws.close(); } catch {}
      fn(arg);
    };
    const timer = setTimeout(() => finish(reject, new Error("tts-timeout")), timeoutMs);

    ws.on("open", () => {
      ws.send(
        `X-Timestamp:${new Date().toUTCString()}\r\n` +
          `Content-Type:application/json; charset=utf-8\r\n` +
          `Path:speech.config\r\n\r\n` +
          JSON.stringify({
            context: {
              synthesis: {
                audio: {
                  metadataoptions: { sentenceBoundaryEnabled: "false", wordBoundaryEnabled: "true" },
                  outputFormat: OUTPUT_FORMAT,
                },
              },
            },
          })
      );
      ws.send(
        `X-RequestId:${rid()}\r\n` +
          `Content-Type:application/ssml+xml\r\n` +
          `X-Timestamp:${new Date().toUTCString()}Z\r\n` +
          `Path:ssml\r\n\r\n` +
          buildSSML(text, voice, rate, pitch)
      );
    });
    ws.on("message", (data, isBinary) => {
      if (isBinary) {
        const hlen = data.readUInt16BE(0);
        const body = data.subarray(2 + hlen);
        if (body.length > 0) chunks.push(Buffer.from(body));
      } else if (data.toString().includes("Path:turn.end")) {
        const buf = Buffer.concat(chunks);
        if (buf.length < 200) finish(reject, new Error("tts-empty-audio"));
        else finish(resolve, buf);
      }
    });
    ws.on("error", (e) => finish(reject, e));
    ws.on("close", () => {
      if (!settled && chunks.length === 0) finish(reject, new Error("tts-closed-no-audio"));
      else if (!settled) {
        const buf = Buffer.concat(chunks);
        if (buf.length > 200) finish(resolve, buf);
      }
    });
  });
}

// 带重试的合成 (403/token 窗口边缘 → 重算 GEC 再试)
async function synthesize(text, voice, rate, pitch) {
  for (let i = 0; i < 3; i++) {
    try {
      return await synthesizeOnce(text, voice, rate, pitch);
    } catch (e) {
      const msg = String(e && e.message);
      const last = i === 2;
      if (!last && /timeout|403|closed-no-audio|socket/i.test(msg)) {
        await new Promise((r) => setTimeout(r, 350 * (i + 1)));
        continue;
      }
      throw e;
    }
  }
}

// ---------------- 缓存 + 并发去重 ----------------
const inflight = new Map(); // key -> Promise<Buffer>
const stats = { hits: 0, misses: 0, errors: 0, served: 0, started: Date.now() };

function cacheKey(text, voice, rate, pitch) {
  return crypto.createHash("sha1").update(`${CACHE_VERSION}|${voice}|${rate}|${pitch}|${text}`).digest("hex");
}

async function ttsWithCache(text, voice, rate, pitch) {
  const key = cacheKey(text, voice, rate, pitch);
  const file = path.join(CACHE_DIR, key + ".mp3");
  // 1) 磁盘
  try {
    const buf = fs.readFileSync(file);
    stats.hits++;
    return buf;
  } catch {}
  // 2) 并发去重
  if (inflight.has(key)) return inflight.get(key);
  // 3) 合成
  const p = (async () => {
    stats.misses++;
    const buf = await synthesize(text, voice, rate, pitch);
    try { fs.writeFileSync(file, buf); } catch {}
    return buf;
  })();
  inflight.set(key, p);
  try {
    return await p;
  } catch (e) {
    stats.errors++;
    inflight.delete(key); // 失败不缓存, 允许重试
    throw e;
  } finally {
    inflight.delete(key);
  }
}

// ---------------- 预热 (高频字/短语) ----------------
function defaultWarmupList() {
  // 常用识字高频字 (与 characters.js 字表交集的高频集) + 家长触发点短语
  const chars = "一二三四五六七八九十人大口日月水火山石田土上中下大小多少天上地下花鸟鱼虫云风雨雪木禾米竹马牛羊毛皮爸妈我你他好们是了不在这里有和就说的话做要子儿头心手见开门去来回坐立走跑飞红黄蓝绿黑白春天夏秋冬东南北";
  const phrases = [
    "你好呀，小朋友！", "真棒！", "再试一次好吗？", "我们一起来学汉字吧！",
    "你真聪明！", "加油哦！", "写得真好！", "今天的学习完成啦！",
    "休息一下，保护眼睛哦。", "我们复习一下吧。",
  ];
  return [...new Set([...chars])].map((c) => c).concat(phrases);
}

async function warmup(voice, items, concurrency = 4) {
  let ok = 0, fail = 0;
  const queue = [...items];
  const worker = async () => {
    while (queue.length) {
      const text = queue.shift();
      try {
        await ttsWithCache(text, voice, "+8%", "+6%");
        ok++;
      } catch { fail++; }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  return { ok, fail, total: items.length };
}

// ---------------- 长句拆分 (子句并行合成用) ----------------
/**
 * 按标点(。！？；，、)拆子句, 标点保留在子句尾部。
 * 超长无标点文本按 maxLen 硬切。返回非空子句数组。
 */
function splitSentences(text, maxLen = 24) {
  const out = [];
  let buf = "";
  const push = () => { const s = buf.trim(); if (s) out.push(s); buf = ""; };
  for (const ch of text) {
    buf += ch;
    if ("。！？；，、!?;,".includes(ch)) push();
    else if (buf.length >= maxLen) push();
  }
  push();
  return out;
}

// ---------------- HTTP 服务 ----------------
function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
}
function json(res, code, obj) {
  cors(res);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const route = u.pathname;

  if (req.method === "OPTIONS") { cors(res); res.writeHead(204); res.end(); return; }

  if (route === "/health") {
    let cachedFiles = 0;
    try { cachedFiles = fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith(".mp3")).length; } catch {}
    return json(res, 200, {
      ok: true,
      uptimeSec: Math.round((Date.now() - stats.started) / 1000),
      cache: { files: cachedFiles, hits: stats.hits, misses: stats.misses, errors: stats.errors },
      served: stats.served,
      defaultVoice: DEFAULT_VOICE,
    });
  }

  if (route === "/tts") {
    const text = (u.searchParams.get("text") || "").trim();
    const voice = u.searchParams.get("voice") || DEFAULT_VOICE;
    const rate = u.searchParams.get("rate") || "+8%";
    const pitch = u.searchParams.get("pitch") || "+6%";
    if (!text) return json(res, 400, { error: "missing text" });
    if (text.length > 600) return json(res, 400, { error: "text too long (max 600)" });
    try {
      const t0 = Date.now();
      const buf = await ttsWithCache(text, voice, rate, pitch);
      stats.served++;
      cors(res);
      res.writeHead(200, {
        "Content-Type": "audio/mpeg",
        "Content-Length": buf.length,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-TTS-Ms": Date.now() - t0,
        "X-TTS-Cached": stats.hits, // 供调试
      });
      res.end(buf);
    } catch (e) {
      return json(res, 502, { error: "tts-failed", detail: String(e && e.message) });
    }
    return;
  }

  if (route === "/tts-batch") {
    // 长句并行合成: 文本按标点拆子句, 并发合成(各子句独立走缓存/去重)
    // 响应: { ok, parts: [{text, audio: base64}], totalMs }
    // 用途: 前端把 parts 依次无缝播放, 总等待 ≈ max(子句) 而非 sum(子句)
    const text = (u.searchParams.get("text") || "").trim();
    const voice = u.searchParams.get("voice") || DEFAULT_VOICE;
    const rate = u.searchParams.get("rate") || "+8%";
    const pitch = u.searchParams.get("pitch") || "+6%";
    if (!text) return json(res, 400, { error: "missing text" });
    if (text.length > 1200) return json(res, 400, { error: "text too long (max 1200)" });
    const parts = splitSentences(text, 24);
    if (parts.length === 0) return json(res, 400, { error: "nothing to synthesize" });
    const t0 = Date.now();
    try {
      // 并发上限 4 (避免触发端点限流)
      const results = new Array(parts.length);
      let cursor = 0;
      const worker = async () => {
        while (cursor < parts.length) {
          const i = cursor++;
          try {
            const buf = await ttsWithCache(parts[i], voice, rate, pitch);
            results[i] = { text: parts[i], audio: buf.toString("base64") };
          } catch (e) {
            results[i] = { text: parts[i], error: String(e && e.message) };
          }
        }
      };
      await Promise.all(Array.from({ length: Math.min(4, parts.length) }, worker));
      stats.served++;
      const failed = results.filter((r) => r && r.error).length;
      return json(res, 200, { ok: failed === 0, parts: results, partCount: parts.length, failed, totalMs: Date.now() - t0 });
    } catch (e) {
      return json(res, 502, { error: "tts-batch-failed", detail: String(e && e.message) });
    }
  }

  if (route === "/warmup") {
    const voice = u.searchParams.get("voice") || DEFAULT_VOICE;
    const items = u.searchParams.get("items")
      ? decodeURIComponent(u.searchParams.get("items")).split("|").filter(Boolean)
      : defaultWarmupList();
    // 后台执行, 立即返回
    json(res, 202, { started: true, count: items.length, voice });
    warmup(voice, items).then((r) =>
      console.log(`[warmup] ok=${r.ok} fail=${r.fail} / ${r.total}`)
    );
    return;
  }

  return json(res, 404, { error: "not-found", routes: ["/tts", "/tts-batch", "/health", "/warmup"] });
});

server.listen(PORT, HOST, () => {
  console.log(`🎤 神经语音代理服务已启动: http://${HOST}:${PORT}`);
  console.log(`   默认音色: ${DEFAULT_VOICE} (晓晓·明亮少女, MOS 盲测冠军)`);
  console.log(`   缓存目录: ${CACHE_DIR}`);
  // 启动即后台预热高频字表 (不阻塞)
  setTimeout(() => {
    warmup(DEFAULT_VOICE, defaultWarmupList()).then((r) =>
      console.log(`[startup-warmup] ok=${r.ok} fail=${r.fail} / ${r.total}`)
    );
  }, 800);
});

process.on("SIGINT", () => { console.log("\nbye"); process.exit(0); });
process.on("SIGTERM", () => process.exit(0));
