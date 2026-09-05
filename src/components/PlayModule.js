/**
 * 凯茜识字 - 游乐场编排层
 * 各玩法实现见 src/utils/playHub/*
 */

import { soundAndFX } from "../utils/soundEngine.js";
import { mountGameShell } from "./SharedShell.js";
import { BaseModule } from "../utils/BaseModule.js";
import { ensurePlayStyles } from "../utils/playHub/playStyles.js";
import { renderBossBattle } from "../utils/playHub/bossBattle.js";
import { renderMatchGame } from "../utils/playHub/matchGame.js";
import { renderFusionLab } from "../utils/playHub/fusionLab.js";
import { renderPkArena } from "../utils/playHub/pkArena.js";
import { renderIdiomHall, _renderIdiomStory, _renderIdiomQuiz } from "../utils/playHub/idiomHall.js";
import { renderPoemHall, renderPoemReader, _renderPoemQuiz } from "../utils/playHub/poemHall.js";
import { renderFamilyWorkshop } from "../utils/playHub/familyWorkshop.js";
import { renderSpotterGame, _renderFeihuaGame } from "../utils/playHub/spotterGame.js";
import { renderMeteorDefense } from "../utils/playHub/meteorDefense.js";
import { renderWordExpedition, renderExpeditionTreasure, renderExpeditionVictory } from "../utils/playHub/wordExpedition.js";

ensurePlayStyles();

export class PlayModule extends BaseModule {
  constructor(container) {
    super(container);
    this.currentMode = null; // null: 大厅, "boss": 难字歼灭, "match": 消消乐, "fusion": 汉字拼拼乐, "pk": 竞技PK, "idiom": 成语馆, "poem": 古诗馆, "meteor": 陨石防御战
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
    } else if (this.currentMode === "meteor") {
      this.renderMeteorDefense();
    } else if (this.currentMode === "expedition") {
      this.renderWordExpedition();
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
            <img src="/assets/images/icon_arcade.jpg" class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-3xl" alt="Arcade" />
          </div>
          
          <div class="relative z-10 text-white">
            <div class="flex items-center gap-3 mb-1">
              <span class="flex items-center"><img src="/assets/images/icon_arcade.jpg" class="w-6 h-6 object-cover rounded-md" alt="Arcade" /></span>
              <h1 class="text-2xl font-black drop-shadow-md">凯茜游乐场 · 拓展竞技馆</h1>
            </div>
            <p class="text-xs text-yellow-200 font-bold">
              挑一个好玩的，练一练刚学过的字！
            </p>
          </div>
        </div>

        <!-- 新增探险队入口 -->
        <div class="mode-card group relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-yellow-300 hover:border-yellow-400 mb-6 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 flex flex-col justify-end p-6 cursor-pointer hover:scale-[1.02] transition-transform duration-300" data-mode="expedition">
          <div class="absolute -right-10 -bottom-10 opacity-30 transform scale-150">
            <img src="/assets/images/icon_swords.jpg" class="w-40 h-40 rounded-3xl shadow-xl" alt="Swords" />
          </div>
          <div class="relative z-10 text-white flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <div class="flex items-center gap-3 mb-1">
                <span class="flex items-center"><img src="/assets/images/icon_star.jpg" class="w-8 h-8 rounded-full" alt="Star" /></span>
                <h1 class="text-3xl font-black drop-shadow-md text-white group-hover:text-yellow-100 transition-colors">汉字探险队 (Rogue-lite)</h1>
              </div>
              <p class="text-sm text-yellow-100 font-bold drop-shadow-sm max-w-2xl mt-2">
                闯地图、选宝物、打败大魔王！一场超好玩的汉字冒险。
              </p>
            </div>
            <button class="btn-game-orange mode-card-cta text-white whitespace-nowrap">
              <img src="/assets/images/icon_swords.jpg" class="w-6 h-6 rounded-md" alt="Swords" /> 开启冒险
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <div class="mode-card card-gold-trim group rounded-3xl p-6 border-4 border-rose-200 hover:border-rose-400 cursor-pointer transition-all duration-300 flex flex-col justify-between" data-mode="boss">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-red-400 text-white flex items-center justify-center shadow-lg mb-4">
                <img src="/assets/images/cathy_boss_monster.jpg" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/20" alt="Monster" />
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-rose-600 transition-colors">难字歼灭战</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                把难记的字变成小怪兽，打败它们就能记住啦！
              </p>
            </div>
            <button class="mode-card-cta btn-game-orange text-white text-xs sm:text-sm cursor-pointer" data-speak="进入难字歼灭战" aria-label="进入难字歼灭战">
              <span>进入挑战</span>
            </button>
          </div>

          <div class="mode-card card-gold-trim group rounded-3xl p-6 border-4 border-amber-200 hover:border-amber-400 cursor-pointer transition-all duration-300 flex flex-col justify-between" data-mode="match">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-lg mb-4">
                <img src="/assets/images/icon_gem.jpg" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full" alt="Gem" />
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-amber-600 transition-colors">汉字消消乐</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                听一听、翻一翻，把拼音和汉字配对消掉！
              </p>
            </div>
            <button class="mode-card-cta btn-game-orange text-white text-xs sm:text-sm cursor-pointer" data-speak="开始汉字消消乐" aria-label="开始汉字消消乐">
              <span>开始消除</span>
            </button>
          </div>

          <div class="mode-card card-gold-trim group rounded-3xl p-6 border-4 border-purple-200 hover:border-purple-400 cursor-pointer transition-all duration-300 flex flex-col justify-between" data-mode="fusion">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-lg mb-4">
                <img src="/assets/images/icon_sparkle.jpg" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full" alt="Sparkle" />
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">汉字拼拼乐</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                偏旁部首魔法合成！投入神奇炼金锅，合成目标汉字！
              </p>
            </div>
            <button class="mode-card-cta btn-game-purple text-white text-xs sm:text-sm cursor-pointer" data-speak="开始汉字拼拼乐" aria-label="开始汉字拼拼乐">
              <span>开启炼金</span>
            </button>
          </div>

          <div class="mode-card card-gold-trim group rounded-3xl p-6 border-4 border-blue-200 hover:border-blue-400 cursor-pointer transition-all duration-300 flex flex-col justify-between" data-mode="pk">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-blue-500 to-cyan-400 text-white flex items-center justify-center shadow-lg mb-4">
                <img src="/assets/images/icon_swords.jpg" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full" alt="Swords" />
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">双人竞技场</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                双人极速对决 & 亲子让步欢乐PK，听发音抢拍汉字！
              </p>
            </div>
            <button class="mode-card-cta btn-game-blue text-white text-xs sm:text-sm cursor-pointer" data-speak="进入双人竞技场" aria-label="进入双人竞技场">
              <span>发起对决</span>
            </button>
          </div>

          <div class="mode-card card-gold-trim group rounded-3xl p-6 border-4 border-emerald-200 hover:border-emerald-400 cursor-pointer transition-all duration-300 flex flex-col justify-between" data-mode="idiom">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-green-400 text-white flex items-center justify-center shadow-lg mb-4">
                <img src="/assets/images/icon_scroll.jpg" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full" alt="Scroll" />
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors">成语国学馆</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                80+ 经典成语趣味微课堂，生动典故与互动小问答！
              </p>
            </div>
            <button class="mode-card-cta btn-game-green text-white text-xs sm:text-sm cursor-pointer" data-speak="进入成语馆" aria-label="进入成语馆">
              <span>探索成语</span>
            </button>
          </div>

          <div class="mode-card card-gold-trim group rounded-3xl p-6 border-4 border-amber-200 hover:border-amber-400 cursor-pointer transition-all duration-300 flex flex-col justify-between" data-mode="poem">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-lg mb-4">
                <img src="/assets/images/icon_book.jpg" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full" alt="Book" />
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-amber-600 transition-colors">古诗国学馆</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                20 首幼儿必背启蒙古诗，逐句有声点读、意境画卷与诗意闯关！
              </p>
            </div>
            <button class="mode-card-cta btn-game-orange text-white text-xs sm:text-sm cursor-pointer" data-speak="开始诵读古诗" aria-label="开始诵读古诗">
              <span>品读古诗</span>
            </button>
          </div>

          <div class="mode-card card-gold-trim group rounded-3xl p-6 border-4 border-emerald-200 hover:border-emerald-400 cursor-pointer transition-all duration-300 flex flex-col justify-between" data-mode="family">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg mb-4">
                <img src="/assets/images/icon_sparkle.jpg" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full" alt="Sparkle" />
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors">汉字魔法积木屋</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                字族同偏旁魔法拼插！一字生万字，轻松化解形近字混淆！
              </p>
            </div>
            <button class="mode-card-cta btn-game-green text-white text-xs sm:text-sm cursor-pointer" data-speak="进入汉字积木屋" aria-label="进入汉字积木屋">
              <span>拼插积木</span>
            </button>
          </div>

          <div class="mode-card card-gold-trim group rounded-3xl p-6 border-4 border-rose-200 hover:border-rose-400 cursor-pointer transition-all duration-300 flex flex-col justify-between" data-mode="spotter">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg mb-4">
                <img src="/assets/images/icon_sparkle.jpg" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full" alt="Sparkle" />
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-rose-600 transition-colors">火眼金睛辨异同</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                大 vs 太、日 vs 目，找出哪里不一样，火眼金睛练起来！
              </p>
            </div>
            <button class="mode-card-cta btn-game-orange text-white text-xs sm:text-sm cursor-pointer" data-speak="开始火眼金睛" aria-label="开始火眼金睛">
              <span>开始辨字</span>
            </button>
          </div>

          <div class="mode-card card-gold-trim group rounded-3xl p-6 border-4 border-cyan-200 hover:border-cyan-400 cursor-pointer transition-all duration-300 flex flex-col justify-between" data-mode="meteor">
            <div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-white flex items-center justify-center shadow-lg mb-4">
                <img src="/assets/images/icon_rocket.jpg" class="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-full" alt="Rocket" />
              </div>
              <h3 class="text-xl font-black text-gray-900 group-hover:text-cyan-600 transition-colors">陨石防御战</h3>
              <p class="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                听音辨形拦截汉字陨石！保护凯茜星球，挑战极速反应与抗压能力！
              </p>
            </div>
            <button class="mode-card-cta btn-game-blue text-white text-xs sm:text-sm cursor-pointer" data-speak="开始陨石防御" aria-label="开始陨石防御">
              <span>立即迎战</span>
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
          this.isExpeditionActive = false;
          this.render();
        } else {
          this.currentMode = mode;
          this.isExpeditionActive = (mode === "expedition");
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
  renderMeteorDefense() { return renderMeteorDefense.call(this); }
  renderWordExpedition() { return renderWordExpedition.call(this); }
  renderExpeditionTreasure() { return renderExpeditionTreasure.call(this); }
  renderExpeditionVictory() { return renderExpeditionVictory.call(this); }
}
