import { describe, it, expect } from "vitest";
import { resolveTrophyUnlocks, describeStepSequenceForAge } from "../../src/utils/parentHub/parentTrophies.js";
import { buildBookStage1Quiz } from "../../src/utils/bookHub/bookStage1Quiz.js";
import { confusedTargetsForReview } from "../../src/utils/reviewConfused.js";

describe("parent trophy honesty", () => {
  it("does not unlock by fake charCount/2 index", () => {
    const unlocks = resolveTrophyUnlocks({ charRecords: {}, readBooks: [], coins: 0, gameStats: {} }, 20);
    expect(unlocks.first_char).toBe(false);
    expect(unlocks.book_worm_1).toBe(false);
    expect(unlocks.golden_rich).toBe(false);
  });

  it("unlocks first_char and book when progress is real", () => {
    const unlocks = resolveTrophyUnlocks({
      charRecords: { char_001: { charId: "char_001" } },
      readBooks: ["b1"],
      lifetimeCoinsEarned: 200,
      gameStats: { bossWins: 5 }
    }, 1);
    expect(unlocks.first_char).toBe(true);
    expect(unlocks.book_worm_1).toBe(true);
    expect(unlocks.golden_rich).toBe(true);
    expect(unlocks.boss_killer).toBe(true);
  });

  it("describes age step sequences", () => {
    expect(describeStepSequenceForAge(4).steps).toEqual([1, 2, 4, 8]);
    expect(describeStepSequenceForAge(6).steps).toEqual([1, 2, 4, 5, 6, 8]);
    expect(describeStepSequenceForAge(8).steps).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe("book stage1 real quiz", () => {
  it("never uses self-report options", () => {
    const q = buildBookStage1Quiz({ title: "日升", targetChars: ["日"] });
    expect(q.options.every((o) => o.length === 1)).toBe(true);
    expect(q.options.join("")).not.toMatch(/认识|不认识/);
    expect(q.options).toContain("日");
    expect(q.correctIndex).toBeGreaterThanOrEqual(0);
    expect(q.options[q.correctIndex]).toBe("日");
  });
});

describe("confusedTargetsForReview glyph keys", () => {
  it("resolves glyph keys into database entries", () => {
    const list = confusedTargetsForReview({
      confusedPairs: { 日: { 目: 3 }, 月: { 目: 1 } }
    }, 2);
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].char).toBe("日");
    expect(list[0].id).toMatch(/^char_/);
  });
});
