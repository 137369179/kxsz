import{G as r,a as c,e as h,B as M,i as T,C as _,E as w}from"./index-CObQJZ8f.js";import{p as P}from"./worksheetGenerator-1DHxgeAp.js";const R=3,$={audio_choice:{iconSvg:o=>r.speaker(o),name:"听音辨字",tip:"听准发音，找出对应的神奇汉字"},image_choice:{iconSvg:o=>r.cards(o),name:"看图识字",tip:"观察卡片图景，选出匹配的字"},similar_pick:{iconSvg:o=>r.gem(o),name:"火眼金睛",tip:"形近字大挑战，找出正确的汉字"},word_fill:{iconSvg:o=>r.brush(o),name:"词语填空",tip:"帮词语找回丢失的核心汉字"},sentence_fill:{iconSvg:o=>r.scroll(o),name:"趣味造句",tip:"把汉字宝宝送回句子中"},balloon_pop:{iconSvg:o=>r.monster(o),name:"戳破气球",tip:"瞄准目标字气球，快速戳破"},cloze_hint:{iconSvg:o=>r.scroll(o),name:"句子填空",tip:"提示拼音，填入正确汉字"},pinyin_spell:{iconSvg:o=>r.mic(o),name:"拼读练习",tip:"听拼音，选声母韵母组合"},stroke_trace:{iconSvg:o=>r.pen(o),name:"笔画描红",tip:"跟着虚线，描出汉字笔画"},audio_to_text:{iconSvg:o=>r.mic(o),name:"听音写字",tip:"听准发音，找出对应的汉字"},meaning_pick:{iconSvg:o=>r.book(o),name:"字义选字",tip:"根据字义描述，找出对应的汉字"}};function y(o){const e=o.slice();for(let t=e.length-1;t>0;t--){const i=Math.floor(Math.random()*(t+1));[e[t],e[i]]=[e[i],e[t]]}return e}const A=["b","p","m","f","d","t","n","l","g","k","h","j","q","x","zh","ch","sh","r","z","c","s","y","w"],B=[...A].sort((o,e)=>e.length-o.length);function S(o){if(!o)return"";for(const e of B)if(o.startsWith(e))return e;return""}function H(o){if(!o)return"";const e=S(o);return e?o.slice(e.length):o}function D(o,e){return S(o)===e}function O(o,e,t){const i=S(o),n=H(o);return e!==i?!1:n===t}class z{constructor(e,t,i,n={}){this.mount=e,this.char=t,this.onComplete=i,this.allChars=n.allChars||[],this.difficultyLevel=n.difficultyLevel||"medium",this.roundIndex=0,this.combo=0,this.bestCombo=0,this.correctCount=0,this.hitsInBalloonRound=0,this.finished=!1,this._timeouts=[],this.typePool=this.buildTypePool(),this.queue=y(this.typePool).slice(0,R),this.render()}_timeout(e,t){const i=setTimeout(()=>{const n=this._timeouts.indexOf(i);n!==-1&&this._timeouts.splice(n,1),e()},t);return this._timeouts.push(i),i}destroy(){this._timeouts.forEach(e=>clearTimeout(e)),this._timeouts=[]}buildTypePool(){const e=this.char,t=["audio_choice","similar_pick","balloon_pop"];return(e.words||[]).some(i=>i.word.includes(e.char))&&t.push("word_fill"),(e.sentence||"").includes(e.char)&&t.push("sentence_fill"),(e.sentence||"").includes(e.char)&&t.push("cloze_hint"),e.pinyin&&e.pinyin.length>1&&t.push("pinyin_spell"),e.char&&e.char.length===1&&t.push("stroke_trace"),e.pinyin&&t.push("audio_to_text"),e.meanings&&e.meanings.primary&&t.push("meaning_pick"),this._applyDifficultyWeights(t)}_difficultyOf(e){const t=new Set(["audio_choice","similar_pick","balloon_pop","stroke_trace","audio_to_text"]),i=new Set(["pinyin_spell","word_fill","sentence_fill","cloze_hint","meaning_pick"]);return t.has(e)?"easy":i.has(e)?"hard":"medium"}_applyDifficultyWeights(e){const t=this.difficultyLevel,i={easy:{easy:2,medium:1,hard:1},medium:{easy:1,medium:1,hard:1},hard:{easy:1,medium:1,hard:2}},n=i[t]||i.medium,d=[];for(const s of e){const a=this._difficultyOf(s),p=n[a]||1;for(let l=0;l<p;l++)d.push(s)}return d}buildOptions(e=!1){const t=this.char;let i=(t.confusingChars||[]).filter(n=>n!==t.char);if(e?i=i.slice(0,3):i=y(i).slice(0,3),i.length<3&&this.allChars.length){const n=y(this.allChars.filter(d=>d.char!==t.char));for(const d of n){if(i.length>=3)break;i.includes(d.char)||i.push(d.char)}}return y([t.char,...i.slice(0,3)])}destroy(){this.finished=!0}render(){if(this.finished)return;if(this.roundIndex>=this.queue.length)return this.renderSummary();const e=this.queue[this.roundIndex],t=$[e],i=this.buildPrompt(e);this.mount.innerHTML=`
      <div class="relative w-full max-w-4xl h-[480px] bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col justify-between p-6 animate-fade-in select-none">

        <div class="w-full flex items-center justify-between bg-black/60 px-6 py-2.5 rounded-full border border-white/30 text-white">
          <div class="flex items-center gap-2 text-xs font-black text-yellow-300">
            <span class="flex items-center">${t.iconSvg("w-4 h-4")}</span>
            <span>${t.name}</span>
            <span class="bg-white/15 px-2 py-0.5 rounded-full"> ${this.roundIndex+1} / ${this.queue.length} </span>
          </div>
          <div id="combo-badge-anchor" class="h-6 flex items-center justify-center font-black text-sm text-yellow-300"></div>
          <div class="text-xs font-black text-cyan-300 flex items-center gap-1">
            <span>正确</span>
            <span id="drill-correct" class="text-yellow-400 text-base font-black">${this.correctCount}</span> / ${this.queue.length}
          </div>
        </div>

        <div class="w-full flex-1 flex flex-col items-center justify-center gap-5 my-3">
          ${i}
        </div>

        <div id="drill-options" class="w-full flex items-center justify-center gap-5 flex-wrap">
          ${this.buildOptionsFor(e)}
        </div>

      </div>
    `,this.bindRound(e),this.announce(e)}buildPrompt(e){var n,d;const t=this.char,i=$[e];if(e==="audio_choice")return`
        <button id="btn-replay-audio" class="group w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 border-4 border-white shadow-[0_0_45px_rgba(6,182,212,0.8)] flex items-center justify-center active:scale-90 transition-transform animate-bounce-slow" title="">
          ${r.speaker("w-14 h-14")}
        </button>
        <p class="text-white font-black text-sm">${i.tip}</p>
        <p class="text-[11px] text-cyan-200/80"></p>
      `;if(e==="image_choice"){const s=t.oracleGlyph||t.char;return`
        <div class="relative w-36 h-36 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100 border-4 border-amber-400 shadow-2xl flex flex-col items-center justify-center gap-1">
          ${t.radical?`<span class="absolute top-1 right-1 text-[9px] font-black text-amber-600 bg-amber-100 px-1 rounded">${t.radical}</span>`:""}
          <span class="text-5xl font-black text-amber-900 drop-shadow">${s}</span>
          <span class="text-[10px] text-amber-700 font-bold">${t.pinyin}</span>
        </div>
        <p class="text-white font-black text-sm">${i.tip}</p>
      `}if(e==="similar_pick")return`
        <div class="bg-black/50 border border-white/25 rounded-2xl px-8 py-3 flex flex-col items-center gap-1">
          <span class="text-[11px] text-white/60 font-bold">拼音</span>
          <span class="text-4xl font-black text-yellow-300">${t.pinyin}</span>
        </div>
        <p class="text-white font-black text-sm">${i.tip}</p>
      `;if(e==="word_fill"){const s=(t.words||[]).find(p=>p.word.includes(t.char))||{word:t.char,pinyin:t.pinyin},a=s.word.split(t.char).join(" ( ? ) ");return`
        <div class="flex flex-col items-center gap-2">
          <span class="text-[11px] text-cyan-200 font-bold">${s.pinyin}</span>
          <div class="text-5xl font-black text-white tracking-widest bg-black/40 px-8 py-4 rounded-3xl border-2 border-amber-300">${a}</div>
        </div>
        <p class="text-white font-black text-sm mt-1">${i.tip}</p>
      `}if(e==="sentence_fill")return`
        <div class="max-w-2xl text-xl font-black text-white leading-relaxed tracking-wider bg-black/40 px-8 py-5 rounded-3xl border-2 border-amber-300 text-center">
          ${(t.sentence||"").split(t.char).join(" ? ")}
        </div>
        <p class="text-white font-black text-sm mt-1">${i.tip}</p>
      `;if(e==="cloze_hint"){const s=t.pinyin||"",l=(t.sentence||"").split(t.char).join('<span class="inline-block w-12 h-12 bg-yellow-400/80 rounded-lg border-b-4 border-yellow-600 text-center text-4xl font-black text-yellow-900 animate-pulse align-middle">?</span>');return`
        <div class="flex flex-col items-center gap-4">
          <div class="bg-purple-900/60 text-purple-200 text-sm font-bold px-6 py-2 rounded-full border border-purple-400/40 flex items-center gap-2">
            <span>提示拼音：</span><span class="text-2xl font-black text-purple-100">${s}</span>
          </div>
          <div class="max-w-2xl text-2xl font-black text-white leading-loose tracking-wide bg-black/40 px-8 py-5 rounded-3xl border-2 border-purple-400/60 text-center">
            ${l}
          </div>
        </div>
        <p class="text-white font-black text-sm mt-1">${i.tip}</p>
      `}if(e==="pinyin_spell"){const s=t.pinyin||"yi",a=["b","p","m","f","d","t","n","l","g","k","h","j","q","x","zh","ch","sh","r","z","c","s","y","w"],p=["a","o","e","i","u","ai","ei","ui","ao","ou","iu","ie","ve","er","an","en","in","un","ang","eng","ing","ong"],l=a.find(f=>s.startsWith(f))||"",b=p.find(f=>s.startsWith(l?s.slice(l.length):s))||s,v=a.filter(f=>f!==l).slice(0,3),g=p.filter(f=>f!==b).slice(0,3),m=y([l,...v]),k=y([b,...g]);return`
        <div class="flex flex-col items-center gap-6">
          <button id="btn-replay-pinyin" class="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-400 to-pink-600 border-4 border-white shadow-[0_0_35px_rgba(168,85,247,0.7)] flex items-center justify-center active:scale-90 transition-transform" title="听发音">
            ${r.speaker("w-12 h-12")}
          </button>
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <span class="text-purple-200 font-black text-sm">声母：</span>
              ${m.map(f=>`<button class="drill-opt px-5 py-2 bg-gradient-to-b from-purple-200 to-purple-400 text-purple-900 font-black text-xl rounded-xl border-b-4 border-purple-600 shadow cursor-pointer active:translate-y-1 transition-all" data-initial="${f}">${f}</button>`).join("")}
            </div>
            <div class="flex items-center gap-3">
              <span class="text-pink-200 font-black text-sm">韵母：</span>
              ${k.map(f=>`<button class="drill-opt px-5 py-2 bg-gradient-to-b from-pink-200 to-pink-400 text-pink-900 font-black text-xl rounded-xl border-b-4 border-pink-600 shadow cursor-pointer active:translate-y-1 transition-all" data-final="${f}">${f}</button>`).join("")}
            </div>
          </div>
        </div>
        <p class="text-white font-black text-sm mt-1">${i.tip}</p>
      `}if(e==="stroke_trace")return`
        <div class="flex flex-col items-center gap-3">
          <canvas id="stroke-trace-canvas" width="280" height="280" class="bg-white rounded-2xl border-4 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] cursor-crosshair touch-none"></canvas>
          <p class="text-emerald-200 font-black text-xs">提示：沿着虚线描出"${t.char}"字，至少画一笔</p>
          <button id="stroke-trace-submit" class="px-8 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-black text-lg rounded-2xl border-b-4 border-emerald-700 shadow-lg active:translate-y-1 cursor-pointer">提交描红</button>
        </div>
        <p class="text-white font-black text-sm mt-1">${i.tip}</p>
      `;if(e==="audio_to_text")return`
        <div class="flex flex-col items-center gap-3">
          <button id="btn-replay-audio" class="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 border-4 border-white shadow-[0_0_35px_rgba(6,182,212,0.8)] flex items-center justify-center active:scale-90 transition-transform animate-bounce-slow cursor-pointer" title="点击播放发音">
            ${r.speaker("w-12 h-12")}
          </button>
          <div class="text-xs text-cyan-200 font-bold bg-black/40 px-4 py-1.5 rounded-full border border-cyan-400/30">听发音，找出对应的汉字</div>
        </div>
      `;if(e==="meaning_pick"){const s=((n=t.meanings)==null?void 0:n.primary)||"字义解析",a=(d=t.meanings)!=null&&d.radicalHint?`（提示：${t.meanings.radicalHint}）`:"";return`
        <div class="flex flex-col items-center gap-3 text-center px-4">
          <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 border-2 border-white shadow-lg flex items-center justify-center text-white">
            ${r.book("w-8 h-8")}
          </div>
          <div class="text-xs font-black text-amber-300">根据字义找汉字</div>
          <h3 class="text-xl sm:text-2xl font-black text-white bg-black/40 px-6 py-3 rounded-2xl border border-amber-300/40">
            “${s}”
          </h3>
          ${a?`<p class="text-xs text-amber-200/90 font-medium">${a}</p>`:""}
        </div>
      `}return`
      <div class="flex flex-col items-center gap-2">
        <div class="bg-black/60 text-yellow-300 font-black text-base px-6 py-2 rounded-full border border-amber-300 shadow-md flex items-center gap-2">
          <span>目标汉字：</span>
          <span class="text-3xl text-orange-400 font-serif leading-none">${t.char}</span>
        </div>
        <p class="text-white font-black text-sm">${i.tip}</p>
        <p class="text-xs text-cyan-200">还需击中：<b id="balloon-left" class="text-yellow-300 text-base font-black">3</b> 次</p>
      </div>
    `}buildOptionsFor(e){const t=this.buildOptions(e==="similar_pick");return e==="balloon_pop"?t.map((i,n)=>`
        <button class="drill-opt balloon-target-btn relative w-28 h-36 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200 border-4 border-white shadow-[0_0_30px_rgba(255,160,0,0.6)] flex flex-col items-center justify-center active:scale-75 transition-all duration-300 animate-bounce-slow cursor-pointer"
                style="animation-delay:${n*.28}s" data-char="${i}">
          <span class="text-5xl font-black text-amber-950 drop-shadow">${i}</span>
        </button>
      `).join(""):e==="cloze_hint"?t.map(i=>`
        <button class="drill-opt relative bg-gradient-to-b from-yellow-100 to-yellow-300 text-yellow-900 font-black text-4xl w-24 h-24 rounded-2xl border-b-6 border-yellow-600 shadow-[0_8px_16px_rgba(0,0,0,0.3)] hover:from-yellow-200 hover:to-yellow-400 active:border-b-0 active:translate-y-2 transition-all cursor-pointer" data-char="${i}">
          ${i}
        </button>
      `).join(""):e==="pinyin_spell"||e==="stroke_trace"?"":t.map(i=>`
      <button class="drill-opt relative group bg-gradient-to-b from-amber-200 to-amber-400 text-amber-950 font-black text-5xl w-28 h-28 rounded-[30px] border-b-[8px] border-amber-600 shadow-[0_10px_20px_rgba(0,0,0,0.4)] hover:from-orange-300 hover:to-orange-500 hover:border-orange-700 active:border-b-0 active:translate-y-[8px] transition-all flex items-center justify-center overflow-hidden cursor-pointer" data-char="${i}">
        <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="absolute top-2 left-2 w-10 h-3 bg-white/50 rounded-full rotate-45 blur-[1px]"></div>
        <span class="relative z-10 drop-shadow-sm">${i}</span>
      </button>
    `).join("")}announce(e){const t=this.char,n={audio_choice:"请仔细听发音，选出对应的汉字！",image_choice:"请观察卡片图景，选出汉字！",similar_pick:`拼音读作"${t.pinyin}"，请找出正确的汉字！`,word_fill:"词语填空大挑战，请选出丢失的汉字！",sentence_fill:"趣味造句，请为句子送回正确的汉字！",balloon_pop:"戳破气球！连续击中3次目标字气球！",cloze_hint:`句子填空！提示拼音是"${t.pinyin}"，请选出正确的汉字！`,pinyin_spell:"拼音拼读！仔细听发音，选出声母和韵母！",stroke_trace:`笔画描红！请在画布上描出汉字"${t.char}"！`,meaning_pick:"字义选字！根据字义描述，请选出对应的汉字！"}[e]||`请找出汉字"${t.char}"！`;c.speakPriority(n,{kind:"sentence",emotion:"gentle"})}bindRound(e){if(e==="pinyin_spell")return this.bindPinyinSpellRound();if(e==="stroke_trace")return this.bindStrokeTraceRound();const t=e==="balloon_pop",i=3;let n=!1;const d=this.mount.querySelector("#btn-replay-audio");d&&d.addEventListener("click",()=>{c.playPop(),c.speakPriority(this.char.char,{kind:"char",priority:1})}),this.mount.querySelectorAll(".drill-opt").forEach(s=>{s.addEventListener("click",()=>{if(n)return;if(!(s.dataset.char===this.char.char)){c.playSoftError(),h.markDifficult(this.char.id),this.afterQuestionAnswer(this.char,e,0,!1),this.combo=0,s.classList.add("animate-shake"),this._timeout(()=>s.classList.remove("animate-shake"),420);return}if(c.playAttackHit(),this.afterQuestionAnswer(this.char,e,3,!0),t){s.style.pointerEvents="none",this.hitsInBalloonRound++;const l=Math.max(0,i-this.hitsInBalloonRound),b=this.mount.querySelector("#balloon-left");if(b&&(b.textContent=l),s.classList.add("scale-125","opacity-0"),this._timeout(()=>{s.classList.remove("opacity-0","scale-125"),n||(s.style.pointerEvents="auto")},600),this.hitsInBalloonRound<i)return;n=!0,this.mount.querySelectorAll(".drill-opt").forEach(v=>{v.style.pointerEvents="none"}),this.hitsInBalloonRound=0}else n=!0,this.mount.querySelectorAll(".drill-opt").forEach(l=>{l.style.pointerEvents="none"}),s.classList.add("ring-4","ring-emerald-400","bg-emerald-100");this.registerCorrect()})})}bindPinyinSpellRound(){const e=this.char;let t="initial",i=null,n=!1;this._timeout(()=>c.speakPriority(e.char,{kind:"char"}),400);const d=this.mount.querySelector("#btn-replay-pinyin");d&&d.addEventListener("click",()=>{c.speakPriority(e.char,{kind:"char",priority:1})}),this.mount.querySelectorAll(".drill-opt[data-initial]").forEach(s=>{s.addEventListener("click",()=>{if(n||t!=="initial")return;const a=s.dataset.initial;if(!D(e.pinyin,a)){c.playSoftError(),h.markDifficult(e.id),this.combo=0,s.classList.add("animate-shake","opacity-50"),this._timeout(()=>s.classList.remove("animate-shake","opacity-50"),420);return}i=a,t="chooseFinal",s.classList.add("ring-4","ring-emerald-400","bg-emerald-200"),this.mount.querySelectorAll(".drill-opt[data-initial]").forEach(l=>{l.style.pointerEvents="none"}),c.playAttackHit()})}),this.mount.querySelectorAll(".drill-opt[data-final]").forEach(s=>{s.addEventListener("click",()=>{if(n||t!=="chooseFinal")return;const a=s.dataset.final;if(!O(e.pinyin,i||"",a)){c.playSoftError(),h.markDifficult(e.id),this.combo=0,s.classList.add("animate-shake","opacity-50"),this._timeout(()=>s.classList.remove("animate-shake","opacity-50"),420);return}n=!0,s.classList.add("ring-4","ring-emerald-400","bg-emerald-200"),this.mount.querySelectorAll(".drill-opt").forEach(l=>{l.style.pointerEvents="none"}),c.playAttackHit(),this.registerCorrect()})})}bindStrokeTraceRound(){const e=this.mount.querySelector("#stroke-trace-canvas");if(!e)return;const t=e.getContext("2d"),i=e.width,n=e.height;t.clearRect(0,0,i,n),t.font="200px 'KaiTi', 'SimSun', serif",t.textAlign="center",t.textBaseline="middle",t.fillStyle="rgba(180, 180, 180, 0.25)",t.fillText(this.char.char,i/2,n/2),t.strokeStyle="rgba(99, 99, 99, 0.4)",t.lineWidth=4,t.setLineDash([8,6]),t.strokeText(this.char.char,i/2,n/2),t.setLineDash([]);let d=!1,s=0,a=0,p=0,l=0;const b=800,v=(u,x)=>{d=!0,s=u,a=x,t.beginPath(),t.moveTo(u,x)},g=(u,x)=>{d&&(t.strokeStyle="rgba(16, 185, 129, 0.9)",t.lineWidth=10,t.lineCap="round",t.lineJoin="round",t.lineTo(u,x),t.stroke(),l+=Math.hypot(u-s,x-a),s=u,a=x)},m=()=>{d&&(d=!1,p++)},k=u=>{var C,E,q,I;u.preventDefault();const x=e.getBoundingClientRect(),j=(u.clientX||((E=(C=u.touches)==null?void 0:C[0])==null?void 0:E.clientX)||0)-x.left,L=(u.clientY||((I=(q=u.touches)==null?void 0:q[0])==null?void 0:I.clientY)||0)-x.top;g(j,L)};e.addEventListener("pointerdown",u=>{u.preventDefault();const x=e.getBoundingClientRect();v(u.clientX-x.left,u.clientY-x.top)}),e.addEventListener("pointermove",k),e.addEventListener("pointerup",m),e.addEventListener("pointerleave",m);const f=this.mount.querySelector("#stroke-trace-submit");f&&f.addEventListener("click",()=>{p>=1&&l>=b?(c.playAttackHit(),this.registerCorrect(),e.style.boxShadow="0 0 40px rgba(16, 185, 129, 0.8)"):(c.playSoftError(),h.markDifficult(this.char.id),this.combo=0,t.fillStyle="rgba(239, 68, 68, 0.2)",t.fillRect(0,0,i,n),this._timeout(()=>{t.fillStyle="rgba(180, 180, 180, 0.25)",t.fillRect(0,0,i,n),t.fillText(this.char.char,i/2,n/2)},800))})}registerCorrect(){this.combo+=1,this.correctCount+=1,this.bestCombo=Math.max(this.bestCombo,this.combo),c.playCombo(this.combo);const e=this.mount.querySelector("#combo-badge-anchor");if(e){const i=["Good! ","Great! ","Perfect! "],n=this.combo>=3?i[2]:i[this.combo-1]||i[0];e.innerHTML=`<span class="animate-combo text-amber-300">${n}</span>`}const t=this.mount.querySelector("#drill-correct");t&&(t.textContent=this.correctCount),c.triggerConfetti(this.mount),this._timeout(()=>{this.roundIndex+=1,this.render()},720)}afterQuestionAnswer(e,t,i,n){var d;(d=h)!=null&&d.completeReview&&(e!=null&&e.id)&&h.completeReview(e.id,n)}validateClozeUniqueness(e,t){return!e||!t?!0:e.split(t).length===2}renderSummary(){const e=this.char,t=this.bestCombo>=this.queue.length;t&&c.playStarChime(),c.playVictoryFanfare(),c.triggerConfetti(this.mount),this.mount.innerHTML=`
      <div class="relative w-full max-w-4xl h-[480px] bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col items-center justify-center p-8 animate-fade-in text-center">

        <div class="mb-3 animate-bounce-slow flex items-center justify-center">
          ${r.trophy("w-20 h-20")}
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-yellow-300 mb-2">
          ${t?"太棒啦！三连击大满贯！":"挑战成功！顺利完成复习！"}
        </h2>
        <p class="text-xs sm:text-sm text-gray-300 mb-4 font-bold">
          你已经扎实巩固了汉字 “<b class="text-amber-300 text-lg font-serif">${e.char}</b>” 的多维认知！
        </p>

        <div class="flex items-center gap-4 mb-6">
          <div class="bg-black/50 border border-white/25 rounded-2xl px-5 py-3">
            <div class="text-[10px] text-white/60 font-bold">正确题数</div>
            <div class="text-2xl font-black text-emerald-300">${this.correctCount} / ${this.queue.length}</div>
          </div>
          <div class="bg-black/50 border border-white/25 rounded-2xl px-5 py-3">
            <div class="text-[10px] text-white/60 font-bold">最高连击</div>
            <div class="text-2xl font-black text-yellow-300">${this.bestCombo} Combo</div>
          </div>
          <div class="bg-black/50 border border-white/25 rounded-2xl px-5 py-3">
            <div class="text-[10px] text-white/60 font-bold">挑战项目</div>
            <div class="text-xs font-black text-cyan-300 mt-1">
              ${this.queue.map(n=>$[n].name).join(" · ")}
            </div>
          </div>
        </div>

        <button id="btn-goto-write-step" class="btn-game-orange text-white font-black text-base px-10 py-3.5 rounded-full shadow-2xl shimmer-badge flex items-center gap-2 cursor-pointer active:scale-95 transition-transform hover:brightness-105">
          <span class="flex items-center">${r.sparkle("w-5 h-5")}</span> 
          <span>继续下一关复习</span> 
        </button>
      </div>
    `;const i=this.mount.querySelector("#btn-goto-write-step");i&&i.addEventListener("click",()=>{c.playPop(),this.onComplete&&this.onComplete()})}}class W extends M{constructor(e){super(e),this.queue=[],this.currentIndex=0,this.correctCount=0,this.wrongCount=0,this.drillEngine=null,this.consecutiveMistakes={},this.forgottenChars=[],this.initQueue()}initQueue(){const t=T(h.getAge()).reviews,i=h.getDueReviewCharIds().slice(0,Math.max(t,3)),d=(h.progress.errorProfiles||{}).confusedPairs||{},s=Object.entries(d).sort((p,l)=>{const b=typeof p[1]=="object"?Object.values(p[1]).reduce((g,m)=>g+m,0):Number(p[1])||0;return(typeof l[1]=="object"?Object.values(l[1]).reduce((g,m)=>g+m,0):Number(l[1])||0)-b}).slice(0,Math.max(t-i.length,2)).map(([p])=>p),a=[...new Set([...i,...s])].slice(0,t);if(this.queue=a.map(p=>_.find(l=>l.id===p)).filter(Boolean),this.queue.length===0){const p=Object.keys(h.progress.charRecords||{});p.length>0?this.queue=p.slice(0,t).map(l=>_.find(b=>b.id===l)).filter(Boolean):this.queue=_.slice(0,t)}this.currentIndex=0,this.correctCount=0,this.wrongCount=0,this.consecutiveMistakes={},this.forgottenChars=[]}destroy(){var e;(e=this.drillEngine)!=null&&e.destroy&&(this.drillEngine.destroy(),this.drillEngine=null),super.destroy()}render(){if(this.destroy(),(!this.queue||this.queue.length===0||this.currentIndex>=this.queue.length)&&this.initQueue(),this.queue.length===0){this.renderEmpty();return}this.renderRound()}renderEmpty(){const e=h.progress,t=c.isMuted?r.speaker("w-5 h-5",!0):r.speaker("w-5 h-5",!1);this.container.innerHTML=`
      <div class="relative w-full h-full min-h-[640px] flex flex-col select-none overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950 text-white animate-fade-in">
        
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/20">
          <div class="flex items-center gap-2">
            <button id="btn-review-empty-header-back" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer active:scale-95">
              <span class="flex items-center">${r.home("w-4 h-4")}</span>
              <span>返回地图</span>
            </button>
            <button id="btn-review-empty-sound" class="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg cursor-pointer" title="声音开关">
              ${t}
            </button>
          </div>
          <div class="flex items-center gap-2">
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
              ${r.coin("w-4 h-4")}<span>${e.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full">
              ${r.star("w-4 h-4",!1)}<span>${e.stars}</span>
            </div>
          </div>
        </header>

        <main class="relative z-10 flex-1 flex items-center justify-center p-6">
          <div class="flex flex-col items-center text-center animate-scale-up bg-white/10 backdrop-blur-md p-8 sm:p-10 rounded-3xl border-2 border-white/20 shadow-2xl max-w-md">
            <div class="mb-4 flex items-center justify-center scale-125">${r.reviewBell("w-20 h-20")}</div>
            <h2 class="text-2xl font-black text-yellow-300 mb-2">记忆状态极佳！</h2>
            <p class="text-xs sm:text-sm text-white/80 mb-6 font-semibold leading-relaxed">
              当前没有待复习的薄弱生字，艾宾浩斯记忆库饱满，继续去大地图探索新汉字吧！
            </p>
            <button id="btn-review-empty-back" class="btn-game-orange text-white font-black text-sm sm:text-base px-10 py-3 rounded-full flex items-center gap-2 shadow-xl active:scale-95 cursor-pointer">
              <span class="flex items-center">${r.home("w-5 h-5")}</span>
              <span>返回大地图</span>
            </button>
          </div>
        </main>
      </div>
    `;const i=this.container.querySelector("#btn-review-empty-back");i&&this._on(i,"click",()=>{c.playPop(),this._busEmit(w.SWITCH_MODE,{mode:"map"})});const n=this.container.querySelector("#btn-review-empty-header-back");n&&this._on(n,"click",()=>{c.playPop(),this._busEmit(w.SWITCH_MODE,{mode:"map"})});const d=this.container.querySelector("#btn-review-empty-sound");d&&this._on(d,"click",()=>{c.toggleMute();const s=c.isMuted?r.speaker("w-5 h-5",!0):r.speaker("w-5 h-5",!1);d.innerHTML=s})}renderRound(){const e=h.progress,t=c.isMuted?r.speaker("w-5 h-5",!0):r.speaker("w-5 h-5",!1),i=this.queue[this.currentIndex],n=this.currentIndex+1;this.container.innerHTML=`
      <div class="relative w-full h-full min-h-[640px] flex flex-col select-none overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white animate-fade-in">
        
        <header class="relative z-30 w-full px-6 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/20">
          <button id="btn-review-quit" class="btn-game-wood text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer active:scale-95">
            <span class="flex items-center">${r.home("w-4 h-4")}</span>
            <span>返回地图</span>
          </button>

          <div class="candy-pill flex items-center gap-2 px-5 py-1.5 rounded-full border border-yellow-300/40">
            <span class="text-xs text-amber-200 font-bold">艾宾浩斯复习:</span>
            <span class="text-yellow-300 font-black text-sm font-mono">${n} / ${this.queue.length}</span>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-review-sound" class="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border border-white/30 shadow-lg cursor-pointer" title="声音开关">
              ${t}
            </button>
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs px-3 py-1 rounded-full">
              ${r.coin("w-4 h-4")}<span>${e.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs px-3 py-1 rounded-full">
              ${r.star("w-4 h-4",!1)}<span>${e.stars}</span>
            </div>
          </div>
        </header>

        <main id="drill-container" class="relative z-10 flex-1 w-full flex items-center justify-center p-4 sm:p-6">
        </main>
      </div>
    `;const d=this.container.querySelector("#btn-review-quit");d&&this._on(d,"click",()=>{c.playPop(),this._busEmit(w.REVIEW_FINISH,{correct:this.correctCount,total:this.queue.length}),this._busEmit(w.SWITCH_MODE,{mode:"map"})});const s=this.container.querySelector("#btn-review-sound");s&&this._on(s,"click",()=>{c.toggleMute();const p=c.isMuted?r.speaker("w-5 h-5",!0):r.speaker("w-5 h-5",!1);s.innerHTML=p});const a=this.container.querySelector("#drill-container");this.drillEngine=new z(a,i,()=>{const p=(this.drillEngine.bestCombo||0)>=2,l=i.id;p?(this.correctCount++,this.consecutiveMistakes[l]=0,h.completeReview(l,!0),h.addCoins(5)):(this.wrongCount++,this.consecutiveMistakes[l]=(this.consecutiveMistakes[l]||0)+1,h.completeReview(l,!1),h.addCoins(1),this.consecutiveMistakes[l]>=2&&!this.forgottenChars.includes(l)&&(this.forgottenChars.push(l),this.queue.slice(this.currentIndex+1).some(b=>b.id===l)||this.queue.push(i),c.speakPriority("这个字小有困难，再练一次吧",{kind:"tutorial",priority:1}),this._showForgottenAlert(i))),this.currentIndex++,this.currentIndex<this.queue.length?this.renderRound():this.renderSummary()})}_showForgottenAlert(e){const t=document.createElement("div");t.id="forgotten-alert-banner",t.style.cssText=["position:fixed","top:80px","left:50%","transform:translateX(-50%)","z-index:9999","background:linear-gradient(135deg,#dc2626,#b91c1c)","color:#fff","padding:12px 28px","border-radius:999px","font-weight:900","font-size:15px","box-shadow:0 8px 32px rgba(220,38,38,0.4)","display:flex","align-items:center","gap:10px","letter-spacing:0.03em","pointer-events:none","animation:slideDown 0.3s ease"].join(";"),t.innerHTML=[r.star("w-5 h-5",!1),`<span>「${e.char}」需要加强巳固！已加入本轮末尾重练</span>`].join(""),document.body.appendChild(t),setTimeout(()=>{t.remove()},3200)}renderSummary(){h.progress,c.isMuted?r.speaker("w-5 h-5",!0):r.speaker("w-5 h-5",!1);const e=this.queue.length,t=this.wrongCount===0,i=new Set(this.forgottenChars);t?(c.playCrownFanfare(),c.triggerConfetti(this.container)):c.playParentCheer();const n=this.correctCount*5+10;h.addCoins(n),this.container.innerHTML=`
      <div class="relative w-full h-full min-h-[640px] flex items-center justify-center bg-gradient-to-b from-purple-950 via-indigo-950 to-purple-900 select-none p-4 animate-fade-in text-white">
        <div class="flex flex-col items-center text-center bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/20 p-8 sm:p-10 max-w-lg shadow-2xl animate-scale-up">
          
          <div class="mb-3 flex items-center justify-center">
            ${t?r.trophy("w-20 h-20 sm:w-24 sm:h-24"):r.star("w-20 h-20 sm:w-24 sm:h-24",!1)}
          </div>
          
          <h2 class="text-2xl sm:text-3xl font-black text-yellow-300 mb-2">
            ${t?"满分通关！记忆大师！":"复习完成 · 牢固掌握！"}
          </h2>
          
          <p class="text-xs sm:text-sm text-white/80 mb-5 font-semibold">
            本次共强化复习 <b>${e}</b> 个汉字 · 掌握 <b>${this.correctCount}</b> 字 · 需再练 <b>${this.wrongCount}</b> 字
          </p>

          <div class="flex items-center gap-2 mb-4 flex-wrap justify-center">
            ${this.queue.map(a=>`
              <div class="reviewed-char-chip w-12 h-12 rounded-2xl
                ${i.has(a.id)?"bg-red-500/30 border-2 border-red-400":"bg-white/20 border-2 border-yellow-300/50"}
                hover:bg-white/30 flex flex-col items-center justify-center cursor-pointer active:scale-90 transition-transform font-serif shadow" data-char="${a.char}">
                <span class="text-xl font-black text-white leading-none">${a.char}</span>
                <span class="text-[9px] ${i.has(a.id)?"text-red-300":"text-yellow-300"} font-sans mt-0.5">
                  ${i.has(a.id)?"加强":a.pinyin}
                </span>
              </div>
            `).join("")}
          </div>

          ${this.forgottenChars.length>0?`
          <div class="w-full bg-red-900/30 border border-red-500/40 rounded-2xl px-4 py-2.5 mb-4 text-xs text-red-300 font-bold flex items-center gap-2">
            ${r.star("w-4 h-4",!1)}
            <span>需加强：${this.forgottenChars.map(a=>{const p=this.queue.find(l=>l.id===a);return p?p.char:a}).join("、")}（明日优先安排复习）</span>
          </div>`:""}

          <div class="candy-pill rounded-2xl px-6 py-2.5 mb-6 text-sm text-yellow-300 font-black flex items-center gap-2 border border-yellow-300/40">
            ${r.coin("w-5 h-5")}
            <span>奖励 +${n} 凯茜星币</span>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <button id="btn-review-print" class="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-full flex items-center gap-2 shadow-xl active:scale-95 cursor-pointer">
              <span class="flex items-center">${r.print("w-4 h-4")}</span>
              <span>打印复习字帖</span>
            </button>
            <button id="btn-review-done" class="btn-game-orange text-white font-black text-xs sm:text-sm px-8 py-3.5 rounded-full flex items-center gap-2 shadow-2xl active:scale-95 cursor-pointer">
              <span class="flex items-center">${r.home("w-4 h-4")}</span>
              <span>领取奖励 · 返回大地图</span>
            </button>
          </div>
        </div>
      </div>
    `,this.container.querySelectorAll(".reviewed-char-chip").forEach(a=>{this._on(a,"click",()=>{c.playPop(),c.speakPriority(a.dataset.char,{kind:"char",priority:1})})});const d=this.container.querySelector("#btn-review-print");d&&this._on(d,"click",()=>{c.playPop(),P(this.queue,"凯茜识字 · 每日复习巩固描红字帖")});const s=this.container.querySelector("#btn-review-done");s&&this._on(s,"click",()=>{c.playPop();const a={correct:this.correctCount,total:this.queue.length};this.initQueue(),this._busEmit(w.REVIEW_FINISH,a),this._busEmit(w.SWITCH_MODE,{mode:"map"})})}}export{W as ReviewModule};
