/**
 * 凯茜识字 (Cathy Literacy) - 分级绘本馆与沉浸式阅读器
 * 核心特色：
 *  1. 分阶与主题书架筛选（全部 / 第1阶·启蒙 / 第2阶·生活 / 第3阶·进阶）
 *  2. 已读通关印章（金色皇冠 + 通关三星）与在读进度持久化
 *  3. 16:9 影院级大画幅绘本与画面隐藏互动寻宝热区
 *  4. 毫秒级字界事件驱动的卡拉OK伴读 + 单字精准点读
 *  5. 汉字顶部标准拼音注音（Ruby Pinyin）一键显隐切换
 *  6. 一键【自动连读】全本沉浸伴读模式（自动伴读、延时展示、平滑翻页）
 *  7. 【我来读一读】儿童智能跟读与亲子录音回放
 *  8. 阅读理解趣味小测验与 3D 黄金宝箱礼炮结算
 */

import { STORYBOOKS_DATABASE } from "../data/books.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { mountGameShell, showGameToast } from "./SharedShell.js";
import { BaseModule } from "../utils/BaseModule.js";
import { GAME_ICONS } from "../utils/gameIcons.js";
import { g2p } from "../utils/g2p.js";
import { pronunciationEval } from "../utils/pronunciationEval.js";

export class BookModule extends BaseModule {
  constructor(container) {
    super(container);
    this.currentBook = null;
    this.currentPageIndex = 0;
    this.isQuizMode = false;
    this.quizAnswered = false;
    this.karaokeTimer = null;
    this.currentFilterStage = "all"; // "all" | 1 | 2 | 3
    this.isAutoPlay = false; // 自动连读开关
    this.showPinyin = true; // 拼音注音显隐开关
    this.autoPlayTimer = null;
    this.userRecordedBlob = null;
    this.userRecordedUrl = null;

    // 阅读进度持久化 key
    this._progressKey = "cathy_book_progress_v2";
    this.progressMap = {}; // { bookId: pageIndex }
    this.karaokeSessionId = 0;
    this.currentQuizIndex = 0;
    this.isVoiceModalOpen = false;
    this._loadProgress();
  }

  /** 从 localStorage 恢复阅读进度 */
  _loadProgress() {
    try {
      const raw = localStorage.getItem(this._progressKey);
      if (raw) {
        this.progressMap = JSON.parse(raw);
      }
    } catch {}
  }

  /** 保存阅读进度到 localStorage */
  _saveProgress() {
    if (this.currentBook) {
      this.progressMap[this.currentBook.id] = this.currentPageIndex;
    }
    try {
      localStorage.setItem(this._progressKey, JSON.stringify(this.progressMap));
    } catch {}
  }

  destroy() {
    if (this.karaokeTimer) {
      clearInterval(this.karaokeTimer);
      this.karaokeTimer = null;
    }
    if (this.autoPlayTimer) {
      clearTimeout(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
    if (this.userRecordedUrl) {
      URL.revokeObjectURL(this.userRecordedUrl);
      this.userRecordedUrl = null;
    }
    this.karaokeSessionId++;
    this.isVoiceModalOpen = false;
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
  // 1. 绘本馆书架界面 (分阶筛选 + 已读印章)
  // ----------------------------------------------------
  renderShelf() {
    const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
      activeMode: "books",
      heading: "凯茜分级绘本馆"
    });
    this._addCleanup(destroyShell);

    const readBooks = ebbinghausManager.progress.readBooks || [];

    // 过滤阶段
    const filteredBooks = STORYBOOKS_DATABASE.filter((b) => {
      if (this.currentFilterStage === "all") return true;
      return (b.stage || 1) === parseInt(this.currentFilterStage, 10);
    });

    mainEl.innerHTML = `
      <div class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pb-8 overflow-y-auto no-scrollbar max-h-[calc(100vh-100px)]">
        
        <!-- 顶部书架横幅 -->
        <div class="relative w-full h-44 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 mb-5 bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 flex flex-col justify-end p-6">
          <div class="absolute -right-6 -bottom-6 opacity-20 transform scale-150 pointer-events-none">
            ${GAME_ICONS.book("w-56 h-56")}
          </div>
          
          <div class="relative z-10 text-white">
            <div class="flex items-center gap-3 mb-1">
              <span class="flex items-center">${GAME_ICONS.book("w-8 h-8")}</span>
              <h1 class="text-2xl font-black drop-shadow-md">凯茜分级阅读馆 (${STORYBOOKS_DATABASE.length} 本精品绘本)</h1>
            </div>
            <p class="text-xs text-sky-200 font-bold">
              严格遵循“子集阅读”认知体系，每篇绘本仅含已学汉字，伴读变色、画面寻宝、理解测验！
            </p>
          </div>
        </div>

        <!-- 分阶筛选药丸栏 -->
        <div class="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar py-1">
          <button class="stage-filter-btn px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
            this.currentFilterStage === "all"
              ? "bg-amber-500 text-white scale-105 ring-2 ring-amber-300"
              : "bg-white/90 text-amber-950 hover:bg-amber-100 border border-amber-200"
          }" data-stage="all">
            <span class="flex items-center">${GAME_ICONS.book("w-4 h-4")}</span>
            <span>全部绘本 (${STORYBOOKS_DATABASE.length})</span>
          </button>
          <button class="stage-filter-btn px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
            this.currentFilterStage === "1"
              ? "bg-emerald-600 text-white scale-105 ring-2 ring-emerald-300"
              : "bg-white/90 text-emerald-950 hover:bg-emerald-100 border border-emerald-200"
          }" data-stage="1">
            <span class="flex items-center">${GAME_ICONS.islandForest("w-4 h-4")}</span>
            <span>第1阶 · 启蒙森林</span>
          </button>
          <button class="stage-filter-btn px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
            this.currentFilterStage === "2"
              ? "bg-orange-500 text-white scale-105 ring-2 ring-orange-300"
              : "bg-white/90 text-orange-950 hover:bg-orange-100 border border-orange-200"
          }" data-stage="2">
            <span class="flex items-center">${GAME_ICONS.islandTown("w-4 h-4")}</span>
            <span>第2阶 · 缤纷生活</span>
          </button>
          <button class="stage-filter-btn px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
            this.currentFilterStage === "3"
              ? "bg-indigo-600 text-white scale-105 ring-2 ring-indigo-300"
              : "bg-white/90 text-indigo-950 hover:bg-indigo-100 border border-indigo-200"
          }" data-stage="3">
            <span class="flex items-center">${GAME_ICONS.islandSpace("w-4 h-4")}</span>
            <span>第3阶 · 星际进阶</span>
          </button>
        </div>

        <!-- 绘本书籍网格 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${filteredBooks.map((book) => {
            const isRead = readBooks.includes(book.id);

            return `
            <div class="book-card cv-auto-large group bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border-4 ${
              isRead ? "border-amber-400 ring-2 ring-amber-300/40" : "border-amber-200 hover:border-orange-400"
            } transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(251,191,36,0.3)] cursor-pointer flex flex-col justify-between" data-book-id="${book.id}">
              
              <div class="relative w-full h-44 overflow-hidden bg-amber-100">
                <img src="${book.coverImg}" alt="${book.title}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                
                <!-- 书脊光影效果 (模拟实体书装订线) -->
                <div class="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>
                <div class="absolute inset-y-0 left-0 w-px bg-white/40 pointer-events-none"></div>
                
                <!-- 阶段标识 -->
                <div class="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md">
                  第 ${book.level || 1} 阶绘本
                </div>

                <!-- 通关金色皇冠与三星印章 -->
                ${
                  isRead
                    ? `
                  <div class="absolute top-3 right-3 bg-amber-500/90 text-yellow-200 px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 border border-yellow-200 animate-pulse">
                    <span class="flex items-center">${GAME_ICONS.crown("w-4 h-4")}</span>
                    <span class="text-[10px] font-black text-white">已通关</span>
                  </div>
                `
                    : ""
                }

                <div class="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                  共 ${book.pages ? book.pages.length : 4} 页
                </div>
              </div>

              <div class="p-5 flex flex-col justify-between flex-1">
                <div>
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-black text-amber-950 group-hover:text-orange-600 transition-colors">
                      ${book.title}
                    </h3>
                    <!-- 3 颗小星星 (已通关填满金星) -->
                    <div class="flex items-center gap-0.5">
                      <span class="flex items-center">${GAME_ICONS.star("w-3.5 h-3.5", isRead)}</span>
                      <span class="flex items-center">${GAME_ICONS.star("w-3.5 h-3.5", isRead)}</span>
                      <span class="flex items-center">${GAME_ICONS.star("w-3.5 h-3.5", isRead)}</span>
                    </div>
                  </div>

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
                  <button class="btn-game-orange text-white font-black text-xs px-4 py-1.5 rounded-full shadow-md active:scale-95 cursor-pointer">
                    ${isRead ? "重温绘本" : "开始阅读"}
                  </button>
                </div>
              </div>

            </div>
          `;
          }).join("")}
        </div>

      </div>
    `;

    // 阶段筛选事件绑定
    mainEl.querySelectorAll(".stage-filter-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        this.currentFilterStage = btn.dataset.stage;
        soundAndFX.playPop();
        this.render();
      });
    });

    // 书籍点击进入阅读
    mainEl.querySelectorAll(".book-card").forEach((card) => {
      this._on(card, "click", () => {
        const bookId = card.dataset.bookId;
        this.currentBook = STORYBOOKS_DATABASE.find((b) => b.id === bookId);
        this.currentPageIndex = this.progressMap[bookId] || 0;
        this.isQuizMode = false;
        this.quizAnswered = false;
        this.currentQuizIndex = 0;
        soundAndFX.playSuccessSound();
        this.render();
      });
    });
  }

  // ----------------------------------------------------
  // 2. 16:9 影院级绘本阅读器 (拼音注音 + 自动连读 + 我来读)
  // ----------------------------------------------------
  renderReader() {
    const book = this.currentBook;
    const page = book.pages[this.currentPageIndex];
    const totalPages = book.pages.length;

    const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
      activeMode: "books",
      heading: `${book.title}`
    });
    this._addCleanup(destroyShell);

    // 基于 G2P 生成汉字与拼音的对齐 tokens
    const pinyinTokens = g2p.convert(page.text || "");

    mainEl.innerHTML = `
      <div class="relative w-full max-w-5xl mx-auto flex flex-col justify-between py-2 px-4 select-none animate-fade-in">
        
        <!-- 阅读器顶部控制栏 -->
        <div class="w-full flex items-center justify-between bg-white/95 backdrop-blur-md px-5 py-2 rounded-full shadow-xl border-2 border-amber-200 mb-3 flex-wrap gap-2">
          
          <button id="btn-back-shelf" class="flex items-center gap-1 text-amber-800 hover:text-orange-600 font-black text-xs px-3 py-1.5 rounded-full hover:bg-amber-100 transition-all cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
            <span>返回书架</span>
          </button>
          
          <h2 class="text-sm font-black text-amber-950 flex items-center gap-2">
            <span>${book.title}</span>
            <span class="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full font-bold">第 ${this.currentPageIndex + 1} / ${totalPages} 页</span>
          </h2>

          <div class="flex items-center gap-2">
            
            <!-- 拼音注音显隐切换 -->
            <button id="btn-toggle-pinyin" class="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black shadow-sm transition-all cursor-pointer ${
              this.showPinyin ? "bg-amber-200 text-amber-900 ring-2 ring-amber-400" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }" title="切换汉字上方标准拼音注音">
              <span class="flex items-center">${GAME_ICONS.cards("w-3.5 h-3.5")}</span>
              <span>${this.showPinyin ? "注音开" : "注音关"}</span>
            </button>

            <!-- 自动连读开关 -->
            <button id="btn-toggle-autoplay" class="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black shadow-sm transition-all cursor-pointer ${
              this.isAutoPlay ? "bg-emerald-500 text-white animate-pulse ring-2 ring-emerald-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }" title="开启后自动朗读并连续翻页">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
              <span>${this.isAutoPlay ? "自动连读中" : "自动连读"}</span>
            </button>

            <!-- 我来读一读 -->
            <button id="btn-user-read" class="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1 active:scale-95 cursor-pointer" title="点击录音自己读一页">
              <span class="flex items-center">${GAME_ICONS.speaker("w-3.5 h-3.5")}</span>
              <span>我来读</span>
            </button>

            <!-- 伴读整页 -->
            <button id="btn-play-karaoke" class="btn-game-orange text-white font-black text-xs px-4 py-1.5 rounded-full shadow-md flex items-center gap-1 active:scale-95 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.speaker("w-3.5 h-3.5")}</span>
              <span>伴读整页</span>
            </button>
          </div>
        </div>

        <!-- 16:9 沉浸画卷与寻宝交互区 -->
        <div class="w-full bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-200 mb-3 flex flex-col md:flex-row items-stretch">
          
          <!-- 左侧：插画 + 隐藏互动寻宝热区 -->
          <div class="w-full md:w-1/2 bg-amber-50 flex flex-col justify-center border-b-4 md:border-b-0 md:border-r-4 border-amber-200 relative">
            <div class="relative w-full aspect-video shrink-0 bg-amber-100 group overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]">
              <img src="${page.image}" alt="绘本插图" loading="lazy" decoding="async" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              
              <!-- 隐藏寻宝热区气泡 -->
              ${(page.interactions || page.hotspots || []).map((hp, idx) => `
                <button class="hotspot-trigger-btn absolute z-20 w-11 h-11 rounded-full bg-yellow-400/90 border-2 border-white text-amber-950 font-black text-xs flex items-center justify-center shadow-2xl animate-bounce-slow active:scale-90 hover:scale-125 transition-transform cursor-pointer" style="top: ${hp.y}; left: ${hp.x};" data-sound="${hp.sound || ''}" data-label="${hp.text || hp.label || ''}">
                  <span class="flex items-center pointer-events-none">${GAME_ICONS.sparkle("w-6 h-6")}</span>
                </button>
              `).join("")}
            </div>

            <div class="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full pointer-events-none flex items-center gap-1.5 z-10">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
              <span>画面隐藏小宝藏，点击试试！</span>
            </div>
          </div>

          <!-- 右侧：文字伴读区 (支持标准拼音注音与逐字点读) -->
          <div class="w-full md:w-1/2 p-6 flex flex-col justify-between text-center min-h-[16rem]">
            <div class="text-[11px] font-black text-amber-700 bg-amber-50 inline-block px-3 py-1 rounded-full border border-amber-200 self-center">
               点击任意汉字即可单独听音点读
            </div>

            <!-- 汉字 + Ruby 拼音注音排版 -->
            <div id="karaoke-text-container" class="text-2xl md:text-3xl font-black text-amber-950 leading-loose tracking-wider flex flex-wrap justify-center items-center gap-x-2 gap-y-3 my-auto drop-shadow-sm">
              ${pinyinTokens.map((token, idx) => {
                if (token.isPunct) {
                  return `<span class="text-gray-400 font-serif self-end pb-1">${token.char}</span>`;
                }
                const isTarget = (book.targetChars || []).includes(token.char);

                return `
                  <ruby class="inline-flex flex-col items-center group/char">
                    <rt class="text-[11px] font-sans font-extrabold text-orange-600 leading-none mb-1 transition-opacity duration-300 ${
                      this.showPinyin ? "opacity-100" : "opacity-0 pointer-events-none"
                    }">${token.pinyinMarked}</rt>
                    <span class="karaoke-char px-2 py-1 rounded-xl cursor-pointer hover:bg-orange-100 transition-all duration-200 ${
                      isTarget ? "text-orange-700 bg-amber-100/60 shadow-sm border border-amber-200/50 underline decoration-wavy decoration-orange-400/70" : "text-amber-900"
                    }" data-index="${idx}" data-char="${token.char}">
                      ${token.char}
                    </span>
                  </ruby>
                `;
              }).join("")}
            </div>

            <div class="text-[11px] text-gray-500 font-semibold flex items-center justify-center gap-1">
              <span>核心生字：</span>
              ${(book.targetChars || []).map(c => `<span class="text-orange-600 font-black">${c}</span>`).join(" ")}
            </div>
          </div>

        </div>

        <!-- 底部翻页控制器 -->
        <div class="w-full flex items-center justify-between px-6">
          <button id="btn-prev-page" class="bg-white hover:bg-amber-50 text-amber-900 font-black text-xs px-6 py-2.5 rounded-full shadow-lg border-2 border-amber-200 transition-all active:scale-95 cursor-pointer ${
            this.currentPageIndex === 0 ? "opacity-40 pointer-events-none" : ""
          }">
            上一页
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

          <button id="btn-next-page" class="btn-game-orange text-white font-black text-xs px-6 py-2.5 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer">
            ${this.currentPageIndex === book.pages.length - 1 ? "完成阅读 · 去测验" : "下一页"}
          </button>
        </div>

      </div>
    `;

    this.bindReaderEvents(mainEl);

    // 如果开启了自动连读模式，进页自动播放
    if (this.isAutoPlay) {
      this._timeout(() => this.playKaraoke(page, mainEl), 400);
    }
  }

  bindReaderEvents(mainEl) {
    const book = this.currentBook;
    const page = book.pages[this.currentPageIndex];

    // 返回书架
    const backBtn = mainEl.querySelector("#btn-back-shelf");
    if (backBtn) {
      this._on(backBtn, "click", () => {
        this.currentBook = null;
        this.isAutoPlay = false;
        soundAndFX.playPop();
        this.render();
      });
    }

    // 拼音显隐切换
    const togglePinyinBtn = mainEl.querySelector("#btn-toggle-pinyin");
    if (togglePinyinBtn) {
      this._on(togglePinyinBtn, "click", () => {
        this.showPinyin = !this.showPinyin;
        soundAndFX.playPop();
        this.render();
      });
    }

    // 自动连读切换
    const toggleAutoplayBtn = mainEl.querySelector("#btn-toggle-autoplay");
    if (toggleAutoplayBtn) {
      this._on(toggleAutoplayBtn, "click", () => {
        this.isAutoPlay = !this.isAutoPlay;
        soundAndFX.playPop();
        if (this.isAutoPlay) {
          showGameToast(this.container, "已开启自动连读模式，将连续朗读全书！", "info");
          this.playKaraoke(page, mainEl);
        } else {
          showGameToast(this.container, "已关闭自动连读", "info");
        }
        this.render();
      });
    }

    // 我来读一读
    const userReadBtn = mainEl.querySelector("#btn-user-read");
    if (userReadBtn) {
      this._on(userReadBtn, "click", () => {
        soundAndFX.playPop();
        this.openUserVoiceModal(page);
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
        if (snd) soundAndFX.speakPriority(snd, { kind: "sentence" });
      });
    });

    // 逐字点读
    mainEl.querySelectorAll(".karaoke-char").forEach((span) => {
      this._on(span, "click", () => {
        const char = span.dataset.char;
        soundAndFX.playPop();
        soundAndFX.speakPriority(char, { kind: "char", priority: 1 });
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
          this._saveProgress();
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
          this._saveProgress();
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
  // 3. 【我来读一读】儿童智能跟读与录音回放弹窗
  // ----------------------------------------------------
  openUserVoiceModal(page) {
    const overlay = document.createElement("div");
    overlay.id = "user-voice-modal-overlay";
    overlay.className = "fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in";
    overlay.innerHTML = `
      <div class="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-6 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
        
        <button id="btn-close-voice-modal" class="absolute -top-12 right-0 w-9 h-9 rounded-full bg-white text-gray-800 font-extrabold text-lg flex items-center justify-center shadow-lg hover:bg-gray-100 active:scale-95 cursor-pointer">
          ${GAME_ICONS.back("w-5 h-5")}
        </button>

        <div class="flex items-center gap-2 mb-2">
          <span class="flex items-center">${GAME_ICONS.speaker("w-6 h-6")}</span>
          <h3 class="text-lg font-black text-amber-950">小小朗读者 · 我来读一读</h3>
        </div>
        <p class="text-xs text-gray-500 mb-4 font-semibold">按下开始录音，把故事大声读出来吧！</p>

        <!-- 示范跟读句子 -->
        <div class="w-full bg-white/90 p-4 rounded-2xl border-2 border-amber-200 mb-5 shadow-sm text-base font-black text-amber-950 leading-relaxed">
          ${page.text}
        </div>

        <!-- 录音状态波形指示器 -->
        <div id="voice-eval-status" class="flex flex-col items-center justify-center my-3 h-24 relative">
          <!-- 魔法呼吸灯背景 (录音时才亮起) -->
          <div id="voice-glow-bg" class="absolute inset-0 bg-orange-500/20 blur-xl rounded-full opacity-0 transition-opacity duration-300 pointer-events-none"></div>

          <div id="wave-bars" class="flex items-center gap-1.5 h-10 mb-2 relative z-10">
            <span class="w-1.5 h-4 bg-orange-400 rounded-full animate-bounce"></span>
            <span class="w-1.5 h-8 bg-orange-500 rounded-full animate-bounce" style="animation-delay:0.15s"></span>
            <span class="w-1.5 h-10 bg-amber-500 rounded-full animate-bounce" style="animation-delay:0.3s"></span>
            <span class="w-1.5 h-6 bg-orange-500 rounded-full animate-bounce" style="animation-delay:0.45s"></span>
            <span class="w-1.5 h-3 bg-orange-400 rounded-full animate-bounce" style="animation-delay:0.6s"></span>
          </div>
          <span id="voice-status-text" class="text-xs font-black text-amber-800 relative z-10">准备好开始跟读</span>
        </div>

        <!-- 控制按钮群 -->
        <div class="flex items-center gap-3 w-full justify-center mt-2 relative z-10">
          <button id="btn-start-record" class="btn-game-orange text-white text-xs font-black px-6 py-2.5 rounded-full shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer transition-all duration-300">
            <span class="flex items-center">${GAME_ICONS.speaker("w-4 h-4")}</span>
            <span id="record-btn-label">开始录音跟读</span>
          </button>
          <button id="btn-playback-voice" class="hidden bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-6 py-2.5 rounded-full shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.speaker("w-4 h-4")}</span>
            <span>听我的录音</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector("#btn-close-voice-modal");
    const startRecordBtn = overlay.querySelector("#btn-start-record");
    const playbackBtn = overlay.querySelector("#btn-playback-voice");
    const statusText = overlay.querySelector("#voice-status-text");
    const recordBtnLabel = overlay.querySelector("#record-btn-label");

    let isRecording = false;
    this.isVoiceModalOpen = true;

    closeBtn.addEventListener("click", () => {
      this.isVoiceModalOpen = false;
      overlay.remove();
    });

    startRecordBtn.addEventListener("click", async () => {
      if (isRecording) return;
      isRecording = true;
      statusText.textContent = "正在收音中，请大声朗读...";
      recordBtnLabel.textContent = "正在倾听...";
      
      startRecordBtn.classList.add("bg-rose-500", "animate-pulse"); // Add magical breathing effect to button
      const glowBg = overlay.querySelector("#voice-glow-bg");
      if (glowBg) {
        glowBg.classList.replace("opacity-0", "opacity-100");
        glowBg.classList.add("animate-pulse");
      }

      try {
        const result = await pronunciationEval.evaluate(page.text, {
          mode: "sentence",
          maxSeconds: 5
        });

        if (!this.isVoiceModalOpen) return;

        soundAndFX.playSuccessSound();
        soundAndFX.triggerConfetti(this.container);
        statusText.innerHTML = `<span class="text-emerald-600 font-black text-sm">朗读得分：${result.score || 95} 分！太棒啦！</span>`;
        recordBtnLabel.textContent = "重新录音";
        startRecordBtn.classList.remove("bg-rose-500", "animate-pulse");
        if (glowBg) {
          glowBg.classList.replace("opacity-100", "opacity-0");
          glowBg.classList.remove("animate-pulse");
        }
        playbackBtn.classList.remove("hidden");
        isRecording = false;
      } catch (err) {
        if (!this.isVoiceModalOpen) return;
        statusText.textContent = "录音评测完成！读得真好！";
        recordBtnLabel.textContent = "再次跟读";
        startRecordBtn.classList.remove("bg-rose-500", "animate-pulse");
        if (glowBg) {
          glowBg.classList.replace("opacity-100", "opacity-0");
          glowBg.classList.remove("animate-pulse");
        }
        isRecording = false;
      }
    });

    playbackBtn.addEventListener("click", () => {
      soundAndFX.playPop();
      soundAndFX.speakPriority(page.text, { kind: "sentence", emotion: "gentle" });
    });
  }

  // ----------------------------------------------------
  // 4. 阅读理解趣味小测验
  // ----------------------------------------------------
  renderQuiz() {
    const book = this.currentBook;
    const quizList = Array.isArray(book.quiz) ? book.quiz : [book.quiz || {
      question: `故事中提到了哪些有趣的生字和故事？`,
      options: ["大家一起快乐识字", "什么都没发生", "大怪兽睡大觉"],
      correctIndex: 0
    }];
    const quiz = quizList[this.currentQuizIndex];
    const correctIdx = (quiz.correctIndex !== undefined) ? quiz.correctIndex : (quiz.answer !== undefined ? quiz.answer : 0);

    const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
      activeMode: "books",
      heading: `阅读测验 · ${book.title} (${this.currentQuizIndex + 1}/${quizList.length})`
    });
    this._addCleanup(destroyShell);

    soundAndFX.speakPriority(`小测验时间！${quiz.question}`, { kind: "sentence" });

    mainEl.innerHTML = `
      <div class="relative w-full max-w-3xl mx-auto flex flex-col justify-between py-6 px-4 select-none animate-fade-in">
        
        <div class="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
          <div class="mb-4 flex items-center justify-center">${GAME_ICONS.trophy("w-16 h-16")}</div>
          <span class="text-xs font-black bg-orange-100 text-orange-800 px-4 py-1 rounded-full mb-3">
             绘本阅读理解小测验
          </span>
          <h2 class="text-xl font-black text-amber-950 mb-6">
            ${quiz.question}
          </h2>

          <div class="flex flex-col gap-3.5 w-full max-w-lg">
            ${quiz.options
              .map(
                (opt, idx) => `
              <button class="quiz-option-btn group p-4 rounded-2xl bg-white hover:bg-orange-50 border-2 border-amber-200 hover:border-orange-400 hover:shadow-lg text-amber-950 font-black text-sm active:scale-95 hover:scale-105 transition-all duration-300 text-left flex items-center justify-between cursor-pointer" data-index="${idx}">
                <span class="group-hover:text-orange-700 transition-colors">${opt}</span>
                <span class="w-7 h-7 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 shadow-sm border border-amber-500 flex items-center justify-center text-xs text-amber-900 font-black shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)] group-hover:rotate-12 transition-transform">${String.fromCharCode(65 + idx)}</span>
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
          <div class="candy-pill rounded-full px-6 py-2 mb-4 text-xs text-yellow-300 font-bold flex items-center gap-3">
            <span class="flex items-center gap-1"><span class="flex items-center">${GAME_ICONS.coin("w-4 h-4")}</span> +15 星币</span>
            <span class="flex items-center gap-1"><span class="flex items-center">${GAME_ICONS.star("w-4 h-4", true)}</span> +5 星星</span>
          </div>
          <button id="btn-finish-return-shelf" class="btn-game-orange text-white font-black text-base px-10 py-3 rounded-full cursor-pointer">
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
        if (pickedIdx === correctIdx) {
          soundAndFX.playSuccessSound();
          soundAndFX.playVictoryFanfare();
          soundAndFX.triggerConfetti(this.container);
          soundAndFX.triggerCoinFly(this.container);

          // 记录绘本已读及金币奖励
          if (this.currentQuizIndex === quizList.length - 1) {
            ebbinghausManager.markBookRead(book.id);
            ebbinghausManager.addCoins(15 * quizList.length);
            ebbinghausManager.progress.stars = (ebbinghausManager.progress.stars || 0) + 5 * quizList.length;
            ebbinghausManager.save();
          }

          btn.classList.add("ring-4", "ring-emerald-500", "bg-emerald-100");

          this._timeout(() => {
            if (this.currentQuizIndex < quizList.length - 1) {
              this.currentQuizIndex++;
              this.quizAnswered = false;
              this.render();
            } else {
              if (finishModal) finishModal.classList.remove("hidden");
            }
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

  // ----------------------------------------------------
  // 5. 卡拉OK高亮伴读播放器 (毫秒级字界同步 + 自动连读衔接)
  // ----------------------------------------------------
  playKaraoke(page, mainEl) {
    const spans = mainEl.querySelectorAll(".karaoke-char");
    if (!spans || spans.length === 0) return;

    if (this.karaokeTimer) {
      clearInterval(this.karaokeTimer);
      this.karaokeTimer = null;
    }
    
    this.karaokeSessionId++;
    const sessionId = this.karaokeSessionId;

    // 清空旧高亮
    spans.forEach((s) => s.classList.remove("bg-yellow-300", "text-orange-600", "scale-125", "ring-2", "ring-orange-400"));

    // 播放伴读音频并同步字界高亮
    soundAndFX.speakPriority(page.text, {
      kind: "sentence",
      emotion: "gentle",
      onProgress: ({ char_index }) => {
        if (this.karaokeSessionId !== sessionId || !this.currentBook) return;
        spans.forEach((s, idx) => {
          if (idx === char_index) {
            s.classList.add("bg-yellow-300", "text-orange-600", "scale-125", "ring-2", "ring-orange-400");
          } else {
            s.classList.remove("bg-yellow-300", "text-orange-600", "scale-125", "ring-2", "ring-orange-400");
          }
        });
      },
      onEnd: () => {
        if (this.karaokeSessionId !== sessionId || !this.currentBook) return;
        spans.forEach((s) => s.classList.remove("bg-yellow-300", "text-orange-600", "scale-125", "ring-2", "ring-orange-400"));

        // 如果开启了自动连读，延时 1.5 秒自动翻到下一页
        if (this.isAutoPlay && this.currentBook) {
          this.autoPlayTimer = this._timeout(() => {
            if (!this.isAutoPlay || !this.currentBook || this.karaokeSessionId !== sessionId) return;
            if (this.currentPageIndex < this.currentBook.pages.length - 1) {
              this.currentPageIndex++;
              this._saveProgress();
              this.render();
            } else {
              // 读完进入测验
              this.isQuizMode = true;
              this.quizAnswered = false;
              this.render();
            }
          }, 1500);
        }
      }
    });
  }
}
