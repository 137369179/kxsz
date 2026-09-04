/**
 * P0-2 家长门禁弹窗 + 算术题系统（替换 window.prompt/alert/confirm）
 *
 * 设计原则：
 *   - 项目内风格的 Modal（糖果渐变 + 圆润圆角 + 主题一致）
 *   - 替换所有 window.prompt / window.alert / window.confirm
 *   - 门禁难度分级：乘法 + 混合运算，答案不可穷举
 *   - 支持 ESC/backdrop 关闭，被取消时返回 false
 *   - UI 零 Unicode Emoji（用文字/符号）
 */

import { GAME_ICONS } from "./gameIcons.js";

/**
 * 生成一道家长算术题（乘法/混合，难度不可穷举）
 * @param {"easy"|"medium"|"hard"} level
 * @returns {{ question: string, answer: number, a: number, b: number, c?: number }}
 */
export function generateParentChallenge(level = "medium") {
  let a, b, c, op;
  switch (level) {
    case "easy":
      a = Math.floor(Math.random() * 9) + 2;   // 2-10
      b = Math.floor(Math.random() * 9) + 2;   // 2-10
      return { question: `${a} × ${b} = ?`, answer: a * b, a, b };
    case "hard":
      a = Math.floor(Math.random() * 8) + 3;   // 3-10
      b = Math.floor(Math.random() * 8) + 3;   // 3-10
      c = Math.floor(Math.random() * 9) + 1;   // 1-9
      op = Math.random() > 0.5 ? "+" : "-";
      const ans = op === "+" ? (a * b + c) : (a * b - c);
      return { question: `${a} × ${b} ${op} ${c} = ?`, answer: ans, a, b, c };
    case "medium":
    default:
      a = Math.floor(Math.random() * 10) + 3;  // 3-12
      b = Math.floor(Math.random() * 10) + 3;  // 3-12
      return { question: `${a} × ${b} = ?`, answer: a * b, a, b };
  }
}

function escapeAttr(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * 项目内家长验证 Modal（替换 window.prompt）
 * @param {object} opts
 * @param {string} [opts.title]
 * @param {"easy"|"medium"|"hard"} [opts.level="medium"]
 * @param {string} [opts.confirmText="验证"]
 * @param {string} [opts.cancelText="取消"]
 * @param {number} [opts.maxAttempts=3]
 * @returns {Promise<boolean>}
 */
export function showParentGate(opts = {}) {
  return new Promise((resolve) => {
    if (typeof document === "undefined") { resolve(false); return; }

    const challenge = generateParentChallenge(opts.level || "medium");
    const title = opts.title || "家长验证";
    const confirmText = opts.confirmText || "验证";
    const cancelText = opts.cancelText || "取消";
    let attemptsLeft = typeof opts.maxAttempts === "number" ? opts.maxAttempts : 3;

    const shield = (typeof GAME_ICONS?.shieldLock === "function")
      ? GAME_ICONS.shieldLock("w-10 h-10")
      : `<span class="text-white font-black text-2xl">LOCK</span>`;

    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm parent-gate-overlay";
    overlay.innerHTML = `
      <div class="relative mx-4 w-full max-w-sm bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 rounded-3xl border-4 border-white/30 shadow-[0_20px_60px_rgba(79,70,229,0.5)] p-6 select-none parent-gate-modal"
           role="dialog" aria-modal="true" aria-label="${escapeAttr(title)}">
        <div class="text-center">
          <div class="mx-auto mb-2 w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">${shield}</div>
          <div class="text-white font-black text-lg mb-1">${escapeAttr(title)}</div>
          <div class="text-white/70 text-xs mb-4">需要家长完成下面这道算术题才能继续</div>
        </div>
        <div class="bg-black/30 rounded-2xl p-4 mb-4 border-2 border-white/20">
          <div class="text-center font-black text-white text-2xl sm:text-3xl tracking-wider" data-pg-question>${escapeAttr(challenge.question)}</div>
        </div>
        <input type="number" inputmode="numeric" min="-999" max="9999"
               class="w-full px-4 py-3 rounded-2xl text-center text-2xl font-black bg-white/95 text-indigo-900 border-4 border-white focus:border-yellow-300 focus:outline-none placeholder:text-indigo-300"
               data-pg-input placeholder="请输入答案" autofocus />
        <div class="text-center text-white/60 text-xs mt-2" data-pg-hint>剩余尝试次数：${attemptsLeft}</div>
        <div class="flex gap-3 mt-4">
          <button type="button" data-pg-cancel class="flex-1 py-3 rounded-2xl bg-white/20 text-white font-black border-2 border-white/30 hover:bg-white/30 active:scale-95 transition-all">
            ${escapeAttr(cancelText)}
          </button>
          <button type="button" data-pg-ok class="flex-[1.5] py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black border-2 border-white shadow-lg hover:from-amber-300 hover:to-orange-400 active:scale-95 transition-all">
            ${escapeAttr(confirmText)}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const input = overlay.querySelector("[data-pg-input]");
    const hint = overlay.querySelector("[data-pg-hint]");

    const cleanup = (result) => {
      document.removeEventListener("keydown", onKey);
      overlay.removeEventListener("click", onBgClick);
      overlay.remove();
      resolve(result);
    };

    const onBgClick = (e) => { if (e.target === overlay) cleanup(false); };
    const onKey = (e) => {
      if (e.key === "Escape") cleanup(false);
      if (e.key === "Enter") trySubmit();
    };

    const trySubmit = () => {
      const val = parseInt(String(input.value).trim(), 10);
      if (Number.isNaN(val)) return;
      if (val === challenge.answer) {
        const modal = overlay.querySelector(".parent-gate-modal");
        if (modal && typeof modal.animate === "function") {
          modal.animate(
            [{ transform: "scale(1)", boxShadow: "0 0 20px rgba(74,222,128,0.8)" }],
            { duration: 200, fill: "forwards" }
          );
        }
        setTimeout(() => cleanup(true), 250);
      } else {
        attemptsLeft--;
        if (attemptsLeft <= 0) {
          cleanup(false);
          return;
        }
        input.value = "";
        hint.textContent = `答案不正确，剩余 ${attemptsLeft} 次机会`;
        hint.className = "text-center text-rose-300 text-xs mt-2 font-black";
        input.focus();
      }
    };

    overlay.addEventListener("click", onBgClick);
    overlay.querySelector("[data-pg-cancel]").addEventListener("click", () => cleanup(false));
    overlay.querySelector("[data-pg-ok]").addEventListener("click", trySubmit);
    document.addEventListener("keydown", onKey);
    input.focus();
  });
}

/**
 * 项目内确认 Modal（替换 window.confirm）
 * @returns {Promise<boolean>}
 */
export function showConfirm(opts = {}) {
  return new Promise((resolve) => {
    if (typeof document === "undefined") { resolve(false); return; }

    const isDanger = opts.variant === "danger";
    const gradient = isDanger
      ? "from-rose-600 via-red-600 to-orange-600"
      : "from-indigo-600 via-purple-600 to-violet-700";
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-[99998] flex items-center justify-center bg-black/50 backdrop-blur-sm parent-confirm-overlay";
    overlay.innerHTML = `
      <div class="relative mx-4 w-full max-w-sm bg-gradient-to-br ${gradient} rounded-3xl border-4 border-white/30 shadow-2xl p-6 select-none parent-confirm-modal" role="dialog" aria-modal="true">
        <div class="text-center">
          <div class="text-white/90 text-xs font-black tracking-widest mb-2">${isDanger ? "注意" : "提示"}</div>
          <div class="text-white font-black text-base mb-1">${escapeAttr(opts.title || "提示")}</div>
          <div class="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">${escapeAttr(opts.message || "")}</div>
        </div>
        <div class="flex gap-3 mt-5">
          <button type="button" data-pc-cancel class="flex-1 py-3 rounded-2xl bg-white/20 text-white font-black border-2 border-white/30 hover:bg-white/30 active:scale-95 transition-all">
            ${escapeAttr(opts.cancelText || "取消")}
          </button>
          <button type="button" data-pc-ok class="flex-[1.5] py-3 rounded-2xl ${isDanger ? "bg-yellow-400 text-red-900" : "bg-amber-400 text-indigo-900"} font-black border-2 border-white shadow-lg hover:brightness-110 active:scale-95 transition-all">
            ${escapeAttr(opts.okText || "确定")}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const cleanup = (r) => {
      document.removeEventListener("keydown", onKey);
      overlay.removeEventListener("click", onBg);
      overlay.remove();
      resolve(r);
    };
    const onBg = (e) => { if (e.target === overlay) cleanup(false); };
    const onKey = (e) => { if (e.key === "Escape") cleanup(false); };

    overlay.addEventListener("click", onBg);
    overlay.querySelector("[data-pc-cancel]").addEventListener("click", () => cleanup(false));
    overlay.querySelector("[data-pc-ok]").addEventListener("click", () => cleanup(true));
    document.addEventListener("keydown", onKey);
  });
}

/**
 * 轻量 toast（替换 window.alert 的提示场景）
 */
export function showToast(message, opts = {}) {
  if (typeof document === "undefined") return;
  const variant = opts.variant || "info";
  const duration = opts.duration || 2200;
  const colors = {
    info:  "from-sky-500 to-blue-600",
    warn:  "from-amber-500 to-orange-600",
    error: "from-rose-500 to-red-600"
  };
  const toast = document.createElement("div");
  toast.className = `fixed top-6 left-1/2 -translate-x-1/2 z-[99997] px-5 py-3 rounded-2xl bg-gradient-to-r ${colors[variant] || colors.info} text-white font-black text-sm shadow-xl border-2 border-white/30 pointer-events-none`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 200ms";
    setTimeout(() => toast.remove(), 220);
  }, duration);
}
