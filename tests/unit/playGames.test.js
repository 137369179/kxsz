import { describe, it, expect, beforeEach } from "vitest";
import { determinePlayGameType, createPlayGame } from "../../src/utils/playGames/index.js";
import fs from "fs";
import path from "path";

describe("Play Games Engine for Preschool Literacy", () => {
  it("should correctly classify characters into 5 visual gameplay archetypes", () => {
    expect(determinePlayGameType({ char: "日", radical: "日" })).toBe("rub_reveal");
    expect(determinePlayGameType({ char: "月", radical: "月" })).toBe("rub_reveal");
    expect(determinePlayGameType({ char: "口", radical: "口" })).toBe("feed_creature");
    expect(determinePlayGameType({ char: "吃", radical: "口" })).toBe("feed_creature");
    expect(determinePlayGameType({ char: "大", radical: "大" })).toBe("slingshot");
    expect(determinePlayGameType({ char: "射", radical: "寸" })).toBe("slingshot");
    expect(determinePlayGameType({ char: "木", radical: "木" })).toBe("sprout_growth");
    expect(determinePlayGameType({ char: "花", radical: "艹" })).toBe("sprout_growth");
    expect(determinePlayGameType({ char: "休", radical: "亻" })).toBe("magnetic_fusion");
    expect(determinePlayGameType({ char: "明", radical: "日" })).toBe("rub_reveal"); // preset in RUB_CHARS
  });

  it("should successfully mount and destroy each game archetype without throwing", () => {
    const mockContainer = {
      innerHTML: "",
      querySelector: () => null,
      querySelectorAll: () => [],
      appendChild: () => {}
    };

    const testChars = [
      { char: "日", pinyin: "rì" },
      { char: "口", pinyin: "kǒu" },
      { char: "大", pinyin: "dà" },
      { char: "木", pinyin: "mù" },
      { char: "休", pinyin: "xiū", radical: "亻", stem: "木" },
    ];

    testChars.forEach((c) => {
      let completed = false;
      const game = createPlayGame(mockContainer, c, () => {
        completed = true;
      });

      expect(game).toBeDefined();
      expect(typeof game.mount).toBe("function");
      expect(typeof game.destroy).toBe("function");

      game.mount();
      expect(mockContainer.innerHTML.length).toBeGreaterThan(50);
      game.destroy();
    });
  });

  it("game files contain no raw SVG tags (game art must be Canvas)", () => {
    const playDir = path.resolve(__dirname, "../../src/utils/playGames");
    const playFiles = fs.readdirSync(playDir);
    const svgTagRegex = /<svg\b/i;
    playFiles.forEach((f) => {
      const content = fs.readFileSync(path.join(playDir, f), "utf-8");
      expect(svgTagRegex.test(content)).toBe(false);
    });
  });
});
