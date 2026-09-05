/** LearnModule step — extracted from LearnModule.js */
import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { getCharPictogramUrl } from "../pictogramRenderer.js";

export function renderStepPractice(stage) {
    const char = this.charData;
    let hitCount = 0;
    const targetHits = 3;

    soundAndFX.speakPriority(`瞄准射击！请击中带有“${char.char}”字的太空发光气球！`, { kind: "sentence", emotion: "excited" });

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col justify-between p-6 animate-fade-in select-none">
        
        <canvas id="laser-effect-canvas" class="absolute inset-0 w-full h-full pointer-events-none z-20"></canvas>

        <div class="w-full flex items-center justify-between bg-black/60 px-6 py-2 rounded-full border border-white/30 text-white z-10">
          <div class="flex items-center gap-2.5">
            ${(() => {
              const picUrl = getCharPictogramUrl(char.char);
              return picUrl ? `
                <div class="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-300 shadow-md shrink-0">
                  <img src="${picUrl}" alt="${char.char}" class="w-full h-full object-cover" />
                </div>
              ` : `
                <span class="flex items-center text-yellow-300">${GAME_ICONS.star("w-5 h-5", false)}</span>
              `;
            })()}
            <span class="text-xl sm:text-2xl text-yellow-300 font-serif font-black bg-black/50 px-3.5 py-0.5 rounded-xl border border-amber-400 shadow">${char.char}</span>
            <span class="text-xs text-amber-200 font-bold hidden sm:inline">瞄准气球</span>
          </div>

          <div class="flex items-center gap-2">
            <div id="practice-star-slots" class="flex items-center gap-2">
              <div id="slot-star-0" class="w-8 h-8 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center transition-all">
                <span class="flex items-center text-white/30">${GAME_ICONS.star("w-4 h-4", true)}</span>
              </div>
              <div id="slot-star-1" class="w-8 h-8 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center transition-all">
                <span class="flex items-center text-white/30">${GAME_ICONS.star("w-4 h-4", true)}</span>
              </div>
              <div id="slot-star-2" class="w-8 h-8 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center transition-all">
                <span class="flex items-center text-white/30">${GAME_ICONS.star("w-4 h-4", true)}</span>
              </div>
            </div>
            <span id="game-hit-progress" class="text-yellow-400 text-xs font-black hidden">0 / ${targetHits}</span>
          </div>
        </div>

        <div id="space-shooting-range" class="relative w-full flex-1 flex items-center justify-around my-4 z-10">
          ${(char.gameConfig && char.gameConfig.options ? char.gameConfig.options : [char.char, "月", "山"])
            .map(
              (opt, idx) => `
            <button class="balloon-target-btn relative group w-32 h-44 sm:w-40 sm:h-52 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200 border-4 border-white shadow-[0_0_30px_rgba(255,160,0,0.6)] flex flex-col items-center justify-center active:scale-75 transition-all duration-300 animate-bounce-slow cursor-pointer" style="animation-delay: ${
              idx * 0.3
            }s" data-char="${opt}">
              <span class="text-6xl sm:text-7xl font-black text-amber-950 drop-shadow">${opt}</span>
              <div class="w-1.5 h-12 bg-white/40 absolute -bottom-10 rounded-full"></div>
            </button>
          `
            )
            .join("")}
        </div>

        <div class="w-full flex flex-col items-center justify-center gap-1 z-10">
          <div id="practice-combo-badge" class="text-xs sm:text-sm font-black text-amber-300 bg-black/50 px-4 py-1 rounded-full border border-amber-400/40 opacity-0 transition-all duration-300">
            双连击！太棒啦！
          </div>
          <div class="text-xl sm:text-2xl text-yellow-300 font-black animate-bounce-cathy flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.arcade("w-6 h-6")}</span>
            <span>凯茜激光战机准备就绪！</span>
          </div>
        </div>

        <div id="practice-win-modal" class="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-white hidden animate-scale-up z-40">
          <div class="flex items-center gap-3 mb-3">
            <span class="flex items-center">${GAME_ICONS.star("w-10 h-10", false)}</span>
            <span class="flex items-center">${GAME_ICONS.star("w-12 h-12", false)}</span>
            <span class="flex items-center">${GAME_ICONS.star("w-10 h-10", false)}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-yellow-300 mb-2">神枪手！射击挑战大满贯！</h2>
          <p class="text-xs sm:text-sm text-gray-300 mb-6 font-semibold">你已经彻底掌握了“${char.char}”字的辨识与发音！</p>
          <button id="btn-next-to-write" data-speak="进入写字环节" aria-label="进入写字环节" class="bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white font-black text-base px-12 py-3.5 rounded-full shadow-[0_8px_25px_rgba(16,185,129,0.6)] border-2 border-white active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.hand("w-5 h-5")}</span>
            <span>小手热身 · 控笔训练</span>
          </button>
        </div>

      </div>
    `;

    const progressText = stage.querySelector("#game-hit-progress");
    const winModal = stage.querySelector("#practice-win-modal");
    const comboBadge = stage.querySelector("#practice-combo-badge");
    const nextBtn = stage.querySelector("#btn-next-to-write");
    const laserCanvas = stage.querySelector("#laser-effect-canvas");

    const fireLaser = (targetBtn) => {
      if (!laserCanvas) return;
      laserCanvas.width = laserCanvas.offsetWidth;
      laserCanvas.height = laserCanvas.offsetHeight;
      const ctx = laserCanvas.getContext("2d");
      const btnRect = targetBtn.getBoundingClientRect();
      const canvasRect = laserCanvas.getBoundingClientRect();
      const targetX = btnRect.left + btnRect.width / 2 - canvasRect.left;
      const targetY = btnRect.top + btnRect.height / 2 - canvasRect.top;
      const shipX = canvasRect.width / 2;
      const shipY = canvasRect.height - 25;

      ctx.clearRect(0, 0, canvasRect.width, canvasRect.height);

      // 外发光激光光晕
      ctx.strokeStyle = "#00E5FF";
      ctx.lineWidth = 8;
      ctx.shadowColor = "#00E5FF";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(shipX, shipY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      // 内层纯白高能光束
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(shipX, shipY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      this._timeout(() => {
        ctx.clearRect(0, 0, canvasRect.width, canvasRect.height);
      }, 180);
    };

    stage.querySelectorAll(".balloon-target-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        if (hitCount >= targetHits) return;
        const val = btn.dataset.char;
        if (val === char.char) {
          hitCount++;
          fireLaser(btn);
          soundAndFX.playLaserShoot();
          soundAndFX.triggerConfetti(this.container);

          btn.classList.add("scale-125", "opacity-0");
          this._timeout(() => btn.classList.remove("scale-125", "opacity-0"), 600);

          if (comboBadge) {
            const comboMsgs = ["好枪法！命中目标！", "双连击！太准啦！", "三连击！大满贯神枪手！"];
            comboBadge.textContent = comboMsgs[hitCount - 1] || "命中目标！";
            comboBadge.classList.remove("opacity-0");
            comboBadge.classList.add("opacity-100", "scale-110");
            this._timeout(() => comboBadge.classList.remove("scale-110"), 300);
          }

          if (progressText) progressText.textContent = `${hitCount} / ${targetHits}`;
          const currentSlot = stage.querySelector(`#slot-star-${hitCount - 1}`);
          if (currentSlot) {
            currentSlot.className = "w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 border-2 border-white flex items-center justify-center transition-all shadow-lg animate-bounce";
            currentSlot.innerHTML = `<span class="flex items-center text-white">${GAME_ICONS.star("w-5 h-5", false)}</span>`;
          }

          if (hitCount >= targetHits) {
            this._timeout(() => {
              soundAndFX.playVictoryFanfare();
              if (winModal) winModal.classList.remove("hidden");
            }, 250);
          } else {
            soundAndFX.speakPriority(char.char, { kind: "char", priority: 1 });
          }
        } else {
          try {
            ebbinghausManager.recordMistake(char.id, "similar_confuse", { targetChar: char.char, selectedChar: val });
          } catch {}
          soundAndFX.playSoftError();
          this._timeout(() => {
            soundAndFX.speakPriority(`这是“${val}”字，要找的是“${char.char}”字哦！`, { kind: "sentence", emotion: "correction" });
          }, 180);
          btn.classList.add("animate-shake");
          this._timeout(() => btn.classList.remove("animate-shake"), 600);
        }
      });
    });

    if (nextBtn) {
      this._on(nextBtn, "click", () => {
        soundAndFX.playPop();
        if (typeof this.nextStep === "function") this.nextStep();
      });
    }
  }

  // ----------------------------------------------------------------
  // STEP 5: 控笔训练 —— B1/B6 铁律：写字前先建立手部小肌肉控制
  // 教育学依据：《汉字启蒙认知能力教学指南》(教育部) + 皮亚杰前运算阶段
