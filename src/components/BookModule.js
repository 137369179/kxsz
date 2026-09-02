/**
 *  (Cathy Literacy) -  ()
 * 
 *  1.  / 1· / 2· / 3·
 *  2.  + 
 *  3. 16:9 
 *  4. OK + 
 *  5. Ruby Pinyin
 *  6. 
 *  7. ()
 *  8. ()
 *  9. 
 *  10.  + ()
 */

import { STORYBOOKS_DATABASE } from "../data/books.js";
import { CHARACTER_DATABASE } from "../data/characters.js";
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
    this.isCertificateMode = false;
    this.quizAnswered = false;
    this.karaokeTimer = null;
    this.currentFilterStage = "all"; // "all" | 1 | 2 | 3
    this.isAutoPlay = false; // 
    this.showPinyin = true; // 
    this.autoPlayTimer = null;
    this.userRecordedBlob = null;
    this.userRecordedUrl = null;

    //  key
    this._progressKey = "cathy_book_progress_v2";
    this.progressMap = {}; // { bookId: pageIndex }

    // 
    this.discoveredHotspots = {}; // { bookId: [hotspotKeys] }
    this._hotspotsKey = "cathy_book_hotspots_v2";

    // 
    this.bookRecordings = {}; // { bookId: { pageIndex: { score, blobUrl, timestamp } } }
    this._recordingsKey = "cathy_book_recordings_v2";

    // 
    this.readingSpeed = 1.0; // 0.8 | 1.0 | 1.2
    this.bgmEnabled = true;
    this.isPlayingWholeBookVoice = false;

    this.karaokeSessionId = 0;
    this.currentQuizStage = 1; // 1: , 2: 
    this.isVoiceModalOpen = false;
    this.isCatalogOpen = false;
    this.isCharPopoverOpen = false;
    this._loadProgress();
  }

  /**  localStorage  */
  _loadProgress() {
    try {
      const raw = localStorage.getItem(this._progressKey);
      if (raw) {
        this.progressMap = JSON.parse(raw);
      }
    } catch {}
    try {
      const rawHotspots = localStorage.getItem(this._hotspotsKey);
      if (rawHotspots) {
        this.discoveredHotspots = JSON.parse(rawHotspots);
      }
    } catch {}
    try {
      const rawRec = localStorage.getItem(this._recordingsKey);
      if (rawRec) {
        this.bookRecordings = JSON.parse(rawRec);
      }
    } catch {}
  }

  /**  localStorage */
  _saveProgress() {
    if (this.currentBook) {
      this.progressMap[this.currentBook.id] = this.currentPageIndex;
    }
    try {
      localStorage.setItem(this._progressKey, JSON.stringify(this.progressMap));
    } catch {}
    try {
      localStorage.setItem(this._hotspotsKey, JSON.stringify(this.discoveredHotspots));
    } catch {}
    try {
      localStorage.setItem(this._recordingsKey, JSON.stringify(this.bookRecordings));
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
    this.isCatalogOpen = false;
    this.isCharPopoverOpen = false;
    if (typeof document !== "undefined") {
      document.querySelectorAll("#char-popover-overlay, #book-catalog-drawer-overlay, #user-voice-modal-overlay").forEach((el) => el.remove());
    }
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
  // 1.  ( + )
  // ----------------------------------------------------
  renderShelf() {
    const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
      activeMode: "books",
      heading: ""
    });
    this._addCleanup(destroyShell);

    const readBooks = ebbinghausManager.progress.readBooks || [];

    // 
    const filteredBooks = STORYBOOKS_DATABASE.filter((b) => {
      if (this.currentFilterStage === "all") return true;
      return (b.stage || 1) === parseInt(this.currentFilterStage, 10);
    });

    mainEl.innerHTML = `
      <div class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pt-16 sm:pt-20 px-4 pb-12 overflow-y-auto no-scrollbar max-h-[calc(100vh-60px)]">
        
        <!--  -->
        <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-amber-400 shadow-md flex items-center justify-center border-2 border-white flex-shrink-0">
              <span class="flex items-center">${GAME_ICONS.book("w-7 h-7")}</span>
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl font-black text-amber-950 flex items-center gap-2">
                <span></span>
                <span class="text-xs bg-orange-500 text-white font-bold px-2.5 py-0.5 rounded-full shadow-sm">${STORYBOOKS_DATABASE.length} </span>
              </h1>
              <p class="text-xs text-amber-800/80 font-bold mt-0.5"> ·  · </p>
            </div>
          </div>

          <!--  -->
          <div class="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-200 shadow-sm">
            <span class="text-xs text-amber-900/70 font-bold">:</span>
            <span class="text-xs font-black text-orange-600">${readBooks.length} / ${STORYBOOKS_DATABASE.length} </span>
            <span class="text-amber-300">|</span>
            <span class="flex items-center gap-1 text-xs font-black text-amber-900">
              <span class="flex items-center">${GAME_ICONS.star("w-4 h-4", false)}</span>
              <span>${readBooks.length * 3} </span>
            </span>
          </div>
        </div>

        <!--  -->
        <div class="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar py-1">
          ${[
            { key: "all", label: "", count: STORYBOOKS_DATABASE.length },
            { key: "1", label: "1 · ", count: STORYBOOKS_DATABASE.filter((b) => (b.stage || 1) === 1).length },
            { key: "2", label: "2 · ", count: STORYBOOKS_DATABASE.filter((b) => (b.stage || 1) === 2).length },
            { key: "3", label: "3 · ", count: STORYBOOKS_DATABASE.filter((b) => (b.stage || 1) === 3).length }
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

        <!--  -->
        ${
          filteredBooks.length === 0
            ? `
          <div class="w-full bg-white/80 backdrop-blur-md rounded-3xl p-12 text-center border-2 border-amber-200 shadow-md my-4">
            <div class="w-16 h-16 mx-auto mb-3 opacity-60 flex items-center justify-center">${GAME_ICONS.book("w-16 h-16")}</div>
            <p class="text-sm font-black text-amber-900"></p>
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
              
              <!-- 绘本封面图 (16:10 黄金画册比例) -->
              <div class="relative w-full aspect-[16/10] overflow-hidden bg-amber-100 rounded-t-3xl">
                <img src="${book.coverImg}" alt="${book.title}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                <!--  -->
                <div class="absolute top-2.5 left-2.5 bg-black/50 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-white/20">
                   ${book.level || 1} 
                </div>

                <!--  -->
                ${
                  isRead
                    ? `
                  <div class="absolute top-2.5 right-2.5 bg-amber-500 text-white px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-yellow-200 text-[10px] font-black">
                    <span class="flex items-center">${GAME_ICONS.crown("w-3.5 h-3.5")}</span>
                    <span></span>
                  </div>
                `
                    : ""
                }
              </div>

              <!--  -->
              <div class="p-4 flex flex-col justify-between flex-1 bg-white">
                <div>
                  <div class="flex items-center justify-between">
                    <h3 class="text-base font-black text-amber-950 group-hover:text-orange-600 transition-colors">
                      ${book.title}
                    </h3>
                    <!-- 3  -->
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
                    <span class="text-[11px] text-amber-800/70 font-bold shrink-0">:</span>
                    ${(book.targetChars || ["", "", ""]).slice(0, 4).map(c => `
                      <span class="bg-amber-100/70 text-orange-800 text-[11px] font-black px-1.5 py-0.5 rounded-md">${c}</span>
                    `).join("")}
                  </div>
                  
                  <button class="btn-game-orange text-white font-black text-xs px-4 py-1.5 rounded-full shadow-md active:scale-95 transition-transform cursor-pointer shrink-0">
                    ${isRead ? "" : ""}
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

    // 
    mainEl.querySelectorAll(".stage-filter-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        this.currentFilterStage = btn.dataset.stage;
        soundAndFX.playPop();
        this.render();
      });
    });

    // 
    mainEl.querySelectorAll(".book-card").forEach((card) => {
      this._on(card, "click", () => {
        const bookId = card.dataset.bookId;
        this.currentBook = STORYBOOKS_DATABASE.find((b) => b.id === bookId);
        this.currentPageIndex = this.progressMap[bookId] || 0;
        this.isQuizMode = false;
        this.isCertificateMode = false;
        this.quizAnswered = false;
        this.currentQuizStage = 1;
        soundAndFX.playSuccessSound();
        this.render();
      });
    });
  }

  // ----------------------------------------------------
  // 2. 16:9 
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

    // G2P  tokens
    const pinyinTokens = g2p.convert(page.text || "");

    // 
    const allHotspotKeys = (book.pages || []).flatMap((p, pIdx) => (p.interactions || p.hotspots || []).map((_, hIdx) => `${pIdx}_${hIdx}`));
    const discoveredList = this.discoveredHotspots[book.id] || [];
    const discoveredCount = discoveredList.length;
    const totalHotspots = allHotspotKeys.length;

    // 
    const recordingsForBook = this.bookRecordings[book.id] || {};
    const recordedPagesCount = Object.keys(recordingsForBook).length;

    mainEl.innerHTML = `
      <div class="relative w-full max-w-5xl mx-auto flex flex-col justify-between pt-16 sm:pt-20 pb-6 px-4 select-none animate-fade-in">
        
        <!--  (Glass Toolbar) -->
        <div class="w-full flex items-center justify-between bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2 rounded-2xl shadow-lg border border-amber-200/80 mb-3 gap-2 flex-wrap">
          
          <!--  +  +  -->
          <div class="flex items-center gap-2 overflow-hidden">
            <button id="btn-back-shelf" class="flex items-center gap-1 text-amber-800/80 hover:text-orange-600 font-black text-xs px-2.5 py-1.5 rounded-xl hover:bg-amber-50 transition-all cursor-pointer shrink-0">
              <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
              <span class="hidden sm:inline"></span>
            </button>

            <button id="btn-open-catalog" class="flex items-center gap-1 text-amber-800 hover:text-orange-600 font-black text-xs px-2 py-1.5 rounded-xl hover:bg-amber-50 transition-all cursor-pointer shrink-0 border border-amber-200" title="">
              <span class="flex items-center">${GAME_ICONS.cards("w-3.5 h-3.5")}</span>
              <span></span>
            </button>

            <div class="w-px h-4 bg-amber-200/80 shrink-0"></div>

            <h2 class="text-xs sm:text-sm font-black text-amber-950 truncate max-w-[90px] sm:max-w-[150px]">${book.title}</h2>
            <span class="text-[10px] text-orange-600 bg-orange-100/80 px-1.5 py-0.5 rounded-lg font-black border border-orange-200/60 shrink-0">
              ${this.currentPageIndex + 1}<span class="opacity-50">/${totalPages}</span>
            </span>
          </div>

          <!--  -->
          <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            
            <!--  -->
            ${totalHotspots > 0 ? `
              <div class="hidden sm:flex items-center gap-1 bg-amber-100/90 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-xl border border-amber-200">
                <span class="flex items-center">${GAME_ICONS.sparkle("w-3 h-3")}</span>
                <span id="hotspot-count-badge">${GAME_ICONS.sparkle("w-4 h-4 inline-block")} ${discoveredCount}/${totalHotspots}</span>
              </div>
            ` : ""}

            <!--  -->
            <button id="btn-toggle-pinyin" class="flex items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              this.showPinyin ? "bg-sky-100 text-sky-700 border border-sky-300" : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
            }" title="">
              <span>${this.showPinyin ? " " : ""}</span>
            </button>

            <!--  -->
            <button id="btn-toggle-autoplay" class="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              this.isAutoPlay ? "bg-emerald-500 text-white ring-1 ring-emerald-300" : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
            }" title="">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
              <span>${this.isAutoPlay ? "" : ""}</span>
            </button>

            ${recordedPagesCount > 0 ? `
              <button id="btn-play-my-voice" class="flex items-center gap-1 bg-purple-100 text-purple-700 font-black text-xs px-2.5 py-1.5 rounded-xl border border-purple-200 transition-all active:scale-95 cursor-pointer hover:bg-purple-200">
                <span>${GAME_ICONS.speaker("w-5 h-5 inline-block")}</span>
                <span>(${recordedPagesCount})</span>
              </button>
            ` : ""}

            <!--  -->
            <button id="btn-user-read" class="flex items-center gap-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-black text-xs px-2.5 py-1.5 rounded-xl border border-rose-200 transition-all active:scale-95 cursor-pointer">
              <span>${GAME_ICONS.speaker("w-5 h-5 inline-block")}</span>
              <span></span>
            </button>

            <!--  -->
            <button id="btn-play-karaoke" class="btn-game-orange text-white font-black text-xs px-3.5 sm:px-4 py-1.5 rounded-xl shadow-md flex items-center gap-1 active:scale-95 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.speaker("w-3.5 h-3.5")}</span>
              <span></span>
            </button>
          </div>
        </div>

        <div class="w-full bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300/90 mb-4 flex flex-col md:flex-row items-stretch min-h-[380px] relative">
          
          <!--  +  -->
          <div class="w-full md:w-[55%] bg-amber-50/40 flex flex-col justify-center border-b-2 md:border-b-0 md:border-r border-amber-200/60 relative">
            <div class="relative w-full aspect-video md:aspect-auto md:h-full min-h-[260px] md:min-h-[340px] bg-amber-100/50 group overflow-hidden flex items-center justify-center">
              <img src="${page.image}" alt="" loading="lazy" decoding="async" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              
              <!--  -->
              ${(page.interactions || page.hotspots || []).map((hp, idx) => `
                <button class="hotspot-trigger-btn absolute z-20 w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white text-amber-950 font-black text-xs flex items-center justify-center shadow-xl animate-bounce-slow active:scale-90 hover:scale-125 transition-transform cursor-pointer" style="top: ${hp.y}; left: ${hp.x};" data-sound="${hp.sound || ''}" data-label="${hp.text || hp.label || ''}">
                  <span class="flex items-center pointer-events-none">${GAME_ICONS.sparkle("w-6 h-6")}</span>
                </button>
              `).join("")}
            </div>

            <div class="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full pointer-events-none flex items-center gap-1.5 z-10 border border-white/20">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
              <span></span>
            </div>
          </div>

          <!--  () -->
          <div class="w-full md:w-[45%] p-5 sm:p-7 flex flex-col justify-between text-center bg-gradient-to-br from-[#FFFDF9] to-[#FFF8EC]">
            
            <!--  -->
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] font-black text-amber-700/70 bg-amber-100/60 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                ${GAME_ICONS.sparkle("w-4 h-4 inline-block")}  &middot; 
              </span>
              <span class="text-[10px] font-bold text-orange-600/80 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                ${this.currentPageIndex + 1} / ${totalPages}
              </span>
            </div>

            <!--  +  -->
            <div id="karaoke-text-container" class="flex flex-wrap justify-center items-end gap-x-2 sm:gap-x-3 gap-y-5 my-auto py-6">
              ${pinyinTokens.map((token, idx) => {
                if (token.isPunct) {
                  return `
                    <div class="inline-flex flex-col items-center justify-end align-bottom pb-1">
                      <span style="min-height:18px"></span>
                      <span class="text-[2rem] sm:text-[2.5rem] md:text-[2.8rem] font-serif text-amber-800/40 leading-none">${token.char}</span>
                    </div>
                  `;
                }
                const isTarget = (book.targetChars || []).includes(token.char);

                return `
                  <div class="inline-flex flex-col items-center justify-end align-bottom group/char select-none">
                    <span class="text-[12px] sm:text-[13px] font-bold text-sky-600 tracking-tight leading-none mb-1 transition-opacity duration-150 ${
                      this.showPinyin ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }" style="min-height:15px;font-family:'Noto Sans SC',sans-serif;letter-spacing:0.01em;">${token.pinyinMarked || '\u00a0'}</span>
                    <span class="karaoke-char text-[2rem] sm:text-[2.5rem] md:text-[2.8rem] font-black leading-none px-2 py-1.5 rounded-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all duration-150 ${
                      isTarget
                        ? 'text-orange-800 bg-amber-100 border border-amber-300/80 shadow-sm'
                        : 'text-amber-950 hover:bg-orange-50'
                    }" data-index="${idx}" data-char="${token.char}" data-target="${isTarget ? '1' : '0'}">
                      ${token.char}
                    </span>
                  </div>
                `;
              }).join("")}
            </div>

            <!--  -->
            <div class="mt-3 pt-2.5 border-t border-amber-200/50 flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-[10px] font-black text-amber-700/70 shrink-0">:</span>
                ${(book.targetChars || []).map(c => `
                  <button class="target-char-pill bg-amber-100 hover:bg-orange-500 hover:text-white text-orange-800 font-black text-sm w-8 h-8 rounded-xl border border-amber-200 shadow-sm transition-all active:scale-90 cursor-pointer flex items-center justify-center" data-char="${c}" title="${c}">
                    ${c}
                  </button>
                `).join("")}
              </div>

              <span class="text-[9px] text-amber-600/50 font-bold hidden sm:inline tracking-wide">
                ← →  &nbsp;&middot;&nbsp; 
              </span>
            </div>

          </div>

        </div>

        <!--  -->
        <div class="w-full flex items-center justify-between px-1 sm:px-4 mt-1">
          <button id="btn-prev-page" class="flex items-center gap-1.5 bg-white/90 hover:bg-amber-50 text-amber-800 font-black text-xs px-5 py-2.5 rounded-full shadow-md border border-amber-200/80 transition-all active:scale-95 cursor-pointer ${
            this.currentPageIndex === 0 ? 'opacity-30 pointer-events-none' : 'hover:border-amber-300'
          }">
            <span>←</span>
            <span></span>
          </button>

          <!--  -->
          <div class="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-2 rounded-full border border-amber-200/60 shadow-sm">
            ${book.pages
              .map(
                (_, idx) => `
              <div class="transition-all duration-300 rounded-full cursor-pointer ${
                idx === this.currentPageIndex
                  ? 'w-5 h-2 bg-gradient-to-r from-orange-400 to-amber-500 shadow-sm'
                  : 'w-2 h-2 bg-amber-200 hover:bg-amber-400'
              }" title=" ${idx+1} "></div>
            `
              )
              .join("")}
          </div>

          <button id="btn-next-page" class="btn-game-orange text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5">
            <span>${this.currentPageIndex === totalPages - 1 ? "" : ""}</span>
            <span>${this.currentPageIndex === totalPages - 1 ? GAME_ICONS.trophy("w-5 h-5 inline-block") : "&rarr;"}</span>
          </button>
        </div>

      </div>
    `;

    this.bindReaderEvents(mainEl, page, book);
  }

  // ----------------------------------------------------
  // 3. /
  // ----------------------------------------------------
  bindReaderEvents(mainEl, page, book) {
    const totalPages = book.pages.length;

    // 
    const backShelfBtn = mainEl.querySelector("#btn-back-shelf");
    if (backShelfBtn) {
      this._on(backShelfBtn, "click", () => {
        soundAndFX.playPop();
        this._saveProgress();
        this.currentBook = null;
        this.render();
      });
    }

    // 
    const openCatalogBtn = mainEl.querySelector("#btn-open-catalog");
    if (openCatalogBtn) {
      this._on(openCatalogBtn, "click", () => {
        soundAndFX.playPop();
        this.openCatalogDrawer(book);
      });
    }

    // 
    const togglePinyinBtn = mainEl.querySelector("#btn-toggle-pinyin");
    if (togglePinyinBtn) {
      this._on(togglePinyinBtn, "click", () => {
        soundAndFX.playPop();
        this.showPinyin = !this.showPinyin;
        this.render();
      });
    }

    // 
    const toggleAutoPlayBtn = mainEl.querySelector("#btn-toggle-autoplay");
    if (toggleAutoPlayBtn) {
      this._on(toggleAutoPlayBtn, "click", () => {
        soundAndFX.playPop();
        this.isAutoPlay = !this.isAutoPlay;
        if (this.isAutoPlay) {
          showGameToast(this.container, "", "success");
          this.playKaraoke(page, mainEl);
        } else {
          showGameToast(this.container, "", "info");
          if (this.autoPlayTimer) {
            clearTimeout(this.autoPlayTimer);
            this.autoPlayTimer = null;
          }
        }
        this.render();
      });
    }

    // 
    const userReadBtn = mainEl.querySelector("#btn-user-read");
    if (userReadBtn) {
      this._on(userReadBtn, "click", () => {
        soundAndFX.playPop();
        this.openUserVoiceModal(page);
      });
    }

    // /
    const playMyVoiceBtn = mainEl.querySelector("#btn-play-my-voice");
    if (playMyVoiceBtn) {
      this._on(playMyVoiceBtn, "click", () => {
        this.playWholeBookVoice();
      });
    }

    // 
    const playKaraokeBtn = mainEl.querySelector("#btn-play-karaoke");
    if (playKaraokeBtn) {
      this._on(playKaraokeBtn, "click", () => {
        soundAndFX.playPop();
        this.playKaraoke(page, mainEl);
      });
    }

    //  0 
    if (soundAndFX && soundAndFX.audioCtx && page) {
      import("../utils/neuralVoice.js").then((m) => {
        const nv = m.neuralVoice || m.default;
        if (nv && typeof nv.prefetch === "function") {
          if (page.text) nv.prefetch(page.text, soundAndFX.audioCtx, "gentle");
          const chars = [...new Set((page.text || "").replace(/[^\u4e00-\u9fa5]/g, ""))];
          chars.forEach((c) => nv.prefetch(c, soundAndFX.audioCtx));
        }
      }).catch(() => {});
    }

    // 
    mainEl.querySelectorAll(".karaoke-char").forEach((span) => {
      this._on(span, "click", () => {
        const char = span.dataset.char;
        const isTarget = span.dataset.target === "1";
        soundAndFX.playPop();
        soundAndFX.speakPriority(char, { kind: "char", priority: 1 });
        span.classList.add("bg-amber-300", "scale-125");
        setTimeout(() => span.classList.remove("bg-amber-300", "scale-125"), 400);

        if (isTarget) {
          this._timeout(() => this.openCharPopover(char), 250);
        }
      });
    });

    // 
    mainEl.querySelectorAll(".target-char-pill").forEach((pill) => {
      this._on(pill, "click", () => {
        const char = pill.dataset.char;
        soundAndFX.playPop();
        soundAndFX.speakPriority(char, { kind: "char", priority: 1 });
        this.openCharPopover(char);
      });
    });

    //  ( + )
    const allHotspotKeys = (book.pages || []).flatMap((p, pIdx) => (p.interactions || p.hotspots || []).map((_, hIdx) => `${pIdx}_${hIdx}`));
    mainEl.querySelectorAll(".hotspot-trigger-btn").forEach((btn, hIdx) => {
      this._on(btn, "click", (e) => {
        e.stopPropagation();
        const label = btn.dataset.label || "";
        const key = `${this.currentPageIndex}_${hIdx}`;

        if (!this.discoveredHotspots[book.id]) {
          this.discoveredHotspots[book.id] = [];
        }
        const list = this.discoveredHotspots[book.id];
        const isNew = !list.includes(key);
        if (isNew) {
          list.push(key);
          this._saveProgress();
          ebbinghausManager.addCoins(2);
          ebbinghausManager.save();
        }

        soundAndFX.playSuccessSound();
        soundAndFX.triggerConfetti(this.container);
        soundAndFX.speakPriority(label, { kind: "sentence", emotion: "excited" });
        showGameToast(this.container, isNew ? `${label} (+2)` : `${label}`, "success");

        const badge = mainEl.querySelector("#hotspot-count-badge");
        if (badge) {
          badge.textContent = `${list.length}/${allHotspotKeys.length}`;
        }
      });
    });

    // 
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
          // 
          this.isQuizMode = true;
          this.currentQuizStage = 1;
          this.quizAnswered = false;
          this.render();
        }
      });
    }

    // 
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
    window.addEventListener("keydown", keyHandler);
    this._addCleanup(() => window.removeEventListener("keydown", keyHandler));
  }

  // ----------------------------------------------------
  // 4.  ()
  // ----------------------------------------------------
  openCharPopover(charStr) {
    if (this.isCharPopoverOpen) return;
    this.isCharPopoverOpen = true;

    // 
    const charData = CHARACTER_DATABASE.find((c) => c.char === charStr) || {
      char: charStr,
      pinyin: "zì",
      words: [{ word: charStr, pinyin: "", mean: "" }],
      originStory: "",
      exampleSentence: `“${charStr}”`,
      strokes: [
        { type: "", start: [20, 50], end: [80, 50] }
      ]
    };

    const overlay = document.createElement("div");
    overlay.id = "char-popover-overlay";
    overlay.style.zIndex = "9999";
    overlay.className = "fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in";
    overlay.innerHTML = `
      <div class="relative w-full max-w-lg bg-gradient-to-b from-[#FFFDF8] to-[#FFF6E5] rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-300 flex flex-col items-center select-none animate-scale-up">
        
        <!--  -->
        <button id="btn-close-popover" class="absolute -top-3.5 -right-3.5 w-10 h-10 rounded-full bg-white text-gray-800 font-extrabold text-base flex items-center justify-center shadow-xl hover:bg-gray-100 active:scale-95 cursor-pointer border-2 border-amber-200">
          <span class="font-sans font-bold leading-none">X</span>
        </button>

        <!--  -->
        <div class="flex items-center gap-2 mb-4">
          <span class="flex items-center">${GAME_ICONS.sparkle("w-6 h-6")}</span>
          <h3 class="text-lg font-black text-amber-950"> · </h3>
        </div>

        <div class="w-full flex flex-col sm:flex-row items-center gap-6 mb-4">
          
          <!--  -->
          <div class="w-36 h-36 bg-red-50/70 border-4 border-red-500 rounded-3xl relative flex flex-col items-center justify-center flex-shrink-0 shadow-md">
            <!--  -->
            <div class="absolute inset-0 border-t-2 border-dashed border-red-300 top-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div class="absolute inset-0 border-l-2 border-dashed border-red-300 left-1/2 -translate-x-1/2 pointer-events-none"></div>
            <div class="absolute top-2 text-xs font-black text-red-600">${charData.pinyin}</div>
            <span class="text-6xl font-black text-red-900 font-serif relative z-10">${charData.char}</span>
          </div>

          <!--  -->
          <div class="flex-1 flex flex-col gap-2 w-full text-left">
            <div class="bg-white/80 p-3 rounded-2xl border border-amber-200">
              <span class="text-[11px] font-black text-amber-800/70 block mb-1"></span>
              <div class="flex flex-wrap gap-1.5">
                ${(charData.words || []).slice(0, 3).map(w => `
                  <span class="bg-amber-100 text-orange-900 text-xs font-black px-2.5 py-1 rounded-xl border border-amber-300/60">
                    ${w.word}
                  </span>
                `).join("")}
              </div>
            </div>

            <div class="bg-white/80 p-3 rounded-2xl border border-amber-200">
              <span class="text-[11px] font-black text-amber-800/70 block mb-1"></span>
              <p class="text-xs text-amber-950 font-semibold leading-relaxed line-clamp-2">
                ${charData.originStory || charData.evolution || ""}
              </p>
            </div>
          </div>

        </div>

        <!--  -->
        <div class="w-full bg-amber-100/60 p-3 rounded-2xl border border-amber-200/80 mb-5 text-left">
          <span class="text-[11px] font-black text-amber-800/80 block mb-0.5"></span>
          <p class="text-xs text-amber-950 font-bold">${charData.exampleSentence || `“${charData.char}”`}</p>
        </div>

        <!--  -->
        <div class="w-full flex items-center justify-center gap-4">
          <button id="btn-popover-speak" class="btn-game-orange text-white font-black text-xs px-8 py-3 rounded-full shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.speaker("w-4 h-4")}</span>
            <span>“${charData.char}”</span>
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

    closeBtn.addEventListener("click", closePopover);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closePopover();
    });

    const speakBtn = overlay.querySelector("#btn-popover-speak");
    speakBtn.addEventListener("click", () => {
      soundAndFX.playPop();
      soundAndFX.speakPriority(charData.char, { kind: "char", priority: 1 });
    });
  }

  // ----------------------------------------------------
  // 5.  (/)
  // ----------------------------------------------------
  openCatalogDrawer(book) {
    if (this.isCatalogOpen) return;
    this.isCatalogOpen = true;

    const overlay = document.createElement("div");
    overlay.id = "book-catalog-drawer-overlay";
    overlay.style.zIndex = "9999";
    overlay.className = "fixed inset-0 bg-black/35 backdrop-blur-[2px] flex flex-col justify-end select-none animate-fade-in";
    overlay.innerHTML = `
      <!--  () -->
      <div id="catalog-backdrop-dismiss" class="flex-1 w-full cursor-pointer"></div>

      <!--  (Floating Filmstrip Deck) -->
      <div class="relative w-full max-w-5xl mx-auto bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.28)] border-t-4 border-x-4 border-amber-300 p-4 sm:p-5 flex flex-col gap-3 animate-slide-up">
        
        <!--  -->
        <div class="flex items-center justify-between pb-2.5 border-b border-amber-200">
          <div class="flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.book("w-5 h-5 text-amber-800")}</span>
            <h3 class="text-sm sm:text-base font-black text-amber-950">${book.title}</h3>
            <span class="text-[11px] font-black text-orange-600 bg-orange-100/90 px-2 py-0.5 rounded-full border border-orange-200">
               ${book.pages.length}  · 
            </span>
          </div>
          
          <button id="btn-close-catalog" class="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95 border border-amber-300">
            <span></span>
            <span class="font-sans font-bold leading-none">X</span>
          </button>
        </div>

        <!--  (Horizontal Filmstrip) -->
        <div id="catalog-filmstrip-scroll" class="w-full overflow-x-auto no-scrollbar py-2 flex items-stretch gap-3 sm:gap-4">
          ${book.pages.map((p, idx) => {
            const isCurrent = idx === this.currentPageIndex;
            return `
              <div class="catalog-page-card group w-36 sm:w-44 shrink-0 rounded-2xl border-2 transition-all cursor-pointer p-2 flex flex-col justify-between ${
                isCurrent
                  ? "bg-amber-50 border-orange-500 shadow-lg ring-4 ring-orange-300/80 scale-[1.03]"
                  : "bg-white border-amber-200/90 hover:border-orange-400 hover:shadow-md hover:scale-[1.02]"
              }" data-page-index="${idx}">
                
                <!--  -->
                <div class="relative w-full aspect-video rounded-xl overflow-hidden bg-amber-100 flex-shrink-0 border border-amber-200 shadow-inner">
                  <img src="${p.image}" alt="${idx + 1}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  
                  <!--  -->
                  <div class="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                     ${idx + 1} 
                  </div>

                  <!--  -->
                  ${isCurrent ? `
                    <div class="absolute bottom-1.5 right-1.5 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow flex items-center gap-0.5 animate-pulse">
                      <span class="flex items-center">${GAME_ICONS.sparkle("w-2.5 h-2.5")}</span>
                      <span></span>
                    </div>
                  ` : ''}
                </div>

                <!--  -->
                <div class="w-full mt-2 overflow-hidden">
                  <p class="text-[11px] font-bold ${isCurrent ? "text-orange-700 font-black" : "text-amber-950/80"} truncate">
                    ${p.text || ` ${idx + 1} `}
                  </p>
                </div>

              </div>
            `;
          }).join("")}
        </div>

      </div>
    `;

    document.body.appendChild(overlay);

    // 
    setTimeout(() => {
      const activeCard = overlay.querySelector(`.catalog-page-card[data-page-index="${this.currentPageIndex}"]`);
      if (activeCard) {
        activeCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }, 50);

    const closeDrawer = () => {
      this.isCatalogOpen = false;
      overlay.remove();
    };

    overlay.querySelector("#btn-close-catalog")?.addEventListener("click", closeDrawer);
    overlay.querySelector("#catalog-backdrop-dismiss")?.addEventListener("click", closeDrawer);

    overlay.querySelectorAll(".catalog-page-card").forEach((card) => {
      card.addEventListener("click", () => {
        const targetIdx = parseInt(card.dataset.pageIndex, 10);
        soundAndFX.playPop();
        this.currentPageIndex = targetIdx;
        this._saveProgress();
        closeDrawer();
        this.render();
      });
    });
  }

  // ----------------------------------------------------
  // 6. 
  // ----------------------------------------------------
  openUserVoiceModal(page) {
    if (this.isVoiceModalOpen) return;
    this.isVoiceModalOpen = true;

    const overlay = document.createElement("div");
    overlay.id = "user-voice-modal-overlay";
    overlay.style.zIndex = "9999";
    overlay.className = "fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in";
    overlay.innerHTML = `
      <div class="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
        
        <button id="btn-close-voice-modal" class="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white text-gray-800 font-extrabold text-base flex items-center justify-center shadow-xl hover:bg-gray-100 active:scale-95 cursor-pointer border-2 border-amber-200">
          <span class="font-sans font-bold text-base leading-none">X</span>
        </button>

        <div class="flex items-center gap-2 mb-2">
          <span class="flex items-center">${GAME_ICONS.speaker("w-7 h-7")}</span>
          <h3 class="text-xl font-black text-amber-950"> · </h3>
        </div>
        <p class="text-xs text-amber-800/70 mb-4 font-bold"></p>

        <!--  -->
        <div class="w-full bg-white/90 p-4 rounded-2xl border-2 border-amber-200 shadow-inner mb-5">
          <p class="text-lg font-black text-amber-950 leading-relaxed">${page.text}</p>
        </div>

        <!--  -->
        <div class="relative w-28 h-28 mb-4 flex items-center justify-center">
          <div id="voice-glow-bg" class="absolute inset-0 rounded-full bg-rose-400/30 blur-xl opacity-0 transition-opacity"></div>
          <button id="btn-start-record" class="relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 to-red-500 text-white shadow-2xl flex flex-col items-center justify-center active:scale-90 transition-all cursor-pointer border-4 border-white">
            <span class="flex items-center mb-1">${GAME_ICONS.speaker("w-8 h-8")}</span>
            <span id="record-btn-label" class="text-[11px] font-black"></span>
          </button>
        </div>

        <!--  -->
        <div id="voice-status-text" class="text-xs font-bold text-amber-900 mb-4 h-6"></div>

        <!--  -->
        <button id="btn-playback-voice" class="hidden bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-6 py-2.5 rounded-full shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer transition-all">
          <span class="flex items-center">${GAME_ICONS.speaker("w-4 h-4")}</span>
          <span></span>
        </button>

      </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector("#btn-close-voice-modal");
    const startRecordBtn = overlay.querySelector("#btn-start-record");
    const recordBtnLabel = overlay.querySelector("#record-btn-label");
    const statusText = overlay.querySelector("#voice-status-text");
    const playbackBtn = overlay.querySelector("#btn-playback-voice");

    let isRecording = false;

    const closeModal = () => {
      this.isVoiceModalOpen = false;
      overlay.remove();
    };

    closeBtn.addEventListener("click", closeModal);

    let activeAudioUrl = null;

    startRecordBtn.addEventListener("click", async () => {
      if (isRecording) {
        // 
        isRecording = false;
        try {
          await pronunciationEval.stopAndEvaluate();
        } catch {}
        return;
      }
      isRecording = true;
      soundAndFX.playPop();
      statusText.textContent = "... ";
      recordBtnLabel.textContent = "()";
      
      startRecordBtn.classList.add("bg-rose-500", "animate-pulse");
      const glowBg = overlay.querySelector("#voice-glow-bg");
      if (glowBg) {
        glowBg.classList.replace("opacity-0", "opacity-100");
        glowBg.classList.add("animate-pulse");
      }

      try {
        await pronunciationEval.startEvaluation({
          text: page.text,
          mode: "sentence"
        });

        // 4 
        setTimeout(async () => {
          if (!isRecording) return;
          isRecording = false;
          try {
            const result = await pronunciationEval.stopAndEvaluate();
            if (!this.isVoiceModalOpen) return;

            activeAudioUrl = result.audioUrl || null;

            //  URL 
            if (!this.bookRecordings[this.currentBook.id]) {
              this.bookRecordings[this.currentBook.id] = {};
            }
            const score = result.score || 0;
            this.bookRecordings[this.currentBook.id][this.currentPageIndex] = {
              score: score,
              audioUrl: activeAudioUrl,
              timestamp: Date.now()
            };
            this._saveProgress();
            
            if (score >= 75) {
              ebbinghausManager.addCoins(5);
              ebbinghausManager.save();
              soundAndFX.playSuccessSound();
              soundAndFX.triggerConfetti(this.container);
              statusText.innerHTML = `<span class="text-emerald-600 font-black text-sm"> ${score}  5 </span>`;
            } else if (score >= 40) {
              ebbinghausManager.addCoins(2);
              ebbinghausManager.save();
              soundAndFX.playSuccessSound();
              statusText.innerHTML = `<span class="text-amber-600 font-black text-sm"> ${score}  2 </span>`;
            } else {
              soundAndFX.playSoftError();
              statusText.innerHTML = `<span class="text-rose-500 font-black text-sm"> ${score} </span>`;
            }
            recordBtnLabel.textContent = "";
            startRecordBtn.classList.remove("bg-rose-500", "animate-pulse");
            if (glowBg) {
              glowBg.classList.replace("opacity-100", "opacity-0");
              glowBg.classList.remove("animate-pulse");
            }
            playbackBtn.classList.remove("hidden");
          } catch (e) {}
        }, 4000);
      } catch (err) {
        if (!this.isVoiceModalOpen) return;
        statusText.textContent = "";
        recordBtnLabel.textContent = "";
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
      if (activeAudioUrl) {
        const audio = new Audio(activeAudioUrl);
        playbackBtn.classList.add("ring-4", "ring-emerald-300", "scale-105");
        audio.onended = () => playbackBtn.classList.remove("ring-4", "ring-emerald-300", "scale-105");
        audio.onerror = () => {
          playbackBtn.classList.remove("ring-4", "ring-emerald-300", "scale-105");
          soundAndFX.speakPriority(page.text, { kind: "sentence", emotion: "gentle" });
        };
        audio.play().catch(() => {
          soundAndFX.speakPriority(page.text, { kind: "sentence", emotion: "gentle" });
        });
      } else {
        soundAndFX.speakPriority(page.text, { kind: "sentence", emotion: "gentle" });
      }
    });
  }

  // ----------------------------------------------------
  // 7.  ( + )
  // ----------------------------------------------------
  renderQuiz() {
    const book = this.currentBook;
    const targetChar = (book.targetChars || [""])[0];

    // Stage 1: 
    const stage1Question = {
      title: " 1  · ",
      question: `${book.title}`,
      highlightChar: targetChar,
      options: [
        `“${targetChar}”`,
        ``,
        ``
      ],
      correctIndex: 0
    };

    // Stage 2: 
    const stage2Quiz = Array.isArray(book.quiz) ? book.quiz[0] : (book.quiz || {
      question: `${book.title}`,
      options: ["", "", ""],
      correctIndex: 0
    });

    const activeQuiz = this.currentQuizStage === 1 ? stage1Question : {
      title: " 2  · ",
      question: stage2Quiz.question,
      options: stage2Quiz.options,
      correctIndex: stage2Quiz.correctIndex !== undefined ? stage2Quiz.correctIndex : 0
    };

    const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
      activeMode: "books",
      heading: ` · ${book.title}`
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

          this._timeout(() => {
            if (this.currentQuizStage === 1) {
              this.currentQuizStage = 2;
              this.quizAnswered = false;
              this.render();
            } else {
              // 2 
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
  // 8.  ·  ()
  // ----------------------------------------------------
  renderCertificate() {
    const book = this.currentBook;
    const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
      activeMode: "books",
      heading: ` · ${book.title}`
    });
    this._addCleanup(destroyShell);

    soundAndFX.playVictoryFanfare();
    soundAndFX.triggerConfetti(this.container);
    soundAndFX.triggerCoinFly(this.container);

    mainEl.innerHTML = `
      <div class="relative w-full max-w-2xl mx-auto flex flex-col items-center justify-center pt-16 sm:pt-20 pb-8 px-4 select-none animate-scale-up">
        
        <!--  -->
        <div class="relative w-full bg-gradient-to-b from-[#FFFDF5] via-[#FFF8E7] to-[#FFF3D6] rounded-3xl p-8 sm:p-10 shadow-2xl border-8 border-amber-400 flex flex-col items-center text-center">
          
          <!--  -->
          <div class="absolute -top-7 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-2 rounded-full border-4 border-white shadow-xl flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.crown("w-6 h-6")}</span>
            <span class="text-sm font-black text-amber-950"> · </span>
          </div>

          <div class="mt-4 mb-2 flex items-center justify-center">
            ${GAME_ICONS.trophy("w-20 h-20")}
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-amber-950 mb-1">
            ${book.title}
          </h2>
          <p class="text-xs text-amber-800/80 font-bold mb-5">
             · 
          </p>

          <!-- 3  -->
          <div class="flex items-center gap-2 mb-6">
            <span class="flex items-center transform hover:scale-125 transition-transform">${GAME_ICONS.star("w-8 h-8", false)}</span>
            <span class="flex items-center transform hover:scale-125 transition-transform scale-125">${GAME_ICONS.star("w-8 h-8", false)}</span>
            <span class="flex items-center transform hover:scale-125 transition-transform">${GAME_ICONS.star("w-8 h-8", false)}</span>
          </div>

          <!--  -->
          <div class="w-full bg-white/90 p-4 rounded-2xl border-2 border-amber-200/90 mb-6 text-center">
            <span class="text-xs font-black text-amber-900 block mb-2"></span>
            <div class="flex flex-wrap justify-center gap-2">
              ${(book.targetChars || ["", "", ""]).map(c => `
                <div class="w-10 h-10 bg-red-50 border-2 border-red-400 rounded-xl flex items-center justify-center font-serif text-xl font-black text-red-900 shadow-sm">
                  ${c}
                </div>
              `).join("")}
            </div>
          </div>

          <!--  -->
          <div class="candy-pill rounded-full px-6 py-2 mb-6 text-sm text-yellow-300 font-black flex items-center gap-4 border-2 border-yellow-300 shadow-xl">
            <span class="flex items-center gap-1.5"><span class="flex items-center">${GAME_ICONS.coin("w-5 h-5")}</span> +15 </span>
            <span class="flex items-center gap-1.5"><span class="flex items-center">${GAME_ICONS.star("w-5 h-5", true)}</span> +5 </span>
          </div>

          <!--  -->
          <div class="flex items-center gap-4 flex-wrap justify-center">
            <button id="btn-cert-replay" class="bg-white hover:bg-amber-50 text-amber-900 font-black text-xs px-6 py-3 rounded-full shadow-lg border-2 border-amber-200 active:scale-95 cursor-pointer">
              
            </button>
            <button id="btn-cert-back-shelf" class="btn-game-orange text-white font-black text-xs px-8 py-3 rounded-full shadow-xl active:scale-95 cursor-pointer">
              
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
  // 9. OK ( + )
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

    // 
    spans.forEach((s) => s.classList.remove("bg-amber-300", "text-amber-950", "scale-110", "ring-4", "ring-amber-200/90", "shadow-md"));

    // 
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

        //  1.5 
        if (this.isAutoPlay && this.currentBook) {
          this.autoPlayTimer = this._timeout(() => {
            if (!this.isAutoPlay || !this.currentBook || this.karaokeSessionId !== sessionId) return;
            if (this.currentPageIndex < this.currentBook.pages.length - 1) {
              this.currentPageIndex++;
              this._saveProgress();
              this.render();
            } else {
              // 
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

  // ----------------------------------------------------
  // 10.  ()
  // ----------------------------------------------------
  playWholeBookVoice() {
    if (!this.currentBook) return;
    const recordings = this.bookRecordings[this.currentBook.id] || {};
    const recordedPageIndices = Object.keys(recordings).map(Number).sort((a, b) => a - b);
    if (recordedPageIndices.length === 0) {
      showGameToast(this.container, "", "info");
      return;
    }

    soundAndFX.playPop();
    showGameToast(this.container, "", "success");

    let playIdx = 0;
    const playNext = () => {
      if (!this.currentBook) return;
      if (playIdx >= recordedPageIndices.length) {
        showGameToast(this.container, "", "success");
        soundAndFX.playVictoryFanfare();
        return;
      }
      const pageIndex = recordedPageIndices[playIdx];
      this.currentPageIndex = pageIndex;
      this._saveProgress();
      this.render();

      const page = this.currentBook.pages[pageIndex];
      const rec = recordings[pageIndex];
      if (rec && rec.audioUrl) {
        const audio = new Audio(rec.audioUrl);
        audio.onended = () => {
          playIdx++;
          this._timeout(playNext, 1200);
        };
        audio.onerror = () => {
          soundAndFX.speakPriority(page.text, {
            kind: "sentence",
            emotion: "gentle",
            onEnd: () => {
              playIdx++;
              this._timeout(playNext, 1200);
            }
          });
        };
        audio.play().catch(() => {
          soundAndFX.speakPriority(page.text, {
            kind: "sentence",
            emotion: "gentle",
            onEnd: () => {
              playIdx++;
              this._timeout(playNext, 1200);
            }
          });
        });
      } else {
        soundAndFX.speakPriority(page.text, {
          kind: "sentence",
          emotion: "gentle",
          onEnd: () => {
            playIdx++;
            this._timeout(playNext, 1200);
          }
        });
      }
    };
    playNext();
  }
}

