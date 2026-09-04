import { describe, it, expect } from "vitest";
import {
  isBedtimeWindow,
  getOvernightChars,
  isOvernightConsolidationNeeded,
} from "../../src/utils/sleepConsolidation.js";

describe("Sleep Consolidation & Bedtime Window", () => {
  describe("isBedtimeWindow", () => {
    it("returns true during 19:30 - 21:30", () => {
      const d1 = new Date();
      d1.setHours(19, 30, 0, 0);
      expect(isBedtimeWindow(d1)).toBe(true);

      const d2 = new Date();
      d2.setHours(20, 15, 0, 0);
      expect(isBedtimeWindow(d2)).toBe(true);

      const d3 = new Date();
      d3.setHours(21, 29, 0, 0);
      expect(isBedtimeWindow(d3)).toBe(true);
    });

    it("returns false outside 19:30 - 21:30", () => {
      const d1 = new Date();
      d1.setHours(10, 0, 0, 0);
      expect(isBedtimeWindow(d1)).toBe(false);

      const d2 = new Date();
      d2.setHours(19, 29, 0, 0);
      expect(isBedtimeWindow(d2)).toBe(false);

      const d3 = new Date();
      d3.setHours(21, 31, 0, 0);
      expect(isBedtimeWindow(d3)).toBe(false);

      const d4 = new Date();
      d4.setHours(23, 0, 0, 0);
      expect(isBedtimeWindow(d4)).toBe(false);
    });
  });

  describe("getOvernightChars & isOvernightConsolidationNeeded", () => {
    const now = 1700000000000; // Reference timestamp

    it("identifies characters learned 12h-36h ago with 0 reviews as overnight candidates", () => {
      const records = {
        char_yesterday: {
          charId: "char_yesterday",
          learnedAt: now - 18 * 3600 * 1000, // 18h ago (yesterday)
          reviewCount: 0,
        },
        char_just_now: {
          charId: "char_just_now",
          learnedAt: now - 2 * 3600 * 1000, // 2h ago (today)
          reviewCount: 0,
        },
        char_reviewed: {
          charId: "char_reviewed",
          learnedAt: now - 20 * 3600 * 1000, // 20h ago but already reviewed
          reviewCount: 1,
        },
        char_long_ago: {
          charId: "char_long_ago",
          learnedAt: now - 48 * 3600 * 1000, // 48h ago (2 days ago)
          reviewCount: 0,
        },
      };

      const overnight = getOvernightChars(records, now);
      expect(overnight).toEqual(["char_yesterday"]);
      expect(isOvernightConsolidationNeeded(records, now)).toBe(true);
    });

    it("returns empty array if no records meet overnight criteria", () => {
      const records = {
        char_today: {
          charId: "char_today",
          learnedAt: now - 1 * 3600 * 1000,
          reviewCount: 0,
        },
      };

      expect(getOvernightChars(records, now)).toEqual([]);
      expect(isOvernightConsolidationNeeded(records, now)).toBe(false);
    });

    it("handles empty or invalid records gracefully", () => {
      expect(getOvernightChars(null, now)).toEqual([]);
      expect(getOvernightChars({}, now)).toEqual([]);
      expect(isOvernightConsolidationNeeded(null, now)).toBe(false);
    });
  });
});
