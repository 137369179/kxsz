/** PinyinModule — views & events */
import { soundAndFX } from "../soundEngine.js";
import { mountGameShell, showGameToast } from "../../components/SharedShell.js";
import { GAME_ICONS } from "../gameIcons.js";
import { EVENTS } from "../eventBus.js";
import {
  PINYIN_INITIALS,
  PINYIN_FINALS,
  PINYIN_WHOLE_SYLLABLES,
  PINYIN_COLLISION_PAIRS
} from "../../data/pinyinList.js";
import { CHARACTER_DATABASE } from "../../data/characters.js";
import {
  generateSession,
  checkAnswer,
  TONE_INFO,
  TONE_MNEMONICS,
  TONE_GAME_TYPES
} from "../toneContrastGame.js";
import { ebbinghausManager } from "../ebbinghaus.js";

export function render() {
  this.destroy();

  const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
    activeMode: "play",
    heading: "奇趣拼音王国"
  });
  this._addCleanup(destroyShell);

  mainEl.innerHTML = `
    <div class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pb-8 overflow-y-auto no-scrollbar max-h-[calc(100vh-100px)]">
      
      <div class="w-full flex flex-col sm:flex-row items-center justify-between bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl border-2 border-indigo-200 mb-6 gap-4">
        <div class="flex items-center gap-3">
          <button id="btn-pinyin-back" class="w-10 h-10 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-950 flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer" title="返回大地图">
            ${GAME_ICONS.back("w-5 h-5")}
          </button>
          <div>
            <h1 class="text-base font-black text-indigo-950 flex items-center gap-2">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-5 h-5")}</span>
              <span>部编版奇趣拼音王国</span>
            </h1>
            <p class="text-xs text-indigo-700 font-semibold">幼小衔接拼读必备 · 63 声韵图鉴 · 四声调过山车 · 声韵拼读大碰撞</p>
          </div>
        </div>

        <div class="flex items-center gap-2 bg-indigo-50 p-1.5 rounded-full border border-indigo-200">
          ${[
            { key: "atlas", label: "声韵大地图" },
            { key: "coaster", label: "声调过山车" },
            { key: "collision", label: "声韵大碰撞" }
          ].map(tab => `
            <button class="btn-pinyin-tab px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              this.currentTab === tab.key
                ? "bg-indigo-700 text-white shadow-md scale-105"
                : "text-indigo-900 hover:bg-indigo-100"
            }" data-tab="${tab.key}">
              ${tab.label}
            </button>
          `).join("")}
        </div>
      </div>

      <div id="pinyin-tab-container" class="w-full">
        ${this._renderCurrentTabContent()}
      </div>

    </div>
  `;

  this._bindEvents(mainEl);
}

export function _renderCurrentTabContent() {
  if (this.currentTab === "coaster") {
    return this._renderCoasterView();
  }
  if (this.currentTab === "collision") {
    return this._renderCollisionView();
  }
  return this._renderAtlasView();
}

// ----------------------------------------------------
// 1. 声韵大地图图鉴
// ----------------------------------------------------
export function _renderAtlasView() {
  let currentList = PINYIN_INITIALS;
  if (this.selectedCategory === "final") {
    currentList = PINYIN_FINALS;
  } else if (this.selectedCategory === "whole") {
    currentList = PINYIN_WHOLE_SYLLABLES;
  }

  if (!this.selectedPinyin || !currentList.find(p => p.id === this.selectedPinyin.id)) {
    this.selectedPinyin = currentList[0];
  }

  const cur = this.selectedPinyin;

  return `
    <div class="flex flex-col gap-5">
      
      <div class="flex items-center justify-between bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border-2 border-indigo-100 shadow-md">
        <div class="flex items-center gap-2">
          ${[
            { key: "initial", label: "23 声母" },
            { key: "final", label: "24 韵母" },
            { key: "whole", label: "16 整体认读" }
          ].map(cat => `
            <button class="btn-cat-filter px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              this.selectedCategory === cat.key
                ? "bg-indigo-600 text-white shadow"
                : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
            }" data-cat="${cat.key}">
              ${cat.label}
            </button>
          `).join("")}
        </div>
        <span class="text-xs text-indigo-700 font-bold hidden sm:inline">点击卡片播放标准发音与记忆口诀</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <div class="lg:col-span-7 bg-white/95 rounded-3xl p-5 shadow-xl border-2 border-indigo-100 max-h-[440px] overflow-y-auto no-scrollbar">
          <div class="grid grid-cols-4 sm:grid-cols-6 gap-3">
            ${currentList.map(item => {
              const isSelected = item.id === cur.id;
              return `
                <button class="btn-pinyin-card group relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 ${
                  isSelected
                    ? "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-lg scale-105"
                    : "bg-indigo-50/70 hover:bg-indigo-100 text-indigo-950 border-indigo-200"
                }" data-pid="${item.id}">
                  <span class="text-2xl sm:text-3xl font-black font-mono leading-none mb-1">${item.pinyin}</span>
                  <span class="text-[9px] font-bold opacity-75 truncate">${item.exampleChar || ""}</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>

        <div class="lg:col-span-5 bg-white/95 rounded-3xl p-6 shadow-xl border-4 border-indigo-200 flex flex-col justify-between">
          
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-indigo-100 mb-4">
              <span class="text-xs font-black bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full border border-indigo-300">${cur.name}</span>
              <button id="btn-speak-current-pinyin" class="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md active:scale-90 cursor-pointer" title="点击朗读">
                ${GAME_ICONS.speaker("w-5 h-5")}
              </button>
            </div>

            <div class="relative bg-gradient-to-b from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200 flex flex-col items-center justify-center my-2 shadow-inner">
              <span class="text-7xl sm:text-8xl font-black text-indigo-950 font-mono tracking-wider drop-shadow">${cur.pinyin}</span>
              <span class="text-xs font-bold text-indigo-600 mt-2">对应生字：【${cur.exampleChar}】</span>
            </div>

            <div class="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3.5 my-3 flex items-start gap-2.5">
              <span class="flex items-center text-amber-600 shrink-0 mt-0.5">${GAME_ICONS.sparkle("w-4 h-4")}</span>
              <div class="text-xs font-black text-amber-950 leading-relaxed">
                ${cur.mnemonic}
              </div>
            </div>

            ${cur.mirrorTip ? `
              <div class="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-950 font-bold flex items-center gap-2">
                <span class="flex items-center text-rose-600 shrink-0">${GAME_ICONS.shieldLock("w-4 h-4")}</span>
                <span>防混淆小妙招：${cur.mirrorTip}</span>
              </div>
            ` : ""}

            ${cur.tones ? `
              <div class="mt-3">
                <span class="text-[11px] font-bold text-gray-500 mb-1.5 block">四声调读音试听：</span>
                <div class="grid grid-cols-4 gap-2">
                  ${cur.tones.map((t, idx) => `
                    <button class="btn-play-tone bg-indigo-50 hover:bg-indigo-200 border border-indigo-300 rounded-xl py-2 text-sm font-black text-indigo-950 font-mono text-center active:scale-95 cursor-pointer" data-tone="${t}">
                      ${t}
                    </button>
                  `).join("")}
                </div>
              </div>
            ` : ""}
          </div>

          <div class="text-center text-[10px] text-gray-400 mt-4">
            部编版幼小衔接标准课程大纲配准
          </div>

        </div>

      </div>

    </div>
  `;
}

// ----------------------------------------------------
// 2. 声调过山车 & 声调大挑战 (B5 声调意识训练)
// ----------------------------------------------------
export function _renderCoasterView() {
  if (this.toneQuizActive) {
    return this._renderToneQuizView();
  }

  const tonesData = [
    { tone: 1, name: "第一声 · 一声平", symbol: "ā", desc: "平平地开，小车平稳跑 (高平调 55)", icon: "car" },
    { tone: 2, name: "第二声 · 二声扬", symbol: "á", desc: "上坡加油，由低往高冲 (中升调 35)", icon: "car" },
    { tone: 3, name: "第三声 · 三声拐弯", symbol: "ǎ", desc: "下坡拐弯，滑下又冲起 (降升调 214)", icon: "car" },
    { tone: 4, name: "第四声 · 四声降", symbol: "à", desc: "从山顶滑下，痛快直冲 (全降调 51)", icon: "car" }
  ];

  const currentToneInfo = tonesData.find(t => t.tone === this.currentTone) || tonesData[0];

  return `
    <div class="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-indigo-200 flex flex-col items-center">
      
      <div class="text-center max-w-lg mb-4">
        <h2 class="text-xl font-black text-indigo-950 mb-1">四声调趣味过山车</h2>
        <p class="text-xs text-indigo-700 font-semibold">四声调像过山车的小轨道！一声平、二声扬、三声拐弯、四声降！</p>
      </div>

      <!-- 模式切换：轨道演示 vs 声调大挑战 -->
      <div class="flex items-center gap-2 mb-6 bg-indigo-50 p-1.5 rounded-full border border-indigo-200">
        <button id="btn-subtab-track" class="px-5 py-2 rounded-full text-xs font-black bg-indigo-600 text-white shadow-md cursor-pointer">
          过山车轨道演示
        </button>
        <button id="btn-start-tone-quiz" class="px-5 py-2 rounded-full text-xs font-black text-indigo-900 hover:bg-white/60 cursor-pointer">
          声调大挑战 (5题)
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl mb-8">
        ${tonesData.map(t => `
          <button class="btn-select-tone-coaster p-4 rounded-2xl border-2 transition-all flex flex-col items-center cursor-pointer active:scale-95 ${
            this.currentTone === t.tone
              ? "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-xl scale-105"
              : "bg-indigo-50/70 hover:bg-indigo-100 text-indigo-950 border-indigo-200"
          }" data-tone="${t.tone}">
            <span class="text-3xl font-black font-mono mb-1">${t.symbol}</span>
            <span class="text-xs font-black">${t.name}</span>
          </button>
        `).join("")}
      </div>

      <div class="relative w-full max-w-2xl h-64 bg-gradient-to-b from-sky-100 via-indigo-50 to-amber-100 rounded-3xl border-4 border-indigo-300 shadow-inner flex flex-col items-center justify-between p-6 overflow-hidden">
        
        <div class="w-full flex items-center justify-between text-xs font-black text-indigo-900 z-10">
          <span class="flex items-center gap-1.5">${GAME_ICONS.sparkle("w-4 h-4")} 轨道演示：${currentToneInfo.name}</span>
          <span class="bg-white/80 px-3 py-1 rounded-full shadow-sm text-indigo-950">${currentToneInfo.desc}</span>
        </div>

        <div class="relative w-full flex-1 flex items-center justify-center my-1">
          <canvas id="coaster-canvas" class="w-full h-full rounded-2xl"></canvas>
          <div id="coaster-cart" class="absolute w-12 h-10 bg-gradient-to-tr from-amber-400 via-orange-500 to-red-500 rounded-xl border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-xs pointer-events-none transition-transform z-15">
            ${GAME_ICONS.sparkle("w-5 h-5")}
          </div>
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <span class="text-8xl font-black font-mono text-indigo-900">${currentToneInfo.symbol}</span>
          </div>
        </div>

        <button id="btn-trigger-coaster" class="btn-game-orange text-white text-xs sm:text-sm font-black px-10 py-3.5 rounded-full shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer z-10 hover:brightness-105">
          <span class="flex items-center">${GAME_ICONS.sparkle("w-5 h-5")}</span>
          <span>发车出发！体验声调过山车 (${currentToneInfo.symbol})</span>
        </button>

      </div>

      <!-- B5 声调意识强化大挑战入口 -->
      <div class="w-full max-w-2xl mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 shadow flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="flex items-center text-amber-500">${GAME_ICONS.sparkle("w-8 h-8")}</span>
          <div>
            <h3 class="text-sm font-black text-amber-950">四声调辨识大挑战 (B5 意识训练)</h3>
            <p class="text-xs text-amber-800">听音辨调、选字辨调，建立 4 声调敏锐语感！</p>
          </div>
        </div>
        <button id="btn-start-tone-quiz-bottom" class="btn-game-orange text-white text-xs font-black px-6 py-2.5 rounded-full shadow cursor-pointer active:scale-95 whitespace-nowrap">
          开始挑战 (5题)
        </button>
      </div>

    </div>
  `;
}

export function startToneQuiz() {
  this.toneQuizActive = true;
  this.toneQuizSession = generateSession(CHARACTER_DATABASE, {
    numQuestions: 5,
    types: [TONE_GAME_TYPES.LISTEN_PICK_TONE, TONE_GAME_TYPES.TONE_PICK_CHAR]
  });
  this.toneQuizIndex = 0;
  this.toneQuizScore = 0;
  this.toneQuizLastResult = null;
  if (this.toneQuizSession?.questions?.[0]?.speakText) {
    soundAndFX.speakPriority(this.toneQuizSession.questions[0].speakText, { kind: "pinyin", priority: 1 });
  }
  this.render();
}

export function _renderToneQuizView() {
  if (!this.toneQuizSession) {
    return `
      <div class="bg-white/95 rounded-3xl p-8 shadow-xl border-4 border-indigo-200 flex flex-col items-center max-w-2xl mx-auto">
        <div class="text-center mb-6">
          <h2 class="text-xl font-black text-indigo-950 mb-1">四声调辨识大挑战</h2>
          <p class="text-xs text-indigo-700 font-semibold">汉语拼读的核心钥匙 · 每天 5 题练就神耳朵</p>
        </div>
        <button id="btn-start-tone-quiz" class="btn-game-orange text-white text-sm font-black px-8 py-3 rounded-full shadow-lg active:scale-95 cursor-pointer">
          开始挑战 (5题)
        </button>
        <button id="btn-back-track" class="mt-4 text-xs font-bold text-indigo-600 underline cursor-pointer">
          返回轨道演示
        </button>
      </div>
    `;
  }

  const { questions } = this.toneQuizSession;
  if (this.toneQuizIndex >= questions.length) {
    const perfect = this.toneQuizScore === questions.length;
    return `
      <div class="bg-white/95 rounded-3xl p-8 shadow-xl border-4 border-indigo-200 flex flex-col items-center max-w-2xl mx-auto text-center">
        <div class="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mb-4 shadow-inner">
          ${GAME_ICONS.sparkle("w-10 h-10")}
        </div>
        <h2 class="text-2xl font-black text-indigo-950 mb-2">${perfect ? "太棒啦！满分通关！" : "挑战完成！真棒！"}</h2>
        <p class="text-sm text-indigo-700 mb-6 font-semibold">你答对了 ${this.toneQuizScore} / ${questions.length} 题！声调意识又提升啦！</p>
        
        <div class="flex items-center gap-4">
          <button id="btn-restart-tone-quiz" class="btn-game-orange text-white text-xs font-black px-8 py-3 rounded-full shadow active:scale-95 cursor-pointer">
            再挑战一次
          </button>
          <button id="btn-back-track" class="bg-indigo-100 hover:bg-indigo-200 text-indigo-900 text-xs font-black px-8 py-3 rounded-full shadow active:scale-95 cursor-pointer">
            返回轨道演示
          </button>
        </div>
      </div>
    `;
  }

  const q = questions[this.toneQuizIndex];
  const isAnswered = this.toneQuizLastResult !== null;

  return `
    <div class="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-indigo-200 flex flex-col items-center max-w-2xl mx-auto w-full">
      
      <!-- 头部导航与进度 -->
      <div class="w-full flex items-center justify-between mb-6">
        <button id="btn-back-track" class="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer">
          返回轨道演示
        </button>
        <div class="flex items-center gap-2">
          <span class="text-xs font-black text-indigo-900 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            第 ${this.toneQuizIndex + 1} / ${questions.length} 题
          </span>
          <span class="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            得分：${this.toneQuizScore}
          </span>
        </div>
      </div>

      <!-- 题目语音卡片 -->
      <div class="w-full bg-gradient-to-b from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200 flex flex-col items-center mb-6 text-center">
        <h3 class="text-base font-black text-indigo-950 mb-3">${q.question}</h3>
        
        <button id="btn-play-tone-sound" class="btn-game-primary text-white text-xs font-black px-6 py-2.5 rounded-full shadow flex items-center gap-2 cursor-pointer active:scale-95 hover:brightness-105" data-sound="${q.speakText || ''}">
          <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
          <span>点击重听读音</span>
        </button>
        
        ${isAnswered ? `
          <div class="mt-4 p-3 rounded-xl text-xs font-bold ${
            this.toneQuizLastResult.correct
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : "bg-amber-100 text-amber-800 border border-amber-300"
          }">
            ${this.toneQuizLastResult.correct ? "答对啦！" : "再记一记：" + (q.explanation || "")}
          </div>
        ` : ""}
      </div>

      <!-- 选项区域 -->
      <div class="grid grid-cols-2 gap-4 w-full">
        ${q.options.map((opt) => {
          const optVal = opt.tone !== undefined ? opt.tone : (opt.char || opt);
          let btnClass = "bg-indigo-50/80 hover:bg-indigo-100 text-indigo-950 border-indigo-200";
          if (isAnswered) {
            if (optVal === q.correctAnswer) {
              btnClass = "bg-emerald-500 text-white border-emerald-600 shadow-md scale-102";
            } else if (optVal === this.toneQuizLastResult.selected) {
              btnClass = "bg-rose-400 text-white border-rose-500 opacity-80";
            } else {
              btnClass = "bg-gray-100 text-gray-400 border-gray-200 opacity-50";
            }
          }
          return `
            <button class="btn-tone-quiz-opt p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 ${btnClass}"
              data-val="${optVal}" ${isAnswered ? "disabled" : ""}>
              <span class="text-xl sm:text-2xl font-black mb-1">${opt.label || opt.char || optVal}</span>
              ${opt.pinyin ? `<span class="text-xs font-bold text-gray-500">${opt.pinyin}</span>` : ""}
              ${opt.tone && TONE_MNEMONICS[opt.tone] ? `<span class="text-[11px] font-medium opacity-80">${TONE_MNEMONICS[opt.tone].split("～")[0]}</span>` : ""}
            </button>
          `;
        }).join("")}
      </div>

    </div>
  `;
}

// ----------------------------------------------------
// 3. 声韵拼读大碰撞
// ----------------------------------------------------
export function _renderCollisionView() {
  const pair = PINYIN_COLLISION_PAIRS[this.collisionIndex % PINYIN_COLLISION_PAIRS.length];

  return `
    <div class="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-indigo-200 flex flex-col items-center">
      
      <div class="text-center max-w-lg mb-6">
        <h2 class="text-xl font-black text-indigo-950 mb-1">声韵拼读碰撞实验室</h2>
        <p class="text-xs text-indigo-700 font-semibold">两只拼音小车相撞，合体拼读出神奇汉字！</p>
      </div>

      <div class="relative w-full max-w-2xl bg-gradient-to-b from-indigo-50 to-purple-50 rounded-3xl p-8 border-4 border-indigo-300 shadow-inner flex flex-col items-center justify-between min-h-[360px] overflow-hidden">
        
        <div class="w-full flex items-center justify-around gap-4 z-10">
          
          <div id="cart-left" class="flex flex-col items-center transition-all duration-500">
            <span class="text-xs font-black text-indigo-600 mb-2">声母小车</span>
            <div class="w-24 h-24 rounded-2xl bg-white border-4 border-indigo-500 shadow-xl flex items-center justify-center font-mono text-5xl font-black text-indigo-950">
              ${pair.initial}
            </div>
          </div>

          <div id="collision-plus" class="text-3xl font-black text-indigo-300">+</div>

          <div id="cart-right" class="flex flex-col items-center transition-all duration-500">
            <span class="text-xs font-black text-purple-600 mb-2">韵母小车</span>
            <div class="w-24 h-24 rounded-2xl bg-white border-4 border-purple-500 shadow-xl flex items-center justify-center font-mono text-5xl font-black text-purple-950">
              ${pair.final}
            </div>
          </div>

        </div>

        <div id="collision-result-box" class="flex flex-col items-center my-3 opacity-0 transition-all duration-500 transform scale-75">
          <div class="flex items-baseline gap-3 mb-1">
            <span class="text-3xl font-black text-indigo-700 font-mono">${pair.syllable}</span>
            <span class="text-6xl font-black text-indigo-950 font-serif">${pair.char}</span>
          </div>
          ${pair.image ? `
            <div class="w-40 h-24 sm:w-48 sm:h-28 my-1.5 rounded-2xl overflow-hidden shadow-lg border-2 border-indigo-200">
              <img src="${pair.image}" alt="${pair.word}" class="w-full h-full object-cover" />
            </div>
          ` : ""}
          <span class="text-sm font-black text-emerald-700 bg-emerald-100 px-4 py-1.5 rounded-full border border-emerald-300">
            组词: 【${pair.word}】 · ${pair.meaning}
          </span>
        </div>


        <div class="flex items-center gap-4 z-10">
          <button id="btn-fire-collision" class="btn-game-orange text-white text-xs sm:text-sm font-black px-8 py-3.5 rounded-full shadow-xl active:scale-95 flex items-center gap-2 cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.sparkle("w-5 h-5")}</span>
            <span>发射两车碰撞！</span>
          </button>
          <button id="btn-next-collision" class="bg-indigo-100 hover:bg-indigo-200 text-indigo-900 text-xs sm:text-sm font-black px-6 py-3.5 rounded-full shadow-md active:scale-95 cursor-pointer">
            <span>换下一题</span>
          </button>
        </div>

      </div>

    </div>
  `;
}

// ----------------------------------------------------
// 事件绑定机制
// ----------------------------------------------------
export function _bindEvents(mainEl) {
  // 1. 返回大地图
  const backBtn = mainEl.querySelector("#btn-pinyin-back");
  if (backBtn) {
    this.bindBackButton(backBtn);
  }

  // 2. 切换主玩法标签
  mainEl.querySelectorAll(".btn-pinyin-tab").forEach(btn => {
    this._on(btn, "click", () => {
      soundAndFX.playPop();
      this.currentTab = btn.dataset.tab;
      this.render();
    });
  });

  // 3. 图鉴分类筛选 (声母 / 韵母 / 整体认读)
  mainEl.querySelectorAll(".btn-cat-filter").forEach(btn => {
    this._on(btn, "click", () => {
      soundAndFX.playPop();
      this.selectedCategory = btn.dataset.cat;
      this.render();
    });
  });

  // 4. 选择拼音卡片
  mainEl.querySelectorAll(".btn-pinyin-card").forEach(btn => {
    this._on(btn, "click", () => {
      const pid = btn.dataset.pid;
      const pool = [...PINYIN_INITIALS, ...PINYIN_FINALS, ...PINYIN_WHOLE_SYLLABLES];
      const found = pool.find(p => p.id === pid);
      if (found) {
        soundAndFX.playPop();
        this.selectedPinyin = found;
        soundAndFX.speakPriority(found.pinyin, { kind: "char", priority: 1 });
        this.render();
      }
    });
  });

  // 5. 点击朗读当前所选拼音
  const speakCurrentBtn = mainEl.querySelector("#btn-speak-current-pinyin");
  if (speakCurrentBtn && this.selectedPinyin) {
    this._on(speakCurrentBtn, "click", () => {
      soundAndFX.playPop();
      soundAndFX.speakPriority(`${this.selectedPinyin.pinyin}，${this.selectedPinyin.mnemonic}`, { kind: "sentence", priority: 1 });
    });
  }

  // 6. 播放四声调单项
  mainEl.querySelectorAll(".btn-play-tone").forEach(btn => {
    this._on(btn, "click", () => {
      const toneText = btn.dataset.tone;
      soundAndFX.playPop();
      soundAndFX.speakPriority(toneText, { kind: "char", priority: 1 });
    });
  });

  // 7. 过山车声调选择
  mainEl.querySelectorAll(".btn-select-tone-coaster").forEach(btn => {
    this._on(btn, "click", () => {
      soundAndFX.playPop();
      this.currentTone = parseInt(btn.dataset.tone, 10);
      this.render();
    });
  });

  // 8. 绘制声调过山车 Canvas 轨道与小车驱动
  const coasterCanvas = mainEl.querySelector("#coaster-canvas");
  const coasterCart = mainEl.querySelector("#coaster-cart");
  if (coasterCanvas && coasterCanvas.getContext) {
    const drawTrack = (tVal) => {
      const w = coasterCanvas.offsetWidth || 560;
      const h = coasterCanvas.offsetHeight || 130;
      coasterCanvas.width = w;
      coasterCanvas.height = h;
      const ctx = coasterCanvas.getContext("2d");
      ctx.clearRect(0, 0, w, h);

      const padX = 40;
      const pW = w - padX * 2;
      const getY = (prog) => {
        if (tVal === 1) return h * 0.45;
        if (tVal === 2) return h * 0.75 - prog * (h * 0.5);
        if (tVal === 3) {
          const norm = (prog - 0.5) * 2;
          return h * 0.35 + (1 - norm * norm) * (h * 0.45);
        }
        return h * 0.25 + prog * (h * 0.5);
      };

      // 绘制木质枕木
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 4;
      const numTies = 22;
      for (let i = 0; i <= numTies; i++) {
        const prog = i / numTies;
        const x = padX + prog * pW;
        const y = getY(prog);
        ctx.beginPath();
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x, y + 10);
        ctx.stroke();
      }

      // 绘制双股金色钢轨
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const prog = i / 60;
        const x = padX + prog * pW;
        const y = getY(prog);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 初始小车位置
      if (coasterCart) {
        const startY = getY(0);
        coasterCart.style.left = `${padX}px`;
        coasterCart.style.top = `${startY - 20}px`;
      }
    };

    this._timeout(() => drawTrack(this.currentTone), 60);

    const triggerCoasterBtn = mainEl.querySelector("#btn-trigger-coaster");
    if (triggerCoasterBtn) {
      this._on(triggerCoasterBtn, "click", () => {
        soundAndFX.playWhoosh();
        soundAndFX.playPop();

        const w = coasterCanvas.offsetWidth || 560;
        const h = coasterCanvas.offsetHeight || 130;
        const padX = 40;
        const pW = w - padX * 2;
        const tVal = this.currentTone;

        const getY = (prog) => {
          if (tVal === 1) return h * 0.45;
          if (tVal === 2) return h * 0.75 - prog * (h * 0.5);
          if (tVal === 3) {
            const norm = (prog - 0.5) * 2;
            return h * 0.35 + (1 - norm * norm) * (h * 0.45);
          }
          return h * 0.25 + prog * (h * 0.5);
        };

        const tonesSymbol = ["ā", "á", "ǎ", "à"][this.currentTone - 1];
        soundAndFX.speakPriority(tonesSymbol, { kind: "char", priority: 1 });

        // 动画驱动小车飞驰
        let startTime = null;
        let animCancelled = false;
        const duration = 900;

        const stepAnim = (timestamp) => {
          if (animCancelled) return;
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(1, elapsed / duration);
          const curX = padX + progress * pW;
          const curY = getY(progress);

          if (coasterCart) {
            coasterCart.style.left = `${curX}px`;
            coasterCart.style.top = `${curY - 20}px`;
          }

          if (progress < 1) {
            if (!animCancelled) requestAnimationFrame(stepAnim);
          } else {
            soundAndFX.playSuccess();
            soundAndFX.triggerConfetti(mainEl);
            this._timeout(() => drawTrack(this.currentTone), 400);
          }
        };

        // 注册清理：模块销毁时取消动画
        const _cleanupCoaster = () => { animCancelled = true; };
        this._addCleanup(_cleanupCoaster);

        requestAnimationFrame(stepAnim);
      });
    }
  }

  // 9. 声韵拼读大碰撞发射
  const fireCollisionBtn = mainEl.querySelector("#btn-fire-collision");
  if (fireCollisionBtn) {
    this._on(fireCollisionBtn, "click", () => {
      soundAndFX.playWhoosh();
      soundAndFX.playPop();
      const leftCart = mainEl.querySelector("#cart-left");
      const rightCart = mainEl.querySelector("#cart-right");
      const resultBox = mainEl.querySelector("#collision-result-box");
      const plusSign = mainEl.querySelector("#collision-plus");

      if (leftCart && rightCart) {
        leftCart.style.transition = "transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)";
        rightCart.style.transition = "transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)";
        leftCart.classList.add("translate-x-20", "scale-110");
        rightCart.classList.add("-translate-x-20", "scale-110");
      }
      if (plusSign) {
        plusSign.classList.add("scale-150", "text-amber-500");
      }

      this._timeout(() => {
        soundAndFX.playSuccess();
        soundAndFX.triggerConfetti(mainEl);
        if (resultBox) {
          resultBox.classList.remove("opacity-0", "scale-75");
          resultBox.classList.add("opacity-100", "scale-100");
        }
        const pair = PINYIN_COLLISION_PAIRS[this.collisionIndex % PINYIN_COLLISION_PAIRS.length];
        soundAndFX.speakPriority(`${pair.initial}，${pair.final}，${pair.syllable}！${pair.char}，${pair.word}`, { kind: "sentence", priority: 1 });
      }, 380);
    });
  }

  // 10. 下一道拼读碰撞
  const nextCollisionBtn = mainEl.querySelector("#btn-next-collision");
  if (nextCollisionBtn) {
    this._on(nextCollisionBtn, "click", () => {
      soundAndFX.playPop();
      this.collisionIndex++;
      this.render();
    });
  }
}
