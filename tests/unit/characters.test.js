import { describe, it, expect } from "vitest";
import { CHARACTER_DATABASE } from "../../src/data/characters.js";

describe("1490 Characters Database Completeness & Schema Integrity", () => {
  it("should have 1490 total characters with unique ids", () => {
    expect(CHARACTER_DATABASE.length).toBe(1490);
    const seenIds = new Set();

    for (const c of CHARACTER_DATABASE) {
      expect(seenIds.has(c.id)).toBe(false);
      seenIds.add(c.id);
      expect(c.char).toBeTruthy();
      expect(c.pinyin).toBeTruthy();
      expect(c.radical).toBeTruthy();
      expect(c.stage).toBeGreaterThanOrEqual(1);
      expect(c.stage).toBeLessThanOrEqual(3);
    }
  });

  it("should have balanced 3-stage progression", () => {
    const stage1 = CHARACTER_DATABASE.filter(c => c.stage === 1);
    const stage2 = CHARACTER_DATABASE.filter(c => c.stage === 2);
    const stage3 = CHARACTER_DATABASE.filter(c => c.stage === 3);

    expect(stage1.length).toBe(200);
    expect(stage2.length).toBe(400);
    expect(stage3.length).toBe(890);
    expect(stage1.length + stage2.length + stage3.length).toBe(1490);
  });

  it("should have complete 12 metadata dimensions for every character", () => {
    for (const c of CHARACTER_DATABASE) {
      expect(Array.isArray(c.strokes)).toBe(true);
      expect(c.strokes.length).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(c.words)).toBe(true);
      expect(c.words.length).toBeGreaterThanOrEqual(1);
      expect(typeof c.sentence).toBe("string");
      expect(c.sentence.length).toBeGreaterThan(0);
      expect(c.evolution).toBeDefined();
      expect(typeof c.evolution.story).toBe("string");
    }
  });

  it("should support modular stage splitting and async loaders", async () => {
    const {
      STAGE1_CHARACTERS,
      STAGE2_CHARACTERS,
      STAGE3_CHARACTERS,
      getStageCharacters,
      getAllCharacters,
      findCharacterById,
      findCharacterByChar
    } = await import("../../src/data/characters/index.js");

    expect(STAGE1_CHARACTERS.length).toBe(200);
    expect(STAGE2_CHARACTERS.length).toBe(400);
    expect(STAGE3_CHARACTERS.length).toBe(890);

    const s1 = await getStageCharacters(1);
    expect(s1.length).toBe(200);

    const s2 = await getStageCharacters(2);
    expect(s2.length).toBe(400);

    const s3 = await getStageCharacters(3);
    expect(s3.length).toBe(890);

    const all = await getAllCharacters();
    expect(all.length).toBe(1490);

    const char1 = findCharacterById("char_001");
    expect(char1).toBeDefined();
    expect(char1.char).toBe("日");

    const charSun = findCharacterByChar("日");
    expect(charSun).toBeDefined();
    expect(charSun.id).toBe("char_001");
  });
});

