/**
 * tests/unit/parentModule.test.js
 * ================================================================
 * T18 单元测试：家长端中心与 AI 伴学日志 Tab
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ParentModule } from "../../src/components/ParentModule.js";
import { setupTestDom } from "../testDomMock.js";
import fs from "fs";
import path from "path";

describe("ParentModule (T18 家长中心与 AI 伴学日志)", () => {
  let mockContainer;

  beforeEach(() => {
    setupTestDom();
    mockContainer = {
      innerHTML: "",
      querySelector: vi.fn(() => null),
      querySelectorAll: vi.fn(() => []),
      appendChild: vi.fn()
    };
  });

  it("初始状态处于门禁锁定状态", () => {
    const mod = new ParentModule(mockContainer);
    expect(mod.isUnlocked).toBe(false);
    expect(mod.currentTab).toBe("dashboard");
    expect(mod.mathAnswer).toBeGreaterThan(0);
  });

  it("支持切换到 ai_log 标签并渲染 AI 伴学诊断与流水", () => {
    const mod = new ParentModule(mockContainer);
    mod.isUnlocked = true;
    mod.currentTab = "ai_log";

    const mockProgress = {
      learnedChars: ["char_001", "char_002"],
      studyLog: [],
      stars: 30,
      coins: 20
    };
    const mockSettings = { dailyCharTarget: 3 };

    const html = mod.renderAiLogTab(mockProgress, 2, mockSettings, 0);
    expect(html).toContain("凯茜 AI 伴学专属导师");
    expect(html).toContain("在线伴学诊断中");
    expect(html).toContain("AI 导师给爸爸妈妈的伴学寄语");
    expect(html).toContain("btn-speak-ai-log");
  });

  it("严守工程红线：ParentModule 与 parentHub 零 Unicode Emoji", () => {
    const files = [
      path.resolve(__dirname, "../../src/components/ParentModule.js"),
      path.resolve(__dirname, "../../src/utils/parentHub/parentGateUI.js"),
      path.resolve(__dirname, "../../src/utils/parentHub/parentPoster.js"),
      path.resolve(__dirname, "../../src/utils/parentHub/parentSync.js"),
      path.resolve(__dirname, "../../src/utils/parentHub/parentTabs.js"),
      path.resolve(__dirname, "../../src/utils/parentHub/parentDashboardEvents.js"),
      path.resolve(__dirname, "../../src/utils/parentHub/parentTrophies.js")
    ];
    const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(emojiRegex.test(content), filePath).toBe(false);
    }
  });
});
