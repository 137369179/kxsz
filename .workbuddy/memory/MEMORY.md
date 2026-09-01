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
- 真机冒烟：Chrome `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` --headless --dump-dom
  - 注意：内联 module 的 top-level `await` + 动态 import 在 --dump-dom 下常显示 "pending"（时序假象），用静态 import 同文件即可验证数据已加载。

## 常用命令
- 重生字库：`/Users/mac/.workbuddy/binaries/python/envs/default/bin/python tools/build_characters.py`
- JS 语法：`/Users/mac/.workbuddy/binaries/node/versions/22.22.2/bin/node --check <file>`

## 奖励城堡（激励机制）
- `src/utils/rewardEngine.js`（纯派生：贴纸/16 勋章/热力月历，不新增独立存储）
- `src/components/RewardModule.js`（三标签 UI，地图第 4 浮岛「🏆奖励城堡」进入，app.js reward 模式）
- 打卡数据在 ebbinghaus.js：`attendance.dates[]`（真实学习日）+ `markTodayActive()`（completeCharacter 触发）+ `seenMedals[]`（勋章只弹一次）

## 魔法商店（星币闭环）
- 价目唯一来源 `src/data/shop.js`（SHOP_AVATARS/SHOP_FRAMES/FRAME_CLASSES/findShopItem）
- 购买/装备 API 在 ebbinghaus.js（isOwned/purchase/equipAvatar/equipFrame；progress.shop={owned[],equippedFrame}）
- 头像 value = profile.avatar 存储值（图片路径或 emoji，渲染时 startsWith("assets/") 区分）
- UI：RewardModule 第 4 标签「🛍️魔法商店」+ MapModule 档案弹窗（锁定可直购）
