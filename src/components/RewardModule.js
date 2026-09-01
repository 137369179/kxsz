/**
 *  (Cathy Literacy) - 
 * ------------------------------------------------------------
 * 1.  ——  + 
 * 2.  —— 16 
 * 3.  ——  + / + 
 */

import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { BaseModule } from "../utils/BaseModule.js";
import { mountGameShell, showGameToast } from "./SharedShell.js";
import { getStickers, getMedals, getCalendar, getNewMedalIds, getShopData } from "../utils/rewardEngine.js";
import { GAME_ICONS } from "../utils/gameIcons.js";

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];
const TIER_STYLE = {
  bronze: "from-amber-600 to-yellow-700 border-amber-400",
  silver: "from-slate-300 to-slate-500 border-slate-200",
  gold: "from-yellow-300 via-amber-400 to-yellow-500 border-yellow-200",
  rainbow: "from-fuchsia-400 via-amber-300 to-cyan-300 border-white"
};

export class RewardModule extends BaseModule {
  constructor(container) {
    super(container);
    this.activeTab = "stickers"; // stickers | medals | calendar
    const now = new Date();
    this.calYear = now.getFullYear();
    this.calMonth = now.getMonth(); // 0-based
  }

  render() {
    this.destroy();

    const { content: contentEl, destroy: destroyShell } = mountGameShell(this.container, { activeMode: "reward", heading: "凯茜成就城堡" });
    this._addCleanup(destroyShell);
    const stickers = getStickers();
    const medals = getMedals();
    const earnedMedals = medals.filter((m) => m.earned).length;
    const calendar = getCalendar(this.calYear, this.calMonth);
    const profile = ebbinghausManager.progress.profile;

    contentEl.innerHTML = `
      <div class="w-full h-full overflow-y-auto no-scrollbar bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white select-none">

        <!--  -->
        <div class="relative mx-5 mt-20 rounded-3xl overflow-hidden border-4 border-amber-300/70 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
          <img src="assets/images/cathy_island_life.webp" alt="" class="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />
          <div class="relative z-10 flex items-center justify-between gap-4 bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-transparent px-6 py-5">
            <div>
              <h1 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-orange-400 drop-shadow flex items-center gap-2">
                <span class="flex items-center">${GAME_ICONS.trophy('w-7 h-7')}</span>
                <span>${profile.name}</span>
              </h1>
              <p class="text-[11px] text-yellow-200/80 font-bold mt-1">凯茜冒险家</p>
            </div>
            <div class="flex items-center gap-2">
              <div class="bg-black/50 backdrop-blur-md rounded-2xl px-3 py-2 text-center border border-white/20">
                <div class="text-[10px] text-white/60 font-black">收集贴纸</div>
                <div class="text-sm font-black text-amber-300">${stickers.earnedCount}<span class="text-white/40 text-[10px]">/${stickers.total}</span></div>
              </div>
              <div class="bg-black/50 backdrop-blur-md rounded-2xl px-3 py-2 text-center border border-white/20">
                <div class="text-[10px] text-white/60 font-black">获得勋章</div>
                <div class="text-sm font-black text-amber-300">${earnedMedals}<span class="text-white/40 text-[10px]">/${medals.length}</span></div>
              </div>
              <div class="bg-black/50 backdrop-blur-md rounded-2xl px-3 py-2 text-center border border-white/20">
                <div class="text-[10px] text-white/60 font-black">连续打卡</div>
                <div class="text-sm font-black text-orange-400">${calendar.current}<span class="text-white/40 text-[10px]">天</span></div>
              </div>
            </div>
          </div>
        </div>

        <!--  -->
        <div class="mx-5 mt-4 grid grid-cols-4 gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/15">
          ${[
            { key: "stickers", label: "贴纸墙", iconSvg: (cls) => GAME_ICONS.cards(cls) },
            { key: "medals", label: "荣誉室", iconSvg: (cls) => GAME_ICONS.trophy(cls) },
            { key: "calendar", label: "打卡日历", iconSvg: (cls) => GAME_ICONS.reviewBell(cls) },
            { key: "shop", label: "装扮商城", iconSvg: (cls) => GAME_ICONS.chest(cls) }
          ].map((t) => `
            <button data-tab="${t.key}" class="reward-tab py-2.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-1.5 ${this.activeTab === t.key ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg scale-[1.02]" : "text-white/60 hover:text-white hover:bg-white/10"}">
              <span class="flex items-center">${t.iconSvg("w-4 h-4")}</span>
              <span>${t.label}</span>
            </button>
          `).join("")}
        </div>

        <!--  -->
        <div id="reward-panel" class="mx-5 my-5 pb-10"></div>
      </div>
    `;

    this._renderPanel();
    this._bindTabEvents();
    this._celebrateNewMedals();
  }

  // ------------------------------------------------------------
  // 
  // ------------------------------------------------------------
  _renderPanel() {
    const panel = this.container.querySelector("#reward-panel");
    if (!panel) return;

    if (this.activeTab === "stickers") this._renderStickerWall(panel);
    else if (this.activeTab === "medals") this._renderMedalWall(panel);
    else if (this.activeTab === "shop") this._renderShop(panel);
    else this._renderCalendar(panel);
  }

  /**  */
  _renderStickerWall(panel) {
        const __lockIcon = GAME_ICONS.shieldLock();
    const __sparkleIcon = GAME_ICONS.star();

    const s = getStickers();
    const ratio = s.total ? Math.round((s.earnedCount / s.total) * 100) : 0;

    panel.innerHTML = `
      <div class="bg-white/5 backdrop-blur-md rounded-3xl border border-white/15 p-5">
        <div class="flex items-center justify-between mb-2">
          <h2 class="font-black text-amber-200 flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.cards()}</span>
            <span>汉字贴纸收藏册</span>
          </h2>
          <span class="text-xs font-black text-white/50">已收集 <b class="text-amber-300">${s.earnedCount}</b> / ${s.total} </span>
        </div>
        <div class="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/10 mb-1.5">
          <div class="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 rounded-full transition-all duration-700" style="width:${ratio}%"></div>
        </div>
        <div class="text-[10px] text-white/40 font-bold text-right mb-4">收集进度 ${ratio}%</div>

        ${
          s.earned.length === 0
            ? `<div class="text-center py-10">
                 <div class="w-16 h-16 mx-auto mb-3 opacity-60 flex items-center justify-center">${GAME_ICONS.chest()}</div>
                 <p class="text-white/80 font-black text-sm">还没有收集到汉字贴纸</p>
                 <p class="text-white/40 text-xs font-bold mt-1">去大地图学习汉字，通关即可解锁专属贴纸！</p>
               </div>`
            : `<div class="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2.5">
                 ${s.earned.map((st) => `
                   <div class="sticker-cell relative flex flex-col items-center p-2 rounded-2xl bg-gradient-to-b from-amber-100 to-amber-300 border-2 border-amber-400 shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer" title="掌握度 ${st.masteryRate}%">
                     <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center font-black text-amber-900 border border-amber-400 shadow-inner">${st.char}</div>
                     <span class="text-lg font-black text-amber-950 leading-tight mt-1">${st.char}</span>
                     <span class="text-[9px] font-black text-amber-700">${st.pinyin}</span>
                     <span class="absolute -top-1.5 -right-1.5 text-[9px] bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center shadow">新</span>
                   </div>
                 `).join("")}
               </div>`
        }

        <!-- 待解锁 -->
        ${
          s.upcoming.length
            ? `<div class="mt-5">
                 <h3 class="text-xs font-black text-white/50 mb-2">即将解锁 · 待探索字</h3>
                 <div class="grid grid-cols-6 sm:grid-cols-12 gap-2">
                   ${s.upcoming.map((c) => `
                     <div class="flex flex-col items-center p-1.5 rounded-xl bg-white/5 border border-white/10 opacity-60">
                       <span class="text-lg"><div class="w-5 h-5 inline-block align-middle">${__lockIcon}</div></span>
                       <span class="text-xs font-black text-white/40">?</span>
                     </div>
                   `).join("")}
                 </div>
               </div>`
            : ""
        }
      </div>
    `;
  }

  /** 荣誉勋章墙 */
  _renderMedalWall(panel) {
    const __lockIcon = GAME_ICONS.shieldLock();
    const __trophyIcon = GAME_ICONS.trophy();

    const medals = getMedals();

    panel.innerHTML = `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${medals.map((m) => `
          <div class="medal-card relative rounded-3xl p-4 border-2 ${m.earned ? `bg-gradient-to-b ${TIER_STYLE[m.tier] || TIER_STYLE.gold} shadow-[0_10px_25px_rgba(0,0,0,0.45)]` : "bg-white/5 border-white/10"} flex flex-col items-center text-center ${m.earned ? "hover:scale-105 active:scale-95 transition-transform" : ""}">
            ${m.isNew ? '<span class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white animate-bounce">NEW</span>' : ""}
            <div class="relative flex flex-col items-center justify-center">
              <div class="relative w-24 h-24 ${m.earned ? 'animate-bounce-slow' : 'grayscale opacity-40'}">
                <div class="w-full h-full rounded-full border-4 shadow-lg flex items-center justify-center overflow-hidden 
                            ${m.tier === 'bronze' ? 'border-yellow-700 bg-yellow-900' : 
                              m.tier === 'silver' ? 'border-slate-300 bg-slate-700' : 
                              m.tier === 'gold' ? 'border-yellow-400 bg-yellow-600' : 
                              'border-fuchsia-400 bg-gradient-to-tr from-pink-500 to-indigo-500'}">
                  ${m.earned ? __trophyIcon : `<div class="w-12 h-12">${__lockIcon}</div>`}
                </div>
              </div>
              ${m.earned ? '<span class="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] bg-white text-amber-700 font-black px-3 py-1 rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.3)] border border-amber-200 z-10">已达成</span>' : ""}
            </div>
            <div class="mt-3 font-black text-sm ${m.earned ? "text-amber-950 drop-shadow" : "text-white/80"}">${m.name}</div>
            <div class="text-[10px] font-bold mt-0.5 ${m.earned ? "text-amber-900/80" : "text-white/40"}">${m.desc}</div>

            ${
              m.earned
                ? ""
                : `<div class="w-full mt-2.5">
                     <div class="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                       <div class="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" style="width:${Math.round(m.ratio * 100)}%"></div>
                     </div>
                     <div class="text-[10px] text-white/50 font-black mt-1">${Math.min(m.current, m.target)} / ${m.target}</div>
                   </div>`
            }
          </div>
        `).join("")}
      </div>
    `;
  }

  /**  /  */
  _renderShop(panel) {
        const __sparkleIcon = GAME_ICONS.star();

    const shop = getShopData();

    const previewCircle = (item, size = "w-16 h-16 text-3xl") => {
      const frameCls = item.type === "frame" ? item.frameClass : "";
      const inner =
        item.type === "avatar"
          ? item.icon
            ? `<img src="${item.icon}" class="w-full h-full rounded-full object-cover" />`
            : `<div class="w-10 h-10">${GAME_ICONS.cards()}</div>`
          : `<span class="text-3xl"></span>`;
      return `<div class="rounded-full bg-amber-50 flex items-center justify-center overflow-hidden ${size} ${frameCls}">${inner}</div>`;
    };

    const card = (item) => {
      const state = item.equipped
        ? `<span class="text-[10px] font-black text-amber-300 mt-1">已装备</span>`
        : item.owned
        ? `<button data-buy="${item.id}" class="shop-action mt-1.5 bg-emerald-500/90 hover:bg-emerald-500 text-white text-[11px] font-black px-4 py-1.5 rounded-full active:scale-95 transition-transform">装备</button>`
        : `<button data-buy="${item.id}" class="shop-action mt-1.5 ${item.affordable ? "bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110" : "bg-white/10 opacity-50 cursor-not-allowed"} text-white text-[11px] font-black px-4 py-1.5 rounded-full active:scale-95 transition-transform flex items-center gap-1"><span class="flex items-center">${GAME_ICONS.coin()}</span><span>${item.price}</span></button>`;

      const border = item.equipped
        ? "border-amber-400 bg-amber-400/15"
        : item.owned
        ? "border-emerald-400/40 bg-white/5"
        : "border-white/10 bg-white/5";

      return `
        <div class="rounded-2xl border-2 ${border} p-3 flex flex-col items-center text-center">
          ${previewCircle(item)}
          <div class="text-xs font-black mt-2 ${item.owned ? "text-white" : "text-white/80"}">${item.name}</div>
          ${state}
        </div>
      `;
    };

    panel.innerHTML = `
      <div class="bg-white/5 backdrop-blur-md rounded-3xl border border-white/15 p-5">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="font-black text-amber-200 flex items-center gap-2">
              <span class="flex items-center">${GAME_ICONS.chest()}</span>
              <span>凯茜装扮商城</span>
            </h2>
            <p class="text-[10px] text-white/40 font-bold mt-0.5">使用星币购买限定头像与个性边框</p>
          </div>
          <div class="bg-black/40 backdrop-blur-md flex items-center gap-2 text-amber-300 font-black text-sm px-4 py-2 rounded-full border border-white/15">
            <span class="flex items-center">${GAME_ICONS.coin()}</span>
            <span>${shop.coins}</span>
            <span class="text-[10px] text-white/40 font-black">星币</span>
          </div>
        </div>

        <h3 class="text-xs font-black text-white/50 mb-2.5">稀有头像</h3>
        <div class="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          ${shop.avatars.map(card).join("")}
        </div>

        <h3 class="text-xs font-black text-white/50 mb-2.5">个性边框</h3>
        <div class="grid grid-cols-3 lg:grid-cols-5 gap-3">
          ${shop.frames.map(card).join("")}
        </div>
      </div>
    `;

    this._bindShopActions();
  }

  _bindShopActions() {
    this.container.querySelectorAll(".shop-action").forEach((btn) => {
      this._on(btn, "click", () => {
        const id = btn.dataset.buy;
        const shop = getShopData();
        const item = [...shop.avatars, ...shop.frames].find((i) => i.id === id);
        if (!item) return;

        if (item.owned) {
          if (item.type === "avatar") ebbinghausManager.equipAvatar(item.value);
          else ebbinghausManager.equipFrame(item.id);
          soundAndFX.playSuccessSound();
          showGameToast(this.container, `已装备: ${item.name}`, "success");
        } else {
          const res = ebbinghausManager.purchase(id);
          if (res.ok) {
            if (item.type === "avatar") ebbinghausManager.equipAvatar(item.value);
            else ebbinghausManager.equipFrame(item.id);
            soundAndFX.playCoinClink();
            soundAndFX.playStarChime();
            soundAndFX.triggerConfetti(this.container);
            showGameToast(this.container, `购买成功: ${item.name}`, "success");
          } else {
            soundAndFX.playSoftError();
            showGameToast(this.container, "星币不足，快去学习赚取吧！", "error");
            return;
          }
        }
        this.render();
      });
    });
  }

  /**  */
  _renderCalendar(panel) {
        const __sparkleIcon = GAME_ICONS.star();
    const __trophyIcon = GAME_ICONS.trophy();

    const cal = getCalendar(this.calYear, this.calMonth);
    const monthLabel = `${cal.year}年 ${cal.monthIdx + 1}月`;

    panel.innerHTML = `
      <div class="bg-white/5 backdrop-blur-md rounded-3xl border border-white/15 p-5">

        <!--  -->
        <div class="grid grid-cols-3 gap-2 mb-4">
          <div class="bg-gradient-to-b from-orange-500/30 to-red-600/20 border border-orange-400/40 rounded-2xl p-3 text-center">
            <div class="text-[10px] text-white/60 font-black">当前连续打卡</div>
            <div class="text-xl font-black text-orange-300">${cal.current}  <div class=\"w-5 h-5 inline-block align-middle text-orange-500\">${__sparkleIcon}</div></div>
          </div>
          <div class="bg-gradient-to-b from-yellow-500/30 to-amber-600/20 border border-yellow-400/40 rounded-2xl p-3 text-center">
            <div class="text-[10px] text-white/60 font-black">最高连续打卡</div>
            <div class="text-xl font-black text-yellow-300">${cal.best}  <div class=\"w-6 h-6 inline-block align-middle\">${__trophyIcon}</div></div>
          </div>
          <div class="bg-gradient-to-b from-emerald-500/30 to-teal-600/20 border border-emerald-400/40 rounded-2xl p-3 text-center">
            <div class="text-[10px] text-white/60 font-black">累计打卡天数</div>
            <div class="text-xl font-black text-emerald-300">${cal.totalActiveDays} 天</div>
          </div>
        </div>

        <!--  -->
        <div class="flex items-center justify-between mb-3">
          <button data-cal-nav="-1" class="cal-nav-btn w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 font-black">‹</button>
          <h2 class="font-black text-amber-200 text-sm">${monthLabel} ·  ${cal.monthActive} 天</h2>
          <button data-cal-nav="1" class="cal-nav-btn w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 font-black">›</button>
        </div>

        <!--  -->
        <div class="grid grid-cols-7 gap-1.5 mb-1.5 text-center">
          ${WEEKDAY_LABELS.map((w) => `<div class="text-[10px] font-black text-white/40 py-1">${w}</div>`).join("")}
        </div>

        <!--  -->
        <div class="grid grid-cols-7 gap-1.5">
          ${cal.weeks.flat().map((cell) => {
            if (!cell.key) return '<div></div>';
            const cls = cell.active
              ? "bg-gradient-to-b from-orange-400 to-red-500 border-orange-300 text-white shadow-[0_4px_10px_rgba(249,115,22,0.5)]"
              : "bg-white/5 border-white/10 text-white/35";
            return `
              <div class="cal-cell relative h-10 rounded-xl border ${cls} flex flex-col items-center justify-center">
                <span class="text-xs font-black leading-none">${cell.day}</span>
                ${cell.active ? '<span class="text-[9px] leading-none mt-0.5"><div class=\"w-5 h-5 inline-block align-middle text-orange-500\">${__sparkleIcon}</div></span>' : ""}
                ${cell.isToday ? '<span class="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] bg-cyan-400 text-cyan-950 font-black px-1.5 rounded-full">今</span>' : ""}
              </div>
            `;
          }).join("")}
        </div>

        <p class="text-[10px] text-white/40 font-bold text-center mt-4">每天完成1个汉字或复习即可打卡</p>
      </div>
    `;

    this._bindCalendarNav();
  }

  // ------------------------------------------------------------
  // 
  // ------------------------------------------------------------
  _bindTabEvents() {
    this.container.querySelectorAll(".reward-tab").forEach((btn) => {
      this._on(btn, "click", () => {
        if (this.activeTab === btn.dataset.tab) return;
        soundAndFX.playPop();
        this.activeTab = btn.dataset.tab;
        this.render();
      });
    });
  }

  _bindCalendarNav() {
    this.container.querySelectorAll(".cal-nav-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        soundAndFX.playPop();
        const dir = Number(btn.dataset.calNav);
        this.calMonth += dir;
        if (this.calMonth < 0) { this.calMonth = 11; this.calYear -= 1; }
        if (this.calMonth > 11) { this.calMonth = 0; this.calYear += 1; }
        this.render();
      });
    });
  }

  /** "" */
  _celebrateNewMedals() {
    const __trophyIcon = GAME_ICONS.trophy();
    const newIds = getNewMedalIds();
    if (newIds.length === 0) return;

    const names = getMedals().filter((m) => m.isNew).map((m) => `${m.name}`);
    ebbinghausManager.markMedalsSeen(newIds);

    setTimeout(() => {
      try {
        soundAndFX.playVictoryFanfare();
        soundAndFX.triggerConfetti(this.container);
        showGameToast(this.container, `<div class="w-5 h-5 inline-block align-middle">${__trophyIcon}</div> ${names.join("")}`, "success");
      } catch (e) {
        // 缓存或实现细节导致的非致命错误，静默忽略
      }
    }, 500);
  }
}
