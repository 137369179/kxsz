# 凯茜识字 · 项目长期记忆

## 项目定位
《洪恩识字》1:1 像素级 + 机制级克隆（用户强调"永远记住是 1:1"）。目标字库规模对标洪恩 **1300 字**。

## 字库生成管线（核心架构，务必记牢）
- 当前规模：**1490 字**（超洪恩 1300 口径；`MAX_CHARS=1300 python tools/build_characters.py` 可复现核心课程口径）
- 生成器：`tools/build_characters.py`（Python，用 venv `/Users/mac/.workbuddy/binaries/python/envs/default/bin/python`）
- 内容源 `tools/content/`：
  - 手工精编（9 字段）：`0数字_*.txt`（01-04，保留高质量故事/词组/形近字）
  - 自动扩字（4 字段 `字|类型|部首|emoji|词组`）：`auto*.txt`
  - 纯字池（每行一字）：`auto*.chars.txt` —— `load_auto_list()` 读取，自动取部首/配图/定机制
- 产物：`src/data/characters.js`（**仅元数据**，~1.84 MB）+ `src/data/hanzi_strokes.js`（**真实笔顺，懒加载**，~3.2 MB）
- 部首来源：`cnradical`（`Radical(RunOption.Radical).trans_ch(ch)`，已装 venv）
- 笔顺来源：hanzi-writer-data CDN `cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/<char>.json`，本地缓存 `tools/cache/<codepoint>.json`
- 上限：`MAX_CHARS=1300`（超出保留精编、裁字池尾部）

## 首屏瘦身约定（不要回退）
- 笔顺数据 **不**进 characters.js；写环节经 `src/utils/strokeLoader.js` 的 `loadStrokes(char)` 动态 import。
- 改 `hanziEngine` 构造需传第 5 参 `strokeData`；或走 `HanziEngine.create(canvas, charData, cb)` 异步工厂。
- `LearnModule.stepWrite()` 已是 async executor，构造引擎前先 `await loadStrokes(char.char)`。

## 服务与验证
- 本地预览：`node http-server -p 8848 --cors`（或 python 版易崩，勿用）
- 备用零依赖静态服务：`node tools/_static_server.mjs 8902`（2026-09-02 新增，python http.server 崩溃时替代）
- 真机冒烟：Chrome `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` --headless --dump-dom
  - 注意：内联 module 的 top-level `await` + 动态 import 在 --dump-dom 下常显示 "pending"（时序假象），用静态 import 同文件即可验证数据已加载
  - 截图与 dump-dom 不能同一次运行（--dump-dom 会跳过截图）；需 `--no-proxy-server`（环境有 HTTP_PROXY=127.0.0.1:55211 会 502）+ `--virtual-time-budget=9000` 等待异步启动

## 排障管线（「调试BUG」标准流程，务必按序执行）
1. `node --check` 全仓库 JS 语法扫描（注意：并行会话实时改文件，报错先复扫再下结论）
2. 数据完整性：characters.js 空char/重复id/缺笔顺/非CJK（node ESM import 校验）
3. 相对 import 可达性（悬空引用扫描）
4. `node tools/_boot_smoke.mjs` 应用启动冒烟
5. vitest 全量
6. `node tools/_audit_api_surface.mjs` 跨模块 API 运行时审计（抓「调用不存在的方法」，今日靠它抓到 3 个真 BUG）
7. 无头 Chrome 真实加载：`--enable-logging=stderr` 捕获控制台 + dump-dom 查 `undefined|NaN` 与关键 UI 标记计数
8. **模板字符串内误用 // 注释检测**：用 acorn AST 定位 TemplateLiteral.quasis 文本段内的 `// 中文注释`（会被渲染成可见垃圾文字）。修复工具 `tools/_fix_tpl_comments.mjs`（--dry 预览）。⚠️ 用正则/词法状态机扫易因 `${}` 嵌套误报，务必用 acorn（node_modules 自带）
9. CDP 真实浏览器探针：`tools/_cdp_flow_probe.mjs`（遍历 14 模块+学习六步）/ `tools/_cdp_char_sweep.mjs`（跨字符扫荡），需先起 `tools/_static_server.mjs 8902`
- 判「非BUG」前必须查消费点：字段缺失但所有调用方有回退（如 oracleGlyph||char.char）≠ BUG；story 已被 evolution.story 取代且无组件读顶层 story；emoji 字段已废弃(0 消费点)
- 已知假象：python http.server 崩溃导致白屏截图（非应用问题）；SW 版本过渡期旧缓存可能一次性报错（硬刷新解决）
- 并行会话的探针/审计工具常自身有 bug（选择器过时、正则转义、空指针），先修工具再信结论
- 最新回归测试：`tests/unit/bugFixRegressions.test.js`（19 项深度边界测试），全量 Vitest 25 套件 125 项用例全绿通过

## 常用命令
- 重生字库：`/Users/mac/.workbuddy/binaries/python/envs/default/bin/python tools/build_characters.py`
- JS 语法：`/Users/mac/.workbuddy/binaries/node/versions/22.22.2-2/bin/node --check <file>`
- API 审计：`node tools/_audit_api_surface.mjs`（只扫相对 HEAD 有改动的文件）

## 奖励城堡（激励机制）
- `src/utils/rewardEngine.js`（纯派生：贴纸/16 勋章/热力月历，不新增独立存储）
- `src/components/RewardModule.js`（三标签 UI，地图第 4 浮岛「🏆奖励城堡」进入，app.js reward 模式）
- 打卡数据在 ebbinghaus.js：`attendance.dates[]`（真实学习日）+ `markTodayActive()`（completeCharacter 触发）+ `seenMedals[]`（勋章只弹一次）

## 魔法商店（星币闭环）
- 价目唯一来源 `src/data/shop.js`（SHOP_AVATARS/SHOP_FRAMES/FRAME_CLASSES/findShopItem）
- 购买/装备 API 在 ebbinghaus.js（isOwned/purchase/equipAvatar/equipFrame；progress.shop={owned[],equippedFrame}）
- 头像 value = profile.avatar 存储值（图片路径或 emoji，渲染时 startsWith("assets/") 区分）
- UI：RewardModule 第 4 标签「🛍️魔法商店」+ MapModule 档案弹窗（锁定可直购）
