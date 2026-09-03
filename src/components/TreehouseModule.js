/**
 * 凯茜识字 (Cathy Literacy) - 凯茜伴学小树屋养成家园
 * -----------------------------------------------------------------
 * 1. 随 1490 识字进度动态生长的大树家园（从幼苗到参天识字神木）。
 * 2. 伴学精灵凯茜多感官物理互动：喂食小点心、每日浇水、房间装饰、伴学鼓励。
 * 3. 严守工程红线：绝对零 Unicode Emoji，零 SVG。
 */

import { BaseModule } from "../utils/BaseModule.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { mountGameShell, showGameToast } from "./SharedShell.js";
import { GAME_ICONS } from "../utils/gameIcons.js";
import { EVENTS } from "../utils/eventBus.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { storageManager } from "../utils/storageManager.js";

export class TreehouseModule extends BaseModule {
  constructor(container) {
    super(container);
    this.treeWaterCount = storageManager.getItem("cathy_tree_water_count", 0);
    this.cathyHunger = storageManager.getItem("cathy_hunger_val", 80);
  }

  getTreeStage(learnedCount) {
    if (learnedCount >= 601) {
      return { level: 4, name: "参天智慧神木", desc: "枝繁叶茂，挂满了 600+ 识字硕果！", scale: "scale-110" };
    }
    if (learnedCount >= 201) {
      return { level: 3, name: "茂盛繁花树", desc: "绿意盎然，已经掌握了 200+ 常用汉字！", scale: "scale-100" };
    }
    if (learnedCount >= 51) {
      return { level: 2, name: "蓬勃生机树", desc: "生机勃勃，正在大步迈向更高阶！", scale: "scale-90" };
    }
    return { level: 1, name: "幼嫩识字苗", desc: "刚刚破土而出，每天识字浇水快快长大！", scale: "scale-75" };
  }

  render() {
    this.destroy();

    const progress = ebbinghausManager.progress;
    // 与 ParentModule 保持一致的已学字数口径（ebbinghausManager 无 getLearnedCount 方法）
    const learnedCount = Object.keys(progress.charRecords || {}).length;
    const stage = this.getTreeStage(learnedCount);
    const coins = progress.coins || 0;

    const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
      activeMode: "play",
      heading: "凯茜伴学小树屋"
    });
    this._addCleanup(destroyShell);

    mainEl.innerHTML = `
      <div class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pb-8 overflow-y-auto no-scrollbar max-h-[calc(100vh-100px)]">
        
        <div class="w-full flex flex-col sm:flex-row items-center justify-between bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl border-2 border-emerald-200 mb-6 gap-4">
          <div class="flex items-center gap-3">
            <button id="btn-tree-back" class="w-10 h-10 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-950 flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer" title="返回大地图">
              ${GAME_ICONS.back("w-5 h-5")}
            </button>
            <div>
              <h1 class="text-base font-black text-emerald-950 flex items-center gap-2">
                <span class="flex items-center">${GAME_ICONS.crown("w-5 h-5")}</span>
                <span>凯茜伴学小树屋 · 养成家园</span>
              </h1>
              <p class="text-xs text-emerald-700 font-semibold">陪伴成长 · 浇水长成参天神木 · 与凯茜快乐互动</p>
            </div>
          </div>

          <div class="flex items-center gap-4 bg-emerald-50 px-5 py-2 rounded-full border border-emerald-200">
            <div class="flex items-center gap-1.5">
              <span class="flex items-center">${GAME_ICONS.gem("w-5 h-5")}</span>
              <span id="tree-coin-display" class="text-xs font-black text-amber-700">${coins} 金币</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="flex items-center">${GAME_ICONS.book("w-5 h-5")}</span>
              <span class="text-xs font-black text-emerald-900">已学 ${learnedCount} 字</span>
            </div>
          </div>
        </div>

        <div class="relative w-full bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-emerald-300 flex flex-col items-center justify-between min-h-[480px] overflow-hidden">
          
          <div class="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-yellow-300/30 blur-3xl pointer-events-none"></div>

          <div class="z-10 flex flex-col items-center bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-2xl border-2 border-emerald-300 shadow-md">
            <span class="text-xs font-black text-emerald-900 flex items-center gap-1.5">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
              <span>当前树木形态：第 ${stage.level} 阶 · 【${stage.name}】</span>
            </span>
            <span class="text-[11px] text-gray-500 font-bold mt-0.5">${stage.desc}</span>
          </div>

          <div class="relative w-full flex-1 flex flex-col items-center justify-center my-6">
            
            <div id="tree-graphic-block" class="relative flex flex-col items-center justify-center transition-all duration-700 ${stage.scale}">
              <div class="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 border-4 border-white shadow-[0_16px_48px_rgba(16,185,129,0.4)] flex flex-col items-center justify-center text-white relative">
                <span class="text-4xl sm:text-5xl font-black font-serif">智</span>
                <span class="text-xs font-bold text-emerald-100 mt-1">识字神木</span>
                
                <div class="absolute -top-3 left-4 w-9 h-9 rounded-full bg-amber-400 border-2 border-white shadow-lg flex items-center justify-center text-amber-950 font-black text-xs animate-bounce-cathy">
                  +1
                </div>
                <div class="absolute top-8 -right-3 w-9 h-9 rounded-full bg-amber-400 border-2 border-white shadow-lg flex items-center justify-center text-amber-950 font-black text-xs animate-bounce-cathy">
                  +1
                </div>
              </div>

              <div class="w-14 h-16 bg-amber-800 rounded-b-xl border-x-2 border-amber-950 shadow-md"></div>
            </div>

            <div id="cathy-companion-actor" class="mt-4 bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-3xl border-2 border-emerald-300 shadow-xl flex items-center gap-4 cursor-pointer hover:scale-105 active:scale-95 transition-all">
              <img src="assets/images/cathy_mascot.webp" class="w-14 h-14 rounded-full border-2 border-white shadow-lg object-cover ring-2 ring-orange-400/80 aspect-square shrink-0 animate-bounce-slow" alt="凯茜" onerror="this.src='assets/images/icon_crown.png'" />
              <div class="flex flex-col">
                <span class="text-xs font-black text-emerald-950 flex items-center gap-1">
                  <span>伴学小精灵 · 凯茜</span>
                  <span class="flex items-center text-amber-500">${GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
                </span>
                <p id="cathy-speech-bubble" class="text-xs text-emerald-700 font-bold mt-0.5">
                  “你好呀！今天想和我一起给智慧大树浇水吗？”
                </p>
              </div>
            </div>

          </div>

          <div class="z-10 w-full max-w-xl bg-white/95 backdrop-blur-md p-4 rounded-3xl border-2 border-emerald-200 shadow-xl flex items-center justify-around gap-3">
            
            <button id="btn-tree-water" class="btn-game-orange text-white text-xs sm:text-sm font-black px-6 py-3.5 rounded-2xl shadow-md active:scale-95 flex items-center gap-2 cursor-pointer flex-1 justify-center">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
              <span>浇水培育 (5金币)</span>
            </button>

            // 2. 喂食凯茜
            <button id="btn-feed-cathy" class="bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs sm:text-sm font-black px-6 py-3.5 rounded-2xl shadow-md active:scale-95 flex items-center gap-2 cursor-pointer flex-1 justify-center">
              <span class="flex items-center">${GAME_ICONS.coin("w-4 h-4")}</span>
              <span>给凯茜点心</span>
            </button>

            // 3. 听凯茜讲汉字谜语
            <button id="btn-cathy-riddle" class="bg-emerald-100 hover:bg-emerald-200 text-emerald-950 text-xs sm:text-sm font-black px-5 py-3.5 rounded-2xl shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.speaker("w-4 h-4")}</span>
              <span>听字谜</span>
            </button>

          </div>

        </div>

      </div>
    `;

    this._bindTreeEvents(mainEl);
  }

  _bindTreeEvents(mainEl) {
    // 1. 返回大地图
    const backBtn = mainEl.querySelector("#btn-tree-back");
    if (backBtn) {
      this._on(backBtn, "click", () => {
        soundAndFX.playPop();
        this._busEmit(EVENTS.SWITCH_MODE, { mode: "map" });
      });
    }

    // 2. 浇水成长
    const waterBtn = mainEl.querySelector("#btn-tree-water");
    if (waterBtn) {
      this._on(waterBtn, "click", () => {
        if (ebbinghausManager.progress.coins < 5) {
          soundAndFX.playSoftError();
          showGameToast(this.container, "金币不足哦，去多学几个新汉字赢取金币吧！", "error");
          return;
        }

        ebbinghausManager.deductCoins(5);
        this.treeWaterCount++;
        storageManager.setItem("cathy_tree_water_count", this.treeWaterCount);

        soundAndFX.playSuccess();
        soundAndFX.triggerConfetti(this.container);

        const treeGraphic = mainEl.querySelector("#tree-graphic-block");
        if (treeGraphic) {
          treeGraphic.classList.add("scale-125", "rotate-3");
          setTimeout(() => treeGraphic.classList.remove("scale-125", "rotate-3"), 600);
        }

        const speechBubble = mainEl.querySelector("#cathy-speech-bubble");
        if (speechBubble) {
          speechBubble.textContent = "“哗啦啦！大树喝到了甘甜泉水，长得更快啦！谢谢你！”";
        }
        soundAndFX.speakPriority("大树喝到了甘甜泉水，长得更快啦！", { kind: "sentence", priority: 1 });

        const coinDisplay = mainEl.querySelector("#tree-coin-display");
        if (coinDisplay) {
          coinDisplay.textContent = `${ebbinghausManager.progress.coins} 金币`;
        }
      });
    }

    // 3. 喂食凯茜
    const feedBtn = mainEl.querySelector("#btn-feed-cathy");
    if (feedBtn) {
      this._on(feedBtn, "click", () => {
        soundAndFX.playSuccess();
        ebbinghausManager.addCoins(2);

        const actor = mainEl.querySelector("#cathy-companion-actor");
        if (actor) {
          actor.classList.add("scale-110", "bg-amber-100");
          setTimeout(() => actor.classList.remove("scale-110", "bg-amber-100"), 400);
        }

        const speechBubble = mainEl.querySelector("#cathy-speech-bubble");
        if (speechBubble) {
          speechBubble.textContent = "“哇！美味的小点心！凯茜充满活力啦，送你 2 枚小金币！”";
        }
        soundAndFX.speakPriority("哇！美味的小点心！凯茜充满活力啦！", { kind: "sentence", priority: 1 });

        const coinDisplay = mainEl.querySelector("#tree-coin-display");
        if (coinDisplay) {
          coinDisplay.textContent = `${ebbinghausManager.progress.coins} 金币`;
        }
      });
    }

    // 4. 听汉字字谜
    const riddleBtn = mainEl.querySelector("#btn-cathy-riddle");
    if (riddleBtn) {
      const riddles = [
        "字谜：一口咬掉牛尾巴，猜一个字？是‘告’字哦！",
        "字谜：两人土上坐，猜一个字？是‘坐’字哦！",
        "字谜：太阳从地平线升起来，猜一个字？是‘旦’字哦！",
        "字谜：一棵树是木，两棵树是林，三棵树是什么呀？是‘森’字哦！"
      ];
      this._on(riddleBtn, "click", () => {
        soundAndFX.playPop();
        const r = riddles[Math.floor(Math.random() * riddles.length)];
        const speechBubble = mainEl.querySelector("#cathy-speech-bubble");
        if (speechBubble) {
          speechBubble.textContent = `“${r}”`;
        }
        soundAndFX.speakPriority(r, { kind: "sentence", priority: 1 });
      });
    }
  }
}
