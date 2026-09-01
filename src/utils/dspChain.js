/**
 *    DSP  + 4  Pitch 
 *
 *  =  (Childlike Voice Acoustic Modeling)
 *  1.  Formant Shifting (F1+150Hz, F2+200Hz) — 
 *  2.  +  Air-Breath  ()
 *  3.  260Hz ( G4±50) +  Pitch 
 *  4. 4   5  (Task3/AC-3   ±5%)
 *     -  55:  (f0 520  500 Hz)
 *     -  35:  (f0 340  540 Hz F0 )
 *     -  214:  +  +  (f0 360  220  460 Hz)
 *     -  51:  (f0 560  200 Hz)
 *  5.  15dB  +  60%
 *  6.  ( Chorus )
 *
 * DSPNodeChain { input -> ... -> output }   soundEngine  5 
 */

import { soundAndFX } from "./soundEngine.js";

// ============================================================
// 1.   (5   Hz )
// ============================================================
export class TonePitchEnvelope {
  constructor() {
    /*  1  12  1.0595x 260Hz (C4≈261, G4≈392)
        Hz "" */
    this.basselineHz = 260; // 
    this.range5 = 1.9;      //  ( 12  + 3 = 15 ≈ 2.83 ->  1.9 )
  }

  /** 5Hz   [1..5]   Hz */
  _level(level) {
    // level 5 = basseline*range5^((5-3)/2)
    return this.basselineHz * Math.pow(this.range5, (level - 3) / 2);
  }

  /**
   *  toneHz 
   * @param {{toneNum: 1|2|3|4|0, durationSec: number, startTime?: number, baseGain?: number}} param
   * @returns {AutomationPlan: [{t:number, hz:number, method:'setValueAtTime'|'linearRampToValueAtTime'|'exponentialRampToValueAtTime'}]}
   */
  plan({ toneNum, durationSec, startTime = 0, baseGain = 1.0 }) {
    const t0 = startTime;
    const D = durationSec;
    const out = [];
    switch (toneNum) {
      case 1: //  55:  
        out.push({ t: t0, hz: this._level(5), gainMul: 1.0, method: "setValueAtTime" });
        out.push({ t: t0 + D * 0.9, hz: this._level(4.8), gainMul: 1.0, method: "linearRampToValueAtTime" });
        out.push({ t: t0 + D, hz: this._level(4.6), gainMul: 0.05, method: "linearRampToValueAtTime" });
        break;
      case 2: //  35:   ( + )
        out.push({ t: t0, hz: this._level(3.2), gainMul: 0.95, method: "setValueAtTime" });
        out.push({ t: t0 + D * 0.25, hz: this._level(3.0), gainMul: 1.0, method: "linearRampToValueAtTime" });
        out.push({ t: t0 + D * 0.75, hz: this._level(4.2), gainMul: 1.0, method: "exponentialRampToValueAtTime" });
        out.push({ t: t0 + D, hz: this._level(5), gainMul: 0.05, method: "exponentialRampToValueAtTime" });
        break;
      case 3: //  214: - (×1.4)
        out.push({ t: t0, hz: this._level(3), gainMul: 0.95, method: "setValueAtTime" });
        out.push({ t: t0 + D * 0.25, hz: this._level(2), gainMul: 1.0, method: "linearRampToValueAtTime" });
        out.push({ t: t0 + D * 0.55, hz: this._level(1.3), gainMul: 0.7, method: "exponentialRampToValueAtTime" });
        out.push({ t: t0 + D * 0.85, hz: this._level(4), gainMul: 0.9, method: "exponentialRampToValueAtTime" });
        out.push({ t: t0 + D, hz: this._level(3.8), gainMul: 0.05, method: "linearRampToValueAtTime" });
        break;
      case 4: //  51:  
        out.push({ t: t0, hz: this._level(5), gainMul: 1.0, method: "setValueAtTime" });
        out.push({ t: t0 + D * 0.7, hz: this._level(2.2), gainMul: 0.4, method: "exponentialRampToValueAtTime" });
        out.push({ t: t0 + D, hz: this._level(1), gainMul: 0.01, method: "exponentialRampToValueAtTime" });
        break;
      case 0: case 5: default: //    0.6, ×0.4
        out.push({ t: t0, hz: this._level(1.6), gainMul: 0.4, method: "setValueAtTime" });
        out.push({ t: t0 + D, hz: this._level(1.2), gainMul: 0.01, method: "linearRampToValueAtTime" });
        break;
    }
    return out;
  }

  /**  ( AC-3 ) */
  durationScale(toneNum, mode = "teaching") {
    if (mode === "chant") {
      return [1.2, 1.0, 1.4, 0.8, 0.6][toneNum || 0] ?? 1.0;
    }
    return [0.6, 1.0, 1.05, 1.4, 0.85][toneNum || 0] ?? 1.0;
  }
}

// ============================================================
// 2.  DSP  ( WebAudio)
//
// inputGain
//        > FormantFilter (Biquad x2) 
//        > BreathNoiseInject            > SoftClipper > ChorusLite > outputGain
//        > HarmonicExciter              
// ============================================================
export class ChildVoiceDSP {
  /**
   * @param {AudioContext} ctx
   * @param {{formantShift?: number, breathAmount?: number, harmonicMix?: number, preset?:"toddler(3y)"|"preschool(5y)"|"school(7y)"}} opts
   */
  constructor(ctx, opts = {}) {
    this.ctx = ctx;
    const preset = opts.preset || "preschool(5y)";
    const presets = {
      "toddler(3y)":  { formant: +220, breath: 0.03, harmonic: 0.15, pitch: 1.45, jitter: 1.6 },
      "preschool(5y)": { formant: +150, breath: 0.022, harmonic: 0.11, pitch: 1.35, jitter: 1.1 },
      "school(7y)":   { formant: +90,  breath: 0.015, harmonic: 0.09, pitch: 1.2,  jitter: 0.8 },
    };
    this.p = { ...presets[preset], ...opts };
    this._build();
  }

  _build() {
    const ctx = this.ctx;
    this.inputGain = ctx.createGain();
    this.outputGain = ctx.createGain();
    this.outputGain.gain.value = 1.0;

    // --- Formant Shifter  ---
    this.formant1 = ctx.createBiquadFilter();
    this.formant1.type = "peaking";
    this.formant1.frequency.value = 900 + this.p.formant;  // F1 (~/a/)
    this.formant1.Q.value = 1.1;
    this.formant1.gain.value = +4.8;   // dB 

    this.formant2 = ctx.createBiquadFilter();
    this.formant2.type = "peaking";
    this.formant2.frequency.value = 2200 + this.p.formant;
    this.formant2.Q.value = 0.9;
    this.formant2.gain.value = +3.2;

    // HF rolloff ( ->   -> 10kHz shelf -1dB)
    this.hf = ctx.createBiquadFilter();
    this.hf.type = "highshelf";
    this.hf.frequency.value = 9500;
    this.hf.gain.value = -1.0;

    // LPF : 12kHz gentle
    this.lpf = ctx.createBiquadFilter();
    this.lpf.type = "lowpass";
    this.lpf.frequency.value = 11000;
    this.lpf.Q.value = 0.6;

    // --- Harmonic Exciter () ---
    this.harmonicWet = ctx.createGain();
    this.harmonicWet.gain.value = this.p.harmonic;
    this.harmonicShaper = ctx.createWaveShaper();
    const N = 512, curve = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const x = (i / N) * 2 - 1;
      curve[i] = Math.tanh(1.5 * x) * 0.6 + Math.tanh(3.0 * x) * 0.15;
    }
    this.harmonicShaper.curve = curve;
    this.harmonicShaper.oversample = "2x";

    // --- Breath  ---
    this.breathGain = ctx.createGain();
    this.breathGain.gain.value = this.p.breath;
    this.breathBP = ctx.createBiquadFilter();
    this.breathBP.type = "bandpass";
    this.breathBP.frequency.value = 5200;
    this.breathBP.Q.value = 0.5;
    const breathBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const breathData = breathBuf.getChannelData(0);
    for (let i = 0; i < breathData.length; i++) breathData[i] = (Math.random() * 2 - 1) * 0.9;
    this.breathNoise = ctx.createBufferSource();
    this.breathNoise.buffer = breathBuf;
    this.breathNoise.loop = true;

    // ---   ---
    // 
    this.inputGain.connect(this.formant1);
    this.formant1.connect(this.formant2);
    this.formant2.connect(this.hf);
    this.hf.connect(this.lpf);
    this.lpf.connect(this.outputGain);

    //  : from formant2 after lpf   waveshaper
    this.formant2.connect(this.harmonicShaper);
    this.harmonicShaper.connect(this.harmonicWet);
    this.harmonicWet.connect(this.outputGain);

    // 
    this.breathNoise.connect(this.breathBP);
    this.breathBP.connect(this.breathGain);
    this.breathGain.connect(this.outputGain);

    // 
    try { this.breathNoise.start(0); } catch {}

    this.connected = true;
  }

  /**  source  DSP  DSP  destination */
  connect(source, destination) {
    if (!this.connected) this._build();
    source.connect(this.inputGain);
    if (destination) this.outputGain.connect(destination);
    return this.outputGain;
  }

  disconnectAll() {
    try { this.breathNoise && this.breathNoise.stop && this.breathNoise.stop(); } catch {}
    try { this.inputGain.disconnect(); this.outputGain.disconnect(); this.harmonicWet.disconnect(); this.breathGain.disconnect(); } catch {}
    this.connected = false;
  }

  /** 3/5/7  */
  setAge(ageYears = 5, fadeMs = 400) {
    const target = ageYears <= 4 ? "toddler(3y)" : (ageYears <= 6 ? "preschool(5y)" : "school(7y)");
    const presets = {
      "toddler(3y)":  { formant: +220, breath: 0.03, harmonic: 0.15, pitch: 1.45 },
      "preschool(5y)": { formant: +150, breath: 0.022, harmonic: 0.11, pitch: 1.35 },
      "school(7y)":   { formant: +90,  breath: 0.015, harmonic: 0.09, pitch: 1.2 },
    }[target];
    const ctx = this.ctx; const now = ctx.currentTime;
    const endT = now + fadeMs / 1000;
    [this.formant1, this.formant2].forEach(f => f.frequency.cancelScheduledValues(now));
    this.formant1.frequency.linearRampToValueAtTime(900 + presets.formant, endT);
    this.formant2.frequency.linearRampToValueAtTime(2200 + presets.formant, endT);
    this.harmonicWet.gain.cancelScheduledValues(now);
    this.harmonicWet.gain.linearRampToValueAtTime(presets.harmonic, endT);
    this.breathGain.gain.cancelScheduledValues(now);
    this.breathGain.gain.linearRampToValueAtTime(presets.breath, endT);
    this.p.currentPitch = presets.pitch;
  }
}

// ============================================================
// 3. 4   DSP  (Task 3 AC-3 )
// ============================================================
export class ToneSlideSynthesizer {
  constructor() {
    this.pitchEnv = new TonePitchEnvelope();
  }

  /**  F0  sin  ( DSP ) */
  async synthesizeTone(toneNum, opts = {}) {
    soundAndFX.init();
    const ctx = soundAndFX.audioCtx;
    if (!ctx) return null;
    const voiceCharGain = soundAndFX.voiceCharGain;
    const mode = opts.mode || "teaching";
    const baseDur = 0.35;
    const D = baseDur * this.pitchEnv.durationScale(toneNum, mode);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    amp.gain.value = 0;
    osc.type = "sine";

    //  F0   
    const plan = this.pitchEnv.plan({ toneNum, durationSec: D });
    const pts = plan;
    osc.frequency.setValueAtTime(pts[0].hz, now);
    amp.gain.setValueAtTime(0, now);
    amp.gain.linearRampToValueAtTime(0.35 * (pts[0].gainMul || 1), now + 0.02);
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      const t = now + p.t;
      const method = p.method || "linearRampToValueAtTime";
      if (method === "exponentialRampToValueAtTime") {
        osc.frequency.exponentialRampToValueAtTime(Math.max(80, p.hz), t);
      } else {
        osc.frequency.linearRampToValueAtTime(p.hz, t);
      }
    }
    const last = pts[pts.length - 1];
    amp.gain.linearRampToValueAtTime(0.001, now + D);

    //   DSP
    const dsp = new ChildVoiceDSP(ctx, opts.dspOpts || {});
    osc.connect(amp);
    dsp.connect(amp, voiceCharGain || soundAndFX.sfxGain);
    osc.start(now);
    osc.stop(now + D + 0.05);

    return new Promise((res) => setTimeout(() => {
      dsp.disconnectAll();
      res({ durationSec: D, plan });
    }, (D + 0.1) * 1000));
  }

  /**
   * AC-3 4     F0  5  (%)
   * 55/35/214/51  Hz  ±5%
   */
  async run_AC_3_scenario() {
    const results = [];
    for (let tone of [1, 2, 3, 4]) {
      const plan = this.pitchEnv.plan({ toneNum: tone, durationSec: 0.35 });
      const expectedKps = {
        1: [{ label: "55 ", idx: 0, expectedLevel: 5 }, { label: "55 ", idx: 2, expectedLevel: 4.6 }],
        2: [{ label: "35 ", idx: 0, expectedLevel: 3.2 }, { label: "35 ", idx: 3, expectedLevel: 5 }],
        3: [{ label: "214 ", idx: 0, expectedLevel: 3 }, { label: "214 ", idx: 2, expectedLevel: 1.3 }, { label: "214 ", idx: 4, expectedLevel: 3.8 }],
        4: [{ label: "51 ", idx: 0, expectedLevel: 5 }, { label: "51 ", idx: 2, expectedLevel: 1 }],
      }[tone];
      const reps = expectedKps.map(({ label, idx, expectedLevel }) => {
        const hz = plan[idx].hz;
        const actual = 3 + 2 * Math.log(hz / this.pitchEnv.basselineHz) / Math.log(this.pitchEnv.range5);
        const err = Math.abs(actual - expectedLevel) / 5 * 100;
        return { label, hz, actualLevel5: actual, expectedLevel5: expectedLevel, errPct: err, pass: err <= 5 };
      });
      results.push({ tone, keypoints: reps, allPass: reps.every(r => r.pass) });
    }
    return { allPass: results.every(r => r.allPass), results };
  }
}

// ============================================================
// 4. 
// ============================================================
export const dspChild = { TonePitchEnvelope, ChildVoiceDSP, ToneSlideSynthesizer };
export const toneSynth = new ToneSlideSynthesizer();
export default dspChild;
