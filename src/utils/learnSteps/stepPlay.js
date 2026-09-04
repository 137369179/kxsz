/** LearnModule step — extracted from LearnModule.js */
import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";
import { createPlayGame } from "../playGames/index.js";
import { openMorphTheater } from "../morphEngine.js";
import { chantChar, CHANT_MODES } from "../chantEngine.js";
import { forChar as mmForChar, SCENES as MM_SCENES } from "../multimodalEngine.js";
import { buildEtymologyCard } from "../etymologyEngine.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { shouldUseSelfExplain, openSelfExplainPrompt } from "./selfExplainPrompt.js";

export function renderStepPlay(stage) {
    const char = this.charData;
    if (this.activePlayGame) {
      this.activePlayGame.destroy();
      this.activePlayGame = null;
    }

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-sky-400 via-amber-200 to-orange-300 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col items-center justify-between p-4 animate-fade-in text-center select-none">
        
        <div id="play-interactive-stage" class="relative z-10 w-full flex-1 flex flex-col items-center justify-center"></div>

                ${(() => {
            const _etym = buildEtymologyCard(char);
            // E19: 多模态编排器 — 动态决定 reveal-box 显示哪些块
            const _mm = mmForChar(char, MM_SCENES.LEARN);
            const _showTimeline = !!_mm.modalities.visual_timeline;
            const _showChant = !!_mm.modalities.auditory_chant;
            const _showConfuse = !!_mm.modalities.semantic_confuse && _etym.confusing.hasConfusables;
            const _showEmoji = !!_mm.modalities.visual_emoji;
            return `
        <div id="evolution-reveal-box" class="absolute inset-0 bg-black/88 backdrop-blur-md rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center text-white hidden animate-scale-up z-30 overflow-auto">
          <span class="bg-orange-500 text-white font-black text-xs px-4 py-1 rounded-full mb-2 shadow flex-shrink-0">字源 4 阶段演变！</span>

          <!-- E19: 4 阶段 timeline — 由 multimodalEngine 编排 -->
          ${_showTimeline ? `
          <div class="flex items-center gap-2 sm:gap-3 my-2 flex-wrap justify-center">
            ${_etym.stages.map((s, i) => `
              <div class="flex flex-col items-center flex-shrink-0">
                <span class="text-[10px] sm:text-xs text-yellow-300 font-bold mb-0.5">${s.label}</span>
                <span class="text-[9px] text-white/50 mb-1">${s.age}</span>
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-amber-950 flex items-center justify-center text-3xl sm:text-4xl font-black shadow-inner border-2"
                     style="background:${s.key==='modern'?'linear-gradient(135deg,#fbbf24,#f97316)':'#fef3c7'};border-color:${s.color};${s.key==='modern'?'color:white;border-color:white;border-width:3px;':''}">
                  ${s.glyph}
                </div>
                ${i < _etym.stages.length - 1 ? '<span class="text-orange-400 font-black text-xl mt-1 hidden sm:block">→</span>' : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- E19: 口诀 + 易错提示 — 由 multimodalEngine 编排 -->
          ${(_showChant || _showConfuse) ? `
          <div class="flex gap-2 sm:gap-3 mt-2 w-full max-w-3xl flex-wrap justify-center flex-shrink-0">
            ${_showChant ? `
            <button id="btn-chant" class="bg-amber-100 text-amber-950 font-black text-xs sm:text-sm px-3 sm:px-5 py-2 rounded-full shadow-md border-2 border-amber-300 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer">
              ${GAME_ICONS.speaker("w-3.5 h-3.5")}
              <span>口诀：${_etym.mnemonic.chant}</span>
            </button>
            ` : ''}
            ${_showConfuse ? `
              <div class="bg-rose-100/90 text-rose-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-md border-2 border-rose-300 flex items-center gap-1.5">
                <span>⚠️ 别搞混：</span>
                ${_etym.confusing.pairs.map(p => `<span class="font-black text-rose-950">${p.other}${p.otherPinyin?'('+p.otherPinyin+')':''}</span>`).join(' ')}
              </div>
            ` : ''}
          </div>
          ` : ''}

          <!-- 操作按钮 -->
          <div class="flex items-center gap-3 mt-3 flex-shrink-0">
            <button id="btn-open-morph-play" class="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-2xl border-2 border-white active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
              ${GAME_ICONS.sparkle("w-4 h-4")} 动效微剧场
            </button>
            <button id="btn-next-to-rec" class="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-black text-xs sm:text-sm px-6 sm:px-8 py-2.5 sm:py-3 rounded-full shadow-2xl border-2 border-white active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
              ${GAME_ICONS.sparkle("w-4 h-4")} 去认字
            </button>
          </div>
        </div>
            `;
          })()}

      </div>
    `;

    const interactiveStage = stage.querySelector("#play-interactive-stage");
    const revealBox = stage.querySelector("#evolution-reveal-box");
    const morphBtn = stage.querySelector("#btn-open-morph-play");
    const nextBtn = stage.querySelector("#btn-next-to-rec");

    // 智能分发并挂载五大游戏之一
    this.activePlayGame = createPlayGame(interactiveStage, char, () => {
      this._timeout(() => {
        if (revealBox) revealBox.classList.remove("hidden");
      }, 500);
    });
    this.activePlayGame.mount();

    if (morphBtn) {
      this._on(morphBtn, "click", () => {
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

    // E12+E16: 口诀节拍唱读（替代纯朗读）
    let _chantHandle = null;  // 允许中途取消
    const chantBtn = stage.querySelector("#btn-chant");
    if (chantBtn) {
      this._on(chantBtn, "click", () => {
        // 已在唱读 → 取消
        if (_chantHandle) {
          _chantHandle.cancel();
          _chantHandle = null;
          chantBtn.classList.remove("ring-4", "ring-yellow-300");
          return;
        }

        soundAndFX.playPop();
        chantBtn.classList.add("ring-4", "ring-yellow-300");

        const { plan, handle } = chantChar(char, {
          mode: CHANT_MODES.CHANT,
          bpm: 110,
          soundEngine: soundAndFX,
          callbacks: {
            onBeat(beat, text) {
              // 目标字 ★ 给个视觉强调
              if (text === char.char) {
                chantBtn.classList.add("scale-110");
              }
            },
            onComplete() {
              chantBtn.classList.remove("ring-4", "ring-yellow-300", "scale-110");
              _chantHandle = null;
            },
          },
        });

        _chantHandle = handle;
        // 超时兜底：plan 总时长 + 500ms 后自动清理
        this._timeout(() => {
          chantBtn.classList.remove("ring-4", "ring-yellow-300", "scale-110");
          _chantHandle = null;
        }, plan.totalMs + 500);
      });
    }

    if (nextBtn) {
      this._on(nextBtn, "click", () => {
        soundAndFX.playPop();
        this.currentStep = 2;
        this.render();
      });
    }
  }

  // ----------------------------------------------------------------
  // STEP 2: 认 (3D Q弹果冻大字 + 声母韵母 + 词语百宝箱)
