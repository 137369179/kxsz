import { describe, it, expect, beforeEach, vi } from "vitest";
import { ebbinghausManager } from "../../src/utils/ebbinghaus.js";
import { writeKnownCharsReview } from "../../src/utils/playHub/playHelpers.js";
import { CHARACTER_DATABASE } from "../../src/data/characters.js";

describe("writeKnownCharsReview", () => {
  beforeEach(() => {
    ebbinghausManager.progress.charRecords = {};
  });

  it("skips chars never learned", () => {
    const spy = vi.spyOn(ebbinghausManager, "completeReview");
    const ch = CHARACTER_DATABASE[0]?.char || "日";
    writeKnownCharsReview([ch], true);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("writes completeReview only for known records", () => {
    const sample = CHARACTER_DATABASE[0];
    expect(sample).toBeTruthy();
    ebbinghausManager.progress.charRecords[sample.id] = {
      charId: sample.id,
      learnedAt: Date.now(),
      reviewCount: 1,
      correctStreak: 1,
      masteryRate: 70,
      nextReviewDate: Date.now() + 86400000,
      isDifficult: false,
    };
    const spy = vi.spyOn(ebbinghausManager, "completeReview").mockImplementation(() => ({}));
    writeKnownCharsReview([sample.char, sample.char, "𠀀"], false);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(sample.id, false);
    spy.mockRestore();
  });
});
