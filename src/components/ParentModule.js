/**
 * 凯茜识字 (Cathy Literacy) - 家长中心与安全督学后台
 * 核心功能：
 *  1. 算术安全门禁（乘法口诀随机题目，防止幼儿误入）
 *  2. 艾宾浩斯数据罗盘（字数监控今日进度遗忘健康度难字库统计）
 *  3. 个性化教学设置（每日目标字数护眼防沉迷间隔五步环节定制）
 *  4. 12 枚荣耀成长勋章墙
 *  5. A4 规范田字格描红字帖一键生成与高清打印
 */

import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { mountGameShell, showGameToast } from "./SharedShell.js";
import { BaseModule } from "../utils/BaseModule.js";
import { GAME_ICONS } from "../utils/gameIcons.js";
import { generateParentChallenge } from "../utils/parentGate.js";
import { generateWeeklyReportPoster, generateChampionCertificate } from "../utils/parentHub/parentPoster.js";
import { showSyncQRModal, showImportSyncModal } from "../utils/parentHub/parentSync.js";
import { getChineseNumber, renderParentGate } from "../utils/parentHub/parentGateUI.js";
import { renderActiveTabContent, renderAiLogTab } from "../utils/parentHub/parentTabs.js";
import { bindDashboardEvents } from "../utils/parentHub/parentDashboardEvents.js";

export class ParentModule extends BaseModule {
  constructor(container) {
    super(container);
    this.isUnlocked = false; // 是否通过家长算术门禁
    this.currentTab = "dashboard"; // dashboard | trophies | print | settings
    this.printMode = "today"; // today | difficult | stage1
    this.printGridType = "mi"; // mi (米字格) | tian (田字格)
    this.mathNum1 = Math.floor(Math.random() * 6) + 4; // 4~9
    this.mathNum2 = Math.floor(Math.random() * 6) + 4; // 4~9
    this.mathAnswer = this.mathNum1 * this.mathNum2;
    this.gateFailCount = 0; // 门禁连续失败计数（防儿童穷举试错）
    this.gateLockUntil = 0; // 门禁锁定截止时间戳（ms），3 次失败后冷却
  }

  /** 重新生成门禁算术题（每次进入门禁出新题，防记住答案） */
  _newQuestion() {
    const ch = generateParentChallenge("medium");
    this.mathNum1 = ch.a;
    this.mathNum2 = ch.b;
    this.mathAnswer = ch.answer;
    this.gateFailCount = 0;
  }

  getChineseNumber(n) { return getChineseNumber(n); }

  destroy() {
    if (typeof document !== "undefined") {
      document.getElementById("parent-poster-modal-overlay")?.remove();
      document.getElementById("parent-sync-export-overlay")?.remove();
      document.getElementById("parent-sync-import-overlay")?.remove();
      document.getElementById("cathy-print-iframe")?.remove();
    }
    super.destroy();
  }

  render() {
    this.destroy();
    if (!this.isUnlocked) {
      this.renderParentGate();
    } else {
      this.renderParentDashboard();
    }
  }

  renderParentGate() { return renderParentGate.call(this); }

  // ----------------------------------------------------
  // 2. 家长管理后台 (罗盘勋章字帖打印设置)
  // ----------------------------------------------------
  renderParentDashboard() {
    const progress = ebbinghausManager.progress;
    const charCount = Object.keys(progress.charRecords || {}).length;
    const settings = progress.settings;
    const diffCount = ebbinghausManager.getDifficultCharIds().length;

    const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
      activeMode: "parent",
      heading: "家长管理中心"
    });
    this._addCleanup(destroyShell);

    mainEl.innerHTML = `
      <div class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pb-8 overflow-y-auto no-scrollbar max-h-[calc(100vh-100px)]">
        
        <div class="w-full flex flex-col sm:flex-row items-center justify-between bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl border-2 border-amber-200 mb-6 gap-4">
          <div class="flex items-center gap-3">
            <span class="flex items-center">${GAME_ICONS.shieldLock()}</span>
            <div>
              <h1 class="text-base font-black text-amber-950">凯茜识字 · 家长督学与设置中心</h1>
              <p class="text-xs text-amber-700 font-semibold">学习遗忘罗盘监控 · 12 勋章成长墙 · A4 田字格字帖打印 · 防沉迷设置</p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 bg-amber-50 p-1.5 rounded-full border border-amber-200">
            ${[
              { key: "dashboard", label: "数据罗盘", icon: (cls) => GAME_ICONS.compass(cls) },
              { key: "ai_log", label: "AI伴学日志", icon: (cls) => GAME_ICONS.sparkle(cls) },
              { key: "family", label: "亲子互动房", icon: (cls) => GAME_ICONS.swords(cls) },
              { key: "trophies", label: "荣誉勋章墙", icon: (cls) => GAME_ICONS.trophy(cls) },
              { key: "print", label: "字帖打印", icon: (cls) => GAME_ICONS.print(cls) },
              { key: "settings", label: "督学设置", icon: (cls) => GAME_ICONS.gear(cls) },
              { key: "privacy", label: "隐私与数据", icon: (cls) => GAME_ICONS.shieldLock(cls) }
            ]
              .map(
                (tab) => `
              <button class="parent-tab-btn min-touch-sm px-3.5 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 flex items-center gap-1.5 ${
                this.currentTab === tab.key
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                  : "text-amber-900 hover:bg-amber-100"
              }" data-tab="${tab.key}">
                <span class="flex items-center">${tab.icon("w-3.5 h-3.5")}</span>
                <span>${tab.label}</span>
              </button>
            `
              )
              .join("")}

            <button id="btn-lock-gate" class="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-black px-3 py-1.5 rounded-full shadow-sm ml-1">
              锁定
            </button>
          </div>
        </div>

        ${this.renderActiveTabContent(progress, charCount, settings, diffCount)}

      </div>
    `;

    this.bindDashboardEvents(mainEl);
  }
  renderActiveTabContent(progress, charCount, settings, diffCount) {
    return renderActiveTabContent.call(this, progress, charCount, settings, diffCount);
  }

  renderAiLogTab(progress, charCount, settings, diffCount) {
    return renderAiLogTab.call(this, progress, charCount, settings, diffCount);
  }

  bindDashboardEvents(mainEl) { return bindDashboardEvents.call(this, mainEl); }

  generateWeeklyReportPoster() { return generateWeeklyReportPoster.call(this); }
  generateChampionCertificate() { return generateChampionCertificate.call(this); }
  showSyncQRModal() { return showSyncQRModal.call(this); }
  showImportSyncModal() { return showImportSyncModal.call(this); }
}

