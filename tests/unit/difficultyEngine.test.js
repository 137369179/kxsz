import { describe, it, expect } from 'vitest';
import {
  DIFFICULTY_LEVELS,
  computeOverallDifficulty,
  realtimeAdjust,
  getQuestionWeights,
  buildSelectionStrategy,
  computeAdaptiveProfile,
} from '../../src/utils/difficultyEngine.js';

// ──────────────────────────────────────────────────────────
// E15 自适应难度
// 教育学：维果茨基近发展区 + 70-85% 黄金正确率
// ──────────────────────────────────────────────────────────

function makeRecords(rates) {
  const recs = {};
  for (let i = 0; i < rates.length; i++) {
    recs['char_' + i] = {
      charId: 'char_' + i,
      masteryRate: rates[i],
      correctStreak: rates[i] > 70 ? 3 : 1,
      reviewCount: Math.floor(i / 2) + 1,
      nextReviewDate: Date.now() + (rates[i] < 70 ? -86400000 : 86400000),
      learnedAt: Date.now() - 86400000 * 10,
    };
  }
  return recs;
}

describe('DIFFICULTY_LEVELS', () => {
  it('EASY / MEDIUM / HARD 三档', () => {
    expect(Object.values(DIFFICULTY_LEVELS)).toEqual(["easy", "medium", "hard"]);
  });
});

describe('computeOverallDifficulty', () => {
  it('空记录 → easy', () => {
    const r = computeOverallDifficulty({});
    expect(r.level).toBe(DIFFICULTY_LEVELS.EASY);
  });

  it('平均 68% → medium', () => {
    const rates = [30, 50, 55, 60, 65, 70, 80, 85, 90, 95];
    const r = computeOverallDifficulty(makeRecords(rates), 5);
    expect(r.level).toBe(DIFFICULTY_LEVELS.MEDIUM);
  });

  it('平均 < 50% → easy 保底', () => {
    const rates = [20, 30, 35, 40, 45];
    const r = computeOverallDifficulty(makeRecords(rates), 5);
    expect(r.level).toBe(DIFFICULTY_LEVELS.EASY);
  });

  it('平均 > 75% 且 hard 占比 > 15% + 年龄 8 → hard', () => {
    // 15 条：10 easy + 2 medium + 3 hard
    const rates = [90, 95, 88, 92, 97, 90, 85, 89, 94, 91, 65, 70, 20, 20, 20];
    const r = computeOverallDifficulty(makeRecords(rates), 8);
    expect(r.level).toBe(DIFFICULTY_LEVELS.HARD);
  });

  it('3 岁：禁止 hard', () => {
    const rates = [90, 95, 88, 92, 97, 30, 90, 85, 89, 94];
    const r = computeOverallDifficulty(makeRecords(rates), 3);
    expect(r.level).not.toBe(DIFFICULTY_LEVELS.HARD);
  });

  it('年龄校准：3 岁 masteryRate 更低', () => {
    const recs = { a: { charId: 'a', masteryRate: 78 } };
    const r5 = computeOverallDifficulty(recs, 5);
    const r3 = computeOverallDifficulty(recs, 3);
    expect(r3.avgMasteryRate).toBeLessThan(r5.avgMasteryRate);
  });
});

describe('realtimeAdjust', () => {
  it('规则1: 正确率≥85% + streak≥4 → 升级', () => {
    const r = realtimeAdjust([true, true, true, true, true], 'medium', 5);
    expect(r.action).toBe("increase");
    expect(r.nextLevel).toBe("hard");
  });

  it('规则2: 正确率≤50% → 降级', () => {
    const r = realtimeAdjust([true, true, false, false, false], 'medium', 0);
    expect(r.action).toBe("decrease");
  });

  it('规则3: 连续 2 错 → 立即降级', () => {
    const r = realtimeAdjust([true, true, false, false], 'medium', 0);
    expect(r.action).toBe("decrease");
    expect(r.nextLevel).toBe("easy");
  });

  it('规则4: 正确率持续高于黄金区 → 微升', () => {
    const r = realtimeAdjust([true, true, true, true, true], 'easy', 3);
    expect(r.action).toBe("increase");
  });

  it('规则5: 黄金区 70-85% → hold', () => {
    const r = realtimeAdjust([true, true, false, true, true], 'medium', 2);
    expect(r.action).toBe("hold");
    expect(r.reason).toContain("黄金区");
  });

  it('easy 不能再降', () => {
    const r = realtimeAdjust([false, false, false], 'easy', 0);
    expect(r.nextLevel).toBe("easy");
  });

  it('hard 不能再升', () => {
    const r = realtimeAdjust([true, true, true, true, true], 'hard', 6);
    expect(r.nextLevel).toBe("hard");
  });

  it('空 results → hold', () => {
    const r = realtimeAdjust([], 'medium');
    expect(r.action).toBe("hold");
  });
});

describe('getQuestionWeights', () => {
  it('EASY: sound_to_char 占比最高（recognition）', () => {
    const w = getQuestionWeights('easy');
    const sound = w.find((x) => x.type === 'sound_to_char');
    expect(sound.weight).toBeGreaterThanOrEqual(30);
  });

  it('HARD: word_building + char_to_char 占比升高', () => {
    const w = getQuestionWeights('hard');
    const words = w.find((x) => x.type === 'word_building');
    const charChar = w.find((x) => x.type === 'char_to_char');
    expect(words.weight + charChar.weight).toBeGreaterThanOrEqual(30);
  });

  it('权重总和 ≈ 100', () => {
    for (const level of ['easy', 'medium', 'hard']) {
      const sum = getQuestionWeights(level).reduce((s, w) => s + w.weight, 0);
      expect(sum).toBeGreaterThanOrEqual(95);
      expect(sum).toBeLessThanOrEqual(105);
    }
  });
});

describe('buildSelectionStrategy', () => {
  it('EASY: 先已掌握（建立信心）', () => {
    const recs = makeRecords([30, 60, 90, 85]);
    const s = buildSelectionStrategy(recs, 'easy');
    expect(s.strategy).toContain("巩固");
    expect(s.priorityIds[0]).toBe("char_2");  // masteryRate=90
  });

  it('MEDIUM: 难字优先', () => {
    const recs = makeRecords([30, 60, 90, 95]);
    const s = buildSelectionStrategy(recs, 'medium');
    expect(s.difficultCount).toBe(1);
    expect(s.priorityIds[0]).toBe("char_0");  // masteryRate=30
  });

  it('HARD: 快速推进', () => {
    const recs = makeRecords([30, 50, 80, 90]);
    const s = buildSelectionStrategy(recs, 'hard');
    expect(s.strategy).toContain("快速推进");
  });
});

describe('computeAdaptiveProfile', () => {
  it('输出 5 维数据', () => {
    const recs = makeRecords([50, 60, 70, 80, 90]);
    const p = computeAdaptiveProfile(recs, 6, [true, true, false, true], 2);
    expect(p.overall).toBeTruthy();
    expect(p.realtime).toBeTruthy();
    expect(p.weights).toBeTruthy();
    expect(p.selection).toBeTruthy();
    expect(p.effectiveLevel).toBeTruthy();
  });
});
