/** LearnModule step — extracted from LearnModule.js */
import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";
import { pronunciationEval } from "../pronunciationEval.js";
import { scoreToStars, RECORD_MAX_DURATION_MS, RECORD_SILENCE_TIMEOUT_MS } from "../learnScoring.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { mascotProgress } from "../mascotProgress.js";

export function renderStepRead(stage) {
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
export function _bindManualRating(stage) {
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
export async function executeRecordToggle(stage) {
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
        maxDurationMs: RECORD_MAX_DURATION_MS,
        silenceTimeoutMs: RECORD_SILENCE_TIMEOUT_MS,
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

    // 麦克风已成功接入，正式开始录音倒计时与实时声学动态频谱
    const totalDuration = RECORD_MAX_DURATION_MS;
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
export function _showRecordError(stage, reason) {
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
export function _showMicPermissionModal(stage) {
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
export function _resetRecordUI(stage) {
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
export function _showEvalResult(stage, res) {
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
