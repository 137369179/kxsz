/**
 * ReviewModule — 易错难字消灭战（专项攻坚模式）
 * Zero Unicode Emoji & Zero Vector SVG
 */
import { CHARACTER_DATABASE } from "../../data/characters.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";
import { escapeHtml } from "../BaseModule.js";
import { triggerHapticSuccess, triggerHapticWarning } from "../haptics.js";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 启动易错难字专项消灭战
 * @param {object} options
 * @param {HTMLElement} options.containerEl
 * @param {object} [options.ebbinghaus]
 * @param {Array} [options.characterDB]
 * @param {Function} [options.onFinish]
 * @param {Function} [options.onQuit]
 * @returns {{ destroy: Function }}
 */
export function runMistakeAssaultSession({
  containerEl,
  ebbinghaus = ebbinghausManager,
  characterDB = CHARACTER_DATABASE,
  onFinish,
  onQuit,
}) {
  let isDestroyed = false;
  let activeTimeouts = [];
  let cleanupListeners = [];

  const addTimeout = (fn, delay) => {
    const t = setTimeout(fn, delay);
    activeTimeouts.push(t);
    return t;
  };

  const clearTimeouts = () => {
    activeTimeouts.forEach((t) => clearTimeout(t));
    activeTimeouts = [];
  };

  const addListener = (el, evt, fn) => {
    if (!el) return;
    el.addEventListener(evt, fn);
    cleanupListeners.push(() => el.removeEventListener(evt, fn));
  };

  const clearListeners = () => {
    cleanupListeners.forEach((cleanup) => cleanup());
    cleanupListeners = [];
  };

  const destroy = () => {
    isDestroyed = true;
    clearTimeouts();
    clearListeners();
    try {
      soundAndFX.stopSpeaking?.();
    } catch {}
  };

  // 1. 提取需攻坚的难字 / 低掌握度字
  const progress = ebbinghaus.progress || {};
  const learnedIds = new Set(Object.keys(progress.charRecords || {}));

  let targetIds = ebbinghaus.getDifficultCharIds ? ebbinghaus.getDifficultCharIds() : [];
  targetIds = targetIds.filter((id) => learnedIds.has(id));

  if (targetIds.length === 0) {
    const records = Object.values(progress.charRecords || {});
    records.sort((a, b) => (a.masteryRate ?? 60) - (b.masteryRate ?? 60));
    targetIds = records.slice(0, 5).map((r) => r.charId);
  }

  const targets = targetIds
    .map((id) => characterDB.find((c) => c.id === id))
    .filter(Boolean)
    .slice(0, 5);

  // 若仍为空（尚未学习任何汉字）
  if (targets.length === 0) {
    containerEl.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex items-center justify-center bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 p-6 select-none animate-fade-in text-white">
        <div class="flex flex-col items-center text-center bg-white/10 backdrop-blur-md p-8 sm:p-10 rounded-3xl border-2 border-white/20 shadow-2xl max-w-md animate-scale-up">
          <div class="mb-4 flex items-center justify-center scale-125">${GAME_ICONS.shieldLock("w-20 h-20")}</div>
          <h2 class="text-2xl font-black text-yellow-300 mb-2">城堡十分安宁！</h2>
          <p class="text-xs sm:text-sm text-white/80 mb-6 font-semibold leading-relaxed">
            你目前还没有易错难字记录，先去大地图认识新的汉字宝宝吧！
          </p>
          <button id="btn-assault-empty-quit" class="btn-game-orange text-white font-black text-sm px-8 py-3 rounded-full flex items-center gap-2 shadow-xl active:scale-95 cursor-pointer touch-target" data-speak="返回大地图">
            <span class="flex items-center">${GAME_ICONS.home("w-5 h-5")}</span>
            <span>返回大地图</span>
          </button>
        </div>
      </div>
    `;
    const emptyBtn = containerEl.querySelector("#btn-assault-empty-quit");
    addListener(emptyBtn, "click", () => {
      destroy();
      soundAndFX.playPop();
      onQuit?.();
    });
    return { destroy };
  }

  let currentIndex = 0;
  let clearedCount = 0;
  const totalCount = targets.length;

  const pickDistractors = (curChar) => {
    const distractors = [];
    const seen = new Set([curChar.char]);

    const confuse = curChar.confusingChars || [];
    for (const ref of confuse) {
      if (distractors.length >= 3) break;
      const charStr = typeof ref === "string" ? (characterDB.find((c) => c.id === ref || c.char === ref)?.char || (ref.length <= 2 ? ref : null)) : ref?.char;
      if (charStr && !seen.has(charStr)) {
        seen.add(charStr);
        distractors.push(charStr);
      }
    }

    for (const id of shuffleArray([...learnedIds])) {
      if (distractors.length >= 3) break;
      const c = characterDB.find((x) => x.id === id);
      if (c && !seen.has(c.char)) {
        seen.add(c.char);
        distractors.push(c.char);
      }
    }

    for (const c of characterDB) {
      if (distractors.length >= 3) break;
      if (!seen.has(c.char)) {
        seen.add(c.char);
        distractors.push(c.char);
      }
    }

    return distractors.slice(0, 3);
  };

  const renderRound = () => {
    if (isDestroyed) return;
    clearTimeouts();
    clearListeners();

    if (currentIndex >= totalCount) {
      renderVictory();
      return;
    }

    const curChar = targets[currentIndex];
    const options = shuffleArray([curChar.char, ...pickDistractors(curChar)]);
    const currentProgress = ebbinghaus.progress || {};
    const speakerIcon = soundAndFX.isMuted
      ? GAME_ICONS.speaker("w-5 h-5", true)
      : GAME_ICONS.speaker("w-5 h-5", false);

    containerEl.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-gradient-to-b from-slate-950 via-rose-950 to-slate-950 text-white animate-fade-in">
        
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/20">
          <button id="btn-assault-quit" data-speak="退出突击战" aria-label="退出突击战" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer active:scale-95 touch-target">
            <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
            <span>返回</span>
          </button>

          <div class="candy-pill flex items-center gap-2 px-5 py-1.5 rounded-full border border-rose-400/40 bg-rose-950/60 shadow-inner">
            <span class="flex items-center">${GAME_ICONS.swords("w-4 h-4")}</span>
            <span class="text-xs text-rose-200 font-bold">难字消灭战:</span>
            <span class="text-yellow-300 font-black text-sm font-mono">${currentIndex + 1} / ${totalCount}</span>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-assault-sound" class="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg cursor-pointer touch-target" title="声音开关">
              ${speakerIcon}
            </button>
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.coin("w-4 h-4")}<span>${currentProgress.coins || 0}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.star("w-4 h-4", false)}<span>${currentProgress.stars || 0}</span>
            </div>
          </div>
        </header>

        <main class="relative z-10 flex-1 flex flex-col items-center justify-center p-4 text-center">
          
          <div class="w-full max-w-md bg-black/60 h-4 rounded-full overflow-hidden border-2 border-rose-400 mb-5 p-0.5 shadow-lg">
            <div class="bg-gradient-to-r from-red-500 via-rose-400 to-amber-300 h-full rounded-full transition-all duration-500" style="width: ${Math.round(((currentIndex + 1) / totalCount) * 100)}%"></div>
          </div>

          <div class="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-900 border-4 border-rose-400 shadow-2xl flex items-center justify-center mb-4 transition-all">
            <div class="scale-110 flex items-center justify-center">${GAME_ICONS.monster("w-20 h-20 sm:w-24 sm:h-24")}</div>
            <div class="absolute -top-3 bg-red-600 text-white font-black text-[10px] px-3 py-0.5 rounded-full border border-white z-10 shadow">
              难字暗黑印记
            </div>
          </div>

          <div class="flex items-center gap-2 mb-2">
            <h2 class="text-xl sm:text-2xl font-black text-yellow-300 tracking-wide">
              找出难字：“${escapeHtml(curChar.char)}”
            </h2>
            <button id="btn-assault-speak" class="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center active:scale-95 cursor-pointer touch-target border border-white/30 shadow" title="朗读题目" aria-label="朗读题目" data-speak="找出难字：${escapeHtml(curChar.char)}">
              <span class="flex items-center">${GAME_ICONS.speaker("w-5 h-5")}</span>
            </button>
          </div>

          <p class="text-xs text-rose-200 mb-6 font-semibold flex items-center gap-2">
            <span class="bg-black/40 px-2.5 py-0.5 rounded-full border border-rose-400">拼音: ${escapeHtml(curChar.pinyin || "")}</span>
            ${curChar.meaning ? `<span class="bg-black/40 px-2.5 py-0.5 rounded-full border border-rose-400">释义: ${escapeHtml(curChar.meaning)}</span>` : ""}
          </p>

          <div id="assault-options-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-xl">
            ${options
              .map(
                (opt, idx) => `
              <button id="assault-opt-${idx}" class="assault-opt-btn h-20 sm:h-24 rounded-3xl bg-white/15 hover:bg-white/25 active:scale-95 border-2 border-white/30 text-white font-black text-4xl sm:text-5xl shadow-2xl transition-all flex items-center justify-center cursor-pointer touch-target" data-char="${escapeHtml(opt)}" data-speak="选择 ${escapeHtml(opt)}" aria-label="选择 ${escapeHtml(opt)}">
                ${escapeHtml(opt)}
              </button>
            `
              )
              .join("")}
          </div>

          <div id="assault-feedback-msg" class="h-6 mt-4 text-xs font-black text-amber-300 transition-opacity opacity-0"></div>

        </main>
      </div>
    `;

    // 语音朗读出题
    soundAndFX.playPop();
    addTimeout(() => {
      soundAndFX.speakPriority(`消灭难字！找出汉字：“${curChar.char}”`, { kind: "sentence", priority: 1 });
    }, 200);

    const quitBtn = containerEl.querySelector("#btn-assault-quit");
    addListener(quitBtn, "click", () => {
      destroy();
      soundAndFX.playPop();
      onQuit?.();
    });

    const speakBtn = containerEl.querySelector("#btn-assault-speak");
    addListener(speakBtn, "click", () => {
      soundAndFX.playPop();
      soundAndFX.speakPriority(`消灭难字！找出汉字：“${curChar.char}”`, { kind: "sentence", priority: 1 });
    });

    const soundBtn = containerEl.querySelector("#btn-assault-sound");
    addListener(soundBtn, "click", () => {
      soundAndFX.toggleMute();
      const ic = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
      soundBtn.innerHTML = ic;
    });

    const feedbackEl = containerEl.querySelector("#assault-feedback-msg");
    let answered = false;

    options.forEach((opt, idx) => {
      const btn = containerEl.querySelector(`#assault-opt-${idx}`);
      if (!btn) return;
      btn.dataset.char = opt;
      addListener(btn, "click", () => {
        if (answered) return;
        const selected = btn.dataset.char || opt;

        if (selected === curChar.char) {
          answered = true;
          soundAndFX.playSuccess();
          triggerHapticSuccess();
          btn.classList.remove("bg-white/15", "hover:bg-white/25", "border-white/30");
          btn.classList.add("bg-emerald-500", "border-emerald-300", "ring-4", "ring-emerald-200", "scale-105");

          // 更新状态与 FSRS
          ebbinghaus.completeReview?.(curChar.id, true);
          const rec = progress.charRecords?.[curChar.id];
          if (rec) {
            rec.isDifficult = false;
            rec.masteryRate = Math.min(100, (rec.masteryRate || 60) + 15);
          }
          ebbinghaus.addCoins?.(5);
          clearedCount++;

          if (feedbackEl) {
            feedbackEl.textContent = "太棒了！消灭难字暗黑印记，获得 +5 凯茜星币！";
            feedbackEl.classList.remove("opacity-0");
          }

          addTimeout(() => {
            currentIndex++;
            renderRound();
          }, 850);
        } else {
          soundAndFX.playPop();
          triggerHapticWarning();
          btn.classList.add("bg-rose-700/80", "border-rose-500", "opacity-50", "pointer-events-none");
          if (feedbackEl) {
            feedbackEl.textContent = `别灰心，再看一看“${curChar.char}”的字形哦！`;
            feedbackEl.classList.remove("opacity-0");
          }
          soundAndFX.speakPriority(`再试一次，找出汉字“${curChar.char}”`, { kind: "sentence", priority: 1 });
        }
      });
    });
  };

  const renderVictory = () => {
    clearTimeouts();
    clearListeners();

    soundAndFX.playCrownFanfare();
    soundAndFX.triggerConfetti?.(containerEl);
    ebbinghaus.addCoins?.(10);

    const speakerIcon = soundAndFX.isMuted
      ? GAME_ICONS.speaker("w-5 h-5", true)
      : GAME_ICONS.speaker("w-5 h-5", false);

    containerEl.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex items-center justify-center bg-gradient-to-b from-purple-950 via-indigo-950 to-purple-900 select-none p-4 animate-fade-in text-white">
        <div class="flex flex-col items-center text-center bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/20 p-8 sm:p-10 max-w-lg shadow-2xl animate-scale-up">
          
          <div class="mb-3 flex items-center justify-center">
            ${GAME_ICONS.trophy("w-20 h-20 sm:w-24 sm:h-24")}
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-yellow-300 mb-2">
            难字歼灭大胜利！
          </h2>

          <p class="text-xs sm:text-sm text-white/80 mb-5 font-semibold leading-relaxed">
            太厉害啦！你成功攻克了 <b>${clearedCount}</b> 个易错难字，解除了汉字王国的暗黑印记！
          </p>

          <div class="flex items-center gap-2 mb-4 flex-wrap justify-center">
            ${targets
              .map(
                (c) => `
              <div class="conquered-chip w-12 h-12 rounded-2xl bg-emerald-500/30 border-2 border-emerald-300 flex flex-col items-center justify-center cursor-pointer active:scale-90 transition-transform font-serif shadow" data-char="${escapeHtml(c.char)}" title="点击朗读 ${escapeHtml(c.char)}">
                <span class="text-xl font-black text-white leading-none">${escapeHtml(c.char)}</span>
                <span class="text-[9px] text-emerald-200 font-sans mt-0.5">已攻克</span>
              </div>
            `
              )
              .join("")}
          </div>

          <div class="candy-pill rounded-2xl px-6 py-2.5 mb-6 text-sm text-yellow-300 font-black flex items-center gap-2 border border-yellow-300/40">
            ${GAME_ICONS.coin("w-5 h-5")}
            <span>额外通关奖励 +10 凯茜星币 · 难字小克星勋章</span>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <button id="btn-assault-finish-review" class="btn-game-orange text-white font-black text-xs sm:text-sm px-8 py-3.5 rounded-full flex items-center gap-2 shadow-2xl active:scale-95 cursor-pointer touch-target" data-speak="返回复习">
              <span class="flex items-center">${GAME_ICONS.swords("w-4 h-4")}</span>
              <span>返回日常复习</span>
            </button>
            <button id="btn-assault-finish-map" class="bg-white/20 hover:bg-white/30 text-white font-black text-xs sm:text-sm px-8 py-3.5 rounded-full flex items-center gap-2 shadow-xl active:scale-95 cursor-pointer touch-target" data-speak="返回大地图">
              <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
              <span>返回大地图</span>
            </button>
          </div>

        </div>
      </div>
    `;

    containerEl.querySelectorAll(".conquered-chip").forEach((chip) => {
      addListener(chip, "click", () => {
        soundAndFX.speakPriority(chip.dataset.char, { kind: "char", priority: 1 });
      });
    });

    const finishBtn = containerEl.querySelector("#btn-assault-finish-review");
    addListener(finishBtn, "click", () => {
      destroy();
      soundAndFX.playPop();
      onFinish?.({ clearedCount, totalCount });
    });

    const mapBtn = containerEl.querySelector("#btn-assault-finish-map");
    addListener(mapBtn, "click", () => {
      destroy();
      soundAndFX.playPop();
      onQuit?.();
    });
  };

  renderRound();

  return { destroy };
}
