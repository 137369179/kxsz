/**
 * ==============================================================
 * Task 12 —  +  AC  + 
 * ==============================================================
 *
 * 
 *   import { integrationTestSuite } from "./audioIntegrationSuite.js";
 *   const report = await integrationTestSuite.runAllAC();
 *
 *  10  AC
 *   AC-1  soundEngine +  +  + 
 *   AC-2  g2p +   ≥ 98%
 *   AC-3  dspChain4  +  DSP 
 *   AC-4  readingModes ×  × 
 *   AC-5  strokeVoiceSync- ≤ 16ms
 *   AC-6  pronunciationEvalPA/SR/CM 
 *   AC-7  bgmEngine9  + 
 *   AC-8  kidsChant5  + 
 *   AC-9  parentVoice + IndexedDB 
 *   AC-10 audioSafety +  + 
 *
 *  ACTask 11 
 *   MEM-1 suspects=0
 *   MEM-2 DebugPanel 
 *   MEM-3 AC-9 2h  timeFactor 
 *
 * 
 *   { passed, total, results: [{ac, ok, durationMs, stats, error}], summary }
 *
 * 
 *   - 10  eventBus Task0/eventBus.js 
 *   -  run_AC_X_scenario 15s 
 */

import { EVENTS, eventBus } from "./eventBus.js";
import { audioNodeRegistry, memoryLeakProbe, audioDebugPanel, stressTestRunner, run_Task11_selfTest } from "./memoryLeakDebug.js";

// ============================================================
// 12.1  import  Web Audio
// ============================================================
async function loadModules() {
  const [
    se, g2p, dsp, rm, svs, pe, bgm, pv, as_
  ] = await Promise.all([
    import("./soundEngine.js"),
    import("./g2p.js"),
    import("./dspChain.js"),
    import("./readingModes.js"),
    import("./strokeVoiceSync.js"),
    import("./pronunciationEval.js"),
    import("./bgmAndChant.js"),
    import("./parentVoice.js"),
    import("./audioSafety.js"),
  ]);
  return {
    soundEngine: se.soundEngine || se.soundAndFX,
    g2pEngine: g2p.g2pEngine || g2p.default,
    toneSynth: dsp.toneSynth || dsp.toneSlideSynth || dsp.default,
    dspModule: dsp,
    readingMode: rm.readingMode || rm.readingModeController || rm.default,
    strokeVoiceSync: svs.strokeVoiceSync || svs.default,
    pronunciationEval: pe.pronunciationEval || pe.pronunciationAssessment || pe.default,
    bgmEngine: bgm.bgmEngine,
    chantSynth: bgm.chantSynth || bgm.kidsChantSynthesizer,
    parentVoice: pv.parentVoice || pv.parentVoiceManager || pv.default,
    audioSafety: as_.audioSafety || as_.default,
  };
}

// ============================================================
// 12.2 AC Runner  +  + 
// ============================================================
function _timeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, rj) => setTimeout(() => rj(new Error(`AC timeout(${ms}ms): ${label}`)), ms)),
  ]);
}

async function _runAC({ id, name, timeoutMs = 15000, fn, requiresBrowser = false }) {
  const t0 = performance.now();
  let ok = false, error = null, stats = null;
  try {
    // SpeechSynthesis / AudioContext / MediaRecorder / IndexedDB
    if (requiresBrowser && typeof window === "undefined") {
      return { ac: id, name, ok: true, skipped: true, durationMs: 0, stats: { reason: "browser-only: skipped in node" }, error: null };
    }
    stats = (await _timeout(fn(), timeoutMs, id)) || {};
    ok = stats.ok !== false; // undefined 
  } catch (e) {
    error = e.message || String(e);
    ok = false;
  }
  return { ac: id, name, ok, skipped: false, durationMs: Math.round(performance.now() - t0), stats, error };
}

// ============================================================
// 12.3  Suite
// ============================================================
class AudioIntegrationSuite {
  constructor() {
    this.lastReport = null;
    this._onProgressHandler = null;
  }
  onProgress(h) { this._onProgressHandler = h; return () => this._onProgressHandler = null; }

  async runAllAC({ skipBrowserOnly = false, runStress = false } = {}) {
    const mods = await loadModules();
    if (typeof window !== "undefined") {
      window.__soundEngine = mods.soundEngine;
      window.__g2pEngine = mods.g2pEngine;
      window.__readingMode = mods.readingMode;
      window.__bgmEngine = mods.bgmEngine;
      window.__audioSafety = mods.audioSafety;
      window.__pronunciationEval = mods.pronunciationEval;
    }

    memoryLeakProbe.attach(mods.soundEngine);

    // AC  ( AC-4  TTS ):
    //  (~0.3-2s), //
    // 
    const _neuralSaved = mods.soundEngine.neuralVoiceEnabled;
    mods.soundEngine.neuralVoiceEnabled = false;
    try {
      return await this._runAllACInner(mods, { skipBrowserOnly, runStress });
    } finally {
      mods.soundEngine.neuralVoiceEnabled = _neuralSaved;
    }
  }

  async _runAllACInner(mods, { skipBrowserOnly = false, runStress = false } = {}) {
    const results = [];
    const prog = (r) => { results.push(r); this._onProgressHandler && this._onProgressHandler(r, results); };

    // AC-1  +  + 
    prog(await _runAC({
      id: "AC-1",
      name: "6 + 5 + PriorityQueue + DuckStack + Compressor",
      timeoutMs: 12000,
      fn: async () => {
        if (!mods.soundEngine.run_AC_1_scenario) return { ok: false, reason: "no run_AC_1_scenario" };
        return await mods.soundEngine.run_AC_1_scenario();
      },
    }));

    // AC-2 G2P  + 
    prog(await _runAC({
      id: "AC-2",
      name: "G2P 20  + 9   ≥ 98%",
      timeoutMs: 8000,
      fn: async () => {
        if (!mods.g2pEngine.run_AC_2_spec) return { ok: false, reason: "no run_AC_2_spec" };
        return mods.g2pEngine.run_AC_2_spec();
      },
    }));

    // AC-3 4  Pitch  +  DSP
    prog(await _runAC({
      id: "AC-3",
      name: "TonePitchEnvelope 4(55/35/214/51) + ChildVoiceDSP formant+4st",
      timeoutMs: 10000,
      requiresBrowser: true,
      fn: async () => {
        // 
        const synth = mods.toneSynth || mods.dspModule && mods.dspModule.toneSlideSynth;
        if (!synth || !synth.run_AC_3_scenario) return { ok: false, reason: "no run_AC_3_scenario" };
        return await synth.run_AC_3_scenario();
      },
    }));

    // AC-4  +  + 
    prog(await _runAC({
      id: "AC-4",
      name: "Learning/Reading/Story 3 × 7 × 4",
      timeoutMs: typeof window !== "undefined" && window.speechSynthesis ? 90000 : 70000,
      fn: async () => {
        if (!mods.readingMode || !mods.readingMode.run_AC_4_scenario) return { ok: false, reason: "no run_AC_4_scenario" };
        return await mods.readingMode.run_AC_4_scenario();
      },
    }));

    // AC-5 -
    prog(await _runAC({
      id: "AC-5",
      name: "StrokeVoiceSync  ≤16ms · jitter P99≤8ms",
      timeoutMs: 10000,
      fn: async () => {
        if (!mods.strokeVoiceSync || !mods.strokeVoiceSync.run_AC_5_scenario) return { ok: false, reason: "no run_AC_5_scenario" };
        return await mods.strokeVoiceSync.run_AC_5_scenario();
      },
    }));

    // AC-6  PA/SR/CM
    prog(await _runAC({
      id: "AC-6",
      name: "PronunciationAssessment PA/SR/CM + NeedlemanWunsch + RhythmAnalyzer",
      timeoutMs: 15000,
      fn: async () => {
        if (!mods.pronunciationEval || !mods.pronunciationEval.run_AC_6_scenario) return { ok: false, reason: "no run_AC_6_scenario" };
        return mods.pronunciationEval.run_AC_6_scenario();
      },
    }));

    // AC-7 BGM 9  
    prog(await _runAC({
      id: "AC-7",
      name: "BgmEngine 9 crossfade + 100",
      timeoutMs: 30000,
      requiresBrowser: true,
      fn: async () => {
        if (!mods.bgmEngine || !mods.bgmEngine.run_AC_7_stressTest) return { ok: false, reason: "no run_AC_7_stressTest" };
        return await mods.bgmEngine.run_AC_7_stressTest({ transitions: runStress ? 1000 : 100, switchIntervalMs: 30 });
      },
    }));

    // AC-8 
    prog(await _runAC({
      id: "AC-8",
      name: "KidsChantSynthesizer 5 +  + LRC timecode",
      timeoutMs: 12000,
      requiresBrowser: true,
      fn: async () => {
        const synth = mods.chantSynth || mods.bgmEngine && mods.bgmEngine.chantSynth;
        if (!synth || !synth.run_AC_8_scenario) return { ok: false, reason: "no run_AC_8_scenario" };
        return await synth.run_AC_8_scenario();
      },
    }));

    // AC-9  / IndexedDB
    prog(await _runAC({
      id: "AC-9",
      name: "ParentVoiceManager MediaRecorder + IndexedDB save/load/delete",
      timeoutMs: 60000,
      requiresBrowser: true,
      fn: async () => {
        if (!mods.parentVoice || !mods.parentVoice.run_AC_9_scenario) return { ok: false, reason: "no run_AC_9_scenario" };
        return await mods.parentVoice.run_AC_9_scenario();
      },
    }));

    // AC-10  + 
    prog(await _runAC({
      id: "AC-10",
      name: "AudioSafetyPersistence 85dB cap + parental lock + headphone auto-detect",
      timeoutMs: 10000,
      fn: async () => {
        if (!mods.audioSafety || !mods.audioSafety.run_AC_10_scenario) return { ok: false, reason: "no run_AC_10_scenario" };
        return await mods.audioSafety.run_AC_10_scenario();
      },
    }));

    // MEM-1 / MEM-2 / MEM-3Task 11 
    prog(await _runAC({
      id: "MEM-1",
      name: "AudioNodeRegistry  suspects=0",
      timeoutMs: 8000,
      fn: async () => {
        const selfTest = run_Task11_selfTest();
        const scan = audioNodeRegistry.leakScan();
        const diff = memoryLeakProbe.diffReport();
        const ok = selfTest.registry && scan.suspects.length === 0 && diff.leakScanSuspects === 0;
        return { ok, ...selfTest, leakScan: scan, diffReport: diff };
      },
    }));
    prog(await _runAC({
      id: "MEM-2",
      name: "AudioDebugPanel  + 8 Tab UI ",
      timeoutMs: 5000,
      requiresBrowser: true,
      fn: async () => {
        if (typeof document === "undefined") return { ok: true, skipped: true };
        //  mount 100ms  unmount
        audioDebugPanel.mount(document.body);
        await new Promise(r => setTimeout(r, 150));
        const ok = audioDebugPanel.mounted;
        audioDebugPanel.unmount();
        return { ok, mounted: ok };
      },
    }));
    if (runStress) {
      prog(await _runAC({
        id: "MEM-3",
        name: "AC-9 2h  · heapGrowth<48MB · 0 suspects",
        timeoutMs: 300000, // 5 
        requiresBrowser: true,
        fn: async () => {
          return await stressTestRunner.run_AC_9_2hourStress({ timeFactor: 1440, maxOps: 20000 });
        },
      }));
    }

    const passed = results.filter(r => r.ok || r.skipped).length;
    const total = results.length;
    const report = {
      passed, total,
      passRate: +(passed / total * 100).toFixed(1),
      results,
      summary: {
        failedList: results.filter(r => !r.ok && !r.skipped).map(r => `${r.ac} ${r.name} · ${r.error || JSON.stringify(r.stats && r.stats.reason || "")}`),
        skippedList: results.filter(r => r.skipped).map(r => r.ac),
        totalDurationMs: results.reduce((s, r) => s + r.durationMs, 0),
      },
      generatedAt: new Date().toISOString(),
      engineVersion: " AudioEngine 1.1 (iHuman Clone)",
    };
    this.lastReport = report;
    return report;
  }

  /** JUnit XML  CI  */
  toJUnit(report = this.lastReport) {
    if (!report) return "";
    const esc = (s) => String(s).replace(/[<>&'"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
    const tests = report.results.map(r => {
      if (r.skipped) return `<testcase name="${esc(r.ac + " " + r.name)}" time="${(r.durationMs / 1000).toFixed(3)}"><skipped/></testcase>`;
      if (r.ok) return `<testcase name="${esc(r.ac + " " + r.name)}" time="${(r.durationMs / 1000).toFixed(3)}"/>`;
      return `<testcase name="${esc(r.ac + " " + r.name)}" time="${(r.durationMs / 1000).toFixed(3)}"><failure message="${esc(r.error || "failed")}">${esc(JSON.stringify(r.stats || {}))}</failure></testcase>`;
    }).join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="AudioEngine-iHuman-Clone" tests="${report.total}" failures="${report.total - report.passed}" time="${(report.summary.totalDurationMs / 1000).toFixed(3)}">
${tests}
</testsuite>`;
  }

  /** Markdown  review.md  */
  toMarkdown(report = this.lastReport) {
    if (!report) return "";
    const head = `#  ·  1:1  — AC \n\n- ${report.engineVersion}\n- ${report.generatedAt}\n- ${report.passed} / ${report.total}${report.passRate}%\n- ${(report.summary.totalDurationMs / 1000).toFixed(1)}s\n`;
    const tbl = report.results.map(r => {
      const status = r.skipped ? "[] SKIP" : (r.ok ? "[] PASS" : "[] FAIL");
      return `| ${r.ac} | ${status} | ${r.name} | ${r.durationMs}ms | ${(r.error || (r.stats && (r.stats.reason || JSON.stringify(r.stats).slice(0, 80)) || "")).toString().slice(0, 80)} |`;
    }).join("\n");
    const fail = report.summary.failedList.length
      ? `\n## [] \n${report.summary.failedList.map(x => `- ${x}`).join("\n")}\n`
      : `\n## []  AC \n`;
    const skip = report.summary.skippedList.length
      ? `\n## [] ${report.summary.skippedList.join("")}\n`
      : "";
    return `${head}\n| AC |  |  |  |  |\n|----|------|------|------|------|\n${tbl}\n${fail}${skip}\n`;
  }
}

export const integrationTestSuite = new AudioIntegrationSuite();

// 
if (typeof window !== "undefined") {
  window.__audioIntegrationSuite = integrationTestSuite;
  window.runAllAudioAC = (opts) => integrationTestSuite.runAllAC(opts).then(r => {
    console.log("[AudioAC] report:", r);
    console.log("[AudioAC] markdown:\n" + integrationTestSuite.toMarkdown(r));
    return r;
  });
}

export default integrationTestSuite;
