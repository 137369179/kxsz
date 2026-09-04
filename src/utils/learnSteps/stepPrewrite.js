/** LearnModule step — extracted from LearnModule.js */
import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";
import { PrewriteEngine } from "../prewriteEngine.js";
import { ebbinghausManager } from "../ebbinghaus.js";

export function renderStepPrewrite(stage) {
    const char = this.charData;
    const age = ebbinghausManager.getAge();
    const stageLabel = ebbinghausManager.getWritingStage();
    const blockedByAge = ebbinghausManager.isWriteBlockedByAge();

    // B1：按 stepSequence 决定控笔后的下一步（禁止写死 6/8）
    const seqNext = typeof this.getNextStepInSequence === "function"
      ? this.getNextStepInSequence(5)
      : -1;
    const nextStepAfterPrewrite = seqNext > 0 ? seqNext : (blockedByAge ? 8 : 6);
    const nextStepLabel = nextStepAfterPrewrite === 8
      ? `${char.char}字就学到这里啦，去领取宝箱奖励！`
      : `小手准备好了吗？去描红“${char.char}”字！`;

    soundAndFX.speakPriority(
      stageLabel === "prewrite_only"
        ? `B1铁律模式：${age}岁宝贝先玩手指热身运动！`
        : `控笔训练开始！先用手指画一画，活动一下小手吧～`,
      { kind: "sentence", emotion: "gentle" }
    );

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-amber-100 via-orange-50 to-yellow-50 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex items-center justify-between p-6 animate-fade-in select-none">

        <div class="flex-1 flex flex-col items-center justify-center">
          <!-- 训练进度指示 -->
          <div class="mb-3 flex items-center gap-2 bg-black/30 px-4 py-1.5 rounded-full border border-white/30">
            <span class="text-xs font-black text-amber-900">控笔进度:</span>
            <div id="prewrite-shape-beads" class="flex items-center gap-2"></div>
          </div>

          <!-- 控笔 canvas -->
          <div class="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400 bg-white">
            <canvas id="prewrite-canvas" class="w-full h-full cursor-crosshair touch-none"></canvas>
          </div>

          <!-- 当前形状名称 -->
          <div id="prewrite-shape-label" class="mt-3 text-sm font-black text-amber-900 bg-white/70 px-4 py-1 rounded-full border border-amber-300">
            小手准备好～
          </div>
        </div>

        <!-- 右侧信息面板 -->
        <div class="w-72 flex flex-col justify-between h-full bg-white/80 backdrop-blur-md rounded-3xl p-5 border-2 border-amber-200 shadow-xl text-center">
          <div>
            <span class="bg-amber-100 text-amber-800 text-xs font-black px-4 py-1 rounded-full mb-2 inline-block flex items-center justify-center gap-1">
              ${GAME_ICONS.hand("w-3.5 h-3.5 inline-block")} 控笔热身训练
            </span>

            <!-- B1/B6 年龄阶段徽章 -->
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black mb-3 ${
              stageLabel === "prewrite_only"
                ? "bg-rose-100 text-rose-700 border border-rose-300"
                : stageLabel === "guided_trace"
                ? "bg-amber-100 text-amber-700 border border-amber-300"
                : "bg-emerald-100 text-emerald-700 border border-emerald-300"
            }">
              <span>${stageLabel === "prewrite_only" ? "🚫" : stageLabel === "guided_trace" ? "🎯" : "✏️"}</span>
              <span>${age}岁 · ${
                stageLabel === "prewrite_only" ? "只练控笔不描红"
                : stageLabel === "guided_trace" ? "引导式描红"
                : "完整描红"
              }</span>
            </div>

            <h3 class="text-base font-black text-amber-950 mb-2">小手灵活操</h3>
            <p class="text-xs text-gray-600 leading-relaxed font-semibold">
              ${GAME_ICONS.sparkle("w-4 h-4 inline-block")}
              跟着发光光球，用手指画虚线形状。
              ${blockedByAge
                ? "画够 3 个形状就过关啦！"
                : "画完 3 个形状，小手就暖好啦！"
              }
            </p>
          </div>

          <div class="flex flex-col gap-2.5">
            <button id="btn-grip-guide" class="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs py-2 rounded-full border border-amber-300 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span>${GAME_ICONS.hand("w-4 h-4")}</span>
              <span>握笔姿势教学</span>
            </button>

            <button id="btn-skip-prewrite" class="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs py-2.5 rounded-full shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span>${GAME_ICONS.sparkle("w-4 h-4")}</span>
              <span>跳过当前形状</span>
            </button>

            <button id="btn-finish-prewrite" class="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-sm py-3 rounded-full shadow-lg border-2 border-white active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer opacity-40 pointer-events-none">
              <span>${nextStepAfterPrewrite === 8 ? GAME_ICONS.chest("w-4 h-4") : GAME_ICONS.brush("w-4 h-4")}</span>
              <span id="txt-prewrite-next">完成训练去${nextStepAfterPrewrite === 8 ? "领宝箱" : "描红"}</span>
            </button>
          </div>
        </div>

      </div>
    `;

    const canvas = stage.querySelector("#prewrite-canvas");
    const finishBtn = stage.querySelector("#btn-finish-prewrite");
    const skipBtn = stage.querySelector("#btn-skip-prewrite");
    const gripBtn = stage.querySelector("#btn-grip-guide");
    const beadsContainer = stage.querySelector("#prewrite-shape-beads");
    const shapeLabel = stage.querySelector("#prewrite-shape-label");

    const updateBeads = (engine) => {
      if (!beadsContainer) return;
      const total = engine.getTotalShapes();
      const cur = engine.getCurrentShapeNumber();
      beadsContainer.innerHTML = Array.from({ length: total })
        .map((_, i) => {
          const done = i < cur - 1;
          const active = i === cur - 1;
          return `<span class="w-5 h-5 rounded-full border-2 ${
            done ? "bg-emerald-500 border-white shadow-md"
                 : active ? "bg-amber-400 border-white shadow-md animate-pulse"
                 : "bg-white/40 border-white/60"
          }"></span>`;
        })
        .join("");
    };

    this.prewriteEngine = new PrewriteEngine(canvas, {
      enableGripGuide: true,
      onComplete: (idx, coverage) => {
        soundAndFX.triggerConfetti?.(this.container);
        if (shapeLabel) {
          shapeLabel.textContent = `太棒啦！覆盖度 ${Math.round(coverage * 100)}%`;
        }
      },
      onAllComplete: () => {
        soundAndFX.playVictoryFanfare?.();
        ebbinghausManager.addCoins?.(blockedByAge ? 5 : 3);
        soundAndFX.triggerCoinFly?.(finishBtn, blockedByAge ? 5 : 3);

        // ✅ P0-B1-3：写入 prewrite 完成度 → 让后续 hanziEngine 知道控笔能力
        try {
          ebbinghausManager.setLastPrewriteResult({
            age: age,
            shapesPracticed: this.prewriteEngine?.getCompletedShapes?.() || [],
            avgCoverage: this.prewriteEngine?.getAverageCoverage?.() || 0,
            completedAt: Date.now()
          });
        } catch (e) { console.warn("[stepPrewrite] setLastPrewriteResult failed:", e); }

        // ✅ P0-B1-3：用 stepSequence 算下一个，不再硬编码 blockedByAge ? 8 : 6
        const nextStep = typeof this.getNextStepInSequence === "function"
          ? this.getNextStepInSequence(5)
          : (blockedByAge ? 8 : 6);
        const stepAfterPrewrite = nextStep > 0 ? nextStep : (blockedByAge ? 8 : 6);

        // B1 铁律：年龄分流
        if (blockedByAge) {
          soundAndFX.speakPriority(
            `${age}岁宝贝还太小啦，写字会累小手！今天控笔热身完成啦，我们去领宝箱吧！`,
            { kind: "sentence", emotion: "gentle" }
          );
        } else {
          soundAndFX.speakPriority(
            "小手活动好了！接下来去描红写字吧～",
            { kind: "sentence", emotion: "encouraging" }
          );
        }

        if (finishBtn) {
          finishBtn.classList.remove("opacity-40", "pointer-events-none");
          finishBtn.classList.add("animate-bounce-cathy");
          if (stepAfterPrewrite === 8) {
            finishBtn.innerHTML = `<span>${GAME_ICONS.chest("w-5 h-5")}</span><span>领宝箱！</span>`;
          }
        }
      }
    });

    // 初始 beads
    updateBeads(this.prewriteEngine);
    if (shapeLabel) {
      const name = this.prewriteEngine.getCurrentShapeName();
      shapeLabel.textContent = `第 ${this.prewriteEngine.getCurrentShapeNumber()}/${this.prewriteEngine.getTotalShapes()} 个形状：${name}`;
    }

    // 轮询更新当前形状 label 和 beads
    const _updateFromEngine = () => {
      if (!this.prewriteEngine || this.isDestroyed) return;
      if (!this.container.isConnected) return;
      updateBeads(this.prewriteEngine);
      if (shapeLabel) {
        const n = this.prewriteEngine.getCurrentShapeNumber();
        const t = this.prewriteEngine.getTotalShapes();
        if (n <= t) {
          shapeLabel.textContent = `第 ${n}/${t} 个形状：${this.prewriteEngine.getCurrentShapeName()}`;
        }
      }
      this._updateTimer = requestAnimationFrame(_updateFromEngine);
    };
    this._updateTimer = requestAnimationFrame(_updateFromEngine);
    this._addCleanup(() => {
      if (this._updateTimer) cancelAnimationFrame(this._updateTimer);
    });

    // 握笔姿势教学
    if (gripBtn) {
      this._on(gripBtn, "click", () => {
        soundAndFX.playPop();
        soundAndFX.speakPriority(
          "握好笔的小诀窍：食指和拇指轻轻捏住笔杆，中指从下面托住，像三只小鸟站在树枝上～",
          { kind: "sentence", emotion: "gentle" }
        );
        // 简短视觉提示（alert 轻量）
        const hint = document.createElement("div");
        hint.className = "fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fade-in select-none";
        hint.innerHTML = `
          <div class="bg-white rounded-3xl p-6 max-w-xs text-center shadow-2xl border-4 border-amber-300">
            <div class="text-5xl mb-2">✏️</div>
            <h3 class="font-black text-amber-950 mb-2">三指握笔小口诀</h3>
            <p class="text-xs text-gray-700 leading-relaxed font-semibold mb-3">
              食指拇指捏笔杆<br/>
              中指下面轻轻托<br/>
              小手放松不要紧<br/>
              像只小鸟站枝头～
            </p>
            <button class="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-xs px-6 py-2 rounded-full">知道啦</button>
          </div>
        `;
        document.body.appendChild(hint);
        const close = hint.querySelector("button");
        const remove = () => hint.remove();
        this._on(close, "click", remove);
        this._on(hint, "click", (e) => { if (e.target === hint) remove(); });
      });
    }

    // 跳过当前形状
    if (skipBtn) {
      this._on(skipBtn, "click", () => {
        soundAndFX.playPop();
        if (this.prewriteEngine) {
          this.prewriteEngine.skipCurrent();
          if (this.prewriteEngine.getCurrentShapeNumber() > this.prewriteEngine.getTotalShapes()) {
            // 全部跳过也能 finish
            if (this.prewriteEngine.onAllComplete) {
              // 手动触发
              this.prewriteEngine["_finishAll"]?.();
            }
          }
        }
      });
    }

    // 完成训练后的跳转（B1 铁律年龄分流）
    if (finishBtn) {
      this._on(finishBtn, "click", () => {
        soundAndFX.playPop();
        if (this.prewriteEngine) {
          // 还没全部完成也允许"硬跳"（宽容模式）
          this.prewriteEngine.destroy();
          this.prewriteEngine = null;
        }
        if (typeof this.nextStep === "function") this.nextStep();
        else {
          this.currentStep = nextStepAfterPrewrite;
          this.render();
        }
      });
    }
  }

  // ----------------------------------------------------------------
  // STEP 6: 描红 (AI 魔法星光毛笔描红 + 倒笔画拦截) —— B6 年龄自适应
