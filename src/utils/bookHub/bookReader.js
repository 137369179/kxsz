/** BookModule — cinema reader shell + interactions */
import { soundAndFX } from "../soundEngine.js";
import { mountGameShell, showGameToast } from "../../components/SharedShell.js";
import { escapeHtml } from "../BaseModule.js";
import { GAME_ICONS } from "../gameIcons.js";
import { g2p } from "../g2p.js";

export function renderReader() {
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
          <button id="btn-back-shelf" data-speak="返回书架" aria-label="返回书架" class="flex items-center gap-1.5 text-amber-900 hover:text-orange-600 font-black text-xs px-3 py-1.5 rounded-full hover:bg-amber-100 transition-all cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
            <span>书架</span>
          </button>

          <button id="btn-open-catalog" data-speak="打开目录" aria-label="打开目录" class="flex items-center gap-1 text-amber-900 hover:text-orange-600 font-black text-xs px-3 py-1.5 rounded-full hover:bg-amber-100 transition-all cursor-pointer border border-amber-200" title="打开全书目录与快速跳页">
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

          <button id="btn-play-karaoke" data-speak="开始伴读" aria-label="开始伴读" class="btn-game-orange text-white font-black text-xs px-3.5 sm:px-4 py-1.5 rounded-full shadow-md flex items-center gap-1 active:scale-95 cursor-pointer">
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
        <button id="btn-prev-page" data-speak="上一页" aria-label="上一页" class="bg-white hover:bg-amber-50 text-amber-900 font-black text-xs px-6 py-2.5 rounded-full shadow-lg border-2 border-amber-200 transition-all active:scale-95 cursor-pointer ${
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

        <button id="btn-next-page" data-speak="下一页或完成阅读" aria-label="下一页或完成阅读" class="btn-game-orange text-white font-black text-xs px-7 py-2.5 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer">
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
export function bindReaderEvents(mainEl, page, book) {
  const totalPages = book.pages.length;

  // 返回书架
  const backShelfBtn = mainEl.querySelector("#btn-back-shelf");
  if (backShelfBtn) {
    this._on(backShelfBtn, "click", () => {
      soundAndFX.playPop();
      try { soundAndFX.stopSpeaking?.(); } catch {}
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
      try { soundAndFX.stopSpeaking?.(); } catch {}
      this.openUserVoiceModal(page);
    });
  }

  // 伴读整页
  const playKaraokeBtn = mainEl.querySelector("#btn-play-karaoke");
  if (playKaraokeBtn) {
    this._on(playKaraokeBtn, "click", () => {
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
      } else {
        // 随文识字（以读促识）：非核心字点击弹出轻量 Mini 识字卡
        this._timeout(() => {
          if (typeof this.openMiniCharTooltip === "function") {
            this.openMiniCharTooltip(char, span);
          }
        }, 250);
      }
    });
  });

  // 核心生字速查卡按钮
  mainEl.querySelectorAll(".target-char-pill").forEach((pill) => {
    this._on(pill, "click", () => {
      const char = pill.dataset.char;
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
      this._timeout(() => {
        soundAndFX.speakPriority(label, { kind: "sentence", emotion: "excited" });
      }, 180);
      showGameToast(this.container, `${label}`, "success");
    });
  });

  // 翻页控制
  const prevBtn = mainEl.querySelector("#btn-prev-page");
  if (prevBtn) {
    this._on(prevBtn, "click", () => {
      if (this.currentPageIndex > 0) {
        soundAndFX.playPop();
        try { soundAndFX.stopSpeaking?.(); } catch {}
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
      try { soundAndFX.stopSpeaking?.(); } catch {}
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
        try { soundAndFX.stopSpeaking?.(); } catch {}
        this.currentPageIndex++;
        this._saveProgress();
        this.render();
      }
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      if (this.currentPageIndex > 0) {
        try { soundAndFX.stopSpeaking?.(); } catch {}
        this.currentPageIndex--;
        this._saveProgress();
        this.render();
      }
    }
  };
  this._onWindow("keydown", keyHandler);
}

// ----------------------------------------------------
