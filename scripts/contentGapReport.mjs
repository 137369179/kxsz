#!/usr/bin/env node
/**
 * Content gap report for characterDetails — run: node scripts/contentGapReport.mjs
 * Does not mutate data; prints Stage-1 priorities for words/oracle enrichment.
 */
import { CHARACTER_DATABASE } from "../src/data/characters.js";
import { CHARACTER_DETAILS } from "../src/data/characterDetails.js";

const rows = CHARACTER_DATABASE.map((c) => {
  const d = CHARACTER_DETAILS[c.id] || {};
  const words = d.words || [];
  return {
    id: c.id,
    char: c.char,
    stage: c.stage || 1,
    words: words.length,
    hasOracle: !!(d.oracleGlyph && String(d.oracleGlyph).trim()),
    hasMeanings: !!(d.meanings && d.meanings.primary),
  };
});

const weakWords = rows.filter((r) => r.words < 2);
const noOracle = rows.filter((r) => !r.hasOracle);
const stage1Weak = weakWords.filter((r) => r.stage === 1);

console.log(JSON.stringify({
  totalChars: rows.length,
  weakWords: weakWords.length,
  noOracle: noOracle.length,
  stage1Total: rows.filter((r) => r.stage === 1).length,
  stage1HasOracle: rows.filter((r) => r.stage === 1 && r.hasOracle).length,
  stage1NoOracle: rows.filter((r) => r.stage === 1 && !r.hasOracle).length,
  stage1WeakWords: stage1Weak.length,
  stage1WeakSample: stage1Weak.slice(0, 30).map((r) => `${r.id}:${r.char}(w${r.words})`),
  stage1NoOracleSample: noOracle.filter((r) => r.stage === 1).slice(0, 20).map((r) => `${r.id}:${r.char}`),
}, null, 2));
