/**
 * src/utils/etymologyQuiz.js
 * ================================================================
 * 《凯茜识字》字理问答微交互系统 (T15 / P2-3)
 * ─────────────────────────────────────────────────────────────
 * 在认知环节启发儿童思考字形构件与生活实际的关系。
 * "猜猜看，这个字的哪一部分表示它的核心含义？"
 * 遵循工程红线：绝对零 Unicode Emoji，零 SVG。
 */

import { soundAndFX } from "./soundEngine.js";
import { GAME_ICONS } from "./gameIcons.js";
import { mascotProgress } from "./mascotProgress.js";

/**
 * 根据汉字数据生成字理启蒙问答题
 * @param {object} charData
 * @returns {{ question: string, options: Array<{ text: string, correct: boolean, explanation: string }> }}
 */
export function generateEtymologyQuestion(charData) {
  if (!charData) {
    return {
      question: "汉字是由古代的图画演变而来的吗？",
      options: [
        { text: "是的，古人看图造字", correct: true, explanation: "太棒了！古人观察天地日月创造了汉字！" },
        { text: "不是，是机器打印的", correct: false, explanation: "不对哦，古人在几千年前就创造了甲骨文。" }
      ]
    };
  }

  const c = charData;
  const radical = c.radical || c.char;
  const radicalHint = c.meanings?.radicalHint || `${radical}字旁`;
  const oracleDesc = c.evolution?.oracleDesc || "";
  const mnemonic = c.meanings?.mnemonic || "";

  // 题型 1：象形源流（甲骨文像什么？）
  if (oracleDesc && oracleDesc.length > 2) {
    return {
      question: `在几千年前的甲骨文中，“${c.char}”字最早画的是什么？`,
      options: [
        {
          text: oracleDesc,
          correct: true,
          explanation: `答对啦！${oracleDesc}，后来慢慢变成了“${c.char}”字。`
        },
        {
          text: "一辆飞驰的小汽车",
          correct: false,
          explanation: "古代还没有小汽车哦，再想一想大自然中的景象！"
        },
        {
          text: "一块现代电子手表",
          correct: false,
          explanation: "古时候没有电子表哦，古人是看大自然造字的。"
        }
      ].sort(() => Math.random() - 0.5)
    };
  }

  // 题型 2：偏旁部首意符认知
  return {
    question: `仔细观察“${c.char}”字，你觉得它的部首偏旁【${radical}】通常和什么有关？`,
    options: [
      {
        text: radicalHint,
        correct: true,
        explanation: `太厉害了！【${radical}】正代表着${radicalHint}。`
      },
      {
        text: "冰冷坚硬的大钢铁",
        correct: false,
        explanation: `不对哦，【${radical}】通常和自然、生活有密切联系。`
      },
      {
        text: "吵闹的施工大喇叭",
        correct: false,
        explanation: "不对哦，再仔细观察这个字的部首吧！"
      }
    ].sort(() => Math.random() - 0.5)
  };
}

/**
 * 弹出字理问答微交互弹窗
 * @param {object} charData
 * @param {Function} [onClose]
 */
export function openEtymologyQuiz(charData, onClose) {
  if (!charData) return;

  const quiz = generateEtymologyQuestion(charData);
  const modal = document.createElement("div");
  modal.id = "etymology-quiz-modal";
  modal.className = "fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in";

  modal.innerHTML = `
    <div class="relative w-full max-w-lg bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
      
      <div class="mb-3 flex items-center justify-center">
        <span class="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-300 flex items-center justify-center text-amber-300 animate-bounce-slow">
          ${GAME_ICONS.sparkle("w-8 h-8")}
        </span>
      </div>

      <span class="text-xs font-black bg-amber-400 text-amber-950 px-4 py-1 rounded-full border border-white shadow-sm mb-2">
        凯茜字理微问答
      </span>

      <h3 class="text-lg sm:text-xl font-black text-yellow-300 mb-6 leading-relaxed px-2">
        ${quiz.question}
      </h3>

      <div id="quiz-options-container" class="w-full flex flex-col gap-3">
        ${quiz.options
          .map(
            (opt, idx) => `
          <button class="quiz-opt-btn w-full p-4 bg-white/10 hover:bg-white/20 active:scale-98 rounded-2xl border-2 border-white/20 text-white font-bold text-sm sm:text-base flex items-center justify-between transition-all cursor-pointer shadow-md" data-correct="${opt.correct}" data-exp="${encodeURIComponent(opt.explanation)}">
            <span class="text-left flex-1">${opt.text}</span>
            <span class="opt-mark text-xs px-2 py-0.5 rounded-full bg-black/30 border border-white/20 ml-2">选择</span>
          </button>
        `
          )
          .join("")}
      </div>

      <div id="quiz-feedback-box" class="hidden mt-4 w-full p-4 rounded-2xl text-xs font-bold leading-relaxed transition-all"></div>

      <button id="btn-quiz-skip" class="mt-5 text-xs text-indigo-300 hover:text-white underline cursor-pointer">
        跳过此题，继续学字
      </button>
    </div>
  `;

  document.body.appendChild(modal);
  soundAndFX.speakPriority(quiz.question, { kind: "sentence", emotion: "gentle" });

  let isLocked = false;

  const close = () => {
    soundAndFX.stopSpeaking();
    modal.remove();
    if (typeof onClose === "function") onClose();
  };

  const skipBtn = modal.querySelector("#btn-quiz-skip");
  if (skipBtn) skipBtn.addEventListener("click", close);

  modal.querySelectorAll(".quiz-opt-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (isLocked) return;
      isLocked = true;

      const isCorrect = btn.dataset.correct === "true";
      const exp = decodeURIComponent(btn.dataset.exp || "");
      const feedbackBox = modal.querySelector("#quiz-feedback-box");

      if (isCorrect) {
        btn.classList.remove("bg-white/10", "border-white/20");
        btn.classList.add("bg-emerald-600/80", "border-emerald-300", "ring-4", "ring-emerald-400");
        soundAndFX.playVictoryFanfare();
        soundAndFX.triggerConfetti(modal);
        setTimeout(() => {
          soundAndFX.speakPriority(`答对啦！${exp}`, { kind: "sentence", emotion: "excited" });
        }, 250);
        mascotProgress.onCorrectPronunciation();

        if (feedbackBox) {
          feedbackBox.className = "mt-4 w-full p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-400 text-emerald-200 text-xs font-bold block animate-fade-in";
          feedbackBox.textContent = exp;
        }

        setTimeout(() => close(), 2200);
      } else {
        btn.classList.remove("bg-white/10", "border-white/20");
        btn.classList.add("bg-rose-900/80", "border-rose-400", "animate-shake");
        soundAndFX.playSoftError();
        setTimeout(() => {
          soundAndFX.speakPriority(`不对哦。${exp}`, { kind: "sentence", emotion: "gentle" });
        }, 180);

        if (feedbackBox) {
          feedbackBox.className = "mt-4 w-full p-3.5 rounded-2xl bg-rose-950/80 border border-rose-400 text-rose-200 text-xs font-bold block animate-fade-in";
          feedbackBox.textContent = exp;
        }

        // 允许儿童再选一次
        setTimeout(() => {
          isLocked = false;
          btn.classList.remove("animate-shake");
        }, 1200);
      }
    });
  });
}
