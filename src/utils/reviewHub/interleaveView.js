/**
 * Confuse-pair interleave practice after free-recall queue ends.
 * Simple MCQ: find target among options; brief feedback then advance.
 */
import { escapeHtml } from "../BaseModule.js";
import { soundAndFX } from "../soundEngine.js";

const FEEDBACK_MS = 800;

/**
 * @param {object} opts
 * @param {HTMLElement} opts.containerEl - typically the whole ReviewModule container OR a main stage; replacing full container is OK like renderSummary
 * @param {Array<{targetId:string,targetChar:string,options:string[],hint:string}>} opts.pack
 * @param {(result:{correct:number,total:number})=>void} opts.onFinished
 * @param {function} [opts.on] - optional event binder (el, evt, fn)
 * @param {function} [opts.onAnswer] - optional ({ correct, question }) => void for FSRS/mistake side effects
 */
export function runInterleaveSession({ containerEl, pack, onFinished, on, onAnswer }) {
  if (!containerEl || !Array.isArray(pack) || pack.length === 0) {
    onFinished?.({ correct: 0, total: 0 });
    return;
  }

  let index = 0;
  let correctCount = 0;
  let locked = false;
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

  const finish = () => {
    clearAdvance();
    for (const fn of localCleanups) {
      try {
        fn();
      } catch (_) {
        /* ignore */
      }
    }
    localCleanups.length = 0;
    onFinished?.({ correct: correctCount, total: pack.length });
  };

  const goNext = () => {
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
      <div class="interleave-session flex flex-col items-center justify-center gap-5 w-full max-w-lg mx-auto text-center px-4 py-8 min-h-[50vh]">
        <p class="text-xs font-black uppercase tracking-widest text-white/60">找不同 · ${index + 1}/${pack.length}</p>
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
      </div>
    `;

    const feedbackEl = containerEl.querySelector("#interleave-feedback");

    containerEl.querySelectorAll(".btn-interleave-option").forEach((btn) => {
      bind(btn, "click", () => {
        if (locked) return;
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
          btn.classList.add("ring-4", "ring-red-400", "opacity-80");
          containerEl.querySelectorAll(".btn-interleave-option").forEach((b) => {
            if (b.dataset.char === question.targetChar) {
              b.classList.add("ring-4", "ring-emerald-400");
            }
          });
          const hint = (question.hint || "").trim();
          if (feedbackEl) {
            feedbackEl.textContent = hint
              ? `不对哦。${hint}`
              : `不对哦，是「${question.targetChar}」`;
          }
        }

        try {
          onAnswer?.({ correct: isCorrect, question });
        } catch (_) {
          /* ignore side-effect errors */
        }

        advanceTimer = setTimeout(goNext, FEEDBACK_MS);
      });
    });
  }

  renderQuestion();
}
