/** BookModule — 亲子朗读评测弹窗 */
import { soundAndFX } from "../soundEngine.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { GAME_ICONS } from "../gameIcons.js";
import { pronunciationEval } from "../pronunciationEval.js";
import { resolveBookVoiceReward } from "../bookVoiceReward.js";
import { escapeHtml } from "../BaseModule.js";

export function openUserVoiceModal(page) {
    if (this.isVoiceModalOpen) return;
    this.isVoiceModalOpen = true;

    let selectedRole = "kid"; // "kid" | "parent" | "duet"

    const overlay = document.createElement("div");
    overlay.id = "user-voice-modal-overlay";
    overlay.className = "fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in";
    overlay.innerHTML = `
      <div class="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
        
        <button id="btn-close-voice-modal" class="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white text-gray-800 font-extrabold text-base flex items-center justify-center shadow-xl hover:bg-gray-100 active:scale-95 cursor-pointer border-2 border-amber-200">
          <span class="font-sans font-bold text-base leading-none">X</span>
        </button>

        <div class="flex items-center gap-2 mb-1">
          <span class="flex items-center">${GAME_ICONS.speaker("w-7 h-7")}</span>
          <h3 class="text-xl font-black text-amber-950">亲子双轨共读秀 · 我来录故事</h3>
        </div>
        <p class="text-xs text-amber-800/80 mb-3 font-bold">选择录音角色，录制属于我们家的专属有声绘本！</p>

        <div class="flex items-center gap-2 mb-4 bg-white/80 p-1.5 rounded-full border border-amber-200 shadow-sm">
          <button class="role-select-btn px-3 py-1 rounded-full text-xs font-black transition-all active:scale-95 bg-orange-500 text-white shadow" data-role="kid">
            宝贝朗读
          </button>
          <button class="role-select-btn px-3 py-1 rounded-full text-xs font-black transition-all active:scale-95 text-amber-900 hover:bg-amber-100" data-role="parent">
            家长朗读
          </button>
          <button class="role-select-btn px-3 py-1 rounded-full text-xs font-black transition-all active:scale-95 text-amber-900 hover:bg-amber-100" data-role="duet">
            亲子合读
          </button>
        </div>

        <div class="w-full bg-white/90 p-4 rounded-2xl border-2 border-amber-200 shadow-inner mb-4">
          <p class="text-lg font-black text-amber-950 leading-relaxed">${escapeHtml(page.text)}</p>
        </div>

        <div class="relative w-24 h-24 mb-3 flex items-center justify-center">
          <div id="voice-glow-bg" class="absolute inset-0 rounded-full bg-rose-400/30 blur-xl opacity-0 transition-opacity"></div>
          <button id="btn-start-record" class="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-red-500 text-white shadow-2xl flex flex-col items-center justify-center active:scale-90 transition-all cursor-pointer border-4 border-white">
            <span class="flex items-center mb-0.5">${GAME_ICONS.speaker("w-6 h-6")}</span>
            <span id="record-btn-label" class="text-[10px] font-black">开始录音</span>
          </button>
        </div>

        <div id="voice-status-text" class="text-xs font-bold text-amber-900 mb-3 h-6">准备就绪，点击麦克风开始录制</div>

        <button id="btn-playback-voice" class="hidden bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-6 py-2.5 rounded-full shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer transition-all">
          <span class="flex items-center">${GAME_ICONS.speaker("w-4 h-4")}</span>
          <span id="playback-btn-text">听听我们的朗读录音</span>
        </button>

      </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector("#btn-close-voice-modal");
    const startRecordBtn = overlay.querySelector("#btn-start-record");
    const recordBtnLabel = overlay.querySelector("#record-btn-label");
    const statusText = overlay.querySelector("#voice-status-text");
    const playbackBtn = overlay.querySelector("#btn-playback-voice");
    const playbackBtnText = overlay.querySelector("#playback-btn-text");

    // 角色选择
    this._onDom(overlay.querySelectorAll(".role-select-btn"), "click", (e) => {
      const btn = e.currentTarget;
      soundAndFX.playPop();
      selectedRole = btn.dataset.role;
      overlay.querySelectorAll(".role-select-btn").forEach((b) => {
        b.classList.remove("bg-orange-500", "text-white", "shadow");
        b.classList.add("text-amber-900");
      });
      btn.classList.add("bg-orange-500", "text-white", "shadow");
      btn.classList.remove("text-amber-900");

      const roleName = selectedRole === "kid" ? "宝贝" : selectedRole === "parent" ? "家长" : "亲子合读";
      statusText.textContent = `已切换为【${roleName}】模式，点击麦克风开始！`;
    });

    let isRecording = false;

    const closeModal = () => {
      this.isVoiceModalOpen = false;
      const pe = pronunciationEval || (typeof window !== "undefined" ? window.pronunciationEval : null);
      if (pe && pe.state === "listening") {
        try { pe.stopAndEvaluate(); } catch {}
      }
      overlay.remove();
    };

    this._on(closeBtn, "click", closeModal);

    this._on(startRecordBtn, "click", async () => {
      if (isRecording) return;
      isRecording = true;
      soundAndFX.playFamilyRecordChime(true);
      const roleName = selectedRole === "kid" ? "宝贝" : selectedRole === "parent" ? "家长" : "亲子";
      statusText.textContent = `正在录制【${roleName}】的声音... 请大声朗读`;
      recordBtnLabel.textContent = "录音中";

      startRecordBtn.classList.add("bg-rose-500", "animate-pulse");
      const glowBg = overlay.querySelector("#voice-glow-bg");
      if (glowBg) {
        glowBg.classList.replace("opacity-0", "opacity-100");
        glowBg.classList.add("animate-pulse");
      }

      const pe = pronunciationEval || (typeof window !== "undefined" ? window.pronunciationEval : null);
      let evalResult = null;

      if (pe && typeof pe.evaluate === "function") {
        try {
          evalResult = await pe.evaluate(page.text, { mode: "sentence", maxSeconds: 5 });
        } catch (err) {
          console.warn("[BookModule] 语音评测失败:", err);
          evalResult = null;
        }
      }

      if (!this.isVoiceModalOpen) return;

      const reward = resolveBookVoiceReward(evalResult);
      if (reward.ok) {
        soundAndFX.playParentCheer();
        soundAndFX.triggerConfetti(this.container);
        ebbinghausManager.addCoins(reward.coins);
        ebbinghausManager.save();
        statusText.innerHTML = `<span class="text-emerald-600 font-black text-sm">${escapeHtml(roleName)} 朗读得分：${Number(reward.score) || 0} 分！获得 ${Number(reward.coins) || 0} 凯茜星币！</span>`;
      } else {
        if (typeof soundAndFX.playEncouragement === "function") soundAndFX.playEncouragement();
        else if (typeof soundAndFX.playPop === "function") soundAndFX.playPop();
        statusText.innerHTML = `<span class="text-amber-600 font-black text-sm">这次没评到分，再试一次大声朗读吧！</span>`;
      }
      recordBtnLabel.textContent = "重新录音";
      startRecordBtn.classList.remove("bg-rose-500", "animate-pulse");
      if (glowBg) {
        glowBg.classList.replace("opacity-100", "opacity-0");
        glowBg.classList.remove("animate-pulse");
      }
      if (playbackBtnText) playbackBtnText.textContent = `回放【${roleName}】的朗读声音`;
      playbackBtn.classList.remove("hidden");
      isRecording = false;
    });

    this._on(playbackBtn, "click", () => {
      soundAndFX.speakPriority(page.text, { kind: "sentence", emotion: "gentle" });
    });
  }

  // ----------------------------------------------------
  // 7. 双重阅读测评 (洪恩标杆特色：生字眼力 + 故事理解)
  // ----------------------------------------------------
