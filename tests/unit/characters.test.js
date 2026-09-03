import { describe, it, expect } from "vitest";
import { CHARACTER_DATABASE } from "../../src/data/characters.js";

const DB = CHARACTER_DATABASE;
const TOTAL = DB.length;
const STAGE1 = DB.filter(c => c.stage === 1).length;
const STAGE2 = DB.filter(c => c.stage === 2).length;
const STAGE3 = DB.filter(c => c.stage === 3).length;

describe(`Characters Database (${TOTAL}字)`, () => {
  it(`should have ${TOTAL} total characters with unique ids`, () => {
    expect(TOTAL).toBeGreaterThanOrEqual(1400);
    const seenIds = new Set();
    for (const c of DB) {
      expect(seenIds.has(c.id)).toBe(false);
      seenIds.add(c.id);
      expect(c.char).toBeTruthy();
      expect(c.pinyin).toBeTruthy();
      expect(c.radical).toBeTruthy();
      expect(c.stage).toBeGreaterThanOrEqual(1);
      expect(c.stage).toBeLessThanOrEqual(3);
    }
  });

  it(`should split into 3 stages (${STAGE1}/${STAGE2}/${STAGE3})`, () => {
    expect(STAGE1 + STAGE2 + STAGE3).toBe(TOTAL);
    expect(STAGE1).toBeGreaterThan(0);
    expect(STAGE2).toBeGreaterThan(0);
    expect(STAGE3).toBeGreaterThan(0);
  });

  it("should have complete index metadata for every character", () => {
    for (const c of DB) {
      expect(c.id).toBeTruthy();
      expect(c.char).toBeTruthy();
      expect(c.pinyin).toBeTruthy();
      expect(c.radical).toBeTruthy();
      expect(c.strokeCount).toBeGreaterThanOrEqual(1);
      expect(c.stage).toBeGreaterThanOrEqual(1);
      expect(c.stage).toBeLessThanOrEqual(3);
      expect(c.mechanism).toBeTruthy();
      expect(c.charType).toBeTruthy();
    }
  });

  it("should lazily load detail fields via charDetailLoader", async () => {
    const { ensureDetails, isDetailsLoaded } = await import("../../src/utils/charDetailLoader.js");
    const ok = await ensureDetails();
    expect(ok).toBe(true);
    expect(isDetailsLoaded()).toBe(true);

    const c = DB.find((x) => x.id === "char_001");
    expect(Array.isArray(c.strokes)).toBe(true);
    expect(c.strokes.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(c.words)).toBe(true);
    expect(c.words.length).toBeGreaterThanOrEqual(1);
    expect(typeof c.sentence).toBe("string");
    expect(c.sentence.length).toBeGreaterThan(0);
    expect(c.evolution).toBeDefined();
    expect(typeof c.evolution.story).toBe("string");
    expect(c.meanings).toBeDefined();
    expect(typeof c.meanings.primary).toBe("string");
    expect(c.meanings.primary.length).toBeGreaterThan(0);
    expect(typeof c.meanings.radicalHint).toBe("string");
    expect(c.meanings.radicalHint.length).toBeGreaterThan(0);
  }, 20000);
});
