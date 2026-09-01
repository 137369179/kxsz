/**
 *   BGM  +    (Kids Chant Synthesizer)
 *
 *  soundEngine  BGM  Task 7 + Task 8 
 *  (Task 7)
 *   1.  BGM (map/learn/arcade/story/review/battle/victory/night/silence)
 *   2.  (800ms transition)
 *   3. BGM 100    bgmTimer  1 ()
 *   4.  BPM  + 
 *  (Task 8)
 *   1. C D E G A 1=C
 *   2. 5  /  /  /  / 
 *   3.  kick  + 2/4  woodblock  + 
 *   4. onWord(startMs, endMs, text, toneIdx) 
 *   5.  soundEngine.bgmGain 
 */

import { soundAndFX } from "./soundEngine.js";

// ============================================================
// 0. 
// ============================================================
const NOTE_HZ = (() => {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const m = {};
  const A4 = 440;
  for (let oct = 1; oct <= 6; oct++) {
    for (let i = 0; i < 12; i++) {
      const semisFromA4 = (oct - 4) * 12 + (i - 9);
      const hz = A4 * Math.pow(2, semisFromA4 / 12);
      m[names[i] + oct] = Math.round(hz * 100) / 100;
    }
  }
  return m;
})();

/** / +    Hz
 *  pentatonic 1=C D E G A  solfège Do Re Mi Sol La
 */
const SOLFEGE_TO_SEMITONE = { "1": 0, "2": 2, "3": 4, "4": 5, "5": 7, "6": 9, "7": 11, "0": -1 };
function solfegeToHz(solfege, base = "C4") {
  if (solfege === "0" || !solfege) return 0;  // 
  const baseHz = NOTE_HZ[base];
  const st = SOLFEGE_TO_SEMITONE[solfege] ?? 0;
  let finalSt = st;
  // '.'  =   ','  = 
  if (solfege.includes(".")) finalSt += 12;
  if (solfege.includes(",")) finalSt -= 12;
  const clean = solfege.replace(/[.,]/g, "");
  if (SOLFEGE_TO_SEMITONE[clean] == null) return 0;
  return Math.round(baseHz * Math.pow(2, SOLFEGE_TO_SEMITONE[clean] / 12) *
                    (solfege.includes(".") ? 2 : 1) * (solfege.includes(",") ? 0.5 : 1) * 100) / 100;
}

// ============================================================
// 1. BGM 9  + 
// ============================================================
export const BGM_SCENES = Object.freeze({
  map:     { label: "大地图漫游", bpm: 90,  defaultVolume: 0.45, color: "emerald" },
  learn:   { label: "五步教学流", bpm: 78,  defaultVolume: 0.38, color: "amber" },
  arcade:  { label: "太空游乐场", bpm: 140, defaultVolume: 0.42, color: "purple" },
  story:   { label: "绘本伴读馆", bpm: 60,  defaultVolume: 0.32, color: "sky" },
  review:  { label: "艾宾浩斯复习", bpm: 72,  defaultVolume: 0.35, color: "teal" },
  battle:  { label: "Boss对决竞技场", bpm: 150, defaultVolume: 0.44, color: "rose" },
  victory: { label: "胜利大通关", bpm: 110, defaultVolume: 0.50, color: "yellow" },
  night:   { label: "夜间护眼休眠", bpm: 48,  defaultVolume: 0.25, color: "indigo" },
  silence: { label: "静音模式", bpm: 0,   defaultVolume: 0.0,  color: "slate" },
});

export class BgmEngine {
  constructor() {
    this.bpmOverride = null;
  }
  setBpm(bpm) { this.bpmOverride = bpm; }

  /** 获取场景列表 */
  listScenes() { return Object.entries(BGM_SCENES).map(([k, v]) => ({ key: k, ...v })); }

  /** 切换场景 BGM */
  switchScene(nameKey) {
    if (!BGM_SCENES[nameKey]) return null;
    soundAndFX.playBGM(nameKey);
    return { key: nameKey, scene: BGM_SCENES[nameKey] };
  }

  /**
   * 压力测试
   */
  async run_AC_7_stressTest({ transitions = 100, switchIntervalMs = 40 } = {}) {
    const scenes = Object.keys(BGM_SCENES).filter(k => k !== "silence");
    soundAndFX.init();
    soundAndFX.stopBGM();
    const snapshots = [];
    const errors = [];
    for (let i = 0; i < transitions; i++) {
      const pick = scenes[Math.floor(Math.random() * scenes.length)];
      soundAndFX.playBGM(pick);
      await new Promise(r => setTimeout(r, switchIntervalMs));
      const snap = soundAndFX.getBusSnapshot();
      const active = soundAndFX.activeBgmTimerCount;
      snapshots.push(active);
      if (active > 1) errors.push(`iter=${i} activeTimers=${active} > 1`);
    }
    await new Promise(r => setTimeout(r, 2000));
    const finalActive = soundAndFX.activeBgmTimerCount;
    const maxConcurrent = snapshots.reduce((m, x) => Math.max(m, x), 0);
    soundAndFX.stopBGM();
    const pass = maxConcurrent <= 1 && finalActive <= 1 && errors.length === 0;
    return { pass, transitions, maxConcurrent, finalActive,
             duringDist: distribution(snapshots), errors };
  }
}

function distribution(arr) {
  const d = {};
  for (const v of arr) d[v] = (d[v] || 0) + 1;
  return d;
}

// ============================================================
// 2. 经典童谣识字快板与旋律
// ============================================================

const CLASSIC_CHANTS = {
  twinkle: {
    name: "小星星 (识字韵律版)",
    bpm: 88,
    timeSig: "4/4",
    baseKey: "C4",
    // 1 1 5 5 6 6 5 - | 4 4 3 3 2 2 1 - | ...
    melody: [
      {sol:"1", beats:1, lyric:"一", tone:1}, {sol:"1", beats:1, lyric:"闪", tone:3},
      {sol:"5", beats:1, lyric:"一", tone:1}, {sol:"5", beats:1, lyric:"闪", tone:3},
      {sol:"6", beats:1, lyric:"亮", tone:4}, {sol:"6", beats:1, lyric:"晶", tone:1},
      {sol:"5", beats:2, lyric:"晶", tone:1},
      {sol:"4", beats:1, lyric:"满", tone:3}, {sol:"4", beats:1, lyric:"天", tone:1},
      {sol:"3", beats:1, lyric:"都", tone:1}, {sol:"3", beats:1, lyric:"是", tone:4},
      {sol:"2", beats:1, lyric:"小", tone:3}, {sol:"2", beats:1, lyric:"星", tone:1},
      {sol:"1", beats:2, lyric:"星", tone:1},
      {sol:"5", beats:1, lyric:"挂", tone:4}, {sol:"5", beats:1, lyric:"在", tone:4},
      {sol:"6", beats:1, lyric:"天", tone:1}, {sol:"6", beats:1, lyric:"上", tone:1},
      {sol:"5", beats:2, lyric:"放", tone:4},
      {sol:"4", beats:1, lyric:"光", tone:1}, {sol:"4", beats:1, lyric:"明", tone:2},
      {sol:"3", beats:1, lyric:"好", tone:4}, {sol:"3", beats:1, lyric:"像", tone:3},
      {sol:"2", beats:1, lyric:"许", tone:1}, {sol:"2", beats:1, lyric:"多", tone:3},
      {sol:"1", beats:2, lyric:"眼", tone:3},
    ],
    chordPerBar: [["1","3","5"], ["1","3","5"], ["5","7","2."], ["5","7","2."],
                  ["1","3","5"], ["5","7","2."], ["1","3","5"]],
  },
  tigers: {
    name: "两只老虎 (生字快板)",
    bpm: 108,
    timeSig: "4/4",
    baseKey: "C4",
    melody: [
      {sol:"1", beats:1, lyric:"两", tone:3}, {sol:"2", beats:1, lyric:"只", tone:1},
      {sol:"3", beats:1, lyric:"老", tone:3}, {sol:"1", beats:1, lyric:"虎", tone:3},
      {sol:"1", beats:1, lyric:"两", tone:3}, {sol:"2", beats:1, lyric:"只", tone:1},
      {sol:"3", beats:1, lyric:"老", tone:3}, {sol:"1", beats:1, lyric:"虎", tone:3},
      {sol:"3", beats:1, lyric:"跑", tone:3}, {sol:"4", beats:1, lyric:"得", tone:2},
      {sol:"5", beats:2, lyric:"快", tone:4},
      {sol:"3", beats:1, lyric:"跑", tone:3}, {sol:"4", beats:1, lyric:"得", tone:2},
      {sol:"5", beats:2, lyric:"快", tone:4},
      {sol:"5", beats:0.5, lyric:"一", tone:1}, {sol:"6", beats:0.5, lyric:"只", tone:1},
      {sol:"5", beats:0.5, lyric:"没", tone:2}, {sol:"4", beats:0.5, lyric:"有", tone:3},
      {sol:"3", beats:1, lyric:"耳", tone:3}, {sol:"1", beats:1, lyric:"朵", tone:4},
      {sol:"5", beats:0.5, lyric:"一", tone:1}, {sol:"6", beats:0.5, lyric:"只", tone:1},
      {sol:"5", beats:0.5, lyric:"没", tone:2}, {sol:"4", beats:0.5, lyric:"有", tone:3},
      {sol:"3", beats:1, lyric:"尾", tone:3}, {sol:"1", beats:1, lyric:"巴", tone:1},
      {sol:"1", beats:1, lyric:"真", tone:1}, {sol:"2", beats:1, lyric:"奇", tone:2},
      {sol:"1", beats:2, lyric:"怪", tone:4},
    ],
    chordPerBar: [["1","3","5"], ["1","3","5"], ["5","7","2."], ["5","7","2."], ["1","3","5"], ["1","3","5"]],
  },
  friends: {
    name: "找朋友 (汉字对对碰)",
    bpm: 120,
    timeSig: "2/4",
    baseKey: "C4",
    melody: [
      {sol:"5", beats:1, lyric:"找", tone:3}, {sol:"5", beats:1, lyric:"呀", tone:4},
      {sol:"5", beats:1, lyric:"找", tone:3}, {sol:"3", beats:1, lyric:"朋", tone:4},
      {sol:"5", beats:1, lyric:"友", tone:3}, {sol:"5", beats:1, lyric:"找", tone:2},
      {sol:"3", beats:1, lyric:"到", tone:1}, {sol:"2", beats:1, lyric:"一", tone:3},
      {sol:"1", beats:1, lyric:"个", tone:4}, {sol:"2", beats:1, lyric:"好", tone:4},
      {sol:"3", beats:1, lyric:"朋", tone:3}, {sol:"5", beats:1, lyric:"友", tone:4},
      {sol:"1", beats:1, lyric:"敬", tone:4}, {sol:"2", beats:1, lyric:"个", tone:4},
      {sol:"3", beats:1, lyric:"礼", tone:3}, {sol:"5", beats:1, lyric:"呀", tone:4},
      {sol:"5", beats:1, lyric:"握", tone:3}, {sol:"3", beats:1, lyric:"握", tone:4},
      {sol:"2", beats:1, lyric:"手", tone:3}, {sol:"1", beats:1, lyric:"好", tone:1},
      {sol:"1", beats:2, lyric:"友", tone:3},
    ],
    chordPerBar: [["1","3","5"], ["5","7","2."], ["1","3","5"], ["5","7","2."], ["1","3","5"]],
  },
  radish: {
    name: "拔萝卜 (勤劳小儿歌)",
    bpm: 96,
    timeSig: "4/4",
    baseKey: "D4",
    melody: [
      {sol:"5", beats:1, lyric:"拔", tone:2}, {sol:"3", beats:1, lyric:"萝", tone:2},
      {sol:"5", beats:1, lyric:"卜", tone:4}, {sol:"3", beats:1, lyric:"拔", tone:4},
      {sol:"5", beats:1, lyric:"萝", tone:1}, {sol:"5", beats:1, lyric:"卜", tone:1},
      {sol:"2", beats:1, lyric:"嘿", tone:1}, {sol:"3", beats:1, lyric:"呦", tone:1},
      {sol:"1", beats:2, lyric:"嘿", tone:4},
      {sol:"5", beats:1, lyric:"呦", tone:4}, {sol:"5", beats:1, lyric:"拔", tone:2},
      {sol:"6", beats:1, lyric:"不", tone:4}, {sol:"5", beats:1, lyric:"动", tone:2},
      {sol:"1.", beats:2, lyric:"呀", tone:2},
    ],
    chordPerBar: [["1","3","5"], ["5","7","2."], ["1","3","5"], ["5","7","2."], ["1","3","5"]],
  },
  newYear: {
    name: "新年好 (快乐识字歌)",
    bpm: 120,
    timeSig: "3/4",
    baseKey: "C4",
    melody: [
      {sol:"1", beats:1, lyric:"新", tone:1}, {sol:"1", beats:1, lyric:"年", tone:2},
      {sol:"1", beats:1, lyric:"好", tone:3},
      {sol:"1", beats:1, lyric:"呀", tone:5}, {sol:"1", beats:1, lyric:"新", tone:1},
      {sol:"1", beats:1, lyric:"年", tone:2}, {sol:"5", beats:1, lyric:"好", tone:3},
      {sol:",,5", beats:1, lyric:"呀", tone:5},
      {sol:"1", beats:1, lyric:"祝", tone:1}, {sol:"3", beats:1, lyric:"贺", tone:2},
      {sol:"5", beats:1, lyric:"大", tone:4},
      {sol:"3", beats:1, lyric:"家", tone:4}, {sol:"2", beats:1, lyric:"新", tone:4},
      {sol:"1", beats:1, lyric:"年", tone:1}, {sol:"2", beats:1, lyric:"好", tone:1},
      {sol:"3", beats:2, lyric:"呀", tone:2},
    ],
    chordPerBar: [["1","3","5"], ["5","7","2."], ["1","3","5"], ["5","7","2."], ["1","3","5"]],
  },
};

export class KidsChantSynthesizer {
  constructor() {}

  /**  */
  listSongs() {
    return Object.entries(CLASSIC_CHANTS).map(([k, v]) => ({
      id: k,
      name: v.name,
      bpm: v.bpm,
      timeSignature: v.timeSig,
      durationSeconds: Math.ceil(v.melody.reduce((s, n) => s + n.beats, 0) * 60 / v.bpm),
      lyricsPreview: v.melody.slice(0, 6).map(n => n.lyric).join(""),
    }));
  }

  /**
   * 
   * @param {string} songId  id in CLASSIC_CHANTS
   * @param {{onWord?:(info:{wordStartMs:number, wordEndMs:number, text:string, tone:number, index:number})=>void,
   *          onEnd?:()=>void, volume?:number}} opts
   * @returns {{stop:Function, promise:Promise}}
   */
  play(songId, opts = {}) {
    soundAndFX.init();
    const ctx = soundAndFX.audioCtx;
    const song = CLASSIC_CHANTS[songId];
    if (!song) throw new Error("unknown chant " + songId);

    const tickSec = 60 / song.bpm;   // 1 beat = 1 tick
    const now0 = ctx.currentTime + 0.15; // start 

    const gain = ctx.createGain();
    gain.gain.value = (opts.volume ?? 0.4) * 1.0;
    gain.connect(soundAndFX.bgmGain || soundAndFX.masterGain);

    let scheduledEndT = now0;
    // A. : 
    let t = now0;
    let cumulativeBeats = 0;
    const barIdxForBeat = () => {
      const beatsPerBar = parseInt(song.timeSig, 10) || 4;
      return Math.min(song.chordPerBar.length - 1, Math.floor(cumulativeBeats / beatsPerBar));
    };
    for (let i = 0; i < song.melody.length; i++) {
      const note = song.melody[i];
      const dur = note.beats * tickSec;
      const hz = solfegeToHz(note.sol.replace(/^,+/, "").replace(/,+$/, ""), song.baseKey);
      if (hz > 0) {
        const osc = ctx.createOscillator();
        const ag = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(hz, t);
        ag.gain.setValueAtTime(0, t);
        ag.gain.linearRampToValueAtTime(0.22, t + 0.02);
        ag.gain.setValueAtTime(0.22, t + dur * 0.8);
        ag.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(ag); ag.connect(gain);
        osc.start(t); osc.stop(t + dur + 0.02);
      }
      //  (lyric sync)
      if (opts.onWord) {
        const wordStartMs = (t - now0) * 1000;
        const wordEndMs = (t + dur - now0) * 1000;
        const index = i;
        const payload = { wordStartMs, wordEndMs, text: note.lyric, tone: note.tone || 0, index };
        setTimeout(() => { try { opts.onWord(payload); } catch {} }, Math.max(0, wordStartMs));
      }
      t += dur;
      cumulativeBeats += note.beats;
    }
    scheduledEndT = t;

    // B.  Kick + Woodblock + 
    let kickT = now0;
    let beat = 0;
    const beatsPerBar = parseInt(song.timeSig, 10) || 4;
    const totalBeats = song.melody.reduce((s, n) => s + n.beats, 0);
    let chordBeatCursor = 0;
    while (chordBeatCursor < totalBeats + 0.1) {
      // Kick on first of bar
      if (beat % beatsPerBar === 0) this._kick(ctx, gain, kickT);
      // Woodblock on sub-beats
      if (beat % 2 === 1) this._woodblock(ctx, gain, kickT + tickSec * 0.5);
      // Chord at start of each bar (first 3 beats hold)
      if (beat % beatsPerBar === 0) {
        const barIdx = Math.min(song.chordPerBar.length - 1, Math.floor(beat / beatsPerBar));
        const chordNotes = song.chordPerBar[barIdx] || ["1","3","5"];
        const hold = beatsPerBar * tickSec * 0.9;
        this._chordPad(ctx, gain, kickT, chordNotes, song.baseKey, hold);
      }
      beat += 1;
      kickT += tickSec;
      chordBeatCursor += 1;
    }
    scheduledEndT = Math.max(scheduledEndT, kickT);

    // stop + promise
    let stopped = false;
    const stopFn = () => {
      if (stopped) return; stopped = true;
      try { gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.3); } catch {}
      setTimeout(() => { try { gain.disconnect(); } catch {} }, 400);
      if (opts.onEnd) try { opts.onEnd(); } catch {}
    };
    const promise = new Promise((res) => {
      const ms = (scheduledEndT - now0 + 0.5) * 1000;
      setTimeout(() => { stopFn(); res(); }, ms);
    });

    return { stop: stopFn, promise, durationMs: Math.round((scheduledEndT - now0) * 1000) };
  }

  _kick(ctx, out, t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.2);
  }

  _woodblock(ctx, out, t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(2800, t);
    o.frequency.exponentialRampToValueAtTime(1800, t + 0.04);
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.07);
  }

  _chordPad(ctx, out, t, solfegeList, baseKey, hold) {
    for (const s of solfegeList) {
      const hz = solfegeToHz(s, baseKey);
      if (!hz) continue;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(hz, t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.07, t + 0.05);
      g.gain.setValueAtTime(0.07, t + hold * 0.7);
      g.gain.exponentialRampToValueAtTime(0.001, t + hold);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + hold + 0.05);
    }
  }

  /**
   * Task 8 AC-8 5    +  ≥ 10s
   */
  async run_AC_8_scenario() {
    soundAndFX.init();
    const ids = Object.keys(CLASSIC_CHANTS);
    const results = [];
    for (const id of ids) {
      try {
        const { promise, durationMs } = this.play(id, { volume: 0.001 });
        await new Promise(r => setTimeout(r, 120));  //  120ms
        // 
        promise.catch(() => {});
        results.push({ id, name: CLASSIC_CHANTS[id].name, durationMs, pass: durationMs >= 10000 });
      } catch (e) {
        results.push({ id, name: CLASSIC_CHANTS[id].name, pass: false, error: String(e.message || e) });
      }
    }
    return { allPass: results.every(r => r.pass), results };
  }
}

// ============================================================
// 
// ============================================================
export const bgmEngine = new BgmEngine();
export const chantSynth = new KidsChantSynthesizer();
export default { bgmEngine, chantSynth };
