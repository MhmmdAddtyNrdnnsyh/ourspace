import { describe, expect, test } from 'bun:test'

const uploadLimits = await import('../src/lib/upload-limits').catch(() => ({
  MAX_GALLERY_UPLOAD_BYTES: undefined,
  MAX_GALLERY_UPLOAD_MB: undefined,
}))

describe('Gallery upload limit', () => {
  test('is exactly 3 MiB', () => {
    expect(uploadLimits.MAX_GALLERY_UPLOAD_MB).toBe(3)
    expect(uploadLimits.MAX_GALLERY_UPLOAD_BYTES).toBe(3 * 1024 * 1024)
  })
})
