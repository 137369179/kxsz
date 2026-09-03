import { describe, it, expect } from "vitest";
import { shuffle, buildOptions } from "../../src/utils/playHub/playHelpers.js";

describe("playHelpers", () => {
  it("shuffle returns same length and elements", () => {
    const src = [1, 2, 3, 4, 5];
    const out = shuffle(src);
    expect(out).toHaveLength(5);
    expect([...out].sort()).toEqual([...src].sort());
    expect(src).toEqual([1, 2, 3, 4, 5]); // original untouched
  });

  it("buildOptions returns 4 unique choices including the target", () => {
    const cur = { char: "日", confusingChars: ["目", "曰"] };
    const opts = buildOptions(cur);
    expect(opts).toHaveLength(4);
    expect(opts).toContain("日");
    expect(new Set(opts).size).toBe(4);
  });
});
