/**
 * src/utils/cognitiveStage.js
 * ================================================================
 * 汉字认知分层与多维度字义适配引擎 (T3 / 外部调研报告建议A)
 * ─────────────────────────────────────────────────────────────
 * 教育学依据：
 *   1. 皮亚杰儿童认知发展阶段理论：
 *      - 5-6岁（前运算阶段）：直观表象、图像感知、具象思维为主
 *      - 6-7岁（具体运算初阶）：幼小衔接，建立符号规则、声母韵母拼读与偏旁理据
 *      - 7-8岁+（具体运算进阶）：正字法意识成熟，形近字/同音字辨析与多义词语拓展
 *   2. 《外部研究与最佳实践调研报告》1.4 建议A：按认知阶段分层字义教学数据
 */

/**
 * 将年龄映射为对应的认知阶段 key
 * @param {number} age 儿童年龄 (一般 4 - 9 岁)
 * @returns {"preschool" | "grade1" | "grade2"}
 */
export function resolveCognitiveStage(age) {
  const numericAge = typeof age === "number" ? age : parseInt(age, 10) || 6;
  if (numericAge <= 6) return "preschool";
  if (numericAge === 7) return "grade1";
  return "grade2";
}

/**
 * 获取单字针对特定年龄儿童的分层教学指导数据
 * @param {object} charData 单字完整数据对象
 * @param {number} [age=6] 儿童年龄
 * @returns {{
 *   stage: "preschool" | "grade1" | "grade2",
 *   title: string,
 *   focus: string,
 *   text: string,
 *   badge: string,
 *   ageRange: string
 * } | null}
 */
export function getCognitiveStageData(charData, age = 6) {
  if (!charData) return null;
  const stage = resolveCognitiveStage(age);

  const META = {
    preschool: {
      title: "启蒙具象识字",
      focus: "象形与表象记忆",
      badge: "启蒙期",
      ageRange: "5-6岁",
    },
    grade1: {
      title: "拼读与部件理据",
      focus: "拼音结合与部首表义",
      badge: "衔接期",
      ageRange: "6-7岁",
    },
    grade2: {
      title: "形近辨析与应用",
      focus: "形近辨析与深度构词",
      badge: "进阶期",
      ageRange: "7-8岁+",
    },
  };

  const meta = META[stage];
  const actionPrompt = stage === "preschool" ? getActionPerformance(charData) : "";

  // 1. 如果已有人工或精细标注的 cognitiveStage，直接优先使用
  if (charData.cognitiveStage && typeof charData.cognitiveStage[stage] === "string" && charData.cognitiveStage[stage].trim()) {
    return {
      stage,
      title: `${meta.title} (${meta.ageRange})`,
      focus: meta.focus,
      text: charData.cognitiveStage[stage].trim(),
      badge: meta.badge,
      ageRange: meta.ageRange,
      actionPrompt,
    };
  }

  // 2. 否则基于字库已有字段（meanings, evolution, words, confusingChars）进行智能适配生成
  let text = "";
  if (stage === "preschool") {
    // 5-6岁：具体形象、生活事物联想
    if (charData.meanings?.primary && charData.meanings.primary.length > 2) {
      text = `看，像生活中的「${charData.char}」：${charData.meanings.primary}。`;
    } else if (charData.evolution?.story) {
      const firstClause = charData.evolution.story.split("，")[0].replace(/^(古人看到[的]?|人们看到|古人观察)/, "").trim();
      text = `仔细观察，就像${firstClause}。`;
    } else if (charData.words && charData.words.length > 0) {
      const w0 = charData.words[0].word || charData.words[0];
      text = `就像「${w0}」里的「${charData.char}」，像个神奇的小图画！`;
    } else {
      text = `仔细看「${charData.char}」的形状，像一个有趣的小符号！`;
    }
  } else if (stage === "grade1") {
    // 6-7岁：部件表义、拼读理据
    const radicalTip = charData.meanings?.radicalHint || (charData.radical ? `偏旁部首是「${charData.radical}」` : "");
    const pinyinStr = charData.pinyin ? `拼音读作 ${charData.pinyin}，` : "";
    text = `${pinyinStr}${radicalTip ? radicalTip + "。" : ""}想一想，古人为什么这样组合部件写出这个字？`;
  } else {
    // 7-8岁+：形近字防混淆、同音辨异、词汇拓展
    const confusing = (charData.confusingChars || []).filter((c) => c !== charData.char).slice(0, 3);
    if (confusing.length > 0) {
      text = `形近字辨析：特别注意和「${confusing.join("、")}」区分开，找出笔画细微不同！`;
    } else if (charData.confusingHint) {
      text = `辨析线索：${charData.confusingHint}`;
    } else if (charData.words && charData.words.length >= 2) {
      const wordList = charData.words.slice(0, 3).map((w) => w.word || w).join("、");
      text = `深度应用：能够熟练认读并写出「${wordList}」等词汇。`;
    } else {
      text = `规范书写「${charData.char}」的笔顺，理解在不同语境中的字义。`;
    }
  }

  return {
    stage,
    title: `${meta.title} (${meta.ageRange})`,
    focus: meta.focus,
    text,
    badge: meta.badge,
    ageRange: meta.ageRange,
    actionPrompt,
  };
}

/**
 * 获取 5-6 岁幼儿具身认知（Embodied Cognition）动作表演引导语 (外部调研报告建议C)
 * 根据字义与偏旁，生成适合学龄前儿童用身体模仿动作体验字义的口令
 * @param {object} charData 单字数据对象
 * @returns {string} 动作表演指导文案
 */
export function getActionPerformance(charData) {
  if (!charData) return "";
  const c = charData.char || "";

  // 1. 特色核心字定制身体律动
  const ACTION_MAP = {
    "飞": "张开双臂像小鸟一样上下轻轻扇动！",
    "走": "小手叉腰，原地轻快地踏步走！",
    "跑": "双臂前后自然摆动，原地小跑起来！",
    "看": "小手搭在额头前，像孙悟空一样往远处张望！",
    "目": "眨一眨明亮的大眼睛，看看周围有什么！",
    "听": "把小手拢在耳朵边，静静听周围的声音！",
    "耳": "轻轻捏捏自己的小耳朵，拉一拉揉一揉！",
    "笑": "嘴角向上高高扬起，露出最灿烂的笑容！",
    "乐": "开心地拍拍双手，蹦蹦跳跳欢呼一下！",
    "高": "双脚踮起来，两只小手向上高高举过头顶！",
    "大": "双臂伸展、双脚叉开，把自己变成一个大字！",
    "小": "把身体蜷缩起来，像一颗小巧玲珑的小豆子！",
    "立": "挺起小胸膛，像一棵笔直挺拔的小松树！",
    "坐": "小手平放在膝盖上，端端正正坐得稳当！",
    "手": "伸出两只胖乎乎的小手，握紧拳头再张开！",
    "日": "用双手在头顶画一个大圆，像红彤彤的太阳！",
    "月": "身体微微侧倾，双手弯成弯弯的小月牙！",
    "水": "双手波浪般上下起伏，像欢快流动的小溪水！",
    "雨": "十个小手指轻轻抖动，像淅淅沥沥的春雨落下来！",
    "火": "两只手在胸前灵动摇摆，像跳跃闪烁的小火苗！",
    "风": "鼓起小腮帮，轻轻呼一口气吹吹风！",
    "山": "双手在头顶合拢成三角形，稳固如一座大山！",
    "木": "双脚扎稳马步，双臂向两侧舒展如大树绿荫！",
    "鸟": "两只手像小鸟的翅膀一样扑棱扑棱飞！",
    "鱼": "两手合十，在空中像小金鱼一样摇摆游动！",
    "虫": "小手指弯一弯伸一伸，像小毛毛虫爬呀爬！",
    "吃": "张开嘴巴，吧唧吧唧模仿品尝美味的食物！",
    "跳": "双脚并拢，轻轻地向上跳一下！",
  };

  if (ACTION_MAP[c]) {
    return ACTION_MAP[c];
  }

  // 2. 根据偏旁部首智能分类匹配律动
  const rad = charData.radical || "";
  if (rad === "扌" || rad === "手") {
    return `伸出双手，模仿做一个「${c}」的动作！`;
  }
  if (rad === "足" || rad === "走" || rad === "辶") {
    return `双脚动一动，原地模仿「${c}」的轻快动作！`;
  }
  if (rad === "口") {
    return `张开嘴巴动一动，发出「${c}」的声音！`;
  }
  if (rad === "目") {
    return `转动明亮的小眼睛，仔细观察身边的物品！`;
  }
  if (rad === "氵" || rad === "水") {
    return `手臂轻轻摆动，像水流一样柔和波动！`;
  }
  if (rad === "艹" || rad === "木") {
    return `像小树小草一样向上伸展，慢慢长高！`;
  }

  // 3. 通用具身认知启发语
  if (charData.meanings?.primary) {
    return `想一想「${c}」（${charData.meanings.primary}），用你可爱的身体动作表演出来吧！`;
  }
  return `动动小脑筋和小手脚，用动作表演一下「${c}」字吧！`;
}

/**
 * 获取单字完整三阶段认知路线图（用于家长端 AI 导师报告或字卡深度解读）
 * @param {object} charData
 * @returns {{ preschool: object, grade1: object, grade2: object }}
 */
export function getCognitiveFullRoadmap(charData) {
  return {
    preschool: getCognitiveStageData(charData, 5),
    grade1: getCognitiveStageData(charData, 7),
    grade2: getCognitiveStageData(charData, 8),
  };
}

/**
 * 根据部首或主要字义推导语义场分类（自然天象、动物植物、人体感觉、空间时间等）
 * @param {object} charData
 * @returns {string} 语义场名称
 */
export function getSemanticField(charData) {
  if (!charData) return "基础汉字";
  if (Array.isArray(charData.semanticField) && charData.semanticField.length > 0) {
    return charData.semanticField[0];
  }

  const rad = charData.radical || "";
  const NATURE = ["日", "月", "水", "氵", "火", "灬", "土", "山", "石", "雨", "气", "风", "云"];
  const LIVING = ["木", "艹", "虫", "鸟", "鱼", "犭", "犬", "马", "牛", "羊", "禾", "竹"];
  const HUMAN = ["人", "亻", "口", "手", "扌", "足", "𧾷", "目", "耳", "心", "忄", "身", "页"];
  const ACTION = ["走", "辶", "言", "讠", "力", "戈", "殳", "攵", "攴"];

  if (NATURE.includes(rad)) return "天文与大自然";
  if (LIVING.includes(rad)) return "动植物与生灵";
  if (HUMAN.includes(rad)) return "人体与感官";
  if (ACTION.includes(rad)) return "动作与探索";

  return "生活与日常";
}
