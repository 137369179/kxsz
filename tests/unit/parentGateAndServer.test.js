import { describe, it, expect, vi } from "vitest";
import { generateParentChallenge } from "../../src/utils/parentGate.js";
import { resolveSafePath, ROOT } from "../../server.js";
import path from "node:path";

describe("generateParentChallenge", () => {
  it("medium returns multiplication with matching answer and operands", () => {
    for (let i = 0; i < 20; i++) {
      const ch = generateParentChallenge("medium");
      expect(ch.a).toBeGreaterThanOrEqual(3);
      expect(ch.b).toBeGreaterThanOrEqual(3);
      expect(ch.answer).toBe(ch.a * ch.b);
      expect(ch.question).toContain("×");
    }
  });

  it("hard returns mixed expression with correct answer", () => {
    for (let i = 0; i < 20; i++) {
      const ch = generateParentChallenge("hard");
      expect(typeof ch.answer).toBe("number");
      const m = ch.question.match(/^(\d+) × (\d+) ([+-]) (\d+) = \?$/);
      expect(m).toBeTruthy();
      const [, a, b, op, c] = m;
      const expected = op === "+" ? (+a * +b + +c) : (+a * +b - +c);
      expect(ch.answer).toBe(expected);
    }
  });
});

describe("server resolveSafePath", () => {
  it("allows normal relative assets", () => {
    const p = resolveSafePath("/index.html");
    expect(p).toBe(path.resolve(ROOT, "index.html"));
  });

  it("rejects any path containing ..", () => {
    expect(resolveSafePath("/../../etc/passwd")).toBeNull();
    expect(resolveSafePath("../../../etc/passwd")).toBeNull();
    expect(resolveSafePath("/assets/../package.json")).toBeNull();
  });

  it("maps absolute-looking URLs into ROOT only", () => {
    const resolved = resolveSafePath("/etc/passwd");
    expect(resolved).toBe(path.resolve(ROOT, "etc/passwd"));
  });
});
