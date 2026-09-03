/**
 *  (Cathy Literacy) - 
 * BGM 
 */

import { MapModule } from "./components/MapModule.js";
import { LearnModule } from "./components/LearnModule.js";
import { BookModule } from "./components/BookModule.js";
import { PlayModule } from "./components/PlayModule.js";
import { CardModule } from "./components/CardModule.js";
import { ParentModule } from "./components/ParentModule.js";
import { RewardModule } from "./components/RewardModule.js";
import { ReviewModule } from "./components/ReviewModule.js";
import { PKModule } from "./components/PKModule.js";
import { PinyinModule } from "./components/PinyinModule.js";
import { TreehouseModule } from "./components/TreehouseModule.js";
import { soundAndFX } from "./utils/soundEngine.js";
import { neuralVoice } from "./utils/neuralVoice.js";
import { CHARACTER_DATABASE } from "./data/characters.js";
import { EVENTS, eventBus } from "./utils/eventBus.js";
import { storageManager } from "./utils/storageManager.js";
import { eyeCareManager } from "./utils/eyeCareManager.js";

import { BaseModule } from "./utils/BaseModule.js";

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

    //  (Lazy Initialization)
    this.mapModule = new MapModule(this.container);
    this._bookModule = null;
    this._playModule = null;
    this._cardModule = null;
    this._parentModule = null;
    this._rewardModule = null;
    this._reviewModule = null;
    this._pkModule = null;
    this._pinyinModule = null;
    this._treehouseModule = null;
    this.learnModule = null;

    this.init();
  }

  get bookModule() {
    if (!this._bookModule) this._bookModule = new BookModule(this.container);
    return this._bookModule;
  }
  get playModule() {
    if (!this._playModule) this._playModule = new PlayModule(this.container);
    return this._playModule;
  }
  get cardModule() {
    if (!this._cardModule) this._cardModule = new CardModule(this.container);
    return this._cardModule;
  }
  get parentModule() {
    if (!this._parentModule) this._parentModule = new ParentModule(this.container);
    return this._parentModule;
  }
  get rewardModule() {
    if (!this._rewardModule) this._rewardModule = new RewardModule(this.container);
    return this._rewardModule;
  }
  get reviewModule() {
    if (!this._reviewModule) this._reviewModule = new ReviewModule(this.container);
    return this._reviewModule;
  }
  get pkModule() {
    if (!this._pkModule) this._pkModule = new PKModule(this.container);
    return this._pkModule;
  }
  get pinyinModule() {
    if (!this._pinyinModule) this._pinyinModule = new PinyinModule(this.container);
    return this._pinyinModule;
  }
  get treehouseModule() {
    if (!this._treehouseModule) this._treehouseModule = new TreehouseModule(this.container);
    return this._treehouseModule;
  }

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
    if (now - (this._lastSparkleTime || 0) < 60) return; // 60ms 节流
    this._lastSparkleTime = now;

    // T9: 视觉降噪与内存保护 —— 粒子总量上限 25 个，避免快速点击满屏粒子过载
    const existing = document.querySelectorAll(".magic-particle");
    if (existing.length > 25) {
      for (let i = 0; i < existing.length - 25; i++) {
        existing[i].remove();
      }
    }

    const ripple = document.createElement("div");
    ripple.className = "magic-ripple";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 550);

    const colors = ["#FFD700", "#FFA500", "#FF69B4", "#00FFFF", "#7FFF00"];
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement("div");
      const angle = (Math.PI * 2 * i) / 5 + (Math.random() - 0.5) * 0.5;
      const dist = 30 + Math.random() * 40;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      const rot = Math.random() * 180 - 90;

      particle.className = "magic-particle";
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 6 + Math.random() * 6;

      particle.style.cssText = `
        position: fixed;
        left: ${x}px; top: ${y}px;
        width: ${size}px; height: ${size}px;
        background: ${color};
        border-radius: 50%;
        box-shadow: 0 0 12px ${color}, 0 0 20px ${color};
        pointer-events: none;
        z-index: 99999;
        --tx: ${tx}px; --ty: ${ty}px; --rot: ${rot};
      `;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 650);
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

    // 3 /
    const FADE_TIMEOUT_MS = 3000;
    let _settled = false;
    const safetyTimeout = setTimeout(() => {
      if (_settled) return;
      _settled = true;
      console.warn("[App] transition timeout — force resetting");
      overlay.remove();
      this.isTransitioning = false;
    }, FADE_TIMEOUT_MS);

    // Phase 1: Close curtain
    requestAnimationFrame(() => {
      topHalf.style.transform = "translateY(0)";
      bottomHalf.style.transform = "translateY(0)";

      setTimeout(() => {
        centerIcon.style.transform = "translate(-50%, -50%) scale(1) rotate(360deg)";

        // Phase 2: Switch underlying DOM
        setTimeout(() => {
          try {
            this.switchMode(modeName);
          } catch (err) {
            console.error(`[App] switchMode("${modeName}") threw:`, err);
            eventBus.emit(EVENTS.MODE_ERROR, { mode: modeName, error: err.message, stack: err.stack });
            this.switchMode("map"); // 
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

  /**  ——  */
  switchMode(modeName) {
    this.currentMode = modeName;

    // 
    if (this.learnModule && modeName !== "learn") {
      this.learnModule.destroy();
      this.learnModule = null;
    }

    // 
    try {
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
      const targetModule = this._moduleMap[modeName] || this.mapModule;
      targetModule.render();
    } catch (err) {
      console.error(`[App] failed to render mode "${modeName}":`, err);
      eventBus.emit(EVENTS.MODE_ERROR, { mode: modeName, error: err.message });
      try { this.mapModule.render(); } catch (_) {}
    }
  }

  startLearnFlow(charData) {
    this.currentMode = "learn";
    if (this.learnModule) {
      this.learnModule.destroy();
    }
    this.learnModule = new LearnModule(
      this.container,
      charData,
      () => {
        // 
        this.transitionToMode("map");
      },
      () => {
        // 
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

