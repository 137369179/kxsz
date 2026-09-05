/**
 * schedulerFacade.js — FSRS / 进度调度统一入口（薄门面）
 * ---------------------------------------------------------
 * 业务侧请优先经本模块读写「到期队列 / 完成复习 / 完成学字」，
 * 避免直接散落引用 ebbinghaus 与 fsrsScheduler 双路径。
 * 实现仍委托 ebbinghausManager（内部已单路径接 FSRS）。
 */

import { ebbinghausManager } from "./ebbinghaus.js";

/** @returns {string[]} 到期待复习 charId 列表 */
export function getDueReviewCharIds() {
  return ebbinghausManager.getDueReviewCharIds();
}

/**
 * @param {string} charId
 * @param {boolean|number} isCorrectOrRating
 */
export function completeReview(charId, isCorrectOrRating = true) {
  return ebbinghausManager.completeReview(charId, isCorrectOrRating);
}

/**
 * @param {string} charId
 * @param {number} starsEarned
 */
export function completeCharacter(charId, starsEarned = 2) {
  return ebbinghausManager.completeCharacter(charId, starsEarned);
}

/** 暴露进度单例（档案切换 / 设置等仍走此对象） */
export { ebbinghausManager };

export default {
  getDueReviewCharIds,
  completeReview,
  completeCharacter,
  ebbinghausManager,
};
