/**
 * 凯茜识字 (Cathy Literacy) - 艾宾浩斯智能复习与巩固中心
 * ------------------------------------------------------------
 * 1. 严格依据遗忘曲线提取待复习生字（仅已学字；优先薄弱字与到期字）
 * 2. 主路径：自由提取 / 听音指认（freeRecallView），按单卡种诚实记账
 * 3. 统计全对率、生成结算奖励、颁发星币与荣誉徽章
 */

import { CHARACTER_DATABASE } from "../data/characters.js";
import { CHARACTER_DETAILS } from "../data/characterDetails.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { BaseModule, escapeHtml } from "../utils/BaseModule.js";
import { EVENTS } from "../utils/eventBus.js";
import { GAME_ICONS } from "../utils/gameIcons.js";
import { printWorksheet } from "../utils/worksheetGenerator.js";
import { getSessionConfig } from "../utils/sessionPlanner.js";
import {
  recordAtomicAnswer,
  isCardMastered,
  ATOMIC_CARD_TYPES,
} from "../utils/flashcardEngine.js";
import {
  initFSRSRecord,
  migrateToFSRS,
  fsrsPredict,
} from "../utils/fsrsScheduler.js";
import { confusedTargetsForReview } from "../utils/reviewConfused.js";
import {
  mountFreeRecallRound,
  mapSelfReportToRating,
  buildInterleavePack,
  runInterleaveSession,
} from "../utils/reviewHub/index.js";

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
    this._freeRecall = null;
    // SM-18 遗忘警报追踪
    this.consecutiveMistakes = {};  // { charId: number } 连续失误计数
    this.forgottenChars = [];       // 警报字列表（charId）
    this.initQueue();
  }

  initQueue() {
    // E6 B4 米勒 7±2：按年龄决定复习块大小，不再硬编码 5
    const cfg = getSessionConfig(ebbinghausManager.getAge());
    const wantRev = cfg.reviews;
    const records = ebbinghausManager.progress.charRecords || {};
    const learnedIds = Object.keys(records);
    const learnedSet = new Set(learnedIds);

    this.currentIndex = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.consecutiveMistakes = {};
    this.forgottenChars = [];

    // 仅已学字；无已学 → 空队列（禁止字库前 N 字凑数）
    if (learnedIds.length === 0) {
      this.queue = [];
      return;
    }

    const dueIds = ebbinghausManager
      .getDueReviewCharIds()
      .filter((id) => learnedSet.has(id))
      .slice(0, Math.max(wantRev, 3));

    const confusedChars = confusedTargetsForReview(
      ebbinghausManager.progress.errorProfiles,
      Math.max(wantRev - dueIds.length, 2)
    ).filter((c) => learnedSet.has(c.id));
    const confusedIds = confusedChars.map((c) => c.id);

    const allIds = [...new Set([...dueIds, ...confusedIds])].slice(0, wantRev);
    this.queue = allIds
      .map((id) => CHARACTER_DATABASE.find((c) => c.id === id))
      .filter(Boolean);

    // P4 B8: 跳过 flashcardEngine 判定所有原子卡已掌握的字
    // P4 B3: 用 FSRS predict 排序 — 先复习弱字，强字排后
    this.queue = this.queue
      .filter((c) => {
        const rec = records[c.id];
        if (!rec) return true;
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
        return (predA.retention ?? 1) - (predB.retention ?? 1);
      });

    // 若无到期/混淆字，从已学字巩固（仍禁止未学字库切片）
    if (this.queue.length === 0) {
      this.queue = learnedIds
        .slice(0, wantRev)
        .map((id) => CHARACTER_DATABASE.find((c) => c.id === id))
        .filter(Boolean);
    }
  }

  destroy() {
    if (this._freeRecall?.destroy) {
      this._freeRecall.destroy();
      this._freeRecall = null;
    }
    if (this._interleave?.destroy) {
      this._interleave.destroy();
      this._interleave = null;
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

  _pickDistractors(charData, count = 3) {
    const out = [];
    const seen = new Set([charData.char]);
    const pushChar = (ch) => {
      if (!ch || seen.has(ch)) return;
      seen.add(ch);
      out.push(ch);
    };

    const confuse = charData.confusingChars || [];
    for (const ref of confuse) {
      if (out.length >= count) break;
      const resolved =
        typeof ref === "string"
          ? CHARACTER_DATABASE.find((c) => c.char === ref || c.id === ref)
          : null;
      pushChar(resolved?.char || (typeof ref === "string" && ref.length <= 2 ? ref : null));
    }

    const learnedIds = Object.keys(ebbinghausManager.progress.charRecords || {});
    for (const id of shuffle(learnedIds)) {
      if (out.length >= count) break;
      const c = CHARACTER_DATABASE.find((x) => x.id === id);
      if (c) pushChar(c.char);
    }

    for (const c of CHARACTER_DATABASE) {
      if (out.length >= count) break;
      pushChar(c.char);
    }

    return out.slice(0, count);
  }

  renderRound() {
    const __rvProgress = ebbinghausManager.progress;
    const __rvSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
    const charData = this.queue[this.currentIndex];
    const progress = this.currentIndex + 1;

    // Free-recall prompt：不渲染易混 / 口诀 / 部首剧透条
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

        <main id="recall-container" class="relative z-10 flex-1 w-full flex items-center justify-center p-4 sm:p-6">
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

    const recallStage = this.container.querySelector("#recall-container");
    const age = ebbinghausManager.getAge();
    const distractorChars = this._pickDistractors(charData, 3);

    if (this._freeRecall?.destroy) {
      this._freeRecall.destroy();
      this._freeRecall = null;
    }

    this._freeRecall = mountFreeRecallRound({
      containerEl: recallStage,
      charData,
      age,
      distractorChars,
      on: (el, evt, fn) => this._on(el, evt, fn),
      onComplete: ({ knew, cardType }) => {
        this._handleRecallComplete(charData, knew, cardType);
      },
    });
  }

  _handleRecallComplete(charData, knew, cardType) {
    const charId = charData.id;
    const records = ebbinghausManager.progress.charRecords;
    let charRec = records[charId];

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

    // 诚实性：只记本次卡种一次
    recordAtomicAnswer(charRec, cardType, !!knew);

    const rating = mapSelfReportToRating(!!knew);
    ebbinghausManager.completeReview(charId, rating);

    if (knew) {
      this.correctCount++;
      this.consecutiveMistakes[charId] = 0;
      ebbinghausManager.addCoins(5);
    } else {
      this.wrongCount++;
      this.consecutiveMistakes[charId] = (this.consecutiveMistakes[charId] || 0) + 1;
      ebbinghausManager.addCoins(1);

      if (this.consecutiveMistakes[charId] >= 2 && !this.forgottenChars.includes(charId)) {
        this.forgottenChars.push(charId);
        if (!this.queue.slice(this.currentIndex + 1).some((c) => c.id === charId)) {
          this.queue.push(charData);
        }
        soundAndFX.speakPriority("这个字我们再练一次吧", { kind: "tutorial", priority: 1 });
        this._showForgottenAlert(charData);
      }
    }

    this.currentIndex++;
    if (this.currentIndex < this.queue.length) {
      this.renderRound();
    } else {
      this._maybeRunInterleaveThenSummary();
    }
  }

  /**
   * After free-recall queue ends, optionally run a confuse interleave pack
   * before the session summary.
   */
  _maybeRunInterleaveThenSummary() {
    if (this._freeRecall?.destroy) {
      this._freeRecall.destroy();
      this._freeRecall = null;
    }
    if (this._interleave?.destroy) {
      this._interleave.destroy();
      this._interleave = null;
    }

    const learnedIds = new Set(Object.keys(ebbinghausManager.progress.charRecords || {}));
    const preferIds = new Set((this.queue || []).map((c) => c.id).filter(Boolean));
    // 仅合并已学字，避免整库 1489 次展开
    const mergedChars = [...learnedIds]
      .map((id) => {
        const base = CHARACTER_DATABASE.find((c) => c.id === id);
        if (!base) return null;
        return { ...base, ...(CHARACTER_DETAILS[id] || {}) };
      })
      .filter(Boolean);

    const pack = buildInterleavePack({
      chars: mergedChars,
      learnedIds,
      preferIds,
      errorProfiles: ebbinghausManager.progress.errorProfiles || {},
      limit: 6,
    });

    const goSummary = () => {
      if (this._interleave?.destroy) {
        this._interleave.destroy();
        this._interleave = null;
      }
      this.renderSummary();
    };

    if (pack.length >= 2) {
      this._interleave = runInterleaveSession({
        containerEl: this.container,
        pack,
        on: (el, evt, fn) => this._on(el, evt, fn),
        onAnswer: ({ correct, question, selectedChar }) => {
          const id = question?.targetId;
          if (!id) return;
          ebbinghausManager.completeReview(id, correct);
          if (!correct && typeof ebbinghausManager.recordMistake === "function") {
            try {
              ebbinghausManager.recordMistake(id, "similar_confuse", {
                targetChar: question.targetChar,
                selectedChar: selectedChar || "",
              });
            } catch (_) {
              /* ignore */
            }
          }
        },
        onFinished: goSummary,
        onQuit: goSummary,
      });
    } else {
      goSummary();
    }
  }

  /**
   * 再练提示横幅（中性文案，避免恐吓感）
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
      'background:linear-gradient(135deg,#2563eb,#1d4ed8)',
      'color:#fff',
      'padding:12px 28px',
      'border-radius:999px',
      'font-weight:900',
      'font-size:15px',
      'box-shadow:0 8px 32px rgba(37,99,235,0.35)',
      'display:flex',
      'align-items:center',
      'gap:10px',
      'letter-spacing:0.03em',
      'pointer-events:none',
      'animation:slideDown 0.3s ease',
    ].join(';');
    banner.innerHTML = [
      GAME_ICONS.star('w-5 h-5', false),
      `<span>「${escapeHtml(charData.char)}」我们再练一次吧 · 已加入本轮末尾</span>`,
    ].join('');
    document.body.appendChild(banner);
    setTimeout(() => { banner.remove(); }, 3200);
  }

  renderSummary() {
    // 停止所有当前音频，防止音效重叠
    soundAndFX.stopSpeaking?.();

    if (this._freeRecall?.destroy) {
      this._freeRecall.destroy();
      this._freeRecall = null;
    }

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
                  ? 'bg-sky-500/25 border-2 border-sky-300/60'
                  : 'bg-white/20 border-2 border-yellow-300/50'}
                hover:bg-white/30 flex flex-col items-center justify-center cursor-pointer active:scale-90 transition-transform font-serif shadow" data-char="${escapeHtml(c.char)}">
                <span class="text-xl font-black text-white leading-none">${escapeHtml(c.char)}</span>
                <span class="text-[9px] ${forgottenSet.has(c.id) ? 'text-sky-200' : 'text-yellow-300'} font-sans mt-0.5">
                  ${forgottenSet.has(c.id) ? '再练' : escapeHtml(c.pinyin)}
                </span>
              </div>
            `).join("")}
          </div>

          ${this.forgottenChars.length > 0 ? `
          <div class="w-full bg-sky-900/30 border border-sky-400/40 rounded-2xl px-4 py-2.5 mb-4 text-xs text-sky-100 font-bold flex items-center gap-2">
            ${GAME_ICONS.star('w-4 h-4', false)}
            <span>明天优先再看看：${this.forgottenChars.map(id => { const c = this.queue.find(q => q.id === id); return c ? c.char : id; }).join('、')}</span>
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
