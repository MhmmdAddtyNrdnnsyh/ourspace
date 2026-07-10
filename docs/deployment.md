# Deployment

Final deployment target: Vercel for the Vite app, Google Apps Script for the API, Spreadsheet and Drive for private data.

## Required Env

Frontend env:

```env
VITE_API_URL="/api/apps-script"
```

Vercel server env:

```env
APPS_SCRIPT_URL="https://script.google.com/macros/s/xxx/exec"
```

Only `VITE_API_URL` is public. Keep the real Apps Script URL in Vercel server env only.
Local development may use an ignored `.env`, but real Apps Script deployment
URLs must never be committed. Track only `.env.example` with placeholders.

## Apps Script Before Vercel

1. Push/copy every file from `apps-script/`.
2. Deploy a new Web App version.
3. Use the `/exec` URL for `APPS_SCRIPT_URL`.

After the latest production deployment is verified:

1. Open Apps Script → Deploy → Manage deployments.
2. Keep only the latest production deployment active.
3. Disable or archive every superseded deployment.
4. Put the latest `/exec` URL in the ignored local `.env` and in Vercel
   Environment Variables. Never paste it into tracked files.

Then finish backend setup:

1. Confirm Script Properties:
   - `SHEET_ID`
   - `SESSION_SECRET`
   - `PAIRING_WINDOW_SECONDS`
   - `DRIVE_ROOT_FOLDER_ID`
2. Run `setupSchema()` after schema changes.
3. Run `authorizeOurSpace()` if Drive permissions changed.
4. Run `installBackupTrigger()` if automatic backup should run daily.

## Vercel

Project settings:

- Framework: Vite
- Build command: `bun run build`
- Output directory: `dist`
- Server env: `APPS_SCRIPT_URL`
- Frontend env: `VITE_API_URL="/api/apps-script"`

The repo includes `vercel.json` for build/output and SPA route rewrites. `/api/apps-script` stays a Vercel Function and should not be called directly from browser code except through the same-origin path.

## Production Smoke Test

1. Open the production URL on a mobile browser.
2. Pair two browser/device sessions.
3. Confirm Home loads greeting and `daysTogether`.
4. Create/edit/delete a Sticky Note.
5. Create/edit/delete a Date Plan.
6. Switch Dates between List and Kalender.
7. Upload a small Gallery photo.
8. Edit/delete the Gallery item.
9. Create/edit/delete a Shared List item.
10. Settings: `Cek koneksi`.
11. Settings: `Cek session`.
12. Settings: `Cek Gallery`.
13. Settings: `Cek Backup`.
14. Settings: `Backup sekarang`.
15. Verify backup JSON appears in Drive `backups/`.
16. In browser Network, verify requests go to `/api/apps-script`, not `script.google.com`.

## Safety

- Do not commit `.env` with real URLs or tokens.
- Do not print session tokens.
- Do not add auth bypasses.
- Do not expose Drive public URLs.
