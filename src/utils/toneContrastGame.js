/**
 * toneContrastGame.js — B5 声调意识训练
 *
 * 教育学依据：
 *   3-12 岁汉语语音意识元分析 (59 篇 12514 样本) — 声调意识 r=0.37 最高预测因子
 *   每天必有一个声调对比游戏（铁律 B5 硬约束）
 *   B8 原子化：每种题型独立调度
 *
 * 3 种题型：
 *   1. listen_pick_tone   听音辨调（核心，r=0.37）
 *   2. tone_pick_char     调号选字
 *   3. tone_order         调序排列
 *
 * 本模块是**纯数据 + 游戏逻辑**（零 DOM 依赖）。UI 由调用方负责。
 * 发音走 soundAndFX.speakPriority（遵守 C4 音频总线）。
 */

import { soundAndFX } from "./soundEngine.js";

// ──────────────────────────────────────────────────────────
// 声调符号 / 编号 / 名称
// ──────────────────────────────────────────────────────────
export const TONE_INFO = [
  { num: 0, symbol: "",  name: "轻声",  emoji: "·" },
  { num: 1, symbol: "ˉ", name: "第一声", longName: "阴平",  color: "#FF6B6B", desc: "高平调，像妈妈" },
  { num: 2, symbol: "ˊ", name: "第二声", longName: "阳平",  color: "#FFA94D", desc: "上升调，像蚂蚁" },
  { num: 3, symbol: "ˇ", name: "第三声", longName: "上声",  color: "#51CF66", desc: "降升调，像小马" },
  { num: 4, symbol: "ˋ", name: "第四声", longName: "去声",  color: "#339AF0", desc: "下降调，像大象" },
];

// 声调发音口诀（便于家长讲解）
export const TONE_MNEMONICS = {
  1: "一声平～妈妈的妈",
  2: "二声扬～蚂蚁的蚂",
  3: "三声拐弯～小马的马",
  4: "四声降～大象的象",
};

// ──────────────────────────────────────────────────────────
// 拼音 → 声调编号 / 去调音节
// ──────────────────────────────────────────────────────────

const TONE_MAP = {
  ā: "a", á: "a", ǎ: "a", à: "a",
  ē: "e", é: "e", ě: "e", è: "e",
  ī: "i", í: "i", ǐ: "i", ì: "i",
  ō: "o", ó: "o", ǒ: "o", ò: "o",
  ū: "u", ú: "u", ǔ: "u", ù: "u",
  ǖ: "v", ǘ: "v", ǚ: "v", ǜ: "v",
};

export function getToneNum(pinyin) {
  if (!pinyin) return 0;
  if (/[āēīōūǖ]/.test(pinyin)) return 1;
  if (/[áéíóúǘ]/.test(pinyin)) return 2;
  if (/[ǎěǐǒǔǚ]/.test(pinyin)) return 3;
  if (/[àèìòùǜ]/.test(pinyin)) return 4;
  return 0;
}

export function stripTone(pinyin) {
  if (!pinyin) return "";
  return pinyin.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, (m) => TONE_MAP[m] || m);
}

// ──────────────────────────────────────────────────────────
// 构建声调对比对（从 CHARACTER_DATABASE）
// ──────────────────────────────────────────────────────────

let _pairsCache = null;

/**
 * 扫描整个字库，按"去调音节"分组，找出有 2+ 声调对比的 base
 * @param {Array} charDB  CHARACTER_DATABASE
 * @returns {Array<{base:string, toneCount:number, tones:Record<number, {char, pinyin, id}>}>}
 */
export function buildTonePairs(charDB) {
  if (_pairsCache) return _pairsCache;
  const byBase = {};
  for (const c of charDB) {
    const tone = getToneNum(c.pinyin);
    if (!tone) continue;
    const base = stripTone(c.pinyin).toLowerCase();
    if (!byBase[base]) byBase[base] = {};
    // 同 base 同 tone 只保留第一个字（去重）
    if (!byBase[base][tone]) {
      byBase[base][tone] = { char: c.char, pinyin: c.pinyin, id: c.id };
    }
  }
  const result = [];
  for (const [base, tones] of Object.entries(byBase)) {
    const keys = Object.keys(tones).map(Number).sort((a, b) => a - b);
    if (keys.length >= 2) {
      result.push({ base, toneCount: keys.length, tones });
    }
  }
  // 4 声齐全的放前面（教学价值最高）
  result.sort((a, b) => b.toneCount - a.toneCount);
  _pairsCache = result;
  return result;
}

/** 清除缓存（测试 / 热更新用） */
export function _invalidateCache() { _pairsCache = null; }

/**
 * 从 pairs 里选一个出题目录。
 * 优先选 toneCount 多的（4声 > 3声 > 2声）。
 * 同一 base 连续两次选同一个的概率低（shuffle + 过滤上次）。
 */
export function pickPromptPairs(pairs, { count = 3, avoidBase } = {}) {
  if (!pairs || pairs.length === 0) return [];
  // 优先 toneCount 多的
  const sorted = [...pairs].sort((a, b) => b.toneCount - a.toneCount);
  const available = avoidBase ? sorted.filter((p) => p.base !== avoidBase) : sorted;
  if (available.length === 0) return sorted.slice(0, count);
  return available.slice(0, count);
}

// ──────────────────────────────────────────────────────────
// 题型引擎：生成题目 + 验证答案
// ──────────────────────────────────────────────────────────

export const TONE_GAME_TYPES = Object.freeze({
  LISTEN_PICK_TONE: "listen_pick_tone",   // 听音辨调
  TONE_PICK_CHAR:   "tone_pick_char",     // 调号选字
  TONE_ORDER:       "tone_order",         // 调序排列
});

/**
 * 生成一题。
 *
 * @param {string} type  TONE_GAME_TYPES.*
 * @param {object} pair  一个 tone pair（base + tones）
 * @param {Array}  allPairs  全量 pairs（用于生成干扰选项）
 * @returns {{
 *   type, question, options, correctAnswer, explanation,
 *   speakText?: string  // 需要播放的文本
 * }}
 */
export function generateQuestion(type, pair, allPairs) {
  if (!pair) return null;

  switch (type) {
    case TONE_GAME_TYPES.LISTEN_PICK_TONE:
      return _generateListenPickTone(pair);
    case TONE_GAME_TYPES.TONE_PICK_CHAR:
      return _generateTonePickChar(pair, allPairs);
    case TONE_GAME_TYPES.TONE_ORDER:
      return _generateToneOrder(pair);
    default:
      return null;
  }
}

function _generateListenPickTone(pair) {
  // 从 pair 里随机选一个 tone 作为"听音目标"
  const toneNums = Object.keys(pair.tones).map(Number);
  const targetTone = toneNums[Math.floor(Math.random() * toneNums.length)];
  const target = pair.tones[targetTone];

  // 4 个选项：1/2/3/4 全部列出（声调选择题固定 4 选项）
  const options = [1, 2, 3, 4].map((n) => ({
    tone: n,
    label: TONE_INFO[n].name + TONE_INFO[n].symbol,
    color: TONE_INFO[n].color,
  }));

  return {
    type: TONE_GAME_TYPES.LISTEN_PICK_TONE,
    question: "听听这个音是第几声？",
    speakText: target.pinyin,   // 播放带调拼音（让孩子听声调）
    targetChar: target.char,
    targetPinyin: target.pinyin,
    options,
    correctAnswer: targetTone,
    explanation: `${target.char} 是${TONE_INFO[targetTone].name}（${TONE_INFO[targetTone].longName}）`,
  };
}

function _generateTonePickChar(pair, allPairs) {
  // 选一个 tone，然后从 pair 里找同 base 不同 tone 的字当干扰项
  const toneNums = Object.keys(pair.tones).map(Number);
  const targetTone = toneNums[Math.floor(Math.random() * toneNums.length)];
  const target = pair.tones[targetTone];

  // 干扰项：同 base 其他 tone 的字
  const distractors = toneNums
    .filter((t) => t !== targetTone)
    .map((t) => pair.tones[t])
    .filter(Boolean);

  // 如果同 base 不够 4 个，从其他 pair 拉
  const options = shuffle([target, ...distractors]).slice(0, 4);
  while (options.length < 4 && allPairs && allPairs.length > 0) {
    const rp = allPairs[Math.floor(Math.random() * allPairs.length)];
    const rn = Object.keys(rp.tones).map(Number);
    const rc = rp.tones[rn[Math.floor(Math.random() * rn.length)]];
    if (!options.some((o) => o.char === rc.char)) options.push(rc);
  }

  return {
    type: TONE_GAME_TYPES.TONE_PICK_CHAR,
    question: `找一找，哪个字是 ${target.pinyin}${TONE_INFO[targetTone].symbol} ？`,
    speakText: target.pinyin,
    options: options.map((o) => ({ char: o.char, pinyin: o.pinyin })),
    correctAnswer: target.char,
    explanation: `${target.char} 读作 ${target.pinyin}，是${TONE_INFO[targetTone].name}`,
  };
}

function _generateToneOrder(pair) {
  // 从 pair 里按声调升序取字（如果 pair 有 4 声就取 4 个，不足就有几个取几个）
  const toneNums = Object.keys(pair.tones).map(Number).sort((a, b) => a - b);
  const chars = toneNums.map((t) => pair.tones[t]);
  const correctAnswer = toneNums.map((t) => pair.tones[t].char);
  // shuffle 打乱
  const shuffled = shuffle(chars);

  return {
    type: TONE_GAME_TYPES.TONE_ORDER,
    question: "听一听，把它们按一声、二声、三声、四声的顺序排一排",
    speakTexts: shuffled.map((c) => c.pinyin),
    options: shuffled.map((c) => ({ char: c.char, pinyin: c.pinyin, tone: getToneNum(c.pinyin) })),
    correctAnswer,
    correctOrder: correctAnswer,
    explanation: "声调顺序是：一声平～二声扬～三声拐弯～四声降",
  };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 验证答案。
 * @returns {boolean}
 */
export function checkAnswer(question, answer) {
  if (!question) return false;
  return question.correctAnswer === answer;
}

/** 声调游戏一局（N 题）—— 纯数据，不碰 DOM */
export function generateSession(charDB, { numQuestions = 5, types = null } = {}) {
  const pairs = buildTonePairs(charDB);
  if (pairs.length === 0) return { questions: [], total: 0 };

  // 题型选择：默认三种均衡
  const defaultTypes = [
    TONE_GAME_TYPES.LISTEN_PICK_TONE,
    TONE_GAME_TYPES.LISTEN_PICK_TONE,  // 核心，权重高
    TONE_GAME_TYPES.TONE_PICK_CHAR,
    TONE_GAME_TYPES.TONE_ORDER,
  ];
  const pool = types ?? defaultTypes;

  const questions = [];
  let lastBase = null;
  for (let i = 0; i < numQuestions && questions.length < numQuestions; i++) {
    const type = pool[i % pool.length];
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    // 避免连续同一 base
    const p = lastBase && pair.base === lastBase
      ? pairs[(pairs.indexOf(pair) + 1) % pairs.length]
      : pair;
    const q = generateQuestion(type, p, pairs);
    if (q) {
      questions.push(q);
      lastBase = p.base;
    }
  }
  return { questions, total: questions.length };
}
