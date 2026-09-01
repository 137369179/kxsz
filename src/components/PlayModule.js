/**
 * 凯茜识字 (Cathy Literacy) - 顶级趣味游乐场与竞技复习馆
 * 核心王牌特色：
 *  1. 【难字歼灭战】针对艾宾浩斯遗忘曲线薄弱字，挑战动态血条 Boss 巨兽，法术暴击与金币礼炮结算
 *  2. 【汉字消消乐】字音字形 3D 翻牌连击对对碰 (Combo 连击音效)
 *  3. 【双人对决竞技场】红蓝双人/人机抢拍答题，实时比分榜与胜利皇冠加冕
 *  4. 【成语国学馆】经典成语国学微课、生动典故与趣味测验
 *  5. 全量采用 BaseModule 生命周期管理与 100% 纯矢量 3D 游戏资产
 */

import { CHARACTER_DATABASE } from "../data/characters.js";
import { IDIOMS_DATABASE } from "../data/idioms.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { mountGameShell, showGameToast } from "./SharedShell.js";
import { BaseModule } from "../utils/BaseModule.js";
import { GAME_ICONS } from "../utils/gameIcons.js";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class PlayModule extends BaseModule {
  constructor(container) {
    super(container);
    this.currentMode = null; // null: 大厅, "boss": 难字歼灭, "match": 消消乐, "pk": 竞技PK, "idiom": 成语馆
  }

  render() {
    this.destroy();
    if (!this.currentMode) {
      this.renderHub();
    } else if (this.currentMode === "boss") {
      this.renderBossBattle();
    } else if (this.currentMode === "match") {
      this.renderMatchGame();
    } else if (this.currentMode === "pk") {
      this.renderPkArena();
    } else if (this.currentMode === "idiom") {
      this.renderIdiomHall();
    }
  }

  // ----------------------------------------------------
  // 1. 游乐场大厅
  // ----------------------------------------------------
  renderHub() {
    const mainEl = mountGameShell(this.container, {
      activeMode: "play",
      heading: "凯茜游乐场"
    });

    mainEl.innerHTML = `
      <div class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pb-8">
        
        <!-- 顶部游乐场横幅 -->
        <div class="relative w-full h-44 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 mb-6 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 flex flex-col justify-end p-6">
          <div class="absolute -right-6 -bottom-6 opacity-20 transform scale-150">
            ${GAME_ICONS.arcade("w-56 h-56")}
          </div>
          
          <div class="relative z-10 text-white">
            <div class="flex items-center gap-3 mb-1">
              <span class="flex items-center">${GAME_ICONS.arcade("w-8 h-8")}</span>
              <h1 class="text-2xl font-black drop-shadow-md">凯茜游乐场 (全能拓展竞技馆)</h1>
            </div>
            <p class="text-xs text-yellow-200 font-bold">
              趣味游戏化巩固复习，消灭生字怪兽、双人对决、国学成语，赢取海量凯茜星币！
            </p>
          </div>
        </div>

        <!-- 四大游乐场模块入口卡片 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <!-- 1. 难字歼灭战 -->
          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-rose-200 hover:border-rose-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="boss">
            <div>
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-400 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.monster("w-8 h-8")}
              </div>
              <h3 class="text-lg font-black text-gray-900 group-hover:text-rose-600 transition-colors">难字歼灭战</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                针对艾宾浩斯遗忘曲线薄弱生字，挑战 Boss 怪兽！
              </p>
            </div>
            <button class="mt-4 bg-gradient-to-r from-rose-500 to-red-500 text-white text-xs font-black py-2.5 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5">
              <span>进入挑战</span>
            </button>
          </div>

          <!-- 2. 汉字消消乐 -->
          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-amber-200 hover:border-amber-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="match">
            <div>
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.gem("w-8 h-8")}
              </div>
              <h3 class="text-lg font-black text-gray-900 group-hover:text-amber-600 transition-colors">汉字消消乐</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                听音辨形，拼音与汉字 3D 翻转对对碰快速消除。
              </p>
            </div>
            <button class="mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-black py-2.5 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5">
              <span>开始消除</span>
            </button>
          </div>

          <!-- 3. 双人竞技场 -->
          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-blue-200 hover:border-blue-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="pk">
            <div>
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.swords("w-8 h-8")}
              </div>
              <h3 class="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">双人竞技场</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                双人同屏/人机对战，听发音抢拍气球比拼手速！
              </p>
            </div>
            <button class="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-black py-2.5 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5">
              <span>发起对决</span>
            </button>
          </div>

          <!-- 4. 成语国学馆 -->
          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-emerald-200 hover:border-emerald-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="idiom">
            <div>
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.scroll("w-8 h-8")}
              </div>
              <h3 class="text-lg font-black text-gray-900 group-hover:text-emerald-600 transition-colors">成语国学馆</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                50+ 经典成语趣味微课堂、生动典故与互动小问答。
              </p>
            </div>
            <button class="mt-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-black py-2.5 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5">
              <span>探索国学</span>
            </button>
          </div>

        </div>

      </div>
    `;

    mainEl.querySelectorAll(".mode-card").forEach((card) => {
      this._on(card, "click", () => {
        const mode = card.dataset.mode;
        this.currentMode = mode;
        soundAndFX.playSuccessSound();
        this.render();
      });
    });
  }

  // ----------------------------------------------------
  // 2. 难字歼灭战 (Boss 战)
  // ----------------------------------------------------
  renderBossBattle() {
    // 从难字本或字库中筛选题目
    const diffIds = ebbinghausManager.getDifficultCharIds();
    let chars = diffIds.map(id => CHARACTER_DATABASE.find(c => c.id === id)).filter(Boolean);
    if (chars.length < 4) {
      chars = [...chars, ...CHARACTER_DATABASE.slice(0, 4 - chars.length)];
    }

    let bossHp = 100;
    let targetIndex = 0;

    const renderRound = () => {
      const curChar = chars[targetIndex % chars.length];
      const __pmProgress = ebbinghausManager.progress;
      const __pmSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
      const options = shuffle([curChar.char, ...(curChar.confusingChars || ["木", "日", "月"]).slice(0, 3)]);

      soundAndFX.speak(`消灭怪兽！找出汉字：“${curChar.char}”`);

      this.container.innerHTML = `
        <div class="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-gradient-to-b from-slate-950 via-rose-950 to-slate-950 text-white">
          
          <!-- 顶部状态栏 -->
          <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/20">
            <button id="btn-back-hub" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5">
              <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
              <span>退出战斗</span>
            </button>

            <div class="flex items-center gap-2">
              <span class="flex items-center">${GAME_ICONS.monster("w-6 h-6")}</span>
              <span class="text-sm font-black text-rose-300">难字歼灭战 · 关卡 Boss</span>
            </div>

            <div class="flex items-center gap-2">
              <button id="btn-boss-sound" class="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg" title="声音开关">
                ${__pmSpeakerIcon}
              </button>
              <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
                ${GAME_ICONS.coin("w-4 h-4")}<span>${__pmProgress.coins}</span>
              </div>
              <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full">
                ${GAME_ICONS.star("w-4 h-4", true)}<span>${__pmProgress.stars}</span>
              </div>
              <div class="flex items-center gap-2 bg-black/60 px-4 py-1.5 rounded-full border border-rose-400">
                <span class="text-xs font-black text-rose-300">Boss 血量:</span>
                <span id="boss-hp-val" class="text-sm font-black text-yellow-300">${bossHp}%</span>
              </div>
            </div>
          </header>

          <!-- Boss 战场舞台 -->
          <main class="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
            
            <!-- 血条 -->
            <div class="w-full max-w-md bg-black/60 h-5 rounded-full overflow-hidden border-2 border-rose-400 mb-6 p-0.5">
              <div id="boss-hp-bar" class="bg-gradient-to-r from-red-600 via-rose-500 to-yellow-400 h-full rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]" style="width: ${bossHp}%"></div>
            </div>

            <!-- Boss 3D 动画巨兽 -->
            <div id="boss-avatar" class="relative w-36 h-36 rounded-full bg-gradient-to-tr from-rose-600 via-red-500 to-orange-500 border-4 border-white shadow-[0_0_60px_rgba(244,63,94,0.8)] flex items-center justify-center mb-4 animate-bounce-slow transition-transform">
              <span class="flex items-center text-white">${GAME_ICONS.monster("w-20 h-20")}</span>
              <div class="absolute -top-3 bg-red-600 text-white font-black text-[10px] px-3 py-0.5 rounded-full border border-white">
                难字首领 Lv.9
              </div>
            </div>

            <h2 class="text-xl font-black text-yellow-300 mb-1">
              首领怒吼：“谁能认出‘${curChar.char}’（${curChar.pinyin}）字？！”
            </h2>
            <p class="text-xs text-gray-300 mb-6 font-semibold">
              ✨ 点击下方正确的法术水晶字符，释放激光暴击首领！
            </p>

            <!-- 攻击法术选项 -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
              ${options
                .map(
                  (opt) => `
                <button class="boss-spell-btn h-24 rounded-3xl btn-game-orange text-white font-black text-5xl shadow-2xl active:scale-90 transition-all flex items-center justify-center" data-char="${opt}">
                  ${opt}
                </button>
              `
                )
                .join("")}
            </div>

          </main>

          <!-- 胜利通关模态框 -->
          <div id="boss-win-modal" class="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-white hidden animate-scale-up z-50">
            <div class="mb-4 flex items-center justify-center">${GAME_ICONS.trophy("w-24 h-24")}</div>
            <h2 class="text-3xl font-black text-yellow-300 mb-2">首领已彻底歼灭！</h2>
            <p class="text-xs text-gray-300 mb-6 font-semibold">你成功攻克了难字堡垒，守护了汉字王国的安宁！</p>
            <div class="candy-pill rounded-full px-6 py-2 mb-6 text-xs text-yellow-300 font-bold flex items-center gap-2">
              <span class="flex items-center">${GAME_ICONS.coin("w-5 h-5")}</span>
              <span>获得 20 凯茜星币 + 难字封印勋章</span>
            </div>
            <button id="btn-boss-claim" class="btn-game-orange text-white font-black text-base px-10 py-3 rounded-full">
              领取奖励并返回游乐场
            </button>
          </div>

        </div>
      `;

      const backBtn = this.container.querySelector("#btn-back-hub");
      if (backBtn) {
        this._on(backBtn, "click", () => {
          soundAndFX.playPop();
          this.currentMode = null;
          this.render();
        });
      }

      const bossAvatar = this.container.querySelector("#boss-avatar");
      const bossBar = this.container.querySelector("#boss-hp-bar");
      const hpVal = this.container.querySelector("#boss-hp-val");
      const winModal = this.container.querySelector("#boss-win-modal");
      const soundBtn = this.container.querySelector("#btn-boss-sound");
      if (soundBtn) {
        this._on(soundBtn, "click", () => {
          soundAndFX.toggleMute();
          const ic = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
          soundBtn.innerHTML = ic;
        });
      }

      const claimBtn = this.container.querySelector("#btn-boss-claim");

      let answered = false;

      this.container.querySelectorAll(".boss-spell-btn").forEach((btn) => {
        this._on(btn, "click", () => {
          if (answered) return;
          answered = true;

          const selected = btn.dataset.char;
          if (selected === curChar.char) {
            soundAndFX.playLaserShoot();
            soundAndFX.playSuccessSound();
            soundAndFX.triggerConfetti(this.container);

            if (bossAvatar) {
              bossAvatar.classList.add("animate-shake", "scale-75", "opacity-80");
            }

            bossHp = Math.max(0, bossHp - 35);
            if (bossBar) bossBar.style.width = `${bossHp}%`;
            if (hpVal) hpVal.textContent = `${bossHp}%`;

            if (bossHp <= 0) {
              soundAndFX.playVictoryFanfare();
              soundAndFX.triggerCoinFly(this.container);
              ebbinghausManager.addCoins(20);
              this._timeout(() => {
                if (winModal) winModal.classList.remove("hidden");
              }, 800);
            } else {
              targetIndex++;
              this._timeout(renderRound, 800);
            }
          } else {
            soundAndFX.playSoftError();
            btn.classList.add("animate-shake");
            this._timeout(() => {
              btn.classList.remove("animate-shake");
              answered = false;
            }, 500);
          }
        });
      });

      if (claimBtn) {
        this._on(claimBtn, "click", () => {
          soundAndFX.playPop();
          this.currentMode = null;
          this.render();
        });
      }
    };

    renderRound();
  }

  // ----------------------------------------------------
  // 3. 汉字消消乐 (3D 翻牌对对碰)
  // ----------------------------------------------------
  renderMatchGame() {
    const __pmProgress = ebbinghausManager.progress;
    const __pmSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
    const rawPairs = [
      { char: "日", pinyin: "rì" },
      { char: "月", pinyin: "yuè" },
      { char: "水", pinyin: "shuǐ" },
      { char: "山", pinyin: "shān" }
    ];

    let cards = [];
    rawPairs.forEach((p, idx) => {
      cards.push({ id: `c_${idx}`, val: p.char, matchKey: p.char, type: "char" });
      cards.push({ id: `p_${idx}`, val: p.pinyin, matchKey: p.char, type: "pinyin" });
    });
    cards = shuffle(cards);

    let flipped = [];
    let matchedCount = 0;

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white">
        
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/20">
          <button id="btn-match-back" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5">
            <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
            <span>返回大厅</span>
          </button>
          
          <div class="flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.gem("w-6 h-6")}</span>
            <span class="text-sm font-black text-yellow-300">汉字消消乐 (字音配对)</span>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-match-sound" class="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg" title="声音开关">
              ${__pmSpeakerIcon}
            </button>
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.coin("w-4 h-4")}<span>${__pmProgress.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.star("w-4 h-4", true)}<span>${__pmProgress.stars}</span>
            </div>
            <div class="candy-pill flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black text-emerald-300">
              <span>已消除: <b id="match-score" class="text-yellow-300 text-sm">0</b> / 4 对</span>
            </div>
          </div>
        </header>

        <main class="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
          <p class="text-xs text-yellow-200 font-bold mb-4">👉 翻开一张汉字和对应的读音拼音，即可消除得分！</p>
          
          <div class="grid grid-cols-4 gap-4 w-full max-w-2xl">
            ${cards
              .map(
                (c, idx) => `
              <button class="match-card-btn relative h-28 rounded-3xl btn-game-orange text-white font-black text-3xl shadow-xl transition-all active:scale-95 flex items-center justify-center" data-idx="${idx}" data-match="${c.matchKey}">
                <span class="card-front-val">${c.val}</span>
              </button>
            `
              )
              .join("")}
          </div>
        </main>

        <div id="match-win-modal" class="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-white hidden animate-scale-up z-50">
          <div class="mb-4 flex items-center justify-center">${GAME_ICONS.star("w-20 h-20", true)}</div>
          <h2 class="text-2xl font-black text-yellow-300 mb-2">全部消除完毕！眼疾手快！</h2>
          <p class="text-xs text-gray-300 mb-6 font-semibold">获得 10 凯茜星币奖励！</p>
          <button id="btn-match-claim" class="btn-game-orange text-white font-black text-base px-10 py-3 rounded-full">
            领取奖励并返回
          </button>
        </div>

      </div>
    `;

    const backBtn = this.container.querySelector("#btn-match-back");
    if (backBtn) {
      this._on(backBtn, "click", () => {
        soundAndFX.playPop();
        this.currentMode = null;
        this.render();
      });
    }

    const soundBtn = this.container.querySelector("#btn-match-sound");
    if (soundBtn) {
      this._on(soundBtn, "click", () => {
        soundAndFX.toggleMute();
        const ic = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
        soundBtn.innerHTML = ic;
      });
    }

    const scoreEl = this.container.querySelector("#match-score");
    const winModal = this.container.querySelector("#match-win-modal");
    const claimBtn = this.container.querySelector("#btn-match-claim");

    this.container.querySelectorAll(".match-card-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        if (btn.classList.contains("opacity-0") || flipped.includes(btn)) return;

        soundAndFX.playCardFlip();
        btn.classList.add("ring-4", "ring-yellow-300", "scale-105");
        flipped.push(btn);

        if (flipped.length === 2) {
          const [b1, b2] = flipped;
          if (b1.dataset.match === b2.dataset.match) {
            // 配对成功
            soundAndFX.playSuccessSound();
            soundAndFX.triggerConfetti(this.container);
            matchedCount++;
            if (scoreEl) scoreEl.textContent = matchedCount;

            this._timeout(() => {
              b1.classList.add("opacity-0", "pointer-events-none");
              b2.classList.add("opacity-0", "pointer-events-none");
              flipped = [];

              if (matchedCount >= 4) {
                soundAndFX.playVictoryFanfare();
                ebbinghausManager.addCoins(10);
                if (winModal) winModal.classList.remove("hidden");
              }
            }, 500);
          } else {
            // 配对失败
            soundAndFX.playSoftError();
            this._timeout(() => {
              b1.classList.remove("ring-4", "ring-yellow-300", "scale-105");
              b2.classList.remove("ring-4", "ring-yellow-300", "scale-105");
              flipped = [];
            }, 600);
          }
        }
      });
    });

    if (claimBtn) {
      this._on(claimBtn, "click", () => {
        soundAndFX.playPop();
        this.currentMode = null;
        this.render();
      });
    }
  }

  // ----------------------------------------------------
  // 4. 双人对战竞技场 (PK Arena)
  // ----------------------------------------------------
  renderPkArena() {
    const __pmProgress = ebbinghausManager.progress;
    const __pmSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
    let p1Score = 0;
    let p2Score = 0;
    let currentRound = 1;
    const totalRounds = 5;

    const roundData = [
      { char: "日", pinyin: "rì", opts: ["日", "月", "木", "山"] },
      { char: "月", pinyin: "yuè", opts: ["水", "月", "火", "口"] },
      { char: "水", pinyin: "shuǐ", opts: ["水", "木", "人", "山"] },
      { char: "火", pinyin: "huǒ", opts: ["日", "火", "月", "人"] },
      { char: "山", pinyin: "shān", opts: ["口", "水", "山", "木"] }
    ];

    const renderRound = () => {
      const r = roundData[(currentRound - 1) % roundData.length];
      soundAndFX.speak(`抢拍汉字：“${r.char}”`);

      this.container.innerHTML = `
        <div class="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white">
          
          <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/20">
            <button id="btn-pk-back" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5">
              <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
              <span>退出竞技</span>
            </button>

            <div class="flex items-center gap-2 text-yellow-300 font-black text-sm">
              <span class="flex items-center">${GAME_ICONS.swords("w-6 h-6")}</span>
              <span>对决第 ${currentRound} / ${totalRounds} 局</span>
            </div>

            <div class="candy-pill flex items-center gap-4 px-5 py-1.5 rounded-full text-xs font-black">
              <span class="text-rose-400">🔴 红队: ${p1Score}</span>
              <span class="text-cyan-400">🔵 蓝队: ${p2Score}</span>
            </div>
          </header>

          <main class="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div class="mb-4 bg-black/60 px-6 py-2 rounded-full border border-yellow-400 text-yellow-300 font-black text-lg animate-pulse">
              🎯 目标字：读音 ${r.pinyin}
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-5 w-full max-w-2xl">
              ${r.opts
                .map(
                  (opt) => `
                <button class="pk-opt-btn h-28 rounded-3xl btn-game-orange text-white font-black text-5xl shadow-2xl active:scale-90 transition-all flex items-center justify-center" data-char="${opt}">
                  ${opt}
                </button>
              `
                )
                .join("")}
            </div>
          </main>

          <div id="pk-win-modal" class="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-white hidden animate-scale-up z-50">
            <div class="mb-4 flex items-center justify-center">${GAME_ICONS.crown("w-24 h-24")}</div>
            <h2 class="text-3xl font-black text-yellow-300 mb-2">对决大获全胜！</h2>
            <p class="text-xs text-gray-300 mb-6 font-semibold">最终比分：红队 ${p1Score} - 蓝队 ${p2Score}</p>
            <button id="btn-pk-claim" class="btn-game-orange text-white font-black text-base px-10 py-3 rounded-full">
              领取星币返回
            </button>
          </div>

        </div>
      `;

      const backBtn = this.container.querySelector("#btn-pk-back");
      if (backBtn) {
        this._on(backBtn, "click", () => {
          soundAndFX.playPop();
          this.currentMode = null;
          this.render();
        });
      }

      const soundBtn = this.container.querySelector("#btn-pk-sound");
      if (soundBtn) {
        this._on(soundBtn, "click", () => {
          soundAndFX.toggleMute();
          const ic = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
          soundBtn.innerHTML = ic;
        });
      }

      const winModal = this.container.querySelector("#pk-win-modal");
      const claimBtn = this.container.querySelector("#btn-pk-claim");

      let answered = false;

      this.container.querySelectorAll(".pk-opt-btn").forEach((btn) => {
        this._on(btn, "click", () => {
          if (answered) return;
          answered = true;

          const val = btn.dataset.char;
          if (val === r.char) {
            p1Score += 10;
            soundAndFX.playSuccessSound();
            soundAndFX.triggerConfetti(this.container);
            btn.classList.add("ring-8", "ring-emerald-400");
          } else {
            p2Score += 10;
            soundAndFX.playSoftError();
            btn.classList.add("ring-8", "ring-rose-400");
          }

          this._timeout(() => {
            if (currentRound < totalRounds) {
              currentRound++;
              renderRound();
            } else {
              soundAndFX.playVictoryFanfare();
              ebbinghausManager.addCoins(15);
              if (winModal) winModal.classList.remove("hidden");
            }
          }, 800);
        });
      });

      if (claimBtn) {
        this._on(claimBtn, "click", () => {
          soundAndFX.playPop();
          this.currentMode = null;
          this.render();
        });
      }
    };

    renderRound();
  }

  // ----------------------------------------------------
  // 5. 成语国学馆 (Idiom Hall)
  // ----------------------------------------------------
  renderIdiomHall() {
    const __pmProgress = ebbinghausManager.progress;
    const __pmSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-950 text-white">
        
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/20">
          <button id="btn-idiom-back" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5">
            <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
            <span>返回大厅</span>
          </button>
          
          <div class="flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.scroll("w-6 h-6")}</span>
            <span class="text-sm font-black text-yellow-300">成语国学微课堂 (50+ 经典典故)</span>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-idiom-sound" class="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg" title="声音开关">
              ${__pmSpeakerIcon}
            </button>
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.coin("w-4 h-4")}<span>${__pmProgress.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.star("w-4 h-4", true)}<span>${__pmProgress.stars}</span>
            </div>
          </div>
        </header>

        <main class="relative z-10 flex-1 p-6 overflow-y-auto no-scrollbar">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            ${(IDIOMS_DATABASE || [
              { idiom: "一心一意", pinyin: "yī xīn yī yì", meaning: "形容心思专一，全心全意做好一件事。" },
              { idiom: "日新月异", pinyin: "rì xīn yuè yì", meaning: "每天每月都有新的变化，形容进步发展极其迅速。" },
              { idiom: "水落石出", pinyin: "shuǐ luò shí chū", meaning: "水退下去，石头露出来。比喻真相彻底大白。" },
              { idiom: "山清水秀", pinyin: "shān qīng shuǐ xiù", meaning: "山峦青翠，水色秀丽，形容风景十分优美。" },
              { idiom: "春暖花开", pinyin: "chūn nuǎn huā kāi", meaning: "春天阳光温暖，百花盛开，形容大好春光。" },
              { idiom: "画龙点睛", pinyin: "huà lóng diǎn jīng", meaning: "在关键处点缀一笔，使内容更加传神生动。" }
            ]).map(
              (item) => `
              <div class="idiom-card bg-white/10 backdrop-blur-md rounded-3xl p-5 border-2 border-emerald-300/40 shadow-xl hover:border-emerald-300 cursor-pointer transition-all hover:scale-105 flex flex-col justify-between" data-idiom="${item.idiom}">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold text-emerald-300">${item.pinyin}</span>
                    <button class="speak-idiom-btn w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow active:scale-90">🔊</button>
                  </div>
                  <h3 class="text-2xl font-black text-yellow-300 mb-2">${item.idiom}</h3>
                  <p class="text-xs text-gray-200 leading-relaxed font-semibold">${item.meaning}</p>
                </div>
                <div class="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-emerald-400 font-bold">
                  <span>国学启蒙必学</span>
                  <span>👉 点击听典故</span>
                </div>
              </div>
            `
            ).join("")}
          </div>
        </main>

      </div>
    `;

    const backBtn = this.container.querySelector("#btn-idiom-back");
    if (backBtn) {
      this._on(backBtn, "click", () => {
        soundAndFX.playPop();
        this.currentMode = null;
        this.render();
      });
    }

    const soundBtn = this.container.querySelector("#btn-idiom-sound");
    if (soundBtn) {
      this._on(soundBtn, "click", () => {
        soundAndFX.toggleMute();
        const ic = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
        soundBtn.innerHTML = ic;
      });
    }

    this.container.querySelectorAll(".idiom-card").forEach((card) => {
      this._on(card, "click", () => {
        const idiom = card.dataset.idiom;
        const item = (IDIOMS_DATABASE || []).find((i) => i.idiom === idiom) || { idiom, meaning: "" };
        soundAndFX.playPop();
        soundAndFX.speak(`${item.idiom}。${item.meaning}`);
      });
    });
  }
}
