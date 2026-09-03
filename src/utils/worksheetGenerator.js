/**
 * 凯茜识字 (Cathy Literacy) - A4 田字格练字帖与生词描红打印引擎
 * -----------------------------------------------------------------
 * 1. 严格遵循教育部小学一二年级田字格/米字格标准 (15mm 标准儿童大格)。
 * 2. 包含拼音四线三格、大字展示、部首笔画、逐笔笔顺分解、描红区与自主书写区。
 * 3. 纯原生 HTML/CSS 打印排版，无需重型三方依赖，支持 iframe 异步无缝打印。
 * 4. 严守工程红线：绝对零 Unicode Emoji，零 SVG。
 */

import { ebbinghausManager } from "./ebbinghaus.js";
import { CHARACTER_DATABASE } from "../data/characters.js";

/**
 * 生成单个汉字的标准练字帖卡片 HTML
 */
export function generateCharWorksheetCard(charItem, options = {}) {
  if (!charItem) return "";

  const gridType = options.gridType || "mi";
  const strokes = charItem.strokes || [];
  const words = (charItem.words || []).slice(0, 3);
  const sentence = charItem.sentence || "";

  const gridClass = gridType === "mi" ? "grid-mi" : "grid-tian";
  const innerBgHTML = gridType === "mi"
    ? `<span class="tianzi-inner-bg"><span class="diag-1"></span><span class="diag-2"></span></span>`
    : `<span class="tianzi-inner-bg"></span>`;

  // 笔顺分解步骤 (最多展示前 8 笔)
  const strokeSteps = strokes.slice(0, 8).map((st, idx) => {
    return `
      <div class="stroke-step-box">
        <div class="mini-tianzi ${gridClass}">
          ${innerBgHTML}
          <span class="stroke-step-num">${idx + 1}</span>
          <span class="stroke-name-label">${st.name || ""}</span>
        </div>
      </div>
    `;
  }).join("");

  // 浅灰描红格 (4 格) 与 自主书写空字格 (4 格)
  const traceGrids = Array(4).fill(0).map(() => `
    <div class="tianzi-cell trace-cell ${gridClass}">
      ${innerBgHTML}
      <span class="trace-char">${charItem.char}</span>
    </div>
  `).join("");

  const emptyGrids = Array(4).fill(0).map(() => `
    <div class="tianzi-cell empty-cell ${gridClass}">
      ${innerBgHTML}
    </div>
  `).join("");

  return `
    <div class="worksheet-char-section">
      
      <div class="char-header-row">
        
        <div class="char-primary-display">
          <div class="pinyin-four-line">
            <div class="line-1"></div>
            <div class="line-2"></div>
            <div class="line-3"></div>
            <div class="line-4"></div>
            <span class="pinyin-text">${charItem.pinyin || ""}</span>
          </div>
          <div class="giant-tianzi ${gridClass}">
            ${innerBgHTML}
            <span class="giant-char">${charItem.char}</span>
          </div>
        </div>

        <div class="char-meta-info">
          <div class="meta-tag"><span class="meta-label">偏旁部首:</span> <span class="meta-value">${charItem.radical || "无"}</span></div>
          <div class="meta-tag"><span class="meta-label">总笔画数:</span> <span class="meta-value">${charItem.strokeCount || strokes.length} 画</span></div>
          <div class="meta-tag"><span class="meta-label">字形结构:</span> <span class="meta-value">${charItem.charType === "pictograph" ? "象形字" : charItem.charType === "ideograph" ? "指事字" : "合体字"}</span></div>
          
          <div class="stroke-breakdown-row">
            <div class="breakdown-title">笔顺分解 (${strokes.length}笔):</div>
            <div class="stroke-steps-container">
              ${strokeSteps}
            </div>
          </div>
        </div>

      </div>

      <div class="practice-grids-row">
        <div class="grid-section-label">描红练字</div>
        <div class="grids-wrapper">
          ${traceGrids}
        </div>
        <div class="grid-section-label">独立书写</div>
        <div class="grids-wrapper">
          ${emptyGrids}
        </div>
      </div>

      <div class="char-words-row">
        <div class="words-list">
          <span class="section-badge">常用词汇:</span>
          ${words.map(w => `<span class="word-chip"><strong>${w.word}</strong> (${w.pinyin})</span>`).join(" ")}
        </div>
        ${sentence ? `
        <div class="sentence-box">
          <span class="section-badge">典范造句:</span>
          <span class="sentence-text">${sentence}</span>
        </div>
        ` : ""}
      </div>

    </div>
  `;
}

/**
 * 生成完整打印页面的 HTML 骨架
 * @param {Array} chars - 汉字对象数组
 * @param {string} title - 字帖标题
 * @param {object} options - { gridType: "mi" | "tian" }
 */
export function buildWorksheetFullHTML(chars, title = "凯茜识字 · 专属田字格练字帖", options = {}) {
  const charSections = chars.map(c => generateCharWorksheetCard(c, options)).join("\n");
  const gridLabel = (options.gridType === "tian") ? "田字格" : "米字格";
  const todayStr = new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "STKaiti", "KaiTi", serif;
      background-color: #fff;
      color: #1f2937;
      line-height: 1.4;
      font-size: 13px;
    }

    /* 纸张容器 */
    .worksheet-page {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 10px 0;
    }

    /* 顶部页眉 */
    .worksheet-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    .header-title {
      font-size: 20px;
      font-weight: 900;
      color: #9a3412;
      letter-spacing: 1px;
    }
    .header-info {
      font-size: 11px;
      color: #6b7280;
      display: flex;
      gap: 16px;
    }
    .header-info span strong {
      color: #374151;
    }

    /* 单字板块 */
    .worksheet-char-section {
      border: 2px solid #ea580c;
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 18px;
      background: #fff;
      page-break-inside: avoid;
    }

    /* 第一行：超大字 + 笔顺信息 */
    .char-header-row {
      display: flex;
      align-items: center;
      gap: 20px;
      border-bottom: 1px dashed #fdba74;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    .char-primary-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 110px;
      flex-shrink: 0;
    }

    /* 四线三格拼音 */
    .pinyin-four-line {
      position: relative;
      width: 90px;
      height: 24px;
      margin-bottom: 4px;
    }
    .pinyin-four-line div {
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #cbd5e1;
    }
    .pinyin-four-line .line-1 { top: 0; }
    .pinyin-four-line .line-2 { top: 8px; }
    .pinyin-four-line .line-3 { top: 16px; }
    .pinyin-four-line .line-4 { top: 24px; }
    .pinyin-text {
      position: absolute;
      top: 1px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 15px;
      font-weight: bold;
      color: #c2410c;
      line-height: 1;
      font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
    }

    /* 超大字米字格 */
    .giant-tianzi {
      position: relative;
      width: 88px;
      height: 88px;
      border: 2px solid #ea580c;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fffaf0;
    }
    .giant-char {
      position: relative;
      z-index: 2;
      font-size: 64px;
      font-weight: 900;
      color: #9a3412;
      line-height: 1;
      font-family: "STKaiti", "KaiTi", "楷体", serif;
    }

    /* 田字格 / 米字格内部辅助虚线 */
    .tianzi-inner-bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .tianzi-inner-bg::before {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: 1px;
      border-left: 1px dashed #fdba74;
    }
    .tianzi-inner-bg::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: 1px;
      border-top: 1px dashed #fdba74;
    }

    /* 米字格专属对角线 */
    .tianzi-inner-bg .diag-1,
    .tianzi-inner-bg .diag-2 {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .tianzi-inner-bg .diag-1::before {
      content: "";
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: linear-gradient(
        to bottom right,
        transparent calc(50% - 0.5px),
        #fdba74 calc(50% - 0.5px),
        #fdba74 calc(50% + 0.5px),
        transparent calc(50% + 0.5px)
      );
    }
    .tianzi-inner-bg .diag-2::before {
      content: "";
      position: absolute;
      top: 0; right: 0;
      width: 100%; height: 100%;
      background: linear-gradient(
        to bottom left,
        transparent calc(50% - 0.5px),
        #fdba74 calc(50% - 0.5px),
        #fdba74 calc(50% + 0.5px),
        transparent calc(50% + 0.5px)
      );
    }

    /* 属性元数据 */
    .char-meta-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .meta-tag {
      font-size: 12px;
      color: #4b5563;
    }
    .meta-label {
      font-weight: bold;
      color: #1f2937;
    }
    .meta-value {
      color: #ea580c;
      font-weight: bold;
      margin-left: 4px;
    }

    .stroke-breakdown-row {
      margin-top: 4px;
    }
    .breakdown-title {
      font-size: 11px;
      font-weight: bold;
      color: #4b5563;
      margin-bottom: 4px;
    }
    .stroke-steps-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .stroke-step-box {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .mini-tianzi {
      position: relative;
      width: 32px;
      height: 32px;
      border: 1px solid #fed7aa;
      background: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .stroke-step-num {
      font-size: 9px;
      color: #9a3412;
      font-weight: bold;
      line-height: 1;
    }
    .stroke-name-label {
      font-size: 9px;
      color: #4b5563;
      line-height: 1;
      margin-top: 2px;
    }

    /* 第二行：田字格实战书写区 */
    .practice-grids-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .grid-section-label {
      font-size: 11px;
      font-weight: bold;
      color: #9a3412;
      writing-mode: vertical-lr;
      letter-spacing: 2px;
    }
    .grids-wrapper {
      display: flex;
      gap: 8px;
    }
    .tianzi-cell {
      position: relative;
      width: 54px;
      height: 54px;
      border: 1px solid #ea580c;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
    }
    .trace-char {
      position: relative;
      z-index: 2;
      font-size: 40px;
      font-weight: normal;
      color: #d1d5db; /* 浅灰描红 */
      font-family: "STKaiti", "KaiTi", "楷体", serif;
      line-height: 1;
    }

    /* 第三行：组词与造句 */
    .char-words-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: #fff7ed;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 11px;
    }
    .section-badge {
      font-weight: bold;
      color: #9a3412;
      margin-right: 6px;
    }
    .word-chip {
      margin-right: 12px;
      color: #374151;
    }
    .word-chip strong {
      color: #c2410c;
    }
    .sentence-box {
      color: #4b5563;
      font-size: 11px;
    }
    .sentence-text {
      color: #1f2937;
    }

    /* 底部页脚 */
    .worksheet-footer {
      text-align: center;
      font-size: 10px;
      color: #9ca3af;
      margin-top: 14px;
      border-top: 1px solid #f3f4f6;
      padding-top: 6px;
    }

    /* 打印机优化指令 */
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="worksheet-page">
    <div class="worksheet-header">
      <div>
        <h1 class="header-title">${title}</h1>
      </div>
      <div class="header-info">
        <span>日期: <strong>${todayStr}</strong></span>
        <span>小勇士: <strong>_______________</strong></span>
        <span>书写评级: <strong>[ 优 / 良 / 鼓励 ]</strong></span>
      </div>
    </div>

    <div class="worksheet-content">
      ${charSections}
    </div>

    <div class="worksheet-footer">
      凯茜识字 (Cathy Literacy) · 专为学龄前儿童设计的直观科学字帖
    </div>
  </div>

  <script>
    window.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => {
        window.print();
      }, 350);
    });
  </script>
</body>
</html>
  `;
}

/**
 * 触发打印功能（采用无跳转隐藏 iframe 方式）
 * @param {Array} chars - 汉字对象数组
 * @param {string} title - 字帖标题
 * @param {object} options - { gridType: "mi" | "tian" }
 */
export function printWorksheet(chars, title, options = {}) {
  if (!chars || chars.length === 0) return;

  const html = buildWorksheetFullHTML(chars, title, options);

  // 检查是否存在已有的 print iframe
  let iframe = document.getElementById("cathy-print-iframe");
  if (iframe) {
    iframe.remove();
  }

  iframe = document.createElement("iframe");
  iframe.id = "cathy-print-iframe";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  try {
    const win = iframe.contentWindow;
    if (!win) return;
    const doc = win.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  } catch (e) {
    console.warn("Print worksheet iframe error:", e);
  }
}

/**
 * 获取今日所学字符集
 */
export function getTodayWorksheetChars() {
  const progress = ebbinghausManager.progress;
  const currentIdx = Math.max(0, (progress.currentLevelIndex || 1) - 1);
  const startIdx = Math.max(0, currentIdx - 4);
  return CHARACTER_DATABASE.slice(startIdx, currentIdx + 1);
}

/**
 * 获取难字本字符集
 */
export function getDifficultWorksheetChars() {
  const progress = ebbinghausManager.progress;
  const hardIds = Object.keys(progress.charRecords || {}).filter(
    id => progress.charRecords[id]?.isDifficult || progress.charRecords[id]?.reps < 2
  );

  const matched = CHARACTER_DATABASE.filter(c => hardIds.includes(c.id));
  return matched.length > 0 ? matched.slice(0, 6) : CHARACTER_DATABASE.slice(0, 4);
}
