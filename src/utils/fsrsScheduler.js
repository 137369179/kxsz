/**
 * src/utils/fsrsScheduler.js
 * ================================================================
 * FSRS (Free Spaced Repetition Scheduler) v3 算法实现
 * ─────────────────────────────────────────────────────────────
 * 基于 Piotr Wozniak 1999 论文 + open-spaced-repetition/open-fsrs
 * 参考：https://github.com/open-spaced-repetition/open-fsrs
 *
 * 与 EbbinghausManager 的接口兼容：
 *   scheduleFSRS(record) → { nextReviewDate, masteryRate, reps, lapses }
 *   initFSRSRecord(charId) → fresh FSRS state
 *
 * 契约 B2：复习节点覆盖 5min/20min/1h/1d/3d/7d/15d/30d
 * 契约 B2：升级到 FSRS 替换固定间隔表 [1,2,4,7,15,30]
 * ─────────────────────────────────────────────────────────────
 */

/**
 * 卡片状态
 * @enum {number}
 */
export const FSRSState = {
  NEW: 0,         // 未学
  LEARNING: 1,    // 学习中（短间隔重复直到通过）
  REVIEW: 2,      // 复习中
  RELAPPING: 3,   // 重学中（遗忘后降级）
  RELEARNING: 4,  // 再学习（lapse 后用短间隔重新学）
};

/**
 * 评级映射（与旧版 isCorrect 对应）
 * 0=完全不记得 1=记得但很慢 2=勉强想起 3=正确但犹豫 4=完全正确 5=太简单
 */
export const FSRGRating = {
  AGAIN: 0,   // lapses——彻底忘记，重置短间隔
  HARD: 1,
  GOOD: 2,
  EASY: 3,
};

/**
 * FSRS-6 完整 21 个核心参数（参考 open-spaced-repetition/srs-benchmark 与 yazu.app 最新生产标准）
 * 调研报告 §2.1 & §2.2：w20 为遗忘曲线衰减因子，支持每用户/年龄段个性化
 */
export const FSRS_6_DEFAULT_WEIGHTS = [
  0.212,    // w0: Again初始稳定性
  1.2931,   // w1: Hard初始稳定性
  2.3065,   // w2: Good初始稳定性
  8.2956,   // w3: Easy初始稳定性
  6.4133,   // w4: Again初始难度
  0.8334,   // w5: Hard初始难度
  3.0194,   // w6: Good初始难度
  0.001,    // w7: Easy初始难度
  1.8722,   // w8: 难度稳定性系数
  0.1666,   // w9: 难度衰减
  0.796,    // w10: 稳定性对数底数
  1.4835,   // w11: 稳定性初始值
  0.0614,   // w12: 遗忘后稳定性恢复
  0.2629,   // w13: 遗忘后难度增加
  1.6483,   // w14: Easy增长因子
  0.6014,   // w15: Easy bonus
  1.8729,   // w16: Hard乘数
  0.5425,   // w17: 同日复习参数
  0.0912,   // w18: 同日Hard调整
  0.0658,   // w19: 同日复习稳定性衰减
  0.1542    // w20: 遗忘曲线衰减参数（FSRS-6核心：可针对儿童/用户个性化微调）
];

/**
 * 计算 FSRS-6 幂律遗忘曲线的可检索性 (Retrievability R)
 * 公式：R(t, S) = (1 + factor * (t / S))^(-decay)
 * 其中 factor = 0.9^(-1/decay) - 1
 * 当 t = S 时，R 恒等于 0.9 (90% 目标保持率)
 * @param {number} elapsedDays 距离上次复习过去的天数 (t)
 * @param {number} stability   稳定性 (S，以天为单位)
 * @param {number} [decay=0.1542] 衰减系数 w20
 * @returns {number} 0 ~ 1 之间的留存概率
 */
export function calculateRetrievabilityFSRS6(elapsedDays, stability, decay = FSRS_6_DEFAULT_WEIGHTS[20]) {
  if (stability <= 0) return 0;
  if (elapsedDays <= 0) return 1.0;
  const d = Math.max(0.01, decay);
  const factor = Math.pow(0.9, -1 / d) - 1;
  return Math.pow(1 + factor * (elapsedDays / stability), -d);
}

/** 别名 retrievability (标准化 API) */
export const retrievability = calculateRetrievabilityFSRS6;

/**
 * 计算 FSRS-6 闭式最优复习间隔 (Optimal Interval I)
 * 公式：I = (S / factor) * (R_d^(-1/decay) - 1)
 * 当 desiredRetention = 0.9 时，I 严格等于 S 天
 * @param {number} stability 稳定性 (S，以天为单位)
 * @param {number} [desiredRetention=0.9] 目标留存率 (0.7 ~ 0.98)
 * @param {number} [decay=0.1542] 衰减系数 w20
 * @returns {number} 间隔天数（天）
 */
export function calculateIntervalFSRS6(stability, desiredRetention = 0.9, decay = FSRS_6_DEFAULT_WEIGHTS[20]) {
  if (stability <= 0) return 0.01;
  const clampedR = Math.max(0.7, Math.min(0.98, desiredRetention));
  const d = Math.max(0.01, decay);
  const factor = Math.pow(0.9, -1 / d) - 1;
  const intervalDays = (stability / factor) * (Math.pow(clampedR, -1 / d) - 1);
  return Math.max(0.01, intervalDays);
}

/**
 * 调研报告 §2.2 建议B：儿童个性化衰减率
 * 5-6 岁幼儿突触重塑快、短期遗忘略快，衰减参数设为 0.18；
 * 7-8 岁学龄期采用标准 0.1542。
 * @param {number} [age=6]
 * @returns {number}
 */
export function getDecayForAge(age = 6) {
  if (age <= 5) return 0.19;
  if (age === 6) return 0.175;
  return FSRS_6_DEFAULT_WEIGHTS[20]; // 0.1542
}

// 参数配置（来自 open-fsrs 默认参数，对应 S1-S3 段）
const FSRS_PARAMS = {
  // 学习阶段参数（秒）
  learnSteps: [1 * 60, 10 * 60],       // [1分钟, 10分钟] 两次学习步
  relearnSteps: [10 * 60],             // [10分钟] 再学习步
  // 复习间隔上限（秒）
  maximumInterval: 3600 * 24 * 365,    // 365天硬上限
  // 遗忘曲线参数（每个 rating 对应一个稳定性增量）
  // 简化版：直接用固定映射表（open-fsrs 原始 17 参数用 ML 拟合）
  stabilityToIntervalBase: 9,           // 稳定度→间隔的底数
  retentionTarget: 0.9,                // 目标留存率 90%
  // easy bonus & interval modifier
  easyBonus: 1.3,
  hardIntervalMultiplier: 1.2,
  // 评级权重（简化版，不再用 ML 预测 R 值）
  // 间隔增长 = sDec：正值 = 增长，0 = 不变，负值 = 下降
  // 为保证记忆稳定增长，GOOD 取正增长因子
  ratingWeights: {
    [FSRGRating.AGAIN]: { sDec: -2, r: 0 },       // 大幅降低
    [FSRGRating.HARD]:  { sDec: -0.3, r: 0.6 },  // 略降
    [FSRGRating.GOOD]:  { sDec: 0.15, r: 1.0 },   // 稳定增长
    [FSRGRating.EASY]:  { sDec: 0.5, r: 1.3 },    // 快速提升
  },
};


// ── 核心调度函数 ────────────────────────────────────────────────

/**
 * 将稳定性(天)转换为近似间隔(毫秒)
 * 公式: I = sqrt(S) (天)  →  S=1→1d, S=9→3d, S=49→7d, S=225→15d, S=900→30d
 * @param {number} stabilityDays  稳定性（天）
 * @param {number} _retention   保留（签名兼容）
 * @returns {number} 毫秒
 */
export function stabilityToInterval(stabilityDays, _retention = 0.9) {
  if (stabilityDays < 0) throw new Error('stabilityDays must be non-negative');
  const days = Math.sqrt(Math.max(0.01, stabilityDays));
  return Math.round(days * 86400000);
}

/**
 * 将间隔(毫秒)反算稳定性(天)
 * 逆公式: S = (I / 86400000)^2
 * @param {number} intervalMs 间隔（毫秒）
 * @returns {number} 稳定性（天）
 */
export function intervalToStability(intervalMs) {
  const days = intervalMs / 86400000;
  return Math.max(0.01, days * days);
}

/**
 * 初始化一个汉字的 FSRS 状态（供 LearnModule 学完一个字后调用）
 * @param {string} charId
 * @returns {object} FSRS state
 */
export function initFSRSRecord(charId) {
  return {
    charId,
    state: FSRSState.LEARNING,   // 新字先进入学习阶段
    stability: 0.1,              // 初始稳定性（天）极低
    difficulty: 2.5,             // 初始难度 1~10，2.5 为中等偏易
    reps: 0,
    lapses: 0,
    interval: 0,                // 当前间隔（毫秒）
    due: Date.now(),             // 立即到期
    elapsed: 0,                 // 上次复习后经历时间（秒）
    lastReview: null,           // 上次 review 时间戳
    learningStep: 0,            // 当前在学习/再学习阶段第几步
    // 兼容旧接口
    reviewCount: 0,
    masteryRate: 75,
    nextReviewDate: Date.now(),
    isDifficult: false,
  };
}

/**
 * 确保 record 有 _fsrsState（迁移用）
 * - 若已有 _fsrsState，直接返回 record
 * - 若无，迁移旧字段到新的 _fsrsState 结构，并保留旧字段以兼容旧代码
 * @param {object} record 旧版 charRecords 条目
 * @returns {object} 带有 _fsrsState 的 record
 */
export function ensureFSRSState(record) {
  if (!record) return record;
  // 已有 FSRS 状态，无需迁移
  if (record._fsrsState) return record;
  
  const intervalMs = record.interval || Math.max(0, (record.nextReviewDate || Date.now()) - Date.now());
  const stability = intervalToStability(intervalMs);
  const prevState = record.reviewCount > 0 ? FSRSState.REVIEW : FSRSState.LEARNING;
  return {
    ...record,
    _fsrsState: {
      state: prevState,
      stability,
      difficulty: record.isDifficult ? 5.0 : 2.5,
      reps: record.reviewCount || 0,
      lapses: record.isDifficult ? 1 : 0,
      interval: record.interval || intervalMs,
      due: record.nextReviewDate || Date.now(),
      elapsed: 0,
      lastReview: record.learnedAt || null,
      learningStep: 0,
    },
  };
}

/** @deprecated 兼容旧接口，请使用 ensureFSRSState */
export const migrateToFSRS = ensureFSRSState;

/**
 * 判断本次复习是否为同日复习（Intra-day review）
 * 定义：lastReview 与当前时间在同一日历天（本地时区）
 * 同日复习应用温和惩罚，避免过度学习失真
 * @param {number|null} lastReview  上次复习时间戳（毫秒）
 * @returns {boolean}
 */
export function isIntradayReview(lastReview) {
  if (!lastReview) return false;
  const nowDate = new Date();
  const lastDate = new Date(lastReview);
  return (
    nowDate.getFullYear() === lastDate.getFullYear() &&
    nowDate.getMonth()    === lastDate.getMonth() &&
    nowDate.getDate()     === lastDate.getDate()
  );
}

/**
 * 核心 FSRS 调度函数
 * @param {object} fsrsState 当前 FSRS 状态
 * @param {number} rating   FSRGRating 评级 (0=Again, 1=Hard, 2=Good, 3=Easy)
 * @returns {object} 更新后的 FSRS state + 兼容旧接口字段
 */
export function scheduleFSRS(fsrsState, rating) {
  const now = Date.now();
  const w = FSRS_PARAMS.ratingWeights[rating] || FSRS_PARAMS.ratingWeights[FSRGRating.GOOD];

  // 同日复习检测（Intra-day review）
  // 同日内的 AGAIN/HARD 惩罚系数减半，防止过度学习失真
  const intraday = isIntradayReview(fsrsState.lastReview);

  // 计算新的稳定性和难度
  let { stability, difficulty } = fsrsState;
  const { lapses, reps } = fsrsState;

  // 难度随 AGAIN 上升，随 EASY 下降
  const deltaD = (1 / (Math.log(9) / Math.log(2) - 1)) *
    (Math.log(3 - rating) / Math.log(2) - 1);
  difficulty = Math.min(10, Math.max(1, difficulty + deltaD));

  // 稳定度更新（简化版：按权重调整）
  // AGAIN：大幅降低；HARD：略降；GOOD：不变；EASY：提升
  // 同日复习时惩罚减半（sDec 取平均值向 0 收缩一半）
  const effectiveSdec = intraday && w.sDec < 0 ? w.sDec * 0.5 : w.sDec;
  let newStability = stability * Math.pow(10, effectiveSdec);

  // AGAIN 处理：lapse 计数 + 进入再学习
  if (rating === FSRGRating.AGAIN) {
    const newLapses = lapses + 1;
    // 同日复习的 AGAIN：使用 5 分钟温和重练间隔（不使用 relearnSteps[0] 的全量 10 分钟）
    const againInterval = intraday
      ? 5 * 60 * 1000          // 5 分钟温和重练
      : FSRS_PARAMS.relearnSteps[0] * 1000;  // 跨日：10 分钟完整再学习
    const nextDue = now + againInterval;
    return buildResult(fsrsState, {
      state: FSRSState.RELEARNING,
      stability: Math.max(0.01, newStability),
      difficulty,
      lapses: newLapses,
      reps: reps + 1,
      interval: againInterval,
      due: nextDue,
      lastReview: now,
      learningStep: 0,
    });
  }

  // HARD 处理：间隔压缩（乘以硬间隔系数，再与1分钟取大）
  if (rating === FSRGRating.HARD) {
    const baseInterval = stabilityToInterval(newStability);
    const hardInterval = Math.max(Math.round(baseInterval * FSRS_PARAMS.hardIntervalMultiplier), 60 * 1000);
    return buildResult(fsrsState, {
      state: fsrsState.state === FSRSState.LEARNING ? FSRSState.LEARNING : FSRSState.REVIEW,
      stability: Math.max(0.01, newStability),
      difficulty,
      reps: reps + 1,
      interval: hardInterval,
      due: now + hardInterval,
      lastReview: now,
      learningStep: 0,
    });
  }

  // GOOD 处理：标准复习
  if (rating === FSRGRating.GOOD) {
    const interval = calculateGoodInterval(fsrsState, newStability, difficulty);
    return buildResult(fsrsState, {
      state: FSRSState.REVIEW,
      stability: Math.max(0.01, newStability),
      difficulty,
      reps: reps + 1,
      interval,
      due: now + interval,
      lastReview: now,
      learningStep: 0,
    });
  }

  // EASY 处理：间隔放大 + 稳定度提升
  if (rating === FSRGRating.EASY) {
    const interval = Math.min(
      calculateGoodInterval(fsrsState, newStability, difficulty) * FSRS_PARAMS.easyBonus,
      FSRS_PARAMS.maximumInterval * 1000
    );
    return buildResult(fsrsState, {
      state: FSRSState.REVIEW,
      stability: Math.max(0.01, newStability),
      difficulty,
      reps: reps + 1,
      interval,
      due: now + interval,
      lastReview: now,
      learningStep: 0,
    });
  }

  // fallback
  return buildResult(fsrsState, { lastReview: now });
}

/**
 * 计算 GOOD 评级下的间隔
 * @param {object} fsrsState
 * @param {number} newStability
 * @param {number} difficulty
 * @returns {number} 毫秒
 */
function calculateGoodInterval(fsrsState, newStability, difficulty) {
  // 首次复习（reps=0）：用学习步最后间隔，确保 ≥ 5 分钟
  if (fsrsState.reps === 0) {
    const lastLearnStep = FSRS_PARAMS.learnSteps[FSRS_PARAMS.learnSteps.length - 1]; // 秒
    return Math.max(lastLearnStep * 1000, 5 * 60 * 1000);
  }
  // 已有复习：用稳定性公式，再受难度系数调节
  const baseInterval = stabilityToInterval(newStability); // 毫秒
  const diffFactor = Math.pow(0.5, (difficulty - 2.5) / 5);
  const interval = Math.max(
    60 * 1000,
    Math.min(baseInterval * diffFactor, FSRS_PARAMS.maximumInterval * 1000)
  );
  return interval;
}

/**
 * 构造返回结果（FSRS state + 旧接口兼容字段）
 */
function buildResult(old, updates) {
  const next = { ...old, ...updates };
  // 旧接口兼容字段
  const masteryRate = Math.round(
    Math.min(100,
      Math.max(0,
        100 * (1 - next.lapses / Math.max(next.reps, 1)) * (next.reps / (next.reps + 3))
      )
    )
  );
  return {
    ...next,
    // 旧接口字段
    reviewCount: next.reps,
    masteryRate,
    nextReviewDate: next.due,
    isDifficult: next.lapses > 0,
    correctStreak: next.reps - next.lapses,
  };
}

/**
 * 将 isCorrect (旧) 映射到 FSRS rating
 * @param {boolean} isCorrect
 * @param {object} options  { hardMode?: boolean }
 * @returns {number} FSRGRating
 */
export function isCorrectToRating(isCorrect, options = {}) {
  if (!isCorrect) return FSRGRating.AGAIN;
  // 可按正确率/时间等扩展：这里简单 GOOD
  // 若 masteryRate 极低（<40）可返回 HARD
  if (options.lowMastery) return FSRGRating.HARD;
  return FSRGRating.GOOD;
}

/**
 * 获取学习阶段的下一次到期时间
 * @param {object} fsrsState
 * @param {number} rating FSRGRating（用于判断是否留在学习阶段）
 * @returns {number} 毫秒时间戳
 */
export function getLearningStepDue(fsrsState, rating) {
  if (rating === FSRGRating.AGAIN) {
    // 重学第一步
    return Date.now() + FSRS_PARAMS.relearnSteps[0] * 1000;
  }
  // 在学习阶段内移动
  const steps = fsrsState.state === FSRSState.RELEARNING
    ? FSRS_PARAMS.relearnSteps
    : FSRS_PARAMS.learnSteps;
  const nextStep = Math.min(fsrsState.learningStep + 1, steps.length - 1);
  return Date.now() + steps[nextStep] * 1000;
}

/**
 * 调度下一次学习步骤（用于 LEARNING / RELEARNING 状态）
 * @param {object} fsrsState
 * @param {boolean} passed 该步骤是否通过（正确）
 * @returns {object} 更新后的 fsrsState
 */
export function scheduleLearningStep(fsrsState, passed) {
  const steps = fsrsState.state === FSRSState.RELEARNING
    ? FSRS_PARAMS.relearnSteps
    : FSRS_PARAMS.learnSteps;
  const nextStep = fsrsState.learningStep + (passed ? 1 : 0);
  if (nextStep >= steps.length) {
    // 学习阶段完成，进入 REVIEW
    return scheduleFSRS(fsrsState, FSRGRating.GOOD);
  }
  return {
    ...fsrsState,
    learningStep: nextStep,
    due: Date.now() + steps[nextStep] * 1000,
  };
}

// ── 便利函数（供 EbbinghausManager 直接调用）─────────────────────

/**
 * E2 核心：替换 completeCharacter 中的固定间隔表
 * @param {object} charRecord 当前汉字记录（可能是旧版或 FSRS state）
 * @param {number} starsEarned 获得的星星数（1-3）
 * @returns {object} 更新后的 record（同时更新 _fsrsState 和旧字段）
 */
export function fsrsCompleteCharacter(charRecord, starsEarned = 3) {
  const state = ensureFSRSState(charRecord)._fsrsState || initFSRSRecord(charRecord.charId);
  // 新字学完，进入 REVIEW，rating = GOOD（有星星说明掌握得不错）
  const rating = starsEarned >= 2 ? FSRGRating.GOOD : FSRGRating.HARD;
  const result = scheduleFSRS(state, rating);

  // 首次学完时用 starsEarned 决定掌握度（3星=85, 2星=75, 1星=65），
  // 避免 buildResult 用 review 公式（reps=1 → 算出 25 分）。
  // 若已有历史高分，取 max 保证不降级。
  const masteryFromStars = 55 + Math.min(3, Math.max(0, starsEarned)) * 10;
  const finalMastery = Math.max(masteryFromStars, result.masteryRate || 0, charRecord.masteryRate || 0);

  return {
    ...charRecord,
    ...result,
    masteryRate: finalMastery,
    correctStreak: Math.max(result.correctStreak || 0, starsEarned >= 2 ? 1 : 0),
    _fsrsState: {
      state: result.state,
      stability: result.stability,
      difficulty: result.difficulty,
      reps: result.reps,
      lapses: result.lapses,
      interval: result.interval,
      due: result.due,
      elapsed: result.elapsed,
      lastReview: result.lastReview,
      learningStep: result.learningStep,
    },
  };
}

/**
 * E2 核心：替换 completeReview 中的固定间隔表
 * @param {object} charRecord 当前汉字记录
 * @param {boolean} isCorrect 这次复习是否正确
 * @returns {object} 更新后的 record
 */
export function fsrsCompleteReview(charRecord, isCorrect) {
  const state = ensureFSRSState(charRecord)._fsrsState || initFSRSRecord(charRecord.charId);
  const rating = isCorrectToRating(isCorrect);
  const result = scheduleFSRS(state, rating);

  // 复习错误 → correctStreak 必须归零（buildResult 公式 reps-lapses 在 AGAIN 场景算错）
  // 复习正确 → correctStreak + 1（保留历史如果已有更高值）
  const nextStreak = isCorrect
    ? Math.max(1, (charRecord.correctStreak || 0) + 1)
    : 0;

  return {
    ...charRecord,
    ...result,
    correctStreak: nextStreak,
    _fsrsState: {
      state: result.state,
      stability: result.stability,
      difficulty: result.difficulty,
      reps: result.reps,
      lapses: result.lapses,
      interval: result.interval,
      due: result.due,
      elapsed: result.elapsed,
      lastReview: result.lastReview,
      learningStep: result.learningStep,
    },
  };
}

/**
 * 获取 FSRS 状态的到期汉字列表（供 getDueReviewCharIds 替换）
 * @param {object} charRecords
 * @returns {string[]} charId 数组
 */
export function fsrsGetDueIds(charRecords) {
  const now = Date.now();
  return Object.values(charRecords || {})
    .filter(r => {
      const state = r._fsrsState;
      if (!state) return r.nextReviewDate <= now;
      return state.due <= now;
    })
    .map(r => r.charId);
}

// ── 调试/可视化 ────────────────────────────────────────────────

/**
 * 获取汉字的复习预测（用于学习报告）
 * @param {object} charRecord
 * @returns {object} { stability, difficulty, intervalDays, retention, nextReviewLabel }
 */
export function fsrsPredict(charRecord) {
  if (!charRecord) {
    return {
      stability: 0,
      difficulty: 2.5,
      intervalDays: 0,
      retention: FSRS_PARAMS.retentionTarget,
      nextReviewLabel: "未学",
    };
  }
  // 优先读 _fsrsState；也兼容 initFSRSRecord 直接返回的顶层字段
  const fsrsState = charRecord._fsrsState;
  const directState = charRecord.state;
  const state = fsrsState || (directState !== undefined ? charRecord : null);
  if (!state) {
    return {
      stability: 0,
      difficulty: 2.5,
      intervalDays: 0,
      retention: FSRS_PARAMS.retentionTarget,
      nextReviewLabel: "学习中",
    };
  }
  const stability = fsrsState ? state.stability : (charRecord.stability || 0);
  const interval = fsrsState ? state.interval : (charRecord.interval || 0);
  const intervalDays = interval / (1000 * 60 * 60 * 24);
  const nextLabel =
    state.state === FSRSState.LEARNING || state.state === FSRSState.NEW
    ? "学习中"
    : state.state === FSRSState.RELEARNING
      ? "再学习"
      : formatNextReview(state.due);
  return {
    stability: Math.round(stability * 100) / 100,
    difficulty: Math.round((state.difficulty || 2.5) * 100) / 100,
    intervalDays: Math.round(intervalDays * 10) / 10,
    retention: FSRS_PARAMS.retentionTarget,
    nextReviewLabel: nextLabel,
  };
}

function formatNextReview(dueMs) {
  const diff = dueMs - Date.now();
  if (diff <= 0) return "现在";
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}分钟后`;
  const hours = Math.round(diff / 3600000);
  if (hours < 24) return `${hours}小时后`;
  const days = Math.round(diff / 86400000);
  return `${days}天后`;
}
