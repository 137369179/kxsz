import{B as S,s as p,m as M,g as m,c as g,d as w,e as h,G as i,a as n,r as j,b as x,f as k,h as T}from"./index-CObQJZ8f.js";const C=["日","一","二","三","四","五","六"],y={bronze:"from-amber-600 to-yellow-700 border-amber-400",silver:"from-slate-300 to-slate-500 border-slate-200",gold:"from-yellow-300 via-amber-400 to-yellow-500 border-yellow-200",rainbow:"from-fuchsia-400 via-amber-300 to-cyan-300 border-white"};class E extends S{constructor(t){super(t),this.activeTab="stickers";const s=new Date;this.calYear=s.getFullYear(),this.calMonth=s.getMonth(),this.scrapbookStickers=p.getJSON("cathy_scrapbook_stickers_v1",[]),this.scrapbookBg=p.getItem("cathy_scrapbook_bg_v1","assets/images/cathy_island_forest.webp"),this._scrapbookSaved=!1}render(){this.destroy();const{content:t,destroy:s}=M(this.container,{activeMode:"reward",heading:"凯茜成就城堡"});this._addCleanup(s);const r=m(),a=g(),e=a.filter(o=>o.earned).length,l=w(this.calYear,this.calMonth),d=h.progress.profile;t.innerHTML=`
      <div class="w-full h-full overflow-y-auto no-scrollbar bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white select-none">

        <div class="relative mx-5 mt-20 rounded-3xl overflow-hidden border-4 border-amber-300/70 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
          <img src="assets/images/cathy_island_life.webp" alt="" class="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />
          <div class="relative z-10 flex items-center justify-between gap-4 bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-transparent px-6 py-5">
            <div>
              <h1 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-orange-400 drop-shadow flex items-center gap-2">
                <span class="flex items-center">${i.trophy("w-7 h-7")}</span>
                <span>${d.name}</span>
              </h1>
              <p class="text-[11px] text-yellow-200/80 font-bold mt-1">凯茜冒险家</p>
            </div>
            <div class="flex items-center gap-2">
              <div class="bg-black/50 backdrop-blur-md rounded-2xl px-3 py-2 text-center border border-white/20">
                <div class="text-[10px] text-white/60 font-black">收集贴纸</div>
                <div class="text-sm font-black text-amber-300">${r.earnedCount}<span class="text-white/40 text-[10px]">/${r.total}</span></div>
              </div>
              <div class="bg-black/50 backdrop-blur-md rounded-2xl px-3 py-2 text-center border border-white/20">
                <div class="text-[10px] text-white/60 font-black">获得勋章</div>
                <div class="text-sm font-black text-amber-300">${e}<span class="text-white/40 text-[10px]">/${a.length}</span></div>
              </div>
              <div class="bg-black/50 backdrop-blur-md rounded-2xl px-3 py-2 text-center border border-white/20">
                <div class="text-[10px] text-white/60 font-black">连续打卡</div>
                <div class="text-sm font-black text-orange-400">${l.current}<span class="text-white/40 text-[10px]">天</span></div>
              </div>
            </div>
          </div>
        </div>

        <div class="mx-5 mt-4 grid grid-cols-4 gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/15">
          ${[{key:"stickers",label:"贴纸墙",iconSvg:o=>i.cards(o)},{key:"medals",label:"荣誉室",iconSvg:o=>i.trophy(o)},{key:"calendar",label:"打卡日历",iconSvg:o=>i.reviewBell(o)},{key:"shop",label:"装扮商城",iconSvg:o=>i.chest(o)}].map(o=>`
            <button data-tab="${o.key}" class="reward-tab py-2.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-1.5 ${this.activeTab===o.key?"bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg scale-[1.02]":"text-white/60 hover:text-white hover:bg-white/10"}">
              <span class="flex items-center">${o.iconSvg("w-4 h-4")}</span>
              <span>${o.label}</span>
            </button>
          `).join("")}
        </div>

        <div id="reward-panel" class="mx-5 my-5 pb-10"></div>
      </div>
    `,this._renderPanel(),this._bindTabEvents(),this._celebrateNewMedals()}_renderPanel(){const t=this.container.querySelector("#reward-panel");t&&(this.activeTab==="stickers"?this._renderStickerWall(t):this.activeTab==="medals"?this._renderMedalWall(t):this.activeTab==="shop"?this._renderShop(t):this._renderCalendar(t))}_renderStickerWall(t){const s=i.shieldLock();i.star();const r=m(),a=r.total?Math.round(r.earnedCount/r.total*100):0;if(this.isScrapbookMode){const l=this.scrapbookBg||"assets/images/cathy_island_forest.webp";this.scrapbookStickers=this.scrapbookStickers||[],t.innerHTML=`
        <div class="bg-white/5 backdrop-blur-md rounded-3xl border border-white/15 p-5 flex flex-col gap-4 animate-fade-in">
          
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <button id="btn-exit-scrapbook" class="btn-game-wood text-white font-black text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer active:scale-95">
                <span class="flex items-center">${i.back("w-3.5 h-3.5")}</span>
                <span>返回贴纸墙</span>
              </button>
              <h2 class="font-black text-amber-200 text-sm flex items-center gap-1.5">
                <span class="flex items-center">${i.cards("w-4 h-4")}</span>
                <span>贴纸手帐 DIY 创作台</span>
              </h2>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <div class="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/10 text-xs">
                <button class="bg-choice-btn px-2.5 py-1 rounded-full text-[11px] font-bold ${l.includes("forest")?"bg-amber-400 text-amber-950 font-black":"text-white/70"}" data-bg="assets/images/cathy_island_forest.webp">
                  森林
                </button>
                <button class="bg-choice-btn px-2.5 py-1 rounded-full text-[11px] font-bold ${l.includes("life")?"bg-amber-400 text-amber-950 font-black":"text-white/70"}" data-bg="assets/images/cathy_island_life.webp">
                  小镇
                </button>
                <button class="bg-choice-btn px-2.5 py-1 rounded-full text-[11px] font-bold ${l.includes("space")?"bg-amber-400 text-amber-950 font-black":"text-white/70"}" data-bg="assets/images/cathy_island_space.webp">
                  星空
                </button>
              </div>

              <button id="btn-clear-scrapbook" class="bg-white/10 hover:bg-white/20 text-white font-black text-xs px-3 py-1.5 rounded-full border border-white/20 active:scale-95 cursor-pointer">
                清空
              </button>

              <button id="btn-save-scrapbook" class="btn-game-orange text-white font-black text-xs px-5 py-1.5 rounded-full shadow-lg active:scale-95 cursor-pointer flex items-center gap-1">
                <span>保存作品</span>
              </button>
            </div>
          </div>

          <div id="scrapbook-canvas" class="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border-4 border-amber-300/80 shadow-2xl bg-slate-900 group">
            <img id="scrapbook-bg-img" src="${l}" alt="" class="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-90 transition-all" />
            
            <div id="canvas-sticker-layer" class="absolute inset-0 z-10">
              ${this.scrapbookStickers.map((c,b)=>`
                <div class="canvas-placed-sticker absolute flex flex-col items-center p-2 rounded-2xl bg-gradient-to-b from-amber-100 to-amber-300 border-2 border-amber-400 shadow-2xl cursor-pointer select-none animate-scale-up hover:scale-125 transition-transform" style="top: ${c.y}; left: ${c.x};" data-char="${c.char}" data-pinyin="${c.pinyin}" data-idx="${b}">
                  <span class="text-xl font-black text-amber-950 leading-tight">${c.char}</span>
                  <span class="text-[9px] font-black text-amber-700">${c.pinyin}</span>
                </div>
              `).join("")}
            </div>

            <div class="absolute bottom-2 left-3 z-20 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full pointer-events-none border border-white/20">
              点击下方贴纸贴到画布上，点击画布贴纸可发音朗读！
            </div>
          </div>

          <div class="bg-black/40 p-3 rounded-2xl border border-white/10">
            <div class="text-xs font-black text-amber-200 mb-2">我的贴纸库 (点击贴入手帐)：</div>
            <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              ${r.earned.length===0?'<div class="text-xs text-white/50 py-2">还没有收集到贴纸，先去关卡中认字通关吧！</div>':r.earned.map(c=>`
                <button class="tray-sticker-btn shrink-0 flex flex-col items-center p-2 rounded-2xl bg-gradient-to-b from-amber-100 to-amber-300 border-2 border-amber-400 shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer" data-char="${c.char}" data-pinyin="${c.pinyin}">
                  <span class="text-lg font-black text-amber-950 leading-tight">${c.char}</span>
                  <span class="text-[8px] font-black text-amber-700">${c.pinyin}</span>
                </button>
              `).join("")}
            </div>
          </div>

        </div>
      `;const d=t.querySelector("#btn-exit-scrapbook");d&&this._on(d,"click",()=>{n.playPop(),this.isScrapbookMode=!1,this._renderStickerWall(t)}),this._onDom(t.querySelectorAll(".bg-choice-btn"),"click",c=>{const b=c.currentTarget;n.playPop(),this.scrapbookBg=b.dataset.bg,p.setItem("cathy_scrapbook_bg_v1",this.scrapbookBg),this._renderStickerWall(t)}),this._onDom(t.querySelectorAll(".tray-sticker-btn"),"click",c=>{const b=c.currentTarget,f=b.dataset.char,v=b.dataset.pinyin,$=`${Math.floor(Math.random()*70)+15}%`,_=`${Math.floor(Math.random()*60)+20}%`;this.scrapbookStickers.push({char:f,pinyin:v,x:$,y:_}),p.putJSON("cathy_scrapbook_stickers_v1",this.scrapbookStickers),n.playPop(),n.speakPriority(f,{kind:"char",priority:1}),this._renderStickerWall(t)}),this._onDom(t.querySelectorAll(".canvas-placed-sticker"),"click",c=>{c.stopPropagation();const b=c.currentTarget,f=b.dataset.char,v=b.dataset.pinyin;n.speakPriority(`${f}，${v}`,{kind:"char",priority:1}),n.playStarPopCombo()});const o=t.querySelector("#btn-clear-scrapbook");o&&this._on(o,"click",()=>{n.playPop(),this.scrapbookStickers=[],p.putJSON("cathy_scrapbook_stickers_v1",[]),this._renderStickerWall(t)});const u=t.querySelector("#btn-save-scrapbook");u&&this._on(u,"click",()=>{n.playCrownFanfare(),n.triggerConfetti(this.container),p.putJSON("cathy_scrapbook_stickers_v1",this.scrapbookStickers),p.setItem("cathy_scrapbook_bg_v1",this.scrapbookBg),this._scrapbookSaved?x(this.container,"贴纸手帐作品已保存更新！","success"):(this._scrapbookSaved=!0,j.addCoins(30),x(this.container,"专属贴纸手帐作品已保存！首次保存奖励 +30 星币！","success"))});return}t.innerHTML=`
      <div class="bg-white/5 backdrop-blur-md rounded-3xl border border-white/15 p-5">
        <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div>
            <h2 class="font-black text-amber-200 flex items-center gap-2">
              <span class="flex items-center">${i.cards()}</span>
              <span>汉字贴纸收藏册</span>
            </h2>
            <span class="text-xs font-black text-white/50">已收集 <b class="text-amber-300">${r.earnedCount}</b> / ${r.total} </span>
          </div>

          <button id="btn-open-scrapbook" class="btn-game-orange text-white font-black text-xs px-4 py-2 rounded-full shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer">
            <span class="flex items-center">${i.brush("w-3.5 h-3.5")}</span>
            <span>贴纸手帐 DIY 创作台</span>
          </button>
        </div>

        <div class="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/10 mb-1.5">
          <div class="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 rounded-full transition-all duration-700" style="width:${a}%"></div>
        </div>
        <div class="text-[10px] text-white/40 font-bold text-right mb-4">收集进度 ${a}%</div>

        ${r.earned.length===0?`<div class="text-center py-10">
                 <div class="w-16 h-16 mx-auto mb-3 opacity-60 flex items-center justify-center">${i.chest()}</div>
                 <p class="text-white/80 font-black text-sm">还没有收集到汉字贴纸</p>
                 <p class="text-white/40 text-xs font-bold mt-1">去大地图学习汉字，通关即可解锁专属贴纸！</p>
               </div>`:`<div class="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2.5">
                 ${r.earned.map(l=>`
                   <div class="sticker-cell relative flex flex-col items-center p-2 rounded-2xl bg-gradient-to-b from-amber-100 to-amber-300 border-2 border-amber-400 shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer" title="掌握度 ${l.masteryRate}%">
                     <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center font-black text-amber-900 border border-amber-400 shadow-inner">${l.char}</div>
                     <span class="text-lg font-black text-amber-950 leading-tight mt-1">${l.char}</span>
                     <span class="text-[9px] font-black text-amber-700">${l.pinyin}</span>
                     <span class="absolute -top-1.5 -right-1.5 text-[9px] bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center shadow">新</span>
                   </div>
                 `).join("")}
               </div>`}

        ${r.upcoming.length?`<div class="mt-5">
                 <h3 class="text-xs font-black text-white/50 mb-2">即将解锁 · 待探索字</h3>
                 <div class="grid grid-cols-6 sm:grid-cols-12 gap-2">
                   ${r.upcoming.map(l=>`
                     <div class="flex flex-col items-center p-1.5 rounded-xl bg-white/5 border border-white/10 opacity-60">
                       <span class="text-lg"><div class="w-5 h-5 inline-block align-middle">${s}</div></span>
                       <span class="text-xs font-black text-white/40">?</span>
                     </div>
                   `).join("")}
                 </div>
               </div>`:""}
      </div>
    `;const e=t.querySelector("#btn-open-scrapbook");e&&this._on(e,"click",()=>{n.playPop(),this.isScrapbookMode=!0,this._renderStickerWall(t)}),this._onDom(t.querySelectorAll(".sticker-cell"),"click",l=>{var o;const d=(o=l.currentTarget.querySelector("span.text-lg"))==null?void 0:o.textContent;d&&(n.playPop(),n.speakPriority(d,{kind:"char",priority:1}))})}_renderMedalWall(t){const s=i.shieldLock(),r=i.trophy(),a=g();t.innerHTML=`
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${a.map(e=>`
          <div class="medal-card relative rounded-3xl p-4 border-2 ${e.earned?`bg-gradient-to-b ${y[e.tier]||y.gold} shadow-[0_10px_25px_rgba(0,0,0,0.45)]`:"bg-white/5 border-white/10"} flex flex-col items-center text-center ${e.earned?"hover:scale-105 active:scale-95 transition-transform":""}">
            ${e.isNew?'<span class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white animate-bounce">NEW</span>':""}
            <div class="relative flex flex-col items-center justify-center">
              <div class="relative w-24 h-24 ${e.earned?"animate-bounce-slow":"grayscale opacity-40"}">
                <div class="w-full h-full rounded-full border-4 shadow-lg flex items-center justify-center overflow-hidden 
                            ${e.tier==="bronze"?"border-yellow-700 bg-yellow-900":e.tier==="silver"?"border-slate-300 bg-slate-700":e.tier==="gold"?"border-yellow-400 bg-yellow-600":"border-fuchsia-400 bg-gradient-to-tr from-pink-500 to-indigo-500"}">
                  ${e.earned?r:`<div class="w-12 h-12">${s}</div>`}
                </div>
              </div>
              ${e.earned?'<span class="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] bg-white text-amber-700 font-black px-3 py-1 rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.3)] border border-amber-200 z-10">已达成</span>':""}
            </div>
            <div class="mt-3 font-black text-sm ${e.earned?"text-amber-950 drop-shadow":"text-white/80"}">${e.name}</div>
            <div class="text-[10px] font-bold mt-0.5 ${e.earned?"text-amber-900/80":"text-white/40"}">${e.desc}</div>

            ${e.earned?"":`<div class="w-full mt-2.5">
                     <div class="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                       <div class="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" style="width:${Math.round(e.ratio*100)}%"></div>
                     </div>
                     <div class="text-[10px] text-white/50 font-black mt-1">${Math.min(e.current,e.target)} / ${e.target}</div>
                   </div>`}
          </div>
        `).join("")}
      </div>
    `}_renderShop(t){i.star();const s=k(),r=(e,l="w-14 h-14 sm:w-16 sm:h-16")=>{const d=e.type==="frame"?e.frameClass:"",o=e.type==="avatar"?e.icon?`<img src="${e.icon}" class="w-full h-full rounded-full object-cover shrink-0" alt="${e.name}" />`:`<div class="w-8 h-8">${i.cards()}</div>`:'<span class="text-2xl font-black text-amber-600">框</span>';return`<div class="rounded-full bg-amber-50 flex items-center justify-center overflow-hidden aspect-square shrink-0 ${l} ${d}">${o}</div>`},a=e=>{const l=e.equipped?'<span class="text-[10px] font-black text-amber-300 mt-1">已装备</span>':e.owned?`<button data-buy="${e.id}" class="shop-action mt-1.5 bg-emerald-500/90 hover:bg-emerald-500 text-white text-[11px] font-black px-4 py-1.5 rounded-full active:scale-95 transition-transform">装备</button>`:`<button data-buy="${e.id}" class="shop-action mt-1.5 ${e.affordable?"bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110":"bg-white/10 opacity-50 cursor-not-allowed"} text-white text-[11px] font-black px-4 py-1.5 rounded-full active:scale-95 transition-transform flex items-center gap-1"><span class="flex items-center">${i.coin()}</span><span>${e.price}</span></button>`;return`
        <div class="rounded-2xl border-2 ${e.equipped?"border-amber-400 bg-amber-400/15":e.owned?"border-emerald-400/40 bg-white/5":"border-white/10 bg-white/5"} p-3 flex flex-col items-center text-center">
          ${r(e)}
          <div class="text-xs font-black mt-2 ${e.owned?"text-white":"text-white/80"}">${e.name}</div>
          ${l}
        </div>
      `};t.innerHTML=`
      <div class="bg-white/5 backdrop-blur-md rounded-3xl border border-white/15 p-5">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="font-black text-amber-200 flex items-center gap-2">
              <span class="flex items-center">${i.chest()}</span>
              <span>凯茜装扮商城</span>
            </h2>
            <p class="text-[10px] text-white/40 font-bold mt-0.5">使用星币购买限定头像与个性边框</p>
          </div>
          <div class="bg-black/40 backdrop-blur-md flex items-center gap-2 text-amber-300 font-black text-sm px-4 py-2 rounded-full border border-white/15">
            <span class="flex items-center">${i.coin()}</span>
            <span>${s.coins}</span>
            <span class="text-[10px] text-white/40 font-black">星币</span>
          </div>
        </div>

        <h3 class="text-xs font-black text-white/50 mb-2.5">稀有头像</h3>
        <div class="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          ${s.avatars.map(a).join("")}
        </div>

        <h3 class="text-xs font-black text-white/50 mb-2.5">个性边框</h3>
        <div class="grid grid-cols-3 lg:grid-cols-5 gap-3">
          ${s.frames.map(a).join("")}
        </div>
      </div>
    `,this._bindShopActions()}_bindShopActions(){this.container.querySelectorAll(".shop-action").forEach(t=>{this._on(t,"click",()=>{const s=t.dataset.buy,r=k(),a=[...r.avatars,...r.frames].find(e=>e.id===s);if(a){if(a.owned)a.type==="avatar"?h.equipAvatar(a.value):h.equipFrame(a.id),n.playSuccessSound(),x(this.container,`已装备: ${a.name}`,"success");else if(h.purchase(s).ok)a.type==="avatar"?h.equipAvatar(a.value):h.equipFrame(a.id),n.playCoinClink(),n.playStarChime(),n.triggerConfetti(this.container),x(this.container,`购买成功: ${a.name}`,"success");else{n.playSoftError(),x(this.container,"星币不足，快去学习赚取吧！","error");return}this.render()}})})}_renderCalendar(t){i.star(),i.trophy();const s=w(this.calYear,this.calMonth),r=`${s.year}年 ${s.monthIdx+1}月`;t.innerHTML=`
      <div class="bg-white/5 backdrop-blur-md rounded-3xl border border-white/15 p-5">

        <div class="grid grid-cols-3 gap-3 mb-4">
          <div class="bg-gradient-to-b from-orange-500/30 to-red-600/20 border border-orange-400/40 rounded-2xl p-3 text-center">
            <div class="text-[10px] text-white/60 font-black">当前连续打卡</div>
            <div class="text-xl font-black text-orange-300 mt-1">${s.current} <span class="text-xs text-white/60 font-bold">天</span></div>
          </div>
          <div class="bg-gradient-to-b from-yellow-500/30 to-amber-600/20 border border-yellow-400/40 rounded-2xl p-3 text-center">
            <div class="text-[10px] text-white/60 font-black">最高连续打卡</div>
            <div class="text-xl font-black text-yellow-300 mt-1">${s.best} <span class="text-xs text-white/60 font-bold">天</span></div>
          </div>
          <div class="bg-gradient-to-b from-emerald-500/30 to-teal-600/20 border border-emerald-400/40 rounded-2xl p-3 text-center">
            <div class="text-[10px] text-white/60 font-black">累计打卡天数</div>
            <div class="text-xl font-black text-emerald-300 mt-1">${s.totalActiveDays} <span class="text-xs text-white/60 font-bold">天</span></div>
          </div>
        </div>

        <div class="flex items-center justify-between mb-3">
          <button data-cal-nav="-1" class="cal-nav-btn w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 font-black">‹</button>
          <h2 class="font-black text-amber-200 text-sm">${r} ·  ${s.monthActive} 天</h2>
          <button data-cal-nav="1" class="cal-nav-btn w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 font-black">›</button>
        </div>

        <div class="grid grid-cols-7 gap-1.5 mb-1.5 text-center">
          ${C.map(a=>`<div class="text-[10px] font-black text-white/40 py-1">${a}</div>`).join("")}
        </div>

        <div class="grid grid-cols-7 gap-1.5">
          ${s.weeks.flat().map(a=>a.key?`
              <div class="cal-cell relative h-10 rounded-xl border ${a.active?"bg-gradient-to-b from-orange-400 to-red-500 border-orange-300 text-white shadow-[0_4px_10px_rgba(249,115,22,0.5)]":"bg-white/5 border-white/10 text-white/35"} flex flex-col items-center justify-center">
                <span class="text-xs font-black leading-none">${a.day}</span>
                ${a.active?'<span class="text-[9px] leading-none mt-0.5"><div class="w-5 h-5 inline-block align-middle text-orange-500">${__sparkleIcon}</div></span>':""}
                ${a.isToday?'<span class="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] bg-cyan-400 text-cyan-950 font-black px-1.5 rounded-full">今</span>':""}
              </div>
            `:"<div></div>").join("")}
        </div>

        <p class="text-[10px] text-white/40 font-bold text-center mt-4">每天完成1个汉字或复习即可打卡</p>
      </div>
    `,this._bindCalendarNav()}_bindTabEvents(){this.container.querySelectorAll(".reward-tab").forEach(t=>{this._on(t,"click",()=>{this.activeTab!==t.dataset.tab&&(n.playPop(),this.activeTab=t.dataset.tab,this.render())})})}_bindCalendarNav(){this.container.querySelectorAll(".cal-nav-btn").forEach(t=>{this._on(t,"click",()=>{n.playPop();const s=Number(t.dataset.calNav);this.calMonth+=s,this.calMonth<0&&(this.calMonth=11,this.calYear-=1),this.calMonth>11&&(this.calMonth=0,this.calYear+=1),this.render()})})}_celebrateNewMedals(){const t=i.trophy(),s=T();if(s.length===0)return;const r=g().filter(a=>a.isNew).map(a=>`${a.name}`);h.markMedalsSeen(s),setTimeout(()=>{try{n.playVictoryFanfare(),n.triggerConfetti(this.container),x(this.container,`<div class="w-5 h-5 inline-block align-middle">${t}</div> ${r.join("")}`,"success")}catch(a){}},500)}}export{E as RewardModule};
