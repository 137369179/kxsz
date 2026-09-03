/** BookModule — char holograph card + catalog drawer */
import { CHARACTER_DATABASE } from "../../data/characters.js";
import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";

export function openCharPopover(charStr) {
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

export function openCatalogDrawer(book) {
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
