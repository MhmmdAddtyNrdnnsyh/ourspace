import { describe, expect, test } from 'bun:test'

const sessionErrors = await import('../src/lib/session-resume-error').catch(
  () => ({ shouldClearSessionAfterResume: undefined }),
)

describe('shouldClearSessionAfterResume', () => {
  test('is available', () => {
    expect(typeof sessionErrors.shouldClearSessionAfterResume).toBe('function')
  })

  test.each(['SESSION_INVALID', 'UNAUTHORIZED', 'MEMBER_NOT_FOUND'])(
    'clears session for %s',
    (code) => {
      expect(sessionErrors.shouldClearSessionAfterResume?.({ code })).toBe(true)
    },
  )

  test.each([
    'NETWORK_OFFLINE',
    'INTERNAL_ERROR',
    'BAD_GATEWAY',
    'TIMEOUT',
  ])('keeps session for %s', (code) => {
    expect(sessionErrors.shouldClearSessionAfterResume?.({ code })).toBe(false)
  })

  test('keeps session for generic proxy errors', () => {
    expect(
      sessionErrors.shouldClearSessionAfterResume?.(new Error('HTTP 502')),
    ).toBe(false)
  })
})
