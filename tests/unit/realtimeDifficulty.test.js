// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { DrillEngine } from "../../src/utils/drillEngine.js";
import { realtimeAdjust, DIFFICULTY_LEVELS } from "../../src/utils/difficultyEngine.js";

describe("Realtime Dynamic Difficulty & Flow (Module 3)", () => {
  const sampleChar = {
    id: "char_ri",
    char: "日",
    pinyin: "rì",
    confusingChars: ["目", "白", "田"],
    words: [{ word: "太阳", pinyin: "tài yáng", mean: "恒星" }],
    sentence: "红日初升，霞光万道。",
    meanings: { primary: "太阳、日子" },
  };

  it("realtimeAdjust elevates difficulty when accuracy is high and streak >= 4", () => {
    const recent = [true, true, true, true, true];
    const res = realtimeAdjust(recent, DIFFICULTY_LEVELS.EASY, 4);
    expect(res.action).toBe("increase");
    expect(res.nextLevel).toBe(DIFFICULTY_LEVELS.MEDIUM);
  });

  it("realtimeAdjust decreases difficulty immediately on 2 consecutive errors", () => {
    const recent = [true, false, false];
    const res = realtimeAdjust(recent, DIFFICULTY_LEVELS.HARD, 0);
    expect(res.action).toBe("decrease");
    expect(res.nextLevel).toBe(DIFFICULTY_LEVELS.MEDIUM);
  });

  it("DrillEngine initializes with recentResults and tracks performance", () => {
    const mount = document.createElement("div");
    const engine = new DrillEngine(mount, sampleChar, vi.fn(), {
      allChars: [sampleChar],
      difficultyLevel: "easy",
    });

    expect(engine.recentResults).toEqual([]);
    expect(engine.difficultyLevel).toBe("easy");
  });

  it("DrillEngine applies dynamic difficulty adjustment on consecutive answers", () => {
    const mount = document.createElement("div");
    const engine = new DrillEngine(mount, sampleChar, vi.fn(), {
      allChars: [sampleChar],
      difficultyLevel: "easy",
    });

    // Simulate 4 consecutive correct answers with streak 4
    engine.recentResults = [true, true, true, true];
    engine.combo = 4;
    engine._applyRealtimeDifficulty(true);

    // Difficulty should jump from easy to medium
    expect(engine.difficultyLevel).toBe("medium");
  });

  it("DrillEngine steps down difficulty and provides scaffold trigger on 2 errors", () => {
    const mount = document.createElement("div");
    const engine = new DrillEngine(mount, sampleChar, vi.fn(), {
      allChars: [sampleChar],
      difficultyLevel: "hard",
    });

    let scaffoldTriggered = false;
    engine._triggerScaffoldDemonstration = () => {
      scaffoldTriggered = true;
    };

    engine.recentResults = [true, false];
    engine._applyRealtimeDifficulty(false);

    expect(engine.difficultyLevel).toBe("medium");
    expect(scaffoldTriggered).toBe(true);
  });
});
