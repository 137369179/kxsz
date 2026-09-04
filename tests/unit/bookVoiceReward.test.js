import { describe, it, expect } from "vitest";
import { resolveBookVoiceReward, BOOK_VOICE_PASS_SCORE } from "../../src/utils/bookVoiceReward.js";

describe("resolveBookVoiceReward", () => {
  it("awards coins only when score reaches pass threshold", () => {
    expect(resolveBookVoiceReward({ score: 88 })).toEqual({
      ok: true,
      score: 88,
      coins: 15,
    });
    expect(resolveBookVoiceReward({ score: 95 }).coins).toBe(20);
    expect(resolveBookVoiceReward({ score: 60 }).coins).toBe(10);
  });

  it("does not award on throw / missing score / below pass", () => {
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
    expect(resolveBookVoiceReward({ score: 0 })).toEqual({
      ok: false,
      score: 0,
      coins: 0,
    });
    expect(resolveBookVoiceReward({ score: BOOK_VOICE_PASS_SCORE - 1 }).ok).toBe(false);
  });

  it("clamps score to 0-100 integers and reads totalScore", () => {
    expect(resolveBookVoiceReward({ score: 120 }).score).toBe(100);
    expect(resolveBookVoiceReward({ score: -5 })).toEqual({
      ok: false,
      score: 0,
      coins: 0,
    });
    expect(resolveBookVoiceReward({ score: 87.6 }).score).toBe(88);
    expect(resolveBookVoiceReward({ totalScore: 91 }).ok).toBe(true);
  });
});
