import { ATOMIC_CARD_TYPES } from "../flashcardEngine.js";
import { FSRGRating } from "../fsrsScheduler.js";

export { FSRGRating };

export function pickRecallMode(age) {
  const a = Number(age) || 6;
  if (a <= 4) {
    return { mode: "point", cardType: ATOMIC_CARD_TYPES.SOUND_TO_CHAR };
  }
  return { mode: "free", cardType: ATOMIC_CARD_TYPES.CHAR_TO_PINYIN };
}

export const JOL_LEVELS = Object.freeze({
  EASY: "easy",
  FUZZY: "fuzzy",
  HARD: "hard",
});

/**
 * @param {boolean} knew 用户自评「对了」
 * @param {string} [jolLevel] 用户在 prompt 阶段的 JOL 预判 ('easy' | 'fuzzy' | 'hard')
 */
export function mapSelfReportToRating(knew, jolLevel = null) {
  if (!knew) return FSRGRating.AGAIN;
  if (jolLevel === JOL_LEVELS.EASY) return FSRGRating.EASY;
  if (jolLevel === JOL_LEVELS.HARD) return FSRGRating.HARD;
  return FSRGRating.GOOD;
}
