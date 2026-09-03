/**
 * 凯茜识字 (Cathy Literacy) - 纯前端零外部依赖 Canvas 二维码生成引擎
 * 采用标准 QR Code Model 2 字节编码与 Reed-Solomon 纠错 (ECC Level L)
 */

// Galois Field GF(256) 运算表 (多项式 0x11D: x^8 + x^4 + x^3 + x^2 + 1)
const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_LOG[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF256_EXP[i] = GF256_EXP[i - 255];
  }
})();

function gfMul(x, y) {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

function rsGenPoly(numErrors) {
  let poly = [1];
  for (let i = 0; i < numErrors; i++) {
    const next = [1, GF256_EXP[i]];
    const res = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j++) {
      res[j] ^= gfMul(poly[j], next[0]);
      res[j + 1] ^= gfMul(poly[j], next[1]);
    }
    poly = Array.from(res);
  }
  return poly;
}

function rsEncode(data, numErrors) {
  const gen = rsGenPoly(numErrors);
  const msg = new Uint8Array(data.length + numErrors);
  msg.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return msg.slice(data.length);
}

// 常用版本容量对照 (ECC L: 版本 1~10)
const VERSION_CAPACITY = [
  0, 19, 34, 55, 80, 108, 136, 156, 194, 232, 274
];
const VERSION_ECC_WORDS = [
  0, 7, 10, 15, 20, 26, 36, 40, 48, 60, 72
];

/**
 * 确定满足文本长度的最小 QR 版本
 */
function getBestVersion(dataLength) {
  for (let v = 1; v < VERSION_CAPACITY.length; v++) {
    if (dataLength + 3 <= VERSION_CAPACITY[v]) return v;
  }
  return 10; // 最大版本
}

/**
 * 在目标 Canvas 上绘制指定文本的二维码
 * @param {HTMLCanvasElement} canvas
 * @param {string} text
 * @param {object} options
 */
export function drawQRCode(canvas, text, options = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = options.size || canvas.width || 240;
  const margin = options.margin || 4;
  const darkColor = options.darkColor || "#1e1b4b";
  const lightColor = options.lightColor || "#ffffff";

  // UTF-8 编码
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);
  const version = options.version || getBestVersion(textBytes.length);
  const modCount = version * 4 + 17; // 矩阵边长

  // 初始化模块网格 (0: 空白, 1: 黑色, -1: 未占用)
  const matrix = Array.from({ length: modCount }, () => new Int8Array(modCount).fill(-1));
  const isFunction = Array.from({ length: modCount }, () => new Uint8Array(modCount));

  function setModule(r, c, val, isFunc = false) {
    if (r >= 0 && r < modCount && c >= 0 && c < modCount) {
      matrix[r][c] = val ? 1 : 0;
      if (isFunc) isFunction[r][c] = 1;
    }
  }

  // 1. 放置三个角的位置探测图形 (Finder Patterns: 7x7)
  function placeFinder(top, left) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        setModule(top + r, left + c, isBorder || isCenter, true);
      }
    }
    // 分隔符 (白边)
    for (let i = -1; i <= 7; i++) {
      setModule(top - 1, left + i, 0, true);
      setModule(top + 7, left + i, 0, true);
      setModule(top + i, left - 1, 0, true);
      setModule(top + i, left + 7, 0, true);
    }
  }

  placeFinder(0, 0);
  placeFinder(0, modCount - 7);
  placeFinder(modCount - 7, 0);

  // 2. 定时图形 (Timing Patterns)
  for (let i = 8; i < modCount - 8; i++) {
    const val = i % 2 === 0 ? 1 : 0;
    if (!isFunction[6][i]) setModule(6, i, val, true);
    if (!isFunction[i][6]) setModule(i, 6, val, true);
  }

  // 3. 校正图形 (Alignment Pattern - 版本 >= 2)
  if (version >= 2) {
    const alignPos = [6, modCount - 7];
    const r = alignPos[1];
    const c = alignPos[1];
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
        const isCenter = dr === 0 && dc === 0;
        setModule(r + dr, c + dc, isBorder || isCenter, true);
      }
    }
  }

  // 4. 打包字节数据流 (8-bit Byte Mode: 0100)
  const bitStream = [];
  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      bitStream.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // 模式标识
  pushBits(textBytes.length, 8); // 字符数指示
  for (const b of textBytes) {
    pushBits(b, 8);
  }

  // 终止符与对齐
  const totalDataBits = (VERSION_CAPACITY[version] - VERSION_ECC_WORDS[version]) * 8;
  while (bitStream.length < totalDataBits && bitStream.length % 8 !== 0) {
    bitStream.push(0);
  }
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bitStream.length < totalDataBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // 转换为字节数组并计算 Reed-Solomon 纠错码
  const dataBytes = new Uint8Array(totalDataBits / 8);
  for (let i = 0; i < dataBytes.length; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bitStream[i * 8 + b];
    }
    dataBytes[i] = byteVal;
  }

  const eccWords = VERSION_ECC_WORDS[version];
  const ecBytes = rsEncode(dataBytes, eccWords);

  // 合并全部二进制数据流
  const finalBits = [];
  for (const d of dataBytes) {
    for (let b = 7; b >= 0; b--) finalBits.push((d >> b) & 1);
  }
  for (const ec of ecBytes) {
    for (let b = 7; b >= 0; b--) finalBits.push((ec >> b) & 1);
  }

  // 5. 填入数据模块 (右到左双列蛇形填充)
  let bitIdx = 0;
  let dir = -1;
  let row = modCount - 1;

  for (let col = modCount - 1; col > 0; col -= 2) {
    if (col === 6) col -= 1; // 跳过时序列
    for (let count = 0; count < modCount; count++) {
      for (let cOffset = 0; cOffset < 2; cOffset++) {
        const c = col - cOffset;
        if (!isFunction[row][c]) {
          const bit = bitIdx < finalBits.length ? finalBits[bitIdx++] : 0;
          // 应用标准 Mask 0: (row + col) % 2 === 0
          const mask = (row + c) % 2 === 0 ? 1 : 0;
          setModule(row, c, bit ^ mask);
        }
      }
      row += dir;
    }
    dir = -dir;
    row += dir;
  }

  // 6. 绘制格式信息 (Format Information for Mask 0 / ECC L: 0x77c4)
  const formatBits = 0x77c4;
  for (let i = 0; i < 15; i++) {
    const bit = (formatBits >> (14 - i)) & 1;
    // 左上
    if (i < 6) setModule(8, i, bit, true);
    else if (i < 8) setModule(8, i + 1, bit, true);
    else if (i === 8) setModule(7, 8, bit, true);
    else setModule(14 - i, 8, bit, true);

    // 右上 / 左下
    if (i < 8) setModule(modCount - 1 - i, 8, bit, true);
    else setModule(8, modCount - 15 + i, bit, true);
  }
  setModule(modCount - 8, 8, 1, true); // 暗模块

  // 7. 渲染至 Canvas
  canvas.width = size;
  canvas.height = size;
  const cellSize = size / (modCount + margin * 2);

  ctx.fillStyle = lightColor;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = darkColor;
  for (let r = 0; r < modCount; r++) {
    for (let c = 0; c < modCount; c++) {
      if (matrix[r][c] === 1) {
        ctx.fillRect(
          Math.round((c + margin) * cellSize),
          Math.round((r + margin) * cellSize),
          Math.ceil(cellSize),
          Math.ceil(cellSize)
        );
      }
    }
  }
}
