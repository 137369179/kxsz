/**
 * 玩法 4：【生态奇迹与四季甘霖培育】 (Sprout & Growth Ecology)
 * -------------------------------------------------------------
 * 适合：木、林、森、草、花、土、地、生、树、芽、叶、春、禾、竹、苗等植物字
 * 核心：洒水壶倾注甘霖，种子破土急速抽芽，繁花盛开凝结成字形
 * 规范：绝对零 Unicode Emoji，零 SVG
 */

import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";

export class PlaySproutGrowth {
  constructor(container, charData, onComplete) {
    this.container = container;
    this.charData = charData;
    this.onComplete = onComplete;
    this.isCompleted = false;
    this.cleanups = [];
    this.waterCount = 0;
    this.targetWaterCount = 3; // 浇灌 3 滴甘霖即成熟
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
        
        <div class="z-20 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border-2 border-emerald-300 shadow-2xl flex items-center gap-2">
          <span class="flex items-center text-emerald-300 animate-pulse">${GAME_ICONS.sparkle("w-5 h-5")}</span>
          <span class="text-sm sm:text-base font-black text-emerald-100">晃动神奇喷壶浇浇水，让小种子快快长大！</span>
        </div>

        <div class="relative w-full max-w-lg flex-1 flex flex-col items-center justify-between my-2">
          
          <div id="sprout-watering-can" class="relative z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-sky-300 border-4 border-white shadow-[0_10px_30px_rgba(20,184,166,0.5)] flex flex-col items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all select-none">
            <span class="flex items-center text-white pointer-events-none">${GAME_ICONS.sparkle("w-12 h-12")}</span>
            <span class="text-xs font-black text-cyan-950 mt-1">点我浇水</span>
            
            <div id="sprout-water-drops" class="absolute -bottom-8 flex items-center gap-1.5 opacity-0 transition-opacity">
              <div class="w-3 h-5 bg-cyan-300 rounded-full animate-bounce shadow-sm"></div>
              <div class="w-2.5 h-4 bg-teal-200 rounded-full animate-bounce delay-75 shadow-sm"></div>
              <div class="w-3 h-5 bg-sky-300 rounded-full animate-bounce delay-150 shadow-sm"></div>
            </div>
          </div>

          <div class="relative w-full flex flex-col items-center">
            
            <div id="sprout-plant-tree" class="relative z-10 flex flex-col items-center transition-all duration-700 transform scale-50 origin-bottom">
              
              <div id="sprout-canopy" class="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-emerald-500 via-green-400 to-teal-300 border-4 border-white shadow-[0_0_50px_rgba(16,185,129,0.9)] flex flex-col items-center justify-center text-white transition-all duration-500">
                <span id="sprout-stage-text" class="text-xs font-black text-emerald-950 mb-1 bg-white/70 px-3 py-0.5 rounded-full flex items-center gap-1">${GAME_ICONS.sparkle("w-3.5 h-3.5")} 破土小苗</span>
                <span class="text-xs font-black text-emerald-950">${char.pinyin}</span>
                <span class="text-7xl sm:text-8xl font-black font-serif leading-none drop-shadow-lg">${char.char}</span>
              </div>

              <div id="sprout-trunk" class="w-7 h-24 bg-gradient-to-b from-amber-700 to-amber-900 rounded-full border-2 border-amber-950 shadow-inner mt-1"></div>

            </div>

            <div class="w-full max-w-sm h-14 bg-gradient-to-b from-amber-900 to-amber-950 rounded-t-3xl border-t-4 border-amber-600 shadow-2xl flex items-center justify-center">
              <span class="text-xs font-black text-amber-300 flex items-center gap-1">
                ${GAME_ICONS.sparkle("w-4 h-4")} 滋润春泥
              </span>
            </div>

          </div>

        </div>

        <div class="z-20 w-full max-w-xs bg-black/40 backdrop-blur-md p-2.5 rounded-2xl border-2 border-white/20 flex items-center gap-3 shadow-xl">
          <span class="text-xs font-black text-emerald-300 shrink-0">成长养分</span>
          <div class="flex-1 h-3.5 bg-white/20 rounded-full overflow-hidden p-0.5">
            <div id="sprout-progress-bar" class="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(52,211,153,0.8)]" style="width: 25%;"></div>
          </div>
        </div>

      </div>
    `;

    soundAndFX.speakPriority(`晃动神奇喷壶浇浇水，让小种子快快长大！`, { kind: "sentence", priority: 1 });

    this._bindWateringEvents();
  }

  _bindWateringEvents() {
    const can = this.container.querySelector("#sprout-watering-can");
    const drops = this.container.querySelector("#sprout-water-drops");
    const plant = this.container.querySelector("#sprout-plant-tree");
    const stageText = this.container.querySelector("#sprout-stage-text");
    const progressBar = this.container.querySelector("#sprout-progress-bar");

    if (!can) return;

    const doWater = () => {
      if (this.isCompleted) return;

      this.waterCount++;
      soundAndFX.playPop();

      // 壶身倾斜浇水
      can.style.transform = "rotate(-30deg) scale(1.15)";
      if (drops) drops.style.opacity = "1";

      setTimeout(() => {
        can.style.transform = "rotate(0deg) scale(1)";
        if (drops) drops.style.opacity = "0";
      }, 450);

      // 植物逐级长大与称号演进
      if (plant) {
        const scale = 0.55 + this.waterCount * 0.28;
        plant.style.transform = `scale(${scale})`;
      }

      if (stageText) {
        const stageNames = ["幼嫩新苗", "抽条繁茂", "硕果累累"];
        stageText.textContent = stageNames[Math.min(stageNames.length - 1, this.waterCount - 1)] || "茁壮成长";
      }

      const progress = Math.min(100, Math.round((this.waterCount / this.targetWaterCount) * 100));
      if (progressBar) progressBar.style.width = `${progress}%`;

      if (this.waterCount >= this.targetWaterCount && !this.isCompleted) {
        this.isCompleted = true;
        this._triggerVictory();
      }
    };

    can.addEventListener("click", doWater);
    this.cleanups.push(() => can.removeEventListener("click", doWater));
  }

  _triggerVictory() {
    soundAndFX.playSuccess();
    soundAndFX.playVictoryFanfare();
    soundAndFX.triggerConfetti(this.container);

    const plant = this.container.querySelector("#sprout-plant-tree");
    if (plant) {
      plant.classList.add("scale-125");
    }

    const char = this.charData;
    soundAndFX.speakPriority(`太神奇啦！大树枝繁叶茂，结出了“${char.char}”字！`, { kind: "sentence", priority: 1 });

    this._timeout(() => {
      if (!this.isDestroyed && typeof this.onComplete === "function") {
        this.onComplete();
      }
    }, 1300);
  }

  destroy() {
    this.isDestroyed = true;
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
    this.cleanups.forEach((c) => c());
    this.cleanups = [];
  }
}
