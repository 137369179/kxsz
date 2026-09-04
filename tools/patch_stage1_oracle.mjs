#!/usr/bin/env node
/**
 * Patch Stage1 pictograph oracle/bronze glyphs into characterDetails (+ seed_premium when present).
 * Usage: node tools/patch_stage1_oracle.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { CHARACTER_DATABASE } from "../src/data/characters.js";
import { CHARACTER_DETAILS } from "../src/data/characterDetails.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = join(root, "tools/content/stage1_oracle_glyphs.json");
const detailsPath = join(root, "src/data/characterDetails.js");
const premiumPath = join(root, "tools/content/seed_premium.json");

const seed = JSON.parse(readFileSync(seedPath, "utf8"));
const glyphs = seed.glyphs || {};

let patched = 0;
let skippedUnknown = 0;
const charToId = new Map(CHARACTER_DATABASE.map((c) => [c.char, c.id]));

for (const [ch, g] of Object.entries(glyphs)) {
  const id = charToId.get(ch);
  if (!id || !CHARACTER_DETAILS[id]) {
    skippedUnknown++;
    continue;
  }
  const d = CHARACTER_DETAILS[id];
  const nextOracle = String(g.oracleGlyph || "").trim();
  const nextBronze = String(g.bronzeGlyph || "").trim();
  let changed = false;
  if (nextOracle && !(d.oracleGlyph || "").trim()) {
    d.oracleGlyph = nextOracle;
    changed = true;
  }
  if (nextBronze && !(d.bronzeGlyph || "").trim()) {
    d.bronzeGlyph = nextBronze;
    changed = true;
  }
  if (changed) patched++;
}

const header =
  "/**\n" +
  " * Auto-split detail payload for CHARACTER_DATABASE (do not hand-edit bulk).\n" +
  " * Oracle Stage1 pictograph patches via tools/patch_stage1_oracle.mjs\n" +
  " */\n";
writeFileSync(
  detailsPath,
  header + "export const CHARACTER_DETAILS = " + JSON.stringify(CHARACTER_DETAILS) + ";\n",
  "utf8"
);

// Keep premium seed in sync for overlapping chars
try {
  const premium = JSON.parse(readFileSync(premiumPath, "utf8"));
  let premiumPatched = 0;
  for (const row of premium) {
    const g = glyphs[row.char];
    if (!g) continue;
    const nextOracle = String(g.oracleGlyph || "").trim();
    const nextBronze = String(g.bronzeGlyph || "").trim();
    if (nextOracle && !(row.oracleGlyph || "").trim()) {
      row.oracleGlyph = nextOracle;
      premiumPatched++;
    }
    if (nextBronze && !(row.bronzeGlyph || "").trim()) {
      row.bronzeGlyph = nextBronze;
    }
  }
  writeFileSync(premiumPath, JSON.stringify(premium), "utf8");
  console.log(JSON.stringify({ patched, skippedUnknown, premiumPatched, detailsPath }, null, 2));
} catch (err) {
  console.log(JSON.stringify({ patched, skippedUnknown, premiumError: String(err), detailsPath }, null, 2));
}
