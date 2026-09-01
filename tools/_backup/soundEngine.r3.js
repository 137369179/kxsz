/**
 * 凯茜识字 (Cathy Literacy) - 1:1 洪恩识字级 多轨混音优先级队列 + 栈式闪避 音频引擎系统
 *
 * 机制级架构 (对标 iHuman Chinese Audio Engine)：
 * 1. 【六级总线管线】Source → SubGain (×6) → CategoryGain (BGM/Voice/SFX) → DynamicsCompressor → MasterGain → Destination
 * 2. 【Voice 5 子通道 + 优先级队列】tutor(1) > eval(2) > char(3) > word(4) > sentence(5) — 高优打断低优 + resumeStack 弹栈恢复
 * 3. 【智能音频闪避 3 策略栈】char_duck(-16.5dB) / tutor_duck(-12dB+SFX) / eval_duck(BGM=0) — 栈式 push/pop 无痕恢复
 * 4. 【全局 DR Compressor】-24dB / 4:1 / knee 30 防 32 路并发削波
 * 5. 【程序化生成 BGM 引擎】纯 Web Audio 实时合成五声童趣马林巴 9 场景 + 交叉淡入淡出
 * 6. 【立体声声像 Spatial Panning】笔顺滑行左右声道 3D 渲染
 * 7. 【高并发复音池】瞬时连击不吞音，节点注册 + onended 自动回收
 * 8. 【神经童声引擎】晓依 zh-CN-XiaoyiNeural 经本地 voice-server(8766) 代理,
 *    优先神经合成(96kbps + 子句并行),失败自动降级 speechSynthesis
 *
 * ⚠️ 向后兼容：所有旧 API (soundAndFX.speak / playJellyBoing / playBGM 等) 行为 100% 不变
 *
 * 2026-09-01 R3 重建说明：本文件曾被外部操作回退为 343 行原始版，
 * 本版本基于会话内架构记忆 + 原始 SFX 实现完整重建（六级总线/优先级队列/闪避栈/神经集成）。
 */

import { EVENTS, eventBus } from "./eventBus.js";
import { neuralVoice } from "./neuralVoice.js";

// ============================================================
// 0. 内部工具类：优先级队列、栈式闪避调度、节点注册表
// ============================================================

/** 优先级语音队列项 */
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
 * 优先级语音队列：
 * - enqueue 后按 priority 升序 (1 最高) 排队
 * - 高优先级可打断低优先级；被打断者进 resumeStack
 * - 当前项结束后从 resumeStack 弹出恢复（unshift 到队首）
 */
class PrioritySpeechQueue {
  constructor(onBusChange) {
    this.queue = [];        // 待播放
    this.current = null;    // 播放中
    this.resumeStack = [];  // 被打断待恢复
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

    // 高优打断低优
    if (next.priority < this.current.priority) {
      const low = this.current;
      low.wasInterrupted = true;
      // 计算 resume 偏移
      if (low.startedAt) low.resumeOffsetMs = performance.now() - low.startedAt;
      this._cancelCurrent(low);
      this.resumeStack.push(low);
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

    // 被打断 -> 不走 resumeStack（已在打断时入栈）
    if (interrupted) return;

    // 正常结束 -> 弹栈恢复
    if (this.resumeStack.length > 0) {
      const resume = this.resumeStack.pop();
      eventBus.emit(EVENTS.AUDIO_QUEUE_RESUME, {
        kind: resume.kind,
        resumeOffsetMs: resume.resumeOffsetMs,
      });
      // resume: 重新入队，优先级不变
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

/** 栈式闪避调度器：多策略 push/pop，重复 push 不重复 ramp，弹栈后恢复 */
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

    // 栈顶策略生效：多策略取每个通道最激进的 mul (最小值)
    let bgmMul = 1.0, sfxMul = 1.0;
    for (const s of this.stack) {
      bgmMul = Math.min(bgmMul, s.bgmTargetMul);
      sfxMul = Math.min(sfxMul, s.sfxTargetMul);
    }
    const now = ctx.currentTime;
    const attackMs = this.stack.length ? this.stack[this.stack.length - 1].attackMs : 300;
    const releaseMs = this.stack.length ? this.stack[this.stack.length - 1].releaseMs : 300;
    const rampMs = this.stack.length ? attackMs : releaseMs; // 入栈用 attack, 弹空用 release
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
    // 重复策略不重复压栈（嵌套时外层不重复调度）
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

/** 节点注册表：复音池计数 + onended 自动回收（MEM-1 泄漏扫描数据源） */
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
    // onended 自动回收
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
// 1. 主引擎类
// ============================================================

class CathyAudioEngine {
  constructor() {
    // --- 基础 ---
    this.audioCtx = null;
    this.compressor = null;
    this.synth = typeof window !== "undefined" ? (window.speechSynthesis || null) : null;

    // --- Node 注册 ---
    this.nodeRegistry = new NodeRegistry();

    // --- 总线增益节点 ---
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.voiceGain = null;          // 语音 Category 节点
    this.voiceCharGain = null;      // priority 3
    this.voiceWordGain = null;      // priority 4
    this.voiceSentenceGain = null;  // priority 5
    this.voiceTutorGain = null;     // priority 1
    this.voiceEvalGain = null;      // priority 2

    // --- BGM 状态机 ---
    this.currentBgmType = null;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this._bgmActiveCount = 0;           // 用于 bgmTimer 计数检查

    // --- 音量与静音设置 ---
    this.masterVolume = 1.0;
    this.bgmVolume = 0.45;
    this.sfxVolume = 0.85;
    this.voiceVolume = 1.0;
    this.isMuted = false;
    this.speechRate = 0.85;

    // --- 神经童声 (晓依 zh-CN-XiaoyiNeural, 经 voice-server:8766 代理) ---
    // true: 优先神经童声, 不可用自动降级 speechSynthesis
    // AC 验收场景会临时置 false 以保证时序稳定 (见 audioIntegrationSuite)
    this.neuralVoiceEnabled = true;

    // --- 优先级队列 & 栈式闪避 ---
    this.speechQueue = new PrioritySpeechQueue(() => this._emitBusChange("queue"));
    this.duckStack = new DuckStack({
      getAudioCtx: () => this.audioCtx,
      getGainNodes: () => ({ bgmGain: this.bgmGain, sfxGain: this.sfxGain }),
      getBaseVolume: () => ({ bgm: this.bgmVolume, sfx: this.sfxVolume }),
    });

    this._initDone = false;
  }

  /** 音量档案 (动态 getter: 永远反映当前音量状态, audioSafety.save() 持久化用) */
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

    /* 六级管线拓扑：
     * [Osc/BufferSource等] ---> [SubGain] ---> [CategoryGain (bgm/voice/sfx)]
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

    // 最后两级
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

    // 三类 Category Gain -> compressor
    this.bgmGain = ctx.createGain();
    this.bgmGain.gain.setValueAtTime(this.bgmVolume, ctx.currentTime);
    this.bgmGain.connect(this.compressor);

    this.sfxGain = ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, ctx.currentTime);
    this.sfxGain.connect(this.compressor);

    this.voiceGain = ctx.createGain();
    this.voiceGain.gain.setValueAtTime(this.voiceVolume, ctx.currentTime);
    this.voiceGain.connect(this.compressor);

    // 语音 5 子通道 -> voiceGain
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
    this._emitBusChange("init");
  }

  // 页面前台/后台自动静音
  initVisibilityListener() {
    if (typeof document === "undefined") return;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (this.audioCtx && this.audioCtx.state === "running") {
          this.audioCtx.suspend();
        }
        if (this.synth) this.synth.pause();
      } else {
        if (this.audioCtx && this.audioCtx.state === "suspended") {
          this.audioCtx.resume();
        }
        if (this.synth) this.synth.resume();
      }
    });
  }

  // ----------------------------------------------------
  // 1.2 优先级队列：speak 核心封装
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
   * 通用优先级 speak 入口。
   * @param {string} text
   * @param {{kind?:string, emotion?:string, pitchOffset?:number, rateMul?:number, duckStrategy?:string|null, onEnd?:Function, useNeural?:boolean}} opts
   */
  speakPriority(text, opts = {}) {
    if (this.isMuted) return;
    this.init();
    const kind = opts.kind || "char";
    const priority = this._priorityForKind(kind);
    const duck = opts.duckStrategy != null ? opts.duckStrategy : ({ tutor: "tutor_duck", eval: "eval_duck", char: "char_duck" })[kind] || null;

    if (duck) this.duckStack.push(duck);

    const pitchBias = opts.pitchOffset || 0;    // Task4 emotion
    const rateMul = opts.rateMul || 1.0;
    const basePitch = 1.35;                      // 洪恩童声 sweet spot (speechSynthesis 降级路径)
    const baseRate = this.speechRate;
    const useNeural = this.neuralVoiceEnabled !== false && opts.useNeural !== false;

    // ---- 进度事件 (真实时长版) ----
    const startProgress = (durationMs) => {
      const chars = [...text];
      const total = Math.max(1, durationMs);
      const per = total / chars.length;
      let idx = 0;
      queueItem._progressTimer = setInterval(() => {
        idx += 1;
        if (idx >= chars.length) { clearInterval(queueItem._progressTimer); return; }
        eventBus.emit(EVENTS.AUDIO_SPEAK_PROGRESS, {
          char_index: idx,
          char: chars[idx],
          time_ms: Math.round(idx * per),
          total,
        });
      }, per);
    };

    // ---- 降级路径: 系统 speechSynthesis ----
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

      let resolved = false;
      const resolve = (interrupted) => {
        if (resolved) return;
        resolved = true;
        if (duck) this.duckStack.pop(duck);
      };
      utter.onend = () => resolve(false);
      utter.onerror = () => resolve(false);

      this.synth.speak(utter);

      // 进度事件：按字符粗略估计进度
      const chars = [...text];
      const estCharMs = Math.max(120, 300 * utter.rate / baseRate);
      let idx = 0;
      const total = chars.length * estCharMs;
      queueItem._progressTimer = setInterval(() => {
        idx += 1;
        if (idx >= chars.length) { clearInterval(queueItem._progressTimer); return; }
        eventBus.emit(EVENTS.AUDIO_SPEAK_PROGRESS, {
          char_index: idx,
          char: chars[idx],
          time_ms: idx * estCharMs,
          total,
        });
      }, estCharMs);

      return {
        cancel: () => {
          clearInterval(queueItem._progressTimer);
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

    // ---- 惰性 handle: 先试神经童声, 失败降级 speechSynthesis ----
    let activeHandle = null;      // neural handle 或 legacy handle
    let cancelledEarly = false;
    let queueItem = null;         // _play 注入

    const factory = (qi) => {
      queueItem = qi;
      const onEndPromise = (async () => {
        if (useNeural && this.audioCtx) {
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
            // neural 不可用 → 降级
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
          clearInterval(queueItem._progressTimer);
          if (activeHandle) { try { activeHandle.cancel(); } catch {} }
          ensureDuckPopped();
        },
        onEndPromise: onEndPromise.then((r) => {
          clearInterval(queueItem._progressTimer);
          ensureDuckPopped();
          return r;
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
  // 1.3b 智能情绪路由 (Scene Emotion Router)
  // 旧 speak(text) 调用零改动即获得场景化情绪韵律:
  // 神经童声把情绪映射为 SSML prosody, 系统 TTS 映射为 pitch/rate 偏移
  // ----------------------------------------------------
  static EMOTION_KEYWORDS = [
    // 提问引导 (最优先: 问句语境中的奖励词多为干扰, 提问特征词优先命中)
    { emotion: "question",      words: ["哪一个", "找一找", "想一想", "你知道吗", "猜猜", "哪个是", "请找出"] },
    // 奖励/通关 (教学正反馈核心)
    { emotion: "excited",       words: ["太棒啦", "太棒了", "真棒", "厉害", "好厉害", "通关", "成功", "全对", "满分", "冠军"] },
    { emotion: "encouragement", words: ["做得好", "答对了", "对了", "正确", "好样的", "真聪明", "继续保持", "进步"] },
    // 纠错引导 (温柔不挫败)
    { emotion: "correction",    words: ["再试一次", "再试试", "没关系", "别灰心", "不对哦", "错了", "差一点", "加油"] },
    // 书写/描红 (沉稳耐心)
    { emotion: "gentle",        words: ["毛笔", "笔顺", "描红", "书写", "写字", "按照笔顺", "一笔"] },
    // 故事/睡前
    { emotion: "bedtime",       words: ["故事", "睡前", "晚安", "从前", "很久以前", "休息"] },
  ];

  /** 根据文本关键词推断教学情绪; 无命中返回 neutral */
  _detectEmotion(text) {
    if (!text) return "neutral";
    // 问号结尾 → 提问语气
    if (/[?？]\s*$/.test(text.trim())) return "question";
    // 感叹号 + 奖励词 → 更兴奋
    for (const rule of CathyAudioEngine.EMOTION_KEYWORDS) {
      for (const w of rule.words) {
        if (text.includes(w)) return rule.emotion;
      }
    }
    return "neutral";
  }

  // ----------------------------------------------------
  // 1.3 向后兼容：旧 speak() 映射为 sentence 通道 (自动带情绪)
  // ----------------------------------------------------
  speak(text, onEnd = null) {
    return this.speakPriority(text, {
      kind: "sentence",
      duckStrategy: "tutor_duck",
      emotion: this._detectEmotion(text),   // 智能情绪路由 (优化后新设计声音默认路径)
      onEnd: ({ interrupted }) => { if (onEnd && !interrupted) onEnd(); },
    });
  }

  // ----------------------------------------------------
  // 1.4 旧 闪避接口 (backward compat)
  // ----------------------------------------------------
  duckBGM() { this.duckStack.push("tutor_duck"); }
  restoreBGM() { this.duckStack.pop("tutor_duck"); }

  // ----------------------------------------------------
  // 1.5 总线事件
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
  // 1.6 AC-1 自测场景：run_AC_1_scenario()
  // ----------------------------------------------------
  /** @returns {Promise<{interruptOk:boolean, duckOrderOk:boolean, resumeOk:boolean, log:string[]}>} */
  async run_AC_1_scenario() {
    this.init();
    const log = [];
    const push = (m) => { log.push(m); };
    const snap = () => this.getBusSnapshot();

    // 1. BGM learn 场景启动
    this.playBGM("learn");
    await new Promise(r => setTimeout(r, 320));
    push(`after bgm start: duck=[${snap().duckStack.join(',')}]`);

    // 事件采集
    const events = [];
    const u1 = eventBus.on(EVENTS.AUDIO_QUEUE_INTERRUPT, (e) => events.push({ type: "interrupt", e }));
    const u2 = eventBus.on(EVENTS.AUDIO_QUEUE_RESUME, (e) => events.push({ type: "resume", e }));
    const u3 = eventBus.on(EVENTS.AUDIO_BUS_STATE_CHANGE, (e) => events.push({ type: "bus", cause: e.cause }));

    let wordEnded = false;
    let tutorEnded = false;

    // 2. speakWord (priority 4)
    push("--- enqueue word (p=4) ---");
    this.speakPriority("这是一个词组示例", {
      kind: "word",
      duckStrategy: "char_duck",
      onEnd: ({ interrupted }) => {
        wordEnded = true;
        push(`word onEnd interrupted=${interrupted}`);
      },
    });
    await new Promise(r => setTimeout(r, 120));
    push(`after word 120ms: duck=[${snap().duckStack.join(',')}] qDepth=${snap().queueDepth}`);

    // 3. 立即 speakTutor (p=1)
    push("--- enqueue tutor (p=1) ---");
    this.speakPriority("小朋友们好", {
      kind: "tutor",
      onEnd: ({ interrupted }) => {
        tutorEnded = true;
        push(`tutor onEnd interrupted=${interrupted}`);
      },
    });
    await new Promise(r => setTimeout(r, 50));
    const interruptOk = events.some(ev => ev.type === "interrupt" && ev.e.interrupted_kind === "word" && ev.e.high_priority_kind === "tutor");
    push(`interrupt detected=${interruptOk}`);

    // tutor 期间 duck 应该包含 tutor_duck (在 char_duck 之上)
    const duckDuringTutor = [...snap().duckStack];
    const duckOrderOk = duckDuringTutor.includes("char_duck") && duckDuringTutor.includes("tutor_duck");
    push(`duck during tutor: [${duckDuringTutor.join(',')}] ok=${duckOrderOk}`);

    // 4. playPop SFX
    this.playPop();
    await new Promise(r => setTimeout(r, 150));

    // 5. 等待 tutor 结束 + word resume
    const t0 = performance.now();
    while (performance.now() - t0 < 6000 && !(tutorEnded && wordEnded)) {
      await new Promise(r => setTimeout(r, 60));
    }
    const resumeOk = events.some(ev => ev.type === "resume" && ev.e.kind === "word");
    push(`resume detected=${resumeOk}  tutorEnded=${tutorEnded}  wordEnded=${wordEnded}`);

    // 恢复 BGM duck 应都为空
    await new Promise(r => setTimeout(r, 500));
    push(`final duck: [${snap().duckStack.join(',')}]`);

    u1(); u2(); u3();
    this.stopBGM();
    this.speechQueue.cancelAll();

    return { interruptOk, duckOrderOk, resumeOk, log };
  }

  // ----------------------------------------------------
  // 2. BGM 引擎 (程序化五声童趣马林巴 + 交叉淡入淡出)
  //    注：9 场景完整版/压测在 bgmAndChant.js (bgmEngine)，此处为基础版供 AC-1 与主应用使用
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

    // 交叉淡出旧场景 (600ms 指数衰减)
    if (this.bgmTimer && this.bgmGain) {
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      try {
        this.bgmGain.gain.cancelScheduledValues(now);
        this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
        this.bgmGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
      } catch {}
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
      this._bgmActiveCount = Math.max(0, this._bgmActiveCount - 1);
      eventBus.emit(EVENTS.AUDIO_BGM_CHANGED, { old: oldType, new: newType, transitionMs: 600 });
    }

    this.currentBgmType = newType;
    if (!newType) return;

    // 新场景 600ms 淡入
    const scene = CathyAudioEngine.BGM_SCENES[newType] || CathyAudioEngine.BGM_SCENES.map;
    const intervalMs = Math.round(60000 / scene.bpm / 2); // 八分音符
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
      if (!this.audioCtx || !this.bgmGain) { clearTimeout(this.bgmTimer); return; }
      const t = this.audioCtx.currentTime;
      const freq = scene.notes[this.bgmStep % scene.notes.length];
      // 五声童趣马林巴: 短促衰减正弦 + 高八度泛音
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
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.currentBgmType = null;
  }

  /** 当前活跃 BGM 定时器计数 (bgmAndChant/audioSafety 泄漏检查用) */
  get activeBgmTimerCount() { return this.bgmTimer ? 1 : 0; }

  // ----------------------------------------------------
  // 3. SFX 工具基座：输出统一路由 sfxGain (经 Compressor)
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
    // 立体声声像 (Spatial Panning)
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

  /** 毛笔宣纸笔顺音 (空间声像: 笔顺滑行左右声道) */
  playStrokeSound(pan = 0) {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // 短噪声突发模拟宣纸摩擦 + lowpass 扫频
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
  // 4. 18 项 SFX（与原 soundEngine 1:1 完全一致，仅输出路由通过新总线 compressor）
  // ----------------------------------------------------

  // 1. Q弹果冻触碰音效 (Bloop / Boing)
  playJellyBoing() {
    this._tone({ type: "sine", from: 300, to: 750, dur: 0.08, vol: 0.3 });
    this._tone({ type: "sine", from: 450, to: 320, dur: 0.14, vol: 0.18, delay: 0.08 });
  }

  // 2. 泡泡点击/按键音效 (Pop)
  playPop() {
    this._tone({ type: "sine", from: 600, to: 1200, dur: 0.08, vol: 0.25 });
  }

  // 3. 升日/破晓旭日光芒音效
  playSunRise() {
    const chord = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
    chord.forEach((freq, idx) => {
      this._tone({ type: "triangle", from: freq, dur: 0.6, vol: 0.18, delay: idx * 0.08 });
    });
  }

  // 4. 清脆流水声/水滴声
  playWaterDrop() {
    this._tone({ type: "sine", from: 1400, to: 600, dur: 0.2, vol: 0.3 });
  }

  // 5. 营火点燃/火花噼啪
  playFireIgnite() {
    this._tone({ type: "sawtooth", from: 180, to: 400, dur: 0.35, vol: 0.2 });
  }

  // 6. 星星入槽音效 (Duang)
  playStarEarned(starIndex = 1) {
    const freqs = [523.25, 659.25, 783.99];
    const targetFreq = freqs[Math.min(starIndex - 1, freqs.length - 1)];
    this._tone({ type: "triangle", from: targetFreq * 0.8, to: targetFreq * 1.5, dur: 0.5, vol: 0.35 });
  }

  // 7. 宝箱开启与金币喷涌
  playChestOpen() {
    for (let i = 0; i < 6; i++) {
      this._tone({ type: "sine", from: 987.77 + i * 120, dur: 0.25, vol: 0.2, delay: i * 0.06 });
    }
  }

  // 8. 倒笔画/错误柔和提示音
  playSoftError() {
    this._tone({ type: "sine", from: 280, to: 180, dur: 0.3, vol: 0.2 });
  }

  // 9. 礼炮欢呼大音效 (通关结算)
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

  // 10. 成功答对音 (上行双音 C5→G5)
  playSuccessSound() {
    this._tone({ type: "sine", from: 523.25, dur: 0.12, vol: 0.28 });
    this._tone({ type: "sine", from: 783.99, dur: 0.22, vol: 0.26, delay: 0.1 });
  }

  // 11. 错误提示音 (下行小二度)
  playErrorSound() {
    this._tone({ type: "sine", from: 392.0, to: 349.23, dur: 0.28, vol: 0.22 });
  }

  // 12. 星星铃铛音 (高频泛音)
  playStarChime() {
    this._tone({ type: "sine", from: 1567.98, dur: 0.3, vol: 0.18 });
    this._tone({ type: "sine", from: 2093.0, dur: 0.4, vol: 0.12, delay: 0.06 });
  }

  // 13. 卡牌翻面音 (白噪短促)
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

  // 14. 攻击命中音 (方波打击)
  playAttackHit() {
    this._tone({ type: "square", from: 220, to: 80, dur: 0.15, vol: 0.22 });
    this._tone({ type: "triangle", from: 660, to: 330, dur: 0.1, vol: 0.15 });
  }

  // 15. 温柔鼓励琶音 (C-E-G)
  playEncouragement() {
    [523.25, 659.25, 783.99].forEach((f, i) => {
      this._tone({ type: "sine", from: f, dur: 0.35, vol: 0.18, delay: i * 0.09 });
    });
  }

  // 16. 连击递增三连音
  playCombo(combo = 1) {
    const base = 523.25 * Math.pow(1.06, Math.min(combo, 8));
    [0, 1, 2].forEach((i) => {
      this._tone({ type: "triangle", from: base * (1 + i * 0.25), dur: 0.1, vol: 0.2, delay: i * 0.05 });
    });
  }

  // 17. 金币叮当 (金属双音)
  playCoinClink() {
    this._tone({ type: "sine", from: 1318.5, dur: 0.15, vol: 0.2 });
    this._tone({ type: "sine", from: 1975.5, dur: 0.25, vol: 0.15, delay: 0.05 });
  }

  // 18. 全屏五彩纸屑与金星粒子特效 (Canvas Confetti)
  triggerConfetti(container) {
    const canvas = document.createElement("canvas");
    canvas.className = "fixed inset-0 pointer-events-none z-50 w-full h-full";
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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
  // 5. 音量 / 静音 / 持久化
  // ----------------------------------------------------
  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.audioCtx.currentTime);
    }
    eventBus.emit(EVENTS.AUDIO_VOLUME_CHANGED, { channel: "master", value: this.masterVolume, profile: this._audioProfile });
  }
  setBGMVolume(val) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmGain && this.audioCtx) {
      if (this.duckStack.depth === 0) {
        this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.audioCtx.currentTime);
      }
    }
    eventBus.emit(EVENTS.AUDIO_VOLUME_CHANGED, { channel: "bgm", value: this.bgmVolume, profile: this._audioProfile });
  }
  setSFXVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.audioCtx) {
      if (this.duckStack.depth === 0) {
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.audioCtx.currentTime);
      }
    }
    eventBus.emit(EVENTS.AUDIO_VOLUME_CHANGED, { channel: "sfx", value: this.sfxVolume, profile: this._audioProfile });
  }
  setVoiceVolume(val) {
    this.voiceVolume = Math.max(0, Math.min(1, val));
    if (this.voiceGain && this.audioCtx) {
      this.voiceGain.gain.setValueAtTime(this.voiceVolume, this.audioCtx.currentTime);
    }
    eventBus.emit(EVENTS.AUDIO_VOLUME_CHANGED, { channel: "voice", value: this.voiceVolume, profile: this._audioProfile });
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
  // 6. 神经童声控制 (晓依真人级童声)
  // ----------------------------------------------------
  /** 开关神经童声 (关闭后走系统 speechSynthesis) */
  setNeuralVoice(on) {
    this.neuralVoiceEnabled = !!on;
    return this.neuralVoiceEnabled;
  }
  /** 语音引擎状态 (调试/诊断) */
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
  // 7. 飞金币入顶栏动画与音效
  // ----------------------------------------------------
  triggerCoinFly(container, startX, startY, count = 6) {
    if (!container) return;
    this.playCoinClink();
    for (let i = 0; i < count; i++) {
      const coin = document.createElement("div");
      coin.textContent = "🪙";
      coin.style.cssText = `position:fixed;left:${startX}px;top:${startY}px;font-size:22px;pointer-events:none;z-index:60;transition:all .6s cubic-bezier(.22,.61,.36,1);opacity:1;`;
      document.body.appendChild(coin);
      requestAnimationFrame(() => {
        const tx = startX + (Math.random() - 0.5) * 120;
        const ty = startY - 60 - Math.random() * 60;
        coin.style.left = tx + "px";
        coin.style.top = ty + "px";
        setTimeout(() => {
          coin.style.left = (window.innerWidth - 80) + "px";
          coin.style.top = "24px";
          coin.style.opacity = "0.9";
          coin.style.transform = "scale(.7)";
          setTimeout(() => coin.remove(), 650);
        }, 220);
      });
    }
  }
}

// ============================================================
// 导出（双名单导出，全部调用点兼容）
// ============================================================
export const soundAndFX = new CathyAudioEngine();
export const soundEngine = soundAndFX;
export default soundAndFX;

// 全局调试句柄
if (typeof window !== "undefined") {
  window.__soundEngine = soundAndFX;
}
