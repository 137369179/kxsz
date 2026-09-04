/** CardModule — shelf render */
import { ebbinghausManager } from "../ebbinghaus.js";
import { mountGameShell } from "../../components/SharedShell.js";
import { GAME_ICONS } from "../gameIcons.js";
import { RADICAL_ORIGINS } from "./cardConstants.js";

export function render() {
  const prevViewport = this.container.querySelector("#cards-page-viewport");
  if (prevViewport) {
    this._savedScrollTop = prevViewport.scrollTop;
  }
  this.destroy();
  const progress = ebbinghausManager.progress;
  const allFiltered = this.getFilteredList();
  const visibleChars = allFiltered.slice(0, this.displayCount);
  const hasMore = allFiltered.length > this.displayCount;

  // 统计前 16 个高频常用部首
  const popularRadicals = ["all", "氵", "艹", "木", "亻", "口", "日", "月", "扌", "纟", "辶", "忄", "火", "土", "金", "鸟", "虫"];

  const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
    activeMode: "cards",
    heading: "凯茜字卡字典"
  });
  this._addCleanup(destroyShell);

  mainEl.innerHTML = `
    <div id="cards-page-viewport" class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pb-6 overflow-y-auto no-scrollbar max-h-[calc(100vh-100px)]">
      
      <div class="w-full flex flex-col gap-3 bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl border-2 border-amber-200 mb-4 sticky top-0 z-20">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="flex items-center">${GAME_ICONS.cards()}</span>
            <div>
              <h1 class="text-base font-black text-amber-950">生词字卡库 · 偏旁部首专项板块</h1>
              <p class="text-xs text-amber-700 font-semibold">1490 汉字造字本源解析 · 3D 翻转卡片 · 偏旁归纳与组词例句</p>
            </div>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button id="btn-start-slideshow" class="btn-game-orange text-white font-black text-xs px-4 py-2 rounded-full shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
              <span>闪卡轮播</span>
            </button>
            <div class="relative w-full sm:w-56">
              <input id="card-search-input" type="text" value="${this.searchQuery}" placeholder="搜索汉字或拼音 (如: 日 / ri)" class="w-full bg-amber-50 border-2 border-amber-300 rounded-full px-4 py-1.5 text-xs font-black text-amber-950 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-amber-400" />
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-100">
          
          <div class="flex items-center gap-1 bg-amber-50 p-1 rounded-full border border-amber-200">
            ${[
              { key: "all", label: "全阶段" },
              { key: "1", label: "第1阶·启蒙 (1-200)" },
              { key: "2", label: "第2阶·常用 (201-600)" },
              { key: "3", label: "第3阶·进阶 (601-1490)" }
            ]
              .map(
                (st) => `
              <button class="filter-stage-btn px-4 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 shadow-md ${
                this.currentStage === st.key
                  ? "bg-amber-800 text-white shadow-md"
                  : "text-amber-900 hover:bg-amber-100"
              }" data-stage="${st.key}">
                ${st.label}
              </button>
            `
              )
              .join("")}
          </div>

          <div class="flex items-center gap-1 bg-amber-50 p-1 rounded-full border border-amber-200">
            ${[
              { key: "all", label: "全部" },
              { key: "learned", label: "已掌握" },
              { key: "review", label: "待复习" },
              { key: "difficult", label: "难字本" }
            ]
              .map(
                (f) => `
              <button class="filter-status-btn px-4 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 shadow-md ${
                this.currentFilter === f.key
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                  : "text-amber-900 hover:bg-amber-100"
              }" data-key="${f.key}">
                ${f.label}
              </button>
            `
              )
              .join("")}
          </div>

        </div>

        <div class="flex items-center gap-2 pt-2 border-t border-amber-100 overflow-x-auto no-scrollbar py-1">
          <span class="text-xs font-black text-amber-950 whitespace-nowrap">偏旁专区：</span>
          ${popularRadicals.map((rad) => `
            <button class="radical-tag-btn px-3 py-1 rounded-full text-xs font-black whitespace-nowrap transition-all ${
              this.selectedRadical === rad
                ? "bg-orange-500 text-white ring-2 ring-orange-300 shadow"
                : "bg-amber-100/70 text-amber-900 hover:bg-amber-200"
            }" data-rad="${rad}">
              ${rad === "all" ? "全部部首" : `${rad} 部`}
            </button>
          `).join("")}
        </div>

      </div>

      ${
        this.selectedRadical !== "all" && RADICAL_ORIGINS[this.selectedRadical]
          ? `
        <div class="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3.5 rounded-2xl mb-4 shadow-lg flex items-center justify-between animate-fade-in border-2 border-white/40">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl font-black bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center">${this.selectedRadical}</span>
            <span class="text-xs font-bold">${RADICAL_ORIGINS[this.selectedRadical]}</span>
          </div>
          <button id="btn-speak-radical-origin" class="btn-game-wood text-white text-[10px] font-black px-3 py-1 rounded-full shadow"> 听解说</button>
        </div>
      `
          : ""
      }

      <div class="w-full flex items-center justify-between text-xs font-black text-amber-950 mb-3 px-2">
        <span>共找到 <b class="text-orange-600">${allFiltered.length}</b> 个生字 (当前已呈现 ${visibleChars.length} 个)</span>
        ${hasMore ? '<span class="text-amber-700 text-[11px] font-semibold"> 向下滚动自动呈现更多</span>' : ""}
      </div>

      <div id="card-grid-container" class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3.5">
        ${
          visibleChars.length === 0
            ? `
          <div class="col-span-full py-16 text-center text-gray-400 font-black text-sm">
            <div class="w-12 h-12 mx-auto mb-2 flex items-center justify-center">${GAME_ICONS.book()}</div>
            未找到符合条件的生字卡片，换个关键词或筛选条件试试吧！
          </div>
        `
            : visibleChars
                .map((c) => {
                  const record = progress.charRecords[c.id];
                  const isLearned = !!record;
                  const isDifficult = ebbinghausManager.isDifficultChar(c.id);

                  return `
                  <div class="char-card cv-auto group relative h-36 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-md border-2 ${
                    isLearned
                      ? "border-amber-300 hover:border-orange-400 ring-2 ring-amber-200/40"
                      : "border-gray-200 opacity-65"
                  } flex flex-col items-center justify-between cursor-pointer transition-all duration-200 hover:scale-105" data-char-id="${c.id}">
                    
                    ${
                      isDifficult
                        ? '<span class="absolute top-1.5 right-1.5 text-[9px] bg-rose-500 text-white font-black px-1.5 py-0.5 rounded-full shadow">难字</span>'
                        : isLearned
                        ? '<span class="absolute top-1.5 right-1.5 text-[9px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded-full shadow">已掌握</span>'
                        : ""
                    }

                    <span class="text-[11px] font-bold text-amber-700">${c.pinyin}</span>
                    
                    <span class="text-4xl font-black text-amber-950 group-hover:text-orange-600 transition-colors drop-shadow-sm">
                      ${c.char}
                    </span>

                    <div class="w-full flex items-center justify-between pt-1.5 border-t border-amber-100 text-[10px] font-bold text-gray-500">
                      <span class="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded">${c.radical}部</span>
                      <span>${c.strokeCount || 4}画</span>
                    </div>
                  </div>
                `;
                })
                .join("")
        }
      </div>

      ${
        hasMore
          ? `
        <div class="w-full flex justify-center mt-6">
          <button id="btn-load-more-cards" class="btn-game-orange text-white font-black text-xs px-8 py-2.5 rounded-full shadow-lg flex items-center gap-2 active:scale-95">
            <span> 呈现更多汉字 (${visibleChars.length}/${allFiltered.length})</span>
          </button>
        </div>
      `
          : ""
      }

      ${this.selectedCard ? this.renderCardDetailModal() : ""}

    </div>
  `;

  this.bindEvents(mainEl);
}

