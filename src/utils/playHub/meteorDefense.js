/** PlayModule mode — Meteor Defense */
import { CHARACTER_DATABASE } from "../../data/characters.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { soundAndFX } from "../soundEngine.js";
import { mountGameShell, showGameToast } from "../../components/SharedShell.js";
import { escapeHtml } from "../BaseModule.js";
import { GAME_ICONS } from "../gameIcons.js";
import { pickReviewChars, shuffle } from "./playHelpers.js";
import { triggerHapticSuccess, triggerHapticWarning } from "../haptics.js";

export function renderMeteorDefense() {
  const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
    activeMode: "play",
    heading: "陨石防御战"
  });
  this._addCleanup(destroyShell);

  const styleEl = document.createElement("style");
  styleEl.innerHTML = `
    @keyframes meteor-fall {
      0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
      10% { opacity: 1; transform: translateY(0px) rotate(-5deg); }
      50% { transform: translateY(200px) rotate(10deg); }
      100% { transform: translateY(400px) rotate(-10deg); opacity: 1; }
    }
    @keyframes screen-shake {
      0%, 100% { transform: translate(0, 0); }
      10% { transform: translate(-10px, -5px) rotate(-2deg); }
      30% { transform: translate(10px, 5px) rotate(2deg); }
      50% { transform: translate(-10px, -5px) rotate(-2deg); }
      70% { transform: translate(10px, 5px) rotate(2deg); }
      90% { transform: translate(-5px, -2px) rotate(0deg); }
    }
    .animate-screen-shake {
      animation: screen-shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
    }
    @keyframes combo-pop {
      0% { transform: scale(0.3) rotate(-15deg); opacity: 0; filter: hue-rotate(0deg); }
      40% { transform: scale(1.3) rotate(5deg); opacity: 1; }
      60% { transform: scale(0.9) rotate(-2deg); filter: hue-rotate(90deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; filter: hue-rotate(0deg); }
    }
    .animate-combo-pop {
      animation: combo-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    @keyframes red-flash {
      0% { background-color: transparent; }
      50% { background-color: rgba(239, 68, 68, 0.3); }
      100% { background-color: transparent; }
    }
    .animate-red-flash::after {
      content: '';
      position: absolute;
      inset: 0;
      animation: red-flash 0.4s ease-out forwards;
      pointer-events: none;
      z-index: 50;
    }
  `;
  document.head.appendChild(styleEl);
  this._addCleanup(() => styleEl.remove());

  // Prepare questions (10 rounds)
  const TOTAL_ROUNDS = 10;
  let questions = [];
  try {
    const chars = pickReviewChars(TOTAL_ROUNDS, true);
    questions = chars.map(ch => {
      // 智能干扰项演进：优先形近易混字，次选同音/同声母韵母字，兜底字库字
      const candidatePool = [];
      if (Array.isArray(ch.confusingChars) && ch.confusingChars.length > 0) {
        candidatePool.push(...ch.confusingChars.filter(x => x !== ch.char));
      }
      if (candidatePool.length < 2 && ch.pinyin) {
        const samePinyinChars = CHARACTER_DATABASE
          .filter(c => c.pinyin === ch.pinyin && c.char !== ch.char)
          .map(c => c.char);
        candidatePool.push(...samePinyinChars);
      }
      if (candidatePool.length < 2) {
        const fallbackDistractors = CHARACTER_DATABASE
          .filter(c => c.char !== ch.char && !candidatePool.includes(c.char))
          .sort(() => 0.5 - Math.random())
          .slice(0, 2 - candidatePool.length)
          .map(c => c.char);
        candidatePool.push(...fallbackDistractors);
      }
      const distractors = shuffle([...new Set(candidatePool)]).slice(0, 2);
      return {
        target: ch,
        options: shuffle([ch.char, ...distractors])
      };
    });
  } catch (e) {
    console.error(e);
  }

  // Fallback
  if (questions.length === 0) {
    const fallbackChars = CHARACTER_DATABASE.slice(0, TOTAL_ROUNDS);
    questions = fallbackChars.map(ch => ({
      target: ch,
      options: shuffle([ch.char, "火", "木"].filter(x => x !== ch.char).slice(0, 2).concat(ch.char))
    }));
  }

  let roundIndex = 0;
  let totalCoins = 0;
  let combo = 0;
  let currentTimer = null;
  const FALL_TIME_MS = 6000; // 6 seconds to fall

  const renderRound = () => {
    if (currentTimer) {
      clearTimeout(currentTimer);
      currentTimer = null;
    }

    if (roundIndex >= questions.length) {
      soundAndFX.stopSpeaking();
      soundAndFX.playVictoryFanfare();
      soundAndFX.triggerConfetti(this.container);
      ebbinghausManager.addCoins(totalCoins);
      mainEl.innerHTML = `
        <div class="relative w-full max-w-xl mx-auto h-[480px] bg-gradient-to-b from-indigo-950 via-slate-900 to-black rounded-3xl overflow-hidden shadow-2xl border-4 border-cyan-400 flex flex-col items-center justify-center p-8 animate-fade-in text-center select-none">
          <div class="mb-3 animate-bounce-slow flex items-center justify-center text-cyan-300">
            ${GAME_ICONS.rocket ? GAME_ICONS.rocket("w-20 h-20") : (GAME_ICONS.sparkle ? GAME_ICONS.sparkle("w-20 h-20") : "")}
          </div>
          <h2 class="text-3xl font-black text-cyan-300 mb-2">星球守卫者！大获全胜！</h2>
          <p class="text-sm text-gray-200 mb-4 font-bold">
            你成功击碎了所有带有生字陨石，保卫了凯茜的拼音岛！
          </p>
          <div class="candy-pill px-6 py-2.5 mb-8 text-yellow-300 font-black flex items-center gap-2 border border-amber-400">
            <span class="flex items-center">${GAME_ICONS.coin ? GAME_ICONS.coin() : ""}</span>
            <span>获得 ${totalCoins} 凯茜星币</span>
          </div>
          <div class="flex gap-4">
            ${this.isExpeditionActive ? '' : '<button id="btn-meteor-again" class="btn-game-cyan text-white font-black px-8 py-3 rounded-full cursor-pointer shadow-lg active:scale-95">再玩一局</button>'}
            <button id="btn-meteor-home" class="bg-white/10 hover:bg-white/20 text-white font-black px-8 py-3 rounded-full cursor-pointer shadow-lg active:scale-95 border border-white/20">${this.isExpeditionActive ? '继续探险 \u2192' : '返回大厅'}</button>
          </div>
        </div>
      `;
      const againBtn = mainEl.querySelector("#btn-meteor-again");
      if (againBtn) this._on(againBtn, "click", () => { soundAndFX.stopSpeaking(); soundAndFX.playPop(); this.renderMeteorDefense(); });
      const homeBtn = mainEl.querySelector("#btn-meteor-home");
      if (homeBtn) this._on(homeBtn, "click", () => { 
        soundAndFX.stopSpeaking(); 
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
      return;
    }

    const q = questions[roundIndex];
    const targetChar = q.target;
    const progressPct = Math.round((roundIndex / questions.length) * 100);

    // Speed up slightly as rounds progress
    let currentFallTime = Math.max(3000, FALL_TIME_MS - roundIndex * 300);
    if (this.isExpeditionActive && this.expeditionState && this.expeditionState.buffs.some(b => b.id === "SLOW_MOTION")) {
      currentFallTime *= 1.5; // Meteor falls 50% slower
    }

    mainEl.innerHTML = `
      <div class="relative w-full max-w-3xl mx-auto flex flex-col items-center select-none animate-fade-in h-[500px] bg-[url('assets/images/pinyin_pair_yue.webp')] bg-cover bg-center rounded-3xl overflow-hidden border-4 border-cyan-900/50 shadow-2xl">
        <div class="absolute inset-0 bg-black/40"></div>
        
        <!-- Header -->
        <div class="relative z-10 w-full flex items-center justify-between p-4">
          <button id="btn-meteor-back" class="bg-black/50 hover:bg-black/70 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-full border border-white/20 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer shadow">
            <span>← 返回大厅</span>
          </button>
          <div class="flex items-center gap-3 bg-black/50 px-4 py-1.5 rounded-full border border-white/20">
            <div class="text-xs sm:text-sm font-black text-cyan-300">
              波次 ${roundIndex + 1}/${questions.length}
            </div>
            <div class="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
              <div class="h-full bg-cyan-400" style="width:${progressPct}%"></div>
            </div>
          </div>
        </div>

        <!-- HUD (Bottom) -->
        <div class="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center pointer-events-none">
          <div class="bg-cyan-950/80 backdrop-blur-sm border-2 border-cyan-400/50 rounded-2xl px-8 py-4 text-center shadow-[0_0_15px_rgba(34,211,238,0.3)] pointer-events-auto relative">
            <p class="text-cyan-100 text-xs font-bold mb-1 tracking-wider">拦截目标</p>
            <h2 class="text-4xl font-black text-white tracking-widest drop-shadow-md">
              ${escapeHtml(targetChar.pinyin)}
            </h2>
            <button id="btn-meteor-replay-audio" class="mt-2 bg-white/10 hover:bg-white/20 text-cyan-200 text-xs px-3 py-1 rounded-full border border-cyan-500/30 active:scale-95 flex items-center gap-1 mx-auto cursor-pointer transition-colors duration-200">
              ${GAME_ICONS.speaker("w-3 h-3")} 听音
            </button>
            ${combo >= 2 ? `<div class="absolute -top-12 -right-10 text-amber-300 font-black text-3xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] animate-combo-pop z-30 tracking-wider flex items-center gap-1"><span class="text-xl text-amber-100">x</span>${combo} <span class="text-base text-orange-200 uppercase tracking-tighter">Combo!</span></div>` : ''}
          </div>
        </div>

        <!-- Meteors Area -->
        <div id="meteor-area" class="absolute top-16 left-0 right-0 bottom-32 z-10">
          ${q.options.map((opt, i) => {
            const leftPos = 20 + i * 30; // 20%, 50%, 80%
            return `
              <button class="meteor-btn absolute w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500 to-red-700 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.8)] border-2 border-orange-300 flex items-center justify-center cursor-pointer active:scale-90 transition-transform animate-meteor-fall group" 
                style="left: ${leftPos}%; transform: translateX(-50%); animation-duration: ${currentFallTime}ms;" 
                data-char="${escapeHtml(opt)}">
                <div class="absolute -top-8 -left-4 w-12 h-16 bg-gradient-to-t from-orange-400 to-transparent opacity-60 transform -rotate-45 blur-sm rounded-full"></div>
                <span class="relative z-10 text-3xl sm:text-4xl font-black text-white drop-shadow-lg group-hover:scale-110 transition-transform">${escapeHtml(opt)}</span>
              </button>
            `;
          }).join("")}
        </div>
      </div>
    `;

    const playTargetAudio = () => {
      soundAndFX.speakPriority(targetChar.char, { kind: "char", priority: 1 });
    };

    playTargetAudio();

    const replayBtn = mainEl.querySelector("#btn-meteor-replay-audio");
    if (replayBtn) this._on(replayBtn, "click", playTargetAudio);

    const backBtn = mainEl.querySelector("#btn-meteor-back");
    if (backBtn) {
      this._on(backBtn, "click", () => {
        if (currentTimer) clearTimeout(currentTimer);
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        this.currentMode = null;
        this.render();
      });
    }

    let isRoundOver = false;

    const meteors = mainEl.querySelectorAll(".meteor-btn");
    meteors.forEach(btn => {
      this._on(btn, "click", () => {
        if (isRoundOver) return;
        const char = btn.dataset.char;
        
        if (char === targetChar.char) {
          isRoundOver = true;
          if (currentTimer) clearTimeout(currentTimer);
          
          combo++; // Increment combo
          
          // Stop animation, add explosion
          btn.style.animationPlayState = 'paused';
          btn.innerHTML = (window.GAME_ICONS || GAME_ICONS)?.sparkle
            ? (window.GAME_ICONS || GAME_ICONS).sparkle("w-12 h-12 text-yellow-300")
            : `<span class="text-2xl font-black text-amber-300">破!</span>`;
          btn.classList.add("scale-125", "opacity-0", "transition-all", "duration-500");
          
          soundAndFX.playSuccessSound();
          triggerHapticSuccess();
          ebbinghausManager.completeReview(targetChar.id, true);
          
          // Bonus coins for high combo
          const bonus = Math.floor(combo / 3);
          totalCoins += (2 + bonus);
          
          this._timeout(() => {
            soundAndFX.speakPriority("太棒了！", { kind: "sentence", emotion: "excited" });
            roundIndex++;
            renderRound();
          }, 800);
          
        } else {
          // Wrong meteor
          combo = 0; // Reset combo
          soundAndFX.playSoftError();
          triggerHapticWarning();
          btn.classList.add("animate-shake", "border-gray-500", "opacity-50");
          ebbinghausManager.completeReview(targetChar.id, false);
          
          // Screen shake & red flash on failure
          const container = mainEl.querySelector(".w-full.max-w-3xl");
          if (container) {
            container.classList.add("animate-screen-shake", "animate-red-flash");
            this._timeout(() => container.classList.remove("animate-screen-shake", "animate-red-flash"), 400);
          }
          
          this._timeout(() => btn.classList.remove("animate-shake"), 500);
        }
      });
    });

    // Handle timeout (meteors hit the ground)
    currentTimer = setTimeout(() => {
      if (isRoundOver) return;
      isRoundOver = true;
      combo = 0; // Reset combo on timeout
      
      soundAndFX.playSoftError();
      triggerHapticWarning();
      this._timeout(() => {
        soundAndFX.speakPriority(`哎呀，是 ${targetChar.char} 字！`, { kind: "sentence", emotion: "correction" });
      }, 180);
      ebbinghausManager.completeReview(targetChar.id, false);
      
      // Screen shake & red flash on meteor hitting ground
      const container = mainEl.querySelector(".w-full.max-w-3xl");
      if (container) {
        container.classList.add("animate-screen-shake", "animate-red-flash");
      }
      
      meteors.forEach(b => {
        b.style.animationPlayState = 'paused';
        if (b.dataset.char === targetChar.char) {
          b.classList.add("ring-4", "ring-cyan-300", "scale-110");
        } else {
          b.classList.add("opacity-30");
        }
      });
      
      this._timeout(() => {
        roundIndex++;
        renderRound();
      }, 1500);
    }, currentFallTime);

  };

  renderRound();
}
