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

export function renderMatchGame() {
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
          <div class="mb-4 flex items-center justify-center">${GAME_ICONS.reviewBell("w-16 h-16")}</div>
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
      // 阶段性连击特效
      comboEl.classList.remove("combo-x3", "combo-x5", "combo-x7");
      if (combo >= 7) comboEl.classList.add("combo-x7");
      else if (combo >= 5) comboEl.classList.add("combo-x5");
      else if (combo >= 3) comboEl.classList.add("combo-x3");
      // 屏幕边缘闪光
      if (combo >= 3) {
        const flashLevel = combo >= 7 ? "c7" : combo >= 5 ? "c5" : "c3";
        const flash = document.createElement("div");
        flash.className = `combo-screen-flash ${flashLevel}`;
        flash.style.animation = "flashFade .6s ease-out forwards";
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 700);
      }
    };
    if (stopTimer) stopTimer();
    this._addCleanup(() => { if (stopTimer) stopTimer(); });
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
            // 连击飘字颜色与大小随等级提升
            const comboColor = combo >= 7 ? "#ec4899" : combo >= 5 ? "#f97316" : combo >= 3 ? "#fbbf24" : "#34d399";
            const comboSize = combo >= 7 ? 28 : combo >= 5 ? 25 : combo >= 3 ? 23 : 20;
            const comboLabel = combo >= 2 ? ` Combo x${combo}${combo >= 7 ? " MAX!" : combo >= 5 ? " HOT!" : ""}` : "";
            spawnFloatingText(arena, `配对成功${comboLabel}`, "match-ok", { color: comboColor, top: 32, size: comboSize });

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
                ebbinghausManager.bumpGameStat("matchClears");
                const rewardEl = this.container.querySelector("#match-win-reward");
                if (rewardEl) rewardEl.innerHTML = `${GAME_ICONS.coin("w-5 h-5")}<span>获得 ${10 + bonus} 凯茜星币 (连击 x${maxCombo} + 剩余时间奖励)</span>`;
                if (winModal) winModal.classList.remove("hidden");
              }
            }, 500);
          } else {
            // 配对失败 → 连击清零 + 字音复习失败写回
            soundAndFX.playSoftError();
            mistakes++;
            combo = 0;
            updateComboUI();
            const keys = [...new Set([b1.dataset.match, b2.dataset.match].filter(Boolean))];
            keys.forEach((key) => {
              const rec = CHARACTER_DATABASE.find((x) => x.char === key);
              if (!rec) return;
              ebbinghausManager.completeReview(rec.id, false);
              try {
                ebbinghausManager.recordMistake(rec.id, "pronunciation");
              } catch {}
            });
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

