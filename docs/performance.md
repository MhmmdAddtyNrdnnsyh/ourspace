# Performance Notes

OurSpace runs on a Vite frontend plus Google Apps Script, so the main goal is
to avoid repeated calls and make slow network moments feel intentional.

## Optimized Paths

- `session.resume` is cached in memory for a short TTL. Manual Settings checks
  still force a fresh session validation.
- Identical in-flight safe read requests are deduped in `src/lib/api.ts`.
- Home, Notes, Date Plans, and Shared Lists keep small last-known JSON payloads
  in `sessionStorage` and refresh in the background.
- Gallery keeps its list cache in memory only because `thumbnailData` can contain
  base64 previews. It should not be persisted to browser storage.
- Create/update/delete flows update the local list after backend success instead
  of refetching the full list.
- Home summary requests only one Gallery item so photo thumbnails do not slow
  the first Home render.
- `home.get` now includes the Home summary, so a current backend deployment
  opens Home with one API request. The frontend keeps a compatibility fallback
  for older Apps Script deployments.
- Gallery, Dates, Lists, Notes, and Settings are lazy-loaded route chunks.
- Loading states use compact scrapbook skeleton cards instead of blank screens or
  large spinner-only panels.

## Cache TTLs

- `home.get`: 45 seconds, `sessionStorage`.
- `notes.list`: 60 seconds, `sessionStorage`.
- `datePlans.list`: 60 seconds, `sessionStorage`.
- `sharedLists.list`: 60 seconds, `sessionStorage`.
- `gallery.list`: 60 seconds, memory only.

If cached data exists, the page shows it first with a small "Lagi nyegerin
data..." state while the background request refreshes. If refresh fails, the
cached UI stays visible with a soft warning. If no cache exists, the page uses
the layout-matched skeleton and then the normal error state if the request fails.

Saat browser offline, cache terakhir tetap dapat dibaca walaupun TTL-nya sudah
lewat. Tidak ada background refresh sampai event `online` diterima. Detail dan
batasannya ada di [Offline State UX](./offline.md).

## In-flight Dedupe

Only safe reads are deduped:

- `health.check`
- `session.resume`
- `couple.status`
- `home.get`
- `notes.list`
- `datePlans.list`
- `gallery.list`
- `sharedLists.list`
- `gallery.health`
- `backup.health`
- `backups.list`

Mutations and state-changing actions are intentionally not deduped:

- create/update/delete actions
- `pairing.start`
- `pairing.signal`
- `session.recover`
- `backup.runNow`
- `couple.reset`

Manual Settings "Cek session" calls `session.resume` with a forced fresh
validation, bypassing the short in-memory session cache.

## Debugging API Calls

Development builds log lightweight API traces from `src/lib/api.ts` with:

- action
- timestamp
- cache hit/miss
- in-flight dedupe reuse
- duration
- success/error code

The trace never logs `sessionToken`, raw request body, or secrets. Production
builds skip these logs.

## Apps Script Notes

- `health.check` returns before Spreadsheet/Drive access.
- `setupSchema()` is manual only and must not run during normal `doPost`.
- `getSpreadsheet()` reuses the Spreadsheet object within the runtime context to
  reduce repeated `SpreadsheetApp.openById` overhead.
- Each web request keeps an in-memory row/header/sheet context, so repeated reads
  of the same sheet inside one action do not call Spreadsheet again.
- `CacheService.getScriptCache()` stores headers and small raw row snapshots.
  Current row TTLs are 30 seconds for Notes, Dates, Gallery, Lists, and Backups.
  Couple settings use request-local caching only so anniversary reads never use
  a shared stale snapshot.
- Cache values above 80 KB are skipped automatically. This commonly affects a
  Gallery with several thumbnails; the request still falls back to Spreadsheet.
- All app writes invalidate the matching shared cache after Spreadsheet succeeds
  and update the request-local snapshot.
- Pairing rechecks member/settings data from Spreadsheet inside its script lock,
  and backup clears row snapshots before exporting, so these sensitive paths do
  not trust stale cache data.
- `gallery.list` reads Spreadsheet metadata only. It does not fetch Drive blobs.

## Known Limits

- Apps Script and Spreadsheet reads can still be slow on cold starts.
- Gallery list payload can grow if many small photos store base64 thumbnails.
  Large photos intentionally use placeholders instead of heavy thumbnail data.
- Backup can be heavy by design and should stay manual/triggered, not part of
  normal page loading.
- Apps Script Cache Service is best-effort. A cache miss is always safe because
  Spreadsheet remains the source of truth.

## Manual Checks

1. Open protected pages twice; the second visit should reuse cached list data.
2. Navigate between Notes, Dates, Gallery, Lists, and Settings; the app shell
   should stay visible while lazy chunks load.
3. Create/edit/delete an item and confirm the list updates without a full reload.
4. Confirm Network does not show duplicate simultaneous identical API requests.
5. Confirm browser requests still go through `/api/apps-script`.
6. Open Apps Script execution logs and confirm repeated reads can show
   `spreadsheet:getSheetObjects:cache-hit`.
