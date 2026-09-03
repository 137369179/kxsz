/**
 * 玩法 1：【云雾拨开/刮刮乐神秘显形】 (Rub & Reveal Engine)
 * -------------------------------------------------------------
 * 适合：日、月、星、云、雨、天、光、雷、电、雪、夜、阴、晴等自然气象字
 * 核心：Canvas 动态物理擦拭，拨云见日，金光爆发展现甲骨文与汉字
 * 规范：绝对零 Unicode Emoji，零 SVG
 */

import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";

export class PlayRubReveal {
  constructor(container, charData, onComplete) {
    this.container = container;
    this.charData = charData;
    this.onComplete = onComplete;
    this.isCompleted = false;
    this.cleanups = [];
    this.rubbedPoints = 0;
    this.targetRubCount = 35; // 幼儿擦拭 35 次即可成功触发
    this.isDestroyed = false;
    this.timers = [];
  }

  _timeout(fn, ms) {
    const t = setTimeout(() => {
      if (this.isDestroyed) return;
      fn();
    }, ms);
    this.timers.push(t);
    return t;
  }

  mount() {
    const char = this.charData;

    this.container.innerHTML = `
      <div class="relative w-full h-full flex flex-col items-center justify-between p-4 select-none overflow-hidden animate-fade-in">
        
        <div class="z-20 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border-2 border-amber-300 shadow-2xl flex items-center gap-2">
          <span class="flex items-center text-yellow-300 animate-pulse">${GAME_ICONS.sparkle("w-5 h-5")}</span>
          <span class="text-sm sm:text-base font-black text-yellow-200">用小手指擦一擦云雾，寻找神奇汉字！</span>
        </div>

        <div id="rub-stage-box" class="relative w-72 h-72 sm:w-88 sm:h-88 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-[0_16px_50px_rgba(245,158,11,0.6)] my-auto bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center">
          
          <div id="rub-reveal-target" class="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div id="rub-god-rays" class="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full bg-gradient-to-tr from-amber-300/30 via-yellow-200/40 to-orange-400/30 animate-spin-slow pointer-events-none opacity-0 transition-opacity duration-700"></div>

            <div class="relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-white/95 shadow-[0_20px_50px_rgba(245,158,11,0.6)] flex flex-col items-center justify-center border-4 border-amber-300 transform scale-95 transition-transform duration-500">
              <span class="text-sm font-black text-amber-700">${char.pinyin}</span>
              <span class="text-7xl sm:text-8xl font-black text-amber-950 font-serif leading-none drop-shadow">${char.char}</span>
            </div>
            <span class="relative z-10 text-xs font-black text-white mt-3 bg-black/50 px-4 py-1.5 rounded-full border border-white/30 shadow-md">
              ${char.oracleGlyph ? `象形源起: ${char.oracleGlyph}` : `生字本源: ${char.char}`}
            </span>
          </div>

          <canvas id="rub-canvas" class="absolute inset-0 w-full h-full cursor-pointer touch-none z-10"></canvas>

          <div id="rub-hand-guide" class="absolute z-20 pointer-events-none animate-bounce-slow flex flex-col items-center">
            <div class="w-14 h-14 rounded-full bg-yellow-400/90 border-2 border-white shadow-2xl flex items-center justify-center">
              ${GAME_ICONS.brush("w-8 h-8")}
            </div>
            <span class="text-xs font-black text-white bg-black/60 px-3 py-0.5 rounded-full mt-1">划动擦除</span>
          </div>

          <div id="rub-burst-overlay" class="absolute inset-0 bg-yellow-200 pointer-events-none opacity-0 z-30 transition-opacity duration-500"></div>

        </div>

        <div class="z-20 w-full max-w-xs bg-black/40 backdrop-blur-md p-2.5 rounded-2xl border-2 border-white/20 flex items-center gap-3 shadow-xl">
          <span class="text-xs font-black text-yellow-300 shrink-0">擦除进度</span>
          <div class="flex-1 h-3.5 bg-white/20 rounded-full overflow-hidden p-0.5">
            <div id="rub-progress-bar" class="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-200 shadow-[0_0_10px_rgba(255,235,59,0.8)]" style="width: 0%;"></div>
          </div>
        </div>

      </div>
    `;

    soundAndFX.speakPriority(`用小手指擦一擦云雾，寻找“${char.char}”字！`, { kind: "sentence", priority: 1 });

    this._initCanvas();
  }

  _initCanvas() {
    const canvas = this.container.querySelector("#rub-canvas");
    const box = this.container.querySelector("#rub-stage-box");
    const handGuide = this.container.querySelector("#rub-hand-guide");
    const progressBar = this.container.querySelector("#rub-progress-bar");
    const burstOverlay = this.container.querySelector("#rub-burst-overlay");

    if (!canvas || !box) return;

    const width = box.clientWidth || 320;
    const height = box.clientHeight || 320;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 绘制云雾层背景 (深紫/蓝灰渐变云雾)
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#334155");
    grad.addColorStop(0.5, "#475569");
    grad.addColorStop(1, "#1e293b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 绘制云朵质感圆斑
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      const cx = (i * 53) % width;
      const cy = (i * 71) % height;
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.fill();
    }

    let isDrawing = false;

    const erase = (clientX, clientY) => {
      if (this.isCompleted) return;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 32, 0, Math.PI * 2);
      ctx.fill();

      if (handGuide && !handGuide.classList.contains("hidden")) {
        handGuide.classList.add("hidden");
      }

      this.rubbedPoints++;
      const progress = Math.min(100, Math.round((this.rubbedPoints / this.targetRubCount) * 100));
      if (progressBar) progressBar.style.width = `${progress}%`;

      // 产生金色触控火花微粒
      if (this.rubbedPoints % 3 === 0 && typeof document !== "undefined") {
        const spark = document.createElement("div");
        spark.className = "fixed pointer-events-none rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(255,235,59,1)] z-50 animate-ping";
        spark.style.width = "14px";
        spark.style.height = "14px";
        spark.style.left = `${clientX - 7}px`;
        spark.style.top = `${clientY - 7}px`;
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 350);
      }

      if (this.rubbedPoints % 6 === 0) {
        soundAndFX.playPop();
      }

      // 达成目标：全屏清空与胜利爆发
      if (this.rubbedPoints >= this.targetRubCount && !this.isCompleted) {
        this.isCompleted = true;
        this._triggerVictory(canvas, burstOverlay);
      }
    };

    const onPointerDown = (e) => {
      isDrawing = true;
      erase(e.clientX, e.clientY);
    };

    const onPointerMove = (e) => {
      if (!isDrawing) return;
      erase(e.clientX, e.clientY);
    };

    const onPointerUp = () => {
      isDrawing = false;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    this.cleanups.push(() => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    });
  }

  _triggerVictory(canvas, burstOverlay) {
    soundAndFX.playVictoryFanfare();
    soundAndFX.triggerConfetti(this.container);

    const godRays = this.container.querySelector("#rub-god-rays");
    if (godRays) {
      godRays.classList.remove("opacity-0");
      godRays.classList.add("opacity-100");
    }

    if (canvas) {
      canvas.style.transition = "opacity 0.6s ease-out";
      canvas.style.opacity = "0";
      this._timeout(() => canvas.remove(), 600);
    }

    if (burstOverlay) {
      burstOverlay.style.opacity = "0.9";
      this._timeout(() => {
        burstOverlay.style.opacity = "0";
      }, 500);
    }

    const char = this.charData;
    soundAndFX.speakPriority(`太棒啦！云雾散开，露出了“${char.char}”字！`, { kind: "sentence", priority: 1 });

    this._timeout(() => {
      if (!this.isDestroyed && typeof this.onComplete === "function") {
        this.onComplete();
      }
    }, 1200);
  }

  destroy() {
    this.isDestroyed = true;
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
    this.cleanups.forEach((c) => c());
    this.cleanups = [];
  }
}
