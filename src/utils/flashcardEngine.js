/**
 * flashcardEngine.js — B8 Flashcard 原子化
 *
 * 教育学依据：
 *   B8 铁律：每张闪卡只测一个事实（不能字音字形字义混在一起）
 *   B8 铁律：已经会的可以快速跳过
 *   B9 铁律：测试 recall 而非 recognition（原子卡天然是 recall 导向）
 *   Sweller 认知负荷理论 — 最小信息原则
 *
 * 5 张原子卡（固定类型，不可增删）：
 *   FLASH_1  SOUND_TO_CHAR   听音识字     （recognition 基础卡）
 *   FLASH_2  CHAR_TO_PINYIN  看字拼读音   （recall 核心卡！）
 *   FLASH_3  CHAR_TO_STROKES 看字报笔画数  （事实 recall）
 *   FLASH_4  CHAR_TO_RADICAL 看字报部首    （形旁表义 recall）
 *   FLASH_5  CHAR_TO_WORD    看字组词语    （意义 recall）
 *
 * 每张卡独立调度，每张卡独立评分。
 * "已掌握"判断：FSRS masteryRate ≥ 85 且 correctStreak ≥ 3 → skip。
 *
 * 纯数据层，零 DOM 依赖。UI 由调用方（drillEngine 或新 FlashcardModule）负责。
 */

// ──────────────────────────────────────────────────────────
// 原子卡类型（固定，B8 铁律约束）
// ──────────────────────────────────────────────────────────
export const ATOMIC_CARD_TYPES = Object.freeze({
  SOUND_TO_CHAR:  "sound_to_char",   // 听 → 选字
  CHAR_TO_PINYIN: "char_to_pinyin",  // 字 → 拼读音
  CHAR_TO_STROKES:"char_to_strokes", // 字 → 笔画数
  CHAR_TO_RADICAL:"char_to_radical", // 字 → 部首
  CHAR_TO_WORD:   "char_to_word",    // 字 → 组词
});

export const CARD_META = Object.freeze({
  sound_to_char: {
    num: 1, name: "听音识字", category: "recognition",
    prompt: "听听是什么字？",
    masteryField: "audioChar",  // charRecords 里记录该原子卡正确率
  },
  char_to_pinyin: {
    num: 2, name: "看字拼读音", category: "recall",
    prompt: "这个字读什么？拼给我听",
    masteryField: "pinyinSpell",
  },
  char_to_strokes: {
    num: 3, name: "笔画报数", category: "fact_recall",
    prompt: "这个字有几笔？",
    masteryField: "strokeCount",
  },
  char_to_radical: {
    num: 4, name: "找部首", category: "semantic_recall",
    prompt: "这个字的部首是什么？",
    masteryField: "radical",
  },
  char_to_word: {
    num: 5, name: "组词", category: "meaning_recall",
    prompt: "用这个字组个词",
    masteryField: "wordBuild",
  },
});

export const ALL_CARD_TYPES = Object.freeze([
  ATOMIC_CARD_TYPES.SOUND_TO_CHAR,
  ATOMIC_CARD_TYPES.CHAR_TO_PINYIN,
  ATOMIC_CARD_TYPES.CHAR_TO_STROKES,
  ATOMIC_CARD_TYPES.CHAR_TO_RADICAL,
  ATOMIC_CARD_TYPES.CHAR_TO_WORD,
]);

// ──────────────────────────────────────────────────────────
// "已掌握"判断 — B8 快速跳过的依据
// ──────────────────────────────────────────────────────────

/**
 * 单张原子卡是否已掌握。
 * 规则（从严）：
 *   1. 该卡类型在 charRecord 里有 > 0 次记录
 *   2. 正确率 ≥ 85%
 *   3. 最近连续 3 次正确
 */
export function isCardMastered(charRecord, cardType) {
  if (!charRecord) return false;
  const field = CARD_META[cardType].masteryField;
  const stats = charRecord.atomicStats?.[field];
  if (!stats) return false;
  if ((stats.totalAttempts || 0) < 3) return false;
  if ((stats.correctRate || 0) < 0.85) return false;
  if ((stats.recentCorrectStreak || 0) < 3) return false;
  return true;
}

/**
 * 一个字已经掌握了哪些原子卡（哪些可以 skip）
 */
export function getMasteredCards(charRecord) {
  const result = [];
  for (const t of ALL_CARD_TYPES) {
    if (isCardMastered(charRecord, t)) result.push(t);
  }
  return result;
}

// ──────────────────────────────────────────────────────────
// 原子卡生成（输入汉字数据 → 5 种卡片内容）
// ──────────────────────────────────────────────────────────

/**
 * 从单个汉字生成全部 5 张原子卡（或过滤掉已掌握的）。
 *
 * @param {object} charData  CHARACTER_DATABASE 条目
 * @param {object} [charRecord]  ebbinghausManager.progress.charRecords[charId]
 * @param {object} [opts]
 * @param {boolean} [opts.skipMastered=true]  B8 快速跳过
 * @returns {Array<AtomicCard>}
 */
export function buildAtomicCardsForChar(charData, charRecord = null, opts = {}) {
  if (!charData) return [];
  const skipMastered = opts.skipMastered !== false;

  const cards = [];
  for (const type of ALL_CARD_TYPES) {
    if (skipMastered && charRecord && isCardMastered(charRecord, type)) continue;
    const card = _buildOneCard(type, charData, charRecord);
    if (card) cards.push(card);
  }
  return cards;
}

function _buildOneCard(type, char, record) {
  const base = {
    cardId: `${char.id}_${type}`,
    type,
    meta: CARD_META[type],
    charId: char.id,
    char: char.char,
    pinyin: char.pinyin,
    skipMastered: isCardMastered(record, type),
  };

  switch (type) {
    case ATOMIC_CARD_TYPES.SOUND_TO_CHAR:
      return {
        ...base,
        prompt: CARD_META.sound_to_char.prompt,
        speakText: char.pinyin,  // 播放拼音让孩子听
        expected: char.char,
        answerFormat: "char",
      };

    case ATOMIC_CARD_TYPES.CHAR_TO_PINYIN:
      return {
        ...base,
        prompt: CARD_META.char_to_pinyin.prompt,
        displayText: char.char,  // 展示汉字让孩子读
        expected: char.pinyin,
        answerFormat: "pinyin",
      };

    case ATOMIC_CARD_TYPES.CHAR_TO_STROKES:
      if (!char.strokeCount) return null;
      return {
        ...base,
        prompt: CARD_META.char_to_strokes.prompt,
        displayText: char.char,
        expected: char.strokeCount,
        answerFormat: "number",
      };

    case ATOMIC_CARD_TYPES.CHAR_TO_RADICAL:
      if (!char.radical) return null;
      return {
        ...base,
        prompt: CARD_META.char_to_radical.prompt,
        displayText: char.char,
        expected: char.radical,
        answerFormat: "char",
      };

    case ATOMIC_CARD_TYPES.CHAR_TO_WORD:
      const word = (char.words && char.words.length > 0)
        ? char.words.find((w) => w.word && w.word !== char.char)?.word
        : null;
      if (!word) return null;  // 无组词数据 → 跳过
      return {
        ...base,
        prompt: CARD_META.char_to_word.prompt,
        displayText: char.char,
        expected: word,
        answerFormat: "text",
      };

    default:
      return null;
  }
}

// ──────────────────────────────────────────────────────────
// 原子卡回答验证
// ──────────────────────────────────────────────────────────

/**
 * 验证原子卡回答（严格模式 + 宽容模式都提供）。
 * @param {AtomicCard} card
 * @param {string|number} userAnswer
 * @param {object} [opts]  { lenient: true } → 拼音轻声忽略 / 笔画数 ±1 宽容
 */
export function checkCardAnswer(card, userAnswer, opts = {}) {
  if (!card) return { correct: false, reason: "no_card" };

  const expected = card.expected;
  const given = userAnswer;

  switch (card.answerFormat) {
    case "char":
    case "text": {
      const e = String(expected).trim();
      const g = String(given).trim();
      const exact = e === g;
      if (exact) return { correct: true };
      // 宽容：包含关系
      if (opts.lenient && e.length > 1 && g.length > 0) {
        if (e.includes(g) || g.includes(e)) return { correct: true, lenient: true };
      }
      return { correct: false, expected: e, given: g };
    }

    case "pinyin": {
      const e = String(expected).trim();
      const g = String(given).trim();
      if (e === g) return { correct: true };
      // 宽容：去声调比较
      if (opts.lenient) {
        const _s = (s) => s.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, (m) => {
          const map = { ā:'a',á:'a',ǎ:'a',à:'a', ē:'e',é:'e',ě:'e',è:'e', ī:'i',í:'i',ǐ:'i',ì:'i', ō:'o',ó:'o',ǒ:'o',ò:'o', ū:'u',ú:'u',ǔ:'u',ù:'u', ǖ:'v',ǘ:'v',ǚ:'v',ǜ:'v' };
          return map[m] || m;
        }).toLowerCase();
        if (_s(e) === _s(g)) return { correct: true, lenient: true, note: "声调近似算对" };
      }
      return { correct: false, expected: e, given: g };
    }

    case "number": {
      const en = Number(expected);
      const gn = Number(given);
      if (en === gn) return { correct: true };
      if (opts.lenient && Math.abs(en - gn) === 1) return { correct: true, lenient: true, note: "±1 宽容" };
      return { correct: false, expected: en, given: gn };
    }

    default:
      return { correct: String(expected).trim() === String(given).trim() };
  }
}

// ──────────────────────────────────────────────────────────
// 更新 charRecord 的 atomicStats（每次答完一张卡要调用）
// ──────────────────────────────────────────────────────────

/**
 * 更新某张原子卡的统计（调用方负责写回 charRecord + save）。
 *
 * @param {object} charRecord  直接 mutate
 * @param {string} cardType    ATOMIC_CARD_TYPES.*
 * @param {boolean} correct
 */
export function recordAtomicAnswer(charRecord, cardType, correct) {
  if (!charRecord) return;
  const field = CARD_META[cardType].masteryField;
  charRecord.atomicStats = charRecord.atomicStats || {};
  const s = charRecord.atomicStats[field] || {
    totalAttempts: 0,
    correctCount: 0,
    correctRate: 0,
    recentCorrectStreak: 0,
  };
  s.totalAttempts += 1;
  if (correct) {
    s.correctCount += 1;
    s.recentCorrectStreak += 1;
  } else {
    s.recentCorrectStreak = 0;
  }
  s.correctRate = s.totalAttempts > 0 ? s.correctCount / s.totalAttempts : 0;
  charRecord.atomicStats[field] = s;
}

// ──────────────────────────────────────────────────────────
// 批量：一组字 → 原子卡队列（调度器用）
// ──────────────────────────────────────────────────────────

/**
 * 把一组字展开成原子卡队列（去重 + 已掌握跳过）。
 *
 * @param {Array} chars   CHARACTER_DATABASE 条目数组
 * @param {object} records  ebbinghausManager.progress.charRecords
 * @param {object} [opts]  { skipMastered: true, maxCardsPerChar: 5 }
 * @returns {Array<AtomicCard>}  扁平原子卡列表
 */
export function expandCharsToAtomicQueue(chars, records, opts = {}) {
  const skip = opts.skipMastered !== false;
  const maxPerChar = opts.maxCardsPerChar || 5;
  const queue = [];
  for (const c of chars) {
    const rec = records?.[c.id] || null;
    const cards = buildAtomicCardsForChar(c, rec, { skipMastered: skip });
    queue.push(...cards.slice(0, maxPerChar));
  }
  return queue;
}
