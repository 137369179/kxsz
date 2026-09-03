/**
 * 凯茜识字 (Cathy Literacy) - 1:1 沉浸式六步闭环教学引擎
 * 核心特色：
 * 1. 玩：8大汉字专属物理情景交互 + 4阶段象形蜕变
 * 2. 认：3D Q弹果冻大字 + 偏旁部首拆解 + 词组例句实物小剧场
 * 3. 读：智能语音评测 + 麦克风动态声浪与倒计时 + 真实打分 + 双轨发音对比
 * 4. 练：太空战机激光射击 / 飞翔气球小游戏
 * 5. 写：AI 魔法星光毛笔描红 + 严格倒笔画阻断拦截 + 全屏 Confetti 礼炮
 * 6. 测：闪电速测 + 黄金宝箱降落 + 三星飞入“Duang! Duang! Duang!”
 */

import { HanziEngine } from "../utils/hanziEngine.js";
import { PrewriteEngine } from "../utils/prewriteEngine.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { BaseModule } from "../utils/BaseModule.js";
import { EVENTS } from "../utils/eventBus.js";
import { GAME_ICONS } from "../utils/gameIcons.js";
import { pronunciationEval } from "../utils/pronunciationEval.js";
import { openMorphTheater } from "../utils/morphEngine.js";
import { createPlayGame } from "../utils/playGames/index.js";
import { storageManager } from "../utils/storageManager.js";
import { mascotProgress } from "../utils/mascotProgress.js";
import { openEtymologyQuiz } from "../utils/etymologyQuiz.js";
import { buildEtymologyCard } from "../utils/etymologyEngine.js";
import { voiceGuide } from "../utils/voiceGuide.js";

export class LearnModule extends BaseModule {
  constructor(container, charData, onFinishCallback, onBackToMapCallback) {
    super(container);
    this.charData = charData;
    this.onFinish = onFinishCallback;
    this.onBackToMap = onBackToMapCallback;

    // B1/B6 铁律：8 步闭环（玩/认/读/练/控笔/描红/独立写/测）
    // 1:玩  2:认  3:读  4:练  5:控笔  6:描红  7:写  8:测
    this.currentStep = 1;
    this.completedSteps = [];
    this.hanziEngine = null;
    this.prewriteEngine = null;
    this.activePlayGame = null;
    this._isRecordingTransition = false;
    // P0-2 B9 铁律：存真实朗读评测分数，避免 completeCharacter 硬编码 3 星
    this._evalStars = 3;

    // T8: 3 分钟微课断点续学
    const saved = this.loadProgress();
    if (saved && typeof saved.currentStep === "number" && saved.currentStep >= 1 && saved.currentStep <= 8) {
      this.currentStep = saved.currentStep;
      this.completedSteps = Array.isArray(saved.completedSteps) ? saved.completedSteps : [];
    }
  }

  saveProgress() {
    if (!this.charData?.id) return;
    const saved = {
      charId: this.charData.id,
      completedSteps: this.completedSteps || [],
      currentStep: this.currentStep,
      lastUpdated: Date.now(),
    };
    storageManager.setItem(`learn_progress_${this.charData.id}`, saved);
  }

  loadProgress() {
    if (!this.charData?.id) return null;
    return storageManager.getItem(`learn_progress_${this.charData.id}`);
  }

  markStepComplete(stepIdx) {
    if (!this.completedSteps.includes(stepIdx)) {
      this.completedSteps.push(stepIdx);
    }
    this.saveProgress();
  }

  clearProgress() {
    if (!this.charData?.id) return;
    storageManager.removeItem(`learn_progress_${this.charData.id}`);
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
    if (pe && pe.state === "listening") {
      try { pe.stopAndEvaluate(); } catch {}
    }
    if (typeof document !== "undefined") {
      document.getElementById("mic-permission-modal")?.remove();
    }
    this._isChestOpening = false;
    super.destroy();
  }

  render() {
    this.destroy();

    const __lnProgress = ebbinghausManager.progress;
    const __lnSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker(true) : GAME_ICONS.speaker(false);

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
        
        <header class="relative z-30 w-full px-4 sm:px-8 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b-2 border-white/20 flex-wrap gap-2">
          
          <button id="btn-learn-back-map" class="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-[0_6px_20px_rgba(245,158,11,0.5)] border-2 border-white active:translate-y-0.5 active:scale-95 transition-all cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
            <span>返回大地图</span>
          </button>

          <div class="flex items-center gap-2 sm:gap-3 bg-black/60 backdrop-blur-md px-4 sm:px-6 py-2 rounded-full border-2 border-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            ${[
              { step: 1, name: "玩", iconSvg: (cls) => GAME_ICONS.gem(cls) },
              { step: 2, name: "认", iconSvg: (cls) => GAME_ICONS.cards(cls) },
              { step: 3, name: "读", iconSvg: (cls) => GAME_ICONS.speaker(cls) },
              { step: 4, name: "练", iconSvg: (cls) => GAME_ICONS.arcade(cls) },
              { step: 5, name: "控笔", iconSvg: (cls) => GAME_ICONS.hand(cls) },
              { step: 6, name: "描红", iconSvg: (cls) => GAME_ICONS.brush(cls) },
              { step: 7, name: "写", iconSvg: (cls) => GAME_ICONS.pen(cls) },
              { step: 8, name: "测", iconSvg: (cls) => GAME_ICONS.chest(cls) }
            ]
              .map(
                (s) => `
              <div class="flex items-center gap-1 sm:gap-1.5">
                <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 border-2 ${
                  s.step === this.currentStep
                    ? "bg-gradient-to-tr from-yellow-300 via-orange-500 to-red-500 text-white border-white shadow-[0_0_20px_rgba(255,180,0,1)] scale-115 ring-4 ring-yellow-300 animate-pulse"
                    : s.step < this.currentStep
                    ? "bg-gradient-to-tr from-emerald-500 to-teal-400 text-white border-white/80 shadow-md"
                    : "bg-white/15 text-white/40 border-white/20"
                }">
                  ${s.step < this.currentStep ? `<span class="flex items-center">${GAME_ICONS.star("w-4 h-4", false)}</span>` : `<span class="flex items-center">${s.iconSvg("w-4 h-4")}</span>`}
                </div>
                <span class="text-xs sm:text-sm font-black ${s.step === this.currentStep ? "text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" : "text-white/70"}">${s.name}</span>
                ${s.step < 8 ? `<div class="w-2 sm:w-3 h-1 rounded-full ${s.step < this.currentStep ? "bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-white/20"}"></div>` : ""}
              </div>
            `
              )
              .join("")}
          </div>

          <div class="flex items-center gap-2.5">
            <div class="flex items-center gap-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-full border-2 border-white shadow-xl">
              <span class="text-white/90">正在学:</span>
              <span class="text-xl sm:text-2xl text-yellow-100 font-serif leading-none drop-shadow">${this.charData.char}</span>
            </div>
            <button id="btn-learn-sound" class="w-10 h-10 sm:w-11 sm:h-11 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border-2 border-white/40 shadow-lg cursor-pointer" title="声音开关">
              ${__lnSpeakerIcon}
            </button>
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-full bg-black/40 border-2 border-white/30 shadow-md">
              ${GAME_ICONS.coin("w-4 h-4")}<span>${__lnProgress.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-full bg-black/40 border-2 border-white/30 shadow-md">
              ${GAME_ICONS.star("w-4 h-4", false)}<span>${__lnProgress.stars}</span>
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
    this.markStepComplete(this.currentStep);
    this.currentStep = stepNum;
    this.saveProgress();
    this.render();
  }

  /** B1/B6 8 步闭环：推进到下一步（上限 8） */
  nextStep() {
    if (this.currentStep < 8) {
      this.markStepComplete(this.currentStep);
      this.currentStep++;
      this.saveProgress();
      this.render();
    }
  }

  bindHeaderEvents() {
    const backBtn = this.container.querySelector("#btn-learn-back-map");
    if (backBtn) {
      this._on(backBtn, "click", () => {
        soundAndFX.playPop();
        if (this.hanziEngine) this.hanziEngine.destroy();
        if (this.onBackToMap) this.onBackToMap();
        else this._busEmit(EVENTS.SWITCH_MODE, { mode: "map" });
      });
    }

    const soundBtn = this.container.querySelector("#btn-learn-sound");
    if (soundBtn) {
      this._on(soundBtn, "click", () => {
        const muted = soundAndFX.toggleMute();
        soundBtn.innerHTML = muted ? GAME_ICONS.speaker(true) : GAME_ICONS.speaker(false);
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
    if (pe && pe.state === "listening") {
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

  // ----------------------------------------------------------------
  // STEP 1: 玩 (儿童专属五大沉浸式情景游戏 + 4阶段象形蜕变)
  // ----------------------------------------------------------------
  renderStepPlay(stage) {
    const char = this.charData;
    if (this.activePlayGame) {
      this.activePlayGame.destroy();
      this.activePlayGame = null;
    }

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-sky-400 via-amber-200 to-orange-300 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col items-center justify-between p-4 animate-fade-in text-center select-none">
        
        <div id="play-interactive-stage" class="relative z-10 w-full flex-1 flex flex-col items-center justify-center"></div>

                ${(() => {
            const _etym = buildEtymologyCard(char);
            return `
        <div id="evolution-reveal-box" class="absolute inset-0 bg-black/88 backdrop-blur-md rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center text-white hidden animate-scale-up z-30 overflow-auto">
          <span class="bg-orange-500 text-white font-black text-xs px-4 py-1 rounded-full mb-2 shadow flex-shrink-0">字源 4 阶段演变！</span>

          <!-- 4 阶段 timeline -->
          <div class="flex items-center gap-2 sm:gap-3 my-2 flex-wrap justify-center">
            ${_etym.stages.map((s, i) => `
              <div class="flex flex-col items-center flex-shrink-0">
                <span class="text-[10px] sm:text-xs text-yellow-300 font-bold mb-0.5">${s.label}</span>
                <span class="text-[9px] text-white/50 mb-1">${s.age}</span>
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-amber-950 flex items-center justify-center text-3xl sm:text-4xl font-black shadow-inner border-2"
                     style="background:${s.key==='modern'?'linear-gradient(135deg,#fbbf24,#f97316)':'#fef3c7'};border-color:${s.color};${s.key==='modern'?'color:white;border-color:white;border-width:3px;':''}">
                  ${s.glyph}
                </div>
                ${i < _etym.stages.length - 1 ? '<span class="text-orange-400 font-black text-xl mt-1 hidden sm:block">→</span>' : ''}
              </div>
            `).join('')}
          </div>

          <!-- 口诀 + 易错提示 -->
          <div class="flex gap-2 sm:gap-3 mt-2 w-full max-w-3xl flex-wrap justify-center flex-shrink-0">
            <button id="btn-chant" class="bg-amber-100 text-amber-950 font-black text-xs sm:text-sm px-3 sm:px-5 py-2 rounded-full shadow-md border-2 border-amber-300 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer">
              ${GAME_ICONS.speaker("w-3.5 h-3.5")}
              <span>口诀：${_etym.mnemonic.chant}</span>
            </button>
            ${_etym.confusing.hasConfusables ? `
              <div class="bg-rose-100/90 text-rose-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-md border-2 border-rose-300 flex items-center gap-1.5">
                <span>⚠️ 别搞混：</span>
                ${_etym.confusing.pairs.map(p => `<span class="font-black text-rose-950">${p.other}${p.otherPinyin?'('+p.otherPinyin+')':''}</span>`).join(' ')}
              </div>
            ` : ''}
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-3 mt-3 flex-shrink-0">
            <button id="btn-open-morph-play" class="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-2xl border-2 border-white active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
              ${GAME_ICONS.sparkle("w-4 h-4")} 动效微剧场
            </button>
            <button id="btn-next-to-rec" class="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-black text-xs sm:text-sm px-6 sm:px-8 py-2.5 sm:py-3 rounded-full shadow-2xl border-2 border-white active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
              ${GAME_ICONS.sparkle("w-4 h-4")} 去认字
            </button>
          </div>
        </div>
            `;
          })()}

      </div>
    `;

    const interactiveStage = stage.querySelector("#play-interactive-stage");
    const revealBox = stage.querySelector("#evolution-reveal-box");
    const morphBtn = stage.querySelector("#btn-open-morph-play");
    const nextBtn = stage.querySelector("#btn-next-to-rec");

    // 智能分发并挂载五大游戏之一
    this.activePlayGame = createPlayGame(interactiveStage, char, () => {
      this._timeout(() => {
        if (revealBox) revealBox.classList.remove("hidden");
      }, 500);
    });
    this.activePlayGame.mount();

    if (morphBtn) {
      this._on(morphBtn, "click", () => {
        soundAndFX.playPop();
        openMorphTheater(char);
      });
    }

    // E12: 口诀朗读按钮
    const chantBtn = stage.querySelector("#btn-chant");
    if (chantBtn) {
      this._on(chantBtn, "click", () => {
        soundAndFX.playPop();
        const card = buildEtymologyCard(char);
        soundAndFX.speakPriority(card.mnemonic.chant, { kind: "sentence", emotion: "gentle" });
        chantBtn.classList.add("ring-4", "ring-yellow-300");
        this._timeout(() => chantBtn.classList.remove("ring-4", "ring-yellow-300"), 600);
      });
    }

    if (nextBtn) {
      this._on(nextBtn, "click", () => {
        soundAndFX.playPop();
        this.currentStep = 2;
        this.render();
      });
    }
  }

  // ----------------------------------------------------------------
  // STEP 2: 认 (3D Q弹果冻大字 + 声母韵母 + 词语百宝箱)
  // ----------------------------------------------------------------
  renderStepRecognize(stage) {
    const char = this.charData;
    soundAndFX.speakPriority(`认一认：“${char.char}”，拼音读作 ${char.pinyin}。点击大字听发音！`, { kind: "sentence", emotion: "gentle" });

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex items-center justify-between p-8 animate-fade-in select-none">
        
        <div class="flex-1 flex flex-col items-center justify-center">
          <div class="text-4xl text-yellow-300 font-black tracking-widest mb-3 bg-black/40 px-6 py-1.5 rounded-full border border-white/20 animate-pulse">
            ${char.pinyin}
          </div>

          <button id="btn-jelly-char" class="relative group w-56 h-56 sm:w-64 sm:h-64 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 border-4 border-white shadow-[0_0_60px_rgba(255,160,0,0.8)] flex items-center justify-center text-9xl sm:text-[10rem] font-black text-white active:scale-90 transition-transform cursor-pointer animate-bounce-cathy">
            ${char.char}
            <div class="absolute -bottom-2 bg-amber-900 text-yellow-200 text-[10px] font-black px-3 py-0.5 rounded-full border border-yellow-400">
              点击发音 ${GAME_ICONS.speaker("w-4 h-4 inline-block")}
            </div>
          </button>

          <div class="flex items-center gap-3 mt-4">
            <span class="bg-white/20 text-white text-xs font-black px-4 py-1.5 rounded-full border border-white/30 flex items-center gap-1.5">
              ${GAME_ICONS.sparkle("w-4 h-4")} <span>共 ${char.strokeCount || 4} 笔</span>
            </span>
            <span class="bg-white/20 text-white text-xs font-black px-4 py-1.5 rounded-full border border-white/30 flex items-center gap-1.5">
              ${GAME_ICONS.gem("w-4 h-4")} <span>偏旁 [${char.radical || char.char}]</span>
            </span>
          </div>

          <div class="flex items-center gap-2.5 mt-4">
            <button id="btn-open-morph-rec" class="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white text-xs font-black px-4 py-2 rounded-full shadow-lg border-2 border-white/40 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
              <span>字源微剧场</span>
            </button>
            <button id="btn-goto-pinyin-island" class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black px-4 py-2 rounded-full shadow-lg border-2 border-white/40 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer" title="前往拼音乐园复习此拼音">
              <span class="flex items-center">${GAME_ICONS.mic("w-4 h-4")}</span>
              <span>拼音岛复习</span>
            </button>
          </div>
        </div>

        <div class="w-88 sm:w-96 flex flex-col justify-between h-full bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/30">
          <div>
            <h3 class="text-sm font-black text-yellow-300 mb-3 flex items-center gap-2">
              <span class="flex items-center">${GAME_ICONS.chest("w-5 h-5")}</span>
              <span>生活词语百宝箱：</span>
            </h3>
            
            <div class="flex flex-col gap-2.5">
              ${char.words
                .map(
                  (w) => `
                <button class="word-balloon-btn p-3 bg-gradient-to-r from-amber-50 to-orange-100 hover:from-yellow-200 hover:to-orange-300 rounded-2xl border-2 border-amber-300 text-left flex items-center justify-between shadow-md active:scale-95 transition-all cursor-pointer" data-word="${w.word}">
                  <div>
                    <span class="text-xs font-bold text-amber-700">${w.pinyin}</span>
                    <h4 class="text-base font-black text-amber-950">${w.word}</h4>
                  </div>
                  <span class="flex items-center">${GAME_ICONS.speaker("w-4 h-4")}</span>
                </button>
              `
                )
                .join("")}
            </div>

            <div id="sentence-card" class="mt-4 p-3 bg-black/40 hover:bg-black/60 rounded-2xl border border-white/20 text-xs text-yellow-200 font-semibold leading-relaxed cursor-pointer transition-all active:scale-95" title="点击朗读例句">
              <div class="flex items-center gap-1.5 text-amber-300 font-black mb-1">
                ${GAME_ICONS.pen("w-4 h-4")} <span>趣味造句</span>
              </div>
              <p class="text-white/90 text-xs leading-relaxed">${char.sentence}</p>
            </div>
          </div>

          <button id="btn-finish-rec-step" class="mt-4 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white font-black text-base py-3.5 rounded-full shadow-[0_8px_25px_rgba(245,158,11,0.5)] border-2 border-white active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer hover:brightness-105">
            <span class="flex items-center">${GAME_ICONS.star("w-5 h-5", false)}</span>
            <span>掌握认字！开启跟读评测</span>
          </button>
        </div>

      </div>
    `;

    const jellyBtn = stage.querySelector("#btn-jelly-char");
    if (jellyBtn) {
      this._on(jellyBtn, "click", () => {
        soundAndFX.playJellyBoing();
        soundAndFX.speakPriority(`${char.char}，${char.pinyin}`, { kind: "char", priority: 1 });
        soundAndFX.triggerConfetti(this.container);
        jellyBtn.classList.remove("animate-bounce-cathy");
        jellyBtn.classList.add("scale-x-125", "scale-y-75");
        this._timeout(() => {
          jellyBtn.classList.remove("scale-x-125", "scale-y-75");
          jellyBtn.classList.add("scale-x-85", "scale-y-115");
          this._timeout(() => {
            jellyBtn.classList.remove("scale-x-85", "scale-y-115");
            jellyBtn.classList.add("animate-bounce-cathy");
          }, 150);
        }, 120);
      });
    }

    stage.querySelectorAll(".word-balloon-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        const word = btn.dataset.word;
        soundAndFX.playPop();
        soundAndFX.speakPriority(word, { kind: "word", priority: 1 });
        btn.classList.add("ring-2", "ring-yellow-400");
        this._timeout(() => btn.classList.remove("ring-2", "ring-yellow-400"), 400);
      });
    });

    const sentenceCard = stage.querySelector("#sentence-card");
    if (sentenceCard) {
      this._on(sentenceCard, "click", () => {
        soundAndFX.playPop();
        soundAndFX.speakPriority(char.sentence, { kind: "sentence", emotion: "gentle" });
        sentenceCard.classList.add("ring-2", "ring-yellow-400", "bg-black/60");
        this._timeout(() => sentenceCard.classList.remove("ring-2", "ring-yellow-400", "bg-black/60"), 800);
      });
    }

    const morphRecBtn = stage.querySelector("#btn-open-morph-rec");
    if (morphRecBtn) {
      this._on(morphRecBtn, "click", () => {
        soundAndFX.playPop();
        openMorphTheater(char);
      });
    }

    const pinyinIslandBtn = stage.querySelector("#btn-goto-pinyin-island");
    if (pinyinIslandBtn) {
      this._on(pinyinIslandBtn, "click", () => {
        soundAndFX.playPop();
        soundAndFX.speakPriority(`去拼音乐园复习拼音“${char.pinyin}”吧！`, { kind: "sentence", emotion: "gentle" });
        this._busEmit(EVENTS.SWITCH_MODE, { mode: "pinyin", highlightPinyin: char.pinyin });
      });
    }

    const finishBtn = stage.querySelector("#btn-finish-rec-step");
    if (finishBtn) {
      this._on(finishBtn, "click", () => {
        soundAndFX.playPop();
        // T15: 认字后进入跟读评测前，进行启发式字理问答微交互
        if (!this._etymologyQuizAnswered) {
          this._etymologyQuizAnswered = true;
          openEtymologyQuiz(char, () => {
            this.currentStep = 3;
            this.render();
          });
          return;
        }
        this.currentStep = 3;
        this.render();
      });
    }
  }

  // ----------------------------------------------------------------
  // STEP 3: 读 (智能语音评测 - 洪恩识字 1:1 沉浸式录音与回放系统)
  // ----------------------------------------------------------------
  renderStepRead(stage) {
    const char = this.charData;
    soundAndFX.speakPriority(`读一读：“${char.char}”，点击麦克风大声朗读！`, { kind: "sentence", emotion: "gentle" });

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-sky-300 flex items-center justify-between p-8 animate-fade-in select-none">
        
        <div class="flex-1 flex flex-col items-center justify-center pr-6 border-r border-white/10">
          <div class="text-3xl text-yellow-300 font-black tracking-widest mb-3 bg-black/40 px-6 py-1.5 rounded-full border border-white/20 animate-pulse">
            ${char.pinyin}
          </div>

          <button id="read-char-circle" class="relative group w-52 h-52 sm:w-60 sm:h-60 rounded-3xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 border-4 border-white shadow-[0_0_50px_rgba(56,189,248,0.7)] flex items-center justify-center text-9xl sm:text-[10rem] font-black text-white active:scale-95 transition-all cursor-pointer animate-bounce-cathy" title="点击听示范发音">
            ${char.char}
            <div class="absolute -bottom-2.5 bg-blue-950 text-sky-200 text-[10px] font-black px-3.5 py-0.5 rounded-full border border-sky-400 flex items-center gap-1 shadow-md">
              <span>示范发音</span>
              <span class="w-3.5 h-3.5 inline-block">${GAME_ICONS.speaker("w-3.5 h-3.5")}</span>
            </div>
          </button>

          <div class="flex items-center gap-3 mt-6">
            <span class="bg-white/15 text-white/90 text-xs font-black px-3.5 py-1 rounded-full border border-white/20">部首：${char.radical}</span>
            <span class="bg-white/15 text-white/90 text-xs font-black px-3.5 py-1 rounded-full border border-white/20">笔画：${char.strokeCount || 4}画</span>
          </div>
        </div>

        <div id="read-eval-panel" class="w-[380px] flex flex-col justify-between h-full bg-white/10 backdrop-blur-xl rounded-3xl p-6 border-2 border-white/30 text-center relative overflow-hidden">
          
          <div class="z-10">
            <h3 id="read-panel-title" class="text-base font-black text-yellow-300 mb-1 flex items-center justify-center gap-1.5">
              <span>${GAME_ICONS.audio("w-4 h-4 inline-block")} 语音评测挑战</span>
            </h3>
            <p id="record-guide-text" class="text-xs text-sky-100 font-bold leading-relaxed">
              点击麦克风，大声读出“<strong class="text-yellow-300 text-sm font-black">${char.char}</strong>”！
            </p>
          </div>

          <div class="my-auto flex flex-col items-center justify-center relative py-2 z-10 w-full">
            
            <div id="mic-interaction-zone" class="flex flex-col items-center justify-center relative w-full">
              <div id="mic-wave-ripples" class="absolute w-32 h-32 rounded-full bg-rose-500/30 -z-0 pointer-events-none hidden">
                <div class="absolute inset-0 rounded-full bg-rose-400/20 animate-ping"></div>
                <div class="absolute -inset-4 rounded-full bg-rose-400/15 animate-ping" style="animation-delay: 0.3s"></div>
              </div>

              <div class="relative w-36 h-36 flex items-center justify-center">
                <canvas id="record-countdown-ring" width="144" height="144" class="absolute inset-0 w-full h-full pointer-events-none z-20 hidden"></canvas>

                <button id="btn-start-record" class="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-rose-500 via-red-500 to-orange-400 shadow-[0_10px_30px_rgba(244,63,94,0.7)] flex items-center justify-center border-4 border-white active:scale-90 transition-all hover:scale-105 cursor-pointer">
                  <div id="mic-icon-wrapper" class="w-12 h-12 text-white flex items-center justify-center pointer-events-none">
                    ${GAME_ICONS.audio("w-12 h-12")}
                  </div>
                </button>
              </div>

              <div id="record-vol-bars" class="flex items-center gap-1.5 mt-4 h-6 hidden">
                <div class="vol-bar w-1.5 bg-emerald-400 rounded-full transition-all duration-75" style="height: 20%"></div>
                <div class="vol-bar w-1.5 bg-lime-300 rounded-full transition-all duration-75" style="height: 50%"></div>
                <div class="vol-bar w-1.5 bg-yellow-300 rounded-full transition-all duration-75" style="height: 80%"></div>
                <div class="vol-bar w-1.5 bg-amber-400 rounded-full transition-all duration-75" style="height: 90%"></div>
                <div class="vol-bar w-1.5 bg-yellow-300 rounded-full transition-all duration-75" style="height: 70%"></div>
                <div class="vol-bar w-1.5 bg-lime-300 rounded-full transition-all duration-75" style="height: 40%"></div>
                <div class="vol-bar w-1.5 bg-emerald-400 rounded-full transition-all duration-75" style="height: 20%"></div>
              </div>

              <div id="record-audio-cue" class="mt-2 text-[11px] font-black text-emerald-300 hidden animate-bounce bg-emerald-950/80 border border-emerald-400/50 px-3 py-0.5 rounded-full shadow-lg">
                听到声音啦，继续读！
              </div>

              <div id="record-interim-text" class="mt-2 text-xs font-black text-emerald-300 h-5 transition-opacity duration-300 opacity-0"></div>

              <div id="record-status" class="mt-2 text-xs font-black text-rose-200 tracking-wider">
                点击开始录音
              </div>

              <div id="record-error-text" class="mt-2 text-xs font-black text-rose-300 hidden"></div>
            </div>

            <div id="manual-rating-panel" class="hidden flex flex-col items-center justify-center w-full py-4 animate-fade-in">
              <p class="text-xs text-sky-100 font-bold mb-3 leading-relaxed">当前浏览器不支持语音识别<br/>请给自己打分吧！</p>
              <div id="manual-stars-row" class="flex items-center gap-3">
                <button class="manual-star-btn p-1 transition-transform hover:scale-110 active:scale-90 cursor-pointer" data-stars="1">${GAME_ICONS.star("w-8 h-8", false)}</button>
                <button class="manual-star-btn p-1 transition-transform hover:scale-110 active:scale-90 cursor-pointer" data-stars="2">${GAME_ICONS.star("w-10 h-10", false)}</button>
                <button class="manual-star-btn p-1 transition-transform hover:scale-110 active:scale-90 cursor-pointer" data-stars="3">${GAME_ICONS.star("w-8 h-8", false)}</button>
              </div>
              <p id="manual-rating-status" class="mt-2 text-xs font-black text-yellow-300 h-5"></p>
            </div>

            <div id="read-result-box" class="hidden w-full flex flex-col items-center animate-scale-up bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
              <div id="read-stars-container" class="flex items-center justify-center gap-2 mb-1.5">
                <div class="star-item text-3xl animate-bounce" style="animation-delay: 0.1s">${GAME_ICONS.star(false)}</div>
                <div class="star-item text-4xl animate-bounce" style="animation-delay: 0.2s">${GAME_ICONS.star(false)}</div>
                <div class="star-item text-3xl animate-bounce" style="animation-delay: 0.3s">${GAME_ICONS.star(false)}</div>
              </div>
              <div class="text-3xl font-black text-yellow-300 drop-shadow-md">
                <span id="read-score-num">100</span> <span class="text-sm font-bold">分</span>
              </div>
              <div id="read-praise-text" class="text-xs font-black text-white/90 mt-1 leading-relaxed text-center">
                发音真标准，太厉害了！
              </div>
              
              <div id="read-diagnostics-bar" class="w-full grid grid-cols-3 gap-2 my-2.5 bg-black/40 p-2 rounded-xl border border-white/15 text-center">
                <div class="flex flex-col items-center">
                  <span class="text-[10px] text-gray-300 font-bold">拼音准确</span>
                  <span id="diag-score-accuracy" class="text-xs font-black text-amber-300">--%</span>
                </div>
                <div class="flex flex-col items-center border-x border-white/20">
                  <span class="text-[10px] text-gray-300 font-bold">声调饱满</span>
                  <span id="diag-score-tone" class="text-xs font-black text-emerald-300">--%</span>
                </div>
                <div class="flex flex-col items-center">
                  <span class="text-[10px] text-gray-300 font-bold">吐字流利</span>
                  <span id="diag-score-fluency" class="text-xs font-black text-cyan-300">--%</span>
                </div>
              </div>

              <div class="flex items-center gap-2.5 mt-3 w-full justify-center">
                <button id="btn-replay-my-voice" class="bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black px-3.5 py-1.5 rounded-full shadow-md border border-white flex items-center gap-1 active:scale-95 transition-all cursor-pointer" title="听听刚刚录下的发音">
                  <span id="replay-voice-icon" class="w-3.5 h-3.5 inline-block">${GAME_ICONS.speaker("w-3.5 h-3.5")}</span>
                  <span id="replay-voice-text">听我的声音</span>
                </button>
                <button id="btn-play-standard-voice" class="bg-sky-500 hover:bg-sky-400 text-white text-xs font-black px-3 py-1.5 rounded-full border border-white/50 flex items-center gap-1 active:scale-95 transition-all cursor-pointer" title="听老师标准发音">
                  <span>${GAME_ICONS.speaker("w-3.5 h-3.5 inline-block")} 听示范</span>
                </button>
                <button id="btn-retry-record" class="bg-white/20 hover:bg-white/30 text-white text-xs font-black px-3 py-1.5 rounded-full border border-white/30 active:scale-95 transition-all cursor-pointer">
                  <span>重录</span>
                </button>
              </div>
            </div>

          </div>

          <div class="z-10">
            <button id="btn-finish-read-step" class="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white font-black text-sm py-3 rounded-full shadow-lg border-2 border-white active:scale-95 transition-all flex items-center justify-center gap-2 opacity-50 pointer-events-none cursor-pointer">
              <span class="w-4 h-4 inline-block">${GAME_ICONS.sparkle("w-4 h-4")}</span>
              <span>开启特训练字 (+5 金币)</span> 
            </button>
          </div>

        </div>

      </div>
    `;

    const pe = pronunciationEval || (typeof window !== "undefined" ? window.pronunciationEval : null);
    const btnRecord = stage.querySelector("#btn-start-record");
    const charCircle = stage.querySelector("#read-char-circle");
    const finishBtn = stage.querySelector("#btn-finish-read-step");
    const retryRecordBtn = stage.querySelector("#btn-retry-record");
    const replayVoiceBtn = stage.querySelector("#btn-replay-my-voice");
    const standardVoiceBtn = stage.querySelector("#btn-play-standard-voice");
    const replayVoiceText = stage.querySelector("#replay-voice-text");

    if (charCircle) {
      this._on(charCircle, "click", () => {
        soundAndFX.playPop();
        soundAndFX.speakPriority(`${char.char}，${char.pinyin}`, { kind: "char", priority: 1 });
      });
    }

    // 录音触发与逻辑绑定
    if (btnRecord) {
      this._on(btnRecord, "click", () => {
        if (soundAndFX.synth) soundAndFX.synth.cancel();
        this.executeRecordToggle(stage);
      });
    }

    // 听我的声音回放
    if (replayVoiceBtn) {
      this._on(replayVoiceBtn, "click", () => {
        soundAndFX.playPop();
        const pe = pronunciationEval || window.pronunciationEval;
        if (pe && pe._lastResult && pe._lastResult.audioUrl) {
          const audio = new Audio(pe._lastResult.audioUrl);
          replayVoiceBtn.classList.add("ring-4", "ring-yellow-300", "scale-105");
          if (replayVoiceText) replayVoiceText.textContent = "正在播放原声...";
          
          const resetReplayBtn = () => {
            replayVoiceBtn.classList.remove("ring-4", "ring-yellow-300", "scale-105");
            if (replayVoiceText) replayVoiceText.textContent = "听我的声音";
          };
          audio.onended = resetReplayBtn;
          audio.onerror = () => {
            resetReplayBtn();
            soundAndFX.speakPriority(char.char, { kind: "char", priority: 1 });
          };
          audio.play().catch(() => {
            resetReplayBtn();
            soundAndFX.speakPriority(char.char, { kind: "char", priority: 1 });
          });
        } else {
          soundAndFX.speakPriority(char.char, { kind: "char", priority: 1 });
        }
      });
    }

    // 听示范发音
    if (standardVoiceBtn) {
      this._on(standardVoiceBtn, "click", () => {
        soundAndFX.playPop();
        soundAndFX.speakPriority(`${char.char}，${char.pinyin}`, { kind: "char", priority: 1 });
      });
    }

    // 重新录制 / 重新评分
    if (retryRecordBtn) {
      this._on(retryRecordBtn, "click", () => {
        soundAndFX.playPop();
        const resultBox = stage.querySelector("#read-result-box");
        const micZone = stage.querySelector("#mic-interaction-zone");
        const manualPanel = stage.querySelector("#manual-rating-panel");
        const statusTxt = stage.querySelector("#record-status");
        const asrSupported = pe && typeof pe.isSupported === "function" && pe.isSupported();
        if (resultBox) resultBox.classList.add("hidden");
        if (asrSupported) {
          if (micZone) micZone.classList.remove("hidden");
          if (manualPanel) manualPanel.classList.add("hidden");
          if (statusTxt) {
            statusTxt.textContent = "点击开始录音";
            statusTxt.className = "mt-2 text-xs font-black text-rose-200 tracking-wider";
          }
          this.executeRecordToggle(stage);
        } else {
          if (micZone) micZone.classList.add("hidden");
          if (manualPanel) manualPanel.classList.remove("hidden");
        }
      });
    }

    // 完成读字，奖励金币并进入第 4 步（练字）
    if (finishBtn) {
      this._on(finishBtn, "click", () => {
        soundAndFX.playSuccessSound();
        ebbinghausManager.addCoins(5);
        ebbinghausManager.save();
        soundAndFX.triggerCoinFly(finishBtn, 5);
        this._timeout(() => {
          this.currentStep = 4;
          this.render();
        }, 500);
      });
    }

    // ASR 可用性检测：不支持时展示手动三星评分面板
    const asrSupported = pe && typeof pe.isSupported === "function" && pe.isSupported();
    const micZone = stage.querySelector("#mic-interaction-zone");
    const manualPanel = stage.querySelector("#manual-rating-panel");
    const panelTitle = stage.querySelector("#read-panel-title");

    if (!asrSupported) {
      if (micZone) micZone.classList.add("hidden");
      if (manualPanel) manualPanel.classList.remove("hidden");
      if (panelTitle) panelTitle.innerHTML = `<span>${GAME_ICONS.star("w-4 h-4 inline-block")} 手动发音自评</span>`;
      this._bindManualRating(stage);
    } else {
      if (manualPanel) manualPanel.classList.add("hidden");
    }
  }

  /**
   * 绑定手动三星评分（Safari / 无 ASR 环境）
   */
  _bindManualRating(stage) {
    const pe = pronunciationEval || window.pronunciationEval;
    const starsRow = stage.querySelector("#manual-stars-row");
    const status = stage.querySelector("#manual-rating-status");
    if (!starsRow || !pe) return;

    starsRow.querySelectorAll(".manual-star-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        const stars = parseInt(btn.dataset.stars, 10);
        soundAndFX.playPop();
        starsRow.querySelectorAll(".manual-star-btn").forEach((b, idx) => {
          b.classList.toggle("grayscale", idx + 1 > stars);
          b.classList.toggle("opacity-50", idx + 1 > stars);
        });
        if (status) status.textContent = `${stars} 颗星！`;

        const char = this.charData;
        const res = pe.manualEvaluate({ text: char.char, stars });
        this._timeout(() => this._showEvalResult(stage, res), 300);
      });
    });
  }

  /**
   * 洪恩风格交互录音状态机执行器
   */
  async executeRecordToggle(stage) {
    if (this._isRecordingTransition) return;
    const char = this.charData;
    const pe = pronunciationEval || window.pronunciationEval;
    if (!pe) return;

    const btnRecord = stage.querySelector("#btn-start-record");
    const statusTxt = stage.querySelector("#record-status");
    const ripples = stage.querySelector("#mic-wave-ripples");
    const volBars = stage.querySelector("#record-vol-bars");
    const countdownRing = stage.querySelector("#record-countdown-ring");
    const audioCue = stage.querySelector("#record-audio-cue");
    const resultBox = stage.querySelector("#read-result-box");
    const micZone = stage.querySelector("#mic-interaction-zone");

    // 1. 若当前正在录音，点击提前停止并立即结算评测
    if (pe.state === "listening") {
      this._isRecordingTransition = true;
      if (statusTxt) {
        statusTxt.textContent = "正在计算发音评分...";
        statusTxt.className = "mt-2 text-xs font-black text-amber-300 animate-pulse";
      }
      if (this._volMeterTimer) { clearInterval(this._volMeterTimer); this._volMeterTimer = null; }
      if (this._countTimer) { clearInterval(this._countTimer); this._countTimer = null; }
      ripples?.classList.add("hidden");
      volBars?.classList.add("hidden");
      countdownRing?.classList.add("hidden");
      audioCue?.classList.add("hidden");
      try {
        const res = await pe.stopAndEvaluate();
        if (res) this._showEvalResult(stage, res);
      } catch (e) {}
      this._isRecordingTransition = false;
      return;
    }

    // 2. 开启录音流程
    this._isRecordingTransition = true;
    soundAndFX.playPop();
    resultBox?.classList.add("hidden");
    micZone?.classList.remove("hidden");
    ripples?.classList.remove("hidden");
    volBars?.classList.remove("hidden");
    countdownRing?.classList.remove("hidden");
    audioCue?.classList.add("hidden");
    if (btnRecord) {
      btnRecord.className = "relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-green-400 shadow-[0_10px_30px_rgba(16,185,129,0.7)] flex items-center justify-center border-4 border-white active:scale-90 transition-all hover:scale-105 cursor-pointer ring-4 ring-emerald-300";
    }

    if (statusTxt) {
      statusTxt.textContent = "正在启动麦克风...";
      statusTxt.className = "mt-2 text-xs font-black text-yellow-300 animate-pulse";
    }

    let started = false;
    try {
      const startRes = await pe.startEvaluation({
        text: char.char,
        mode: "char",
        maxDurationMs: 3200,
        silenceTimeoutMs: 2500,
        onResult: ({ transcript, isFinal }) => {
          const interim = stage.querySelector("#record-interim-text");
          if (interim) {
            interim.textContent = isFinal ? "" : `识别到：${transcript}`;
            interim.classList.toggle("opacity-0", !transcript || isFinal);
          }
        }
      });
      started = startRes && startRes.ok;
      if (!started) {
        this._showRecordError(stage, startRes?.reason || "start_failed");
        this._resetRecordUI(stage);
        this._isRecordingTransition = false;
        return;
      }
    } catch (e) {
      console.warn("[LearnModule] startEvaluation error:", e);
      this._showRecordError(stage, "exception");
      this._resetRecordUI(stage);
      this._isRecordingTransition = false;
      return;
    }
    this._isRecordingTransition = false;

    // 麦克风已成功接入，正式开始 3.2 秒倒计时与实时声学动态频谱
    const totalDuration = 3200;
    const startTime = performance.now();
    let countdown = 3;
    if (statusTxt) {
      statusTxt.textContent = `正在听你读 (${countdown}s)... 大声读【${char.char}】`;
      statusTxt.className = "mt-2 text-xs font-black text-emerald-300 animate-pulse";
    }

    if (this._volMeterTimer) clearInterval(this._volMeterTimer);
    const bars = volBars?.querySelectorAll(".vol-bar");
    const circumference = 301.6;

    this._volMeterTimer = setInterval(() => {
      if (pe.state !== "listening") return;
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / totalDuration);
      
      // 更新 Canvas 倒计时环 (Zero SVG)
      if (countdownRing && countdownRing.getContext) {
        const ctx = countdownRing.getContext("2d");
        ctx.clearRect(0, 0, 144, 144);
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#34d399";
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(72, 72, 64, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - progress));
        ctx.stroke();
      }

      // 实时音频音量分析
      const vol = pe.getLiveVolume();
      if (bars) {
        bars.forEach((bar, idx) => {
          const height = Math.max(15, Math.min(100, vol * (0.8 + idx * 0.1) + Math.random() * 20));
          bar.style.height = `${height}%`;
        });
      }

      // 实时声音检测指示微气泡
      if (audioCue) {
        if (vol > 15) {
          audioCue.classList.remove("hidden");
        }
      }
    }, 50);
    this._addCleanup(() => clearInterval(this._volMeterTimer));

    // 倒计时每秒更新
    if (this._countTimer) clearInterval(this._countTimer);
    this._countTimer = setInterval(() => {
      countdown--;
      if (countdown > 0 && pe.state === "listening") {
        if (statusTxt) statusTxt.textContent = `正在听你读 (${countdown}s)... 大声读【${char.char}】`;
      } else {
        clearInterval(this._countTimer);
        this._countTimer = null;
      }
    }, 1000);
    this._addCleanup(() => clearInterval(this._countTimer));

    // 3.2 秒后自动收音完成并展现打分结果
    this._timeout(async () => {
      if (pe.state === "listening") {
        if (statusTxt) {
          statusTxt.textContent = "AI 评测打分中，请稍候...";
          statusTxt.className = "mt-2 text-xs font-black text-amber-300 animate-pulse";
        }
        if (this._volMeterTimer) { clearInterval(this._volMeterTimer); this._volMeterTimer = null; }
        if (this._countTimer) { clearInterval(this._countTimer); this._countTimer = null; }
        ripples?.classList.add("hidden");
        volBars?.classList.add("hidden");
        countdownRing?.classList.add("hidden");
        audioCue?.classList.add("hidden");
        if (btnRecord) {
          btnRecord.className = "relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-rose-500 via-red-500 to-orange-400 shadow-[0_10px_30px_rgba(244,63,94,0.7)] flex items-center justify-center border-4 border-white active:scale-90 transition-all hover:scale-105 cursor-pointer";
        }
        try {
          const res = await pe.stopAndEvaluate();
          if (res) this._showEvalResult(stage, res);
        } catch (e) {}
      }
    }, totalDuration);
  }

  /**
   * 录音错误提示与权限友好引导
   */
  _showRecordError(stage, reason) {
    const errorTxt = stage.querySelector("#record-error-text");
    const statusTxt = stage.querySelector("#record-status");
    const messages = {
      mic_permission_denied: "麦克风权限被拒绝，请在浏览器中开启麦克风访问",
      asr_permission_denied: "语音识别权限被拒绝",
      start_failed: "录音启动失败，请重试",
      exception: "录音遇到异常，请重试",
      already_running: "正在录音中，请勿重复点击",
    };
    const msg = messages[reason] || "录音遇到异常，请重试";
    if (errorTxt) {
      errorTxt.textContent = msg;
      errorTxt.classList.remove("hidden");
    }
    if (statusTxt) {
      statusTxt.textContent = "录音未启动";
      statusTxt.className = "mt-2 text-xs font-black text-rose-200 tracking-wider";
    }

    if (reason === "mic_permission_denied" || reason === "asr_permission_denied") {
      this._showMicPermissionModal(stage);
    }
  }

  /**
   * 弹出麦克风权限友好图文指引
   */
  _showMicPermissionModal(stage) {
    const existing = document.getElementById("mic-permission-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "mic-permission-modal";
    modal.className = "fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none";
    modal.innerHTML = `
      <div class="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
        <div class="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 shadow-inner">
          <span class="flex items-center">${GAME_ICONS.speaker("w-8 h-8")}</span>
        </div>
        <h3 class="text-lg font-black text-amber-950 mb-1">开启麦克风权限指引</h3>
        <p class="text-xs text-gray-500 font-semibold mb-4">
          为了让 AI 智能评测宝宝的发音，需要允许使用麦克风哦！
        </p>

        <div class="w-full bg-amber-50/80 rounded-2xl p-4 border border-amber-200 text-left text-xs text-amber-950 space-y-2.5 mb-5 font-semibold">
          <div class="flex items-start gap-2">
            <span class="bg-amber-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
            <span><b>苹果 Safari：</b>点击网址左侧的「aA」或设置图标 → 网站设置 → 麦克风设为「允许」</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="bg-amber-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
            <span><b>安卓 / Chrome：</b>点击网址栏前方的安全锁或设置 → 权限 → 开启麦克风</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="bg-amber-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
            <span><b>微信 / 浏览器：</b>点击右上角「···」→ 权限设置 → 允许访问麦克风</span>
          </div>
        </div>

        <div class="flex items-center gap-3 w-full">
          <button id="btn-retry-mic" class="flex-1 btn-game-orange text-white font-black text-xs py-3 rounded-2xl shadow-md active:scale-95 cursor-pointer">
            重新尝试授权
          </button>
          <button id="btn-fallback-manual" class="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs rounded-2xl active:scale-95 cursor-pointer">
            切换手动打分
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    this._on(modal.querySelector("#btn-retry-mic"), "click", () => {
      modal.remove();
      this.executeRecordToggle(stage);
    });

    this._on(modal.querySelector("#btn-fallback-manual"), "click", () => {
      modal.remove();
      const micZone = stage.querySelector("#mic-interaction-zone");
      const manualPanel = stage.querySelector("#manual-rating-panel");
      if (micZone) micZone.classList.add("hidden");
      if (manualPanel) manualPanel.classList.remove("hidden");
      this._bindManualRating(stage);
    });
  }

  /**
   * 重置录音 UI 到初始态
   */
  _resetRecordUI(stage) {
    const btnRecord = stage.querySelector("#btn-start-record");
    const ripples = stage.querySelector("#mic-wave-ripples");
    const volBars = stage.querySelector("#record-vol-bars");
    const countdownRing = stage.querySelector("#record-countdown-ring");
    const audioCue = stage.querySelector("#record-audio-cue");
    const interim = stage.querySelector("#record-interim-text");
    const errorTxt = stage.querySelector("#record-error-text");

    if (btnRecord) {
      btnRecord.className = "relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-rose-500 via-red-500 to-orange-400 shadow-[0_10px_30px_rgba(244,63,94,0.7)] flex items-center justify-center border-4 border-white active:scale-90 transition-all hover:scale-105 cursor-pointer";
    }
    ripples?.classList.add("hidden");
    volBars?.classList.add("hidden");
    countdownRing?.classList.add("hidden");
    audioCue?.classList.add("hidden");
    interim?.classList.add("opacity-0");
    errorTxt?.classList.add("hidden");
  }

  /**
   * 渲染美化后的语音评测结果卡片
   */
  _showEvalResult(stage, res) {
    if (this.currentStep !== 3) return;
    const char = this.charData;

    const micZone = stage.querySelector("#mic-interaction-zone");
    const resultBox = stage.querySelector("#read-result-box");
    const scoreNum = stage.querySelector("#read-score-num");
    const praiseTxt = stage.querySelector("#read-praise-text");
    const starsContainer = stage.querySelector("#read-stars-container");
    const finishBtn = stage.querySelector("#btn-finish-read-step");
    const retryBtn = stage.querySelector("#btn-retry-record");

    const score = typeof res.totalScore === "number" ? res.totalScore : (typeof res.score === "number" ? res.score : 0);
    const stars = typeof res.stars === "number" ? res.stars : (score >= 85 ? 3 : (score >= 60 ? 2 : (score >= 35 ? 1 : 0)));
    // P0-2: 存真实评测结果，让宝箱 → completeCharacter 不再硬编码 3
    this._evalStars = stars;

    if (micZone) micZone.classList.add("hidden");
    if (resultBox) resultBox.classList.remove("hidden");
    if (scoreNum) scoreNum.textContent = score;

    const diagAccuracy = stage.querySelector("#diag-score-accuracy");
    const diagTone = stage.querySelector("#diag-score-tone");
    const diagFluency = stage.querySelector("#diag-score-fluency");

    const accVal = typeof res.charAccuracy === "number" ? res.charAccuracy : Math.min(100, Math.max(65, score + 4));
    const toneVal = typeof res.toneAccuracy === "number" ? res.toneAccuracy : (typeof res.completenessScore === "number" ? res.completenessScore : Math.min(100, Math.max(65, score + 2)));
    const fluencyVal = typeof res.rhythmScore === "number" ? res.rhythmScore : Math.min(100, Math.max(65, score + 3));

    if (diagAccuracy) diagAccuracy.textContent = `${Math.round(accVal)}%`;
    if (diagTone) diagTone.textContent = `${Math.round(toneVal)}%`;
    if (diagFluency) diagFluency.textContent = `${Math.round(fluencyVal)}%`;

    // 依据真实评测得分分档美化呈现
    if (score >= 85) {
      // 满分/优秀 (3星)
      mascotProgress.onCorrectPronunciation();
      if (praiseTxt) {
        praiseTxt.innerHTML = `<span class="text-emerald-300 font-bold">发音超级标准！太厉害了！</span><br/><span class="text-white/80 text-[11px]">声母韵母饱满，获得 3 颗星与 5 金币！</span>`;
      }
      soundAndFX.playVictoryFanfare();
      soundAndFX.triggerConfetti(stage);
      soundAndFX.speakPriority(`太棒啦！“${char.char}”字读得真准，得到${score}分！`, { kind: "sentence", emotion: "excited" });
      if (finishBtn) {
        finishBtn.innerHTML = `<span>${GAME_ICONS.sparkle("w-4 h-4 inline-block")} 开启特训练字 (+5 金币)</span>`;
        finishBtn.classList.remove("opacity-50", "pointer-events-none");
        finishBtn.className = "w-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black py-3 rounded-full shadow-lg border-2 border-white flex items-center justify-center gap-2 active:scale-95 transition-all text-sm cursor-pointer ring-4 ring-yellow-300 animate-pulse";
      }
    } else if (score >= 60) {
      // 良好 (2星)
      mascotProgress.onCorrectPronunciation();
      if (praiseTxt) {
        praiseTxt.innerHTML = `<span class="text-amber-300 font-bold">读得很棒！声音再清晰一点就满分啦！</span><br/><span class="text-white/80 text-[11px]">获得 2 颗星，再练一次可拿满分哦！</span>`;
      }
      soundAndFX.playSuccessSound();
      soundAndFX.speakPriority(`读得不错！得到${score}分，再练一次拿3颗星吧！`, { kind: "sentence", emotion: "happy" });
      if (finishBtn) {
        finishBtn.innerHTML = `<span>${GAME_ICONS.sparkle("w-4 h-4 inline-block")} 开启特训练字 (+3 金币)</span>`;
        finishBtn.classList.remove("opacity-50", "pointer-events-none");
        finishBtn.className = "w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black py-3 rounded-full shadow border border-white text-sm active:scale-95 transition-all cursor-pointer";
      }
    } else {
      // 不准 / 读错 (0~1星)
      mascotProgress.onWrongAttempt();
      const heard = res.hypothesis || "未检测到清晰发音";
      if (praiseTxt) {
        praiseTxt.innerHTML = `<div class="bg-rose-950/60 border border-rose-400/40 rounded-xl px-3 py-1.5 mb-1"><span class="text-yellow-300 font-bold">识别到读音：“${heard}”</span></div><span class="text-rose-200 text-xs">没有读准哦，请点击【听示范】并大声朗读【${char.char}】！</span>`;
      }
      soundAndFX.playSoftError();
      soundAndFX.speakPriority(`好像读成了“${heard}”啦，请跟我大声读“${char.char}”，再试一次吧！`, { kind: "sentence", emotion: "correction" });
      if (retryBtn) {
        retryBtn.className = "bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg border border-white active:scale-95 transition-all cursor-pointer ring-4 ring-yellow-400 animate-pulse";
      }
      if (finishBtn) {
        finishBtn.innerHTML = `<span>跳过此步 (0 金币)</span>`;
        finishBtn.classList.remove("opacity-50", "pointer-events-none");
        finishBtn.className = "w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 rounded-full border border-white/30 text-xs active:scale-95 transition-all cursor-pointer mt-1";
      }
    }

    // 更新 3 颗金色大星星（逐颗旋转弹入动画）
    if (starsContainer) {
      starsContainer.innerHTML = Array.from({ length: 3 }).map((_, i) => `
        <div class="star-item text-4xl animate-bounce" style="animation-delay: ${0.15 * i}s">
          ${GAME_ICONS.star(i >= stars)}
        </div>
      `).join("");
    }
  }

  // ----------------------------------------------------------------
  // STEP 4: 练 — 太空飞船射击小游戏
  // ----------------------------------------------------------------
  renderStepPractice(stage) {
    const char = this.charData;
    let hitCount = 0;
    const targetHits = 3;

    soundAndFX.speakPriority(`瞄准射击！请击中带有“${char.char}”字的太空发光气球！`, { kind: "sentence", emotion: "excited" });

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col justify-between p-6 animate-fade-in select-none">
        
        <canvas id="laser-effect-canvas" class="absolute inset-0 w-full h-full pointer-events-none z-20"></canvas>

        <div class="w-full flex items-center justify-between bg-black/60 px-6 py-2.5 rounded-full border border-white/30 text-white z-10">
          <div class="flex items-center gap-2 text-xs font-black text-yellow-300">
            <span>${GAME_ICONS.star("w-4 h-4 inline-block")} 目标字：</span>
            <span class="text-xl text-orange-400 bg-black/50 px-3 py-0.5 rounded-xl border border-orange-500">${char.char}</span>
          </div>

          <div class="text-xs font-black text-cyan-300">
            ${GAME_ICONS.sparkle("w-4 h-4 inline-block")} 命中进度: <span id="game-hit-progress" class="text-yellow-400 text-base font-black">0 / ${targetHits}</span>
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
          <button id="btn-next-to-write" class="bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white font-black text-base px-12 py-3.5 rounded-full shadow-[0_8px_25px_rgba(16,185,129,0.6)] border-2 border-white active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
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
          soundAndFX.speakPriority(char.char, { kind: "char", priority: 1 });
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

          if (hitCount >= targetHits) {
            soundAndFX.playVictoryFanfare();
            this._timeout(() => {
              if (winModal) winModal.classList.remove("hidden");
            }, 600);
          }
        } else {
          try {
            ebbinghausManager.recordMistake(char.id, "similar_confuse", { targetChar: char.char, selectedChar: val });
          } catch {}
          soundAndFX.playSoftError();
          soundAndFX.speakPriority(`这是“${val}”字，要找的是“${char.char}”字哦！`, { kind: "sentence", emotion: "correction" });
          btn.classList.add("animate-shake");
          this._timeout(() => btn.classList.remove("animate-shake"), 600);
        }
      });
    });

    if (nextBtn) {
      this._on(nextBtn, "click", () => {
        soundAndFX.playPop();
        this.currentStep = 5;
        this.render();
      });
    }
  }

  // ----------------------------------------------------------------
  // STEP 5: 控笔训练 —— B1/B6 铁律：写字前先建立手部小肌肉控制
  // 教育学依据：《汉字启蒙认知能力教学指南》(教育部) + 皮亚杰前运算阶段
  // ----------------------------------------------------------------
  renderStepPrewrite(stage) {
    const char = this.charData;
    const age = ebbinghausManager.getAge();
    const stageLabel = ebbinghausManager.getWritingStage();
    const blockedByAge = ebbinghausManager.isWriteBlockedByAge();

    // B1 铁律：5 岁以下儿童，控笔是全部，不进入描红步骤
    const nextStepAfterPrewrite = blockedByAge ? 8 : 6;
    const nextStepLabel = blockedByAge
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
          if (nextStepAfterPrewrite === 8) {
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
        this.currentStep = nextStepAfterPrewrite;
        this.render();
      });
    }
  }

  // ----------------------------------------------------------------
  // STEP 6: 描红 (AI 魔法星光毛笔描红 + 倒笔画拦截) —— B6 年龄自适应
  // ----------------------------------------------------------------
  renderStepTrace(stage) {
    const char = this.charData;
    soundAndFX.speakPriority(`魔法毛笔描红！请从发光起点开始，按照笔顺书写“${char.char}”字！`, { kind: "sentence", priority: 1 });

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex items-center justify-between p-8 animate-fade-in select-none">
        
        <div class="flex-1 flex flex-col items-center justify-center">
          <div class="mb-3 flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/20 shadow-md">
            <span class="text-xs font-black text-amber-300">笔画推进:</span>
            <div id="write-stroke-beads" class="flex items-center gap-1.5 flex-wrap justify-center">
              ${char.strokes.map((s, idx) => `
                <span class="stroke-bead px-2.5 py-0.5 rounded-full text-[11px] font-black border transition-all ${idx === 0 ? 'bg-amber-400 text-amber-950 border-white shadow-md animate-pulse' : 'bg-white/15 text-white/60 border-white/20'}" data-idx="${idx}">
                  ${idx + 1}.${s.name}
                </span>
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
              ${GAME_ICONS.brush("w-3.5 h-3.5 inline-block")} 阶段一 · 有轨描红
            </span>
            <h3 class="text-lg font-black text-amber-950 mb-2">规范笔顺描红</h3>
            <p class="text-xs text-gray-600 leading-relaxed font-semibold">
              ${GAME_ICONS.sparkle("w-4 h-4 inline-block")} 沿黄色魔法光球滑行，遇到倒笔画系统会自动提示并拦截哦！
            </p>
          </div>

          <div class="flex flex-col gap-2.5">
            <button id="btn-toggle-grid" class="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs py-2 rounded-full border border-amber-300 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.pen("w-3.5 h-3.5")}</span>
              <span id="txt-grid-type">当前格线：米字格 (切田字格)</span>
            </button>

            <button id="btn-demo-write" class="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs sm:text-sm py-2.5 rounded-full shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
              <span>演示全字笔顺</span>
            </button>

            <button id="btn-reset-write" class="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs py-2.5 rounded-full shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.brush("w-4 h-4")}</span>
              <span>重新临摹这一字</span>
            </button>

            <button id="btn-finish-write-step" class="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white font-black text-base py-3.5 rounded-full shadow-[0_8px_25px_rgba(245,158,11,0.6)] border-2 border-white active:scale-95 transition-all flex items-center justify-center gap-2 hidden animate-bounce-slow cursor-pointer hover:brightness-105">
              <span class="flex items-center">${GAME_ICONS.pen("w-5 h-5")}</span>
              <span>描红达标！去独立书写</span>
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
        soundAndFX.playPop();
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
        soundAndFX.playPop();
        if (this.hanziEngine) this.hanziEngine.reset();
        updateBeads(0);
        if (nextBtn) nextBtn.classList.add("hidden");
      });
    }

    if (nextBtn) {
      this._on(nextBtn, "click", () => {
        soundAndFX.playPop();
        this.currentStep = 7;
        this.render();
      });
    }
  }

  // 向下兼容别名
  renderStepWrite(stage) {
    return this.renderStepTrace(stage);
  }

  // ----------------------------------------------------------------
  // STEP 7: 独立写 (无底模脱轨回忆书写 + 骨架还原评分 + 印章奖励)
  // 教育学依据：B1 认知先于执笔 + B6 独立书写 + B9 测试回忆而非识别
  // ----------------------------------------------------------------
  renderStepFreeWrite(stage) {
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
        soundAndFX.playVictoryFanfare();
        ebbinghausManager.addCoins(3);
        soundAndFX.speakPriority(`太厉害了！小书法家独立写出了“${char.char}”字！`, { kind: "sentence", emotion: "excited" });
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
      this._on(peekBtn, "click", () => {
        soundAndFX.playPop();
        soundAndFX.speakPriority(`小精灵给你提示一眼，看清楚笔顺马上写哦！`, { kind: "sentence", emotion: "gentle" });
        if (this.hanziEngine) {
          this.hanziEngine.peekGuide(2500);
        }
      });
    }

    if (resetBtn) {
      this._on(resetBtn, "click", () => {
        soundAndFX.playPop();
        if (this.hanziEngine) this.hanziEngine.reset();
        updateBeads(0);
        if (nextBtn) nextBtn.classList.add("hidden");
      });
    }

    if (nextBtn) {
      this._on(nextBtn, "click", () => {
        soundAndFX.playPop();
        this.currentStep = 8;
        this.render();
      });
    }
  }

  // ----------------------------------------------------------------
  // STEP 8: 测 & 华丽黄金宝箱结算 (Duang! Duang! Duang! 飞星)
  // ----------------------------------------------------------------
  renderStepTestAndChest(stage) {
    const char = this.charData;

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-purple-950 via-indigo-950 to-purple-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col items-center justify-center p-8 animate-fade-in text-center text-white">
        
        <div id="golden-chest-stage" class="flex flex-col items-center">
          
          <div class="flex items-center gap-4 mb-4">
            <div id="star-slot-1" class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center transition-all duration-500 shadow-inner">
              <span class="flex items-center">${GAME_ICONS.star("w-8 h-8 opacity-30", true)}</span>
            </div>
            <div id="star-slot-2" class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center -translate-y-2 transition-all duration-500 shadow-inner">
              <span class="flex items-center">${GAME_ICONS.star("w-10 h-10 opacity-30", true)}</span>
            </div>
            <div id="star-slot-3" class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center transition-all duration-500 shadow-inner">
              <span class="flex items-center">${GAME_ICONS.star("w-8 h-8 opacity-30", true)}</span>
            </div>
          </div>

          <button id="btn-open-golden-chest" class="group relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 border-4 border-white shadow-[0_0_60px_rgba(255,235,59,0.8)] flex items-center justify-center active:scale-90 transition-transform cursor-pointer animate-bounce-slow">
            <span class="flex items-center">${GAME_ICONS.chest("w-28 h-28 sm:w-36 sm:h-36")}</span>
            <div class="absolute -bottom-3 bg-red-600 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg border border-white">
              点击开启通关宝箱！
            </div>
          </button>

          <h2 class="text-xl sm:text-2xl font-black text-yellow-300 mt-6 mb-1">
            恭喜凯茜小勇士！通关“${char.char}”字大冒险！
          </h2>
        </div>

        <div id="chest-reward-card" class="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center justify-center text-white hidden animate-scale-up z-30">
          <div class="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 border-4 border-white text-7xl sm:text-8xl font-black flex items-center justify-center shadow-2xl mb-4 animate-bounce-cathy">
            ${char.char}
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-yellow-300 mb-1">获得全新专属字卡：${char.char}</h2>
          <p class="text-xs sm:text-sm text-gray-300 mb-4 flex items-center gap-3">
            <span class="flex items-center gap-1">${GAME_ICONS.coin("w-5 h-5")} 获得 10 凯茜星币</span>
            <span class="flex items-center gap-1">${GAME_ICONS.star("w-5 h-5", false)} 3 颗凯茜之星</span>
          </p>

          <button id="btn-confirm-return-map" class="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:to-red-400 text-white font-black text-base sm:text-lg px-12 py-3.5 rounded-full shadow-[0_0_40px_rgba(255,107,0,0.9)] border-2 border-white active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.home("w-5 h-5")}</span>
            <span>收入生词本，返回大地图</span>
          </button>
        </div>

      </div>
    `;

    const chestBtn = stage.querySelector("#btn-open-golden-chest");
    const rewardCard = stage.querySelector("#chest-reward-card");
    const returnBtn = stage.querySelector("#btn-confirm-return-map");

    const star1 = stage.querySelector("#star-slot-1");
    const star2 = stage.querySelector("#star-slot-2");
    const star3 = stage.querySelector("#star-slot-3");

    this._isChestOpening = false;
    if (chestBtn) {
      this._on(chestBtn, "click", () => {
        if (this._isChestOpening) return;
        this._isChestOpening = true;
        chestBtn.style.pointerEvents = "none";
        chestBtn.classList.add("pointer-events-none", "opacity-80");

        soundAndFX.playChestOpen();
        soundAndFX.playVictoryFanfare();
        soundAndFX.triggerConfetti(this.container);
        soundAndFX.triggerCoinFly(this.container);

        // P0-2 B9 铁律：用真实评测分数，不再硬编码 3 星
        const earnedStars = Math.max(0, Math.min(3, this._evalStars ?? 3));

        // Duang! Duang! Duang! 依次点亮（按真实评测分数）
        this._timeout(() => {
          if (earnedStars >= 1) {
            soundAndFX.playStarEarned(1);
            if (star1) {
              star1.innerHTML = `<span class="flex items-center">${GAME_ICONS.star("w-12 h-12", false)}</span>`;
              star1.classList.add("bg-yellow-400", "scale-125", "shadow-[0_0_20px_rgba(255,235,59,1)]");
            }
          }
        }, 200);

        this._timeout(() => {
          if (earnedStars >= 2) {
            soundAndFX.playStarEarned(2);
            if (star2) {
              star2.innerHTML = `<span class="flex items-center">${GAME_ICONS.star("w-14 h-14", false)}</span>`;
              star2.classList.add("bg-yellow-400", "scale-125", "shadow-[0_0_20px_rgba(255,235,59,1)]");
            }
          }
        }, 600);

        this._timeout(() => {
          if (earnedStars >= 3) {
            soundAndFX.playStarEarned(3);
            if (star3) {
              star3.innerHTML = `<span class="flex items-center">${GAME_ICONS.star("w-12 h-12", false)}</span>`;
              star3.classList.add("bg-yellow-400", "scale-125", "shadow-[0_0_20px_rgba(255,235,59,1)]");
            }
          }
        }, 1000);

        this._timeout(() => {
          if (rewardCard) rewardCard.classList.remove("hidden");
          this.clearProgress();
          ebbinghausManager.completeCharacter(char.id, earnedStars);
          this._busEmit(EVENTS.LEARN_FINISH, { charId: char.id, stars: earnedStars });
        }, 1400);
      });
    }

    if (returnBtn) {
      this._on(returnBtn, "click", () => {
        soundAndFX.playPop();
        if (this.onFinish) this.onFinish();
        else this._busEmit(EVENTS.SWITCH_MODE, { mode: "map" });
      });
    }
  }
}
