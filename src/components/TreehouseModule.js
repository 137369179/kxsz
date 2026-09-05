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
import { getCollectionStats } from "../utils/rewardEngine.js";
import { SHOP_DECORATIONS } from "../data/shop.js";
import { CHARACTER_DATABASE } from "../data/characters.js";
import { checkSynthesis } from "../utils/alchemyEngine.js";

export class TreehouseModule extends BaseModule {
  constructor(container) {
    super(container);
    this.treeWaterCount = Number.parseInt(storageManager.getItem("cathy_tree_water_count", "0"), 10) || 0;
    this.cathyHunger = Number.parseInt(storageManager.getItem("cathy_hunger_val", "80"), 10) || 80;
  }

  getTreeStage(learnedCount) {
    const growthScore = learnedCount + this.treeWaterCount * 5;
    if (growthScore >= 601) {
      return { level: 4, name: "参天智慧神木", desc: "枝繁叶茂，挂满了 600+ 识字硕果！", scale: "scale-105", image: "assets/images/tree_stage_4.webp" };
    }
    if (growthScore >= 201) {
      return { level: 3, name: "茂盛繁花树", desc: "绿意盎然，已经掌握了 200+ 常用汉字！", scale: "scale-100", image: "assets/images/tree_stage_3.webp" };
    }
    if (growthScore >= 51) {
      return { level: 2, name: "蓬勃生机树", desc: "生机勃勃，正在大步迈向更高阶！", scale: "scale-95", image: "assets/images/tree_stage_2.webp" };
    }
    return { level: 1, name: "幼嫩识字苗", desc: "刚刚破土而出，每天识字浇水快快长大！", scale: "scale-90", image: "assets/images/tree_stage_1.webp" };
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
            <button id="btn-tree-back" data-speak="返回地图" aria-label="返回地图" class="flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-white/50 touch-target cursor-pointer transform transition-transform hover:scale-105 active:scale-95" title="返回大地图">
              <img src="/assets/images/icon_red_door.jpg" alt="返回" class="w-10 h-10 object-cover" />
            </button>
            <div>
              <h1 class="text-base font-black text-emerald-950 flex items-center gap-2">
                <span class="flex items-center"><img src="/assets/images/icon_crown.jpg" class="w-5 h-5 rounded-full" alt="Crown" /></span>
                <span>凯茜伴学小树屋 · 养成家园</span>
              </h1>
              <p class="text-xs text-emerald-700 font-semibold">陪伴成长 · 浇水长成参天神木 · 与凯茜快乐互动</p>
            </div>
          </div>

          <div class="flex items-center gap-4 bg-emerald-50 px-5 py-2 rounded-full border border-emerald-200">
            <div class="flex items-center gap-1.5">
              <span class="flex items-center"><img src="/assets/images/icon_gem.jpg" class="w-5 h-5 rounded-full" alt="Gem" /></span>
              <span id="tree-coin-display" class="text-xs font-black text-amber-700">${coins} 金币</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="flex items-center"><img src="/assets/images/icon_book.jpg" class="w-5 h-5 rounded-full" alt="Book" /></span>
              <span class="text-xs font-black text-emerald-900">已学 ${learnedCount} 字</span>
            </div>
          </div>
        </div>

        <div class="relative w-full bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-emerald-300 flex flex-col items-center justify-between min-h-[480px] overflow-hidden">
          
          <div class="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-yellow-300/30 blur-3xl pointer-events-none"></div>

          <div class="z-10 flex flex-col items-center bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-2xl border-2 border-emerald-300 shadow-md">
            <span class="text-xs font-black text-emerald-900 flex items-center gap-1.5">
              <span class="flex items-center"><img src="/assets/images/icon_sparkle.jpg" class="w-4 h-4 rounded-full" alt="Sparkle" /></span>
              <span>当前树木形态：第 ${stage.level} 阶 · 【${stage.name}】</span>
            </span>
            <span class="text-[11px] text-gray-500 font-bold mt-0.5">${stage.desc}</span>
          </div>

          <div class="relative w-full flex-1 flex flex-col items-center justify-center my-6">
            
            <div id="tree-graphic-block" class="relative flex flex-col items-center justify-center transition-all duration-700 ${stage.scale}">
              <div class="relative w-52 h-52 sm:w-60 sm:h-60 rounded-3xl overflow-hidden border-4 border-emerald-300 shadow-[0_20px_50px_rgba(16,185,129,0.45)] ring-4 ring-white/80 group">
                <img src="${stage.image}" alt="${stage.name}" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" data-fallback="assets/images/cathy_island_forest.webp" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                <div class="absolute bottom-2.5 inset-x-0 flex flex-col items-center text-white drop-shadow-md">
                  <span class="text-xs font-black bg-emerald-700/85 px-3 py-1 rounded-full border border-emerald-300/80 shadow-md backdrop-blur-sm">
                    ${stage.name} · 第 ${stage.level} 阶
                  </span>
                </div>
                
                <div class="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-amber-400 border-2 border-white shadow-lg flex items-center justify-center text-amber-950 font-black text-xs animate-bounce-cathy">
                  +1
                </div>
                <div class="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-emerald-400 border-2 border-white shadow-lg flex items-center justify-center text-emerald-950 font-black text-xs animate-bounce-cathy">
                  +1
                </div>

                ${(() => {
                  const decors = ebbinghausManager.getEquippedDecorations() || [];
                  const decorPositions = {
                    "decor_windchime": "top-2 left-2 w-16 h-16 drop-shadow-xl animate-bounce-slow origin-top",
                    "decor_swing": "bottom-4 left-4 w-20 h-20 drop-shadow-2xl animate-pulse",
                    "decor_lantern": "top-2 right-2 w-14 h-14 drop-shadow-lg",
                    "decor_birdhouse": "top-14 right-2 w-14 h-14 drop-shadow-md"
                  };
                  return decors.map(id => {
                    const item = SHOP_DECORATIONS.find(d => d.id === id);
                    if (!item) return "";
                    return `<img src="${item.icon}" class="absolute z-20 ${decorPositions[id] || ''} object-contain rounded-full border-2 border-amber-200/50" alt="${item.name}"/>`;
                  }).join('');
                })()}

              </div>
            </div>

            <div id="cathy-companion-actor" class="mt-4 bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-3xl border-2 border-emerald-300 shadow-xl flex items-center gap-4 cursor-pointer hover:scale-105 active:scale-95 transition-all relative">
              <button id="btn-cathy-riddle" data-speak="听字谜" aria-label="听字谜" class="absolute -top-10 -right-6 w-16 h-16 rounded-full overflow-hidden shadow-2xl border-4 border-yellow-300 animate-bounce-slow hover:scale-110 active:scale-95 transition-all z-20 ring-4 ring-yellow-300">
                <img src="/assets/images/icon_star.jpg" alt="字谜" class="w-full h-full object-cover" />
              </button>
              <div class="flex flex-col items-center">
                <img src="assets/images/cathy_mascot.webp" class="w-14 h-14 rounded-full border-2 border-white shadow-lg object-cover ring-2 ring-orange-400/80 aspect-square shrink-0 animate-bounce-slow" alt="凯茜" data-fallback="assets/images/icon_crown.png" />
                <div class="w-full h-2 bg-gray-200 rounded-full mt-2 border border-gray-300 overflow-hidden relative">
                  <div class="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300" style="width: ${this.cathyHunger}%;"></div>
                </div>
                <div class="text-[9px] text-orange-700 font-bold mt-0.5">饱食度: ${this.cathyHunger}/100</div>
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-black text-emerald-950 flex items-center gap-1">
                  <span>伴学小精灵 · 凯茜</span>
                  <span class="flex items-center text-amber-500"><img src="/assets/images/icon_sparkle.jpg" class="w-4 h-4 rounded-full" alt="Sparkle" /></span>
                </span>
                <p id="cathy-speech-bubble" class="text-xs text-emerald-700 font-bold mt-0.5">
                  “你好呀！今天想和我一起给智慧大树浇水吗？”
                </p>
              </div>
            </div>

          </div>

          ${(() => {
            const stats = getCollectionStats();
            const pct = stats.total ? Math.round((stats.learnedCount / stats.total) * 100) : 0;
            const ornaments = [
              { need: 5, name: "小风铃", unlock: stats.learnedCount >= 5 },
              { need: 30, name: "彩虹旗", unlock: stats.learnedCount >= 30 },
              { need: 100, name: "金鸟巢", unlock: stats.learnedCount >= 100 },
              { need: 201, name: "星灯笼", unlock: stats.byStage.find(s=>s.stage===2)?.learned >= 1 || stats.learnedCount >= 201 },
            ];
            return `
          <div class="z-10 w-full max-w-xl mt-4 bg-white/95 backdrop-blur-md p-4 rounded-3xl border-2 border-amber-200 shadow-xl" aria-live="polite">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-black text-amber-950">图鉴装饰解锁</span>
              <span class="text-[11px] font-bold text-amber-700">已收集 ${stats.learnedCount} 字 · ${pct}%</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              ${ornaments.map(o => `
                <div class="rounded-2xl border-2 ${o.unlock ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-gray-50 opacity-70"} p-2 text-center">
                  <div class="text-xs font-black ${o.unlock ? "text-emerald-800" : "text-gray-500"}">${o.unlock ? o.name : "？"}</div>
                  <div class="text-[10px] font-bold text-gray-500 mt-0.5">${o.unlock ? "已点亮" : `再学到 ${o.need} 字`}</div>
                </div>`).join("")}
            </div>
          </div>`;
          })()}

          <div class="z-10 w-full max-w-xl bg-white/95 backdrop-blur-md p-4 rounded-3xl border-2 border-emerald-200 shadow-xl flex items-center justify-around gap-3">
            
            <button id="btn-tree-water" data-speak="给大树浇水" aria-label="浇水培育" class="flex-shrink-0 rounded-3xl overflow-hidden shadow-lg border-4 border-amber-200 touch-target cursor-pointer transform transition-transform hover:scale-105 active:scale-95 flex-1 max-w-xs aspect-square relative group">
              <img src="/assets/images/icon_watering_can.jpg" alt="浇水" class="w-full h-full object-cover" />
              <div class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1 shadow-md">
                <img src="/assets/images/icon_coin.jpg" class="w-4 h-4 rounded-full" alt="Coin" />
                <span class="text-white font-black text-xs">5</span>
              </div>
            </button>

            <button id="btn-feed-cathy" data-speak="给凯茜点心" aria-label="给凯茜点心" class="flex-shrink-0 rounded-3xl overflow-hidden shadow-lg border-4 border-amber-200 touch-target cursor-pointer transform transition-transform hover:scale-105 active:scale-95 flex-1 max-w-xs aspect-square relative group">
              <img src="/assets/images/icon_cake.jpg" alt="喂食" class="w-full h-full object-cover" />
              <div class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1 shadow-md">
                <img src="/assets/images/icon_coin.jpg" class="w-4 h-4 rounded-full" alt="Coin" />
                <span class="text-white font-black text-xs">10</span>
              </div>
            </button>

            <button id="btn-alchemy" data-speak="汉字炼金术" aria-label="汉字炼金术" class="flex-shrink-0 rounded-3xl overflow-hidden shadow-lg border-4 border-purple-400 touch-target cursor-pointer transform transition-transform hover:scale-105 active:scale-95 flex-1 max-w-xs aspect-square relative group">
              <img src="/assets/images/icon_cauldron.jpg" alt="炼金" class="w-full h-full object-cover" />
              <div class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1 shadow-md">
                <span class="text-white font-black text-xs">炼金术</span>
              </div>
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
        this._timeout(() => {
          soundAndFX.speakPriority("大树喝到了甘甜泉水，长得更快啦！", { kind: "sentence", priority: 1 });
        }, 280);

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
        if (ebbinghausManager.progress.coins < 10) {
          soundAndFX.playSoftError();
          showGameToast(this.container, "金币不足，快去学习赚取吧！", "error");
          return;
        }
        if (this.cathyHunger >= 100) {
          soundAndFX.playPop();
          showGameToast(this.container, "凯茜吃得很饱啦！明天再喂吧。", "info");
          return;
        }

        soundAndFX.playSuccess();
        ebbinghausManager.deductCoins(10);
        this.cathyHunger = Math.min(100, this.cathyHunger + 20);
        storageManager.setItem("cathy_hunger_val", this.cathyHunger.toString());

        const speechBubble = mainEl.querySelector("#cathy-speech-bubble");
        if (speechBubble) {
          speechBubble.textContent = "“哇！美味的小点心！凯茜充满活力啦！”";
        }
        this._timeout(() => {
          soundAndFX.speakPriority("哇！美味的小点心！凯茜充满活力啦！", { kind: "sentence", priority: 1 });
        }, 280);

        if (this.cathyHunger === 100) {
          this._timeout(() => {
            soundAndFX.playVictoryFanfare();
            soundAndFX.triggerConfetti(this.container);
            ebbinghausManager.addCoins(50);
            showGameToast(this.container, "饱食度全满！凯茜回赠你 50 金币！", "success");
            this.cathyHunger = 0; // 重置饱食度，以便第二天/下次喂食
            storageManager.setItem("cathy_hunger_val", this.cathyHunger.toString());
            this.render();
          }, 1500);
        } else {
          this.render(); // Update UI for progress bar and coins
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
        const r = riddles[Math.floor(Math.random() * riddles.length)];
        const speechBubble = mainEl.querySelector("#cathy-speech-bubble");
        if (speechBubble) {
          speechBubble.textContent = `“${r}”`;
        }
        soundAndFX.speakPriority(r, { kind: "sentence", priority: 1 });
      });
    }

    // 4b. 点击凯茜伴学小精灵互动问候
    const cathyCompanionActor = mainEl.querySelector("#cathy-companion-actor");
    if (cathyCompanionActor) {
      const greetings = [
        "你好呀！我是小鹿凯茜，今天我们要一起认识更多汉字好朋友哦！",
        "你真棒！每认识一个字，我们的小树就会多一片神奇绿叶！",
        "大树口渴啦，记得常常用小水壶给大树浇浇水哦！",
        "字谜藏在小金星里，点一点右上角的小金星听字谜吧！"
      ];
      this._on(cathyCompanionActor, "click", (e) => {
        if (e.target.closest("#btn-cathy-riddle")) return;
        soundAndFX.playPop();
        const g = greetings[Math.floor(Math.random() * greetings.length)];
        const speechBubble = mainEl.querySelector("#cathy-speech-bubble");
        if (speechBubble) {
          speechBubble.textContent = `“${g}”`;
        }
        cathyCompanionActor.classList.add("scale-105");
        setTimeout(() => cathyCompanionActor.classList.remove("scale-105"), 300);
        soundAndFX.speakPriority(g, { kind: "sentence", emotion: "excited", priority: 1 });
      });
    }

    // 5. 汉字炼金术
    const alchemyBtn = mainEl.querySelector("#btn-alchemy");
    if (alchemyBtn) {
      this._on(alchemyBtn, "click", () => {
        soundAndFX.playPop();
        this._openAlchemyModal();
      });
    }
  }

  _openAlchemyModal() {
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4";
    this.container.appendChild(overlay);

    const progress = ebbinghausManager.progress;
    const learnedChars = Object.keys(progress.charRecords || {}).map(id => CHARACTER_DATABASE.find(c => c.id === id)?.char).filter(Boolean);

    let slot1 = null;
    let slot2 = null;

    const renderModal = () => {
      overlay.innerHTML = `
        <div class="bg-white/95 backdrop-blur-md rounded-3xl border-4 border-purple-400 p-6 shadow-2xl w-full max-w-2xl flex flex-col relative animate-scale-up">
          <button id="btn-close-alchemy" class="absolute top-4 right-4 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-red-100 active:scale-90 transition-transform text-2xl font-black text-gray-600 cursor-pointer">&times;</button>
          
          <h2 class="text-2xl font-black text-purple-900 mb-2 flex items-center justify-center gap-2">
            <img src="/assets/images/icon_sparkle.jpg" class="w-6 h-6 rounded-full" alt="Sparkle" /> 汉字炼金术
          </h2>
          <p class="text-xs text-center text-gray-500 font-bold mb-4">把两个字投入炼金炉，看看能不能合成新词！首次合成奖励 50 金币哦！</p>

          <div class="relative w-full flex flex-col items-center mb-6">
            <img src="assets/images/fusion_alchemy_furnace.jpg" alt="炼金炉" class="w-48 h-48 object-cover rounded-2xl shadow-lg border-2 border-purple-200" data-fallback="assets/images/icon_chest.webp" />
            
            <div class="absolute bottom-4 flex gap-4">
              <div id="slot-1" class="w-14 h-14 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-dashed border-purple-500 shadow-inner flex items-center justify-center text-3xl font-black text-purple-900 cursor-pointer hover:scale-105 active:scale-95 transition-transform ${slot1 ? 'bg-purple-100 border-solid' : ''}">
                ${slot1 || ""}
              </div>
              <div id="slot-2" class="w-14 h-14 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-dashed border-purple-500 shadow-inner flex items-center justify-center text-3xl font-black text-purple-900 cursor-pointer hover:scale-105 active:scale-95 transition-transform ${slot2 ? 'bg-purple-100 border-solid' : ''}">
                ${slot2 || ""}
              </div>
            </div>
          </div>

          <button id="btn-synthesize" class="w-full max-w-xs mx-auto bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white text-lg font-black py-3 rounded-2xl shadow-xl active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 mb-6 flex items-center justify-center gap-2" ${(!slot1 || !slot2) ? 'disabled' : ''}>
            <span>开始炼金</span>
            <span class="text-sm font-black">星</span>
          </button>

          <div class="w-full bg-purple-50 p-4 rounded-2xl border border-purple-100 max-h-48 overflow-y-auto">
            <p class="text-xs font-black text-purple-800 mb-2">你的已学汉字库 (${learnedChars.length} 个)</p>
            <div class="flex flex-wrap gap-2">
              ${learnedChars.map(c => `
                <button class="char-btn w-10 h-10 bg-white rounded-lg shadow-sm border border-purple-200 text-xl font-black text-gray-800 hover:bg-purple-100 hover:border-purple-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer" data-char="${c}">
                  ${c}
                </button>
              `).join('')}
              ${learnedChars.length === 0 ? `<p class="text-xs text-gray-400 w-full text-center">还没学过汉字哦，先去闯关吧！</p>` : ''}
            </div>
          </div>
        </div>
      `;

      this._on(overlay.querySelector("#btn-close-alchemy"), "click", () => {
        soundAndFX.playPop();
        overlay.remove();
      });

      overlay.querySelectorAll(".char-btn").forEach(btn => {
        this._on(btn, "click", (e) => {
          soundAndFX.playTap1();
          const c = e.currentTarget.dataset.char;
          if (!slot1) {
            slot1 = c;
          } else if (!slot2) {
            slot2 = c;
          }
          renderModal();
        });
      });

      const s1El = overlay.querySelector("#slot-1");
      if (s1El) this._on(s1El, "click", () => { if(slot1) { slot1 = null; soundAndFX.playPop(); renderModal(); } });
      const s2El = overlay.querySelector("#slot-2");
      if (s2El) this._on(s2El, "click", () => { if(slot2) { slot2 = null; soundAndFX.playPop(); renderModal(); } });

      const synthBtn = overlay.querySelector("#btn-synthesize");
      if (synthBtn && slot1 && slot2) {
        this._on(synthBtn, "click", () => {
          soundAndFX.playSuccess();
          const result = checkSynthesis(slot1, slot2);
          if (result.success) {
            const isNew = ebbinghausManager.recordSynthesizedWord(result.word);
            let rewardMsg = "";
            if (isNew) {
              ebbinghausManager.addCoins(50);
              rewardMsg = "恭喜解锁新词汇，获得 50 金币！";
              soundAndFX.playVictoryFanfare();
              soundAndFX.triggerConfetti(overlay);
            } else {
              rewardMsg = "这个词之前已经合成过啦！";
              soundAndFX.playSuccess();
            }

            const coinDisplay = this.container.querySelector("#tree-coin-display");
            if (coinDisplay) {
              coinDisplay.textContent = `${ebbinghausManager.progress.coins} 金币`;
            }

            overlay.innerHTML = `
              <div class="bg-white/95 backdrop-blur-md rounded-3xl border-4 border-purple-400 p-8 shadow-2xl w-full max-w-sm flex flex-col items-center relative animate-scale-up">
                <h2 class="text-2xl font-black text-emerald-600 mb-1">炼金成功！</h2>
                <p class="text-xs font-bold text-amber-600 mb-6">${rewardMsg}</p>
                <div class="w-32 h-32 bg-purple-100 rounded-full flex flex-col items-center justify-center border-4 border-purple-300 shadow-inner mb-6">
                  <span class="text-lg font-bold text-gray-500 mb-1">${result.pinyin}</span>
                  <span class="text-5xl font-black text-purple-900 font-serif">${result.word}</span>
                </div>
                <p class="text-sm font-bold text-gray-600 text-center mb-6 px-4">${result.desc || ''}</p>
                <button id="btn-continue-alchemy" class="w-full bg-emerald-500 text-white text-lg font-black py-3 rounded-2xl shadow-md active:scale-95 transition-transform cursor-pointer">继续炼金</button>
              </div>
            `;
            this._on(overlay.querySelector("#btn-continue-alchemy"), "click", () => {
              soundAndFX.playPop();
              slot1 = null; slot2 = null;
              renderModal();
            });

          } else {
            soundAndFX.playSoftError();
            overlay.innerHTML = `
              <div class="bg-white/95 backdrop-blur-md rounded-3xl border-4 border-gray-300 p-8 shadow-2xl w-full max-w-sm flex flex-col items-center relative animate-scale-up">
                <h2 class="text-2xl font-black text-gray-500 mb-4">炼金失败...</h2>
                <div class="mb-4"><img src="/assets/images/icon_speaker_muted.jpg" class="w-12 h-12 object-cover rounded-xl" alt="Cloud" /></div>
                <p class="text-sm font-bold text-gray-500 text-center mb-6 px-4">“${slot1}” 和 “${slot2}” 似乎不能组成词语，再换个组合试试吧！</p>
                <button id="btn-retry-alchemy" class="w-full bg-gray-200 text-gray-700 text-lg font-black py-3 rounded-2xl shadow-md active:scale-95 transition-transform cursor-pointer">再试一次</button>
              </div>
            `;
            this._on(overlay.querySelector("#btn-retry-alchemy"), "click", () => {
              soundAndFX.playPop();
              slot1 = null; slot2 = null;
              renderModal();
            });
          }
        });
      }
    };

    renderModal();
  }
}
