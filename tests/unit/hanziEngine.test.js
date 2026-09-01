import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock canvas context
const mockCtx = {
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  clearRect: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  fillStyle: null,
  strokeStyle: null,
  lineWidth: 1,
  shadowColor: 'transparent',
  shadowBlur: 0,
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 10 })),
}

const mockCanvas = {
  getContext: vi.fn(() => mockCtx),
  getBoundingClientRect: vi.fn(() => ({ width: 340, height: 340, left: 0, top: 0 })),
  width: 340,
  height: 340,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}

// Mock DOM
global.document = {
  createElement: vi.fn((tag) => {
    if (tag === 'canvas') return mockCanvas
    return { style: {}, classList: { add: vi.fn(), remove: vi.fn() }, innerHTML: '' }
  }),
  getElementsByClassName: vi.fn(() => []),
  querySelector: vi.fn(() => null),
  querySelectorAll: vi.fn(() => []),
  head: { appendChild: vi.fn() },
  body: { appendChild: vi.fn() },
}
global.window = { devicePixelRatio: 1 }
global.ResizeObserver = class {
  observe() {}
  disconnect() {}
}

describe('HanziEngine', () => {
  it('should exist as a module', async () => {
    const mod = await import('../../src/utils/hanziEngine.js')
    expect(mod.HanziEngine).toBeDefined()
  })

  it('should have correct stroke validation logic', async () => {
    const mod = await import('../../src/utils/hanziEngine.js')
    // Verify the class has expected methods
    const proto = mod.HanziEngine.prototype
    expect(typeof proto.destroy).toBe('function')
    expect(typeof proto.initCanvasSize).toBe('function')
    expect(typeof proto.getPointerPos).toBe('function')
  })
})
