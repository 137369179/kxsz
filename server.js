import http from "node:http";
import fs from "node:fs";
import path from "node:path";
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

    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    });

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
