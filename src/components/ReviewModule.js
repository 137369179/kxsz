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
import { BaseModule, escapeHtml } from "../utils/BaseModule.js";
import { DrillEngine } from "../utils/drillEngine.js";
import { EVENTS } from "../utils/eventBus.js";
import { GAME_ICONS } from "../utils/gameIcons.js";
import { printWorksheet } from "../utils/worksheetGenerator.js";
import { getSessionConfig } from "../utils/sessionPlanner.js";
// P4 引擎接入：B8 原子卡 + B3 FSRS 调度 + B19 多模态编排
import {
  buildAtomicCardsForChar,
  expandCharsToAtomicQueue,
  recordAtomicAnswer,
  isCardMastered,
  ATOMIC_CARD_TYPES,
} from "../utils/flashcardEngine.js";
import {
  initFSRSRecord,
  migrateToFSRS,
  FSRGRating,
  isIntradayReview,
  fsrsPredict,
} from "../utils/fsrsScheduler.js";
import { forChar as mmForChar, SCENES as MM_SCENES } from "../utils/multimodalEngine.js";

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
    // SM-18 遗忘警报追踪
    this.consecutiveMistakes = {};  // { charId: number } 连续失误计数
    this.forgottenChars = [];       // 警报字列表（charId）
    this.initQueue();
  }

  initQueue() {
    // E6 B4 米勒 7±2：按年龄决定复习块大小，不再硬编码 5
    const cfg = getSessionConfig(ebbinghausManager.getAge());
    const wantRev = cfg.reviews;

    const dueIds = ebbinghausManager.getDueReviewCharIds().slice(0, Math.max(wantRev, 3));
    const errorProfile = ebbinghausManager.progress.errorProfiles || {};
    const confusedPairs = errorProfile.confusedPairs || {};
    const confusedIds = Object.entries(confusedPairs)
      .sort((a, b) => {
        const countA = typeof a[1] === "object" ? Object.values(a[1]).reduce((s, v) => s + v, 0) : Number(a[1]) || 0;
        const countB = typeof b[1] === "object" ? Object.values(b[1]).reduce((s, v) => s + v, 0) : Number(b[1]) || 0;
        return countB - countA;
      })
      .slice(0, Math.max(wantRev - dueIds.length, 2))
      .map(([charId]) => charId);

    const allIds = [...new Set([...dueIds, ...confusedIds])].slice(0, wantRev);
    this.queue = allIds
      .map((id) => CHARACTER_DATABASE.find((c) => c.id === id))
      .filter(Boolean);

    // P4 B8: 跳过 flashcardEngine 判定所有原子卡已掌握的字
    // P4 B3: 用 FSRS predict 排序 — 先复习弱字，强字排后
    const records = ebbinghausManager.progress.charRecords || {};
    this.queue = this.queue
      .filter((c) => {
        const rec = records[c.id];
        if (!rec) return true;  // 未记录过的字保留
        // 所有 5 张原子卡都已掌握 → 这个字暂时跳过
        const allMastered = Object.values(ATOMIC_CARD_TYPES).every((t) =>
          isCardMastered(rec, t)
        );
        return !allMastered;
      })
      .sort((a, b) => {
        const recA = records[a.id];
        const recB = records[b.id];
        const predA = fsrsPredict(recA?._fsrsState || recA);
        const predB = fsrsPredict(recB?._fsrsState || recB);
        // retention 低的排前面（先复习遗忘风险高的字）
        return (predA.retention ?? 1) - (predB.retention ?? 1);
      });

    // 若无到期复习字，抽取已学字或基础字进行巩固
    if (this.queue.length === 0) {
      const learnedIds = Object.keys(ebbinghausManager.progress.charRecords || {});
      if (learnedIds.length > 0) {
        this.queue = learnedIds.slice(0, wantRev).map((id) => CHARACTER_DATABASE.find((c) => c.id === id)).filter(Boolean);
      } else {
        this.queue = CHARACTER_DATABASE.slice(0, wantRev);
      }
    }

    this.currentIndex = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.consecutiveMistakes = {};
    this.forgottenChars = [];
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

    // P4 B19: 多模态编排器 — 为当前复习字生成模态包
    const __mm = mmForChar(charData, MM_SCENES.REVIEW);
    const __emoji    = __mm.modalities.visual_emoji?.emoji;
    const __radical  = __mm.modalities.semantic_radical?.radical;
    const __confuses = __mm.modalities.semantic_confuse?.confusables || [];
    const __chant    = __mm.modalities.auditory_chant?.chant;

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

        <!-- P4 B19: 多模态预览条 — 由 multimodalEngine 编排 -->
        <div class="relative z-20 w-full px-4 py-1.5 flex items-center gap-2 flex-wrap justify-center bg-black/30 backdrop-blur-sm border-b border-white/10 text-xs font-bold">
          ${__emoji ? `<span class="bg-white/15 text-white px-2 py-0.5 rounded-full border border-white/20">形象提示</span>` : ''}
          ${__radical ? `<span class="bg-amber-500/25 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/40">部首 ${__radical}</span>` : ''}
          ${__confuses.length ? `<span class="bg-rose-500/25 text-rose-200 px-2 py-0.5 rounded-full border border-rose-400/40">⚠ 别搞混 ${__confuses.slice(0, 3).join(' ')}</span>` : ''}
          ${__chant ? `<span class="bg-emerald-500/25 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/40">口诀：${__chant}</span>` : ''}
        </div>

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
      const charId = charData.id;
      const records = ebbinghausManager.progress.charRecords;
      let charRec = records[charId];

      // P4 B3: ensure FSRS state exists (lazy migrate)
      if (charRec && !charRec._fsrsState) {
        charRec._fsrsState = migrateToFSRS(charRec);
      } else if (!charRec) {
        charRec = records[charId] = {
          charId,
          learnedAt: Date.now(),
          reviewCount: 0,
          correctStreak: 0,
          masteryRate: 60,
          nextReviewDate: Date.now(),
          isDifficult: false,
          ...initFSRSRecord(charId),
        };
      }

      // P4 B3: 决定 FSRS rating（perfect → GOOD/EASY，否则 HARD/AGAIN）
      let rating;
      if (perfect) {
        rating = (this.drillEngine.bestCombo || 0) >= 4 ? FSRGRating.EASY : FSRGRating.GOOD;
      } else if ((this.consecutiveMistakes[charId] || 0) >= 2) {
        rating = FSRGRating.AGAIN;
      } else {
        rating = FSRGRating.HARD;
      }

      // 单路径：只通过 completeReview 调度一次，避免 scheduleFSRS + completeReview 双写覆盖
      for (const cardType of Object.values(ATOMIC_CARD_TYPES)) {
        recordAtomicAnswer(charRec, cardType, perfect);
      }

      if (perfect) {
        this.correctCount++;
        this.consecutiveMistakes[charId] = 0;
        ebbinghausManager.completeReview(charId, rating);
        ebbinghausManager.addCoins(5);
      } else {
        this.wrongCount++;
        this.consecutiveMistakes[charId] = (this.consecutiveMistakes[charId] || 0) + 1;
        ebbinghausManager.completeReview(charId, rating);
        ebbinghausManager.addCoins(1);

        // SM-18 遗忘警报：连续错 2 次及以上触发
        if (this.consecutiveMistakes[charId] >= 2 && !this.forgottenChars.includes(charId)) {
          this.forgottenChars.push(charId);
          // 在队列末尾追加巳固题（该字再别练一次）
          if (!this.queue.slice(this.currentIndex + 1).some(c => c.id === charId)) {
            this.queue.push(charData);
          }
          // 语音提示
          soundAndFX.speakPriority('这个字小有困难，再练一次吧', { kind: 'tutorial', priority: 1 });
          // 遗忘警报横幅
          this._showForgottenAlert(charData);
        }
      }

      this.currentIndex++;
      if (this.currentIndex < this.queue.length) {
        this.renderRound();
      } else {
        this.renderSummary();
      }
    });
  }

  /**
   * 遗忘警报横幅（SM-18 遗忘警报）
   * @param {object} charData
   */
  _showForgottenAlert(charData) {
    const banner = document.createElement('div');
    banner.id = 'forgotten-alert-banner';
    banner.style.cssText = [
      'position:fixed',
      'top:80px',
      'left:50%',
      'transform:translateX(-50%)',
      'z-index:9999',
      'background:linear-gradient(135deg,#dc2626,#b91c1c)',
      'color:#fff',
      'padding:12px 28px',
      'border-radius:999px',
      'font-weight:900',
      'font-size:15px',
      'box-shadow:0 8px 32px rgba(220,38,38,0.4)',
      'display:flex',
      'align-items:center',
      'gap:10px',
      'letter-spacing:0.03em',
      'pointer-events:none',
      'animation:slideDown 0.3s ease',
    ].join(';');
    banner.innerHTML = [
      GAME_ICONS.star('w-5 h-5', false),
      `<span>「${escapeHtml(charData.char)}」需要加强巳固！已加入本轮末尾重练</span>`,
    ].join('');
    document.body.appendChild(banner);
    setTimeout(() => { banner.remove(); }, 3200);
  }

  renderSummary() {
    // 停止所有当前音频，防止音效重叠
    soundAndFX.stopSpeaking?.();

    const __rvProgress = ebbinghausManager.progress;
    const __rvSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
    const total = this.queue.length;
    const perfect = this.wrongCount === 0;
    const forgottenSet = new Set(this.forgottenChars);

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
              <div class="reviewed-char-chip w-12 h-12 rounded-2xl
                ${forgottenSet.has(c.id)
                  ? 'bg-red-500/30 border-2 border-red-400'
                  : 'bg-white/20 border-2 border-yellow-300/50'}
                hover:bg-white/30 flex flex-col items-center justify-center cursor-pointer active:scale-90 transition-transform font-serif shadow" data-char="${escapeHtml(c.char)}">
                <span class="text-xl font-black text-white leading-none">${escapeHtml(c.char)}</span>
                <span class="text-[9px] ${forgottenSet.has(c.id) ? 'text-red-300' : 'text-yellow-300'} font-sans mt-0.5">
                  ${forgottenSet.has(c.id) ? '加强' : escapeHtml(c.pinyin)}
                </span>
              </div>
            `).join("")}
          </div>

          ${this.forgottenChars.length > 0 ? `
          <div class="w-full bg-red-900/30 border border-red-500/40 rounded-2xl px-4 py-2.5 mb-4 text-xs text-red-300 font-bold flex items-center gap-2">
            ${GAME_ICONS.star('w-4 h-4', false)}
            <span>需加强：${this.forgottenChars.map(id => { const c = this.queue.find(q => q.id === id); return c ? c.char : id; }).join('、')}（明日优先安排复习）</span>
          </div>` : ''}

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
