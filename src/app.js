/**
 * 凯茜识字 (Cathy Literacy) - 顶级横屏游戏化主应用控制器
 * 全局模式路由全生命周期管理事件总线响应BGM 自动调度
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
import { soundAndFX } from "./utils/soundEngine.js";
import { neuralVoice } from "./utils/neuralVoice.js";
import { CHARACTER_DATABASE } from "./data/characters.js";
import { EVENTS, eventBus } from "./utils/eventBus.js";
import { storageManager } from "./utils/storageManager.js";

import { BaseModule } from "./utils/BaseModule.js";

class CathyAppManager extends BaseModule {
  constructor() {
    const container = document.getElementById("game-app-viewport");
    super(container);
    this.currentMode = "map";
    this._restModalEl = null;
    this._restCountdownTimer = null;

    // 核心首屏模块立即初始化，其余次级模块按需懒加载 (Lazy Initialization)
    this.mapModule = new MapModule(this.container);
    this._bookModule = null;
    this._playModule = null;
    this._cardModule = null;
    this._parentModule = null;
    this._rewardModule = null;
    this._reviewModule = null;
    this._pkModule = null;
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

  init() {
    // 统一存储管理层（进度、音频设置、家长 PIN 等）
    this.storage = storageManager;
    // 首次交互解锁 Web Audio 音频上下文 + 后台预热神经童声
    const unlockAudio = () => {
      soundAndFX.init();
      this._warmupNeuralVoice();
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });

    // 监听全局事件总线
    eventBus.on(EVENTS.SWITCH_MODE, ({ mode }) => {
      this.transitionToMode(mode);
    });

    eventBus.on(EVENTS.SELECT_CHAR, ({ charData }) => {
      this.startLearnFlow(charData);
    });

    eventBus.on(EVENTS.START_LEARN, ({ charData }) => {
      this.startLearnFlow(charData);
    });

    // 交互增强：全局点击星光特效与键盘无障碍快捷键
    this._initClickSparkles();
    this._initKeyboardShortcuts();
    this._initGlobalListeners();

    // 默认进入世界大地图
    this.switchMode("map");

    // 移除加载骨架屏
    this._removeLoader();

    // 防沉迷护眼系统 (Eye Protection / Time Limit System)
    this._initAntiAddiction();
  }

  /** 移除初始加载骨架，显示游戏内容 */
  _removeLoader() {
    const loader = document.getElementById("initial-loader");
    if (loader) {
      loader.style.transition = "opacity 0.5s ease-out";
      loader.style.opacity = "0";
      setTimeout(() => loader.remove(), 500);
    }
  }

  /** 全局监听器统一注册到 _cleanups，模块销毁时自动清理 */
  _initGlobalListeners() {
    const cleanupPointer = () => window.removeEventListener("pointerdown", this._pointerHandler);
    this._pointerHandler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (!e.clientX || !e.clientY) return;
      this._sparkleAt(e.clientX, e.clientY);
    };
    window.addEventListener("pointerdown", this._pointerHandler, { passive: true });
    this._addCleanup(cleanupPointer);
  }

  /** 单个点击位置的粒子特效（供外部复用，不再直接绑定 listener） */
  _sparkleAt(x, y) {
    const now = Date.now();
    if (now - (this._lastSparkleTime || 0) < 60) return; // 节流 60ms
    this._lastSparkleTime = now;

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
      particle.textContent = "";
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.cssText = `
        left: ${x}px; top: ${y}px;
        color: ${color};
        font-size: ${16 + Math.random() * 10}px;
        text-shadow: 0 0 10px ${color};
        --tx: ${tx}px; --ty: ${ty}px; --rot: ${rot};
      `;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 650);
    }
  }

  _initAntiAddiction() {
    this.sessionStartTime = Date.now();
    this.restModalShown = false;
    this._antiAddictionTimer = this._interval(() => {
      if (this.restModalShown) return;
      const elapsedMinutes = (Date.now() - this.sessionStartTime) / 60000;
      if (elapsedMinutes >= 20) {
        this.showRestModal();
      }
    }, 60000);
  }

  showRestModal() {
    if (this.restModalShown) return;
    this.restModalShown = true;

    // 清除防沉迷定时器，避免再次触发
    if (this._antiAddictionTimer) {
      clearInterval(this._antiAddictionTimer);
      this._antiAddictionTimer = null;
    }

    const REST_DURATION_MS = 5 * 60 * 1000;
    const modal = document.createElement("div");
    modal.setAttribute("data-modal", "true");
    modal.id = "rest-modal";
    modal.className = "fixed inset-0 z-[999999] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in";
    document.body.appendChild(modal);

    const startTime = Date.now();

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((startTime + REST_DURATION_MS - Date.now()) / 1000));
      const min = Math.floor(remaining / 60);
      const sec = remaining % 60;
      const countdownEl = modal.querySelector("#rest-countdown");
      const buttonEl = modal.querySelector("#btn-rest-dismiss");
      if (countdownEl) countdownEl.textContent = `(${min}分${sec.toString().padStart(2, "0")}秒后可继续)`;
      if (buttonEl) buttonEl.disabled = remaining > 0;
    };

    const closeModal = () => {
      this.restModalShown = false;
      modal.remove();
      if (this._antiAddictionTimer) return; // 已有新定时器则不重建
      this._antiAddictionTimer = this._interval(() => {
        if (this.restModalShown) return;
        const elapsedMinutes = (Date.now() - this.sessionStartTime) / 60000;
        if (elapsedMinutes >= 20) this.showRestModal();
      }, 60000);
    };

    modal.innerHTML = `
      <div class="bg-white/10 border-2 border-white/20 p-10 rounded-3xl flex flex-col items-center text-center shadow-2xl max-w-lg">
        <div class="w-32 h-32 mb-6 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.8)]">
           ${window.GAME_ICONS ? window.GAME_ICONS.home("w-20 h-20") : ""}
        </div>
        <h2 class="text-3xl font-black text-emerald-400 mb-4 tracking-widest">休息一下吧！</h2>
        <p class="text-white text-lg font-bold mb-8 leading-relaxed">
          凯茜勇士，你已经连续探险超过 20 分钟啦！<br/>
          眼睛累了需要休息，起来看看远方，喝口水吧！
        </p>
        <div id="rest-countdown" class="text-emerald-200 text-sm font-bold mb-6 animate-pulse">等待中...</div>
        <button id="btn-rest-dismiss" class="bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/20 disabled:cursor-not-allowed text-white font-black px-8 py-3 rounded-full border-2 border-emerald-300 transition-all" disabled>
          继续等待...
        </button>
      </div>
    `;

    modal.querySelector("#btn-rest-dismiss").addEventListener("click", closeModal);

    if (soundAndFX) {
      soundAndFX.playEncouragement();
      soundAndFX.speakPriority("凯茜勇士，你已经探险很久啦！眼睛累了，快休息一下吧！", { kind: "sentence", priority: 2 });
    }

    // 每秒更新倒计时
    const timer = setInterval(() => {
      updateCountdown();
      if (Date.now() >= startTime + REST_DURATION_MS) {
        clearInterval(timer);
        updateCountdown();
        const btn = modal.querySelector("#btn-rest-dismiss");
        if (btn) { btn.disabled = false; btn.textContent = "休息够了，继续探险！"; }
      }
    }, 1000);
    this._addCleanup(() => clearInterval(timer));
  }


  /**
   * 点击/触摸屏幕生成魔法星光粒子反馈
   * 通过 _initGlobalListeners 注册，避免重复绑定
   */
  _initClickSparkles() {
    // 已由 _initGlobalListeners 处理，此处保留兼容接口
  }

  /**
   * 键盘无障碍交互快捷键 (支持 PC/Mac 外接键盘)
   * 所有查询限定在当前 mode 的 container 内，避免跨 modal 误触
   */
  _initKeyboardShortcuts() {
    const handler = (e) => {
      // Escape: 关闭弹窗或返回大地图
      if (e.key === "Escape") {
        // 优先匹配已知的 modal ID（精确，不受 CSS 类名变更影响）
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
        // 兜底：检测任何未被隐藏的全屏 fixed 层
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

      // 绘本翻页 (左右箭头键 / 空格键) — 限定在 bookModule 容器内
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
   * 神经童声后台预热 (晓晓 zh-CN-XiaoxiaoNeural 为全局默认音色, MOS 盲测冠军):
   * 用真实字表的字/词/教学短语预合成  首次点击学字时近乎零等待
   * voice-server 未启动时静默降级系统 TTS, 不阻塞主流程
   */
  _warmupNeuralVoice() {
    try {
      const items = [];
      // 1) 全部识字单字 (当前字表 8 字)
      for (const c of CHARACTER_DATABASE) {
        items.push(c.char);
        // 该字的拼音朗读: "日，rì"
        if (c.pinyin) items.push(`${c.char}，${c.pinyin}`);
      }
      // 2) 高频词组 (每字前 2 词)
      for (const c of CHARACTER_DATABASE) {
        for (const w of (c.words || []).slice(0, 2)) items.push(w.word);
      }
      // 3) 教学高频短语 (与 LearnModule 引导语一致的短前缀)
      items.push("太棒啦", "再试一次", "认一认", "点击大字听发音", "我们一起来学习");
      // 去重后预热 (voice-server 端并发限流, 后台执行)
      neuralVoice.warmup([...new Set(items)]);
    } catch (e) { /* 预热失败不影响主流程 */ }
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

    // 转场超时兜底：3 秒后强制清理，防止页面最小化/标签页休眠导致死锁
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
            this.switchMode("map"); // 降级回地图
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

  /** 带错误边界的模式路由 —— 单个模块崩溃不影响全局 */
  switchMode(modeName) {
    this.currentMode = modeName;

    // 清理之前的临时模块
    if (this.learnModule && modeName !== "learn") {
      this.learnModule.destroy();
      this.learnModule = null;
    }

    // 路由渲染对应模块（try/catch 包裹，失败降级回地图）
    try {
      switch (modeName) {
        case "map":
          this.mapModule.render();
          break;
        case "books":
          this.bookModule.render();
          break;
        case "play":
          this.playModule.render();
          break;
        case "cards":
          this.cardModule.render();
          break;
        case "parent":
          this.parentModule.render();
          break;
        case "reward":
          this.rewardModule.render();
          break;
        case "review":
          this.reviewModule.render();
          break;
        case "pk":
          this.pkModule.render();
          break;
        case "idiom":
          this.playModule.currentMode = "idiom";
          this.playModule.render();
          break;
        default:
          this.mapModule.render();
          break;
      }
    } catch (err) {
      console.error(`[App] failed to render mode "${modeName}":`, err);
      eventBus.emit(EVENTS.MODE_ERROR, { mode: modeName, error: err.message });
      // 尝试降级到地图
      try { this.mapModule.render(); } catch (_) { /* 无法恢复，页面保持空白 */ }
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
        // 完成学习，返回大地图
        this.transitionToMode("map");
      },
      () => {
        // 中途返回地图
        this.transitionToMode("map");
      }
    );
    this.learnModule.render();
  }
}

// 创建应用实例
const cathyAppInstance = new CathyAppManager();

// 仅开发环境暴露全局实例，便于在 DevTools 控制台中调试
if (import.meta.env?.DEV || location.search.includes("debug")) {
  window.cathyApp = cathyAppInstance;
}
