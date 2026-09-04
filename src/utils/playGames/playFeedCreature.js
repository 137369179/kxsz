/**
 * 玩法 2：【萌宠大嘴喂食与物理重力投掷】 (Feed the Hungry Creature)
 * -------------------------------------------------------------
 * 适合：口、吃、喝、水、果、米、鱼、肉、瓜、包、饱、尝、咬等食物/感官字
 * 核心：手指拖动美味佳肴喂入萌兽大嘴，夸张咀嚼与饱腹爆心动效
 * 规范：绝对零 Unicode Emoji，零 SVG
 */

import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";

export class PlayFeedCreature {
  constructor(container, charData, onComplete) {
    this.container = container;
    this.charData = charData;
    this.onComplete = onComplete;
    this.isCompleted = false;
    this.cleanups = [];
    this.fedCount = 0;
    this.targetFeedCount = 2; // 喂食 2 次即可成功
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

    // 根据生字语义动态匹配美食名称
    const foodMapping = {
      "鱼": ["鲜美金枪鱼", "香烤小黄鱼"],
      "肉": ["大鸡腿", "香嫩肉丸"],
      "水": ["清澈甘泉", "纯净水滴"],
      "果": ["红苹果", "甜橙子"],
      "瓜": ["香甜西瓜", "小黄瓜"],
      "米": ["香喷喷米饭", "海苔饭团"],
      "包": ["热气腾腾包子", "美味汉堡"],
      "喝": ["鲜榨果汁", "纯牛奶"],
      "吃": ["甜甜饼干", "美味甜点"]
    };
    const foods = foodMapping[char.char] || ["美味甜心", "金色能量果"];

    this.container.innerHTML = `
      <div class="relative w-full h-full flex flex-col items-center justify-between p-4 select-none overflow-hidden">
        
        <div class="z-20 bg-black/60 backdrop-blur-md px-6 py-2.5 rounded-full border-2 border-pink-300 shadow-2xl flex items-center gap-2">
          <span class="flex items-center text-pink-300 animate-pulse">${GAME_ICONS.sparkle("w-5 h-5")}</span>
          <span class="text-xs sm:text-sm font-black text-pink-100">小怪兽肚子咕咕叫啦，快把美味拖到大嘴巴里！</span>
        </div>

        <div class="relative w-full max-w-lg flex-1 flex flex-col items-center justify-center my-2">
          
          <div id="feed-creature-body" class="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 border-4 border-white shadow-[0_16px_48px_rgba(244,63,94,0.5)] flex flex-col items-center justify-center transition-all duration-300">
            
            <div id="feed-eyes" class="flex items-center gap-6 mb-2">
              <div class="w-10 h-10 rounded-full bg-white border-2 border-pink-900 flex items-center justify-center shadow-md">
                <div id="feed-pupil-1" class="w-4 h-4 rounded-full bg-pink-950 animate-bounce-slow"></div>
              </div>
              <div class="w-10 h-10 rounded-full bg-white border-2 border-pink-900 flex items-center justify-center shadow-md">
                <div id="feed-pupil-2" class="w-4 h-4 rounded-full bg-pink-950 animate-bounce-slow"></div>
              </div>
            </div>

            <div id="feed-creature-mouth" class="w-28 h-20 sm:w-32 sm:h-24 rounded-3xl bg-pink-950 border-4 border-white shadow-inner flex items-center justify-center transition-transform duration-200">
              <span id="feed-mouth-inner-text" class="text-xs font-black text-pink-300">快喂我！</span>
            </div>

            <div id="feed-heart-layer" class="absolute -top-8 flex items-center gap-2 pointer-events-none opacity-0 transition-all duration-300 transform scale-50">
              <span class="flex items-center text-amber-300 animate-bounce">${GAME_ICONS.coin("w-8 h-8")}</span>
              <span class="flex items-center text-pink-300 animate-bounce delay-100">${GAME_ICONS.star("w-8 h-8", false)}</span>
            </div>

          </div>

          <div class="w-full mt-6 flex items-center justify-around gap-4 z-20">
            <div id="food-item-1" class="draggable-food w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border-4 border-amber-400 shadow-xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform touch-none select-none">
              <div class="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shadow-inner">
                ${GAME_ICONS.sparkle("w-8 h-8")}
              </div>
              <span class="text-xs font-black text-amber-950 mt-1">${foods[0]}</span>
            </div>

            <div id="food-item-2" class="draggable-food w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border-4 border-orange-400 shadow-xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform touch-none select-none">
              <div class="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shadow-inner">
                ${GAME_ICONS.gem("w-8 h-8")}
              </div>
              <span class="text-xs font-black text-orange-950 mt-1">${foods[1]}</span>
            </div>
          </div>

        </div>

        <div class="z-20 w-full max-w-xs bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex items-center gap-3">
          <span class="text-xs font-black text-pink-300 shrink-0">饱腹能量</span>
          <div class="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
            <div id="feed-progress-bar" class="h-full bg-gradient-to-r from-pink-400 to-amber-300 rounded-full transition-all duration-200" style="width: 0%;"></div>
          </div>
        </div>

      </div>
    `;

    soundAndFX.speakPriority(`小怪兽肚子饿啦，快把美味拖到大嘴巴里！`, { kind: "sentence", priority: 1 });

    this._bindDragEvents();
  }

  _bindDragEvents() {
    const foods = this.container.querySelectorAll(".draggable-food");
    const mouth = this.container.querySelector("#feed-creature-mouth");
    const body = this.container.querySelector("#feed-creature-body");
    const mouthText = this.container.querySelector("#feed-mouth-inner-text");
    const heartLayer = this.container.querySelector("#feed-heart-layer");
    const progressBar = this.container.querySelector("#feed-progress-bar");

    foods.forEach((food) => {
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let origTransform = "";

      const onStart = (e) => {
        if (this.isCompleted) return;
        isDragging = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX;
        startY = clientY;
        origTransform = food.style.transform;
        food.classList.add("scale-125", "z-30", "shadow-2xl");
        soundAndFX.playPop();

        if (mouth) mouth.classList.add("scale-125");
      };

      const onMove = (e) => {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = clientX - startX;
        const dy = clientY - startY;
        food.style.transform = `translate(${dx}px, ${dy}px) scale(1.25)`;

        // 动态距离感应：食物靠近时怪兽兴奋张大嘴巴并呼应
        if (mouth) {
          const mouthRect = mouth.getBoundingClientRect();
          const mx = mouthRect.left + mouthRect.width / 2;
          const my = mouthRect.top + mouthRect.height / 2;
          const dist = Math.hypot(clientX - mx, clientY - my);
          if (dist < 130) {
            mouth.style.transform = "scale(1.35)";
            if (mouthText) mouthText.textContent = "啊——！";
            if (body) body.classList.add("animate-bounce-slow");
          } else {
            mouth.style.transform = "scale(1.1)";
            if (mouthText) mouthText.textContent = "快喂我！";
            if (body) body.classList.remove("animate-bounce-slow");
          }
        }
      };

      const onEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;

        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

        if (mouth) mouth.style.transform = "scale(1)";

        // 检测是否投喂进入嘴巴感应区
        const mouthRect = mouth.getBoundingClientRect();
        const isInMouth =
          clientX >= mouthRect.left - 20 &&
          clientX <= mouthRect.right + 20 &&
          clientY >= mouthRect.top - 20 &&
          clientY <= mouthRect.bottom + 20;

        if (isInMouth) {
          // 投喂成功：嗷呜吞咽！
          soundAndFX.playSuccess();
          this.fedCount++;
          food.style.transition = "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out";
          food.style.transform = "scale(0)";
          food.style.opacity = "0";
          this._timeout(() => food.remove(), 350);

          if (body) {
            body.classList.add("scale-110", "rotate-2");
            this._timeout(() => body.classList.remove("scale-110", "rotate-2"), 400);
          }

          if (mouthText) mouthText.textContent = "嗷呜~ 咕咚！";

          if (heartLayer) {
            heartLayer.classList.remove("opacity-0", "scale-50");
            heartLayer.classList.add("opacity-100", "scale-125", "-translate-y-4");
            this._timeout(() => {
              heartLayer.classList.add("opacity-0");
            }, 600);
          }

          const target = Math.max(1, this.targetFeedCount || 1);
          const progress = Math.min(100, Math.round((this.fedCount / target) * 100));
          if (progressBar) progressBar.style.width = `${progress}%`;

          if (this.fedCount >= this.targetFeedCount && !this.isCompleted) {
            this.isCompleted = true;
            this._triggerVictory();
          }
        } else {
          // 未进入嘴巴则回弹原位
          food.style.transition = "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
          food.style.transform = origTransform;
          food.classList.remove("scale-125", "z-30", "shadow-2xl");
        }
      };

      food.addEventListener("mousedown", onStart);
      food.addEventListener("touchstart", onStart, { passive: true });
      window.addEventListener("mousemove", onMove);
      window.addEventListener("touchmove", onMove, { passive: true });
      window.addEventListener("mouseup", onEnd);
      window.addEventListener("touchend", onEnd);

      this.cleanups.push(() => {
        food.removeEventListener("mousedown", onStart);
        food.removeEventListener("touchstart", onStart);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("mouseup", onEnd);
        window.removeEventListener("touchend", onEnd);
      });
    });
  }

  _triggerVictory() {
    soundAndFX.playSuccess();
    soundAndFX.triggerConfetti(this.container);

    const body = this.container.querySelector("#feed-creature-body");
    const char = this.charData;

    if (body) {
      body.innerHTML = `
        <div class="flex flex-col items-center justify-center animate-scale-up">
          <span class="text-xs font-black text-white/90">${char.pinyin}</span>
          <span class="text-8xl sm:text-9xl font-black text-white font-serif leading-none drop-shadow">${char.char}</span>
        </div>
      `;
    }

    this._timeout(() => {
      if (!this.isDestroyed) {
        soundAndFX.speakPriority(`吃得好饱呀！大嘴巴变成了“${char.char}”字！`, { kind: "sentence", priority: 1 });
      }
    }, 250);

    this._timeout(() => {
      if (!this.isDestroyed && typeof this.onComplete === "function") {
        this.onComplete();
      }
    }, 1500);
  }

  destroy() {
    this.isDestroyed = true;
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
    this.cleanups.forEach((c) => c());
    this.cleanups = [];
  }
}
