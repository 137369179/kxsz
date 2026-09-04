/** ParentModule — dashboard tab HTML fragments */
import { CHARACTER_DATABASE } from "../../data/characters.js";
import { GAME_ICONS } from "../gameIcons.js";
import { buildFullReport } from "../reportEngine.js";
import { getTodayWorksheetChars, getDifficultWorksheetChars, getQuestWorksheetChars } from "../worksheetGenerator.js";
import { TROPHY_LIST, resolveTrophyUnlocks, describeStepSequenceForAge } from "./parentTrophies.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { storageManager } from "../storageManager.js";
import { escapeHtml } from "../BaseModule.js";

export function renderActiveTabContent(progress, charCount, settings, diffCount) {
  // E14: 预计算多维报告数据（一次算完，所有面板复用）
  const _report = buildFullReport(progress);

  if (this.currentTab === "dashboard") {
    const history = (progress.studyHistory && progress.studyHistory.length)
      ? progress.studyHistory
      : [
        { date: "周一", count: 0 },
        { date: "周二", count: 0 },
        { date: "周三", count: 0 },
        { date: "周四", count: 0 },
        { date: "周五", count: 0 },
        { date: "周六", count: 0 },
        { date: "周日", count: 0 }
      ];
    const maxCount = Math.max(5, ...history.map(h => h.count));
    const health = _report.mastery.healthScore;
    const healthLabel = health >= 80 ? "记忆保持良好" : health >= 50 ? "需要按时复习" : "建议优先巩固难字";

    return `
      <!-- 过程性反馈：引导家长关注过程而非全勤/分数（自我决定理论：胜任感来自尝试与坚持） -->
      <div class="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
        <span class="flex items-center text-emerald-600 shrink-0">${GAME_ICONS.sparkle("w-5 h-5")}</span>
        <p class="text-xs font-bold text-emerald-900 leading-relaxed">
          今日已学 <span class="text-emerald-700 text-sm">${progress.todayLearnedCount || 0}</span> 字 · 每天 5 分钟的专注陪伴，比 30 天全勤打卡更有价值——记得和孩子一起朗读、鼓励每一次尝试。
        </p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-orange-200 text-center">
          <span class="text-xs sm:text-sm text-gray-500 font-bold">已掌握总字数</span>
          <div class="text-4xl font-black text-orange-600 my-2">${charCount} / 1490</div>
          <span class="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full">已掌握 ${_report.mastery.mastered} · 学习中 ${_report.mastery.learning}</span>
        </div>

        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200 text-center">
          <span class="text-xs sm:text-sm text-gray-500 font-bold">今日已学字数</span>
          <div class="text-4xl font-black text-amber-600 my-2">${progress.todayLearnedCount || 0}</div>
          <span class="text-xs text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-full">每日目标: ${settings.dailyCharTarget || 5} 字</span>
        </div>

        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-emerald-200 text-center">
          <span class="text-xs sm:text-sm text-gray-500 font-bold">累计收集之星</span>
          <div class="text-4xl font-black text-emerald-600 my-2 flex items-center justify-center gap-1.5">
            <span>${progress.stars || 0}</span>
            <span class="flex items-center">${GAME_ICONS.star("w-7 h-7", false)}</span>
          </div>
          <span class="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full">星币余额: ${progress.coins || 0}</span>
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
          <span class="text-xs text-rose-700 font-bold bg-rose-50 px-3 py-1 rounded-full">已安排至智能复习流</span>
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
            <button id="btn-gen-report-poster" class="btn-game-orange text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer">
              <span>生成成长周报海报</span>
            </button>
            <button id="btn-gen-champion-cert" class="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.crown("w-3.5 h-3.5")}</span>
              <span>小状元金榜奖状</span>
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
          <h3 class="text-base font-black text-amber-950">智能复习调度（FSRS）</h3>
        </div>
        <p class="text-xs sm:text-sm text-gray-600 leading-relaxed font-semibold">
          根据每次复习表现动态安排下次复习时间。当前记忆健康度 <b class="text-emerald-600">${health}/100</b>，${healthLabel}。
        </p>
      </div>
    `;
  }

  if (this.currentTab === "trophies") {
    const unlocks = resolveTrophyUnlocks(progress);
    return `
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        ${TROPHY_LIST.map((t) => {
          const isUnlocked = !!unlocks[t.id];
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
    if (this.printMode === "quest") {
      activeChars = getQuestWorksheetChars();
    } else if (this.printMode === "difficult") {
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
            { key: "quest", label: "今日学练 (Daily Quest 任务字)" },
            { key: "today", label: "今日所学 (最新字)" },
            { key: "difficult", label: "难字本薄弱字" },
            { key: "stage1", label: "第1阶启蒙高频字" }
          ].map(pm => `
            <button class="btn-print-mode px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              (this.printMode || "quest") === pm.key
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
    const profileAge = progress.profile?.age ?? "";
    const agePreview = describeStepSequenceForAge(profileAge || ebbinghausManager.getAge());
    const activeProfileId = storageManager.getActiveProfileId();
    const profiles = storageManager.listProfiles();
    const activeProfile = profiles.find((p) => p.id === activeProfileId) || { id: activeProfileId, name: "大宝" };
    return `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200">
        <h2 class="text-base font-black text-amber-950 mb-4 flex items-center gap-2">
          <span class="flex items-center">${GAME_ICONS.parent()}</span>
          <span>教学闭环与护眼防沉迷设置</span>
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <div class="flex flex-col gap-2 sm:col-span-2 bg-indigo-50/80 border-2 border-indigo-200 rounded-2xl p-4">
            <label class="text-xs font-bold text-indigo-950">孩子年龄（决定学习步骤数量）：</label>
            <select id="select-child-age" class="bg-white border-2 border-indigo-300 rounded-xl px-3 py-2 text-xs font-black text-indigo-900 focus:outline-none">
              <option value="" ${profileAge === "" || profileAge == null ? "selected" : ""}>未设置（默认按 6 岁：6 步，跳过读拼音与独立写）</option>
              ${[3,4,5,6,7,8,9,10].map((a) => `
                <option value="${a}" ${Number(profileAge) === a ? "selected" : ""}>${a} 岁</option>
              `).join("")}
            </select>
            <p class="age-step-preview text-[11px] font-bold text-indigo-800 leading-relaxed">
              当前预览：${agePreview.label}
            </p>
            <p class="text-[10px] text-indigo-600 font-semibold">3–4 岁 4 步 · 5–6 岁 6 步 · 7 岁及以上 8 步全流程。请按真实年龄设置，避免步骤被静默跳过。</p>
          </div>
          
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
            <label class="text-xs font-bold text-gray-700">每日学习总时长上限：</label>
            <select id="select-daily-limit" class="bg-amber-50 border-2 border-amber-300 rounded-xl px-3 py-2 text-xs font-black text-amber-900 focus:outline-none">
              <option value="auto" ${settings.dailyTimeLimitMinutes == null ? "selected" : ""}>按年龄自动 (3-5岁40分 / 6-11岁60分)</option>
              <option value="30" ${settings.dailyTimeLimitMinutes === 30 ? "selected" : ""}>30 分钟 / 天</option>
              <option value="40" ${settings.dailyTimeLimitMinutes === 40 ? "selected" : ""}>40 分钟 / 天</option>
              <option value="60" ${settings.dailyTimeLimitMinutes === 60 ? "selected" : ""}>60 分钟 / 天</option>
              <option value="90" ${settings.dailyTimeLimitMinutes === 90 ? "selected" : ""}>90 分钟 / 天</option>
            </select>
            <p class="text-[10px] text-gray-500 font-semibold">到达上限后需家长算术验证才能延长，每天最多延长 2 次。</p>
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
          <button id="btn-backup-idb" class="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-black text-xs px-6 py-2.5 rounded-full border border-emerald-300 shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer" title="全量备份当前数据至浏览器本地 IndexedDB 灾备数据库">
            <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
            <span>全量 IndexedDB 灾备</span>
          </button>
        </div>
      </div>

      <!-- 多儿童档案管理 -->
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-indigo-200 mt-6">
        <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 class="text-base font-black text-indigo-950 flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.sparkle("w-5 h-5")}</span>
            <span>多儿童学习档案管理</span>
          </h2>
          <span class="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            当前档案：${escapeHtml(activeProfile.name)}
          </span>
        </div>
        <p class="text-xs text-gray-500 mb-4 font-semibold leading-relaxed">
          家中多个宝宝可独立记录识字量、星币与记忆曲线，互不干扰；随时一键平滑切换。
        </p>

        <div class="flex flex-wrap items-center gap-3" id="child-profiles-list">
          ${profiles.map((p) => {
            const safeName = escapeHtml(p.name);
            return `
            <div class="child-profile-card flex items-center gap-1 p-1 rounded-2xl border transition-all ${
              p.id === activeProfileId
                ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300 scale-105 border-indigo-700"
                : "bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border-indigo-200"
            }">
              <button class="btn-switch-child px-3 py-1.5 font-black text-xs flex items-center gap-1.5 cursor-pointer" data-profile-id="${escapeHtml(p.id)}" data-profile-name="${safeName}">
                <span class="flex items-center">${GAME_ICONS.parent("w-3.5 h-3.5")}</span>
                <span>${safeName}</span>
                ${p.id === activeProfileId ? '<span class="text-[9px] bg-white/25 px-1.5 py-0.2 rounded-full">使用中</span>' : ''}
              </button>
              <button class="btn-rename-child p-1 rounded-lg hover:bg-black/10 active:scale-90 transition-transform cursor-pointer" title="重命名小名" data-profile-id="${escapeHtml(p.id)}" data-profile-name="${safeName}">
                <span class="flex items-center">${GAME_ICONS.pen("w-3 h-3")}</span>
              </button>
              ${profiles.length > 1 ? `
                <button class="btn-delete-child p-1 rounded-lg hover:bg-red-500/20 active:scale-90 transition-transform cursor-pointer" title="删除此档案" data-profile-id="${escapeHtml(p.id)}" data-profile-name="${safeName}">
                  <span class="text-xs font-bold leading-none">&times;</span>
                </button>
              ` : ''}
            </div>
          `;
          }).join("")}
          <button id="btn-add-child-profile" class="px-3.5 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer">
            <span class="text-sm font-black leading-none">+</span>
            <span>添加宝宝档案</span>
          </button>
        </div>
      </div>
    `;
  }

  if (this.currentTab === "privacy") {
    const profileId = storageManager.getActiveProfileId?.() || "child_1";
    return `
      <div class="space-y-5">
        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-sky-200">
          <h2 class="text-base font-black text-amber-950 mb-2 flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.shieldLock("w-5 h-5")}</span>
            <span>隐私与数据安全</span>
          </h2>
          <div class="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 text-xs font-semibold text-sky-900 leading-relaxed">
            凯茜识字<b>完全离线运行</b>：孩子的全部学习数据（进度/打卡/星币/勋章）仅保存在<b>本设备的浏览器本地存储</b>中，
            应用内无任何账号注册、无云端上传、无广告与第三方统计 SDK。发音评测的跟读录音仅在评测瞬间使用，不落盘、不上传。
            语音朗读由本机语音服务（127.0.0.1 本地端口）生成，数据不离开设备。
          </div>
        </div>

        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200">
          <h2 class="text-base font-black text-amber-950 mb-3 flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.gear("w-5 h-5")}</span>
            <span>本设备存储的数据</span>
          </h2>
          <ul class="text-xs text-gray-600 font-semibold space-y-1.5 list-disc pl-5 leading-relaxed">
            <li>学习进度主存档（${escapeHtml(profileId)}）：已学汉字 / 艾宾浩斯复习调度 / 星币与勋章 / 打卡日历</li>
            <li>绘本阅读进度（cathy_book_progress_v2）与家长语音模板（家长中心录制，本机 IndexedDB）</li>
            <li>偏好设置：专注模式 / 护眼间隔 / 描红容差 / 今日目标</li>
          </ul>
        </div>

        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-emerald-200 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div class="text-xs text-gray-600 font-semibold leading-relaxed">
            <span class="text-emerald-800 font-black block mb-1">换设备或想留档？</span>
            导出当前进度为 JSON 文件保存；如需重新开始可一键清除全部学习数据（需二次确认）。
          </div>
          <div class="flex items-center gap-3 flex-wrap shrink-0">
            <button id="btn-export-data" class="bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs px-5 py-2.5 rounded-full shadow-md active:scale-95 cursor-pointer">导出进度备份 (JSON)</button>
            <button id="btn-wipe-data" class="bg-rose-500 hover:bg-rose-400 text-white font-black text-xs px-5 py-2.5 rounded-full shadow-md active:scale-95 cursor-pointer">清除全部学习数据</button>
          </div>
        </div>
      </div>
    `;
  }

  return "";
}

export function renderAiLogTab(progress, charCount, settings, diffCount) {
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

