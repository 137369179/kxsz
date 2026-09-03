/**
 * etymologyEngine.js — E12 字源讲解升级
 *
 * 教育学依据：
 *   字源教学法：通过甲骨文→金文→小篆→楷书 4 阶段演变，建立形义联系
 *   记忆术：mnemonic 口诀押韵 → 记忆保留率 +40%
 *   对比辨析：confusingChars 主动暴露易错点 → 减少混淆
 *   维果茨基脚手架：用儿童能听懂的语言讲解
 *
 * 职责（纯数据，零 DOM）：
 *   1. 从 char 数据提取 4 阶段演变 timeline
 *   2. 生成儿童口诀（押韵 + 有画面感）
 *   3. 整理易错字对比集
 *   4. 生成一句话字源讲解（给 TTS 朗读）
 */

// ──────────────────────────────────────────────────────────
// 4 阶段定义
// ──────────────────────────────────────────────────────────
export const EVOLUTION_STAGES = Object.freeze([
  { key: "oracle", label: "甲骨文", glyphField: "oracleGlyph",  descField: "oracleDesc",  age: "3500年前", color: "#b45309", emoji: "🐢" },
  { key: "bronze", label: "金文",   glyphField: "bronzeGlyph",  descField: "bronzeDesc",  age: "3000年前", color: "#92400e", emoji: "🔔" },
  { key: "seal",   label: "小篆",   glyphField: null,           descField: "sealDesc",    age: "2200年前", color: "#78350f", emoji: "📜" },
  { key: "modern", label: "楷书",   glyphField: "char",         descField: "modernDesc",  age: "约2000年", color: "#1c1917", emoji: "✏️" },
]);

// ──────────────────────────────────────────────────────────
// 从 char 数据构建 4 阶段 timeline
// ──────────────────────────────────────────────────────────

/**
 * @param {object} charItem  characters.js 条目
 * @returns {Array<{key, label, age, glyph, desc, color, emoji}>}
 */
export function buildEvolutionStages(charItem) {
  if (!charItem) return [];
  const evo = charItem.evolution || {};

  return EVOLUTION_STAGES.map((stage) => {
    // glyph: 优先显式字段 → fallback 到 modern 字本身（oracleGlyph/bronzeGlyph 常为空）
    let glyph = charItem[stage.glyphField] || "";
    if (stage.key !== "modern" && !glyph) {
      // oracle/bronze 没数据时用现代字代替 + 标注
      glyph = charItem.char;
    }
    const desc = evo[stage.descField] || _fallbackDesc(charItem, stage.key);
    return {
      key: stage.key,
      label: stage.label,
      age: stage.age,
      glyph,
      desc,
      color: stage.color,
      emoji: stage.emoji,
      isFallback: stage.key !== "modern" && !charItem[stage.glyphField],
    };
  });
}

function _fallbackDesc(char, stageKey) {
  const charType = char.charType || "";
  if (charType === "pictograph") {
    switch (stageKey) {
      case "oracle": return `${char.char} 最初是古人看到的实物样子`;
      case "bronze": return "线条开始规整，刻在青铜器上";
      case "seal":   return "笔画简化，形成小篆风格";
      default:       return "楷书定型，成为今天的规范字";
    }
  }
  return `${char.char} 的${stageKey === "modern" ? "现代" : "古代"}写法`;
}

// ──────────────────────────────────────────────────────────
// 口诀生成（mnemonic）
// ──────────────────────────────────────────────────────────

/**
 * 提取 + 润色口诀：
 *   优先用 meanings.mnemonic（人工编写，最准），
 *   否则从 evolution.story 第一分句提炼，
 *   最后 fallback 到 charType 通用口诀模板。
 *
 * @param {object} charItem
 * @returns {{ chant: string, source: "mnemonic"|"story"|"template", chantType: string }}
 */
export function extractMnemonic(charItem) {
  if (!charItem) return { chant: "", source: "template", chantType: "unknown" };

  const mnemonic = charItem.meanings?.mnemonic;
  if (mnemonic && mnemonic.length > 1) {
    return { chant: _rhythmize(mnemonic), source: "mnemonic", chantType: "charType" };
  }

  const story = charItem.evolution?.story;
  if (story && story.length > 10) {
    // 取第一分句（到逗号/句号）
    const firstClause = story.split(/[,，。.!！]/)[0];
    if (firstClause.length > 3) {
      return { chant: _rhythmize(firstClause), source: "story", chantType: charItem.charType || "unknown" };
    }
  }

  // 通用模板 fallback
  const templates = {
    pictograph:    `古人画 ${charItem.char}，看物造形象图形`,
    ideograph:     `指事会意 ${charItem.char}，抽象符号有意义`,
    phonetic:      `形旁声旁 ${charItem.char}，半表音来半表义`,
    compound:      `合体组成 ${charItem.char}，多字拼合新意生`,
  };
  return {
    chant: templates[charItem.charType] || `${charItem.char} 字有道理，快来一起探索它`,
    source: "template",
    chantType: charItem.charType || "unknown",
  };
}

/** 把句子变成 7 字节奏（每 3-4 字加个停顿点） */
function _rhythmize(str) {
  // 去掉多余空格，加顿号节奏
  const clean = str.trim();
  // 如果已经很短（≤12字），直接返回
  if (clean.length <= 14) return clean;
  // 超过 14 字 → 截到合适长度，加"——"断开
  const half = Math.ceil(clean.length / 2);
  return clean.slice(0, half) + "，" + clean.slice(half);
}

// ──────────────────────────────────────────────────────────
// 易错字对比（confusing set）
// ──────────────────────────────────────────────────────────

/**
 * @param {object} charItem
 * @returns {{ pairs: Array<{other, hint}>, hasConfusables: boolean, count: number }}
 */
export function buildConfusingSet(charItem) {
  if (!charItem) return { pairs: [], hasConfusables: false, count: 0 };

  const confusing = Array.isArray(charItem.confusingChars) ? charItem.confusingChars : [];
  const hint = charItem.confusingHint || "";

  // 把 confusingHint 解析成 pairs（格式: "目(mù), 白(bái)"）
  const hintEntries = _parseConfusingHint(hint);

  const pairs = confusing.slice(0, 3).map((otherChar, i) => {
    const hintEntry = hintEntries.find((h) => h.char === otherChar);
    return {
      other: otherChar,
      otherPinyin: hintEntry?.pinyin || "",
      diff: hintEntry?.diff || "",
    };
  });

  return {
    pairs,
    hasConfusables: pairs.length > 0,
    count: pairs.length,
  };
}

function _parseConfusingHint(hint) {
  // 格式: "目(mù), 白(bái), 田(tián), 旦(dàn)"
  if (!hint) return [];
  const entries = [];
  const parts = hint.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
  for (const p of parts) {
    const m = p.match(/^(.+?)\(([^)]+)\)/);
    if (m) {
      entries.push({ char: m[1].trim(), pinyin: m[2].trim() });
    } else if (p.length === 1) {
      entries.push({ char: p, pinyin: "" });
    }
  }
  return entries;
}

// ──────────────────────────────────────────────────────────
// 一句话字源讲解（给 TTS 朗读）
// ──────────────────────────────────────────────────────────

/**
 * 生成儿童能听懂的字源讲解：
 *   "{char} 最早是甲骨文{oracleDesc}，
 *    后来金文{bronzeDesc}，小篆{sealDesc}，
 *    现在楷书{modernDesc}。口诀：{mnemonic}"
 *
 * @param {object} charItem
 * @returns {string}
 */
export function summarizeEtymology(charItem) {
  if (!charItem) return "";
  const evo = charItem.evolution || {};
  const m = extractMnemonic(charItem);

  const parts = [`${charItem.char}字`];

  if (evo.oracleDesc) parts.push(`最早在甲骨文里，${evo.oracleDesc}`);
  else if (evo.story) parts.push(evo.story.split(/[。.]/)[0]);

  if (evo.modernDesc) parts.push(`现在的楷书，${evo.modernDesc}`);

  parts.push(`口诀是：${m.chant}`);

  return parts.join("。") + "。";
}

// ──────────────────────────────────────────────────────────
// 综合卡片：一次给全 UI 需要的数据
// ──────────────────────────────────────────────────────────

/**
 * @param {object} charItem
 * @returns {{ stages, mnemonic, confusing, summary, charType }}
 */
export function buildEtymologyCard(charItem) {
  return {
    stages: buildEvolutionStages(charItem),
    mnemonic: extractMnemonic(charItem),
    confusing: buildConfusingSet(charItem),
    summary: summarizeEtymology(charItem),
    charType: charItem?.charType || "unknown",
  };
}
