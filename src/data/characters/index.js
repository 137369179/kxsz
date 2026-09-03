/**
 * 凯茜识字 (Cathy Literacy) - 阶梯分阶字库加载中心
 * ------------------------------------------------------------
 * 支持 Stage1 首屏按需加速，以及异步工厂懒加载与全量兼容视图
 */

import { STAGE1_CHARACTERS } from "./stage1.js";
import { STAGE2_CHARACTERS } from "./stage2.js";
import { STAGE3_CHARACTERS } from "./stage3.js";

export { STAGE1_CHARACTERS } from "./stage1.js";
export { STAGE2_CHARACTERS } from "./stage2.js";
export { STAGE3_CHARACTERS } from "./stage3.js";

/** 全量向后兼容字库 (1490字) */
export const CHARACTER_DATABASE = [
  ...STAGE1_CHARACTERS,
  ...STAGE2_CHARACTERS,
  ...STAGE3_CHARACTERS
];

// 高性能 O(1) 索引缓存
const charIdMap = new Map();
const charGlyphMap = new Map();
for (const c of CHARACTER_DATABASE) {
  if (c.id) charIdMap.set(c.id, c);
  if (c.char) charGlyphMap.set(c.char, c);
}

/**
 * 按阶段获取字表 (支持异步动态加载)
 * @param {number} stage 1 | 2 | 3
 * @returns {Promise<Array>}
 */
export async function getStageCharacters(stage = 1) {
  if (stage === 1) return STAGE1_CHARACTERS;
  if (stage === 2) {
    const mod = await import("./stage2.js");
    return mod.STAGE2_CHARACTERS;
  }
  if (stage === 3) {
    const mod = await import("./stage3.js");
    return mod.STAGE3_CHARACTERS;
  }
  return STAGE1_CHARACTERS;
}

/**
 * 异步获取全量字库
 * @returns {Promise<Array>}
 */
export async function getAllCharacters() {
  return CHARACTER_DATABASE;
}

/**
 * 根据字 id 查找字符 (O(1) 索引)
 * @param {string} id 如 "char_001"
 * @returns {object|null}
 */
export function findCharacterById(id) {
  return charIdMap.get(id) || null;
}

/**
 * 根据汉字本身查找字符 (O(1) 索引)
 * @param {string} ch 如 "日"
 * @returns {object|null}
 */
export function findCharacterByChar(ch) {
  return charGlyphMap.get(ch) || null;
}
