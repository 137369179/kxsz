import { describe, it, expect, vi, beforeEach } from "vitest";
import { setupTestDom, createMockElement } from "../testDomMock.js";

setupTestDom();

import { LearnModule } from "../../src/components/LearnModule.js";
import { soundAndFX } from "../../src/utils/soundEngine.js";
import { CHARACTER_DATABASE } from "../../src/data/characters.js";
import { ensureDetails } from "../../src/utils/charDetailLoader.js";
import { clearLearnProgress } from "../../src/utils/learnProgressStore.js";

await ensureDetails();

describe("LearnModule (六步闭环识字学习)", () => {
  let container;
  const mockChar = CHARACTER_DATABASE[0] || {
    id: "char_001",
    char: "日",
    pinyin: "rì",
    meaning: "太阳",
    words: [{ word: "红日", pinyin: "hóng rì" }],
    mechanism: "rub_reveal",
    stage: 1,
    island: 1
  };

  beforeEach(() => {
    clearLearnProgress(mockChar.id);
    container = createMockElement("div", "learn-container");
    vi.spyOn(soundAndFX, "stopSpeaking").mockImplementation(() => {});
    vi.spyOn(soundAndFX, "playPop").mockImplementation(() => {});
    vi.spyOn(soundAndFX, "speakPriority").mockImplementation(() => {});
  });

  it("should initialize at Step 1 (玩) with given charData", () => {
    const onFinish = vi.fn();
    const onBack = vi.fn();
    const learn = new LearnModule(container, mockChar, onFinish, onBack);

    expect(learn.currentStep).toBe(1);
    expect(learn.charData.char).toBe(mockChar.char);
    expect(learn.onFinish).toBe(onFinish);
    expect(learn.onBackToMap).toBe(onBack);
  });

  it("should advance step on nextStep() call", () => {
    const learn = new LearnModule(container, mockChar, vi.fn(), vi.fn());
    expect(learn.currentStep).toBe(1);

    learn.nextStep();
    expect(learn.currentStep).toBe(2);

    learn.nextStep();
    expect(learn.currentStep).toBe(3);
  });

  it("should render recognizable step indicator and top nav bar", () => {
      const learn = new LearnModule(container, mockChar, vi.fn(), vi.fn());
      learn.render();

      expect(container.innerHTML).toContain("返回大地图");
      // B1/B6 铁律：8 步闭环（玩/认/读/练/控笔/描红/独立写/测）
      expect(container.innerHTML).toContain("玩");
      expect(container.innerHTML).toContain("认");
      expect(container.innerHTML).toContain("读");
      expect(container.innerHTML).toContain("练");
      expect(container.innerHTML).toContain("控笔");
      expect(container.innerHTML).toContain("描红");
      expect(container.innerHTML).toContain("写");
      expect(container.innerHTML).toContain("测");
    });

  it("should advance through 8 steps cleanly", () => {
    const learn = new LearnModule(container, mockChar, vi.fn(), vi.fn());
    for (let i = 1; i <= 8; i++) {
      expect(learn.currentStep).toBe(i);
      learn.nextStep();
    }
    // Cap at step 8
    expect(learn.currentStep).toBe(8);
  });

  it("should properly destroy sub-engines, timers, and listeners on destroy()", () => {
    const learn = new LearnModule(container, mockChar, vi.fn(), vi.fn());
    const dummyGame = { destroy: vi.fn() };
    const dummyHanzi = { destroy: vi.fn() };
    const dummyDrill = { destroy: vi.fn() };

    learn.activePlayGame = dummyGame;
    learn.hanziEngine = dummyHanzi;
    learn.drillEngine = dummyDrill;

    learn.destroy();

    expect(dummyGame.destroy).toHaveBeenCalled();
    expect(dummyHanzi.destroy).toHaveBeenCalled();
    expect(dummyDrill.destroy).toHaveBeenCalled();
    expect(learn.activePlayGame).toBeNull();
    expect(learn.hanziEngine).toBeNull();
    expect(learn.drillEngine).toBeNull();
  });
});
