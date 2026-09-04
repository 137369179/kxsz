/**
 * 本地服务 CORS 来源安全白名单校验器
 * 仅放行本地回环来源 (localhost / 127.0.0.1 / 0.0.0.0) 以及扩展插件
 * 彻底拦截来自公网第三方网站的未授权跨域访问与本地端口扫描
 */
export function isAllowedOrigin(origin) {
  if (!origin) return true; // CLI、curl 或本地同源直接请求
  try {
    const u = new URL(origin);
    const host = u.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      u.protocol === "chrome-extension:"
    ) {
      return true;
    }
    const custom = (typeof process !== "undefined" && process.env && process.env.ALLOWED_ORIGINS) || "";
    if (custom) {
      const allowedList = custom.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      return allowedList.includes(u.origin.toLowerCase()) || allowedList.includes(host);
    }
    return false;
  } catch {
    return false;
  }
}
