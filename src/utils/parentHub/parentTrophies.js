/**
 * Parent trophy unlock — honest gates from real progress (no fake charCount/2).
 */
import { CHARACTER_DATABASE } from "../../data/characters.js";

export const TROPHY_LIST = [
  { id: "first_char", name: "识字小萌新", desc: "学会第 1 个汉字", req: "1 个字", icon: "star" },
  { id: "forest_master", name: "森林探险家", desc: "通关启蒙森林岛", req: "200 个字", icon: "islandForest" },
  { id: "town_hero", name: "小镇达人", desc: "通关生活常用小镇", req: "600 个字", icon: "islandTown" },
  { id: "space_conqueror", name: "太空小学者", desc: "通关星际探索岛", req: "1490 个字", icon: "islandSpace" },
  { id: "book_worm_1", name: "绘本初读者", desc: "完整读完 1 本分级绘本", req: "1 本绘本", icon: "book" },
  { id: "book_master", name: "故事大王", desc: "读完 10 本分级绘本", req: "10 本绘本", icon: "crown" },
  { id: "calligrapher", name: "小小书法家", desc: "AI 描红笔画全满分 50 次", req: "50 次满分", icon: "brush" },
  { id: "boss_killer", name: "难字克星", desc: "歼灭难字首领怪兽 5 次", req: "5 次首领", icon: "monster" },
  { id: "match_pro", name: "消消乐大师", desc: "汉字消消乐通关 10 局", req: "10 局通关", icon: "gem" },
  { id: "pk_champion", name: "竞技场之王", desc: "双人竞技场获胜 10 局", req: "10 局胜利", icon: "swords" },
  { id: "ebbinghaus_star", name: "记忆大师", desc: "连续 7 天按时完成艾宾浩斯复习", req: "7 天全勤", icon: "reviewBell" },
  { id: "golden_rich", name: "金币大富翁", desc: "累计赚取 200 枚凯茜星币", req: "200 星币", icon: "coin" }
];

function stageLearnedCount(progress, stage) {
  const records = progress.charRecords || {};
  const ids = new Set(Object.keys(records));
  return CHARACTER_DATABASE.filter((c) => (c.stage || 1) === stage && ids.has(c.id)).length;
}

/**
 * @param {object} progress
 * @param {number} [charCount]
 * @returns {Record<string, boolean>}
 */
export function resolveTrophyUnlocks(progress = {}) {
  const count = Object.keys(progress.charRecords || {}).length;
  const readBooks = progress.readBooks || [];
  const gs = progress.gameStats || {};
  const coinsEarned = progress.lifetimeCoinsEarned ?? progress.coins ?? 0;
  const perfectStrokes = gs.perfectStrokeCount || 0;
  const reviewStreak = progress.reviewStreakDays || gs.reviewStreakDays || 0;

  return {
    first_char: count >= 1,
    forest_master: stageLearnedCount(progress, 1) >= 200 || count >= 200,
    town_hero: (stageLearnedCount(progress, 1) + stageLearnedCount(progress, 2)) >= 600 || count >= 600,
    space_conqueror: count >= 1489,
    book_worm_1: readBooks.length >= 1,
    book_master: readBooks.length >= 10,
    calligrapher: perfectStrokes >= 50,
    boss_killer: (gs.bossWins || 0) >= 5,
    match_pro: (gs.matchClears || 0) >= 10,
    pk_champion: (gs.pkWins || 0) >= 10,
    ebbinghaus_star: reviewStreak >= 7,
    golden_rich: coinsEarned >= 200
  };
}

export function isTrophyUnlocked(trophyId, progress) {
  return !!resolveTrophyUnlocks(progress)[trophyId];
}

/** Human-readable step sequence preview for a given age */
export function describeStepSequenceForAge(age) {
  const n = Number(age);
  const a = Number.isFinite(n) && n > 0 ? Math.max(3, Math.min(10, Math.round(n))) : 6;
  if (a < 5) {
    return { age: a, steps: [1, 2, 4, 8], label: "4 步：玩 → 认 → 练 → 测（跳过读拼音与书写）" };
  }
  if (a < 7) {
    return { age: a, steps: [1, 2, 4, 5, 6, 8], label: "6 步：玩 → 认 → 练 → 控笔 → 描红 → 测（跳过读拼音与独立写）" };
  }
  return { age: a, steps: [1, 2, 3, 4, 5, 6, 7, 8], label: "8 步全流程：含读拼音与独立书写" };
}
