import { describe, it, expect } from "vitest";
import {
  EMOTION_MATRIX,
  PAUSE_MATRIX_MS,
  ReadingModeController,
  estimateCharDurationMs,
  readingMode
} from "../../src/utils/readingModes.js";

describe("ReadingModes & Emotion Engine", () => {
  it("should define all 6 required child literacy emotion profiles", () => {
    const requiredEmotions = ["neutral", "encouragement", "gentle", "excited", "correction", "bedtime"];
    for (const em of requiredEmotions) {
      expect(EMOTION_MATRIX[em]).toBeDefined();
      expect(typeof EMOTION_MATRIX[em].rateMul).toBe("number");
      expect(typeof EMOTION_MATRIX[em].pitchOffset).toBe("number");
    }
  });

  it("should define reading pause intervals across char, word, and sentence modes", () => {
    expect(PAUSE_MATRIX_MS.char).toBeDefined();
    expect(PAUSE_MATRIX_MS.word).toBeDefined();
    expect(PAUSE_MATRIX_MS.sentence).toBeDefined();
    expect(PAUSE_MATRIX_MS.char.intraWord).toBeGreaterThanOrEqual(200);
    expect(PAUSE_MATRIX_MS.char.punct_dot).toBeGreaterThanOrEqual(400);
  });

  it("should instantiate ReadingModeController singleton", () => {
    expect(readingMode).toBeInstanceOf(ReadingModeController);
    expect(readingMode.currentMode).toBeDefined();
    expect(readingMode.currentEmotion).toBe("neutral");
  });

  it("should switch modes and emotions accurately", () => {
    const ctrl = new ReadingModeController();
    ctrl.setMode("word");
    expect(ctrl.currentMode).toBe("word");

    ctrl.setEmotion("excited");
    expect(ctrl.currentEmotion).toBe("excited");
    expect(ctrl._emotion().rateMul).toBeGreaterThan(1.0);
  });

  it("should estimate char duration in ms correctly", () => {
    const dur1 = estimateCharDurationMs("日", "char", "neutral");
    const dur2 = estimateCharDurationMs("日", "char", "excited");
    expect(dur1).toBeGreaterThan(0);
    expect(dur2).toBeGreaterThan(0);
  });
});
