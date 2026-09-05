/** PlayModule mode — extracted */
import { CHARACTER_DATABASE } from "../../data/characters.js";
import { IDIOMS_DATABASE } from "../../data/idioms.js";
import { POEMS_DATABASE } from "../../data/poems.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { soundAndFX } from "../soundEngine.js";
import { mountGameShell, showGameToast } from "../../components/SharedShell.js";
import { escapeHtml } from "../BaseModule.js";
import { GAME_ICONS } from "../gameIcons.js";
import { EVENTS } from "../eventBus.js";
import { RADICAL_FAMILIES } from "../../data/radicalFamilies.js";
import { forChar as mmForChar, SCENES as MM_SCENES } from "../multimodalEngine.js";
import {
  shuffle,
  pickReviewChars,
  buildOptions,
  buildMatchPairs,
  spawnFloatingText,
  startCountdown,
  writeKnownCharsReview,
} from "./playHelpers.js";

export function renderPoemHall() {
    const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
      activeMode: "play",
      heading: "凯茜游乐场 · 古诗国学馆"
    });
    this._addCleanup(destroyShell);

    const learnedList = ebbinghausManager.progress.learnedPoems || [];
    const learnedCount = learnedList.length;

    const targetEl = mainEl || (this.container && this.container.querySelector && this.container.querySelector(".shell-content")) || this.container;
    if (!targetEl) return;

    targetEl.innerHTML = `
      <div class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pb-8">
        
        <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
          <button id="btn-poem-hall-back" class="bg-white/10 hover:bg-white/20 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-full border border-white/20 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer shadow">
            <span>← 返回游乐场</span>
          </button>

          <div class="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/15">
            <span class="flex items-center">${GAME_ICONS.book("w-5 h-5")}</span>
            <span class="text-xs font-black text-yellow-300">
              已诵读背诵: <b class="text-base text-amber-400">${learnedCount}</b> / ${POEMS_DATABASE.length} 首
            </span>
          </div>
        </div>

        <div class="relative w-full h-36 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300/60 mb-6 bg-gradient-to-r from-amber-800 via-orange-800 to-yellow-900 flex flex-col justify-end p-6">
          <div class="relative z-10 text-white">
            <div class="flex items-center gap-3 mb-1">
              <span class="flex items-center">${GAME_ICONS.book()}</span>
              <h1 class="text-2xl font-black drop-shadow-md text-amber-200">经典启蒙古诗诵读馆</h1>
            </div>
            <p class="text-xs text-yellow-100 font-bold">
              教育部小学新课标 20 首必背经典 · 逐句卡拉OK点读 · 儿童画意境赏析 · 诗意趣味小闯关
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          ${POEMS_DATABASE.map((poem) => {
            const isLearned = learnedList.includes(poem.id);
            const firstTwoLines = poem.lines.slice(0, 2).map((l) => l.text).join(" ");
            return `
              <div class="poem-card group relative bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-xl border-4 ${
                isLearned ? "border-amber-400 bg-amber-50/95" : "border-white/20 hover:border-amber-300"
              } cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-id="${poem.id}">
                
                ${
                  isLearned
                    ? `<div class="absolute top-3 right-3 bg-amber-400 text-amber-950 font-black text-[10px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                         <span class="flex items-center">${GAME_ICONS.crown("w-3 h-3")}</span>
                         <span>已背诵</span>
                       </div>`
                    : ""
                }

                ${
                  poem.image
                    ? `<div class="w-full h-32 rounded-2xl overflow-hidden mb-3 shadow-md border border-amber-200/60 bg-amber-100/50">
                         <img src="${poem.image}" alt="${poem.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                       </div>`
                    : ""
                }
                <div>
                  <div class="flex items-center gap-2 mb-1.5">
                    <span class="text-[10px] font-black bg-amber-500/20 text-amber-800 px-2 py-0.5 rounded-md">${poem.dynasty} · ${poem.author}</span>
                    <span class="text-[10px] font-bold text-gray-500">${poem.pinyin}</span>
                  </div>
                  <h3 class="text-2xl font-black text-gray-900 group-hover:text-amber-700 transition-colors mb-2">${poem.title}</h3>
                  <p class="text-xs text-gray-600 font-bold line-clamp-2 leading-relaxed bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50 mb-3">
                    ${firstTwoLines}
                  </p>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span class="text-[11px] font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">${poem.themeTag}</span>
                  <button class="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs px-4 py-2 rounded-full shadow active:scale-95 transition-transform flex items-center gap-1">
                    <span>品读诵读</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>

      </div>
    `;

    // 绑定返回
    const backBtn = targetEl.querySelector("#btn-poem-hall-back");
    if (backBtn) {
      this._on(backBtn, "click", () => {
        soundAndFX.playPop();
        this.currentMode = null;
        this.render();
      });
    }

    // 绑定进入诗歌详情
    targetEl.querySelectorAll(".poem-card").forEach((card) => {
      this._on(card, "click", () => {
        const id = card.dataset.id;
        const poem = POEMS_DATABASE.find((p) => p.id === id);
        if (poem) {
          soundAndFX.playPop();
          this.renderPoemReader(poem);
        }
      });
    });
  }

  // ----------------------------------------------------
  // 古诗阅读与卡拉OK伴读大剧场
  // ----------------------------------------------------
export function renderPoemReader(poem) {
    const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
      activeMode: "play",
      heading: `古诗品读 · ${poem.title}`
    });
    this._addCleanup(destroyShell);

    const isLearned = (ebbinghausManager.progress.learnedPoems || []).includes(poem.id);

    mainEl.innerHTML = `
      <div class="relative w-full max-w-4xl mx-auto flex flex-col select-none animate-fade-in pb-10">
        
        <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
          <button id="btn-reader-back" class="bg-white/10 hover:bg-white/20 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-full border border-white/20 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer shadow">
            <span>← 返回古诗馆</span>
          </button>

          <div class="flex items-center gap-2">
            <button id="btn-karaoke-recite" class="bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 font-black text-xs sm:text-sm px-4 py-2 rounded-full shadow-lg active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.speaker("w-4 h-4")}</span>
              <span>全文伴读</span>
            </button>
            <button id="btn-open-feihua" class="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-full shadow-lg active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
              <span>古诗飞花令 (+15星币)</span>
            </button>
            <button id="btn-open-poem-quiz" class="btn-game-orange text-white font-black text-xs sm:text-sm px-4 py-2 rounded-full shadow-lg active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.trophy("w-4 h-4")}</span>
              <span>诗意小问答 (+15星币)</span>
            </button>
          </div>
        </div>

        <div class="bg-gradient-to-b from-amber-50 via-orange-50/80 to-amber-100 rounded-3xl border-4 border-amber-300 p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-6">
          
          <div class="text-center mb-8 border-b-2 border-amber-200 pb-5">
            <div class="text-xs sm:text-sm font-bold text-amber-700 mb-1">${poem.pinyin}</div>
            <h1 class="text-4xl sm:text-5xl font-black text-amber-950 tracking-wider mb-2 font-serif">${poem.title}</h1>
            <div class="inline-block bg-amber-200/80 text-amber-900 font-black text-xs px-3 py-1 rounded-full">
              〔${poem.dynasty}〕${poem.author}
            </div>
          </div>

          <div class="flex flex-col items-center gap-4 sm:gap-6 my-4">
            ${(() => {
              const learnedCharSet = new Set(
                Object.values(ebbinghausManager.progress.charRecords || {}).map(r => {
                  const charObj = CHARACTER_DATABASE.find(c => c.id === r.charId);
                  return charObj ? charObj.char : null;
                }).filter(Boolean)
              );
              return poem.lines.map((line, idx) => `
                <div class="poem-line-box group flex flex-col items-center p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:bg-amber-200/50 cursor-pointer w-full max-w-lg border border-transparent hover:border-amber-300" data-idx="${idx}" data-text="${line.text}">
                  <div class="text-xs sm:text-sm font-bold text-amber-700 tracking-widest mb-1 opacity-80">${line.pinyin}</div>
                  <div class="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-widest font-serif flex items-center justify-center gap-1.5 flex-wrap">
                    ${Array.from(line.text).map((ch) => {
                      if (learnedCharSet.has(ch)) {
                        return `<span class="poem-char-learned relative px-2 py-0.5 rounded-xl bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-300 text-amber-950 font-black shadow-md ring-2 ring-amber-400 cursor-pointer hover:scale-125 transition-transform" data-char="${ch}" title="点击发音并点亮已学汉字">${ch}<span class="absolute -top-1.5 -right-1 flex items-center">${GAME_ICONS.star("w-3 h-3", false)}</span></span>`;
                      }
                      return `<span class="poem-char hover:text-amber-600 transition-colors" data-char="${ch}">${ch}</span>`;
                    }).join("")}
                  </div>
                </div>
              `).join("");
            })()}
          </div>

          <div class="mt-8 pt-5 border-t-2 border-amber-200/70 flex items-center justify-center gap-2 flex-wrap">
            <span class="text-xs font-black text-amber-800">诗中必背字:</span>
            ${poem.targetChars.map((ch) => `
              <button class="target-char-pill bg-white border border-amber-300 shadow-sm text-amber-950 font-black text-sm w-9 h-9 rounded-xl flex items-center justify-center hover:bg-amber-400 hover:scale-110 active:scale-95 transition-all cursor-pointer" data-char="${ch}">
                ${ch}
              </button>
            `).join("")}
          </div>

        </div>

        <div class="bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 p-6 shadow-xl text-white">
          <h2 class="text-lg font-black text-amber-300 flex items-center gap-2 mb-3">
            <span class="flex items-center">${GAME_ICONS.sparkle("w-5 h-5")}</span>
            <span>诗意画卷与儿童意境赏析</span>
          </h2>
          ${
            poem.image
              ? `<div class="w-full h-48 sm:h-64 rounded-2xl overflow-hidden mb-4 border-2 border-amber-300/40 shadow-2xl bg-black/30">
                   <img src="${poem.image}" alt="${poem.title}" class="w-full h-full object-cover" />
                 </div>`
              : ""
          }
          <p class="text-xs sm:text-sm text-white/90 leading-relaxed font-bold bg-black/20 p-4 rounded-2xl border border-white/10">
            ${poem.appreciation}
          </p>
        </div>

      </div>
    `;

    // 绑定返回
    const backBtn = mainEl.querySelector("#btn-reader-back");
    if (backBtn) {
      this._on(backBtn, "click", () => {
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        this.renderPoemHall();
      });
    }

    // 绑定点击单句发音
    mainEl.querySelectorAll(".poem-line-box").forEach((box) => {
      this._on(box, "click", () => {
        const text = box.dataset.text;
        box.classList.add("bg-amber-300/60", "scale-105");
        soundAndFX.speakPriority(text, { kind: "sentence", priority: 1 });
        this._timeout(() => box.classList.remove("bg-amber-300/60", "scale-105"), 1200);
      });
    });

    // 绑定生字发音
    mainEl.querySelectorAll(".target-char-pill").forEach((btn) => {
      this._on(btn, "click", (e) => {
        e.stopPropagation();
        const ch = btn.dataset.char;
        soundAndFX.speakPriority(ch, { kind: "char", priority: 1 });
      });
    });

    // 绑定卡拉OK逐句伴读
    const karaokeBtn = mainEl.querySelector("#btn-karaoke-recite");
    if (karaokeBtn) {
      this._on(karaokeBtn, "click", () => {
        soundAndFX.stopSpeaking();
        const lineBoxes = mainEl.querySelectorAll(".poem-line-box");
        let idx = 0;

        const speakNextLine = () => {
          if (idx >= poem.lines.length) {
            soundAndFX.playCrownFanfare();
            showGameToast(this.container, `《${poem.title}》全诗伴读诵读完成！`, "success");
            return;
          }
          lineBoxes.forEach((b) => b.classList.remove("bg-amber-300/80", "scale-105", "shadow-lg"));
          const currentBox = lineBoxes[idx];
          if (currentBox) {
            currentBox.classList.add("bg-amber-300/80", "scale-105", "shadow-lg");
          }
          const line = poem.lines[idx];
          soundAndFX.speakPriority(line.text, { kind: "sentence", priority: 1 });
          idx++;
          this._timeout(speakNextLine, 2400);
        };

        speakNextLine();
      });
    }

    // 绑定问答
    const quizBtn = mainEl.querySelector("#btn-open-poem-quiz");
    if (quizBtn && poem.quiz) {
      this._on(quizBtn, "click", () => {
        soundAndFX.playPop();
        this._renderPoemQuiz(poem);
      });
    }

    // 绑定飞花令
    const feihuaBtn = mainEl.querySelector("#btn-open-feihua");
    if (feihuaBtn) {
      this._on(feihuaBtn, "click", () => {
        soundAndFX.playPop();
        this._renderFeihuaGame(poem);
      });
    }

    // 绑定已学汉字点亮
    mainEl.querySelectorAll(".poem-char-learned").forEach((span) => {
      this._on(span, "click", (e) => {
        e.stopPropagation();
        const ch = span.dataset.char;
        soundAndFX.playCoinClink();
        this._timeout(() => {
          soundAndFX.speakPriority(ch, { kind: "char", priority: 1 });
        }, 150);
        showGameToast(this.container, `点亮已学生字【${ch}】！`, "success");
      });
    });
  }

  // ----------------------------------------------------
  // 古诗趣味小问答
  // ----------------------------------------------------
export function _renderPoemQuiz(poem) {
    const quiz = poem.quiz;
    let answered = false;

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col items-center justify-center select-none bg-gradient-to-b from-amber-950 via-orange-950 to-amber-900 text-white p-6">
        <div class="w-full max-w-xl flex flex-col items-center text-center animate-scale-up">
          
          <div class="bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/20 p-8 w-full shadow-2xl">
            <div class="flex items-center justify-center gap-2 mb-4">
              <span class="flex items-center">${GAME_ICONS.trophy()}</span>
              <span class="text-xs font-black bg-amber-400 text-amber-950 px-3 py-1 rounded-full">《${poem.title}》诗意小闯关</span>
            </div>
            <h2 class="text-xl font-black text-yellow-300 mb-6 leading-relaxed">${quiz.question}</h2>
            
            <div class="flex flex-col gap-3">
              ${quiz.options.map((opt, idx) => `
                <button class="poem-quiz-opt text-left p-4 rounded-2xl bg-white/10 hover:bg-white/20 border-2 border-white/20 text-white font-black text-sm shadow active:scale-95 transition-all flex items-center gap-3 cursor-pointer" data-idx="${idx}">
                  <span class="w-7 h-7 rounded-full border-2 border-amber-300 flex items-center justify-center text-xs text-amber-300 font-bold flex-shrink-0">${String.fromCharCode(65 + idx)}</span>
                  <span>${opt}</span>
                </button>
              `).join("")}
            </div>

            <div id="poem-quiz-feedback" class="mt-4 h-8 text-sm font-black"></div>
          </div>
        </div>

        <div id="poem-win-modal" class="fixed inset-0 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center z-50 hidden animate-scale-up">
          <div class="w-20 h-20 mb-2 flex items-center justify-center">${GAME_ICONS.crown("w-16 h-16")}</div>
          <h2 class="text-3xl font-black text-yellow-300 mt-2 mb-2">诗意通晓！太棒了！</h2>
          <p class="text-white/80 text-sm font-bold mb-6">你已经完全掌握了《${poem.title}》的意境！</p>
          <div class="candy-pill px-6 py-2 mb-6 text-yellow-300 font-black flex items-center gap-2 border border-amber-400">
            <span class="flex items-center">${GAME_ICONS.coin()}</span>
            <span>获得 15 凯茜星币</span>
          </div>
          <div class="flex gap-3">
            <button id="btn-win-next-poem" class="btn-game-orange text-white font-black px-8 py-3 rounded-full cursor-pointer shadow-lg active:scale-95">再读一首</button>
            <button id="btn-win-poem-home" class="btn-game-wood text-white font-black px-8 py-3 rounded-full cursor-pointer shadow-lg active:scale-95">返回古诗馆</button>
          </div>
        </div>
      </div>
    `;

    soundAndFX.speakPriority(quiz.question, { kind: "sentence", emotion: "question" });

    const feedback = this.container.querySelector("#poem-quiz-feedback");
    const winModal = this.container.querySelector("#poem-win-modal");

    this.container.querySelectorAll(".poem-quiz-opt").forEach((btn) => {
      this._on(btn, "click", () => {
        if (answered) return;
        answered = true;
        const idx = parseInt(btn.dataset.idx, 10);

        if (idx === quiz.correctIndex) {
          btn.classList.add("ring-4", "ring-emerald-400", "bg-emerald-500/30");
          soundAndFX.playCrownFanfare();
          soundAndFX.triggerConfetti(this.container);
          soundAndFX.triggerCoinFly(this.container);
          ebbinghausManager.addCoins(15);
          writeKnownCharsReview(poem.targetChars || [], true);

          // 记录古诗掌握
          if (!ebbinghausManager.progress.learnedPoems) ebbinghausManager.progress.learnedPoems = [];
          if (!ebbinghausManager.progress.learnedPoems.includes(poem.id)) {
            ebbinghausManager.progress.learnedPoems.push(poem.id);
            ebbinghausManager.save();
          }

          if (feedback) feedback.innerHTML = `<span class="text-emerald-300 text-base">${quiz.explanation || "完全正确！理解力超群！"}</span>`;
          this._timeout(() => {
            if (winModal) winModal.classList.remove("hidden");
          }, 1200);
        } else {
          btn.classList.add("animate-shake", "ring-4", "ring-rose-400");
          soundAndFX.playSoftError();
          this._timeout(() => {
            soundAndFX.speakPriority("再仔细想想诗句的意思哦！", { kind: "sentence", emotion: "correction" });
          }, 180);
          writeKnownCharsReview(poem.targetChars || [], false);
          if (feedback) feedback.innerHTML = `<span class="text-rose-300">再想想哦，正确答案是 ${String.fromCharCode(65 + quiz.correctIndex)}</span>`;
          this._timeout(() => {
            btn.classList.remove("animate-shake");
            answered = false;
          }, 900);
        }
      });
    });

    const winNextBtn = this.container.querySelector("#btn-win-next-poem");
    if (winNextBtn) {
      this._on(winNextBtn, "click", () => {
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        this.renderPoemHall();
      });
    }

    const winHomeBtn = this.container.querySelector("#btn-win-poem-home");
    if (winHomeBtn) {
      this._on(winHomeBtn, "click", () => {
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        this.renderPoemHall();
      });
    }
  }

