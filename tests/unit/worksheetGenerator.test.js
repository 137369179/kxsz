import { describe, it, expect } from "vitest";
import { generateCharWorksheetCard, buildWorksheetFullHTML } from "../../src/utils/worksheetGenerator.js";
import fs from "fs";
import path from "path";

describe("Worksheet Generator (A4 Tianzige)", () => {
  const mockChar = {
    id: "char_001",
    char: "日",
    pinyin: "rì",
    radical: "日",
    strokeCount: 4,
    charType: "pictograph",
    strokes: [
      { name: "竖", order: 1 },
      { name: "横折", order: 2 },
      { name: "横", order: 3 },
      { name: "横", order: 4 }
    ],
    words: [{ word: "太阳", pinyin: "tài yáng" }],
    sentence: "太阳升起来了。"
  };

  it("should generate character card with tianzi grids and pinyin lines", () => {
    const html = generateCharWorksheetCard(mockChar);
    expect(html).toContain("pinyin-four-line");
    expect(html).toContain("rì");
    expect(html).toContain("giant-char");
    expect(html).toContain("trace-cell");
    expect(html).toContain("empty-cell");
    expect(html).toContain("太阳");
    expect(html).toContain("太阳升起来了。");
  });

  it("should build complete printable HTML page", () => {
    const fullHtml = buildWorksheetFullHTML([mockChar], "单元生词字帖");
    expect(fullHtml).toContain("<!DOCTYPE html>");
    expect(fullHtml).toContain("@page");
    expect(fullHtml).toContain("单元生词字帖");
    expect(fullHtml).toContain("worksheet-page");
  });

  it("should be 100% free of Unicode emojis in worksheetGenerator.js", () => {
    const filePath = path.resolve(__dirname, "../../src/utils/worksheetGenerator.js");
    const content = fs.readFileSync(filePath, "utf-8");
    const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;
    expect(emojiRegex.test(content)).toBe(false);
  });
});
