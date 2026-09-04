/**
 * tools/validate_characters.mjs
 * ================================================================
 * 字库数据完整性自动化校验脚本 (T3 / B3 / B8)
 * 校验索引层 (characters.js) 与详情层 (characterDetails.js) 的契约完整性与 Schema 规范
 */

import { CHARACTER_DATABASE } from '../src/data/characters.js';
import { CHARACTER_DETAILS } from '../src/data/characterDetails.js';
import { validateCharacter } from '../src/data/charactersSchema.js';

const stages = [
  { name: 'Stage 1 (启蒙森林)', filter: (c) => c.stage === 1 },
  { name: 'Stage 2 (生活小镇)', filter: (c) => c.stage === 2 },
  { name: 'Stage 3 (星际探索)', filter: (c) => c.stage === 3 }
];

let totalChars = 0;
let totalErrors = 0;
let totalWarnings = 0;

console.log('=== 《凯茜识字》字库 Schema 校验开始 ===');

// 1. 基础映射与唯一性校验
const seenIds = new Set();
const seenChars = new Set();
for (const char of CHARACTER_DATABASE) {
  if (seenIds.has(char.id)) {
    console.error(`❌ 重复的字库 ID: ${char.id} (${char.char})`);
    totalErrors++;
  }
  seenIds.add(char.id);

  if (seenChars.has(char.char)) {
    console.warn(`⚠️ 重复的汉字字符: ${char.char} (ID: ${char.id})`);
    totalWarnings++;
  }
  seenChars.add(char.char);

  if (!CHARACTER_DETAILS[char.id]) {
    console.error(`❌ [${char.id}] 缺少 characterDetails.js 对应的详情记录: ${char.char}`);
    totalErrors++;
  }
}

// 2. 按 Stage 校验 Schema 必填项与建议项
for (const stage of stages) {
  let stageErrors = 0;
  let stageWarnings = 0;
  const stageData = CHARACTER_DATABASE.filter(stage.filter);

  for (const char of stageData) {
    totalChars++;
    const detail = CHARACTER_DETAILS[char.id] || {};
    const fullChar = { ...char, ...detail };
    const res = validateCharacter(fullChar);
    if (!res.valid) {
      stageErrors += res.errors.length;
      totalErrors += res.errors.length;
      console.error(`❌ [${stage.name}] [${char.id || '未知ID'}] 字:${char.char || '?'} - ${res.errors.join('; ')}`);
    }
    if (res.warnings.length > 0) {
      stageWarnings += res.warnings.length;
      totalWarnings += res.warnings.length;
    }
  }

  console.log(`📊 ${stage.name}: 检验 ${stageData.length} 字 | 必填项错误: ${stageErrors} | 改进警告: ${stageWarnings}`);
}

console.log('\n=======================================');
console.log(`总计扫描汉字: ${totalChars} (详情库记录: ${Object.keys(CHARACTER_DETAILS).length})`);
console.log(`必填项错误 (Errors): ${totalErrors}`);
console.log(`改进建议项 (Warnings): ${totalWarnings}`);

if (totalErrors === 0) {
  console.log('🎉 恭喜！全量字库核心 Schema 必填字段校验 100% 通过！\n');
  process.exit(0);
} else {
  console.error(`⚠️ 存在 ${totalErrors} 处必填项错误，请核查修复。\n`);
  process.exit(1);
}
