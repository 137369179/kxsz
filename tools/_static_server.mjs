/**
 * 极简静态文件服务器（零依赖，替代易崩的 python http.server）
 * 用法: node tools/_static_server.mjs [port] [root]
 */
import { createServer } from "http";
import { readFile, stat } from "fs/promises";
import { resolve, normalize, extname, sep } from "path";

const PORT = Number(process.argv[2] || 8901);
const ROOT = resolve(process.argv[3] || process.cwd());

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

const server = createServer(async (req, res) => {
  // 严格校验 HTTP 请求动词，防范非常规动词探测
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8", "Allow": "GET, HEAD" });
    res.end("405 Method Not Allowed");
    return;
  }

  try {
    const parsedUrl = new URL(req.url, "http://127.0.0.1");
    let reqPath = decodeURIComponent(parsedUrl.pathname);

    // 空字节截断注入防护 (%00 绕过检测)
    if (reqPath.includes("\0")) {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("400 Bad Request");
      return;
    }

    if (reqPath.endsWith("/")) reqPath += "index.html";

    // 严密路径穿越防护：确保绝对路径必须位于根目录内，杜绝 ../ 向上逃逸
    const file = resolve(ROOT, "." + normalize("/" + reqPath));
    const rootPrefix = ROOT.endsWith(sep) ? ROOT : ROOT + sep;
    if (!file.startsWith(rootPrefix) && file !== ROOT) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("403 Forbidden");
      return;
    }

    const fileStat = await stat(file);
    if (!fileStat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found: " + req.url);
      return;
    }

    const reqOrigin = req.headers.origin;
    let allowOrigin = "http://127.0.0.1";
    if (!reqOrigin || /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/.test(reqOrigin)) {
      allowOrigin = reqOrigin || "*";
    }

    const data = await readFile(file);
    res.writeHead(200, {
      "Content-Type": MIME[extname(file).toLowerCase()] || "application/octet-stream",
      "Content-Length": data.length,
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": allowOrigin,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    });
    if (req.method === "HEAD") {
      res.end();
    } else {
      res.end(data);
    }
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found: " + req.url);
  }
});

server.listen(PORT, "127.0.0.1", () => console.log(`static server on http://127.0.0.1:${PORT}`));
