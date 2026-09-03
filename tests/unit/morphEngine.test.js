import { describe, it, expect } from "vitest";
import { renderMorphTheaterHTML } from "../../src/utils/morphEngine.js";
import fs from "fs";
import path from "path";

describe("Pictograph Morphing Engine (象形本源图-字蜕变微剧场)", () => {
  const dummyChar = {
    id: "char_sun",
    char: "日",
    pinyin: "rì",
    oracleGlyph: "⊙",
    bronzeGlyph: "日",
    evolution: {
      story: "古人抬头看太阳，圆圆的发光体中间有一点黑子，于是画成了圆圈带点。"
    }
  };

  it("should render 4-layer morph theater HTML correctly", () => {
    const html = renderMorphTheaterHTML(dummyChar);
    expect(html).toContain("象形字源蜕变动效微剧场");
    expect(html).toContain("morph-layer-nature");
    expect(html).toContain("morph-layer-oracle");
    expect(html).toContain("morph-layer-seal");
    expect(html).toContain("morph-layer-modern");
    expect(html).toContain("morph-step-pill");
    expect(html).toContain("morph-range-slider");
    expect(html).toContain("【日】字是怎么来的？");
  });

  it("should gracefully handle empty or undefined char", () => {
    expect(renderMorphTheaterHTML(null)).toBe("");
  });

  it("should be 100% free of Unicode emojis in morphEngine.js", () => {
    const filePath = path.resolve(__dirname, "../../src/utils/morphEngine.js");
    const content = fs.readFileSync(filePath, "utf-8");
    const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;
    expect(emojiRegex.test(content)).toBe(false);
  });
});
