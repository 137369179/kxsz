/** LearnModule step — extracted from LearnModule.js */
import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";
import { escapeHtml } from "../BaseModule.js";
import { openMorphTheater } from "../morphEngine.js";
import { openEtymologyQuiz } from "../etymologyQuiz.js";
import { buildEtymologyCard } from "../etymologyEngine.js";
import { getCognitiveStageData } from "../cognitiveStage.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { EVENTS } from "../eventBus.js";
import { shouldUseSelfExplain, openSelfExplainPrompt } from "./selfExplainPrompt.js";

export function renderStepRecognize(stage) {
    const char = this.charData;
    const childAge = ebbinghausManager.getAge();
    const cog = getCognitiveStageData(char, childAge);
    soundAndFX.speakPriority(`认一认：“${char.char}”，拼音读作 ${char.pinyin}。点击大字听发音！`, { kind: "sentence", emotion: "gentle" });

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex items-center justify-between p-8 animate-fade-in select-none">
        
        <div class="flex-1 flex flex-col items-center justify-center">
          <div class="text-4xl text-yellow-300 font-black tracking-widest mb-3 bg-black/40 px-6 py-1.5 rounded-full border border-white/20 animate-pulse">
            ${char.pinyin}
          </div>

          <button id="btn-jelly-char" class="relative group w-56 h-56 sm:w-64 sm:h-64 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 border-4 border-white shadow-[0_0_60px_rgba(255,160,0,0.8)] flex items-center justify-center text-9xl sm:text-[10rem] font-black text-white active:scale-90 transition-transform cursor-pointer animate-bounce-cathy">
            ${char.char}
            <div class="absolute -bottom-2 bg-amber-900 text-yellow-200 text-[10px] font-black px-3 py-0.5 rounded-full border border-yellow-400">
              点击发音 ${GAME_ICONS.speaker("w-4 h-4 inline-block")}
            </div>
          </button>

          <div class="flex items-center gap-3 mt-4">
            <span class="bg-white/20 text-white text-xs font-black px-4 py-1.5 rounded-full border border-white/30 flex items-center gap-1.5">
              ${GAME_ICONS.sparkle("w-4 h-4")} <span>共 ${char.strokeCount || 4} 笔</span>
            </span>
            <span class="bg-white/20 text-white text-xs font-black px-4 py-1.5 rounded-full border border-white/30 flex items-center gap-1.5">
              ${GAME_ICONS.gem("w-4 h-4")} <span>偏旁 [${char.radical || char.char}]</span>
            </span>
          </div>

          <div class="flex items-center gap-2.5 mt-4">
            <button id="btn-open-morph-rec" class="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white text-xs font-black px-4 py-2 rounded-full shadow-lg border-2 border-white/40 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
              <span>字源微剧场</span>
            </button>
            <button id="btn-goto-pinyin-island" class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black px-4 py-2 rounded-full shadow-lg border-2 border-white/40 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer" title="前往拼音乐园复习此拼音">
              <span class="flex items-center">${GAME_ICONS.mic("w-4 h-4")}</span>
              <span>拼音岛复习</span>
            </button>
          </div>
        </div>

        <div class="w-88 sm:w-96 flex flex-col justify-between h-full bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/30">
          <div>
            ${cog ? `
            <!-- 分层字义启蒙导引卡 (外部调研建议A / 发展心理学分阶) -->
            <div id="cognitive-stage-card" class="mb-3 p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-300/40 text-left shadow-sm cursor-pointer active:scale-95 transition-all hover:border-amber-300" title="点击听字义启蒙">
              <div class="flex items-center justify-between gap-1 mb-1">
                <span class="text-[11px] font-black text-amber-300 flex items-center gap-1">
                  ${GAME_ICONS.book("w-3.5 h-3.5")}
                  <span>${cog.title}</span>
                </span>
                <span class="text-[9px] font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">${cog.badge}</span>
              </div>
              <p class="text-xs text-yellow-100 font-medium leading-relaxed">${cog.text}</p>
              ${cog.actionPrompt ? `
              <div class="mt-2 pt-2 border-t border-amber-300/30 flex items-start gap-1.5 text-[11px] text-amber-200">
                <span class="shrink-0 mt-0.5">${GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
                <span><strong>身体动一动：</strong>${cog.actionPrompt}</span>
              </div>
              ` : ""}
            </div>
            ` : ""}

            <h3 class="text-sm font-black text-yellow-300 mb-2.5 flex items-center gap-2">
              <span class="flex items-center">${GAME_ICONS.chest("w-5 h-5")}</span>
              <span>生活词语百宝箱：</span>
            </h3>
            
            <div class="flex flex-col gap-2.5">
              ${char.words
                .map(
                  (w) => `
                <button class="word-balloon-btn p-3 bg-gradient-to-r from-amber-50 to-orange-100 hover:from-yellow-200 hover:to-orange-300 rounded-2xl border-2 border-amber-300 text-left flex items-center justify-between shadow-md active:scale-95 transition-all cursor-pointer" data-word="${w.word}">
                  <div>
                    <span class="text-xs font-bold text-amber-700">${w.pinyin}</span>
                    <h4 class="text-base font-black text-amber-950">${w.word}</h4>
                  </div>
                  <span class="flex items-center">${GAME_ICONS.speaker("w-4 h-4")}</span>
                </button>
              `
                )
                .join("")}
            </div>

            <div id="sentence-card" class="mt-4 p-3 bg-black/40 hover:bg-black/60 rounded-2xl border border-white/20 text-xs text-yellow-200 font-semibold leading-relaxed cursor-pointer transition-all active:scale-95" title="点击朗读例句">
              <div class="flex items-center gap-1.5 text-amber-300 font-black mb-1">
                ${GAME_ICONS.pen("w-4 h-4")} <span>趣味造句</span>
              </div>
              <p class="text-white/90 text-xs leading-relaxed">${char.sentence}</p>
            </div>
          </div>

          <button id="btn-finish-rec-step" class="mt-4 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white font-black text-base py-3.5 rounded-full shadow-[0_8px_25px_rgba(245,158,11,0.5)] border-2 border-white active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer hover:brightness-105">
            <span class="flex items-center">${GAME_ICONS.star("w-5 h-5", false)}</span>
            <span>掌握认字！开启跟读评测</span>
          </button>
        </div>

      </div>
    `;

    const jellyBtn = stage.querySelector("#btn-jelly-char");
    if (jellyBtn) {
      this._on(jellyBtn, "click", async () => {
        soundAndFX.playJellyBoing();
        soundAndFX.speakPriority(`${char.char}，${char.pinyin}`, { kind: "char", priority: 1 });
        soundAndFX.triggerConfetti(this.container);
        jellyBtn.classList.remove("animate-bounce-cathy");
        
        // 阶段 1：挤压动画
        jellyBtn.classList.add("scale-x-125", "scale-y-75");
        await this._wait(120);
        
        // 阶段 2：拉伸动画
        jellyBtn.classList.remove("scale-x-125", "scale-y-75");
        jellyBtn.classList.add("scale-x-85", "scale-y-115");
        await this._wait(150);
        
        // 阶段 3：弹跳恢复
        jellyBtn.classList.remove("scale-x-85", "scale-y-115");
        jellyBtn.classList.add("animate-bounce-cathy");
      });
    }

    stage.querySelectorAll(".word-balloon-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        const word = btn.dataset.word;
        soundAndFX.playPop();
        soundAndFX.speakPriority(word, { kind: "word", priority: 1 });
        btn.classList.add("ring-2", "ring-yellow-400");
        this._timeout(() => btn.classList.remove("ring-2", "ring-yellow-400"), 400);
      });
    });

    const cogCard = stage.querySelector("#cognitive-stage-card");
    if (cogCard && cog) {
      this._on(cogCard, "click", () => {
        soundAndFX.playPop();
        const spoken = cog.actionPrompt ? `${cog.text}。凯茜邀请你：${cog.actionPrompt}` : cog.text;
        soundAndFX.speakPriority(spoken, { kind: "sentence", emotion: "gentle" });
        cogCard.classList.add("ring-2", "ring-amber-400", "bg-amber-500/30");
        this._timeout(() => cogCard.classList.remove("ring-2", "ring-amber-400", "bg-amber-500/30"), 600);
      });
    }

    const sentenceCard = stage.querySelector("#sentence-card");
    if (sentenceCard) {
      this._on(sentenceCard, "click", () => {
        soundAndFX.playPop();
        soundAndFX.speakPriority(char.sentence, { kind: "sentence", emotion: "gentle" });
        sentenceCard.classList.add("ring-2", "ring-yellow-400", "bg-black/60");
        this._timeout(() => sentenceCard.classList.remove("ring-2", "ring-yellow-400", "bg-black/60"), 800);
      });
    }

    const morphRecBtn = stage.querySelector("#btn-open-morph-rec");
    if (morphRecBtn) {
      this._on(morphRecBtn, "click", () => {
        soundAndFX.playPop();
        openMorphTheater(char, document.body, {
          onClose: () => {
            if (shouldUseSelfExplain(ebbinghausManager.getAge()) && !this._selfExplainDone) {
              this._selfExplainDone = true;
              openSelfExplainPrompt(char, () => {});
            }
          },
        });
      });
    }

    const pinyinIslandBtn = stage.querySelector("#btn-goto-pinyin-island");
    if (pinyinIslandBtn) {
      this._on(pinyinIslandBtn, "click", () => {
        soundAndFX.playPop();
        soundAndFX.speakPriority(`去拼音乐园复习拼音“${char.pinyin}”吧！`, { kind: "sentence", emotion: "gentle" });
        this._busEmit(EVENTS.SWITCH_MODE, { mode: "pinyin", highlightPinyin: char.pinyin });
      });
    }

    const finishBtn = stage.querySelector("#btn-finish-rec-step");
    if (finishBtn) {
      this._on(finishBtn, "click", () => {
        soundAndFX.playPop();
        const goNext = () => {
          this.currentStep = 3;
          this.render();
        };
        const age = ebbinghausManager.getAge();
        if (shouldUseSelfExplain(age)) {
          if (this._selfExplainDone) return goNext();
          this._selfExplainDone = true;
          openSelfExplainPrompt(char, goNext);
          return;
        }
        // ≤4：保留有对错的字理问答一次
        if (!this._etymologyQuizAnswered) {
          this._etymologyQuizAnswered = true;
          openEtymologyQuiz(char, goNext);
          return;
        }
        goNext();
      });
    }
  }

  // ----------------------------------------------------------------
  // STEP 3: 读 (智能语音评测 - 洪恩识字 1:1 沉浸式录音与回放系统)
