/**
 * multimodalEngine.js — E17 多模态融合编排器
 *
 * 教育学依据：
 *   多模态学习理论（Multimodal Learning Theory）
 *   Paivio 双重编码：语言（verbal）+ 非语言（non-verbal）双通路编码
 *   儿童多感官输入：视觉(形/emoji) + 听觉(音/节拍) + 动觉(interaction) → 记忆增益
 *   场景适配：不同场景（learn/review/play/drill/report）需要不同多模态组合
 *
 * 数据层：characters.js 有 10+ 种多模态属性
 *   视觉：char, oracleGlyph, bronzeGlyph, emoji, evolution 4 阶段
 *   听觉：pinyin, pinyinTone, meanings.mnemonic, meanings.primary
 *   语义：meanings, words, sentence, confusingChars
 *   动觉：interaction(drag_up/tap/swipe), mechanism(rise/fall/spin), playHint
 *   游戏：gameConfig(type/title/instruction/options)
 *
 * 职责（纯数据编排，零 DOM）：
 *   1. 按场景组合多模态元素
 *   2. 自动生成最佳呈现包（给 UI 渲染）
 *   3. 跨引擎调度（etymologyEngine / chantEngine / difficultyEngine / reportEngine）
 */

import { buildPlan, CHANT_MODES } from "./chantEngine.js";

// ──────────────────────────────────────────────────────────
// 场景定义
// ──────────────────────────────────────────────────────────
export const SCENES = Object.freeze({
  /** 新字学习（LearnModule reveal-box） */
  LEARN: "learn",
  /** 复习（ReviewModule） */
  REVIEW: "review",
  /** 游戏/绘本（PlayModule / BookModule） */
  PLAY: "play",
  /** 操练（DrillEngine 题型生成） */
  DRILL: "drill",
  /** 报告（ParentModule） */
  REPORT: "report",
});

// ──────────────────────────────────────────────────────────
// 模态类型
// ──────────────────────────────────────────────────────────
export const MODALITIES = Object.freeze({
  VISUAL_GLYPH:     "visual_glyph",      // 字形（现代/甲骨文/金文）
  VISUAL_EMOJI:     "visual_emoji",      // emoji 情境
  VISUAL_TIMELINE:  "visual_timeline",   // 字源 4 阶段
  AUDITORY_PINYIN:  "auditory_pinyin",   // 拼音朗读
  AUDITORY_CHANT:   "auditory_chant",    // 口诀节拍唱读
  AUDITORY_SENTENCE:"auditory_sentence", // 例句朗读
  SEMANTIC_MEANING: "semantic_meaning",  // 字义
  SEMANTIC_WORD:    "semantic_word",     // 组词
  SEMANTIC_CONFUSE: "semantic_confuse",  // 易错对比
  MOTOR_INTERACT:   "motor_interact",    // 动觉交互（拖拽/点击类型）
  MOTOR_HINT:       "motor_hint",        // playHint 引导
  GAME_CONFIG:      "game_config",       // 小游戏配置
});

// ──────────────────────────────────────────────────────────
// 场景 → 模态权重（教育学编排）
// ──────────────────────────────────────────────────────────

/**
 * 每个场景下各模态的推荐权重 (0-5)
 * 5 = 核心必用, 3 = 建议用, 1 = 可选, 0 = 不用
 */
const SCENE_WEIGHTS = {
  [SCENES.LEARN]: {
    [MODALITIES.VISUAL_GLYPH]:    5,  // 字形必须
    [MODALITIES.VISUAL_TIMELINE]: 5,  // 字源必用（E12 铁律）
    [MODALITIES.VISUAL_EMOJI]:    3,
    [MODALITIES.AUDITORY_PINYIN]: 5,
    [MODALITIES.AUDITORY_CHANT]:  4,  // 口诀唱读（E16）
    [MODALITIES.SEMANTIC_MEANING]:4,
    [MODALITIES.SEMANTIC_WORD]:   3,
    [MODALITIES.SEMANTIC_CONFUSE]:2,  // 易错提示（E12）
    [MODALITIES.MOTOR_HINT]:      3,
  },
  [SCENES.REVIEW]: {
    [MODALITIES.VISUAL_GLYPH]:    5,
    [MODALITIES.AUDITORY_PINYIN]: 5,
    [MODALITIES.SEMANTIC_MEANING]:4,
    [MODALITIES.SEMANTIC_CONFUSE]:3,  // 难字重点
    [MODALITIES.AUDITORY_CHANT]:  3,
    [MODALITIES.GAME_CONFIG]:     4,  // 游戏化复习
  },
  [SCENES.PLAY]: {
    [MODALITIES.GAME_CONFIG]:     5,
    [MODALITIES.MOTOR_INTERACT]:  5,
    [MODALITIES.MOTOR_HINT]:      5,
    [MODALITIES.VISUAL_EMOJI]:    4,
    [MODALITIES.AUDITORY_PINYIN]: 3,
    [MODALITIES.VISUAL_GLYPH]:    3,
  },
  [SCENES.DRILL]: {
    [MODALITIES.VISUAL_GLYPH]:    5,
    [MODALITIES.AUDITORY_PINYIN]: 5,
    [MODALITIES.SEMANTIC_MEANING]:5,
    [MODALITIES.SEMANTIC_WORD]:   4,
    [MODALITIES.SEMANTIC_CONFUSE]:3,
  },
  [SCENES.REPORT]: {
    [MODALITIES.SEMANTIC_MEANING]:5,  // 多维度数据（reportEngine）
    [MODALITIES.SEMANTIC_CONFUSE]:3,
  },
};

// ──────────────────────────────────────────────────────────
// 1. 数据提取：从 char 里抽取各模态原始数据
// ──────────────────────────────────────────────────────────

/**
 * 从 char 数据条目中抽取所有可用的多模态原始数据。
 * 纯函数：零外部依赖，零 DOM。
 *
 * @param {object} charItem  characters.js 条目
 * @returns {Object<MODALITIES, any>}  模态类型 → 原始数据
 */
export function extractModalities(charItem) {
  if (!charItem) return {};

  const mod = {};

  // 视觉
  if (charItem.char) mod[MODALITIES.VISUAL_GLYPH] = charItem.char;
  // 只要 evolution 描述存在就有 timeline（oracleGlyph/bronzeGlyph 允许为空）
  const hasEvolution = charItem.evolution && (charItem.evolution.oracleDesc || charItem.evolution.story);
  if (hasEvolution || charItem.oracleGlyph || charItem.bronzeGlyph) {
    mod[MODALITIES.VISUAL_TIMELINE] = {
      oracle: charItem.oracleGlyph || charItem.char,
      bronze: charItem.bronzeGlyph || charItem.char,
      seal: charItem.char,
      modern: charItem.char,
      evolution: charItem.evolution || {},
    };
  }
  if (charItem.emoji) mod[MODALITIES.VISUAL_EMOJI] = charItem.emoji;

  // 听觉
  if (charItem.pinyin) mod[MODALITIES.AUDITORY_PINYIN] = charItem.pinyin;
  if (charItem.meanings?.mnemonic) mod[MODALITIES.AUDITORY_CHANT] = charItem.meanings.mnemonic;
  if (charItem.sentence) mod[MODALITIES.AUDITORY_SENTENCE] = charItem.sentence;

  // 语义
  if (charItem.meanings) mod[MODALITIES.SEMANTIC_MEANING] = charItem.meanings;
  if ((charItem.words || []).length) mod[MODALITIES.SEMANTIC_WORD] = charItem.words;
  if ((charItem.confusingChars || []).length) {
    mod[MODALITIES.SEMANTIC_CONFUSE] = {
      chars: charItem.confusingChars,
      hint: charItem.confusingHint || "",
    };
  }

  // 动觉
  if (charItem.interaction) mod[MODALITIES.MOTOR_INTERACT] = charItem.interaction;
  if (charItem.mechanism) mod[MODALITIES.MOTOR_HINT + '_mechanism'] = charItem.mechanism;
  if (charItem.playHint) mod[MODALITIES.MOTOR_HINT] = charItem.playHint;

  // 游戏
  if (charItem.gameConfig) mod[MODALITIES.GAME_CONFIG] = charItem.gameConfig;

  return mod;
}

// ──────────────────────────────────────────────────────────
// 2. 场景适配：按权重组合
// ──────────────────────────────────────────────────────────

/**
 * 根据场景 + 难度等级，挑选最合适的多模态元素。
 *
 * @param {object} charItem
 * @param {string} scene      SCENES.*
 * @param {object} [opts]
 *   - difficultyLevel: "easy" | "medium" | "hard" (来自 difficultyEngine)
 *   - age: 3-8 岁
 *   - skipModals: string[] 手动跳过的模态类型
 * @returns {{ modalities: Object, score: number, rationale: string }}
 */
export function assemblePackage(charItem, scene, opts = {}) {
  const weights = SCENE_WEIGHTS[scene] || SCENE_WEIGHTS[SCENES.LEARN];
  const available = extractModalities(charItem);
  const skipSet = new Set(opts.skipModals || []);

  // 年龄适配：3-5 岁多 emoji/动觉, 6-8 岁多语义/逻辑
  const ageBonus = _ageModifier(opts.age || 5);

  // 难度适配
  const difficultyBonus = _difficultyModifier(opts.difficultyLevel || "medium");

  const selected = {};
  let totalWeight = 0;
  let hitWeight = 0;

  for (const [modal, baseWeight] of Object.entries(weights)) {
    if (skipSet.has(modal)) continue;

    const hasData = available[modal] !== undefined;
    if (!hasData) continue;

    const ageAdj = ageBonus[modal] ?? 0;
    const diffAdj = difficultyBonus[modal] ?? 0;
    const adjWeight = Math.max(0, Math.min(5, baseWeight + ageAdj + diffAdj));
    totalWeight += baseWeight;

    if (adjWeight > 0) {
      selected[modal] = {
        data: available[modal],
        weight: adjWeight,
        recommended: adjWeight >= 3,
      };
      hitWeight += baseWeight;
    }
  }

  const coverage = totalWeight > 0 ? Math.round((hitWeight / totalWeight) * 100) : 0;
  const rationale = _buildRationale(scene, selected, coverage);

  return {
    scene,
    difficultyLevel: opts.difficultyLevel || "medium",
    modalities: selected,
    coverage,
    score: coverage,
    rationale,
    char: charItem?.char || "",
  };
}

function _ageModifier(age) {
  // 年龄对各模态权重的微调（-1 / 0 / +1）
  if (age <= 5) {
    return {
      [MODALITIES.VISUAL_EMOJI]:   +1,
      [MODALITIES.MOTOR_HINT]:     +1,
      [MODALITIES.SEMANTIC_WORD]:  -1,  // 组词对 3-5 岁难
    };
  }
  if (age >= 7) {
    return {
      [MODALITIES.SEMANTIC_CONFUSE]:+1,
      [MODALITIES.SEMANTIC_MEANING]:+1,
      [MODALITIES.AUDITORY_CHANT]:  -1,  // 大孩子可能嫌幼稚
    };
  }
  return {};
}

function _difficultyModifier(level) {
  if (level === "easy") {
    return {
      [MODALITIES.SEMANTIC_CONFUSE]:-1,  // 容易的字不用易错提示
      [MODALITIES.AUDITORY_CHANT]:  +1,  // 口诀帮记忆
    };
  }
  if (level === "hard") {
    return {
      [MODALITIES.SEMANTIC_CONFUSE]:+1,  // 难字给易错对比
      [MODALITIES.MOTOR_HINT]:      +1,  // 多动觉引导
    };
  }
  return {};
}

function _buildRationale(scene, selected, coverage) {
  const types = Object.keys(selected);
  const recommended = types.filter((t) => selected[t].recommended).join("+");
  return `场景[${scene}] 覆盖 ${coverage}% — 推荐: ${recommended || "基础模态"}`;
}

// ──────────────────────────────────────────────────────────
// 3. 跨引擎调度（整合其他 utils 引擎）
// ──────────────────────────────────────────────────────────

/**
 * 增强组装：调用其他引擎补充模态数据。
 * 这是 "编排器" 的核心——不重新造轮子，而是组合现有引擎。
 *
 * @param {object} charItem
 * @param {string} scene
 * @param {object} [opts]
 * @returns {Promise<object>}  增强版 package
 */
export async function assembleEnhanced(charItem, scene, opts = {}) {
  const base = assemblePackage(charItem, scene, opts);

  // 动态 import 避免循环依赖
  const enhancers = [];

  // E12: etymologyEngine → 补充 VISUAL_TIMELINE / chant
  enhancers.push(import("./etymologyEngine.js").then(({ buildEtymologyCard }) => {
    if (base.modalities[MODALITIES.VISUAL_TIMELINE] || base.modalities[MODALITIES.AUDITORY_CHANT]) {
      const etym = buildEtymologyCard(charItem);
      base.modalities[MODALITIES.VISUAL_TIMELINE] = {
        ...(base.modalities[MODALITIES.VISUAL_TIMELINE]?.data || {}),
        stages: etym.stages,
        summary: etym.summary,
        mnemonic: etym.mnemonic,
        confusing: etym.confusing,
      };
    }
  }).catch(() => {}));

  // E16: chantEngine → 生成节拍计划
  enhancers.push(Promise.resolve().then(() => {
    if (base.modalities[MODALITIES.AUDITORY_CHANT]) {
      const chantPlan = buildPlan(charItem, { mode: CHANT_MODES.CHANT, bpm: 110 });
      base.modalities[MODALITIES.AUDITORY_CHANT] = {
        chant: base.modalities[MODALITIES.AUDITORY_CHANT].data ?? base.modalities[MODALITIES.AUDITORY_CHANT],
        plan: chantPlan,
      };
    }
  }).catch(() => {}));

  await Promise.all(enhancers);

  base.rationale += " + 跨引擎增强";
  return base;
}

// ──────────────────────────────────────────────────────────
// 4. 便捷 API：一字一场景 → 即取即用
// ──────────────────────────────────────────────────────────

/**
 * 最常用的快捷方法：一字一场景 → 同步返回基础包
 * （不调 await，避免阻塞）
 *
 * @param {object} charItem
 * @param {string} scene
 * @param {object} [opts]
 * @returns {object}  多模态包（同步）
 */
export function forChar(charItem, scene, opts = {}) {
  return assemblePackage(charItem, scene, opts);
}

// 默认导出
export const multimodalEngine = { extractModalities, assemblePackage, assembleEnhanced, forChar };
export default multimodalEngine;
