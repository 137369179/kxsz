import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setupTestDom, createMockElement } from "../testDomMock.js";
import { withAnticipatoryFeedback } from "../../src/utils/anticipatoryLoader.js";

setupTestDom();

describe("withAnticipatoryFeedback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves asyncFn result and cleans badge after slow work", async () => {
    const el = createMockElement("button", "boot-btn");
    el.appendChild = vi.fn((child) => {
      el._badge = child;
    });
    const slow = vi.fn(async () => {
      await new Promise((r) => setTimeout(r, 300));
      return "ok";
    });
    const p = withAnticipatoryFeedback(el, slow, {
      anticipatoryThreshold: 150,
      loadingText: "准备中...",
    });
    await vi.advanceTimersByTimeAsync(160);
    expect(el.appendChild).toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(200);
    await expect(p).resolves.toBe("ok");
  });

  it("passes through when element missing", async () => {
    await expect(withAnticipatoryFeedback(null, async () => 7)).resolves.toBe(7);
  });
});
