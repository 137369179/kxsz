/**
 * 凯茜识字 (Cathy Literacy) - 130 本分级绘本馆与子集阅读器
 * 核心特色：
 *  1. 16:9 影院级大画幅绘本
 *  2. 画面隐藏互动寻宝热区（发现小鱼、大门、马车等趣味弹跳）
 *  3. 高精音频时间轴逐字变色卡拉OK伴读 + 单字精准点读
 *  4. 阅读理解趣味小测验（交互答题）
 *  5. 3D 黄金结业宝箱与星币礼炮结算
 */

import { STORYBOOKS_DATABASE } from "../data/books.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { mountGameShell, showGameToast } from "./SharedShell.js";
import { BaseModule } from "../utils/BaseModule.js";
import { GAME_ICONS } from "../utils/gameIcons.js";

export class BookModule extends BaseModule {
  constructor(container) {
    super(container);
    this.currentBook = null;
    this.currentPageIndex = 0;
    this.isQuizMode = false;
    this.quizAnswered = false;
    this.karaokeTimer = null;
  }

  destroy() {
    if (this.karaokeTimer) {
      clearInterval(this.karaokeTimer);
      this.karaokeTimer = null;
    }
    super.destroy();
  }

  render() {
    this.destroy();
    if (!this.currentBook) {
      this.renderShelf();
    } else if (this.isQuizMode) {
      this.renderQuiz();
    } else {
      this.renderReader();
    }
  }

  // ----------------------------------------------------
  // 1. 绘本馆书架界面
  // ----------------------------------------------------
  renderShelf() {
    const mainEl = mountGameShell(this.container, {
      activeMode: "books",
      heading: "凯茜分级绘本馆"
    });

    mainEl.innerHTML = `
      <div class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pb-8 overflow-y-auto no-scrollbar max-h-[calc(100vh-100px)]">
        
        <!-- 顶部书架横幅 -->
        <div class="relative w-full h-44 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 mb-6 bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 flex flex-col justify-end p-6">
          <div class="absolute -right-6 -bottom-6 opacity-20 transform scale-150 pointer-events-none">
            ${GAME_ICONS.book("w-56 h-56")}
          </div>
          
          <div class="relative z-10 text-white">
            <div class="flex items-center gap-3 mb-1">
              <span class="flex items-center">${GAME_ICONS.book("w-8 h-8")}</span>
              <h1 class="text-2xl font-black drop-shadow-md">凯茜分级阅读馆 (130 本精品绘本)</h1>
            </div>
            <p class="text-xs text-sky-200 font-bold">
              严格遵循“子集阅读”设计，每篇绘本仅含已学汉字，伴读高亮、画面寻宝、理解测验！
            </p>
          </div>
        </div>

        <!-- 绘本书籍网格 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${STORYBOOKS_DATABASE.map(
            (book) => `
            <div class="book-card cv-auto-large group bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border-4 border-amber-200 hover:border-orange-400 transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col justify-between" data-book-id="${book.id}">
              <div class="relative w-full h-44 overflow-hidden bg-amber-100">
                <img src="${book.coverImg}" alt="${book.title}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div class="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md">
                  第 ${book.level || 1} 阶绘本
                </div>
                <div class="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                  共 ${book.pages ? book.pages.length : 4} 页
                </div>
              </div>

              <div class="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h3 class="text-lg font-black text-amber-950 group-hover:text-orange-600 transition-colors">
                    ${book.title}
                  </h3>
                  <p class="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed font-semibold">
                    ${book.desc}
                  </p>
                </div>

                <div class="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between">
                  <div class="flex items-center gap-1">
                    <span class="text-[10px] text-gray-500 font-bold">核心字:</span>
                    ${(book.targetChars || ["日", "月", "山"])
                      .slice(0, 4)
                      .map(
                        (c) => `
                      <span class="bg-amber-100 text-amber-800 text-[10px] font-black px-1.5 py-0.5 rounded-md">${c}</span>
                    `
                      )
                      .join("")}
                  </div>
                  <button class="btn-game-orange text-white font-black text-xs px-4 py-1.5 rounded-full shadow-md active:scale-95">
                    开始阅读
                  </button>
                </div>
              </div>
            </div>
          `
          ).join("")}
        </div>

      </div>
    `;

    mainEl.querySelectorAll(".book-card").forEach((card) => {
      this._on(card, "click", () => {
        const bookId = card.dataset.bookId;
        this.currentBook = STORYBOOKS_DATABASE.find((b) => b.id === bookId);
        this.currentPageIndex = 0;
        this.isQuizMode = false;
        this.quizAnswered = false;
        soundAndFX.playSuccessSound();
        this.render();
      });
    });
  }

  // ----------------------------------------------------
  // 2. 16:9 影院级绘本阅读器 (字字高亮伴读 + 寻宝热区)
  // ----------------------------------------------------
  renderReader() {
    const book = this.currentBook;
    const page = book.pages[this.currentPageIndex];
    const totalPages = book.pages.length;

    const mainEl = mountGameShell(this.container, {
      activeMode: "books",
      heading: `${book.title}`
    });

    mainEl.innerHTML = `
      <div class="relative w-full max-w-5xl mx-auto flex flex-col justify-between py-2 px-4 select-none animate-fade-in">
        
        <!-- 阅读器顶部控制栏 -->
        <div class="w-full flex items-center justify-between bg-white/95 backdrop-blur-md px-6 py-2.5 rounded-full shadow-xl border-2 border-amber-200 mb-3">
          <button id="btn-back-shelf" class="flex items-center gap-1.5 text-amber-800 hover:text-orange-600 font-black text-xs px-3 py-1.5 rounded-full hover:bg-amber-100 transition-all">
            <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
            <span>返回书架</span>
          </button>
          
          <h2 class="text-sm font-black text-amber-950 flex items-center gap-2">
            <span>${book.title}</span>
            <span class="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full font-bold">第 ${this.currentPageIndex + 1} / ${totalPages} 页</span>
          </h2>

          <div class="flex items-center gap-2">
            <button id="btn-play-karaoke" class="btn-game-orange text-white font-black text-xs px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 active:scale-95">
              <span class="flex items-center">${GAME_ICONS.speaker("w-4 h-4")}</span>
              <span>伴读整页</span>
            </button>
          </div>
        </div>

        <!-- 16:9 沉浸画卷与寻宝交互区 -->
        <div class="w-full bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-200 mb-3 flex flex-col md:flex-row items-center">
          
          <!-- 左侧：插画 + 隐藏互动寻宝热区 -->
          <div class="relative w-full md:w-1/2 h-64 md:h-80 overflow-hidden bg-amber-100 group">
            <img src="${page.image}" alt="绘本插图" loading="lazy" decoding="async" class="w-full h-full object-cover" />
            
            <!-- 隐藏寻宝热区气泡 -->
            ${(page.hotspots || []).map((hp, idx) => `
              <button class="hotspot-trigger-btn absolute z-20 w-10 h-10 rounded-full bg-yellow-400/80 border-2 border-white text-white font-black text-xs flex items-center justify-center shadow-lg animate-bounce-slow active:scale-90 hover:scale-125 transition-transform" style="top: ${hp.y}%; left: ${hp.x}%;" data-sound="${hp.sound}" data-label="${hp.label}">
                ✨
              </button>
            `).join("")}

            <div class="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full pointer-events-none">
              ✨ 画面隐藏小宝藏，点击试试！
            </div>
          </div>

          <!-- 右侧：文字伴读区 (支持逐字点读) -->
          <div class="w-full md:w-1/2 p-6 flex flex-col justify-between text-center h-64 md:h-80">
            <div class="text-[11px] font-black text-amber-700 bg-amber-50 inline-block px-3 py-1 rounded-full border border-amber-200 self-center">
              👉 点击任意汉字即可单独听音点读
            </div>

            <div id="karaoke-text-container" class="text-2xl md:text-3xl font-black text-amber-950 leading-relaxed tracking-wider flex flex-wrap justify-center items-center gap-1.5 my-auto">
              ${(page.audioTimeTokens || page.text.split("").map(c => ({ char: c, highlight: false })))
                .map(
                  (token, idx) => `
                <span class="karaoke-char px-1.5 py-0.5 rounded-xl cursor-pointer hover:bg-orange-100 transition-all duration-200 ${
                  token.highlight ? "text-orange-600 font-extrabold underline decoration-wavy decoration-orange-400" : ""
                }" data-index="${idx}" data-char="${token.char}">
                  ${token.char}
                </span>
              `
                )
                .join("")}
            </div>

            <div class="text-[11px] text-gray-500 font-semibold">
              💡 核心生字：${(book.targetChars || []).join("、")}
            </div>
          </div>

        </div>

        <!-- 底部翻页控制器 -->
        <div class="w-full flex items-center justify-between px-6">
          <button id="btn-prev-page" class="bg-white hover:bg-amber-50 text-amber-900 font-black text-xs px-6 py-2.5 rounded-full shadow-lg border-2 border-amber-200 transition-all active:scale-95 ${
            this.currentPageIndex === 0 ? "opacity-40 pointer-events-none" : ""
          }">
            ⬅️ 上一页
          </button>

          <div class="flex items-center gap-2">
            ${book.pages
              .map(
                (_, idx) => `
              <div class="w-3 h-3 rounded-full transition-all ${idx === this.currentPageIndex ? "bg-orange-500 scale-125 ring-2 ring-orange-300" : "bg-amber-200"}"></div>
            `
              )
              .join("")}
          </div>

          <button id="btn-next-page" class="btn-game-orange text-white font-black text-xs px-6 py-2.5 rounded-full shadow-lg transition-all active:scale-95">
            ${this.currentPageIndex === book.pages.length - 1 ? "完成阅读 · 去测验 " : "下一页 "}
          </button>
        </div>

      </div>
    `;

    this.bindReaderEvents(mainEl);
  }

  bindReaderEvents(mainEl) {
    const book = this.currentBook;
    const page = book.pages[this.currentPageIndex];

    // 返回书架
    const backBtn = mainEl.querySelector("#btn-back-shelf");
    if (backBtn) {
      this._on(backBtn, "click", () => {
        this.currentBook = null;
        soundAndFX.playPop();
        this.render();
      });
    }

    // 寻宝热区点击
    mainEl.querySelectorAll(".hotspot-trigger-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        const snd = btn.dataset.sound;
        const label = btn.dataset.label;
        soundAndFX.playPop();
        soundAndFX.playSuccessSound();
        soundAndFX.triggerConfetti(this.container);
        showGameToast(this.container, `发现宝藏：${label}`, "success");
        if (snd) soundAndFX.speak(snd);
      });
    });

    // 逐字点读
    mainEl.querySelectorAll(".karaoke-char").forEach((span) => {
      this._on(span, "click", () => {
        const char = span.dataset.char;
        soundAndFX.playPop();
        soundAndFX.speak(char);
        span.classList.add("bg-yellow-300", "scale-125");
        this._timeout(() => span.classList.remove("bg-yellow-300", "scale-125"), 400);
      });
    });

    // 伴读整页
    const karaokeBtn = mainEl.querySelector("#btn-play-karaoke");
    if (karaokeBtn) {
      this._on(karaokeBtn, "click", () => {
        this.playKaraoke(page, mainEl);
      });
    }

    // 上一页
    const prevBtn = mainEl.querySelector("#btn-prev-page");
    if (prevBtn) {
      this._on(prevBtn, "click", () => {
        if (this.currentPageIndex > 0) {
          this.currentPageIndex--;
          soundAndFX.playPop();
          this.render();
        }
      });
    }

    // 下一页 / 进入测验
    const nextBtn = mainEl.querySelector("#btn-next-page");
    if (nextBtn) {
      this._on(nextBtn, "click", () => {
        if (this.currentPageIndex < book.pages.length - 1) {
          this.currentPageIndex++;
          soundAndFX.playPop();
          this.render();
        } else {
          // 进入阅读理解测验
          soundAndFX.playSuccessSound();
          this.isQuizMode = true;
          this.quizAnswered = false;
          this.render();
        }
      });
    }
  }

  // ----------------------------------------------------
  // 3. 阅读理解趣味小测验
  // ----------------------------------------------------
  renderQuiz() {
    const book = this.currentBook;
    const quiz = book.quiz || {
      question: `故事中提到了哪些有趣的生字和故事？`,
      options: ["大家一起快乐识字", "什么都没发生", "大怪兽睡大觉"],
      answer: 0
    };

    const mainEl = mountGameShell(this.container, {
      activeMode: "books",
      heading: `阅读测验 · ${book.title}`
    });

    soundAndFX.speak(`小测验时间！${quiz.question}`);

    mainEl.innerHTML = `
      <div class="relative w-full max-w-3xl mx-auto flex flex-col justify-between py-6 px-4 select-none animate-fade-in">
        
        <div class="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
          <div class="mb-4 flex items-center justify-center">${GAME_ICONS.trophy("w-16 h-16")}</div>
          <span class="text-xs font-black bg-orange-100 text-orange-800 px-4 py-1 rounded-full mb-3">
            📚 绘本阅读理解小测验
          </span>
          <h2 class="text-xl font-black text-amber-950 mb-6">
            ${quiz.question}
          </h2>

          <div class="flex flex-col gap-3.5 w-full max-w-lg">
            ${quiz.options
              .map(
                (opt, idx) => `
              <button class="quiz-option-btn p-4 rounded-2xl bg-amber-50 hover:bg-orange-100 border-2 border-amber-300 text-amber-950 font-black text-sm shadow-md active:scale-95 transition-all text-left flex items-center justify-between" data-index="${idx}">
                <span>${opt}</span>
                <span class="w-6 h-6 rounded-full border-2 border-amber-400 flex items-center justify-center text-xs text-amber-700 font-bold">${String.fromCharCode(65 + idx)}</span>
              </button>
            `
              )
              .join("")}
          </div>
        </div>

        <!-- 结业胜利弹窗 -->
        <div id="book-finish-modal" class="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white hidden animate-scale-up z-50">
          <div class="mb-4 flex items-center justify-center">${GAME_ICONS.trophy("w-24 h-24")}</div>
          <h2 class="text-3xl font-black text-yellow-300 mb-2">恭喜读完《${book.title}》！</h2>
          <p class="text-xs text-gray-300 mb-6 font-semibold">你已经成功掌握了绘本中的全部汉字，阅读能力再上新台阶！</p>
          <div class="candy-pill rounded-full px-6 py-2 mb-6 text-xs text-yellow-300 font-bold flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.coin("w-5 h-5")}</span>
            <span>获得 15 凯茜星币奖励</span>
          </div>
          <button id="btn-finish-return-shelf" class="btn-game-orange text-white font-black text-base px-10 py-3 rounded-full">
            收录进阅读记录，返回书架
          </button>
        </div>

      </div>
    `;

    const finishModal = mainEl.querySelector("#book-finish-modal");
    const returnShelfBtn = mainEl.querySelector("#btn-finish-return-shelf");

    mainEl.querySelectorAll(".quiz-option-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        if (this.quizAnswered) return;
        this.quizAnswered = true;

        const pickedIdx = parseInt(btn.dataset.index, 10);
        if (pickedIdx === quiz.answer) {
          soundAndFX.playSuccessSound();
          soundAndFX.playVictoryFanfare();
          soundAndFX.triggerConfetti(this.container);
          soundAndFX.triggerCoinFly(this.container);
          ebbinghausManager.addCoins(15);
          btn.classList.add("ring-4", "ring-emerald-500", "bg-emerald-100");

          this._timeout(() => {
            if (finishModal) finishModal.classList.remove("hidden");
          }, 1000);
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

    if (returnShelfBtn) {
      this._on(returnShelfBtn, "click", () => {
        soundAndFX.playPop();
        this.currentBook = null;
        this.isQuizMode = false;
        this.render();
      });
    }
  }

  // 卡拉OK高亮播放器
  playKaraoke(page, mainEl) {
    const spans = mainEl.querySelectorAll(".karaoke-char");
    soundAndFX.speak(page.text);

    let currentIndex = 0;
    const interval = 300;

    if (this.karaokeTimer) clearInterval(this.karaokeTimer);

    this.karaokeTimer = this._interval(() => {
      spans.forEach((s) => s.classList.remove("bg-yellow-300", "text-orange-600", "scale-110"));

      if (currentIndex < spans.length) {
        const activeSpan = spans[currentIndex];
        activeSpan.classList.add("bg-yellow-300", "text-orange-600", "scale-110");
        currentIndex++;
      } else {
        if (this.karaokeTimer) {
          clearInterval(this.karaokeTimer);
          this.karaokeTimer = null;
        }
      }
    }, interval);
  }
}
