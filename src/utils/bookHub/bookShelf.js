/** BookModule — graded bookshelf + reading gatekeeper entry */
import { STORYBOOKS_DATABASE } from "../../data/books.js";
import { soundAndFX } from "../soundEngine.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { mountGameShell, showGameToast } from "../../components/SharedShell.js";
import { GAME_ICONS } from "../gameIcons.js";
import { checkBookReadiness, READING_STATUS } from "../readingGatekeeper.js";

export function renderShelf() {
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

  // P1-5 今日推荐：优先「生字全学完(READY)且未通关」的书，不足 3 本时补「生字最少的在学(PARTIAL)」书
  const _pool = (status) =>
    filteredBooks
      .filter((b) => !readBooks.includes(b.id))
      .map((b) => ({ book: b, r: checkBookReadiness(b, charRecords) }))
      .filter((x) => x.r.status === status);
  const recs = [
    ..._pool(READING_STATUS.READY).sort((a, b) => (a.book.level || 1) - (b.book.level || 1)),
    ..._pool(READING_STATUS.PARTIAL).sort(
      (a, b) => (a.r.stats?.unknownCount ?? 99) - (b.r.stats?.unknownCount ?? 99)
    ),
  ].slice(0, 3);

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
            }" data-stage="${tab.key}" data-speak="筛选${tab.label}" aria-label="筛选${tab.label}">
              <span>${tab.label}</span>
              <span class="text-[10px] opacity-75">(${tab.count})</span>
            </button>
          `
            )
            .join("")}
        </div>

        ${
          recs.length
            ? `
        <div class="mb-5 rounded-3xl bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 border-2 border-amber-300 shadow-md p-4">
          <div class="flex items-center gap-2 mb-3" data-speak="这是为你挑选的今日推荐绘本，生字你都已经学过啦！">
            <span class="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow">${GAME_ICONS.sparkle("w-5 h-5")}</span>
            <h2 class="text-sm font-black text-orange-900">今日推荐 · 刚好匹配你学过的字</h2>
          </div>
          <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            ${recs
              .map(({ book, r }) => {
                const total = r.stats?.total || (book.targetChars || []).length;
                const known = r.stats?.learnedCount ?? 0;
                const pct = total ? Math.round((known / total) * 100) : 100;
                return `
              <div class="book-card rec-card shrink-0 w-44 bg-white rounded-2xl overflow-hidden border-2 border-orange-300 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer" data-book-id="${book.id}" title="去读《${book.title}》">
                <div class="relative w-full h-24 bg-amber-100">
                  <img src="${book.coverImg}" alt="${book.title}" loading="lazy" decoding="async" class="w-full h-full object-cover" />
                  <div class="absolute bottom-1.5 left-1.5 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                    ${r.status === READING_STATUS.READY ? `生字已学 ${pct}%` : `还差 ${r.stats?.unknownCount ?? 0} 个生字`}
                  </div>
                </div>
                <div class="p-2.5">
                  <h3 class="text-xs font-black text-amber-950 line-clamp-1">${book.title}</h3>
                  <p class="text-[10px] text-gray-500 font-bold mt-0.5 line-clamp-1">${book.theme || "精选绘本"}</p>
                </div>
              </div>`;
              })
              .join("")}
          </div>
        </div>
        `
            : ""
        }

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
                  
                  <button class="btn-game-orange text-white font-black text-xs px-4 py-1.5 rounded-full shadow-md active:scale-95 transition-transform cursor-pointer shrink-0 touch-target" data-speak="${isRead ? "重温绘本" : "开始阅读"}" aria-label="${isRead ? "重温绘本" : "开始阅读"}">
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
      try { soundAndFX.stopSpeaking?.(); } catch {}
      const bookId = card.dataset.bookId;
      this.currentBook = STORYBOOKS_DATABASE.find((b) => b.id === bookId);
      const records = ebbinghausManager.progress.charRecords || {};
      const readiness = checkBookReadiness(this.currentBook, records);

      if (readiness.status === READING_STATUS.BLOCKED) {
        // B10: 超过一半没学 → 引导去学
        soundAndFX.playErrorSound?.();
        showGameToast(this.container, readiness.message, { duration: 2800 });
        soundAndFX.speakPriority?.(readiness.message || "这本书还有生字没学过，先去岛屿上探索吧！", { kind: "sentence", emotion: "gentle" });
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
        soundAndFX.speakPriority?.(readiness.message, { kind: "sentence", emotion: "gentle" });
      } else if (readiness.message) {
        showGameToast(this.container, readiness.message, { duration: 1800 });
        soundAndFX.speakPriority?.(`打开绘本，《${this.currentBook.title}》`, { kind: "sentence", emotion: "gentle" });
      }

      soundAndFX.playSuccessSound();
      this.render();
    });
  });
}
