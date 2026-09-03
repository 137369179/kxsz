/**
 * 玩法 3：【Q弹弹弓蓄力与物理城堡撞击】 (Slingshot & Castle Buster)
 * -------------------------------------------------------------
 * 适合：大、小、上、下、出、入、飞、石、射、打、弓、箭、山、破等动感字
 * 核心：橡皮筋弹弓蓄力瞄准，松手弹射轰飞巨石城堡，爆出目标汉字
 * 规范：绝对零 Unicode Emoji，零 SVG
 */

import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";

export class PlaySlingshot {
  constructor(container, charData, onComplete) {
    this.container = container;
    this.charData = charData;
    this.onComplete = onComplete;
    this.isCompleted = false;
    this.cleanups = [];
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
        
        <div class="z-20 bg-black/60 backdrop-blur-md px-6 py-2.5 rounded-full border-2 border-orange-300 shadow-2xl flex items-center gap-2">
          <span class="flex items-center text-orange-300 animate-pulse">${GAME_ICONS.sparkle("w-5 h-5")}</span>
          <span class="text-xs sm:text-sm font-black text-orange-100">拉紧金色弹弓，瞄准城堡，松手发射！</span>
        </div>

        <div id="slingshot-arena" class="relative w-full max-w-2xl flex-1 flex items-center justify-between px-6 my-2">
          <canvas id="slingshot-band-canvas" class="absolute inset-0 w-full h-full pointer-events-none z-15"></canvas>
          
          <div class="relative flex flex-col items-center">
            
            <div id="slingshot-frame" class="relative w-28 h-40 flex items-center justify-center">
              
              <div class="absolute bottom-0 w-8 h-24 bg-amber-800 rounded-b-xl border-2 border-amber-950 shadow-md"></div>
              <div id="slingshot-fork-l" class="absolute top-4 left-2 w-5 h-16 bg-amber-700 -rotate-25 rounded-t-xl border border-amber-950"></div>
              <div id="slingshot-fork-r" class="absolute top-4 right-2 w-5 h-16 bg-amber-700 rotate-25 rounded-t-xl border border-amber-950"></div>

              <div id="slingshot-ammo" class="absolute z-20 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 border-4 border-white shadow-[0_0_24px_rgba(245,158,11,0.8)] flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform touch-none select-none">
                <span class="flex items-center text-white pointer-events-none">${GAME_ICONS.sparkle("w-8 h-8")}</span>
              </div>

            </div>

            <span class="text-xs font-black text-amber-300 bg-black/40 px-3 py-1 rounded-full mt-2">拉我蓄力</span>

          </div>

          <div id="slingshot-castle" class="relative flex flex-col items-center justify-end h-64 w-48 sm:w-56 transition-all duration-500">
            
            <div class="castle-block w-28 h-12 bg-stone-700 rounded-t-xl border-2 border-stone-500 shadow-md mb-1 flex items-center justify-center text-xs font-black text-amber-200">
              坚固堡垒
            </div>

            <div class="flex items-center gap-1 mb-1">
              <div class="castle-block w-20 h-14 bg-stone-800 rounded-lg border-2 border-stone-600 shadow flex items-center justify-center text-stone-300 text-xs font-black">石块</div>
              <div class="castle-block w-20 h-14 bg-stone-800 rounded-lg border-2 border-stone-600 shadow flex items-center justify-center text-stone-300 text-xs font-black">石块</div>
            </div>

            <div class="flex items-center gap-1">
              <div class="castle-block w-16 h-14 bg-stone-900 rounded-b-lg border-2 border-stone-700 shadow"></div>
              <div class="castle-block w-16 h-14 bg-stone-900 rounded-b-lg border-2 border-stone-700 shadow"></div>
              <div class="castle-block w-16 h-14 bg-stone-900 rounded-b-lg border-2 border-stone-700 shadow"></div>
            </div>

            <div id="slingshot-reveal-char" class="absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none transition-all duration-700 transform scale-50">
              <div class="w-36 h-36 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 border-4 border-white shadow-[0_0_50px_rgba(245,158,11,1)] flex flex-col items-center justify-center text-white">
                <span class="text-xs font-black text-amber-950">${char.pinyin}</span>
                <span class="text-7xl sm:text-8xl font-black font-serif leading-none drop-shadow-lg">${char.char}</span>
              </div>
            </div>

          </div>

        </div>

        <div class="z-20 w-full max-w-xs bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex items-center gap-3">
          <span class="text-xs font-black text-amber-300 shrink-0">拉力蓄能</span>
          <div class="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
            <div id="slingshot-power-bar" class="h-full bg-gradient-to-r from-yellow-400 to-red-500 rounded-full transition-all duration-100" style="width: 0%;"></div>
          </div>
        </div>

      </div>
    `;

    soundAndFX.speakPriority(`拉紧金色弹弓，瞄准城堡，松手发射！`, { kind: "sentence", priority: 1 });

    this._bindSlingshotEvents();
  }

  _bindSlingshotEvents() {
    const ammo = this.container.querySelector("#slingshot-ammo");
    const powerBar = this.container.querySelector("#slingshot-power-bar");
    const castle = this.container.querySelector("#slingshot-castle");
    const revealChar = this.container.querySelector("#slingshot-reveal-char");
    const arena = this.container.querySelector("#slingshot-arena");
    const bandCanvas = this.container.querySelector("#slingshot-band-canvas");
    const forkL = this.container.querySelector("#slingshot-fork-l");
    const forkR = this.container.querySelector("#slingshot-fork-r");

    if (!ammo) return;

    let isPulling = false;
    let startX = 0;
    let startY = 0;
    let pullDistance = 0;

    const drawBands = (ammoEl) => {
      if (!bandCanvas || !bandCanvas.getContext || !arena || !forkL || !forkR || !ammoEl) return;
      const arenaRect = arena.getBoundingClientRect();
      bandCanvas.width = arenaRect.width || 640;
      bandCanvas.height = arenaRect.height || 300;
      const ctx = bandCanvas.getContext("2d");
      ctx.clearRect(0, 0, bandCanvas.width, bandCanvas.height);

      const lRect = forkL.getBoundingClientRect();
      const rRect = forkR.getBoundingClientRect();
      const aRect = ammoEl.getBoundingClientRect();

      const p1x = lRect.left + lRect.width / 2 - arenaRect.left;
      const p1y = lRect.top + 4 - arenaRect.top;
      const p2x = rRect.left + rRect.width / 2 - arenaRect.left;
      const p2y = rRect.top + 4 - arenaRect.top;
      const ax = aRect.left + aRect.width / 2 - arenaRect.left;
      const ay = aRect.top + aRect.height / 2 - arenaRect.top;

      // 绘制两条金色高弹皮筋
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(ax, ay);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(p2x, p2y);
      ctx.lineTo(ax, ay);
      ctx.stroke();

      // 绘制瞄准虚线
      if (pullDistance > 20) {
        ctx.strokeStyle = "rgba(255, 235, 59, 0.7)";
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        const aimEndX = ax + (p1x - ax) * 2.5 + 260;
        const aimEndY = ay + (p1y - ay) * 1.5 - 20;
        ctx.lineTo(aimEndX, aimEndY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    setTimeout(() => drawBands(ammo), 100);

    const onStart = (e) => {
      if (this.isCompleted) return;
      isPulling = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      startX = clientX;
      startY = clientY;
      soundAndFX.playPop();
    };

    const onMove = (e) => {
      if (!isPulling) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      // 只能向左下拉拽蓄力 (限制拉力范围)
      const dx = Math.min(0, clientX - startX);
      const dy = Math.max(0, clientY - startY);
      pullDistance = Math.min(90, Math.sqrt(dx * dx + dy * dy));

      ammo.style.transform = `translate(${dx * 0.7}px, ${dy * 0.7}px) scale(1.15)`;
      drawBands(ammo);

      const powerPct = Math.min(100, Math.round((pullDistance / 60) * 100));
      if (powerBar) powerBar.style.width = `${powerPct}%`;
    };

    const onEnd = () => {
      if (!isPulling) return;
      isPulling = false;

      if (bandCanvas && bandCanvas.getContext) {
        const ctx = bandCanvas.getContext("2d");
        ctx.clearRect(0, 0, bandCanvas.width, bandCanvas.height);
      }

      if (pullDistance >= 30) {
        // 蓄力足够，发射！
        this.isCompleted = true;
        soundAndFX.playWhoosh();

        // 弹射飞行轨迹动画
        ammo.style.transition = "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease-out";
        ammo.style.transform = "translate(360px, -40px) scale(1.8)";
        ammo.style.opacity = "0";

        this._timeout(() => {
          // 击中城堡，巨石瓦解散开
          soundAndFX.playSuccess();
          soundAndFX.playVictoryFanfare();
          soundAndFX.triggerConfetti(this.container);

          const blocks = castle.querySelectorAll(".castle-block");
          blocks.forEach((b, idx) => {
            b.style.transition = "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s ease-out";
            const dirX = (idx % 2 === 0 ? -1 : 1) * (60 + idx * 30);
            const dirY = 60 + idx * 25;
            b.style.transform = `translate(${dirX}px, ${dirY}px) rotate(${dirX * 1.5}deg) scale(0.5)`;
            b.style.opacity = "0";
          });

          // 目标汉字金光升起
          if (revealChar) {
            revealChar.classList.remove("opacity-0", "scale-50");
            revealChar.classList.add("opacity-100", "scale-100");
          }

          const char = this.charData;
          soundAndFX.speakPriority(`轰隆！城堡破开，升起了“${char.char}”字！`, { kind: "sentence", priority: 1 });

          this._timeout(() => {
            if (!this.isDestroyed && typeof this.onComplete === "function") {
              this.onComplete();
            }
          }, 1300);
        }, 380);
      } else {
        // 回弹复位
        ammo.style.transition = "transform 0.2s ease-out";
        ammo.style.transform = "translate(0px, 0px)";
        if (powerBar) powerBar.style.width = "0%";
        this._timeout(() => drawBands(ammo), 220);
      }
    };

    ammo.addEventListener("mousedown", onStart);
    ammo.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchend", onEnd);

    this.cleanups.push(() => {
      ammo.removeEventListener("mousedown", onStart);
      ammo.removeEventListener("touchstart", onStart);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchend", onEnd);
    });
  }

  destroy() {
    this.isDestroyed = true;
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
    this.cleanups.forEach((c) => c());
    this.cleanups = [];
  }
}
