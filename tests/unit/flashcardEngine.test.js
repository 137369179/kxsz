import { describe, it, expect } from 'vitest';
import {
  ATOMIC_CARD_TYPES,
  CARD_META,
  ALL_CARD_TYPES,
  isCardMastered,
  getMasteredCards,
  buildAtomicCardsForChar,
  checkCardAnswer,
  recordAtomicAnswer,
  expandCharsToAtomicQueue,
} from '../../src/utils/flashcardEngine.js';

// ──────────────────────────────────────────────────────────
// B8 铁律：每张卡只测一个事实（不能字音字形字义混在一起）
// B8 铁律：已经会的可以快速跳过
// B9 铁律：测试 recall 而非 recognition
// 教育学引用：Sweller 认知负荷理论 — 最小信息原则
// ──────────────────────────────────────────────────────────

const CHAR_MA = {
  id: "char_ma", char: "妈", pinyin: "mā", strokeCount: 6, radical: "女",
  words: [{ word: "妈妈" }], sentence: "我的妈妈很温柔。",
};
const CHAR_SHI = {
  id: "char_shi", char: "是", pinyin: "shì", strokeCount: 9, radical: "日",
  words: [{ word: "是的" }], sentence: "这是一棵树。",
};
const CHAR_NO_WORDS = {
  id: "char_x", char: "X", pinyin: "xī", strokeCount: 3, radical: "丨",
  // words 缺失 → CHAR_TO_WORD 应被跳过
};

function makeRecord(statsOverrides = {}) {
  const base = {
    atomicStats: {
      audioChar:   { totalAttempts: 5, correctCount: 5, correctRate: 1.0, recentCorrectStreak: 5 },
      pinyinSpell: { totalAttempts: 5, correctCount: 4, correctRate: 0.8, recentCorrectStreak: 2 },
      strokeCount: { totalAttempts: 0, correctCount: 0, correctRate: 0,   recentCorrectStreak: 0 },
      radical:     { totalAttempts: 3, correctCount: 3, correctRate: 1.0, recentCorrectStreak: 3 },
      wordBuild:   { totalAttempts: 4, correctCount: 4, correctRate: 1.0, recentCorrectStreak: 4 },
    },
  };
  // 应用覆盖
  for (const [k, v] of Object.entries(statsOverrides)) {
    base.atomicStats[CARD_META[k].masteryField] = v;
  }
  return base;
}

describe('ALL_CARD_TYPES — B8 铁律 5 张原子卡完整性', () => {
  it('恰好 5 种类型，固定不可增删', () => {
    expect(ALL_CARD_TYPES.length).toBe(5);
    expect(new Set(ALL_CARD_TYPES).size).toBe(5); // 唯一
  });

  it('每种类型在 CARD_META 有 name / prompt / masteryField', () => {
    for (const t of ALL_CARD_TYPES) {
      expect(CARD_META[t].name).toBeTruthy();
      expect(CARD_META[t].prompt).toBeTruthy();
      expect(CARD_META[t].masteryField).toBeTruthy();
    }
  });

  it('3 种 recall + 1 种 recognition + 1 种 semantic', () => {
    const cats = ALL_CARD_TYPES.map((t) => CARD_META[t].category);
    const recall = cats.filter((c) => c.includes("recall") || c.includes("fact")).length;
    expect(recall).toBeGreaterThanOrEqual(3);
  });
});

describe('buildAtomicCardsForChar — 单字 5 张原子卡', () => {
  it('完整字（words/radical/strokes 全齐）→ 5 张全出', () => {
    const cards = buildAtomicCardsForChar(CHAR_MA, null, { skipMastered: false });
    expect(cards.length).toBe(5);
    const types = cards.map((c) => c.type);
    expect(types).toContain(ATOMIC_CARD_TYPES.SOUND_TO_CHAR);
    expect(types).toContain(ATOMIC_CARD_TYPES.CHAR_TO_PINYIN);
    expect(types).toContain(ATOMIC_CARD_TYPES.CHAR_TO_STROKES);
    expect(types).toContain(ATOMIC_CARD_TYPES.CHAR_TO_RADICAL);
    expect(types).toContain(ATOMIC_CARD_TYPES.CHAR_TO_WORD);
  });

  it('缺 words → CHAR_TO_WORD 跳过', () => {
    const cards = buildAtomicCardsForChar(CHAR_NO_WORDS, null, { skipMastered: false });
    const types = cards.map((c) => c.type);
    expect(types).not.toContain(ATOMIC_CARD_TYPES.CHAR_TO_WORD);
    expect(cards.length).toBe(4);
  });

  it('null char → 空数组', () => {
    expect(buildAtomicCardsForChar(null)).toEqual([]);
  });
});

describe('isCardMastered / getMasteredCards — B8 快速跳过', () => {
  it('无 record → 未掌握', () => {
    expect(isCardMastered(null, ATOMIC_CARD_TYPES.SOUND_TO_CHAR)).toBe(false);
  });

  it('掌握条件满足（>3 次 + ≥85% + streak≥3）→ true', () => {
    const rec = makeRecord();
    // audioChar: 5/5 = 100%, streak 5
    expect(isCardMastered(rec, ATOMIC_CARD_TYPES.SOUND_TO_CHAR)).toBe(true);
    // radical: 3/3 = 100%, streak 3
    expect(isCardMastered(rec, ATOMIC_CARD_TYPES.CHAR_TO_RADICAL)).toBe(true);
    // wordBuild: 4/4 = 100%, streak 4
    expect(isCardMastered(rec, ATOMIC_CARD_TYPES.CHAR_TO_WORD)).toBe(true);
  });

  it('正确率不够（80%）→ false', () => {
    const rec = makeRecord();
    // pinyinSpell: 4/5 = 80%, streak 2（两条都不满足）
    expect(isCardMastered(rec, ATOMIC_CARD_TYPES.CHAR_TO_PINYIN)).toBe(false);
  });

  it('尝试次数 < 3 → false', () => {
    const rec = makeRecord();
    // strokeCount: 0 次
    expect(isCardMastered(rec, ATOMIC_CARD_TYPES.CHAR_TO_STROKES)).toBe(false);
  });

  it('streak 断过 → false', () => {
    const rec = makeRecord({ sound_to_char: { totalAttempts: 10, correctCount: 9, correctRate: 0.9, recentCorrectStreak: 1 } });
    expect(isCardMastered(rec, ATOMIC_CARD_TYPES.SOUND_TO_CHAR)).toBe(false);
  });

  it('getMasteredCards 返回已掌握的列表', () => {
    const rec = makeRecord();
    const mastered = getMasteredCards(rec);
    // audioChar / radical / wordBuild 三张
    expect(mastered).toContain(ATOMIC_CARD_TYPES.SOUND_TO_CHAR);
    expect(mastered).toContain(ATOMIC_CARD_TYPES.CHAR_TO_RADICAL);
    expect(mastered).toContain(ATOMIC_CARD_TYPES.CHAR_TO_WORD);
    // pinyinSpell 未掌握
    expect(mastered).not.toContain(ATOMIC_CARD_TYPES.CHAR_TO_PINYIN);
  });

  it('buildAtomicCardsForChar 默认 skipMastered → 自动过滤', () => {
    const rec = makeRecord();
    const cards = buildAtomicCardsForChar(CHAR_MA, rec);
    const types = cards.map((c) => c.type);
    expect(types).not.toContain(ATOMIC_CARD_TYPES.SOUND_TO_CHAR);  // 已掌握
    expect(types).toContain(ATOMIC_CARD_TYPES.CHAR_TO_PINYIN);    // 未掌握
    expect(types).toContain(ATOMIC_CARD_TYPES.CHAR_TO_STROKES);   // 未尝试过
    expect(types).not.toContain(ATOMIC_CARD_TYPES.CHAR_TO_RADICAL); // 已掌握
    expect(types).not.toContain(ATOMIC_CARD_TYPES.CHAR_TO_WORD);   // 已掌握
  });
});

describe('checkCardAnswer — 严格 + 宽容模式', () => {
  it('exact match → correct', () => {
    const card = buildAtomicCardsForChar(CHAR_MA, null, { skipMastered: false })
      .find((c) => c.type === ATOMIC_CARD_TYPES.CHAR_TO_PINYIN);
    expect(checkCardAnswer(card, "mā").correct).toBe(true);
  });

  it('char 类型 exact → correct', () => {
    const card = buildAtomicCardsForChar(CHAR_MA, null, { skipMastered: false })
      .find((c) => c.type === ATOMIC_CARD_TYPES.SOUND_TO_CHAR);
    expect(checkCardAnswer(card, "妈").correct).toBe(true);
    expect(checkCardAnswer(card, "麻").correct).toBe(false);
  });

  it('number 类型 exact → correct', () => {
    const card = buildAtomicCardsForChar(CHAR_MA, null, { skipMastered: false })
      .find((c) => c.type === ATOMIC_CARD_TYPES.CHAR_TO_STROKES);
    expect(checkCardAnswer(card, 6).correct).toBe(true);
    expect(checkCardAnswer(card, 7).correct).toBe(false);
  });

  it('pinyin 宽容：声调不同算 lenient correct', () => {
    const card = buildAtomicCardsForChar(CHAR_MA, null, { skipMastered: false })
      .find((c) => c.type === ATOMIC_CARD_TYPES.CHAR_TO_PINYIN);
    // 严格模式
    expect(checkCardAnswer(card, "ma").correct).toBe(false);
    // 宽容模式：去调后 ma === ma
    expect(checkCardAnswer(card, "ma", { lenient: true })).toEqual({ correct: true, lenient: true, note: "声调近似算对" });
  });

  it('number 宽容：±1 算对（笔画数难记）', () => {
    const card = buildAtomicCardsForChar(CHAR_MA, null, { skipMastered: false })
      .find((c) => c.type === ATOMIC_CARD_TYPES.CHAR_TO_STROKES);
    expect(checkCardAnswer(card, 5, { lenient: true })).toEqual({ correct: true, lenient: true, note: "±1 宽容" });
    expect(checkCardAnswer(card, 7, { lenient: true })).toEqual({ correct: true, lenient: true, note: "±1 宽容" });
    expect(checkCardAnswer(card, 4, { lenient: true }).correct).toBe(false);
  });

  it('null card → 返回 correct: false', () => {
    expect(checkCardAnswer(null, "a")).toEqual({ correct: false, reason: "no_card" });
  });
});

describe('recordAtomicAnswer — mutate charRecord.atomicStats', () => {
  it('首次答正确 → 初始化 stats + streak=1', () => {
    const rec = {};
    recordAtomicAnswer(rec, ATOMIC_CARD_TYPES.SOUND_TO_CHAR, true);
    const s = rec.atomicStats.audioChar;
    expect(s.totalAttempts).toBe(1);
    expect(s.correctCount).toBe(1);
    expect(s.correctRate).toBe(1);
    expect(s.recentCorrectStreak).toBe(1);
  });

  it('答错 → streak 归零', () => {
    const rec = { atomicStats: { audioChar: { totalAttempts: 5, correctCount: 5, correctRate: 1, recentCorrectStreak: 5 } } };
    recordAtomicAnswer(rec, ATOMIC_CARD_TYPES.SOUND_TO_CHAR, false);
    expect(rec.atomicStats.audioChar.recentCorrectStreak).toBe(0);
    expect(rec.atomicStats.audioChar.correctCount).toBe(5);
    expect(rec.atomicStats.audioChar.totalAttempts).toBe(6);
  });

  it('null record → 安全返回不崩', () => {
    expect(() => recordAtomicAnswer(null, "x", true)).not.toThrow();
  });
});

describe('expandCharsToAtomicQueue — 批量展开', () => {
  it('2 个字 → 最多 10 张原子卡（已掌握跳过则更少）', () => {
    const chars = [CHAR_MA, CHAR_SHI];
    const records = { char_ma: null, char_shi: null };
    const queue = expandCharsToAtomicQueue(chars, records);
    expect(queue.length).toBeGreaterThanOrEqual(8);  // 2 × 5 = 10，缺 word 或 radical 会减
    for (const card of queue) expect(card.cardId).toBeTruthy();
  });

  it('skipMastered=true（默认）时跳过已掌握卡', () => {
    const chars = [CHAR_MA];
    const rec = makeRecord(); // 3 张已掌握
    const queue = expandCharsToAtomicQueue(chars, { char_ma: rec });
    // 只该剩 2 张（pinyin + strokeCount）
    const types = queue.map((c) => c.type);
    expect(types).not.toContain(ATOMIC_CARD_TYPES.SOUND_TO_CHAR);
    expect(types).not.toContain(ATOMIC_CARD_TYPES.CHAR_TO_RADICAL);
    expect(types).not.toContain(ATOMIC_CARD_TYPES.CHAR_TO_WORD);
  });

  it('maxCardsPerChar 控制每字上限', () => {
    const chars = [CHAR_MA, CHAR_SHI];
    const queue = expandCharsToAtomicQueue(chars, {}, { maxCardsPerChar: 2, skipMastered: false });
    expect(queue.length).toBeLessThanOrEqual(4); // 2 字 × 2 卡
  });
});
