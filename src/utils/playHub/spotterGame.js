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
import { triggerHapticSuccess, triggerHapticWarning } from "../haptics.js";

export function renderSpotterGame() {
    const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
      activeMode: "play",
      heading: "火眼金睛辨异同"
    });
    this._addCleanup(destroyShell);

    const CONFUSED_PAIRS_BANK = [
      { a: "大", b: "太", target: "太", diffDesc: "\"太\"字底下多了一点", hint: "像一颗闪亮的小扣子！" },
      { a: "日", b: "目", target: "目", diffDesc: "\"目\"字中间有两横", hint: "就像两只大眼睛看世界！" },
      { a: "木", b: "禾", target: "禾", diffDesc: "\"禾\"字头顶多了一撇", hint: "就像沉甸甸金黄的小麦穗！" },
      { a: "人", b: "入", target: "人", diffDesc: "\"人\"字撇在捺上头", hint: "一撇一捺站得直，顶天立地！" },
      { a: "刀", b: "力", target: "力", diffDesc: "\"力\"字一撇出了头", hint: "有力量有冲劲，冲出头来！" },
      { a: "土", b: "士", target: "土", diffDesc: "\"土\"字上横短下横长", hint: "泥土在大地稳稳托住万物！" },
      { a: "牛", b: "午", target: "牛", diffDesc: "\"牛\"字一竖伸出头", hint: "就像可爱小牛长出犄角！" },
      { a: "白", b: "百", target: "百", diffDesc: "\"百\"字头上多了一横", hint: "数字一百圆溜溜，头戴一顶平平帽！" },
      { a: "贝", b: "见", target: "见", diffDesc: "\"见\"字底下是竖弯钩", hint: "睁大眼睛看世界，小脚欢快向前跑！" },
      { a: "门", b: "问", target: "问", diffDesc: "\"问\"字肚里藏个口", hint: "敲开大门张开口，不懂就要多请教！" },
      { a: "夫", b: "天", target: "天", diffDesc: "\"天\"字一横在头顶", hint: "蓝天白云在头顶，宽广无边望不到头！" },
      { a: "鸟", b: "乌", target: "鸟", diffDesc: "\"鸟\"字眼睛亮闪闪", hint: "小鸟眼里有神采，展翅高飞上云端！" },
      { a: "兔", b: "免", target: "兔", diffDesc: "\"兔\"字右下多一点", hint: "就像小兔子毛茸茸的短尾巴！" },
      { a: "王", b: "玉", target: "玉", diffDesc: "\"玉\"字右下有一点", hint: "国王腰间配美玉，温润光芒闪闪亮！" },
      { a: "晴", b: "睛", target: "晴", diffDesc: "\"晴\"字左边是日字旁", hint: "太阳出来天空晴，眼睛明亮看分明！" }
    ];

    let questions = shuffle([...CONFUSED_PAIRS_BANK]);
    try {
      const ep = ebbinghausManager.progress.errorProfiles?.confusedPairs;
      if (ep && typeof ep === "object") {
        for (const [target, map] of Object.entries(ep)) {
          for (const [confused, count] of Object.entries(map)) {
            if (count > 0 && target !== confused) {
              questions.unshift({
                a: target,
                b: confused,
                target,
                diffDesc: `"${target}"与"${confused}"仔细辨别`,
                hint: `AI 错因画像捕捉到你经常混淆这一组（错误 ${count} 次），特训攻克！`
              });
            }
          }
        }
      }
    } catch {}

    const MAX_TIME = 60;
    let globalRemain = 30;
    if (this.isExpeditionActive && this.expeditionState) {
      if (this.expeditionState.buffs.some(b => b.id === "TIME_WARP")) {
        globalRemain += 15;
      }
    }
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
            ${this.isExpeditionActive ? '' : '<button id="btn-spotter-again" class="btn-game-orange text-white font-black px-8 py-3 rounded-full cursor-pointer shadow-lg active:scale-95" data-speak="再玩一局">再玩一局</button>'}
            <button id="btn-spotter-home" class="btn-game-wood text-white font-black px-8 py-3 rounded-full cursor-pointer shadow-lg active:scale-95">${this.isExpeditionActive ? '继续探险 →' : '返回游乐场'}</button>
          </div>
        </div>
      `;
      const againBtn = mainEl.querySelector("#btn-spotter-again");
      if (againBtn) this._on(againBtn, "click", () => this.renderSpotterGame());
      const homeBtn = mainEl.querySelector("#btn-spotter-home");
      if (homeBtn) this._on(homeBtn, "click", () => { 
        soundAndFX.playPop(); 
        if (this.isExpeditionActive) {
          this.expeditionState.stage++;
          this.currentMode = "expedition";
          this.render();
        } else {
          this.currentMode = null; 
          this.render(); 
        }
      });
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
            <button id="btn-spotter-back" class="bg-white/10 hover:bg-white/20 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-full border border-white/20 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer shadow" data-speak="返回游乐场">
              <span>← 返回大厅</span>
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
            <button id="btn-spotter-hint" class="bg-gradient-to-r from-yellow-300 to-amber-400 hover:from-yellow-200 hover:to-amber-300 text-amber-950 text-xs sm:text-sm font-black px-6 py-2.5 rounded-full border-2 border-white shadow-md active:scale-95 transition-transform flex items-center gap-2 cursor-pointer" data-speak="给我提示">
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
          hintBox.innerHTML = `
            <div class="flex items-center justify-center gap-2 text-yellow-300 font-black text-xs sm:text-sm">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
              <span>仔细看：${escapeHtml(q.diffDesc)}，${escapeHtml(q.hint)}</span>
            </div>
          `;
          hintBox.classList.remove("hidden");
        }

        // 金色放大镜高光：为含有目标特征的卡片增加脉冲聚光灯动效
        mainEl.querySelectorAll(".spotter-char-card").forEach((btn) => {
          if (btn.dataset.char === q.target) {
            btn.classList.add("ring-4", "ring-yellow-300", "animate-pulse");
            this._timeout(() => btn.classList.remove("animate-pulse"), 2000);
          }
        });
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
          soundAndFX.speakPriority(`看这里：${q.diffDesc}，${q.hint}`, { kind: "sentence", priority: 2 });
        });
      }

      mainEl.querySelectorAll(".spotter-char-card").forEach((btn) => {
        this._on(btn, "click", () => {
          if (!roundActive) return;
          const ch = btn.dataset.char;
          if (ch === q.target) {
            roundActive = false;
            triggerHapticSuccess();
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
            triggerHapticWarning();
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
              <button id="btn-feihua-back" class="bg-white/20 hover:bg-white/30 text-white text-xs font-black px-6 py-2.5 rounded-full border border-white/30 cursor-pointer active:scale-95" data-speak="返回">
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
