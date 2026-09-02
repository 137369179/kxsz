/**
 * 凯茜识字 (Cathy Literacy) - 1300 字字卡中心与生词字典组件
 * 高性能优化版：
 *  1. 1300 字卡虚拟分片加载（首屏 48 张，滚动按需增量呈现，DOM 减负 85%+）
 *  2. 搜索 150ms 智能防抖
 *  3. CSS content-visibility: auto 硬件跳跃渲染 (cv-auto)
 *  4. 3D 翻转卡片偏旁专项生词发音与难字本管理
 */

import { CHARACTER_DATABASE } from "../data/characters.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { mountGameShell, showGameToast } from "./SharedShell.js";
import { BaseModule } from "../utils/BaseModule.js";
import { GAME_ICONS } from "../utils/gameIcons.js";

const RADICAL_ORIGINS = {
  "氵": "三点水：造字本源与江河水流液体有关",
  "艹": "草字头：造字本源与花草植物农作物有关",
  "木": "木字旁：造字本源与树木木材森林有关",
  "亻": "单人旁：造字本源与人的动作品质身份有关",
  "口": "口字旁：造字本源与嘴巴声音吞吐有关",
  "日": "日字旁：造字本源与太阳时间光线有关",
  "月": "月字旁：造字本源与月亮时间或人体肉身有关",
  "扌": "提手旁：造字本源与手部动作拿取操作有关",
  "纟": "绞丝旁：造字本源与丝线织物绳索有关",
  "辶": "走之底：造字本源与走路行走行进距离有关",
  "忄": "竖心旁：造字本源与内心心情思维情感有关",
  "火": "火字旁：造字本源与火光温度燃烧烹饪有关",
  "土": "土字旁：造字本源与泥土大地地面建筑有关",
  "金": "金字旁：造字本源与金属器具矿石有关",
  "鸟": "鸟字边：造字本源与飞禽鸟类有关",
  "虫": "虫字旁：造字本源与昆虫节肢小动物有关"
};

export class CardModule extends BaseModule {
  constructor(container) {
    super(container);
    this.currentFilter = "all";   // all | learned | review | difficult
    this.currentStage = "all";    // all | 1 | 2 | 3
    this.selectedRadical = "all"; // all | 氵 | 艹 | 木 ...
    this.searchQuery = "";
    this.selectedCard = null;
    this.isCardFlipped = false;

    // 高性能分页/分片加载
    this.pageSize = 48;
    this.displayCount = 48;
    this._debounceTimer = null;
  }

  /** 清理事件监听与防抖定时器 */
  destroy() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }
    super.destroy();
  }

  getFilteredList() {
    const progress = ebbinghausManager.progress;
    let filteredChars = CHARACTER_DATABASE;

    // 1. 状态筛选
    if (this.currentFilter === "learned") {
      filteredChars = filteredChars.filter((c) => !!progress.charRecords[c.id]);
    } else if (this.currentFilter === "review") {
      const dueIds = ebbinghausManager.getDueReviewCharIds();
      filteredChars = filteredChars.filter((c) => dueIds.includes(c.id));
    } else if (this.currentFilter === "difficult") {
      const diffIds = ebbinghausManager.getDifficultCharIds();
      filteredChars = filteredChars.filter((c) => diffIds.includes(c.id));
    }

    // 2. 三大阶段筛选
    if (this.currentStage !== "all") {
      filteredChars = filteredChars.filter((c) => (c.stage || 1) === parseInt(this.currentStage, 10));
    }

    // 3. 偏旁部首筛选
    if (this.selectedRadical !== "all") {
      filteredChars = filteredChars.filter((c) => c.radical === this.selectedRadical);
    }

    // 4. 搜索过滤
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      filteredChars = filteredChars.filter((c) => c.char.includes(q) || (c.pinyin && c.pinyin.toLowerCase().includes(q)));
    }

    return filteredChars;
  }

  render() {
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
        
        <!-- 顶部搜索与多维筛选控制栏 -->
        <div class="w-full flex flex-col gap-3 bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl border-2 border-amber-200 mb-4 sticky top-0 z-20">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="flex items-center">${GAME_ICONS.cards()}</span>
              <div>
                <h1 class="text-base font-black text-amber-950">生词字卡库 · 偏旁部首专项板块</h1>
                <p class="text-xs text-amber-700 font-semibold">1800 汉字造字本源解析3D 翻转卡片偏旁归纳与组词例句</p>
              </div>
            </div>

            <!-- 搜索框 (带智能防抖) -->
            <div class="relative w-full sm:w-64">
              <input id="card-search-input" type="text" value="${this.searchQuery}" placeholder="搜索汉字或拼音 (如: 日 / ri)" class="w-full bg-amber-50 border-2 border-amber-300 rounded-full px-4 py-1.5 text-xs font-black text-amber-950 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-amber-400" />
            </div>
          </div>

          <!-- 筛选第一行：阶段与掌握状态 -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-100">
            
            <!-- 三大识字阶段 -->
            <div class="flex items-center gap-1 bg-amber-50 p-1 rounded-full border border-amber-200">
              ${[
                { key: "all", label: "全阶段" },
                { key: "1", label: " 识字启蒙 (1-200)" },
                { key: "2", label: " 生活常用 (201-600)" },
                { key: "3", label: " 进阶提升 (601-1300)" }
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

            <!-- 掌握状态 -->
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

          <!-- 筛选第二行：偏旁部首专项横向胶囊专区 -->
          <div class="flex items-center gap-2 pt-2 border-t border-amber-100 overflow-x-auto no-scrollbar py-1">
            <span class="text-xs font-black text-amber-950 whitespace-nowrap"> 偏旁专区：</span>
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

        <!-- 偏旁造字本源解析气泡 (若选中特定部首) -->
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

        <!-- 数量统计标签 -->
        <div class="w-full flex items-center justify-between text-xs font-black text-amber-950 mb-3 px-2">
          <span>共找到 <b class="text-orange-600">${allFiltered.length}</b> 个生字 (当前已呈现 ${visibleChars.length} 个)</span>
          ${hasMore ? '<span class="text-amber-700 text-[11px] font-semibold"> 向下滚动自动呈现更多</span>' : ""}
        </div>

        <!-- 字卡网格列表 (采用 content-visibility: auto 高性能渲染) -->
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
                      
                      <!-- 掌握状态角标 -->
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

        <!-- 分页增量加载触发按钮 -->
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

        <!-- 3D 翻转卡片弹窗详情 (若选中) -->
        ${this.selectedCard ? this.renderCardDetailModal() : ""}

      </div>
    `;

    this.bindEvents(mainEl);
  }

  bindEvents(mainEl) {
    // 搜索框防抖处理 (150ms)
    const searchInput = mainEl.querySelector("#card-search-input");
    if (searchInput) {
      this._on(searchInput, "input", (e) => {
        const val = e.target.value;
        if (this._debounceTimer) clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => {
          this.searchQuery = val;
          this.displayCount = this.pageSize;
          this.render();
        }, 150);
      });
    }

    // 阶段筛选
    mainEl.querySelectorAll(".filter-stage-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        this.currentStage = btn.dataset.stage;
        this.displayCount = this.pageSize;
        soundAndFX.playPop();
        this.render();
      });
    });

    // 掌握状态筛选
    mainEl.querySelectorAll(".filter-status-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        this.currentFilter = btn.dataset.key;
        this.displayCount = this.pageSize;
        soundAndFX.playPop();
        this.render();
      });
    });

    // 部首专项筛选
    mainEl.querySelectorAll(".radical-tag-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        this.selectedRadical = btn.dataset.rad;
        this.displayCount = this.pageSize;
        soundAndFX.playPop();
        this.render();
      });
    });

    // 听部首解说
    const speakRadBtn = mainEl.querySelector("#btn-speak-radical-origin");
    if (speakRadBtn) {
      this._on(speakRadBtn, "click", () => {
        soundAndFX.playPop();
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
        if (viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 150) {
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
        this.render();
      });
    });

    // 弹窗关闭与翻转
    const modalBackdrop = mainEl.querySelector("#card-modal-backdrop");
    const closeBtn = mainEl.querySelector("#btn-close-modal");
    const flipCard = mainEl.querySelector("#flip-card");

    if (closeBtn) {
      this._on(closeBtn, "click", () => {
        soundAndFX.playPop();
        this.selectedCard = null;
        this.render();
      });
    }

    if (modalBackdrop) {
      this._on(modalBackdrop, "click", (e) => {
        if (e.target === modalBackdrop) {
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
          soundAndFX.playPop();
          soundAndFX.speakPriority(`${this.selectedCard.char}，${this.selectedCard.pinyin}`, { kind: "char", priority: 1 });
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
        soundAndFX.playPop();
        soundAndFX.speakPriority(word, { kind: "word", priority: 1 });
        btn.classList.add("ring-2", "ring-orange-400");
        this._timeout(() => btn.classList.remove("ring-2", "ring-orange-400"), 400);
      });
    });

    // 弹窗背面例句点击发音
    const sentenceBox = mainEl.querySelector("#card-modal-sentence");
    if (sentenceBox) {
      this._on(sentenceBox, "click", (e) => {
        e.stopPropagation();
        if (this.selectedCard && this.selectedCard.sentence) {
          soundAndFX.playPop();
          soundAndFX.speakPriority(this.selectedCard.sentence, { kind: "sentence", emotion: "gentle" });
          sentenceBox.classList.add("ring-2", "ring-orange-400");
          this._timeout(() => sentenceBox.classList.remove("ring-2", "ring-orange-400"), 600);
        }
      });
    }
  }

  openStrokeDemoModal(c) {
    const overlay = document.createElement("div");
    overlay.id = "stroke-demo-overlay";
    overlay.className = "fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in";
    overlay.innerHTML = `
      <div class="relative w-full max-w-md sm:max-w-lg bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-8 shadow-2xl border-4 border-amber-300 flex flex-col items-center select-none">
        <button id="btn-close-stroke-demo" class="absolute -top-14 right-0 w-11 h-11 rounded-full bg-white text-gray-800 font-extrabold text-xl flex items-center justify-center shadow-2xl hover:bg-gray-100 active:scale-90 cursor-pointer border-2 border-amber-300" title="关闭">
          ${GAME_ICONS.back("w-6 h-6")}
        </button>

        <div class="flex items-center justify-between w-full mb-4 pb-3 border-b border-amber-200">
          <span class="text-base sm:text-lg font-black text-amber-950 flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.brush("w-6 h-6")}</span>
            <span>标准笔顺演示 · “${c.char}” (${c.pinyin})</span>
          </span>
          <span id="demo-stroke-name" class="text-xs sm:text-sm font-black bg-amber-200 text-amber-950 px-3 py-1 rounded-full shadow-sm">准备起笔</span>
        </div>

        <!-- 田字格 Canvas (巨幅高清演示台) -->
        <div class="relative w-72 h-72 sm:w-80 sm:h-80 bg-amber-50 rounded-3xl border-4 border-amber-400 shadow-2xl overflow-hidden flex items-center justify-center my-3">
          <canvas id="stroke-demo-canvas" width="320" height="320" class="w-full h-full"></canvas>
        </div>

        <div class="flex items-center gap-3 mt-4 w-full justify-center">
          <button id="btn-replay-stroke-demo" class="btn-game-orange text-white text-sm font-black px-8 py-3 rounded-full shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer">
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
              requestAnimationFrame(animStep);
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

    closeBtn.addEventListener("click", () => {
      cancelCurrentAnim = true;
      overlay.remove();
    });
    replayBtn.addEventListener("click", () => {
      cancelCurrentAnim = true;
      setTimeout(playDemo, 100);
    });

    setTimeout(playDemo, 200);
  }

  renderCardDetailModal() {
    const c = this.selectedCard;
    const isDiff = ebbinghausManager.isDifficultChar(c.id);

    return `
      <div id="card-modal-backdrop" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in perspective-1000 select-none">
        <div class="relative w-full max-w-md sm:max-w-lg flex flex-col items-center">
          
          <!-- 关闭按钮 (大触控靶心) -->
          <button id="btn-close-modal" class="absolute -top-14 right-0 w-11 h-11 rounded-full bg-white text-gray-800 font-extrabold text-xl flex items-center justify-center shadow-2xl hover:bg-gray-100 active:scale-90 z-50 cursor-pointer border-2 border-amber-300" title="关闭">
            ${GAME_ICONS.back("w-6 h-6")}
          </button>

          <!-- 3D 翻转卡片容器 (巨幕 3D 字卡) -->
          <div id="flip-card" class="relative w-full h-[460px] sm:h-[480px] cursor-pointer preserve-3d transition-transform duration-500 ease-out ${this.isCardFlipped ? 'rotate-y-180' : ''}">
            
            <!-- 卡片正面 (Front Face) -->
            <div class="absolute inset-0 bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl shadow-2xl border-4 border-amber-300 p-8 flex flex-col justify-between backface-hidden ${this.isCardFlipped ? 'pointer-events-none' : ''}">
              <div class="flex items-center justify-between">
                <span class="text-xs sm:text-sm font-black bg-amber-200 text-amber-950 px-4 py-1.5 rounded-full shadow-sm">${c.radical}部 · ${c.strokeCount || 4}画</span>
                <div class="flex items-center gap-2.5">
                  <button id="btn-modal-demo-strokes" class="flex items-center gap-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black shadow-md active:scale-90 transition-all cursor-pointer" title="笔顺笔画动画演示">
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
                <span class="text-8xl sm:text-9xl font-black text-amber-950 drop-shadow-md glow-pulse">${c.char}</span>
                
                ${c.oracleGlyph ? `
                  <div class="mt-3 flex items-center gap-2 bg-amber-200/70 px-4 py-1.5 rounded-full border border-amber-300 shadow-inner">
                    <span class="text-xs text-amber-900 font-black">甲骨文演变:</span>
                    <span class="text-2xl font-black text-amber-950">${c.oracleGlyph}</span>
                  </div>
                ` : ""}
              </div>

              <div class="w-full text-center">
                <span class="text-xs text-amber-800 font-bold bg-white/90 px-5 py-1.5 rounded-full shadow-sm animate-pulse border border-amber-200">
                  👆 点击卡片翻转查看字源与常用组词
                </span>
              </div>
            </div>

            <!-- 卡片背面 (Back Face) -->
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
                  <span class="text-xs sm:text-sm font-black text-amber-900 block mb-2">常用词组 (点击朗读)：</span>
                  <div class="flex flex-wrap gap-2">
                    ${(c.words || [{ word: `${c.char}子`, pinyin: "" }]).map(w => {
                      const wordText = typeof w === "string" ? w : w.word;
                      return `<button class="card-modal-word-btn bg-white hover:bg-amber-100 text-amber-950 border-2 border-amber-300 text-sm sm:text-base font-black px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer" data-word="${wordText}">${wordText}</button>`;
                    }).join("")}
                  </div>
                </div>

                <div id="card-modal-sentence" class="bg-white/95 hover:bg-white p-4 rounded-2xl border-2 border-amber-300 text-xs sm:text-sm text-amber-950 font-semibold leading-relaxed cursor-pointer transition-all active:scale-95 shadow-md" title="点击朗读例句">
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
}
