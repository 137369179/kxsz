#!/usr/bin/env node
/**
 * Patch oracle/bronze teaching glyphs into characterDetails (+ seed_premium when present).
 * Merges all tools/content/*_oracle_glyphs.json (fill-empty-only).
 * Usage: node tools/patch_oracle_glyphs.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { CHARACTER_DATABASE } from "../src/data/characters.js";
import { CHARACTER_DETAILS } from "../src/data/characterDetails.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "tools/content");
const detailsPath = join(root, "src/data/characterDetails.js");
const premiumPath = join(root, "tools/content/seed_premium.json");

const seedFiles = readdirSync(contentDir)
  .filter((f) => f.endsWith("_oracle_glyphs.json"))
  .sort()
  .map((f) => join(contentDir, f));

const glyphs = {};
for (const path of seedFiles) {
  const seed = JSON.parse(readFileSync(path, "utf8"));
  Object.assign(glyphs, seed.glyphs || {});
}

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
  " * Oracle teaching glyph patches via tools/patch_oracle_glyphs.mjs\n" +
  " */\n";
writeFileSync(
  detailsPath,
  header + "export const CHARACTER_DETAILS = " + JSON.stringify(CHARACTER_DETAILS) + ";\n",
  "utf8"
);

let premiumPatched = 0;
try {
  const premium = JSON.parse(readFileSync(premiumPath, "utf8"));
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
} catch (err) {
  console.warn("premium sync skipped:", err.message);
}

console.log(
  JSON.stringify(
    {
      seedFiles: seedFiles.map((p) => p.replace(root + "/", "")),
      glyphKeys: Object.keys(glyphs).length,
      patched,
      skippedUnknown,
      premiumPatched,
      detailsPath,
    },
    null,
    2
  )
);
