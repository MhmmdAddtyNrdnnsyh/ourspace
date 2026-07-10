import { CloudOff } from 'lucide-react'
import { ScrapbookCard } from '@/components/scrapbook'
import { offlineNoCacheMessage } from '@/lib/online-status'

export function OfflineNotice() {
  return (
    <div
      aria-live="polite"
      className="flex items-start gap-3 rounded-[1.35rem] border bg-scrap-yellow/90 px-4 py-3 shadow-[0_8px_22px_rgb(103_74_58_/_0.10)]"
      role="status"
    >
      <CloudOff aria-hidden="true" className="mt-0.5 shrink-0" size={20} />
      <div>
        <p className="text-sm font-black">Kamu sedang offline</p>
        <p className="mt-0.5 text-xs font-bold leading-relaxed text-muted-foreground">
          Data terakhir yang tersimpan mungkin masih bisa dilihat, tapi
          perubahan baru butuh internet.
        </p>
      </div>
    </div>
  )
}

export function OfflineEmptyState() {
  return (
    <ScrapbookCard tone="yellow" tape>
      <CloudOff aria-hidden="true" size={28} />
      <h2 className="mt-3 text-2xl font-black">Belum ada data offline.</h2>
      <p className="mt-2 text-sm font-bold leading-relaxed text-muted-foreground">
        {offlineNoCacheMessage}
      </p>
    </ScrapbookCard>
  )
}
