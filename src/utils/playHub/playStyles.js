/**
 * PlayModule 增强动画样式（注入一次）
 */
const PLAY_STYLE_ID = "cathy-play-enhance-css";

export function ensurePlayStyles() {
  if (typeof document === "undefined" || document.getElementById(PLAY_STYLE_ID)) return;
  const css = `
    /* 3D 翻牌（消消乐） */
    .pf-wrap { perspective: 900px; }
    .pf-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform .45s cubic-bezier(.4,0,.2,1); }
    .pf-wrap.flipped .pf-inner { transform: rotateY(180deg); }
    .pf-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; display: flex; align-items: center; justify-content: center; border-radius: 1.25rem; }
    .pf-front { background: linear-gradient(135deg, #fbbf24, #f97316); }
    .pf-back { background: linear-gradient(135deg, #8b5cf6, #6366f1); transform: rotateY(180deg); }
    /* 战斗飘字 */
    .fx-float { position: absolute; font-family: inherit; animation: fxFloat 1.1s ease-out forwards; pointer-events: none; z-index: 60; font-weight: 900; text-shadow: 0 2px 8px rgba(0,0,0,.5); }
    @keyframes fxFloat { 0% { opacity:1; transform: translateY(0) scale(.6); } 30% { transform: translateY(-26px) scale(1.25); } 100% { opacity:0; transform: translateY(-70px) scale(.9); } }
    .fx-pop { animation: fxPop .5s cubic-bezier(.34,1.56,.64,1) both; }
    @keyframes fxPop { 0% { transform: scale(0); } 70% { transform: scale(1.25); } 100% { transform: scale(1); } }
    /* 倒计时环 */
    .timer-ring { width: 72px; height: 72px; border-radius: 50%; display:flex; align-items:center; justify-content:center; position: relative; }
    .timer-ring::before { content:""; position:absolute; inset:-6px; border-radius:50%; border:4px solid rgba(255,255,255,.25); }
    .timer-ring.ticking::after { content:""; position:absolute; inset:-6px; border-radius:50%; border:4px solid transparent; animation: ringSpin 1s linear infinite; }
    @keyframes ringSpin { to { transform: rotate(360deg); } border-color: #fbbf24 transparent transparent transparent; }
    /* Boss 狂暴 */
    .boss-rage { animation: bossRage .6s ease-in-out infinite alternate; }
    @keyframes bossRage { from { transform: scale(1); filter: brightness(1); } to { transform: scale(1.12); filter: brightness(1.45) saturate(1.6); } }
    /* 回复血条绿光 */
    .hp-heal { box-shadow: 0 0 18px rgba(52,211,153,.9); }
    /* 连胜徽章 */
    .streak-badge { animation: streakGlow 1.2s ease-in-out infinite alternate; }
    @keyframes streakGlow { from { box-shadow: 0 0 6px rgba(251,191,36,.4); } to { box-shadow: 0 0 22px rgba(251,191,36,.9); } }
    /* 卡面已学对勾 */
    .learned-stamp { position: absolute; top:8px; right:8px; z-index:5; }
    /* Combo 连击阶段特效 */
    .combo-x3 { color: #fbbf24; text-shadow: 0 0 12px #fbbf24, 0 0 24px rgba(251,191,36,.6); animation: comboGlow3 .8s ease-in-out infinite alternate; }
    @keyframes comboGlow3 { from { transform: scale(1); } to { transform: scale(1.12); } }
    .combo-x5 { color: #f97316; text-shadow: 0 0 16px #f97316, 0 0 32px rgba(249,115,22,.8); animation: comboGlow5 .5s ease-in-out infinite alternate; }
    @keyframes comboGlow5 { from { transform: scale(1) rotate(-1deg); } to { transform: scale(1.2) rotate(1deg); } }
    .combo-x7 { color: #ec4899; text-shadow: 0 0 20px #ec4899, 0 0 40px #a855f7, 0 0 60px #3b82f6; animation: comboGlow7 .35s ease-in-out infinite alternate; }
    @keyframes comboGlow7 { from { transform: scale(1.05) rotate(-2deg); filter: hue-rotate(0deg); } to { transform: scale(1.3) rotate(2deg); filter: hue-rotate(180deg); } }
    /* 连击时屏幕边缘闪光 */
    .combo-screen-flash { position: fixed; inset: 0; pointer-events: none; z-index: 200; border-radius: 0; }
    .combo-screen-flash.c3 { box-shadow: inset 0 0 40px rgba(251,191,36,.35); }
    .combo-screen-flash.c5 { box-shadow: inset 0 0 60px rgba(249,115,22,.5); }
    .combo-screen-flash.c7 { box-shadow: inset 0 0 80px rgba(236,72,153,.65); }
    @keyframes flashFade { 0%,100% { opacity:0; } 20%,80% { opacity:1; } }
  `;
  if (typeof document !== "undefined" && (document.head || document.body)) {
    const style = document.createElement("style");
    style.id = PLAY_STYLE_ID;
    style.textContent = css;
    (document.head || document.body).appendChild(style);
  }
}
