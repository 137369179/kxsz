import{B as b,e as c,C as d,G as l,a as i,E as h}from"./index-CObQJZ8f.js";class u extends b{constructor(e){super(e),this.maxHp=100,this.playerHp=100,this.bossHp=100,this.currentRound=0,this.options=[],this.targetChar=null,this.pool=[],this.isAnimating=!1}render(){this.destroy();const e=Object.keys(c.progress.charRecords||{});e.length>=4?this.pool=d.filter(a=>e.includes(a.id)):this.pool=d.filter(a=>(a.stage||1)===1).slice(0,20),this.pool.length===0&&(this.pool=d.slice(0,20)),this.playerHp=this.maxHp,this.bossHp=this.maxHp,this.currentRound=1;const t=c.progress.profile||{name:"凯茜小勇士",avatar:"assets/images/cathy_mascot.webp"},r=t.avatar||"assets/images/cathy_mascot.webp";this.container.innerHTML=`
      <div class="relative w-full h-full min-h-[640px] bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-900 overflow-hidden flex flex-col font-sans select-none">
        
        <div class="absolute inset-0 z-0 opacity-40 pointer-events-none">
           <div class="absolute top-10 left-10 w-96 h-96 bg-fuchsia-600 rounded-full blur-[120px]"></div>
           <div class="absolute bottom-10 right-10 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
        </div>

        <button id="btn-pk-battle-exit" class="absolute top-5 left-6 z-50 bg-black/60 hover:bg-black/80 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-full border-2 border-amber-300 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer shadow-2xl" title="退出竞技场返回大地图">
          <span class="flex items-center">${l.home("w-4 h-4")}</span>
          <span>返回地图</span>
        </button>

        <div class="relative z-10 w-full p-6 flex items-center justify-between pl-36">
           <div class="flex items-center gap-3 sm:gap-4">
              <div class="w-14 h-14 sm:w-16 sm:h-16 aspect-square rounded-full bg-slate-200 border-4 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)] flex items-center justify-center overflow-hidden shrink-0">
                 <img src="${r}" class="w-full h-full object-cover rounded-full" alt="player" onerror="this.src='assets/images/cathy_mascot.webp'" />
              </div>
              <div class="flex flex-col gap-1">
                 <span class="text-white font-black text-sm drop-shadow-md">${t.name||"凯茜小勇士"}</span>
                 <div class="w-48 h-5 bg-black/50 rounded-full border border-white/20 overflow-hidden">
                    <div id="pk-player-hp" class="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-300 w-full"></div>
                 </div>
              </div>
           </div>

           <div class="text-4xl font-black text-yellow-400 italic drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] flex items-center gap-2">
              <span class="flex items-center">${l.swords("w-8 h-8")}</span>
              <span>VS</span>
           </div>

           <div class="flex items-center gap-3 sm:gap-4 flex-row-reverse">
              <div class="w-14 h-14 sm:w-16 sm:h-16 aspect-square rounded-full bg-slate-800 border-4 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)] flex items-center justify-center overflow-hidden shrink-0">
                 <img src="assets/images/cathy_boss_monster.webp" class="w-full h-full object-cover rounded-full" alt="boss" onerror="this.src='assets/images/icon_chest.webp'" />
              </div>
              <div class="flex flex-col gap-1 items-end">
                 <span class="text-rose-200 font-black text-sm drop-shadow-md">糊涂魔王</span>
                 <div class="w-48 h-5 bg-black/50 rounded-full border border-white/20 overflow-hidden flex justify-end">
                    <div id="pk-boss-hp" class="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-300 w-full"></div>
                 </div>
              </div>
           </div>
        </div>

        <div class="relative flex-1 flex flex-col items-center justify-center z-10">
           <div class="absolute inset-0 flex items-center justify-between px-20">
              <div id="pk-player-sprite" class="w-40 h-40 bg-white/10 backdrop-blur-sm border-2 border-emerald-400/50 rounded-3xl animate-bounce-slow flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.3)] overflow-hidden p-3">
                 <img src="${r}" class="w-full h-full object-cover rounded-2xl" alt="player" onerror="this.src='assets/images/cathy_mascot.webp'" />
              </div>
              
              <div id="pk-projectile-layer" class="absolute inset-0 pointer-events-none"></div>

              <div id="pk-boss-sprite" class="w-48 h-48 bg-black/40 backdrop-blur-md border-2 border-rose-500/50 rounded-3xl animate-bounce-slow flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden p-3" style="animation-delay: 0.5s">
                 <img src="assets/images/cathy_boss_monster.webp" class="w-full h-full object-cover rounded-2xl" alt="boss" onerror="this.src='assets/images/icon_chest.webp'" />
              </div>
           </div>

           <div class="z-20 flex flex-col items-center mt-20">
              <div class="bg-black/60 backdrop-blur-lg border-2 border-amber-300/50 rounded-full px-10 py-3 mb-8 shadow-2xl flex items-center gap-4 cursor-pointer active:scale-95 transition-transform" id="pk-btn-listen">
                 <div class="w-8 h-8">${l.speaker("w-full h-full")}</div>
                 <span class="text-2xl font-black text-yellow-300 tracking-widest">听音选字</span>
              </div>

              <div class="grid grid-cols-2 gap-6" id="pk-options-grid">
              </div>
           </div>
        </div>
        
      </div>
    `;const s=this.container.querySelector("#btn-pk-battle-exit");s&&this._on(s,"click",()=>{i.playPop(),this._busEmit(h.SWITCH_MODE,{mode:"map"})}),this._on(this.container.querySelector("#pk-btn-listen"),"click",()=>{this.targetChar&&i.speakPriority(this.targetChar.char,{kind:"char",priority:1})}),this.nextRound()}nextRound(){if(this.isAnimating=!1,this.playerHp<=0||this.bossHp<=0){this.endGame();return}const e=[...this.pool].sort(()=>.5-Math.random());this.options=e.slice(0,4),this.targetChar=this.options[Math.floor(Math.random()*this.options.length)];const t=this.container.querySelector("#pk-options-grid");t&&(t.innerHTML=this.options.map((r,s)=>`
      <button class="pk-option-btn w-36 h-36 sm:w-44 sm:h-44 bg-gradient-to-tr from-slate-100 to-white rounded-3xl border-4 border-slate-300 shadow-2xl flex items-center justify-center text-6xl sm:text-7xl font-black text-slate-800 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all cursor-pointer aspect-square shrink-0" data-idx="${s}">
         ${r.char}
      </button>
    `).join(""),t.querySelectorAll(".pk-option-btn").forEach(r=>{this._on(r,"click",()=>this.handleAnswer(parseInt(r.dataset.idx)))}),this._timeout(()=>i.speakPriority(this.targetChar.char,{kind:"char",priority:1}),500))}async handleAnswer(e){if(this.isAnimating)return;this.isAnimating=!0;const t=this.options[e],r=t.id===this.targetChar.id,s=this.container.querySelectorAll(".pk-option-btn"),a=s[e];if(r)a.classList.replace("border-slate-300","border-emerald-500"),a.classList.replace("text-slate-800","text-emerald-600"),a.classList.add("bg-emerald-50"),i.playSuccessSound(),i.speakPriority(this.targetChar.char,{kind:"char",priority:1}),await this.playAttackAnimation("player"),this.bossHp=Math.max(0,this.bossHp-25),this.updateHpUI(),this.bossHp>0&&i.playEncouragement();else{a.classList.replace("border-slate-300","border-rose-500"),a.classList.replace("text-slate-800","text-rose-600"),a.classList.add("bg-rose-50"),i.playErrorSound(),i.speakPriority(`这是“${t.char}”字，要找的是“${this.targetChar.char}”字！`,{kind:"sentence",emotion:"correction"});const n=this.options.findIndex(o=>o.id===this.targetChar.id);s[n].classList.replace("border-slate-300","border-emerald-400"),s[n].classList.add("animate-pulse"),await this.playAttackAnimation("boss"),this.playerHp=Math.max(0,this.playerHp-25),this.updateHpUI()}this._timeout(()=>this.nextRound(),1e3)}updateHpUI(){const e=this.container.querySelector("#pk-player-hp"),t=this.container.querySelector("#pk-boss-hp"),r=Math.max(1,this.maxHp||100);e&&(e.style.width=Math.min(100,Math.max(0,this.playerHp/r*100))+"%"),t&&(t.style.width=Math.min(100,Math.max(0,this.bossHp/r*100))+"%")}playAttackAnimation(e){return new Promise(t=>{const r=this.container.querySelector("#pk-projectile-layer");if(!r)return t();const s=document.createElement("div");s.className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-[0_0_30px_rgba(255,255,255,1)] flex items-center justify-center text-3xl z-50";const a=e==="player";s.innerHTML=a?l.swords?l.swords("w-full h-full"):"":l.monster?l.monster("w-full h-full"):"",s.classList.add(a?"bg-amber-400":"bg-rose-500",a?"left-40":"right-48"),r.appendChild(s);const n=()=>{try{s.remove()}catch(p){}if(this.isDestroyed)return t();const o=this.container.querySelector(a?"#pk-boss-sprite":"#pk-player-sprite");o&&(o.classList.add("animate-shake","brightness-150","bg-rose-500/50"),this._timeout(()=>o.classList.remove("animate-shake","brightness-150","bg-rose-500/50"),400)),t()};if(typeof s.animate=="function"){const o=a?[{left:"160px",transform:"translateY(-50%) scale(1)"},{left:"calc(100% - 240px)",transform:"translateY(-50%) scale(2)"}]:[{right:"192px",transform:"translateY(-50%) scale(1)"},{right:"calc(100% - 200px)",transform:"translateY(-50%) scale(2)"}],p=s.animate(o,{duration:400,easing:"ease-in"});p.onfinish=n}else this._timeout(n,400)})}endGame(){const e=this.playerHp>0;e?(i.playVictoryFanfare(),i.triggerConfetti(this.container),i.triggerCoinFly(this.container),c.addCoins(20)):i.playErrorSound(),this.container.innerHTML=`
        <div class="relative w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
           <div class="mb-6 flex items-center justify-center">${e?l.trophy():l.shieldLock()}</div>
           <h2 class="text-4xl font-black text-white mb-3">${e?"战斗大胜利！":"挑战失败！"}</h2>
           <p class="text-slate-300 font-bold mb-6">${e?"成功击败糊涂魔王！获得 20 凯茜星币奖励！":"糊涂魔王太强大了，去每日复习巩固一下生字再来挑战吧！"}</p>
           
           ${e?`
             <div class="candy-pill rounded-full px-6 py-2 mb-8 text-yellow-300 font-black flex items-center gap-2">
               <span class="flex items-center">${l.coin()}</span>
               <span>+20 凯茜星币已到账</span>
             </div>
           `:""}

            <button id="btn-pk-exit" class="btn-game-orange text-white font-black text-base sm:text-lg px-12 py-3.5 rounded-full shadow-2xl active:scale-95 transition-transform border-2 border-white flex items-center justify-center gap-2 cursor-pointer hover:brightness-105">
               <span class="flex items-center">${l.home("w-5 h-5")}</span>
               <span>返回大地图</span>
            </button>
         </div>
     `,this._on(this.container.querySelector("#btn-pk-exit"),"click",()=>{i.playPop(),this._busEmit(h.SWITCH_MODE,{mode:"map"})})}}export{u as PKModule};
