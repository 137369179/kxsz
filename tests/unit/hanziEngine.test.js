import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock DOM minimally
global.window = { devicePixelRatio: 1 }
global.document = {
  createElement: vi.fn(() => ({ style: {}, classList: { add: vi.fn(), remove: vi.fn() }, innerHTML: '' })),
  getElementsByClassName: vi.fn(() => []),
  querySelector: vi.fn(() => null),
  querySelectorAll: vi.fn(() => []),
  head: { appendChild: vi.fn() },
  body: { appendChild: vi.fn() },
}
global.ResizeObserver = class { observe() {} disconnect() {} }

describe('HanziEngine Module', () => {
  it('should export HanziEngine class', async () => {
    const mod = await import('../../src/utils/hanziEngine.js')
    expect(mod.HanziEngine).toBeDefined()
    expect(typeof mod.HanziEngine).toBe('function')
  })

  it('should have expected prototype methods', async () => {
    const mod = await import('../../src/utils/hanziEngine.js')
    const proto = mod.HanziEngine.prototype
    const methods = ['destroy', 'initCanvasSize', 'bindEvents', 'getPointerPos', 'onPointerDown', 'onPointerMove', 'onPointerUp', 'triggerError', 'demoAllStrokes', 'stopDemo']
    for (const method of methods) {
      expect(typeof proto[method]).toBe('function', `HanziEngine should have ${method} method`)
    }
  })

  it('should export default hanziEngine instance pattern', async () => {
    const mod = await import('../../src/utils/hanziEngine.js')
    // Verify the module exports are correct
    expect('HanziEngine' in mod).toBe(true)
  })
})
