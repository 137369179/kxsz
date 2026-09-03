/**
 * tools/validate_characters.mjs
 * ================================================================
 * 字库数据完整性自动化校验脚本 (T3 / B3 / B8)
 * 检查 Stage 1, Stage 2, Stage 3 阶段各汉字数据的必填项与建议项
 */

import { STAGE1_CHARACTERS } from '../src/data/characters/stage1.js';
import { STAGE2_CHARACTERS } from '../src/data/characters/stage2.js';
import { STAGE3_CHARACTERS } from '../src/data/characters/stage3.js';
import { validateCharacter } from '../src/data/charactersSchema.js';

const stages = [
  { name: 'Stage 1 (启蒙森林 200字)', data: STAGE1_CHARACTERS },
  { name: 'Stage 2 (生活小镇 400字)', data: STAGE2_CHARACTERS },
  { name: 'Stage 3 (星际探索 890字)', data: STAGE3_CHARACTERS }
];

let totalChars = 0;
let totalErrors = 0;
let totalWarnings = 0;

console.log('=== 《凯茜识字》字库 Schema 校验开始 ===');

for (const stage of stages) {
  let stageErrors = 0;
  let stageWarnings = 0;

  for (const char of stage.data) {
    totalChars++;
    const res = validateCharacter(char);
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

  console.log(`\n📊 ${stage.name}: 检验 ${stage.data.length} 字 | 必填项错误: ${stageErrors} | 改进警告: ${stageWarnings}`);
}

console.log('\n=======================================');
console.log(`总计扫描汉字: ${totalChars}`);
console.log(`必填项错误 (Errors): ${totalErrors}`);
console.log(`改进建议项 (Warnings): ${totalWarnings}`);

if (totalErrors === 0) {
  console.log('🎉 恭喜！全量 1490 字核心 Schema 必填字段校验 100% 通过！\n');
  process.exit(0);
} else {
  console.error(`⚠️ 存在 ${totalErrors} 处必填项错误，请核查修复。\n`);
  process.exit(1);
}
