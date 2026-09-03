/**
 * 凯茜识字 (Cathy Literacy) - 阶梯字库核心入口 (1490 全量科学分阶版)
 * ------------------------------------------------------------
 * 架构重构已完成按阶段物理切片 (TTI 提速)：
 * - src/data/characters/stage1.js (1 - 200 字，启蒙基础)
 * - src/data/characters/stage2.js (201 - 600 字，常用偏旁)
 * - src/data/characters/stage3.js (601 - 1490 字，进阶提升)
 * - src/data/characters/index.js (异步加载工厂与 O(1) 索引字典)
 */

export * from "./characters/index.js";
