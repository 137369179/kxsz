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

        <!-- 3D HUD (Head-Up Display) -->
        <div class="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none" role="toolbar" aria-label="顶部导航栏">

          <!-- 返回 / 家长入口 -->
          <div class="flex items-center gap-3 pointer-events-auto">
            ${
              activeMode !== "map"
              ? `<button data-nav="map" class="shell-nav-btn w-12 h-12 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border-2 border-amber-300 shadow-xl" title="返回地图" aria-label="返回世界地图">
                  ${GAME_ICONS.home()}
                 </button>`
              : `<button data-nav="parent" class="shell-nav-btn w-12 h-12 bg-gradient-to-tr from-amber-600 to-orange-500 rounded-full text-white flex items-center justify-center hover:scale-105 transition-transform active:scale-90 border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.4)]" title="家长中心" aria-label="进入家长中心">
                  ${GAME_ICONS.shieldLock()}
                 </button>`
            }

            <button id="shell-btn-sound-toggle" class="w-11 h-11 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg" title="声音开关" aria-label="切换声音开关">
              <span id="shell-sound-icon-container" class="flex items-center justify-center" aria-hidden="true">
                ${soundAndFX.isMuted ? GAME_ICONS.speaker(true) : GAME_ICONS.speaker(false)}
              </span>
            </button>
          </div>

          <!-- 星星 & 金币 -->
          <div class="flex items-center gap-3 pointer-events-auto">
            <div class="candy-pill flex items-center gap-2 text-yellow-300 font-black text-sm px-4 py-1.5 rounded-full border-2 border-yellow-300 shadow-lg" title="星星" aria-label="星星数量">
              ${GAME_ICONS.star(false)}
              <span id="shell-stars-count" aria-live="polite">${progress.stars}</span>
            </div>

            <div class="candy-pill flex items-center gap-2 text-amber-300 font-black text-sm px-4 py-1.5 rounded-full border-2 border-amber-300 shadow-lg relative" title="金币" aria-label="金币数量">
              ${GAME_ICONS.coin()}
              <span id="shell-coins-count" class="relative z-10 font-black text-yellow-200" aria-live="polite">${progress.coins}</span>
              <div id="shell-coins-target-anchor" class="absolute left-4 top-4 w-1 h-1"></div>
            </div>
          </div>

        </div>

        <!-- 主内容区 -->
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
  const toast = document.createElement("div");
  const toneClass =
    tone === "error"
      ? "bg-gradient-to-r from-red-600 to-orange-600 border-red-300 text-white"
      : tone === "success"
      ? "bg-gradient-to-r from-green-500 to-emerald-600 border-emerald-200 text-white"
      : "bg-gradient-to-r from-blue-500 to-cyan-500 border-cyan-200 text-white";

  toast.className = `absolute top-24 left-1/2 -translate-x-1/2 z-50 ${toneClass} font-black text-sm px-8 py-3 rounded-full border-2 shadow-[0_10px_25px_rgba(0,0,0,0.5)] animate-scale-up pointer-events-none`;
  toast.innerHTML = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.4s";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 400);
  }, 2200);
}
