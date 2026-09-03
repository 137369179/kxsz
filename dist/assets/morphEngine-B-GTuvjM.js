import{a as s,G as g}from"./index-CObQJZ8f.js";function P(t){if(!t)return"";const x=t.evolution||{},p=x.story||"古人根据事物的真实样貌，画出了最初的线条图形，后来逐渐演变成为今天的规范汉字。";return`
    <div id="morph-theater-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
      <div class="relative w-full max-w-xl bg-white/95 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 flex flex-col items-center">
        
        <button id="btn-close-morph-theater" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-950 flex items-center justify-center shadow-md active:scale-90 cursor-pointer" title="关闭">
          ${g.back("w-5 h-5")}
        </button>

        <div class="text-center mb-3">
          <span class="text-xs font-black bg-amber-200 text-amber-950 px-3.5 py-1 rounded-full border border-amber-300">象形字源蜕变动效微剧场</span>
          <h3 class="text-xl sm:text-2xl font-black text-amber-950 mt-1">【${t.char}】字是怎么来的？</h3>
        </div>

        <div class="flex items-center gap-1.5 sm:gap-2 mb-2 w-full justify-center flex-wrap">
          <button class="morph-step-pill px-3 py-1 rounded-full text-xs font-black border transition-all bg-amber-500 text-white border-white shadow-md cursor-pointer" data-val="0">
            1. 自然象形
          </button>
          <button class="morph-step-pill px-3 py-1 rounded-full text-xs font-black border transition-all bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 cursor-pointer" data-val="33">
            2. 殷商甲骨
          </button>
          <button class="morph-step-pill px-3 py-1 rounded-full text-xs font-black border transition-all bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 cursor-pointer" data-val="66">
            3. 秦汉小篆
          </button>
          <button class="morph-step-pill px-3 py-1 rounded-full text-xs font-black border transition-all bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 cursor-pointer" data-val="100">
            4. 现代楷书
          </button>
        </div>

        <div class="relative w-full h-64 sm:h-72 rounded-3xl bg-gradient-to-b from-amber-50 to-orange-100 border-2 border-amber-200 shadow-inner flex items-center justify-center overflow-hidden my-2">
          
          <div id="morph-layer-nature" class="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-none opacity-100">
            <div class="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-amber-200/80 border-4 border-amber-400 flex items-center justify-center shadow-lg transform transition-transform duration-300">
              <span class="text-6xl sm:text-7xl font-black text-amber-900 font-serif">${t.char}</span>
            </div>
            <span class="text-xs font-bold text-amber-800 mt-3 bg-white/90 px-4 py-1 rounded-full shadow-sm border border-amber-200">
              第 1 幕 · 远古自然形貌
            </span>
          </div>

          <div id="morph-layer-oracle" class="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-none opacity-0">
            <div class="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-amber-900/10 border-4 border-dashed border-amber-600 flex items-center justify-center shadow-md">
              <span class="text-6xl sm:text-7xl font-black text-amber-900 font-serif">${t.oracleGlyph||t.bronzeGlyph||t.char}</span>
            </div>
            <span class="text-xs font-bold text-amber-800 mt-3 bg-white/90 px-4 py-1 rounded-full shadow-sm border border-amber-200">
              第 2 幕 · 殷商甲骨金文
            </span>
          </div>

          <div id="morph-layer-seal" class="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-none opacity-0">
            <div class="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-amber-100 border-4 border-amber-700 flex items-center justify-center shadow-lg">
              <span class="text-6xl sm:text-7xl font-black text-amber-950 font-serif">${t.bronzeGlyph||t.oracleGlyph||t.char}</span>
            </div>
            <span class="text-xs font-bold text-amber-900 mt-3 bg-white/90 px-4 py-1 rounded-full shadow-sm border border-amber-200">
              第 3 幕 · 秦汉金文小篆
            </span>
          </div>

          <div id="morph-layer-modern" class="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-none opacity-0">
            <div class="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 border-4 border-white shadow-2xl flex flex-col items-center justify-center">
              <span class="text-xs font-black text-yellow-100">${t.pinyin}</span>
              <span class="text-7xl sm:text-8xl font-black text-white font-serif leading-none drop-shadow-md">${t.char}</span>
            </div>
            <span class="text-xs font-bold text-orange-900 mt-3 bg-white/90 px-4 py-1 rounded-full shadow-sm border border-orange-200">
              第 4 幕 · 现代规范楷书
            </span>
          </div>

          <div id="morph-sparkle-layer" class="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500 bg-amber-400/20"></div>

        </div>

        <div class="w-full bg-amber-50 rounded-2xl p-4 border border-amber-200 mt-2 flex flex-col gap-2">
          <div class="flex items-center justify-between text-xs font-black text-amber-950">
            <span>自然图画 (0%)</span>
            <span id="morph-progress-label">当前阶段: 远古自然形貌</span>
            <span>规范汉字 (100%)</span>
          </div>
          <input id="morph-range-slider" type="range" min="0" max="100" value="0" class="w-full accent-orange-500 cursor-pointer h-2 bg-amber-200 rounded-lg" />
        </div>

        <div class="mt-3 bg-orange-50 border-2 border-orange-200 rounded-2xl p-3.5 w-full flex items-start gap-2.5 text-xs font-black text-orange-950 leading-relaxed">
          <span class="flex items-center text-orange-600 shrink-0 mt-0.5">${g.sparkle("w-4 h-4")}</span>
          <div class="flex flex-col gap-1">
            <p id="morph-stage-desc" class="text-amber-800 font-bold">${x.oracleDesc||"观察真实样貌，描绘原始图形。"}</p>
            <p id="morph-story-text" class="text-gray-600 font-normal">${p}</p>
          </div>
        </div>

        <div class="flex items-center gap-3 mt-3">
          <button id="btn-auto-play-morph" class="btn-game-orange text-white text-xs sm:text-sm font-black px-8 py-2.5 rounded-full shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer">
            <span class="flex items-center">${g.sparkle("w-4 h-4")}</span>
            <span>自动播放蜕变</span>
          </button>
        </div>

      </div>
    </div>
  `}function T(t,x=document.body){if(!t)return;const p=t.evolution||{},$=P(t),r=document.createElement("div");r.id="cathy-morph-theater-wrapper",r.innerHTML=$,x.appendChild(r);const h=r.querySelector("#morph-theater-modal"),w=r.querySelector("#btn-close-morph-theater"),o=r.querySelector("#morph-range-slider"),a=r.querySelector("#morph-progress-label"),l=r.querySelector("#morph-stage-desc"),k=r.querySelector("#btn-auto-play-morph"),S=r.querySelectorAll(".morph-step-pill"),n=r.querySelector("#morph-layer-nature"),i=r.querySelector("#morph-layer-oracle"),c=r.querySelector("#morph-layer-seal"),d=r.querySelector("#morph-layer-modern"),u=r.querySelector("#morph-sparkle-layer"),y=e=>{S.forEach((b,v)=>{v===e?b.className="morph-step-pill px-3 py-1 rounded-full text-xs font-black border transition-all bg-amber-500 text-white border-white shadow-md cursor-pointer":b.className="morph-step-pill px-3 py-1 rounded-full text-xs font-black border transition-all bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 cursor-pointer"})},m=e=>{e=parseInt(e,10),e<25?(n&&(n.style.opacity=1),i&&(i.style.opacity=0),c&&(c.style.opacity=0),d&&(d.style.opacity=0),a&&(a.textContent="当前阶段: 远古自然形貌"),l&&(l.textContent=p.oracleDesc||"观察自然万物的原本样貌，勾勒最初图形。"),y(0)):e<50?(n&&(n.style.opacity=0),i&&(i.style.opacity=1),c&&(c.style.opacity=0),d&&(d.style.opacity=0),a&&(a.textContent="当前阶段: 殷商象形甲骨"),l&&(l.textContent=p.oracleDesc||"刻画在龟甲兽骨上的象形线条。"),y(1)):e<75?(n&&(n.style.opacity=0),i&&(i.style.opacity=0),c&&(c.style.opacity=1),d&&(d.style.opacity=0),a&&(a.textContent="当前阶段: 秦汉金文小篆"),l&&(l.textContent=p.bronzeDesc||p.sealDesc||"铸刻在青铜器与竹简上的圆润小篆。"),y(2)):(n&&(n.style.opacity=0),i&&(i.style.opacity=0),c&&(c.style.opacity=0),d&&(d.style.opacity=1),a&&(a.textContent="当前阶段: 现代规范楷书"),l&&(l.textContent=p.modernDesc||"笔画横平竖直、端正规范的现代楷书。"),y(3))};S.forEach(e=>{e.addEventListener("click",()=>{s.playPop();const b=parseInt(e.dataset.val,10);o&&(o.value=b),m(b)})}),o&&o.addEventListener("input",e=>{m(e.target.value)});let f=[];const j=()=>{f.forEach(e=>clearTimeout(e)),f=[]},q=()=>{j();try{s.stopSpeaking()}catch(e){}s.playPop(),r.remove()};w&&w.addEventListener("click",q),h&&h.addEventListener("click",e=>{e.target===h&&q()}),k&&k.addEventListener("click",()=>{j(),s.playPop(),o&&(o.value=0),m(0),s.speakPriority("第一幕：远古时期，人们画出了万物的形貌。",{kind:"sentence",priority:1});const e=setTimeout(()=>{o&&(o.value=33),m(33),s.playPop(),s.speakPriority("第二幕：线条化成了殷商甲骨文。",{kind:"sentence",priority:1})},1500);f.push(e);const b=setTimeout(()=>{o&&(o.value=66),m(66),s.playPop(),s.speakPriority("第三幕：演化为规整的金文与小篆。",{kind:"sentence",priority:1})},3e3);f.push(b);const v=setTimeout(()=>{if(o&&(o.value=100),m(100),s.playSuccessSound(),s.triggerConfetti(r),u){u.style.opacity=1;const C=setTimeout(()=>{u&&(u.style.opacity=0)},800);f.push(C)}s.speakPriority(`第四幕：看！这就是我们今天写的“${t.char}”字！`,{kind:"char",priority:1})},4500);f.push(v)})}export{T as o};
