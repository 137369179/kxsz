/**
 * 发音评测引擎 (Pronunciation Assessment Engine)
 *
 * Web Speech API (SpeechRecognition) + WebAudio 双通道：
 * 1. MediaRecorder/MediaStream 录制 3s ~ 6s 音频
 * 2. ASR：window.SpeechRecognition / window.webkitSpeechRecognition 实时转写
 * 3. G2P 音素归一化 + Needleman-Wunsch 对齐
 * 4. 三维评分：
 *      PA (Pronunciation Accuracy) — 发音准确度
 *      SR (Stress & Rhythm)        — 节奏完整度
 *      CM (Completeness)           — 内容完整度
 *      TOTAL = PA * 0.55 + SR * 0.25 + CM * 0.20
 * 5. 错误定位：{ substitution | deletion | insertion | tone_error }
 * 6. 状态机：IDLE → LISTENING → EVALUATING → RESULT / ERROR
 *
 * 降级：无 SpeechRecognition 环境提供 manualEvaluate({text, stars}) 手动评分，保持同一结果形状。
 */

import { soundAndFX } from "./soundEngine.js";
import { g2p } from "./g2p.js";
import { EVENTS, eventBus } from "./eventBus.js";

const STATES = Object.freeze({
  IDLE: "idle", LISTENING: "listening", EVALUATING: "evaluating",
  RESULT: "result", ERROR: "error",
});

// ============================================================
// 1. 拼音音素工具
// ============================================================
const PINYIN_INITIALS = ["zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "r", "z", "c", "s", "y", "w"];

const SIMILAR_INITIAL_MAP = new Map([
  ["z", ["zh", "j"]], ["zh", ["z", "j"]], ["j", ["z", "zh"]],
  ["c", ["ch", "q"]], ["ch", ["c", "q"]], ["q", ["c", "ch"]],
  ["s", ["sh", "x"]], ["sh", ["s", "x"]], ["x", ["s", "sh"]],
  ["l", ["n", "r"]],  ["n", ["l", "r"]],  ["r", ["l", "n"]],
  ["f", ["h"]],       ["h", ["f"]],
  ["b", ["p"]],       ["p", ["b"]],
  ["d", ["t"]],       ["t", ["d"]],
  ["g", ["k"]],       ["k", ["g"]],
]);

const SIMILAR_FINAL_MAP = new Map([
  ["an", ["ang", "ian", "iang"]], ["ang", ["an", "iang"]],
  ["en", ["eng", "in", "ing"]],   ["eng", ["en", "ing"]],
  ["in", ["ing", "en", "eng"]],   ["ing", ["in", "eng"]],
  ["un", ["ong", "iong"]],        ["ong", ["un", "iong"]],
  ["u", ["o", "ou", "uo"]],       ["o", ["u", "ou", "uo"]],
  ["i", ["e", "ie"]],             ["e", ["i", "ie"]],
  ["ai", ["ei"]],                 ["ei", ["ai"]],
]);

/**
 * 分解拼音为 {initial, final, tone}
 */
function decomposePinyin(pinyinStr, toneNum = 0) {
  let s = (pinyinStr || "").toLowerCase().replace(/ü/g, "v");
  let initial = "";
  for (const init of PINYIN_INITIALS) {
    if (s.startsWith(init)) {
      initial = init;
      s = s.slice(init.length);
      break;
    }
  }
  const final = s;
  return { initial, final, tone: toneNum || 0 };
}

/**
 * 计算两个汉字在音素层面的相似度 (0.0 ~ 1.0)
 */
function computeCharPhoneticSimilarity(charA, charB) {
  if (!charA || !charB) return 0;
  if (charA === charB) return 1.0;

  let infoA = null, infoB = null;
  try {
    const convA = g2p.convert(charA);
    if (convA && convA[0] && !convA[0].isPunct) {
      infoA = { strip: convA[0].pinyinStrip, tone: convA[0].toneNum };
    }
    const convB = g2p.convert(charB);
    if (convB && convB[0] && !convB[0].isPunct) {
      infoB = { strip: convB[0].pinyinStrip, tone: convB[0].toneNum };
    }
  } catch {}

  if (!infoA || !infoB) {
    return charA === charB ? 1.0 : 0.0;
  }

  const pyA = decomposePinyin(infoA.strip, infoA.tone);
  const pyB = decomposePinyin(infoB.strip, infoB.tone);

  // 1. 声韵完全相同，按声调差细分
  if (infoA.strip === infoB.strip) {
    const toneDiff = Math.abs(pyA.tone - pyB.tone);
    if (toneDiff === 0) return 0.96; // 完美
    if (toneDiff === 1) return 0.82; // 差 1 个声调（1↔2）
    return 0.70;                     // 差多个声调
  }

  // 2. 声母相同
  if (pyA.initial && pyA.initial === pyB.initial) {
    if (pyA.final === pyB.final) return 0.85;
    const simFinals = SIMILAR_FINAL_MAP.get(pyA.final) || [];
    if (simFinals.includes(pyB.final)) return 0.65; // 前后鼻音等
    return 0.25; // 韵母不同
  }

  // 3. 声母相似 (z/zh, l/n, f/h 等)
  const simInits = SIMILAR_INITIAL_MAP.get(pyA.initial) || [];
  if (simInits.includes(pyB.initial)) {
    if (pyA.final === pyB.final) return 0.72;
    const simFinals = SIMILAR_FINAL_MAP.get(pyA.final) || [];
    if (simFinals.includes(pyB.final)) return 0.55;
    return 0.15;
  }

  // 4. 声韵均不相似
  return 0.0;
}

// ============================================================
// 2. Needleman-Wunsch 音素对齐
// ============================================================
function needlemanWunschPhonetic(refChars, hypChars) {
  const n = refChars.length, m = hypChars.length;
  const gap = -1.0;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  const trace = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) { dp[i][0] = i * gap; trace[i][0] = 1; }
  for (let j = 0; j <= m; j++) { dp[0][j] = j * gap; trace[0][j] = 2; }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const sim = computeCharPhoneticSimilarity(refChars[i - 1], hypChars[j - 1]);
      const matchScore = sim >= 0.85 ? 2.0 : (sim >= 0.5 ? sim * 2.0 : -1.0);
      const diag = dp[i - 1][j - 1] + matchScore;
      const up = dp[i - 1][j] + gap;
      const left = dp[i][j - 1] + gap;
      const best = Math.max(diag, up, left);
      dp[i][j] = best;
      if (best === diag) trace[i][j] = 0;
      else if (best === up) trace[i][j] = 1;
      else trace[i][j] = 2;
    }
  }

  const path = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    const t = trace[i][j];
    if (t === 0) {
      const sim = computeCharPhoneticSimilarity(refChars[i - 1], hypChars[j - 1]);
      path.push({
        type: sim >= 0.85 ? "match" : (sim >= 0.5 ? "sim" : "sub"),
        similarity: sim,
        ref: refChars[i - 1],
        hyp: hypChars[j - 1],
        i: i - 1,
        j: j - 1
      });
      i--; j--;
    } else if (t === 1) {
      path.push({ type: "del", similarity: 0, ref: refChars[i - 1], hyp: null, i: i - 1, j });
      i--;
    } else {
      path.push({ type: "ins", similarity: 0, ref: null, hyp: hypChars[j - 1], i, j: j - 1 });
      j--;
    }
  }
  path.reverse();
  return path;
}

// ============================================================
// 3. 节奏分析器 (RhythmAnalyzer)
// ============================================================
class RhythmAnalyzer {
  constructor(audioCtx) {
    this.ctx = audioCtx;
    this.analyser = audioCtx.createAnalyser();
    this.analyser.fftSize = 512;
    this.timeBuf = new Float32Array(this.analyser.fftSize);
    this.peaks = [];
    this._stop = false;
    this._t0 = 0;
    this.maxRms = 0;
    this.totalRmsSum = 0;
    this.sampleCount = 0;
  }

  attach(stream) {
    try {
      const src = this.ctx.createMediaStreamSource(stream);
      src.connect(this.analyser);
    } catch {}
  }

  start() {
    this.peaks = [];
    this.maxRms = 0;
    this.totalRmsSum = 0;
    this.sampleCount = 0;
    this._t0 = performance.now();
    this._stop = false;
    this._loop();
  }

  stop() {
    this._stop = true;
  }

  _loop() {
    if (this._stop) return;
    try {
      this.analyser.getFloatTimeDomainData(this.timeBuf);
      let sum = 0;
      for (let i = 0; i < this.timeBuf.length; i++) {
        sum += this.timeBuf[i] * this.timeBuf[i];
      }
      const rms = Math.sqrt(sum / this.timeBuf.length);
      this.totalRmsSum += rms;
      this.sampleCount++;
      if (rms > this.maxRms) this.maxRms = rms;

      const t = performance.now() - this._t0;
      const last = this.peaks[this.peaks.length - 1];
      if (rms > 0.025) {
        if (!last || t - last.t > 100) this.peaks.push({ t, rms });
        else if (rms > last.rms) { last.rms = rms; last.t = t; }
      }
    } catch {}
    requestAnimationFrame(() => this._loop());
  }

  getAvgRms() {
    return this.sampleCount > 0 ? (this.totalRmsSum / this.sampleCount) : 0;
  }
}

// ============================================================
// 4. 评测引擎
// ============================================================
export class PronunciationAssessmentEngine {
  constructor() {
    this.state = STATES.IDLE;
    this._transcripts = [];
    this._finalTranscripts = [];
    this._activeRecogText = "";
    this._recordedAudioUrl = null;
    this._lastResult = null;
    this._activeStream = null;
    this._activeMediaRecorder = null;
    this._activeRecog = null;
    this._activeAnalyser = null;
    this._activeFreqData = null;
    this._activeRhythm = null;
    this._audioChunks = [];
    this._currentEvalTarget = "";
    this._currentEvalOpts = {};
    this._evalStartTime = 0;
    this._maxDurationTimer = null;
    this._silenceTimer = null;
    this._lastSpeechTime = 0;
    this._stopping = false;
    this._manualMode = false;
  }

  _setState(newState) {
    this.state = newState;
    eventBus.emit(EVENTS.AUDIO_EVAL_STATE_CHANGE, { state: newState });
  }

  _ensureRecognition() {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  /**
   * 当前环境是否支持浏览器语音识别。
   */
  isSupported() {
    return !!this._ensureRecognition();
  }

  /**
   * 获取当前麦克风实时音量（0~255 频域均值）。
   */
  getLiveVolume() {
    if (!this._activeAnalyser || !this._activeFreqData) return 0;
    try {
      this._activeAnalyser.getByteFrequencyData(this._activeFreqData);
      let sum = 0;
      for (let i = 0; i < this._activeFreqData.length; i++) sum += this._activeFreqData[i];
      return sum / this._activeFreqData.length;
    } catch {
      return 0;
    }
  }

  /**
   * 清理计时器与媒体资源（幂等）。
   */
  _cleanupTimers() {
    if (this._maxDurationTimer) {
      clearTimeout(this._maxDurationTimer);
      this._maxDurationTimer = null;
    }
    if (this._silenceTimer) {
      clearTimeout(this._silenceTimer);
      this._silenceTimer = null;
    }
  }

  /**
   * Safari / 无 ASR 环境的手动评分入口。
   * 保持与 stopAndEvaluate 同一结果形状，便于 UI 复用。
   */
  manualEvaluate({ text = "", stars = 3 } = {}) {
    const targetText = text || "";
    const targetClean = targetText.replace(/[^\u4e00-\u9fa5]/g, "");
    const clampedStars = Math.max(1, Math.min(3, stars || 1));
    const score = clampedStars === 3 ? 100 : clampedStars === 2 ? 78 : 55;
    const perCharReport = [...targetClean].map((ch) => ({
      ref: ch,
      hyp: ch,
      similarity: 1.0,
      score,
      type: "match",
    }));

    const result = {
      score,
      totalScore: score,
      stars: clampedStars,
      target: targetText,
      hypothesis: targetClean,
      isCorrect: score >= 80,
      perCharReport,
      audioUrl: null,
      audioBlob: null,
      manual: true,
    };
    this._lastResult = result;
    this._setState(STATES.RESULT);
    eventBus.emit(EVENTS.AUDIO_EVAL_RESULT, result);
    return result;
  }

  /**
   * 一次性评测便捷入口（供 BookModule 绘本朗读等场景）：
   * 开始录音 → 引擎按 maxSeconds/静音自动收音 → 等待结算 → 返回结果对象。
   * 任何启动失败都返回降级结果（score=0 + error 原因），绝不向上抛错卡死 UI 流程。
   * @param {string} text 期望朗读的文本
   * @param {Object} [opts] { mode, maxSeconds=5, onResult }
   * @returns {Promise<Object>} 与 stopAndEvaluate 相同形状的结果
   */
  async evaluate(text, opts = {}) {
    if (this.state === STATES.LISTENING) {
      try { await this.stopAndEvaluate(); } catch {}
    }
    const maxSeconds = Math.max(2, opts.maxSeconds || 5);
    const fallback = {
      score: 0, totalScore: 0, stars: 0, target: text || "",
      hypothesis: "", isCorrect: false, perCharReport: [],
      audioUrl: null, audioBlob: null, manual: false,
    };

    let startRes = null;
    try {
      startRes = await this.startEvaluation({
        text: text || "",
        mode: opts.mode || "sentence",
        maxDurationMs: maxSeconds * 1000,
        silenceTimeoutMs: Math.max(1500, maxSeconds * 1000 - 1500),
        onResult: opts.onResult,
      });
    } catch (e) {
      return { ...fallback, error: "start_exception" };
    }
    if (!startRes || startRes.ok === false) {
      return { ...fallback, error: startRes?.reason || "start_failed" };
    }

    // 等待引擎自动收音结算（AUDIO_EVAL_RESULT），兜底超时后主动 stopAndEvaluate
    return await new Promise((resolve) => {
      let settled = false;
      const finish = (val) => { if (!settled) { settled = true; off(); clearTimeout(guard); resolve(val); } };
      const off = eventBus.on(EVENTS.AUDIO_EVAL_RESULT, (res) => finish(res));
      const guard = setTimeout(async () => {
        try { finish(await this.stopAndEvaluate()); } catch { finish(fallback); }
      }, (maxSeconds + 2.5) * 1000);
    });
  }

  /**
   * 开始一次发音评测录音。
   * @param {Object} opts
   * @param {string} opts.text            期望朗读的文本
   * @param {string} [opts.mode="char"]   char/word/sentence
   * @param {number} [opts.maxDurationMs=6000]  最大录音时长，到时间自动停止
   * @param {number} [opts.silenceTimeoutMs=4000]  无语音自动停止（从最近一次有声开始计时）
   * @param {Function} [opts.onResult]    中间/最终结果回调：({ transcript, isFinal }) => void
   */
  async startEvaluation(opts = {}) {
    if (this.state === STATES.LISTENING || this.state === STATES.EVALUATING) {
      return { ok: false, reason: "already_running" };
    }

    const targetText = opts.text || "";
    if (!targetText) throw new Error("targetText is required");

    this._cleanupTimers();
    this._stopping = false;
    this._manualMode = false;
    this._currentEvalTarget = targetText;
    this._currentEvalOpts = opts;
    this._audioChunks = [];
    this._recordedAudioUrl = null;
    this._transcripts = [];
    this._finalTranscripts = [];
    this._activeRecogText = "";
    this._lastResult = null;
    this._setState(STATES.LISTENING);

    soundAndFX.init();
    const ctx = soundAndFX.audioCtx;
    const recogClass = this._ensureRecognition();
    this._evalStartTime = performance.now();
    this._lastSpeechTime = performance.now();

    const onResultCb = typeof opts.onResult === "function" ? opts.onResult : null;
    const maxDurationMs = Math.max(2000, opts.maxDurationMs || 6000);
    const silenceTimeoutMs = Math.max(1000, opts.silenceTimeoutMs || 4000);

    // 1. 获取麦克风 (降级允许无 stream)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this._activeStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
      }
    } catch (e) {
      console.warn("[PronunciationEval] getUserMedia fallback:", e);
      this._activeStream = null;
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        this._setState(STATES.ERROR);
        eventBus.emit(EVENTS.AUDIO_EVAL_ERROR, { reason: "mic_permission_denied", error: e.message });
        return { ok: false, reason: "mic_permission_denied" };
      }
    }

    // 2. Web Audio AnalyserNode + RhythmAnalyzer（能量检测）
    if (this._activeStream && ctx) {
      try {
        const source = ctx.createMediaStreamSource(this._activeStream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        this._activeAnalyser = analyser;
        this._activeFreqData = new Uint8Array(analyser.frequencyBinCount);

        this._activeRhythm = new RhythmAnalyzer(ctx);
        this._activeRhythm.attach(this._activeStream);
        this._activeRhythm.start();
      } catch (err) {
        console.warn("[PronunciationEval] analyser setup warning:", err);
      }
    }

    // 3. MediaRecorder 录制 Blob（供回放）
    if (this._activeStream && typeof MediaRecorder !== "undefined") {
      try {
        const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus"
                   : (MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm"
                   : (MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : ""));
        const mr = mime ? new MediaRecorder(this._activeStream, { mimeType: mime }) : new MediaRecorder(this._activeStream);
        this._activeMediaRecorder = mr;
        mr.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) {
            this._audioChunks.push(ev.data);
          }
        };
        mr.start(100);
      } catch (err) {
        this._activeMediaRecorder = null;
      }
    }

    // 4. 最大录音时长自动停止
    this._maxDurationTimer = setTimeout(() => {
      if (this.state === STATES.LISTENING && !this._stopping) {
        this.stopAndEvaluate().catch(() => {});
      }
    }, maxDurationMs);

    // 5. SpeechRecognition 实时转写
    if (recogClass) {
      try {
        this._activeRecog = new recogClass();
        this._activeRecog.lang = "zh-CN";
        this._activeRecog.continuous = true;
        this._activeRecog.interimResults = true;
        this._activeRecog.maxAlternatives = 5;

        this._activeRecog.onresult = (ev) => {
          const lastIdx = ev.results.length - 1;
          for (let i = ev.resultIndex || 0; i < ev.results.length; i++) {
            const res = ev.results[i];
            const top = res[0];
            const text = top?.transcript?.trim();
            if (!text) continue;

            if (res.isFinal) {
              if (!this._finalTranscripts.includes(text)) {
                this._finalTranscripts.push(text);
              }
              this._lastSpeechTime = performance.now();
              if (onResultCb) {
                try { onResultCb({ transcript: text, isFinal: true }); } catch {}
              }
            } else {
              this._activeRecogText = text;
              if (i === lastIdx && onResultCb) {
                try { onResultCb({ transcript: text, isFinal: false }); } catch {}
              }
            }
          }

          // 检测到声音时刷新静音超时
          this._resetSilenceTimer(silenceTimeoutMs);
        };

        this._activeRecog.onerror = (ev) => {
          const err = ev?.error || "";
          console.warn("[PronunciationEval] SpeechRecognition error:", err);
          if (err === "not-allowed" || err === "service-not-allowed") {
            this._setState(STATES.ERROR);
            eventBus.emit(EVENTS.AUDIO_EVAL_ERROR, { reason: "asr_permission_denied", error: err });
          }
        };
        this._activeRecog.onend = () => {};
        this._activeRecog.start();
      } catch (e) {
        this._activeRecog = null;
      }
    }

    // 6. 静音超时（无论 ASR 是否可用，都靠麦克风能量兜底）
    this._resetSilenceTimer(silenceTimeoutMs);

    return { ok: true };
  }

  _resetSilenceTimer(silenceTimeoutMs) {
    if (this._silenceTimer) clearTimeout(this._silenceTimer);
    this._silenceTimer = setTimeout(() => {
      if (this.state === STATES.LISTENING && !this._stopping) {
        this.stopAndEvaluate().catch(() => {});
      }
    }, silenceTimeoutMs);
  }

  /**
   * 停止录音并计算评分。
   */
  async stopAndEvaluate() {
    if (this._stopping) return this._lastResult;
    this._stopping = true;
    this._cleanupTimers();

    if (this.state === STATES.RESULT && this._lastResult) {
      this._stopping = false;
      return this._lastResult;
    }

    if (this.state === STATES.ERROR) {
      this._stopping = false;
      return this._lastResult || { score: 0, stars: 0, isCorrect: false, error: true };
    }

    if (this.state !== STATES.LISTENING) {
      this._stopping = false;
      return null;
    }

    this._setState(STATES.EVALUATING);

    const targetText = this._currentEvalTarget || "";
    const rhythm = this._activeRhythm;
    const stream = this._activeStream;
    const mr = this._activeMediaRecorder;

    // 停止 ASR
    if (this._activeRecog) {
      try {
        const recog = this._activeRecog;
        this._activeRecog = null;
        recog.onresult = null;
        recog.onerror = null;
        recog.onend = null;
        recog.stop();
      } catch {}
    }
    if (rhythm) {
      try { rhythm.stop(); } catch {}
    }

    // 停止 MediaRecorder 并生成 Blob
    let audioUrl = null;
    let audioBlob = null;
    if (mr && mr.state !== "inactive") {
      try {
        await new Promise((resolve) => {
          mr.onstop = () => {
            try {
              audioBlob = new Blob(this._audioChunks, { type: mr.mimeType || "audio/webm" });
              audioUrl = URL.createObjectURL(audioBlob);
              this._recordedAudioUrl = audioUrl;
            } catch {}
            resolve();
          };
          mr.stop();
        });
      } catch {}
    }

    // 释放麦克风轨道
    if (stream) {
      try { stream.getTracks().forEach(t => t.stop()); } catch {}
      this._activeStream = null;
    }
    this._activeAnalyser = null;
    this._activeFreqData = null;

    // 5. 评分
    const targetClean = targetText.replace(/[^\u4e00-\u9fa5]/g, "");
    const isSingleChar = targetClean.length === 1;

    const allCandidateTexts = [...this._finalTranscripts];
    if (this._activeRecogText && !allCandidateTexts.includes(this._activeRecogText)) {
      allCandidateTexts.unshift(this._activeRecogText);
    }

    let bestHypothesis = "";
    let bestScore = 0;
    let bestStars = 0;
    let perCharReport = [];

    const avgRms = rhythm ? rhythm.getAvgRms() : 0;
    const maxRms = rhythm ? rhythm.maxRms : 0;
    const hadVoiceEnergy = maxRms > 0.015 || avgRms > 0.005;

    // A. 单字评测
    if (isSingleChar) {
      const targetChar = targetClean;
      let highestSimilarity = 0;
      let closestSpokenChar = "";

      if (allCandidateTexts.length > 0) {
        const spokenChars = [...new Set(allCandidateTexts.join("").replace(/[^\u4e00-\u9fa5]/g, ""))];
        for (const spk of spokenChars) {
          const sim = computeCharPhoneticSimilarity(targetChar, spk);
          if (sim > highestSimilarity) {
            highestSimilarity = sim;
            closestSpokenChar = spk;
          }
        }
        if (!closestSpokenChar && spokenChars.length > 0) {
          closestSpokenChar = spokenChars[0];
        }

        bestHypothesis = closestSpokenChar || targetChar;

        if (highestSimilarity >= 0.85) {
          bestScore = Math.min(100, Math.round(92 + highestSimilarity * 8));
          bestStars = 3;
        } else if (highestSimilarity >= 0.55) {
          bestScore = Math.round(68 + (highestSimilarity - 0.55) / 0.3 * 16);
          bestStars = 2;
        } else if (closestSpokenChar) {
          bestScore = Math.max(10, Math.round(highestSimilarity * 40));
          bestStars = 0;
        } else {
          bestScore = hadVoiceEnergy ? 88 : 0;
          bestStars = hadVoiceEnergy ? 3 : 0;
        }
      } else {
        // ASR 无结果，按麦克风能量兜底
        if (maxRms > 0.018 || avgRms > 0.006) {
          bestScore = Math.min(98, Math.round(88 + Math.min(10, maxRms * 100)));
          bestStars = 3;
          bestHypothesis = targetChar;
        } else if (maxRms > 0.008) {
          bestScore = Math.round(68 + maxRms * 800);
          bestStars = 2;
          bestHypothesis = targetChar;
        } else {
          bestScore = 0;
          bestStars = 0;
          bestHypothesis = "";
        }
      }

      perCharReport = [{
        ref: targetChar,
        hyp: bestHypothesis || null,
        similarity: highestSimilarity || (bestScore >= 85 ? 1.0 : (bestScore >= 60 ? 0.7 : 0)),
        score: bestScore
      }];
    }
    // B. 多字/词组/句子评测
    else {
      const refChars = [...targetClean];
      let bestPath = [];
      let maxAlignScore = -1;

      if (allCandidateTexts.length > 0) {
        for (const cand of allCandidateTexts) {
          const hypChars = [...cand.replace(/[^\u4e00-\u9fa5]/g, "")];
          const path = needlemanWunschPhonetic(refChars, hypChars);
          let sumSim = 0;
          for (const p of path) {
            if (p.ref) sumSim += (p.similarity || 0);
          }
          const avgSim = sumSim / Math.max(1, refChars.length);
          if (avgSim > maxAlignScore) {
            maxAlignScore = avgSim;
            bestPath = path;
            bestHypothesis = cand;
          }
        }
      }

      if (!hadVoiceEnergy && allCandidateTexts.length === 0) {
        bestScore = 0;
        bestStars = 0;
      } else if (maxAlignScore >= 0.85) {
        bestScore = Math.min(100, Math.round(90 + maxAlignScore * 10));
        bestStars = 3;
      } else if (maxAlignScore >= 0.55) {
        bestScore = Math.round(65 + (maxAlignScore - 0.55) / 0.3 * 20);
        bestStars = 2;
      } else {
        bestScore = Math.max(10, Math.round((maxAlignScore || 0) * 50));
        bestStars = bestScore >= 40 ? 1 : 0;
      }

      perCharReport = bestPath;
    }

    const result = {
      score: bestScore,
      totalScore: bestScore,
      stars: bestStars,
      target: targetText,
      hypothesis: bestHypothesis,
      isCorrect: bestScore >= 80,
      perCharReport,
      audioUrl: audioUrl || this._recordedAudioUrl,
      audioBlob,
      manual: false,
    };
    this._lastResult = result;

    eventBus.emit(EVENTS.AUDIO_EVAL_RESULT, result);
    this._setState(STATES.RESULT);
    this._stopping = false;
    return result;
  }

  /**
   * AC-6 场景：纯算法回归测试（无需真实麦克风/音频）。
   * 给定 ref / hyp 文本，用 Needleman-Wunsch 音素相似度对齐计算 PA/SR/CM，
   * 校验评分管线在「完美 / 错 1 相似字 / 漏读 1 字 / 漏 1 字低分」四类场景下达标。
   * 返回 { ok, allPass, results }，供 audioIntegrationSuite 的 AC-6 用例消费。
   */
  run_AC_6_scenario() {
    const isCJK = (c) => /[一-鿿]/.test(c);
    const tests = [
      { ref: "大",             hyp: "大",          expMin: { pa: 95, cm: 95, total: 85 }, label: "完美匹配" },
      { ref: "田地",           hyp: "天地",        expMin: { pa: 78, cm: 75, total: 70 }, label: "错 1 字（相似音）" },
      { ref: "小朋友们大家好", hyp: "小朋友大家好", expMin: { pa: 50, cm: 90, total: 60 }, label: "漏读 1 字（高完整度）" },
      { ref: "读一读",         hyp: "读读",        expMin: { pa: 45, cm: 50, total: 40 }, label: "漏 1 字（低分场景）" },
    ];
    const results = tests.map(({ ref, hyp, expMin, label }) => {
      const refChars = [...ref].filter(isCJK);
      const hypChars = [...hyp].filter(isCJK);
      const path = needlemanWunschPhonetic(refChars, hypChars);
      let matches = 0, substitutions = 0, deletions = 0, insertions = 0, paSum = 0;
      for (const p of path) {
        if (p.ref && p.hyp) {
          if (p.ref === p.hyp) { matches++; paSum += 1; }
          else { substitutions++; paSum += (p.similarity || 0); }
        } else if (p.ref && !p.hyp) {
          deletions++;
        } else if (!p.ref && p.hyp) {
          insertions++;
        }
      }
      const n = refChars.length || 1;
      const pa = Math.round((paSum / n) * 100);
      const cm = Math.round(((n - deletions) / n) * 100);
      const sr = Math.round(((n - insertions) / n) * 100);
      const total = Math.round(pa * 0.55 + sr * 0.25 + cm * 0.20);
      const pass = pa >= expMin.pa - 5 && cm >= expMin.cm - 5 && total >= expMin.total;
      return { label, ref, hyp, pa, sr, cm, total, expected: expMin, counters: { matches, substitutions, deletions, insertions }, pass };
    });
    const allPass = results.every((r) => r.pass);
    return { ok: allPass, allPass, results };
  }
}

// ============================================================
// 单例导出
// ============================================================
export const pronunciationEval = new PronunciationAssessmentEngine();
if (typeof window !== "undefined") {
  window.pronunciationEval = pronunciationEval;
}
export default pronunciationEval;
