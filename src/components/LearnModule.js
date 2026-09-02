/**
 * 凯茜识字 (Cathy Literacy) - 1:1 沉浸式六步闭环教学引擎
 * 核心特色：
 * 1. 玩：8大汉字专属物理情景交互 + 4阶段象形蜕变
 * 2. 认：3D Q弹果冻大字 + 偏旁部首拆解 + 词组例句实物小剧场
 * 3. 读：智能语音评测 + 麦克风动态声浪与倒计时 + 真实打分 + 双轨发音对比
 * 4. 练：太空战机激光射击 / 飞翔气球小游戏
 * 5. 写：AI 魔法星光毛笔描红 + 严格倒笔画阻断拦截 + 全屏 Confetti 礼炮
 * 6. 测：闪电速测 + 黄金宝箱降落 + 三星飞入“Duang! Duang! Duang!”
 */

import { HanziEngine } from "../utils/hanziEngine.js";
import { soundAndFX } from "../utils/soundEngine.js";
import { ebbinghausManager } from "../utils/ebbinghaus.js";
import { BaseModule } from "../utils/BaseModule.js";
import { EVENTS } from "../utils/eventBus.js";
import { GAME_ICONS } from "../utils/gameIcons.js";
import { pronunciationEval } from "../utils/pronunciationEval.js";

export class LearnModule extends BaseModule {
  constructor(container, charData, onFinishCallback, onBackToMapCallback) {
    super(container);
    this.charData = charData;
    this.onFinish = onFinishCallback;
    this.onBackToMap = onBackToMapCallback;

    this.currentStep = 1; // 1:玩, 2:认, 3:读, 4:练, 5:写, 6:测
    this.hanziEngine = null;
    this._isRecordingTransition = false;
  }

  destroy() {
    if (this.hanziEngine) {
      this.hanziEngine.destroy();
      this.hanziEngine = null;
    }
    if (this.drillEngine) {
      this.drillEngine = null;
    }
    super.destroy();
  }

  render() {
    this.destroy();

    const __lnProgress = ebbinghausManager.progress;
    const __lnSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker(true) : GAME_ICONS.speaker(false);

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
        
        <!-- 1. 顶部悬浮控制栏与五步水晶进度条 -->
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/20">
          
          <!-- 返回地图按钮 -->
          <button id="btn-learn-back-map" class="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-xs px-4 py-2 rounded-full shadow-xl border-2 border-white/80 active:scale-95 transition-transform">
            <span class="flex items-center">${GAME_ICONS.home()}</span>
            <span>返回地图</span>
          </button>

          <!-- 六步发光水晶连珠 (玩认读练写测) -->
          <div class="flex items-center gap-2.5 bg-black/60 px-5 py-1.5 rounded-full border border-white/30 shadow-2xl">
            ${[
              { step: 1, name: "玩", iconSvg: (cls) => GAME_ICONS.gem(cls) },
              { step: 2, name: "认", iconSvg: (cls) => GAME_ICONS.cards(cls) },
              { step: 3, name: "读", iconSvg: (cls) => GAME_ICONS.speaker(cls) },
              { step: 4, name: "练", iconSvg: (cls) => GAME_ICONS.arcade(cls) },
              { step: 5, name: "写", iconSvg: (cls) => GAME_ICONS.brush(cls) },
              { step: 6, name: "测", iconSvg: (cls) => GAME_ICONS.chest(cls) }
            ]
              .map(
                (s) => `
              <div class="flex items-center gap-1">
                <div class="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 ${
                  s.step === this.currentStep
                    ? "bg-gradient-to-tr from-yellow-300 via-orange-500 to-red-500 text-white shadow-[0_0_15px_rgba(255,160,0,0.9)] scale-125 ring-4 ring-yellow-300/80 animate-pulse"
                    : s.step < this.currentStep
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-white/20 text-white/40"
                }">
                  ${s.step < this.currentStep ? `<span class="flex items-center">${GAME_ICONS.star(true)}</span>` : `<span class="flex items-center">${s.iconSvg("w-3.5 h-3.5")}</span>`}
                </div>
                <span class="text-xs font-black ${s.step === this.currentStep ? "text-yellow-300 drop-shadow" : "text-white/60"}">${s.name}</span>
                ${s.step < 6 ? `<div class="w-3 h-0.5 ${s.step < this.currentStep ? "bg-emerald-400" : "bg-white/20"}"></div>` : ""}
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
              ${GAME_ICONS.coin()}<span>${__lnProgress.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full bg-black/40 border border-white/30">
              ${GAME_ICONS.star(false)}<span>${__lnProgress.stars}</span>
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

    const soundBtn = this.container.querySelector("#btn-learn-sound");
    if (soundBtn) {
      this._on(soundBtn, "click", () => {
        const muted = soundAndFX.toggleMute();
        soundBtn.innerHTML = muted ? GAME_ICONS.speaker(true) : GAME_ICONS.speaker(false);
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
        this.renderStepRead(stage);
        break;
      case 4:
        this.renderStepPractice(stage);
        break;
      case 5:
        this.renderStepWrite(stage);
        break;
      case 6:
        this.renderStepTestAndChest(stage);
        break;
    }
  }

  // ----------------------------------------------------------------
  // STEP 1: 玩 (专属物理情景交互 + 4 阶段象形蜕变)
  // ----------------------------------------------------------------
  renderStepPlay(stage) {
    const char = this.charData;
    let guide = "";
    let sceneHTML = "";

    // 为不同汉字定制专属情景
    switch (char.char) {
      case "日":
        guide = "向上拉动金色法绳，升起灿烂红日！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-gradient-to-tr from-yellow-300 via-orange-400 to-red-500 shadow-[0_0_70px_rgba(255,160,0,1)] flex items-center justify-center text-8xl sm:text-9xl text-white font-black border-4 border-white transition-all duration-1000 transform translate-y-16 scale-75">
              ${char.oracleGlyph || "日"}
            </div>
            <div class="w-2.5 h-28 bg-amber-800 border-2 border-yellow-300 rounded-full flex items-center justify-center mt-2 animate-pulse">
              <div class="w-8 h-8 rounded-full bg-yellow-400 border-2 border-white shadow-xl flex items-center justify-center text-xs">
                ${GAME_ICONS.sparkle()}
              </div>
            </div>
          </div>
        `;
        break;
      case "月":
        guide = "划动手指擦除夜空乌云，找到皎洁月亮！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center text-8xl sm:text-9xl text-yellow-300 font-black transition-all duration-1000">
              ${char.oracleGlyph || "月"}
            </div>
            <span class="text-xs text-yellow-200 mt-3 bg-black/40 px-3 py-1 rounded-full border border-white/20">划开云雾</span>
          </div>
        `;
        break;
      case "水":
        guide = "点击疏通清澈泉眼，让甘甜河水奔流！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-52 h-52 sm:w-60 sm:h-60 rounded-3xl bg-cyan-600/80 border-4 border-cyan-300 shadow-[0_0_50px_rgba(0,188,212,0.8)] flex items-center justify-center text-8xl sm:text-9xl text-white font-black transition-all duration-1000">
              ${char.oracleGlyph || "水"}
            </div>
            <span class="text-xs text-cyan-200 mt-3 bg-black/40 px-3 py-1 rounded-full border border-white/20">点击喷泉</span>
          </div>
        `;
        break;
      case "火":
        guide = "快速滑动摩擦取火，点燃温暖的篝火！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-52 h-52 sm:w-60 sm:h-60 rounded-3xl bg-amber-950 border-4 border-orange-500 shadow-[0_0_50px_rgba(255,87,34,0.8)] flex items-center justify-center text-8xl sm:text-9xl text-yellow-400 font-black transition-all duration-1000">
              ${char.oracleGlyph || "火"}
            </div>
            <span class="text-xs text-orange-200 mt-3 bg-black/40 px-3 py-1 rounded-full border border-white/20">摩擦点火</span>
          </div>
        `;
        break;
      case "山":
        guide = "依次敲击三块奇石，唤醒巍峨大山！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-56 h-48 sm:w-64 sm:h-52 rounded-3xl bg-stone-700 border-4 border-stone-400 shadow-[0_0_50px_rgba(100,100,100,0.8)] flex items-center justify-center text-8xl sm:text-9xl text-amber-200 font-black transition-all duration-1000">
              ${char.oracleGlyph || "山"}
            </div>
            <span class="text-xs text-stone-200 mt-3 bg-black/40 px-3 py-1 rounded-full border border-white/20">敲击唤醒</span>
          </div>
        `;
        break;
      case "木":
        guide = "拖动喷壶给小嫩芽浇水，长成参天大树！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-52 h-52 sm:w-60 sm:h-60 rounded-3xl bg-emerald-900 border-4 border-emerald-400 shadow-[0_0_50px_rgba(76,175,80,0.8)] flex items-center justify-center text-8xl sm:text-9xl text-emerald-200 font-black transition-all duration-1000">
              ${char.oracleGlyph || "木"}
            </div>
            <span class="text-xs text-emerald-200 mt-3 bg-black/40 px-3 py-1 rounded-full border border-white/20">浇水成长</span>
          </div>
        `;
        break;
      case "人":
        guide = "帮助小勇士迈开双腿跨栏赛跑！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-52 h-52 sm:w-60 sm:h-60 rounded-3xl bg-orange-950 border-4 border-orange-400 shadow-[0_0_50px_rgba(255,107,0,0.8)] flex items-center justify-center text-8xl sm:text-9xl text-yellow-300 font-black transition-all duration-1000">
              ${char.oracleGlyph || "人"}
            </div>
            <span class="text-xs text-orange-200 mt-3 bg-black/40 px-3 py-1 rounded-full border border-white/20">迈步向前</span>
          </div>
        `;
        break;
      case "口":
        guide = "把美味草莓喂进小怪兽的大嘴巴里！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-52 h-52 sm:w-60 sm:h-60 rounded-3xl bg-pink-950 border-4 border-pink-400 shadow-[0_0_50px_rgba(233,30,99,0.8)] flex items-center justify-center text-8xl sm:text-9xl text-pink-200 font-black transition-all duration-1000">
              ${char.oracleGlyph || "口"}
            </div>
            <span class="text-xs text-pink-200 mt-3 bg-black/40 px-3 py-1 rounded-full border border-white/20">喂食大口</span>
          </div>
        `;
        break;
      case "春":
        guide = "轻抚大地唤醒春风，吹绿大树萌发嫩芽！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-52 h-52 sm:w-60 sm:h-60 rounded-3xl bg-emerald-700 border-4 border-emerald-300 shadow-[0_0_50px_rgba(16,185,129,0.8)] flex items-center justify-center text-8xl sm:text-9xl text-emerald-100 font-black transition-all duration-1000">
              ${char.oracleGlyph || "春"}
            </div>
            <span class="text-xs text-emerald-200 mt-3 bg-black/40 px-3 py-1 rounded-full border border-white/20">迎春拂晓</span>
          </div>
        `;
        break;
      case "冬":
        guide = "滚动雪球堆起可爱的冬日小雪人！";
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-52 h-52 sm:w-60 sm:h-60 rounded-3xl bg-sky-900 border-4 border-cyan-300 shadow-[0_0_50px_rgba(56,189,248,0.8)] flex items-center justify-center text-8xl sm:text-9xl text-sky-100 font-black transition-all duration-1000">
              ${char.oracleGlyph || "冬"}
            </div>
            <span class="text-xs text-sky-200 mt-3 bg-black/40 px-3 py-1 rounded-full border border-white/20">堆小雪人</span>
          </div>
        `;
        break;
      default:
        guide = `点击神奇魔法光球，探索“${char.char}”字的古老起源！`;
        sceneHTML = `
          <div id="interactive-actor" class="relative flex flex-col items-center cursor-pointer group">
            <div id="play-target-anim" class="w-52 h-52 sm:w-60 sm:h-60 rounded-3xl bg-gradient-to-tr from-amber-600 to-orange-500 border-4 border-amber-300 shadow-[0_0_50px_rgba(245,158,11,0.8)] flex items-center justify-center text-8xl sm:text-9xl text-white font-black transition-all duration-1000">
              ${char.oracleGlyph || char.char}
            </div>
            <span class="text-xs text-yellow-200 mt-3 bg-black/40 px-3 py-1 rounded-full border border-white/20">点击解密起源</span>
          </div>
        `;
        break;
    }

    soundAndFX.speakPriority(guide, { kind: "sentence", priority: 1 });

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-sky-400 via-amber-200 to-orange-300 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col items-center justify-between p-6 animate-fade-in text-center">
        
        <!-- 顶部指引横幅 -->
        <div class="relative z-20 bg-black/60 backdrop-blur-md text-yellow-300 border-2 border-yellow-400 font-black text-sm px-6 py-2 rounded-full shadow-2xl animate-bounce-slow">
          ${guide}
        </div>

        <!-- 物理交互中央舞台 -->
        <div id="play-interactive-stage" class="relative z-10 w-full flex-1 flex flex-col items-center justify-center">
          ${sceneHTML}

          <!-- 象形蜕变全屏卡片 (交互完成后显示) -->
          <div id="evolution-reveal-box" class="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center justify-center text-white hidden animate-scale-up z-30">
            <span class="bg-orange-500 text-white font-black text-xs px-4 py-1 rounded-full mb-3 shadow">象形 3 阶段蜕变完成！</span>
            
            <div class="flex items-center gap-6 my-4">
              <div class="flex flex-col items-center">
                <span class="text-xs text-yellow-300 font-bold mb-1">1. 甲骨文</span>
                <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-amber-100 text-amber-950 flex items-center justify-center text-5xl sm:text-6xl font-black shadow-inner border-2 border-amber-300">
                  ${char.oracleGlyph || char.char}
                </div>
              </div>
              <span class="text-2xl text-orange-400 font-black">-&gt;</span>
              <div class="flex flex-col items-center">
                <span class="text-xs text-yellow-300 font-bold mb-1">2. 小篆</span>
                <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-amber-200 text-amber-950 flex items-center justify-center text-5xl sm:text-6xl font-black shadow-inner border-2 border-amber-400">
                  ${char.bronzeGlyph || char.char}
                </div>
              </div>
              <span class="text-2xl text-orange-400 font-black">-&gt;</span>
              <div class="flex flex-col items-center">
                <span class="text-xs text-yellow-300 font-bold mb-1">3. 楷体规范字</span>
                <div class="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-yellow-400 to-orange-500 text-white flex items-center justify-center text-7xl sm:text-8xl font-black shadow-2xl border-4 border-white animate-pulse">
                  ${char.char}
                </div>
              </div>
            </div>

            <button id="btn-next-to-rec" class="mt-4 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-black text-sm px-8 py-3 rounded-full shadow-2xl border-2 border-white active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
              <span class="flex items-center">${window.GAME_ICONS ? window.GAME_ICONS.sparkle("w-4 h-4") : ""}</span> 去认字大剧场
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
          soundAndFX.speakPriority(`太棒啦！古人根据这个形状，创造出了“${char.char}”字！`, { kind: "sentence", emotion: "excited" });
          if (revealBox) revealBox.classList.remove("hidden");
        }, 600);
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
    soundAndFX.speakPriority(`认一认：“${char.char}”，拼音读作 ${char.pinyin}。点击大字听发音！`, { kind: "sentence", emotion: "gentle" });

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex items-center justify-between p-8 animate-fade-in select-none">
        
        <!-- 左侧：3D 果冻大字交互展示 -->
        <div class="flex-1 flex flex-col items-center justify-center">
          <div class="text-4xl text-yellow-300 font-black tracking-widest mb-3 bg-black/40 px-6 py-1.5 rounded-full border border-white/20 animate-pulse">
            ${char.pinyin}
          </div>

          <button id="btn-jelly-char" class="relative group w-56 h-56 sm:w-64 sm:h-64 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 border-4 border-white shadow-[0_0_60px_rgba(255,160,0,0.8)] flex items-center justify-center text-9xl sm:text-[10rem] font-black text-white active:scale-90 transition-transform cursor-pointer animate-bounce-cathy">
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
        <div class="w-88 sm:w-96 flex flex-col justify-between h-full bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/30">
          <div>
            <h3 class="text-xs font-black text-yellow-300 mb-3 flex items-center gap-1.5">
              <span class="flex items-center">${GAME_ICONS.chest("w-28 h-28 sm:w-36 sm:h-36")}</span>
              <span>常用词语拓展：</span>
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
                  <span class="text-xl">${window.GAME_ICONS ? window.GAME_ICONS.speaker("w-4 h-4 inline-block") : ""}</span>
                </button>
              `
                )
                .join("")}
            </div>

            <div id="sentence-card" class="mt-4 p-3 bg-black/40 hover:bg-black/60 rounded-2xl border border-white/20 text-xs text-yellow-200 font-semibold leading-relaxed cursor-pointer transition-all active:scale-95" title="点击朗读例句">
              ${window.GAME_ICONS ? window.GAME_ICONS.pen("w-4 h-4 inline-block") : ""} <span class="text-white font-bold">造句：</span>${char.sentence}
            </div>
          </div>

          <button id="btn-finish-rec-step" class="mt-4 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm py-3 rounded-full shadow-lg border border-white active:scale-95 transition-all flex items-center justify-center gap-2">
            <span>${window.GAME_ICONS ? window.GAME_ICONS.star("w-4 h-4 inline-block") : ""}</span> 开启读字评测 
          </button>
        </div>

      </div>
    `;

    const jellyBtn = stage.querySelector("#btn-jelly-char");
    if (jellyBtn) {
      this._on(jellyBtn, "click", () => {
        soundAndFX.playJellyBoing();
        soundAndFX.speakPriority(`${char.char}，${char.pinyin}`, { kind: "char", priority: 1 });
        jellyBtn.classList.add("scale-110", "rotate-3");
        this._timeout(() => jellyBtn.classList.remove("scale-110", "rotate-3"), 250);
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

    const sentenceCard = stage.querySelector("#sentence-card");
    if (sentenceCard) {
      this._on(sentenceCard, "click", () => {
        soundAndFX.playPop();
        soundAndFX.speakPriority(char.sentence, { kind: "sentence", emotion: "gentle" });
        sentenceCard.classList.add("ring-2", "ring-yellow-400", "bg-black/60");
        this._timeout(() => sentenceCard.classList.remove("ring-2", "ring-yellow-400", "bg-black/60"), 800);
      });
    }

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
  // STEP 3: 读 (智能语音评测 - 洪恩识字 1:1 沉浸式录音与回放系统)
  // ----------------------------------------------------------------
  renderStepRead(stage) {
    const char = this.charData;
    soundAndFX.speakPriority(`读一读：“${char.char}”，点击麦克风大声朗读！`, { kind: "sentence", emotion: "gentle" });

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-sky-300 flex items-center justify-between p-8 animate-fade-in select-none">
        
        <!-- 左侧：3D 果冻字卡与示范发音台 -->
        <div class="flex-1 flex flex-col items-center justify-center pr-6 border-r border-white/10">
          <div class="text-3xl text-yellow-300 font-black tracking-widest mb-3 bg-black/40 px-6 py-1.5 rounded-full border border-white/20 animate-pulse">
            ${char.pinyin}
          </div>

          <button id="read-char-circle" class="relative group w-52 h-52 sm:w-60 sm:h-60 rounded-3xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 border-4 border-white shadow-[0_0_50px_rgba(56,189,248,0.7)] flex items-center justify-center text-9xl sm:text-[10rem] font-black text-white active:scale-95 transition-all cursor-pointer animate-bounce-cathy" title="点击听示范发音">
            ${char.char}
            <div class="absolute -bottom-2.5 bg-blue-950 text-sky-200 text-[10px] font-black px-3.5 py-0.5 rounded-full border border-sky-400 flex items-center gap-1 shadow-md">
              <span>示范发音</span>
              <span class="w-3.5 h-3.5 inline-block">${window.GAME_ICONS ? window.GAME_ICONS.speaker("w-3.5 h-3.5") : ""}</span>
            </div>
          </button>

          <div class="flex items-center gap-3 mt-6">
            <span class="bg-white/15 text-white/90 text-xs font-black px-3.5 py-1 rounded-full border border-white/20">部首：${char.radical}</span>
            <span class="bg-white/15 text-white/90 text-xs font-black px-3.5 py-1 rounded-full border border-white/20">笔画：${char.strokeCount || 4}画</span>
          </div>
        </div>

        <!-- 右侧：洪恩风格麦克风评测与结算台 -->
        <div id="read-eval-panel" class="w-[380px] flex flex-col justify-between h-full bg-white/10 backdrop-blur-xl rounded-3xl p-6 border-2 border-white/30 text-center relative overflow-hidden">
          
          <!-- 顶部状态提示标题 -->
          <div class="z-10">
            <h3 id="read-panel-title" class="text-base font-black text-yellow-300 mb-1 flex items-center justify-center gap-1.5">
              <span>${window.GAME_ICONS ? window.GAME_ICONS.audio("w-4 h-4 inline-block") : ""} 语音评测挑战</span>
            </h3>
            <p id="record-guide-text" class="text-xs text-sky-100 font-bold leading-relaxed">
              点击麦克风，大声读出“<strong class="text-yellow-300 text-sm font-black">${char.char}</strong>”！
            </p>
          </div>

          <!-- 中部：动态大麦克风与声浪可视化区 / 评测结果卡片 -->
          <div class="my-auto flex flex-col items-center justify-center relative py-2 z-10 w-full">
            
            <!-- 录音区容器 -->
            <div id="mic-interaction-zone" class="flex flex-col items-center justify-center relative w-full">
              <!-- 录音中的声波扩散涟漪光环 (3层) -->
              <div id="mic-wave-ripples" class="absolute w-32 h-32 rounded-full bg-rose-500/30 -z-0 pointer-events-none hidden">
                <div class="absolute inset-0 rounded-full bg-rose-400/20 animate-ping"></div>
                <div class="absolute -inset-4 rounded-full bg-rose-400/15 animate-ping" style="animation-delay: 0.3s"></div>
              </div>

              <!-- 麦克风核心按钮外圈 SVG 倒计时圆环 -->
              <div class="relative w-28 h-28 flex items-center justify-center">
                <svg id="record-svg-ring" class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-20 hidden">
                  <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.2)" stroke-width="4" fill="transparent" />
                  <circle id="record-countdown-ring" cx="56" cy="56" r="48" stroke="#34d399" stroke-width="5" fill="transparent" stroke-linecap="round" stroke-dasharray="301.6" stroke-dashoffset="0" class="transition-all duration-100" />
                </svg>

                <!-- 麦克风核心主按钮 -->
                <button id="btn-start-record" class="relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-rose-500 via-red-500 to-orange-400 shadow-[0_10px_30px_rgba(244,63,94,0.7)] flex items-center justify-center border-4 border-white active:scale-90 transition-all hover:scale-105 cursor-pointer">
                  <div id="mic-icon-wrapper" class="w-12 h-12 text-white flex items-center justify-center pointer-events-none">
                    ${window.GAME_ICONS ? window.GAME_ICONS.audio("w-12 h-12") : ""}
                  </div>
                </button>
              </div>

              <!-- 实时 7 柱动态跳动音频频谱 -->
              <div id="record-vol-bars" class="flex items-center gap-1.5 mt-4 h-6 hidden">
                <div class="vol-bar w-1.5 bg-emerald-400 rounded-full transition-all duration-75" style="height: 20%"></div>
                <div class="vol-bar w-1.5 bg-lime-300 rounded-full transition-all duration-75" style="height: 50%"></div>
                <div class="vol-bar w-1.5 bg-yellow-300 rounded-full transition-all duration-75" style="height: 80%"></div>
                <div class="vol-bar w-1.5 bg-amber-400 rounded-full transition-all duration-75" style="height: 90%"></div>
                <div class="vol-bar w-1.5 bg-yellow-300 rounded-full transition-all duration-75" style="height: 70%"></div>
                <div class="vol-bar w-1.5 bg-lime-300 rounded-full transition-all duration-75" style="height: 40%"></div>
                <div class="vol-bar w-1.5 bg-emerald-400 rounded-full transition-all duration-75" style="height: 20%"></div>
              </div>

              <!-- 动态检测到声音提示微胶囊 -->
              <div id="record-audio-cue" class="mt-2 text-[11px] font-black text-emerald-300 hidden animate-bounce bg-emerald-950/80 border border-emerald-400/50 px-3 py-0.5 rounded-full shadow-lg">
                听到声音啦，继续读！
              </div>

              <!-- 实时语音识别转写文本 -->
              <div id="record-interim-text" class="mt-2 text-xs font-black text-emerald-300 h-5 transition-opacity duration-300 opacity-0"></div>

              <!-- 动态状态提示文字 -->
              <div id="record-status" class="mt-2 text-xs font-black text-rose-200 tracking-wider">
                点击开始录音
              </div>

              <!-- 错误提示（权限拒绝等） -->
              <div id="record-error-text" class="mt-2 text-xs font-black text-rose-300 hidden"></div>
            </div>

            <!-- 无 ASR 环境手动评分面板 (Safari / 不支持语音识别) -->
            <div id="manual-rating-panel" class="hidden flex flex-col items-center justify-center w-full py-4 animate-fade-in">
              <p class="text-xs text-sky-100 font-bold mb-3 leading-relaxed">当前浏览器不支持语音识别<br/>请给自己打分吧！</p>
              <div id="manual-stars-row" class="flex items-center gap-3">
                <button class="manual-star-btn text-4xl transition-transform hover:scale-110 active:scale-90 cursor-pointer" data-stars="1">⭐</button>
                <button class="manual-star-btn text-5xl transition-transform hover:scale-110 active:scale-90 cursor-pointer" data-stars="2">⭐</button>
                <button class="manual-star-btn text-4xl transition-transform hover:scale-110 active:scale-90 cursor-pointer" data-stars="3">⭐</button>
              </div>
              <p id="manual-rating-status" class="mt-2 text-xs font-black text-yellow-300 h-5"></p>
            </div>

            <!-- 评测结果展示区 (默认隐藏，打分后显现) -->
            <div id="read-result-box" class="hidden w-full flex flex-col items-center animate-scale-up bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
              <!-- 3 颗旋转飞入金星 -->
              <div id="read-stars-container" class="flex items-center justify-center gap-2 mb-1.5">
                <div class="star-item text-3xl animate-bounce" style="animation-delay: 0.1s">${GAME_ICONS.star(false)}</div>
                <div class="star-item text-4xl animate-bounce" style="animation-delay: 0.2s">${GAME_ICONS.star(false)}</div>
                <div class="star-item text-3xl animate-bounce" style="animation-delay: 0.3s">${GAME_ICONS.star(false)}</div>
              </div>
              <!-- 分数徽章 -->
              <div class="text-3xl font-black text-yellow-300 drop-shadow-md">
                <span id="read-score-num">100</span> <span class="text-sm font-bold">分</span>
              </div>
              <div id="read-praise-text" class="text-xs font-black text-white/90 mt-1 leading-relaxed text-center">
                发音真标准，太厉害了！
              </div>
              
              <!-- 听我的声音 + 听示范发音 双轨回放 -->
              <div class="flex items-center gap-2.5 mt-3 w-full justify-center">
                <button id="btn-replay-my-voice" class="bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black px-3.5 py-1.5 rounded-full shadow-md border border-white flex items-center gap-1 active:scale-95 transition-all cursor-pointer" title="听听刚刚录下的发音">
                  <span id="replay-voice-icon" class="w-3.5 h-3.5 inline-block">${window.GAME_ICONS ? window.GAME_ICONS.speaker("w-3.5 h-3.5") : ""}</span>
                  <span id="replay-voice-text">听我的声音</span>
                </button>
                <button id="btn-play-standard-voice" class="bg-sky-500 hover:bg-sky-400 text-white text-xs font-black px-3 py-1.5 rounded-full border border-white/50 flex items-center gap-1 active:scale-95 transition-all cursor-pointer" title="听老师标准发音">
                  <span>${window.GAME_ICONS ? window.GAME_ICONS.speaker("w-3.5 h-3.5 inline-block") : ""} 听示范</span>
                </button>
                <button id="btn-retry-record" class="bg-white/20 hover:bg-white/30 text-white text-xs font-black px-3 py-1.5 rounded-full border border-white/30 active:scale-95 transition-all cursor-pointer">
                  <span>重录</span>
                </button>
              </div>
            </div>

          </div>

          <!-- 底部：完成去练字按钮 -->
          <div class="z-10">
            <button id="btn-finish-read-step" class="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white font-black text-sm py-3 rounded-full shadow-lg border-2 border-white active:scale-95 transition-all flex items-center justify-center gap-2 opacity-50 pointer-events-none cursor-pointer">
              <span class="w-4 h-4 inline-block">${window.GAME_ICONS ? window.GAME_ICONS.sparkle("w-4 h-4") : ""}</span>
              <span>开启特训练字 (+5 金币)</span> 
            </button>
          </div>

        </div>

      </div>
    `;

    const btnRecord = stage.querySelector("#btn-start-record");
    const charCircle = stage.querySelector("#read-char-circle");
    const finishBtn = stage.querySelector("#btn-finish-read-step");
    const retryRecordBtn = stage.querySelector("#btn-retry-record");
    const replayVoiceBtn = stage.querySelector("#btn-replay-my-voice");
    const standardVoiceBtn = stage.querySelector("#btn-play-standard-voice");
    const replayVoiceText = stage.querySelector("#replay-voice-text");

    if (charCircle) {
      this._on(charCircle, "click", () => {
        soundAndFX.playPop();
        soundAndFX.speakPriority(`${char.char}，${char.pinyin}`, { kind: "char", priority: 1 });
      });
    }

    // 录音触发与逻辑绑定
    if (btnRecord) {
      this._on(btnRecord, "click", () => {
        if (soundAndFX.synth) soundAndFX.synth.cancel();
        this.executeRecordToggle(stage);
      });
    }

    // 听我的声音回放
    if (replayVoiceBtn) {
      this._on(replayVoiceBtn, "click", () => {
        soundAndFX.playPop();
        const pe = pronunciationEval || window.pronunciationEval;
        if (pe && pe._lastResult && pe._lastResult.audioUrl) {
          const audio = new Audio(pe._lastResult.audioUrl);
          replayVoiceBtn.classList.add("ring-4", "ring-yellow-300", "scale-105");
          if (replayVoiceText) replayVoiceText.textContent = "正在播放原声...";
          
          const resetReplayBtn = () => {
            replayVoiceBtn.classList.remove("ring-4", "ring-yellow-300", "scale-105");
            if (replayVoiceText) replayVoiceText.textContent = "听我的声音";
          };
          audio.onended = resetReplayBtn;
          audio.onerror = () => {
            resetReplayBtn();
            soundAndFX.speakPriority(char.char, { kind: "char", priority: 1 });
          };
          audio.play().catch(() => {
            resetReplayBtn();
            soundAndFX.speakPriority(char.char, { kind: "char", priority: 1 });
          });
        } else {
          soundAndFX.speakPriority(char.char, { kind: "char", priority: 1 });
        }
      });
    }

    // 听示范发音
    if (standardVoiceBtn) {
      this._on(standardVoiceBtn, "click", () => {
        soundAndFX.playPop();
        soundAndFX.speakPriority(`${char.char}，${char.pinyin}`, { kind: "char", priority: 1 });
      });
    }

    // 重新录制 / 重新评分
    if (retryRecordBtn) {
      this._on(retryRecordBtn, "click", () => {
        soundAndFX.playPop();
        const resultBox = stage.querySelector("#read-result-box");
        const micZone = stage.querySelector("#mic-interaction-zone");
        const manualPanel = stage.querySelector("#manual-rating-panel");
        const statusTxt = stage.querySelector("#record-status");
        const asrSupported = pe && typeof pe.isSupported === "function" && pe.isSupported();
        if (resultBox) resultBox.classList.add("hidden");
        if (asrSupported) {
          if (micZone) micZone.classList.remove("hidden");
          if (manualPanel) manualPanel.classList.add("hidden");
          if (statusTxt) {
            statusTxt.textContent = "点击开始录音";
            statusTxt.className = "mt-2 text-xs font-black text-rose-200 tracking-wider";
          }
          this.executeRecordToggle(stage);
        } else {
          if (micZone) micZone.classList.add("hidden");
          if (manualPanel) manualPanel.classList.remove("hidden");
        }
      });
    }

    // 完成读字，奖励金币并进入第 4 步（练字）
    if (finishBtn) {
      this._on(finishBtn, "click", () => {
        soundAndFX.playSuccessSound();
        ebbinghausManager.addCoins(5);
        ebbinghausManager.save();
        soundAndFX.triggerCoinFly(finishBtn, 5);
        this._timeout(() => {
          this.currentStep = 4;
          this.render();
        }, 500);
      });
    }

    // ASR 可用性检测：不支持时展示手动三星评分面板
    const pe = pronunciationEval || window.pronunciationEval;
    const asrSupported = pe && typeof pe.isSupported === "function" && pe.isSupported();
    const micZone = stage.querySelector("#mic-interaction-zone");
    const manualPanel = stage.querySelector("#manual-rating-panel");
    const panelTitle = stage.querySelector("#read-panel-title");

    if (!asrSupported) {
      if (micZone) micZone.classList.add("hidden");
      if (manualPanel) manualPanel.classList.remove("hidden");
      if (panelTitle) panelTitle.innerHTML = `<span>${window.GAME_ICONS ? window.GAME_ICONS.star("w-4 h-4 inline-block") : "⭐"} 手动发音自评</span>`;
      this._bindManualRating(stage);
    } else {
      if (manualPanel) manualPanel.classList.add("hidden");
    }
  }

  /**
   * 绑定手动三星评分（Safari / 无 ASR 环境）
   */
  _bindManualRating(stage) {
    const pe = pronunciationEval || window.pronunciationEval;
    const starsRow = stage.querySelector("#manual-stars-row");
    const status = stage.querySelector("#manual-rating-status");
    if (!starsRow || !pe) return;

    starsRow.querySelectorAll(".manual-star-btn").forEach((btn) => {
      this._on(btn, "click", () => {
        const stars = parseInt(btn.dataset.stars, 10);
        soundAndFX.playPop();
        starsRow.querySelectorAll(".manual-star-btn").forEach((b, idx) => {
          b.classList.toggle("grayscale", idx + 1 > stars);
          b.classList.toggle("opacity-50", idx + 1 > stars);
        });
        if (status) status.textContent = `${stars} 颗星！`;

        const char = this.charData;
        const res = pe.manualEvaluate({ text: char.char, stars });
        this._timeout(() => this._showEvalResult(stage, res), 300);
      });
    });
  }

  /**
   * 洪恩风格交互录音状态机执行器
   */
  async executeRecordToggle(stage) {
    if (this._isRecordingTransition) return;
    const char = this.charData;
    const pe = pronunciationEval || window.pronunciationEval;
    if (!pe) return;

    const btnRecord = stage.querySelector("#btn-start-record");
    const statusTxt = stage.querySelector("#record-status");
    const ripples = stage.querySelector("#mic-wave-ripples");
    const volBars = stage.querySelector("#record-vol-bars");
    const svgRing = stage.querySelector("#record-svg-ring");
    const countdownRing = stage.querySelector("#record-countdown-ring");
    const audioCue = stage.querySelector("#record-audio-cue");
    const resultBox = stage.querySelector("#read-result-box");
    const micZone = stage.querySelector("#mic-interaction-zone");

    // 1. 若当前正在录音，点击提前停止并立即结算评测
    if (pe.state === "listening") {
      this._isRecordingTransition = true;
      if (statusTxt) {
        statusTxt.textContent = "正在计算发音评分...";
        statusTxt.className = "mt-2 text-xs font-black text-amber-300 animate-pulse";
      }
      if (this._volMeterTimer) { clearInterval(this._volMeterTimer); this._volMeterTimer = null; }
      if (this._countTimer) { clearInterval(this._countTimer); this._countTimer = null; }
      ripples?.classList.add("hidden");
      volBars?.classList.add("hidden");
      svgRing?.classList.add("hidden");
      audioCue?.classList.add("hidden");
      try {
        const res = await pe.stopAndEvaluate();
        if (res) this._showEvalResult(stage, res);
      } catch (e) {}
      this._isRecordingTransition = false;
      return;
    }

    // 2. 开启录音流程
    this._isRecordingTransition = true;
    soundAndFX.playPop();
    resultBox?.classList.add("hidden");
    micZone?.classList.remove("hidden");
    ripples?.classList.remove("hidden");
    volBars?.classList.remove("hidden");
    svgRing?.classList.remove("hidden");
    audioCue?.classList.add("hidden");
    if (btnRecord) {
      btnRecord.className = "relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-green-400 shadow-[0_10px_30px_rgba(16,185,129,0.7)] flex items-center justify-center border-4 border-white active:scale-90 transition-all hover:scale-105 cursor-pointer ring-4 ring-emerald-300";
    }

    if (statusTxt) {
      statusTxt.textContent = "正在启动麦克风...";
      statusTxt.className = "mt-2 text-xs font-black text-yellow-300 animate-pulse";
    }

    let started = false;
    try {
      const startRes = await pe.startEvaluation({
        text: char.char,
        mode: "char",
        maxDurationMs: 3200,
        silenceTimeoutMs: 2500,
        onResult: ({ transcript, isFinal }) => {
          const interim = stage.querySelector("#record-interim-text");
          if (interim) {
            interim.textContent = isFinal ? "" : `识别到：${transcript}`;
            interim.classList.toggle("opacity-0", !transcript || isFinal);
          }
        }
      });
      started = startRes && startRes.ok;
      if (!started) {
        this._showRecordError(stage, startRes?.reason || "start_failed");
        this._resetRecordUI(stage);
        this._isRecordingTransition = false;
        return;
      }
    } catch (e) {
      console.warn("[LearnModule] startEvaluation error:", e);
      this._showRecordError(stage, "exception");
      this._resetRecordUI(stage);
      this._isRecordingTransition = false;
      return;
    }
    this._isRecordingTransition = false;

    // 麦克风已成功接入，正式开始 3.2 秒倒计时与实时声学动态频谱
    const totalDuration = 3200;
    const startTime = performance.now();
    let countdown = 3;
    if (statusTxt) {
      statusTxt.textContent = `正在听你读 (${countdown}s)... 大声读【${char.char}】`;
      statusTxt.className = "mt-2 text-xs font-black text-emerald-300 animate-pulse";
    }

    if (this._volMeterTimer) clearInterval(this._volMeterTimer);
    const bars = volBars?.querySelectorAll(".vol-bar");
    const circumference = 301.6;

    this._volMeterTimer = setInterval(() => {
      if (pe.state !== "listening") return;
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / totalDuration);
      
      // 更新 SVG 倒计时环
      if (countdownRing) {
        countdownRing.style.strokeDashoffset = String(circumference * progress);
      }

      // 实时音频音量分析
      const vol = pe.getLiveVolume();
      if (bars) {
        bars.forEach((bar, idx) => {
          const height = Math.max(15, Math.min(100, vol * (0.8 + idx * 0.1) + Math.random() * 20));
          bar.style.height = `${height}%`;
        });
      }

      // 实时声音检测指示微气泡
      if (audioCue) {
        if (vol > 15) {
          audioCue.classList.remove("hidden");
        }
      }
    }, 50);
    this._addCleanup(() => clearInterval(this._volMeterTimer));

    // 倒计时每秒更新
    if (this._countTimer) clearInterval(this._countTimer);
    this._countTimer = setInterval(() => {
      countdown--;
      if (countdown > 0 && pe.state === "listening") {
        if (statusTxt) statusTxt.textContent = `正在听你读 (${countdown}s)... 大声读【${char.char}】`;
      } else {
        clearInterval(this._countTimer);
        this._countTimer = null;
      }
    }, 1000);
    this._addCleanup(() => clearInterval(this._countTimer));

    // 3.2 秒后自动收音完成并展现打分结果
    this._timeout(async () => {
      if (pe.state === "listening") {
        if (statusTxt) {
          statusTxt.textContent = "AI 评测打分中，请稍候...";
          statusTxt.className = "mt-2 text-xs font-black text-amber-300 animate-pulse";
        }
        if (this._volMeterTimer) { clearInterval(this._volMeterTimer); this._volMeterTimer = null; }
        if (this._countTimer) { clearInterval(this._countTimer); this._countTimer = null; }
        ripples?.classList.add("hidden");
        volBars?.classList.add("hidden");
        svgRing?.classList.add("hidden");
        audioCue?.classList.add("hidden");
        if (btnRecord) {
          btnRecord.className = "relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-rose-500 via-red-500 to-orange-400 shadow-[0_10px_30px_rgba(244,63,94,0.7)] flex items-center justify-center border-4 border-white active:scale-90 transition-all hover:scale-105 cursor-pointer";
        }
        try {
          const res = await pe.stopAndEvaluate();
          if (res) this._showEvalResult(stage, res);
        } catch (e) {}
      }
    }, totalDuration);
  }

  /**
   * 录音错误提示
   */
  _showRecordError(stage, reason) {
    const errorTxt = stage.querySelector("#record-error-text");
    const statusTxt = stage.querySelector("#record-status");
    const messages = {
      mic_permission_denied: "麦克风权限被拒绝，请在浏览器设置中允许访问麦克风",
      asr_permission_denied: "语音识别权限被拒绝",
      start_failed: "录音启动失败，请重试",
      exception: "录音遇到异常，请重试",
      already_running: "正在录音中，请勿重复点击",
    };
    const msg = messages[reason] || "录音遇到异常，请重试";
    if (errorTxt) {
      errorTxt.textContent = msg;
      errorTxt.classList.remove("hidden");
    }
    if (statusTxt) {
      statusTxt.textContent = "录音未启动";
      statusTxt.className = "mt-2 text-xs font-black text-rose-200 tracking-wider";
    }
  }

  /**
   * 重置录音 UI 到初始态
   */
  _resetRecordUI(stage) {
    const btnRecord = stage.querySelector("#btn-start-record");
    const ripples = stage.querySelector("#mic-wave-ripples");
    const volBars = stage.querySelector("#record-vol-bars");
    const svgRing = stage.querySelector("#record-svg-ring");
    const audioCue = stage.querySelector("#record-audio-cue");
    const interim = stage.querySelector("#record-interim-text");
    const errorTxt = stage.querySelector("#record-error-text");

    if (btnRecord) {
      btnRecord.className = "relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-rose-500 via-red-500 to-orange-400 shadow-[0_10px_30px_rgba(244,63,94,0.7)] flex items-center justify-center border-4 border-white active:scale-90 transition-all hover:scale-105 cursor-pointer";
    }
    ripples?.classList.add("hidden");
    volBars?.classList.add("hidden");
    svgRing?.classList.add("hidden");
    audioCue?.classList.add("hidden");
    interim?.classList.add("opacity-0");
    errorTxt?.classList.add("hidden");
  }

  /**
   * 渲染美化后的语音评测结果卡片
   */
  _showEvalResult(stage, res) {
    if (this.currentStep !== 3) return;
    const char = this.charData;

    const micZone = stage.querySelector("#mic-interaction-zone");
    const resultBox = stage.querySelector("#read-result-box");
    const scoreNum = stage.querySelector("#read-score-num");
    const praiseTxt = stage.querySelector("#read-praise-text");
    const starsContainer = stage.querySelector("#read-stars-container");
    const finishBtn = stage.querySelector("#btn-finish-read-step");
    const retryBtn = stage.querySelector("#btn-retry-record");

    const score = typeof res.totalScore === "number" ? res.totalScore : (typeof res.score === "number" ? res.score : 0);
    const stars = typeof res.stars === "number" ? res.stars : (score >= 85 ? 3 : (score >= 60 ? 2 : (score >= 35 ? 1 : 0)));

    if (micZone) micZone.classList.add("hidden");
    if (resultBox) resultBox.classList.remove("hidden");
    if (scoreNum) scoreNum.textContent = score;

    // 依据真实评测得分分档美化呈现
    if (score >= 85) {
      // 满分/优秀 (3星)
      if (praiseTxt) {
        praiseTxt.innerHTML = `<span class="text-emerald-300 font-bold">发音超级标准！太厉害了！</span><br/><span class="text-white/80 text-[11px]">声母韵母饱满，获得 3 颗星与 5 金币！</span>`;
      }
      soundAndFX.playVictoryFanfare();
      soundAndFX.triggerConfetti(stage);
      soundAndFX.speakPriority(`太棒啦！“${char.char}”字读得真准，得到${score}分！`, { kind: "sentence", emotion: "excited" });
      if (finishBtn) {
        finishBtn.innerHTML = `<span>${window.GAME_ICONS ? window.GAME_ICONS.sparkle("w-4 h-4 inline-block") : ""} 开启特训练字 (+5 金币)</span>`;
        finishBtn.classList.remove("opacity-50", "pointer-events-none");
        finishBtn.className = "w-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black py-3 rounded-full shadow-lg border-2 border-white flex items-center justify-center gap-2 active:scale-95 transition-all text-sm cursor-pointer ring-4 ring-yellow-300 animate-pulse";
      }
    } else if (score >= 60) {
      // 良好 (2星)
      if (praiseTxt) {
        praiseTxt.innerHTML = `<span class="text-amber-300 font-bold">读得很棒！声音再清晰一点就满分啦！</span><br/><span class="text-white/80 text-[11px]">获得 2 颗星，再练一次可拿满分哦！</span>`;
      }
      soundAndFX.playSuccessSound();
      soundAndFX.speakPriority(`读得不错！得到${score}分，再练一次拿3颗星吧！`, { kind: "sentence", emotion: "happy" });
      if (finishBtn) {
        finishBtn.innerHTML = `<span>${window.GAME_ICONS ? window.GAME_ICONS.sparkle("w-4 h-4 inline-block") : ""} 开启特训练字 (+3 金币)</span>`;
        finishBtn.classList.remove("opacity-50", "pointer-events-none");
        finishBtn.className = "w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black py-3 rounded-full shadow border border-white text-sm active:scale-95 transition-all cursor-pointer";
      }
    } else {
      // 不准 / 读错 (0~1星)
      const heard = res.hypothesis || "未检测到清晰发音";
      if (praiseTxt) {
        praiseTxt.innerHTML = `<div class="bg-rose-950/60 border border-rose-400/40 rounded-xl px-3 py-1.5 mb-1"><span class="text-yellow-300 font-bold">识别到读音：“${heard}”</span></div><span class="text-rose-200 text-xs">没有读准哦，请点击【听示范】并大声朗读【${char.char}】！</span>`;
      }
      soundAndFX.playSoftError();
      soundAndFX.speakPriority(`好像读成了“${heard}”啦，请跟我大声读“${char.char}”，再试一次吧！`, { kind: "sentence", emotion: "correction" });
      if (retryBtn) {
        retryBtn.className = "bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg border border-white active:scale-95 transition-all cursor-pointer ring-4 ring-yellow-400 animate-pulse";
      }
      if (finishBtn) {
        finishBtn.innerHTML = `<span>跳过此步 (0 金币)</span>`;
        finishBtn.classList.remove("opacity-50", "pointer-events-none");
        finishBtn.className = "w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 rounded-full border border-white/30 text-xs active:scale-95 transition-all cursor-pointer mt-1";
      }
    }

    // 更新 3 颗金色大星星（逐颗旋转弹入动画）
    if (starsContainer) {
      starsContainer.innerHTML = Array.from({ length: 3 }).map((_, i) => `
        <div class="star-item text-4xl animate-bounce" style="animation-delay: ${0.15 * i}s">
          ${GAME_ICONS.star(i >= stars)}
        </div>
      `).join("");
    }
  }

  // ----------------------------------------------------------------
  // STEP 4: 练 — 太空飞船射击小游戏
  // ----------------------------------------------------------------
  renderStepPractice(stage) {
    const char = this.charData;
    let hitCount = 0;
    const targetHits = 3;

    soundAndFX.speakPriority(`瞄准射击！请击中带有“${char.char}”字的太空发光气球！`, { kind: "sentence", emotion: "excited" });

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col justify-between p-6 animate-fade-in select-none">
        
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
            <button class="balloon-target-btn relative group w-32 h-44 sm:w-40 sm:h-52 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200 border-4 border-white shadow-[0_0_30px_rgba(255,160,0,0.6)] flex flex-col items-center justify-center active:scale-75 transition-all duration-300 animate-bounce-slow cursor-pointer" style="animation-delay: ${
              idx * 0.3
            }s" data-char="${opt}">
              <span class="text-6xl sm:text-7xl font-black text-amber-950 drop-shadow">${opt}</span>
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
            <span class="flex items-center">${GAME_ICONS.star(true)}</span>
            <span class="flex items-center">${GAME_ICONS.star(true)}</span>
            <span class="flex items-center">${GAME_ICONS.star(true)}</span>
          </div>
          <h2 class="text-2xl font-black text-yellow-300 mb-2">神枪手！射击挑战大满贯！</h2>
          <p class="text-xs text-gray-300 mb-6 font-semibold">你已经彻底掌握了“${char.char}”字的辨识与发音！</p>
          <button id="btn-next-to-write" class="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-black text-sm px-10 py-3.5 rounded-full shadow-2xl border-2 border-white active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
            <span>${window.GAME_ICONS ? window.GAME_ICONS.pen("w-4 h-4 inline-block") : ""}</span> 去写字小画堂 
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
          soundAndFX.speakPriority(char.char, { kind: "char", priority: 1 });
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
          soundAndFX.speakPriority(`这是“${val}”字，要找的是“${char.char}”字哦！`, { kind: "sentence", emotion: "correction" });
          btn.classList.add("animate-shake");
          this._timeout(() => btn.classList.remove("animate-shake"), 600);
        }
      });
    });

    if (nextBtn) {
      this._on(nextBtn, "click", () => {
        soundAndFX.playPop();
        this.currentStep = 5;
        this.render();
      });
    }
  }

  // ----------------------------------------------------------------
  // STEP 5: 写 (AI 魔法星光毛笔描红 + 倒笔画拦截)
  // ----------------------------------------------------------------
  renderStepWrite(stage) {
    const char = this.charData;
    soundAndFX.speakPriority(`魔法毛笔描红！请从发光起点开始，按照笔顺书写“${char.char}”字！`, { kind: "sentence", priority: 1 });

    stage.innerHTML = `
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex items-center justify-between p-8 animate-fade-in">
        
        <div class="flex-1 flex flex-col items-center justify-center">
          <div class="relative w-[360px] h-[360px] sm:w-[400px] sm:h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400 bg-white">
            <canvas id="hanzi-magic-canvas" class="w-full h-full cursor-crosshair"></canvas>
          </div>
        </div>

        <div class="w-72 flex flex-col justify-between h-full bg-white/80 backdrop-blur-md rounded-3xl p-6 border-2 border-amber-200 shadow-xl text-center">
          <div>
            <span class="bg-amber-100 text-amber-800 text-xs font-black px-4 py-1 rounded-full mb-3 inline-block flex items-center justify-center gap-1">
              ${window.GAME_ICONS ? window.GAME_ICONS.pen("w-3.5 h-3.5 inline-block") : ""} 魔法星光笔描红
            </span>
            <h3 class="text-lg font-black text-amber-950 mb-2">规范笔顺写好字</h3>
            <p class="text-xs text-gray-600 leading-relaxed font-semibold">
              ${window.GAME_ICONS ? window.GAME_ICONS.sparkle("w-4 h-4 inline-block") : ""} 沿黄色魔法光球滑行，遇到倒笔画系统会自动提示并拦截哦！
            </p>
          </div>

          <div class="flex flex-col gap-3">
            <button id="btn-reset-write" class="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs py-3 rounded-full shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5">
              <span></span> 重新书写这一字
            </button>

            <button id="btn-finish-write-step" class="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm py-3.5 rounded-full shadow-xl border border-white active:scale-95 transition-all flex items-center justify-center gap-2 hidden animate-bounce-slow">
              <span class="flex items-center">${GAME_ICONS.chest("w-28 h-28 sm:w-36 sm:h-36")}</span>
              <span>书写满分！去开宝箱 </span>
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
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-purple-950 via-indigo-950 to-purple-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col items-center justify-center p-8 animate-fade-in text-center text-white">
        
        <div id="golden-chest-stage" class="flex flex-col items-center">
          
          <!-- 三颗金色大星槽 (Duang! Duang! Duang!) -->
          <div class="flex items-center gap-4 mb-4">
            <div id="star-slot-1" class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center transition-all duration-500">
              <span class="flex items-center">${GAME_ICONS.star(false)}</span>
            </div>
            <div id="star-slot-2" class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center -translate-y-2 transition-all duration-500">
              <span class="flex items-center">${GAME_ICONS.star(false)}</span>
            </div>
            <div id="star-slot-3" class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center transition-all duration-500">
              <span class="flex items-center">${GAME_ICONS.star(false)}</span>
            </div>
          </div>

          <!-- 黄金大宝箱 (点击开启) -->
          <button id="btn-open-golden-chest" class="group relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 border-4 border-white shadow-[0_0_60px_rgba(255,235,59,0.8)] flex items-center justify-center active:scale-90 transition-transform cursor-pointer animate-bounce-slow">
            <span class="flex items-center">${GAME_ICONS.chest("w-28 h-28 sm:w-36 sm:h-36")}</span>
            <div class="absolute -bottom-3 bg-red-600 text-white font-black text-xs px-4 py-1 rounded-full shadow-lg border border-white">
              点击开启通关宝箱！
            </div>
          </button>

          <h2 class="text-xl font-black text-yellow-300 mt-6 mb-1">
            恭喜凯茜小勇士！通关“${char.char}”字大冒险！
          </h2>
        </div>

        <div id="chest-reward-card" class="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center justify-center text-white hidden animate-scale-up z-30">
          <div class="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 border-4 border-white text-7xl sm:text-8xl font-black flex items-center justify-center shadow-2xl mb-4 animate-bounce-cathy">
            ${char.char}
          </div>

          <h2 class="text-2xl font-black text-yellow-300 mb-1">获得全新专属字卡：${char.char}</h2>
          <p class="text-xs text-gray-300 mb-4 flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.coin()} 获得 10 凯茜星币</span>
            <span class="flex items-center">${GAME_ICONS.star(true)} 3 颗凯茜之星</span>
          </p>

          <button id="btn-confirm-return-map" class="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-black text-base px-12 py-3.5 rounded-full shadow-[0_0_40px_rgba(255,107,0,0.9)] border-2 border-white active:scale-95 transition-transform">
             收入生词本，返回大地图
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
            star1.innerHTML = `<span class="flex items-center">${GAME_ICONS.star(true)}</span>`;
            star1.classList.add("bg-yellow-400", "scale-125", "shadow-[0_0_20px_rgba(255,235,59,1)]");
          }
        }, 200);

        this._timeout(() => {
          soundAndFX.playStarEarned(2);
          if (star2) {
            star2.innerHTML = `<span class="flex items-center">${GAME_ICONS.star(true)}</span>`;
            star2.classList.add("bg-yellow-400", "scale-125", "shadow-[0_0_20px_rgba(255,235,59,1)]");
          }
        }, 600);

        this._timeout(() => {
          soundAndFX.playStarEarned(3);
          if (star3) {
            star3.innerHTML = `<span class="flex items-center">${GAME_ICONS.star(true)}</span>`;
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
