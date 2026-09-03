import { describe, it, expect } from "vitest";
import { RADICAL_FAMILIES } from "../../src/data/radicalFamilies.js";
import fs from "fs";
import path from "path";

describe("Radical Families (字族文)", () => {
  it("should have complete core radical families", () => {
    expect(RADICAL_FAMILIES.length).toBeGreaterThanOrEqual(5);

    for (const fam of RADICAL_FAMILIES) {
      expect(fam.id).toBeTruthy();
      expect(fam.name).toBeTruthy();
      expect(fam.rootChar).toBeTruthy();
      expect(fam.pinyin).toBeTruthy();
      expect(Array.isArray(fam.members)).toBe(true);
      expect(fam.members.length).toBeGreaterThanOrEqual(3);

      for (const m of fam.members) {
        expect(m.radical).toBeTruthy();
        expect(m.char).toBeTruthy();
        expect(m.pinyin).toBeTruthy();
        expect(m.mnemonic).toBeTruthy();
        expect(m.word).toBeTruthy();
      }
    }
  });

  it("should be 100% free of Unicode emojis in radicalFamilies.js", () => {
    const filePath = path.resolve(__dirname, "../../src/data/radicalFamilies.js");
    const content = fs.readFileSync(filePath, "utf-8");
    const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;
    expect(emojiRegex.test(content)).toBe(false);
  });
});
