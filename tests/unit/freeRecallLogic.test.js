import { describe, it, expect } from "vitest";
import {
  pickRecallMode,
  mapSelfReportToRating,
  FSRGRating,
} from "../../src/utils/reviewHub/freeRecallLogic.js";
import { ATOMIC_CARD_TYPES } from "../../src/utils/flashcardEngine.js";

describe("pickRecallMode", () => {
  it("age ≤4 → recognition sound_to_char", () => {
    expect(pickRecallMode(4)).toEqual({
      mode: "point",
      cardType: ATOMIC_CARD_TYPES.SOUND_TO_CHAR,
    });
  });
  it("age ≥5 → free recall char_to_pinyin", () => {
    expect(pickRecallMode(5).mode).toBe("free");
    expect(pickRecallMode(7).cardType).toBe(ATOMIC_CARD_TYPES.CHAR_TO_PINYIN);
  });
});

describe("mapSelfReportToRating", () => {
  it("knew → GOOD; notYet → AGAIN", () => {
    expect(mapSelfReportToRating(true)).toBe(FSRGRating.GOOD);
    expect(mapSelfReportToRating(false)).toBe(FSRGRating.AGAIN);
  });
});
