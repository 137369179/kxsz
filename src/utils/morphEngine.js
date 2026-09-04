/**
 * 凯茜识字 (Cathy Literacy) - 象形本源「图-字动效微剧场」引擎
 * -----------------------------------------------------------------
 * 1. 模拟自然实景图到甲骨文线条、再平滑形变为现代楷书字形的过程。
 * 2. 支持儿童手动滑动进度条交互（从 0% 实景 到 100% 汉字），感知字形演变。
 * 3. 包含动画定时播放、粒子闪光与声音解说。
 * 4. 严守工程红线：绝对零 Unicode Emoji，零 SVG。
 */

import { soundAndFX } from "./soundEngine.js";
import { GAME_ICONS } from "./gameIcons.js";

/**
 * 渲染象形动效微剧场 HTML 容器
 */
export function renderMorphTheaterHTML(charItem) {
  if (!charItem) return "";

  const evolution = charItem.evolution || {};
  const story = evolution.story || "古人根据事物的真实样貌，画出了最初的线条图形，后来逐渐演变成为今天的规范汉字。";

  return `
    <div id="morph-theater-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
      <div class="relative w-full max-w-xl bg-white/95 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 flex flex-col items-center">
        
        <button id="btn-close-morph-theater" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-950 flex items-center justify-center shadow-md active:scale-90 cursor-pointer" title="关闭">
          ${GAME_ICONS.back("w-5 h-5")}
        </button>

        <div class="text-center mb-3">
          <span class="text-xs font-black bg-amber-200 text-amber-950 px-3.5 py-1 rounded-full border border-amber-300">象形字源蜕变动效微剧场</span>
          <h3 class="text-xl sm:text-2xl font-black text-amber-950 mt-1">【${charItem.char}】字是怎么来的？</h3>
        </div>

        <div class="flex items-center gap-1.5 sm:gap-2 mb-2 w-full justify-center flex-wrap">
          <button class="morph-step-pill px-3 py-1 rounded-full text-xs font-black border transition-all bg-amber-500 text-white border-white shadow-md cursor-pointer" data-val="0">
            1. 自然象形
          </button>
          <button class="morph-step-pill px-3 py-1 rounded-full text-xs font-black border transition-all bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 cursor-pointer" data-val="33">
            2. 殷商甲骨
          </button>
          <button class="morph-step-pill px-3 py-1 rounded-full text-xs font-black border transition-all bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 cursor-pointer" data-val="66">
            3. 秦汉小篆
          </button>
          <button class="morph-step-pill px-3 py-1 rounded-full text-xs font-black border transition-all bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 cursor-pointer" data-val="100">
            4. 现代楷书
          </button>
        </div>

        <div class="relative w-full h-64 sm:h-72 rounded-3xl bg-gradient-to-b from-amber-50 to-orange-100 border-2 border-amber-200 shadow-inner flex items-center justify-center overflow-hidden my-2">
          
          <div id="morph-layer-nature" class="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-none opacity-100">
            <div class="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-amber-200/80 border-4 border-amber-400 flex items-center justify-center shadow-lg transform transition-transform duration-300">
              <span class="text-6xl sm:text-7xl font-black text-amber-900 font-serif">${charItem.char}</span>
            </div>
            <span class="text-xs font-bold text-amber-800 mt-3 bg-white/90 px-4 py-1 rounded-full shadow-sm border border-amber-200">
              第 1 幕 · 远古自然形貌
            </span>
          </div>

          <div id="morph-layer-oracle" class="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-none opacity-0">
            <div class="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-amber-900/10 border-4 border-dashed border-amber-600 flex items-center justify-center shadow-md">
              <span class="text-6xl sm:text-7xl font-black text-amber-900 font-serif">${charItem.oracleGlyph || charItem.bronzeGlyph || charItem.char}</span>
            </div>
            <span class="text-xs font-bold text-amber-800 mt-3 bg-white/90 px-4 py-1 rounded-full shadow-sm border border-amber-200">
              第 2 幕 · 殷商甲骨金文
            </span>
          </div>

          <div id="morph-layer-seal" class="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-none opacity-0">
            <div class="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-amber-100 border-4 border-amber-700 flex items-center justify-center shadow-lg">
              <span class="text-6xl sm:text-7xl font-black text-amber-950 font-serif">${charItem.bronzeGlyph || charItem.oracleGlyph || charItem.char}</span>
            </div>
            <span class="text-xs font-bold text-amber-900 mt-3 bg-white/90 px-4 py-1 rounded-full shadow-sm border border-amber-200">
              第 3 幕 · 秦汉金文小篆
            </span>
          </div>

          <div id="morph-layer-modern" class="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-none opacity-0">
            <div class="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 border-4 border-white shadow-2xl flex flex-col items-center justify-center">
              <span class="text-xs font-black text-yellow-100">${charItem.pinyin}</span>
              <span class="text-7xl sm:text-8xl font-black text-white font-serif leading-none drop-shadow-md">${charItem.char}</span>
            </div>
            <span class="text-xs font-bold text-orange-900 mt-3 bg-white/90 px-4 py-1 rounded-full shadow-sm border border-orange-200">
              第 4 幕 · 现代规范楷书
            </span>
          </div>

          <div id="morph-sparkle-layer" class="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500 bg-amber-400/20"></div>

        </div>

        <div class="w-full bg-amber-50 rounded-2xl p-4 border border-amber-200 mt-2 flex flex-col gap-2">
          <div class="flex items-center justify-between text-xs font-black text-amber-950">
            <span>自然图画 (0%)</span>
            <span id="morph-progress-label">当前阶段: 远古自然形貌</span>
            <span>规范汉字 (100%)</span>
          </div>
          <input id="morph-range-slider" type="range" min="0" max="100" value="0" class="w-full accent-orange-500 cursor-pointer h-2 bg-amber-200 rounded-lg" />
        </div>

        <div class="mt-3 bg-orange-50 border-2 border-orange-200 rounded-2xl p-3.5 w-full flex items-start gap-2.5 text-xs font-black text-orange-950 leading-relaxed">
          <span class="flex items-center text-orange-600 shrink-0 mt-0.5">${GAME_ICONS.sparkle("w-4 h-4")}</span>
          <div class="flex flex-col gap-1">
            <p id="morph-stage-desc" class="text-amber-800 font-bold">${evolution.oracleDesc || "观察真实样貌，描绘原始图形。"}</p>
            <p id="morph-story-text" class="text-gray-600 font-normal">${story}</p>
          </div>
        </div>

        <div class="flex items-center gap-3 mt-3">
          <button id="btn-auto-play-morph" class="btn-game-orange text-white text-xs sm:text-sm font-black px-8 py-2.5 rounded-full shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
            <span>自动播放蜕变</span>
          </button>
        </div>

      </div>
    </div>
  `;
}

/**
 * 挂载并启动动效微剧场
 */
export function openMorphTheater(charItem, container = document.body, opts = {}) {
  if (!charItem) return;

  const { onClose } = opts || {};
  const evolution = charItem.evolution || {};
  const html = renderMorphTheaterHTML(charItem);
  const wrapper = document.createElement("div");
  wrapper.id = "cathy-morph-theater-wrapper";
  wrapper.innerHTML = html;
  container.appendChild(wrapper);

  const modal = wrapper.querySelector("#morph-theater-modal");
  const closeBtn = wrapper.querySelector("#btn-close-morph-theater");
  const slider = wrapper.querySelector("#morph-range-slider");
  const progressLabel = wrapper.querySelector("#morph-progress-label");
  const stageDesc = wrapper.querySelector("#morph-stage-desc");
  const autoPlayBtn = wrapper.querySelector("#btn-auto-play-morph");
  const pills = wrapper.querySelectorAll(".morph-step-pill");

  const layerNature = wrapper.querySelector("#morph-layer-nature");
  const layerOracle = wrapper.querySelector("#morph-layer-oracle");
  const layerSeal = wrapper.querySelector("#morph-layer-seal");
  const layerModern = wrapper.querySelector("#morph-layer-modern");
  const sparkleLayer = wrapper.querySelector("#morph-sparkle-layer");

  const updateStagePills = (stepIndex) => {
    pills.forEach((p, idx) => {
      if (idx === stepIndex) {
        p.className = "morph-step-pill px-3 py-1 rounded-full text-xs font-black border transition-all bg-amber-500 text-white border-white shadow-md cursor-pointer";
      } else {
        p.className = "morph-step-pill px-3 py-1 rounded-full text-xs font-black border transition-all bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 cursor-pointer";
      }
    });
  };

  const updateStage = (val) => {
    val = parseInt(val, 10);
    if (val < 25) {
      if (layerNature) layerNature.style.opacity = 1;
      if (layerOracle) layerOracle.style.opacity = 0;
      if (layerSeal) layerSeal.style.opacity = 0;
      if (layerModern) layerModern.style.opacity = 0;
      if (progressLabel) progressLabel.textContent = "当前阶段: 远古自然形貌";
      if (stageDesc) stageDesc.textContent = evolution.oracleDesc || "观察自然万物的原本样貌，勾勒最初图形。";
      updateStagePills(0);
    } else if (val < 50) {
      if (layerNature) layerNature.style.opacity = 0;
      if (layerOracle) layerOracle.style.opacity = 1;
      if (layerSeal) layerSeal.style.opacity = 0;
      if (layerModern) layerModern.style.opacity = 0;
      if (progressLabel) progressLabel.textContent = "当前阶段: 殷商象形甲骨";
      if (stageDesc) stageDesc.textContent = evolution.oracleDesc || "刻画在龟甲兽骨上的象形线条。";
      updateStagePills(1);
    } else if (val < 75) {
      if (layerNature) layerNature.style.opacity = 0;
      if (layerOracle) layerOracle.style.opacity = 0;
      if (layerSeal) layerSeal.style.opacity = 1;
      if (layerModern) layerModern.style.opacity = 0;
      if (progressLabel) progressLabel.textContent = "当前阶段: 秦汉金文小篆";
      if (stageDesc) stageDesc.textContent = evolution.bronzeDesc || evolution.sealDesc || "铸刻在青铜器与竹简上的圆润小篆。";
      updateStagePills(2);
    } else {
      if (layerNature) layerNature.style.opacity = 0;
      if (layerOracle) layerOracle.style.opacity = 0;
      if (layerSeal) layerSeal.style.opacity = 0;
      if (layerModern) layerModern.style.opacity = 1;
      if (progressLabel) progressLabel.textContent = "当前阶段: 现代规范楷书";
      if (stageDesc) stageDesc.textContent = evolution.modernDesc || "笔画横平竖直、端正规范的现代楷书。";
      updateStagePills(3);
    }
  };

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      soundAndFX.playPop();
      const val = parseInt(pill.dataset.val, 10);
      if (slider) slider.value = val;
      updateStage(val);
    });
  });

  if (slider) {
    slider.addEventListener("input", (e) => {
      updateStage(e.target.value);
    });
  }

  let timers = [];
  const clearTimers = () => {
    timers.forEach((t) => clearTimeout(t));
    timers = [];
  };

  // 关闭
  const close = () => {
    clearTimers();
    try { soundAndFX.stopSpeaking(); } catch {}
    soundAndFX.playPop();
    wrapper.remove();
    if (typeof onClose === "function") {
      try { onClose(); } catch (_) { /* ignore */ }
    }
  };

  if (closeBtn) closeBtn.addEventListener("click", close);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
  }

  // 自动播放
  if (autoPlayBtn) {
    autoPlayBtn.addEventListener("click", () => {
      clearTimers();
      if (slider) slider.value = 0;
      updateStage(0);

      soundAndFX.speakPriority(`第一幕：远古时期，人们画出了万物的形貌。`, { kind: "sentence", priority: 1 });

      const t1 = setTimeout(() => {
        if (slider) slider.value = 33;
        updateStage(33);
        soundAndFX.speakPriority(`第二幕：线条化成了殷商甲骨文。`, { kind: "sentence", priority: 1 });
      }, 1500);
      timers.push(t1);

      const t2 = setTimeout(() => {
        if (slider) slider.value = 66;
        updateStage(66);
        soundAndFX.speakPriority(`第三幕：演化为规整的金文与小篆。`, { kind: "sentence", priority: 1 });
      }, 3000);
      timers.push(t2);

      const t3 = setTimeout(() => {
        if (slider) slider.value = 100;
        updateStage(100);
        soundAndFX.playSuccessSound();
        soundAndFX.triggerConfetti(wrapper);
        if (sparkleLayer) {
          sparkleLayer.style.opacity = 1;
          const tSparkle = setTimeout(() => { if (sparkleLayer) sparkleLayer.style.opacity = 0; }, 800);
          timers.push(tSparkle);
        }
        const tVoice = setTimeout(() => {
          soundAndFX.speakPriority(`第四幕：看！这就是我们今天写的“${charItem.char}”字！`, { kind: "char", priority: 1 });
        }, 250);
        timers.push(tVoice);
      }, 4500);
      timers.push(t3);
    });
  }
}
