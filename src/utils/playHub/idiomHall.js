/** PlayModule mode — extracted */
import { CHARACTER_DATABASE } from "../../data/characters.js";
import { IDIOMS_DATABASE } from "../../data/idioms.js";
import { POEMS_DATABASE } from "../../data/poems.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { soundAndFX } from "../soundEngine.js";
import { mountGameShell, showGameToast } from "../../components/SharedShell.js";
import { escapeHtml } from "../BaseModule.js";
import { GAME_ICONS } from "../gameIcons.js";
import { EVENTS } from "../eventBus.js";
import { RADICAL_FAMILIES } from "../../data/radicalFamilies.js";
import { forChar as mmForChar, SCENES as MM_SCENES } from "../multimodalEngine.js";
import {
  shuffle,
  pickReviewChars,
  buildOptions,
  buildMatchPairs,
  spawnFloatingText,
  startCountdown,
  writeKnownCharsReview,
} from "./playHelpers.js";

export function renderIdiomHall() {
    this.destroy();
    soundAndFX.stopSpeaking();
    const __pmProgress = ebbinghausManager.progress;
    const __pmSpeakerIcon = soundAndFX.isMuted ? GAME_ICONS.speaker("w-5 h-5", true) : GAME_ICONS.speaker("w-5 h-5", false);
    // 已学成语集合（答对记录）
    const learned = new Set(__pmProgress.learnedIdioms || []);
    const db = (typeof IDIOMS_DATABASE !== "undefined" && IDIOMS_DATABASE.length) ? IDIOMS_DATABASE : [
      { id: "idiom_001", name: "守株待兔", pinyin: "shǒu zhū dài tù", chars: ["守","株","待","兔"], desc: "比喻死守狭隘经验，不知变通，妄想不劳而获", story: "古时候有个农夫在田里干活，忽然一只兔子飞快跑来撞在树桩上死了农夫捡到兔子非常高兴，从此天天坐在树桩旁等待，结果田地荒芜，再也没等到兔子", moral: "做事要脚踏实地努力，不能心存侥幸", gameQuestion: { question: "农夫为什么再也没等到兔子？", options: ["撞树桩是极偶然的巧合，应该靠勤劳劳动", "因为树桩太矮了", "因为兔子跑得太慢了"], correctIndex: 0 } },
      { id: "idiom_002", name: "拔苗助长", pinyin: "bá miáo zhù zhǎng", chars: ["拔","苗","助","长"], desc: "比喻急于求成，违反规律，反而把事情弄糟", story: "古时候有个人嫌禾苗长得太慢，于是把禾苗一棵棵拔高他回家高兴地说：我帮禾苗长高啦！儿子跑到田里一看，禾苗全都枯死了", moral: "万物生长有规律，急于求成往往适得其反", gameQuestion: { question: "禾苗为什么枯死了？", options: ["被拔离土壤，破坏了生长规律", "天气太热了", "禾苗喝了太多水"], correctIndex: 0 } },
      { id: "idiom_003", name: "亡羊补牢", pinyin: "wáng yáng bǔ láo", chars: ["亡","羊","补","牢"], desc: "比喻出了问题后想办法补救，还不算太晚", story: "从前有个牧羊人，羊圈破了个洞，邻居劝他修好，他没听果然，第二天少了一只羊他赶忙修好羊圈，从此再没丢过羊", moral: "犯了错误要及时改正，亡羊补牢，为时未晚", gameQuestion: { question: "牧羊人后来修好羊圈，结果如何？", options: ["再也没有丢过羊", "又丢了很多羊", "羊圈又坏了"], correctIndex: 0 } },
      { id: "idiom_004", name: "画龙点睛", pinyin: "huà lóng diǎn jīng", chars: ["画","龙","点","睛"], desc: "比喻在关键处着墨，使内容更加传神生动", story: "古代画师张僧繇画了四条龙，却不肯点上眼睛人们苦苦请求，他终于给两条龙点了眼睛顿时电闪雷鸣，那两条龙破壁飞上天去了！", moral: "在关键处用力，能让整件事情焕然一新", gameQuestion: { question: "张僧繇给龙点睛后发生了什么？", options: ["电闪雷鸣，龙破壁飞走了", "画作变得更美了", "画师获得了奖赏"], correctIndex: 0 } }
    ];

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col select-none overflow-hidden bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-950 text-white">
        
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/20">
          <button id="btn-idiom-back" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer active:scale-95">
            <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
            <span>返回大厅</span>
          </button>
          <div class="flex items-center gap-2">
            <span class="flex items-center">${GAME_ICONS.book("w-5 h-5")}</span>
            <span class="text-sm font-black text-yellow-300">成语国学微课堂</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
              ${GAME_ICONS.coin("w-4 h-4")}<span>${__pmProgress.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-emerald-300 font-black text-xs px-3 py-1 rounded-full">
              <span>已学 <b id="idiom-learned-count" class="text-yellow-300">${learned.size}</b>/${db.length}</span>
            </div>
          </div>
        </header>

        <main class="relative z-10 flex-1 p-6 overflow-y-auto no-scrollbar">
          <div class="max-w-5xl mx-auto mb-6">
            <div class="relative w-full h-36 sm:h-40 rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-400/60 flex flex-col justify-end p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900">
              <div class="relative z-10 text-white">
                <div class="flex items-center gap-3 mb-1">
                  <span class="flex items-center">${GAME_ICONS.book()}</span>
                  <h1 class="text-2xl font-black drop-shadow-md text-yellow-300 font-serif">经典成语国学微课堂</h1>
                </div>
                <p class="text-xs text-emerald-100 font-bold drop-shadow">
                  20 部经典成语寓言启蒙 · 沉浸式图文故事赏析 · 理解寓意趣味闯关 · 筑牢国学基石
                </p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            ${db.map(item => {
              const isLearned = learned.has(item.id || item.name);
              return `
              <div class="idiom-card bg-white/10 backdrop-blur-md rounded-3xl p-5 border-2 ${isLearned ? "border-emerald-400/70" : "border-emerald-300/40"} shadow-xl hover:border-yellow-300 cursor-pointer transition-all hover:scale-105 flex flex-col justify-between relative" data-idiom-idx="${db.indexOf(item)}">
                ${isLearned ? `<span class="learned-stamp w-7 h-7 rounded-full bg-emerald-500 border-2 border-white text-white flex items-center justify-center text-sm shadow-lg">OK</span>` : ""}
                ${item.image ? `
                  <div class="w-full h-32 rounded-2xl overflow-hidden mb-3 shadow-md border border-emerald-300/30 bg-black/30">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
                  </div>
                ` : ""}
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[11px] font-bold text-emerald-300 tracking-wider">${item.pinyin || ""}</span>
                    <div class="flex gap-1">
                      ${(item.chars || Array.from(item.name || "")).map(c => `<span class="w-6 h-6 bg-yellow-400/20 border border-yellow-300/50 rounded-md text-yellow-300 font-black text-xs flex items-center justify-center">${c}</span>`).join("")}
                    </div>
                  </div>
                  <h3 class="text-2xl font-black text-yellow-300 mb-2 tracking-widest">${item.name || item.idiom || ""}</h3>
                  <p class="text-xs text-gray-200 leading-relaxed font-semibold">${item.desc || item.meaning || ""}</p>
                </div>
                <div class="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                  <span class="text-[10px] ${isLearned ? "text-emerald-400 font-black" : "text-emerald-400/70 font-bold"}">${isLearned ? " 已掌握" : "国学启蒙必学"}</span>
                  <button class="text-[10px] ${isLearned ? "bg-emerald-400" : "bg-yellow-400"} text-amber-950 font-black px-3 py-1 rounded-full shadow active:scale-90 transition-transform">${isLearned ? "再次回顾" : "听故事闯关"}</button>
                </div>
              </div>
            `;}).join("")}
          </div>
        </main>
      </div>
    `;

    const backBtn = this.container.querySelector("#btn-idiom-back");
    if (backBtn) {
      this._on(backBtn, "click", () => {
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        this.currentMode = null;
        this.render();
      });
    }

    this.container.querySelectorAll(".idiom-card").forEach((card) => {
      this._on(card, "click", () => {
        const idx = parseInt(card.dataset.idiomIdx, 10);
        if (!isNaN(idx) && db[idx]) {
          soundAndFX.stopSpeaking();
          soundAndFX.playPop();
          this._renderIdiomStory(db[idx], db);
        }
      });
    });
  }

export function _renderIdiomStory(idiom, db) {
    this.destroy();
    soundAndFX.stopSpeaking();
    const name = idiom.name || idiom.idiom || "";
    const pinyin = idiom.pinyin || "";
    const desc = idiom.desc || idiom.meaning || "";
    const story = idiom.story || desc;
    const moral = idiom.moral || "";
    const chars = idiom.chars || Array.from(name);
    const gameQuestion = idiom.gameQuestion || null;

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col select-none overflow-hidden bg-gradient-to-b from-amber-950 via-orange-950 to-red-950 text-white">
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-amber-300/30">
          <button id="btn-story-back" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer active:scale-95">
            <span class="flex items-center">${GAME_ICONS.back("w-4 h-4")}</span>
            <span>返回成语馆</span>
          </button>
          <span class="text-sm font-black text-yellow-300">国学故事馆</span>
          <div class="w-24"></div>
        </header>

        <main class="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col items-center gap-5">
          <div class="flex items-center justify-center gap-3 mt-2">
            ${chars.map((c, i) => `
              <div class="idiom-char-anim w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 border-4 border-white shadow-[0_0_30px_rgba(255,215,0,0.6)] flex items-center justify-center opacity-0 scale-50" style="transition:all 0.5s ease;transition-delay:${i*200}ms">
                <span class="text-4xl font-black text-amber-950">${c}</span>
              </div>
            `).join("")}
          </div>

          <p class="text-lg text-amber-300 font-bold tracking-widest opacity-0 transition-opacity duration-700" id="story-pinyin" style="transition-delay:0.8s">${pinyin}</p>

          ${idiom.image ? `
          <div class="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-300/40 bg-black/30 opacity-0 transition-opacity duration-700" id="story-image" style="transition-delay:0.9s">
            <img src="${idiom.image}" alt="${name}" class="w-full h-48 sm:h-64 object-cover" />
          </div>
          ` : ""}

          <div class="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-3xl border-2 border-amber-300/30 p-6 opacity-0 transition-opacity duration-700" id="story-desc" style="transition-delay:1.0s">
            <div class="flex items-center gap-2 mb-3">
              <span class="flex items-center">${GAME_ICONS.sparkle("w-4 h-4")}</span>
              <span class="text-xs font-black text-amber-300 uppercase tracking-wider">成语释义</span>
            </div>
            <p class="text-sm text-white/90 font-bold leading-relaxed">${desc}</p>
          </div>

          <div class="w-full max-w-2xl bg-white/5 backdrop-blur-md rounded-3xl border border-white/15 p-6 opacity-0 transition-opacity duration-700" id="story-body" style="transition-delay:1.3s">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="flex items-center">${GAME_ICONS.pen("w-4 h-4")}</span>
                <span class="text-xs font-black text-emerald-300 uppercase tracking-wider">经典故事</span>
              </div>
              <button id="btn-narrate" class="btn-game-orange text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5 active:scale-90">
                <span class="flex items-center">${GAME_ICONS.speaker("w-4 h-4")}</span>
                <span>分段高亮朗读</span>
              </button>
            </div>
            <p id="story-text-body" class="text-sm text-white/85 font-semibold leading-loose">${
              story.split(/[\u3002\uff01\uff1f]/).filter(s => s.trim()).map((sent, i) =>
                `<span class="story-sent rounded transition-all px-1 py-0.5 cursor-pointer hover:bg-white/15 hover:text-yellow-200 inline-block m-0.5" data-si="${i}" title="点击独立朗读这句话">${sent}。</span>`
              ).join("")
            }</p>
          </div>

          ${moral ? `
          <div class="w-full max-w-2xl bg-emerald-900/60 rounded-3xl border-2 border-emerald-400/40 p-5 opacity-0 transition-opacity duration-700" id="story-moral" style="transition-delay:1.6s">
            <div class="flex items-center gap-2 mb-2">
              <span class="flex items-center">${GAME_ICONS.star("w-4 h-4", true)}</span>
              <span class="text-xs font-black text-emerald-300">道德寓意</span>
            </div>
            <p class="text-sm text-emerald-100 font-bold leading-relaxed">${moral}</p>
          </div>
          ` : ""}

          ${gameQuestion ? `
          <button id="btn-to-quiz" class="mt-2 btn-game-orange text-white font-black text-base px-12 py-4 rounded-full shadow-xl border-2 border-white active:scale-95 transition-transform flex items-center gap-2 opacity-0" style="transition:opacity 0.7s ease;transition-delay:2.0s">
            <span class="flex items-center">${GAME_ICONS.trophy("w-5 h-5")}</span>
            <span>我听懂了！来闯关</span>
          </button>
          ` : ""}
        </main>
      </div>
    `;

    // Animate in
    this._timeout(() => {
      this.container.querySelectorAll(".idiom-char-anim").forEach(el => {
        el.style.opacity = "1";
        el.style.transform = "scale(1)";
      });
      ["#story-pinyin","#story-image","#story-desc","#story-body","#story-moral","#btn-to-quiz"].forEach(sel => {
        const el = this.container.querySelector(sel);
        if (el) el.style.opacity = "1";
      });
      soundAndFX.speakPriority(`${name}\u3002${desc}`, { kind: "sentence", priority: 1 });
    }, 80);

    const storyEl = this.container.querySelector("#story-text-body");
    const sentences = story.split(/[\u3002\uff01\uff1f]/).map(s => s.trim()).filter(Boolean);
    let isNarrating = false;
    let narrateIndex = 0;

    const clearSentHighlight = () => {
      if (storyEl) {
        storyEl.querySelectorAll(".story-sent").forEach(s => {
          s.classList.remove("bg-yellow-300/30", "text-yellow-200", "font-black", "ring-2", "ring-yellow-400/60");
        });
      }
    };

    const stopNarration = () => {
      isNarrating = false;
      clearSentHighlight();
      soundAndFX.stopSpeaking();
      const btn = this.container.querySelector("#btn-narrate");
      if (btn) {
        btn.innerHTML = `
          <span class="flex items-center">${GAME_ICONS.speaker("w-4 h-4")}</span>
          <span>分段高亮朗读</span>
        `;
        btn.classList.remove("bg-rose-600", "hover:bg-rose-500");
        btn.classList.add("btn-game-orange");
      }
    };
    this._addCleanup(stopNarration);

    const backBtn = this.container.querySelector("#btn-story-back");
    if (backBtn) {
      this._on(backBtn, "click", () => {
        stopNarration();
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        this.renderIdiomHall();
      });
    }

    const readSentenceStep = () => {
      if (!isNarrating || narrateIndex >= sentences.length) {
        stopNarration();
        return;
      }
      clearSentHighlight();
      const curEl = storyEl?.querySelector(`[data-si="${narrateIndex}"]`);
      if (curEl) {
        curEl.classList.add("bg-yellow-300/30", "text-yellow-200", "font-black", "ring-2", "ring-yellow-400/60");
      }
      const sentText = sentences[narrateIndex];
      narrateIndex++;
      soundAndFX.speak(sentText, () => {
        if (isNarrating) {
          this._timeout(readSentenceStep, 250);
        }
      });
    };

    const narrateBtn = this.container.querySelector("#btn-narrate");
    if (narrateBtn) {
      this._on(narrateBtn, "click", () => {
        soundAndFX.playPop();
        if (isNarrating) {
          stopNarration();
          return;
        }
        isNarrating = true;
        narrateIndex = 0;
        narrateBtn.innerHTML = `
          <span class="flex items-center animate-pulse">${GAME_ICONS.speaker("w-4 h-4")}</span>
          <span>停止朗读</span>
        `;
        narrateBtn.classList.remove("btn-game-orange");
        narrateBtn.classList.add("bg-rose-600", "hover:bg-rose-500");
        readSentenceStep();
      });
    }

    // 单句点击发音
    if (storyEl) {
      storyEl.querySelectorAll(".story-sent").forEach(sentEl => {
        this._on(sentEl, "click", () => {
          soundAndFX.playPop();
          stopNarration();
          const si = parseInt(sentEl.dataset.si, 10);
          clearSentHighlight();
          sentEl.classList.add("bg-yellow-300/30", "text-yellow-200", "font-black", "ring-2", "ring-yellow-400/60");
          if (sentences[si]) {
            soundAndFX.speak(sentences[si], () => {
              sentEl.classList.remove("bg-yellow-300/30", "text-yellow-200", "font-black", "ring-2", "ring-yellow-400/60");
            });
          }
        });
      });
    }

    const quizBtn = this.container.querySelector("#btn-to-quiz");
    if (quizBtn && gameQuestion) {
      this._on(quizBtn, "click", () => {
        stopNarration();
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        this._renderIdiomQuiz(idiom, db);
      });
    }
  }

export function _renderIdiomQuiz(idiom, db) {
    this.destroy();
    soundAndFX.stopSpeaking();
    const name = idiom.name || idiom.idiom || "";
    const quiz = idiom.gameQuestion;
    const chars = idiom.chars || Array.from(name);
    const QUIZ_TIME = 30;
    let triesLeft = 3;
    let stopTimer = null;
    const wrongSet = new Set();

    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex flex-col select-none overflow-hidden bg-gradient-to-b from-purple-950 via-indigo-950 to-purple-900 text-white" id="idiom-quiz-root">
        
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/20">
          <button id="btn-quiz-back" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer active:scale-95">
            <span class="flex items-center">${GAME_ICONS.back("w-4 h-4")}</span>
            <span>返回故事</span>
          </button>
          <span class="text-sm font-black text-yellow-300">国学成语小测验</span>
          <div class="w-20"></div>
        </header>

        <main class="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col items-center justify-center">
          <div class="w-full max-w-xl flex flex-col items-center text-center animate-scale-up">

            <div class="flex items-center gap-2 mb-5">
              ${chars.map(c => `<div class="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-white shadow-lg flex items-center justify-center"><span class="text-2xl font-black text-amber-950">${c}</span></div>`).join("")}
            </div>

            <div class="flex items-center gap-4 mb-5">
              <div class="relative w-16 h-16">
                <canvas id="quiz-ring-canvas" width="64" height="64"></canvas>
                <span id="quiz-timer-text" class="absolute inset-0 flex items-center justify-center text-base font-black text-yellow-300">${QUIZ_TIME}</span>
              </div>
              <div class="text-left">
                <div class="text-[10px] text-white/50 font-bold mb-1">剩余次数</div>
                <div class="flex gap-1.5">${Array(3).fill(0).map((_,i) => `<span class="quiz-heart w-4 h-4 rounded-full bg-rose-400 border border-rose-200 block transition-opacity" data-hi="${i}"></span>`).join("")}</div>
              </div>
            </div>

            <div class="bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/20 p-6 w-full shadow-2xl">
              <div class="flex items-center justify-center gap-2 mb-4">
                <span class="flex items-center">${GAME_ICONS.trophy("w-5 h-5")}</span>
                <span class="text-xs font-black bg-amber-400 text-amber-950 px-3 py-1 rounded-full">成语闯关小测验</span>
              </div>
              <h2 class="text-xl font-black text-yellow-300 mb-6 leading-relaxed">${quiz.question}</h2>
              <div class="flex flex-col gap-3" id="quiz-options">
                ${quiz.options.map((opt, idx) => `
                  <button class="idiom-opt text-left p-4 rounded-2xl bg-white/10 hover:bg-white/20 border-2 border-white/20 text-white font-black text-sm shadow active:scale-95 transition-all flex items-center gap-3 cursor-pointer" data-idx="${idx}">
                    <span class="w-7 h-7 rounded-full border-2 border-amber-300 flex items-center justify-center text-xs text-amber-300 font-bold flex-shrink-0">${String.fromCharCode(65+idx)}</span>
                    <span>${opt}</span>
                  </button>
                `).join("")}
              </div>
              <div id="quiz-feedback" class="mt-4 h-8 text-sm font-black"></div>
            </div>
          </div>
        </main>

        <div id="idiom-win" class="fixed inset-0 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center z-50 hidden animate-scale-up">
          <div>${GAME_ICONS.trophy("w-14 h-14")}</div>
          <h2 class="text-3xl font-black text-yellow-300 mt-4 mb-2">答对了！太聪明了！</h2>
          <p class="text-white/70 text-sm font-bold mb-2">你已经掌握了"${name}"的故事！</p>
          <div id="quiz-win-coins" class="candy-pill px-6 py-2 mb-6 text-yellow-300 font-black flex items-center gap-2">
            ${GAME_ICONS.coin("w-5 h-5")} 获得 8 凯茜星币
          </div>
          <div class="flex gap-3">
            <button id="btn-win-more" class="btn-game-orange text-white font-black px-8 py-3 rounded-full cursor-pointer active:scale-95">再学一个</button>
            <button id="btn-win-home" class="btn-game-wood text-white font-black px-8 py-3 rounded-full cursor-pointer active:scale-95">返回大厅</button>
          </div>
        </div>

        <div id="idiom-fail" class="fixed inset-0 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center z-50 hidden animate-scale-up">
          <div>${GAME_ICONS.back("w-14 h-14")}</div>
          <h2 class="text-2xl font-black text-rose-300 mt-4 mb-2">次数用完了！</h2>
          <p class="text-white/70 text-sm font-bold mb-1">正确答案是：</p>
          <p class="text-yellow-300 font-black text-base mb-4">${String.fromCharCode(65 + quiz.correctIndex)}. ${quiz.options[quiz.correctIndex]}</p>
          <div class="flex gap-3 mt-4">
            <button id="btn-fail-retry" class="btn-game-orange text-white font-black px-8 py-3 rounded-full cursor-pointer active:scale-95">再看一遍故事</button>
            <button id="btn-fail-home" class="btn-game-wood text-white font-black px-8 py-3 rounded-full cursor-pointer active:scale-95">返回大厅</button>
          </div>
        </div>
      </div>
    `;

    soundAndFX.speakPriority(quiz.question, { kind: "sentence", emotion: "question" });

    const canvas = this.container.querySelector("#quiz-ring-canvas");
    const timerText = this.container.querySelector("#quiz-timer-text");
    const feedback = this.container.querySelector("#quiz-feedback");
    const winModal = this.container.querySelector("#idiom-win");
    const failModal = this.container.querySelector("#idiom-fail");
    const winCoinsEl = this.container.querySelector("#quiz-win-coins");

    const drawRing = (remain) => {
      if (!canvas || typeof canvas.getContext !== "function") return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const cx = 32, cy = 32, r = 27;
      ctx.clearRect(0, 0, 64, 64);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 5; ctx.stroke();
      const frac = Math.max(remain, 0) / QUIZ_TIME;
      const color = remain <= 5 ? "#f87171" : remain <= 10 ? "#fbbf24" : "#34d399";
      ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
      ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.stroke();
      if (timerText) { timerText.textContent = Math.max(remain, 0); timerText.style.color = color; }
    };
    drawRing(QUIZ_TIME);

    const updateHearts = () => {
      this.container.querySelectorAll(".quiz-heart").forEach((h, i) => {
        h.style.opacity = i < triesLeft ? "1" : "0.2";
      });
    };
    updateHearts();

    const endQuiz = (won) => {
      if (stopTimer) { stopTimer(); stopTimer = null; }
      const relatedChars = idiom.chars || Array.from(idiom.name || "");
      writeKnownCharsReview(relatedChars, won);
      if (won) {
        soundAndFX.playVictoryFanfare();
        soundAndFX.triggerConfetti(this.container);
        soundAndFX.triggerCoinFly(this.container);
        const coins = triesLeft >= 3 ? 8 : triesLeft === 2 ? 5 : 3;
        ebbinghausManager.addCoins(coins);
        if (winCoinsEl) winCoinsEl.innerHTML = `${GAME_ICONS.coin("w-5 h-5")} 获得 ${coins} 凯茜星币${triesLeft < 3 ? " (尝试加成)" : ""}`;
        const id = idiom.id || idiom.name || "";
        if (id && !ebbinghausManager.progress.learnedIdioms) ebbinghausManager.progress.learnedIdioms = [];
        if (id && !ebbinghausManager.progress.learnedIdioms.includes(id)) {
          ebbinghausManager.progress.learnedIdioms.push(id);
          ebbinghausManager.save();
        }
        if (winModal) winModal.classList.remove("hidden");
      } else {
        soundAndFX.playSoftError();
        if (failModal) failModal.classList.remove("hidden");
      }
    };

    stopTimer = startCountdown(QUIZ_TIME, (remain) => drawRing(remain), () => endQuiz(false));
    this._addCleanup(() => { if (stopTimer) stopTimer(); });

    const quizBackBtn = this.container.querySelector("#btn-quiz-back");
    if (quizBackBtn) {
      this._on(quizBackBtn, "click", () => {
        if (stopTimer) { stopTimer(); stopTimer = null; }
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        this._renderIdiomStory(idiom, db);
      });
    }

    this.container.querySelectorAll(".idiom-opt").forEach(btn => {
      this._on(btn, "click", () => {
        const idx = parseInt(btn.dataset.idx, 10);
        if (wrongSet.has(idx) || !stopTimer) return;
        if (idx === quiz.correctIndex) {
          btn.classList.add("ring-4", "ring-emerald-400", "bg-emerald-500/30");
          soundAndFX.playSuccessSound();
          this._timeout(() => {
            soundAndFX.speakPriority("完全正确！理解力超群！", { kind: "sentence", emotion: "excited" });
          }, 200);
          if (feedback) feedback.innerHTML = '<span class="text-emerald-300 text-base">完全正确！理解力超群！</span>';
          this._timeout(() => endQuiz(true), 1600);
        } else {
          wrongSet.add(idx);
          triesLeft--;
          btn.classList.add("animate-shake", "ring-4", "ring-rose-400", "opacity-40", "pointer-events-none");
          btn.disabled = true;
          soundAndFX.playSoftError();
          updateHearts();
          if (triesLeft <= 0) {
            if (feedback) feedback.innerHTML = `<span class="text-rose-300">次数用完！正确答案是 ${String.fromCharCode(65 + quiz.correctIndex)}</span>`;
            this._timeout(() => endQuiz(false), 1200);
          } else {
            this._timeout(() => {
              soundAndFX.speakPriority("再仔细想想哦，别灰心！", { kind: "sentence", emotion: "correction" });
            }, 180);
            if (feedback) feedback.innerHTML = `<span class="text-rose-300">再想想吧，还剩 ${triesLeft} 次机会</span>`;
            this._timeout(() => btn.classList.remove("animate-shake"), 600);
          }
        }
      });
    });

    const winMoreBtn = this.container.querySelector("#btn-win-more");
    if (winMoreBtn) {
      this._on(winMoreBtn, "click", () => {
        if (stopTimer) { stopTimer(); stopTimer = null; }
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        const currentIdx = Array.isArray(db) ? db.findIndex(x => (x.id || x.name) === (idiom.id || idiom.name)) : -1;
        if (currentIdx >= 0 && currentIdx + 1 < db.length) {
          this._renderIdiomStory(db[currentIdx + 1], db);
        } else {
          this.renderIdiomHall();
        }
      });
    }

    const winHomeBtn = this.container.querySelector("#btn-win-home");
    if (winHomeBtn) {
      this._on(winHomeBtn, "click", () => {
        if (stopTimer) { stopTimer(); stopTimer = null; }
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        this.currentMode = null;
        this.render();
      });
    }

    const failRetryBtn = this.container.querySelector("#btn-fail-retry");
    if (failRetryBtn) {
      this._on(failRetryBtn, "click", () => {
        if (stopTimer) { stopTimer(); stopTimer = null; }
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        this._renderIdiomStory(idiom, db);
      });
    }

    const failHomeBtn = this.container.querySelector("#btn-fail-home");
    if (failHomeBtn) {
      this._on(failHomeBtn, "click", () => {
        if (stopTimer) { stopTimer(); stopTimer = null; }
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        this.currentMode = null;
        this.render();
      });
    }
  }

  // ----------------------------------------------------
