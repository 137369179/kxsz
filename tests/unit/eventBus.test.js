import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EVENTS, eventBus } from '../../src/utils/eventBus.js'

describe('EventBus', () => {
  beforeEach(() => {
    eventBus.clear()
  })

  it('should emit and receive events', () => {
    const handler = vi.fn()
    eventBus.on(EVENTS.SWITCH_MODE, handler)
    eventBus.emit(EVENTS.SWITCH_MODE, { mode: 'map' })
    expect(handler).toHaveBeenCalledWith({ mode: 'map' })
  })

  it('should support once (single fire)', () => {
    const handler = vi.fn()
    eventBus.once(EVENTS.PROGRESS_CHANGED, handler)
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { a: 1 })
    eventBus.emit(EVENTS.PROGRESS_CHANGED, { a: 2 })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should allow off (unregister)', () => {
    const handler = vi.fn()
    eventBus.on(EVENTS.STARS_CHANGED, handler)
    eventBus.off(EVENTS.STARS_CHANGED, handler)
    eventBus.emit(EVENTS.STARS_CHANGED, { count: 5 })
    expect(handler).not.toHaveBeenCalled()
  })

  it('should return cleanup function from on()', () => {
    const handler = vi.fn()
    const off = eventBus.on(EVENTS.SOUND_TOGGLE_MUTE, handler)
    off()
    eventBus.emit(EVENTS.SOUND_TOGGLE_MUTE, { muted: true })
    expect(handler).not.toHaveBeenCalled()
  })

  it('should handle handler errors gracefully', () => {
    eventBus.on(EVENTS.LEARN_FINISH, () => { throw new Error('test') })
    expect(() => eventBus.emit(EVENTS.LEARN_FINISH)).not.toThrow()
  })

  it('should have all expected event keys', () => {
    expect(EVENTS.SWITCH_MODE).toBe('app:switch-mode')
    expect(EVENTS.MODE_ERROR).toBe('app:error')
    expect(EVENTS.AUDIO_HEALTH).toBe('audio:health')
    expect(EVENTS.AUDIO_EVAL_RESULT).toBe('audio:eval-result')
    expect(EVENTS.AUDIO_EVAL_ERROR).toBe('audio:eval-error')
  })
})
