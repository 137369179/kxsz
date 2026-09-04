/** CathyAppManager — module loading, transitions, study sessions */
import { soundAndFX } from "../soundEngine.js";
import { ensureDetails } from "../charDetailLoader.js";
import { eventBus, EVENTS } from "../eventBus.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { showParentGate, showToast } from "../parentGate.js";
import { MODULE_LOADERS, MODE_TO_MODULE } from "./moduleRegistry.js";
import {
  startMicroScheduler,
  stopMicroScheduler,
  resetMicroTimer,
} from "../microReviewScheduler.js";
import { withAnticipatoryFeedback } from "../anticipatoryLoader.js";

export async function ensureModule(modeName) {
  const key = MODE_TO_MODULE[modeName];
  if (!key || key === "map") return this.mapModule;
  const cached = this._moduleInstances.get(key);
  if (cached) return cached;
  const loader = MODULE_LOADERS[key];
  if (!loader) return null;
  try {
    const run = async () => {
      await ensureDetails();
      let cls = this._moduleClasses.get(key);
      if (!cls) {
        cls = await loader();
        this._moduleClasses.set(key, cls);
      }
      const inst = new cls(this.container);
      this._moduleInstances.set(key, inst);
      return inst;
    };
    if (this.container) {
      return await withAnticipatoryFeedback(this.container, run, {
        loadingText: "正在打开…",
        anticipatoryThreshold: 180,
      });
    }
    return await run();
  } catch (err) {
    console.error(`[App] 模块 "${key}" 动态加载失败:`, err);
    return null;
  }
}

export function prefetchModule(modeName) {
  const key = MODE_TO_MODULE[modeName];
  if (!key || key === "map" || this._moduleInstances.has(key) || this._moduleClasses.has(key)) return;
  const loader = MODULE_LOADERS[key];
  if (!loader) return;
  loader().then((cls) => this._moduleClasses.set(key, cls)).catch(() => {});
}

export function transitionToMode(modeName) {
  if (this.isTransitioning) return;
  this.isTransitioning = true;

  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 z-[99999] flex flex-col pointer-events-auto transition-transform duration-500 ease-in-out";

  const topHalf = document.createElement("div");
  topHalf.className = "w-full h-1/2 bg-amber-400 transform -translate-y-full transition-transform duration-500 shadow-[0_10px_20px_rgba(0,0,0,0.3)]";

  const bottomHalf = document.createElement("div");
  bottomHalf.className = "w-full h-1/2 bg-amber-400 transform translate-y-full transition-transform duration-500 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]";

  const centerIcon = document.createElement("div");
  centerIcon.className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full border-4 border-amber-300 shadow-2xl flex items-center justify-center scale-0 transition-transform duration-300 delay-300";
  centerIcon.innerHTML = window.GAME_ICONS && window.GAME_ICONS.sparkle ? window.GAME_ICONS.sparkle("w-16 h-16") : `<div class="w-16 h-16 bg-yellow-300 rounded-full"></div>`;

  overlay.appendChild(topHalf);
  overlay.appendChild(bottomHalf);
  overlay.appendChild(centerIcon);
  document.body.appendChild(overlay);

  const FADE_TIMEOUT_MS = 3000;
  let _settled = false;
  const safetyTimeout = setTimeout(() => {
    if (_settled) return;
    _settled = true;
    console.warn("[App] transition timeout — force resetting overlay only");
    overlay.remove();
    this.isTransitioning = false;
  }, FADE_TIMEOUT_MS);

  requestAnimationFrame(() => {
    topHalf.style.transform = "translateY(0)";
    bottomHalf.style.transform = "translateY(0)";

    setTimeout(() => {
      centerIcon.style.transform = "translate(-50%, -50%) scale(1) rotate(360deg)";

      setTimeout(async () => {
        try {
          await this.switchMode(modeName);
        } catch (err) {
          console.error(`[App] switchMode("${modeName}") threw:`, err);
          eventBus.emit(EVENTS.MODE_ERROR, { mode: modeName, error: err.message, stack: err.stack });
          await this.switchMode("map");
        }

        centerIcon.style.transform = "translate(-50%, -50%) scale(0) rotate(0deg)";

        setTimeout(() => {
          topHalf.style.transform = "translateY(-100%)";
          bottomHalf.style.transform = "translateY(100%)";

          setTimeout(() => {
            _settled = true;
            clearTimeout(safetyTimeout);
            overlay.remove();
            this.isTransitioning = false;
          }, 500);
        }, 300);
      }, 400);
    }, 500);
  });
}

export function endStudySession() {
  if (!this._studySession) return;
  try { this._studySession.stop(); } catch {}
  this._studySession = null;
  try { stopMicroScheduler(); } catch {}
  try { eventBus.emit(EVENTS.STUDY_SESSION_END, {}); } catch {}
}

export function beginStudySession() {
  this._endStudySession();
  this._studySession = ebbinghausManager.createStudySession();
  try { startMicroScheduler({ enabled: true }); } catch {}
  try { eventBus.emit(EVENTS.STUDY_SESSION_START, {}); } catch {}
}

export async function ensureDailyLimitAllowsStudy() {
  const check = ebbinghausManager.checkDailyLimit();
  if (!check.reached) {
    ebbinghausManager.markDailyLimitTriggered(false);
    return true;
  }
  if (ebbinghausManager.isDailyLimitTriggered()) {
    showToast(`今日已学 ${check.current}/${check.limit} 分钟，先休息吧`, { variant: "warn" });
    return false;
  }
  try {
    eventBus.emit(EVENTS.DAILY_LIMIT_REACHED, check);
  } catch {}
  const passed = await showParentGate({
    title: "今日学习时长已满",
    level: "medium",
    confirmText: "延长 30 分钟",
    cancelText: "明天再学",
  });
  if (!passed) {
    ebbinghausManager.markDailyLimitTriggered(true);
    showToast(`今日已学 ${check.current}/${check.limit} 分钟，先休息吧`, { variant: "warn" });
    return false;
  }
  if (!ebbinghausManager.overrideDailyLimit(30)) {
    ebbinghausManager.markDailyLimitTriggered(true);
    showToast("今日延长次数已用完，明天再来吧", { variant: "warn" });
    return false;
  }
  ebbinghausManager.markDailyLimitTriggered(false);
  showToast("已延长 30 分钟学习时间", { variant: "info" });
  return true;
}

export async function switchMode(modeName) {
  try { soundAndFX.stopSpeaking(); } catch {}
  const prev = this.currentMode;
  this.currentMode = modeName;

  if ((prev === "learn" || prev === "review") && modeName !== "learn" && modeName !== "review") {
    this._endStudySession();
  }

  if (this.learnModule && modeName !== "learn") {
    this.learnModule.destroy();
    this.learnModule = null;
  }

  try {
    if (modeName !== "map" && modeName !== "learn") {
      const inst = await this._ensureModule(modeName);
      if (!inst) throw new Error(`模块 "${modeName}" 加载失败`);
    }
    if (modeName === "idiom") {
      this.playModule.currentMode = "idiom";
      this.playModule.render();
      return;
    }
    if (modeName === "poem") {
      this.playModule.currentMode = "poem";
      this.playModule.render();
      return;
    }
    if (modeName === "family") {
      this.playModule.currentMode = "family";
      this.playModule.render();
      return;
    }
    if (modeName === "pk") {
      // 与游乐场大厅统一：走 playHub/pkArena（含 FSRS completeReview）
      this.playModule.currentMode = "pk";
      this.playModule.render();
      return;
    }
    if (modeName === "play" || modeName === "arcade") {
      this.playModule.currentMode = null;
    }
    if (modeName === "review") {
      if (!(await this._ensureDailyLimitAllowsStudy())) {
        this.currentMode = "map";
        this.mapModule.render();
        return;
      }
      this._beginStudySession();
    }
    const targetModule = this._moduleMap[modeName] || this.mapModule;
    targetModule.render();
  } catch (err) {
    console.error(`[App] failed to render mode "${modeName}":`, err);
    eventBus.emit(EVENTS.MODE_ERROR, { mode: modeName, error: err.message });
    try { this.mapModule.render(); } catch (_) {}
  }
}

export async function startLearnFlow(charData) {
  if (!charData || !charData.id || !charData.char) {
    console.error("[App] startLearnFlow: 无效的 charData", charData);
    showToast("学习数据异常，请重试", { variant: "error" });
    return;
  }

  if (!(await this._ensureDailyLimitAllowsStudy())) {
    await this.switchMode("map");
    return;
  }

  const boot = async () => {
    await ensureDetails();
    let LearnModuleCls = this._moduleClasses.get("learn");
    if (!LearnModuleCls) {
      const mod = await import("../../components/LearnModule.js");
      LearnModuleCls = mod.LearnModule;
      this._moduleClasses.set("learn", LearnModuleCls);
    }
    this.currentMode = "learn";
    if (this.learnModule) {
      this.learnModule.destroy();
    }
    try { resetMicroTimer(); } catch {}
    this._beginStudySession();
    this.learnModule = new LearnModuleCls(
      this.container,
      charData,
      () => {
        this.transitionToMode("map");
      },
      () => {
        this.transitionToMode("map");
      }
    );
    this.learnModule.render();
  };

  if (this.container) {
    await withAnticipatoryFeedback(this.container, boot, {
      loadingText: "正在打开课本…",
      anticipatoryThreshold: 180,
    });
  } else {
    await boot();
  }
}
