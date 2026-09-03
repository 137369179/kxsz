/**
 * Strip Unicode emoji / pictographs for chrome UI copy.
 * Pedagogical data (characterDetails.emoji / playHint) may still keep emoji;
 * use this when rendering parent-facing or chrome strings.
 */
const EMOJI_RE =
  /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}\u{FE0F}\u{200D}]/gu;

export function stripEmoji(text) {
  if (text == null) return "";
  return String(text).replace(EMOJI_RE, "").replace(/[ \t]{2,}/g, " ").trim();
}

export function hasEmoji(text) {
  if (text == null) return false;
  EMOJI_RE.lastIndex = 0;
  return EMOJI_RE.test(String(text));
}
