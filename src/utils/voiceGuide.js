/**
 * src/utils/voiceGuide.js
 * ================================================================
 * 《凯茜识字》全流程语音引导系统 (T16 / P2-5)
 * ─────────────────────────────────────────────────────────────
 * 遵循儿童教育学心理学：3-7 岁学龄前儿童识字量有限，
 * 视觉图标必须辅以柔和、清脆的即时语音引导（口播按钮功能与场景说明）。
 * 具备智能去重、防抖 (Debounce) 与不抢占核心教学发音的低优先级播放机制。
 */

import { soundAndFX } from "./soundEngine.js";
import { storageManager } from "./storageManager.js";

const VOICE_GUIDE_KEY = "CATHY_VOICE_GUIDANCE_ENABLED";

export class VoiceGuideService {
  constructor() {
    this.lastSpokenText = "";
    this.lastSpokenTime = 0;
    this._debounceTimer = null;
  }

  /**
   * 检查语音引导是否开启（默认开启）
   */
  isEnabled() {
    const val = storageManager.getItem(VOICE_GUIDE_KEY);
    return val === null ? true : val === "true" || val === true;
  }

  setEnabled(val) {
    storageManager.setItem(VOICE_GUIDE_KEY, !!val);
  }

  /**
   * 播放 UI 引导语音
   * @param {string} text 引导词
   * @param {object} [opts]
   */
  speakGuidance(text, opts = {}) {
    if (!this.isEnabled() || !text) return;
    const now = Date.now();
    const clean = text.trim();

    // 2 秒内相同引导词不重复朗读，防重复触发
    if (this.lastSpokenText === clean && now - this.lastSpokenTime < 2000) {
      return;
    }

    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this.lastSpokenText = clean;
      this.lastSpokenTime = Date.now();
      try {
        soundAndFX.speakPriority(clean, {
          kind: "tutor",
          priority: opts.priority || 3,
          emotion: opts.emotion || "gentle"
        });
      } catch (err) {
        console.warn("[VoiceGuide] failed to speak:", err);
      }
    }, typeof opts.debounceMs === "number" ? opts.debounceMs : 250);
  }

  /**
   * 取消当前处于防抖排队中的引导语音
   */
  cancelGuidance() {
    clearTimeout(this._debounceTimer);
    this._debounceTimer = null;
  }

  /**
   * 为指定容器下的显式语音提示元素附加轻量级语音提示
   * 仅绑定显式标记 [data-voice-hint] 的教学交互节点，避免广泛拦截普通 button[title] 造成点击冲突
   * @param {HTMLElement} root
   */
  attach(root) {
    if (!root || typeof root.querySelectorAll !== "function") return;
    const targets = root.querySelectorAll("[data-voice-hint]");
    targets.forEach((el) => {
      const hint = el.getAttribute("data-voice-hint");
      if (!hint) return;

      const trigger = () => this.speakGuidance(hint);
      el.addEventListener("mouseenter", trigger, { passive: true });
      // 点击或按下时立即取消待播放的悬浮引导，避免与点击动作的发音/音效产生重叠冲突
      el.addEventListener("click", () => this.cancelGuidance(), { passive: true });
      el.addEventListener("pointerdown", () => this.cancelGuidance(), { passive: true });
    });
  }
}

export const voiceGuide = new VoiceGuideService();
