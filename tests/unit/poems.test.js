import { describe, it, expect } from "vitest";
import { POEMS_DATABASE } from "../../src/data/poems.js";

describe("Classic Poems Database Completeness & Schema Integrity", () => {
  it("should have 20 classic children poems with unique ids", () => {
    expect(POEMS_DATABASE.length).toBe(20);
    const seenIds = new Set();

    for (const p of POEMS_DATABASE) {
      expect(seenIds.has(p.id)).toBe(false);
      seenIds.add(p.id);
      expect(p.title).toBeTruthy();
      expect(p.author).toBeTruthy();
      expect(p.dynasty).toBeTruthy();
      expect(p.pinyin).toBeTruthy();
      expect(Array.isArray(p.lines)).toBe(true);
      expect(p.lines.length).toBeGreaterThanOrEqual(4);
      expect(p.appreciation).toBeTruthy();
      expect(Array.isArray(p.targetChars)).toBe(true);
      expect(p.targetChars.length).toBeGreaterThanOrEqual(4);
      expect(p.quiz).toBeDefined();
      expect(p.quiz.options.length).toBeGreaterThanOrEqual(3);
      expect(p.quiz.correctIndex).toBeGreaterThanOrEqual(0);
    }
  });

  it("should contain milestone poems like 咏鹅, 静夜思, 春晓, 悯农", () => {
    const titles = POEMS_DATABASE.map(p => p.title);
    expect(titles).toContain("咏鹅");
    expect(titles).toContain("静夜思");
    expect(titles).toContain("春晓");
    expect(titles).toContain("悯农");
    expect(titles).toContain("登鹳雀楼");
    expect(titles).toContain("小池");
    expect(titles).toContain("江南");
  });
});
