/**
 * 微复习弹窗 UI — 订阅 MICRO_EVENTS.TRIGGER
 * 展示今日已学字抽题提示，支持「去复习 / 稍后 / 跳过」
 */
import { eventBus } from "./eventBus.js";
import {
  MICRO_EVENTS,
  dismissMicroReview,
  snoozeMicroReview,
  triggerMicroReview,
} from "./microReviewScheduler.js";
import { ebbinghausManager } from "./ebbinghaus.js";
import { CHARACTER_DATABASE } from "../data/characters.js";
import { GAME_ICONS } from "./gameIcons.js";

let _bound = false;
let _open = false;

function pickTodayChars(limit = 3) {
  const records = ebbinghausManager.progress?.charRecords || {};
  const learned = Object.values(records)
    .filter((r) => {
      if (!r?.charId) return false;
      if (r.learnedAt && new Date(r.learnedAt).toDateString() === new Date().toDateString()) return true;
      return !!r.isDifficult;
    })
    .map((r) => r.charId);
  const pool = (learned.length ? learned : Object.keys(records)).slice(0, 24);
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, limit);
  return shuffled
    .map((id) => CHARACTER_DATABASE.find((c) => c.id === id))
    .filter(Boolean);
}

function escapeText(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * @param {{ type?: string }} payload
 */
export function showMicroReviewPrompt(payload = {}) {
  if (typeof document === "undefined" || _open) return;
  _open = true;

  const kind = payload.type === "60min" ? "60 分钟" : "20 分钟";
  const chars = pickTodayChars(3);
  const charIds = chars.map((c) => c.id);
  const charLabel = chars.length
    ? chars.map((c) => c.char).join(" · ")
    : "今天学过的字";

  const bell = typeof GAME_ICONS?.bell === "function"
    ? GAME_ICONS.bell("w-8 h-8")
    : `<span class="font-black">!</span>`;

  const overlay = document.createElement("div");
  overlay.id = "micro-review-overlay";
  overlay.className = "fixed inset-0 z-[99990] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4";
  overlay.innerHTML = `
    <div class="w-full max-w-md bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-600 rounded-3xl border-4 border-white/40 shadow-2xl p-6 text-center text-white select-none"
         role="dialog" aria-modal="true" aria-label="微复习提醒">
      <div class="mx-auto mb-3 w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">${bell}</div>
      <h2 class="text-xl font-black mb-1">休息一下，快闪复习！</h2>
      <p class="text-sm text-white/90 font-bold mb-4">已连续学习约 ${escapeText(kind)}，温习几个字记得更牢哦</p>
      <div class="bg-white/15 rounded-2xl border-2 border-white/30 px-4 py-3 mb-5">
        <div class="text-xs font-black text-white/80 mb-1">今日抽查</div>
        <div class="text-2xl font-black tracking-widest">${escapeText(charLabel)}</div>
      </div>
      <div class="flex flex-col gap-2.5">
        <button type="button" data-mr-go class="w-full py-3 rounded-2xl bg-amber-300 text-indigo-950 font-black border-2 border-white shadow-lg active:scale-95 transition-transform">
          去复习中心
        </button>
        <div class="flex gap-2">
          <button type="button" data-mr-snooze class="flex-1 py-2.5 rounded-2xl bg-white/20 font-black border border-white/40 active:scale-95">
            5 分钟后再说
          </button>
          <button type="button" data-mr-skip class="flex-1 py-2.5 rounded-2xl bg-white/10 font-black border border-white/30 active:scale-95">
            跳过
          </button>
        </div>
      </div>
    </div>
  `;

  const close = () => {
    _open = false;
    try {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      else overlay.remove();
    } catch {
      try { overlay.remove(); } catch {}
    }
  };

  overlay.querySelector("[data-mr-go]")?.addEventListener("click", () => {
    try { triggerMicroReview(charIds); } catch {}
    close();
    try { eventBus.emit("app:switch-mode", { mode: "review" }); } catch {}
  });
  overlay.querySelector("[data-mr-snooze]")?.addEventListener("click", () => {
    try { snoozeMicroReview(); } catch {}
    close();
  });
  overlay.querySelector("[data-mr-skip]")?.addEventListener("click", () => {
    try { dismissMicroReview(); } catch {}
    close();
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      try { snoozeMicroReview(); } catch {}
      close();
    }
  });

  document.body.appendChild(overlay);
}

/** 绑定全局 TRIGGER 监听（幂等） */
export function bindMicroReviewUI() {
  if (_bound || typeof window === "undefined") return () => {};
  _bound = true;
  const off = eventBus.on(MICRO_EVENTS.TRIGGER, (payload) => {
    try { showMicroReviewPrompt(payload || {}); } catch (err) {
      console.warn("[microReviewUI]", err);
    }
  });
  return () => {
    _bound = false;
    off?.();
  };
}

export function _resetMicroReviewUIForTests() {
  _bound = false;
  _open = false;
  document.getElementById("micro-review-overlay")?.remove();
}

export function isMicroReviewOpen() {
  return _open;
}
