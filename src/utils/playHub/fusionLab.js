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

export function renderFusionLab() {
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

          <main class="relative z-10 flex-1 flex flex-col items-center justify-center p-4 text-center">
            
            <div class="mb-4 bg-purple-900/60 px-6 py-2 rounded-full border-2 border-purple-400/50 shadow-2xl flex items-center gap-3">
              <span class="text-xs font-bold text-purple-200">目标合成字：</span>
              <span class="text-3xl font-black text-yellow-300 font-serif">${escapeHtml(cur.target)}</span>
              <span class="text-xs font-bold text-purple-300">(${escapeHtml(cur.pinyin)})</span>
            </div>

            <div class="relative w-48 h-48 sm:w-56 sm:h-56 mb-4 flex flex-col items-center justify-center">
              <div id="cauldron-glow" class="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/40 via-fuchsia-500/40 to-cyan-500/40 blur-2xl animate-pulse"></div>
              
              <div class="relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-b from-purple-800 via-indigo-900 to-slate-950 border-4 border-amber-300/80 shadow-[0_0_50px_rgba(168,85,247,0.5)] flex flex-col items-center justify-center p-4">
                
                <div class="flex items-center gap-2 mb-2">
                  <div id="slot-1" class="w-14 h-14 rounded-2xl bg-black/50 border-2 border-dashed border-purple-300 flex items-center justify-center text-2xl font-black text-yellow-300 cursor-pointer transition-all hover:scale-105" title="点击取消选择">
                    ?
                  </div>
                  <span class="text-xl font-black text-purple-300">+</span>
                  <div id="slot-2" class="w-14 h-14 rounded-2xl bg-black/50 border-2 border-dashed border-purple-300 flex items-center justify-center text-2xl font-black text-yellow-300 cursor-pointer transition-all hover:scale-105" title="点击取消选择">
                    ?
                  </div>
                </div>

                <span class="text-[10px] text-purple-200 font-bold">请点击下方 2 个部件投入锅中（点击槽位可撤回）</span>
              </div>
            </div>

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

          <div id="fusion-success-modal" class="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-white hidden animate-scale-up z-50 p-6 text-center">
            <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center text-5xl font-black shadow-2xl mb-4 font-serif border-4 border-white animate-bounce">
              ${cur.target}
            </div>
            <h3 class="text-2xl font-black text-yellow-300 mb-1">魔法合成成功！【${cur.target}】</h3>
            <p class="text-xs text-purple-200 font-bold mb-3">${cur.pinyin} · ${cur.parts.join(" + ")}</p>
            <div class="max-w-md bg-white/10 rounded-2xl p-4 border border-purple-300/30 text-xs text-white/90 leading-relaxed font-semibold mb-5">
              <p class="text-amber-300 font-black mb-1">【字源奥秘】${cur.desc}</p>
              <p class="text-purple-200">【常用词组】${cur.words}</p>
            </div>
            <button id="btn-next-fusion" class="btn-game-orange text-white font-black text-base px-10 py-3 rounded-full shadow-2xl active:scale-95 cursor-pointer">
              ${currentRound < totalRounds ? "下一道魔法题 →" : "完成全部炼金 · 领奖"}
            </button>
          </div>

          <div id="fusion-complete-modal" class="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-white hidden animate-scale-up z-50 p-6 text-center">
            <div class="mb-4 flex items-center justify-center">${GAME_ICONS.trophy("w-24 h-24")}</div>
            <h2 class="text-3xl font-black text-yellow-300 mb-2">汉字炼金大宗师！</h2>
            <p class="text-xs text-purple-200 mb-4 font-bold">太聪明啦！成功完成了全部 ${totalRounds} 道汉字部首魔法合成！</p>
            <div class="candy-pill rounded-full px-6 py-2.5 mb-6 text-sm text-yellow-300 font-black flex items-center gap-2">
              ${GAME_ICONS.coin("w-5 h-5")}<span>获得 25 凯茜星币奖励</span>
            </div>
            <div class="flex gap-4">
              <button id="btn-fusion-again" class="btn-game-orange text-white font-black text-base px-8 py-3 rounded-full cursor-pointer shadow-lg active:scale-95">
                再玩一次
              </button>
              <button id="btn-claim-fusion" class="btn-game-wood text-white font-black text-base px-8 py-3 rounded-full cursor-pointer shadow-lg active:scale-95">
                返回游乐场
              </button>
            </div>
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
      const againBtn = this.container.querySelector("#btn-fusion-again");

      // 支持点击槽位撤回部件
      if (slot1) {
        this._on(slot1, "click", () => {
          if (selectedParts.length === 1) {
            soundAndFX.playPop();
            const removed = selectedParts.pop();
            slot1.textContent = "?";
            slot1.classList.remove("bg-purple-600/60", "border-solid", "border-yellow-300");
            const btn = this.container.querySelector(`.fusion-part-btn[data-part="${removed}"]`);
            if (btn) btn.classList.remove("opacity-40", "pointer-events-none");
          }
        });
      }

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
              spawnFloatingText(this.container.querySelector("#fusion-lab-arena"), "差一点，再试一次！", "fusion-err", { color: "#f87171", top: 40 });
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
            ebbinghausManager.addCoins(25);
            if (completeModal) completeModal.classList.remove("hidden");
          }
        });
      }

      if (againBtn) {
        this._on(againBtn, "click", () => {
          soundAndFX.playPop();
          this.renderFusionLab();
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

