/**
 * 凯茜识字 (Cathy Literacy) - 顶级横屏游戏化主应用控制器
 * 全局模式路由、全生命周期管理、事件总线响应、BGM 自动调度
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

class CathyAppManager {
  constructor() {
    this.container = document.getElementById("game-app-viewport");
    this.currentMode = "map";

    // 常驻模块实例
    this.mapModule = new MapModule(this.container);
    this.bookModule = new BookModule(this.container);
    this.playModule = new PlayModule(this.container);
    this.cardModule = new CardModule(this.container);
    this.parentModule = new ParentModule(this.container);
    this.rewardModule = new RewardModule(this.container);
    this.reviewModule = new ReviewModule(this.container);
    this.pkModule = new PKModule(this.container);
    this.learnModule = null;

    this.init();
  }

  init() {
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
      this.switchMode(mode);
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

    // 默认进入世界大地图
    this.switchMode("map");
  }

  /**
   * 点击/触摸屏幕生成魔法星光粒子反馈
   */
  _initClickSparkles() {
    const createSparkle = (x, y) => {
      const colors = ["#FFD700", "#FFA500", "#FF69B4", "#00FFFF", "#7FFF00"];
      for (let i = 0; i < 4; i++) {
        const span = document.createElement("span");
        const angle = (Math.PI * 2 * i) / 4 + (Math.random() - 0.5);
        const dist = 25 + Math.random() * 20;
        const targetX = Math.cos(angle) * dist;
        const targetY = Math.sin(angle) * dist;
        const color = colors[Math.floor(Math.random() * colors.length)];

        span.textContent = "✦";
        span.style.cssText = `
          position: fixed;
          left: ${x}px;
          top: ${y}px;
          color: ${color};
          font-size: ${14 + Math.random() * 8}px;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%) scale(0.6);
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease-out;
          opacity: 1;
          text-shadow: 0 0 8px ${color};
        `;
        document.body.appendChild(span);

        requestAnimationFrame(() => {
          span.style.transform = `translate(calc(-50% + ${targetX}px), calc(-50% + ${targetY}px)) scale(1.3) rotate(${Math.random() * 90}deg)`;
          span.style.opacity = "0";
        });

        setTimeout(() => span.remove(), 420);
      }
    };

    window.addEventListener("pointerdown", (e) => {
      // 仅在主视口内生成点击星光
      if (e.clientX && e.clientY) {
        createSparkle(e.clientX, e.clientY);
      }
    }, { passive: true });
  }

  /**
   * 键盘无障碍交互快捷键 (支持 PC/Mac 外接键盘)
   */
  _initKeyboardShortcuts() {
    window.addEventListener("keydown", (e) => {
      // Escape: 关闭弹窗或返回大地图
      if (e.key === "Escape") {
        const modalBackdrop = document.querySelector("#card-modal-backdrop, #book-finish-modal, #boss-win-modal, #pk-win-modal");
        if (modalBackdrop && !modalBackdrop.classList.contains("hidden")) {
          const closeBtn = modalBackdrop.querySelector("#btn-close-modal, #btn-finish-return-shelf, #btn-boss-claim, #btn-pk-claim");
          if (closeBtn) closeBtn.click();
        } else if (this.currentMode !== "map") {
          soundAndFX.playPop();
          this.switchMode("map");
        }
      }

      // 绘本翻页 (左右箭头键 / 空格键)
      if (this.currentMode === "books" && this.bookModule && this.bookModule.currentBook) {
        if (e.key === "ArrowRight") {
          const nextBtn = document.querySelector("#btn-next-page");
          if (nextBtn) nextBtn.click();
        } else if (e.key === "ArrowLeft") {
          const prevBtn = document.querySelector("#btn-prev-page");
          if (prevBtn) prevBtn.click();
        } else if (e.key === " " || e.key === "Spacebar") {
          const karaokeBtn = document.querySelector("#btn-play-karaoke");
          if (karaokeBtn) karaokeBtn.click();
        }
      }
    });
  }

  /**
   * 神经童声后台预热 (晓依 zh-CN-XiaoyiNeural 为全局默认音色):
   * 用真实字表的字/词/教学短语预合成 → 首次点击学字时近乎零等待。
   * voice-server 未启动时静默降级系统 TTS, 不阻塞主流程。
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

  switchMode(modeName) {
    this.currentMode = modeName;

    // 清理之前的临时模块
    if (this.learnModule && modeName !== "learn") {
      this.learnModule.destroy();
      this.learnModule = null;
    }

    // 路由渲染对应模块
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
        this.switchMode("map");
      },
      () => {
        // 中途返回地图
        this.switchMode("map");
      }
    );
    this.learnModule.render();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.cathyApp = new CathyAppManager();
});
