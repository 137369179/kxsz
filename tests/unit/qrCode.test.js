import { describe, it, expect } from 'vitest'
import { drawQRCode } from '../../src/utils/qrCode.js'

describe('drawQRCode', () => {
  it('should render QR code modules onto canvas', () => {
    const filledRects = []
    const mockCanvas = {
      width: 240,
      height: 240,
      getContext: () => ({
        fillStyle: '',
        fillRect: (x, y, w, h) => {
          filledRects.push({ x, y, w, h })
        }
      })
    }

    drawQRCode(mockCanvas, 'CATHY_SYNC_V1:TEST', { size: 240, margin: 4 })
    expect(filledRects.length).toBeGreaterThan(50)
  })

  it('should handle empty canvas gracefully without throwing', () => {
    expect(() => drawQRCode(null, 'test')).not.toThrow()
  })
})
