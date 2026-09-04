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

/** @param {boolean} knew 用户自评「对了」 */
export function mapSelfReportToRating(knew) {
  return knew ? FSRGRating.GOOD : FSRGRating.AGAIN;
}
