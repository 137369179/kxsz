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

// ------------------------------------------------------------
// 游乐场玩法增强专属动画样式（3D翻牌 / 飘字 / 倒计时环 / 狂暴 / 连胜）
// style 标签随模块首次渲染注入一次，不依赖外部 CSS 构建
// ------------------------------------------------------------
const PLAY_STYLE_ID = "cathy-play-enhance-css";
function ensurePlayStyles() {
  if (typeof document === "undefined" || document.getElementById(PLAY_STYLE_ID)) return;
  const css = `
    /* 3D 翻牌（消消乐） */
    .pf-wrap { perspective: 900px; }
    .pf-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform .45s cubic-bezier(.4,0,.2,1); }
    .pf-wrap.flipped .pf-inner { transform: rotateY(180deg); }
    .pf-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; display: flex; align-items: center; justify-content: center; border-radius: 1.25rem; }
    .pf-front { background: linear-gradient(135deg, #fbbf24, #f97316); }
    .pf-back { background: linear-gradient(135deg, #8b5cf6, #6366f1); transform: rotateY(180deg); }
    /* 战斗飘字 */
    .fx-float { position: absolute; font-family: inherit; animation: fxFloat 1.1s ease-out forwards; pointer-events: none; z-index: 60; font-weight: 900; text-shadow: 0 2px 8px rgba(0,0,0,.5); }
    @keyframes fxFloat { 0% { opacity:1; transform: translateY(0) scale(.6); } 30% { transform: translateY(-26px) scale(1.25); } 100% { opacity:0; transform: translateY(-70px) scale(.9); } }
    .fx-pop { animation: fxPop .5s cubic-bezier(.34,1.56,.64,1) both; }
    @keyframes fxPop { 0% { transform: scale(0); } 70% { transform: scale(1.25); } 100% { transform: scale(1); } }
    /* 倒计时环 */
    .timer-ring { width: 72px; height: 72px; border-radius: 50%; display:flex; align-items:center; justify-content:center; position: relative; }
    .timer-ring::before { content:""; position:absolute; inset:-6px; border-radius:50%; border:4px solid rgba(255,255,255,.25); }
    .timer-ring.ticking::after { content:""; position:absolute; inset:-6px; border-radius:50%; border:4px solid transparent; animation: ringSpin 1s linear infinite; }
    @keyframes ringSpin { to { transform: rotate(360deg); } border-color: #fbbf24 transparent transparent transparent; }
    /* Boss 狂暴 */
    .boss-rage { animation: bossRage .6s ease-in-out infinite alternate; }
    @keyframes bossRage { from { transform: scale(1); filter: brightness(1); } to { transform: scale(1.12); filter: brightness(1.45) saturate(1.6); } }
    /* 回复血条绿光 */
    .hp-heal { box-shadow: 0 0 18px rgba(52,211,153,.9); }
    /* 连胜徽章 */
    .streak-badge { animation: streakGlow 1.2s ease-in-out infinite alternate; }
    @keyframes streakGlow { from { box-shadow: 0 0 6px rgba(251,191,36,.4); } to { box-shadow: 0 0 22px rgba(251,191,36,.9); } }
    /* 卡面已学对勾 */
    .learned-stamp { position: absolute; top:8px; right:8px; z-index:5; }
  `;
  const style = document.createElement("style");
  style.id = PLAY_STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}
ensurePlayStyles();

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

/** 在容器内生成「飘字」反馈（+伤害 / 连击 / 提示） */
function spawnFloatingText(container, text, cls = "", opts = {}) {
  if (typeof document === "undefined" || !container) return null;
  const el = document.createElement("div");
  el.className = `fx-float ${cls}`;
  el.textContent = text;
  el.style.left = (opts.left ?? "50%") + "%";
  el.style.top = (opts.top ?? "38") + "%";
  el.style.transform = "translateX(-50%)";
  el.style.fontSize = (opts.size ?? 34) + "px";
  el.style.color = opts.color || "#fbbf24";
  container.appendChild(el);
  setTimeout(() => { try { el.remove(); } catch {} }, 1200);
  return el;
}

/** 生成有限时间倒计时（返回 stop 函数）。onTick 每秒, onTimeout 结束后 */
function startCountdown(seconds, onTick, onTimeout) {
  let remain = seconds;
  const timer = setInterval(() => {
    remain -= 1;
    if (onTick) onTick(remain);
    if (remain <= 0) {
      clearInterval(timer);
      if (onTimeout) onTimeout();
    }
  }, 1000);
  return () => clearInterval(timer);
}

export class PlayModule extends BaseModule {
  constructor(container) {
    super(container);
    this.currentMode = null; // null: 大厅, "boss": 难字歼灭, "match": 消消乐, "fusion": 汉字拼拼乐, "pk": 竞技PK, "idiom": 成语馆
  }

  render() {
    this.destroy();
    if (!this.currentMode) {
      this.renderHub();
    } else if (this.currentMode === "boss") {
      this.renderBossBattle();
    } else if (this.currentMode === "match") {
      this.renderMatchGame();
    } else if (this.currentMode === "fusion") {
      this.renderFusionLab();
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
              <h1 class="text-2xl font-black drop-shadow-md">凯茜游乐场 · 拓展竞技馆</h1>
            </div>
            <p class="text-xs text-yellow-200 font-bold">
              趣味游戏化巩固复习 · 难字歼灭 · 汉字消消乐 · 部首拼拼乐 · 双人对决 · 国学成语
            </p>
          </div>
        </div>

        <!-- 五大游乐场模块入口卡片 (巨幅 3D 视觉大图标) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <!-- 1. 难字歼灭战 -->
          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-rose-200 hover:border-rose-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="boss">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-red-400 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.monster("w-10 h-10 sm:w-12 sm:h-12")}
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-rose-600 transition-colors">难字歼灭战</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                针对艾宾浩斯遗忘曲线薄弱生字，挑战 Boss 怪兽！
              </p>
            </div>
            <button class="mt-4 bg-gradient-to-r from-rose-500 to-red-500 text-white text-xs sm:text-sm font-black py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
              <span>进入挑战</span>
            </button>
          </div>

          <!-- 2. 汉字消消乐 -->
          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-amber-200 hover:border-amber-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="match">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.gem("w-10 h-10 sm:w-12 sm:h-12")}
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-amber-600 transition-colors">汉字消消乐</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                听音辨形，拼音与汉字 3D 翻转对对碰快速消除！
              </p>
            </div>
            <button class="mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs sm:text-sm font-black py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
              <span>开始消除</span>
            </button>
          </div>

          <!-- 3. 汉字拼拼乐 (部首魔法屋) -->
          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-purple-200 hover:border-purple-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="fusion">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.sparkle("w-10 h-10 sm:w-12 sm:h-12")}
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">汉字拼拼乐</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                偏旁部首魔法合成！投入神奇炼金锅，合成目标汉字！
              </p>
            </div>
            <button class="mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs sm:text-sm font-black py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
              <span>开启炼金</span>
            </button>
          </div>

          <!-- 4. 双人竞技场 -->
          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-blue-200 hover:border-blue-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="pk">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-blue-500 to-cyan-400 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.swords("w-10 h-10 sm:w-12 sm:h-12")}
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">双人竞技场</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                双人极速对决 & 亲子让步欢乐PK，听发音抢拍汉字！
              </p>
            </div>
            <button class="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs sm:text-sm font-black py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
              <span>发起对决</span>
            </button>
          </div>

          <!-- 5. 成语国学馆 -->
          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-emerald-200 hover:border-emerald-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="idiom">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-green-400 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.scroll("w-10 h-10 sm:w-12 sm:h-12")}
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors">成语国学馆</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                80+ 经典成语趣味微课堂，生动典故与互动小问答！
              </p>
            </div>
            <button class="mt-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs sm:text-sm font-black py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
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
    let maxStreak = 0;    // 本场最高连击
    let stopTimer = null;
    let roundTimeoutHappened = false; // 每题是否已超时

    const bossDead = () => bossHp <= 0;

    const applyRage = () => {
      // 血量 < 45% 进入狂暴：Boss 变大发光
      const avatar = this.container.querySelector("#boss-avatar");
      const badge = this.container.querySelector("#boss-lv");
      if (!avatar) return;
      if (bossHp <= 45) {
        avatar.classList.add("boss-rage");
        avatar.style.borderColor = "#f97316";
        avatar.style.boxShadow = "0 0 90px rgba(249,115,22,1)";
        if (badge) { badge.textContent = "狂暴首领 Lv.MAX"; badge.style.background = "#f97316"; }
      } else {
        avatar.classList.remove("boss-rage");
        avatar.style.borderColor = "#fff";
        avatar.style.boxShadow = "0 0 60px rgba(244,63,94,0.8)";
        if (badge) { badge.textContent = "难字首领 Lv.9"; badge.style.background = "#dc2626"; }
      }
    };

    const renderRound = () => {
      const curChar = chars[targetIndex % chars.length];
      const __pmProgress = ebbinghausManager.progress;
      const __pmSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
      // 动态干扰项：正确字 + confusingChars
      const options = buildOptions(curChar);
      roundTimeoutHappened = false;

      soundAndFX.speakPriority(`消灭怪兽！找出汉字：“${curChar.char}”`, { kind: "sentence", priority: 1 });

      this.container.innerHTML = `
        <div id="boss-arena" class="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-gradient-to-b from-slate-950 via-rose-950 to-slate-950 text-white">
          
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
            </div>
          </header>

          <!-- Boss 战场舞台 -->
          <main class="relative z-10 flex-1 flex flex-col items-center justify-center p-4 text-center">
            
            <!-- 顶行：倒计时环 + 连击 -->
            <div class="w-full max-w-md flex items-center justify-between mb-3">
              <div class="timer-ring ticking bg-indigo-900/80 border-2 border-indigo-500 text-indigo-100 font-black text-lg shadow-lg" id="boss-timer">
                <span id="boss-timer-val">6</span>
                <span class="text-[8px] absolute -bottom-1 left-1/2 -translate-x-1/2 text-indigo-300">秒</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-yellow-300 streak-badge px-3 py-1 rounded-full border border-yellow-300/60 ${roundCorrect > 0 ? "" : "opacity-40"}">
                  连击 x${roundCorrect}
                </span>
                <span class="text-xs font-black text-amber-200/70">最高 ${maxStreak}</span>
              </div>
            </div>

            <!-- 血条 -->
            <div class="w-full max-w-md bg-black/60 h-5 rounded-full overflow-hidden border-2 border-rose-400 mb-4 p-0.5">
              <div id="boss-hp-bar" class="bg-gradient-to-r from-red-600 via-rose-500 to-yellow-400 h-full rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]" style="width: ${bossHp}%"></div>
            </div>

            <!-- Boss 3D 动画巨兽 -->
            <div id="boss-avatar" class="relative w-32 h-32 rounded-full bg-gradient-to-tr from-rose-600 via-red-500 to-orange-500 border-4 border-white shadow-[0_0_60px_rgba(244,63,94,0.8)] flex items-center justify-center mb-4 animate-bounce-slow transition-all">
              <span class="flex items-center text-white">${GAME_ICONS.monster("w-16 h-16")}</span>
              <div id="boss-lv" class="absolute -top-3 bg-red-600 text-white font-black text-[10px] px-3 py-0.5 rounded-full border border-white">
                难字首领 Lv.9
              </div>
            </div>

            <h2 class="text-lg font-black text-yellow-300 mb-1">
              首领怒吼：“谁能认出‘${curChar.char}’（${curChar.pinyin}）字？！”
            </h2>
            <p class="text-xs text-gray-300 mb-4 font-semibold">
              <span id="boss-tip-text">点击下方正确的法术水晶字符，释放激光暴击首领！</span>
            </p>

            <!-- 攻击法术选项 -->
            <div id="spell-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
              ${options
                .map(
                  (opt) => `
                <button class="boss-spell-btn h-20 rounded-3xl btn-game-orange text-white font-black text-4xl shadow-2xl active:scale-90 transition-all flex items-center justify-center" data-char="${opt}">
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
            <p class="text-xs text-gray-300 mb-4 font-semibold">你成功攻克了难字堡垒，守护了汉字王国的安宁！</p>
            <div class="candy-pill rounded-full px-5 py-2 mb-2 text-xs text-yellow-300 font-bold flex items-center gap-2">
              <span class="flex items-center">${GAME_ICONS.coin("w-5 h-5")}</span>
              <span id="boss-win-reward">获得 20 凯茜星币 + 难字封印勋章</span>
            </div>
            <div id="boss-win-stats" class="text-xs text-gray-400 mb-6 font-semibold"></div>
            <button id="btn-boss-claim" class="btn-game-orange text-white font-black text-base px-10 py-3 rounded-full">
              领取奖励并返回游乐场
            </button>
          </div>

        </div>
      `;

      const backBtn = this.container.querySelector("#btn-back-hub");
      const bossBar = this.container.querySelector("#boss-hp-bar");
      const winModal = this.container.querySelector("#boss-win-modal");
      const bossAvatar = this.container.querySelector("#boss-avatar");
      const soundBtn = this.container.querySelector("#btn-boss-sound");
      const timerEl = this.container.querySelector("#boss-timer");
      const timerVal = this.container.querySelector("#boss-timer-val");
      const tipText = this.container.querySelector("#boss-tip-text");
      const arena = this.container.querySelector("#boss-arena");

      if (backBtn) {
        this._on(backBtn, "click", () => {
          if (stopTimer) stopTimer();
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

      // ===== 限时倒计时：6 秒未答 → Boss 反扑咬回 8% 血 =====
      if (stopTimer) stopTimer();
      const startRoundTimer = () => {
        let sec = 6;
        if (timerVal) timerVal.textContent = sec;
        if (timerEl) timerEl.classList.add("ticking");
        stopTimer = startCountdown(sec, (remain) => {
          if (timerVal) timerVal.textContent = Math.max(remain, 0);
          if (remain <= 2 && timerEl) timerEl.style.borderColor = "#f87171";
        }, () => {
          if (answered || bossDead()) return;
          answered = true;
          roundTimeoutHappened = true;
          soundAndFX.playSoftError();
          if (tipText) tipText.textContent = `⌛ 超时！Boss 反扑咬回 8% 血量…`;
          // 超时视同答错：标记难字复习失败
          ebbinghausManager.completeReview(curChar.id, false);
          roundCorrect = 0;
          bossHp = Math.min(100, bossHp + 8);
          if (bossBar) { bossBar.style.width = `${bossHp}%`; bossBar.classList.add("hp-heal"); setTimeout(() => bossBar.classList.remove("hp-heal"), 500); }
          spawnFloatingText(arena, "Boss 反扑 -8%", "hp", { color: "#f87171", top: 28, size: 22 });
          if (bossAvatar) { bossAvatar.classList.add("animate-shake"); setTimeout(() => bossAvatar.classList.remove("animate-shake"), 500); }
          applyRage();
          this._timeout(() => { answered = false; renderRound(); }, 900);
        });
      };
      startRoundTimer();

      this.container.querySelectorAll(".boss-spell-btn").forEach((btn) => {
        this._on(btn, "click", () => {
          if (answered || bossDead()) return;
          answered = true;
          if (stopTimer) stopTimer();

          const selected = btn.dataset.char;
          if (selected === curChar.char) {
            soundAndFX.playLaserShoot();
            soundAndFX.speakPriority(curChar.char, { kind: "char", priority: 1 });
            soundAndFX.triggerConfetti(this.container);

            // ===== 艾宾浩斯复习闭环：答对 → 复习成功 =====
            roundCorrect++;
            maxStreak = Math.max(maxStreak, roundCorrect);
            ebbinghausManager.completeReview(curChar.id, true);

            // ===== 随机暴击：伤害 35/45/55（连击加成暴击率）=====
            const roll = Math.random();
            const dmg = roll < 0.3 ? 55 : roll < 0.65 ? 45 : 35;
            // 连击 ≥3 时保底高伤
            const finalDmg = roundCorrect >= 3 ? Math.max(dmg, 45) : dmg;

            if (bossAvatar) {
              bossAvatar.classList.add("animate-shake", "scale-75", "opacity-80");
              setTimeout(() => bossAvatar.classList.remove("animate-shake", "scale-75", "opacity-80"), 450);
            }

            bossHp = Math.max(0, bossHp - finalDmg);
            if (bossBar) bossBar.style.width = `${bossHp}%`;
            // 飘字：暴击伤害 + 连击
            spawnFloatingText(arena, `-${finalDmg} 暴击！${finalDmg >= 45 ? "" : ""}`, "dmg", { color: finalDmg >= 45 ? "#f97316" : "#fb7185", top: 45, size: finalDmg >= 45 ? 40 : 32 });
            if (roundCorrect >= 2) spawnFloatingText(arena, `连击 x${roundCorrect}`, "combo", { color: "#fbbf24", top: 30, size: 22 });

            applyRage();

            if (bossDead()) {
              soundAndFX.playVictoryFanfare();
              soundAndFX.triggerCoinFly(this.container);
              // 奖励：基础 20 币 + 最高连击加成（最多 +12）
              const bonus = Math.min(maxStreak * 3, 12);
              ebbinghausManager.addCoins(20 + bonus);
              ebbinghausManager.markTodayActive();
              const rewardEl = this.container.querySelector("#boss-win-reward");
              const statsEl = this.container.querySelector("#boss-win-stats");
              if (rewardEl) rewardEl.textContent = `获得 ${20 + bonus} 凯茜星币 + 难字封印勋章`;
              if (statsEl) statsEl.innerHTML = `最高连击 <b class="text-yellow-300">x${maxStreak}</b> · 每字掌握度 +10`;
              this._timeout(() => {
                if (winModal) winModal.classList.remove("hidden");
              }, 800);
            } else {
              targetIndex++;
              this._timeout(() => { answered = false; renderRound(); }, 800);
            }
          } else {
            soundAndFX.playSoftError();
            soundAndFX.speakPriority(`这是“${selected}”字，请释放“${curChar.char}”法术！`, { kind: "sentence", emotion: "correction" });
            btn.classList.add("animate-shake");
            // ===== 艾宾浩斯闭环：答错 → 标记难字，Boss 回血 =====
            roundCorrect = 0;
            ebbinghausManager.completeReview(curChar.id, false);
            bossHp = Math.min(100, bossHp + 5);
            if (bossBar) { bossBar.style.width = `${bossHp}%`; bossBar.classList.add("hp-heal"); setTimeout(() => bossBar.classList.remove("hp-heal"), 500); }
            spawnFloatingText(arena, "答错了 +5% 回血", "miss", { color: "#34d399", top: 42, size: 20 });
            if (bossAvatar) { bossAvatar.classList.add("animate-shake"); setTimeout(() => bossAvatar.classList.remove("animate-shake"), 450); }
            applyRage();
            this._timeout(() => {
              btn.classList.remove("animate-shake");
              answered = false;
              startRoundTimer();
            }, 600);
          }
        });
      });

      if (claimBtn) {
        this._on(claimBtn, "click", () => {
          if (stopTimer) stopTimer();
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
    let combo = 0;         // 连续配对连击
    let maxCombo = 0;
    let mistakes = 0;      // 失误次数（重置连击）
    let stopTimer = null;
    const TIME_LIMIT = 60; // 秒

    this.container.innerHTML = `
      <div id="match-arena" class="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white">
        
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

        <main class="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
          <!-- 顶行：倒计时 + 连击 -->
          <div class="w-full max-w-2xl flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div id="match-timer" class="timer-ring ticking bg-black/50 border-2 border-yellow-400 text-yellow-300 font-black text-lg">
                <span id="match-timer-val">${TIME_LIMIT}</span>
                <span class="text-[8px] absolute -bottom-1 left-1/2 -translate-x-1/2 text-yellow-200/70">秒</span>
              </div>
              <div class="text-left">
                <div class="text-[10px] text-slate-400 font-bold">限时挑战</div>
                <div class="text-[10px] text-emerald-300 font-black">剩余时间=金币加成</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span id="match-combo" class="text-xs font-black text-yellow-300 streak-badge px-3 py-1 rounded-full border border-yellow-300/60 ${combo > 0 ? "" : "opacity-40"}">
                Combo x${combo}
              </span>
              <span class="text-xs font-black text-amber-200/70">最高 ${maxCombo}</span>
            </div>
          </div>

          <p class="text-xs text-yellow-200 font-bold mb-3">翻开一张汉字和对应的读音拼音，即可消除得分！连击不失误能拿高分！</p>
          
          <div id="match-grid" class="grid grid-cols-4 gap-3 w-full max-w-2xl">
            ${cards
              .map(
                (c, idx) => `
              <button class="match-card-btn pf-wrap w-full h-24 rounded-3xl relative focus:outline-none" data-idx="${idx}" data-match="${c.matchKey}" data-type="${c.type}">
                <span class="pf-inner block w-full h-full">
                  <span class="pf-face pf-front">${c.type === "char" ? `<span class="text-4xl">${c.val}</span>` : `<span class="text-lg tracking-widest">${c.val}</span>`}</span>
                  <span class="pf-face pf-back"><span class="text-3xl text-white/90">？</span></span>
                </span>
              </button>
            `
              )
              .join("")}
          </div>
        </main>

        <div id="match-win-modal" class="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-white hidden animate-scale-up z-50">
          <div class="mb-4 flex items-center justify-center">${GAME_ICONS.star("w-20 h-20", true)}</div>
          <h2 class="text-2xl font-black text-yellow-300 mb-2">全部消除完毕！眼疾手快！</h2>
          <p class="text-xs text-gray-300 mb-2 font-semibold">全部配对成功，太棒啦！</p>
          <div id="match-win-reward" class="candy-pill rounded-full px-5 py-2 mb-6 text-xs text-yellow-300 font-bold flex items-center gap-2">
            ${GAME_ICONS.coin("w-5 h-5")}<span>获得星币奖励</span>
          </div>
          <button id="btn-match-claim" class="btn-game-orange text-white font-black text-base px-10 py-3 rounded-full">
            领取奖励并返回
          </button>
        </div>

        <div id="match-fail-modal" class="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-white hidden animate-scale-up z-50">
          <div class="mb-4 flex items-center justify-center text-6xl">⏰</div>
          <h2 class="text-2xl font-black text-rose-300 mb-2">时间到！</h2>
          <p class="text-xs text-gray-300 mb-2 font-semibold">还有 <b id="match-fail-remain" class="text-yellow-300">0</b> 对未消除</p>
          <p class="text-xs text-gray-400 mb-6 font-semibold">再试一次，连击拿高分！</p>
          <button id="btn-match-retry" class="btn-game-orange text-white font-black text-base px-10 py-3 rounded-full">
            再战一轮
          </button>
        </div>

      </div>
    `;

    const backBtn = this.container.querySelector("#btn-match-back");
    if (backBtn) {
      this._on(backBtn, "click", () => {
        if (stopTimer) stopTimer();
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
    const failModal = this.container.querySelector("#match-fail-modal");
    const claimBtn = this.container.querySelector("#btn-match-claim");
    const retryBtn = this.container.querySelector("#btn-match-retry");
    const comboEl = this.container.querySelector("#match-combo");
    const timerEl = this.container.querySelector("#match-timer");
    const timerValEl = this.container.querySelector("#match-timer-val");
    const arena = this.container.querySelector("#match-arena");

    // ===== 限时：T 秒倒计时，超时判负 =====
    const updateComboUI = () => {
      if (!comboEl) return;
      comboEl.textContent = `Combo x${combo}`;
      comboEl.classList.toggle("opacity-40", combo <= 0);
    };
    if (stopTimer) stopTimer();
    stopTimer = startCountdown(TIME_LIMIT, (remain) => {
      if (timerValEl) timerValEl.textContent = Math.max(remain, 0);
      if (remain <= 10 && timerEl) timerEl.style.borderColor = remain <= 5 ? "#f87171" : "#fbbf24";
    }, () => {
      if (matchedCount >= rawPairs.length) return; // 已获胜
      if (failModal) {
        const remainEl = failModal.querySelector("#match-fail-remain");
        if (remainEl) remainEl.textContent = rawPairs.length - matchedCount;
        failModal.classList.remove("hidden");
        // 未消除的字标记为难点
        cards.filter((c) => c.type === "char").forEach((c) => {
          const rec = CHARACTER_DATABASE.find((x) => x.char === c.matchKey);
          if (rec) ebbinghausManager.completeReview(rec.id, false);
        });
      }
    });

    this.container.querySelectorAll(".match-card-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        if (btn.classList.contains("matched") || flipped.includes(btn) || failModal.classList.contains("hidden") === false) return;

        // ===== 3D 翻牌 =====
        btn.classList.add("flipped");
        soundAndFX.playCardFlip();
        setTimeout(() => btn.querySelector(".pf-front").classList.add("ring-4", "ring-yellow-200"), 200);

        flipped.push(btn);

        if (flipped.length === 2) {
          const [b1, b2] = flipped;
          if (b1.dataset.match === b2.dataset.match) {
            // 配对成功 → 连击 +1
            soundAndFX.playSuccessSound();
            soundAndFX.triggerConfetti(this.container);
            combo++;
            maxCombo = Math.max(maxCombo, combo);
            matchedCount++;
            if (scoreEl) scoreEl.textContent = matchedCount;
            updateComboUI();
            spawnFloatingText(arena, `配对成功 ${combo >= 2 ? `Combo x${combo}` : ""}`, "match-ok", { color: "#34d399", top: 32, size: 22 });

            // ===== 艾宾浩斯复习闭环：配对成功 = 复习成功 =====
            const c = CHARACTER_DATABASE.find((x) => x.char === b1.dataset.match);
            if (c) ebbinghausManager.completeReview(c.id, true);

            this._timeout(() => {
              b1.classList.add("matched", "opacity-0", "pointer-events-none", "scale-90");
              b2.classList.add("matched", "opacity-0", "pointer-events-none", "scale-90");
              flipped = [];

              if (matchedCount >= rawPairs.length) {
                soundAndFX.playVictoryFanfare();
                soundAndFX.triggerCoinFly(this.container);
                if (stopTimer) stopTimer();
                // 奖励：基础 10 币 + 连击加成 + 剩余时间加成（每秒 0.2 币）
                const remainSec = timerValEl ? parseInt(timerValEl.textContent, 10) || 0 : 0;
                const bonus = Math.min(maxCombo * 2, 8) + Math.min(Math.floor(remainSec / 5), 4);
                ebbinghausManager.addCoins(10 + bonus);
                const rewardEl = this.container.querySelector("#match-win-reward");
                if (rewardEl) rewardEl.innerHTML = `${GAME_ICONS.coin("w-5 h-5")}<span>获得 ${10 + bonus} 凯茜星币 (连击 x${maxCombo} + 剩余时间奖励)</span>`;
                if (winModal) winModal.classList.remove("hidden");
              }
            }, 500);
          } else {
            // 配对失败 → 连击清零
            soundAndFX.playSoftError();
            mistakes++;
            combo = 0;
            updateComboUI();
            this._timeout(() => {
              b1.classList.remove("flipped");
              b2.classList.remove("flipped");
              b1.querySelector(".pf-front")?.classList.remove("ring-4", "ring-yellow-200");
              b2.querySelector(".pf-front")?.classList.remove("ring-4", "ring-yellow-200");
              flipped = [];
            }, 650);
          }
        }
      });
    });

    if (claimBtn) {
      this._on(claimBtn, "click", () => {
        if (stopTimer) stopTimer();
        soundAndFX.playPop();
        this.currentMode = null;
        this.render();
      });
    }

    if (retryBtn) {
      this._on(retryBtn, "click", () => {
        soundAndFX.playPop();
        this.renderMatchGame();
      });
    }
  }

  // ----------------------------------------------------
  // 3. 汉字拼拼乐 (部首魔法合成屋)
  // ----------------------------------------------------
  renderFusionLab() {
    const FUSION_RECIPES = [
      { target: "明", pinyin: "míng", parts: ["日", "月"], desc: "太阳和月亮放在一起，大放光明", words: "明亮、明天" },
      { target: "休", pinyin: "xiū", parts: ["亻", "木"], desc: "人靠在树木旁，停下来休息", words: "休息、休假" },
      { target: "林", pinyin: "lín", parts: ["木", "木"], desc: "很多树木在一起，长成茂密树林", words: "树林、森林" },
      { target: "鸣", pinyin: "míng", parts: ["口", "鸟"], desc: "鸟儿张开嘴巴，欢快鸣叫", words: "鸣叫、百鸟争鸣" },
      { target: "尖", pinyin: "jiān", parts: ["小", "大"], desc: "上面小下面大，形成尖尖的形状", words: "尖锐、笔尖" },
      { target: "男", pinyin: "nán", parts: ["田", "力"], desc: "在田地里出力气劳作的人", words: "男生、男孩" },
      { target: "好", pinyin: "hǎo", parts: ["女", "子"], desc: "女子与孩子相亲相爱，美好幸福", words: "好事、美好" },
      { target: "沐", pinyin: "mù", parts: ["氵", "木"], desc: "用水润泽树木，沐浴清风", words: "沐浴、如沐春风" },
      { target: "间", pinyin: "jiān", parts: ["门", "日"], desc: "门缝中照进阳光，形成空间", words: "房间、时间" },
      { target: "从", pinyin: "cóng", parts: ["人", "人"], desc: "一个人跟着另一个人走", words: "从前、跟从" },
      { target: "秋", pinyin: "qiū", parts: ["禾", "火"], desc: "禾苗成熟金黄如火的秋天", words: "秋天、金秋" },
      { target: "看", pinyin: "kàn", parts: ["手", "目"], desc: "把手搭在眼睛上方远望", words: "看见、看着" },
      { target: "采", pinyin: "cǎi", parts: ["爫", "木"], desc: "用手在树木上采摘果实", words: "采摘、采取" },
      { target: "早", pinyin: "zǎo", parts: ["日", "十"], desc: "清晨太阳升起十丈高", words: "早上、早安" },
      { target: "地", pinyin: "dì", parts: ["土", "也"], desc: "大地生养万物", words: "大地、地面" },
    ];

    const DISTRACTORS_POOL = ["氵", "艹", "口", "木", "日", "月", "人", "女", "田", "力", "门", "鸟", "手", "目", "土", "心"];

    let currentRound = 1;
    const totalRounds = 5;
    const shuffledRecipes = shuffle([...FUSION_RECIPES]).slice(0, totalRounds);
    let selectedParts = [];
    let score = 0;

    const renderRound = () => {
      const cur = shuffledRecipes[currentRound - 1];
      selectedParts = [];

      // 组装 6 个部件选项 (2 个正确 + 4 个干扰)
      const distractors = shuffle(DISTRACTORS_POOL.filter(d => !cur.parts.includes(d))).slice(0, 4);
      const options = shuffle([...cur.parts, ...distractors]);

      soundAndFX.speakPriority(`请选择部件合成汉字：“${cur.target}”`, { kind: "sentence", priority: 1 });

      this.container.innerHTML = `
        <div id="fusion-lab-arena" class="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white animate-fade-in">
          
          <!-- 顶栏 -->
          <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-purple-400/20">
            <button id="btn-fusion-back" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
              <span>退出魔法屋</span>
            </button>

            <div class="flex items-center gap-2 text-purple-300 font-black text-sm">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-5 h-5")}</span>
              <span>魔法合成 第 ${currentRound} / ${totalRounds} 关</span>
            </div>

            <div class="candy-pill flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black text-yellow-300">
              ${GAME_ICONS.coin("w-4 h-4")}
              <span>炼金得分: ${score}</span>
            </div>
          </header>

          <!-- 中间主炼金舞台 -->
          <main class="relative z-10 flex-1 flex flex-col items-center justify-center p-4 text-center">
            
            <!-- 目标汉字气泡 -->
            <div class="mb-4 bg-purple-900/60 px-6 py-2 rounded-full border-2 border-purple-400/50 shadow-2xl flex items-center gap-3">
              <span class="text-xs font-bold text-purple-200">目标合成字：</span>
              <span class="text-3xl font-black text-yellow-300 font-serif">${cur.target}</span>
              <span class="text-xs font-bold text-purple-300">(${cur.pinyin})</span>
            </div>

            <!-- 魔法炼金大铜锅 -->
            <div class="relative w-48 h-48 sm:w-56 sm:h-56 mb-4 flex flex-col items-center justify-center">
              <div id="cauldron-glow" class="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/40 via-fuchsia-500/40 to-cyan-500/40 blur-2xl animate-pulse"></div>
              
              <!-- 锅身 -->
              <div class="relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-b from-purple-800 via-indigo-900 to-slate-950 border-4 border-amber-300/80 shadow-[0_0_50px_rgba(168,85,247,0.5)] flex flex-col items-center justify-center p-4">
                
                <!-- 已放入的部件槽位 -->
                <div class="flex items-center gap-2 mb-2">
                  <div id="slot-1" class="w-14 h-14 rounded-2xl bg-black/50 border-2 border-dashed border-purple-300 flex items-center justify-center text-2xl font-black text-yellow-300">
                    ?
                  </div>
                  <span class="text-xl font-black text-purple-300">+</span>
                  <div id="slot-2" class="w-14 h-14 rounded-2xl bg-black/50 border-2 border-dashed border-purple-300 flex items-center justify-center text-2xl font-black text-yellow-300">
                    ?
                  </div>
                </div>

                <span class="text-[10px] text-purple-200 font-bold">请点击下方 2 个部件投入锅中</span>
              </div>
            </div>

            <!-- 底部 6 大可选部件抽屉 -->
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-3 w-full max-w-xl">
              ${options
                .map(
                  (part) => `
                <button class="fusion-part-btn h-16 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500/80 to-indigo-600/80 border-2 border-purple-300 hover:border-yellow-300 text-white font-black text-3xl sm:text-4xl shadow-xl active:scale-90 transition-all flex items-center justify-center cursor-pointer hover:scale-105" data-part="${part}">
                  ${part}
                </button>
              `
                )
                .join("")}
            </div>

          </main>

          <!-- 成功合成弹窗 -->
          <div id="fusion-success-modal" class="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-white hidden animate-scale-up z-50 p-6 text-center">
            <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center text-5xl font-black shadow-2xl mb-4 font-serif border-4 border-white animate-bounce">
              ${cur.target}
            </div>
            <h3 class="text-2xl font-black text-yellow-300 mb-1">🎉 魔法合成成功！【${cur.target}】</h3>
            <p class="text-xs text-purple-200 font-bold mb-3">${cur.pinyin} · ${cur.parts.join(" + ")}</p>
            <div class="max-w-md bg-white/10 rounded-2xl p-4 border border-purple-300/30 text-xs text-white/90 leading-relaxed font-semibold mb-5">
              <p class="text-amber-300 font-black mb-1">【字源奥秘】${cur.desc}</p>
              <p class="text-purple-200">【常用词组】${cur.words}</p>
            </div>
            <button id="btn-next-fusion" class="btn-game-orange text-white font-black text-base px-10 py-3 rounded-full shadow-2xl active:scale-95 cursor-pointer">
              ${currentRound < totalRounds ? "下一道魔法题 →" : "完成全部炼金 · 领奖"}
            </button>
          </div>

          <!-- 通关总结算弹窗 -->
          <div id="fusion-complete-modal" class="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-white hidden animate-scale-up z-50 p-6 text-center">
            <div class="mb-4 flex items-center justify-center">${GAME_ICONS.trophy("w-24 h-24")}</div>
            <h2 class="text-3xl font-black text-yellow-300 mb-2">🏅 汉字炼金大宗师！</h2>
            <p class="text-xs text-purple-200 mb-4 font-bold">太聪明啦！成功完成了全部 ${totalRounds} 道汉字部首魔法合成！</p>
            <div class="candy-pill rounded-full px-6 py-2.5 mb-6 text-sm text-yellow-300 font-black flex items-center gap-2">
              ${GAME_ICONS.coin("w-5 h-5")}<span>获得 25 凯茜星币奖励</span>
            </div>
            <button id="btn-claim-fusion" class="btn-game-orange text-white font-black text-base px-10 py-3 rounded-full cursor-pointer">
              领取星币返回游乐场
            </button>
          </div>

        </div>
      `;

      const backBtn = this.container.querySelector("#btn-fusion-back");
      if (backBtn) {
        this._on(backBtn, "click", () => {
          soundAndFX.playPop();
          this.currentMode = null;
          this.render();
        });
      }

      const slot1 = this.container.querySelector("#slot-1");
      const slot2 = this.container.querySelector("#slot-2");
      const successModal = this.container.querySelector("#fusion-success-modal");
      const completeModal = this.container.querySelector("#fusion-complete-modal");
      const nextBtn = this.container.querySelector("#btn-next-fusion");
      const claimBtn = this.container.querySelector("#btn-claim-fusion");

      this.container.querySelectorAll(".fusion-part-btn").forEach((btn) => {
        this._on(btn, "click", () => {
          const part = btn.dataset.part;
          soundAndFX.playPop();

          if (selectedParts.length === 0) {
            selectedParts.push(part);
            if (slot1) { slot1.textContent = part; slot1.classList.add("bg-purple-600/60", "border-solid", "border-yellow-300"); }
            btn.classList.add("opacity-40", "pointer-events-none");
          } else if (selectedParts.length === 1) {
            selectedParts.push(part);
            if (slot2) { slot2.textContent = part; slot2.classList.add("bg-purple-600/60", "border-solid", "border-yellow-300"); }
            btn.classList.add("opacity-40", "pointer-events-none");

            // 判定是否匹配当前公式（顺序不限）
            const isCorrect = (selectedParts[0] === cur.parts[0] && selectedParts[1] === cur.parts[1]) ||
                              (selectedParts[0] === cur.parts[1] && selectedParts[1] === cur.parts[0]);

            if (isCorrect) {
              score += 20;
              soundAndFX.playStarPopCombo();
              soundAndFX.triggerConfetti(this.container);
              soundAndFX.speakPriority(`${cur.target}，${cur.pinyin}。${cur.desc}`, { kind: "sentence", priority: 1 });
              if (successModal) successModal.classList.remove("hidden");
            } else {
              soundAndFX.playSoftError();
              spawnFloatingText(this.container.querySelector("#fusion-lab-arena"), "❌ 差一点，再试一次！", "fusion-err", { color: "#f87171", top: 40 });
              this._timeout(() => {
                selectedParts = [];
                if (slot1) { slot1.textContent = "?"; slot1.classList.remove("bg-purple-600/60", "border-solid", "border-yellow-300"); }
                if (slot2) { slot2.textContent = "?"; slot2.classList.remove("bg-purple-600/60", "border-solid", "border-yellow-300"); }
                this.container.querySelectorAll(".fusion-part-btn").forEach((b) => b.classList.remove("opacity-40", "pointer-events-none"));
              }, 800);
            }
          }
        });
      });

      if (nextBtn) {
        this._on(nextBtn, "click", () => {
          soundAndFX.playPop();
          if (successModal) successModal.classList.add("hidden");
          if (currentRound < totalRounds) {
            currentRound++;
            renderRound();
          } else {
            soundAndFX.playCrownFanfare();
            soundAndFX.triggerConfetti(this.container);
            rewardEngine.addCoins(25);
            if (completeModal) completeModal.classList.remove("hidden");
          }
        });
      }

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
  // 4. 双人对战竞技场 (PK Arena)
  // ----------------------------------------------------
  renderPkArena() {
    const __pmProgress = ebbinghausManager.progress;
    const __pmSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
    let isFamilyMode = true; // 默认开启亲子欢乐对决模式
    let p1Score = 0;
    let p2Score = 0;
    let p1Streak = 0;     // 宝贝/红队连胜
    let p2Streak = 0;     // 家长/蓝队连胜
    let currentRound = 1;
    const totalRounds = 5;
    let stopTimer = null;

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

      const p1Label = isFamilyMode ? "👧 宝贝" : "🔴 红队";
      const p2Label = isFamilyMode ? "👨 家长" : "🔵 蓝队";

      this.container.innerHTML = `
        <div id="pk-arena" class="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white">
          
          <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/20 flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <button id="btn-pk-back" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer">
                <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
                <span>退出竞技</span>
              </button>
              <button id="btn-pk-toggle-mode" class="px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${isFamilyMode ? "bg-amber-400 text-amber-950 font-black shadow-lg" : "bg-white/20 text-white"}">
                ${isFamilyMode ? "👨‍👩‍👧 亲子让步模式 (开启)" : "🥊 极速对决模式"}
              </button>
            </div>

            <div class="flex items-center gap-2 text-yellow-300 font-black text-sm">
              <span class="flex items-center">${GAME_ICONS.pen("w-6 h-6")}</span>
              <span>对决第 ${currentRound} / ${totalRounds} 局</span>
            </div>

            <div class="candy-pill flex items-center gap-4 px-5 py-1.5 rounded-full text-xs font-black">
              <span class="text-rose-400 font-black">${p1Label}: ${p1Score}${p1Streak >= 2 ? `  x${p1Streak}` : ""}</span>
              <span class="text-cyan-400 font-black">${p2Label}: ${p2Score}${p2Streak >= 2 ? `  x${p2Streak}` : ""}</span>
            </div>
          </header>

          <main class="relative z-10 flex-1 flex flex-col items-center justify-center p-4 text-center">
            <!-- 顶行：抢答倒计时 -->
            <div class="flex items-center gap-3 mb-3">
              <div class="timer-ring ticking bg-black/50 border-2 border-indigo-400 text-indigo-100 font-black text-lg" id="pk-timer">
                <span id="pk-timer-val">${isFamilyMode ? "7" : "5"}</span>
                <span class="text-[8px] absolute -bottom-1 left-1/2 -translate-x-1/2 text-indigo-300">抢答</span>
              </div>
              <div class="text-left">
                <div class="text-[10px] text-slate-400 font-bold">${isFamilyMode ? "宝贝与家长谁先抢拍？" : "谁先抢拍？"}</div>
                <div class="text-[10px] text-indigo-300 font-black">${isFamilyMode ? "让步模式：宝贝优先识别" : "5 秒内选对即夺分"}</div>
              </div>
            </div>

            <div id="pk-prompt" class="mb-3 bg-black/60 px-6 py-2 rounded-full border border-yellow-400 text-yellow-300 font-black text-lg animate-pulse">
               目标字：读音 ${r.pinyin}
            </div>

            <div id="pk-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
              ${r.opts
                .map(
                  (opt) => {
                    const isHint = isFamilyMode && p2Score > p1Score && opt === r.char;
                    return `
                      <button class="pk-opt-btn h-24 rounded-3xl btn-game-orange text-white font-black text-5xl shadow-2xl active:scale-90 transition-all flex items-center justify-center ${isHint ? "ring-4 ring-amber-300 shadow-amber-400/50" : ""}" data-char="${opt}">
                        ${opt}
                      </button>
                    `;
                  }
                )
                .join("")}
            </div>
          </main>

          <div id="pk-win-modal" class="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-white hidden animate-scale-up z-50">
            <div class="mb-4 flex items-center justify-center">${GAME_ICONS.trophy("w-24 h-24")}</div>
            <h2 class="text-3xl font-black text-yellow-300 mb-2">${isFamilyMode ? "🎉 最佳亲子默契拍档！" : "对决大获全胜！"}</h2>
            <p class="text-xs text-gray-300 mb-2 font-semibold">最终比分：${p1Label} ${p1Score} - ${p2Label} ${p2Score}</p>
            <div id="pk-win-crown" class="text-sm font-black text-yellow-300 mb-4"></div>
            <div id="pk-win-reward" class="candy-pill rounded-full px-5 py-2 mb-6 text-xs text-yellow-300 font-bold flex items-center gap-2">
              ${GAME_ICONS.coin("w-5 h-5")}<span>获得星币奖励</span>
            </div>
            <button id="btn-pk-claim" class="btn-game-orange text-white font-black text-base px-10 py-3 rounded-full cursor-pointer">
              领取星币返回
            </button>
          </div>

        </div>
      `;

      const backBtn = this.container.querySelector("#btn-pk-back");
      if (backBtn) {
        this._on(backBtn, "click", () => {
          if (stopTimer) stopTimer();
          soundAndFX.playPop();
          this.currentMode = null;
          this.render();
        });
      }

      const toggleModeBtn = this.container.querySelector("#btn-pk-toggle-mode");
      if (toggleModeBtn) {
        this._on(toggleModeBtn, "click", () => {
          if (stopTimer) stopTimer();
          isFamilyMode = !isFamilyMode;
          soundAndFX.playPop();
          renderRound();
        });
      }

      const winModal = this.container.querySelector("#pk-win-modal");
      const claimBtn = this.container.querySelector("#btn-pk-claim");
      const arena = this.container.querySelector("#pk-arena");
      const timerEl = this.container.querySelector("#pk-timer");
      const timerValEl = this.container.querySelector("#pk-timer-val");

      let answered = false;

      // ===== 抢答倒计时：亲子模式 7s / 极速模式 5s =====
      if (stopTimer) stopTimer();
      const startRoundTimer = () => {
        let sec = isFamilyMode ? 7 : 5;
        if (timerValEl) timerValEl.textContent = sec;
        if (timerEl) { timerEl.classList.add("ticking"); timerEl.style.borderColor = ""; }
        stopTimer = startCountdown(sec, (remain) => {
          if (timerValEl) timerValEl.textContent = Math.max(remain, 0);
          if (remain <= 2 && timerEl) timerEl.style.borderColor = "#f87171";
          if (remain <= 2) soundAndFX.playTick?.();
        }, () => {
          if (answered) return;
          answered = true;
          // 超时：蓝队/家长得 5 分
          p2Score += 5;
          p2Streak++;
          p1Streak = 0;
          soundAndFX.playSoftError();
          spawnFloatingText(arena, `⏰ 超时！${p2Label} 夺 5 分`, "pk-timeout", { color: "#22d3ee", top: 34, size: 22 });
          const c = CHARACTER_DATABASE.find((x) => x.char === r.char);
          if (c) ebbinghausManager.completeReview(c.id, false);
          this._timeout(() => { answered = false; nextRound(); }, 900);
        });
      };

      const nextRound = () => {
        if (currentRound < totalRounds) {
          currentRound++;
          renderRound();
        } else {
          if (isFamilyMode) {
            soundAndFX.playParentCheer();
          } else {
            soundAndFX.playVictoryFanfare();
          }
          const crownEl = this.container.querySelector("#pk-win-crown");
          const rewardEl = this.container.querySelector("#pk-win-reward");
          const winner = p1Score > p2Score ? p1Label : p1Score < p2Score ? p2Label : "平局";
          if (crownEl) {
            crownEl.textContent = isFamilyMode
              ? "🌟 亲子默契大圆满！全家一起识字棒棒哒！"
              : winner === p1Label
              ? `${p1Label} 获得冠军皇冠！`
              : winner === p2Label
              ? `${p2Label} 获得冠军皇冠！`
              : "势均力敌，握手言和！";
          }
          // 奖励：基础 20 币 + 胜方加成 + 连胜加成
          let reward = 20;
          if (p1Score > p2Score) reward += 10 + Math.min(p1Streak * 2, 6);
          else if (p1Score < p2Score) reward += 5;
          else reward += 8;
          ebbinghausManager.addCoins(reward);
          if (rewardEl) rewardEl.innerHTML = `${GAME_ICONS.coin("w-5 h-5")}<span>获得 ${reward} 凯茜星币 · ${p1Label} ${p1Score} - ${p2Label} ${p2Score}</span>`;
          if (winModal) winModal.classList.remove("hidden");
        }
      };

      this.container.querySelectorAll(".pk-opt-btn").forEach((btn) => {
        this._on(btn, "click", () => {
          if (answered) return;
          answered = true;
          if (stopTimer) stopTimer();

          const val = btn.dataset.char;
          if (val === r.char) {
            p1Score += 10;
            p1Streak++;
            p2Streak = 0;
            soundAndFX.playSuccessSound();
            soundAndFX.triggerConfetti(this.container);
            btn.classList.add("ring-8", "ring-emerald-400");
            spawnFloatingText(arena, `${p1Label} +10${p1Streak >= 2 ? ` 连胜 x${p1Streak}` : ""}`, "pk-ok", { color: "#fb7185", top: 34, size: 22 });
            // ===== 艾宾浩斯复习闭环：抢拍正确 = 复习成功 =====
            const c = CHARACTER_DATABASE.find((x) => x.char === r.char);
            if (c) ebbinghausManager.completeReview(c.id, true);
          } else {
            p2Score += 10;
            p2Streak++;
            p1Streak = 0;
            soundAndFX.playSoftError();
            btn.classList.add("ring-8", "ring-rose-400");
            spawnFloatingText(arena, `${p2Label} +10`, "pk-miss", { color: "#22d3ee", top: 34, size: 20 });
            // ===== 闭环：抢拍错误 = 标记难字 =====
            const c = CHARACTER_DATABASE.find((x) => x.char === r.char);
            if (c) ebbinghausManager.completeReview(c.id, false);
          }

          this._timeout(() => { answered = false; nextRound(); }, 800);
        });
      });

      if (claimBtn) {
        this._on(claimBtn, "click", () => {
          if (stopTimer) stopTimer();
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
    const __pmSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
    // 已学成语集合（答对记录）
    const learned = new Set(__pmProgress.learnedIdioms || []);
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
              ${GAME_ICONS.coin("w-4 h-4")}<span>${__pmProgress.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-emerald-300 font-black text-xs px-3 py-1 rounded-full">
              <span>已学 <b id="idiom-learned-count" class="text-yellow-300">${learned.size}</b>/${db.length}</span>
            </div>
          </div>
        </header>

        <main class="relative z-10 flex-1 p-6 overflow-y-auto no-scrollbar">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            ${db.map(item => {
              const isLearned = learned.has(item.id || item.name);
              return `
              <div class="idiom-card bg-white/10 backdrop-blur-md rounded-3xl p-5 border-2 ${isLearned ? "border-emerald-400/70" : "border-emerald-300/40"} shadow-xl hover:border-yellow-300 cursor-pointer transition-all hover:scale-105 flex flex-col justify-between relative" data-idiom-idx="${db.indexOf(item)}">
                ${isLearned ? `<span class="learned-stamp w-7 h-7 rounded-full bg-emerald-500 border-2 border-white text-white flex items-center justify-center text-sm shadow-lg">OK</span>` : ""}
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
                  <span class="text-[10px] ${isLearned ? "text-emerald-400 font-black" : "text-emerald-400/70 font-bold"}">${isLearned ? " 已掌握" : "国学启蒙必学"}</span>
                  <button class="text-[10px] ${isLearned ? "bg-emerald-400" : "bg-yellow-400"} text-amber-950 font-black px-3 py-1 rounded-full shadow active:scale-90 transition-transform">${isLearned ? "再次回顾" : "听故事闯关"}</button>
                </div>
              </div>
            `;}).join("")}
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
          // 记录该成语已学（返回馆内显示对勾）
          const id = idiom.id || idiom.name || "";
          if (id && !ebbinghausManager.progress.learnedIdioms) ebbinghausManager.progress.learnedIdioms = [];
          if (id && !ebbinghausManager.progress.learnedIdioms.includes(id)) {
            ebbinghausManager.progress.learnedIdioms.push(id);
            ebbinghausManager.save();
            soundAndFX.triggerConfetti(this.container);
          }
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
