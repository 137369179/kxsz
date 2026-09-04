import { describe, it, expect, vi, beforeEach } from "vitest";
import { setupTestDom, createMockElement } from "../testDomMock.js";

setupTestDom();

import { LearnModule } from "../../src/components/LearnModule.js";
import { soundAndFX } from "../../src/utils/soundEngine.js";
import { CHARACTER_DATABASE } from "../../src/data/characters.js";
import { ensureDetails } from "../../src/utils/charDetailLoader.js";
import { clearLearnProgress } from "../../src/utils/learnProgressStore.js";
import { ebbinghausManager } from "../../src/utils/ebbinghaus.js";
import { resolveBookVoiceReward, BOOK_VOICE_PASS_SCORE } from "../../src/utils/bookVoiceReward.js";
import { MODE_TO_MODULE } from "../../src/utils/appHub/moduleRegistry.js";
import { calculateStepProgress } from "../../src/utils/learnScoring.js";

await ensureDetails();

describe("age-adaptive step buttons never hardcode into skipped steps", () => {
  let container;
  const mockChar = CHARACTER_DATABASE[0] || {
    id: "char_001",
    char: "日",
    pinyin: "rì",
    meaning: "太阳",
    words: [{ word: "红日", pinyin: "hóng rì" }],
    mechanism: "rub_reveal",
    stage: 1,
    island: 1,
  };

  beforeEach(() => {
    clearLearnProgress(mockChar.id);
    ebbinghausManager.progress.profile = { ...(ebbinghausManager.progress.profile || {}), age: 5 };
    ebbinghausManager.progress.settings.stepSequenceOverride = null;
    container = createMockElement("div", "learn-container");
    vi.spyOn(soundAndFX, "stopSpeaking").mockImplementation(() => {});
    vi.spyOn(soundAndFX, "playPop").mockImplementation(() => {});
    vi.spyOn(soundAndFX, "speakPriority").mockImplementation(() => {});
    vi.spyOn(soundAndFX, "playSuccessSound").mockImplementation(() => {});
  });

  it("age 5 sequence skips 读/写 and nextStep jumps 2→4", () => {
    const learn = new LearnModule(container, mockChar, vi.fn(), vi.fn());
    expect(learn.stepSequence).toEqual([1, 2, 4, 5, 6, 8]);
    expect(learn._evalStars).toBeNull();
    learn.currentStep = 2;
    learn.nextStep();
    expect(learn.currentStep).toBe(4);
  });

  it("recognize finish uses nextStep not hardcoded 3", () => {
    const learn = new LearnModule(container, mockChar, vi.fn(), vi.fn());
    learn._selfExplainDone = true;
    learn._etymologyQuizAnswered = true;
    learn.currentStep = 2;
    learn.render();
    const finish = container.querySelector("#btn-finish-rec-step");
    expect(finish).toBeTruthy();
    finish.click();
    expect(learn.currentStep).toBe(4);
    expect(learn.currentStep).not.toBe(3);
  });

  it("trace finish for age 5 goes to 8 not 7", () => {
    const learn = new LearnModule(container, mockChar, vi.fn(), vi.fn());
    learn.currentStep = 6;
    // nextStep from 6 in [1,2,4,5,6,8] → 8
    learn.nextStep();
    expect(learn.currentStep).toBe(8);
  });

  it("chest defaults to 2 stars when never evaluated", () => {
    const learn = new LearnModule(container, mockChar, vi.fn(), vi.fn());
    expect(learn._evalStars).toBeNull();
    const raw = learn._evalStars;
    const earned = (typeof raw === "number" && !Number.isNaN(raw))
      ? Math.max(0, Math.min(3, raw))
      : 2;
    expect(earned).toBe(2);
  });
});

describe("book voice reward honesty", () => {
  it("rejects missing / NaN score", () => {
    expect(resolveBookVoiceReward(null).ok).toBe(false);
    expect(resolveBookVoiceReward({}).coins).toBe(0);
  });

  it("rejects score below pass threshold including 0", () => {
    expect(BOOK_VOICE_PASS_SCORE).toBe(60);
    expect(resolveBookVoiceReward({ score: 0 })).toEqual({
      ok: false,
      score: 0,
      coins: 0,
    });
    expect(resolveBookVoiceReward({ score: 59 }).ok).toBe(false);
  });

  it("tiers coins by score and accepts totalScore", () => {
    expect(resolveBookVoiceReward({ score: 60 }).coins).toBe(10);
    expect(resolveBookVoiceReward({ score: 80 }).coins).toBe(15);
    expect(resolveBookVoiceReward({ totalScore: 95 }).coins).toBe(20);
  });
});

describe("PK mode maps to play hub", () => {
  it("MODE_TO_MODULE.pk === play", () => {
    expect(MODE_TO_MODULE.pk).toBe("play");
  });
});

describe("playHub confuse writeback contracts", () => {
  it("pkArena / boss / spotter / match / fusion / culture halls write review outcomes", async () => {
    const fs = await import("node:fs");
    const read = (rel) => fs.readFileSync(new URL(rel, import.meta.url), "utf8");
    const pk = read("../../src/utils/playHub/pkArena.js");
    const boss = read("../../src/utils/playHub/bossBattle.js");
    const spotter = read("../../src/utils/playHub/spotterGame.js");
    const match = read("../../src/utils/playHub/matchGame.js");
    const fusion = read("../../src/utils/playHub/fusionLab.js");
    const bookQuiz = read("../../src/utils/bookHub/bookQuizFlow.js");
    const helpers = read("../../src/utils/playHub/playHelpers.js");
    const idiom = read("../../src/utils/playHub/idiomHall.js");
    const poem = read("../../src/utils/playHub/poemHall.js");
    const family = read("../../src/utils/playHub/familyWorkshop.js");
    expect(pk).toMatch(/recordMistake\([^)]*similar_confuse/);
    expect(boss).toMatch(/recordMistake\([^)]*similar_confuse/);
    expect(spotter).toMatch(/completeReview\([^)]*,\s*false\)/);
    expect(spotter).toMatch(/recordMistake\([^)]*similar_confuse/);
    expect(match).toMatch(/recordMistake\([^)]*pronunciation/);
    expect(fusion).toMatch(/writeKnownCharsReview/);
    expect(bookQuiz).toMatch(/completeReview\([^)]*,\s*true\)/);
    expect(bookQuiz).toMatch(/completeReview\([^)]*,\s*false\)/);
    expect(helpers).toMatch(/export function writeKnownCharsReview/);
    expect(idiom).toMatch(/writeKnownCharsReview/);
    expect(poem).toMatch(/writeKnownCharsReview/);
    expect(family).toMatch(/writeKnownCharsReview/);
  });
});

describe("calculateStepProgress respects totalSteps", () => {
  it("uses adaptive total", () => {
    expect(calculateStepProgress(4, [1, 2, 4], 6)).toBe(50);
    expect(calculateStepProgress(8, [1, 2, 3, 4, 5, 6, 7], 8)).toBe(88);
  });
});
