/**
 * 变态级逐字契约校验器：对全部 1490 字验证每个组件实际读取的字段契约。
 * 用法: node tools/_contract_audit.mjs
 */
import { CHARACTER_DATABASE as db } from "../src/data/characters.js";

const MECHANISMS = new Set(["rise", "wipe", "tap", "multi", "hold", "slide", "drag"]);
const isCJK = (s) => typeof s === "string" && /[一-鿿]/.test(s);
const isPt = (p) => p && typeof p.x === "number" && typeof p.y === "number"
  && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= -0.01 && p.x <= 100.01 && p.y >= -0.01 && p.y <= 100.01;

const violations = {}; // key -> [charId...]
const add = (key, id) => { (violations[key] ||= []).push(id); };
const sample = (arr, n = 6) => arr.slice(0, n);

for (const c of db) {
  const id = c.id || "(无id)";

  // ---- 基础身份 ----
  if (!c.id) add("缺id", "(?)");
  if (!isCJK(c.char)) add("char非CJK", id);
  if (!c.pinyin || typeof c.pinyin !== "string") add("缺pinyin", id);
  else if (!/^[a-zāáǎàēéěèīíǐìōóǒòūúǔùüǘǚǜńňǹ\s]+$/i.test(c.pinyin)) add("pinyin可疑", id);
  if (!Number.isInteger(c.pinyinTone) || c.pinyinTone < 0 || c.pinyinTone > 5) add("pinyinTone越界", id);
  if (!c.radical) add("缺radical", id);
  if (!Number.isInteger(c.strokeCount) || c.strokeCount < 1 || c.strokeCount > 30) add("strokeCount越界", id);
  if (![1, 2, 3].includes(c.stage)) add("stage越界", id);
  if (!c.emoji) add("缺emoji", id);

  // ---- HanziEngine 描红契约: strokes[].start/end(/corner) 必须为 0-100 坐标 ----
  if (!Array.isArray(c.strokes) || c.strokes.length === 0) add("缺strokes", id);
  else {
    if (c.strokes.length !== c.strokeCount) add(`strokes数≠strokeCount(${c.strokes.length}vs${c.strokeCount})`, id);
    c.strokes.forEach((s, i) => {
      if (!isPt(s?.start)) add(`strokes[${i}].start非法`, id);
      if (!isPt(s?.end)) add(`strokes[${i}].end非法`, id);
      if (s?.corner !== undefined && s?.corner !== null && !isPt(s.corner)) add(`strokes[${i}].corner非法`, id);
    });
  }

  // ---- 练字步骤4 射击游戏契约: options 必含本字（否则永远无法通关卡死） ----
  const gc = c.gameConfig;
  if (!gc || !Array.isArray(gc.options) || gc.options.length < 2) add("gameConfig.options非法", id);
  else {
    if (!gc.options.includes(c.char)) add("射击游戏无本字(不可通关!)", id);
    if (gc.options.filter((o) => o === c.char).length > 1) add("射击游戏本字重复", id);
    if (!gc.options.every(isCJK)) add("gameConfig.options含非CJK", id);
    if (new Set(gc.options).size !== gc.options.length) add("gameConfig.options重复项", id);
    if (gc.correctIndex !== undefined && (!Number.isInteger(gc.correctIndex) || gc.correctIndex < 0 || gc.correctIndex >= gc.options.length)) add("correctIndex越界", id);
    if (Number.isInteger(gc.correctIndex) && gc.options[gc.correctIndex] !== c.char) add("correctIndex非本字", id);
  }

  // ---- 玩步骤(playSceneEngine)契约: mechanism ∈ 7类 ----
  if (!MECHANISMS.has(c.mechanism)) add(`mechanism未知(${c.mechanism})`, id);
  if (!c.playHint) add("缺playHint", id);

  // ---- 认字步骤(CardModule)契约 ----
  if (!c.evolution || typeof c.evolution !== "object") add("缺evolution", id);
  else {
    for (const k of ["story", "oracleDesc", "bronzeDesc", "sealDesc", "modernDesc"]) {
      if (!c.evolution[k] || typeof c.evolution[k] !== "string") add(`evolution.${k}缺失`, id);
    }
  }
  if (!Array.isArray(c.words) || c.words.length === 0) add("缺words", id);
  else c.words.forEach((w, i) => {
    if (!w || !w.word || !isCJK(w.word)) add(`words[${i}].word非法`, id);
    if (w && !w.pinyin) add(`words[${i}].pinyin缺失`, id);
    if (w && !w.desc) add(`words[${i}].desc缺失`, id);
  });
  if (!c.sentence || !isCJK(c.sentence.replace(/[，。！？、]/g, ""))) add("sentence非法", id);

  // ---- 形近字契约 ----
  if (!Array.isArray(c.confusingChars) || c.confusingChars.length === 0) add("缺confusingChars", id);
  else {
    if (!c.confusingChars.every(isCJK)) add("confusingChars含非CJK", id);
    if (c.confusingChars.includes(c.char)) add("confusingChars含本字", id);
    if (!c.confusingHint) add("缺confusingHint", id);
  }
}

// ---- 全库级别 ----
const charSeen = new Map();
for (const c of db) {
  if (charSeen.has(c.char)) add("char重复", `${c.id}(与${charSeen.get(c.char)}同字'${c.char}')`);
  else charSeen.set(c.char, c.id);
}
// levelIndex 唯一性（同 stage 内）
const lvl = new Map();
for (const c of db) {
  const k = `${c.stage}:${c.levelIndex}`;
  if (lvl.has(k)) add("levelIndex重复", `${c.id}(与${lvl.get(k)}同${k})`);
  else lvl.set(k, c.id);
}

// ---- 报告 ----
const keys = Object.keys(violations);
console.log(`校验字数: ${db.length}`);
if (keys.length === 0) {
  console.log("✅ 全部 1490 字 × 全组件契约 零违例");
} else {
  console.log(`❌ 违例类别 ${keys.length} 类：`);
  for (const k of keys.sort((a, b) => violations[b].length - violations[a].length)) {
    console.log(`  [${violations[k].length}] ${k}  例: ${sample(violations[k]).join(", ")}`);
  }
}
