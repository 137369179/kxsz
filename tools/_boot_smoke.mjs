// 应用启动冒烟：用最小浏览器垫片加载 app.js（其顶层 new CathyAppManager() 会触发
// 全量组件构造），捕获初始化期同步/异步错误。证明「应用能真正启动」而非仅语法正确。
import fs from "fs";
import path from "path";
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
      if (p === "width") return 300; if (p === "height") return 150;
      if (p === "style") return makeStub();
      if (p === "classList") return { add: noop, remove: noop, toggle: noop, contains: () => false };
      if (p === "dataset") return makeStub();
      if (p === "getContext") return () => makeStub();
      if (p === "getBoundingClientRect") return () => ({ left: 0, top: 0, width: 300, height: 150, right: 300, bottom: 150 });
      if (p === "textContent" || p === "innerHTML") return "";
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
  createMediaStreamDestination() { return makeStub(); }
  resume() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
}
function setGlobal(name, val) {
  try { Object.defineProperty(globalThis, name, { value: val, configurable: true, writable: true }); }
  catch { try { globalThis[name] = val; } catch {} }
}
setGlobal("window", globalThis);
setGlobal("document", {
  getElementById: () => makeStub(), createElement: () => makeStub(), createElementNS: () => makeStub(),
  querySelector: () => makeStub(), querySelectorAll: () => [], addEventListener: noop, removeEventListener: noop,
  body: makeStub(), head: makeStub(), documentElement: makeStub(), readyState: "complete",
});
setGlobal("navigator", { userAgent: "node", language: "zh-CN", mediaDevices: { getUserMedia: () => Promise.resolve(makeStub()) } });
setGlobal("location", { href: "http://localhost/", search: "", searchParams: new URLSearchParams() });
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
setGlobal("addEventListener", noop);
setGlobal("removeEventListener", noop);

let asyncError = null;
process.on("unhandledRejection", (e) => { asyncError = e; });

const appPath = path.join(root, "src/app.js");
try {
  await import(pathToFileURL(appPath).href);
  // 给异步初始化一点时间
  await new Promise((r) => setTimeout(r, 300));
  if (asyncError) {
    console.log("❌ 启动期间发生未处理异步拒绝：");
    console.log("   ", asyncError && (asyncError.stack || asyncError.message || String(asyncError)));
    process.exit(2);
  }
  console.log("✅ 应用启动冒烟通过：app.js 成功加载并构造 CathyAppManager（全量组件初始化未抛错）");
  process.exit(0);
} catch (e) {
  console.log("❌ 应用启动失败（同步错误）：");
  console.log("   ", e && (e.stack || e.message || String(e)));
  process.exit(1);
}
