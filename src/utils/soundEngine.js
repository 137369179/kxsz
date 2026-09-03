/**
 *  (Cathy Literacy) - 1:1   +  
 *
 *  ( iHuman Chinese Audio Engine)
 * 1. Source  SubGain (×6)  CategoryGain (BGM/Voice/SFX)  DynamicsCompressor  MasterGain  Destination
 * 2. Voice 5  + tutor(1) > eval(2) > char(3) > word(4) > sentence(5) —  + resumeStack 
 * 3.  3 char_duck(-16.5dB) / tutor_duck(-12dB+SFX) / eval_duck(BGM=0) —  push/pop 
 * 4.  DR Compressor-24dB / 4:1 / knee 30  32 
 * 5.  BGM  Web Audio  9  + 
 * 6.  Spatial Panning 3D 
 * 7.  + onended 
 * 8.  zh-CN-XiaoxiaoNeural  voice-server(8766) ,
 *    (96kbps + ), speechSynthesis
 *
 *   API (soundAndFX.speak / playJellyBoing / playBGM )  100% 
 *
 * 2026-09-01 R3  343 
 *  +  SFX ///
 */

import { EVENTS, eventBus } from "./eventBus.js";
import { neuralVoice } from "./neuralVoice.js";
import { GAME_ICONS } from "./gameIcons.js";
import { rewardThrottle } from "./rewardThrottle.js";

// ============================================================
// 常量定义（消除魔法数字）
// ============================================================
const COIN_FLY_THROTTLE_MS = 800;      // 金币飞行节流（毫秒）
const EST_CHAR_MS_MIN = 160;           // 最小预估字符时长（毫秒）

/** 语音队列项 */
class SpeechQueueItem {
  constructor({ kind, priority, text, opts = {}, utteranceFactory, onEnd = null }) {
    this.kind = kind;                         // tutor | eval | char | word | sentence
    this.priority = priority;                 // 1 (highest) ~ 5 (lowest)
    this.text = text;
    this.opts = opts;
    this.utteranceFactory = utteranceFactory; // () => { cancel, onEndPromise }
    this.onEnd = onEnd;
    this.createdAt = Date.now();
    this.startedAt = 0;
    this.wasInterrupted = false;
    this.resumeOffsetMs = 0;
    this.handle = null;
    this._progressTimer = null;
  }
}

/**
 * 
 * - enqueue  priority  (1 ) 
 * -  resumeStack
 * -  resumeStack unshift 
 */
class PrioritySpeechQueue {
  constructor(onBusChange) {
    this.queue = [];        // 
    this.current = null;    // 
    this.resumeStack = [];  // 
    this.onBusChange = onBusChange || (() => {});
  }

  enqueue(item) {
    this.queue.push(item);
    this.queue.sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt);
    this._maybePreemptOrPlay();
    this.onBusChange("enqueue");
  }

  _maybePreemptOrPlay() {
    if (this.queue.length === 0) return;
    const next = this.queue[0];

    if (!this.current) {
      this._play(next);
      return;
    }

    // /0 
    const isInteractiveClick = next.kind === "char" || next.kind === "word";
    const shouldPreempt = (next.priority < this.current.priority) ||
      (isInteractiveClick && (next.priority <= this.current.priority || this.current.kind === "tutor" || this.current.kind === "sentence"));

    if (shouldPreempt) {
      const low = this.current;
      low.wasInterrupted = true;
      if (low.startedAt) low.resumeOffsetMs = performance.now() - low.startedAt;
      this._cancelCurrent(low);
      //  resumeStack
      if (!isInteractiveClick && low.kind === "tutor") {
        this.resumeStack.push(low);
      }
      eventBus.emit(EVENTS.AUDIO_QUEUE_INTERRUPT, {
        high_priority_kind: next.kind,
        interrupted_kind: low.kind,
      });
      this.onBusChange("preempt");
      this._play(next);
    }
  }

  _play(item) {
    this.current = item;
    this.queue.splice(this.queue.indexOf(item), 1);
    item.startedAt = performance.now();
    item.wasInterrupted = false;

    eventBus.emit(EVENTS.AUDIO_SPEAK_START, {
      kind: item.kind,
      text: item.text,
      emotion: item.opts.emotion || "neutral",
    });
    this.onBusChange(`speak-start:${item.kind}`);

    try {
      const result = item.utteranceFactory(item);
      if (result && typeof result.cancel === "function") {
        item.handle = result;
        if (result.onEndPromise) {
          result.onEndPromise.then(({ interrupted }) => {
            this._finishCurrent(interrupted);
          }).catch((err) => {
            console.warn("[PSQ] onEndPromise rejected:", err);
            this._finishCurrent(false);
          });
        }
      }
    } catch (e) {
      console.warn("[PSQ] play failed", e);
      this._finishCurrent(false);
    }
  }

  _cancelCurrent(item = this.current) {
    if (!item) return;
    if (item.handle && typeof item.handle.cancel === "function") {
      try { item.handle.cancel(); } catch {}
    }
    if (item === this.current) this.current = null;
  }

  _finishCurrent(interrupted) {
    const item = this.current;
    if (!item) return;
    this.current = null;
    eventBus.emit(EVENTS.AUDIO_SPEAK_END, {
      kind: item.kind,
      text: item.text,
      interrupted,
    });
    if (typeof item.onEnd === "function") {
      try { item.onEnd({ interrupted }); } catch {}
    }
    this.onBusChange(`speak-end:${item.kind}`);

    //  ->  resumeStack
    if (interrupted) return;

    //  -> 
    if (this.resumeStack.length > 0) {
      const resume = this.resumeStack.pop();
      eventBus.emit(EVENTS.AUDIO_QUEUE_RESUME, {
        kind: resume.kind,
        resumeOffsetMs: resume.resumeOffsetMs,
      });
      // resume: 
      this.queue.unshift(resume);
      this.queue.sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt);
    }
    this._maybePreemptOrPlay();
  }

  cancelAll() {
    this.queue.length = 0;
    this.resumeStack.length = 0;
    if (this.current) this._cancelCurrent();
  }

  get depth() { return this.queue.length + (this.current ? 1 : 0); }
  get resumeDepth() { return this.resumeStack.length; }
}

/**  push/pop push  ramp */
class DuckStack {
  /**
   * @param {{getAudioCtx: Function, getGainNodes: () => {bgmGain, sfxGain}, getBaseVolume: () => {bgm, sfx}}} deps
   */
  constructor(deps) {
    this.stack = []; // [{name, attackMs, releaseMs, bgmTargetMul, sfxTargetMul}]
    this.deps = deps;
  }

  static POLICIES = {
    char_duck:  { attackMs: 80,  releaseMs: 300, bgmTargetMul: 0.15, sfxTargetMul: 1.0  },
    tutor_duck: { attackMs: 80,  releaseMs: 300, bgmTargetMul: 0.25, sfxTargetMul: 0.60 },
    eval_duck:  { attackMs: 60,  releaseMs: 240, bgmTargetMul: 0.0,  sfxTargetMul: 0.30 },
  };

  _applyEffective() {
    const { getAudioCtx, getGainNodes, getBaseVolume } = this.deps;
    const ctx = getAudioCtx();
    const { bgmGain, sfxGain } = getGainNodes();
    const base = getBaseVolume();
    if (!ctx || !bgmGain) return;

    //  mul ()
    let bgmMul = 1.0, sfxMul = 1.0;
    for (const s of this.stack) {
      bgmMul = Math.min(bgmMul, s.bgmTargetMul);
      sfxMul = Math.min(sfxMul, s.sfxTargetMul);
    }
    const now = ctx.currentTime;
    const attackMs = this.stack.length ? this.stack[this.stack.length - 1].attackMs : 300;
    const releaseMs = this.stack.length ? this.stack[this.stack.length - 1].releaseMs : 300;
    const rampMs = this.stack.length ? attackMs : releaseMs; //  attack,  release
    const ramp = Math.max(0.01, rampMs / 1000);

    try {
      bgmGain.gain.cancelScheduledValues(now);
      bgmGain.gain.setValueAtTime(bgmGain.gain.value, now);
      bgmGain.gain.linearRampToValueAtTime(Math.max(0.0001, base.bgm * bgmMul), now + ramp);
      if (sfxGain) {
        sfxGain.gain.cancelScheduledValues(now);
        sfxGain.gain.setValueAtTime(sfxGain.gain.value, now);
        sfxGain.gain.linearRampToValueAtTime(Math.max(0.0001, base.sfx * sfxMul), now + ramp);
      }
    } catch {}
  }

  push(name) {
    const policy = DuckStack.POLICIES[name] || DuckStack.POLICIES.char_duck;
    // 
    if (this.stack.some(s => s.name === name)) return;
    this.stack.push({ name, ...policy });
    this._applyEffective();
    eventBus.emit(EVENTS.AUDIO_BUS_STATE_CHANGE, { cause: `duck-push:${name}`, snapshot: null });
  }

  pop(name) {
    const idx = this.stack.findIndex(s => s.name === name);
    if (idx > -1) this.stack.splice(idx, 1);
    this._applyEffective();
    eventBus.emit(EVENTS.AUDIO_BUS_STATE_CHANGE, { cause: `duck-pop:${name}`, snapshot: null });
  }

  get depth() { return this.stack.length; }
  get names() { return this.stack.map(s => s.name); }
}

/**  + onended MEM-1  */
class NodeRegistry {
  constructor() {
    this._store = new Map();
    this._idSeq = 1;
    this._counts = Object.create(null);
  }

  register(node, tag = "sfx") {
    if (!node) return null;
    const id = this._idSeq++;
    const meta = { id, tag, createdAt: performance.now(), detached: false };
    this._store.set(id, meta);
    this._counts[tag] = (this._counts[tag] || 0) + 1;
    // onended 
    if (typeof node.onended !== "undefined") {
      node.onended = () => this.detach(id);
    } else if (node.addEventListener) {
      const once = () => { this.detach(id); try { node.removeEventListener("ended", once); } catch {} };
      try { node.addEventListener("ended", once, { once: true }); } catch {}
    }
    return id;
  }

  detach(id) {
    const meta = this._store.get(id);
    if (!meta || meta.detached) return;
    meta.detached = true;
    meta.detachedAt = performance.now();
    this._counts[meta.tag] = Math.max(0, (this._counts[meta.tag] || 1) - 1);
    setTimeout(() => this._store.delete(id), 5000);
  }

  clear() { this._store.clear(); this._counts = Object.create(null); }
  get counts() { return { ...this._counts, _total: this._store.size }; }
  get size() { return this._store.size; }
}

// ============================================================
// 1. 
// ============================================================

class CathyAudioEngine {
  constructor() {
    // ---  ---
    this.audioCtx = null;
    this.compressor = null;
    this.synth = typeof window !== "undefined" ? (window.speechSynthesis || null) : null;

    // --- Node  ---
    this.nodeRegistry = new NodeRegistry();

    // ---  ---
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.voiceGain = null;          //  Category 
    this.voiceCharGain = null;      // priority 3
    this.voiceWordGain = null;      // priority 4
    this.voiceSentenceGain = null;  // priority 5
    this.voiceTutorGain = null;     // priority 1
    this.voiceEvalGain = null;      // priority 2

    // --- BGM  ---
    this.currentBgmType = null;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this._bgmActiveCount = 0;           //  bgmTimer 

    // ---  ---
    this.masterVolume = 1.0;
    this.bgmVolume = 0.45;
    this.sfxVolume = 0.85;
    this.voiceVolume = 1.0;
    this.isMuted = false;
    this.speechRate = 0.85;

    // ---  ( zh-CN-XiaoxiaoNeural,  voice-server:8766 ) ---
    // true: ,  speechSynthesis
    // AC  false  ( audioIntegrationSuite)
    this.neuralVoiceEnabled = true;

    // ---  &  ---
    this.speechQueue = new PrioritySpeechQueue(() => this._emitBusChange("queue"));
    this.duckStack = new DuckStack({
      getAudioCtx: () => this.audioCtx,
      getGainNodes: () => ({ bgmGain: this.bgmGain, sfxGain: this.sfxGain }),
      getBaseVolume: () => ({ bgm: this.bgmVolume, sfx: this.sfxVolume }),
    });

    this._initDone = false;
  }

  /**  ( getter: , audioSafety.save() ) */
  get _audioProfile() {
    return {
      master: this.masterVolume,
      bgm: this.bgmVolume,
      sfx: this.sfxVolume,
      voice: this.voiceVolume,
      muted: this.isMuted,
      speechRate: this.speechRate,
    };
  }

  init() {
    if (this.audioCtx) {
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      return;
    }
    const AudioCtx = (typeof window !== "undefined") && (window.AudioContext || window.webkitAudioContext);
    if (!AudioCtx) return;

    this.audioCtx = new AudioCtx();
    const ctx = this.audioCtx;

    /* 
     * [Osc/BufferSource] ---> [SubGain] ---> [CategoryGain (bgm/voice/sfx)]
     *                                                     |
     *                                                     v
     *                                             DynamicsCompressor
     *                                                     |
     *                                                     v
     *                                                 MasterGain
     *                                                     |
     *                                                     v
     *                                                 Destination
     */

    // 
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, ctx.currentTime);

    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;

    this.compressor.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);

    //  Category Gain -> compressor
    this.bgmGain = ctx.createGain();
    this.bgmGain.gain.setValueAtTime(this.bgmVolume, ctx.currentTime);
    this.bgmGain.connect(this.compressor);

    this.sfxGain = ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, ctx.currentTime);
    this.sfxGain.connect(this.compressor);

    this.voiceGain = ctx.createGain();
    this.voiceGain.gain.setValueAtTime(this.voiceVolume, ctx.currentTime);
    this.voiceGain.connect(this.compressor);

    //  5  -> voiceGain
    const makeVoiceSub = () => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(1.0, ctx.currentTime);
      g.connect(this.voiceGain);
      return g;
    };
    this.voiceTutorGain = makeVoiceSub();     // priority 1 (highest)
    this.voiceEvalGain = makeVoiceSub();      // priority 2
    this.voiceCharGain = makeVoiceSub();      // priority 3
    this.voiceWordGain = makeVoiceSub();      // priority 4
    this.voiceSentenceGain = makeVoiceSub();  // priority 5 (lowest)

    this._initDone = true;
    this._setupVisibilityRecovery();
    this._emitBusChange("init");
  }

  /**  (AudioContext Resiliency) */
  _setupVisibilityRecovery() {
    if (typeof document === "undefined" || typeof document.addEventListener !== "function" || this._visibilityBound) return;
    this._visibilityBound = true;
    const resumeAudio = () => {
      if (this.audioCtx && this.audioCtx.state === "suspended") {
        this.audioCtx.resume().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") resumeAudio();
    });
    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      window.addEventListener("focus", resumeAudio);
      window.addEventListener("pageshow", resumeAudio);

      // 一次性用户手势解锁 Web Audio API（iOS / Safari / Chrome 标配）
      const unlockGesture = () => {
        resumeAudio();
        window.removeEventListener("pointerdown", unlockGesture, true);
        window.removeEventListener("touchstart", unlockGesture, true);
        window.removeEventListener("keydown", unlockGesture, true);
      };
      window.addEventListener("pointerdown", unlockGesture, true);
      window.addEventListener("touchstart", unlockGesture, true);
      window.addEventListener("keydown", unlockGesture, true);
    }
  }

  // /
  initVisibilityListener() {
    if (typeof document === "undefined" || typeof document.addEventListener !== "function") return;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (this.audioCtx && this.audioCtx.state === "running") {
          this.audioCtx.suspend().catch(() => {});
        }
        if (this.synth) this.synth.pause();
      } else {
        if (this.audioCtx && this.audioCtx.state === "suspended") {
          this.audioCtx.resume().catch(() => {});
        }
        if (this.synth) this.synth.resume();
      }
    });
  }

  // ----------------------------------------------------
  // 1.2 speak 
  // ----------------------------------------------------
  _voiceGainForKind(kind) {
    switch (kind) {
      case "tutor": return this.voiceTutorGain;
      case "eval": return this.voiceEvalGain;
      case "char": return this.voiceCharGain;
      case "word": return this.voiceWordGain;
      case "sentence": return this.voiceSentenceGain;
      default: return this.voiceCharGain;
    }
  }

  _priorityForKind(kind) {
    return { tutor: 1, eval: 2, char: 3, word: 4, sentence: 5 }[kind] || 3;
  }

  /**
   *  speak 
   * @param {string} text
   * @param {{kind?:string, emotion?:string, pitchOffset?:number, rateMul?:number, duckStrategy?:string|null, onEnd?:Function, useNeural?:boolean}} opts
   */
  speakPriority(text, opts = {}) {
    if (this.isMuted) {
      if (typeof opts.onEnd === "function") {
        setTimeout(opts.onEnd, 50);
      }
      return;
    }
    this.init();
    const kind = opts.kind || "char";
    const priority = this._priorityForKind(kind);
    const duck = opts.duckStrategy != null ? opts.duckStrategy : ({ tutor: "tutor_duck", eval: "eval_duck", char: "char_duck" })[kind] || null;

    if (duck) this.duckStack.push(duck);

    const pitchBias = opts.pitchOffset || 0;    // Task4 emotion
    const rateMul = opts.rateMul || 1.0;
    const basePitch = 1.35;                      //  sweet spot (speechSynthesis )
    const baseRate = this.speechRate;
    const useNeural = this.neuralVoiceEnabled !== false && opts.useNeural !== false;

    // ----  () ----
    const startProgress = (durationMs) => {
      const chars = [...text];
      if (chars.length === 0) return;
      const total = Math.max(1, durationMs);
      const per = Math.max(10, total / chars.length);
      let idx = 0;
      queueItem._progressTimer = setInterval(() => {
        idx += 1;
        if (idx >= chars.length) {
          if (queueItem._progressTimer) {
            clearInterval(queueItem._progressTimer);
            queueItem._progressTimer = null;
          }
          return;
        }
        eventBus.emit(EVENTS.AUDIO_SPEAK_PROGRESS, {
          char_index: idx,
          char: chars[idx],
          time_ms: Math.round(idx * per),
          total,
        });
      }, per);
    };

    // ---- :  speechSynthesis () ----
    const runLegacySynth = () => {
      if (!this.synth) {
        return {
          cancel() {},
          onEndPromise: Promise.resolve({ interrupted: false }),
        };
      }
      this.synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "zh-CN";

      if (this.synth && typeof this.synth.getVoices === "function") {
        const voices = this.synth.getVoices();
        const zhVoice = voices.find(v => (v.lang === "zh-CN" || v.lang === "zh_CN") && /ting-ting|sin-ji|xiaoxiao|meijia|yaoyao|natural|chinese|google/i.test(v.name))
          || voices.find(v => v.lang === "zh-CN" || v.lang === "zh_CN" || v.lang.startsWith("zh"));
        if (zhVoice) utter.voice = zhVoice;
      }

      utter.rate = Math.max(0.1, Math.min(2.0, baseRate * rateMul));
      utter.pitch = Math.max(0, Math.min(2.0, basePitch + pitchBias));
      utter.volume = 1.0;

      const chars = [...text];
      let boundaryFired = false;

      utter.onstart = () => {
        eventBus.emit(EVENTS.AUDIO_SPEAK_PROGRESS, {
          char_index: 0,
          char: chars[0] || "",
          time_ms: 0,
          total: chars.length
        });
        if (typeof opts.onProgress === "function") {
          opts.onProgress({ char_index: 0, char: chars[0] || "" });
        }
      };

      utter.onboundary = (event) => {
        boundaryFired = true;
        const charIdx = (event.charIndex !== undefined) ? event.charIndex : 0;
        eventBus.emit(EVENTS.AUDIO_SPEAK_PROGRESS, {
          char_index: charIdx,
          char: chars[charIdx] || "",
          elapsed_time_ms: event.elapsedTime || 0,
          total: chars.length
        });
        if (typeof opts.onProgress === "function") {
          opts.onProgress({ char_index: charIdx, char: chars[charIdx] || "" });
        }
      };

      let resolved = false;
      const resolve = (interrupted) => {
        if (resolved) return;
        resolved = true;
        if (queueItem && queueItem._progressTimer) {
          clearInterval(queueItem._progressTimer);
          queueItem._progressTimer = null;
        }
        if (duck) this.duckStack.pop(duck);
      };
      utter.onend = () => resolve(false);
      utter.onerror = () => resolve(false);

      this.synth.speak(utter);

      //  ( onboundary)
      // 最小预估字符时长 160ms
      const estCharMs = Math.max(EST_CHAR_MS_MIN, Math.round(280 / (utter.rate || 1)));
      let idx = 0;
      const total = chars.length * estCharMs;
      queueItem._progressTimer = setInterval(() => {
        if (boundaryFired) return; // onboundary 
        idx += 1;
        if (idx >= chars.length) { clearInterval(queueItem._progressTimer); return; }
        eventBus.emit(EVENTS.AUDIO_SPEAK_PROGRESS, {
          char_index: idx,
          char: chars[idx],
          time_ms: idx * estCharMs,
          total,
        });
        if (typeof opts.onProgress === "function") {
          opts.onProgress({ char_index: idx, char: chars[idx] });
        }
      }, estCharMs);

      return {
        cancel: () => {
          if (queueItem && queueItem._progressTimer) clearInterval(queueItem._progressTimer);
          try { this.synth.cancel(); } catch {}
          resolve(true);
        },
        onEndPromise: new Promise(res => {
          const origOnEnd = utter.onend;
          const origOnErr = utter.onerror;
          utter.onend = (e) => { origOnEnd && origOnEnd(e); res({ interrupted: false }); };
          utter.onerror = (e) => { origOnErr && origOnErr(e); res({ interrupted: false }); };
        }),
      };
    };

    // ----  handle: ,  speechSynthesis ----
    let activeHandle = null;      // neural handle  legacy handle
    let cancelledEarly = false;
    let queueItem = null;         // _play 

    const factory = (qi) => {
      queueItem = qi;
      const onEndPromise = (async () => {
        if (useNeural && this.audioCtx) {
          const isCached = neuralVoice.hasCached(text, opts.emotion || "neutral", pitchBias, rateMul);
          if (isCached) {
            // 0ms  Web Audio 
            try {
              const dest = this._voiceGainForKind(kind);
              const h = await neuralVoice.play({
                text,
                ctx: this.audioCtx,
                dest,
                emotion: opts.emotion || "neutral",
                pitchOffset: pitchBias,
                rateMul,
                volume: 1,
              });
              if (h) {
                if (cancelledEarly) { h.cancel(); return { interrupted: true }; }
                activeHandle = h;
                startProgress(h.durationMs);
                return await h.onEndPromise;
              }
            } catch (e) {
              // 
            }
          } else if (kind === "char" || kind === "word") {
            // /(500~1500ms)0ms  TTS 
            // 
            neuralVoice.prefetch(text, this.audioCtx, opts.emotion || "neutral", pitchBias, rateMul);
            if (cancelledEarly) return { interrupted: true };
            const lh = runLegacySynth();
            activeHandle = lh;
            return await lh.onEndPromise;
          } else {
            // 长句 / 导语（优先 150ms 竞速判定 neural 缓存，未命中优雅降级）
            try {
              if (neuralVoice.available !== false) {
                const dest = this._voiceGainForKind(kind);
                const abortController = typeof AbortController !== "undefined" ? new AbortController() : null;
                const timeoutPromise = new Promise((resolve) => setTimeout(() => {
                  if (abortController) abortController.abort();
                  resolve(null);
                }, 150));
                const neuralPromise = neuralVoice.play({
                  text,
                  ctx: this.audioCtx,
                  dest,
                  emotion: opts.emotion || "neutral",
                  pitchOffset: pitchBias,
                  rateMul,
                  volume: 1,
                  signal: abortController ? abortController.signal : null,
                });
                const h = await Promise.race([neuralPromise, timeoutPromise]);
                if (h) {
                  if (cancelledEarly) { h.cancel(); return { interrupted: true }; }
                  activeHandle = h;
                  startProgress(h.durationMs);
                  return await h.onEndPromise;
                }
              }
            } catch (e) {
              // 
            }
          }
        }
        if (cancelledEarly) return { interrupted: true };
        const lh = runLegacySynth();
        activeHandle = lh;
        return await lh.onEndPromise;
      })();

      const ensureDuckPopped = () => { if (duck) this.duckStack.pop(duck); };

      return {
        cancel: () => {
          cancelledEarly = true;
          if (queueItem?._progressTimer) clearInterval(queueItem._progressTimer);
          if (activeHandle) { try { activeHandle.cancel(); } catch {} }
          ensureDuckPopped();
        },
        onEndPromise: onEndPromise.then((r) => {
          if (queueItem?._progressTimer) clearInterval(queueItem._progressTimer);
          ensureDuckPopped();
          return r;
        }).catch((err) => {
          if (queueItem?._progressTimer) clearInterval(queueItem._progressTimer);
          ensureDuckPopped();
          console.warn("[PSQ] onEndPromise cleanup error:", err);
          return { interrupted: false };
        }),
      };
    };

    this.speechQueue.enqueue(new SpeechQueueItem({
      kind, priority, text, opts,
      utteranceFactory: factory,
      onEnd: (result) => { if (typeof opts.onEnd === "function") opts.onEnd(result); },
    }));
  }

  // ----------------------------------------------------
  // 1.3b  (Scene Emotion Router)
  //  speak(text) :
  //  SSML prosody,  TTS  pitch/rate 
  // ----------------------------------------------------
  static EMOTION_KEYWORDS = [
    //  (: , )
    { emotion: "question",      words: ["", "", "", "", "", "", ""] },
    // / ()
    { emotion: "excited",       words: ["", "", "", "", "", "", "", "", "", ""] },
    { emotion: "encouragement", words: ["", "", "", "", "", "", "", ""] },
    //  ()
    { emotion: "correction",    words: ["", "", "", "", "", "", "", ""] },
    // / ()
    { emotion: "gentle",        words: ["", "", "", "", "", "", ""] },
    // /
    { emotion: "bedtime",       words: ["", "", "", "", "", ""] },
  ];

  /** ;  neutral */
  _detectEmotion(text) {
    if (!text) return "neutral";
    //   
    if (/[?]\s*$/.test(text.trim())) return "question";
    //  +   
    for (const rule of CathyAudioEngine.EMOTION_KEYWORDS) {
      for (const w of rule.words) {
        if (text.includes(w)) return rule.emotion;
      }
    }
    return "neutral";
  }

  // ----------------------------------------------------
  // 1.3  speak()  sentence  ()
  // ----------------------------------------------------
  speak(text, onEnd = null) {
    return this.speakPriority(text, {
      kind: "sentence",
      duckStrategy: "tutor_duck",
      emotion: this._detectEmotion(text),   //  ()
      onEnd: ({ interrupted }) => { if (onEnd && !interrupted) onEnd(); },
    });
  }

  // ----------------------------------------------------
  // 1.4   (backward compat)
  // ----------------------------------------------------
  duckBGM() { this.duckStack.push("tutor_duck"); }
  restoreBGM() { this.duckStack.pop("tutor_duck"); }

  /** 立即停止并清空所有当前及排队的语音播放 */
  stopSpeaking() {
    this.speechQueue.cancelAll();
    try {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch {}
  }


  // ----------------------------------------------------
  // 1.5 
  // ----------------------------------------------------
  _emitBusChange(cause) {
    eventBus.emit(EVENTS.AUDIO_BUS_STATE_CHANGE, {
      cause,
      snapshot: this.getBusSnapshot(),
    });
  }

  getBusSnapshot() {
    const ctx = this.audioCtx;
    const t = ctx ? ctx.currentTime : 0;
    return {
      time: t,
      muted: this.isMuted,
      volumes: {
        master: this.masterVolume,
        bgm: this.bgmVolume,
        sfx: this.sfxVolume,
        voice: this.voiceVolume,
      },
      gains: ctx ? {
        master: this.masterGain?.gain?.value ?? 0,
        bgm: this.bgmGain?.gain?.value ?? 0,
        sfx: this.sfxGain?.gain?.value ?? 0,
        voice: this.voiceGain?.gain?.value ?? 0,
      } : null,
      compressor: this.compressor ? {
        reduction: this.compressor.reduction.value,
        threshold: this.compressor.threshold.value,
      } : null,
      duckStack: this.duckStack.names,
      queueDepth: this.speechQueue.depth,
      resumeDepth: this.speechQueue.resumeDepth,
      nodes: this.nodeRegistry.counts,
      bgmType: this.currentBgmType,
    };
  }

  // ----------------------------------------------------
  // 1.6 AC-1 run_AC_1_scenario()
  // ----------------------------------------------------
  /** @returns {Promise<{interruptOk:boolean, duckOrderOk:boolean, resumeOk:boolean, log:string[]}>} */
  async run_AC_1_scenario() {
    this.init();
    const log = [];
    const push = (m) => { log.push(m); };
    const snap = () => this.getBusSnapshot();

    // 1. BGM learn 
    this.playBGM("learn");
    await new Promise(r => setTimeout(r, 320));
    push(`after bgm start: duck=[${snap().duckStack.join(',')}]`);

    // 
    const MAX_EVENTS = 2000;
    const events = [];
    const pushEvent = (ev) => {
      if (events.length >= MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS + 1);
      events.push(ev);
    };
    const u1 = eventBus.on(EVENTS.AUDIO_QUEUE_INTERRUPT, (e) => pushEvent({ type: "interrupt", e }));
    const u2 = eventBus.on(EVENTS.AUDIO_QUEUE_RESUME, (e) => pushEvent({ type: "resume", e }));
    const u3 = eventBus.on(EVENTS.AUDIO_BUS_STATE_CHANGE, (e) => pushEvent({ type: "bus", cause: e.cause }));

    let wordEnded = false;
    let tutorEnded = false;

    // 2. speakWord (priority 4)
    push("--- enqueue word (p=4) ---");
    this.speakPriority("", {
      kind: "word",
      duckStrategy: "char_duck",
      onEnd: ({ interrupted }) => {
        wordEnded = true;
        push(`word onEnd interrupted=${interrupted}`);
      },
    });
    await new Promise(r => setTimeout(r, 120));
    push(`after word 120ms: duck=[${snap().duckStack.join(',')}] qDepth=${snap().queueDepth}`);

    // 3.  speakTutor (p=1)
    push("--- enqueue tutor (p=1) ---");
    this.speakPriority("", {
      kind: "tutor",
      onEnd: ({ interrupted }) => {
        tutorEnded = true;
        push(`tutor onEnd interrupted=${interrupted}`);
      },
    });
    await new Promise(r => setTimeout(r, 50));
    const interruptOk = events.some(ev => ev.type === "interrupt" && ev.e.interrupted_kind === "word" && ev.e.high_priority_kind === "tutor");
    push(`interrupt detected=${interruptOk}`);

    // tutor  duck  tutor_duck ( char_duck )
    const duckDuringTutor = [...snap().duckStack];
    const duckOrderOk = duckDuringTutor.includes("char_duck") && duckDuringTutor.includes("tutor_duck");
    push(`duck during tutor: [${duckDuringTutor.join(',')}] ok=${duckOrderOk}`);

    // 4. playPop SFX
    this.playPop();
    await new Promise(r => setTimeout(r, 150));

    // 5.  tutor  + word resume
    const t0 = performance.now();
    while (performance.now() - t0 < 6000 && !(tutorEnded && wordEnded)) {
      await new Promise(r => setTimeout(r, 60));
    }
    const resumeOk = events.some(ev => ev.type === "resume" && ev.e.kind === "word");
    push(`resume detected=${resumeOk}  tutorEnded=${tutorEnded}  wordEnded=${wordEnded}`);

    //  BGM duck 
    await new Promise(r => setTimeout(r, 500));
    push(`final duck: [${snap().duckStack.join(',')}]`);

    u1(); u2(); u3();
    this.stopBGM();
    this.speechQueue.cancelAll();

    return { interruptOk, duckOrderOk, resumeOk, log };
  }

  // ----------------------------------------------------
  // 2. BGM  ( + )
  //    9 / bgmAndChant.js (bgmEngine) AC-1 
  // ----------------------------------------------------
  static BGM_SCENES = {
    map:      { bpm: 92,  notes: [523.25, 587.33, 659.25, 783.99], wave: "triangle" },
    learn:    { bpm: 84,  notes: [392.00, 440.00, 523.25, 587.33], wave: "sine"     },
    arcade:   { bpm: 118, notes: [523.25, 659.25, 783.99, 1046.5], wave: "square"  },
    story:    { bpm: 72,  notes: [349.23, 415.30, 523.25, 622.25], wave: "sine"     },
    review:   { bpm: 78,  notes: [440.00, 523.25, 587.33, 698.46], wave: "triangle" },
    battle:   { bpm: 126, notes: [587.33, 698.46, 783.99, 880.00], wave: "sawtooth" },
    victory:  { bpm: 132, notes: [523.25, 659.25, 783.99, 1046.5], wave: "triangle" },
    night:    { bpm: 64,  notes: [329.63, 392.00, 440.00, 523.25], wave: "sine"     },
    home:     { bpm: 88,  notes: [440.00, 493.88, 587.33, 659.25], wave: "triangle" },
  };

  playBGM(type = "map") {
    if (this.currentBgmType === type && this.bgmTimer) return;
    this._switchBGM(type);
  }

  _switchBGM(newType) {
    this.init();
    if (!this.audioCtx) return;
    const oldType = this.currentBgmType;

    //  (600ms )
    if (this.bgmTimer && this.bgmGain) {
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      try {
        this.bgmGain.gain.cancelScheduledValues(now);
        this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
      } catch {}
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
      this._bgmActiveCount = Math.max(0, this._bgmActiveCount - 1);
      eventBus.emit(EVENTS.AUDIO_BGM_CHANGED, { old: oldType, new: newType, transitionMs: 600 });
    }

    this.currentBgmType = newType;
    if (!newType) return;

    //  600ms 
    const scene = CathyAudioEngine.BGM_SCENES[newType] || CathyAudioEngine.BGM_SCENES.map;
    const intervalMs = Math.round(60000 / scene.bpm / 2); // 
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    this._bgmActiveCount += 1;
    this.bgmStep = 0;
    try {
      this.bgmGain.gain.cancelScheduledValues(now);
      this.bgmGain.gain.setValueAtTime(0.0001, now);
      this.bgmGain.gain.linearRampToValueAtTime(this.bgmVolume, now + 0.6);
    } catch {}

    this.bgmTimer = setInterval(() => {
      if (!this.audioCtx || !this.bgmGain) { clearInterval(this.bgmTimer); return; }
      const t = this.audioCtx.currentTime;
      const freq = scene.notes[this.bgmStep % scene.notes.length];
      // :  + 
      const osc = this.audioCtx.createOscillator();
      const g = this.audioCtx.createGain();
      osc.type = scene.wave;
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0, t);
      g.gain.linearRampToValueAtTime(0.06, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
      osc.connect(g);
      g.connect(this.bgmGain);
      this.nodeRegistry.register(osc, "bgm");
      osc.start(t);
      osc.stop(t + 0.36);
      this.bgmStep += 1;
    }, intervalMs);

    eventBus.emit(EVENTS.AUDIO_BGM_CHANGED, { old: oldType, new: newType, transitionMs: 600 });
  }

  stopBGM() {
    this._switchBGM(null);
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.currentBgmType = null;
  }

  /**  BGM  (bgmAndChant/audioSafety ) */
  get activeBgmTimerCount() { return this.bgmTimer ? 1 : 0; }

  // ----------------------------------------------------
  // 3. SFX  sfxGain ( Compressor)
  // ----------------------------------------------------
  _sfxOut() {
    this.init();
    return this.sfxGain || (this.audioCtx && this.audioCtx.destination);
  }

  _tone({ type = "sine", from = 440, to = null, dur = 0.2, vol = 0.25, pan = 0, delay = 0 }) {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, now);
    if (to != null && to !== from) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), now + dur);
    }

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    let lastNode = gain;
    //  (Spatial Panning)
    if (pan !== 0 && ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, pan));
      gain.connect(panner);
      lastNode = panner;
    }

    osc.connect(gain);
    lastNode.connect(this._sfxOut());
    this.nodeRegistry.register(osc, "sfx");

    osc.start(now);
    osc.stop(now + dur + 0.05);
  }

  /**  (: ) */
  playStrokeSound(pan = 0) {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    //  + lowpass 
    const dur = 0.18;
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(2400, now);
    lp.frequency.exponentialRampToValueAtTime(600, now + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    let lastNode = gain;
    if (pan !== 0 && ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, pan));
      gain.connect(panner);
      lastNode = panner;
    }

    src.connect(lp);
    lp.connect(gain);
    lastNode.connect(this._sfxOut());
    this.nodeRegistry.register(src, "stroke");
    src.start(now);
    src.stop(now + dur);
  }

  // ----------------------------------------------------
  // 4. 18  SFX soundEngine 1:1  compressor
  // ----------------------------------------------------

  // 1. Q (Bloop / Boing)
  playJellyBoing() {
    if (!rewardThrottle.allow("jelly")) return;
    this._tone({ type: "sine", from: 300, to: 750, dur: 0.08, vol: 0.3 });
    this._tone({ type: "sine", from: 450, to: 320, dur: 0.14, vol: 0.18, delay: 0.08 });
  }

  // 2. / (Pop)
  playPop() {
    this._tone({ type: "sine", from: 600, to: 1200, dur: 0.08, vol: 0.25 });
  }

  // 谁 (Whoosh/Swoosh)
  playWhoosh() {
    this._tone({ type: "sine", from: 240, to: 880, dur: 0.15, vol: 0.22 });
  }

  // 节奏节拍 / 敲击 (Chant hit)
  playChantHit() {
    this._tone({ type: "triangle", from: 720, to: 240, dur: 0.09, vol: 0.28 });
  }


  // 3. /
  playSunRise() {
    const chord = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
    chord.forEach((freq, idx) => {
      this._tone({ type: "triangle", from: freq, dur: 0.6, vol: 0.18, delay: idx * 0.08 });
    });
  }

  // 4. /
  playWaterDrop() {
    this._tone({ type: "sine", from: 1400, to: 600, dur: 0.2, vol: 0.3 });
  }

  // 5. /
  playFireIgnite() {
    this._tone({ type: "sawtooth", from: 180, to: 400, dur: 0.35, vol: 0.2 });
  }

  // 6.  (Duang)
  playStarEarned(starIndex = 1) {
    if (!rewardThrottle.allow("star")) return;
    const freqs = [523.25, 659.25, 783.99];
    const targetFreq = freqs[Math.min(starIndex - 1, freqs.length - 1)];
    this._tone({ type: "triangle", from: targetFreq * 0.8, to: targetFreq * 1.5, dur: 0.5, vol: 0.35 });
  }

  // 7. 
  playChestOpen() {
    for (let i = 0; i < 6; i++) {
      this._tone({ type: "sine", from: 987.77 + i * 120, dur: 0.25, vol: 0.2, delay: i * 0.06 });
    }
  }

  // 8. /
  playSoftError() {
    this._tone({ type: "sine", from: 280, to: 180, dur: 0.3, vol: 0.2 });
  }

  // 9.  ()
  playVictoryFanfare() {
    const melody = [
      { f: 523.25, t: 0.0, d: 0.15 },
      { f: 523.25, t: 0.15, d: 0.15 },
      { f: 523.25, t: 0.3, d: 0.15 },
      { f: 659.25, t: 0.45, d: 0.35 },
      { f: 587.33, t: 0.8, d: 0.18 },
      { f: 783.99, t: 1.0, d: 0.6 },
    ];
    melody.forEach((note) => {
      this._tone({ type: "triangle", from: note.f, dur: note.d, vol: 0.25, delay: note.t });
    });
  }

  // 10.  ( C5G5)
  playSuccessSound() {
    if (!rewardThrottle.allow("success")) return;
    this._tone({ type: "sine", from: 523.25, dur: 0.12, vol: 0.28 });
    this._tone({ type: "sine", from: 783.99, dur: 0.22, vol: 0.26, delay: 0.1 });
  }

  playSuccess() {
    return this.playSuccessSound();
  }

  // 11.  ()
  playErrorSound() {
    this._tone({ type: "sine", from: 392.0, to: 349.23, dur: 0.28, vol: 0.22 });
  }

  // 12.  ()
  playStarChime() {
    if (!rewardThrottle.allow("star")) return;
    this._tone({ type: "sine", from: 1567.98, dur: 0.3, vol: 0.18 });
    this._tone({ type: "sine", from: 2093.0, dur: 0.4, vol: 0.12, delay: 0.06 });
  }

  // 13.  ()
  playCardFlip() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const dur = 0.1;
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.5);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1800;
    bp.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(bp); bp.connect(gain); gain.connect(this._sfxOut());
    this.nodeRegistry.register(src, "sfx");
    src.start(now); src.stop(now + dur);
  }

  // 13.5 / ()
  playLaserShoot() {
    this._tone({ type: "sawtooth", from: 1200, to: 200, dur: 0.12, vol: 0.2 });
    this._tone({ type: "sine", from: 800, to: 150, dur: 0.08, vol: 0.15 });
  }

  // 14.  ()
  playAttackHit() {
    this._tone({ type: "square", from: 220, to: 80, dur: 0.15, vol: 0.22 });
    this._tone({ type: "triangle", from: 660, to: 330, dur: 0.1, vol: 0.15 });
  }

  // 15.  (C-E-G)
  playEncouragement() {
    [523.25, 659.25, 783.99].forEach((f, i) => {
      this._tone({ type: "sine", from: f, dur: 0.35, vol: 0.18, delay: i * 0.09 });
    });
  }

  // 16. 连击阶梯琶音
  playCombo(combo = 1) {
    const base = 523.25 * Math.pow(1.08, Math.min(combo, 12));
    [0, 1, 2, 3].forEach((i) => {
      this._tone({ type: "triangle", from: base * (1 + i * 0.25), dur: 0.12, vol: 0.22, delay: i * 0.04 });
    });
  }

  // 16.5 连击高光大星芒 (Ascending Musical Star Burst)
  playStarPopCombo(combo = 1) {
    if (!rewardThrottle.allow("star")) return;
    const baseFreq = 659.25 * Math.pow(1.1, Math.min(combo, 10)); // E5 起始
    const chord = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2.0];
    chord.forEach((f, idx) => {
      this._tone({ type: "sine", from: f, to: f * 1.05, dur: 0.25, vol: 0.2, delay: idx * 0.05 });
    });
  }

  // 16.6 皇家金冠加冕号角 (Royal Crown Fanfare)
  playCrownFanfare() {
    // 经典明亮皇室号角和弦: C5 -> E5 -> G5 -> C6 大三和弦琶音
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      this._tone({ type: "triangle", from: f, dur: 0.45, vol: 0.25, delay: i * 0.08 });
      this._tone({ type: "sine", from: f * 2, dur: 0.25, vol: 0.12, delay: i * 0.08 });
    });
    // 结尾辉煌双音长鸣
    setTimeout(() => {
      this._tone({ type: "triangle", from: 1046.5, dur: 0.8, vol: 0.3 });
      this._tone({ type: "sine", from: 1318.5, dur: 0.8, vol: 0.22 });
    }, 360);
  }

  // 16.7 Boss 巨兽重击与咆哮 (Boss Impact & Roar)
  playBossImpact() {
    this._tone({ type: "sawtooth", from: 160, to: 40, dur: 0.35, vol: 0.35 });
    this._tone({ type: "square", from: 240, to: 60, dur: 0.25, vol: 0.28 });
    this._tone({ type: "triangle", from: 80, to: 30, dur: 0.5, vol: 0.4, delay: 0.05 });
  }

  playBossRoar() {
    this._tone({ type: "sawtooth", from: 90, to: 45, dur: 0.7, vol: 0.3 });
    this._tone({ type: "square", from: 120, to: 55, dur: 0.6, vol: 0.25, delay: 0.1 });
  }

  // 16.8 亲子欢呼与鼓励鼓掌 (Parent Cheer & Victory)
  playParentCheer() {
    // 明亮温馨欢庆大和弦
    const chords = [523.25, 659.25, 783.99, 987.77, 1046.5];
    chords.forEach((freq, idx) => {
      this._tone({ type: "sine", from: freq, dur: 0.6, vol: 0.22, delay: idx * 0.06 });
    });
    // 掌声轻快节奏模拟 (高频白噪节拍)
    [0.2, 0.32, 0.42, 0.52, 0.62, 0.72].forEach((del) => {
      this._tone({ type: "triangle", from: 1200 + Math.random() * 400, to: 600, dur: 0.06, vol: 0.12, delay: del });
    });
  }

  // 16.9 亲子录音提示倒计时晶体音 (Family Record Chime)
  playFamilyRecordChime(isStart = false) {
    if (isStart) {
      this._tone({ type: "sine", from: 880, to: 1760, dur: 0.3, vol: 0.25 });
    } else {
      this._tone({ type: "sine", from: 880, dur: 0.12, vol: 0.2 });
    }
  }

  // 17. 星币叮当声 (Coin Clink)
  playCoinClink() {
    this._tone({ type: "sine", from: 1318.5, dur: 0.15, vol: 0.2 });
    this._tone({ type: "sine", from: 1975.5, dur: 0.25, vol: 0.15, delay: 0.05 });
  }

  // 18.  (Canvas Confetti)
  triggerConfetti(container) {
    if (!rewardThrottle.allow("confetti")) return;
    if (typeof document === "undefined" || !container || typeof container.appendChild !== "function") return;
    const canvas = document.createElement("canvas");
    if (!canvas || typeof canvas.getContext !== "function") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.className = "fixed inset-0 pointer-events-none z-50 w-full h-full";
    container.appendChild(canvas);

    canvas.width = (typeof window !== "undefined" && window.innerWidth) || 800;
    canvas.height = (typeof window !== "undefined" && window.innerHeight) || 600;

    const particles = [];
    const colors = ["#FF5722", "#FFC107", "#4CAF50", "#00BCD4", "#E91E63", "#9C27B0", "#FFEB3B"];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() * 200 - 100),
        y: canvas.height / 2 + (Math.random() * 100 - 50),
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 18,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
        gravity: 0.45,
        alpha: 1,
      });
    }

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.vr;
        p.alpha -= 0.012;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (frame < 90) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    };
    requestAnimationFrame(animate);
  }

  // ----------------------------------------------------
  // 5.  /  / 
  // ----------------------------------------------------
  /** setXxxVolume helpers — unified implementation via _setChannelVol */
  setMasterVolume(val) { this._setChannelVol("master", val); }
  setBGMVolume(val)    { this._setChannelVol("bgm",    val); }
  setSFXVolume(val)    { this._setChannelVol("sfx",    val); }
  setVoiceVolume(val)  { this._setChannelVol("voice",  val); }

  _setChannelVol(channel, val) {
    const clamped = Math.max(0, Math.min(1, val));
    const gainMap = { master: "masterGain", bgm: "bgmGain", sfx: "sfxGain", voice: "voiceGain" };
    const propMap = { master: "masterVolume", bgm: "bgmVolume", sfx: "sfxVolume", voice: "voiceVolume" };
    const ducked  = ["bgm", "sfx"].includes(channel) && this.duckStack.depth > 0;
    this[propMap[channel]] = clamped;
    const gainNode = this[gainMap[channel]];
    if (gainNode && this.audioCtx && !ducked) {
      const effective = channel === "master" && this.isMuted ? 0 : clamped;
      gainNode.gain.setValueAtTime(effective, this.audioCtx.currentTime);
    }
    eventBus.emit(EVENTS.AUDIO_VOLUME_CHANGED, { channel, value: clamped, profile: this._audioProfile });
  }
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.audioCtx.currentTime);
    }
    if (this.isMuted && this.synth) this.synth.cancel();
    eventBus.emit(EVENTS.SOUND_TOGGLE_MUTE, { muted: this.isMuted });
    return this.isMuted;
  }

  // ----------------------------------------------------
  // 6.  ()
  // ----------------------------------------------------
  /**  ( speechSynthesis) */
  setNeuralVoice(on) {
    this.neuralVoiceEnabled = !!on;
    return this.neuralVoiceEnabled;
  }
  /**  (/) */
  async getVoiceStatus() {
    const neuralOk = await neuralVoice.probe();
    return {
      neural: {
        enabled: this.neuralVoiceEnabled,
        available: neuralOk,
        voice: neuralVoice.voice,
        stats: { ...neuralVoice.stats },
      },
      legacy: { synth: !!this.synth },
      mode: this.neuralVoiceEnabled && neuralOk ? "neural" : "speechSynthesis",
    };
  }

  // ----------------------------------------------------
  // 7.  ()
  // ----------------------------------------------------
  triggerCoinFly(container, startX = null, startY = null, count = 3) {
    if (typeof window === "undefined" || !document.body) return;

    // 调研报告 §4 建议B：节流与视觉降噪，COIN_FLY_THROTTLE_MS 窗口内防止音画多重叠加过载
    const now = Date.now();
    if (this._lastCoinFlyTime && now - this._lastCoinFlyTime < COIN_FLY_THROTTLE_MS) {
      this.playCoinClink();
      return;
    }
    this._lastCoinFlyTime = now;

    // 支持 triggerCoinFly(finishBtn, 5) 形式重载
    if (typeof startX === "number" && startY === null) {
      count = startX;
      startX = null;
    }

    let sx = (startX !== null && startX !== undefined) ? startX : null;
    let sy = (startY !== null && startY !== undefined) ? startY : null;

    if ((sx === null || sy === null) && container && typeof container.getBoundingClientRect === "function") {
      try {
        const rect = container.getBoundingClientRect();
        if (rect && rect.width > 0 && rect.height > 0) {
          sx = rect.left + rect.width / 2;
          sy = rect.top + rect.height / 2;
        }
      } catch {}
    }

    if (sx === null || sx === undefined) sx = window.innerWidth / 2;
    if (sy === null || sy === undefined) sy = window.innerHeight / 2;
    this.playCoinClink();

    for (let i = 0; i < count; i++) {
      const coin = document.createElement("div");
      coin.className = "fixed pointer-events-none z-[9999] transition-all duration-700 ease-out";
      coin.style.left = `${sx}px`;
      coin.style.top = `${sy}px`;
      coin.style.width = "32px";
      coin.style.height = "32px";
      coin.innerHTML = (window.GAME_ICONS || GAME_ICONS)
        ? (window.GAME_ICONS || GAME_ICONS).coin("w-full h-full drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]")
        : '<div class="w-full h-full rounded-full bg-gradient-to-tr from-yellow-300 via-amber-400 to-orange-500 border-2 border-white shadow-xl"></div>';
      document.body.appendChild(coin);

      const burstX = (Math.random() - 0.5) * 200;
      const burstY = -90 - Math.random() * 100;
      const rot = Math.random() * 720 - 360;

      const raf = (typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : (typeof window !== "undefined" && window.requestAnimationFrame) ? window.requestAnimationFrame : (cb) => setTimeout(cb, 16));
      raf(() => {
        coin.style.transform = `translate(${burstX}px, ${burstY}px) scale(1.3) rotate(${rot}deg)`;

        setTimeout(() => {
          coin.style.transition = "all 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
          coin.style.left = `${window.innerWidth - 110}px`;
          coin.style.top = "20px";
          coin.style.transform = "scale(0.5) rotate(0deg)";
          coin.style.opacity = "0.8";

          setTimeout(() => {
            this.playCoinClink();
            try { coin.remove(); } catch {}
          }, 650);
        }, 220 + i * 45);
      });
    }
  }
}

// ============================================================
// 
// ============================================================
export const soundAndFX = new CathyAudioEngine();
export const soundEngine = soundAndFX;
export default soundAndFX;

// 
if (typeof window !== "undefined") {
  window.__soundEngine = soundAndFX;
}
