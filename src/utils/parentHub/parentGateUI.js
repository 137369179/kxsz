/** ParentModule — arithmetic parent gate UI */
import { soundAndFX } from "../soundEngine.js";
import { showGameToast } from "../../components/SharedShell.js";
import { GAME_ICONS } from "../gameIcons.js";

export function getChineseNumber(n) {
  const map = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  return map[n] || n;
}

export function renderParentGate() {
  // 每次进入门禁出新题 + 检查冷却锁
  this._newQuestion();
  const now = Date.now();
  const locked = now < this.gateLockUntil;
  const lockRemainSec = Math.max(1, Math.ceil((this.gateLockUntil - now) / 1000));
  const qText = `${getChineseNumber(this.mathNum1)} 乘 ${getChineseNumber(this.mathNum2)} 等于多少？`;

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

          ${locked ? `<div class="w-full bg-rose-50 border-2 border-rose-300 rounded-2xl p-3 mb-4 text-center">
            <span class="text-xs font-black text-rose-600">尝试次数过多，请找爸爸妈妈帮忙，约 ${lockRemainSec} 秒后可再试</span>
          </div>` : ""}

          <input id="gate-answer-input" type="number" placeholder="请输入数字答案" ${locked ? "disabled" : ""} class="w-full text-center text-2xl font-black py-3 px-4 rounded-2xl border-2 border-amber-300 focus:outline-none focus:ring-4 focus:ring-orange-200 mb-4 bg-amber-50/50 text-amber-950 ${locked ? "opacity-50" : ""}" />

          <button id="btn-submit-gate" class="w-full btn-game-orange text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${locked ? "opacity-50 pointer-events-none" : ""}" ${locked ? "disabled" : ""}>
            <span>验证并进入家长中心</span>
          </button>

          <button id="btn-cancel-gate" class="min-touch mt-4 text-xs font-bold text-gray-500 hover:text-amber-800 transition-colors cursor-pointer py-1 px-3">
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
      this.navigateToMap();
    });
  }

  const checkAnswer = () => {
    if (Date.now() < this.gateLockUntil) return; // 冷却中直接忽略
    const val = parseInt(input.value.trim(), 10);
    if (val === this.mathAnswer) {
      soundAndFX.playSuccessSound();
      this.isUnlocked = true;
      this.gateFailCount = 0;
      this.render();
    } else {
      this.gateFailCount++;
      if (this.gateFailCount >= 3) {
        // 连续 3 次错误：冷却 30s（防儿童穷举试错）
        this.gateLockUntil = Date.now() + 30000;
        this.gateFailCount = 0;
        showGameToast(this.container, "尝试次数过多，请找爸爸妈妈帮忙，30 秒后再试！", "error");
        this.renderParentGate();
        return;
      }
      soundAndFX.playSoftError();
      input.classList.add("animate-shake");
      this._timeout(() => input.classList.remove("animate-shake"), 500);
      showGameToast(this.container, `验证错误（还可尝试 ${3 - this.gateFailCount} 次），请计算正确乘积后输入！`, "error");
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
