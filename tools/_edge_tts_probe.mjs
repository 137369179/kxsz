#!/usr/bin/env node
/**
 * Edge TTS (微软神经语音) 连通性验证脚本 · Node 版
 * 验证: Sec-MS-GEC token 算法 + WSS 协议 + SSML 合成 zh-CN-XiaoyiNeural
 *
 * 用法: node tools/_edge_tts_probe.mjs
 */
import WebSocket from "ws";
import crypto from "node:crypto";
import fs from "node:fs";

const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const WSS_URL =
  "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1" +
  `?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}`;

const VOICE = process.argv[2] || "zh-CN-XiaoyiNeural";
const TEXT = process.argv[3] || "你好呀，小朋友！我们一起来学汉字吧！";

// ---------- Sec-MS-GEC token (edge-tts DRM, 2023-11+) ----------
// 官方算法: sha256( f"{ticks:.0f}{TRUSTED_CLIENT_TOKEN}" ) 大写 hex
// 注意 ticks 在前、token 在后!
function secMsgGec() {
  const WIN_EPOCH = 11644473600; // 1601→1970 秒差
  let ticks = Math.floor(Date.now() / 1000) + WIN_EPOCH;
  ticks -= ticks % 300; // 向下取整到 5 分钟
  ticks *= 1e7; // 转为 100ns 单位
  const str = `${ticks}${TRUSTED_CLIENT_TOKEN}`;
  return crypto.createHash("sha256").update(str).digest("hex").toUpperCase();
}
// MUID: 随机 32 位大写 hex (edge-tts DRM 2025-12+)
function generateMuid() {
  return crypto.randomBytes(16).toString("hex").toUpperCase();
}

// ---------- WSS 消息构造 ----------
function requestId() {
  return crypto.randomUUID().replace(/-/g, "");
}
function dateToRfc1123() {
  return new Date().toUTCString().replace("GMT", "GMT");
}

const gec = secMsgGec();
const CHROMIUM_FULL_VERSION = "143.0.3650.75";
const url = `${WSS_URL}&Sec-MS-GEC=${gec}&Sec-MS-GEC-Version=1-${CHROMIUM_FULL_VERSION}&ConnectionId=${requestId()}`;
console.log("🔗 WSS URL:", url.replace(TRUSTED_CLIENT_TOKEN, "TOKEN"));
console.log("🔑 Sec-MS-GEC:", gec);

const ws = new WebSocket(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
    "Origin": "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
    "Pragma": "no-cache",
    "Cache-Control": "no-cache",
    "Accept-Language": "en-US,en;q=0.9",
    "Cookie": `muid=${generateMuid()}`,
  },
  handshakeTimeout: 15000,
});

const audioChunks = [];
let turnEnded = false;
const t0 = Date.now();

const timer = setTimeout(() => {
  console.error("❌ 25s 超时未完成");
  process.exit(1);
}, 25000);

ws.on("open", () => {
  console.log("✅ WSS 已连接 (" + (Date.now() - t0) + "ms)");
  // 1. speech.config
  ws.send(
    "X-Timestamp:" + dateToRfc1123() + "\r\n" +
    "Content-Type:application/json; charset=utf-8\r\n" +
    "Path:speech.config\r\n\r\n" +
    JSON.stringify({
      context: {
        synthesis: {
          audio: {
            metadataoptions: { sentenceBoundaryEnabled: "false", wordBoundaryEnabled: "true" },
            outputFormat: "audio-24khz-48kbitrate-mono-mp3",
          },
        },
      },
    })
  );
  // 2. SSML
  const ssml =
    "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='zh-CN'>" +
    `<voice name='${VOICE}'>` +
    `<prosody rate='+8%' pitch='+6%' volume='+0%'>` +
    TEXT +
    "</prosody></voice></speak>";
  ws.send(
    "X-RequestId:" + requestId() + "\r\n" +
    "Content-Type:application/ssml+xml\r\n" +
    "X-Timestamp:" + dateToRfc1123() + "Z\r\n" +
    "Path:ssml\r\n\r\n" + ssml
  );
  console.log("📤 SSML 已发送 · voice:", VOICE);
});

ws.on("message", (data, isBinary) => {
  if (isBinary) {
    // 二进制: 头部长度(2字节大端) + 头部 + mp3 数据
    const headerLen = data.readUInt16BE(0);
    const body = data.subarray(2 + headerLen);
    if (body.length > 0) {
      audioChunks.push(Buffer.from(body));
      process.stdout.write("\r🎵 收到音频 chunk #" + audioChunks.length + " (累计 " +
        audioChunks.reduce((s, c) => s + c.length, 0) + " bytes)");
    }
  } else {
    const msg = data.toString();
    if (msg.includes("Path:turn.end")) {
      turnEnded = true;
      const total = audioChunks.reduce((s, c) => s + c.length, 0);
      console.log("\n✅ turn.end · 总计 " + audioChunks.length + " chunks / " + total + " bytes mp3 / " + (Date.now() - t0) + "ms");
      const out = "/tmp/edge-tts-probe.mp3";
      fs.writeFileSync(out, Buffer.concat(audioChunks));
      console.log("💾 已保存:", out, total > 1000 ? "  ←✅ 神经语音可用!" : "  ←⚠️ 数据过小,可能失败");
      ws.close();
      clearTimeout(timer);
      setTimeout(() => process.exit(total > 1000 ? 0 : 1), 300);
    }
  }
});

ws.on("error", (e) => {
  console.error("❌ WSS 错误:", e.message);
  process.exit(1);
});
ws.on("close", (code, reason) => {
  if (!turnEnded) {
    console.error("❌ 连接被关闭: code=" + code, reason.toString());
    process.exit(1);
  }
});
