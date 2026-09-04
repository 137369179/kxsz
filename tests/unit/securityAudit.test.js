// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { escapeHtml } from "../../src/utils/BaseModule.js";
import {
  storageManager,
  sanitizeProfileName,
  sanitizeProfileId,
  deepSanitizeObject
} from "../../src/utils/storageManager.js";

describe("全栈安全漏洞防御与数据完整性校验 (Security Audit & Remediation)", () => {
  beforeEach(() => {
    storageManager.clearAllCathyKeys();
    storageManager.removeItem("CATHY_PROFILES_LIST");
    storageManager.removeItem("CATHY_ACTIVE_PROFILE_ID");
  });

  describe("1. XSS 防护与 HTML 实体转义", () => {
    it("应正确转义常见 XSS 攻击向量中的 HTML 特殊符号", () => {
      const malicious = '<script>alert("XSS")</script>&foo=\'bar\'';
      const safe = escapeHtml(malicious);
      expect(safe).not.toContain("<script>");
      expect(safe).toContain("&lt;script&gt;");
      expect(safe).toContain("&quot;XSS&quot;");
      expect(safe).toContain("&amp;foo=");
      expect(safe).toContain("&#39;bar&#39;");
    });

    it("空值或 undefined 应安全处理为空字符串", () => {
      expect(escapeHtml(null)).toBe("");
      expect(escapeHtml(undefined)).toBe("");
      expect(escapeHtml(123)).toBe("123");
    });
  });

  describe("2. 用户输入清洗与边界控制 (Input Sanitization)", () => {
    it("sanitizeProfileName 应剔除 HTML 标签与控制字符，并截断超长内容", () => {
      const dirty = '<img src=x onerror=alert(1)> 超长名字测试超过二十个字后面必须被截断处理';
      const clean = sanitizeProfileName(dirty);
      expect(clean).not.toContain("<img");
      expect(clean).not.toContain("onerror");
      expect(clean.length).toBeLessThanOrEqual(20);
    });

    it("空输入应回退默认小名", () => {
      expect(sanitizeProfileName("   ")).toBe("宝宝");
      expect(sanitizeProfileName(null)).toBe("宝宝");
      expect(sanitizeProfileName(undefined)).toBe("宝宝");
    });

    it("sanitizeProfileId 应仅保留合法字符", () => {
      expect(sanitizeProfileId("child_1")).toBe("child_1");
      expect(sanitizeProfileId("child_1'; DROP TABLE--")).toBe("child_1DROPTABLE--");
      expect(sanitizeProfileId("", "fallback")).toBe("fallback");
    });
  });

  describe("3. 原型链污染防范 (Prototype Pollution Guard)", () => {
    it("deepSanitizeObject 应彻底剥离 __proto__, constructor, prototype 等危险键", () => {
      const maliciousPayload = JSON.parse('{"__proto__": {"isAdmin": true}, "constructor": "evil", "profile": {"name": "test", "__proto__": {"pwned": 1}}}');
      const sanitized = deepSanitizeObject(maliciousPayload);

      expect(Object.getPrototypeOf(sanitized)).toBeNull();
      expect(sanitized.isAdmin).toBeUndefined();
      expect(Object.prototype).not.toHaveProperty("isAdmin");
      expect(Object.prototype).not.toHaveProperty("pwned");
      expect(sanitized.constructor).toBeUndefined();
      expect(sanitized.profile.name).toBe("test");
    });

    it("嵌套数组与对象应被递归深层清洗", () => {
      const nested = {
        list: [
          { name: "ok" },
          JSON.parse('{"__proto__": {"polluted": true}, "val": 123}')
        ]
      };
      const clean = deepSanitizeObject(nested);
      expect(clean.list[1].val).toBe(123);
      expect(Object.prototype).not.toHaveProperty("polluted");
    });
  });

  describe("4. StorageManager 安全集成", () => {
    it("renameProfile 自动清洗恶意 HTML 载荷", () => {
      const ok = storageManager.renameProfile("child_1", "<script>alert(1)</script>可爱的宝宝");
      expect(ok).toBe(true);
      const profiles = storageManager.listProfiles();
      const p1 = profiles.find((p) => p.id === "child_1");
      expect(p1.name).not.toContain("<script>");
      expect(p1.name).toBe("可爱的宝宝");
    });

    it("importProgressJSON 拒绝超大恶意体积数据 (>5MB)", () => {
      const hugeData = "a".repeat(6 * 1024 * 1024);
      const res = storageManager.importProgressJSON(hugeData);
      expect(res).toBe(false);
    });

    it("importProgressJSON 成功清洗恶意导入数据中的原型链注入", () => {
      const maliciousJSON = JSON.stringify({
        __proto__: { backdoor: true },
        activeProfileId: "child_1",
        profiles: [{ id: "child_1", name: "<script>alert(1)</script>测试宝" }],
        progress: { coins: 999 }
      });
      const ok = storageManager.importProgressJSON(maliciousJSON);
      expect(ok).toBe(true);
      expect(Object.prototype).not.toHaveProperty("backdoor");
      const profiles = storageManager.listProfiles();
      expect(profiles[0].name).toBe("测试宝");
    });
  });

  describe("5. SharedShell Toast DOM XSS 防护", () => {
    it("showGameToast 必须使用 textContent 纯文本渲染，不执行 HTML 注入", async () => {
      const { showGameToast } = await import("../../src/components/SharedShell.js");
      const container = document.createElement("div");
      document.body.appendChild(container);

      const xssPayload = '<img src=x onerror="window.__toast_xss=1" />攻击测试';
      showGameToast(container, xssPayload, "success");

      const toast = container.querySelector(".pointer-events-none");
      expect(toast).toBeTruthy();
      expect(toast.innerHTML).not.toContain("<img");
      expect(toast.textContent).toBe(xssPayload);
      expect(window.__toast_xss).toBeUndefined();

      container.remove();
    });
  });

  describe("6. Worksheet 字帖打印标题转义", () => {
    it("buildWorksheetFullHTML 应对字帖标题进行安全实体转义", async () => {
      const { buildWorksheetFullHTML } = await import("../../src/utils/worksheetGenerator.js");
      const html = buildWorksheetFullHTML([], '<script>alert("pwned")</script>练字帖');
      expect(html).not.toContain('<script>alert("pwned")</script>');
      expect(html).toContain('&lt;script&gt;alert(&quot;pwned&quot;)&lt;/script&gt;');
    });
  });

  describe("7. 本地服务 CORS 来源校验 (isAllowedOrigin)", () => {
    it("仅允许本地回环地址与浏览器插件，拦截外部公网跨域", async () => {
      const { isAllowedOrigin } = await import("../../tools/_cors_guard.mjs");
      expect(isAllowedOrigin("http://localhost:5173")).toBe(true);
      expect(isAllowedOrigin("http://127.0.0.1:8901")).toBe(true);
      expect(isAllowedOrigin("http://0.0.0.0:8080")).toBe(true);
      expect(isAllowedOrigin("chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold")).toBe(true);
      expect(isAllowedOrigin(null)).toBe(true);
      expect(isAllowedOrigin(undefined)).toBe(true);

      // 必须拦截公网恶意域名跨域
      expect(isAllowedOrigin("https://evil.com")).toBe(false);
      expect(isAllowedOrigin("http://attacker.xyz:8766")).toBe(false);
      expect(isAllowedOrigin("https://malicious-site.cn")).toBe(false);
    });

    it("支持通过 ALLOWED_ORIGINS 环境变量配置生产自定义域名白名单", async () => {
      const { isAllowedOrigin } = await import("../../tools/_cors_guard.mjs");
      const origEnv = process.env.ALLOWED_ORIGINS;
      try {
        process.env.ALLOWED_ORIGINS = "https://cathy.example.com,https://app.literacy.cn";
        expect(isAllowedOrigin("https://cathy.example.com")).toBe(true);
        expect(isAllowedOrigin("https://app.literacy.cn")).toBe(true);
        expect(isAllowedOrigin("https://evil.com")).toBe(false);
      } finally {
        process.env.ALLOWED_ORIGINS = origEnv;
      }
    });
  });
});

