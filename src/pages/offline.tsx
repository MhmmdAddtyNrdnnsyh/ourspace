import { useState } from 'react'
import { ArrowLeft, CloudOff, RotateCcw } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { ScrapbookCard } from '@/components/scrapbook'
import { useOnlineStatus } from '@/lib/online-status'

export function OfflinePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isOnline } = useOnlineStatus()
  const [message, setMessage] = useState('')
  const previousPath =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/'

  function handleRetry() {
    if (!isOnline) {
      setMessage('Koneksinya masih belum ada. Coba lagi sebentar ya.')
      return
    }

    navigate(previousPath, { replace: true })
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <main className="app-canvas grid min-h-dvh place-items-center bg-background px-4 py-8 text-foreground">
      <ScrapbookCard className="w-full max-w-[420px]" tone="yellow" tape>
        <div className="grid size-14 place-items-center rounded-2xl bg-card/75">
          <CloudOff aria-hidden="true" size={28} />
        </div>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.04em] text-muted-foreground">
          OurSpace
        </p>
        <h1 className="mt-2 text-4xl font-black leading-tight">
          Kamu sedang offline
        </h1>
        <p className="mt-3 text-base font-bold leading-relaxed text-muted-foreground">
          Coba cek koneksi dulu ya. Kalau data terakhir masih ada, kamu bisa
          balik dan lihat halaman yang sudah pernah dibuka.
        </p>
        {message ? (
          <p aria-live="polite" className="mt-4 rounded-2xl bg-scrap-pink px-4 py-3 text-sm font-extrabold">
            {message}
          </p>
        ) : null}
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button onClick={handleRetry}>
            <RotateCcw aria-hidden="true" size={18} />
            Coba lagi
          </Button>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft aria-hidden="true" size={18} />
            Kembali
          </Button>
        </div>
      </ScrapbookCard>
    </main>
  )
}
