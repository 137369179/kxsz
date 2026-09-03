/**
 * vitest 全局 setup：在所有测试运行前确保字库详情层已补全。
 * 字库拆分为「索引层(characters.js) + 详情层(characterDetails.js)」后，
 * 同步 import characters.js 只含索引字段；本 setup 提前 ensureDetails()，
 * 把 strokes/words/meanings/evolution 等详情字段 Object.assign 回字对象，
 * 使 15 个读详情字段的测试无需改动即可通过。
 */
import { ensureDetails } from "../src/utils/charDetailLoader.js";

await ensureDetails();
