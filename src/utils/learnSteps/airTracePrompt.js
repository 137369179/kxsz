/**
 * P2-7 身体动觉（空中比划热身）—— 测试效应前的身体 priming。
 * 无摄像头降级方案：用发光 ghost 轨迹把笔顺"画在空中"，儿童举小手跟比划。
 * 纯视觉动画，不采集任何摄像头/手势数据；可跳过、可重播。
 * 设计参照 selfExplainPrompt.js（同为该研究方案的挂接式微交互）。
 */
import { escapeHtml } from "../BaseModule.js";
import { soundAndFX } from "../soundEngine.js";
import { GAME_ICONS } from "../gameIcons.js";

/** 3 岁以上均开放（动觉 priming 对各年龄有益），由调用方用 _airTraceDone 控制每字只一次 */
export function shouldUseAirTrace(age) {
  return (Number(age) || 6) >= 3;
}

// ---------- 笔顺坐标工具（复用 charData.strokes 的 0~100 坐标系） ----------
function _px(p, W, H) {
  return { x: (p.x / 100) * W, y: (p.y / 100) * H };
}
function _pathStroke(ctx, stroke, W, H) {
  const s = _px(stroke.start, W, H);
  const e = _px(stroke.end, W, H);
  const hasCorner = stroke.corner && typeof stroke.corner.x === "number";
  ctx.moveTo(s.x, s.y);
  if (hasCorner) {
    const c = _px(stroke.corner, W, H);
    ctx.lineTo(c.x, c.y);
  }
  ctx.lineTo(e.x, e.y);
}
function _headPoint(stroke, W, H, progress) {
  const s = _px(stroke.start, W, H);
  const e = _px(stroke.end, W, H);
  const hasCorner = stroke.corner && typeof stroke.corner.x === "number";
  if (!hasCorner) {
    return { x: s.x + (e.x - s.x) * progress, y: s.y + (e.y - s.y) * progress };
  }
  const c = _px(stroke.corner, W, H);
  if (progress <= 0.5) {
    const t = progress * 2;
    return { x: s.x + (c.x - s.x) * t, y: s.y + (c.y - s.y) * t };
  }
  const t = (progress - 0.5) * 2;
  return { x: c.x + (e.x - c.x) * t, y: c.y + (e.y - c.y) * t };
}
function _drawGrid(ctx, W, H) {
  ctx.save();
  ctx.fillStyle = "#F0FBFF";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(14,165,233,0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, W - 20, H - 20);
  ctx.setLineDash([6, 8]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2, 12); ctx.lineTo(W / 2, H - 12);
  ctx.moveTo(12, H / 2); ctx.lineTo(W - 12, H / 2);
  ctx.moveTo(12, 12); ctx.lineTo(W - 12, H - 12);
  ctx.moveTo(W - 12, 12); ctx.lineTo(12, H - 12);
  ctx.stroke();
  ctx.restore();
}

/**
 * @param {object} charItem 含 .char 与 .strokes
 * @param {(r:{ skipped?: boolean, done?: boolean }) => void} onDone
 */
export function openAirTracePrompt(charItem, onDone) {
  if (typeof document === "undefined") {
    onDone?.({ skipped: true });
    return;
  }

  const char = charItem?.char || "";
  const strokes = Array.isArray(charItem?.strokes) ? charItem.strokes : [];

  // 无笔画数据则直接跳过（防御，不阻塞主流程）
  if (strokes.length === 0) {
    onDone?.({ skipped: true });
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.id = "cathy-air-trace-wrapper";
  wrapper.innerHTML = `
    <div id="air-trace-modal" class="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div class="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-sky-300 flex flex-col items-center gap-3">
        <div class="text-2xl font-black text-sky-950 flex items-center gap-2">
          ${GAME_ICONS.hand ? GAME_ICONS.hand("w-6 h-6 inline-block") : ""}
          <span>空中比划热身</span>
        </div>
        <p class="text-xs font-bold text-sky-800/80 text-center leading-relaxed">
          看小精灵在空中画出「${escapeHtml(char)}」字的笔顺～<br>
          举起小手，在空中跟着比划一遍吧！
        </p>
        <div class="relative w-[300px] h-[300px] rounded-3xl overflow-hidden shadow-xl border-4 border-sky-300 bg-white">
          <canvas id="air-trace-canvas" class="w-full h-full"></canvas>
        </div>
        <div id="air-trace-stroke-tip" class="text-xs font-black text-sky-700 h-4"></div>
        <div class="flex flex-wrap justify-center gap-2 w-full">
          <button type="button" id="btn-air-replay" class="bg-sky-100 hover:bg-sky-200 text-sky-900 font-black text-sm px-5 py-2.5 rounded-full border border-sky-300 cursor-pointer active:scale-95 flex items-center gap-1" data-speak="再看一遍示范">
            ${GAME_ICONS.back ? GAME_ICONS.back("w-4 h-4 inline-block") : ""}
            <span>再看一遍</span>
          </button>
          <button type="button" id="btn-air-done" class="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-black text-sm px-6 py-2.5 rounded-full shadow-md cursor-pointer active:scale-95" data-speak="太棒了，我比划好啦">我比划好啦，开始写！</button>
        </div>
        <div class="flex items-center gap-1.5 text-[10px] font-bold text-sky-700/70">
          ${GAME_ICONS.sparkle("w-3.5 h-3.5 inline-block")}
          <span>小手动起来，记得更牢</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  const canvas = wrapper.querySelector("#air-trace-canvas");
  const tip = wrapper.querySelector("#air-trace-stroke-tip");
  const W = 600, H = 600;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  let rafId = null;
  let stopped = false;
  let strokeIdx = 0;
  let t = 0;
  let lastSpoken = -1;

  const _finishFrame = () => {
    // 全部笔画完成后：整字淡橙定格 + 提示
    ctx.clearRect(0, 0, W, H);
    _drawGrid(ctx, W, H);
    ctx.save();
    ctx.strokeStyle = "#FF8A4C";
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(255,138,76,0.4)";
    ctx.shadowBlur = 8;
    for (const s of strokes) {
      ctx.beginPath();
      _pathStroke(ctx, s, W, H);
      ctx.stroke();
    }
    ctx.restore();
    if (tip) tip.textContent = `「${char}」笔顺看完啦！`;
  };

  const _loop = () => {
    if (stopped) return;
    t += 0.03;
    ctx.clearRect(0, 0, W, H);
    _drawGrid(ctx, W, H);

    // 已完成笔画：淡橙底
    for (let i = 0; i < strokeIdx; i++) {
      ctx.save();
      ctx.strokeStyle = "#FFD9A0";
      ctx.lineWidth = 20;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      _pathStroke(ctx, strokes[i], W, H);
      ctx.stroke();
      ctx.restore();
    }

    const cur = strokes[strokeIdx];
    if (cur) {
      if (strokeIdx !== lastSpoken) {
        lastSpoken = strokeIdx;
        try {
          soundAndFX.speakPriority(cur.name || `第 ${strokeIdx + 1} 笔`, { kind: "char", priority: 1 });
        } catch (_) { /* ignore */ }
      }
      const prog = Math.min(t, 1);
      ctx.save();
      ctx.strokeStyle = "#FF6B00";
      ctx.lineWidth = 20;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(255,107,0,0.55)";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(_px(cur.start, W, H).x, _px(cur.start, W, H).y);
      // 部分笔画：画到当前进度点
      const hp = _headPoint(cur, W, H, prog);
      const cp = _px(cur.start, W, H);
      const ep = _px(cur.end, W, H);
      const hasCorner = cur.corner && typeof cur.corner.x === "number";
      if (hasCorner) {
        const cc = _px(cur.corner, W, H);
        if (prog <= 0.5) {
          const tt = prog * 2;
          ctx.lineTo(cp.x + (cc.x - cp.x) * tt, cp.y + (cc.y - cp.y) * tt);
        } else {
          ctx.lineTo(cc.x, cc.y);
          const tt = (prog - 0.5) * 2;
          ctx.lineTo(cc.x + (ep.x - cc.x) * tt, cc.y + (ep.y - cc.y) * tt);
        }
      } else {
        ctx.lineTo(cp.x + (ep.x - cp.x) * prog, cp.y + (ep.y - cp.y) * prog);
      }
      ctx.stroke();
      ctx.restore();

      // 发光笔尖（ghost 手）
      ctx.save();
      ctx.fillStyle = "#FFD600";
      ctx.shadowColor = "#FF6D00";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (tip) tip.textContent = `第 ${strokeIdx + 1} / ${strokes.length} 笔：${cur.name || ""}`;
    }

    if (t >= 1) {
      strokeIdx++;
      t = 0;
      if (strokeIdx >= strokes.length) {
        stopped = true;
        _finishFrame();
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        return;
      }
    }
    rafId = requestAnimationFrame(_loop);
  };

  const _start = () => {
    stopped = false;
    strokeIdx = 0;
    t = 0;
    lastSpoken = -1;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(_loop);
  };
  const _cancel = () => {
    stopped = true;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    try { soundAndFX.stopSpeaking?.(); } catch (_) { /* ignore */ }
  };

  let done = false;
  const finish = (payload) => {
    if (done) return;
    done = true;
    _cancel();
    try { soundAndFX.stopSpeaking?.(); } catch (_) { /* ignore */ }
    try { soundAndFX.playPop?.(); } catch (_) { /* ignore */ }
    wrapper.remove();
    onDone?.(payload || {});
  };

  wrapper.querySelector("#btn-air-replay")?.addEventListener("click", () => {
    try { soundAndFX.playPop?.(); } catch (_) { /* ignore */ }
    _start();
  });
  wrapper.querySelector("#btn-air-done")?.addEventListener("click", () => finish({ done: true }));
  // 点击遮罩空白处 = 跳过（不强制）
  wrapper.querySelector("#air-trace-modal")?.addEventListener("click", (e) => {
    if (e.target && e.target.id === "air-trace-modal") finish({ skipped: true });
  });

  _start();
}
