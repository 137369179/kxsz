import{B as F,e as m,C as D,m as B,G as g,a as o,b as T}from"./index-CObQJZ8f.js";import{p as R}from"./worksheetGenerator-1DHxgeAp.js";import{o as A}from"./morphEngine-B-GTuvjM.js";const _={氵:"三点水：造字本源与江河水流液体有关",艹:"草字头：造字本源与花草植物农作物有关",木:"木字旁：造字本源与树木木材森林有关",亻:"单人旁：造字本源与人的动作品质身份有关",口:"口字旁：造字本源与嘴巴声音吞吐有关",日:"日字旁：造字本源与太阳时间光线有关",月:"月字旁：造字本源与月亮时间或人体肉身有关",扌:"提手旁：造字本源与手部动作拿取操作有关",纟:"绞丝旁：造字本源与丝线织物绳索有关",辶:"走之底：造字本源与走路行走行进距离有关",忄:"竖心旁：造字本源与内心心情思维情感有关",火:"火字旁：造字本源与火光温度燃烧烹饪有关",土:"土字旁：造字本源与泥土大地地面建筑有关",金:"金字旁：造字本源与金属器具矿石有关",鸟:"鸟字边：造字本源与飞禽鸟类有关",虫:"虫字旁：造字本源与昆虫节肢小动物有关"};class G extends F{constructor(e){super(e),this.currentFilter="all",this.currentStage="all",this.selectedRadical="all",this.searchQuery="",this.selectedCard=null,this.isCardFlipped=!1,this.pageSize=48,this.displayCount=48,this._debounceTimer=null}destroy(){var e,s;this._debounceTimer&&(clearTimeout(this._debounceTimer),this._debounceTimer=null),typeof document!="undefined"&&((e=document.getElementById("stroke-demo-overlay"))==null||e.remove(),(s=document.getElementById("flashcard-slideshow-overlay"))==null||s.remove()),super.destroy()}getFilteredList(){const e=m.progress;let s=D;if(this.currentFilter==="learned")s=s.filter(a=>!!e.charRecords[a.id]);else if(this.currentFilter==="review"){const a=m.getDueReviewCharIds();s=s.filter(n=>a.includes(n.id))}else if(this.currentFilter==="difficult"){const a=m.getDifficultCharIds();s=s.filter(n=>a.includes(n.id))}if(this.currentStage!=="all"&&(s=s.filter(a=>(a.stage||1)===parseInt(this.currentStage,10))),this.selectedRadical!=="all"&&(s=s.filter(a=>a.radical===this.selectedRadical)),this.searchQuery.trim()){const a=this.searchQuery.trim().toLowerCase();s=s.filter(n=>n.char.includes(a)||n.pinyin&&n.pinyin.toLowerCase().includes(a))}return s}render(){const e=this.container.querySelector("#cards-page-viewport");e&&(this._savedScrollTop=e.scrollTop),this.destroy();const s=m.progress,a=this.getFilteredList(),n=a.slice(0,this.displayCount),x=a.length>this.displayCount,d=["all","氵","艹","木","亻","口","日","月","扌","纟","辶","忄","火","土","金","鸟","虫"],{content:f,destroy:l}=B(this.container,{activeMode:"cards",heading:"凯茜字卡字典"});this._addCleanup(l),f.innerHTML=`
      <div id="cards-page-viewport" class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pb-6 overflow-y-auto no-scrollbar max-h-[calc(100vh-100px)]">
        
        <div class="w-full flex flex-col gap-3 bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl border-2 border-amber-200 mb-4 sticky top-0 z-20">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="flex items-center">${g.cards()}</span>
              <div>
                <h1 class="text-base font-black text-amber-950">生词字卡库 · 偏旁部首专项板块</h1>
                <p class="text-xs text-amber-700 font-semibold">1490 汉字造字本源解析 · 3D 翻转卡片 · 偏旁归纳与组词例句</p>
              </div>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button id="btn-start-slideshow" class="btn-game-orange text-white font-black text-xs px-4 py-2 rounded-full shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                <span class="flex items-center">${g.sparkle("w-3.5 h-3.5")}</span>
                <span>闪卡轮播</span>
              </button>
              <div class="relative w-full sm:w-56">
                <input id="card-search-input" type="text" value="${this.searchQuery}" placeholder="搜索汉字或拼音 (如: 日 / ri)" class="w-full bg-amber-50 border-2 border-amber-300 rounded-full px-4 py-1.5 text-xs font-black text-amber-950 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-amber-400" />
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-100">
            
            <div class="flex items-center gap-1 bg-amber-50 p-1 rounded-full border border-amber-200">
              ${[{key:"all",label:"全阶段"},{key:"1",label:"第1阶·启蒙 (1-200)"},{key:"2",label:"第2阶·常用 (201-600)"},{key:"3",label:"第3阶·进阶 (601-1490)"}].map(i=>`
                <button class="filter-stage-btn px-4 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 shadow-md ${this.currentStage===i.key?"bg-amber-800 text-white shadow-md":"text-amber-900 hover:bg-amber-100"}" data-stage="${i.key}">
                  ${i.label}
                </button>
              `).join("")}
            </div>

            <div class="flex items-center gap-1 bg-amber-50 p-1 rounded-full border border-amber-200">
              ${[{key:"all",label:"全部"},{key:"learned",label:"已掌握"},{key:"review",label:"待复习"},{key:"difficult",label:"难字本"}].map(i=>`
                <button class="filter-status-btn px-4 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 shadow-md ${this.currentFilter===i.key?"bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md":"text-amber-900 hover:bg-amber-100"}" data-key="${i.key}">
                  ${i.label}
                </button>
              `).join("")}
            </div>

          </div>

          <div class="flex items-center gap-2 pt-2 border-t border-amber-100 overflow-x-auto no-scrollbar py-1">
            <span class="text-xs font-black text-amber-950 whitespace-nowrap">偏旁专区：</span>
            ${d.map(i=>`
              <button class="radical-tag-btn px-3 py-1 rounded-full text-xs font-black whitespace-nowrap transition-all ${this.selectedRadical===i?"bg-orange-500 text-white ring-2 ring-orange-300 shadow":"bg-amber-100/70 text-amber-900 hover:bg-amber-200"}" data-rad="${i}">
                ${i==="all"?"全部部首":`${i} 部`}
              </button>
            `).join("")}
          </div>

        </div>

        ${this.selectedRadical!=="all"&&_[this.selectedRadical]?`
          <div class="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3.5 rounded-2xl mb-4 shadow-lg flex items-center justify-between animate-fade-in border-2 border-white/40">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl font-black bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center">${this.selectedRadical}</span>
              <span class="text-xs font-bold">${_[this.selectedRadical]}</span>
            </div>
            <button id="btn-speak-radical-origin" class="btn-game-wood text-white text-[10px] font-black px-3 py-1 rounded-full shadow"> 听解说</button>
          </div>
        `:""}

        <div class="w-full flex items-center justify-between text-xs font-black text-amber-950 mb-3 px-2">
          <span>共找到 <b class="text-orange-600">${a.length}</b> 个生字 (当前已呈现 ${n.length} 个)</span>
          ${x?'<span class="text-amber-700 text-[11px] font-semibold"> 向下滚动自动呈现更多</span>':""}
        </div>

        <div id="card-grid-container" class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3.5">
          ${n.length===0?`
            <div class="col-span-full py-16 text-center text-gray-400 font-black text-sm">
              <div class="w-12 h-12 mx-auto mb-2 flex items-center justify-center">${g.book()}</div>
              未找到符合条件的生字卡片，换个关键词或筛选条件试试吧！
            </div>
          `:n.map(i=>{const p=!!s.charRecords[i.id],b=m.isDifficultChar(i.id);return`
                    <div class="char-card cv-auto group relative h-36 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-md border-2 ${p?"border-amber-300 hover:border-orange-400 ring-2 ring-amber-200/40":"border-gray-200 opacity-65"} flex flex-col items-center justify-between cursor-pointer transition-all duration-200 hover:scale-105" data-char-id="${i.id}">
                      
                      ${b?'<span class="absolute top-1.5 right-1.5 text-[9px] bg-rose-500 text-white font-black px-1.5 py-0.5 rounded-full shadow">难字</span>':p?'<span class="absolute top-1.5 right-1.5 text-[9px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded-full shadow">已掌握</span>':""}

                      <span class="text-[11px] font-bold text-amber-700">${i.pinyin}</span>
                      
                      <span class="text-4xl font-black text-amber-950 group-hover:text-orange-600 transition-colors drop-shadow-sm">
                        ${i.char}
                      </span>

                      <div class="w-full flex items-center justify-between pt-1.5 border-t border-amber-100 text-[10px] font-bold text-gray-500">
                        <span class="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded">${i.radical}部</span>
                        <span>${i.strokeCount||4}画</span>
                      </div>
                    </div>
                  `}).join("")}
        </div>

        ${x?`
          <div class="w-full flex justify-center mt-6">
            <button id="btn-load-more-cards" class="btn-game-orange text-white font-black text-xs px-8 py-2.5 rounded-full shadow-lg flex items-center gap-2 active:scale-95">
              <span> 呈现更多汉字 (${n.length}/${a.length})</span>
            </button>
          </div>
        `:""}

        ${this.selectedCard?this.renderCardDetailModal():""}

      </div>
    `,this.bindEvents(f)}bindEvents(e){const s=e.querySelector("#btn-start-slideshow");s&&this._on(s,"click",()=>{o.playPop();const t=this.getFilteredList();if(t.length===0){T(this.container,"当前筛选条件下没有字卡哦！","info");return}this.openFlashcardSlideshowModal(t)});const a=e.querySelector("#card-search-input");a&&this._on(a,"input",t=>{const h=t.target.value;this._debounceTimer&&clearTimeout(this._debounceTimer),this._debounceTimer=setTimeout(()=>{this.searchQuery=h,this.displayCount=this.pageSize,this._savedScrollTop=0,this.render()},150)}),e.querySelectorAll(".filter-stage-btn").forEach(t=>{this._on(t,"click",()=>{this.currentStage=t.dataset.stage,this.displayCount=this.pageSize,this._savedScrollTop=0,o.playPop(),this.render()})}),e.querySelectorAll(".filter-status-btn").forEach(t=>{this._on(t,"click",()=>{this.currentFilter=t.dataset.key,this.displayCount=this.pageSize,this._savedScrollTop=0,o.playPop(),this.render()})}),e.querySelectorAll(".radical-tag-btn").forEach(t=>{this._on(t,"click",()=>{this.selectedRadical=t.dataset.rad,this.displayCount=this.pageSize,this._savedScrollTop=0,o.playPop(),this.render()})});const n=e.querySelector("#btn-speak-radical-origin");n&&this._on(n,"click",()=>{o.playPop(),_[this.selectedRadical]&&o.speakPriority(_[this.selectedRadical]||"",{kind:"sentence",priority:1})});const x=e.querySelector("#btn-load-more-cards");x&&this._on(x,"click",()=>{o.playPop(),this.displayCount+=this.pageSize,this.render()});const d=e.querySelector("#cards-page-viewport");d&&this._on(d,"scroll",()=>{if(d.scrollTop+d.clientHeight>=d.scrollHeight-150){const t=this.getFilteredList();this.displayCount<t.length&&(this.displayCount+=this.pageSize,this.render())}},{passive:!0}),e.querySelectorAll(".char-card").forEach(t=>{this._on(t,"click",()=>{const h=t.dataset.charId;this.selectedCard=D.find(c=>c.id===h),this.isCardFlipped=!1,o.playCardFlip(),this.render()})});const f=e.querySelector("#card-modal-backdrop"),l=e.querySelector("#btn-close-modal"),i=e.querySelector("#flip-card");l&&this._on(l,"click",()=>{o.playPop(),this.selectedCard=null,this.render()}),f&&this._on(f,"click",t=>{t.target===f&&(this.selectedCard=null,this.render())}),i&&this._on(i,"click",()=>{o.playCardFlip(),this.isCardFlipped=!this.isCardFlipped,this.render()});const r=e.querySelector("#btn-toggle-difficult");r&&this._on(r,"click",t=>{t.stopPropagation();const h=r.dataset.charId;m.isDifficultChar(h)?(m.removeDifficultChar(h),T(this.container,"已从难字本中移出！","info")):(m.addDifficultChar(h),T(this.container,"已加入难字本，复习时将重点巩固！","success")),o.playPop(),this.render()});const p=e.querySelector("#btn-modal-speak-char");p&&this._on(p,"click",t=>{t.stopPropagation(),this.selectedCard&&(o.playPop(),o.speakPriority(`${this.selectedCard.char}，${this.selectedCard.pinyin}`,{kind:"char",priority:1}))});const b=e.querySelector("#btn-modal-print-char");b&&this._on(b,"click",t=>{t.stopPropagation(),this.selectedCard&&(o.playPop(),R([this.selectedCard],`凯茜识字 · 【${this.selectedCard.char}】字专项田字格练字帖`))});const $=e.querySelector("#btn-modal-morph-theater");$&&this._on($,"click",t=>{t.stopPropagation(),this.selectedCard&&(o.playPop(),A(this.selectedCard))});const v=e.querySelector("#btn-modal-demo-strokes");v&&this._on(v,"click",t=>{t.stopPropagation(),this.selectedCard&&(o.playPop(),this.openStrokeDemoModal(this.selectedCard))}),e.querySelectorAll(".card-modal-word-btn").forEach(t=>{this._on(t,"click",h=>{h.stopPropagation();const c=t.dataset.word;o.playPop(),o.speakPriority(c,{kind:"word",priority:1}),t.classList.add("ring-2","ring-orange-400"),this._timeout(()=>t.classList.remove("ring-2","ring-orange-400"),400)})});const y=e.querySelector("#card-modal-sentence");y&&this._on(y,"click",t=>{t.stopPropagation(),this.selectedCard&&this.selectedCard.sentence&&(o.playPop(),o.speakPriority(this.selectedCard.sentence,{kind:"sentence",emotion:"gentle"}),y.classList.add("ring-2","ring-orange-400"),this._timeout(()=>y.classList.remove("ring-2","ring-orange-400"),600))});const u=e.querySelector("#cards-page-viewport");u&&this._savedScrollTop>0&&(u.scrollTop=this._savedScrollTop)}openStrokeDemoModal(e){const s=document.createElement("div");s.id="stroke-demo-overlay",s.className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in",s.innerHTML=`
      <div class="relative w-full max-w-md sm:max-w-lg bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-8 shadow-2xl border-4 border-amber-300 flex flex-col items-center select-none">
        <button id="btn-close-stroke-demo" class="absolute -top-14 right-0 w-11 h-11 rounded-full bg-white text-gray-800 font-extrabold text-xl flex items-center justify-center shadow-2xl hover:bg-gray-100 active:scale-90 cursor-pointer border-2 border-amber-300" title="关闭">
          ${g.back("w-6 h-6")}
        </button>

        <div class="flex items-center justify-between w-full mb-4 pb-3 border-b border-amber-200">
          <span class="text-base sm:text-lg font-black text-amber-950 flex items-center gap-2">
            <span class="flex items-center">${g.brush("w-6 h-6")}</span>
            <span>标准笔顺演示 · “${e.char}” (${e.pinyin})</span>
          </span>
          <span id="demo-stroke-name" class="text-xs sm:text-sm font-black bg-amber-200 text-amber-950 px-3 py-1 rounded-full shadow-sm">准备起笔</span>
        </div>

        <div class="relative w-72 h-72 sm:w-80 sm:h-80 bg-amber-50 rounded-3xl border-4 border-amber-400 shadow-2xl overflow-hidden flex items-center justify-center my-3">
          <canvas id="stroke-demo-canvas" width="320" height="320" class="w-full h-full"></canvas>
        </div>

        <div class="flex items-center gap-3 mt-4 w-full justify-center">
          <button id="btn-replay-stroke-demo" class="btn-game-orange text-white text-sm font-black px-8 py-3 rounded-full shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer">
            <span class="flex items-center">${g.brush("w-5 h-5")}</span>
            <span>重新演示</span>
          </button>
        </div>
      </div>
    `,document.body.appendChild(s);const a=s.querySelector("#btn-close-stroke-demo"),n=s.querySelector("#btn-replay-stroke-demo"),x=s.querySelector("#stroke-demo-canvas"),d=s.querySelector("#demo-stroke-name");let f=!1,l=!1;const i=async()=>{if(f)return;f=!0,l=!1;const r=x.getContext("2d"),p=x.width,b=x.height,$=()=>{r.clearRect(0,0,p,b),r.fillStyle="#fffdf7",r.fillRect(0,0,p,b),r.strokeStyle="#fed7aa",r.lineWidth=1.5,r.setLineDash([4,4]),r.beginPath(),r.moveTo(p/2,0),r.lineTo(p/2,b),r.moveTo(0,b/2),r.lineTo(p,b/2),r.moveTo(0,0),r.lineTo(p,b),r.moveTo(p,0),r.lineTo(0,b),r.stroke(),r.setLineDash([]),r.strokeStyle="#f97316",r.lineWidth=3,r.strokeRect(0,0,p,b)},v=e.strokes||[];$(),r.fillStyle="rgba(0,0,0,0.06)",r.font=`bold ${p*.75}px sans-serif`,r.textAlign="center",r.textBaseline="middle",r.fillText(e.char,p/2,b/2+10);for(let y=0;y<v.length&&!l;y++){const u=v[y];d&&(d.textContent=`第 ${y+1} 笔：${u.name}`),o.playStrokeSound(),o.speakPriority(u.name,{kind:"char",priority:1});const t=u.start.x/100*p,h=u.start.y/100*b,c=u.end.x/100*p,k=u.end.y/100*b,C=u.corner?u.corner.x/100*p:null,S=u.corner?u.corner.y/100*b:null;await new Promise(j=>{let w=0;const q=()=>{if(l){j();return}if(w+=.08,w>1&&(w=1),r.strokeStyle="#ea580c",r.lineWidth=12,r.lineCap="round",r.lineJoin="round",r.beginPath(),r.moveTo(t,h),C!==null&&S!==null)if(w<=.5){const P=w/.5;r.lineTo(t+(C-t)*P,h+(S-h)*P)}else{r.lineTo(C,S);const P=(w-.5)/.5;r.lineTo(C+(c-C)*P,S+(k-S)*P)}else r.lineTo(t+(c-t)*w,h+(k-h)*w);r.stroke(),w<1?l||requestAnimationFrame(q):setTimeout(j,400)};requestAnimationFrame(q)})}l||(d&&(d.textContent="演示完成！"),o.playSuccessSound()),f=!1};this._on(a,"click",()=>{l=!0,s.remove()}),this._on(n,"click",()=>{l=!0,setTimeout(i,100)}),setTimeout(i,200)}renderCardDetailModal(){const e=this.selectedCard,s=m.isDifficultChar(e.id);return`
      <div id="card-modal-backdrop" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in perspective-1000 select-none">
        <div class="relative w-full max-w-md sm:max-w-lg flex flex-col items-center">
          
          <button id="btn-close-modal" class="absolute -top-14 right-0 w-11 h-11 rounded-full bg-white text-gray-800 font-extrabold text-xl flex items-center justify-center shadow-2xl hover:bg-gray-100 active:scale-90 z-50 cursor-pointer border-2 border-amber-300" title="关闭">
            ${g.back("w-6 h-6")}
          </button>

          <div id="flip-card" class="relative w-full h-[460px] sm:h-[480px] cursor-pointer preserve-3d transition-transform duration-500 ease-out ${this.isCardFlipped?"rotate-y-180":""}">
            
            <div class="absolute inset-0 bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl shadow-2xl border-4 border-amber-300 p-8 flex flex-col justify-between backface-hidden ${this.isCardFlipped?"pointer-events-none":""}">
              <div class="flex items-center justify-between">
                <span class="text-xs sm:text-sm font-black bg-amber-200 text-amber-950 px-4 py-1.5 rounded-full shadow-sm">${e.radical}部 · ${e.strokeCount||4}画</span>
                <div class="flex items-center gap-2">
                  <button id="btn-modal-print-char" class="flex items-center gap-1.5 bg-rose-200 hover:bg-rose-300 text-rose-950 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black shadow-md active:scale-90 transition-all cursor-pointer" title="打印该字A4田字格字帖">
                    <span class="flex items-center">${g.print("w-4 h-4 sm:w-5 sm:h-5")}</span>
                    <span>打印字帖</span>
                  </button>
                  <button id="btn-modal-morph-theater" class="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black shadow-md active:scale-90 transition-all cursor-pointer" title="查看象形字源蜕变动效">
                    <span class="flex items-center">${g.sparkle("w-4 h-4 sm:w-5 sm:h-5")}</span>
                    <span>象形微剧场</span>
                  </button>
                  <button id="btn-modal-demo-strokes" class="flex items-center gap-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black shadow-md active:scale-90 transition-all cursor-pointer" title="笔顺笔画动画演示">
                    <span class="flex items-center">${g.brush("w-4 h-4 sm:w-5 sm:h-5")}</span>
                    <span>笔顺</span>
                  </button>
                  <button id="btn-modal-speak-char" class="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg text-sm active:scale-90 cursor-pointer" title="朗读">
                    ${g.speaker("w-5 h-5")}
                  </button>
                </div>
              </div>

              <div class="flex flex-col items-center justify-center flex-1 my-3">
                <span class="text-3xl sm:text-4xl font-black text-amber-700 mb-2">${e.pinyin}</span>
                <span class="text-8xl sm:text-9xl font-black text-amber-950 drop-shadow-md glow-pulse">${e.char}</span>
                
                ${e.oracleGlyph?`
                  <div class="mt-3 flex items-center gap-2 bg-amber-200/70 px-4 py-1.5 rounded-full border border-amber-300 shadow-inner">
                    <span class="text-xs text-amber-900 font-black">甲骨文演变:</span>
                    <span class="text-2xl font-black text-amber-950">${e.oracleGlyph}</span>
                  </div>
                `:""}
              </div>

              <div class="w-full text-center">
                <span class="text-xs text-amber-800 font-bold bg-white/90 px-5 py-1.5 rounded-full shadow-sm animate-pulse border border-amber-200">
                  轻触卡片翻转查看字源与常用组词
                </span>
              </div>
            </div>

            <div class="absolute inset-0 bg-gradient-to-b from-orange-50 to-amber-100 rounded-3xl shadow-2xl border-4 border-orange-300 p-6 flex flex-col justify-between backface-hidden rotate-y-180 ${this.isCardFlipped?"":"pointer-events-none"}">
              <div class="flex items-center justify-between pb-3 border-b border-amber-200">
                <span class="text-sm font-black text-amber-950 flex items-center gap-2">
                  <span class="flex items-center">${g.book("w-5 h-5")}</span>
                  <span>常用词组与造句</span>
                </span>
                <span class="text-xs text-orange-600 font-bold bg-orange-100 px-3 py-0.5 rounded-full">已翻转</span>
              </div>

              <div class="flex-1 my-4 flex flex-col justify-around text-left">
                <div>
                  <span class="text-xs sm:text-sm font-black text-amber-900 block mb-2">常用词组 (点击朗读)：</span>
                  <div class="flex flex-wrap gap-2">
                    ${(e.words||[{word:`${e.char}子`,pinyin:""}]).map(a=>{const n=typeof a=="string"?a:a.word;return`<button class="card-modal-word-btn bg-white hover:bg-amber-100 text-amber-950 border-2 border-amber-300 text-sm sm:text-base font-black px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer" data-word="${n}">${n}</button>`}).join("")}
                  </div>
                </div>

                <div id="card-modal-sentence" class="bg-white/95 hover:bg-white p-4 rounded-2xl border-2 border-amber-300 text-xs sm:text-sm text-amber-950 font-semibold leading-relaxed cursor-pointer transition-all active:scale-95 shadow-md" title="点击朗读例句">
                  <span class="font-black text-orange-600">生活例句：</span>
                  ${e.sentence||`${e.char}字天天见，学好汉字乐趣多`}
                </div>
              </div>

              <div class="w-full flex items-center justify-between pt-3 border-t border-amber-200">
                <button id="btn-toggle-difficult" data-char-id="${e.id}" class="text-xs sm:text-sm font-black px-4 py-2 rounded-full shadow-md transition-all cursor-pointer ${s?"bg-rose-500 text-white animate-jelly":"bg-amber-200 text-amber-950 hover:bg-amber-300"}">
                  ${s?"已在难字本":"+ 加入难字本"}
                </button>
                <span class="text-xs text-gray-500 font-bold animate-pulse">点击返回正面</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    `}openFlashcardSlideshowModal(e){if(!e||e.length===0)return;let s=0,a=!1,n=!1,x=null;const d=document.createElement("div");d.id="flashcard-slideshow-overlay",d.className="fixed inset-0 z-[70] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 select-none text-white animate-fade-in",document.body.appendChild(d);const f=()=>{const l=e[s],i=m.isDifficultChar(l.id);d.innerHTML=`
        <header class="w-full max-w-3xl flex items-center justify-between border-b border-white/10 pb-3">
          <div class="flex items-center gap-3">
            <button id="btn-close-slideshow" class="btn-game-wood text-white font-black text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1 cursor-pointer">
              <span>退出轮播</span>
            </button>
            <span class="text-xs sm:text-sm font-black text-amber-300">
              第 <b class="text-yellow-300 text-base sm:text-lg">${s+1}</b> / ${e.length} 张字卡
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-toggle-autoplay" class="px-3.5 py-1.5 rounded-full text-xs font-black transition-all border ${n?"bg-emerald-500 border-emerald-400 text-white animate-pulse":"bg-white/10 border-white/20 text-white/80 hover:bg-white/20"} cursor-pointer">
              ${n?"暂停自动轮播":"开启 3秒轮播"}
            </button>
          </div>
        </header>

        <main class="flex-1 flex items-center justify-center w-full max-w-lg my-3">
          <div id="slideshow-card-box" class="relative w-full aspect-[4/5] max-h-[460px] preserve-3d transition-transform duration-500 cursor-pointer ${a?"rotate-y-180":""}">
            
            <div class="absolute inset-0 bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl shadow-2xl border-4 border-amber-300 p-6 flex flex-col justify-between backface-hidden text-amber-950 ${a?"pointer-events-none":""}">
              <div class="flex items-center justify-between">
                <span class="text-xs sm:text-sm font-black bg-amber-200 text-amber-950 px-3.5 py-1 rounded-full shadow-sm">${l.radical}部 · ${l.strokeCount||4}画</span>
                <button id="btn-slideshow-speak" class="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md active:scale-90 cursor-pointer">
                  ${g.speaker("w-4 h-4")}
                </button>
              </div>

              <div class="flex flex-col items-center justify-center flex-1 my-2">
                <span class="text-3xl sm:text-4xl font-black text-amber-700 mb-1 font-mono">${l.pinyin}</span>
                <span class="text-8xl sm:text-9xl font-black text-amber-950 drop-shadow-md font-serif">${l.char}</span>
                ${l.oracleGlyph?`<div class="mt-2 text-xs font-bold text-amber-800 bg-amber-200/60 px-3 py-1 rounded-full">甲骨文: ${l.oracleGlyph}</div>`:""}
              </div>

              <div class="text-center">
                <span class="text-[11px] font-bold text-amber-800 bg-white/80 px-4 py-1 rounded-full shadow-sm">
                  轻触卡片翻转查看词组造句
                </span>
              </div>
            </div>

            <div class="absolute inset-0 bg-gradient-to-b from-orange-50 to-amber-100 rounded-3xl shadow-2xl border-4 border-orange-300 p-6 flex flex-col justify-between backface-hidden rotate-y-180 text-amber-950 ${a?"":"pointer-events-none"}">
              <div class="flex items-center justify-between pb-2 border-b border-amber-200">
                <span class="text-xs sm:text-sm font-black text-amber-950">常用词组与造句</span>
                <span class="text-[10px] text-orange-600 font-bold bg-orange-100 px-2.5 py-0.5 rounded-full">背面</span>
              </div>

              <div class="flex-1 my-3 flex flex-col justify-around text-left">
                <div>
                  <span class="text-xs font-black text-amber-900 block mb-1.5">词组推荐：</span>
                  <div class="flex flex-wrap gap-2">
                    ${(l.words||[{word:`${l.char}子`,pinyin:""}]).map(c=>{const k=typeof c=="string"?c:c.word;return`<button class="slideshow-word-btn bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs sm:text-sm font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 cursor-pointer" data-word="${k}">${k}</button>`}).join("")}
                  </div>
                </div>

                <div class="bg-white/95 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 leading-relaxed font-semibold">
                  <span class="font-black text-orange-600">造句：</span>
                  ${l.sentence||`${l.char}字天天见，学好汉字乐趣多`}
                </div>
              </div>

              <div class="text-center">
                <span class="text-[11px] font-bold text-amber-800 bg-white/80 px-4 py-1 rounded-full shadow-sm">
                  轻触卡片翻回正面
                </span>
              </div>
            </div>

          </div>
        </main>

        <footer class="w-full max-w-lg flex items-center justify-between gap-2 border-t border-white/10 pt-3">
          <button id="btn-slideshow-prev" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none" ${s===0?"disabled":""}>
            ← 上一张
          </button>

          <div class="flex items-center gap-2">
            <button id="btn-slideshow-flip" class="bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs px-4 py-2 rounded-full shadow-md active:scale-95 cursor-pointer">
              翻转卡片
            </button>
            <button id="btn-slideshow-diff" class="text-xs font-black px-3.5 py-2 rounded-full shadow-md active:scale-95 cursor-pointer ${i?"bg-rose-500 text-white":"bg-white/10 text-white hover:bg-white/20"}">
              ${i?"已标难字":"标为难字"}
            </button>
          </div>

          <button id="btn-slideshow-next" class="btn-game-orange text-white font-black text-xs px-5 py-2 rounded-full shadow-lg cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none" ${s===e.length-1?"disabled":""}>
            下一张 →
          </button>
        </footer>
      `,o.speakPriority(`${l.char}，${l.pinyin}`,{kind:"char",priority:1});const r=d.querySelector("#btn-close-slideshow");r&&this._on(r,"click",()=>{x&&clearInterval(x),o.playPop(),d.remove()});const p=d.querySelector("#slideshow-card-box"),b=d.querySelector("#btn-slideshow-flip"),$=()=>{a=!a,o.playCardFlip(),p&&p.classList.toggle("rotate-y-180",a)};p&&this._on(p,"click",$),b&&this._on(b,"click",c=>{c.stopPropagation(),$()});const v=d.querySelector("#btn-slideshow-prev");v&&this._on(v,"click",c=>{c.stopPropagation(),s>0&&(s--,a=!1,o.playPop(),f())});const y=d.querySelector("#btn-slideshow-next");y&&this._on(y,"click",c=>{c.stopPropagation(),s<e.length-1&&(s++,a=!1,o.playPop(),f())});const u=d.querySelector("#btn-slideshow-speak");u&&this._on(u,"click",c=>{c.stopPropagation(),o.playPop(),o.speakPriority(`${l.char}，${l.pinyin}`,{kind:"char",priority:1})});const t=d.querySelector("#btn-slideshow-diff");t&&this._on(t,"click",c=>{c.stopPropagation(),m.isDifficultChar(l.id)?m.removeDifficultChar(l.id):m.addDifficultChar(l.id),o.playPop(),f()}),this._onDom(d.querySelectorAll(".slideshow-word-btn"),"click",c=>{c.stopPropagation();const k=c.currentTarget.dataset.word;o.playPop(),o.speakPriority(k,{kind:"word",priority:1})});const h=d.querySelector("#btn-toggle-autoplay");h&&this._on(h,"click",c=>{c.stopPropagation(),n=!n,o.playPop(),n?x=setInterval(()=>{s<e.length-1?(s++,a=!1,f()):(clearInterval(x),n=!1,f())},3200):x&&clearInterval(x),f()})};f()}}export{G as CardModule};
