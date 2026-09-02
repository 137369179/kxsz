import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StorageManager } from '../../src/utils/storageManager.js'

// Mock localStorage
const mockStorage = {}
const mockLocalStorage = {
  getItem: vi.fn(key => mockStorage[key] || null),
  setItem: vi.fn((key, val) => { mockStorage[key] = val }),
  removeItem: vi.fn(key => { delete mockStorage[key] }),
}
Object.defineProperty(global, 'localStorage', { value: mockLocalStorage, writable: true })

describe('StorageManager', () => {
  let sm

  beforeEach(() => {
    Object.keys(mockStorage).forEach(k => delete mockStorage[k])
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
    sm = new StorageManager()
  })

  it('should save and retrieve JSON data', () => {
    sm.putJSON('test_key', { coins: 100, stars: 5 })
    const result = sm.getJSON('test_key')
    expect(result).toEqual({ coins: 100, stars: 5 })
  })

  it('should return fallback for missing key', () => {
    const result = sm.getJSON('missing_key', { default: true })
    expect(result).toEqual({ default: true })
  })

  it('should handle invalid JSON gracefully', () => {
    mockStorage['bad'] = '{invalid json'
    const result = sm.getJSON('bad', null)
    expect(result).toBeNull()
  })

  it('should remove items', () => {
    sm.putJSON('del_key', { x: 1 })
    sm.removeItem('del_key')
    expect(sm.getItem('del_key')).toBeNull()
  })

  it('should clear all cathy keys', () => {
    sm.putJSON('CATHY_LITERACY_USER_PROGRESS_V1', { coins: 50 })
    sm.putJSON('cathy_audio_v1', { master: 0.5 })
    sm.clearAllCathyKeys()
    expect(sm.getItem('CATHY_LITERACY_USER_PROGRESS_V1')).toBeNull()
    expect(sm.getItem('cathy_audio_v1')).toBeNull()
  })

  it('should be safe when localStorage is unavailable', () => {
    const noStorage = new StorageManager()
    noStorage._lsSupported = false
    expect(noStorage.getItem('any')).toBeNull()
    expect(noStorage.putJSON('any', { a: 1 })).toBe(false)
  })

  it('should manage multi-child profiles correctly', () => {
    expect(sm.getActiveProfileId()).toBe('child_1')
    sm.setActiveProfileId('child_2')
    expect(sm.getActiveProfileId()).toBe('child_2')

    const profiles = sm.listProfiles()
    expect(profiles.length).toBeGreaterThanOrEqual(2)
  })

  it('should export and import progress JSON correctly', () => {
    sm.putJSON('CATHY_LITERACY_USER_PROGRESS_V1', { coins: 88, stars: 20 })
    const exported = sm.exportProgressJSON()
    expect(exported).toContain('88')
    expect(exported).toContain('version')

    // Reset storage and import
    Object.keys(mockStorage).forEach(k => delete mockStorage[k])
    const success = sm.importProgressJSON(exported)
    expect(success).toBe(true)
    const importedProgress = sm.getJSON('CATHY_LITERACY_USER_PROGRESS_V1')
    expect(importedProgress.coins).toBe(88)
  })
})
