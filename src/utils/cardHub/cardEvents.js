/** CardModule — events, stroke demo, slideshow */
import { CHARACTER_DATABASE } from "../../data/characters.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { soundAndFX } from "../soundEngine.js";
import { showGameToast } from "../../components/SharedShell.js";
import { GAME_ICONS } from "../gameIcons.js";
import { printWorksheet } from "../worksheetGenerator.js";
import { openMorphTheater } from "../morphEngine.js";
import { getCharPictogramUrl } from "../pictogramRenderer.js";
import { SEARCH_DEBOUNCE_MS, SCROLL_LOAD_THRESHOLD, RADICAL_ORIGINS } from "./cardConstants.js";

export function bindEvents(mainEl) {
  // 沉浸式闪卡轮播
  const startSlideshowBtn = mainEl.querySelector("#btn-start-slideshow");
  if (startSlideshowBtn) {
    this._on(startSlideshowBtn, "click", () => {
      soundAndFX.playPop();
      const chars = this.getFilteredList();
      if (chars.length === 0) {
        showGameToast(this.container, "当前筛选条件下没有字卡哦！", "info");
        return;
      }
      this.openFlashcardSlideshowModal(chars);
    });
  }

  // 搜索框防抖处理
  const searchInput = mainEl.querySelector("#card-search-input");
  if (searchInput) {
    this._on(searchInput, "input", (e) => {
      const val = e.target.value;
      if (this._debounceTimer) clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => {
        this.searchQuery = val;
        this.displayCount = this.pageSize;
        this._savedScrollTop = 0;
        this.render();
      }, SEARCH_DEBOUNCE_MS);
    });
  }

  // 阶段筛选
  mainEl.querySelectorAll(".filter-stage-btn").forEach((btn) => {
    this._on(btn, "click", () => {
      this.currentStage = btn.dataset.stage;
      this.displayCount = this.pageSize;
      this._savedScrollTop = 0;
      soundAndFX.playPop();
      this.render();
    });
  });

  // 掌握状态筛选
  mainEl.querySelectorAll(".filter-status-btn").forEach((btn) => {
    this._on(btn, "click", () => {
      this.currentFilter = btn.dataset.key;
      this.displayCount = this.pageSize;
      this._savedScrollTop = 0;
      soundAndFX.playPop();
      this.render();
    });
  });

  // 部首专项筛选
  mainEl.querySelectorAll(".radical-tag-btn").forEach((btn) => {
    this._on(btn, "click", () => {
      this.selectedRadical = btn.dataset.rad;
      this.displayCount = this.pageSize;
      this._savedScrollTop = 0;
      soundAndFX.playPop();
      this.render();
    });
  });

  // 听部首解说
  const speakRadBtn = mainEl.querySelector("#btn-speak-radical-origin");
  if (speakRadBtn) {
    this._on(speakRadBtn, "click", () => {
      if (RADICAL_ORIGINS[this.selectedRadical]) {
        soundAndFX.speakPriority(RADICAL_ORIGINS[this.selectedRadical] || "", { kind: "sentence", priority: 1 });
      }
    });
  }

  // 加载更多字卡
  const loadMoreBtn = mainEl.querySelector("#btn-load-more-cards");
  if (loadMoreBtn) {
    this._on(loadMoreBtn, "click", () => {
      soundAndFX.playPop();
      this.displayCount += this.pageSize;
      this.render();
    });
  }

  // 滚动自动增量加载 (Infinite Scroll)
  const viewport = mainEl.querySelector("#cards-page-viewport");
  if (viewport) {
    this._on(viewport, "scroll", () => {
      if (viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - SCROLL_LOAD_THRESHOLD) {
        const allFiltered = this.getFilteredList();
        if (this.displayCount < allFiltered.length) {
          this.displayCount += this.pageSize;
          this.render();
        }
      }
    }, { passive: true });
  }

  // 点击字卡弹窗 3D 卡片
  mainEl.querySelectorAll(".char-card").forEach((card) => {
    this._on(card, "click", () => {
      const charId = card.dataset.charId;
      this.selectedCard = CHARACTER_DATABASE.find((c) => c.id === charId);
      this.isCardFlipped = false;
      soundAndFX.playCardFlip();
      if (this.selectedCard?.char) {
        soundAndFX.speakPriority?.(`${this.selectedCard.char}，${this.selectedCard.pinyin || ""}`, { kind: "char", priority: 1 });
      }
      this.render();
    });
  });

  // 弹窗关闭与翻转
  const modalBackdrop = mainEl.querySelector("#card-modal-backdrop");
  const closeBtn = mainEl.querySelector("#btn-close-modal");
  const flipCard = mainEl.querySelector("#flip-card");

  if (closeBtn) {
    this._on(closeBtn, "click", () => {
      soundAndFX.stopSpeaking();
      soundAndFX.playPop();
      this.selectedCard = null;
      this.render();
    });
  }

  if (modalBackdrop) {
    this._on(modalBackdrop, "click", (e) => {
      if (e.target === modalBackdrop) {
        soundAndFX.stopSpeaking();
        this.selectedCard = null;
        this.render();
      }
    });
  }

  if (flipCard) {
    this._on(flipCard, "click", () => {
      soundAndFX.playCardFlip();
      this.isCardFlipped = !this.isCardFlipped;
      this.render();
    });
  }

  // 难字本切换
  const toggleDiffBtn = mainEl.querySelector("#btn-toggle-difficult");
  if (toggleDiffBtn) {
    this._on(toggleDiffBtn, "click", (e) => {
      e.stopPropagation();
      const charId = toggleDiffBtn.dataset.charId;
      const isDiff = ebbinghausManager.isDifficultChar(charId);
      if (isDiff) {
        ebbinghausManager.removeDifficultChar(charId);
        showGameToast(this.container, "已从难字本中移出！", "info");
      } else {
        ebbinghausManager.addDifficultChar(charId);
        showGameToast(this.container, "已加入难字本，复习时将重点巩固！", "success");
      }
      soundAndFX.playPop();
      this.render();
    });
  }

  // 弹窗中发音按钮
  const speakCharBtn = mainEl.querySelector("#btn-modal-speak-char");
  if (speakCharBtn) {
    this._on(speakCharBtn, "click", (e) => {
      e.stopPropagation();
      if (this.selectedCard) {
        soundAndFX.speakPriority(`${this.selectedCard.char}，${this.selectedCard.pinyin}`, { kind: "char", priority: 1 });
      }
    });
  }

  // 单字田字格字帖打印按钮
  const printCharBtn = mainEl.querySelector("#btn-modal-print-char");
  if (printCharBtn) {
    this._on(printCharBtn, "click", (e) => {
      e.stopPropagation();
      if (this.selectedCard) {
        soundAndFX.playPop();
        printWorksheet([this.selectedCard], `凯茜识字 · 【${this.selectedCard.char}】字专项田字格练字帖`);
      }
    });
  }

  // 象形字源蜕变微剧场
  const morphTheaterBtn = mainEl.querySelector("#btn-modal-morph-theater");
  if (morphTheaterBtn) {
    this._on(morphTheaterBtn, "click", (e) => {
      e.stopPropagation();
      if (this.selectedCard) {
        soundAndFX.playPop();
        openMorphTheater(this.selectedCard);
      }
    });
  }

  // 笔顺演示按钮
  const demoStrokesBtn = mainEl.querySelector("#btn-modal-demo-strokes");
  if (demoStrokesBtn) {
    this._on(demoStrokesBtn, "click", (e) => {
      e.stopPropagation();
      if (this.selectedCard) {
        soundAndFX.playPop();
        this.openStrokeDemoModal(this.selectedCard);
      }
    });
  }

  // 弹窗背面词组点击发音
  mainEl.querySelectorAll(".card-modal-word-btn").forEach((btn) => {
    this._on(btn, "click", (e) => {
      e.stopPropagation();
      const word = btn.dataset.word;
      soundAndFX.speakPriority(word, { kind: "word", priority: 1 });
      btn.classList.add("ring-2", "ring-orange-400");
      this._timeout(() => btn.classList.remove("ring-2", "ring-orange-400"), 400);
    });
  });

  // 弹窗背面例句点击发音
  const sentenceBox = mainEl.querySelector(".card-modal-sentence");
  if (sentenceBox) {
    this._on(sentenceBox, "click", (e) => {
      e.stopPropagation();
      if (this.selectedCard && this.selectedCard.sentence) {
        soundAndFX.speakPriority(this.selectedCard.sentence, { kind: "sentence", emotion: "gentle" });
        sentenceBox.classList.add("ring-2", "ring-orange-400");
        this._timeout(() => sentenceBox.classList.remove("ring-2", "ring-orange-400"), 600);
      }
    });
  }

  // 恢复之前的滚动位置，防止因增量加载或弹窗操作导致跳顶
  const newViewport = mainEl.querySelector("#cards-page-viewport");
  if (newViewport && this._savedScrollTop > 0) {
    newViewport.scrollTop = this._savedScrollTop;
  }
}

export function openStrokeDemoModal(c) {
  const overlay = document.createElement("div");
  overlay.id = "stroke-demo-overlay";
  overlay.className = "fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in";
  overlay.innerHTML = `
    <div class="relative w-full max-w-md sm:max-w-lg bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-8 shadow-2xl border-4 border-amber-300 flex flex-col items-center select-none">
      <button id="btn-close-stroke-demo" class="absolute -top-14 right-0 w-11 h-11 rounded-full bg-white text-gray-800 font-extrabold text-xl flex items-center justify-center shadow-2xl hover:bg-gray-100 active:scale-90 cursor-pointer border-2 border-amber-300" title="关闭" data-speak="关闭笔顺演示">
        ${GAME_ICONS.back("w-6 h-6")}
      </button>

      <div class="flex items-center justify-between w-full mb-4 pb-3 border-b border-amber-200">
        <span class="text-base sm:text-lg font-black text-amber-950 flex items-center gap-2">
          <span class="flex items-center">${GAME_ICONS.brush("w-6 h-6")}</span>
          <span>标准笔顺演示 · “${c.char}” (${c.pinyin})</span>
        </span>
        <span id="demo-stroke-name" class="text-xs sm:text-sm font-black bg-amber-200 text-amber-950 px-3 py-1 rounded-full shadow-sm">准备起笔</span>
      </div>

      <div class="relative w-72 h-72 sm:w-80 sm:h-80 bg-amber-50 rounded-3xl border-4 border-amber-400 shadow-2xl overflow-hidden flex items-center justify-center my-3">
        <canvas id="stroke-demo-canvas" width="320" height="320" class="w-full h-full"></canvas>
      </div>

      <div class="flex items-center gap-3 mt-4 w-full justify-center">
        <button id="btn-replay-stroke-demo" class="btn-game-orange text-white text-sm font-black px-8 py-3 rounded-full shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer" data-speak="再看一遍笔顺">
          <span class="flex items-center">${GAME_ICONS.brush("w-5 h-5")}</span>
          <span>重新演示</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector("#btn-close-stroke-demo");
  const replayBtn = overlay.querySelector("#btn-replay-stroke-demo");
  const canvas = overlay.querySelector("#stroke-demo-canvas");
  const strokeNameEl = overlay.querySelector("#demo-stroke-name");

  let isPlaying = false;
  let cancelCurrentAnim = false;

  const playDemo = async () => {
    if (isPlaying) return;
    isPlaying = true;
    cancelCurrentAnim = false;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    const drawGrid = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#fffdf7";
      ctx.fillRect(0, 0, w, h);
      // 田字格虚线
      ctx.strokeStyle = "#fed7aa";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
      ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
      ctx.moveTo(0, 0); ctx.lineTo(w, h);
      ctx.moveTo(w, 0); ctx.lineTo(0, h);
      ctx.stroke();
      ctx.setLineDash([]);
      // 边框
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, w, h);
    };

    const strokes = c.strokes || [];
    drawGrid();

    // 先画出浅灰色字底
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.font = `bold ${w * 0.75}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(c.char, w / 2, h / 2 + 10);

    // 依次绘制笔画
    for (let i = 0; i < strokes.length; i++) {
      if (cancelCurrentAnim) break;
      const s = strokes[i];
      if (strokeNameEl) strokeNameEl.textContent = `第 ${i + 1} 笔：${s.name}`;
      soundAndFX.playStrokeSound();
      soundAndFX.speakPriority(s.name, { kind: "char", priority: 1 });

      const startX = (s.start.x / 100) * w;
      const startY = (s.start.y / 100) * h;
      const endX = (s.end.x / 100) * w;
      const endY = (s.end.y / 100) * h;
      const cornerX = s.corner ? (s.corner.x / 100) * w : null;
      const cornerY = s.corner ? (s.corner.y / 100) * h : null;

      // 动画插值绘制该笔画
      await new Promise((resolve) => {
        let progress = 0;
        const animStep = () => {
          if (cancelCurrentAnim) { resolve(); return; }
          progress += 0.08;
          if (progress > 1) progress = 1;

          ctx.strokeStyle = "#ea580c";
          ctx.lineWidth = 12;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(startX, startY);

          if (cornerX !== null && cornerY !== null) {
            if (progress <= 0.5) {
              const segP = progress / 0.5;
              ctx.lineTo(startX + (cornerX - startX) * segP, startY + (cornerY - startY) * segP);
            } else {
              ctx.lineTo(cornerX, cornerY);
              const segP = (progress - 0.5) / 0.5;
              ctx.lineTo(cornerX + (endX - cornerX) * segP, cornerY + (endY - cornerY) * segP);
            }
          } else {
            ctx.lineTo(startX + (endX - startX) * progress, startY + (endY - startY) * progress);
          }
          ctx.stroke();

          if (progress < 1) {
            if (!cancelCurrentAnim) requestAnimationFrame(animStep);
          } else {
            setTimeout(resolve, 400);
          }
        };
        requestAnimationFrame(animStep);
      });
    }

    if (!cancelCurrentAnim) {
      if (strokeNameEl) strokeNameEl.textContent = "演示完成！";
      soundAndFX.playSuccessSound();
    }
    isPlaying = false;
  };

  this._on(closeBtn, "click", () => {
    cancelCurrentAnim = true;
    soundAndFX.stopSpeaking();
    overlay.remove();
  });
  this._on(replayBtn, "click", () => {
    cancelCurrentAnim = true;
    soundAndFX.stopSpeaking();
    setTimeout(playDemo, 100);
  });

  setTimeout(playDemo, 200);
}

export function renderCardDetailModal() {
  const c = this.selectedCard;
  const isDiff = ebbinghausManager.isDifficultChar(c.id);
  const picUrl = getCharPictogramUrl(c.char);

  return `
    <div id="card-modal-backdrop" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in perspective-1000 select-none">
      <div class="relative w-full max-w-md sm:max-w-lg flex flex-col items-center">
        
        <button id="btn-close-modal" class="absolute -top-14 right-0 w-11 h-11 rounded-full bg-white text-gray-800 font-extrabold text-xl flex items-center justify-center shadow-2xl hover:bg-gray-100 active:scale-90 z-50 cursor-pointer border-2 border-amber-300" title="关闭" data-speak="关闭字卡详情">
          ${GAME_ICONS.back("w-6 h-6")}
        </button>

        <div id="flip-card" class="relative w-full h-[460px] sm:h-[480px] cursor-pointer preserve-3d transition-transform duration-500 ease-out ${this.isCardFlipped ? 'rotate-y-180' : ''}">
          
          <div class="absolute inset-0 bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl shadow-2xl border-4 border-amber-300 p-8 flex flex-col justify-between backface-hidden ${this.isCardFlipped ? 'pointer-events-none' : ''}">
            <div class="flex items-center justify-between">
              <span class="text-xs sm:text-sm font-black bg-amber-200 text-amber-950 px-4 py-1.5 rounded-full shadow-sm">${c.radical}部 · ${c.strokeCount || 4}画</span>
              <div class="flex items-center gap-2">
                <button id="btn-modal-print-char" class="flex items-center gap-1.5 bg-rose-200 hover:bg-rose-300 text-rose-950 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black shadow-md active:scale-90 transition-all cursor-pointer" title="打印该字A4田字格字帖" data-speak="打印这个字的字帖">
                  <span class="flex items-center">${GAME_ICONS.print("w-4 h-4 sm:w-5 sm:h-5")}</span>
                  <span>打印字帖</span>
                </button>
                <button id="btn-modal-morph-theater" class="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black shadow-md active:scale-90 transition-all cursor-pointer" title="查看象形字源蜕变动效" data-speak="看象形字源变身">
                  <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4 sm:w-5 sm:h-5")}</span>
                  <span>象形微剧场</span>
                </button>
                <button id="btn-modal-demo-strokes" class="flex items-center gap-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black shadow-md active:scale-90 transition-all cursor-pointer" title="笔顺笔画动画演示" data-speak="看笔顺动画">
                  <span class="flex items-center">${GAME_ICONS.brush("w-4 h-4 sm:w-5 sm:h-5")}</span>
                  <span>笔顺</span>
                </button>
                <button id="btn-modal-speak-char" class="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg text-sm active:scale-90 cursor-pointer" title="朗读">
                  ${GAME_ICONS.speaker("w-5 h-5")}
                </button>
              </div>
            </div>

            <div class="flex flex-col items-center justify-center flex-1 my-3">
              <span class="text-3xl sm:text-4xl font-black text-amber-700 mb-2">${c.pinyin}</span>
              <div class="flex items-center gap-4">
                <span class="text-8xl sm:text-9xl font-black text-amber-950 drop-shadow-md glow-pulse">${c.char}</span>
                ${picUrl ? `
                <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md bg-amber-100 shrink-0">
                  <img src="${picUrl}" alt="${c.char}" class="w-full h-full object-cover select-none pointer-events-none" />
                </div>
                ` : ""}
              </div>
              
              ${c.oracleGlyph ? `
                <div class="mt-3 flex items-center gap-2 bg-amber-200/70 px-4 py-1.5 rounded-full border border-amber-300 shadow-inner">
                  <span class="text-xs text-amber-900 font-black">甲骨文演变:</span>
                  <span class="text-2xl font-black text-amber-950">${c.oracleGlyph}</span>
                </div>
              ` : ""}
            </div>

            <div class="w-full text-center">
              <span class="text-xs text-amber-800 font-bold bg-white/90 px-5 py-1.5 rounded-full shadow-sm animate-pulse border border-amber-200">
                轻触卡片翻转查看字源与常用组词
              </span>
            </div>
          </div>

          <div class="absolute inset-0 bg-gradient-to-b from-orange-50 to-amber-100 rounded-3xl shadow-2xl border-4 border-orange-300 p-6 flex flex-col justify-between backface-hidden rotate-y-180 ${!this.isCardFlipped ? 'pointer-events-none' : ''}">
            <div class="flex items-center justify-between pb-3 border-b border-amber-200">
              <span class="text-sm font-black text-amber-950 flex items-center gap-2">
                <span class="flex items-center">${GAME_ICONS.book("w-5 h-5")}</span>
                <span>常用词组与造句</span>
              </span>
              <span class="text-xs text-orange-600 font-bold bg-orange-100 px-3 py-0.5 rounded-full">已翻转</span>
            </div>

            <div class="flex-1 my-4 flex flex-col justify-around text-left">
              <div>
                <span class="text-xs sm:text-sm font-black text-amber-900 block mb-2">生活词组 (点击朗读)：</span>
                <div class="flex flex-wrap gap-2">
                  ${(c.words || [{ word: `${c.char}子`, pinyin: "" }]).map(w => {
                    const wordText = typeof w === "string" ? w : w.word;
                    return `<button class="card-modal-word-btn bg-white hover:bg-amber-100 text-amber-950 border-2 border-amber-300 text-sm sm:text-base font-black px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5" data-word="${wordText}">
                      <span>${wordText}</span>
                      <span class="text-amber-600">${GAME_ICONS.speaker("w-3.5 h-3.5")}</span>
                    </button>`;
                  }).join("")}
                </div>
              </div>

              <div class="card-modal-sentence bg-white/95 hover:bg-white p-4 rounded-2xl border-2 border-amber-300 text-xs sm:text-sm text-amber-950 font-semibold leading-relaxed cursor-pointer transition-all active:scale-95 shadow-md" title="点击朗读例句">
                <span class="font-black text-orange-600">生活例句：</span>
                ${c.sentence || `${c.char}字天天见，学好汉字乐趣多`}
              </div>
            </div>

            <div class="w-full flex items-center justify-between pt-3 border-t border-amber-200">
              <button id="btn-toggle-difficult" data-char-id="${c.id}" class="text-xs sm:text-sm font-black px-4 py-2 rounded-full shadow-md transition-all cursor-pointer ${
                isDiff ? "bg-rose-500 text-white animate-jelly" : "bg-amber-200 text-amber-950 hover:bg-amber-300"
              }">
                ${isDiff ? "已在难字本" : "+ 加入难字本"}
              </button>
              <span class="text-xs text-gray-500 font-bold animate-pulse">点击返回正面</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;
}

export function openFlashcardSlideshowModal(chars) {
  if (!chars || chars.length === 0) return;

  let currentIndex = 0;
  let isFlipped = false;
  let isAutoPlaying = false;
  let autoPlayTimer = null;

  const overlay = document.createElement("div");
  overlay.id = "flashcard-slideshow-overlay";
  overlay.className = "fixed inset-0 z-[70] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 select-none text-white animate-fade-in";

  document.body.appendChild(overlay);

  const renderCurrentCard = () => {
    const c = chars[currentIndex];
    const isDiff = ebbinghausManager.isDifficultChar(c.id);

    overlay.innerHTML = `
      <header class="w-full max-w-3xl flex items-center justify-between border-b border-white/10 pb-3">
        <div class="flex items-center gap-3">
          <button id="btn-close-slideshow" class="btn-game-wood text-white font-black text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1 cursor-pointer" data-speak="关闭放映">
            <span>退出轮播</span>
          </button>
          <span class="text-xs sm:text-sm font-black text-amber-300">
            第 <b class="text-yellow-300 text-base sm:text-lg">${currentIndex + 1}</b> / ${chars.length} 张字卡
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button id="btn-toggle-autoplay" class="px-3.5 py-1.5 rounded-full text-xs font-black transition-all border ${
            isAutoPlaying
              ? "bg-emerald-500 border-emerald-400 text-white animate-pulse"
              : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
          } cursor-pointer">
            ${isAutoPlaying ? "暂停自动轮播" : "开启 3秒轮播"}
          </button>
        </div>
      </header>

      <main class="flex-1 flex items-center justify-center w-full max-w-lg my-3">
        <div id="slideshow-card-box" class="relative w-full aspect-[4/5] max-h-[460px] preserve-3d transition-transform duration-500 cursor-pointer ${
          isFlipped ? "rotate-y-180" : ""
        }">
          
          <div class="absolute inset-0 bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl shadow-2xl border-4 border-amber-300 p-6 flex flex-col justify-between backface-hidden text-amber-950 ${
            isFlipped ? "pointer-events-none" : ""
          }">
            <div class="flex items-center justify-between">
              <span class="text-xs sm:text-sm font-black bg-amber-200 text-amber-950 px-3.5 py-1 rounded-full shadow-sm">${c.radical}部 · ${c.strokeCount || 4}画</span>
              <button id="btn-slideshow-speak" class="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md active:scale-90 cursor-pointer">
                ${GAME_ICONS.speaker("w-4 h-4")}
              </button>
            </div>

            <div class="flex flex-col items-center justify-center flex-1 my-2">
              <span class="text-3xl sm:text-4xl font-black text-amber-700 mb-1 font-mono">${c.pinyin}</span>
              <div class="flex items-center justify-center gap-4">
                <span class="text-8xl sm:text-9xl font-black text-amber-950 drop-shadow-md font-serif">${c.char}</span>
                ${(() => {
                  const pic = getCharPictogramUrl(c.char);
                  return pic ? `
                    <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md bg-amber-100 shrink-0">
                      <img src="${pic}" alt="${c.char}" class="w-full h-full object-cover select-none pointer-events-none" />
                    </div>
                  ` : "";
                })()}
              </div>
              ${
                c.oracleGlyph
                  ? `<div class="mt-2 text-xs font-bold text-amber-800 bg-amber-200/60 px-3 py-1 rounded-full">甲骨文: ${c.oracleGlyph}</div>`
                  : ""
              }
            </div>

            <div class="text-center">
              <span class="text-[11px] font-bold text-amber-800 bg-white/80 px-4 py-1 rounded-full shadow-sm">
                轻触卡片翻转查看词组造句
              </span>
            </div>
          </div>

          <div class="absolute inset-0 bg-gradient-to-b from-orange-50 to-amber-100 rounded-3xl shadow-2xl border-4 border-orange-300 p-6 flex flex-col justify-between backface-hidden rotate-y-180 text-amber-950 ${
            !isFlipped ? "pointer-events-none" : ""
          }">
            <div class="flex items-center justify-between pb-2 border-b border-amber-200">
              <span class="text-xs sm:text-sm font-black text-amber-950">常用词组与造句</span>
              <span class="text-[10px] text-orange-600 font-bold bg-orange-100 px-2.5 py-0.5 rounded-full">背面</span>
            </div>

            <div class="flex-1 my-3 flex flex-col justify-around text-left">
              <div>
                <span class="text-xs font-black text-amber-900 block mb-1.5">词组推荐：</span>
                <div class="flex flex-wrap gap-2">
                  ${(c.words || [{ word: `${c.char}子`, pinyin: "" }])
                    .map((w) => {
                      const wordText = typeof w === "string" ? w : w.word;
                      return `<button class="slideshow-word-btn bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs sm:text-sm font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 cursor-pointer" data-word="${wordText}">${wordText}</button>`;
                    })
                    .join("")}
                </div>
              </div>

              <div class="bg-white/95 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 leading-relaxed font-semibold">
                <span class="font-black text-orange-600">造句：</span>
                ${c.sentence || `${c.char}字天天见，学好汉字乐趣多`}
              </div>
            </div>

            <div class="text-center">
              <span class="text-[11px] font-bold text-amber-800 bg-white/80 px-4 py-1 rounded-full shadow-sm">
                轻触卡片翻回正面
              </span>
            </div>
          </div>

        </div>
      </main>

      <footer class="w-full max-w-lg flex items-center justify-between gap-2 border-t border-white/10 pt-3">
        <button id="btn-slideshow-prev" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5" ${
          currentIndex === 0 ? "disabled" : ""
        }>
          <span class="flex items-center">${GAME_ICONS.back("w-3.5 h-3.5")}</span>
          <span>上一张</span>
        </button>

        <div class="flex items-center gap-2">
          <button id="btn-slideshow-flip" class="bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs px-4 py-2 rounded-full shadow-md active:scale-95 cursor-pointer flex items-center gap-1">
            <span class="flex items-center">${GAME_ICONS.cards("w-3.5 h-3.5")}</span>
            <span>翻转</span>
          </button>
          <button id="btn-slideshow-diff" class="text-xs font-black px-3.5 py-2 rounded-full shadow-md active:scale-95 cursor-pointer flex items-center gap-1 ${
            isDiff ? "bg-rose-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
          }">
            <span class="flex items-center">${isDiff ? GAME_ICONS.shieldLock("w-3.5 h-3.5") : GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
            <span>${isDiff ? "已标难字" : "标为难字"}</span>
          </button>
        </div>

        <button id="btn-slideshow-next" class="btn-game-orange text-white font-black text-xs px-5 py-2 rounded-full shadow-lg cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5" ${
          currentIndex === chars.length - 1 ? "disabled" : ""
        }>
          <span>下一张</span>
          <span class="flex items-center" style="transform:rotate(180deg)">${GAME_ICONS.back("w-3.5 h-3.5")}</span>
        </button>
      </footer>
    `;

    // 自动朗读当前汉字发音
    soundAndFX.speakPriority(`${c.char}，${c.pinyin}`, { kind: "char", priority: 1 });

    // 绑定交互
    const closeBtn = overlay.querySelector("#btn-close-slideshow");
    if (closeBtn) {
      this._on(closeBtn, "click", () => {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        overlay.remove();
      });
    }

    const cardBox = overlay.querySelector("#slideshow-card-box");
    const flipBtn = overlay.querySelector("#btn-slideshow-flip");
    const toggleFlip = () => {
      isFlipped = !isFlipped;
      soundAndFX.playCardFlip();
      if (cardBox) {
        cardBox.classList.toggle("rotate-y-180", isFlipped);
      }
    };
    if (cardBox) this._on(cardBox, "click", toggleFlip);
    if (flipBtn) this._on(flipBtn, "click", (e) => { e.stopPropagation(); toggleFlip(); });

    const prevBtn = overlay.querySelector("#btn-slideshow-prev");
    if (prevBtn) {
      this._on(prevBtn, "click", (e) => {
        e.stopPropagation();
        if (currentIndex > 0) {
          currentIndex--;
          isFlipped = false;
          soundAndFX.stopSpeaking();
          soundAndFX.playPop();
          renderCurrentCard();
        }
      });
    }

    const nextBtn = overlay.querySelector("#btn-slideshow-next");
    if (nextBtn) {
      this._on(nextBtn, "click", (e) => {
        e.stopPropagation();
        if (currentIndex < chars.length - 1) {
          currentIndex++;
          isFlipped = false;
          soundAndFX.stopSpeaking();
          soundAndFX.playPop();
          renderCurrentCard();
        }
      });
    }

    const speakBtn = overlay.querySelector("#btn-slideshow-speak");
    if (speakBtn) {
      this._on(speakBtn, "click", (e) => {
        e.stopPropagation();
        soundAndFX.speakPriority(`${c.char}，${c.pinyin}`, { kind: "char", priority: 1 });
      });
    }

    const diffBtn = overlay.querySelector("#btn-slideshow-diff");
    if (diffBtn) {
      this._on(diffBtn, "click", (e) => {
        e.stopPropagation();
        const curDiff = ebbinghausManager.isDifficultChar(c.id);
        if (curDiff) {
          ebbinghausManager.removeDifficultChar(c.id);
        } else {
          ebbinghausManager.addDifficultChar(c.id);
        }
        soundAndFX.playPop();
        renderCurrentCard();
      });
    }

    this._onDom(overlay.querySelectorAll(".slideshow-word-btn"), "click", (e) => {
      e.stopPropagation();
      const word = e.currentTarget.dataset.word;
      soundAndFX.speakPriority(word, { kind: "word", priority: 1 });
    });

    const autoPlayBtn = overlay.querySelector("#btn-toggle-autoplay");
    if (autoPlayBtn) {
      this._on(autoPlayBtn, "click", (e) => {
        e.stopPropagation();
        isAutoPlaying = !isAutoPlaying;
        soundAndFX.playPop();

        if (isAutoPlaying) {
          autoPlayTimer = setInterval(() => {
            if (currentIndex < chars.length - 1) {
              currentIndex++;
              isFlipped = false;
              soundAndFX.stopSpeaking();
              renderCurrentCard();
            } else {
              clearInterval(autoPlayTimer);
              isAutoPlaying = false;
              renderCurrentCard();
            }
          }, 3200);
        } else {
          if (autoPlayTimer) clearInterval(autoPlayTimer);
        }
        renderCurrentCard();
      });
    }
  };

  renderCurrentCard();
}
