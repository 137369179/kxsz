/**
 * sessionPlanner.js — B4 米勒 7±2 法则 + Cowan 4±1 工作记忆块化
 *
 * 教育学依据：
 *   Miller 1956 7±2 工作记忆容量
 *   Cowan 2001 4±1 真实测量值（儿童更低）
 *   6-8 岁：3 新字 + 4 复习 = 7 硬上限
 *   4 岁：  2 新字 + 2 复习 = 4
 *   5 岁：  2 新字 + 3 复习 = 5
 *
 * 职责：
 *   1. 按年龄生成本日会话块（新字 + 复习 混合序列）
 *   2. 复习字优先 FSRS 到期 > 难字档案 > 保底已学
 *   3. 新字优先按 stage / index 顺序（避免跳学）
 *   4. 若数量不够，自动降级（新字不足→多复习；复习不足→少新字）
 *
 * 不依赖 DOM，纯数据函数——方便单元测试。
 */

import { getOvernightChars } from "./sleepConsolidation.js";

// ──────────────────────────────────────────────────────────
// B4 铁律：按年龄分配会话块大小
// ──────────────────────────────────────────────────────────
export const AGE_SESSION_TABLE = [
  // [ageMin, ageMax, total, newChars, reviews]
  [0,  3,  3,  1,  2],   // 3岁：极低工作记忆，2新+1复习 都多了→1+2
  [4,  4,  4,  2,  2],   // 4岁：Cowan 4±1 下限
  [5,  5,  5,  2,  3],   // 5岁：读写萌芽期
  [6,  7,  7,  3,  4],   // 6-7岁：米勒 7±2 硬上限
  [8,  14, 7,  3,  4],   // 8+岁：同米勒 7±2
];

/**
 * 返回某年龄的会话块配置。
 * @param {number} age
 * @returns {{total:number, newChars:number, reviews:number}}
 */
export function getSessionConfig(age) {
  const a = Math.max(3, Math.min(14, Number(age) || 6));
  for (const [lo, hi, total, nc, rc] of AGE_SESSION_TABLE) {
    if (a >= lo && a <= hi) {
      return { total, newChars: nc, reviews: rc };
    }
  }
  return { total: 7, newChars: 3, reviews: 4 };
}

// ──────────────────────────────────────────────────────────
// 数据来源（通过依赖注入避免硬编码 import）
// ──────────────────────────────────────────────────────────
let _ebbinghaus = null;
let _charDB = null;

export function setDeps({ ebbinghaus, characterDB }) {
  _ebbinghaus = ebbinghaus;
  _charDB = characterDB;
}

/** 重置（测试用） */
export function _resetDeps() {
  _ebbinghaus = null;
  _charDB = null;
}

// ──────────────────────────────────────────────────────────
// 核心算法
// ──────────────────────────────────────────────────────────

/**
 * 拉今日学习会话块（新字 + 复习 混合序列）。
 *
 * @param {object} [opts]
 * @param {number} [opts.age]  年龄，不传则从 ebbinghaus 取
 * @param {number} [opts.maxNew]  覆盖新字上限（家长自定义）
 * @param {number} [opts.maxReview] 覆盖复习上限
 * @returns {{
 *   newChars:    Array<{id:string, char:string, charData?:object}>,
 *   reviews:      Array<{id:string, char:string, source:'due'|'mistake'|'fallback', charData?:object}>,
 *   blockOrder:   Array<'new'|'review'>,  // 学习顺序（混合排列，避免连续同类型疲劳）
 *   totalBlocks:  number,
 *   isPartial:    boolean,  // true = 数量不够（新字/复习池耗尽）
 *   ageUsed:      number,
 *   configUsed:   {total, newChars, reviews}
 * }}
 */
export function planDailySession(opts = {}) {
  const age = opts.age ?? _ebbinghaus?.getAge?.() ?? 6;
  const cfg = getSessionConfig(age);

  const wantNew = opts.maxNew ?? cfg.newChars;
  const wantRev = opts.maxReview ?? cfg.reviews;

  // ── 1. 拉复习池 ──
  const reviewPool = _collectReviewPool(wantRev);

  // ── 2. 拉新字池 ──
  const newPool = _collectNewPool(wantNew);

  // ── 3. 降级处理（数量不足） ──
  // 策略：优先保持总块数 = cfg.total，不追求类型完美分布
  let reviews = reviewPool.slice(0, wantRev);
  let newChars = newPool.slice(0, wantNew);
  let isPartial = false;

  // 类型内降级先做（用同一类型的 pool 剩余补满）
  if (reviews.length < wantRev) {
    // reviewPool 里还有吗？
    const extra = reviewPool.slice(reviews.length, wantRev);
    reviews = [...reviews, ...extra];
  }
  if (newChars.length < wantNew) {
    const extra = newPool.slice(newChars.length, wantNew);
    newChars = [...newChars, ...extra];
  }

  // 跨类型补缺口：优先用复习字填复习不够的（已经做了），再用新字
  let total = newChars.length + reviews.length;
  if (total < cfg.total) {
    isPartial = true;
    // 优先再拉复习字（最多 cfg.total - newChars.length）
    const stillRev = cfg.total - total;
    const extraRev = reviewPool.slice(reviews.length, reviews.length + stillRev);
    reviews = [...reviews, ...extraRev];
    total = newChars.length + reviews.length;

    // 还不够 → 多拉新字
    if (total < cfg.total) {
      const stillNew = cfg.total - total;
      const extraNew = newPool.slice(newChars.length, newChars.length + stillNew);
      newChars = [...newChars, ...extraNew];
    }
  }

  // ── 4. 混合排列（避免 "先全新后全复习" 连续疲劳）──
  // 策略：review-new-review-new 交替，若一方多则尾部追加
  const blockOrder = _interleave(reviews.length, newChars.length);

  return {
    newChars,
    reviews,
    blockOrder,
    totalBlocks: newChars.length + reviews.length,
    isPartial,
    ageUsed: age,
    configUsed: cfg,
  };
}

/**
 * 拉复习池，优先级：FSRS 到期 > 错字档案 > 保底已学
 * 最多拉 want * 2 供后续切片。
 */
function _collectReviewPool(want) {
  const need = want * 2;
  const records = _ebbinghaus?.progress?.charRecords || {};
  const recordIds = Object.keys(records);
  if (recordIds.length === 0) return [];

  const pool = [];
  const seen = new Set();

  // P0: 隔夜新生字巩固 (Walker 2006: 12~36h 关键记忆再激活期)
  try {
    const overnightIds = getOvernightChars(records);
    for (const id of overnightIds) {
      if (!seen.has(id)) { seen.add(id); pool.push({ id, source: "overnight" }); }
    }
  } catch {}

  // P1: FSRS 到期
  const dueIds = _ebbinghaus?.getDueReviewCharIds?.() || [];
  for (const id of dueIds) {
    if (!seen.has(id)) { seen.add(id); pool.push({ id, source: "due" }); }
  }

  // P2: 难字档案（errorProfiles + isDifficult）
  const difficultIds = _ebbinghaus?.getDifficultCharIds?.() || [];
  for (const id of difficultIds) {
    if (!seen.has(id)) { seen.add(id); pool.push({ id, source: "mistake" }); }
  }

  // P3: 保底 → 取 masteryRate 最低的（允许重复，让最难的字多复习）
  if (pool.length < need) {
    const fallback = recordIds
      .map((id) => ({ id, m: records[id]?.masteryRate ?? 50 }))
      .sort((a, b) => a.m - b.m);
    let fi = 0;
    while (pool.length < need && fi < fallback.length) {
      const id = fallback[fi].id;
      // 允许重复——同一个字可以出现多次（不同题型）
      pool.push({ id, source: "fallback" });
      fi++;
      if (fi >= fallback.length) fi = 0; // 循环取
    }
  }

  // 挂 charData（如果 charDB 注入了）
  if (_charDB) {
    for (const p of pool) {
      const c = _charDB.find((x) => x.id === p.id);
      if (c) p.charData = c;
    }
  }
  return pool;
}

/**
 * 拉新字池：未在 charRecords 里的就是新字，按 index 顺序取（不跳学）
 */
function _collectNewPool(want) {
  const need = want * 2;
  const records = _ebbinghaus?.progress?.charRecords || {};
  if (!_charDB) return [];

  const notLearned = _charDB
    .filter((c) => !records[c.id])
    .slice(0, need)
    .map((c) => ({ id: c.id, charData: c, source: "new" }));

  return notLearned;
}

/**
 * 交替排列两种 block 类型。
 * 例：3 new + 4 review → [R, N, R, N, R, N, R]
 * 例：4 new + 2 review → [N, R, N, R, N, N]
 */
function _interleave(nNew, nRev) {
  const out = [];
  const total = nNew + nRev;
  // 简单策略：review 和 new 交替，多出来的尾部追加
  let ni = 0, ri = 0;
  const firstIsReview = nRev >= nNew; // 复习多则先复习，新字多则先新字
  for (let i = 0; i < total; i++) {
    const wantReview = (i % 2 === 0) === firstIsReview;
    if (wantReview && ri < nRev) { out.push("review"); ri++; }
    else if (!wantReview && ni < nNew) { out.push("new"); ni++; }
    else if (ri < nRev) { out.push("review"); ri++; }
    else if (ni < nNew) { out.push("new"); ni++; }
  }
  return out;
}

// ──────────────────────────────────────────────────────────
// 便捷：从 plan 展开成完整学习队列
// ──────────────────────────────────────────────────────────

/**
 * 返回 plan 的扁平队列（按 blockOrder 顺序，每个元素带 type）。
 * LearnModule / ReviewModule 直接消费这个数组。
 */
export function expandQueue(plan) {
  const queue = [];
  let ni = 0, ri = 0;
  for (const t of plan.blockOrder) {
    if (t === "review" && ri < plan.reviews.length) {
      queue.push({ type: "review", ...plan.reviews[ri] });
      ri++;
    } else if (t === "new" && ni < plan.newChars.length) {
      queue.push({ type: "new", ...plan.newChars[ni] });
      ni++;
    }
  }
  return queue;
}

/** @deprecated 用 getSessionConfig 代替 */
export const AGE_NEW_REVIEW_TABLE = AGE_SESSION_TABLE.map(([a, b, t, nc, rc]) => ({
  ageMin: a, ageMax: b, total: t, newChars: nc, reviews: rc,
}));
