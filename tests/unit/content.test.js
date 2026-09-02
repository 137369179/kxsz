import { describe, it, expect } from "vitest";
import { STORYBOOKS_DATABASE } from "../../src/data/books.js";
import { IDIOMS_DATABASE } from "../../src/data/idioms.js";

describe("Educational Content & Storybook Database", () => {
  it("should validate all storybooks in STORYBOOKS_DATABASE", () => {
    expect(STORYBOOKS_DATABASE.length).toBeGreaterThanOrEqual(10);

    // ID 支持两种命名约定：数字序列 (book_001) 与主题语义 (book_theme_midautumn)
    // 真正的不变量是「非空 + 唯一」——BookModule 用 id 做 DOM data 属性与 progressMap 键。
    const seenIds = new Set();
    for (const book of STORYBOOKS_DATABASE) {
      expect(book.id).toMatch(/^book_[a-z0-9_]+$/);
      expect(seenIds.has(book.id)).toBe(false); // ID 必须唯一
      seenIds.add(book.id);
      expect(book.title).toBeTruthy();
      expect(book.stage).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(book.targetChars)).toBe(true);
      expect(book.targetChars.length).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(book.pages)).toBe(true);
      expect(book.pages.length).toBeGreaterThanOrEqual(1);

      // Verify each page structure
      for (const page of book.pages) {
        expect(page.pageNumber).toBeGreaterThanOrEqual(1);
        expect(typeof page.text).toBe("string");
        expect(page.text.length).toBeGreaterThan(0);
      }
    }
  });

  it("should validate all idioms in IDIOMS_DATABASE", () => {
    expect(IDIOMS_DATABASE.length).toBe(30);
    for (const idiom of IDIOMS_DATABASE) {
      expect(idiom.id).toMatch(/^idiom_\d+/);
      expect(idiom.name.length).toBe(4); // 4-character idiom
      expect(Array.isArray(idiom.chars)).toBe(true);
      expect(idiom.chars.length).toBe(4);
      expect(idiom.pinyin).toBeTruthy();
      expect(idiom.story.length).toBeGreaterThan(20);
      expect(idiom.moral.length).toBeGreaterThan(5);
      expect(idiom.gameQuestion).toBeDefined();
      expect(Array.isArray(idiom.gameQuestion.options)).toBe(true);
      expect(idiom.gameQuestion.options.length).toBeGreaterThanOrEqual(2);
      expect(idiom.gameQuestion.correctIndex).toBeGreaterThanOrEqual(0);
    }
  });
});
