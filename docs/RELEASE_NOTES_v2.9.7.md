# 凯茜识字 v2.9.7 Release Notes

| 项                      | 值               |
| ---------------------- | --------------- |
| 版本                     | **v2.9.7**      |
| Date                   | 2026-09-05      |
| Commits                | 12              |
| Files changed          | **96**          |
| Insertions / Deletions | +9,418 / -580   |
| 新增文件                   | **16**          |
| Tests                  | **722 / 722** ✅ |
| Smoke                  | **28 / 28** ✅   |

***

## 一句话摘要

**面向 3-6 岁儿童的凯茜识字首次完整无障碍升级**——从"只会看"到"能听能操作"。同时交付 P0 语音指令层、汉字炼金术合成引擎、易错难字消灭战复习模式、陨石防御新游戏、甲骨文 glyphs 内容补全、以及 meteor-fall haptics 等 7 大新能力。

***

## 🎯 核心新功能

### 1. P0-2 语音指令层 — BaseModule data-speak

所有按钮只需一个 `data-speak="去奇幻森林岛"` 属性，就能自动朗读按钮语义。家长/用户可以"听着用"：

```javascript
// BaseModule._on 自动处理：
// 用户点按钮 → 先朗读 data-speak → 再执行原本的 click handler
```

覆盖 Learn / Play / Review / Book / PK / Boss / Treehouse / Parent Dashboard 全场景的 **高频 CTA 按钮**。

### 2. 汉字炼金术合成引擎 (`src/utils/alchemyEngine.js`)

两个已学汉字能不能合成一个双字词？Treehouse 里点 🧪 按钮就能试：

```javascript
checkSynthesis("太", "阳") // → { success: true, word: "太阳", pinyin: "tài yáng", desc: "..."}
checkSynthesis("太", "好") // → { success: false }
```

- 失败原因会告诉小朋友"太和好不能组成词哦"

- 已合成过的词会去重（持久化在 `ebbinghaus.progress.synthesizedWords`）

- 答对给 coin

### 3. 易错难字消灭战 (`src/utils/reviewHub/mistakeAssault.js`)

复习空态/会话内可启动"难字突击"：

- 自动从 `ebbinghaus.progress` 里捞 FSRS 标记的 `mistakeChars`

- 答对 → **清掉难字标记** + 发币

- 答错 → 继续留在难字池

- Boss 战实时调节选项数和倒计时（`realtimeAdjust`）

### 4. 陨石防御新游戏 (`src/utils/playHub/meteorDefense.js`)

打字保卫星球：

- 4 难度递进（easy / medium / hard / nightmare）

- Tailwind 新增 `@keyframes meteor-fall` 动画

- haptics 用 `success` / `error` / `tap` / `fanfare` 四档语义反馈

### 5. P2 字源时间轴 (`stepRecognize.js`)

认字步骤四阶段字源迷你条 + 语音引入：

```
甲骨文 → 金文 → 小篆 → 楷书
```

跟读完成按星级发币（⭐ 10币 / ⭐⭐ 15币 / ⭐⭐⭐ 20币）。

### 6. 调度门面统一 (`src/utils/schedulerFacade.js`)

playHelpers 的到期/写回操作统一经过 `schedulerFacade`，Boss 自适应难度不再散落在各 play 模块里。

***

## ♿ 无障碍 (P0-3 a11y)

| 改动                                                                      | 文件                             |
| ----------------------------------------------------------------------- | ------------------------------ |
| 页面级 `<h1 class="sr-only">${heading}</h1>` 每屏独立                          | SharedShell.js                 |
| 地图滚动区 `role="region"` + `aria-label` + `tabindex="0"`                   | mapRender.js                   |
| tabColor `bg-*-500` → `bg-*-700`（WCAG AA 对比度提升）                         | islandConfig.js + mapRender.js |
| toast `role="status"` + `aria-live="polite"`                            | 各 toast 组件                     |
| Learn / Play / Review / Book / PK / Boss 全场景按钮补 data-speak / aria-label | 24+ files                      |
| 页面级 main landmark                                                       | index.html                     |

***

## 🔐 安全

- **CSP nonce** 每请求动态生成，inline script 不再被 block

- **path traversal fix** server.js 对 `../` 做 sanitize

- **parentGate 数学验证** 麦克风授权必须家长先过算术门禁

- **麦克风数据即焚** Blob URL revokeObjectURL 用完即清

- **childContentSafety.test.js** 新增：扫描子可见 UI 中外链/联系方式（parentPoster "微信" → "粘贴分享" 已修复）

- **haptics 权限持久化** 家长授权存 localStorage

***

## 🐛 修复

| Bug                                                                                            | Commit    | 影响                         |
| ---------------------------------------------------------------------------------------------- | --------- | -------------------------- |
| `startLearnFlow` withAnticipatoryFeedback 重构留 6 行死代码 → vite build 炸                            | `6445cbb` | 生产构建完全不可用                  |
| stepTest 星星动画 1400ms timeout 内点返回 → `completeCharacter` / `clearProgress` / `LEARN_FINISH` 全漏调 | `baea6fa` | FSRS 调度、断点续学、coin 计数、好感度全错 |
| Treehouse 炼金术入口混 emoji (🔮✨💨★)                                                                | `1162471` | 违反项目零 emoji 策略             |
| island tab active bg-emerald-500 与 islandConfig bg-emerald-700 不一致                             | `267345f` | 视觉跳变 + 对比度降级               |

***

## 🎨 设计系统

- **btn-game-wood** / **btn-game-orange** 新按钮类（立体木纹 / 活力橙渐变）

- Shell 导航 3 按钮（home / parent / sound）统一用新类 + `touch-target`

- Coin 动画终点优先锚定 `shell-coins-target-anchor`（不再硬编码 `innerWidth - 110`）

- 全局 button:active Q 弹加 `:not([class*="btn-game"])` 避免覆盖立体压感

- `style.css` 新增 100+ 行细节美化工具类（progress-bar / empty-state / HUD / mode-card / tab）

***

## 📦 内容

| 资源                      | 数量   | 位置                                                                |
| ----------------------- | ---- | ----------------------------------------------------------------- |
| 甲骨文 glyphs stage2       | 20 字 | `tools/content/stage2_oracle_glyphs.json`                         |
| 甲骨文 glyphs stage3-core  | 30 字 | `tools/content/stage3_core_oracle_glyphs.json`                    |
| 甲骨文 glyphs stage3-phono | 65 字 | `tools/content/stage3_phono_oracle_glyphs.json`                   |
| patch 脚本                | 2    | `tools/patch_oracle_glyphs.mjs` / `tools/patch_stage1_oracle.mjs` |
| 背景图 .jpg → .webp 升级     | 1    | `assets/images/cover_busy_bee.webp`                               |

***

## 🔧 基础设施

| 项                                              | 说明                                             |
| ---------------------------------------------- | ---------------------------------------------- |
| `.gitignore` 加 AI agent config + a11y audit 产物 | 避免 `.agents/`、`_a11y_voice_audit_last.json` 入库 |
| `manifest.json` PWA 配置微调                       | 图标尺寸 / 主题色                                     |
| Tailwind 重编译                                   | `meteor-fall` keyframes + 新 btn-game-\* 类      |
| haptics iOS fallback                           | Vibration API 不可用时走 Web Audio 25ms 听觉微阻尼       |

***

## 🧪 测试

- 722 / 722 全绿（89 files）

- 新增：`mistakeAssault.test.js` / `schedulerFacade.test.js` / `interleavePack.test.js` / `reportEngine.test.js` / `childContentSafety.test.js` / `meteorDefense.test.js` / `anticipatoryLoader.test.js` / `drillEngine.test.js` / `drillTypes.test.js` / `sessionPlannerQuest.test.js`

***

## Commit 链（12 个，按时间倒序）

```
7cfe051  feat(ui): shell 导航统一 btn-game-wood/orange + coin 动画锚点 + Q 弹排除 btn-game-*
74f6e72  feat(review): 易错难字消灭战 + 今日通关态地图按钮
fcb6892  feat(p2): 字源时间轴 + 跟读按星发币 + Boss 自适应难度 + schedulerFacade
49b7212  chore: tailwind 重编译 (meteor-fall keyframes) + haptics iOS Web Audio fallback
3e98e81  feat(kids-ux): 高频控件语音指令收口 + 拼音找字进复习轮换
267345f  fix(a11y): island tab active state bg-emerald-500→700 与 islandConfig 对齐
715e95a  feat(a11y): P0-3 页面级 h1 + 地图滚动区 role + 颜色对比度
1162471  feat: 汉字炼金术合成引擎 + Treehouse 入口 + emoji 清零
d319e91  feat(a11y): 为关键按钮补 data-speak + aria-label
27324aa  feat: P0 语音指令层 + 麦克风合规 + meteorDefense + 甲骨文 glyphs
baea6fa  fix(stepTest): 星星动画期间点返回导致 completeCharacter 漏调
6445cbb  fix(appNavigation): 删除 startLearnFlow 重构残留的死代码
```

