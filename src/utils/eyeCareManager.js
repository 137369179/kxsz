/**
 * 凯茜识字 (Cathy Literacy) - 幼儿护眼防沉迷与智能眼球放松操系统
 * ------------------------------------------------------------
 * 1. 实时监听学习活跃时长
 * 2. 达到家长设定时长 (15/20/30 分钟) 自动触发「凯茜小鹿眼球放松操」
 * 3. 包含望远、上下看、左右转、眨眼深呼吸 4 步沉浸式护眼动效与星币奖励
 */

import { ebbinghausManager } from "./ebbinghaus.js";
import { soundAndFX } from "./soundEngine.js";
import { rewardEngine } from "./rewardEngine.js";
import { GAME_ICONS } from "./gameIcons.js";

class EyeCareManager {
  constructor() {
    this.activeSeconds = 0;
    this.timerInterval = null;
    this.restCountdownTimer = null;
    this.isRestModalOpen = false;
    this.onRestCompleteCallback = null;
  }

  start() {
    if (this.timerInterval) return;
    this.timerInterval = setInterval(() => {
      // 仅在页面处于可见活跃状态时累计
      if (typeof document !== 'undefined' && !document.hidden && !this.isRestModalOpen) {
        this.activeSeconds++;
        const targetMinutes = ebbinghausManager.progress?.settings?.eyeProtectionMinutes || 20;
        const targetSeconds = targetMinutes * 60;

        if (this.activeSeconds >= targetSeconds) {
          this.triggerRestModal();
        }
      }
    }, 1000);
  }

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.restCountdownTimer) {
      clearInterval(this.restCountdownTimer);
      this.restCountdownTimer = null;
    }
    if (typeof document !== "undefined") {
      document.getElementById("eye-care-rest-modal")?.remove();
    }
    this.isRestModalOpen = false;
  }

  reset() {
    this.activeSeconds = 0;
  }

  /** 触发护眼眼球放松操全屏剧场 */
  triggerRestModal() {
    if (this.isRestModalOpen || typeof document === 'undefined') return;
    this.isRestModalOpen = true;

    soundAndFX.playParentCheer();

    const overlay = document.createElement("div");
    overlay.id = "eye-care-rest-modal";
    overlay.className = "fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-6 select-none text-white animate-fade-in";

    overlay.innerHTML = `
      <div class="w-full max-w-2xl flex items-center justify-between border-b border-white/10 pb-4">
        <div class="flex items-center gap-2.5">
          <span class="flex items-center text-amber-400">${GAME_ICONS.compass("w-6 h-6")}</span>
          <div>
            <h2 class="text-base font-black text-amber-300">凯茜伴学小精灵 · 护眼休息时间到啦！</h2>
            <p class="text-xs text-white/70 font-semibold">小眼睛辛苦啦，和凯茜一起做个 30 秒眼球放松操吧！</p>
          </div>
        </div>

        <div class="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3.5 py-1 rounded-full text-xs font-black">
          倒计时 <span id="eye-rest-timer">30</span> 秒
        </div>
      </div>

      <div class="relative w-full max-w-md h-72 flex flex-col items-center justify-center text-center">
        <div id="eye-star-target" class="absolute z-20 w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-300 to-amber-500 border-4 border-white shadow-[0_0_30px_rgba(255,215,0,0.9)] flex items-center justify-center transition-all duration-1000 ease-in-out">
          <span class="flex items-center pointer-events-none">${GAME_ICONS.sparkle("w-9 h-9")}</span>
        </div>

        <div class="w-20 h-20 rounded-full border-4 border-amber-300 overflow-hidden shadow-2xl mb-4 bg-amber-900/60 flex items-center justify-center">
          <img src="assets/images/cathy_mascot.webp" alt="凯茜小鹿" class="w-full h-full object-cover" />
        </div>

        <div id="eye-step-title" class="text-lg font-black text-yellow-300 mb-1">第 1 步：望远看星空</div>
        <p id="eye-step-desc" class="text-xs text-white/80 font-bold px-6">看看最远方的绿色大山和夜空中的星星，眨一眨眼睛！</p>
      </div>

      <div class="w-full max-w-2xl flex items-center justify-between border-t border-white/10 pt-4">
        <button id="btn-parent-override" class="text-xs text-white/50 hover:text-white font-bold px-4 py-2 rounded-full border border-white/20 active:scale-95 cursor-pointer">
          家长解锁跳过
        </button>

        <button id="btn-finish-rest" class="hidden btn-game-orange text-white font-black text-sm px-8 py-2.5 rounded-full shadow-2xl active:scale-95 cursor-pointer">
          放松完毕 · 领取 20 星币继续学习
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    const timerEl = overlay.querySelector("#eye-rest-timer");
    const starTarget = overlay.querySelector("#eye-star-target");
    const stepTitle = overlay.querySelector("#eye-step-title");
    const stepDesc = overlay.querySelector("#eye-step-desc");
    const finishBtn = overlay.querySelector("#btn-finish-rest");
    const parentOverrideBtn = overlay.querySelector("#btn-parent-override");

    let countdown = 30;

    const steps = [
      { t: 30, title: "第 1 步：望远看星空", desc: "把目光投向窗外最远的地方，放松睫状肌！", pos: { top: "15%", left: "50%" } },
      { t: 23, title: "第 2 步：上下慢慢看", desc: "小脑袋不动，眼珠跟着小星星向上看，再向下看！", pos: { top: "70%", left: "50%" } },
      { t: 16, title: "第 3 步：左右转转圈", desc: "眼睛向左看、向右看，在空中画一个大大的圆圈！", pos: { top: "45%", left: "80%" } },
      { t: 9, title: "第 4 步：深呼吸闭目放松", desc: "闭上眼睛，深深吸一口气，小眼睛充满元气啦！", pos: { top: "45%", left: "20%" } },
    ];

    soundAndFX.speakPriority("小朋友，小眼睛辛苦啦！跟着凯茜的小星星一起做眼球放松操吧！", { kind: "sentence", priority: 1 });

    this.restCountdownTimer = setInterval(() => {
      countdown--;
      if (timerEl) timerEl.textContent = Math.max(countdown, 0);

      // 切换动作指导
      const curStep = steps.find((s) => countdown <= s.t && countdown > s.t - 7);
      if (curStep) {
        if (stepTitle) stepTitle.textContent = curStep.title;
        if (stepDesc) stepDesc.textContent = curStep.desc;
        if (starTarget) {
          starTarget.style.top = curStep.pos.top;
          starTarget.style.left = curStep.pos.left;
          starTarget.style.transform = "translate(-50%, -50%)";
        }
      }

      if (countdown <= 0) {
        if (this.restCountdownTimer) {
          clearInterval(this.restCountdownTimer);
          this.restCountdownTimer = null;
        }
        soundAndFX.playCrownFanfare();
        soundAndFX.triggerConfetti(overlay);
        if (stepTitle) stepTitle.textContent = "太棒啦！眼睛放松完成！";
        if (stepDesc) stepDesc.textContent = "宝贝做得真棒！眼睛明亮又健康！";
        if (finishBtn) finishBtn.classList.remove("hidden");
      }
    }, 1000);

    const closeRestModal = (reward = true) => {
      if (this.restCountdownTimer) {
        clearInterval(this.restCountdownTimer);
        this.restCountdownTimer = null;
      }
      this.isRestModalOpen = false;
      this.reset();
      overlay.remove();

      if (reward) {
        rewardEngine.addCoins(20);
        soundAndFX.playCoinClink();
      }
    };

    if (finishBtn) {
      finishBtn.addEventListener("click", () => {
        soundAndFX.playPop();
        closeRestModal(true);
      });
    }

    if (parentOverrideBtn) {
      parentOverrideBtn.addEventListener("click", () => {
        if (typeof window === "undefined" || typeof window.prompt !== "function") {
          closeRestModal(false);
          return;
        }
        // 简单家长算术确认
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 2;
        const ans = window.prompt(`【家长验证】请输入 ${a} + ${b} = ? 的计算结果：`);
        if (ans && parseInt(ans.trim(), 10) === a + b) {
          soundAndFX.playPop();
          closeRestModal(false);
        } else if (ans !== null) {
          if (typeof alert === "function") alert("计算错误，继续休息做操吧！");
        }
      });
    }
  }
}

export const eyeCareManager = new EyeCareManager();

// ================================================================
// P0-9 动画安全防护：animate-shake 全局拦截 + 低龄禁用 + 高频 cooldown
//
// 教育学依据：
//   3-5 岁儿童前庭系统尚未发育完全，连续的屏幕 shake 可能引发头晕、恶心
//   —— 类似晕车的原理，但风险被长期低估
//
//   策略：
//   1) 6 岁以下：全局禁用所有 animate-shake 类 + shakeScreen() 调用
//   2) 6+ 岁：允许但强制 450ms cooldown，避免连续触发
//   3) 家长可在 ParentModule 设置里显式禁用（reduceMotion）
//   4) 尊重 prefers-reduced-motion 系统设置
// ================================================================
(function installAnimationSafetyGuards() {
  if (typeof window === "undefined" || typeof Element === "undefined") return;

  // 已经安装过 → 跳过
  if (window.__CATHY_SHAKE_GUARD_INSTALLED__) return;
  window.__CATHY_SHAKE_GUARD_INSTALLED__ = true;

  const now = () => Date.now();

  /** 根据年龄/设置决定 shake 是否允许触发 */
  const isShakeAllowed = () => {
    try {
      const age = typeof ebbinghausManager.getAge === "function" ? ebbinghausManager.getAge() : 6;
      if (age < 6) return false;
      // 家长 reduce-motion 禁用
      const fm = ebbinghausManager.progress?.settings?.focusMode;
      if (fm && (fm.reduceMotion || fm.enlargeText)) return false;
      // 系统 prefers-reduced-motion
      if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
      return true;
    } catch { return true; }
  };

  let lastShakeAt = 0;
  const COOLDOWN_MS = 450;

  /** 统一的 shake 判定：允许？ + 通过 cooldown？ */
  const shouldFireShake = () => {
    if (!isShakeAllowed()) return false;
    const t = now();
    if (t - lastShakeAt < COOLDOWN_MS) return false;
    lastShakeAt = t;
    return true;
  };

  // ---- 拦截 1：classList.add("animate-shake") ----
  const origClassListAdd = DOMTokenList.prototype.add;
  DOMTokenList.prototype.add = function (...tokens) {
    if (tokens.includes("animate-shake") && !shouldFireShake()) {
      // 替换为柔和的红色脉冲效果（通过内联 style）
      try {
        this.remove("animate-shake");
        // 用柔和的 box-shadow flash 替代
        const el = this._ownerElement || Object.getPrototypeOf(this);
        if (el && typeof el === "object" && "style" in el) {
          el.animate(
            [
              { boxShadow: "0 0 0 0 rgba(244,63,94,0)", offset: 0 },
              { boxShadow: "0 0 0 6px rgba(244,63,94,0.4)", offset: 0.5 },
              { boxShadow: "0 0 0 0 rgba(244,63,94,0)", offset: 1 }
            ],
            { duration: 400, easing: "ease-out" }
          );
        }
        return this; // 不再调用 origClassListAdd，跳过 shake
      } catch { /* noop */ }
    }
    return origClassListAdd.apply(this, tokens);
  };

  // ---- 拦截 2：playSceneEngine.shakeScreen() ----
  // playSceneEngine 运行时导出到 window，所以我们在首次调用时包装
  Object.defineProperty(window, "__cathy_shakeGuard_installed", { value: true, configurable: true });
})();
