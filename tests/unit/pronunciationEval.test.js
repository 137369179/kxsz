import { describe, it, expect, beforeEach } from "vitest";
import { pronunciationEval, PronunciationAssessmentEngine } from "../../src/utils/pronunciationEval.js";

describe("PronunciationAssessmentEngine", () => {
  beforeEach(() => {
    pronunciationEval._cleanupTimers();
    pronunciationEval.state = "idle";
    pronunciationEval._lastResult = null;
    pronunciationEval._manualMode = false;
  });

  it("isSupported() should return false in Node.js environment", () => {
    expect(typeof pronunciationEval.isSupported).toBe("function");
    expect(pronunciationEval.isSupported()).toBe(false);
  });

  it("can be instantiated as a standalone class", () => {
    const engine = new PronunciationAssessmentEngine();
    expect(engine.isSupported()).toBe(false);
    expect(engine.state).toBe("idle");
  });

  describe("manualEvaluate", () => {
    it("returns 100/3 stars for a 3-star self-rating", () => {
      const res = pronunciationEval.manualEvaluate({ text: "大", stars: 3 });
      expect(res.score).toBe(100);
      expect(res.totalScore).toBe(100);
      expect(res.stars).toBe(3);
      expect(res.isCorrect).toBe(true);
      expect(res.hypothesis).toBe("大");
      expect(res.perCharReport).toHaveLength(1);
      expect(res.perCharReport[0]).toMatchObject({
        ref: "大",
        hyp: "大",
        similarity: 1,
        score: 100,
        type: "match",
      });
      expect(res.audioUrl).toBeNull();
      expect(res.manual).toBe(true);
    });

    it("returns 78/2 stars for a 2-star self-rating", () => {
      const res = pronunciationEval.manualEvaluate({ text: "日", stars: 2 });
      expect(res.score).toBe(78);
      expect(res.stars).toBe(2);
      expect(res.isCorrect).toBe(false);
    });

    it("returns 55/1 star for a 1-star self-rating", () => {
      const res = pronunciationEval.manualEvaluate({ text: "月", stars: 1 });
      expect(res.score).toBe(55);
      expect(res.stars).toBe(1);
      expect(res.isCorrect).toBe(false);
    });

    it("clamps stars to [1, 3]", () => {
      expect(pronunciationEval.manualEvaluate({ text: "火", stars: 0 }).stars).toBe(1);
      expect(pronunciationEval.manualEvaluate({ text: "水", stars: 5 }).stars).toBe(3);
    });

    it("generates perCharReport for each CJK character", () => {
      const res = pronunciationEval.manualEvaluate({ text: "小朋友", stars: 3 });
      expect(res.perCharReport).toHaveLength(3);
      expect(res.perCharReport.map((r) => r.ref)).toEqual(["小", "朋", "友"]);
    });
  });

  describe("run_AC_6_scenario", () => {
    it("passes all four acceptance scenarios", () => {
      const r = pronunciationEval.run_AC_6_scenario();
      expect(r.ok).toBe(true);
      expect(r.allPass).toBe(true);
      expect(r.results).toHaveLength(4);
      expect(r.results.every((x) => x.pass)).toBe(true);
    });

    it("distinguishes perfect match from tone-only difference", () => {
      const r = pronunciationEval.run_AC_6_scenario();
      const perfect = r.results.find((x) => x.label === "完美匹配");
      expect(perfect.pa).toBe(100);
      expect(perfect.cm).toBe(100);
      expect(perfect.total).toBe(100);
    });

    it("penalizes deletion while keeping completeness high", () => {
      const r = pronunciationEval.run_AC_6_scenario();
      const del = r.results.find((x) => x.label.includes("漏读 1 字（高完整度"));
      expect(del.cm).toBeGreaterThanOrEqual(85);
      expect(del.pa).toBeLessThan(100);
    });
  });
});
