/**
 * mapHub/dailyQuestModal.js — 大地图「今日学练 (Daily Quest)」探险任务浮层
 * ------------------------------------------------------------------
 * 激活 sessionPlanner (米勒 7±2 / Cowan 4±1 儿童认知工作负荷容量算法)
 * 展示今日任务列表（新字探索 + 自由提取复习交错序列），支持一键启动与单项直达。
 */

import { ebbinghausManager } from "../ebbinghaus.js";
import { CHARACTER_DATABASE } from "../../data/characters.js";
import { planDailySession, setDeps } from "../sessionPlanner.js";
import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";
import { escapeHtml } from "../BaseModule.js";

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
        title: `学习新字 “${item.char}”`,
        subtitle: "五步多模态认知与描红",
        char: item.char,
        charData: item.charData,
        badge: "新字探索",
        badgeClass: "bg-orange-500 text-white",
      });
    } else if (type === "review" && revIdx < (session.reviews || []).length) {
      const item = session.reviews[revIdx++];
      tasks.push({
        type: "review",
        stepNum: i + 1,
        title: `复习巩固 “${item.char}”`,
        subtitle: "自由提取闪卡与形近字交错",
        char: item.char,
        charData: item.charData,
        badge: "艾宾浩斯复习",
        badgeClass: "bg-teal-600 text-white",
      });
    }
  });
  return tasks;
}

export function openDailyQuestModal(container = document.body, { onStartLearn, onStartReview } = {}) {
  setDeps({ ebbinghaus: ebbinghausManager, characterDB: CHARACTER_DATABASE });
  const session = planDailySession();

  const existing = document.getElementById("daily-quest-modal-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "daily-quest-modal-overlay";
  overlay.className = "fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in";

  const age = session.ageUsed || 6;
  const cfg = session.configUsed || { total: 5, newChars: 2, reviews: 3 };
  const tasks = buildDailyQuestTasks(session);

  const hasTasks = tasks.length > 0;

  overlay.innerHTML = `
    <div class="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-400 flex flex-col items-center text-white animate-scale-up">
      
      <button id="btn-close-quest-modal" class="absolute -top-3.5 -right-3.5 w-10 h-10 rounded-full bg-slate-800 text-white font-extrabold text-base flex items-center justify-center shadow-xl hover:bg-slate-700 active:scale-95 cursor-pointer border-2 border-amber-300">
        <span class="font-sans font-bold leading-none">✕</span>
      </button>

      <div class="flex flex-col items-center text-center mb-4">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="flex items-center">${GAME_ICONS.sparkle("w-6 h-6 text-amber-400")}</span>
          <h2 class="text-xl sm:text-2xl font-black text-amber-300 tracking-wide">今日学练探险清单</h2>
        </div>
        <div class="flex items-center gap-2 flex-wrap justify-center text-[11px] text-slate-300">
          <span class="bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full font-bold">
            ${age}岁适龄匹配 · Cowan/Miller 认知块化
          </span>
          <span class="bg-sky-500/20 text-sky-300 border border-sky-400/40 px-2.5 py-0.5 rounded-full font-bold">
            科学交错 ${cfg.newChars}新 + ${cfg.reviews}复
          </span>
        </div>
      </div>

      <div class="w-full max-h-[320px] overflow-y-auto no-scrollbar flex flex-col gap-2.5 my-2 px-1">
        ${hasTasks ? tasks.map((t, idx) => `
          <div class="quest-task-item flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border-2 ${t.type === 'new' ? 'border-orange-500/40 hover:border-orange-400' : 'border-teal-500/40 hover:border-teal-400'} transition-all cursor-pointer group" data-index="${idx}" data-type="${t.type}">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-full bg-slate-700/90 text-amber-300 font-mono font-black text-sm flex items-center justify-center border border-white/20">
                ${t.stepNum}
              </span>
              <div class="w-11 h-11 rounded-2xl ${t.type === 'new' ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-amber-950' : 'bg-gradient-to-br from-teal-400 to-emerald-600 text-white'} flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-110 transition-transform">
                ${escapeHtml(t.char)}
              </div>
              <div class="text-left">
                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-black text-white group-hover:text-amber-300 transition-colors">${escapeHtml(t.title)}</h4>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${t.badgeClass}">${t.badge}</span>
                </div>
                <p class="text-[11px] text-slate-400 mt-0.5">${escapeHtml(t.subtitle)}</p>
              </div>
            </div>
            <button class="btn-task-go px-3 py-1.5 rounded-xl ${t.type === 'new' ? 'bg-orange-500 hover:bg-orange-400' : 'bg-teal-600 hover:bg-teal-500'} text-white font-black text-xs active:scale-95 transition-all">
              去完成 ➔
            </button>
          </div>
        `).join("") : `
          <div class="py-12 flex flex-col items-center justify-center text-center">
            <span class="text-4xl mb-2">🎉</span>
            <p class="text-base font-black text-amber-300">太棒了！今日任务已全部搞定！</p>
            <p class="text-xs text-slate-400 mt-1">去绘本馆读读故事，或者去游乐场放松一下吧～</p>
          </div>
        `}
      </div>

      <div class="w-full mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-3">
        <span class="text-xs text-slate-400 font-bold">
          共 ${tasks.length} 项探险 · 预计用时约 10~15 分钟
        </span>
        ${hasTasks ? `
          <button id="btn-start-quest-flow" class="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white font-black text-sm shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer animate-pulse">
            <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
            <span>一键启程 (第 1 项)</span>
          </button>
        ` : `
          <button id="btn-quest-confirm" class="px-6 py-2 rounded-full bg-slate-700 text-white font-black text-xs hover:bg-slate-600 transition-all">
            知道了
          </button>
        `}
      </div>

    </div>
  `;

  container.appendChild(overlay);

  const close = () => {
    soundAndFX.playPop();
    overlay.remove();
  };

  overlay.querySelector("#btn-close-quest-modal")?.addEventListener("click", close);
  overlay.querySelector("#btn-quest-confirm")?.addEventListener("click", close);

  const startBtn = overlay.querySelector("#btn-start-quest-flow");
  if (startBtn && hasTasks) {
    startBtn.addEventListener("click", () => {
      soundAndFX.playParentCheer();
      overlay.remove();
      const first = tasks[0];
      if (first.type === "new" && typeof onStartLearn === "function") {
        onStartLearn(first.charData);
      } else if (first.type === "review" && typeof onStartReview === "function") {
        onStartReview();
      }
    });
  }

  overlay.querySelectorAll(".quest-task-item").forEach((item) => {
    item.addEventListener("click", () => {
      const idx = parseInt(item.dataset.index, 10);
      const t = tasks[idx];
      if (!t) return;
      soundAndFX.playPop();
      overlay.remove();
      if (t.type === "new" && typeof onStartLearn === "function") {
        onStartLearn(t.charData);
      } else if (t.type === "review" && typeof onStartReview === "function") {
        onStartReview();
      }
    });
  });

  return overlay;
}
