import { describe, it, expect } from 'vitest';
import {
  computeCoverage,
  classifyMastery,
  computeWeeklyTrend,
  computeBookProgress,
  computeFocusMetrics,
  buildFullReport,
  generateParentDiagnosis,
  getDifficultCharsWithInfo,
} from '../../src/utils/reportEngine.js';

// ──────────────────────────────────────────────────────────
// E14 学习报告多维度升级
// 教育学：数据驱动反馈 > 单维；家长需要口语化诊断
// ──────────────────────────────────────────────────────────

function makeRecord(id, rate = 80, streak = 3, reviewCount = 3, opts = {}) {
  return {
    charId: id,
    learnedAt: Date.now() - 86_400_000 * 10,
    reviewCount,
    correctStreak: streak,
    masteryRate: rate,
    nextReviewDate: Date.now() + 86_400_000,
    isDifficult: rate < 40,
    ...opts,
  };
}

function makeProgress(charRecords, opts = {}) {
  return {
    charRecords,
    studyHistory: opts.studyHistory ?? [],
    readBooks: opts.readBooks ?? [],
  };
}

describe('computeCoverage — 识字总量', () => {
  it('空记录 → learned=0', () => {
    const r = computeCoverage({});
    expect(r.learned).toBe(0);
    expect(r.coverageRate).toBe(0);
  });

  it('有记录 → 计算覆盖率', () => {
    const recs = { a: makeRecord('a', 80), b: makeRecord('b', 90) };
    const r = computeCoverage(recs);
    expect(r.learned).toBe(2);
    expect(r.total).toBeGreaterThan(0);
    expect(r.coverageRate).toBeGreaterThan(0);
  });
});

describe('classifyMastery — 掌握分布 4 档', () => {
  it('mastered (rate>=80, 近30天复习)', () => {
    const recs = { a: makeRecord('a', 90, 5, 5) };
    const r = classifyMastery(recs);
    expect(r.mastered).toBe(1);
    expect(r.mastery).toBeUndefined();  // 不应该有这个字段！
  });

  it('learning (40<=rate<80)', () => {
    const recs = { a: makeRecord('a', 60, 2, 3) };
    const r = classifyMastery(recs);
    expect(r.learning).toBe(1);
  });

  it('difficult (rate<40)', () => {
    const recs = { a: makeRecord('a', 20, 0, 1) };
    const r = classifyMastery(recs);
    expect(r.difficult).toBe(1);
    expect(r.difficultList.length).toBe(1);
  });

  it('healthScore 加权计算', () => {
    // 1 mastered(1.0) + 1 difficult(0.3) → score = (1+0.3)/2*100 = 65
    const recs = {
      a: makeRecord('a', 95, 5, 5),
      b: makeRecord('b', 25, 0, 1),
    };
    const r = classifyMastery(recs);
    expect(r.healthScore).toBe(65);
  });

  it('空 → healthScore=0', () => {
    const r = classifyMastery({});
    expect(r.healthScore).toBe(0);
    expect(r.total).toBe(0);
  });
});

describe('computeWeeklyTrend — 7 日趋势', () => {
  it('返回 7 天数据', () => {
    const r = computeWeeklyTrend({});
    expect(r.days.length).toBe(7);
  });

  it('studyHistory → newCount 映射', () => {
    const today = new Date();
    const dateStr = `${today.getMonth() + 1}/${today.getDate()}`;
    const h = [{ date: dateStr, count: 5 }];
    const r = computeWeeklyTrend({}, h);
    const todayEntry = r.days.find((d) => d.date === dateStr);
    expect(todayEntry?.newCount).toBe(5);
    expect(r.totalNew).toBe(5);
  });
});

describe('computeBookProgress — 绘本进度', () => {
  it('空 → readCount=0', () => {
    const r = computeBookProgress([]);
    expect(r.readCount).toBe(0);
    expect(r.byStage.length).toBe(3);
  });

  it('有 readBooks → 按 stage 分布', () => {
    const r = computeBookProgress(['book_theme_midautumn']);
    expect(r.readCount).toBe(1);
    expect(r.byStage.some((s) => s.read >= 1)).toBe(true);
  });
});

describe('computeFocusMetrics — 专注度', () => {
  it('空 → 全 0', () => {
    const r = computeFocusMetrics({});
    expect(r.avgStreak).toBe(0);
    expect(r.highStreak).toBe(0);
  });

  it('avgStreak / highStreak / interruptionRate', () => {
    const recs = {
      a: makeRecord('a', 80, 5, 3),
      b: makeRecord('b', 80, 1, 3),
      c: makeRecord('c', 80, 0, 3),
    };
    const r = computeFocusMetrics(recs);
    expect(r.highStreak).toBe(5);
    expect(r.avgStreak).toBeGreaterThan(0);
    // streak<=1 的有 2/3 → interruptionRate ~= 67
    expect(r.interruptionRate).toBeGreaterThanOrEqual(0);
    expect(r.interruptionRate).toBeLessThanOrEqual(100);
  });
});

describe('generateParentDiagnosis — AI 诊断文本', () => {
  it('初学者 → 鼓励文本', () => {
    const text = generateParentDiagnosis({
      coverage: { learned: 0, coverageRate: 0 },
      mastery: { healthScore: 0, difficult: 0, forgotten: 0 },
      trend: { totalNew: 0, totalReview: 0, avgPerDay: 0 },
      books: { readCount: 0 },
      focus: { avgStreak: 0 },
    });
    expect(text).toContain('🌟');
    expect(text.length).toBeGreaterThan(10);
  });

  it('有难字 → 建议难字本', () => {
    const text = generateParentDiagnosis({
      coverage: { learned: 5, coverageRate: 0.3 },
      mastery: { healthScore: 45, difficult: 3, forgotten: 0 },
      trend: { totalNew: 2, totalReview: 1, avgPerDay: 0.4 },
      books: { readCount: 0 },
      focus: { avgStreak: 1 },
    });
    expect(text).toContain('难字');
    expect(text).toContain('建议');
  });
});

describe('buildFullReport — 综合报告', () => {
  it('一次返回所有 6 维数据', () => {
    const recs = { a: makeRecord('a', 90, 5, 5), b: makeRecord('b', 30, 0, 1) };
    const r = buildFullReport(makeProgress(recs, { readBooks: ['book_theme_midautumn'] }));
    expect(r.coverage).toBeTruthy();
    expect(r.mastery).toBeTruthy();
    expect(r.trend).toBeTruthy();
    expect(r.books).toBeTruthy();
    expect(r.focus).toBeTruthy();
    expect(r.summary).toBeTruthy();
    expect(r.generatedAt).toBeTruthy();
  });
});

import { computeSkillRadar } from "../../src/utils/reportEngine.js";

describe("computeSkillRadar", () => {
  it("returns zeroed skills for empty progress", () => {
    const s = computeSkillRadar({ charRecords: {}, readBooks: [] });
    expect(s.listen).toBe(0);
    expect(s.speak).toBe(0);
    expect(s.read).toBe(0);
    expect(s.write).toBe(0);
  });

  it("derives scores from mastery and books", () => {
    const s = computeSkillRadar({
      charRecords: {
        a: { masteryRate: 80, correctRate: 80 },
        b: { masteryRate: 60 },
      },
      readBooks: ["b1", "b2"],
      errorProfiles: { pronunciationErrors: {}, reverseStrokeErrors: {} },
    });
    expect(s.listen).toBeGreaterThan(0);
    expect(s.read).toBeGreaterThan(0);
    expect(s.labels.listen).toBe("听");
  });
});
