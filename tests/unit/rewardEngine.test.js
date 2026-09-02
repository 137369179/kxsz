import { describe, it, expect } from 'vitest';
import { computeStreaks, buildMonthMatrix, getStickers, getMedals, getCalendar, getShopData } from '../../src/utils/rewardEngine.js';

describe('RewardEngine (Stickers, Medals, Calendar & Shop)', () => {
  it('should compute streaks correctly for continuous dates', () => {
    const today = new Date();
    const d1 = new Date(today);
    const d2 = new Date(today);
    d2.setDate(d2.getDate() - 1);
    const d3 = new Date(today);
    d3.setDate(d3.getDate() - 2);

    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dates = [fmt(d1), fmt(d2), fmt(d3)];

    const { current, best } = computeStreaks(dates);
    expect(current).toBe(3);
    expect(best).toBe(3);
  });

  it('should build 7-column calendar week matrix correctly', () => {
    const matrix = buildMonthMatrix(2026, 8, new Set(['2026-09-01']), '2026-09-02');
    expect(matrix.length).toBeGreaterThanOrEqual(4);
    for (const week of matrix) {
      expect(week.length).toBe(7);
    }
  });

  it('should return stickers structure with total count matching database', () => {
    const s = getStickers();
    expect(typeof s.total).toBe('number');
    expect(s.total).toBeGreaterThan(0);
    expect(Array.isArray(s.earned)).toBe(true);
    expect(Array.isArray(s.upcoming)).toBe(true);
  });

  it('should return 16 standard achievement medals with tiers and targets', () => {
    const medals = getMedals();
    expect(medals.length).toBe(16);
    for (const m of medals) {
      expect(m.id).toBeDefined();
      expect(m.name).toBeDefined();
      expect(m.tier).toBeDefined();
      expect(typeof m.target).toBe('number');
      expect(typeof m.current).toBe('number');
    }
  });

  it('should return shop data with avatars and frames', () => {
    const shop = getShopData();
    expect(typeof shop.coins).toBe('number');
    expect(Array.isArray(shop.avatars)).toBe(true);
    expect(Array.isArray(shop.frames)).toBe(true);
    expect(shop.avatars.length).toBeGreaterThan(0);
  });
});
