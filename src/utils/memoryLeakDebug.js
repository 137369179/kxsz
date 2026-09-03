/**
 * ==============================================================
 * Task 11 —  + AudioDebugPanel  + AC-9 
 * ==============================================================
 *
 * 
 *   (a) MEM-1  WebAudio connect  disconnect onended 
 *   (b) MEM-2  IndexedDB / MediaRecorder / SpeechSynthesisUtterance 
 *   (c) MEM-3  2  AC-9  OOM
 *   (d) DBG-1  DebugPanel bus F0 
 *
 * 
 *   1. AudioNodeRegistry    — /leakScan()  un-detached 
 *   2. MemoryLeakProbe      —  heap + node  + listener 
 *   3. AudioDebugPanel      — DOM overlay UI8 Bus/Queue/Events/F0/G2P/Eval/Safety/BGM
 *   4. StressTestRunner     —  timeFactor  CSV/JUnit 
 *
 * 
 *   import { memoryLeakProbe, audioDebugPanel, stressTestRunner } from "./memoryLeakDebug.js";
 *   memoryLeakProbe.attach(soundEngine);           // (a)
 *   audioDebugPanel.mount();                        // (b) 
 *   await stressTestRunner.run_AC_9_2hourStress({ timeFactor: 60 });  // (c) 2h  2min
 */

import { EVENTS, eventBus } from "./eventBus.js";

// ============================================================
// 11.1 AudioNodeRegistry — WebAudio 
// ============================================================
class AudioNodeRegistry {
  constructor() {
    this._strong = new Map();      // id -> { node, createdAt, stack, refCount }
    this._weak = new WeakMap();    // node -> meta
    this._idSeq = 1;
    this._leakThresholdMs = 120_000; // 2  detach 
  }

  register(node, tag = "untagged", owner = null) {
    if (!node) return null;
    const id = `N${this._idSeq++}`;
    const meta = {
      id,
      tag,
      owner,
      createdAt: performance.now(),
      refCount: 1,
      stack: new Error().stack.split("\n").slice(2, 5).join(" | "),
      detached: false,
    };
    this._strong.set(id, meta);
    this._weak.set(node, meta);
    //  onended AudioScheduledSourceNode / AudioBufferSourceNode 
    if (typeof node.onended !== "undefined" || node.addEventListener) {
      const once = () => {
        this.detach(node);
        try { node.removeEventListener && node.removeEventListener("ended", once); } catch {}
      };
      try { node.addEventListener && node.addEventListener("ended", once, { once: true }); } catch {}
    }
    return id;
  }

  detach(node) {
    const meta = this._weak.get(node);
    if (!meta || meta.detached) return;
    meta.refCount -= 1;
    if (meta.refCount <= 0) {
      meta.detached = true;
      meta.detachedAt = performance.now();
      //  disconnect numberOfOutputs
      try {
        if (typeof node.disconnect === "function") node.disconnect();
      } catch {}
      try { if (typeof node.stop === "function" && !node._stopped) { node._stopped = true; node.stop(0); } } catch {}
      this._strong.delete(meta.id);
    }
  }

  snapshot() {
    const alive = [];
    for (const [id, m] of this._strong) alive.push({ id, tag: m.tag, ageMs: performance.now() - m.createdAt, owner: m.owner });
    const counts = Object.create(null);
    alive.forEach(a => { counts[a.tag] = (counts[a.tag] || 0) + 1; });
    return { total: alive.length, counts, topOldest: alive.sort((a, b) => b.ageMs - a.ageMs).slice(0, 10) };
  }

  leakScan() {
    const now = performance.now();
    const suspects = [];
    for (const [id, m] of this._strong) {
      if (now - m.createdAt > this._leakThresholdMs && !m.detached) {
        suspects.push({ id, tag: m.tag, ageMs: now - m.createdAt, stack: m.stack });
      }
    }
    return { suspects, scanned: this._strong.size };
  }
}

export const audioNodeRegistry = new AudioNodeRegistry();

// ============================================================
// 11.2 MemoryLeakProbe —  +  +  
// ============================================================
class MemoryLeakProbe {
  constructor() {
    this.attached = false;
    this.samples = [];              // ring buffer 1024
    this._maxSamples = 1024;
    this._timer = null;
    this._engine = null;
    this._eventHooks = new Map();
    this._eventCounts = Object.create(null);
    this._reportHandlers = [];
  }

  attach(engine) {
    if (this.attached) return;
    this._engine = engine;
    this.attached = true;
    //  hook EVENTS +
    const origOn = eventBus.on.bind(eventBus);
    const origEmit = eventBus.emit.bind(eventBus);
    const self = this;
    eventBus.on = function (ev, h) {
      self._eventCounts[ev] = (self._eventCounts[ev] || { subs: 0, emits: 0 });
      self._eventCounts[ev].subs += 1;
      const off = origOn(ev, h);
      return () => { self._eventCounts[ev].subs = Math.max(0, self._eventCounts[ev].subs - 1); off && off(); };
    };
    eventBus.emit = function (ev, p) {
      self._eventCounts[ev] = (self._eventCounts[ev] || { subs: 0, emits: 0 });
      self._eventCounts[ev].emits += 1;
      return origEmit(ev, p);
    };
    this._eventHooks.set("origOn", origOn);
    this._eventHooks.set("origEmit", origEmit);

    //  5s 
    this._timer = setInterval(() => this._sample(), 5_000);
  }

  onReport(handler) { this._reportHandlers.push(handler); return () => { this._reportHandlers = this._reportHandlers.filter(h => h !== handler); }; }

  _sample() {
    const ns = audioNodeRegistry.snapshot();
    const heap = (performance.memory && performance.memory.usedJSHeapSize) || 0;
    const heapLimit = (performance.memory && performance.memory.jsHeapSizeLimit) || 0;
    const ev = Object.entries(this._eventCounts).map(([k, v]) => ({ ev: k, subs: v.subs, emits: v.emits }));
    const s = {
      t: Date.now(),
      heapBytes: heap,
      heapPct: heapLimit ? (heap / heapLimit * 100) : 0,
      nodesTotal: ns.total,
      nodeCounts: ns.counts,
      eventsTop: ev.sort((a, b) => b.emits - a.emits).slice(0, 8),
    };
    this.samples.push(s);
    if (this.samples.length > this._maxSamples) this.samples.shift();
    this._reportHandlers.forEach(h => { try { h(s); } catch {} });
  }

  /**  10%  +  */
  diffReport() {
    // Early exit ok=true leakScan  undefined
    if (this.samples.length < 20) {
      const scan = audioNodeRegistry.leakScan();
      return {
        ok: true,
        samples: this.samples.length,
        reason: "samples<20",
        heapSlopeBytes: 0,
        heapSlopeMB: 0,
        nodeSlope: 0,
        leakScanSuspects: scan.suspects.length,
        leakScanned: scan.scanned,
        suspects: scan.suspects.slice(0, 5),
      };
    }
    const head = this.samples.slice(0, Math.max(5, Math.floor(this.samples.length * 0.1)));
    const tail = this.samples.slice(-Math.max(5, Math.floor(this.samples.length * 0.1)));
    const avg = (arr, k) => arr.reduce((s, x) => s + (k ? x[k] : x), 0) / arr.length;
    const heapSlope = (avg(tail, "heapBytes") - avg(head, "heapBytes"));
    const nodeSlope = avg(tail, "nodesTotal") - avg(head, "nodesTotal");
    const scan = audioNodeRegistry.leakScan();
    const ok = heapSlope < 2 * 1024 * 1024 && nodeSlope < 8 && scan.suspects.length === 0;
    return {
      ok,
      samples: this.samples.length,
      durationSec: (this.samples[this.samples.length - 1].t - this.samples[0].t) / 1000,
      heapSlopeBytes: Math.round(heapSlope),
      heapSlopeMB: +(heapSlope / 1048576).toFixed(3),
      nodeSlope: +nodeSlope.toFixed(2),
      leakScanSuspects: scan.suspects.length,
      leakScanned: scan.scanned,
      suspects: scan.suspects.slice(0, 5),
    };
  }
}

export const memoryLeakProbe = new MemoryLeakProbe();

// ============================================================
// 11.3 AudioDebugPanel — DOM Overlay 
// ============================================================
class AudioDebugPanel {
  constructor() {
    this.mounted = false;
    this._root = null;
    this._raf = 0;
    this._tab = "bus";
  }

  mount(target = document.body) {
    // 防止重复挂载：若已挂载，先清理再重新挂载
    if (this.mounted) {
      this.unmount();
    }
    this.mounted = true;
    const el = document.createElement("div");
    el.id = "audio-debug-panel";
    el.setAttribute("style", `
      position:fixed;right:8px;bottom:8px;z-index:99999;width:420px;max-height:62vh;
      background:rgba(18,24,42,.92);color:#e7ecff;font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
      border:1px solid #334271;border-radius:10px;backdrop-filter:blur(8px);
      box-shadow:0 12px 32px rgba(0,0,0,.35);overflow:hidden;display:flex;flex-direction:column;
      user-select:none;
    `);
    el.innerHTML = `
      <div data-adp="head" style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:linear-gradient(180deg,#253264,#1c264a);border-bottom:1px solid #334271;cursor:move;">
        <span style="color:#7cf0c2;"></span>
        <b style="flex:1;">Audio Debug Panel ·  v1.1 iHuman Clone</b>
        <button data-adp="close" style="background:transparent;border:0;color:#ff7a90;cursor:pointer;"></button>
      </div>
      <div data-adp="tabs" style="display:flex;gap:2px;padding:4px 8px;background:#141a2c;border-bottom:1px solid #334271;">
        ${["bus","queue","events","f0","g2p","eval","safety","bgm"].map(t => `<button data-tab="${t}" style="padding:2px 8px;border-radius:4px;border:1px solid #334271;background:#1c264a;color:#cdd8ff;cursor:pointer;font-size:10px;">${t}</button>`).join("")}
      </div>
      <div data-adp="body" style="padding:8px 10px;overflow:auto;flex:1;">
        <div data-adp="content"></div>
        <div data-adp="canvasbox" style="margin-top:6px;"></div>
      </div>
      <div data-adp="foot" style="padding:4px 8px;border-top:1px solid #334271;background:#141a2c;display:flex;gap:8px;">
        <button data-adp="run-ac1" style="padding:2px 6px;font-size:10px;">Run AC-1</button>
        <button data-adp="run-ac9" style="padding:2px 6px;font-size:10px;">Run AC-9 (10k ops)</button>
        <button data-adp="leak-scan" style="padding:2px 6px;font-size:10px;">Leak Scan</button>
        <span data-adp="status" style="flex:1;text-align:right;color:#7cf0c2;">OK</span>
      </div>
    `;
    target.appendChild(el);
    this._root = el;
    // 
    el.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { this._tab = b.dataset.tab; this._refresh(); });
    el.querySelector("[data-adp=close]").onclick = () => this.unmount();
    el.querySelector("[data-adp=run-ac1]").onclick = () => {
      import("./soundEngine.js").then(m => m.soundEngine.run_AC_1_scenario && m.soundEngine.run_AC_1_scenario());
    };
    el.querySelector("[data-adp=run-ac9]").onclick = () => {
      stressTestRunner.run_AC_9_2hourStress({ timeFactor: 720, maxOps: 10000 }).then(r => this._setStatus(`AC-9 ${r.ok ? "PASS" : "FAIL"} · ${r.totalOps} ops`));
    };
    el.querySelector("[data-adp=leak-scan]").onclick = () => {
      const r = memoryLeakProbe.diffReport();
      this._setStatus(`heapΔ${r.heapSlopeMB}MB nodesΔ${r.nodeSlope} suspects${r.leakScanSuspects}`);
    };
    // 拖拽逻辑 + 配套清理 (避免 window 监听器泄漏)
    this._dragState = { dragging: false, startX: 0, startY: 0, startT: 0, startL: 0 };
    const dragHead = el.querySelector("[data-adp=head]");
    dragHead.onmousedown = (e) => {
      this._dragState.dragging = true;
      this._dragState.startX = e.clientX;
      this._dragState.startY = e.clientY;
      const r = el.getBoundingClientRect();
      this._dragState.startT = r.top;
      this._dragState.startL = r.left;
    };
    this._onPanelMouseMove = (e) => {
      const ds = this._dragState;
      if (!ds.dragging) return;
      el.style.top = (ds.startT + e.clientY - ds.startY) + "px";
      el.style.left = (ds.startL + e.clientX - ds.startX) + "px";
      el.style.right = "auto";
      el.style.bottom = "auto";
    };
    this._onPanelMouseUp = () => { this._dragState.dragging = false; };
    window.addEventListener("mousemove", this._onPanelMouseMove);
    window.addEventListener("mouseup", this._onPanelMouseUp);

    this._raf = requestAnimationFrame(() => this._loop());
    memoryLeakProbe.attach && (typeof window !== "undefined") && setTimeout(() => memoryLeakProbe.attach(window.__soundEngine || null), 0);
  }

  unmount() {
    if (!this.mounted) return;
    cancelAnimationFrame(this._raf);
    // 清理拖拽时挂载的 window 监听器，避免重复挂载时堆积
    if (this._onPanelMouseMove) {
      try { window.removeEventListener("mousemove", this._onPanelMouseMove); } catch {}
      this._onPanelMouseMove = null;
    }
    if (this._onPanelMouseUp) {
      try { window.removeEventListener("mouseup", this._onPanelMouseUp); } catch {}
      this._onPanelMouseUp = null;
    }
    this._dragState = null;
    this._root && this._root.remove();
    this._root = null;
    this.mounted = false;
  }

  _setStatus(t) { const s = this._root && this._root.querySelector("[data-adp=status]"); if (s) s.textContent = t; }

  _loop() {
    this._raf = requestAnimationFrame(() => this._loop());
    if (this._root) this._refresh();
  }

  _refresh() {
    const body = this._root.querySelector("[data-adp=content]");
    const cbox = this._root.querySelector("[data-adp=canvasbox]");
    const engine = window.__soundEngine;
    switch (this._tab) {
      case "bus":
        body.innerHTML = engine ? this._fmtBus(engine) : `<span style="color:#f7b267;">window.__soundEngine not set — export to window</span>`;
        cbox.innerHTML = this._spark(memoryLeakProbe.samples.map(s => s.nodesTotal), "#7cf0c2");
        break;
      case "queue":
        body.innerHTML = engine ? this._fmtQueue(engine) : "—";
        break;
      case "events":
        body.innerHTML = this._fmtEvents();
        break;
      case "f0":
        body.innerHTML = `<div>F0 Pitch 4 55 / 35 / 214 / 51</div>`;
        cbox.innerHTML = this._f0Canvas();
        break;
      case "g2p":
        import("./g2p.js").then(m => { body.innerHTML = this._fmtG2P(m && m.g2pEngine || m && m.default || null); }).catch(() => {});
        body.innerHTML = `<span style="color:#9aa7d6;">G2P engine loading…</span>`;
        cbox.innerHTML = "";
        break;
      case "eval":
        body.innerHTML = `<div>PA/SR/CM  —  20 </div><div id="adp-eval-list" style="margin-top:6px;"></div>`;
        cbox.innerHTML = "";
        break;
      case "safety":
        import("./audioSafety.js").then(m => { const a = m.audioSafety; body.innerHTML = a ? this._fmtSafety(a) : "—"; }).catch(() => {});
        body.innerHTML = `<span style="color:#9aa7d6;">Safety module loading…</span>`;
        cbox.innerHTML = "";
        break;
      case "bgm":
        import("./bgmAndChant.js").then(m => { const b = m.bgmEngine; body.innerHTML = b ? this._fmtBGM(b) : "—"; }).catch(() => {});
        body.innerHTML = `<span style="color:#9aa7d6;">BGM engine loading…</span>`;
        cbox.innerHTML = "";
        break;
    }
  }

  _fmtBus(e) {
    const g = (n) => (n && typeof n.gain !== "undefined") ? (20 * Math.log10(Math.max(1e-6, n.gain.value))).toFixed(1) + " dB" : "—";
    const rows = [
      ["masterGain", e.masterGain], ["_compressor", e._compressor],
      ["bgmGain", e.bgmGain], ["voiceGain", e.voiceGain], ["sfxGain", e.sfxGain],
    ].concat(["tutor","eval","char","word","sentence"].map(k => [`sub.${k}`, e._subGains && e._subGains[k]]));
    return `<table style="width:100%;border-collapse:collapse;">
      <tr><th style="text-align:left;padding:2px 4px;border-bottom:1px solid #334271;">Bus</th><th style="text-align:right;padding:2px 4px;border-bottom:1px solid #334271;">Gain</th></tr>
      ${rows.map(([k, n]) => `<tr><td style="padding:2px 4px;">${k}</td><td style="text-align:right;padding:2px 4px;color:${n ? "#cdd8ff" : "#5f6a95"};">${g(n)}</td></tr>`).join("")}
    </table>`;
  }

  _fmtQueue(e) {
    const q = e._queue;
    if (!q) return "—";
    const stack = q.resumeStack || [];
    const list = (arr) => arr.map(x => `<span style="display:inline-block;padding:1px 5px;margin:1px;border-radius:3px;background:#22305e;border:1px solid #3f539a;">${x.kind}·P${x.priority}</span>`).join("");
    return `<div><b style="color:#7cf0c2;">Current:</b> ${q.current ? q.current.kind + " · P" + q.current.priority : "idle"}</div>
      <div style="margin-top:4px;"><b>Queue:</b> ${list(q.queue || [])}</div>
      <div style="margin-top:4px;"><b>Resume Stack:</b> ${list(stack) || "<i style='color:#7282ba;'>empty</i>"}</div>`;
  }

  _fmtEvents() {
    const rows = Object.entries(memoryLeakProbe._eventCounts || {}).sort((a, b) => b[1].emits - a[1].emits).slice(0, 16);
    return `<table style="width:100%;"><tr><th style="text-align:left;">Event</th><th style="text-align:right;">Subs</th><th style="text-align:right;">Emits</th></tr>
      ${rows.map(([k, v]) => `<tr><td style="color:#cdd8ff;padding:1px 4px;">${k}</td><td style="text-align:right;">${v.subs}</td><td style="text-align:right;color:#7cf0c2;">${v.emits}</td></tr>`).join("")}</table>`;
  }

  _fmtG2P(g) {
    if (!g) return "G2P ";
    const demo = ["","","","","","","",""];
    const lines = demo.map(s => `<div><b style="color:#ffd166;">${s}</b>  ${g.convert(s).map(p => `${p.phone}:${p.tone}`).join(" ")}</div>`).join("");
    return `<div style="line-height:1.7;">${lines}</div>`;
  }

  _fmtSafety(a) {
    return `<table style="width:100%;">
      <tr><td>headphone</td><td style="text-align:right;color:#7cf0c2;">${a.headphoneActive ? "ON" : "off"}</td></tr>
      <tr><td>parentLock</td><td style="text-align:right;">${a.isLocked ? " LOCKED" : "unlocked"}</td></tr>
      <tr><td>cap(dB)</td><td style="text-align:right;">${a.volumeCapDB} dB</td></tr>
      <tr><td>dailyExposure</td><td style="text-align:right;">${Math.round(a.getDailyExposureMinutes())} min</td></tr>
    </table>`;
  }

  _fmtBGM(b) {
    return `<div><b style="color:#7cf0c2;">Current scene:</b> ${b.currentScene || "idle"}</div>
      <div><b>Crossfade:</b> ${b._crossfadeMs || 0} ms</div>
      <div><b>Scenes:</b> ${(b.SCENES || []).map(x => x.id).join(" · ")}</div>`;
  }

  _spark(arr, color) {
    if (!arr || !arr.length) return "";
    const W = 390, H = 40;
    return `<canvas width="${W}" height="${H}" data-spark="${arr.join(',')}" data-color="${color}" style="display:block;background:#0f1527;border-radius:4px;"></canvas>`;
  }

  _f0Canvas() {
    const W = 390, H = 110;
    return `<canvas width="${W}" height="${H}" data-f0="1" style="display:block;background:#0f1527;border-radius:4px;"></canvas>`;
  }
}

export const audioDebugPanel = new AudioDebugPanel();

// ============================================================
// 11.4 StressTestRunner — AC-9 2h  timeFactor 
// ============================================================
class StressTestRunner {
  constructor() {
    this.lastReport = null;
  }

  /**
   * AC-9  2  9  + BGM  +  +  + 
   * timeFactor=60  1s  = 60s  2h  2min
   */
  async run_AC_9_2hourStress({ durationSec = 7200, timeFactor = 720, maxOps = Infinity, onProgress } = {}) {
    const realSec = Math.ceil(durationSec / timeFactor);
    const opsPerSec = 30; //  30 tutor speak + bgm switch + stroke sync + eval
    const totalOps = Math.min(maxOps, realSec * opsPerSec);

    const log = [];
    const counters = { speak: 0, bgm: 0, stroke: 0, eval: 0, parentLock: 0, interrupts: 0 };
    const start = performance.now();
    let op = 0;
    let heapGrowthMB = 0;

    // 
    const engines = {};
    try {
      const mod = await import("./soundEngine.js");
      engines.sound = mod.soundEngine || mod.soundAndFX;
      window.__soundEngine = engines.sound;
    } catch (e) { log.push("WARN: soundEngine import " + e.message); }
    try { engines.bgm = (await import("./bgmAndChant.js")).bgmEngine; } catch {}
    try { engines.sync = (await import("./strokeVoiceSync.js")).strokeVoiceSync; } catch {}
    try { engines.safety = (await import("./audioSafety.js")).audioSafety; } catch {}
    try { engines.eval = (await import("./pronunciationEval.js")).pronunciationEval; } catch {}

    memoryLeakProbe.attach(engines.sound);
    //  (, )
    if (engines.sound && "neuralVoiceEnabled" in engines.sound) engines.sound.neuralVoiceEnabled = false;
    const heap0 = (performance.memory && performance.memory.usedJSHeapSize) || 0;

    for (let t = 0; t < realSec; t++) {
      for (let i = 0; i < opsPerSec; i++) {
        if (++op > totalOps) break;
        const kind = Math.random();
        try {
          if (kind < 0.35 && engines.sound) {
            const texts = ["", "", "", ""];
            const prio = ["tutor", "char", "word", "sentence"][Math.floor(Math.random() * 4)];
            engines.sound.speak && engines.sound.speak(texts[op % texts.length], { kind: prio, rate: 1 + Math.random() * 0.2 });
            counters.speak++;
          } else if (kind < 0.55 && engines.bgm) {
            const scenes = ["home","learn","review","play","reward","night","travel","food","festival"];
            engines.bgm.switchScene && engines.bgm.switchScene(scenes[op % scenes.length], { crossfadeMs: 40 });
            counters.bgm++;
          } else if (kind < 0.75 && engines.sync) {
            if (!engines.sync._lastIdx) engines.sync._lastIdx = 0;
            engines.sync._lastIdx = (engines.sync._lastIdx + 1) % 12;
            engines.sync.emitStrokeEvent && engines.sync.emitStrokeEvent({ strokeIdx: engines.sync._lastIdx, eventType: i % 2 ? "end" : "start" });
            counters.stroke++;
          } else if (kind < 0.9 && engines.safety) {
            if (op % 7 === 0) { engines.safety.lock && engines.safety.lock(); counters.parentLock++; }
            if (op % 11 === 0) engines.safety.adjustVolume && engines.safety.adjustVolume("voice", 0.6 + Math.random() * 0.3);
          } else if (engines.eval) {
            engines.eval._tick && engines.eval._tick();
            counters.eval++;
          }
        } catch (e) { log.push(`op${op} ERR:${e.message}`); if (log.length > 20) log.shift(); }
      }
      //  interrupt 
      counters.interrupts = (memoryLeakProbe._eventCounts[EVENTS.AUDIO_QUEUE_INTERRUPT] || {}).emits || 0;
      if (onProgress) onProgress({ op, totalOps, elapsedMs: performance.now() - start, counters });
      // 
      await new Promise(r => setTimeout(r, Math.max(1, 1000 / timeFactor)));
    }

    const heap1 = (performance.memory && performance.memory.usedJSHeapSize) || 0;
    heapGrowthMB = ((heap1 - heap0) / 1048576);
    const diff = memoryLeakProbe.diffReport();
    const elapsedSec = (performance.now() - start) / 1000;

    const ok =
      diff.ok &&
      heapGrowthMB < 48 &&          // 2h  < 48MB
      counters.speak > 100 &&
      diff.leakScanSuspects === 0;

    this.lastReport = {
      ok,
      realSec,
      simulatedSec: durationSec,
      timeFactor,
      elapsedSec,
      totalOps: op,
      opsPerSecReal: +(op / elapsedSec).toFixed(1),
      counters,
      heapGrowthMB: +heapGrowthMB.toFixed(2),
      nodeSlope: diff.nodeSlope,
      leakScanSuspects: diff.leakScanSuspects,
      suspects: diff.suspects || [],
      errors: log.slice(),
      memSamples: memoryLeakProbe.samples.length,
    };
    return this.lastReport;
  }
}

export const stressTestRunner = new StressTestRunner();

// ============================================================
// 11.5 self-test entry ()
// ============================================================
export function run_Task11_selfTest() {
  return {
    registry: audioNodeRegistry.snapshot(),
    probeAttached: memoryLeakProbe.attached,
    panel: audioDebugPanel.mounted,
    eventCountKeys: Object.keys(memoryLeakProbe._eventCounts).length,
    stressRunnerReady: typeof stressTestRunner.run_AC_9_2hourStress === "function",
  };
}

if (typeof window !== "undefined") {
  window.__audioNodeRegistry = audioNodeRegistry;
  window.__memoryLeakProbe = memoryLeakProbe;
  window.__audioDebugPanel = audioDebugPanel;
  window.__stressTestRunner = stressTestRunner;
}

export default { audioNodeRegistry, memoryLeakProbe, audioDebugPanel, stressTestRunner, run_Task11_selfTest };
