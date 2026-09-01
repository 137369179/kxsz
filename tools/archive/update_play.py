import re

with open("src/utils/playSceneEngine.js", "r", encoding="utf-8") as f:
    content = f.read()

# Update the render() function to include 日, 月, 水
old_render = """  render() {
    switch (this.char.char) {
      case "山": return this.renderEducationalMountain();
      case "火": return this.renderEducationalFire();
      case "木": return this.renderEducationalWood();
      case "口": return this.renderEducationalMouth();
    }
    this.renderGenericScene();
  }"""

new_render = """  render() {
    switch (this.char.char) {
      case "山": return this.renderEducationalMountain();
      case "火": return this.renderEducationalFire();
      case "木": return this.renderEducationalWood();
      case "口": return this.renderEducationalMouth();
      case "日": return this.renderEducationalSun();
      case "月": return this.renderEducationalMoon();
      case "水": return this.renderEducationalWater();
    }
    this.renderGenericScene();
  }"""

content = content.replace(old_render, new_render)

# Now append the 3 new functions right before renderGenericScene
insertion_point = "  renderGenericScene() {"

new_functions = """
  // ============================================================================
  // 深度认知 5：【日】 (破石而出，光芒万丈)
  // 教育点：“日”代表太阳，字形外框是实体，中间一横是光斑/核心。
  // 玩法：连续重击敲碎包裹太阳的岩石，每次敲击伴随屏幕震动与碎石飞溅。
  // ============================================================================
  renderEducationalSun() {
    this.mount.innerHTML = `
      <div class="relative w-full h-full bg-slate-950 overflow-hidden select-none touch-none flex flex-col items-center justify-center">
        <div class="absolute top-8 z-30 bg-black/50 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg">
          💡 连续用力点击岩石，砸碎它，释放出太阳！
        </div>

        <div class="relative flex items-center justify-center mt-10">
          <!-- 真实的太阳 (被岩石遮挡) -->
          <div id="real-sun" class="absolute w-40 h-40 bg-gradient-to-tr from-yellow-300 to-orange-500 rounded-full shadow-[0_0_100px_rgba(255,200,0,0)] opacity-0 scale-50 transition-all duration-1000 z-10 flex flex-col items-center justify-center">
            <div class="w-24 h-2 bg-orange-200/80 rounded-full shadow-inner"></div> <!-- 模拟“日”中间的一横 -->
          </div>

          <!-- 遮挡的岩石外壳 -->
          <div id="stone-shell" class="relative w-48 h-48 bg-slate-700 rounded-[40%] shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_20px_30px_rgba(0,0,0,0.8)] border-4 border-slate-600 cursor-pointer flex items-center justify-center z-20 transition-transform active:scale-95">
             <!-- 裂纹 SVG (初始隐藏) -->
             <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-80" viewBox="0 0 100 100">
               <path id="crack-1" d="M50,0 L45,30 L60,50" fill="none" stroke="#1e293b" stroke-width="2" class="opacity-0 transition-opacity" />
               <path id="crack-2" d="M60,50 L80,70 L100,60" fill="none" stroke="#1e293b" stroke-width="2" class="opacity-0 transition-opacity" />
               <path id="crack-3" d="M45,30 L20,40 L0,30" fill="none" stroke="#1e293b" stroke-width="3" class="opacity-0 transition-opacity" />
               <path id="crack-4" d="M60,50 L40,80 L50,100" fill="none" stroke="#1e293b" stroke-width="3" class="opacity-0 transition-opacity" />
             </svg>
          </div>
        </div>
      </div>
    `;

    const shell = this.mount.querySelector("#stone-shell");
    const sun = this.mount.querySelector("#real-sun");
    let hits = 0;

    this.on(shell, "pointerdown", (e) => {
      if (this.done) return;
      hits++;
      soundAndFX.playStrokeSound();
      this.shakeScreen();

      // 爆出碎石粒子
      const rect = shell.getBoundingClientRect();
      this.spawnParticles(e.clientX, e.clientY, { colorClass: 'bg-slate-500', count: 8, lift: 60, speed: () => Math.random()*80 + 50 });

      // 显示裂纹
      const crack = this.mount.querySelector(`#crack-${hits}`);
      if (crack) crack.style.opacity = "1";

      // 岩石透出红光
      shell.style.boxShadow = `inset 0 0 ${hits * 20}px rgba(255,100,0,${hits * 0.2}), 0 20px 30px rgba(0,0,0,0.8)`;

      if (hits >= 4) {
        this.done = true;
        this.flashScreen();
        this.shakeScreen();
        
        // 岩石炸开碎裂
        shell.style.transition = "all 0.5s cubic-bezier(0.55, 0.055, 0.675, 0.19)";
        shell.style.transform = "scale(1.5)";
        shell.style.opacity = "0";
        this.spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, { colorClass: 'bg-slate-600', count: 30, lift: 100, speed: () => Math.random()*200 });

        // 太阳出现
        soundAndFX.playChestOpen();
        sun.style.opacity = "1";
        sun.style.transform = "scale(1)";
        sun.style.boxShadow = "0 0 100px rgba(255,200,0,1)";
        sun.classList.add("animate-pulse");

        this.spawnScoreText(rect.left + rect.width/2, rect.top - 50, "光芒万丈!");
        this.finish();
      }
    });
  }

  // ============================================================================
  // 深度认知 6：【月】 (星月交辉，接星星)
  // 教育点：“月”字的形状像一弯新月（撇和横折钩），中间两横代表月晕或星光。
  // 玩法：拖拽底部的“新月舟”接住天上掉下来的两颗流星，流星落入月中化作两横。
  // ============================================================================
  renderEducationalMoon() {
    this.mount.innerHTML = `
      <div class="relative w-full h-full bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-900 overflow-hidden select-none touch-none flex flex-col items-center">
        <div class="absolute top-8 z-30 bg-black/50 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg">
          💡 左右拖动新月，接住掉落的 2 颗流星！
        </div>

        <!-- 掉落的流星 -->
        <div id="star-1" class="absolute top-0 w-8 h-8 text-2xl filter drop-shadow-[0_0_10px_rgba(253,224,71,1)] z-10 transition-transform">⭐</div>
        <div id="star-2" class="absolute -top-20 w-8 h-8 text-2xl filter drop-shadow-[0_0_10px_rgba(253,224,71,1)] z-10 transition-transform">⭐</div>

        <!-- 新月舟 (模拟月的外框：撇 + 横折钩) -->
        <div id="moon-boat" class="absolute bottom-20 w-32 h-32 bg-transparent border-[12px] border-yellow-200 border-t-transparent border-r-transparent rounded-bl-full shadow-[-10px_10px_20px_rgba(253,224,71,0.4)] flex flex-col items-center justify-center gap-2 cursor-ew-resize z-20">
           <!-- 内部的两横 (初始隐藏) -->
           <div id="moon-stroke-1" class="w-12 h-3 bg-yellow-300 rounded-full opacity-0 shadow-[0_0_10px_rgba(253,224,71,1)] transition-all duration-300 transform -translate-x-4"></div>
           <div id="moon-stroke-2" class="w-12 h-3 bg-yellow-300 rounded-full opacity-0 shadow-[0_0_10px_rgba(253,224,71,1)] transition-all duration-300 transform -translate-x-2"></div>
        </div>
      </div>
    `;

    const boat = this.mount.querySelector("#moon-boat");
    const s1 = this.mount.querySelector("#star-1");
    const s2 = this.mount.querySelector("#star-2");
    const stroke1 = this.mount.querySelector("#moon-stroke-1");
    const stroke2 = this.mount.querySelector("#moon-stroke-2");
    
    let dragging = false, lastX = 0, boatX = 0;
    let caught = 0;

    // 船的水平拖动
    this.on(boat, "pointerdown", (e) => {
      if (this.done) return;
      dragging = true; lastX = e.clientX;
      boat.style.transition = "none";
    });

    this.onWindow("pointermove", (e) => {
      if (!dragging || this.done) return;
      let dx = e.clientX - lastX; lastX = e.clientX;
      boatX = Math.max(-120, Math.min(120, boatX + dx));
      boat.style.transform = `translateX(${boatX}px)`;
    });

    this.onWindow("pointerup", () => { dragging = false; });

    // 星星坠落逻辑
    let star1Y = 0, star2Y = -150;
    let star1X = -80, star2X = 80;
    
    s1.style.left = `calc(50% + ${star1X}px - 16px)`;
    s2.style.left = `calc(50% + ${star2X}px - 16px)`;

    const gameLoop = () => {
      if (this.done) return;
      
      // 移动星星
      if (!s1.dataset.caught) {
        star1Y += 3; s1.style.transform = `translateY(${star1Y}px)`;
        // 拖尾粒子
        if(Math.random()<0.1) this.spawnParticles(window.innerWidth/2 + star1X, star1Y, {colorClass: 'bg-yellow-200', count: 1, size: ()=>3, duration: 300});
      }
      if (!s2.dataset.caught) {
        star2Y += 4; s2.style.transform = `translateY(${star2Y}px)`;
        if(Math.random()<0.1) this.spawnParticles(window.innerWidth/2 + star2X, star2Y, {colorClass: 'bg-yellow-200', count: 1, size: ()=>3, duration: 300});
      }

      // 碰撞检测
      const boatRect = boat.getBoundingClientRect();
      const checkCollision = (star, sX, sY, strokeEl) => {
        if (star.dataset.caught) return;
        const sRect = star.getBoundingClientRect();
        // 如果星星落到底部区域并且在船的水平范围内
        if (sRect.bottom > boatRect.top + 40 && sRect.bottom < boatRect.bottom) {
          if (sRect.left > boatRect.left - 20 && sRect.right < boatRect.right + 20) {
            star.dataset.caught = "true";
            star.style.opacity = "0";
            strokeEl.style.opacity = "1"; // 点亮月亮内部的一横
            strokeEl.style.transform = "translateX(0) scale(1.2)";
            setTimeout(()=> strokeEl.style.transform = "translateX(0) scale(1)", 200);
            
            soundAndFX.playPop();
            this.shakeScreen();
            this.spawnParticles(sRect.left, sRect.bottom, { colorClass: 'bg-yellow-300', count: 15 });
            this.spawnScoreText(sRect.left, sRect.top - 20, "+1");
            caught++;

            if (caught >= 2) {
              this.done = true;
              this.flashScreen();
              soundAndFX.playChestOpen();
              boat.classList.add("shadow-[0_0_80px_rgba(253,224,71,0.8)]"); // 月亮大放异彩
              boat.style.transition = "all 0.5s ease";
              boat.style.transform = "translateX(0px) rotate(15deg) scale(1.2)"; // 摆正月亮
              this.finish();
            }
          }
        }
        
        // 掉出屏幕重置
        if (sY > window.innerHeight) {
          if (star === s1) star1Y = -50;
          if (star === s2) star2Y = -50;
        }
      };

      checkCollision(s1, star1X, star1Y, stroke1);
      checkCollision(s2, star2X, star2Y, stroke2);

      this._raf = requestAnimationFrame(gameLoop);
    };
    this._raf = requestAnimationFrame(gameLoop);
  }

  // ============================================================================
  // 深度认知 7：【水】 (水球弹射，水花飞溅)
  // 教育点：“水”字是中间一道水流，两边是溅起的水花。
  // 玩法：向后拉动水球（弹弓物理），松手射爆在墙上，四溅的水花直接形成“水”字。
  // ============================================================================
  renderEducationalWater() {
    this.mount.innerHTML = `
      <div class="relative w-full h-full bg-slate-200 overflow-hidden select-none touch-none flex flex-col items-center">
        <div class="absolute top-8 z-30 bg-black/50 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg">
          💡 往下长按拖拽水球，像弹弓一样把它射向墙壁！
        </div>

        <!-- 墙面水渍 (初始隐藏)，精准的“水”字书法形态 -->
        <div id="water-splat" class="absolute top-32 flex flex-col items-center opacity-0 scale-50 transition-all duration-700 z-10 filter drop-shadow-[0_5px_5px_rgba(59,130,246,0.5)]">
           <!-- 中间竖钩 -->
           <div class="w-8 h-40 bg-blue-500 rounded-full relative">
              <div class="absolute bottom-0 -left-4 w-6 h-10 bg-blue-500 rounded-full -rotate-45"></div>
           </div>
           <!-- 左横撇 -->
           <div class="absolute top-10 -left-16 w-16 h-6 bg-blue-400 rounded-full rotate-45"></div>
           <div class="absolute top-16 -left-16 w-12 h-6 bg-blue-400 rounded-full -rotate-[60deg]"></div>
           <!-- 右撇捺 -->
           <div class="absolute top-10 -right-16 w-16 h-6 bg-blue-400 rounded-full -rotate-45"></div>
           <div class="absolute top-20 -right-20 w-16 h-6 bg-blue-400 rounded-full rotate-45"></div>
        </div>

        <!-- 发射台与水球 -->
        <div class="absolute bottom-20 flex flex-col items-center z-30">
          <div id="slingshot-band" class="absolute top-10 w-2 h-0 bg-white/50 rounded-full shadow-inner origin-top"></div>
          
          <div id="water-balloon" class="w-24 h-24 bg-gradient-to-br from-blue-300 to-blue-600 rounded-[100%] shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.2),0_10px_20px_rgba(37,99,235,0.5)] border-4 border-blue-400 cursor-s-resize flex items-center justify-center text-4xl overflow-hidden relative">
             <div class="absolute top-2 left-4 w-6 h-4 bg-white/40 rounded-full rotate-45"></div> <!-- 高光 -->
          </div>
        </div>
      </div>
    `;

    const balloon = this.mount.querySelector("#water-balloon");
    const band = this.mount.querySelector("#slingshot-band");
    const splat = this.mount.querySelector("#water-splat");
    
    let dragging = false, startY = 0, pullDist = 0;
    const MAX_PULL = 150;

    this.on(balloon, "pointerdown", (e) => {
      if (this.done) return;
      dragging = true; startY = e.clientY;
      balloon.style.transition = "none";
    });

    this.onWindow("pointermove", (e) => {
      if (!dragging || this.done) return;
      pullDist = Math.max(0, Math.min(MAX_PULL, e.clientY - startY));
      
      // Squash & Stretch physics
      const stretch = 1 + pullDist/300;
      const squash = 1 - pullDist/400;
      balloon.style.transform = `translateY(${pullDist}px) scale(${squash}, ${stretch})`;
      
      // 弹弓皮筋
      band.style.height = `${pullDist + 20}px`;
    });

    this.onWindow("pointerup", () => {
      if (!dragging) return;
      dragging = false;
      band.style.height = "0px";

      if (pullDist > 80) { // 拉得足够开，发射！
        this.done = true;
        soundAndFX.playStrokeSound();
        
        balloon.style.transition = "transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        balloon.style.transform = `translateY(-400px) scale(0.8, 1.5)`; // 极速飞出
        
        setTimeout(() => {
          // 爆裂冲击
          balloon.style.opacity = "0";
          this.shakeScreen();
          this.flashScreen();
          soundAndFX.playPop(); // Splat 声音
          
          const rect = balloon.getBoundingClientRect();
          // 大量水花粒子喷射
          this.spawnParticles(window.innerWidth/2, 150, { colorClass: 'bg-blue-400', count: 40, lift: 150, speed: () => Math.random()*250 });
          this.spawnScoreText(window.innerWidth/2, 100, "水花四溅!");

          // 墙上留下水字
          splat.style.opacity = "1";
          splat.style.transform = "scale(1.2)";
          setTimeout(() => splat.style.transform = "scale(1)", 200);

          this.finish();
        }, 150);
      } else {
        // 拉力不够，弹回
        balloon.style.transition = "transform 0.4s cubic-bezier(0.36,-0.5,0.5,1.5)";
        balloon.style.transform = "translateY(0px) scale(1, 1)";
        pullDist = 0;
        soundAndFX.playSoftError();
      }
    });
  }
"""

content = content.replace(insertion_point, new_functions + "\n" + insertion_point)

with open("src/utils/playSceneEngine.js", "w", encoding="utf-8") as f:
    f.write(content)

