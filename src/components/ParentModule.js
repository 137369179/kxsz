/**
 * 凯茜识字 (Cathy Literacy) - 家长中心与安全督学后台
 * 核心功能：
 *  1. 算术安全门禁（乘法口诀随机题目，防止幼儿误入）
 *  2. 艾宾浩斯数据罗盘（字数监控今日进度遗忘健康度难字库统计）
 *  3. 个性化教学设置（每日目标字数护眼防沉迷间隔五步环节定制）
 *  4. 12 枚荣耀成长勋章墙
 *  5. A4 规范田字格描红字帖一键生成与高清打印
 */

import { CHARACTER_DATABASE } from "../data/characters.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { mountGameShell, showGameToast } from "./SharedShell.js";
import { BaseModule } from "../utils/BaseModule.js";
import { GAME_ICONS } from "../utils/gameIcons.js";
import { printWorksheet, getTodayWorksheetChars, getDifficultWorksheetChars } from "../utils/worksheetGenerator.js";
import { storageManager } from "../utils/storageManager.js";
import { rewardEngine } from "../utils/rewardEngine.js";
import { showConfirm, generateParentChallenge } from "../utils/parentGate.js";
import { generateWeeklyReportPoster } from "../utils/parentHub/parentPoster.js";
import { showSyncQRModal, showImportSyncModal } from "../utils/parentHub/parentSync.js";
import { getChineseNumber, renderParentGate } from "../utils/parentHub/parentGateUI.js";
import { renderActiveTabContent, renderAiLogTab } from "../utils/parentHub/parentTabs.js";

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

  bindDashboardEvents(mainEl) {
    // 标签切换
    mainEl.querySelectorAll(".parent-tab-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        this.currentTab = btn.dataset.tab;
        soundAndFX.playPop();
        this.render();
      });
    });

    // 重新锁定
    const lockBtn = mainEl.querySelector("#btn-lock-gate");
    if (lockBtn) {
      this._on(lockBtn, "click", () => {
        soundAndFX.playPop();
        this.isUnlocked = false;
        this.render();
      });
    }

    // 隐私与数据：导出进度备份
    const exportBtn = mainEl.querySelector("#btn-export-data");
    if (exportBtn) {
      this._on(exportBtn, "click", () => {
        try {
          const data = {};
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && /cathy/i.test(k)) data[k] = localStorage.getItem(k);
          }
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `cathy-backup-${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 2000);
          soundAndFX.playSuccessSound();
          showGameToast(this.container, "进度备份已导出！", "success");
        } catch (e) {
          console.warn("[ParentModule] 导出失败:", e);
          showGameToast(this.container, "导出失败，请重试", "error");
        }
      });
    }

    // 隐私与数据：清除全部学习数据（二次确认，项目内 Modal）
    const wipeBtn = mainEl.querySelector("#btn-wipe-data");
    if (wipeBtn) {
      this._on(wipeBtn, "click", async () => {
        const ok = await showConfirm({
          title: "清除全部学习数据",
          message: "此操作不可恢复，建议先导出备份！",
          variant: "danger",
          okText: "确认清除",
          cancelText: "取消",
        });
        if (!ok) return;
        try {
          storageManager.clearAllCathyKeys();
          const rm = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && /cathy/i.test(k)) rm.push(k);
          }
          rm.forEach((k) => { try { localStorage.removeItem(k); } catch {} });
        } catch (e) {
          console.warn("[ParentModule] 清除失败:", e);
        }
        soundAndFX.playSuccessSound();
        showGameToast(this.container, "学习数据已清除，正在刷新…", "success");
        setTimeout(() => { try { location.reload(); } catch {} }, 1200);
      });
    }

    // T18: 语音播报 AI 伴学诊断
    const speakAiBtn = mainEl.querySelector("#btn-speak-ai-log");
    if (speakAiBtn) {
      this._on(speakAiBtn, "click", () => {
        soundAndFX.playPop();
        const advice = mainEl.querySelector("#ai-tutor-advice-text")?.textContent || "宝宝学习非常棒！";
        soundAndFX.speakPriority(`家长朋友你好！${advice}`, { kind: "tutor", priority: 1, emotion: "gentle" });
      });
    }

    // 生成成长周报海报
    const posterBtn = mainEl.querySelector("#btn-gen-report-poster");
    if (posterBtn) {
      this._on(posterBtn, "click", () => {
        soundAndFX.playPop();
        this.generateWeeklyReportPoster();
      });
    }

    // 切换字帖内容模式
    mainEl.querySelectorAll(".btn-print-mode").forEach((btn) => {
      this._on(btn, "click", () => {
        soundAndFX.playPop();
        this.printMode = btn.dataset.mode;
        this.renderParentDashboard();
      });
    });

    // 格式切换：米字格 / 田字格
    const gridTypeBtns = mainEl.querySelectorAll(".btn-grid-type");
    gridTypeBtns.forEach(btn => {
      this._on(btn, "click", () => {
        soundAndFX.playPop();
        this.printGridType = btn.dataset.grid;
        this.renderParentDashboard();
      });
    });

    // 打印字帖与棋盘
    const printBtn = mainEl.querySelector("#btn-trigger-print");
    if (printBtn) {
      this._on(printBtn, "click", () => {
        soundAndFX.playPop();
        let charsToPrint = [];
        const gridLabel = this.printGridType === "tian" ? "田字格" : "米字格";
        let title = `凯茜识字 · 儿童专属${gridLabel}练字帖`;
        if (this.printMode === "difficult") {
          charsToPrint = getDifficultWorksheetChars();
          title = `凯茜识字 · 难字突破${gridLabel}字帖`;
        } else if (this.printMode === "stage1") {
          charsToPrint = CHARACTER_DATABASE.filter((c) => c.stage === 1).slice(0, 8);
          title = `凯茜识字 · 启蒙阶段${gridLabel}字帖`;
        } else {
          charsToPrint = getTodayWorksheetChars();
          title = `凯茜识字 · 今日所学${gridLabel}字帖`;
        }
        printWorksheet(charsToPrint, title, { gridType: this.printGridType });
      });
    }

    const printLudoBtn = mainEl.querySelector("#btn-print-ludo");
    if (printLudoBtn) {
      this._on(printLudoBtn, "click", () => {
        soundAndFX.playPop();
        window.print();
      });
    }

    // 亲子飞行棋：掷骰子
    let currentLudoPos = 0;
    const rollDiceBtn = mainEl.querySelector("#btn-roll-dice");
    if (rollDiceBtn) {
      const tiles = mainEl.querySelectorAll(".ludo-tile");
      if (tiles.length > 0) {
        tiles[0].querySelector(".ludo-pawn")?.classList.remove("hidden");
      }

      this._on(rollDiceBtn, "click", () => {
        const roll = Math.floor(Math.random() * 6) + 1;
        const diceBadge = mainEl.querySelector("#dice-result-badge");
        if (diceBadge) diceBadge.textContent = `${roll} 点`;

        soundAndFX.playPop();
        currentLudoPos = (currentLudoPos + roll) % tiles.length;

        tiles.forEach((t, idx) => {
          const pawn = t.querySelector(".ludo-pawn");
          if (idx === currentLudoPos) {
            pawn?.classList.remove("hidden");
            t.classList.add("ring-4", "ring-orange-400", "bg-orange-200");
            const ch = t.dataset.char;
            const py = t.dataset.pinyin;
            soundAndFX.speakPriority(`走到第 ${idx + 1} 格：“${ch}”，拼音 ${py}`, { kind: "sentence", priority: 1 });
            soundAndFX.playStarPopCombo(roll);

            const statusText = mainEl.querySelector("#ludo-status-text");
            if (statusText) {
              statusText.innerHTML = `前进到第 <b>${idx + 1}</b> 格：<b>【${ch}】(${py})</b>，请宝贝和家长一起大声读并造句！`;
            }
          } else {
            pawn?.classList.add("hidden");
            t.classList.remove("ring-4", "ring-orange-400", "bg-orange-200");
          }
        });
      });

      tiles.forEach((tile) => {
        this._on(tile, "click", () => {
          const ch = tile.dataset.char;
          const py = tile.dataset.pinyin;
          soundAndFX.speakPriority(`${ch}，${py}`, { kind: "char", priority: 2 });
          soundAndFX.playPop();
        });
      });
    }

    // 亲子任务卡打卡
    mainEl.querySelectorAll(".btn-quest-complete").forEach((btn) => {
      this._on(btn, "click", () => {
        const reward = parseInt(btn.dataset.reward, 10) || 30;
        rewardEngine.addCoins(reward);
        soundAndFX.playParentCheer();
        soundAndFX.triggerConfetti(this.container);
        showGameToast(this.container, `太棒了！完成亲子打卡，奖励 +${reward} 星币！`, "success");
        btn.textContent = "已打卡";
        btn.disabled = true;
        btn.classList.remove("btn-game-orange");
        btn.classList.add("bg-emerald-500", "cursor-default");
      });
    });

    // 保存设置
    const saveBtn = mainEl.querySelector("#btn-save-settings");
    if (saveBtn) {
      this._on(saveBtn, "click", () => {
        // 添加输入验证，防止恶意或异常数据
        const dailyTarget = Math.min(5, Math.max(1, parseInt(mainEl.querySelector("#select-daily-target")?.value || "3", 10) || 3));
        const eyeTime = Math.min(30, Math.max(15, parseInt(mainEl.querySelector("#select-eye-time")?.value || "20", 10) || 20));
        const dailyLimitRaw = mainEl.querySelector("#select-daily-limit")?.value || "auto";
        const tolerance = mainEl.querySelector("#select-stroke-tolerance")?.value || "toddler";
        const enablePlay = mainEl.querySelector("#check-enable-play")?.checked ?? true;
        const enableWrite = mainEl.querySelector("#check-enable-write")?.checked ?? true;

        ebbinghausManager.progress.settings.dailyCharTarget = dailyTarget;
        ebbinghausManager.progress.settings.eyeProtectionMinutes = eyeTime;
        ebbinghausManager.progress.settings.dailyTimeLimitMinutes =
          dailyLimitRaw === "auto" ? null : Math.min(180, Math.max(15, parseInt(dailyLimitRaw, 10) || 40));
        ebbinghausManager.progress.settings.strokeTolerance = tolerance;
        ebbinghausManager.progress.settings.enablePlayStep = enablePlay;
        ebbinghausManager.progress.settings.enableWriteStep = enableWrite;
        ebbinghausManager.save();

        // E7 专注模式：读复选框并桥接 focusMode.js（减弱动画/大字模式/装饰屏蔽）
        const focusModeChecked = mainEl.querySelector("#check-focus-mode")?.checked ?? false;
        ebbinghausManager.setFocusMode(focusModeChecked);

        soundAndFX.playSuccessSound();
        showGameToast(this.container, "学习、描红容差与护眼设置已成功保存！", "success");
      });
    }

    // 跨设备换机迁移：生成二维码
    const syncQrBtn = mainEl.querySelector("#btn-show-sync-qr");
    if (syncQrBtn) {
      this._on(syncQrBtn, "click", () => {
        soundAndFX.playPop();
        this.showSyncQRModal();
      });
    }

    // 跨设备换机迁移：导入进度
    const importSyncBtn = mainEl.querySelector("#btn-import-sync-code");
    if (importSyncBtn) {
      this._on(importSyncBtn, "click", () => {
        soundAndFX.playPop();
        this.showImportSyncModal();
      });
    }
  }

  generateWeeklyReportPoster() { return generateWeeklyReportPoster.call(this); }
  showSyncQRModal() { return showSyncQRModal.call(this); }
  showImportSyncModal() { return showImportSyncModal.call(this); }
}

