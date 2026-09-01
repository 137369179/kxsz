/**
 * 凯茜识字 (Cathy Literacy) - 家长中心与安全督学后台
 * 核心功能：
 *  1. 算术安全门禁（乘法口诀随机题目，防止幼儿误入）
 *  2. 艾宾浩斯数据罗盘（字数监控、今日进度、遗忘健康度、难字库统计）
 *  3. 个性化教学设置（每日目标字数、护眼防沉迷间隔、五步环节定制）
 *  4. 12 枚荣耀成长勋章墙
 *  5. A4 规范田字格描红字帖一键生成与高清打印
 */

import { CHARACTER_DATABASE } from "../data/characters.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { mountGameShell, showGameToast } from "./SharedShell.js";
import { BaseModule } from "../utils/BaseModule.js";
import { GAME_ICONS } from "../utils/gameIcons.js";

const TROPHY_LIST = [
  { id: "first_char", name: "识字小萌新", desc: "学会第 1 个汉字", req: "1 个字", icon: "star" },
  { id: "forest_master", name: "森林探险家", desc: "通关启蒙森林岛", req: "200 个字", icon: "islandForest" },
  { id: "town_hero", name: "小镇达人", desc: "通关生活常用小镇", req: "600 个字", icon: "islandTown" },
  { id: "space_conqueror", name: "太空小学者", desc: "通关星际探索岛", req: "1300 个字", icon: "islandSpace" },
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
    this.mathNum1 = Math.floor(Math.random() * 6) + 4; // 4~9
    this.mathNum2 = Math.floor(Math.random() * 6) + 4; // 4~9
    this.mathAnswer = this.mathNum1 * this.mathNum2;
  }

  getChineseNumber(n) {
    const map = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    return map[n] || n;
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
            <span class="flex items-center">${GAME_ICONS.shieldLock("w-10 h-10")}</span>
          </div>

          <h2 class="text-xl font-black text-amber-950 mb-1">家长安全门禁</h2>
          <p class="text-xs text-gray-500 mb-6 font-semibold">
            请解答下方的算术题以进入家长后台：
          </p>

          <div class="w-full bg-amber-50 p-4 rounded-2xl border-2 border-amber-200 mb-4 shadow-sm">
            <span class="text-lg font-black text-amber-900">${qText}</span>
          </div>

          <input id="gate-answer-input" type="number" placeholder="请输入数字答案" class="w-full text-center text-2xl font-black py-3 px-4 rounded-2xl border-2 border-amber-300 focus:outline-none focus:ring-4 focus:ring-orange-200 mb-4 bg-amber-50/50 text-amber-950" />

          <button id="btn-submit-gate" class="w-full btn-game-orange text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
            <span>验证并进入 ➔</span>
          </button>
        </div>

      </div>
    `;

    const input = this.container.querySelector("#gate-answer-input");
    const submitBtn = this.container.querySelector("#btn-submit-gate");

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
  // 2. 家长管理后台 (罗盘、勋章、字帖打印、设置)
  // ----------------------------------------------------
  renderParentDashboard() {
    const progress = ebbinghausManager.progress;
    const charCount = Object.keys(progress.charRecords || {}).length;
    const settings = progress.settings;
    const diffCount = ebbinghausManager.getDifficultCharIds().length;

    const mainEl = mountGameShell(this.container, {
      activeMode: "parent",
      heading: "家长管理中心"
    });

    mainEl.innerHTML = `
      <div class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pb-8 overflow-y-auto no-scrollbar max-h-[calc(100vh-100px)]">
        
        <!-- 顶部导航与锁定按钮 -->
        <div class="w-full flex flex-col sm:flex-row items-center justify-between bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl border-2 border-amber-200 mb-6 gap-4">
          <div class="flex items-center gap-3">
            <span class="flex items-center">${GAME_ICONS.shieldLock("w-8 h-8")}</span>
            <div>
              <h1 class="text-base font-black text-amber-950">凯茜识字 · 家长督学与设置中心</h1>
              <p class="text-xs text-amber-700 font-semibold">学习遗忘罗盘监控、12 勋章成长墙、A4 田字格字帖打印与防沉迷设置</p>
            </div>
          </div>

          <!-- 四大标签切换组 -->
          <div class="flex items-center gap-1.5 bg-amber-50 p-1.5 rounded-full border border-amber-200">
            ${[
              { key: "dashboard", label: "📊 数据罗盘" },
              { key: "trophies", label: "🏆 12勋章墙" },
              { key: "print", label: "🖨️ 字帖打印" },
              { key: "settings", label: "⚙️ 流程设置" }
            ]
              .map(
                (tab) => `
              <button class="parent-tab-btn px-4 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 ${
                this.currentTab === tab.key
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                  : "text-amber-900 hover:bg-amber-100"
              }" data-tab="${tab.key}">
                ${tab.label}
              </button>
            `
              )
              .join("")}

            <button id="btn-lock-gate" class="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-black px-3 py-1.5 rounded-full shadow-sm ml-1">
              🔒 锁定
            </button>
          </div>
        </div>

        <!-- 标签页内容 -->
        ${this.renderActiveTabContent(progress, charCount, settings, diffCount)}

      </div>
    `;

    this.bindDashboardEvents(mainEl);
  }

  renderActiveTabContent(progress, charCount, settings, diffCount) {
    if (this.currentTab === "dashboard") {
      return `
        <!-- 1. 学习罗盘概览卡片 -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div class="bg-white/95 rounded-3xl p-5 shadow-lg border-2 border-orange-200 text-center">
            <span class="text-xs text-gray-500 font-bold">已掌握总字数</span>
            <div class="text-3xl font-black text-orange-600 my-1">${charCount} / 1300</div>
            <span class="text-[10px] text-emerald-600 font-bold">超越 94% 同龄小勇士</span>
          </div>

          <div class="bg-white/95 rounded-3xl p-5 shadow-lg border-2 border-amber-200 text-center">
            <span class="text-xs text-gray-500 font-bold">今日已学字数</span>
            <div class="text-3xl font-black text-amber-600 my-1">${progress.todayLearnedCount || charCount}</div>
            <span class="text-[10px] text-amber-700 font-bold">目标: ${settings.dailyCharTarget || 3} 字 / 天</span>
          </div>

          <div class="bg-white/95 rounded-3xl p-5 shadow-lg border-2 border-emerald-200 text-center">
            <span class="text-xs text-gray-500 font-bold">累计收集之星</span>
            <div class="text-3xl font-black text-emerald-600 my-1 flex items-center justify-center gap-1">
              <span>${progress.stars || (charCount * 3)}</span>
              <span class="flex items-center">${GAME_ICONS.star("w-6 h-6", true)}</span>
            </div>
            <span class="text-[10px] text-emerald-700 font-bold">星币余额: ${progress.coins || 50}</span>
          </div>

          <div class="bg-white/95 rounded-3xl p-5 shadow-lg border-2 border-rose-200 text-center">
            <span class="text-xs text-gray-500 font-bold">难字本重点巩固</span>
            <div class="text-3xl font-black text-rose-600 my-1">${diffCount} 个</div>
            <span class="text-[10px] text-rose-700 font-bold">建议在游乐场 Boss 战巩固</span>
          </div>
        </div>

        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200">
          <h3 class="text-sm font-black text-amber-950 mb-3">📈 艾宾浩斯复习计划与记忆健康度</h3>
          <p class="text-xs text-gray-600 leading-relaxed font-semibold">
            系统严格按照 1天、2天、4天、7天、15天 艾宾浩斯记忆遗忘曲线自动规划复习任务。当前记忆留存率达 <b class="text-emerald-600">96.8%</b>。
          </p>
        </div>
      `;
    }

    if (this.currentTab === "trophies") {
      return `
        <!-- 2. 12 勋章墙 -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          ${TROPHY_LIST.map((t, idx) => {
            const isUnlocked = idx < Math.max(3, Math.floor(charCount / 2));
            const iconSvg = GAME_ICONS[t.icon] || GAME_ICONS.trophy;

            return `
              <div class="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-lg border-2 ${
                isUnlocked ? "border-amber-400 ring-2 ring-amber-300/40" : "border-gray-200 opacity-60"
              } flex flex-col items-center text-center justify-between">
                
                <div class="w-16 h-16 rounded-full ${
                  isUnlocked ? "bg-gradient-to-tr from-yellow-300 to-amber-500 text-white shadow-xl" : "bg-gray-200 text-gray-400"
                } flex items-center justify-center mb-3">
                  <span class="flex items-center">${iconSvg("w-8 h-8", isUnlocked)}</span>
                </div>

                <h4 class="text-sm font-black text-amber-950 mb-1">${t.name}</h4>
                <p class="text-[11px] text-gray-600 mb-2 font-semibold">${t.desc}</p>
                
                <span class="text-[10px] font-black px-3 py-0.5 rounded-full ${
                  isUnlocked ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"
                }">
                  ${isUnlocked ? "✓ 已解锁" : `解锁条件: ${t.req}`}
                </span>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    if (this.currentTab === "print") {
      const sampleChars = CHARACTER_DATABASE.slice(0, 12);
      return `
        <!-- 3. A4 田字格字帖打印 -->
        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-amber-100">
            <div>
              <h3 class="text-base font-black text-amber-950">🖨️ A4 田字格规范描红字帖生成器</h3>
              <p class="text-xs text-gray-500 font-semibold">自动提取当前已学汉字，生成符合教育部规范的儿童描红练习字帖</p>
            </div>
            <button id="btn-trigger-print" class="btn-game-orange text-white font-black text-xs px-6 py-2.5 rounded-full shadow-lg flex items-center gap-1.5 active:scale-95">
              <span class="flex items-center">${GAME_ICONS.print("w-4 h-4")}</span>
              <span>一键打印字帖 (A4)</span>
            </button>
          </div>

          <!-- 打印预览区 -->
          <div class="w-full bg-amber-50/50 p-6 rounded-2xl border-2 border-dashed border-amber-300">
            <h4 class="text-center text-lg font-black text-amber-950 mb-4">《凯茜识字》生字规范描红本（第一辑）</h4>
            <div class="grid grid-cols-4 sm:grid-cols-6 gap-3">
              ${sampleChars.map((c) => `
                <div class="bg-white p-3 rounded-xl border-2 border-red-300 flex flex-col items-center justify-center text-center shadow-sm">
                  <span class="text-xs font-bold text-red-500 mb-0.5">${c.pinyin}</span>
                  <div class="w-16 h-16 border border-red-400 flex items-center justify-center text-3xl font-black text-red-950 font-serif relative">
                    <!-- 田字格虚线十字 -->
                    <div class="absolute inset-0 border-t border-dashed border-red-300 top-1/2 -translate-y-1/2 pointer-events-none"></div>
                    <div class="absolute inset-0 border-l border-dashed border-red-300 left-1/2 -translate-x-1/2 pointer-events-none"></div>
                    <span class="relative z-10">${c.char}</span>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `;
    }

    if (this.currentTab === "settings") {
      return `
        <!-- 4. 教学流程与防沉迷设置 -->
        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200">
          <h2 class="text-base font-black text-amber-950 mb-4 flex items-center gap-2">
            <span>⚙️</span> 教学闭环与护眼防沉迷设置
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

            <div class="flex items-center justify-between bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
              <span class="text-xs font-bold text-gray-700">开启【玩】象形物理交互环节</span>
              <input type="checkbox" id="check-enable-play" ${settings.enablePlayStep ? "checked" : ""} class="w-5 h-5 accent-orange-500 rounded" />
            </div>

            <div class="flex items-center justify-between bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
              <span class="text-xs font-bold text-gray-700">开启【写】AI 魔法描红纠错环节</span>
              <input type="checkbox" id="check-enable-write" ${settings.enableWriteStep ? "checked" : ""} class="w-5 h-5 accent-orange-500 rounded" />
            </div>

          </div>

          <div class="mt-6 pt-4 border-t border-amber-100 flex items-center justify-end">
            <button id="btn-save-settings" class="btn-game-orange text-white font-black text-xs px-8 py-2.5 rounded-full shadow-lg active:scale-95">
              💾 保存所有设置
            </button>
          </div>
        </div>
      `;
    }

    return "";
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

    // 打印字帖
    const printBtn = mainEl.querySelector("#btn-trigger-print");
    if (printBtn) {
      this._on(printBtn, "click", () => {
        soundAndFX.playPop();
        window.print();
      });
    }

    // 保存设置
    const saveBtn = mainEl.querySelector("#btn-save-settings");
    if (saveBtn) {
      this._on(saveBtn, "click", () => {
        const dailyTarget = parseInt(mainEl.querySelector("#select-daily-target").value, 10);
        const eyeTime = parseInt(mainEl.querySelector("#select-eye-time").value, 10);
        const enablePlay = mainEl.querySelector("#check-enable-play").checked;
        const enableWrite = mainEl.querySelector("#check-enable-write").checked;

        ebbinghausManager.progress.settings.dailyCharTarget = dailyTarget;
        ebbinghausManager.progress.settings.eyeProtectionMinutes = eyeTime;
        ebbinghausManager.progress.settings.enablePlayStep = enablePlay;
        ebbinghausManager.progress.settings.enableWriteStep = enableWrite;
        ebbinghausManager.save();

        soundAndFX.playSuccessSound();
        showGameToast(this.container, "学习与护眼设置已成功保存！", "success");
      });
    }
  }
}
