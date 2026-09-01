/**
 * 凯茜识字 (Cathy Literacy) - 顶级趣味游乐场与竞技复习馆
 * 核心王牌特色：
 *  1. 难字歼灭战针对艾宾浩斯遗忘曲线薄弱字，挑战动态血条 Boss 巨兽，法术暴击与金币礼炮结算
 *  2. 汉字消消乐字音字形 3D 翻牌连击对对碰 (Combo 连击音效)
 *  3. 双人对决竞技场红蓝双人/人机抢拍答题，实时比分榜与胜利皇冠加冕
 *  4. 成语国学馆经典成语国学微课生动典故与趣味测验
 *  5. 全量采用 BaseModule 生命周期管理与 100% 纯矢量 3D 游戏资产
 */

import { CHARACTER_DATABASE } from "../data/characters.js";
import { IDIOMS_DATABASE } from "../data/idioms.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { mountGameShell, showGameToast } from "./SharedShell.js";
import { BaseModule } from "../utils/BaseModule.js";
import { GAME_ICONS } from "../utils/gameIcons.js";
import { EVENTS } from "../utils/eventBus.js";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ------------------------------------------------------------
// 动态取题工具：优先艾宾浩斯待复习/难字，不足则从字库随机，
// 并按字库的 confusingChars 自动生成干扰选项（游乐场均由此出题）
// ------------------------------------------------------------
function pickReviewChars(count = 4) {
  // 1) 待复习队列（到期 + 难字）优先
  const dueIds = ebbinghausManager.getDueReviewCharIds();
  const due = dueIds.map((id) => CHARACTER_DATABASE.find((c) => c.id === id)).filter(Boolean);
  // 2) 难度加权补充（低掌握度者优先）
  const rest = CHARACTER_DATABASE.filter((c) => !dueIds.includes(c.id));
  rest.sort((a, b) => {
    const ra = ebbinghausManager.progress.charRecords?.[a.id];
    const rb = ebbinghausManager.progress.charRecords?.[b.id];
    const sa = ra?.masteryRate ?? 100;
    const sb = rb?.masteryRate ?? 100;
    return sa - sb; // 掌握度低者排在前面
  });
  const pool = [...due, ...rest];
  // 去重且不超量
  const taken = [];
  const seen = new Set();
  for (let i = 0; i < pool.length && taken.length < count; i++) {
    if (seen.has(pool[i].id)) continue;
    seen.add(pool[i].id);
    taken.push(pool[i]);
  }
  // 字库不足时允许循环补足（实际 50 字 >> count）
  return taken;
}

/** 生成一道题的选项：正确字 + 其 confusingChars（不足随机补字库其他字） */
function buildOptions(curChar) {
  const distractors = (curChar.confusingChars || []).filter((c) => c !== curChar.char);
  const pool = [...CHARACTER_DATABASE.filter((c) => c.char !== curChar.char)];
  for (let i = 0; distractors.length < 3 && i < pool.length; i++) {
    if (!distractors.includes(pool[i].char)) distractors.push(pool[i].char);
  }
  return shuffle([curChar.char, ...distractors.slice(0, 3)]);
}

/** 从字库生成「字 + 拼音」配对卡（消消乐用） */
function buildMatchPairs(count = 4) {
  const chars = pickReviewChars(count);
  return chars.map((c) => ({ char: c.char, pinyin: c.pinyin || "" }));
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
    const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
      activeMode: "play",
      heading: "凯茜游乐场"
    });
    this._addCleanup(destroyShell);

    mainEl.innerHTML = `
      <div class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pb-8">
        
        <!-- 顶部游乐场横幅 -->
        <div class="relative w-full h-44 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 mb-6 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 flex flex-col justify-end p-6">
          <div class="absolute -right-6 -bottom-6 opacity-20 transform scale-150">
            ${GAME_ICONS.arcade()}
          </div>
          
          <div class="relative z-10 text-white">
            <div class="flex items-center gap-3 mb-1">
              <span class="flex items-center">${GAME_ICONS.arcade()}</span>
              <h1 class="text-2xl font-black drop-shadow-md">凯茜游乐场 (全能拓展竞技馆)</h1>
            </div>
            <p class="text-xs text-yellow-200 font-bold">
              趣味游戏化巩固复习，消灭生字怪兽双人对决国学成语，赢取海量凯茜星币！
            </p>
          </div>
        </div>

        <!-- 四大游乐场模块入口卡片 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <!-- 1. 难字歼灭战 -->
          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-rose-200 hover:border-rose-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="boss">
            <div>
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-400 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.monster()}
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
                ${GAME_ICONS.gem()}
              </div>
              <h3 class="text-lg font-black text-gray-900 group-hover:text-amber-600 transition-colors">汉字消消乐</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                听音辨形，拼音与汉字 3D 翻转对对碰快速消除
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
                ${GAME_ICONS.pen()}
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
                ${GAME_ICONS.book()}
              </div>
              <h3 class="text-lg font-black text-gray-900 group-hover:text-emerald-600 transition-colors">成语国学馆</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                50+ 经典成语趣味微课堂生动典故与互动小问答
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
        soundAndFX.playSuccessSound();
        if (mode === "pk") {
          this._busEmit(EVENTS.SWITCH_MODE, { mode: "pk" });
        } else {
          this.currentMode = mode;
          this.render();
        }
      });
    });
  }

  // ----------------------------------------------------
  // 2. 难字歼灭战 (Boss 战)
  // ----------------------------------------------------
  renderBossBattle() {
    // ===== 动态出题：优先待复习/难字，每次进入题目不同 =====
    const chars = pickReviewChars(4);
    if (chars.length === 0) {
      this.currentMode = null;
      this.render();
      return;
    }

    let bossHp = 100;
    let targetIndex = 0;
    let roundCorrect = 0; // 本场连续答对（暴击加成展示用）

    const renderRound = () => {
      const curChar = chars[targetIndex % chars.length];
      const __pmProgress = ebbinghausManager.progress;
      const __pmSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
      // 动态干扰项：正确字 + confusingChars
      const options = buildOptions(curChar);

      soundAndFX.speakPriority(`消灭怪兽！找出汉字：“${curChar.char}”`, { kind: "sentence", priority: 1 });

      this.container.innerHTML = `
        <div class="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-gradient-to-b from-slate-950 via-rose-950 to-slate-950 text-white">
          
          <!-- 顶部状态栏 -->
          <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/20">
            <button id="btn-back-hub" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5">
              <span class="flex items-center">${GAME_ICONS.home()}</span>
              <span>退出战斗</span>
            </button>

            <div class="flex items-center gap-2">
              <span class="flex items-center">${GAME_ICONS.monster()}</span>
              <span class="text-sm font-black text-rose-300">难字歼灭战 · 关卡 Boss</span>
            </div>

            <div class="flex items-center gap-2">
              <button id="btn-boss-sound" class="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg" title="声音开关">
                ${__pmSpeakerIcon}
              </button>
              <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
                ${GAME_ICONS.coin()}<span>${__pmProgress.coins}</span>
              </div>
              <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full">
                ${GAME_ICONS.star(true)}<span>${__pmProgress.stars}</span>
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
              <span class="flex items-center text-white">${GAME_ICONS.monster()}</span>
              <div class="absolute -top-3 bg-red-600 text-white font-black text-[10px] px-3 py-0.5 rounded-full border border-white">
                难字首领 Lv.9
              </div>
            </div>

            <h2 class="text-xl font-black text-yellow-300 mb-1">
              首领怒吼：“谁能认出‘${curChar.char}’（${curChar.pinyin}）字？！”
            </h2>
            <p class="text-xs text-gray-300 mb-6 font-semibold">
              点击下方正确的法术水晶字符，释放激光暴击首领！
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
            <div class="mb-4 flex items-center justify-center">${GAME_ICONS.trophy()}</div>
            <h2 class="text-3xl font-black text-yellow-300 mb-2">首领已彻底歼灭！</h2>
            <p class="text-xs text-gray-300 mb-6 font-semibold">你成功攻克了难字堡垒，守护了汉字王国的安宁！</p>
            <div class="candy-pill rounded-full px-6 py-2 mb-6 text-xs text-yellow-300 font-bold flex items-center gap-2">
              <span class="flex items-center">${GAME_ICONS.coin()}</span>
              <span>获得 20 凯茜星币 + 难字封印勋章</span>
            </div>
            <button id="btn-boss-claim" class="btn-game-orange text-white font-black text-base px-10 py-3 rounded-full">
              领取奖励并返回游乐场
            </button>
          </div>

        </div>
      `;

      const backBtn = this.container.querySelector("#btn-back-hub");
      const bossBar = this.container.querySelector("#boss-hp-bar");
      const hpVal = this.container.querySelector("#boss-hp-val");
      const winModal = this.container.querySelector("#boss-win-modal");
      const bossAvatar = this.container.querySelector("#boss-avatar");
      const soundBtn = this.container.querySelector("#btn-boss-sound");

      if (backBtn) {
        this._on(backBtn, "click", () => {
          soundAndFX.playPop();
          this.currentMode = null;
          this.render();
        });
      }

      if (soundBtn) {
        this._on(soundBtn, "click", () => {
          soundAndFX.toggleMute();
          const ic = soundAndFX.isMuted ? GAME_ICONS.speaker(true) : GAME_ICONS.speaker(false);
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
            soundAndFX.speakPriority(curChar.char, { kind: "char", priority: 1 });
            soundAndFX.triggerConfetti(this.container);

            // ===== 艾宾浩斯复习闭环：答对 → 复习成功 =====
            roundCorrect++;
            ebbinghausManager.completeReview(curChar.id, true);

            if (bossAvatar) {
              bossAvatar.classList.add("animate-shake", "scale-75", "opacity-80");
            }

            bossHp = Math.max(0, bossHp - 35);
            if (bossBar) bossBar.style.width = `${bossHp}%`;
            if (hpVal) hpVal.textContent = `${bossHp}%`;

            if (bossHp <= 0) {
              soundAndFX.playVictoryFanfare();
              soundAndFX.triggerCoinFly(this.container);
              // 奖励：基础 20 币 + 连击暴击加成（最多再 +10）
              const bonus = Math.min(roundCorrect * 2, 10);
              ebbinghausManager.addCoins(20 + bonus);
              ebbinghausManager.markTodayActive();
              this._timeout(() => {
                if (winModal) winModal.classList.remove("hidden");
              }, 800);
            } else {
              targetIndex++;
              this._timeout(renderRound, 800);
            }
          } else {
            soundAndFX.playSoftError();
            soundAndFX.speakPriority(`这是“${selected}”字，请释放“${curChar.char}”法术！`, { kind: "sentence", emotion: "correction" });
            btn.classList.add("animate-shake");
            // ===== 艾宾浩斯闭环：答错 → 标记难字，Boss 回血 =====
            roundCorrect = 0;
            ebbinghausManager.completeReview(curChar.id, false);
            bossHp = Math.min(100, bossHp + 5);
            if (bossBar) bossBar.style.width = `${bossHp}%`;
            if (hpVal) hpVal.textContent = `${bossHp}%`;
            this._timeout(() => {
              btn.classList.remove("animate-shake");
              answered = false;
            }, 600);
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
    // ===== 动态出题：从字库（优先待复习）生成 4 组 字-拼音 配对 =====
    const rawPairs = buildMatchPairs(4);

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
            <span class="flex items-center">${GAME_ICONS.home()}</span>
            <span>返回大厅</span>
          </button>
          
          <div class="flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.gem()}</span>
            <span class="text-sm font-black text-yellow-300">汉字消消乐 (字音配对)</span>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-match-sound" class="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg" title="声音开关">
              ${__pmSpeakerIcon}
            </button>
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.coin()}<span>${__pmProgress.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.star(true)}<span>${__pmProgress.stars}</span>
            </div>
            <div class="candy-pill flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black text-emerald-300">
              <span>已消除: <b id="match-score" class="text-yellow-300 text-sm">0</b> / 4 对</span>
            </div>
          </div>
        </header>

        <main class="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
          <p class="text-xs text-yellow-200 font-bold mb-4">翻开一张汉字和对应的读音拼音，即可消除得分！</p>
          
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
          <div class="mb-4 flex items-center justify-center">${GAME_ICONS.star(true)}</div>
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
        const ic = soundAndFX.isMuted ? GAME_ICONS.speaker(true) : GAME_ICONS.speaker(false);
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

            // ===== 艾宾浩斯复习闭环：配对成功 = 复习成功 =====
            const c = CHARACTER_DATABASE.find((x) => x.char === b1.dataset.match);
            if (c) ebbinghausManager.completeReview(c.id, true);

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

    // ===== 动态出题：5 轮从字库（优先待复习）抽取，每轮选项含 confusingChars =====
    const _roundChars = pickReviewChars(totalRounds);
    const roundData = _roundChars.map((c) => ({
      char: c.char,
      pinyin: c.pinyin || "",
      opts: buildOptions(c),
    }));
    // 兜底：极端情况下字库不足则回退内置 5 题
    const FALLBACK_ROUNDS = [
      { char: "日", pinyin: "rì", opts: ["日", "月", "木", "山"] },
      { char: "月", pinyin: "yuè", opts: ["水", "月", "火", "口"] },
      { char: "水", pinyin: "shuǐ", opts: ["水", "木", "人", "山"] },
      { char: "火", pinyin: "huǒ", opts: ["日", "火", "月", "人"] },
      { char: "山", pinyin: "shān", opts: ["口", "水", "山", "木"] },
    ];
    for (let i = 0; i < totalRounds; i++) {
      if (!roundData[i]) roundData[i] = FALLBACK_ROUNDS[i] || FALLBACK_ROUNDS[0];
    }

    const renderRound = () => {
      const r = roundData[(currentRound - 1) % roundData.length];
      soundAndFX.speakPriority(`抢拍汉字：“${r.char}”`, { kind: "sentence", priority: 1 });

      this.container.innerHTML = `
        <div class="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white">
          
          <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/20">
            <button id="btn-pk-back" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5">
              <span class="flex items-center">${GAME_ICONS.home()}</span>
              <span>退出竞技</span>
            </button>

            <div class="flex items-center gap-2 text-yellow-300 font-black text-sm">
              <span class="flex items-center">${GAME_ICONS.pen()}</span>
              <span>对决第 ${currentRound} / ${totalRounds} 局</span>
            </div>

            <div class="candy-pill flex items-center gap-4 px-5 py-1.5 rounded-full text-xs font-black">
              <span class="text-rose-400"> 红队: ${p1Score}</span>
              <span class="text-cyan-400"> 蓝队: ${p2Score}</span>
            </div>
          </header>

          <main class="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div class="mb-4 bg-black/60 px-6 py-2 rounded-full border border-yellow-400 text-yellow-300 font-black text-lg animate-pulse">
               目标字：读音 ${r.pinyin}
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
            <div class="mb-4 flex items-center justify-center">${GAME_ICONS.trophy()}</div>
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
          const ic = soundAndFX.isMuted ? GAME_ICONS.speaker(true) : GAME_ICONS.speaker(false);
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
            // ===== 艾宾浩斯复习闭环：抢拍正确 = 复习成功 =====
            const c = CHARACTER_DATABASE.find((x) => x.char === r.char);
            if (c) ebbinghausManager.completeReview(c.id, true);
          } else {
            p2Score += 10;
            soundAndFX.playSoftError();
            btn.classList.add("ring-8", "ring-rose-400");
            // ===== 闭环：抢拍错误 = 标记难字 =====
            const c = CHARACTER_DATABASE.find((x) => x.char === r.char);
            if (c) ebbinghausManager.completeReview(c.id, false);
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
  // 5. 成语国学馆 (Idiom Hall) — 深度沉浸版
  // ----------------------------------------------------
  renderIdiomHall() {
    const __pmProgress = ebbinghausManager.progress;
    const __pmSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker(true) : GAME_ICONS.speaker(false);
    const db = (typeof IDIOMS_DATABASE !== "undefined" && IDIOMS_DATABASE.length) ? IDIOMS_DATABASE : [
      { id: "idiom_001", name: "守株待兔", pinyin: "shǒu zhū dài tù", chars: ["守","株","待","兔"], desc: "比喻死守狭隘经验，不知变通，妄想不劳而获", story: "古时候有个农夫在田里干活，忽然一只兔子飞快跑来撞在树桩上死了农夫捡到兔子非常高兴，从此天天坐在树桩旁等待，结果田地荒芜，再也没等到兔子", moral: "做事要脚踏实地努力，不能心存侥幸", gameQuestion: { question: "农夫为什么再也没等到兔子？", options: ["撞树桩是极偶然的巧合，应该靠勤劳劳动", "因为树桩太矮了", "因为兔子跑得太慢了"], correctIndex: 0 } },
      { id: "idiom_002", name: "拔苗助长", pinyin: "bá miáo zhù zhǎng", chars: ["拔","苗","助","长"], desc: "比喻急于求成，违反规律，反而把事情弄糟", story: "古时候有个人嫌禾苗长得太慢，于是把禾苗一棵棵拔高他回家高兴地说：我帮禾苗长高啦！儿子跑到田里一看，禾苗全都枯死了", moral: "万物生长有规律，急于求成往往适得其反", gameQuestion: { question: "禾苗为什么枯死了？", options: ["被拔离土壤，破坏了生长规律", "天气太热了", "禾苗喝了太多水"], correctIndex: 0 } },
      { id: "idiom_003", name: "亡羊补牢", pinyin: "wáng yáng bǔ láo", chars: ["亡","羊","补","牢"], desc: "比喻出了问题后想办法补救，还不算太晚", story: "从前有个牧羊人，羊圈破了个洞，邻居劝他修好，他没听果然，第二天少了一只羊他赶忙修好羊圈，从此再没丢过羊", moral: "犯了错误要及时改正，亡羊补牢，为时未晚", gameQuestion: { question: "牧羊人后来修好羊圈，结果如何？", options: ["再也没有丢过羊", "又丢了很多羊", "羊圈又坏了"], correctIndex: 0 } },
      { id: "idiom_004", name: "画龙点睛", pinyin: "huà lóng diǎn jīng", chars: ["画","龙","点","睛"], desc: "比喻在关键处着墨，使内容更加传神生动", story: "古代画师张僧繇画了四条龙，却不肯点上眼睛人们苦苦请求，他终于给两条龙点了眼睛顿时电闪雷鸣，那两条龙破壁飞上天去了！", moral: "在关键处用力，能让整件事情焕然一新", gameQuestion: { question: "张僧繇给龙点睛后发生了什么？", options: ["电闪雷鸣，龙破壁飞走了", "画作变得更美了", "画师获得了奖赏"], correctIndex: 0 } }
    ];

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col select-none overflow-hidden bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-950 text-white">
        
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/20">
          <button id="btn-idiom-back" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5">
            <span class="flex items-center">${GAME_ICONS.home()}</span>
            <span>返回大厅</span>
          </button>
          <div class="flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.book()}</span>
            <span class="text-sm font-black text-yellow-300">成语国学微课堂</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.coin()}<span>${__pmProgress.coins}</span>
            </div>
          </div>
        </header>

        <main class="relative z-10 flex-1 p-6 overflow-y-auto no-scrollbar">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            ${db.map(item => `
              <div class="idiom-card bg-white/10 backdrop-blur-md rounded-3xl p-5 border-2 border-emerald-300/40 shadow-xl hover:border-yellow-300 cursor-pointer transition-all hover:scale-105 flex flex-col justify-between" data-idiom-idx="${db.indexOf(item)}">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[11px] font-bold text-emerald-300 tracking-wider">${item.pinyin || ""}</span>
                    <div class="flex gap-1">
                      ${(item.chars || Array.from(item.name || "")).map(c => `<span class="w-6 h-6 bg-yellow-400/20 border border-yellow-300/50 rounded-md text-yellow-300 font-black text-xs flex items-center justify-center">${c}</span>`).join("")}
                    </div>
                  </div>
                  <h3 class="text-2xl font-black text-yellow-300 mb-2 tracking-widest">${item.name || item.idiom || ""}</h3>
                  <p class="text-xs text-gray-200 leading-relaxed font-semibold">${item.desc || item.meaning || ""}</p>
                </div>
                <div class="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                  <span class="text-[10px] text-emerald-400 font-bold">国学启蒙必学</span>
                  <button class="text-[10px] bg-yellow-400 text-amber-950 font-black px-3 py-1 rounded-full shadow active:scale-90 transition-transform">听故事闯关</button>
                </div>
              </div>
            `).join("")}
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

    this.container.querySelectorAll(".idiom-card").forEach((card) => {
      this._on(card, "click", () => {
        const idx = parseInt(card.dataset.idiomIdx, 10);
        if (!isNaN(idx) && db[idx]) {
          soundAndFX.playPop();
          this._renderIdiomStory(db[idx], db);
        }
      });
    });
  }

  _renderIdiomStory(idiom, db) {
    const name = idiom.name || idiom.idiom || "";
    const pinyin = idiom.pinyin || "";
    const desc = idiom.desc || idiom.meaning || "";
    const story = idiom.story || desc;
    const moral = idiom.moral || "";
    const chars = idiom.chars || Array.from(name);
    const gameQuestion = idiom.gameQuestion || null;

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col select-none overflow-hidden bg-gradient-to-b from-amber-950 via-orange-950 to-red-950 text-white">
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-amber-300/30">
          <button id="btn-story-back" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5">
            <span class="flex items-center">${GAME_ICONS.home()}</span>
            <span>返回成语馆</span>
          </button>
          <span class="text-sm font-black text-yellow-300">国学故事馆</span>
          <div class="w-24"></div>
        </header>

        <main class="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col items-center gap-5">
          <div class="flex items-center justify-center gap-3 mt-2">
            ${chars.map((c, i) => `
              <div class="idiom-char-anim w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 border-4 border-white shadow-[0_0_30px_rgba(255,215,0,0.6)] flex items-center justify-center opacity-0 scale-50" style="transition:all 0.5s ease;transition-delay:${i*200}ms">
                <span class="text-4xl font-black text-amber-950">${c}</span>
              </div>
            `).join("")}
          </div>

          <p class="text-lg text-amber-300 font-bold tracking-widest opacity-0 transition-opacity duration-700" id="story-pinyin" style="transition-delay:0.8s">${pinyin}</p>

          <div class="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-3xl border-2 border-amber-300/30 p-6 opacity-0 transition-opacity duration-700" id="story-desc" style="transition-delay:1.0s">
            <div class="flex items-center gap-2 mb-3">
              <span class="flex items-center">${GAME_ICONS.sparkle()}</span>
              <span class="text-xs font-black text-amber-300 uppercase tracking-wider">成语释义</span>
            </div>
            <p class="text-sm text-white/90 font-bold leading-relaxed">${desc}</p>
          </div>

          <div class="w-full max-w-2xl bg-white/5 backdrop-blur-md rounded-3xl border border-white/15 p-6 opacity-0 transition-opacity duration-700" id="story-body" style="transition-delay:1.3s">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="flex items-center">${GAME_ICONS.pen()}</span>
                <span class="text-xs font-black text-emerald-300 uppercase tracking-wider">经典故事</span>
              </div>
              <button id="btn-narrate" class="btn-game-orange text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5 active:scale-90">
                <span class="flex items-center">${GAME_ICONS.speaker()}</span>
                <span>朗读故事</span>
              </button>
            </div>
            <p class="text-sm text-white/80 font-semibold leading-loose">${story}</p>
          </div>

          ${moral ? `
          <div class="w-full max-w-2xl bg-emerald-900/60 rounded-3xl border-2 border-emerald-400/40 p-5 opacity-0 transition-opacity duration-700" id="story-moral" style="transition-delay:1.6s">
            <div class="flex items-center gap-2 mb-2">
              <span class="flex items-center">${GAME_ICONS.star(true)}</span>
              <span class="text-xs font-black text-emerald-300">道德寓意</span>
            </div>
            <p class="text-sm text-emerald-100 font-bold leading-relaxed">${moral}</p>
          </div>
          ` : ""}

          ${gameQuestion ? `
          <button id="btn-to-quiz" class="mt-2 btn-game-orange text-white font-black text-base px-12 py-4 rounded-full shadow-xl border-2 border-white active:scale-95 transition-transform flex items-center gap-2 opacity-0" style="transition:opacity 0.7s ease;transition-delay:2.0s">
            <span class="flex items-center">${GAME_ICONS.trophy()}</span>
            <span>我听懂了！来闯关</span>
          </button>
          ` : ""}
        </main>
      </div>
    `;

    // Animate in
    this._timeout(() => {
      this.container.querySelectorAll(".idiom-char-anim").forEach(el => {
        el.style.opacity = "1";
        el.style.transform = "scale(1)";
      });
      ["#story-pinyin","#story-desc","#story-body","#story-moral","#btn-to-quiz"].forEach(sel => {
        const el = this.container.querySelector(sel);
        if (el) el.style.opacity = "1";
      });
      soundAndFX.speakPriority(`${name}。${desc}`, { kind: "sentence", priority: 1 });
    }, 80);

    const backBtn = this.container.querySelector("#btn-story-back");
    if (backBtn) this._on(backBtn, "click", () => { soundAndFX.playPop(); this.renderIdiomHall(); });

    const narrateBtn = this.container.querySelector("#btn-narrate");
    if (narrateBtn) this._on(narrateBtn, "click", () => { soundAndFX.playPop(); soundAndFX.speakPriority(story, { kind: "sentence", priority: 1 }); });

    const quizBtn = this.container.querySelector("#btn-to-quiz");
    if (quizBtn && gameQuestion) this._on(quizBtn, "click", () => { soundAndFX.playPop(); this._renderIdiomQuiz(idiom); });
  }

  _renderIdiomQuiz(idiom) {
    const name = idiom.name || idiom.idiom || "";
    const quiz = idiom.gameQuestion;
    const chars = idiom.chars || Array.from(name);
    let answered = false;

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col items-center justify-center select-none bg-gradient-to-b from-purple-950 via-indigo-950 to-purple-900 text-white p-6">
        <div class="w-full max-w-xl flex flex-col items-center text-center animate-scale-up">
          <div class="flex items-center gap-2 mb-6">
            ${chars.map(c => `<div class="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-white shadow-lg flex items-center justify-center"><span class="text-2xl font-black text-amber-950">${c}</span></div>`).join("")}
          </div>
          <div class="bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/20 p-8 w-full shadow-2xl">
            <div class="flex items-center justify-center gap-2 mb-4">
              <span class="flex items-center">${GAME_ICONS.trophy()}</span>
              <span class="text-xs font-black bg-amber-400 text-amber-950 px-3 py-1 rounded-full">成语闯关小测验</span>
            </div>
            <h2 class="text-xl font-black text-yellow-300 mb-6 leading-relaxed">${quiz.question}</h2>
            <div class="flex flex-col gap-3">
              ${quiz.options.map((opt, idx) => `
                <button class="idiom-opt text-left p-4 rounded-2xl bg-white/10 hover:bg-white/20 border-2 border-white/20 text-white font-black text-sm shadow active:scale-95 transition-all flex items-center gap-3" data-idx="${idx}">
                  <span class="w-7 h-7 rounded-full border-2 border-amber-300 flex items-center justify-center text-xs text-amber-300 font-bold flex-shrink-0">${String.fromCharCode(65+idx)}</span>
                  <span>${opt}</span>
                </button>
              `).join("")}
            </div>
            <div id="quiz-feedback" class="mt-4 h-8 text-sm font-black"></div>
          </div>
        </div>

        <div id="idiom-win" class="fixed inset-0 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center z-50 hidden animate-scale-up">
          <div>${GAME_ICONS.trophy()}</div>
          <h2 class="text-3xl font-black text-yellow-300 mt-4 mb-2">答对了！太聪明了！</h2>
          <p class="text-white/70 text-sm font-bold mb-6">你已经掌握了"${name}"的故事！</p>
          <div class="candy-pill px-6 py-2 mb-6 text-yellow-300 font-black flex items-center gap-2">
            ${GAME_ICONS.coin()} 获得 8 凯茜星币
          </div>
          <div class="flex gap-3">
            <button id="btn-win-more" class="btn-game-orange text-white font-black px-8 py-3 rounded-full">再学一个</button>
            <button id="btn-win-home" class="btn-game-wood text-white font-black px-8 py-3 rounded-full">返回大厅</button>
          </div>
        </div>
      </div>
    `;

    soundAndFX.speakPriority(quiz.question, { kind: "sentence", emotion: "question" });

    const feedback = this.container.querySelector("#quiz-feedback");
    const winModal = this.container.querySelector("#idiom-win");

    this.container.querySelectorAll(".idiom-opt").forEach(btn => {
      this._on(btn, "click", () => {
        if (answered) return;
        answered = true;
        const idx = parseInt(btn.dataset.idx, 10);
        if (idx === quiz.correctIndex) {
          btn.classList.add("ring-4", "ring-emerald-400", "bg-emerald-500/30");
          soundAndFX.playSuccessSound();
          soundAndFX.speakPriority("完全正确！理解力超群！", { kind: "sentence", emotion: "excited" });
          soundAndFX.triggerConfetti(this.container);
          soundAndFX.triggerCoinFly(this.container);
          ebbinghausManager.addCoins(8);
          if (feedback) feedback.innerHTML = '<span class="text-emerald-300 text-base">完全正确！理解力超群！</span>';
          this._timeout(() => { if (winModal) winModal.classList.remove("hidden"); }, 1000);
        } else {
          btn.classList.add("animate-shake", "ring-4", "ring-rose-400");
          soundAndFX.playSoftError();
          soundAndFX.speakPriority("再仔细想想哦，别灰心！", { kind: "sentence", emotion: "correction" });
          if (feedback) feedback.innerHTML = `<span class="text-rose-300">再想想哦，正确答案是 ${String.fromCharCode(65 + quiz.correctIndex)}</span>`;
          this._timeout(() => { btn.classList.remove("animate-shake"); answered = false; }, 800);
        }
      });
    });

    const winMoreBtn = this.container.querySelector("#btn-win-more");
    if (winMoreBtn) this._on(winMoreBtn, "click", () => { soundAndFX.playPop(); this.renderIdiomHall(); });

    const winHomeBtn = this.container.querySelector("#btn-win-home");
    if (winHomeBtn) this._on(winHomeBtn, "click", () => { soundAndFX.playPop(); this.currentMode = null; this.render(); });
  }
}
