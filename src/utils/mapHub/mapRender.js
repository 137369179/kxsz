/** MapModule — landscape world map render */
import { CHARACTER_DATABASE } from "../../data/characters.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { mountGameShell } from "../../components/SharedShell.js";
import { GAME_ICONS } from "../gameIcons.js";
import { ISLAND_CONFIG } from "./islandConfig.js";
import { getSessionConfig, planDailySession, setDeps } from "../sessionPlanner.js";
import { getQuestProgressSnapshot } from "./dailyQuestModal.js";

export function renderMap() {
  this.destroy();
  const progress = ebbinghausManager.progress;
  const targetDaily = Math.max(1, progress.settings?.dailyCharTarget || 5);
  const allChars = CHARACTER_DATABASE;
  const age = ebbinghausManager.getAge();
  const sessionCfg = getSessionConfig(age);
  setDeps({ ebbinghaus: ebbinghausManager, characterDB: CHARACTER_DATABASE });
  const questSnap = getQuestProgressSnapshot(planDailySession());
  const questPct = questSnap.total > 0 ? Math.round((questSnap.completed / questSnap.total) * 100) : 0;

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
        <button id="btn-daily-quest" class="px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all flex items-center gap-2 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white shadow-lg ring-2 ring-pink-300 hover:scale-105 active:scale-95 cursor-pointer touch-target" title="今天的小冒险" aria-label="打开今天的小冒险，已完成${questSnap.completed}项共${questSnap.total}项" data-speak="开始今天的小冒险！">
          <span class="flex items-center">${GAME_ICONS.sparkle('w-5 h-5')}</span>
          <span>今日学练</span>
          <span class="bg-white/25 px-2 py-0.5 rounded-full text-[10px] font-mono" aria-hidden="true">${questSnap.completed}/${questSnap.total || sessionCfg.newChars + sessionCfg.reviews}</span>
          <span class="hidden sm:inline-flex w-10 h-2 rounded-full bg-white/30 overflow-hidden" aria-hidden="true"><span class="h-full bg-white rounded-full" style="width:${questPct}%"></span></span>
        </button>

        <div class="w-[1px] h-6 bg-white/30 mx-1"></div>

        <button id="btn-open-world-overview" class="px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 shadow-md active:scale-95 cursor-pointer" title="查看三大岛屿世界全景图" data-speak="看看世界全景图吧！">
          <span class="flex items-center">${GAME_ICONS.compass('w-6 h-6')}</span>
          <span>世界全景</span>
        </button>

        <div class="w-[1px] h-6 bg-white/30 mx-1"></div>

        <button class="island-tab-btn px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer touch-target ${
          this.currentIsland === 1 ? "bg-emerald-500 text-white shadow-lg scale-105 ring-2 ring-emerald-300" : "text-white/80 hover:text-white"
        }" data-island="1" aria-label="奇幻森林岛" data-speak="去奇幻森林岛">
          <span class="flex items-center">${GAME_ICONS.islandForest('w-6 h-6')}</span>
          <span>奇幻森林岛</span>
        </button>
        <button class="island-tab-btn px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer touch-target ${
          this.currentIsland === 2 ? "bg-amber-500 text-white shadow-lg scale-105 ring-2 ring-amber-300" : "text-white/80 hover:text-white"
        }" data-island="2" aria-label="缤纷生活岛" data-speak="去缤纷生活岛">
          <span class="flex items-center">${GAME_ICONS.islandTown('w-6 h-6')}</span>
          <span>缤纷生活岛</span>
        </button>
        <button class="island-tab-btn px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer touch-target ${
          this.currentIsland === 3 ? "bg-indigo-600 text-white shadow-lg scale-105 ring-2 ring-indigo-300" : "text-white/80 hover:text-white"
        }" data-island="3" aria-label="星际探索岛" data-speak="去星际探索岛">
          <span class="flex items-center">${GAME_ICONS.islandSpace('w-6 h-6')}</span>
          <span>星际探索岛</span>
        </button>
      </div>

      <div class="absolute top-20 right-6 z-20 flex items-center gap-2 max-w-[calc(100vw-540px)] overflow-x-auto no-scrollbar py-1.5 px-2.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
        <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-purple-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer touch-target" data-mode="play" title="游乐场" aria-label="游乐场" data-speak="去游乐场玩吧！">
          <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.arcade('w-7 h-7')}</span>
          <span class="text-xs sm:text-sm font-black text-purple-950">游乐场</span>
        </button>
        <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-sky-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer touch-target" data-mode="books" title="绘本馆" aria-label="绘本馆" data-speak="去绘本馆读故事啦！">
          <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.book('w-7 h-7')}</span>
          <span class="text-xs sm:text-sm font-black text-sky-950">绘本馆</span>
        </button>
        <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-amber-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer touch-target" data-mode="cards" title="字卡库" aria-label="字卡库" data-speak="打开字卡库">
          <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.cards('w-7 h-7')}</span>
          <span class="text-xs sm:text-sm font-black text-amber-950">字卡库</span>
        </button>
        <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-rose-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer touch-target" data-mode="reward" title="奖励城堡" aria-label="奖励城堡" data-speak="去奖励城堡领奖励！">
          <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.chest('w-7 h-7')}</span>
          <span class="text-xs sm:text-sm font-black text-rose-950">奖励城堡</span>
        </button>
        <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-indigo-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer touch-target" data-mode="pk" title="竞技场" aria-label="竞技场" data-speak="去竞技场对战！">
          <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.swords('w-7 h-7')}</span>
          <span class="text-xs sm:text-sm font-black text-indigo-950">竞技场</span>
        </button>
        <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-emerald-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer touch-target" data-mode="idiom" title="成语馆" aria-label="成语馆" data-speak="去成语馆听故事！">
          <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.scroll('w-7 h-7')}</span>
          <span class="text-xs sm:text-sm font-black text-emerald-950">成语馆</span>
        </button>
        <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-orange-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer touch-target" data-mode="poem" title="古诗馆" aria-label="古诗馆" data-speak="去诵读古诗吧！">
          <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.book('w-7 h-7')}</span>
          <span class="text-xs sm:text-sm font-black text-orange-950">古诗馆</span>
        </button>
        <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-cyan-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer touch-target" data-mode="pinyin" title="拼音岛" aria-label="拼音岛" data-speak="去拼音岛玩拼音！">
          <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.sparkle('w-7 h-7')}</span>
          <span class="text-xs sm:text-sm font-black text-cyan-950">拼音岛</span>
        </button>
        <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-emerald-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer touch-target" data-mode="treehouse" title="伴学树屋" aria-label="伴学树屋" data-speak="去伴学树屋找凯茜玩！">
          <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.crown('w-7 h-7')}</span>
          <span class="text-xs sm:text-sm font-black text-emerald-950">伴学树屋</span>
        </button>
        <button class="map-landmark-btn shrink-0 group bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-teal-300 shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer touch-target" data-mode="review" title="每日复习" aria-label="每日复习" data-speak="去复习老朋友吧！">
          <span class="flex items-center group-hover:scale-110 transition-transform">${GAME_ICONS.bell('w-7 h-7')}</span>
          <span class="text-xs sm:text-sm font-black text-teal-950">每日复习</span>
        </button>
      </div>

      <div id="map-scroll-viewport" class="relative w-full h-full flex-1 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing no-scrollbar">
        
        <div class="relative h-full flex items-center bg-gradient-to-r ${islandCfg.themeGrad} overflow-hidden" style="min-width: ${Math.max(2800, displayChars.length * 208 + 400)}px;">
          
          <img src="${islandCfg.bgImg}" alt="${islandCfg.name}" fetchpriority="high" decoding="async" class="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none filter contrast-110" data-fallback="${islandCfg.bgFallback}" />

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
                  <div class="relative flex flex-col items-center justify-center group level-node shrink-0${isCurrent ? " is-current" : ""} cursor-pointer transition-transform duration-300 hover:scale-125" style="transform: translateY(${yOffset}px); content-visibility: auto; contain-intrinsic-size: auto 208px;" data-char-id="${charItem.id}">
                    
                    ${
                      isCurrent
                        ? `
                      <div style="bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%) translateY(${-yOffset}px);" class="absolute z-30 pointer-events-none">
                        <div class="animate-bounce-cathy flex flex-col items-center">
                          <div class="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-2xl whitespace-nowrap mb-1 border-2 border-white animate-pulse flex items-center gap-1.5 max-w-[160px]">
                            <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
                            <span class="leading-none">学“${charItem.char}”字！</span>
                          </div>
                          <img src="assets/images/cathy_mascot.webp" class="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-2xl object-cover ring-4 ring-orange-400/80 aspect-square shrink-0" alt="凯茜" data-fallback="assets/images/icon_star.webp" />
                        </div>
                      </div>
                    `
                        : ""
                    }

                  ${
                    isCompleted
                      ? `
                    <div class="absolute z-20 flex items-center justify-center pointer-events-none drop-shadow-[0_16px_32px_rgba(255,215,0,0.95)]" style="bottom: calc(100% + 10px); left: 50%; transform: translateX(-50%); width: 176px; height: 116px;">
                      <img src="assets/images/icon_crown.gif" class="w-full h-full object-contain" alt="crown" data-fallback="assets/images/icon_crown.png" />
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

