# 凯茜识字 · 深度安全审计报告

> 审计日期：2026-09-04（延续 09-02 会话）
> 审计对象：`src/` 全量源码、`index.html`、依赖清单、构建工具
> 应用形态：纯前端静态站点（vanilla JS + Vite），0 个生产依赖

---

## 一、启用/安装的安全扫描技能（先审后装，均判定 P2 安全）

| 技能 | 用途 | 说明 |
|---|---|---|
| `sast-eslint-security` | 静态代码分析（ESLint + `eslint-plugin-security`） | 安装到临时目录，避免污染项目 `package.json` |
| `security-and-hardening` | Web 代码加固指南 | 用于 XSS / CSP / 输入校验加固决策 |
| `skills-security-check` | 供应链技能审查 | **仅用于审查待装技能本身是否被投毒**，不用于审应用代码 |

> 安装前已将候选 `SKILL.md` 拉到 `/tmp` 做文本审计（查 `curl http://`、`rm -rf`、`sudo`、`eval(`、`process.env`、外发域名、Prompt 注入话术），并 `find` 复查确认无夹带脚本，仅含 SKILL.md 才启用。

---

## 二、依赖与供应链审计

- **生产依赖：0 个** → 纯静态站点，终端用户无供应链暴露面。
- 开发依赖 4 个：`vite@5.4.21`、`vitest@1.6.1`、`jsdom@30.0.1`、`tough-cookie@6.0.2`。
- 官方源 `npm audit` 无漏洞报告；`tough-cookie` 的 ReDoS **CVE-2023-26136** 已在 4.1.3 修复，当前 6.0.2 不受影响。
- **结论：依赖面无已知 CVE 风险。**

---

## 三、问题清单（按严重程度分级）

| 级别 | 文件 / 定位 | 问题 | 状态 |
|---|---|---|---|
| 中 | `index.html:21` CSP | 缺 `frame-ancestors`（点击劫持防护） | ✅ 已修复 |
| 低 | `src/utils/parentGate.js:224-226` | 把 `showParentGate/showConfirm/showToast` 暴露到 `window`（零消费者，纯攻击面） | ✅ 已修复 |
| 低 | `src/utils/parentHub/parentPoster.js` 证书 `document.write` 标题 | `childName` 未做 HTML 转义（已先标签剥离，纵深防御补强） | ✅ 已修复 |
| 低(功能) | `src/utils/rewardHub/rewardViews.js:593` | 向 `showGameToast`（用 `textContent`）传入 HTML，勋章弹窗显示原始标签 | ✅ 已修复 |
| 已缓解 | `parentGate.js` 门禁 UI | XSS：全部经 `escapeAttr` + `textContent`，无漏洞 | 无需改动 |
| 已缓解 | `parentPoster.js` / `worksheetGenerator.js` | 昵称/标题已标签剥离 + `escapeHtml` | 无需改动 |
| 误报 | `gameIcons.js:33`、`storageManager.js:86/87`、`stripEmoji.js:7` | SAST 报 `unsafe-regex`；均为**静态字面量正则**，`detect-non-literal-regexp`（即 `new RegExp(用户输入)`）零命中 → 不可被触发为 ReDoS | 无需改动 |
| — | 全仓 `eval`/`new Function`/`child_process` | 仅注释命中，无真实危险调用 | 无需改动 |

**未发现 Critical / High 级漏洞。**

---

## 四、已修复项（最小改动，不破坏接口）

1. **CSP 点击劫持防护**：`index.html` 的 CSP 追加 `frame-ancestors 'none';`（已有 `object-src 'none'`、`base-uri 'self'`、`form-action 'none'`）。
2. **移除无用全局暴露**：删除 `parentGate.js` 末尾三行 `window.showParentGate/showConfirm/showToast = ...`（已 Grep 全仓确认零消费者，含测试）。
3. **证书标题纵深防御**：`parentPoster.js` 证书 `<title>` 内对 `childName` 加 `& < > " '` 全量 HTML 转义（其上游已先做标签剥离，此处为二次加固）。
4. **勋章弹窗显示 Bug**：`rewardViews.js:593` 由 HTML 字符串改为纯文本 `🏆 ${names.join("、")} 获得新勋章！`，避免原始标签外露。
5. **服务端 HTTP 层安全响应头**（`server.js`）：为所有响应新增 `X-Content-Type-Options: nosniff`、`X-Frame-Options: DENY`、`Referrer-Policy: no-referrer`，并在 HTTPS 下追加 `Strict-Transport-Security`。
6. **`script-src` 彻底移除 `'unsafe-inline'`（nonce 严格 CSP）**：
   - **前置重构**：将主文档 26 处内联事件属性 `onerror="this.src='X'"`（`gameIcons.js` 21 处、`TreehouseModule.js` 2 处、`mapHub/mapRender.js` 3 处）改为 `data-fallback="X"` + 全局捕获监听（新增 `src/utils/imageFallback.js`，`app.js` 启动时安装）；`parentPoster.js:429` 的 `onload="window.print()"` 位于打印弹窗独立文档（无 CSP 继承），保持原样。
   - **服务端 nonce**：`server.js` 为 HTML 响应生成 per-request 128-bit nonce，注入到全部无 `src` 的内联 `<script>`，并以 `script-src 'self' 'nonce-…'` 下发（`unsafe-inline` 从 `script-src` 移除）；meta CSP 保留 `unsafe-inline` 作为非本服务器部署（CDN/file://）时的兜底降级。

---

## 五、待确认项（需补充信息才能定论）

1. **部署形态**：是否经 CDN / 反向代理发布？若是，建议在**反代层再补一份 HTTP 响应头 CSP + HSTS**，与 `index.html` 的 meta CSP 形成双层（meta 在反代场景可被绕过）。
2. **`script-src 'unsafe-inline'` 的完整移除（✅ 已解决，见已修复项第 6 条）**：阻塞根因为主文档 26 处 `<img onerror="this.src='…'">` 内联事件属性会被严格 CSP 拦截；已通过 `data-fallback` + 全局捕获监听重构解决，`server.js` 现以 nonce 严格 CSP 下发。剩余唯一内联事件属性为 `parentPoster.js:429` 的 `onload="window.print()"`，位于打印弹窗独立文档（无 CSP 继承），不受影响。
3. **本地 AI 语音服务 `127.0.0.1:8766`**：前端仅同源访问、无敏感数据外泄，但该服务的**访问控制/来源校验**不在前端可控范围，需确认该本地服务自身是否有鉴权。

---

## 六、后续安全加固建议

- 引入构建期 **CSP nonce 注入**（替换 `unsafe-inline`），进一步收敛 XSS 面。
- 把 ESLint `eslint-plugin-security` 接入 **CI 门禁**（本次已验证规则集，可直接复用），防止回归。
- 对外发数据保持最小化，新增任何 `fetch`/WebSocket 时强制同源或显式白名单。
- 定期（如每月）用官方源重跑 `npm audit`，并在 lock 版本下关注 transitive 依赖告警。

---

## 七、验证结果（修复后）

- `node --check` 三个改动文件：**全部通过**
- 项目自带 `tools/_security_audit.mjs`：**24/24 通过**
- ESLint 对改动文件复扫：**无新增问题**
- `npx vitest run`：**84 文件 / 704 测试全绿**
- `server.js` 安全头验证：启动测试实例，`curl` 确认 `Content-Security-Policy`（`script-src 'self' 'nonce-…'`，`unsafe-inline` 已从 `script-src` 移除，仅 `style-src` 保留）、`frame-ancestors 'none'`、`X-Frame-Options`、`X-Content-Type-Options`、`Referrer-Policy` 均已下发；单请求内 CSP 头 nonce 与 3 个内联脚本 nonce **完全一致**；外部 module 脚本不受影响；HSTS 仅 HTTPS 下出现。
- 内联事件属性重构验证：`grep` 确认主文档 26 处 `onerror="this.src=…"` 已全部转为 `data-fallback="…"`（fallback 值含动态 `${islandCfg.bgFallback}` 原样保留）；`node --check` 6 个改动文件全部通过；全量 vitest 通过。

---

## 附：本次审计使用的 SAST 命令（可复现）

```bash
# 临时环境安装（不污染项目）
mkdir -p /tmp/sast_env && cd /tmp/sast_env
echo '{"name":"sast-env","private":true}' > package.json
npm install --no-audit --no-fund eslint@8 eslint-plugin-security

# .eslintrc.json（注意：勿用 extends recommended，ESLint 8 会报 schema 错误）
# 直接列规则：detect-eval-with-expression / detect-child-process /
# detect-non-literal-regexp / detect-unsafe-regex / detect-pseudoRandomBytes /
# detect-bidi-characters / no-eval
/tmp/sast_env/node_modules/.bin/eslint -c /tmp/sast_env/.eslintrc.json --ext .js src/
```

> **误报判定经验**：`detect-unsafe-regex` 常对静态字面量正则误报；真正危险的 ReDoS 信号是
> `detect-non-literal-regexp`（`new RegExp(用户输入)`），该规则零命中即可判为正则类误报。
