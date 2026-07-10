import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router'
import { clearSession, getStoredSession } from '@/lib/session'
import { clearApiCaches, resumeSession } from '@/lib/api'
import { useOnlineStatus } from '@/lib/online-status'
import { Button } from '@/components/ui/button'
import {
  sessionResumeRetryMessage,
  shouldClearSessionAfterResume,
} from '@/lib/session-resume-error'

type GateState = 'checking' | 'ready' | 'blocked' | 'temporary-error'

export function SessionGate() {
  const { hasHydrated, isOnline } = useOnlineStatus()
  const [state, setState] = useState<GateState>(() =>
    getStoredSession() === null ? 'blocked' : 'checking',
  )

  useEffect(() => {
    if (state !== 'checking' || !hasHydrated) {
      return
    }

    if (!isOnline) {
      return
    }

    let active = true

    resumeSession()
      .then(() => {
        if (active) {
          setState('ready')
        }
      })
      .catch((error: unknown) => {
        if (!active) {
          return
        }

        if (shouldClearSessionAfterResume(error)) {
          clearApiCaches()
          clearSession()
          setState('blocked')
          return
        }

        setState('temporary-error')
      })

    return () => {
      active = false
    }
  }, [hasHydrated, isOnline, state])

  if (state === 'checking') {
    if (hasHydrated && !isOnline) {
      return <Outlet />
    }

    return (
      <main className="grid min-h-dvh place-items-center bg-background px-5 text-foreground">
        <div className="rounded-[2rem] border bg-card p-6 text-center shadow-[0_18px_45px_rgb(103_74_58_/_0.14)]">
          <p className="text-sm font-extrabold text-muted-foreground">
            Lagi cek ruang kalian...
          </p>
        </div>
      </main>
    )
  }

  if (state === 'blocked') {
    return (
      <Navigate
        replace
        state={{
          message:
            'Session di device ini sudah tidak valid. Pairing tidak diulang supaya tanggal jadian tetap aman.',
        }}
        to="/pairing"
      />
    )
  }

  if (state === 'temporary-error') {
    if (hasHydrated && !isOnline) {
      return <Outlet />
    }

    return (
      <main className="grid min-h-dvh place-items-center bg-background px-5 text-foreground">
        <div
          className="max-w-sm rounded-[2rem] border bg-card p-6 text-center shadow-[0_18px_45px_rgb(103_74_58_/_0.14)]"
          role="alert"
        >
          <p className="text-sm font-extrabold leading-relaxed text-muted-foreground">
            {sessionResumeRetryMessage}
          </p>
          <Button
            className="mt-4 w-full"
            disabled={!isOnline}
            onClick={() => setState('checking')}
          >
            Coba lagi
          </Button>
        </div>
      </main>
    )
  }

  return <Outlet />
}
