import { GAME_ICONS } from "../utils/gameIcons.js";
/**
 * 凯茜识字 (Cathy Literacy) - 分级绘本馆核心数据库 (含传统节日、太空科学、好习惯情绪管理等精品主题系列)
 */

export const STORYBOOKS_DATABASE = [
  {
    "id": "book_theme_midautumn",
    "level": 1,
    "title": "中秋月圆吃月饼",
    "coverImg": "assets/images/cover_midautumn.webp",
    "stage": 1,
    "theme": "中华传统节日",
    "targetChars": [
      "日",
      "月",
      "大",
      "圆",
      "吃"
    ],
    "desc": "八月十五中秋节，月亮又大又圆，小鹿凯茜一家团圆赏月吃月饼",
    "pages": [
      {
        "pageNumber": 1,
        "text": "八月十五月儿圆，天上的月亮像金盘",
        "image": "assets/images/cover_midautumn.webp",
        "interactions": [
          {
            "x": "75%",
            "y": "25%",
            "sound": "Pop",
            "anim": "animate-spin-slow",
            "text": "大金盘月亮！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "八",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "月",
            "start": 0.4,
            "end": 0.8,
            "highlight": true
          },
          {
            "char": "十",
            "start": 0.8,
            "end": 1.1
          },
          {
            "char": "五",
            "start": 1.1,
            "end": 1.4
          },
          {
            "char": "月",
            "start": 1.4,
            "end": 1.8,
            "highlight": true
          },
          {
            "char": "儿",
            "start": 1.8,
            "end": 2.1
          },
          {
            "char": "圆",
            "start": 2.1,
            "end": 2.5,
            "highlight": true
          },
          {
            "char": "，",
            "start": 2.5,
            "end": 2.7
          },
          {
            "char": "天",
            "start": 2.7,
            "end": 3
          },
          {
            "char": "上",
            "start": 3,
            "end": 3.3
          },
          {
            "char": "的",
            "start": 3.3,
            "end": 3.5
          },
          {
            "char": "月",
            "start": 3.5,
            "end": 3.9,
            "highlight": true
          },
          {
            "char": "亮",
            "start": 3.9,
            "end": 4.2
          },
          {
            "char": "像",
            "start": 4.2,
            "end": 4.5
          },
          {
            "char": "金",
            "start": 4.5,
            "end": 4.8
          },
          {
            "char": "盘",
            "start": 4.8,
            "end": 5.2
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "一家人坐在院子里，开开心心吃甜月饼",
        "image": "assets/images/cover_midautumn.webp",
        "interactions": [
          {
            "x": "50%",
            "y": "65%",
            "sound": "ChestOpen",
            "anim": "animate-bounce",
            "text": "香甜的红豆月饼！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "一",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "家",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "人",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "坐",
            "start": 1,
            "end": 1.3
          },
          {
            "char": "在",
            "start": 1.3,
            "end": 1.6
          },
          {
            "char": "院",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "子",
            "start": 1.9,
            "end": 2.2
          },
          {
            "char": "里",
            "start": 2.2,
            "end": 2.5
          },
          {
            "char": "，",
            "start": 2.5,
            "end": 2.7
          },
          {
            "char": "开",
            "start": 2.7,
            "end": 3
          },
          {
            "char": "开",
            "start": 3,
            "end": 3.3
          },
          {
            "char": "心",
            "start": 3.3,
            "end": 3.6
          },
          {
            "char": "心",
            "start": 3.6,
            "end": 3.9
          },
          {
            "char": "吃",
            "start": 3.9,
            "end": 4.3,
            "highlight": true
          },
          {
            "char": "甜",
            "start": 4.3,
            "end": 4.6
          },
          {
            "char": "月",
            "start": 4.6,
            "end": 4.9,
            "highlight": true
          },
          {
            "char": "饼",
            "start": 4.9,
            "end": 5.3
          }
        ]
      },
      {
        "pageNumber": 3,
        "text": "大月亮照在大地上，祝大家团团圆圆",
        "image": "assets/images/cover_midautumn.webp",
        "interactions": [
          {
            "x": "35%",
            "y": "45%",
            "sound": "VictoryFanfare",
            "anim": "animate-pulse",
            "text": "中秋快乐！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "大",
            "start": 0.1,
            "end": 0.5,
            "highlight": true
          },
          {
            "char": "月",
            "start": 0.5,
            "end": 0.9,
            "highlight": true
          },
          {
            "char": "亮",
            "start": 0.9,
            "end": 1.2
          },
          {
            "char": "照",
            "start": 1.2,
            "end": 1.5
          },
          {
            "char": "在",
            "start": 1.5,
            "end": 1.8
          },
          {
            "char": "大",
            "start": 1.8,
            "end": 2.2,
            "highlight": true
          },
          {
            "char": "地",
            "start": 2.2,
            "end": 2.5
          },
          {
            "char": "上",
            "start": 2.5,
            "end": 2.8
          },
          {
            "char": "，",
            "start": 2.8,
            "end": 3
          },
          {
            "char": "祝",
            "start": 3,
            "end": 3.3
          },
          {
            "char": "大",
            "start": 3.3,
            "end": 3.6,
            "highlight": true
          },
          {
            "char": "家",
            "start": 3.6,
            "end": 3.9
          },
          {
            "char": "团",
            "start": 3.9,
            "end": 4.2
          },
          {
            "char": "团",
            "start": 4.2,
            "end": 4.5
          },
          {
            "char": "圆",
            "start": 4.5,
            "end": 4.8,
            "highlight": true
          },
          {
            "char": "圆",
            "start": 4.8,
            "end": 5.2,
            "highlight": true
          }
        ]
      }
    ],
    "quiz": {
      "question": "中秋节天上的月亮是什么样子的？",
      "options": [
        "又大又圆像金盘",
        "细细的像弯钩",
        "四四方方的"
      ],
      "correctIndex": 0
    }
  },
  {
    "id": "book_theme_dragonboat",
    "level": 2,
    "title": "端午赛龙舟",
    "coverImg": "assets/images/cover_dragonboat.webp",
    "stage": 2,
    "theme": "中华传统节日",
    "targetChars": [
      "水",
      "舟",
      "人",
      "多",
      "快"
    ],
    "desc": "五月初五端午节，江上龙舟飞快向前划，岸上的人们拍手加油",
    "pages": [
      {
        "pageNumber": 1,
        "text": "五月五过端午，江水清清水流长",
        "image": "assets/images/cover_dragonboat.webp",
        "interactions": [
          {
            "x": "45%",
            "y": "60%",
            "sound": "WaterDrop",
            "anim": "animate-bounce",
            "text": "清清的江水！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "五",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "月",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "五",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "过",
            "start": 1,
            "end": 1.3
          },
          {
            "char": "端",
            "start": 1.3,
            "end": 1.6
          },
          {
            "char": "午",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "，",
            "start": 1.9,
            "end": 2.1
          },
          {
            "char": "江",
            "start": 2.1,
            "end": 2.4
          },
          {
            "char": "水",
            "start": 2.4,
            "end": 2.8,
            "highlight": true
          },
          {
            "char": "清",
            "start": 2.8,
            "end": 3.1
          },
          {
            "char": "清",
            "start": 3.1,
            "end": 3.4
          },
          {
            "char": "水",
            "start": 3.4,
            "end": 3.7,
            "highlight": true
          },
          {
            "char": "流",
            "start": 3.7,
            "end": 4
          },
          {
            "char": "长",
            "start": 4,
            "end": 4.4
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "大龙舟两头翘，许多人在水上划得快",
        "image": "assets/images/cover_dragonboat.webp",
        "interactions": [
          {
            "x": "60%",
            "y": "50%",
            "sound": "ChestOpen",
            "anim": "animate-pulse",
            "text": "威武大龙舟！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "大",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "龙",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "舟",
            "start": 0.7,
            "end": 1.1,
            "highlight": true
          },
          {
            "char": "两",
            "start": 1.1,
            "end": 1.4
          },
          {
            "char": "头",
            "start": 1.4,
            "end": 1.7
          },
          {
            "char": "翘",
            "start": 1.7,
            "end": 2
          },
          {
            "char": "，",
            "start": 2,
            "end": 2.2
          },
          {
            "char": "许",
            "start": 2.2,
            "end": 2.5
          },
          {
            "char": "多",
            "start": 2.5,
            "end": 2.9,
            "highlight": true
          },
          {
            "char": "人",
            "start": 2.9,
            "end": 3.3,
            "highlight": true
          },
          {
            "char": "在",
            "start": 3.3,
            "end": 3.6
          },
          {
            "char": "水",
            "start": 3.6,
            "end": 3.9,
            "highlight": true
          },
          {
            "char": "上",
            "start": 3.9,
            "end": 4.2
          },
          {
            "char": "划",
            "start": 4.2,
            "end": 4.5
          },
          {
            "char": "得",
            "start": 4.5,
            "end": 4.7
          },
          {
            "char": "快",
            "start": 4.7,
            "end": 5.1,
            "highlight": true
          }
        ]
      },
      {
        "pageNumber": 3,
        "text": "咚咚咚擂大鼓，龙舟冲过终点夺第一",
        "image": "assets/images/cover_dragonboat.webp",
        "interactions": [
          {
            "x": "30%",
            "y": "40%",
            "sound": "VictoryFanfare",
            "anim": "animate-bounce",
            "text": "胜利夺冠！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "咚",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "咚",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "咚",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "擂",
            "start": 1,
            "end": 1.3
          },
          {
            "char": "大",
            "start": 1.3,
            "end": 1.6
          },
          {
            "char": "鼓",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "，",
            "start": 1.9,
            "end": 2.1
          },
          {
            "char": "龙",
            "start": 2.1,
            "end": 2.4
          },
          {
            "char": "舟",
            "start": 2.4,
            "end": 2.8,
            "highlight": true
          },
          {
            "char": "冲",
            "start": 2.8,
            "end": 3.1
          },
          {
            "char": "过",
            "start": 3.1,
            "end": 3.4
          },
          {
            "char": "终",
            "start": 3.4,
            "end": 3.7
          },
          {
            "char": "点",
            "start": 3.7,
            "end": 4
          },
          {
            "char": "夺",
            "start": 4,
            "end": 4.3
          },
          {
            "char": "第",
            "start": 4.3,
            "end": 4.6
          },
          {
            "char": "一",
            "start": 4.6,
            "end": 5
          }
        ]
      }
    ],
    "quiz": {
      "question": "端午节大家在水里赛什么？",
      "options": [
        "赛龙舟",
        "开汽车",
        "放风筝"
      ],
      "correctIndex": 0
    }
  },
  {
    "id": "book_theme_space_rocket",
    "level": 3,
    "title": "小小宇航员上太空",
    "coverImg": "assets/images/cover_space_rocket.webp",
    "stage": 3,
    "theme": "太空与科学探索",
    "targetChars": [
      "天",
      "星",
      "火",
      "飞",
      "空"
    ],
    "desc": "点火起飞！小小宇航员乘着神舟大火箭，飞向浩瀚美丽的星空",
    "pages": [
      {
        "pageNumber": 1,
        "text": "三二一点火！金色火箭飞上了蓝蓝的天空",
        "image": "assets/images/cover_space_rocket.webp",
        "interactions": [
          {
            "x": "50%",
            "y": "75%",
            "sound": "FireIgnite",
            "anim": "animate-bounce",
            "text": "火箭喷出烈火！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "三",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "二",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "一",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "点",
            "start": 1,
            "end": 1.3
          },
          {
            "char": "火",
            "start": 1.3,
            "end": 1.7,
            "highlight": true
          },
          {
            "char": "！",
            "start": 1.7,
            "end": 1.9
          },
          {
            "char": "金",
            "start": 1.9,
            "end": 2.2
          },
          {
            "char": "色",
            "start": 2.2,
            "end": 2.5
          },
          {
            "char": "火",
            "start": 2.5,
            "end": 2.9,
            "highlight": true
          },
          {
            "char": "箭",
            "start": 2.9,
            "end": 3.2
          },
          {
            "char": "飞",
            "start": 3.2,
            "end": 3.6,
            "highlight": true
          },
          {
            "char": "上",
            "start": 3.6,
            "end": 3.9
          },
          {
            "char": "了",
            "start": 3.9,
            "end": 4.1
          },
          {
            "char": "蓝",
            "start": 4.1,
            "end": 4.4
          },
          {
            "char": "蓝",
            "start": 4.4,
            "end": 4.7
          },
          {
            "char": "的",
            "start": 4.7,
            "end": 4.9
          },
          {
            "char": "天",
            "start": 4.9,
            "end": 5.3,
            "highlight": true
          },
          {
            "char": "空",
            "start": 5.3,
            "end": 5.7,
            "highlight": true
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "太空里真奇妙，一颗颗星星在眨眼睛",
        "image": "assets/images/cover_space_rocket.webp",
        "interactions": [
          {
            "x": "70%",
            "y": "30%",
            "sound": "Pop",
            "anim": "animate-spin-slow",
            "text": "闪烁的星星！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "太",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "空",
            "start": 0.4,
            "end": 0.8,
            "highlight": true
          },
          {
            "char": "里",
            "start": 0.8,
            "end": 1.1
          },
          {
            "char": "真",
            "start": 1.1,
            "end": 1.4
          },
          {
            "char": "奇",
            "start": 1.4,
            "end": 1.7
          },
          {
            "char": "妙",
            "start": 1.7,
            "end": 2
          },
          {
            "char": "，",
            "start": 2,
            "end": 2.2
          },
          {
            "char": "一",
            "start": 2.2,
            "end": 2.5
          },
          {
            "char": "颗",
            "start": 2.5,
            "end": 2.8
          },
          {
            "char": "颗",
            "start": 2.8,
            "end": 3.1
          },
          {
            "char": "星",
            "start": 3.1,
            "end": 3.5,
            "highlight": true
          },
          {
            "char": "星",
            "start": 3.5,
            "end": 3.9,
            "highlight": true
          },
          {
            "char": "在",
            "start": 3.9,
            "end": 4.2
          },
          {
            "char": "眨",
            "start": 4.2,
            "end": 4.5
          },
          {
            "char": "眼",
            "start": 4.5,
            "end": 4.8
          },
          {
            "char": "睛",
            "start": 4.8,
            "end": 5.2
          }
        ]
      },
      {
        "pageNumber": 3,
        "text": "宇航员在太空中自由飞翔，向地球挥挥手",
        "image": "assets/images/cover_space_rocket.webp",
        "interactions": [
          {
            "x": "40%",
            "y": "50%",
            "sound": "VictoryFanfare",
            "anim": "animate-bounce",
            "text": "美丽的蓝色地球！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "宇",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "航",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "员",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "在",
            "start": 1,
            "end": 1.3
          },
          {
            "char": "太",
            "start": 1.3,
            "end": 1.6
          },
          {
            "char": "空",
            "start": 1.6,
            "end": 2,
            "highlight": true
          },
          {
            "char": "中",
            "start": 2,
            "end": 2.3
          },
          {
            "char": "自",
            "start": 2.3,
            "end": 2.6
          },
          {
            "char": "由",
            "start": 2.6,
            "end": 2.9
          },
          {
            "char": "飞",
            "start": 2.9,
            "end": 3.3,
            "highlight": true
          },
          {
            "char": "翔",
            "start": 3.3,
            "end": 3.6
          },
          {
            "char": "，",
            "start": 3.6,
            "end": 3.8
          },
          {
            "char": "向",
            "start": 3.8,
            "end": 4.1
          },
          {
            "char": "地",
            "start": 4.1,
            "end": 4.4
          },
          {
            "char": "球",
            "start": 4.4,
            "end": 4.7
          },
          {
            "char": "挥",
            "start": 4.7,
            "end": 5
          },
          {
            "char": "挥",
            "start": 5,
            "end": 5.3
          },
          {
            "char": "手",
            "start": 5.3,
            "end": 5.7
          }
        ]
      }
    ],
    "quiz": {
      "question": "小小宇航员乘着什么飞上太空？",
      "options": [
        "金色大火箭",
        "自行车",
        "木头小船"
      ],
      "correctIndex": 0
    }
  },
  {
    "id": "book_theme_dinosaur",
    "level": 2,
    "title": "神秘的恐龙世界",
    "coverImg": "assets/images/cover_dinosaur.webp",
    "stage": 2,
    "theme": "太空与科学探索",
    "targetChars": [
      "山",
      "林",
      "大",
      "草",
      "走"
    ],
    "desc": "穿越到神奇的恐龙王国，看霸王龙和三角龙在森林草地间生活",
    "pages": [
      {
        "pageNumber": 1,
        "text": "高高的大山下，有一片绿绿的古老森林",
        "image": "assets/images/cover_dinosaur.webp",
        "interactions": [
          {
            "x": "65%",
            "y": "35%",
            "sound": "Pop",
            "anim": "animate-bounce",
            "text": "巍峨的大山！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "高",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "高",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "的",
            "start": 0.7,
            "end": 0.9
          },
          {
            "char": "大",
            "start": 0.9,
            "end": 1.3,
            "highlight": true
          },
          {
            "char": "山",
            "start": 1.3,
            "end": 1.7,
            "highlight": true
          },
          {
            "char": "下",
            "start": 1.7,
            "end": 2
          },
          {
            "char": "，",
            "start": 2,
            "end": 2.2
          },
          {
            "char": "有",
            "start": 2.2,
            "end": 2.5
          },
          {
            "char": "一",
            "start": 2.5,
            "end": 2.8
          },
          {
            "char": "片",
            "start": 2.8,
            "end": 3.1
          },
          {
            "char": "绿",
            "start": 3.1,
            "end": 3.4
          },
          {
            "char": "绿",
            "start": 3.4,
            "end": 3.7
          },
          {
            "char": "的",
            "start": 3.7,
            "end": 3.9
          },
          {
            "char": "古",
            "start": 3.9,
            "end": 4.2
          },
          {
            "char": "老",
            "start": 4.2,
            "end": 4.5
          },
          {
            "char": "森",
            "start": 4.5,
            "end": 4.8
          },
          {
            "char": "林",
            "start": 4.8,
            "end": 5.2,
            "highlight": true
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "大恐龙在草地上慢慢走，吃着青青的小草",
        "image": "assets/images/cover_dinosaur.webp",
        "interactions": [
          {
            "x": "50%",
            "y": "60%",
            "sound": "ChestOpen",
            "anim": "animate-pulse",
            "text": "吃草的三角龙！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "大",
            "start": 0.1,
            "end": 0.5,
            "highlight": true
          },
          {
            "char": "恐",
            "start": 0.5,
            "end": 0.8
          },
          {
            "char": "龙",
            "start": 0.8,
            "end": 1.1
          },
          {
            "char": "在",
            "start": 1.1,
            "end": 1.4
          },
          {
            "char": "草",
            "start": 1.4,
            "end": 1.8,
            "highlight": true
          },
          {
            "char": "地",
            "start": 1.8,
            "end": 2.1
          },
          {
            "char": "上",
            "start": 2.1,
            "end": 2.4
          },
          {
            "char": "慢",
            "start": 2.4,
            "end": 2.7
          },
          {
            "char": "慢",
            "start": 2.7,
            "end": 3
          },
          {
            "char": "走",
            "start": 3,
            "end": 3.4,
            "highlight": true
          },
          {
            "char": "，",
            "start": 3.4,
            "end": 3.6
          },
          {
            "char": "吃",
            "start": 3.6,
            "end": 3.9
          },
          {
            "char": "着",
            "start": 3.9,
            "end": 4.1
          },
          {
            "char": "青",
            "start": 4.1,
            "end": 4.4
          },
          {
            "char": "青",
            "start": 4.4,
            "end": 4.7
          },
          {
            "char": "的",
            "start": 4.7,
            "end": 4.9
          },
          {
            "char": "小",
            "start": 4.9,
            "end": 5.2
          },
          {
            "char": "草",
            "start": 5.2,
            "end": 5.6,
            "highlight": true
          }
        ]
      },
      {
        "pageNumber": 3,
        "text": "恐龙蛋破壳了，可爱的小恐龙走出来啦",
        "image": "assets/images/cover_dinosaur.webp",
        "interactions": [
          {
            "x": "40%",
            "y": "50%",
            "sound": "VictoryFanfare",
            "anim": "animate-bounce",
            "text": "小恐龙破壳！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "恐",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "龙",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "蛋",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "破",
            "start": 1,
            "end": 1.3
          },
          {
            "char": "壳",
            "start": 1.3,
            "end": 1.6
          },
          {
            "char": "了",
            "start": 1.6,
            "end": 1.8
          },
          {
            "char": "，",
            "start": 1.8,
            "end": 2
          },
          {
            "char": "可",
            "start": 2,
            "end": 2.3
          },
          {
            "char": "爱",
            "start": 2.3,
            "end": 2.6
          },
          {
            "char": "的",
            "start": 2.6,
            "end": 2.8
          },
          {
            "char": "小",
            "start": 2.8,
            "end": 3.1
          },
          {
            "char": "恐",
            "start": 3.1,
            "end": 3.4
          },
          {
            "char": "龙",
            "start": 3.4,
            "end": 3.7
          },
          {
            "char": "走",
            "start": 3.7,
            "end": 4.1,
            "highlight": true
          },
          {
            "char": "出",
            "start": 4.1,
            "end": 4.4
          },
          {
            "char": "来",
            "start": 4.4,
            "end": 4.7
          },
          {
            "char": "啦",
            "start": 4.7,
            "end": 5.1
          }
        ]
      }
    ],
    "quiz": {
      "question": "故事里的大恐龙在草地上吃什么？",
      "options": [
        "吃青青的小草",
        "吃巧克力",
        "吃冰淇淋"
      ],
      "correctIndex": 0
    }
  },
  {
    "id": "book_theme_share_honey",
    "level": 1,
    "title": "小熊学会了分享",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 1,
    "theme": "好习惯与情绪管理",
    "targetChars": [
      "我",
      "你",
      "好",
      "朋",
      "友"
    ],
    "desc": "小熊有一罐甜甜的蜂蜜，他分享给好朋友们，大家都夸他是好孩子",
    "pages": [
      {
        "pageNumber": 1,
        "text": "我有一罐甜蜂蜜，你好小兔请你吃",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "55%",
            "y": "60%",
            "sound": "Pop",
            "anim": "animate-bounce",
            "text": "金黄的蜂蜜罐！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "我",
            "start": 0.1,
            "end": 0.5,
            "highlight": true
          },
          {
            "char": "有",
            "start": 0.5,
            "end": 0.8
          },
          {
            "char": "一",
            "start": 0.8,
            "end": 1.1
          },
          {
            "char": "罐",
            "start": 1.1,
            "end": 1.4
          },
          {
            "char": "甜",
            "start": 1.4,
            "end": 1.7
          },
          {
            "char": "蜂",
            "start": 1.7,
            "end": 2
          },
          {
            "char": "蜜",
            "start": 2,
            "end": 2.3
          },
          {
            "char": "，",
            "start": 2.3,
            "end": 2.5
          },
          {
            "char": "你",
            "start": 2.5,
            "end": 2.9,
            "highlight": true
          },
          {
            "char": "好",
            "start": 2.9,
            "end": 3.3,
            "highlight": true
          },
          {
            "char": "小",
            "start": 3.3,
            "end": 3.6
          },
          {
            "char": "兔",
            "start": 3.6,
            "end": 3.9
          },
          {
            "char": "请",
            "start": 3.9,
            "end": 4.2
          },
          {
            "char": "你",
            "start": 4.2,
            "end": 4.6,
            "highlight": true
          },
          {
            "char": "吃",
            "start": 4.6,
            "end": 5
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "小兔和小鸟都来了，大家都是好朋友",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "70%",
            "y": "40%",
            "sound": "ChestOpen",
            "anim": "animate-pulse",
            "text": "小鸟开心地歌唱！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "小",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "兔",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "和",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "小",
            "start": 1,
            "end": 1.3
          },
          {
            "char": "鸟",
            "start": 1.3,
            "end": 1.6
          },
          {
            "char": "都",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "来",
            "start": 1.9,
            "end": 2.2
          },
          {
            "char": "了",
            "start": 2.2,
            "end": 2.4
          },
          {
            "char": "，",
            "start": 2.4,
            "end": 2.6
          },
          {
            "char": "大",
            "start": 2.6,
            "end": 2.9
          },
          {
            "char": "家",
            "start": 2.9,
            "end": 3.2
          },
          {
            "char": "都",
            "start": 3.2,
            "end": 3.5
          },
          {
            "char": "是",
            "start": 3.5,
            "end": 3.8
          },
          {
            "char": "好",
            "start": 3.8,
            "end": 4.2,
            "highlight": true
          },
          {
            "char": "朋",
            "start": 4.2,
            "end": 4.6,
            "highlight": true
          },
          {
            "char": "友",
            "start": 4.6,
            "end": 5.1,
            "highlight": true
          }
        ]
      },
      {
        "pageNumber": 3,
        "text": "懂得分享真正好，我们一起哈哈笑",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "45%",
            "y": "50%",
            "sound": "VictoryFanfare",
            "anim": "animate-bounce",
            "text": "分享最快乐！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "懂",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "得",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "分",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "享",
            "start": 1,
            "end": 1.3
          },
          {
            "char": "真",
            "start": 1.3,
            "end": 1.6
          },
          {
            "char": "正",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "好",
            "start": 1.9,
            "end": 2.3,
            "highlight": true
          },
          {
            "char": "，",
            "start": 2.3,
            "end": 2.5
          },
          {
            "char": "我",
            "start": 2.5,
            "end": 2.9,
            "highlight": true
          },
          {
            "char": "们",
            "start": 2.9,
            "end": 3.2
          },
          {
            "char": "一",
            "start": 3.2,
            "end": 3.5
          },
          {
            "char": "起",
            "start": 3.5,
            "end": 3.8
          },
          {
            "char": "哈",
            "start": 3.8,
            "end": 4.1
          },
          {
            "char": "哈",
            "start": 4.1,
            "end": 4.4
          },
          {
            "char": "笑",
            "start": 4.4,
            "end": 4.9
          }
        ]
      }
    ],
    "quiz": {
      "question": "小熊把什么美味分享给了好朋友？",
      "options": [
        "甜甜的蜂蜜",
        "苦苦的药水",
        "小石头"
      ],
      "correctIndex": 0
    }
  },
  {
    "id": "book_theme_sleep_alone",
    "level": 2,
    "title": "自己睡觉我不怕",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 2,
    "theme": "好习惯与情绪管理",
    "targetChars": [
      "夜",
      "光",
      "星",
      "梦",
      "安"
    ],
    "desc": "月光柔柔照窗台，小熊盖好小被子，听着晚安曲进入香甜的梦乡",
    "pages": [
      {
        "pageNumber": 1,
        "text": "夜深了月光照，小熊躺在小床上",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "75%",
            "y": "25%",
            "sound": "Pop",
            "anim": "animate-spin-slow",
            "text": "温柔的月光！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "夜",
            "start": 0.1,
            "end": 0.5,
            "highlight": true
          },
          {
            "char": "深",
            "start": 0.5,
            "end": 0.8
          },
          {
            "char": "了",
            "start": 0.8,
            "end": 1
          },
          {
            "char": "月",
            "start": 1,
            "end": 1.3
          },
          {
            "char": "光",
            "start": 1.3,
            "end": 1.7,
            "highlight": true
          },
          {
            "char": "照",
            "start": 1.7,
            "end": 2
          },
          {
            "char": "，",
            "start": 2,
            "end": 2.2
          },
          {
            "char": "小",
            "start": 2.2,
            "end": 2.5
          },
          {
            "char": "熊",
            "start": 2.5,
            "end": 2.8
          },
          {
            "char": "躺",
            "start": 2.8,
            "end": 3.1
          },
          {
            "char": "在",
            "start": 3.1,
            "end": 3.4
          },
          {
            "char": "小",
            "start": 3.4,
            "end": 3.7
          },
          {
            "char": "床",
            "start": 3.7,
            "end": 4
          },
          {
            "char": "上",
            "start": 4,
            "end": 4.4
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "窗外星星眨眼睛，晚风送来平安夜",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "35%",
            "y": "30%",
            "sound": "ChestOpen",
            "anim": "animate-pulse",
            "text": "守护星光！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "窗",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "外",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "星",
            "start": 0.7,
            "end": 1.1,
            "highlight": true
          },
          {
            "char": "星",
            "start": 1.1,
            "end": 1.5,
            "highlight": true
          },
          {
            "char": "眨",
            "start": 1.5,
            "end": 1.8
          },
          {
            "char": "眼",
            "start": 1.8,
            "end": 2.1
          },
          {
            "char": "睛",
            "start": 2.1,
            "end": 2.4
          },
          {
            "char": "，",
            "start": 2.4,
            "end": 2.6
          },
          {
            "char": "晚",
            "start": 2.6,
            "end": 2.9
          },
          {
            "char": "风",
            "start": 2.9,
            "end": 3.2
          },
          {
            "char": "送",
            "start": 3.2,
            "end": 3.5
          },
          {
            "char": "来",
            "start": 3.5,
            "end": 3.8
          },
          {
            "char": "平",
            "start": 3.8,
            "end": 4.1
          },
          {
            "char": "安",
            "start": 4.1,
            "end": 4.5,
            "highlight": true
          },
          {
            "char": "夜",
            "start": 4.5,
            "end": 4.9,
            "highlight": true
          }
        ]
      },
      {
        "pageNumber": 3,
        "text": "闭上眼睛做好梦，勇敢孩子睡得香",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "50%",
            "y": "50%",
            "sound": "VictoryFanfare",
            "anim": "animate-bounce",
            "text": "甜甜的美梦！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "闭",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "上",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "眼",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "睛",
            "start": 1,
            "end": 1.3
          },
          {
            "char": "做",
            "start": 1.3,
            "end": 1.6
          },
          {
            "char": "好",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "梦",
            "start": 1.9,
            "end": 2.4,
            "highlight": true
          },
          {
            "char": "，",
            "start": 2.4,
            "end": 2.6
          },
          {
            "char": "勇",
            "start": 2.6,
            "end": 2.9
          },
          {
            "char": "敢",
            "start": 2.9,
            "end": 3.2
          },
          {
            "char": "孩",
            "start": 3.2,
            "end": 3.5
          },
          {
            "char": "子",
            "start": 3.5,
            "end": 3.8
          },
          {
            "char": "睡",
            "start": 3.8,
            "end": 4.1
          },
          {
            "char": "得",
            "start": 4.1,
            "end": 4.3
          },
          {
            "char": "香",
            "start": 4.3,
            "end": 4.8
          }
        ]
      }
    ],
    "quiz": {
      "question": "夜深了小熊在床上怎么做？",
      "options": [
        "闭上眼睛做好梦独立入睡",
        "大喊大叫不睡觉",
        "在床上蹦蹦跳跳"
      ],
      "correctIndex": 0
    }
  },
  {
    "id": "book_001",
    "level": 1,
    "title": "小猫钓鱼",
    "coverImg": "assets/images/cover_cat_fishing.webp",
    "stage": 1,
    "theme": "奇幻森林岛",
    "targetChars": [
      "日",
      "月",
      "水",
      "山",
      "人"
    ],
    "desc": "在阳光明媚的日子里，小猫来到清清的小河边钓鱼，认识了大自然的美好",
    "pages": [
      {
        "pageNumber": 1,
        "text": "红红的日头升起来了，照在绿绿的大山上",
        "image": "assets/images/cover_cat_fishing.webp",
        "interactions": [
          {
            "x": "75%",
            "y": "20%",
            "sound": "Pop",
            "anim": "animate-spin-slow",
            "text": "红红的日头！"
          },
          {
            "x": "30%",
            "y": "45%",
            "sound": "Pop",
            "anim": "animate-bounce",
            "text": "青翠的大山！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "红",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "红",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "的",
            "start": 0.7,
            "end": 0.9
          },
          {
            "char": "日",
            "start": 0.9,
            "end": 1.3,
            "highlight": true
          },
          {
            "char": "头",
            "start": 1.3,
            "end": 1.6
          },
          {
            "char": "升",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "起",
            "start": 1.9,
            "end": 2.2
          },
          {
            "char": "来",
            "start": 2.2,
            "end": 2.5
          },
          {
            "char": "了",
            "start": 2.5,
            "end": 2.8
          },
          {
            "char": "，",
            "start": 2.8,
            "end": 3
          },
          {
            "char": "照",
            "start": 3,
            "end": 3.3
          },
          {
            "char": "在",
            "start": 3.3,
            "end": 3.6
          },
          {
            "char": "绿",
            "start": 3.6,
            "end": 3.9
          },
          {
            "char": "绿",
            "start": 3.9,
            "end": 4.2
          },
          {
            "char": "的",
            "start": 4.2,
            "end": 4.4
          },
          {
            "char": "大",
            "start": 4.4,
            "end": 4.7
          },
          {
            "char": "山",
            "start": 4.7,
            "end": 5.2,
            "highlight": true
          },
          {
            "char": "上",
            "start": 5.2,
            "end": 5.5
          },
          {
            "char": "",
            "start": 5.5,
            "end": 5.8
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "清清的河水哗啦啦，水里有快活的小鱼",
        "image": "assets/images/cover_cat_fishing.webp",
        "interactions": [
          {
            "x": "48%",
            "y": "68%",
            "sound": "ChestOpen",
            "anim": "animate-bounce",
            "text": "发现小金鱼！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "清",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "清",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "的",
            "start": 0.7,
            "end": 0.9
          },
          {
            "char": "河",
            "start": 0.9,
            "end": 1.2
          },
          {
            "char": "水",
            "start": 1.2,
            "end": 1.6,
            "highlight": true
          },
          {
            "char": "哗",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "啦",
            "start": 1.9,
            "end": 2.2
          },
          {
            "char": "啦",
            "start": 2.2,
            "end": 2.5
          },
          {
            "char": "，",
            "start": 2.5,
            "end": 2.7
          },
          {
            "char": "水",
            "start": 2.7,
            "end": 3,
            "highlight": true
          },
          {
            "char": "里",
            "start": 3,
            "end": 3.3
          },
          {
            "char": "有",
            "start": 3.3,
            "end": 3.6
          },
          {
            "char": "快",
            "start": 3.6,
            "end": 3.9
          },
          {
            "char": "活",
            "start": 3.9,
            "end": 4.2
          },
          {
            "char": "的",
            "start": 4.2,
            "end": 4.4
          },
          {
            "char": "小",
            "start": 4.4,
            "end": 4.7
          },
          {
            "char": "鱼",
            "start": 4.7,
            "end": 5.2
          },
          {
            "char": "",
            "start": 5.2,
            "end": 5.5
          }
        ]
      },
      {
        "pageNumber": 3,
        "text": "夜晚月亮出来了，小猫高高兴兴走在回家路上",
        "image": "assets/images/cover_cat_fishing.webp",
        "interactions": [
          {
            "x": "78%",
            "y": "18%",
            "sound": "Pop",
            "anim": "animate-pulse",
            "text": "弯弯的月牙！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "夜",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "晚",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "月",
            "start": 0.7,
            "end": 1.1,
            "highlight": true
          },
          {
            "char": "亮",
            "start": 1.1,
            "end": 1.4
          },
          {
            "char": "出",
            "start": 1.4,
            "end": 1.7
          },
          {
            "char": "来",
            "start": 1.7,
            "end": 2
          },
          {
            "char": "了",
            "start": 2,
            "end": 2.3
          },
          {
            "char": "，",
            "start": 2.3,
            "end": 2.5
          },
          {
            "char": "小",
            "start": 2.5,
            "end": 2.8
          },
          {
            "char": "猫",
            "start": 2.8,
            "end": 3.1
          },
          {
            "char": "高",
            "start": 3.1,
            "end": 3.4
          },
          {
            "char": "高",
            "start": 3.4,
            "end": 3.7
          },
          {
            "char": "兴",
            "start": 3.7,
            "end": 4
          },
          {
            "char": "兴",
            "start": 4,
            "end": 4.3
          },
          {
            "char": "走",
            "start": 4.3,
            "end": 4.6
          },
          {
            "char": "在",
            "start": 4.6,
            "end": 4.8
          },
          {
            "char": "回",
            "start": 4.8,
            "end": 5.1
          },
          {
            "char": "家",
            "start": 5.1,
            "end": 5.4
          },
          {
            "char": "路",
            "start": 5.4,
            "end": 5.7
          },
          {
            "char": "上",
            "start": 5.7,
            "end": 6
          },
          {
            "char": "",
            "start": 6,
            "end": 6.3
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "故事里，清清的水里游着什么动物？",
        "options": [
          "小鱼",
          "小鸟",
          "小猴",
          "小狗"
        ],
        "correctIndex": 0
      },
      {
        "question": "夜晚天空中升起来的是什么？",
        "options": [
          "月亮",
          "太阳",
          "风筝",
          "飞机"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "id": "book_002",
    "level": 2,
    "title": "森林里的树木与小松鼠",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 1,
    "theme": "奇幻森林岛",
    "targetChars": [
      "木",
      "人",
      "口",
      "日",
      "山"
    ],
    "desc": "大树是小动物们温暖的家，快乐的人们在森林里和小松鼠做朋友",
    "pages": [
      {
        "pageNumber": 1,
        "text": "大山里有高高的木头大树，树上结满了甜甜的果子",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "25%",
            "y": "40%",
            "sound": "Pop",
            "anim": "animate-bounce",
            "text": "苍翠茂密的大树！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "大",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "山",
            "start": 0.4,
            "end": 0.8,
            "highlight": true
          },
          {
            "char": "里",
            "start": 0.8,
            "end": 1.1
          },
          {
            "char": "有",
            "start": 1.1,
            "end": 1.4
          },
          {
            "char": "高",
            "start": 1.4,
            "end": 1.7
          },
          {
            "char": "高",
            "start": 1.7,
            "end": 2
          },
          {
            "char": "的",
            "start": 2,
            "end": 2.2
          },
          {
            "char": "木",
            "start": 2.2,
            "end": 2.6,
            "highlight": true
          },
          {
            "char": "头",
            "start": 2.6,
            "end": 2.9
          },
          {
            "char": "大",
            "start": 2.9,
            "end": 3.2
          },
          {
            "char": "树",
            "start": 3.2,
            "end": 3.5
          },
          {
            "char": "，",
            "start": 3.5,
            "end": 3.7
          },
          {
            "char": "树",
            "start": 3.7,
            "end": 4
          },
          {
            "char": "上",
            "start": 4,
            "end": 4.3
          },
          {
            "char": "结",
            "start": 4.3,
            "end": 4.6
          },
          {
            "char": "满",
            "start": 4.6,
            "end": 4.9
          },
          {
            "char": "了",
            "start": 4.9,
            "end": 5.1
          },
          {
            "char": "甜",
            "start": 5.1,
            "end": 5.4
          },
          {
            "char": "甜",
            "start": 5.4,
            "end": 5.7
          },
          {
            "char": "的",
            "start": 5.7,
            "end": 5.9
          },
          {
            "char": "果",
            "start": 5.9,
            "end": 6.2
          },
          {
            "char": "子",
            "start": 6.2,
            "end": 6.5
          },
          {
            "char": "",
            "start": 6.5,
            "end": 6.8
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "松鼠张开口吃果子，好心的人们走过来给它拍照片",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "65%",
            "y": "50%",
            "sound": "ChestOpen",
            "anim": "animate-bounce",
            "text": "可爱的小松鼠！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "松",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "鼠",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "张",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "开",
            "start": 1,
            "end": 1.3
          },
          {
            "char": "口",
            "start": 1.3,
            "end": 1.7,
            "highlight": true
          },
          {
            "char": "吃",
            "start": 1.7,
            "end": 2
          },
          {
            "char": "果",
            "start": 2,
            "end": 2.3
          },
          {
            "char": "子",
            "start": 2.3,
            "end": 2.6
          },
          {
            "char": "，",
            "start": 2.6,
            "end": 2.8
          },
          {
            "char": "好",
            "start": 2.8,
            "end": 3.1
          },
          {
            "char": "心",
            "start": 3.1,
            "end": 3.4
          },
          {
            "char": "的",
            "start": 3.4,
            "end": 3.6
          },
          {
            "char": "人",
            "start": 3.6,
            "end": 4,
            "highlight": true
          },
          {
            "char": "们",
            "start": 4,
            "end": 4.3
          },
          {
            "char": "走",
            "start": 4.3,
            "end": 4.6
          },
          {
            "char": "过",
            "start": 4.6,
            "end": 4.8
          },
          {
            "char": "来",
            "start": 4.8,
            "end": 5.1
          },
          {
            "char": "给",
            "start": 5.1,
            "end": 5.3
          },
          {
            "char": "它",
            "start": 5.3,
            "end": 5.5
          },
          {
            "char": "拍",
            "start": 5.5,
            "end": 5.8
          },
          {
            "char": "照",
            "start": 5.8,
            "end": 6.1
          },
          {
            "char": "片",
            "start": 6.1,
            "end": 6.4
          },
          {
            "char": "",
            "start": 6.4,
            "end": 6.7
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "松鼠用什么吃甜甜的果子？",
        "options": [
          "口 (嘴巴)",
          "耳朵",
          "尾巴",
          "翅膀"
        ],
        "correctIndex": 0
      },
      {
        "question": "树木生长在什么地方？",
        "options": [
          "大山森林里",
          "云朵上面",
          "海底深处",
          "房子屋顶"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "id": "book_003",
    "level": 1,
    "title": "小水滴的大海梦",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 1,
    "theme": "奇幻森林岛",
    "targetChars": [
      "水",
      "日",
      "月",
      "火",
      "土"
    ],
    "desc": "一滴小水滴从高山上的泥土出发，在日光照耀下奔向广阔无边的大海",
    "pages": [
      {
        "pageNumber": 1,
        "text": "雨水落在大地的泥土上，小水滴醒来了",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "50%",
            "y": "45%",
            "sound": "Pop",
            "anim": "animate-bounce",
            "text": "晶莹的小水滴！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "雨",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "水",
            "start": 0.4,
            "end": 0.8,
            "highlight": true
          },
          {
            "char": "落",
            "start": 0.8,
            "end": 1.1
          },
          {
            "char": "在",
            "start": 1.1,
            "end": 1.4
          },
          {
            "char": "大",
            "start": 1.4,
            "end": 1.7
          },
          {
            "char": "地",
            "start": 1.7,
            "end": 2
          },
          {
            "char": "的",
            "start": 2,
            "end": 2.2
          },
          {
            "char": "泥",
            "start": 2.2,
            "end": 2.5
          },
          {
            "char": "土",
            "start": 2.5,
            "end": 2.9,
            "highlight": true
          },
          {
            "char": "上",
            "start": 2.9,
            "end": 3.2
          },
          {
            "char": "，",
            "start": 3.2,
            "end": 3.4
          },
          {
            "char": "小",
            "start": 3.4,
            "end": 3.7
          },
          {
            "char": "水",
            "start": 3.7,
            "end": 4.1,
            "highlight": true
          },
          {
            "char": "滴",
            "start": 4.1,
            "end": 4.4
          },
          {
            "char": "醒",
            "start": 4.4,
            "end": 4.7
          },
          {
            "char": "来",
            "start": 4.7,
            "end": 5
          },
          {
            "char": "了",
            "start": 5,
            "end": 5.3
          },
          {
            "char": "",
            "start": 5.3,
            "end": 5.6
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "红日高照温暖如火，小水滴欢快地流向大海",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "75%",
            "y": "30%",
            "sound": "ChestOpen",
            "anim": "animate-pulse",
            "text": "暖洋洋的火光！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "红",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "日",
            "start": 0.4,
            "end": 0.8,
            "highlight": true
          },
          {
            "char": "高",
            "start": 0.8,
            "end": 1.1
          },
          {
            "char": "照",
            "start": 1.1,
            "end": 1.4
          },
          {
            "char": "温",
            "start": 1.4,
            "end": 1.7
          },
          {
            "char": "暖",
            "start": 1.7,
            "end": 2
          },
          {
            "char": "如",
            "start": 2,
            "end": 2.3
          },
          {
            "char": "火",
            "start": 2.3,
            "end": 2.7,
            "highlight": true
          },
          {
            "char": "，",
            "start": 2.7,
            "end": 2.9
          },
          {
            "char": "小",
            "start": 2.9,
            "end": 3.2
          },
          {
            "char": "水",
            "start": 3.2,
            "end": 3.6,
            "highlight": true
          },
          {
            "char": "滴",
            "start": 3.6,
            "end": 3.9
          },
          {
            "char": "欢",
            "start": 3.9,
            "end": 4.2
          },
          {
            "char": "快",
            "start": 4.2,
            "end": 4.5
          },
          {
            "char": "地",
            "start": 4.5,
            "end": 4.7
          },
          {
            "char": "流",
            "start": 4.7,
            "end": 5
          },
          {
            "char": "向",
            "start": 5,
            "end": 5.3
          },
          {
            "char": "大",
            "start": 5.3,
            "end": 5.6
          },
          {
            "char": "海",
            "start": 5.6,
            "end": 6
          },
          {
            "char": "",
            "start": 6,
            "end": 6.3
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "小水滴最终流向了哪里？",
        "options": [
          "广阔的大海",
          "深山里的洞穴",
          "树木的枝头",
          "月亮上面"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "id": "book_004",
    "level": 2,
    "title": "神秘的森林集市",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 2,
    "theme": "缤纷生活岛",
    "targetChars": [
      "田",
      "禾",
      "木",
      "口",
      "人"
    ],
    "desc": "丰收的田野里长满了金黄的禾苗，大家在森林集市上分享香甜的食物",
    "pages": [
      {
        "pageNumber": 1,
        "text": "金色的水田里，禾苗长得又高又壮",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "35%",
            "y": "55%",
            "sound": "Pop",
            "anim": "animate-bounce",
            "text": "饱满的金色禾苗！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "金",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "色",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "的",
            "start": 0.7,
            "end": 0.9
          },
          {
            "char": "水",
            "start": 0.9,
            "end": 1.2
          },
          {
            "char": "田",
            "start": 1.2,
            "end": 1.6,
            "highlight": true
          },
          {
            "char": "里",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "，",
            "start": 1.9,
            "end": 2.1
          },
          {
            "char": "禾",
            "start": 2.1,
            "end": 2.5,
            "highlight": true
          },
          {
            "char": "苗",
            "start": 2.5,
            "end": 2.8
          },
          {
            "char": "长",
            "start": 2.8,
            "end": 3.1
          },
          {
            "char": "得",
            "start": 3.1,
            "end": 3.3
          },
          {
            "char": "又",
            "start": 3.3,
            "end": 3.6
          },
          {
            "char": "高",
            "start": 3.6,
            "end": 3.9
          },
          {
            "char": "又",
            "start": 3.9,
            "end": 4.2
          },
          {
            "char": "壮",
            "start": 4.2,
            "end": 4.6
          },
          {
            "char": "",
            "start": 4.6,
            "end": 4.9
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "集市上人来人往，大家开口大笑尝美食",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "70%",
            "y": "45%",
            "sound": "ChestOpen",
            "anim": "animate-spin-slow",
            "text": "香喷喷的美食！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "集",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "市",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "上",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "人",
            "start": 1,
            "end": 1.4,
            "highlight": true
          },
          {
            "char": "来",
            "start": 1.4,
            "end": 1.7
          },
          {
            "char": "人",
            "start": 1.7,
            "end": 2.1,
            "highlight": true
          },
          {
            "char": "往",
            "start": 2.1,
            "end": 2.4
          },
          {
            "char": "，",
            "start": 2.4,
            "end": 2.6
          },
          {
            "char": "大",
            "start": 2.6,
            "end": 2.9
          },
          {
            "char": "家",
            "start": 2.9,
            "end": 3.2
          },
          {
            "char": "开",
            "start": 3.2,
            "end": 3.5
          },
          {
            "char": "口",
            "start": 3.5,
            "end": 3.9,
            "highlight": true
          },
          {
            "char": "大",
            "start": 3.9,
            "end": 4.2
          },
          {
            "char": "笑",
            "start": 4.2,
            "end": 4.5
          },
          {
            "char": "尝",
            "start": 4.5,
            "end": 4.8
          },
          {
            "char": "美",
            "start": 4.8,
            "end": 5.1
          },
          {
            "char": "食",
            "start": 5.1,
            "end": 5.4
          },
          {
            "char": "",
            "start": 5.4,
            "end": 5.7
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "水田里长得又高又壮的是什么？",
        "options": [
          "禾苗",
          "石头",
          "木船",
          "风车"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "id": "book_005",
    "level": 2,
    "title": "小镇上的发明家",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 2,
    "theme": "缤纷生活岛",
    "targetChars": [
      "门",
      "车",
      "马",
      "鸟",
      "鱼"
    ],
    "desc": "在美丽的生活小镇上，小动物们推开大门，坐上奇妙的太阳能小马车去旅行",
    "pages": [
      {
        "pageNumber": 1,
        "text": "推开红色的大门，一辆木头小马车停在门前",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "25%",
            "y": "45%",
            "sound": "Pop",
            "anim": "animate-bounce",
            "text": "推开大门！"
          },
          {
            "x": "65%",
            "y": "55%",
            "sound": "Pop",
            "anim": "animate-pulse",
            "text": "神气的小马车！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "推",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "开",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "红",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "色",
            "start": 1,
            "end": 1.3
          },
          {
            "char": "的",
            "start": 1.3,
            "end": 1.5
          },
          {
            "char": "大",
            "start": 1.5,
            "end": 1.8
          },
          {
            "char": "门",
            "start": 1.8,
            "end": 2.2,
            "highlight": true
          },
          {
            "char": "，",
            "start": 2.2,
            "end": 2.4
          },
          {
            "char": "一",
            "start": 2.4,
            "end": 2.6
          },
          {
            "char": "辆",
            "start": 2.6,
            "end": 2.9
          },
          {
            "char": "木",
            "start": 2.9,
            "end": 3.2
          },
          {
            "char": "头",
            "start": 3.2,
            "end": 3.5
          },
          {
            "char": "小",
            "start": 3.5,
            "end": 3.8
          },
          {
            "char": "马",
            "start": 3.8,
            "end": 4.2,
            "highlight": true
          },
          {
            "char": "车",
            "start": 4.2,
            "end": 4.6,
            "highlight": true
          },
          {
            "char": "停",
            "start": 4.6,
            "end": 4.9
          },
          {
            "char": "在",
            "start": 4.9,
            "end": 5.1
          },
          {
            "char": "门",
            "start": 5.1,
            "end": 5.5,
            "highlight": true
          },
          {
            "char": "前",
            "start": 5.5,
            "end": 5.8
          },
          {
            "char": "",
            "start": 5.8,
            "end": 6.1
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "天上飞过小鸟，水里游着小鱼，小车跑得飞快",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "40%",
            "y": "25%",
            "sound": "ChestOpen",
            "anim": "animate-spin-slow",
            "text": "飞翔的小鸟！"
          },
          {
            "x": "75%",
            "y": "65%",
            "sound": "Pop",
            "anim": "animate-bounce",
            "text": "快乐的小鱼！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "天",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "上",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "飞",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "过",
            "start": 1,
            "end": 1.2
          },
          {
            "char": "小",
            "start": 1.2,
            "end": 1.5
          },
          {
            "char": "鸟",
            "start": 1.5,
            "end": 1.9,
            "highlight": true
          },
          {
            "char": "，",
            "start": 1.9,
            "end": 2.1
          },
          {
            "char": "水",
            "start": 2.1,
            "end": 2.4
          },
          {
            "char": "里",
            "start": 2.4,
            "end": 2.7
          },
          {
            "char": "游",
            "start": 2.7,
            "end": 3
          },
          {
            "char": "着",
            "start": 3,
            "end": 3.2
          },
          {
            "char": "小",
            "start": 3.2,
            "end": 3.5
          },
          {
            "char": "鱼",
            "start": 3.5,
            "end": 3.9,
            "highlight": true
          },
          {
            "char": "，",
            "start": 3.9,
            "end": 4.1
          },
          {
            "char": "小",
            "start": 4.1,
            "end": 4.4
          },
          {
            "char": "车",
            "start": 4.4,
            "end": 4.8,
            "highlight": true
          },
          {
            "char": "跑",
            "start": 4.8,
            "end": 5.1
          },
          {
            "char": "得",
            "start": 5.1,
            "end": 5.3
          },
          {
            "char": "飞",
            "start": 5.3,
            "end": 5.6
          },
          {
            "char": "快",
            "start": 5.6,
            "end": 6
          },
          {
            "char": "",
            "start": 6,
            "end": 6.3
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "门前停着的交通工具是什么？",
        "options": [
          "小马车",
          "大飞机",
          "潜水艇",
          "热气球"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "id": "book_006",
    "level": 3,
    "title": "星空号太空飞船",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 3,
    "theme": "星际探索岛",
    "targetChars": [
      "天",
      "云",
      "风",
      "雨",
      "雪"
    ],
    "desc": "穿过云朵与风雨，星空号飞向辽阔浩瀚的宇宙星海，探索天地的奥秘",
    "pages": [
      {
        "pageNumber": 1,
        "text": "蓝蓝的天空上，洁白的白云随风飘动",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "35%",
            "y": "25%",
            "sound": "Pop",
            "anim": "animate-pulse",
            "text": "软绵绵的白云！"
          },
          {
            "x": "70%",
            "y": "40%",
            "sound": "ChestOpen",
            "anim": "animate-bounce",
            "text": "星际飞船起飞！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "蓝",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "蓝",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "的",
            "start": 0.7,
            "end": 0.9
          },
          {
            "char": "天",
            "start": 0.9,
            "end": 1.3,
            "highlight": true
          },
          {
            "char": "空",
            "start": 1.3,
            "end": 1.6
          },
          {
            "char": "上",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "，",
            "start": 1.9,
            "end": 2.1
          },
          {
            "char": "洁",
            "start": 2.1,
            "end": 2.4
          },
          {
            "char": "白",
            "start": 2.4,
            "end": 2.7
          },
          {
            "char": "的",
            "start": 2.7,
            "end": 2.9
          },
          {
            "char": "白",
            "start": 2.9,
            "end": 3.2
          },
          {
            "char": "云",
            "start": 3.2,
            "end": 3.6,
            "highlight": true
          },
          {
            "char": "随",
            "start": 3.6,
            "end": 3.9
          },
          {
            "char": "风",
            "start": 3.9,
            "end": 4.3,
            "highlight": true
          },
          {
            "char": "飘",
            "start": 4.3,
            "end": 4.6
          },
          {
            "char": "动",
            "start": 4.6,
            "end": 5
          },
          {
            "char": "",
            "start": 5,
            "end": 5.3
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "飞船穿过风雨和白雪，飞向美丽的银河星空",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "50%",
            "y": "30%",
            "sound": "Pop",
            "anim": "animate-spin-slow",
            "text": "晶莹的雪花！"
          },
          {
            "x": "80%",
            "y": "20%",
            "sound": "ChestOpen",
            "anim": "animate-pulse",
            "text": "璀璨的银河！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "飞",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "船",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "穿",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "过",
            "start": 1,
            "end": 1.2
          },
          {
            "char": "风",
            "start": 1.2,
            "end": 1.6,
            "highlight": true
          },
          {
            "char": "雨",
            "start": 1.6,
            "end": 2,
            "highlight": true
          },
          {
            "char": "和",
            "start": 2,
            "end": 2.3
          },
          {
            "char": "白",
            "start": 2.3,
            "end": 2.6
          },
          {
            "char": "雪",
            "start": 2.6,
            "end": 3,
            "highlight": true
          },
          {
            "char": "，",
            "start": 3,
            "end": 3.2
          },
          {
            "char": "飞",
            "start": 3.2,
            "end": 3.5
          },
          {
            "char": "向",
            "start": 3.5,
            "end": 3.8
          },
          {
            "char": "美",
            "start": 3.8,
            "end": 4.1
          },
          {
            "char": "丽",
            "start": 4.1,
            "end": 4.4
          },
          {
            "char": "的",
            "start": 4.4,
            "end": 4.6
          },
          {
            "char": "银",
            "start": 4.6,
            "end": 4.9
          },
          {
            "char": "河",
            "start": 4.9,
            "end": 5.2
          },
          {
            "char": "星",
            "start": 5.2,
            "end": 5.5
          },
          {
            "char": "空",
            "start": 5.5,
            "end": 5.8
          },
          {
            "char": "",
            "start": 5.8,
            "end": 6.2
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "星空号飞船穿过了什么，飞向银河？",
        "options": [
          "风雨和白雪",
          "高山和深海",
          "森林和泥土",
          "沙漠和湖泊"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "id": "book_007",
    "level": 2,
    "title": "森林里的小动物",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 1,
    "theme": "奇幻森林岛",
    "targetChars": [
      "鸟",
      "鱼",
      "虫",
      "马",
      "牛",
      "羊"
    ],
    "desc": "小鸟在天空飞，小鱼在水里游，小马小牛在草地上奔跑，好热闹呀！",
    "pages": [
      {
        "pageNumber": 1,
        "text": "天上的小鸟欢快地唱歌，树下的小虫在草地里跳舞",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "25%",
            "y": "25%",
            "sound": "Pop",
            "anim": "animate-bounce",
            "text": "唱歌的小鸟！"
          },
          {
            "x": "75%",
            "y": "70%",
            "sound": "Pop",
            "anim": "animate-pulse",
            "text": "跳舞的小虫！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "天",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "上",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "的",
            "start": 0.7,
            "end": 0.9
          },
          {
            "char": "小",
            "start": 0.9,
            "end": 1.1
          },
          {
            "char": "鸟",
            "start": 1.1,
            "end": 1.5,
            "highlight": true
          },
          {
            "char": "欢",
            "start": 1.5,
            "end": 1.8
          },
          {
            "char": "快",
            "start": 1.8,
            "end": 2.1
          },
          {
            "char": "地",
            "start": 2.1,
            "end": 2.3
          },
          {
            "char": "唱",
            "start": 2.3,
            "end": 2.6
          },
          {
            "char": "歌",
            "start": 2.6,
            "end": 3
          },
          {
            "char": "，",
            "start": 3,
            "end": 3.2
          },
          {
            "char": "树",
            "start": 3.2,
            "end": 3.5
          },
          {
            "char": "下",
            "start": 3.5,
            "end": 3.8
          },
          {
            "char": "的",
            "start": 3.8,
            "end": 4
          },
          {
            "char": "小",
            "start": 4,
            "end": 4.2
          },
          {
            "char": "虫",
            "start": 4.2,
            "end": 4.6,
            "highlight": true
          },
          {
            "char": "在",
            "start": 4.6,
            "end": 4.8
          },
          {
            "char": "草",
            "start": 4.8,
            "end": 5.1
          },
          {
            "char": "地",
            "start": 5.1,
            "end": 5.4
          },
          {
            "char": "里",
            "start": 5.4,
            "end": 5.6
          },
          {
            "char": "跳",
            "start": 5.6,
            "end": 5.9
          },
          {
            "char": "舞",
            "start": 5.9,
            "end": 6.3
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "小马在广阔的大地上奔跑，小牛和小羊在悠闲地吃草",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "30%",
            "y": "50%",
            "sound": "ChestOpen",
            "anim": "animate-bounce",
            "text": "奔跑的小骏马！"
          },
          {
            "x": "70%",
            "y": "55%",
            "sound": "Pop",
            "anim": "animate-pulse",
            "text": "吃草的小绵羊！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "小",
            "start": 0.1,
            "end": 0.3
          },
          {
            "char": "马",
            "start": 0.3,
            "end": 0.7,
            "highlight": true
          },
          {
            "char": "在",
            "start": 0.7,
            "end": 0.9
          },
          {
            "char": "广",
            "start": 0.9,
            "end": 1.2
          },
          {
            "char": "阔",
            "start": 1.2,
            "end": 1.5
          },
          {
            "char": "的",
            "start": 1.5,
            "end": 1.7
          },
          {
            "char": "大",
            "start": 1.7,
            "end": 2
          },
          {
            "char": "地",
            "start": 2,
            "end": 2.3
          },
          {
            "char": "上",
            "start": 2.3,
            "end": 2.6
          },
          {
            "char": "奔",
            "start": 2.6,
            "end": 2.9
          },
          {
            "char": "跑",
            "start": 2.9,
            "end": 3.3
          },
          {
            "char": "，",
            "start": 3.3,
            "end": 3.5
          },
          {
            "char": "小",
            "start": 3.5,
            "end": 3.7
          },
          {
            "char": "牛",
            "start": 3.7,
            "end": 4.1,
            "highlight": true
          },
          {
            "char": "和",
            "start": 4.1,
            "end": 4.3
          },
          {
            "char": "小",
            "start": 4.3,
            "end": 4.5
          },
          {
            "char": "羊",
            "start": 4.5,
            "end": 4.9,
            "highlight": true
          },
          {
            "char": "在",
            "start": 4.9,
            "end": 5.1
          },
          {
            "char": "悠",
            "start": 5.1,
            "end": 5.4
          },
          {
            "char": "闲",
            "start": 5.4,
            "end": 5.7
          },
          {
            "char": "地",
            "start": 5.7,
            "end": 5.9
          },
          {
            "char": "吃",
            "start": 5.9,
            "end": 6.2
          },
          {
            "char": "草",
            "start": 6.2,
            "end": 6.6
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "故事里谁在广阔的大地上奔跑？",
        "options": [
          "健壮的小马",
          "树下的小鸟",
          "水里的小鱼",
          "天上的白云"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "id": "book_008",
    "level": 2,
    "title": "小猴子上山去",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 1,
    "theme": "奇幻森林岛",
    "targetChars": [
      "上",
      "下",
      "左",
      "右",
      "中",
      "天",
      "地"
    ],
    "desc": "小猴子爬上大山，向左看看，向右看看，看到了天地之间的美丽景色",
    "pages": [
      {
        "pageNumber": 1,
        "text": "小猴子爬上高山，向上看是蓝天，向下看是大地",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "50%",
            "y": "20%",
            "sound": "Pop",
            "anim": "animate-pulse",
            "text": "蓝蓝的天空！"
          },
          {
            "x": "50%",
            "y": "75%",
            "sound": "Pop",
            "anim": "animate-bounce",
            "text": "绿绿的大地！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "小",
            "start": 0.1,
            "end": 0.3
          },
          {
            "char": "猴",
            "start": 0.3,
            "end": 0.6
          },
          {
            "char": "子",
            "start": 0.6,
            "end": 0.8
          },
          {
            "char": "爬",
            "start": 0.8,
            "end": 1.1
          },
          {
            "char": "上",
            "start": 1.1,
            "end": 1.5,
            "highlight": true
          },
          {
            "char": "高",
            "start": 1.5,
            "end": 1.8
          },
          {
            "char": "山",
            "start": 1.8,
            "end": 2.1
          },
          {
            "char": "，",
            "start": 2.1,
            "end": 2.3
          },
          {
            "char": "向",
            "start": 2.3,
            "end": 2.5
          },
          {
            "char": "上",
            "start": 2.5,
            "end": 2.8,
            "highlight": true
          },
          {
            "char": "看",
            "start": 2.8,
            "end": 3
          },
          {
            "char": "是",
            "start": 3,
            "end": 3.2
          },
          {
            "char": "蓝",
            "start": 3.2,
            "end": 3.5
          },
          {
            "char": "天",
            "start": 3.5,
            "end": 3.9,
            "highlight": true
          },
          {
            "char": "，",
            "start": 3.9,
            "end": 4.1
          },
          {
            "char": "向",
            "start": 4.1,
            "end": 4.3
          },
          {
            "char": "下",
            "start": 4.3,
            "end": 4.7,
            "highlight": true
          },
          {
            "char": "看",
            "start": 4.7,
            "end": 4.9
          },
          {
            "char": "是",
            "start": 4.9,
            "end": 5.1
          },
          {
            "char": "大",
            "start": 5.1,
            "end": 5.4
          },
          {
            "char": "地",
            "start": 5.4,
            "end": 5.9,
            "highlight": true
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "向左是一片大森林，向右是一条清清的小河，中间开满了鲜花",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "20%",
            "y": "45%",
            "sound": "Pop",
            "anim": "animate-pulse",
            "text": "左边的大森林！"
          },
          {
            "x": "80%",
            "y": "45%",
            "sound": "Pop",
            "anim": "animate-pulse",
            "text": "右边的小清河！"
          },
          {
            "x": "50%",
            "y": "60%",
            "sound": "ChestOpen",
            "anim": "animate-bounce",
            "text": "中间的美丽花朵！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "向",
            "start": 0.1,
            "end": 0.3
          },
          {
            "char": "左",
            "start": 0.3,
            "end": 0.7,
            "highlight": true
          },
          {
            "char": "是",
            "start": 0.7,
            "end": 0.9
          },
          {
            "char": "一",
            "start": 0.9,
            "end": 1.1
          },
          {
            "char": "片",
            "start": 1.1,
            "end": 1.3
          },
          {
            "char": "大",
            "start": 1.3,
            "end": 1.6
          },
          {
            "char": "森",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "林",
            "start": 1.9,
            "end": 2.2
          },
          {
            "char": "，",
            "start": 2.2,
            "end": 2.4
          },
          {
            "char": "向",
            "start": 2.4,
            "end": 2.6
          },
          {
            "char": "右",
            "start": 2.6,
            "end": 3,
            "highlight": true
          },
          {
            "char": "是",
            "start": 3,
            "end": 3.2
          },
          {
            "char": "一",
            "start": 3.2,
            "end": 3.4
          },
          {
            "char": "条",
            "start": 3.4,
            "end": 3.7
          },
          {
            "char": "清",
            "start": 3.7,
            "end": 4
          },
          {
            "char": "清",
            "start": 4,
            "end": 4.3
          },
          {
            "char": "的",
            "start": 4.3,
            "end": 4.5
          },
          {
            "char": "小",
            "start": 4.5,
            "end": 4.7
          },
          {
            "char": "河",
            "start": 4.7,
            "end": 5
          },
          {
            "char": "，",
            "start": 5,
            "end": 5.2
          },
          {
            "char": "中",
            "start": 5.2,
            "end": 5.6,
            "highlight": true
          },
          {
            "char": "间",
            "start": 5.6,
            "end": 5.9
          },
          {
            "char": "开",
            "start": 5.9,
            "end": 6.2
          },
          {
            "char": "满",
            "start": 6.2,
            "end": 6.5
          },
          {
            "char": "了",
            "start": 6.5,
            "end": 6.7
          },
          {
            "char": "鲜",
            "start": 6.7,
            "end": 7
          },
          {
            "char": "花",
            "start": 7,
            "end": 7.5
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "小猴子站在山顶，向右看能看到什么？",
        "options": [
          "一条清清的小河",
          "一片大森林",
          "一架小飞机",
          "一座雪山"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "id": "book_009",
    "level": 2,
    "title": "美丽的大花园",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 1,
    "theme": "奇幻森林岛",
    "targetChars": [
      "花",
      "草",
      "木",
      "水",
      "土"
    ],
    "desc": "红红的花，绿绿的草，在雨水和泥土的滋养下茁壮成长",
    "pages": [
      {
        "pageNumber": 1,
        "text": "春天来了，红红的花朵和绿绿的小草从泥土里钻出来",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "35%",
            "y": "60%",
            "sound": "Pop",
            "anim": "animate-bounce",
            "text": "美丽的花朵！"
          },
          {
            "x": "65%",
            "y": "70%",
            "sound": "Pop",
            "anim": "animate-pulse",
            "text": "青翠的小草！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "春",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "天",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "来",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "了",
            "start": 1,
            "end": 1.2
          },
          {
            "char": "，",
            "start": 1.2,
            "end": 1.4
          },
          {
            "char": "红",
            "start": 1.4,
            "end": 1.7
          },
          {
            "char": "红",
            "start": 1.7,
            "end": 2
          },
          {
            "char": "的",
            "start": 2,
            "end": 2.2
          },
          {
            "char": "花",
            "start": 2.2,
            "end": 2.6,
            "highlight": true
          },
          {
            "char": "朵",
            "start": 2.6,
            "end": 2.9
          },
          {
            "char": "和",
            "start": 2.9,
            "end": 3.1
          },
          {
            "char": "绿",
            "start": 3.1,
            "end": 3.4
          },
          {
            "char": "绿",
            "start": 3.4,
            "end": 3.7
          },
          {
            "char": "的",
            "start": 3.7,
            "end": 3.9
          },
          {
            "char": "小",
            "start": 3.9,
            "end": 4.1
          },
          {
            "char": "草",
            "start": 4.1,
            "end": 4.5,
            "highlight": true
          },
          {
            "char": "从",
            "start": 4.5,
            "end": 4.8
          },
          {
            "char": "泥",
            "start": 4.8,
            "end": 5.1
          },
          {
            "char": "土",
            "start": 5.1,
            "end": 5.5,
            "highlight": true
          },
          {
            "char": "里",
            "start": 5.5,
            "end": 5.8
          },
          {
            "char": "钻",
            "start": 5.8,
            "end": 6.1
          },
          {
            "char": "出",
            "start": 6.1,
            "end": 6.4
          },
          {
            "char": "来",
            "start": 6.4,
            "end": 6.8
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "高大的树木喝饱了雨水，伸展出绿油油的树叶",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "50%",
            "y": "35%",
            "sound": "ChestOpen",
            "anim": "animate-bounce",
            "text": "茂密的大树木！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "高",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "大",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "的",
            "start": 0.7,
            "end": 0.9
          },
          {
            "char": "树",
            "start": 0.9,
            "end": 1.2
          },
          {
            "char": "木",
            "start": 1.2,
            "end": 1.6,
            "highlight": true
          },
          {
            "char": "喝",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "饱",
            "start": 1.9,
            "end": 2.2
          },
          {
            "char": "了",
            "start": 2.2,
            "end": 2.4
          },
          {
            "char": "雨",
            "start": 2.4,
            "end": 2.7
          },
          {
            "char": "水",
            "start": 2.7,
            "end": 3.1,
            "highlight": true
          },
          {
            "char": "，",
            "start": 3.1,
            "end": 3.3
          },
          {
            "char": "伸",
            "start": 3.3,
            "end": 3.6
          },
          {
            "char": "展",
            "start": 3.6,
            "end": 3.9
          },
          {
            "char": "出",
            "start": 3.9,
            "end": 4.2
          },
          {
            "char": "绿",
            "start": 4.2,
            "end": 4.5
          },
          {
            "char": "油",
            "start": 4.5,
            "end": 4.8
          },
          {
            "char": "油",
            "start": 4.8,
            "end": 5.1
          },
          {
            "char": "的",
            "start": 5.1,
            "end": 5.3
          },
          {
            "char": "树",
            "start": 5.3,
            "end": 5.6
          },
          {
            "char": "叶",
            "start": 5.6,
            "end": 6.1
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "小花和小草是从哪里钻出来的？",
        "options": [
          "肥沃的泥土里",
          "石头缝隙里",
          "水塘中心",
          "大树顶上"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "id": "book_010",
    "level": 3,
    "title": "我的好朋友",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 1,
    "theme": "奇幻森林岛",
    "targetChars": [
      "朋",
      "友",
      "学",
      "好",
      "子"
    ],
    "desc": "好朋友一起去上学，互相学习，共同成长，度过美好时光",
    "pages": [
      {
        "pageNumber": 1,
        "text": "我和凯茜是最要好的好朋友，我们每天手拉手一起去上学",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "40%",
            "y": "55%",
            "sound": "Pop",
            "anim": "animate-bounce",
            "text": "亲密的好朋友！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "我",
            "start": 0.1,
            "end": 0.3
          },
          {
            "char": "和",
            "start": 0.3,
            "end": 0.5
          },
          {
            "char": "凯",
            "start": 0.5,
            "end": 0.8
          },
          {
            "char": "茜",
            "start": 0.8,
            "end": 1.1
          },
          {
            "char": "是",
            "start": 1.1,
            "end": 1.3
          },
          {
            "char": "最",
            "start": 1.3,
            "end": 1.6
          },
          {
            "char": "要",
            "start": 1.6,
            "end": 1.8
          },
          {
            "char": "好",
            "start": 1.8,
            "end": 2.2,
            "highlight": true
          },
          {
            "char": "的",
            "start": 2.2,
            "end": 2.4
          },
          {
            "char": "好",
            "start": 2.4,
            "end": 2.7
          },
          {
            "char": "朋",
            "start": 2.7,
            "end": 3.1,
            "highlight": true
          },
          {
            "char": "友",
            "start": 3.1,
            "end": 3.5,
            "highlight": true
          },
          {
            "char": "，",
            "start": 3.5,
            "end": 3.7
          },
          {
            "char": "我",
            "start": 3.7,
            "end": 3.9
          },
          {
            "char": "们",
            "start": 3.9,
            "end": 4.1
          },
          {
            "char": "每",
            "start": 4.1,
            "end": 4.3
          },
          {
            "char": "天",
            "start": 4.3,
            "end": 4.6
          },
          {
            "char": "手",
            "start": 4.6,
            "end": 4.8
          },
          {
            "char": "拉",
            "start": 4.8,
            "end": 5
          },
          {
            "char": "手",
            "start": 5,
            "end": 5.2
          },
          {
            "char": "一",
            "start": 5.2,
            "end": 5.4
          },
          {
            "char": "起",
            "start": 5.4,
            "end": 5.6
          },
          {
            "char": "去",
            "start": 5.6,
            "end": 5.8
          },
          {
            "char": "上",
            "start": 5.8,
            "end": 6.1
          },
          {
            "char": "学",
            "start": 6.1,
            "end": 6.6,
            "highlight": true
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "我们在学校里认真学习写汉字，做一个爱读书的好孩子",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "50%",
            "y": "45%",
            "sound": "ChestOpen",
            "anim": "animate-pulse",
            "text": "勤奋学习的好孩子！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "我",
            "start": 0.1,
            "end": 0.3
          },
          {
            "char": "们",
            "start": 0.3,
            "end": 0.5
          },
          {
            "char": "在",
            "start": 0.5,
            "end": 0.7
          },
          {
            "char": "学",
            "start": 0.7,
            "end": 1.1,
            "highlight": true
          },
          {
            "char": "校",
            "start": 1.1,
            "end": 1.4
          },
          {
            "char": "里",
            "start": 1.4,
            "end": 1.6
          },
          {
            "char": "认",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "真",
            "start": 1.9,
            "end": 2.2
          },
          {
            "char": "学",
            "start": 2.2,
            "end": 2.5,
            "highlight": true
          },
          {
            "char": "习",
            "start": 2.5,
            "end": 2.8
          },
          {
            "char": "写",
            "start": 2.8,
            "end": 3.1
          },
          {
            "char": "汉",
            "start": 3.1,
            "end": 3.4
          },
          {
            "char": "字",
            "start": 3.4,
            "end": 3.7
          },
          {
            "char": "，",
            "start": 3.7,
            "end": 3.9
          },
          {
            "char": "做",
            "start": 3.9,
            "end": 4.1
          },
          {
            "char": "一",
            "start": 4.1,
            "end": 4.3
          },
          {
            "char": "个",
            "start": 4.3,
            "end": 4.5
          },
          {
            "char": "爱",
            "start": 4.5,
            "end": 4.8
          },
          {
            "char": "读",
            "start": 4.8,
            "end": 5.1
          },
          {
            "char": "书",
            "start": 5.1,
            "end": 5.4
          },
          {
            "char": "的",
            "start": 5.4,
            "end": 5.6
          },
          {
            "char": "好",
            "start": 5.6,
            "end": 5.9,
            "highlight": true
          },
          {
            "char": "孩",
            "start": 5.9,
            "end": 6.2
          },
          {
            "char": "子",
            "start": 6.2,
            "end": 6.7,
            "highlight": true
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "好朋友们在学校里做什么？",
        "options": [
          "认真学习写汉字",
          "在草地上睡觉",
          "在水塘里抓鱼",
          "看电视玩手机"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "id": "book_011",
    "level": 3,
    "title": "开开心心去上学",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 1,
    "theme": "奇幻森林岛",
    "targetChars": [
      "门",
      "车",
      "手",
      "足",
      "目",
      "耳"
    ],
    "desc": "推开大门，坐上小车，用明亮的双眼观察世界，用耳朵倾听声音",
    "pages": [
      {
        "pageNumber": 1,
        "text": "推开大门，小车开来了，我们挥动小手向家人说再见",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "25%",
            "y": "40%",
            "sound": "Pop",
            "anim": "animate-pulse",
            "text": "推开的大门！"
          },
          {
            "x": "70%",
            "y": "60%",
            "sound": "Pop",
            "anim": "animate-bounce",
            "text": "前进的小汽车！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "推",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "开",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "大",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "门",
            "start": 1,
            "end": 1.4,
            "highlight": true
          },
          {
            "char": "，",
            "start": 1.4,
            "end": 1.6
          },
          {
            "char": "小",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "车",
            "start": 1.9,
            "end": 2.3,
            "highlight": true
          },
          {
            "char": "开",
            "start": 2.3,
            "end": 2.6
          },
          {
            "char": "来",
            "start": 2.6,
            "end": 2.9
          },
          {
            "char": "了",
            "start": 2.9,
            "end": 3.1
          },
          {
            "char": "，",
            "start": 3.1,
            "end": 3.3
          },
          {
            "char": "我",
            "start": 3.3,
            "end": 3.5
          },
          {
            "char": "们",
            "start": 3.5,
            "end": 3.7
          },
          {
            "char": "挥",
            "start": 3.7,
            "end": 4
          },
          {
            "char": "动",
            "start": 4,
            "end": 4.3
          },
          {
            "char": "小",
            "start": 4.3,
            "end": 4.5
          },
          {
            "char": "手",
            "start": 4.5,
            "end": 4.9,
            "highlight": true
          },
          {
            "char": "向",
            "start": 4.9,
            "end": 5.1
          },
          {
            "char": "家",
            "start": 5.1,
            "end": 5.4
          },
          {
            "char": "人",
            "start": 5.4,
            "end": 5.7
          },
          {
            "char": "说",
            "start": 5.7,
            "end": 6
          },
          {
            "char": "再",
            "start": 6,
            "end": 6.3
          },
          {
            "char": "见",
            "start": 6.3,
            "end": 6.7
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "用明亮的双目看世界，用灵敏的双耳听鸟鸣，脚步轻快真高兴",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "35%",
            "y": "30%",
            "sound": "Pop",
            "anim": "animate-pulse",
            "text": "明亮的双目！"
          },
          {
            "x": "65%",
            "y": "30%",
            "sound": "ChestOpen",
            "anim": "animate-bounce",
            "text": "灵敏的耳朵！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "用",
            "start": 0.1,
            "end": 0.3
          },
          {
            "char": "明",
            "start": 0.3,
            "end": 0.6
          },
          {
            "char": "亮",
            "start": 0.6,
            "end": 0.9
          },
          {
            "char": "的",
            "start": 0.9,
            "end": 1.1
          },
          {
            "char": "双",
            "start": 1.1,
            "end": 1.4
          },
          {
            "char": "目",
            "start": 1.4,
            "end": 1.8,
            "highlight": true
          },
          {
            "char": "看",
            "start": 1.8,
            "end": 2.1
          },
          {
            "char": "世",
            "start": 2.1,
            "end": 2.4
          },
          {
            "char": "界",
            "start": 2.4,
            "end": 2.7
          },
          {
            "char": "，",
            "start": 2.7,
            "end": 2.9
          },
          {
            "char": "用",
            "start": 2.9,
            "end": 3.1
          },
          {
            "char": "灵",
            "start": 3.1,
            "end": 3.4
          },
          {
            "char": "敏",
            "start": 3.4,
            "end": 3.7
          },
          {
            "char": "的",
            "start": 3.7,
            "end": 3.9
          },
          {
            "char": "双",
            "start": 3.9,
            "end": 4.1
          },
          {
            "char": "耳",
            "start": 4.1,
            "end": 4.5,
            "highlight": true
          },
          {
            "char": "听",
            "start": 4.5,
            "end": 4.8
          },
          {
            "char": "鸟",
            "start": 4.8,
            "end": 5.1
          },
          {
            "char": "鸣",
            "start": 5.1,
            "end": 5.4
          },
          {
            "char": "，",
            "start": 5.4,
            "end": 5.6
          },
          {
            "char": "脚",
            "start": 5.6,
            "end": 5.9
          },
          {
            "char": "步",
            "start": 5.9,
            "end": 6.2
          },
          {
            "char": "轻",
            "start": 6.2,
            "end": 6.5
          },
          {
            "char": "快",
            "start": 6.5,
            "end": 6.8
          },
          {
            "char": "真",
            "start": 6.8,
            "end": 7.1
          },
          {
            "char": "高",
            "start": 7.1,
            "end": 7.4
          },
          {
            "char": "兴",
            "start": 7.4,
            "end": 7.8
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "我们用什么来倾听欢快的鸟鸣声？",
        "options": [
          "灵敏的双耳",
          "明亮的双目",
          "双手",
          "双足"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "id": "book_012",
    "level": 3,
    "title": "我们都是好孩子",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 1,
    "theme": "奇幻森林岛",
    "targetChars": [
      "父",
      "母",
      "心",
      "头",
      "来",
      "去"
    ],
    "desc": "孝敬父母，用心读书，昂首挺胸走向美好的未来！",
    "pages": [
      {
        "pageNumber": 1,
        "text": "父母用心抚育我们长大，我们要用心孝敬爸爸和妈妈",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "50%",
            "y": "50%",
            "sound": "ChestOpen",
            "anim": "animate-pulse",
            "text": "温暖的父母之爱！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "父",
            "start": 0.1,
            "end": 0.5,
            "highlight": true
          },
          {
            "char": "母",
            "start": 0.5,
            "end": 0.9,
            "highlight": true
          },
          {
            "char": "用",
            "start": 0.9,
            "end": 1.2
          },
          {
            "char": "心",
            "start": 1.2,
            "end": 1.6,
            "highlight": true
          },
          {
            "char": "抚",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "育",
            "start": 1.9,
            "end": 2.2
          },
          {
            "char": "我",
            "start": 2.2,
            "end": 2.4
          },
          {
            "char": "们",
            "start": 2.4,
            "end": 2.6
          },
          {
            "char": "长",
            "start": 2.6,
            "end": 2.9
          },
          {
            "char": "大",
            "start": 2.9,
            "end": 3.3
          },
          {
            "char": "，",
            "start": 3.3,
            "end": 3.5
          },
          {
            "char": "我",
            "start": 3.5,
            "end": 3.7
          },
          {
            "char": "们",
            "start": 3.7,
            "end": 3.9
          },
          {
            "char": "要",
            "start": 3.9,
            "end": 4.1
          },
          {
            "char": "用",
            "start": 4.1,
            "end": 4.4
          },
          {
            "char": "心",
            "start": 4.4,
            "end": 4.8,
            "highlight": true
          },
          {
            "char": "孝",
            "start": 4.8,
            "end": 5.1
          },
          {
            "char": "敬",
            "start": 5.1,
            "end": 5.4
          },
          {
            "char": "爸",
            "start": 5.4,
            "end": 5.7
          },
          {
            "char": "爸",
            "start": 5.7,
            "end": 6
          },
          {
            "char": "和",
            "start": 6,
            "end": 6.2
          },
          {
            "char": "妈",
            "start": 6.2,
            "end": 6.5
          },
          {
            "char": "妈",
            "start": 6.5,
            "end": 7
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "昂起头来大步走，开开心心去迎接美好的新一天",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "50%",
            "y": "40%",
            "sound": "Pop",
            "anim": "animate-bounce",
            "text": "昂起头走向未来！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "昂",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "起",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "头",
            "start": 0.7,
            "end": 1.1,
            "highlight": true
          },
          {
            "char": "来",
            "start": 1.1,
            "end": 1.5,
            "highlight": true
          },
          {
            "char": "大",
            "start": 1.5,
            "end": 1.8
          },
          {
            "char": "步",
            "start": 1.8,
            "end": 2.1
          },
          {
            "char": "走",
            "start": 2.1,
            "end": 2.4
          },
          {
            "char": "，",
            "start": 2.4,
            "end": 2.6
          },
          {
            "char": "开",
            "start": 2.6,
            "end": 2.9
          },
          {
            "char": "开",
            "start": 2.9,
            "end": 3.2
          },
          {
            "char": "心",
            "start": 3.2,
            "end": 3.5
          },
          {
            "char": "心",
            "start": 3.5,
            "end": 3.7
          },
          {
            "char": "去",
            "start": 3.7,
            "end": 4.1,
            "highlight": true
          },
          {
            "char": "迎",
            "start": 4.1,
            "end": 4.4
          },
          {
            "char": "接",
            "start": 4.4,
            "end": 4.7
          },
          {
            "char": "美",
            "start": 4.7,
            "end": 5
          },
          {
            "char": "好",
            "start": 5,
            "end": 5.3
          },
          {
            "char": "的",
            "start": 5.3,
            "end": 5.5
          },
          {
            "char": "新",
            "start": 5.5,
            "end": 5.8
          },
          {
            "char": "一",
            "start": 5.8,
            "end": 6.1
          },
          {
            "char": "天",
            "start": 6.1,
            "end": 6.6
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "我们应该怎样对待辛苦抚育我们的父母？",
        "options": [
          "用心孝敬关爱爸爸妈妈",
          "不听父母的话",
          "躲在房间不出来",
          "自己跑出去玩耍"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "id": "book_013",
    "level": 2,
    "title": "小猴采果子",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 1,
    "theme": "奇幻森林岛",
    "targetChars": [
      "木",
      "林",
      "果",
      "山",
      "上"
    ],
    "desc": "聪明可爱的小猴子走进郁郁葱葱的大森林，在大树上采摘甜甜的红苹果",
    "pages": [
      {
        "pageNumber": 1,
        "text": "青翠的大山里，有一片茂密的大树林",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "60%",
            "y": "35%",
            "sound": "Pop",
            "text": "郁郁葱葱的大森林！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "青",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "翠",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "的",
            "start": 0.7,
            "end": 0.9
          },
          {
            "char": "大",
            "start": 0.9,
            "end": 1.2
          },
          {
            "char": "山",
            "start": 1.2,
            "end": 1.6,
            "highlight": true
          },
          {
            "char": "里",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "，",
            "start": 1.9,
            "end": 2.1
          },
          {
            "char": "有",
            "start": 2.1,
            "end": 2.4
          },
          {
            "char": "一",
            "start": 2.4,
            "end": 2.7
          },
          {
            "char": "片",
            "start": 2.7,
            "end": 3
          },
          {
            "char": "茂",
            "start": 3,
            "end": 3.3
          },
          {
            "char": "密",
            "start": 3.3,
            "end": 3.6
          },
          {
            "char": "的",
            "start": 3.6,
            "end": 3.8
          },
          {
            "char": "大",
            "start": 3.8,
            "end": 4.1
          },
          {
            "char": "树",
            "start": 4.1,
            "end": 4.5,
            "highlight": true
          },
          {
            "char": "林",
            "start": 4.5,
            "end": 5,
            "highlight": true
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "高高的苹果树上，结满了红红的大苹果",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "45%",
            "y": "40%",
            "sound": "Pop",
            "text": "好甜的大苹果！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "高",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "高",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "的",
            "start": 0.7,
            "end": 0.9
          },
          {
            "char": "苹",
            "start": 0.9,
            "end": 1.2
          },
          {
            "char": "果",
            "start": 1.2,
            "end": 1.6,
            "highlight": true
          },
          {
            "char": "树",
            "start": 1.6,
            "end": 1.9,
            "highlight": true
          },
          {
            "char": "上",
            "start": 1.9,
            "end": 2.3,
            "highlight": true
          },
          {
            "char": "，",
            "start": 2.3,
            "end": 2.5
          },
          {
            "char": "结",
            "start": 2.5,
            "end": 2.8
          },
          {
            "char": "满",
            "start": 2.8,
            "end": 3.1
          },
          {
            "char": "了",
            "start": 3.1,
            "end": 3.3
          },
          {
            "char": "红",
            "start": 3.3,
            "end": 3.6
          },
          {
            "char": "红",
            "start": 3.6,
            "end": 3.9
          },
          {
            "char": "的",
            "start": 3.9,
            "end": 4.1
          },
          {
            "char": "大",
            "start": 4.1,
            "end": 4.4
          },
          {
            "char": "苹",
            "start": 4.4,
            "end": 4.7
          },
          {
            "char": "果",
            "start": 4.7,
            "end": 5.2,
            "highlight": true
          }
        ]
      },
      {
        "pageNumber": 3,
        "text": "小猴爬上高树枝，把香甜的果子带回家",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "55%",
            "y": "60%",
            "sound": "Success",
            "text": "小猴开心地抱满怀！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "小",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "猴",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "爬",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "上",
            "start": 1,
            "end": 1.4,
            "highlight": true
          },
          {
            "char": "高",
            "start": 1.4,
            "end": 1.7
          },
          {
            "char": "树",
            "start": 1.7,
            "end": 2,
            "highlight": true
          },
          {
            "char": "枝",
            "start": 2,
            "end": 2.3
          },
          {
            "char": "，",
            "start": 2.3,
            "end": 2.5
          },
          {
            "char": "把",
            "start": 2.5,
            "end": 2.8
          },
          {
            "char": "香",
            "start": 2.8,
            "end": 3.1
          },
          {
            "char": "甜",
            "start": 3.1,
            "end": 3.4
          },
          {
            "char": "的",
            "start": 3.4,
            "end": 3.6
          },
          {
            "char": "果",
            "start": 3.6,
            "end": 4,
            "highlight": true
          },
          {
            "char": "子",
            "start": 4,
            "end": 4.3
          },
          {
            "char": "带",
            "start": 4.3,
            "end": 4.6
          },
          {
            "char": "回",
            "start": 4.6,
            "end": 4.9
          },
          {
            "char": "家",
            "start": 4.9,
            "end": 5.4
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "小猴在茂密的树林里采摘了什么美味的果子？",
        "options": [
          "香甜的大苹果",
          "酸酸的柠檬",
          "金黄的大南瓜",
          "圆滚滚的大西瓜"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "id": "book_014",
    "level": 2,
    "title": "四季的歌",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 1,
    "theme": "奇幻森林岛",
    "targetChars": [
      "春",
      "夏",
      "秋",
      "冬",
      "天"
    ],
    "desc": "一年有四个神奇美丽的季节，大自然在每个季节都换上美丽的新衣裳",
    "pages": [
      {
        "pageNumber": 1,
        "text": "春天花儿开，夏天绿树浓",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "30%",
            "y": "30%",
            "sound": "Pop",
            "text": "春暖花开！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "春",
            "start": 0.1,
            "end": 0.5,
            "highlight": true
          },
          {
            "char": "天",
            "start": 0.5,
            "end": 0.8,
            "highlight": true
          },
          {
            "char": "花",
            "start": 0.8,
            "end": 1.1
          },
          {
            "char": "儿",
            "start": 1.1,
            "end": 1.3
          },
          {
            "char": "开",
            "start": 1.3,
            "end": 1.7
          },
          {
            "char": "，",
            "start": 1.7,
            "end": 1.9
          },
          {
            "char": "夏",
            "start": 1.9,
            "end": 2.3,
            "highlight": true
          },
          {
            "char": "天",
            "start": 2.3,
            "end": 2.6,
            "highlight": true
          },
          {
            "char": "绿",
            "start": 2.6,
            "end": 2.9
          },
          {
            "char": "树",
            "start": 2.9,
            "end": 3.2
          },
          {
            "char": "浓",
            "start": 3.2,
            "end": 3.7
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "秋天黄叶落，冬天白雪飘",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "70%",
            "y": "40%",
            "sound": "Pop",
            "text": "冬天下雪啦！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "秋",
            "start": 0.1,
            "end": 0.5,
            "highlight": true
          },
          {
            "char": "天",
            "start": 0.5,
            "end": 0.8,
            "highlight": true
          },
          {
            "char": "黄",
            "start": 0.8,
            "end": 1.1
          },
          {
            "char": "叶",
            "start": 1.1,
            "end": 1.4
          },
          {
            "char": "落",
            "start": 1.4,
            "end": 1.8
          },
          {
            "char": "，",
            "start": 1.8,
            "end": 2
          },
          {
            "char": "冬",
            "start": 2,
            "end": 2.4,
            "highlight": true
          },
          {
            "char": "天",
            "start": 2.4,
            "end": 2.7,
            "highlight": true
          },
          {
            "char": "白",
            "start": 2.7,
            "end": 3
          },
          {
            "char": "雪",
            "start": 3,
            "end": 3.3
          },
          {
            "char": "飘",
            "start": 3.3,
            "end": 3.8
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "白雪飘飘、可以堆雪人的是哪一个季节？",
        "options": [
          "寒冷的冬天",
          "炎热的夏天",
          "温暖的春天",
          "金黄的秋天"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "id": "book_015",
    "level": 2,
    "title": "色彩魔法师",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 1,
    "theme": "奇幻森林岛",
    "targetChars": [
      "红",
      "绿",
      "蓝",
      "黄",
      "白"
    ],
    "desc": "小画家拿起神奇的魔法画笔，把世界涂抹上绚丽五彩的颜色",
    "pages": [
      {
        "pageNumber": 1,
        "text": "画一朵红红的花，画一片绿绿的草",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "35%",
            "y": "50%",
            "sound": "Pop",
            "text": "红花绿草好漂亮！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "画",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "一",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "朵",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "红",
            "start": 1,
            "end": 1.4,
            "highlight": true
          },
          {
            "char": "红",
            "start": 1.4,
            "end": 1.7,
            "highlight": true
          },
          {
            "char": "的",
            "start": 1.7,
            "end": 1.9
          },
          {
            "char": "花",
            "start": 1.9,
            "end": 2.3
          },
          {
            "char": "，",
            "start": 2.3,
            "end": 2.5
          },
          {
            "char": "画",
            "start": 2.5,
            "end": 2.8
          },
          {
            "char": "一",
            "start": 2.8,
            "end": 3.1
          },
          {
            "char": "片",
            "start": 3.1,
            "end": 3.4
          },
          {
            "char": "绿",
            "start": 3.4,
            "end": 3.8,
            "highlight": true
          },
          {
            "char": "绿",
            "start": 3.8,
            "end": 4.1,
            "highlight": true
          },
          {
            "char": "的",
            "start": 4.1,
            "end": 4.3
          },
          {
            "char": "草",
            "start": 4.3,
            "end": 4.8
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "蓝蓝的天空上，飘着雪白的小云朵",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "65%",
            "y": "30%",
            "sound": "Pop",
            "text": "蓝天白云！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "蓝",
            "start": 0.1,
            "end": 0.5,
            "highlight": true
          },
          {
            "char": "蓝",
            "start": 0.5,
            "end": 0.8,
            "highlight": true
          },
          {
            "char": "的",
            "start": 0.8,
            "end": 1
          },
          {
            "char": "天",
            "start": 1,
            "end": 1.3
          },
          {
            "char": "空",
            "start": 1.3,
            "end": 1.6
          },
          {
            "char": "上",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "，",
            "start": 1.9,
            "end": 2.1
          },
          {
            "char": "飘",
            "start": 2.1,
            "end": 2.4
          },
          {
            "char": "着",
            "start": 2.4,
            "end": 2.6
          },
          {
            "char": "雪",
            "start": 2.6,
            "end": 2.9
          },
          {
            "char": "白",
            "start": 2.9,
            "end": 3.3,
            "highlight": true
          },
          {
            "char": "的",
            "start": 3.3,
            "end": 3.5
          },
          {
            "char": "小",
            "start": 3.5,
            "end": 3.8
          },
          {
            "char": "云",
            "start": 3.8,
            "end": 4.1
          },
          {
            "char": "朵",
            "start": 4.1,
            "end": 4.6
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "小画家给晴朗辽阔的天空涂上了什么颜色？",
        "options": [
          "深邃美丽的蓝色",
          "乌漆墨黑的黑色",
          "鲜艳如火的红色",
          "金灿灿的黄色"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "id": "book_016",
    "level": 3,
    "title": "快乐的小镇",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 2,
    "theme": "缤纷生活岛",
    "targetChars": [
      "开",
      "关",
      "车",
      "门",
      "路"
    ],
    "desc": "小镇里车辆来来往往，小朋友们讲礼貌、守规则，生活充满欢声笑语",
    "pages": [
      {
        "pageNumber": 1,
        "text": "早晨太阳升起，小镇打开了快乐的大门",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "50%",
            "y": "40%",
            "sound": "Pop",
            "text": "早安美丽的小镇！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "早",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "晨",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "太",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "阳",
            "start": 1,
            "end": 1.3
          },
          {
            "char": "升",
            "start": 1.3,
            "end": 1.6
          },
          {
            "char": "起",
            "start": 1.6,
            "end": 1.9
          },
          {
            "char": "，",
            "start": 1.9,
            "end": 2.1
          },
          {
            "char": "小",
            "start": 2.1,
            "end": 2.4
          },
          {
            "char": "镇",
            "start": 2.4,
            "end": 2.7
          },
          {
            "char": "打",
            "start": 2.7,
            "end": 3
          },
          {
            "char": "开",
            "start": 3,
            "end": 3.4,
            "highlight": true
          },
          {
            "char": "了",
            "start": 3.4,
            "end": 3.6
          },
          {
            "char": "快",
            "start": 3.6,
            "end": 3.9
          },
          {
            "char": "乐",
            "start": 3.9,
            "end": 4.2
          },
          {
            "char": "的",
            "start": 4.2,
            "end": 4.4
          },
          {
            "char": "大",
            "start": 4.4,
            "end": 4.7
          },
          {
            "char": "门",
            "start": 4.7,
            "end": 5.2,
            "highlight": true
          }
        ]
      },
      {
        "pageNumber": 2,
        "text": "汽车开过马路，小朋友们高高兴兴上学校",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "30%",
            "y": "60%",
            "sound": "Pop",
            "text": "遵守交通规则！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "汽",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "车",
            "start": 0.4,
            "end": 0.8,
            "highlight": true
          },
          {
            "char": "开",
            "start": 0.8,
            "end": 1.2,
            "highlight": true
          },
          {
            "char": "过",
            "start": 1.2,
            "end": 1.5
          },
          {
            "char": "马",
            "start": 1.5,
            "end": 1.8
          },
          {
            "char": "路",
            "start": 1.8,
            "end": 2.2,
            "highlight": true
          },
          {
            "char": "，",
            "start": 2.2,
            "end": 2.4
          },
          {
            "char": "小",
            "start": 2.4,
            "end": 2.7
          },
          {
            "char": "朋",
            "start": 2.7,
            "end": 3
          },
          {
            "char": "友",
            "start": 3,
            "end": 3.3
          },
          {
            "char": "们",
            "start": 3.3,
            "end": 3.5
          },
          {
            "char": "高",
            "start": 3.5,
            "end": 3.8
          },
          {
            "char": "高",
            "start": 3.8,
            "end": 4.1
          },
          {
            "char": "兴",
            "start": 4.1,
            "end": 4.4
          },
          {
            "char": "兴",
            "start": 4.4,
            "end": 4.7
          },
          {
            "char": "上",
            "start": 4.7,
            "end": 5
          },
          {
            "char": "学",
            "start": 5,
            "end": 5.3
          },
          {
            "char": "校",
            "start": 5.3,
            "end": 5.8
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "小朋友们过马路时应当注意什么？",
        "options": [
          "走斑马线，注意安全遵守交通规则",
          "在路上追逐打闹",
          "不看红绿灯直接跑",
          "边走边看漫画书"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "id": "book_017",
    "level": 3,
    "title": "爱劳动的小蜜蜂",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 2,
    "theme": "缤纷生活岛",
    "targetChars": [
      "飞",
      "走",
      "花",
      "草",
      "多"
    ],
    "desc": "小蜜蜂勤劳善良，在百花丛中飞来飞去，和小伙伴们采摘甘甜的花蜜",
    "pages": [
      {
        "pageNumber": 1,
        "text": "小蜜蜂展翅飞，飞到花丛中采蜜忙",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "40%",
            "y": "30%",
            "sound": "Pop",
            "text": "嗡嗡嗡采花蜜！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "小",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "蜜",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "蜂",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "展",
            "start": 1,
            "end": 1.3
          },
          {
            "char": "翅",
            "start": 1.3,
            "end": 1.6
          },
          {
            "char": "飞",
            "start": 1.6,
            "end": 2,
            "highlight": true
          },
          {
            "char": "，",
            "start": 2,
            "end": 2.2
          },
          {
            "char": "飞",
            "start": 2.2,
            "end": 2.6,
            "highlight": true
          },
          {
            "char": "到",
            "start": 2.6,
            "end": 2.9
          },
          {
            "char": "花",
            "start": 2.9,
            "end": 3.3,
            "highlight": true
          },
          {
            "char": "丛",
            "start": 3.3,
            "end": 3.6
          },
          {
            "char": "中",
            "start": 3.6,
            "end": 3.9
          },
          {
            "char": "采",
            "start": 3.9,
            "end": 4.2
          },
          {
            "char": "蜜",
            "start": 4.2,
            "end": 4.5
          },
          {
            "char": "忙",
            "start": 4.5,
            "end": 5
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "小蜜蜂在花丛里忙碌地做什么呢？",
        "options": [
          "勤劳地采集甘甜的花蜜",
          "躲在花朵里睡大觉",
          "和小蚂蚁捉迷藏",
          "在水里游泳"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "id": "book_018",
    "level": 3,
    "title": "小小宇航员",
    "coverImg": "assets/images/cathy_storybook_cover.webp",
    "stage": 3,
    "theme": "星际智慧岛",
    "targetChars": [
      "月",
      "星",
      "天",
      "亮",
      "看"
    ],
    "desc": "乘坐神奇的火箭飞向浩瀚的宇宙，看神秘的月球与闪闪发光的小星星",
    "pages": [
      {
        "pageNumber": 1,
        "text": "火箭飞上天空，看见弯弯的月亮和明亮的星星",
        "image": "assets/images/cathy_storybook_cover.webp",
        "interactions": [
          {
            "x": "60%",
            "y": "25%",
            "sound": "Success",
            "text": "漫步璀璨银河！"
          }
        ],
        "audioTimeTokens": [
          {
            "char": "火",
            "start": 0.1,
            "end": 0.4
          },
          {
            "char": "箭",
            "start": 0.4,
            "end": 0.7
          },
          {
            "char": "飞",
            "start": 0.7,
            "end": 1
          },
          {
            "char": "上",
            "start": 1,
            "end": 1.3
          },
          {
            "char": "天",
            "start": 1.3,
            "end": 1.7,
            "highlight": true
          },
          {
            "char": "空",
            "start": 1.7,
            "end": 2
          },
          {
            "char": "，",
            "start": 2,
            "end": 2.2
          },
          {
            "char": "看",
            "start": 2.2,
            "end": 2.6,
            "highlight": true
          },
          {
            "char": "见",
            "start": 2.6,
            "end": 2.9
          },
          {
            "char": "弯",
            "start": 2.9,
            "end": 3.2
          },
          {
            "char": "弯",
            "start": 3.2,
            "end": 3.5
          },
          {
            "char": "的",
            "start": 3.5,
            "end": 3.7
          },
          {
            "char": "月",
            "start": 3.7,
            "end": 4.1,
            "highlight": true
          },
          {
            "char": "亮",
            "start": 4.1,
            "end": 4.5,
            "highlight": true
          },
          {
            "char": "和",
            "start": 4.5,
            "end": 4.7
          },
          {
            "char": "明",
            "start": 4.7,
            "end": 5
          },
          {
            "char": "亮",
            "start": 5,
            "end": 5.3,
            "highlight": true
          },
          {
            "char": "的",
            "start": 5.3,
            "end": 5.5
          },
          {
            "char": "星",
            "start": 5.5,
            "end": 5.9,
            "highlight": true
          },
          {
            "char": "星",
            "start": 5.9,
            "end": 6.4,
            "highlight": true
          }
        ]
      }
    ],
    "quiz": [
      {
        "question": "小小宇航员坐上飞船，在深邃太空中看到了什么？",
        "options": [
          "美丽的月亮和闪闪发光的星星",
          "游来游去的小金鱼",
          "绿色的大森林",
          "奔跑的小白兔"
        ],
        "correctIndex": 0
      }
    ]
  }
];
