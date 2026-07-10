# Production Checklist

Use this before using OurSpace daily.

## Environment

- `VITE_API_URL="/api/apps-script"`
- `APPS_SCRIPT_URL="https://script.google.com/macros/s/xxx/exec"`

`APPS_SCRIPT_URL` stays server-side only. Browser requests must show `POST /api/apps-script`.
Do not commit `.env` with the real Apps Script URL.
Use an ignored local `.env` for development and Vercel Environment Variables
for production. Only `.env.example` may be tracked, with placeholder values.

## Apps Script

1. Push every file from `apps-script/`.
2. Create a new Apps Script version.
3. Deploy the Web App with the new version.
4. Use the `/exec` URL for `APPS_SCRIPT_URL`.
5. Run `setupSchema()` after schema changes, including `shared_lists`.
6. Run `authorizeOurSpace()` once after Drive scope changes.
7. Open Deploy → Manage deployments, then disable/archive old deployments so
   only the latest production deployment remains active.

Required Script Properties:

- `SHEET_ID`
- `SESSION_SECRET`
- `PAIRING_WINDOW_SECONDS`
- `DRIVE_ROOT_FOLDER_ID`

## Drive And Backup

1. Confirm `DRIVE_ROOT_FOLDER_ID` points to the private OurSpace root folder.
2. Click `Cek Gallery` in Settings after pairing.
3. Click `Cek Backup` in Settings after pairing.
4. Run `installBackupTrigger()` from Apps Script editor.
5. Confirm a daily `runBackup` trigger exists.
6. Use `removeBackupTriggers()` if automatic backup needs to be disabled.

## Vercel Deploy

1. Confirm `vercel.json` uses `bun run build` and `dist`.
2. Set `VITE_API_URL` to `/api/apps-script`.
3. Set `APPS_SCRIPT_URL` to the latest Apps Script `/exec` URL.
4. Deploy frontend.
5. Open Settings and click `Cek koneksi`.
6. Confirm browser Network shows `POST /api/apps-script`, not `script.google.com`.

## Performance Smoke

1. Open Home, Notes, Dates, Gallery, Lists, and Settings once.
2. Navigate away and back to Notes/Dates/Gallery/Lists; cached content should
   appear immediately while fresh data loads in the background.
3. Create/edit/delete one item and confirm the visible list updates without a
   full page reload.
4. Confirm Gallery does not block Home or Settings loading.
5. Confirm duplicate simultaneous identical API calls are not visible during
   normal navigation.

## Offline Smoke

1. Saat online, buka Home, Notes, Dates, Gallery, dan Lists agar cache tersedia.
2. Matikan network dari browser DevTools atau device.
3. Pastikan halaman cached tetap tampil dengan `OfflineNotice`.
4. Buka halaman yang belum mempunyai cache dan pastikan pesan offline tampil,
   bukan skeleton tanpa akhir.
5. Pastikan create/edit/delete, upload, pairing, recovery, pemeriksaan Settings,
   dan `Backup sekarang` diblokir dengan alasan yang jelas.
6. Buka `/offline`, tekan `Coba lagi` saat masih offline, lalu pastikan pesan
   tetap ramah dan halaman tidak berpindah.
7. Nyalakan network, tekan `Coba lagi`, dan pastikan app kembali ke halaman
   sebelumnya atau Home.
8. Pastikan bottom navigation masih dapat membuka halaman cached saat offline.

## Manual Test

1. Open the production URL on mobile.
2. Pair two browsers/devices.
3. Confirm pairing is one-time only: after the couple exists, `/pairing`
   should show recovery, not the hold button.
4. Clear local storage on another browser and recover with nickname plus
   anniversary date.
5. Confirm a wrong recovery date fails with generic copy.
6. Confirm successful recovery enters Home and does not change anniversaryDate.
7. Submit five wrong recovery attempts for one nickname, then confirm the next
   attempt returns `RATE_LIMITED` with generic copy. Retry after 15 minutes or
   with a non-limited member and confirm valid recovery still works.
8. Confirm Home loads greeting and days together.
9. Create, edit, and delete a note from Notes.
10. Create, edit, and delete a date plan.
11. Switch Dates between List and Kalender.
12. Upload, edit, and soft-delete a gallery photo under 3 MB.
13. Create, edit, and soft-delete a shared list item.
14. Click Settings `Cek koneksi`.
15. Click Settings `Cek session`.
16. Click Settings `Cek Gallery`.
17. Click Settings `Cek Backup`.
18. Run `Backup sekarang` from Settings.
19. Open the latest backup JSON and confirm `includedSheets` and `itemCounts`.
20. Confirm no raw `sessionToken` appears in backup JSON.
21. Confirm the other member cannot edit/delete content they did not create.
22. Create or update text beginning with `=`, `+`, `-`, and `@`; confirm Sheets
    stores text rather than formulas and the UI shows the intended text.

Recovery currently replaces the `sessionToken` for that member identity. Full
multi-device approval can be added later if needed.
