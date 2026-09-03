import { readFileSync, readdirSync, statSync } from 'node:fs';
import * as acorn from 'acorn';

function walkFiles(root, acc = []) {
  for (const name of readdirSync(root)) {
    if (name === 'node_modules' || name === '__pycache__' || name === '_backup' || name === '.git') continue;
    const p = `${root}/${name}`;
    const s = statSync(p);
    if (s.isDirectory()) walkFiles(p, acc);
    else if (p.endsWith('.js') || p.endsWith('.mjs')) acc.push(p);
  }
  return acc;
}

function* walkAll(node) {
  if (!node || typeof node !== 'object') return;
  yield node;
  for (const key of Object.keys(node)) {
    const val = node[key];
    if (val && typeof val === 'object') {
      if (Array.isArray(val)) {
        for (const v of val) {
          if (v && typeof v.type === 'string') yield* walkAll(v);
        }
      } else if (typeof val.type === 'string') {
        yield* walkAll(val);
      }
    }
  }
}

const files = walkFiles('src').concat(walkFiles('tools'));
let total = 0;
const samples = [];

for (const file of files) {
  let src;
  try { src = readFileSync(file, 'utf8'); } catch { continue; }
  let ast;
  try {
    ast = acorn.parse(src, { ecmaVersion: 2024, sourceType: 'module', locations: true });
  } catch { continue; }
  for (const node of walkAll(ast)) {
    if (node.type === 'TemplateLiteral') {
      for (const q of node.quasis) {
        const txt = q.value.cooked;
        if (!txt) continue;
        const lines = txt.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          // 整行(可前后空白) + // + 后续非 / 内容（保守）
          if (/^\s*\/\/\s*\S/.test(line)) {
            total++;
            if (samples.length < 30) {
              samples.push(`${file}:${q.loc.start.line + i}  ${line.trim().slice(0, 80)}`);
            }
          }
        }
      }
    }
  }
}

console.log(`AST 模板 // 注释行总数: ${total}`);
samples.forEach(s => console.log('  ' + s));
