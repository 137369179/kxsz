import { describe, it, expect } from "vitest";
import { shouldUseSelfExplain } from "../../src/utils/learnSteps/selfExplainPrompt.js";

describe("shouldUseSelfExplain", () => {
  it("true for age ≥5", () => {
    expect(shouldUseSelfExplain(5)).toBe(true);
    expect(shouldUseSelfExplain(4)).toBe(false);
  });
});
