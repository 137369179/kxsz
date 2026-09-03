/**
 * tests/unit/prewriteEngine.test.js
 * PrewriteEngine - Letter School Step3 unit tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

class MockCanvas {
  constructor() { this.width=360; this.height=360; this._l={}; this.style={}; }
  getContext() {
    return { clearRect:vi.fn(),fillRect:vi.fn(),strokeRect:vi.fn(),
      beginPath:vi.fn(),moveTo:vi.fn(),lineTo:vi.fn(),arc:vi.fn(),
      closePath:vi.fn(),fill:vi.fn(),stroke:vi.fn(),fillText:vi.fn(),
      save:vi.fn(),restore:vi.fn(),scale:vi.fn(),setLineDash:vi.fn(),
      roundRect:vi.fn(),shadowBlur:0,shadowColor:"",fillStyle:"",
      strokeStyle:"",lineWidth:1,lineCap:"",lineJoin:"",font:"",textAlign:"" }; }
  getBoundingClientRect(){return{left:0,top:0,width:360,height:360};}
  addEventListener(e,f){this._l[e]=f;} removeEventListener(){}
}
globalThis.ResizeObserver=class{observe(){}disconnect(){}};
globalThis.requestAnimationFrame=vi.fn(()=>99);
globalThis.cancelAnimationFrame=vi.fn();
if(!globalThis.window)globalThis.window={};
globalThis.window.devicePixelRatio=1;
globalThis.window.addEventListener=vi.fn();
globalThis.window.removeEventListener=vi.fn();
vi.mock("../../src/utils/soundEngine.js",()=>({
  soundAndFX:{speakPriority:vi.fn(),playSuccessSound:vi.fn(),playSoftError:vi.fn()},
}));
vi.mock("../../src/utils/ebbinghaus.js",()=>({
  ebbinghausManager:{getAge:vi.fn(()=>5)},
}));
import{PrewriteEngine}from"../../src/utils/prewriteEngine.js";
import{soundAndFX}from"../../src/utils/soundEngine.js";
function makeEngine(){
  const canvas=new MockCanvas();
  return new PrewriteEngine(canvas,{onComplete:vi.fn(),onAllComplete:vi.fn(),enableGripGuide:false});
}
describe("PrewriteEngine - Letter School Step3",()=>{
  beforeEach(()=>{vi.clearAllMocks();});
  it("animateStrokeGesture plays voice cue",()=>{
    const e=makeEngine();e.animateStrokeGesture();
    expect(soundAndFX.speakPriority).toHaveBeenCalled();
    const arg=soundAndFX.speakPriority.mock.calls[0][0];
    expect(typeof arg).toBe("string");expect(arg.length).toBeGreaterThan(5);
  });
  it("animateStrokeGesture returns undefined (not async)",()=>{
    expect(makeEngine().animateStrokeGesture()).toBeUndefined();
  });
  it("voice cue has no Emoji",()=>{
    const e=makeEngine();e.animateStrokeGesture();
    const arg=soundAndFX.speakPriority.mock.calls[0]?.[0]||"";
    expect(/[🌀-🧿]|[☀-➿]/u.test(arg)).toBe(false);
  });
  it("getCurrentShapeName returns non-empty string",()=>{
    const n=makeEngine().getCurrentShapeName();
    expect(typeof n).toBe("string");expect(n.length).toBeGreaterThan(0);
  });
  it("getTotalShapes returns 1-3",()=>{
    const t=makeEngine().getTotalShapes();
    expect(t).toBeGreaterThanOrEqual(1);expect(t).toBeLessThanOrEqual(3);
  });
  it("_stopDemo sets demoPhase false",()=>{
    const e=makeEngine();e.demoPhase=true;e._stopDemo();
    expect(e.demoPhase).toBe(false);
  });
});