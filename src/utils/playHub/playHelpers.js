/**
 * PlayModule 共享纯函数 / DOM 小工具
 */
import { CHARACTER_DATABASE } from "../../data/characters.js";
import { ebbinghausManager } from "../ebbinghaus.js";

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ------------------------------------------------------------
// 动态取题工具：优先艾宾浩斯待复习/难字，不足则从字库随机，
// 并按字库的 confusingChars 自动生成干扰选项（游乐场均由此出题）
// ------------------------------------------------------------
export function pickReviewChars(count = 4) {
  // 1) 待复习队列（到期 + 难字）优先
  const dueIds = ebbinghausManager.getDueReviewCharIds();
  const due = dueIds.map((id) => CHARACTER_DATABASE.find((c) => c.id === id)).filter(Boolean);
  // 2) 难度加权补充（低掌握度者优先）
  const rest = CHARACTER_DATABASE.filter((c) => !dueIds.includes(c.id));
  rest.sort((a, b) => {
    const ra = ebbinghausManager.progress.charRecords?.[a.id];
    const rb = ebbinghausManager.progress.charRecords?.[b.id];
    const sa = ra?.masteryRate ?? 100;
    const sb = rb?.masteryRate ?? 100;
    return sa - sb; // 掌握度低者排在前面
  });
  const pool = [...due, ...rest];
  // 去重且不超量
  const taken = [];
  const seen = new Set();
  for (let i = 0; i < pool.length && taken.length < count; i++) {
    if (seen.has(pool[i].id)) continue;
    seen.add(pool[i].id);
    taken.push(pool[i]);
  }
  // 字库不足时允许循环补足（实际 50 字 >> count）
  return taken;
}

/** 生成一道题的选项：正确字 + 其 confusingChars（不足随机补字库其他字） */
export function buildOptions(curChar) {
  const distractors = (curChar.confusingChars || []).filter((c) => c !== curChar.char);
  const pool = [...CHARACTER_DATABASE.filter((c) => c.char !== curChar.char)];
  for (let i = 0; distractors.length < 3 && i < pool.length; i++) {
    if (!distractors.includes(pool[i].char)) distractors.push(pool[i].char);
  }
  return shuffle([curChar.char, ...distractors.slice(0, 3)]);
}

/** 从字库生成「字 + 拼音」配对卡（消消乐用） */
export function buildMatchPairs(count = 4) {
  const chars = pickReviewChars(count);
  return chars.map((c) => ({ char: c.char, pinyin: c.pinyin || "" }));
}

/**
 * 对「已在 charRecords 中」的汉字写回复习结果。
 * 跳过从未学过的字，避免成语/古诗把进度灌进未接触字。
 */
export function writeKnownCharsReview(chars, success) {
  const records = ebbinghausManager.progress?.charRecords || {};
  const seen = new Set();
  for (const ch of chars || []) {
    if (!ch || seen.has(ch)) continue;
    seen.add(ch);
    const rec = CHARACTER_DATABASE.find((c) => c.char === ch);
    if (!rec || !records[rec.id]) continue;
    try {
      ebbinghausManager.completeReview(rec.id, !!success);
    } catch {}
  }
}

/** 在容器内生成「飘字」反馈（+伤害 / 连击 / 提示） */
export function spawnFloatingText(container, text, cls = "", opts = {}) {
  if (typeof document === "undefined" || !container) return null;
  const el = document.createElement("div");
  el.className = `fx-float ${cls}`;
  el.textContent = text;
  el.style.left = (opts.left ?? "50%") + "%";
  el.style.top = (opts.top ?? "38") + "%";
  el.style.transform = "translateX(-50%)";
  el.style.fontSize = (opts.size ?? 34) + "px";
  el.style.color = opts.color || "#fbbf24";
  container.appendChild(el);
  setTimeout(() => { try { el.remove(); } catch {} }, 1200);
  return el;
}

/** 生成有限时间倒计时（返回 stop 函数）。onTick 每秒, onTimeout 结束后 */
export function startCountdown(seconds, onTick, onTimeout) {
  let remain = seconds;
  const timer = setInterval(() => {
    remain -= 1;
    if (onTick) onTick(remain);
    if (remain <= 0) {
      clearInterval(timer);
      if (onTimeout) onTimeout();
    }
  }, 1000);
  return () => clearInterval(timer);
}
