import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname);
const PORT = process.env.PORT || 8099;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
};

/**
 * 将 URL 路径解析为 ROOT 内文件；越界或含穿越返回 null
 */
export function resolveSafePath(urlPath) {
  let reqPath = String(urlPath || "/").split("?")[0];
  try {
    reqPath = decodeURIComponent(reqPath);
  } catch {
    return null;
  }
  if (reqPath === "/") reqPath = "/index.html";

  // P0-安全加固：显式拒绝穿越与空字节（放在 normalize 之前）
  if (reqPath.includes("\0") || reqPath.includes("..")) return null;

  let rel = path.normalize(reqPath);
  if (path.isAbsolute(rel)) {
    rel = rel.replace(/^[/\\]+/, "");
  }
  rel = rel.replace(/^[/\\]+/, "");

  // normalize 后二次检查
  if (!rel || rel.split(/[/\\]/).includes("..")) return null;

  const filePath = path.resolve(ROOT, rel);
  // P0-安全加固：ROOT 必须是绝对路径
  const rootWithSep = ROOT.endsWith(path.sep) ? ROOT : ROOT + path.sep;
  // 最终边界验证：filePath 必须在 ROOT 内部
  if (filePath !== ROOT && !filePath.startsWith(rootWithSep)) return null;
  // 额外安全：不能包含任何 segment === ".."（双重保险）
  const segs = rel.split(/[/\\]/).filter(Boolean);
  if (segs.some(s => s === "..")) return null;
  return filePath;
}

export { ROOT };

/**
 * 生成 per-request CSP nonce（128-bit base64），用于给内联 <script> 打标，
 * 配合 HTTP 层 CSP 移除 script-src 的 'unsafe-inline'。所有内联事件处理器属性
 * （原 `<img onerror>` 兜底等）已重构为 data-fallback + 全局捕获监听，故严格 CSP 不会破坏功能。
 */
function makeNonce() {
  return crypto.randomBytes(16).toString("base64");
}

/**
 * 构建 HTTP 响应层 CSP。与 index.html 的 meta CSP 形成双层防御：
 * 当本服务器提供响应时，HTTP 头 CSP 作为权威层生效（浏览器忽略 meta CSP），
 * script-src 使用 nonce 而非 'unsafe-inline'，收敛 XSS 面；并补齐 frame-ancestors（点击劫持防护）。
 */
function buildCsp(nonce) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "media-src 'self' data: blob: http://127.0.0.1:8766 http://localhost:8766",
    "connect-src 'self' http://127.0.0.1:8766 http://localhost:8766 ws://127.0.0.1:8766 ws://localhost:8766",
    "worker-src 'self' blob:",
    "frame-src 'self' data: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join("; ");
}

/**
 * 给 HTML 中所有**无 src 的内联 <script>** 注入 nonce 属性。
 * 带 src 的外部脚本由 'self' 覆盖，无需 nonce；已含 nonce 的不重复注入。
 */
function injectNonceToInlineScripts(html, nonce) {
  return html.replace(/<script\b([^>]*)>/gi, (full, attrs) => {
    if (/\bsrc\s*=/.test(attrs)) return full; // 外部脚本
    if (/\bnonce\s*=/.test(attrs)) return full; // 已含 nonce
    return `<script${attrs} nonce="${nonce}">`;
  });
}

const BASE_SECURITY_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-cache",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};

const server = http.createServer((req, res) => {
  const filePath = resolveSafePath(req.url);
  if (!filePath) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const headers = {
      ...BASE_SECURITY_HEADERS,
      "Content-Type": contentType,
    };

    // HTTPS 场景下强制 HSTS（本地 http 部署下 req.socket.encrypted 为 false，自动跳过）
    if (req.socket.encrypted) {
      headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains";
    }

    if (contentType.startsWith("text/html")) {
      const nonce = makeNonce();
      headers["Content-Security-Policy"] = buildCsp(nonce);
      fs.readFile(filePath, (readErr, data) => {
        if (readErr) {
          res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("500 Internal Server Error");
          return;
        }
        const body = injectNonceToInlineScripts(data.toString("utf8"), nonce);
        res.writeHead(200, headers);
        res.end(body);
      });
      return;
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
});

// 仅在直接启动时监听（测试 import 不占端口）
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Cathy Literacy running at http://localhost:${PORT}/`);
  });
}
