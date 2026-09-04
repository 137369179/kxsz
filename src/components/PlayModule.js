/**
 * 凯茜识字 - 游乐场编排层
 * 各玩法实现见 src/utils/playHub/*
 */

import { soundAndFX } from "../utils/soundEngine.js";
import { mountGameShell } from "./SharedShell.js";
import { BaseModule } from "../utils/BaseModule.js";
import { GAME_ICONS } from "../utils/gameIcons.js";
import { ensurePlayStyles } from "../utils/playHub/playStyles.js";
import { renderBossBattle } from "../utils/playHub/bossBattle.js";
import { renderMatchGame } from "../utils/playHub/matchGame.js";
import { renderFusionLab } from "../utils/playHub/fusionLab.js";
import { renderPkArena } from "../utils/playHub/pkArena.js";
import { renderIdiomHall, _renderIdiomStory, _renderIdiomQuiz } from "../utils/playHub/idiomHall.js";
import { renderPoemHall, renderPoemReader, _renderPoemQuiz } from "../utils/playHub/poemHall.js";
import { renderFamilyWorkshop } from "../utils/playHub/familyWorkshop.js";
import { renderSpotterGame, _renderFeihuaGame } from "../utils/playHub/spotterGame.js";

ensurePlayStyles();

export class PlayModule extends BaseModule {
  constructor(container) {
    super(container);
    this.currentMode = null; // null: 大厅, "boss": 难字歼灭, "match": 消消乐, "fusion": 汉字拼拼乐, "pk": 竞技PK, "idiom": 成语馆, "poem": 古诗馆
  }

  destroy() {
    soundAndFX.stopSpeaking();
    super.destroy();
  }

  render() {
    this.destroy();
    if (!this.currentMode) {
      this.renderHub();
    } else if (this.currentMode === "boss") {
      this.renderBossBattle();
    } else if (this.currentMode === "match") {
      this.renderMatchGame();
    } else if (this.currentMode === "fusion") {
      this.renderFusionLab();
    } else if (this.currentMode === "pk") {
      this.renderPkArena();
    } else if (this.currentMode === "idiom") {
      this.renderIdiomHall();
    } else if (this.currentMode === "poem") {
      this.renderPoemHall();
    } else if (this.currentMode === "family") {
      this.renderFamilyWorkshop();
    } else if (this.currentMode === "spotter") {
      this.renderSpotterGame();
    }
  }

  // ----------------------------------------------------
  // 1. 游乐场大厅
  // ----------------------------------------------------
  renderHub() {
    const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
      activeMode: "play",
      heading: "凯茜游乐场"
    });
    this._addCleanup(destroyShell);

    mainEl.innerHTML = `
      <div class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pb-8">
        
        <div class="relative w-full h-44 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 mb-6 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 flex flex-col justify-end p-6">
          <div class="absolute -right-6 -bottom-6 opacity-20 transform scale-150">
            ${GAME_ICONS.arcade()}
          </div>
          
          <div class="relative z-10 text-white">
            <div class="flex items-center gap-3 mb-1">
              <span class="flex items-center">${GAME_ICONS.arcade()}</span>
              <h1 class="text-2xl font-black drop-shadow-md">凯茜游乐场 · 拓展竞技馆</h1>
            </div>
            <p class="text-xs text-yellow-200 font-bold">
              趣味游戏化巩固复习 · 难字歼灭 · 汉字消消乐 · 部首拼拼乐 · 双人对决 · 国学成语 · 经典古诗
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-rose-200 hover:border-rose-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="boss">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-red-400 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.monster("w-10 h-10 sm:w-12 sm:h-12")}
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-rose-600 transition-colors">难字歼灭战</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                针对艾宾浩斯遗忘曲线薄弱生字，挑战 Boss 怪兽！
              </p>
            </div>
            <button class="mt-4 bg-gradient-to-r from-rose-500 to-red-500 text-white text-xs sm:text-sm font-black py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
              <span>进入挑战</span>
            </button>
          </div>

          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-amber-200 hover:border-amber-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="match">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.gem("w-10 h-10 sm:w-12 sm:h-12")}
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-amber-600 transition-colors">汉字消消乐</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                听音辨形，拼音与汉字 3D 翻转对对碰快速消除！
              </p>
            </div>
            <button class="mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs sm:text-sm font-black py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
              <span>开始消除</span>
            </button>
          </div>

          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-purple-200 hover:border-purple-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="fusion">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.sparkle("w-10 h-10 sm:w-12 sm:h-12")}
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">汉字拼拼乐</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                偏旁部首魔法合成！投入神奇炼金锅，合成目标汉字！
              </p>
            </div>
            <button class="mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs sm:text-sm font-black py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
              <span>开启炼金</span>
            </button>
          </div>

          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-blue-200 hover:border-blue-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="pk">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-blue-500 to-cyan-400 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.swords("w-10 h-10 sm:w-12 sm:h-12")}
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">双人竞技场</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                双人极速对决 & 亲子让步欢乐PK，听发音抢拍汉字！
              </p>
            </div>
            <button class="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs sm:text-sm font-black py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
              <span>发起对决</span>
            </button>
          </div>

          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-emerald-200 hover:border-emerald-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="idiom">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-green-400 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.scroll("w-10 h-10 sm:w-12 sm:h-12")}
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors">成语国学馆</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                80+ 经典成语趣味微课堂，生动典故与互动小问答！
              </p>
            </div>
            <button class="mt-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs sm:text-sm font-black py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
              <span>探索成语</span>
            </button>
          </div>

          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-amber-200 hover:border-amber-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="poem">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.book("w-10 h-10 sm:w-12 sm:h-12")}
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-amber-600 transition-colors">古诗国学馆</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                20 首幼儿必背启蒙古诗，逐句有声点读、意境画卷与诗意闯关！
              </p>
            </div>
            <button class="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm font-black py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
              <span>品读古诗</span>
            </button>
          </div>

          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-emerald-200 hover:border-emerald-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="family">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.sparkle("w-10 h-10 sm:w-12 sm:h-12")}
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors">汉字魔法积木屋</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                字族同偏旁魔法拼插！一字生万字，轻松化解形近字混淆！
              </p>
            </div>
            <button class="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs sm:text-sm font-black py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
              <span>拼插积木</span>
            </button>
          </div>

          <div class="mode-card group bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-rose-200 hover:border-rose-400 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col justify-between" data-mode="spotter">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg mb-4">
                ${GAME_ICONS.sparkle("w-10 h-10 sm:w-12 sm:h-12")}
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-rose-600 transition-colors">火眼金睛辨异同</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                AI 错因画像形近字克星！大 vs 太、日 vs 目，特征笔画光晕高亮破解混淆！
              </p>
            </div>
            <button class="mt-4 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs sm:text-sm font-black py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
              <span>开始辨字</span>
            </button>
          </div>

        </div>

      </div>
    `;

    mainEl.querySelectorAll(".mode-card").forEach((card) => {
      this._on(card, "click", () => {
        const mode = card.dataset.mode;
        soundAndFX.playSuccessSound();
        if (mode === "pk") {
          // 统一走 playHub/pkArena（含 completeReview），不再切换到独立 PKModule
          this.currentMode = "pk";
          this.render();
        } else {
          this.currentMode = mode;
          this.render();
        }
      });
    });
  }

  renderBossBattle() { return renderBossBattle.call(this); }
  renderMatchGame() { return renderMatchGame.call(this); }
  renderFusionLab() { return renderFusionLab.call(this); }
  renderPkArena() { return renderPkArena.call(this); }
  renderIdiomHall() { return renderIdiomHall.call(this); }
  _renderIdiomStory(idiom, db) { return _renderIdiomStory.call(this, idiom, db); }
  _renderIdiomQuiz(idiom, db) { return _renderIdiomQuiz.call(this, idiom, db); }
  renderPoemHall() { return renderPoemHall.call(this); }
  renderPoemReader(poem) { return renderPoemReader.call(this, poem); }
  _renderPoemQuiz(poem) { return _renderPoemQuiz.call(this, poem); }
  renderFamilyWorkshop() { return renderFamilyWorkshop.call(this); }
  renderSpotterGame() { return renderSpotterGame.call(this); }
  _renderFeihuaGame(poem) { return _renderFeihuaGame.call(this, poem); }
}
