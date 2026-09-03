/**
 * reportEngine.js — E14 学习报告多维度升级
 *
 * 教育学依据：
 *   数据驱动反馈（Data-Driven Feedback）— 多维度 > 单维
 *   家长需要能看懂的诊断文本（口语化，不是 JSON）
 *   维果茨基：在近发展区给建议，不是只报数字
 *
 * 维度：
 *   1. 识字总量 + 覆盖率
 *   2. 掌握分布（mastered / learning / difficult / forgotten）
 *   3. 7 日趋势（新学 / 复习 / 正确率）
 *   4. 难字 Top N
 *   5. 绘本进度
 *   6. 专注度
 *   7. AI 一句话诊断
 */

import { CHARACTER_DATABASE } from "../data/characters.js";
import { STORYBOOKS_DATABASE } from "../data/books.js";

// ──────────────────────────────────────────────────────────
// 掌握分级阈值
// ──────────────────────────────────────────────────────────
const MASTERED_RATE = 80;       // ≥80% → 已掌握
const DIFFICULT_RATE = 40;     // <40% → 难字
const FORGOTTEN_DAYS = 30;     // 30 天未复习 → 遗忘风险

// ──────────────────────────────────────────────────────────
// 1. 识字总量 + 覆盖率
// ──────────────────────────────────────────────────────────

export function computeCoverage(charRecords) {
  const total = CHARACTER_DATABASE.length;
  const learned = Object.keys(charRecords || {}).length;
  return {
    total,
    learned,
    coverageRate: total > 0 ? Math.round((learned / total) * 1000) / 10 : 0,
    remaining: total - learned,
  };
}

// ──────────────────────────────────────────────────────────
// 2. 掌握分布
// ──────────────────────────────────────────────────────────

export function classifyMastery(charRecords) {
  const records = Object.values(charRecords || {});
  const now = Date.now();

  let mastered = 0, learning = 0, difficult = 0, forgotten = 0;
  const difficultList = [];

  for (const r of records) {
    const rate = r.masteryRate ?? 0;
    const lastReview = r.nextReviewDate ?? r.learnedAt ?? now;
    const daysSince = (now - lastReview) / 86_400_000;

    if (rate >= MASTERED_RATE && daysSince < FORGOTTEN_DAYS) {
      mastered++;
    } else if (rate >= DIFFICULT_RATE) {
      learning++;
    } else if (rate > 0) {
      difficult++;
      difficultList.push({
        charId: r.charId,
        masteryRate: rate,
        reviewCount: r.reviewCount ?? 0,
        correctStreak: r.correctStreak ?? 0,
      });
    } else {
      forgotten++;
    }

    // 30 天没 review 也标记遗忘风险
    if (daysSince >= FORGOTTEN_DAYS && rate >= MASTERED_RATE) {
      forgotten++;
    }
  }

  difficultList.sort((a, b) => a.masteryRate - b.masteryRate);

  return {
    mastered,
    learning,
    difficult,
    forgotten,
    total: records.length,
    difficultList: difficultList.slice(0, 10),  // Top 10 难字
    healthScore: computeHealthScore(mastered, learning, difficult, forgotten),
  };
}

function computeHealthScore(mastered, learning, difficult, forgotten) {
  const total = mastered + learning + difficult + forgotten;
  if (total === 0) return 0;
  // mastered 权重 1.0, learning 0.7, difficult 0.3, forgotten 0
  const score = (mastered * 1.0 + learning * 0.7 + difficult * 0.3 + forgotten * 0) / total * 100;
  return Math.round(score);
}

// ──────────────────────────────────────────────────────────
// 3. 7 日趋势
// ──────────────────────────────────────────────────────────

export function computeWeeklyTrend(charRecords, studyHistory = []) {
  // 从 studyHistory 拿每天新学数
  // 从 charRecords 拿每天复习相关的（通过 lastReviewDate）
  const now = new Date();
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    // 新学数
    const histEntry = studyHistory.find((h) => h.date === dateKey || h.date === `${d.getMonth() + 1}/${d.getDate()}`);
    const newCount = histEntry?.count ?? 0;

    // 复习数：charRecords 里 nextReviewDate 在这一天的
    const records = Object.values(charRecords || {});
    const reviewCount = records.filter((r) => {
      const reviewDate = r.nextReviewDate ?? 0;
      if (!reviewDate) return false;
      const rd = new Date(reviewDate);
      return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth() && rd.getDate() === d.getDate();
    }).length;

    days.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      weekday: ["日", "一", "二", "三", "四", "五", "六"][d.getDay()],
      newCount,
      reviewCount,
      total: newCount + reviewCount,
    });
  }

  const totalNew = days.reduce((s, d) => s + d.newCount, 0);
  const totalReview = days.reduce((s, d) => s + d.reviewCount, 0);

  return { days, totalNew, totalReview, avgPerDay: Math.round((totalNew + totalReview) / 7 * 10) / 10 };
}

// ──────────────────────────────────────────────────────────
// 4. 绘本进度
// ──────────────────────────────────────────────────────────

export function computeBookProgress(readBooks = []) {
  const total = STORYBOOKS_DATABASE.length;
  const readCount = readBooks.length;

  // 按 stage 分布
  const byStage = [1, 2, 3].map((stage) => {
    const stageBooks = STORYBOOKS_DATABASE.filter((b) => (b.stage || 1) === stage);
    const stageRead = stageBooks.filter((b) => readBooks.includes(b.id)).length;
    return { stage, total: stageBooks.length, read: stageRead };
  });

  return {
    total,
    readCount,
    coverageRate: total > 0 ? Math.round((readCount / total) * 100) : 0,
    byStage,
  };
}

// ──────────────────────────────────────────────────────────
// 5. 专注度（correctStreak + 中断）
// ──────────────────────────────────────────────────────────

export function computeFocusMetrics(charRecords) {
  const records = Object.values(charRecords || {});
  if (records.length === 0) {
    return { avgStreak: 0, highStreak: 0, avgReviewCount: 0, interruptionRate: 0 };
  }

  const streaks = records.map((r) => r.correctStreak ?? 0);
  const reviews = records.map((r) => r.reviewCount ?? 0);

  const avgStreak = Math.round((streaks.reduce((a, b) => a + b, 0) / streaks.length) * 10) / 10;
  const highStreak = Math.max(...streaks, 0);
  const avgReviewCount = Math.round(reviews.reduce((a, b) => a + b, 0) / reviews.length * 10) / 10;

  // 中断率：correctStreak=0 或 1 的比例
  const interruptedCount = streaks.filter((s) => s <= 1).length;
  const interruptionRate = Math.round((interruptedCount / streaks.length) * 100);

  return { avgStreak, highStreak, avgReviewCount, interruptionRate };
}

// ──────────────────────────────────────────────────────────
// 6. 综合报告（一次给全 UI 数据）
// ──────────────────────────────────────────────────────────

export function buildFullReport(progress) {
  const charRecords = progress?.charRecords || {};
  const studyHistory = progress?.studyHistory || [];
  const readBooks = progress?.readBooks || [];

  const coverage = computeCoverage(charRecords);
  const mastery = classifyMastery(charRecords);
  const trend = computeWeeklyTrend(charRecords, studyHistory);
  const books = computeBookProgress(readBooks);
  const focus = computeFocusMetrics(charRecords);

  return {
    generatedAt: Date.now(),
    coverage,
    mastery,
    trend,
    books,
    focus,
    summary: generateParentDiagnosis({ coverage, mastery, trend, books, focus }),
  };
}

// ──────────────────────────────────────────────────────────
// 7. AI 诊断文本（给家长看）
// ──────────────────────────────────────────────────────────

export function generateParentDiagnosis({ coverage, mastery, trend, books, focus }) {
  const lines = [];

  // 总评
  if (coverage.learned === 0) {
    lines.push("🌟 刚启动识字之旅，先认识 3 个字就很棒啦！");
  } else if (coverage.coverageRate < 10) {
    lines.push(`🌟 已经认识 ${coverage.learned} 字，起步不错！`);
  } else if (coverage.coverageRate < 30) {
    lines.push(`🌟 覆盖率 ${coverage.coverageRate}%，正在稳步推进！`);
  } else {
    lines.push(`🌟 覆盖率已达 ${coverage.coverageRate}%，表现优秀！`);
  }

  // 健康度
  if (mastery.healthScore >= 80) {
    lines.push(`💪 掌握健康度 ${mastery.healthScore} 分，字记得牢！`);
  } else if (mastery.healthScore >= 50) {
    lines.push(`📊 健康度 ${mastery.healthScore} 分，继续加油巩固！`);
  } else if (mastery.total > 0) {
    lines.push(`⚠️ 健康度 ${mastery.healthScore} 分，有 ${mastery.difficult} 个难字需要多复习。`);
  }

  // 专注度
  if (focus.avgStreak >= 3) {
    lines.push(`🎯 平均连对 ${focus.avgStreak} 次，专注力很强！`);
  } else if (focus.avgStreak >= 1.5) {
    lines.push(`🎯 平均连对 ${focus.avgStreak} 次，渐入佳境。`);
  } else if (focus.avgStreak > 0) {
    lines.push(`🎯 连续答对机会不多，可以试试专注力模式。`);
  }

  // 本周
  if (trend.totalNew > 0 || trend.totalReview > 0) {
    lines.push(`📅 本周新学 ${trend.totalNew} 字、复习 ${trend.totalReview} 字，日均 ${trend.avgPerDay} 次。`);
  }

  // 绘本
  if (books.readCount > 0) {
    lines.push(`📚 已读 ${books.readCount} 本绘本！`);
  }

  // 行动建议
  const suggestions = [];
  if (mastery.difficult > 0) suggestions.push(`难字本巩固 ${mastery.difficult} 个字`);
  if (mastery.forgotten > 0) suggestions.push("启动今日微复习防遗忘");
  if (focus.avgStreak < 2) suggestions.push("开启专注模式减少干扰");
  if (books.readCount === 0 && coverage.learned > 3) suggestions.push("试试读一本绘本文字");
  if (trend.totalNew === 0 && trend.totalReview === 0 && coverage.learned > 0) suggestions.push("连续几天没学习，回来继续吧！");

  if (suggestions.length > 0) {
    lines.push(`💡 建议：${suggestions.join("；")}。`);
  }

  return lines.join("\n");
}

// ──────────────────────────────────────────────────────────
// 难字详情（单独 API，用于难字本 UI）
// ──────────────────────────────────────────────────────────

export function getDifficultCharsWithInfo(charRecords) {
  const records = Object.values(charRecords || {});
  const difficult = records.filter((r) => (r.masteryRate ?? 0) < DIFFICULT_RATE && (r.masteryRate ?? 0) > 0);
  difficult.sort((a, b) => (a.masteryRate ?? 0) - (b.masteryRate ?? 0));

  return difficult.map((r) => {
    const charData = CHARACTER_DATABASE.find((c) => c.id === r.charId) || {};
    return {
      ...r,
      char: charData.char ?? r.charId,
      pinyin: charData.pinyin ?? "",
      radical: charData.radical ?? "",
      strokeCount: charData.strokeCount ?? 0,
      confusingChars: charData.confusingChars ?? [],
      confusingHint: charData.confusingHint ?? "",
    };
  });
}
