const invalidSessionCodes = new Set([
  'SESSION_INVALID',
  'UNAUTHORIZED',
  'MEMBER_NOT_FOUND',
])

export const sessionResumeRetryMessage =
  'Koneksi ke OurSpace lagi bermasalah. Session kamu belum dihapus, coba lagi sebentar.'

export function shouldClearSessionAfterResume(error: unknown) {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false
  }

  return (
    typeof error.code === 'string' && invalidSessionCodes.has(error.code)
  )
}
