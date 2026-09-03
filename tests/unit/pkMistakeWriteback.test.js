import { describe, it, expect, beforeEach, vi } from "vitest";
import { EbbinghausManager } from "../../src/utils/ebbinghaus.js";

describe("PK mistake writeback contract", () => {
  let mgr;

  beforeEach(() => {
    mgr = new EbbinghausManager();
    mgr.progress.charRecords = {
      char_sun: {
        charId: "char_sun",
        correctStreak: 3,
        isDifficult: false,
        masteryRate: 80,
      },
    };
    mgr.progress.errorProfiles = {
      confusedPairs: {},
      reverseStrokeErrors: {},
      pronunciationErrors: {},
      updatedAt: 0,
    };
  });

  it("recordMistake similar_confuse updates errorProfiles and charRecords", () => {
    const saveSpy = vi.spyOn(mgr, "save").mockImplementation(() => {});
    mgr.recordMistake("char_sun", "similar_confuse", {
      targetChar: "日",
      selectedChar: "目",
    });
    expect(mgr.progress.errorProfiles.confusedPairs["日"]["目"]).toBe(1);
    expect(mgr.progress.charRecords.char_sun.correctStreak).toBe(0);
    expect(mgr.progress.charRecords.char_sun.isDifficult).toBe(true);
    expect(saveSpy).toHaveBeenCalled();
  });
});
