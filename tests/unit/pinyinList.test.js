import { describe, it, expect } from "vitest";
import { PINYIN_INITIALS, PINYIN_FINALS, PINYIN_WHOLE_SYLLABLES, PINYIN_COLLISION_PAIRS } from "../../src/data/pinyinList.js";
import fs from "fs";
import path from "path";

describe("National Curriculum Pinyin Database", () => {
  it("should have exactly 23 initials, 24 finals, and 16 whole syllables (63 total)", () => {
    expect(PINYIN_INITIALS.length).toBe(23);
    expect(PINYIN_FINALS.length).toBe(24);
    expect(PINYIN_WHOLE_SYLLABLES.length).toBe(16);
    expect(PINYIN_INITIALS.length + PINYIN_FINALS.length + PINYIN_WHOLE_SYLLABLES.length).toBe(63);
  });

  it("should have valid schema for collision pairs", () => {
    expect(PINYIN_COLLISION_PAIRS.length).toBeGreaterThanOrEqual(8);
    for (const pair of PINYIN_COLLISION_PAIRS) {
      expect(pair.initial).toBeTruthy();
      expect(pair.final).toBeTruthy();
      expect(pair.syllable).toBeTruthy();
      expect(pair.char).toBeTruthy();
      expect(pair.word).toBeTruthy();
      expect(fs.existsSync(path.resolve(__dirname, "../../", pair.image))).toBe(true);
    }
  });

  it("should be 100% free of Unicode emojis in pinyinList.js", () => {
    const filePath = path.resolve(__dirname, "../../src/data/pinyinList.js");
    const content = fs.readFileSync(filePath, "utf-8");
    const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;
    expect(emojiRegex.test(content)).toBe(false);
  });
});
