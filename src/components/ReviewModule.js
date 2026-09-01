/**
 * 凯茜识字 (Cathy Literacy) - 1:1 艾宾浩斯复习调度组件
 * 纯正 3D 游戏 UI：待复习字库队列、发音速辨、星币结算与复习闭环
 */

import { CHARACTER_DATABASE } from "../data/characters.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { BaseModule } from "../utils/BaseModule.js";
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

    // 如果当前无到期生字，从已学或全部中抽取 4 个进行巩固
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
    const __rvSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col select-none overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950">
        
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/20">
          <div class="flex items-center gap-2">
            <button id="btn-review-empty-sound" class="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg" title="声音开关">
              ${__rvSpeakerIcon}
            </button>
          </div>
          <div class="flex items-center gap-2">
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.coin("w-4 h-4")}<span>${__rvProgress.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.star("w-4 h-4", true)}<span>${__rvProgress.stars}</span>
            </div>
          </div>
        </header>

        <main class="relative z-10 flex-1 flex items-center justify-center">

        <div class="flex flex-col items-center text-center animate-scale-up">
          <div class="mb-4 flex items-center justify-center">${GAME_ICONS.reviewBell("w-20 h-20")}</div>
          <h2 class="text-2xl font-black text-yellow-300 mb-2">太棒啦！</h2>
          <p class="text-sm text-white/70 mb-8">当前记忆度满分，没有需要紧急复习的汉字哦</p>
          <button id="btn-review-empty-back" class="btn-game-orange text-white font-black text-base px-10 py-3.5 rounded-full flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.home("w-5 h-5")}</span>
            <span>返回大地图</span>
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
        const ic = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
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
    const __rvSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
    const charData = this.queue[this.currentIndex];
    const options = shuffle([charData.char, ...(charData.confusingChars || ["日", "月", "木"]).slice(0, 3)]);
    const progress = this.currentIndex + 1;

    soundAndFX.speak(`${charData.char}`);

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col select-none overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">

        <!-- 顶部导航与复习数据看板 -->
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/20">
          <button id="btn-review-quit" class="btn-game-wood text-white font-black text-xs px-4 py-1.5 rounded-2xl flex items-center gap-1.5">
            <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
            <span>退出复习</span>
          </button>

          <div class="candy-pill flex items-center gap-3 px-6 py-1.5 rounded-full">
            <span class="text-white font-black text-xs">复习进度</span>
            <span class="text-yellow-300 font-black text-sm">${progress} / ${this.queue.length}</span>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-review-sound" class="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg" title="声音开关">
              ${__rvSpeakerIcon}
            </button>
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.coin("w-4 h-4")}<span>${__rvProgress.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.star("w-4 h-4", true)}<span>${__rvProgress.stars}</span>
            </div>
            <div class="candy-pill flex items-center gap-2 px-4 py-1.5 rounded-full text-white font-black text-xs">
              <span class="text-emerald-400">正确 ${this.correctCount}</span>
              <span class="text-rose-400">错误 ${this.wrongCount}</span>
            </div>
          </div>
        </header>

        <!-- 辨字答题主舞台 -->
        <main class="relative z-10 flex-1 flex items-center justify-center p-6">
          <div class="relative w-full max-w-3xl bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/20 p-8 flex flex-col items-center animate-fade-in">

            <button id="btn-review-replay" class="w-24 h-24 rounded-full btn-game-orange border-4 border-white flex items-center justify-center animate-bounce-slow mb-6 active:scale-95 shadow-xl">
              <span class="flex items-center">${GAME_ICONS.speaker("w-12 h-12")}</span>
            </button>
            <p class="text-white font-black text-sm mb-8 drop-shadow">点击听音，找出读音对应的正确汉字</p>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-5 w-full">
              ${options
                .map(
                  (opt) => `
                <button class="review-opt-btn btn-game-orange text-white font-black text-6xl h-28 rounded-3xl active:scale-95 shadow-xl transition-all" data-char="${opt}">
                  ${opt}
                </button>
              `
                )
                .join("")}
            </div>

            <div id="review-feedback" class="h-8 mt-5 text-sm font-black"></div>
          </div>
        </main>

      </div>
    `;

    const feedback = this.container.querySelector("#review-feedback");
    let answered = false;

    const quitBtn = this.container.querySelector("#btn-review-quit");
    if (quitBtn) {
      this._on(quitBtn, "click", () => {
        soundAndFX.playPop();
        this._busEmit(EVENTS.REVIEW_FINISH, { correct: this.correctCount, total: this.queue.length });
        this._busEmit(EVENTS.SWITCH_MODE, { mode: "map" });
      });
    }

    const replayBtn = this.container.querySelector("#btn-review-replay");
    if (replayBtn) {
      this._on(replayBtn, "click", () => {
        soundAndFX.playPop();
        soundAndFX.speak(charData.char);
      });
    }

    const soundBtn = this.container.querySelector("#btn-review-sound");
    if (soundBtn) {
      this._on(soundBtn, "click", () => {
        soundAndFX.toggleMute();
        const ic = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
        soundBtn.innerHTML = ic;
      });
    }

    this.container.querySelectorAll(".review-opt-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        if (answered) return;
        answered = true;

        const picked = btn.dataset.char;
        if (picked === charData.char) {
          this.correctCount++;
          ebbinghausManager.completeReview(charData.id, true);
          ebbinghausManager.addCoins(2);
          soundAndFX.playSuccessSound();
          btn.classList.add("ring-8", "ring-emerald-400");
          if (feedback) feedback.innerHTML = '<span class="text-emerald-300 text-lg">✨ 答对啦！记忆牢固！</span>';
        } else {
          this.wrongCount++;
          ebbinghausManager.completeReview(charData.id, false);
          soundAndFX.playSoftError();
          btn.classList.add("animate-shake", "ring-8", "ring-rose-400");
          if (feedback) feedback.innerHTML = `<span class="text-rose-300 text-lg">答错了，正确答案是：${charData.char}</span>`;
        }

        this._timeout(() => {
          this.currentIndex++;
          if (this.currentIndex < this.queue.length) {
            this.renderRound();
          } else {
            this.renderSummary();
          }
        }, 1400);
      });
    });
  }

  renderSummary() {
    const __rvProgress = ebbinghausManager.progress;
    const __rvSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
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
            ${perfect ? GAME_ICONS.trophy("w-20 h-20") : GAME_ICONS.star("w-20 h-20", true)}
          </div>
          <h2 class="text-2xl font-black text-yellow-300 mb-2">
            ${perfect ? "完美通关！" : "复习完成！"}
          </h2>
          <p class="text-sm text-white/70 mb-5 font-bold">
            总计 ${total} 个 · 正确 ${this.correctCount} 个 · 错误 ${this.wrongCount} 个
          </p>
          <div class="flex items-center gap-2 mb-4">
            <button id="btn-review-summary-sound" class="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg" title="声音开关">
              ${__rvSpeakerIcon}
            </button>
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.coin("w-4 h-4")}<span>${__rvProgress.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.star("w-4 h-4", true)}<span>${__rvProgress.stars}</span>
            </div>
          </div>
          <div class="candy-pill rounded-2xl px-6 py-3 mb-6 text-xs text-yellow-300 font-bold flex items-center gap-1.5">
            <span class="flex items-center">${GAME_ICONS.coin("w-4 h-4")}</span>
            <span>获得 ${this.correctCount * 2} 凯茜星币</span>
          </div>
          <button id="btn-review-done" class="btn-game-orange text-white font-black text-base px-12 py-3.5 rounded-full flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.home("w-5 h-5")}</span>
            <span>领取奖励并返回大地图</span>
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
        const ic = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
        soundBtn.innerHTML = ic;
      });
    }
  }
}
