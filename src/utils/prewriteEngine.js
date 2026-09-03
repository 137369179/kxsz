/**
 * 凯茜识字 (Cathy Literacy) —— B1 铁律控笔训练引擎 (PrewriteEngine)
 *
 * 教育学依据：
 *   《汉字启蒙认知能力教学指南》(教育部) —— 写字前必须先建立手部小肌肉控制
 *   皮亚杰认知发展理论 —— 3-5 岁儿童处于前运算阶段，精细动作尚未就绪
 *   香港《寫中文樂繽紛》幼儿园书写课程 —— 控笔是写字的前置而非可选
 *
 * 四种训练模式：
 *   1. traceLine   —— 描直线 (横/竖/斜/波浪) → 训练手腕稳定性
 *   2. traceCircle —— 描曲线 (圆/方/三角)    → 训练手指灵活性
 *   3. gripGuide   —— 握笔姿势教学 (动画 + 语音)
 *   4. freeDoodle  —— 自由涂鸦放松小肌肉
 *
 * 与年龄的关系（B6 铁律）：
 *   <5 岁  ：控笔是全部，禁止进 HanziEngine 描红
 *   5-6 岁 ：控笔 + 田字格大容差描红
 *   >=7 岁 ：控笔作为 1-2 分钟快速热身，然后进正式描红
 */

import { soundAndFX } from "./soundEngine.js";
import { ebbinghausManager } from "./ebbinghaus.js";

// ------------------------------------------------------------------
// 预设路径（0~100 归一化坐标系，与 HanziEngine 一致）
// 每种形状用一串 [{x,y}] 定义采样点，引擎会做线性插值
// ------------------------------------------------------------------

const PREWRITE_SHAPES = {
  // —— 描线类 ——
  line_horizontal: [
    { x: 15, y: 50 }, { x: 35, y: 50 }, { x: 55, y: 50 },
    { x: 75, y: 50 }, { x: 90, y: 50 }
  ],
  line_vertical: [
    { x: 50, y: 15 }, { x: 50, y: 35 }, { x: 50, y: 55 },
    { x: 50, y: 75 }, { x: 50, y: 90 }
  ],
  line_diagonal_down: [
    { x: 15, y: 15 }, { x: 33, y: 33 }, { x: 50, y: 50 },
    { x: 67, y: 67 }, { x: 85, y: 85 }
  ],
  line_diagonal_up: [
    { x: 15, y: 85 }, { x: 33, y: 67 }, { x: 50, y: 50 },
    { x: 67, y: 33 }, { x: 85, y: 15 }
  ],
  line_wave: (() => {
    // 正弦波 5 周期，25 采样点
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const x = 10 + (i / 24) * 80;
      const y = 50 + Math.sin((i / 24) * Math.PI * 5) * 25;
      pts.push({ x, y });
    }
    return pts;
  })(),

  // —— 曲线类 ——
  circle: (() => {
    const pts = [];
    for (let i = 0; i <= 36; i++) {
      const t = (i / 36) * Math.PI * 2;
      pts.push({ x: 50 + Math.cos(t) * 35, y: 50 + Math.sin(t) * 35 });
    }
    return pts;
  })(),
  square: [
    { x: 20, y: 20 }, { x: 40, y: 20 }, { x: 60, y: 20 }, { x: 80, y: 20 },
    { x: 80, y: 40 }, { x: 80, y: 60 }, { x: 80, y: 80 },
    { x: 60, y: 80 }, { x: 40, y: 80 }, { x: 20, y: 80 },
    { x: 20, y: 60 }, { x: 20, y: 40 }, { x: 20, y: 20 }
  ],
  triangle: [
    { x: 50, y: 15 }, { x: 60, y: 32 }, { x: 70, y: 49 },
    { x: 80, y: 66 }, { x: 85, y: 82 },
    { x: 65, y: 82 }, { x: 45, y: 82 }, { x: 25, y: 82 },
    { x: 35, y: 66 }, { x: 45, y: 49 }, { x: 50, y: 15 }
  ],
  spiral: (() => {
    // 外扩螺旋 3 圈
    const pts = [];
    for (let i = 0; i <= 72; i++) {
      const t = (i / 72) * Math.PI * 6;
      const r = 5 + (i / 72) * 40;
      pts.push({ x: 50 + Math.cos(t) * r, y: 50 + Math.sin(t) * r });
    }
    return pts;
  })()
};

/** 按年龄分难度组 */
const SHAPE_SETS_BY_AGE = {
  3: ["line_horizontal", "line_vertical", "line_wave", "circle"],
  4: ["line_horizontal", "line_vertical", "line_diagonal_down", "line_wave", "circle", "square"],
  5: ["line_horizontal", "line_vertical", "line_diagonal_down", "line_diagonal_up", "line_wave", "circle", "square", "triangle"],
  6: ["line_diagonal_down", "line_diagonal_up", "line_wave", "circle", "square", "triangle", "spiral"],
  7: ["line_diagonal_down", "line_diagonal_up", "line_wave", "circle", "spiral"]
};

/** 训练提示语 */
const SHAPE_HINTS = {
  line_horizontal: "小勇士！请用手指画一条从左到右的长直线～",
  line_vertical: "从上往下画一条直直的竖线吧！",
  line_diagonal_down: "从左上斜斜地滑到右下，像滑梯一样～",
  line_diagonal_up: "从右下往上斜着爬，像上山坡啦！",
  line_wave: "画一条弯弯的波浪线，像小河一样～",
  circle: "画一个大大的圆圈，像太阳一样圆！",
  square: "画一个方方的框框，像电视机一样～",
  triangle: "画一个尖尖的三角，像小山峰！",
  spiral: "从里向外慢慢绕，像小蜗牛的壳！"
};

// ------------------------------------------------------------------
// PrewriteEngine
// ------------------------------------------------------------------

export class PrewriteEngine {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} [options]
   * @param {'trace'|'grip'|'doodle'} [options.mode='trace']
   * @param {Function} [options.onComplete]        单个形状完成
   * @param {Function} [options.onAllComplete]    全部形状完成
   * @param {boolean} [options.enableGripGuide]   是否显示握笔提示
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.mode = options.mode || "trace";
    this.onComplete = options.onComplete || (() => {});
    this.onAllComplete = options.onAllComplete || (() => {});
    this.enableGripGuide = options.enableGripGuide !== false;

    // B6 铁律：读取用户年龄，决定训练集与容差
    this.age = ebbinghausManager.getAge();
    this.tolerance = this._toleranceForAge(this.age);
    this.targetProgressRatio = 0.6 + Math.min(0.2, this.age * 0.03); // 4岁 0.72, 7岁 0.81

    // 状态
    this.isDestroyed = false;
    this.isDrawing = false;
    this.userPath = [];          // [{x,y}]
    this.currentShapeIdx = 0;
    this.shapes = this._selectShapes();
    this.shapeProgress = new Array(this.shapes.length).fill(0); // 0~1
    this.demoPhase = false;
    this.demoTimer = null;
    this.demoPos = null;
    this._resizeObserver = null;
    this._guideProgress = 0;
    this._animTimer = null;

    this._initCanvas();
    this._bindEvents();
    this._initResizeObserver();
    this.render();
    this._speakHint();
    this._startDemoAnimation();
  }

  /** B6 铁律：年龄 → 宽容度 (百分比, 越大越宽容) */
  _toleranceForAge(age) {
    // 3岁 45% → 8岁 28%
    return Math.max(25, 48 - age * 3);
  }

  /** 根据年龄挑选训练形状 */
  _selectShapes() {
    const set = SHAPE_SETS_BY_AGE[Math.min(this.age, 7)] || SHAPE_SETS_BY_AGE[6];
    // 每个训练 3 个形状，随机不重复
    const shuffled = [...set].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(3, shuffled.length));
  }

  _initCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 360;
    this.height = rect.height || 360;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  _initResizeObserver() {
    if (typeof ResizeObserver === "undefined") return;
    this._resizeObserver = new ResizeObserver(() => {
      this._initCanvas();
      this.render();
    });
    this._resizeObserver.observe(this.canvas.parentElement || this.canvas);
  }

  _bindEvents() {
    this._onDown = this._onPointerDown.bind(this);
    this._onMove = this._onPointerMove.bind(this);
    this._onUp = this._onPointerUp.bind(this);

    this.canvas.addEventListener("mousedown", this._onDown);
    window.addEventListener("mousemove", this._onMove);
    window.addEventListener("mouseup", this._onUp);

    this.canvas.addEventListener("touchstart", this._onDown, { passive: false });
    window.addEventListener("touchmove", this._onMove, { passive: false });
    window.addEventListener("touchend", this._onUp);
  }

  destroy() {
    this.isDestroyed = true;

    this.canvas.removeEventListener("mousedown", this._onDown);
    window.removeEventListener("mousemove", this._onMove);
    window.removeEventListener("mouseup", this._onUp);

    this.canvas.removeEventListener("touchstart", this._onDown);
    window.removeEventListener("touchmove", this._onMove);
    window.removeEventListener("touchend", this._onUp);

    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this.demoTimer) cancelAnimationFrame(this.demoTimer);
    if (this._animTimer) cancelAnimationFrame(this._animTimer);
  }

  /** 把形状路径扩展成密集采样（用于距离判定） */
  _densify(points, step = 0.5) {
    const out = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const segLen = Math.hypot(dx, dy);
      const n = Math.max(1, Math.ceil(segLen / step));
      for (let j = 0; j < n; j++) {
        out.push({ x: a.x + dx * (j / n), y: a.y + dy * (j / n) });
      }
    }
    out.push(points[points.length - 1]);
    return out;
  }

  /** 获取指定形状的密集路径点 */
  _getDensePath(shapeKey) {
    if (!this._denseCache) this._denseCache = {};
    if (!this._denseCache[shapeKey]) {
      this._denseCache[shapeKey] = this._densify(PREWRITE_SHAPES[shapeKey], 0.6);
    }
    return this._denseCache[shapeKey];
  }

  /** 归一化坐标 → canvas 像素 */
  _normToPx(nx, ny) {
    return { x: (nx / 100) * this.width, y: (ny / 100) * this.height };
  }

  /** 像素坐标 → 归一化 */
  _pxToNorm(px, py) {
    return { x: (px / this.width) * 100, y: (py / this.height) * 100 };
  }

  /** 屏幕事件 → 归一化坐标 */
  _getEventNorm(e) {
    const rect = this.canvas.getBoundingClientRect();
    const pt = e.touches ? e.touches[0] : e;
    return this._pxToNorm(pt.clientX - rect.left, pt.clientY - rect.top);
  }

  _onPointerDown(e) {
    e.preventDefault();
    if (this.demoPhase) this._stopDemo();
    if (this.userPath.length > 2) {
      // 新开始 → 清空之前墨迹，给幼儿重来的机会
      this.userPath = [];
    }
    this.isDrawing = true;
    const pos = this._getEventNorm(e);
    this.userPath.push(pos);
    this.render();
  }

  _onPointerMove(e) {
    if (!this.isDrawing) return;
    e.preventDefault();
    const pos = this._getEventNorm(e);
    const last = this.userPath[this.userPath.length - 1];
    if (!last || Math.hypot(pos.x - last.x, pos.y - last.y) > 0.5) {
      this.userPath.push(pos);
      this.render();
    }
  }

  _onPointerUp(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    // 计算当前形状完成度
    const shapeKey = this.shapes[this.currentShapeIdx];
    const target = this._getDensePath(shapeKey);
    const coverage = this._computeCoverage(target, this.userPath);
    this.shapeProgress[this.currentShapeIdx] = coverage;

    if (coverage >= this.targetProgressRatio) {
      // 过关！
      soundAndFX.playSuccessSound?.();
      soundAndFX.speakPriority?.(
        `太棒啦！${SHAPE_HINTS[shapeKey]?.split("～")[0] || "画得真好"}真厉害！`,
        { kind: "char", priority: 1 }
      );
      this.onComplete?.(this.currentShapeIdx, coverage);

      this.currentShapeIdx++;
      this.userPath = [];

      if (this.currentShapeIdx >= this.shapes.length) {
        this._finishAll();
        return;
      }
      // 下一形状，短暂提示
      this._speakHint();
      this._startDemoAnimation();
    } else {
      soundAndFX.playSoftError?.();
      soundAndFX.speakPriority?.(
        "再试一次吧，勇敢的小手指！",
        { kind: "char", priority: 1 }
      );
      this.userPath = [];
    }
    this.render();
  }

  /**
   * 计算 coverage：用户轨迹覆盖了目标路径多少比例
   * 对目标每个点，看用户轨迹是否在 tolerance 范围内经过
   */
  _computeCoverage(targetPath, userPath) {
    if (userPath.length < 2) return 0;
    const tol = this.tolerance; // 百分比距离

    let covered = 0;
    const step = Math.max(1, Math.floor(targetPath.length / 60));
    for (let i = 0; i < targetPath.length; i += step) {
      const tp = targetPath[i];
      let hit = false;
      // 只查用户路径上的采样点
      const usrStep = Math.max(1, Math.floor(userPath.length / 80));
      for (let j = 0; j < userPath.length && !hit; j += usrStep) {
        const up = userPath[j];
        if (Math.hypot(tp.x - up.x, tp.y - up.y) <= tol) hit = true;
      }
      if (hit) covered++;
    }
    return covered / Math.ceil(targetPath.length / step);
  }

  /** 语音提示当前形状 */
  _speakHint() {
    const shapeKey = this.shapes[this.currentShapeIdx];
    const hint = SHAPE_HINTS[shapeKey];
    if (hint) {
      soundAndFX.speakPriority?.(hint, { kind: "sentence", emotion: "gentle" });
    }
  }

  /** 自动演示动画：发光光球沿目标路径滑动 */
  _startDemoAnimation() {
    if (this.demoTimer) cancelAnimationFrame(this.demoTimer);
    if (this.currentShapeIdx >= this.shapes.length) return;
    this.demoPhase = true;

    const shapeKey = this.shapes[this.currentShapeIdx];
    const target = PREWRITE_SHAPES[shapeKey];
    if (!target || target.length < 2) { this.demoPhase = false; return; }

    let step = 0;
    const speed = 0.015; // 每秒推进 1.5%

    const animate = () => {
      if (this.isDestroyed || !this.demoPhase) return;
      step += speed;
      if (step >= 1) step = 0; // 循环

      // 沿路径插值
      const totalSegs = target.length - 1;
      const floatIdx = step * totalSegs;
      const i = Math.min(totalSegs - 1, Math.floor(floatIdx));
      const t = floatIdx - i;
      const a = target[i];
      const b = target[Math.min(target.length - 1, i + 1)];
      this.demoPos = {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t
      };
      this._guideProgress = step;
      this.render();
      this.demoTimer = requestAnimationFrame(animate);
    };
    this.demoTimer = requestAnimationFrame(animate);
  }

  _stopDemo() {
    this.demoPhase = false;
    if (this.demoTimer) {
      cancelAnimationFrame(this.demoTimer);
      this.demoTimer = null;
    }
    this.render();
  }

  /**
   * T5: Letter School 运笔演示 (简笔画动作展示 + 语音解说)
   */
  async animateStrokeGesture(shapeName = this.getCurrentShapeName()) {
    this._startDemoAnimation();
    const hint = this._getGestureHint(shapeName);
    if (hint && typeof window !== "undefined" && window.soundAndFX?.speakPriority) {
      window.soundAndFX.speakPriority(hint, { kind: "sentence", emotion: "gentle" });
    }
  }

  _getGestureHint(shapeName) {
    const hints = {
      "竖直线": "从上往下直直画，像小雨滴落下来～",
      "水平线": "从左往右轻轻滑，像小汽车在开～",
      "右斜线": "从左上往右下斜斜滑，像滑滑梯～",
      "同心圆": "圆溜溜转一圈，画个大皮球～",
      "折线": "先往右再往下折，像个小山折角～"
    };
    return hints[shapeName] || `跟着光球画一画${shapeName}吧！`;
  }

  _finishAll() {
    this.demoPhase = false;
    if (this.demoTimer) cancelAnimationFrame(this.demoTimer);
    this.render();
    this.onAllComplete?.();
  }

  // --------------------------------------------------------------
  // 渲染
  // --------------------------------------------------------------

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);

    // 1. 背景：柔和米黄色（护眼，Sweller 饱和度阈值 70% 内）
    ctx.fillStyle = "#FFF8E7";
    ctx.fillRect(0, 0, w, h);

    // 2. 淡色田字格辅助线
    this._drawBackgroundGrid(ctx, w, h);

    // 3. 目标形状（虚线引导，淡橙色）
    if (this.currentShapeIdx < this.shapes.length) {
      const shapeKey = this.shapes[this.currentShapeIdx];
      const target = PREWRITE_SHAPES[shapeKey];
      if (target) this._drawTargetPath(ctx, target, w, h);

      // 已完成形状（小绿勾）
      for (let i = 0; i < this.currentShapeIdx; i++) {
        const doneShape = PREWRITE_SHAPES[this.shapes[i]];
        if (doneShape) this._drawCompletedPath(ctx, doneShape, w, h);
      }
    }

    // 4. 发光引导光球（demo 动画）
    if (this.demoPhase && this.demoPos) {
      const { x, y } = this._normToPx(this.demoPos.x, this.demoPos.y);
      ctx.save();
      ctx.fillStyle = "#FFD600";
      ctx.shadowColor = "#FFAB00";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. 用户当前墨迹（橙红色）
    if (this.userPath.length > 1) {
      ctx.save();
      ctx.strokeStyle = "#FF9100";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 14;
      ctx.shadowColor = "rgba(255,145,0,0.4)";
      ctx.shadowBlur = 6;

      ctx.beginPath();
      for (let i = 0; i < this.userPath.length; i++) {
        const { x, y } = this._normToPx(this.userPath[i].x, this.userPath[i].y);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 6. 握笔姿势提示（仅第一次 + 首次渲染时）
    if (this.enableGripGuide && !this._gripShown) {
      this._drawGripHint(ctx, w, h);
    }
  }

  _drawBackgroundGrid(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = "rgba(200,120,100,0.18)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // 中线
    ctx.beginPath();
    ctx.moveTo(w / 2, 10); ctx.lineTo(w / 2, h - 10);
    ctx.moveTo(10, h / 2); ctx.lineTo(w - 10, h / 2);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.restore();
  }

  _drawTargetPath(ctx, points, w, h) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,140,0,0.4)";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 10;
    ctx.setLineDash([10, 8]);

    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const { x, y } = this._normToPx(points[i].x, points[i].y);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 起点小绿点
    const { x: sx, y: sy } = this._normToPx(points[0].x, points[0].y);
    ctx.setLineDash([]);
    ctx.fillStyle = "#00C853";
    ctx.shadowColor = "#00C853";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(sx, sy, 6, 0, Math.PI * 2);
    ctx.fill();

    // 终点小红旗
    const last = points[points.length - 1];
    const { x: ex, y: ey } = this._normToPx(last.x, last.y);
    ctx.fillStyle = "#E53935";
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(ex + 2, ey - 10);
    ctx.lineTo(ex + 14, ey - 6);
    ctx.lineTo(ex + 2, ey - 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#7B1FA2";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ex + 2, ey - 10);
    ctx.lineTo(ex + 2, ey + 4);
    ctx.stroke();

    ctx.restore();
  }

  _drawCompletedPath(ctx, points, w, h) {
    ctx.save();
    ctx.strokeStyle = "rgba(76,175,80,0.55)";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const { x, y } = this._normToPx(points[i].x, points[i].y);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  _drawGripHint(ctx, w, h) {
    ctx.save();
    // 右下角小气泡提示握笔姿势（简洁版，不遮挡主训练区）
    const bx = w - 120;
    const by = h - 60;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.strokeStyle = "#FF8A65";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(bx, by, 110, 48, 10);
    } else {
      ctx.rect(bx, by, 110, 48);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#E64A19";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("✏️ 用三根手指", bx + 8, by + 18);
    ctx.fillText("轻轻握住笔哦～", bx + 8, by + 34);

    ctx.restore();
    this._gripShown = true;
  }

  /** 外部重置 —— 重新开始当前形状 */
  reset() {
    this.userPath = [];
    this.render();
  }

  /** 跳过当前形状（家长/幼儿可操作） */
  skipCurrent() {
    this.shapeProgress[this.currentShapeIdx] = 0.5; // 标记为"跳过"（不影响下一步）
    this.currentShapeIdx++;
    this.userPath = [];
    this._stopDemo();
    if (this.currentShapeIdx >= this.shapes.length) {
      this._finishAll();
      return;
    }
    this._speakHint();
    this._startDemoAnimation();
  }

  /** 返回当前训练进度（0~1） */
  getProgress() {
    if (this.shapes.length === 0) return 1;
    const base = this.shapeProgress.reduce((a, b) => a + b, 0);
    return Math.min(1, base / this.shapes.length);
  }

  /** 返回当前形状名称（给 UI 显示） */
  getCurrentShapeName() {
    const key = this.shapes[this.currentShapeIdx];
    const labelMap = {
      line_horizontal: "横线",
      line_vertical: "竖线",
      line_diagonal_down: "捺斜",
      line_diagonal_up: "撇斜",
      line_wave: "波浪线",
      circle: "圆圈",
      square: "方框",
      triangle: "三角",
      spiral: "螺旋"
    };
    return labelMap[key] || "形状";
  }

  /** 返回总形状数 */
  getTotalShapes() {
    return this.shapes.length;
  }

  /** 返回当前形状序号（1-based） */
  getCurrentShapeNumber() {
    return Math.min(this.currentShapeIdx + 1, this.shapes.length);
  }
}
