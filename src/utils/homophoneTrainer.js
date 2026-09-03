/**
 * src/utils/homophoneTrainer.js
 * ================================================================
 * 《凯茜识字》同音字/近音字辨析专项训练引擎 (T17 / P3-1)
 * ─────────────────────────────────────────────────────────────
 * 遵循儿童认知发展契约：汉字同音字极多，低龄儿童最易产生音义混淆。
 * 通过「意符线索 (部首偏旁) + 情境语境」深度辨析同音字（如：目/木，蓝/篮，在/再）。
 * 严守工程红线：绝对零 Unicode Emoji，零 SVG。
 */

import { soundAndFX } from "./soundEngine.js";
import { GAME_ICONS } from "./gameIcons.js";
import { mascotProgress } from "./mascotProgress.js";

/**
 * 启蒙常用同音字精品辨析知识库（意符线索与区别口诀）
 */
export const HOMOPHONE_PAIRS = [
  {
    pinyin: "mù",
    chars: ["目", "木"],
    clues: {
      "目": { radical: "目", meaning: "眼睛", hint: "目字旁代表眼睛，目光看世界", sentence: "闭上双[目]，静静听音乐。" },
      "木": { radical: "木", meaning: "树木", hint: "木字旁代表树木，小树向下扎根", sentence: "大森林里长满了高大的[木]头树林。" }
    }
  },
  {
    pinyin: "shí",
    chars: ["石", "十"],
    clues: {
      "石": { radical: "石", meaning: "石头", hint: "悬崖滚落硬邦邦的石头", sentence: "河边有好多光滑的小[石]头。" },
      "十": { radical: "十", meaning: "数字十", hint: "一横一竖十字架，代表双手合十", sentence: "我有[十]个手指头。" }
    }
  },
  {
    pinyin: "lán",
    chars: ["蓝", "篮"],
    clues: {
      "蓝": { radical: "艹", meaning: "颜色", hint: "草字头代表植物蓼蓝，染出蓝天蓝", sentence: "今天的天空湛[蓝]晴朗。" },
      "篮": { radical: "竹", meaning: "容器", hint: "竹字头代表竹编篮子、篮球", sentence: "操场上大哥哥们在打[篮]球。" }
    }
  },
  {
    pinyin: "zài",
    chars: ["在", "再"],
    clues: {
      "在": { radical: "土", meaning: "存在/地点", hint: "土字底，人在地面土地上", sentence: "小猫咪正[在]草地上玩耍。" },
      "再": { radical: "冂", meaning: "再次/第二次", hint: "表示第二次、又一次", sentence: "放学了，我们挥手说[再]见。" }
    }
  },
  {
    pinyin: "yuán",
    chars: ["圆", "园"],
    clues: {
      "圆": { radical: "囗", meaning: "圆形", hint: "大口框里有员，圆圆滚滚", sentence: "中秋节的月亮又大又[圆]。" },
      "园": { radical: "囗", meaning: "地方/场所", hint: "大口框里有元，公园、乐园", sentence: "星期天爸爸带我去动物[园]玩。" }
    }
  },
  {
    pinyin: "shēng",
    chars: ["生", "升"],
    clues: {
      "生": { radical: "生", meaning: "生长", hint: "小嫩苗破土生长、生日", sentence: "小树苗破土而[生]。" },
      "升": { radical: "十", meaning: "上升", hint: "太阳冉冉升起、升高", sentence: "清晨红日冉冉[升]起。" }
    }
  }
];

/**
 * 为指定汉字查找或生成同音字辨析测试题
 * @param {object|string} charInput 目标汉字对象或字符
 * @param {Array} [allChars] 全量字库
 * @returns {object|null}
 */
export function buildHomophoneExercise(charInput, allChars = []) {
  const targetChar = typeof charInput === "string" ? charInput : charInput?.char;
  if (!targetChar) return null;

  // 1. 优先在人工精编库查找
  const curated = HOMOPHONE_PAIRS.find(p => p.chars.includes(targetChar));
  if (curated) {
    const otherChar = curated.chars.find(c => c !== targetChar) || curated.chars[0];
    const targetClue = curated.clues[targetChar];
    const otherClue = curated.clues[otherChar];

    // 随机选一题作为挖空测试
    const isTargetQuestion = Math.random() > 0.5;
    const activeChar = isTargetQuestion ? targetChar : otherChar;
    const clue = isTargetQuestion ? targetClue : otherClue;

    return {
      pinyin: curated.pinyin,
      targetChar,
      otherChar,
      questionSentence: clue.sentence.replace(`[${activeChar}]`, "【 ？ 】"),
      correctChar: activeChar,
      options: [targetChar, otherChar].sort(() => Math.random() - 0.5),
      clues: curated.clues,
      explanation: `${activeChar}：${clue.hint}；${activeChar === targetChar ? otherChar : targetChar}：${(activeChar === targetChar ? otherClue : targetClue).hint}`
    };
  }

  // 2. 动态在 allChars 中寻找同音字
  const pinyin = typeof charInput === "object" ? charInput.pinyin : "";
  if (pinyin && Array.isArray(allChars)) {
    const matches = allChars.filter(c => c.char !== targetChar && c.pinyin === pinyin);
    if (matches.length > 0) {
      const match = matches[0];
      const sentence = (typeof charInput === "object" && charInput.sentence) ? charInput.sentence : `这个字读作${pinyin}`;
      return {
        pinyin,
        targetChar,
        otherChar: match.char,
        questionSentence: sentence.includes(targetChar) ? sentence.replace(targetChar, "【 ？ 】") : `请选出正确汉字：【 ？ 】 (${pinyin})`,
        correctChar: targetChar,
        options: [targetChar, match.char].sort(() => Math.random() - 0.5),
        clues: {},
        explanation: `“${targetChar}”与“${match.char}”发音相同 (${pinyin})，但字形和含义不同哦！`
      };
    }
  }

  return null;
}

/**
 * 弹出同音字辨析微训练模态框
 * @param {object} charData
 * @param {Array} allChars
 * @param {Function} [onClose]
 */
export function openHomophoneTrainerModal(charData, allChars = [], onClose) {
  const exercise = buildHomophoneExercise(charData, allChars);
  if (!exercise) {
    if (typeof onClose === "function") onClose();
    return;
  }

  const modal = document.createElement("div");
  modal.id = "homophone-trainer-modal";
  modal.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in";

  modal.innerHTML = `
    <div class="relative w-full max-w-xl bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
      
      <button id="btn-close-homophone" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-transform active:scale-90" title="关闭">
        ${GAME_ICONS.back("w-4 h-4")}
      </button>

      <div class="mb-2">
        <span class="text-xs font-black bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 px-4 py-1 rounded-full border border-white shadow">
          同音字火眼金睛特训
        </span>
      </div>

      <div class="text-xs text-cyan-200 font-bold mb-3 flex items-center gap-1.5">
        <span>读音相同</span>
        <span class="text-lg text-yellow-300 font-black px-2 py-0.5 bg-black/40 rounded-lg border border-cyan-400/40">${exercise.pinyin}</span>
        <span>，字形字义大不同！</span>
      </div>

      <div class="w-full bg-white/10 rounded-2xl p-4 border border-white/20 mb-6">
        <p class="text-white text-base sm:text-lg font-bold leading-relaxed">
          ${exercise.questionSentence}
        </p>
      </div>

      <div class="w-full grid grid-cols-2 gap-4 mb-4">
        ${exercise.options
          .map(
            (c) => `
          <button class="btn-homophone-opt w-full py-5 bg-gradient-to-b from-white/15 to-white/5 hover:from-amber-500/30 hover:to-orange-500/30 active:scale-95 rounded-2xl border-2 border-white/30 hover:border-amber-400 text-5xl font-serif font-black text-white shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-2" data-char="${c}">
            <span>${c}</span>
            <span class="text-[11px] font-sans text-cyan-200 font-normal">点击选择</span>
          </button>
        `
          )
          .join("")}
      </div>

      <div id="homophone-feedback" class="hidden w-full p-4 rounded-2xl text-xs font-bold leading-relaxed mb-3"></div>

      <p class="text-xs text-indigo-300">观察部首偏旁，想一想它们代表什么生活事物！</p>
    </div>
  `;

  document.body.appendChild(modal);
  soundAndFX.playPop();
  soundAndFX.speakPriority(`同音字大辨析！请仔细听：哪个字填入句子里最合适？`, { kind: "sentence", emotion: "gentle" });

  let isLocked = false;

  const close = () => {
    modal.remove();
    if (typeof onClose === "function") onClose();
  };

  const closeBtn = modal.querySelector("#btn-close-homophone");
  if (closeBtn) closeBtn.addEventListener("click", close);

  modal.querySelectorAll(".btn-homophone-opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (isLocked) return;
      isLocked = true;

      const chosen = btn.dataset.char;
      const isCorrect = chosen === exercise.correctChar;
      const fb = modal.querySelector("#homophone-feedback");

      if (isCorrect) {
        btn.classList.add("ring-4", "ring-emerald-400", "bg-emerald-600/80", "border-emerald-300");
        soundAndFX.playVictoryFanfare();
        soundAndFX.triggerConfetti(modal);
        mascotProgress.onCorrectPronunciation();

        if (fb) {
          fb.className = "w-full p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-400 text-emerald-200 text-xs font-bold block animate-fade-in";
          fb.innerHTML = `<div>答对啦！太聪明了！</div><div class="mt-1 font-normal">${exercise.explanation}</div>`;
        }
        soundAndFX.speakPriority(`答对啦！选“${chosen}”字完全正确！`, { kind: "sentence", emotion: "excited" });

        setTimeout(() => close(), 2200);
      } else {
        btn.classList.add("ring-4", "ring-rose-400", "bg-rose-900/80", "border-rose-400", "animate-shake");
        soundAndFX.playSoftError();

        if (fb) {
          fb.className = "w-full p-3.5 rounded-2xl bg-rose-950/80 border border-rose-400 text-rose-200 text-xs font-bold block animate-fade-in";
          fb.innerHTML = `<div>选错了哦！</div><div class="mt-1 font-normal">${exercise.explanation}</div>`;
        }
        soundAndFX.speakPriority(`不对哦，再想一想偏旁意符吧！`, { kind: "sentence", emotion: "gentle" });

        setTimeout(() => {
          isLocked = false;
          btn.classList.remove("animate-shake");
        }, 1200);
      }
    });
  });
}
