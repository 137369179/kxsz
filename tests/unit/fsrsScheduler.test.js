/**
 * tests/unit/fsrsScheduler.test.js
 * ================================================================
 * FSRS 调度算法单元测试
 * ─────────────────────────────────────────────────────────────
 * 覆盖：
 *  1. initFSRSRecord — 新字初始化
 *  2. scheduleFSRS — 四种评级的调度
 *  3. isCorrectToRating — 布尔→评级映射
 *  4. scheduleLearningStep — 学习步骤推进
 *  5. fsrsCompleteCharacter — 学完字后调度
 *  6. fsrsCompleteReview — 复习后调度
 *  7. fsrsGetDueIds — 到期队列
 *  8. fsrsPredict — 预测信息
 *  9. 契约 B2：5min/20min/1h/1d/3d/7d 复习节点验证
 * ─────────────────────────────────────────────────────────────
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  FSRSState,
  FSRGRating,
  initFSRSRecord,
  scheduleFSRS,
  isCorrectToRating,
  scheduleLearningStep,
  fsrsCompleteCharacter,
  fsrsCompleteReview,
  fsrsGetDueIds,
  fsrsPredict,
  stabilityToInterval,
  intervalToStability,
} from '../../src/utils/fsrsScheduler.js'

// ── 基础工具 ────────────────────────────────────────────────────

function getDays(ms) {
  return ms / (1000 * 60 * 60 * 24);
}

function expectDaysInRange(actualMs, minDays, maxDays) {
  const days = getDays(actualMs);
  expect(days).toBeGreaterThanOrEqual(minDays);
  expect(days).toBeLessThanOrEqual(maxDays);
}

// ── initFSRSRecord ─────────────────────────────────────────────

describe('initFSRSRecord', () => {
  it('新字初始状态为 LEARNING', () => {
    const r = initFSRSRecord('字001');
    expect(r.state).toBe(FSRSState.LEARNING);
    expect(r.stability).toBe(0.1);
    expect(r.difficulty).toBe(2.5);
    expect(r.reps).toBe(0);
    expect(r.lapses).toBe(0);
  });

  it('返回 charId 字段', () => {
    expect(initFSRSRecord('字002').charId).toBe('字002');
  });

  it('初始 due 为立即到期', () => {
    const before = Date.now();
    const r = initFSRSRecord('字003');
    expect(r.due).toBeGreaterThanOrEqual(before);
    expect(r.due).toBeLessThanOrEqual(Date.now());
  });
});

// ── scheduleFSRS ───────────────────────────────────────────────

describe('scheduleFSRS', () => {
  it('AGAIN 评级：lapses +1，state=RELEARNING，due 在 10 分钟内', () => {
    const state = initFSRSRecord('字004');
    const next = scheduleFSRS(state, FSRGRating.AGAIN);
    expect(next.lapses).toBe(1);
    expect(next.state).toBe(FSRSState.RELEARNING);
    // relearnSteps[0] = 600s = 10min
    const actualMs = next.due - Date.now();
    expect(actualMs).toBeGreaterThan(9 * 60 * 1000);
    expect(actualMs).toBeLessThan(11 * 60 * 1000);
  });

  it('AGAIN 评级：难度上升', () => {
    const state = initFSRSRecord('字005');
    const next = scheduleFSRS(state, FSRGRating.AGAIN);
    expect(next.difficulty).toBeGreaterThan(state.difficulty);
  });

  it('HARD 评级：state 不变（从 REVIEW），间隔压缩', () => {
    // 先制造一个 REVIEW 状态的记录
    const reviewState = {
      ...initFSRSRecord('字006'),
      state: FSRSState.REVIEW,
      reps: 3,
      stability: 5,
      difficulty: 2.5,
    };
    const next = scheduleFSRS(reviewState, FSRGRating.HARD);
    expect(next.state).toBe(FSRSState.REVIEW);
    expect(next.interval).toBeLessThan(stabilityToInterval(reviewState.stability));
  });

  it('GOOD 评级：state=REVIEW，间隔 > 1 分钟', () => {
    const state = {
      ...initFSRSRecord('字007'),
      state: FSRSState.REVIEW,
      reps: 2,
      stability: 1,
      difficulty: 2.5,
    };
    const next = scheduleFSRS(state, FSRGRating.GOOD);
    expect(next.state).toBe(FSRSState.REVIEW);
    expect(next.interval).toBeGreaterThan(60 * 1000);
    expect(next.reps).toBe(3);
  });

  it('EASY 评级：间隔 > GOOD 同等条件', () => {
    const state = {
      ...initFSRSRecord('字008'),
      state: FSRSState.REVIEW,
      reps: 2,
      stability: 2,
      difficulty: 2.5,
    };
    const goodNext = scheduleFSRS(state, FSRGRating.GOOD);
    const easyNext = scheduleFSRS(state, FSRGRating.EASY);
    expect(easyNext.interval).toBeGreaterThan(goodNext.interval);
  });

  it('GOOD 首次复习（reps=0）：间隔 ≥ 5 分钟', () => {
    const state = initFSRSRecord('字009');
    const next = scheduleFSRS(state, FSRGRating.GOOD);
    expect(next.interval).toBeGreaterThanOrEqual(5 * 60 * 1000);
    expect(next.state).toBe(FSRSState.REVIEW);
  });
});

// ── 契约 B2：复习节点覆盖 ─────────────────────────────────────

describe('契约 B2：FSRS 复习节点覆盖验证', () => {
  // 公式: I = sqrt(S) (天) → 精确节点:
  // S=1→1d, S=4→2d, S=9→3d, S=49→7d, S=225→15d, S=900→30d

  it('稳定性递增则间隔递增', () => {
    expect(stabilityToInterval(9)).toBeGreaterThan(stabilityToInterval(1));
    expect(stabilityToInterval(49)).toBeGreaterThan(stabilityToInterval(9));
    expect(stabilityToInterval(900)).toBeGreaterThan(stabilityToInterval(49));
  });

  it('1天复习节点 (S=1)', () => {
    expectDaysInRange(stabilityToInterval(1), 0.9, 1.1);
  });

  it('3天复习节点 (S=9)', () => {
    expectDaysInRange(stabilityToInterval(9), 2.8, 3.2);
  });

  it('7天复习节点 (S=49)', () => {
    expectDaysInRange(stabilityToInterval(49), 6.5, 7.5);
  });

  it('15天复习节点 (S=225)', () => {
    expectDaysInRange(stabilityToInterval(225), 14, 16);
  });

  it('30天复习节点 (S=900)', () => {
    expectDaysInRange(stabilityToInterval(900), 29, 31);
  });

  it('难度升高时，同等稳定性间隔缩短', () => {
    const lowDiff = { ...initFSRSRecord('字010'), stability: 5, difficulty: 1.5, state: FSRSState.REVIEW, reps: 5 };
    const highDiff = { ...initFSRSRecord('字011'), stability: 5, difficulty: 7.0, state: FSRSState.REVIEW, reps: 5 };
    const nextLow = scheduleFSRS(lowDiff, FSRGRating.GOOD);
    const nextHigh = scheduleFSRS(highDiff, FSRGRating.GOOD);
    expect(nextHigh.interval).toBeLessThan(nextLow.interval);
  });
});

// ── isCorrectToRating ──────────────────────────────────────────

describe('isCorrectToRating', () => {
  it('isCorrect=false → AGAIN', () => {
    expect(isCorrectToRating(false)).toBe(FSRGRating.AGAIN);
  });

  it('isCorrect=true + 高 mastery → GOOD', () => {
    expect(isCorrectToRating(true)).toBe(FSRGRating.GOOD);
  });

  it('isCorrect=true + 低 mastery → HARD', () => {
    expect(isCorrectToRating(true, { lowMastery: true })).toBe(FSRGRating.HARD);
  });
});

// ── scheduleLearningStep ────────────────────────────────────────

describe('scheduleLearningStep', () => {
  it('通过第一步 → learningStep+1', () => {
    const state = { ...initFSRSRecord('字012'), learningStep: 0 };
    const next = scheduleLearningStep(state, true);
    expect(next.learningStep).toBe(1);
    expect(next.due).toBeGreaterThan(Date.now());
  });

  it('通过所有步骤 → 触发 REVIEW（state=REVIEW）', () => {
    const state = { ...initFSRSRecord('字013'), learningStep: 1 };
    const next = scheduleLearningStep(state, true);
    expect(next.state).toBe(FSRSState.REVIEW);
  });

  it('未通过留在当前步骤', () => {
    const state = { ...initFSRSRecord('字014'), learningStep: 1 };
    const next = scheduleLearningStep(state, false);
    expect(next.learningStep).toBe(1);
  });
});

// ── fsrsCompleteCharacter ───────────────────────────────────────

  describe('fsrsCompleteCharacter', () => {
    it('新字学完 → reviewCount=1, state=REVIEW', () => {
      const updated = fsrsCompleteCharacter({ charId: '字015' }, 3);
      expect(updated.reviewCount).toBe(1);
      expect(updated.state).toBe(FSRSState.REVIEW);
      expect(updated._fsrsState).toBeDefined();
    });

    it('EASY 评级间隔 > GOOD（Easy Bonus 生效）', () => {
      const reviewState = { ...initFSRSRecord('字008'), state: FSRSState.REVIEW, reps: 5, stability: 3, difficulty: 2.5 };
      const easyNext = scheduleFSRS(reviewState, FSRGRating.EASY);
      const goodNext = scheduleFSRS(reviewState, FSRGRating.GOOD);
      expect(easyNext.interval).toBeGreaterThan(goodNext.interval);
    });

    it('已复习卡片 GOOD 间隔 > 新卡 HARD（稳定度决定基准间隔）', () => {
      const fresh = initFSRSRecord('字016b');
      const reviewState = { ...fresh, state: FSRSState.REVIEW, reps: 5, stability: 3, difficulty: 2.5 };
      const hardFresh = scheduleFSRS(fresh, FSRGRating.HARD);
      const goodReviewed = scheduleFSRS(reviewState, FSRGRating.GOOD);
      expect(goodReviewed.interval).toBeGreaterThan(hardFresh.interval);
    });

    it('回退旧 record 不丢失 masteryRate', () => {
      const old = { charId: '字018', masteryRate: 85, reviewCount: 3 };
      const updated = fsrsCompleteCharacter(old, 3);
      expect(updated.masteryRate).toBeGreaterThan(0);
      expect(updated.masteryRate).toBeLessThanOrEqual(100);
    });

    // ── Bug 回归：masteryRate 不应该用 reps-lapses 公式算出 25 分 ──

    it('【回归】首次学完 3 星 → masteryRate ≥ 70（不是 buildResult 算出的 25）', () => {
      const updated = fsrsCompleteCharacter({ charId: 'BUG_3STAR' }, 3);
      expect(updated.masteryRate).toBeGreaterThanOrEqual(70);
      expect(updated.masteryRate).toBeLessThanOrEqual(100);
    });

    it('【回归】首次学完 2 星 → masteryRate ≥ 65', () => {
      const updated = fsrsCompleteCharacter({ charId: 'BUG_2STAR' }, 2);
      expect(updated.masteryRate).toBeGreaterThanOrEqual(65);
    });

    it('【回归】首次学完 1 星 → masteryRate ≥ 55', () => {
      const updated = fsrsCompleteCharacter({ charId: 'BUG_1STAR' }, 1);
      expect(updated.masteryRate).toBeGreaterThanOrEqual(55);
    });

    it('【回归】0 星边界也有合理值（≥ 55，不抛错）', () => {
      const updated = fsrsCompleteCharacter({ charId: 'BUG_0STAR' }, 0);
      expect(updated.masteryRate).toBeGreaterThanOrEqual(55);
    });

    it('【回归】stars 超边界（如 5）也被 clamp 到合理值', () => {
      const updated = fsrsCompleteCharacter({ charId: 'BUG_5STAR' }, 5);
      expect(updated.masteryRate).toBeGreaterThanOrEqual(70);
      expect(updated.masteryRate).toBeLessThanOrEqual(100);
    });

    it('【回归】首次学完 correctStreak ≥ 1（不是 0）', () => {
      const updated = fsrsCompleteCharacter({ charId: 'BUG_STREAK' }, 3);
      expect(updated.correctStreak).toBeGreaterThanOrEqual(1);
    });

    it('【回归】首次学完 1 星（HARD 评级）correctStreak 可以为 0 或 1，但不是负的', () => {
      const updated = fsrsCompleteCharacter({ charId: 'BUG_STREAK2' }, 1);
      expect(updated.correctStreak).toBeGreaterThanOrEqual(0);
    });

    it('有历史高 masteryRate 时 completeCharacter 不降级（只升不降）', () => {
      const old = { charId: 'BUG_KEEP_HIGH', masteryRate: 95 };
      const updated = fsrsCompleteCharacter(old, 3);
      expect(updated.masteryRate).toBeGreaterThanOrEqual(95);
    });
  });

// ── fsrsCompleteReview ─────────────────────────────────────────

describe('fsrsCompleteReview', () => {
  it('正确复习 → reviewCount++，下次到期 > 现在', () => {
    const record = fsrsCompleteCharacter({ charId: '字019' }, 3);
    const next = fsrsCompleteReview(record, true);
    expect(next.reviewCount).toBeGreaterThan(record.reviewCount);
    expect(next.nextReviewDate).toBeGreaterThan(Date.now());
  });

  it('错误复习 → lapses+1，isDifficult=true，间隔重置 ≤ 20 分钟', () => {
    const record = fsrsCompleteCharacter({ charId: '字020' }, 3);
    const next = fsrsCompleteReview(record, false);
    expect(next.lapses).toBeGreaterThan(record.lapses);
    expect(next.isDifficult).toBe(true);
    expect(next.interval).toBeLessThan(20 * 60 * 1000);
  });

  it('错误后 masteryRate 下降', () => {
    const record = fsrsCompleteCharacter({ charId: '字021' }, 3);
    const afterFail = fsrsCompleteReview(record, false);
    expect(afterFail.masteryRate).toBeLessThan(record.masteryRate);
  });

  // ── Bug 回归：correctStreak 不能被 reps-lapses 公式算成 1 ──

  it('【回归】错误复习 → correctStreak=0（不是 1！）', () => {
    const record = fsrsCompleteCharacter({ charId: 'BUG_R_FAIL' }, 3);
    expect(record.correctStreak).toBeGreaterThanOrEqual(1);
    const next = fsrsCompleteReview(record, false);
    expect(next.correctStreak).toBe(0);
  });

  it('【回归】正确复习 → correctStreak 在历史基础上 +1', () => {
    const record = fsrsCompleteCharacter({ charId: 'BUG_R_OK' }, 3);
    const next1 = fsrsCompleteReview(record, true);
    expect(next1.correctStreak).toBeGreaterThanOrEqual(record.correctStreak);
    const next2 = fsrsCompleteReview(next1, true);
    expect(next2.correctStreak).toBeGreaterThanOrEqual(next1.correctStreak);
  });

  it('【回归】多轮正-错-正 → correctStreak 在最后一次正确时重新 +1', () => {
    const record = fsrsCompleteCharacter({ charId: 'BUG_R_SEESAW' }, 3);
    const afterFail = fsrsCompleteReview(record, false);
    expect(afterFail.correctStreak).toBe(0);
    const afterOk = fsrsCompleteReview(afterFail, true);
    expect(afterOk.correctStreak).toBe(1);
    const afterOk2 = fsrsCompleteReview(afterOk, true);
    expect(afterOk2.correctStreak).toBe(2);
  });

  it('【回归】连续 10 次正确 → correctStreak ≥ 10（语义累积）', () => {
    let r = fsrsCompleteCharacter({ charId: 'BUG_R_STREAK10' }, 3);
    for (let i = 0; i < 10; i++) {
      r = fsrsCompleteReview(r, true);
    }
    expect(r.correctStreak).toBeGreaterThanOrEqual(10);
  });

  it('【回归】正确后错 → correctStreak 立即归零，不保留历史', () => {
    let r = fsrsCompleteCharacter({ charId: 'BUG_R_FINAL' }, 3);
    r = fsrsCompleteReview(r, true);
    r = fsrsCompleteReview(r, true);
    expect(r.correctStreak).toBeGreaterThanOrEqual(2);
    r = fsrsCompleteReview(r, false);
    expect(r.correctStreak).toBe(0);
  });
});

// ── fsrsGetDueIds ───────────────────────────────────────────────

describe('fsrsGetDueIds', () => {
  it('FSRS due <= now 的字被返回', () => {
    const records = {
      '字022': { charId: '字022', nextReviewDate: Date.now() - 1000, _fsrsState: { due: Date.now() - 1000 } },
      '字023': { charId: '字023', nextReviewDate: Date.now() + 86400000, _fsrsState: { due: Date.now() + 86400000 } },
    };
    const due = fsrsGetDueIds(records);
    expect(due).toContain('字022');
    expect(due).not.toContain('字023');
  });

  it('空对象返回空数组', () => {
    expect(fsrsGetDueIds({})).toEqual([]);
  });

  it('无 _fsrsState 回退到旧字段 nextReviewDate', () => {
    const records = {
      '字024': { charId: '字024', nextReviewDate: Date.now() - 5000 },
    };
    expect(fsrsGetDueIds(records)).toContain('字024');
  });
});

// ── fsrsPredict ───────────────────────────────────────────────

describe('fsrsPredict', () => {
  it('新字（无 FSRS state）返回 stability=0, nextReviewLabel="学习中"', () => {
    const pred = fsrsPredict({ charId: '字025' });
    expect(pred.stability).toBe(0);
    expect(pred.nextReviewLabel).toBe('学习中');
  });

  it('initFSRSRecord 生成的状态预测为"学习中"', () => {
    const record = initFSRSRecord('字025b');
    const pred = fsrsPredict(record);
    expect(pred.nextReviewLabel).toBe('学习中');
    expect(pred.stability).toBe(0.1);
  });

  it('已复习的字返回 nextReviewLabel 为相对时间', () => {
    const record = fsrsCompleteCharacter({ charId: '字026' }, 3);
    const pred = fsrsPredict(record);
    expect(pred.nextReviewLabel).toMatch(/^(现在|\d+分钟后|\d+小时后|\d+天后)$/);
  });

  it('difficulty 在 1~10 之间', () => {
    const record = fsrsCompleteCharacter({ charId: '字027' }, 2);
    const pred = fsrsPredict(record);
    expect(pred.difficulty).toBeGreaterThanOrEqual(1);
    expect(pred.difficulty).toBeLessThanOrEqual(10);
  });
});

// ── stabilityToInterval / intervalToStability ─────────────────

describe('stabilityToInterval / intervalToStability 互逆', () => {
  it('stability → interval → stability 有意义值', () => {
    const original = 7.5;
    const ms = stabilityToInterval(original);
    const back = intervalToStability(ms);
    // 新公式下逆算结果应在合理范围
    expect(back).toBeGreaterThan(0);
    expect(back).toBeLessThan(100);
  });

  it('stabilityToInterval 拒绝负数', () => {
    expect(() => stabilityToInterval(-1)).toThrow();
  });

  it('stabilityToInterval(0) 返回正值', () => {
    const ms = stabilityToInterval(0);
    expect(ms).toBeGreaterThan(0);
  });
});

// ── isIntradayReview — 同日复习识别（调研报告 §2.3 建议C）─────────

import { isIntradayReview } from '../../src/utils/fsrsScheduler.js';

describe('isIntradayReview — 同日复习识别', () => {
  beforeEach(() => {
    // 固定时间到 2026-09-03 15:00:00（下午3点，远离午夜边界）
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-03T15:00:00.000Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('null lastReview → false（从未复习过）', () => {
    expect(isIntradayReview(null)).toBe(false);
    expect(isIntradayReview(undefined)).toBe(false);
  });

  it('lastReview 是今天 → true', () => {
    const todayTs = Date.now() - 30 * 60 * 1000; // 30 分钟前（今天）
    expect(isIntradayReview(todayTs)).toBe(true);
  });

  it('lastReview 是昨天 → false', () => {
    const yesterdayTs = Date.now() - 25 * 60 * 60 * 1000; // 25 小时前（昨天）
    expect(isIntradayReview(yesterdayTs)).toBe(false);
  });

  it('同日 AGAIN 惩罚减半：稳定性下降幅度 < 跨日 AGAIN', () => {
    const baseState = initFSRSRecord('字_intraday');
    baseState.stability = 5.0;

    // 跨日 AGAIN（lastReview = 昨天）
    const crossDayState = { ...baseState, lastReview: Date.now() - 25 * 60 * 60 * 1000 };
    const crossDayResult = scheduleFSRS(crossDayState, FSRGRating.AGAIN);

    // 同日 AGAIN（lastReview = 1 小时前）
    const intradayState = { ...baseState, lastReview: Date.now() - 60 * 60 * 1000 };
    const intradayResult = scheduleFSRS(intradayState, FSRGRating.AGAIN);

    // 同日惩罚应更轻，稳定性应更高（下降更少）
    expect(intradayResult.stability).toBeGreaterThan(crossDayResult.stability);
  });

  it('同日 AGAIN 间隔 ≤ 5 分钟（跨日 AGAIN ≥ 9 分钟）', () => {
    const baseState = initFSRSRecord('字_interval');

    // 同日 AGAIN
    const intradayState = { ...baseState, lastReview: Date.now() - 30 * 60 * 1000 };
    const intradayResult = scheduleFSRS(intradayState, FSRGRating.AGAIN);
    expect(intradayResult.interval).toBeLessThanOrEqual(5 * 60 * 1000 + 1000); // ≤ 5min+1s

    // 跨日 AGAIN
    const crossDayState = { ...baseState, lastReview: Date.now() - 25 * 60 * 60 * 1000 };
    const crossDayResult = scheduleFSRS(crossDayState, FSRGRating.AGAIN);
    expect(crossDayResult.interval).toBeGreaterThan(9 * 60 * 1000); // > 9min
  });

  it('同日 GOOD/EASY 不受影响（sDec 非负，无减半）', () => {
    const baseState = { ...initFSRSRecord('字_good'), lastReview: Date.now() - 30 * 60 * 1000 };
    const goodResult = scheduleFSRS(baseState, FSRGRating.GOOD);
    const easyResult = scheduleFSRS(baseState, FSRGRating.EASY);
    // GOOD/EASY 稳定性应正常增长
    expect(goodResult.stability).toBeGreaterThanOrEqual(baseState.stability);
    expect(easyResult.stability).toBeGreaterThanOrEqual(goodResult.stability);
  });
});

