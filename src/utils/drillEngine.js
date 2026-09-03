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
  audio_choice: { iconSvg: (cls) => GAME_ICONS.speaker(cls), name: "听音辨字", tip: "听准发音，找出对应的神奇汉字" },
  image_choice: { iconSvg: (cls) => GAME_ICONS.cards(cls), name: "看图识字", tip: "观察卡片图景，选出匹配的字" },
  similar_pick: { iconSvg: (cls) => GAME_ICONS.gem(cls), name: "火眼金睛", tip: "形近字大挑战，找出正确的汉字" },
  word_fill: { iconSvg: (cls) => GAME_ICONS.brush(cls), name: "词语填空", tip: "帮词语找回丢失的核心汉字" },
  sentence_fill: { iconSvg: (cls) => GAME_ICONS.scroll(cls), name: "趣味造句", tip: "把汉字宝宝送回句子中" },
  balloon_pop: { iconSvg: (cls) => GAME_ICONS.monster(cls), name: "戳破气球", tip: "瞄准目标字气球，快速戳破" },
  // E4 新增
  cloze_hint: { iconSvg: (cls) => GAME_ICONS.scroll(cls), name: "句子填空", tip: "提示拼音，填入正确汉字" },
  pinyin_spell: { iconSvg: (cls) => GAME_ICONS.mic(cls), name: "拼读练习", tip: "听拼音，选声母韵母组合" },
  stroke_trace: { iconSvg: (cls) => GAME_ICONS.pen(cls), name: "笔画描红", tip: "跟着虚线，描出汉字笔画" },
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

// ── E4: 拼音验证助手 ──────────────────────────────────────────
const PINYIN_INITIALS = [
  "b","p","m","f","d","t","n","l","g","k","h",
  "j","q","x","zh","ch","sh","r","z","c","s","y","w"
];
// 包含所有两字母声母，按从长到短排序确保最长匹配优先
const PINYIN_INITIALS_SORTED = [...PINYIN_INITIALS].sort((a, b) => b.length - a.length);

/**
 * 提取拼音的声母
 * @param {string} pinyin 拼音（如 "shuang"）
 * @returns {string} 声母（如 "sh"）；无声母返回 ""
 */
function extractPinyinInitial(pinyin) {
  if (!pinyin) return "";
  for (const init of PINYIN_INITIALS_SORTED) {
    if (pinyin.startsWith(init)) return init;
  }
  return "";
}

/**
 * 提取拼音的韵母（去除声母后的部分）
 * @param {string} pinyin 拼音（如 "shuang"）
 * @returns {string} 韵母（如 "uang"）
 */
function extractPinyinFinal(pinyin) {
  if (!pinyin) return "";
  const init = extractPinyinInitial(pinyin);
  return init ? pinyin.slice(init.length) : pinyin;
}

/**
 * 验证给定的声母是否正确
 * @param {string} pinyin 拼音
 * @param {string} candidate 候选声母
 * @returns {boolean}
 */
export function isCorrectPinyinInitial(pinyin, candidate) {
  return extractPinyinInitial(pinyin) === candidate;
}

/**
 * 验证给定的韵母是否正确（需传入已选的声母）
 * @param {string} pinyin 拼音
 * @param {string} initial 已选的声母
 * @param {string} candidate 候选韵母
 * @returns {boolean}
 */
export function isCorrectPinyinFinal(pinyin, initial, candidate) {
  const realInit = extractPinyinInitial(pinyin);
  const final = extractPinyinFinal(pinyin);
  if (initial !== realInit) return false;
  return final === candidate;
}

// 导出提取函数（供测试与外部调用）
export const _pinyinHelpers = {
  extractPinyinInitial,
  extractPinyinFinal,
  isCorrectPinyinInitial,
  isCorrectPinyinFinal,
  PINYIN_INITIALS,
};

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
    this._timeouts = [];

    // 
    this.typePool = this.buildTypePool();
    this.queue = shuffle(this.typePool).slice(0, ROUNDS_PER_CHAR);

    this.render();
  }

  _timeout(fn, ms) {
    const id = setTimeout(() => {
      const idx = this._timeouts.indexOf(id);
      if (idx !== -1) this._timeouts.splice(idx, 1);
      fn();
    }, ms);
    this._timeouts.push(id);
    return id;
  }

  destroy() {
    this._timeouts.forEach((id) => clearTimeout(id));
    this._timeouts = [];
  }

  /**
   * 构建题池（E4: 新增 cloze_hint / pinyin_spell / stroke_trace）
   */
  buildTypePool() {
    const c = this.char;
    const pool = ["audio_choice", "similar_pick", "balloon_pop"];

    if ((c.words || []).some((w) => w.word.includes(c.char))) pool.push("word_fill");
    if ((c.sentence || "").includes(c.char)) pool.push("sentence_fill");
    // E4 新增题型
    if ((c.sentence || "").includes(c.char)) pool.push("cloze_hint");
    if (c.pinyin && c.pinyin.length > 1) pool.push("pinyin_spell");
    if (c.char && c.char.length === 1) pool.push("stroke_trace");
    return pool;
  }

  /**
   * 构造 4 选项 + 3 干扰项（E4: 新增 stroke_trace 干扰项）
   */
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

        <div class="w-full flex items-center justify-between bg-black/60 px-6 py-2.5 rounded-full border border-white/30 text-white">
          <div class="flex items-center gap-2 text-xs font-black text-yellow-300">
            <span class="flex items-center">${meta.iconSvg("w-4 h-4")}</span>
            <span>${meta.name}</span>
            <span class="bg-white/15 px-2 py-0.5 rounded-full"> ${this.roundIndex + 1} / ${this.queue.length} </span>
          </div>
          <div id="combo-badge-anchor" class="h-6 flex items-center justify-center font-black text-sm text-yellow-300"></div>
          <div class="text-xs font-black text-cyan-300 flex items-center gap-1">
            <span>正确</span>
            <span id="drill-correct" class="text-yellow-400 text-base font-black">${this.correctCount}</span> / ${this.queue.length}
          </div>
        </div>

        <div class="w-full flex-1 flex flex-col items-center justify-center gap-5 my-3">
          ${promptHTML}
        </div>

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
        <button id="btn-replay-audio" class="group w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 border-4 border-white shadow-[0_0_45px_rgba(6,182,212,0.8)] flex items-center justify-center active:scale-90 transition-transform animate-bounce-slow" title="">
          ${GAME_ICONS.speaker("w-14 h-14")}
        </button>
        <p class="text-white font-black text-sm">${meta.tip}</p>
        <p class="text-[11px] text-cyan-200/80"></p>
      `;
    }

    if (type === "image_choice") {
      // 不使用 Emoji，改用汉字象形甲骨文图示卡片
      const glyphDisplay = c.oracleGlyph || c.char;
      const radicalBadge = c.radical ? `<span class="absolute top-1 right-1 text-[9px] font-black text-amber-600 bg-amber-100 px-1 rounded">${c.radical}</span>` : "";
      return `
        <div class="relative w-36 h-36 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100 border-4 border-amber-400 shadow-2xl flex flex-col items-center justify-center gap-1">
          ${radicalBadge}
          <span class="text-5xl font-black text-amber-900 drop-shadow">${glyphDisplay}</span>
          <span class="text-[10px] text-amber-700 font-bold">${c.pinyin}</span>
        </div>
        <p class="text-white font-black text-sm">${meta.tip}</p>
      `;
    }

    if (type === "similar_pick") {
      return `
        <div class="bg-black/50 border border-white/25 rounded-2xl px-8 py-3 flex flex-col items-center gap-1">
          <span class="text-[11px] text-white/60 font-bold">拼音</span>
          <span class="text-4xl font-black text-yellow-300">${c.pinyin}</span>
        </div>
        <p class="text-white font-black text-sm">${meta.tip}</p>
      `;
    }

    if (type === "word_fill") {
      const w = (c.words || []).find((x) => x.word.includes(c.char)) || { word: c.char, pinyin: c.pinyin };
      const blanked = w.word.split(c.char).join(" ( ? ) ");
      return `
        <div class="flex flex-col items-center gap-2">
          <span class="text-[11px] text-cyan-200 font-bold">${w.pinyin}</span>
          <div class="text-5xl font-black text-white tracking-widest bg-black/40 px-8 py-4 rounded-3xl border-2 border-amber-300">${blanked}</div>
        </div>
        <p class="text-white font-black text-sm mt-1">${meta.tip}</p>
      `;
    }

    if (type === "sentence_fill") {
      const blanked = (c.sentence || "").split(c.char).join(" ? ");
      return `
        <div class="max-w-2xl text-xl font-black text-white leading-relaxed tracking-wider bg-black/40 px-8 py-5 rounded-3xl border-2 border-amber-300 text-center">
          ${blanked}
        </div>
        <p class="text-white font-black text-sm mt-1">${meta.tip}</p>
      `;
    }

    // E4 cloze_hint: 句子填空 + 拼音提示 + 高亮目标位置
    if (type === "cloze_hint") {
      const pinyin = c.pinyin || "";
      const sentence = c.sentence || "";
      const parts = sentence.split(c.char);
      const blanked = parts.join(`<span class="inline-block w-12 h-12 bg-yellow-400/80 rounded-lg border-b-4 border-yellow-600 text-center text-4xl font-black text-yellow-900 animate-pulse align-middle">?</span>`);
      return `
        <div class="flex flex-col items-center gap-4">
          <div class="bg-purple-900/60 text-purple-200 text-sm font-bold px-6 py-2 rounded-full border border-purple-400/40 flex items-center gap-2">
            <span>提示拼音：</span><span class="text-2xl font-black text-purple-100">${pinyin}</span>
          </div>
          <div class="max-w-2xl text-2xl font-black text-white leading-loose tracking-wide bg-black/40 px-8 py-5 rounded-3xl border-2 border-purple-400/60 text-center">
            ${blanked}
          </div>
        </div>
        <p class="text-white font-black text-sm mt-1">${meta.tip}</p>
      `;
    }

    // E4 pinyin_spell: 拼音拼读（听发音，选声母+韵母组合）
    if (type === "pinyin_spell") {
      // 简化：从 pinyin 提取声母韵母候选
      const pinyin = c.pinyin || "yi";
      const initials = ["b","p","m","f","d","t","n","l","g","k","h","j","q","x","zh","ch","sh","r","z","c","s","y","w"];
      const finals = ["a","o","e","i","u","ai","ei","ui","ao","ou","iu","ie","ve","er","an","en","in","un","ang","eng","ing","ong"];
      const pinyinInitial = initials.find(i => pinyin.startsWith(i)) || "";
      const pinyinFinal = finals.find(f => pinyin.startsWith(pinyinInitial ? pinyin.slice(pinyinInitial.length) : pinyin)) || pinyin;
      const wrongInitials = initials.filter(i => i !== pinyinInitial).slice(0, 3);
      const wrongFinals = finals.filter(f => f !== pinyinFinal).slice(0, 3);
      const initOpts = shuffle([pinyinInitial, ...wrongInitials]);
      const finalOpts = shuffle([pinyinFinal, ...wrongFinals]);
      return `
        <div class="flex flex-col items-center gap-6">
          <button id="btn-replay-pinyin" class="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-400 to-pink-600 border-4 border-white shadow-[0_0_35px_rgba(168,85,247,0.7)] flex items-center justify-center active:scale-90 transition-transform" title="听发音">
            ${GAME_ICONS.speaker("w-12 h-12")}
          </button>
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <span class="text-purple-200 font-black text-sm">声母：</span>
              ${initOpts.map(i => `<button class="drill-opt px-5 py-2 bg-gradient-to-b from-purple-200 to-purple-400 text-purple-900 font-black text-xl rounded-xl border-b-4 border-purple-600 shadow cursor-pointer active:translate-y-1 transition-all" data-initial="${i}">${i}</button>`).join("")}
            </div>
            <div class="flex items-center gap-3">
              <span class="text-pink-200 font-black text-sm">韵母：</span>
              ${finalOpts.map(f => `<button class="drill-opt px-5 py-2 bg-gradient-to-b from-pink-200 to-pink-400 text-pink-900 font-black text-xl rounded-xl border-b-4 border-pink-600 shadow cursor-pointer active:translate-y-1 transition-all" data-final="${f}">${f}</button>`).join("")}
            </div>
          </div>
        </div>
        <p class="text-white font-black text-sm mt-1">${meta.tip}</p>
      `;
    }

    // E4 stroke_trace: 笔画描红（Canvas 路径追踪）
    if (type === "stroke_trace") {
      return `
        <div class="flex flex-col items-center gap-3">
          <canvas id="stroke-trace-canvas" width="280" height="280" class="bg-white rounded-2xl border-4 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] cursor-crosshair touch-none"></canvas>
          <p class="text-emerald-200 font-black text-xs">提示：沿着虚线描出"${c.char}"字，至少画一笔</p>
          <button id="stroke-trace-submit" class="px-8 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-black text-lg rounded-2xl border-b-4 border-emerald-700 shadow-lg active:translate-y-1 cursor-pointer">提交描红</button>
        </div>
        <p class="text-white font-black text-sm mt-1">${meta.tip}</p>
      `;
    }

    // balloon_pop
    return `
      <div class="flex flex-col items-center gap-2">
        <div class="bg-black/60 text-yellow-300 font-black text-base px-6 py-2 rounded-full border border-amber-300 shadow-md flex items-center gap-2">
          <span>目标汉字：</span>
          <span class="text-3xl text-orange-400 font-serif leading-none">${c.char}</span>
        </div>
        <p class="text-white font-black text-sm">${meta.tip}</p>
        <p class="text-xs text-cyan-200">还需击中：<b id="balloon-left" class="text-yellow-300 text-base font-black">3</b> 次</p>
      </div>
    `;
  }

  buildOptionsFor(type) {
    const opts = this.buildOptions(type === "similar_pick");

    if (type === "balloon_pop") {
      return opts
        .map(
          (opt, idx) => `
        <button class="drill-opt balloon-target-btn relative w-28 h-36 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200 border-4 border-white shadow-[0_0_30px_rgba(255,160,0,0.6)] flex flex-col items-center justify-center active:scale-75 transition-all duration-300 animate-bounce-slow cursor-pointer"
                style="animation-delay:${idx * 0.28}s" data-char="${opt}">
          <span class="text-5xl font-black text-amber-950 drop-shadow">${opt}</span>
        </button>
      `
        )
        .join("");
    }

    // E4 cloze_hint: 4 个字选项按钮
    if (type === "cloze_hint") {
      return opts
        .map(
          (opt) => `
        <button class="drill-opt relative bg-gradient-to-b from-yellow-100 to-yellow-300 text-yellow-900 font-black text-4xl w-24 h-24 rounded-2xl border-b-6 border-yellow-600 shadow-[0_8px_16px_rgba(0,0,0,0.3)] hover:from-yellow-200 hover:to-yellow-400 active:border-b-0 active:translate-y-2 transition-all cursor-pointer" data-char="${opt}">
          ${opt}
        </button>
      `
        )
        .join("");
    }

    // E4 pinyin_spell / stroke_trace: 自包含选项，无需标准 buildOptionsFor
    if (type === "pinyin_spell" || type === "stroke_trace") {
      return "";
    }

    return opts
      .map(
        (opt) => `
      <button class="drill-opt relative group bg-gradient-to-b from-amber-200 to-amber-400 text-amber-950 font-black text-5xl w-28 h-28 rounded-[30px] border-b-[8px] border-amber-600 shadow-[0_10px_20px_rgba(0,0,0,0.4)] hover:from-orange-300 hover:to-orange-500 hover:border-orange-700 active:border-b-0 active:translate-y-[8px] transition-all flex items-center justify-center overflow-hidden cursor-pointer" data-char="${opt}">
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
    const text = {
      audio_choice: "请仔细听发音，选出对应的汉字！",
      image_choice: "请观察卡片图景，选出汉字！",
      similar_pick: `拼音读作"${c.pinyin}"，请找出正确的汉字！`,
      word_fill: "词语填空大挑战，请选出丢失的汉字！",
      sentence_fill: "趣味造句，请为句子送回正确的汉字！",
      balloon_pop: "戳破气球！连续击中3次目标字气球！",
      // E4
      cloze_hint: `句子填空！提示拼音是"${c.pinyin}"，请选出正确的汉字！`,
      pinyin_spell: "拼音拼读！仔细听发音，选出声母和韵母！",
      stroke_trace: `笔画描红！请在画布上描出汉字"${c.char}"！`,
    };
    const msg = text[type] || `请找出汉字"${c.char}"！`;
    soundAndFX.speakPriority(msg, { kind: "sentence", emotion: "gentle" });
  }

  // ------------------------------------------------------------------
  // 
  // ------------------------------------------------------------------
  bindRound(type) {
    // E4: 派发到专用处理器
    if (type === "pinyin_spell") return this.bindPinyinSpellRound();
    if (type === "stroke_trace") return this.bindStrokeTraceRound();

    const isBalloon = type === "balloon_pop";
    const needHits = 3;
    let isRoundLocked = false;

    // 重听发音
    const replay = this.mount.querySelector("#btn-replay-audio");
    if (replay) {
      replay.addEventListener("click", () => {
        soundAndFX.playPop();
        soundAndFX.speakPriority(this.char.char, { kind: "char", priority: 1 });
      });
    }

    this.mount.querySelectorAll(".drill-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (isRoundLocked) return;

        const selected = btn.dataset.char;
        const correct = selected === this.char.char;

        if (!correct) {
          soundAndFX.playSoftError();
          ebbinghausManager.markDifficult(this.char.id);
          this.combo = 0;
          btn.classList.add("animate-shake");
          this._timeout(() => btn.classList.remove("animate-shake"), 420);
          return;
        }

        soundAndFX.playAttackHit();

        if (isBalloon) {
          btn.style.pointerEvents = "none";
          this.hitsInBalloonRound++;
          const left = Math.max(0, needHits - this.hitsInBalloonRound);
          const leftEl = this.mount.querySelector("#balloon-left");
          if (leftEl) leftEl.textContent = left;
          btn.classList.add("scale-125", "opacity-0");
          this._timeout(() => {
            btn.classList.remove("opacity-0", "scale-125");
            if (!isRoundLocked) btn.style.pointerEvents = "auto";
          }, 600);

          if (this.hitsInBalloonRound < needHits) return;
          isRoundLocked = true;
          this.mount.querySelectorAll(".drill-opt").forEach((b) => { b.style.pointerEvents = "none"; });
          this.hitsInBalloonRound = 0;
        } else {
          isRoundLocked = true;
          this.mount.querySelectorAll(".drill-opt").forEach((b) => { b.style.pointerEvents = "none"; });
          btn.classList.add("ring-4", "ring-emerald-400", "bg-emerald-100");
        }

        this.registerCorrect();
      });
    });
  }

  // ------------------------------------------------------------------
  // E4: 拼音拼读处理器（声母 + 韵母双选）
  // ------------------------------------------------------------------
  bindPinyinSpellRound() {
    const c = this.char;
    let stage = "initial";   // initial → chooseInitial → chooseFinal → done
    let chosenInitial = null;
    let isLocked = false;

    // 自动发音
    this._timeout(() => soundAndFX.speakPriority(c.char, { kind: "char" }), 400);

    const replay = this.mount.querySelector("#btn-replay-pinyin");
    if (replay) {
      replay.addEventListener("click", () => {
        soundAndFX.speakPriority(c.char, { kind: "char", priority: 1 });
      });
    }

    this.mount.querySelectorAll(".drill-opt[data-initial]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (isLocked || stage !== "initial") return;
        const val = btn.dataset.initial;
        const correct = isCorrectPinyinInitial(c.pinyin, val);
        if (!correct) {
          soundAndFX.playSoftError();
          ebbinghausManager.markDifficult(c.id);
          this.combo = 0;
          btn.classList.add("animate-shake", "opacity-50");
          this._timeout(() => btn.classList.remove("animate-shake", "opacity-50"), 420);
          return;
        }
        chosenInitial = val;
        stage = "chooseFinal";
        btn.classList.add("ring-4", "ring-emerald-400", "bg-emerald-200");
        // 锁定声母选项
        this.mount.querySelectorAll(".drill-opt[data-initial]").forEach((b) => {
          b.style.pointerEvents = "none";
        });
        soundAndFX.playAttackHit();
      });
    });

    this.mount.querySelectorAll(".drill-opt[data-final]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (isLocked || stage !== "chooseFinal") return;
        const val = btn.dataset.final;
        const correct = isCorrectPinyinFinal(c.pinyin, chosenInitial || "", val);
        if (!correct) {
          soundAndFX.playSoftError();
          ebbinghausManager.markDifficult(c.id);
          this.combo = 0;
          btn.classList.add("animate-shake", "opacity-50");
          this._timeout(() => btn.classList.remove("animate-shake", "opacity-50"), 420);
          return;
        }
        isLocked = true;
        btn.classList.add("ring-4", "ring-emerald-400", "bg-emerald-200");
        this.mount.querySelectorAll(".drill-opt").forEach((b) => {
          b.style.pointerEvents = "none";
        });
        soundAndFX.playAttackHit();
        this.registerCorrect();
      });
    });
  }

  // ------------------------------------------------------------------
  // E4: 笔画描红处理器（Canvas 触控轨迹采样）
  // ------------------------------------------------------------------
  bindStrokeTraceRound() {
    const canvas = this.mount.querySelector("#stroke-trace-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    // 1) 绘制目标汉字（灰色虚线 = 描红底图）
    ctx.clearRect(0, 0, W, H);
    ctx.font = "200px 'KaiTi', 'SimSun', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(180, 180, 180, 0.25)";
    ctx.fillText(this.char.char, W / 2, H / 2);
    ctx.strokeStyle = "rgba(99, 99, 99, 0.4)";
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.strokeText(this.char.char, W / 2, H / 2);
    ctx.setLineDash([]);

    // 2) 触控/鼠标轨迹
    let drawing = false;
    let lastX = 0, lastY = 0;
    let strokesCount = 0;
    let totalLength = 0;
    const TARGET_MIN_LENGTH = 800;  // 笔迹长度阈值（像素）

    const onStart = (x, y) => {
      drawing = true;
      lastX = x; lastY = y;
      ctx.beginPath();
      ctx.moveTo(x, y);
    };
    const onMove = (x, y) => {
      if (!drawing) return;
      ctx.strokeStyle = "rgba(16, 185, 129, 0.9)";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(x, y);
      ctx.stroke();
      totalLength += Math.hypot(x - lastX, y - lastY);
      lastX = x; lastY = y;
    };
    const onEnd = () => {
      if (!drawing) return;
      drawing = false;
      strokesCount++;
    };

    const pointerMove = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
      const y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top;
      onMove(x, y);
    };

    canvas.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      onStart(e.clientX - rect.left, e.clientY - rect.top);
    });
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerup", onEnd);
    canvas.addEventListener("pointerleave", onEnd);

    // 3) 提交按钮
    const submit = this.mount.querySelector("#stroke-trace-submit");
    if (submit) {
      submit.addEventListener("click", () => {
        const ok = strokesCount >= 1 && totalLength >= TARGET_MIN_LENGTH;
        if (ok) {
          soundAndFX.playAttackHit();
          this.registerCorrect();
          canvas.style.boxShadow = "0 0 40px rgba(16, 185, 129, 0.8)";
        } else {
          soundAndFX.playSoftError();
          ebbinghausManager.markDifficult(this.char.id);
          this.combo = 0;
          ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
          ctx.fillRect(0, 0, W, H);
          this._timeout(() => {
            ctx.fillStyle = "rgba(180, 180, 180, 0.25)";
            ctx.fillRect(0, 0, W, H);
            ctx.fillText(this.char.char, W / 2, H / 2);
          }, 800);
        }
      });
    }
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

    this._timeout(() => {
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
        <h2 class="text-2xl sm:text-3xl font-black text-yellow-300 mb-2">
          ${perfect ? "太棒啦！三连击大满贯！" : "挑战成功！顺利完成复习！"}
        </h2>
        <p class="text-xs sm:text-sm text-gray-300 mb-4 font-bold">
          你已经扎实巩固了汉字 “<b class="text-amber-300 text-lg font-serif">${c.char}</b>” 的多维认知！
        </p>

        <div class="flex items-center gap-4 mb-6">
          <div class="bg-black/50 border border-white/25 rounded-2xl px-5 py-3">
            <div class="text-[10px] text-white/60 font-bold">正确题数</div>
            <div class="text-2xl font-black text-emerald-300">${this.correctCount} / ${this.queue.length}</div>
          </div>
          <div class="bg-black/50 border border-white/25 rounded-2xl px-5 py-3">
            <div class="text-[10px] text-white/60 font-bold">最高连击</div>
            <div class="text-2xl font-black text-yellow-300">${this.bestCombo} Combo</div>
          </div>
          <div class="bg-black/50 border border-white/25 rounded-2xl px-5 py-3">
            <div class="text-[10px] text-white/60 font-bold">挑战项目</div>
            <div class="text-xs font-black text-cyan-300 mt-1">
              ${this.queue.map((t) => TYPE_META[t].name).join(" · ")}
            </div>
          </div>
        </div>

        <button id="btn-goto-write-step" class="btn-game-orange text-white font-black text-base px-10 py-3.5 rounded-full shadow-2xl shimmer-badge flex items-center gap-2 cursor-pointer active:scale-95 transition-transform hover:brightness-105">
          <span class="flex items-center">${GAME_ICONS.sparkle("w-5 h-5")}</span> 
          <span>继续下一关复习</span> 
        </button>
      </div>
    `;

    const nextBtn = this.mount.querySelector("#btn-goto-write-step");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        soundAndFX.playPop();
        if (this.onComplete) this.onComplete();
      });
    }
  }
}
