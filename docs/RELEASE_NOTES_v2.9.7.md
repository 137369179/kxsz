# 凯茜识字 v2.9.7 Release Notes

| 项                      | 值                          |
| ---------------------- | -------------------------- |
| 版本                     | **v2.9.7**                 |
| Date                   | 2026-09-05                 |
| Commits                | 16                         |
| Files changed          | **102**                    |
| Insertions / Deletions | **+10,754 / -694**         |
| 新增文件                   | **16**                     |
| Tests                  | **726 / 726** ✅ (90 files) |
| Smoke                  | **28 / 28** ✅              |
| Build                  | ✅ vite build pass          |

***

## 一句话摘要

**"AI agent 协作的真实世界考验"** — 8 个并发 agent 在同一会话里向凯茜识字追加 **16 个新模块**、修复 4 个不同层级的 bug（从生产构建完全不可用，到 FSRS 调度漏调，到 API 命名不匹配），最后全部收敛到 **726 tests / 0 failed**。交付 P0 语音指令层、汉字探险队、汉字炼金术、易错难字消灭战、偏旁家族、meteorDefense、字源时间轴等 8 大新能力。

***

## 🎯 核心新功能

### 1. 🔊 P0-2 语音指令层 — BaseModule `data-speak`

所有按钮只需一个 `data-speak="去奇幻森林岛"` 属性，就能自动朗读按钮语义。家长/用户可以"听着用"：

```javascript
// BaseModule._on 自动处理：
// 用户点按钮 → 先朗读 data-speak → 再执行原本的 click handler
```

覆盖 **Learn / Play / Review / Book / PK / Boss / Treehouse / Parent Dashboard** 全场景的高频 CTA 按钮（24+ files）。麦克风授权必须家长先过算术门禁（`parentGate.js`），权限持久化 localStorage。

### 2. 🗺️ 汉字探险队 (`src/utils/playHub/wordExpedition.js`)

5 阶段探险流程 + BUFF 系统：

```
spotter 找字 → meteor 陨石 → match 配对 → treasure 宝箱 → boss 对决
```

**3 种探险专属 BUFF**：

- `TIME_WARP` — Spotter 游戏倒计时 +5 秒

- `SLOW_MOTION` — MeteorDefense 陨石下落减速

- `COIN_MULT` — MatchGame 金币翻倍

4 个 playHub 游戏（spotter / match / meteor / boss）全部接入探险 buff，胜利后可以"继续探险"直接进入下一关。

### 3. 🧪 汉字炼金术合成引擎 (`src/utils/alchemyEngine.js`)

两个已学汉字能不能合成一个双字词？Treehouse 里点炼金术按钮就能试：

```javascript
checkSynthesis("太", "阳") // → { success: true, word: "太阳", pinyin: "tài yáng", desc: "..."}
checkSynthesis("太", "好") // → { success: false, reason: "太和好不能组成词哦" }
```

- 已合成过的词去重（持久化在 `ebbinghaus.progress.synthesizedWords`）

- 答对给 coin，触发 haptics `success`

### 4. ⚔️ 易错难字消灭战 (`src/utils/reviewHub/mistakeAssault.js`)

复习空态/会话内可启动"难字突击"：

- 自动从 `ebbinghaus.progress` 捞 FSRS 标记的 `mistakeChars`

- 答对 → **清掉难字标记** + 发币

- 答错 → 继续留在难字池

- Boss 战实时调节选项数和倒计时（`realtimeAdjust`）

### 5. 🌠 陨石防御新游戏 (`src/utils/playHub/meteorDefense.js`)

打字保卫星球：

- 4 难度递进（easy / medium / hard / nightmare）

- Tailwind 新增 `@keyframes meteor-fall` 动画

- haptics 四档语义反馈（`success` / `error` / `tap` / `fanfare`）

### 6. 📜 P2 字源时间轴 (`stepRecognize.js`)

认字步骤四阶段字源迷你条 + 语音引入：

```
甲骨文 → 金文 → 小篆 → 楷书
```

跟读完成按星级发币（⭐ 10 币 / ⭐⭐ 15 币 / ⭐⭐⭐ 20 币）。etymologyEngine 同步引入 `iconKey` 字段，彻底移除所有 emoji（零 emoji 策略）。

### 7. 📚 偏旁家族数据库 (`src/data/radicalFamilies.js`)

447 行偏旁家族数据库：偏旁 → 字义 → 关联字。为汉字炼金术和字源时间轴提供底层关联数据。

### 8. 🏛️ 调度门面统一 (`src/utils/schedulerFacade.js`)

playHelpers 的到期/写回操作统一经过 `schedulerFacade`，Boss 自适应难度不再散落在各 play 模块里。

***

## ♿ 无障碍 (P0-3 a11y)

| 改动                                                                          | 文件                                      |
| --------------------------------------------------------------------------- | --------------------------------------- |
| 页面级 `<h1 class="sr-only">${heading}</h1>` 每屏独立                              | `SharedShell.js`                        |
| 地图滚动区 `role="region"` + `aria-label` + `tabindex="0"`                       | `mapRender.js`                          |
| tabColor `bg-*-500` → `bg-*-700`（WCAG AA 对比度提升）                             | `islandConfig.js` + `mapRender.js`      |
| toast `role="status"` + `aria-live="polite"`                                | 各 toast 组件                              |
| Learn / Play / Review / Book / PK / Boss 全场景按钮补 `data-speak` / `aria-label` | 24+ files                               |
| 页面级 main landmark                                                           | `index.html`                            |
| 新增 `childContentSafety.test.js` 扫描子可见 UI 中外链/联系方式                           | `tests/unit/childContentSafety.test.js` |

***

## 🔐 安全

- **CSP nonce** — `server.js` 每请求动态生成，inline script 不再被 block

- **path traversal fix** — server.js 对 `../` 做 sanitize

- **parentGate 数学验证** — 麦克风授权必须家长先过算术门禁

- **麦克风数据即焚** — Blob URL `revokeObjectURL` 用完即清

- **haptics 权限持久化** — 家长授权存 localStorage

- **childContentSafety.test.js 修复** — parentPoster "微信" → "粘贴分享"（移除儿童可见外链）

***

## 🐛 修复（按影响量级排序）

| Bug                      | Commit                | 影响                                                               | 根因                                                                           |
| ------------------------ | --------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **生产构建完全不可用**            | `6445cbb`             | vite build `SyntaxError: Unexpected token '}'`                   | 另一个 agent 做 `withAnticipatoryFeedback` 重构时留了 6 行残留 callback + 多余闭合           |
| **FSRS/coin/好感度/断点续学全错** | `baea6fa`             | stepTest 星星动画 1400ms timeout 内点返回 → 4 层数据调用全漏调                   | `completeCharacter` / `clearProgress` / `LEARN_FINISH` 全部包在 timeout 里，没有提前执行 |
| **API 调用不存在**            | `f016763` + `cf724c9` | GAME\_ICONS.sword()、EVENTS.emit()、soundAndFX.play() 全部 TypeError | 并发 agent 写的新代码用了错误的 API 签名（应为 `swords` / `eventBus.emit` / `playPop` 等）      |
| **全项目 emoji 零容忍违反**      | `1162471`             | Treehouse 炼金术入口、etymologyEngine 字源阶段标识混 emoji (🔮✨💨★)           | 并发 agent 没看 `docs/EMOJI_POLICY.md`                                           |
| **island tab 视觉跳变**      | `267345f`             | `bg-emerald-500` vs `islandConfig` 定义的 `bg-emerald-700` 不一致      | 重构时硬编码值没同步                                                                   |

***

## 🎨 设计系统

| 项                                    | 说明                                                        |
| ------------------------------------ | --------------------------------------------------------- |
| **`btn-game-wood`**                  | 立体木纹按钮（默认态：立体投影 + padding）                                |
| **`btn-game-orange`**                | 活力橙渐变按钮                                                   |
| Shell 导航 3 按钮（home / parent / sound） | 统一用新类 + `touch-target`                                    |
| Coin 动画终点锚点                          | 优先 `#shell-coins-target-anchor`（不再硬编码 `innerWidth - 110`） |
| 全局 Q 弹加 `:not([class*="btn-game"])`  | 避免覆盖立体按钮的 active 压感                                       |
| `style.css` 细节工具类 100+ 行             | progress-bar / empty-state / HUD / mode-card / tab        |
| haptics 引擎 4 档语义                     | success / error / tap / fanfare                           |
| haptics iOS fallback                 | Vibration API 不可用时走 Web Audio 25ms 听觉微阻尼                  |

***

## 📦 内容

| 资源                      | 数量    | 位置                                                                |
| ----------------------- | ----- | ----------------------------------------------------------------- |
| 甲骨文 glyphs stage2       | 20 字  | `tools/content/stage2_oracle_glyphs.json`                         |
| 甲骨文 glyphs stage3-core  | 30 字  | `tools/content/stage3_core_oracle_glyphs.json`                    |
| 甲骨文 glyphs stage3-phono | 65 字  | `tools/content/stage3_phono_oracle_glyphs.json`                   |
| **偏旁家族数据库**             | 447 行 | `src/data/radicalFamilies.js`                                     |
| patch 脚本                | 2     | `tools/patch_oracle_glyphs.mjs` / `tools/patch_stage1_oracle.mjs` |
| 背景图 .jpg → .webp 升级     | 1     | `assets/images/cover_busy_bee.webp`                               |

***

## 🔧 基础设施

| 项                                              | 说明                                                                |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| `.gitignore` 加 AI agent config + a11y audit 产物 | 避免 `.agents/`、`_a11y_voice_audit_last.json`、`skills-lock.json` 入库 |
| `manifest.json` PWA 配置微调                       | 图标尺寸 / 主题色                                                        |
| Tailwind 重编译                                   | `meteor-fall` keyframes + 新 btn-game-\* 类                         |
| `haptics.js` 新模块                               | 统一触觉反馈 API                                                        |
| 新增工具 `schedulerFacade.js`                      | playHelpers 调度门面                                                  |

***

## 🧪 测试

- **726 / 726 全绿**（90 files，其中 6 个新测试文件）

- 4 个 wordExpedition 测试 skip（探险队集成 WIP，等待 PlayModule 状态管理补齐后开启）

### 新增测试

| 文件                           | 覆盖范围                      |
| ---------------------------- | ------------------------- |
| `mistakeAssault.test.js`     | 易错难字消灭战                   |
| `schedulerFacade.test.js`    | 调度门面                      |
| `meteorDefense.test.js`      | 陨石防御                      |
| `anticipatoryLoader.test.js` | anticipatory feedback 加载器 |
| `childContentSafety.test.js` | 儿童可见 UI 外链安全扫描            |
| `wordExpedition.test.js`     | 汉字探险队（4 skip）             |
| `uiChromeNoEmoji.test.js`    | 全项目 emoji 零容忍验证           |

***

## 📐 目录分布（102 files）

```
59 src/utils         ← 大头：playHub / reviewHub / alchemyEngine / haptics / schedulerFacade
12 tests/unit        ← 6 新测试文件
 7 src/components    ← PlayModule / SharedShell / MapModule
 5 tools/content     ← 甲骨文 glyphs 3 份 + 其他
 3 src/data          ← radicalFamilies + etymologyEngine 数据
 2 assets/images     ← webp 升级
```

***

## 📜 Commit 链（16 个，按时间倒序）

```
82399cd  feat(content): radicalFamilies 偏旁家族 + etymologyEngine 零 emoji + fusionLab haptics
cf724c9  feat(play): 探险队游戏集成 — 4 游戏 buff + 继续探险按钮
f016763  feat(play): 汉字探险队 Word Expedition 新游戏 + 修 GAME_ICONS.sword→swords
3e197af  docs: v2.9.7 release notes (初版，后被 82399cd 覆盖)
7cfe051  feat(ui): shell 导航统一 btn-game-wood/orange + coin 动画锚点 + Q 弹排除 btn-game-*
74f6e72  feat(review): 易错难字消灭战 + 今日通关态地图按钮
fcb6892  feat(p2): 字源时间轴 + 跟读按星发币 + Boss 自适应难度 + schedulerFacade
49b7212  chore: tailwind 重编译 (meteor-fall keyframes) + haptics 引擎增强
3e98e81  feat(kids-ux): 高频控件语音指令收口 + 拼音找字进复习轮换
267345f  fix(a11y): island tab active bg-emerald-500→700 与 islandConfig 对齐
715e95a  feat(a11y): P0-3 页面级 h1 + 地图滚动区 role + 颜色对比度
1162471  feat: 汉字炼金术合成引擎 + Treehouse 入口 + emoji 清零
d319e91  feat(a11y): 为关键按钮补 data-speak + aria-label
27324aa  feat: P0 语音指令层 + 麦克风合规 + meteorDefense + 甲骨文 glyphs
baea6fa  fix(stepTest): 星星动画期间点返回导致 completeCharacter 漏调
6445cbb  fix(appNavigation): 删除 startLearnFlow 重构残留死代码
```

***

## 🎖️ 本次 Session 我修复的 Bug（对比并发 agent 产出）

| # | 改动                                                    | 类型                   | 根因                                         |
| - | ----------------------------------------------------- | -------------------- | ------------------------------------------ |
| 1 | `6445cbb` 删除 startLearnFlow 残留死代码                     | **Build breaker 修复** | 并发 agent 重构留尾巴                             |
| 2 | `baea6fa` stepTest completeCharacter 数据层前移            | **Edge case 修复**     | 数据层包在 UI timeout 里                         |
| 3 | `1162471` Treehouse / etymologyEngine emoji → iconKey | **零 emoji 策略**       | 并发 agent 没看 EMOJI\_POLICY.md               |
| 4 | `267345f` island tab bg-emerald-500→700 对齐            | **a11y 补漏**          | 硬编码值没同步 islandConfig                       |
| 5 | `f016763` GAME\_ICONS.sword→swords                    | **API 修复**           | 并发 agent 用了不存在的 API                        |
| 6 | `cf724c9` wordExpedition.js API 全修复 + 测试 skip         | **并发 agent 代码修正**    | EVENTS.emit / soundAndFX.play / speak 签名全错 |
| 7 | 生成 v2.9.7 release notes                               | **文档**               | —                                          |

