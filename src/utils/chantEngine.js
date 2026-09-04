/**
 * chantEngine.js — E16 童谣节拍唱读
 *
 * 教育学依据：
 *   童谣旋律记忆 — 韵脚 + 节拍 = +40% 记忆保留率
 *   多感官编码（Multi-sensory Encoding）— 视觉字 + 听觉语音 + 节拍敲击 → 三重记忆链
 *   儿童语言习得：3-8 岁是韵律敏感期，节奏感是语言能力 predictor
 *   维果茨基：节拍让"念"变成"唱"，降低认知负担
 *
 * 核心：
 *   把 mnemonic 口诀按字切分，给每个字安排节拍 + 间隔，
 *   调 soundEngine.playChantHit() 做敲击 + speakPriority 逐字朗读
 *
 * 用法：
 *   import { chantEngine } from '../utils/chantEngine.js';
 *
 *   const plan = chantEngine.buildPlan(charItem, { bpm: 120, mode: "chant" });
 *   chantEngine.execute(plan, charItem, { onBeat: () => ..., onChar: () => ... });
 */

// ──────────────────────────────────────────────────────────
// 节拍模式
// ──────────────────────────────────────────────────────────
export const CHANT_MODES = Object.freeze({
  /** 普通朗读（无节拍） */
  PLAIN: "plain",
  /** 童谣节拍（每字 1 拍，乐句间停顿） */
  CHANT: "chant",
  /** 快速念诵（半拍） */
  RAPID: "rapid",
  /** 演唱（拖长音） */
  SING: "sing",
});

/** 默认 BPM */
const DEFAULT_BPM = 110;

/** 模式 → 每字时长 (ms) */
const MODE_CHAR_MS = {
  [CHANT_MODES.PLAIN]:  350,
  [CHANT_MODES.CHANT]:  450,
  [CHANT_MODES.RAPID]:  250,
  [CHANT_MODES.SING]:   700,
};

/** 停顿模式 → 字符映射 */
const PAUSE_CHARS = /[，。！？、；：,.!?;:]/;

// ──────────────────────────────────────────────────────────
// 1. 构建唱读计划（纯数据，零时间执行）
// ──────────────────────────────────────────────────────────

/**
 * @param {object} charItem   characters.js 条目（需要 meaninings.mnemonic）
 * @param {object} [opts]
 *   - mode: CHANT_MODES
 *   - bpm:  number (60-180)
 *   - char: charItem.char （如果不传会从 charItem 拿）
 * @returns {{ chars: Array<{text, isPause, beat, durationMs}>, totalMs, bpm, mode }}
 */
export function buildPlan(charItem, opts = {}) {
  const mode = opts.mode || CHANT_MODES.CHANT;
  const bpm = Math.max(60, Math.min(180, opts.bpm || DEFAULT_BPM));
  const baseMs = MODE_CHAR_MS[mode] ?? MODE_CHAR_MS[CHANT_MODES.CHANT];

  // 口诀：优先 mnemonic，fallback 到 char + 通用句
  const raw = charItem?.meanings?.mnemonic || "";
  const char = opts.char || charItem?.char || "";
  const text = raw || (char ? `${char}字有道理` : "");

  if (!text) {
    return { chars: [], totalMs: 0, bpm, mode };
  }

  const tokens = [];
  // 首 token：先念目标字（突出重点）
  if (char) {
    tokens.push({ text: char, isPause: false, isTargetChar: true });
    tokens.push({ text: "", isPause: true, pauseMs: 300 });
  }

  // 口诀逐字切分
  for (const ch of text) {
    if (PAUSE_CHARS.test(ch)) {
      // 标点 → 停顿（乐句边界）
      tokens.push({ text: ch, isPause: true, pauseMs: _punctuationPause(ch) });
    } else if (ch.trim()) {
      tokens.push({ text: ch, isPause: false });
    }
  }

  // 计算节拍序号 + 时长
  let beat = 0;
  let totalMs = 0;
  const plan = tokens.map((tok) => {
    if (tok.isPause) {
      const ms = tok.pauseMs ?? 200;
      totalMs += ms;
      return { ...tok, beat: -1, durationMs: ms };
    }
    beat++;
    const ms = baseMs;
    totalMs += ms;
    return { ...tok, beat, durationMs: ms };
  });

  return { chars: plan, totalMs, bpm, mode };
}

function _punctuationPause(ch) {
  if ("。！？!?".includes(ch)) return 600;
  if ("，、,;；".includes(ch)) return 350;
  if ("：:".includes(ch)) return 250;
  return 200;
}

// ──────────────────────────────────────────────────────────
// 2. 执行唱读（带节奏调度）
// ──────────────────────────────────────────────────────────

/**
 * @param {object} plan        buildPlan() 输出
 * @param {object} charItem   用于 speakPriority 调用
 * @param {object} [callbacks]
 *   - onBeat(beatIndex, charText): 每拍敲击回调
 *   - onChar(charText, durationMs): 每字朗读回调
 *   - onComplete(): 全部完成
 * @returns {{ cancel(): void }} 取消句柄
 */
export function execute(plan, charItem, callbacks = {}, soundEngine = null) {
  if (!plan?.chars?.length) {
    callbacks.onComplete?.();
    return { cancel() {} };
  }

  let _sound = soundEngine;
  let idx = 0;
  let cancelled = false;
  const timers = [];

  function scheduleNext() {
    if (cancelled || idx >= plan.chars.length) {
      if (!cancelled) callbacks.onComplete?.();
      return;
    }

    const tok = plan.chars[idx];

    if (tok.isPause) {
      // 停顿 → 只等，不朗读
      const t = setTimeout(() => { idx++; scheduleNext(); }, tok.durationMs);
      timers.push(t);
    } else {
      // 节拍敲击（chant 模式才敲）
      if (plan.mode !== CHANT_MODES.PLAIN && _sound) {
        const t = setTimeout(() => {
          try { _sound.playChantHit?.(); } catch (_) {}
        }, 0);
        timers.push(t);
      }
      callbacks.onBeat?.(tok.beat, tok.text);

      // 逐字朗读（1 个字符 → 1 次 speakPriority）
      if (tok.text && _sound) {
        _sound.speakPriority(tok.text, {
          kind: "char",
          emotion: plan.mode === CHANT_MODES.SING ? "gentle" : "normal",
          durationMs: tok.durationMs,
        });
      } else if (tok.text) {
        // 无 soundEngine → 至少调 webkitSpeech
        try {
          const u = new SpeechSynthesisUtterance(tok.text);
          u.lang = "zh-CN";
          window.speechSynthesis.speak(u);
        } catch (_) {}
      }
      callbacks.onChar?.(tok.text, tok.durationMs);

      const t = setTimeout(() => { idx++; scheduleNext(); }, tok.durationMs);
      timers.push(t);
    }
  }

  scheduleNext();

  return {
    cancel() {
      cancelled = true;
      for (const t of timers) clearTimeout(t);
      try { window.speechSynthesis?.cancel(); } catch (_) {}
      try { _sound?.stopSpeaking?.(); } catch (_) {}
    },
  };
}

// ──────────────────────────────────────────────────────────
// 3. 便捷执行器
// ──────────────────────────────────────────────────────────

/**
 * 高层 API：buildPlan + execute 一步到位。
 *
 * @param {object} charItem
 * @param {object} [opts]
 *   - mode, bpm (传给 buildPlan)
 *   - soundEngine: 传入实例（播放节拍和朗读）
 *   - callbacks (传给 execute)
 * @returns {{ plan, handle }}
 */
export function chantChar(charItem, opts = {}) {
  const plan = buildPlan(charItem, opts);
  const handle = execute(plan, charItem, opts.callbacks || {}, opts.soundEngine || null);
  return { plan, handle };
}

// ──────────────────────────────────────────────────────────
// 4. 导出常量给 UI 用
// ──────────────────────────────────────────────────────────

/** 每字默认时长（按模式）*/
export const CHAR_DURATION_MS = MODE_CHAR_MS;

/** 可用模式列表 */
export const AVAILABLE_MODES = Object.values(CHANT_MODES);

// 默认导出
export const chantEngine = { buildPlan, execute, chantChar };
export default chantEngine;
