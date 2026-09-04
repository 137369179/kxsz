import { describe, it, expect, vi } from "vitest";
import { TreehouseModule } from "../../src/components/TreehouseModule.js";
import fs from "fs";
import path from "path";

describe("TreehouseModule (凯茜伴学小树屋养成家园)", () => {
  const mockContainer = {
    innerHTML: "",
    querySelector: vi.fn(() => null),
    querySelectorAll: vi.fn(() => []),
    appendChild: vi.fn()
  };

  it("should calculate correct tree growth stages based on learned character count", () => {
    const mod = new TreehouseModule(mockContainer);
    
    // Level 1: 0 - 50
    expect(mod.getTreeStage(10).level).toBe(1);
    expect(mod.getTreeStage(50).level).toBe(1);

    // Level 2: 51 - 200
    expect(mod.getTreeStage(51).level).toBe(2);
    expect(mod.getTreeStage(200).level).toBe(2);

    // Level 3: 201 - 600
    expect(mod.getTreeStage(201).level).toBe(3);
    expect(mod.getTreeStage(600).level).toBe(3);

    // Level 4: 601 - 1490
    expect(mod.getTreeStage(601).level).toBe(4);
    expect(mod.getTreeStage(1490).level).toBe(4);

    // Each stage has a valid artwork image
    for (const count of [10, 80, 300, 800]) {
      const stage = mod.getTreeStage(count);
      expect(stage.image).toMatch(/^assets\/images\/tree_stage_\d\.webp$/);
      expect(fs.existsSync(path.resolve(__dirname, "../../", stage.image))).toBe(true);
    }
  });

  it("should be 100% free of Unicode emojis in TreehouseModule.js", () => {
    const filePath = path.resolve(__dirname, "../../src/components/TreehouseModule.js");
    const content = fs.readFileSync(filePath, "utf-8");
    const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;
    expect(emojiRegex.test(content)).toBe(false);
  });
});
