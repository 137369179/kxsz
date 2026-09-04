/**
 * Free-recall / point-recognition UI for ReviewModule main path.
 * Prompt phase must not show pinyin or multimodal spoilers.
 */
import { escapeHtml } from "../BaseModule.js";
import { soundAndFX } from "../soundEngine.js";
import { checkCardAnswer } from "../flashcardEngine.js";
import { pickRecallMode } from "./freeRecallLogic.js";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * @param {object} ctx
 * @param {HTMLElement} ctx.containerEl
 * @param {object} ctx.charData
 * @param {number} ctx.age
 * @param {string[]} [ctx.distractorChars] for point mode
 * @param {function} ctx.onComplete - ({ knew: boolean, cardType: string }) => void
 * @param {function} [ctx.on] - event binder like BaseModule._on if available; else addEventListener
 * @returns {{ destroy: function }}
 */
export function mountFreeRecallRound(ctx) {
  const {
    containerEl,
    charData,
    age,
    distractorChars = [],
    onComplete,
    on,
  } = ctx;

  if (!containerEl || !charData) {
    return { destroy() {} };
  }

  const { mode, cardType } = pickRecallMode(age);
  let destroyed = false;
  const localCleanups = [];
  let completed = false;

  const bind = (el, evt, fn) => {
    if (!el) return;
    if (typeof on === "function") {
      on(el, evt, fn);
      return;
    }
    el.addEventListener(evt, fn);
    localCleanups.push(() => el.removeEventListener(evt, fn));
  };

  const finish = (knew) => {
    if (destroyed || completed) return;
    completed = true;
    onComplete?.({ knew: !!knew, cardType });
  };

  if (mode === "point") {
    renderPointMode();
  } else {
    renderFreePrompt();
  }

  function renderFreePrompt() {
    containerEl.innerHTML = `
      <div class="free-recall-round flex flex-col items-center justify-center gap-6 w-full max-w-md mx-auto text-center px-4">
        <div class="text-8xl sm:text-9xl font-black font-serif text-white drop-shadow-lg leading-none select-none">${escapeHtml(charData.char)}</div>
        <p class="text-sm sm:text-base text-white/85 font-bold">先自己读出来</p>
        <button type="button" id="btn-recall-ready" class="btn-game-orange text-white font-black text-base px-10 py-3.5 rounded-full shadow-xl active:scale-95 cursor-pointer">
          我会了
        </button>
      </div>
    `;
    bind(containerEl.querySelector("#btn-recall-ready"), "click", () => {
      soundAndFX.playPop?.();
      renderFreeReveal();
    });
  }

  function renderFreeReveal() {
    containerEl.innerHTML = `
      <div class="free-recall-round flex flex-col items-center justify-center gap-5 w-full max-w-md mx-auto text-center px-4">
        <div class="text-8xl sm:text-9xl font-black font-serif text-white drop-shadow-lg leading-none select-none">${escapeHtml(charData.char)}</div>
        <div class="text-3xl sm:text-4xl font-black text-yellow-300 tracking-wide">${escapeHtml(charData.pinyin || "")}</div>
        <button type="button" id="btn-recall-speak" class="bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-5 py-2 rounded-full border border-white/30 cursor-pointer active:scale-95">
          听示范
        </button>
        <div class="flex flex-wrap items-center justify-center gap-3 mt-2">
          <button type="button" id="btn-recall-knew" class="btn-game-orange text-white font-black text-sm sm:text-base px-8 py-3 rounded-full shadow-xl active:scale-95 cursor-pointer">
            对了
          </button>
          <button type="button" id="btn-recall-notyet" class="bg-slate-600/80 hover:bg-slate-500 text-white font-black text-sm sm:text-base px-8 py-3 rounded-full border border-white/20 shadow-xl active:scale-95 cursor-pointer">
            还不会
          </button>
        </div>
      </div>
    `;

    bind(containerEl.querySelector("#btn-recall-speak"), "click", () => {
      soundAndFX.playPop?.();
      soundAndFX.speakPriority?.(charData.char, { kind: "char", priority: 1 });
    });

    bind(containerEl.querySelector("#btn-recall-knew"), "click", () => {
      soundAndFX.playPop?.();
      finish(true);
    });

    bind(containerEl.querySelector("#btn-recall-notyet"), "click", () => {
      soundAndFX.playPop?.();
      soundAndFX.speakPriority?.(charData.char, { kind: "char", priority: 1 });
      // 稍延后结算，避免立刻切页掐断示范音
      setTimeout(() => finish(false), 450);
    });
  }

  function renderPointMode() {
    const others = distractorChars.filter((ch) => ch && ch !== charData.char);
    const cappedOthers = shuffle(others).slice(0, 3);
    const options = shuffle([charData.char, ...cappedOthers]);
    // Ensure at least 2 options if we somehow have no distractors
    if (options.length < 2 && others[0]) options.push(others[0]);

    const card = {
      type: cardType,
      expected: charData.char,
      answerFormat: "char",
    };

    containerEl.innerHTML = `
      <div class="free-recall-round flex flex-col items-center justify-center gap-5 w-full max-w-lg mx-auto text-center px-4">
        <p class="text-sm sm:text-base text-white/90 font-bold">听一听，选出正确的字</p>
        <button type="button" id="btn-recall-replay" class="bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-5 py-2 rounded-full border border-white/30 cursor-pointer active:scale-95">
          再听一遍
        </button>
        <div class="grid grid-cols-2 gap-3 w-full max-w-sm mt-2">
          ${options
            .map(
              (ch) => `
            <button type="button" class="btn-recall-option bg-white/15 hover:bg-white/25 text-white text-4xl font-black font-serif py-6 rounded-2xl border border-white/25 shadow-lg active:scale-95 cursor-pointer" data-char="${escapeHtml(ch)}">
              ${escapeHtml(ch)}
            </button>`
            )
            .join("")}
        </div>
      </div>
    `;

    const speakPrompt = () => {
      const text = charData.pinyin || charData.char;
      soundAndFX.speakPriority?.(text, { kind: "char", priority: 1 });
    };
    speakPrompt();

    bind(containerEl.querySelector("#btn-recall-replay"), "click", () => {
      soundAndFX.playPop?.();
      speakPrompt();
    });

    containerEl.querySelectorAll(".btn-recall-option").forEach((btn) => {
      bind(btn, "click", () => {
        if (destroyed || completed) return;
        soundAndFX.playPop?.();
        const result = checkCardAnswer(card, btn.dataset.char);
        finish(!!result.correct);
      });
    });
  }

  return {
    destroy() {
      destroyed = true;
      for (const fn of localCleanups) {
        try {
          fn();
        } catch (_) {
          /* ignore */
        }
      }
      localCleanups.length = 0;
    },
  };
}
