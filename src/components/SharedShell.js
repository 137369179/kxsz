/**
 * 凯茜识字 (Cathy Literacy) - 1:1 横屏全局 HUD Shell
 * 返回 { content, destroy } —— destroy 用于模块切换时清理所有监听器
 */

import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { EVENTS, eventBus } from "../utils/eventBus.js";
import { GAME_ICONS } from "../utils/gameIcons.js";

/**
 * 挂载游戏 HUD shell，返回 { content: mainEl, destroy: () => void }
 * destroy 必须在上一个 shell 被销毁时调用，防止监听器泄漏
 */
export function mountGameShell(container, { activeMode, heading }) {
  const progress = ebbinghausManager.progress;
  const cleanups = [];

  const buildShell = () => {
    container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col select-none overflow-hidden bg-gradient-to-b from-sky-400 via-amber-200 to-orange-200" role="application" aria-label="凯茜识字学习应用">

        <div class="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none" role="toolbar" aria-label="顶部导航栏">

          <div class="flex items-center gap-3 pointer-events-auto">
            ${
              activeMode !== "map"
              ? `<button data-nav="map" class="shell-nav-btn w-12 h-12 sm:w-14 sm:h-14 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/70 transition-transform active:scale-90 border-2 border-amber-300 shadow-2xl cursor-pointer" title="返回地图" aria-label="返回世界地图" data-speak="返回世界地图">
                  ${GAME_ICONS.home("w-7 h-7 sm:w-8 sm:h-8")}
                 </button>`
              : `<button data-nav="parent" class="shell-nav-btn w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-amber-600 to-orange-500 rounded-full text-white flex items-center justify-center hover:scale-105 transition-transform active:scale-90 border-2 border-white shadow-[0_4px_16px_rgba(0,0,0,0.5)] cursor-pointer" title="家长中心" aria-label="进入家长中心" data-speak="家长中心，需要大人来回答问题哦">
                  ${GAME_ICONS.shieldLock("w-7 h-7 sm:w-8 sm:h-8")}
                 </button>`
            }

            <button id="shell-btn-sound-toggle" class="w-12 h-12 sm:w-14 sm:h-14 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/70 transition-transform active:scale-90 border-2 border-white/40 shadow-xl cursor-pointer" title="声音开关" aria-label="切换声音开关">
              <span id="shell-sound-icon-container" class="flex items-center justify-center shrink-0" aria-hidden="true">
                ${soundAndFX.isMuted ? GAME_ICONS.speaker("w-7 h-7 sm:w-8 sm:h-8", true) : GAME_ICONS.speaker("w-7 h-7 sm:w-8 sm:h-8", false)}
              </span>
            </button>
          </div>

          <div class="flex items-center gap-3 pointer-events-auto">
            <div class="candy-pill flex items-center gap-2 text-yellow-300 font-black text-sm sm:text-base px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border-2 border-yellow-300 shadow-xl bg-black/50 backdrop-blur-md" title="星星" aria-label="星星数量">
              ${GAME_ICONS.star("w-6 h-6 sm:w-7 sm:h-7", false)}
              <span id="shell-stars-count" aria-live="polite">${progress.stars}</span>
            </div>

            <div class="candy-pill flex items-center gap-2 text-amber-300 font-black text-sm sm:text-base px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border-2 border-amber-300 shadow-xl bg-black/50 backdrop-blur-md relative" title="金币" aria-label="金币数量">
              ${GAME_ICONS.coin("w-6 h-6 sm:w-7 sm:h-7")}
              <span id="shell-coins-count" class="relative z-10 font-black text-yellow-200" aria-live="polite">${progress.coins}</span>
              <div id="shell-coins-target-anchor" class="absolute left-4 top-4 w-1 h-1"></div>
            </div>
          </div>

        </div>

        <main class="shell-content relative z-10 flex-1 w-full overflow-hidden no-scrollbar" role="main" aria-label="学习内容区域">
        </main>

      </div>
    `;

    return container.querySelector(".shell-content");
  };

  const mainEl = buildShell();

  // 进度更新监听 — 返回卸载函数
  const offCoins = eventBus.on(EVENTS.PROGRESS_CHANGED, (data) => {
    const coinSpan = container.querySelector("#shell-coins-count");
    const starSpan = container.querySelector("#shell-stars-count");
    if (coinSpan && data.progress) {
      coinSpan.textContent = data.progress.coins;
      const pill = coinSpan.parentElement;
      pill.classList.add("scale-125", "shadow-[0_0_25px_rgba(253,224,71,0.9)]");
      setTimeout(() => pill.classList.remove("scale-125", "shadow-[0_0_25px_rgba(253,224,71,0.9)]"), 500);
    }
    if (starSpan && data.progress) {
      starSpan.textContent = data.progress.stars;
    }
  });
  cleanups.push(offCoins);

  // 导航按钮
  const navBtns = container.querySelectorAll(".shell-nav-btn");
  navBtns.forEach((btn) => {
    const fn = () => {
      soundAndFX.playPop();
      eventBus.emit(EVENTS.SWITCH_MODE, { mode: btn.dataset.nav });
    };
    btn.addEventListener("click", fn);
    cleanups.push(() => btn.removeEventListener("click", fn));
  });

  // 声音切换
  const soundBtn = container.querySelector("#shell-btn-sound-toggle");
  if (soundBtn) {
    const soundFn = () => {
      eventBus.emit(EVENTS.SOUND_TOGGLE_MUTE);
      const muted = soundAndFX.toggleMute();
      const containerEl = soundBtn.querySelector("#shell-sound-icon-container");
      if (containerEl) {
        containerEl.innerHTML = muted
          ? GAME_ICONS.speaker(true)
          : GAME_ICONS.speaker(false);
      }
    };
    soundBtn.addEventListener("click", soundFn);
    cleanups.push(() => soundBtn.removeEventListener("click", soundFn));
  }

  // 返回统一的 destroy 接口
  return {
    content: mainEl,
    destroy() {
      while (cleanups.length) {
        const fn = cleanups.pop();
        try { fn(); } catch {}
      }
    },
  };
}

export function showGameToast(container, message, tone = "info") {
  if (typeof container === "string") {
    tone = message || "info";
    message = container;
    container = (typeof document !== "undefined" && (document.getElementById("game-app-viewport") || document.body)) || null;
  }
  // 兼容误传 options 对象：{ duration, icon } → 忽略，视为 info
  if (tone && typeof tone === "object") tone = "info";
  if (!container || typeof container.appendChild !== "function") {
    container = (typeof document !== "undefined" && (document.getElementById("game-app-viewport") || document.body)) || null;
  }
  if (!container || typeof document === "undefined") return;

  const toast = document.createElement("div");
  const toneClass =
    tone === "error"
      ? "bg-gradient-to-r from-red-600 to-orange-600 border-red-300 text-white"
      : tone === "success"
      ? "bg-gradient-to-r from-green-500 to-emerald-600 border-emerald-200 text-white"
      : "bg-gradient-to-r from-blue-500 to-cyan-500 border-cyan-200 text-white";

  toast.className = `absolute top-24 left-1/2 -translate-x-1/2 z-50 ${toneClass} font-black text-sm px-8 py-3 rounded-full border-2 shadow-[0_10px_25px_rgba(0,0,0,0.5)] animate-scale-up pointer-events-none`;
  // P0-3 无障碍：toast 为状态播报，读屏/辅助技术可感知
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  // 安全防护：全量采用 textContent 纯文本赋值，彻底杜绝基于 Toast 的 DOM XSS
  toast.textContent = String(message ?? "");
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.4s";
    toast.style.opacity = "0";
    setTimeout(() => { try { toast.remove(); } catch {} }, 400);
  }, 2200);
}
