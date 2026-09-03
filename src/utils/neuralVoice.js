/**
 *  ·  (Neural Voice Engine)
 * ============================================================
 * 
 *
 * 
 *   : text  speechSynthesis ( TTS, ,  Web Audio, DSP )
 *   : text   voice-server (8766)  Edge  TTS (zh-CN-XiaoxiaoNeural )
 *         mp3  decodeAudioData  AudioBufferSourceNode   DSP 
 *          (voiceChar/Word/Sentence/Tutor/EvalGain)  Compressor  Master
 *
 *  (DSP  Web Audio ):
 *   1.  (48kHz, //)
 *   2.  EQ: 2.8kHz  + 3.2kHz HighShelf  (spec FR-4)
 *   3. :  playbackRate ±1.5%  jitter ()
 *      +  90ms  ()
 *
 * : neural ()  speechSynthesis (soundEngine )
 *
 * : Chrome 87+ ( crypto.randomUUID /  ES2021 )
 */

// ============================================================
// 1.   SSML prosody 
// ============================================================
/**
 *  readingModes.js EMOTION_MATRIX :
 *   pitchOffset  utter.pitch  ( 1.35), 0.10 ≈ SSML pitch +7%
 *   rateMul 0.95 ≈ SSML rate -5%
 *  (): rate +0%, pitch +8%
 */
export const NEURAL_PROSODY_BASE = { rate: "+0%", pitch: "+8%" };

export function emotionToProsody(emotion, pitchOffset = 0, rateMul = 1) {
  const map = {
    neutral: { p: 0, r: 1.0 },
    encouragement: { p: 0.10, r: 0.95 },
    gentle: { p: 0.04, r: 0.85 },
    excited: { p: 0.15, r: 1.05 },
    correction: { p: -0.02, r: 0.85 },
    bedtime: { p: -0.08, r: 0.78 },
    question: { p: 0.08, r: 0.92 },
  };
  const e = map[emotion] || map.neutral;
  const pOff = pitchOffset || e.p;
  const rMul = rateMul && rateMul !== 1 ? rateMul : e.r;
  const pitchPct = Math.round(8 + pOff * 70); //  +8% + 
  const ratePct = Math.round((rMul - 1) * 100);
  const fmt = (v) => (v >= 0 ? `+${v}%` : `${v}%`);
  return { rate: fmt(ratePct), pitch: fmt(pitchPct), rateMul: rMul };
}

// ============================================================
// 2. 
// ============================================================
class NeuralVoiceEngine {
  constructor() {
    this.base = (typeof location !== "undefined" && location.protocol === "https:")
      ? "https://127.0.0.1:8766" : "http://127.0.0.1:8766";
    this.voice = "zh-CN-XiaoxiaoNeural"; // 默认音色: 晓晓·明亮少女 (MOS 盲测冠军 4.10)
    let storedUnavailable = false;
    try {
      if (typeof sessionStorage !== "undefined") {
        storedUnavailable = sessionStorage.getItem("cathy_neural_unavailable") === "1";
      }
    } catch {}
    this.available = storedUnavailable ? false : null; // false=不可用/熔断中, null=待探测, true=可用
    this._probing = null;
    this._consecutiveErrors = 0;
    this._cooldownTimer = null;
    this._mem = new Map(); // key -> {buffer, lastUsed}
    this._memMax = 160;
    this._fetching = new Map(); // key -> Promise<AudioBuffer>
    this._fetchingMax = 32; // 限制并发 TTS 请求数，防止浏览器资源耗尽
    this.stats = { plays: 0, cacheHits: 0, netFetch: 0, fallbacks: 0 };
    this.dspEnabled = true;
    this.jitterEnabled = true;
    // 子句并行合成 + Web Audio 无缝级联 (voice-server /tts-batch)
    this.batchEnabled = true;
  }

  /** 记录失败并判定是否触发熔断保护 */
  _recordFailure() {
    this._consecutiveErrors = (this._consecutiveErrors || 0) + 1;
    if (this._consecutiveErrors >= 2) {
      this.available = false;
      if (this._cooldownTimer) clearTimeout(this._cooldownTimer);
      this._cooldownTimer = setTimeout(() => {
        this.available = null; // 冷却 60 秒后允许重新探测
        this._consecutiveErrors = 0;
      }, 60000);
    }
  }

  /** 记录成功并清零连续错误计数 */
  _recordSuccess() {
    this._consecutiveErrors = 0;
  }

  // ---------- 健康探测与可用性检查 ----------
  probe(timeoutMs = 800) {
    if (this.available === true) return Promise.resolve(true);
    if (this.available === false) return Promise.resolve(false);
    if (this._probing) return this._probing;
    this._probing = new Promise((resolve) => {
      try {
        const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
        const t = setTimeout(() => {
          ctl && ctl.abort();
          this.available = false;
          resolve(false);
        }, timeoutMs);

        fetch(this.base + "/health", { signal: ctl ? ctl.signal : undefined, mode: "cors" })
          .then((r) => {
            if (!r.ok) throw new Error("health-status-" + r.status);
            return r.json();
          })
          .then((data) => {
            clearTimeout(t);
            // 严格验证是正版 voice-server 响应，而非本地其他占用 8766 端口的代理/网关
            const isValid = !!(data && data.ok === true && data.defaultVoice);
            this.available = isValid;
            try {
              if (typeof sessionStorage !== "undefined") {
                if (isValid) sessionStorage.removeItem("cathy_neural_unavailable");
                else sessionStorage.setItem("cathy_neural_unavailable", "1");
              }
            } catch {}
            if (isValid) this._recordSuccess();
            else this._recordFailure();
            resolve(isValid);
          })
          .catch(() => {
            clearTimeout(t);
            this.available = false;
            try {
              if (typeof sessionStorage !== "undefined") {
                sessionStorage.setItem("cathy_neural_unavailable", "1");
              }
            } catch {}
            resolve(false);
          })
          .finally(() => {
            this._probing = null;
          });
      } catch (e) {
        this.available = false;
        try {
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.setItem("cathy_neural_unavailable", "1");
          }
        } catch {}
        this._probing = null;
        resolve(false);
      }
    });
    return this._probing;
  }

  _key(text, rate, pitch, voice) {
    return `${voice || this.voice}|${rate}|${pitch}|${text}`;
  }

  _decode(ctx, arrayBuf) {
    return new Promise((resolve, reject) => {
      // Chrome 87 现代环境支持 promise, 旧版走 callback
      let p;
      try { p = ctx.decodeAudioData(arrayBuf, undefined, undefined); } catch (e) { p = null; }
      if (p && typeof p.then === "function") {
        p.then(resolve).catch(reject);
      } else {
        ctx.decodeAudioData(arrayBuf, resolve, reject);
      }
    });
  }

  /** 获取单句 AudioBuffer (带 LRU 内存缓存、HTTP 代理获取与 decodeAudioData) */
  async getBuffer(ctx, text, rate, pitch, voice, signal) {
    const key = this._key(text, rate, pitch, voice);
    const hit = this._mem.get(key);
    if (hit) {
      hit.lastUsed = Date.now();
      this.stats.cacheHits++;
      return hit.buffer;
    }
    if (this._fetching.has(key)) return this._fetching.get(key);
    // 限制并发 TTS 请求数，防止浏览器资源耗尽
    if (this._fetching.size >= this._fetchingMax) {
      this.stats.fallbacks++;
      return null; // 暂不发起新请求，等待已有请求完成
    }
    const p = (async () => {
      this.stats.netFetch++;
      const url = `${this.base}/tts?text=${encodeURIComponent(text)}` +
        `&voice=${encodeURIComponent(voice || this.voice)}` +
        `&rate=${encodeURIComponent(rate)}&pitch=${encodeURIComponent(pitch)}`;
      let res;
      try {
        res = await fetch(url, { signal });
      } catch (err) {
        this._recordFailure();
        throw err;
      }
      if (!res.ok) {
        this._recordFailure();
        throw new Error(`tts-http-${res.status}`);
      }
      this._recordSuccess();
      const ab = await res.arrayBuffer();
      const buf = await this._decode(ctx, ab);
      // LRU 淘汰（Map 保持插入顺序，FIFO 淘汰最旧的）
      this._mem.set(key, { buffer: buf, lastUsed: Date.now() });
      if (this._mem.size > this._memMax) {
        const firstKey = this._mem.keys().next().value;
        if (firstKey) this._mem.delete(firstKey);
      }
      return buf;
    })();
    this._fetching.set(key, p);
    try { return await p; } finally { this._fetching.delete(key); }
  }

  /**
   * 查询指定文本在当前情绪/语调参数下是否已有缓存音频（供 soundEngine 决策走缓存即时播放）。
   * 参数与 play() 的情绪链路保持一致：emotion + pitchOffset + rateMul → emotionToProsody → 缓存键。
   */
  hasCached(text, emotion = "neutral", pitchOffset = 0, rateMul = 1) {
    try {
      const pros = emotionToProsody(emotion, pitchOffset, rateMul);
      return this._mem.has(this._key(text, pros.rate, pros.pitch));
    } catch {
      return false;
    }
  }

  /**
   * 预热缓存：后台拉取并解码指定文本的 TTS 音频（供 soundEngine 空闲期 prefetch）。
   * 已命中缓存或服务不可用时静默返回，绝不抛错。
   * @returns {Promise<boolean>} 是否成功就绪（命中或拉取成功）
   */
  async prefetch(text, ctx, emotion = "neutral", pitchOffset = 0, rateMul = 1) {
    try {
      if (!ctx || !text) return false;
      const pros = emotionToProsody(emotion, pitchOffset, rateMul);
      const key = this._key(text, pros.rate, pros.pitch);
      if (this._mem.has(key)) return true;
      const ok = await this.probe();
      if (!ok) return false;
      const buf = await this.getBuffer(ctx, text, pros.rate, pros.pitch);
      return !!buf;
    } catch {
      return false;
    }
  }

  /**
   *  DSP  (, ·Web Audio )
   * source  [HighShelf 3.2kHz +2dB]  [Peaking 2.8kHz +1dB Q1.4]  outGain  dest
   */
  _buildPolishChain(ctx, dest) {
    if (!this.dspEnabled || !ctx.createBiquadFilter) return null;
    const hs = ctx.createBiquadFilter();
    hs.type = "highshelf";
    hs.frequency.value = 3200;
    hs.gain.value = 2.0;
    const pk = ctx.createBiquadFilter();
    pk.type = "peaking";
    pk.frequency.value = 2800;
    pk.Q.value = 1.4;
    pk.gain.value = 1.0;
    const out = ctx.createGain();
    out.gain.value = 1.0;
    hs.connect(pk);
    pk.connect(out);
    out.connect(dest);
    return { head: hs, out };
  }

  /**
   *  ( soundEngine  utteranceFactory )
   *  +  (playSentence)
   * @returns {{cancel:Function, onEndPromise:Promise<{interrupted:boolean}>, durationMs:number}}
   *          / null ( speechSynthesis)
   */
  async play({ text, ctx, dest, emotion, pitchOffset, rateMul, volume = 1, onEnd, signal }) {
    if (!ctx || !dest) return null;
    const ok = await this.probe();
    if (!ok) {
      this.stats.fallbacks++;
      return null;
    }
    // (>12 字符) 走长句批处理分片并行合成，首片就绪即可开始无缝流式播放
    if (this.batchEnabled && [...text].length > 12) {
      const h = await this.playSentence({ text, ctx, dest, emotion, pitchOffset, rateMul, volume, onEnd, signal });
      if (h) return h;
      if (this.available === false) return null; // 若已熔断，不发起二次单次请求
    }
    return this._playSingle({ text, ctx, dest, emotion, pitchOffset, rateMul, volume, onEnd, signal });
  }

  /** 播放单句音频 (带 Web Audio 润色与抖动) */
  async _playSingle({ text, ctx, dest, emotion, pitchOffset, rateMul, volume = 1, onEnd, signal }) {
    if (!ctx || !dest) return null;
    const ok = await this.probe();
    if (!ok) { this.stats.fallbacks++; return null; }

    const pros = emotionToProsody(emotion, pitchOffset, rateMul);
    let buffer;
    try {
      buffer = await this.getBuffer(ctx, text, pros.rate, pros.pitch, undefined, signal);
    } catch (e) {
      this.stats.fallbacks++;
      return null;
    }
    if (!buffer || (signal && signal.aborted)) return null;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    // jitter: ±1.5%  ()
    const jitter = this.jitterEnabled ? 1 + (Math.random() - 0.5) * 0.03 : 1;
    src.playbackRate.value = jitter;

    const chain = this._buildPolishChain(ctx, dest);
    const head = chain ? chain.head : dest;
    const outGain = chain ? chain.out : null;
    if (outGain) outGain.gain.value = Math.max(0.0001, volume);
    src.connect(head);

    //  90ms 
    const dur = buffer.duration / jitter;
    const fadeAt = Math.max(0, dur - 0.09);
    if (outGain) {
      outGain.gain.setValueAtTime(Math.max(0.0001, volume), ctx.currentTime + fadeAt);
      outGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + dur);
    }

    //  (MEM-1 , )
    try {
      const reg = (typeof window !== "undefined") && window.__audioNodeRegistry;
      if (reg && reg.register) reg.register(src, "neural_voice", null);
    } catch {}

    let cancelled = false;
    const onEndPromise = new Promise((res) => {
      src.onended = () => {
        try { src.disconnect(); outGain && outGain.disconnect(); } catch {}
        res({ interrupted: cancelled });
      };
    });
    src.start();

    this.stats.plays++;
    if (typeof onEnd === "function") onEndPromise.then(onEnd).catch(() => {});

    return {
      cancel() {
        cancelled = true;
        try { src.stop(); } catch {}
      },
      onEndPromise,
      durationMs: Math.round(dur * 1000),
    };
  }

  /** 批量预热常用字词表（自动分批，防止 URL 过长触发 HTTP 431） */
  warmup(items) {
    if (this.available === false) return;
    if (typeof fetch !== "function" || !Array.isArray(items) || items.length === 0) return;
    this.probe().then((ok) => {
      if (!ok) return;
      const list = [...new Set(items)].filter(Boolean);
      const CHUNK_SIZE = 25; // 每批 25 个词条，URL < 600 字节，远低于 Node 8KB 阈值
      for (let i = 0; i < list.length; i += CHUNK_SIZE) {
        const chunk = list.slice(i, i + CHUNK_SIZE);
        const delay = Math.floor(i / CHUNK_SIZE) * 80;
        setTimeout(() => {
          fetch(`${this.base}/warmup?items=${encodeURIComponent(chunk.join("|"))}`)
            .catch(() => {});
        }, delay);
      }
    }).catch(() => {});
  }

  // ---------- base64  ArrayBuffer (Chrome 87 ,  atob ) ----------
  _b64ToArrayBuffer(b64) {
    const bin = typeof atob === "function" ? atob(b64) : this._atobPolyfill(b64);
    const len = bin.length;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) buf[i] = bin.charCodeAt(i);
    return buf.buffer;
  }
  _atobPolyfill(b64) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const clean = b64.replace(/[^A-Za-z0-9+/]/g, "");
    let out = "";
    for (let i = 0; i < clean.length; i += 4) {
      const n = (chars.indexOf(clean[i]) << 18) | (chars.indexOf(clean[i + 1]) << 12) |
        ((chars.indexOf(clean[i + 2]) & 0xff) << 6) | (chars.indexOf(clean[i + 3]) & 0xff);
      if (clean[i + 2]) out += String.fromCharCode((n >>> 16) & 0xff);
      if (clean[i + 3]) out += String.fromCharCode((n >>> 8) & 0xff);
    }
    return out;
  }

  /**
   * : (/tts-batch) + Web Audio 
   *
   * :  T N :
   *    ≈ T/ × N (≈ T )
   *    ≈ max() ≈  ~2.3s
   * 10 :  ~10s   ~2.3s (≈4x )
   *
   * @returns  play()  handle;  null ( _playSingle/TTS)
   */
  async playSentence({ text, ctx, dest, emotion, pitchOffset, rateMul, volume = 1, onEnd, signal }) {
    if (!ctx || !dest) return null;
    const ok = await this.probe();
    if (!ok) { this.stats.fallbacks++; return null; }

    const pros = emotionToProsody(emotion, pitchOffset, rateMul);

    // 1) 获取分片合成结果 (带缓存 + 并发去重，服务端完成)
    let data;
    try {
      const url = `${this.base}/tts-batch?text=${encodeURIComponent(text)}` +
        `&voice=${encodeURIComponent(this.voice)}` +
        `&rate=${encodeURIComponent(pros.rate)}&pitch=${encodeURIComponent(pros.pitch)}`;
      const res = await fetch(url, { signal });
      if (!res.ok) {
        this._recordFailure();
        throw new Error(`batch-http-${res.status}`);
      }
      data = await res.json();
      if (!data || !data.ok || !Array.isArray(data.parts)) {
        this._recordFailure();
        throw new Error("batch-bad-payload");
      }
      this._recordSuccess();
    } catch (e) {
      return null; // 降级为 _playSingle 或 本地系统 TTS
    }
    if (signal && signal.aborted) return null;

    // 2)  decode  ( LRU)
    const buffers = [];
    try {
      for (const p of data.parts) {
        if (!p || !p.audio) throw new Error("part-missing-audio");
        const key = this._key(p.text, pros.rate, pros.pitch, this.voice);
        const hit = this._mem.get(key);
        if (hit) { hit.lastUsed = Date.now(); this.stats.cacheHits++; buffers.push(hit.buffer); continue; }
        const ab = this._b64ToArrayBuffer(p.audio);
        const buf = await this._decode(ctx, ab);
        this._mem.set(key, { buffer: buf, lastUsed: Date.now() });
        if (this._mem.size > this._memMax) {
          const firstKey = this._mem.keys().next().value;
          if (firstKey) this._mem.delete(firstKey);
        }
        buffers.push(buf);
      }
    } catch (e) {
      return null;
    }
    if (buffers.length === 0) return null;

    // 3) :  DSP ,  startTime 
    const chain = this._buildPolishChain(ctx, dest);
    const head = chain ? chain.head : dest;
    const outGain = chain ? chain.out : null;
    if (outGain) outGain.gain.value = Math.max(0.0001, volume);

    const t0 = ctx.currentTime + 0.02;
    const sources = [];
    let cursor = t0;
    let totalDur = 0;
    for (const buf of buffers) {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const jitter = this.jitterEnabled ? 1 + (Math.random() - 0.5) * 0.03 : 1;
      src.playbackRate.value = jitter;
      src.connect(head);
      src.start(cursor);
      const dur = buf.duration / jitter;
      sources.push({ src, start: cursor, dur });
      cursor += dur;
      totalDur += dur;
      try {
        const reg = (typeof window !== "undefined") && window.__audioNodeRegistry;
        if (reg && reg.register) reg.register(src, "neural_voice_part", null);
      } catch {}
    }
    //  90ms 
    if (outGain) {
      outGain.gain.setValueAtTime(Math.max(0.0001, volume), t0 + Math.max(0, totalDur - 0.09));
      outGain.gain.linearRampToValueAtTime(0.0001, t0 + totalDur);
    }

    let cancelled = false;
    const last = sources[sources.length - 1];
    const onEndPromise = new Promise((res) => {
      last.src.onended = () => {
        for (const s of sources) { try { s.src.disconnect(); } catch {} }
        outGain && (() => { try { outGain.disconnect(); } catch {} })();
        res({ interrupted: cancelled });
      };
    });

    this.stats.plays++;
    this.stats.batchPlays = (this.stats.batchPlays || 0) + 1;
    if (typeof onEnd === "function") onEndPromise.then(onEnd).catch(() => {});

    return {
      cancel() {
        cancelled = true;
        for (const s of sources) { try { s.src.stop(); } catch {} }
      },
      onEndPromise,
      durationMs: Math.round(totalDur * 1000),
    };
  }

  /**  (//, readaloud  zh-CN  6 ) */
  setVoice(voice) {
    this.voice = voice;
    return this.voice;
  }

  clearMemory() { this._mem.clear(); }
}

export const neuralVoice = new NeuralVoiceEngine();

// 
if (typeof window !== "undefined") {
  window.__neuralVoice = neuralVoice;
}

export default neuralVoice;
