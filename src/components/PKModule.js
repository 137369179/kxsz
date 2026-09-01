/**
 * 凯茜识字 - PK竞技场 (PK Arena)
 * 沉浸式 3D 战斗场景，通过字词对战击败 Boss
 */

import { BaseModule } from "../utils/BaseModule.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { CHARACTER_DATABASE } from "../data/characters.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { GAME_ICONS } from "../utils/gameIcons.js";
import { EVENTS } from "../utils/eventBus.js";

export class PKModule extends BaseModule {
  constructor(container) {
    super(container);
    this.maxHp = 100;
    this.playerHp = 100;
    this.bossHp = 100;
    this.currentRound = 0;
    this.options = [];
    this.targetChar = null;
    this.pool = [];
    this.isAnimating = false;
  }

  render() {
    this.destroy();
    
    // Pick characters from learned pool, fallback to all
    const learned = Object.keys(ebbinghausManager.progress.charRecords || {});
    if (learned.length >= 4) {
      this.pool = CHARACTER_DATABASE.filter(c => learned.includes(c.id));
    } else {
      this.pool = CHARACTER_DATABASE;
    }

    this.playerHp = this.maxHp;
    this.bossHp = this.maxHp;
    this.currentRound = 1;

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-900 overflow-hidden flex flex-col font-sans select-none">
        
        <!-- Background Decor -->
        <div class="absolute inset-0 z-0 opacity-40 pointer-events-none">
           <div class="absolute top-10 left-10 w-96 h-96 bg-fuchsia-600 rounded-full blur-[120px]"></div>
           <div class="absolute bottom-10 right-10 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
        </div>

        <!-- Header: Health Bars -->
        <div class="relative z-10 w-full p-6 flex items-center justify-between pl-20">
           <!-- Player -->
           <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-slate-200 border-4 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)] flex items-center justify-center text-2xl font-black overflow-hidden bg-cover bg-center">
                 ${GAME_ICONS.sparkle("w-10 h-10")}
              </div>
              <div class="flex flex-col gap-1">
                 <span class="text-white font-black text-sm drop-shadow-md">凯茜冒险家</span>
                 <div class="w-48 h-5 bg-black/50 rounded-full border border-white/20 overflow-hidden">
                    <div id="pk-player-hp" class="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-300 w-full"></div>
                 </div>
              </div>
           </div>

           <div class="text-4xl font-black text-yellow-400 italic drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">VS</div>

           <!-- Boss -->
           <div class="flex items-center gap-4 flex-row-reverse">
              <div class="w-16 h-16 rounded-full bg-slate-800 border-4 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)] flex items-center justify-center text-3xl overflow-hidden text-white">
                 ${GAME_ICONS.monster("w-10 h-10")}
              </div>
              <div class="flex flex-col gap-1 items-end">
                 <span class="text-rose-200 font-black text-sm drop-shadow-md">糊涂魔王</span>
                 <div class="w-48 h-5 bg-black/50 rounded-full border border-white/20 overflow-hidden flex justify-end">
                    <div id="pk-boss-hp" class="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-300 w-full"></div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Arena Stage -->
        <div class="relative flex-1 flex flex-col items-center justify-center z-10">
           <!-- Battle Area -->
           <div class="absolute inset-0 flex items-center justify-between px-20">
              <div id="pk-player-sprite" class="w-40 h-40 bg-white/10 backdrop-blur-sm border-2 border-emerald-400/50 rounded-3xl animate-bounce-slow flex items-center justify-center text-6xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] text-emerald-300">
                 ${GAME_ICONS.sparkle("w-20 h-20")}
              </div>
              
              <!-- Projectile container -->
              <div id="pk-projectile-layer" class="absolute inset-0 pointer-events-none"></div>

              <div id="pk-boss-sprite" class="w-48 h-48 bg-black/40 backdrop-blur-md border-2 border-rose-500/50 rounded-3xl animate-bounce-slow flex items-center justify-center text-8xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] text-rose-400" style="animation-delay: 0.5s">
                 ${GAME_ICONS.monster("w-28 h-28")}
              </div>
           </div>

           <!-- Question UI -->
           <div class="z-20 flex flex-col items-center mt-20">
              <div class="bg-black/60 backdrop-blur-lg border-2 border-amber-300/50 rounded-full px-10 py-3 mb-8 shadow-2xl flex items-center gap-4 cursor-pointer active:scale-95 transition-transform" id="pk-btn-listen">
                 <div class="w-8 h-8">${GAME_ICONS.speaker("w-full h-full")}</div>
                 <span class="text-2xl font-black text-yellow-300 tracking-widest">听音选字</span>
              </div>

              <!-- Options -->
              <div class="grid grid-cols-2 gap-6" id="pk-options-grid">
                 <!-- Generated dynamically -->
              </div>
           </div>
        </div>
        
        <!-- Back Button -->
        <button id="btn-pk-back" class="absolute top-6 left-6 z-50 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border-2 border-amber-300 shadow-xl">
           ${GAME_ICONS.back("w-7 h-7")}
        </button>

      </div>
    `;

    this._on(this.container.querySelector("#btn-pk-back"), "click", () => {
      soundAndFX.playPop();
      this._busEmit(EVENTS.SWITCH_MODE, { mode: "map" });
    });

    this._on(this.container.querySelector("#pk-btn-listen"), "click", () => {
      if (this.targetChar) {
         soundAndFX.speak(this.targetChar.char);
      }
    });

    this.nextRound();
  }

  nextRound() {
    this.isAnimating = false;
    if (this.playerHp <= 0 || this.bossHp <= 0) {
       this.endGame();
       return;
    }

    // Generate Question
    const shuffled = [...this.pool].sort(() => 0.5 - Math.random());
    this.options = shuffled.slice(0, 4);
    this.targetChar = this.options[Math.floor(Math.random() * this.options.length)];

    const grid = this.container.querySelector("#pk-options-grid");
    grid.innerHTML = this.options.map((opt, i) => `
      <button class="pk-option-btn w-32 h-32 bg-gradient-to-tr from-slate-100 to-white rounded-3xl border-4 border-slate-300 shadow-xl flex items-center justify-center text-6xl font-black text-slate-800 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all" data-idx="${i}">
         ${opt.char}
      </button>
    `).join("");

    grid.querySelectorAll(".pk-option-btn").forEach(btn => {
       this._on(btn, "click", () => this.handleAnswer(parseInt(btn.dataset.idx)));
    });

    // Auto speak
    this._timeout(() => soundAndFX.speak(this.targetChar.char), 500);
  }

  async handleAnswer(idx) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const selected = this.options[idx];
    const isCorrect = selected.id === this.targetChar.id;
    const btns = this.container.querySelectorAll(".pk-option-btn");
    const targetBtn = btns[idx];

    if (isCorrect) {
       targetBtn.classList.replace("border-slate-300", "border-emerald-500");
       targetBtn.classList.replace("text-slate-800", "text-emerald-600");
       targetBtn.classList.add("bg-emerald-50");
       soundAndFX.playSuccessSound();
       soundAndFX.speakPriority(this.targetChar.char, { kind: "char", priority: 1 });
       
       await this.playAttackAnimation("player");
       this.bossHp = Math.max(0, this.bossHp - 25);
       this.updateHpUI();
       
       if (this.bossHp > 0) {
         soundAndFX.playEncouragement();
       }
    } else {
       targetBtn.classList.replace("border-slate-300", "border-rose-500");
       targetBtn.classList.replace("text-slate-800", "text-rose-600");
       targetBtn.classList.add("bg-rose-50");
       soundAndFX.playErrorSound();
       soundAndFX.speakPriority(`这是“${selected.char}”字，要找的是“${this.targetChar.char}”字！`, { kind: "sentence", emotion: "correction" });
       
       // Show correct one
       const correctIdx = this.options.findIndex(o => o.id === this.targetChar.id);
       btns[correctIdx].classList.replace("border-slate-300", "border-emerald-400");
       btns[correctIdx].classList.add("animate-pulse");

       await this.playAttackAnimation("boss");
       this.playerHp = Math.max(0, this.playerHp - 25);
       this.updateHpUI();
    }

    this._timeout(() => this.nextRound(), 1000);
  }

  updateHpUI() {
     const pBar = this.container.querySelector("#pk-player-hp");
     const bBar = this.container.querySelector("#pk-boss-hp");
     if (pBar) pBar.style.width = (this.playerHp / this.maxHp) * 100 + "%";
     if (bBar) bBar.style.width = (this.bossHp / this.maxHp) * 100 + "%";
  }

  playAttackAnimation(attacker) {
     return new Promise(resolve => {
        const layer = this.container.querySelector("#pk-projectile-layer");
        if (!layer) return resolve();

        const proj = document.createElement("div");
        proj.className = "absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-[0_0_30px_rgba(255,255,255,1)] flex items-center justify-center text-3xl z-50";
        
        if (attacker === "player") {
           proj.innerHTML = GAME_ICONS.sparkle ? GAME_ICONS.sparkle("w-full h-full") : "";
           proj.classList.add("bg-emerald-400", "left-40");
           layer.appendChild(proj);
           
           // Animate to right
           const anim = proj.animate([
              { left: '160px', transform: 'translateY(-50%) scale(1)' },
              { left: 'calc(100% - 240px)', transform: 'translateY(-50%) scale(2)' }
           ], { duration: 400, easing: 'ease-in' });
           
           anim.onfinish = () => {
              proj.remove();
              const boss = this.container.querySelector("#pk-boss-sprite");
              boss.classList.add("animate-shake", "brightness-150", "bg-rose-500/50");
              this._timeout(() => boss.classList.remove("animate-shake", "brightness-150", "bg-rose-500/50"), 400);
              resolve();
           };
        } else {
           proj.innerHTML = GAME_ICONS.star ? GAME_ICONS.star("w-full h-full") : "";
           proj.classList.add("bg-rose-500", "right-48");
           layer.appendChild(proj);
           
           // Animate to left
           const anim = proj.animate([
              { right: '192px', transform: 'translateY(-50%) scale(1)' },
              { right: 'calc(100% - 200px)', transform: 'translateY(-50%) scale(2)' }
           ], { duration: 400, easing: 'ease-in' });
           
           anim.onfinish = () => {
              proj.remove();
              const player = this.container.querySelector("#pk-player-sprite");
              player.classList.add("animate-shake", "brightness-150", "bg-rose-500/50");
              this._timeout(() => player.classList.remove("animate-shake", "brightness-150", "bg-rose-500/50"), 400);
              resolve();
           };
        }
     });
  }

  endGame() {
     const won = this.playerHp > 0;
     if (won) {
        soundAndFX.playVictoryFanfare();
        soundAndFX.triggerConfetti(this.container);
        soundAndFX.triggerCoinFly(this.container);
        ebbinghausManager.addCoins(20);
     } else {
        soundAndFX.playErrorSound();
     }

     this.container.innerHTML = `
        <div class="relative w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
           <div class="mb-6 flex items-center justify-center">${won ? GAME_ICONS.trophy("w-28 h-28") : GAME_ICONS.shieldLock("w-28 h-28")}</div>
           <h2 class="text-4xl font-black text-white mb-3">${won ? "战斗大胜利！" : "挑战失败！"}</h2>
           <p class="text-slate-300 font-bold mb-6">${won ? "成功击败糊涂魔王！获得 20 凯茜星币奖励！" : "糊涂魔王太强大了，去每日复习巩固一下生字再来挑战吧！"}</p>
           
           ${won ? `
             <div class="candy-pill rounded-full px-6 py-2 mb-8 text-yellow-300 font-black flex items-center gap-2">
               <span class="flex items-center">${GAME_ICONS.coin("w-5 h-5")}</span>
               <span>+20 凯茜星币已到账</span>
             </div>
           ` : ""}

           <button id="btn-pk-exit" class="btn-game-orange text-white font-black text-lg px-12 py-3.5 rounded-full shadow-2xl active:scale-95 transition-transform border-2 border-white">
              返回大地图
           </button>
        </div>
     `;

     this._on(this.container.querySelector("#btn-pk-exit"), "click", () => {
        soundAndFX.playPop();
        this._busEmit(EVENTS.SWITCH_MODE, { mode: "map" });
     });
  }
}
