/**
 * tests/unit/homophoneTrainer.test.js
 * ================================================================
 * T17 单元测试：同音字辨析专项训练引擎
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  HOMOPHONE_PAIRS,
  buildHomophoneExercise,
  openHomophoneTrainerModal
} from "../../src/utils/homophoneTrainer.js";
import { setupTestDom } from "../testDomMock.js";

describe("HomophoneTrainer (T17 同音字辨析专项训练)", () => {
  beforeEach(() => {
    setupTestDom();
  });

  it("HOMOPHONE_PAIRS 包含常用的目/木、石/十、蓝/篮、在/再等辨析对", () => {
    expect(HOMOPHONE_PAIRS.length).toBeGreaterThanOrEqual(5);
    const mu = HOMOPHONE_PAIRS.find(p => p.pinyin === "mù");
    expect(mu.chars).toContain("目");
    expect(mu.chars).toContain("木");
    expect(mu.clues["目"].hint).toContain("眼睛");
    expect(mu.clues["木"].hint).toContain("树木");
  });

  it("buildHomophoneExercise 能针对目标字生成含挖空题干与选项的练习", () => {
    const ex = buildHomophoneExercise("目");
    expect(ex).toBeTruthy();
    expect(ex.pinyin).toBe("mù");
    expect(ex.options).toContain("目");
    expect(ex.options).toContain("木");
    expect(ex.questionSentence).toContain("【 ？ 】");
  });

  it("openHomophoneTrainerModal 能在 DOM 中创建同音字训练模态框", () => {
    openHomophoneTrainerModal({ char: "目", pinyin: "mù" });
    const modal = document.getElementById("homophone-trainer-modal");
    expect(modal).toBeTruthy();
    expect(modal.textContent).toContain("同音字火眼金睛特训");
    const optButtons = modal.querySelectorAll(".btn-homophone-opt");
    expect(optButtons.length).toBe(2);
  });
});
