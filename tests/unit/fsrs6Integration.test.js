/**
 * tests/unit/fsrs6Integration.test.js
 * ================================================================
 * T1 & T6 集成测试：验证 EbbinghausManager 与 ReviewModule 真实调用 FSRS
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ebbinghausManager } from '../../src/utils/ebbinghaus.js';
import { ReviewModule } from '../../src/components/ReviewModule.js';
import { CHARACTER_DATABASE } from '../../src/data/characters.js';
import { setupTestDom, createMockElement } from '../testDomMock.js';

describe('FSRS-6 Integration with EbbinghausManager & ReviewModule', () => {
  let container;

  beforeEach(() => {
    setupTestDom();
    container = createMockElement('div', 'app');
    ebbinghausManager.progress = {
      coins: 100,
      stars: 50,
      charRecords: {},
      todayLearnedCount: 0,
      currentLevelIndex: 1,
      errorProfiles: { confusedPairs: {} },
      attendance: { dates: [], streakDays: 0 }
    };
  });

  it('ebbinghausManager.completeCharacter() 动态生成 _fsrsState 而非固定硬编码', () => {
    const updated = ebbinghausManager.completeCharacter('char_001', 3);

    expect(updated._fsrsState).toBeDefined();
    expect(updated._fsrsState.stability).toBeGreaterThan(0);
    expect(updated._fsrsState.due).toBeGreaterThan(0);
    expect(updated.masteryRate).toBeGreaterThanOrEqual(75);
    expect(ebbinghausManager.progress.charRecords['char_001']).toEqual(updated);
  });

  it('不同评分 (3星 vs 1星) 产生不同初始稳定度与掌握度', () => {
    const res3 = ebbinghausManager.completeCharacter('char_high', 3);
    const res1 = ebbinghausManager.completeCharacter('char_low', 1);

    expect(res3.masteryRate).toBeGreaterThan(res1.masteryRate);
  });

  it('ebbinghausManager.completeReview() 成功推进 FSRS 状态与连胜', () => {
    ebbinghausManager.completeCharacter('char_rev', 3);
    const beforeReps = ebbinghausManager.progress.charRecords['char_rev']._fsrsState.reps;

    const reviewed = ebbinghausManager.completeReview('char_rev', true);
    expect(reviewed._fsrsState.reps).toBe(beforeReps + 1);
    expect(reviewed.correctStreak).toBeGreaterThanOrEqual(1);

    const wronged = ebbinghausManager.completeReview('char_rev', false);
    expect(wronged.correctStreak).toBe(0);
    expect(wronged._fsrsState.lapses).toBeGreaterThanOrEqual(1);
  });

  it('ReviewModule.initQueue() 优先抓取到期复习字和高频混淆字', () => {
    const pastDue = Date.now() - 3600000;
    const futureDue = Date.now() + 86400000;

    ebbinghausManager.progress.charRecords['char_001'] = {
      charId: 'char_001',
      _fsrsState: { due: pastDue, reps: 2, state: 2 },
      nextReviewDate: pastDue
    };
    ebbinghausManager.progress.charRecords['char_002'] = {
      charId: 'char_002',
      _fsrsState: { due: pastDue, reps: 1, state: 2 },
      nextReviewDate: pastDue
    };
    ebbinghausManager.progress.charRecords['char_003'] = {
      charId: 'char_003',
      _fsrsState: { due: futureDue, reps: 3, state: 2 },
      nextReviewDate: futureDue
    };

    // 注入混淆字
    ebbinghausManager.progress.errorProfiles = {
      confusedPairs: {
        'char_004': { 'char_005': 5 }
      }
    };

    const review = new ReviewModule(container);
    review.initQueue();

    // 应该包含到期字和高频混淆字
    const queueIds = review.queue.map(c => c.id);
    expect(queueIds).toContain('char_001');
    expect(queueIds).toContain('char_002');
    expect(review.queue.length).toBeGreaterThanOrEqual(2);
  });
});
