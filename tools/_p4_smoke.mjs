#!/usr/bin/env node
/**
 * P4 全链路冒烟 — 8 引擎真实数据验证
 * 
 * 覆盖：B3 FSRS / B8 Flashcard / B10 绘本 / B12 字源 / B13 降噪
 *       B14 难度 / B16 童谣 / B19 多模态
 * 
 * 用法: node tools/_p4_smoke.mjs
 */

import { CHARACTER_DATABASE } from "../src/data/characters.js";
import { buildAtomicCardsForChar, recordAtomicAnswer, isCardMastered, ATOMIC_CARD_TYPES } from "../src/utils/flashcardEngine.js";
import { scheduleFSRS, initFSRSRecord, fsrsPredict, FSRGRating } from "../src/utils/fsrsScheduler.js";
import { forChar as mmForChar, SCENES as MM_SCENES } from "../src/utils/multimodalEngine.js";
import { getQuestionWeights, DIFFICULTY_LEVELS } from "../src/utils/difficultyEngine.js";
import { buildPlan as buildChantPlan } from "../src/utils/chantEngine.js";
import { summarizeEtymology, buildEvolutionStages } from "../src/utils/etymologyEngine.js";
import { checkBookReadiness, READING_STATUS } from "../src/utils/readingGatekeeper.js";
import { rewardThrottle } from "../src/utils/rewardThrottle.js";
import { buildFullReport, generateParentDiagnosis } from "../src/utils/reportEngine.js";

const OK = "\x1b[32m✓\x1b[0m";
const FAIL = "\x1b[31m✗\x1b[0m";
let pass = 0, total = 0;
const check = (label, cond, detail = "") => {
  total++;
  if (cond) { pass++; console.log(`  ${OK} ${label}${detail ? " — " + detail : ""}`); }
  else { console.log(`  ${FAIL} ${label}${detail ? " — " + detail : ""}`); }
};

console.log("═══════════════════════════════════════════════════");
console.log("  P4 全链路冒烟 — 真实字库验证");
console.log("═══════════════════════════════════════════════════\n");

const c0 = CHARACTER_DATABASE[0];

// [1] 字库基础
console.log("[1] 字库基础字段");
check("1489字", CHARACTER_DATABASE.length === 1489);
check("pinyin", !!c0.pinyin, c0.pinyin);
check("radical", !!c0.radical, c0.radical);
check("strokeCount", !!c0.strokeCount, c0.strokeCount);
check("charType", !!c0.charType, c0.charType);
console.log("");

// [2] B8 原子卡
console.log("[2] B8 Flashcard 原子化");
const cards = buildAtomicCardsForChar(c0, null, { skipMastered: true });
check("≥3 张原子卡", cards.length >= 3, `${cards.length}张`);
const r = {};
for (const t of Object.values(ATOMIC_CARD_TYPES)) for (let i = 0; i < 3; i++) recordAtomicAnswer(r, t, true);
check("3×全对→全掌握", Object.values(ATOMIC_CARD_TYPES).every(t => isCardMastered(r, t)));
console.log("");

// [3] B3 FSRS
console.log("[3] B3 FSRS + SM-18");
const s = initFSRSRecord("smoke");
const good = scheduleFSRS(s, FSRGRating.GOOD);
const easy = scheduleFSRS(good, FSRGRating.EASY);
const hard = scheduleFSRS(good, FSRGRating.HARD);
check("GOOD→EASY 递增", easy.stability > good.stability, `${good.stability.toFixed(2)}→${easy.stability.toFixed(2)}`);
check("GOOD→HARD 递减", hard.stability < good.stability, `${good.stability.toFixed(2)}→${hard.stability.toFixed(2)}`);
const pred = fsrsPredict(good);
check("retention 0-1", pred.retention > 0 && pred.retention <= 1, (pred.retention*100).toFixed(1) + "%");
console.log("");

// [4] B19 多模态
console.log("[4] B19 多模态融合 (LEARN/REVIEW/PLAY)");
const learn = mmForChar(c0, MM_SCENES.LEARN);
const review = mmForChar(c0, MM_SCENES.REVIEW);
const play = mmForChar(c0, MM_SCENES.PLAY);
check("LEARN ≥2 模态", Object.keys(learn.modalities).length >= 2, `${Object.keys(learn.modalities).length}个`);
check("REVIEW ≥1 模态", Object.keys(review.modalities).length >= 1);
check("PLAY ≥1 模态", Object.keys(play.modalities).length >= 1);
check("visual_glyph 在", !!learn.modalities.visual_glyph);
check("auditory_pinyin 在", !!learn.modalities.auditory_pinyin);
console.log("");

// [5] B14 难度
console.log("[5] B14 自适应难度");
const ew = getQuestionWeights(DIFFICULTY_LEVELS.EASY);
const hw = getQuestionWeights(DIFFICULTY_LEVELS.HARD);
const eSound = ew.find(w => w.type === "sound_to_char")?.weight || 0;
const hWord = hw.find(w => w.type === "word_building")?.weight || 0;
check("EASY sound_to_char=35%", eSound === 35);
check("HARD word_building=20%", hWord === 20);
console.log("");

// [6] B16 童谣
console.log("[6] B16 童谣节拍");
const chant = buildChantPlan(c0);
const beats = chant?.chars?.filter(c => !c.isPause).length || 0;
check("有 beats", beats >= 3, `${beats} beats`);
check("有总时长", (chant?.totalMs || 0) > 0, `${chant?.totalMs}ms`);
console.log("");

// [7] B12 字源
console.log("[7] B12 字源讲解");
check("summarizeEtymology", !!summarizeEtymology(c0));
check("timeline ≥3 stages", (buildEvolutionStages(c0)?.length || 0) >= 3);
console.log("");

// [8] B10 绘本
console.log("[8] B10 绘本子集");
const bk = { targetChars: ["x", "y", "z"], pages: [] };
check("全掌握→READY", checkBookReadiness(bk, { x: {}, y: {}, z: {} }).status === READING_STATUS.READY);
check("0掌握→BLOCKED", checkBookReadiness(bk, {}).status === READING_STATUS.BLOCKED);
console.log("");

// [9] B13 降噪
console.log("[9] B13 奖励降噪");
rewardThrottle.reset();
check("allow confetti initial", rewardThrottle.allow("confetti"));
check("allow star initial", rewardThrottle.allow("star"));
console.log("");

// [10] 报告
console.log("[10] 学习报告");
const prog = { charRecords: {}, stats: {}, books: {}, sessions: [] };
CHARACTER_DATABASE.slice(0, 5).forEach(c => prog.charRecords[c.id] = { correctRate: 0.9, correctStreak: 2 });
const rep = buildFullReport(prog);
check("有 coverage", !!rep.coverage);
check("有 mastery", !!rep.mastery);
const diag = generateParentDiagnosis(rep);
check("AI 诊断文本", typeof diag === "string" && diag.length > 20, diag.substring(0, 30) + "...");
console.log("");

console.log("═══════════════════════════════════════════════════");
console.log(`  结果: ${pass}/${total} 通过`);
if (pass === total) {
  console.log("  🎉 所有引擎在真实字库上正常工作");
  console.log("  ℹ 扩展模态 (emoji/chant/confuse/timeline) 待字库补全");
} else {
  console.log(`  ⚠ ${total - pass} 项失败 — 需要排查`);
}
console.log("═══════════════════════════════════════════════════");
process.exit(pass === total ? 0 : 1);
