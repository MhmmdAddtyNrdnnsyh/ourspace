import { describe, expect, test } from 'bun:test'
import { runInNewContext } from 'node:vm'

type AppsScriptContext = {
  getRecoveryRateLimitState?: (
    failures: readonly number[],
    nowMs: number,
  ) => { readonly activeFailures: readonly number[]; readonly isLimited: boolean }
  sanitizeSheetCellValue?: (value: unknown) => unknown
  normalizeGalleryFileSize?: (value: unknown) => number
  newAppError?: (code: string, message: string) => Error
}

async function loadAppsScript(
  path: string,
  context: AppsScriptContext = {},
) {
  runInNewContext(await Bun.file(path).text(), context)
  return context
}

const spreadsheet = await loadAppsScript('apps-script/05_spreadsheet.gs')
const session = await loadAppsScript('apps-script/06_session.gs')
const actions = await loadAppsScript('apps-script/07_actions.gs', {
  newAppError(_code, message) {
    return new Error(message)
  },
})

describe('sanitizeSheetCellValue', () => {
  test('is available', () => {
    expect(typeof spreadsheet.sanitizeSheetCellValue).toBe('function')
  })

  test.each(['=1+1', '+SUM(A1:A2)', '-1+2', '@IMPORTXML("x")'])(
    'escapes formula-like text %s',
    (value) => {
      expect(spreadsheet.sanitizeSheetCellValue?.(value)).toBe("'" + value)
    },
  )

  test('does not double escape an apostrophe', () => {
    expect(spreadsheet.sanitizeSheetCellValue?.("'=1+1")).toBe("'=1+1")
  })

  test('preserves ordinary strings and non-strings', () => {
    expect(spreadsheet.sanitizeSheetCellValue?.('hello')).toBe('hello')
    expect(spreadsheet.sanitizeSheetCellValue?.(42)).toBe(42)
  })
})

describe('getRecoveryRateLimitState', () => {
  const now = Date.UTC(2026, 6, 10, 10, 0, 0)

  test('is available', () => {
    expect(typeof session.getRecoveryRateLimitState).toBe('function')
  })

  test('limits five recent failures', () => {
    const failures = [1, 2, 3, 4, 5].map(
      (minutesAgo) => now - minutesAgo * 60_000,
    )
    const state = session.getRecoveryRateLimitState?.(failures, now)

    expect(state?.isLimited).toBe(true)
    expect(state?.activeFailures).toHaveLength(5)
  })

  test('drops failures at or before the 15 minute boundary', () => {
    const failures = [16, 15, 14, 13, 12].map(
      (minutesAgo) => now - minutesAgo * 60_000,
    )
    const state = session.getRecoveryRateLimitState?.(failures, now)

    expect(state?.isLimited).toBe(false)
    expect(state?.activeFailures).toEqual([
      now - 14 * 60_000,
      now - 13 * 60_000,
      now - 12 * 60_000,
    ])
  })
})

describe('normalizeGalleryFileSize', () => {
  test('accepts 3 MiB exactly', () => {
    expect(actions.normalizeGalleryFileSize?.(3 * 1024 * 1024)).toBe(
      3 * 1024 * 1024,
    )
  })

  test('rejects values over 3 MiB with friendly copy', () => {
    expect(() => actions.normalizeGalleryFileSize?.(3 * 1024 * 1024 + 1)).toThrow(
      'Foto maksimal 3 MB dulu ya, biar upload-nya aman.',
    )
  })
})
