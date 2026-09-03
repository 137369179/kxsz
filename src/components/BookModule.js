/**
 * 凯茜识字 (Cathy Literacy) - 分级绘本馆与沉浸式阅读器 (深度对标洪恩绘本标杆体验)
 * 核心特色体系：
 *  1. 分阶与主题书架筛选（全部 / 第1阶·启蒙森林 / 第2阶·缤纷生活 / 第3阶·星际进阶）
 *  2. 已读通关印章（金色皇冠 + 通关三星）与在读进度持久化
 *  3. 16:9 影院级大画幅绘本与画面隐藏互动寻宝热区
 *  4. 毫秒级字界事件驱动的卡拉OK伴读 + 单字精准点读
 *  5. 汉字顶部标准拼音注音（Ruby Pinyin）一键显隐切换
 *  6. 一键【自动连读】全本沉浸伴读模式（自动伴读、延时展示、平滑翻页）
 *  7. 【生字全息速查卡】(洪恩标杆)：田字格、字源演变、组词造句、发音朗读
 *  8. 【全书缩略图目录抽屉】(洪恩标杆)：对开页缩略图、快速跳页导航
 *  9. 【我来读一读】：儿童智能跟读打分、声波波形与亲子录音回放
 *  10. 【双重阅读测评 + 荣誉结业证书】(洪恩标杆)：生字眼力考验、故事理解问答、金牌结业证书
 */

import { STORYBOOKS_DATABASE } from "../data/books.js";
import { CHARACTER_DATABASE } from "../data/characters.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { mountGameShell, showGameToast } from "./SharedShell.js";
import { BaseModule, escapeHtml } from "../utils/BaseModule.js";
import { GAME_ICONS } from "../utils/gameIcons.js";
import { g2p } from "../utils/g2p.js";
import { pronunciationEval } from "../utils/pronunciationEval.js";
import { resolveBookVoiceReward } from "../utils/bookVoiceReward.js";
import { storageManager } from "../utils/storageManager.js";
import { checkBookReadiness, READING_STATUS } from "../utils/readingGatekeeper.js";
export class BookModule extends BaseModule {
  constructor(container) {
    super(container);
    this.currentBook = null;
    this.currentPageIndex = 0;
    this.isQuizMode = false;
    this.isCertificateMode = false;
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
    this.currentQuizStage = 1; // 1: 生字眼力考验, 2: 故事理解问答
    this.isVoiceModalOpen = false;
    this.isCatalogOpen = false;
    this.isCharPopoverOpen = false;
    this._loadProgress();
  }

  /** 从 storageManager 恢复阅读进度 */
  _loadProgress() {
    try {
      const raw = storageManager.getItem(this._progressKey);
      if (raw) {
        this.progressMap = JSON.parse(raw);
      }
    } catch (e) {
      console.warn("[BookModule] 加载阅读进度失败:", e);
      this.progressMap = {};
    }
  }

  /** 保存阅读进度到 storageManager */
  _saveProgress() {
    if (this.currentBook) {
      this.progressMap[this.currentBook.id] = this.currentPageIndex;
    }
    try {
      storageManager.setItem(this._progressKey, JSON.stringify(this.progressMap));
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
    const pe = pronunciationEval || (typeof window !== "undefined" ? window.pronunciationEval : null);
    if (pe && pe.state === "listening") {
      try { pe.stopAndEvaluate(); } catch {}
    }
    if (typeof document !== "undefined") {
      document.getElementById("char-popover-overlay")?.remove();
      document.getElementById("book-catalog-drawer-overlay")?.remove();
      document.getElementById("user-voice-modal-overlay")?.remove();
    }
    this.karaokeSessionId++;
    this.isVoiceModalOpen = false;
    this.isCatalogOpen = false;
    this.isCharPopoverOpen = false;
    super.destroy();
  }

  render() {
    this.destroy();
    if (!this.currentBook) {
      this.renderShelf();
    } else if (this.isCertificateMode) {
      this.renderCertificate();
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
    const charRecords = ebbinghausManager.progress.charRecords || {};

    // 过滤阶段
    const filteredBooks = STORYBOOKS_DATABASE.filter((b) => {
      if (this.currentFilterStage === "all") return true;
      return (b.stage || 1) === parseInt(this.currentFilterStage, 10);
    });

    mainEl.innerHTML = `
      <div class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pt-16 sm:pt-20 px-4 pb-12 overflow-y-auto no-scrollbar max-h-[calc(100vh-60px)]">
        
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
              
              <div class="relative w-full h-44 overflow-hidden bg-amber-100">
                <img src="${book.coverImg}" alt="${book.title}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                <div class="absolute top-2.5 left-2.5 bg-black/50 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-white/20">
                  第 ${book.level || 1} 阶
                </div>

                ${(() => {
                  const r = checkBookReadiness(book, charRecords);
                  if (r.status === READING_STATUS.READY || r.status === READING_STATUS.EMPTY) return "";
                  const color = r.status === READING_STATUS.PARTIAL ? "bg-sky-500" : "bg-rose-500";
                  return `<div class="absolute bottom-2.5 left-2.5 ${color} text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">${r.status === "blocked" ? "未解锁·" : "待学·"}${r.stats.unknownCount}字</div>`;
                })()}

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

              <div class="p-4 flex flex-col justify-between flex-1 bg-white">
                <div>
                  <div class="flex items-center justify-between">
                    <h3 class="text-base font-black text-amber-950 group-hover:text-orange-600 transition-colors">
                      ${book.title}
                    </h3>
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

    // 书籍点击进入阅读（E11: gatekeeper 拦截）
    mainEl.querySelectorAll(".book-card").forEach((card) => {
      this._on(card, "click", () => {
        const bookId = card.dataset.bookId;
        this.currentBook = STORYBOOKS_DATABASE.find((b) => b.id === bookId);
        const charRecords = ebbinghausManager.progress.charRecords || {};
        const readiness = checkBookReadiness(this.currentBook, charRecords);

        if (readiness.status === READING_STATUS.BLOCKED) {
          // B10: 超过一半没学 → 引导去学
          soundAndFX.playErrorSound?.();
          showGameToast(this.container, readiness.message, { duration: 2800 });
          return;
        }

        this.currentPageIndex = this.progressMap[bookId] || 0;
        this.isQuizMode = false;
        this.isCertificateMode = false;
        this.quizAnswered = false;
        this.currentQuizStage = 1;

        // PARTIAL 模式 → 强制开拼音
        if (readiness.status === READING_STATUS.PARTIAL) {
          this.showPinyin = true;
          showGameToast(this.container, readiness.message, { duration: 2500 });
        } else if (readiness.message) {
          showGameToast(this.container, readiness.message, { duration: 1800 });
        }

        soundAndFX.playSuccessSound();
        this.render();
      });
    });
  }

  // ----------------------------------------------------
  // 2. 16:9 影院级绘本阅读器 (洪恩特色全要素升级)
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
        
        <div class="w-full flex items-center justify-between bg-white/95 backdrop-blur-md px-4 sm:px-5 py-2.5 rounded-2xl shadow-xl border-2 border-amber-200/90 mb-3 flex-wrap gap-2">
          
          <div class="flex items-center gap-2">
            <button id="btn-back-shelf" class="flex items-center gap-1.5 text-amber-900 hover:text-orange-600 font-black text-xs px-3 py-1.5 rounded-full hover:bg-amber-100 transition-all cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
              <span>书架</span>
            </button>

            <button id="btn-open-catalog" class="flex items-center gap-1 text-amber-900 hover:text-orange-600 font-black text-xs px-3 py-1.5 rounded-full hover:bg-amber-100 transition-all cursor-pointer border border-amber-200" title="打开全书目录与快速跳页">
              <span class="flex items-center">${GAME_ICONS.cards("w-3.5 h-3.5")}</span>
              <span>目录</span>
            </button>
          </div>
          
          <div class="flex items-center gap-2">
            <h2 class="text-xs sm:text-sm font-black text-amber-950">${book.title}</h2>
            <span class="text-[11px] sm:text-xs text-orange-700 bg-orange-100/90 px-2.5 py-0.5 rounded-full font-black border border-orange-200">
              ${this.currentPageIndex + 1} / ${totalPages} 页
            </span>
          </div>

          <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            
            <button id="btn-toggle-pinyin" class="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-black shadow-sm transition-all cursor-pointer ${
              this.showPinyin ? "bg-amber-400 text-amber-950 font-black ring-2 ring-amber-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
            }" title="切换汉字上方标准拼音注音">
              <span>${this.showPinyin ? "拼音: 开" : "拼音: 关"}</span>
            </button>

            <button id="btn-toggle-autoplay" class="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-black shadow-sm transition-all cursor-pointer ${
              this.isAutoPlay ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white animate-pulse ring-2 ring-emerald-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
            }" title="开启后自动朗读并连续翻页">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
              <span>${this.isAutoPlay ? "连读中" : "自动连读"}</span>
            </button>

            <button id="btn-user-read" class="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs px-3 sm:px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1 active:scale-95 cursor-pointer hover:brightness-110" title="点击录音自己读一页">
              <span class="flex items-center">${GAME_ICONS.speaker("w-3.5 h-3.5")}</span>
              <span>我来读</span>
            </button>

            <button id="btn-play-karaoke" class="btn-game-orange text-white font-black text-xs px-3.5 sm:px-4 py-1.5 rounded-full shadow-md flex items-center gap-1 active:scale-95 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.speaker("w-3.5 h-3.5")}</span>
              <span>伴读</span>
            </button>
          </div>
        </div>

        <div class="w-full bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300/90 mb-4 flex flex-col md:flex-row items-stretch min-h-[380px] relative">
          
          <div class="w-full md:w-1/2 bg-amber-50/40 flex flex-col justify-center border-b-4 md:border-b-0 md:border-r-2 border-amber-200/80 relative shadow-[inset_-6px_0_12px_rgba(0,0,0,0.03)]">
            <div class="relative w-full aspect-video md:aspect-auto md:h-full min-h-[240px] bg-amber-100/50 group overflow-hidden flex items-center justify-center">
              <img src="${page.image}" alt="绘本插图" loading="lazy" decoding="async" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              
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

          <div class="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between text-center bg-gradient-to-br from-[#FFFDF9] to-[#FFF9EE]">
            
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-black text-amber-800/80 bg-amber-100/80 px-3 py-0.5 rounded-full border border-amber-200/80 shadow-sm">
                点读伴读 · 点击生字查字源
              </span>
              <span class="text-[11px] font-bold text-orange-600 bg-orange-100/60 px-2.5 py-0.5 rounded-full">
                第 ${this.currentPageIndex + 1} 页
              </span>
            </div>

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
                        ? "text-orange-800 bg-amber-100/90 font-black shadow-sm border-2 border-amber-300"
                        : "text-amber-950"
                    }" data-index="${idx}" data-char="${escapeHtml(token.char)}" data-target="${isTarget ? '1' : '0'}">
                      ${escapeHtml(token.char)}
                    </span>
                  </div>
                `;
              }).join("")}
            </div>

            <div class="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-xs font-black text-amber-800/80 flex items-center gap-1">
                  <span class="flex items-center">${GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
                  <span>核心生字:</span>
                </span>
                ${(book.targetChars || []).map(c => `
                  <button class="target-char-pill bg-amber-100 hover:bg-orange-500 hover:text-white text-orange-800 font-black text-xs px-2.5 py-1 rounded-xl border border-amber-300/80 shadow-sm transition-all active:scale-90 cursor-pointer flex items-center gap-1" data-char="${escapeHtml(c)}">
                    <span>${escapeHtml(c)}</span>
                    <span class="text-[9px] bg-orange-400 text-white px-1 rounded-full pointer-events-none">速查</span>
                  </button>
                `).join("")}
              </div>

              <span class="text-[10px] text-amber-700/60 font-bold hidden sm:inline">
                支持键盘 ← → 翻页
              </span>
            </div>

          </div>

        </div>

        <div class="w-full flex items-center justify-between px-2 sm:px-6">
          <button id="btn-prev-page" class="bg-white hover:bg-amber-50 text-amber-900 font-black text-xs px-6 py-2.5 rounded-full shadow-lg border-2 border-amber-200 transition-all active:scale-95 cursor-pointer ${
            this.currentPageIndex === 0 ? "opacity-40 pointer-events-none" : ""
          }">
            上一页
          </button>

          <div class="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-200 shadow-sm">
            ${book.pages
              .map(
                (_, idx) => `
              <div class="transition-all ${idx === this.currentPageIndex ? "w-6 h-2.5 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full shadow-sm" : "w-2.5 h-2.5 bg-amber-200 rounded-full"}"></div>
            `
              )
              .join("")}
          </div>

          <button id="btn-next-page" class="btn-game-orange text-white font-black text-xs px-7 py-2.5 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer">
            ${this.currentPageIndex === totalPages - 1 ? "完成阅读 · 测验" : "下一页"}
          </button>
        </div>

      </div>
    `;

    this.bindReaderEvents(mainEl, page, book);

    if (this.isAutoPlay) {
      this._timeout(() => {
        if (this.isAutoPlay && this.currentBook && !this.isQuizMode && !this.isCertificateMode) {
          this.playKaraoke(page, mainEl);
        }
      }, 350);
    }
  }

  // ----------------------------------------------------
  // 3. 事件绑定与各级抽屉/弹窗交互
  // ----------------------------------------------------
  bindReaderEvents(mainEl, page, book) {
    const totalPages = book.pages.length;

    // 返回书架
    const backShelfBtn = mainEl.querySelector("#btn-back-shelf");
    if (backShelfBtn) {
      this._on(backShelfBtn, "click", () => {
        soundAndFX.playPop();
        this._saveProgress();
        this.currentBook = null;
        this.render();
      });
    }

    // 目录抽屉
    const openCatalogBtn = mainEl.querySelector("#btn-open-catalog");
    if (openCatalogBtn) {
      this._on(openCatalogBtn, "click", () => {
        soundAndFX.playPop();
        this.openCatalogDrawer(book);
      });
    }

    // 拼音切换
    const togglePinyinBtn = mainEl.querySelector("#btn-toggle-pinyin");
    if (togglePinyinBtn) {
      this._on(togglePinyinBtn, "click", () => {
        soundAndFX.playPop();
        this.showPinyin = !this.showPinyin;
        this.render();
      });
    }

    // 自动连读开关
    const toggleAutoPlayBtn = mainEl.querySelector("#btn-toggle-autoplay");
    if (toggleAutoPlayBtn) {
      this._on(toggleAutoPlayBtn, "click", () => {
        soundAndFX.playPop();
        this.isAutoPlay = !this.isAutoPlay;
        if (this.isAutoPlay) {
          showGameToast(this.container, "已开启自动连读伴读模式", "success");
        } else {
          showGameToast(this.container, "已暂停自动连读", "info");
          if (this.autoPlayTimer) {
            clearTimeout(this.autoPlayTimer);
            this.autoPlayTimer = null;
          }
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

    // 伴读整页
    const playKaraokeBtn = mainEl.querySelector("#btn-play-karaoke");
    if (playKaraokeBtn) {
      this._on(playKaraokeBtn, "click", () => {
        soundAndFX.playPop();
        this.playKaraoke(page, mainEl);
      });
    }

    // 单字点读与生字全息卡
    mainEl.querySelectorAll(".karaoke-char").forEach((span) => {
      this._on(span, "click", () => {
        const char = span.dataset.char;
        const isTarget = span.dataset.target === "1";
        soundAndFX.speakPriority(char, { kind: "char", priority: 1 });
        span.classList.add("bg-amber-300", "scale-125");
        setTimeout(() => span.classList.remove("bg-amber-300", "scale-125"), 400);

        if (isTarget) {
          this._timeout(() => this.openCharPopover(char), 250);
        }
      });
    });

    // 核心生字速查卡按钮
    mainEl.querySelectorAll(".target-char-pill").forEach((pill) => {
      this._on(pill, "click", () => {
        const char = pill.dataset.char;
        soundAndFX.playPop();
        soundAndFX.speakPriority(char, { kind: "char", priority: 1 });
        this.openCharPopover(char);
      });
    });

    // 隐藏寻宝热区
    mainEl.querySelectorAll(".hotspot-trigger-btn").forEach((btn) => {
      this._on(btn, "click", (e) => {
        e.stopPropagation();
        const label = btn.dataset.label || "发现宝藏！";
        soundAndFX.playSuccessSound();
        soundAndFX.triggerConfetti(this.container);
        soundAndFX.speakPriority(label, { kind: "sentence", emotion: "excited" });
        showGameToast(this.container, `${label}`, "success");
      });
    });

    // 翻页控制
    const prevBtn = mainEl.querySelector("#btn-prev-page");
    if (prevBtn) {
      this._on(prevBtn, "click", () => {
        if (this.currentPageIndex > 0) {
          soundAndFX.playPop();
          this.currentPageIndex--;
          this._saveProgress();
          this.render();
        }
      });
    }

    const nextBtn = mainEl.querySelector("#btn-next-page");
    if (nextBtn) {
      this._on(nextBtn, "click", () => {
        soundAndFX.playPop();
        if (this.currentPageIndex < totalPages - 1) {
          this.currentPageIndex++;
          this._saveProgress();
          this.render();
        } else {
          // 完成全本阅读，进入测评流
          this.isQuizMode = true;
          this.currentQuizStage = 1;
          this.quizAnswered = false;
          this.render();
        }
      });
    }

    // 键盘翻页支持
    const keyHandler = (e) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        if (this.currentPageIndex < totalPages - 1) {
          this.currentPageIndex++;
          this._saveProgress();
          this.render();
        }
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        if (this.currentPageIndex > 0) {
          this.currentPageIndex--;
          this._saveProgress();
          this.render();
        }
      }
    };
    this._onWindow("keydown", keyHandler);
  }

  // ----------------------------------------------------
  // 4. 生字全息速查卡 (洪恩标杆特色)
  // ----------------------------------------------------
  openCharPopover(charStr) {
    if (this.isCharPopoverOpen) return;
    this.isCharPopoverOpen = true;

    // 从汉字数据库中检索该字
    const charData = CHARACTER_DATABASE.find((c) => c.char === charStr) || {
      char: charStr,
      pinyin: "zì",
      words: [{ word: charStr, pinyin: "", mean: "核心生字" }],
      originStory: "古代象形文字，形象生动描绘了事物特征。",
      exampleSentence: `我们在绘本中认识了“${charStr}”字。`,
      strokes: [
        { type: "横", start: [20, 50], end: [80, 50] }
      ]
    };

    const overlay = document.createElement("div");
    overlay.id = "char-popover-overlay";
    overlay.className = "fixed inset-0 z-[80] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in";
    overlay.innerHTML = `
      <div class="relative w-full max-w-lg bg-gradient-to-b from-[#FFFDF8] to-[#FFF6E5] rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-300 flex flex-col items-center select-none animate-scale-up">
        
        <button id="btn-close-popover" class="absolute -top-3.5 -right-3.5 w-10 h-10 rounded-full bg-white text-gray-800 font-extrabold text-base flex items-center justify-center shadow-xl hover:bg-gray-100 active:scale-95 cursor-pointer border-2 border-amber-200">
          <span class="font-sans font-bold leading-none">X</span>
        </button>

        <div class="flex items-center gap-2 mb-4">
          <span class="flex items-center">${GAME_ICONS.sparkle("w-6 h-6")}</span>
          <h3 class="text-lg font-black text-amber-950">生字全息卡 · 深度认知</h3>
        </div>

        <div class="w-full flex flex-col sm:flex-row items-center gap-6 mb-4">
          
          <div class="w-36 h-36 bg-red-50/70 border-4 border-red-500 rounded-3xl relative flex flex-col items-center justify-center flex-shrink-0 shadow-md">
            <div class="absolute inset-0 border-t-2 border-dashed border-red-300 top-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div class="absolute inset-0 border-l-2 border-dashed border-red-300 left-1/2 -translate-x-1/2 pointer-events-none"></div>
            <div class="absolute top-2 text-xs font-black text-red-600">${charData.pinyin}</div>
            <span class="text-6xl font-black text-red-900 font-serif relative z-10">${charData.char}</span>
          </div>

          <div class="flex-1 flex flex-col gap-2 w-full text-left">
            <div class="bg-white/80 p-3 rounded-2xl border border-amber-200">
              <span class="text-[11px] font-black text-amber-800/70 block mb-1">常用组词与释义：</span>
              <div class="flex flex-wrap gap-1.5">
                ${(charData.words || []).slice(0, 3).map(w => `
                  <span class="bg-amber-100 text-orange-900 text-xs font-black px-2.5 py-1 rounded-xl border border-amber-300/60">
                    ${w.word}
                  </span>
                `).join("")}
              </div>
            </div>

            <div class="bg-white/80 p-3 rounded-2xl border border-amber-200">
              <span class="text-[11px] font-black text-amber-800/70 block mb-1">字源故事：</span>
              <p class="text-xs text-amber-950 font-semibold leading-relaxed line-clamp-2">
                ${charData.originStory || charData.evolution?.story || (typeof charData.evolution === "string" ? charData.evolution : "") || "形象描摹天地万物之形，传承千年华夏文明。"}
              </p>
            </div>
          </div>

        </div>

        <div class="w-full bg-amber-100/60 p-3 rounded-2xl border border-amber-200/80 mb-5 text-left">
          <span class="text-[11px] font-black text-amber-800/80 block mb-0.5">例句巩固：</span>
          <p class="text-xs text-amber-950 font-bold">${charData.exampleSentence || charData.sentence || `我们在日常生活中常常用到“${charData.char}”字。`}</p>
        </div>

        <div class="w-full flex items-center justify-center gap-4">
          <button id="btn-popover-speak" class="btn-game-orange text-white font-black text-xs px-8 py-3 rounded-full shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.speaker("w-4 h-4")}</span>
            <span>朗读“${charData.char}”字发音</span>
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector("#btn-close-popover");
    const closePopover = () => {
      this.isCharPopoverOpen = false;
      overlay.remove();
    };

    this._on(closeBtn, "click", closePopover);
    this._on(overlay, "click", (e) => {
      if (e.target === overlay) closePopover();
    });

    const speakBtn = overlay.querySelector("#btn-popover-speak");
    this._on(speakBtn, "click", () => {
      soundAndFX.playPop();
      soundAndFX.speakPriority(charData.char, { kind: "char", priority: 1 });
    });
  }

  // ----------------------------------------------------
  // 5. 全书缩略图目录抽屉 (洪恩标杆特色)
  // ----------------------------------------------------
  openCatalogDrawer(book) {
    if (this.isCatalogOpen) return;
    this.isCatalogOpen = true;

    const overlay = document.createElement("div");
    overlay.id = "book-catalog-drawer-overlay";
    overlay.className = "fixed inset-0 z-[75] bg-black/75 backdrop-blur-md flex items-center justify-end animate-fade-in";
    overlay.innerHTML = `
      <div class="relative w-full max-w-md h-full bg-gradient-to-b from-[#FFFDF9] to-[#FFF7E8] p-6 shadow-2xl border-l-4 border-amber-300 flex flex-col justify-between select-none animate-slide-left">
        
        <div>
          <div class="flex items-center justify-between pb-4 border-b border-amber-200 mb-4">
            <div class="flex items-center gap-2">
              <span class="flex items-center">${GAME_ICONS.book("w-6 h-6")}</span>
              <h3 class="text-base font-black text-amber-950">《${book.title}》全书目录</h3>
            </div>
            
            <button id="btn-close-catalog" class="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs flex items-center justify-center cursor-pointer">
              <span class="font-sans font-bold leading-none">X</span>
            </button>
          </div>
          
          <p class="text-xs text-amber-800/70 font-bold mb-3">共 ${book.pages.length} 页 · 点击任意页码快速跳转</p>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 pr-1 my-2">
          ${book.pages.map((p, idx) => {
            const isCurrent = idx === this.currentPageIndex;
            return `
              <div class="catalog-page-card group p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                isCurrent
                  ? "bg-amber-100/90 border-orange-500 shadow-md ring-2 ring-orange-300"
                  : "bg-white border-amber-200 hover:border-orange-400 hover:shadow"
              }" data-page-index="${idx}">
                
                <div class="w-16 h-12 rounded-xl overflow-hidden bg-amber-100 flex-shrink-0 border border-amber-200">
                  <img src="${p.image}" alt="第${idx + 1}页" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>

                <div class="flex-1 overflow-hidden">
                  <div class="flex items-center justify-between mb-0.5">
                    <span class="text-xs font-black ${isCurrent ? "text-orange-700" : "text-amber-950"}">第 ${idx + 1} 页</span>
                    ${isCurrent ? '<span class="text-[10px] bg-orange-500 text-white font-black px-2 py-0.5 rounded-full">当前正在读</span>' : ''}
                  </div>
                  <p class="text-[11px] text-gray-500 font-semibold truncate">${p.text}</p>
                </div>

              </div>
            `;
          }).join("")}
        </div>

        <div class="pt-3 border-t border-amber-200 flex items-center justify-between">
          <span class="text-[11px] text-amber-800/70 font-bold">凯茜分级绘本精选</span>
          <button id="btn-catalog-back" class="btn-game-orange text-white font-black text-xs px-6 py-2 rounded-full shadow cursor-pointer">
            继续阅读
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(overlay);

    const closeDrawer = () => {
      this.isCatalogOpen = false;
      overlay.remove();
    };

    this._on(overlay.querySelector("#btn-close-catalog"), "click", closeDrawer);
    this._on(overlay.querySelector("#btn-catalog-back"), "click", closeDrawer);
    this._on(overlay, "click", (e) => {
      if (e.target === overlay) closeDrawer();
    });

    this._onDom(overlay.querySelectorAll(".catalog-page-card"), "click", (e) => {
      const card = e.currentTarget;
      const targetIdx = parseInt(card.dataset.pageIndex, 10);
      soundAndFX.playPop();
      this.currentPageIndex = targetIdx;
      this._saveProgress();
      closeDrawer();
      this.render();
    });
  }

  // ----------------------------------------------------
  // 6. 我来读一读（儿童智能跟读打分与录音）
  // ----------------------------------------------------
  openUserVoiceModal(page) {
    if (this.isVoiceModalOpen) return;
    this.isVoiceModalOpen = true;

    let selectedRole = "kid"; // "kid" | "parent" | "duet"

    const overlay = document.createElement("div");
    overlay.id = "user-voice-modal-overlay";
    overlay.className = "fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in";
    overlay.innerHTML = `
      <div class="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
        
        <button id="btn-close-voice-modal" class="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white text-gray-800 font-extrabold text-base flex items-center justify-center shadow-xl hover:bg-gray-100 active:scale-95 cursor-pointer border-2 border-amber-200">
          <span class="font-sans font-bold text-base leading-none">X</span>
        </button>

        <div class="flex items-center gap-2 mb-1">
          <span class="flex items-center">${GAME_ICONS.speaker("w-7 h-7")}</span>
          <h3 class="text-xl font-black text-amber-950">亲子双轨共读秀 · 我来录故事</h3>
        </div>
        <p class="text-xs text-amber-800/80 mb-3 font-bold">选择录音角色，录制属于我们家的专属有声绘本！</p>

        <div class="flex items-center gap-2 mb-4 bg-white/80 p-1.5 rounded-full border border-amber-200 shadow-sm">
          <button class="role-select-btn px-3 py-1 rounded-full text-xs font-black transition-all active:scale-95 bg-orange-500 text-white shadow" data-role="kid">
            宝贝朗读
          </button>
          <button class="role-select-btn px-3 py-1 rounded-full text-xs font-black transition-all active:scale-95 text-amber-900 hover:bg-amber-100" data-role="parent">
            家长朗读
          </button>
          <button class="role-select-btn px-3 py-1 rounded-full text-xs font-black transition-all active:scale-95 text-amber-900 hover:bg-amber-100" data-role="duet">
            亲子合读
          </button>
        </div>

        <div class="w-full bg-white/90 p-4 rounded-2xl border-2 border-amber-200 shadow-inner mb-4">
          <p class="text-lg font-black text-amber-950 leading-relaxed">${escapeHtml(page.text)}</p>
        </div>

        <div class="relative w-24 h-24 mb-3 flex items-center justify-center">
          <div id="voice-glow-bg" class="absolute inset-0 rounded-full bg-rose-400/30 blur-xl opacity-0 transition-opacity"></div>
          <button id="btn-start-record" class="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-red-500 text-white shadow-2xl flex flex-col items-center justify-center active:scale-90 transition-all cursor-pointer border-4 border-white">
            <span class="flex items-center mb-0.5">${GAME_ICONS.speaker("w-6 h-6")}</span>
            <span id="record-btn-label" class="text-[10px] font-black">开始录音</span>
          </button>
        </div>

        <div id="voice-status-text" class="text-xs font-bold text-amber-900 mb-3 h-6">准备就绪，点击麦克风开始录制</div>

        <button id="btn-playback-voice" class="hidden bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-6 py-2.5 rounded-full shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer transition-all">
          <span class="flex items-center">${GAME_ICONS.speaker("w-4 h-4")}</span>
          <span id="playback-btn-text">听听我们的朗读录音</span>
        </button>

      </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector("#btn-close-voice-modal");
    const startRecordBtn = overlay.querySelector("#btn-start-record");
    const recordBtnLabel = overlay.querySelector("#record-btn-label");
    const statusText = overlay.querySelector("#voice-status-text");
    const playbackBtn = overlay.querySelector("#btn-playback-voice");
    const playbackBtnText = overlay.querySelector("#playback-btn-text");

    // 角色选择
    this._onDom(overlay.querySelectorAll(".role-select-btn"), "click", (e) => {
      const btn = e.currentTarget;
      soundAndFX.playPop();
      selectedRole = btn.dataset.role;
      overlay.querySelectorAll(".role-select-btn").forEach((b) => {
        b.classList.remove("bg-orange-500", "text-white", "shadow");
        b.classList.add("text-amber-900");
      });
      btn.classList.add("bg-orange-500", "text-white", "shadow");
      btn.classList.remove("text-amber-900");

      const roleName = selectedRole === "kid" ? "宝贝" : selectedRole === "parent" ? "家长" : "亲子合读";
      statusText.textContent = `已切换为【${roleName}】模式，点击麦克风开始！`;
    });

    let isRecording = false;

    const closeModal = () => {
      this.isVoiceModalOpen = false;
      const pe = pronunciationEval || (typeof window !== "undefined" ? window.pronunciationEval : null);
      if (pe && pe.state === "listening") {
        try { pe.stopAndEvaluate(); } catch {}
      }
      overlay.remove();
    };

    this._on(closeBtn, "click", closeModal);

    this._on(startRecordBtn, "click", async () => {
      if (isRecording) return;
      isRecording = true;
      soundAndFX.playFamilyRecordChime(true);
      const roleName = selectedRole === "kid" ? "宝贝" : selectedRole === "parent" ? "家长" : "亲子";
      statusText.textContent = `正在录制【${roleName}】的声音... 请大声朗读`;
      recordBtnLabel.textContent = "录音中";

      startRecordBtn.classList.add("bg-rose-500", "animate-pulse");
      const glowBg = overlay.querySelector("#voice-glow-bg");
      if (glowBg) {
        glowBg.classList.replace("opacity-0", "opacity-100");
        glowBg.classList.add("animate-pulse");
      }

      const pe = pronunciationEval || (typeof window !== "undefined" ? window.pronunciationEval : null);
      let evalResult = null;

      if (pe && typeof pe.evaluate === "function") {
        try {
          evalResult = await pe.evaluate(page.text, { mode: "sentence", maxSeconds: 5 });
        } catch (err) {
          console.warn("[BookModule] 语音评测失败:", err);
          evalResult = null;
        }
      }

      if (!this.isVoiceModalOpen) return;

      const reward = resolveBookVoiceReward(evalResult);
      if (reward.ok) {
        soundAndFX.playParentCheer();
        soundAndFX.triggerConfetti(this.container);
        ebbinghausManager.addCoins(reward.coins);
        ebbinghausManager.save();
        statusText.innerHTML = `<span class="text-emerald-600 font-black text-sm">${roleName} 朗读得分：${reward.score} 分！获得 ${reward.coins} 凯茜星币！</span>`;
      } else {
        if (typeof soundAndFX.playEncouragement === "function") soundAndFX.playEncouragement();
        else if (typeof soundAndFX.playPop === "function") soundAndFX.playPop();
        statusText.innerHTML = `<span class="text-amber-600 font-black text-sm">这次没评到分，再试一次大声朗读吧！</span>`;
      }
      recordBtnLabel.textContent = "重新录音";
      startRecordBtn.classList.remove("bg-rose-500", "animate-pulse");
      if (glowBg) {
        glowBg.classList.replace("opacity-100", "opacity-0");
        glowBg.classList.remove("animate-pulse");
      }
      if (playbackBtnText) playbackBtnText.textContent = `回放【${roleName}】的朗读声音`;
      playbackBtn.classList.remove("hidden");
      isRecording = false;
    });

    this._on(playbackBtn, "click", () => {
      soundAndFX.playPop();
      soundAndFX.speakPriority(page.text, { kind: "sentence", emotion: "gentle" });
    });
  }

  // ----------------------------------------------------
  // 7. 双重阅读测评 (洪恩标杆特色：生字眼力 + 故事理解)
  // ----------------------------------------------------
  renderQuiz() {
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
  renderCertificate() {
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
}
