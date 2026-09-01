/**
 * 凯茜识字 (Cathy Literacy) - 1:1 横屏无缝大地图 (Landscape World Map)
 * 纯正游戏化沉浸式界面：横向惯性拖拽漫游3D浮岛关卡节点凯茜全动态伴学三大岛屿与地标建筑
 */

import { CHARACTER_DATABASE } from "../data/characters.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { mountGameShell, showGameToast } from "./SharedShell.js";
import { BaseModule } from "../utils/BaseModule.js";
import { EVENTS } from "../utils/eventBus.js";
import { GAME_ICONS } from "../utils/gameIcons.js";

export class MapModule extends BaseModule {
  constructor(container) {
    super(container);
    this.currentIsland = 1; // 1: 森林岛 | 2: 小镇生活岛 | 3: 太空探索岛
    this.scrollX = 0;
    this.selectedCharForPreview = null;
  }

  render() {
    this.destroy();
    const progress = ebbinghausManager.progress;
    const allChars = CHARACTER_DATABASE;

    // 过滤当前岛屿对应的汉字
    const islandChars = allChars.filter((c) => (c.stage || 1) === this.currentIsland);
    const displayChars = islandChars.length > 0 ? islandChars : allChars.slice(0, 20);

    const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
      activeMode: "map",
      heading: "凯茜识字世界大地图"
    });
    this._addCleanup(destroyShell);

    mainEl.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col justify-between overflow-hidden select-none bg-sky-300">
        
        <!-- 岛屿选择器与快捷导航 -->
        <div class="absolute top-20 left-6 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/30 shadow-xl">
          <button class="island-tab-btn px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
            this.currentIsland === 1 ? "bg-emerald-500 text-white shadow-lg scale-105" : "text-white/80 hover:text-white"
          }" data-island="1">
            <span class="flex items-center">${GAME_ICONS.islandForest("w-4 h-4")}</span>
            <span>奇幻森林岛 (1-200)</span>
          </button>
          <button class="island-tab-btn px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
            this.currentIsland === 2 ? "bg-amber-500 text-white shadow-lg scale-105" : "text-white/80 hover:text-white"
          }" data-island="2">
            <span class="flex items-center">${GAME_ICONS.islandTown("w-4 h-4")}</span>
            <span>缤纷小镇岛 (201-600)</span>
          </button>
          <button class="island-tab-btn px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
            this.currentIsland === 3 ? "bg-indigo-600 text-white shadow-lg scale-105" : "text-white/80 hover:text-white"
          }" data-island="3">
            <span class="flex items-center">${GAME_ICONS.islandSpace("w-4 h-4")}</span>
            <span>星际探索岛 (601-1300)</span>
          </button>
        </div>

        <!-- 7 大地标快捷入口建筑 (游乐场绘本馆字卡库奖励城堡竞技场复习) -->
        <div class="absolute top-20 right-6 z-20 flex flex-wrap justify-end gap-2.5 max-w-[400px]">
          <button class="map-landmark-btn group bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-purple-300 shadow-xl flex items-center gap-1.5 active:scale-95 transition-all mb-2" data-mode="play">
            <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.arcade("w-5 h-5")}</span>
            <span class="text-xs font-black text-purple-950">游乐场</span>
          </button>
          <button class="map-landmark-btn group bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-sky-300 shadow-xl flex items-center gap-1.5 active:scale-95 transition-all mb-2" data-mode="books">
            <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.book("w-5 h-5")}</span>
            <span class="text-xs font-black text-sky-950">绘本馆</span>
          </button>
          <button class="map-landmark-btn group bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-amber-300 shadow-xl flex items-center gap-1.5 active:scale-95 transition-all mb-2" data-mode="cards">
            <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.cards("w-5 h-5")}</span>
            <span class="text-xs font-black text-amber-950">字卡库</span>
          </button>
          <button class="map-landmark-btn group bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-rose-300 shadow-xl flex items-center gap-1.5 active:scale-95 transition-all mb-2" data-mode="reward">
            <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.chest("w-5 h-5")}</span>
            <span class="text-xs font-black text-rose-950">奖励城堡</span>
          </button>
          <button class="map-landmark-btn group bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-indigo-300 shadow-xl flex items-center gap-1.5 active:scale-95 transition-all mb-2" data-mode="pk">
            <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.trophy("w-5 h-5")}</span>
            <span class="text-xs font-black text-indigo-950">竞技场</span>
          </button>
          <button class="map-landmark-btn group bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-green-300 shadow-xl flex items-center gap-1.5 active:scale-95 transition-all mb-2" data-mode="idiom">
            <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.book("w-5 h-5")}</span>
            <span class="text-xs font-black text-green-950">国学馆</span>
          </button>
          <button class="map-landmark-btn group bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-teal-300 shadow-xl flex items-center gap-1.5 active:scale-95 transition-all" data-mode="review">
            <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.calendar("w-5 h-5")}</span>
            <span class="text-xs font-black text-teal-950">每日复习</span>
          </button>
        </div>

        <!-- 2. 横向无缝卷轴大地图视口 (Horizontal Seamless Canvas) -->
        <div id="map-scroll-viewport" class="relative w-full h-full flex-1 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing no-scrollbar">
          
          <!-- 超宽世界地图背景画布 (2800px 宽度) -->
          <div class="relative min-w-[2800px] h-full flex items-center bg-gradient-to-r ${
            this.currentIsland === 1
              ? "from-emerald-700 via-teal-600 to-emerald-800"
              : this.currentIsland === 2
              ? "from-amber-600 via-orange-500 to-amber-700"
              : "from-indigo-900 via-purple-900 to-slate-950"
          } overflow-hidden">
            
            <!-- 背景图层 -->
            <img src="assets/images/cathy_world_map.jpg" alt="凯茜世界大地图" class="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none filter contrast-110" />

            <!-- 地图氛围装饰云层与发光粒子 -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none"></div>

            <!-- S型蜿蜒关卡节点序列 (3D浮岛与光路连线) -->
            <div class="relative z-10 flex items-center gap-16 px-24 my-auto">
              ${displayChars
                .map((charItem, index) => {
                  const record = progress.charRecords[charItem.id];
                  const isCompleted = !!record;
                  const isCurrent = !isCompleted && index <= progress.currentLevelIndex;
                  const isLocked = !isCompleted && index > progress.currentLevelIndex;

                  // 产生波浪高低起伏 y 偏移
                  const yOffset = Math.sin(index * 0.8) * 80;

                  return `
                  <div class="relative flex flex-col items-center group level-node cursor-pointer transition-transform duration-300 hover:scale-125" style="transform: translateY(${yOffset}px)" data-char-id="${charItem.id}">
                    
                    <!-- 伴学主角凯茜小精灵站立在当前关卡上 -->
                    ${
                      isCurrent
                        ? `
                      <div id="cathy-mascot-anchor" class="absolute -top-24 z-30 flex flex-col items-center animate-bounce-cathy pointer-events-none">
                        <!-- 对话气泡 -->
                        <div class="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-2xl whitespace-nowrap mb-1.5 border-2 border-white animate-pulse flex items-center gap-1">
                          <span class="flex items-center">${GAME_ICONS.star("w-3.5 h-3.5")}</span>
                          <span>凯茜：快来学“${charItem.char}”字！</span>
                        </div>
                        <img src="assets/images/cathy_mascot.jpg" class="w-16 h-16 rounded-full border-4 border-white shadow-2xl object-cover ring-4 ring-orange-400/80" />
                      </div>
                    `
                        : ""
                    }

                    <!-- 3D 浮岛石台 / 水晶底座 -->
                    <div class="relative w-24 h-24 rounded-3xl flex flex-col items-center justify-center font-black shadow-2xl transition-all duration-300 ${
                      isCompleted
                        ? "bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 border-4 border-yellow-100 text-amber-950 ring-8 ring-amber-300/40"
                        : isCurrent
                        ? "bg-gradient-to-b from-orange-400 via-amber-500 to-orange-600 border-4 border-white text-white ring-8 ring-orange-400/60 animate-pulse"
                        : "bg-slate-700/80 border-4 border-slate-600 text-slate-400 opacity-60"
                    }">
                      
                      <!-- 皇冠图标 (通关后) -->
                      ${isCompleted ? `<span class="absolute -top-3.5 flex items-center drop-shadow">${GAME_ICONS.crown("w-6 h-6")}</span>` : ""}

                      <!-- 汉字与拼音 -->
                      <span class="text-3xl drop-shadow-md tracking-wider flex items-center justify-center">${isLocked ? GAME_ICONS.shieldLock("w-7 h-7") : charItem.char}</span>
                      <span class="text-[10px] font-extrabold ${isCompleted ? "text-amber-900" : "text-white/90"} mt-0.5">${isLocked ? `第${index + 1}关` : charItem.pinyin}</span>
                    </div>

                    <!-- 底部三颗金色发光星星 -->
                    <div class="flex items-center gap-1 mt-2.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 shadow-lg">
                      <span class="flex items-center">${GAME_ICONS.star("w-3.5 h-3.5", isCompleted)}</span>
                      <span class="flex items-center">${GAME_ICONS.star("w-3.5 h-3.5", isCompleted)}</span>
                      <span class="flex items-center">${GAME_ICONS.star("w-3.5 h-3.5", isCompleted)}</span>
                    </div>

                  </div>
                `;
                })
                .join("")}
            </div>

          </div>

        </div>

        <!-- 3. 右下角直达最新待学字金色罗盘 -->
        <button id="btn-quick-target-char" class="absolute bottom-6 right-6 z-30 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white font-black text-sm px-6 py-3.5 rounded-full shadow-[0_10px_25px_rgba(255,107,0,0.6)] border-4 border-white active:scale-95 transition-all flex items-center gap-2 animate-bounce-slow">
          <span class="flex items-center">${GAME_ICONS.compass("w-6 h-6")}</span>
          <span>直达最新生字</span>
        </button>

        <!-- 4. 左下角每日签到 + 学习数据罗盘 -->
        <div class="absolute bottom-6 left-6 z-30 flex flex-col gap-2">
          
          <!-- 每日签到徽章 -->
          <button id="btn-daily-signin" class="group bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-xl border-2 border-white/50 active:scale-95 transition-all flex items-center gap-2 ${progress.todaySignedIn ? 'opacity-70 cursor-not-allowed' : 'animate-bounce-slow'}">
            <span class="flex items-center">${GAME_ICONS.calendar("w-5 h-5")}</span>
            <div class="flex flex-col items-start">
              <span>${progress.todaySignedIn ? '今日已签到' : '每日签到领奖励'}</span>
              <span class="text-[9px] text-white/80 font-bold">连续 ${progress.signInStreak || 0} 天</span>
            </div>
            ${!progress.todaySignedIn ? `<span class="bg-yellow-400 text-amber-900 text-[9px] font-black px-1.5 py-0.5 rounded-full ml-1">+5</span>` : ''}
          </button>

          <!-- 今日目标进度 -->
          <div class="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/20 shadow-xl">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] font-black text-amber-300">今日目标</span>
              <span class="text-[10px] text-white/60">${Math.min(progress.todayLearnedCount || 0, 5)} / 5 个字</span>
            </div>
            <div class="w-36 h-2 bg-white/20 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700" style="width:${Math.min(((progress.todayLearnedCount || 0) / 5) * 100, 100)}%"></div>
            </div>
          </div>

          <!-- 总学习进度 -->
          <div class="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20 shadow-xl flex items-center gap-3">
            <span class="flex items-center">${GAME_ICONS.sparkle("w-5 h-5")}</span>
            <div>
              <div class="text-[10px] text-white/60 font-bold">已学 <b class="text-amber-300">${Object.keys(progress.charRecords || {}).length}</b> / ${CHARACTER_DATABASE.length} 字</div>
              <div class="text-[10px] text-white/60 font-bold">星币 <b class="text-yellow-300">${progress.coins}</b> · 星星 <b class="text-amber-300">${progress.stars}</b></div>
            </div>
          </div>
        </div>

      </div>
    `;

    this.bindEvents(mainEl);
    this.autoScrollToCurrent();
  }

  renderIsland(islandId) {
    this.currentIsland = islandId;
    this.render();
  }

  autoScrollToCurrent() {
    const mascot = this.container.querySelector("#cathy-mascot-anchor");
    const viewport = this.container.querySelector("#map-scroll-viewport");
    if (mascot && viewport) {
      this._timeout(() => {
        const offset = mascot.offsetLeft - viewport.clientWidth / 2;
        viewport.scrollTo({ left: Math.max(0, offset), behavior: "smooth" });
      }, 300);
    }
  }

  bindEvents(mainEl) {
    // 关卡点击
    mainEl.querySelectorAll(".level-node").forEach((node) => {
      this._on(node, "click", () => {
        const charId = node.dataset.charId;
        const charData = CHARACTER_DATABASE.find((c) => c.id === charId);
        if (charData) {
          soundAndFX.playPop();
          soundAndFX.playSunRise();
          this._busEmit(EVENTS.START_LEARN, { charData });
        }
      });
    });

    // 岛屿切换
    mainEl.querySelectorAll(".island-tab-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        const islandId = parseInt(btn.dataset.island, 10);
        soundAndFX.playPop();
        this.renderIsland(islandId);
      });
    });

    // 地标建筑直达
    mainEl.querySelectorAll(".map-landmark-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        const mode = btn.dataset.mode;
        soundAndFX.playPop();
        this._busEmit(EVENTS.SWITCH_MODE, { mode });
      });
    });

    // 每日签到
    const signinBtn = mainEl.querySelector("#btn-daily-signin");
    if (signinBtn) {
      this._on(signinBtn, "click", () => {
        if (ebbinghausManager.progress.todaySignedIn) return;
        soundAndFX.playSuccessSound();
        soundAndFX.triggerConfetti(this.container);
        soundAndFX.triggerCoinFly(this.container);
        ebbinghausManager.doSignIn();
        showGameToast(this.container, "签到成功！获得 5 星币！连续打卡中...", "success");
        // Re-render to update the button state
        this._timeout(() => this.render(), 1500);
      });
    }

    // 快捷直达
    const quickBtn = mainEl.querySelector("#btn-quick-target-char");
    if (quickBtn) {
      this._on(quickBtn, "click", () => {
        const currentIdx = ebbinghausManager.progress.currentLevelIndex;
        const targetChar = CHARACTER_DATABASE[Math.min(currentIdx, CHARACTER_DATABASE.length - 1)] || CHARACTER_DATABASE[0];
        soundAndFX.playPop();
        this._busEmit(EVENTS.START_LEARN, { charData: targetChar });
      });
    }

    // 惯性横向拖拽 (支持鼠标 + 移动触控)
    const viewport = mainEl.querySelector("#map-scroll-viewport");
    if (viewport) {
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

      // 鼠标事件
      this._on(viewport, "mousedown", (e) => {
        isDown = true;
        startX = e.pageX - viewport.offsetLeft;
        scrollLeft = viewport.scrollLeft;
      });

      this._on(viewport, "mouseleave", () => {
        isDown = false;
      });

      this._on(viewport, "mouseup", () => {
        isDown = false;
      });

      this._on(viewport, "mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - viewport.offsetLeft;
        const walk = (x - startX) * 2;
        viewport.scrollLeft = scrollLeft - walk;
      });

      // 触摸事件 (移动端与平板) — passive:false 确保 preventDefault 生效
      this._on(viewport, "touchstart", (e) => {
        e.preventDefault();
        isDown = true;
        startX = e.touches[0].pageX - viewport.offsetLeft;
        scrollLeft = viewport.scrollLeft;
      }, { passive: false });

      this._on(viewport, "touchend", () => {
        isDown = false;
      });

      this._on(viewport, "touchmove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.touches[0].pageX - viewport.offsetLeft;
        const walk = (x - startX) * 1.5;
        viewport.scrollLeft = scrollLeft - walk;
      }, { passive: false });
    }
  }
}
