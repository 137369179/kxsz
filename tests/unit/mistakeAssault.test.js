import { describe, it, expect, beforeEach, vi } from "vitest";
import { setupTestDom } from "../testDomMock.js";

setupTestDom();

import { runMistakeAssaultSession } from "../../src/utils/reviewHub/mistakeAssault.js";
import { ReviewModule } from "../../src/components/ReviewModule.js";
import { ebbinghausManager } from "../../src/utils/ebbinghaus.js";
import { soundAndFX } from "../../src/utils/soundEngine.js";

describe("mistakeAssault - 易错难字消灭战", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    ebbinghausManager.progress = {
      coins: 100,
      stars: 50,
      charRecords: {},
    };
    vi.clearAllMocks();
  });

  it("当没有学习记录时，展示友好安宁提示并提供返回入口", () => {
    let quitCalled = false;
    const session = runMistakeAssaultSession({
      containerEl: container,
      ebbinghaus: ebbinghausManager,
      onQuit: () => {
        quitCalled = true;
      },
    });

    expect(container.innerHTML).toContain("城堡十分安宁");
    const quitBtn = container.querySelector("#btn-assault-empty-quit");
    expect(quitBtn).toBeTruthy();

    quitBtn.click();
    expect(quitCalled).toBe(true);
    session.destroy();
  });

  it("当存在难字时，正确进入突击战场并渲染4个候选水晶", () => {
    // 注入一个已学难字 (char_001 是 "日")
    ebbinghausManager.progress.charRecords["char_001"] = {
      charId: "char_001",
      learnedAt: Date.now(),
      masteryRate: 50,
      isDifficult: true,
      reviewCount: 3,
    };

    const session = runMistakeAssaultSession({
      containerEl: container,
      ebbinghaus: ebbinghausManager,
    });

    expect(container.innerHTML).toContain("难字消灭战");
    expect(container.innerHTML).toContain("找出难字：“日”");

    const btn0 = container.querySelector("#assault-opt-0");
    const btn1 = container.querySelector("#assault-opt-1");
    const btn2 = container.querySelector("#assault-opt-2");
    const btn3 = container.querySelector("#assault-opt-3");
    expect(btn0 && btn1 && btn2 && btn3).toBeTruthy();

    const chars = [btn0.dataset.char, btn1.dataset.char, btn2.dataset.char, btn3.dataset.char];
    expect(chars).toContain("日");

    session.destroy();
  });

  it("答对难字时，完成复习记录、清除难字标记并奖励星币", () => {
    const initialCoins = ebbinghausManager.progress.coins || 0;
    ebbinghausManager.progress.charRecords["char_001"] = {
      charId: "char_001",
      learnedAt: Date.now(),
      masteryRate: 50,
      isDifficult: true,
      reviewCount: 3,
    };

    const session = runMistakeAssaultSession({
      containerEl: container,
      ebbinghaus: ebbinghausManager,
    });

    // 找到对应 "日" 的按钮
    let correctBtn = null;
    for (let i = 0; i < 4; i++) {
      const b = container.querySelector(`#assault-opt-${i}`);
      if (b && b.dataset.char === "日") {
        correctBtn = b;
        break;
      }
    }
    expect(correctBtn).toBeTruthy();

    correctBtn.click();

    expect(ebbinghausManager.progress.charRecords["char_001"].isDifficult).toBe(false);
    expect(ebbinghausManager.progress.coins).toBe(initialCoins + 5);

    session.destroy();
  });

  it("ReviewModule 在空状态下提供难字突击战快捷启动入口", () => {
    // 没有任何到期字，但有历史难字
    ebbinghausManager.progress.charRecords["char_001"] = {
      charId: "char_001",
      learnedAt: Date.now(),
      masteryRate: 50,
      isDifficult: true,
      nextReviewDate: Date.now() + 86400000,
    };

    const reviewMod = new ReviewModule(container);
    reviewMod.renderEmpty();

    const assaultBtn = container.querySelector("#btn-start-difficult-assault");
    expect(assaultBtn).toBeTruthy();
    expect(container.innerHTML).toContain("难字消灭突击战");

    // 点击按钮会调用 startDifficultAssault
    const spy = vi.spyOn(reviewMod, "startDifficultAssault");
    assaultBtn.click();
    expect(spy).toHaveBeenCalled();

    reviewMod.destroy();
  });
});
