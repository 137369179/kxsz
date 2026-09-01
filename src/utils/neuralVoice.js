/**
 *  ·  (Neural Voice Engine)
 * ============================================================
 * 
 *
 * 
 *   : text → speechSynthesis ( TTS, ,  Web Audio, DSP )
 *   : text →  voice-server (8766) → Edge  TTS (zh-CN-XiaoyiNeural )
 *        → mp3 → decodeAudioData → AudioBufferSourceNode →  DSP 
 *        →  (voiceChar/Word/Sentence/Tutor/EvalGain) → Compressor → Master
 *
 *  (DSP  Web Audio ):
 *   1.  (48kHz, //)
 *   2.  EQ: 2.8kHz  + 3.2kHz HighShelf  (spec FR-4)
 *   3. :  playbackRate ±1.5%  jitter ()
 *      +  90ms  ()
 *
 * : neural () → speechSynthesis (soundEngine )
 *
 * : Chrome 87+ ( crypto.randomUUID /  ES2021 )
 */

// ============================================================
// 1.  → SSML prosody 
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
    this.voice = "zh-CN-XiaoyiNeural";
    this.available = null; // null=
    this._probing = null;
    this._mem = new Map(); // key -> {buffer, lastUsed}
    this._memMax = 160;
    this._fetching = new Map(); // key -> Promise<AudioBuffer>
    this.stats = { plays: 0, cacheHits: 0, netFetch: 0, fallbacks: 0 };
    this.dspEnabled = true;
    this.jitterEnabled = true;
    //  + (voice-server /tts-batch)
    this.batchEnabled = true;
  }

  // ----------  (, ) ----------
  probe(timeoutMs = 1200) {
    if (this.available === true) return Promise.resolve(true);
    if (this._probing) return this._probing;
    this._probing = new Promise((resolve) => {
      const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
      const t = setTimeout(() => { ctl && ctl.abort(); resolve(false); }, timeoutMs);
      fetch(this.base + "/health", { signal: ctl ? ctl.signal : undefined })
        .then((r) => { clearTimeout(t); this.available = r.ok; resolve(r.ok); })
        .catch(() => { clearTimeout(t); this.available = false; resolve(false); })
        .finally(() => {
          this._probing = null;
          if (this.available === false) {
            // 30s 
            setTimeout(() => { this.available = null; }, 30000);
          }
        });
    });
    return this._probing;
  }

  _key(text, rate, pitch, voice) {
    return `${voice || this.voice}|${rate}|${pitch}|${text}`;
  }

  _decode(ctx, arrayBuf) {
    return new Promise((resolve, reject) => {
      // Chrome 87 :  promise,  callback 
      let p;
      try { p = ctx.decodeAudioData(arrayBuf, undefined, undefined); } catch (e) { p = null; }
      if (p && typeof p.then === "function") {
        p.then(resolve).catch(reject);
      } else {
        ctx.decodeAudioData(arrayBuf, resolve, reject);
      }
    });
  }

  /**  AudioBuffer ( LRU → HTTP → decodeAudioData) */
  async getBuffer(ctx, text, rate, pitch, voice) {
    const key = this._key(text, rate, pitch, voice);
    const hit = this._mem.get(key);
    if (hit) {
      hit.lastUsed = Date.now();
      this.stats.cacheHits++;
      return hit.buffer;
    }
    if (this._fetching.has(key)) return this._fetching.get(key);
    const p = (async () => {
      this.stats.netFetch++;
      const url = `${this.base}/tts?text=${encodeURIComponent(text)}` +
        `&voice=${encodeURIComponent(voice || this.voice)}` +
        `&rate=${encodeURIComponent(rate)}&pitch=${encodeURIComponent(pitch)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`tts-http-${res.status}`);
      const ab = await res.arrayBuffer();
      const buf = await this._decode(ctx, ab);
      // LRU 
      this._mem.set(key, { buffer: buf, lastUsed: Date.now() });
      if (this._mem.size > this._memMax) {
        const oldest = [...this._mem.entries()].sort((a, b) => a[1].lastUsed - b[1].lastUsed)[0];
        if (oldest) this._mem.delete(oldest[0]);
      }
      return buf;
    })();
    this._fetching.set(key, p);
    try { return await p; } finally { this._fetching.delete(key); }
  }

  /**
   *  DSP  (, ·Web Audio )
   * source → [HighShelf 3.2kHz +2dB] → [Peaking 2.8kHz +1dB Q1.4] → outGain → dest
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
  async play({ text, ctx, dest, emotion, pitchOffset, rateMul, volume = 1, onEnd }) {
    if (!ctx || !dest) return null;
    // (>12 ) → ,  ≈ max()  sum()
    if (this.batchEnabled && [...text].length > 12) {
      const h = await this.playSentence({ text, ctx, dest, emotion, pitchOffset, rateMul, volume, onEnd });
      if (h) return h;
    }
    return this._playSingle({ text, ctx, dest, emotion, pitchOffset, rateMul, volume, onEnd });
  }

  /**  () */
  async _playSingle({ text, ctx, dest, emotion, pitchOffset, rateMul, volume = 1, onEnd }) {
    if (!ctx || !dest) return null;
    const ok = await this.probe();
    if (!ok) { this.stats.fallbacks++; return null; }

    const pros = emotionToProsody(emotion, pitchOffset, rateMul);
    let buffer;
    try {
      buffer = await this.getBuffer(ctx, text, pros.rate, pros.pitch);
    } catch (e) {
      this.stats.fallbacks++;
      return null;
    }

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

  /**  (, ) */
  warmup(items) {
    if (typeof fetch !== "function") return;
    this.probe().then((ok) => {
      if (!ok) return;
      fetch(this.base + "/warmup?items=" + encodeURIComponent(items.join("|")))
        .catch(() => {});
    }).catch(() => {});
  }

  // ---------- base64 → ArrayBuffer (Chrome 87 ,  atob ) ----------
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
   * 10 :  ~10s →  ~2.3s (≈4x )
   *
   * @returns  play()  handle;  null ( _playSingle/TTS)
   */
  async playSentence({ text, ctx, dest, emotion, pitchOffset, rateMul, volume = 1, onEnd }) {
    if (!ctx || !dest) return null;
    const ok = await this.probe();
    if (!ok) { this.stats.fallbacks++; return null; }

    const pros = emotionToProsody(emotion, pitchOffset, rateMul);

    // 1)  ( + , )
    let data;
    try {
      const url = `${this.base}/tts-batch?text=${encodeURIComponent(text)}` +
        `&voice=${encodeURIComponent(this.voice)}` +
        `&rate=${encodeURIComponent(pros.rate)}&pitch=${encodeURIComponent(pros.pitch)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`batch-http-${res.status}`);
      data = await res.json();
      if (!data || !data.ok || !Array.isArray(data.parts)) throw new Error("batch-bad-payload");
    } catch (e) {
      return null; //  _playSingle ()
    }

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
          const oldest = [...this._mem.entries()].sort((a, b) => a[1].lastUsed - b[1].lastUsed)[0];
          if (oldest) this._mem.delete(oldest[0]);
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
