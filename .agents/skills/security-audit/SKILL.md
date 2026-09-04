---
name: security-audit
description: >-
  Comprehensive security audit and vulnerability remediation skill for Cathy Literacy.
  Use when detecting or fixing security vulnerabilities, auditing XSS, SSML/XML injection,
  path traversal in local servers, prototype pollution in storage imports, memory DoS attacks,
  or verifying child data privacy and Content Security Policy (CSP).
---

# 凯茜识字全链路安全漏洞审计与修复技能 (Security Audit & Remediation)

本技能为《凯茜识字》量身定制，专职负责全栈代码安全审计、漏洞挖掘、攻击面分析与防御加固。

---

## 1. 核心安全防御矩阵

| 风险领域 | 威胁类型 | 防御与修复策略 | 关键落地文件 |
| :--- | :--- | :--- | :--- |
| **本地静态服务** | 路径穿越 (Path Traversal / LFI) | 绝对路径前缀边界校验 (`rootPrefix + sep`)、空字节 `%00` 截断过滤、HTTP 动词仅白名单放行 (GET/HEAD) | `tools/_static_server.mjs` |
| **本地语音服务** | SSML / XML 属性注入 | `voice`、`rate`、`pitch` 实施严格正则白名单 (`SAFE_VOICE_RE`, `SAFE_RATE_PITCH_RE`) 与 XML 实体转义 | `tools/voice-server.mjs` |
| **本地语音服务** | 内存耗尽与队列洪泛 DoS | POST 预热设置 1MB 内存上限 (`413 Payload Too Large`)，预热队列上限 500 条截断 | `tools/voice-server.mjs` |
| **客户端渲染** | 存储型 / 反射型 XSS | 模板字符串中所有用户输入（档案小名、打卡昵称）必须统一经 `escapeHtml()` 实体化转义 | `src/utils/parentHub/parentTabs.js`, `src/utils/rewardHub/rewardViews.js` |
| **本地存储隔离** | 原型链污染 (Prototype Pollution) | 导入换机迁移码与 JSON 备份时，递归深度剥离 `__proto__`, `constructor`, `prototype` 危险键值 | `src/utils/storageManager.js` |
| **数据合法性校验** | 异常数据伪造与缓冲区注入 | 档案小名剔除 HTML 标签与控制字符，硬性截断最大 20 字符；导入文件上限 5MB | `src/utils/storageManager.js`, `src/utils/parentHub/parentPoster.js` |
| **网络与浏览器** | 危险 API 滥用 | 全站严禁 `eval()` 与 `new Function()`，外部链接禁止裸写 `target="_blank"`（必须附带 `rel="noopener noreferrer"`） | 全局静态扫描规则 |

---

## 2. 快速审计与验证工作流

任何代码修改或新增功能后，只需执行以下指令即可全自动秒级完成全链路安全检测：

### (1) 运行专用安全审计
```bash
npm run audit:security
# 或直接执行:
node tools/_security_audit.mjs
```
- 输出包含 18+ 项专项安全契约判定，发现任何高危/中危项将自动返回退出码 1 阻断流程。

### (2) 运行全流程契约与安全联调
```bash
npm run audit
```
- 联动运行 `_deep_contract_audit.mjs`（DOM/资源/SW 契约）与 `_security_audit.mjs`（漏洞扫描）。

### (3) 运行单元测试矩阵回归
```bash
npm test
```
- 确保所有安全加固与转义逻辑不破坏已有功能（81 套件 681 测试用例 100% 通过）。

---

## 3. 常见漏洞自查与标准修复模式 (Remediation Cookbook)

### A. 模板字符串中的 XSS 转义
```javascript
// ❌ 错误示范：未经转义直接拼入 innerHTML
mainEl.innerHTML = `<span>${userProfile.name}</span>`;

// ✅ 正确示范：使用 BaseModule.js 提供的 escapeHtml
import { escapeHtml } from "../BaseModule.js";
mainEl.innerHTML = `<span>${escapeHtml(userProfile.name)}</span>`;
```

### B. 对象深拷贝与解析防范原型链污染
```javascript
// ✅ 标准清洗函数（已内置在 storageManager.js）
export function deepSanitizeObject(obj, depth = 0) {
  if (depth > 20 || !obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((item) => deepSanitizeObject(item, depth + 1));
  const clean = Object.create(null);
  for (const [k, v] of Object.entries(obj)) {
    if (k === "__proto__" || k === "constructor" || k === "prototype") continue;
    clean[k] = deepSanitizeObject(v, depth + 1);
  }
  return clean;
}
```

### C. 本地 HTTP 路由路径边界判定
```javascript
// ❌ 错误示范：简单的 startsWith 会被 /app-other 伪造前缀绕过
if (!file.startsWith(ROOT)) return res.writeHead(403);

// ✅ 正确示范：强制携带系统目录分隔符判定
const rootPrefix = ROOT.endsWith(path.sep) ? ROOT : ROOT + path.sep;
if (!file.startsWith(rootPrefix) && file !== ROOT) return res.writeHead(403);
```
