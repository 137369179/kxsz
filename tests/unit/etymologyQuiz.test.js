/**
 * tests/unit/etymologyQuiz.test.js
 * ================================================================
 * T15 单元测试：字理问答微交互系统 (generateEtymologyQuestion / openEtymologyQuiz)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { generateEtymologyQuestion, openEtymologyQuiz } from "../../src/utils/etymologyQuiz.js";
import { setupTestDom } from "../testDomMock.js";

const sampleChar = {
  id: "char_001",
  char: "日",
  radical: "日",
  meanings: {
    radicalHint: "和太阳、时间、光明有关",
    mnemonic: "太阳圆圆的"
  },
  evolution: {
    oracleDesc: "像圆圆的太阳，中间有一点光芒"
  }
};

describe("EtymologyQuiz (T15 字理问答微交互)", () => {
  beforeEach(() => {
    setupTestDom();
  });

  it("基于甲骨文描述生成象形源流问题", () => {
    const q = generateEtymologyQuestion(sampleChar);
    expect(q.question).toContain("甲骨文");
    expect(q.question).toContain("日");
    const correctOpt = q.options.find(o => o.correct);
    expect(correctOpt).toBeTruthy();
    expect(correctOpt.text).toBe("像圆圆的太阳，中间有一点光芒");
  });

  it("若缺少甲骨文描述，则降级为偏旁部首意符认知题", () => {
    const charWithoutOracle = {
      id: "char_999",
      char: "河",
      radical: "氵",
      meanings: {
        radicalHint: "和水流、江河有关"
      }
    };
    const q = generateEtymologyQuestion(charWithoutOracle);
    expect(q.question).toContain("部首偏旁");
    expect(q.question).toContain("氵");
    const correctOpt = q.options.find(o => o.correct);
    expect(correctOpt.text).toBe("和水流、江河有关");
  });

  it("openEtymologyQuiz 能够顺利在 DOM 中创建微问答模态框", () => {
    openEtymologyQuiz(sampleChar);
    const modal = document.getElementById("etymology-quiz-modal");
    expect(modal).toBeTruthy();
    expect(modal.textContent).toContain("凯茜字理微问答");
    const opts = modal.querySelectorAll(".quiz-opt-btn");
    expect(opts.length).toBeGreaterThanOrEqual(2);
  });
});
