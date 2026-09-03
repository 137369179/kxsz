import { describe, it, expect, vi } from "vitest";
import { PinyinModule } from "../../src/components/PinyinModule.js";
import fs from "fs";
import path from "path";

describe("PinyinModule (奇趣拼音王国)", () => {
  const mockContainer = {
    innerHTML: "",
    querySelector: vi.fn(() => null),
    querySelectorAll: vi.fn(() => []),
    appendChild: vi.fn()
  };

  it("should instantiate with default atlas tab and initial selected pinyin", () => {
    const mod = new PinyinModule(mockContainer);
    expect(mod.currentTab).toBe("atlas");
    expect(mod.selectedCategory).toBe("initial");
    expect(mod.selectedPinyin).toBeTruthy();
    expect(mod.selectedPinyin.pinyin).toBe("b");
  });

  it("should switch tabs correctly", () => {
    const mod = new PinyinModule(mockContainer);
    mod.currentTab = "coaster";
    expect(mod._renderCurrentTabContent()).toContain("四声调趣味过山车");

    mod.currentTab = "collision";
    expect(mod._renderCurrentTabContent()).toContain("声韵拼读碰撞实验室");
  });

  it("should be 100% free of Unicode emojis in PinyinModule.js", () => {
    const filePath = path.resolve(__dirname, "../../src/components/PinyinModule.js");
    const content = fs.readFileSync(filePath, "utf-8");
    const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;
    expect(emojiRegex.test(content)).toBe(false);
  });

  it("T14: locatePinyin should accurately switch category and locate initial or final", () => {
    const mod = new PinyinModule(mockContainer);
    mod.locatePinyin("míng");
    expect(mod.currentTab).toBe("atlas");
    expect(mod.selectedCategory).toBe("initial");
    expect(mod.selectedPinyin.pinyin).toBe("m");

    mod.locatePinyin("ang");
    expect(mod.selectedCategory).toBe("final");
    expect(mod.selectedPinyin.pinyin).toBe("ang");
  });
});
