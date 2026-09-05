/** LearnModule step — extracted from LearnModule.js */
import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";
import { HanziEngine } from "../hanziEngine.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { shouldUseAirTrace, openAirTracePrompt } from "./airTracePrompt.js";
import { escapeHtml } from "../BaseModule.js";

export function renderStepTrace(stage) {
    const char = this.charData;

    // [P0-B1-3] 计算 guideMode 并据此渲染不同 UI
    const age = ebbinghausManager.getAge();
    const prewriteResult = ebbinghausManager.getLastPrewriteResult();
    let guideMode;
    // T2 硬门禁检测：3-4 岁孩子跳过 prewrite 直接进描红
    const prewriteSkippedByParent = age < 5 && !prewriteResult;
    if (prewriteSkippedByParent) guideMode = "free";
    else if (age < 6 || prewriteResult) guideMode = "soft";
    else guideMode = "strong";

    const phaseLabel = guideMode === "free"
      ? "阶段 · 自由涂鸦"
      : guideMode === "soft"
      ? "阶段一 · 趣味描红"
      : "阶段一 · 有轨描红";

    const hintText = guideMode === "free"
      ? "随便画一画这个字的样子就好～画错了也没关系！"
      : guideMode === "soft"
      ? "跟着发光的小光球画，感受一下笔顺的方向～"
      : "沿黄色魔法光球滑行，遇到倒笔画系统会自动提示并拦截哦！";

    const voiceIntro = guideMode === "free"
      ? `${age}岁宝贝，今天先随便画一画"${char.char}"字的样子吧！画错了也没关系～`
      : guideMode === "soft"
      ? `魔法毛笔趣味描红！跟着发光的小光球画"${char.char}"字吧～`
      : `魔法毛笔描红！请从发光起点开始，按照笔顺书写"${char.char}"字！`;
    soundAndFX.speakPriority(voiceIntro, { kind: "sentence", priority: 1 });

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex items-center justify-between p-8 animate-fade-in select-none">
        
        <div class="flex-1 flex flex-col items-center justify-center">
          <div class="mb-3 flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/20 shadow-md">
            <span class="text-xs font-black text-amber-300 flex items-center gap-1">${GAME_ICONS.brush("w-3.5 h-3.5")} <span>笔画糖果珠</span></span>
            <div id="write-stroke-beads" class="flex items-center gap-1.5 flex-wrap justify-center">
              ${char.strokes.map((s, idx) => `
                <button type="button" class="stroke-bead px-2.5 py-0.5 rounded-full text-xs font-black border transition-all cursor-pointer ${idx === 0 ? 'bg-amber-400 text-amber-950 border-white shadow-md animate-pulse' : 'bg-white/15 text-white/60 border-white/20'}" data-idx="${idx}" data-speak="第${idx + 1}笔，${escapeHtml(s.name)}" aria-label="第${idx + 1}笔，${escapeHtml(s.name)}" title="${escapeHtml(s.name)}">
                  ${idx + 1}
                </button>
              `).join("")}
            </div>
          </div>

          <div class="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400 bg-white">
            <canvas id="hanzi-magic-canvas" class="w-full h-full cursor-crosshair"></canvas>
          </div>
        </div>

        <div class="w-72 flex flex-col justify-between h-full bg-white/80 backdrop-blur-md rounded-3xl p-6 border-2 border-amber-200 shadow-xl text-center">
          <div>
            <span class="bg-amber-100 text-amber-800 text-xs font-black px-4 py-1 rounded-full mb-3 inline-block flex items-center justify-center gap-1">
              ${GAME_ICONS.brush("w-3.5 h-3.5 inline-block")} ${phaseLabel}
            </span>
            <h3 class="text-lg font-black text-amber-950 mb-2">${guideMode === "free" ? `开心画「${char.char}」` : "规范笔顺描红"}</h3>
            <p class="text-xs text-gray-600 leading-relaxed font-semibold">
              ${GAME_ICONS.sparkle("w-4 h-4 inline-block")} ${hintText}
            </p>
          </div>

          <div class="flex flex-col gap-2.5">
            <button id="btn-demo-write" class="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs sm:text-sm py-2.5 rounded-full shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer" data-speak="看魔法画笔演示笔顺" aria-label="演示笔顺">
              <span class="flex items-center text-yellow-200">${GAME_ICONS.sparkle("w-4 h-4")}</span>
              <span>魔法演示笔顺</span>
            </button>

            <button id="btn-toggle-grid" class="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs py-2 rounded-full border border-amber-300 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer" data-speak="切换格子" aria-label="切换格子">
              <span class="flex items-center text-amber-700">${GAME_ICONS.pen("w-3.5 h-3.5")}</span>
              <span id="txt-grid-type">当前格线：米字格 (切田字格)</span>
            </button>

            <button id="btn-reset-write" class="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs py-2.5 rounded-full shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer" data-speak="擦干净重新画" aria-label="橡皮擦重新临摹">
              <span class="flex items-center text-amber-800">${GAME_ICONS.brush("w-4 h-4")}</span>
              <span>小橡皮擦重写</span>
            </button>

            <button id="btn-finish-write-step" data-speak="描红完成，去独立写" aria-label="描红完成，去独立写" class="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white font-black text-base py-3.5 rounded-full shadow-[0_8px_25px_rgba(245,158,11,0.6)] border-2 border-white active:scale-95 transition-all flex items-center justify-center gap-2 hidden animate-bounce-slow cursor-pointer hover:brightness-105">
              <span class="flex items-center">${GAME_ICONS.star("w-5 h-5", false)}</span>
              <span>大功告成！去独立写</span>
            </button>
          </div>
        </div>

      </div>
    `;

    const canvas = stage.querySelector("#hanzi-magic-canvas");
    const demoBtn = stage.querySelector("#btn-demo-write");
    const resetBtn = stage.querySelector("#btn-reset-write");
    const toggleGridBtn = stage.querySelector("#btn-toggle-grid");
    const txtGridType = stage.querySelector("#txt-grid-type");
    const nextBtn = stage.querySelector("#btn-finish-write-step");
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
        if (nextBtn) nextBtn.classList.remove("hidden");
      },
      (strokeIdx) => {
        updateBeads(strokeIdx + 1);
      },
      // [P0-B1-3] 传 guideMode + strictReverseCheck 给 HanziEngine
      {
        guideMode: guideMode,
        strictReverseCheck: guideMode === "strong",  // free/soft 不拦截倒笔画
        freeWrite: guideMode === "free"
      }
    );

    // B6 铁律：根据年龄自适应田字格/米字格
    const _ws = ebbinghausManager.getWritingStage();
    if (this.hanziEngine) {
      if (_ws === "guided_trace") {
        this.hanziEngine.gridType = "tian";
      }
    }

    if (toggleGridBtn && txtGridType) {
      this._on(toggleGridBtn, "click", () => {
        soundAndFX.playPop();
        const type = this.hanziEngine.toggleGridType();
        txtGridType.textContent = type === "mi" ? "当前格线：米字格 (切田字格)" : "当前格线：田字格 (切米字格)";
      });
    }

    if (demoBtn) {
      this._on(demoBtn, "click", () => {
        soundAndFX.speakPriority(`看小精灵示范“${char.char}”字的笔顺！`, { kind: "sentence", emotion: "gentle" });
        if (this.hanziEngine) {
          demoBtn.classList.add("opacity-50", "pointer-events-none");
          this.hanziEngine.demoAllStrokes(() => {
            demoBtn.classList.remove("opacity-50", "pointer-events-none");
            updateBeads(0);
            soundAndFX.speakPriority(`轮到小勇士来写“${char.char}”字啦！`, { kind: "sentence", emotion: "encouraging" });
          });
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
        // P0：5–6 岁序列为 […,6,8]，禁止硬编码跳进独立写(7)
        if (typeof this.nextStep === "function") this.nextStep();
      });
    }

    // [P2-7] 身体动觉：描红前「空中比划」热身（无摄像头降级为发光 ghost 动画）
    // 真实描红画布已在背后就绪；热身模态关闭后儿童直接开始描红即可。
    if (shouldUseAirTrace(age) && !this._airTraceDone) {
      this._airTraceDone = true;
      openAirTracePrompt(char, () => {});
    }
  }

