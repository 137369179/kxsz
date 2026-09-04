import { describe, it, expect } from "vitest";
import {
  JOL_LEVELS,
  mapSelfReportToRating,
  FSRGRating,
} from "../../src/utils/reviewHub/freeRecallLogic.js";

describe("Metacognition JOL (Judgment of Learning) Logic", () => {
  it("exports valid JOL level constants", () => {
    expect(JOL_LEVELS).toBeDefined();
    expect(JOL_LEVELS.EASY).toBe("easy");
    expect(JOL_LEVELS.FUZZY).toBe("fuzzy");
    expect(JOL_LEVELS.HARD).toBe("hard");
  });

  describe("mapSelfReportToRating with JOL fusion", () => {
    it("maps failed recall to AGAIN regardless of prior JOL", () => {
      expect(mapSelfReportToRating(false, JOL_LEVELS.EASY)).toBe(FSRGRating.AGAIN);
      expect(mapSelfReportToRating(false, JOL_LEVELS.FUZZY)).toBe(FSRGRating.AGAIN);
      expect(mapSelfReportToRating(false, JOL_LEVELS.HARD)).toBe(FSRGRating.AGAIN);
      expect(mapSelfReportToRating(false)).toBe(FSRGRating.AGAIN);
    });

    it("maps successful recall with EASY JOL to EASY rating", () => {
      expect(mapSelfReportToRating(true, JOL_LEVELS.EASY)).toBe(FSRGRating.EASY);
    });

    it("maps successful recall with FUZZY JOL to GOOD rating", () => {
      expect(mapSelfReportToRating(true, JOL_LEVELS.FUZZY)).toBe(FSRGRating.GOOD);
    });

    it("maps successful recall with HARD JOL to HARD rating", () => {
      expect(mapSelfReportToRating(true, JOL_LEVELS.HARD)).toBe(FSRGRating.HARD);
    });

    it("defaults to GOOD if JOL is omitted or unknown but knew is true", () => {
      expect(mapSelfReportToRating(true)).toBe(FSRGRating.GOOD);
      expect(mapSelfReportToRating(true, null)).toBe(FSRGRating.GOOD);
      expect(mapSelfReportToRating(true, "unknown")).toBe(FSRGRating.GOOD);
    });
  });
});
