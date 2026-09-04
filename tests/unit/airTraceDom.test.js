// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from "vitest";
import { openAirTracePrompt } from "../../src/utils/learnSteps/airTracePrompt.js";

beforeAll(() => {
  // jsdom 不实现 rAF：置为 no-op，仅验证 DOM 构建与事件接线（动画路径由坐标数学覆盖）
  if (typeof global.requestAnimationFrame !== "function") {
    global.requestAnimationFrame = () => 0;
    global.cancelAnimationFrame = () => {};
  }
});

describe("openAirTracePrompt (DOM)", () => {
  it("builds the air-trace modal and closes on done", () => {
    const charItem = {
      char: "木",
      strokes: [
        { start: { x: 10, y: 10 }, end: { x: 90, y: 10 }, name: "横" },
        { start: { x: 50, y: 10 }, end: { x: 50, y: 90 }, name: "竖" },
      ],
    };
    let result = null;
    openAirTracePrompt(charItem, (r) => { result = r; });

    const modal = document.getElementById("air-trace-modal");
    expect(modal).not.toBeNull();
    expect(document.getElementById("air-trace-canvas")).not.toBeNull();
    expect(document.getElementById("btn-air-done")).not.toBeNull();
    expect(document.getElementById("btn-air-replay")).not.toBeNull();

    document.getElementById("btn-air-done").click();
    expect(result).not.toBeNull();
    expect(result.done).toBe(true);
    expect(document.getElementById("air-trace-modal")).toBeNull();
  });

  it("replay button does not throw and backdrop click skips", () => {
    let skipped = null;
    openAirTracePrompt(
      { char: "水", strokes: [{ start: { x: 0, y: 0 }, end: { x: 100, y: 100 }, name: "捺" }] },
      (r) => { skipped = r; }
    );
    expect(() => document.getElementById("btn-air-replay").click()).not.toThrow();
    // 点遮罩空白处 = 跳过
    document.getElementById("air-trace-modal").click();
    expect(skipped).not.toBeNull();
    expect(skipped.skipped).toBe(true);
  });
});
