/** PlayModule mode — extracted */
import { CHARACTER_DATABASE } from "../../data/characters.js";
import { IDIOMS_DATABASE } from "../../data/idioms.js";
import { POEMS_DATABASE } from "../../data/poems.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { soundAndFX } from "../soundEngine.js";
import { mountGameShell, showGameToast } from "../../components/SharedShell.js";
import { escapeHtml } from "../BaseModule.js";
import { GAME_ICONS } from "../gameIcons.js";
import { EVENTS } from "../eventBus.js";
import { RADICAL_FAMILIES } from "../../data/radicalFamilies.js";
import { forChar as mmForChar, SCENES as MM_SCENES } from "../multimodalEngine.js";
import {
  shuffle,
  pickReviewChars,
  buildOptions,
  buildMatchPairs,
  spawnFloatingText,
  startCountdown,
} from "./playHelpers.js";

export function renderSpotterGame() {
    const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
      activeMode: "play",
      heading: "\u706b\u773c\u91d1\u775b\u8fa8\u5f02\u540c"
    });
    this._addCleanup(destroyShell);

    const CONFUSED_PAIRS_BANK = [
      { a: "\u5927", b: "\u592a", target: "\u592a", diffDesc: "\"\u592a\"\u5b57\u5e95\u4e0b\u591a\u4e86\u4e00\u70b9", hint: "\u50cf\u4e00\u9897\u95ea\u4eae\u7684\u5c0f\u6263\u5b50\uff01" },
      { a: "\u65e5", b: "\u76ee", target: "\u76ee", diffDesc: "\"\u76ee\"\u5b57\u4e2d\u95f4\u6709\u4e24\u6a2a", hint: "\u5c31\u50cf\u4e24\u53ea\u5927\u773c\u775b\u770b\u4e16\u754c\uff01" },
      { a: "\u6728", b: "\u79be", target: "\u79be", diffDesc: "\"\u79be\"\u5b57\u5934\u9876\u591a\u4e86\u4e00\u6487", hint: "\u5c31\u50cf\u6c89\u7538\u7538\u91d1\u9ec4\u7684\u5c0f\u9ea6\u7a57\uff01" },
      { a: "\u4eba", b: "\u5165", target: "\u4eba", diffDesc: "\"\u4eba\"\u5b57\u6487\u5728\u6368\u4e0a\u5934", hint: "\u4e00\u6487\u4e00\u6368\u7ad9\u5f97\u76f4\uff0c\u9876\u5929\u7acb\u5730\uff01" },
      { a: "\u5200", b: "\u529b", target: "\u529b", diffDesc: "\"\u529b\"\u5b57\u4e00\u6487\u51fa\u4e86\u5934", hint: "\u6709\u529b\u91cf\u6709\u51b2\u52b2\uff0c\u51b2\u51fa\u5934\u6765\uff01" },
      { a: "\u571f", b: "\u58eb", target: "\u571f", diffDesc: "\"\u571f\"\u5b57\u4e0a\u6a2a\u77ed\u4e0b\u6a2a\u957f", hint: "\u6ce5\u571f\u5728\u5927\u5730\u7a33\u7a33\u6258\u4f4f\u4e07\u7269\uff01" },
      { a: "\u725b", b: "\u5348", target: "\u725b", diffDesc: "\"\u725b\"\u5b57\u4e00\u7ad9\u4f38\u51fa\u5934", hint: "\u5c31\u50cf\u53ef\u7231\u5c0f\u725b\u957f\u51fa\u728a\u89d2\uff01" }
    ];

    let questions = shuffle([...CONFUSED_PAIRS_BANK]);
    try {
      const topPair = ebbinghausManager.getTopConfusedPair();
      if (topPair && topPair.target && topPair.confused) {
        questions.unshift({
          a: topPair.target, b: topPair.confused, target: topPair.target,
          diffDesc: `"${topPair.target}"\u4e0e"${topPair.confused}"\u4ed4\u7ec6\u8fa8\u522b`,
          hint: `AI \u9519\u56e0\u753b\u50cf\u6355\u6349\u5230\u4f60\u7ecf\u5e38\u6df7\u6de1\u8fd9\u4e00\u7ec4\uff0c\u7279\u8bad\u653b\u514b\uff01`
        });
      }
    } catch {}

    const MAX_TIME = 60;
    let globalRemain = 30;
    let roundIndex = 0;
    let totalCoins = 0;
    let score = 0;
    let globalTimer = null;

    const endGame = () => {
      if (globalTimer) { clearInterval(globalTimer); globalTimer = null; }
      soundAndFX.playVictoryFanfare();
      soundAndFX.triggerConfetti(this.container);
      ebbinghausManager.addCoins(totalCoins);
      mainEl.innerHTML = `
        <div class="relative w-full max-w-xl mx-auto h-[480px] bg-gradient-to-b from-slate-950 via-rose-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col items-center justify-center p-8 animate-fade-in text-center select-none">
          <div class="mb-3 animate-bounce-slow flex items-center justify-center">
            ${GAME_ICONS.trophy("w-20 h-20")}
          </div>
          <h2 class="text-3xl font-black text-yellow-300 mb-2">极限生存结束！</h2>
          <p class="text-sm text-gray-200 mb-4 font-bold">
            你一共找出了 <span class="text-2xl text-amber-300 mx-1">${score}</span> 个形近字，火眼金睛等级提升！
          </p>
          <div class="candy-pill px-6 py-2.5 mb-8 text-yellow-300 font-black flex items-center gap-2 border border-amber-400">
            <span class="flex items-center">${GAME_ICONS.coin()}</span>
            <span>获得 ${totalCoins} 凯茜星币</span>
          </div>
          <div class="flex gap-4">
            <button id="btn-spotter-again" class="btn-game-orange text-white font-black px-8 py-3 rounded-full cursor-pointer shadow-lg active:scale-95">\u518d\u73a9\u4e00\u5c40</button>
            <button id="btn-spotter-home" class="btn-game-wood text-white font-black px-8 py-3 rounded-full cursor-pointer shadow-lg active:scale-95">\u8fd4\u56de\u6e38\u4e50\u573a</button>
          </div>
        </div>
      `;
      const againBtn = mainEl.querySelector("#btn-spotter-again");
      if (againBtn) this._on(againBtn, "click", () => this.renderSpotterGame());
      const homeBtn = mainEl.querySelector("#btn-spotter-home");
      if (homeBtn) this._on(homeBtn, "click", () => { soundAndFX.playPop(); this.currentMode = null; this.render(); });
    };

    const drawSpotterRing = (remain) => {
      const ringCanvas = mainEl.querySelector("#spotter-ring");
      const timerTxt = mainEl.querySelector("#spotter-timer-txt");
      if (!ringCanvas || typeof ringCanvas.getContext !== "function") return;
      const ctx = ringCanvas.getContext("2d");
      if (!ctx) return;
      const cx = 22, cy = 22, r = 18;
      ctx.clearRect(0, 0, 44, 44);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 4; ctx.stroke();
      const color = remain <= 5 ? "#f87171" : remain <= 10 ? "#fbbf24" : "#34d399";
      const frac = Math.max(remain, 0) / MAX_TIME;
      ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
      ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.stroke();
      if (timerTxt) { timerTxt.textContent = Math.max(Math.floor(remain), 0); timerTxt.style.color = color; }
    };

    // Global timer
    globalTimer = setInterval(() => {
      globalRemain -= 1;
      drawSpotterRing(globalRemain);
      if (globalRemain <= 0) {
        endGame();
      }
    }, 1000);
    this._addCleanup(() => { if (globalTimer) clearInterval(globalTimer); });

    const renderRound = () => {
      // Loop questions infinitely
      const q = questions[roundIndex % questions.length];

      const cards = shuffle([q.a, q.b]);

      mainEl.innerHTML = `
        <div class="relative w-full max-w-3xl mx-auto flex flex-col items-center select-none animate-fade-in pb-8">
          <div class="w-full flex items-center justify-between mb-3">
            <button id="btn-spotter-back" class="bg-white/10 hover:bg-white/20 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-full border border-white/20 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer shadow">
              <span>\u2190 \u8fd4\u56de\u5927\u5385</span>
            </button>
            <div class="flex items-center gap-4">
              <div class="text-sm font-black text-white bg-black/40 px-4 py-1.5 rounded-full border border-white/20 shadow-inner flex items-center gap-2">
                ${GAME_ICONS.sparkle("w-4 h-4 text-amber-300")}
                得分 <span class="text-lg text-amber-300">${score}</span>
              </div>
              <div class="relative w-11 h-11">
                <canvas id="spotter-ring" width="44" height="44"></canvas>
                <span id="spotter-timer-txt" class="absolute inset-0 flex items-center justify-center text-xs font-black text-yellow-300">${globalRemain}</span>
              </div>
            </div>
          </div>

          <div class="w-full bg-gradient-to-r from-rose-900/90 to-amber-900/90 border-2 border-amber-300/80 rounded-3xl p-5 text-center shadow-xl mb-6">
            <div class="flex items-center justify-center gap-2 mb-1.5">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-5 h-5")}</span>
              <span class="text-xs font-black text-amber-300 tracking-wider">AI 错因画像 · 辨别形近字</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-white">
              请用火眼金睛找出：<span class="text-yellow-300 text-3xl sm:text-4xl px-2 font-serif">【${q.target}】</span> 字！
            </h2>
            <div id="spotter-speed-badge" class="mt-2 text-[10px] text-amber-300/70 font-bold">快速答对可获得额外星币奖励</div>
          </div>

          <div class="grid grid-cols-2 gap-6 sm:gap-10 w-full max-w-lg mb-6">
            ${cards.map((ch) => {
              // P4 B19: 查表 + 多模态编排 → 显示小字标签
              const _charData = CHARACTER_DATABASE.find((c) => c.char === ch);
              const _mm = _charData ? mmForChar(_charData, MM_SCENES.PLAY) : null;
              const _py = escapeHtml(_mm?.modalities?.auditory_pinyin?.data || _charData?.pinyin || "");
              const _rd = escapeHtml(_mm?.modalities?.semantic_radical?.data || _charData?.radical || "");
              const _hint = escapeHtml(_mm?.modalities?.motor_hint_mechanism?.data || _charData?.mechanism || "");
              return `
              <button class="spotter-char-card group relative h-52 sm:h-64 bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 border-4 border-white shadow-[0_12px_36px_rgba(245,158,11,0.5)] hover:shadow-[0_16px_48px_rgba(245,158,11,0.8)] rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 text-white" data-char="${escapeHtml(ch)}">
                <span class="text-8xl sm:text-9xl font-black font-serif drop-shadow-md group-hover:scale-110 transition-transform">${escapeHtml(ch)}</span>
                ${_py ? `<span class="mt-1 text-xs font-black text-amber-950/85 bg-white/70 px-2 py-0.5 rounded-full">${_py}</span>` : ""}
                ${_rd ? `<span class="text-[10px] font-bold text-amber-900/70 bg-white/50 px-1.5 rounded-full">部首 ${_rd}</span>` : ""}
                <span class="absolute bottom-2 text-[10px] font-black text-amber-950 bg-white/85 px-3 py-0.5 rounded-full shadow border border-amber-200 flex items-center gap-1">
                  ${GAME_ICONS.sparkle("w-3 h-3")}
                  <span>选这个字</span>
                </span>
              </button>
              `;
            }).join("")}
          </div>

          <div class="flex items-center gap-3">
            <button id="btn-spotter-hint" class="bg-gradient-to-r from-yellow-300 to-amber-400 hover:from-yellow-200 hover:to-amber-300 text-amber-950 text-xs sm:text-sm font-black px-6 py-2.5 rounded-full border-2 border-white shadow-md active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
              <span>查看辨别秘籍口诀</span>
            </button>
          </div>
          <div id="spotter-hint-box" class="mt-4 max-w-md text-xs sm:text-sm font-bold text-yellow-200 bg-black/60 px-6 py-3 rounded-2xl border-2 border-yellow-400/50 text-center hidden animate-fade-in shadow-xl"></div>
        </div>
      `;

      soundAndFX.speakPriority(`请用火眼金睛找出目标字："${q.target}"！`, { kind: "sentence", priority: 1 });

      const ringCanvas = mainEl.querySelector("#spotter-ring");
      const timerTxt = mainEl.querySelector("#spotter-timer-txt");
      const speedBadge = mainEl.querySelector("#spotter-speed-badge");
      const hintBox = mainEl.querySelector("#spotter-hint-box");
      const roundStartTime = Date.now();

      drawSpotterRing(globalRemain);

      const showHint = () => {
        if (hintBox) {
          hintBox.textContent = `口诀秘籍：${q.diffDesc}，${q.hint}`;
          hintBox.classList.remove("hidden");
        }
      };

      let roundActive = true;

      const backBtn = mainEl.querySelector("#btn-spotter-back");
      if (backBtn) {
        this._on(backBtn, "click", () => {
          if (globalTimer) clearInterval(globalTimer);
          soundAndFX.stopSpeaking();
          soundAndFX.playPop();
          this.currentMode = null;
          this.render();
        });
      }

      const hintBtn = mainEl.querySelector("#btn-spotter-hint");
      if (hintBtn) {
        this._on(hintBtn, "click", () => {
          soundAndFX.playPop();
          showHint();
          soundAndFX.speakPriority(`口诀秘籍：${q.diffDesc}，${q.hint}`, { kind: "sentence", priority: 2 });
        });
      }

      mainEl.querySelectorAll(".spotter-char-card").forEach((btn) => {
        this._on(btn, "click", () => {
          if (!roundActive) return;
          const ch = btn.dataset.char;
          if (ch === q.target) {
            roundActive = false;
            soundAndFX.playSuccessSound();
            soundAndFX.triggerConfetti(this.container);
            btn.classList.add("ring-8", "ring-emerald-400", "scale-110");
            const elapsed = (Date.now() - roundStartTime) / 1000;
            
            // Time bonus
            const timeBonus = elapsed <= 3 ? 3 : elapsed <= 6 ? 2 : 1;
            globalRemain = Math.min(MAX_TIME, globalRemain + timeBonus);
            
            score++;
            totalCoins += timeBonus;
            
            if (speedBadge) {
              speedBadge.textContent = elapsed <= 3 ? `闪电反应！+${timeBonus}秒！` : `答对！+${timeBonus}秒`;
              speedBadge.className = "mt-2 text-sm font-black " + (elapsed <= 3 ? "text-emerald-300" : "text-green-300");
              speedBadge.classList.add("animate-bounce");
            }
            
            this._timeout(() => {
              soundAndFX.speakPriority(`太准啦！这是"${q.target}"字！`, { kind: "sentence", emotion: "excited" });
            }, 250);
            const matchedChar = CHARACTER_DATABASE.find((c) => c.char === q.target);
            if (matchedChar) ebbinghausManager.completeReview(matchedChar.id, true);
            roundIndex++;
            this._timeout(renderRound, 1500);
          } else {
            // Wrong answer penalizes time
            globalRemain = Math.max(0, globalRemain - 3);
            soundAndFX.playSoftError();
            btn.classList.add("animate-shake", "border-red-500", "ring-4", "ring-red-400");
            
            if (speedBadge) {
              speedBadge.textContent = "找错了！时间 -3 秒！";
              speedBadge.className = "mt-2 text-sm font-black text-red-300 animate-shake";
            }
            
            showHint();
            if (hintBox) hintBox.textContent = `小贴士：这是"${ch}"字哦！${q.diffDesc}才是"${q.target}"字！`;
            soundAndFX.speakPriority(`这是"${ch}"字哦！${q.diffDesc}才是"${q.target}"字！`, { kind: "sentence", emotion: "correction" });
            const matchedTarget = CHARACTER_DATABASE.find((c) => c.char === q.target);
            if (matchedTarget) {
              ebbinghausManager.completeReview(matchedTarget.id, false);
              ebbinghausManager.recordMistake(matchedTarget.id, "similar_confuse", {
                targetChar: q.target,
                selectedChar: ch,
              });
            }
            this._timeout(() => btn.classList.remove("animate-shake", "border-red-500", "ring-4", "ring-red-400"), 600);
          }
        });
      });
    };

    renderRound();
  }


  // 古诗飞花令趣味闯关
  // ----------------------------------------------------
export function _renderFeihuaGame(poem) {
    const candidates = poem.targetChars.filter(ch => poem.lines.some(l => l.text.includes(ch)));
    const keyword = candidates[0] || (poem.targetChars[0] || "水");

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col items-center justify-center select-none bg-gradient-to-b from-purple-950 via-indigo-950 to-slate-900 text-white p-6 animate-fade-in">
        <div class="w-full max-w-xl flex flex-col items-center text-center">
          
          <div class="bg-white/10 backdrop-blur-md rounded-3xl border-2 border-purple-300/40 p-8 w-full shadow-2xl">
            <div class="flex items-center justify-center gap-2 mb-3">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-5 h-5")}</span>
              <span class="text-xs font-black bg-purple-500 text-white px-3 py-1 rounded-full">国学经典 · 古诗飞花令</span>
            </div>
            
            <h2 class="text-2xl font-black text-amber-300 mb-2">
              飞花令令题：【<span class="text-yellow-300 text-3xl font-serif">${keyword}</span>】
            </h2>
            <p class="text-xs text-purple-200 mb-6 font-semibold">
              请在《${poem.title}》中点击找出带有【${keyword}】字的绝美诗句！
            </p>

            <div class="flex flex-col gap-3">
              ${poem.lines.map((l) => `
                <button class="feihua-line-btn text-left p-4 rounded-2xl bg-white/10 hover:bg-purple-500/30 border-2 border-white/20 text-white font-black text-sm sm:text-base shadow active:scale-95 transition-all flex items-center justify-between cursor-pointer" data-text="${l.text}">
                  <span>${l.text}</span>
                  <span class="text-xs text-amber-300 opacity-60">点击选句 →</span>
                </button>
              `).join("")}
            </div>

            <div class="mt-6 flex justify-center">
              <button id="btn-feihua-back" class="bg-white/20 hover:bg-white/30 text-white text-xs font-black px-6 py-2.5 rounded-full border border-white/30 cursor-pointer active:scale-95">
                返回诗卷
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    soundAndFX.speakPriority(`古诗飞花令开始！请在诗中找出包含“${keyword}”字的诗句！`, { kind: "sentence", priority: 1 });

    const backBtn = this.container.querySelector("#btn-feihua-back");
    if (backBtn) {
      this._on(backBtn, "click", () => {
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        this.renderPoemReader(poem);
      });
    }

    this.container.querySelectorAll(".feihua-line-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        const text = btn.dataset.text;
        if (text.includes(keyword)) {
          soundAndFX.playVictoryFanfare();
          soundAndFX.triggerConfetti(this.container);
          ebbinghausManager.addCoins(15);
          btn.classList.add("bg-emerald-500/60", "border-emerald-300", "scale-105");
          showGameToast(this.container, `飞花令成功！获得 +15 凯茜星币！`, "success");
          this._timeout(() => {
            soundAndFX.speakPriority(`太棒啦！“${text}”里面就有“${keyword}”字！飞花令通关，奖励 15 星币！`, { kind: "sentence", emotion: "excited" });
          }, 250);
          this._timeout(() => {
            soundAndFX.stopSpeaking();
            this.renderPoemReader(poem);
          }, 3200);
        } else {
          soundAndFX.playSoftError();
          btn.classList.add("animate-shake", "border-red-400");
          this._timeout(() => {
            soundAndFX.speakPriority(`这句诗里面没有“${keyword}”字哦，再仔细找找看！`, { kind: "sentence", emotion: "correction" });
          }, 180);
          this._timeout(() => btn.classList.remove("animate-shake", "border-red-400"), 600);
        }
      });
    });
  }
