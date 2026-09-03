/** BookModule — post-read quiz, certificate, karaoke */
import { soundAndFX } from "../soundEngine.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { mountGameShell } from "../../components/SharedShell.js";
import { GAME_ICONS } from "../gameIcons.js";

export function renderQuiz() {
  const book = this.currentBook;
  const targetChar = (book.targetChars || ["日"])[0];

  // Stage 1: 生字眼力大考验
  const stage1Question = {
    title: "【第 1 关 · 生字眼力大考验】",
    question: `在《${book.title}》的故事中，你认识这颗生字吗？`,
    highlightChar: targetChar,
    options: [
      `认识！读作“${targetChar}”`,
      `不认识`,
      `好像在哪里见过`
    ],
    correctIndex: 0
  };

  // Stage 2: 故事理解小问答
  const stage2Quiz = Array.isArray(book.quiz) ? book.quiz[0] : (book.quiz || {
    question: `在故事《${book.title}》里，主要讲述了什么？`,
    options: ["大家一起快乐识字探索", "什么都没发生", "大怪兽去睡觉了"],
    correctIndex: 0
  });

  const activeQuiz = this.currentQuizStage === 1 ? stage1Question : {
    title: "【第 2 关 · 故事理解小问答】",
    question: stage2Quiz.question,
    options: stage2Quiz.options,
    correctIndex: stage2Quiz.correctIndex !== undefined ? stage2Quiz.correctIndex : 0
  };

  const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
    activeMode: "books",
    heading: `读后巩固测验 · ${book.title}`
  });
  this._addCleanup(destroyShell);

  soundAndFX.speakPriority(activeQuiz.question, { kind: "sentence" });

  mainEl.innerHTML = `
    <div class="relative w-full max-w-3xl mx-auto flex flex-col justify-between pt-16 sm:pt-20 pb-8 px-4 select-none animate-fade-in">
      
      <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
        <div class="mb-3 flex items-center justify-center transform hover:scale-110 transition-transform">
          ${GAME_ICONS.trophy("w-16 h-16")}
        </div>
        <span class="text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-1 rounded-full mb-3 shadow-sm">
          ${activeQuiz.title}
        </span>
        
        ${this.currentQuizStage === 1 && activeQuiz.highlightChar ? `
          <div class="w-20 h-20 bg-red-50 border-4 border-red-500 rounded-2xl flex items-center justify-center mb-3 shadow-md">
            <span class="text-5xl font-black text-red-900 font-serif">${activeQuiz.highlightChar}</span>
          </div>
        ` : ''}

        <h2 class="text-xl sm:text-2xl font-black text-amber-950 mb-6 leading-relaxed">
          ${activeQuiz.question}
        </h2>

        <div class="flex flex-col gap-3.5 w-full max-w-lg">
          ${activeQuiz.options
            .map(
              (opt, idx) => `
            <button class="quiz-option-btn group p-4 rounded-2xl bg-white hover:bg-amber-50/80 border-2 border-amber-200 hover:border-orange-400 shadow-md hover:shadow-xl text-amber-950 font-black text-sm sm:text-base active:scale-95 hover:scale-[1.02] transition-all duration-300 text-left flex items-center justify-between cursor-pointer" data-index="${idx}">
              <span class="group-hover:text-orange-700 transition-colors">${opt}</span>
              <span class="w-8 h-8 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 shadow-sm border border-amber-500 flex items-center justify-center text-xs text-amber-900 font-black shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)] group-hover:rotate-12 transition-transform">${String.fromCharCode(65 + idx)}</span>
            </button>
          `
            )
            .join("")}
        </div>
      </div>

    </div>
  `;

  mainEl.querySelectorAll(".quiz-option-btn").forEach((btn) => {
    this._on(btn, "click", () => {
      if (this.quizAnswered) return;
      this.quizAnswered = true;

      const pickedIdx = parseInt(btn.dataset.index, 10);
      if (pickedIdx === activeQuiz.correctIndex) {
        soundAndFX.playSuccessSound();
        btn.classList.add("ring-4", "ring-emerald-500", "bg-emerald-100");
        mainEl.querySelectorAll(".quiz-option-btn").forEach((b) => { b.style.pointerEvents = "none"; });

        this._timeout(() => {
          if (this.currentQuizStage === 1) {
            this.currentQuizStage = 2;
            this.quizAnswered = false;
            this.render();
          } else {
            // 2 关全部通关，颁发结业证书！
            ebbinghausManager.markBookRead(book.id);
            ebbinghausManager.addCoins(15);
            ebbinghausManager.addStars(5);
            ebbinghausManager.save();

            this.isQuizMode = false;
            this.isCertificateMode = true;
            this.render();
          }
        }, 800);
      } else {
        soundAndFX.playSoftError();
        btn.classList.add("animate-shake", "ring-4", "ring-rose-500", "bg-rose-100");
        this._timeout(() => {
          btn.classList.remove("animate-shake");
          this.quizAnswered = false;
        }, 600);
      }
    });
  });
}

// ----------------------------------------------------
// 8. 凯茜小小阅读家 · 荣誉结业证书 (洪恩标杆特色)
// ----------------------------------------------------
export function renderCertificate() {
  const book = this.currentBook;
  const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
    activeMode: "books",
    heading: `荣誉结业证书 · ${book.title}`
  });
  this._addCleanup(destroyShell);

  soundAndFX.playVictoryFanfare();
  soundAndFX.triggerConfetti(this.container);
  soundAndFX.triggerCoinFly(this.container);

  mainEl.innerHTML = `
    <div class="relative w-full max-w-2xl mx-auto flex flex-col items-center justify-center pt-16 sm:pt-20 pb-8 px-4 select-none animate-scale-up">
      
      <div class="relative w-full bg-gradient-to-b from-[#FFFDF5] via-[#FFF8E7] to-[#FFF3D6] rounded-3xl p-8 sm:p-10 shadow-2xl border-8 border-amber-400 flex flex-col items-center text-center">
        
        <div class="absolute -top-7 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-2 rounded-full border-4 border-white shadow-xl flex items-center gap-2">
          <span class="flex items-center">${GAME_ICONS.crown("w-6 h-6")}</span>
          <span class="text-sm font-black text-amber-950">小小阅读家 · 荣誉通关证书</span>
        </div>

        <div class="mt-4 mb-2 flex items-center justify-center">
          ${GAME_ICONS.trophy("w-20 h-20")}
        </div>

        <h2 class="text-2xl sm:text-3xl font-black text-amber-950 mb-1">
          恭喜通关《${book.title}》
        </h2>
        <p class="text-xs text-amber-800/80 font-bold mb-5">
          凯茜识字分级阅读 · 顺利掌握全书精髓与核心生字
        </p>

        <div class="flex items-center gap-2 mb-6">
          <span class="flex items-center transform hover:scale-125 transition-transform">${GAME_ICONS.star("w-8 h-8", false)}</span>
          <span class="flex items-center transform hover:scale-125 transition-transform scale-125">${GAME_ICONS.star("w-8 h-8", false)}</span>
          <span class="flex items-center transform hover:scale-125 transition-transform">${GAME_ICONS.star("w-8 h-8", false)}</span>
        </div>

        <div class="w-full bg-white/90 p-4 rounded-2xl border-2 border-amber-200/90 mb-6 text-center">
          <span class="text-xs font-black text-amber-900 block mb-2">本次阅读巩固生字：</span>
          <div class="flex flex-wrap justify-center gap-2">
            ${(book.targetChars || ["日", "月", "山"]).map(c => `
              <div class="w-10 h-10 bg-red-50 border-2 border-red-400 rounded-xl flex items-center justify-center font-serif text-xl font-black text-red-900 shadow-sm">
                ${c}
              </div>
            `).join("")}
          </div>
        </div>

        <div class="candy-pill rounded-full px-6 py-2 mb-6 text-sm text-yellow-300 font-black flex items-center gap-4 border-2 border-yellow-300 shadow-xl">
          <span class="flex items-center gap-1.5"><span class="flex items-center">${GAME_ICONS.coin("w-5 h-5")}</span> +15 凯茜星币</span>
          <span class="flex items-center gap-1.5"><span class="flex items-center">${GAME_ICONS.star("w-5 h-5", true)}</span> +5 智慧星</span>
        </div>

        <div class="flex items-center gap-4 flex-wrap justify-center">
          <button id="btn-cert-replay" class="bg-white hover:bg-amber-50 text-amber-900 font-black text-xs px-6 py-3 rounded-full shadow-lg border-2 border-amber-200 active:scale-95 cursor-pointer">
            再次精读重温
          </button>
          <button id="btn-cert-back-shelf" class="btn-game-orange text-white font-black text-xs px-8 py-3 rounded-full shadow-xl active:scale-95 cursor-pointer">
            收录档案，返回书架
          </button>
        </div>

      </div>

    </div>
  `;

  const replayBtn = mainEl.querySelector("#btn-cert-replay");
  if (replayBtn) {
    this._on(replayBtn, "click", () => {
      soundAndFX.playPop();
      this.currentPageIndex = 0;
      this.isQuizMode = false;
      this.isCertificateMode = false;
      this.render();
    });
  }

  const backShelfBtn = mainEl.querySelector("#btn-cert-back-shelf");
  if (backShelfBtn) {
    this._on(backShelfBtn, "click", () => {
      soundAndFX.playPop();
      this.currentBook = null;
      this.isQuizMode = false;
      this.isCertificateMode = false;
      this.render();
    });
  }
}

// ----------------------------------------------------
// 9. 卡拉OK高亮伴读播放器 (毫秒级字界同步 + 自动连读衔接)
// ----------------------------------------------------
export function playKaraoke(page, mainEl) {
  const spans = mainEl.querySelectorAll(".karaoke-char");
  if (!spans || spans.length === 0) return;

  if (this.karaokeTimer) {
    clearInterval(this.karaokeTimer);
    this.karaokeTimer = null;
  }
  
  this.karaokeSessionId++;
  const sessionId = this.karaokeSessionId;

  // 清空旧高亮
  spans.forEach((s) => s.classList.remove("bg-amber-300", "text-amber-950", "scale-110", "ring-4", "ring-amber-200/90", "shadow-md"));

  // 播放伴读音频并同步字界高亮
  soundAndFX.speakPriority(page.text, {
    kind: "sentence",
    emotion: "gentle",
    onProgress: ({ char_index }) => {
      if (this.karaokeSessionId !== sessionId || !this.currentBook) return;
      spans.forEach((s, idx) => {
        if (idx === char_index) {
          s.classList.add("bg-amber-300", "text-amber-950", "scale-110", "ring-4", "ring-amber-200/90", "shadow-md");
        } else {
          s.classList.remove("bg-amber-300", "text-amber-950", "scale-110", "ring-4", "ring-amber-200/90", "shadow-md");
        }
      });
    },
    onEnd: () => {
      if (this.karaokeSessionId !== sessionId || !this.currentBook) return;
      spans.forEach((s) => s.classList.remove("bg-amber-300", "text-amber-950", "scale-110", "ring-4", "ring-amber-200/90", "shadow-md"));

      // 如果开启了自动连读，延时 1.5 秒自动翻到下一页
      if (this.isAutoPlay && this.currentBook) {
        this.autoPlayTimer = this._timeout(() => {
          if (!this.isAutoPlay || !this.currentBook || this.karaokeSessionId !== sessionId) return;
          if (this.currentPageIndex < this.currentBook.pages.length - 1) {
            this.currentPageIndex++;
            this._saveProgress();
            this.render();
          } else {
            // 读完全本进入双重测验
            this.isQuizMode = true;
            this.currentQuizStage = 1;
            this.quizAnswered = false;
            this.render();
          }
        }, 1500);
      }
    }
  });
}
