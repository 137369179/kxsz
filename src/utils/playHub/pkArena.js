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

export function renderPkArena() {
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

      const p1Label = isFamilyMode ? "宝贝" : "红队";
      const p2Label = isFamilyMode ? "家长" : "蓝队";

      this.container.innerHTML = `
        <div id="pk-arena" class="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white">
          
          <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/20 flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <button id="btn-pk-back" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer">
                <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
                <span>退出竞技</span>
              </button>
              <button id="btn-pk-toggle-mode" class="px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${isFamilyMode ? "bg-amber-400 text-amber-950 font-black shadow-lg" : "bg-white/20 text-white"}">
                ${isFamilyMode ? "亲子让步模式 (开启)" : "极速对决模式"}
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

          <div id="pk-win-modal" class="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-white hidden animate-scale-up z-50 p-6 text-center">
            <div class="mb-4 flex items-center justify-center">${GAME_ICONS.trophy("w-24 h-24")}</div>
            <h2 class="text-3xl font-black text-yellow-300 mb-2">${isFamilyMode ? "最佳亲子默契拍档！" : "对决大获全胜！"}</h2>
            <p class="text-xs text-gray-300 mb-2 font-semibold">最终比分：${p1Label} ${p1Score} - ${p2Label} ${p2Score}</p>
            <div id="pk-win-crown" class="text-sm font-black text-yellow-300 mb-4"></div>
            <div id="pk-win-reward" class="candy-pill rounded-full px-5 py-2 mb-6 text-xs text-yellow-300 font-bold flex items-center gap-2">
              ${GAME_ICONS.coin("w-5 h-5")}<span>获得星币奖励</span>
            </div>
            <div class="flex gap-4">
              <button id="btn-pk-again" class="btn-game-orange text-white font-black text-base px-8 py-3 rounded-full cursor-pointer shadow-lg active:scale-95">
                再战一局
              </button>
              <button id="btn-pk-claim" class="btn-game-wood text-white font-black text-base px-8 py-3 rounded-full cursor-pointer shadow-lg active:scale-95">
                领取星币返回
              </button>
            </div>
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
      const againBtn = this.container.querySelector("#btn-pk-again");
      const arena = this.container.querySelector("#pk-arena");
      const timerEl = this.container.querySelector("#pk-timer");
      const timerValEl = this.container.querySelector("#pk-timer-val");

      let answered = false;

      // ===== 抢答倒计时：亲子模式 7s / 极速模式 5s =====
      if (stopTimer) stopTimer();
      this._addCleanup(() => { if (stopTimer) stopTimer(); });
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
          spawnFloatingText(arena, `超时！${p2Label} 夺 5 分`, "pk-timeout", { color: "#22d3ee", top: 34, size: 22 });
          const c = CHARACTER_DATABASE.find((x) => x.char === r.char);
          if (c) ebbinghausManager.completeReview(c.id, false);
          this._timeout(() => { answered = false; nextRound(); }, 900);
        });
      };
      startRoundTimer();

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
              ? "亲子默契大圆满！全家一起识字棒棒哒！"
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

      if (againBtn) {
        this._on(againBtn, "click", () => {
          if (stopTimer) stopTimer();
          soundAndFX.playPop();
          this.renderPkArena();
        });
      }

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

