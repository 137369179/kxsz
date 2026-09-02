/**
 *  (Cathy Literacy) - 1:1 
 *  3D  UI
 */

import { CHARACTER_DATABASE } from "../data/characters.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { BaseModule } from "../utils/BaseModule.js";
import { DrillEngine } from "../utils/drillEngine.js";
import { EVENTS } from "../utils/eventBus.js";
import { GAME_ICONS } from "../utils/gameIcons.js";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class ReviewModule extends BaseModule {
  constructor(container) {
    super(container);

    const dueIds = ebbinghausManager.getDueReviewCharIds().slice(0, 5);
    this.queue = dueIds
      .map((id) => CHARACTER_DATABASE.find((c) => c.id === id))
      .filter(Boolean);

    //  4 
    if (this.queue.length === 0) {
      const learnedIds = Object.keys(ebbinghausManager.progress.charRecords || {});
      if (learnedIds.length > 0) {
        this.queue = learnedIds.slice(0, 5).map(id => CHARACTER_DATABASE.find(c => c.id === id)).filter(Boolean);
      } else {
        this.queue = CHARACTER_DATABASE.slice(0, 5);
      }
    }

    this.currentIndex = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
  }

  render() {
    this.destroy();
    if (this.queue.length === 0) {
      this.renderEmpty();
      return;
    }
    this.renderRound();
  }

  renderEmpty() {
    const __rvProgress = ebbinghausManager.progress;
    const __rvSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker(true) : GAME_ICONS.speaker(false);
    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col select-none overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950">
        
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/20">
          <div class="flex items-center gap-2">
            <button id="btn-review-empty-sound" class="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg" title="">
              ${__rvSpeakerIcon}
            </button>
          </div>
          <div class="flex items-center gap-2">
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.coin()}<span>${__rvProgress.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.star(false)}<span>${__rvProgress.stars}</span>
            </div>
          </div>
        </header>

        <main class="relative z-10 flex-1 flex items-center justify-center">

        <div class="flex flex-col items-center text-center animate-scale-up">
          <div class="mb-4 flex items-center justify-center">${GAME_ICONS.reviewBell()}</div>
          <h2 class="text-2xl font-black text-yellow-300 mb-2"></h2>
          <p class="text-sm text-white/70 mb-8"></p>
          <button id="btn-review-empty-back" class="btn-game-orange text-white font-black text-base px-10 py-3.5 rounded-full flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.home()}</span>
            <span></span>
          </button>
        </div>
      </main>
      </div>
    `;
    const backBtn = this.container.querySelector("#btn-review-empty-back");
    
    // sound toggle
    const soundBtn = this.container.querySelector("#btn-review-empty-sound");
    if (soundBtn) {
      this._on(soundBtn, "click", () => {
        soundAndFX.toggleMute();
        const ic = soundAndFX.isMuted ? GAME_ICONS.speaker(true) : GAME_ICONS.speaker(false);
        soundBtn.innerHTML = ic;
      });
    }
    if (backBtn) {
      this._on(backBtn, "click", () => {
        soundAndFX.playPop();
        this._busEmit(EVENTS.SWITCH_MODE, { mode: "map" });
      });
    }
  }

  renderRound() {
    const __rvProgress = ebbinghausManager.progress;
    const __rvSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker(true) : GAME_ICONS.speaker(false);
    const charData = this.queue[this.currentIndex];
    const progress = this.currentIndex + 1;

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col select-none overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">
        <!--  -->
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/20">
          <button id="btn-review-quit" class="btn-game-wood text-white font-black text-xs px-4 py-1.5 rounded-2xl flex items-center gap-1.5">
            <span class="flex items-center">${GAME_ICONS.home()}</span>
            <span></span>
          </button>

          <div class="candy-pill flex items-center gap-3 px-6 py-1.5 rounded-full">
            <span class="text-white font-black text-xs"></span>
            <span class="text-yellow-300 font-black text-sm">${progress} / ${this.queue.length}</span>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-review-sound" class="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg" title="">
              ${__rvSpeakerIcon}
            </button>
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.coin()}<span>${__rvProgress.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.star(false)}<span>${__rvProgress.stars}</span>
            </div>
          </div>
        </header>

        <!-- Drill Engine Container -->
        <main id="drill-container" class="relative z-10 flex-1 w-full flex items-center justify-center p-6">
        </main>
      </div>
    `;

    const quitBtn = this.container.querySelector("#btn-review-quit");
    if (quitBtn) {
      this._on(quitBtn, "click", () => {
        soundAndFX.playPop();
        this._busEmit(EVENTS.REVIEW_FINISH, { correct: this.correctCount, total: this.queue.length });
        this._busEmit(EVENTS.SWITCH_MODE, { mode: "map" });
      });
    }

    const soundBtn = this.container.querySelector("#btn-review-sound");
    if (soundBtn) {
      this._on(soundBtn, "click", () => {
        soundAndFX.toggleMute();
        const ic = soundAndFX.isMuted ? GAME_ICONS.speaker(true) : GAME_ICONS.speaker(false);
        soundBtn.innerHTML = ic;
      });
    }

    const drillStage = this.container.querySelector("#drill-container");
    this.drillEngine = new DrillEngine(drillStage, charData, () => {
      // On Complete one character's drill
      const perfect = this.drillEngine.bestCombo >= 3;
      if (perfect) {
        this.correctCount++;
        ebbinghausManager.completeReview(charData.id, true);
        ebbinghausManager.addCoins(5);
      } else {
        this.wrongCount++;
        ebbinghausManager.completeReview(charData.id, false);
        ebbinghausManager.addCoins(1);
      }
      
      this.currentIndex++;
      if (this.currentIndex < this.queue.length) {
        this.renderRound();
      } else {
        this.renderSummary();
      }
    });
  }
  renderSummary() {
    const __rvProgress = ebbinghausManager.progress;
    const __rvSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker(true) : GAME_ICONS.speaker(false);
    const total = this.queue.length;
    const perfect = this.wrongCount === 0;

    if (perfect) {
      soundAndFX.playVictoryFanfare();
      soundAndFX.playEncouragement();
      soundAndFX.triggerConfetti(this.container);
    }

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex items-center justify-center bg-gradient-to-b from-purple-950 via-indigo-950 to-purple-900 select-none">
        <div class="flex flex-col items-center text-center text-white animate-scale-up bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/20 p-10 max-w-lg">
          <div class="mb-3 flex items-center justify-center">
            ${perfect ? GAME_ICONS.trophy() : GAME_ICONS.star(false)}
          </div>
          <h2 class="text-2xl font-black text-yellow-300 mb-2">
            ${perfect ? "" : ""}
          </h2>
          <p class="text-sm text-white/70 mb-5 font-bold">
             ${total}  ·  ${this.correctCount}  ·  ${this.wrongCount} 
          </p>
          <div class="flex items-center gap-2 mb-4">
            <button id="btn-review-summary-sound" class="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg" title="">
              ${__rvSpeakerIcon}
            </button>
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.coin()}<span>${__rvProgress.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.star(false)}<span>${__rvProgress.stars}</span>
            </div>
          </div>
          <div class="candy-pill rounded-2xl px-6 py-3 mb-6 text-xs text-yellow-300 font-bold flex items-center gap-1.5">
            <span class="flex items-center">${GAME_ICONS.coin()}</span>
            <span> ${this.correctCount * 2} </span>
          </div>
          <button id="btn-review-done" class="btn-game-orange text-white font-black text-base px-12 py-3.5 rounded-full flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.home()}</span>
            <span></span>
          </button>
        </div>
      </div>
    `;

    const doneBtn = this.container.querySelector("#btn-review-done");
    if (doneBtn) {
      this._on(doneBtn, "click", () => {
        soundAndFX.playPop();
        this._busEmit(EVENTS.REVIEW_FINISH, { correct: this.correctCount, total: this.queue.length });
        this._busEmit(EVENTS.SWITCH_MODE, { mode: "map" });
      });
    }

    const soundBtn = this.container.querySelector("#btn-review-summary-sound");
    if (soundBtn) {
      this._on(soundBtn, "click", () => {
        soundAndFX.toggleMute();
        const ic = soundAndFX.isMuted ? GAME_ICONS.speaker(true) : GAME_ICONS.speaker(false);
        soundBtn.innerHTML = ic;
      });
    }
  }
}
