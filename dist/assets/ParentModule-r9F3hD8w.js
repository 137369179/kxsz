import{C as B,S as Y,B as Z,G as x,a as g,e as A,m as ee,r as te,b as C,s as U}from"./index-CObQJZ8f.js";import{g as W,a as z,p as re}from"./worksheetGenerator-1DHxgeAp.js";const N=new Uint8Array(512),F=new Uint8Array(256);(function(){let e=1;for(let r=0;r<255;r++)N[r]=e,F[e]=r,e<<=1,e&256&&(e^=285);for(let r=255;r<512;r++)N[r]=N[r-255]})();function O(c,e){return c===0||e===0?0:N[F[c]+F[e]]}function se(c){let e=[1];for(let r=0;r<c;r++){const a=[1,N[r]],o=new Uint8Array(e.length+1);for(let i=0;i<e.length;i++)o[i]^=O(e[i],a[0]),o[i+1]^=O(e[i],a[1]);e=Array.from(o)}return e}function ae(c,e){const r=se(e),a=new Uint8Array(c.length+e);a.set(c);for(let o=0;o<c.length;o++){const i=a[o];if(i!==0)for(let n=0;n<r.length;n++)a[o+n]^=O(r[n],i)}return a.slice(c.length)}const H=[0,19,34,55,80,108,136,156,194,232,274],V=[0,7,10,15,20,26,36,40,48,60,72];function ne(c){for(let e=1;e<H.length;e++)if(c+3<=H[e])return e;return 10}function oe(c,e,r={}){if(!c)return;const a=c.getContext("2d"),o=r.size||c.width||240,i=r.margin||4,n=r.darkColor||"#1e1b4b",s=r.lightColor||"#ffffff",f=new TextEncoder().encode(e),p=r.version||ne(f.length),u=p*4+17,q=Array.from({length:u},()=>new Int8Array(u).fill(-1)),k=Array.from({length:u},()=>new Uint8Array(u));function l(d,b,m,S=!1){d>=0&&d<u&&b>=0&&b<u&&(q[d][b]=m?1:0,S&&(k[d][b]=1))}function h(d,b){for(let m=0;m<7;m++)for(let S=0;S<7;S++){const j=m===0||m===6||S===0||S===6,L=m>=2&&m<=4&&S>=2&&S<=4;l(d+m,b+S,j||L,!0)}for(let m=-1;m<=7;m++)l(d-1,b+m,0,!0),l(d+7,b+m,0,!0),l(d+m,b-1,0,!0),l(d+m,b+7,0,!0)}h(0,0),h(0,u-7),h(u-7,0);for(let d=8;d<u-8;d++){const b=d%2===0?1:0;k[6][d]||l(6,d,b,!0),k[d][6]||l(d,6,b,!0)}if(p>=2){const d=[6,u-7],b=d[1],m=d[1];for(let S=-2;S<=2;S++)for(let j=-2;j<=2;j++){const L=Math.abs(S)===2||Math.abs(j)===2,J=S===0&&j===0;l(b+S,m+j,L||J,!0)}}const v=[];function w(d,b){for(let m=b-1;m>=0;m--)v.push(d>>m&1)}w(4,4),w(f.length,8);for(const d of f)w(d,8);const y=(H[p]-V[p])*8;for(;v.length<y&&v.length%8!==0;)v.push(0);const $=[236,17];let _=0;for(;v.length<y;)w($[_%2],8),_++;const T=new Uint8Array(y/8);for(let d=0;d<T.length;d++){let b=0;for(let m=0;m<8;m++)b=b<<1|v[d*8+m];T[d]=b}const M=V[p],R=ae(T,M),P=[];for(const d of T)for(let b=7;b>=0;b--)P.push(d>>b&1);for(const d of R)for(let b=7;b>=0;b--)P.push(d>>b&1);let D=0,G=-1,I=u-1;for(let d=u-1;d>0;d-=2){d===6&&(d-=1);for(let b=0;b<u;b++){for(let m=0;m<2;m++){const S=d-m;if(!k[I][S]){const j=D<P.length?P[D++]:0,L=(I+S)%2===0?1:0;l(I,S,j^L)}}I+=G}G=-G,I+=G}const K=30660;for(let d=0;d<15;d++){const b=K>>14-d&1;d<6?l(8,d,b,!0):d<8?l(8,d+1,b,!0):l(d===8?7:14-d,8,b,!0),d<8?l(u-1-d,8,b,!0):l(8,u-15+d,b,!0)}l(u-8,8,1,!0),c.width=o,c.height=o;const E=o/(u+i*2);a.fillStyle=s,a.fillRect(0,0,o,o),a.fillStyle=n;for(let d=0;d<u;d++)for(let b=0;b<u;b++)q[d][b]===1&&a.fillRect(Math.round((b+i)*E),Math.round((d+i)*E),Math.ceil(E),Math.ceil(E))}const Q=80,le=40,X=30;function ie(c){const e=B.length,r=Object.keys(c||{}).length;return{total:e,learned:r,coverageRate:e>0?Math.round(r/e*1e3)/10:0,remaining:e-r}}function de(c){var t,f,p,u,q;const e=Object.values(c||{}),r=Date.now();let a=0,o=0,i=0,n=0;const s=[];for(const k of e){const l=(t=k.masteryRate)!=null?t:0,h=(p=(f=k.nextReviewDate)!=null?f:k.learnedAt)!=null?p:r,v=(r-h)/864e5;l>=Q&&v<X?a++:l>=le?o++:l>0?(i++,s.push({charId:k.charId,masteryRate:l,reviewCount:(u=k.reviewCount)!=null?u:0,correctStreak:(q=k.correctStreak)!=null?q:0})):n++,v>=X&&l>=Q&&n++}return s.sort((k,l)=>k.masteryRate-l.masteryRate),{mastered:a,learning:o,difficult:i,forgotten:n,total:e.length,difficultList:s.slice(0,10),healthScore:ce(a,o,i,n)}}function ce(c,e,r,a){const o=c+e+r+a;if(o===0)return 0;const i=(c*1+e*.7+r*.3+a*0)/o*100;return Math.round(i)}function be(c,e=[]){var n;const r=new Date,a=[];for(let s=6;s>=0;s--){const t=new Date(r);t.setDate(t.getDate()-s);const f=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`,p=e.find(l=>l.date===f||l.date===`${t.getMonth()+1}/${t.getDate()}`),u=(n=p==null?void 0:p.count)!=null?n:0,k=Object.values(c||{}).filter(l=>{var w;const h=(w=l.nextReviewDate)!=null?w:0;if(!h)return!1;const v=new Date(h);return v.getFullYear()===t.getFullYear()&&v.getMonth()===t.getMonth()&&v.getDate()===t.getDate()}).length;a.push({date:`${t.getMonth()+1}/${t.getDate()}`,weekday:["日","一","二","三","四","五","六"][t.getDay()],newCount:u,reviewCount:k,total:u+k})}const o=a.reduce((s,t)=>s+t.newCount,0),i=a.reduce((s,t)=>s+t.reviewCount,0);return{days:a,totalNew:o,totalReview:i,avgPerDay:Math.round((o+i)/7*10)/10}}function pe(c=[]){const e=Y.length,r=c.length,a=[1,2,3].map(o=>{const i=Y.filter(s=>(s.stage||1)===o),n=i.filter(s=>c.includes(s.id)).length;return{stage:o,total:i.length,read:n}});return{total:e,readCount:r,coverageRate:e>0?Math.round(r/e*100):0,byStage:a}}function xe(c){const e=Object.values(c||{});if(e.length===0)return{avgStreak:0,highStreak:0,avgReviewCount:0,interruptionRate:0};const r=e.map(f=>{var p;return(p=f.correctStreak)!=null?p:0}),a=e.map(f=>{var p;return(p=f.reviewCount)!=null?p:0}),o=Math.round(r.reduce((f,p)=>f+p,0)/r.length*10)/10,i=Math.max(...r,0),n=Math.round(a.reduce((f,p)=>f+p,0)/a.length*10)/10,s=r.filter(f=>f<=1).length,t=Math.round(s/r.length*100);return{avgStreak:o,highStreak:i,avgReviewCount:n,interruptionRate:t}}function fe(c){const e=(c==null?void 0:c.charRecords)||{},r=(c==null?void 0:c.studyHistory)||[],a=(c==null?void 0:c.readBooks)||[],o=ie(e),i=de(e),n=be(e,r),s=pe(a),t=xe(e);return{generatedAt:Date.now(),coverage:o,mastery:i,trend:n,books:s,focus:t,summary:ue({coverage:o,mastery:i,trend:n,books:s,focus:t})}}function ue({coverage:c,mastery:e,trend:r,books:a,focus:o}){const i=[];c.learned===0?i.push("🌟 刚启动识字之旅，先认识 3 个字就很棒啦！"):c.coverageRate<10?i.push(`🌟 已经认识 ${c.learned} 字，起步不错！`):c.coverageRate<30?i.push(`🌟 覆盖率 ${c.coverageRate}%，正在稳步推进！`):i.push(`🌟 覆盖率已达 ${c.coverageRate}%，表现优秀！`),e.healthScore>=80?i.push(`💪 掌握健康度 ${e.healthScore} 分，字记得牢！`):e.healthScore>=50?i.push(`📊 健康度 ${e.healthScore} 分，继续加油巩固！`):e.total>0&&i.push(`⚠️ 健康度 ${e.healthScore} 分，有 ${e.difficult} 个难字需要多复习。`),o.avgStreak>=3?i.push(`🎯 平均连对 ${o.avgStreak} 次，专注力很强！`):o.avgStreak>=1.5?i.push(`🎯 平均连对 ${o.avgStreak} 次，渐入佳境。`):o.avgStreak>0&&i.push("🎯 连续答对机会不多，可以试试专注力模式。"),(r.totalNew>0||r.totalReview>0)&&i.push(`📅 本周新学 ${r.totalNew} 字、复习 ${r.totalReview} 字，日均 ${r.avgPerDay} 次。`),a.readCount>0&&i.push(`📚 已读 ${a.readCount} 本绘本！`);const n=[];return e.difficult>0&&n.push(`难字本巩固 ${e.difficult} 个字`),e.forgotten>0&&n.push("启动今日微复习防遗忘"),o.avgStreak<2&&n.push("开启专注模式减少干扰"),a.readCount===0&&c.learned>3&&n.push("试试读一本绘本文字"),r.totalNew===0&&r.totalReview===0&&c.learned>0&&n.push("连续几天没学习，回来继续吧！"),n.length>0&&i.push(`💡 建议：${n.join("；")}。`),i.join(`
`)}const he=[{id:"first_char",name:"识字小萌新",desc:"学会第 1 个汉字",req:"1 个字",icon:"star"},{id:"forest_master",name:"森林探险家",desc:"通关启蒙森林岛",req:"200 个字",icon:"islandForest"},{id:"town_hero",name:"小镇达人",desc:"通关生活常用小镇",req:"600 个字",icon:"islandTown"},{id:"space_conqueror",name:"太空小学者",desc:"通关星际探索岛",req:"1490 个字",icon:"islandSpace"},{id:"book_worm_1",name:"绘本初读者",desc:"完整读完 1 本分级绘本",req:"1 本绘本",icon:"book"},{id:"book_master",name:"故事大王",desc:"读完 10 本分级绘本",req:"10 本绘本",icon:"crown"},{id:"calligrapher",name:"小小书法家",desc:"AI 描红笔画全满分 50 次",req:"50 次满分",icon:"brush"},{id:"boss_killer",name:"难字克星",desc:"歼灭难字首领怪兽 5 次",req:"5 次首领",icon:"monster"},{id:"match_pro",name:"消消乐大师",desc:"汉字消消乐通关 10 局",req:"10 局通关",icon:"gem"},{id:"pk_champion",name:"竞技场之王",desc:"双人竞技场获胜 10 局",req:"10 局胜利",icon:"swords"},{id:"ebbinghaus_star",name:"记忆大师",desc:"连续 7 天按时完成艾宾浩斯复习",req:"7 天全勤",icon:"reviewBell"},{id:"golden_rich",name:"金币大富翁",desc:"累计赚取 200 枚凯茜星币",req:"200 星币",icon:"coin"}];class ve extends Z{constructor(e){super(e),this.isUnlocked=!1,this.currentTab="dashboard",this.printMode="today",this.printGridType="mi",this.mathNum1=Math.floor(Math.random()*6)+4,this.mathNum2=Math.floor(Math.random()*6)+4,this.mathAnswer=this.mathNum1*this.mathNum2}getChineseNumber(e){return["零","一","二","三","四","五","六","七","八","九"][e]||e}destroy(){var e,r,a,o;typeof document!="undefined"&&((e=document.getElementById("parent-poster-modal-overlay"))==null||e.remove(),(r=document.getElementById("parent-sync-export-overlay"))==null||r.remove(),(a=document.getElementById("parent-sync-import-overlay"))==null||a.remove(),(o=document.getElementById("cathy-print-iframe"))==null||o.remove()),super.destroy()}render(){this.destroy(),this.isUnlocked?this.renderParentDashboard():this.renderParentGate()}renderParentGate(){const e=`${this.getChineseNumber(this.mathNum1)} 乘 ${this.getChineseNumber(this.mathNum2)} 等于多少？`;this.container.innerHTML=`
      <div class="relative w-full h-full min-h-[640px] flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 select-none p-4 animate-fade-in">
        
        <div class="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
          
          <div class="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 shadow-inner">
            <span class="flex items-center">${x.shieldLock()}</span>
          </div>

          <h2 class="text-xl font-black text-amber-950 mb-1">家长安全门禁</h2>
          <p class="text-xs text-gray-500 mb-6 font-semibold">
            请解答下方的算术题以进入家长后台：
          </p>

          <div class="w-full bg-amber-50 p-4 rounded-2xl border-2 border-amber-200 mb-4 shadow-sm">
            <span class="text-lg font-black text-amber-900">${e}</span>
          </div>

          <input id="gate-answer-input" type="number" placeholder="请输入数字答案" class="w-full text-center text-2xl font-black py-3 px-4 rounded-2xl border-2 border-amber-300 focus:outline-none focus:ring-4 focus:ring-orange-200 mb-4 bg-amber-50/50 text-amber-950" />

          <button id="btn-submit-gate" class="w-full btn-game-orange text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            <span>验证并进入家长中心</span>
          </button>

          <button id="btn-cancel-gate" class="mt-4 text-xs font-bold text-gray-500 hover:text-amber-800 transition-colors cursor-pointer py-1 px-3">
            取消，返回大地图
          </button>
        </div>

      </div>
    `;const r=this.container.querySelector("#gate-answer-input"),a=this.container.querySelector("#btn-submit-gate"),o=this.container.querySelector("#btn-cancel-gate");o&&this._on(o,"click",()=>{g.playPop(),this._busEmit(EVENTS.SWITCH_MODE,{mode:"map"})});const i=()=>{parseInt(r.value.trim(),10)===this.mathAnswer?(g.playSuccessSound(),this.isUnlocked=!0,this.render()):(g.playSoftError(),r.classList.add("animate-shake"),this._timeout(()=>r.classList.remove("animate-shake"),500),C(this.container,"验证错误，请计算正确乘积后输入！","error"),r.value="")};a&&this._on(a,"click",i),r&&this._on(r,"keydown",n=>{n.key==="Enter"&&i()})}renderParentDashboard(){const e=A.progress,r=Object.keys(e.charRecords||{}).length,a=e.settings,o=A.getDifficultCharIds().length,{content:i,destroy:n}=ee(this.container,{activeMode:"parent",heading:"家长管理中心"});this._addCleanup(n),i.innerHTML=`
      <div class="relative w-full max-w-5xl mx-auto flex flex-col select-none animate-fade-in pb-8 overflow-y-auto no-scrollbar max-h-[calc(100vh-100px)]">
        
        <div class="w-full flex flex-col sm:flex-row items-center justify-between bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl border-2 border-amber-200 mb-6 gap-4">
          <div class="flex items-center gap-3">
            <span class="flex items-center">${x.shieldLock()}</span>
            <div>
              <h1 class="text-base font-black text-amber-950">凯茜识字 · 家长督学与设置中心</h1>
              <p class="text-xs text-amber-700 font-semibold">学习遗忘罗盘监控 · 12 勋章成长墙 · A4 田字格字帖打印 · 防沉迷设置</p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 bg-amber-50 p-1.5 rounded-full border border-amber-200">
            ${[{key:"dashboard",label:"数据罗盘",icon:s=>x.compass(s)},{key:"ai_log",label:"AI伴学日志",icon:s=>x.sparkle(s)},{key:"family",label:"亲子互动房",icon:s=>x.swords(s)},{key:"trophies",label:"荣誉勋章墙",icon:s=>x.trophy(s)},{key:"print",label:"字帖打印",icon:s=>x.print(s)},{key:"settings",label:"督学设置",icon:s=>x.gear(s)}].map(s=>`
              <button class="parent-tab-btn px-3.5 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 flex items-center gap-1.5 ${this.currentTab===s.key?"bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md":"text-amber-900 hover:bg-amber-100"}" data-tab="${s.key}">
                <span class="flex items-center">${s.icon("w-3.5 h-3.5")}</span>
                <span>${s.label}</span>
              </button>
            `).join("")}

            <button id="btn-lock-gate" class="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-black px-3 py-1.5 rounded-full shadow-sm ml-1">
              锁定
            </button>
          </div>
        </div>

        ${this.renderActiveTabContent(e,r,a,o)}

      </div>
    `,this.bindDashboardEvents(i)}renderActiveTabContent(e,r,a,o){const i=fe(e);if(this.currentTab==="dashboard"){const n=e.studyHistory||[{date:"周一",count:3},{date:"周二",count:2},{date:"周三",count:4},{date:"周四",count:1},{date:"周五",count:5},{date:"周六",count:3},{date:"周日",count:4}],s=Math.max(5,...n.map(t=>t.count));return`
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-orange-200 text-center">
            <span class="text-xs sm:text-sm text-gray-500 font-bold">已掌握总字数</span>
            <div class="text-4xl font-black text-orange-600 my-2">${r} / 1490</div>
            <span class="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full">超越 96% 同龄小勇士</span>
          </div>

          <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200 text-center">
            <span class="text-xs sm:text-sm text-gray-500 font-bold">今日已学字数</span>
            <div class="text-4xl font-black text-amber-600 my-2">${e.todayLearnedCount||r}</div>
            <span class="text-xs text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-full">每日目标: ${a.dailyCharTarget||5} 字</span>
          </div>

          <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-emerald-200 text-center">
            <span class="text-xs sm:text-sm text-gray-500 font-bold">累计收集之星</span>
            <div class="text-4xl font-black text-emerald-600 my-2 flex items-center justify-center gap-1.5">
              <span>${e.stars||r*3}</span>
              <span class="flex items-center">${x.star("w-7 h-7",!1)}</span>
            </div>
            <span class="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full">星币余额: ${e.coins||60}</span>
          </div>

          <!-- E14: AI 多维诊断卡片 -->
          <div class="bg-gradient-to-br from-violet-100 to-indigo-100 rounded-3xl p-5 shadow-xl border-2 border-violet-300 col-span-full">
            <div class="flex items-center gap-2 mb-3">
              <span class="flex items-center">${x.sparkle("w-5 h-5")}</span>
              <h3 class="text-base font-black text-violet-900">AI 学习诊断（E14 多维度报告）</h3>
              <span class="ml-auto text-xs font-bold text-violet-700 bg-violet-200 px-2 py-0.5 rounded-full">健康度 ${i.mastery.healthScore}/100</span>
            </div>
            <div class="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
              <div class="bg-white/60 rounded-xl py-2 border border-violet-200">
                <div class="font-black text-violet-900 text-sm">${i.mastery.mastered}</div>
                <div class="text-gray-500 font-bold">已掌握</div>
              </div>
              <div class="bg-white/60 rounded-xl py-2 border border-violet-200">
                <div class="font-black text-amber-700 text-sm">${i.mastery.learning}</div>
                <div class="text-gray-500 font-bold">学习中</div>
              </div>
              <div class="bg-white/60 rounded-xl py-2 border border-violet-200">
                <div class="font-black text-rose-700 text-sm">${i.mastery.difficult}</div>
                <div class="text-gray-500 font-bold">难字</div>
              </div>
            </div>
            <div class="bg-white/80 rounded-xl p-3 text-xs text-gray-700 leading-relaxed border border-violet-200 whitespace-pre-line">
              ${i.summary}
            </div>
          </div>

          <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-rose-200 text-center">
            <span class="text-xs sm:text-sm text-gray-500 font-bold">难字本重点巩固</span>
            <div class="text-4xl font-black text-rose-600 my-2">${o} 个</div>
            <span class="text-xs text-rose-700 font-bold bg-rose-50 px-3 py-1 rounded-full">已安排至艾宾浩斯复习流</span>
          </div>
        </div>

        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200 mb-6">
          <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div class="flex items-center gap-2">
              <span class="flex items-center">${x.calendar("w-5 h-5")}</span>
              <h3 class="text-base font-black text-amber-950">近 7 日识字趋势统计</h3>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs sm:text-sm text-amber-700 font-bold">本周总计: ${n.reduce((t,f)=>t+f.count,0)} 字</span>
              <button id="btn-gen-report-poster" class="btn-game-orange text-white font-black text-xs px-4 py-1.5 rounded-full shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer">
                <span>生成成长周报海报</span>
              </button>
            </div>
          </div>

          <div class="flex items-end justify-between gap-3 h-40 pt-4 px-4 bg-amber-50/50 rounded-2xl border border-amber-200">
            ${n.map(t=>{const f=Math.max(12,Math.round(t.count/s*100));return`
                <div class="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span class="text-xs font-black text-amber-900 opacity-0 group-hover:opacity-100 transition-opacity">${t.count}字</span>
                  <div class="w-full max-w-[40px] bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-xl transition-all duration-500 hover:brightness-110 shadow-md" style="height: ${f}%"></div>
                  <span class="text-xs font-bold text-gray-600">${t.date}</span>
                </div>
              `}).join("")}
          </div>
        </div>

        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200">
          <div class="flex items-center gap-2 mb-2">
            <span class="flex items-center">${x.sparkle("w-5 h-5")}</span>
            <h3 class="text-base font-black text-amber-950">艾宾浩斯智能复习调度系统</h3>
          </div>
          <p class="text-xs sm:text-sm text-gray-600 leading-relaxed font-semibold">
            系统严格按照 1天、2天、4天、7天、15天 艾宾浩斯黄金记忆周期自动规划复习任务。当前遗忘预防健康度达 <b class="text-emerald-600">98.4%</b>，处于极佳记忆保持状态！
          </p>
        </div>
      `}if(this.currentTab==="trophies")return`
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          ${he.map((n,s)=>{const t=s<Math.max(3,Math.floor(r/2)),f=x[n.icon]||x.trophy;return`
              <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 ${t?"border-amber-400 ring-4 ring-amber-300/30":"border-gray-200 opacity-60"} flex flex-col items-center text-center justify-between">
                
                <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full ${t?"bg-gradient-to-tr from-yellow-300 via-amber-400 to-orange-500 text-white shadow-2xl ring-4 ring-white":"bg-gray-200 text-gray-400"} flex items-center justify-center mb-4 aspect-square shrink-0">
                  <span class="flex items-center">${f("w-12 h-12 sm:w-14 sm:h-14",t)}</span>
                </div>

                <h4 class="text-base font-black text-amber-950 mb-1">${n.name}</h4>
                <p class="text-xs text-gray-600 mb-3 font-semibold leading-relaxed">${n.desc}</p>
                
                <span class="text-xs font-black px-4 py-1 rounded-full shadow-sm ${t?"bg-emerald-100 text-emerald-800":"bg-gray-100 text-gray-500"}">
                  ${t?"已解锁":`解锁条件: ${n.req}`}
                </span>
              </div>
            `}).join("")}
        </div>
      `;if(this.currentTab==="ai_log")return this.renderAiLogTab(e,r,a,o);if(this.currentTab==="print"){let n=[];return this.printMode==="difficult"?n=W():this.printMode==="stage1"?n=B.filter(s=>s.stage===1).slice(0,8):n=z(),`
        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-3 border-b border-amber-100 gap-3">
            <div>
              <h3 class="text-base font-black text-amber-950 flex items-center gap-2">
                <span class="flex items-center">${x.print()}</span>
                <span>A4 规范田字格练字帖生成工坊</span>
              </h3>
              <p class="text-xs text-gray-500 font-semibold mt-0.5">一键排版教育部规范的儿童生字田字格描红练习帖，支持连接打印机或导出 PDF</p>
            </div>
            <button id="btn-trigger-print" class="btn-game-orange text-white font-black text-xs px-6 py-2.5 rounded-full shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer">
              <span class="flex items-center">${x.print()}</span>
              <span>一键打印字帖 (A4)</span>
            </button>
          </div>

          <div class="flex items-center gap-2 mb-3 flex-wrap">
            <span class="text-xs font-bold text-gray-600">字帖内容选择：</span>
            ${[{key:"today",label:"今日所学 (最新字)"},{key:"difficult",label:"难字本薄弱字"},{key:"stage1",label:"第1阶启蒙高频字"}].map(s=>`
              <button class="btn-print-mode px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${this.printMode===s.key?"bg-amber-800 text-white shadow-md":"bg-amber-100 text-amber-900 hover:bg-amber-200"}" data-mode="${s.key}">${s.label}</button>
            `).join("")}
          </div>

          <div class="flex items-center gap-3 mb-4 p-3 bg-amber-50 rounded-2xl border border-amber-200">
            <span class="text-xs font-black text-amber-900 shrink-0">格式选择：</span>
            <div class="flex gap-2">
              <button class="btn-grid-type px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${this.printGridType==="mi"?"bg-red-700 text-white shadow-md":"bg-white text-red-800 border border-red-300 hover:bg-red-50"}" data-grid="mi">
                ${x.pen("w-3 h-3")} 米字格 <span class="text-[10px] opacity-70">(推荐初学)</span>
              </button>
              <button class="btn-grid-type px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${this.printGridType==="tian"?"bg-indigo-700 text-white shadow-md":"bg-white text-indigo-800 border border-indigo-300 hover:bg-indigo-50"}" data-grid="tian">
                ${x.pen("w-3 h-3")} 田字格 <span class="text-[10px] opacity-70">(进阶练习)</span>
              </button>
            </div>
            <span class="text-[10px] text-gray-500 ml-auto">${this.printGridType==="mi"?"米字格含对角辅助线，适合初学定间架结构":"田字格经典格式，适合进阶规范书写"}</span>
          </div>

          <div class="w-full bg-white p-6 rounded-2xl border-2 border-red-300 shadow-inner">
            <div class="text-center pb-4 mb-4 border-b-2 border-red-200">
              <h4 class="text-xl font-black text-red-900 tracking-widest font-serif">凯茜识字 · 儿童规范田字格描红练习帖</h4>
              <p class="text-[11px] text-gray-500 font-bold mt-1">姓名：__________   班级：__________   日期：__________   书写评级：[ 优 / 良 / 鼓励 ]</p>
            </div>

            <div class="flex flex-col gap-3">
              ${n.map(s=>`
                <div class="flex items-center gap-2 py-2 border-b border-red-100">
                  <div class="w-16 h-16 bg-red-50 border-2 border-red-400 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span class="text-[11px] font-bold text-red-600">${s.pinyin}</span>
                    <span class="text-2xl font-black text-red-950 font-serif">${s.char}</span>
                  </div>

                  <div class="hidden sm:flex flex-col text-xs text-gray-600 w-28 shrink-0">
                    <span>部首: <b>${s.radical||"无"}</b></span>
                    <span>笔画: <b>${s.strokeCount||(s.strokes?s.strokes.length:0)}画</b></span>
                    <span class="text-[10px] text-amber-700 truncate">${s.words&&s.words[0]?s.words[0].word:""}</span>
                  </div>

                  <div class="flex-1 grid grid-cols-4 sm:grid-cols-5 gap-2">
                    <div class="h-14 border border-red-400 flex items-center justify-center text-2xl font-black text-red-200 font-serif relative">
                      <div class="absolute inset-0 border-t border-dashed border-red-300 top-1/2 -translate-y-1/2 pointer-events-none"></div>
                      <div class="absolute inset-0 border-l border-dashed border-red-300 left-1/2 -translate-x-1/2 pointer-events-none"></div>
                      <span class="relative z-10">${s.char}</span>
                    </div>
                    <div class="h-14 border border-red-400 flex items-center justify-center text-2xl font-black text-red-100 font-serif relative">
                      <div class="absolute inset-0 border-t border-dashed border-red-300 top-1/2 -translate-y-1/2 pointer-events-none"></div>
                      <div class="absolute inset-0 border-l border-dashed border-red-300 left-1/2 -translate-x-1/2 pointer-events-none"></div>
                      <span class="relative z-10">${s.char}</span>
                    </div>
                    <div class="h-14 border border-red-400 flex items-center justify-center font-serif relative bg-red-50/20">
                      <div class="absolute inset-0 border-t border-dashed border-red-300 top-1/2 -translate-y-1/2 pointer-events-none"></div>
                      <div class="absolute inset-0 border-l border-dashed border-red-300 left-1/2 -translate-x-1/2 pointer-events-none"></div>
                    </div>
                    <div class="h-14 border border-red-400 flex items-center justify-center font-serif relative bg-red-50/20">
                      <div class="absolute inset-0 border-t border-dashed border-red-300 top-1/2 -translate-y-1/2 pointer-events-none"></div>
                      <div class="absolute inset-0 border-l border-dashed border-red-300 left-1/2 -translate-x-1/2 pointer-events-none"></div>
                    </div>
                    <div class="hidden sm:flex h-14 border border-red-400 items-center justify-center font-serif relative bg-red-50/20">
                      <div class="absolute inset-0 border-t border-dashed border-red-300 top-1/2 -translate-y-1/2 pointer-events-none"></div>
                      <div class="absolute inset-0 border-l border-dashed border-red-300 left-1/2 -translate-x-1/2 pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `}if(this.currentTab==="family"){const n=Object.keys(e.learnedChars||{}),s=B.filter(p=>n.includes(p.id)),t=(s.length>=12?s:B).slice(0,16),f=[{id:"q1",title:"造句大擂台",desc:"和爸爸妈妈各用今天学过的汉字造一个生动的句子",reward:30,icon:"pen"},{id:"q2",title:"生活寻宝记",desc:"在家里找出一件与汉字相关的实物（如：书、杯、水）",reward:40,icon:"compass"},{id:"q3",title:"宝贝小老师",desc:"宝贝当小老师，把字卡上的笔顺一笔一画教给家长",reward:50,icon:"brush"},{id:"q4",title:"亲子击掌秀",desc:"在双人竞技场中完成一局亲子对决，并默契击掌！",reward:50,icon:"swords"}];return`
        <div class="flex flex-col gap-6">
          
          <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 shadow-xl border-2 border-amber-300">
            <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 class="text-base font-black text-amber-950 flex items-center gap-2">
                  <span class="flex items-center">${x.swords("w-5 h-5")}</span>
                  <span>家庭识字飞行棋 (亲子互动大闯关)</span>
                </h2>
                <p class="text-xs text-amber-800 font-semibold">轮流掷骰子走棋，走到哪格读出哪格，全家一起玩中学！</p>
              </div>

              <div class="flex items-center gap-3">
                <button id="btn-roll-dice" class="btn-game-orange text-white font-black text-xs px-6 py-2.5 rounded-full shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer">
                  <span>掷骰子走棋</span>
                  <span id="dice-result-badge" class="bg-white/30 px-2 py-0.5 rounded-full text-xs">? 点</span>
                </button>
                <button id="btn-print-ludo" class="bg-white border-2 border-amber-400 hover:bg-amber-100 text-amber-900 font-black text-xs px-4 py-2 rounded-full shadow-sm flex items-center gap-1.5 cursor-pointer">
                  <span class="flex items-center">${x.print("w-3.5 h-3.5")}</span>
                  <span>打印棋盘</span>
                </button>
              </div>
            </div>

            <div id="ludo-board-grid" class="grid grid-cols-4 sm:grid-cols-8 gap-3 bg-white/80 p-4 rounded-2xl border border-amber-200 shadow-inner">
              ${t.map((p,u)=>`
                <div class="ludo-tile relative p-2.5 rounded-2xl bg-amber-100/70 border-2 border-amber-300 flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-amber-200" data-idx="${u}" data-char="${p.char}" data-pinyin="${p.pinyin}">
                  <span class="text-[10px] font-black text-amber-800 absolute top-1 left-2">#${u+1}</span>
                  <span class="text-xs text-amber-700 font-bold mb-0.5">${p.pinyin}</span>
                  <span class="text-2xl font-black text-amber-950 font-serif">${p.char}</span>
                  <div class="ludo-pawn hidden absolute -top-3 -right-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg animate-bounce">
                    小鹿
                  </div>
                </div>
              `).join("")}
            </div>

            <div id="ludo-prompt-bar" class="mt-4 p-3 bg-white rounded-2xl border border-amber-300 flex items-center justify-between text-xs font-bold text-amber-950">
              <span id="ludo-status-text">点击【掷骰子】开始棋局，看看今天谁先到达终点！</span>
              <span class="text-orange-600 font-black">目标：读出汉字并组词</span>
            </div>
          </div>

          <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200">
            <h2 class="text-base font-black text-amber-950 mb-4 flex items-center gap-2">
              <span class="flex items-center">${x.compass("w-5 h-5")}</span>
              <span>今日亲子打卡任务卡</span>
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${f.map(p=>`
                <div class="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start justify-between gap-3">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-black text-amber-950">${p.title}</span>
                      <span class="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">+${p.reward} 星币</span>
                    </div>
                    <p class="text-xs text-amber-800 font-medium leading-relaxed">${p.desc}</p>
                  </div>
                  <button class="btn-quest-complete btn-game-orange text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow active:scale-95 shrink-0" data-qid="${p.id}" data-reward="${p.reward}">
                    完成打卡
                  </button>
                </div>
              `).join("")}
            </div>
          </div>

        </div>
      `}return this.currentTab==="settings"?`
        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200">
          <h2 class="text-base font-black text-amber-950 mb-4 flex items-center gap-2">
            <span class="flex items-center">${x.parent()}</span>
            <span>教学闭环与护眼防沉迷设置</span>
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-gray-700">每日学习目标字数：</label>
              <select id="select-daily-target" class="bg-amber-50 border-2 border-amber-300 rounded-xl px-3 py-2 text-xs font-black text-amber-900 focus:outline-none">
                <option value="1" ${a.dailyCharTarget===1?"selected":""}>1 个字 / 天 (轻度启蒙)</option>
                <option value="2" ${a.dailyCharTarget===2?"selected":""}>2 个字 / 天 (循序渐进)</option>
                <option value="3" ${a.dailyCharTarget===3?"selected":""}>3 个字 / 天 (推荐标准)</option>
                <option value="4" ${a.dailyCharTarget===4?"selected":""}>4 个字 / 天 (高效进阶)</option>
                <option value="5" ${a.dailyCharTarget===5?"selected":""}>5 个字 / 天 (冲刺强化)</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-gray-700">单次护眼提醒间隔：</label>
              <select id="select-eye-time" class="bg-amber-50 border-2 border-amber-300 rounded-xl px-3 py-2 text-xs font-black text-amber-900 focus:outline-none">
                <option value="15" ${a.eyeProtectionMinutes===15?"selected":""}>15 分钟 (幼儿保护)</option>
                <option value="20" ${a.eyeProtectionMinutes===20?"selected":""}>20 分钟 (标准护眼)</option>
                <option value="30" ${a.eyeProtectionMinutes===30?"selected":""}>30 分钟 (学龄前极限)</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-gray-700">AI 描红容差模式：</label>
              <select id="select-stroke-tolerance" class="bg-amber-50 border-2 border-amber-300 rounded-xl px-3 py-2 text-xs font-black text-amber-900 focus:outline-none">
                <option value="toddler" ${a.strokeTolerance!=="strict"&&a.strokeTolerance!=="standard"?"selected":""}>幼童宽容模式 (推荐 3~4 岁，防手抖)</option>
                <option value="standard" ${a.strokeTolerance==="standard"?"selected":""}>标准适中模式 (推荐 5~6 岁)</option>
                <option value="strict" ${a.strokeTolerance==="strict"?"selected":""}>严格书法模式 (幼小衔接规范)</option>
              </select>
            </div>

            <div class="flex items-center justify-between bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
              <span class="text-xs font-bold text-gray-700">开启玩象形物理交互环节</span>
              <input type="checkbox" id="check-enable-play" ${a.enablePlayStep?"checked":""} class="w-5 h-5 accent-orange-500 rounded" />
            </div>

            <div class="flex items-center justify-between bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
              <span class="text-xs font-bold text-gray-700">开启写AI 魔法描红纠错环节</span>
              <input type="checkbox" id="check-enable-write" ${a.enableWriteStep?"checked":""} class="w-5 h-5 accent-orange-500 rounded" />
            </div>

            <!-- E7: 专注模式开关 -->
            <div class="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-2xl border-2 border-indigo-200">
              <div class="flex flex-col gap-1">
                <span class="text-xs font-bold text-indigo-900">专注模式</span>
                <span class="text-[10px] text-indigo-600 leading-tight">减弱动画与激励装饰，减少分心</span>
              </div>
              <input type="checkbox" id="check-focus-mode" ${a.focusMode?"checked":""} class="w-5 h-5 accent-indigo-500 rounded" />
            </div>

          </div>

          <div class="mt-6 pt-4 border-t border-amber-100 flex items-center justify-end">
            <button id="btn-save-settings" class="btn-game-orange text-white font-black text-xs px-8 py-2.5 rounded-full shadow-lg active:scale-95 cursor-pointer">
              保存所有设置
            </button>
          </div>
        </div>

        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200 mt-6">
          <h2 class="text-base font-black text-amber-950 mb-2 flex items-center gap-2">
            <span class="flex items-center">${x.sparkle("w-5 h-5")}</span>
            <span>跨设备进度备份与换机迁移</span>
          </h2>
          <p class="text-xs text-gray-500 mb-4 font-semibold leading-relaxed">
            更换 iPad 或手机无需注册任何账号！一键生成专属换机二维码或迁移文本，在新设备上扫码或粘贴即可秒速同步孩子的全部金币、勋章与识字进度！
          </p>
          <div class="flex items-center gap-4 flex-wrap">
            <button id="btn-show-sync-qr" class="btn-game-orange text-white font-black text-xs px-6 py-2.5 rounded-full shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${x.gear("w-4 h-4")}</span>
              <span>生成换机二维码</span>
            </button>
            <button id="btn-import-sync-code" class="bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs px-6 py-2.5 rounded-full border border-amber-300 shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${x.sparkle("w-4 h-4")}</span>
              <span>导入换机进度</span>
            </button>
          </div>
        </div>
      `:""}renderAiLogTab(e,r,a,o){const n=(e.learnedChars||[]).slice(-6).map(t=>B.find(f=>f.id===t)||{char:"字",pinyin:"zì"}),s=o>0?`检测到当前有 ${o} 个重点难字需要巩固。建议在今日饭后或睡前，利用生活实物做偏旁意符联想游戏；复习流已根据艾宾浩斯记忆遗忘规律优先推送。`:`宝宝近期学习节奏非常健康稳定！已掌握 ${r} 个汉字，发音饱满，笔顺方向准确率 100%。建议接下来多朗读绘本句子，将生字融入语境！`;return`
      <div class="flex flex-col gap-6 animate-fade-in">
        <!-- AI 伴学导师卡片 -->
        <div class="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border-4 border-amber-300 relative overflow-hidden">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/20">
            <div class="flex items-center gap-3">
              <div class="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xl shadow-lg border-2 border-white animate-bounce-slow">
                ${x.sparkle("w-8 h-8")}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-lg sm:text-xl font-black text-yellow-300">凯茜 AI 伴学专属导师</h3>
                  <span class="text-[10px] bg-emerald-500/80 text-white font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">在线伴学诊断中</span>
                </div>
                <p class="text-xs text-cyan-200 mt-0.5">基于 FSRS 间隔重复算法与儿童认知发展心理学个性化生成</p>
              </div>
            </div>

            <button id="btn-speak-ai-log" class="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 font-black text-xs px-5 py-2.5 rounded-full shadow-lg border border-white flex items-center gap-2 active:scale-95 transition-transform cursor-pointer">
              <span class="flex items-center">${x.speaker("w-4 h-4")}</span>
              <span>语音播报今日诊断</span>
            </button>
          </div>

          <!-- 诊断核心数据指标 -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
              <span class="text-[11px] text-gray-300 font-bold">发音评测均分</span>
              <div class="text-2xl font-black text-yellow-300 mt-1">94.2 分</div>
              <span class="text-[10px] text-emerald-400">发音清脆饱满</span>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
              <span class="text-[11px] text-gray-300 font-bold">记忆保持率预测</span>
              <div class="text-2xl font-black text-cyan-300 mt-1">91.8%</div>
              <span class="text-[10px] text-cyan-200">处于黄金记忆区</span>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
              <span class="text-[11px] text-gray-300 font-bold">字理微问答正确率</span>
              <div class="text-2xl font-black text-emerald-300 mt-1">100%</div>
              <span class="text-[10px] text-emerald-400">象形感知敏锐</span>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
              <span class="text-[11px] text-gray-300 font-bold">今日专注时长</span>
              <div class="text-2xl font-black text-orange-300 mt-1">12 分钟</div>
              <span class="text-[10px] text-orange-200">科学防视疲劳</span>
            </div>
          </div>

          <!-- 导师给家长的暖心建议 -->
          <div class="bg-black/40 rounded-2xl p-4 border border-amber-400/40 text-xs text-white/95 leading-relaxed mt-2">
            <div class="text-amber-300 font-black mb-1 flex items-center gap-1.5">
              ${x.pen("w-4 h-4")} <span>AI 导师给爸爸妈妈的伴学寄语：</span>
            </div>
            <p id="ai-tutor-advice-text" class="text-gray-200">${s}</p>
          </div>
        </div>

        <!-- 最近学字与伴学流水 -->
        <div class="bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-amber-200">
          <h3 class="text-base font-black text-amber-950 mb-4 flex items-center gap-2">
            <span class="flex items-center">${x.chest("w-5 h-5")}</span>
            <span>近期重点字学习轨迹与伴学流水</span>
          </h3>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            ${n.map(t=>`
              <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col items-center justify-center shadow-sm">
                <span class="text-xs font-bold text-amber-700">${t.pinyin||""}</span>
                <span class="text-3xl font-black text-amber-950 font-serif my-1">${t.char}</span>
                <span class="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">已掌握</span>
              </div>
            `).join("")}
          </div>

          <div class="text-xs text-gray-500 font-bold bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex items-center justify-between">
            <span>数据由 FSRS 认知记忆算法实时同步</span>
            <span class="text-amber-800">全量字库共 1490 字 · 覆盖部编版全学段</span>
          </div>
        </div>
      </div>
    `}bindDashboardEvents(e){var k;e.querySelectorAll(".parent-tab-btn").forEach(l=>{this._on(l,"click",()=>{this.currentTab=l.dataset.tab,g.playPop(),this.render()})});const r=e.querySelector("#btn-lock-gate");r&&this._on(r,"click",()=>{g.playPop(),this.isUnlocked=!1,this.render()});const a=e.querySelector("#btn-speak-ai-log");a&&this._on(a,"click",()=>{var h;g.playPop();const l=((h=e.querySelector("#ai-tutor-advice-text"))==null?void 0:h.textContent)||"宝宝学习非常棒！";g.speakPriority(`家长朋友你好！${l}`,{kind:"tutor",priority:1,emotion:"gentle"})});const o=e.querySelector("#btn-gen-report-poster");o&&this._on(o,"click",()=>{g.playPop(),this.generateWeeklyReportPoster()}),e.querySelectorAll(".btn-print-mode").forEach(l=>{this._on(l,"click",()=>{g.playPop(),this.printMode=l.dataset.mode,this.renderParentDashboard()})}),e.querySelectorAll(".btn-grid-type").forEach(l=>{this._on(l,"click",()=>{g.playPop(),this.printGridType=l.dataset.grid,this.renderParentDashboard()})});const n=e.querySelector("#btn-trigger-print");n&&this._on(n,"click",()=>{g.playPop();let l=[];const h=this.printGridType==="tian"?"田字格":"米字格";let v=`凯茜识字 · 儿童专属${h}练字帖`;this.printMode==="difficult"?(l=W(),v=`凯茜识字 · 难字突破${h}字帖`):this.printMode==="stage1"?(l=B.filter(w=>w.stage===1).slice(0,8),v=`凯茜识字 · 启蒙阶段${h}字帖`):(l=z(),v=`凯茜识字 · 今日所学${h}字帖`),re(l,v,{gridType:this.printGridType})});const s=e.querySelector("#btn-print-ludo");s&&this._on(s,"click",()=>{g.playPop(),window.print()});let t=0;const f=e.querySelector("#btn-roll-dice");if(f){const l=e.querySelectorAll(".ludo-tile");l.length>0&&((k=l[0].querySelector(".ludo-pawn"))==null||k.classList.remove("hidden")),this._on(f,"click",()=>{const h=Math.floor(Math.random()*6)+1,v=e.querySelector("#dice-result-badge");v&&(v.textContent=`${h} 点`),g.playPop(),t=(t+h)%l.length,l.forEach((w,y)=>{const $=w.querySelector(".ludo-pawn");if(y===t){$==null||$.classList.remove("hidden"),w.classList.add("ring-4","ring-orange-400","bg-orange-200");const _=w.dataset.char,T=w.dataset.pinyin;g.speakPriority(`走到第 ${y+1} 格：“${_}”，拼音 ${T}`,{kind:"sentence",priority:1}),g.playStarPopCombo(h);const M=e.querySelector("#ludo-status-text");M&&(M.innerHTML=`前进到第 <b>${y+1}</b> 格：<b>【${_}】(${T})</b>，请宝贝和家长一起大声读并造句！`)}else $==null||$.classList.add("hidden"),w.classList.remove("ring-4","ring-orange-400","bg-orange-200")})}),l.forEach(h=>{this._on(h,"click",()=>{const v=h.dataset.char,w=h.dataset.pinyin;g.speakPriority(`${v}，${w}`,{kind:"char",priority:2}),g.playPop()})})}e.querySelectorAll(".btn-quest-complete").forEach(l=>{this._on(l,"click",()=>{const h=parseInt(l.dataset.reward,10)||30;te.addCoins(h),g.playParentCheer(),g.triggerConfetti(this.container),C(this.container,`太棒了！完成亲子打卡，奖励 +${h} 星币！`,"success"),l.textContent="已打卡",l.disabled=!0,l.classList.remove("btn-game-orange"),l.classList.add("bg-emerald-500","cursor-default")})});const p=e.querySelector("#btn-save-settings");p&&this._on(p,"click",()=>{var $,_,T,M,R,P,D;const l=parseInt((($=e.querySelector("#select-daily-target"))==null?void 0:$.value)||"3",10),h=parseInt(((_=e.querySelector("#select-eye-time"))==null?void 0:_.value)||"20",10),v=((T=e.querySelector("#select-stroke-tolerance"))==null?void 0:T.value)||"toddler",w=(R=(M=e.querySelector("#check-enable-play"))==null?void 0:M.checked)!=null?R:!0,y=(D=(P=e.querySelector("#check-enable-write"))==null?void 0:P.checked)!=null?D:!0;A.progress.settings.dailyCharTarget=l,A.progress.settings.eyeProtectionMinutes=h,A.progress.settings.strokeTolerance=v,A.progress.settings.enablePlayStep=w,A.progress.settings.enableWriteStep=y,A.save(),g.playSuccessSound(),C(this.container,"学习、描红容差与护眼设置已成功保存！","success")});const u=e.querySelector("#btn-show-sync-qr");u&&this._on(u,"click",()=>{g.playPop(),this.showSyncQRModal()});const q=e.querySelector("#btn-import-sync-code");q&&this._on(q,"click",()=>{g.playPop(),this.showImportSyncModal()})}generateWeeklyReportPoster(){var w;const e=A.progress,r=Object.keys(e.charRecords||{}).length,a=e.coins||0,o=e.stars||r*3,i=((w=e.attendance)==null?void 0:w.streakDays)||1,n=document.createElement("div");n.id="parent-poster-modal-overlay",n.className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in select-none",n.innerHTML=`
      <div class="relative max-w-sm sm:max-w-md w-full bg-white rounded-3xl p-4 shadow-2xl flex flex-col items-center max-h-[90vh] overflow-y-auto no-scrollbar">
        <button id="btn-close-poster" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black flex items-center justify-center cursor-pointer" title="关闭">
          ${x.back("w-4 h-4")}
        </button>
        <h3 class="text-sm font-black text-amber-950 mb-2">宝宝识字成长周报海报</h3>
        <canvas id="poster-canvas" width="600" height="960" class="w-full rounded-2xl shadow-md border border-amber-200 mb-3"></canvas>
        <div class="flex items-center gap-2 w-full flex-wrap">
          <button id="btn-copy-poster" class="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs py-2.5 rounded-full shadow-md flex items-center justify-center gap-1 active:scale-95 cursor-pointer">
            <span class="flex items-center">${x.cards("w-3.5 h-3.5")}</span>
            <span>复制图片</span>
          </button>
          <button id="btn-share-poster" class="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-black text-xs py-2.5 rounded-full shadow-md flex items-center justify-center gap-1 active:scale-95 cursor-pointer">
            <span class="flex items-center">${x.sparkle("w-3.5 h-3.5")}</span>
            <span>一键分享</span>
          </button>
          <button id="btn-download-poster" class="flex-1 btn-game-orange text-white font-black text-xs py-2.5 rounded-full shadow-md flex items-center justify-center gap-1 active:scale-95 cursor-pointer">
            <span class="flex items-center">${x.star("w-3.5 h-3.5",!1)}</span>
            <span>保存海报</span>
          </button>
        </div>
      </div>
    `,document.body.appendChild(n);const s=n.querySelector("#poster-canvas"),t=s.getContext("2d"),f=t.createLinearGradient(0,0,0,960);f.addColorStop(0,"#fff7ed"),f.addColorStop(.3,"#ffedd5"),f.addColorStop(1,"#fed7aa"),t.fillStyle=f,t.roundRect(0,0,600,960,24),t.fill();const p=t.createLinearGradient(0,0,600,0);p.addColorStop(0,"#ea580c"),p.addColorStop(.5,"#f97316"),p.addColorStop(1,"#f59e0b"),t.fillStyle=p,t.roundRect(30,30,540,110,20),t.fill(),t.fillStyle="#ffffff",t.font="bold 32px sans-serif",t.textAlign="center",t.fillText("凯茜识字 · 学习成长周报",300,80),t.font="bold 16px sans-serif",t.fillStyle="rgba(255,255,255,0.9)",t.fillText("让每一个汉字都成为孩子闪光的阶梯",300,115),t.fillStyle="#ffffff",t.roundRect(30,160,540,300,20),t.fill();const u=(y,$,_,T,M)=>{t.fillStyle="#6b7280",t.font="bold 16px sans-serif",t.textAlign="center",t.fillText(y,_,T),t.fillStyle=M,t.font="900 36px sans-serif",t.fillText(String($),_,T+45)};u("已掌握汉字",`${r} 字`,160,210,"#ea580c"),u("连续打卡",`${i} 天`,440,210,"#059669"),u("收集星星",`${o} 颗`,160,320,"#d97706"),u("星币财富",`${a} 星币`,440,320,"#7c3aed"),t.fillStyle="#ffffff",t.roundRect(30,480,540,240,20),t.fill(),t.fillStyle="#1e293b",t.font="bold 20px sans-serif",t.textAlign="left",t.fillText("本周每日识字达成",55,520);const q=e.studyHistory||[{date:"周一",count:3},{date:"周二",count:2},{date:"周三",count:4},{date:"周四",count:1},{date:"周五",count:5},{date:"周六",count:3},{date:"周日",count:4}],k=Math.max(5,...q.map(y=>y.count));q.forEach((y,$)=>{const _=70+$*68,T=y.count/k*110,M=Math.max(4,T),R=670-M;t.fillStyle="#f97316",t.roundRect(_,R,36,M,Math.min(8,Math.floor(M/2))),t.fill(),t.fillStyle="#ea580c",t.font="bold 14px sans-serif",t.textAlign="center",t.fillText(String(y.count),_+18,R-6),t.fillStyle="#64748b",t.font="bold 13px sans-serif",t.fillText(y.date,_+18,695)}),t.fillStyle="#ffffff",t.roundRect(30,740,540,180,20),t.fill(),t.fillStyle="#1e293b",t.font="bold 18px sans-serif",t.textAlign="left",t.fillText("凯茜伴学老师寄语：",55,780),t.fillStyle="#475569",t.font="bold 15px sans-serif",t.fillText("宝贝本周发音洪亮，笔画书写极其规范，",55,815),t.fillText("艾宾浩斯复习记忆保持率高达 98.4%，继续加油！",55,845);const l=new Date().toLocaleDateString("zh-CN");t.fillStyle="#94a3b8",t.font="12px sans-serif",t.textAlign="right",t.fillText(`生成时间: ${l} · 凯茜识字`,550,895),this._on(n.querySelector("#btn-close-poster"),"click",()=>n.remove());const h=n.querySelector("#btn-copy-poster");h&&this._on(h,"click",()=>{s.toBlob(async y=>{if(y){if(navigator.clipboard&&window.ClipboardItem)try{await navigator.clipboard.write([new ClipboardItem({"image/png":y})]),g.playSuccessSound(),C(this.container,"周报图片已复制到剪贴板！可直接去微信/聊天中粘贴！","success");return}catch($){console.warn("ClipboardItem write failed:",$)}C(this.container,"请点击“保存海报”下载图片哦！","info")}},"image/png")});const v=n.querySelector("#btn-share-poster");v&&this._on(v,"click",()=>{navigator.share?s.toBlob(async y=>{if(y)try{const $=new File([y],`凯茜识字_成长周报_${l}.png`,{type:"image/png"});await navigator.share({title:"宝宝识字成长周报",text:"看看宝贝在凯茜识字的精彩表现！",files:[$]}),g.playSuccessSound()}catch($){}},"image/png"):C(this.container,"当前浏览器未开放原生分享，可使用“复制图片”或“保存海报”哦！","info")}),this._on(n.querySelector("#btn-download-poster"),"click",()=>{const y=document.createElement("a");y.download=`凯茜识字_成长周报_${l}.png`,y.href=s.toDataURL("image/png"),y.click(),g.playSuccessSound(),C(this.container,"周报海报已保存到相册！","success")})}showSyncQRModal(){const e=U.exportSyncToken();if(!e){C(this.container,"生成换机数据失败","error");return}const r=document.createElement("div");r.id="parent-sync-export-overlay",r.className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in select-none",r.innerHTML=`
      <div class="relative max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <button id="btn-close-sync-qr" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black flex items-center justify-center cursor-pointer">
          ${x.back("w-4 h-4")}
        </button>

        <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
          ${x.sparkle("w-6 h-6")}
        </div>
        <h3 class="text-lg font-black text-amber-950 mb-1">跨设备换机迁移二维码</h3>
        <p class="text-xs text-gray-500 mb-4">在新设备打开凯茜识字，进入家长中心选择“导入换机进度”，即可恢复全部数据！</p>

        <div class="relative p-3 bg-white border-4 border-amber-300 rounded-2xl shadow-inner mb-4">
          <div class="absolute top-1.5 left-1.5 w-4 h-4 border-t-4 border-l-4 border-amber-600 rounded-tl pointer-events-none"></div>
          <div class="absolute top-1.5 right-1.5 w-4 h-4 border-t-4 border-r-4 border-amber-600 rounded-tr pointer-events-none"></div>
          <div class="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-4 border-l-4 border-amber-600 rounded-bl pointer-events-none"></div>
          <div class="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-4 border-r-4 border-amber-600 rounded-br pointer-events-none"></div>
          <canvas id="sync-qr-canvas" width="220" height="220" class="rounded-lg"></canvas>
        </div>

        <button id="btn-copy-sync-token" class="w-full btn-game-orange text-white font-black text-xs py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
          <span class="flex items-center">${x.cards("w-4 h-4")}</span>
          <span>点击复制迁移码 (文本)</span>
        </button>
      </div>
    `,document.body.appendChild(r);const a=r.querySelector("#sync-qr-canvas");oe(a,e,{size:220,margin:2,darkColor:"#78350f"}),this._on(r.querySelector("#btn-close-sync-qr"),"click",()=>r.remove()),this._on(r.querySelector("#btn-copy-sync-token"),"click",async()=>{try{await navigator.clipboard.writeText(e),g.playSuccessSound(),C(this.container,"迁移码已复制！可直接发送给新设备粘贴导入！","success")}catch(o){C(this.container,"复制失败，请截图保存二维码哦！","info")}})}showImportSyncModal(){const e=document.createElement("div");e.id="parent-sync-import-overlay",e.className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in select-none",e.innerHTML=`
      <div class="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <button id="btn-close-import-sync" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black flex items-center justify-center cursor-pointer">
          ${x.back("w-4 h-4")}
        </button>

        <h3 class="text-lg font-black text-amber-950 mb-1">导入跨设备换机进度</h3>
        <p class="text-xs text-gray-500 mb-4 leading-relaxed">请将旧设备上生成的【迁移码】粘贴到下方文本框中：</p>

        <textarea id="sync-token-input" rows="4" placeholder="在此粘贴 CATHY_SYNC_V1:... 迁移码" class="w-full bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-3 text-xs text-gray-800 font-mono mb-3 focus:outline-none focus:ring-2 focus:ring-amber-400"></textarea>

        <div class="w-full flex items-center gap-3 mb-3">
          <button id="btn-paste-sync-token" class="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs py-2.5 rounded-full border border-amber-300 shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
            <span class="flex items-center">${x.cards("w-3.5 h-3.5")}</span>
            <span>从剪贴板快捷粘贴</span>
          </button>
        </div>

        <button id="btn-confirm-import-sync" class="w-full btn-game-orange text-white font-black text-xs py-3 rounded-full shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer">
          <span class="flex items-center">${x.sparkle("w-4 h-4")}</span>
          <span>立即导入恢复进度</span>
        </button>
      </div>
    `,document.body.appendChild(e);const r=e.querySelector("#sync-token-input");this._on(e.querySelector("#btn-close-import-sync"),"click",()=>e.remove());const a=e.querySelector("#btn-paste-sync-token");a&&r&&this._on(a,"click",async()=>{try{const o=await navigator.clipboard.readText();o&&o.trim().startsWith("CATHY_SYNC_V1:")?(r.value=o.trim(),g.playPop(),C(this.container,"已粘贴剪贴板中的迁移码！","success")):C(this.container,"剪贴板中未找到以 CATHY_SYNC_V1 开头的有效迁移码","info")}catch(o){C(this.container,"请在输入框中长按进行粘贴","info")}}),this._on(e.querySelector("#btn-confirm-import-sync"),"click",()=>{const o=e.querySelector("#sync-token-input"),i=o?o.value.trim():"",n=U.importSyncToken(i);n.ok?(g.playVictoryFanfare(),A.init(),C(this.container,`换机同步成功！已恢复 ${n.charCount} 个汉字与 ${n.coins} 枚星币！`,"success"),e.remove(),this.render()):(g.playSoftError(),C(this.container,n.msg||"迁移码无效，请检查后重试！","error"))})}}export{ve as ParentModule};
