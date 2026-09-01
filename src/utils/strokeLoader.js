/**
 *  - 
 * ------------------------------------------------------------
 * hanzi_strokes.js  1300  3MB
 *  import 
 * 
 */

let _strokeCache = null;

/**
 *  {strokes, medians} null
 * @param {string} char
 */
export async function loadStrokes(char) {
  if (_strokeCache === null) {
    const mod = await import("../data/hanzi_strokes.js");
    _strokeCache = mod.HANZI_STROKES || {};
  }
  return _strokeCache[char] || null;
}

/**  */
export async function preloadStrokes() {
  if (_strokeCache === null) {
    const mod = await import("../data/hanzi_strokes.js");
    _strokeCache = mod.HANZI_STROKES || {};
  }
  return _strokeCache;
}
