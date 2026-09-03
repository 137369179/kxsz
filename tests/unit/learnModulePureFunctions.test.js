/**
 * LearnModule 纯函数单元测试
 */
import { describe, test, expect } from 'vitest';
import {
  starsToMasteryRate,
  scoreToStars,
  isValidCharData,
  calculateStepProgress,
  getStepDuration
} from '../../src/components/LearnModule.js';

describe('LearnModule 纯函数', () => {
  describe('starsToMasteryRate()', () => {
    test('3星应返回 85', () => {
      expect(starsToMasteryRate(3)).toBe(85);
    });
    test('2星应返回 75', () => {
      expect(starsToMasteryRate(2)).toBe(75);
    });
    test('1星应返回 65', () => {
      expect(starsToMasteryRate(1)).toBe(65);
    });
    test('0星应返回 55', () => {
      expect(starsToMasteryRate(0)).toBe(55);
    });
    test('null/undefined 应返回默认值 85', () => {
      expect(starsToMasteryRate(null)).toBe(85);
      expect(starsToMasteryRate(undefined)).toBe(85);
    });
    test('超过范围的值应被截断', () => {
      expect(starsToMasteryRate(5)).toBe(85);
      expect(starsToMasteryRate(-1)).toBe(55);
    });
  });

  describe('scoreToStars()', () => {
    test('90分以上应返回 3 星', () => {
      expect(scoreToStars(100)).toBe(3);
      expect(scoreToStars(90)).toBe(3);
      expect(scoreToStars(89)).toBe(2);
    });
    test('75-89分应返回 2 星', () => {
      expect(scoreToStars(89)).toBe(2);
      expect(scoreToStars(75)).toBe(2);
      expect(scoreToStars(74)).toBe(1);
    });
    test('60-74分应返回 1 星', () => {
      expect(scoreToStars(74)).toBe(1);
      expect(scoreToStars(60)).toBe(1);
      expect(scoreToStars(59)).toBe(0);
    });
    test('60分以下应返回 0 星', () => {
      expect(scoreToStars(59)).toBe(0);
      expect(scoreToStars(0)).toBe(0);
    });
  });

  describe('isValidCharData()', () => {
    test('有效数据应返回 true', () => {
      expect(isValidCharData({ id: 'a', char: '人' })).toBe(true);
      expect(isValidCharData({ id: 1, char: '日' })).toBe(true);
    });
    test('无效数据应返回 false', () => {
      expect(isValidCharData(null)).toBe(false);
      expect(isValidCharData(undefined)).toBe(false);
      expect(isValidCharData({})).toBe(false);
      expect(isValidCharData({ id: 'a' })).toBe(false);
      expect(isValidCharData({ char: '人' })).toBe(false);
      expect(isValidCharData('')).toBe(false);
    });
  });

  describe('calculateStepProgress()', () => {
    test('无完成步骤应返回 0%', () => {
      expect(calculateStepProgress(1, [])).toBe(0);
    });
    test('完成 4 步应返回 50%', () => {
      expect(calculateStepProgress(5, [1, 2, 3, 4])).toBe(50);
    });
    test('完成 8 步应返回 88%（7/8=87.5%四舍五入）', () => {
      expect(calculateStepProgress(8, [1, 2, 3, 4, 5, 6, 7])).toBe(88);
    });
  });

  describe('getStepDuration()', () => {
    test('各步骤应有正确的持续时间', () => {
      expect(getStepDuration(1)).toBe(5000);
      expect(getStepDuration(3)).toBe(10000);
      expect(getStepDuration(5)).toBe(30000);
      expect(getStepDuration(8)).toBe(10000);
    });
    test('未知步骤应返回默认值', () => {
      expect(getStepDuration(99)).toBe(10000);
      expect(getStepDuration(0)).toBe(10000);
    });
  });
});
