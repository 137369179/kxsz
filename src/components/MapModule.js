/**
 * 凯茜识字 (Cathy Literacy) - 1:1 横屏无缝大地图 (Landscape World Map)
 * 纯正游戏化沉浸式界面：横向惯性拖拽漫游、3D浮岛关卡节点、凯茜全动态伴学、三大主题岛屿与地标建筑
 */

import { CHARACTER_DATABASE } from "../data/characters.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { mountGameShell, showGameToast } from "./SharedShell.js";
import { BaseModule } from "../utils/BaseModule.js";
import { EVENTS } from "../utils/eventBus.js";
import { GAME_ICONS } from "../utils/gameIcons.js";

const ISLAND_CONFIG = {
  1: {
    id: 1,
    name: "奇幻森林岛",
    sub: "象形本源 · 阶段一 (1-200字)",
    bgImg: "assets/images/cathy_island_forest.webp",
    bgFallback: "assets/images/cathy_world_map.webp",
    themeGrad: "from-emerald-900 via-teal-900 to-emerald-950",
    tabColor: "bg-emerald-500",
    nodeBorder: "border-emerald-300",
    btnGrad: "from-emerald-400 to-teal-600"
  },
  2: {
    id: 2,
    name: "缤纷生活岛",
    sub: "生活认知 · 阶段二 (201-600字)",
    bgImg: "assets/images/cathy_island_life.webp",
    bgFallback: "assets/images/cathy_world_map.webp",
    themeGrad: "from-amber-900 via-orange-900 to-amber-950",
    tabColor: "bg-amber-500",
    nodeBorder: "border-amber-300",
    btnGrad: "from-amber-400 to-orange-500"
  },
  3: {
    id: 3,
    name: "星际探索岛",
    sub: "科学智慧 · 阶段三 (601-1490字)",
    bgImg: "assets/images/cathy_island_space.webp",
    bgFallback: "assets/images/cathy_world_map.webp",
    themeGrad: "from-indigo-950 via-purple-950 to-slate-950",
    tabColor: "bg-indigo-600",
    nodeBorder: "border-cyan-300",
    btnGrad: "from-indigo-500 to-purple-600"
  }
};

export class MapModule extends BaseModule {
  constructor(container) {
    super(container);
    this.currentIsland = 1; // 1: 森林岛 | 2: 生活岛 | 3: 太空岛
    this.scrollX = 0;
    this.showWorldOverview = false;
    this._userSelectedIsland = false;
  }

  render() {
    this.destroy();
    const progress = ebbinghausManager.progress;
    const targetDaily = Math.max(1, progress.settings?.dailyCharTarget || 5);
    const allChars = CHARACTER_DATABASE;

    // 智能定位当前正在学的主题岛屿（若用户未手动切换过岛屿）
    if (!this._userSelectedIsland) {
      const curIdx = Math.max(0, (progress.currentLevelIndex || 1) - 1);
      const curChar = allChars[curIdx] || allChars[0];
      if (curChar && curChar.stage) {
        this.currentIsland = curChar.stage;
      }
    }

    // 过滤当前岛屿对应的汉字
    const islandChars = allChars.filter((c) => (c.stage || 1) === this.currentIsland);
    const displayChars = islandChars.length > 0 ? islandChars : allChars.slice(0, 20);

    const islandCfg = ISLAND_CONFIG[this.currentIsland] || ISLAND_CONFIG[1];

    const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
      activeMode: "map",
      heading: "凯茜识字世界大地图"
    });
    this._addCleanup(destroyShell);

    mainEl.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col justify-between overflow-hidden select-none bg-slate-950">
        
        <div class="absolute top-20 left-6 z-20 flex items-center gap-2.5 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/30 shadow-2xl">
          <button id="btn-open-world-overview" class="px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 shadow-md active:scale-95 cursor-pointer" title="查看三大岛屿世界全景图">
            <span class="flex items-center">${GAME_ICONS.compass('w-6 h-6')}</span>
            <span>世界全景</span>
          </button>

          <div class="w-[1px] h-6 bg-white/30 mx-1"></div>

          <button class="island-tab-btn px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
            this.currentIsland === 1 ? "bg-emerald-500 text-white shadow-lg scale-105 ring-2 ring-emerald-300" : "text-white/80 hover:text-white"
          }" data-island="1">
            <span class="flex items-center">${GAME_ICONS.islandForest('w-6 h-6')}</span>
            <span>奇幻森林岛</span>
          </button>
          <button class="island-tab-btn px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
            this.currentIsland === 2 ? "bg-amber-500 text-white shadow-lg scale-105 ring-2 ring-amber-300" : "text-white/80 hover:text-white"
          }" data-island="2">
            <span class="flex items-center">${GAME_ICONS.islandTown('w-6 h-6')}</span>
            <span>缤纷生活岛</span>
          </button>
          <button class="island-tab-btn px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
            this.currentIsland === 3 ? "bg-indigo-600 text-white shadow-lg scale-105 ring-2 ring-indigo-300" : "text-white/80 hover:text-white"
          }" data-island="3">
            <span class="flex items-center">${GAME_ICONS.islandSpace('w-6 h-6')}</span>
            <span>星际探索岛</span>
          </button>
        </div>

        <div class="absolute top-20 right-6 z-20 flex items-center gap-2 max-w-[calc(100vw-540px)] overflow-x-auto no-scrollbar py-1.5 px-2.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
          <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-purple-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer" data-mode="play" title="趣味游戏与字卡特训">
            <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.arcade('w-7 h-7')}</span>
            <span class="text-xs sm:text-sm font-black text-purple-950">游乐场</span>
          </button>
          <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-sky-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer" data-mode="books" title="130本分级绘本">
            <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.book('w-7 h-7')}</span>
            <span class="text-xs sm:text-sm font-black text-sky-950">绘本馆</span>
          </button>
          <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-amber-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer" data-mode="cards" title="1490字卡中心">
            <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.cards('w-7 h-7')}</span>
            <span class="text-xs sm:text-sm font-black text-amber-950">字卡库</span>
          </button>
          <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-rose-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer" data-mode="reward" title="成就勋章与限定装扮商城">
            <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.chest('w-7 h-7')}</span>
            <span class="text-xs sm:text-sm font-black text-rose-950">奖励城堡</span>
          </button>
          <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-indigo-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer" data-mode="pk" title="字词1v1竞技场对战">
            <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.swords('w-7 h-7')}</span>
            <span class="text-xs sm:text-sm font-black text-indigo-950">竞技场</span>
          </button>
          <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-emerald-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer" data-mode="idiom" title="80+国学成语故事馆">
            <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.scroll('w-7 h-7')}</span>
            <span class="text-xs sm:text-sm font-black text-emerald-950">成语馆</span>
          </button>
          <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-orange-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer" data-mode="poem" title="20首经典启蒙古诗卡拉OK诵读">
            <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.book('w-7 h-7')}</span>
            <span class="text-xs sm:text-sm font-black text-orange-950">古诗馆</span>
          </button>
          <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-cyan-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer" data-mode="pinyin" title="部编版幼小衔接拼音王国">
            <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.sparkle('w-7 h-7')}</span>
            <span class="text-xs sm:text-sm font-black text-cyan-950">拼音岛</span>
          </button>
          <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-emerald-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer" data-mode="treehouse" title="凯茜伴学小树屋养成家园">
            <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.crown('w-7 h-7')}</span>
            <span class="text-xs sm:text-sm font-black text-emerald-950">伴学树屋</span>
          </button>
          <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-teal-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer" data-mode="review" title="艾宾浩斯每日复习">
            <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.bell('w-7 h-7')}</span>
            <span class="text-xs sm:text-sm font-black text-teal-950">每日复习</span>
          </button>
        </div>

        <div id="map-scroll-viewport" class="relative w-full h-full flex-1 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing no-scrollbar">
          
          <div class="relative h-full flex items-center bg-gradient-to-r ${islandCfg.themeGrad} overflow-hidden" style="min-width: ${Math.max(2800, displayChars.length * 208 + 400)}px;">
            
            <img src="${islandCfg.bgImg}" alt="${islandCfg.name}" fetchpriority="high" decoding="async" class="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none filter contrast-110" onerror="this.src='${islandCfg.bgFallback}'" />

            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>

            <div class="relative z-10 flex items-center justify-center gap-12 px-12">
              ${(() => {
                const firstUncompletedIndex = displayChars.findIndex((c) => !progress.charRecords[c.id]);
                const activeIndex = firstUncompletedIndex === -1 ? displayChars.length - 1 : firstUncompletedIndex;

                return displayChars
                  .map((charItem, index) => {
                    const record = progress.charRecords[charItem.id];
                    const isCompleted = !!record;
                    const isCurrent = index === activeIndex;
                    const isLocked = !isCompleted && !isCurrent;

                    // 产生波浪高低起伏 y 偏移 (使用负偏移抵消节点自身高度，保持视觉居中)
                    const yOffset = Math.sin(index * 0.8) * 40;

                    return `
                    <div class="relative flex flex-col items-center justify-center group level-node shrink-0${isCurrent ? " is-current" : ""} cursor-pointer transition-transform duration-300 hover:scale-125" style="transform: translateY(${yOffset}px)" data-char-id="${charItem.id}">
                      
                      ${
                        isCurrent
                          ? `
                        <div style="bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%) translateY(${-yOffset}px);" class="absolute z-30 pointer-events-none">
                          <div class="animate-bounce-cathy flex flex-col items-center">
                            <div class="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-2xl whitespace-nowrap mb-1 border-2 border-white animate-pulse flex items-center gap-1.5 max-w-[160px]">
                              <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
                              <span class="leading-none">学“${charItem.char}”字！</span>
                            </div>
                            <img src="assets/images/cathy_mascot.webp" class="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-2xl object-cover ring-4 ring-orange-400/80 aspect-square shrink-0" alt="凯茜" onerror="this.src='assets/images/icon_star.webp'" />
                          </div>
                        </div>
                      `
                          : ""
                      }

                    ${
                      isCompleted
                        ? `
                      <div class="absolute z-20 flex items-center justify-center pointer-events-none drop-shadow-[0_16px_32px_rgba(255,215,0,0.95)]" style="bottom: calc(100% + 10px); left: 50%; transform: translateX(-50%); width: 176px; height: 116px;">
                        <img src="assets/images/icon_crown.gif" class="w-full h-full object-contain" alt="crown" onerror="this.src='assets/images/icon_crown.png'" />
                      </div>
                    `
                        : ""
                    }

                    <div class="relative w-36 h-36 sm:w-40 sm:h-40 rounded-3xl flex flex-col items-center justify-center font-black shadow-2xl transition-all duration-300 ${
                      isCompleted
                        ? "bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 border-4 border-yellow-100 text-amber-950 ring-8 ring-amber-300/40"
                        : isCurrent
                        ? "bg-gradient-to-b from-orange-400 via-amber-500 to-orange-600 border-4 border-white text-white ring-8 ring-orange-400/60 animate-pulse"
                        : "bg-slate-700/80 border-4 border-slate-600 text-slate-400 opacity-60"
                    }">

                      <span class="text-8xl sm:text-9xl font-black drop-shadow-2xl tracking-wider flex items-center justify-center leading-none select-none">${isLocked ? GAME_ICONS.lock('w-16 h-16 sm:w-20 sm:h-20') : charItem.char}</span>
                      
                      <span class="text-sm sm:text-base font-black ${isCompleted ? "text-amber-950 font-extrabold" : "text-white"} mt-2 drop-shadow-sm select-none">${isLocked ? `第${index + 1}关` : charItem.pinyin}</span>
                    </div>

                    <div class="flex items-center gap-1.5 mt-2.5 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 shadow-lg">
                      <span class="flex items-center">${GAME_ICONS.star("w-5 h-5 sm:w-6 sm:h-6", !isCompleted)}</span>
                      <span class="flex items-center">${GAME_ICONS.star("w-5 h-5 sm:w-6 sm:h-6", !isCompleted)}</span>
                      <span class="flex items-center">${GAME_ICONS.star("w-5 h-5 sm:w-6 sm:h-6", !isCompleted)}</span>
                    </div>

                  </div>
                `;
              })
              .join("");
            })()}

              <div class="flex items-center gap-10 pl-10 pr-20 shrink-0">
                
                <div class="map-landmark-btn group relative w-48 h-56 rounded-3xl bg-gradient-to-b from-cyan-400 via-teal-500 to-indigo-700 border-4 border-white shadow-2xl p-5 flex flex-col items-center justify-between cursor-pointer hover:scale-110 active:scale-95 transition-all text-white shrink-0" data-mode="pinyin" title="点击进入拼音王国">
                  <span class="text-[11px] font-black bg-white/20 px-3 py-1 rounded-full border border-white/30">幼小衔接</span>
                  <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                    ${GAME_ICONS.sparkle("w-10 h-10")}
                  </div>
                  <div class="text-center">
                    <h3 class="text-base font-black">奇趣拼音王国</h3>
                    <p class="text-[10px] text-cyan-100 font-bold mt-0.5">63声韵 · 拼读碰撞</p>
                  </div>
                </div>

                <div class="map-landmark-btn group relative w-48 h-56 rounded-3xl bg-gradient-to-b from-emerald-400 via-teal-500 to-emerald-800 border-4 border-white shadow-2xl p-5 flex flex-col items-center justify-between cursor-pointer hover:scale-110 active:scale-95 transition-all text-white shrink-0" data-mode="family" title="点击进入字族积木屋">
                  <span class="text-[11px] font-black bg-white/20 px-3 py-1 rounded-full border border-white/30">构字工坊</span>
                  <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                    ${GAME_ICONS.gem("w-10 h-10")}
                  </div>
                  <div class="text-center">
                    <h3 class="text-base font-black">魔法积木屋</h3>
                    <p class="text-[10px] text-emerald-100 font-bold mt-0.5">偏旁字族 · 一字生万字</p>
                  </div>
                </div>

                <div class="map-landmark-btn group relative w-48 h-56 rounded-3xl bg-gradient-to-b from-amber-400 via-orange-500 to-amber-700 border-4 border-white shadow-2xl p-5 flex flex-col items-center justify-between cursor-pointer hover:scale-110 active:scale-95 transition-all text-white shrink-0" data-mode="treehouse" title="点击进入伴学小树屋">
                  <span class="text-[11px] font-black bg-white/20 px-3 py-1 rounded-full border border-white/30">养成家园</span>
                  <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                    ${GAME_ICONS.crown("w-10 h-10")}
                  </div>
                  <div class="text-center">
                    <h3 class="text-base font-black">伴学小树屋</h3>
                    <p class="text-[10px] text-amber-100 font-bold mt-0.5">浇水神木 · 伴学字谜</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

        <button id="btn-quick-target-char" class="absolute bottom-6 right-6 z-30 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white font-black text-sm px-6 py-3.5 rounded-full shadow-[0_10px_25px_rgba(255,107,0,0.6)] border-4 border-white active:scale-95 transition-all flex items-center gap-2 animate-bounce-slow cursor-pointer">
          <span class="flex items-center">${GAME_ICONS.compass('w-5 h-5')}</span>
          <span>直达最新生字</span>
        </button>

        <div class="absolute bottom-6 left-6 z-30 flex flex-col gap-2">
          
          <button id="btn-daily-signin" class="group bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-xl border-2 border-white/50 active:scale-95 transition-all flex items-center gap-2 cursor-pointer ${progress.todaySignedIn ? 'opacity-70 cursor-not-allowed' : 'animate-bounce-slow'}">
            <span class="flex items-center">${GAME_ICONS.calendar('w-4 h-4')}</span>
            <div class="flex flex-col items-start">
              <span>${progress.todaySignedIn ? '今日已签到' : '每日签到领奖励'}</span>
              <span class="text-[9px] text-white/80 font-bold">连续 ${progress.signInStreak || 0} 天</span>
            </div>
            ${!progress.todaySignedIn ? `<span class="bg-yellow-400 text-amber-900 text-[9px] font-black px-1.5 py-0.5 rounded-full ml-1">+5</span>` : ''}
          </button>

          <div class="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/20 shadow-xl">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] font-black text-amber-300">今日目标</span>
              <span class="text-[10px] text-white/60">${Math.min(progress.todayLearnedCount || 0, targetDaily)} / ${targetDaily} 个字</span>
            </div>
            <div class="w-36 h-2 bg-white/20 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700" style="width:${Math.min(((progress.todayLearnedCount || 0) / targetDaily) * 100, 100)}%"></div>
            </div>
          </div>

          <div class="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20 shadow-xl flex items-center gap-3">
            <span class="flex items-center">${GAME_ICONS.sparkle('w-4 h-4')}</span>
            <div>
              <div class="text-[10px] text-white/60 font-bold">已学 <b class="text-amber-300">${Object.keys(progress.charRecords || {}).length}</b> / ${CHARACTER_DATABASE.length} 字</div>
              <div class="text-[10px] text-white/60 font-bold">星币 <b class="text-yellow-300">${progress.coins}</b> · 星星 <b class="text-amber-300">${progress.stars}</b></div>
            </div>
          </div>
        </div>

        <div id="world-overview-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center p-6 select-none animate-fade-in ${this.showWorldOverview ? "" : "hidden"}">
          <div class="relative w-full max-w-5xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 rounded-3xl border-4 border-amber-300/80 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
            
            <div class="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-amber-900/60 to-purple-900/60 border-b border-white/20">
              <div class="flex items-center gap-3">
                <span class="flex items-center">${GAME_ICONS.compass('w-7 h-7')}</span>
                <div>
                  <h2 class="text-xl font-black text-amber-200">识字大陆 · 世界全景图</h2>
                  <p class="text-xs text-white/60 font-bold">点击任意主题岛屿，即刻传送开启识字冒险</p>
                </div>
              </div>
              <button id="btn-close-world-overview" class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black flex items-center justify-center active:scale-90 transition-transform cursor-pointer" title="关闭">
                ${GAME_ICONS.back("w-5 h-5")}
              </button>
            </div>

            <div class="relative p-6 flex flex-col items-center">
              <div class="relative w-full h-80 rounded-2xl overflow-hidden border-2 border-amber-300/40 shadow-inner mb-6">
                <img src="assets/images/cathy_world_map.webp" class="w-full h-full object-cover" alt="世界全景图" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
                <div class="absolute bottom-4 left-4 text-white font-black text-sm bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                  <span class="flex items-center">${GAME_ICONS.sparkle('w-4 h-4')}</span>
                  <span>三大主题岛屿与 1490 识字关卡</span>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4 w-full">
                ${[1, 2, 3].map((islandId) => {
                  const cfg = ISLAND_CONFIG[islandId];
                  const isCurrent = this.currentIsland === islandId;
                  return `
                    <div class="island-teleport-card relative rounded-2xl p-4 border-2 ${
                      isCurrent
                        ? "border-amber-400 bg-amber-400/15 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                        : "border-white/15 bg-white/5 hover:border-white/40 hover:bg-white/10"
                    } flex flex-col items-center text-center transition-all cursor-pointer" data-island="${islandId}">
                      <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-white/40 shadow-md mb-2">
                        <img src="${cfg.bgImg}" class="w-full h-full object-cover" alt="${cfg.name}" />
                      </div>
                      <h3 class="text-sm font-black text-white mb-0.5">${cfg.name}</h3>
                      <p class="text-[10px] text-white/60 font-bold mb-3">${cfg.sub}</p>
                      <button class="w-full py-2 rounded-xl text-xs font-black ${
                        isCurrent
                          ? "bg-amber-400 text-amber-950 font-black shadow-md"
                          : "bg-gradient-to-r " + cfg.btnGrad + " text-white shadow"
                      } active:scale-95 transition-transform pointer-events-none">
                        ${isCurrent ? "当前所在岛屿" : "传送前往"}
                      </button>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>

          </div>
        </div>

      </div>
    `;

    this.bindEvents(mainEl);
    this.autoScrollToCurrent();
  }

  renderIsland(islandId) {
    this._userSelectedIsland = true;
    this.currentIsland = islandId;
    this.render();
  }

  autoScrollToCurrent() {
    // 找到当前学习中的关卡节点
    const currentNode = this.container.querySelector(".level-node.is-current");
    const viewport = this.container.querySelector("#map-scroll-viewport");
    if (currentNode && viewport) {
      this._timeout(() => {
        if (typeof currentNode.getBoundingClientRect === "function" && typeof viewport.getBoundingClientRect === "function") {
          const nodeRect = currentNode.getBoundingClientRect();
          const viewportRect = viewport.getBoundingClientRect();
          const offset = nodeRect.left - viewportRect.left - (viewportRect.width / 2) + (nodeRect.width / 2);
          if (typeof viewport.scrollTo === "function") {
            viewport.scrollTo({ left: (viewport.scrollLeft || 0) + offset, behavior: "smooth" });
          } else {
            viewport.scrollLeft = (viewport.scrollLeft || 0) + offset;
          }
        }
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

    // 世界全景图 Modal 打开 / 关闭 / 传送
    const openOverviewBtn = mainEl.querySelector("#btn-open-world-overview");
    const closeOverviewBtn = mainEl.querySelector("#btn-close-world-overview");
    const overviewModal = mainEl.querySelector("#world-overview-modal");

    if (openOverviewBtn && overviewModal) {
      this._on(openOverviewBtn, "click", () => {
        soundAndFX.playPop();
        this.showWorldOverview = true;
        overviewModal.classList.remove("hidden");
      });
    }

    if (closeOverviewBtn && overviewModal) {
      this._on(closeOverviewBtn, "click", () => {
        soundAndFX.playPop();
        this.showWorldOverview = false;
        overviewModal.classList.add("hidden");
      });
    }

    mainEl.querySelectorAll(".island-teleport-card").forEach((card) => {
      this._on(card, "click", () => {
        const islandId = parseInt(card.dataset.island, 10);
        soundAndFX.playStarChime();
        soundAndFX.triggerConfetti(this.container);
        this.showWorldOverview = false;
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
        this._timeout(() => this.render(), 1500);
      });
    }

    // 快捷直达
    const quickBtn = mainEl.querySelector("#btn-quick-target-char");
    if (quickBtn) {
      this._on(quickBtn, "click", () => {
        const currentIdx = Math.max(0, (ebbinghausManager.progress.currentLevelIndex || 1) - 1);
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

      // 触摸事件 (移动端与平板) — 允许点击穿透，并在滑动时流畅平移大地图
      this._on(viewport, "touchstart", (e) => {
        if (!e.touches || e.touches.length === 0) return;
        isDown = true;
        startX = e.touches[0].pageX - viewport.offsetLeft;
        scrollLeft = viewport.scrollLeft;
      }, { passive: true });

      this._on(viewport, "touchend", () => {
        isDown = false;
      });

      this._on(viewport, "touchmove", (e) => {
        if (!isDown || !e.touches || e.touches.length === 0) return;
        const x = e.touches[0].pageX - viewport.offsetLeft;
        const walk = (x - startX) * 1.5;
        viewport.scrollLeft = scrollLeft - walk;
      }, { passive: true });
    }
  }
}
