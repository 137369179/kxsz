/**
 * 凯茜识字 (Cathy Literacy) - AI 笔顺智能描红与纠错引擎
 * 核心功能：SVG 骨架引导倒笔画即时拦截笔顺强校验平滑轨迹插值与粒子结算
 */

import { soundEngine } from "./soundEngine.js";

export class HanziEngine {
  constructor(canvas, charData, onCompleteCallback) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.charData = charData;
    this.onComplete = onCompleteCallback;

    this.currentStrokeIndex = 0;
    this.completedStrokes = [];
    this.userCurrentPath = [];
    this.isDrawing = false;
    this.errorWarning = "";
    this.animGuideTimer = null;
    this.errorTimer = null;
    this.completeTimer = null;
    this.guideProgress = 0;
    this._resizeObserver = null;

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
    if (this.animGuideTimer) cancelAnimationFrame(this.animGuideTimer);
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

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * 100, // 归一化为 0~100 坐标系
      y: ((clientY - rect.top) / rect.height) * 100
    };
  }

  onPointerDown(e) {
    e.preventDefault();
    if (this.currentStrokeIndex >= this.charData.strokes.length) return;

    const pos = this.getPointerPos(e);
    const targetStroke = this.charData.strokes[this.currentStrokeIndex];
    const startPoint = targetStroke.start;

    // 计算与起笔点距离
    const distToStart = Math.hypot(pos.x - startPoint.x, pos.y - startPoint.y);
    const distToEnd = Math.hypot(pos.x - targetStroke.end.x, pos.y - targetStroke.end.y);

    // 倒笔画拦截：如果直接在终点下笔
    if (distToEnd < 15 && distToStart > 25) {
      this.triggerError("这是终点哦，请从起点开始写！");
      return;
    }

    // 容差判定（25% 范围内视为有效起笔）
    if (distToStart > 22) {
      this.triggerError("请在发光的起点下笔哦！");
      return;
    }

    this.isDrawing = true;
    this.userCurrentPath = [pos];
    this.errorWarning = "";
    this.render();
  }

  onPointerMove(e) {
    if (!this.isDrawing) return;
    e.preventDefault();

    const pos = this.getPointerPos(e);
    const lastPos = this.userCurrentPath[this.userCurrentPath.length - 1];

    if (!lastPos || Math.hypot(pos.x - lastPos.x, pos.y - lastPos.y) > 2) {
      this.userCurrentPath.push(pos);
      if (lastPos) this.checkReverseStroke(pos, lastPos);

      // rAF 渲染节流，防止 120Hz/240Hz 高频触摸阻塞主线程
      if (!this._renderRafPending) {
        this._renderRafPending = true;
        requestAnimationFrame(() => {
          this._renderRafPending = false;
          if (this.isDrawing) this.render();
        });
      }
    }
  }

  // 倒笔画与反向滑行实时判定
  checkReverseStroke(currentPos, lastPos) {
    const targetStroke = this.charData.strokes[this.currentStrokeIndex];
    const idealVecX = targetStroke.end.x - targetStroke.start.x;
    const idealVecY = targetStroke.end.y - targetStroke.start.y;
    const userVecX = currentPos.x - lastPos.x;
    const userVecY = currentPos.y - lastPos.y;

    const dotProduct = idealVecX * userVecX + idealVecY * userVecY;
    if (dotProduct < -25) {
      // 强烈反向滑行
      this.triggerError("方向反啦！请按照箭头提示方向书写！");
      this.isDrawing = false;
      this.userCurrentPath = [];
      this.render();
    }
  }

  onPointerUp(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    const targetStroke = this.charData.strokes[this.currentStrokeIndex];
    const lastPos = this.userCurrentPath[this.userCurrentPath.length - 1];

    if (!lastPos) return;

    // 终点到达度判定
    const distToEnd = Math.hypot(lastPos.x - targetStroke.end.x, lastPos.y - targetStroke.end.y);

    if (distToEnd < 24 && this.userCurrentPath.length >= 3) {
      // 成功完成当前笔画！
      soundEngine.playStrokeSound();
      this.completedStrokes.push(targetStroke);
      this.currentStrokeIndex++;
      this.userCurrentPath = [];
      this.errorWarning = "";

      if (this.currentStrokeIndex >= this.charData.strokes.length) {
        // 全部笔画写完！
        soundEngine.playSuccessSound();
        soundEngine.playEncouragement();
        if (this.onComplete) {
          if (this.completeTimer) clearTimeout(this.completeTimer);
          this.completeTimer = setTimeout(() => this.onComplete(), 600);
        }
      }
    } else {
      // 未完整覆盖笔画
      this.triggerError("这一笔还没有写完哦，再试一次吧！");
      this.userCurrentPath = [];
    }

    this.render();
  }

  triggerError(msg) {
    if (this.errorTimer) clearTimeout(this.errorTimer);
    this.errorWarning = msg;
    soundEngine.playErrorSound();
    this.render();
    this.errorTimer = setTimeout(() => {
      this.errorWarning = "";
      this.render();
    }, 2000);
  }

  startGuideAnimation() {
    const loop = () => {
      this.guideProgress = (this.guideProgress + 0.015) % 1;
      this.render();
      this.animGuideTimer = requestAnimationFrame(loop);
    };
    this.animGuideTimer = requestAnimationFrame(loop);
  }

  reset() {
    this.currentStrokeIndex = 0;
    this.completedStrokes = [];
    this.userCurrentPath = [];
    this.errorWarning = "";
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // 1. 绘制田字格 / 米字格背景
    this.drawGrid(ctx, w, h);

    // 2. 绘制全字灰色底模骨架
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    this.charData.strokes.forEach((stroke, idx) => {
      const isDone = idx < this.currentStrokeIndex;
      const isCurrent = idx === this.currentStrokeIndex;

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
        ctx.strokeStyle = "#F0F0F0";
      }

      this.renderStrokePath(ctx, stroke, w, h);
      ctx.stroke();
      ctx.restore();
    });

    // 3. 绘制用户当前正在书写的笔迹
    if (this.userCurrentPath.length > 1) {
      ctx.save();
      ctx.lineWidth = 18;
      ctx.strokeStyle = "#FF9100";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      this.userCurrentPath.forEach((p, idx) => {
        const px = (p.x / 100) * w;
        const py = (p.y / 100) * h;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();
    }

    // 4. 绘制当前笔画的发光引导光球与起点光环
    if (this.currentStrokeIndex < this.charData.strokes.length) {
      const curStroke = this.charData.strokes[this.currentStrokeIndex];
      this.drawGuideOrb(ctx, curStroke, w, h);
    }

    // 5. 绘制错误警示文本
    if (this.errorWarning) {
      ctx.save();
      ctx.fillStyle = "#FF3D00";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(this.errorWarning, w / 2, h - 14);
      ctx.restore();
    }
  }

  drawGrid(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = "#E0E0E0";
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, w - 12, h - 12);

    // 虚线十字中线与对角线 (米字格)
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "#FFCDD2";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(w / 2, 6);
    ctx.lineTo(w / 2, h - 6);
    ctx.moveTo(6, h / 2);
    ctx.lineTo(w - 6, h / 2);

    ctx.moveTo(6, 6);
    ctx.lineTo(w - 6, h - 6);
    ctx.moveTo(w - 6, 6);
    ctx.lineTo(6, h - 6);
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
