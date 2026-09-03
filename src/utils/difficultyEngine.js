/**
 * difficultyEngine.js — E15 自适应难度算法
 *
 * 教育学依据：
 *   维果茨基近发展区（ZPD）— 难度 = 当前水平 + 一步挑战
 *   自适应测试理论 (CAT) — 动态调整题目难度快速定位能力
 *   成功率 70-85% 黄金区间 — 太难(≤50%)打击信心，太简单(≥95%)无增益
 *   年龄差异：3 岁 vs 8 岁 ZPD 完全不同
 *
 * 核心算法（闭环反馈）：
 *   1. 看 charRecords 的 masteryRate 分布 → 决定起始难度
 *   2. 跟踪最近 N 题正确率 → 实时升降难度
 *   3. 考虑年龄 + correctStreak → 微调节奏
 *
 * 输出给 drillEngine / sessionPlanner 消费：
 *   - difficultyLevel: "easy" | "medium" | "hard"
 *   - questionWeights: 各题型权重（自适应调整）
 *   - charSelection: 选字策略（先巩固难字 / 先推进新字）
 */

// ──────────────────────────────────────────────────────────
// 难度等级
// ──────────────────────────────────────────────────────────
export const DIFFICULTY_LEVELS = Object.freeze({
  EASY:   "easy",
  MEDIUM: "medium",
  HARD:   "hard",
});

// ──────────────────────────────────────────────────────────
// 阈值（教育学验证）
// ──────────────────────────────────────────────────────────

/** 黄金正确率区间（70-85%）*/
const GOLDEN_MIN = 0.70;
const GOLDEN_MAX = 0.85;

/** 低于这个 → 降难度 */
const TOO_LOW = 0.50;
/** 高于这个 → 升难度 */
const TOO_HIGH = 0.95;

/** 年龄校准：年龄越小，越保守 */
const AGE_CALIBRATION = {
  3: { masteryBonus: -10, hardAllowed: false },   // 3 岁：-10% mastery，禁止 hard
  4: { masteryBonus: -5,  hardAllowed: false },
  5: { masteryBonus: 0,   hardAllowed: true },
  6: { masteryBonus: 5,   hardAllowed: true },
  7: { masteryBonus: 10,  hardAllowed: true },
  8: { masteryBonus: 15,  hardAllowed: true },
};

const DEFAULT_AGE = 5;

// ──────────────────────────────────────────────────────────
// 1. 计算整体难度等级（基于 charRecords 分布）
// ──────────────────────────────────────────────────────────

/**
 * @param {object} charRecords  ebbinghaus progress.charRecords
 * @param {number} [age=5]       孩子年龄（3-8）
 * @returns {{ level, avgMasteryRate, distribution, rationale }}
 */
export function computeOverallDifficulty(charRecords, age = DEFAULT_AGE) {
  const records = Object.values(charRecords || {});
  if (records.length === 0) {
    return {
      level: DIFFICULTY_LEVELS.EASY,
      avgMasteryRate: 0,
      distribution: { easy: 1, medium: 0, hard: 0 },
      rationale: "无学习记录，起始 easy",
    };
  }

  const bonus = _ageBonus(age);

  let totalRate = 0;
  let easyCount = 0, mediumCount = 0, hardCount = 0;

  for (const r of records) {
    const rate = (r.masteryRate ?? 0) + bonus;
    totalRate += rate;

    if (rate < 40) hardCount++;
    else if (rate < 80) mediumCount++;
    else easyCount++;  // 掌握好 → 对应题可以 harder
  }

  const avgRate = Math.round((totalRate / records.length) * 10) / 10;
  const distTotal = easyCount + mediumCount + hardCount;

  let level;
  const ageCfg = AGE_CALIBRATION[Math.max(3, Math.min(8, age))];

  if (avgRate < 50) {
    level = DIFFICULTY_LEVELS.EASY;
  } else if (avgRate < 75) {
    level = DIFFICULTY_LEVELS.MEDIUM;
  } else if (ageCfg.hardAllowed && hardCount / distTotal > 0.15) {
    // hard count 占比 > 15% 且年龄允许 → hard
    level = DIFFICULTY_LEVELS.HARD;
  } else {
    level = DIFFICULTY_LEVELS.MEDIUM;
  }

  const rationale = `平均掌握率 ${avgRate}%（年龄${age}校准 ${bonus >= 0 ? "+" : ""}${bonus}）→ ${level}`;

  return {
    level,
    avgMasteryRate: avgRate,
    distribution: {
      easy: easyCount,
      medium: mediumCount,
      hard: hardCount,
    },
    rationale,
  };
}

function _ageBonus(age) {
  const cfg = AGE_CALIBRATION[Math.max(3, Math.min(8, age))];
  return cfg?.masteryBonus ?? 0;
}

// ──────────────────────────────────────────────────────────
// 2. 实时调节（基于最近 N 题正确率）
// ──────────────────────────────────────────────────────────

const RECENT_WINDOW = 5;  // 最近 5 题

/**
 * 实时调节难度（闭环反馈）。
 *
 * @param {Array<boolean>} recentResults  最近若干题结果 [true, false, true, ...]
 * @param {string} currentLevel           当前难度
 * @param {number} correctStreak          当前连对数
 * @returns {{ nextLevel, action, reason }}
 */
export function realtimeAdjust(recentResults, currentLevel, correctStreak = 0) {
  const window = (recentResults || []).slice(-RECENT_WINDOW);
  if (window.length === 0) {
    return { nextLevel: currentLevel, action: "hold", reason: "无最近题目" };
  }

  const correctCount = window.filter((r) => r).length;
  const accuracy = correctCount / window.length;

  // 规则 1：正确率 + streak 联合判断
  // streak ≥ 4 说明状态好，可以升难度
  if (accuracy >= GOLDEN_MAX && correctStreak >= 4 && currentLevel !== DIFFICULTY_LEVELS.HARD) {
    return {
      nextLevel: _nextLevel(currentLevel, +1),
      action: "increase",
      reason: `正确率 ${Math.round(accuracy * 100)}% + 连对 ${correctStreak} → 升级`,
    };
  }

  // 规则 2：正确率太低 → 降难度
  if (accuracy <= TOO_LOW) {
    return {
      nextLevel: _nextLevel(currentLevel, -1),
      action: "decrease",
      reason: `正确率仅 ${Math.round(accuracy * 100)}% → 降级保底`,
    };
  }

  // 规则 3：连续 2 题错 → 立即降级
  const lastTwo = window.slice(-2);
  if (lastTwo.length === 2 && lastTwo[0] === false && lastTwo[1] === false && currentLevel !== DIFFICULTY_LEVELS.EASY) {
    return {
      nextLevel: _nextLevel(currentLevel, -1),
      action: "decrease",
      reason: "连续 2 题错 → 降级",
    };
  }

  // 规则 4：正确率长期高于黄金区 → 微升
  if (accuracy > GOLDEN_MAX && window.length >= RECENT_WINDOW) {
    return {
      nextLevel: _nextLevel(currentLevel, +1),
      action: "increase",
      reason: `正确率 ${Math.round(accuracy * 100)}% 持续偏高 → 微升`,
    };
  }

  // 规则 5：已经在黄金区 → 保持
  return {
    nextLevel: currentLevel,
    action: "hold",
    reason: `正确率 ${Math.round(accuracy * 100)}% 在黄金区 (${Math.round(GOLDEN_MIN * 100)}-${Math.round(GOLDEN_MAX * 100)}%)`,
  };
}

function _nextLevel(current, delta) {
  const order = [DIFFICULTY_LEVELS.EASY, DIFFICULTY_LEVELS.MEDIUM, DIFFICULTY_LEVELS.HARD];
  const idx = order.indexOf(current);
  const nextIdx = Math.max(0, Math.min(2, idx + delta));
  return order[nextIdx];
}

// ──────────────────────────────────────────────────────────
// 3. 题型权重（根据难度等级分配）
// ──────────────────────────────────────────────────────────

const BASE_QUESTION_TYPES = [
  { type: "sound_to_char",   base: 25, levels: { easy: 35, medium: 25, hard: 15 } },
  { type: "char_to_pinyin",  base: 20, levels: { easy: 15, medium: 20, hard: 25 } },
  { type: "strokes_count",   base: 15, levels: { easy: 20, medium: 15, hard: 10 } },
  { type: "radical_match",   base: 15, levels: { easy: 15, medium: 15, hard: 15 } },
  { type: "word_building",   base: 15, levels: { easy: 10, medium: 15, hard: 20 } },
  { type: "char_to_char",    base: 10, levels: { easy: 5,  medium: 10, hard: 15 } },
];

/**
 * 根据难度等级生成题型权重（归一化到 100）。
 *
 * @param {string} level  DIFFICULTY_LEVELS
 * @returns {Array<{type, weight}>}
 */
export function getQuestionWeights(level) {
  const raw = BASE_QUESTION_TYPES.map((t) => ({
    type: t.type,
    weight: t.levels[level] ?? t.base,
  }));

  // 归一化（加在一起应该接近 100，但保险起见）
  const sum = raw.reduce((s, r) => s + r.weight, 0);
  if (sum > 0) {
    for (const r of raw) r.weight = Math.round((r.weight / sum) * 100);
  }

  return raw;
}

// ──────────────────────────────────────────────────────────
// 4. 选字策略（session 开始时用）
// ──────────────────────────────────────────────────────────

/**
 * 根据难度等级决定选字优先策略：
 *   easy:   先选已掌握的（巩固）+ 少量新字
 *   medium: 难字优先 + 新字穿插
 *   hard:   难字为主 + 快速推进新字
 *
 * @param {object} charRecords
 * @param {string} level
 * @returns {{ priorityIds: string[], strategy, difficultCount, newCount }}
 */
export function buildSelectionStrategy(charRecords, level) {
  const records = Object.values(charRecords || {});
  const now = Date.now();

  const easyBucket = [];    // masteryRate >= 80
  const mediumBucket = [];  // 40-80
  const hardBucket = [];    // < 40
  const newBucket = [];     // reviewCount == 0（完全没学过）

  for (const r of records) {
    if (r.reviewCount === 0 || !r.learnedAt) {
      newBucket.push(r);
    } else if ((r.masteryRate ?? 0) < 40) {
      hardBucket.push(r);
    } else if ((r.masteryRate ?? 0) < 80) {
      mediumBucket.push(r);
    } else {
      easyBucket.push(r);
    }
  }

  let priority = [];
  let strategy;

  if (level === DIFFICULTY_LEVELS.EASY) {
    // 先巩固 easy bucket（孩子有成就感）
    priority = [...easyBucket, ...mediumBucket, ...hardBucket].map((r) => r.charId);
    strategy = "先巩固已掌握 → 建立信心";
  } else if (level === DIFFICULTY_LEVELS.MEDIUM) {
    // 难字优先（艾宾浩斯到期）+ 已掌握穿插
    const reviewDue = (r) => (r.nextReviewDate ?? 0) <= now;
    priority = [
      ...hardBucket.filter(reviewDue),
      ...mediumBucket.filter(reviewDue),
      ...easyBucket.filter(reviewDue),
      ...hardBucket.filter((r) => !reviewDue(r)),
      ...mediumBucket.filter((r) => !reviewDue(r)),
      ...newBucket,
    ].map((r) => r.charId);
    strategy = "难字优先 + 到期复习 + 新字穿插";
  } else {
    // HARD：全推进
    priority = [
      ...hardBucket,
      ...mediumBucket,
      ...newBucket,
      ...easyBucket,
    ].map((r) => r.charId);
    strategy = "快速推进难字 + 新字";
  }

  // 去重（保持顺序）
  priority = [...new Set(priority)];

  return {
    priorityIds: priority,
    strategy,
    difficultCount: hardBucket.length,
    newCount: newBucket.length,
    totalCount: records.length,
  };
}

// ──────────────────────────────────────────────────────────
// 5. 综合（一次算完给 sessionPlanner / drillEngine 用）
// ──────────────────────────────────────────────────────────

export function computeAdaptiveProfile(charRecords, age = DEFAULT_AGE, recentResults = [], correctStreak = 0) {
  const overall = computeOverallDifficulty(charRecords, age);
  const adjusted = realtimeAdjust(recentResults, overall.level, correctStreak);
  const weights = getQuestionWeights(adjusted.nextLevel);
  const selection = buildSelectionStrategy(charRecords, adjusted.nextLevel);

  return {
    computedAt: Date.now(),
    age,
    overall,
    realtime: adjusted,
    effectiveLevel: adjusted.nextLevel,
    weights,
    selection,
  };
}
