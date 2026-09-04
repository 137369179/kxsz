/**
 * Confuse-pair interleave practice after free-recall queue ends.
 * Simple MCQ: find target among options; brief feedback then advance.
 */
import { escapeHtml } from "../BaseModule.js";
import { soundAndFX } from "../soundEngine.js";

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

    const title = question.targetChar
      ? `找出：${escapeHtml(question.targetChar)}`
      : "找不同";
    const options = Array.isArray(question.options) ? question.options : [];

    containerEl.innerHTML = `
      <div class="interleave-session relative w-full h-full min-h-[640px] flex flex-col select-none overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white">
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/20">
          <button type="button" id="btn-interleave-quit" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full cursor-pointer active:scale-95">跳过 · 看结果</button>
          <div class="candy-pill flex items-center gap-2 px-5 py-1.5 rounded-full border border-yellow-300/40">
            <span class="text-xs text-amber-200 font-bold">找不同</span>
            <span class="text-yellow-300 font-black text-sm font-mono">${index + 1} / ${pack.length}</span>
          </div>
          <div class="w-24"></div>
        </header>
        <main class="flex-1 flex flex-col items-center justify-center gap-5 w-full max-w-lg mx-auto text-center px-4 py-8">
          <p class="text-xs font-black tracking-widest text-white/60">形近字小练 · 有点难是正常的</p>
          <h2 class="text-2xl sm:text-3xl font-black text-white drop-shadow">${title}</h2>
          <div id="interleave-feedback" class="min-h-[1.5rem] text-sm font-bold text-amber-200" aria-live="polite"></div>
          <div class="grid grid-cols-2 gap-3 w-full max-w-sm mt-1">
            ${options
              .map(
                (ch) => `
              <button type="button" class="btn-interleave-option bg-white/15 hover:bg-white/25 text-white text-4xl font-black font-serif py-6 rounded-2xl border border-white/25 shadow-lg active:scale-95 cursor-pointer" data-char="${escapeHtml(ch)}">
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

    const feedbackEl = containerEl.querySelector("#interleave-feedback");

    containerEl.querySelectorAll(".btn-interleave-option").forEach((btn) => {
      bind(btn, "click", () => {
        if (locked || destroyed) return;
        locked = true;
        soundAndFX.playPop?.();

        const selected = btn.dataset.char;
        const isCorrect = selected === question.targetChar;

        if (isCorrect) {
          correctCount += 1;
          soundAndFX.playSuccessSound?.();
          btn.classList.add("ring-4", "ring-emerald-400", "scale-105");
          if (feedbackEl) feedbackEl.textContent = "答对了！";
        } else {
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
      cleanup();
    },
  };
}
