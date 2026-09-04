/**
 * src/utils/sleepConsolidation.js
 * ================================================================
 * 睡眠记忆巩固与时段提醒策略 (Sleep-Dependent Memory Consolidation)
 * ─────────────────────────────────────────────────────────────
 * 理论依据：
 *   - Walker (2006): 睡眠期间海马体对日间临时编码进行再激活（Reactivation）与突触强化。
 *   - 睡前 5 分钟微复习：在睡眠前激活记忆痕迹，显著提升夜间巩固效率。
 *   - 次日晨起/首次打开优先巩固：优先调度昨夜新学的生字，闭环检验睡眠巩固成果。
 * ─────────────────────────────────────────────────────────────
 */

/** 睡前时段定义（默认 19:30 - 21:30） */
export const BEDTIME_WINDOW = Object.freeze({
  START_HOUR: 19,
  START_MINUTE: 30,
  END_HOUR: 21,
  END_MINUTE: 30,
});

/** 隔夜巩固时间窗口（12 小时至 36 小时之间） */
const OVERNIGHT_MIN_MS = 12 * 3600 * 1000;
const OVERNIGHT_MAX_MS = 36 * 3600 * 1000;

/**
 * 判断指定时间是否处于睡前轻复习时段 (19:30 ~ 21:30)
 * @param {Date} [date=new Date()]
 * @returns {boolean}
 */
export function isBedtimeWindow(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const totalMins = d.getHours() * 60 + d.getMinutes();
  const startMins = BEDTIME_WINDOW.START_HOUR * 60 + BEDTIME_WINDOW.START_MINUTE;
  const endMins = BEDTIME_WINDOW.END_HOUR * 60 + BEDTIME_WINDOW.END_MINUTE;
  return totalMins >= startMins && totalMins <= endMins;
}

/**
 * 筛选昨夜新学且尚未进行巩固复习的汉字列表（用于次日优先队列）
 * @param {Record<string, object>} charRecords ebbinghausManager 的生字学习记录
 * @param {number} [now=Date.now()] 当前时间戳
 * @returns {string[]} 需要隔夜优先巩固的 charId 列表
 */
export function getOvernightChars(charRecords, now = Date.now()) {
  if (!charRecords || typeof charRecords !== "object") return [];

  const overnightIds = [];

  for (const [id, rec] of Object.entries(charRecords)) {
    if (!rec || typeof rec.learnedAt !== "number") continue;
    const elapsed = now - rec.learnedAt;
    // 学习发生在 12h ~ 36h 之前，且 reviewCount === 0（尚未复习巩固）
    if (elapsed >= OVERNIGHT_MIN_MS && elapsed <= OVERNIGHT_MAX_MS) {
      if ((rec.reviewCount || 0) === 0) {
        overnightIds.push({ id, learnedAt: rec.learnedAt });
      }
    }
  }

  // 按初次学习时间升序（先学先复习）
  overnightIds.sort((a, b) => a.learnedAt - b.learnedAt);
  return overnightIds.map((item) => item.id);
}

/**
 * 是否存在需要隔夜优先巩固的生字
 * @param {Record<string, object>} charRecords
 * @param {number} [now=Date.now()]
 * @returns {boolean}
 */
export function isOvernightConsolidationNeeded(charRecords, now = Date.now()) {
  return getOvernightChars(charRecords, now).length > 0;
}
