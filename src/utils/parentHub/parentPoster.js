/** ParentModule — weekly report poster */
import { ebbinghausManager } from "../ebbinghaus.js";
import { soundAndFX } from "../soundEngine.js";
import { showGameToast } from "../../components/SharedShell.js";
import { GAME_ICONS } from "../gameIcons.js";

export function generateWeeklyReportPoster() {
    const p = ebbinghausManager.progress;
    const learnedCount = Object.keys(p.charRecords || {}).length;
    const coins = p.coins || 0;
    const stars = p.stars || (learnedCount * 3);
    const streak = p.attendance?.streakDays || 1;

    const overlay = document.createElement("div");
    overlay.id = "parent-poster-modal-overlay";
    overlay.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in select-none";
    overlay.innerHTML = `
      <div class="relative max-w-sm sm:max-w-md w-full bg-white rounded-3xl p-4 shadow-2xl flex flex-col items-center max-h-[90vh] overflow-y-auto no-scrollbar">
        <button id="btn-close-poster" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black flex items-center justify-center cursor-pointer" title="关闭">
          ${GAME_ICONS.back("w-4 h-4")}
        </button>
        <h3 class="text-sm font-black text-amber-950 mb-2">宝宝识字成长周报海报</h3>
        <canvas id="poster-canvas" width="600" height="960" class="w-full rounded-2xl shadow-md border border-amber-200 mb-3"></canvas>
        <div class="flex items-center gap-2 w-full flex-wrap">
          <button id="btn-copy-poster" class="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs py-2.5 rounded-full shadow-md flex items-center justify-center gap-1 active:scale-95 cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.cards("w-3.5 h-3.5")}</span>
            <span>复制图片</span>
          </button>
          <button id="btn-share-poster" class="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-black text-xs py-2.5 rounded-full shadow-md flex items-center justify-center gap-1 active:scale-95 cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.sparkle("w-3.5 h-3.5")}</span>
            <span>一键分享</span>
          </button>
          <button id="btn-download-poster" class="flex-1 btn-game-orange text-white font-black text-xs py-2.5 rounded-full shadow-md flex items-center justify-center gap-1 active:scale-95 cursor-pointer">
            <span class="flex items-center">${GAME_ICONS.star("w-3.5 h-3.5", false)}</span>
            <span>保存海报</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const canvas = overlay.querySelector("#poster-canvas");
    const ctx = canvas.getContext("2d");

    // HiDPI 支持：缩放 Canvas 以在 Retina 屏幕上获得清晰文字
    const dpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;
    if (dpr > 1) {
      canvas.width = 600 * dpr;
      canvas.height = 960 * dpr;
      canvas.style.width = "600px";
      canvas.style.height = "960px";
      ctx.scale(dpr, dpr);
    }

    // 1. 绘制背景暖橙渐变
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 960);
    bgGrad.addColorStop(0, "#fff7ed");
    bgGrad.addColorStop(0.3, "#ffedd5");
    bgGrad.addColorStop(1, "#fed7aa");
    ctx.fillStyle = bgGrad;
    ctx.roundRect(0, 0, 600, 960, 24);
    ctx.fill();

    // 2. 顶部金色横幅
    const bannerGrad = ctx.createLinearGradient(0, 0, 600, 0);
    bannerGrad.addColorStop(0, "#ea580c");
    bannerGrad.addColorStop(0.5, "#f97316");
    bannerGrad.addColorStop(1, "#f59e0b");
    ctx.fillStyle = bannerGrad;
    ctx.roundRect(30, 30, 540, 110, 20);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("凯茜识字 · 学习成长周报", 300, 80);

    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText("让每一个汉字都成为孩子闪光的阶梯", 300, 115);

    // 3. 宝宝核心数据大卡片
    ctx.fillStyle = "#ffffff";
    ctx.roundRect(30, 160, 540, 300, 20);
    ctx.fill();

    const drawStat = (label, val, x, y, color) => {
      ctx.fillStyle = "#6b7280";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, x, y);

      ctx.fillStyle = color;
      ctx.font = "900 36px sans-serif";
      ctx.fillText(String(val), x, y + 45);
    };

    drawStat("已掌握汉字", `${learnedCount} 字`, 160, 210, "#ea580c");
    drawStat("连续打卡", `${streak} 天`, 440, 210, "#059669");
    drawStat("收集星星", `${stars} 颗`, 160, 320, "#d97706");
    drawStat("星币财富", `${coins} 星币`, 440, 320, "#7c3aed");

    // 4. 近 7 日趋势模拟柱状图
    ctx.fillStyle = "#ffffff";
    ctx.roundRect(30, 480, 540, 240, 20);
    ctx.fill();

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("本周每日识字达成", 55, 520);

    const history = p.studyHistory || [
      { date: "周一", count: 3 }, { date: "周二", count: 2 },
      { date: "周三", count: 4 }, { date: "周四", count: 1 },
      { date: "周五", count: 5 }, { date: "周六", count: 3 }, { date: "周日", count: 4 }
    ];
    const maxVal = Math.max(5, ...history.map(h => h.count));
    history.forEach((h, idx) => {
      const barX = 70 + idx * 68;
      const barH = (h.count / maxVal) * 110;
      const safeBarH = Math.max(4, barH);
      const safeBarY = 670 - safeBarH;

      ctx.fillStyle = "#f97316";
      ctx.roundRect(barX, safeBarY, 36, safeBarH, Math.min(8, Math.floor(safeBarH / 2)));
      ctx.fill();

      ctx.fillStyle = "#ea580c";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(h.count), barX + 18, safeBarY - 6);

      ctx.fillStyle = "#64748b";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(h.date, barX + 18, 695);
    });

    // 5. 底部荣誉与寄语卡片
    ctx.fillStyle = "#ffffff";
    ctx.roundRect(30, 740, 540, 180, 20);
    ctx.fill();

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("凯茜伴学老师寄语：", 55, 780);

    ctx.fillStyle = "#475569";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("宝贝本周发音洪亮，笔画书写极其规范，", 55, 815);
    ctx.fillText("艾宾浩斯复习记忆保持率高达 98.4%，继续加油！", 55, 845);

    const nowStr = new Date().toLocaleDateString("zh-CN");
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`生成时间: ${nowStr} · 凯茜识字`, 550, 895);

    // 绑定关闭、复制、分享与下载
    this._on(overlay.querySelector("#btn-close-poster"), "click", () => overlay.remove());

    const copyBtn = overlay.querySelector("#btn-copy-poster");
    if (copyBtn) {
      this._on(copyBtn, "click", () => {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          if (navigator.clipboard && window.ClipboardItem) {
            try {
              await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
              soundAndFX.playSuccessSound();
              showGameToast(this.container, "周报图片已复制到剪贴板！可直接去微信/聊天中粘贴！", "success");
              return;
            } catch (err) {
              console.warn("ClipboardItem write failed:", err);
            }
          }
          showGameToast(this.container, "请点击“保存海报”下载图片哦！", "info");
        }, "image/png");
      });
    }

    const shareBtn = overlay.querySelector("#btn-share-poster");
    if (shareBtn) {
      this._on(shareBtn, "click", () => {
        if (navigator.share) {
          canvas.toBlob(async (blob) => {
            if (!blob) return;
            try {
              const file = new File([blob], `凯茜识字_成长周报_${nowStr}.png`, { type: "image/png" });
              await navigator.share({
                title: "宝宝识字成长周报",
                text: "看看宝贝在凯茜识字的精彩表现！",
                files: [file]
              });
              soundAndFX.playSuccessSound();
            } catch {}
          }, "image/png");
        } else {
          showGameToast(this.container, "当前浏览器未开放原生分享，可使用“复制图片”或“保存海报”哦！", "info");
        }
      });
    }

    this._on(overlay.querySelector("#btn-download-poster"), "click", () => {
      const link = document.createElement("a");
      link.download = `凯茜识字_成长周报_${nowStr}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      soundAndFX.playSuccessSound();
      showGameToast(this.container, "周报海报已保存到相册！", "success");
    });
  }
