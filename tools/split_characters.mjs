/**
 * 字库拆分工具：把 src/data/characters.js（3.1MB 全量内联）拆为两层
 * ------------------------------------------------------------------
 *   1. src/data/characters.js        —— 索引版（首屏地图/列表必需字段，~240KB）
 *   2. src/data/characterDetails.js  —— 详情版（strokes/evolution/gameConfig 等，按需懒加载）
 *
 * 用法: node tools/split_characters.mjs
 * 说明: 拆分后 charDetailLoader.ensureDetails() 会把详情 Object.assign 回原字对象，
 *       保持 12 个消费方 API 兼容（无需改动）。
 */
import { writeFileSync, readFileSync, statSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// 索引字段：首屏地图渲染 + 关卡进度 + 列表排序 必需（轻量字段）
const INDEX_FIELDS = [
  "id", "char", "pinyin", "pinyinTone", "radical", "strokeCount",
  "stage", "themeIsland", "unitIndex", "levelIndex", "charType",
  "mechanism", "interaction",
];

const { CHARACTER_DATABASE } = await import(join(ROOT, "src/data/characters.js"));

// 提取 STAGES_METADATA 文本（原样保留）
const origSrc = readFileSync(join(ROOT, "src/data/characters.js"), "utf8");
const stagesMatch = origSrc.match(/export const STAGES_METADATA[\s\S]*$/);
const stagesBlock = stagesMatch ? stagesMatch[0] : "";

// ---- 拆分 ----
const indexRecords = [];
const detailsMap = {};
for (const c of CHARACTER_DATABASE) {
  const idx = {};
  const det = {};
  for (const k of Object.keys(c)) {
    if (INDEX_FIELDS.includes(k)) idx[k] = c[k];
    else det[k] = c[k];
  }
  indexRecords.push(idx);
  detailsMap[c.id] = det;
}

// ---- 无损校验：合并还原后必须与原始逐字段一致 ----
let mismatch = 0;
for (const c of CHARACTER_DATABASE) {
  const merged = { ...indexRecords.find((x) => x.id === c.id), ...detailsMap[c.id] };
  for (const k of Object.keys(c)) {
    if (JSON.stringify(merged[k]) !== JSON.stringify(c[k])) {
      mismatch++;
      if (mismatch <= 5) console.log("  ❌ 字段不一致:", c.id, k);
    }
  }
  if (Object.keys(merged).length !== Object.keys(c).length && mismatch === 0) {
    mismatch++;
    console.log("  ❌ 字段数不一致:", c.id);
  }
}
if (mismatch) {
  console.error(`\n❌ 无损校验失败（${mismatch} 处不一致），已中止，未写入任何文件。`);
  process.exit(1);
}

// ---- 写文件 ----
const indexBody = "export const CHARACTER_DATABASE = " +
  JSON.stringify(indexRecords) + ";\n\n";

const indexHeader = `/**
 * 凯茜识字 (Cathy Literacy) - 阶梯字库【索引层】（首屏瘦身）
 * ------------------------------------------------------------------
 * 仅含地图/关卡/列表渲染必需的轻量字段。
 * 详情字段（strokes/evolution/gameConfig/meanings/words/sentence 等）
 * 见 characterDetails.js，经 src/utils/charDetailLoader.js 按需懒加载。
 * 本文件由 tools/split_characters.mjs 生成，请勿手工编辑。
 */

`;

const detailsHeader = `/**
 * 凯茜识字 (Cathy Literacy) - 阶梯字库【详情层】（懒加载）
 * ------------------------------------------------------------------
 * 含笔顺(strokes)/象形演变(evolution)/游戏配置(gameConfig)/释义(meanings)/
 * 词组(words)/造句(sentence)/形近字(confusingChars) 等重量级字段。
 * 由 src/utils/charDetailLoader.js 的 ensureDetails() 按需动态 import。
 * 本文件由 tools/split_characters.mjs 生成，请勿手工编辑。
 */

`;

const detailsBody = "export const CHARACTER_DETAILS = " +
  JSON.stringify(detailsMap) + ";\n";

writeFileSync(join(ROOT, "src/data/characters.js"), indexHeader + indexBody + stagesBlock);
writeFileSync(join(ROOT, "src/data/characterDetails.js"), detailsHeader + detailsBody);

const fmt = (p) => (statSync(p).size / 1024).toFixed(1) + " KB";
console.log(`\n✅ 无损校验通过（${CHARACTER_DATABASE.length} 字，零丢失）`);
console.log(`   characters.js       ${fmt(join(ROOT, "src/data/characters.js"))}   (索引层)`);
console.log(`   characterDetails.js ${fmt(join(ROOT, "src/data/characterDetails.js"))}   (详情层)`);
