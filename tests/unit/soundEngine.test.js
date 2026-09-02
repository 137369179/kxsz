import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Web Audio API
const mockAudioContext = {
  createGain: vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn(), gain: { setValueAtTime: vi.fn() } })),
  createDynamicsCompressor: vi.fn(() => ({ connect: vi.fn(), threshold: { value: -24 }, knee: { value: 30 }, ratio: { value: 4 }, attack: { value: 0.003 }, release: { value: 0.25 } })),
  createOscillator: vi.fn(() => ({ connect: vi.fn(), start: vi.fn(), stop: vi.fn() })),
  destination: { volume: 1 },
  suspend: vi.fn(),
  resume: vi.fn(),
  state: 'running',
  currentTime: 0,
}

global.AudioContext = vi.fn(() => mockAudioContext)
global.webkitAudioContext = vi.fn(() => mockAudioContext)
global.speechSynthesis = {
  speak: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn(() => [{ name: 'Test Voice', lang: 'zh-CN' }]),
}

describe('SoundEngine Core', () => {
  it('should export soundAndFX', async () => {
    const mod = await import('../../src/utils/soundEngine.js')
    expect(mod.soundAndFX).toBeDefined()
    expect(mod.soundEngine).toBe(mod.soundAndFX)
  })

  it('should have audioCtx null before init', async () => {
    const mod = await import('../../src/utils/soundEngine.js')
    expect(mod.soundAndFX.audioCtx).toBeNull()
  })

  it('should have defined volume methods', async () => {
    const mod = await import('../../src/utils/soundEngine.js')
    expect(typeof mod.soundAndFX.setMasterVolume).toBe('function')
    expect(typeof mod.soundAndFX.setBGMVolume).toBe('function')
    expect(typeof mod.soundAndFX.setSFXVolume).toBe('function')
    expect(typeof mod.soundAndFX.setVoiceVolume).toBe('function')
  })

  it('should clamp volume to 0-1 range', async () => {
    const mod = await import('../../src/utils/soundEngine.js')
    mod.soundAndFX.setMasterVolume(1.5)
    expect(mod.soundAndFX.masterVolume).toBe(1)
    mod.soundAndFX.setMasterVolume(-0.5)
    expect(mod.soundAndFX.masterVolume).toBe(0)
  })

  it('should have speech queue depth tracking', async () => {
    const mod = await import('../../src/utils/soundEngine.js')
    expect(typeof mod.soundAndFX.speechQueue).toBeDefined()
    expect(typeof mod.soundAndFX.speechQueue.depth).toBe('number')
  })

  it('should have custom exclusive game sound methods defined', async () => {
    const mod = await import('../../src/utils/soundEngine.js')
    expect(typeof mod.soundAndFX.playCrownFanfare).toBe('function')
    expect(typeof mod.soundAndFX.playBossImpact).toBe('function')
    expect(typeof mod.soundAndFX.playBossRoar).toBe('function')
    expect(typeof mod.soundAndFX.playStarPopCombo).toBe('function')
    expect(typeof mod.soundAndFX.playParentCheer).toBe('function')
    expect(typeof mod.soundAndFX.playFamilyRecordChime).toBe('function')
  })
})
