import { describe, it, expect } from "vitest";

/**
 * Documents the safety-timeout contract for CathyAppManager.transitionToMode:
 * on timeout, only clear overlay / isTransitioning — never force currentMode.
 */
export function applyTransitionSafetyTimeout(app) {
  if (app._settled) return;
  app._settled = true;
  app.isTransitioning = false;
  // Do NOT mutate currentMode here
}

describe("transition safety timeout contract", () => {
  it("must not force currentMode back to map", () => {
    const app = { _settled: false, isTransitioning: true, currentMode: "book" };
    applyTransitionSafetyTimeout(app);
    expect(app.isTransitioning).toBe(false);
    expect(app._settled).toBe(true);
    expect(app.currentMode).toBe("book");
  });
});
