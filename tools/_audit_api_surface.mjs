// 跨模块 API 表面审计（运行时自省版）：真正 import 来源模块，检查消费方调用的
// `<binding>.<method>(` 是否仍存在于该导出值上（覆盖实例方法/类原型/命名空间）。
// 零误报：只有「方法在运行时确实不存在」才报告。
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { pathToFileURL } from "url";

const root = process.cwd();

const noop = () => {};
function makeStub() {
  const fn = function () { return makeStub(); };
  return new Proxy(fn, {
    get(t, p) {
      if (p === Symbol.iterator) return function* () {};
      if (p === "then") return undefined;
      if (p === Symbol.toPrimitive) return () => 0;
      if (p === "length") return 0;
      if (p === "nodeType") return 1;
      if (p === "style") return makeStub();
      if (p === "classList") return { add: noop, remove: noop, toggle: noop, contains: () => false };
      if (p === "dataset") return makeStub();
      return makeStub();
    },
    set() { return true; },
    apply() { return makeStub(); },
    construct() { return makeStub(); },
  });
}
class StubAudioCtx {
  constructor() { this.currentTime = 0; this.state = "running"; this.destination = makeStub(); this.sampleRate = 44100; }
  createMediaStreamSource() { return makeStub(); }
  createAnalyser() { return Object.assign(makeStub(), { frequencyBinCount: 1024, getByteFrequencyData: noop, connect: noop, disconnect: noop }); }
  createGain() { return Object.assign(makeStub(), { gain: { value: 0, setValueAtTime: noop, linearRampToValueAtTime: noop }, connect: noop }); }
  createOscillator() { return Object.assign(makeStub(), { frequency: { value: 0, setValueAtTime: noop }, connect: noop, start: noop, stop: noop }); }
  createBufferSource() { return Object.assign(makeStub(), { connect: noop, start: noop, stop: noop }); }
  resume() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
}
function setGlobal(name, val) {
  try { Object.defineProperty(globalThis, name, { value: val, configurable: true, writable: true }); }
  catch { try { globalThis[name] = val; } catch {} }
}
setGlobal("window", globalThis);
setGlobal("document", {
  getElementById: () => makeStub(),
  createElement: () => makeStub(),
  createElementNS: () => makeStub(),
  querySelector: () => makeStub(),
  querySelectorAll: () => [],
  addEventListener: noop, removeEventListener: noop,
  body: makeStub(), head: makeStub(), documentElement: makeStub(),
  readyState: "complete",
});
setGlobal("navigator", { userAgent: "node", language: "zh-CN", mediaDevices: { getUserMedia: () => Promise.resolve(makeStub()) } });
setGlobal("location", { href: "http://localhost/", searchParams: new URLSearchParams() });
setGlobal("performance", globalThis.performance || { now: () => Date.now() });
setGlobal("AudioContext", StubAudioCtx);
setGlobal("webkitAudioContext", StubAudioCtx);
setGlobal("MediaRecorder", class { start() {} stop() {} });
setGlobal("SpeechRecognition", class { start() {} stop() {} });
setGlobal("webkitSpeechRecognition", class { start() {} stop() {} });
setGlobal("localStorage", { getItem: () => null, setItem: noop, removeItem: noop, clear: noop });
setGlobal("indexedDB", { open: () => makeStub() });
setGlobal("requestAnimationFrame", (cb) => setTimeout(cb, 16));
setGlobal("cancelAnimationFrame", noop);
setGlobal("matchMedia", () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop }));
setGlobal("getComputedStyle", () => makeStub());
setGlobal("fetch", () => Promise.resolve({ ok: true, json: () => Promise.resolve({}), text: () => Promise.resolve("") }));
setGlobal("customElements", { define: noop, get: () => undefined });

function walk(d, acc) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); let st; try { st = fs.statSync(p); } catch { continue; } if (st.isDirectory()) { if (["node_modules", ".git", ".trae", "_backup", "__pycache__"].includes(f)) continue; walk(p, acc); } else if (f.endsWith(".js") || f.endsWith(".mjs")) acc.push(p); } return acc; }

const modified = execSync("git status --porcelain", { cwd: root }).toString().split("\n").map((l) => l.trim()).filter(Boolean)
  .map((l) => l.replace(/^[ MADRCU?!]+\s+/, "")).filter((f) => (f.endsWith(".js") || f.endsWith(".mjs")) && fs.existsSync(path.join(root, f)));

function parseImports(file) {
  const t = fs.readFileSync(file, "utf8");
  const imports = [];
  const re = /import\s+(?:([A-Za-z0-9_$]+)\s*,?\s*)?(?:\*\s+as\s+([A-Za-z0-9_$]+)\s*)?(?:\{([^}]*)\})?\s*from\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(t))) {
    const def = m[1], ns = m[2], named = m[3], spec = m[4];
    if (!spec.startsWith(".")) continue;
    const base = path.dirname(file);
    const cands = [spec, spec + ".js", spec + ".mjs", path.join(spec, "index.js")];
    let resolved = null;
    for (const c of cands) { try { if (fs.statSync(path.resolve(base, c)).isFile()) { resolved = path.resolve(base, c); break; } } catch {} }
    if (!resolved) continue;
    if (def) imports.push({ local: def, source: resolved, kind: "default" });
    if (ns) imports.push({ local: ns, source: resolved, kind: "ns" });
    if (named) named.split(",").forEach((part) => { const seg = part.trim(); if (!seg) return; const [orig, alias] = seg.split(/\s+as\s+/); imports.push({ local: (alias || orig).trim(), source: resolved, kind: "named" }); });
  }
  return imports;
}

const modCache = new Map();
async function loadModule(abs) {
  if (modCache.has(abs)) return modCache.get(abs);
  try { const ns = await import(pathToFileURL(abs).href); modCache.set(abs, { ns, ok: true }); }
  catch (e) { modCache.set(abs, { ns: null, ok: false, err: e.message }); }
  return modCache.get(abs);
}
function valueOf(mod, imp) {
  const ns = mod.ns;
  if (imp.kind === "ns") return ns;
  if (imp.kind === "default") return ns.default;
  return ns[imp.local];
}

const findings = [];
const unchecked = new Set();
const builtins = new Set(["then","catch","finally","toString","valueOf","toFixed","replace","split","join","map","filter","forEach","slice","push","pop","shift","unshift","includes","indexOf","find","findIndex","some","every","reduce","sort","concat","trim","toLowerCase","toUpperCase","charAt","charCodeAt","substring","substr","padStart","padEnd","has","get","set","add","delete","clear","keys","values","entries","next","call","apply","bind","test","match","repeat","startsWith","endsWith","from","of","isPrototypeOf","constructor","length","sub","assign"]);
for (const f of modified) {
  const abs = path.join(root, f);
  const imports = parseImports(abs);
  if (!imports.length) continue;
  for (const imp of imports) {
    const mod = await loadModule(imp.source);
    if (!mod.ok) { unchecked.add(path.relative(root, imp.source)); continue; }
    const val = valueOf(mod, imp);
    if (val == null) continue;
    const t = fs.readFileSync(abs, "utf8");
    const re = new RegExp("(?<![.\\w$])" + imp.local + "\\s*\\.\\s*([A-Za-z0-9_$]+)\\s*\\(", "g");
    let m;
    while ((m = re.exec(t))) {
      const method = m[1];
      if (builtins.has(method)) continue;
      let exists = false;
      try { exists = method in val || (val && typeof val === "object" && Object.prototype.hasOwnProperty.call(val, method)) || (typeof val === "function" && method in val); } catch {}
      if (!exists) findings.push({ file: f, binding: imp.local, source: path.relative(root, imp.source), method });
    }
  }
}

console.log("modified js files scanned:", modified.length);
console.log("modules unable to import (unchecked):", [...unchecked]);
console.log("suspect removed/renamed method calls:", findings.length);
const seen = new Set();
for (const x of findings) {
  const key = `${x.source}::${x.binding}.${x.method}`;
  if (seen.has(key)) continue; seen.add(key);
  console.log(`  ⚠️  ${x.file}  ->  ${x.binding}.${x.method}()   [来源 ${x.source} 运行时无此成员]`);
}
if (findings.length === 0) console.log("✅ 未检测到「调用运行时不存在的方法」回归");
