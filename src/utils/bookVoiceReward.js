/**
 * 绘本亲子朗读评测奖励结算 — 仅在真实评测分数可用时发币
 */

/**
 * @param {{ score?: unknown } | null | undefined} result
 * @returns {{ ok: boolean, score: number | null, coins: number }}
 */
export function resolveBookVoiceReward(result) {
  const raw = result?.score;
  if (typeof raw !== "number" || Number.isNaN(raw)) {
    return { ok: false, score: null, coins: 0 };
  }
  const score = Math.min(100, Math.max(0, Math.round(raw)));
  return { ok: true, score, coins: 20 };
}
