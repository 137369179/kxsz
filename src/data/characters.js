/**
 * 凯茜识字 (Cathy Literacy) - 阶梯字库体系核心数据库
 * 遵循 1:1 克隆设计：三大阶段（启蒙/生活/进阶），包含完整的字音、字形、象形演变、笔顺骨架与小游戏配置
 */

export const CHARACTER_DATABASE = [
  {
    id: "char_001",
    char: "日",
    pinyin: "rì",
    pinyinTone: 4,
    radical: "日",
    strokeCount: 4,
    stage: 1, // 1: 启蒙森林岛, 2: 生活小镇岛, 3: 星际智慧岛
    themeIsland: "forest",
    unitIndex: 1,
    levelIndex: 1,
    evolution: {
      story: "古人看到的太阳是圆圆的，中间有一个发光的黑子。于是画了一个圆圈中间加一点，后来演变成了方正的‘日’字。",
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
    sentence: "太阳升起来了，今天是个好日子。",
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
    evolution: {
      story: "月亮常常是弯弯的月牙形状，古人便根据弯月的样子画出了‘月’字，代表夜晚与月光。",
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
    sentence: "弯弯的月亮像一条小船挂在夜空。",
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
    evolution: {
      story: "古人观察小溪流动的样子，中间是蜿蜒的水流，两边是溅起的水滴，组合在一起就是‘水’字。",
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
    sentence: "清清的河水哗啦啦地向远方流去。",
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
    evolution: {
      story: "熊熊燃烧的火焰往上窜，中间是主火苗，两边是飞舞的小火星，这就是‘火’字的由来。",
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
    sentence: "营火在夜里暖洋洋地燃烧着。",
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
    evolution: {
      story: "连绵起伏的山峰耸立在天地之间，中间一座最高，左右两座稍低，演变成了稳固的‘山’字。",
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
    sentence: "高高的大山上长满了绿色的树木。",
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
    evolution: {
      story: "上面是树枝，中间是树干，下面是扎进泥土深处的树根，这就是大树的‘木’字。",
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
    sentence: "小松鼠在挺拔的树木间欢快跳跃。",
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
    evolution: {
      story: "古人侧身站立，两腿迈开向前行走，用极简的两笔勾勒出人类顶天立地的形象。",
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
    sentence: "路上有许多快乐行走的人们。",
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
    evolution: {
      story: "人张开嘴巴发出声音、品尝美食的样子，画出来就是一个四方的方框。",
      oracleDesc: "张开的人嘴之形",
      bronzeDesc: "圆角方框，生动逼真",
      sealDesc: "线条圆润，象征语言与进食",
      modernDesc: "端正方格，左竖、横折、底横"
    },
    words: [
      { word: "口渴", pinyin: "kǒu kě", desc: "想喝水时的身体感觉" },
      { word: "门口", pinyin: "mén kǒu", desc: "进出房间的通道" },
      { word: "开口", pinyin: "kāi kǒu", desc: "张开嘴说话" }
    ],
    sentence: "小鸟张开口唱出清脆动听的歌声。",
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
  }
];

export const STAGES_METADATA = [
  {
    stage: 1,
    title: "第一阶段：启蒙识字 (1-200字)",
    islandName: "奇幻森林岛",
    islandKey: "forest",
    desc: "以大自然象形字为主，通过生动动画建立对汉字字形、字义的初步感知。",
    unlocked: true,
    totalUnits: 40
  },
  {
    stage: 2,
    title: "第二阶段：生活应用 (201-600字)",
    islandName: "缤纷生活岛",
    islandKey: "town",
    desc: "结合生活常识、身体动作、动植物与家庭人际，进行情境扩展应用。",
    unlocked: true,
    totalUnits: 80
  },
  {
    stage: 3,
    title: "第三阶段：进阶跃升 (601-1300字)",
    islandName: "星际智慧岛",
    islandKey: "space",
    desc: "会意字与偏旁部首系统化进阶，全面奠定小学语文自主阅读与书写基础。",
    unlocked: true,
    totalUnits: 140
  }
];
