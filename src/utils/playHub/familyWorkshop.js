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
import { triggerHapticSuccess, triggerHapticWarning } from "../haptics.js";
import {
  shuffle,
  pickReviewChars,
  buildOptions,
  buildMatchPairs,
  spawnFloatingText,
  startCountdown,
  writeKnownCharsReview,
} from "./playHelpers.js";

export function renderFamilyWorkshop() {
    this.selectedFamilyId = this.selectedFamilyId || RADICAL_FAMILIES[0].id;
    const currentFamily = RADICAL_FAMILIES.find((f) => f.id === this.selectedFamilyId) || RADICAL_FAMILIES[0];

    // 初始化已解锁的本家族成员
    if (!this.unlockedFamilyMembers) {
      this.unlockedFamilyMembers = new Set();
    }

    const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
      activeMode: "play",
      heading: "汉字魔法积木屋"
    });
    this._addCleanup(destroyShell);

    const unlockedCount = currentFamily.members.filter(m => this.unlockedFamilyMembers.has(m.char)).length;

    mainEl.innerHTML = `
      <div class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pb-8 overflow-y-auto no-scrollbar max-h-[calc(100vh-100px)]">
        
        <div class="w-full flex flex-col sm:flex-row items-center justify-between bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl border-2 border-emerald-200 mb-6 gap-4">
          <div class="flex items-center gap-3">
            <button id="btn-family-back" class="px-4 py-2 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-950 flex items-center gap-1.5 shadow-md active:scale-90 transition-transform cursor-pointer font-black text-xs" title="返回大地图">
              <span class="flex items-center">${GAME_ICONS.home("w-4 h-4")}</span>
              <span>返回大地图</span>
            </button>
            <div>
              <h1 class="text-base font-black text-emerald-950 flex items-center gap-2">
                <span class="flex items-center">${GAME_ICONS.sparkle("w-5 h-5")}</span>
                <span>汉字魔法积木屋 · 字族构字工坊</span>
              </h1>
              <p class="text-xs text-emerald-700 font-semibold">${currentFamily.story}</p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 bg-emerald-50 p-1.5 rounded-full border border-emerald-200 flex-wrap justify-center">
            ${RADICAL_FAMILIES.map(fam => `
              <button class="btn-select-family px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                this.selectedFamilyId === fam.id
                  ? "bg-emerald-700 text-white shadow-md scale-105"
                  : "text-emerald-900 hover:bg-emerald-100"
              }" data-fid="${fam.id}">
                ${fam.name}
              </button>
            `).join("")}
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          
          <div class="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-emerald-200 flex flex-col items-center justify-between relative overflow-hidden min-h-[420px]">
            
            <div class="w-full flex items-center justify-between mb-3">
              <span class="text-xs font-black bg-emerald-100 text-emerald-800 px-3.5 py-1 rounded-full border border-emerald-300">字根积木底座</span>
              <span class="text-xs font-bold text-gray-500">点击偏旁积木，合体变新字！</span>
            </div>

            <!-- 国风字族专属情境画卷 -->
            <div class="relative w-full rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-md mb-2 h-28 sm:h-36 group shrink-0">
              <img src="${currentFamily.image || 'assets/images/family_qing.webp'}" alt="${escapeHtml(currentFamily.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div class="absolute bottom-2 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold border border-white/20 flex items-center gap-1.5 shadow">
                <span>${escapeHtml(currentFamily.name)} · 专属意境画卷</span>
              </div>
            </div>

            <div class="relative my-6 flex flex-col items-center justify-center">
              
              <div id="family-stage-block" class="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-gradient-to-tr from-amber-200 via-amber-100 to-yellow-50 border-4 border-amber-400 shadow-[0_12px_36px_rgba(217,119,6,0.3)] flex flex-col items-center justify-center transition-all duration-500">
                <span id="family-current-pinyin" class="text-xl sm:text-2xl font-black text-amber-700 mb-1">${escapeHtml(currentFamily.pinyin)}</span>
                <span id="family-current-char" class="text-7xl sm:text-8xl font-black text-amber-950 font-serif drop-shadow-md">${escapeHtml(currentFamily.rootChar)}</span>
                
                <div id="family-sparkle-overlay" class="absolute inset-0 rounded-3xl pointer-events-none opacity-0 transition-opacity duration-300"></div>
              </div>

              <div id="family-mnemonic-bubble" class="mt-4 bg-emerald-50 border-2 border-emerald-300 px-5 py-2.5 rounded-2xl shadow-md text-xs sm:text-sm font-black text-emerald-950 text-center max-w-sm transition-all duration-300">
                ${escapeHtml(currentFamily.desc)}
              </div>

            </div>

            <div class="w-full bg-emerald-50/80 p-3.5 rounded-2xl border-2 border-emerald-200">
              <div class="text-[11px] font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                <span class="flex items-center">${GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
                <span>点击或拖拽偏旁积木，投入工坊：</span>
              </div>
              <div class="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 justify-center">
                ${currentFamily.members.map((m, idx) => `
                  <button class="btn-snap-radical group relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-white to-amber-50 border-2 border-emerald-400 shadow-lg hover:border-emerald-600 hover:scale-110 active:scale-95 transition-all flex flex-col items-center justify-center shrink-0 cursor-pointer touch-none" draggable="true" data-idx="${idx}">
                    <span class="text-2xl sm:text-3xl font-black text-emerald-900 group-hover:text-amber-600 font-serif pointer-events-none">${m.radical}</span>
                    <span class="text-[9px] font-bold text-gray-500 line-clamp-1 pointer-events-none">${m.radicalName}</span>
                  </button>
                `).join("")}
              </div>
            </div>

          </div>

          <div class="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-emerald-200 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-emerald-100 mb-4">
                <div>
                  <h3 class="text-base font-black text-emerald-950 flex items-center gap-1.5">
                    <span class="flex items-center">${GAME_ICONS.crown("w-5 h-5")}</span>
                    <span>${currentFamily.name} · 字族宝藏谱</span>
                  </h3>
                  <span class="text-xs text-gray-500 font-semibold">点亮每一个字族成员，成为识字宗师</span>
                </div>
                <span id="family-progress-chip" class="text-xs font-black bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
                  ${unlockedCount} / ${currentFamily.members.length}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto no-scrollbar">
                ${currentFamily.members.map((m) => {
                  const isUnlocked = this.unlockedFamilyMembers.has(m.char);
                  return `
                    <div class="family-member-card p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                      isUnlocked
                        ? "bg-emerald-50/80 border-emerald-400 shadow-md"
                        : "bg-gray-50 border-dashed border-gray-300 opacity-70"
                    }" data-char="${m.char}">
                      <div class="w-12 h-12 rounded-xl ${
                        isUnlocked ? "bg-white text-emerald-900 shadow" : "bg-gray-200 text-gray-400"
                      } flex flex-col items-center justify-center shrink-0 border border-emerald-200 font-serif">
                        <span class="text-xl font-black">${isUnlocked ? m.char : "?"}</span>
                        <span class="text-[9px] font-bold text-emerald-700">${isUnlocked ? m.pinyin : ""}</span>
                      </div>
                      <div class="flex flex-col flex-1 min-w-0">
                        <span class="text-xs font-black text-emerald-950 truncate">${isUnlocked ? m.word : "待解锁"}</span>
                        <span class="text-[10px] text-gray-500 truncate">${isUnlocked ? m.radicalName : m.radical + " + " + currentFamily.rootChar}</span>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>

            <div class="mt-4 bg-amber-50 rounded-2xl p-3.5 border border-amber-200 flex items-center gap-3">
              <span class="flex items-center shrink-0">${GAME_ICONS.sparkle("w-6 h-6")}</span>
              <p class="text-xs text-amber-900 font-semibold leading-snug">
                掌握偏旁表意规律，通过字根就能一举掌握一整串字，写错字率降低 90%！
              </p>
            </div>

          </div>

        </div>

      </div>
    `;

    // 绑定返回
    const backBtn = mainEl.querySelector("#btn-family-back");
    if (backBtn) {
      this._on(backBtn, "click", () => {
        soundAndFX.stopSpeaking();
        soundAndFX.playPop();
        this.currentMode = null;
        this._busEmit(EVENTS.SWITCH_MODE, { mode: "map" });
      });
    }

    // 切换家族
    mainEl.querySelectorAll(".btn-select-family").forEach(btn => {
      this._on(btn, "click", () => {
        soundAndFX.playPop();
        this.selectedFamilyId = btn.dataset.fid;
        this.renderFamilyWorkshop();
      });
    });

    // 偏旁拼插互动（支持点击与触屏拖拽双模）
    const stageBlock = mainEl.querySelector("#family-stage-block");
    const charEl = mainEl.querySelector("#family-current-char");
    const pinyinEl = mainEl.querySelector("#family-current-pinyin");
    const mnemonicBubble = mainEl.querySelector("#family-mnemonic-bubble");

    const applyRadicalAssembly = (member) => {
      if (!member) return;

      triggerHapticSuccess();
      soundAndFX.playSuccess();
      this.unlockedFamilyMembers.add(member.char);
      ebbinghausManager.addCoins(5);
      ebbinghausManager.addStars(1);
      writeKnownCharsReview([member.char], true);

      // 动画触发
      if (stageBlock) {
        stageBlock.classList.add("scale-110", "shadow-[0_0_30px_rgba(16,185,129,0.8)]");
        setTimeout(() => stageBlock.classList.remove("scale-110", "shadow-[0_0_30px_rgba(16,185,129,0.8)]"), 600);
      }

      if (charEl) {
        charEl.textContent = member.char;
        charEl.classList.add("text-emerald-900");
        charEl.classList.remove("text-amber-950");
      }
      if (pinyinEl) {
        pinyinEl.textContent = member.pinyin;
        pinyinEl.classList.add("text-emerald-700");
      }
      if (mnemonicBubble) {
        mnemonicBubble.textContent = member.mnemonic;
        mnemonicBubble.classList.add("bg-emerald-100", "scale-105");
        setTimeout(() => mnemonicBubble.classList.remove("scale-105"), 300);
      }

      // 语音朗读口诀（错开 200ms 避免与成功音效并发重叠）
      this._timeout(() => {
        soundAndFX.speakPriority(member.mnemonic, { kind: "char", priority: 1 });
      }, 200);

      // 更新右侧图鉴卡片状态与统计
      const targetCard = mainEl.querySelector(`.family-member-card[data-char="${member.char}"]`);
      if (targetCard) {
        targetCard.className = "family-member-card p-3 rounded-2xl border-2 transition-all flex items-center gap-3 bg-emerald-50/80 border-emerald-400 shadow-md animate-bounce-cathy cursor-pointer hover:scale-105";
        targetCard.innerHTML = `
          <div class="w-12 h-12 rounded-xl bg-white text-emerald-900 shadow flex flex-col items-center justify-center shrink-0 border border-emerald-200 font-serif">
            <span class="text-xl font-black">${escapeHtml(member.char)}</span>
            <span class="text-[9px] font-bold text-emerald-700">${escapeHtml(member.pinyin)}</span>
          </div>
          <div class="flex flex-col flex-1 min-w-0">
            <span class="text-xs font-black text-emerald-950 truncate">${escapeHtml(member.word)}</span>
            <span class="text-[10px] text-gray-500 truncate">${escapeHtml(member.radicalName)}</span>
          </div>
        `;
      }

      const progressChip = mainEl.querySelector("#family-progress-chip");
      const count = currentFamily.members.filter(m => this.unlockedFamilyMembers.has(m.char)).length;
      if (progressChip) {
        progressChip.textContent = `${count} / ${currentFamily.members.length}`;
      }

      // 全家福大团圆通关庆祝
      if (count === currentFamily.members.length) {
        this._timeout(() => {
          soundAndFX.stopSpeaking();
          soundAndFX.playVictoryFanfare();
          soundAndFX.triggerConfetti(this.container);
          ebbinghausManager.addCoins(15);
          ebbinghausManager.addStars(2);
          if (mnemonicBubble) {
            mnemonicBubble.textContent = `大圆满！【${currentFamily.name}】全部成员集齐！奖励 15 星币 + 2 颗星星！`;
            mnemonicBubble.className = "mt-4 bg-amber-100 border-2 border-amber-400 px-6 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-black text-amber-950 text-center max-w-md animate-bounce-slow";
          }
          this._timeout(() => {
            soundAndFX.speakPriority(`太棒啦！你已经集齐了${currentFamily.name}的全部成员！`, { kind: "sentence", emotion: "excited" });
          }, 250);
        }, 800);
      }
    };

    // HTML5 Drag & Drop 磁吸
    if (stageBlock) {
      this._on(stageBlock, "dragover", (e) => {
        e.preventDefault();
        stageBlock.classList.add("scale-105");
      });
      this._on(stageBlock, "dragleave", () => {
        stageBlock.classList.remove("scale-105");
      });
      this._on(stageBlock, "drop", (e) => {
        e.preventDefault();
        stageBlock.classList.remove("scale-105");
        const idxStr = e.dataTransfer ? e.dataTransfer.getData("text/plain") : null;
        if (idxStr !== null && idxStr !== "") {
          const idx = parseInt(idxStr, 10);
          applyRadicalAssembly(currentFamily.members[idx]);
        }
      });
    }

    // 绑定偏旁按钮（点击与触摸拖拽）
    mainEl.querySelectorAll(".btn-snap-radical").forEach(btn => {
      const idx = parseInt(btn.dataset.idx, 10);
      const member = currentFamily.members[idx];
      if (!member) return;

      this._on(btn, "dragstart", (e) => {
        if (e.dataTransfer) {
          e.dataTransfer.setData("text/plain", String(idx));
        }
      });

      this._on(btn, "pointerdown", (e) => {
        const startX = e.clientX;
        const startY = e.clientY;
        let hasMoved = false;
        let ghostEl = null;

        const onPointerMove = (moveEvt) => {
          const dx = moveEvt.clientX - startX;
          const dy = moveEvt.clientY - startY;
          if (!hasMoved && Math.hypot(dx, dy) > 8) {
            hasMoved = true;
            ghostEl = document.createElement("div");
            ghostEl.className = "fixed pointer-events-none z-50 w-16 h-16 rounded-2xl bg-emerald-600 border-2 border-amber-300 text-white font-black text-3xl flex items-center justify-center shadow-2xl scale-110 font-serif";
            ghostEl.textContent = member.radical;
            document.body.appendChild(ghostEl);
          }
          if (ghostEl) {
            ghostEl.style.left = `${moveEvt.clientX - 32}px`;
            ghostEl.style.top = `${moveEvt.clientY - 32}px`;
            if (stageBlock) {
              const rect = stageBlock.getBoundingClientRect();
              const inZone = moveEvt.clientX >= rect.left && moveEvt.clientX <= rect.right &&
                             moveEvt.clientY >= rect.top && moveEvt.clientY <= rect.bottom;
              if (inZone) {
                stageBlock.classList.add("scale-105");
              } else {
                stageBlock.classList.remove("scale-105");
              }
            }
          }
        };

        const onPointerUp = (upEvt) => {
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("pointerup", onPointerUp);
          if (stageBlock) stageBlock.classList.remove("scale-105");
          if (ghostEl) {
            ghostEl.remove();
            ghostEl = null;
          }
          if (hasMoved) {
            if (stageBlock) {
              const rect = stageBlock.getBoundingClientRect();
              const inZone = upEvt.clientX >= rect.left && upEvt.clientX <= rect.right &&
                             upEvt.clientY >= rect.top && upEvt.clientY <= rect.bottom;
              if (inZone) {
                applyRadicalAssembly(member);
              }
            }
          } else {
            applyRadicalAssembly(member);
          }
        };

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
      });
    });

    // 已解锁图鉴卡片点击重温发音口诀
    mainEl.querySelectorAll(".family-member-card").forEach(card => {
      this._on(card, "click", () => {
        const ch = card.dataset.char;
        if (!this.unlockedFamilyMembers.has(ch)) return;
        const m = currentFamily.members.find(x => x.char === ch);
        if (!m) return;
        const stageBlock = mainEl.querySelector("#family-stage-block");
        const charEl = mainEl.querySelector("#family-current-char");
        const pinyinEl = mainEl.querySelector("#family-current-pinyin");
        const mnemonicBubble = mainEl.querySelector("#family-mnemonic-bubble");
        if (stageBlock) {
          stageBlock.classList.add("scale-105", "shadow-[0_0_20px_rgba(16,185,129,0.5)]");
          setTimeout(() => stageBlock.classList.remove("scale-105", "shadow-[0_0_20px_rgba(16,185,129,0.5)]"), 350);
        }
        if (charEl) { charEl.textContent = m.char; charEl.classList.add("text-emerald-900"); }
        if (pinyinEl) { pinyinEl.textContent = m.pinyin; pinyinEl.classList.add("text-emerald-700"); }
        if (mnemonicBubble) {
          mnemonicBubble.textContent = `【${m.char}】${m.pinyin}：${m.mnemonic}，常用词：${m.word}`;
          mnemonicBubble.classList.add("bg-emerald-100");
        }
        soundAndFX.speakPriority(`${m.char}。${m.mnemonic}`, { kind: "char", priority: 1 });
      });
    });
  }

