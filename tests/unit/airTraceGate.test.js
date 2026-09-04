import { describe, it, expect } from "vitest";
import { shouldUseAirTrace, openAirTracePrompt } from "../../src/utils/learnSteps/airTracePrompt.js";

describe("shouldUseAirTrace", () => {
  it("true for age ≥3, false for age <3", () => {
    expect(shouldUseAirTrace(3)).toBe(true);
    expect(shouldUseAirTrace(6)).toBe(true);
    expect(shouldUseAirTrace(2)).toBe(false);
  });

  it("exported as a function", () => {
    expect(typeof openAirTracePrompt).toBe("function");
  });

  it("no-op under node env (no document) → calls onDone with skipped", () => {
    let called = false;
    openAirTracePrompt({ char: "木", strokes: [{ start: { x: 0, y: 0 }, end: { x: 100, y: 100 }, name: "横" }] }, (r) => {
      called = true;
      expect(r.skipped).toBe(true);
    });
    expect(called).toBe(true);
  });
});
