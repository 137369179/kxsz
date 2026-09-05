/**
 * 凯茜识字 - 八步微课学习流（编排层）
 * 步骤实现已拆至 src/utils/learnSteps/*
 */

import { soundAndFX } from "../utils/soundEngine.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { BaseModule, escapeHtml } from "../utils/BaseModule.js";
import { GAME_ICONS } from "../utils/gameIcons.js";
import { pronunciationEval } from "../utils/pronunciationEval.js";
import { saveLearnProgress, loadLearnProgress, clearLearnProgress } from "../utils/learnProgressStore.js";
import { voiceGuide } from "../utils/voiceGuide.js";
import {
  starsToMasteryRate,
  scoreToStars,
  isValidCharData,
  calculateStepProgress,
  getStepDuration,
} from "../utils/learnScoring.js";
import { getLearnStepMeta } from "../utils/learnSteps/stepMeta.js";
import { getCharPictogramUrl } from "../utils/pictogramRenderer.js";
import { renderStepPlay } from "../utils/learnSteps/stepPlay.js";
import { renderStepRecognize } from "../utils/learnSteps/stepRecognize.js";
import { renderStepRead, _bindManualRating, executeRecordToggle, _showRecordError, _showMicPermissionModal, _resetRecordUI, _showEvalResult } from "../utils/learnSteps/stepRead.js";
import { renderStepPractice } from "../utils/learnSteps/stepPractice.js";
import { renderStepPrewrite } from "../utils/learnSteps/stepPrewrite.js";
import { renderStepTrace } from "../utils/learnSteps/stepTrace.js";
import { renderStepWrite, renderStepFreeWrite } from "../utils/learnSteps/stepWrite.js";
import { renderStepTestAndChest } from "../utils/learnSteps/stepTest.js";

export {
  starsToMasteryRate,
  scoreToStars,
  isValidCharData,
  calculateStepProgress,
  getStepDuration,
};

export class LearnModule extends BaseModule {
  constructor(container, charData, onFinishCallback, onBackToMapCallback) {
    super(container);
    this.charData = charData;
    this.onFinish = onFinishCallback;
    this.onBackToMap = onBackToMapCallback;

    // P0-7 B1/B6：年龄自适应步骤序列（使用已导入的 ebbinghausManager，勿依赖未赋值的 window 钩子）
    const override = ebbinghausManager.progress?.settings?.stepSequenceOverride ?? null;
    this.stepSequence = typeof ebbinghausManager.getStepSequence === "function"
      ? ebbinghausManager.getStepSequence({ override })
      : [1, 2, 3, 4, 5, 6, 7, 8];
    this.currentStep = this.stepSequence[0] || 1;

    this.completedSteps = [];
    this.hanziEngine = null;
    this.prewriteEngine = null;
    this.activePlayGame = null;
    this._isRecordingTransition = false;
    // P0-2 B9：未完成朗读评测前不预设满星；跳过「读」步时保持 null，结业用保守默认
    this._evalStars = null;
    this._evalFromManual = false;

    // T8: 3 分钟微课断点续学
    const saved = this.loadProgress();
    if (saved && typeof saved.currentStep === "number" && this.stepSequence.includes(saved.currentStep)) {
      this.currentStep = saved.currentStep;
      this.completedSteps = Array.isArray(saved.completedSteps) ? saved.completedSteps : [];
    }
  }

  saveProgress() {
    if (!this.charData?.id) return;
    saveLearnProgress(this.charData.id, {
      completedSteps: this.completedSteps || [],
      currentStep: this.currentStep,
    });
  }

  loadProgress() {
    if (!this.charData?.id) return null;
    return loadLearnProgress(this.charData.id);
  }

  /**
   * Promise 风格的延时辅助函数（用于 async/await 动画序列）
   * @param {number} ms 毫秒
   * @returns {Promise}
   */
  _wait(ms) {
    return new Promise(resolve => {
      const id = setTimeout(resolve, ms);
      this._addCleanup(() => clearTimeout(id));
    });
  }

  markStepComplete(stepIdx) {
    if (!this.completedSteps.includes(stepIdx)) {
      this.completedSteps.push(stepIdx);
    }
    this.saveProgress();
  }

  clearProgress() {
    if (!this.charData?.id) return;
    clearLearnProgress(this.charData.id);
  }

  destroy() {
    if (this.activePlayGame?.destroy) {
      this.activePlayGame.destroy();
      this.activePlayGame = null;
    }
    if (this.hanziEngine) {
      this.hanziEngine.destroy();
      this.hanziEngine = null;
    }
    if (this.prewriteEngine) {
      this.prewriteEngine.destroy();
      this.prewriteEngine = null;
    }
    if (this.drillEngine?.destroy) {
      this.drillEngine.destroy();
      this.drillEngine = null;
    }
    if (this._volMeterTimer) {
      clearInterval(this._volMeterTimer);
      this._volMeterTimer = null;
    }
    if (this._countTimer) {
      clearInterval(this._countTimer);
      this._countTimer = null;
    }
    const pe = pronunciationEval || (typeof window !== "undefined" ? window.pronunciationEval : null);
    // P0 内存泄漏修复：stopAndEvaluate 已完整清理 MediaRecorder、流轨道、AnalyserNode 等资源
    if (pe && (pe.state === "listening" || pe.state === "evaluating")) {
      try { pe.stopAndEvaluate(); } catch {}
    }
    if (typeof document !== "undefined") {
      document.getElementById("mic-permission-modal")?.remove();
    }
    this._isChestOpening = false;
    try { soundAndFX.stopSpeaking(); } catch {}
    super.destroy();
  }

  render() {
    this.destroy();

    const __lnProgress = ebbinghausManager.progress;
    const __lnSpeakerIcon = soundAndFX.isMuted ? `<img src="/assets/images/icon_speaker_muted.jpg" class="w-5 h-5 rounded-full" alt="Muted" />` : `<img src="/assets/images/icon_speaker.jpg" class="w-5 h-5 rounded-full" alt="Speaker" />`;

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
        
        <header class="relative z-30 w-full px-4 sm:px-8 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b-2 border-white/20 flex-wrap gap-2">
          
          <button id="btn-learn-back-map" data-speak="返回大地图" aria-label="返回大地图" class="flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-white/50 touch-target cursor-pointer transform transition-transform hover:scale-105 active:scale-95">
            <img src="/assets/images/icon_red_door.jpg" alt="返回" class="w-12 h-12 sm:w-14 sm:h-14 object-cover" />
          </button>

          <div class="flex items-center gap-2 sm:gap-3 candy-pill px-4 sm:px-6 py-2 rounded-full">
            ${this.stepSequence
              .map(
                (stepNum) => {
                  const stepInfo = getLearnStepMeta(stepNum);
                  const isLast = stepNum === this.stepSequence[this.stepSequence.length - 1];
                  const isCurrent = stepNum === this.currentStep;
                  const isDone = this.completedSteps.includes(stepNum) || stepNum < this.currentStep;
                  return `
              <div class="flex items-center gap-1 sm:gap-1.5 cursor-pointer touch-target" data-speak="${escapeHtml(stepInfo.announcement)}" aria-label="${escapeHtml(stepInfo.announcement)}" title="${escapeHtml(stepInfo.announcement)}">
                <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 border-2 ${
                  isCurrent
                    ? "learn-step-current bg-gradient-to-tr from-yellow-300 via-orange-500 to-red-500 text-white border-white shadow-[0_0_20px_rgba(255,180,0,1)] scale-125 ring-4 ring-yellow-300 animate-pulse z-10 relative"
                    : isDone
                    ? "bg-gradient-to-tr from-emerald-500 to-teal-400 text-white border-white/80 shadow-md"
                    : "bg-white/15 text-white/40 border-white/20"
                }">
                  ${isDone && !isCurrent ? `<span class="flex items-center"><img src="/assets/images/icon_check.jpg" class="w-4 h-4 rounded-full" alt="Check" /></span>` : `<span class="flex items-center"><img src="${stepInfo.image}" class="w-5 h-5 rounded-full" alt="${stepInfo.name}" /></span>`}
                </div>
                <span class="text-xs sm:text-sm font-black ${isCurrent ? "text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" : "text-white/70"}">${stepInfo.name}</span>
                ${!isLast ? `<div class="w-2 sm:w-3 h-1 rounded-full ${isDone ? "bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-white/20"}"></div>` : ""}
              </div>
            `;
                }
              )
              .join("")}
          </div>

          <div class="flex items-center gap-2.5">
            ${(() => {
              const picUrl = getCharPictogramUrl(this.charData.char);
              return `
              <button id="btn-learn-current-char" data-speak="${escapeHtml(this.charData.char)}" aria-label="${escapeHtml(this.charData.char)}" class="btn-game-orange flex items-center gap-2 text-white font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-full cursor-pointer touch-target" title="点击听发音">
                ${picUrl ? `<img src="${picUrl}" alt="${escapeHtml(this.charData.char)}" class="w-7 h-7 rounded-full object-cover border border-white/80 shrink-0" />` : ""}
                <span class="text-xl sm:text-2xl text-yellow-100 font-serif leading-none drop-shadow">${escapeHtml(this.charData.char)}</span>
                <span class="w-4 h-4 shrink-0 flex items-center text-yellow-200"><img src="/assets/images/icon_speaker.jpg" class="w-4 h-4 rounded-full" alt="Speaker" /></span>
              </button>
              `;
            })()}
            <button id="btn-learn-sound" data-speak="声音开关" aria-label="声音开关" class="shell-nav-btn btn-game-wood w-10 h-10 sm:w-11 sm:h-11 rounded-full text-white flex items-center justify-center cursor-pointer" title="声音开关">
              ${__lnSpeakerIcon}
            </button>
            <div class="candy-pill shimmer-badge flex items-center gap-1.5 text-yellow-300 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-full">
              <img src="/assets/images/icon_coin.jpg" class="w-4 h-4 rounded-full" alt="Coin" /><span>${__lnProgress.coins}</span>
            </div>
            <div class="candy-pill shimmer-badge flex items-center gap-1.5 text-amber-300 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-full">
              <img src="/assets/images/icon_star.jpg" class="w-4 h-4 rounded-full" alt="Star" /><span>${__lnProgress.stars}</span>
            </div>
          </div>

        </header>

        <main id="learn-stage-container" class="relative z-10 flex-1 w-full flex items-center justify-center p-4">
        </main>

      </div>
    `;

    this.bindHeaderEvents();
    this.renderCurrentStep();
  }

  setStep(stepNum) {
    try { soundAndFX.stopSpeaking(); } catch {}
    try {
      this.markStepComplete(this.currentStep);
      this.currentStep = stepNum;
      this.saveProgress();
    } catch (e) {
      console.warn("[LearnModule] 保存进度失败:", e);
    }
    this.render();
  }

  /**
   * P0-7 辅助：在 stepSequence 中获取 fromStep 的下一个步骤编号
   * 用于替代所有硬编码的 this.currentStep++ 和 < 8 边界检查
   * @param {number} [fromStep] - 可选，默认 this.currentStep
   * @returns {number} 下一个步骤编号；如果已到末尾返回 -1
   */
  getNextStepInSequence(fromStep = this.currentStep) {
    const idx = this.stepSequence.indexOf(fromStep);
    if (idx < 0 || idx >= this.stepSequence.length - 1) return -1;
    return this.stepSequence[idx + 1];
  }

  /** P0-7 B1/B6 年龄自适应：推进到序列内的下一步（而非盲目的 currentStep++） */
  nextStep() {
    const next = this.getNextStepInSequence();
    
    try { soundAndFX.stopSpeaking(); } catch {}
    
    // P1-3: 3-minute micro-lesson logic
    if (!this.sessionStartTime) this.sessionStartTime = Date.now();
    const elapsedMinutes = (Date.now() - this.sessionStartTime) / 60000;
    
    try {
      this.markStepComplete(this.currentStep);
      
      if (next < 0 || elapsedMinutes >= 3) {
        // 微课完成 (已学完所有步骤，或时间到达3分钟)
        this.saveProgress();
        this.showMicroLessonComplete();
        return;
      }
      
      this.currentStep = next;
      this.saveProgress();
    } catch (e) {
      console.warn("[LearnModule] 保存进度失败:", e);
    }
    this.render();
  }

  showMicroLessonComplete() {
    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
        <div class="bg-black/60 backdrop-blur-md px-10 py-12 rounded-3xl border border-yellow-400 shadow-2xl flex flex-col items-center text-center max-w-lg">
          <div class="mb-6 animate-bounce-slow"><img src="/assets/images/icon_trophy.jpg" class="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 shadow-2xl" alt="Trophy" /></div>
          <h2 class="text-4xl font-black text-yellow-300 mb-4">微课完成！</h2>
          <p class="text-lg text-white font-bold mb-8">太棒了，你已经坚持学习了一段时间，进度已自动保存。让眼睛休息一下吧！</p>
          <div class="flex gap-4 w-full">
             <button id="btn-micro-continue" data-speak="继续学习" aria-label="继续学习" class="flex-1 btn-game-orange text-white font-black text-xl px-6 py-4 rounded-full shadow-lg active:scale-95 cursor-pointer">
               继续学习
             </button>
             <button id="btn-micro-back" data-speak="返回地图" aria-label="返回地图" class="flex-1 btn-game-wood text-white font-black text-xl px-6 py-4 rounded-full shadow-lg active:scale-95 cursor-pointer">
               返回地图
             </button>
          </div>
        </div>
      </div>
    `;
    
    soundAndFX.playVictoryFanfare?.();
    soundAndFX.triggerConfetti?.(this.container);

    const btnContinue = this.container.querySelector("#btn-micro-continue");
    if (btnContinue) {
      this._on(btnContinue, "click", () => {
        soundAndFX.playPop?.();
        this.sessionStartTime = Date.now(); // 重置时间
        const next = this.getNextStepInSequence();
        if (next < 0) {
           // 已经全部学完
           if (this.onFinish) this.onFinish();
        } else {
           this.currentStep = next;
           this.render();
        }
      });
    }

    const btnBack = this.container.querySelector("#btn-micro-back");
    if (btnBack) {
      this._on(btnBack, "click", () => {
        soundAndFX.playPop?.();
        if (this.onBackToMap) this.onBackToMap();
      });
    }
  }

  bindHeaderEvents() {
    // 使用 BaseModule 统一的返回按钮绑定
    const backBtn = this.container.querySelector("#btn-learn-back-map");
    if (backBtn) {
      this.bindBackButton(backBtn, {
        beforeEmit: () => {
          if (this.hanziEngine) this.hanziEngine.destroy();
        }
      });
    }

    const soundBtn = this.container.querySelector("#btn-learn-sound");
    if (soundBtn) {
      this._on(soundBtn, "click", () => {
        const muted = soundAndFX.toggleMute();
        soundBtn.innerHTML = muted ? `<img src="/assets/images/icon_speaker_muted.jpg" class="w-5 h-5 rounded-full" alt="Muted" />` : `<img src="/assets/images/icon_speaker.jpg" class="w-5 h-5 rounded-full" alt="Speaker" />`;
      });
    }
  }

  renderCurrentStep() {
    const stage = this.container.querySelector("#learn-stage-container");
    if (!stage) return;

    if (this.activePlayGame?.destroy) {
      this.activePlayGame.destroy();
      this.activePlayGame = null;
    }
    if (this.hanziEngine) {
      this.hanziEngine.destroy();
      this.hanziEngine = null;
    }
    if (this.prewriteEngine) {
      this.prewriteEngine.destroy();
      this.prewriteEngine = null;
    }
    if (this.drillEngine?.destroy) {
      this.drillEngine.destroy();
      this.drillEngine = null;
    }
    if (this._volMeterTimer) {
      clearInterval(this._volMeterTimer);
      this._volMeterTimer = null;
    }
    if (this._countTimer) {
      clearInterval(this._countTimer);
      this._countTimer = null;
    }
    const pe = pronunciationEval || (typeof window !== "undefined" ? window.pronunciationEval : null);
    // P0 内存泄漏修复：stopAndEvaluate 已完整清理 MediaRecorder、流轨道、AnalyserNode 等资源
    if (pe && (pe.state === "listening" || pe.state === "evaluating")) {
      try { pe.stopAndEvaluate(); } catch {}
    }

    switch (this.currentStep) {
      case 1:
        this.renderStepPlay(stage);
        break;
      case 2:
        this.renderStepRecognize(stage);
        break;
      case 3:
        this.renderStepRead(stage);
        break;
      case 4:
        this.renderStepPractice(stage);
        break;
      case 5:
        this.renderStepPrewrite(stage);
        break;
      case 6:
        this.renderStepTrace(stage);
        break;
      case 7:
        this.renderStepFreeWrite(stage);
        break;
      case 8:
        this.renderStepTestAndChest(stage);
        break;
    }

    // T16: 自动为当前步骤容器内的交互按钮绑定语音引导
    voiceGuide.attach(stage);
  }

  renderStepPlay(stage) { return renderStepPlay.call(this, stage); }
  renderStepRecognize(stage) { return renderStepRecognize.call(this, stage); }
  renderStepRead(stage) { return renderStepRead.call(this, stage); }
  _bindManualRating(stage) { return _bindManualRating.call(this, stage); }
  executeRecordToggle(stage) { return executeRecordToggle.call(this, stage); }
  _showRecordError(stage, reason) { return _showRecordError.call(this, stage, reason); }
  _showMicPermissionModal(stage) { return _showMicPermissionModal.call(this, stage); }
  _resetRecordUI(stage) { return _resetRecordUI.call(this, stage); }
  _showEvalResult(stage, res) { return _showEvalResult.call(this, stage, res); }
  renderStepPractice(stage) { return renderStepPractice.call(this, stage); }
  renderStepPrewrite(stage) { return renderStepPrewrite.call(this, stage); }
  renderStepTrace(stage) { return renderStepTrace.call(this, stage); }
  renderStepWrite(stage) { return renderStepWrite.call(this, stage); }
  renderStepFreeWrite(stage) { return renderStepFreeWrite.call(this, stage); }
  renderStepTestAndChest(stage) { return renderStepTestAndChest.call(this, stage); }
}

