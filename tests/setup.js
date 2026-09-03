/**
 * vitest 全局 setup（已改为空操作）
 * ------------------------------------------------------------------
 * 字库详情层(characterDetails.js, 2.8MB) 改为按需加载：需要详情字段
 * (strokes/words/meanings/evolution/gameConfig/confusingChars) 的测试
 * 各自显式 `await ensureDetails()`（见 multimodalEngine/learnModule/characters 测试）。
 *
 * 历史：此前在此全局 `await ensureDetails()`，导致 vitest threads 池下
 * 每个 worker 都重复 transform 2.8MB 详情层 → 全量运行 OOM(Exit 137)。
 */
