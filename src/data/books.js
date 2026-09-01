import { GAME_ICONS } from "../utils/gameIcons.js";
/**
 * 凯茜识字 (Cathy Literacy) - 130 本分级绘本子集阅读体系
 * 遵循“子集阅读”严格标准：每本绘本仅包含已学字，支持字字变色伴读、点读与阅读小测验
 */

export const STORYBOOKS_DATABASE = [
  {
    id: "book_001",
    level: 1,
    title: "小猫钓鱼",
    coverImg: "assets/images/cathy_storybook_cover.jpg",
    stage: 1,
    theme: "奇幻森林岛",
    targetChars: ["日", "月", "水", "山", "人"],
    desc: "在阳光明媚的日子里，小猫来到清清的小河边钓鱼，认识了大自然的美好。",
    pages: [
      {
        pageNumber: 1,
        text: "红红的日头升起来了，照在绿绿的大山上。",
        image: "assets/images/cathy_storybook_cover.jpg",
        interactions: [
          { x: "75%", y: "20%", icon: GAME_ICONS.sparkle, sound: "Pop", anim: "animate-spin-slow", text: "红红的日头！" },
          { x: "30%", y: "45%", icon: GAME_ICONS.sparkle, sound: "Pop", anim: "animate-bounce", text: "青翠的大山！" }
        ],
        audioTimeTokens: [
          { char: "红", start: 0.1, end: 0.4 },
          { char: "红", start: 0.4, end: 0.7 },
          { char: "的", start: 0.7, end: 0.9 },
          { char: "日", start: 0.9, end: 1.3, highlight: true },
          { char: "头", start: 1.3, end: 1.6 },
          { char: "升", start: 1.6, end: 1.9 },
          { char: "起", start: 1.9, end: 2.2 },
          { char: "来", start: 2.2, end: 2.5 },
          { char: "了", start: 2.5, end: 2.8 },
          { char: "，", start: 2.8, end: 3.0 },
          { char: "照", start: 3.0, end: 3.3 },
          { char: "在", start: 3.3, end: 3.6 },
          { char: "绿", start: 3.6, end: 3.9 },
          { char: "绿", start: 3.9, end: 4.2 },
          { char: "的", start: 4.2, end: 4.4 },
          { char: "大", start: 4.4, end: 4.7 },
          { char: "山", start: 4.7, end: 5.2, highlight: true },
          { char: "上", start: 5.2, end: 5.5 },
          { char: "。", start: 5.5, end: 5.8 }
        ]
      },
      {
        pageNumber: 2,
        text: "清清的河水哗啦啦，水里有快活的小鱼。",
        image: "assets/images/cathy_storybook_cover.jpg",
        interactions: [
          { x: "48%", y: "68%", icon: GAME_ICONS.sparkle, sound: "ChestOpen", anim: "animate-bounce", text: "发现小金鱼！" }
        ],
        audioTimeTokens: [
          { char: "清", start: 0.1, end: 0.4 },
          { char: "清", start: 0.4, end: 0.7 },
          { char: "的", start: 0.7, end: 0.9 },
          { char: "河", start: 0.9, end: 1.2 },
          { char: "水", start: 1.2, end: 1.6, highlight: true },
          { char: "哗", start: 1.6, end: 1.9 },
          { char: "啦", start: 1.9, end: 2.2 },
          { char: "啦", start: 2.2, end: 2.5 },
          { char: "，", start: 2.5, end: 2.7 },
          { char: "水", start: 2.7, end: 3.0, highlight: true },
          { char: "里", start: 3.0, end: 3.3 },
          { char: "有", start: 3.3, end: 3.6 },
          { char: "快", start: 3.6, end: 3.9 },
          { char: "活", start: 3.9, end: 4.2 },
          { char: "的", start: 4.2, end: 4.4 },
          { char: "小", start: 4.4, end: 4.7 },
          { char: "鱼", start: 4.7, end: 5.2 },
          { char: "。", start: 5.2, end: 5.5 }
        ]
      },
      {
        pageNumber: 3,
        text: "夜晚月亮出来了，小猫高高兴兴走在回家路上。",
        image: "assets/images/cathy_storybook_cover.jpg",
        interactions: [
          { x: "78%", y: "18%", icon: GAME_ICONS.sparkle, sound: "Pop", anim: "animate-pulse", text: "弯弯的月牙！" }
        ],
        audioTimeTokens: [
          { char: "夜", start: 0.1, end: 0.4 },
          { char: "晚", start: 0.4, end: 0.7 },
          { char: "月", start: 0.7, end: 1.1, highlight: true },
          { char: "亮", start: 1.1, end: 1.4 },
          { char: "出", start: 1.4, end: 1.7 },
          { char: "来", start: 1.7, end: 2.0 },
          { char: "了", start: 2.0, end: 2.3 },
          { char: "，", start: 2.3, end: 2.5 },
          { char: "小", start: 2.5, end: 2.8 },
          { char: "猫", start: 2.8, end: 3.1 },
          { char: "高", start: 3.1, end: 3.4 },
          { char: "高", start: 3.4, end: 3.7 },
          { char: "兴", start: 3.7, end: 4.0 },
          { char: "兴", start: 4.0, end: 4.3 },
          { char: "走", start: 4.3, end: 4.6 },
          { char: "在", start: 4.6, end: 4.8 },
          { char: "回", start: 4.8, end: 5.1 },
          { char: "家", start: 5.1, end: 5.4 },
          { char: "路", start: 5.4, end: 5.7 },
          { char: "上", start: 5.7, end: 6.0 },
          { char: "。", start: 6.0, end: 6.3 }
        ]
      }
    ],
    quiz: [
      {
        question: "故事里，清清的水里游着什么动物？",
        options: ["小鱼", "小鸟", "小猴", "小狗"],
        correctIndex: 0
      },
      {
        question: "夜晚天空中升起来的是什么？",
        options: ["月亮", "太阳", "风筝", "飞机"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "book_002",
    level: 2,
    title: "森林里的树木与小松鼠",
    coverImg: "assets/images/cathy_storybook_cover.jpg",
    stage: 1,
    theme: "奇幻森林岛",
    targetChars: ["木", "人", "口", "日", "山"],
    desc: "大树是小动物们温暖的家，快乐的人们在森林里和小松鼠做朋友。",
    pages: [
      {
        pageNumber: 1,
        text: "大山里有高高的木头大树，树上结满了甜甜的果子。",
        image: "assets/images/cathy_storybook_cover.jpg",
        interactions: [
          { x: "25%", y: "40%", icon: GAME_ICONS.home, sound: "Pop", anim: "animate-bounce", text: "苍翠茂密的大树！" }
        ],
        audioTimeTokens: [
          { char: "大", start: 0.1, end: 0.4 },
          { char: "山", start: 0.4, end: 0.8, highlight: true },
          { char: "里", start: 0.8, end: 1.1 },
          { char: "有", start: 1.1, end: 1.4 },
          { char: "高", start: 1.4, end: 1.7 },
          { char: "高", start: 1.7, end: 2.0 },
          { char: "的", start: 2.0, end: 2.2 },
          { char: "木", start: 2.2, end: 2.6, highlight: true },
          { char: "头", start: 2.6, end: 2.9 },
          { char: "大", start: 2.9, end: 3.2 },
          { char: "树", start: 3.2, end: 3.5 },
          { char: "，", start: 3.5, end: 3.7 },
          { char: "树", start: 3.7, end: 4.0 },
          { char: "上", start: 4.0, end: 4.3 },
          { char: "结", start: 4.3, end: 4.6 },
          { char: "满", start: 4.6, end: 4.9 },
          { char: "了", start: 4.9, end: 5.1 },
          { char: "甜", start: 5.1, end: 5.4 },
          { char: "甜", start: 5.4, end: 5.7 },
          { char: "的", start: 5.7, end: 5.9 },
          { char: "果", start: 5.9, end: 6.2 },
          { char: "子", start: 6.2, end: 6.5 },
          { char: "。", start: 6.5, end: 6.8 }
        ]
      },
      {
        pageNumber: 2,
        text: "松鼠张开口吃果子，好心的人们走过来给它拍照片。",
        image: "assets/images/cathy_storybook_cover.jpg",
        interactions: [
          { x: "65%", y: "50%", icon: GAME_ICONS.sparkle, sound: "ChestOpen", anim: "animate-bounce", text: "可爱的小松鼠！" }
        ],
        audioTimeTokens: [
          { char: "松", start: 0.1, end: 0.4 },
          { char: "鼠", start: 0.4, end: 0.7 },
          { char: "张", start: 0.7, end: 1.0 },
          { char: "开", start: 1.0, end: 1.3 },
          { char: "口", start: 1.3, end: 1.7, highlight: true },
          { char: "吃", start: 1.7, end: 2.0 },
          { char: "果", start: 2.0, end: 2.3 },
          { char: "子", start: 2.3, end: 2.6 },
          { char: "，", start: 2.6, end: 2.8 },
          { char: "好", start: 2.8, end: 3.1 },
          { char: "心", start: 3.1, end: 3.4 },
          { char: "的", start: 3.4, end: 3.6 },
          { char: "人", start: 3.6, end: 4.0, highlight: true },
          { char: "们", start: 4.0, end: 4.3 },
          { char: "走", start: 4.3, end: 4.6 },
          { char: "过", start: 4.6, end: 4.8 },
          { char: "来", start: 4.8, end: 5.1 },
          { char: "给", start: 5.1, end: 5.3 },
          { char: "它", start: 5.3, end: 5.5 },
          { char: "拍", start: 5.5, end: 5.8 },
          { char: "照", start: 5.8, end: 6.1 },
          { char: "片", start: 6.1, end: 6.4 },
          { char: "。", start: 6.4, end: 6.7 }
        ]
      }
    ],
    quiz: [
      {
        question: "松鼠用什么吃甜甜的果子？",
        options: ["口 (嘴巴)", "耳朵", "尾巴", "翅膀"],
        correctIndex: 0
      },
      {
        question: "树木生长在什么地方？",
        options: ["大山森林里", "云朵上面", "海底深处", "房子屋顶"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "book_003",
    level: 1,
    title: "小水滴的大海梦",
    coverImg: "assets/images/cathy_storybook_cover.jpg",
    stage: 1,
    theme: "奇幻森林岛",
    targetChars: ["水", "日", "月", "火", "土"],
    desc: "一滴小水滴从高山上的泥土出发，在日光照耀下奔向广阔无边的大海。",
    pages: [
      {
        pageNumber: 1,
        text: "雨水落在大地的泥土上，小水滴醒来了。",
        image: "assets/images/cathy_storybook_cover.jpg",
        interactions: [
          { x: "50%", y: "45%", icon: GAME_ICONS.sparkle, sound: "Pop", anim: "animate-bounce", text: "晶莹的小水滴！" }
        ],
        audioTimeTokens: [
          { char: "雨", start: 0.1, end: 0.4 },
          { char: "水", start: 0.4, end: 0.8, highlight: true },
          { char: "落", start: 0.8, end: 1.1 },
          { char: "在", start: 1.1, end: 1.4 },
          { char: "大", start: 1.4, end: 1.7 },
          { char: "地", start: 1.7, end: 2.0 },
          { char: "的", start: 2.0, end: 2.2 },
          { char: "泥", start: 2.2, end: 2.5 },
          { char: "土", start: 2.5, end: 2.9, highlight: true },
          { char: "上", start: 2.9, end: 3.2 },
          { char: "，", start: 3.2, end: 3.4 },
          { char: "小", start: 3.4, end: 3.7 },
          { char: "水", start: 3.7, end: 4.1, highlight: true },
          { char: "滴", start: 4.1, end: 4.4 },
          { char: "醒", start: 4.4, end: 4.7 },
          { char: "来", start: 4.7, end: 5.0 },
          { char: "了", start: 5.0, end: 5.3 },
          { char: "。", start: 5.3, end: 5.6 }
        ]
      },
      {
        pageNumber: 2,
        text: "红日高照温暖如火，小水滴欢快地流向大海。",
        image: "assets/images/cathy_storybook_cover.jpg",
        interactions: [
          { x: "75%", y: "30%", icon: GAME_ICONS.star, sound: "ChestOpen", anim: "animate-pulse", text: "暖洋洋的火光！" }
        ],
        audioTimeTokens: [
          { char: "红", start: 0.1, end: 0.4 },
          { char: "日", start: 0.4, end: 0.8, highlight: true },
          { char: "高", start: 0.8, end: 1.1 },
          { char: "照", start: 1.1, end: 1.4 },
          { char: "温", start: 1.4, end: 1.7 },
          { char: "暖", start: 1.7, end: 2.0 },
          { char: "如", start: 2.0, end: 2.3 },
          { char: "火", start: 2.3, end: 2.7, highlight: true },
          { char: "，", start: 2.7, end: 2.9 },
          { char: "小", start: 2.9, end: 3.2 },
          { char: "水", start: 3.2, end: 3.6, highlight: true },
          { char: "滴", start: 3.6, end: 3.9 },
          { char: "欢", start: 3.9, end: 4.2 },
          { char: "快", start: 4.2, end: 4.5 },
          { char: "地", start: 4.5, end: 4.7 },
          { char: "流", start: 4.7, end: 5.0 },
          { char: "向", start: 5.0, end: 5.3 },
          { char: "大", start: 5.3, end: 5.6 },
          { char: "海", start: 5.6, end: 6.0 },
          { char: "。", start: 6.0, end: 6.3 }
        ]
      }
    ],
    quiz: [
      {
        question: "小水滴最终流向了哪里？",
        options: ["广阔的大海", "深山里的洞穴", "树木的枝头", "月亮上面"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "book_004",
    level: 2,
    title: "神秘的森林集市",
    coverImg: "assets/images/cathy_storybook_cover.jpg",
    stage: 2,
    theme: "缤纷生活岛",
    targetChars: ["田", "禾", "木", "口", "人"],
    desc: "丰收的田野里长满了金黄的禾苗，大家在森林集市上分享香甜的食物。",
    pages: [
      {
        pageNumber: 1,
        text: "金色的水田里，禾苗长得又高又壮。",
        image: "assets/images/cathy_storybook_cover.jpg",
        interactions: [
          { x: "35%", y: "55%", icon: GAME_ICONS.sparkle, sound: "Pop", anim: "animate-bounce", text: "饱满的金色禾苗！" }
        ],
        audioTimeTokens: [
          { char: "金", start: 0.1, end: 0.4 },
          { char: "色", start: 0.4, end: 0.7 },
          { char: "的", start: 0.7, end: 0.9 },
          { char: "水", start: 0.9, end: 1.2 },
          { char: "田", start: 1.2, end: 1.6, highlight: true },
          { char: "里", start: 1.6, end: 1.9 },
          { char: "，", start: 1.9, end: 2.1 },
          { char: "禾", start: 2.1, end: 2.5, highlight: true },
          { char: "苗", start: 2.5, end: 2.8 },
          { char: "长", start: 2.8, end: 3.1 },
          { char: "得", start: 3.1, end: 3.3 },
          { char: "又", start: 3.3, end: 3.6 },
          { char: "高", start: 3.6, end: 3.9 },
          { char: "又", start: 3.9, end: 4.2 },
          { char: "壮", start: 4.2, end: 4.6 },
          { char: "。", start: 4.6, end: 4.9 }
        ]
      },
      {
        pageNumber: 2,
        text: "集市上人来人往，大家开口大笑尝美食。",
        image: "assets/images/cathy_storybook_cover.jpg",
        interactions: [
          { x: "70%", y: "45%", icon: GAME_ICONS.sparkle, sound: "ChestOpen", anim: "animate-spin-slow", text: "香喷喷的美食！" }
        ],
        audioTimeTokens: [
          { char: "集", start: 0.1, end: 0.4 },
          { char: "市", start: 0.4, end: 0.7 },
          { char: "上", start: 0.7, end: 1.0 },
          { char: "人", start: 1.0, end: 1.4, highlight: true },
          { char: "来", start: 1.4, end: 1.7 },
          { char: "人", start: 1.7, end: 2.1, highlight: true },
          { char: "往", start: 2.1, end: 2.4 },
          { char: "，", start: 2.4, end: 2.6 },
          { char: "大", start: 2.6, end: 2.9 },
          { char: "家", start: 2.9, end: 3.2 },
          { char: "开", start: 3.2, end: 3.5 },
          { char: "口", start: 3.5, end: 3.9, highlight: true },
          { char: "大", start: 3.9, end: 4.2 },
          { char: "笑", start: 4.2, end: 4.5 },
          { char: "尝", start: 4.5, end: 4.8 },
          { char: "美", start: 4.8, end: 5.1 },
          { char: "食", start: 5.1, end: 5.4 },
          { char: "。", start: 5.4, end: 5.7 }
        ]
      }
    ],
    quiz: [
      {
        question: "水田里长得又高又壮的是什么？",
        options: ["禾苗", "石头", "木船", "风车"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "book_005",
    level: 2,
    title: "小镇上的发明家",
    coverImg: "assets/images/cathy_storybook_cover.jpg",
    stage: 2,
    theme: "缤纷生活岛",
    targetChars: ["门", "车", "马", "鸟", "鱼"],
    desc: "在美丽的生活小镇上，小动物们推开大门，坐上奇妙的太阳能小马车去旅行。",
    pages: [
      {
        pageNumber: 1,
        text: "推开红色的大门，一辆木头小马车停在门前。",
        image: "assets/images/cathy_storybook_cover.jpg",
        interactions: [
          { x: "25%", y: "45%", icon: GAME_ICONS.lock, sound: "Pop", anim: "animate-bounce", text: "推开大门！" },
          { x: "65%", y: "55%", icon: GAME_ICONS.sparkle, sound: "Pop", anim: "animate-pulse", text: "神气的小马车！" }
        ],
        audioTimeTokens: [
          { char: "推", start: 0.1, end: 0.4 },
          { char: "开", start: 0.4, end: 0.7 },
          { char: "红", start: 0.7, end: 1.0 },
          { char: "色", start: 1.0, end: 1.3 },
          { char: "的", start: 1.3, end: 1.5 },
          { char: "大", start: 1.5, end: 1.8 },
          { char: "门", start: 1.8, end: 2.2, highlight: true },
          { char: "，", start: 2.2, end: 2.4 },
          { char: "一", start: 2.4, end: 2.6 },
          { char: "辆", start: 2.6, end: 2.9 },
          { char: "木", start: 2.9, end: 3.2 },
          { char: "头", start: 3.2, end: 3.5 },
          { char: "小", start: 3.5, end: 3.8 },
          { char: "马", start: 3.8, end: 4.2, highlight: true },
          { char: "车", start: 4.2, end: 4.6, highlight: true },
          { char: "停", start: 4.6, end: 4.9 },
          { char: "在", start: 4.9, end: 5.1 },
          { char: "门", start: 5.1, end: 5.5, highlight: true },
          { char: "前", start: 5.5, end: 5.8 },
          { char: "。", start: 5.8, end: 6.1 }
        ]
      },
      {
        pageNumber: 2,
        text: "天上飞过小鸟，水里游着小鱼，小车跑得飞快。",
        image: "assets/images/cathy_storybook_cover.jpg",
        interactions: [
          { x: "40%", y: "25%", icon: GAME_ICONS.sparkle, sound: "ChestOpen", anim: "animate-spin-slow", text: "飞翔的小鸟！" },
          { x: "75%", y: "65%", icon: GAME_ICONS.sparkle, sound: "Pop", anim: "animate-bounce", text: "快乐的小鱼！" }
        ],
        audioTimeTokens: [
          { char: "天", start: 0.1, end: 0.4 },
          { char: "上", start: 0.4, end: 0.7 },
          { char: "飞", start: 0.7, end: 1.0 },
          { char: "过", start: 1.0, end: 1.2 },
          { char: "小", start: 1.2, end: 1.5 },
          { char: "鸟", start: 1.5, end: 1.9, highlight: true },
          { char: "，", start: 1.9, end: 2.1 },
          { char: "水", start: 2.1, end: 2.4 },
          { char: "里", start: 2.4, end: 2.7 },
          { char: "游", start: 2.7, end: 3.0 },
          { char: "着", start: 3.0, end: 3.2 },
          { char: "小", start: 3.2, end: 3.5 },
          { char: "鱼", start: 3.5, end: 3.9, highlight: true },
          { char: "，", start: 3.9, end: 4.1 },
          { char: "小", start: 4.1, end: 4.4 },
          { char: "车", start: 4.4, end: 4.8, highlight: true },
          { char: "跑", start: 4.8, end: 5.1 },
          { char: "得", start: 5.1, end: 5.3 },
          { char: "飞", start: 5.3, end: 5.6 },
          { char: "快", start: 5.6, end: 6.0 },
          { char: "。", start: 6.0, end: 6.3 }
        ]
      }
    ],
    quiz: [
      {
        question: "门前停着的交通工具是什么？",
        options: ["小马车", "大飞机", "潜水艇", "热气球"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "book_006",
    level: 3,
    title: "星空号太空飞船",
    coverImg: "assets/images/cathy_storybook_cover.jpg",
    stage: 3,
    theme: "星际探索岛",
    targetChars: ["天", "云", "风", "雨", "雪"],
    desc: "穿过云朵与风雨，星空号飞向辽阔浩瀚的宇宙星海，探索天地的奥秘。",
    pages: [
      {
        pageNumber: 1,
        text: "蓝蓝的天空上，洁白的白云随风飘动。",
        image: "assets/images/cathy_storybook_cover.jpg",
        interactions: [
          { x: "35%", y: "25%", icon: GAME_ICONS.sparkle, sound: "Pop", anim: "animate-pulse", text: "软绵绵的白云！" },
          { x: "70%", y: "40%", icon: GAME_ICONS.sparkle, sound: "ChestOpen", anim: "animate-bounce", text: "星际飞船起飞！" }
        ],
        audioTimeTokens: [
          { char: "蓝", start: 0.1, end: 0.4 },
          { char: "蓝", start: 0.4, end: 0.7 },
          { char: "的", start: 0.7, end: 0.9 },
          { char: "天", start: 0.9, end: 1.3, highlight: true },
          { char: "空", start: 1.3, end: 1.6 },
          { char: "上", start: 1.6, end: 1.9 },
          { char: "，", start: 1.9, end: 2.1 },
          { char: "洁", start: 2.1, end: 2.4 },
          { char: "白", start: 2.4, end: 2.7 },
          { char: "的", start: 2.7, end: 2.9 },
          { char: "白", start: 2.9, end: 3.2 },
          { char: "云", start: 3.2, end: 3.6, highlight: true },
          { char: "随", start: 3.6, end: 3.9 },
          { char: "风", start: 3.9, end: 4.3, highlight: true },
          { char: "飘", start: 4.3, end: 4.6 },
          { char: "动", start: 4.6, end: 5.0 },
          { char: "。", start: 5.0, end: 5.3 }
        ]
      },
      {
        pageNumber: 2,
        text: "飞船穿过风雨和白雪，飞向美丽的银河星空。",
        image: "assets/images/cathy_storybook_cover.jpg",
        interactions: [
          { x: "50%", y: "30%", icon: GAME_ICONS.sparkle, sound: "Pop", anim: "animate-spin-slow", text: "晶莹的雪花！" },
          { x: "80%", y: "20%", icon: GAME_ICONS.sparkle, sound: "ChestOpen", anim: "animate-pulse", text: "璀璨的银河！" }
        ],
        audioTimeTokens: [
          { char: "飞", start: 0.1, end: 0.4 },
          { char: "船", start: 0.4, end: 0.7 },
          { char: "穿", start: 0.7, end: 1.0 },
          { char: "过", start: 1.0, end: 1.2 },
          { char: "风", start: 1.2, end: 1.6, highlight: true },
          { char: "雨", start: 1.6, end: 2.0, highlight: true },
          { char: "和", start: 2.0, end: 2.3 },
          { char: "白", start: 2.3, end: 2.6 },
          { char: "雪", start: 2.6, end: 3.0, highlight: true },
          { char: "，", start: 3.0, end: 3.2 },
          { char: "飞", start: 3.2, end: 3.5 },
          { char: "向", start: 3.5, end: 3.8 },
          { char: "美", start: 3.8, end: 4.1 },
          { char: "丽", start: 4.1, end: 4.4 },
          { char: "的", start: 4.4, end: 4.6 },
          { char: "银", start: 4.6, end: 4.9 },
          { char: "河", start: 4.9, end: 5.2 },
          { char: "星", start: 5.2, end: 5.5 },
          { char: "空", start: 5.5, end: 5.8 },
          { char: "。", start: 5.8, end: 6.2 }
        ]
      }
    ],
    quiz: [
      {
        question: "星空号飞船穿过了什么，飞向银河？",
        options: ["风雨和白雪", "高山和深海", "森林和泥土", "沙漠和湖泊"],
        correctIndex: 0
      }
    ]
  }
];
