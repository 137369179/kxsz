/**
 * readingGatekeeper.js — B10 绘本子集阅读（requiredChars + 提示）
 *
 * 教育学依据：
 *   B10 铁律：绘本必须标注 requiredChars，阅读前自动检查
 *   B10 未学字处理策略：拼音注音 > 点读时报拼音 > 阻止阅读
 *   皮亚杰认知发展 — 近发展区：只能读"跳一跳够得到"的书
 *
 * 职责（纯数据，零 DOM）：
 *   1. 从书数据提取 requiredChars
 *   2. 对比 charRecords 判断 ready/partial/blocked
 *   3. 计算生字列表（未学字 + 模糊字 masteryRate<50）
 */

// ──────────────────────────────────────────────────────────
// 状态枚举
// ──────────────────────────────────────────────────────────
export const READING_STATUS = Object.freeze({
  READY:    "ready",     // 所有 requiredChars 已学（或未学 ≤ 10%）
  PARTIAL:  "partial",   // 部分已学（10% < 未学 ≤ 50%）→ 标拼音放行
  BLOCKED:  "blocked",   // 超过一半没学 → 引导去学
  EMPTY:    "empty",     // requiredChars 为空（信息不足，放行）
});

// 阈值（B10 铁律硬约束）
const BLOCKED_RATIO = 0.5;  // 未学字占比 > 50% → 阻止
const PARTIAL_RATIO = 0.1;  // 未学字占比 > 10% → 弹提示

// ──────────────────────────────────────────────────────────
// 从书数据提取 requiredChars
// ──────────────────────────────────────────────────────────

/**
 * 优先用 book.requiredChars / book.targetChars（显式标注），
 * 否则从 pages[].text 自动去重提取。
 *
 * @param {object} book  STORYBOOKS_DATABASE 条目
 * @returns {string[]}  字符数组（去重）
 */
export function extractRequiredChars(book) {
  if (!book) return [];
  // 显式标注优先（两种字段名都接受）
  const explicit = book.targetChars || book.requiredChars;
  if (Array.isArray(explicit) && explicit.length > 0) {
    return [...new Set(explicit.filter((c) => typeof c === "string" && c.length === 1))];
  }
  // 自动提取：pages[].text 去重
  const chars = new Set();
  if (Array.isArray(book.pages)) {
    for (const p of book.pages) {
      if (typeof p.text === "string") {
        for (const ch of p.text) {
          if (/[\u4e00-\u9fff]/.test(ch)) chars.add(ch);
        }
      }
    }
  }
  return [...chars];
}

// ──────────────────────────────────────────────────────────
// 核心检查
// ──────────────────────────────────────────────────────────

/**
 * 检查一本书是否能读。
 *
 * @param {object} book         STORYBOOKS_DATABASE 条目
 * @param {object} charRecords  ebbinghausManager.progress.charRecords
 * @returns {{
 *   status: READY_STATUS,
 *   requiredChars: string[],
 *   learned: string[],     // 已学
 *   unknown: string[],      // 未学（不在 charRecords 里）
 *   fuzzy: string[],        // 模糊（masteryRate < 50）
 *   stats: { total, learnedCount, unknownCount, fuzzyCount, unknownRatio },
 *   message: string,        // 给家长/孩子看的中文提示
 *   action: "read" | "read_with_pinyin" | "go_learn",
 * }}
 */
export function checkBookReadiness(book, charRecords = {}) {
  const required = extractRequiredChars(book);
  if (required.length === 0) {
    return _result(book, READING_STATUS.EMPTY, [], [], [], [], {
      total: 0, learnedCount: 0, unknownCount: 0, fuzzyCount: 0, unknownRatio: 0, fuzzyRatio: 0,
    }, {
      message: "这本书没有明确的生字要求，可以直接读",
      action: "read",
    });
  }

  const learned = [];
  const unknown = [];
  const fuzzy = [];

  for (const ch of required) {
    const rec = _findRecord(charRecords, ch);
    if (!rec) {
      unknown.push(ch);
    } else if ((rec.masteryRate ?? 0) < 50) {
      fuzzy.push(ch);
      learned.push(ch);  // 也算"接触过"
    } else {
      learned.push(ch);
    }
  }

  const total = required.length;
  const unknownRatio = unknown.length / total;
  const fuzzyRatio = fuzzy.length / total;

  let status, action, message;
  if (unknownRatio > BLOCKED_RATIO) {
    status = READING_STATUS.BLOCKED;
    action = "go_learn";
    message = `这本书有 ${unknown.length} 个生字没学过（超过一半），先去认识它们吧！`;
  } else if (unknownRatio > PARTIAL_RATIO) {
    status = READING_STATUS.PARTIAL;
    action = "read_with_pinyin";
    message = `有 ${unknown.length} 个生字，我帮你标上拼音啦，慢慢来~`;
  } else {
    status = READING_STATUS.READY;
    action = "read";
    if (fuzzy.length > 0) {
      message = `准备好了！${fuzzy.length} 个字可能有点生疏，加油回忆一下~`;
    } else {
      message = "所有字都认识啦，真棒！开始阅读吧~";
    }
  }

  return _result(book, status, required, learned, unknown, fuzzy, {
    total,
    learnedCount: learned.length,
    unknownCount: unknown.length,
    fuzzyCount: fuzzy.length,
    unknownRatio,
    fuzzyRatio,
  }, { message, action });
}

function _result(book, status, required, learned, unknown, fuzzy, stats, opts = {}) {
  return {
    bookId: book?.id,
    status,
    requiredChars: required,
    learned,
    unknown,
    fuzzy,
    stats,
    message: opts.message || "",
    action: opts.action || "read",
  };
}

function _findRecord(charRecords, char) {
  if (!charRecords) return null;
  // charRecords 结构不确定：可能 key 是 charId("char_001") 也可能就是字本身
  for (const [key, val] of Object.entries(charRecords)) {
    if (!val) continue;
    // 直接 key 是字
    if (key === char) return val;
    // val.charId 是字
    if (val.charId === char) return val;
    // val.char 是字
    if (val.char === char) return val;
    // key 末尾是字（char_001 不行，char 本身就是 1 字符）
  }
  return null;
}

// ──────────────────────────────────────────────────────────
// 批量：整书架哪些书能读
// ──────────────────────────────────────────────────────────

/**
 * 给书架上所有书生成 readiness 状态（用于卡片徽章 + 筛选）。
 *
 * @param {Array} books  STORYBOOKS_DATABASE
 * @param {object} charRecords
 * @returns {Array<{book, readiness}>}
 */
export function batchCheckReadiness(books, charRecords) {
  if (!books || !Array.isArray(books)) return [];
  return books.map((b) => ({ book: b, readiness: checkBookReadiness(b, charRecords) }));
}

/** 只返回 READY / PARTIAL（可放行）的书 */
export function filterReadableBooks(books, charRecords) {
  const results = batchCheckReadiness(books, charRecords);
  return results
    .filter((r) => r.readiness.status !== READING_STATUS.BLOCKED)
    .map((r) => r.book);
}
