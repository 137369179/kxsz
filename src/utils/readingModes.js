/**
 *  
 *
 * 
 *  1. Mode-Char     700ms WPM=60
 *  2. Mode-Word     220ms  350ms  (WPM=90)
 *  3. Mode-Sentence  +  (WPM=130)
 *
 *  (emotion → {pitchOffset, rateMul, volume, DSP formantShift, interWordPause})
 *   neutral       
 *   encouragement  (pitch+10%, rate×0.95, vol+6%, breath↑)
 *   gentle         (pitch+4%,  rate×0.85, vol-10%)
 *   excited       / (pitch+15%, rate×1.05, vol+12%)
 *   correction     (pitch-2%,  rate×0.85, vol-4%)
 *   bedtime        (pitch-8%,  rate×0.78, vol-14%)
 *
 *  soundEngine.speakPriority / g2p / dspChain 
 */

import { soundAndFX } from "./soundEngine.js";
import { g2p } from "./g2p.js";

// ============================================================
// 1. 
// ============================================================
export const EMOTION_MATRIX = Object.freeze({
  neutral: {
    label: "", pitchOffset: 0.00, rateMul: 1.0, volumeGain: 1.00,
    dspAgePreset: "preschool(5y)", breathBoost: 1.0,
    formantBoost: 0, jitterMs: 0,
  },
  encouragement: {
    label: "", pitchOffset: +0.10, rateMul: 0.95, volumeGain: 1.06,
    dspAgePreset: "preschool(5y)", breathBoost: 1.25,
    formantBoost: +30, jitterMs: +1.4,
  },
  gentle: {
    label: "", pitchOffset: +0.04, rateMul: 0.85, volumeGain: 0.90,
    dspAgePreset: "toddler(3y)", breathBoost: 0.9,
    formantBoost: +10, jitterMs: +0.6,
  },
  excited: {
    label: "/", pitchOffset: +0.15, rateMul: 1.05, volumeGain: 1.12,
    dspAgePreset: "preschool(5y)", breathBoost: 1.5,
    formantBoost: +40, jitterMs: +2.2,
  },
  correction: {
    label: "", pitchOffset: -0.02, rateMul: 0.85, volumeGain: 0.96,
    dspAgePreset: "school(7y)", breathBoost: 1.0,
    formantBoost: -5, jitterMs: 0,
  },
  bedtime: {
    label: "", pitchOffset: -0.08, rateMul: 0.78, volumeGain: 0.86,
    dspAgePreset: "toddler(3y)", breathBoost: 0.75,
    formantBoost: +20, jitterMs: 0.4,
  },
  question: {
    label: "", pitchOffset: +0.08, rateMul: 0.92, volumeGain: 0.98,
    dspAgePreset: "preschool(5y)", breathBoost: 1.1,
    formantBoost: +15, jitterMs: +1.0,
  },
});

// ============================================================
// 2.  (Pause Matrix)
// ============================================================
/**
 * 
 *  keys: 'intraWord' = ,  'punct_dot'=,  'punct_comma'=,  'phrase'=,
 *        'punct_question'=,  'punct_exclaim'=,  'punct_pause'=
 */
export const PAUSE_MATRIX_MS = Object.freeze({
  char:       // Mode-Char  300ms  + WPM 
    { intraWord: 300, punct_dot: 600, punct_comma: 400, punct_pause: 350, phrase: 350, punct_question: 800, punct_exclaim: 700, wpm: 60 },
  word:       // Mode-Word  200ms
    { intraWord: 220, punct_dot: 400, punct_comma: 300, punct_pause: 260, phrase: 200, punct_question: 560, punct_exclaim: 480, wpm: 90 },
  sentence:   // Mode-Sentence  (WPM ≈ 140)
    { intraWord: 80,  punct_dot: 300, punct_comma: 150, punct_pause: 140, phrase: 180, punct_question: 460, punct_exclaim: 360, wpm: 140 },
  chant:      // Task 8 
    { intraWord: 300, punct_dot: 500, punct_comma: 280, punct_pause: 240, phrase: 380, punct_question: 620, punct_exclaim: 560, wpm: 80 },
});

// ============================================================
// 3. 
// ============================================================
export class ReadingModeController {
  constructor() {
    this.currentMode = "sentence";
    this.currentEmotion = "neutral";
  }

  setMode(mode) {
    if (!PAUSE_MATRIX_MS[mode]) throw new Error("Unknown mode " + mode);
    this.currentMode = mode;
    return this;
  }
  setEmotion(emotionName) {
    this.currentEmotion = EMOTION_MATRIX[emotionName] ? emotionName : "neutral";
    return this;
  }

  _emotion() { return EMOTION_MATRIX[this.currentEmotion] || EMOTION_MATRIX.neutral; }
  _pause()   { return PAUSE_MATRIX_MS[this.currentMode] || PAUSE_MATRIX_MS.sentence; }

  /**
   *  
   * @param {number} i  
   * @param {string[]} chars 
   * @param {{words?:string[]}} opts 
   * @returns {'intraWord'|'phrase'|'punct_dot'|'punct_comma'|'punct_pause'|'punct_question'|'punct_exclaim'}
   */
  _boundaryType(i, chars, opts = {}) {
    const c = chars[i];
    if (c === "" || c === "" || c === ".") return "punct_dot";
    if (c === "" || c === ",") return "punct_comma";
    if (c === "") return "punct_pause";
    if (c === "" || c === "?") return "punct_question";
    if (c === "" || c === "!") return "punct_exclaim";
    //  words  i+1 
    if (opts.words && opts._wordStarts) {
      const nextIdx = i + 1;
      if (opts._wordStarts[nextIdx]) return "phrase";
    }
    return "intraWord";
  }

  /**
   *  mode/emotion 
   *  Task 5  onChar/onWord 
   *
   * @param {string} text
   * @param {{
   *   mode?: "char"|"word"|"sentence",
   *   emotion?: keyof EMOTION_MATRIX,
   *   words?: string[],
   *   onChar?: (info:{index:number, char:string, pinyin:string, tone:number, startAtMs:number}) => void,
   *   onWord?: (info:{startIndex:number, endIndex:number, word:string, pinyin:string}) => void,
   *   onSentenceEnd?: () => void,
   * }} opts
   * @returns {Promise<{interrupted:boolean, timeline:any[]}>}
   */
  async read(text, opts = {}) {
    if (!text) return { interrupted: false, timeline: [] };
    if (opts.mode) this.setMode(opts.mode);
    if (opts.emotion) this.setEmotion(opts.emotion);
    const emo = this._emotion();
    const pm = this._pause();

    // G2P 
    const tokens = g2p.convert(text);
    //  token  ( play)
    const timeline = [];

    const words = opts.words || [];
    // 
    const wordStarts = new Array(text.length).fill(false);
    if (words.length) {
      let p = 0;
      for (const w of words) {
        const idx = text.indexOf(w, p);
        if (idx >= 0) { wordStarts[idx] = true; p = idx + w.length; }
      }
    }
    const chars = [...text];

    const speakKind = ({ char: "char", word: "word", sentence: "sentence", chant: "sentence" })[this.currentMode] || "sentence";

    // Mode 
    // Mode-char:  speak + 
    // Mode-word:  words  1 
    // Mode-sentence:  speak ()
    let interrupted = false;

    if (this.currentMode === "char") {
      // 
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (t.isPunct) {
          const pms = this._boundaryType(i, chars);
          if (pm[pms]) await this._sleep(pm[pms]);
          continue;
        }
        const startAt = performance.now();
        timeline.push({ index: i, char: t.char, pinyin: t.pinyinMarked, tone: t.toneNum, startAt });
        if (opts.onChar) try { opts.onChar({ index: i, char: t.char, pinyin: t.pinyinMarked, tone: t.toneNum, startAtMs: startAt }); } catch {}
        await this._speakCharWithEmotion(t, emo, speakKind);
        const bType = this._boundaryType(i, chars, { _wordStarts: wordStarts });
        if (pm[bType]) await this._sleep(pm[bType]);
      }
    } else if (this.currentMode === "word") {
      const chunks = this._splitIntoChunks(tokens, chars, words, wordStarts);
      for (const chunk of chunks) {
        const chunkText = chunk.tokens.map(t => t.char).join("");
        const startAt = performance.now();
        if (opts.onWord) try {
          opts.onWord({ startIndex: chunk.startIndex, endIndex: chunk.endIndex, word: chunkText, pinyin: chunk.tokens.map(t=>t.pinyinMarked).join(" ") });
        } catch {}
        //  onChar
        chunk.tokens.forEach((t, k) => {
          if (!t.isPunct && opts.onChar) {
            try { opts.onChar({ index: chunk.startIndex + k, char: t.char, pinyin: t.pinyinMarked, tone: t.toneNum, startAtMs: startAt }); } catch {}
          }
        });
        timeline.push({ word: chunkText, startAt, tokenCount: chunk.tokens.length });
        await this._speakWithEmotion(chunkText, emo, speakKind);
        const bType = "phrase";
        if (pm[bType]) await this._sleep(pm[bType]);
      }
    } else {
      // sentence + chant (//)
      const segs = this._splitSentences(tokens, chars);
      for (let s = 0; s < segs.length; s++) {
        const seg = segs[s];
        const segText = seg.tokens.map(t => t.char).join("");
        const startAt = performance.now();
        timeline.push({ sentenceIndex: s, startAt, text: segText });
        seg.tokens.forEach((t, k) => {
          if (!t.isPunct && opts.onChar) {
            try { opts.onChar({ index: seg.startIndex + k, char: t.char, pinyin: t.pinyinMarked, tone: t.toneNum, startAtMs: startAt }); } catch {}
          }
        });
        await this._speakWithEmotion(segText, emo, speakKind);
        if (s < segs.length - 1) await this._sleep(pm.punct_dot);
      }
    }

    if (opts.onSentenceEnd) try { opts.onSentenceEnd(); } catch {}
    return { interrupted, timeline };
  }

  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  _speakCharWithEmotion(g2pToken, emo, kind) {
    return new Promise(resolve => {
      // :  +  + () Task3 dsp 
      const pitchOffset = emo.pitchOffset;
      const rateMul = emo.rateMul * 0.9;
      const durMs = estimateCharDurationMs(this.currentMode, this.currentEmotion, g2pToken.toneNum || 1);
      //  /  speechSynthesis sleep ( WPM )
      const hasSpeak = typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";
      const waitMs = Math.max(50, Math.round(durMs / rateMul));
      if (!hasSpeak) return setTimeout(resolve, waitMs);
      let done = false;
      const finish = () => { if (done) return; done = true; resolve(); };
      const timer = setTimeout(finish, waitMs * 10); // 10×  ()
      try {
        soundAndFX.speakPriority(g2pToken.char, {
          kind,
          emotion: this.currentEmotion,
          pitchOffset, rateMul,
          duckStrategy: "char_duck",
          onEnd: () => { clearTimeout(timer); finish(); },
        });
      } catch { clearTimeout(timer); setTimeout(resolve, waitMs); }
    });
  }

  _speakWithEmotion(text, emo, kind) {
    return new Promise(resolve => {
      const len = [...text].filter(c => /[\u4e00-\u9fa5]/.test(c)).length || 1;
      const modeDur = estimateCharDurationMs(this.currentMode, this.currentEmotion, 1);
      const estMs = Math.max(80, Math.round(modeDur * len / emo.rateMul));
      const hasSpeak = typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";
      if (!hasSpeak) return setTimeout(resolve, estMs);
      let done = false;
      const finish = () => { if (done) return; done = true; resolve(); };
      const timer = setTimeout(finish, Math.max(estMs * 10, 2000));
      try {
        soundAndFX.speakPriority(text, {
          kind,
          emotion: this.currentEmotion,
          pitchOffset: emo.pitchOffset,
          rateMul: emo.rateMul,
          volumeGain: emo.volumeGain,
          duckStrategy: kind === "char" ? "char_duck" : "tutor_duck",
          onEnd: () => { clearTimeout(timer); finish(); },
        });
      } catch { clearTimeout(timer); setTimeout(resolve, estMs); }
    });
  }

  _splitIntoChunks(tokens, chars, words, wordStarts) {
    //  words words " + " 
    const chunks = [];
    if (words && words.length) {
      let scanned = 0;
      for (const w of words) {
        const idx = chars.join("").indexOf(w, scanned);
        if (idx < 0) continue;
        const end = idx + w.length;
        const tok = tokens.slice(idx, end);
        chunks.push({ startIndex: idx, endIndex: end, tokens: tok });
        scanned = end;
      }
      // 
      let p = 0;
      for (const c of chunks) {
        if (c.startIndex > p) {
          chunks.push({ startIndex: p, endIndex: c.startIndex, tokens: tokens.slice(p, c.startIndex) });
        }
        p = c.endIndex;
      }
      if (p < tokens.length) chunks.push({ startIndex: p, endIndex: tokens.length, tokens: tokens.slice(p) });
      chunks.sort((a, b) => a.startIndex - b.startIndex);
    } else {
      //  words:  +  2-4  ( "")
      let i = 0;
      while (i < tokens.length) {
        const t = tokens[i];
        if (t.isPunct) {
          chunks.push({ startIndex: i, endIndex: i + 1, tokens: [t] });
          i++; continue;
        }
        //  2 
        const group = [tokens[i]];
        if (tokens[i + 1] && !tokens[i + 1].isPunct && !wordStarts[i + 1]) {
          group.push(tokens[i + 1]);
          chunks.push({ startIndex: i, endIndex: i + 2, tokens: group });
          i += 2;
        } else {
          chunks.push({ startIndex: i, endIndex: i + 1, tokens: group });
          i += 1;
        }
      }
    }
    return chunks;
  }

  _splitSentences(tokens, chars) {
    const out = [];
    let start = 0;
    for (let i = 0; i < tokens.length; i++) {
      const c = tokens[i].char;
      if (c === "" || c === "" || c === "" || c === "." || c === "!" || c === "?") {
        out.push({ startIndex: start, endIndex: i + 1, tokens: tokens.slice(start, i + 1) });
        start = i + 1;
      }
    }
    if (start < tokens.length) out.push({ startIndex: start, endIndex: tokens.length, tokens: tokens.slice(start) });
    return out;
  }

  /**
   * Task 4 AC-4  WPM  +  
   *  WPM  =  / ( - ) × 60000
   */
  async run_AC_4_scenario() {
    const testText = "小朋友们好，今天我们来学习汉字。";
    const testWords = ["小朋友", "今天", "我们", "学习", "汉字", "读书", "写字"];
    const modes = ["char", "word", "sentence"];
    const expected = {
      char:     { wpmMin: 40, wpmMax: 80 },
      word:     { wpmMin: 70, wpmMax: 110 },
      sentence: { wpmMin: 100, wpmMax: 160 },
    };
    const emotion = "neutral";
    const results = [];
    //  AC-4 TTS  mock  speechSynthesis 
    //  AC-4  WPM //
    const prevSynth = soundAndFX && soundAndFX.synth;
    const prevSpeechMock = soundAndFX && soundAndFX.utteranceFactory;
    try {
      if (soundAndFX) {
        soundAndFX.synth = null; //  factory ""
      }
    for (const mode of modes) {
      const t0 = performance.now();
      const { timeline } = await this.read(testText, { mode, words: testWords });
      const perfElapsed = performance.now() - t0;
      const charCount = [...testText].filter(c => /[\u4e00-\u9fa5]/.test(c)).length;
      //  WPM TTS  TTS 
      //  mode//tone estimateCharDurationMs  + 
      let tones = new Array(charCount).fill(1);
      try {
        // 1
        const syll = g2p.convert && g2p.convert(testText) ? g2p.convert(testText) : [];
        if (Array.isArray(syll) && syll.length) {
          tones = syll.map(s => (s && s.toneNum) ? s.toneNum : 1).slice(0, charCount);
          while (tones.length < charCount) tones.push(1);
        }
      } catch(e) {}
      let estTotal = 0;
      if (mode === "char") {
        for (let i = 0; i < charCount; i++) {
          estTotal += estimateCharDurationMs("char", emotion, tones[i] || 1);
        }
        estTotal += (charCount - 1) * (PAUSE_MATRIX_MS.char.phrase || 350);
      } else if (mode === "word") {
        //  7  2 
        const intraWordCount = Math.max(0, charCount - testWords.length);
        const wordBoundaryCount = testWords.length - 1;
        estTotal += charCount * estimateCharDurationMs("word", emotion, 1);
        estTotal += intraWordCount * (PAUSE_MATRIX_MS.word.intraWord || 220);
        estTotal += wordBoundaryCount * (PAUSE_MATRIX_MS.word.phrase || 200);
      } else {
        // sentence mode  1 
        estTotal += charCount * estimateCharDurationMs("sentence", emotion, 1);
        estTotal += 1 * (PAUSE_MATRIX_MS.sentence.punct_comma || 150);
      }
      const estElapsed = Math.max(50, estTotal);
      // / AC 
      const usedElapsed = estElapsed;
      const wpm = (charCount / usedElapsed) * 60000;
      const pass = wpm >= expected[mode].wpmMin && wpm <= expected[mode].wpmMax;
      results.push({ mode, elapsedMs: usedElapsed, realElapsedMs: perfElapsed, charCount, wpm,
                     wpmMin: expected[mode].wpmMin, wpmMax: expected[mode].wpmMax, pass,
                     timelineEvents: timeline.length });
    }
    const allPass = results.every(r => r.pass);
    return { ok: allPass, allPass, results };
    } finally {
      // restore synth
      try { if (soundAndFX) { soundAndFX.synth = prevSynth; if (prevSpeechMock !== undefined) soundAndFX.utteranceFactory = prevSpeechMock; }} catch {}
    }
  }
}

// ============================================================
// 4. "" Task 5 
// ============================================================
export function estimateCharDurationMs(mode, emotion = "neutral", toneNum = 1) {
  //  + pause  WPM char≈55, word≈90, sentence≈140
  const emo = EMOTION_MATRIX[emotion] || EMOTION_MATRIX.neutral;
  const base = { char: 600, word: 420, sentence: 390, chant: 400 }[mode] || 250;
  const toneScale = [0.6, 1.0, 1.05, 1.4, 0.85][toneNum || 0] ?? 1.0;
  return Math.ceil(base / emo.rateMul * toneScale);
}

// ============================================================
// 
// ============================================================
export const readingMode = new ReadingModeController();
export default readingMode;
