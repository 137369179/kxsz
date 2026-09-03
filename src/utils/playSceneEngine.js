/**
 *  (Cathy Literacy) -  (3A )
 *  Game Feel 
 */

import { soundAndFX } from "./soundEngine.js";

//  3A  Keyframes
if (typeof document !== "undefined" && !document.getElementById("cathy-game-feel-styles")) {
  const style = document.createElement("style");
  style.id = "cathy-game-feel-styles";
  style.innerHTML = `
    @keyframes screenShake {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      10%, 30%, 50%, 70%, 90% { transform: translate(-4px, 2px) rotate(-1deg); }
      20%, 40%, 60%, 80% { transform: translate(4px, -2px) rotate(1deg); }
    }
    @keyframes flashBang {
      0% { background-color: rgba(255,255,255,1); }
      100% { background-color: transparent; }
    }
    @keyframes floatingScore {
      0% { transform: translateY(0) scale(0.5); opacity: 0; }
      20% { transform: translateY(-20px) scale(1.2); opacity: 1; }
      80% { transform: translateY(-40px) scale(1); opacity: 1; }
      100% { transform: translateY(-60px) scale(0.8); opacity: 0; }
    }
    .game-shake { animation: screenShake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
    .game-flash { animation: flashBang 0.6s ease-out forwards; }
  `;
  if (typeof document !== "undefined" && (document.head || document.body)) {
    (document.head || document.body).appendChild(style);
  }
}

const THEMES = {
  pictograph: { sky: "from-sky-400 via-amber-200 to-orange-300", chip: "bg-amber-900/85 border-amber-400 text-amber-100", label: "" },
  ideograph: { sky: "from-sky-500 via-cyan-200 to-teal-300", chip: "bg-cyan-900/85 border-cyan-400 text-cyan-100", label: "" },
  compound: { sky: "from-indigo-500 via-purple-300 to-fuchsia-300", chip: "bg-purple-900/85 border-purple-400 text-purple-100", label: "" },
  phono: { sky: "from-emerald-500 via-lime-200 to-amber-300", chip: "bg-emerald-900/85 border-emerald-400 text-emerald-100", label: "" }
};

export class PlaySceneEngine {
  constructor(mountEl, charData, onCompleteCallback) {
    this.mount = mountEl;
    this.char = charData;
    this.onComplete = onCompleteCallback;
    this.theme = THEMES[charData.charType] || THEMES.pictograph;
    this.done = false;
    this._cleanups = [];
    this._raf = null;
    // 矩形缓存：避免 RAF 循环中频繁调用 getBoundingClientRect
    this._rectCache = new WeakMap();
    this._rectCacheTimer = null;
    this.render();
  }

  /** 获取并缓存元素矩形，100ms 内复用缓存结果（仅在元素未失效时复用） */
  _getRect(el) {
    if (!el || typeof el.getBoundingClientRect !== "function") return null;
    const now = performance.now();
    const cached = this._rectCache.get(el);
    if (cached && now - cached.time < 100) return cached.rect;
    const rect = el.getBoundingClientRect();
    this._rectCache.set(el, { rect, time: now });
    return rect;
  }

  /** 强制刷新所有缓存的矩形 */
  _invalidateRects() {
    this._rectCache.clear();
  }

  destroy() {
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._rectCacheTimer) clearInterval(this._rectCacheTimer);
    this._cleanups.forEach((fn) => fn && fn());
    this._cleanups = [];
  }

  on(el, evt, fn, opts) {
    if (!el) return;
    el.addEventListener(evt, fn, opts);
    this._cleanups.push(() => el.removeEventListener(evt, fn, opts));
  }

  onWindow(evt, fn, opts) {
    window.addEventListener(evt, fn, opts);
    this._cleanups.push(() => window.removeEventListener(evt, fn, opts));
  }

  finish() {
    if (this.done) return;
    this.done = true;
    soundAndFX.playVictoryFanfare();
    soundAndFX.triggerConfetti(this.mount);
    setTimeout(() => { if (this.onComplete) this.onComplete(); }, 1200);
  }

  // --- Game Feel Utilities ---
  shakeScreen() {
    // P0-9 安全防护：6 岁以下禁用 + 450ms cooldown
    try {
      const age = typeof window !== "undefined" && window.__EBH__ ? window.__EBH__.getAge?.() ?? 6 : 6;
      if (age < 6) return;
      // reduce-motion 跳过
      if (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const t = Date.now();
      if (this._lastShakeAt && t - this._lastShakeAt < 450) return;
      this._lastShakeAt = t;
    } catch { /* noop */ }

    const container = this.mount.firstElementChild;
    if (!container) return;
    container.classList.remove("game-shake");
    void container.offsetWidth; // trigger reflow
    container.classList.add("game-shake");
  }

  flashScreen() {
    // PEP/眩晕安全：reduce-motion（系统偏好或专注模式）下跳过全屏白闪
    const reduceMotion =
      (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) ||
      (typeof document !== "undefined" && document.documentElement.classList.contains("reduce-motion"));
    if (reduceMotion) return;
    const flash = document.createElement("div");
    flash.className = "absolute inset-0 z-50 pointer-events-none game-flash bg-white";
    this.mount.appendChild(flash);
    setTimeout(() => flash.remove(), 600);
  }

  spawnParticles(x, y, options = {}) {
    const count = options.count || 10;
    for(let i=0; i<count; i++) {
      const p = document.createElement("div");
      p.className = `absolute pointer-events-none rounded-full z-40 ${options.colorClass || 'bg-yellow-400'}`;
      p.style.left = x + "px";
      p.style.top = y + "px";
      const size = options.size ? options.size() : (Math.random() * 6 + 4);
      p.style.width = size + "px";
      p.style.height = size + "px";
      this.mount.appendChild(p);
      
      const angle = Math.random() * Math.PI * 2;
      const speed = options.speed ? options.speed() : (Math.random() * 80 + 20);
      const tx = Math.cos(angle) * speed;
      const ty = Math.sin(angle) * speed - (options.lift || 40);
      
      requestAnimationFrame(() => {
        p.style.transition = `all ${options.duration || 600}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        p.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
        p.style.opacity = "0";
      });
      setTimeout(() => p.remove(), options.duration || 600);
    }
  }

  spawnScoreText(x, y, text) {
    const el = document.createElement("div");
    el.className = "absolute pointer-events-none z-50 font-black text-2xl text-yellow-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]";
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.animation = "floatingScore 0.8s ease-out forwards";
    el.textContent = text;
    this.mount.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  render() {
    switch (this.char.char) {
      case "": return this.renderEducationalMountain();
      case "": return this.renderEducationalFire();
      case "": return this.renderEducationalWood();
      case "": return this.renderEducationalMouth();
      case "": return this.renderEducationalSun();
      case "": return this.renderEducationalMoon();
      case "": return this.renderEducationalWater();
    }
    this.renderGenericScene();
  }

  // ============================================================================
  //  - 
  // ============================================================================
  renderEducationalMountain() {
    this.mount.innerHTML = `
      <div class="relative w-full h-full bg-gradient-to-b from-blue-300 to-indigo-100 overflow-hidden select-none touch-none flex flex-col items-center">
        <div class="absolute top-8 z-30 bg-gradient-to-b from-white/95 to-white/80 text-amber-900 font-black text-sm px-6 py-2.5 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.2)] border-[3px] border-white game-tooltip">
           “”
        </div>
        <div class="absolute bottom-0 w-full h-24 bg-emerald-700 rounded-t-[100%] shadow-[0_-10px_30px_rgba(4,120,87,0.5)] z-20"></div>
        <div class="absolute bottom-20 w-80 h-96 flex items-end justify-center gap-2 z-10 pointer-events-none">
          <div class="relative w-20 flex flex-col items-center justify-end pointer-events-auto group">
            <div id="m-left-target" class="absolute bottom-0 w-2 h-24 bg-white/20 border-2 border-dashed border-white/50 pointer-events-none mb-10 group-hover:bg-white/40 transition-colors"></div>
            <div id="m-left" class="w-16 h-8 bg-slate-600 rounded-t-full shadow-[inset_0_4px_10px_rgba(255,255,255,0.2),0_10px_20px_rgba(0,0,0,0.5)] border-t-8 border-slate-500 cursor-n-resize" data-max="120" style="height: 30px;"></div>
          </div>
          <div class="relative w-24 flex flex-col items-center justify-end pointer-events-auto group">
            <div id="m-center-target" class="absolute bottom-0 w-2 h-40 bg-white/20 border-2 border-dashed border-white/50 pointer-events-none mb-10 group-hover:bg-white/40 transition-colors"></div>
            <div id="m-center" class="w-20 h-10 bg-slate-700 rounded-t-full shadow-[inset_0_4px_10px_rgba(255,255,255,0.2),0_10px_20px_rgba(0,0,0,0.5)] border-t-8 border-slate-500 cursor-n-resize" data-max="200" style="height: 40px;"></div>
          </div>
          <div class="relative w-20 flex flex-col items-center justify-end pointer-events-auto group">
            <div id="m-right-target" class="absolute bottom-0 w-2 h-24 bg-white/20 border-2 border-dashed border-white/50 pointer-events-none mb-10 group-hover:bg-white/40 transition-colors"></div>
            <div id="m-right" class="w-16 h-8 bg-slate-600 rounded-t-full shadow-[inset_0_4px_10px_rgba(255,255,255,0.2),0_10px_20px_rgba(0,0,0,0.5)] border-t-8 border-slate-500 cursor-n-resize" data-max="120" style="height: 30px;"></div>
          </div>
        </div>
      </div>
    `;

    const peaks = [
      { el: this.mount.querySelector("#m-left"), max: 100, done: false },
      { el: this.mount.querySelector("#m-center"), max: 180, done: false },
      { el: this.mount.querySelector("#m-right"), max: 100, done: false }
    ];

    peaks.forEach(peak => {
      let dragging = false, startY = 0, startH = 0;

      this.on(peak.el, "pointerdown", (e) => {
        if (peak.done || this.done) return;
        dragging = true; startY = e.clientY; startH = parseInt(peak.el.style.height);
        peak.el.style.transition = "none";
        peak.el.style.filter = "brightness(1.2)";
      });

      this.onWindow("pointermove", (e) => {
        if (!dragging) return;
        let h = Math.max(30, startH + (startY - e.clientY));
        
        // 
        if (Math.random() < 0.1) {
          const rect = this._getRect(peak.el);
          this.spawnParticles(rect.left + Math.random()*rect.width, rect.bottom - 10, { colorClass: 'bg-slate-400', lift: 0, speed: () => Math.random()*30 });
        }

        if (h >= peak.max) {
          h = peak.max;
          dragging = false;
          peak.done = true;
          peak.el.style.transition = "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
          peak.el.style.filter = "brightness(1)";
          peak.el.classList.add("bg-slate-800", "shadow-[0_0_40px_rgba(255,255,255,0.6)]");
          
          this.shakeScreen(); // 
          soundAndFX.playPop(); // 
          
          const pRect = this._getRect(peak.el);
          this.spawnScoreText(pRect.left + pRect.width/2 - 30, pRect.top - 20, "!");
          this.spawnParticles(pRect.left + pRect.width/2, pRect.bottom, { colorClass: 'bg-slate-300', count: 20, lift: 20 }); // 

          if (peaks.every(p => p.done)) {
            const base = document.createElement("div");
            base.className = "absolute bottom-0 w-64 h-8 bg-slate-800 shadow-[0_0_40px_rgba(255,255,255,0.8)] rounded-full animate-fade-in z-30";
            peak.el.parentElement.parentElement.appendChild(base);
            this.flashScreen();
            this.finish();
          }
        }
        peak.el.style.height = h + "px";
      });

      this.onWindow("pointerup", () => {
        if (!dragging) return;
        dragging = false;
        peak.el.style.filter = "brightness(1)";
        if (!peak.done) {
          peak.el.style.transition = "height 0.4s cubic-bezier(0.36,-0.5,0.5,1.5)"; // 
          peak.el.style.height = "30px";
          soundAndFX.playSoftError();
        }
      });
    });
  }

  // ============================================================================
  //  - 
  // ============================================================================
  renderEducationalFire() {
    this.mount.innerHTML = `
      <div class="relative w-full h-full bg-slate-900 overflow-hidden select-none touch-none flex flex-col items-center justify-center">
        <div class="absolute inset-0 pointer-events-none">
          <div class="ember absolute left-[20%] bottom-[30%] w-2 h-2 bg-orange-400 rounded-full" style="animation-delay: 0s"></div>
          <div class="ember absolute left-[50%] bottom-[20%] w-3 h-3 bg-red-400 rounded-full" style="animation-delay: 1.2s"></div>
          <div class="ember absolute left-[80%] bottom-[40%] w-2 h-2 bg-yellow-400 rounded-full" style="animation-delay: 0.5s"></div>
          <div class="ember absolute left-[35%] bottom-[10%] w-1.5 h-1.5 bg-orange-300 rounded-full" style="animation-delay: 2.1s"></div>
        </div>
        <div class="absolute inset-0 pointer-events-none">
          <div class="ember absolute left-[20%] bottom-[30%] w-2 h-2 bg-orange-400 rounded-full" style="animation-delay: 0s"></div>
          <div class="ember absolute left-[50%] bottom-[20%] w-3 h-3 bg-red-400 rounded-full" style="animation-delay: 1.2s"></div>
          <div class="ember absolute left-[80%] bottom-[40%] w-2 h-2 bg-yellow-400 rounded-full" style="animation-delay: 0.5s"></div>
          <div class="ember absolute left-[35%] bottom-[10%] w-1.5 h-1.5 bg-orange-300 rounded-full" style="animation-delay: 2.1s"></div>
        </div>
        <div class="absolute top-8 z-30 bg-black/50 text-white font-black text-xs px-4 py-1.5 rounded-full">
           
        </div>

        <div class="absolute top-20 w-64 h-6 bg-black/80 rounded-full border-2 border-white/10 p-1 flex items-center shadow-inner overflow-hidden">
          <div id="heat-bar" class="h-full bg-gradient-to-r from-orange-400 via-red-500 to-rose-600 rounded-full transition-all duration-75 relative">
            <div class="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white/50 to-transparent animate-pulse"></div>
          </div>
        </div>

        <div class="absolute bottom-20 flex flex-col items-center">
          <div id="fire-char-shape" class="absolute bottom-10 w-48 h-48 opacity-0 pointer-events-none flex items-center justify-center filter drop-shadow-[0_0_30px_rgba(255,80,0,1)] z-40 transition-all duration-1000 scale-50">
            <div class="absolute w-12 h-32 bg-gradient-to-t from-red-600 to-yellow-300 rounded-[100%] blur-sm animate-pulse"></div>
            <div class="absolute w-8 h-16 bg-gradient-to-t from-red-500 to-yellow-300 rounded-[100%] blur-[2px] -translate-x-12 translate-y-4 -rotate-45"></div>
            <div class="absolute w-8 h-16 bg-gradient-to-t from-red-500 to-yellow-300 rounded-[100%] blur-[2px] translate-x-12 translate-y-4 rotate-45"></div>
          </div>
          <div id="drill-stick" class="relative z-20 w-6 h-40 bg-amber-200 rounded-full border-x-2 border-amber-400 shadow-[0_10px_20px_rgba(0,0,0,0.5)] cursor-ew-resize transition-colors duration-300"></div>
          <div class="relative z-10 w-40 h-16 bg-amber-900 rounded-2xl border-b-8 border-amber-950 flex justify-center mt-[-10px] shadow-2xl">
            <div id="friction-point" class="w-10 h-6 bg-black/40 rounded-full mt-2 shadow-inner transition-colors duration-300"></div>
          </div>
        </div>
      </div>
    `;

    const stick = this.mount.querySelector("#drill-stick");
    const heatBar = this.mount.querySelector("#heat-bar");
    const fireShape = this.mount.querySelector("#fire-char-shape");
    const fPoint = this.mount.querySelector("#friction-point");
    
    let dragging = false, lastX = 0, heat = 0;
    const MAX_HEAT = 2500;

    this.on(stick, "pointerdown", (e) => {
      if (this.done) return;
      dragging = true; lastX = e.clientX;
      stick.style.transition = "none";
      stick.style.transform = `translateX(0px) scale(1.1)`;
    });

    this.onWindow("pointermove", (e) => {
      if (!dragging || this.done) return;
      let dx = e.clientX - lastX; lastX = e.clientX;
      
      let currentX = parseFloat(stick.style.transform.replace(/translateX\(|px\).*$/g, "") || 0);
      let newX = Math.max(-45, Math.min(45, currentX + dx));
      stick.style.transform = `translateX(${newX}px) scale(1.1) rotate(${newX/4}deg)`;

      heat += Math.abs(dx) * 2.0;
      if (heat > MAX_HEAT) heat = MAX_HEAT;
      heatBar.style.width = `${(heat / MAX_HEAT) * 100}%`;

      // Game Feel: 
      const heatRatio = heat / MAX_HEAT;
      fPoint.style.backgroundColor = `rgba(255, ${200 - heatRatio*200}, 0, ${0.4 + heatRatio*0.6})`;
      fPoint.style.boxShadow = `0 0 ${heatRatio * 40}px rgba(255, 50, 0, ${heatRatio})`;
      stick.style.backgroundColor = heatRatio > 0.8 ? '#f87171' : (heatRatio > 0.5 ? '#fb923c' : '#fde68a');

      if (Math.random() < heatRatio * 0.5) {
        const rect = this._getRect(fPoint);
        this.spawnParticles(rect.left + 20, rect.top, { colorClass: 'bg-orange-500', count: 2, lift: 80, speed: () => Math.random()*150 });
      }
      
      if (heatRatio > 0.8 && Math.random() < 0.2) this.shakeScreen();

      if (heat >= MAX_HEAT) {
        this.done = true; dragging = false;
        this.flashScreen();
        this.shakeScreen();
        stick.style.transition = "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        stick.style.transform = "translate(200px, -100px) rotate(180deg) scale(0.1)";
        stick.style.opacity = "0";

        fireShape.style.opacity = "1";
        fireShape.style.transform = "scale(1.2)";
        soundAndFX.playChestOpen();
        this.spawnScoreText(window.innerWidth/2, window.innerHeight/2 - 100, "!");
        this.finish();
      }
    });

    this.onWindow("pointerup", () => {
      dragging = false;
      stick.style.transition = "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      stick.style.transform = "translateX(0px) scale(1)";
    });

    const decay = () => {
      if (!this.done) {
        if (!dragging && heat > 0) {
          heat -= 15; if (heat < 0) heat = 0;
          const heatRatio = heat / MAX_HEAT;
          heatBar.style.width = `${(heatRatio) * 100}%`;
          fPoint.style.boxShadow = `0 0 ${heatRatio * 40}px rgba(255, 50, 0, ${heatRatio})`;
        }
        this._raf = requestAnimationFrame(decay);
      }
    };
    this._raf = requestAnimationFrame(decay);
  }

  // ============================================================================
  //  - 
  // ============================================================================
  renderEducationalWood() {
    this.mount.innerHTML = `
      <div class="relative w-full h-full bg-gradient-to-b from-sky-300 to-emerald-200 overflow-hidden select-none touch-none flex flex-col items-center cursor-crosshair">
        <div class="absolute top-8 z-30 bg-black/50 text-white font-black text-xs px-4 py-1.5 rounded-full">
           
        </div>
        <div class="absolute bottom-0 w-full h-24 bg-amber-800 rounded-t-[50%] shadow-2xl z-20"></div>

        <canvas id="slash-trail-canvas" class="absolute inset-0 w-full h-full pointer-events-none z-50"></canvas>

        <div class="absolute bottom-20 flex flex-col items-center z-10">
          <div class="relative flex flex-col items-center" id="tree-skeleton">
             <div class="w-8 h-48 bg-amber-900 rounded-full shadow-[inset_-4px_0_10px_rgba(0,0,0,0.4)]"></div>
             <div class="absolute top-12 w-40 h-6 bg-amber-900 rounded-full shadow-[inset_0_-2px_6px_rgba(0,0,0,0.4)]"></div>
             <div class="absolute bottom-8 w-6 h-24 bg-amber-900 rounded-full origin-top -rotate-45 -translate-x-8 shadow-[inset_-2px_0_6px_rgba(0,0,0,0.4)]"></div>
             <div class="absolute bottom-8 w-6 h-24 bg-amber-900 rounded-full origin-top rotate-45 translate-x-8 shadow-[inset_2px_0_6px_rgba(0,0,0,0.4)]"></div>
             
             <div id="leaf-1" class="bush absolute -top-10 w-48 h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b-8 border-emerald-700 flex items-center justify-center text-4xl"></div>
             <div id="leaf-2" class="bush absolute top-10 -left-16 w-32 h-32 bg-gradient-to-br from-emerald-300 to-emerald-500 rounded-full shadow-lg border-b-4 border-emerald-600"></div>
             <div id="leaf-3" class="bush absolute top-10 -right-16 w-32 h-32 bg-gradient-to-br from-emerald-300 to-emerald-500 rounded-full shadow-lg border-b-4 border-emerald-600"></div>
          </div>
        </div>
      </div>
    `;

    const bushes = this.mount.querySelectorAll(".bush");
    const trailCanvas = this.mount.querySelector("#slash-trail-canvas");
    const skeleton = this.mount.querySelector("#tree-skeleton");
    let cleared = 0, isSlashing = false, points = [];

    // Slash Trail Logic with Canvas
    const drawTrail = () => {
      if (!trailCanvas || !trailCanvas.getContext) return;
      const rect = this._getRect(this.mount);
      trailCanvas.width = rect.width || 600;
      trailCanvas.height = rect.height || 600;
      const ctx = trailCanvas.getContext("2d");
      ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      if (points.length > 1) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        points.forEach((p, idx) => {
          const px = p[0] - rect.left;
          const py = p[1] - rect.top;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }
    };

    this.onWindow("pointerdown", (e) => { isSlashing = true; points = [[e.clientX, e.clientY]]; drawTrail(); });
    this.onWindow("pointermove", (e) => {
      if (!isSlashing) return;
      points.push([e.clientX, e.clientY]);
      if (points.length > 10) points.shift(); // keep trail short
      drawTrail();
    });
    this.onWindow("pointerup", () => {
      isSlashing = false;
      points = [];
      drawTrail();
    });

    bushes.forEach((bush, i) => {
      const slash = (e) => {
        if (bush.dataset.cut || this.done) return;
        if (e.type === "pointermove" && (!isSlashing || e.buttons === 0)) return;

        bush.dataset.cut = "true";
        soundAndFX.playStrokeSound();
        this.shakeScreen();

        const rect = this._getRect(bush);
        this.spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, { colorClass: 'bg-emerald-400', count: 15, lift: 80 });
        this.spawnScoreText(rect.left + rect.width/2, rect.top, ["!", "!", "!"][i]);

        bush.style.transition = "all 0.6s cubic-bezier(0.55, 0.055, 0.675, 0.19)";
        bush.style.transform = `translate(${Math.random()*100 - 50}px, 400px) rotate(${Math.random()*180 - 90}deg) scale(0.5)`;
        bush.style.opacity = "0";
        
        // 
        skeleton.style.transition = "transform 0.1s";
        skeleton.style.transform = `rotate(${Math.random()*4-2}deg)`;
        setTimeout(() => { skeleton.style.transform = "rotate(0deg)"; }, 100);

        cleared++;
        if (cleared >= bushes.length) {
          setTimeout(() => {
            soundAndFX.playPop();
            this.flashScreen();
            this.finish();
          }, 400);
        }
      };
      this.on(bush, "pointerdown", slash);
      this.on(bush, "pointerenter", slash);
      this.on(bush, "pointermove", slash);
    });
  }

  // ============================================================================
  //  -  Q 
  // ============================================================================
  renderEducationalMouth() {
    this.mount.innerHTML = `
      <div class="relative w-full h-full bg-orange-100 overflow-hidden select-none touch-none flex flex-col items-center">
        <div class="absolute top-8 z-30 bg-gradient-to-b from-white/95 to-white/80 text-amber-900 font-black text-sm px-6 py-2.5 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.2)] border-[3px] border-white game-tooltip">
           “”
        </div>

        <div id="cookie" class="absolute -top-20 w-16 h-16 bg-yellow-500 rounded-full border-4 border-yellow-600 shadow-[0_10px_20px_rgba(0,0,0,0.3)] text-yellow-900 flex items-center justify-center text-3xl z-10 filter drop-shadow-xl"></div>

        <div id="monster-head" class="absolute bottom-20 w-64 h-64 bg-gradient-to-b from-orange-400 to-orange-500 rounded-[40px] shadow-[0_20px_50px_rgba(234,88,12,0.5)] flex flex-col items-center justify-center border-4 border-orange-600 relative transition-transform">
           
           <div class="absolute top-8 flex gap-8 z-20">
             <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner relative overflow-hidden"><div id="eye-l" class="absolute w-5 h-5 bg-slate-900 rounded-full transition-transform"></div></div>
             <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner relative overflow-hidden"><div id="eye-r" class="absolute w-5 h-5 bg-slate-900 rounded-full transition-transform"></div></div>
           </div>

           <div id="monster-mouth" class="absolute top-24 w-32 bg-slate-900 rounded-xl border-4 border-red-950 flex justify-center overflow-hidden shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)] z-10" style="height: 12px;">
             <div class="absolute bottom-0 w-24 h-12 bg-rose-500 rounded-t-[50%] shadow-[inset_0_-4px_10px_rgba(0,0,0,0.5)]"></div>
           </div>

           <div id="chin-handle" class="absolute -bottom-6 w-32 h-12 bg-orange-600 rounded-full shadow-[0_10px_15px_rgba(0,0,0,0.3)] cursor-s-resize flex items-center justify-center border-4 border-orange-700 z-30">
              <div class="w-12 h-1.5 bg-white/40 rounded-full"></div>
           </div>
        </div>
      </div>
    `;

    const head = this.mount.querySelector("#monster-head");
    const mouth = this.mount.querySelector("#monster-mouth");
    const handle = this.mount.querySelector("#chin-handle");
    const cookie = this.mount.querySelector("#cookie");
    const eyeL = this.mount.querySelector("#eye-l");
    const eyeR = this.mount.querySelector("#eye-r");
    
    let dragging = false, startY = 0, currentH = 12;

    this.on(handle, "pointerdown", (e) => {
      if (this.done) return;
      dragging = true; startY = e.clientY;
      mouth.style.transition = "none";
      head.style.transition = "none";
      eyeL.style.transition = "none"; eyeR.style.transition = "none";
    });

    this.onWindow("pointermove", (e) => {
      if (!dragging || this.done) return;
      let dy = e.clientY - startY;
      let h = Math.max(12, Math.min(140, currentH + dy));
      mouth.style.height = `${h}px`;
      
      // Game Feel:  (Squash & Stretch)
      let stretch = 1 + (h - 12)/400;
      head.style.transform = `scale(1, ${stretch})`;
      
      // /
      let eyeY = (h - 12)/10;
      eyeL.style.transform = `translate(2px, ${eyeY}px)`;
      eyeR.style.transform = `translate(-2px, ${eyeY}px)`;

      if (h >= 130) {
        dragging = false; this.done = true;
        this.shakeScreen();
        
        mouth.style.transition = "all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        head.style.transition = "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        mouth.style.height = "130px";
        mouth.classList.add("border-[12px]", "shadow-[0_0_50px_rgba(255,255,255,1)]");
        head.style.transform = "scale(1, 1)";
        
        soundAndFX.playPop();
        
        // 
        cookie.style.transition = "transform 0.5s cubic-bezier(0.55, 0.055, 0.675, 0.19)";
        cookie.style.transform = "translateY(300px)";
        
        setTimeout(() => {
          soundAndFX.playChestOpen(); // 
          this.shakeScreen();
          this.spawnParticles(window.innerWidth/2, window.innerHeight/2 + 50, { colorClass: 'bg-yellow-700', count: 20 }); // 
          this.spawnScoreText(window.innerWidth/2, window.innerHeight/2 - 50, "!");
          cookie.style.opacity = "0";
          mouth.style.height = "12px"; // 
          mouth.classList.remove("border-[12px]", "shadow-[0_0_50px_rgba(255,255,255,1)]");
          eyeL.style.transform = `translate(0px, 0px) scale(1.5)`; // 
          eyeR.style.transform = `translate(0px, 0px) scale(1.5)`;
          this.finish();
        }, 500);
      }
    });

    this.onWindow("pointerup", () => {
      if (!dragging) return;
      dragging = false;
      if (!this.done) {
        // Q
        mouth.style.transition = "height 0.6s cubic-bezier(0.36,-0.5,0.5,1.5)";
        head.style.transition = "transform 0.6s cubic-bezier(0.36,-0.5,0.5,1.5)";
        eyeL.style.transition = "transform 0.4s"; eyeR.style.transition = "transform 0.4s";
        
        mouth.style.height = "12px";
        head.style.transform = "scale(1, 1)";
        eyeL.style.transform = `translate(0, 0)`; eyeR.style.transform = `translate(0, 0)`;
        soundAndFX.playSoftError();
      }
    });
  }


  // ============================================================================
  //  5 ()
  // “”/
  // 
  // ============================================================================
  renderEducationalSun() {
    this.mount.innerHTML = `
      <div class="relative w-full h-full bg-slate-950 overflow-hidden select-none touch-none flex flex-col items-center justify-center">
        <div class="absolute top-8 z-30 bg-gradient-to-b from-white/95 to-white/80 text-amber-900 font-black text-sm px-6 py-2.5 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.2)] border-[3px] border-white game-tooltip">
           
        </div>

        <div class="relative flex items-center justify-center mt-10">
          <div id="real-sun" class="absolute w-40 h-40 bg-gradient-to-tr from-yellow-300 to-orange-500 rounded-full shadow-[0_0_100px_rgba(255,200,0,0)] opacity-0 scale-50 transition-all duration-1000 z-10 flex flex-col items-center justify-center">
            <div class="w-24 h-2 bg-orange-200/80 rounded-full shadow-inner"></div>
          </div>

          <div id="stone-shell" class="relative w-48 h-48 bg-slate-700 rounded-[40%] shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_20px_30px_rgba(0,0,0,0.8)] border-4 border-slate-600 cursor-pointer flex items-center justify-center z-20 transition-transform active:scale-95">
             <div class="absolute inset-0 w-full h-full pointer-events-none opacity-80 overflow-hidden">
               <div id="crack-1" class="absolute top-4 left-8 w-20 h-0.5 bg-slate-950 rotate-45 opacity-0 transition-opacity"></div>
               <div id="crack-2" class="absolute top-16 right-6 w-16 h-0.5 bg-slate-950 -rotate-30 opacity-0 transition-opacity"></div>
               <div id="crack-3" class="absolute bottom-10 left-6 w-24 h-0.5 bg-slate-950 rotate-12 opacity-0 transition-opacity"></div>
               <div id="crack-4" class="absolute bottom-6 right-10 w-16 h-0.5 bg-slate-950 -rotate-45 opacity-0 transition-opacity"></div>
             </div>
          </div>
        </div>
      </div>
    `;

    const shell = this.mount.querySelector("#stone-shell");
    const sun = this.mount.querySelector("#real-sun");
    let hits = 0;

    this.on(shell, "pointerdown", (e) => {
      if (this.done) return;
      hits++;
      soundAndFX.playStrokeSound();
      this.shakeScreen();

      // 
      const rect = this._getRect(shell);
      this.spawnParticles(e.clientX, e.clientY, { colorClass: 'bg-slate-500', count: 8, lift: 60, speed: () => Math.random()*80 + 50 });

      // 
      const crack = this.mount.querySelector(`#crack-${hits}`);
      if (crack) crack.style.opacity = "1";

      // 
      shell.style.boxShadow = `inset 0 0 ${hits * 20}px rgba(255,100,0,${hits * 0.2}), 0 20px 30px rgba(0,0,0,0.8)`;

      if (hits >= 4) {
        this.done = true;
        this.flashScreen();
        this.shakeScreen();
        
        // 
        shell.style.transition = "all 0.5s cubic-bezier(0.55, 0.055, 0.675, 0.19)";
        shell.style.transform = "scale(1.5)";
        shell.style.opacity = "0";
        this.spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, { colorClass: 'bg-slate-600', count: 30, lift: 100, speed: () => Math.random()*200 });

        // 
        soundAndFX.playChestOpen();
        sun.style.opacity = "1";
        sun.style.transform = "scale(1)";
        sun.style.boxShadow = "0 0 100px rgba(255,200,0,1)";
        sun.classList.add("animate-pulse");

        this.spawnScoreText(rect.left + rect.width/2, rect.top - 50, "!");
        this.finish();
      }
    });
  }

  // ============================================================================
  //  6 ()
  // “”
  // “”
  // ============================================================================
  renderEducationalMoon() {
    this.mount.innerHTML = `
      <div class="relative w-full h-full bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-900 overflow-hidden select-none touch-none flex flex-col items-center">
        <div class="absolute inset-0 pointer-events-none opacity-20">
           <div class="absolute top-10 left-[-20%] w-64 h-20 bg-white rounded-full blur-2xl animate-[floatRight_20s_linear_infinite]"></div>
           <div class="absolute top-40 left-[-50%] w-80 h-24 bg-white rounded-full blur-3xl animate-[floatRight_35s_linear_infinite]" style="animation-delay: -10s"></div>
        </div>
        <div class="absolute inset-0 pointer-events-none opacity-20">
           <div class="absolute top-10 left-[-20%] w-64 h-20 bg-white rounded-full blur-2xl animate-[floatRight_20s_linear_infinite]"></div>
           <div class="absolute top-40 left-[-50%] w-80 h-24 bg-white rounded-full blur-3xl animate-[floatRight_35s_linear_infinite]" style="animation-delay: -10s"></div>
        </div>
        <div class="absolute top-8 z-30 bg-gradient-to-b from-white/95 to-white/80 text-amber-900 font-black text-sm px-6 py-2.5 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.2)] border-[3px] border-white game-tooltip">
            2 
        </div>

        <div id="star-1" class="absolute top-0 w-8 h-8 text-2xl filter drop-shadow-[0_0_10px_rgba(253,224,71,1)] z-10 transition-transform"></div>
        <div id="star-2" class="absolute -top-20 w-8 h-8 text-2xl filter drop-shadow-[0_0_10px_rgba(253,224,71,1)] z-10 transition-transform"></div>

        <div id="moon-boat" class="absolute bottom-20 w-32 h-32 bg-transparent border-[12px] border-yellow-200 border-t-transparent border-r-transparent rounded-bl-full shadow-[-10px_10px_20px_rgba(253,224,71,0.4)] flex flex-col items-center justify-center gap-2 cursor-ew-resize z-20">
           <div id="moon-stroke-1" class="w-12 h-3 bg-yellow-300 rounded-full opacity-0 shadow-[0_0_10px_rgba(253,224,71,1)] transition-all duration-300 transform -translate-x-4"></div>
           <div id="moon-stroke-2" class="w-12 h-3 bg-yellow-300 rounded-full opacity-0 shadow-[0_0_10px_rgba(253,224,71,1)] transition-all duration-300 transform -translate-x-2"></div>
        </div>
      </div>
    `;

    const boat = this.mount.querySelector("#moon-boat");
    const s1 = this.mount.querySelector("#star-1");
    const s2 = this.mount.querySelector("#star-2");
    const stroke1 = this.mount.querySelector("#moon-stroke-1");
    const stroke2 = this.mount.querySelector("#moon-stroke-2");
    
    let dragging = false, lastX = 0, boatX = 0;
    let caught = 0;

    // 
    this.on(boat, "pointerdown", (e) => {
      if (this.done) return;
      dragging = true; lastX = e.clientX;
      boat.style.transition = "none";
    });

    this.onWindow("pointermove", (e) => {
      if (!dragging || this.done) return;
      let dx = e.clientX - lastX; lastX = e.clientX;
      boatX = Math.max(-120, Math.min(120, boatX + dx));
      boat.style.transform = `translateX(${boatX}px)`;
    });

    this.onWindow("pointerup", () => { dragging = false; });

    // 
    let star1Y = 0, star2Y = -150;
    let star1X = -80, star2X = 80;
    
    s1.style.left = `calc(50% + ${star1X}px - 16px)`;
    s2.style.left = `calc(50% + ${star2X}px - 16px)`;

    const gameLoop = () => {
      if (this.done) return;
      
      // 
      if (!s1.dataset.caught) {
        star1Y += 3; s1.style.transform = `translateY(${star1Y}px)`;
        // 
        if(Math.random()<0.1) this.spawnParticles(window.innerWidth/2 + star1X, star1Y, {colorClass: 'bg-yellow-200', count: 1, size: ()=>3, duration: 300});
      }
      if (!s2.dataset.caught) {
        star2Y += 4; s2.style.transform = `translateY(${star2Y}px)`;
        if(Math.random()<0.1) this.spawnParticles(window.innerWidth/2 + star2X, star2Y, {colorClass: 'bg-yellow-200', count: 1, size: ()=>3, duration: 300});
      }

      // 
      const boatRect = this._getRect(boat);
      const checkCollision = (star, sX, sY, strokeEl) => {
        if (star.dataset.caught) return;
        const sRect = this._getRect(star);
        // 
        if (sRect.bottom > boatRect.top + 40 && sRect.bottom < boatRect.bottom) {
          if (sRect.left > boatRect.left - 20 && sRect.right < boatRect.right + 20) {
            star.dataset.caught = "true";
            star.style.opacity = "0";
            strokeEl.style.opacity = "1"; // 
            strokeEl.style.transform = "translateX(0) scale(1.2)";
            setTimeout(()=> strokeEl.style.transform = "translateX(0) scale(1)", 200);
            
            soundAndFX.playPop();
            this.shakeScreen();
            this.spawnParticles(sRect.left, sRect.bottom, { colorClass: 'bg-yellow-300', count: 15 });
            this.spawnScoreText(sRect.left, sRect.top - 20, "+1");
            caught++;

            if (caught >= 2) {
              this.done = true;
              this.flashScreen();
              soundAndFX.playChestOpen();
              boat.classList.add("shadow-[0_0_80px_rgba(253,224,71,0.8)]"); // 
              boat.style.transition = "all 0.5s ease";
              boat.style.transform = "translateX(0px) rotate(15deg) scale(1.2)"; // 
              this.finish();
            }
          }
        }
        
        // 
        if (sY > window.innerHeight) {
          if (star === s1) star1Y = -50;
          if (star === s2) star2Y = -50;
        }
      };

      checkCollision(s1, star1X, star1Y, stroke1);
      checkCollision(s2, star2X, star2Y, stroke2);

      this._raf = requestAnimationFrame(gameLoop);
    };
    this._raf = requestAnimationFrame(gameLoop);
  }

  // ============================================================================
  //  7 ()
  // “”
  // “”
  // ============================================================================
  renderEducationalWater() {
    this.mount.innerHTML = `
      <div class="relative w-full h-full bg-slate-200 overflow-hidden select-none touch-none flex flex-col items-center">
        <div class="absolute top-8 z-30 bg-gradient-to-b from-white/95 to-white/80 text-amber-900 font-black text-sm px-6 py-2.5 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.2)] border-[3px] border-white game-tooltip">
           
        </div>

        <div id="water-splat" class="absolute top-32 flex flex-col items-center opacity-0 scale-50 transition-all duration-700 z-10 filter drop-shadow-[0_5px_5px_rgba(59,130,246,0.5)]">
           <div class="w-8 h-40 bg-blue-500 rounded-full relative">
              <div class="absolute bottom-0 -left-4 w-6 h-10 bg-blue-500 rounded-full -rotate-45"></div>
           </div>
           <div class="absolute top-10 -left-16 w-16 h-6 bg-blue-400 rounded-full rotate-45"></div>
           <div class="absolute top-16 -left-16 w-12 h-6 bg-blue-400 rounded-full -rotate-[60deg]"></div>
           <div class="absolute top-10 -right-16 w-16 h-6 bg-blue-400 rounded-full -rotate-45"></div>
           <div class="absolute top-20 -right-20 w-16 h-6 bg-blue-400 rounded-full rotate-45"></div>
        </div>

        <div class="absolute bottom-20 flex flex-col items-center z-30">
          <div id="slingshot-band" class="absolute top-10 w-2 h-0 bg-white/50 rounded-full shadow-inner origin-top"></div>
          
          <div id="water-balloon" class="water-wobble w-24 h-24 bg-gradient-to-br from-blue-300 to-blue-500 shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.2),0_10px_30px_rgba(37,99,235,0.6)] border-4 border-blue-200 cursor-s-resize flex items-center justify-center text-4xl overflow-hidden relative">
             <div class="absolute top-2 left-4 w-6 h-4 bg-white/40 rounded-full rotate-45"></div>
          </div>
        </div>
      </div>
    `;

    const balloon = this.mount.querySelector("#water-balloon");
    const band = this.mount.querySelector("#slingshot-band");
    const splat = this.mount.querySelector("#water-splat");
    
    let dragging = false, startY = 0, pullDist = 0;
    const MAX_PULL = 150;

    this.on(balloon, "pointerdown", (e) => {
      if (this.done) return;
      dragging = true; startY = e.clientY;
      balloon.style.transition = "none";
    });

    this.onWindow("pointermove", (e) => {
      if (!dragging || this.done) return;
      pullDist = Math.max(0, Math.min(MAX_PULL, e.clientY - startY));
      
      // Squash & Stretch physics
      const stretch = 1 + pullDist/300;
      const squash = 1 - pullDist/400;
      balloon.style.transform = `translateY(${pullDist}px) scale(${squash}, ${stretch})`;
      
      // 
      band.style.height = `${pullDist + 20}px`;
    });

    this.onWindow("pointerup", () => {
      if (!dragging) return;
      dragging = false;
      band.style.height = "0px";

      if (pullDist > 80) { // 
        this.done = true;
        soundAndFX.playStrokeSound();
        
        balloon.style.transition = "transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        balloon.style.transform = `translateY(-400px) scale(0.8, 1.5)`; // 
        
        setTimeout(() => {
          // 
          balloon.style.opacity = "0";
          this.shakeScreen();
          this.flashScreen();
          soundAndFX.playPop(); // Splat 
          
          const rect = this._getRect(balloon);
          // 
          this.spawnParticles(window.innerWidth/2, 150, { colorClass: 'bg-blue-400', count: 40, lift: 150, speed: () => Math.random()*250 });
          this.spawnScoreText(window.innerWidth/2, 100, "!");

          // 
          splat.style.opacity = "1";
          splat.style.transform = "scale(1.2)";
          setTimeout(() => splat.style.transform = "scale(1)", 200);

          this.finish();
        }, 150);
      } else {
        // 
        balloon.style.transition = "transform 0.4s cubic-bezier(0.36,-0.5,0.5,1.5)";
        balloon.style.transform = "translateY(0px) scale(1, 1)";
        pullDist = 0;
        soundAndFX.playSoftError();
      }
    });
  }


  // ============================================================================
  // 深度认知 5：日 (破石而出，光芒万丈)
  // 教育点：“日”代表太阳，字形外框是实体，中间一横是光斑/核心
  // 玩法：连续重击敲碎包裹太阳的岩石，每次敲击伴随屏幕震动与碎石飞溅
  // ============================================================================
  renderEducationalSun() {
    this.mount.innerHTML = `
      <div class="relative w-full h-full bg-slate-950 overflow-hidden select-none touch-none flex flex-col items-center justify-center">
        <div class="absolute top-8 z-30 bg-black/50 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg">
           连续用力点击岩石，砸碎它，释放出太阳！
        </div>

        <div class="relative flex items-center justify-center mt-10">
          <div id="real-sun" class="absolute w-40 h-40 bg-gradient-to-tr from-yellow-300 to-orange-500 rounded-full shadow-[0_0_100px_rgba(255,200,0,0)] opacity-0 scale-50 transition-all duration-1000 z-10 flex flex-col items-center justify-center">
            <div class="w-24 h-2 bg-orange-200/80 rounded-full shadow-inner"></div>
          </div>

          <div id="stone-shell" class="relative w-48 h-48 bg-slate-700 rounded-[40%] shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_20px_30px_rgba(0,0,0,0.8)] border-4 border-slate-600 cursor-pointer flex items-center justify-center z-20 transition-transform active:scale-95">
             <div class="absolute inset-0 w-full h-full pointer-events-none opacity-80 overflow-hidden">
               <div id="crack-1" class="absolute top-4 left-8 w-20 h-0.5 bg-slate-950 rotate-45 opacity-0 transition-opacity"></div>
               <div id="crack-2" class="absolute top-16 right-6 w-16 h-0.5 bg-slate-950 -rotate-30 opacity-0 transition-opacity"></div>
               <div id="crack-3" class="absolute bottom-10 left-6 w-24 h-0.5 bg-slate-950 rotate-12 opacity-0 transition-opacity"></div>
               <div id="crack-4" class="absolute bottom-6 right-10 w-16 h-0.5 bg-slate-950 -rotate-45 opacity-0 transition-opacity"></div>
             </div>
          </div>
        </div>
      </div>
    `;

    const shell = this.mount.querySelector("#stone-shell");
    const sun = this.mount.querySelector("#real-sun");
    let hits = 0;

    this.on(shell, "pointerdown", (e) => {
      if (this.done) return;
      hits++;
      soundAndFX.playStrokeSound();
      this.shakeScreen();

      // 爆出碎石粒子
      const rect = this._getRect(shell);
      this.spawnParticles(e.clientX, e.clientY, { colorClass: 'bg-slate-500', count: 8, lift: 60, speed: () => Math.random()*80 + 50 });

      // 显示裂纹
      const crack = this.mount.querySelector(`#crack-${hits}`);
      if (crack) crack.style.opacity = "1";

      // 岩石透出红光
      shell.style.boxShadow = `inset 0 0 ${hits * 20}px rgba(255,100,0,${hits * 0.2}), 0 20px 30px rgba(0,0,0,0.8)`;

      if (hits >= 4) {
        this.done = true;
        this.flashScreen();
        this.shakeScreen();
        
        // 岩石炸开碎裂
        shell.style.transition = "all 0.5s cubic-bezier(0.55, 0.055, 0.675, 0.19)";
        shell.style.transform = "scale(1.5)";
        shell.style.opacity = "0";
        this.spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, { colorClass: 'bg-slate-600', count: 30, lift: 100, speed: () => Math.random()*200 });

        // 太阳出现
        soundAndFX.playChestOpen();
        sun.style.opacity = "1";
        sun.style.transform = "scale(1)";
        sun.style.boxShadow = "0 0 100px rgba(255,200,0,1)";
        sun.classList.add("animate-pulse");

        this.spawnScoreText(rect.left + rect.width/2, rect.top - 50, "光芒万丈!");
        this.finish();
      }
    });
  }

  // ============================================================================
  // 深度认知 6：月 (星月交辉，接星星)
  // 教育点：“月”字的形状像一弯新月（撇和横折钩），中间两横代表月晕或星光
  // 玩法：拖拽底部的“新月舟”接住天上掉下来的两颗流星，流星落入月中化作两横
  // ============================================================================
  renderEducationalMoon() {
    this.mount.innerHTML = `
      <div class="relative w-full h-full bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-900 overflow-hidden select-none touch-none flex flex-col items-center">
        <div class="absolute inset-0 pointer-events-none opacity-20">
           <div class="absolute top-10 left-[-20%] w-64 h-20 bg-white rounded-full blur-2xl animate-[floatRight_20s_linear_infinite]"></div>
           <div class="absolute top-40 left-[-50%] w-80 h-24 bg-white rounded-full blur-3xl animate-[floatRight_35s_linear_infinite]" style="animation-delay: -10s"></div>
        </div>
        <div class="absolute top-8 z-30 bg-black/50 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg">
           左右拖动新月，接住掉落的 2 颗流星！
        </div>

        <div id="star-1" class="absolute top-0 w-8 h-8 text-2xl filter drop-shadow-[0_0_10px_rgba(253,224,71,1)] z-10 transition-transform"></div>
        <div id="star-2" class="absolute -top-20 w-8 h-8 text-2xl filter drop-shadow-[0_0_10px_rgba(253,224,71,1)] z-10 transition-transform"></div>

        <div id="moon-boat" class="absolute bottom-20 w-32 h-32 bg-transparent border-[12px] border-yellow-200 border-t-transparent border-r-transparent rounded-bl-full shadow-[-10px_10px_20px_rgba(253,224,71,0.4)] flex flex-col items-center justify-center gap-2 cursor-ew-resize z-20">
           <div id="moon-stroke-1" class="w-12 h-3 bg-yellow-300 rounded-full opacity-0 shadow-[0_0_10px_rgba(253,224,71,1)] transition-all duration-300 transform -translate-x-4"></div>
           <div id="moon-stroke-2" class="w-12 h-3 bg-yellow-300 rounded-full opacity-0 shadow-[0_0_10px_rgba(253,224,71,1)] transition-all duration-300 transform -translate-x-2"></div>
        </div>
      </div>
    `;

    const boat = this.mount.querySelector("#moon-boat");
    const s1 = this.mount.querySelector("#star-1");
    const s2 = this.mount.querySelector("#star-2");
    const stroke1 = this.mount.querySelector("#moon-stroke-1");
    const stroke2 = this.mount.querySelector("#moon-stroke-2");
    
    let dragging = false, lastX = 0, boatX = 0;
    let caught = 0;

    // 船的水平拖动
    this.on(boat, "pointerdown", (e) => {
      if (this.done) return;
      dragging = true; lastX = e.clientX;
      boat.style.transition = "none";
    });

    this.onWindow("pointermove", (e) => {
      if (!dragging || this.done) return;
      let dx = e.clientX - lastX; lastX = e.clientX;
      boatX = Math.max(-120, Math.min(120, boatX + dx));
      boat.style.transform = `translateX(${boatX}px)`;
    });

    this.onWindow("pointerup", () => { dragging = false; });

    // 星星坠落逻辑
    let star1Y = 0, star2Y = -150;
    let star1X = -80, star2X = 80;
    
    s1.style.left = `calc(50% + ${star1X}px - 16px)`;
    s2.style.left = `calc(50% + ${star2X}px - 16px)`;

    const gameLoop = () => {
      if (this.done) return;
      
      // 移动星星
      if (!s1.dataset.caught) {
        star1Y += 3; s1.style.transform = `translateY(${star1Y}px)`;
        // 拖尾粒子
        if(Math.random()<0.1) this.spawnParticles(window.innerWidth/2 + star1X, star1Y, {colorClass: 'bg-yellow-200', count: 1, size: ()=>3, duration: 300});
      }
      if (!s2.dataset.caught) {
        star2Y += 4; s2.style.transform = `translateY(${star2Y}px)`;
        if(Math.random()<0.1) this.spawnParticles(window.innerWidth/2 + star2X, star2Y, {colorClass: 'bg-yellow-200', count: 1, size: ()=>3, duration: 300});
      }

      // 碰撞检测
      const boatRect = this._getRect(boat);
      const checkCollision = (star, sX, sY, strokeEl) => {
        if (star.dataset.caught) return;
        const sRect = this._getRect(star);
        // 如果星星落到底部区域并且在船的水平范围内
        if (sRect.bottom > boatRect.top + 40 && sRect.bottom < boatRect.bottom) {
          if (sRect.left > boatRect.left - 20 && sRect.right < boatRect.right + 20) {
            star.dataset.caught = "true";
            star.style.opacity = "0";
            strokeEl.style.opacity = "1"; // 点亮月亮内部的一横
            strokeEl.style.transform = "translateX(0) scale(1.2)";
            setTimeout(()=> strokeEl.style.transform = "translateX(0) scale(1)", 200);
            
            soundAndFX.playPop();
            this.shakeScreen();
            this.spawnParticles(sRect.left, sRect.bottom, { colorClass: 'bg-yellow-300', count: 15 });
            this.spawnScoreText(sRect.left, sRect.top - 20, "+1");
            caught++;

            if (caught >= 2) {
              this.done = true;
              this.flashScreen();
              soundAndFX.playChestOpen();
              boat.classList.add("shadow-[0_0_80px_rgba(253,224,71,0.8)]"); // 月亮大放异彩
              boat.style.transition = "all 0.5s ease";
              boat.style.transform = "translateX(0px) rotate(15deg) scale(1.2)"; // 摆正月亮
              this.finish();
            }
          }
        }
        
        // 掉出屏幕重置
        if (sY > window.innerHeight) {
          if (star === s1) star1Y = -50;
          if (star === s2) star2Y = -50;
        }
      };

      checkCollision(s1, star1X, star1Y, stroke1);
      checkCollision(s2, star2X, star2Y, stroke2);

      this._raf = requestAnimationFrame(gameLoop);
    };
    this._raf = requestAnimationFrame(gameLoop);
  }

  // ============================================================================
  // 深度认知 7：水 (水球弹射，水花飞溅)
  // 教育点：“水”字是中间一道水流，两边是溅起的水花
  // 玩法：向后拉动水球（弹弓物理），松手射爆在墙上，四溅的水花直接形成“水”字
  // ============================================================================
  renderEducationalWater() {
    this.mount.innerHTML = `
      <div class="relative w-full h-full bg-slate-200 overflow-hidden select-none touch-none flex flex-col items-center">
        <div class="absolute top-8 z-30 bg-black/50 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg">
           往下长按拖拽水球，像弹弓一样把它射向墙壁！
        </div>

        <div id="water-splat" class="absolute top-32 flex flex-col items-center opacity-0 scale-50 transition-all duration-700 z-10 filter drop-shadow-[0_5px_5px_rgba(59,130,246,0.5)]">
           <div class="w-8 h-40 bg-blue-500 rounded-full relative">
              <div class="absolute bottom-0 -left-4 w-6 h-10 bg-blue-500 rounded-full -rotate-45"></div>
           </div>
           <div class="absolute top-10 -left-16 w-16 h-6 bg-blue-400 rounded-full rotate-45"></div>
           <div class="absolute top-16 -left-16 w-12 h-6 bg-blue-400 rounded-full -rotate-[60deg]"></div>
           <div class="absolute top-10 -right-16 w-16 h-6 bg-blue-400 rounded-full -rotate-45"></div>
           <div class="absolute top-20 -right-20 w-16 h-6 bg-blue-400 rounded-full rotate-45"></div>
        </div>

        <div class="absolute bottom-20 flex flex-col items-center z-30">
          <div id="slingshot-band" class="absolute top-10 w-2 h-0 bg-white/50 rounded-full shadow-inner origin-top"></div>
          
          <div id="water-balloon" class="water-wobble w-24 h-24 bg-gradient-to-br from-blue-300 to-blue-500 shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.2),0_10px_30px_rgba(37,99,235,0.6)] border-4 border-blue-200 cursor-s-resize flex items-center justify-center text-4xl overflow-hidden relative">
             <div class="absolute top-2 left-4 w-6 h-4 bg-white/40 rounded-full rotate-45"></div>
          </div>
        </div>
      </div>
    `;

    const balloon = this.mount.querySelector("#water-balloon");
    const band = this.mount.querySelector("#slingshot-band");
    const splat = this.mount.querySelector("#water-splat");
    
    let dragging = false, startY = 0, pullDist = 0;
    const MAX_PULL = 150;

    this.on(balloon, "pointerdown", (e) => {
      if (this.done) return;
      dragging = true; startY = e.clientY;
      balloon.style.transition = "none";
    });

    this.onWindow("pointermove", (e) => {
      if (!dragging || this.done) return;
      pullDist = Math.max(0, Math.min(MAX_PULL, e.clientY - startY));
      
      // Squash & Stretch physics
      const stretch = 1 + pullDist/300;
      const squash = 1 - pullDist/400;
      balloon.style.transform = `translateY(${pullDist}px) scale(${squash}, ${stretch})`;
      
      // 弹弓皮筋
      band.style.height = `${pullDist + 20}px`;
    });

    this.onWindow("pointerup", () => {
      if (!dragging) return;
      dragging = false;
      band.style.height = "0px";

      if (pullDist > 80) { // 拉得足够开，发射！
        this.done = true;
        soundAndFX.playStrokeSound();
        
        balloon.style.transition = "transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        balloon.style.transform = `translateY(-400px) scale(0.8, 1.5)`; // 极速飞出
        
        setTimeout(() => {
          // 爆裂冲击
          balloon.style.opacity = "0";
          this.shakeScreen();
          this.flashScreen();
          soundAndFX.playPop(); // Splat 声音
          
          const rect = this._getRect(balloon);
          // 大量水花粒子喷射
          this.spawnParticles(window.innerWidth/2, 150, { colorClass: 'bg-blue-400', count: 40, lift: 150, speed: () => Math.random()*250 });
          this.spawnScoreText(window.innerWidth/2, 100, "水花四溅!");

          // 墙上留下水字
          splat.style.opacity = "1";
          splat.style.transform = "scale(1.2)";
          setTimeout(() => splat.style.transform = "scale(1)", 200);

          this.finish();
        }, 150);
      } else {
        // 拉力不够，弹回
        balloon.style.transition = "transform 0.4s cubic-bezier(0.36,-0.5,0.5,1.5)";
        balloon.style.transform = "translateY(0px) scale(1, 1)";
        pullDist = 0;
        soundAndFX.playSoftError();
      }
    });
  }

  renderGenericScene() {
    const c = this.char;
    this.mount.innerHTML = `
      <div class="relative w-full h-full bg-gradient-to-b ${this.theme.sky} overflow-hidden shadow-2xl flex flex-col items-center justify-center p-6 animate-fade-in select-none touch-none">
        <div class="absolute top-8 z-20 bg-black/50 text-white font-black text-sm px-6 py-2 rounded-full shadow-2xl animate-bounce-slow mt-4">
           ${c.playHint}
        </div>
        <div class="flex-1 w-full flex items-center justify-center relative mt-6">
           <div id="play-actor" class="w-48 h-48 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/50 shadow-2xl flex items-center justify-center text-9xl cursor-pointer hover:scale-105 active:scale-95 transition-all z-10 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
             <span class=\"font-black drop-shadow-md text-amber-900\">${c.char}</span>
           </div>
        </div>
      </div>
    `;

    const actor = this.mount.querySelector("#play-actor");
    this.on(actor, "pointerdown", (e) => {
      e.preventDefault();
      soundAndFX.playJellyBoing();
      this.spawnParticles(e.clientX, e.clientY, { count: 10 });
      actor.style.transform = "scale(1.3) rotate(10deg)";
      setTimeout(() => {
        actor.style.transform = "scale(1) rotate(0deg)";
        this.finish();
      }, 300);
    });
  }
}
