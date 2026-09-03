import { describe, it, expect, beforeEach } from 'vitest';
import {
  TONE_INFO,
  TONE_MNEMONICS,
  TONE_GAME_TYPES,
  getToneNum,
  stripTone,
  buildTonePairs,
  generateQuestion,
  checkAnswer,
  generateSession,
  pickPromptPairs,
  _invalidateCache,
} from '../../src/utils/toneContrastGame.js';

// ──────────────────────────────────────────────────────────
// B5 铁律：声调意识 r=0.37 最高预测因子
// 教育学引用：3-12 岁汉语语音意识元分析 (59 篇 12514 样本)
// ──────────────────────────────────────────────────────────

const MOCK_DB = [
  { id: "c_ma1", char: "妈",  pinyin: "mā" },
  { id: "c_ma2", char: "麻",  pinyin: "má" },
  { id: "c_ma3", char: "马",  pinyin: "mǎ" },
  { id: "c_ma4", char: "骂",  pinyin: "mà" },
  { id: "c_ma0", char: "吗",  pinyin: "ma" },   // 轻声
  { id: "c_yi1", char: "一",  pinyin: "yī" },
  { id: "c_yi2", char: "移",  pinyin: "yí" },
  { id: "c_yi3", char: "已",  pinyin: "yǐ" },
  { id: "c_yi4", char: "意",  pinyin: "yì" },
  { id: "c_shi1", char: "诗", pinyin: "shī" },
  { id: "c_shi2", char: "时", pinyin: "shí" },
  { id: "c_shi4", char: "是", pinyin: "shì" }, // 无 3 声
  { id: "c_shui3", char: "水", pinyin: "shuǐ" },
  { id: "c_shui4", char: "睡", pinyin: "shuì" },
];

describe('getToneNum — 拼音→声调编号', () => {
  it('四声识别正确', () => {
    expect(getToneNum("mā")).toBe(1);
    expect(getToneNum("má")).toBe(2);
    expect(getToneNum("mǎ")).toBe(3);
    expect(getToneNum("mà")).toBe(4);
  });

  it('轻声（无声调标记）返回 0', () => {
    expect(getToneNum("ma")).toBe(0);
    expect(getToneNum("")).toBe(0);
    expect(getToneNum(null)).toBe(0);
  });

  it('ü / ǘ / ǚ / ǜ 也能识别', () => {
    expect(getToneNum("lǘ")).toBe(2);
    expect(getToneNum("nǚ")).toBe(3);
    expect(getToneNum("yù")).toBe(4);
  });

  it('复拼音也能识别（声调只在一个元音上）', () => {
    expect(getToneNum("shuǐ")).toBe(3);
    expect(getToneNum("yuè")).toBe(4);
    expect(getToneNum("tiān")).toBe(1);
  });
});

describe('stripTone — 去调得 base', () => {
  it("mā → ma, shuǐ → shui", () => {
    expect(stripTone("mā")).toBe("ma");
    expect(stripTone("má")).toBe("ma");
    expect(stripTone("shuǐ")).toBe("shui");
    expect(stripTone("yuè")).toBe("yue");
    expect(stripTone("lǜ")).toBe("lv");
  });

  it('null / empty → empty', () => {
    expect(stripTone("")).toBe("");
    expect(stripTone(null)).toBe("");
  });
});

describe('buildTonePairs — 从字库找对比对', () => {
  beforeEach(() => _invalidateCache());

  it('ma 有 4 声齐全', () => {
    const pairs = buildTonePairs(MOCK_DB);
    const ma = pairs.find((p) => p.base === "ma");
    expect(ma).toBeDefined();
    expect(ma.toneCount).toBe(4);
    expect(ma.tones[1].char).toBe("妈");
    expect(ma.tones[4].char).toBe("骂");
  });

  it('shi 只有 3 声（缺 3 声）', () => {
    const pairs = buildTonePairs(MOCK_DB);
    const shi = pairs.find((p) => p.base === "shi");
    expect(shi.toneCount).toBe(3);
  });

  it('排序：4 声齐全在最前', () => {
    const pairs = buildTonePairs(MOCK_DB);
    expect(pairs[0].toneCount).toBeGreaterThanOrEqual(pairs[1].toneCount);
  });

  it('轻声字不纳入对比', () => {
    const pairs = buildTonePairs(MOCK_DB);
    const ma = pairs.find((p) => p.base === "ma");
    expect(ma.tones[0]).toBeUndefined(); // 轻声吗 不进
  });

  it('空字库 → 空', () => {
    _invalidateCache();
    expect(buildTonePairs([])).toEqual([]);
  });
});

describe('generateQuestion — 三种题型', () => {
  beforeEach(() => _invalidateCache());

  const pairs = buildTonePairs(MOCK_DB);
  const ma = pairs.find((p) => p.base === "ma");

  it('listen_pick_tone: 4 个声调选项 + 正确答案是声调编号', () => {
    const q = generateQuestion(TONE_GAME_TYPES.LISTEN_PICK_TONE, ma, pairs);
    expect(q.type).toBe(TONE_GAME_TYPES.LISTEN_PICK_TONE);
    expect(q.options.length).toBe(4);
    expect([1, 2, 3, 4]).toContain(q.correctAnswer);
    expect(q.speakText).toBeDefined(); // 需要播放
  });

  it('tone_pick_char: 4 个汉字选项 + 正确答案是字符', () => {
    const q = generateQuestion(TONE_GAME_TYPES.TONE_PICK_CHAR, ma, pairs);
    expect(q.type).toBe(TONE_GAME_TYPES.TONE_PICK_CHAR);
    expect(q.options.length).toBe(4);
    expect(typeof q.correctAnswer).toBe("string"); // 汉字
    // 正确答案必须在选项里
    expect(q.options.some((o) => o.char === q.correctAnswer)).toBe(true);
  });

  it('tone_order: correctOrder 长度 = pair.toneCount', () => {
    const q = generateQuestion(TONE_GAME_TYPES.TONE_ORDER, ma, pairs);
    expect(q.type).toBe(TONE_GAME_TYPES.TONE_ORDER);
    expect(q.correctOrder.length).toBe(4);
    expect(q.options.length).toBe(4);
  });

  it('空 pair → null', () => {
    expect(generateQuestion(TONE_GAME_TYPES.LISTEN_PICK_TONE, null, pairs)).toBeNull();
  });
});

describe('checkAnswer — 统一验证', () => {
  beforeEach(() => _invalidateCache());

  const pairs = buildTonePairs(MOCK_DB);
  const ma = pairs.find((p) => p.base === "ma");

  it('listen_pick_tone: 编号匹配', () => {
    const q = generateQuestion(TONE_GAME_TYPES.LISTEN_PICK_TONE, ma, pairs);
    expect(checkAnswer(q, q.correctAnswer)).toBe(true);
    expect(checkAnswer(q, ((q.correctAnswer + 1) % 4) || 4)).toBe(false);
  });

  it('tone_pick_char: 汉字匹配', () => {
    const q = generateQuestion(TONE_GAME_TYPES.TONE_PICK_CHAR, ma, pairs);
    expect(checkAnswer(q, q.correctAnswer)).toBe(true);
    // 错误选项 = 正确字之外的某个字
    const wrong = q.options.find((o) => o.char !== q.correctAnswer);
    if (wrong) expect(checkAnswer(q, wrong.char)).toBe(false);
  });

  it('tone_order: 数组匹配', () => {
    const q = generateQuestion(TONE_GAME_TYPES.TONE_ORDER, ma, pairs);
    expect(checkAnswer(q, q.correctOrder)).toBe(true);
    // 打乱
    const wrong = [...q.correctOrder].reverse();
    expect(checkAnswer(q, wrong)).toBe(false);
  });

  it('空 question → false', () => {
    expect(checkAnswer(null, 1)).toBe(false);
  });
});

describe('generateSession — 一局 N 题', () => {
  beforeEach(() => _invalidateCache());

  it('默认 5 题，全有 question', () => {
    const s = generateSession(MOCK_DB);
    expect(s.total).toBe(5);
    expect(s.questions.length).toBe(5);
    for (const q of s.questions) {
      expect(q.type).toBeDefined();
      expect(q.correctAnswer !== undefined).toBe(true);
    }
  });

  it('自定义题数', () => {
    const s = generateSession(MOCK_DB, { numQuestions: 3 });
    expect(s.total).toBe(3);
  });

  it('空 DB → 返回空', () => {
    _invalidateCache();
    const s = generateSession([]);
    expect(s.total).toBe(0);
    expect(s.questions).toEqual([]);
  });
});

describe('pickPromptPairs — 避免连续同一 base', () => {
  beforeEach(() => _invalidateCache());

  it('avoidBase 时排除', () => {
    const pairs = buildTonePairs(MOCK_DB);
    const picked = pickPromptPairs(pairs, { count: 3, avoidBase: "ma" });
    for (const p of picked) expect(p.base).not.toBe("ma");
  });
});

describe('TONE_INFO / TONE_MNEMONICS 完整性', () => {
  it('5 个声调条目全齐', () => {
    expect(TONE_INFO.length).toBe(5);
    expect(TONE_INFO[1].name).toContain("第一声");
    expect(TONE_INFO[4].longName).toBe("去声");
  });

  it('声调口诀 1-4 全齐', () => {
    expect(Object.keys(TONE_MNEMONICS).length).toBe(4);
    expect(TONE_MNEMONICS[1]).toContain("一声");
    expect(TONE_MNEMONICS[4]).toContain("四声");
  });
});
