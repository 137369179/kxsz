/**
 * @deprecated 业务路由已并入 PlayModule + playHub/pkArena（含 completeReview）。
 * 本文件仅保留 redirect + 少量供回归单测的辅助方法；勿再扩展业务 UI。
 */

import { BaseModule } from "../utils/BaseModule.js";
import { GAME_ICONS } from "../utils/gameIcons.js";
import { EVENTS } from "../utils/eventBus.js";

export class PKModule extends BaseModule {
  constructor(container) {
    super(container);
    this.maxHp = 100;
    this.playerHp = 100;
    this.bossHp = 100;
    this.currentRound = 0;
    this.options = [];
    this.targetChar = null;
    this.pool = [];
    this.isAnimating = false;
  }

  render() {
    this.destroy();
    // 统一入口：避免与 playHub/pkArena 双实现漂移
    try {
      this._busEmit(EVENTS.SWITCH_MODE, { mode: "pk" });
    } catch (err) {
      console.warn("[PKModule] redirect failed:", err);
    }
  }

  /** @deprecated 仅单测：血条百分比钳制 */
  updateHpUI() {
    const pBar = this.container.querySelector("#pk-player-hp");
    const bBar = this.container.querySelector("#pk-boss-hp");
    const maxHp = Math.max(1, this.maxHp || 100);
    if (pBar) pBar.style.width = Math.min(100, Math.max(0, (this.playerHp / maxHp) * 100)) + "%";
    if (bBar) bBar.style.width = Math.min(100, Math.max(0, (this.bossHp / maxHp) * 100)) + "%";
  }

  /** @deprecated 仅单测：无 animate 时仍能安全 resolve */
  playAttackAnimation(attacker) {
    return new Promise((resolve) => {
      const layer = this.container.querySelector("#pk-projectile-layer");
      if (!layer) return resolve();

      const proj = document.createElement("div");
      proj.className =
        "absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-[0_0_30px_rgba(255,255,255,1)] flex items-center justify-center text-3xl z-50";

      const isPlayer = attacker === "player";
      proj.innerHTML = isPlayer
        ? GAME_ICONS.swords
          ? GAME_ICONS.swords("w-full h-full")
          : ""
        : GAME_ICONS.monster
          ? GAME_ICONS.monster("w-full h-full")
          : "";
      proj.classList.add(isPlayer ? "bg-amber-400" : "bg-rose-500", isPlayer ? "left-40" : "right-48");
      layer.appendChild(proj);

      const onDone = () => {
        try {
          proj.remove();
        } catch {}
        if (this.isDestroyed) return resolve();
        const target = this.container.querySelector(isPlayer ? "#pk-boss-sprite" : "#pk-player-sprite");
        if (target) {
          target.classList.add("animate-shake", "brightness-150", "bg-rose-500/50");
          this._timeout(() => target.classList.remove("animate-shake", "brightness-150", "bg-rose-500/50"), 400);
        }
        resolve();
      };

      if (typeof proj.animate === "function") {
        const keyframes = isPlayer
          ? [
              { left: "160px", transform: "translateY(-50%) scale(1)" },
              { left: "calc(100% - 240px)", transform: "translateY(-50%) scale(2)" },
            ]
          : [
              { right: "192px", transform: "translateY(-50%) scale(1)" },
              { right: "calc(100% - 200px)", transform: "translateY(-50%) scale(2)" },
            ];
        const anim = proj.animate(keyframes, { duration: 400, easing: "ease-in" });
        anim.onfinish = onDone;
      } else {
        this._timeout(onDone, 400);
      }
    });
  }
}
