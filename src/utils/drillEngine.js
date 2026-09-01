/**
 *  (Cathy Literacy) - 
 * ------------------------------------------------------------
 * 
 *  6  3 
 *
 *   1. audio_choice    ——  4 
 *   2. image_choice    —— 
 *   3. similar_pick    —— 4 
 *   4. word_fill       —— 
 *   5. sentence_fill   —— 
 *   6. balloon_pop     —— 
 *
 * Combo Good / Great / Perfect
 *  + 
 */

import { soundAndFX } from "./soundEngine.js";
import { ebbinghausManager } from "./ebbinghaus.js";
import { GAME_ICONS } from "./gameIcons.js";

const ROUNDS_PER_CHAR = 3;

const TYPE_META = {
  audio_choice: { iconSvg: (cls) => GAME_ICONS.speaker(cls), name: "", tip: "" },
  image_choice: { iconSvg: (cls) => GAME_ICONS.cards(cls), name: "", tip: "" },
  similar_pick: { iconSvg: (cls) => GAME_ICONS.gem(cls), name: "", tip: "" },
  word_fill: { iconSvg: (cls) => GAME_ICONS.brush(cls), name: "", tip: "" },
  sentence_fill: { iconSvg: (cls) => GAME_ICONS.scroll(cls), name: "", tip: "" },
  balloon_pop: { iconSvg: (cls) => GAME_ICONS.monster(cls), name: "", tip: "" },
};

/** Fisher-Yates */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class DrillEngine {
  constructor(mountEl, charData, onCompleteCallback, options = {}) {
    this.mount = mountEl;
    this.char = charData;
    this.onComplete = onCompleteCallback;
    this.allChars = options.allChars || [];

    this.roundIndex = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.correctCount = 0;
    this.hitsInBalloonRound = 0;
    this.finished = false;

    // 
    this.typePool = this.buildTypePool();
    this.queue = shuffle(this.typePool).slice(0, ROUNDS_PER_CHAR);

    this.render();
  }

  /**  */
  buildTypePool() {
    const c = this.char;
    const pool = ["audio_choice", "similar_pick", "balloon_pop"];
    
    if ((c.words || []).some((w) => w.word.includes(c.char))) pool.push("word_fill");
    if ((c.sentence || "").includes(c.char)) pool.push("sentence_fill");
    return pool;
  }

  /**  4 1  + 3  */
  buildOptions(preferSimilar = false) {
    const c = this.char;
    let distractors = (c.confusingChars || []).filter((x) => x !== c.char);

    if (preferSimilar) {
      distractors = distractors.slice(0, 3);
    } else {
      distractors = shuffle(distractors).slice(0, 3);
    }

    // 
    if (distractors.length < 3 && this.allChars.length) {
      const pool = shuffle(this.allChars.filter((x) => x.char !== c.char));
      for (const p of pool) {
        if (distractors.length >= 3) break;
        if (!distractors.includes(p.char)) distractors.push(p.char);
      }
    }

    return shuffle([c.char, ...distractors.slice(0, 3)]);
  }

  destroy() {
    this.finished = true;
  }

  // ------------------------------------------------------------------
  // 
  // ------------------------------------------------------------------
  render() {
    if (this.finished) return;
    if (this.roundIndex >= this.queue.length) return this.renderSummary();

    const type = this.queue[this.roundIndex];
    const meta = TYPE_META[type];

    const promptHTML = this.buildPrompt(type);

    this.mount.innerHTML = `
      <div class="relative w-full max-w-4xl h-[480px] bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col justify-between p-6 animate-fade-in select-none">

        <!--  -->
        <div class="w-full flex items-center justify-between bg-black/60 px-6 py-2.5 rounded-full border border-white/30 text-white">
          <div class="flex items-center gap-2 text-xs font-black text-yellow-300">
            <span class="flex items-center">${meta.iconSvg("w-4 h-4")}</span>
            <span>${meta.name}</span>
            <span class="bg-white/15 px-2 py-0.5 rounded-full"> ${this.roundIndex + 1} / ${this.queue.length} </span>
          </div>
          <div id="combo-badge-anchor" class="h-6 flex items-center justify-center font-black text-sm text-yellow-300"></div>
          <div class="text-xs font-black text-cyan-300 flex items-center gap-1">
            <span> </span>
            <span id="drill-correct" class="text-yellow-400 text-base font-black">${this.correctCount}</span> / ${this.queue.length}
          </div>
        </div>

        <!--  -->
        <div class="w-full flex-1 flex flex-col items-center justify-center gap-5 my-3">
          ${promptHTML}
        </div>

        <!--  -->
        <div id="drill-options" class="w-full flex items-center justify-center gap-5 flex-wrap">
          ${this.buildOptionsFor(type)}
        </div>

      </div>
    `;

    this.bindRound(type);
    this.announce(type);
  }

  buildPrompt(type) {
    const c = this.char;
    const meta = TYPE_META[type];

    if (type === "audio_choice") {
      return `
        <button id="btn-replay-audio" class="group w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 border-4 border-white shadow-[0_0_45px_rgba(6,182,212,0.8)] flex items-center justify-center active:scale-90 transition-transform animate-bounce-slow">
          ${GAME_ICONS.speaker("w-14 h-14")}
        </button>
        <p class="text-white font-black text-sm">${meta.tip}</p>
        <p class="text-[11px] text-cyan-200/80"></p>
      `;
    }

    if (type === "image_choice") {
      return `
        <div class="w-32 h-32 rounded-3xl bg-white/95 border-4 border-amber-300 shadow-2xl flex items-center justify-center text-7xl">${c.emoji}</div>
        <p class="text-white font-black text-sm">${meta.tip}</p>
      `;
    }

    if (type === "similar_pick") {
      return `
        <div class="bg-black/50 border border-white/25 rounded-2xl px-8 py-3 flex flex-col items-center gap-1">
          <span class="text-[11px] text-white/60 font-bold"></span>
          <span class="text-4xl font-black text-yellow-300">${c.pinyin}</span>
        </div>
        <p class="text-white font-black text-sm">${meta.tip}</p>
      `;
    }

    if (type === "word_fill") {
      const w = (c.words || []).find((x) => x.word.includes(c.char)) || { word: c.char, pinyin: c.pinyin };
      const blanked = w.word.split(c.char).join("");
      return `
        <div class="flex flex-col items-center gap-2">
          <span class="text-[11px] text-cyan-200 font-bold">${w.pinyin}</span>
          <div class="text-6xl font-black text-white tracking-[0.3em] bg-black/40 px-8 py-4 rounded-3xl border-2 border-amber-300">${blanked}</div>
        </div>
        <p class="text-white font-black text-sm">${meta.tip}</p>
      `;
    }

    if (type === "sentence_fill") {
      const blanked = (c.sentence || "").split(c.char).join("");
      return `
        <div class="max-w-2xl text-2xl font-black text-white leading-relaxed tracking-wider bg-black/40 px-8 py-5 rounded-3xl border-2 border-amber-300 text-center">
          ${blanked}
        </div>
        <p class="text-white font-black text-sm">${meta.tip}</p>
      `;
    }

    // balloon_pop
    return `
      <div class="flex flex-col items-center gap-2">
        <span class="bg-black/50 text-yellow-300 font-black text-lg px-6 py-2 rounded-full border border-amber-300">
          ${c.char}
        </span>
        <p class="text-white font-black text-sm">${meta.tip}</p>
        <p class="text-[11px] text-cyan-200/80"> <b id="balloon-left">3</b> </p>
      </div>
    `;
  }

  buildOptionsFor(type) {
    const opts = this.buildOptions(type === "similar_pick");

    if (type === "balloon_pop") {
      return opts
        .map(
          (opt, idx) => `
        <button class="drill-opt balloon-target-btn relative w-28 h-36 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200 border-4 border-white shadow-[0_0_30px_rgba(255,160,0,0.6)] flex flex-col items-center justify-center active:scale-75 transition-all duration-300 animate-bounce-slow"
                style="animation-delay:${idx * 0.28}s" data-char="${opt}">
          <span class="text-5xl font-black text-amber-950 drop-shadow">${opt}</span>
        </button>
      `
        )
        .join("");
    }

    return opts
      .map(
        (opt) => `
      <button class="drill-opt relative group bg-gradient-to-b from-amber-200 to-amber-400 text-amber-950 font-black text-5xl w-28 h-28 rounded-[30px] border-b-[8px] border-amber-600 shadow-[0_10px_20px_rgba(0,0,0,0.4)] hover:from-orange-300 hover:to-orange-500 hover:border-orange-700 active:border-b-0 active:translate-y-[8px] transition-all flex items-center justify-center overflow-hidden" data-char="${opt}">
        <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="absolute top-2 left-2 w-10 h-3 bg-white/50 rounded-full rotate-45 blur-[1px]"></div>
        <span class="relative z-10 drop-shadow-sm">${opt}</span>
      </button>
    `
      )
      .join("");
  }

  announce(type) {
    const c = this.char;
    if (type === "audio_choice") {
      soundAndFX.speakPriority(c.char, { kind: "char", priority: 1 });
    } else if (type === "image_choice") {
      soundAndFX.speakPriority("", { kind: "char", priority: 1 });
    } else if (type === "similar_pick") {
      soundAndFX.speakPriority(c.pinyin, { kind: "char", priority: 1 });
    } else if (type === "word_fill" || type === "sentence_fill") {
      soundAndFX.speakPriority("", { kind: "char", priority: 1 });
    } else {
      soundAndFX.speakPriority(c.char, { kind: "char", priority: 1 });
    }
  }

  // ------------------------------------------------------------------
  // 
  // ------------------------------------------------------------------
  bindRound(type) {
    const isBalloon = type === "balloon_pop";
    const needHits = 3;

    // 
    const replay = this.mount.querySelector("#btn-replay-audio");
    if (replay) {
      replay.addEventListener("click", () => {
        soundAndFX.playPop();
        soundAndFX.speakPriority(this.char.char, { kind: "char", priority: 1 });
      });
    }

    this.mount.querySelectorAll(".drill-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        const selected = btn.dataset.char;
        const correct = selected === this.char.char;

        if (!correct) {
          soundAndFX.playSoftError();
          ebbinghausManager.markDifficult(this.char.id);
          this.combo = 0;
          btn.classList.add("animate-shake");
          setTimeout(() => btn.classList.remove("animate-shake"), 420);
          return;
        }

        // 
        soundAndFX.playAttackHit();

        if (isBalloon) {
          this.hitsInBalloonRound++;
          const left = Math.max(0, needHits - this.hitsInBalloonRound);
          const leftEl = this.mount.querySelector("#balloon-left");
          if (leftEl) leftEl.textContent = left;
          btn.classList.add("scale-125", "opacity-0");
          setTimeout(() => btn.classList.remove("opacity-0", "scale-125"), 600);
          if (this.hitsInBalloonRound < needHits) return;
          this.hitsInBalloonRound = 0;
        } else {
          btn.classList.add("ring-4", "ring-emerald-400", "bg-emerald-100");
        }

        this.registerCorrect();
      });
    });
  }

  registerCorrect() {
    this.combo += 1;
    this.correctCount += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    soundAndFX.playCombo(this.combo);

    const anchor = this.mount.querySelector("#combo-badge-anchor");
    if (anchor) {
      const labels = ["Good! ", "Great! ", "Perfect! "];
      const label = this.combo >= 3 ? labels[2] : labels[this.combo - 1] || labels[0];
      anchor.innerHTML = `<span class="animate-combo text-amber-300">${label}</span>`;
    }

    const correctEl = this.mount.querySelector("#drill-correct");
    if (correctEl) correctEl.textContent = this.correctCount;

    soundAndFX.triggerConfetti(this.mount);

    setTimeout(() => {
      this.roundIndex += 1;
      this.render();
    }, 720);
  }

  // ------------------------------------------------------------------
  // 
  // ------------------------------------------------------------------
  renderSummary() {
    const c = this.char;
    const perfect = this.bestCombo >= this.queue.length;
    if (perfect) {
      soundAndFX.playStarChime();
    }
    soundAndFX.playVictoryFanfare();
    soundAndFX.triggerConfetti(this.mount);

    this.mount.innerHTML = `
      <div class="relative w-full max-w-4xl h-[480px] bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col items-center justify-center p-8 animate-fade-in text-center">

        <div class="mb-3 animate-bounce-slow flex items-center justify-center">
          ${GAME_ICONS.trophy("w-20 h-20")}
        </div>
        <h2 class="text-2xl font-black text-yellow-300 mb-2">
          ${perfect ? "" : ""}
        </h2>
        <p class="text-xs text-gray-300 mb-4">
          “<b class="text-amber-300 text-base">${c.char}</b>”
        </p>

        <div class="flex items-center gap-4 mb-6">
          <div class="bg-black/50 border border-white/25 rounded-2xl px-5 py-3">
            <div class="text-[10px] text-white/60 font-bold"></div>
            <div class="text-2xl font-black text-emerald-300">${this.correctCount} / ${this.queue.length}</div>
          </div>
          <div class="bg-black/50 border border-white/25 rounded-2xl px-5 py-3">
            <div class="text-[10px] text-white/60 font-bold"></div>
            <div class="text-2xl font-black text-yellow-300">${this.bestCombo} Combo</div>
          </div>
          <div class="bg-black/50 border border-white/25 rounded-2xl px-5 py-3">
            <div class="text-[10px] text-white/60 font-bold"></div>
            <div class="text-xs font-black text-cyan-300 mt-1">
              ${this.queue.map((t) => TYPE_META[t].name).join(" · ")}
            </div>
          </div>
        </div>

        <button id="btn-goto-write-step" class="btn-game-orange text-white font-black text-base px-10 py-3.5 rounded-full shadow-2xl shimmer-badge flex items-center gap-2">
          <span class="flex items-center">${GAME_ICONS.brush("w-5 h-5")}</span>  
        </button>
      </div>
    `;

    this.mount.querySelector("#btn-goto-write-step").addEventListener("click", () => {
      soundAndFX.playPop();
      if (this.onComplete) this.onComplete();
    });
  }
}
