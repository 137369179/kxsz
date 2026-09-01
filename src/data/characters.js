/**
 * 凯茜识字 (Cathy Literacy) - 阶梯字库体系核心数据库
 * 遵循 1:1 克隆设计：三大阶段（启蒙/生活/进阶），包含完整的字音字形象形演变笔顺骨架与小游戏配置
 */

export const CHARACTER_DATABASE = [
  {
    id: "char_001",
    char: "日",
    oracleGlyph: "",
    bronzeGlyph: "",
    pinyin: "rì",
    pinyinTone: 4,
    radical: "日",
    strokeCount: 4,
    stage: 1, // 1: 启蒙森林岛, 2: 生活小镇岛, 3: 星际智慧岛
    themeIsland: "forest",
    unitIndex: 1,
    levelIndex: 1,
    evolution: {
      story: "古人看到的太阳是圆圆的，中间有一个发光的黑子于是画了一个圆圈中间加一点，后来演变成了方正的‘日’字",
      oracleDesc: "像圆圆的太阳，中间有一点光芒",
      bronzeDesc: "线条逐渐规整，象征白昼与光芒",
      sealDesc: "演变为长圆框与横线",
      modernDesc: "楷书方正规整，代表太阳与日子"
    },
    words: [
      { word: "太阳", pinyin: "tài yáng", desc: "天空中发光发热的恒星" },
      { word: "日子", pinyin: "rì zi", desc: "每一天的美好生活" },
      { word: "日出", pinyin: "rì chū", desc: "清晨太阳从东方升起" }
    ],
    sentence: "太阳升起来了，今天是个好日子",
    gameConfig: {
      type: "balloon_pop",
      title: "射击太阳气球",
      instruction: "请听发音，点击带有‘日’字的光芒气球！",
      options: ["日", "目", "白", "田"],
      correctIndex: 0
    },
    strokes: [
      {
        name: "竖",
        order: 1,
        path: "M 30,30 L 30,85",
        start: { x: 30, y: 30 },
        end: { x: 30, y: 85 }
      },
      {
        name: "横折",
        order: 2,
        path: "M 30,30 L 70,30 L 70,85",
        start: { x: 30, y: 30 },
        corner: { x: 70, y: 30 },
        end: { x: 70, y: 85 }
      },
      {
        name: "横",
        order: 3,
        path: "M 30,55 L 70,55",
        start: { x: 30, y: 55 },
        end: { x: 70, y: 55 }
      },
      {
        name: "横",
        order: 4,
        path: "M 30,85 L 70,85",
        start: { x: 30, y: 85 },
        end: { x: 70, y: 85 }
      }
    ],
    confusingChars: ["目", "白", "田", "旦"]
  },
  {
    id: "char_002",
    char: "月",
    pinyin: "yuè",
    pinyinTone: 4,
    radical: "月",
    strokeCount: 4,
    stage: 1,
    themeIsland: "forest",
    unitIndex: 1,
    levelIndex: 2,
    oracleGlyph: "",
    bronzeGlyph: "月",
    evolution: {
      story: "月亮常常是弯弯的月牙形状，古人便根据弯月的样子画出了‘月’字，代表夜晚与月光",
      oracleDesc: "像一弯皎洁的新月",
      bronzeDesc: "月牙弯弯，中间有月影纹理",
      sealDesc: "线条拉长，形如明月悬空",
      modernDesc: "规范楷书，外框微倾如弯月"
    },
    words: [
      { word: "月亮", pinyin: "yuè liang", desc: "夜晚天空中温柔的明月" },
      { word: "月光", pinyin: "yuè guāng", desc: "月亮洒向大地的银白色光芒" },
      { word: "月饼", pinyin: "yuè bǐng", desc: "中秋节一家人团圆吃的甜点" }
    ],
    sentence: "弯弯的月亮像一条小船挂在夜空",
    gameConfig: {
      type: "catch_butterfly",
      title: "捕捉月光小精灵",
      instruction: "快看！点击身上写着‘月’字的小精灵！",
      options: ["月", "用", "同", "丹"],
      correctIndex: 0
    },
    strokes: [
      {
        name: "撇",
        order: 1,
        path: "M 35,25 Q 33,60 25,90",
        start: { x: 35, y: 25 },
        end: { x: 25, y: 90 }
      },
      {
        name: "横折钩",
        order: 2,
        path: "M 35,25 L 72,25 L 72,85 Q 70,90 60,88",
        start: { x: 35, y: 25 },
        corner: { x: 72, y: 25 },
        end: { x: 60, y: 88 }
      },
      {
        name: "横",
        order: 3,
        path: "M 35,48 L 70,48",
        start: { x: 35, y: 48 },
        end: { x: 70, y: 48 }
      },
      {
        name: "横",
        order: 4,
        path: "M 33,68 L 70,68",
        start: { x: 33, y: 68 },
        end: { x: 70, y: 68 }
      }
    ],
    confusingChars: ["用", "同", "丹", "朋"]
  },
  {
    id: "char_003",
    char: "水",
    pinyin: "shuǐ",
    pinyinTone: 3,
    radical: "水",
    strokeCount: 4,
    stage: 1,
    themeIsland: "forest",
    unitIndex: 1,
    levelIndex: 3,
    oracleGlyph: "𝌀",
    bronzeGlyph: "氵",
    evolution: {
      story: "古人观察小溪流动的样子，中间是蜿蜒的水流，两边是溅起的水滴，组合在一起就是‘水’字",
      oracleDesc: "中间是一道弯曲河流，两旁是水珠",
      bronzeDesc: "波浪起伏，水流涌动",
      sealDesc: "主脉清晰，分叉水流流动",
      modernDesc: "竖钩为主干，横撇撇捺在两侧"
    },
    words: [
      { word: "喝水", pinyin: "hē shuǐ", desc: "口渴时喝清凉干净的水" },
      { word: "河水", pinyin: "hé shuǐ", desc: "在大地上奔流不息的河流" },
      { word: "水果", pinyin: "shuǐ guǒ", desc: "多汁甜美的好吃果子" }
    ],
    sentence: "清清的河水哗啦啦地向远方流去",
    gameConfig: {
      type: "pick_fruit",
      title: "小猴采摘水滴果",
      instruction: "小猴子口渴啦，帮它摘下带有‘水’字的甘甜果子吧！",
      options: ["水", "木", "小", "米"],
      correctIndex: 0
    },
    strokes: [
      {
        name: "竖钩",
        order: 1,
        path: "M 50,20 L 50,85 Q 45,90 38,80",
        start: { x: 50, y: 20 },
        end: { x: 38, y: 80 }
      },
      {
        name: "横撇",
        order: 2,
        path: "M 25,40 L 45,40 L 22,65",
        start: { x: 25, y: 40 },
        end: { x: 22, y: 65 }
      },
      {
        name: "撇",
        order: 3,
        path: "M 75,35 L 53,55",
        start: { x: 75, y: 35 },
        end: { x: 53, y: 55 }
      },
      {
        name: "捺",
        order: 4,
        path: "M 53,55 L 82,85",
        start: { x: 53, y: 55 },
        end: { x: 82, y: 85 }
      }
    ],
    confusingChars: ["木", "小", "米", "冰"]
  },
  {
    id: "char_004",
    char: "火",
    pinyin: "huǒ",
    pinyinTone: 3,
    radical: "火",
    strokeCount: 4,
    stage: 1,
    themeIsland: "forest",
    unitIndex: 1,
    levelIndex: 4,
    oracleGlyph: "",
    bronzeGlyph: "ψ",
    evolution: {
      story: "熊熊燃烧的火焰往上窜，中间是主火苗，两边是飞舞的小火星，这就是‘火’字的由来",
      oracleDesc: "火苗向上腾腾升起之形",
      bronzeDesc: "三簇火焰跃动，充满能量",
      sealDesc: "火星聚于中心，向上燃烧",
      modernDesc: "两点如火星，撇捺如主焰"
    },
    words: [
      { word: "火焰", pinyin: "huǒ yàn", desc: "燃烧时发出红亮光芒的火苗" },
      { word: "火车", pinyin: "huǒ chē", desc: "在铁轨上长长飞驰的列车" },
      { word: "红火", pinyin: "hóng huo", desc: "形容热闹兴旺充满生机" }
    ],
    sentence: "营火在夜里暖洋洋地燃烧着",
    gameConfig: {
      type: "whack_mole",
      title: "红火地鼠大探头",
      instruction: "当带有‘火’字的小地鼠探出头时，快快拍击它！",
      options: ["火", "人", "木", "天"],
      correctIndex: 0
    },
    strokes: [
      {
        name: "点",
        order: 1,
        path: "M 30,42 L 35,55",
        start: { x: 30, y: 42 },
        end: { x: 35, y: 55 }
      },
      {
        name: "短撇",
        order: 2,
        path: "M 70,42 L 65,55",
        start: { x: 70, y: 42 },
        end: { x: 65, y: 55 }
      },
      {
        name: "撇",
        order: 3,
        path: "M 50,22 Q 48,60 22,88",
        start: { x: 50, y: 22 },
        end: { x: 22, y: 88 }
      },
      {
        name: "捺",
        order: 4,
        path: "M 50,55 L 80,88",
        start: { x: 50, y: 55 },
        end: { x: 80, y: 88 }
      }
    ],
    confusingChars: ["人", "大", "木", "太"]
  },
  {
    id: "char_005",
    char: "山",
    pinyin: "shān",
    pinyinTone: 1,
    radical: "山",
    strokeCount: 3,
    stage: 1,
    themeIsland: "forest",
    unitIndex: 1,
    levelIndex: 5,
    oracleGlyph: "",
    bronzeGlyph: "",
    evolution: {
      story: "连绵起伏的山峰耸立在天地之间，中间一座最高，左右两座稍低，演变成了稳固的‘山’字",
      oracleDesc: "三座并排耸立的险峻山峰",
      bronzeDesc: "山峰轮廓分明，基座相连",
      sealDesc: "规整的三峰线条",
      modernDesc: "中竖高耸，竖折与右竖支撑"
    },
    words: [
      { word: "大山", pinyin: "dà shān", desc: "高大巍峨耸立的群山" },
      { word: "爬山", pinyin: "pá shān", desc: "攀登高山锻炼身体" },
      { word: "山水", pinyin: "shān shuǐ", desc: "美丽的大自然风光" }
    ],
    sentence: "高高的大山上长满了绿色的树木",
    gameConfig: {
      type: "balloon_pop",
      title: "飞跃群山热气球",
      instruction: "听发音，点击标有‘山’字的热气球飞上天空！",
      options: ["山", "出", "凶", "仙"],
      correctIndex: 0
    },
    strokes: [
      {
        name: "竖",
        order: 1,
        path: "M 50,20 L 50,85",
        start: { x: 50, y: 20 },
        end: { x: 50, y: 85 }
      },
      {
        name: "竖折",
        order: 2,
        path: "M 25,45 L 25,85 L 75,85",
        start: { x: 25, y: 45 },
        corner: { x: 25, y: 85 },
        end: { x: 75, y: 85 }
      },
      {
        name: "竖",
        order: 3,
        path: "M 75,45 L 75,85",
        start: { x: 75, y: 45 },
        end: { x: 75, y: 85 }
      }
    ],
    confusingChars: ["出", "凶", "幽", "岳"]
  },
  {
    id: "char_006",
    char: "木",
    pinyin: "mù",
    pinyinTone: 4,
    radical: "木",
    strokeCount: 4,
    stage: 1,
    themeIsland: "forest",
    unitIndex: 2,
    levelIndex: 6,
    oracleGlyph: "",
    bronzeGlyph: "",
    evolution: {
      story: "上面是树枝，中间是树干，下面是扎进泥土深处的树根，这就是大树的‘木’字",
      oracleDesc: "树干挺立，上有枝丫，下有根须",
      bronzeDesc: "枝繁叶茂，生机盎然",
      sealDesc: "主干分明，根基深厚",
      modernDesc: "横为枝干，竖为主柱，撇捺为根基"
    },
    words: [
      { word: "木头", pinyin: "mù tou", desc: "树木砍伐后制成的材料" },
      { word: "树木", pinyin: "shù mù", desc: "大自然中为我们提供氧气的树" },
      { word: "木屋", pinyin: "mù wū", desc: "森林里温馨舒适的木头房子" }
    ],
    sentence: "小松鼠在挺拔的树木间欢快跳跃",
    gameConfig: {
      type: "pick_fruit",
      title: "森林摘果子",
      instruction: "点击带有‘木’字的美味大苹果！",
      options: ["木", "本", "术", "禾"],
      correctIndex: 0
    },
    strokes: [
      {
        name: "横",
        order: 1,
        path: "M 20,40 L 80,40",
        start: { x: 20, y: 40 },
        end: { x: 80, y: 40 }
      },
      {
        name: "竖",
        order: 2,
        path: "M 50,18 L 50,88",
        start: { x: 50, y: 18 },
        end: { x: 50, y: 88 }
      },
      {
        name: "撇",
        order: 3,
        path: "M 50,40 Q 40,65 22,85",
        start: { x: 50, y: 40 },
        end: { x: 22, y: 85 }
      },
      {
        name: "捺",
        order: 4,
        path: "M 50,40 L 78,85",
        start: { x: 50, y: 40 },
        end: { x: 78, y: 85 }
      }
    ],
    confusingChars: ["本", "术", "禾", "未"]
  },
  {
    id: "char_007",
    char: "人",
    pinyin: "rén",
    pinyinTone: 2,
    radical: "人",
    strokeCount: 2,
    stage: 1,
    themeIsland: "forest",
    unitIndex: 2,
    levelIndex: 7,
    oracleGlyph: "𓀀",
    bronzeGlyph: "",
    oracleGlyph: "𓀀",
    bronzeGlyph: "",
    evolution: {
      story: "古人侧身站立，两腿迈开向前行走，用极简的两笔勾勒出人类顶天立地的形象",
      oracleDesc: "侧立行走的人体简笔",
      bronzeDesc: "身体微躬，富有动感",
      sealDesc: "双腿平稳站立",
      modernDesc: "一撇一捺，互相支撑"
    },
    words: [
      { word: "大人", pinyin: "dà ren", desc: "长大了有责任心的人" },
      { word: "人们", pinyin: "rén men", desc: "大家所有的人" },
      { word: "好人", pinyin: "hǎo rén", desc: "善良乐于助人的人" }
    ],
    sentence: "路上有许多快乐行走的人们",
    gameConfig: {
      type: "catch_butterfly",
      title: "小勇士集合啦",
      instruction: "找出标有‘人’字的小勇士伙伴！",
      options: ["人", "入", "八", "个"],
      correctIndex: 0
    },
    strokes: [
      {
        name: "撇",
        order: 1,
        path: "M 50,20 Q 45,60 22,88",
        start: { x: 50, y: 20 },
        end: { x: 22, y: 88 }
      },
      {
        name: "捺",
        order: 2,
        path: "M 42,48 L 78,88",
        start: { x: 42, y: 48 },
        end: { x: 78, y: 88 }
      }
    ],
    confusingChars: ["入", "八", "大", "个"]
  },
  {
    id: "char_008",
    char: "口",
    pinyin: "kǒu",
    pinyinTone: 3,
    radical: "口",
    strokeCount: 3,
    stage: 1,
    themeIsland: "forest",
    unitIndex: 2,
    levelIndex: 8,
    oracleGlyph: "",
    bronzeGlyph: "",
    oracleGlyph: "",
    bronzeGlyph: "",
    evolution: {
      story: "人张开嘴巴发出声音品尝美食的样子，画出来就是一个四方的方框",
      oracleDesc: "张开的人嘴之形",
      bronzeDesc: "圆角方框，生动逼真",
      sealDesc: "线条圆润，象征语言与进食",
      modernDesc: "端正方格，左竖横折底横"
    },
    words: [
      { word: "口渴", pinyin: "kǒu kě", desc: "想喝水时的身体感觉" },
      { word: "门口", pinyin: "mén kǒu", desc: "进出房间的通道" },
      { word: "开口", pinyin: "kāi kǒu", desc: "张开嘴说话" }
    ],
    sentence: "小鸟张开口唱出清脆动听的歌声",
    gameConfig: {
      type: "whack_mole",
      title: "大口吃汉堡",
      instruction: "击中带有‘口’字的美味能量汉堡！",
      options: ["口", "日", "中", "田"],
      correctIndex: 0
    },
    strokes: [
      {
        name: "竖",
        order: 1,
        path: "M 28,32 L 28,80",
        start: { x: 28, y: 32 },
        end: { x: 28, y: 80 }
      },
      {
        name: "横折",
        order: 2,
        path: "M 28,32 L 72,32 L 72,80",
        start: { x: 28, y: 32 },
        corner: { x: 72, y: 32 },
        end: { x: 72, y: 80 }
      },
      {
        name: "横",
        order: 3,
        path: "M 28,80 L 72,80",
        start: { x: 28, y: 80 },
        end: { x: 72, y: 80 }
      }
    ],
    confusingChars: ["日", "中", "田", "回"]
  },
  // ===== Stage 1 Unit 3-10: 扩充字库 =====
  {
    id: "char_009", char: "火", pinyin: "huǒ", pinyinTone: 3,
    oracleGlyph: "",
    bronzeGlyph: "ψ",
    radical: "火", strokeCount: 4, stage: 1, themeIsland: "forest",
    unitIndex: 3, levelIndex: 9,
    evolution: {
      story: "火的甲骨文像一堆燃烧的火苗，中间是主火，两侧是飞溅的火花后来变为上宽下窄的'火'字",
      oracleDesc: "像熊熊燃烧的火焰形状", bronzeDesc: "火苗轮廓逐渐规整", sealDesc: "四笔定形", modernDesc: "楷书四笔，撇捺对称"
    },
    words: [{ word: "火山", pinyin: "huǒ shān", desc: "喷发熔岩的大山" }, { word: "火车", pinyin: "huǒ chē", desc: "在铁路上行驶的交通工具" }, { word: "烟火", pinyin: "yān huǒ", desc: "节日里绽放的彩色焰火" }],
    sentence: "营地的火堆燃起来，大家围坐在一起唱歌",
    gameConfig: { type: "balloon_pop", title: "找火字气球", instruction: "请找出读音为'huǒ'的汉字气球！", options: ["火", "水", "木", "土"], correctIndex: 0 },
    strokes: [
      { name: "撇", order: 1, path: "M 50,20 Q 45,60 22,88", start: { x: 50, y: 20 }, end: { x: 22, y: 88 } },
      { name: "捺", order: 2, path: "M 42,48 L 78,88", start: { x: 42, y: 48 }, end: { x: 78, y: 88 } },
      { name: "点", order: 3, path: "M 28,55 L 33,68", start: { x: 28, y: 55 }, end: { x: 33, y: 68 } },
      { name: "点", order: 4, path: "M 72,55 L 67,68", start: { x: 72, y: 55 }, end: { x: 67, y: 68 } }
    ],
    confusingChars: ["水", "木", "大", "米"]
  },
  {
    id: "char_010", char: "水", pinyin: "shuǐ", pinyinTone: 3,
    oracleGlyph: "𝌀",
    bronzeGlyph: "氵",
    radical: "水", strokeCount: 4, stage: 1, themeIsland: "forest",
    unitIndex: 3, levelIndex: 10,
    evolution: {
      story: "水的甲骨文像流动的河水，中间一条主流，两边是小水波是最早的象形字之一",
      oracleDesc: "像流动的河水波纹", bronzeDesc: "线条更加流畅", sealDesc: "三道波纹定形", modernDesc: "竖钩加两点，代表水流"
    },
    words: [{ word: "水果", pinyin: "shuǐ guǒ", desc: "多汁甜美的植物果实" }, { word: "雨水", pinyin: "yǔ shuǐ", desc: "从天空降落的雨滴" }, { word: "水平", pinyin: "shuǐ píng", desc: "技术或能力的高低程度" }],
    sentence: "清澈的水从山上流下来，滋润了大地",
    gameConfig: { type: "balloon_pop", title: "找水字气球", instruction: "点击读音为'shuǐ'的气球！", options: ["水", "火", "气", "冰"], correctIndex: 0 },
    strokes: [
      { name: "竖钩", order: 1, path: "M 50,15 L 50,85 Q 45,88 40,80", start: { x: 50, y: 15 }, end: { x: 40, y: 80 } },
      { name: "点", order: 2, path: "M 28,35 L 35,48", start: { x: 28, y: 35 }, end: { x: 35, y: 48 } },
      { name: "点", order: 3, path: "M 26,65 L 35,75", start: { x: 26, y: 65 }, end: { x: 35, y: 75 } },
      { name: "点", order: 4, path: "M 72,35 L 65,48", start: { x: 72, y: 35 }, end: { x: 65, y: 48 } }
    ],
    confusingChars: ["火", "水", "木", "冰"]
  },
  {
    id: "char_011", char: "山", pinyin: "shān", pinyinTone: 1,
    oracleGlyph: "",
    bronzeGlyph: "",
    radical: "山", strokeCount: 3, stage: 1, themeIsland: "forest",
    unitIndex: 3, levelIndex: 11,
    evolution: {
      story: "山的甲骨文像三座连绵的山峰，中间高，两侧低，非常直观地表示了山的形状",
      oracleDesc: "像三座山峰的剪影", bronzeDesc: "山峰更加规整对称", sealDesc: "三竖相连", modernDesc: "竖折竖，三笔成形"
    },
    words: [{ word: "山水", pinyin: "shān shuǐ", desc: "山峦与流水，泛指美丽风景" }, { word: "火山", pinyin: "huǒ shān", desc: "会喷发的大山" }, { word: "山顶", pinyin: "shān dǐng", desc: "山的最高处" }],
    sentence: "远处的青山连绵起伏，美丽极了",
    gameConfig: { type: "balloon_pop", title: "找山字气球", instruction: "点击读音为'shān'的气球！", options: ["山", "出", "凸", "岩"], correctIndex: 0 },
    strokes: [
      { name: "竖", order: 1, path: "M 50,15 L 50,88", start: { x: 50, y: 15 }, end: { x: 50, y: 88 } },
      { name: "竖折", order: 2, path: "M 25,38 L 25,88 L 50,88", start: { x: 25, y: 38 }, corner: { x: 25, y: 88 }, end: { x: 50, y: 88 } },
      { name: "竖", order: 3, path: "M 75,38 L 75,88", start: { x: 75, y: 38 }, end: { x: 75, y: 88 } }
    ],
    confusingChars: ["出", "凸", "土", "岳"]
  },
  {
    id: "char_012", char: "云", pinyin: "yún", pinyinTone: 2,
    oracleGlyph: "",
    bronzeGlyph: "云",
    radical: "二", strokeCount: 4, stage: 1, themeIsland: "forest",
    unitIndex: 4, levelIndex: 12,
    evolution: {
      story: "云的甲骨文像天上飘动的云朵，上面两横代表天空，下面的弯线代表云朵的轮廓",
      oracleDesc: "像飘浮在天空的云朵", bronzeDesc: "轮廓更加规整", sealDesc: "二横加回字底", modernDesc: "上二横下转折，四笔完成"
    },
    words: [{ word: "白云", pinyin: "bái yún", desc: "天空中白色的云朵" }, { word: "云朵", pinyin: "yún duǒ", desc: "一朵朵飘浮的云" }, { word: "乌云", pinyin: "wū yún", desc: "下雨前黑色的云" }],
    sentence: "蓝天上飘着几朵洁白的云，像棉花糖一样",
    gameConfig: { type: "balloon_pop", title: "找云字气球", instruction: "点击读音为'yún'的气球！", options: ["云", "云", "气", "雨"], correctIndex: 0 },
    strokes: [
      { name: "横", order: 1, path: "M 20,25 L 80,25", start: { x: 20, y: 25 }, end: { x: 80, y: 25 } },
      { name: "横", order: 2, path: "M 28,40 L 72,40", start: { x: 28, y: 40 }, end: { x: 72, y: 40 } },
      { name: "撇", order: 3, path: "M 50,40 Q 42,65 28,82", start: { x: 50, y: 40 }, end: { x: 28, y: 82 } },
      { name: "横折", order: 4, path: "M 38,65 L 72,65 L 72,82", start: { x: 38, y: 65 }, corner: { x: 72, y: 65 }, end: { x: 72, y: 82 } }
    ],
    confusingChars: ["雨", "气", "天", "风"]
  },
  {
    id: "char_013", char: "风", pinyin: "fēng", pinyinTone: 1,
    oracleGlyph: "",
    bronzeGlyph: "凤",
    radical: "风", strokeCount: 4, stage: 1, themeIsland: "forest",
    unitIndex: 4, levelIndex: 13,
    evolution: {
      story: "风的古字像一只凤凰，古人认为凤凰展翅飞翔会产生风后来简化为现在的样子",
      oracleDesc: "像振翅高飞的凤凰", bronzeDesc: "逐渐简化为风形", sealDesc: "外框加撇", modernDesc: "横折弯钩加两撇"
    },
    words: [{ word: "风筝", pinyin: "fēng zhēng", desc: "在风中放飞的玩具" }, { word: "台风", pinyin: "tái fēng", desc: "强烈的热带风暴" }, { word: "微风", pinyin: "wēi fēng", desc: "轻柔的小风" }],
    sentence: "春天的微风轻轻地吹来，带来了花朵的香味",
    gameConfig: { type: "balloon_pop", title: "找风字气球", instruction: "点击读音为'fēng'的气球！", options: ["风", "虫", "凤", "飞"], correctIndex: 0 },
    strokes: [
      { name: "横折弯钩", order: 1, path: "M 20,20 L 80,20 L 80,85 Q 78,90 60,85", start: { x: 20, y: 20 }, corner: { x: 80, y: 20 }, end: { x: 60, y: 85 } },
      { name: "撇", order: 2, path: "M 20,20 L 15,88", start: { x: 20, y: 20 }, end: { x: 15, y: 88 } },
      { name: "撇", order: 3, path: "M 45,35 L 35,68", start: { x: 45, y: 35 }, end: { x: 35, y: 68 } },
      { name: "撇", order: 4, path: "M 60,50 L 48,80", start: { x: 60, y: 50 }, end: { x: 48, y: 80 } }
    ],
    confusingChars: ["虫", "凤", "飞", "气"]
  },
  {
    id: "char_014", char: "土", pinyin: "tǔ", pinyinTone: 3,
    oracleGlyph: "",
    bronzeGlyph: "士",
    radical: "土", strokeCount: 3, stage: 1, themeIsland: "forest",
    unitIndex: 4, levelIndex: 14,
    evolution: {
      story: "土的甲骨文像地面上堆起的一堆土，两横代表地面，中间一竖是土堆",
      oracleDesc: "像地面上堆起的土堆", bronzeDesc: "土堆形状更规整", sealDesc: "两横一竖", modernDesc: "楷书三笔：横竖横"
    },
    words: [{ word: "土地", pinyin: "tǔ dì", desc: "大地，田土" }, { word: "泥土", pinyin: "ní tǔ", desc: "湿润的土壤" }, { word: "土豆", pinyin: "tǔ dòu", desc: "生长在地下的食物" }],
    sentence: "农民伯伯在肥沃的土地上辛勤地耕种",
    gameConfig: { type: "balloon_pop", title: "找土字气球", instruction: "点击读音为'tǔ'的气球！", options: ["土", "士", "干", "工"], correctIndex: 0 },
    strokes: [
      { name: "横", order: 1, path: "M 25,45 L 75,45", start: { x: 25, y: 45 }, end: { x: 75, y: 45 } },
      { name: "竖", order: 2, path: "M 50,20 L 50,88", start: { x: 50, y: 20 }, end: { x: 50, y: 88 } },
      { name: "横", order: 3, path: "M 18,88 L 82,88", start: { x: 18, y: 88 }, end: { x: 82, y: 88 } }
    ],
    confusingChars: ["士", "干", "工", "王"]
  },
  {
    id: "char_015", char: "石", pinyin: "shí", pinyinTone: 2,
    oracleGlyph: "",
    bronzeGlyph: "石",
    radical: "石", strokeCount: 5, stage: 1, themeIsland: "forest",
    unitIndex: 4, levelIndex: 15,
    evolution: {
      story: "石的甲骨文像悬崖边突出的一块石头，上部是崖壁，下部是石块",
      oracleDesc: "像悬崖上突出的石块", bronzeDesc: "石头轮廓清晰化", sealDesc: "撇加口形", modernDesc: "撇折加口字底"
    },
    words: [{ word: "石头", pinyin: "shí tou", desc: "坚硬的矿石" }, { word: "钻石", pinyin: "zuàn shí", desc: "最坚硬闪亮的宝石" }, { word: "石桥", pinyin: "shí qiáo", desc: "用石头建造的桥" }],
    sentence: "河边有很多光滑的小石头，摸起来很舒服",
    gameConfig: { type: "balloon_pop", title: "找石字气球", instruction: "点击读音为'shí'的气球！", options: ["石", "右", "岩", "矿"], correctIndex: 0 },
    strokes: [
      { name: "横撇", order: 1, path: "M 20,22 L 65,22 L 42,50", start: { x: 20, y: 22 }, corner: { x: 65, y: 22 }, end: { x: 42, y: 50 } },
      { name: "竖", order: 2, path: "M 28,50 L 28,88", start: { x: 28, y: 50 }, end: { x: 28, y: 88 } },
      { name: "横折", order: 3, path: "M 28,50 L 72,50 L 72,88", start: { x: 28, y: 50 }, corner: { x: 72, y: 50 }, end: { x: 72, y: 88 } },
      { name: "横", order: 4, path: "M 28,70 L 72,70", start: { x: 28, y: 70 }, end: { x: 72, y: 70 } },
      { name: "横", order: 5, path: "M 28,88 L 72,88", start: { x: 28, y: 88 }, end: { x: 72, y: 88 } }
    ],
    confusingChars: ["右", "岩", "矿", "口"]
  },
  {
    id: "char_016", char: "上", pinyin: "shàng", pinyinTone: 4,
    oracleGlyph: "",
    bronzeGlyph: "丄",
    radical: "一", strokeCount: 3, stage: 1, themeIsland: "forest",
    unitIndex: 5, levelIndex: 16,
    evolution: {
      story: "上的甲骨文是在一条横线上方加一个短竖，表示在某物之上的位置关系",
      oracleDesc: "横线上方有一短竖，表示'上面'", bronzeDesc: "位置关系更清晰", sealDesc: "三笔定形", modernDesc: "竖横横，表示向上"
    },
    words: [{ word: "上面", pinyin: "shàng miàn", desc: "在某物的上方" }, { word: "上学", pinyin: "shàng xué", desc: "去学校读书" }, { word: "以上", pinyin: "yǐ shàng", desc: "在某个数量或范围之上" }],
    sentence: "小鸟飞到了树的上面，快乐地唱着歌",
    gameConfig: { type: "balloon_pop", title: "找上字气球", instruction: "点击读音为'shàng'的气球！", options: ["上", "下", "土", "止"], correctIndex: 0 },
    strokes: [
      { name: "竖", order: 1, path: "M 50,20 L 50,50", start: { x: 50, y: 20 }, end: { x: 50, y: 50 } },
      { name: "横", order: 2, path: "M 22,50 L 78,50", start: { x: 22, y: 50 }, end: { x: 78, y: 50 } },
      { name: "横", order: 3, path: "M 15,75 L 85,75", start: { x: 15, y: 75 }, end: { x: 85, y: 75 } }
    ],
    confusingChars: ["下", "土", "止", "工"]
  },
  {
    id: "char_017", char: "下", pinyin: "xià", pinyinTone: 4,
    oracleGlyph: "",
    bronzeGlyph: "丅",
    radical: "一", strokeCount: 3, stage: 1, themeIsland: "forest",
    unitIndex: 5, levelIndex: 17,
    evolution: {
      story: "下的甲骨文是在一条横线下方加一个短竖，表示在某物之下的位置关系，与'上'相对",
      oracleDesc: "横线下方有一短竖，表示'下面'", bronzeDesc: "位置关系明确", sealDesc: "三笔构成", modernDesc: "横竖点，表示向下"
    },
    words: [{ word: "下面", pinyin: "xià miàn", desc: "在某物的下方" }, { word: "下雨", pinyin: "xià yǔ", desc: "从天上落下雨水" }, { word: "地下", pinyin: "dì xià", desc: "大地的下方" }],
    sentence: "桌子下面藏着一只可爱的小猫咪",
    gameConfig: { type: "balloon_pop", title: "找下字气球", instruction: "点击读音为'xià'的气球！", options: ["下", "上", "不", "卞"], correctIndex: 0 },
    strokes: [
      { name: "横", order: 1, path: "M 15,30 L 85,30", start: { x: 15, y: 30 }, end: { x: 85, y: 30 } },
      { name: "竖", order: 2, path: "M 50,30 L 50,70", start: { x: 50, y: 30 }, end: { x: 50, y: 70 } },
      { name: "点", order: 3, path: "M 50,80 L 55,88", start: { x: 50, y: 80 }, end: { x: 55, y: 88 } }
    ],
    confusingChars: ["上", "不", "卞", "工"]
  },
  {
    id: "char_018", char: "左", pinyin: "zuǒ", pinyinTone: 3,
    oracleGlyph: "",
    bronzeGlyph: "左",
    radical: "工", strokeCount: 5, stage: 1, themeIsland: "forest",
    unitIndex: 5, levelIndex: 18,
    evolution: {
      story: "左的甲骨文像一只左手拿着工具，后来简化为撇加工字",
      oracleDesc: "像左手拿着工具", bronzeDesc: "工具形简化", sealDesc: "撇加工", modernDesc: "横撇加工字"
    },
    words: [{ word: "左边", pinyin: "zuǒ biān", desc: "朝左的那一侧" }, { word: "左手", pinyin: "zuǒ shǒu", desc: "人的左边那只手" }, { word: "左右", pinyin: "zuǒ yòu", desc: "左边和右边" }],
    sentence: "走进教室要靠右行，出来要靠左边走",
    gameConfig: { type: "balloon_pop", title: "找左字气球", instruction: "点击读音为'zuǒ'的气球！", options: ["左", "右", "在", "有"], correctIndex: 0 },
    strokes: [
      { name: "横", order: 1, path: "M 20,30 L 60,30", start: { x: 20, y: 30 }, end: { x: 60, y: 30 } },
      { name: "撇", order: 2, path: "M 45,20 Q 38,50 25,75", start: { x: 45, y: 20 }, end: { x: 25, y: 75 } },
      { name: "横", order: 3, path: "M 20,55 L 78,55", start: { x: 20, y: 55 }, end: { x: 78, y: 55 } },
      { name: "竖", order: 4, path: "M 50,55 L 50,88", start: { x: 50, y: 55 }, end: { x: 50, y: 88 } },
      { name: "横", order: 5, path: "M 20,88 L 80,88", start: { x: 20, y: 88 }, end: { x: 80, y: 88 } }
    ],
    confusingChars: ["右", "在", "有", "友"]
  },
  {
    id: "char_019", char: "右", pinyin: "yòu", pinyinTone: 4,
    oracleGlyph: "",
    bronzeGlyph: "右",
    radical: "口", strokeCount: 5, stage: 1, themeIsland: "forest",
    unitIndex: 5, levelIndex: 19,
    evolution: {
      story: "右的甲骨文像一只右手靠近嘴边，表示'帮助'，后来专门表示方向'右'",
      oracleDesc: "像右手靠近嘴边", bronzeDesc: "方向含义固定", sealDesc: "撇横加口", modernDesc: "横撇加口字底"
    },
    words: [{ word: "右边", pinyin: "yòu biān", desc: "朝右的那一侧" }, { word: "右手", pinyin: "yòu shǒu", desc: "人的右边那只手" }, { word: "左右", pinyin: "zuǒ yòu", desc: "左侧和右侧" }],
    sentence: "请把书本放在桌子的右边，铅笔放在左边",
    gameConfig: { type: "balloon_pop", title: "找右字气球", instruction: "点击读音为'yòu'的气球！", options: ["右", "左", "石", "又"], correctIndex: 0 },
    strokes: [
      { name: "横", order: 1, path: "M 20,30 L 62,30", start: { x: 20, y: 30 }, end: { x: 62, y: 30 } },
      { name: "撇", order: 2, path: "M 45,20 Q 55,42 65,55", start: { x: 45, y: 20 }, end: { x: 65, y: 55 } },
      { name: "竖", order: 3, path: "M 28,55 L 28,88", start: { x: 28, y: 55 }, end: { x: 28, y: 88 } },
      { name: "横折", order: 4, path: "M 28,55 L 72,55 L 72,88", start: { x: 28, y: 55 }, corner: { x: 72, y: 55 }, end: { x: 72, y: 88 } },
      { name: "横", order: 5, path: "M 28,88 L 72,88", start: { x: 28, y: 88 }, end: { x: 72, y: 88 } }
    ],
    confusingChars: ["左", "石", "又", "有"]
  },
  {
    id: "char_020", char: "中", pinyin: "zhōng", pinyinTone: 1,
    oracleGlyph: "",
    bronzeGlyph: "中",
    radical: "丨", strokeCount: 4, stage: 1, themeIsland: "forest",
    unitIndex: 6, levelIndex: 20,
    evolution: {
      story: "中的甲骨文像一根旗杆插在方框正中间，表示居中的位置，古代也用来表示氏族的旗帜",
      oracleDesc: "旗杆插在方框正中", bronzeDesc: "旗杆简化为竖", sealDesc: "口字加竖穿", modernDesc: "竖穿口字，表示中间"
    },
    words: [{ word: "中国", pinyin: "zhōng guó", desc: "我们伟大的祖国" }, { word: "中间", pinyin: "zhōng jiān", desc: "两者之间的位置" }, { word: "中午", pinyin: "zhōng wǔ", desc: "一天中正午的时候" }],
    sentence: "中国是我们伟大的祖国，我们都爱她",
    gameConfig: { type: "balloon_pop", title: "找中字气球", instruction: "点击读音为'zhōng'的气球！", options: ["中", "口", "日", "申"], correctIndex: 0 },
    strokes: [
      { name: "竖", order: 1, path: "M 50,15 L 50,88", start: { x: 50, y: 15 }, end: { x: 50, y: 88 } },
      { name: "横折", order: 2, path: "M 28,35 L 72,35 L 72,75", start: { x: 28, y: 35 }, corner: { x: 72, y: 35 }, end: { x: 72, y: 75 } },
      { name: "竖", order: 3, path: "M 28,35 L 28,75", start: { x: 28, y: 35 }, end: { x: 28, y: 75 } },
      { name: "横", order: 4, path: "M 28,75 L 72,75", start: { x: 28, y: 75 }, end: { x: 72, y: 75 } }
    ],
    confusingChars: ["口", "日", "申", "串"]
  },
  {
    id: "char_021", char: "天", pinyin: "tiān", pinyinTone: 1,
    oracleGlyph: "",
    bronzeGlyph: "天",
    radical: "大", strokeCount: 4, stage: 1, themeIsland: "forest",
    unitIndex: 6, levelIndex: 21,
    evolution: {
      story: "天的甲骨文是在一个人形头顶上加一横，表示头顶上方的天空",
      oracleDesc: "人头顶加横，表示头顶之上", bronzeDesc: "人形逐渐简化", sealDesc: "大字加顶横", modernDesc: "横加撇捺，四笔成天"
    },
    words: [{ word: "天空", pinyin: "tiān kōng", desc: "头顶上方的蓝色空间" }, { word: "天气", pinyin: "tiān qì", desc: "某一天的气候状况" }, { word: "今天", pinyin: "jīn tiān", desc: "当前这一天" }],
    sentence: "今天的天空蓝蓝的，飘着几朵白云，真美丽！",
    gameConfig: { type: "balloon_pop", title: "找天字气球", instruction: "点击读音为'tiān'的气球！", options: ["天", "大", "夫", "太"], correctIndex: 0 },
    strokes: [
      { name: "横", order: 1, path: "M 15,28 L 85,28", start: { x: 15, y: 28 }, end: { x: 85, y: 28 } },
      { name: "横", order: 2, path: "M 22,48 L 78,48", start: { x: 22, y: 48 }, end: { x: 78, y: 48 } },
      { name: "撇", order: 3, path: "M 50,48 Q 38,70 22,88", start: { x: 50, y: 48 }, end: { x: 22, y: 88 } },
      { name: "捺", order: 4, path: "M 50,48 L 78,88", start: { x: 50, y: 48 }, end: { x: 78, y: 88 } }
    ],
    confusingChars: ["大", "夫", "太", "文"]
  },
  {
    id: "char_022", char: "地", pinyin: "dì", pinyinTone: 4,
    oracleGlyph: "",
    bronzeGlyph: "地",
    radical: "土", strokeCount: 6, stage: 1, themeIsland: "forest",
    unitIndex: 6, levelIndex: 22,
    evolution: {
      story: "地字由土和也组成，土表示大地，也作声旁，是个形声字大地承载着万物",
      oracleDesc: "形声字，土旁加也", bronzeDesc: "部件逐渐固定", sealDesc: "左土右也", modernDesc: "六笔完成，左土右也"
    },
    words: [{ word: "大地", pinyin: "dà dì", desc: "广阔的土地" }, { word: "地球", pinyin: "dì qiú", desc: "我们居住的星球" }, { word: "土地", pinyin: "tǔ dì", desc: "耕种的田地" }],
    sentence: "大地是我们的母亲，她养育着世界上所有的生命",
    gameConfig: { type: "balloon_pop", title: "找地字气球", instruction: "点击读音为'dì'的气球！", options: ["地", "土", "坐", "场"], correctIndex: 0 },
    strokes: [
      { name: "横", order: 1, path: "M 8,45 L 40,45", start: { x: 8, y: 45 }, end: { x: 40, y: 45 } },
      { name: "竖", order: 2, path: "M 22,25 L 22,88", start: { x: 22, y: 25 }, end: { x: 22, y: 88 } },
      { name: "横", order: 3, path: "M 8,88 L 40,88", start: { x: 8, y: 88 }, end: { x: 40, y: 88 } },
      { name: "横折钩", order: 4, path: "M 52,28 L 88,28 L 88,78 Q 85,88 72,82", start: { x: 52, y: 28 }, corner: { x: 88, y: 28 }, end: { x: 72, y: 82 } },
      { name: "竖", order: 5, path: "M 52,28 L 52,88", start: { x: 52, y: 28 }, end: { x: 52, y: 88 } },
      { name: "点", order: 6, path: "M 65,55 L 70,68", start: { x: 65, y: 55 }, end: { x: 70, y: 68 } }
    ],
    confusingChars: ["土", "坐", "场", "在"]
  },
  {
    id: "char_023", char: "花", pinyin: "huā", pinyinTone: 1,
    oracleGlyph: "",
    bronzeGlyph: "华",
    radical: "艹", strokeCount: 7, stage: 1, themeIsland: "forest",
    unitIndex: 7, levelIndex: 23,
    evolution: {
      story: "花字由草字头和化组成，草字头表示植物，化作声旁，形声字花朵是植物最美丽的部分",
      oracleDesc: "植物开花的象形", bronzeDesc: "草字头加化", sealDesc: "形声结构稳定", modernDesc: "七笔完成，草字头加化"
    },
    words: [{ word: "花朵", pinyin: "huā duǒ", desc: "美丽的花" }, { word: "开花", pinyin: "kāi huā", desc: "花儿盛开" }, { word: "鲜花", pinyin: "xiān huā", desc: "新鲜美丽的花" }],
    sentence: "春天来了，园子里的花朵都开了，五颜六色真漂亮",
    gameConfig: { type: "balloon_pop", title: "找花字气球", instruction: "点击读音为'huā'的气球！", options: ["花", "草", "化", "华"], correctIndex: 0 },
    strokes: [
      { name: "横", order: 1, path: "M 15,18 L 45,18", start: { x: 15, y: 18 }, end: { x: 45, y: 18 } },
      { name: "竖", order: 2, path: "M 30,8 L 30,28", start: { x: 30, y: 8 }, end: { x: 30, y: 28 } },
      { name: "横", order: 3, path: "M 55,18 L 85,18", start: { x: 55, y: 18 }, end: { x: 85, y: 18 } },
      { name: "竖", order: 4, path: "M 70,8 L 70,28", start: { x: 70, y: 8 }, end: { x: 70, y: 28 } },
      { name: "撇", order: 5, path: "M 50,28 Q 42,55 28,78", start: { x: 50, y: 28 }, end: { x: 28, y: 78 } },
      { name: "竖弯钩", order: 6, path: "M 50,32 L 50,75 Q 52,85 65,78", start: { x: 50, y: 32 }, end: { x: 65, y: 78 } },
      { name: "点", order: 7, path: "M 68,45 L 75,58", start: { x: 68, y: 45 }, end: { x: 75, y: 58 } }
    ],
    confusingChars: ["草", "化", "华", "芳"]
  },
  {
    id: "char_024", char: "草", pinyin: "cǎo", pinyinTone: 3,
    oracleGlyph: "",
    bronzeGlyph: "艹",
    radical: "艹", strokeCount: 9, stage: 1, themeIsland: "forest",
    unitIndex: 7, levelIndex: 24,
    evolution: {
      story: "草字从草字头和早组成，表示早春时节生长的植物，形声字",
      oracleDesc: "像两株嫩草", bronzeDesc: "草字头加早", sealDesc: "九笔形声", modernDesc: "草字头加曰加十"
    },
    words: [{ word: "草地", pinyin: "cǎo dì", desc: "长满青草的地方" }, { word: "草原", pinyin: "cǎo yuán", desc: "广阔的草地平原" }, { word: "青草", pinyin: "qīng cǎo", desc: "绿色的嫩草" }],
    sentence: "小羊在绿油油的草地上快乐地吃草",
    gameConfig: { type: "balloon_pop", title: "找草字气球", instruction: "点击读音为'cǎo'的气球！", options: ["草", "花", "早", "苗"], correctIndex: 0 },
    strokes: [
      { name: "横", order: 1, path: "M 12,18 L 42,18", start: { x: 12, y: 18 }, end: { x: 42, y: 18 } },
      { name: "竖", order: 2, path: "M 27,8 L 27,28", start: { x: 27, y: 8 }, end: { x: 27, y: 28 } },
      { name: "横", order: 3, path: "M 58,18 L 88,18", start: { x: 58, y: 18 }, end: { x: 88, y: 18 } },
      { name: "竖", order: 4, path: "M 73,8 L 73,28", start: { x: 73, y: 8 }, end: { x: 73, y: 28 } },
      { name: "竖", order: 5, path: "M 50,28 L 50,48", start: { x: 50, y: 28 }, end: { x: 50, y: 48 } },
      { name: "横", order: 6, path: "M 28,48 L 72,48", start: { x: 28, y: 48 }, end: { x: 72, y: 48 } },
      { name: "横", order: 7, path: "M 28,65 L 72,65", start: { x: 28, y: 65 }, end: { x: 72, y: 65 } },
      { name: "竖", order: 8, path: "M 28,48 L 28,88", start: { x: 28, y: 48 }, end: { x: 28, y: 88 } },
      { name: "横", order: 9, path: "M 28,88 L 72,88", start: { x: 28, y: 88 }, end: { x: 72, y: 88 } }
    ],
    confusingChars: ["花", "早", "苗", "茶"]
  },
  {
    id: "char_025", char: "鸟", pinyin: "niǎo", pinyinTone: 3,
    oracleGlyph: "",
    bronzeGlyph: "鳥",
    radical: "鸟", strokeCount: 5, stage: 1, themeIsland: "forest",
    unitIndex: 7, levelIndex: 25,
    evolution: {
      story: "鸟的甲骨文是一只鸟的侧面画像，可以清晰看到鸟的头翅膀身体和尾巴",
      oracleDesc: "像一只展翅小鸟的侧面", bronzeDesc: "鸟形逐渐规整", sealDesc: "五笔鸟形", modernDesc: "竖折钩等五笔构成"
    },
    words: [{ word: "小鸟", pinyin: "xiǎo niǎo", desc: "体型小巧的鸟类" }, { word: "鸟巢", pinyin: "niǎo cháo", desc: "鸟搭建的家" }, { word: "飞鸟", pinyin: "fēi niǎo", desc: "在天空飞翔的鸟" }],
    sentence: "树上的小鸟叽叽喳喳地叫，好像在唱一首欢乐的歌",
    gameConfig: { type: "balloon_pop", title: "找鸟字气球", instruction: "点击读音为'niǎo'的气球！", options: ["鸟", "乌", "鱼", "马"], correctIndex: 0 },
    strokes: [
      { name: "撇", order: 1, path: "M 55,18 L 38,38", start: { x: 55, y: 18 }, end: { x: 38, y: 38 } },
      { name: "竖折钩", order: 2, path: "M 60,20 L 60,75 Q 58,82 50,78", start: { x: 60, y: 20 }, corner: { x: 60, y: 75 }, end: { x: 50, y: 78 } },
      { name: "点", order: 3, path: "M 42,48 L 48,58", start: { x: 42, y: 48 }, end: { x: 48, y: 58 } },
      { name: "横折", order: 4, path: "M 25,78 L 75,78 L 75,88", start: { x: 25, y: 78 }, corner: { x: 75, y: 78 }, end: { x: 75, y: 88 } },
      { name: "横", order: 5, path: "M 25,88 L 75,88", start: { x: 25, y: 88 }, end: { x: 75, y: 88 } }
    ],
    confusingChars: ["乌", "鱼", "马", "凤"]
  },
  {
    id: "char_026", char: "鱼", pinyin: "yú", pinyinTone: 2,
    oracleGlyph: "",
    bronzeGlyph: "魚",
    radical: "鱼", strokeCount: 8, stage: 1, themeIsland: "forest",
    unitIndex: 7, levelIndex: 26,
    evolution: {
      story: "鱼的甲骨文是一条鱼的象形，可以看到鱼头鱼身鱼鳍和鱼尾",
      oracleDesc: "像一条鱼的完整侧影", bronzeDesc: "鱼形逐渐线条化", sealDesc: "八笔鱼字", modernDesc: "竖加横折等八笔"
    },
    words: [{ word: "金鱼", pinyin: "jīn yú", desc: "颜色鲜艳的观赏鱼" }, { word: "鱼儿", pinyin: "yú ér", desc: "小鱼的爱称" }, { word: "鲸鱼", pinyin: "jīng yú", desc: "世界上最大的鱼类" }],
    sentence: "清澈的小河里，一条条小鱼游来游去，真可爱！",
    gameConfig: { type: "balloon_pop", title: "找鱼字气球", instruction: "点击读音为'yú'的气球！", options: ["鱼", "鸟", "虫", "龟"], correctIndex: 0 },
    strokes: [
      { name: "撇", order: 1, path: "M 50,12 L 35,30", start: { x: 50, y: 12 }, end: { x: 35, y: 30 } },
      { name: "竖", order: 2, path: "M 50,12 L 50,78", start: { x: 50, y: 12 }, end: { x: 50, y: 78 } },
      { name: "横折", order: 3, path: "M 28,30 L 72,30 L 72,55", start: { x: 28, y: 30 }, corner: { x: 72, y: 30 }, end: { x: 72, y: 55 } },
      { name: "竖", order: 4, path: "M 28,30 L 28,55", start: { x: 28, y: 30 }, end: { x: 28, y: 55 } },
      { name: "横", order: 5, path: "M 28,45 L 72,45", start: { x: 28, y: 45 }, end: { x: 72, y: 45 } },
      { name: "横", order: 6, path: "M 28,55 L 72,55", start: { x: 28, y: 55 }, end: { x: 72, y: 55 } },
      { name: "横折", order: 7, path: "M 20,78 L 80,78 L 80,88", start: { x: 20, y: 78 }, corner: { x: 80, y: 78 }, end: { x: 80, y: 88 } },
      { name: "横", order: 8, path: "M 20,88 L 80,88", start: { x: 20, y: 88 }, end: { x: 80, y: 88 } }
    ],
    confusingChars: ["鸟", "虫", "龟", "鲁"]
  },
  {
    id: "char_027", char: "虫", pinyin: "chóng", pinyinTone: 2,
    oracleGlyph: "",
    bronzeGlyph: "虫",
    radical: "虫", strokeCount: 6, stage: 1, themeIsland: "forest",
    unitIndex: 8, levelIndex: 27,
    evolution: {
      story: "虫的甲骨文像一条蛇的侧面，古时候蛇也叫虫，后来泛指各种小动物",
      oracleDesc: "像蛇头和弯曲的身体", bronzeDesc: "蛇形简化", sealDesc: "六笔虫形", modernDesc: "日加撇点竖弯"
    },
    words: [{ word: "昆虫", pinyin: "kūn chóng", desc: "身体有六条腿的小动物" }, { word: "毛虫", pinyin: "máo chóng", desc: "浑身是毛的毛毛虫" }, { word: "甲虫", pinyin: "jiǎ chóng", desc: "有硬壳的虫子" }],
    sentence: "草丛里住着很多小虫子，它们都是大自然的小居民",
    gameConfig: { type: "balloon_pop", title: "找虫字气球", instruction: "点击读音为'chóng'的气球！", options: ["虫", "鱼", "蛇", "龙"], correctIndex: 0 },
    strokes: [
      { name: "竖折", order: 1, path: "M 50,15 L 50,40 L 72,40", start: { x: 50, y: 15 }, corner: { x: 50, y: 40 }, end: { x: 72, y: 40 } },
      { name: "竖", order: 2, path: "M 28,15 L 28,40", start: { x: 28, y: 15 }, end: { x: 28, y: 40 } },
      { name: "横", order: 3, path: "M 28,40 L 72,40", start: { x: 28, y: 40 }, end: { x: 72, y: 40 } },
      { name: "竖弯钩", order: 4, path: "M 50,40 L 50,80 Q 52,90 65,82", start: { x: 50, y: 40 }, end: { x: 65, y: 82 } },
      { name: "点", order: 5, path: "M 30,55 L 36,65", start: { x: 30, y: 55 }, end: { x: 36, y: 65 } },
      { name: "点", order: 6, path: "M 65,55 L 70,68", start: { x: 65, y: 55 }, end: { x: 70, y: 68 } }
    ],
    confusingChars: ["鱼", "蛇", "龙", "豸"]
  },
  {
    id: "char_028", char: "马", pinyin: "mǎ", pinyinTone: 3,
    oracleGlyph: "",
    bronzeGlyph: "馬",
    radical: "马", strokeCount: 3, stage: 1, themeIsland: "forest",
    unitIndex: 8, levelIndex: 28,
    evolution: {
      story: "马的甲骨文是一匹马的侧面画像，可以看到马头鬃毛身体和四蹄简化字只保留了最核心的三笔",
      oracleDesc: "像一匹马的完整侧影", bronzeDesc: "马形线条化", sealDesc: "马字成形", modernDesc: "简化后三笔完成"
    },
    words: [{ word: "马路", pinyin: "mǎ lù", desc: "宽阔的道路" }, { word: "骑马", pinyin: "qí mǎ", desc: "骑在马背上" }, { word: "马车", pinyin: "mǎ chē", desc: "由马拉动的车" }],
    sentence: "草原上，一匹白马自由地奔跑着，英姿飒爽",
    gameConfig: { type: "balloon_pop", title: "找马字气球", instruction: "点击读音为'mǎ'的气球！", options: ["马", "鸟", "牛", "羊"], correctIndex: 0 },
    strokes: [
      { name: "横折钩", order: 1, path: "M 20,15 L 80,15 L 80,82 Q 78,90 68,85", start: { x: 20, y: 15 }, corner: { x: 80, y: 15 }, end: { x: 68, y: 85 } },
      { name: "横", order: 2, path: "M 22,45 L 78,45", start: { x: 22, y: 45 }, end: { x: 78, y: 45 } },
      { name: "点", order: 3, path: "M 42,60 L 48,72", start: { x: 42, y: 60 }, end: { x: 48, y: 72 } }
    ],
    confusingChars: ["鸟", "牛", "羊", "驴"]
  },
  {
    id: "char_029", char: "牛", pinyin: "niú", pinyinTone: 2,
    oracleGlyph: "",
    bronzeGlyph: "牛",
    radical: "牛", strokeCount: 4, stage: 1, themeIsland: "forest",
    unitIndex: 8, levelIndex: 29,
    evolution: {
      story: "牛的甲骨文是一头牛的正面头部，两侧是牛角，中间是牛鼻象形字",
      oracleDesc: "像牛头正面，两角突出", bronzeDesc: "牛头简化", sealDesc: "撇横加竖", modernDesc: "四笔牛字"
    },
    words: [{ word: "牛奶", pinyin: "niú nǎi", desc: "奶牛产出的营养饮品" }, { word: "牛角", pinyin: "niú jiǎo", desc: "牛头上的两个角" }, { word: "水牛", pinyin: "shuǐ niú", desc: "在水中生活的牛" }],
    sentence: "农场里有一头大黑牛，它每天帮农民伯伯耕地",
    gameConfig: { type: "balloon_pop", title: "找牛字气球", instruction: "点击读音为'niú'的气球！", options: ["牛", "午", "羊", "马"], correctIndex: 0 },
    strokes: [
      { name: "撇", order: 1, path: "M 55,18 L 35,38", start: { x: 55, y: 18 }, end: { x: 35, y: 38 } },
      { name: "横", order: 2, path: "M 18,38 L 82,38", start: { x: 18, y: 38 }, end: { x: 82, y: 38 } },
      { name: "横", order: 3, path: "M 22,60 L 78,60", start: { x: 22, y: 60 }, end: { x: 78, y: 60 } },
      { name: "竖", order: 4, path: "M 50,18 L 50,88", start: { x: 50, y: 18 }, end: { x: 50, y: 88 } }
    ],
    confusingChars: ["午", "羊", "马", "年"]
  },
  {
    id: "char_030", char: "羊", pinyin: "yáng", pinyinTone: 2,
    oracleGlyph: "",
    bronzeGlyph: "羊",
    radical: "羊", strokeCount: 6, stage: 1, themeIsland: "forest",
    unitIndex: 8, levelIndex: 30,
    evolution: {
      story: "羊的甲骨文是一只羊的正面头部，上面两个弯角，下面是羊脸象形字非常生动",
      oracleDesc: "像羊头正面，两角弯曲", bronzeDesc: "羊头规整化", sealDesc: "六笔成形", modernDesc: "撇横竖撇捺等六笔"
    },
    words: [{ word: "小羊", pinyin: "xiǎo yáng", desc: "年幼的小绵羊" }, { word: "山羊", pinyin: "shān yáng", desc: "生活在山地的羊" }, { word: "绵羊", pinyin: "mián yáng", desc: "身上有厚厚羊毛的羊" }],
    sentence: "一群白绵羊在草地上悠闲地吃草，像天上的白云",
    gameConfig: { type: "balloon_pop", title: "找羊字气球", instruction: "点击读音为'yáng'的气球！", options: ["羊", "牛", "美", "善"], correctIndex: 0 },
    strokes: [
      { name: "撇", order: 1, path: "M 38,18 L 25,40", start: { x: 38, y: 18 }, end: { x: 25, y: 40 } },
      { name: "捺", order: 2, path: "M 62,18 L 75,40", start: { x: 62, y: 18 }, end: { x: 75, y: 40 } },
      { name: "横", order: 3, path: "M 18,40 L 82,40", start: { x: 18, y: 40 }, end: { x: 82, y: 40 } },
      { name: "横", order: 4, path: "M 22,58 L 78,58", start: { x: 22, y: 58 }, end: { x: 78, y: 58 } },
      { name: "竖", order: 5, path: "M 50,18 L 50,58", start: { x: 50, y: 18 }, end: { x: 50, y: 58 } },
      { name: "竖", order: 6, path: "M 50,58 L 50,88", start: { x: 50, y: 58 }, end: { x: 50, y: 88 } }
    ],
    confusingChars: ["牛", "美", "善", "祥"]
  },
  {
    id: "char_031", char: "门", pinyin: "mén", pinyinTone: 2,
    oracleGlyph: "",
    bronzeGlyph: "門",
    radical: "门", strokeCount: 3, stage: 1, themeIsland: "forest",
    unitIndex: 9, levelIndex: 31,
    evolution: {
      story: "门的甲骨文就像两扇打开的木门，古代两扇叫门，单扇叫户",
      oracleDesc: "双扇门扉之形", bronzeDesc: "门框门轴分明", sealDesc: "繁体門字", modernDesc: "简化为点竖折横"
    },
    words: [{"word": "大门", "pinyin": "dà mén", "desc": "建筑物的主要出入口"}, {"word": "开门", "pinyin": "kāi mén", "desc": "把门打开"}, {"word": "门口", "pinyin": "mén kǒu", "desc": "门前的位置"}],
    sentence: "小明推开大门，高高兴兴地去学校上学。",
    gameConfig: {"type": "balloon_pop", "title": "找门字气球", "instruction": "点击读音为'mén'的气球！", "options": ["门", "问", "闪", "闭"], "correctIndex": 0},
    strokes: [
      { name: "点", order: 1, path: "M 25,25 L 32,38", start: {"x": 25, "y": 25}, end: {"x": 32, "y": 38} },
      { name: "竖", order: 2, path: "M 28,35 L 28,88", start: {"x": 28, "y": 35}, end: {"x": 28, "y": 88} },
      { name: "横折钩", order: 3, path: "M 28,35 L 75,35 L 75,85 L 68,80", start: {"x": 28, "y": 35}, end: {"x": 68, "y": 80}, corner: {"x": 75, "y": 35} }
    ],
    confusingChars: ["闪", "问", "闭", "间"]
  },
  {
    id: "char_032", char: "车", pinyin: "chē", pinyinTone: 1,
    oracleGlyph: "",
    bronzeGlyph: "車",
    radical: "车", strokeCount: 4, stage: 1, themeIsland: "forest",
    unitIndex: 9, levelIndex: 32,
    evolution: {
      story: "车的甲骨文是一辆有两个轮子、车厢和车轴的古代马车全貌",
      oracleDesc: "从上俯视的双轮马车", bronzeDesc: "突出车厢与车轮", sealDesc: "简化车舆轴线", modernDesc: "简化为横折撇横"
    },
    words: [{"word": "小车", "pinyin": "xiǎo chē", "desc": "小型的车辆或玩具车"}, {"word": "汽车", "pinyin": "qì chē", "desc": "用发动机驱动的车辆"}, {"word": "火车", "pinyin": "huǒ chē", "desc": "在铁轨上行驶的列车"}],
    sentence: "马路上有许多小汽车在有序地行驶。",
    gameConfig: {"type": "balloon_pop", "title": "找车字气球", "instruction": "点击读音为'chē'的气球！", "options": ["车", "东", "军", "连"], "correctIndex": 0},
    strokes: [
      { name: "横", order: 1, path: "M 20,28 L 80,28", start: {"x": 20, "y": 28}, end: {"x": 80, "y": 28} },
      { name: "撇折", order: 2, path: "M 48,28 L 26,55 L 75,55", start: {"x": 48, "y": 28}, end: {"x": 75, "y": 55}, corner: {"x": 26, "y": 55} },
      { name: "横", order: 3, path: "M 15,70 L 85,70", start: {"x": 15, "y": 70}, end: {"x": 85, "y": 70} },
      { name: "竖", order: 4, path: "M 50,15 L 50,90", start: {"x": 50, "y": 15}, end: {"x": 50, "y": 90} }
    ],
    confusingChars: ["东", "专", "连", "军"]
  },
  {
    id: "char_033", char: "手", pinyin: "shǒu", pinyinTone: 3,
    oracleGlyph: "",
    bronzeGlyph: "手",
    radical: "手", strokeCount: 4, stage: 1, themeIsland: "forest",
    unitIndex: 9, levelIndex: 33,
    evolution: {
      story: "手的甲骨文画的是人的五根手指和手掌伸展开的样子",
      oracleDesc: "五指伸展之形", bronzeDesc: "手掌手指规整", sealDesc: "线条流畅化", modernDesc: "撇两横弯钩"
    },
    words: [{"word": "小手", "pinyin": "xiǎo shǒu", "desc": "小朋友的手"}, {"word": "拍手", "pinyin": "pāi shǒu", "desc": "双手相互拍打发声"}, {"word": "动手", "pinyin": "dòng shǒu", "desc": "开始做事情"}],
    sentence: "小朋友们拍拍小手，唱着快乐的儿歌。",
    gameConfig: {"type": "balloon_pop", "title": "找手字气球", "instruction": "点击读音为'shǒu'的气球！", "options": ["手", "毛", "才", "牛"], "correctIndex": 0},
    strokes: [
      { name: "撇", order: 1, path: "M 65,22 L 32,32", start: {"x": 65, "y": 22}, end: {"x": 32, "y": 32} },
      { name: "横", order: 2, path: "M 22,46 L 78,46", start: {"x": 22, "y": 46}, end: {"x": 78, "y": 46} },
      { name: "横", order: 3, path: "M 15,62 L 85,62", start: {"x": 15, "y": 62}, end: {"x": 85, "y": 62} },
      { name: "弯钩", order: 4, path: "M 50,22 L 50,78 Q 50,90 38,88 L 32,82", start: {"x": 50, "y": 22}, end: {"x": 32, "y": 82} }
    ],
    confusingChars: ["毛", "牛", "才", "寸"]
  },
  {
    id: "char_034", char: "足", pinyin: "zú", pinyinTone: 2,
    oracleGlyph: "",
    bronzeGlyph: "足",
    radical: "足", strokeCount: 7, stage: 1, themeIsland: "forest",
    unitIndex: 9, levelIndex: 34,
    evolution: {
      story: "足的甲骨文上面是一个膝盖骨或脚踝，下面是一只脚板",
      oracleDesc: "脚踝与脚掌相连", bronzeDesc: "上方渐变为口字", sealDesc: "上口下止形", modernDesc: "上口下走止"
    },
    words: [{"word": "足球", "pinyin": "zú qiú", "desc": "用脚踢的球类运动"}, {"word": "手足", "pinyin": "shǒu zú", "desc": "手和脚，也比喻兄弟"}, {"word": "知足", "pinyin": "zhī zú", "desc": "懂得满足开心"}],
    sentence: "我们在操场上开心地踢足球比赛。",
    gameConfig: {"type": "balloon_pop", "title": "找足字气球", "instruction": "点击读音为'zú'的气球！", "options": ["足", "是", "走", "定"], "correctIndex": 0},
    strokes: [
      { name: "竖", order: 1, path: "M 32,20 L 32,45", start: {"x": 32, "y": 20}, end: {"x": 32, "y": 45} },
      { name: "横折", order: 2, path: "M 32,20 L 68,20 L 68,45", start: {"x": 32, "y": 20}, end: {"x": 68, "y": 45}, corner: {"x": 68, "y": 20} },
      { name: "横", order: 3, path: "M 32,45 L 68,45", start: {"x": 32, "y": 45}, end: {"x": 68, "y": 45} },
      { name: "竖", order: 4, path: "M 50,45 L 50,68", start: {"x": 50, "y": 45}, end: {"x": 50, "y": 68} },
      { name: "横", order: 5, path: "M 35,68 L 65,68", start: {"x": 35, "y": 68}, end: {"x": 65, "y": 68} },
      { name: "撇", order: 6, path: "M 42,68 L 22,88", start: {"x": 42, "y": 68}, end: {"x": 22, "y": 88} },
      { name: "捺", order: 7, path: "M 55,68 L 85,88", start: {"x": 55, "y": 68}, end: {"x": 85, "y": 88} }
    ],
    confusingChars: ["是", "走", "定", "罡"]
  },
  {
    id: "char_035", char: "目", pinyin: "mù", pinyinTone: 4,
    oracleGlyph: "",
    bronzeGlyph: "目",
    radical: "目", strokeCount: 5, stage: 1, themeIsland: "forest",
    unitIndex: 9, levelIndex: 35,
    evolution: {
      story: "目的甲骨文是一只睁开的眼睛，外框是眼眶，中间是眼珠",
      oracleDesc: "横置的眼睛形状", bronzeDesc: "逐渐竖立变方", sealDesc: "长方形双横眼珠", modernDesc: "标准的五画目字"
    },
    words: [{"word": "目光", "pinyin": "mù guāng", "desc": "眼睛看东西的光彩视线"}, {"word": "头目", "pinyin": "tóu mù", "desc": "首领领头人"}, {"word": "目不转睛", "pinyin": "mù bù zhuǎn jīng", "desc": "注意力非常集中"}],
    sentence: "同学们目不转睛地看着老师做科学实验。",
    gameConfig: {"type": "balloon_pop", "title": "找目字气球", "instruction": "点击读音为'mù'的气球！", "options": ["目", "日", "自", "且"], "correctIndex": 0},
    strokes: [
      { name: "竖", order: 1, path: "M 28,18 L 28,85", start: {"x": 28, "y": 18}, end: {"x": 28, "y": 85} },
      { name: "横折", order: 2, path: "M 28,18 L 72,18 L 72,85", start: {"x": 28, "y": 18}, end: {"x": 72, "y": 85}, corner: {"x": 72, "y": 18} },
      { name: "横", order: 3, path: "M 28,40 L 72,40", start: {"x": 28, "y": 40}, end: {"x": 72, "y": 40} },
      { name: "横", order: 4, path: "M 28,62 L 72,62", start: {"x": 28, "y": 62}, end: {"x": 72, "y": 62} },
      { name: "横", order: 5, path: "M 28,85 L 72,85", start: {"x": 28, "y": 85}, end: {"x": 72, "y": 85} }
    ],
    confusingChars: ["日", "自", "且", "白"]
  },
  {
    id: "char_036", char: "耳", pinyin: "ěr", pinyinTone: 3,
    oracleGlyph: "",
    bronzeGlyph: "耳",
    radical: "耳", strokeCount: 6, stage: 1, themeIsland: "forest",
    unitIndex: 9, levelIndex: 36,
    evolution: {
      story: "耳的甲骨文是人耳朵的侧面轮廓，画出了耳轮、耳垂和耳道",
      oracleDesc: "耳朵侧面轮廓", bronzeDesc: "线条方正化", sealDesc: "曲直规整", modernDesc: "六画方正耳字"
    },
    words: [{"word": "耳朵", "pinyin": "ěr duo", "desc": "听声音的感觉器官"}, {"word": "木耳", "pinyin": "mù ěr", "desc": "一种食用菌类"}, {"word": "耳边", "pinyin": "ěr biān", "desc": "耳朵旁边"}],
    sentence: "小兔子的两只长耳朵动来动去，十分灵敏。",
    gameConfig: {"type": "balloon_pop", "title": "找耳字气球", "instruction": "点击读音为'ěr'的气球！", "options": ["耳", "且", "身", "目"], "correctIndex": 0},
    strokes: [
      { name: "横", order: 1, path: "M 22,25 L 78,25", start: {"x": 22, "y": 25}, end: {"x": 78, "y": 25} },
      { name: "竖", order: 2, path: "M 38,25 L 38,80", start: {"x": 38, "y": 25}, end: {"x": 38, "y": 80} },
      { name: "横", order: 3, path: "M 38,45 L 65,45", start: {"x": 38, "y": 45}, end: {"x": 65, "y": 45} },
      { name: "横", order: 4, path: "M 38,62 L 65,62", start: {"x": 38, "y": 62}, end: {"x": 65, "y": 62} },
      { name: "竖", order: 5, path: "M 65,25 L 65,88", start: {"x": 65, "y": 25}, end: {"x": 65, "y": 88} },
      { name: "提", order: 6, path: "M 20,82 L 80,72", start: {"x": 20, "y": 82}, end: {"x": 80, "y": 72} }
    ],
    confusingChars: ["且", "目", "由", "田"]
  },
  {
    id: "char_037", char: "心", pinyin: "xīn", pinyinTone: 1,
    oracleGlyph: "",
    bronzeGlyph: "心",
    radical: "心", strokeCount: 4, stage: 1, themeIsland: "forest",
    unitIndex: 10, levelIndex: 37,
    evolution: {
      story: "心的甲骨文画的是人的心脏形状，中间有心室心房的象形",
      oracleDesc: "心脏轮廓与内室", bronzeDesc: "更加对称化", sealDesc: "三弯心室成形", modernDesc: "点卧钩点点"
    },
    words: [{"word": "开心", "pinyin": "kāi xīn", "desc": "心情快乐舒畅"}, {"word": "用心", "pinyin": "yòng xīn", "desc": "专心认真做好一件事"}, {"word": "爱心", "pinyin": "ài xīn", "desc": "关爱他人的温暖心意"}],
    sentence: "老师夸奖小华是一个非常有爱心和用心的好学生。",
    gameConfig: {"type": "balloon_pop", "title": "找心字气球", "instruction": "点击读音为'xīn'的气球！", "options": ["心", "必", "沁", "态"], "correctIndex": 0},
    strokes: [
      { name: "点", order: 1, path: "M 25,48 L 22,58", start: {"x": 25, "y": 48}, end: {"x": 22, "y": 58} },
      { name: "卧钩", order: 2, path: "M 32,55 Q 52,88 75,80 L 78,65", start: {"x": 32, "y": 55}, end: {"x": 78, "y": 65} },
      { name: "点", order: 3, path: "M 48,42 L 50,52", start: {"x": 48, "y": 42}, end: {"x": 50, "y": 52} },
      { name: "点", order: 4, path: "M 75,40 L 78,50", start: {"x": 75, "y": 40}, end: {"x": 78, "y": 50} }
    ],
    confusingChars: ["必", "沁", "志", "思"]
  },
  {
    id: "char_038", char: "头", pinyin: "tóu", pinyinTone: 2,
    oracleGlyph: "",
    bronzeGlyph: "頁",
    radical: "大", strokeCount: 5, stage: 1, themeIsland: "forest",
    unitIndex: 10, levelIndex: 38,
    evolution: {
      story: "头的繁体字是頁，古代画的是一个人大大的脑袋和头发",
      oracleDesc: "凸显头颅与长发", bronzeDesc: "简化面部与颈", sealDesc: "頁字形体", modernDesc: "简化为两点一横撇捺"
    },
    words: [{"word": "头发", "pinyin": "tóu fa", "desc": "长在头上的毛发"}, {"word": "低头", "pinyin": "dī tóu", "desc": "把头低下来"}, {"word": "头脑", "pinyin": "tóu nǎo", "desc": "思考问题的脑袋"}],
    sentence: "小明遇到难题时动脑筋，很快想出了好办法。",
    gameConfig: {"type": "balloon_pop", "title": "找头字气球", "instruction": "点击读音为'tóu'的气球！", "options": ["头", "买", "太", "大"], "correctIndex": 0},
    strokes: [
      { name: "点", order: 1, path: "M 32,22 L 35,32", start: {"x": 32, "y": 22}, end: {"x": 35, "y": 32} },
      { name: "点", order: 2, path: "M 65,22 L 68,32", start: {"x": 65, "y": 22}, end: {"x": 68, "y": 32} },
      { name: "横", order: 3, path: "M 18,45 L 82,45", start: {"x": 18, "y": 45}, end: {"x": 82, "y": 45} },
      { name: "撇", order: 4, path: "M 50,45 L 20,88", start: {"x": 50, "y": 45}, end: {"x": 20, "y": 88} },
      { name: "点", order: 5, path: "M 62,58 L 78,78", start: {"x": 62, "y": 58}, end: {"x": 78, "y": 78} }
    ],
    confusingChars: ["买", "太", "大", "犬"]
  },
  {
    id: "char_039", char: "父", pinyin: "fù", pinyinTone: 4,
    oracleGlyph: "",
    bronzeGlyph: "父",
    radical: "父", strokeCount: 4, stage: 1, themeIsland: "forest",
    unitIndex: 10, levelIndex: 39,
    evolution: {
      story: "父的甲骨文是一只手里握着石斧或木杖，象征带领全家劳动的父亲",
      oracleDesc: "右手持石斧劳动", bronzeDesc: "手形与斧杆分明", sealDesc: "交叉结构成形", modernDesc: "撇点撇捺"
    },
    words: [{"word": "父母", "pinyin": "fù mǔ", "desc": "爸爸和妈妈"}, {"word": "父亲", "pinyin": "fù qīn", "desc": "爸爸的尊称"}, {"word": "父子", "pinyin": "fù zǐ", "desc": "父亲和儿子"}],
    sentence: "我们要尊敬和孝敬辛苦抚养我们的父母亲。",
    gameConfig: {"type": "balloon_pop", "title": "找父字气球", "instruction": "点击读音为'fù'的气球！", "options": ["父", "交", "文", "爷"], "correctIndex": 0},
    strokes: [
      { name: "撇", order: 1, path: "M 42,20 L 26,42", start: {"x": 42, "y": 20}, end: {"x": 26, "y": 42} },
      { name: "点", order: 2, path: "M 58,20 L 74,42", start: {"x": 58, "y": 20}, end: {"x": 74, "y": 42} },
      { name: "撇", order: 3, path: "M 65,42 L 20,88", start: {"x": 65, "y": 42}, end: {"x": 20, "y": 88} },
      { name: "捺", order: 4, path: "M 35,42 L 80,88", start: {"x": 35, "y": 42}, end: {"x": 80, "y": 88} }
    ],
    confusingChars: ["文", "交", "爷", "爸"]
  },
  {
    id: "char_040", char: "母", pinyin: "mǔ", pinyinTone: 3,
    oracleGlyph: "",
    bronzeGlyph: "母",
    radical: "母", strokeCount: 5, stage: 1, themeIsland: "forest",
    unitIndex: 10, levelIndex: 40,
    evolution: {
      story: "母的甲骨文是在女字胸前加上两点，象征哺育婴儿的伟大母亲",
      oracleDesc: "女子胸前加两点象征乳汁", bronzeDesc: "形体更丰满", sealDesc: "两点与框架结合", modernDesc: "折折点横点"
    },
    words: [{"word": "母亲", "pinyin": "mǔ qīn", "desc": "妈妈的尊称"}, {"word": "母爱", "pinyin": "mǔ ài", "desc": "母亲对子女无私的爱"}, {"word": "字母", "pinyin": "zì mǔ", "desc": "拼音或语言的组成符号"}],
    sentence: "母亲的爱像温暖的阳光，照耀着我们快乐成长。",
    gameConfig: {"type": "balloon_pop", "title": "找母字气球", "instruction": "点击读音为'mǔ'的气球！", "options": ["母", "女", "舟", "每"], "correctIndex": 0},
    strokes: [
      { name: "竖折", order: 1, path: "M 35,18 L 35,78 L 75,78", start: {"x": 35, "y": 18}, end: {"x": 75, "y": 78}, corner: {"x": 35, "y": 78} },
      { name: "横折钩", order: 2, path: "M 35,28 L 70,28 L 70,85 L 60,82", start: {"x": 35, "y": 28}, end: {"x": 60, "y": 82}, corner: {"x": 70, "y": 28} },
      { name: "点", order: 3, path: "M 48,38 L 50,45", start: {"x": 48, "y": 38}, end: {"x": 50, "y": 45} },
      { name: "横", order: 4, path: "M 15,52 L 85,52", start: {"x": 15, "y": 52}, end: {"x": 85, "y": 52} },
      { name: "点", order: 5, path: "M 48,60 L 50,68", start: {"x": 48, "y": 60}, end: {"x": 50, "y": 68} }
    ],
    confusingChars: ["女", "每", "舟", "丹"]
  },
  {
    id: "char_041", char: "子", pinyin: "zǐ", pinyinTone: 3,
    oracleGlyph: "",
    bronzeGlyph: "子",
    radical: "子", strokeCount: 3, stage: 1, themeIsland: "forest",
    unitIndex: 11, levelIndex: 41,
    evolution: {
      story: "子的甲骨文是一个襁褓中的婴儿，大大的头，两只小手在挥动",
      oracleDesc: "大头双臂挥舞的婴儿", bronzeDesc: "下身包裹如一足", sealDesc: "横钩撇折成形", modernDesc: "横撇弯钩横三笔"
    },
    words: [{"word": "儿子", "pinyin": "ér zi", "desc": "父母的男孩"}, {"word": "孩子", "pinyin": "hái zi", "desc": "儿童小朋友"}, {"word": "日子", "pinyin": "rì zi", "desc": "每一天的时光生活"}],
    sentence: "小鸟妈妈给可爱的鸟孩子们带回了美味的食物。",
    gameConfig: {"type": "balloon_pop", "title": "找子字气球", "instruction": "点击读音为'zǐ'的气球！", "options": ["子", "了", "孔", "孙"], "correctIndex": 0},
    strokes: [
      { name: "横撇", order: 1, path: "M 32,30 L 68,30 L 40,55", start: {"x": 32, "y": 30}, end: {"x": 40, "y": 55}, corner: {"x": 68, "y": 30} },
      { name: "弯钩", order: 2, path: "M 40,55 Q 55,75 52,88 L 42,82", start: {"x": 40, "y": 55}, end: {"x": 42, "y": 82} },
      { name: "横", order: 3, path: "M 15,55 L 85,55", start: {"x": 15, "y": 55}, end: {"x": 85, "y": 55} }
    ],
    confusingChars: ["了", "孔", "孙", "字"]
  },
  {
    id: "char_042", char: "弟", pinyin: "dì", pinyinTone: 4,
    oracleGlyph: "",
    bronzeGlyph: "弟",
    radical: "弓", strokeCount: 7, stage: 1, themeIsland: "forest",
    unitIndex: 11, levelIndex: 42,
    evolution: {
      story: "弟的甲骨文是一根木棍上缠绕着皮绳，表示有次序地缠束，引申为年纪小的弟弟",
      oracleDesc: "绳索缠绕在木桩上", bronzeDesc: "上下结构分明", sealDesc: "弓字缠绕形", modernDesc: "点撇横折横竖折撇竖"
    },
    words: [{"word": "弟弟", "pinyin": "dì di", "desc": "同辈中年纪比自己小的男性"}, {"word": "兄弟", "pinyin": "xiōng dì", "desc": "哥哥和弟弟"}, {"word": "弟子", "pinyin": "dì zǐ", "desc": "学生徒弟"}],
    sentence: "哥哥带着弟弟在草地上一起开心地放风筝。",
    gameConfig: {"type": "balloon_pop", "title": "找弟字气球", "instruction": "点击读音为'dì'的气球！", "options": ["弟", "第", "梯", "递"], "correctIndex": 0},
    strokes: [
      { name: "点", order: 1, path: "M 40,15 L 42,25", start: {"x": 40, "y": 15}, end: {"x": 42, "y": 25} },
      { name: "撇", order: 2, path: "M 62,15 L 55,25", start: {"x": 62, "y": 15}, end: {"x": 55, "y": 25} },
      { name: "横折", order: 3, path: "M 28,35 L 72,35 L 72,50", start: {"x": 28, "y": 35}, end: {"x": 72, "y": 50}, corner: {"x": 72, "y": 35} },
      { name: "横", order: 4, path: "M 28,50 L 72,50", start: {"x": 28, "y": 50}, end: {"x": 72, "y": 50} },
      { name: "竖折", order: 5, path: "M 28,50 L 28,68 L 75,68", start: {"x": 28, "y": 50}, end: {"x": 75, "y": 68}, corner: {"x": 28, "y": 68} },
      { name: "竖", order: 6, path: "M 50,35 L 50,90", start: {"x": 50, "y": 35}, end: {"x": 50, "y": 90} },
      { name: "撇", order: 7, path: "M 42,68 L 20,88", start: {"x": 42, "y": 68}, end: {"x": 20, "y": 88} }
    ],
    confusingChars: ["第", "递", "梯", "弓"]
  },
  {
    id: "char_043", char: "姐", pinyin: "jiě", pinyinTone: 3,
    oracleGlyph: "",
    bronzeGlyph: "姉",
    radical: "女", strokeCount: 8, stage: 1, themeIsland: "forest",
    unitIndex: 11, levelIndex: 43,
    evolution: {
      story: "姐由女和且组成，且是祖先牌位的象征，表示尊贵的女性长辈，后指姐姐",
      oracleDesc: "女旁配且字", bronzeDesc: "左右结构对称", sealDesc: "女且合体", modernDesc: "标准的左右结构姐"
    },
    words: [{"word": "姐姐", "pinyin": "jiě jie", "desc": "同辈中比自己年长的女性"}, {"word": "大姐", "pinyin": "dà jiě", "desc": "年纪最大的姐姐"}, {"word": "姐妹", "pinyin": "jiě mèi", "desc": "姐姐和妹妹"}],
    sentence: "姐姐耐心地辅导妹妹画出一幅美丽的图画。",
    gameConfig: {"type": "balloon_pop", "title": "找姐字气球", "instruction": "点击读音为'jiě'的气球！", "options": ["姐", "妹", "妈", "姑"], "correctIndex": 0},
    strokes: [
      { name: "撇点", order: 1, path: "M 32,25 L 20,55 L 40,70", start: {"x": 32, "y": 25}, end: {"x": 40, "y": 70}, corner: {"x": 20, "y": 55} },
      { name: "撇", order: 2, path: "M 38,35 L 18,85", start: {"x": 38, "y": 35}, end: {"x": 18, "y": 85} },
      { name: "提", order: 3, path: "M 12,55 L 45,45", start: {"x": 12, "y": 55}, end: {"x": 45, "y": 45} },
      { name: "竖", order: 4, path: "M 55,20 L 55,80", start: {"x": 55, "y": 20}, end: {"x": 55, "y": 80} },
      { name: "横折", order: 5, path: "M 55,20 L 82,20 L 82,80", start: {"x": 55, "y": 20}, end: {"x": 82, "y": 80}, corner: {"x": 82, "y": 20} },
      { name: "横", order: 6, path: "M 55,40 L 82,40", start: {"x": 55, "y": 40}, end: {"x": 82, "y": 40} },
      { name: "横", order: 7, path: "M 55,60 L 82,60", start: {"x": 55, "y": 60}, end: {"x": 82, "y": 60} },
      { name: "横", order: 8, path: "M 48,80 L 88,80", start: {"x": 48, "y": 80}, end: {"x": 88, "y": 80} }
    ],
    confusingChars: ["妹", "且", "妈", "姑"]
  },
  {
    id: "char_044", char: "妹", pinyin: "mèi", pinyinTone: 4,
    oracleGlyph: "",
    bronzeGlyph: "妹",
    radical: "女", strokeCount: 8, stage: 1, themeIsland: "forest",
    unitIndex: 11, levelIndex: 44,
    evolution: {
      story: "妹由女和未组成，未代表草木初生萌芽娇小，引申为年幼的小妹妹",
      oracleDesc: "女字配未木萌芽", bronzeDesc: "左右分立", sealDesc: "左右匀称", modernDesc: "女字旁加未"
    },
    words: [{"word": "妹妹", "pinyin": "mèi mei", "desc": "同辈中年纪比自己小的女性"}, {"word": "小妹", "pinyin": "xiǎo mèi", "desc": "年幼可爱的小妹妹"}, {"word": "兄妹", "pinyin": "xiōng mèi", "desc": "哥哥和妹妹"}],
    sentence: "小妹妹跳着优美的舞蹈，脸上洋溢着灿烂的笑容。",
    gameConfig: {"type": "balloon_pop", "title": "找妹字气球", "instruction": "点击读音为'mèi'的气球！", "options": ["妹", "姐", "味", "抹"], "correctIndex": 0},
    strokes: [
      { name: "撇点", order: 1, path: "M 32,25 L 20,55 L 40,70", start: {"x": 32, "y": 25}, end: {"x": 40, "y": 70}, corner: {"x": 20, "y": 55} },
      { name: "撇", order: 2, path: "M 38,35 L 18,85", start: {"x": 38, "y": 35}, end: {"x": 18, "y": 85} },
      { name: "提", order: 3, path: "M 12,55 L 45,45", start: {"x": 12, "y": 55}, end: {"x": 45, "y": 45} },
      { name: "横", order: 4, path: "M 55,30 L 82,30", start: {"x": 55, "y": 30}, end: {"x": 82, "y": 30} },
      { name: "横", order: 5, path: "M 48,48 L 88,48", start: {"x": 48, "y": 48}, end: {"x": 88, "y": 48} },
      { name: "竖", order: 6, path: "M 68,18 L 68,88", start: {"x": 68, "y": 18}, end: {"x": 68, "y": 88} },
      { name: "撇", order: 7, path: "M 68,48 L 50,85", start: {"x": 68, "y": 48}, end: {"x": 50, "y": 85} },
      { name: "捺", order: 8, path: "M 68,48 L 88,85", start: {"x": 68, "y": 48}, end: {"x": 88, "y": 85} }
    ],
    confusingChars: ["味", "抹", "姐", "未"]
  },
  {
    id: "char_045", char: "朋", pinyin: "péng", pinyinTone: 2,
    oracleGlyph: "",
    bronzeGlyph: "朋",
    radical: "月", strokeCount: 8, stage: 1, themeIsland: "forest",
    unitIndex: 12, levelIndex: 45,
    evolution: {
      story: "朋的甲骨文是两串系在一起的贝壳玉石，古代五贝为一串，两串为一朋，引申为亲密的朋友",
      oracleDesc: "两串并列的贝壳货币", bronzeDesc: "贝串对称", sealDesc: "演变为双月并立", modernDesc: "两个月字并排"
    },
    words: [{"word": "朋友", "pinyin": "péng you", "desc": "互相友好、情谊深厚的人"}, {"word": "小朋友", "pinyin": "xiǎo péng you", "desc": "对儿童的亲切称呼"}, {"word": "朋党", "pinyin": "péng dǎng", "desc": "聚集在一起的人群"}],
    sentence: "我和凯茜是最亲密、互相帮助的好朋友。",
    gameConfig: {"type": "balloon_pop", "title": "找朋字气球", "instruction": "点击读音为'péng'的气球！", "options": ["朋", "月", "明", "棚"], "correctIndex": 0},
    strokes: [
      { name: "撇", order: 1, path: "M 28,18 L 22,88", start: {"x": 28, "y": 18}, end: {"x": 22, "y": 88} },
      { name: "横折钩", order: 2, path: "M 28,18 L 45,18 L 45,85 L 38,80", start: {"x": 28, "y": 18}, end: {"x": 38, "y": 80}, corner: {"x": 45, "y": 18} },
      { name: "横", order: 3, path: "M 28,40 L 45,40", start: {"x": 28, "y": 40}, end: {"x": 45, "y": 40} },
      { name: "横", order: 4, path: "M 28,60 L 45,60", start: {"x": 28, "y": 60}, end: {"x": 45, "y": 60} },
      { name: "撇", order: 5, path: "M 65,18 L 58,88", start: {"x": 65, "y": 18}, end: {"x": 58, "y": 88} },
      { name: "横折钩", order: 6, path: "M 65,18 L 82,18 L 82,85 L 75,80", start: {"x": 65, "y": 18}, end: {"x": 75, "y": 80}, corner: {"x": 82, "y": 18} },
      { name: "横", order: 7, path: "M 65,40 L 82,40", start: {"x": 65, "y": 40}, end: {"x": 82, "y": 40} },
      { name: "横", order: 8, path: "M 65,60 L 82,60", start: {"x": 65, "y": 60}, end: {"x": 82, "y": 60} }
    ],
    confusingChars: ["明", "月", "胖", "棚"]
  },
  {
    id: "char_046", char: "友", pinyin: "yǒu", pinyinTone: 3,
    oracleGlyph: "",
    bronzeGlyph: "友",
    radical: "又", strokeCount: 4, stage: 1, themeIsland: "forest",
    unitIndex: 12, levelIndex: 46,
    evolution: {
      story: "友的甲骨文是两只向同一个方向握在一起的右手，象征同心协力携手并进",
      oracleDesc: "两只相叠握持的右手", bronzeDesc: "手形上下交错", sealDesc: "双手相交成形", modernDesc: "横撇又"
    },
    words: [{"word": "友好", "pinyin": "yǒu hǎo", "desc": "亲近和睦有善意"}, {"word": "友人", "pinyin": "yǒu rén", "desc": "朋友同学"}, {"word": "队友", "pinyin": "duì yǒu", "desc": "同一个团队里的伙伴"}],
    sentence: "我们班的同学们团结友好，互相鼓励。",
    gameConfig: {"type": "balloon_pop", "title": "找友字气球", "instruction": "点击读音为'yǒu'的气球！", "options": ["友", "反", "发", "支"], "correctIndex": 0},
    strokes: [
      { name: "横", order: 1, path: "M 20,28 L 80,28", start: {"x": 20, "y": 28}, end: {"x": 80, "y": 28} },
      { name: "撇", order: 2, path: "M 50,28 L 22,88", start: {"x": 50, "y": 28}, end: {"x": 22, "y": 88} },
      { name: "横撇", order: 3, path: "M 32,50 L 68,50 L 45,72", start: {"x": 32, "y": 50}, end: {"x": 45, "y": 72}, corner: {"x": 68, "y": 50} },
      { name: "捺", order: 4, path: "M 38,55 L 82,88", start: {"x": 38, "y": 55}, end: {"x": 82, "y": 88} }
    ],
    confusingChars: ["反", "发", "支", "右"]
  },
  {
    id: "char_047", char: "学", pinyin: "xué", pinyinTone: 2,
    oracleGlyph: "",
    bronzeGlyph: "學",
    radical: "子", strokeCount: 8, stage: 1, themeIsland: "forest",
    unitIndex: 12, levelIndex: 47,
    evolution: {
      story: "学的甲骨文上面是两只手拿着算筹在房屋里启发教育孩童，象征求知与启蒙",
      oracleDesc: "双手执筹在屋中教子", bronzeDesc: "突出学堂屋顶", sealDesc: "繁体學字", modernDesc: "简化为三点秃宝盖加子"
    },
    words: [{"word": "学习", "pinyin": "xué xí", "desc": "通过阅读练习获取知识"}, {"word": "学校", "pinyin": "xué xiào", "desc": "专门读书受教育的地方"}, {"word": "学生", "pinyin": "xué shēng", "desc": "在学校读书求学的人"}],
    sentence: "我们在凯茜识字的世界里快乐地学习汉字文化。",
    gameConfig: {"type": "balloon_pop", "title": "找学字气球", "instruction": "点击读音为'xué'的气球！", "options": ["学", "字", "孝", "季"], "correctIndex": 0},
    strokes: [
      { name: "点", order: 1, path: "M 28,18 L 32,28", start: {"x": 28, "y": 18}, end: {"x": 32, "y": 28} },
      { name: "点", order: 2, path: "M 50,15 L 50,25", start: {"x": 50, "y": 15}, end: {"x": 50, "y": 25} },
      { name: "撇", order: 3, path: "M 75,18 L 68,28", start: {"x": 75, "y": 18}, end: {"x": 68, "y": 28} },
      { name: "点", order: 4, path: "M 22,35 L 25,42", start: {"x": 22, "y": 35}, end: {"x": 25, "y": 42} },
      { name: "横撇", order: 5, path: "M 25,38 L 78,38 L 70,48", start: {"x": 25, "y": 38}, end: {"x": 70, "y": 48}, corner: {"x": 78, "y": 38} },
      { name: "横撇", order: 6, path: "M 38,55 L 65,55 L 45,70", start: {"x": 38, "y": 55}, end: {"x": 45, "y": 70}, corner: {"x": 65, "y": 55} },
      { name: "弯钩", order: 7, path: "M 45,70 Q 55,85 52,95 L 42,90", start: {"x": 45, "y": 70}, end: {"x": 42, "y": 90} },
      { name: "横", order: 8, path: "M 20,72 L 80,72", start: {"x": 20, "y": 72}, end: {"x": 80, "y": 72} }
    ],
    confusingChars: ["字", "孝", "季", "存"]
  },
  {
    id: "char_048", char: "好", pinyin: "hǎo", pinyinTone: 3,
    oracleGlyph: "",
    bronzeGlyph: "好",
    radical: "女", strokeCount: 6, stage: 1, themeIsland: "forest",
    unitIndex: 12, levelIndex: 48,
    evolution: {
      story: "好的甲骨文是女子怀抱喜爱自己的孩子，象征美好、相亲相爱",
      oracleDesc: "女子抱子相亲相爱", bronzeDesc: "女子并立成形", sealDesc: "左右结构匀称", modernDesc: "女字旁加子"
    },
    words: [{"word": "好看", "pinyin": "hǎo kàn", "desc": "美丽生动看着舒服"}, {"word": "好人", "pinyin": "hǎo rén", "desc": "品质优良善良的人"}, {"word": "好听", "pinyin": "hǎo tīng", "desc": "声音优美动听"}],
    sentence: "今天天气晴朗，我们全家度过了美好快乐的一天。",
    gameConfig: {"type": "balloon_pop", "title": "找好字气球", "instruction": "点击读音为'hǎo'的气球！", "options": ["好", "如", "妈", "妙"], "correctIndex": 0},
    strokes: [
      { name: "撇点", order: 1, path: "M 32,25 L 18,55 L 38,72", start: {"x": 32, "y": 25}, end: {"x": 38, "y": 72}, corner: {"x": 18, "y": 55} },
      { name: "撇", order: 2, path: "M 38,32 L 15,85", start: {"x": 38, "y": 32}, end: {"x": 15, "y": 85} },
      { name: "提", order: 3, path: "M 10,55 L 42,48", start: {"x": 10, "y": 55}, end: {"x": 42, "y": 48} },
      { name: "横撇", order: 4, path: "M 52,32 L 80,32 L 60,52", start: {"x": 52, "y": 32}, end: {"x": 60, "y": 52}, corner: {"x": 80, "y": 32} },
      { name: "弯钩", order: 5, path: "M 60,52 Q 72,75 70,88 L 58,82", start: {"x": 60, "y": 52}, end: {"x": 58, "y": 82} },
      { name: "横", order: 6, path: "M 45,55 L 88,55", start: {"x": 45, "y": 55}, end: {"x": 88, "y": 55} }
    ],
    confusingChars: ["如", "妈", "妙", "奸"]
  },
  {
    id: "char_049", char: "来", pinyin: "lái", pinyinTone: 2,
    oracleGlyph: "",
    bronzeGlyph: "來",
    radical: "木", strokeCount: 7, stage: 1, themeIsland: "forest",
    unitIndex: 13, levelIndex: 49,
    evolution: {
      story: "来的甲骨文是一株结满沉甸甸麦穗的小麦，古代麦由天降，引申为到来、过来",
      oracleDesc: "一株垂穗的麦子", bronzeDesc: "麦穗与麦芒清晰", sealDesc: "繁体來字", modernDesc: "横点撇横竖撇捺七笔"
    },
    words: [{"word": "来到", "pinyin": "lái dào", "desc": "到达某一个地方"}, {"word": "进来", "pinyin": "jìn lái", "desc": "从外面进入到里面"}, {"word": "未来", "pinyin": "wèi lái", "desc": "将要发生的时间与世界"}],
    sentence: "欢迎新同学来到充满智慧的识字城堡！",
    gameConfig: {"type": "balloon_pop", "title": "找来字气球", "instruction": "点击读音为'lái'的气球！", "options": ["来", "未", "夹", "米"], "correctIndex": 0},
    strokes: [
      { name: "横", order: 1, path: "M 25,25 L 75,25", start: {"x": 25, "y": 25}, end: {"x": 75, "y": 25} },
      { name: "点", order: 2, path: "M 32,38 L 35,48", start: {"x": 32, "y": 38}, end: {"x": 35, "y": 48} },
      { name: "撇", order: 3, path: "M 68,38 L 65,48", start: {"x": 68, "y": 38}, end: {"x": 65, "y": 48} },
      { name: "横", order: 4, path: "M 15,55 L 85,55", start: {"x": 15, "y": 55}, end: {"x": 85, "y": 55} },
      { name: "竖", order: 5, path: "M 50,15 L 50,88", start: {"x": 50, "y": 15}, end: {"x": 50, "y": 88} },
      { name: "撇", order: 6, path: "M 50,55 L 22,88", start: {"x": 50, "y": 55}, end: {"x": 22, "y": 88} },
      { name: "捺", order: 7, path: "M 50,55 L 78,88", start: {"x": 50, "y": 55}, end: {"x": 78, "y": 88} }
    ],
    confusingChars: ["未", "末", "米", "夹"]
  },
  {
    id: "char_050", char: "去", pinyin: "qù", pinyinTone: 4,
    oracleGlyph: "",
    bronzeGlyph: "去",
    radical: "厶", strokeCount: 5, stage: 1, themeIsland: "forest",
    unitIndex: 13, levelIndex: 50,
    evolution: {
      story: "去的甲骨文上面是一个人，下面是一个洞穴开口，表示人离开洞穴向外走去",
      oracleDesc: "人从洞穴向外走出", bronzeDesc: "上方渐变土字", sealDesc: "上土下厶形", modernDesc: "横竖横撇折点五笔"
    },
    words: [{"word": "回去", "pinyin": "huí qù", "desc": "回到原来的地方"}, {"word": "过去", "pinyin": "guò qù", "desc": "已经逝去的时间"}, {"word": "出去", "pinyin": "chū qù", "desc": "从里面走到外面"}],
    sentence: "放学了，小朋友们高高兴兴地走出校门回家去。",
    gameConfig: {"type": "balloon_pop", "title": "找去字气球", "instruction": "点击读音为'qù'的气球！", "options": ["去", "丢", "法", "支"], "correctIndex": 0},
    strokes: [
      { name: "横", order: 1, path: "M 28,25 L 72,25", start: {"x": 28, "y": 25}, end: {"x": 72, "y": 25} },
      { name: "竖", order: 2, path: "M 50,15 L 50,45", start: {"x": 50, "y": 15}, end: {"x": 50, "y": 45} },
      { name: "横", order: 3, path: "M 15,45 L 85,45", start: {"x": 15, "y": 45}, end: {"x": 85, "y": 45} },
      { name: "撇折", order: 4, path: "M 45,45 L 25,80 L 80,80", start: {"x": 45, "y": 45}, end: {"x": 80, "y": 80}, corner: {"x": 25, "y": 80} },
      { name: "点", order: 5, path: "M 65,58 L 75,72", start: {"x": 65, "y": 58}, end: {"x": 75, "y": 72} }
    ],
    confusingChars: ["丢", "法", "云", "支"]
  }
,
{
  "id": "char_051",
  "char": "春",
  "pinyin": "chūn",
  "pinyinTone": 1,
  "oracleGlyph": "",
  "bronzeGlyph": "春",
  "radical": "日",
  "strokeCount": 9,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 14,
  "levelIndex": 51,
  "evolution": {
    "story": "春的甲骨文像草木萌芽、阳光普照，象征春回大地，万物复苏",
    "oracleDesc": "草木萌发沐浴阳光",
    "bronzeDesc": "屯草与日字相合",
    "sealDesc": "三横撇捺配日字",
    "modernDesc": "三横一撇一捺一日九笔"
  },
  "words": [
    {
      "word": "春天",
      "pinyin": "chūn tiān",
      "desc": "四季之首温暖的季节"
    },
    {
      "word": "春风",
      "pinyin": "chūn fēng",
      "desc": "春天温暖和煦的风"
    },
    {
      "word": "立春",
      "pinyin": "lì chūn",
      "desc": "春季开始的节气"
    }
  ],
  "sentence": "温暖的春天来到了，花儿朵朵盛开，小鸟在枝头唱歌。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找春字气球",
    "instruction": "点击读音为'chūn'的气球！",
    "options": [
      "春",
      "日",
      "天",
      "草"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 28,25 L 72,25",
      "start": {
        "x": 28,
        "y": 25
      },
      "end": {
        "x": 72,
        "y": 25
      }
    },
    {
      "name": "横",
      "order": 2,
      "path": "M 32,35 L 68,35",
      "start": {
        "x": 32,
        "y": 35
      },
      "end": {
        "x": 68,
        "y": 35
      }
    },
    {
      "name": "横",
      "order": 3,
      "path": "M 18,45 L 82,45",
      "start": {
        "x": 18,
        "y": 45
      },
      "end": {
        "x": 82,
        "y": 45
      }
    },
    {
      "name": "撇",
      "order": 4,
      "path": "M 50,15 L 20,70",
      "start": {
        "x": 50,
        "y": 15
      },
      "end": {
        "x": 20,
        "y": 70
      }
    },
    {
      "name": "捺",
      "order": 5,
      "path": "M 48,45 L 82,70",
      "start": {
        "x": 48,
        "y": 45
      },
      "end": {
        "x": 82,
        "y": 70
      }
    },
    {
      "name": "竖",
      "order": 6,
      "path": "M 35,58 L 35,88",
      "start": {
        "x": 35,
        "y": 58
      },
      "end": {
        "x": 35,
        "y": 88
      }
    },
    {
      "name": "横折",
      "order": 7,
      "path": "M 35,58 L 65,58 L 65,88",
      "start": {
        "x": 35,
        "y": 58
      },
      "end": {
        "x": 65,
        "y": 88
      },
      "corner": {
        "x": 65,
        "y": 58
      }
    },
    {
      "name": "横",
      "order": 8,
      "path": "M 35,72 L 65,72",
      "start": {
        "x": 35,
        "y": 72
      },
      "end": {
        "x": 65,
        "y": 72
      }
    },
    {
      "name": "横",
      "order": 9,
      "path": "M 35,88 L 65,88",
      "start": {
        "x": 35,
        "y": 88
      },
      "end": {
        "x": 65,
        "y": 88
      }
    }
  ],
  "confusingChars": [
    "看",
    "青",
    "香",
    "泰"
  ]
},
{
  "id": "char_052",
  "char": "夏",
  "pinyin": "xià",
  "pinyinTone": 4,
  "oracleGlyph": "",
  "bronzeGlyph": "夏",
  "radical": "夂",
  "strokeCount": 10,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 14,
  "levelIndex": 52,
  "evolution": {
    "story": "夏的甲骨文像一个手舞足蹈、头戴盛冠的人在欢庆盛夏丰收",
    "oracleDesc": "头戴盛冠起舞的人",
    "bronzeDesc": "大头双手双足分明",
    "sealDesc": "上百下夂相连",
    "modernDesc": "横竖横折横横撇横撇捺十笔"
  },
  "words": [
    {
      "word": "夏天",
      "pinyin": "xià tiān",
      "desc": "阳光炽热草木繁茂的季节"
    },
    {
      "word": "立夏",
      "pinyin": "lì xià",
      "desc": "夏季开始的节气"
    },
    {
      "word": "盛夏",
      "pinyin": "shèng xià",
      "desc": "炎热夏天的最顶峰"
    }
  ],
  "sentence": "炎热的夏天，小朋友们在树荫下吃冰甜的大西瓜。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找夏字气球",
    "instruction": "点击读音为'xià'的气球！",
    "options": [
      "夏",
      "复",
      "冬",
      "秋"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 25,20 L 75,20",
      "start": {
        "x": 25,
        "y": 20
      },
      "end": {
        "x": 75,
        "y": 20
      }
    },
    {
      "name": "竖",
      "order": 2,
      "path": "M 35,20 L 35,48",
      "start": {
        "x": 35,
        "y": 20
      },
      "end": {
        "x": 35,
        "y": 48
      }
    },
    {
      "name": "横折",
      "order": 3,
      "path": "M 35,28 L 68,28 L 68,48",
      "start": {
        "x": 35,
        "y": 28
      },
      "end": {
        "x": 68,
        "y": 48
      },
      "corner": {
        "x": 68,
        "y": 28
      }
    },
    {
      "name": "横",
      "order": 4,
      "path": "M 35,38 L 68,38",
      "start": {
        "x": 35,
        "y": 38
      },
      "end": {
        "x": 68,
        "y": 38
      }
    },
    {
      "name": "横",
      "order": 5,
      "path": "M 35,48 L 68,48",
      "start": {
        "x": 35,
        "y": 48
      },
      "end": {
        "x": 68,
        "y": 48
      }
    },
    {
      "name": "撇",
      "order": 6,
      "path": "M 40,48 L 18,70",
      "start": {
        "x": 40,
        "y": 48
      },
      "end": {
        "x": 18,
        "y": 70
      }
    },
    {
      "name": "横撇",
      "order": 7,
      "path": "M 35,62 L 72,62 L 45,78",
      "start": {
        "x": 35,
        "y": 62
      },
      "end": {
        "x": 45,
        "y": 78
      },
      "corner": {
        "x": 72,
        "y": 62
      }
    },
    {
      "name": "捺",
      "order": 8,
      "path": "M 45,65 L 82,90",
      "start": {
        "x": 45,
        "y": 65
      },
      "end": {
        "x": 82,
        "y": 90
      }
    }
  ],
  "confusingChars": [
    "复",
    "冬",
    "秋",
    "自"
  ]
},
{
  "id": "char_053",
  "char": "秋",
  "pinyin": "qiū",
  "pinyinTone": 1,
  "oracleGlyph": "",
  "bronzeGlyph": "秋",
  "radical": "禾",
  "strokeCount": 9,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 14,
  "levelIndex": 53,
  "evolution": {
    "story": "秋由禾和火组成，代表庄稼成熟金黄，到了秋收烤谷的时节",
    "oracleDesc": "禾苗与蟋蟀昆虫",
    "bronzeDesc": "左禾右火成形",
    "sealDesc": "禾火左右平分",
    "modernDesc": "左禾右火九笔"
  },
  "words": [
    {
      "word": "秋天",
      "pinyin": "qiū tiān",
      "desc": "金风送爽瓜果飘香的季节"
    },
    {
      "word": "秋风",
      "pinyin": "qiū fēng",
      "desc": "秋季凉爽的风"
    },
    {
      "word": "秋收",
      "pinyin": "qiū shōu",
      "desc": "秋季收获成熟的庄稼"
    }
  ],
  "sentence": "美丽的秋天到了，树叶变黄了，果园里挂满了红苹果。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找秋字气球",
    "instruction": "点击读音为'qiū'的气球！",
    "options": [
      "秋",
      "禾",
      "和",
      "火"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "撇",
      "order": 1,
      "path": "M 38,18 L 18,28",
      "start": {
        "x": 38,
        "y": 18
      },
      "end": {
        "x": 18,
        "y": 28
      }
    },
    {
      "name": "横",
      "order": 2,
      "path": "M 12,42 L 48,42",
      "start": {
        "x": 12,
        "y": 42
      },
      "end": {
        "x": 48,
        "y": 42
      }
    },
    {
      "name": "竖",
      "order": 3,
      "path": "M 30,22 L 30,85",
      "start": {
        "x": 30,
        "y": 22
      },
      "end": {
        "x": 30,
        "y": 85
      }
    },
    {
      "name": "撇",
      "order": 4,
      "path": "M 30,42 L 12,65",
      "start": {
        "x": 30,
        "y": 42
      },
      "end": {
        "x": 12,
        "y": 65
      }
    },
    {
      "name": "点",
      "order": 5,
      "path": "M 30,45 L 45,60",
      "start": {
        "x": 30,
        "y": 45
      },
      "end": {
        "x": 45,
        "y": 60
      }
    },
    {
      "name": "点",
      "order": 6,
      "path": "M 58,35 L 52,48",
      "start": {
        "x": 58,
        "y": 35
      },
      "end": {
        "x": 52,
        "y": 48
      }
    },
    {
      "name": "撇",
      "order": 7,
      "path": "M 82,30 L 72,48",
      "start": {
        "x": 82,
        "y": 30
      },
      "end": {
        "x": 72,
        "y": 48
      }
    },
    {
      "name": "撇",
      "order": 8,
      "path": "M 68,22 L 52,88",
      "start": {
        "x": 68,
        "y": 22
      },
      "end": {
        "x": 52,
        "y": 88
      }
    },
    {
      "name": "捺",
      "order": 9,
      "path": "M 68,52 L 88,88",
      "start": {
        "x": 68,
        "y": 52
      },
      "end": {
        "x": 88,
        "y": 88
      }
    }
  ],
  "confusingChars": [
    "和",
    "种",
    "伙",
    "禾"
  ]
},
{
  "id": "char_054",
  "char": "冬",
  "pinyin": "dōng",
  "pinyinTone": 1,
  "oracleGlyph": "",
  "bronzeGlyph": "冬",
  "radical": "夂",
  "strokeCount": 5,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 14,
  "levelIndex": 54,
  "evolution": {
    "story": "冬的甲骨文像一根绳子的末端打着结，表示一年的终点与寒冬",
    "oracleDesc": "绳索末端系结",
    "bronzeDesc": "上下相连终结",
    "sealDesc": "夂字配冰点",
    "modernDesc": "撇横撇捺点点五笔"
  },
  "words": [
    {
      "word": "冬天",
      "pinyin": "dōng tiān",
      "desc": "下雪结冰寒冷的季节"
    },
    {
      "word": "冬眠",
      "pinyin": "dōng mián",
      "desc": "动物在冬天睡觉休眠"
    },
    {
      "word": "立冬",
      "pinyin": "lì dōng",
      "desc": "冬季开始的节气"
    }
  ],
  "sentence": "白茫茫的冬天来了，小朋友们在雪地上开心地堆雪人。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找冬字气球",
    "instruction": "点击读音为'dōng'的气球！",
    "options": [
      "冬",
      "终",
      "东",
      "条"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "撇",
      "order": 1,
      "path": "M 48,15 L 28,35",
      "start": {
        "x": 48,
        "y": 15
      },
      "end": {
        "x": 28,
        "y": 35
      }
    },
    {
      "name": "横撇",
      "order": 2,
      "path": "M 28,35 L 75,35 L 42,58",
      "start": {
        "x": 28,
        "y": 35
      },
      "end": {
        "x": 42,
        "y": 58
      },
      "corner": {
        "x": 75,
        "y": 35
      }
    },
    {
      "name": "捺",
      "order": 3,
      "path": "M 40,40 L 80,68",
      "start": {
        "x": 40,
        "y": 40
      },
      "end": {
        "x": 80,
        "y": 68
      }
    },
    {
      "name": "点",
      "order": 4,
      "path": "M 42,72 L 45,80",
      "start": {
        "x": 42,
        "y": 72
      },
      "end": {
        "x": 45,
        "y": 80
      }
    },
    {
      "name": "点",
      "order": 5,
      "path": "M 58,78 L 62,88",
      "start": {
        "x": 58,
        "y": 78
      },
      "end": {
        "x": 62,
        "y": 88
      }
    }
  ],
  "confusingChars": [
    "东",
    "处",
    "条",
    "终"
  ]
},
{
  "id": "char_055",
  "char": "红",
  "pinyin": "hóng",
  "pinyinTone": 2,
  "oracleGlyph": "",
  "bronzeGlyph": "红",
  "radical": "纟",
  "strokeCount": 6,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 14,
  "levelIndex": 55,
  "evolution": {
    "story": "红由纟和工组成，纟代表丝线，古代用赤色染丝称作红",
    "oracleDesc": "丝线染色之状",
    "bronzeDesc": "纟工左右分明",
    "sealDesc": "繁体紅字",
    "modernDesc": "绞丝工字六笔"
  },
  "words": [
    {
      "word": "红色",
      "pinyin": "hóng sè",
      "desc": "鲜艳如火的颜色"
    },
    {
      "word": "红花",
      "pinyin": "hóng huā",
      "desc": "红色的花朵"
    },
    {
      "word": "红日",
      "pinyin": "hóng rì",
      "desc": "升起的红太阳"
    }
  ],
  "sentence": "小红戴着鲜艳的红领巾，高高兴兴去上学。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找红字气球",
    "instruction": "点击读音为'hóng'的气球！",
    "options": [
      "红",
      "江",
      "级",
      "绿"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "撇折",
      "order": 1,
      "path": "M 30,20 L 18,42 L 35,42",
      "start": {
        "x": 30,
        "y": 20
      },
      "end": {
        "x": 35,
        "y": 42
      },
      "corner": {
        "x": 18,
        "y": 42
      }
    },
    {
      "name": "撇折",
      "order": 2,
      "path": "M 35,38 L 15,62 L 38,62",
      "start": {
        "x": 35,
        "y": 38
      },
      "end": {
        "x": 38,
        "y": 62
      },
      "corner": {
        "x": 15,
        "y": 62
      }
    },
    {
      "name": "提",
      "order": 3,
      "path": "M 22,82 L 40,68",
      "start": {
        "x": 22,
        "y": 82
      },
      "end": {
        "x": 40,
        "y": 68
      }
    },
    {
      "name": "横",
      "order": 4,
      "path": "M 50,30 L 85,30",
      "start": {
        "x": 50,
        "y": 30
      },
      "end": {
        "x": 85,
        "y": 30
      }
    },
    {
      "name": "竖",
      "order": 5,
      "path": "M 68,30 L 68,80",
      "start": {
        "x": 68,
        "y": 30
      },
      "end": {
        "x": 68,
        "y": 80
      }
    },
    {
      "name": "横",
      "order": 6,
      "path": "M 45,80 L 90,80",
      "start": {
        "x": 45,
        "y": 80
      },
      "end": {
        "x": 90,
        "y": 80
      }
    }
  ],
  "confusingChars": [
    "江",
    "级",
    "纪",
    "工"
  ]
},
{
  "id": "char_056",
  "char": "绿",
  "pinyin": "lǜ",
  "pinyinTone": 4,
  "oracleGlyph": "",
  "bronzeGlyph": "绿",
  "radical": "纟",
  "strokeCount": 11,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 15,
  "levelIndex": 56,
  "evolution": {
    "story": "绿由纟和录组成，像用草木染出青绿色的生机丝线",
    "oracleDesc": "草木染青绿丝线",
    "bronzeDesc": "左右结构完备",
    "sealDesc": "纟录两体",
    "modernDesc": "绞丝录旁十一笔"
  },
  "words": [
    {
      "word": "绿色",
      "pinyin": "lǜ sè",
      "desc": "如春草般生机盎然的颜色"
    },
    {
      "word": "绿叶",
      "pinyin": "lǜ yè",
      "desc": "植物绿色的叶片"
    },
    {
      "word": "碧绿",
      "pinyin": "bì lǜ",
      "desc": "青绿晶莹如玉石"
    }
  ],
  "sentence": "山坡上长满了碧绿的小草，大自然真美丽！",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找绿字气球",
    "instruction": "点击读音为'lǜ'的气球！",
    "options": [
      "绿",
      "红",
      "录",
      "缘"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "撇折",
      "order": 1,
      "path": "M 28,18 L 18,38 L 32,38",
      "start": {
        "x": 28,
        "y": 18
      },
      "end": {
        "x": 32,
        "y": 38
      },
      "corner": {
        "x": 18,
        "y": 38
      }
    },
    {
      "name": "撇折",
      "order": 2,
      "path": "M 32,35 L 15,55 L 35,55",
      "start": {
        "x": 32,
        "y": 35
      },
      "end": {
        "x": 35,
        "y": 55
      },
      "corner": {
        "x": 15,
        "y": 55
      }
    },
    {
      "name": "提",
      "order": 3,
      "path": "M 20,78 L 38,62",
      "start": {
        "x": 20,
        "y": 78
      },
      "end": {
        "x": 38,
        "y": 62
      }
    },
    {
      "name": "横折",
      "order": 4,
      "path": "M 48,22 L 80,22 L 80,38",
      "start": {
        "x": 48,
        "y": 22
      },
      "end": {
        "x": 80,
        "y": 38
      },
      "corner": {
        "x": 80,
        "y": 22
      }
    },
    {
      "name": "横",
      "order": 5,
      "path": "M 48,38 L 80,38",
      "start": {
        "x": 48,
        "y": 38
      },
      "end": {
        "x": 80,
        "y": 38
      }
    },
    {
      "name": "横",
      "order": 6,
      "path": "M 45,50 L 85,50",
      "start": {
        "x": 45,
        "y": 50
      },
      "end": {
        "x": 85,
        "y": 50
      }
    },
    {
      "name": "竖钩",
      "order": 7,
      "path": "M 65,50 L 65,88 L 58,80",
      "start": {
        "x": 65,
        "y": 50
      },
      "end": {
        "x": 58,
        "y": 80
      }
    },
    {
      "name": "点",
      "order": 8,
      "path": "M 52,62 L 48,72",
      "start": {
        "x": 52,
        "y": 62
      },
      "end": {
        "x": 48,
        "y": 72
      }
    },
    {
      "name": "提",
      "order": 9,
      "path": "M 45,82 L 58,75",
      "start": {
        "x": 45,
        "y": 82
      },
      "end": {
        "x": 58,
        "y": 75
      }
    },
    {
      "name": "撇",
      "order": 10,
      "path": "M 78,60 L 72,70",
      "start": {
        "x": 78,
        "y": 60
      },
      "end": {
        "x": 72,
        "y": 70
      }
    },
    {
      "name": "点",
      "order": 11,
      "path": "M 75,75 L 85,85",
      "start": {
        "x": 75,
        "y": 75
      },
      "end": {
        "x": 85,
        "y": 85
      }
    }
  ],
  "confusingChars": [
    "录",
    "缘",
    "绝",
    "绍"
  ]
},
{
  "id": "char_057",
  "char": "蓝",
  "pinyin": "lán",
  "pinyinTone": 2,
  "oracleGlyph": "",
  "bronzeGlyph": "蓝",
  "radical": "艹",
  "strokeCount": 13,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 15,
  "levelIndex": 57,
  "evolution": {
    "story": "蓝由艹和监组成，古代用蓼蓝草浸水提取纯净青蓝色",
    "oracleDesc": "蓼蓝草萃取青色",
    "bronzeDesc": "艹草配监皿",
    "sealDesc": "繁体藍字",
    "modernDesc": "草字头监字底十三笔"
  },
  "words": [
    {
      "word": "蓝天",
      "pinyin": "lán tiān",
      "desc": "晴朗无云的蔚蓝色天空"
    },
    {
      "word": "蓝色",
      "pinyin": "lán sè",
      "desc": "如天空海洋般的颜色"
    },
    {
      "word": "大海蓝",
      "pinyin": "dà hǎi lán",
      "desc": "深邃广阔的蓝色"
    }
  ],
  "sentence": "白云在蔚蓝的天空中自由自在地飘荡。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找蓝字气球",
    "instruction": "点击读音为'lán'的气球！",
    "options": [
      "蓝",
      "篮",
      "草",
      "天"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 20,20 L 80,20",
      "start": {
        "x": 20,
        "y": 20
      },
      "end": {
        "x": 80,
        "y": 20
      }
    },
    {
      "name": "竖",
      "order": 2,
      "path": "M 35,12 L 35,28",
      "start": {
        "x": 35,
        "y": 12
      },
      "end": {
        "x": 35,
        "y": 28
      }
    },
    {
      "name": "竖",
      "order": 3,
      "path": "M 65,12 L 65,28",
      "start": {
        "x": 65,
        "y": 12
      },
      "end": {
        "x": 65,
        "y": 28
      }
    },
    {
      "name": "竖",
      "order": 4,
      "path": "M 30,35 L 30,62",
      "start": {
        "x": 30,
        "y": 35
      },
      "end": {
        "x": 30,
        "y": 62
      }
    },
    {
      "name": "横折",
      "order": 5,
      "path": "M 30,35 L 55,35 L 55,62",
      "start": {
        "x": 30,
        "y": 35
      },
      "end": {
        "x": 55,
        "y": 62
      },
      "corner": {
        "x": 55,
        "y": 35
      }
    },
    {
      "name": "横",
      "order": 6,
      "path": "M 30,48 L 55,48",
      "start": {
        "x": 30,
        "y": 48
      },
      "end": {
        "x": 55,
        "y": 48
      }
    },
    {
      "name": "横",
      "order": 7,
      "path": "M 30,62 L 55,62",
      "start": {
        "x": 30,
        "y": 62
      },
      "end": {
        "x": 55,
        "y": 62
      }
    },
    {
      "name": "撇",
      "order": 8,
      "path": "M 72,32 L 62,48",
      "start": {
        "x": 72,
        "y": 32
      },
      "end": {
        "x": 62,
        "y": 48
      }
    },
    {
      "name": "横",
      "order": 9,
      "path": "M 60,48 L 85,48",
      "start": {
        "x": 60,
        "y": 48
      },
      "end": {
        "x": 85,
        "y": 48
      }
    },
    {
      "name": "竖",
      "order": 10,
      "path": "M 25,68 L 25,90",
      "start": {
        "x": 25,
        "y": 68
      },
      "end": {
        "x": 25,
        "y": 90
      }
    },
    {
      "name": "横折",
      "order": 11,
      "path": "M 25,68 L 78,68 L 78,90",
      "start": {
        "x": 25,
        "y": 68
      },
      "end": {
        "x": 78,
        "y": 90
      },
      "corner": {
        "x": 78,
        "y": 68
      }
    },
    {
      "name": "竖",
      "order": 12,
      "path": "M 45,72 L 45,88",
      "start": {
        "x": 45,
        "y": 72
      },
      "end": {
        "x": 45,
        "y": 88
      }
    },
    {
      "name": "横",
      "order": 13,
      "path": "M 18,90 L 85,90",
      "start": {
        "x": 18,
        "y": 90
      },
      "end": {
        "x": 85,
        "y": 90
      }
    }
  ],
  "confusingChars": [
    "篮",
    "监",
    "落",
    "草"
  ]
},
{
  "id": "char_058",
  "char": "黄",
  "pinyin": "huáng",
  "pinyinTone": 2,
  "oracleGlyph": "",
  "bronzeGlyph": "黄",
  "radical": "黄",
  "strokeCount": 11,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 15,
  "levelIndex": 58,
  "evolution": {
    "story": "黄的甲骨文像人胸前佩戴一块温润金黄的玉璧",
    "oracleDesc": "佩戴黄色玉璧之人",
    "bronzeDesc": "玉璧与佩饰分明",
    "sealDesc": "草部光彩照人",
    "modernDesc": "横竖竖横竖横折横竖横八十一笔"
  },
  "words": [
    {
      "word": "黄色",
      "pinyin": "huáng sè",
      "desc": "如阳光和金子般的颜色"
    },
    {
      "word": "金黄",
      "pinyin": "jīn huáng",
      "desc": "闪耀金色光芒的黄色"
    },
    {
      "word": "黄叶",
      "pinyin": "huáng yè",
      "desc": "秋天飘落的黄叶片"
    }
  ],
  "sentence": "秋风吹过，田野里翻滚着金黄色的麦浪。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找黄字气球",
    "instruction": "点击读音为'huáng'的气球！",
    "options": [
      "黄",
      "金",
      "广",
      "草"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 25,20 L 75,20",
      "start": {
        "x": 25,
        "y": 20
      },
      "end": {
        "x": 75,
        "y": 20
      }
    },
    {
      "name": "竖",
      "order": 2,
      "path": "M 38,12 L 38,28",
      "start": {
        "x": 38,
        "y": 12
      },
      "end": {
        "x": 38,
        "y": 28
      }
    },
    {
      "name": "竖",
      "order": 3,
      "path": "M 62,12 L 62,28",
      "start": {
        "x": 62,
        "y": 12
      },
      "end": {
        "x": 62,
        "y": 28
      }
    },
    {
      "name": "横",
      "order": 4,
      "path": "M 18,35 L 82,35",
      "start": {
        "x": 18,
        "y": 35
      },
      "end": {
        "x": 82,
        "y": 35
      }
    },
    {
      "name": "竖",
      "order": 5,
      "path": "M 32,35 L 32,60",
      "start": {
        "x": 32,
        "y": 35
      },
      "end": {
        "x": 32,
        "y": 60
      }
    },
    {
      "name": "横折",
      "order": 6,
      "path": "M 32,45 L 68,45 L 68,60",
      "start": {
        "x": 32,
        "y": 45
      },
      "end": {
        "x": 68,
        "y": 60
      },
      "corner": {
        "x": 68,
        "y": 45
      }
    },
    {
      "name": "横",
      "order": 7,
      "path": "M 32,60 L 68,60",
      "start": {
        "x": 32,
        "y": 60
      },
      "end": {
        "x": 68,
        "y": 60
      }
    },
    {
      "name": "竖",
      "order": 8,
      "path": "M 50,35 L 50,75",
      "start": {
        "x": 50,
        "y": 35
      },
      "end": {
        "x": 50,
        "y": 75
      }
    },
    {
      "name": "横",
      "order": 9,
      "path": "M 20,75 L 80,75",
      "start": {
        "x": 20,
        "y": 75
      },
      "end": {
        "x": 80,
        "y": 75
      }
    },
    {
      "name": "撇",
      "order": 10,
      "path": "M 38,78 L 25,92",
      "start": {
        "x": 38,
        "y": 78
      },
      "end": {
        "x": 25,
        "y": 92
      }
    },
    {
      "name": "点",
      "order": 11,
      "path": "M 62,78 L 75,92",
      "start": {
        "x": 62,
        "y": 78
      },
      "end": {
        "x": 75,
        "y": 92
      }
    }
  ],
  "confusingChars": [
    "共",
    "革",
    "苗",
    "草"
  ]
},
{
  "id": "char_059",
  "char": "白",
  "pinyin": "bái",
  "pinyinTone": 2,
  "oracleGlyph": "",
  "bronzeGlyph": "白",
  "radical": "白",
  "strokeCount": 5,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 15,
  "levelIndex": 59,
  "evolution": {
    "story": "白的甲骨文像一粒饱满晶莹、露出雪白胚芽的白米",
    "oracleDesc": "晶莹雪白的米粒",
    "bronzeDesc": "光芒外射之形",
    "sealDesc": "上撇下日形",
    "modernDesc": "撇竖横折横横五笔"
  },
  "words": [
    {
      "word": "白云",
      "pinyin": "bái yún",
      "desc": "天空洁白的云彩"
    },
    {
      "word": "雪白",
      "pinyin": "xuě bái",
      "desc": "像雪花一样纯洁洁白"
    },
    {
      "word": "白天",
      "pinyin": "bái tiān",
      "desc": "太阳升起光明的时刻"
    }
  ],
  "sentence": "蓝蓝的天空上飘着几朵像棉花糖一样的白云。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找白字气球",
    "instruction": "点击读音为'bái'的气球！",
    "options": [
      "白",
      "日",
      "百",
      "自"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "撇",
      "order": 1,
      "path": "M 50,15 L 42,32",
      "start": {
        "x": 50,
        "y": 15
      },
      "end": {
        "x": 42,
        "y": 32
      }
    },
    {
      "name": "竖",
      "order": 2,
      "path": "M 30,32 L 30,85",
      "start": {
        "x": 30,
        "y": 32
      },
      "end": {
        "x": 30,
        "y": 85
      }
    },
    {
      "name": "横折",
      "order": 3,
      "path": "M 30,32 L 72,32 L 72,85",
      "start": {
        "x": 30,
        "y": 32
      },
      "end": {
        "x": 72,
        "y": 85
      },
      "corner": {
        "x": 72,
        "y": 32
      }
    },
    {
      "name": "横",
      "order": 4,
      "path": "M 30,58 L 72,58",
      "start": {
        "x": 30,
        "y": 58
      },
      "end": {
        "x": 72,
        "y": 58
      }
    },
    {
      "name": "横",
      "order": 5,
      "path": "M 30,85 L 72,85",
      "start": {
        "x": 30,
        "y": 85
      },
      "end": {
        "x": 72,
        "y": 85
      }
    }
  ],
  "confusingChars": [
    "日",
    "自",
    "百",
    "目"
  ]
},
{
  "id": "char_060",
  "char": "黑",
  "pinyin": "hēi",
  "pinyinTone": 1,
  "oracleGlyph": "",
  "bronzeGlyph": "黑",
  "radical": "黑",
  "strokeCount": 12,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 15,
  "levelIndex": 60,
  "evolution": {
    "story": "黑的甲骨文像一个人在烟囱火灶旁被煤烟熏黑了脸面",
    "oracleDesc": "被灶烟熏黑的人",
    "bronzeDesc": "上里下火形",
    "sealDesc": "上里下四点底",
    "modernDesc": "里字头四点底十二笔"
  },
  "words": [
    {
      "word": "黑色",
      "pinyin": "hēi sè",
      "desc": "如墨水和夜空般的颜色"
    },
    {
      "word": "黑夜",
      "pinyin": "hēi yè",
      "desc": "没有太阳的深邃夜晚"
    },
    {
      "word": "黑板",
      "pinyin": "hēi bǎn",
      "desc": "教室里老师写字的板"
    }
  ],
  "sentence": "黑夜里，无数闪亮的小星星在天空眨眼睛。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找黑字气球",
    "instruction": "点击读音为'hēi'的气球！",
    "options": [
      "黑",
      "墨",
      "里",
      "点"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "竖",
      "order": 1,
      "path": "M 32,20 L 32,48",
      "start": {
        "x": 32,
        "y": 20
      },
      "end": {
        "x": 32,
        "y": 48
      }
    },
    {
      "name": "横折",
      "order": 2,
      "path": "M 32,20 L 70,20 L 70,48",
      "start": {
        "x": 32,
        "y": 20
      },
      "end": {
        "x": 70,
        "y": 48
      },
      "corner": {
        "x": 70,
        "y": 20
      }
    },
    {
      "name": "点",
      "order": 3,
      "path": "M 42,28 L 45,35",
      "start": {
        "x": 42,
        "y": 28
      },
      "end": {
        "x": 45,
        "y": 35
      }
    },
    {
      "name": "撇",
      "order": 4,
      "path": "M 60,28 L 57,35",
      "start": {
        "x": 60,
        "y": 28
      },
      "end": {
        "x": 57,
        "y": 35
      }
    },
    {
      "name": "横",
      "order": 5,
      "path": "M 32,48 L 70,48",
      "start": {
        "x": 32,
        "y": 48
      },
      "end": {
        "x": 70,
        "y": 48
      }
    },
    {
      "name": "竖",
      "order": 6,
      "path": "M 50,12 L 50,70",
      "start": {
        "x": 50,
        "y": 12
      },
      "end": {
        "x": 50,
        "y": 70
      }
    },
    {
      "name": "横",
      "order": 7,
      "path": "M 22,60 L 78,60",
      "start": {
        "x": 22,
        "y": 60
      },
      "end": {
        "x": 78,
        "y": 60
      }
    },
    {
      "name": "横",
      "order": 8,
      "path": "M 18,72 L 82,72",
      "start": {
        "x": 18,
        "y": 72
      },
      "end": {
        "x": 82,
        "y": 72
      }
    },
    {
      "name": "点",
      "order": 9,
      "path": "M 22,82 L 18,92",
      "start": {
        "x": 22,
        "y": 82
      },
      "end": {
        "x": 18,
        "y": 92
      }
    },
    {
      "name": "点",
      "order": 10,
      "path": "M 40,82 L 42,92",
      "start": {
        "x": 40,
        "y": 82
      },
      "end": {
        "x": 42,
        "y": 92
      }
    },
    {
      "name": "点",
      "order": 11,
      "path": "M 60,82 L 62,92",
      "start": {
        "x": 60,
        "y": 82
      },
      "end": {
        "x": 62,
        "y": 92
      }
    },
    {
      "name": "点",
      "order": 12,
      "path": "M 78,82 L 82,92",
      "start": {
        "x": 78,
        "y": 82
      },
      "end": {
        "x": 82,
        "y": 92
      }
    }
  ],
  "confusingChars": [
    "里",
    "墨",
    "点",
    "照"
  ]
}
,
{
  "id": "char_061",
  "char": "开",
  "pinyin": "kāi",
  "pinyinTone": 1,
  "oracleGlyph": "",
  "bronzeGlyph": "开",
  "radical": "廾",
  "strokeCount": 4,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 16,
  "levelIndex": 61,
  "evolution": {
    "story": "开的甲骨文像双手拨开门闩打开大门，表示开启、展开",
    "oracleDesc": "双手开启门闩之形",
    "bronzeDesc": "门闩与双手分明",
    "sealDesc": "门内横木开启",
    "modernDesc": "横横撇竖四笔"
  },
  "words": [
    {
      "word": "开门",
      "pinyin": "kāi mén",
      "desc": "把门打开"
    },
    {
      "word": "开花",
      "pinyin": "kāi huā",
      "desc": "花朵绽放展开"
    },
    {
      "word": "开心",
      "pinyin": "kāi xīn",
      "desc": "心情欢畅快乐"
    }
  ],
  "sentence": "春天来了，公园里五颜六色的花儿都开花了。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找开字气球",
    "instruction": "点击读音为'kāi'的气球！",
    "options": [
      "开",
      "关",
      "井",
      "升"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 25,28 L 75,28",
      "start": {
        "x": 25,
        "y": 28
      },
      "end": {
        "x": 75,
        "y": 28
      }
    },
    {
      "name": "横",
      "order": 2,
      "path": "M 15,50 L 85,50",
      "start": {
        "x": 15,
        "y": 50
      },
      "end": {
        "x": 85,
        "y": 50
      }
    },
    {
      "name": "撇",
      "order": 3,
      "path": "M 38,20 L 32,88",
      "start": {
        "x": 38,
        "y": 20
      },
      "end": {
        "x": 32,
        "y": 88
      }
    },
    {
      "name": "竖",
      "order": 4,
      "path": "M 65,20 L 65,88",
      "start": {
        "x": 65,
        "y": 20
      },
      "end": {
        "x": 65,
        "y": 88
      }
    }
  ],
  "confusingChars": [
    "井",
    "升",
    "并",
    "关"
  ]
},
{
  "id": "char_062",
  "char": "关",
  "pinyin": "guān",
  "pinyinTone": 1,
  "oracleGlyph": "",
  "bronzeGlyph": "关",
  "radical": "丷",
  "strokeCount": 6,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 16,
  "levelIndex": 62,
  "evolution": {
    "story": "关的甲骨文像门扇两边合拢插上门闩，表示关闭、合拢",
    "oracleDesc": "两扇门闩合拢",
    "bronzeDesc": "门框上加横木",
    "sealDesc": "门内横闭",
    "modernDesc": "点撇横横撇捺六笔"
  },
  "words": [
    {
      "word": "关门",
      "pinyin": "guān mén",
      "desc": "把门扇合拢闭合"
    },
    {
      "word": "关心",
      "pinyin": "guān xīn",
      "desc": "放在心上体贴关照"
    },
    {
      "word": "开关",
      "pinyin": "kāi guān",
      "desc": "控制通断的按钮"
    }
  ],
  "sentence": "睡觉前，小朋友记得轻轻把房间的门关好。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找关字气球",
    "instruction": "点击读音为'guān'的气球！",
    "options": [
      "关",
      "开",
      "天",
      "美"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "点",
      "order": 1,
      "path": "M 35,18 L 38,28",
      "start": {
        "x": 35,
        "y": 18
      },
      "end": {
        "x": 38,
        "y": 28
      }
    },
    {
      "name": "撇",
      "order": 2,
      "path": "M 65,18 L 60,28",
      "start": {
        "x": 65,
        "y": 18
      },
      "end": {
        "x": 60,
        "y": 28
      }
    },
    {
      "name": "横",
      "order": 3,
      "path": "M 28,42 L 72,42",
      "start": {
        "x": 28,
        "y": 42
      },
      "end": {
        "x": 72,
        "y": 42
      }
    },
    {
      "name": "横",
      "order": 4,
      "path": "M 15,58 L 85,58",
      "start": {
        "x": 15,
        "y": 58
      },
      "end": {
        "x": 85,
        "y": 58
      }
    },
    {
      "name": "撇",
      "order": 5,
      "path": "M 50,30 L 22,88",
      "start": {
        "x": 50,
        "y": 30
      },
      "end": {
        "x": 22,
        "y": 88
      }
    },
    {
      "name": "捺",
      "order": 6,
      "path": "M 50,58 L 80,88",
      "start": {
        "x": 50,
        "y": 58
      },
      "end": {
        "x": 80,
        "y": 88
      }
    }
  ],
  "confusingChars": [
    "天",
    "美",
    "头",
    "开"
  ]
},
{
  "id": "char_063",
  "char": "飞",
  "pinyin": "fēi",
  "pinyinTone": 1,
  "oracleGlyph": "",
  "bronzeGlyph": "飞",
  "radical": "飞",
  "strokeCount": 3,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 16,
  "levelIndex": 63,
  "evolution": {
    "story": "飞的甲骨文像一只展开双翅、在蓝天中展翅翱翔的鸟儿",
    "oracleDesc": "展开双翼的飞鸟",
    "bronzeDesc": "羽翼丰满张开",
    "sealDesc": "繁体飛字",
    "modernDesc": "横折斜钩撇点三笔"
  },
  "words": [
    {
      "word": "飞鸟",
      "pinyin": "fēi niǎo",
      "desc": "在空中飞翔的鸟儿"
    },
    {
      "word": "飞机",
      "pinyin": "fēi jī",
      "desc": "在天空中航行的大飞机"
    },
    {
      "word": "飞快",
      "pinyin": "fēi kuài",
      "desc": "速度极快如飞行一般"
    }
  ],
  "sentence": "小鸟张开翅膀，在蔚蓝的天空上自由飞翔。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找飞字气球",
    "instruction": "点击读音为'fēi'的气球！",
    "options": [
      "飞",
      "鸟",
      "风",
      "云"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横折斜钩",
      "order": 1,
      "path": "M 32,32 L 68,32 L 65,85 L 75,78",
      "start": {
        "x": 32,
        "y": 32
      },
      "end": {
        "x": 75,
        "y": 78
      },
      "corner": {
        "x": 68,
        "y": 32
      }
    },
    {
      "name": "撇",
      "order": 2,
      "path": "M 48,35 L 30,65",
      "start": {
        "x": 48,
        "y": 35
      },
      "end": {
        "x": 30,
        "y": 65
      }
    },
    {
      "name": "点",
      "order": 3,
      "path": "M 35,68 L 38,78",
      "start": {
        "x": 35,
        "y": 68
      },
      "end": {
        "x": 38,
        "y": 78
      }
    }
  ],
  "confusingChars": [
    "风",
    "鸟",
    "九",
    "乙"
  ]
},
{
  "id": "char_064",
  "char": "走",
  "pinyin": "zǒu",
  "pinyinTone": 3,
  "oracleGlyph": "",
  "bronzeGlyph": "走",
  "radical": "走",
  "strokeCount": 7,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 16,
  "levelIndex": 64,
  "evolution": {
    "story": "走的甲骨文上面是一个甩开双臂奔跑的人，下面是一只脚印止",
    "oracleDesc": "挥臂大步快跑的人",
    "bronzeDesc": "上夭下止形",
    "sealDesc": "上土下止相连",
    "modernDesc": "横竖横竖横撇捺七笔"
  },
  "words": [
    {
      "word": "走路",
      "pinyin": "zǒu lù",
      "desc": "迈开双脚向前行走"
    },
    {
      "word": "走开",
      "pinyin": "zǒu kāi",
      "desc": "离开当前的地方"
    },
    {
      "word": "行走",
      "pinyin": "xíng zǒu",
      "desc": "大步在道路上前进"
    }
  ],
  "sentence": "小兔蹦蹦跳跳，快乐地走在回家的林间小路上。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找走字气球",
    "instruction": "点击读音为'zǒu'的气球！",
    "options": [
      "走",
      "足",
      "起",
      "越"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 28,25 L 72,25",
      "start": {
        "x": 28,
        "y": 25
      },
      "end": {
        "x": 72,
        "y": 25
      }
    },
    {
      "name": "竖",
      "order": 2,
      "path": "M 50,15 L 50,42",
      "start": {
        "x": 50,
        "y": 15
      },
      "end": {
        "x": 50,
        "y": 42
      }
    },
    {
      "name": "横",
      "order": 3,
      "path": "M 18,42 L 82,42",
      "start": {
        "x": 18,
        "y": 42
      },
      "end": {
        "x": 82,
        "y": 42
      }
    },
    {
      "name": "竖",
      "order": 4,
      "path": "M 50,42 L 50,65",
      "start": {
        "x": 50,
        "y": 42
      },
      "end": {
        "x": 50,
        "y": 65
      }
    },
    {
      "name": "横",
      "order": 5,
      "path": "M 30,65 L 70,65",
      "start": {
        "x": 30,
        "y": 65
      },
      "end": {
        "x": 70,
        "y": 65
      }
    },
    {
      "name": "撇",
      "order": 6,
      "path": "M 48,65 L 22,88",
      "start": {
        "x": 48,
        "y": 65
      },
      "end": {
        "x": 22,
        "y": 88
      }
    },
    {
      "name": "捺",
      "order": 7,
      "path": "M 35,68 L 88,88",
      "start": {
        "x": 35,
        "y": 68
      },
      "end": {
        "x": 88,
        "y": 88
      }
    }
  ],
  "confusingChars": [
    "足",
    "起",
    "赶",
    "土"
  ]
},
{
  "id": "char_065",
  "char": "跑",
  "pinyin": "pǎo",
  "pinyinTone": 3,
  "oracleGlyph": "",
  "bronzeGlyph": "跑",
  "radical": "足",
  "strokeCount": 12,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 16,
  "levelIndex": 65,
  "evolution": {
    "story": "跑由足和包组成，足代表双脚，包代表蓄力如球，表示双脚快速向前奔跑",
    "oracleDesc": "双脚如风蓄力奔跑",
    "bronzeDesc": "左足右包结构",
    "sealDesc": "足包合体",
    "modernDesc": "足字旁包字右十二笔"
  },
  "words": [
    {
      "word": "跑步",
      "pinyin": "pǎo bù",
      "desc": "锻炼身体快速奔跑"
    },
    {
      "word": "快跑",
      "pinyin": "kuài pǎo",
      "desc": "迈大步飞快前进"
    },
    {
      "word": "赛跑",
      "pinyin": "sài pǎo",
      "desc": "比拼速度的跑步比赛"
    }
  ],
  "sentence": "操场上，小朋友们在进行精彩的接力赛跑。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找跑字气球",
    "instruction": "点击读音为'pǎo'的气球！",
    "options": [
      "跑",
      "跳",
      "泡",
      "抱"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "竖",
      "order": 1,
      "path": "M 22,25 L 22,48",
      "start": {
        "x": 22,
        "y": 25
      },
      "end": {
        "x": 22,
        "y": 48
      }
    },
    {
      "name": "横折",
      "order": 2,
      "path": "M 22,25 L 42,25 L 42,48",
      "start": {
        "x": 22,
        "y": 25
      },
      "end": {
        "x": 42,
        "y": 48
      },
      "corner": {
        "x": 42,
        "y": 25
      }
    },
    {
      "name": "横",
      "order": 3,
      "path": "M 22,48 L 42,48",
      "start": {
        "x": 22,
        "y": 48
      },
      "end": {
        "x": 42,
        "y": 48
      }
    },
    {
      "name": "竖",
      "order": 4,
      "path": "M 32,48 L 32,70",
      "start": {
        "x": 32,
        "y": 48
      },
      "end": {
        "x": 32,
        "y": 70
      }
    },
    {
      "name": "横",
      "order": 5,
      "path": "M 22,65 L 35,65",
      "start": {
        "x": 22,
        "y": 65
      },
      "end": {
        "x": 35,
        "y": 65
      }
    },
    {
      "name": "竖",
      "order": 6,
      "path": "M 22,65 L 22,88",
      "start": {
        "x": 22,
        "y": 65
      },
      "end": {
        "x": 22,
        "y": 88
      }
    },
    {
      "name": "提",
      "order": 7,
      "path": "M 15,88 L 42,75",
      "start": {
        "x": 15,
        "y": 88
      },
      "end": {
        "x": 42,
        "y": 75
      }
    },
    {
      "name": "撇",
      "order": 8,
      "path": "M 68,18 L 55,30",
      "start": {
        "x": 68,
        "y": 18
      },
      "end": {
        "x": 55,
        "y": 30
      }
    },
    {
      "name": "横折钩",
      "order": 9,
      "path": "M 55,30 L 88,30 L 85,60 L 78,55",
      "start": {
        "x": 55,
        "y": 30
      },
      "end": {
        "x": 78,
        "y": 55
      },
      "corner": {
        "x": 88,
        "y": 30
      }
    },
    {
      "name": "撇",
      "order": 10,
      "path": "M 62,38 L 52,58",
      "start": {
        "x": 62,
        "y": 38
      },
      "end": {
        "x": 52,
        "y": 58
      }
    },
    {
      "name": "横折",
      "order": 11,
      "path": "M 52,48 L 78,48 L 78,65",
      "start": {
        "x": 52,
        "y": 48
      },
      "end": {
        "x": 78,
        "y": 65
      },
      "corner": {
        "x": 78,
        "y": 48
      }
    },
    {
      "name": "竖弯钩",
      "order": 12,
      "path": "M 60,60 Q 60,88 85,88 L 88,80",
      "start": {
        "x": 60,
        "y": 60
      },
      "end": {
        "x": 88,
        "y": 80
      }
    }
  ],
  "confusingChars": [
    "抱",
    "泡",
    "跳",
    "包"
  ]
},
{
  "id": "char_066",
  "char": "跳",
  "pinyin": "tiào",
  "pinyinTone": 4,
  "oracleGlyph": "",
  "bronzeGlyph": "跳",
  "radical": "足",
  "strokeCount": 13,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 17,
  "levelIndex": 66,
  "evolution": {
    "story": "跳由足和兆组成，兆像龟甲裂纹迅速弹开，表示双脚敏捷跃起腾空",
    "oracleDesc": "双脚腾空跃起",
    "bronzeDesc": "足兆左右对称",
    "sealDesc": "足兆相和",
    "modernDesc": "足字旁兆字右十三笔"
  },
  "words": [
    {
      "word": "跳高",
      "pinyin": "tiào gāo",
      "desc": "向上跃起的运动"
    },
    {
      "word": "跳舞",
      "pinyin": "tiào wǔ",
      "desc": "跟随音乐优美地舞动"
    },
    {
      "word": "跳绳",
      "pinyin": "tiào shéng",
      "desc": "摇绳跳跃的健康运动"
    }
  ],
  "sentence": "小袋鼠欢快地在草地上跳来跳去。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找跳字气球",
    "instruction": "点击读音为'tiào'的气球！",
    "options": [
      "跳",
      "跑",
      "桃",
      "挑"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "竖",
      "order": 1,
      "path": "M 22,25 L 22,48",
      "start": {
        "x": 22,
        "y": 25
      },
      "end": {
        "x": 22,
        "y": 48
      }
    },
    {
      "name": "横折",
      "order": 2,
      "path": "M 22,25 L 42,25 L 42,48",
      "start": {
        "x": 22,
        "y": 25
      },
      "end": {
        "x": 42,
        "y": 48
      },
      "corner": {
        "x": 42,
        "y": 25
      }
    },
    {
      "name": "横",
      "order": 3,
      "path": "M 22,48 L 42,48",
      "start": {
        "x": 22,
        "y": 48
      },
      "end": {
        "x": 42,
        "y": 48
      }
    },
    {
      "name": "竖",
      "order": 4,
      "path": "M 32,48 L 32,70",
      "start": {
        "x": 32,
        "y": 48
      },
      "end": {
        "x": 32,
        "y": 70
      }
    },
    {
      "name": "横",
      "order": 5,
      "path": "M 22,65 L 35,65",
      "start": {
        "x": 22,
        "y": 65
      },
      "end": {
        "x": 35,
        "y": 65
      }
    },
    {
      "name": "竖",
      "order": 6,
      "path": "M 22,65 L 22,88",
      "start": {
        "x": 22,
        "y": 65
      },
      "end": {
        "x": 22,
        "y": 88
      }
    },
    {
      "name": "提",
      "order": 7,
      "path": "M 15,88 L 42,75",
      "start": {
        "x": 15,
        "y": 88
      },
      "end": {
        "x": 42,
        "y": 75
      }
    },
    {
      "name": "撇",
      "order": 8,
      "path": "M 62,25 L 55,65",
      "start": {
        "x": 62,
        "y": 25
      },
      "end": {
        "x": 55,
        "y": 65
      }
    },
    {
      "name": "点",
      "order": 9,
      "path": "M 52,38 L 48,48",
      "start": {
        "x": 52,
        "y": 38
      },
      "end": {
        "x": 48,
        "y": 48
      }
    },
    {
      "name": "提",
      "order": 10,
      "path": "M 46,75 L 58,68",
      "start": {
        "x": 46,
        "y": 75
      },
      "end": {
        "x": 58,
        "y": 68
      }
    },
    {
      "name": "竖弯钩",
      "order": 11,
      "path": "M 75,20 Q 75,88 90,88 L 92,80",
      "start": {
        "x": 75,
        "y": 20
      },
      "end": {
        "x": 92,
        "y": 80
      }
    },
    {
      "name": "撇",
      "order": 12,
      "path": "M 85,38 L 78,48",
      "start": {
        "x": 85,
        "y": 38
      },
      "end": {
        "x": 78,
        "y": 48
      }
    },
    {
      "name": "点",
      "order": 13,
      "path": "M 78,65 L 85,75",
      "start": {
        "x": 78,
        "y": 65
      },
      "end": {
        "x": 85,
        "y": 75
      }
    }
  ],
  "confusingChars": [
    "桃",
    "挑",
    "跑",
    "逃"
  ]
},
{
  "id": "char_067",
  "char": "听",
  "pinyin": "tīng",
  "pinyinTone": 1,
  "oracleGlyph": "",
  "bronzeGlyph": "听",
  "radical": "口",
  "strokeCount": 7,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 17,
  "levelIndex": 67,
  "evolution": {
    "story": "听由口和斤组成，口代表用耳倾听言语，古代繁体為聽，现简化为听",
    "oracleDesc": "倾耳聆听声音之状",
    "bronzeDesc": "耳口德心合体",
    "sealDesc": "听字成形",
    "modernDesc": "口字旁斤字右七笔"
  },
  "words": [
    {
      "word": "听见",
      "pinyin": "tīng jiàn",
      "desc": "耳朵听到美妙的声音"
    },
    {
      "word": "听话",
      "pinyin": "tīng huà",
      "desc": "懂事礼貌听从教导"
    },
    {
      "word": "听音乐",
      "pinyin": "tīng yīn yuè",
      "desc": "欣赏好听动听的歌曲"
    }
  ],
  "sentence": "小兔子竖起长长的大耳朵，仔细听树林里的声音。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找听字气球",
    "instruction": "点击读音为'tīng'的气球！",
    "options": [
      "听",
      "叫",
      "叶",
      "吃"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "竖",
      "order": 1,
      "path": "M 20,32 L 20,68",
      "start": {
        "x": 20,
        "y": 32
      },
      "end": {
        "x": 20,
        "y": 68
      }
    },
    {
      "name": "横折",
      "order": 2,
      "path": "M 20,32 L 40,32 L 40,68",
      "start": {
        "x": 20,
        "y": 32
      },
      "end": {
        "x": 40,
        "y": 68
      },
      "corner": {
        "x": 40,
        "y": 32
      }
    },
    {
      "name": "横",
      "order": 3,
      "path": "M 20,68 L 40,68",
      "start": {
        "x": 20,
        "y": 68
      },
      "end": {
        "x": 40,
        "y": 68
      }
    },
    {
      "name": "撇",
      "order": 4,
      "path": "M 80,18 L 60,30",
      "start": {
        "x": 80,
        "y": 18
      },
      "end": {
        "x": 60,
        "y": 30
      }
    },
    {
      "name": "撇",
      "order": 5,
      "path": "M 58,30 L 52,88",
      "start": {
        "x": 58,
        "y": 30
      },
      "end": {
        "x": 52,
        "y": 88
      }
    },
    {
      "name": "横",
      "order": 6,
      "path": "M 55,48 L 88,48",
      "start": {
        "x": 55,
        "y": 48
      },
      "end": {
        "x": 88,
        "y": 48
      }
    },
    {
      "name": "竖",
      "order": 7,
      "path": "M 78,48 L 78,88",
      "start": {
        "x": 78,
        "y": 48
      },
      "end": {
        "x": 78,
        "y": 88
      }
    }
  ],
  "confusingChars": [
    "叶",
    "叫",
    "叮",
    "吃"
  ]
},
{
  "id": "char_068",
  "char": "说",
  "pinyin": "shuō",
  "pinyinTone": 1,
  "oracleGlyph": "",
  "bronzeGlyph": "说",
  "radical": "讠",
  "strokeCount": 9,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 17,
  "levelIndex": 68,
  "evolution": {
    "story": "说由讠和兑组成，讠代表语言交流，兑代表喜悦开口，表示开心地交谈说话",
    "oracleDesc": "张口吐露欢喜言语",
    "bronzeDesc": "言兑左右分明",
    "sealDesc": "繁体説字",
    "modernDesc": "言字旁兑字右九笔"
  },
  "words": [
    {
      "word": "说话",
      "pinyin": "shuō huà",
      "desc": "用语言表达心里的想法"
    },
    {
      "word": "说明",
      "pinyin": "shuō míng",
      "desc": "解释说明清楚明白"
    },
    {
      "word": "听说",
      "pinyin": "tīng shuō",
      "desc": "听到别人讲述的事情"
    }
  ],
  "sentence": "老师微笑着对全班小朋友说话，大家听得可认真了。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找说字气球",
    "instruction": "点击读音为'shuō'的气球！",
    "options": [
      "说",
      "话",
      "语",
      "读"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "点",
      "order": 1,
      "path": "M 22,25 L 25,35",
      "start": {
        "x": 22,
        "y": 25
      },
      "end": {
        "x": 25,
        "y": 35
      }
    },
    {
      "name": "横折提",
      "order": 2,
      "path": "M 15,48 L 35,48 L 22,78 L 38,70",
      "start": {
        "x": 15,
        "y": 48
      },
      "end": {
        "x": 38,
        "y": 70
      },
      "corner": {
        "x": 35,
        "y": 48
      }
    },
    {
      "name": "点",
      "order": 3,
      "path": "M 55,20 L 52,30",
      "start": {
        "x": 55,
        "y": 20
      },
      "end": {
        "x": 52,
        "y": 30
      }
    },
    {
      "name": "撇",
      "order": 4,
      "path": "M 75,18 L 68,28",
      "start": {
        "x": 75,
        "y": 18
      },
      "end": {
        "x": 68,
        "y": 28
      }
    },
    {
      "name": "竖",
      "order": 5,
      "path": "M 48,38 L 48,60",
      "start": {
        "x": 48,
        "y": 38
      },
      "end": {
        "x": 48,
        "y": 60
      }
    },
    {
      "name": "横折",
      "order": 6,
      "path": "M 48,38 L 82,38 L 82,60",
      "start": {
        "x": 48,
        "y": 38
      },
      "end": {
        "x": 82,
        "y": 60
      },
      "corner": {
        "x": 82,
        "y": 38
      }
    },
    {
      "name": "横",
      "order": 7,
      "path": "M 48,60 L 82,60",
      "start": {
        "x": 48,
        "y": 60
      },
      "end": {
        "x": 82,
        "y": 60
      }
    },
    {
      "name": "撇",
      "order": 8,
      "path": "M 58,62 L 42,88",
      "start": {
        "x": 58,
        "y": 62
      },
      "end": {
        "x": 42,
        "y": 88
      }
    },
    {
      "name": "竖弯钩",
      "order": 9,
      "path": "M 72,62 Q 72,88 88,88 L 90,80",
      "start": {
        "x": 72,
        "y": 62
      },
      "end": {
        "x": 90,
        "y": 80
      }
    }
  ],
  "confusingChars": [
    "话",
    "语",
    "读",
    "认"
  ]
},
{
  "id": "char_069",
  "char": "看",
  "pinyin": "kàn",
  "pinyinTone": 4,
  "oracleGlyph": "",
  "bronzeGlyph": "看",
  "radical": "目",
  "strokeCount": 9,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 17,
  "levelIndex": 69,
  "evolution": {
    "story": "看的甲骨文像人把手搭在眼睛上方遮挡强光，极目远望",
    "oracleDesc": "手搭眼眶极目远眺",
    "bronzeDesc": "上手下目形",
    "sealDesc": "手目合体",
    "modernDesc": "上手下目九笔"
  },
  "words": [
    {
      "word": "看见",
      "pinyin": "kàn jiàn",
      "desc": "用眼睛观察到美好的景物"
    },
    {
      "word": "看书",
      "pinyin": "kàn shū",
      "desc": "阅读有趣的图画书故事"
    },
    {
      "word": "观看",
      "pinyin": "guān kàn",
      "desc": "集中注意力欣赏观看"
    }
  ],
  "sentence": "我们在草地上仰望星空，看闪闪发光的流星划过。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找看字气球",
    "instruction": "点击读音为'kàn'的气球！",
    "options": [
      "看",
      "着",
      "目",
      "春"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "撇",
      "order": 1,
      "path": "M 65,15 L 35,28",
      "start": {
        "x": 65,
        "y": 15
      },
      "end": {
        "x": 35,
        "y": 28
      }
    },
    {
      "name": "横",
      "order": 2,
      "path": "M 32,32 L 72,32",
      "start": {
        "x": 32,
        "y": 32
      },
      "end": {
        "x": 72,
        "y": 32
      }
    },
    {
      "name": "横",
      "order": 3,
      "path": "M 18,45 L 82,45",
      "start": {
        "x": 18,
        "y": 45
      },
      "end": {
        "x": 82,
        "y": 45
      }
    },
    {
      "name": "撇",
      "order": 4,
      "path": "M 48,22 L 25,65",
      "start": {
        "x": 48,
        "y": 22
      },
      "end": {
        "x": 25,
        "y": 65
      }
    },
    {
      "name": "竖",
      "order": 5,
      "path": "M 40,55 L 40,90",
      "start": {
        "x": 40,
        "y": 55
      },
      "end": {
        "x": 40,
        "y": 90
      }
    },
    {
      "name": "横折",
      "order": 6,
      "path": "M 40,55 L 75,55 L 75,90",
      "start": {
        "x": 40,
        "y": 55
      },
      "end": {
        "x": 75,
        "y": 90
      },
      "corner": {
        "x": 75,
        "y": 55
      }
    },
    {
      "name": "横",
      "order": 7,
      "path": "M 40,68 L 75,68",
      "start": {
        "x": 40,
        "y": 68
      },
      "end": {
        "x": 75,
        "y": 68
      }
    },
    {
      "name": "横",
      "order": 8,
      "path": "M 40,80 L 75,80",
      "start": {
        "x": 40,
        "y": 80
      },
      "end": {
        "x": 75,
        "y": 80
      }
    },
    {
      "name": "横",
      "order": 9,
      "path": "M 40,90 L 75,90",
      "start": {
        "x": 40,
        "y": 90
      },
      "end": {
        "x": 75,
        "y": 90
      }
    }
  ],
  "confusingChars": [
    "着",
    "春",
    "目",
    "手"
  ]
},
{
  "id": "char_070",
  "char": "写",
  "pinyin": "xiě",
  "pinyinTone": 3,
  "oracleGlyph": "",
  "bronzeGlyph": "写",
  "radical": "冖",
  "strokeCount": 5,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 17,
  "levelIndex": 70,
  "evolution": {
    "story": "写的甲骨文像在房屋之中安放器皿描摹誊写，现简化为写",
    "oracleDesc": "在屋内描摹书写",
    "bronzeDesc": "宝盖配写形",
    "sealDesc": "繁体寫字",
    "modernDesc": "点横撇竖折折钩横五笔"
  },
  "words": [
    {
      "word": "写字",
      "pinyin": "xiě zì",
      "desc": "用笔在纸上书写规范汉字"
    },
    {
      "word": "书写",
      "pinyin": "shū xiě",
      "desc": "认真工整地落笔写字"
    },
    {
      "word": "写画",
      "pinyin": "xiě huà",
      "desc": "用彩笔画出美丽图画"
    }
  ],
  "sentence": "小明坐在明亮的课桌前，认认真真地在田字格里写字。",
  "gameConfig": {
    "type": "balloon_pop",
    "title": "找写字气球",
    "instruction": "点击读音为'xiě'的气球！",
    "options": [
      "写",
      "字",
      "与",
      "马"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "点",
      "order": 1,
      "path": "M 50,15 L 50,25",
      "start": {
        "x": 50,
        "y": 15
      },
      "end": {
        "x": 50,
        "y": 25
      }
    },
    {
      "name": "横折",
      "order": 2,
      "path": "M 20,32 L 80,32 L 80,45",
      "start": {
        "x": 20,
        "y": 32
      },
      "end": {
        "x": 80,
        "y": 45
      },
      "corner": {
        "x": 80,
        "y": 32
      }
    },
    {
      "name": "撇",
      "order": 3,
      "path": "M 20,32 L 20,45",
      "start": {
        "x": 20,
        "y": 32
      },
      "end": {
        "x": 20,
        "y": 45
      }
    },
    {
      "name": "竖折折钩",
      "order": 4,
      "path": "M 38,45 L 38,62 L 68,62 L 68,85 L 58,78",
      "start": {
        "x": 38,
        "y": 45
      },
      "end": {
        "x": 58,
        "y": 78
      },
      "corner": {
        "x": 68,
        "y": 62
      }
    },
    {
      "name": "横",
      "order": 5,
      "path": "M 15,85 L 85,85",
      "start": {
        "x": 15,
        "y": 85
      },
      "end": {
        "x": 85,
        "y": 85
      }
    }
  ],
  "confusingChars": [
    "字",
    "与",
    "马",
    "军"
  ]
}
,
{
  "id": "char_071",
  "char": "手",
  "pinyin": "shǒu",
  "pinyinTone": 3,
  "meaning": "人体上肢前端拿东西的部分，也指本领、技能",
  "oracleGlyph": "𠂇",
  "bronzeGlyph": "手",
  "radical": "手",
  "strokeCount": 4,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 15,
  "levelIndex": 1,
  "evolution": {
    "oracle": "甲骨文字形像伸开五指的手掌",
    "bronze": "金文线条圆润，手指分明",
    "seal": "小篆规整化，指掌相连",
    "modern": "现代楷书写作“手”，上部为三指与掌纹"
  },
  "words": [
    {
      "word": "小手",
      "pinyin": "xiǎo shǒu",
      "meaning": "可爱灵巧的小手"
    },
    {
      "word": "双手",
      "pinyin": "shuāng shǒu",
      "meaning": "勤劳的两只手"
    },
    {
      "word": "手表",
      "pinyin": "shǒu biǎo",
      "meaning": "戴在手腕上看时间的钟表"
    }
  ],
  "sentence": "勤劳的小手爱劳动，画出美丽的图画。",
  "gameConfig": {
    "sound": "shou",
    "balloonPopOptions": [
      "手",
      "毛",
      "牛",
      "午"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "撇",
      "order": 1,
      "path": "M 65,22 L 35,35",
      "start": {
        "x": 65,
        "y": 22
      },
      "end": {
        "x": 35,
        "y": 35
      }
    },
    {
      "name": "横",
      "order": 2,
      "path": "M 25,45 L 75,45",
      "start": {
        "x": 25,
        "y": 45
      },
      "end": {
        "x": 75,
        "y": 45
      }
    },
    {
      "name": "横",
      "order": 3,
      "path": "M 15,60 L 85,60",
      "start": {
        "x": 15,
        "y": 60
      },
      "end": {
        "x": 85,
        "y": 60
      }
    },
    {
      "name": "竖钩",
      "order": 4,
      "path": "M 50,22 L 50,88 L 38,78",
      "start": {
        "x": 50,
        "y": 22
      },
      "end": {
        "x": 38,
        "y": 78
      },
      "corner": {
        "x": 50,
        "y": 88
      }
    }
  ],
  "confusingChars": [
    "毛",
    "牛",
    "午",
    "千"
  ]
},
{
  "id": "char_072",
  "char": "足",
  "pinyin": "zú",
  "pinyinTone": 2,
  "meaning": "脚，也指充足、足够",
  "oracleGlyph": "𡲯",
  "bronzeGlyph": "足",
  "radical": "足",
  "strokeCount": 7,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 15,
  "levelIndex": 2,
  "evolution": {
    "oracle": "甲骨文上方是膝盖骨，下方是脚趾与脚掌",
    "bronze": "金文膝盖与小腿形态更清晰",
    "seal": "小篆上面变成口形，下部为止（脚）",
    "modern": "现代楷书写作“足”，表示脚与行走"
  },
  "words": [
    {
      "word": "足球",
      "pinyin": "zú qiú",
      "meaning": "用脚踢的球类运动"
    },
    {
      "word": "双足",
      "pinyin": "shuāng zú",
      "meaning": "两只脚"
    },
    {
      "word": "足够",
      "pinyin": "zú gòu",
      "meaning": "数量充足，达到需要"
    }
  ],
  "sentence": "小朋友在绿茵茵的草地上快乐踢足球。",
  "gameConfig": {
    "sound": "zu",
    "balloonPopOptions": [
      "足",
      "是",
      "定",
      "走"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "竖",
      "order": 1,
      "path": "M 32,20 L 32,42",
      "start": {
        "x": 32,
        "y": 20
      },
      "end": {
        "x": 32,
        "y": 42
      }
    },
    {
      "name": "横折",
      "order": 2,
      "path": "M 32,20 L 68,20 L 68,42",
      "start": {
        "x": 32,
        "y": 20
      },
      "end": {
        "x": 68,
        "y": 42
      },
      "corner": {
        "x": 68,
        "y": 20
      }
    },
    {
      "name": "横",
      "order": 3,
      "path": "M 32,42 L 68,42",
      "start": {
        "x": 32,
        "y": 42
      },
      "end": {
        "x": 68,
        "y": 42
      }
    },
    {
      "name": "竖",
      "order": 4,
      "path": "M 50,42 L 50,65",
      "start": {
        "x": 50,
        "y": 42
      },
      "end": {
        "x": 50,
        "y": 65
      }
    },
    {
      "name": "横",
      "order": 5,
      "path": "M 30,65 L 70,65",
      "start": {
        "x": 30,
        "y": 65
      },
      "end": {
        "x": 70,
        "y": 65
      }
    },
    {
      "name": "撇",
      "order": 6,
      "path": "M 42,66 L 20,88",
      "start": {
        "x": 42,
        "y": 66
      },
      "end": {
        "x": 20,
        "y": 88
      }
    },
    {
      "name": "捺",
      "order": 7,
      "path": "M 58,66 L 85,88",
      "start": {
        "x": 58,
        "y": 66
      },
      "end": {
        "x": 85,
        "y": 88
      }
    }
  ],
  "confusingChars": [
    "是",
    "定",
    "走",
    "疋"
  ]
},
{
  "id": "char_073",
  "char": "耳",
  "pinyin": "ěr",
  "pinyinTone": 3,
  "meaning": "听声音的人体器官，耳朵",
  "oracleGlyph": "𦣞",
  "bronzeGlyph": "耳",
  "radical": "耳",
  "strokeCount": 6,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 15,
  "levelIndex": 3,
  "evolution": {
    "oracle": "甲骨文逼真地描画了耳朵的轮廓与耳蜗",
    "bronze": "金文线条稍作平直",
    "seal": "小篆更加对称规整",
    "modern": "现代楷书写作“耳”"
  },
  "words": [
    {
      "word": "耳朵",
      "pinyin": "ěr duo",
      "meaning": "听声音的感觉器官"
    },
    {
      "word": "木耳",
      "pinyin": "mù ěr",
      "meaning": "生长在树木上的食用菌"
    },
    {
      "word": "双耳",
      "pinyin": "shuāng ěr",
      "meaning": "两只耳朵"
    }
  ],
  "sentence": "小兔子竖起长长的耳朵仔细听声音。",
  "gameConfig": {
    "sound": "er",
    "balloonPopOptions": [
      "耳",
      "目",
      "且",
      "日"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 22,25 L 78,25",
      "start": {
        "x": 22,
        "y": 25
      },
      "end": {
        "x": 78,
        "y": 25
      }
    },
    {
      "name": "竖",
      "order": 2,
      "path": "M 38,26 L 38,78",
      "start": {
        "x": 38,
        "y": 26
      },
      "end": {
        "x": 38,
        "y": 78
      }
    },
    {
      "name": "横",
      "order": 3,
      "path": "M 38,45 L 62,45",
      "start": {
        "x": 38,
        "y": 45
      },
      "end": {
        "x": 62,
        "y": 45
      }
    },
    {
      "name": "横",
      "order": 4,
      "path": "M 38,62 L 62,62",
      "start": {
        "x": 38,
        "y": 62
      },
      "end": {
        "x": 62,
        "y": 62
      }
    },
    {
      "name": "横",
      "order": 5,
      "path": "M 25,78 L 75,78",
      "start": {
        "x": 25,
        "y": 78
      },
      "end": {
        "x": 75,
        "y": 78
      }
    },
    {
      "name": "竖",
      "order": 6,
      "path": "M 62,26 L 62,90",
      "start": {
        "x": 62,
        "y": 26
      },
      "end": {
        "x": 62,
        "y": 90
      }
    }
  ],
  "confusingChars": [
    "目",
    "且",
    "日",
    "自"
  ]
},
{
  "id": "char_074",
  "char": "目",
  "pinyin": "mù",
  "pinyinTone": 4,
  "meaning": "眼睛，也指看或项目",
  "oracleGlyph": "𥃦",
  "bronzeGlyph": "目",
  "radical": "目",
  "strokeCount": 5,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 15,
  "levelIndex": 4,
  "evolution": {
    "oracle": "甲骨文是一只横着看的大眼睛与瞳孔",
    "bronze": "金文眼角轮廓分明",
    "seal": "小篆转为竖直立起来",
    "modern": "现代楷书写作“目”，表示眼睛"
  },
  "words": [
    {
      "word": "目光",
      "pinyin": "mù guāng",
      "meaning": "眼睛看东西的神采"
    },
    {
      "word": "双目",
      "pinyin": "shuāng mù",
      "meaning": "两只明亮的眼睛"
    },
    {
      "word": "题目",
      "pinyin": "tí mù",
      "meaning": "文章或试题的名字"
    }
  ],
  "sentence": "小明有一双明亮清澈的大眼睛，目光如炬。",
  "gameConfig": {
    "sound": "mu",
    "balloonPopOptions": [
      "目",
      "日",
      "田",
      "自"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "竖",
      "order": 1,
      "path": "M 30,20 L 30,85",
      "start": {
        "x": 30,
        "y": 20
      },
      "end": {
        "x": 30,
        "y": 85
      }
    },
    {
      "name": "横折",
      "order": 2,
      "path": "M 30,20 L 70,20 L 70,85",
      "start": {
        "x": 30,
        "y": 20
      },
      "end": {
        "x": 70,
        "y": 85
      },
      "corner": {
        "x": 70,
        "y": 20
      }
    },
    {
      "name": "横",
      "order": 3,
      "path": "M 30,42 L 70,42",
      "start": {
        "x": 30,
        "y": 42
      },
      "end": {
        "x": 70,
        "y": 42
      }
    },
    {
      "name": "横",
      "order": 4,
      "path": "M 30,64 L 70,64",
      "start": {
        "x": 30,
        "y": 64
      },
      "end": {
        "x": 70,
        "y": 64
      }
    },
    {
      "name": "横",
      "order": 5,
      "path": "M 30,85 L 70,85",
      "start": {
        "x": 30,
        "y": 85
      },
      "end": {
        "x": 70,
        "y": 85
      }
    }
  ],
  "confusingChars": [
    "日",
    "田",
    "自",
    "月"
  ]
},
{
  "id": "char_075",
  "char": "身",
  "pinyin": "shēn",
  "pinyinTone": 1,
  "meaning": "人体躯干，身体",
  "oracleGlyph": "𦥑",
  "bronzeGlyph": "身",
  "radical": "身",
  "strokeCount": 7,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 15,
  "levelIndex": 5,
  "evolution": {
    "oracle": "甲骨文像一个挺着肚子的人的侧面体态",
    "bronze": "金文侧身形态更加清晰",
    "seal": "小篆演变为修长的人身形态",
    "modern": "现代楷书写作“身”"
  },
  "words": [
    {
      "word": "身体",
      "pinyin": "shēn tǐ",
      "meaning": "人或动物的躯体"
    },
    {
      "word": "身边",
      "pinyin": "shēn biān",
      "meaning": "身体旁边，靠近的地方"
    },
    {
      "word": "自身",
      "pinyin": "zì shēn",
      "meaning": "自己，本人"
    }
  ],
  "sentence": "每天坚持锻炼身体，个子长得高又壮。",
  "gameConfig": {
    "sound": "shen",
    "balloonPopOptions": [
      "身",
      "射",
      "月",
      "自"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "撇",
      "order": 1,
      "path": "M 48,15 L 38,32",
      "start": {
        "x": 48,
        "y": 15
      },
      "end": {
        "x": 38,
        "y": 32
      }
    },
    {
      "name": "竖",
      "order": 2,
      "path": "M 38,32 L 38,85",
      "start": {
        "x": 38,
        "y": 32
      },
      "end": {
        "x": 38,
        "y": 85
      }
    },
    {
      "name": "横折钩",
      "order": 3,
      "path": "M 38,32 L 68,32 L 68,75 L 55,75",
      "start": {
        "x": 38,
        "y": 32
      },
      "end": {
        "x": 55,
        "y": 75
      },
      "corner": {
        "x": 68,
        "y": 32
      }
    },
    {
      "name": "横",
      "order": 4,
      "path": "M 38,46 L 68,46",
      "start": {
        "x": 38,
        "y": 46
      },
      "end": {
        "x": 68,
        "y": 46
      }
    },
    {
      "name": "横",
      "order": 5,
      "path": "M 38,60 L 68,60",
      "start": {
        "x": 38,
        "y": 60
      },
      "end": {
        "x": 68,
        "y": 60
      }
    },
    {
      "name": "提",
      "order": 6,
      "path": "M 22,75 L 55,68",
      "start": {
        "x": 22,
        "y": 75
      },
      "end": {
        "x": 55,
        "y": 68
      }
    },
    {
      "name": "撇",
      "order": 7,
      "path": "M 75,45 L 25,92",
      "start": {
        "x": 75,
        "y": 45
      },
      "end": {
        "x": 25,
        "y": 92
      }
    }
  ],
  "confusingChars": [
    "射",
    "月",
    "自",
    "由"
  ]
},
{
  "id": "char_076",
  "char": "心",
  "pinyin": "xīn",
  "pinyinTone": 1,
  "meaning": "心脏，引申为心思、情感",
  "oracleGlyph": "𢖰",
  "bronzeGlyph": "心",
  "radical": "心",
  "strokeCount": 4,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 16,
  "levelIndex": 1,
  "evolution": {
    "oracle": "甲骨文像跳动的心脏与血管瓣膜",
    "bronze": "金文突出心室与心房的形状",
    "seal": "小篆更加对称，像盛放爱心的器皿",
    "modern": "现代楷书写作“心”，卧钩加三点"
  },
  "words": [
    {
      "word": "爱心",
      "pinyin": "ài xīn",
      "meaning": "关爱他人的温暖心意"
    },
    {
      "word": "开心",
      "pinyin": "kāi xīn",
      "meaning": "心情愉快，欢喜"
    },
    {
      "word": "心里",
      "pinyin": "xīn lǐ",
      "meaning": "内心深处"
    }
  ],
  "sentence": "小明有一颗善良温暖的爱心，乐于帮助人。",
  "gameConfig": {
    "sound": "xin",
    "balloonPopOptions": [
      "心",
      "必",
      "寸",
      "小"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "点",
      "order": 1,
      "path": "M 28,45 L 22,58",
      "start": {
        "x": 28,
        "y": 45
      },
      "end": {
        "x": 22,
        "y": 58
      }
    },
    {
      "name": "卧钩",
      "order": 2,
      "path": "M 32,58 C 45,85 70,85 80,60 L 72,55",
      "start": {
        "x": 32,
        "y": 58
      },
      "end": {
        "x": 72,
        "y": 55
      },
      "corner": {
        "x": 80,
        "y": 60
      }
    },
    {
      "name": "点",
      "order": 3,
      "path": "M 48,42 L 52,52",
      "start": {
        "x": 48,
        "y": 42
      },
      "end": {
        "x": 52,
        "y": 52
      }
    },
    {
      "name": "点",
      "order": 4,
      "path": "M 75,38 L 80,48",
      "start": {
        "x": 75,
        "y": 38
      },
      "end": {
        "x": 80,
        "y": 48
      }
    }
  ],
  "confusingChars": [
    "必",
    "寸",
    "小",
    "水"
  ]
},
{
  "id": "char_077",
  "char": "一",
  "pinyin": "yī",
  "pinyinTone": 1,
  "meaning": "数字一，数目中最先的一个",
  "oracleGlyph": "一",
  "bronzeGlyph": "一",
  "radical": "一",
  "strokeCount": 1,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 16,
  "levelIndex": 2,
  "evolution": {
    "oracle": "甲骨文用一根算筹表示数字一",
    "bronze": "金文同样写作一横",
    "seal": "小篆形态保持平稳",
    "modern": "现代楷书为标准的一横"
  },
  "words": [
    {
      "word": "一个",
      "pinyin": "yí gè",
      "meaning": "单个的事物"
    },
    {
      "word": "一天",
      "pinyin": "yì tiān",
      "meaning": "一昼夜的时间"
    },
    {
      "word": "第一",
      "pinyin": "dì yī",
      "meaning": "排在最前面的"
    }
  ],
  "sentence": "新的一天开始了，太阳公公露出了笑脸。",
  "gameConfig": {
    "sound": "yi",
    "balloonPopOptions": [
      "一",
      "二",
      "十",
      "七"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 15,50 L 85,50",
      "start": {
        "x": 15,
        "y": 50
      },
      "end": {
        "x": 85,
        "y": 50
      }
    }
  ],
  "confusingChars": [
    "二",
    "十",
    "七",
    "乙"
  ]
},
{
  "id": "char_078",
  "char": "二",
  "pinyin": "èr",
  "pinyinTone": 4,
  "meaning": "数字二，一加一的和",
  "oracleGlyph": "二",
  "bronzeGlyph": "二",
  "radical": "二",
  "strokeCount": 2,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 16,
  "levelIndex": 3,
  "evolution": {
    "oracle": "甲骨文用两根算筹上下平行摆放",
    "bronze": "金文上下两横，下长上短",
    "seal": "小篆平直对称",
    "modern": "现代楷书上短横下长横"
  },
  "words": [
    {
      "word": "两个",
      "pinyin": "liǎng gè",
      "meaning": "一对事物"
    },
    {
      "word": "二月",
      "pinyin": "èr yuè",
      "meaning": "一年的第二个月"
    },
    {
      "word": "第二",
      "pinyin": "dì èr",
      "meaning": "位列第二"
    }
  ],
  "sentence": "操场上有两只小兔子在快乐地跳跃。",
  "gameConfig": {
    "sound": "er",
    "balloonPopOptions": [
      "二",
      "一",
      "三",
      "干"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 25,38 L 75,38",
      "start": {
        "x": 25,
        "y": 38
      },
      "end": {
        "x": 75,
        "y": 38
      }
    },
    {
      "name": "横",
      "order": 2,
      "path": "M 15,68 L 85,68",
      "start": {
        "x": 15,
        "y": 68
      },
      "end": {
        "x": 85,
        "y": 68
      }
    }
  ],
  "confusingChars": [
    "一",
    "三",
    "干",
    "工"
  ]
},
{
  "id": "char_079",
  "char": "三",
  "pinyin": "sān",
  "pinyinTone": 1,
  "meaning": "数字三，二加一的和",
  "oracleGlyph": "三",
  "bronzeGlyph": "三",
  "radical": "一",
  "strokeCount": 3,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 16,
  "levelIndex": 4,
  "evolution": {
    "oracle": "甲骨文用三根算筹表示数字三",
    "bronze": "金文中间一横稍短",
    "seal": "小篆平直美观",
    "modern": "现代楷书写作“三”，上中下三横"
  },
  "words": [
    {
      "word": "三只",
      "pinyin": "sān zhī",
      "meaning": "三个小动物"
    },
    {
      "word": "三天",
      "pinyin": "sān tiān",
      "meaning": "三天的时间"
    },
    {
      "word": "第三",
      "pinyin": "dì sān",
      "meaning": "位列第三"
    }
  ],
  "sentence": "树枝上落着三只美丽的小鸟在唱歌。",
  "gameConfig": {
    "sound": "san",
    "balloonPopOptions": [
      "三",
      "二",
      "王",
      "土"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 22,30 L 78,30",
      "start": {
        "x": 22,
        "y": 30
      },
      "end": {
        "x": 78,
        "y": 30
      }
    },
    {
      "name": "横",
      "order": 2,
      "path": "M 30,50 L 70,50",
      "start": {
        "x": 30,
        "y": 50
      },
      "end": {
        "x": 70,
        "y": 50
      }
    },
    {
      "name": "横",
      "order": 3,
      "path": "M 15,70 L 85,70",
      "start": {
        "x": 15,
        "y": 70
      },
      "end": {
        "x": 85,
        "y": 70
      }
    }
  ],
  "confusingChars": [
    "二",
    "王",
    "土",
    "丰"
  ]
},
{
  "id": "char_080",
  "char": "四",
  "pinyin": "sì",
  "pinyinTone": 4,
  "meaning": "数字四，三加一的和",
  "oracleGlyph": "亖",
  "bronzeGlyph": "四",
  "radical": "囗",
  "strokeCount": 5,
  "stage": 1,
  "themeIsland": "forest",
  "unitIndex": 16,
  "levelIndex": 5,
  "evolution": {
    "oracle": "甲骨文最早写作四横（亖），后假借口中吐气之形",
    "bronze": "金文外框为方口，内含两笔",
    "seal": "小篆规整为大口框内含分笔",
    "modern": "现代楷书写作“四”"
  },
  "words": [
    {
      "word": "四季",
      "pinyin": "sì jì",
      "meaning": "春、夏、秋、冬四个季节"
    },
    {
      "word": "四个",
      "pinyin": "sì gè",
      "meaning": "四个数量"
    },
    {
      "word": "第四",
      "pinyin": "dì sì",
      "meaning": "位列第四"
    }
  ],
  "sentence": "一年有四个美丽的季节，大自然真神奇。",
  "gameConfig": {
    "sound": "si",
    "balloonPopOptions": [
      "四",
      "西",
      "匹",
      "田"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "竖",
      "order": 1,
      "path": "M 22,25 L 22,82",
      "start": {
        "x": 22,
        "y": 25
      },
      "end": {
        "x": 22,
        "y": 82
      }
    },
    {
      "name": "横折",
      "order": 2,
      "path": "M 22,25 L 78,25 L 78,82",
      "start": {
        "x": 22,
        "y": 25
      },
      "end": {
        "x": 78,
        "y": 82
      },
      "corner": {
        "x": 78,
        "y": 25
      }
    },
    {
      "name": "撇",
      "order": 3,
      "path": "M 38,35 L 35,62",
      "start": {
        "x": 38,
        "y": 35
      },
      "end": {
        "x": 35,
        "y": 62
      }
    },
    {
      "name": "竖弯",
      "order": 4,
      "path": "M 55,35 L 55,60 L 68,60",
      "start": {
        "x": 55,
        "y": 35
      },
      "end": {
        "x": 68,
        "y": 60
      },
      "corner": {
        "x": 55,
        "y": 60
      }
    },
    {
      "name": "横",
      "order": 5,
      "path": "M 22,82 L 78,82",
      "start": {
        "x": 22,
        "y": 82
      },
      "end": {
        "x": 78,
        "y": 82
      }
    }
  ],
  "confusingChars": [
    "西",
    "匹",
    "田",
    "回"
  ]
},
{
  "id": "char_081",
  "char": "五",
  "pinyin": "wǔ",
  "pinyinTone": 3,
  "meaning": "数字五，四加一的和",
  "oracleGlyph": "𠄡",
  "bronzeGlyph": "五",
  "radical": "二",
  "strokeCount": 4,
  "stage": 2,
  "themeIsland": "town",
  "unitIndex": 17,
  "levelIndex": 1,
  "evolution": {
    "oracle": "甲骨文写作交叉的十字或交叉算筹",
    "bronze": "金文上下加两横作为天地限制",
    "seal": "小篆线条更加流线规整",
    "modern": "现代楷书写作“五”"
  },
  "words": [
    {
      "word": "五彩",
      "pinyin": "wǔ cǎi",
      "meaning": "色彩斑斓绚丽"
    },
    {
      "word": "五月",
      "pinyin": "wǔ yuè",
      "meaning": "一年的第五个月"
    },
    {
      "word": "五个",
      "pinyin": "wǔ gè",
      "meaning": "五个数量"
    }
  ],
  "sentence": "天空中出现了一道五彩缤纷的彩虹。",
  "gameConfig": {
    "sound": "wu",
    "balloonPopOptions": [
      "五",
      "丑",
      "互",
      "立"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 25,25 L 75,25",
      "start": {
        "x": 25,
        "y": 25
      },
      "end": {
        "x": 75,
        "y": 25
      }
    },
    {
      "name": "竖",
      "order": 2,
      "path": "M 48,25 L 42,80",
      "start": {
        "x": 48,
        "y": 25
      },
      "end": {
        "x": 42,
        "y": 80
      }
    },
    {
      "name": "横折",
      "order": 3,
      "path": "M 45,52 L 68,52 L 68,80",
      "start": {
        "x": 45,
        "y": 52
      },
      "end": {
        "x": 68,
        "y": 80
      },
      "corner": {
        "x": 68,
        "y": 52
      }
    },
    {
      "name": "横",
      "order": 4,
      "path": "M 18,80 L 82,80",
      "start": {
        "x": 18,
        "y": 80
      },
      "end": {
        "x": 82,
        "y": 80
      }
    }
  ],
  "confusingChars": [
    "丑",
    "互",
    "立",
    "亚"
  ]
},
{
  "id": "char_082",
  "char": "六",
  "pinyin": "liù",
  "pinyinTone": 4,
  "meaning": "数字六，五加一的和",
  "oracleGlyph": "𠃛",
  "bronzeGlyph": "六",
  "radical": "八",
  "strokeCount": 4,
  "stage": 2,
  "themeIsland": "town",
  "unitIndex": 17,
  "levelIndex": 2,
  "evolution": {
    "oracle": "甲骨文像一座有屋顶与支柱的棚舍",
    "bronze": "金文棚舍形状简化",
    "seal": "小篆变为点横与八字底",
    "modern": "现代楷书写作“六”"
  },
  "words": [
    {
      "word": "六只",
      "pinyin": "liù zhī",
      "meaning": "六只小动物"
    },
    {
      "word": "六月",
      "pinyin": "liù yuè",
      "meaning": "六月，初夏时节"
    },
    {
      "word": "第六",
      "pinyin": "dì liù",
      "meaning": "排在第六位"
    }
  ],
  "sentence": "六一儿童节是小朋友们最快乐的节日。",
  "gameConfig": {
    "sound": "liu",
    "balloonPopOptions": [
      "六",
      "大",
      "文",
      "立"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "点",
      "order": 1,
      "path": "M 50,18 L 50,30",
      "start": {
        "x": 50,
        "y": 18
      },
      "end": {
        "x": 50,
        "y": 30
      }
    },
    {
      "name": "横",
      "order": 2,
      "path": "M 20,38 L 80,38",
      "start": {
        "x": 20,
        "y": 38
      },
      "end": {
        "x": 80,
        "y": 38
      }
    },
    {
      "name": "撇",
      "order": 3,
      "path": "M 42,48 L 25,82",
      "start": {
        "x": 42,
        "y": 48
      },
      "end": {
        "x": 25,
        "y": 82
      }
    },
    {
      "name": "点",
      "order": 4,
      "path": "M 58,48 L 75,82",
      "start": {
        "x": 58,
        "y": 48
      },
      "end": {
        "x": 75,
        "y": 82
      }
    }
  ],
  "confusingChars": [
    "大",
    "文",
    "立",
    "八"
  ]
},
{
  "id": "char_083",
  "char": "七",
  "pinyin": "qī",
  "pinyinTone": 1,
  "meaning": "数字七，六加一的和",
  "oracleGlyph": "十",
  "bronzeGlyph": "七",
  "radical": "一",
  "strokeCount": 2,
  "stage": 2,
  "themeIsland": "town",
  "unitIndex": 17,
  "levelIndex": 3,
  "evolution": {
    "oracle": "甲骨文像一根竖木被一横切断（切的本字）",
    "bronze": "金文竖笔向右弯曲",
    "seal": "小篆弯钩更加明显",
    "modern": "现代楷书写作“七”，横加竖弯钩"
  },
  "words": [
    {
      "word": "七彩",
      "pinyin": "qī cǎi",
      "meaning": "七种美丽色彩"
    },
    {
      "word": "七天",
      "pinyin": "qī tiān",
      "meaning": "一个星期七天"
    },
    {
      "word": "第七",
      "pinyin": "dì qī",
      "meaning": "排在第七位"
    }
  ],
  "sentence": "雨后天晴，天空中挂起美丽的七色彩虹。",
  "gameConfig": {
    "sound": "qi",
    "balloonPopOptions": [
      "七",
      "十",
      "匕",
      "九"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 20,48 L 80,42",
      "start": {
        "x": 20,
        "y": 48
      },
      "end": {
        "x": 80,
        "y": 42
      }
    },
    {
      "name": "竖弯钩",
      "order": 2,
      "path": "M 48,20 L 48,78 L 78,78 L 78,65",
      "start": {
        "x": 48,
        "y": 20
      },
      "end": {
        "x": 78,
        "y": 65
      },
      "corner": {
        "x": 48,
        "y": 78
      }
    }
  ],
  "confusingChars": [
    "十",
    "匕",
    "九",
    "丁"
  ]
},
{
  "id": "char_084",
  "char": "八",
  "pinyin": "bā",
  "pinyinTone": 1,
  "meaning": "数字八，七加一的和",
  "oracleGlyph": "八",
  "bronzeGlyph": "八",
  "radical": "八",
  "strokeCount": 2,
  "stage": 2,
  "themeIsland": "town",
  "unitIndex": 17,
  "levelIndex": 4,
  "evolution": {
    "oracle": "甲骨文像两道相背分开的线条，本义为相背分开",
    "bronze": "金文形态保持两笔分开",
    "seal": "小篆左撇右捺对称相背",
    "modern": "现代楷书写作“八”，一撇一捺"
  },
  "words": [
    {
      "word": "八月",
      "pinyin": "bā yuè",
      "meaning": "八月金秋"
    },
    {
      "word": "八个",
      "pinyin": "bā gè",
      "meaning": "八个数量"
    },
    {
      "word": "第八",
      "pinyin": "dì bā",
      "meaning": "位列第八"
    }
  ],
  "sentence": "八月中秋月儿圆，全家人一起吃月饼。",
  "gameConfig": {
    "sound": "ba",
    "balloonPopOptions": [
      "八",
      "人",
      "入",
      "个"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "撇",
      "order": 1,
      "path": "M 42,28 L 22,78",
      "start": {
        "x": 42,
        "y": 28
      },
      "end": {
        "x": 22,
        "y": 78
      }
    },
    {
      "name": "捺",
      "order": 2,
      "path": "M 58,22 L 78,78",
      "start": {
        "x": 58,
        "y": 22
      },
      "end": {
        "x": 78,
        "y": 78
      }
    }
  ],
  "confusingChars": [
    "人",
    "入",
    "个",
    "大"
  ]
},
{
  "id": "char_085",
  "char": "九",
  "pinyin": "jiǔ",
  "pinyinTone": 3,
  "meaning": "数字九，八加一的和，个位数中最大的数",
  "oracleGlyph": "𠤭",
  "bronzeGlyph": "九",
  "radical": "丿",
  "strokeCount": 2,
  "stage": 2,
  "themeIsland": "town",
  "unitIndex": 17,
  "levelIndex": 5,
  "evolution": {
    "oracle": "甲骨文像一条屈曲蜿蜒的手臂伸出手指",
    "bronze": "金文弯曲幅度加大",
    "seal": "小篆演化为斜撇与横折弯钩",
    "modern": "现代楷书写作“九”"
  },
  "words": [
    {
      "word": "九月",
      "pinyin": "jiǔ yuè",
      "meaning": "九月秋高气爽"
    },
    {
      "word": "九个",
      "pinyin": "jiǔ gè",
      "meaning": "九个数量"
    },
    {
      "word": "第九",
      "pinyin": "dì jiǔ",
      "meaning": "位列第九"
    }
  ],
  "sentence": "九月是开学的季节，我们背上书包上学去。",
  "gameConfig": {
    "sound": "jiu",
    "balloonPopOptions": [
      "九",
      "几",
      "力",
      "丸"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "撇",
      "order": 1,
      "path": "M 48,20 L 32,82",
      "start": {
        "x": 48,
        "y": 20
      },
      "end": {
        "x": 32,
        "y": 82
      }
    },
    {
      "name": "横折弯钩",
      "order": 2,
      "path": "M 28,38 L 68,38 L 52,65 L 75,78 L 72,62",
      "start": {
        "x": 28,
        "y": 38
      },
      "end": {
        "x": 72,
        "y": 62
      },
      "corner": {
        "x": 68,
        "y": 38
      }
    }
  ],
  "confusingChars": [
    "几",
    "力",
    "丸",
    "刀"
  ]
},
{
  "id": "char_086",
  "char": "十",
  "pinyin": "shí",
  "pinyinTone": 2,
  "meaning": "数字十，九加一的和，十全十美",
  "oracleGlyph": "丨",
  "bronzeGlyph": "十",
  "radical": "十",
  "strokeCount": 2,
  "stage": 2,
  "themeIsland": "town",
  "unitIndex": 18,
  "levelIndex": 1,
  "evolution": {
    "oracle": "甲骨文用一根竖放的算筹并在中间打结表示满十",
    "bronze": "金文中间圆点扩大为粗横",
    "seal": "小篆演变为正十字架",
    "modern": "现代楷书为标准的一横一竖"
  },
  "words": [
    {
      "word": "十个",
      "pinyin": "shí gè",
      "meaning": "十个数量"
    },
    {
      "word": "十分",
      "pinyin": "shí fēn",
      "meaning": "非常，极度"
    },
    {
      "word": "十全十美",
      "pinyin": "shí quán shí měi",
      "meaning": "各方面都很完美"
    }
  ],
  "sentence": "小红做事情非常认真，表现得十分优秀。",
  "gameConfig": {
    "sound": "shi",
    "balloonPopOptions": [
      "十",
      "七",
      "千",
      "土"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 18,50 L 82,50",
      "start": {
        "x": 18,
        "y": 50
      },
      "end": {
        "x": 82,
        "y": 50
      }
    },
    {
      "name": "竖",
      "order": 2,
      "path": "M 50,18 L 50,82",
      "start": {
        "x": 50,
        "y": 18
      },
      "end": {
        "x": 50,
        "y": 82
      }
    }
  ],
  "confusingChars": [
    "七",
    "千",
    "土",
    "干"
  ]
},
{
  "id": "char_087",
  "char": "百",
  "pinyin": "bǎi",
  "pinyinTone": 3,
  "meaning": "数字百，十个十，也表示很多",
  "oracleGlyph": "𠚕",
  "bronzeGlyph": "百",
  "radical": "白",
  "strokeCount": 6,
  "stage": 2,
  "themeIsland": "town",
  "unitIndex": 18,
  "levelIndex": 2,
  "evolution": {
    "oracle": "甲骨文是在白字上方加一横指事符号",
    "bronze": "金文一横与白结合",
    "seal": "小篆更加匀称",
    "modern": "现代楷书写作“百”"
  },
  "words": [
    {
      "word": "一百",
      "pinyin": "yì bǎi",
      "meaning": "十个十的数目"
    },
    {
      "word": "百花",
      "pinyin": "bǎi huā",
      "meaning": "各种各样的花朵"
    },
    {
      "word": "百姓",
      "pinyin": "bǎi xìng",
      "meaning": "广大人民群众"
    }
  ],
  "sentence": "春天来了，公园里百花齐放，美丽极了。",
  "gameConfig": {
    "sound": "bai",
    "balloonPopOptions": [
      "百",
      "白",
      "自",
      "面"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 20,25 L 80,25",
      "start": {
        "x": 20,
        "y": 25
      },
      "end": {
        "x": 80,
        "y": 25
      }
    },
    {
      "name": "撇",
      "order": 2,
      "path": "M 50,26 L 40,42",
      "start": {
        "x": 50,
        "y": 26
      },
      "end": {
        "x": 40,
        "y": 42
      }
    },
    {
      "name": "竖",
      "order": 3,
      "path": "M 32,42 L 32,85",
      "start": {
        "x": 32,
        "y": 42
      },
      "end": {
        "x": 32,
        "y": 85
      }
    },
    {
      "name": "横折",
      "order": 4,
      "path": "M 32,42 L 68,42 L 68,85",
      "start": {
        "x": 32,
        "y": 42
      },
      "end": {
        "x": 68,
        "y": 85
      },
      "corner": {
        "x": 68,
        "y": 42
      }
    },
    {
      "name": "横",
      "order": 5,
      "path": "M 32,64 L 68,64",
      "start": {
        "x": 32,
        "y": 64
      },
      "end": {
        "x": 68,
        "y": 64
      }
    },
    {
      "name": "横",
      "order": 6,
      "path": "M 32,85 L 68,85",
      "start": {
        "x": 32,
        "y": 85
      },
      "end": {
        "x": 68,
        "y": 85
      }
    }
  ],
  "confusingChars": [
    "白",
    "自",
    "面",
    "首"
  ]
},
{
  "id": "char_088",
  "char": "千",
  "pinyin": "qiān",
  "pinyinTone": 1,
  "meaning": "数字千，十个百，表示极多",
  "oracleGlyph": "𠦃",
  "bronzeGlyph": "千",
  "radical": "十",
  "strokeCount": 3,
  "stage": 2,
  "themeIsland": "town",
  "unitIndex": 18,
  "levelIndex": 3,
  "evolution": {
    "oracle": "甲骨文是在人字小腿上加一横，表示千数",
    "bronze": "金文人字头与一横相接",
    "seal": "小篆演化为短撇与十字相连",
    "modern": "现代楷书写作“千”"
  },
  "words": [
    {
      "word": "一千",
      "pinyin": "yì qiān",
      "meaning": "十个百的数目"
    },
    {
      "word": "千万",
      "pinyin": "qiān wàn",
      "meaning": "形容极多，或务必"
    },
    {
      "word": "秋千",
      "pinyin": "qiū qiān",
      "meaning": "儿童喜欢的秋千玩具"
    }
  ],
  "sentence": "小树林里有千万棵大树，郁郁葱葱。",
  "gameConfig": {
    "sound": "qian",
    "balloonPopOptions": [
      "千",
      "十",
      "干",
      "于"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "撇",
      "order": 1,
      "path": "M 65,22 L 35,35",
      "start": {
        "x": 65,
        "y": 22
      },
      "end": {
        "x": 35,
        "y": 35
      }
    },
    {
      "name": "横",
      "order": 2,
      "path": "M 20,48 L 80,48",
      "start": {
        "x": 20,
        "y": 48
      },
      "end": {
        "x": 80,
        "y": 48
      }
    },
    {
      "name": "竖",
      "order": 3,
      "path": "M 50,35 L 50,88",
      "start": {
        "x": 50,
        "y": 35
      },
      "end": {
        "x": 50,
        "y": 88
      }
    }
  ],
  "confusingChars": [
    "十",
    "干",
    "于",
    "午"
  ]
},
{
  "id": "char_089",
  "char": "上",
  "pinyin": "shàng",
  "pinyinTone": 4,
  "meaning": "方位上，高处，也指上升、去往",
  "oracleGlyph": "丄",
  "bronzeGlyph": "上",
  "radical": "一",
  "strokeCount": 3,
  "stage": 2,
  "themeIsland": "town",
  "unitIndex": 18,
  "levelIndex": 4,
  "evolution": {
    "oracle": "甲骨文在基准长横之上画一短横指明位置（指事字）",
    "bronze": "金文短横演变为竖笔与短横",
    "seal": "小篆更加稳定",
    "modern": "现代楷书写作“上”"
  },
  "words": [
    {
      "word": "上学",
      "pinyin": "shàng xué",
      "meaning": "去学校学习"
    },
    {
      "word": "上面",
      "pinyin": "shàng miàn",
      "meaning": "位置较高的那一面"
    },
    {
      "word": "早上",
      "pinyin": "zǎo shang",
      "meaning": "早晨太阳升起的时候"
    }
  ],
  "sentence": "早晨背上漂亮的书包，高高兴兴上学去。",
  "gameConfig": {
    "sound": "shang",
    "balloonPopOptions": [
      "上",
      "下",
      "土",
      "卡"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "竖",
      "order": 1,
      "path": "M 50,22 L 50,75",
      "start": {
        "x": 50,
        "y": 22
      },
      "end": {
        "x": 50,
        "y": 75
      }
    },
    {
      "name": "横",
      "order": 2,
      "path": "M 50,48 L 78,48",
      "start": {
        "x": 50,
        "y": 48
      },
      "end": {
        "x": 78,
        "y": 48
      }
    },
    {
      "name": "横",
      "order": 3,
      "path": "M 18,75 L 82,75",
      "start": {
        "x": 18,
        "y": 75
      },
      "end": {
        "x": 82,
        "y": 75
      }
    }
  ],
  "confusingChars": [
    "下",
    "土",
    "卡",
    "正"
  ]
},
{
  "id": "char_090",
  "char": "下",
  "pinyin": "xià",
  "pinyinTone": 4,
  "meaning": "方位下，低处，也指降落、下来",
  "oracleGlyph": "丅",
  "bronzeGlyph": "下",
  "radical": "一",
  "strokeCount": 3,
  "stage": 2,
  "themeIsland": "town",
  "unitIndex": 18,
  "levelIndex": 5,
  "evolution": {
    "oracle": "甲骨文在基准长横之下画一短横指明下方位置",
    "bronze": "金文短横与竖笔结合",
    "seal": "小篆规范指事线条",
    "modern": "现代楷书写作“下”，长横加竖点"
  },
  "words": [
    {
      "word": "下雨",
      "pinyin": "xià yǔ",
      "meaning": "天空中降落雨滴"
    },
    {
      "word": "下面",
      "pinyin": "xià miàn",
      "meaning": "位置较低的一面"
    },
    {
      "word": "下午",
      "pinyin": "xià wǔ",
      "meaning": "中午以后的时间"
    }
  ],
  "sentence": "天空下起了蒙蒙细雨，禾苗喝得饱饱的。",
  "gameConfig": {
    "sound": "xia",
    "balloonPopOptions": [
      "下",
      "上",
      "不",
      "卜"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 18,25 L 82,25",
      "start": {
        "x": 18,
        "y": 25
      },
      "end": {
        "x": 82,
        "y": 25
      }
    },
    {
      "name": "竖",
      "order": 2,
      "path": "M 50,25 L 50,82",
      "start": {
        "x": 50,
        "y": 25
      },
      "end": {
        "x": 50,
        "y": 82
      }
    },
    {
      "name": "点",
      "order": 3,
      "path": "M 52,48 L 75,65",
      "start": {
        "x": 52,
        "y": 48
      },
      "end": {
        "x": 75,
        "y": 65
      }
    }
  ],
  "confusingChars": [
    "上",
    "不",
    "卜",
    "卡"
  ]
},
{
  "id": "char_091",
  "char": "左",
  "pinyin": "zuǒ",
  "pinyinTone": 3,
  "meaning": "方位左，面向南时东的一边",
  "oracleGlyph": "𠂇",
  "bronzeGlyph": "左",
  "radical": "工",
  "strokeCount": 5,
  "stage": 3,
  "themeIsland": "space",
  "unitIndex": 19,
  "levelIndex": 1,
  "evolution": {
    "oracle": "甲骨文画的是一只向左伸出的手",
    "bronze": "金文手下加上工具“工”，表示持工具辅佐",
    "seal": "小篆更加方正规矩",
    "modern": "现代楷书写作“左”"
  },
  "words": [
    {
      "word": "左手",
      "pinyin": "zuǒ shǒu",
      "meaning": "身体左侧的手"
    },
    {
      "word": "左边",
      "pinyin": "zuǒ biān",
      "meaning": "左侧的方向"
    },
    {
      "word": "左右",
      "pinyin": "zuǒ yòu",
      "meaning": "左右两边，也表示大约"
    }
  ],
  "sentence": "过马路时要先看左边，再看右边，注意安全。",
  "gameConfig": {
    "sound": "zuo",
    "balloonPopOptions": [
      "左",
      "右",
      "在",
      "友"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 22,30 L 78,30",
      "start": {
        "x": 22,
        "y": 30
      },
      "end": {
        "x": 78,
        "y": 30
      }
    },
    {
      "name": "撇",
      "order": 2,
      "path": "M 50,15 L 20,80",
      "start": {
        "x": 50,
        "y": 15
      },
      "end": {
        "x": 20,
        "y": 80
      }
    },
    {
      "name": "横",
      "order": 3,
      "path": "M 38,55 L 72,55",
      "start": {
        "x": 38,
        "y": 55
      },
      "end": {
        "x": 72,
        "y": 55
      }
    },
    {
      "name": "竖",
      "order": 4,
      "path": "M 55,55 L 55,80",
      "start": {
        "x": 55,
        "y": 55
      },
      "end": {
        "x": 55,
        "y": 80
      }
    },
    {
      "name": "横",
      "order": 5,
      "path": "M 32,80 L 78,80",
      "start": {
        "x": 32,
        "y": 80
      },
      "end": {
        "x": 78,
        "y": 80
      }
    }
  ],
  "confusingChars": [
    "右",
    "在",
    "友",
    "灰"
  ]
},
{
  "id": "char_092",
  "char": "右",
  "pinyin": "yòu",
  "pinyinTone": 4,
  "meaning": "方位右，面向南时西的一边",
  "oracleGlyph": "𠂇",
  "bronzeGlyph": "右",
  "radical": "口",
  "strokeCount": 5,
  "stage": 3,
  "themeIsland": "space",
  "unitIndex": 19,
  "levelIndex": 2,
  "evolution": {
    "oracle": "甲骨文是一只向右伸出的右手",
    "bronze": "金文在手下加“口”，表示用手进食或说话相助",
    "seal": "小篆更加对称",
    "modern": "现代楷书写作“右”"
  },
  "words": [
    {
      "word": "右手",
      "pinyin": "yòu shǒu",
      "meaning": "身体右侧的手"
    },
    {
      "word": "右边",
      "pinyin": "yòu biān",
      "meaning": "右侧的方向"
    },
    {
      "word": "向右转",
      "pinyin": "xiàng yòu zhuǎn",
      "meaning": "朝右边转身"
    }
  ],
  "sentence": "同学们排好整齐的队伍，一起向右看齐。",
  "gameConfig": {
    "sound": "you",
    "balloonPopOptions": [
      "右",
      "左",
      "石",
      "古"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 22,30 L 78,30",
      "start": {
        "x": 22,
        "y": 30
      },
      "end": {
        "x": 78,
        "y": 30
      }
    },
    {
      "name": "撇",
      "order": 2,
      "path": "M 50,15 L 20,80",
      "start": {
        "x": 50,
        "y": 15
      },
      "end": {
        "x": 20,
        "y": 80
      }
    },
    {
      "name": "竖",
      "order": 3,
      "path": "M 38,55 L 38,82",
      "start": {
        "x": 38,
        "y": 55
      },
      "end": {
        "x": 38,
        "y": 82
      }
    },
    {
      "name": "横折",
      "order": 4,
      "path": "M 38,55 L 75,55 L 75,82",
      "start": {
        "x": 38,
        "y": 55
      },
      "end": {
        "x": 75,
        "y": 82
      },
      "corner": {
        "x": 75,
        "y": 55
      }
    },
    {
      "name": "横",
      "order": 5,
      "path": "M 38,82 L 75,82",
      "start": {
        "x": 38,
        "y": 82
      },
      "end": {
        "x": 75,
        "y": 82
      }
    }
  ],
  "confusingChars": [
    "左",
    "石",
    "古",
    "在"
  ]
},
{
  "id": "char_093",
  "char": "大",
  "pinyin": "dà",
  "pinyinTone": 4,
  "meaning": "指在体积、数量、力量等方面超过一般，与小相对",
  "oracleGlyph": "大",
  "bronzeGlyph": "大",
  "radical": "大",
  "strokeCount": 3,
  "stage": 3,
  "themeIsland": "space",
  "unitIndex": 19,
  "levelIndex": 3,
  "evolution": {
    "oracle": "甲骨文像一个正面站立、张开双臂双腿的大人",
    "bronze": "金文身形更为壮硕",
    "seal": "小篆更加对称规整",
    "modern": "现代楷书写作“大”，一横一撇一捺"
  },
  "words": [
    {
      "word": "大小",
      "pinyin": "dà xiǎo",
      "meaning": "物体的尺寸高低"
    },
    {
      "word": "大家",
      "pinyin": "dà jiā",
      "meaning": "所有的人，众人"
    },
    {
      "word": "大人",
      "pinyin": "dà rén",
      "meaning": "成年人"
    }
  ],
  "sentence": "大象的身子像一堵厚厚的大墙，非常高大。",
  "gameConfig": {
    "sound": "da",
    "balloonPopOptions": [
      "大",
      "太",
      "犬",
      "天"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 18,35 L 82,35",
      "start": {
        "x": 18,
        "y": 35
      },
      "end": {
        "x": 82,
        "y": 35
      }
    },
    {
      "name": "撇",
      "order": 2,
      "path": "M 50,15 L 22,85",
      "start": {
        "x": 50,
        "y": 15
      },
      "end": {
        "x": 22,
        "y": 85
      }
    },
    {
      "name": "捺",
      "order": 3,
      "path": "M 50,35 L 78,85",
      "start": {
        "x": 50,
        "y": 35
      },
      "end": {
        "x": 78,
        "y": 85
      }
    }
  ],
  "confusingChars": [
    "太",
    "犬",
    "天",
    "木"
  ]
},
{
  "id": "char_094",
  "char": "小",
  "pinyin": "xiǎo",
  "pinyinTone": 3,
  "meaning": "指在体积、数量、年龄等方面不及一般，与大相对",
  "oracleGlyph": "小",
  "bronzeGlyph": "小",
  "radical": "小",
  "strokeCount": 3,
  "stage": 3,
  "themeIsland": "space",
  "unitIndex": 19,
  "levelIndex": 4,
  "evolution": {
    "oracle": "甲骨文像三颗细小的沙粒或微小水滴",
    "bronze": "金文中间竖起，两旁两点",
    "seal": "小篆演变为竖钩与左右两点",
    "modern": "现代楷书写作“小”"
  },
  "words": [
    {
      "word": "小朋友",
      "pinyin": "xiǎo péng yǒu",
      "meaning": "可爱的小孩子们"
    },
    {
      "word": "小草",
      "pinyin": "xiǎo cǎo",
      "meaning": "嫩绿的小植物"
    },
    {
      "word": "小鸟",
      "pinyin": "xiǎo niǎo",
      "meaning": "天空中飞翔的小动物"
    }
  ],
  "sentence": "小鸟在树枝上欢快地唱歌，春意盎然。",
  "gameConfig": {
    "sound": "xiao",
    "balloonPopOptions": [
      "小",
      "少",
      "水",
      "心"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "竖钩",
      "order": 1,
      "path": "M 50,18 L 50,85 L 38,72",
      "start": {
        "x": 50,
        "y": 18
      },
      "end": {
        "x": 38,
        "y": 72
      },
      "corner": {
        "x": 50,
        "y": 85
      }
    },
    {
      "name": "撇点",
      "order": 2,
      "path": "M 32,42 L 20,60",
      "start": {
        "x": 32,
        "y": 42
      },
      "end": {
        "x": 20,
        "y": 60
      }
    },
    {
      "name": "点",
      "order": 3,
      "path": "M 68,42 L 80,60",
      "start": {
        "x": 68,
        "y": 42
      },
      "end": {
        "x": 80,
        "y": 60
      }
    }
  ],
  "confusingChars": [
    "少",
    "水",
    "心",
    "不"
  ]
},
{
  "id": "char_095",
  "char": "中",
  "pinyin": "zhōng",
  "pinyinTone": 1,
  "meaning": "位置在中间，不偏不倚，也指中国",
  "oracleGlyph": "𠁩",
  "bronzeGlyph": "中",
  "radical": "丨",
  "strokeCount": 4,
  "stage": 3,
  "themeIsland": "space",
  "unitIndex": 19,
  "levelIndex": 5,
  "evolution": {
    "oracle": "甲骨文像一面带有飘带的旗帜插在正中央",
    "bronze": "金文旗身变成方口形",
    "seal": "小篆一竖贯穿方框中央",
    "modern": "现代楷书写作“中”"
  },
  "words": [
    {
      "word": "中间",
      "pinyin": "zhōng jiān",
      "meaning": "正中央的位置"
    },
    {
      "word": "中国",
      "pinyin": "zhōng guó",
      "meaning": "我们伟大的祖国"
    },
    {
      "word": "中午",
      "pinyin": "zhōng wǔ",
      "meaning": "白天十二点左右"
    }
  ],
  "sentence": "红旗在广场正中央高高飘扬，十分壮观。",
  "gameConfig": {
    "sound": "zhong",
    "balloonPopOptions": [
      "中",
      "申",
      "甲",
      "由"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "竖",
      "order": 1,
      "path": "M 25,32 L 25,65",
      "start": {
        "x": 25,
        "y": 32
      },
      "end": {
        "x": 25,
        "y": 65
      }
    },
    {
      "name": "横折",
      "order": 2,
      "path": "M 25,32 L 75,32 L 75,65",
      "start": {
        "x": 25,
        "y": 32
      },
      "end": {
        "x": 75,
        "y": 65
      },
      "corner": {
        "x": 75,
        "y": 32
      }
    },
    {
      "name": "横",
      "order": 3,
      "path": "M 25,65 L 75,65",
      "start": {
        "x": 25,
        "y": 65
      },
      "end": {
        "x": 75,
        "y": 65
      }
    },
    {
      "name": "竖",
      "order": 4,
      "path": "M 50,15 L 50,88",
      "start": {
        "x": 50,
        "y": 15
      },
      "end": {
        "x": 50,
        "y": 88
      }
    }
  ],
  "confusingChars": [
    "申",
    "甲",
    "由",
    "口"
  ]
},
{
  "id": "char_096",
  "char": "多",
  "pinyin": "duō",
  "pinyinTone": 1,
  "meaning": "数量大，与少相对",
  "oracleGlyph": "𡖇",
  "bronzeGlyph": "多",
  "radical": "夕",
  "strokeCount": 6,
  "stage": 3,
  "themeIsland": "space",
  "unitIndex": 20,
  "levelIndex": 1,
  "evolution": {
    "oracle": "甲骨文由两块肉叠放在一起表示重叠丰富",
    "bronze": "金文上下两块肉形态更分明",
    "seal": "小篆肉演化为两个夕字相叠",
    "modern": "现代楷书写作“多”"
  },
  "words": [
    {
      "word": "许多",
      "pinyin": "xǔ duō",
      "meaning": "大量的，很多"
    },
    {
      "word": "多么",
      "pinyin": "duō me",
      "meaning": "表示程度极深"
    },
    {
      "word": "多彩",
      "pinyin": "duō cǎi",
      "meaning": "丰富多彩"
    }
  ],
  "sentence": "花园里开满了许多五颜六色的鲜花。",
  "gameConfig": {
    "sound": "duo",
    "balloonPopOptions": [
      "多",
      "夕",
      "名",
      "外"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "撇",
      "order": 1,
      "path": "M 50,15 L 35,32",
      "start": {
        "x": 50,
        "y": 15
      },
      "end": {
        "x": 35,
        "y": 32
      }
    },
    {
      "name": "横撇",
      "order": 2,
      "path": "M 35,32 L 68,32 L 40,55",
      "start": {
        "x": 35,
        "y": 32
      },
      "end": {
        "x": 40,
        "y": 55
      },
      "corner": {
        "x": 68,
        "y": 32
      }
    },
    {
      "name": "点",
      "order": 3,
      "path": "M 50,42 L 55,48",
      "start": {
        "x": 50,
        "y": 42
      },
      "end": {
        "x": 55,
        "y": 48
      }
    },
    {
      "name": "撇",
      "order": 4,
      "path": "M 48,55 L 32,72",
      "start": {
        "x": 48,
        "y": 55
      },
      "end": {
        "x": 32,
        "y": 72
      }
    },
    {
      "name": "横撇",
      "order": 5,
      "path": "M 32,72 L 72,72 L 45,92",
      "start": {
        "x": 32,
        "y": 72
      },
      "end": {
        "x": 45,
        "y": 92
      },
      "corner": {
        "x": 72,
        "y": 72
      }
    },
    {
      "name": "点",
      "order": 6,
      "path": "M 52,80 L 58,88",
      "start": {
        "x": 52,
        "y": 80
      },
      "end": {
        "x": 58,
        "y": 88
      }
    }
  ],
  "confusingChars": [
    "夕",
    "名",
    "外",
    "夜"
  ]
},
{
  "id": "char_097",
  "char": "少",
  "pinyin": "shǎo",
  "pinyinTone": 3,
  "meaning": "数量小，与多相对；也读 shào，指年轻",
  "oracleGlyph": "𡭕",
  "bronzeGlyph": "少",
  "radical": "小",
  "strokeCount": 4,
  "stage": 3,
  "themeIsland": "space",
  "unitIndex": 20,
  "levelIndex": 2,
  "evolution": {
    "oracle": "甲骨文是在三个小沙粒旁加一撇指事符号",
    "bronze": "金文形体同小字相近",
    "seal": "小篆在小字下方加长撇",
    "modern": "现代楷书写作“少”"
  },
  "words": [
    {
      "word": "多少",
      "pinyin": "duō shao",
      "meaning": "询问数量"
    },
    {
      "word": "少年",
      "pinyin": "shào nián",
      "meaning": "朝气蓬勃的少年儿童"
    },
    {
      "word": "很少",
      "pinyin": "hěn shǎo",
      "meaning": "数量极少"
    }
  ],
  "sentence": "少年儿童像早晨八九点钟的太阳，充满希望。",
  "gameConfig": {
    "sound": "shao",
    "balloonPopOptions": [
      "少",
      "小",
      "水",
      "步"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "竖",
      "order": 1,
      "path": "M 50,18 L 50,60",
      "start": {
        "x": 50,
        "y": 18
      },
      "end": {
        "x": 50,
        "y": 60
      }
    },
    {
      "name": "点",
      "order": 2,
      "path": "M 32,38 L 22,55",
      "start": {
        "x": 32,
        "y": 38
      },
      "end": {
        "x": 22,
        "y": 55
      }
    },
    {
      "name": "撇点",
      "order": 3,
      "path": "M 68,38 L 78,55",
      "start": {
        "x": 68,
        "y": 38
      },
      "end": {
        "x": 78,
        "y": 55
      }
    },
    {
      "name": "撇",
      "order": 4,
      "path": "M 75,48 L 20,88",
      "start": {
        "x": 75,
        "y": 48
      },
      "end": {
        "x": 20,
        "y": 88
      }
    }
  ],
  "confusingChars": [
    "小",
    "水",
    "步",
    "沙"
  ]
},
{
  "id": "char_098",
  "char": "雨",
  "pinyin": "yǔ",
  "pinyinTone": 3,
  "meaning": "从云层中降落的水滴",
  "oracleGlyph": "𩁹",
  "bronzeGlyph": "雨",
  "radical": "雨",
  "strokeCount": 8,
  "stage": 3,
  "themeIsland": "space",
  "unitIndex": 20,
  "levelIndex": 3,
  "evolution": {
    "oracle": "甲骨文上方是一横象征天空与云层，下方落下一颗颗水滴",
    "bronze": "金文水滴形态更饱满",
    "seal": "小篆外框成罩，内有四个水滴点",
    "modern": "现代楷书写作“雨”"
  },
  "words": [
    {
      "word": "下雨",
      "pinyin": "xià yǔ",
      "meaning": "天降甘霖"
    },
    {
      "word": "雨滴",
      "pinyin": "yǔ dī",
      "meaning": "一滴滴晶莹的雨水"
    },
    {
      "word": "雨伞",
      "pinyin": "yǔ sǎn",
      "meaning": "下雨天遮雨的工具"
    }
  ],
  "sentence": "春雨沙沙地下，滋润着大地上的小树苗。",
  "gameConfig": {
    "sound": "yu",
    "balloonPopOptions": [
      "雨",
      "两",
      "雪",
      "西"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 25,20 L 75,20",
      "start": {
        "x": 25,
        "y": 20
      },
      "end": {
        "x": 75,
        "y": 20
      }
    },
    {
      "name": "竖",
      "order": 2,
      "path": "M 50,20 L 50,40",
      "start": {
        "x": 50,
        "y": 20
      },
      "end": {
        "x": 50,
        "y": 40
      }
    },
    {
      "name": "横折钩",
      "order": 3,
      "path": "M 20,40 L 80,40 L 80,82 L 72,75",
      "start": {
        "x": 20,
        "y": 40
      },
      "end": {
        "x": 72,
        "y": 75
      },
      "corner": {
        "x": 80,
        "y": 40
      }
    },
    {
      "name": "竖",
      "order": 4,
      "path": "M 50,40 L 50,82",
      "start": {
        "x": 50,
        "y": 40
      },
      "end": {
        "x": 50,
        "y": 82
      }
    },
    {
      "name": "点",
      "order": 5,
      "path": "M 32,50 L 35,58",
      "start": {
        "x": 32,
        "y": 50
      },
      "end": {
        "x": 35,
        "y": 58
      }
    },
    {
      "name": "点",
      "order": 6,
      "path": "M 32,68 L 35,76",
      "start": {
        "x": 32,
        "y": 68
      },
      "end": {
        "x": 35,
        "y": 76
      }
    },
    {
      "name": "点",
      "order": 7,
      "path": "M 65,50 L 68,58",
      "start": {
        "x": 65,
        "y": 50
      },
      "end": {
        "x": 68,
        "y": 58
      }
    },
    {
      "name": "点",
      "order": 8,
      "path": "M 65,68 L 68,76",
      "start": {
        "x": 65,
        "y": 68
      },
      "end": {
        "x": 68,
        "y": 76
      }
    }
  ],
  "confusingChars": [
    "两",
    "雪",
    "西",
    "面"
  ]
},
{
  "id": "char_099",
  "char": "雪",
  "pinyin": "xuě",
  "pinyinTone": 3,
  "meaning": "水蒸气凝结成的白色晶体，从空中飘落",
  "oracleGlyph": "𩂥",
  "bronzeGlyph": "雪",
  "radical": "雨",
  "strokeCount": 11,
  "stage": 3,
  "themeIsland": "space",
  "unitIndex": 20,
  "levelIndex": 4,
  "evolution": {
    "oracle": "甲骨文上方是雨字头，下方像用手拿着羽毛状的雪花",
    "bronze": "金文雨头下加扫帚或彐",
    "seal": "小篆更加对称规整",
    "modern": "现代楷书写作“雪”，雨字头加彐"
  },
  "words": [
    {
      "word": "白雪",
      "pinyin": "bái xuě",
      "meaning": "洁白美丽的雪花"
    },
    {
      "word": "雪花",
      "pinyin": "xuě huā",
      "meaning": "晶莹剔透的六角形雪花"
    },
    {
      "word": "雪人",
      "pinyin": "xuě rén",
      "meaning": "用积雪堆成的人形玩具"
    }
  ],
  "sentence": "冬天到了，漫天飘舞着洁白轻盈的小雪花。",
  "gameConfig": {
    "sound": "xue",
    "balloonPopOptions": [
      "雪",
      "雨",
      "雷",
      "霜"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "横",
      "order": 1,
      "path": "M 25,18 L 75,18",
      "start": {
        "x": 25,
        "y": 18
      },
      "end": {
        "x": 75,
        "y": 18
      }
    },
    {
      "name": "竖",
      "order": 2,
      "path": "M 50,18 L 50,35",
      "start": {
        "x": 50,
        "y": 18
      },
      "end": {
        "x": 50,
        "y": 35
      }
    },
    {
      "name": "横折钩",
      "order": 3,
      "path": "M 22,35 L 78,35 L 78,55 L 72,50",
      "start": {
        "x": 22,
        "y": 35
      },
      "end": {
        "x": 72,
        "y": 50
      },
      "corner": {
        "x": 78,
        "y": 35
      }
    },
    {
      "name": "竖",
      "order": 4,
      "path": "M 50,35 L 50,55",
      "start": {
        "x": 50,
        "y": 35
      },
      "end": {
        "x": 50,
        "y": 55
      }
    },
    {
      "name": "点",
      "order": 5,
      "path": "M 32,40 L 35,46",
      "start": {
        "x": 32,
        "y": 40
      },
      "end": {
        "x": 35,
        "y": 46
      }
    },
    {
      "name": "点",
      "order": 6,
      "path": "M 32,48 L 35,54",
      "start": {
        "x": 32,
        "y": 48
      },
      "end": {
        "x": 35,
        "y": 54
      }
    },
    {
      "name": "点",
      "order": 7,
      "path": "M 65,40 L 68,46",
      "start": {
        "x": 65,
        "y": 40
      },
      "end": {
        "x": 68,
        "y": 46
      }
    },
    {
      "name": "点",
      "order": 8,
      "path": "M 65,48 L 68,54",
      "start": {
        "x": 65,
        "y": 48
      },
      "end": {
        "x": 68,
        "y": 54
      }
    },
    {
      "name": "横折",
      "order": 9,
      "path": "M 30,65 L 70,65 L 70,75",
      "start": {
        "x": 30,
        "y": 65
      },
      "end": {
        "x": 70,
        "y": 75
      },
      "corner": {
        "x": 70,
        "y": 65
      }
    },
    {
      "name": "横",
      "order": 10,
      "path": "M 30,75 L 65,75",
      "start": {
        "x": 30,
        "y": 75
      },
      "end": {
        "x": 65,
        "y": 75
      }
    },
    {
      "name": "横",
      "order": 11,
      "path": "M 25,88 L 75,88",
      "start": {
        "x": 25,
        "y": 88
      },
      "end": {
        "x": 75,
        "y": 88
      }
    }
  ],
  "confusingChars": [
    "雨",
    "雷",
    "霜",
    "雾"
  ]
},
{
  "id": "char_100",
  "char": "风",
  "pinyin": "fēng",
  "pinyinTone": 1,
  "meaning": "空气流动的自然现象",
  "oracleGlyph": "𠘲",
  "bronzeGlyph": "风",
  "radical": "风",
  "strokeCount": 4,
  "stage": 3,
  "themeIsland": "space",
  "unitIndex": 20,
  "levelIndex": 5,
  "evolution": {
    "oracle": "甲骨文像一只头顶有华丽羽冠的神鸟（凤鸟），神鸟飞翔带起大风",
    "bronze": "金文在凤鸟体内加虫形",
    "seal": "小篆更加对称方正",
    "modern": "现代简体楷书写作“风”，外框加撇点"
  },
  "words": [
    {
      "word": "春风",
      "pinyin": "chūn fēng",
      "meaning": "温暖宜人的春天气息"
    },
    {
      "word": "大风",
      "pinyin": "dà fēng",
      "meaning": "猛烈的风力"
    },
    {
      "word": "风筝",
      "pinyin": "fēng zheng",
      "meaning": "依靠风力飞上天空的玩具"
    }
  ],
  "sentence": "春风轻轻拂过脸颊，田野里的小草变绿了。",
  "gameConfig": {
    "sound": "feng",
    "balloonPopOptions": [
      "风",
      "凤",
      "凡",
      "冈"
    ],
    "correctIndex": 0
  },
  "strokes": [
    {
      "name": "撇",
      "order": 1,
      "path": "M 30,22 L 20,82",
      "start": {
        "x": 30,
        "y": 22
      },
      "end": {
        "x": 20,
        "y": 82
      }
    },
    {
      "name": "横折弯钩",
      "order": 2,
      "path": "M 30,22 L 78,22 L 78,82 L 68,75",
      "start": {
        "x": 30,
        "y": 22
      },
      "end": {
        "x": 68,
        "y": 75
      },
      "corner": {
        "x": 78,
        "y": 22
      }
    },
    {
      "name": "撇",
      "order": 3,
      "path": "M 52,38 L 42,62",
      "start": {
        "x": 52,
        "y": 38
      },
      "end": {
        "x": 42,
        "y": 62
      }
    },
    {
      "name": "点",
      "order": 4,
      "path": "M 48,52 L 65,65",
      "start": {
        "x": 48,
        "y": 52
      },
      "end": {
        "x": 65,
        "y": 65
      }
    }
  ],
  "confusingChars": [
    "凤",
    "凡",
    "冈",
    "网"
  ]
}
];

export const STAGES_METADATA = [
  {
    stage: 1,
    title: "第一阶段：启蒙识字 (1-200字)",
    islandName: "奇幻森林岛",
    islandKey: "forest",
    desc: "以大自然象形字为主，通过生动动画建立对汉字字形字义的初步感知",
    unlocked: true,
    totalUnits: 40
  },
  {
    stage: 2,
    title: "第二阶段：生活应用 (201-600字)",
    islandName: "缤纷生活岛",
    islandKey: "town",
    desc: "结合生活常识身体动作动植物与家庭人际，进行情境扩展应用",
    unlocked: true,
    totalUnits: 80
  },
  {
    stage: 3,
    title: "第三阶段：进阶跃升 (601-1300字)",
    islandName: "星际智慧岛",
    islandKey: "space",
    desc: "会意字与偏旁部首系统化进阶，全面奠定小学语文自主阅读与书写基础",
    unlocked: true,
    totalUnits: 140
  }
];
