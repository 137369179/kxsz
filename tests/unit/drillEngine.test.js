import { describe, it, expect, vi } from "vitest";
import { DrillEngine } from "../../src/utils/drillEngine.js";

const sampleChar = {
  id: "char_001",
  char: "日",
  pinyin: "rì",
  confusingChars: ["目", "白", "田"],
  words: [{ word: "太阳", pinyin: "tài yáng", mean: "恒星" }, { word: "日光", pinyin: "rì guāng" }],
  sentence: "红红的日头升起来了。"
};

describe("DrillEngine (6-Mode Micro Drills)", () => {
  it("should instantiate correctly and initialize 3 rounds", () => {
    const mount = { innerHTML: "", querySelector: vi.fn(), querySelectorAll: vi.fn(() => []) };
    const engine = new DrillEngine(mount, sampleChar, vi.fn(), { allChars: [sampleChar] });
    expect(engine.char.char).toBe("日");
    expect(engine.queue.length).toBe(3);
    expect(engine.roundIndex).toBe(0);
  });

  it("should build type pool including word_fill and sentence_fill when data is present", () => {
    const mount = { innerHTML: "", querySelector: vi.fn(), querySelectorAll: vi.fn(() => []) };
    const engine = new DrillEngine(mount, sampleChar, vi.fn());
    const pool = engine.buildTypePool();
    expect(pool).toContain("audio_choice");
    expect(pool).toContain("similar_pick");
    expect(pool).toContain("balloon_pop");
    expect(pool).toContain("word_fill");
    expect(pool).toContain("sentence_fill");
  });

  it("should build 4 options containing the target character", () => {
    const mount = { innerHTML: "", querySelector: vi.fn(), querySelectorAll: vi.fn(() => []) };
    const engine = new DrillEngine(mount, sampleChar, vi.fn());
    const options = engine.buildOptions();
    expect(options.length).toBe(4);
    expect(options).toContain("日");
  });

  it("should build prompt and options for each drill type", () => {
    const mount = { innerHTML: "", querySelector: vi.fn(), querySelectorAll: vi.fn(() => []) };
    const engine = new DrillEngine(mount, sampleChar, vi.fn());

    const types = ["audio_choice", "similar_pick", "balloon_pop", "word_fill", "sentence_fill", "audio_to_text"];
    for (const t of types) {
      const prompt = engine.buildPrompt(t);
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(10);

      const opts = engine.buildOptionsFor(t);
      expect(opts).toBeDefined();
    }
  });

  it("T7: should support audio_to_text drill type and cloze uniqueness validation", () => {
    const mount = { innerHTML: "", querySelector: vi.fn(), querySelectorAll: vi.fn(() => []) };
    const engine = new DrillEngine(mount, sampleChar, vi.fn());

    const pool = engine.buildTypePool();
    expect(pool).toContain("audio_to_text");

    expect(engine.validateClozeUniqueness("红红的日头升起来了。", "日")).toBe(true);
    expect(engine.validateClozeUniqueness("红红的日头日的太阳。", "日")).toBe(false);
  });
});

