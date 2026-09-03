/**
 * 字库详情惰性加载器
 * ------------------------------------------------------------------
 * characters.js 只含索引字段（首屏瘦身）；本模块负责在需要时动态 import
 * characterDetails.js，并把详情字段 Object.assign 回 CHARACTER_DATABASE 的
 * 对应字对象上（同一引用补全，保持 12 个消费方 API 兼容，无需改动）。
 *
 * 幂等 + 可重试：多次调用只触发一次 import；失败后允许下次重试。
 */
import { CHARACTER_DATABASE } from "../data/characters.js";

let _detailsPromise = null;
let _loaded = false;

/**
 * 确保详情层已加载并补全到 CHARACTER_DATABASE 各字对象。
 * @returns {Promise<boolean>} true=已就绪（含本次加载成功），false=加载失败
 */
export function ensureDetails() {
  if (_loaded) return Promise.resolve(true);
  if (_detailsPromise) return _detailsPromise;

  _detailsPromise = import("../data/characterDetails.js")
    .then((m) => {
      const details = m.CHARACTER_DETAILS || {};
      let patched = 0;
      for (const c of CHARACTER_DATABASE) {
        const d = details[c.id];
        if (d) {
          Object.assign(c, d);
          patched++;
        }
      }
      _loaded = true;
      if (patched !== CHARACTER_DATABASE.length) {
        console.warn(`[charDetailLoader] 详情补全 ${patched}/${CHARACTER_DATABASE.length} 字`);
      }
      return true;
    })
    .catch((err) => {
      _detailsPromise = null; // 失败可重试
      console.error("[charDetailLoader] 详情加载失败:", err);
      return false;
    });

  return _detailsPromise;
}

/** 是否已加载详情层 */
export function isDetailsLoaded() {
  return _loaded;
}
