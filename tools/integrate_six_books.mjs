import fs from "fs";
import path from "path";

const booksFilePath = path.resolve("src/data/books.js");
let content = fs.readFileSync(booksFilePath, "utf-8");

function makeTokens(text, targetChars) {
  let time = 0.1;
  const tokens = [];
  for (const ch of text) {
    const isTarget = targetChars.includes(ch);
    const duration = ch === "，" || ch === "。" ? 0.2 : 0.35;
    const tok = {
      char: ch,
      start: parseFloat(time.toFixed(2)),
      end: parseFloat((time + duration).toFixed(2))
    };
    if (isTarget) tok.highlight = true;
    tokens.push(tok);
    time += duration;
  }
  return tokens;
}

const NEW_BOOKS = [
  {
    id: "book_theme_zodiac",
    level: 1,
    title: "十二生肖歌",
    coverImg: "assets/images/cover_zodiac.webp",
    stage: 1,
    theme: "中华传统文化",
    targetChars: ["鼠", "牛", "虎", "兔", "龙"],
    desc: "生肖歌谣朗朗上口，十二小动物排排坐，快乐学习传统生肖文化",
    pages: [
      {
        pageNumber: 1,
        text: "小老鼠打头阵，大水牛力气大",
        image: "assets/images/story_zodiac_p1.webp",
        interactions: [
          { x: "32%", y: "42%", sound: "Pop", anim: "animate-bounce", text: "机灵聪明的小老鼠！" },
          { x: "68%", y: "52%", sound: "Pop", anim: "animate-pulse", text: "勤劳能干的大水牛！" }
        ],
        audioTimeTokens: makeTokens("小老鼠打头阵，大水牛力气大", ["鼠", "牛"])
      },
      {
        pageNumber: 2,
        text: "威武的大老虎下高山，温顺的小白兔蹦蹦跳",
        image: "assets/images/story_zodiac_p2.webp",
        interactions: [
          { x: "35%", y: "45%", sound: "CrownFanfare", anim: "animate-bounce", text: "百兽之王大老虎！" },
          { x: "72%", y: "58%", sound: "Pop", anim: "animate-pulse", text: "毛茸茸的小白兔！" }
        ],
        audioTimeTokens: makeTokens("威武的大老虎下高山，温顺的小白兔蹦蹦跳", ["虎", "兔"])
      },
      {
        pageNumber: 3,
        text: "金龙飞在云海间，十二生肖福运满",
        image: "assets/images/story_zodiac_p3.webp",
        interactions: [
          { x: "50%", y: "40%", sound: "StarPopCombo", anim: "animate-spin-slow", text: "腾云驾雾中国吉祥金龙！" }
        ],
        audioTimeTokens: makeTokens("金龙飞在云海间，十二生肖福运满", ["龙", "福"])
      }
    ],
    quiz: [
      {
        question: "十二生肖歌里，排在最前面打头阵的是哪个小动物？",
        options: ["机灵的小老鼠", "威风的大老虎", "可爱的小白兔", "勇敢的小金龙"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "book_theme_spring_festival",
    level: 1,
    title: "过大年贴春联",
    coverImg: "assets/images/cover_spring_festival.webp",
    stage: 1,
    theme: "中华传统节日",
    targetChars: ["年", "春", "红", "福", "乐"],
    desc: "爆竹声声辞旧岁，红红火火贴春联，小鹿凯茜一家欢欢喜喜过大年",
    pages: [
      {
        pageNumber: 1,
        text: "大年三十挂红灯，门前贴上红春联",
        image: "assets/images/story_spring_festival_p1.webp",
        interactions: [
          { x: "30%", y: "30%", sound: "Pop", anim: "animate-bounce", text: "大红灯笼高高挂！" },
          { x: "70%", y: "45%", sound: "Pop", anim: "animate-pulse", text: "吉祥如意红春联！" }
        ],
        audioTimeTokens: makeTokens("大年三十挂红灯，门前贴上红春联", ["年", "红", "春"])
      },
      {
        pageNumber: 2,
        text: "一家人吃团圆饭，香香甜甜年味足",
        image: "assets/images/story_spring_festival_p2.webp",
        interactions: [
          { x: "50%", y: "60%", sound: "ChestOpen", anim: "animate-bounce", text: "年夜饭团团圆圆！" }
        ],
        audioTimeTokens: makeTokens("一家人吃团圆饭，香香甜甜年味足", ["年", "乐"])
      },
      {
        pageNumber: 3,
        text: "爆竹声声辞旧岁，迎春接福万家欢",
        image: "assets/images/story_spring_festival_p3.webp",
        interactions: [
          { x: "50%", y: "35%", sound: "StarPopCombo", anim: "animate-spin-slow", text: "新春大吉，万家欢乐！" }
        ],
        audioTimeTokens: makeTokens("爆竹声声辞旧岁，迎春接福万家欢", ["春", "福"])
      }
    ],
    quiz: [
      {
        question: "过大年的时候，大门两旁要贴上什么吉庆的饰物？",
        options: ["喜庆红火的春联", "黑板白字", "彩色气球", "数字卡片"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "book_theme_chongyang",
    level: 2,
    title: "重阳登高赏秋菊",
    coverImg: "assets/images/cover_chongyang.webp",
    stage: 2,
    theme: "中华传统节日",
    targetChars: ["高", "秋", "菊", "敬", "老"],
    desc: "九九重阳敬老日，秋高气爽登高处，遍插茱萸赏金菊",
    pages: [
      {
        pageNumber: 1,
        text: "九九重阳秋光好，金丝皇菊满山坡",
        image: "assets/images/story_chongyang_p1.webp",
        interactions: [
          { x: "65%", y: "55%", sound: "Pop", anim: "animate-bounce", text: "金灿灿的美丽秋菊！" }
        ],
        audioTimeTokens: makeTokens("九九重阳秋光好，金丝皇菊满山坡", ["秋", "菊"])
      },
      {
        pageNumber: 2,
        text: "携手长辈登高楼，极目远眺天地宽",
        image: "assets/images/story_chongyang_p2.webp",
        interactions: [
          { x: "50%", y: "45%", sound: "CrownFanfare", anim: "animate-pulse", text: "古塔高耸入云霄！" }
        ],
        audioTimeTokens: makeTokens("携手长辈登高楼，极目远眺天地宽", ["高", "老"])
      },
      {
        pageNumber: 3,
        text: "品糕饮茶敬长辈，尊老爱幼暖心窝",
        image: "assets/images/story_chongyang_p3.webp",
        interactions: [
          { x: "55%", y: "55%", sound: "StarPopCombo", anim: "animate-bounce", text: "香甜软糯的重阳糕！" }
        ],
        audioTimeTokens: makeTokens("品糕饮茶敬长辈，尊老爱幼暖心窝", ["敬", "老"])
      }
    ],
    quiz: [
      {
        question: "重阳节人们通常会举行什么传统习俗？",
        options: ["登高望远与赏菊", "下河摸鱼", "堆雪人", "去海边游泳"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "book_theme_qingming",
    level: 2,
    title: "清明踏青放纸鸢",
    coverImg: "assets/images/cover_qingming_kite.webp",
    stage: 2,
    theme: "中华传统节日",
    targetChars: ["风", "青", "飞", "草", "春"],
    desc: "清明时节春风拂面，杨柳依依青草绿，奔跑草地放飞传统沙燕纸鸢",
    pages: [
      {
        pageNumber: 1,
        text: "春风吹绿柳树梢，万物复苏草儿青",
        image: "assets/images/story_qingming_kite_p1.webp",
        interactions: [
          { x: "40%", y: "40%", sound: "Pop", anim: "animate-pulse", text: "杨柳依依春风吹！" }
        ],
        audioTimeTokens: makeTokens("春风吹绿柳树梢，万物复苏草儿青", ["春", "风", "青", "草"])
      },
      {
        pageNumber: 2,
        text: "手拿传统沙燕鸢，迎着春风快步跑",
        image: "assets/images/story_qingming_kite_p2.webp",
        interactions: [
          { x: "45%", y: "50%", sound: "Pop", anim: "animate-bounce", text: "传统非遗沙燕纸鸢！" }
        ],
        audioTimeTokens: makeTokens("手拿传统沙燕鸢，迎着春风快步跑", ["风", "飞"])
      },
      {
        pageNumber: 3,
        text: "纸鸢飞上蓝云霄，欢歌笑语绕山冈",
        image: "assets/images/story_qingming_kite_p3.webp",
        interactions: [
          { x: "60%", y: "30%", sound: "StarPopCombo", anim: "animate-spin-slow", text: "风筝越飞越高！" }
        ],
        audioTimeTokens: makeTokens("纸鸢飞上蓝云霄，欢歌笑语绕山冈", ["飞", "青"])
      }
    ],
    quiz: [
      {
        question: "春天清明踏青时，小朋友们手里拿着什么迎风奔跑？",
        options: ["美丽的沙燕纸鸢(风筝)", "沉重的大铁锤", "游泳圈", "小雨伞"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "book_theme_dongzhi",
    level: 2,
    title: "冬至到吃水饺",
    coverImg: "assets/images/cover_dongzhi.webp",
    stage: 2,
    theme: "中华传统节日",
    targetChars: ["冬", "包", "热", "吃", "暖"],
    desc: "冬至节气白昼短，一家围坐热气腾腾包饺子，暖胃暖心不冻耳",
    pages: [
      {
        pageNumber: 1,
        text: "冬至白昼最短暂，窗外飘着小雪花",
        image: "assets/images/story_dongzhi_p1.webp",
        interactions: [
          { x: "50%", y: "30%", sound: "Pop", anim: "animate-pulse", text: "屋外雪花静悄悄飘落！" }
        ],
        audioTimeTokens: makeTokens("冬至白昼最短暂，窗外飘着小雪花", ["冬"])
      },
      {
        pageNumber: 2,
        text: "擀面皮来包肉馅，小巧水饺像元宝",
        image: "assets/images/story_dongzhi_p2.webp",
        interactions: [
          { x: "50%", y: "55%", sound: "ChestOpen", anim: "animate-bounce", text: "像金元宝一样的大水饺！" }
        ],
        audioTimeTokens: makeTokens("擀面皮来包肉馅，小巧水饺像元宝", ["包"])
      },
      {
        pageNumber: 3,
        text: "热腾水饺端上桌，吃进肚里暖洋洋",
        image: "assets/images/story_dongzhi_p3.webp",
        interactions: [
          { x: "50%", y: "60%", sound: "StarPopCombo", anim: "animate-bounce", text: "吃了饺子暖洋洋，不冻耳朵！" }
        ],
        audioTimeTokens: makeTokens("热腾水饺端上桌，吃进肚里暖洋洋", ["热", "吃", "暖"])
      }
    ],
    quiz: [
      {
        question: "中国民间俗语说：冬至吃了什么，耳朵就不会受冻？",
        options: ["热腾腾的水饺", "冰镇冰淇淋", "爆米花", "酸梅汤"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "book_theme_maliang",
    level: 3,
    title: "神笔马良",
    coverImg: "assets/images/cover_maliang.webp",
    stage: 3,
    theme: "经典传统神话",
    targetChars: ["笔", "画", "神", "善", "鸟"],
    desc: "勤奋少年得神笔，画鸟能飞画鱼能游，心怀善良造福乡亲",
    pages: [
      {
        pageNumber: 1,
        text: "少年马良爱画画，树枝作笔沙作纸",
        image: "assets/images/story_maliang_p1.webp",
        interactions: [
          { x: "40%", y: "50%", sound: "Pop", anim: "animate-bounce", text: "刻苦练习画画的小马良！" }
        ],
        audioTimeTokens: makeTokens("少年马良爱画画，树枝作笔沙作纸", ["笔", "画"])
      },
      {
        pageNumber: 2,
        text: "白胡老人赠神笔，画出飞鸟展翅翔",
        image: "assets/images/story_maliang_p2.webp",
        interactions: [
          { x: "55%", y: "45%", sound: "CrownFanfare", anim: "animate-pulse", text: "飞鸟扑棱棱飞向天空！" }
        ],
        audioTimeTokens: makeTokens("白胡老人赠神笔，画出飞鸟展翅翔", ["神", "笔", "鸟"])
      },
      {
        pageNumber: 3,
        text: "神笔专为乡亲画，犁地水牛引甘泉",
        image: "assets/images/story_maliang_p3.webp",
        interactions: [
          { x: "50%", y: "50%", sound: "StarPopCombo", anim: "animate-spin-slow", text: "神笔造福贫苦乡亲！" }
        ],
        audioTimeTokens: makeTokens("神笔专为乡亲画，犁地水牛引甘泉", ["神", "画", "善"])
      }
    ],
    quiz: [
      {
        question: "白胡子老爷爷赠送给善良勤劳的马良什么宝物？",
        options: ["一支画物成真的神笔", "一个大金元宝", "一把铁锄头", "一件锦缎袍子"],
        correctIndex: 0
      }
    ]
  }
];

// Check if already in content
const existingIds = NEW_BOOKS.map(b => b.id).filter(id => content.includes(`"id": "${id}"`));
if (existingIds.length > 0) {
  console.log("Some books already exist:", existingIds);
} else {
  const lastBracketIdx = content.lastIndexOf("];");
  if (lastBracketIdx === -1) {
    throw new Error("Could not find closing '];' in src/data/books.js");
  }

  const newBooksStr = ",\n" + NEW_BOOKS.map(b => JSON.stringify(b, null, 2)).join(",\n");
  const updatedContent = content.slice(0, lastBracketIdx) + newBooksStr + "\n" + content.slice(lastBracketIdx);
  fs.writeFileSync(booksFilePath, updatedContent, "utf-8");
  console.log(`Successfully added ${NEW_BOOKS.length} books to src/data/books.js!`);
}
