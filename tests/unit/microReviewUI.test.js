import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setupTestDom } from "../testDomMock.js";

setupTestDom();

import { eventBus } from "../../src/utils/eventBus.js";
import { MICRO_EVENTS, _resetMicroState, startMicroScheduler } from "../../src/utils/microReviewScheduler.js";
import {
  bindMicroReviewUI,
  showMicroReviewPrompt,
  _resetMicroReviewUIForTests,
  isMicroReviewOpen,
} from "../../src/utils/microReviewUI.js";

describe("microReviewUI", () => {
  beforeEach(() => {
    _resetMicroState();
    _resetMicroReviewUIForTests();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    _resetMicroReviewUIForTests();
    document.getElementById("micro-review-overlay")?.remove();
  });

  it("showMicroReviewPrompt mounts dialog", () => {
    showMicroReviewPrompt({ type: "20min" });
    const el = document.getElementById("micro-review-overlay");
    expect(el).toBeTruthy();
    expect(el.textContent).toContain("快闪复习");
  });

  it("TRIGGER event opens prompt after bindMicroReviewUI", () => {
    bindMicroReviewUI();
    startMicroScheduler({ enabled: true });
    eventBus.emit(MICRO_EVENTS.TRIGGER, { type: "60min" });
    expect(document.getElementById("micro-review-overlay")).toBeTruthy();
    expect(document.body.textContent).toContain("60 分钟");
    expect(isMicroReviewOpen()).toBe(true);
  });
});
