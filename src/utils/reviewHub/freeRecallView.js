/**
 * Free-recall / point-recognition UI for ReviewModule main path.
 * Prompt phase must not show pinyin or multimodal spoilers.
 */
import { escapeHtml } from "../BaseModule.js";
import { soundAndFX } from "../soundEngine.js";
import { checkCardAnswer } from "../flashcardEngine.js";
import { pickRecallMode } from "./freeRecallLogic.js";
import { GAME_ICONS } from "../gameIcons.js";
import { getCharPictogramUrl } from "../pictogramRenderer.js";

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

  let currentJol = null;
  const finish = (knew, jol = currentJol) => {
    if (destroyed || completed) return;
    completed = true;
    onComplete?.({ knew: !!knew, cardType, jol });
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
        <p class="text-sm sm:text-base text-white/85 font-bold">先自己读出来，你对它熟悉吗？</p>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <button type="button" id="btn-recall-easy" class="btn-game-orange text-white font-black text-sm sm:text-base px-6 py-3 rounded-full shadow-xl active:scale-95 cursor-pointer flex items-center gap-1.5 touch-target" data-speak="我很熟这个字" aria-label="很熟">
            ${GAME_ICONS.star("w-4 h-4 mr-1")}<span>很熟</span>
          </button>
          <button type="button" id="btn-recall-fuzzy" class="bg-amber-500/80 hover:bg-amber-500 text-white font-black text-sm sm:text-base px-6 py-3 rounded-full border border-amber-300/40 shadow-xl active:scale-95 cursor-pointer flex items-center gap-1.5 touch-target" data-speak="我想一想" aria-label="想想">
            ${GAME_ICONS.sparkle("w-4 h-4 mr-1")}<span>想想</span>
          </button>
          <button type="button" id="btn-recall-hard" class="bg-slate-600/80 hover:bg-slate-500 text-white font-black text-sm sm:text-base px-6 py-3 rounded-full border border-white/20 shadow-xl active:scale-95 cursor-pointer flex items-center gap-1.5 touch-target" data-speak="直接听一听" aria-label="直接听">
            ${GAME_ICONS.speaker("w-4 h-4 mr-1")}<span>直接听</span>
          </button>
        </div>
      </div>
    `;

    bind(containerEl.querySelector("#btn-recall-easy"), "click", () => {
      currentJol = "easy";
      soundAndFX.playPop?.();
      renderFreeReveal();
    });

    bind(containerEl.querySelector("#btn-recall-fuzzy"), "click", () => {
      currentJol = "fuzzy";
      soundAndFX.playPop?.();
      renderFreeReveal();
    });

    bind(containerEl.querySelector("#btn-recall-hard"), "click", () => {
      currentJol = "hard";
      soundAndFX.playPop?.();
      renderFreeReveal({ directListen: true });
    });
  }

  function renderFreeReveal(options = {}) {
    const isDirectListen = !!options.directListen;
    const picUrl = getCharPictogramUrl(charData.char);

    containerEl.innerHTML = `
      <div class="free-recall-round flex flex-col items-center justify-center gap-4 w-full max-w-md mx-auto text-center px-4">
        ${picUrl ? `
          <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-xl border-2 border-amber-300 bg-white/20 backdrop-blur-sm p-1 mx-auto my-1 animate-scale-up">
            <img src="${escapeHtml(picUrl)}" alt="${escapeHtml(charData.char)}" class="w-full h-full object-cover rounded-xl" loading="lazy" />
          </div>
        ` : ""}
        <div class="text-8xl sm:text-9xl font-black font-serif text-white drop-shadow-lg leading-none select-none">${escapeHtml(charData.char)}</div>
        <div class="text-3xl sm:text-4xl font-black text-yellow-300 tracking-wide">${escapeHtml(charData.pinyin || "")}</div>
        <button type="button" id="btn-recall-speak" data-speak="听示范发音" aria-label="听示范发音" class="bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-5 py-2 rounded-full border border-white/30 cursor-pointer active:scale-95 flex items-center gap-1.5 mx-auto">
          ${GAME_ICONS.speaker("w-3.5 h-3.5 inline-block")}
          <span>听示范</span>
        </button>
        <div class="flex flex-wrap items-center justify-center gap-3 mt-2">
          ${isDirectListen ? `
            <button type="button" id="btn-recall-ack" data-speak="记住了，继续" aria-label="记住了，继续" class="btn-game-orange text-white font-black text-sm sm:text-base px-8 py-3 rounded-full shadow-xl active:scale-95 cursor-pointer flex items-center gap-2">
              ${GAME_ICONS.check("w-4 h-4")}
              <span>记住了，继续</span>
            </button>
          ` : `
            <button type="button" id="btn-recall-knew" data-speak="对了，继续" aria-label="对了" class="btn-game-orange text-white font-black text-sm sm:text-base px-8 py-3 rounded-full shadow-xl active:scale-95 cursor-pointer flex items-center gap-2">
              ${GAME_ICONS.check("w-4 h-4")}
              <span>对了</span>
            </button>
            <button type="button" id="btn-recall-notyet" data-speak="还不会，再听一遍" aria-label="还不会" class="bg-slate-600/80 hover:bg-slate-500 text-white font-black text-sm sm:text-base px-8 py-3 rounded-full border border-white/20 shadow-xl active:scale-95 cursor-pointer flex items-center gap-2">
              ${GAME_ICONS.sparkle("w-4 h-4")}
              <span>还不会</span>
            </button>
          `}
        </div>
      </div>
    `;

    // 若为直接听示范，自动播放发音
    if (isDirectListen) {
      soundAndFX.speakPriority?.(charData.char, { kind: "char", priority: 1 });
      bind(containerEl.querySelector("#btn-recall-ack"), "click", () => {
        soundAndFX.playPop?.();
        try { soundAndFX.stopSpeaking?.(); } catch {}
        finish(false, "hard");
      });
    }

    bind(containerEl.querySelector("#btn-recall-speak"), "click", () => {
      soundAndFX.speakPriority?.(charData.char, { kind: "char", priority: 1 });
    });

    const knewBtn = containerEl.querySelector("#btn-recall-knew");
    if (knewBtn) {
      bind(knewBtn, "click", () => {
        soundAndFX.playPop?.();
        try { soundAndFX.stopSpeaking?.(); } catch {}
        finish(true, currentJol);
      });
    }

    const notyetBtn = containerEl.querySelector("#btn-recall-notyet");
    if (notyetBtn) {
      bind(notyetBtn, "click", () => {
        soundAndFX.speakPriority?.(charData.char, { kind: "char", priority: 1 });
        // 稍延后结算，保证示范音完整发音完毕，避免切页掐断
        setTimeout(() => finish(false, currentJol), 750);
      });
    }
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
        <button type="button" id="btn-recall-replay" data-speak="再听一遍" aria-label="再听一遍" class="bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-5 py-2 rounded-full border border-white/30 cursor-pointer active:scale-95 flex items-center gap-1.5 mx-auto">
          ${GAME_ICONS.speaker("w-3.5 h-3.5 inline-block")}
          <span>再听一遍</span>
        </button>
        <div class="grid grid-cols-2 gap-3 w-full max-w-sm mt-2">
          ${options
            .map(
              (ch) => `
            <button type="button" class="btn-recall-option bg-white/15 hover:bg-white/25 text-white text-4xl font-black font-serif py-6 rounded-2xl border border-white/25 shadow-lg active:scale-95 cursor-pointer touch-target" data-char="${escapeHtml(ch)}" data-speak="选择${escapeHtml(ch)}" aria-label="选择${escapeHtml(ch)}">
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
      speakPrompt();
    });

    containerEl.querySelectorAll(".btn-recall-option").forEach((btn) => {
      bind(btn, "click", () => {
        if (destroyed || completed) return;
        soundAndFX.playPop?.();
        try { soundAndFX.stopSpeaking?.(); } catch {}
        const result = checkCardAnswer(card, btn.dataset.char);
        finish(!!result.correct);
      });
    });
  }

  return {
    destroy() {
      destroyed = true;
      try { soundAndFX.stopSpeaking?.(); } catch {}
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
