import{B as b,s as p,e as o,m as x,G as s,a as r,E as m,b as u}from"./index-CObQJZ8f.js";class g extends b{constructor(e){super(e),this.treeWaterCount=Number.parseInt(p.getItem("cathy_tree_water_count","0"),10)||0,this.cathyHunger=Number.parseInt(p.getItem("cathy_hunger_val","80"),10)||80}getTreeStage(e){return e>=601?{level:4,name:"参天智慧神木",desc:"枝繁叶茂，挂满了 600+ 识字硕果！",scale:"scale-110"}:e>=201?{level:3,name:"茂盛繁花树",desc:"绿意盎然，已经掌握了 200+ 常用汉字！",scale:"scale-100"}:e>=51?{level:2,name:"蓬勃生机树",desc:"生机勃勃，正在大步迈向更高阶！",scale:"scale-90"}:{level:1,name:"幼嫩识字苗",desc:"刚刚破土而出，每天识字浇水快快长大！",scale:"scale-75"}}render(){this.destroy();const e=o.progress,c=Object.keys(e.charRecords||{}).length,n=this.getTreeStage(c),d=e.coins||0,{content:i,destroy:t}=x(this.container,{activeMode:"play",heading:"凯茜伴学小树屋"});this._addCleanup(t),i.innerHTML=`
      <div class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pb-8 overflow-y-auto no-scrollbar max-h-[calc(100vh-100px)]">
        
        <div class="w-full flex flex-col sm:flex-row items-center justify-between bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl border-2 border-emerald-200 mb-6 gap-4">
          <div class="flex items-center gap-3">
            <button id="btn-tree-back" class="w-10 h-10 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-950 flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer" title="返回大地图">
              ${s.back("w-5 h-5")}
            </button>
            <div>
              <h1 class="text-base font-black text-emerald-950 flex items-center gap-2">
                <span class="flex items-center">${s.crown("w-5 h-5")}</span>
                <span>凯茜伴学小树屋 · 养成家园</span>
              </h1>
              <p class="text-xs text-emerald-700 font-semibold">陪伴成长 · 浇水长成参天神木 · 与凯茜快乐互动</p>
            </div>
          </div>

          <div class="flex items-center gap-4 bg-emerald-50 px-5 py-2 rounded-full border border-emerald-200">
            <div class="flex items-center gap-1.5">
              <span class="flex items-center">${s.gem("w-5 h-5")}</span>
              <span id="tree-coin-display" class="text-xs font-black text-amber-700">${d} 金币</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="flex items-center">${s.book("w-5 h-5")}</span>
              <span class="text-xs font-black text-emerald-900">已学 ${c} 字</span>
            </div>
          </div>
        </div>

        <div class="relative w-full bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-emerald-300 flex flex-col items-center justify-between min-h-[480px] overflow-hidden">
          
          <div class="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-yellow-300/30 blur-3xl pointer-events-none"></div>

          <div class="z-10 flex flex-col items-center bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-2xl border-2 border-emerald-300 shadow-md">
            <span class="text-xs font-black text-emerald-900 flex items-center gap-1.5">
              <span class="flex items-center">${s.sparkle("w-4 h-4")}</span>
              <span>当前树木形态：第 ${n.level} 阶 · 【${n.name}】</span>
            </span>
            <span class="text-[11px] text-gray-500 font-bold mt-0.5">${n.desc}</span>
          </div>

          <div class="relative w-full flex-1 flex flex-col items-center justify-center my-6">
            
            <div id="tree-graphic-block" class="relative flex flex-col items-center justify-center transition-all duration-700 ${n.scale}">
              <div class="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 border-4 border-white shadow-[0_16px_48px_rgba(16,185,129,0.4)] flex flex-col items-center justify-center text-white relative">
                <span class="text-4xl sm:text-5xl font-black font-serif">智</span>
                <span class="text-xs font-bold text-emerald-100 mt-1">识字神木</span>
                
                <div class="absolute -top-3 left-4 w-9 h-9 rounded-full bg-amber-400 border-2 border-white shadow-lg flex items-center justify-center text-amber-950 font-black text-xs animate-bounce-cathy">
                  +1
                </div>
                <div class="absolute top-8 -right-3 w-9 h-9 rounded-full bg-amber-400 border-2 border-white shadow-lg flex items-center justify-center text-amber-950 font-black text-xs animate-bounce-cathy">
                  +1
                </div>
              </div>

              <div class="w-14 h-16 bg-amber-800 rounded-b-xl border-x-2 border-amber-950 shadow-md"></div>
            </div>

            <div id="cathy-companion-actor" class="mt-4 bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-3xl border-2 border-emerald-300 shadow-xl flex items-center gap-4 cursor-pointer hover:scale-105 active:scale-95 transition-all">
              <img src="assets/images/cathy_mascot.webp" class="w-14 h-14 rounded-full border-2 border-white shadow-lg object-cover ring-2 ring-orange-400/80 aspect-square shrink-0 animate-bounce-slow" alt="凯茜" onerror="this.src='assets/images/icon_crown.png'" />
              <div class="flex flex-col">
                <span class="text-xs font-black text-emerald-950 flex items-center gap-1">
                  <span>伴学小精灵 · 凯茜</span>
                  <span class="flex items-center text-amber-500">${s.sparkle("w-3.5 h-3.5")}</span>
                </span>
                <p id="cathy-speech-bubble" class="text-xs text-emerald-700 font-bold mt-0.5">
                  “你好呀！今天想和我一起给智慧大树浇水吗？”
                </p>
              </div>
            </div>

          </div>

          <div class="z-10 w-full max-w-xl bg-white/95 backdrop-blur-md p-4 rounded-3xl border-2 border-emerald-200 shadow-xl flex items-center justify-around gap-3">
            
            <button id="btn-tree-water" class="btn-game-orange text-white text-xs sm:text-sm font-black px-6 py-3.5 rounded-2xl shadow-md active:scale-95 flex items-center gap-2 cursor-pointer flex-1 justify-center">
              <span class="flex items-center">${s.sparkle("w-4 h-4")}</span>
              <span>浇水培育 (5金币)</span>
            </button>

            <button id="btn-feed-cathy" class="bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs sm:text-sm font-black px-6 py-3.5 rounded-2xl shadow-md active:scale-95 flex items-center gap-2 cursor-pointer flex-1 justify-center">
              <span class="flex items-center">${s.coin("w-4 h-4")}</span>
              <span>给凯茜点心</span>
            </button>

            <button id="btn-cathy-riddle" class="bg-emerald-100 hover:bg-emerald-200 text-emerald-950 text-xs sm:text-sm font-black px-5 py-3.5 rounded-2xl shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${s.speaker("w-4 h-4")}</span>
              <span>听字谜</span>
            </button>

          </div>

        </div>

      </div>
    `,this._bindTreeEvents(i)}_bindTreeEvents(e){const c=e.querySelector("#btn-tree-back");c&&this._on(c,"click",()=>{r.playPop(),this._busEmit(m.SWITCH_MODE,{mode:"map"})});const n=e.querySelector("#btn-tree-water");n&&this._on(n,"click",()=>{if(o.progress.coins<5){r.playSoftError(),u(this.container,"金币不足哦，去多学几个新汉字赢取金币吧！","error");return}o.deductCoins(5),this.treeWaterCount++,p.setItem("cathy_tree_water_count",this.treeWaterCount),r.playSuccess(),r.triggerConfetti(this.container);const t=e.querySelector("#tree-graphic-block");t&&(t.classList.add("scale-125","rotate-3"),setTimeout(()=>t.classList.remove("scale-125","rotate-3"),600));const a=e.querySelector("#cathy-speech-bubble");a&&(a.textContent="“哗啦啦！大树喝到了甘甜泉水，长得更快啦！谢谢你！”"),r.speakPriority("大树喝到了甘甜泉水，长得更快啦！",{kind:"sentence",priority:1});const l=e.querySelector("#tree-coin-display");l&&(l.textContent=`${o.progress.coins} 金币`)});const d=e.querySelector("#btn-feed-cathy");d&&this._on(d,"click",()=>{r.playSuccess(),o.addCoins(2);const t=e.querySelector("#cathy-companion-actor");t&&(t.classList.add("scale-110","bg-amber-100"),setTimeout(()=>t.classList.remove("scale-110","bg-amber-100"),400));const a=e.querySelector("#cathy-speech-bubble");a&&(a.textContent="“哇！美味的小点心！凯茜充满活力啦，送你 2 枚小金币！”"),r.speakPriority("哇！美味的小点心！凯茜充满活力啦！",{kind:"sentence",priority:1});const l=e.querySelector("#tree-coin-display");l&&(l.textContent=`${o.progress.coins} 金币`)});const i=e.querySelector("#btn-cathy-riddle");if(i){const t=["字谜：一口咬掉牛尾巴，猜一个字？是‘告’字哦！","字谜：两人土上坐，猜一个字？是‘坐’字哦！","字谜：太阳从地平线升起来，猜一个字？是‘旦’字哦！","字谜：一棵树是木，两棵树是林，三棵树是什么呀？是‘森’字哦！"];this._on(i,"click",()=>{r.playPop();const a=t[Math.floor(Math.random()*t.length)],l=e.querySelector("#cathy-speech-bubble");l&&(l.textContent=`“${a}”`),r.speakPriority(a,{kind:"sentence",priority:1})})}}}export{g as TreehouseModule};
