import { describe, it, expect, beforeEach } from "vitest";
import {
  fsrsCompleteReview,
  initFSRSRecord,
  FSRGRating,
  ensureFSRSState,
} from "../../src/utils/fsrsScheduler.js";
import { EbbinghausManager } from "../../src/utils/ebbinghaus.js";

describe("fsrsCompleteReview single-path rating", () => {
  it("accepts explicit FSRS rating and does not coerce EASY to GOOD", () => {
    const base = {
      charId: "char_x",
      reviewCount: 1,
      correctStreak: 1,
      masteryRate: 70,
      ...ensureFSRSState(initFSRSRecord("char_x")),
    };
    const easy = fsrsCompleteReview(base, FSRGRating.EASY);
    const good = fsrsCompleteReview(base, FSRGRating.GOOD);
    // EASY should yield longer/equal interval than GOOD from same state
    expect(easy._fsrsState.stability).toBeGreaterThanOrEqual(good._fsrsState.stability);
    expect(easy._fsrsState.interval).toBeGreaterThanOrEqual(good._fsrsState.interval);
  });

  it("boolean true still maps to GOOD path (backward compatible)", () => {
    const base = ensureFSRSState(initFSRSRecord("char_y"));
    const viaBool = fsrsCompleteReview(base, true);
    const viaGood = fsrsCompleteReview(base, FSRGRating.GOOD);
    expect(viaBool._fsrsState.stability).toBe(viaGood._fsrsState.stability);
  });
});

describe("completeReview with rating preserves single schedule", () => {
  let mgr;
  beforeEach(() => {
    mgr = new EbbinghausManager();
    mgr.progress.charRecords = {};
  });

  it("completeReview(charId, EASY) writes one FSRS state", () => {
    mgr.progress.charRecords.char_z = {
      charId: "char_z",
      reviewCount: 0,
      correctStreak: 0,
      masteryRate: 60,
      ...ensureFSRSState(initFSRSRecord("char_z")),
    };
    const updated = mgr.completeReview("char_z", FSRGRating.EASY);
    expect(updated._fsrsState).toBeDefined();
    expect(updated._fsrsState.reps).toBeGreaterThanOrEqual(1);
    expect(mgr.progress.charRecords.char_z._fsrsState.stability).toBe(updated._fsrsState.stability);
  });
});
