/** CathyAppManager — boot / loader / eye-care */
import { soundAndFX } from "../soundEngine.js";
import { ensureDetails } from "../charDetailLoader.js";
import { eventBus, EVENTS } from "../eventBus.js";
import { storageManager } from "../storageManager.js";
import { eyeCareManager } from "../eyeCareManager.js";

export function init() {
  this.storage = storageManager;
  const unlockAudio = () => {
    soundAndFX.init();
    this._warmupNeuralVoice();
    window.removeEventListener("click", unlockAudio);
    window.removeEventListener("touchstart", unlockAudio);
  };
  window.addEventListener("click", unlockAudio, { once: true });
  window.addEventListener("touchstart", unlockAudio, { once: true });

  eventBus.on(EVENTS.SWITCH_MODE, ({ mode, highlightPinyin }) => {
    if (mode === "pinyin" && highlightPinyin && this.pinyinModule?.locatePinyin) {
      this.pinyinModule.locatePinyin(highlightPinyin);
    }
    this.transitionToMode(mode);
  });

  eventBus.on(EVENTS.SELECT_CHAR, ({ charData }) => {
    this.startLearnFlow(charData);
  });

  eventBus.on(EVENTS.START_LEARN, ({ charData }) => {
    this.startLearnFlow(charData);
  });

  this._initClickSparkles();
  this._initKeyboardShortcuts();
  this._initGlobalListeners();

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
