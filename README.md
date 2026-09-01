# 凯茜识字 (Cathy Literacy)

专业儿童 1:1 游戏化汉字启蒙与分级阅读应用。

## 功能特性

- **世界大地图** — 三大主题岛屿（森林/小镇/太空），7 大地标快捷入口
- **五步学习流** — 玩→认→练→写→测，沉浸式汉字教学闭环
- **分级绘本馆** — 20+ 绘本，支持 Karaoke 逐字跟读
- **字卡字典** — 50+ 汉字，支持部首/阶段/搜索筛选
- **游乐场** — 5 种游戏模式（Boss 战/消消乐/PK 竞技/成语馆）
- **家长中心** — PIN 码保护，学习数据分析，设置管理
- **PWA 离线支持** — 首次访问后完全离线可用

## 技术架构

```
src/
├── app.js              # 主控制器（路由/生命周期/事件总线）
├── components/         # 9 个功能模块
│   ├── MapModule.js    # 世界大地图
│   ├── LearnModule.js  # 五步学习流
│   ├── BookModule.js   # 绘本馆
│   ├── PlayModule.js   # 游乐场
│   ├── CardModule.js   # 字卡库
│   ├── ParentModule.js # 家长中心
│   ├── RewardModule.js # 奖励城堡
│   ├── ReviewModule.js # 复习中心
│   └── PKModule.js     # PK 对战
├── utils/              # 工具层
│   ├── BaseModule.js   # 模块基类（生命周期管理）
│   ├── EventBus.js     # 全局事件总线
│   ├── soundEngine.js  # 六级音频总线引擎
│   ├── neuralVoice.js  # 神经童声 TTS
│   ├── ebbinghaus.js   # 艾宾浩斯复习调度
│   ├── hanziEngine.js  # 笔顺描红引擎
│   └── storageManager.js  # 统一存储层
└── data/               # 静态数据
    ├── characters.js   # 50 字字库（音/形/义/笔顺/游戏）
    ├── books.js        # 绘本数据
    └── idioms.js       # 成语数据
```

### 核心设计

- **BaseModule 生命周期**: 所有模块继承 BaseModule，通过 `_cleanups` 数组统一管理资源清理
- **EventBus 通信**: 28 个预定义事件，模块间松耦合通信
- **PWA**: Service Worker Cache-First 策略，37 文件预缓存
- **无障碍**: role/aria-label/aria-live 全覆盖

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
