import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("ReviewModule atomic honesty", () => {
  it("must not loop all ATOMIC_CARD_TYPES into recordAtomicAnswer", () => {
    const src = fs.readFileSync(
      path.resolve("src/components/ReviewModule.js"),
      "utf8"
    );
    expect(src).not.toMatch(
      /for\s*\(\s*const\s+cardType\s+of\s+Object\.values\(\s*ATOMIC_CARD_TYPES\s*\)\s*\)[\s\S]{0,120}recordAtomicAnswer/
    );
  });
});
