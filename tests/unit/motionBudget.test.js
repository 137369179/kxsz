// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { getMotionTier, fxLimit } from "../../src/utils/motionBudget.js";

describe("motionBudget", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("returns default medium or high when no reduce-motion is set", () => {
    const tier = getMotionTier();
    expect(["low", "medium", "high"]).toContain(tier);
    const limit = fxLimit();
    expect(limit).toHaveProperty("throttleMs");
    expect(limit).toHaveProperty("maxParticles");
    expect(limit).toHaveProperty("burstMax");
    expect(limit).toHaveProperty("allowRipple");
    expect(limit.maxParticles).toBeGreaterThanOrEqual(10);
  });

  it("returns low tier when localStorage cathy_reduced_motion is 1", () => {
    localStorage.setItem("cathy_reduced_motion", "1");

    const tier = getMotionTier();
    expect(tier).toBe("low");

    const limit = fxLimit();
    expect(limit.allowRipple).toBe(false);
    expect(limit.throttleMs).toBe(500);
    expect(limit.maxParticles).toBe(10);
  });

  it("returns low tier when prefers-reduced-motion media query matches", () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const tier = getMotionTier();
    expect(tier).toBe("low");
  });
});
