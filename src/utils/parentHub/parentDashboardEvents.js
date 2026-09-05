/** ParentModule — dashboard event wiring */
import { CHARACTER_DATABASE } from "../../data/characters.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { soundAndFX } from "../soundEngine.js";
import { showGameToast } from "../../components/SharedShell.js";
import { printWorksheet, getTodayWorksheetChars, getDifficultWorksheetChars, getQuestWorksheetChars } from "../worksheetGenerator.js";
import { storageManager, sanitizeProfileName } from "../storageManager.js";
import { rewardEngine } from "../rewardEngine.js";
import { showConfirm, showParentGate } from "../parentGate.js";
import { describeStepSequenceForAge } from "./parentTrophies.js";
import { setHapticsEnabled } from "../haptics.js";
import { setVoiceEvalEnabled } from "../pronunciationEval.js";

export function bindDashboardEvents(mainEl) {
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

  // 隐私与数据：导出进度备份（需家长门禁）
  const exportBtn = mainEl.querySelector("#btn-export-data");
  if (exportBtn) {
    this._on(exportBtn, "click", async () => {
      const gatePassed = await showParentGate({
        title: "导出备份 · 家长验证",
        level: "medium",
        confirmText: "同意导出",
        cancelText: "取消",
      });
      if (!gatePassed) return;
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

  // 隐私与数据：清除全部学习数据（家长门禁 + 二次确认，项目内 Modal）
  const wipeBtn = mainEl.querySelector("#btn-wipe-data");
  if (wipeBtn) {
    this._on(wipeBtn, "click", async () => {
      // P0-6 纵深防御：破坏性操作即使已过入口门禁，执行前再次验证
      const gatePassed = await showParentGate({
        title: "清除数据 · 家长验证",
        level: "hard",
        confirmText: "继续清除流程",
        cancelText: "取消",
      });
      if (!gatePassed) return;
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

  // 生成金榜题名小状元荣誉证书
  const certBtn = mainEl.querySelector("#btn-gen-champion-cert");
  if (certBtn) {
    this._on(certBtn, "click", () => {
      soundAndFX.playPop();
      this.generateChampionCertificate();
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
  // 数据罗盘快捷：打印今日练习卷（复用字帖引擎）
  const dashPrintBtn = mainEl.querySelector("#btn-dash-print-worksheet");
  if (dashPrintBtn) {
    this._on(dashPrintBtn, "click", () => {
      soundAndFX.playPop();
      const charsToPrint = getTodayWorksheetChars() || getQuestWorksheetChars() || [];
      if (!charsToPrint.length) {
        showGameToast(this.container, "今天还没有可打印的字，先去学几个新字吧", "warn");
        return;
      }
      printWorksheet(charsToPrint, "今日练习卷", { gridType: this.printGridType || "tian" });
      showGameToast(this.container, "正在打开打印预览…", "success");
    });
  }

  const printBtn = mainEl.querySelector("#btn-trigger-print");
  if (printBtn) {
    this._on(printBtn, "click", () => {
      soundAndFX.playPop();
      let charsToPrint = [];
      const gridLabel = this.printGridType === "tian" ? "田字格" : "米字格";
      let title = `凯茜识字 · 儿童专属${gridLabel}练字帖`;
      if (this.printMode === "quest") {
        charsToPrint = getQuestWorksheetChars();
        title = `凯茜识字 · 今日学练${gridLabel}字帖`;
      } else if (this.printMode === "difficult") {
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
      const ageRaw = mainEl.querySelector("#select-child-age")?.value;
      if (ageRaw === "" || ageRaw == null) {
        ebbinghausManager.progress.profile = ebbinghausManager.progress.profile || {};
        ebbinghausManager.progress.profile.age = null;
      } else {
        const ageNum = Math.min(10, Math.max(3, parseInt(ageRaw, 10) || 6));
        ebbinghausManager.progress.profile = ebbinghausManager.progress.profile || {};
        ebbinghausManager.progress.profile.age = ageNum;
      }

      ebbinghausManager.progress.settings.dailyCharTarget = dailyTarget;
      ebbinghausManager.progress.settings.eyeProtectionMinutes = eyeTime;
      ebbinghausManager.progress.settings.dailyTimeLimitMinutes =
        dailyLimitRaw === "auto" ? null : Math.min(180, Math.max(15, parseInt(dailyLimitRaw, 10) || 40));
      ebbinghausManager.progress.settings.strokeTolerance = tolerance;
      ebbinghausManager.progress.settings.enablePlayStep = enablePlay;
      ebbinghausManager.progress.settings.enableWriteStep = enableWrite;
      // P0-4 / P0-5：触感反馈 与 麦克风（语音评测）总开关
      const voiceEvalOn = mainEl.querySelector("#check-voice-eval")?.checked ?? true;
      const hapticsOn = mainEl.querySelector("#check-haptics")?.checked ?? true;
      const reduceMotionOn = mainEl.querySelector("#check-reduce-motion")?.checked ?? false;
      ebbinghausManager.progress.settings.voiceEval = voiceEvalOn;
      ebbinghausManager.progress.settings.haptics = hapticsOn;
      ebbinghausManager.progress.settings.reduceMotion = reduceMotionOn;
      setVoiceEvalEnabled(voiceEvalOn);
      setHapticsEnabled(hapticsOn);
      // L3：减少动效 → feedbackHub 读取同一 localStorage 开关（立即生效）
      try { localStorage.setItem("cathy_reduced_motion", reduceMotionOn ? "1" : "0"); } catch {}
      ebbinghausManager.save();

      // E7 专注模式：读复选框并桥接 focusMode.js（减弱动画/大字模式/装饰屏蔽）
      const focusModeChecked = mainEl.querySelector("#check-focus-mode")?.checked ?? false;
      ebbinghausManager.setFocusMode(focusModeChecked);

      soundAndFX.playSuccessSound();
      showGameToast(this.container, "年龄、学习与护眼设置已保存！", "success");
    });
  }

  const ageSelect = mainEl.querySelector("#select-child-age");
  const agePreviewEl = mainEl.querySelector(".age-step-preview");
  if (ageSelect && agePreviewEl) {
    this._on(ageSelect, "change", () => {
      const v = ageSelect.value;
      const preview = describeStepSequenceForAge(v === "" ? 6 : v);
      agePreviewEl.textContent = `当前预览：${preview.label}`;
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

  // 跨设备换机迁移：导入进度（覆盖性写入 → 家长门禁）
  const importSyncBtn = mainEl.querySelector("#btn-import-sync-code");
  if (importSyncBtn) {
    this._on(importSyncBtn, "click", async () => {
      // P0-6 纵深防御：导入会覆盖现有学习数据，执行前再次验证
      const gatePassed = await showParentGate({
        title: "导入进度 · 家长验证",
        level: "medium",
        confirmText: "继续导入",
        cancelText: "取消",
      });
      if (!gatePassed) return;
      soundAndFX.playPop();
      this.showImportSyncModal();
    });
  }

  // 本地 IndexedDB 全量灾备备份
  const backupBtn = mainEl.querySelector("#btn-backup-idb");
  if (backupBtn) {
    this._on(backupBtn, "click", async () => {
      soundAndFX.playPop();
      const ok = await storageManager.backupToIndexedDB();
      if (ok) {
        soundAndFX.playParentCheer();
        showGameToast(this.container, "本地 IndexedDB 全量双写灾备完成！", "success");
      } else {
        showGameToast(this.container, "当前环境不支持 IndexedDB 备份", "warn");
      }
    });
  }

  // 多儿童档案平滑切换（需家长门禁，防止儿童误切）
  mainEl.querySelectorAll(".btn-switch-child").forEach((btn) => {
    this._on(btn, "click", async () => {
      const pid = btn.dataset.profileId;
      const pname = btn.dataset.profileName || "宝宝";
      if (pid && pid !== storageManager.getActiveProfileId()) {
        const gatePassed = await showParentGate({
          title: "切换档案 · 家长验证",
          level: "easy",
          confirmText: "切换",
          cancelText: "取消",
        });
        if (!gatePassed) return;
        soundAndFX.playSuccessSound();
        ebbinghausManager.switchProfile(pid);
        showGameToast(this.container, `已切换到【${pname}】的学习档案`, "success");
        this.render();
      }
    });
  });

  // 重命名宝宝小名
  mainEl.querySelectorAll(".btn-rename-child").forEach((btn) => {
    this._on(btn, "click", async (e) => {
      e.stopPropagation();
      soundAndFX.playPop();
      const gatePassed = await showParentGate({
        title: "重命名档案 · 家长验证",
        level: "easy",
        confirmText: "继续",
        cancelText: "取消",
      });
      if (!gatePassed) return;
      const pid = btn.dataset.profileId;
      const oldName = btn.dataset.profileName || "宝宝";
      const newName = typeof window !== "undefined" && window.prompt
        ? window.prompt(`请输入【${oldName}】的新姓名或小名：`, oldName)
        : null;
      if (newName && newName.trim()) {
        const cleanName = sanitizeProfileName(newName);
        if (cleanName && cleanName !== oldName) {
          storageManager.renameProfile(pid, cleanName);
          soundAndFX.playSuccessSound();
          showGameToast(this.container, `已将档案重命名为【${cleanName}】`, "success");
          this.render();
        }
      }
    });
  });

  // 删除冗余宝宝档案
  mainEl.querySelectorAll(".btn-delete-child").forEach((btn) => {
    this._on(btn, "click", async (e) => {
      e.stopPropagation();
      soundAndFX.playPop();
      const pid = btn.dataset.profileId;
      const pname = btn.dataset.profileName || "宝宝";
      const gatePassed = await showParentGate({
        title: "删除档案 · 家长验证",
        level: "hard",
        confirmText: "继续删除流程",
        cancelText: "取消",
      });
      if (!gatePassed) return;
      const confirmed = await showConfirm({
        title: "删除学习档案",
        message: `确定要删除【${pname}】的学习档案吗？此操作将清除该宝贝的独立学习记录。`,
        variant: "danger",
        okText: "确认删除",
        cancelText: "取消",
      });
      if (confirmed) {
        const ok = storageManager.deleteProfile(pid);
        if (ok) {
          ebbinghausManager.switchProfile(storageManager.getActiveProfileId());
          soundAndFX.playPop();
          showGameToast(this.container, `已删除【${pname}】的档案`, "info");
          this.render();
        } else {
          showGameToast(this.container, "至少需要保留一个宝宝学习档案", "warn");
        }
      }
    });
  });

  // 添加新宝宝档案
  const addChildBtn = mainEl.querySelector("#btn-add-child-profile");
  if (addChildBtn) {
    this._on(addChildBtn, "click", async () => {
      soundAndFX.playPop();
      const gatePassed = await showParentGate({
        title: "新建档案 · 家长验证",
        level: "easy",
        confirmText: "创建",
        cancelText: "取消",
      });
      if (!gatePassed) return;
      const profiles = storageManager.listProfiles();
      const nextIdx = profiles.length + 1;
      const newId = `child_${Date.now()}`;
      const newName = `宝贝 ${nextIdx}`;
      profiles.push({ id: newId, name: newName });
      storageManager.saveProfilesList(profiles);
      ebbinghausManager.switchProfile(newId);
      soundAndFX.playParentCheer();
      showGameToast(this.container, `已创建并切换到【${newName}】`, "success");
      this.render();
    });
  }
}

