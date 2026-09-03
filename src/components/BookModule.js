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

import { soundAndFX } from "../utils/soundEngine.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { mountGameShell, showGameToast } from "./SharedShell.js";
import { BaseModule, escapeHtml } from "../utils/BaseModule.js";
import { GAME_ICONS } from "../utils/gameIcons.js";
import { g2p } from "../utils/g2p.js";
import { pronunciationEval } from "../utils/pronunciationEval.js";
import { resolveBookVoiceReward } from "../utils/bookVoiceReward.js";
import { openUserVoiceModal } from "../utils/bookHub/bookVoiceModal.js";
import { renderShelf } from "../utils/bookHub/bookShelf.js";
import { openCharPopover, openCatalogDrawer } from "../utils/bookHub/bookOverlays.js";
import { storageManager } from "../utils/storageManager.js";
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
  renderShelf() { return renderShelf.call(this); }

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
  // 4-5. 生字全息卡 + 全书目录抽屉
  // ----------------------------------------------------
  openCharPopover(charStr) { return openCharPopover.call(this, charStr); }
  openCatalogDrawer(book) { return openCatalogDrawer.call(this, book); }

  // ----------------------------------------------------
  // 6. 我来读一读（儿童智能跟读打分与录音）
  // ----------------------------------------------------
  openUserVoiceModal(page) { return openUserVoiceModal.call(this, page); }

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
