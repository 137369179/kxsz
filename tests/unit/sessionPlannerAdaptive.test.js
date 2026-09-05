/**
 * sessionPlannerAdaptive.test.js — M4 节奏自适应纯函数测试
 */
import { describe, it, expect } from "vitest";
import { getSessionConfig, adaptSessionConfig, collectPerformanceStats } from "../../src/utils/sessionPlanner.js";

describe("M4 节奏自适应 adaptSessionConfig", () => {
  it("信号不足（已学 < 10 字）时原样返回且 adapted=false", () => {
    const base = getSessionConfig(6); // {7,3,4}
    const out = adaptSessionConfig(base, { difficultRatio: 0.5, lowMasteryRatio: 0.5, learnedCount: 5 });
    expect(out.adapted).toBe(false);
    expect(out.total).toBe(base.total);
    expect(out.newChars).toBe(base.newChars);
  });

  it("stats 为 null 时原样返回", () => {
    const base = getSessionConfig(5);
    const out = adaptSessionConfig(base, null);
    expect(out.adapted).toBe(false);
    expect(out).toMatchObject(base);
  });

  it("难字占比 > 0.25 → 巩固优先：新字 -1（下限 1）、复习 +1", () => {
    const base = getSessionConfig(6); // {7,3,4}
    const out = adaptSessionConfig(base, { difficultRatio: 0.4, lowMasteryRatio: 0.1, learnedCount: 40 });
    expect(out.adapted).toBe(true);
    expect(out.newChars).toBe(2);
    expect(out.reviews).toBe(5);
    expect(out.total).toBe(7);
  });

  it("新字为 1 时再受挫不下探到 0（下限保护）", () => {
    const base = { total: 3, newChars: 1, reviews: 2 }; // 3 岁档
    const out = adaptSessionConfig(base, { difficultRatio: 0.5, lowMasteryRatio: 0.3, learnedCount: 12 });
    expect(out.newChars).toBe(1);
    expect(out.adapted).toBe(true);
  });

  it("表现轻松（难字<8% 且低掌握<15%）→ 新字 +1，总量不破米勒上限 7", () => {
    const base = getSessionConfig(5); // {5,2,3}
    const out = adaptSessionConfig(base, { difficultRatio: 0.05, lowMasteryRatio: 0.1, learnedCount: 30 });
    expect(out.adapted).toBe(true);
    expect(out.newChars).toBe(3);
    expect(out.total).toBe(6);
  });

  it("已达上限（total=7）时表现轻松也不加量", () => {
    const base = { total: 7, newChars: 3, reviews: 4 };
    const out = adaptSessionConfig(base, { difficultRatio: 0.05, lowMasteryRatio: 0.05, learnedCount: 30 });
    // maxTotal = max(7,7) = 7，total+1 > maxTotal → 维持
    expect(out.adapted).toBe(false);
    expect(out.total).toBe(7);
  });

  it("表现平稳（中间区间）→ 维持基准", () => {
    const base = getSessionConfig(6);
    const out = adaptSessionConfig(base, { difficultRatio: 0.15, lowMasteryRatio: 0.2, learnedCount: 30 });
    expect(out.adapted).toBe(false);
    expect(out).toMatchObject(base);
  });

  it("collectPerformanceStats 在无依赖注入时返回 null（不抛错）", () => {
    expect(collectPerformanceStats()).toBeNull();
  });
});
