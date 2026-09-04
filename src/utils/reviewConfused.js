/**
 * Resolve confused-pair keys (glyph or charId) into CHARACTER_DATABASE entries.
 */
import { CHARACTER_DATABASE } from "../data/characters.js";

export function resolveCharRef(ref) {
  if (!ref) return null;
  return CHARACTER_DATABASE.find((c) => c.id === ref || c.char === ref) || null;
}

/**
 * Top confused targets from errorProfiles → char records for review queue.
 * @param {object} errorProfiles
 * @param {number} limit
 * @returns {object[]} character DB entries
 */
export function confusedTargetsForReview(errorProfiles, limit = 3) {
  const pairs = errorProfiles?.confusedPairs || {};
  const ranked = Object.entries(pairs)
    .map(([target, map]) => {
      const count = typeof map === "object"
        ? Object.values(map).reduce((s, v) => s + (Number(v) || 0), 0)
        : Number(map) || 0;
      return { target, count };
    })
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return ranked
    .map((x) => resolveCharRef(x.target))
    .filter(Boolean);
}

/** Prefer getTopConfusedPair when building spotter / drill distractors */
export function distractorsFromConfusedPair(pair, fallbackChars = []) {
  if (!pair?.confused) return fallbackChars;
  const conf = resolveCharRef(pair.confused);
  const target = resolveCharRef(pair.target);
  const out = [];
  if (conf) out.push(conf.char);
  if (target) out.push(target.char);
  for (const ch of fallbackChars) {
    if (!out.includes(ch)) out.push(ch);
  }
  return out;
}
