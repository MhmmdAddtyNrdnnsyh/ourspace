import { useSyncExternalStore } from 'react'

export const offlineMessage =
  'Kamu sedang offline. Coba cek koneksi internet dulu.'
export const offlineMutationMessage =
  'Butuh internet buat nyimpen perubahan ini.'
export const offlineNoCacheMessage =
  'Belum ada data tersimpan di device ini. Sambungkan internet dulu buat memuat OurSpace.'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)

  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

export function isBrowserOnline() {
  return typeof navigator === 'undefined' ? true : navigator.onLine
}

export function useOnlineStatus() {
  const isOnline = useSyncExternalStore(
    subscribe,
    isBrowserOnline,
    () => true,
  )
  return { hasHydrated: typeof window !== 'undefined', isOnline }
}
