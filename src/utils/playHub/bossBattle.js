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

export function renderBossBattle() {
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

          <main class="relative z-10 flex-1 flex flex-col items-center justify-center p-4 text-center">
            
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

            <div class="w-full max-w-md bg-black/60 h-5 rounded-full overflow-hidden border-2 border-rose-400 mb-4 p-0.5">
              <div id="boss-hp-bar" class="bg-gradient-to-r from-red-600 via-rose-500 to-yellow-400 h-full rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]" style="width: ${bossHp}%"></div>
            </div>

            <div id="boss-avatar" class="relative w-32 h-32 rounded-full bg-slate-900 border-4 border-white shadow-[0_0_60px_rgba(244,63,94,0.8)] flex items-center justify-center mb-4 animate-bounce-slow transition-all">
              <img src="assets/images/boss_nian_beast.webp" alt="难字年兽" class="w-full h-full rounded-full object-cover pointer-events-none"/>
              <div id="boss-lv" class="absolute -top-3 bg-red-600 text-white font-black text-[10px] px-3 py-0.5 rounded-full border border-white z-10 shadow">
                难字首领 Lv.9
              </div>
            </div>

            <h2 class="text-lg font-black text-yellow-300 mb-1">
              首领怒吼：“谁能认出‘${curChar.char}’（${curChar.pinyin}）字？！”
            </h2>
            <p class="text-xs text-gray-300 mb-4 font-semibold">
              <span id="boss-tip-text">点击下方正确的法术水晶字符，释放激光暴击首领！</span>
            </p>

            <div id="spell-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
              ${options
                .map(
                  (opt) => `
                <button class="boss-spell-btn h-20 rounded-3xl btn-game-orange text-white font-black text-4xl shadow-2xl active:scale-90 transition-all flex items-center justify-center touch-target" data-char="${opt}" data-speak="选择${opt}" aria-label="选择${opt}">
                  ${opt}
                </button>
              `
                )
                .join("")}
            </div>

          </main>

          <div id="boss-win-modal" class="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-white hidden animate-scale-up z-50">
            <div class="mb-4 flex items-center justify-center">${GAME_ICONS.trophy("w-24 h-24")}</div>
            <h2 class="text-3xl font-black text-yellow-300 mb-2">首领已彻底歼灭！</h2>
            <p class="text-xs text-gray-300 mb-4 font-semibold">你成功攻克了难字堡垒，守护了汉字王国的安宁！</p>
            <div class="candy-pill rounded-full px-5 py-2 mb-2 text-xs text-yellow-300 font-bold flex items-center gap-2">
              <span class="flex items-center">${GAME_ICONS.coin("w-5 h-5")}</span>
              <span id="boss-win-reward">获得 20 凯茜星币 + 难字封印勋章</span>
            </div>
            <div id="boss-win-stats" class="text-xs text-gray-400 mb-6 font-semibold"></div>
            <button id="btn-boss-claim" class="btn-game-orange text-white font-black text-base px-10 py-3 rounded-full" data-speak="领取奖励并返回游乐场" aria-label="领取奖励并返回游乐场">
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
          soundAndFX.stopSpeaking();
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
      this._addCleanup(() => { if (stopTimer) stopTimer(); });
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
          if (tipText) tipText.textContent = `超时！Boss 反扑咬回 8% 血量…`;
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
            soundAndFX.triggerConfetti(this.container);

            // ===== 艾宾浩斯复习闭环：答对 → 复习成功 =====
            roundCorrect++;
            maxStreak = Math.max(maxStreak, roundCorrect);
            ebbinghausManager.completeReview(curChar.id, true);

            // ===== 随机暴击：伤害 35/45/55（连击加成暴击率）=====
            const roll = Math.random();
            const baseDmg = roll < 0.3 ? 55 : roll < 0.65 ? 45 : 35;
            // 连击 ≥3 时保底高伤
            const finalDmg = roundCorrect >= 3 ? Math.max(baseDmg, 45) : baseDmg;
            const isCritical = finalDmg >= 55;
            const isBig = finalDmg >= 45;

            if (bossAvatar) {
              const shakeClass = isCritical ? "scale-50" : "scale-75";
              bossAvatar.classList.add("animate-shake", shakeClass, "opacity-80");
              setTimeout(() => bossAvatar.classList.remove("animate-shake", shakeClass, "opacity-80"), 450);
            }

            // 暴击屏幕闪光
            if (isCritical) {
              const flash = document.createElement("div");
              flash.className = "combo-screen-flash";
              flash.style.boxShadow = "inset 0 0 80px rgba(251,113,133,.7)";
              flash.style.animation = "flashFade .5s ease-out forwards";
              document.body.appendChild(flash);
              setTimeout(() => flash.remove(), 600);
            }

            bossHp = Math.max(0, bossHp - finalDmg);
            if (bossBar) bossBar.style.width = `${bossHp}%`;

            // 飘字：暴击伤害 + 连击
            if (isCritical) {
              spawnFloatingText(arena, `CRITICAL -${finalDmg}!!!`, "dmg", { color: "#fbbf24", top: 45, size: 44 });
            } else {
              spawnFloatingText(arena, `-${finalDmg}${isBig ? " 暴击" : ""}`, "dmg", { color: isBig ? "#f97316" : "#fb7185", top: 45, size: isBig ? 36 : 28 });
            }
            if (roundCorrect >= 2) {
              const streakColor = roundCorrect >= 6 ? "#ec4899" : roundCorrect >= 4 ? "#f97316" : "#fbbf24";
              spawnFloatingText(arena, `连击 x${roundCorrect}${roundCorrect >= 6 ? " MAX!" : ""}`, "combo", { color: streakColor, top: 30, size: roundCorrect >= 5 ? 26 : 22 });
            }

            applyRage();

            if (bossDead()) {
              soundAndFX.stopSpeaking();
              this._timeout(() => {
                soundAndFX.playVictoryFanfare();
                soundAndFX.triggerCoinFly(this.container);
              }, 250);
              // 奖励：基础 20 币 + 最高连击加成（最多 +12）
              const bonus = Math.min(maxStreak * 3, 12);
              ebbinghausManager.addCoins(20 + bonus);
              ebbinghausManager.bumpGameStat("bossWins");
              ebbinghausManager.markTodayActive();
              const rewardEl = this.container.querySelector("#boss-win-reward");
              const statsEl = this.container.querySelector("#boss-win-stats");
              if (rewardEl) rewardEl.textContent = `获得 ${20 + bonus} 凯茜星币 + 难字封印勋章`;
              if (statsEl) statsEl.innerHTML = `最高连击 <b class="text-yellow-300">x${maxStreak}</b> · 每字掌握度 +10`;
              this._timeout(() => {
                if (winModal) winModal.classList.remove("hidden");
              }, 800);
            } else {
              soundAndFX.speakPriority(curChar.char, { kind: "char", priority: 1 });
              targetIndex++;
              this._timeout(() => { answered = false; renderRound(); }, 800);
            }
          } else {
            soundAndFX.playSoftError();
            this._timeout(() => {
              soundAndFX.speakPriority(`这是“${selected}”字，请释放“${curChar.char}”法术！`, { kind: "sentence", emotion: "correction" });
            }, 180);
            btn.classList.add("animate-shake");
            // ===== 艾宾浩斯闭环：答错 → 标记难字 + 形近混淆画像，Boss 回血 =====
            roundCorrect = 0;
            ebbinghausManager.completeReview(curChar.id, false);
            try {
              ebbinghausManager.recordMistake(curChar.id, "similar_confuse", {
                targetChar: curChar.char,
                selectedChar: selected,
              });
            } catch {}
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
          soundAndFX.stopSpeaking();
          soundAndFX.playPop();
          this.currentMode = null;
          this.render();
        });
      }
    };

    renderRound();
  }

