import { describe, it, expect } from "vitest";
import { resolveBookVoiceReward } from "../../src/utils/bookVoiceReward.js";

describe("resolveBookVoiceReward", () => {
  it("awards coins only when evaluate returns a numeric score", () => {
    expect(resolveBookVoiceReward({ score: 88 })).toEqual({
      ok: true,
      score: 88,
      coins: 20,
    });
  });

  it("does not award on throw / missing score", () => {
    expect(resolveBookVoiceReward(null)).toEqual({
      ok: false,
      score: null,
      coins: 0,
    });
    expect(resolveBookVoiceReward({})).toEqual({
      ok: false,
      score: null,
      coins: 0,
    });
    expect(resolveBookVoiceReward({ score: NaN })).toEqual({
      ok: false,
      score: null,
      coins: 0,
    });
  });

  it("clamps score to 0-100 integers", () => {
    expect(resolveBookVoiceReward({ score: 120 }).score).toBe(100);
    expect(resolveBookVoiceReward({ score: -5 }).score).toBe(0);
    expect(resolveBookVoiceReward({ score: 87.6 }).score).toBe(88);
  });
});
