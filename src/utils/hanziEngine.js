/**
 * 凯茜识字 (Cathy Literacy) - AI 笔顺智能描红与纠错引擎
 * 核心功能：SVG 骨架引导倒笔画即时拦截笔顺强校验平滑轨迹插值与粒子结算
 */

import { soundEngine } from "./soundEngine.js";
import { ebbinghausManager } from "./ebbinghaus.js";

export class HanziEngine {
  constructor(canvas, charData, onCompleteCallback, onStrokeCompleteCallback, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.charData = charData;
    this.onComplete = onCompleteCallback;
    this.onStrokeComplete = onStrokeCompleteCallback;
    this.options = options || {};
    this.freeWriteMode = Boolean(this.options.freeWrite);
    this.isPeeking = false;
    this._peekTimer = null;

    this.gridType = "mi"; // "mi" | "tian"
    this.drawSealStamp = false;

    this.currentStrokeIndex = 0;
    this.completedStrokes = [];
    this.userCurrentPath = [];
    this.isDrawing = false;
    this.isDemonstrating = false;
    this.demoAnimTimer = null;
    this.demoPos = null;
    this.errorWarning = "";
    this.animGuideTimer = null;
    this.errorTimer = null;
    this.completeTimer = null;
    this.guideProgress = 0;
    this._resizeObserver = null;
    this.isDestroyed = false;

    this.initCanvasSize();
    this.bindEvents();
    this._initResizeObserver();
    this.startGuideAnimation();
    this.render();
  }

  /** 监听容器尺寸变化，自动重建 canvas 分辨率 */
  _initResizeObserver() {
    if (typeof ResizeObserver === "undefined") return;
    this._resizeObserver = new ResizeObserver(() => {
      this.initCanvasSize();
      this.render();
    });
    this._resizeObserver.observe(this.canvas.parentElement);
  }

  initCanvasSize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 340;
    this.height = rect.height || 340;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  bindEvents() {
    this.handleStart = this.onPointerDown.bind(this);
    this.handleMove = this.onPointerMove.bind(this);
    this.handleEnd = this.onPointerUp.bind(this);

    this.canvas.addEventListener("mousedown", this.handleStart);
    window.addEventListener("mousemove", this.handleMove);
    window.addEventListener("mouseup", this.handleEnd);

    this.canvas.addEventListener("touchstart", this.handleStart, { passive: false });
    window.addEventListener("touchmove", this.handleMove, { passive: false });
    window.addEventListener("touchend", this.handleEnd);
  }

  destroy() {
    this.isDestroyed = true;
    this.stopDemo();
    if (this._peekTimer) {
      clearTimeout(this._peekTimer);
      this._peekTimer = null;
    }
    if (this.animGuideTimer) {
      cancelAnimationFrame(this.animGuideTimer);
      this.animGuideTimer = null;
    }
    if (this.errorTimer) clearTimeout(this.errorTimer);
    if (this.completeTimer) clearTimeout(this.completeTimer);
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }

    this.canvas.removeEventListener("mousedown", this.handleStart);
    window.removeEventListener("mousemove", this.handleMove);
    window.removeEventListener("mouseup", this.handleEnd);

    this.canvas.removeEventListener("touchstart", this.handleStart);
    window.removeEventListener("touchmove", this.handleMove);
    window.removeEventListener("touchend", this.handleEnd);
  }

  /** 独立书写模式下：短时偷看提示（2秒后自动重新隐藏） */
  peekGuide(ms = 2000) {
    this.isPeeking = true;
    this.render();
    if (this._peekTimer) clearTimeout(this._peekTimer);
    this._peekTimer = setTimeout(() => {
      if (this.isDestroyed) return;
      this.isPeeking = false;
      this.render();
    }, ms);
  }

  /** 自动全字笔顺动画演示 */
  demoAllStrokes(onDone) {
    if (this.isDemonstrating) return;
    this.isDemonstrating = true;
    this.isDrawing = false;
    this.userCurrentPath = [];
    this.completedStrokes = [];
    this.currentStrokeIndex = 0;
    this.errorWarning = "";
    if (this.animGuideTimer) cancelAnimationFrame(this.animGuideTimer);

    const strokes = this.charData.strokes || [];
    if (strokes.length === 0) {
      this.isDemonstrating = false;
      this.startGuideAnimation();
      if (onDone) onDone();
      return;
    }

    let strokeIdx = 0;
    let t = 0;
    const speed = 0.03;

    const animate = () => {
      if (!this.isDemonstrating) return;

      t += speed;
      if (t >= 1) {
        this.completedStrokes.push(strokes[strokeIdx]);
        try { soundEngine.playPop(); } catch {}
        strokeIdx++;
        t = 0;

        if (strokeIdx >= strokes.length) {
          this.demoPos = null;
          this.render();
          this.completeTimer = setTimeout(() => {
            this.isDemonstrating = false;
            this.reset();
            this.startGuideAnimation();
            if (onDone) onDone();
          }, 900);
          return;
        }
      }

      const curStroke = strokes[strokeIdx];
      const w = this.width;
      const h = this.height;
      const sx = (curStroke.start.x / 100) * w;
      const sy = (curStroke.start.y / 100) * h;
      const ex = (curStroke.end.x / 100) * w;
      const ey = (curStroke.end.y / 100) * h;

      let curX = sx;
      let curY = sy;
      if (curStroke.corner) {
        const cx = (curStroke.corner.x / 100) * w;
        const cy = (curStroke.corner.y / 100) * h;
        if (t < 0.5) {
          const subT = t * 2;
          curX = sx + (cx - sx) * subT;
          curY = sy + (cy - sy) * subT;
        } else {
          const subT = (t - 0.5) * 2;
          curX = cx + (ex - cx) * subT;
          curY = cy + (ey - cy) * subT;
        }
      } else {
        curX = sx + (ex - sx) * t;
        curY = sy + (ey - sy) * t;
      }

      this.demoPos = { x: curX, y: curY, strokeIdx, stroke: curStroke, progress: t };
      this.render();

      this.demoAnimTimer = requestAnimationFrame(animate);
    };

    this.demoAnimTimer = requestAnimationFrame(animate);
  }

  stopDemo() {
    if (!this.isDemonstrating) return;
    this.isDemonstrating = false;
    if (this.demoAnimTimer) cancelAnimationFrame(this.demoAnimTimer);
    if (this.completeTimer) clearTimeout(this.completeTimer);
    this.demoPos = null;
    this.reset();
    this.startGuideAnimation();
  }

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * 100, // 归一化为 0~100 坐标系
      y: ((clientY - rect.top) / rect.height) * 100
    };
  }

  getTolerance() {
    try {
      if (typeof window !== "undefined" && window.ebbinghausManager?.progress?.settings?.strokeTolerance === "strict") {
        return { start: 16, end: 18, reverse: -20 };
      }
      if (typeof window !== "undefined" && window.ebbinghausManager?.progress?.settings?.strokeTolerance === "standard") {
        return { start: 22, end: 24, reverse: -25 };
      }
    } catch {}
    // 默认幼童友好宽容模式 (防止幼儿手抖挫败)
    return { start: 28, end: 30, reverse: -35 };
  }

  onPointerDown(e) {
    e.preventDefault();
    if (this.isDemonstrating) {
      this.stopDemo();
    }
    if (this.currentStrokeIndex >= this.charData.strokes.length) return;

    const pos = this.getPointerPos(e);
    const targetStroke = this.charData.strokes[this.currentStrokeIndex];
    const startPoint = targetStroke.start;
    const tol = this.getTolerance();

    // 计算与起笔点距离
    const distToStart = Math.hypot(pos.x - startPoint.x, pos.y - startPoint.y);
    const distToEnd = Math.hypot(pos.x - targetStroke.end.x, pos.y - targetStroke.end.y);

    // 倒笔画拦截：如果直接在终点下笔
    if (distToEnd < (tol.end * 0.6) && distToStart > tol.start) {
      this.triggerError("这是终点哦，请从发光起点开始写！");
      return;
    }

    // 容差判定
    if (distToStart > tol.start) {
      this.triggerError("请在发光的起点下笔哦！");
      return;
    }

    this.isDrawing = true;
    this.userCurrentPath = [{ ...pos, t: performance.now(), w: 18 }];
    this.errorWarning = "";
    soundEngine.playChantHit();
  }

  onPointerMove(e) {
    if (!this.isDrawing) return;
    e.preventDefault();

    const pos = this.getPointerPos(e);
    const now = performance.now();
    const lastPos = this.userCurrentPath[this.userCurrentPath.length - 1];

    let calcWidth = 18;
    if (lastPos) {
      const dt = Math.max(now - (lastPos.t || now), 8);
      const dist = Math.hypot(pos.x - lastPos.x, pos.y - lastPos.y);
      const v = dist / dt;
      const speedFactor = Math.max(0.65, Math.min(1.45, 1.25 - v * 0.35));
      calcWidth = 18 * speedFactor;
    }

    this.userCurrentPath.push({ ...pos, t: now, w: calcWidth });
    this.render();
  }

  onPointerUp(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    const targetStroke = this.charData.strokes[this.currentStrokeIndex];
    const tol = this.getTolerance();
    const lastPoint = this.userCurrentPath[this.userCurrentPath.length - 1];

    if (!lastPoint) {
      this.userCurrentPath = [];
      this.render();
      return;
    }

    const distToEnd = Math.hypot(lastPoint.x - targetStroke.end.x, lastPoint.y - targetStroke.end.y);
    const isCompleted = distToEnd <= tol.end;

    let hasReverseStroke = false;
    let missedCorner = false;

    if (this.userCurrentPath.length >= 4) {
      const pFirst = this.userCurrentPath[0];
      const pMid = this.userCurrentPath[Math.floor(this.userCurrentPath.length / 2)];
      const pLast = lastPoint;

      const userDx = pLast.x - pFirst.x;
      const userDy = pLast.y - pFirst.y;
      const targetDx = targetStroke.end.x - targetStroke.start.x;
      const targetDy = targetStroke.end.y - targetStroke.start.y;
      const dot = userDx * targetDx + userDy * targetDy;

      if (dot < tol.reverse) {
        hasReverseStroke = true;
      }

      // T4: 笔顺方向角严格验证 (无折角直线/弧线笔画)
      if (!targetStroke.corner && !hasReverseStroke) {
        const age = (typeof window !== "undefined" && window.ebbinghausManager?.getAge?.()) || 6;
        const degTol = age <= 6 ? 60 : 45;
        if (!this.strokeDirectionValidator(this.userCurrentPath, targetStroke, degTol)) {
          hasReverseStroke = true;
        }
      }

      if (targetStroke.corner) {
        let minCornerDist = Infinity;
        for (const pt of this.userCurrentPath) {
          const d = Math.hypot(pt.x - targetStroke.corner.x, pt.y - targetStroke.corner.y);
          if (d < minCornerDist) minCornerDist = d;
        }
        if (minCornerDist > tol.end * 1.6) {
          missedCorner = true;
        }
      }
    }

    if (hasReverseStroke) {
      try {
        ebbinghausManager.recordMistake(this.charData.id, "reverse_stroke", { strokeIndex: this.currentStrokeIndex });
      } catch {}
      this.triggerError("笔画方向反啦，请顺着光球方向滑动哦！");
      this.userCurrentPath = [];
      this.render();
      return;
    }

    if (missedCorner) {
      this.triggerError("这是折笔哦，请顺着光球转弯滑行！");
      this.userCurrentPath = [];
      this.render();
      return;
    }

    if (isCompleted) {
      this.completedStrokes.push(targetStroke);
      this.currentStrokeIndex++;
      this.userCurrentPath = [];
      this.errorWarning = "";
      soundEngine.playSuccessSound();

      if (targetStroke.name) {
        soundEngine.speakPriority(targetStroke.name, { kind: "char", priority: 1 });
      }

      if (this.onStrokeComplete) {
        try { this.onStrokeComplete(this.currentStrokeIndex - 1, targetStroke); } catch {}
      }

      if (this.currentStrokeIndex >= this.charData.strokes.length) {
        this.drawSealStamp = true;
        soundEngine.playVictoryFanfare();
        soundEngine.speakPriority(`“${this.charData.char}”字写得真规范！太棒啦！`, { kind: "sentence", emotion: "excited" });
        if (this.onComplete) {
          this.completeTimer = setTimeout(() => this.onComplete(), 600);
        }
      }
    } else {
      this.triggerError("笔画没写到位哦，再试一次吧！");
      this.userCurrentPath = [];
    }

    this.render();
  }

  toggleGridType() {
    this.gridType = this.gridType === "mi" ? "tian" : "mi";
    this.render();
    return this.gridType;
  }

  /**
   * T4: 笔顺方向角验证 (5-6 岁容差 60°，7-8 岁容差 45°)
   */
  strokeDirectionValidator(userPath, expected, toleranceDeg = 60) {
    if (!userPath || userPath.length < 3) return true;

    // 计算用户轨迹平均方向
    const userAngle = this._avgPathAngle(userPath);
    // 计算期望笔画方向
    const expectedAngle = Math.atan2(
      expected.end.y - expected.start.y,
      expected.end.x - expected.start.x
    ) * 180 / Math.PI;

    // 容差对比 (处理 360 度循环)
    let diff = Math.abs(userAngle - expectedAngle);
    if (diff > 180) diff = 360 - diff;
    return diff < toleranceDeg;
  }

  _avgPathAngle(path) {
    let sum = 0;
    let count = 0;
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      if (Math.abs(dx) + Math.abs(dy) > 0.01) {
        sum += Math.atan2(dy, dx);
        count++;
      }
    }
    return count > 0 ? (sum / count) * 180 / Math.PI : 0;
  }

  triggerError(msg) {
    this.errorWarning = msg;
    soundEngine.playSoftError();
    this.render();

    if (this.errorTimer) clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => {
      this.errorWarning = "";
      this.render();
    }, 2000);
  }

  startGuideAnimation() {
    if (this.animGuideTimer) cancelAnimationFrame(this.animGuideTimer);
    const loop = () => {
      if (this.isDestroyed) return;
      if (!this.isDemonstrating) {
        this.guideProgress = (this.guideProgress + 0.015) % 1;
        this.render();
      }
      this.animGuideTimer = requestAnimationFrame(loop);
    };
    this.animGuideTimer = requestAnimationFrame(loop);
  }

  reset() {
    this.currentStrokeIndex = 0;
    this.completedStrokes = [];
    this.userCurrentPath = [];
    this.errorWarning = "";
    this.drawSealStamp = false;
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // 1. 绘制传统米字格背景
    this.drawGrid(ctx, w, h);

    // 2. 绘制全字灰色底模骨架
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    this.charData.strokes.forEach((stroke, idx) => {
      const isDone = this.isDemonstrating ? idx < (this.demoPos ? this.demoPos.strokeIdx : this.completedStrokes.length) : idx < this.currentStrokeIndex;
      const isCurrent = this.isDemonstrating ? (this.demoPos && idx === this.demoPos.strokeIdx) : idx === this.currentStrokeIndex;

      // 独立书写模式：未完成笔画默认隐藏（除非正在演示或偷看提示）
      if (this.freeWriteMode && !this.isPeeking && !this.isDemonstrating && !isDone) {
        return;
      }

      ctx.save();
      ctx.lineWidth = 18;
      if (isDone) {
        // 已完成笔画：亮丽橘红墨水
        ctx.strokeStyle = "#FF6B00";
        ctx.shadowColor = "rgba(255, 107, 0, 0.4)";
        ctx.shadowBlur = 8;
      } else if (isCurrent) {
        // 当前笔画底色：浅橙虚影
        ctx.strokeStyle = "#FFE0B2";
      } else {
        // 未学笔画：极淡灰底模
        ctx.strokeStyle = "#EDE7F6";
      }

      this.renderStrokePath(ctx, stroke, w, h);
      ctx.stroke();
      ctx.restore();
    });

    // 3. 正在演示笔画时的动效
    if (this.isDemonstrating && this.demoPos) {
      const stroke = this.demoPos.stroke;
      const t = this.demoPos.progress;
      ctx.save();
      ctx.lineWidth = 18;
      ctx.strokeStyle = "#E64A19";
      ctx.shadowColor = "rgba(230, 74, 25, 0.6)";
      ctx.shadowBlur = 10;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      const sx = (stroke.start.x / 100) * w;
      const sy = (stroke.start.y / 100) * h;
      ctx.moveTo(sx, sy);
      if (stroke.corner) {
        const cx = (stroke.corner.x / 100) * w;
        const cy = (stroke.corner.y / 100) * h;
        if (t <= 0.5) {
          ctx.lineTo(this.demoPos.x, this.demoPos.y);
        } else {
          ctx.lineTo(cx, cy);
          ctx.lineTo(this.demoPos.x, this.demoPos.y);
        }
      } else {
        ctx.lineTo(this.demoPos.x, this.demoPos.y);
      }
      ctx.stroke();

      // 笔尖发光毛笔头
      ctx.fillStyle = "#FFD600";
      ctx.shadowColor = "#FF6D00";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(this.demoPos.x, this.demoPos.y, 11, 0, Math.PI * 2);
      ctx.fill();

      // 顶部演示提示标
      ctx.fillStyle = "#C62828";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`示范第 ${this.demoPos.strokeIdx + 1} / ${this.charData.strokes.length} 笔: ${stroke.name || ""}`, w / 2, 28);
      ctx.restore();
    }

    // 4. 绘制用户当前正在书写的动态笔锋墨迹
    if (this.userCurrentPath.length > 1) {
      ctx.save();
      ctx.strokeStyle = "#FF9100";
      ctx.shadowColor = "rgba(255, 145, 0, 0.4)";
      ctx.shadowBlur = 6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 1; i < this.userCurrentPath.length; i++) {
        const p0 = this.userCurrentPath[i - 1];
        const p1 = this.userCurrentPath[i];
        const px0 = (p0.x / 100) * w;
        const py0 = (p0.y / 100) * h;
        const px1 = (p1.x / 100) * w;
        const py1 = (p1.y / 100) * h;

        ctx.lineWidth = p1.w || 18;
        ctx.beginPath();
        ctx.moveTo(px0, py0);
        ctx.lineTo(px1, py1);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. 绘制当前笔画的发光引导光球与起点光环 (仅非演示状态，且非独立书写盲写模式)
    if (!this.isDemonstrating && (!this.freeWriteMode || this.isPeeking) && this.currentStrokeIndex < this.charData.strokes.length) {
      const curStroke = this.charData.strokes[this.currentStrokeIndex];
      this.drawGuideOrb(ctx, curStroke, w, h);
    }

    // 6. 绘制错误警示文本
    if (this.errorWarning) {
      ctx.save();
      ctx.fillStyle = "#FF3D00";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(this.errorWarning, w / 2, h - 14);
      ctx.restore();
    }

    // 7. 加盖朱砂御制印章
    if (this.drawSealStamp) {
      this.drawCinnabarSeal(ctx, w, h);
    }
  }

  drawCinnabarSeal(ctx, w, h) {
    ctx.save();
    const size = Math.min(w, h) * 0.22;
    const x = w - size - 24;
    const y = h - size - 24;

    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(-0.06);

    // 朱砂红印章底框
    ctx.fillStyle = "rgba(198, 40, 40, 0.92)";
    ctx.shadowColor = "rgba(198, 40, 40, 0.4)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(-size / 2, -size / 2, size, size, 8);
    } else {
      ctx.rect(-size / 2, -size / 2, size, size);
    }
    ctx.fill();

    // 内金线/白线双边框
    ctx.strokeStyle = "#FFF8E1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(-size / 2 + 3, -size / 2 + 3, size - 6, size - 6, 6);
    } else {
      ctx.rect(-size / 2 + 3, -size / 2 + 3, size - 6, size - 6);
    }
    ctx.stroke();

    // 印章四字篆刻排版
    ctx.fillStyle = "#FFF8E1";
    ctx.font = `bold ${Math.round(size * 0.32)}px "Songti SC", "SimSun", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("妙笔", 0, -size * 0.18);
    ctx.fillText("生花", 0, size * 0.2);

    ctx.restore();
  }

  drawGrid(ctx, w, h) {
    ctx.save();
    // 1. 米字格背景：宣纸暖白质感
    ctx.fillStyle = "#FCFBF8";
    ctx.fillRect(0, 0, w, h);

    // 2. 外框：传统中国红双线边框
    ctx.strokeStyle = "#C62828";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    ctx.strokeStyle = "rgba(198, 40, 40, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, w - 24, h - 24);

    // 四角精致古典角标装饰
    const cornerSize = 14;
    ctx.strokeStyle = "#C62828";
    ctx.lineWidth = 2;
    // 左上
    ctx.beginPath();
    ctx.moveTo(16, 16 + cornerSize); ctx.lineTo(16, 16); ctx.lineTo(16 + cornerSize, 16);
    // 右上
    ctx.moveTo(w - 16 - cornerSize, 16); ctx.lineTo(w - 16, 16); ctx.lineTo(w - 16, 16 + cornerSize);
    // 左下
    ctx.moveTo(16, h - 16 - cornerSize); ctx.lineTo(16, h - 16); ctx.lineTo(16 + cornerSize, h - 16);
    // 右下
    ctx.moveTo(w - 16 - cornerSize, h - 16); ctx.lineTo(w - 16, h - 16); ctx.lineTo(w - 16, h - 16 - cornerSize);
    ctx.stroke();

    // 3. 虚线十字中线与对角线 (米字格 / 田字格切换)
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "#EF9A9A";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(w / 2, 12);
    ctx.lineTo(w / 2, h - 12);
    ctx.moveTo(12, h / 2);
    ctx.lineTo(w - 12, h / 2);

    if (this.gridType === "mi") {
      ctx.moveTo(12, 12);
      ctx.lineTo(w - 12, h - 12);
      ctx.moveTo(w - 12, 12);
      ctx.lineTo(12, h - 12);
    }
    ctx.stroke();

    // 4. 中心圆润十字微标
    ctx.setLineDash([]);
    ctx.strokeStyle = "#D32F2F";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 6, h / 2); ctx.lineTo(w / 2 + 6, h / 2);
    ctx.moveTo(w / 2, h / 2 - 6); ctx.lineTo(w / 2, h / 2 + 6);
    ctx.stroke();

    ctx.restore();
  }

  renderStrokePath(ctx, stroke, w, h) {
    ctx.beginPath();
    const sx = (stroke.start.x / 100) * w;
    const sy = (stroke.start.y / 100) * h;
    const ex = (stroke.end.x / 100) * w;
    const ey = (stroke.end.y / 100) * h;

    ctx.moveTo(sx, sy);
    if (stroke.corner) {
      const cx = (stroke.corner.x / 100) * w;
      const cy = (stroke.corner.y / 100) * h;
      ctx.lineTo(cx, cy);
    }
    ctx.lineTo(ex, ey);
  }

  drawGuideOrb(ctx, stroke, w, h) {
    const sx = (stroke.start.x / 100) * w;
    const sy = (stroke.start.y / 100) * h;

    // 起点光环 (呼吸绿点)
    ctx.save();
    ctx.fillStyle = "#00E676";
    ctx.shadowColor = "#00E676";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(sx, sy, 9, 0, Math.PI * 2);
    ctx.fill();

    // 沿轨迹滑动的黄色魔法引导球
    let curX = sx;
    let curY = sy;
    if (stroke.corner) {
      const cx = (stroke.corner.x / 100) * w;
      const cy = (stroke.corner.y / 100) * h;
      const ex = (stroke.end.x / 100) * w;
      const ey = (stroke.end.y / 100) * h;
      if (this.guideProgress < 0.5) {
        const t = this.guideProgress * 2;
        curX = sx + (cx - sx) * t;
        curY = sy + (cy - sy) * t;
      } else {
        const t = (this.guideProgress - 0.5) * 2;
        curX = cx + (ex - cx) * t;
        curY = cy + (ey - cy) * t;
      }
    } else {
      const ex = (stroke.end.x / 100) * w;
      const ey = (stroke.end.y / 100) * h;
      curX = sx + (ex - sx) * this.guideProgress;
      curY = sy + (ey - sy) * this.guideProgress;
    }

    ctx.fillStyle = "#FFD600";
    ctx.shadowColor = "#FFAB00";
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(curX, curY, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
