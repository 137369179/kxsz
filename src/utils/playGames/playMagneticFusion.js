/**
 * 玩法 5：【魔法磁力引力拼搭工坊】 (Magnetic Radical Fusion)
 * -------------------------------------------------------------
 * 适合：休、明、林、森、看、信、尖、好、尘、男、泪、歪等复合/形声/会意字
 * 核心：零件磁力相吸，手指拖拽合体，“咔哒”磁吸爆发金光合成新字
 * 规范：绝对零 Unicode Emoji，零 SVG
 */

import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";

export class PlayMagneticFusion {
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
    // 分解偏旁与部件，若无则默认拆解为左右结构
    const partA = char.radical || (char.char.length > 0 ? char.char[0] : "木");
    const partB = char.stem || (char.char.length > 1 ? char.char[1] : char.char);

    this.container.innerHTML = `
      <div class="relative w-full h-full flex flex-col items-center justify-between p-4 select-none overflow-hidden animate-fade-in">
        
        <div class="z-20 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border-2 border-cyan-300 shadow-2xl flex items-center gap-2">
          <span class="flex items-center text-cyan-300 animate-pulse">${GAME_ICONS.sparkle("w-5 h-5")}</span>
          <span class="text-sm sm:text-base font-black text-cyan-100">拖动神奇魔法积木，靠近合体变出新汉字！</span>
        </div>

        <div class="relative w-full max-w-xl flex-1 flex items-center justify-center gap-8 my-2">
          
          <div id="fusion-part-base" class="relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-indigo-700 to-purple-600 border-4 border-white shadow-2xl flex flex-col items-center justify-center text-white">
            <span class="text-xs font-black text-cyan-200 mb-1">魔法部件</span>
            <span class="text-5xl sm:text-6xl font-black font-serif">${partA}</span>
            
            <div class="absolute inset-0 rounded-3xl border-2 border-cyan-400 animate-ping opacity-30 pointer-events-none"></div>
          </div>

          <div id="fusion-arc-indicator" class="flex flex-col items-center gap-1 text-cyan-300 transition-all duration-200">
            <span class="flex items-center animate-pulse">${GAME_ICONS.sparkle("w-8 h-8")}</span>
            <span id="fusion-arc-text" class="text-xs font-black bg-cyan-950/70 border border-cyan-400 px-3 py-1 rounded-full shadow-lg">磁吸相引</span>
          </div>

          <div id="fusion-part-drag" class="draggable-fusion relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 border-4 border-white shadow-2xl flex flex-col items-center justify-center text-white cursor-grab active:cursor-grabbing hover:scale-105 transition-transform touch-none select-none">
            <span class="text-xs font-black text-amber-200 mb-1">拖我靠近</span>
            <span class="text-5xl sm:text-6xl font-black font-serif">${partB}</span>
          </div>

          <div id="fusion-result-char" class="absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none transition-all duration-500 transform scale-50 z-30">
            <div id="fusion-shockwave" class="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full border-4 border-cyan-300 animate-ping pointer-events-none opacity-0"></div>

            <div class="w-52 h-52 sm:w-64 sm:h-64 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 border-4 border-white shadow-[0_0_70px_rgba(99,102,241,1)] flex flex-col items-center justify-center text-white">
              <span class="text-sm font-black text-cyan-200">${char.pinyin}</span>
              <span class="text-8xl sm:text-9xl font-black font-serif leading-none drop-shadow-lg">${char.char}</span>
              <span class="text-xs font-black text-yellow-300 mt-2 bg-black/40 px-4 py-1.5 rounded-full border border-yellow-300/40">合体成功！</span>
            </div>
          </div>

        </div>

        <div class="z-20 w-full max-w-xs bg-black/40 backdrop-blur-md p-2.5 rounded-2xl border-2 border-white/20 flex items-center gap-3 shadow-xl">
          <span class="text-xs font-black text-cyan-300 shrink-0">磁吸引力</span>
          <div class="flex-1 h-3.5 bg-white/20 rounded-full overflow-hidden p-0.5">
            <div id="fusion-progress-bar" class="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full transition-all duration-100 shadow-[0_0_10px_rgba(34,211,238,0.8)]" style="width: 20%;"></div>
          </div>
        </div>

      </div>
    `;

    soundAndFX.speakPriority(`拖动神奇魔法积木，靠近合体变出新汉字！`, { kind: "sentence", priority: 1 });

    this._bindDragEvents();
  }

  _bindDragEvents() {
    const dragPart = this.container.querySelector("#fusion-part-drag");
    const basePart = this.container.querySelector("#fusion-part-base");
    const resultChar = this.container.querySelector("#fusion-result-char");
    const progressBar = this.container.querySelector("#fusion-progress-bar");

    if (!dragPart || !basePart) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const onStart = (e) => {
      if (this.isCompleted) return;
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      startX = clientX;
      startY = clientY;
      soundAndFX.playPop();
      dragPart.classList.add("scale-115", "z-20");
    };

    const onMove = (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - startX;
      const dy = clientY - startY;

      dragPart.style.transform = `translate(${dx}px, ${dy}px) scale(1.15)`;

      const arcIndicator = this.container.querySelector("#fusion-arc-indicator");
      const arcText = this.container.querySelector("#fusion-arc-text");
      const shockwave = this.container.querySelector("#fusion-shockwave");

      // 计算与左底座的距离
      const dragRect = dragPart.getBoundingClientRect();
      const baseRect = basePart.getBoundingClientRect();
      const dist = Math.hypot(dragRect.left - baseRect.right, dragRect.top - baseRect.top);

      const proximity = Math.max(0, Math.min(100, Math.round((1 - dist / 300) * 100)));
      if (progressBar) progressBar.style.width = `${Math.max(20, proximity)}%`;

      if (dist < 150) {
        if (arcText) arcText.textContent = "电弧激发中！";
        if (arcIndicator) arcIndicator.style.transform = "scale(1.25)";
        dragPart.classList.add("ring-4", "ring-cyan-300");
      } else {
        if (arcText) arcText.textContent = "磁吸相引";
        if (arcIndicator) arcIndicator.style.transform = "scale(1)";
        dragPart.classList.remove("ring-4", "ring-cyan-300");
      }

      if (dist < 60 && !this.isCompleted) {
        // 触发磁吸咔哒吸附合体！
        this.isCompleted = true;
        isDragging = false;
        soundAndFX.playVictoryFanfare();
        soundAndFX.triggerConfetti(this.container);

        dragPart.style.display = "none";
        basePart.style.display = "none";
        if (arcIndicator) arcIndicator.style.display = "none";

        if (shockwave) {
          shockwave.classList.remove("opacity-0");
        }

        if (resultChar) {
          resultChar.classList.remove("opacity-0", "scale-50");
          resultChar.classList.add("opacity-100", "scale-100");
        }

        const char = this.charData;
        this._timeout(() => {
          if (!this.isDestroyed) {
            soundAndFX.speakPriority(`咔哒！积木合体成功，诞生了“${char.char}”字！`, { kind: "sentence", priority: 1 });
          }
        }, 250);

        this._timeout(() => {
          if (!this.isDestroyed && typeof this.onComplete === "function") {
            this.onComplete();
          }
        }, 1500);
      }
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      dragPart.style.transition = "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)";
      dragPart.style.transform = "translate(0px, 0px)";
      dragPart.classList.remove("scale-115", "z-20", "ring-4", "ring-cyan-300");
    };

    dragPart.addEventListener("mousedown", onStart);
    dragPart.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchend", onEnd);

    this.cleanups.push(() => {
      dragPart.removeEventListener("mousedown", onStart);
      dragPart.removeEventListener("touchstart", onStart);
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
