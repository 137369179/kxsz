# 凯茜识字 (Cathy Literacy)

专业儿童 1:1 游戏化汉字启蒙与分级阅读应用。

## 功能特性

- **世界大地图** — 三大主题岛屿（启蒙森林/生活小镇/星际探索），全量 1490 字阶梯进阶
- **八步微课闭环** — 玩→认→读→练→控笔→描红→独立写→测，遵循 B1（认知先于执笔）与 B6（年龄分阶书写）
- **FSRS-6 智能复习** — 21 参数认知间隔重复算法，优先调度到期字与高频混淆字对
- **奇趣拼音乐园** — 63 个声母、韵母、整体认读音节图鉴、四声调过山车与拼读大碰撞
- **分级绘本馆** — 20+ 绘本，支持 Karaoke 逐字跟读与亲子录音
- **字卡字典** — 全量 1490 汉字，支持部首/阶段/拼音/搜索与字帖一键排版打印
- **游乐场** — 5 种微游戏（Boss 战/消消乐/PK 竞技/成语接龙/部首家族）
- **同音字特训** — 意符线索与情境挖空，突破目/木、石/十、在/再等常见易混难点
- **家长中心** — 算术门禁、数据罗盘、AI 伴学诊断日志与 A4 规范字帖打印工坊
- **PWA 离线支持** — 核心字库、地图、微课与复习可在首次缓存后离线使用；神经 TTS（本机 8766）与麦克风评测需本机服务或浏览器权限，不保证完全离线

## 技术架构

```
src/
├── app.js              # 主控制器（路由/生命周期/事件总线）
├── components/         # 10 个核心业务模块
│   ├── MapModule.js    # 世界大地图
│   ├── LearnModule.js  # 8 步微课编排层（步骤实现见 learnSteps/）
│   ├── BookModule.js   # 分级绘本馆
│   ├── PlayModule.js   # 游戏游乐场（样式/取题见 playHub/）
│   ├── CardModule.js   # 1490 字卡字典
│   ├── ParentModule.js # 家长中心与 AI 伴学日志
│   ├── RewardModule.js # 奖励城堡与成长荣誉
│   ├── ReviewModule.js # FSRS-6 智能复习中心
│   ├── PKModule.js     # 初学者安全对战竞技场
│   └── PinyinModule.js # 奇趣拼音乐园
├── utils/              # 核心引擎与教育学工具层
│   ├── fsrsScheduler.js   # FSRS-6 认知记忆调度器
│   ├── ebbinghaus.js      # 进度门面（委托 FSRS）
│   ├── learnProgressStore.js # 微课断点续学 JSON 持久化
│   ├── learnScoring.js    # 评测星级/进度纯函数
│   ├── learnSteps/        # Learn 八步 UI 实现
│   ├── playHub/           # Play 样式与取题工具
│   ├── bookVoiceReward.js # 绘本朗读评测发币结算
│   ├── hanziEngine.js     # 笔顺方向角容差验证与描红引擎 (含防绕路与综合校验)
│   ├── prewriteEngine.js  # 控笔训练与 Letter School 运笔演示
│   ├── drillEngine.js     # 11 种题型闪卡与主动回忆练习引擎 (含字义选字)
│   ├── cognitiveStage.js  # 汉字认知阶段自适应与幼儿具身动作表演引擎
│   ├── soundEngine.js     # 六级音频总线引擎（零第三方依赖）
│   ├── pronunciationEval.js # 麦克风多维度语音评测（写回真实成绩）
│   ├── mascotProgress.js  # 凯茜内在动机与专属表情故事系统 (T13)
│   ├── etymologyQuiz.js   # 象形字源与意符字理问答微交互 (T15)
│   ├── voiceGuide.js      # 3-7 岁儿童全流程智能语音引导 (T16)
│   ├── homophoneTrainer.js # 同音字辨析专项特训引擎 (T17)
│   ├── BaseModule.js      # 模块基类（生命周期统一清理）
│   ├── eventBus.js        # 全局事件总线
│   └── storageManager.js  # 统一存储持久化层
└── data/               # 核心字库与课程数据
    ├── characters.js      # 全量 1490 字核心数据库
    ├── charactersSchema.js # 字库数据标准与验证规范 (T3)
    ├── pinyinList.js      # 63 拼音数据库
    ├── books.js           # 分级绘本数据
    └── idioms.js          # 成语故事数据
```

### 核心设计与测试保证

- **单元测试**: Vitest 全量套件持续维护（以 `npm test` 为准）
- **BaseModule 生命周期**: 所有模块继承 BaseModule，通过 `_cleanups` 数组统一管理资源清理
- **EventBus 通信**: 预定义事件，模块间松耦合通信
- **PWA**: Service Worker Cache-First；版本号与 `src/utils/version.js` 对齐；神经 TTS 请求不进 SW 缓存
- **无障碍**: role/aria-label/aria-live 覆盖主流程
- **工程红线**: 优先纯矢量与 Canvas 渲染，UI 避免 Unicode Emoji 装饰

## 快速开始

```bash
# 直接打开 index.html（无需服务器）
open index.html

# 或使用本地服务器（推荐）
npx serve .
# 或
python3 -m http.server 8080
```

## 构建优化（可选）

当前为纯静态部署。如需优化首屏加载：

```bash
# 方案 A：Vite 构建（推荐，节省 ~87% 体积）
npm install -D vite tailwindcss @tailwindcss/vite
npx vite build

# 方案 B：最小优化（仅压缩）
npx esbuild src/app.js --bundle --minify --outdir=dist
npx tailwindcss -o dist/style.css --minify
```

## 数据安全

- 学习进度：`localStorage` → `StorageManager` 统一封装
- 家长 PIN：FNV-1a 64-bit 同步散列（非明文存储）
- 所有数据存储在前端，无后端依赖

## 浏览器支持

- Chrome 87+ / Safari 14+ / Edge 87+
- 需要 Web Audio API、Canvas、IndexedDB 支持
- 推荐横屏使用（16:9）

## 许可证

私有项目，仅供内部使用。
