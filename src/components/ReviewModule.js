/**
 * 凯茜识字 (Cathy Literacy) - 艾宾浩斯智能复习与巩固中心
 * ------------------------------------------------------------
 * 1. 严格依据遗忘曲线提取待复习生字（优先薄弱字与到期字）
 * 2. 结合 DrillEngine 4 大微游戏进行趣味强化训练
 * 3. 统计全对率、生成结算奖励、颁发星币与荣誉徽章
 */

import { CHARACTER_DATABASE } from "../data/characters.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { BaseModule } from "../utils/BaseModule.js";
import { DrillEngine } from "../utils/drillEngine.js";
import { EVENTS } from "../utils/eventBus.js";
import { GAME_ICONS } from "../utils/gameIcons.js";
import { printWorksheet } from "../utils/worksheetGenerator.js";

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
    this.queue = [];
    this.currentIndex = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.drillEngine = null;
    this.initQueue();
  }

  initQueue() {
    const dueIds = ebbinghausManager.getDueReviewCharIds().slice(0, 3);
    const errorProfile = ebbinghausManager.progress.errorProfiles || {};
    const confusedPairs = errorProfile.confusedPairs || {};
    const confusedIds = Object.entries(confusedPairs)
      .sort((a, b) => {
        const countA = typeof a[1] === "object" ? Object.values(a[1]).reduce((s, v) => s + v, 0) : Number(a[1]) || 0;
        const countB = typeof b[1] === "object" ? Object.values(b[1]).reduce((s, v) => s + v, 0) : Number(b[1]) || 0;
        return countB - countA;
      })
      .slice(0, 2)
      .map(([charId]) => charId);

    const allIds = [...new Set([...dueIds, ...confusedIds])].slice(0, 5);
    this.queue = allIds
      .map((id) => CHARACTER_DATABASE.find((c) => c.id === id))
      .filter(Boolean);

    // 若无到期复习字，抽取已学字或基础字进行巩固
    if (this.queue.length === 0) {
      const learnedIds = Object.keys(ebbinghausManager.progress.charRecords || {});
      if (learnedIds.length > 0) {
        this.queue = learnedIds.slice(0, 5).map((id) => CHARACTER_DATABASE.find((c) => c.id === id)).filter(Boolean);
      } else {
        this.queue = CHARACTER_DATABASE.slice(0, 5);
      }
    }

    this.currentIndex = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
  }

  destroy() {
    if (this.drillEngine?.destroy) {
      this.drillEngine.destroy();
      this.drillEngine = null;
    }
    super.destroy();
  }

  render() {
    this.destroy();
    if (!this.queue || this.queue.length === 0 || this.currentIndex >= this.queue.length) {
      this.initQueue();
    }
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
      <div class="relative w-full h-full min-h-[640px] flex flex-col select-none overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950 text-white animate-fade-in">
        
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/20">
          <div class="flex items-center gap-2">
            <button id="btn-review-empty-header-back" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer active:scale-95">
              <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
              <span>返回地图</span>
            </button>
            <button id="btn-review-empty-sound" class="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg cursor-pointer" title="声音开关">
              ${__rvSpeakerIcon}
            </button>
          </div>
          <div class="flex items-center gap-2">
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.coin("w-4 h-4")}<span>${__rvProgress.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.star("w-4 h-4", false)}<span>${__rvProgress.stars}</span>
            </div>
          </div>
        </header>

        <main class="relative z-10 flex-1 flex items-center justify-center p-6">
          <div class="flex flex-col items-center text-center animate-scale-up bg-white/10 backdrop-blur-md p-8 sm:p-10 rounded-3xl border-2 border-white/20 shadow-2xl max-w-md">
            <div class="mb-4 flex items-center justify-center scale-125">${GAME_ICONS.reviewBell("w-20 h-20")}</div>
            <h2 class="text-2xl font-black text-yellow-300 mb-2">记忆状态极佳！</h2>
            <p class="text-xs sm:text-sm text-white/80 mb-6 font-semibold leading-relaxed">
              当前没有待复习的薄弱生字，艾宾浩斯记忆库饱满，继续去大地图探索新汉字吧！
            </p>
            <button id="btn-review-empty-back" class="btn-game-orange text-white font-black text-sm sm:text-base px-10 py-3 rounded-full flex items-center gap-2 shadow-xl active:scale-95 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.home("w-5 h-5")}</span>
              <span>返回大地图</span>
            </button>
          </div>
        </main>
      </div>
    `;

    const backBtn = this.container.querySelector("#btn-review-empty-back");
    if (backBtn) {
      this._on(backBtn, "click", () => {
        soundAndFX.playPop();
        this._busEmit(EVENTS.SWITCH_MODE, { mode: "map" });
      });
    }

    const headerBackBtn = this.container.querySelector("#btn-review-empty-header-back");
    if (headerBackBtn) {
      this._on(headerBackBtn, "click", () => {
        soundAndFX.playPop();
        this._busEmit(EVENTS.SWITCH_MODE, { mode: "map" });
      });
    }

    const soundBtn = this.container.querySelector("#btn-review-empty-sound");
    if (soundBtn) {
      this._on(soundBtn, "click", () => {
        soundAndFX.toggleMute();
        const ic = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
        soundBtn.innerHTML = ic;
      });
    }
  }

  renderRound() {
    const __rvProgress = ebbinghausManager.progress;
    const __rvSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
    const charData = this.queue[this.currentIndex];
    const progress = this.currentIndex + 1;

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col select-none overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white animate-fade-in">
        
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/20">
          <button id="btn-review-quit" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer active:scale-95">
            <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
            <span>返回地图</span>
          </button>

          <div class="candy-pill flex items-center gap-2 px-5 py-1.5 rounded-full border border-yellow-300/40">
            <span class="text-xs text-amber-200 font-bold">艾宾浩斯复习:</span>
            <span class="text-yellow-300 font-black text-sm font-mono">${progress} / ${this.queue.length}</span>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-review-sound" class="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg cursor-pointer" title="声音开关">
              ${__rvSpeakerIcon}
            </button>
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.coin("w-4 h-4")}<span>${__rvProgress.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.star("w-4 h-4", false)}<span>${__rvProgress.stars}</span>
            </div>
          </div>
        </header>

        <main id="drill-container" class="relative z-10 flex-1 w-full flex items-center justify-center p-4 sm:p-6">
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
        const ic = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
        soundBtn.innerHTML = ic;
      });
    }

    const drillStage = this.container.querySelector("#drill-container");
    this.drillEngine = new DrillEngine(drillStage, charData, () => {
      // 完成单个字的强化训练
      const perfect = (this.drillEngine.bestCombo || 0) >= 2;
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
    const __rvSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
    const total = this.queue.length;
    const perfect = this.wrongCount === 0;

    if (perfect) {
      soundAndFX.playCrownFanfare();
      soundAndFX.triggerConfetti(this.container);
    } else {
      soundAndFX.playParentCheer();
    }

    const earnedCoins = this.correctCount * 5 + 10;
    ebbinghausManager.addCoins(earnedCoins);

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex items-center justify-center bg-gradient-to-b from-purple-950 via-indigo-950 to-purple-900 select-none p-4 animate-fade-in text-white">
        <div class="flex flex-col items-center text-center bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/20 p-8 sm:p-10 max-w-lg shadow-2xl animate-scale-up">
          
          <div class="mb-3 flex items-center justify-center">
            ${perfect ? GAME_ICONS.trophy("w-20 h-20 sm:w-24 sm:h-24") : GAME_ICONS.star("w-20 h-20 sm:w-24 sm:h-24", false)}
          </div>
          
          <h2 class="text-2xl sm:text-3xl font-black text-yellow-300 mb-2">
            ${perfect ? "满分通关！记忆大师！" : "复习完成 · 牢固掌握！"}
          </h2>
          
          <p class="text-xs sm:text-sm text-white/80 mb-5 font-semibold">
            本次共强化复习 <b>${total}</b> 个汉字 · 掌握 <b>${this.correctCount}</b> 字 · 需再练 <b>${this.wrongCount}</b> 字
          </p>

          <div class="flex items-center gap-2 mb-4 flex-wrap justify-center">
            ${this.queue.map(c => `
              <div class="reviewed-char-chip w-12 h-12 rounded-2xl bg-white/20 hover:bg-white/30 border-2 border-yellow-300/50 flex flex-col items-center justify-center cursor-pointer active:scale-90 transition-transform font-serif shadow" data-char="${c.char}">
                <span class="text-xl font-black text-white leading-none">${c.char}</span>
                <span class="text-[9px] text-yellow-300 font-sans mt-0.5">${c.pinyin}</span>
              </div>
            `).join("")}
          </div>

          <div class="candy-pill rounded-2xl px-6 py-2.5 mb-6 text-sm text-yellow-300 font-black flex items-center gap-2 border border-yellow-300/40">
            ${GAME_ICONS.coin("w-5 h-5")}
            <span>奖励 +${earnedCoins} 凯茜星币</span>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <button id="btn-review-print" class="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-full flex items-center gap-2 shadow-xl active:scale-95 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.print("w-4 h-4")}</span>
              <span>打印复习字帖</span>
            </button>
            <button id="btn-review-done" class="btn-game-orange text-white font-black text-xs sm:text-sm px-8 py-3.5 rounded-full flex items-center gap-2 shadow-2xl active:scale-95 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
              <span>领取奖励 · 返回大地图</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // 绑定生字发音
    this.container.querySelectorAll(".reviewed-char-chip").forEach(chip => {
      this._on(chip, "click", () => {
        soundAndFX.playPop();
        soundAndFX.speakPriority(chip.dataset.char, { kind: "char", priority: 1 });
      });
    });

    // 绑定打印字帖
    const printBtn = this.container.querySelector("#btn-review-print");
    if (printBtn) {
      this._on(printBtn, "click", () => {
        soundAndFX.playPop();
        printWorksheet(this.queue, "凯茜识字 · 每日复习巩固描红字帖");
      });
    }

    const doneBtn = this.container.querySelector("#btn-review-done");
    if (doneBtn) {
      this._on(doneBtn, "click", () => {
        soundAndFX.playPop();
        const res = { correct: this.correctCount, total: this.queue.length };
        this.initQueue();
        this._busEmit(EVENTS.REVIEW_FINISH, res);
        this._busEmit(EVENTS.SWITCH_MODE, { mode: "map" });
      });
    }
  }
}
