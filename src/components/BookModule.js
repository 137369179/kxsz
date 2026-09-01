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
      <div class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pt-16 sm:pt-20 px-4 pb-12 overflow-y-auto no-scrollbar max-h-[calc(100vh-60px)]">
        
        <!-- 顶部精美标题与进度卡 -->
        <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-amber-400 shadow-md flex items-center justify-center border-2 border-white flex-shrink-0">
              <span class="flex items-center">${GAME_ICONS.book("w-7 h-7")}</span>
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl font-black text-amber-950 flex items-center gap-2">
                <span>魔法绘本馆</span>
                <span class="text-xs bg-orange-500 text-white font-bold px-2.5 py-0.5 rounded-full shadow-sm">${STORYBOOKS_DATABASE.length} 册精选</span>
              </h1>
              <p class="text-xs text-amber-800/80 font-bold mt-0.5">严格子集阅读 · 伴读变色 · 探索寻宝</p>
            </div>
          </div>

          <!-- 学习成就小胶囊 -->
          <div class="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-200 shadow-sm">
            <span class="text-xs text-amber-900/70 font-bold">已读进度:</span>
            <span class="text-xs font-black text-orange-600">${readBooks.length} / ${STORYBOOKS_DATABASE.length} 本</span>
            <span class="text-amber-300">|</span>
            <span class="flex items-center gap-1 text-xs font-black text-amber-900">
              <span class="flex items-center">${GAME_ICONS.star("w-4 h-4", false)}</span>
              <span>${readBooks.length * 3} 星</span>
            </span>
          </div>
        </div>

        <!-- 阶段切换药丸栏 -->
        <div class="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar py-1">
          ${[
            { key: "all", label: "全部绘本", count: STORYBOOKS_DATABASE.length },
            { key: "1", label: "第1阶 · 启蒙森林", count: STORYBOOKS_DATABASE.filter((b) => (b.stage || 1) === 1).length },
            { key: "2", label: "第2阶 · 缤纷生活", count: STORYBOOKS_DATABASE.filter((b) => (b.stage || 1) === 2).length },
            { key: "3", label: "第3阶 · 星际进阶", count: STORYBOOKS_DATABASE.filter((b) => (b.stage || 1) === 3).length }
          ]
            .map(
              (tab) => `
            <button class="stage-filter-btn px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 active:scale-95 ${
              this.currentFilterStage === tab.key
                ? "bg-amber-500 text-white shadow-md ring-2 ring-amber-300 scale-105"
                : "bg-white/80 text-amber-950 hover:bg-white border border-amber-200 shadow-sm"
            }" data-stage="${tab.key}">
              <span>${tab.label}</span>
              <span class="text-[10px] opacity-75">(${tab.count})</span>
            </button>
          `
            )
            .join("")}
        </div>

        <!-- 绘本书籍网格 -->
        ${
          filteredBooks.length === 0
            ? `
          <div class="w-full bg-white/80 backdrop-blur-md rounded-3xl p-12 text-center border-2 border-amber-200 shadow-md my-4">
            <div class="w-16 h-16 mx-auto mb-3 opacity-60 flex items-center justify-center">${GAME_ICONS.book("w-16 h-16")}</div>
            <p class="text-sm font-black text-amber-900">该分阶下暂无绘本</p>
          </div>
        `
            : `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          ${filteredBooks
            .map((book) => {
              const isRead = readBooks.includes(book.id);

              return `
            <div class="book-card group bg-white rounded-3xl overflow-hidden shadow-lg border-4 ${
              isRead ? "border-amber-400 ring-2 ring-amber-300/40" : "border-amber-200/80 hover:border-orange-400"
            } transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer flex flex-col justify-between" data-book-id="${book.id}">
              
              <!-- 封面图 -->
              <div class="relative w-full h-44 overflow-hidden bg-amber-100">
                <img src="${book.coverImg}" alt="${book.title}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                <!-- 阶梯标签 -->
                <div class="absolute top-2.5 left-2.5 bg-black/50 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-white/20">
                  第 ${book.level || 1} 阶
                </div>

                <!-- 通关小皇冠印章 -->
                ${
                  isRead
                    ? `
                  <div class="absolute top-2.5 right-2.5 bg-amber-500 text-white px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-yellow-200 text-[10px] font-black">
                    <span class="flex items-center">${GAME_ICONS.crown("w-3.5 h-3.5")}</span>
                    <span>已通关</span>
                  </div>
                `
                    : ""
                }
              </div>

              <!-- 卡片信息区 -->
              <div class="p-4 flex flex-col justify-between flex-1 bg-white">
                <div>
                  <div class="flex items-center justify-between">
                    <h3 class="text-base font-black text-amber-950 group-hover:text-orange-600 transition-colors">
                      ${book.title}
                    </h3>
                    <!-- 3 颗小星星 -->
                    <div class="flex items-center gap-0.5">
                      <span class="flex items-center">${GAME_ICONS.star("w-4 h-4", !isRead)}</span>
                      <span class="flex items-center">${GAME_ICONS.star("w-4 h-4", !isRead)}</span>
                      <span class="flex items-center">${GAME_ICONS.star("w-4 h-4", !isRead)}</span>
                    </div>
                  </div>

                  <p class="text-xs text-gray-500 mt-1 line-clamp-1 font-semibold">
                    ${book.desc}
                  </p>
                </div>

                <div class="mt-3 pt-2.5 border-t border-amber-100 flex items-center justify-between">
                  <div class="flex items-center gap-1 overflow-hidden">
                    <span class="text-[11px] text-amber-800/70 font-bold shrink-0">生字:</span>
                    ${(book.targetChars || ["日", "月", "山"]).slice(0, 4).map(c => `
                      <span class="bg-amber-100/70 text-orange-800 text-[11px] font-black px-1.5 py-0.5 rounded-md">${c}</span>
                    `).join("")}
                  </div>
                  
                  <button class="btn-game-orange text-white font-black text-xs px-4 py-1.5 rounded-full shadow-md active:scale-95 transition-transform cursor-pointer shrink-0">
                    ${isRead ? "重温" : "阅读"}
                  </button>
                </div>
              </div>

            </div>
          `;
            })
            .join("")}
        </div>
        `
        }

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
      <div class="relative w-full max-w-5xl mx-auto flex flex-col justify-between pt-16 sm:pt-20 pb-6 px-4 select-none animate-fade-in">
        
        <!-- 阅读器顶部控制栏 (Sleek Glass Toolbar) -->
        <div class="w-full flex items-center justify-between bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border-2 border-amber-200/90 mb-3 flex-wrap gap-2">
          
          <button id="btn-back-shelf" class="flex items-center gap-1.5 text-amber-900 hover:text-orange-600 font-black text-xs px-3.5 py-1.5 rounded-full hover:bg-amber-100 transition-all cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
            <span>返回书架</span>
          </button>
          
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-black text-amber-950">${book.title}</h2>
            <span class="text-xs text-orange-700 bg-orange-100/90 px-2.5 py-0.5 rounded-full font-black border border-orange-200">
              ${this.currentPageIndex + 1} / ${totalPages} 页
            </span>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            
            <!-- 拼音注音显隐切换 -->
            <button id="btn-toggle-pinyin" class="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black shadow-sm transition-all cursor-pointer ${
              this.showPinyin ? "bg-amber-400 text-amber-950 font-black ring-2 ring-amber-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
            }" title="切换汉字上方标准拼音注音">
              <span class="flex items-center">${GAME_ICONS.cards("w-3.5 h-3.5")}</span>
              <span>${this.showPinyin ? "拼音: 开" : "拼音: 关"}</span>
            </button>

            <!-- 自动连读开关 -->
            <button id="btn-toggle-autoplay" class="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black shadow-sm transition-all cursor-pointer ${
              this.isAutoPlay ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white animate-pulse ring-2 ring-emerald-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
            }" title="开启后自动朗读并连续翻页">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
              <span>${this.isAutoPlay ? "自动连读中" : "自动连读"}</span>
            </button>

            <!-- 我来读一读 -->
            <button id="btn-user-read" class="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1 active:scale-95 cursor-pointer hover:brightness-110" title="点击录音自己读一页">
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

        <!-- 16:9 沉浸式绘本画卷对开本 (Picture Book Spread) -->
        <div class="w-full bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300/90 mb-4 flex flex-col md:flex-row items-stretch min-h-[380px]">
          
          <!-- 左页：插画 + 隐藏互动寻宝热区 -->
          <div class="w-full md:w-1/2 bg-amber-50/40 flex flex-col justify-center border-b-4 md:border-b-0 md:border-r-2 border-amber-200/80 relative shadow-[inset_-6px_0_12px_rgba(0,0,0,0.03)]">
            <div class="relative w-full aspect-video md:aspect-auto md:h-full min-h-[240px] bg-amber-100/50 group overflow-hidden flex items-center justify-center">
              <img src="${page.image}" alt="绘本插图" loading="lazy" decoding="async" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              
              <!-- 隐藏寻宝热区气泡 -->
              ${(page.interactions || page.hotspots || []).map((hp, idx) => `
                <button class="hotspot-trigger-btn absolute z-20 w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white text-amber-950 font-black text-xs flex items-center justify-center shadow-xl animate-bounce-slow active:scale-90 hover:scale-125 transition-transform cursor-pointer" style="top: ${hp.y}; left: ${hp.x};" data-sound="${hp.sound || ''}" data-label="${hp.text || hp.label || ''}">
                  <span class="flex items-center pointer-events-none">${GAME_ICONS.sparkle("w-6 h-6")}</span>
                </button>
              `).join("")}
            </div>

            <div class="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full pointer-events-none flex items-center gap-1.5 z-10 border border-white/20">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
              <span>画面隐藏宝藏，点击试试！</span>
            </div>
          </div>

          <!-- 右页：纯美故事文字排版 (儿童绘本大字标准) -->
          <div class="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between text-center bg-gradient-to-br from-[#FFFDF9] to-[#FFF9EE]">
            
            <!-- 顶部小提示 -->
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-black text-amber-800/80 bg-amber-100/80 px-3 py-0.5 rounded-full border border-amber-200/80 shadow-sm">
                点读伴读 · 点击单字发音
              </span>
              <span class="text-[11px] font-bold text-orange-600 bg-orange-100/60 px-2.5 py-0.5 rounded-full">
                第 ${this.currentPageIndex + 1} 页
              </span>
            </div>

            <!-- 核心排版：汉字 + 拼音精准居中对齐 -->
            <div id="karaoke-text-container" class="flex flex-wrap justify-center items-end gap-x-1.5 sm:gap-x-2 gap-y-3 my-auto py-4">
              ${pinyinTokens.map((token, idx) => {
                if (token.isPunct) {
                  return `
                    <div class="inline-flex flex-col items-center justify-end mx-0.5 pb-1 align-bottom">
                      <span class="h-4 sm:h-5"></span>
                      <span class="text-3xl sm:text-4xl md:text-5xl font-serif text-amber-900/60">${token.char}</span>
                    </div>
                  `;
                }
                const isTarget = (book.targetChars || []).includes(token.char);

                return `
                  <div class="inline-flex flex-col items-center justify-end mx-1 align-bottom group/char select-none">
                    <span class="text-[12px] sm:text-[14px] font-black text-orange-600 tracking-normal h-4 sm:h-5 flex items-center justify-center transition-all duration-200 ${
                      this.showPinyin ? "opacity-100" : "opacity-0"
                    }">${token.pinyinMarked}</span>
                    <span class="karaoke-char text-3xl sm:text-4xl md:text-5xl font-black px-2 sm:px-2.5 py-1 rounded-2xl cursor-pointer hover:bg-orange-100 hover:scale-110 active:scale-95 transition-all duration-200 ${
                      isTarget
                        ? "text-orange-800 bg-amber-100/90 font-black shadow-sm border border-amber-300/80"
                        : "text-amber-950"
                    }" data-index="${idx}" data-char="${token.char}">
                      ${token.char}
                    </span>
                  </div>
                `;
              }).join("")}
            </div>

            <!-- 底部核心生字点读栏 -->
            <div class="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-xs font-black text-amber-800/80 flex items-center gap-1">
                  <span class="flex items-center">${GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
                  <span>核心字:</span>
                </span>
                ${(book.targetChars || []).map(c => `
                  <button class="target-char-pill bg-amber-100 hover:bg-orange-500 hover:text-white text-orange-800 font-black text-xs px-2.5 py-0.5 rounded-xl border border-amber-300/80 shadow-sm transition-all active:scale-90 cursor-pointer" data-char="${c}">
                    ${c}
                  </button>
                `).join("")}
              </div>

              <span class="text-[10px] text-amber-700/60 font-bold hidden sm:inline">
                支持键盘 ← → 翻页
              </span>
            </div>

          </div>

        </div>

        <!-- 底部翻页控制器 -->
        <div class="w-full flex items-center justify-between px-2 sm:px-6">
          <button id="btn-prev-page" class="bg-white hover:bg-amber-50 text-amber-900 font-black text-xs px-6 py-2.5 rounded-full shadow-lg border-2 border-amber-200 transition-all active:scale-95 cursor-pointer ${
            this.currentPageIndex === 0 ? "opacity-40 pointer-events-none" : ""
          }">
            上一页
          </button>

          <!-- 进度小药丸指示器 -->
          <div class="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-200 shadow-sm">
            ${book.pages
              .map(
                (_, idx) => `
              <div class="transition-all ${idx === this.currentPageIndex ? "w-6 h-2.5 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full shadow-sm" : "w-2.5 h-2.5 bg-amber-200 rounded-full"}"></div>
            `
              )
              .join("")}
          </div>

          <button id="btn-next-page" class="btn-game-orange text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer">
            ${this.currentPageIndex === book.pages.length - 1 ? "完成阅读 · 去测验 " : "下一页"}
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
        span.classList.add("bg-amber-300", "scale-110", "ring-4", "ring-amber-200");
        this._timeout(() => span.classList.remove("bg-amber-300", "scale-110", "ring-4", "ring-amber-200"), 450);
      });
    });

    // 核心生字点读胶囊
    mainEl.querySelectorAll(".target-char-pill").forEach((btn) => {
      this._on(btn, "click", (e) => {
        e.stopPropagation();
        const char = btn.dataset.char;
        soundAndFX.playPop();
        soundAndFX.speakPriority(char, { kind: "char", priority: 1 });
        btn.classList.add("scale-110", "bg-orange-500", "text-white");
        this._timeout(() => btn.classList.remove("scale-110", "bg-orange-500", "text-white"), 400);
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

    // 键盘快捷键支持 (左/右键翻页，空格伴读)
    const onKey = (e) => {
      if (this.isVoiceModalOpen || this.isQuizMode) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        if (this.currentPageIndex < book.pages.length - 1) {
          this.currentPageIndex++;
          this._saveProgress();
          soundAndFX.playPop();
          this.render();
        } else {
          soundAndFX.playSuccessSound();
          this.isQuizMode = true;
          this.quizAnswered = false;
          this.render();
        }
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        if (this.currentPageIndex > 0) {
          this.currentPageIndex--;
          this._saveProgress();
          soundAndFX.playPop();
          this.render();
        }
      } else if (e.key === " " && !e.target.matches("input, textarea")) {
        e.preventDefault();
        this.playKaraoke(page, mainEl);
      }
    };
    window.addEventListener("keydown", onKey);
    this._addCleanup(() => window.removeEventListener("keydown", onKey));
  }

  // ----------------------------------------------------
  // 3. 【我来读一读】儿童智能跟读与录音回放弹窗
  // ----------------------------------------------------
  openUserVoiceModal(page) {
    const overlay = document.createElement("div");
    overlay.id = "user-voice-modal-overlay";
    overlay.className = "fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in";
    overlay.innerHTML = `
      <div class="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
        
        <button id="btn-close-voice-modal" class="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white text-gray-800 font-extrabold text-base flex items-center justify-center shadow-xl hover:bg-gray-100 active:scale-95 cursor-pointer border-2 border-amber-200">
          <span class="font-sans font-bold text-base leading-none">X</span>
        </button>

        <div class="flex items-center gap-2 mb-2">
          <span class="flex items-center">${GAME_ICONS.speaker("w-7 h-7")}</span>
          <h3 class="text-xl font-black text-amber-950">小小朗读者 · 我来读一读</h3>
        </div>
        <p class="text-xs text-amber-800/70 mb-4 font-bold">按下开始录音，把故事大声读出来吧！</p>

        <!-- 示范跟读句子 -->
        <div class="w-full bg-white/95 p-4 rounded-2xl border-2 border-amber-200 mb-5 shadow-md text-lg font-black text-amber-950 leading-relaxed">
          ${page.text}
        </div>

        <!-- 录音状态波形指示器 -->
        <div id="voice-eval-status" class="flex flex-col items-center justify-center my-3 h-24 relative">
          <!-- 魔法呼吸灯背景 (录音时才亮起) -->
          <div id="voice-glow-bg" class="absolute inset-0 bg-orange-500/20 blur-xl rounded-full opacity-0 transition-opacity duration-300 pointer-events-none"></div>

          <div id="wave-bars" class="flex items-center gap-1.5 h-10 mb-2 relative z-10">
            <span class="w-2 h-5 bg-orange-400 rounded-full animate-bounce"></span>
            <span class="w-2 h-9 bg-orange-500 rounded-full animate-bounce" style="animation-delay:0.15s"></span>
            <span class="w-2 h-11 bg-amber-500 rounded-full animate-bounce" style="animation-delay:0.3s"></span>
            <span class="w-2 h-7 bg-orange-500 rounded-full animate-bounce" style="animation-delay:0.45s"></span>
            <span class="w-2 h-4 bg-orange-400 rounded-full animate-bounce" style="animation-delay:0.6s"></span>
          </div>
          <span id="voice-status-text" class="text-xs font-black text-amber-800 relative z-10">准备好开始跟读</span>
        </div>

        <!-- 控制按钮群 -->
        <div class="flex items-center gap-3 w-full justify-center mt-3 relative z-10">
          <button id="btn-start-record" class="btn-game-orange text-white text-xs font-black px-6 py-2.5 rounded-full shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer transition-all duration-300">
            <span class="flex items-center">${GAME_ICONS.speaker("w-4 h-4")}</span>
            <span id="record-btn-label">开始录音跟读</span>
          </button>
          <button id="btn-playback-voice" class="hidden btn-game-green text-white text-xs font-black px-6 py-2.5 rounded-full shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer">
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
      
      startRecordBtn.classList.add("bg-rose-500", "animate-pulse");
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
      <div class="relative w-full max-w-3xl mx-auto flex flex-col justify-between pt-16 sm:pt-20 pb-8 px-4 select-none animate-fade-in">
        
        <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
          <div class="mb-3 flex items-center justify-center transform hover:scale-110 transition-transform">
            ${GAME_ICONS.trophy("w-16 h-16")}
          </div>
          <span class="text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-1 rounded-full mb-3 shadow-sm">
             绘本阅读理解小测验 (${this.currentQuizIndex + 1}/${quizList.length})
          </span>
          <h2 class="text-xl sm:text-2xl font-black text-amber-950 mb-6 leading-relaxed">
            ${quiz.question}
          </h2>

          <div class="flex flex-col gap-3.5 w-full max-w-lg">
            ${quiz.options
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

        <!-- 结业胜利弹窗 -->
        <div id="book-finish-modal" class="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-white hidden animate-scale-up z-50 p-4">
          <div class="mb-4 flex items-center justify-center transform hover:scale-110 transition-transform animate-bounce-slow">
            ${GAME_ICONS.trophy("w-28 h-28")}
          </div>
          <h2 class="text-3xl sm:text-4xl font-black text-yellow-300 mb-2 drop-shadow-lg">恭喜读完《${book.title}》！</h2>
          <p class="text-xs sm:text-sm text-yellow-100/90 mb-6 font-bold text-center max-w-md">你已经成功掌握了绘本中的全部汉字，阅读能力再上新台阶！</p>
          <div class="candy-pill rounded-full px-6 py-2.5 mb-6 text-sm text-yellow-300 font-black flex items-center gap-4 border-2 border-yellow-300 shadow-xl">
            <span class="flex items-center gap-1.5"><span class="flex items-center">${GAME_ICONS.coin("w-5 h-5")}</span> +15 星币</span>
            <span class="flex items-center gap-1.5"><span class="flex items-center">${GAME_ICONS.star("w-5 h-5", true)}</span> +5 星星</span>
          </div>
          <button id="btn-finish-return-shelf" class="btn-game-orange text-white font-black text-base px-10 py-3.5 rounded-full shadow-2xl active:scale-95 cursor-pointer">
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
