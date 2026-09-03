/**
 * src/data/charactersSchema.js
 * ================================================================
 * 《凯茜识字》字义与字用标准 Schema 规范 (T3 / B3 / B8)
 * ─────────────────────────────────────────────────────────────
 * 涵盖认知结构基础字段、构词造句推荐字段以及字义拓展可选字段。
 */

export const CHAR_SCHEMA = {
  required: [
    "id",
    "char",
    "pinyin",
    "pinyinTone",
    "radical",
    "strokeCount",
    "strokes"
  ],
  recommended: [
    "words",
    "sentence",
    "compoundChars",
    "mnemonic"
  ],
  optional: {
    meanings: [
      {
        sense: "字义简释（儿童通俗语言）",
        explanation: "详细释义",
        example: "生活化例句"
      }
    ],
    synonyms: [], // 近义字列表
    antonyms: [], // 反义字列表
    contextExamples: [
      {
        scene: "场景（如家庭、大自然、学校）",
        sentence: "配图例句"
      }
    ],
    commonMistakes: [
      {
        confusionChar: "形近/音近字",
        confusionType: "shape | tone | sound",
        hint: "儿童辨析口诀"
      }
    ],
    homophoneGroup: [], // 同音字组
    cognitiveStage: {
      preschool: "5-6岁启蒙认知重点",
      grade1: "6-7岁一年级衔接重点",
      grade2: "7-8岁二年级拓展重点"
    }
  }
};

/**
 * 校验单字数据是否符合 Schema
 * @param {object} charData
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateCharacter(charData) {
  const errors = [];
  const warnings = [];

  if (!charData || typeof charData !== "object") {
    return { valid: false, errors: ["字符数据为空或无效"], warnings: [] };
  }

  for (const field of CHAR_SCHEMA.required) {
    if (charData[field] === undefined || charData[field] === null || charData[field] === "") {
      errors.push(`缺少必需字段: ${field}`);
    }
  }

  if (Array.isArray(charData.strokes) && charData.strokes.length === 0) {
    errors.push("strokes 数组为空，缺少笔画轨迹");
  }

  if (!Array.isArray(charData.words) || charData.words.length < 2) {
    warnings.push(`组词数量不足: words 应至少包含 2 个词汇 (当前: ${charData.words?.length || 0})`);
  }

  if (!charData.sentence) {
    warnings.push("缺少儿童生活化例句: sentence");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
