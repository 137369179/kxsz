import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { eyeCareManager } from '../../src/utils/eyeCareManager.js'

describe('EyeCareManager Unit Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    eyeCareManager.stop()
    eyeCareManager.reset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    eyeCareManager.stop()
  })

  it('should initialize with default states', () => {
    expect(eyeCareManager.activeSeconds).toBe(0)
    expect(eyeCareManager.isRestModalOpen).toBe(false)
  })

  it('should start and stop timer', () => {
    eyeCareManager.start()
    expect(eyeCareManager.timerInterval).not.toBeNull()

    eyeCareManager.stop()
    expect(eyeCareManager.timerInterval).toBeNull()
  })

  it('should reset active seconds', () => {
    eyeCareManager.activeSeconds = 120
    eyeCareManager.reset()
    expect(eyeCareManager.activeSeconds).toBe(0)
  })
})
