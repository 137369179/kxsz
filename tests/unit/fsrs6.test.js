/**
 * tests/unit/fsrs6.test.js
 * ================================================================
 * FSRS-6 (21 参数) 核心算法与闭式公式单元测试
 * ─────────────────────────────────────────────────────────────
 * 验证：
 *   1. FSRS_6_DEFAULT_WEIGHTS 包含 21 个数值参数且 w20=0.1542
 *   2. calculateRetrievabilityFSRS6 幂律遗忘曲线：
 *      - t = 0 时 R = 1.0
 *      - t = S 时 R 严格等于 0.90
 *      - t > S 时 R 单调递减
 *   3. calculateIntervalFSRS6 闭式最优间隔：
 *      - desiredRetention = 0.9 时，I 严格等于 S
 *      - 目标留存率提高时，间隔缩短；目标留存率降低时，间隔延长
 *   4. getDecayForAge 年龄自适应衰减率（5岁 vs 7岁）
 *   5. fsrsPredict 输出包含 retention 字段
 * ─────────────────────────────────────────────────────────────
 */

import { describe, it, expect } from 'vitest';
import {
  FSRS_6_DEFAULT_WEIGHTS,
  calculateRetrievabilityFSRS6,
  retrievability,
  calculateIntervalFSRS6,
  getDecayForAge,
  fsrsPredict,
  initFSRSRecord,
} from '../../src/utils/fsrsScheduler.js';

describe('FSRS-6 (21 参数) 算法与闭式解测试', () => {
  it('FSRS_6_DEFAULT_WEIGHTS 包含 21 个有效浮点参数', () => {
    expect(Array.isArray(FSRS_6_DEFAULT_WEIGHTS)).toBe(true);
    expect(FSRS_6_DEFAULT_WEIGHTS.length).toBe(21);
    FSRS_6_DEFAULT_WEIGHTS.forEach((w, idx) => {
      expect(typeof w).toBe('number');
      expect(isNaN(w)).toBe(false);
    });
    // w20 是衰减因子
    expect(FSRS_6_DEFAULT_WEIGHTS[20]).toBeCloseTo(0.1542, 4);
  });

  describe('calculateRetrievabilityFSRS6 (幂律遗忘曲线)', () => {
    it('当 t = 0 时，R(0, S) 恒等于 1.0', () => {
      expect(calculateRetrievabilityFSRS6(0, 5)).toBe(1.0);
      expect(calculateRetrievabilityFSRS6(-1, 5)).toBe(1.0);
    });

    it('当 t = S 时，R(S, S) 恒等于 0.90 (90% 目标保持率)', () => {
      const stabilities = [1, 2.5, 7, 14, 30, 90];
      for (const s of stabilities) {
        const r = calculateRetrievabilityFSRS6(s, s);
        expect(r).toBeCloseTo(0.9, 4);
      }
    });

    it('当 t > S 时，R 单调递减且大于 0', () => {
      const s = 10;
      const r1 = calculateRetrievabilityFSRS6(5, s);
      const r2 = calculateRetrievabilityFSRS6(10, s);
      const r3 = calculateRetrievabilityFSRS6(20, s);
      const r4 = calculateRetrievabilityFSRS6(50, s);

      expect(r1).toBeGreaterThan(r2);
      expect(r2).toBeGreaterThan(r3);
      expect(r3).toBeGreaterThan(r4);
      expect(r4).toBeGreaterThan(0);
    });

    it('retrievability 为 calculateRetrievabilityFSRS6 的别名', () => {
      expect(retrievability(3, 10)).toBe(calculateRetrievabilityFSRS6(3, 10));
    });
  });

  describe('calculateIntervalFSRS6 (闭式最优间隔解)', () => {
    it('当 desiredRetention = 0.9 时，最优间隔天数 I 严格等于 S 天', () => {
      const stabilities = [1, 3, 7, 15, 30];
      for (const s of stabilities) {
        const interval = calculateIntervalFSRS6(s, 0.9);
        expect(interval).toBeCloseTo(s, 4);
      }
    });

    it('目标留存率越高，间隔越短；目标留存率越低，间隔越长', () => {
      const s = 10;
      const highR = calculateIntervalFSRS6(s, 0.95);
      const standardR = calculateIntervalFSRS6(s, 0.90);
      const relaxedR = calculateIntervalFSRS6(s, 0.80);

      expect(highR).toBeLessThan(standardR);
      expect(standardR).toBeLessThan(relaxedR);
    });
  });

  describe('getDecayForAge (儿童个性化衰减率)', () => {
    it('5岁幼儿衰减因子大于7岁学龄儿童', () => {
      const decay5 = getDecayForAge(5);
      const decay7 = getDecayForAge(7);
      expect(decay5).toBeGreaterThan(decay7);
      expect(decay7).toBeCloseTo(0.1542, 3);
    });
  });

  describe('fsrsPredict 输出 retention 留存率预测', () => {
    it('返回结构中包含 retention 属性且在 0~1 之间', () => {
      const record = initFSRSRecord('char_test');
      const pred = fsrsPredict(record);
      expect(pred).toHaveProperty('retention');
      expect(typeof pred.retention).toBe('number');
      expect(pred.retention).toBeGreaterThanOrEqual(0);
      expect(pred.retention).toBeLessThanOrEqual(1);
    });
  });
});
