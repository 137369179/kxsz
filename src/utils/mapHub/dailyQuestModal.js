/**
 * mapHub/dailyQuestModal.js — 大地图「今日学练」探险任务浮层
 * ------------------------------------------------------------------
 * 用 sessionPlanner 编排今日任务（新字 + 复习交错），文案面向儿童口语化。
 */

import { ebbinghausManager } from "../ebbinghaus.js";
import { CHARACTER_DATABASE } from "../../data/characters.js";
import { planDailySession, setDeps } from "../sessionPlanner.js";
import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";
import { escapeHtml } from "../BaseModule.js";
import { eventBus, EVENTS } from "../eventBus.js";

const QUEST_DONE_KEY = "cathy_daily_quest_done";

/** @returns {string} YYYY-MM-DD */
export function todayQuestKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getQuestProgressSnapshot(session) {
  const tasks = buildDailyQuestTasks(session || planDailySession());
  const doneRaw = (() => {
    try {
      return JSON.parse(localStorage.getItem(QUEST_DONE_KEY) || "{}");
    } catch {
      return {};
    }
  })();
  const day = todayQuestKey();
  const doneSet = new Set(Array.isArray(doneRaw[day]) ? doneRaw[day] : []);
  const completed = tasks.filter((t) => doneSet.has(t.questId)).length;
  return {
    total: tasks.length,
    completed: Math.min(completed, tasks.length),
    allDone: tasks.length > 0 && completed >= tasks.length,
    tasks,
    doneSet,
  };
}

export function markQuestTaskDone(questId) {
  if (!questId) return;
  const day = todayQuestKey();
  let store = {};
  try {
    store = JSON.parse(localStorage.getItem(QUEST_DONE_KEY) || "{}");
  } catch {
    store = {};
  }
  const list = Array.isArray(store[day]) ? store[day] : [];
  if (!list.includes(questId)) list.push(questId);
  store[day] = list;
  try {
    localStorage.setItem(QUEST_DONE_KEY, JSON.stringify(store));
  } catch {}
}

export function buildDailyQuestTasks(session) {
  const tasks = [];
  let newIdx = 0;
  let revIdx = 0;

  (session.blockOrder || []).forEach((type, i) => {
    if (type === "new" && newIdx < (session.newChars || []).length) {
      const item = session.newChars[newIdx++];
      tasks.push({
        type: "new",
        stepNum: i + 1,
        title: `认识新朋友 “${item.char}”`,
        subtitle: "一起玩一玩、认一认、写一写",
        char: item.char,
        charData: item.charData,
        badge: "新字宝宝",
        badgeClass: "bg-orange-500 text-white",
        questId: `new:${item.id || item.char}`,
      });
    } else if (type === "review" && revIdx < (session.reviews || []).length) {
      const item = session.reviews[revIdx++];
      let badge = "老朋友";
      let badgeClass = "bg-teal-600 text-white";
      let subtitle = "听一听、想一想，还能认出它吗？";

      if (item.source === "overnight") {
        badge = "昨晚学的";
        badgeClass = "bg-purple-600 text-white";
        subtitle = "睡醒后再见一面，记得更牢";
      } else if (item.source === "mistake") {
        badge = "加油字";
        badgeClass = "bg-rose-600 text-white";
        subtitle = "上次有点难，这次再试一次";
      }

      tasks.push({
        type: "review",
        stepNum: i + 1,
        title: `复习老朋友 “${item.char}”`,
        subtitle,
        char: item.char,
        charData: item.charData,
        badge,
        badgeClass,
        questId: `review:${item.id || item.char}`,
      });
    }
  });

  // 学练读流水线收尾：有任务时追加「读一本故事」
  if (tasks.length > 0) {
    tasks.push({
      type: "book",
      stepNum: tasks.length + 1,
      title: "读一本小故事",
      subtitle: "把今天学的字用在故事里",
      char: "书",
      charData: null,
      badge: "绘本时光",
      badgeClass: "bg-sky-500 text-white",
      questId: "book:daily",
    });
  }

  return tasks;
}

export function openDailyQuestModal(container = document.body, { onStartLearn, onStartReview, onStartBook } = {}) {
  setDeps({ ebbinghaus: ebbinghausManager, characterDB: CHARACTER_DATABASE });
  const session = planDailySession();

  const existing = document.getElementById("daily-quest-modal-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "daily-quest-modal-overlay";
  overlay.className = "fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in";

  const age = session.ageUsed || 6;
  const cfg = session.configUsed || { total: 5, newChars: 2, reviews: 3 };
  const snap = getQuestProgressSnapshot(session);
  const tasks = snap.tasks;
  const hasTasks = tasks.length > 0 && !snap.allDone;
  const showList = tasks.length > 0;
  const pct = snap.total > 0 ? Math.round((snap.completed / snap.total) * 100) : 0;

  overlay.innerHTML = `
    <div role="dialog" aria-modal="true" aria-labelledby="quest-modal-title" aria-describedby="quest-modal-desc" class="parchment-board relative w-full max-w-xl rounded-3xl p-6 sm:p-7 flex flex-col items-center text-amber-950 animate-scale-up">
      
      <button id="btn-close-quest-modal" class="btn-game-wood absolute -top-3.5 -right-3.5 w-12 h-12 rounded-full text-white font-extrabold text-base flex items-center justify-center cursor-pointer touch-target" aria-label="关闭今日任务" data-speak="关闭">
        <span class="flex items-center">${GAME_ICONS.back("w-5 h-5")}</span>
      </button>

      <div class="flex flex-col items-center text-center mb-4">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="flex items-center">${GAME_ICONS.sparkle("w-6 h-6 text-orange-500")}</span>
          <h2 id="quest-modal-title" class="text-2xl font-black text-orange-700 tracking-wide">今天的小冒险</h2>
        </div>
        <p id="quest-modal-desc" class="text-base text-amber-800/80 font-bold mb-2">学新字 · 复习老朋友 · 读小故事</p>
        <div class="flex items-center gap-2 flex-wrap justify-center text-xs text-amber-900">
          <span class="bg-orange-100 text-orange-800 border border-orange-300 px-2.5 py-0.5 rounded-full font-bold" data-speak="${age}岁小朋友的今日任务">
            ${age} 岁小朋友专属
          </span>
          <span class="bg-sky-100 text-sky-800 border border-sky-300 px-2.5 py-0.5 rounded-full font-bold" data-speak="今天学${cfg.newChars}个新字，复习${cfg.reviews}个老朋友">
            今天 ${cfg.newChars} 个新字 + ${cfg.reviews} 个老朋友
          </span>
        </div>
        <div class="w-full max-w-sm mt-3" aria-live="polite">
          <div class="flex justify-between text-[11px] font-black text-amber-800 mb-1">
            <span>探险进度</span>
            <span>${snap.completed} / ${snap.total || tasks.length}</span>
          </div>
          <div class="progress-candy-bar ${snap.allDone ? "is-done" : ""}" style="height:0.75rem">
            <span class="progress-candy-bar-fill" style="width:${pct}%"></span>
          </div>
        </div>
      </div>

      <div class="w-full max-h-[320px] overflow-y-auto no-scrollbar flex flex-col gap-2.5 my-2 px-1">
        ${showList && !snap.allDone ? tasks.map((t, idx) => {
          const done = snap.doneSet.has(t.questId);
          return `
          <div class="quest-task-item flex items-center justify-between p-3.5 rounded-2xl ${done ? "bg-emerald-50 border-emerald-300 opacity-80" : "bg-white hover:bg-orange-50"} border-2 ${t.type === "new" ? "border-orange-300 hover:border-orange-400" : t.type === "book" ? "border-sky-300 hover:border-sky-400" : "border-teal-300 hover:border-teal-400"} transition-all cursor-pointer group touch-target" data-index="${idx}" data-type="${t.type}" data-speak="${escapeHtml(t.title)}，${escapeHtml(t.subtitle)}" role="button" tabindex="0" aria-label="${escapeHtml(t.title)}">
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-full ${done ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-800"} font-black text-sm flex items-center justify-center border border-amber-200">
                ${done ? `<span class="flex items-center">${GAME_ICONS.check("w-5 h-5")}</span>` : t.stepNum}
              </span>
              <div class="w-12 h-12 rounded-2xl ${t.type === "new" ? "bg-gradient-to-br from-amber-400 to-orange-500 text-amber-950" : t.type === "book" ? "bg-gradient-to-br from-sky-400 to-blue-500 text-white" : "bg-gradient-to-br from-teal-400 to-emerald-600 text-white"} flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-110 transition-transform">
                ${escapeHtml(t.char)}
              </div>
              <div class="text-left">
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="text-sm font-black text-amber-950 group-hover:text-orange-600 transition-colors">${escapeHtml(t.title)}</h4>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${t.badgeClass}">${t.badge}</span>
                </div>
                <p class="text-[11px] text-amber-800/70 mt-0.5">${escapeHtml(t.subtitle)}</p>
              </div>
            </div>
            <button class="btn-task-go px-3.5 py-2 rounded-full ${done ? "btn-game-green" : t.type === "new" ? "btn-game-orange" : t.type === "book" ? "btn-game-blue" : "btn-game-green"} text-white font-black text-xs touch-target" data-speak="${done ? "已经完成啦" : "去完成"}" aria-label="${done ? "已完成" : "去完成"}">
              ${done ? "完成" : "出发"}
            </button>
          </div>`;
        }).join("") : `
          <div class="py-12 flex flex-col items-center justify-center text-center">
            <div class="mb-2 flex justify-center">${GAME_ICONS.trophy("w-14 h-14")}</div>
            <p class="text-base font-black text-orange-600" data-speak="太棒了！今天的小冒险全部完成啦！">太棒了！今天的小冒险全部完成啦！</p>
            <p class="text-xs text-amber-800/70 mt-1">去绘本馆读故事，或去游乐场玩一玩吧</p>
          </div>
        `}
      </div>

      <div class="w-full mt-4 pt-3 border-t border-amber-200 flex items-center justify-between gap-3">
        <span class="text-xs text-amber-800/70 font-bold">
          大约需要 10～15 分钟
        </span>
        ${hasTasks ? `
          <button id="btn-start-quest-flow" class="btn-game-orange px-6 py-3 rounded-full text-white font-black text-sm flex items-center gap-2 cursor-pointer touch-target" data-speak="从第一项开始探险" aria-label="从第一项开始">
            <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
            <span>开始探险</span>
          </button>
        ` : `
          <button id="btn-quest-confirm" class="btn-game-wood px-6 py-3 rounded-full text-white font-black text-xs touch-target" data-speak="知道了" aria-label="知道了">
            知道了
          </button>
        `}
      </div>

    </div>
  `;

  container.appendChild(overlay);

  const close = () => {
    soundAndFX.stopSpeaking();
    soundAndFX.playPop();
    overlay.remove();
  };

  const launchTask = (t) => {
    if (!t) return;
    soundAndFX.stopSpeaking();
    soundAndFX.playPop();
    markQuestTaskDone(t.questId);
    overlay.remove();
    if (t.type === "new" && typeof onStartLearn === "function") {
      onStartLearn(t.charData);
    } else if (t.type === "review" && typeof onStartReview === "function") {
      onStartReview();
    } else if (t.type === "book") {
      if (typeof onStartBook === "function") onStartBook();
      else eventBus.emit(EVENTS.SWITCH_MODE, { mode: "books" });
    }
  };

  overlay.querySelector("#btn-close-quest-modal")?.addEventListener("click", close);
  overlay.querySelector("#btn-quest-confirm")?.addEventListener("click", close);

  const startBtn = overlay.querySelector("#btn-start-quest-flow");
  if (startBtn && hasTasks) {
    startBtn.addEventListener("click", () => {
      soundAndFX.stopSpeaking();
      soundAndFX.playParentCheer();
      const next = tasks.find((t) => !snap.doneSet.has(t.questId)) || tasks[0];
      launchTask(next);
    });
  }

  overlay.querySelectorAll(".quest-task-item").forEach((item) => {
    const go = () => {
      const idx = parseInt(item.dataset.index, 10);
      launchTask(tasks[idx]);
    };
    item.addEventListener("click", go);
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });
  });

  return overlay;
}
