/**
 * 凯茜识字 (Cathy Literacy) - 1:1 沉浸式五步闭环教学引擎
 * 核心特色：
 * 1. 【玩】8大汉字专属物理情景交互（拉绳升日、擦云见月、涌泉流水、摩擦点火、敲石成山、浇水长木、跨栏成人、喂食成口）+ 4阶段象形蜕变
 * 2. 【认】3D Q弹果冻大字 + 偏旁部首拆解 + 词组实物小剧场
 * 3. 【练】太空战机射击 / 飞翔气球小游戏
 * 4. 【写】AI 魔法星光毛笔描红 + 严格倒笔画阻断拦截 + 全屏 Confetti 礼炮
 * 5. 【测】闪电速测 + 黄金宝箱降落 + 三星飞入“Duang! Duang! Duang!”
 */

import { HanziEngine } from "../utils/hanziEngine.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { BaseModule } from "../utils/BaseModule.js";
import { EVENTS } from "../utils/eventBus.js";
import { GAME_ICONS } from "../utils/gameIcons.js";

export class LearnModule extends BaseModule {
  constructor(container, charData, onFinishCallback, onBackToMapCallback) {
    super(container);
    this.charData = charData;
    this.onFinish = onFinishCallback;
    this.onBackToMap = onBackToMapCallback;

    this.currentStep = 1; // 1:玩, 2:认, 3:练, 4:写, 5:测
    this.hanziEngine = null;
  }

  destroy() {
    if (this.hanziEngine) {
      this.hanziEngine.destroy();
      this.hanziEngine = null;
    }
    super.destroy();
  }

  render() {
    this.destroy();

    const __lnProgress = ebbinghausManager.progress;
    const __lnSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
        
        <!-- 1. 顶部悬浮控制栏与五步水晶进度条 -->
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/20">
          
          <!-- 返回地图按钮 -->
          <button id="btn-learn-back-map" class="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-xs px-4 py-2 rounded-full shadow-xl border-2 border-white/80 active:scale-95 transition-transform">
            <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
            <span>返回地图</span>
          </button>

          <!-- 五步发光水晶连珠 (玩、认、练、写、测) -->
          <div class="flex items-center gap-3 bg-black/60 px-6 py-1.5 rounded-full border border-white/30 shadow-2xl">
            ${[
              { step: 1, name: "玩", iconSvg: (cls) => GAME_ICONS.gem(cls) },
              { step: 2, name: "认", iconSvg: (cls) => GAME_ICONS.cards(cls) },
              { step: 3, name: "练", iconSvg: (cls) => GAME_ICONS.arcade(cls) },
              { step: 4, name: "写", iconSvg: (cls) => GAME_ICONS.brush(cls) },
              { step: 5, name: "测", iconSvg: (cls) => GAME_ICONS.trophy(cls) }
            ]
              .map(
                (s) => `
              <div class="flex items-center gap-1.5">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 ${
                  s.step === this.currentStep
                    ? "bg-gradient-to-tr from-yellow-300 via-orange-500 to-red-500 text-white shadow-[0_0_15px_rgba(255,160,0,0.9)] scale-125 ring-4 ring-yellow-300/80 animate-pulse"
                    : s.step < this.currentStep
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-white/20 text-white/40"
                }">
                  ${s.step < this.currentStep ? "✓" : `<span class="flex items-center">${s.iconSvg("w-4 h-4")}</span>`}
                </div>
                <span class="text-xs font-black ${s.step === this.currentStep ? "text-yellow-300 drop-shadow" : "text-white/60"}">${s.name}</span>
                ${s.step < 5 ? `<div class="w-4 h-0.5 ${s.step < this.currentStep ? "bg-emerald-400" : "bg-white/20"}"></div>` : ""}
              </div>
            `
              )
              .join("")}
          </div>

          <!-- 右侧：学习字 + 声音 + HUD -->
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs px-4 py-1.5 rounded-full border-2 border-white shadow-lg">
              <span>正在学习:</span>
              <span class="text-lg text-yellow-200">${this.charData.char}</span>
            </div>
            <button id="btn-learn-sound" class="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg" title="声音开关">
              ${__lnSpeakerIcon}
            </button>
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full bg-black/40 border border-white/30">
              ${GAME_ICONS.coin("w-4 h-4")}<span>${__lnProgress.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full bg-black/40 border border-white/30">
              ${GAME_ICONS.star("w-4 h-4", true)}<span>${__lnProgress.stars}</span>
            </div>
          </div>

        </header>

        <!-- 2. 核心全屏游戏舞台交互区 -->
        <main id="learn-stage-container" class="relative z-10 flex-1 w-full flex items-center justify-center p-4">
          <!-- 动态步骤内容由 renderStep() 注入 -->
        </main>

      </div>
    `;

    this.bindHeaderEvents();
    this.renderCurrentStep();
  }

  setStep(stepNum) {
    this.currentStep = stepNum;
    this.render();
  }

  bindHeaderEvents() {
    const backBtn = this.container.querySelector("#btn-learn-back-map");
    if (backBtn) {
      this._on(backBtn, "click", () => {
        soundAndFX.playPop();
        if (this.hanziEngine) this.hanziEngine.destroy();
        if (this.onBackToMap) this.onBackToMap();
        else this._busEmit(EVENTS.SWITCH_MODE, { mode: "map" });
      });
    }
  }

  renderCurrentStep() {
    const stage = this.container.querySelector("#learn-stage-container");
    if (!stage) return;

    if (this.hanziEngine) {
      this.hanziEngine.destroy();
      this.hanziEngine = null;
    }

    switch (this.currentStep) {
      case 1:
        this.renderStepPlay(stage);
        break;
      case 2:
        this.renderStepRecognize(stage);
        break;
      case 3:
        this.renderStepPractice(stage);
        break;
      case 4:
        this.renderStepWrite(stage);
        break;
      case 5:
        this.renderStepTestAndChest(stage);
        break;
    }
  }

  // ----------------------------------------------------------------
  // STEP 1: 玩 (8 大汉字专属物理情景交互 + 4 阶段象形蜕变)
  // ----------------------------------------------------------------
  renderStepPlay(stage) {
    const char = this.charData;
    let guide = "";
    let sceneHTML = "";

    // 为不同汉字定制专属情景
    switch (char.char) {
      case "日":
        guide = "👇 向上拉动金色法绳，升起灿烂红日！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-36 h-36 rounded-full bg-gradient-to-tr from-yellow-300 via-orange-400 to-red-500 shadow-[0_0_70px_rgba(255,160,0,1)] flex items-center justify-center text-7xl text-white font-black border-4 border-white transition-all duration-1000 transform translate-y-16 scale-75">
              🌞
            </div>
            <div class="w-2.5 h-28 bg-amber-800 border-2 border-yellow-300 rounded-full flex items-center justify-center mt-2 animate-pulse">
              <div class="w-8 h-8 rounded-full bg-yellow-400 border-2 border-white shadow-xl flex items-center justify-center text-xs">
                ✊
              </div>
            </div>
          </div>
        `;
        break;
      case "月":
        guide = "👇 划动手指擦除夜空乌云，找到皎洁月亮！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-40 h-40 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center text-7xl transition-all duration-1000">
              ☁️🌙
            </div>
            <span class="text-xs text-yellow-200 mt-3 bg-black/40 px-3 py-1 rounded-full border border-white/20">👉 划开云雾</span>
          </div>
        `;
        break;
      case "水":
        guide = "👇 点击疏通清澈泉眼，让甘甜河水奔流！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-40 h-40 rounded-3xl bg-cyan-600/80 border-4 border-cyan-300 shadow-[0_0_50px_rgba(0,188,212,0.8)] flex items-center justify-center text-7xl transition-all duration-1000">
              💧🌊
            </div>
            <span class="text-xs text-cyan-200 mt-3 bg-black/40 px-3 py-1 rounded-full border border-white/20">👉 点击喷泉</span>
          </div>
        `;
        break;
      case "火":
        guide = "👇 快速滑动摩擦取火，点燃温暖的篝火！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-40 h-40 rounded-3xl bg-amber-950 border-4 border-orange-500 shadow-[0_0_50px_rgba(255,87,34,0.8)] flex items-center justify-center text-7xl transition-all duration-1000">
              🪵🔥
            </div>
            <span class="text-xs text-orange-200 mt-3 bg-black/40 px-3 py-1 rounded-full border border-white/20">👉 摩擦点火</span>
          </div>
        `;
        break;
      case "山":
        guide = "👇 依次敲击三块奇石，唤醒巍峨大山！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-44 h-36 rounded-3xl bg-stone-700 border-4 border-stone-400 shadow-[0_0_50px_rgba(100,100,100,0.8)] flex items-center justify-center text-7xl transition-all duration-1000">
              ⛰️
            </div>
            <span class="text-xs text-stone-200 mt-3 bg-black/40 px-3 py-1 rounded-full border border-white/20">👉 敲击唤醒</span>
          </div>
        `;
        break;
      case "木":
        guide = "👇 拖动喷壶给小嫩芽浇水，长成参天大树！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-40 h-40 rounded-3xl bg-emerald-900 border-4 border-emerald-400 shadow-[0_0_50px_rgba(76,175,80,0.8)] flex items-center justify-center text-7xl transition-all duration-1000">
              🌱🌳
            </div>
            <span class="text-xs text-emerald-200 mt-3 bg-black/40 px-3 py-1 rounded-full border border-white/20">👉 浇水成长</span>
          </div>
        `;
        break;
      case "人":
        guide = "👇 帮助小勇士迈开双腿跨栏赛跑！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-40 h-40 rounded-3xl bg-orange-950 border-4 border-orange-400 shadow-[0_0_50px_rgba(255,107,0,0.8)] flex items-center justify-center text-7xl transition-all duration-1000">
              🏃
            </div>
            <span class="text-xs text-orange-200 mt-3 bg-black/40 px-3 py-1 rounded-full border border-white/20">👉 迈步向前</span>
          </div>
        `;
        break;
      case "口":
      default:
        guide = "👇 把美味草莓喂进小怪兽的大嘴巴里！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-40 h-40 rounded-3xl bg-pink-950 border-4 border-pink-400 shadow-[0_0_50px_rgba(233,30,99,0.8)] flex items-center justify-center text-7xl transition-all duration-1000">
              👾🍓
            </div>
            <span class="text-xs text-pink-200 mt-3 bg-black/40 px-3 py-1 rounded-full border border-white/20">👉 喂食大口</span>
          </div>
        `;
        break;
    }

    soundAndFX.speak(guide);

    stage.innerHTML = `
      <div class="relative w-full max-w-4xl h-[480px] bg-gradient-to-b from-sky-400 via-amber-200 to-orange-300 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col items-center justify-between p-6 animate-fade-in text-center">
        
        <!-- 顶部指引横幅 -->
        <div class="relative z-20 bg-black/60 backdrop-blur-md text-yellow-300 border-2 border-yellow-400 font-black text-sm px-6 py-2 rounded-full shadow-2xl animate-bounce-slow">
          ${guide}
        </div>

        <!-- 物理交互中央舞台 -->
        <div id="play-interactive-stage" class="relative z-10 w-full flex-1 flex flex-col items-center justify-center">
          ${sceneHTML}

          <!-- 象形蜕变全屏卡片 (交互完成后显示) -->
          <div id="evolution-reveal-box" class="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center justify-center text-white hidden animate-scale-up z-30">
            <span class="bg-orange-500 text-white font-black text-xs px-4 py-1 rounded-full mb-3 shadow">象形 4 阶段蜕变完成！</span>
            
            <div class="flex items-center gap-6 my-4">
              <div class="flex flex-col items-center">
                <span class="text-xs text-yellow-300 font-bold mb-1">1. 甲骨文字形</span>
                <div class="w-20 h-20 rounded-2xl bg-amber-100 text-amber-950 flex items-center justify-center text-3xl font-black shadow-inner border-2 border-amber-300">
                  ${char.oracleGlyph || char.char}
                </div>
              </div>
              <span class="text-2xl text-orange-400 font-black">➔</span>
              <div class="flex flex-col items-center">
                <span class="text-xs text-yellow-300 font-bold mb-1">2. 小篆演变</span>
                <div class="w-20 h-20 rounded-2xl bg-amber-200 text-amber-950 flex items-center justify-center text-3xl font-black shadow-inner border-2 border-amber-400">
                  ${char.bronzeGlyph || char.char}
                </div>
              </div>
              <span class="text-2xl text-orange-400 font-black">➔</span>
              <div class="flex flex-col items-center">
                <span class="text-xs text-yellow-300 font-bold mb-1">3. 楷体规范字</span>
                <div class="w-24 h-24 rounded-3xl bg-gradient-to-tr from-yellow-400 to-orange-500 text-white flex items-center justify-center text-5xl font-black shadow-2xl border-4 border-white animate-pulse">
                  ${char.char}
                </div>
              </div>
            </div>

            <button id="btn-next-to-rec" class="mt-4 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-black text-sm px-8 py-3 rounded-full shadow-2xl border-2 border-white active:scale-95 transition-transform flex items-center gap-2">
              <span>👀</span> 去【认】字大剧场 ➔
            </button>
          </div>

        </div>

      </div>
    `;

    const actor = stage.querySelector("#interactive-actor");
    const revealBox = stage.querySelector("#evolution-reveal-box");
    const nextBtn = stage.querySelector("#btn-next-to-rec");
    const targetAnim = stage.querySelector("#play-target-anim");

    if (actor) {
      this._on(actor, "click", () => {
        soundAndFX.playSuccessSound();
        soundAndFX.triggerConfetti(this.container);
        if (targetAnim) {
          targetAnim.classList.remove("translate-y-16", "scale-75");
          targetAnim.classList.add("scale-125", "rotate-12");
        }

        this._timeout(() => {
          soundAndFX.speak(`太棒啦！古人根据这个形状，创造出了“${char.char}”字！`);
          if (revealBox) revealBox.classList.remove("hidden");
        }, 1200);
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
  // ----------------------------------------------------------------
  renderStepRecognize(stage) {
    const char = this.charData;
    soundAndFX.speak(`认一认：“${char.char}”，拼音读作 ${char.pinyin}。点击大字听发音！`);

    stage.innerHTML = `
      <div class="relative w-full max-w-4xl h-[480px] bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex items-center justify-between p-8 animate-fade-in select-none">
        
        <!-- 左侧：3D 果冻大字交互展示 -->
        <div class="flex-1 flex flex-col items-center justify-center">
          <div class="text-4xl text-yellow-300 font-black tracking-widest mb-3 bg-black/40 px-6 py-1.5 rounded-full border border-white/20 animate-pulse">
            ${char.pinyin}
          </div>

          <button id="btn-jelly-char" class="relative group w-48 h-48 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 border-4 border-white shadow-[0_0_60px_rgba(255,160,0,0.8)] flex items-center justify-center text-8xl font-black text-white active:scale-90 transition-transform cursor-pointer animate-bounce-cathy">
            ${char.char}
            <div class="absolute -bottom-2 bg-amber-900 text-yellow-200 text-[10px] font-black px-3 py-0.5 rounded-full border border-yellow-400">
              点击发音 ${window.GAME_ICONS ? window.GAME_ICONS.speaker("w-4 h-4 inline-block") : ""}
            </div>
          </button>

          <div class="flex items-center gap-3 mt-6">
            <span class="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full border border-white/30">部首：${char.radical}</span>
            <span class="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full border border-white/30">笔画：${char.strokeCount}画</span>
          </div>
        </div>

        <!-- 右侧：词语百宝箱与生活例句卡 -->
        <div class="w-80 flex flex-col justify-between h-full bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/30">
          <div>
            <h3 class="text-xs font-black text-yellow-300 mb-3 flex items-center gap-1.5">
              <span class="flex items-center">${GAME_ICONS.chest("w-4 h-4")}</span>
              <span>常用词语拓展：</span>
            </h3>
            
            <div class="flex flex-col gap-2.5">
              ${char.words
                .map(
                  (w) => `
                <button class="word-balloon-btn p-3 bg-gradient-to-r from-amber-50 to-orange-100 hover:from-yellow-200 hover:to-orange-300 rounded-2xl border-2 border-amber-300 text-left flex items-center justify-between shadow-md active:scale-95 transition-all" data-word="${w.word}">
                  <div>
                    <span class="text-xs font-bold text-amber-700">${w.pinyin}</span>
                    <h4 class="text-base font-black text-amber-950">${w.word}</h4>
                  </div>
                  <span class="text-xl">${window.GAME_ICONS ? window.GAME_ICONS.speaker("w-4 h-4 inline-block") : ""}</span>
                </button>
              `
                )
                .join("")}
            </div>

            <div class="mt-4 p-3 bg-black/40 rounded-2xl border border-white/20 text-xs text-yellow-200 font-semibold leading-relaxed">
              ${window.GAME_ICONS ? window.GAME_ICONS.pen("w-4 h-4 inline-block") : ""} <span class="text-white font-bold">造句：</span>${char.sentence}
            </div>
          </div>

          <button id="btn-finish-rec-step" class="mt-4 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm py-3 rounded-full shadow-lg border border-white active:scale-95 transition-all flex items-center justify-center gap-2">
            <span>${window.GAME_ICONS ? window.GAME_ICONS.star("w-4 h-4 inline-block") : ""}</span> 开启【读】字评测 ➔
          </button>
        </div>

      </div>
    `;

    const jellyBtn = stage.querySelector("#btn-jelly-char");
    if (jellyBtn) {
      this._on(jellyBtn, "click", () => {
        soundAndFX.playJellyBoing();
        soundAndFX.speak(`${char.char}，${char.pinyin}`);
        jellyBtn.classList.add("scale-110", "rotate-3");
        this._timeout(() => jellyBtn.classList.remove("scale-110", "rotate-3"), 250);
      });
    }

    stage.querySelectorAll(".word-balloon-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        const word = btn.dataset.word;
        soundAndFX.playPop();
        soundAndFX.speak(word);
      });
    });

    const finishBtn = stage.querySelector("#btn-finish-rec-step");
    if (finishBtn) {
      this._on(finishBtn, "click", () => {
        soundAndFX.playPop();
        this.currentStep = 3;
        this.render();
      });
    }
  }


  // ----------------------------------------------------------------
  // STEP 3: 读 (智能语音评测)
  // ----------------------------------------------------------------
  renderStepRead(stage) {
    const char = this.charData;
    
    // Fallback if pronunciationEval is not globally available yet
    // Since we'll import it at the top of the file
    
    stage.innerHTML = `
      <div class="relative w-full max-w-4xl h-[480px] bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-sky-300 flex items-center justify-between p-8 animate-fade-in select-none">
        
        <div class="flex-1 flex flex-col items-center justify-center">
          <div class="text-xl text-sky-200 font-black tracking-widest mb-6">
            请大声朗读这个字
          </div>

          <div class="relative w-48 h-48 rounded-full bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 border-4 border-white shadow-[0_0_60px_rgba(56,189,248,0.8)] flex items-center justify-center text-8xl font-black text-white">
            ${char.char}
          </div>
          
          <div id="read-score-display" class="mt-8 text-3xl font-black text-yellow-300 opacity-0 transition-opacity">
            评分: <span id="read-score-num">0</span> 分！
          </div>
        </div>

        <div class="w-80 flex flex-col justify-between h-full bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/30 text-center">
          <div>
            <h3 class="text-sm font-black text-white mb-6">语音评测挑战</h3>
            <p class="text-xs text-sky-200 mb-8 leading-relaxed">
              点击下方按钮，对着麦克风大声朗读“<strong class="text-yellow-300 text-base">${char.char}</strong>”。凯茜会为你打分哦！
            </p>
            
            <button id="btn-start-record" class="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-rose-400 to-red-500 shadow-[0_10px_20px_rgba(244,63,94,0.6)] flex items-center justify-center border-4 border-white active:scale-90 transition-all hover:scale-105">
               <div class="w-12 h-12">${window.GAME_ICONS ? window.GAME_ICONS.audio("w-full h-full") : "🎤"}</div>
            </button>
            <div id="record-status" class="mt-4 text-xs font-bold text-rose-200">
              点击开始录音
            </div>
          </div>

          <button id="btn-finish-read-step" class="mt-4 w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white font-black text-sm py-3 rounded-full shadow-lg border border-white active:scale-95 transition-all flex items-center justify-center gap-2 opacity-50 pointer-events-none">
            <span>${window.GAME_ICONS ? window.GAME_ICONS.sparkle("w-4 h-4 inline-block") : ""}</span> 去【练】字小游戏 ➔
          </button>
        </div>

      </div>
    `;

    const btnRecord = stage.querySelector("#btn-start-record");
    const statusTxt = stage.querySelector("#record-status");
    const finishBtn = stage.querySelector("#btn-finish-read-step");
    const scoreDisplay = stage.querySelector("#read-score-display");
    const scoreNum = stage.querySelector("#read-score-num");
    
    let isRecording = false;

    this._on(btnRecord, "click", async () => {
      if (typeof window.pronunciationEval === 'undefined') {
        import('../utils/pronunciationEval.js').then(m => {
           window.pronunciationEval = m.pronunciationEval || m.default;
           this.handleRecordToggle(btnRecord, statusTxt, finishBtn, scoreDisplay, scoreNum);
        });
      } else {
        this.handleRecordToggle(btnRecord, statusTxt, finishBtn, scoreDisplay, scoreNum);
      }
    });

    this._on(finishBtn, "click", () => {
      window.soundAndFX.playPop();
      this.currentStep = 6;
      this.render();
    });
  }

  async handleRecordToggle(btnRecord, statusTxt, finishBtn, scoreDisplay, scoreNum) {
    const char = this.charData;
    const pe = window.pronunciationEval;
    
    if (!pe) return;

    if (pe.state === "IDLE" || pe.state === "RESULT" || pe.state === "ERROR") {
      // Start
      window.soundAndFX.playPop();
      statusTxt.textContent = "正在聆听...";
      statusTxt.classList.replace("text-rose-200", "text-emerald-300");
      btnRecord.classList.add("animate-pulse", "ring-4", "ring-emerald-400");
      
      scoreDisplay.classList.remove("opacity-100");
      scoreDisplay.classList.add("opacity-0");

      try {
        await pe.startEvaluation({ text: char.char });
      } catch (e) {
        statusTxt.textContent = "麦克风权限失败";
        btnRecord.classList.remove("animate-pulse", "ring-4", "ring-emerald-400");
      }
      
      // Auto stop after 3 seconds for kids
      this._timeout(async () => {
         if (pe.state === "LISTENING") {
            statusTxt.textContent = "评测中...";
            btnRecord.classList.remove("animate-pulse", "ring-4", "ring-emerald-400");
            try {
               await pe.stopAndEvaluate();
            } catch (e) {}
         }
      }, 3000);
      
    }
    
    // Listen to events
    if (!this._evalListenerBound) {
      this._evalListenerBound = true;
      window.eventBus.on("AUDIO_EVAL_RESULT", (res) => {
         if (this.currentStep !== 3) return; // Prevent memory leak cross-screens
         
         const score = res.totalScore || 0;
         scoreNum.textContent = score;
         scoreDisplay.classList.remove("opacity-0");
         scoreDisplay.classList.add("opacity-100");
         
         statusTxt.textContent = score >= 80 ? "太棒了！发音很准！" : "再试一次吧！";
         statusTxt.classList.replace("text-emerald-300", "text-yellow-300");
         
         if (score >= 60) {
            window.soundAndFX.playSuccessSound();
            finishBtn.classList.remove("opacity-50", "pointer-events-none");
         } else {
            window.soundAndFX.playEncouragement();
         }
         btnRecord.classList.remove("animate-pulse", "ring-4", "ring-emerald-400");
      });
      
      window.eventBus.on("AUDIO_EVAL_ERROR", () => {
         if (this.currentStep !== 3) return;
         statusTxt.textContent = "录音失败，点击重试";
         btnRecord.classList.remove("animate-pulse", "ring-4", "ring-emerald-400");
      });
    }
  }

  // ----------------------------------------------------------------
  // STEP 4: 练 — 太空飞船射击小游戏
  // ----------------------------------------------------------------
  renderStepPractice(stage) {
    const char = this.charData;
    let hitCount = 0;
    const targetHits = 3;

    soundAndFX.speak(`瞄准射击！请击中带有“${char.char}”字的太空发光气球！`);

    stage.innerHTML = `
      <div class="relative w-full max-w-4xl h-[480px] bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col justify-between p-6 animate-fade-in select-none">
        
        <div class="w-full flex items-center justify-between bg-black/60 px-6 py-2.5 rounded-full border border-white/30 text-white">
          <div class="flex items-center gap-2 text-xs font-black text-yellow-300">
            <span>${window.GAME_ICONS ? window.GAME_ICONS.star("w-4 h-4 inline-block") : ""} 目标字：</span>
            <span class="text-xl text-orange-400 bg-black/50 px-3 py-0.5 rounded-xl border border-orange-500">${char.char}</span>
          </div>

          <div class="text-xs font-black text-cyan-300">
            ${window.GAME_ICONS ? window.GAME_ICONS.sparkle("w-4 h-4 inline-block") : ""} 命中进度: <span id="game-hit-progress" class="text-yellow-400 text-base font-black">0 / ${targetHits}</span>
          </div>
        </div>

        <div id="space-shooting-range" class="relative w-full flex-1 flex items-center justify-around my-4">
          ${(char.gameConfig && char.gameConfig.options ? char.gameConfig.options : [char.char, "月", "山"])
            .map(
              (opt, idx) => `
            <button class="balloon-target-btn relative group w-28 h-36 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200 border-4 border-white shadow-[0_0_30px_rgba(255,160,0,0.6)] flex flex-col items-center justify-center active:scale-75 transition-all duration-300 animate-bounce-slow" style="animation-delay: ${
              idx * 0.3
            }s" data-char="${opt}">
              <span class="text-5xl font-black text-amber-950 drop-shadow">${opt}</span>
              <div class="w-1.5 h-12 bg-white/40 absolute -bottom-10 rounded-full"></div>
            </button>
          `
            )
            .join("")}
        </div>

        <div class="w-full flex items-center justify-center">
          <div class="text-2xl text-yellow-300 font-black animate-bounce-cathy flex items-center gap-2">
            <span>${window.GAME_ICONS ? window.GAME_ICONS.sparkle("w-4 h-4 inline-block") : ""} 凯茜激光战机准备就绪！</span>
          </div>
        </div>

        <div id="practice-win-modal" class="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-white hidden animate-scale-up z-40">
          <div class="flex items-center gap-2 mb-3">
            <span class="flex items-center">${GAME_ICONS.star("w-12 h-12", true)}</span>
            <span class="flex items-center">${GAME_ICONS.star("w-16 h-16", true)}</span>
            <span class="flex items-center">${GAME_ICONS.star("w-12 h-12", true)}</span>
          </div>
          <h2 class="text-2xl font-black text-yellow-300 mb-2">神枪手！射击挑战大满贯！</h2>
          <p class="text-xs text-gray-300 mb-6 font-semibold">你已经彻底掌握了“${char.char}”字的辨识与发音！</p>
          <button id="btn-next-to-write" class="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-black text-sm px-10 py-3.5 rounded-full shadow-2xl border-2 border-white active:scale-95 transition-transform flex items-center gap-2">
            <span>✍️</span> 去【写】字小画堂 ➔
          </button>
        </div>

      </div>
    `;

    const progressText = stage.querySelector("#game-hit-progress");
    const winModal = stage.querySelector("#practice-win-modal");
    const nextBtn = stage.querySelector("#btn-next-to-write");

    stage.querySelectorAll(".balloon-target-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        const val = btn.dataset.char;
        if (val === char.char) {
          hitCount++;
          soundAndFX.playLaserShoot();
          soundAndFX.playPop();
          soundAndFX.triggerConfetti(this.container);

          btn.classList.add("scale-150", "opacity-0");
          this._timeout(() => btn.classList.remove("scale-150", "opacity-0"), 600);

          if (progressText) progressText.textContent = `${hitCount} / ${targetHits}`;

          if (hitCount >= targetHits) {
            soundAndFX.playVictoryFanfare();
            this._timeout(() => {
              if (winModal) winModal.classList.remove("hidden");
            }, 600);
          }
        } else {
          soundAndFX.playSoftError();
          btn.classList.add("animate-shake");
          this._timeout(() => btn.classList.remove("animate-shake"), 500);
        }
      });
    });

    if (nextBtn) {
      this._on(nextBtn, "click", () => {
        soundAndFX.playPop();
        this.currentStep = 6;
        this.render();
      });
    }
  }

  // ----------------------------------------------------------------
  // STEP 5: 写 (AI 魔法星光毛笔描红 + 倒笔画拦截)
  // ----------------------------------------------------------------
  renderStepWrite(stage) {
    const char = this.charData;
    soundAndFX.speak(`魔法毛笔描红！请从发光起点开始，按照笔顺书写“${char.char}”字！`);

    stage.innerHTML = `
      <div class="relative w-full max-w-4xl h-[480px] bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex items-center justify-between p-8 animate-fade-in">
        
        <div class="flex-1 flex flex-col items-center justify-center">
          <div class="relative w-[340px] h-[340px] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400 bg-white">
            <canvas id="hanzi-magic-canvas" class="w-full h-full cursor-crosshair"></canvas>
          </div>
        </div>

        <div class="w-72 flex flex-col justify-between h-full bg-white/80 backdrop-blur-md rounded-3xl p-6 border-2 border-amber-200 shadow-xl text-center">
          <div>
            <span class="bg-amber-100 text-amber-800 text-xs font-black px-4 py-1 rounded-full mb-3 inline-block">
              ✍️ 魔法星光笔描红
            </span>
            <h3 class="text-lg font-black text-amber-950 mb-2">规范笔顺写好字</h3>
            <p class="text-xs text-gray-600 leading-relaxed font-semibold">
              ${window.GAME_ICONS ? window.GAME_ICONS.sparkle("w-4 h-4 inline-block") : ""} 沿黄色魔法光球滑行，遇到倒笔画系统会自动提示并拦截哦！
            </p>
          </div>

          <div class="flex flex-col gap-3">
            <button id="btn-reset-write" class="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs py-3 rounded-full shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5">
              <span>🔄</span> 重新书写这一字
            </button>

            <button id="btn-finish-write-step" class="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm py-3.5 rounded-full shadow-xl border border-white active:scale-95 transition-all flex items-center justify-center gap-2 hidden animate-bounce-slow">
              <span class="flex items-center">${GAME_ICONS.chest("w-5 h-5")}</span>
              <span>书写满分！去开宝箱 ➔</span>
            </button>
          </div>
        </div>

      </div>
    `;

    const canvas = stage.querySelector("#hanzi-magic-canvas");
    const nextBtn = stage.querySelector("#btn-finish-write-step");
    const resetBtn = stage.querySelector("#btn-reset-write");

    this.hanziEngine = new HanziEngine(canvas, char, () => {
      soundAndFX.triggerConfetti(this.container);
      if (nextBtn) nextBtn.classList.remove("hidden");
    });

    if (resetBtn) {
      this._on(resetBtn, "click", () => {
        soundAndFX.playPop();
        if (this.hanziEngine) this.hanziEngine.reset();
        if (nextBtn) nextBtn.classList.add("hidden");
      });
    }

    if (nextBtn) {
      this._on(nextBtn, "click", () => {
        soundAndFX.playPop();
        this.currentStep = 6;
        this.render();
      });
    }
  }

  // ----------------------------------------------------------------
  // STEP 6: 测 & 华丽黄金宝箱结算 (Duang! Duang! Duang! 飞星)
  // ----------------------------------------------------------------
  renderStepTestAndChest(stage) {
    const char = this.charData;

    stage.innerHTML = `
      <div class="relative w-full max-w-4xl h-[480px] bg-gradient-to-b from-purple-950 via-indigo-950 to-purple-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col items-center justify-center p-8 animate-fade-in text-center text-white">
        
        <div id="golden-chest-stage" class="flex flex-col items-center">
          
          <!-- 三颗金色大星槽 (Duang! Duang! Duang!) -->
          <div class="flex items-center gap-4 mb-4">
            <div id="star-slot-1" class="w-14 h-14 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center transition-all duration-500">
              <span class="flex items-center">${GAME_ICONS.star("w-8 h-8", false)}</span>
            </div>
            <div id="star-slot-2" class="w-16 h-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center -translate-y-2 transition-all duration-500">
              <span class="flex items-center">${GAME_ICONS.star("w-10 h-10", false)}</span>
            </div>
            <div id="star-slot-3" class="w-14 h-14 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center transition-all duration-500">
              <span class="flex items-center">${GAME_ICONS.star("w-8 h-8", false)}</span>
            </div>
          </div>

          <!-- 黄金大宝箱 (点击开启) -->
          <button id="btn-open-golden-chest" class="group relative w-36 h-36 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 border-4 border-white shadow-[0_0_60px_rgba(255,235,59,0.8)] flex items-center justify-center active:scale-90 transition-transform cursor-pointer animate-bounce-slow">
            <span class="flex items-center">${GAME_ICONS.chest("w-20 h-20")}</span>
            <div class="absolute -bottom-3 bg-red-600 text-white font-black text-xs px-4 py-1 rounded-full shadow-lg border border-white">
              点击开启通关宝箱！
            </div>
          </button>

          <h2 class="text-xl font-black text-yellow-300 mt-6 mb-1">
            恭喜凯茜小勇士！通关“${char.char}”字大冒险！
          </h2>
        </div>

        <div id="chest-reward-card" class="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center justify-center text-white hidden animate-scale-up z-30">
          <div class="w-24 h-24 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 border-4 border-white text-6xl font-black flex items-center justify-center shadow-2xl mb-4 animate-bounce-cathy">
            ${char.char}
          </div>

          <h2 class="text-2xl font-black text-yellow-300 mb-1">获得全新专属字卡：【${char.char}】</h2>
          <p class="text-xs text-gray-300 mb-4 flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.coin("w-4 h-4")} 获得 10 凯茜星币</span>
            <span class="flex items-center">${GAME_ICONS.star("w-4 h-4", true)} 3 颗凯茜之星</span>
          </p>

          <button id="btn-confirm-return-map" class="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-black text-base px-12 py-3.5 rounded-full shadow-[0_0_40px_rgba(255,107,0,0.9)] border-2 border-white active:scale-95 transition-transform">
            🎉 收入生词本，返回大地图
          </button>
        </div>

      </div>
    `;

    const chestBtn = stage.querySelector("#btn-open-golden-chest");
    const rewardCard = stage.querySelector("#chest-reward-card");
    const returnBtn = stage.querySelector("#btn-confirm-return-map");

    const star1 = stage.querySelector("#star-slot-1");
    const star2 = stage.querySelector("#star-slot-2");
    const star3 = stage.querySelector("#star-slot-3");

    if (chestBtn) {
      this._on(chestBtn, "click", () => {
        soundAndFX.playChestOpen();
        soundAndFX.playVictoryFanfare();
        soundAndFX.triggerConfetti(this.container);
        soundAndFX.triggerCoinFly(this.container);

        // Duang! Duang! Duang! 依次点亮三星
        this._timeout(() => {
          soundAndFX.playStarEarned(1);
          if (star1) {
            star1.innerHTML = `<span class="flex items-center">${GAME_ICONS.star("w-8 h-8", true)}</span>`;
            star1.classList.add("bg-yellow-400", "scale-125", "shadow-[0_0_20px_rgba(255,235,59,1)]");
          }
        }, 200);

        this._timeout(() => {
          soundAndFX.playStarEarned(2);
          if (star2) {
            star2.innerHTML = `<span class="flex items-center">${GAME_ICONS.star("w-10 h-10", true)}</span>`;
            star2.classList.add("bg-yellow-400", "scale-125", "shadow-[0_0_20px_rgba(255,235,59,1)]");
          }
        }, 600);

        this._timeout(() => {
          soundAndFX.playStarEarned(3);
          if (star3) {
            star3.innerHTML = `<span class="flex items-center">${GAME_ICONS.star("w-8 h-8", true)}</span>`;
            star3.classList.add("bg-yellow-400", "scale-125", "shadow-[0_0_20px_rgba(255,235,59,1)]");
          }
        }, 1000);

        this._timeout(() => {
          if (rewardCard) rewardCard.classList.remove("hidden");
          ebbinghausManager.completeCharacter(char.id, 3);
          this._busEmit(EVENTS.LEARN_FINISH, { charId: char.id, stars: 3 });
        }, 1400);
      });
    }

    if (returnBtn) {
      this._on(returnBtn, "click", () => {
        soundAndFX.playPop();
        if (this.onFinish) this.onFinish();
        else this._busEmit(EVENTS.SWITCH_MODE, { mode: "map" });
      });
    }
  }
}
