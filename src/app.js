/**
 *  (Cathy Literacy) - 
 * BGM 
 */

import { MapModule } from "./components/MapModule.js";
import { soundAndFX } from "./utils/soundEngine.js";
import { neuralVoice } from "./utils/neuralVoice.js";
import { CHARACTER_DATABASE } from "./data/characters.js";
import { ensureDetails } from "./utils/charDetailLoader.js";
import { eventBus, EVENTS } from "./utils/eventBus.js";
import { storageManager } from "./utils/storageManager.js";
import { eyeCareManager } from "./utils/eyeCareManager.js";
import { ebbinghausManager } from "./utils/ebbinghaus.js";
import { showParentGate, showToast } from "./utils/parentGate.js";

import { BaseModule } from "./utils/BaseModule.js";

/**
 * 按需模块加载器：首屏只加载 MapModule，其余模块进入对应模式时才动态 import。
 * 键为模块 key（非 mode 名），由 MODE_TO_MODULE 做 mode → key 映射。
 */
const MODULE_LOADERS = {
  books: () => import("./components/BookModule.js").then((m) => m.BookModule),
  play: () => import("./components/PlayModule.js").then((m) => m.PlayModule),
  cards: () => import("./components/CardModule.js").then((m) => m.CardModule),
  parent: () => import("./components/ParentModule.js").then((m) => m.ParentModule),
  reward: () => import("./components/RewardModule.js").then((m) => m.RewardModule),
  review: () => import("./components/ReviewModule.js").then((m) => m.ReviewModule),
  pk: () => import("./components/PKModule.js").then((m) => m.PKModule),
  pinyin: () => import("./components/PinyinModule.js").then((m) => m.PinyinModule),
  treehouse: () => import("./components/TreehouseModule.js").then((m) => m.TreehouseModule),
  learn: () => import("./components/LearnModule.js").then((m) => m.LearnModule),
};

/** mode 名 → 模块 key */
const MODE_TO_MODULE = {
  map: "map",
  books: "books",
  book: "books",
  play: "play",
  arcade: "play",
  idiom: "play",
  poem: "play",
  family: "play",
  cards: "cards",
  card: "cards",
  parent: "parent",
  reward: "reward",
  rewards: "reward",
  review: "review",
  pk: "pk",
  pinyin: "pinyin",
  treehouse: "treehouse",
};

// CanvasRenderingContext2D.prototype.roundRect 跨平台垫片 (兼容低版本 Safari/Chrome/WebKit)
if (typeof CanvasRenderingContext2D !== "undefined" && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
    if (!radii) radii = 0;
    if (typeof radii === "number") {
      radii = [radii, radii, radii, radii];
    } else if (Array.isArray(radii)) {
      if (radii.length === 1) radii = [radii[0], radii[0], radii[0], radii[0]];
      else if (radii.length === 2) radii = [radii[0], radii[1], radii[0], radii[1]];
      else if (radii.length === 3) radii = [radii[0], radii[1], radii[2], radii[1]];
      else if (radii.length >= 4) radii = [radii[0], radii[1], radii[2], radii[3]];
    } else {
      radii = [0, 0, 0, 0];
    }

    let [tl, tr, br, bl] = radii;
    const maxR = Math.min(Math.abs(w), Math.abs(h)) / 2;
    tl = Math.max(0, Math.min(tl, maxR));
    tr = Math.max(0, Math.min(tr, maxR));
    br = Math.max(0, Math.min(br, maxR));
    bl = Math.max(0, Math.min(bl, maxR));

    this.beginPath();
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + tr);
    this.lineTo(x + w, y + h - br);
    this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    this.lineTo(x + bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - bl);
    this.lineTo(x, y + tl);
    this.quadraticCurveTo(x, y, x + tl, y);
    this.closePath();
    return this;
  };
}

// 过滤第三方浏览器扩展（如自动化辅助脚本/QoderWork 等）偶发的无害未捕获 Promise
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const msg = String(event?.reason?.message || event?.reason || "");
    if (
      msg.includes("message channel closed") ||
      msg.includes("asynchronous response") ||
      msg.includes("ResizeObserver loop")
    ) {
      event.preventDefault();
    }
  });
}

class CathyAppManager extends BaseModule {
  constructor() {
    const container = document.getElementById("game-app-viewport");
    super(container);
    this.currentMode = "map";
    this._restModalEl = null;
    this._restCountdownTimer = null;

    // 首屏仅实例化 MapModule；其余模块在首次进入对应模式时动态 import 后再实例化
    this.mapModule = new MapModule(this.container);
    this._moduleClasses = new Map();
    this._moduleInstances = new Map([["map", this.mapModule]]);
    this.learnModule = null;
    this._studySession = null;

    this.init();
  }

  /** 以下 getter 只返回「已加载」的实例；未加载时为 null。取用请走 _ensureModule() */
  get bookModule() { return this._moduleInstances.get("books") || null; }
  get playModule() { return this._moduleInstances.get("play") || null; }
  get cardModule() { return this._moduleInstances.get("cards") || null; }
  get parentModule() { return this._moduleInstances.get("parent") || null; }
  get rewardModule() { return this._moduleInstances.get("reward") || null; }
  get reviewModule() { return this._moduleInstances.get("review") || null; }
  get pkModule() { return this._moduleInstances.get("pk") || null; }
  get pinyinModule() { return this._moduleInstances.get("pinyin") || null; }
  get treehouseModule() { return this._moduleInstances.get("treehouse") || null; }

  get _moduleMap() {
    return {
      map: this.mapModule,
      books: this.bookModule,
      book: this.bookModule,
      play: this.playModule,
      arcade: this.playModule,
      cards: this.cardModule,
      card: this.cardModule,
      parent: this.parentModule,
      reward: this.rewardModule,
      rewards: this.rewardModule,
      review: this.reviewModule,
      pk: this.pkModule,
      pinyin: this.pinyinModule,
      treehouse: this.treehouseModule,
    };
  }

  /**
   * 确保目标模式对应的模块已加载并实例化（按需动态 import + 双重缓存）。
   * 未加载的模块会在此刻下载对应 chunk，已加载的直接返回缓存实例。
   * @param {string} modeName 模式名
   * @returns {Promise<object|null>} 模块实例；加载失败返回 null
   */
  async _ensureModule(modeName) {
    const key = MODE_TO_MODULE[modeName];
    if (!key || key === "map") return this.mapModule;
    const cached = this._moduleInstances.get(key);
    if (cached) return cached;
    const loader = MODULE_LOADERS[key];
    if (!loader) return null;
    try {
      await ensureDetails();
      let cls = this._moduleClasses.get(key);
      if (!cls) {
        cls = await loader();
        this._moduleClasses.set(key, cls);
      }
      const inst = new cls(this.container);
      this._moduleInstances.set(key, inst);
      return inst;
    } catch (err) {
      console.error(`[App] 模块 "${key}" 动态加载失败:`, err);
      return null;
    }
  }

  /** 预取指定模式的模块（空闲期调用，提升首次进入速度） */
  prefetchModule(modeName) {
    const key = MODE_TO_MODULE[modeName];
    if (!key || key === "map" || this._moduleInstances.has(key) || this._moduleClasses.has(key)) return;
    const loader = MODULE_LOADERS[key];
    if (!loader) return;
    loader().then((cls) => this._moduleClasses.set(key, cls)).catch(() => {});
  }

  init() {
    //  PIN 
    this.storage = storageManager;
    //  Web Audio  + 
    const unlockAudio = () => {
      soundAndFX.init();
      this._warmupNeuralVoice();
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });

    // 
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

    // 
    this._initClickSparkles();
    this._initKeyboardShortcuts();
    this._initGlobalListeners();

    // 
    this.switchMode("map");

    // 
    this._removeLoader();

    // 后台预取字库详情层（空闲期加载，不阻塞首屏；进入学习/字卡时已就绪）
    const prefetchDetails = () => ensureDetails().catch(() => {});
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(prefetchDetails, { timeout: 2000 });
    } else {
      setTimeout(prefetchDetails, 1500);
    }

    //  (Eye Protection / Time Limit System)
    this._initAntiAddiction();
  }

  /**  */
  _removeLoader() {
    const loader = document.getElementById("initial-loader");
    if (loader) {
      loader.style.transition = "opacity 0.5s ease-out";
      loader.style.opacity = "0";
      setTimeout(() => loader.remove(), 500);
    }
  }

  /**  _cleanups */
  _initGlobalListeners() {
    const cleanupPointer = () => window.removeEventListener("pointerdown", this._pointerHandler);
    this._pointerHandler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (!e.clientX || !e.clientY) return;
      this._sparkleAt(e.clientX, e.clientY);
    };
    window.addEventListener("pointerdown", this._pointerHandler, { passive: true });
    this._addCleanup(cleanupPointer);

    //  Web Speech  ()
    const handleRejection = (event) => {
      const msg = event.reason?.message || String(event.reason || "");
      if (
        msg.includes("A listener indicated an asynchronous response") ||
        msg.includes("message channel closed") ||
        msg.includes("Receiving end does not exist")
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handleRejection);
    this._addCleanup(() => window.removeEventListener("unhandledrejection", handleRejection));
  }

  /**  listener */
  _sparkleAt(x, y) {
    const now = Date.now();
    // 调研报告 §4 建议B：消除老虎机式视觉刺激，240ms 节流
    if (now - (this._lastSparkleTime || 0) < 240) return;
    this._lastSparkleTime = now;

    // 视觉降噪：同屏粒子硬上限由 25 压制到 8
    const existing = document.querySelectorAll(".magic-particle");
    if (existing.length > 8) {
      for (let i = 0; i < existing.length - 8; i++) {
        existing[i].remove();
      }
    }

    const ripple = document.createElement("div");
    ripple.className = "magic-ripple";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 450);

    const colors = ["#FBBF24", "#F59E0B", "#F472B6", "#38BDF8", "#4ADE80"];
    const particleCount = 2 + Math.floor(Math.random() * 2); // 仅 2-3 个轻量微光粒子
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
      const dist = 18 + Math.random() * 24;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      const rot = Math.random() * 120 - 60;

      particle.className = "magic-particle";
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 4 + Math.random() * 3; // 4-7px，更小更克制

      particle.style.cssText = `
        position: fixed;
        left: ${x}px; top: ${y}px;
        width: ${size}px; height: ${size}px;
        background: ${color};
        border-radius: 50%;
        box-shadow: 0 0 6px ${color};
        pointer-events: none;
        z-index: 99999;
        --tx: ${tx}px; --ty: ${ty}px; --rot: ${rot};
      `;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 500);
    }
  }

  _initAntiAddiction() {
    eyeCareManager.start();
  }

  showRestModal() {
    eyeCareManager.triggerRestModal();
  }


  /**
   * /
   *  _initGlobalListeners 
   */
  _initClickSparkles() {
    //  _initGlobalListeners 
  }

  /**
   *  ( PC/Mac )
   *  mode  container  modal 
   */
  _initKeyboardShortcuts() {
    const handler = (e) => {
      // Escape: 
      if (e.key === "Escape") {
        //  modal ID CSS 
        const knownModalIds = [
          "card-modal-backdrop", "book-finish-modal",
          "boss-win-modal", "pk-win-modal", "rest-modal"
        ];
        let activeModal = null;
        for (const id of knownModalIds) {
          const el = document.getElementById(id);
          if (el && !el.classList.contains("hidden")) {
            activeModal = el;
            break;
          }
        }
        //  fixed 
        if (!activeModal) {
          activeModal = document.querySelector("[data-modal='true']:not(.hidden)");
        }
        if (activeModal) {
          const closeBtn = activeModal.querySelector("#btn-close-modal, #btn-finish-return-shelf, #btn-boss-claim, #btn-pk-claim");
          if (closeBtn) closeBtn.click();
        } else if (this.currentMode !== "map") {
          soundAndFX.playPop();
          this.transitionToMode("map");
        }
      }

      //  ( / ) —  bookModule 
      if (this.currentMode === "books" && this.bookModule && this.bookModule.currentBook) {
        const root = this.bookModule.container || document;
        if (e.key === "ArrowRight") {
          const nextBtn = root.querySelector("#btn-next-page");
          if (nextBtn) nextBtn.click();
        } else if (e.key === "ArrowLeft") {
          const prevBtn = root.querySelector("#btn-prev-page");
          if (prevBtn) prevBtn.click();
        } else if (e.key === " " || e.key === "Spacebar") {
          const karaokeBtn = root.querySelector("#btn-play-karaoke");
          if (karaokeBtn) karaokeBtn.click();
        }
      }
    };
    window.addEventListener("keydown", handler);
    this._addCleanup(() => window.removeEventListener("keydown", handler));
  }

  /**
   *  ( zh-CN-XiaoxiaoNeural , MOS ):
   * //  
   * voice-server  TTS, 
   */
  _warmupNeuralVoice() {
    const runner = () => {
      // 若已探测不可用或处于熔断/关闭状态，不浪费任何算力与请求
      if (neuralVoice.available === false || soundAndFX.neuralVoiceEnabled === false) return;

      try {
        const items = ["真棒！", "再试一次", "太厉害了！", "准备好了吗？", "点击开始！"];
        // 仅对前 5 个核心字做轻量预热，杜绝全库 1490 字大数组瞬时生成导致的 Forced Reflow
        const sampleChars = (CHARACTER_DATABASE || []).slice(0, 5);
        for (const c of sampleChars) {
          if (c.char) items.push(c.char);
          if (c.pinyin) items.push(`${c.char}${c.pinyin}`);
          for (const w of (c.words || []).slice(0, 2)) {
            const wordText = typeof w === "string" ? w : w.word;
            if (wordText) items.push(wordText);
          }
        }
        neuralVoice.warmup([...new Set(items)]);
      } catch (e) { /* 预热失败不影响主流程 */ }
    };

    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(runner, { timeout: 3000 });
    } else {
      setTimeout(runner, 2500);
    }
  }

  
  transitionToMode(modeName) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Create transition overlay
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-[99999] flex flex-col pointer-events-auto transition-transform duration-500 ease-in-out";

    // Top half
    const topHalf = document.createElement("div");
    topHalf.className = "w-full h-1/2 bg-amber-400 transform -translate-y-full transition-transform duration-500 shadow-[0_10px_20px_rgba(0,0,0,0.3)]";

    // Bottom half
    const bottomHalf = document.createElement("div");
    bottomHalf.className = "w-full h-1/2 bg-amber-400 transform translate-y-full transition-transform duration-500 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]";

    // Icon in the center (only visible when closed)
    const centerIcon = document.createElement("div");
    centerIcon.className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full border-4 border-amber-300 shadow-2xl flex items-center justify-center scale-0 transition-transform duration-300 delay-300";
    // Avoid emoji by using window.GAME_ICONS if available
    centerIcon.innerHTML = window.GAME_ICONS && window.GAME_ICONS.sparkle ? window.GAME_ICONS.sparkle("w-16 h-16") : `<div class="w-16 h-16 bg-yellow-300 rounded-full"></div>`;

    overlay.appendChild(topHalf);
    overlay.appendChild(bottomHalf);
    overlay.appendChild(centerIcon);
    document.body.appendChild(overlay);

    // Play woosh sound
    if (soundAndFX && soundAndFX.playPop) {
      soundAndFX.playPop();
    }

    // 安全超时：防止动画卡死
    const FADE_TIMEOUT_MS = 3000;
    let _settled = false;
    const safetyTimeout = setTimeout(() => {
      if (_settled) return;
      _settled = true;
      console.warn("[App] transition timeout — force resetting overlay only");
      overlay.remove();
      this.isTransitioning = false;
      // 不改 currentMode：模块可能已加载成功，强制 map 会导致状态与 UI 脱节
    }, FADE_TIMEOUT_MS);

    // Phase 1: Close curtain
    requestAnimationFrame(() => {
      topHalf.style.transform = "translateY(0)";
      bottomHalf.style.transform = "translateY(0)";

      setTimeout(() => {
        centerIcon.style.transform = "translate(-50%, -50%) scale(1) rotate(360deg)";

        // Phase 2: Switch underlying DOM (async — 等待按需模块加载完成后再揭幕)
        setTimeout(async () => {
          try {
            await this.switchMode(modeName);
          } catch (err) {
            console.error(`[App] switchMode("${modeName}") threw:`, err);
            eventBus.emit(EVENTS.MODE_ERROR, { mode: modeName, error: err.message, stack: err.stack });
            await this.switchMode("map"); // 
          }

          // Phase 3: Open curtain
          centerIcon.style.transform = "translate(-50%, -50%) scale(0) rotate(0deg)";

          setTimeout(() => {
            topHalf.style.transform = "translateY(-100%)";
            bottomHalf.style.transform = "translateY(100%)";

            setTimeout(() => {
              _settled = true;
              clearTimeout(safetyTimeout);
              overlay.remove();
              this.isTransitioning = false;
            }, 500); // Wait for open animation
          }, 300); // Wait for icon shrink
        }, 400); // Wait for icon grow
      }, 500); // Wait for curtain close
    });
  }

  /** P0-4：结束当前学习会话计时 */
  _endStudySession() {
    if (!this._studySession) return;
    try { this._studySession.stop(); } catch {}
    this._studySession = null;
    try { eventBus.emit(EVENTS.STUDY_SESSION_END, {}); } catch {}
  }

  /** P0-4：开启学习会话计时（学习/复习） */
  _beginStudySession() {
    this._endStudySession();
    this._studySession = ebbinghausManager.createStudySession();
    try { eventBus.emit(EVENTS.STUDY_SESSION_START, {}); } catch {}
  }

  /**
   * P0-4：达到每日上限时弹家长门禁，通过则延长 30 分钟
   * @returns {Promise<boolean>}
   */
  async _ensureDailyLimitAllowsStudy() {
    const check = ebbinghausManager.checkDailyLimit();
    if (!check.reached) return true;
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
      showToast(`今日已学 ${check.current}/${check.limit} 分钟，先休息吧`, { variant: "warn" });
      return false;
    }
    if (!ebbinghausManager.overrideDailyLimit(30)) {
      showToast("今日延长次数已用完，明天再来吧", { variant: "warn" });
      return false;
    }
    showToast("已延长 30 分钟学习时间", { variant: "info" });
    return true;
  }

  /**  ——  */
  async switchMode(modeName) {
    const prev = this.currentMode;
    this.currentMode = modeName;

    // 离开学习/复习：结算会话时长
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

  async startLearnFlow(charData) {
    if (!charData || !charData.id || !charData.char) {
      console.error("[App] startLearnFlow: 无效的 charData", charData);
      showToast("学习数据异常，请重试", { variant: "error" });
      return;
    }

    if (!(await this._ensureDailyLimitAllowsStudy())) {
      await this.switchMode("map");
      return;
    }

    await ensureDetails();
    let LearnModuleCls = this._moduleClasses.get("learn");
    if (!LearnModuleCls) {
      const mod = await import("./components/LearnModule.js");
      LearnModuleCls = mod.LearnModule;
      this._moduleClasses.set("learn", LearnModuleCls);
    }
    this.currentMode = "learn";
    if (this.learnModule) {
      this.learnModule.destroy();
    }
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
  }
}

// 浏览器环境实例化应用
const cathyAppInstance = new CathyAppManager();

// 暴露 DevTools 调试钩子
if (typeof window !== "undefined") {
  window.cathyApp = cathyAppInstance;
}

export { cathyAppInstance, CathyAppManager };

