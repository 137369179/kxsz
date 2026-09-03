/**
 * tests/unit/mascotProgress.test.js
 * ================================================================
 * T13 单元测试：内在动机系统与凯茜专属表情故事解锁
 */

import { describe, it, expect, beforeEach } from "vitest";
import { MascotProgress, MASCOT_STORIES } from "../../src/utils/mascotProgress.js";
import { setupTestDom } from "../testDomMock.js";
import { storageManager } from "../../src/utils/storageManager.js";

describe("MascotProgress (T13 内在动机系统)", () => {
  beforeEach(() => {
    setupTestDom();
    storageManager.removeItem("mascot_progress");
  });

  it("初始化状态包含 neutral 表情与空故事池", () => {
    const mp = new MascotProgress();
    expect(mp.getUnlockedExpressions()).toContain("neutral");
    expect(mp.getUnlockedStories()).toHaveLength(0);
  });

  it("连续正确 3 次解锁 happy 表情", () => {
    const mp = new MascotProgress();
    mp.onCorrectPronunciation();
    mp.onCorrectPronunciation();
    expect(mp.getUnlockedExpressions()).not.toContain("happy");

    mp.onCorrectPronunciation();
    expect(mp.getUnlockedExpressions()).toContain("happy");
  });

  it("连续正确 5 次解锁 excited 表情与故事片段", () => {
    const mp = new MascotProgress();
    for (let i = 0; i < 5; i++) {
      mp.onCorrectPronunciation();
    }
    expect(mp.getUnlockedExpressions()).toContain("excited");
    expect(mp.getUnlockedStories().length).toBeGreaterThanOrEqual(1);
  });

  it("错误作答重置连击但不抹杀已解锁表情", () => {
    const mp = new MascotProgress();
    for (let i = 0; i < 3; i++) {
      mp.onCorrectPronunciation();
    }
    expect(mp.getUnlockedExpressions()).toContain("happy");

    mp.onWrongAttempt();
    expect(mp.progress.consecutiveCorrect).toBe(0);
    expect(mp.getUnlockedExpressions()).toContain("happy");
  });
});
