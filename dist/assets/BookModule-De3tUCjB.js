import{B as A,s as S,m as $,e as g,S as y,G as c,a as l,b as w,C as I}from"./index-CObQJZ8f.js";import{p as P,g as j}from"./pronunciationEval-KUFB0C_O.js";const v=Object.freeze({READY:"ready",PARTIAL:"partial",BLOCKED:"blocked",EMPTY:"empty"}),z=.5,q=.1;function B(x){if(!x)return[];const e=x.targetChars||x.requiredChars;if(Array.isArray(e)&&e.length>0)return[...new Set(e.filter(t=>typeof t=="string"&&t.length===1))];const s=new Set;if(Array.isArray(x.pages)){for(const t of x.pages)if(typeof t.text=="string")for(const o of t.text)/[\u4e00-\u9fff]/.test(o)&&s.add(o)}return[...s]}function C(x,e={}){var u;const s=B(x);if(s.length===0)return _(x,v.EMPTY,[],[],[],[],{total:0,learnedCount:0,unknownCount:0,fuzzyCount:0,unknownRatio:0,fuzzyRatio:0},{message:"这本书没有明确的生字要求，可以直接读",action:"read"});const t=[],o=[],a=[];for(const b of s){const p=M(e,b);p?(((u=p.masteryRate)!=null?u:0)<50&&a.push(b),t.push(b)):o.push(b)}const r=s.length,n=o.length/r,i=a.length/r;let d,h,f;return n>z?(d=v.BLOCKED,h="go_learn",f=`这本书有 ${o.length} 个生字没学过（超过一半），先去认识它们吧！`):n>q?(d=v.PARTIAL,h="read_with_pinyin",f=`有 ${o.length} 个生字，我帮你标上拼音啦，慢慢来~`):(d=v.READY,h="read",a.length>0?f=`准备好了！${a.length} 个字可能有点生疏，加油回忆一下~`:f="所有字都认识啦，真棒！开始阅读吧~"),_(x,d,s,t,o,a,{total:r,learnedCount:t.length,unknownCount:o.length,fuzzyCount:a.length,unknownRatio:n,fuzzyRatio:i},{message:f,action:h})}function _(x,e,s,t,o,a,r,n={}){return{bookId:x==null?void 0:x.id,status:e,requiredChars:s,learned:t,unknown:o,fuzzy:a,stats:r,message:n.message||"",action:n.action||"read"}}function M(x,e){if(!x)return null;for(const[s,t]of Object.entries(x))if(t&&(s===e||t.charId===e||t.char===e))return t;return null}class R extends A{constructor(e){super(e),this.currentBook=null,this.currentPageIndex=0,this.isQuizMode=!1,this.isCertificateMode=!1,this.quizAnswered=!1,this.karaokeTimer=null,this.currentFilterStage="all",this.isAutoPlay=!1,this.showPinyin=!0,this.autoPlayTimer=null,this.userRecordedBlob=null,this.userRecordedUrl=null,this._progressKey="cathy_book_progress_v2",this.progressMap={},this.karaokeSessionId=0,this.currentQuizStage=1,this.isVoiceModalOpen=!1,this.isCatalogOpen=!1,this.isCharPopoverOpen=!1,this._loadProgress()}_loadProgress(){try{const e=S.getItem(this._progressKey);e&&(this.progressMap=JSON.parse(e))}catch(e){}}_saveProgress(){this.currentBook&&(this.progressMap[this.currentBook.id]=this.currentPageIndex);try{S.setItem(this._progressKey,JSON.stringify(this.progressMap))}catch(e){}}destroy(){var s,t,o;this.karaokeTimer&&(clearInterval(this.karaokeTimer),this.karaokeTimer=null),this.autoPlayTimer&&(clearTimeout(this.autoPlayTimer),this.autoPlayTimer=null),this.userRecordedUrl&&(URL.revokeObjectURL(this.userRecordedUrl),this.userRecordedUrl=null);const e=P||(typeof window!="undefined"?window.pronunciationEval:null);if(e&&e.state==="listening")try{e.stopAndEvaluate()}catch(a){}typeof document!="undefined"&&((s=document.getElementById("char-popover-overlay"))==null||s.remove(),(t=document.getElementById("book-catalog-drawer-overlay"))==null||t.remove(),(o=document.getElementById("user-voice-modal-overlay"))==null||o.remove()),this.karaokeSessionId++,this.isVoiceModalOpen=!1,this.isCatalogOpen=!1,this.isCharPopoverOpen=!1,super.destroy()}render(){this.destroy(),this.currentBook?this.isCertificateMode?this.renderCertificate():this.isQuizMode?this.renderQuiz():this.renderReader():this.renderShelf()}renderShelf(){const{content:e,destroy:s}=$(this.container,{activeMode:"books",heading:"凯茜分级绘本馆"});this._addCleanup(s);const t=g.progress.readBooks||[],o=g.progress.charRecords||{},a=y.filter(r=>this.currentFilterStage==="all"?!0:(r.stage||1)===parseInt(this.currentFilterStage,10));e.innerHTML=`
      <div class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pt-16 sm:pt-20 px-4 pb-12 overflow-y-auto no-scrollbar max-h-[calc(100vh-60px)]">
        
        <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-amber-400 shadow-md flex items-center justify-center border-2 border-white flex-shrink-0">
              <span class="flex items-center">${c.book("w-7 h-7")}</span>
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl font-black text-amber-950 flex items-center gap-2">
                <span>魔法绘本馆</span>
                <span class="text-xs bg-orange-500 text-white font-bold px-2.5 py-0.5 rounded-full shadow-sm">${y.length} 册精选</span>
              </h1>
              <p class="text-xs text-amber-800/80 font-bold mt-0.5">严格子集阅读 · 伴读变色 · 探索寻宝</p>
            </div>
          </div>

          <div class="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-200 shadow-sm">
            <span class="text-xs text-amber-900/70 font-bold">已读进度:</span>
            <span class="text-xs font-black text-orange-600">${t.length} / ${y.length} 本</span>
            <span class="text-amber-300">|</span>
            <span class="flex items-center gap-1 text-xs font-black text-amber-900">
              <span class="flex items-center">${c.star("w-4 h-4",!1)}</span>
              <span>${t.length*3} 星</span>
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar py-1">
          ${[{key:"all",label:"全部绘本",count:y.length},{key:"1",label:"第1阶 · 启蒙森林",count:y.filter(r=>(r.stage||1)===1).length},{key:"2",label:"第2阶 · 缤纷生活",count:y.filter(r=>(r.stage||1)===2).length},{key:"3",label:"第3阶 · 星际进阶",count:y.filter(r=>(r.stage||1)===3).length}].map(r=>`
            <button class="stage-filter-btn px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 active:scale-95 ${this.currentFilterStage===r.key?"bg-amber-500 text-white shadow-md ring-2 ring-amber-300 scale-105":"bg-white/80 text-amber-950 hover:bg-white border border-amber-200 shadow-sm"}" data-stage="${r.key}">
              <span>${r.label}</span>
              <span class="text-[10px] opacity-75">(${r.count})</span>
            </button>
          `).join("")}
        </div>

        ${a.length===0?`
          <div class="w-full bg-white/80 backdrop-blur-md rounded-3xl p-12 text-center border-2 border-amber-200 shadow-md my-4">
            <div class="w-16 h-16 mx-auto mb-3 opacity-60 flex items-center justify-center">${c.book("w-16 h-16")}</div>
            <p class="text-sm font-black text-amber-900">该分阶下暂无绘本</p>
          </div>
        `:`
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          ${a.map(r=>{const n=t.includes(r.id);return`
            <div class="book-card group bg-white rounded-3xl overflow-hidden shadow-lg border-4 ${n?"border-amber-400 ring-2 ring-amber-300/40":"border-amber-200/80 hover:border-orange-400"} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer flex flex-col justify-between" data-book-id="${r.id}">
              
              <div class="relative w-full h-44 overflow-hidden bg-amber-100">
                <img src="${r.coverImg}" alt="${r.title}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                <div class="absolute top-2.5 left-2.5 bg-black/50 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-white/20">
                  第 ${r.level||1} 阶
                </div>

                ${(()=>{const i=C(r,o);return i.status===v.READY||i.status===v.EMPTY?"":`<div class="absolute bottom-2.5 left-2.5 ${i.status===v.PARTIAL?"bg-sky-500":"bg-rose-500"} text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">${i.status==="blocked"?"🔒":"📚"}${i.stats.unknownCount}字</div>`})()}

                ${n?`
                  <div class="absolute top-2.5 right-2.5 bg-amber-500 text-white px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-yellow-200 text-[10px] font-black">
                    <span class="flex items-center">${c.crown("w-3.5 h-3.5")}</span>
                    <span>已通关</span>
                  </div>
                `:""}
              </div>

              <div class="p-4 flex flex-col justify-between flex-1 bg-white">
                <div>
                  <div class="flex items-center justify-between">
                    <h3 class="text-base font-black text-amber-950 group-hover:text-orange-600 transition-colors">
                      ${r.title}
                    </h3>
                    <div class="flex items-center gap-0.5">
                      <span class="flex items-center">${c.star("w-4 h-4",!n)}</span>
                      <span class="flex items-center">${c.star("w-4 h-4",!n)}</span>
                      <span class="flex items-center">${c.star("w-4 h-4",!n)}</span>
                    </div>
                  </div>

                  <p class="text-xs text-gray-500 mt-1 line-clamp-1 font-semibold">
                    ${r.desc}
                  </p>
                </div>

                <div class="mt-3 pt-2.5 border-t border-amber-100 flex items-center justify-between">
                  <div class="flex items-center gap-1 overflow-hidden">
                    <span class="text-[11px] text-amber-800/70 font-bold shrink-0">生字:</span>
                    ${(r.targetChars||["日","月","山"]).slice(0,4).map(i=>`
                      <span class="bg-amber-100/70 text-orange-800 text-[11px] font-black px-1.5 py-0.5 rounded-md">${i}</span>
                    `).join("")}
                  </div>
                  
                  <button class="btn-game-orange text-white font-black text-xs px-4 py-1.5 rounded-full shadow-md active:scale-95 transition-transform cursor-pointer shrink-0">
                    ${n?"重温":"阅读"}
                  </button>
                </div>
              </div>

            </div>
          `}).join("")}
        </div>
        `}

      </div>
    `,e.querySelectorAll(".stage-filter-btn").forEach(r=>{this._on(r,"click",()=>{this.currentFilterStage=r.dataset.stage,l.playPop(),this.render()})}),e.querySelectorAll(".book-card").forEach(r=>{this._on(r,"click",()=>{var h,f;const n=r.dataset.bookId;this.currentBook=y.find(u=>u.id===n);const i=g.progress.charRecords||{},d=C(this.currentBook,i);if(d.status===v.BLOCKED){(f=(h=l).playErrorSound)==null||f.call(h),w(this.container,d.message,{});return}this.currentPageIndex=this.progressMap[n]||0,this.isQuizMode=!1,this.isCertificateMode=!1,this.quizAnswered=!1,this.currentQuizStage=1,d.status===v.PARTIAL?(this.showPinyin=!0,w(this.container,d.message,{})):d.message&&w(this.container,d.message,{}),l.playSuccessSound(),this.render()})})}renderReader(){const e=this.currentBook,s=e.pages[this.currentPageIndex],t=e.pages.length,{content:o,destroy:a}=$(this.container,{activeMode:"books",heading:`${e.title}`});this._addCleanup(a);const r=j.convert(s.text||"");o.innerHTML=`
      <div class="relative w-full max-w-5xl mx-auto flex flex-col justify-between pt-16 sm:pt-20 pb-6 px-4 select-none animate-fade-in">
        
        <div class="w-full flex items-center justify-between bg-white/95 backdrop-blur-md px-4 sm:px-5 py-2.5 rounded-2xl shadow-xl border-2 border-amber-200/90 mb-3 flex-wrap gap-2">
          
          <div class="flex items-center gap-2">
            <button id="btn-back-shelf" class="flex items-center gap-1.5 text-amber-900 hover:text-orange-600 font-black text-xs px-3 py-1.5 rounded-full hover:bg-amber-100 transition-all cursor-pointer">
              <span class="flex items-center">${c.home("w-4 h-4")}</span>
              <span>书架</span>
            </button>

            <button id="btn-open-catalog" class="flex items-center gap-1 text-amber-900 hover:text-orange-600 font-black text-xs px-3 py-1.5 rounded-full hover:bg-amber-100 transition-all cursor-pointer border border-amber-200" title="打开全书目录与快速跳页">
              <span class="flex items-center">${c.cards("w-3.5 h-3.5")}</span>
              <span>目录</span>
            </button>
          </div>
          
          <div class="flex items-center gap-2">
            <h2 class="text-xs sm:text-sm font-black text-amber-950">${e.title}</h2>
            <span class="text-[11px] sm:text-xs text-orange-700 bg-orange-100/90 px-2.5 py-0.5 rounded-full font-black border border-orange-200">
              ${this.currentPageIndex+1} / ${t} 页
            </span>
          </div>

          <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            
            <button id="btn-toggle-pinyin" class="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-black shadow-sm transition-all cursor-pointer ${this.showPinyin?"bg-amber-400 text-amber-950 font-black ring-2 ring-amber-300":"bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"}" title="切换汉字上方标准拼音注音">
              <span>${this.showPinyin?"拼音: 开":"拼音: 关"}</span>
            </button>

            <button id="btn-toggle-autoplay" class="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-black shadow-sm transition-all cursor-pointer ${this.isAutoPlay?"bg-gradient-to-r from-emerald-500 to-green-500 text-white animate-pulse ring-2 ring-emerald-300":"bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"}" title="开启后自动朗读并连续翻页">
              <span class="flex items-center">${c.sparkle("w-3.5 h-3.5")}</span>
              <span>${this.isAutoPlay?"连读中":"自动连读"}</span>
            </button>

            <button id="btn-user-read" class="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs px-3 sm:px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1 active:scale-95 cursor-pointer hover:brightness-110" title="点击录音自己读一页">
              <span class="flex items-center">${c.speaker("w-3.5 h-3.5")}</span>
              <span>我来读</span>
            </button>

            <button id="btn-play-karaoke" class="btn-game-orange text-white font-black text-xs px-3.5 sm:px-4 py-1.5 rounded-full shadow-md flex items-center gap-1 active:scale-95 cursor-pointer">
              <span class="flex items-center">${c.speaker("w-3.5 h-3.5")}</span>
              <span>伴读</span>
            </button>
          </div>
        </div>

        <div class="w-full bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300/90 mb-4 flex flex-col md:flex-row items-stretch min-h-[380px] relative">
          
          <div class="w-full md:w-1/2 bg-amber-50/40 flex flex-col justify-center border-b-4 md:border-b-0 md:border-r-2 border-amber-200/80 relative shadow-[inset_-6px_0_12px_rgba(0,0,0,0.03)]">
            <div class="relative w-full aspect-video md:aspect-auto md:h-full min-h-[240px] bg-amber-100/50 group overflow-hidden flex items-center justify-center">
              <img src="${s.image}" alt="绘本插图" loading="lazy" decoding="async" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              
              ${(s.interactions||s.hotspots||[]).map((n,i)=>`
                <button class="hotspot-trigger-btn absolute z-20 w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white text-amber-950 font-black text-xs flex items-center justify-center shadow-xl animate-bounce-slow active:scale-90 hover:scale-125 transition-transform cursor-pointer" style="top: ${n.y}; left: ${n.x};" data-sound="${n.sound||""}" data-label="${n.text||n.label||""}">
                  <span class="flex items-center pointer-events-none">${c.sparkle("w-6 h-6")}</span>
                </button>
              `).join("")}
            </div>

            <div class="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full pointer-events-none flex items-center gap-1.5 z-10 border border-white/20">
              <span class="flex items-center">${c.sparkle("w-3.5 h-3.5")}</span>
              <span>画面隐藏宝藏，点击试试！</span>
            </div>
          </div>

          <div class="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between text-center bg-gradient-to-br from-[#FFFDF9] to-[#FFF9EE]">
            
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-black text-amber-800/80 bg-amber-100/80 px-3 py-0.5 rounded-full border border-amber-200/80 shadow-sm">
                点读伴读 · 点击生字查字源
              </span>
              <span class="text-[11px] font-bold text-orange-600 bg-orange-100/60 px-2.5 py-0.5 rounded-full">
                第 ${this.currentPageIndex+1} 页
              </span>
            </div>

            <div id="karaoke-text-container" class="flex flex-wrap justify-center items-end gap-x-1.5 sm:gap-x-2 gap-y-3 my-auto py-4">
              ${r.map((n,i)=>{if(n.isPunct)return`
                    <div class="inline-flex flex-col items-center justify-end mx-0.5 pb-1 align-bottom">
                      <span class="h-4 sm:h-5"></span>
                      <span class="text-3xl sm:text-4xl md:text-5xl font-serif text-amber-900/60">${n.char}</span>
                    </div>
                  `;const d=(e.targetChars||[]).includes(n.char);return`
                  <div class="inline-flex flex-col items-center justify-end mx-1 align-bottom group/char select-none">
                    <span class="text-[12px] sm:text-[14px] font-black text-orange-600 tracking-normal h-4 sm:h-5 flex items-center justify-center transition-all duration-200 ${this.showPinyin?"opacity-100":"opacity-0"}">${n.pinyinMarked}</span>
                    <span class="karaoke-char text-3xl sm:text-4xl md:text-5xl font-black px-2 sm:px-2.5 py-1 rounded-2xl cursor-pointer hover:bg-orange-100 hover:scale-110 active:scale-95 transition-all duration-200 ${d?"text-orange-800 bg-amber-100/90 font-black shadow-sm border-2 border-amber-300":"text-amber-950"}" data-index="${i}" data-char="${n.char}" data-target="${d?"1":"0"}">
                      ${n.char}
                    </span>
                  </div>
                `}).join("")}
            </div>

            <div class="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-xs font-black text-amber-800/80 flex items-center gap-1">
                  <span class="flex items-center">${c.sparkle("w-3.5 h-3.5")}</span>
                  <span>核心生字:</span>
                </span>
                ${(e.targetChars||[]).map(n=>`
                  <button class="target-char-pill bg-amber-100 hover:bg-orange-500 hover:text-white text-orange-800 font-black text-xs px-2.5 py-1 rounded-xl border border-amber-300/80 shadow-sm transition-all active:scale-90 cursor-pointer flex items-center gap-1" data-char="${n}">
                    <span>${n}</span>
                    <span class="text-[9px] bg-orange-400 text-white px-1 rounded-full pointer-events-none">速查</span>
                  </button>
                `).join("")}
              </div>

              <span class="text-[10px] text-amber-700/60 font-bold hidden sm:inline">
                支持键盘 ← → 翻页
              </span>
            </div>

          </div>

        </div>

        <div class="w-full flex items-center justify-between px-2 sm:px-6">
          <button id="btn-prev-page" class="bg-white hover:bg-amber-50 text-amber-900 font-black text-xs px-6 py-2.5 rounded-full shadow-lg border-2 border-amber-200 transition-all active:scale-95 cursor-pointer ${this.currentPageIndex===0?"opacity-40 pointer-events-none":""}">
            上一页
          </button>

          <div class="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-200 shadow-sm">
            ${e.pages.map((n,i)=>`
              <div class="transition-all ${i===this.currentPageIndex?"w-6 h-2.5 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full shadow-sm":"w-2.5 h-2.5 bg-amber-200 rounded-full"}"></div>
            `).join("")}
          </div>

          <button id="btn-next-page" class="btn-game-orange text-white font-black text-xs px-7 py-2.5 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer">
            ${this.currentPageIndex===t-1?"完成阅读 · 测验":"下一页"}
          </button>
        </div>

      </div>
    `,this.bindReaderEvents(o,s,e),this.isAutoPlay&&this._timeout(()=>{this.isAutoPlay&&this.currentBook&&!this.isQuizMode&&!this.isCertificateMode&&this.playKaraoke(s,o)},350)}bindReaderEvents(e,s,t){const o=t.pages.length,a=e.querySelector("#btn-back-shelf");a&&this._on(a,"click",()=>{l.playPop(),this._saveProgress(),this.currentBook=null,this.render()});const r=e.querySelector("#btn-open-catalog");r&&this._on(r,"click",()=>{l.playPop(),this.openCatalogDrawer(t)});const n=e.querySelector("#btn-toggle-pinyin");n&&this._on(n,"click",()=>{l.playPop(),this.showPinyin=!this.showPinyin,this.render()});const i=e.querySelector("#btn-toggle-autoplay");i&&this._on(i,"click",()=>{l.playPop(),this.isAutoPlay=!this.isAutoPlay,this.isAutoPlay?w(this.container,"已开启自动连读伴读模式","success"):(w(this.container,"已暂停自动连读","info"),this.autoPlayTimer&&(clearTimeout(this.autoPlayTimer),this.autoPlayTimer=null)),this.render()});const d=e.querySelector("#btn-user-read");d&&this._on(d,"click",()=>{l.playPop(),this.openUserVoiceModal(s)});const h=e.querySelector("#btn-play-karaoke");h&&this._on(h,"click",()=>{l.playPop(),this.playKaraoke(s,e)}),e.querySelectorAll(".karaoke-char").forEach(p=>{this._on(p,"click",()=>{const m=p.dataset.char,k=p.dataset.target==="1";l.speakPriority(m,{kind:"char",priority:1}),p.classList.add("bg-amber-300","scale-125"),setTimeout(()=>p.classList.remove("bg-amber-300","scale-125"),400),k&&this._timeout(()=>this.openCharPopover(m),250)})}),e.querySelectorAll(".target-char-pill").forEach(p=>{this._on(p,"click",()=>{const m=p.dataset.char;l.playPop(),l.speakPriority(m,{kind:"char",priority:1}),this.openCharPopover(m)})}),e.querySelectorAll(".hotspot-trigger-btn").forEach(p=>{this._on(p,"click",m=>{m.stopPropagation();const k=p.dataset.label||"发现宝藏！";l.playSuccessSound(),l.triggerConfetti(this.container),l.speakPriority(k,{kind:"sentence",emotion:"excited"}),w(this.container,`${k}`,"success")})});const f=e.querySelector("#btn-prev-page");f&&this._on(f,"click",()=>{this.currentPageIndex>0&&(l.playPop(),this.currentPageIndex--,this._saveProgress(),this.render())});const u=e.querySelector("#btn-next-page");u&&this._on(u,"click",()=>{l.playPop(),this.currentPageIndex<o-1?(this.currentPageIndex++,this._saveProgress(),this.render()):(this.isQuizMode=!0,this.currentQuizStage=1,this.quizAnswered=!1,this.render())});const b=p=>{p.key==="ArrowRight"||p.key==="PageDown"?this.currentPageIndex<o-1&&(this.currentPageIndex++,this._saveProgress(),this.render()):(p.key==="ArrowLeft"||p.key==="PageUp")&&this.currentPageIndex>0&&(this.currentPageIndex--,this._saveProgress(),this.render())};this._onWindow("keydown",b)}openCharPopover(e){var n;if(this.isCharPopoverOpen)return;this.isCharPopoverOpen=!0;const s=I.find(i=>i.char===e)||{char:e,pinyin:"zì",words:[{word:e,pinyin:"",mean:"核心生字"}],originStory:"古代象形文字，形象生动描绘了事物特征。",exampleSentence:`我们在绘本中认识了“${e}”字。`},t=document.createElement("div");t.id="char-popover-overlay",t.className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in",t.innerHTML=`
      <div class="relative w-full max-w-lg bg-gradient-to-b from-[#FFFDF8] to-[#FFF6E5] rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-300 flex flex-col items-center select-none animate-scale-up">
        
        <button id="btn-close-popover" class="absolute -top-3.5 -right-3.5 w-10 h-10 rounded-full bg-white text-gray-800 font-extrabold text-base flex items-center justify-center shadow-xl hover:bg-gray-100 active:scale-95 cursor-pointer border-2 border-amber-200">
          <span class="font-sans font-bold leading-none">X</span>
        </button>

        <div class="flex items-center gap-2 mb-4">
          <span class="flex items-center">${c.sparkle("w-6 h-6")}</span>
          <h3 class="text-lg font-black text-amber-950">生字全息卡 · 深度认知</h3>
        </div>

        <div class="w-full flex flex-col sm:flex-row items-center gap-6 mb-4">
          
          <div class="w-36 h-36 bg-red-50/70 border-4 border-red-500 rounded-3xl relative flex flex-col items-center justify-center flex-shrink-0 shadow-md">
            <div class="absolute inset-0 border-t-2 border-dashed border-red-300 top-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div class="absolute inset-0 border-l-2 border-dashed border-red-300 left-1/2 -translate-x-1/2 pointer-events-none"></div>
            <div class="absolute top-2 text-xs font-black text-red-600">${s.pinyin}</div>
            <span class="text-6xl font-black text-red-900 font-serif relative z-10">${s.char}</span>
          </div>

          <div class="flex-1 flex flex-col gap-2 w-full text-left">
            <div class="bg-white/80 p-3 rounded-2xl border border-amber-200">
              <span class="text-[11px] font-black text-amber-800/70 block mb-1">常用组词与释义：</span>
              <div class="flex flex-wrap gap-1.5">
                ${(s.words||[]).slice(0,3).map(i=>`
                  <span class="bg-amber-100 text-orange-900 text-xs font-black px-2.5 py-1 rounded-xl border border-amber-300/60">
                    ${i.word}
                  </span>
                `).join("")}
              </div>
            </div>

            <div class="bg-white/80 p-3 rounded-2xl border border-amber-200">
              <span class="text-[11px] font-black text-amber-800/70 block mb-1">字源故事：</span>
              <p class="text-xs text-amber-950 font-semibold leading-relaxed line-clamp-2">
                ${s.originStory||((n=s.evolution)==null?void 0:n.story)||(typeof s.evolution=="string"?s.evolution:"")||"形象描摹天地万物之形，传承千年华夏文明。"}
              </p>
            </div>
          </div>

        </div>

        <div class="w-full bg-amber-100/60 p-3 rounded-2xl border border-amber-200/80 mb-5 text-left">
          <span class="text-[11px] font-black text-amber-800/80 block mb-0.5">例句巩固：</span>
          <p class="text-xs text-amber-950 font-bold">${s.exampleSentence||s.sentence||`我们在日常生活中常常用到“${s.char}”字。`}</p>
        </div>

        <div class="w-full flex items-center justify-center gap-4">
          <button id="btn-popover-speak" class="btn-game-orange text-white font-black text-xs px-8 py-3 rounded-full shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer">
            <span class="flex items-center">${c.speaker("w-4 h-4")}</span>
            <span>朗读“${s.char}”字发音</span>
          </button>
        </div>

      </div>
    `,document.body.appendChild(t);const o=t.querySelector("#btn-close-popover"),a=()=>{this.isCharPopoverOpen=!1,t.remove()};this._on(o,"click",a),this._on(t,"click",i=>{i.target===t&&a()});const r=t.querySelector("#btn-popover-speak");this._on(r,"click",()=>{l.playPop(),l.speakPriority(s.char,{kind:"char",priority:1})})}openCatalogDrawer(e){if(this.isCatalogOpen)return;this.isCatalogOpen=!0;const s=document.createElement("div");s.id="book-catalog-drawer-overlay",s.className="fixed inset-0 z-[75] bg-black/75 backdrop-blur-md flex items-center justify-end animate-fade-in",s.innerHTML=`
      <div class="relative w-full max-w-md h-full bg-gradient-to-b from-[#FFFDF9] to-[#FFF7E8] p-6 shadow-2xl border-l-4 border-amber-300 flex flex-col justify-between select-none animate-slide-left">
        
        <div>
          <div class="flex items-center justify-between pb-4 border-b border-amber-200 mb-4">
            <div class="flex items-center gap-2">
              <span class="flex items-center">${c.book("w-6 h-6")}</span>
              <h3 class="text-base font-black text-amber-950">《${e.title}》全书目录</h3>
            </div>
            
            <button id="btn-close-catalog" class="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs flex items-center justify-center cursor-pointer">
              <span class="font-sans font-bold leading-none">X</span>
            </button>
          </div>
          
          <p class="text-xs text-amber-800/70 font-bold mb-3">共 ${e.pages.length} 页 · 点击任意页码快速跳转</p>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 pr-1 my-2">
          ${e.pages.map((o,a)=>{const r=a===this.currentPageIndex;return`
              <div class="catalog-page-card group p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${r?"bg-amber-100/90 border-orange-500 shadow-md ring-2 ring-orange-300":"bg-white border-amber-200 hover:border-orange-400 hover:shadow"}" data-page-index="${a}">
                
                <div class="w-16 h-12 rounded-xl overflow-hidden bg-amber-100 flex-shrink-0 border border-amber-200">
                  <img src="${o.image}" alt="第${a+1}页" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>

                <div class="flex-1 overflow-hidden">
                  <div class="flex items-center justify-between mb-0.5">
                    <span class="text-xs font-black ${r?"text-orange-700":"text-amber-950"}">第 ${a+1} 页</span>
                    ${r?'<span class="text-[10px] bg-orange-500 text-white font-black px-2 py-0.5 rounded-full">当前正在读</span>':""}
                  </div>
                  <p class="text-[11px] text-gray-500 font-semibold truncate">${o.text}</p>
                </div>

              </div>
            `}).join("")}
        </div>

        <div class="pt-3 border-t border-amber-200 flex items-center justify-between">
          <span class="text-[11px] text-amber-800/70 font-bold">凯茜分级绘本精选</span>
          <button id="btn-catalog-back" class="btn-game-orange text-white font-black text-xs px-6 py-2 rounded-full shadow cursor-pointer">
            继续阅读
          </button>
        </div>

      </div>
    `,document.body.appendChild(s);const t=()=>{this.isCatalogOpen=!1,s.remove()};this._on(s.querySelector("#btn-close-catalog"),"click",t),this._on(s.querySelector("#btn-catalog-back"),"click",t),this._on(s,"click",o=>{o.target===s&&t()}),this._onDom(s.querySelectorAll(".catalog-page-card"),"click",o=>{const a=o.currentTarget,r=parseInt(a.dataset.pageIndex,10);l.playPop(),this.currentPageIndex=r,this._saveProgress(),t(),this.render()})}openUserVoiceModal(e){if(this.isVoiceModalOpen)return;this.isVoiceModalOpen=!0;let s="kid";const t=document.createElement("div");t.id="user-voice-modal-overlay",t.className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in",t.innerHTML=`
      <div class="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
        
        <button id="btn-close-voice-modal" class="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white text-gray-800 font-extrabold text-base flex items-center justify-center shadow-xl hover:bg-gray-100 active:scale-95 cursor-pointer border-2 border-amber-200">
          <span class="font-sans font-bold text-base leading-none">X</span>
        </button>

        <div class="flex items-center gap-2 mb-1">
          <span class="flex items-center">${c.speaker("w-7 h-7")}</span>
          <h3 class="text-xl font-black text-amber-950">亲子双轨共读秀 · 我来录故事</h3>
        </div>
        <p class="text-xs text-amber-800/80 mb-3 font-bold">选择录音角色，录制属于我们家的专属有声绘本！</p>

        <div class="flex items-center gap-2 mb-4 bg-white/80 p-1.5 rounded-full border border-amber-200 shadow-sm">
          <button class="role-select-btn px-3 py-1 rounded-full text-xs font-black transition-all active:scale-95 bg-orange-500 text-white shadow" data-role="kid">
            宝贝朗读
          </button>
          <button class="role-select-btn px-3 py-1 rounded-full text-xs font-black transition-all active:scale-95 text-amber-900 hover:bg-amber-100" data-role="parent">
            家长朗读
          </button>
          <button class="role-select-btn px-3 py-1 rounded-full text-xs font-black transition-all active:scale-95 text-amber-900 hover:bg-amber-100" data-role="duet">
            亲子合读
          </button>
        </div>

        <div class="w-full bg-white/90 p-4 rounded-2xl border-2 border-amber-200 shadow-inner mb-4">
          <p class="text-lg font-black text-amber-950 leading-relaxed">${e.text}</p>
        </div>

        <div class="relative w-24 h-24 mb-3 flex items-center justify-center">
          <div id="voice-glow-bg" class="absolute inset-0 rounded-full bg-rose-400/30 blur-xl opacity-0 transition-opacity"></div>
          <button id="btn-start-record" class="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-red-500 text-white shadow-2xl flex flex-col items-center justify-center active:scale-90 transition-all cursor-pointer border-4 border-white">
            <span class="flex items-center mb-0.5">${c.speaker("w-6 h-6")}</span>
            <span id="record-btn-label" class="text-[10px] font-black">开始录音</span>
          </button>
        </div>

        <div id="voice-status-text" class="text-xs font-bold text-amber-900 mb-3 h-6">准备就绪，点击麦克风开始录制</div>

        <button id="btn-playback-voice" class="hidden bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-6 py-2.5 rounded-full shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer transition-all">
          <span class="flex items-center">${c.speaker("w-4 h-4")}</span>
          <span id="playback-btn-text">听听我们的朗读录音</span>
        </button>

      </div>
    `,document.body.appendChild(t);const o=t.querySelector("#btn-close-voice-modal"),a=t.querySelector("#btn-start-record"),r=t.querySelector("#record-btn-label"),n=t.querySelector("#voice-status-text"),i=t.querySelector("#btn-playback-voice"),d=t.querySelector("#playback-btn-text");this._onDom(t.querySelectorAll(".role-select-btn"),"click",u=>{const b=u.currentTarget;l.playPop(),s=b.dataset.role,t.querySelectorAll(".role-select-btn").forEach(m=>{m.classList.remove("bg-orange-500","text-white","shadow"),m.classList.add("text-amber-900")}),b.classList.add("bg-orange-500","text-white","shadow"),b.classList.remove("text-amber-900");const p=s==="kid"?"宝贝":s==="parent"?"家长":"亲子合读";n.textContent=`已切换为【${p}】模式，点击麦克风开始！`});let h=!1;const f=()=>{this.isVoiceModalOpen=!1;const u=P||(typeof window!="undefined"?window.pronunciationEval:null);if(u&&u.state==="listening")try{u.stopAndEvaluate()}catch(b){}t.remove()};this._on(o,"click",f),this._on(a,"click",async()=>{if(h)return;h=!0,l.playFamilyRecordChime(!0);const u=s==="kid"?"宝贝":s==="parent"?"家长":"亲子";n.textContent=`正在录制【${u}】的声音... 请大声朗读`,r.textContent="录音中",a.classList.add("bg-rose-500","animate-pulse");const b=t.querySelector("#voice-glow-bg");b&&(b.classList.replace("opacity-0","opacity-100"),b.classList.add("animate-pulse"));try{const p=await P.evaluate(e.text,{mode:"sentence",maxSeconds:5});if(!this.isVoiceModalOpen)return;l.playParentCheer(),l.triggerConfetti(this.container),g.addCoins(20),g.save(),n.innerHTML=`<span class="text-emerald-600 font-black text-sm">${u} 朗读得分：${p.score||98} 分！获得 20 凯茜星币！</span>`,r.textContent="重新录音",a.classList.remove("bg-rose-500","animate-pulse"),b&&(b.classList.replace("opacity-100","opacity-0"),b.classList.remove("animate-pulse")),d&&(d.textContent=`回放【${u}】的朗读声音`),i.classList.remove("hidden"),h=!1}catch(p){if(!this.isVoiceModalOpen)return;l.playParentCheer(),n.innerHTML=`<span class="text-emerald-600 font-black text-sm">太好听了！${u} 录制完成！</span>`,r.textContent="再次录制",a.classList.remove("bg-rose-500","animate-pulse"),b&&(b.classList.replace("opacity-100","opacity-0"),b.classList.remove("animate-pulse")),i.classList.remove("hidden"),h=!1}}),this._on(i,"click",()=>{l.playPop(),l.speakPriority(e.text,{kind:"sentence",emotion:"gentle"})})}renderQuiz(){const e=this.currentBook,s=(e.targetChars||["日"])[0],t={title:"【第 1 关 · 生字眼力大考验】",question:`在《${e.title}》的故事中，你认识这颗生字吗？`,highlightChar:s,options:[`认识！读作“${s}”`,"不认识","好像在哪里见过"],correctIndex:0},o=Array.isArray(e.quiz)?e.quiz[0]:e.quiz||{question:`在故事《${e.title}》里，主要讲述了什么？`,options:["大家一起快乐识字探索","什么都没发生","大怪兽去睡觉了"],correctIndex:0},a=this.currentQuizStage===1?t:{title:"【第 2 关 · 故事理解小问答】",question:o.question,options:o.options,correctIndex:o.correctIndex!==void 0?o.correctIndex:0},{content:r,destroy:n}=$(this.container,{activeMode:"books",heading:`读后巩固测验 · ${e.title}`});this._addCleanup(n),l.speakPriority(a.question,{kind:"sentence"}),r.innerHTML=`
      <div class="relative w-full max-w-3xl mx-auto flex flex-col justify-between pt-16 sm:pt-20 pb-8 px-4 select-none animate-fade-in">
        
        <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
          <div class="mb-3 flex items-center justify-center transform hover:scale-110 transition-transform">
            ${c.trophy("w-16 h-16")}
          </div>
          <span class="text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-1 rounded-full mb-3 shadow-sm">
            ${a.title}
          </span>
          
          ${this.currentQuizStage===1&&a.highlightChar?`
            <div class="w-20 h-20 bg-red-50 border-4 border-red-500 rounded-2xl flex items-center justify-center mb-3 shadow-md">
              <span class="text-5xl font-black text-red-900 font-serif">${a.highlightChar}</span>
            </div>
          `:""}

          <h2 class="text-xl sm:text-2xl font-black text-amber-950 mb-6 leading-relaxed">
            ${a.question}
          </h2>

          <div class="flex flex-col gap-3.5 w-full max-w-lg">
            ${a.options.map((i,d)=>`
              <button class="quiz-option-btn group p-4 rounded-2xl bg-white hover:bg-amber-50/80 border-2 border-amber-200 hover:border-orange-400 shadow-md hover:shadow-xl text-amber-950 font-black text-sm sm:text-base active:scale-95 hover:scale-[1.02] transition-all duration-300 text-left flex items-center justify-between cursor-pointer" data-index="${d}">
                <span class="group-hover:text-orange-700 transition-colors">${i}</span>
                <span class="w-8 h-8 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 shadow-sm border border-amber-500 flex items-center justify-center text-xs text-amber-900 font-black shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)] group-hover:rotate-12 transition-transform">${String.fromCharCode(65+d)}</span>
              </button>
            `).join("")}
          </div>
        </div>

      </div>
    `,r.querySelectorAll(".quiz-option-btn").forEach(i=>{this._on(i,"click",()=>{if(this.quizAnswered)return;this.quizAnswered=!0,parseInt(i.dataset.index,10)===a.correctIndex?(l.playSuccessSound(),i.classList.add("ring-4","ring-emerald-500","bg-emerald-100"),r.querySelectorAll(".quiz-option-btn").forEach(h=>{h.style.pointerEvents="none"}),this._timeout(()=>{this.currentQuizStage===1?(this.currentQuizStage=2,this.quizAnswered=!1,this.render()):(g.markBookRead(e.id),g.addCoins(15),g.addStars(5),g.save(),this.isQuizMode=!1,this.isCertificateMode=!0,this.render())},800)):(l.playSoftError(),i.classList.add("animate-shake","ring-4","ring-rose-500","bg-rose-100"),this._timeout(()=>{i.classList.remove("animate-shake"),this.quizAnswered=!1},600))})})}renderCertificate(){const e=this.currentBook,{content:s,destroy:t}=$(this.container,{activeMode:"books",heading:`荣誉结业证书 · ${e.title}`});this._addCleanup(t),l.playVictoryFanfare(),l.triggerConfetti(this.container),l.triggerCoinFly(this.container),s.innerHTML=`
      <div class="relative w-full max-w-2xl mx-auto flex flex-col items-center justify-center pt-16 sm:pt-20 pb-8 px-4 select-none animate-scale-up">
        
        <div class="relative w-full bg-gradient-to-b from-[#FFFDF5] via-[#FFF8E7] to-[#FFF3D6] rounded-3xl p-8 sm:p-10 shadow-2xl border-8 border-amber-400 flex flex-col items-center text-center">
          
          <div class="absolute -top-7 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-2 rounded-full border-4 border-white shadow-xl flex items-center gap-2">
            <span class="flex items-center">${c.crown("w-6 h-6")}</span>
            <span class="text-sm font-black text-amber-950">小小阅读家 · 荣誉通关证书</span>
          </div>

          <div class="mt-4 mb-2 flex items-center justify-center">
            ${c.trophy("w-20 h-20")}
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-amber-950 mb-1">
            恭喜通关《${e.title}》
          </h2>
          <p class="text-xs text-amber-800/80 font-bold mb-5">
            凯茜识字分级阅读 · 顺利掌握全书精髓与核心生字
          </p>

          <div class="flex items-center gap-2 mb-6">
            <span class="flex items-center transform hover:scale-125 transition-transform">${c.star("w-8 h-8",!1)}</span>
            <span class="flex items-center transform hover:scale-125 transition-transform scale-125">${c.star("w-8 h-8",!1)}</span>
            <span class="flex items-center transform hover:scale-125 transition-transform">${c.star("w-8 h-8",!1)}</span>
          </div>

          <div class="w-full bg-white/90 p-4 rounded-2xl border-2 border-amber-200/90 mb-6 text-center">
            <span class="text-xs font-black text-amber-900 block mb-2">本次阅读巩固生字：</span>
            <div class="flex flex-wrap justify-center gap-2">
              ${(e.targetChars||["日","月","山"]).map(r=>`
                <div class="w-10 h-10 bg-red-50 border-2 border-red-400 rounded-xl flex items-center justify-center font-serif text-xl font-black text-red-900 shadow-sm">
                  ${r}
                </div>
              `).join("")}
            </div>
          </div>

          <div class="candy-pill rounded-full px-6 py-2 mb-6 text-sm text-yellow-300 font-black flex items-center gap-4 border-2 border-yellow-300 shadow-xl">
            <span class="flex items-center gap-1.5"><span class="flex items-center">${c.coin("w-5 h-5")}</span> +15 凯茜星币</span>
            <span class="flex items-center gap-1.5"><span class="flex items-center">${c.star("w-5 h-5",!0)}</span> +5 智慧星</span>
          </div>

          <div class="flex items-center gap-4 flex-wrap justify-center">
            <button id="btn-cert-replay" class="bg-white hover:bg-amber-50 text-amber-900 font-black text-xs px-6 py-3 rounded-full shadow-lg border-2 border-amber-200 active:scale-95 cursor-pointer">
              再次精读重温
            </button>
            <button id="btn-cert-back-shelf" class="btn-game-orange text-white font-black text-xs px-8 py-3 rounded-full shadow-xl active:scale-95 cursor-pointer">
              收录档案，返回书架
            </button>
          </div>

        </div>

      </div>
    `;const o=s.querySelector("#btn-cert-replay");o&&this._on(o,"click",()=>{l.playPop(),this.currentPageIndex=0,this.isQuizMode=!1,this.isCertificateMode=!1,this.render()});const a=s.querySelector("#btn-cert-back-shelf");a&&this._on(a,"click",()=>{l.playPop(),this.currentBook=null,this.isQuizMode=!1,this.isCertificateMode=!1,this.render()})}playKaraoke(e,s){const t=s.querySelectorAll(".karaoke-char");if(!t||t.length===0)return;this.karaokeTimer&&(clearInterval(this.karaokeTimer),this.karaokeTimer=null),this.karaokeSessionId++;const o=this.karaokeSessionId;t.forEach(a=>a.classList.remove("bg-amber-300","text-amber-950","scale-110","ring-4","ring-amber-200/90","shadow-md")),l.speakPriority(e.text,{kind:"sentence",emotion:"gentle",onProgress:({char_index:a})=>{this.karaokeSessionId!==o||!this.currentBook||t.forEach((r,n)=>{n===a?r.classList.add("bg-amber-300","text-amber-950","scale-110","ring-4","ring-amber-200/90","shadow-md"):r.classList.remove("bg-amber-300","text-amber-950","scale-110","ring-4","ring-amber-200/90","shadow-md")})},onEnd:()=>{this.karaokeSessionId!==o||!this.currentBook||(t.forEach(a=>a.classList.remove("bg-amber-300","text-amber-950","scale-110","ring-4","ring-amber-200/90","shadow-md")),this.isAutoPlay&&this.currentBook&&(this.autoPlayTimer=this._timeout(()=>{!this.isAutoPlay||!this.currentBook||this.karaokeSessionId!==o||(this.currentPageIndex<this.currentBook.pages.length-1?(this.currentPageIndex++,this._saveProgress(),this.render()):(this.isQuizMode=!0,this.currentQuizStage=1,this.quizAnswered=!1,this.render()))},1500)))}})}}export{R as BookModule};
