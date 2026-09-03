import{j as $,e as C,a as d,G as b,s as L,k as F,B as te,E as N}from"./index-CObQJZ8f.js";import{p as R}from"./pronunciationEval-KUFB0C_O.js";import{o as O}from"./morphEngine-B-GTuvjM.js";class G{constructor(e,t,s,i,r={}){this.canvas=e,this.ctx=e.getContext("2d"),this.charData=t,this.onComplete=s,this.onStrokeComplete=i,this.options=r||{},this.freeWriteMode=!!this.options.freeWrite,this.isPeeking=!1,this._peekTimer=null,this.gridType="mi",this.drawSealStamp=!1,this.currentStrokeIndex=0,this.completedStrokes=[],this.userCurrentPath=[],this.isDrawing=!1,this.isDemonstrating=!1,this.demoAnimTimer=null,this.demoPos=null,this.errorWarning="",this.animGuideTimer=null,this.errorTimer=null,this.completeTimer=null,this.guideProgress=0,this._resizeObserver=null,this.isDestroyed=!1,this.initCanvasSize(),this.bindEvents(),this._initResizeObserver(),this.startGuideAnimation(),this.render()}_initResizeObserver(){typeof ResizeObserver!="undefined"&&(this._resizeObserver=new ResizeObserver(()=>{this.initCanvasSize(),this.render()}),this._resizeObserver.observe(this.canvas.parentElement))}initCanvasSize(){const e=this.canvas.getBoundingClientRect(),t=window.devicePixelRatio||1;this.width=e.width||340,this.height=e.height||340,this.canvas.width=this.width*t,this.canvas.height=this.height*t,this.ctx.scale(t,t)}bindEvents(){this.handleStart=this.onPointerDown.bind(this),this.handleMove=this.onPointerMove.bind(this),this.handleEnd=this.onPointerUp.bind(this),this.canvas.addEventListener("mousedown",this.handleStart),window.addEventListener("mousemove",this.handleMove),window.addEventListener("mouseup",this.handleEnd),this.canvas.addEventListener("touchstart",this.handleStart,{passive:!1}),window.addEventListener("touchmove",this.handleMove,{passive:!1}),window.addEventListener("touchend",this.handleEnd)}destroy(){this.isDestroyed=!0,this.stopDemo(),this._peekTimer&&(clearTimeout(this._peekTimer),this._peekTimer=null),this.animGuideTimer&&(cancelAnimationFrame(this.animGuideTimer),this.animGuideTimer=null),this.errorTimer&&clearTimeout(this.errorTimer),this.completeTimer&&clearTimeout(this.completeTimer),this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null),this.canvas.removeEventListener("mousedown",this.handleStart),window.removeEventListener("mousemove",this.handleMove),window.removeEventListener("mouseup",this.handleEnd),this.canvas.removeEventListener("touchstart",this.handleStart),window.removeEventListener("touchmove",this.handleMove),window.removeEventListener("touchend",this.handleEnd)}peekGuide(e=2e3){this.isPeeking=!0,this.render(),this._peekTimer&&clearTimeout(this._peekTimer),this._peekTimer=setTimeout(()=>{this.isDestroyed||(this.isPeeking=!1,this.render())},e)}demoAllStrokes(e){if(this.isDemonstrating)return;this.isDemonstrating=!0,this.isDrawing=!1,this.userCurrentPath=[],this.completedStrokes=[],this.currentStrokeIndex=0,this.errorWarning="",this.animGuideTimer&&cancelAnimationFrame(this.animGuideTimer);const t=this.charData.strokes||[];if(t.length===0){this.isDemonstrating=!1,this.startGuideAnimation(),e&&e();return}let s=0,i=0;const r=.03,a=()=>{if(!this.isDemonstrating)return;if(i+=r,i>=1){this.completedStrokes.push(t[s]);try{$.playPop()}catch(y){}if(s++,i=0,s>=t.length){this.demoPos=null,this.render(),this.completeTimer=setTimeout(()=>{this.isDemonstrating=!1,this.reset(),this.startGuideAnimation(),e&&e()},900);return}}const o=t[s],l=this.width,c=this.height,u=o.start.x/100*l,h=o.start.y/100*c,m=o.end.x/100*l,x=o.end.y/100*c;let g=u,p=h;if(o.corner){const y=o.corner.x/100*l,f=o.corner.y/100*c;if(i<.5){const v=i*2;g=u+(y-u)*v,p=h+(f-h)*v}else{const v=(i-.5)*2;g=y+(m-y)*v,p=f+(x-f)*v}}else g=u+(m-u)*i,p=h+(x-h)*i;this.demoPos={x:g,y:p,strokeIdx:s,stroke:o,progress:i},this.render(),this.demoAnimTimer=requestAnimationFrame(a)};this.demoAnimTimer=requestAnimationFrame(a)}stopDemo(){this.isDemonstrating&&(this.isDemonstrating=!1,this.demoAnimTimer&&cancelAnimationFrame(this.demoAnimTimer),this.completeTimer&&clearTimeout(this.completeTimer),this.demoPos=null,this.reset(),this.startGuideAnimation())}getPointerPos(e){const t=this.canvas.getBoundingClientRect(),s=e.touches?e.touches[0].clientX:e.clientX,i=e.touches?e.touches[0].clientY:e.clientY;return{x:(s-t.left)/t.width*100,y:(i-t.top)/t.height*100}}getTolerance(){var e,t,s,i,r,a;try{if(typeof window!="undefined"&&((s=(t=(e=window.ebbinghausManager)==null?void 0:e.progress)==null?void 0:t.settings)==null?void 0:s.strokeTolerance)==="strict")return{start:16,end:18,reverse:-20};if(typeof window!="undefined"&&((a=(r=(i=window.ebbinghausManager)==null?void 0:i.progress)==null?void 0:r.settings)==null?void 0:a.strokeTolerance)==="standard")return{start:22,end:24,reverse:-25}}catch(o){}return{start:28,end:30,reverse:-35}}onPointerDown(e){if(e.preventDefault(),this.isDemonstrating&&this.stopDemo(),this.currentStrokeIndex>=this.charData.strokes.length)return;const t=this.getPointerPos(e),s=this.charData.strokes[this.currentStrokeIndex],i=s.start,r=this.getTolerance(),a=Math.hypot(t.x-i.x,t.y-i.y);if(Math.hypot(t.x-s.end.x,t.y-s.end.y)<r.end*.6&&a>r.start){this.triggerError("这是终点哦，请从发光起点开始写！");return}if(a>r.start){this.triggerError("请在发光的起点下笔哦！");return}this.isDrawing=!0,this.userCurrentPath=[{...t,t:performance.now(),w:18}],this.errorWarning="",$.playChantHit()}onPointerMove(e){if(!this.isDrawing)return;e.preventDefault();const t=this.getPointerPos(e),s=performance.now(),i=this.userCurrentPath[this.userCurrentPath.length-1];let r=18;if(i){const a=Math.max(s-(i.t||s),8),l=Math.hypot(t.x-i.x,t.y-i.y)/a;r=18*Math.max(.65,Math.min(1.45,1.25-l*.35))}this.userCurrentPath.push({...t,t:s,w:r}),this.render()}onPointerUp(e){var c,u;if(!this.isDrawing)return;this.isDrawing=!1;const t=this.charData.strokes[this.currentStrokeIndex],s=this.getTolerance(),i=this.userCurrentPath[this.userCurrentPath.length-1];if(!i){this.userCurrentPath=[],this.render();return}const a=Math.hypot(i.x-t.end.x,i.y-t.end.y)<=s.end;let o=!1,l=!1;if(this.userCurrentPath.length>=4){const h=this.userCurrentPath[0];this.userCurrentPath[Math.floor(this.userCurrentPath.length/2)];const m=i,x=m.x-h.x,g=m.y-h.y,p=t.end.x-t.start.x,y=t.end.y-t.start.y;if(x*p+g*y<s.reverse&&(o=!0),!o){const w=(typeof window!="undefined"&&((u=(c=window.ebbinghausManager)==null?void 0:c.getAge)==null?void 0:u.call(c))||6)<=6?60:45;this.strokeDirectionValidator(this.userCurrentPath,t,w)||(o=!0)}if(t.corner){let v=1/0;for(const w of this.userCurrentPath){const k=Math.hypot(w.x-t.corner.x,w.y-t.corner.y);k<v&&(v=k)}v>s.end*1.6&&(l=!0)}}if(o){try{C.recordMistake(this.charData.id,"reverse_stroke",{strokeIndex:this.currentStrokeIndex})}catch(h){}this.triggerError("笔画方向反啦，请顺着光球方向滑动哦！"),this.userCurrentPath=[],this.render();return}if(l){this.triggerError("这是折笔哦，请顺着光球转弯滑行！"),this.userCurrentPath=[],this.render();return}if(a){if(this.completedStrokes.push(t),this.currentStrokeIndex++,this.userCurrentPath=[],this.errorWarning="",$.playSuccessSound(),t.name&&$.speakPriority(t.name,{kind:"char",priority:1}),this.onStrokeComplete)try{this.onStrokeComplete(this.currentStrokeIndex-1,t)}catch(h){}this.currentStrokeIndex>=this.charData.strokes.length&&(this.drawSealStamp=!0,$.playVictoryFanfare(),$.speakPriority(`“${this.charData.char}”字写得真规范！太棒啦！`,{kind:"sentence",emotion:"excited"}),this.onComplete&&(this.completeTimer=setTimeout(()=>this.onComplete(),600)))}else this.triggerError("笔画没写到位哦，再试一次吧！"),this.userCurrentPath=[];this.render()}toggleGridType(){return this.gridType=this.gridType==="mi"?"tian":"mi",this.render(),this.gridType}strokeDirectionValidator(e,t,s=60){if(!e||e.length<3)return!0;const i=e[0],r=e[e.length-1],a=Math.atan2(r.y-i.y,r.x-i.x)*180/Math.PI,o=Math.atan2(t.end.y-t.start.y,t.end.x-t.start.x)*180/Math.PI;if(!this._angleWithin(a,o,s))return!1;if(t.corner){const u=t.corner,h=Math.atan2(u.y-t.start.y,u.x-t.start.x)*180/Math.PI,m=Math.atan2(t.end.y-u.y,t.end.x-u.x)*180/Math.PI;let x=-1,g=1/0;for(let f=0;f<e.length;f++){const v=Math.hypot(e[f].x-u.x,e[f].y-u.y);v<g&&(g=v,x=f)}x<2&&(x=Math.floor(e.length/2));const p=e.slice(0,x+1),y=e.slice(x);if(p.length>=2){const f=Math.atan2(p.at(-1).y-p[0].y,p.at(-1).x-p[0].x)*180/Math.PI;if(!this._angleWithin(f,h,s))return!1}if(y.length>=2){const f=Math.atan2(y.at(-1).y-y[0].y,y.at(-1).x-y[0].x)*180/Math.PI;if(!this._angleWithin(f,m,s))return!1}}let l=0;for(let u=1;u<e.length;u++)l+=Math.hypot(e[u].x-e[u-1].x,e[u].y-e[u-1].y);const c=t.corner?Math.hypot(t.corner.x-t.start.x,t.corner.y-t.start.y)+Math.hypot(t.end.x-t.corner.x,t.end.y-t.corner.y):Math.hypot(t.end.x-t.start.x,t.end.y-t.start.y);return!(c>5&&l>c*2.2)}checkTraceAccuracy(e,t,s=60){if(!e||e.length<2)return!1;const i=this.strokeTolerance||{start:25,end:25},r=Math.hypot(e[0].x-t.start.x,e[0].y-t.start.y)<=(i.start||25),a=Math.hypot(e[e.length-1].x-t.end.x,e[e.length-1].y-t.end.y)<=(i.end||25),o=this.strokeDirectionValidator(e,t,s);return!!(r&&a&&o)}_angleWithin(e,t,s){let i=Math.abs(e-t);return i>180&&(i=360-i),i<s}_avgPathAngle(e){if(!e||e.length<2)return 0;const t=e[0],s=e[e.length-1];return Math.atan2(s.y-t.y,s.x-t.x)*180/Math.PI}triggerError(e){this.errorWarning=e,$.playSoftError(),this.render(),this.errorTimer&&clearTimeout(this.errorTimer),this.errorTimer=setTimeout(()=>{this.errorWarning="",this.render()},2e3)}startGuideAnimation(){this.animGuideTimer&&cancelAnimationFrame(this.animGuideTimer);const e=()=>{this.isDestroyed||(this.isDemonstrating||(this.guideProgress=(this.guideProgress+.015)%1,this.render()),this.animGuideTimer=requestAnimationFrame(e))};this.animGuideTimer=requestAnimationFrame(e)}reset(){this.currentStrokeIndex=0,this.completedStrokes=[],this.userCurrentPath=[],this.errorWarning="",this.drawSealStamp=!1,this.render()}render(){const e=this.ctx,t=this.width,s=this.height;if(e.clearRect(0,0,t,s),this.drawGrid(e,t,s),e.lineCap="round",e.lineJoin="round",this.charData.strokes.forEach((i,r)=>{const a=this.isDemonstrating?r<(this.demoPos?this.demoPos.strokeIdx:this.completedStrokes.length):r<this.currentStrokeIndex,o=this.isDemonstrating?this.demoPos&&r===this.demoPos.strokeIdx:r===this.currentStrokeIndex;this.freeWriteMode&&!this.isPeeking&&!this.isDemonstrating&&!a||(e.save(),e.lineWidth=18,a?(e.strokeStyle="#FF6B00",e.shadowColor="rgba(255, 107, 0, 0.4)",e.shadowBlur=8):o?e.strokeStyle="#FFE0B2":e.strokeStyle="#EDE7F6",this.renderStrokePath(e,i,t,s),e.stroke(),e.restore())}),this.isDemonstrating&&this.demoPos){const i=this.demoPos.stroke,r=this.demoPos.progress;e.save(),e.lineWidth=18,e.strokeStyle="#E64A19",e.shadowColor="rgba(230, 74, 25, 0.6)",e.shadowBlur=10,e.lineCap="round",e.lineJoin="round",e.beginPath();const a=i.start.x/100*t,o=i.start.y/100*s;if(e.moveTo(a,o),i.corner){const l=i.corner.x/100*t,c=i.corner.y/100*s;r<=.5?e.lineTo(this.demoPos.x,this.demoPos.y):(e.lineTo(l,c),e.lineTo(this.demoPos.x,this.demoPos.y))}else e.lineTo(this.demoPos.x,this.demoPos.y);e.stroke(),e.fillStyle="#FFD600",e.shadowColor="#FF6D00",e.shadowBlur=16,e.beginPath(),e.arc(this.demoPos.x,this.demoPos.y,11,0,Math.PI*2),e.fill(),e.fillStyle="#C62828",e.font="bold 13px sans-serif",e.textAlign="center",e.fillText(`示范第 ${this.demoPos.strokeIdx+1} / ${this.charData.strokes.length} 笔: ${i.name||""}`,t/2,28),e.restore()}if(this.userCurrentPath.length>1){e.save(),e.strokeStyle="#FF9100",e.shadowColor="rgba(255, 145, 0, 0.4)",e.shadowBlur=6,e.lineCap="round",e.lineJoin="round";for(let i=1;i<this.userCurrentPath.length;i++){const r=this.userCurrentPath[i-1],a=this.userCurrentPath[i],o=r.x/100*t,l=r.y/100*s,c=a.x/100*t,u=a.y/100*s;e.lineWidth=a.w||18,e.beginPath(),e.moveTo(o,l),e.lineTo(c,u),e.stroke()}e.restore()}if(!this.isDemonstrating&&(!this.freeWriteMode||this.isPeeking)&&this.currentStrokeIndex<this.charData.strokes.length){const i=this.charData.strokes[this.currentStrokeIndex];this.drawGuideOrb(e,i,t,s)}this.errorWarning&&(e.save(),e.fillStyle="#FF3D00",e.font="bold 15px sans-serif",e.textAlign="center",e.fillText(this.errorWarning,t/2,s-14),e.restore()),this.drawSealStamp&&this.drawCinnabarSeal(e,t,s)}drawCinnabarSeal(e,t,s){e.save();const i=Math.min(t,s)*.22,r=t-i-24,a=s-i-24;e.translate(r+i/2,a+i/2),e.rotate(-.06),e.fillStyle="rgba(198, 40, 40, 0.92)",e.shadowColor="rgba(198, 40, 40, 0.4)",e.shadowBlur=8,e.beginPath(),typeof e.roundRect=="function"?e.roundRect(-i/2,-i/2,i,i,8):e.rect(-i/2,-i/2,i,i),e.fill(),e.strokeStyle="#FFF8E1",e.lineWidth=1.5,e.beginPath(),typeof e.roundRect=="function"?e.roundRect(-i/2+3,-i/2+3,i-6,i-6,6):e.rect(-i/2+3,-i/2+3,i-6,i-6),e.stroke(),e.fillStyle="#FFF8E1",e.font=`bold ${Math.round(i*.32)}px "Songti SC", "SimSun", serif`,e.textAlign="center",e.textBaseline="middle",e.fillText("妙笔",0,-i*.18),e.fillText("生花",0,i*.2),e.restore()}drawGrid(e,t,s){e.save(),e.fillStyle="#FCFBF8",e.fillRect(0,0,t,s),e.strokeStyle="#C62828",e.lineWidth=2.5,e.strokeRect(8,8,t-16,s-16),e.strokeStyle="rgba(198, 40, 40, 0.3)",e.lineWidth=1,e.strokeRect(12,12,t-24,s-24);const i=14;e.strokeStyle="#C62828",e.lineWidth=2,e.beginPath(),e.moveTo(16,16+i),e.lineTo(16,16),e.lineTo(16+i,16),e.moveTo(t-16-i,16),e.lineTo(t-16,16),e.lineTo(t-16,16+i),e.moveTo(16,s-16-i),e.lineTo(16,s-16),e.lineTo(16+i,s-16),e.moveTo(t-16-i,s-16),e.lineTo(t-16,s-16),e.lineTo(t-16,s-16-i),e.stroke(),e.setLineDash([6,6]),e.strokeStyle="#EF9A9A",e.lineWidth=1.5,e.beginPath(),e.moveTo(t/2,12),e.lineTo(t/2,s-12),e.moveTo(12,s/2),e.lineTo(t-12,s/2),this.gridType==="mi"&&(e.moveTo(12,12),e.lineTo(t-12,s-12),e.moveTo(t-12,12),e.lineTo(12,s-12)),e.stroke(),e.setLineDash([]),e.strokeStyle="#D32F2F",e.lineWidth=1.5,e.beginPath(),e.moveTo(t/2-6,s/2),e.lineTo(t/2+6,s/2),e.moveTo(t/2,s/2-6),e.lineTo(t/2,s/2+6),e.stroke(),e.restore()}renderStrokePath(e,t,s,i){e.beginPath();const r=t.start.x/100*s,a=t.start.y/100*i,o=t.end.x/100*s,l=t.end.y/100*i;if(e.moveTo(r,a),t.corner){const c=t.corner.x/100*s,u=t.corner.y/100*i;e.lineTo(c,u)}e.lineTo(o,l)}drawGuideOrb(e,t,s,i){const r=t.start.x/100*s,a=t.start.y/100*i;e.save(),e.fillStyle="#00E676",e.shadowColor="#00E676",e.shadowBlur=12,e.beginPath(),e.arc(r,a,9,0,Math.PI*2),e.fill();let o=r,l=a;if(t.corner){const c=t.corner.x/100*s,u=t.corner.y/100*i,h=t.end.x/100*s,m=t.end.y/100*i;if(this.guideProgress<.5){const x=this.guideProgress*2;o=r+(c-r)*x,l=a+(u-a)*x}else{const x=(this.guideProgress-.5)*2;o=c+(h-c)*x,l=u+(m-u)*x}}else{const c=t.end.x/100*s,u=t.end.y/100*i;o=r+(c-r)*this.guideProgress,l=a+(u-a)*this.guideProgress}e.fillStyle="#FFD600",e.shadowColor="#FFAB00",e.shadowBlur=16,e.beginPath(),e.arc(o,l,8,0,Math.PI*2),e.fill(),e.restore()}}const j={line_horizontal:[{x:15,y:50},{x:35,y:50},{x:55,y:50},{x:75,y:50},{x:90,y:50}],line_vertical:[{x:50,y:15},{x:50,y:35},{x:50,y:55},{x:50,y:75},{x:50,y:90}],line_diagonal_down:[{x:15,y:15},{x:33,y:33},{x:50,y:50},{x:67,y:67},{x:85,y:85}],line_diagonal_up:[{x:15,y:85},{x:33,y:67},{x:50,y:50},{x:67,y:33},{x:85,y:15}],line_wave:(()=>{const n=[];for(let e=0;e<=24;e++){const t=10+e/24*80,s=50+Math.sin(e/24*Math.PI*5)*25;n.push({x:t,y:s})}return n})(),circle:(()=>{const n=[];for(let e=0;e<=36;e++){const t=e/36*Math.PI*2;n.push({x:50+Math.cos(t)*35,y:50+Math.sin(t)*35})}return n})(),square:[{x:20,y:20},{x:40,y:20},{x:60,y:20},{x:80,y:20},{x:80,y:40},{x:80,y:60},{x:80,y:80},{x:60,y:80},{x:40,y:80},{x:20,y:80},{x:20,y:60},{x:20,y:40},{x:20,y:20}],triangle:[{x:50,y:15},{x:60,y:32},{x:70,y:49},{x:80,y:66},{x:85,y:82},{x:65,y:82},{x:45,y:82},{x:25,y:82},{x:35,y:66},{x:45,y:49},{x:50,y:15}],spiral:(()=>{const n=[];for(let e=0;e<=72;e++){const t=e/72*Math.PI*6,s=5+e/72*40;n.push({x:50+Math.cos(t)*s,y:50+Math.sin(t)*s})}return n})()},H={3:["line_horizontal","line_vertical","line_wave","circle"],4:["line_horizontal","line_vertical","line_diagonal_down","line_wave","circle","square"],5:["line_horizontal","line_vertical","line_diagonal_down","line_diagonal_up","line_wave","circle","square","triangle"],6:["line_diagonal_down","line_diagonal_up","line_wave","circle","square","triangle","spiral"],7:["line_diagonal_down","line_diagonal_up","line_wave","circle","spiral"]},B={line_horizontal:"小勇士！请用手指画一条从左到右的长直线～",line_vertical:"从上往下画一条直直的竖线吧！",line_diagonal_down:"从左上斜斜地滑到右下，像滑梯一样～",line_diagonal_up:"从右下往上斜着爬，像上山坡啦！",line_wave:"画一条弯弯的波浪线，像小河一样～",circle:"画一个大大的圆圈，像太阳一样圆！",square:"画一个方方的框框，像电视机一样～",triangle:"画一个尖尖的三角，像小山峰！",spiral:"从里向外慢慢绕，像小蜗牛的壳！"},se={line_horizontal:"从左边出发，手指轻轻向右滑，像小火车走平路！",line_vertical:"从上面出发，手指慢慢往下滑，像小雨滴落下来！",line_diagonal_down:"从左上角出发，斜斜地往右下滑，像从滑梯上溜下来！",line_diagonal_up:"从右下角出发，斜斜地往左上爬，像小蚂蚁爬山坡！",line_wave:"手指跟着光球，一上一下画波浪，像大海的小波纹！",circle:"从顶部出发，顺时针画一个大圆圈，转一圈回到起点！",square:"先往右，再往下，再往左，最后往上，画一个方方的框！",triangle:"从顶点出发，先往右下，再往左，最后斜着回到顶点！",spiral:"从中心出发，慢慢往外绕，像小蜗牛壳一圈一圈展开！"};class ie{constructor(e,t={}){this.canvas=e,this.ctx=e.getContext("2d"),this.mode=t.mode||"trace",this.onComplete=t.onComplete||(()=>{}),this.onAllComplete=t.onAllComplete||(()=>{}),this.enableGripGuide=t.enableGripGuide!==!1,this.age=C.getAge(),this.tolerance=this._toleranceForAge(this.age),this.targetProgressRatio=.6+Math.min(.2,this.age*.03),this.age<=6?(this.inputMode="finger",this.touchTargetScale=1.4,this.traceTolerance=.35):(this.inputMode="stylus",this.touchTargetScale=1,this.traceTolerance=.2),this.isDestroyed=!1,this.isDrawing=!1,this.userPath=[],this.currentShapeIdx=0,this.shapes=this._selectShapes(),this.shapeProgress=new Array(this.shapes.length).fill(0),this.demoPhase=!1,this.demoTimer=null,this.demoPos=null,this._resizeObserver=null,this._guideProgress=0,this._animTimer=null,this._initCanvas(),this._bindEvents(),this._initResizeObserver(),this.render(),this._speakHint(),this._startDemoAnimation()}_toleranceForAge(e){return Math.max(25,48-e*3)}_selectShapes(){const t=[...H[Math.min(this.age,7)]||H[6]].sort(()=>Math.random()-.5);return t.slice(0,Math.min(3,t.length))}_initCanvas(){const e=window.devicePixelRatio||1,t=this.canvas.getBoundingClientRect();this.width=t.width||360,this.height=t.height||360,this.canvas.width=this.width*e,this.canvas.height=this.height*e,this.ctx.scale(e,e)}_initResizeObserver(){typeof ResizeObserver!="undefined"&&(this._resizeObserver=new ResizeObserver(()=>{this._initCanvas(),this.render()}),this._resizeObserver.observe(this.canvas.parentElement||this.canvas))}_bindEvents(){this._onDown=this._onPointerDown.bind(this),this._onMove=this._onPointerMove.bind(this),this._onUp=this._onPointerUp.bind(this),this.canvas.addEventListener("mousedown",this._onDown),window.addEventListener("mousemove",this._onMove),window.addEventListener("mouseup",this._onUp),this.canvas.addEventListener("touchstart",this._onDown,{passive:!1}),window.addEventListener("touchmove",this._onMove,{passive:!1}),window.addEventListener("touchend",this._onUp)}destroy(){this.isDestroyed=!0,this.canvas.removeEventListener("mousedown",this._onDown),window.removeEventListener("mousemove",this._onMove),window.removeEventListener("mouseup",this._onUp),this.canvas.removeEventListener("touchstart",this._onDown),window.removeEventListener("touchmove",this._onMove),window.removeEventListener("touchend",this._onUp),this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null),this.demoTimer&&cancelAnimationFrame(this.demoTimer),this._animTimer&&cancelAnimationFrame(this._animTimer)}_densify(e,t=.5){const s=[];for(let i=0;i<e.length-1;i++){const r=e[i],a=e[i+1],o=a.x-r.x,l=a.y-r.y,c=Math.hypot(o,l),u=Math.max(1,Math.ceil(c/t));for(let h=0;h<u;h++)s.push({x:r.x+o*(h/u),y:r.y+l*(h/u)})}return s.push(e[e.length-1]),s}_getDensePath(e){return this._denseCache||(this._denseCache={}),this._denseCache[e]||(this._denseCache[e]=this._densify(j[e],.6)),this._denseCache[e]}_normToPx(e,t){return{x:e/100*this.width,y:t/100*this.height}}_pxToNorm(e,t){return{x:e/this.width*100,y:t/this.height*100}}_getEventNorm(e){const t=this.canvas.getBoundingClientRect(),s=e.touches?e.touches[0]:e;return this._pxToNorm(s.clientX-t.left,s.clientY-t.top)}_onPointerDown(e){e.preventDefault(),this.demoPhase&&this._stopDemo(),this.userPath.length>2&&(this.userPath=[]),this.isDrawing=!0;const t=this._getEventNorm(e);this.userPath.push(t),this.render()}_onPointerMove(e){if(!this.isDrawing)return;e.preventDefault();const t=this._getEventNorm(e),s=this.userPath[this.userPath.length-1];(!s||Math.hypot(t.x-s.x,t.y-s.y)>.5)&&(this.userPath.push(t),this.render())}_onPointerUp(e){var r,a,o,l,c,u,h,m,x,g;if(!this.isDrawing)return;this.isDrawing=!1;const t=this.shapes[this.currentShapeIdx],s=this._getDensePath(t),i=this._computeCoverage(s,this.userPath);if(this.shapeProgress[this.currentShapeIdx]=i,i>=this.targetProgressRatio){if((a=(r=d).playSuccessSound)==null||a.call(r),(c=(l=d).speakPriority)==null||c.call(l,`太棒啦！${((o=B[t])==null?void 0:o.split("～")[0])||"画得真好"}真厉害！`,{kind:"char",priority:1}),(u=this.onComplete)==null||u.call(this,this.currentShapeIdx,i),this.currentShapeIdx++,this.userPath=[],this.currentShapeIdx>=this.shapes.length){this._finishAll();return}this._speakHint(),this._startDemoAnimation()}else(m=(h=d).playSoftError)==null||m.call(h),(g=(x=d).speakPriority)==null||g.call(x,"再试一次吧，勇敢的小手指！",{kind:"char",priority:1}),this.userPath=[];this.render()}_computeCoverage(e,t){if(t.length<2)return 0;const s=this.tolerance*(this.touchTargetScale||1);let i=0;const r=Math.max(1,Math.floor(e.length/60));for(let a=0;a<e.length;a+=r){const o=e[a];let l=!1;const c=Math.max(1,Math.floor(t.length/80));for(let u=0;u<t.length&&!l;u+=c){const h=t[u];Math.hypot(o.x-h.x,o.y-h.y)<=s&&(l=!0)}l&&i++}return i/Math.ceil(e.length/r)}_speakHint(){var s,i;const e=this.shapes[this.currentShapeIdx],t=B[e];t&&((i=(s=d).speakPriority)==null||i.call(s,t,{kind:"sentence",emotion:"gentle"}))}_startDemoAnimation(e){if(this.demoTimer&&cancelAnimationFrame(this.demoTimer),this.currentShapeIdx>=this.shapes.length)return;this.demoPhase=!0;const t=this.shapes[this.currentShapeIdx],s=j[t];if(!s||s.length<2){this.demoPhase=!1;return}let i=0;const r=1/108,a=()=>{var x,g;if(this.isDestroyed||!this.demoPhase)return;if(i+=r,i>=1){const p=s[s.length-1];this.demoPos={x:p.x,y:p.y},this._guideProgress=1,this.render(),this.demoPhase=!1,this.demoTimer=null,(g=(x=d).speakPriority)==null||g.call(x,"好了！现在换你来画，跟着虚线试试看！",{kind:"sentence",emotion:"gentle"}),typeof e=="function"&&e();return}const o=s.length-1,l=i*o,c=Math.min(o-1,Math.floor(l)),u=l-c,h=s[c],m=s[Math.min(s.length-1,c+1)];this.demoPos={x:h.x+(m.x-h.x)*u,y:h.y+(m.y-h.y)*u},this._guideProgress=i,this.render(),this.demoTimer=requestAnimationFrame(a)};this.demoTimer=requestAnimationFrame(a)}_stopDemo(){this.demoPhase=!1,this.demoTimer&&(cancelAnimationFrame(this.demoTimer),this.demoTimer=null),this.render()}animateStrokeGesture(e){var i,r;const t=this.shapes[this.currentShapeIdx],s=se[t];s&&((r=(i=d).speakPriority)==null||r.call(i,s,{kind:"sentence",emotion:"gentle"})),setTimeout(()=>{this.isDestroyed||this._startDemoAnimation()},400)}_getGestureHint(e){return{line_horizontal:"从左向右轻轻滑动，像画一条小河",line_vertical:"从上往下直直画，像小雨滴落下来",line_diagonal_down:"从左上往右下斜斜滑，像滑滑梯",circle:"顺时针转一圈，画个大皮球",square:"先往右再往下折，像个小山折角",triangle:"三条边画出小山峰",line_wave:"一上一下画波浪，像大海的小波纹",line_diagonal_up:"从右下往左上爬，像爬山坡",spiral:"从中心往外绕，像小蜗牛壳"}[e]||"跟着光球画一画"+(e||"形状")+"吧！"}_finishAll(){var e;this.demoPhase=!1,this.demoTimer&&cancelAnimationFrame(this.demoTimer),this.render(),(e=this.onAllComplete)==null||e.call(this)}render(){const e=this.ctx,t=this.width,s=this.height;if(!(!t||!s)){if(e.clearRect(0,0,t,s),e.fillStyle="#FFF8E7",e.fillRect(0,0,t,s),this._drawBackgroundGrid(e,t,s),this.currentShapeIdx<this.shapes.length){const i=this.shapes[this.currentShapeIdx],r=j[i];r&&this._drawTargetPath(e,r,t,s);for(let a=0;a<this.currentShapeIdx;a++){const o=j[this.shapes[a]];o&&this._drawCompletedPath(e,o,t,s)}}if(this.demoPhase&&this.demoPos){const{x:i,y:r}=this._normToPx(this.demoPos.x,this.demoPos.y);e.save(),e.fillStyle="#FFD600",e.shadowColor="#FFAB00",e.shadowBlur=18,e.beginPath(),e.arc(i,r,10,0,Math.PI*2),e.fill(),e.restore()}if(this.userPath.length>1){e.save(),e.strokeStyle="#FF9100",e.lineCap="round",e.lineJoin="round",e.lineWidth=14,e.shadowColor="rgba(255,145,0,0.4)",e.shadowBlur=6,e.beginPath();for(let i=0;i<this.userPath.length;i++){const{x:r,y:a}=this._normToPx(this.userPath[i].x,this.userPath[i].y);i===0?e.moveTo(r,a):e.lineTo(r,a)}e.stroke(),e.restore()}this.enableGripGuide&&!this._gripShown&&this._drawGripHint(e,t,s)}}_drawBackgroundGrid(e,t,s){e.save(),e.strokeStyle="rgba(200,120,100,0.18)",e.lineWidth=1,e.setLineDash([6,6]),e.strokeRect(10,10,t-20,s-20),e.beginPath(),e.moveTo(t/2,10),e.lineTo(t/2,s-10),e.moveTo(10,s/2),e.lineTo(t-10,s/2),e.stroke(),e.setLineDash([]),e.restore()}_drawTargetPath(e,t,s,i){e.save(),e.strokeStyle="rgba(255,140,0,0.4)",e.lineCap="round",e.lineJoin="round",e.lineWidth=10,e.setLineDash([10,8]),e.beginPath();for(let u=0;u<t.length;u++){const{x:h,y:m}=this._normToPx(t[u].x,t[u].y);u===0?e.moveTo(h,m):e.lineTo(h,m)}e.stroke();const{x:r,y:a}=this._normToPx(t[0].x,t[0].y);e.setLineDash([]),e.fillStyle="#00C853",e.shadowColor="#00C853",e.shadowBlur=10,e.beginPath(),e.arc(r,a,6,0,Math.PI*2),e.fill();const o=t[t.length-1],{x:l,y:c}=this._normToPx(o.x,o.y);e.fillStyle="#E53935",e.shadowBlur=0,e.beginPath(),e.moveTo(l+2,c-10),e.lineTo(l+14,c-6),e.lineTo(l+2,c-2),e.closePath(),e.fill(),e.strokeStyle="#7B1FA2",e.lineWidth=2,e.beginPath(),e.moveTo(l+2,c-10),e.lineTo(l+2,c+4),e.stroke(),e.restore()}_drawCompletedPath(e,t,s,i){e.save(),e.strokeStyle="rgba(76,175,80,0.55)",e.lineCap="round",e.lineJoin="round",e.lineWidth=8,e.setLineDash([4,4]),e.beginPath();for(let r=0;r<t.length;r++){const{x:a,y:o}=this._normToPx(t[r].x,t[r].y);r===0?e.moveTo(a,o):e.lineTo(a,o)}e.stroke(),e.restore()}_drawGripHint(e,t,s){e.save();const i=t-120,r=s-60;e.fillStyle="rgba(255,255,255,0.92)",e.strokeStyle="#FF8A65",e.lineWidth=2,e.beginPath(),typeof e.roundRect=="function"?e.roundRect(i,r,110,48,10):e.rect(i,r,110,48),e.fill(),e.stroke(),e.fillStyle="#E64A19",e.font="bold 11px sans-serif",e.textAlign="left",e.fillText("[笔] 用三根手指",i+8,r+18),e.fillText("轻轻握住笔哦～",i+8,r+34),e.restore(),this._gripShown=!0}reset(){this.userPath=[],this.render()}skipCurrent(){if(this.shapeProgress[this.currentShapeIdx]=.5,this.currentShapeIdx++,this.userPath=[],this._stopDemo(),this.currentShapeIdx>=this.shapes.length){this._finishAll();return}this._speakHint(),this._startDemoAnimation()}getProgress(){if(this.shapes.length===0)return 1;const e=this.shapeProgress.reduce((t,s)=>t+s,0);return Math.min(1,e/this.shapes.length)}getCurrentShapeName(){const e=this.shapes[this.currentShapeIdx];return{line_horizontal:"横线",line_vertical:"竖线",line_diagonal_down:"捺斜",line_diagonal_up:"撇斜",line_wave:"波浪线",circle:"圆圈",square:"方框",triangle:"三角",spiral:"螺旋"}[e]||"形状"}getTotalShapes(){return this.shapes.length}getCurrentShapeNumber(){return Math.min(this.currentShapeIdx+1,this.shapes.length)}}class re{constructor(e,t,s){this.container=e,this.charData=t,this.onComplete=s,this.isCompleted=!1,this.cleanups=[],this.rubbedPoints=0,this.targetRubCount=35,this.isDestroyed=!1,this.timers=[]}_timeout(e,t){const s=setTimeout(()=>{this.isDestroyed||e()},t);return this.timers.push(s),s}mount(){const e=this.charData;this.container.innerHTML=`
      <div class="relative w-full h-full flex flex-col items-center justify-between p-4 select-none overflow-hidden animate-fade-in">
        
        <div class="z-20 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border-2 border-amber-300 shadow-2xl flex items-center gap-2">
          <span class="flex items-center text-yellow-300 animate-pulse">${b.sparkle("w-5 h-5")}</span>
          <span class="text-sm sm:text-base font-black text-yellow-200">用小手指擦一擦云雾，寻找神奇汉字！</span>
        </div>

        <div id="rub-stage-box" class="relative w-72 h-72 sm:w-88 sm:h-88 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-[0_16px_50px_rgba(245,158,11,0.6)] my-auto bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center">
          
          <div id="rub-reveal-target" class="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div id="rub-god-rays" class="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full bg-gradient-to-tr from-amber-300/30 via-yellow-200/40 to-orange-400/30 animate-spin-slow pointer-events-none opacity-0 transition-opacity duration-700"></div>

            <div class="relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-white/95 shadow-[0_20px_50px_rgba(245,158,11,0.6)] flex flex-col items-center justify-center border-4 border-amber-300 transform scale-95 transition-transform duration-500">
              <span class="text-sm font-black text-amber-700">${e.pinyin}</span>
              <span class="text-7xl sm:text-8xl font-black text-amber-950 font-serif leading-none drop-shadow">${e.char}</span>
            </div>
            <span class="relative z-10 text-xs font-black text-white mt-3 bg-black/50 px-4 py-1.5 rounded-full border border-white/30 shadow-md">
              ${e.oracleGlyph?`象形源起: ${e.oracleGlyph}`:`生字本源: ${e.char}`}
            </span>
          </div>

          <canvas id="rub-canvas" class="absolute inset-0 w-full h-full cursor-pointer touch-none z-10"></canvas>

          <div id="rub-hand-guide" class="absolute z-20 pointer-events-none animate-bounce-slow flex flex-col items-center">
            <div class="w-14 h-14 rounded-full bg-yellow-400/90 border-2 border-white shadow-2xl flex items-center justify-center">
              ${b.brush("w-8 h-8")}
            </div>
            <span class="text-xs font-black text-white bg-black/60 px-3 py-0.5 rounded-full mt-1">划动擦除</span>
          </div>

          <div id="rub-burst-overlay" class="absolute inset-0 bg-yellow-200 pointer-events-none opacity-0 z-30 transition-opacity duration-500"></div>

        </div>

        <div class="z-20 w-full max-w-xs bg-black/40 backdrop-blur-md p-2.5 rounded-2xl border-2 border-white/20 flex items-center gap-3 shadow-xl">
          <span class="text-xs font-black text-yellow-300 shrink-0">擦除进度</span>
          <div class="flex-1 h-3.5 bg-white/20 rounded-full overflow-hidden p-0.5">
            <div id="rub-progress-bar" class="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-200 shadow-[0_0_10px_rgba(255,235,59,0.8)]" style="width: 0%;"></div>
          </div>
        </div>

      </div>
    `,d.speakPriority(`用小手指擦一擦云雾，寻找“${e.char}”字！`,{kind:"sentence",priority:1}),this._initCanvas()}_initCanvas(){const e=this.container.querySelector("#rub-canvas"),t=this.container.querySelector("#rub-stage-box"),s=this.container.querySelector("#rub-hand-guide"),i=this.container.querySelector("#rub-progress-bar"),r=this.container.querySelector("#rub-burst-overlay");if(!e||!t)return;const a=t.clientWidth||320,o=t.clientHeight||320;e.width=a,e.height=o;const l=e.getContext("2d");if(!l)return;const c=l.createLinearGradient(0,0,a,o);c.addColorStop(0,"#334155"),c.addColorStop(.5,"#475569"),c.addColorStop(1,"#1e293b"),l.fillStyle=c,l.fillRect(0,0,a,o),l.fillStyle="rgba(255, 255, 255, 0.25)";for(let p=0;p<18;p++){l.beginPath();const y=p*53%a,f=p*71%o;l.arc(y,f,38,0,Math.PI*2),l.fill()}let u=!1;const h=(p,y)=>{if(this.isCompleted)return;const f=e.getBoundingClientRect(),v=p-f.left,w=y-f.top;l.globalCompositeOperation="destination-out",l.beginPath(),l.arc(v,w,32,0,Math.PI*2),l.fill(),s&&!s.classList.contains("hidden")&&s.classList.add("hidden"),this.rubbedPoints++;const k=Math.max(1,this.targetRubCount||1),S=Math.min(100,Math.round(this.rubbedPoints/k*100));if(i&&(i.style.width=`${S}%`),this.rubbedPoints%3===0&&typeof document!="undefined"){const T=document.createElement("div");T.className="fixed pointer-events-none rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(255,235,59,1)] z-50 animate-ping",T.style.width="14px",T.style.height="14px",T.style.left=`${p-7}px`,T.style.top=`${y-7}px`,document.body.appendChild(T),this.timers.push(setTimeout(()=>{try{T.remove()}catch(A){}},350))}this.rubbedPoints%6===0&&d.playPop(),this.rubbedPoints>=this.targetRubCount&&!this.isCompleted&&(this.isCompleted=!0,this._triggerVictory(e,r))},m=p=>{u=!0,h(p.clientX,p.clientY)},x=p=>{u&&h(p.clientX,p.clientY)},g=()=>{u=!1};e.addEventListener("pointerdown",m),window.addEventListener("pointermove",x),window.addEventListener("pointerup",g),this.cleanups.push(()=>{e.removeEventListener("pointerdown",m),window.removeEventListener("pointermove",x),window.removeEventListener("pointerup",g)})}_triggerVictory(e,t){d.playVictoryFanfare(),d.triggerConfetti(this.container);const s=this.container.querySelector("#rub-god-rays");s&&(s.classList.remove("opacity-0"),s.classList.add("opacity-100")),e&&(e.style.transition="opacity 0.6s ease-out",e.style.opacity="0",this._timeout(()=>e.remove(),600)),t&&(t.style.opacity="0.9",this._timeout(()=>{t.style.opacity="0"},500));const i=this.charData;d.speakPriority(`太棒啦！云雾散开，露出了“${i.char}”字！`,{kind:"sentence",priority:1}),this._timeout(()=>{!this.isDestroyed&&typeof this.onComplete=="function"&&this.onComplete()},1200)}destroy(){this.isDestroyed=!0,this.timers.forEach(e=>clearTimeout(e)),this.timers=[],this.cleanups.forEach(e=>e()),this.cleanups=[]}}class ne{constructor(e,t,s){this.container=e,this.charData=t,this.onComplete=s,this.isCompleted=!1,this.cleanups=[],this.fedCount=0,this.targetFeedCount=2,this.isDestroyed=!1,this.timers=[]}_timeout(e,t){const s=setTimeout(()=>{this.isDestroyed||e()},t);return this.timers.push(s),s}mount(){const e=this.charData,s={鱼:["鲜美金枪鱼","香烤小黄鱼"],肉:["大鸡腿","香嫩肉丸"],水:["清澈甘泉","纯净水滴"],果:["红苹果","甜橙子"],瓜:["香甜西瓜","小黄瓜"],米:["香喷喷米饭","海苔饭团"],包:["热气腾腾包子","美味汉堡"],喝:["鲜榨果汁","纯牛奶"],吃:["甜甜饼干","美味甜点"]}[e.char]||["美味甜心","金色能量果"];this.container.innerHTML=`
      <div class="relative w-full h-full flex flex-col items-center justify-between p-4 select-none overflow-hidden">
        
        <div class="z-20 bg-black/60 backdrop-blur-md px-6 py-2.5 rounded-full border-2 border-pink-300 shadow-2xl flex items-center gap-2">
          <span class="flex items-center text-pink-300 animate-pulse">${b.sparkle("w-5 h-5")}</span>
          <span class="text-xs sm:text-sm font-black text-pink-100">小怪兽肚子咕咕叫啦，快把美味拖到大嘴巴里！</span>
        </div>

        <div class="relative w-full max-w-lg flex-1 flex flex-col items-center justify-center my-2">
          
          <div id="feed-creature-body" class="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 border-4 border-white shadow-[0_16px_48px_rgba(244,63,94,0.5)] flex flex-col items-center justify-center transition-all duration-300">
            
            <div id="feed-eyes" class="flex items-center gap-6 mb-2">
              <div class="w-10 h-10 rounded-full bg-white border-2 border-pink-900 flex items-center justify-center shadow-md">
                <div id="feed-pupil-1" class="w-4 h-4 rounded-full bg-pink-950 animate-bounce-slow"></div>
              </div>
              <div class="w-10 h-10 rounded-full bg-white border-2 border-pink-900 flex items-center justify-center shadow-md">
                <div id="feed-pupil-2" class="w-4 h-4 rounded-full bg-pink-950 animate-bounce-slow"></div>
              </div>
            </div>

            <div id="feed-creature-mouth" class="w-28 h-20 sm:w-32 sm:h-24 rounded-3xl bg-pink-950 border-4 border-white shadow-inner flex items-center justify-center transition-transform duration-200">
              <span id="feed-mouth-inner-text" class="text-xs font-black text-pink-300">快喂我！</span>
            </div>

            <div id="feed-heart-layer" class="absolute -top-8 flex items-center gap-2 pointer-events-none opacity-0 transition-all duration-300 transform scale-50">
              <span class="flex items-center text-amber-300 animate-bounce">${b.coin("w-8 h-8")}</span>
              <span class="flex items-center text-pink-300 animate-bounce delay-100">${b.star("w-8 h-8",!1)}</span>
            </div>

          </div>

          <div class="w-full mt-6 flex items-center justify-around gap-4 z-20">
            <div id="food-item-1" class="draggable-food w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border-4 border-amber-400 shadow-xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform touch-none select-none">
              <div class="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shadow-inner">
                ${b.sparkle("w-8 h-8")}
              </div>
              <span class="text-xs font-black text-amber-950 mt-1">${s[0]}</span>
            </div>

            <div id="food-item-2" class="draggable-food w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border-4 border-orange-400 shadow-xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform touch-none select-none">
              <div class="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shadow-inner">
                ${b.gem("w-8 h-8")}
              </div>
              <span class="text-xs font-black text-orange-950 mt-1">${s[1]}</span>
            </div>
          </div>

        </div>

        <div class="z-20 w-full max-w-xs bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex items-center gap-3">
          <span class="text-xs font-black text-pink-300 shrink-0">饱腹能量</span>
          <div class="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
            <div id="feed-progress-bar" class="h-full bg-gradient-to-r from-pink-400 to-amber-300 rounded-full transition-all duration-200" style="width: 0%;"></div>
          </div>
        </div>

      </div>
    `,d.speakPriority("小怪兽肚子饿啦，快把美味拖到大嘴巴里！",{kind:"sentence",priority:1}),this._bindDragEvents()}_bindDragEvents(){const e=this.container.querySelectorAll(".draggable-food"),t=this.container.querySelector("#feed-creature-mouth"),s=this.container.querySelector("#feed-creature-body"),i=this.container.querySelector("#feed-mouth-inner-text"),r=this.container.querySelector("#feed-heart-layer"),a=this.container.querySelector("#feed-progress-bar");e.forEach(o=>{let l=!1,c=0,u=0,h="";const m=p=>{if(this.isCompleted)return;l=!0;const y=p.touches?p.touches[0].clientX:p.clientX,f=p.touches?p.touches[0].clientY:p.clientY;c=y,u=f,h=o.style.transform,o.classList.add("scale-125","z-30","shadow-2xl"),d.playPop(),t&&t.classList.add("scale-125")},x=p=>{if(!l)return;const y=p.touches?p.touches[0].clientX:p.clientX,f=p.touches?p.touches[0].clientY:p.clientY,v=y-c,w=f-u;if(o.style.transform=`translate(${v}px, ${w}px) scale(1.25)`,t){const k=t.getBoundingClientRect(),S=k.left+k.width/2,T=k.top+k.height/2;Math.hypot(y-S,f-T)<130?(t.style.transform="scale(1.35)",i&&(i.textContent="啊——！"),s&&s.classList.add("animate-bounce-slow")):(t.style.transform="scale(1.1)",i&&(i.textContent="快喂我！"),s&&s.classList.remove("animate-bounce-slow"))}},g=p=>{if(!l)return;l=!1;const y=p.changedTouches?p.changedTouches[0].clientX:p.clientX,f=p.changedTouches?p.changedTouches[0].clientY:p.clientY;t&&(t.style.transform="scale(1)");const v=t.getBoundingClientRect();if(y>=v.left-20&&y<=v.right+20&&f>=v.top-20&&f<=v.bottom+20){d.playPop(),d.playSuccess(),this.fedCount++,o.style.transition="transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out",o.style.transform="scale(0)",o.style.opacity="0",this._timeout(()=>o.remove(),350),s&&(s.classList.add("scale-110","rotate-2"),this._timeout(()=>s.classList.remove("scale-110","rotate-2"),400)),i&&(i.textContent="嗷呜~ 咕咚！"),r&&(r.classList.remove("opacity-0","scale-50"),r.classList.add("opacity-100","scale-125","-translate-y-4"),this._timeout(()=>{r.classList.add("opacity-0")},600));const k=Math.max(1,this.targetFeedCount||1),S=Math.min(100,Math.round(this.fedCount/k*100));a&&(a.style.width=`${S}%`),this.fedCount>=this.targetFeedCount&&!this.isCompleted&&(this.isCompleted=!0,this._triggerVictory())}else o.style.transition="transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",o.style.transform=h,o.classList.remove("scale-125","z-30","shadow-2xl")};o.addEventListener("mousedown",m),o.addEventListener("touchstart",m,{passive:!0}),window.addEventListener("mousemove",x),window.addEventListener("touchmove",x,{passive:!0}),window.addEventListener("mouseup",g),window.addEventListener("touchend",g),this.cleanups.push(()=>{o.removeEventListener("mousedown",m),o.removeEventListener("touchstart",m),window.removeEventListener("mousemove",x),window.removeEventListener("touchmove",x),window.removeEventListener("mouseup",g),window.removeEventListener("touchend",g)})})}_triggerVictory(){d.playSuccess(),d.triggerConfetti(this.container);const e=this.container.querySelector("#feed-creature-body"),t=this.charData;e&&(e.innerHTML=`
        <div class="flex flex-col items-center justify-center animate-scale-up">
          <span class="text-xs font-black text-white/90">${t.pinyin}</span>
          <span class="text-8xl sm:text-9xl font-black text-white font-serif leading-none drop-shadow">${t.char}</span>
        </div>
      `),d.speakPriority(`吃得好饱呀！大嘴巴变成了“${t.char}”字！`,{kind:"sentence",priority:1}),this._timeout(()=>{!this.isDestroyed&&typeof this.onComplete=="function"&&this.onComplete()},1300)}destroy(){this.isDestroyed=!0,this.timers.forEach(e=>clearTimeout(e)),this.timers=[],this.cleanups.forEach(e=>e()),this.cleanups=[]}}class oe{constructor(e,t,s){this.container=e,this.charData=t,this.onComplete=s,this.isCompleted=!1,this.cleanups=[],this.isDestroyed=!1,this.timers=[]}_timeout(e,t){const s=setTimeout(()=>{this.isDestroyed||e()},t);return this.timers.push(s),s}mount(){const e=this.charData;this.container.innerHTML=`
      <div class="relative w-full h-full flex flex-col items-center justify-between p-4 select-none overflow-hidden animate-fade-in">
        
        <div class="z-20 bg-black/60 backdrop-blur-md px-6 py-2.5 rounded-full border-2 border-orange-300 shadow-2xl flex items-center gap-2">
          <span class="flex items-center text-orange-300 animate-pulse">${b.sparkle("w-5 h-5")}</span>
          <span class="text-xs sm:text-sm font-black text-orange-100">拉紧金色弹弓，瞄准城堡，松手发射！</span>
        </div>

        <div id="slingshot-arena" class="relative w-full max-w-2xl flex-1 flex items-center justify-between px-6 my-2">
          <canvas id="slingshot-band-canvas" class="absolute inset-0 w-full h-full pointer-events-none z-15"></canvas>
          
          <div class="relative flex flex-col items-center">
            
            <div id="slingshot-frame" class="relative w-28 h-40 flex items-center justify-center">
              
              <div class="absolute bottom-0 w-8 h-24 bg-amber-800 rounded-b-xl border-2 border-amber-950 shadow-md"></div>
              <div id="slingshot-fork-l" class="absolute top-4 left-2 w-5 h-16 bg-amber-700 -rotate-25 rounded-t-xl border border-amber-950"></div>
              <div id="slingshot-fork-r" class="absolute top-4 right-2 w-5 h-16 bg-amber-700 rotate-25 rounded-t-xl border border-amber-950"></div>

              <div id="slingshot-ammo" class="absolute z-20 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 border-4 border-white shadow-[0_0_24px_rgba(245,158,11,0.8)] flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform touch-none select-none">
                <span class="flex items-center text-white pointer-events-none">${b.sparkle("w-8 h-8")}</span>
              </div>

            </div>

            <span class="text-xs font-black text-amber-300 bg-black/40 px-3 py-1 rounded-full mt-2">拉我蓄力</span>

          </div>

          <div id="slingshot-castle" class="relative flex flex-col items-center justify-end h-64 w-48 sm:w-56 transition-all duration-500">
            
            <div class="castle-block w-28 h-12 bg-stone-700 rounded-t-xl border-2 border-stone-500 shadow-md mb-1 flex items-center justify-center text-xs font-black text-amber-200">
              坚固堡垒
            </div>

            <div class="flex items-center gap-1 mb-1">
              <div class="castle-block w-20 h-14 bg-stone-800 rounded-lg border-2 border-stone-600 shadow flex items-center justify-center text-stone-300 text-xs font-black">石块</div>
              <div class="castle-block w-20 h-14 bg-stone-800 rounded-lg border-2 border-stone-600 shadow flex items-center justify-center text-stone-300 text-xs font-black">石块</div>
            </div>

            <div class="flex items-center gap-1">
              <div class="castle-block w-16 h-14 bg-stone-900 rounded-b-lg border-2 border-stone-700 shadow"></div>
              <div class="castle-block w-16 h-14 bg-stone-900 rounded-b-lg border-2 border-stone-700 shadow"></div>
              <div class="castle-block w-16 h-14 bg-stone-900 rounded-b-lg border-2 border-stone-700 shadow"></div>
            </div>

            <div id="slingshot-reveal-char" class="absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none transition-all duration-700 transform scale-50">
              <div class="w-36 h-36 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 border-4 border-white shadow-[0_0_50px_rgba(245,158,11,1)] flex flex-col items-center justify-center text-white">
                <span class="text-xs font-black text-amber-950">${e.pinyin}</span>
                <span class="text-7xl sm:text-8xl font-black font-serif leading-none drop-shadow-lg">${e.char}</span>
              </div>
            </div>

          </div>

        </div>

        <div class="z-20 w-full max-w-xs bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex items-center gap-3">
          <span class="text-xs font-black text-amber-300 shrink-0">拉力蓄能</span>
          <div class="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
            <div id="slingshot-power-bar" class="h-full bg-gradient-to-r from-yellow-400 to-red-500 rounded-full transition-all duration-100" style="width: 0%;"></div>
          </div>
        </div>

      </div>
    `,d.speakPriority("拉紧金色弹弓，瞄准城堡，松手发射！",{kind:"sentence",priority:1}),this._bindSlingshotEvents()}_bindSlingshotEvents(){const e=this.container.querySelector("#slingshot-ammo"),t=this.container.querySelector("#slingshot-power-bar"),s=this.container.querySelector("#slingshot-castle"),i=this.container.querySelector("#slingshot-reveal-char"),r=this.container.querySelector("#slingshot-arena"),a=this.container.querySelector("#slingshot-band-canvas"),o=this.container.querySelector("#slingshot-fork-l"),l=this.container.querySelector("#slingshot-fork-r");if(!e)return;let c=!1,u=0,h=0,m=0;const x=f=>{if(!a||!a.getContext||!r||!o||!l||!f)return;const v=r.getBoundingClientRect();a.width=v.width||640,a.height=v.height||300;const w=a.getContext("2d");w.clearRect(0,0,a.width,a.height);const k=o.getBoundingClientRect(),S=l.getBoundingClientRect(),T=f.getBoundingClientRect(),A=k.left+k.width/2-v.left,z=k.top+4-v.top,Q=S.left+S.width/2-v.left,Z=S.top+4-v.top,q=T.left+T.width/2-v.left,D=T.top+T.height/2-v.top;if(w.strokeStyle="#d97706",w.lineWidth=5,w.lineCap="round",w.beginPath(),w.moveTo(A,z),w.lineTo(q,D),w.stroke(),w.beginPath(),w.moveTo(Q,Z),w.lineTo(q,D),w.stroke(),m>20){w.strokeStyle="rgba(255, 235, 59, 0.7)",w.lineWidth=3,w.setLineDash([6,6]),w.beginPath(),w.moveTo(q,D);const K=q+(A-q)*2.5+260,ee=D+(z-D)*1.5-20;w.lineTo(K,ee),w.stroke(),w.setLineDash([])}};this.timers.push(setTimeout(()=>{this.isDestroyed||x(e)},100));const g=f=>{if(this.isCompleted)return;c=!0;const v=f.touches?f.touches[0].clientX:f.clientX,w=f.touches?f.touches[0].clientY:f.clientY;u=v,h=w,d.playPop()},p=f=>{if(!c)return;const v=f.touches?f.touches[0].clientX:f.clientX,w=f.touches?f.touches[0].clientY:f.clientY,k=Math.min(0,v-u),S=Math.max(0,w-h);m=Math.min(90,Math.sqrt(k*k+S*S)),e.style.transform=`translate(${k*.7}px, ${S*.7}px) scale(1.15)`,x(e);const T=Math.min(100,Math.round(m/60*100));t&&(t.style.width=`${T}%`)},y=()=>{c&&(c=!1,a&&a.getContext&&a.getContext("2d").clearRect(0,0,a.width,a.height),m>=30?(this.isCompleted=!0,d.playWhoosh(),e.style.transition="transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease-out",e.style.transform="translate(360px, -40px) scale(1.8)",e.style.opacity="0",this._timeout(()=>{d.playSuccess(),d.playVictoryFanfare(),d.triggerConfetti(this.container),s.querySelectorAll(".castle-block").forEach((w,k)=>{w.style.transition="transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s ease-out";const S=(k%2===0?-1:1)*(60+k*30),T=60+k*25;w.style.transform=`translate(${S}px, ${T}px) rotate(${S*1.5}deg) scale(0.5)`,w.style.opacity="0"}),i&&(i.classList.remove("opacity-0","scale-50"),i.classList.add("opacity-100","scale-100"));const v=this.charData;d.speakPriority(`轰隆！城堡破开，升起了“${v.char}”字！`,{kind:"sentence",priority:1}),this._timeout(()=>{!this.isDestroyed&&typeof this.onComplete=="function"&&this.onComplete()},1300)},380)):(e.style.transition="transform 0.2s ease-out",e.style.transform="translate(0px, 0px)",t&&(t.style.width="0%"),this._timeout(()=>x(e),220)))};e.addEventListener("mousedown",g),e.addEventListener("touchstart",g,{passive:!0}),window.addEventListener("mousemove",p),window.addEventListener("touchmove",p,{passive:!0}),window.addEventListener("mouseup",y),window.addEventListener("touchend",y),this.cleanups.push(()=>{e.removeEventListener("mousedown",g),e.removeEventListener("touchstart",g),window.removeEventListener("mousemove",p),window.removeEventListener("touchmove",p),window.removeEventListener("mouseup",y),window.removeEventListener("touchend",y)})}destroy(){this.isDestroyed=!0,this.timers.forEach(e=>clearTimeout(e)),this.timers=[],this.cleanups.forEach(e=>e()),this.cleanups=[]}}class ae{constructor(e,t,s){this.container=e,this.charData=t,this.onComplete=s,this.isCompleted=!1,this.cleanups=[],this.waterCount=0,this.targetWaterCount=3,this.isDestroyed=!1,this.timers=[]}_timeout(e,t){const s=setTimeout(()=>{this.isDestroyed||e()},t);return this.timers.push(s),s}mount(){const e=this.charData;this.container.innerHTML=`
      <div class="relative w-full h-full flex flex-col items-center justify-between p-4 select-none overflow-hidden animate-fade-in">
        
        <div class="z-20 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border-2 border-emerald-300 shadow-2xl flex items-center gap-2">
          <span class="flex items-center text-emerald-300 animate-pulse">${b.sparkle("w-5 h-5")}</span>
          <span class="text-sm sm:text-base font-black text-emerald-100">晃动神奇喷壶浇浇水，让小种子快快长大！</span>
        </div>

        <div class="relative w-full max-w-lg flex-1 flex flex-col items-center justify-between my-2">
          
          <div id="sprout-watering-can" class="relative z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-sky-300 border-4 border-white shadow-[0_10px_30px_rgba(20,184,166,0.5)] flex flex-col items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all select-none">
            <span class="flex items-center text-white pointer-events-none">${b.sparkle("w-12 h-12")}</span>
            <span class="text-xs font-black text-cyan-950 mt-1">点我浇水</span>
            
            <div id="sprout-water-drops" class="absolute -bottom-8 flex items-center gap-1.5 opacity-0 transition-opacity">
              <div class="w-3 h-5 bg-cyan-300 rounded-full animate-bounce shadow-sm"></div>
              <div class="w-2.5 h-4 bg-teal-200 rounded-full animate-bounce delay-75 shadow-sm"></div>
              <div class="w-3 h-5 bg-sky-300 rounded-full animate-bounce delay-150 shadow-sm"></div>
            </div>
          </div>

          <div class="relative w-full flex flex-col items-center">
            
            <div id="sprout-plant-tree" class="relative z-10 flex flex-col items-center transition-all duration-700 transform scale-50 origin-bottom">
              
              <div id="sprout-canopy" class="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-emerald-500 via-green-400 to-teal-300 border-4 border-white shadow-[0_0_50px_rgba(16,185,129,0.9)] flex flex-col items-center justify-center text-white transition-all duration-500">
                <span id="sprout-stage-text" class="text-xs font-black text-emerald-950 mb-1 bg-white/70 px-3 py-0.5 rounded-full flex items-center gap-1">${b.sparkle("w-3.5 h-3.5")} 破土小苗</span>
                <span class="text-xs font-black text-emerald-950">${e.pinyin}</span>
                <span class="text-7xl sm:text-8xl font-black font-serif leading-none drop-shadow-lg">${e.char}</span>
              </div>

              <div id="sprout-trunk" class="w-7 h-24 bg-gradient-to-b from-amber-700 to-amber-900 rounded-full border-2 border-amber-950 shadow-inner mt-1"></div>

            </div>

            <div class="w-full max-w-sm h-14 bg-gradient-to-b from-amber-900 to-amber-950 rounded-t-3xl border-t-4 border-amber-600 shadow-2xl flex items-center justify-center">
              <span class="text-xs font-black text-amber-300 flex items-center gap-1">
                ${b.sparkle("w-4 h-4")} 滋润春泥
              </span>
            </div>

          </div>

        </div>

        <div class="z-20 w-full max-w-xs bg-black/40 backdrop-blur-md p-2.5 rounded-2xl border-2 border-white/20 flex items-center gap-3 shadow-xl">
          <span class="text-xs font-black text-emerald-300 shrink-0">成长养分</span>
          <div class="flex-1 h-3.5 bg-white/20 rounded-full overflow-hidden p-0.5">
            <div id="sprout-progress-bar" class="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(52,211,153,0.8)]" style="width: 25%;"></div>
          </div>
        </div>

      </div>
    `,d.speakPriority("晃动神奇喷壶浇浇水，让小种子快快长大！",{kind:"sentence",priority:1}),this._bindWateringEvents()}_bindWateringEvents(){const e=this.container.querySelector("#sprout-watering-can"),t=this.container.querySelector("#sprout-water-drops"),s=this.container.querySelector("#sprout-plant-tree"),i=this.container.querySelector("#sprout-stage-text"),r=this.container.querySelector("#sprout-progress-bar");if(!e)return;const a=()=>{if(this.isCompleted)return;if(this.waterCount++,d.playPop(),e.style.transform="rotate(-30deg) scale(1.15)",t&&(t.style.opacity="1"),this.timers.push(setTimeout(()=>{this.isDestroyed||(e.style.transform="rotate(0deg) scale(1)",t&&(t.style.opacity="0"))},450)),s){const c=.55+this.waterCount*.28;s.style.transform=`scale(${c})`}if(i){const c=["幼嫩新苗","抽条繁茂","硕果累累"];i.textContent=c[Math.min(c.length-1,this.waterCount-1)]||"茁壮成长"}const o=Math.max(1,this.targetWaterCount||1),l=Math.min(100,Math.round(this.waterCount/o*100));r&&(r.style.width=`${l}%`),this.waterCount>=this.targetWaterCount&&!this.isCompleted&&(this.isCompleted=!0,this._triggerVictory())};e.addEventListener("click",a),this.cleanups.push(()=>e.removeEventListener("click",a))}_triggerVictory(){d.playSuccess(),d.playVictoryFanfare(),d.triggerConfetti(this.container);const e=this.container.querySelector("#sprout-plant-tree");e&&e.classList.add("scale-125");const t=this.charData;d.speakPriority(`太神奇啦！大树枝繁叶茂，结出了“${t.char}”字！`,{kind:"sentence",priority:1}),this._timeout(()=>{!this.isDestroyed&&typeof this.onComplete=="function"&&this.onComplete()},1300)}destroy(){this.isDestroyed=!0,this.timers.forEach(e=>clearTimeout(e)),this.timers=[],this.cleanups.forEach(e=>e()),this.cleanups=[]}}class le{constructor(e,t,s){this.container=e,this.charData=t,this.onComplete=s,this.isCompleted=!1,this.cleanups=[],this.isDestroyed=!1,this.timers=[]}_timeout(e,t){const s=setTimeout(()=>{this.isDestroyed||e()},t);return this.timers.push(s),s}mount(){const e=this.charData,t=e.radical||(e.char.length>0?e.char[0]:"木"),s=e.stem||(e.char.length>1?e.char[1]:e.char);this.container.innerHTML=`
      <div class="relative w-full h-full flex flex-col items-center justify-between p-4 select-none overflow-hidden animate-fade-in">
        
        <div class="z-20 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border-2 border-cyan-300 shadow-2xl flex items-center gap-2">
          <span class="flex items-center text-cyan-300 animate-pulse">${b.sparkle("w-5 h-5")}</span>
          <span class="text-sm sm:text-base font-black text-cyan-100">拖动神奇魔法积木，靠近合体变出新汉字！</span>
        </div>

        <div class="relative w-full max-w-xl flex-1 flex items-center justify-center gap-8 my-2">
          
          <div id="fusion-part-base" class="relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-indigo-700 to-purple-600 border-4 border-white shadow-2xl flex flex-col items-center justify-center text-white">
            <span class="text-xs font-black text-cyan-200 mb-1">魔法部件</span>
            <span class="text-5xl sm:text-6xl font-black font-serif">${t}</span>
            
            <div class="absolute inset-0 rounded-3xl border-2 border-cyan-400 animate-ping opacity-30 pointer-events-none"></div>
          </div>

          <div id="fusion-arc-indicator" class="flex flex-col items-center gap-1 text-cyan-300 transition-all duration-200">
            <span class="flex items-center animate-pulse">${b.sparkle("w-8 h-8")}</span>
            <span id="fusion-arc-text" class="text-xs font-black bg-cyan-950/70 border border-cyan-400 px-3 py-1 rounded-full shadow-lg">磁吸相引</span>
          </div>

          <div id="fusion-part-drag" class="draggable-fusion relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 border-4 border-white shadow-2xl flex flex-col items-center justify-center text-white cursor-grab active:cursor-grabbing hover:scale-105 transition-transform touch-none select-none">
            <span class="text-xs font-black text-amber-200 mb-1">拖我靠近</span>
            <span class="text-5xl sm:text-6xl font-black font-serif">${s}</span>
          </div>

          <div id="fusion-result-char" class="absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none transition-all duration-500 transform scale-50 z-30">
            <div id="fusion-shockwave" class="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full border-4 border-cyan-300 animate-ping pointer-events-none opacity-0"></div>

            <div class="w-52 h-52 sm:w-64 sm:h-64 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 border-4 border-white shadow-[0_0_70px_rgba(99,102,241,1)] flex flex-col items-center justify-center text-white">
              <span class="text-sm font-black text-cyan-200">${e.pinyin}</span>
              <span class="text-8xl sm:text-9xl font-black font-serif leading-none drop-shadow-lg">${e.char}</span>
              <span class="text-xs font-black text-yellow-300 mt-2 bg-black/40 px-4 py-1.5 rounded-full border border-yellow-300/40">合体成功！</span>
            </div>
          </div>

        </div>

        <div class="z-20 w-full max-w-xs bg-black/40 backdrop-blur-md p-2.5 rounded-2xl border-2 border-white/20 flex items-center gap-3 shadow-xl">
          <span class="text-xs font-black text-cyan-300 shrink-0">磁吸引力</span>
          <div class="flex-1 h-3.5 bg-white/20 rounded-full overflow-hidden p-0.5">
            <div id="fusion-progress-bar" class="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full transition-all duration-100 shadow-[0_0_10px_rgba(34,211,238,0.8)]" style="width: 20%;"></div>
          </div>
        </div>

      </div>
    `,d.speakPriority("拖动神奇魔法积木，靠近合体变出新汉字！",{kind:"sentence",priority:1}),this._bindDragEvents()}_bindDragEvents(){const e=this.container.querySelector("#fusion-part-drag"),t=this.container.querySelector("#fusion-part-base"),s=this.container.querySelector("#fusion-result-char"),i=this.container.querySelector("#fusion-progress-bar");if(!e||!t)return;let r=!1,a=0,o=0;const l=h=>{if(this.isCompleted)return;r=!0;const m=h.touches?h.touches[0].clientX:h.clientX,x=h.touches?h.touches[0].clientY:h.clientY;a=m,o=x,d.playPop(),e.classList.add("scale-115","z-20")},c=h=>{if(!r)return;const m=h.touches?h.touches[0].clientX:h.clientX,x=h.touches?h.touches[0].clientY:h.clientY,g=m-a,p=x-o;e.style.transform=`translate(${g}px, ${p}px) scale(1.15)`;const y=this.container.querySelector("#fusion-arc-indicator"),f=this.container.querySelector("#fusion-arc-text"),v=this.container.querySelector("#fusion-shockwave"),w=e.getBoundingClientRect(),k=t.getBoundingClientRect(),S=Math.hypot(w.left-k.right,w.top-k.top),T=Math.max(0,Math.min(100,Math.round((1-S/300)*100)));if(i&&(i.style.width=`${Math.max(20,T)}%`),S<150?(f&&(f.textContent="电弧激发中！"),y&&(y.style.transform="scale(1.25)"),e.classList.add("ring-4","ring-cyan-300")):(f&&(f.textContent="磁吸相引"),y&&(y.style.transform="scale(1)"),e.classList.remove("ring-4","ring-cyan-300")),S<60&&!this.isCompleted){this.isCompleted=!0,r=!1,d.playPop(),d.playSuccess(),d.playVictoryFanfare(),d.triggerConfetti(this.container),e.style.display="none",t.style.display="none",y&&(y.style.display="none"),v&&v.classList.remove("opacity-0"),s&&(s.classList.remove("opacity-0","scale-50"),s.classList.add("opacity-100","scale-100"));const A=this.charData;d.speakPriority(`咔哒！积木合体成功，诞生了“${A.char}”字！`,{kind:"sentence",priority:1}),this._timeout(()=>{!this.isDestroyed&&typeof this.onComplete=="function"&&this.onComplete()},1300)}},u=()=>{r&&(r=!1,e.style.transition="transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",e.style.transform="translate(0px, 0px)",e.classList.remove("scale-115","z-20","ring-4","ring-cyan-300"))};e.addEventListener("mousedown",l),e.addEventListener("touchstart",l,{passive:!0}),window.addEventListener("mousemove",c),window.addEventListener("touchmove",c,{passive:!0}),window.addEventListener("mouseup",u),window.addEventListener("touchend",u),this.cleanups.push(()=>{e.removeEventListener("mousedown",l),e.removeEventListener("touchstart",l),window.removeEventListener("mousemove",c),window.removeEventListener("touchmove",c),window.removeEventListener("mouseup",u),window.removeEventListener("touchend",u)})}destroy(){this.isDestroyed=!0,this.timers.forEach(e=>clearTimeout(e)),this.timers=[],this.cleanups.forEach(e=>e()),this.cleanups=[]}}const E={RUB_REVEAL:"rub_reveal",FEED_CREATURE:"feed_creature",SLINGSHOT:"slingshot",SPROUT_GROWTH:"sprout_growth",MAGNETIC_FUSION:"magnetic_fusion"},ce=new Set(["日","月","星","云","雨","天","光","雷","电","雪","夜","明","阴","晴","霞","雾","霜","冰","空","虹"]),de=new Set(["口","吃","喝","水","果","米","鱼","肉","瓜","包","饱","尝","咬","饭","糖","茶","奶","菜","汤","甜"]),he=new Set(["木","林","森","草","花","土","地","生","树","芽","叶","春","禾","竹","苗","田","谷","果","根","植"]),ue=new Set(["休","看","信","尖","好","尘","男","泪","歪","妈","爸","姐","妹","哥","弟","朋","友","品","众","森"]),pe=new Set(["大","小","上","下","出","入","飞","石","射","打","弓","箭","山","破","开","关","走","跑","跳","击"]);function me(n){const e=n.char;if(ce.has(e))return E.RUB_REVEAL;if(de.has(e))return E.FEED_CREATURE;if(he.has(e))return E.SPROUT_GROWTH;if(ue.has(e))return E.MAGNETIC_FUSION;if(pe.has(e))return E.SLINGSHOT;const t=n.radical||"";if(t==="艹"||t==="木"||t==="土"||t==="禾")return E.SPROUT_GROWTH;if(t==="口"||t==="饣"||t==="氵")return E.FEED_CREATURE;if(t==="日"||t==="月"||t==="雨"||t==="气")return E.RUB_REVEAL;if(t==="亻"||t==="女"||t==="父"||n.charType==="phono"||n.charType==="ideographic")return E.MAGNETIC_FUSION;switch((e.charCodeAt(0)||0)%5){case 0:return E.RUB_REVEAL;case 1:return E.FEED_CREATURE;case 2:return E.SLINGSHOT;case 3:return E.SPROUT_GROWTH;default:return E.MAGNETIC_FUSION}}function fe(n,e,t){switch(me(e)){case E.RUB_REVEAL:return new re(n,e,t);case E.FEED_CREATURE:return new ne(n,e,t);case E.SLINGSHOT:return new oe(n,e,t);case E.SPROUT_GROWTH:return new ae(n,e,t);case E.MAGNETIC_FUSION:default:return new le(n,e,t)}}const U=[{id:"story_forest_1",title:"凯茜的魔法森林初遇",reqCorrect:3,snippet:"小鹿凯茜在奇幻森林里找到了一枚会发光的汉字树叶……"},{id:"story_forest_2",title:"彩虹泉水的秘密",reqCorrect:6,snippet:"念出正确的字音，彩虹泉水就会喷出漂亮的七彩泡泡！"},{id:"story_forest_3",title:"星光探险家启程",reqCorrect:10,snippet:"穿上小探险服，凯茜和小朋友一起飞向知识的银河！"}];class be{constructor(){this.progress=this.load()}load(){const e=L.getJSON("mascot_progress");return e&&typeof e=="object"?e:{expressions:["neutral"],storiesUnlocked:[],consecutiveCorrect:0,totalPraises:0}}save(){L.putJSON("mascot_progress",this.progress)}onCorrectPronunciation(){this.progress.consecutiveCorrect=(this.progress.consecutiveCorrect||0)+1,this.progress.totalPraises=(this.progress.totalPraises||0)+1;let e=!1;this.progress.consecutiveCorrect>=3&&this.unlockExpression("happy")&&(e=!0),this.progress.consecutiveCorrect>=5&&this.unlockExpression("excited")&&(e=!0);for(const t of U)this.progress.totalPraises>=t.reqCorrect&&!this.progress.storiesUnlocked.includes(t.id)&&(this.progress.storiesUnlocked.push(t.id),e=!0);return this.save(),e&&F&&F.emit("mascot:unlocked",{progress:this.progress}),this.progress}onWrongAttempt(){this.progress.consecutiveCorrect=0,this.save()}unlockExpression(e){return Array.isArray(this.progress.expressions)||(this.progress.expressions=["neutral"]),this.progress.expressions.includes(e)?!1:(this.progress.expressions.push(e),this.save(),!0)}getUnlockedExpressions(){return this.progress.expressions||["neutral"]}getUnlockedStories(){const e=this.progress.storiesUnlocked||[];return U.filter(t=>e.includes(t.id))}}const I=new be;function xe(n){var r,a,o;if(!n)return{question:"汉字是由古代的图画演变而来的吗？",options:[{text:"是的，古人看图造字",correct:!0,explanation:"太棒了！古人观察天地日月创造了汉字！"},{text:"不是，是机器打印的",correct:!1,explanation:"不对哦，古人在几千年前就创造了甲骨文。"}]};const e=n,t=e.radical||e.char,s=((r=e.meanings)==null?void 0:r.radicalHint)||`${t}字旁`,i=((a=e.evolution)==null?void 0:a.oracleDesc)||"";return(o=e.meanings)!=null&&o.mnemonic,i&&i.length>2?{question:`在几千年前的甲骨文中，“${e.char}”字最早画的是什么？`,options:[{text:i,correct:!0,explanation:`答对啦！${i}，后来慢慢变成了“${e.char}”字。`},{text:"一辆飞驰的小汽车",correct:!1,explanation:"古代还没有小汽车哦，再想一想大自然中的景象！"},{text:"一块现代电子手表",correct:!1,explanation:"古时候没有电子表哦，古人是看大自然造字的。"}].sort(()=>Math.random()-.5)}:{question:`仔细观察“${e.char}”字，你觉得它的部首偏旁【${t}】通常和什么有关？`,options:[{text:s,correct:!0,explanation:`太厉害了！【${t}】正代表着${s}。`},{text:"冰冷坚硬的大钢铁",correct:!1,explanation:`不对哦，【${t}】通常和自然、生活有密切联系。`},{text:"吵闹的施工大喇叭",correct:!1,explanation:"不对哦，再仔细观察这个字的部首吧！"}].sort(()=>Math.random()-.5)}}function ge(n,e){if(!n)return;const t=xe(n),s=document.createElement("div");s.id="etymology-quiz-modal",s.className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in",s.innerHTML=`
    <div class="relative w-full max-w-lg bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
      
      <div class="mb-3 flex items-center justify-center">
        <span class="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-300 flex items-center justify-center text-amber-300 animate-bounce-slow">
          ${b.sparkle("w-8 h-8")}
        </span>
      </div>

      <span class="text-xs font-black bg-amber-400 text-amber-950 px-4 py-1 rounded-full border border-white shadow-sm mb-2">
        凯茜字理微问答
      </span>

      <h3 class="text-lg sm:text-xl font-black text-yellow-300 mb-6 leading-relaxed px-2">
        ${t.question}
      </h3>

      <div id="quiz-options-container" class="w-full flex flex-col gap-3">
        ${t.options.map((o,l)=>`
          <button class="quiz-opt-btn w-full p-4 bg-white/10 hover:bg-white/20 active:scale-98 rounded-2xl border-2 border-white/20 text-white font-bold text-sm sm:text-base flex items-center justify-between transition-all cursor-pointer shadow-md" data-correct="${o.correct}" data-exp="${encodeURIComponent(o.explanation)}">
            <span class="text-left flex-1">${o.text}</span>
            <span class="opt-mark text-xs px-2 py-0.5 rounded-full bg-black/30 border border-white/20 ml-2">选择</span>
          </button>
        `).join("")}
      </div>

      <div id="quiz-feedback-box" class="hidden mt-4 w-full p-4 rounded-2xl text-xs font-bold leading-relaxed transition-all"></div>

      <button id="btn-quiz-skip" class="mt-5 text-xs text-indigo-300 hover:text-white underline cursor-pointer">
        跳过此题，继续学字
      </button>
    </div>
  `,document.body.appendChild(s),d.playPop(),d.speakPriority(t.question,{kind:"sentence",emotion:"gentle"});let i=!1;const r=()=>{s.remove(),typeof e=="function"&&e()},a=s.querySelector("#btn-quiz-skip");a&&a.addEventListener("click",r),s.querySelectorAll(".quiz-opt-btn").forEach(o=>{o.addEventListener("click",()=>{if(i)return;i=!0;const l=o.dataset.correct==="true",c=decodeURIComponent(o.dataset.exp||""),u=s.querySelector("#quiz-feedback-box");l?(o.classList.remove("bg-white/10","border-white/20"),o.classList.add("bg-emerald-600/80","border-emerald-300","ring-4","ring-emerald-400"),d.playVictoryFanfare(),d.triggerConfetti(s),d.speakPriority(`答对啦！${c}`,{kind:"sentence",emotion:"excited"}),I.onCorrectPronunciation(),u&&(u.className="mt-4 w-full p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-400 text-emerald-200 text-xs font-bold block animate-fade-in",u.textContent=c),setTimeout(()=>r(),2e3)):(o.classList.remove("bg-white/10","border-white/20"),o.classList.add("bg-rose-900/80","border-rose-400","animate-shake"),d.playSoftError(),d.speakPriority(`不对哦。${c}`,{kind:"sentence",emotion:"gentle"}),u&&(u.className="mt-4 w-full p-3.5 rounded-2xl bg-rose-950/80 border border-rose-400 text-rose-200 text-xs font-bold block animate-fade-in",u.textContent=c),setTimeout(()=>{i=!1,o.classList.remove("animate-shake")},1200))})})}const ye=Object.freeze([{key:"oracle",label:"甲骨文",glyphField:"oracleGlyph",descField:"oracleDesc",age:"3500年前",color:"#b45309",emoji:"🐢"},{key:"bronze",label:"金文",glyphField:"bronzeGlyph",descField:"bronzeDesc",age:"3000年前",color:"#92400e",emoji:"🔔"},{key:"seal",label:"小篆",glyphField:null,descField:"sealDesc",age:"2200年前",color:"#78350f",emoji:"📜"},{key:"modern",label:"楷书",glyphField:"char",descField:"modernDesc",age:"约2000年",color:"#1c1917",emoji:"✏️"}]);function ve(n){if(!n)return[];const e=n.evolution||{};return ye.map(t=>{let s=n[t.glyphField]||"";t.key!=="modern"&&!s&&(s=n.char);const i=e[t.descField]||we(n,t.key);return{key:t.key,label:t.label,age:t.age,glyph:s,desc:i,color:t.color,emoji:t.emoji,isFallback:t.key!=="modern"&&!n[t.glyphField]}})}function we(n,e){if((n.charType||"")==="pictograph")switch(e){case"oracle":return`${n.char} 最初是古人看到的实物样子`;case"bronze":return"线条开始规整，刻在青铜器上";case"seal":return"笔画简化，形成小篆风格";default:return"楷书定型，成为今天的规范字"}return`${n.char} 的${e==="modern"?"现代":"古代"}写法`}function J(n){var i,r;if(!n)return{chant:"",source:"template",chantType:"unknown"};const e=(i=n.meanings)==null?void 0:i.mnemonic;if(e&&e.length>1)return{chant:W(e),source:"mnemonic",chantType:"charType"};const t=(r=n.evolution)==null?void 0:r.story;if(t&&t.length>10){const a=t.split(/[,，。.!！]/)[0];if(a.length>3)return{chant:W(a),source:"story",chantType:n.charType||"unknown"}}return{chant:{pictograph:`古人画 ${n.char}，看物造形象图形`,ideograph:`指事会意 ${n.char}，抽象符号有意义`,phonetic:`形旁声旁 ${n.char}，半表音来半表义`,compound:`合体组成 ${n.char}，多字拼合新意生`}[n.charType]||`${n.char} 字有道理，快来一起探索它`,source:"template",chantType:n.charType||"unknown"}}function W(n){const e=n.trim();if(e.length<=14)return e;const t=Math.ceil(e.length/2);return e.slice(0,t)+"，"+e.slice(t)}function ke(n){if(!n)return{pairs:[],hasConfusables:!1,count:0};const e=Array.isArray(n.confusingChars)?n.confusingChars:[],t=n.confusingHint||"",s=_e(t),i=e.slice(0,3).map((r,a)=>{const o=s.find(l=>l.char===r);return{other:r,otherPinyin:(o==null?void 0:o.pinyin)||"",diff:(o==null?void 0:o.diff)||""}});return{pairs:i,hasConfusables:i.length>0,count:i.length}}function _e(n){if(!n)return[];const e=[],t=n.split(/[,，]/).map(s=>s.trim()).filter(Boolean);for(const s of t){const i=s.match(/^(.+?)\(([^)]+)\)/);i?e.push({char:i[1].trim(),pinyin:i[2].trim()}):s.length===1&&e.push({char:s,pinyin:""})}return e}function Se(n){if(!n)return"";const e=n.evolution||{},t=J(n),s=[`${n.char}字`];return e.oracleDesc?s.push(`最早在甲骨文里，${e.oracleDesc}`):e.story&&s.push(e.story.split(/[。.]/)[0]),e.modernDesc&&s.push(`现在的楷书，${e.modernDesc}`),s.push(`口诀是：${t.chant}`),s.join("。")+"。"}function Te(n){return{stages:ve(n),mnemonic:J(n),confusing:ke(n),summary:Se(n),charType:(n==null?void 0:n.charType)||"unknown"}}const P=Object.freeze({PLAIN:"plain",CHANT:"chant",RAPID:"rapid",SING:"sing"}),Ee=110,Y={[P.PLAIN]:350,[P.CHANT]:450,[P.RAPID]:250,[P.SING]:700},Ce=/[，。！？、；：,.!?;:]/;function Pe(n,e={}){var m,x;const t=e.mode||P.CHANT,s=Math.max(60,Math.min(180,e.bpm||Ee)),i=(m=Y[t])!=null?m:Y[P.CHANT],r=((x=n==null?void 0:n.meanings)==null?void 0:x.mnemonic)||"",a=e.char||(n==null?void 0:n.char)||"",o=r||(a?`${a}字有道理`:"");if(!o)return{chars:[],totalMs:0,bpm:s,mode:t};const l=[];a&&(l.push({text:a,isPause:!1,isTargetChar:!0}),l.push({text:"",isPause:!0,pauseMs:300}));for(const g of o)Ce.test(g)?l.push({text:g,isPause:!0,pauseMs:$e(g)}):g.trim()&&l.push({text:g,isPause:!1});let c=0,u=0;return{chars:l.map(g=>{var y;if(g.isPause){const f=(y=g.pauseMs)!=null?y:200;return u+=f,{...g,beat:-1,durationMs:f}}c++;const p=i;return u+=p,{...g,beat:c,durationMs:p}}),totalMs:u,bpm:s,mode:t}}function $e(n){return"。！？!?".includes(n)?600:"，、,;；".includes(n)?350:"：:".includes(n)?250:200}function Me(n,e,t={},s=null){var c,u;if(!((c=n==null?void 0:n.chars)!=null&&c.length))return(u=t.onComplete)==null||u.call(t),{cancel(){}};let i=s,r=0,a=!1;const o=[];function l(){var m,x,g;if(a||r>=n.chars.length){a||(m=t.onComplete)==null||m.call(t);return}const h=n.chars[r];if(h.isPause){const p=setTimeout(()=>{r++,l()},h.durationMs);o.push(p)}else{if(n.mode!==P.PLAIN&&i){const y=setTimeout(()=>{var f;try{(f=i.playChantHit)==null||f.call(i)}catch(v){}},0);o.push(y)}if((x=t.onBeat)==null||x.call(t,h.beat,h.text),h.text&&i)i.speakPriority(h.text,{kind:"char",emotion:n.mode===P.SING?"gentle":"normal",durationMs:h.durationMs});else if(h.text)try{const y=new SpeechSynthesisUtterance(h.text);y.lang="zh-CN",window.speechSynthesis.speak(y)}catch(y){}(g=t.onChar)==null||g.call(t,h.text,h.durationMs);const p=setTimeout(()=>{r++,l()},h.durationMs);o.push(p)}}return l(),{cancel(){var h;a=!0;for(const m of o)clearTimeout(m);try{(h=window.speechSynthesis)==null||h.cancel()}catch(m){}}}}function Le(n,e={}){const t=Pe(n,e),s=Me(t,n,e.callbacks||{},e.soundEngine||null);return{plan:t,handle:s}}Object.values(P);const M=Object.freeze({LEARN:"learn",REVIEW:"review",PLAY:"play",DRILL:"drill",REPORT:"report"}),_=Object.freeze({VISUAL_GLYPH:"visual_glyph",VISUAL_EMOJI:"visual_emoji",VISUAL_TIMELINE:"visual_timeline",AUDITORY_PINYIN:"auditory_pinyin",AUDITORY_CHANT:"auditory_chant",AUDITORY_SENTENCE:"auditory_sentence",SEMANTIC_MEANING:"semantic_meaning",SEMANTIC_WORD:"semantic_word",SEMANTIC_CONFUSE:"semantic_confuse",MOTOR_INTERACT:"motor_interact",MOTOR_HINT:"motor_hint",GAME_CONFIG:"game_config"}),V={[M.LEARN]:{[_.VISUAL_GLYPH]:5,[_.VISUAL_TIMELINE]:5,[_.VISUAL_EMOJI]:3,[_.AUDITORY_PINYIN]:5,[_.AUDITORY_CHANT]:4,[_.SEMANTIC_MEANING]:4,[_.SEMANTIC_WORD]:3,[_.SEMANTIC_CONFUSE]:2,[_.MOTOR_HINT]:3},[M.REVIEW]:{[_.VISUAL_GLYPH]:5,[_.AUDITORY_PINYIN]:5,[_.SEMANTIC_MEANING]:4,[_.SEMANTIC_CONFUSE]:3,[_.AUDITORY_CHANT]:3,[_.GAME_CONFIG]:4},[M.PLAY]:{[_.GAME_CONFIG]:5,[_.MOTOR_INTERACT]:5,[_.MOTOR_HINT]:5,[_.VISUAL_EMOJI]:4,[_.AUDITORY_PINYIN]:3,[_.VISUAL_GLYPH]:3},[M.DRILL]:{[_.VISUAL_GLYPH]:5,[_.AUDITORY_PINYIN]:5,[_.SEMANTIC_MEANING]:5,[_.SEMANTIC_WORD]:4,[_.SEMANTIC_CONFUSE]:3},[M.REPORT]:{[_.SEMANTIC_MEANING]:5,[_.SEMANTIC_CONFUSE]:3}};function Ae(n){var s;if(!n)return{};const e={};return n.char&&(e[_.VISUAL_GLYPH]=n.char),(n.evolution&&(n.evolution.oracleDesc||n.evolution.story)||n.oracleGlyph||n.bronzeGlyph)&&(e[_.VISUAL_TIMELINE]={oracle:n.oracleGlyph||n.char,bronze:n.bronzeGlyph||n.char,seal:n.char,modern:n.char,evolution:n.evolution||{}}),n.emoji&&(e[_.VISUAL_EMOJI]=n.emoji),n.pinyin&&(e[_.AUDITORY_PINYIN]=n.pinyin),(s=n.meanings)!=null&&s.mnemonic&&(e[_.AUDITORY_CHANT]=n.meanings.mnemonic),n.sentence&&(e[_.AUDITORY_SENTENCE]=n.sentence),n.meanings&&(e[_.SEMANTIC_MEANING]=n.meanings),(n.words||[]).length&&(e[_.SEMANTIC_WORD]=n.words),(n.confusingChars||[]).length&&(e[_.SEMANTIC_CONFUSE]={chars:n.confusingChars,hint:n.confusingHint||""}),n.interaction&&(e[_.MOTOR_INTERACT]=n.interaction),n.mechanism&&(e[_.MOTOR_HINT+"_mechanism"]=n.mechanism),n.playHint&&(e[_.MOTOR_HINT]=n.playHint),n.gameConfig&&(e[_.GAME_CONFIG]=n.gameConfig),e}function Re(n,e,t={}){var x,g;const s=V[e]||V[M.LEARN],i=Ae(n),r=new Set(t.skipModals||[]),a=qe(t.age||5),o=De(t.difficultyLevel||"medium"),l={};let c=0,u=0;for(const[p,y]of Object.entries(s)){if(r.has(p)||!(i[p]!==void 0))continue;const v=(x=a[p])!=null?x:0,w=(g=o[p])!=null?g:0,k=Math.max(0,Math.min(5,y+v+w));c+=y,k>0&&(l[p]={data:i[p],weight:k,recommended:k>=3},u+=y)}const h=c>0?Math.round(u/c*100):0,m=Ne(e,l,h);return{scene:e,difficultyLevel:t.difficultyLevel||"medium",modalities:l,coverage:h,score:h,rationale:m,char:(n==null?void 0:n.char)||""}}function qe(n){return n<=5?{[_.VISUAL_EMOJI]:1,[_.MOTOR_HINT]:1,[_.SEMANTIC_WORD]:-1}:n>=7?{[_.SEMANTIC_CONFUSE]:1,[_.SEMANTIC_MEANING]:1,[_.AUDITORY_CHANT]:-1}:{}}function De(n){return n==="easy"?{[_.SEMANTIC_CONFUSE]:-1,[_.AUDITORY_CHANT]:1}:n==="hard"?{[_.SEMANTIC_CONFUSE]:1,[_.MOTOR_HINT]:1}:{}}function Ne(n,e,t){const i=Object.keys(e).filter(r=>e[r].recommended).join("+");return`场景[${n}] 覆盖 ${t}% — 推荐: ${i||"基础模态"}`}function je(n,e,t={}){return Re(n,e,t)}const X="CATHY_VOICE_GUIDANCE_ENABLED";class Ie{constructor(){this.lastSpokenText="",this.lastSpokenTime=0,this._debounceTimer=null}isEnabled(){const e=L.getItem(X);return e===null?!0:e==="true"||e===!0}setEnabled(e){L.setItem(X,!!e)}speakGuidance(e,t={}){if(!this.isEnabled()||!e)return;const s=Date.now(),i=e.trim();this.lastSpokenText===i&&s-this.lastSpokenTime<2e3||(clearTimeout(this._debounceTimer),this._debounceTimer=setTimeout(()=>{this.lastSpokenText=i,this.lastSpokenTime=Date.now();try{d.speakPriority(i,{kind:"tutor",priority:t.priority||3,emotion:t.emotion||"gentle"})}catch(r){console.warn("[VoiceGuide] failed to speak:",r)}},typeof t.debounceMs=="number"?t.debounceMs:250))}attach(e){if(!e||typeof e.querySelectorAll!="function")return;e.querySelectorAll("[data-voice-hint], button[title], [role='button'][title]").forEach(s=>{const i=s.getAttribute("data-voice-hint")||s.getAttribute("title")||s.getAttribute("aria-label");if(!i)return;const r=()=>this.speakGuidance(i);s.addEventListener("mouseenter",r,{passive:!0}),s.addEventListener("focus",r,{passive:!0})})}}const ze=new Ie;function Fe(n){const e=typeof n=="number"?n:parseInt(n,10)||6;return e<=6?"preschool":e===7?"grade1":"grade2"}function Oe(n,e=6){var o,l,c;if(!n)return null;const t=Fe(e),i={preschool:{title:"启蒙具象识字",focus:"象形与表象记忆",badge:"启蒙期",ageRange:"5-6岁"},grade1:{title:"拼读与部件理据",focus:"拼音结合与部首表义",badge:"衔接期",ageRange:"6-7岁"},grade2:{title:"形近辨析与应用",focus:"形近辨析与深度构词",badge:"进阶期",ageRange:"7-8岁+"}}[t],r=t==="preschool"?Ge(n):"";if(n.cognitiveStage&&typeof n.cognitiveStage[t]=="string"&&n.cognitiveStage[t].trim())return{stage:t,title:`${i.title} (${i.ageRange})`,focus:i.focus,text:n.cognitiveStage[t].trim(),badge:i.badge,ageRange:i.ageRange,actionPrompt:r};let a="";if(t==="preschool")(o=n.meanings)!=null&&o.primary&&n.meanings.primary.length>2?a=`看，像生活中的「${n.char}」：${n.meanings.primary}。`:(l=n.evolution)!=null&&l.story?a=`仔细观察，就像${n.evolution.story.split("，")[0].replace(/^(古人看到[的]?|人们看到|古人观察)/,"").trim()}。`:n.words&&n.words.length>0?a=`就像「${n.words[0].word||n.words[0]}」里的「${n.char}」，像个神奇的小图画！`:a=`仔细看「${n.char}」的形状，像一个有趣的小符号！`;else if(t==="grade1"){const u=((c=n.meanings)==null?void 0:c.radicalHint)||(n.radical?`偏旁部首是「${n.radical}」`:"");a=`${n.pinyin?`拼音读作 ${n.pinyin}，`:""}${u?u+"。":""}想一想，古人为什么这样组合部件写出这个字？`}else{const u=(n.confusingChars||[]).filter(h=>h!==n.char).slice(0,3);u.length>0?a=`形近字辨析：特别注意和「${u.join("、")}」区分开，找出笔画细微不同！`:n.confusingHint?a=`辨析线索：${n.confusingHint}`:n.words&&n.words.length>=2?a=`深度应用：能够熟练认读并写出「${n.words.slice(0,3).map(m=>m.word||m).join("、")}」等词汇。`:a=`规范书写「${n.char}」的笔顺，理解在不同语境中的字义。`}return{stage:t,title:`${i.title} (${i.ageRange})`,focus:i.focus,text:a,badge:i.badge,ageRange:i.ageRange,actionPrompt:r}}function Ge(n){var i;if(!n)return"";const e=n.char||"",t={飞:"张开双臂像小鸟一样上下轻轻扇动！",走:"小手叉腰，原地轻快地踏步走！",跑:"双臂前后自然摆动，原地小跑起来！",看:"小手搭在额头前，像孙悟空一样往远处张望！",目:"眨一眨明亮的大眼睛，看看周围有什么！",听:"把小手拢在耳朵边，静静听周围的声音！",耳:"轻轻捏捏自己的小耳朵，拉一拉揉一揉！",笑:"嘴角向上高高扬起，露出最灿烂的笑容！",乐:"开心地拍拍双手，蹦蹦跳跳欢呼一下！",高:"双脚踮起来，两只小手向上高高举过头顶！",大:"双臂伸展、双脚叉开，把自己变成一个大字！",小:"把身体蜷缩起来，像一颗小巧玲珑的小豆子！",立:"挺起小胸膛，像一棵笔直挺拔的小松树！",坐:"小手平放在膝盖上，端端正正坐得稳当！",手:"伸出两只胖乎乎的小手，握紧拳头再张开！",日:"用双手在头顶画一个大圆，像红彤彤的太阳！",月:"身体微微侧倾，双手弯成弯弯的小月牙！",水:"双手波浪般上下起伏，像欢快流动的小溪水！",雨:"十个小手指轻轻抖动，像淅淅沥沥的春雨落下来！",火:"两只手在胸前灵动摇摆，像跳跃闪烁的小火苗！",风:"鼓起小腮帮，轻轻呼一口气吹吹风！",山:"双手在头顶合拢成三角形，稳固如一座大山！",木:"双脚扎稳马步，双臂向两侧舒展如大树绿荫！",鸟:"两只手像小鸟的翅膀一样扑棱扑棱飞！",鱼:"两手合十，在空中像小金鱼一样摇摆游动！",虫:"小手指弯一弯伸一伸，像小毛毛虫爬呀爬！",吃:"张开嘴巴，吧唧吧唧模仿品尝美味的食物！",跳:"双脚并拢，轻轻地向上跳一下！"};if(t[e])return t[e];const s=n.radical||"";return s==="扌"||s==="手"?`伸出双手，模仿做一个「${e}」的动作！`:s==="足"||s==="走"||s==="辶"?`双脚动一动，原地模仿「${e}」的轻快动作！`:s==="口"?`张开嘴巴动一动，发出「${e}」的声音！`:s==="目"?"转动明亮的小眼睛，仔细观察身边的物品！":s==="氵"||s==="水"?"手臂轻轻摆动，像水流一样柔和波动！":s==="艹"||s==="木"?"像小树小草一样向上伸展，慢慢长高！":(i=n.meanings)!=null&&i.primary?`想一想「${e}」（${n.meanings.primary}），用你可爱的身体动作表演出来吧！`:`动动小脑筋和小手脚，用动作表演一下「${e}」字吧！`}class We extends te{constructor(e,t,s,i){super(e),this.charData=t,this.onFinish=s,this.onBackToMap=i,this.currentStep=1,this.completedSteps=[],this.hanziEngine=null,this.prewriteEngine=null,this.activePlayGame=null,this._isRecordingTransition=!1,this._evalStars=3;const r=this.loadProgress();r&&typeof r.currentStep=="number"&&r.currentStep>=1&&r.currentStep<=8&&(this.currentStep=r.currentStep,this.completedSteps=Array.isArray(r.completedSteps)?r.completedSteps:[])}saveProgress(){var t;if(!((t=this.charData)!=null&&t.id))return;const e={charId:this.charData.id,completedSteps:this.completedSteps||[],currentStep:this.currentStep,lastUpdated:Date.now()};L.setItem(`learn_progress_${this.charData.id}`,e)}loadProgress(){var e;return(e=this.charData)!=null&&e.id?L.getItem(`learn_progress_${this.charData.id}`):null}markStepComplete(e){this.completedSteps.includes(e)||this.completedSteps.push(e),this.saveProgress()}clearProgress(){var e;(e=this.charData)!=null&&e.id&&L.removeItem(`learn_progress_${this.charData.id}`)}destroy(){var t,s,i;(t=this.activePlayGame)!=null&&t.destroy&&(this.activePlayGame.destroy(),this.activePlayGame=null),this.hanziEngine&&(this.hanziEngine.destroy(),this.hanziEngine=null),this.prewriteEngine&&(this.prewriteEngine.destroy(),this.prewriteEngine=null),(s=this.drillEngine)!=null&&s.destroy&&(this.drillEngine.destroy(),this.drillEngine=null),this._volMeterTimer&&(clearInterval(this._volMeterTimer),this._volMeterTimer=null),this._countTimer&&(clearInterval(this._countTimer),this._countTimer=null);const e=R||(typeof window!="undefined"?window.pronunciationEval:null);if(e&&e.state==="listening")try{e.stopAndEvaluate()}catch(r){}typeof document!="undefined"&&((i=document.getElementById("mic-permission-modal"))==null||i.remove()),this._isChestOpening=!1,super.destroy()}render(){this.destroy();const e=C.progress,t=d.isMuted?b.speaker(!0):b.speaker(!1);this.container.innerHTML=`
      <div class="relative w-full h-full min-h-[640px] flex flex-col justify-between select-none overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
        
        <header class="relative z-30 w-full px-4 sm:px-8 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b-2 border-white/20 flex-wrap gap-2">
          
          <button id="btn-learn-back-map" class="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-[0_6px_20px_rgba(245,158,11,0.5)] border-2 border-white active:translate-y-0.5 active:scale-95 transition-all cursor-pointer">
            <span class="flex items-center">${b.home("w-4 h-4")}</span>
            <span>返回大地图</span>
          </button>

          <div class="flex items-center gap-2 sm:gap-3 bg-black/60 backdrop-blur-md px-4 sm:px-6 py-2 rounded-full border-2 border-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            ${[{step:1,name:"玩",iconSvg:s=>b.gem(s)},{step:2,name:"认",iconSvg:s=>b.cards(s)},{step:3,name:"读",iconSvg:s=>b.speaker(s)},{step:4,name:"练",iconSvg:s=>b.arcade(s)},{step:5,name:"控笔",iconSvg:s=>b.hand(s)},{step:6,name:"描红",iconSvg:s=>b.brush(s)},{step:7,name:"写",iconSvg:s=>b.pen(s)},{step:8,name:"测",iconSvg:s=>b.chest(s)}].map(s=>`
              <div class="flex items-center gap-1 sm:gap-1.5">
                <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 border-2 ${s.step===this.currentStep?"bg-gradient-to-tr from-yellow-300 via-orange-500 to-red-500 text-white border-white shadow-[0_0_20px_rgba(255,180,0,1)] scale-115 ring-4 ring-yellow-300 animate-pulse":s.step<this.currentStep?"bg-gradient-to-tr from-emerald-500 to-teal-400 text-white border-white/80 shadow-md":"bg-white/15 text-white/40 border-white/20"}">
                  ${s.step<this.currentStep?`<span class="flex items-center">${b.star("w-4 h-4",!1)}</span>`:`<span class="flex items-center">${s.iconSvg("w-4 h-4")}</span>`}
                </div>
                <span class="text-xs sm:text-sm font-black ${s.step===this.currentStep?"text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]":"text-white/70"}">${s.name}</span>
                ${s.step<8?`<div class="w-2 sm:w-3 h-1 rounded-full ${s.step<this.currentStep?"bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]":"bg-white/20"}"></div>`:""}
              </div>
            `).join("")}
          </div>

          <div class="flex items-center gap-2.5">
            <div class="flex items-center gap-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-full border-2 border-white shadow-xl">
              <span class="text-white/90">正在学:</span>
              <span class="text-xl sm:text-2xl text-yellow-100 font-serif leading-none drop-shadow">${this.charData.char}</span>
            </div>
            <button id="btn-learn-sound" class="w-10 h-10 sm:w-11 sm:h-11 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-90 border-2 border-white/40 shadow-lg cursor-pointer" title="声音开关">
              ${t}
            </button>
            <div class="candy-pill flex items-center gap-1.5 text-yellow-300 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-full bg-black/40 border-2 border-white/30 shadow-md">
              ${b.coin("w-4 h-4")}<span>${e.coins}</span>
            </div>
            <div class="candy-pill flex items-center gap-1.5 text-amber-300 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-full bg-black/40 border-2 border-white/30 shadow-md">
              ${b.star("w-4 h-4",!1)}<span>${e.stars}</span>
            </div>
          </div>

        </header>

        <main id="learn-stage-container" class="relative z-10 flex-1 w-full flex items-center justify-center p-4">
        </main>

      </div>
    `,this.bindHeaderEvents(),this.renderCurrentStep()}setStep(e){this.markStepComplete(this.currentStep),this.currentStep=e,this.saveProgress(),this.render()}nextStep(){this.currentStep<8&&(this.markStepComplete(this.currentStep),this.currentStep++,this.saveProgress(),this.render())}bindHeaderEvents(){const e=this.container.querySelector("#btn-learn-back-map");e&&this._on(e,"click",()=>{d.playPop(),this.hanziEngine&&this.hanziEngine.destroy(),this.onBackToMap?this.onBackToMap():this._busEmit(N.SWITCH_MODE,{mode:"map"})});const t=this.container.querySelector("#btn-learn-sound");t&&this._on(t,"click",()=>{const s=d.toggleMute();t.innerHTML=s?b.speaker(!0):b.speaker(!1)})}renderCurrentStep(){var s,i;const e=this.container.querySelector("#learn-stage-container");if(!e)return;(s=this.activePlayGame)!=null&&s.destroy&&(this.activePlayGame.destroy(),this.activePlayGame=null),this.hanziEngine&&(this.hanziEngine.destroy(),this.hanziEngine=null),this.prewriteEngine&&(this.prewriteEngine.destroy(),this.prewriteEngine=null),(i=this.drillEngine)!=null&&i.destroy&&(this.drillEngine.destroy(),this.drillEngine=null),this._volMeterTimer&&(clearInterval(this._volMeterTimer),this._volMeterTimer=null),this._countTimer&&(clearInterval(this._countTimer),this._countTimer=null);const t=R||(typeof window!="undefined"?window.pronunciationEval:null);if(t&&t.state==="listening")try{t.stopAndEvaluate()}catch(r){}switch(this.currentStep){case 1:this.renderStepPlay(e);break;case 2:this.renderStepRecognize(e);break;case 3:this.renderStepRead(e);break;case 4:this.renderStepPractice(e);break;case 5:this.renderStepPrewrite(e);break;case 6:this.renderStepTrace(e);break;case 7:this.renderStepFreeWrite(e);break;case 8:this.renderStepTestAndChest(e);break}ze.attach(e)}renderStepPlay(e){const t=this.charData;this.activePlayGame&&(this.activePlayGame.destroy(),this.activePlayGame=null),e.innerHTML=`
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-sky-400 via-amber-200 to-orange-300 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col items-center justify-between p-4 animate-fade-in text-center select-none">
        
        <div id="play-interactive-stage" class="relative z-10 w-full flex-1 flex flex-col items-center justify-center"></div>

                ${(()=>{const c=Te(t),u=je(t,M.LEARN),h=!!u.modalities.visual_timeline,m=!!u.modalities.auditory_chant,x=!!u.modalities.semantic_confuse&&c.confusing.hasConfusables;return u.modalities.visual_emoji,`
        <div id="evolution-reveal-box" class="absolute inset-0 bg-black/88 backdrop-blur-md rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center text-white hidden animate-scale-up z-30 overflow-auto">
          <span class="bg-orange-500 text-white font-black text-xs px-4 py-1 rounded-full mb-2 shadow flex-shrink-0">字源 4 阶段演变！</span>

          <!-- E19: 4 阶段 timeline — 由 multimodalEngine 编排 -->
          ${h?`
          <div class="flex items-center gap-2 sm:gap-3 my-2 flex-wrap justify-center">
            ${c.stages.map((g,p)=>`
              <div class="flex flex-col items-center flex-shrink-0">
                <span class="text-[10px] sm:text-xs text-yellow-300 font-bold mb-0.5">${g.label}</span>
                <span class="text-[9px] text-white/50 mb-1">${g.age}</span>
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-amber-950 flex items-center justify-center text-3xl sm:text-4xl font-black shadow-inner border-2"
                     style="background:${g.key==="modern"?"linear-gradient(135deg,#fbbf24,#f97316)":"#fef3c7"};border-color:${g.color};${g.key==="modern"?"color:white;border-color:white;border-width:3px;":""}">
                  ${g.glyph}
                </div>
                ${p<c.stages.length-1?'<span class="text-orange-400 font-black text-xl mt-1 hidden sm:block">→</span>':""}
              </div>
            `).join("")}
          </div>
          `:""}

          <!-- E19: 口诀 + 易错提示 — 由 multimodalEngine 编排 -->
          ${m||x?`
          <div class="flex gap-2 sm:gap-3 mt-2 w-full max-w-3xl flex-wrap justify-center flex-shrink-0">
            ${m?`
            <button id="btn-chant" class="bg-amber-100 text-amber-950 font-black text-xs sm:text-sm px-3 sm:px-5 py-2 rounded-full shadow-md border-2 border-amber-300 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer">
              ${b.speaker("w-3.5 h-3.5")}
              <span>口诀：${c.mnemonic.chant}</span>
            </button>
            `:""}
            ${x?`
              <div class="bg-rose-100/90 text-rose-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-md border-2 border-rose-300 flex items-center gap-1.5">
                <span>⚠️ 别搞混：</span>
                ${c.confusing.pairs.map(g=>`<span class="font-black text-rose-950">${g.other}${g.otherPinyin?"("+g.otherPinyin+")":""}</span>`).join(" ")}
              </div>
            `:""}
          </div>
          `:""}

          <!-- 操作按钮 -->
          <div class="flex items-center gap-3 mt-3 flex-shrink-0">
            <button id="btn-open-morph-play" class="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-2xl border-2 border-white active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
              ${b.sparkle("w-4 h-4")} 动效微剧场
            </button>
            <button id="btn-next-to-rec" class="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-black text-xs sm:text-sm px-6 sm:px-8 py-2.5 sm:py-3 rounded-full shadow-2xl border-2 border-white active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
              ${b.sparkle("w-4 h-4")} 去认字
            </button>
          </div>
        </div>
            `})()}

      </div>
    `;const s=e.querySelector("#play-interactive-stage"),i=e.querySelector("#evolution-reveal-box"),r=e.querySelector("#btn-open-morph-play"),a=e.querySelector("#btn-next-to-rec");this.activePlayGame=fe(s,t,()=>{this._timeout(()=>{i&&i.classList.remove("hidden")},500)}),this.activePlayGame.mount(),r&&this._on(r,"click",()=>{d.playPop(),O(t)});let o=null;const l=e.querySelector("#btn-chant");l&&this._on(l,"click",()=>{if(o){o.cancel(),o=null,l.classList.remove("ring-4","ring-yellow-300");return}d.playPop(),l.classList.add("ring-4","ring-yellow-300");const{plan:c,handle:u}=Le(t,{mode:P.CHANT,bpm:110,soundEngine:d,callbacks:{onBeat(h,m){m===t.char&&l.classList.add("scale-110")},onComplete(){l.classList.remove("ring-4","ring-yellow-300","scale-110"),o=null}}});o=u,this._timeout(()=>{l.classList.remove("ring-4","ring-yellow-300","scale-110"),o=null},c.totalMs+500)}),a&&this._on(a,"click",()=>{d.playPop(),this.currentStep=2,this.render()})}renderStepRecognize(e){const t=this.charData,s=C.getAge(),i=Oe(t,s);d.speakPriority(`认一认：“${t.char}”，拼音读作 ${t.pinyin}。点击大字听发音！`,{kind:"sentence",emotion:"gentle"}),e.innerHTML=`
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex items-center justify-between p-8 animate-fade-in select-none">
        
        <div class="flex-1 flex flex-col items-center justify-center">
          <div class="text-4xl text-yellow-300 font-black tracking-widest mb-3 bg-black/40 px-6 py-1.5 rounded-full border border-white/20 animate-pulse">
            ${t.pinyin}
          </div>

          <button id="btn-jelly-char" class="relative group w-56 h-56 sm:w-64 sm:h-64 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 border-4 border-white shadow-[0_0_60px_rgba(255,160,0,0.8)] flex items-center justify-center text-9xl sm:text-[10rem] font-black text-white active:scale-90 transition-transform cursor-pointer animate-bounce-cathy">
            ${t.char}
            <div class="absolute -bottom-2 bg-amber-900 text-yellow-200 text-[10px] font-black px-3 py-0.5 rounded-full border border-yellow-400">
              点击发音 ${b.speaker("w-4 h-4 inline-block")}
            </div>
          </button>

          <div class="flex items-center gap-3 mt-4">
            <span class="bg-white/20 text-white text-xs font-black px-4 py-1.5 rounded-full border border-white/30 flex items-center gap-1.5">
              ${b.sparkle("w-4 h-4")} <span>共 ${t.strokeCount||4} 笔</span>
            </span>
            <span class="bg-white/20 text-white text-xs font-black px-4 py-1.5 rounded-full border border-white/30 flex items-center gap-1.5">
              ${b.gem("w-4 h-4")} <span>偏旁 [${t.radical||t.char}]</span>
            </span>
          </div>

          <div class="flex items-center gap-2.5 mt-4">
            <button id="btn-open-morph-rec" class="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white text-xs font-black px-4 py-2 rounded-full shadow-lg border-2 border-white/40 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${b.sparkle("w-4 h-4")}</span>
              <span>字源微剧场</span>
            </button>
            <button id="btn-goto-pinyin-island" class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black px-4 py-2 rounded-full shadow-lg border-2 border-white/40 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer" title="前往拼音乐园复习此拼音">
              <span class="flex items-center">${b.mic("w-4 h-4")}</span>
              <span>拼音岛复习</span>
            </button>
          </div>
        </div>

        <div class="w-88 sm:w-96 flex flex-col justify-between h-full bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/30">
          <div>
            ${i?`
            <!-- 分层字义启蒙导引卡 (外部调研建议A / 发展心理学分阶) -->
            <div id="cognitive-stage-card" class="mb-3 p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-300/40 text-left shadow-sm cursor-pointer active:scale-95 transition-all hover:border-amber-300" title="点击听字义启蒙">
              <div class="flex items-center justify-between gap-1 mb-1">
                <span class="text-[11px] font-black text-amber-300 flex items-center gap-1">
                  ${b.book("w-3.5 h-3.5")}
                  <span>${i.title}</span>
                </span>
                <span class="text-[9px] font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">${i.badge}</span>
              </div>
              <p class="text-xs text-yellow-100 font-medium leading-relaxed">${i.text}</p>
              ${i.actionPrompt?`
              <div class="mt-2 pt-2 border-t border-amber-300/30 flex items-start gap-1.5 text-[11px] text-amber-200">
                <span class="shrink-0 mt-0.5">${b.sparkle("w-3.5 h-3.5")}</span>
                <span><strong>身体动一动：</strong>${i.actionPrompt}</span>
              </div>
              `:""}
            </div>
            `:""}

            <h3 class="text-sm font-black text-yellow-300 mb-2.5 flex items-center gap-2">
              <span class="flex items-center">${b.chest("w-5 h-5")}</span>
              <span>生活词语百宝箱：</span>
            </h3>
            
            <div class="flex flex-col gap-2.5">
              ${t.words.map(h=>`
                <button class="word-balloon-btn p-3 bg-gradient-to-r from-amber-50 to-orange-100 hover:from-yellow-200 hover:to-orange-300 rounded-2xl border-2 border-amber-300 text-left flex items-center justify-between shadow-md active:scale-95 transition-all cursor-pointer" data-word="${h.word}">
                  <div>
                    <span class="text-xs font-bold text-amber-700">${h.pinyin}</span>
                    <h4 class="text-base font-black text-amber-950">${h.word}</h4>
                  </div>
                  <span class="flex items-center">${b.speaker("w-4 h-4")}</span>
                </button>
              `).join("")}
            </div>

            <div id="sentence-card" class="mt-4 p-3 bg-black/40 hover:bg-black/60 rounded-2xl border border-white/20 text-xs text-yellow-200 font-semibold leading-relaxed cursor-pointer transition-all active:scale-95" title="点击朗读例句">
              <div class="flex items-center gap-1.5 text-amber-300 font-black mb-1">
                ${b.pen("w-4 h-4")} <span>趣味造句</span>
              </div>
              <p class="text-white/90 text-xs leading-relaxed">${t.sentence}</p>
            </div>
          </div>

          <button id="btn-finish-rec-step" class="mt-4 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white font-black text-base py-3.5 rounded-full shadow-[0_8px_25px_rgba(245,158,11,0.5)] border-2 border-white active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer hover:brightness-105">
            <span class="flex items-center">${b.star("w-5 h-5",!1)}</span>
            <span>掌握认字！开启跟读评测</span>
          </button>
        </div>

      </div>
    `;const r=e.querySelector("#btn-jelly-char");r&&this._on(r,"click",()=>{d.playJellyBoing(),d.speakPriority(`${t.char}，${t.pinyin}`,{kind:"char",priority:1}),d.triggerConfetti(this.container),r.classList.remove("animate-bounce-cathy"),r.classList.add("scale-x-125","scale-y-75"),this._timeout(()=>{r.classList.remove("scale-x-125","scale-y-75"),r.classList.add("scale-x-85","scale-y-115"),this._timeout(()=>{r.classList.remove("scale-x-85","scale-y-115"),r.classList.add("animate-bounce-cathy")},150)},120)}),e.querySelectorAll(".word-balloon-btn").forEach(h=>{this._on(h,"click",()=>{const m=h.dataset.word;d.playPop(),d.speakPriority(m,{kind:"word",priority:1}),h.classList.add("ring-2","ring-yellow-400"),this._timeout(()=>h.classList.remove("ring-2","ring-yellow-400"),400)})});const a=e.querySelector("#cognitive-stage-card");a&&i&&this._on(a,"click",()=>{d.playPop();const h=i.actionPrompt?`${i.text}。凯茜邀请你：${i.actionPrompt}`:i.text;d.speakPriority(h,{kind:"sentence",emotion:"gentle"}),a.classList.add("ring-2","ring-amber-400","bg-amber-500/30"),this._timeout(()=>a.classList.remove("ring-2","ring-amber-400","bg-amber-500/30"),600)});const o=e.querySelector("#sentence-card");o&&this._on(o,"click",()=>{d.playPop(),d.speakPriority(t.sentence,{kind:"sentence",emotion:"gentle"}),o.classList.add("ring-2","ring-yellow-400","bg-black/60"),this._timeout(()=>o.classList.remove("ring-2","ring-yellow-400","bg-black/60"),800)});const l=e.querySelector("#btn-open-morph-rec");l&&this._on(l,"click",()=>{d.playPop(),O(t)});const c=e.querySelector("#btn-goto-pinyin-island");c&&this._on(c,"click",()=>{d.playPop(),d.speakPriority(`去拼音乐园复习拼音“${t.pinyin}”吧！`,{kind:"sentence",emotion:"gentle"}),this._busEmit(N.SWITCH_MODE,{mode:"pinyin",highlightPinyin:t.pinyin})});const u=e.querySelector("#btn-finish-rec-step");u&&this._on(u,"click",()=>{if(d.playPop(),!this._etymologyQuizAnswered){this._etymologyQuizAnswered=!0,ge(t,()=>{this.currentStep=3,this.render()});return}this.currentStep=3,this.render()})}renderStepRead(e){const t=this.charData;d.speakPriority(`读一读：“${t.char}”，点击麦克风大声朗读！`,{kind:"sentence",emotion:"gentle"}),e.innerHTML=`
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-sky-300 flex items-center justify-between p-8 animate-fade-in select-none">
        
        <div class="flex-1 flex flex-col items-center justify-center pr-6 border-r border-white/10">
          <div class="text-3xl text-yellow-300 font-black tracking-widest mb-3 bg-black/40 px-6 py-1.5 rounded-full border border-white/20 animate-pulse">
            ${t.pinyin}
          </div>

          <button id="read-char-circle" class="relative group w-52 h-52 sm:w-60 sm:h-60 rounded-3xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 border-4 border-white shadow-[0_0_50px_rgba(56,189,248,0.7)] flex items-center justify-center text-9xl sm:text-[10rem] font-black text-white active:scale-95 transition-all cursor-pointer animate-bounce-cathy" title="点击听示范发音">
            ${t.char}
            <div class="absolute -bottom-2.5 bg-blue-950 text-sky-200 text-[10px] font-black px-3.5 py-0.5 rounded-full border border-sky-400 flex items-center gap-1 shadow-md">
              <span>示范发音</span>
              <span class="w-3.5 h-3.5 inline-block">${b.speaker("w-3.5 h-3.5")}</span>
            </div>
          </button>

          <div class="flex items-center gap-3 mt-6">
            <span class="bg-white/15 text-white/90 text-xs font-black px-3.5 py-1 rounded-full border border-white/20">部首：${t.radical}</span>
            <span class="bg-white/15 text-white/90 text-xs font-black px-3.5 py-1 rounded-full border border-white/20">笔画：${t.strokeCount||4}画</span>
          </div>
        </div>

        <div id="read-eval-panel" class="w-[380px] flex flex-col justify-between h-full bg-white/10 backdrop-blur-xl rounded-3xl p-6 border-2 border-white/30 text-center relative overflow-hidden">
          
          <div class="z-10">
            <h3 id="read-panel-title" class="text-base font-black text-yellow-300 mb-1 flex items-center justify-center gap-1.5">
              <span>${b.audio("w-4 h-4 inline-block")} 语音评测挑战</span>
            </h3>
            <p id="record-guide-text" class="text-xs text-sky-100 font-bold leading-relaxed">
              点击麦克风，大声读出“<strong class="text-yellow-300 text-sm font-black">${t.char}</strong>”！
            </p>
          </div>

          <div class="my-auto flex flex-col items-center justify-center relative py-2 z-10 w-full">
            
            <div id="mic-interaction-zone" class="flex flex-col items-center justify-center relative w-full">
              <div id="mic-wave-ripples" class="absolute w-32 h-32 rounded-full bg-rose-500/30 -z-0 pointer-events-none hidden">
                <div class="absolute inset-0 rounded-full bg-rose-400/20 animate-ping"></div>
                <div class="absolute -inset-4 rounded-full bg-rose-400/15 animate-ping" style="animation-delay: 0.3s"></div>
              </div>

              <div class="relative w-36 h-36 flex items-center justify-center">
                <canvas id="record-countdown-ring" width="144" height="144" class="absolute inset-0 w-full h-full pointer-events-none z-20 hidden"></canvas>

                <button id="btn-start-record" class="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-rose-500 via-red-500 to-orange-400 shadow-[0_10px_30px_rgba(244,63,94,0.7)] flex items-center justify-center border-4 border-white active:scale-90 transition-all hover:scale-105 cursor-pointer">
                  <div id="mic-icon-wrapper" class="w-12 h-12 text-white flex items-center justify-center pointer-events-none">
                    ${b.audio("w-12 h-12")}
                  </div>
                </button>
              </div>

              <div id="record-vol-bars" class="flex items-center gap-1.5 mt-4 h-6 hidden">
                <div class="vol-bar w-1.5 bg-emerald-400 rounded-full transition-all duration-75" style="height: 20%"></div>
                <div class="vol-bar w-1.5 bg-lime-300 rounded-full transition-all duration-75" style="height: 50%"></div>
                <div class="vol-bar w-1.5 bg-yellow-300 rounded-full transition-all duration-75" style="height: 80%"></div>
                <div class="vol-bar w-1.5 bg-amber-400 rounded-full transition-all duration-75" style="height: 90%"></div>
                <div class="vol-bar w-1.5 bg-yellow-300 rounded-full transition-all duration-75" style="height: 70%"></div>
                <div class="vol-bar w-1.5 bg-lime-300 rounded-full transition-all duration-75" style="height: 40%"></div>
                <div class="vol-bar w-1.5 bg-emerald-400 rounded-full transition-all duration-75" style="height: 20%"></div>
              </div>

              <div id="record-audio-cue" class="mt-2 text-[11px] font-black text-emerald-300 hidden animate-bounce bg-emerald-950/80 border border-emerald-400/50 px-3 py-0.5 rounded-full shadow-lg">
                听到声音啦，继续读！
              </div>

              <div id="record-interim-text" class="mt-2 text-xs font-black text-emerald-300 h-5 transition-opacity duration-300 opacity-0"></div>

              <div id="record-status" class="mt-2 text-xs font-black text-rose-200 tracking-wider">
                点击开始录音
              </div>

              <div id="record-error-text" class="mt-2 text-xs font-black text-rose-300 hidden"></div>
            </div>

            <div id="manual-rating-panel" class="hidden flex flex-col items-center justify-center w-full py-4 animate-fade-in">
              <p class="text-xs text-sky-100 font-bold mb-3 leading-relaxed">当前浏览器不支持语音识别<br/>请给自己打分吧！</p>
              <div id="manual-stars-row" class="flex items-center gap-3">
                <button class="manual-star-btn p-1 transition-transform hover:scale-110 active:scale-90 cursor-pointer" data-stars="1">${b.star("w-8 h-8",!1)}</button>
                <button class="manual-star-btn p-1 transition-transform hover:scale-110 active:scale-90 cursor-pointer" data-stars="2">${b.star("w-10 h-10",!1)}</button>
                <button class="manual-star-btn p-1 transition-transform hover:scale-110 active:scale-90 cursor-pointer" data-stars="3">${b.star("w-8 h-8",!1)}</button>
              </div>
              <p id="manual-rating-status" class="mt-2 text-xs font-black text-yellow-300 h-5"></p>
            </div>

            <div id="read-result-box" class="hidden w-full flex flex-col items-center animate-scale-up bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
              <div id="read-stars-container" class="flex items-center justify-center gap-2 mb-1.5">
                <div class="star-item text-3xl animate-bounce" style="animation-delay: 0.1s">${b.star(!1)}</div>
                <div class="star-item text-4xl animate-bounce" style="animation-delay: 0.2s">${b.star(!1)}</div>
                <div class="star-item text-3xl animate-bounce" style="animation-delay: 0.3s">${b.star(!1)}</div>
              </div>
              <div class="text-3xl font-black text-yellow-300 drop-shadow-md">
                <span id="read-score-num">100</span> <span class="text-sm font-bold">分</span>
              </div>
              <div id="read-praise-text" class="text-xs font-black text-white/90 mt-1 leading-relaxed text-center">
                发音真标准，太厉害了！
              </div>
              
              <div id="read-diagnostics-bar" class="w-full grid grid-cols-3 gap-2 my-2.5 bg-black/40 p-2 rounded-xl border border-white/15 text-center">
                <div class="flex flex-col items-center">
                  <span class="text-[10px] text-gray-300 font-bold">拼音准确</span>
                  <span id="diag-score-accuracy" class="text-xs font-black text-amber-300">--%</span>
                </div>
                <div class="flex flex-col items-center border-x border-white/20">
                  <span class="text-[10px] text-gray-300 font-bold">声调饱满</span>
                  <span id="diag-score-tone" class="text-xs font-black text-emerald-300">--%</span>
                </div>
                <div class="flex flex-col items-center">
                  <span class="text-[10px] text-gray-300 font-bold">吐字流利</span>
                  <span id="diag-score-fluency" class="text-xs font-black text-cyan-300">--%</span>
                </div>
              </div>

              <div class="flex items-center gap-2.5 mt-3 w-full justify-center">
                <button id="btn-replay-my-voice" class="bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black px-3.5 py-1.5 rounded-full shadow-md border border-white flex items-center gap-1 active:scale-95 transition-all cursor-pointer" title="听听刚刚录下的发音">
                  <span id="replay-voice-icon" class="w-3.5 h-3.5 inline-block">${b.speaker("w-3.5 h-3.5")}</span>
                  <span id="replay-voice-text">听我的声音</span>
                </button>
                <button id="btn-play-standard-voice" class="bg-sky-500 hover:bg-sky-400 text-white text-xs font-black px-3 py-1.5 rounded-full border border-white/50 flex items-center gap-1 active:scale-95 transition-all cursor-pointer" title="听老师标准发音">
                  <span>${b.speaker("w-3.5 h-3.5 inline-block")} 听示范</span>
                </button>
                <button id="btn-retry-record" class="bg-white/20 hover:bg-white/30 text-white text-xs font-black px-3 py-1.5 rounded-full border border-white/30 active:scale-95 transition-all cursor-pointer">
                  <span>重录</span>
                </button>
              </div>
            </div>

          </div>

          <div class="z-10">
            <button id="btn-finish-read-step" class="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white font-black text-sm py-3 rounded-full shadow-lg border-2 border-white active:scale-95 transition-all flex items-center justify-center gap-2 opacity-50 pointer-events-none cursor-pointer">
              <span class="w-4 h-4 inline-block">${b.sparkle("w-4 h-4")}</span>
              <span>开启特训练字 (+5 金币)</span> 
            </button>
          </div>

        </div>

      </div>
    `;const s=R||(typeof window!="undefined"?window.pronunciationEval:null),i=e.querySelector("#btn-start-record"),r=e.querySelector("#read-char-circle"),a=e.querySelector("#btn-finish-read-step"),o=e.querySelector("#btn-retry-record"),l=e.querySelector("#btn-replay-my-voice"),c=e.querySelector("#btn-play-standard-voice"),u=e.querySelector("#replay-voice-text");r&&this._on(r,"click",()=>{d.playPop(),d.speakPriority(`${t.char}，${t.pinyin}`,{kind:"char",priority:1})}),i&&this._on(i,"click",()=>{d.synth&&d.synth.cancel(),this.executeRecordToggle(e)}),l&&this._on(l,"click",()=>{d.playPop();const p=R||window.pronunciationEval;if(p&&p._lastResult&&p._lastResult.audioUrl){const y=new Audio(p._lastResult.audioUrl);l.classList.add("ring-4","ring-yellow-300","scale-105"),u&&(u.textContent="正在播放原声...");const f=()=>{l.classList.remove("ring-4","ring-yellow-300","scale-105"),u&&(u.textContent="听我的声音")};y.onended=f,y.onerror=()=>{f(),d.speakPriority(t.char,{kind:"char",priority:1})},y.play().catch(()=>{f(),d.speakPriority(t.char,{kind:"char",priority:1})})}else d.speakPriority(t.char,{kind:"char",priority:1})}),c&&this._on(c,"click",()=>{d.playPop(),d.speakPriority(`${t.char}，${t.pinyin}`,{kind:"char",priority:1})}),o&&this._on(o,"click",()=>{d.playPop();const p=e.querySelector("#read-result-box"),y=e.querySelector("#mic-interaction-zone"),f=e.querySelector("#manual-rating-panel"),v=e.querySelector("#record-status"),w=s&&typeof s.isSupported=="function"&&s.isSupported();p&&p.classList.add("hidden"),w?(y&&y.classList.remove("hidden"),f&&f.classList.add("hidden"),v&&(v.textContent="点击开始录音",v.className="mt-2 text-xs font-black text-rose-200 tracking-wider"),this.executeRecordToggle(e)):(y&&y.classList.add("hidden"),f&&f.classList.remove("hidden"))}),a&&this._on(a,"click",()=>{d.playSuccessSound(),C.addCoins(5),C.save(),d.triggerCoinFly(a,5),this._timeout(()=>{this.currentStep=4,this.render()},500)});const h=s&&typeof s.isSupported=="function"&&s.isSupported(),m=e.querySelector("#mic-interaction-zone"),x=e.querySelector("#manual-rating-panel"),g=e.querySelector("#read-panel-title");h?x&&x.classList.add("hidden"):(m&&m.classList.add("hidden"),x&&x.classList.remove("hidden"),g&&(g.innerHTML=`<span>${b.star("w-4 h-4 inline-block")} 手动发音自评</span>`),this._bindManualRating(e))}_bindManualRating(e){const t=R||window.pronunciationEval,s=e.querySelector("#manual-stars-row"),i=e.querySelector("#manual-rating-status");!s||!t||s.querySelectorAll(".manual-star-btn").forEach(r=>{this._on(r,"click",()=>{const a=parseInt(r.dataset.stars,10);d.playPop(),s.querySelectorAll(".manual-star-btn").forEach((c,u)=>{c.classList.toggle("grayscale",u+1>a),c.classList.toggle("opacity-50",u+1>a)}),i&&(i.textContent=`${a} 颗星！`);const o=this.charData,l=t.manualEvaluate({text:o.char,stars:a});this._timeout(()=>this._showEvalResult(e,l),300)})})}async executeRecordToggle(e){if(this._isRecordingTransition)return;const t=this.charData,s=R||window.pronunciationEval;if(!s)return;const i=e.querySelector("#btn-start-record"),r=e.querySelector("#record-status"),a=e.querySelector("#mic-wave-ripples"),o=e.querySelector("#record-vol-bars"),l=e.querySelector("#record-countdown-ring"),c=e.querySelector("#record-audio-cue"),u=e.querySelector("#read-result-box"),h=e.querySelector("#mic-interaction-zone");if(s.state==="listening"){this._isRecordingTransition=!0,r&&(r.textContent="正在计算发音评分...",r.className="mt-2 text-xs font-black text-amber-300 animate-pulse"),this._volMeterTimer&&(clearInterval(this._volMeterTimer),this._volMeterTimer=null),this._countTimer&&(clearInterval(this._countTimer),this._countTimer=null),a==null||a.classList.add("hidden"),o==null||o.classList.add("hidden"),l==null||l.classList.add("hidden"),c==null||c.classList.add("hidden");try{const f=await s.stopAndEvaluate();f&&this._showEvalResult(e,f)}catch(f){}this._isRecordingTransition=!1;return}this._isRecordingTransition=!0,d.playPop(),u==null||u.classList.add("hidden"),h==null||h.classList.remove("hidden"),a==null||a.classList.remove("hidden"),o==null||o.classList.remove("hidden"),l==null||l.classList.remove("hidden"),c==null||c.classList.add("hidden"),i&&(i.className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-green-400 shadow-[0_10px_30px_rgba(16,185,129,0.7)] flex items-center justify-center border-4 border-white active:scale-90 transition-all hover:scale-105 cursor-pointer ring-4 ring-emerald-300"),r&&(r.textContent="正在启动麦克风...",r.className="mt-2 text-xs font-black text-yellow-300 animate-pulse");let m=!1;try{const f=await s.startEvaluation({text:t.char,mode:"char",maxDurationMs:3200,silenceTimeoutMs:2500,onResult:({transcript:v,isFinal:w})=>{const k=e.querySelector("#record-interim-text");k&&(k.textContent=w?"":`识别到：${v}`,k.classList.toggle("opacity-0",!v||w))}});if(m=f&&f.ok,!m){this._showRecordError(e,(f==null?void 0:f.reason)||"start_failed"),this._resetRecordUI(e),this._isRecordingTransition=!1;return}}catch(f){console.warn("[LearnModule] startEvaluation error:",f),this._showRecordError(e,"exception"),this._resetRecordUI(e),this._isRecordingTransition=!1;return}this._isRecordingTransition=!1;const x=3200,g=performance.now();let p=3;r&&(r.textContent=`正在听你读 (${p}s)... 大声读【${t.char}】`,r.className="mt-2 text-xs font-black text-emerald-300 animate-pulse"),this._volMeterTimer&&clearInterval(this._volMeterTimer);const y=o==null?void 0:o.querySelectorAll(".vol-bar");this._volMeterTimer=setInterval(()=>{if(s.state!=="listening")return;const f=performance.now()-g,v=Math.min(1,f/x);if(l&&l.getContext){const k=l.getContext("2d");k.clearRect(0,0,144,144),k.lineWidth=6,k.strokeStyle="#34d399",k.lineCap="round",k.beginPath(),k.arc(72,72,64,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-v)),k.stroke()}const w=s.getLiveVolume();y&&y.forEach((k,S)=>{const T=Math.max(15,Math.min(100,w*(.8+S*.1)+Math.random()*20));k.style.height=`${T}%`}),c&&w>15&&c.classList.remove("hidden")},50),this._addCleanup(()=>clearInterval(this._volMeterTimer)),this._countTimer&&clearInterval(this._countTimer),this._countTimer=setInterval(()=>{p--,p>0&&s.state==="listening"?r&&(r.textContent=`正在听你读 (${p}s)... 大声读【${t.char}】`):(clearInterval(this._countTimer),this._countTimer=null)},1e3),this._addCleanup(()=>clearInterval(this._countTimer)),this._timeout(async()=>{if(s.state==="listening"){r&&(r.textContent="AI 评测打分中，请稍候...",r.className="mt-2 text-xs font-black text-amber-300 animate-pulse"),this._volMeterTimer&&(clearInterval(this._volMeterTimer),this._volMeterTimer=null),this._countTimer&&(clearInterval(this._countTimer),this._countTimer=null),a==null||a.classList.add("hidden"),o==null||o.classList.add("hidden"),l==null||l.classList.add("hidden"),c==null||c.classList.add("hidden"),i&&(i.className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-rose-500 via-red-500 to-orange-400 shadow-[0_10px_30px_rgba(244,63,94,0.7)] flex items-center justify-center border-4 border-white active:scale-90 transition-all hover:scale-105 cursor-pointer");try{const f=await s.stopAndEvaluate();f&&this._showEvalResult(e,f)}catch(f){}}},x)}_showRecordError(e,t){const s=e.querySelector("#record-error-text"),i=e.querySelector("#record-status"),a={mic_permission_denied:"麦克风权限被拒绝，请在浏览器中开启麦克风访问",asr_permission_denied:"语音识别权限被拒绝",start_failed:"录音启动失败，请重试",exception:"录音遇到异常，请重试",already_running:"正在录音中，请勿重复点击"}[t]||"录音遇到异常，请重试";s&&(s.textContent=a,s.classList.remove("hidden")),i&&(i.textContent="录音未启动",i.className="mt-2 text-xs font-black text-rose-200 tracking-wider"),(t==="mic_permission_denied"||t==="asr_permission_denied")&&this._showMicPermissionModal(e)}_showMicPermissionModal(e){const t=document.getElementById("mic-permission-modal");t&&t.remove();const s=document.createElement("div");s.id="mic-permission-modal",s.className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none",s.innerHTML=`
      <div class="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
        <div class="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 shadow-inner">
          <span class="flex items-center">${b.speaker("w-8 h-8")}</span>
        </div>
        <h3 class="text-lg font-black text-amber-950 mb-1">开启麦克风权限指引</h3>
        <p class="text-xs text-gray-500 font-semibold mb-4">
          为了让 AI 智能评测宝宝的发音，需要允许使用麦克风哦！
        </p>

        <div class="w-full bg-amber-50/80 rounded-2xl p-4 border border-amber-200 text-left text-xs text-amber-950 space-y-2.5 mb-5 font-semibold">
          <div class="flex items-start gap-2">
            <span class="bg-amber-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
            <span><b>苹果 Safari：</b>点击网址左侧的「aA」或设置图标 → 网站设置 → 麦克风设为「允许」</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="bg-amber-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
            <span><b>安卓 / Chrome：</b>点击网址栏前方的安全锁或设置 → 权限 → 开启麦克风</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="bg-amber-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
            <span><b>微信 / 浏览器：</b>点击右上角「···」→ 权限设置 → 允许访问麦克风</span>
          </div>
        </div>

        <div class="flex items-center gap-3 w-full">
          <button id="btn-retry-mic" class="flex-1 btn-game-orange text-white font-black text-xs py-3 rounded-2xl shadow-md active:scale-95 cursor-pointer">
            重新尝试授权
          </button>
          <button id="btn-fallback-manual" class="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs rounded-2xl active:scale-95 cursor-pointer">
            切换手动打分
          </button>
        </div>
      </div>
    `,document.body.appendChild(s),this._on(s.querySelector("#btn-retry-mic"),"click",()=>{s.remove(),this.executeRecordToggle(e)}),this._on(s.querySelector("#btn-fallback-manual"),"click",()=>{s.remove();const i=e.querySelector("#mic-interaction-zone"),r=e.querySelector("#manual-rating-panel");i&&i.classList.add("hidden"),r&&r.classList.remove("hidden"),this._bindManualRating(e)})}_resetRecordUI(e){const t=e.querySelector("#btn-start-record"),s=e.querySelector("#mic-wave-ripples"),i=e.querySelector("#record-vol-bars"),r=e.querySelector("#record-countdown-ring"),a=e.querySelector("#record-audio-cue"),o=e.querySelector("#record-interim-text"),l=e.querySelector("#record-error-text");t&&(t.className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-rose-500 via-red-500 to-orange-400 shadow-[0_10px_30px_rgba(244,63,94,0.7)] flex items-center justify-center border-4 border-white active:scale-90 transition-all hover:scale-105 cursor-pointer"),s==null||s.classList.add("hidden"),i==null||i.classList.add("hidden"),r==null||r.classList.add("hidden"),a==null||a.classList.add("hidden"),o==null||o.classList.add("opacity-0"),l==null||l.classList.add("hidden")}_showEvalResult(e,t){if(this.currentStep!==3)return;const s=this.charData,i=e.querySelector("#mic-interaction-zone"),r=e.querySelector("#read-result-box"),a=e.querySelector("#read-score-num"),o=e.querySelector("#read-praise-text"),l=e.querySelector("#read-stars-container"),c=e.querySelector("#btn-finish-read-step"),u=e.querySelector("#btn-retry-record"),h=typeof t.totalScore=="number"?t.totalScore:typeof t.score=="number"?t.score:0,m=typeof t.stars=="number"?t.stars:h>=85?3:h>=60?2:h>=35?1:0;this._evalStars=m,i&&i.classList.add("hidden"),r&&r.classList.remove("hidden"),a&&(a.textContent=h);const x=e.querySelector("#diag-score-accuracy"),g=e.querySelector("#diag-score-tone"),p=e.querySelector("#diag-score-fluency"),y=typeof t.charAccuracy=="number"?t.charAccuracy:Math.min(100,Math.max(65,h+4)),f=typeof t.toneAccuracy=="number"?t.toneAccuracy:typeof t.completenessScore=="number"?t.completenessScore:Math.min(100,Math.max(65,h+2)),v=typeof t.rhythmScore=="number"?t.rhythmScore:Math.min(100,Math.max(65,h+3));if(x&&(x.textContent=`${Math.round(y)}%`),g&&(g.textContent=`${Math.round(f)}%`),p&&(p.textContent=`${Math.round(v)}%`),h>=85)I.onCorrectPronunciation(),o&&(o.innerHTML='<span class="text-emerald-300 font-bold">发音超级标准！太厉害了！</span><br/><span class="text-white/80 text-[11px]">声母韵母饱满，获得 3 颗星与 5 金币！</span>'),d.playVictoryFanfare(),d.triggerConfetti(e),d.speakPriority(`太棒啦！“${s.char}”字读得真准，得到${h}分！`,{kind:"sentence",emotion:"excited"}),c&&(c.innerHTML=`<span>${b.sparkle("w-4 h-4 inline-block")} 开启特训练字 (+5 金币)</span>`,c.classList.remove("opacity-50","pointer-events-none"),c.className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black py-3 rounded-full shadow-lg border-2 border-white flex items-center justify-center gap-2 active:scale-95 transition-all text-sm cursor-pointer ring-4 ring-yellow-300 animate-pulse");else if(h>=60)I.onCorrectPronunciation(),o&&(o.innerHTML='<span class="text-amber-300 font-bold">读得很棒！声音再清晰一点就满分啦！</span><br/><span class="text-white/80 text-[11px]">获得 2 颗星，再练一次可拿满分哦！</span>'),d.playSuccessSound(),d.speakPriority(`读得不错！得到${h}分，再练一次拿3颗星吧！`,{kind:"sentence",emotion:"happy"}),c&&(c.innerHTML=`<span>${b.sparkle("w-4 h-4 inline-block")} 开启特训练字 (+3 金币)</span>`,c.classList.remove("opacity-50","pointer-events-none"),c.className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black py-3 rounded-full shadow border border-white text-sm active:scale-95 transition-all cursor-pointer");else{I.onWrongAttempt();const w=t.hypothesis||"未检测到清晰发音";o&&(o.innerHTML=`<div class="bg-rose-950/60 border border-rose-400/40 rounded-xl px-3 py-1.5 mb-1"><span class="text-yellow-300 font-bold">识别到读音：“${w}”</span></div><span class="text-rose-200 text-xs">没有读准哦，请点击【听示范】并大声朗读【${s.char}】！</span>`),d.playSoftError(),d.speakPriority(`好像读成了“${w}”啦，请跟我大声读“${s.char}”，再试一次吧！`,{kind:"sentence",emotion:"correction"}),u&&(u.className="bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg border border-white active:scale-95 transition-all cursor-pointer ring-4 ring-yellow-400 animate-pulse"),c&&(c.innerHTML="<span>跳过此步 (0 金币)</span>",c.classList.remove("opacity-50","pointer-events-none"),c.className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 rounded-full border border-white/30 text-xs active:scale-95 transition-all cursor-pointer mt-1")}l&&(l.innerHTML=Array.from({length:3}).map((w,k)=>`
        <div class="star-item text-4xl animate-bounce" style="animation-delay: ${.15*k}s">
          ${b.star(k>=m)}
        </div>
      `).join(""))}renderStepPractice(e){const t=this.charData;let s=0;const i=3;d.speakPriority(`瞄准射击！请击中带有“${t.char}”字的太空发光气球！`,{kind:"sentence",emotion:"excited"}),e.innerHTML=`
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col justify-between p-6 animate-fade-in select-none">
        
        <canvas id="laser-effect-canvas" class="absolute inset-0 w-full h-full pointer-events-none z-20"></canvas>

        <div class="w-full flex items-center justify-between bg-black/60 px-6 py-2.5 rounded-full border border-white/30 text-white z-10">
          <div class="flex items-center gap-2 text-xs font-black text-yellow-300">
            <span>${b.star("w-4 h-4 inline-block")} 目标字：</span>
            <span class="text-xl text-orange-400 bg-black/50 px-3 py-0.5 rounded-xl border border-orange-500">${t.char}</span>
          </div>

          <div class="text-xs font-black text-cyan-300">
            ${b.sparkle("w-4 h-4 inline-block")} 命中进度: <span id="game-hit-progress" class="text-yellow-400 text-base font-black">0 / ${i}</span>
          </div>
        </div>

        <div id="space-shooting-range" class="relative w-full flex-1 flex items-center justify-around my-4 z-10">
          ${(t.gameConfig&&t.gameConfig.options?t.gameConfig.options:[t.char,"月","山"]).map((h,m)=>`
            <button class="balloon-target-btn relative group w-32 h-44 sm:w-40 sm:h-52 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200 border-4 border-white shadow-[0_0_30px_rgba(255,160,0,0.6)] flex flex-col items-center justify-center active:scale-75 transition-all duration-300 animate-bounce-slow cursor-pointer" style="animation-delay: ${m*.3}s" data-char="${h}">
              <span class="text-6xl sm:text-7xl font-black text-amber-950 drop-shadow">${h}</span>
              <div class="w-1.5 h-12 bg-white/40 absolute -bottom-10 rounded-full"></div>
            </button>
          `).join("")}
        </div>

        <div class="w-full flex flex-col items-center justify-center gap-1 z-10">
          <div id="practice-combo-badge" class="text-xs sm:text-sm font-black text-amber-300 bg-black/50 px-4 py-1 rounded-full border border-amber-400/40 opacity-0 transition-all duration-300">
            双连击！太棒啦！
          </div>
          <div class="text-xl sm:text-2xl text-yellow-300 font-black animate-bounce-cathy flex items-center gap-2">
            <span class="flex items-center">${b.arcade("w-6 h-6")}</span>
            <span>凯茜激光战机准备就绪！</span>
          </div>
        </div>

        <div id="practice-win-modal" class="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-white hidden animate-scale-up z-40">
          <div class="flex items-center gap-3 mb-3">
            <span class="flex items-center">${b.star("w-10 h-10",!1)}</span>
            <span class="flex items-center">${b.star("w-12 h-12",!1)}</span>
            <span class="flex items-center">${b.star("w-10 h-10",!1)}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-yellow-300 mb-2">神枪手！射击挑战大满贯！</h2>
          <p class="text-xs sm:text-sm text-gray-300 mb-6 font-semibold">你已经彻底掌握了“${t.char}”字的辨识与发音！</p>
          <button id="btn-next-to-write" class="bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white font-black text-base px-12 py-3.5 rounded-full shadow-[0_8px_25px_rgba(16,185,129,0.6)] border-2 border-white active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
            <span class="flex items-center">${b.hand("w-5 h-5")}</span>
            <span>小手热身 · 控笔训练</span>
          </button>
        </div>

      </div>
    `;const r=e.querySelector("#game-hit-progress"),a=e.querySelector("#practice-win-modal"),o=e.querySelector("#practice-combo-badge"),l=e.querySelector("#btn-next-to-write"),c=e.querySelector("#laser-effect-canvas"),u=h=>{if(!c)return;c.width=c.offsetWidth,c.height=c.offsetHeight;const m=c.getContext("2d"),x=h.getBoundingClientRect(),g=c.getBoundingClientRect(),p=x.left+x.width/2-g.left,y=x.top+x.height/2-g.top,f=g.width/2,v=g.height-25;m.clearRect(0,0,g.width,g.height),m.strokeStyle="#00E5FF",m.lineWidth=8,m.shadowColor="#00E5FF",m.shadowBlur=18,m.beginPath(),m.moveTo(f,v),m.lineTo(p,y),m.stroke(),m.strokeStyle="#FFFFFF",m.lineWidth=3,m.shadowBlur=6,m.beginPath(),m.moveTo(f,v),m.lineTo(p,y),m.stroke(),this._timeout(()=>{m.clearRect(0,0,g.width,g.height)},180)};e.querySelectorAll(".balloon-target-btn").forEach(h=>{this._on(h,"click",()=>{if(s>=i)return;const m=h.dataset.char;if(m===t.char){if(s++,u(h),d.playLaserShoot(),d.speakPriority(t.char,{kind:"char",priority:1}),d.triggerConfetti(this.container),h.classList.add("scale-125","opacity-0"),this._timeout(()=>h.classList.remove("scale-125","opacity-0"),600),o){const x=["好枪法！命中目标！","双连击！太准啦！","三连击！大满贯神枪手！"];o.textContent=x[s-1]||"命中目标！",o.classList.remove("opacity-0"),o.classList.add("opacity-100","scale-110"),this._timeout(()=>o.classList.remove("scale-110"),300)}r&&(r.textContent=`${s} / ${i}`),s>=i&&(d.playVictoryFanfare(),this._timeout(()=>{a&&a.classList.remove("hidden")},600))}else{try{C.recordMistake(t.id,"similar_confuse",{targetChar:t.char,selectedChar:m})}catch(x){}d.playSoftError(),d.speakPriority(`这是“${m}”字，要找的是“${t.char}”字哦！`,{kind:"sentence",emotion:"correction"}),h.classList.add("animate-shake"),this._timeout(()=>h.classList.remove("animate-shake"),600)}})}),l&&this._on(l,"click",()=>{d.playPop(),this.currentStep=5,this.render()})}renderStepPrewrite(e){const t=this.charData,s=C.getAge(),i=C.getWritingStage(),r=C.isWriteBlockedByAge(),a=r?8:6;r?`${t.char}`:`${t.char}`,d.speakPriority(i==="prewrite_only"?`B1铁律模式：${s}岁宝贝先玩手指热身运动！`:"控笔训练开始！先用手指画一画，活动一下小手吧～",{kind:"sentence",emotion:"gentle"}),e.innerHTML=`
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-amber-100 via-orange-50 to-yellow-50 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex items-center justify-between p-6 animate-fade-in select-none">

        <div class="flex-1 flex flex-col items-center justify-center">
          <!-- 训练进度指示 -->
          <div class="mb-3 flex items-center gap-2 bg-black/30 px-4 py-1.5 rounded-full border border-white/30">
            <span class="text-xs font-black text-amber-900">控笔进度:</span>
            <div id="prewrite-shape-beads" class="flex items-center gap-2"></div>
          </div>

          <!-- 控笔 canvas -->
          <div class="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400 bg-white">
            <canvas id="prewrite-canvas" class="w-full h-full cursor-crosshair touch-none"></canvas>
          </div>

          <!-- 当前形状名称 -->
          <div id="prewrite-shape-label" class="mt-3 text-sm font-black text-amber-900 bg-white/70 px-4 py-1 rounded-full border border-amber-300">
            小手准备好～
          </div>
        </div>

        <!-- 右侧信息面板 -->
        <div class="w-72 flex flex-col justify-between h-full bg-white/80 backdrop-blur-md rounded-3xl p-5 border-2 border-amber-200 shadow-xl text-center">
          <div>
            <span class="bg-amber-100 text-amber-800 text-xs font-black px-4 py-1 rounded-full mb-2 inline-block flex items-center justify-center gap-1">
              ${b.hand("w-3.5 h-3.5 inline-block")} 控笔热身训练
            </span>

            <!-- B1/B6 年龄阶段徽章 -->
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black mb-3 ${i==="prewrite_only"?"bg-rose-100 text-rose-700 border border-rose-300":i==="guided_trace"?"bg-amber-100 text-amber-700 border border-amber-300":"bg-emerald-100 text-emerald-700 border border-emerald-300"}">
              <span>${i==="prewrite_only"?"🚫":i==="guided_trace"?"🎯":"✏️"}</span>
              <span>${s}岁 · ${i==="prewrite_only"?"只练控笔不描红":i==="guided_trace"?"引导式描红":"完整描红"}</span>
            </div>

            <h3 class="text-base font-black text-amber-950 mb-2">小手灵活操</h3>
            <p class="text-xs text-gray-600 leading-relaxed font-semibold">
              ${b.sparkle("w-4 h-4 inline-block")}
              跟着发光光球，用手指画虚线形状。
              ${r?"画够 3 个形状就过关啦！":"画完 3 个形状，小手就暖好啦！"}
            </p>
          </div>

          <div class="flex flex-col gap-2.5">
            <button id="btn-grip-guide" class="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs py-2 rounded-full border border-amber-300 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span>${b.hand("w-4 h-4")}</span>
              <span>握笔姿势教学</span>
            </button>

            <button id="btn-skip-prewrite" class="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs py-2.5 rounded-full shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span>${b.sparkle("w-4 h-4")}</span>
              <span>跳过当前形状</span>
            </button>

            <button id="btn-finish-prewrite" class="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-sm py-3 rounded-full shadow-lg border-2 border-white active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer opacity-40 pointer-events-none">
              <span>${a===8?b.chest("w-4 h-4"):b.brush("w-4 h-4")}</span>
              <span id="txt-prewrite-next">完成训练去${a===8?"领宝箱":"描红"}</span>
            </button>
          </div>
        </div>

      </div>
    `;const o=e.querySelector("#prewrite-canvas"),l=e.querySelector("#btn-finish-prewrite"),c=e.querySelector("#btn-skip-prewrite"),u=e.querySelector("#btn-grip-guide"),h=e.querySelector("#prewrite-shape-beads"),m=e.querySelector("#prewrite-shape-label"),x=p=>{if(!h)return;const y=p.getTotalShapes(),f=p.getCurrentShapeNumber();h.innerHTML=Array.from({length:y}).map((v,w)=>{const k=w<f-1,S=w===f-1;return`<span class="w-5 h-5 rounded-full border-2 ${k?"bg-emerald-500 border-white shadow-md":S?"bg-amber-400 border-white shadow-md animate-pulse":"bg-white/40 border-white/60"}"></span>`}).join("")};if(this.prewriteEngine=new ie(o,{enableGripGuide:!0,onComplete:(p,y)=>{var f,v;(v=(f=d).triggerConfetti)==null||v.call(f,this.container),m&&(m.textContent=`太棒啦！覆盖度 ${Math.round(y*100)}%`)},onAllComplete:()=>{var p,y,f,v,w,k;(y=(p=d).playVictoryFanfare)==null||y.call(p),(v=(f=C).addCoins)==null||v.call(f,r?5:3),(k=(w=d).triggerCoinFly)==null||k.call(w,l,r?5:3),r?d.speakPriority(`${s}岁宝贝还太小啦，写字会累小手！今天控笔热身完成啦，我们去领宝箱吧！`,{kind:"sentence",emotion:"gentle"}):d.speakPriority("小手活动好了！接下来去描红写字吧～",{kind:"sentence",emotion:"encouraging"}),l&&(l.classList.remove("opacity-40","pointer-events-none"),l.classList.add("animate-bounce-cathy"),a===8&&(l.innerHTML=`<span>${b.chest("w-5 h-5")}</span><span>领宝箱！</span>`))}}),x(this.prewriteEngine),m){const p=this.prewriteEngine.getCurrentShapeName();m.textContent=`第 ${this.prewriteEngine.getCurrentShapeNumber()}/${this.prewriteEngine.getTotalShapes()} 个形状：${p}`}const g=()=>{if(!(!this.prewriteEngine||this.isDestroyed)&&this.container.isConnected){if(x(this.prewriteEngine),m){const p=this.prewriteEngine.getCurrentShapeNumber(),y=this.prewriteEngine.getTotalShapes();p<=y&&(m.textContent=`第 ${p}/${y} 个形状：${this.prewriteEngine.getCurrentShapeName()}`)}this._updateTimer=requestAnimationFrame(g)}};this._updateTimer=requestAnimationFrame(g),this._addCleanup(()=>{this._updateTimer&&cancelAnimationFrame(this._updateTimer)}),u&&this._on(u,"click",()=>{d.playPop(),d.speakPriority("握好笔的小诀窍：食指和拇指轻轻捏住笔杆，中指从下面托住，像三只小鸟站在树枝上～",{kind:"sentence",emotion:"gentle"});const p=document.createElement("div");p.className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fade-in select-none",p.innerHTML=`
          <div class="bg-white rounded-3xl p-6 max-w-xs text-center shadow-2xl border-4 border-amber-300">
            <div class="text-5xl mb-2">✏️</div>
            <h3 class="font-black text-amber-950 mb-2">三指握笔小口诀</h3>
            <p class="text-xs text-gray-700 leading-relaxed font-semibold mb-3">
              食指拇指捏笔杆<br/>
              中指下面轻轻托<br/>
              小手放松不要紧<br/>
              像只小鸟站枝头～
            </p>
            <button class="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-xs px-6 py-2 rounded-full">知道啦</button>
          </div>
        `,document.body.appendChild(p);const y=p.querySelector("button"),f=()=>p.remove();this._on(y,"click",f),this._on(p,"click",v=>{v.target===p&&f()})}),c&&this._on(c,"click",()=>{var p,y;d.playPop(),this.prewriteEngine&&(this.prewriteEngine.skipCurrent(),this.prewriteEngine.getCurrentShapeNumber()>this.prewriteEngine.getTotalShapes()&&this.prewriteEngine.onAllComplete&&((y=(p=this.prewriteEngine)._finishAll)==null||y.call(p)))}),l&&this._on(l,"click",()=>{d.playPop(),this.prewriteEngine&&(this.prewriteEngine.destroy(),this.prewriteEngine=null),this.currentStep=a,this.render()})}renderStepTrace(e){const t=this.charData;d.speakPriority(`魔法毛笔描红！请从发光起点开始，按照笔顺书写“${t.char}”字！`,{kind:"sentence",priority:1}),e.innerHTML=`
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex items-center justify-between p-8 animate-fade-in select-none">
        
        <div class="flex-1 flex flex-col items-center justify-center">
          <div class="mb-3 flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/20 shadow-md">
            <span class="text-xs font-black text-amber-300">笔画推进:</span>
            <div id="write-stroke-beads" class="flex items-center gap-1.5 flex-wrap justify-center">
              ${t.strokes.map((m,x)=>`
                <span class="stroke-bead px-2.5 py-0.5 rounded-full text-[11px] font-black border transition-all ${x===0?"bg-amber-400 text-amber-950 border-white shadow-md animate-pulse":"bg-white/15 text-white/60 border-white/20"}" data-idx="${x}">
                  ${x+1}.${m.name}
                </span>
              `).join("")}
            </div>
          </div>

          <div class="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400 bg-white">
            <canvas id="hanzi-magic-canvas" class="w-full h-full cursor-crosshair"></canvas>
          </div>
        </div>

        <div class="w-72 flex flex-col justify-between h-full bg-white/80 backdrop-blur-md rounded-3xl p-6 border-2 border-amber-200 shadow-xl text-center">
          <div>
            <span class="bg-amber-100 text-amber-800 text-xs font-black px-4 py-1 rounded-full mb-3 inline-block flex items-center justify-center gap-1">
              ${b.brush("w-3.5 h-3.5 inline-block")} 阶段一 · 有轨描红
            </span>
            <h3 class="text-lg font-black text-amber-950 mb-2">规范笔顺描红</h3>
            <p class="text-xs text-gray-600 leading-relaxed font-semibold">
              ${b.sparkle("w-4 h-4 inline-block")} 沿黄色魔法光球滑行，遇到倒笔画系统会自动提示并拦截哦！
            </p>
          </div>

          <div class="flex flex-col gap-2.5">
            <button id="btn-toggle-grid" class="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs py-2 rounded-full border border-amber-300 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${b.pen("w-3.5 h-3.5")}</span>
              <span id="txt-grid-type">当前格线：米字格 (切田字格)</span>
            </button>

            <button id="btn-demo-write" class="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs sm:text-sm py-2.5 rounded-full shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${b.sparkle("w-4 h-4")}</span>
              <span>演示全字笔顺</span>
            </button>

            <button id="btn-reset-write" class="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs py-2.5 rounded-full shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${b.brush("w-4 h-4")}</span>
              <span>重新临摹这一字</span>
            </button>

            <button id="btn-finish-write-step" class="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white font-black text-base py-3.5 rounded-full shadow-[0_8px_25px_rgba(245,158,11,0.6)] border-2 border-white active:scale-95 transition-all flex items-center justify-center gap-2 hidden animate-bounce-slow cursor-pointer hover:brightness-105">
              <span class="flex items-center">${b.pen("w-5 h-5")}</span>
              <span>描红达标！去独立书写</span>
            </button>
          </div>
        </div>

      </div>
    `;const s=e.querySelector("#hanzi-magic-canvas"),i=e.querySelector("#btn-demo-write"),r=e.querySelector("#btn-reset-write"),a=e.querySelector("#btn-toggle-grid"),o=e.querySelector("#txt-grid-type"),l=e.querySelector("#btn-finish-write-step"),c=e.querySelectorAll(".stroke-bead"),u=m=>{c.forEach((x,g)=>{g<m?x.className="stroke-bead px-2.5 py-0.5 rounded-full text-[11px] font-black border bg-emerald-500 text-white border-white shadow-md":g===m?x.className="stroke-bead px-2.5 py-0.5 rounded-full text-[11px] font-black border bg-amber-400 text-amber-950 border-white shadow-md animate-pulse":x.className="stroke-bead px-2.5 py-0.5 rounded-full text-[11px] font-black border bg-white/15 text-white/60 border-white/20"})};this.hanziEngine=new G(s,t,()=>{d.triggerConfetti(this.container),l&&l.classList.remove("hidden")},m=>{u(m+1)});const h=C.getWritingStage();this.hanziEngine&&h==="guided_trace"&&(this.hanziEngine.gridType="tian"),a&&o&&this._on(a,"click",()=>{d.playPop();const m=this.hanziEngine.toggleGridType();o.textContent=m==="mi"?"当前格线：米字格 (切田字格)":"当前格线：田字格 (切米字格)"}),i&&this._on(i,"click",()=>{d.playPop(),d.speakPriority(`看小精灵示范“${t.char}”字的笔顺！`,{kind:"sentence",emotion:"gentle"}),this.hanziEngine&&(i.classList.add("opacity-50","pointer-events-none"),this.hanziEngine.demoAllStrokes(()=>{i.classList.remove("opacity-50","pointer-events-none"),u(0),d.speakPriority(`轮到小勇士来写“${t.char}”字啦！`,{kind:"sentence",emotion:"encouraging"})}))}),r&&this._on(r,"click",()=>{d.playPop(),this.hanziEngine&&this.hanziEngine.reset(),u(0),l&&l.classList.add("hidden")}),l&&this._on(l,"click",()=>{d.playPop(),this.currentStep=7,this.render()})}renderStepWrite(e){return this.renderStepTrace(e)}renderStepFreeWrite(e){const t=this.charData;d.speakPriority(`小书法家挑战！拿掉虚线，凭记忆在米字格里写出漂亮的“${t.char}”字！`,{kind:"sentence",priority:1}),e.innerHTML=`
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-50 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex items-center justify-between p-8 animate-fade-in select-none">
        
        <div class="flex-1 flex flex-col items-center justify-center">
          <div class="mb-3 flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/20 shadow-md">
            <span class="text-xs font-black text-amber-300">笔画回忆:</span>
            <div id="freewrite-stroke-beads" class="flex items-center gap-1.5 flex-wrap justify-center">
              ${t.strokes.map((m,x)=>`
                <span class="stroke-bead px-2.5 py-0.5 rounded-full text-[11px] font-black border transition-all ${x===0?"bg-amber-400 text-amber-950 border-white shadow-md animate-pulse":"bg-white/15 text-white/60 border-white/20"}" data-idx="${x}">
                  ${x+1}.${m.name}
                </span>
              `).join("")}
            </div>
          </div>

          <div class="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400 bg-white">
            <canvas id="hanzi-freewrite-canvas" class="w-full h-full cursor-crosshair"></canvas>
          </div>
        </div>

        <div class="w-72 flex flex-col justify-between h-full bg-white/80 backdrop-blur-md rounded-3xl p-6 border-2 border-amber-200 shadow-xl text-center">
          <div>
            <span class="bg-amber-100 text-amber-800 text-xs font-black px-4 py-1 rounded-full mb-3 inline-block flex items-center justify-center gap-1">
              ${b.pen("w-3.5 h-3.5 inline-block")} 阶段二 · 独立书写
            </span>
            <h3 class="text-lg font-black text-amber-950 mb-2">小书法家挑战</h3>
            <p class="text-xs text-gray-600 leading-relaxed font-semibold">
              没有虚线跟着写啦！凭小脑瓜里的记忆，一笔一画写出漂亮的“${t.char}”字！
            </p>
          </div>

          <div class="flex flex-col gap-2.5">
            <button id="btn-peek-guide" class="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs py-2.5 rounded-full border border-amber-300 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${b.sparkle("w-3.5 h-3.5")}</span>
              <span>偷偷看一眼提示 (2秒)</span>
            </button>

            <button id="btn-toggle-grid-free" class="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs py-2 rounded-full border border-amber-300 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${b.pen("w-3.5 h-3.5")}</span>
              <span id="txt-grid-type-free">当前格线：米字格 (切田字格)</span>
            </button>

            <button id="btn-reset-freewrite" class="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs py-2.5 rounded-full shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span class="flex items-center">${b.brush("w-4 h-4")}</span>
              <span>重写这一字</span>
            </button>

            <button id="btn-finish-freewrite-step" class="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white font-black text-base py-3.5 rounded-full shadow-[0_8px_25px_rgba(245,158,11,0.6)] border-2 border-white active:scale-95 transition-all flex items-center justify-center gap-2 hidden animate-bounce-slow cursor-pointer hover:brightness-105">
              <span class="flex items-center">${b.chest("w-5 h-5")}</span>
              <span>独立书写大成功！去领通关宝箱</span>
            </button>
          </div>
        </div>

      </div>
    `;const s=e.querySelector("#hanzi-freewrite-canvas"),i=e.querySelector("#btn-peek-guide"),r=e.querySelector("#btn-reset-freewrite"),a=e.querySelector("#btn-toggle-grid-free"),o=e.querySelector("#txt-grid-type-free"),l=e.querySelector("#btn-finish-freewrite-step"),c=e.querySelectorAll(".stroke-bead"),u=m=>{c.forEach((x,g)=>{g<m?x.className="stroke-bead px-2.5 py-0.5 rounded-full text-[11px] font-black border bg-emerald-500 text-white border-white shadow-md":g===m?x.className="stroke-bead px-2.5 py-0.5 rounded-full text-[11px] font-black border bg-amber-400 text-amber-950 border-white shadow-md animate-pulse":x.className="stroke-bead px-2.5 py-0.5 rounded-full text-[11px] font-black border bg-white/15 text-white/60 border-white/20"})};this.hanziEngine=new G(s,t,()=>{d.triggerConfetti(this.container),d.playVictoryFanfare(),C.addCoins(3),d.speakPriority(`太厉害了！小书法家独立写出了“${t.char}”字！`,{kind:"sentence",emotion:"excited"}),l&&l.classList.remove("hidden")},m=>{u(m+1)},{freeWrite:!0});const h=C.getWritingStage();this.hanziEngine&&h==="guided_trace"&&(this.hanziEngine.gridType="tian"),a&&o&&this._on(a,"click",()=>{d.playPop();const m=this.hanziEngine.toggleGridType();o.textContent=m==="mi"?"当前格线：米字格 (切田字格)":"当前格线：田字格 (切米字格)"}),i&&this._on(i,"click",()=>{d.playPop(),d.speakPriority("小精灵给你提示一眼，看清楚笔顺马上写哦！",{kind:"sentence",emotion:"gentle"}),this.hanziEngine&&this.hanziEngine.peekGuide(2500)}),r&&this._on(r,"click",()=>{d.playPop(),this.hanziEngine&&this.hanziEngine.reset(),u(0),l&&l.classList.add("hidden")}),l&&this._on(l,"click",()=>{d.playPop(),this.currentStep=8,this.render()})}renderStepTestAndChest(e){const t=this.charData;e.innerHTML=`
      <div class="relative w-full max-w-5xl h-[520px] sm:h-[560px] bg-gradient-to-b from-purple-950 via-indigo-950 to-purple-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col items-center justify-center p-8 animate-fade-in text-center text-white">
        
        <div id="golden-chest-stage" class="flex flex-col items-center">
          
          <div class="flex items-center gap-4 mb-4">
            <div id="star-slot-1" class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center transition-all duration-500 shadow-inner">
              <span class="flex items-center">${b.star("w-8 h-8 opacity-30",!0)}</span>
            </div>
            <div id="star-slot-2" class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center -translate-y-2 transition-all duration-500 shadow-inner">
              <span class="flex items-center">${b.star("w-10 h-10 opacity-30",!0)}</span>
            </div>
            <div id="star-slot-3" class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center transition-all duration-500 shadow-inner">
              <span class="flex items-center">${b.star("w-8 h-8 opacity-30",!0)}</span>
            </div>
          </div>

          <button id="btn-open-golden-chest" class="group relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 border-4 border-white shadow-[0_0_60px_rgba(255,235,59,0.8)] flex items-center justify-center active:scale-90 transition-transform cursor-pointer animate-bounce-slow">
            <span class="flex items-center">${b.chest("w-28 h-28 sm:w-36 sm:h-36")}</span>
            <div class="absolute -bottom-3 bg-red-600 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg border border-white">
              点击开启通关宝箱！
            </div>
          </button>

          <h2 class="text-xl sm:text-2xl font-black text-yellow-300 mt-6 mb-1">
            恭喜凯茜小勇士！通关“${t.char}”字大冒险！
          </h2>
        </div>

        <div id="chest-reward-card" class="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center justify-center text-white hidden animate-scale-up z-30">
          <div class="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 border-4 border-white text-7xl sm:text-8xl font-black flex items-center justify-center shadow-2xl mb-4 animate-bounce-cathy">
            ${t.char}
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-yellow-300 mb-1">获得全新专属字卡：${t.char}</h2>
          <p class="text-xs sm:text-sm text-gray-300 mb-4 flex items-center gap-3">
            <span class="flex items-center gap-1">${b.coin("w-5 h-5")} 获得 10 凯茜星币</span>
            <span class="flex items-center gap-1">${b.star("w-5 h-5",!1)} 3 颗凯茜之星</span>
          </p>

          <button id="btn-confirm-return-map" class="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:to-red-400 text-white font-black text-base sm:text-lg px-12 py-3.5 rounded-full shadow-[0_0_40px_rgba(255,107,0,0.9)] border-2 border-white active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer">
            <span class="flex items-center">${b.home("w-5 h-5")}</span>
            <span>收入生词本，返回大地图</span>
          </button>
        </div>

      </div>
    `;const s=e.querySelector("#btn-open-golden-chest"),i=e.querySelector("#chest-reward-card"),r=e.querySelector("#btn-confirm-return-map"),a=e.querySelector("#star-slot-1"),o=e.querySelector("#star-slot-2"),l=e.querySelector("#star-slot-3");this._isChestOpening=!1,s&&this._on(s,"click",()=>{var u;if(this._isChestOpening)return;this._isChestOpening=!0,s.style.pointerEvents="none",s.classList.add("pointer-events-none","opacity-80"),d.playChestOpen(),d.playVictoryFanfare(),d.triggerConfetti(this.container),d.triggerCoinFly(this.container);const c=Math.max(0,Math.min(3,(u=this._evalStars)!=null?u:3));this._timeout(()=>{c>=1&&(d.playStarEarned(1),a&&(a.innerHTML=`<span class="flex items-center">${b.star("w-12 h-12",!1)}</span>`,a.classList.add("bg-yellow-400","scale-125","shadow-[0_0_20px_rgba(255,235,59,1)]")))},200),this._timeout(()=>{c>=2&&(d.playStarEarned(2),o&&(o.innerHTML=`<span class="flex items-center">${b.star("w-14 h-14",!1)}</span>`,o.classList.add("bg-yellow-400","scale-125","shadow-[0_0_20px_rgba(255,235,59,1)]")))},600),this._timeout(()=>{c>=3&&(d.playStarEarned(3),l&&(l.innerHTML=`<span class="flex items-center">${b.star("w-12 h-12",!1)}</span>`,l.classList.add("bg-yellow-400","scale-125","shadow-[0_0_20px_rgba(255,235,59,1)]")))},1e3),this._timeout(()=>{i&&i.classList.remove("hidden"),this.clearProgress(),C.completeCharacter(t.id,c),this._busEmit(N.LEARN_FINISH,{charId:t.id,stars:c})},1400)}),r&&this._on(r,"click",()=>{d.playPop(),this.onFinish?this.onFinish():this._busEmit(N.SWITCH_MODE,{mode:"map"})})}}export{We as LearnModule};
