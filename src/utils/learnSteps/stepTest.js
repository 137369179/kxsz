/** LearnModule step — extracted from LearnModule.js */
import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { EVENTS } from "../eventBus.js";
import { mascotProgress } from "../mascotProgress.js";

export function renderStepTestAndChest(stage) {
    const char = this.charData;

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-purple-950 via-indigo-950 to-purple-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col items-center justify-center p-8 animate-fade-in text-center text-white">
        
        <div id="golden-chest-stage" class="flex flex-col items-center">
          
          <div class="flex items-center gap-4 mb-4">
            <div id="star-slot-1" class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center transition-all duration-500 shadow-inner">
              <span class="flex items-center">${GAME_ICONS.star("w-8 h-8 opacity-30", true)}</span>
            </div>
            <div id="star-slot-2" class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center -translate-y-2 transition-all duration-500 shadow-inner">
              <span class="flex items-center">${GAME_ICONS.star("w-10 h-10 opacity-30", true)}</span>
            </div>
            <div id="star-slot-3" class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center transition-all duration-500 shadow-inner">
              <span class="flex items-center">${GAME_ICONS.star("w-8 h-8 opacity-30", true)}</span>
            </div>
          </div>

          <button id="btn-open-golden-chest" class="group relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 border-4 border-white shadow-[0_0_60px_rgba(255,235,59,0.8)] flex items-center justify-center active:scale-90 transition-transform cursor-pointer animate-bounce-slow">
            <span class="flex items-center">${GAME_ICONS.chest("w-28 h-28 sm:w-36 sm:h-36")}</span>
            <div class="absolute -bottom-3 bg-red-600 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg border border-white">
              点击开启通关宝箱！
            </div>
          </button>

          <h2 class="text-xl sm:text-2xl font-black text-yellow-300 mt-6 mb-1">
            恭喜凯茜小勇士！通关“${char.char}”字大冒险！
          </h2>
        </div>

        <div id="chest-reward-card" class="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center justify-center text-white hidden animate-scale-up z-30">
          <div class="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 border-4 border-white text-7xl sm:text-8xl font-black flex items-center justify-center shadow-2xl mb-4 animate-bounce-cathy">
            ${char.char}
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-yellow-300 mb-1">获得全新专属字卡：${char.char}</h2>
          <p id="chest-reward-summary" class="text-xs sm:text-sm text-gray-300 mb-4 flex items-center gap-3">
            <span class="flex items-center gap-1">${GAME_ICONS.coin("w-5 h-5")} 获得 10 凯茜星币</span>
            <span id="chest-reward-stars" class="flex items-center gap-1">${GAME_ICONS.star("w-5 h-5", false)} 凯茜之星结算中…</span>
          </p>

          <button id="btn-confirm-return-map" data-speak="领取奖励，返回大地图" aria-label="领取奖励，返回大地图" class="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:to-red-400 text-white font-black text-base sm:text-lg px-12 py-3.5 rounded-full shadow-[0_0_40px_rgba(255,107,0,0.9)] border-2 border-white active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.home("w-5 h-5")}</span>
            <span>收入生词本，返回大地图</span>
          </button>
        </div>

      </div>
    `;

    const chestBtn = stage.querySelector("#btn-open-golden-chest");
    const rewardCard = stage.querySelector("#chest-reward-card");
    const returnBtn = stage.querySelector("#btn-confirm-return-map");

    const star1 = stage.querySelector("#star-slot-1");
    const star2 = stage.querySelector("#star-slot-2");
    const star3 = stage.querySelector("#star-slot-3");

    this._isChestOpening = false;
    if (chestBtn) {
      this._on(chestBtn, "click", () => {
        if (this._isChestOpening) return;
        this._isChestOpening = true;
        chestBtn.style.pointerEvents = "none";
        chestBtn.classList.add("pointer-events-none", "opacity-80");

        soundAndFX.playChestOpen();
        soundAndFX.triggerConfetti(this.container);
        soundAndFX.triggerCoinFly(this.container);

        // P0-2 B9：真实评测分数；未评测（含年龄跳过「读」）保守默认 2 星，禁止 ?? 3 灌水
        // 手动自评封顶 2 星防灌水
        const rawStars = this._evalStars;
        let earnedStars = (typeof rawStars === "number" && !Number.isNaN(rawStars))
          ? Math.max(0, Math.min(3, rawStars))
          : 2;
        if (this._evalFromManual) earnedStars = Math.min(earnedStars, 2);

        // P0-B8 fix：数据层立即执行（不等 1400ms timeout）
        // 防止用户在星星动画中途点 header 返回按钮
        //   → LearnModule.destroy() 清掉 _cleanups 里的 timeout
        //   → completeCharacter / clearProgress / LEARN_FINISH 永远不执行
        this.clearProgress();
        ebbinghausManager.completeCharacter(char.id, earnedStars);
        this._busEmit(EVENTS.LEARN_FINISH, { charId: char.id, stars: earnedStars });

        const starsLabel = stage.querySelector("#chest-reward-stars");
        if (starsLabel) {
          starsLabel.innerHTML = `${GAME_ICONS.star("w-5 h-5", false)} ${earnedStars} 颗凯茜之星`;
        }

        // Duang! Duang! Duang! 依次点亮（按真实评测分数）
        this._timeout(() => {
          if (earnedStars >= 1) {
            soundAndFX.playStarEarned(1);
            if (star1) {
              star1.innerHTML = `<span class="flex items-center">${GAME_ICONS.star("w-12 h-12", false)}</span>`;
              star1.classList.add("bg-yellow-400", "scale-125", "shadow-[0_0_20px_rgba(255,235,59,1)]");
            }
          }
        }, 200);

        this._timeout(() => {
          if (earnedStars >= 2) {
            soundAndFX.playStarEarned(2);
            if (star2) {
              star2.innerHTML = `<span class="flex items-center">${GAME_ICONS.star("w-14 h-14", false)}</span>`;
              star2.classList.add("bg-yellow-400", "scale-125", "shadow-[0_0_20px_rgba(255,235,59,1)]");
            }
          }
        }, 600);

        this._timeout(() => {
          if (earnedStars >= 3) {
            soundAndFX.playStarEarned(3);
            if (star3) {
              star3.innerHTML = `<span class="flex items-center">${GAME_ICONS.star("w-12 h-12", false)}</span>`;
              star3.classList.add("bg-yellow-400", "scale-125", "shadow-[0_0_20px_rgba(255,235,59,1)]");
            }
          }
        }, 1000);

        this._timeout(() => {
          if (rewardCard) rewardCard.classList.remove("hidden");
          soundAndFX.playVictoryFanfare();
          // 数据层已在 chest 点击时立即执行（earnedStars 一确定）
        }, 1400);
      });
    }

    if (returnBtn) {
      this._on(returnBtn, "click", () => {
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        if (this.onFinish) this.onFinish();
        else this._busEmit(EVENTS.SWITCH_MODE, { mode: "map" });
      });
    }
  }
