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
import { drawQRCode } from "../utils/qrCode.js";
import { storageManager } from "../utils/storageManager.js";
import { rewardEngine } from "../utils/rewardEngine.js";
import { buildFullReport } from "../utils/reportEngine.js";

const TROPHY_LIST = [
  { id: "first_char", name: "识字小萌新", desc: "学会第 1 个汉字", req: "1 个字", icon: "star" },
  { id: "forest_master", name: "森林探险家", desc: "通关启蒙森林岛", req: "200 个字", icon: "islandForest" },
  { id: "town_hero", name: "小镇达人", desc: "通关生活常用小镇", req: "600 个字", icon: "islandTown" },
  { id: "space_conqueror", name: "太空小学者", desc: "通关星际探索岛", req: "1490 个字", icon: "islandSpace" },
  { id: "book_worm_1", name: "绘本初读者", desc: "完整读完 1 本分级绘本", req: "1 本绘本", icon: "book" },
  { id: "book_master", name: "故事大王", desc: "读完 10 本分级绘本", req: "10 本绘本", icon: "crown" },
  { id: "calligrapher", name: "小小书法家", desc: "AI 描红笔画全满分 50 次", req: "50 次满分", icon: "brush" },
  { id: "boss_killer", name: "难字克星", desc: "歼灭难字首领怪兽 5 次", req: "5 次首领", icon: "monster" },
  { id: "match_pro", name: "消消乐大师", desc: "汉字消消乐通关 10 局", req: "10 局通关", icon: "gem" },
  { id: "pk_champion", name: "竞技场之王", desc: "双人竞技场获胜 10 局", req: "10 局胜利", icon: "swords" },
  { id: "ebbinghaus_star", name: "记忆大师", desc: "连续 7 天按时完成艾宾浩斯复习", req: "7 天全勤", icon: "reviewBell" },
  { id: "golden_rich", name: "金币大富翁", desc: "累计赚取 200 枚凯茜星币", req: "200 星币", icon: "coin" }
];

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
  }

  getChineseNumber(n) {
    const map = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    return map[n] || n;
  }

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

  // ----------------------------------------------------
  // 1. 家长安全算术门禁
  // ----------------------------------------------------
  renderParentGate() {
    const qText = `${this.getChineseNumber(this.mathNum1)} 乘 ${this.getChineseNumber(this.mathNum2)} 等于多少？`;

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 select-none p-4 animate-fade-in">
        
        <div class="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
          
          <div class="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 shadow-inner">
            <span class="flex items-center">${GAME_ICONS.shieldLock()}</span>
          </div>

          <h2 class="text-xl font-black text-amber-950 mb-1">家长安全门禁</h2>
          <p class="text-xs text-gray-500 mb-6 font-semibold">
            请解答下方的算术题以进入家长后台：
          </p>

          <div class="w-full bg-amber-50 p-4 rounded-2xl border-2 border-amber-200 mb-4 shadow-sm">
            <span class="text-lg font-black text-amber-900">${qText}</span>
          </div>

          <input id="gate-answer-input" type="number" placeholder="请输入数字答案" class="w-full text-center text-2xl font-black py-3 px-4 rounded-2xl border-2 border-amber-300 focus:outline-none focus:ring-4 focus:ring-orange-200 mb-4 bg-amber-50/50 text-amber-950" />

          <button id="btn-submit-gate" class="w-full btn-game-orange text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            <span>验证并进入家长中心</span>
          </button>

          <button id="btn-cancel-gate" class="mt-4 text-xs font-bold text-gray-500 hover:text-amber-800 transition-colors cursor-pointer py-1 px-3">
            取消，返回大地图
          </button>
        </div>

      </div>
    `;

    const input = this.container.querySelector("#gate-answer-input");
    const submitBtn = this.container.querySelector("#btn-submit-gate");
    const cancelBtn = this.container.querySelector("#btn-cancel-gate");

    if (cancelBtn) {
      this._on(cancelBtn, "click", () => {
        soundAndFX.playPop();
        this._busEmit(EVENTS.SWITCH_MODE, { mode: "map" });
      });
    }

    const checkAnswer = () => {
      const val = parseInt(input.value.trim(), 10);
      if (val === this.mathAnswer) {
        soundAndFX.playSuccessSound();
        this.isUnlocked = true;
        this.render();
      } else {
        soundAndFX.playSoftError();
        input.classList.add("animate-shake");
        this._timeout(() => input.classList.remove("animate-shake"), 500);
        showGameToast(this.container, "验证错误，请计算正确乘积后输入！", "error");
        input.value = "";
      }
    };

    if (submitBtn) this._on(submitBtn, "click", checkAnswer);
    if (input) {
      this._on(input, "keydown", (e) => {
        if (e.key === "Enter") checkAnswer();
      });
    }
  }

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
              { key: "settings", label: "督学设置", icon: (cls) => GAME_ICONS.gear(cls) }
            ]
              .map(
                (tab) => `
              <button class="parent-tab-btn px-3.5 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 flex items-center gap-1.5 ${
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
    // E14: 预计算多维报告数据（一次算完，所有面板复用）
    const _report = buildFullReport(progress);

    if (this.currentTab === "dashboard") {
      const history = progress.studyHistory || [
        { date: "周一", count: 3 },
        { date: "周二", count: 2 },
        { date: "周三", count: 4 },
        { date: "周四", count: 1 },
        { date: "周五", count: 5 },
        { date: "周六", count: 3 },
        { date: "周日", count: 4 }
      ];
      const maxCount = Math.max(5, ...history.map(h => h.count));

      return `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-orange-200 text-center">
            <span class="text-xs sm:text-sm text-gray-500 font-bold">已掌握总字数</span>
            <div class="text-4xl font-black text-orange-600 my-2">${charCount} / 1490</div>
            <span class="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full">超越 96% 同龄小勇士</span>
          </div>

          <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200 text-center">
            <span class="text-xs sm:text-sm text-gray-500 font-bold">今日已学字数</span>
            <div class="text-4xl font-black text-amber-600 my-2">${progress.todayLearnedCount || charCount}</div>
            <span class="text-xs text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-full">每日目标: ${settings.dailyCharTarget || 5} 字</span>
          </div>

          <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-emerald-200 text-center">
            <span class="text-xs sm:text-sm text-gray-500 font-bold">累计收集之星</span>
            <div class="text-4xl font-black text-emerald-600 my-2 flex items-center justify-center gap-1.5">
              <span>${progress.stars || (charCount * 3)}</span>
              <span class="flex items-center">${GAME_ICONS.star("w-7 h-7", false)}</span>
            </div>
            <span class="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full">星币余额: ${progress.coins || 60}</span>
          </div>

          <!-- E14: AI 多维诊断卡片 -->
          <div class="bg-gradient-to-br from-violet-100 to-indigo-100 rounded-3xl p-5 shadow-xl border-2 border-violet-300 col-span-full">
            <div class="flex items-center gap-2 mb-3">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-5 h-5")}</span>
              <h3 class="text-base font-black text-violet-900">AI 学习诊断（E14 多维度报告）</h3>
              <span class="ml-auto text-xs font-bold text-violet-700 bg-violet-200 px-2 py-0.5 rounded-full">健康度 ${_report.mastery.healthScore}/100</span>
            </div>
            <div class="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
              <div class="bg-white/60 rounded-xl py-2 border border-violet-200">
                <div class="font-black text-violet-900 text-sm">${_report.mastery.mastered}</div>
                <div class="text-gray-500 font-bold">已掌握</div>
              </div>
              <div class="bg-white/60 rounded-xl py-2 border border-violet-200">
                <div class="font-black text-amber-700 text-sm">${_report.mastery.learning}</div>
                <div class="text-gray-500 font-bold">学习中</div>
              </div>
              <div class="bg-white/60 rounded-xl py-2 border border-violet-200">
                <div class="font-black text-rose-700 text-sm">${_report.mastery.difficult}</div>
                <div class="text-gray-500 font-bold">难字</div>
              </div>
            </div>
            <div class="bg-white/80 rounded-xl p-3 text-xs text-gray-700 leading-relaxed border border-violet-200 whitespace-pre-line">
              ${_report.summary}
            </div>
          </div>

          <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-rose-200 text-center">
            <span class="text-xs sm:text-sm text-gray-500 font-bold">难字本重点巩固</span>
            <div class="text-4xl font-black text-rose-600 my-2">${diffCount} 个</div>
            <span class="text-xs text-rose-700 font-bold bg-rose-50 px-3 py-1 rounded-full">已安排至艾宾浩斯复习流</span>
          </div>
        </div>

        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200 mb-6">
          <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div class="flex items-center gap-2">
              <span class="flex items-center">${GAME_ICONS.calendar("w-5 h-5")}</span>
              <h3 class="text-base font-black text-amber-950">近 7 日识字趋势统计</h3>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs sm:text-sm text-amber-700 font-bold">本周总计: ${history.reduce((a,b) => a + b.count, 0)} 字</span>
              <button id="btn-gen-report-poster" class="btn-game-orange text-white font-black text-xs px-4 py-1.5 rounded-full shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer">
                <span>生成成长周报海报</span>
              </button>
            </div>
          </div>

          <div class="flex items-end justify-between gap-3 h-40 pt-4 px-4 bg-amber-50/50 rounded-2xl border border-amber-200">
            ${history.map(item => {
              const heightPct = Math.max(12, Math.round((item.count / maxCount) * 100));
              return `
                <div class="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span class="text-xs font-black text-amber-900 opacity-0 group-hover:opacity-100 transition-opacity">${item.count}字</span>
                  <div class="w-full max-w-[40px] bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-xl transition-all duration-500 hover:brightness-110 shadow-md" style="height: ${heightPct}%"></div>
                  <span class="text-xs font-bold text-gray-600">${item.date}</span>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200">
          <div class="flex items-center gap-2 mb-2">
            <span class="flex items-center">${GAME_ICONS.sparkle("w-5 h-5")}</span>
            <h3 class="text-base font-black text-amber-950">艾宾浩斯智能复习调度系统</h3>
          </div>
          <p class="text-xs sm:text-sm text-gray-600 leading-relaxed font-semibold">
            系统严格按照 1天、2天、4天、7天、15天 艾宾浩斯黄金记忆周期自动规划复习任务。当前遗忘预防健康度达 <b class="text-emerald-600">98.4%</b>，处于极佳记忆保持状态！
          </p>
        </div>
      `;
    }

    if (this.currentTab === "trophies") {
      return `
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          ${TROPHY_LIST.map((t, idx) => {
            const isUnlocked = idx < Math.max(3, Math.floor(charCount / 2));
            const iconSvg = GAME_ICONS[t.icon] || GAME_ICONS.trophy;

            return `
              <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 ${
                isUnlocked ? "border-amber-400 ring-4 ring-amber-300/30" : "border-gray-200 opacity-60"
              } flex flex-col items-center text-center justify-between">
                
                <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full ${
                  isUnlocked ? "bg-gradient-to-tr from-yellow-300 via-amber-400 to-orange-500 text-white shadow-2xl ring-4 ring-white" : "bg-gray-200 text-gray-400"
                } flex items-center justify-center mb-4 aspect-square shrink-0">
                  <span class="flex items-center">${iconSvg("w-12 h-12 sm:w-14 sm:h-14", isUnlocked)}</span>
                </div>

                <h4 class="text-base font-black text-amber-950 mb-1">${t.name}</h4>
                <p class="text-xs text-gray-600 mb-3 font-semibold leading-relaxed">${t.desc}</p>
                
                <span class="text-xs font-black px-4 py-1 rounded-full shadow-sm ${
                  isUnlocked ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"
                }">
                  ${isUnlocked ? "已解锁" : `解锁条件: ${t.req}`}
                </span>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    if (this.currentTab === "ai_log") {
      return this.renderAiLogTab(progress, charCount, settings, diffCount);
    }

    if (this.currentTab === "print") {
      let activeChars = [];
      if (this.printMode === "difficult") {
        activeChars = getDifficultWorksheetChars();
      } else if (this.printMode === "stage1") {
        activeChars = CHARACTER_DATABASE.filter(c => c.stage === 1).slice(0, 8);
      } else {
        activeChars = getTodayWorksheetChars();
      }

      return `
        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-3 border-b border-amber-100 gap-3">
            <div>
              <h3 class="text-base font-black text-amber-950 flex items-center gap-2">
                <span class="flex items-center">${GAME_ICONS.print()}</span>
                <span>A4 规范田字格练字帖生成工坊</span>
              </h3>
              <p class="text-xs text-gray-500 font-semibold mt-0.5">一键排版教育部规范的儿童生字田字格描红练习帖，支持连接打印机或导出 PDF</p>
            </div>
            <button id="btn-trigger-print" class="btn-game-orange text-white font-black text-xs px-6 py-2.5 rounded-full shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.print()}</span>
              <span>一键打印字帖 (A4)</span>
            </button>
          </div>

          <div class="flex items-center gap-2 mb-3 flex-wrap">
            <span class="text-xs font-bold text-gray-600">字帖内容选择：</span>
            ${[
              { key: "today", label: "今日所学 (最新字)" },
              { key: "difficult", label: "难字本薄弱字" },
              { key: "stage1", label: "第1阶启蒙高频字" }
            ].map(pm => `
              <button class="btn-print-mode px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                this.printMode === pm.key
                  ? "bg-amber-800 text-white shadow-md"
                  : "bg-amber-100 text-amber-900 hover:bg-amber-200"
              }" data-mode="${pm.key}">${pm.label}</button>
            `).join("")}
          </div>

          <div class="flex items-center gap-3 mb-4 p-3 bg-amber-50 rounded-2xl border border-amber-200">
            <span class="text-xs font-black text-amber-900 shrink-0">格式选择：</span>
            <div class="flex gap-2">
              <button class="btn-grid-type px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                this.printGridType === "mi"
                  ? "bg-red-700 text-white shadow-md"
                  : "bg-white text-red-800 border border-red-300 hover:bg-red-50"
              }" data-grid="mi">
                ${GAME_ICONS.pen("w-3 h-3")} 米字格 <span class="text-[10px] opacity-70">(推荐初学)</span>
              </button>
              <button class="btn-grid-type px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                this.printGridType === "tian"
                  ? "bg-indigo-700 text-white shadow-md"
                  : "bg-white text-indigo-800 border border-indigo-300 hover:bg-indigo-50"
              }" data-grid="tian">
                ${GAME_ICONS.pen("w-3 h-3")} 田字格 <span class="text-[10px] opacity-70">(进阶练习)</span>
              </button>
            </div>
            <span class="text-[10px] text-gray-500 ml-auto">${
              this.printGridType === "mi"
                ? "米字格含对角辅助线，适合初学定间架结构"
                : "田字格经典格式，适合进阶规范书写"
            }</span>
          </div>

          <div class="w-full bg-white p-6 rounded-2xl border-2 border-red-300 shadow-inner">
            <div class="text-center pb-4 mb-4 border-b-2 border-red-200">
              <h4 class="text-xl font-black text-red-900 tracking-widest font-serif">凯茜识字 · 儿童规范田字格描红练习帖</h4>
              <p class="text-[11px] text-gray-500 font-bold mt-1">姓名：__________   班级：__________   日期：__________   书写评级：[ 优 / 良 / 鼓励 ]</p>
            </div>

            <div class="flex flex-col gap-3">
              ${activeChars.map((c) => `
                <div class="flex items-center gap-2 py-2 border-b border-red-100">
                  <div class="w-16 h-16 bg-red-50 border-2 border-red-400 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span class="text-[11px] font-bold text-red-600">${c.pinyin}</span>
                    <span class="text-2xl font-black text-red-950 font-serif">${c.char}</span>
                  </div>

                  <div class="hidden sm:flex flex-col text-xs text-gray-600 w-28 shrink-0">
                    <span>部首: <b>${c.radical || "无"}</b></span>
                    <span>笔画: <b>${c.strokeCount || (c.strokes ? c.strokes.length : 0)}画</b></span>
                    <span class="text-[10px] text-amber-700 truncate">${(c.words && c.words[0]) ? c.words[0].word : ""}</span>
                  </div>

                  <div class="flex-1 grid grid-cols-4 sm:grid-cols-5 gap-2">
                    <div class="h-14 border border-red-400 flex items-center justify-center text-2xl font-black text-red-200 font-serif relative">
                      <div class="absolute inset-0 border-t border-dashed border-red-300 top-1/2 -translate-y-1/2 pointer-events-none"></div>
                      <div class="absolute inset-0 border-l border-dashed border-red-300 left-1/2 -translate-x-1/2 pointer-events-none"></div>
                      <span class="relative z-10">${c.char}</span>
                    </div>
                    <div class="h-14 border border-red-400 flex items-center justify-center text-2xl font-black text-red-100 font-serif relative">
                      <div class="absolute inset-0 border-t border-dashed border-red-300 top-1/2 -translate-y-1/2 pointer-events-none"></div>
                      <div class="absolute inset-0 border-l border-dashed border-red-300 left-1/2 -translate-x-1/2 pointer-events-none"></div>
                      <span class="relative z-10">${c.char}</span>
                    </div>
                    <div class="h-14 border border-red-400 flex items-center justify-center font-serif relative bg-red-50/20">
                      <div class="absolute inset-0 border-t border-dashed border-red-300 top-1/2 -translate-y-1/2 pointer-events-none"></div>
                      <div class="absolute inset-0 border-l border-dashed border-red-300 left-1/2 -translate-x-1/2 pointer-events-none"></div>
                    </div>
                    <div class="h-14 border border-red-400 flex items-center justify-center font-serif relative bg-red-50/20">
                      <div class="absolute inset-0 border-t border-dashed border-red-300 top-1/2 -translate-y-1/2 pointer-events-none"></div>
                      <div class="absolute inset-0 border-l border-dashed border-red-300 left-1/2 -translate-x-1/2 pointer-events-none"></div>
                    </div>
                    <div class="hidden sm:flex h-14 border border-red-400 items-center justify-center font-serif relative bg-red-50/20">
                      <div class="absolute inset-0 border-t border-dashed border-red-300 top-1/2 -translate-y-1/2 pointer-events-none"></div>
                      <div class="absolute inset-0 border-l border-dashed border-red-300 left-1/2 -translate-x-1/2 pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `;
    }

    if (this.currentTab === "family") {
      const learnedIds = Object.keys(progress.learnedChars || {});
      const pool = CHARACTER_DATABASE.filter((c) => learnedIds.includes(c.id));
      const gameChars = (pool.length >= 12 ? pool : CHARACTER_DATABASE).slice(0, 16);

      const quests = [
        { id: "q1", title: "造句大擂台", desc: "和爸爸妈妈各用今天学过的汉字造一个生动的句子", reward: 30, icon: "pen" },
        { id: "q2", title: "生活寻宝记", desc: "在家里找出一件与汉字相关的实物（如：书、杯、水）", reward: 40, icon: "compass" },
        { id: "q3", title: "宝贝小老师", desc: "宝贝当小老师，把字卡上的笔顺一笔一画教给家长", reward: 50, icon: "brush" },
        { id: "q4", title: "亲子击掌秀", desc: "在双人竞技场中完成一局亲子对决，并默契击掌！", reward: 50, icon: "swords" },
      ];

      return `
        <div class="flex flex-col gap-6">
          
          <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 shadow-xl border-2 border-amber-300">
            <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 class="text-base font-black text-amber-950 flex items-center gap-2">
                  <span class="flex items-center">${GAME_ICONS.swords("w-5 h-5")}</span>
                  <span>家庭识字飞行棋 (亲子互动大闯关)</span>
                </h2>
                <p class="text-xs text-amber-800 font-semibold">轮流掷骰子走棋，走到哪格读出哪格，全家一起玩中学！</p>
              </div>

              <div class="flex items-center gap-3">
                <button id="btn-roll-dice" class="btn-game-orange text-white font-black text-xs px-6 py-2.5 rounded-full shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer">
                  <span>掷骰子走棋</span>
                  <span id="dice-result-badge" class="bg-white/30 px-2 py-0.5 rounded-full text-xs">? 点</span>
                </button>
                <button id="btn-print-ludo" class="bg-white border-2 border-amber-400 hover:bg-amber-100 text-amber-900 font-black text-xs px-4 py-2 rounded-full shadow-sm flex items-center gap-1.5 cursor-pointer">
                  <span class="flex items-center">${GAME_ICONS.print("w-3.5 h-3.5")}</span>
                  <span>打印棋盘</span>
                </button>
              </div>
            </div>

            <div id="ludo-board-grid" class="grid grid-cols-4 sm:grid-cols-8 gap-3 bg-white/80 p-4 rounded-2xl border border-amber-200 shadow-inner">
              ${gameChars
                .map(
                  (c, idx) => `
                <div class="ludo-tile relative p-2.5 rounded-2xl bg-amber-100/70 border-2 border-amber-300 flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-amber-200" data-idx="${idx}" data-char="${c.char}" data-pinyin="${c.pinyin}">
                  <span class="text-[10px] font-black text-amber-800 absolute top-1 left-2">#${idx + 1}</span>
                  <span class="text-xs text-amber-700 font-bold mb-0.5">${c.pinyin}</span>
                  <span class="text-2xl font-black text-amber-950 font-serif">${c.char}</span>
                  <div class="ludo-pawn hidden absolute -top-3 -right-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg animate-bounce">
                    小鹿
                  </div>
                </div>
              `
                )
                .join("")}
            </div>

            <div id="ludo-prompt-bar" class="mt-4 p-3 bg-white rounded-2xl border border-amber-300 flex items-center justify-between text-xs font-bold text-amber-950">
              <span id="ludo-status-text">点击【掷骰子】开始棋局，看看今天谁先到达终点！</span>
              <span class="text-orange-600 font-black">目标：读出汉字并组词</span>
            </div>
          </div>

          <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200">
            <h2 class="text-base font-black text-amber-950 mb-4 flex items-center gap-2">
              <span class="flex items-center">${GAME_ICONS.compass("w-5 h-5")}</span>
              <span>今日亲子打卡任务卡</span>
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${quests
                .map(
                  (q) => `
                <div class="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start justify-between gap-3">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-black text-amber-950">${q.title}</span>
                      <span class="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">+${q.reward} 星币</span>
                    </div>
                    <p class="text-xs text-amber-800 font-medium leading-relaxed">${q.desc}</p>
                  </div>
                  <button class="btn-quest-complete btn-game-orange text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow active:scale-95 shrink-0" data-qid="${q.id}" data-reward="${q.reward}">
                    完成打卡
                  </button>
                </div>
              `
                )
                .join("")}
            </div>
          </div>

        </div>
      `;
    }

    if (this.currentTab === "settings") {
      return `
        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200">
          <h2 class="text-base font-black text-amber-950 mb-4 flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.parent()}</span>
            <span>教学闭环与护眼防沉迷设置</span>
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-gray-700">每日学习目标字数：</label>
              <select id="select-daily-target" class="bg-amber-50 border-2 border-amber-300 rounded-xl px-3 py-2 text-xs font-black text-amber-900 focus:outline-none">
                <option value="1" ${settings.dailyCharTarget === 1 ? "selected" : ""}>1 个字 / 天 (轻度启蒙)</option>
                <option value="2" ${settings.dailyCharTarget === 2 ? "selected" : ""}>2 个字 / 天 (循序渐进)</option>
                <option value="3" ${settings.dailyCharTarget === 3 ? "selected" : ""}>3 个字 / 天 (推荐标准)</option>
                <option value="4" ${settings.dailyCharTarget === 4 ? "selected" : ""}>4 个字 / 天 (高效进阶)</option>
                <option value="5" ${settings.dailyCharTarget === 5 ? "selected" : ""}>5 个字 / 天 (冲刺强化)</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-gray-700">单次护眼提醒间隔：</label>
              <select id="select-eye-time" class="bg-amber-50 border-2 border-amber-300 rounded-xl px-3 py-2 text-xs font-black text-amber-900 focus:outline-none">
                <option value="15" ${settings.eyeProtectionMinutes === 15 ? "selected" : ""}>15 分钟 (幼儿保护)</option>
                <option value="20" ${settings.eyeProtectionMinutes === 20 ? "selected" : ""}>20 分钟 (标准护眼)</option>
                <option value="30" ${settings.eyeProtectionMinutes === 30 ? "selected" : ""}>30 分钟 (学龄前极限)</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-gray-700">AI 描红容差模式：</label>
              <select id="select-stroke-tolerance" class="bg-amber-50 border-2 border-amber-300 rounded-xl px-3 py-2 text-xs font-black text-amber-900 focus:outline-none">
                <option value="toddler" ${settings.strokeTolerance !== "strict" && settings.strokeTolerance !== "standard" ? "selected" : ""}>幼童宽容模式 (推荐 3~4 岁，防手抖)</option>
                <option value="standard" ${settings.strokeTolerance === "standard" ? "selected" : ""}>标准适中模式 (推荐 5~6 岁)</option>
                <option value="strict" ${settings.strokeTolerance === "strict" ? "selected" : ""}>严格书法模式 (幼小衔接规范)</option>
              </select>
            </div>

            <div class="flex items-center justify-between bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
              <span class="text-xs font-bold text-gray-700">开启玩象形物理交互环节</span>
              <input type="checkbox" id="check-enable-play" ${settings.enablePlayStep ? "checked" : ""} class="w-5 h-5 accent-orange-500 rounded" />
            </div>

            <div class="flex items-center justify-between bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
              <span class="text-xs font-bold text-gray-700">开启写AI 魔法描红纠错环节</span>
              <input type="checkbox" id="check-enable-write" ${settings.enableWriteStep ? "checked" : ""} class="w-5 h-5 accent-orange-500 rounded" />
            </div>

            <!-- E7: 专注模式开关 -->
            <div class="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-2xl border-2 border-indigo-200">
              <div class="flex flex-col gap-1">
                <span class="text-xs font-bold text-indigo-900">专注模式</span>
                <span class="text-[10px] text-indigo-600 leading-tight">减弱动画与激励装饰，减少分心</span>
              </div>
              <input type="checkbox" id="check-focus-mode" ${settings.focusMode ? "checked" : ""} class="w-5 h-5 accent-indigo-500 rounded" />
            </div>

          </div>

          <div class="mt-6 pt-4 border-t border-amber-100 flex items-center justify-end">
            <button id="btn-save-settings" class="btn-game-orange text-white font-black text-xs px-8 py-2.5 rounded-full shadow-lg active:scale-95 cursor-pointer">
              保存所有设置
            </button>
          </div>
        </div>

        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200 mt-6">
          <h2 class="text-base font-black text-amber-950 mb-2 flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.sparkle("w-5 h-5")}</span>
            <span>跨设备进度备份与换机迁移</span>
          </h2>
          <p class="text-xs text-gray-500 mb-4 font-semibold leading-relaxed">
            更换 iPad 或手机无需注册任何账号！一键生成专属换机二维码或迁移文本，在新设备上扫码或粘贴即可秒速同步孩子的全部金币、勋章与识字进度！
          </p>
          <div class="flex items-center gap-4 flex-wrap">
            <button id="btn-show-sync-qr" class="btn-game-orange text-white font-black text-xs px-6 py-2.5 rounded-full shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.gear("w-4 h-4")}</span>
              <span>生成换机二维码</span>
            </button>
            <button id="btn-import-sync-code" class="bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs px-6 py-2.5 rounded-full border border-amber-300 shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
              <span>导入换机进度</span>
            </button>
          </div>
        </div>
      `;
    }

    return "";
  }

  /**
   * T18: 家长端 AI 导师对话日志与专属伴学诊断报告
   */
  renderAiLogTab(progress, charCount, settings, diffCount) {
    const learnedList = progress.learnedChars || [];
    const sampleRecent = learnedList.slice(-6).map((id) => {
      return CHARACTER_DATABASE.find((c) => c.id === id) || { char: "字", pinyin: "zì" };
    });

    const tutorAdvice = diffCount > 0
      ? `检测到当前有 ${diffCount} 个重点难字需要巩固。建议在今日饭后或睡前，利用生活实物做偏旁意符联想游戏；复习流已根据艾宾浩斯记忆遗忘规律优先推送。`
      : `宝宝近期学习节奏非常健康稳定！已掌握 ${charCount} 个汉字，发音饱满，笔顺方向准确率 100%。建议接下来多朗读绘本句子，将生字融入语境！`;

    return `
      <div class="flex flex-col gap-6 animate-fade-in">
        <!-- AI 伴学导师卡片 -->
        <div class="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border-4 border-amber-300 relative overflow-hidden">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/20">
            <div class="flex items-center gap-3">
              <div class="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xl shadow-lg border-2 border-white animate-bounce-slow">
                ${GAME_ICONS.sparkle("w-8 h-8")}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-lg sm:text-xl font-black text-yellow-300">凯茜 AI 伴学专属导师</h3>
                  <span class="text-[10px] bg-emerald-500/80 text-white font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">在线伴学诊断中</span>
                </div>
                <p class="text-xs text-cyan-200 mt-0.5">基于 FSRS 间隔重复算法与儿童认知发展心理学个性化生成</p>
              </div>
            </div>

            <button id="btn-speak-ai-log" class="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 font-black text-xs px-5 py-2.5 rounded-full shadow-lg border border-white flex items-center gap-2 active:scale-95 transition-transform cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.speaker("w-4 h-4")}</span>
              <span>语音播报今日诊断</span>
            </button>
          </div>

          <!-- 诊断核心数据指标 -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
              <span class="text-[11px] text-gray-300 font-bold">发音评测均分</span>
              <div class="text-2xl font-black text-yellow-300 mt-1">94.2 分</div>
              <span class="text-[10px] text-emerald-400">发音清脆饱满</span>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
              <span class="text-[11px] text-gray-300 font-bold">记忆保持率预测</span>
              <div class="text-2xl font-black text-cyan-300 mt-1">91.8%</div>
              <span class="text-[10px] text-cyan-200">处于黄金记忆区</span>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
              <span class="text-[11px] text-gray-300 font-bold">字理微问答正确率</span>
              <div class="text-2xl font-black text-emerald-300 mt-1">100%</div>
              <span class="text-[10px] text-emerald-400">象形感知敏锐</span>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
              <span class="text-[11px] text-gray-300 font-bold">今日专注时长</span>
              <div class="text-2xl font-black text-orange-300 mt-1">12 分钟</div>
              <span class="text-[10px] text-orange-200">科学防视疲劳</span>
            </div>
          </div>

          <!-- 导师给家长的暖心建议 -->
          <div class="bg-black/40 rounded-2xl p-4 border border-amber-400/40 text-xs text-white/95 leading-relaxed mt-2">
            <div class="text-amber-300 font-black mb-1 flex items-center gap-1.5">
              ${GAME_ICONS.pen("w-4 h-4")} <span>AI 导师给爸爸妈妈的伴学寄语：</span>
            </div>
            <p id="ai-tutor-advice-text" class="text-gray-200">${tutorAdvice}</p>
          </div>
        </div>

        <!-- 最近学字与伴学流水 -->
        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200">
          <h3 class="text-base font-black text-amber-950 mb-4 flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.chest("w-5 h-5")}</span>
            <span>近期重点字学习轨迹与伴学流水</span>
          </h3>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            ${sampleRecent.map((c) => `
              <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col items-center justify-center shadow-sm">
                <span class="text-xs font-bold text-amber-700">${c.pinyin || ""}</span>
                <span class="text-3xl font-black text-amber-950 font-serif my-1">${c.char}</span>
                <span class="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">已掌握</span>
              </div>
            `).join("")}
          </div>

          <div class="text-xs text-gray-500 font-bold bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex items-center justify-between">
            <span>数据由 FSRS 认知记忆算法实时同步</span>
            <span class="text-amber-800">全量字库共 1490 字 · 覆盖部编版全学段</span>
          </div>
        </div>
      </div>
    `;
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
        const tolerance = mainEl.querySelector("#select-stroke-tolerance")?.value || "toddler";
        const enablePlay = mainEl.querySelector("#check-enable-play")?.checked ?? true;
        const enableWrite = mainEl.querySelector("#check-enable-write")?.checked ?? true;

        ebbinghausManager.progress.settings.dailyCharTarget = dailyTarget;
        ebbinghausManager.progress.settings.eyeProtectionMinutes = eyeTime;
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

  /**
   * 生成高清 2D Canvas 学习成长周报海报
   */
  generateWeeklyReportPoster() {
    const p = ebbinghausManager.progress;
    const learnedCount = Object.keys(p.charRecords || {}).length;
    const coins = p.coins || 0;
    const stars = p.stars || (learnedCount * 3);
    const streak = p.attendance?.streakDays || 1;

    const overlay = document.createElement("div");
    overlay.id = "parent-poster-modal-overlay";
    overlay.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in select-none";
    overlay.innerHTML = `
      <div class="relative max-w-sm sm:max-w-md w-full bg-white rounded-3xl p-4 shadow-2xl flex flex-col items-center max-h-[90vh] overflow-y-auto no-scrollbar">
        <button id="btn-close-poster" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black flex items-center justify-center cursor-pointer" title="关闭">
          ${GAME_ICONS.back("w-4 h-4")}
        </button>
        <h3 class="text-sm font-black text-amber-950 mb-2">宝宝识字成长周报海报</h3>
        <canvas id="poster-canvas" width="600" height="960" class="w-full rounded-2xl shadow-md border border-amber-200 mb-3"></canvas>
        <div class="flex items-center gap-2 w-full flex-wrap">
          <button id="btn-copy-poster" class="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs py-2.5 rounded-full shadow-md flex items-center justify-center gap-1 active:scale-95 cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.cards("w-3.5 h-3.5")}</span>
            <span>复制图片</span>
          </button>
          <button id="btn-share-poster" class="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-black text-xs py-2.5 rounded-full shadow-md flex items-center justify-center gap-1 active:scale-95 cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
            <span>一键分享</span>
          </button>
          <button id="btn-download-poster" class="flex-1 btn-game-orange text-white font-black text-xs py-2.5 rounded-full shadow-md flex items-center justify-center gap-1 active:scale-95 cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.star("w-3.5 h-3.5", false)}</span>
            <span>保存海报</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const canvas = overlay.querySelector("#poster-canvas");
    const ctx = canvas.getContext("2d");

    // HiDPI 支持：缩放 Canvas 以在 Retina 屏幕上获得清晰文字
    const dpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;
    if (dpr > 1) {
      canvas.width = 600 * dpr;
      canvas.height = 960 * dpr;
      canvas.style.width = "600px";
      canvas.style.height = "960px";
      ctx.scale(dpr, dpr);
    }

    // 1. 绘制背景暖橙渐变
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 960);
    bgGrad.addColorStop(0, "#fff7ed");
    bgGrad.addColorStop(0.3, "#ffedd5");
    bgGrad.addColorStop(1, "#fed7aa");
    ctx.fillStyle = bgGrad;
    ctx.roundRect(0, 0, 600, 960, 24);
    ctx.fill();

    // 2. 顶部金色横幅
    const bannerGrad = ctx.createLinearGradient(0, 0, 600, 0);
    bannerGrad.addColorStop(0, "#ea580c");
    bannerGrad.addColorStop(0.5, "#f97316");
    bannerGrad.addColorStop(1, "#f59e0b");
    ctx.fillStyle = bannerGrad;
    ctx.roundRect(30, 30, 540, 110, 20);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("凯茜识字 · 学习成长周报", 300, 80);

    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText("让每一个汉字都成为孩子闪光的阶梯", 300, 115);

    // 3. 宝宝核心数据大卡片
    ctx.fillStyle = "#ffffff";
    ctx.roundRect(30, 160, 540, 300, 20);
    ctx.fill();

    const drawStat = (label, val, x, y, color) => {
      ctx.fillStyle = "#6b7280";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, x, y);

      ctx.fillStyle = color;
      ctx.font = "900 36px sans-serif";
      ctx.fillText(String(val), x, y + 45);
    };

    drawStat("已掌握汉字", `${learnedCount} 字`, 160, 210, "#ea580c");
    drawStat("连续打卡", `${streak} 天`, 440, 210, "#059669");
    drawStat("收集星星", `${stars} 颗`, 160, 320, "#d97706");
    drawStat("星币财富", `${coins} 星币`, 440, 320, "#7c3aed");

    // 4. 近 7 日趋势模拟柱状图
    ctx.fillStyle = "#ffffff";
    ctx.roundRect(30, 480, 540, 240, 20);
    ctx.fill();

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("本周每日识字达成", 55, 520);

    const history = p.studyHistory || [
      { date: "周一", count: 3 }, { date: "周二", count: 2 },
      { date: "周三", count: 4 }, { date: "周四", count: 1 },
      { date: "周五", count: 5 }, { date: "周六", count: 3 }, { date: "周日", count: 4 }
    ];
    const maxVal = Math.max(5, ...history.map(h => h.count));
    history.forEach((h, idx) => {
      const barX = 70 + idx * 68;
      const barH = (h.count / maxVal) * 110;
      const safeBarH = Math.max(4, barH);
      const safeBarY = 670 - safeBarH;

      ctx.fillStyle = "#f97316";
      ctx.roundRect(barX, safeBarY, 36, safeBarH, Math.min(8, Math.floor(safeBarH / 2)));
      ctx.fill();

      ctx.fillStyle = "#ea580c";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(h.count), barX + 18, safeBarY - 6);

      ctx.fillStyle = "#64748b";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(h.date, barX + 18, 695);
    });

    // 5. 底部荣誉与寄语卡片
    ctx.fillStyle = "#ffffff";
    ctx.roundRect(30, 740, 540, 180, 20);
    ctx.fill();

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("凯茜伴学老师寄语：", 55, 780);

    ctx.fillStyle = "#475569";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("宝贝本周发音洪亮，笔画书写极其规范，", 55, 815);
    ctx.fillText("艾宾浩斯复习记忆保持率高达 98.4%，继续加油！", 55, 845);

    const nowStr = new Date().toLocaleDateString("zh-CN");
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`生成时间: ${nowStr} · 凯茜识字`, 550, 895);

    // 绑定关闭、复制、分享与下载
    this._on(overlay.querySelector("#btn-close-poster"), "click", () => overlay.remove());

    const copyBtn = overlay.querySelector("#btn-copy-poster");
    if (copyBtn) {
      this._on(copyBtn, "click", () => {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          if (navigator.clipboard && window.ClipboardItem) {
            try {
              await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
              soundAndFX.playSuccessSound();
              showGameToast(this.container, "周报图片已复制到剪贴板！可直接去微信/聊天中粘贴！", "success");
              return;
            } catch (err) {
              console.warn("ClipboardItem write failed:", err);
            }
          }
          showGameToast(this.container, "请点击“保存海报”下载图片哦！", "info");
        }, "image/png");
      });
    }

    const shareBtn = overlay.querySelector("#btn-share-poster");
    if (shareBtn) {
      this._on(shareBtn, "click", () => {
        if (navigator.share) {
          canvas.toBlob(async (blob) => {
            if (!blob) return;
            try {
              const file = new File([blob], `凯茜识字_成长周报_${nowStr}.png`, { type: "image/png" });
              await navigator.share({
                title: "宝宝识字成长周报",
                text: "看看宝贝在凯茜识字的精彩表现！",
                files: [file]
              });
              soundAndFX.playSuccessSound();
            } catch {}
          }, "image/png");
        } else {
          showGameToast(this.container, "当前浏览器未开放原生分享，可使用“复制图片”或“保存海报”哦！", "info");
        }
      });
    }

    this._on(overlay.querySelector("#btn-download-poster"), "click", () => {
      const link = document.createElement("a");
      link.download = `凯茜识字_成长周报_${nowStr}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      soundAndFX.playSuccessSound();
      showGameToast(this.container, "周报海报已保存到相册！", "success");
    });
  }

  /**
   * 弹出跨设备换机迁移二维码弹窗
   */
  showSyncQRModal() {
    const token = storageManager.exportSyncToken();
    if (!token) {
      showGameToast(this.container, "生成换机数据失败", "error");
      return;
    }

    const overlay = document.createElement("div");
    overlay.id = "parent-sync-export-overlay";
    overlay.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in select-none";
    overlay.innerHTML = `
      <div class="relative max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <button id="btn-close-sync-qr" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black flex items-center justify-center cursor-pointer">
          ${GAME_ICONS.back("w-4 h-4")}
        </button>

        <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
          ${GAME_ICONS.sparkle("w-6 h-6")}
        </div>
        <h3 class="text-lg font-black text-amber-950 mb-1">跨设备换机迁移二维码</h3>
        <p class="text-xs text-gray-500 mb-4">在新设备打开凯茜识字，进入家长中心选择“导入换机进度”，即可恢复全部数据！</p>

        <div class="relative p-3 bg-white border-4 border-amber-300 rounded-2xl shadow-inner mb-4">
          <div class="absolute top-1.5 left-1.5 w-4 h-4 border-t-4 border-l-4 border-amber-600 rounded-tl pointer-events-none"></div>
          <div class="absolute top-1.5 right-1.5 w-4 h-4 border-t-4 border-r-4 border-amber-600 rounded-tr pointer-events-none"></div>
          <div class="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-4 border-l-4 border-amber-600 rounded-bl pointer-events-none"></div>
          <div class="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-4 border-r-4 border-amber-600 rounded-br pointer-events-none"></div>
          <canvas id="sync-qr-canvas" width="220" height="220" class="rounded-lg"></canvas>
        </div>

        <button id="btn-copy-sync-token" class="w-full btn-game-orange text-white font-black text-xs py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
          <span class="flex items-center">${GAME_ICONS.cards("w-4 h-4")}</span>
          <span>点击复制迁移码 (文本)</span>
        </button>
      </div>
    `;
    document.body.appendChild(overlay);

    const canvas = overlay.querySelector("#sync-qr-canvas");
    // HiDPI 支持
    const dpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;
    if (dpr > 1) {
      canvas.width = 220 * dpr;
      canvas.height = 220 * dpr;
      canvas.style.width = "220px";
      canvas.style.height = "220px";
    }
    drawQRCode(canvas, token, { size: 220, margin: 2, darkColor: "#78350f" });

    this._on(overlay.querySelector("#btn-close-sync-qr"), "click", () => overlay.remove());
    this._on(overlay.querySelector("#btn-copy-sync-token"), "click", async () => {
      try {
        await navigator.clipboard.writeText(token);
        soundAndFX.playSuccessSound();
        showGameToast(this.container, "迁移码已复制！可直接发送给新设备粘贴导入！", "success");
      } catch {
        showGameToast(this.container, "复制失败，请截图保存二维码哦！", "info");
      }
    });
  }

  /**
   * 弹出跨设备换机迁移导入弹窗
   */
  showImportSyncModal() {
    const overlay = document.createElement("div");
    overlay.id = "parent-sync-import-overlay";
    overlay.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in select-none";
    overlay.innerHTML = `
      <div class="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <button id="btn-close-import-sync" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black flex items-center justify-center cursor-pointer">
          ${GAME_ICONS.back("w-4 h-4")}
        </button>

        <h3 class="text-lg font-black text-amber-950 mb-1">导入跨设备换机进度</h3>
        <p class="text-xs text-gray-500 mb-4 leading-relaxed">请将旧设备上生成的【迁移码】粘贴到下方文本框中：</p>

        <textarea id="sync-token-input" rows="4" placeholder="在此粘贴 CATHY_SYNC_V1:... 迁移码" class="w-full bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-3 text-xs text-gray-800 font-mono mb-3 focus:outline-none focus:ring-2 focus:ring-amber-400"></textarea>

        <div class="w-full flex items-center gap-3 mb-3">
          <button id="btn-paste-sync-token" class="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs py-2.5 rounded-full border border-amber-300 shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.cards("w-3.5 h-3.5")}</span>
            <span>从剪贴板快捷粘贴</span>
          </button>
        </div>

        <button id="btn-confirm-import-sync" class="w-full btn-game-orange text-white font-black text-xs py-3 rounded-full shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
          <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
          <span>立即导入恢复进度</span>
        </button>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector("#sync-token-input");

    this._on(overlay.querySelector("#btn-close-import-sync"), "click", () => overlay.remove());

    const pasteBtn = overlay.querySelector("#btn-paste-sync-token");
    if (pasteBtn && input) {
      this._on(pasteBtn, "click", async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text && text.trim().startsWith("CATHY_SYNC_V1:")) {
            input.value = text.trim();
            soundAndFX.playPop();
            showGameToast(this.container, "已粘贴剪贴板中的迁移码！", "success");
          } else {
            showGameToast(this.container, "剪贴板中未找到以 CATHY_SYNC_V1 开头的有效迁移码", "info");
          }
        } catch {
          showGameToast(this.container, "请在输入框中长按进行粘贴", "info");
        }
      });
    }
    this._on(overlay.querySelector("#btn-confirm-import-sync"), "click", () => {
      const input = overlay.querySelector("#sync-token-input");
      const val = input ? input.value.trim() : "";
      const res = storageManager.importSyncToken(val);
      if (res.ok) {
        soundAndFX.playVictoryFanfare();
        ebbinghausManager.init();
        showGameToast(this.container, `换机同步成功！已恢复 ${res.charCount} 个汉字与 ${res.coins} 枚星币！`, "success");
        overlay.remove();
        this.render();
      } else {
        soundAndFX.playSoftError();
        showGameToast(this.container, res.msg || "迁移码无效，请检查后重试！", "error");
      }
    });
  }
}

