/**
 * 绘本亲子朗读评测奖励结算 — 仅在达到及格分时发币
 */

/** 最低及格分：低于此分不发币（含 evaluate 失败返回的 score:0） */
export const BOOK_VOICE_PASS_SCORE = 60;

/**
 * @param {{ score?: unknown, totalScore?: unknown } | null | undefined} result
 * @returns {{ ok: boolean, score: number | null, coins: number }}
 */
export function resolveBookVoiceReward(result) {
  const raw = result?.totalScore ?? result?.score;
  if (typeof raw !== "number" || Number.isNaN(raw)) {
    return { ok: false, score: null, coins: 0 };
  }
  const score = Math.min(100, Math.max(0, Math.round(raw)));
  if (score < BOOK_VOICE_PASS_SCORE) {
    return { ok: false, score, coins: 0 };
  }
  // 分档：60–74 → 10，75–89 → 15，90+ → 20
  const coins = score >= 90 ? 20 : score >= 75 ? 15 : 10;
  return { ok: true, score, coins };
}
