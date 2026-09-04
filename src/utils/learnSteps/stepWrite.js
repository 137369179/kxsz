/** LearnModule step — extracted from LearnModule.js */
import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";
import { HanziEngine } from "../hanziEngine.js";
import { HAZARD_PEEK_DURATION_MS } from "../learnScoring.js";
import { ebbinghausManager } from "../ebbinghaus.js";

export function renderStepWrite(stage) {
    return this.renderStepTrace(stage);
  }

  // ----------------------------------------------------------------
  // STEP 7: 独立写 (无底模脱轨回忆书写 + 骨架还原评分 + 印章奖励)
  // 教育学依据：B1 认知先于执笔 + B6 独立书写 + B9 测试回忆而非识别
  // ----------------------------------------------------------------
export function renderStepFreeWrite(stage) {
    const char = this.charData;
    soundAndFX.speakPriority(`小书法家挑战！拿掉虚线，凭记忆在米字格里写出漂亮的“${char.char}”字！`, { kind: "sentence", priority: 1 });

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-50 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex items-center justify-between p-8 animate-fade-in select-none">
        
        <div class="flex-1 flex flex-col items-center justify-center">
          <div class="mb-3 flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/20 shadow-md">
            <span class="text-xs font-black text-amber-300">笔画回忆:</span>
            <div id="freewrite-stroke-beads" class="flex items-center gap-1.5 flex-wrap justify-center">
              ${char.strokes.map((s, idx) => `
                <span class="stroke-bead px-2.5 py-0.5 rounded-full text-[11px] font-black border transition-all ${idx === 0 ? 'bg-amber-400 text-amber-950 border-white shadow-md animate-pulse' : 'bg-white/15 text-white/60 border-white/20'}" data-idx="${idx}">
                  ${idx + 1}.${s.name}
                </span>
              `).join("")}
            </div>
          </div>

          <div class="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400 bg-white">
            <canvas id="hanzi-freewrite-canvas" class="w-full h-full cursor-crosshair"></canvas>
          </div>
        </div>

        <div class="w-72 flex flex-col justify-between h-full bg-white/80 backdrop-blur-md rounded-3xl p-6 border-2 border-amber-200 shadow-xl text-center">
          <div>
            <span class="bg-amber-100 text-amber-800 text-xs font-black px-4 py-1 rounded-full mb-3 inline-block flex items-center justify-center gap-1">
              ${GAME_ICONS.pen("w-3.5 h-3.5 inline-block")} 阶段二 · 独立书写
            </span>
            <h3 class="text-lg font-black text-amber-950 mb-2">小书法家挑战</h3>
            <p class="text-xs text-gray-600 leading-relaxed font-semibold">
              没有虚线跟着写啦！凭小脑瓜里的记忆，一笔一画写出漂亮的“${char.char}”字！
            </p>
          </div>

          <div class="flex flex-col gap-2.5">
            <button id="btn-peek-guide" class="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs py-2.5 rounded-full border border-amber-300 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
              <span>偷偷看一眼提示 (2秒)</span>
            </button>

            <button id="btn-toggle-grid-free" class="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs py-2 rounded-full border border-amber-300 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.pen("w-3.5 h-3.5")}</span>
              <span id="txt-grid-type-free">当前格线：米字格 (切田字格)</span>
            </button>

            <button id="btn-reset-freewrite" class="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs py-2.5 rounded-full shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.brush("w-4 h-4")}</span>
              <span>重写这一字</span>
            </button>

            <button id="btn-finish-freewrite-step" class="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white font-black text-base py-3.5 rounded-full shadow-[0_8px_25px_rgba(245,158,11,0.6)] border-2 border-white active:scale-95 transition-all flex items-center justify-center gap-2 hidden animate-bounce-slow cursor-pointer hover:brightness-105">
              <span class="flex items-center">${GAME_ICONS.chest("w-5 h-5")}</span>
              <span>独立书写大成功！去领通关宝箱</span>
            </button>
          </div>
        </div>

      </div>
    `;

    const canvas = stage.querySelector("#hanzi-freewrite-canvas");
    const peekBtn = stage.querySelector("#btn-peek-guide");
    const resetBtn = stage.querySelector("#btn-reset-freewrite");
    const toggleGridBtn = stage.querySelector("#btn-toggle-grid-free");
    const txtGridType = stage.querySelector("#txt-grid-type-free");
    const nextBtn = stage.querySelector("#btn-finish-freewrite-step");
    const beads = stage.querySelectorAll(".stroke-bead");

    const updateBeads = (currentIdx) => {
      beads.forEach((b, i) => {
        if (i < currentIdx) {
          b.className = "stroke-bead px-2.5 py-0.5 rounded-full text-[11px] font-black border bg-emerald-500 text-white border-white shadow-md";
        } else if (i === currentIdx) {
          b.className = "stroke-bead px-2.5 py-0.5 rounded-full text-[11px] font-black border bg-amber-400 text-amber-950 border-white shadow-md animate-pulse";
        } else {
          b.className = "stroke-bead px-2.5 py-0.5 rounded-full text-[11px] font-black border bg-white/15 text-white/60 border-white/20";
        }
      });
    };

    this.hanziEngine = new HanziEngine(
      canvas,
      char,
      () => {
        soundAndFX.triggerConfetti(this.container);
        ebbinghausManager.addCoins(3);
        if (nextBtn) nextBtn.classList.remove("hidden");
      },
      (strokeIdx) => {
        updateBeads(strokeIdx + 1);
      },
      { freeWrite: true }
    );

    const _ws = ebbinghausManager.getWritingStage();
    if (this.hanziEngine && _ws === "guided_trace") {
      this.hanziEngine.gridType = "tian";
    }

    if (toggleGridBtn && txtGridType) {
      this._on(toggleGridBtn, "click", () => {
        soundAndFX.playPop();
        const type = this.hanziEngine.toggleGridType();
        txtGridType.textContent = type === "mi" ? "当前格线：米字格 (切田字格)" : "当前格线：田字格 (切米字格)";
      });
    }

    if (peekBtn) {
      this._on(peekBtn, () => {
        soundAndFX.speakPriority(`小精灵给你提示一眼，看清楚笔顺马上写哦！`, { kind: "sentence", emotion: "gentle" });
        if (this.hanziEngine) {
          this.hanziEngine.peekGuide(HAZARD_PEEK_DURATION_MS);
        }
      });
    }

    if (resetBtn) {
      this._on(resetBtn, "click", () => {
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        if (this.hanziEngine) this.hanziEngine.reset();
        updateBeads(0);
        if (nextBtn) nextBtn.classList.add("hidden");
      });
    }

    if (nextBtn) {
      this._on(nextBtn, "click", () => {
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        if (typeof this.nextStep === "function") this.nextStep();
      });
    }
  }

  // ----------------------------------------------------------------
  // STEP 8: 测 & 华丽黄金宝箱结算 (Duang! Duang! Duang! 飞星)
