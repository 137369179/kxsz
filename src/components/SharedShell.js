/**
 *  (Cathy Literacy) - 1:1 
 *  3D  HUD 
 */

import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { EVENTS, eventBus } from "../utils/eventBus.js";
import { GAME_ICONS } from "../utils/gameIcons.js";

export function mountGameShell(container, { activeMode, heading }) {
  const progress = ebbinghausManager.progress;

  container.innerHTML = `
    <div class="relative w-full h-full min-h-[640px] flex flex-col select-none overflow-hidden bg-gradient-to-b from-sky-400 via-amber-200 to-orange-200">

      <!--  3D HUD (Head-Up Display) -->
      <div class="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        
        <!-- // -->
        <div class="flex items-center gap-3 pointer-events-auto">
          ${
            activeMode !== "map" 
            ? `<button data-nav="map" class="shell-nav-btn w-12 h-12 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border-2 border-amber-300 shadow-xl" title="返回地图">
                ${GAME_ICONS.home("w-7 h-7")}
               </button>`
            : `<button data-nav="parent" class="shell-nav-btn w-12 h-12 bg-gradient-to-tr from-amber-600 to-orange-500 rounded-full text-white flex items-center justify-center hover:scale-105 transition-transform active:scale-90 border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.4)]" title="家长中心">
                ${GAME_ICONS.shieldLock("w-7 h-7")}
               </button>`
          }
          
          <button id="shell-btn-sound-toggle" class="w-11 h-11 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg" title="声音开关">
            <span id="shell-sound-icon-container" class="flex items-center justify-center">
              ${soundAndFX.isMuted ? GAME_ICONS.speaker("w-6 h-6", true) : GAME_ICONS.speaker("w-6 h-6", false)}
            </span>
          </button>
        </div>

        <!--  -->
        <div class="flex items-center gap-3 pointer-events-auto">
          <div class="candy-pill flex items-center gap-2 text-yellow-300 font-black text-sm px-4 py-1.5 rounded-full border-2 border-yellow-300 shadow-lg" title="星星">
            ${GAME_ICONS.star("w-5 h-5", true)}
            <span id="shell-stars-count">${progress.stars}</span>
          </div>

          <div class="candy-pill flex items-center gap-2 text-amber-300 font-black text-sm px-4 py-1.5 rounded-full border-2 border-amber-300 shadow-lg relative" title="金币">
            ${GAME_ICONS.coin("w-6 h-6")}
            <span id="shell-coins-count" class="relative z-10 font-black text-yellow-200">${progress.coins}</span>
            <div id="shell-coins-target-anchor" class="absolute left-4 top-4 w-1 h-1"></div>
          </div>
        </div>

      </div>

      <!--  -->
      <main class="shell-content relative z-10 flex-1 w-full overflow-hidden no-scrollbar">
      </main>

    </div>
  `;

  //  (UI )
  eventBus.on("COINS_UPDATED", (data) => {
     const coinSpan = container.querySelector("#shell-coins-count");
     if (coinSpan) {
        coinSpan.textContent = data.current;
        const parent = coinSpan.parentElement;
        parent.classList.add("scale-125", "text-yellow-400", "shadow-[0_0_25px_rgba(253,224,71,0.9)]");
        setTimeout(() => parent.classList.remove("scale-125", "text-yellow-400", "shadow-[0_0_25px_rgba(253,224,71,0.9)]"), 500);
     }
  });

  // 
  container.querySelectorAll(".shell-nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      soundAndFX.playPop();
      eventBus.emit(EVENTS.SWITCH_MODE, { mode: btn.dataset.nav });
    });
  });

  const soundBtn = container.querySelector("#shell-btn-sound-toggle");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      eventBus.emit(EVENTS.SOUND_TOGGLE_MUTE);
      const muted = soundAndFX.toggleMute();
      const containerEl = soundBtn.querySelector("#shell-sound-icon-container");
      if (containerEl) {
        containerEl.innerHTML = muted ? GAME_ICONS.speaker("w-6 h-6", true) : GAME_ICONS.speaker("w-6 h-6", false);
      }
    });
  }

  return container.querySelector(".shell-content");
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
