/** PlayModule mode — Word Expedition (汉字探险队) */
import { mountGameShell, showGameToast } from "../../components/SharedShell.js";
import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";
import { ebbinghausManager } from "../ebbinghaus.js";
import { eventBus } from "../eventBus.js";

const STAGES = [
  { id: 1, type: "spotter", label: "火眼金睛" },
  { id: 2, type: "meteor", label: "陨石防御" },
  { id: 3, type: "treasure", label: "神秘宝箱" },
  { id: 4, type: "match", label: "汉字消消乐" },
  { id: 5, type: "boss", label: "难字歼灭战 (Boss)" }
];

const BUFF_POOL = [
  { id: "TIME_WARP", label: "时间怀表", desc: "加时卡：倒计时游戏初始时间增加 15 秒", iconRender: () => GAME_ICONS.compass("w-12 h-12") },
  { id: "SLOW_MOTION", label: "缓慢光环", desc: "减速：陨石等动态元素速度降低 20%", iconRender: () => GAME_ICONS.gem("w-12 h-12") },
  { id: "COIN_MULT", label: "招财猫", desc: "双倍奖励：本次探险结束时获得双倍金币", iconRender: () => GAME_ICONS.coin("w-12 h-12") }
];

export function renderWordExpedition() {
  // Initialize state if not present
  if (!this.expeditionState) {
    this.expeditionState = {
      stage: 1,
      buffs: []
    };
  }

  const { stage, buffs } = this.expeditionState;

  if (stage > STAGES.length) {
    // Expedition Complete!
    return this.renderExpeditionVictory();
  }

  const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
    activeMode: "play",
    heading: "汉字探险队"
  });
  this._addCleanup(destroyShell);

  const currentStageInfo = STAGES[stage - 1];

  let mapHtml = `
    <div class="relative w-full max-w-4xl mx-auto flex flex-col items-center select-none py-8 animate-fade-in">
      <h2 class="text-3xl font-black text-amber-600 mb-2 drop-shadow-sm">探险路线图</h2>
      <p class="text-sm text-gray-500 font-bold mb-8">第 ${stage} 关：${currentStageInfo.label}</p>
      
      <div class="flex items-center justify-between w-full max-w-2xl relative mb-10">
        <!-- Connecting Line -->
        <div class="absolute top-1/2 left-0 right-0 h-2 bg-amber-200 -z-10 rounded-full transform -translate-y-1/2"></div>
        <div class="absolute top-1/2 left-0 h-2 bg-amber-500 -z-10 rounded-full transform -translate-y-1/2 transition-all duration-1000" style="width: ${(stage - 1) / (STAGES.length - 1) * 100}%"></div>
  `;

  STAGES.forEach((s) => {
    const isCompleted = s.id < stage;
    const isCurrent = s.id === stage;
    
    let bgColor = "bg-white border-gray-300";
    let iconColor = "text-gray-400";
    let scale = "scale-100";
    let animation = "";

    if (isCompleted) {
      bgColor = "bg-amber-100 border-amber-500";
      iconColor = "text-amber-500";
    } else if (isCurrent) {
      bgColor = "bg-amber-500 border-white shadow-xl shadow-amber-500/50";
      iconColor = "text-white";
      scale = "scale-125";
      animation = "animate-bounce";
    }

    let icon = GAME_ICONS.swords("w-6 h-6");
    if (s.type === "treasure") icon = GAME_ICONS.star("w-6 h-6");
    if (s.type === "boss") icon = GAME_ICONS.monster("w-6 h-6");

    mapHtml += `
      <div class="flex flex-col items-center relative z-10">
        <div class="w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${bgColor} ${iconColor} ${scale} ${animation}">
          ${icon}
        </div>
        <div class="mt-2 text-xs font-bold ${isCurrent ? 'text-amber-600' : 'text-gray-500'}">
          ${s.label}
        </div>
      </div>
    `;
  });

  mapHtml += `</div>`; // End map container

  // Buff Display
  if (buffs.length > 0) {
    mapHtml += `
      <div class="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-md border-2 border-amber-200 mb-8 w-full max-w-md">
        <h3 class="text-sm font-black text-amber-700 mb-2 flex items-center gap-1">
          ${GAME_ICONS.star("w-4 h-4")} 你的探险遗物 (Buff)
        </h3>
        <div class="flex flex-wrap gap-2">
    `;
    buffs.forEach(b => {
      mapHtml += `
        <div class="bg-amber-50 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-800 border border-amber-200 flex items-center gap-1.5 shadow-sm tooltip" title="${b.desc}">
          <span class="inline-flex items-center w-4 h-4">${b.iconRender ? b.iconRender() : (b.icon || "")}</span> ${b.label}
        </div>
      `;
    });
    mapHtml += `</div></div>`;
  }

  // Action Button
  let btnLabel = currentStageInfo.type === "treasure" ? "开启宝箱" : "进入关卡";
  let btnIcon = currentStageInfo.type === "treasure" ? GAME_ICONS.star("w-5 h-5") : GAME_ICONS.swords("w-5 h-5");

  mapHtml += `
      <button id="expedition-start-btn" class="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-lg py-4 px-12 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center gap-2">
        ${btnIcon} ${btnLabel}
      </button>
    </div>
  `;

  mainEl.innerHTML = mapHtml;

  const startBtn = mainEl.querySelector("#expedition-start-btn");
  startBtn.addEventListener("click", () => {
    soundAndFX.playPop();
    
    if (currentStageInfo.type === "treasure") {
      this.renderExpeditionTreasure();
    } else {
      // Delegate to the specific minigame, telling it we're in expedition mode
      this.currentMode = currentStageInfo.type;
      this.render(); 
    }
  });

  soundAndFX.playVictoryFanfare();
  if (stage === 1) {
    soundAndFX.speakPriority("汉字探险队，出发！");
  } else {
    soundAndFX.speakPriority(`第${stage}关，准备好迎接挑战了吗？`);
  }
}

export function renderExpeditionTreasure() {
  const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
    activeMode: "play",
    heading: "神秘宝箱"
  });
  this._addCleanup(destroyShell);

  mainEl.innerHTML = `
    <div class="relative w-full h-full flex flex-col items-center justify-center p-6 animate-fade-in">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-black text-amber-500 mb-2 drop-shadow-sm">发现了一个宝箱！</h2>
        <p class="text-gray-500 font-bold">请选择一件遗物作为你的探险增益</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        ${BUFF_POOL.map(buff => `
          <div class="buff-card bg-white rounded-3xl p-6 shadow-xl border-4 border-amber-200 hover:border-amber-400 cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-2 flex flex-col items-center text-center group" data-buff-id="${buff.id}">
            <div class="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-4 shadow-inner group-hover:bg-amber-100 transition-colors">
              ${buff.iconRender ? buff.iconRender() : GAME_ICONS.gem("w-12 h-12")}
            </div>
            <h3 class="text-xl font-black text-gray-800 mb-2">${buff.label}</h3>
            <p class="text-sm text-gray-500 font-bold leading-relaxed">${buff.desc}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  const cards = mainEl.querySelectorAll(".buff-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const buffId = card.getAttribute("data-buff-id");
      const buff = BUFF_POOL.find(b => b.id === buffId);
      
      this.expeditionState.buffs.push(buff);
      this.expeditionState.stage++;
      
      soundAndFX.playPop();
      soundAndFX.speakPriority(`获得了 ${buff.label}！`);
      
      showGameToast(`获得了增益：${buff.label}`);
      
      setTimeout(() => {
        this.currentMode = "expedition";
        this.renderWordExpedition();
      }, 1500);
    });
  });

  soundAndFX.playVictoryFanfare();
  soundAndFX.speakPriority("哇，你发现了一个宝箱，快选择一个增益吧！");
}

export function renderExpeditionVictory() {
  const { content: mainEl, destroy: destroyShell } = mountGameShell(this.container, {
    activeMode: "play",
    heading: "探险胜利"
  });
  this._addCleanup(destroyShell);

  const hasCoinMult = this.expeditionState.buffs.some(b => b.id === "COIN_MULT");
  const rewardCoins = hasCoinMult ? 200 : 100;

  mainEl.innerHTML = `
    <div class="relative w-full h-full flex flex-col items-center justify-center p-6 animate-fade-in text-center">
      <div class="w-48 h-48 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-2xl mb-8 animate-bounce-slow">
        ${GAME_ICONS.trophy("w-28 h-28")}
      </div>
      <h1 class="text-5xl font-black text-amber-600 mb-4 drop-shadow-md">探险成功！</h1>
      <p class="text-xl text-gray-600 font-bold mb-8">恭喜你通过了所有关卡，你真是太棒了！</p>
      
      <div class="bg-white rounded-3xl p-6 shadow-xl border-4 border-yellow-300 mb-10 flex flex-col items-center">
        <div class="text-sm text-gray-500 font-bold mb-2">本次探险奖励</div>
        <div class="flex items-center gap-3">
          ${GAME_ICONS.coin("w-10 h-10")}
          <span class="text-4xl font-black text-yellow-400">+${rewardCoins}</span>
        </div>
        ${hasCoinMult ? '<div class="text-xs text-amber-600 font-bold mt-2 bg-amber-50 px-3 py-1 rounded-full">已应用双倍金币增益</div>' : ''}
      </div>

      <button id="expedition-done-btn" class="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black text-xl py-4 px-12 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all">
        返回游乐场
      </button>
    </div>
  `;

  ebbinghausManager.addCoins(rewardCoins, "探险模式通关奖励");
  ebbinghausManager.save();
  eventBus.emit("app:coins-changed", { delta: rewardCoins, reason: "expedition_win" });

  const doneBtn = mainEl.querySelector("#expedition-done-btn");
  doneBtn.addEventListener("click", () => {
    soundAndFX.playPop();
    this.expeditionState = null; // Reset state
    this.currentMode = null;     // Back to hub
    this.isExpeditionActive = false; // Add this
    this.render();
  });

  soundAndFX.playVictoryFanfare();
  soundAndFX.speakPriority("探险成功！你真是太厉害啦！");
}
