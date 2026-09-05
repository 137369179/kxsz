import { describe, it, expect } from "vitest";
import {
  getDueReviewCharIds,
  completeReview,
  completeCharacter,
  ebbinghausManager,
} from "../../src/utils/schedulerFacade.js";
import { buildOptions } from "../../src/utils/playHub/playHelpers.js";

describe("schedulerFacade", () => {
  it("exposes due / complete APIs backed by ebbinghausManager", () => {
    expect(typeof getDueReviewCharIds).toBe("function");
    expect(typeof completeReview).toBe("function");
    expect(typeof completeCharacter).toBe("function");
    expect(ebbinghausManager).toBeTruthy();
    expect(Array.isArray(getDueReviewCharIds())).toBe(true);
  });
});

describe("buildOptions adaptive distractorCount", () => {
  it("returns 3 options when distractorCount is 2 (easy)", () => {
    const cur = { char: "日", confusingChars: ["目", "白", "田", "旦"] };
    const opts = buildOptions(cur, { distractorCount: 2 });
    expect(opts).toContain("日");
    expect(opts.length).toBe(3);
    expect(new Set(opts).size).toBe(opts.length);
  });

  it("defaults to 4 options", () => {
    const cur = { char: "日", confusingChars: ["目", "白", "田"] };
    const opts = buildOptions(cur);
    expect(opts.length).toBe(4);
  });
});
