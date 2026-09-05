/**
 * Confuse-pair interleave practice after free-recall queue ends.
 * Simple MCQ: find target among options; brief feedback then advance.
 */
import { escapeHtml } from "../BaseModule.js";
import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";

const FEEDBACK_MS = 800;

/**
 * @param {object} opts
 * @param {HTMLElement} opts.containerEl
 * @param {Array<{targetId:string,targetChar:string,options:string[],hint:string}>} opts.pack
 * @param {(result:{correct:number,total:number})=>void} opts.onFinished
 * @param {function} [opts.on]
 * @param {function} [opts.onAnswer] - ({ correct, question, selectedChar }) => void
 * @param {function} [opts.onQuit] - early exit → usually same as summary
 * @returns {{ destroy: function }}
 */
export function runInterleaveSession({
  containerEl,
  pack,
  onFinished,
  on,
  onAnswer,
  onQuit,
}) {
  if (!containerEl || !Array.isArray(pack) || pack.length === 0) {
    onFinished?.({ correct: 0, total: 0 });
    return { destroy() {} };
  }

  let index = 0;
  let correctCount = 0;
  let locked = false;
  let destroyed = false;
  const localCleanups = [];
  let advanceTimer = null;

  const bind = (el, evt, fn) => {
    if (!el) return;
    if (typeof on === "function") {
      on(el, evt, fn);
      return;
    }
    el.addEventListener(evt, fn);
    localCleanups.push(() => el.removeEventListener(evt, fn));
  };

  const clearAdvance = () => {
    if (advanceTimer) {
      clearTimeout(advanceTimer);
      advanceTimer = null;
    }
  };

  const cleanup = () => {
    clearAdvance();
    for (const fn of localCleanups) {
      try {
        fn();
      } catch (_) {
        /* ignore */
      }
    }
    localCleanups.length = 0;
  };

  const finish = () => {
    if (destroyed) return;
    destroyed = true;
    cleanup();
    onFinished?.({ correct: correctCount, total: pack.length });
  };

  const quit = () => {
    if (destroyed) return;
    destroyed = true;
    cleanup();
    if (typeof onQuit === "function") onQuit({ correct: correctCount, total: pack.length });
    else onFinished?.({ correct: correctCount, total: pack.length });
  };

  const goNext = () => {
    if (destroyed) return;
    clearAdvance();
    index += 1;
    locked = false;
    if (index >= pack.length) {
      finish();
    } else {
      renderQuestion();
    }
  };

  function renderQuestion() {
    const question = pack[index];
    if (!question) {
      finish();
      return;
    }

    let subtitle = "形近字小练 · 有点难是正常的";
    let title = question.targetChar ? `找出：${escapeHtml(question.targetChar)}` : "找不同";
    let speakPrompt = question.targetChar ? `请找出汉字：“${question.targetChar}”` : "请找出正确的汉字";

    if (question.type === "cloze_fill" && question.promptTitle) {
      subtitle = question.promptSubtitle || "句子填空 · 选字把句子补充完整";
      title = `<span class="text-xl sm:text-2xl font-bold leading-relaxed">${escapeHtml(question.promptTitle)}</span>`;
      speakPrompt = "句子填空：请选出合适的字填入括号中";
    } else if (question.type === "picture_write") {
      subtitle = question.promptSubtitle || "看图选字 · 选出匹配的字";
      if (question.pictogramUrl) {
        title = `<div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-xl border-2 border-amber-300 bg-white/20 backdrop-blur-sm p-1 mx-auto my-1 animate-scale-up">
          <img src="${escapeHtml(question.pictogramUrl)}" alt="看图选字" class="w-full h-full object-cover rounded-xl" loading="lazy" />
        </div>`;
        speakPrompt = "看图选字：请观察图片，找出对应的汉字";
      } else if (question.promptTitle) {
        title = `<span class="text-3xl sm:text-4xl font-serif text-amber-300 font-black">${escapeHtml(question.promptTitle)}</span>`;
        speakPrompt = "字象挑战：请找出匹配的汉字";
      }
    } else if (question.type === "pinyin_link" && question.promptTitle) {
      subtitle = question.promptSubtitle || "拼音找字 · 选出对应汉字";
      title = `<span class="text-3xl sm:text-4xl font-black text-sky-300 tracking-wide">${escapeHtml(question.promptTitle)}</span>`;
      speakPrompt = `拼音找字：请找出 ${question.promptTitle} 对应的汉字`;
    }

    try {
      soundAndFX.speakPriority(speakPrompt, { kind: "sentence", emotion: "gentle" });
    } catch (_) {}

    const options = Array.isArray(question.options) ? question.options : [];

    containerEl.innerHTML = `
      <div class="interleave-session relative w-full h-full min-h-[640px] flex flex-col select-none overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white">
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/20">
          <button type="button" id="btn-interleave-quit" data-speak="跳过练习，看结果" aria-label="跳过练习，看结果" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full cursor-pointer active:scale-95">跳过 · 看结果</button>
          <div class="candy-pill flex items-center gap-2 px-5 py-1.5 rounded-full border border-yellow-300/40">
            <span class="text-xs text-amber-200 font-bold">${question.type === "cloze_fill" ? "填句子" : question.type === "picture_write" ? "看图选字" : question.type === "pinyin_link" ? "拼音找字" : "找不同"}</span>
            <span class="text-yellow-300 font-black text-sm font-mono">${index + 1} / ${pack.length}</span>
          </div>
          <button type="button" id="btn-interleave-replay-prompt" data-speak="再听一遍提示" class="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-black text-amber-300 cursor-pointer active:scale-95 flex items-center gap-1" aria-label="再听一遍提示">
            ${GAME_ICONS.speaker("w-3.5 h-3.5")}
            <span>听提示</span>
          </button>
        </header>
        <main class="flex-1 flex flex-col items-center justify-center gap-5 w-full max-w-lg mx-auto text-center px-4 py-8">
          <p class="text-xs font-black tracking-widest text-white/60">${escapeHtml(subtitle)}</p>
          <h2 class="text-2xl sm:text-3xl font-black text-white drop-shadow">${title}</h2>
          <div id="interleave-feedback" class="min-h-[1.5rem] text-sm font-bold text-amber-200" aria-live="polite"></div>
          <div class="grid grid-cols-2 gap-3 w-full max-w-sm mt-1">
            ${options
              .map(
                (ch) => `
              <button type="button" class="btn-interleave-option bg-white/15 hover:bg-white/25 text-white text-4xl font-black font-serif py-6 rounded-2xl border border-white/25 shadow-lg active:scale-95 cursor-pointer" data-char="${escapeHtml(ch)}" data-speak="${escapeHtml(ch)}" aria-label="选项 ${escapeHtml(ch)}">
                ${escapeHtml(ch)}
              </button>`
              )
              .join("")}
          </div>
        </main>
      </div>
    `;

    bind(containerEl.querySelector("#btn-interleave-quit"), "click", () => {
      soundAndFX.playPop?.();
      quit();
    });

    const replayBtn = containerEl.querySelector("#btn-interleave-replay-prompt");
    if (replayBtn) {
      bind(replayBtn, "click", () => {
        try {
          soundAndFX.speakPriority(speakPrompt, { kind: "sentence", emotion: "gentle", priority: 1 });
        } catch (_) {}
      });
    }

    const feedbackEl = containerEl.querySelector("#interleave-feedback");

    containerEl.querySelectorAll(".btn-interleave-option").forEach((btn) => {
      bind(btn, "click", () => {
        if (locked || destroyed) return;
        locked = true;

        const selected = btn.dataset.char;
        const isCorrect = selected === question.targetChar;

        if (isCorrect) {
          correctCount += 1;
          soundAndFX.playSuccessSound?.();
          btn.classList.add("ring-4", "ring-emerald-400", "scale-105");
          if (feedbackEl) feedbackEl.textContent = "答对了！";
        } else {
          soundAndFX.playSoftError?.();
          btn.classList.add("ring-4", "ring-rose-400/80", "opacity-80");
          containerEl.querySelectorAll(".btn-interleave-option").forEach((b) => {
            if (b.dataset.char === question.targetChar) {
              b.classList.add("ring-4", "ring-emerald-400");
            }
          });
          const hint = (question.hint || "").trim();
          if (feedbackEl) {
            feedbackEl.textContent = hint
              ? `再看一眼：${hint}`
              : `再看一眼，是「${question.targetChar}」`;
          }
        }

        try {
          onAnswer?.({ correct: isCorrect, question, selectedChar: selected });
        } catch (_) {
          /* ignore side-effect errors */
        }

        advanceTimer = setTimeout(goNext, FEEDBACK_MS);
      });
    });
  }

  renderQuestion();
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      try { soundAndFX.stopSpeaking?.(); } catch {}
      cleanup();
    },
  };
}
