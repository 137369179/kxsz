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

const stage1 = rows.filter((r) => r.stage === 1);
const stage2 = rows.filter((r) => r.stage === 2);
const stage3 = rows.filter((r) => r.stage === 3);

console.log(JSON.stringify({
  totalChars: rows.length,
  weakWords: weakWords.length,
  noOracle: noOracle.length,
  stage1Total: stage1.length,
  stage1HasOracle: stage1.filter((r) => r.hasOracle).length,
  stage1NoOracle: stage1.filter((r) => !r.hasOracle).length,
  stage2Total: stage2.length,
  stage2HasOracle: stage2.filter((r) => r.hasOracle).length,
  stage2NoOracle: stage2.filter((r) => !r.hasOracle).length,
  stage3Total: stage3.length,
  stage3HasOracle: stage3.filter((r) => r.hasOracle).length,
  stage3NoOracle: stage3.filter((r) => !r.hasOracle).length,
  stage1WeakWords: stage1Weak.length,
  stage1WeakSample: stage1Weak.slice(0, 30).map((r) => `${r.id}:${r.char}(w${r.words})`),
  stage1NoOracleSample: noOracle.filter((r) => r.stage === 1).slice(0, 20).map((r) => `${r.id}:${r.char}`),
}, null, 2));
