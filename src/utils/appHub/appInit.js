/** CathyAppManager — boot / loader / eye-care */
import { soundAndFX } from "../soundEngine.js";
import { ensureDetails } from "../charDetailLoader.js";
import { eventBus, EVENTS } from "../eventBus.js";
import { storageManager } from "../storageManager.js";
import { eyeCareManager } from "../eyeCareManager.js";
import { mascotProgress } from "../mascotProgress.js";
import { bindMicroReviewUI } from "../microReviewUI.js";
import { ebbinghausManager } from "../ebbinghaus.js";

export function init() {
  this.storage = storageManager;
  const unlockAudio = () => {
    soundAndFX.init();
    this._warmupNeuralVoice();
    window.removeEventListener("click", unlockAudio);
    window.removeEventListener("touchstart", unlockAudio);
    window.removeEventListener("pointerdown", unlockAudio);
  };
  window.addEventListener("click", unlockAudio, { once: true });
  window.addEventListener("touchstart", unlockAudio, { once: true });
  window.addEventListener("pointerdown", unlockAudio, { once: true });

  eventBus.on(EVENTS.SWITCH_MODE, ({ mode, highlightPinyin }) => {
    if (mode === "pinyin" && highlightPinyin && this.pinyinModule?.locatePinyin) {
      this.pinyinModule.locatePinyin(highlightPinyin);
    }
    this.transitionToMode(mode);
  });

  // P1-3: 发音评测结果全局落库（零侵入挂钩，供家长端四维画像统计）
  eventBus.on(EVENTS.AUDIO_EVAL_RESULT, (res) => {
    try {
      if (res && res.target && res.stars) {
        ebbinghausManager.recordPronunciation(res.target, res.stars);
      }
    } catch (e) {
      console.warn("[AppInit] 发音结果落库失败:", e);
    }
  });

  eventBus.on(EVENTS.SELECT_CHAR, ({ charData }) => {
    this.startLearnFlow(charData);
  });

  eventBus.on(EVENTS.START_LEARN, ({ charData }) => {
    this.startLearnFlow(charData);
  });

  // LEARN_FINISH 消费者：≥2 星记一次凯茜好感递进（内在动机，非金币）
  eventBus.on(EVENTS.LEARN_FINISH, ({ stars } = {}) => {
    try {
      if ((stars ?? 0) >= 2 && typeof mascotProgress?.onCorrectPronunciation === "function") {
        mascotProgress.onCorrectPronunciation();
      }
    } catch {}
  });

  try { bindMicroReviewUI(); } catch {}

  this._initClickSparkles();
  this._initKeyboardShortcuts();
  this._initGlobalListeners();
  try { storageManager.restoreFromIndexedDB().catch(() => {}); } catch {}

  this.switchMode("map");

  this._removeLoader();

  const prefetchDetails = () => ensureDetails().catch(() => {});
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(prefetchDetails, { timeout: 2000 });
  } else {
    setTimeout(prefetchDetails, 1500);
  }

  this._initAntiAddiction();
}

export function removeLoader() {
  const loader = document.getElementById("initial-loader");
  if (loader) {
    loader.style.transition = "opacity 0.5s ease-out";
    loader.style.opacity = "0";
    setTimeout(() => loader.remove(), 500);
  }
}

export function initAntiAddiction() {
  eyeCareManager.start();
}

export function showRestModal() {
  eyeCareManager.triggerRestModal();
}
