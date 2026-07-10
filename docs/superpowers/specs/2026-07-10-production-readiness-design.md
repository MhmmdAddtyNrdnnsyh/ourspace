# OurSpace Production Readiness Design

## Scope

Fix only the production blockers already identified: environment leakage,
session invalidation behavior, Gallery payload size, SPA rewrites, recovery
rate limiting, spreadsheet formula injection, stale `couple_settings` cache,
and missing automated checks. No product features or visual redesign are
included.

## Design

- Keep real Apps Script URLs only in ignored local `.env` files and Vercel
  Environment Variables. Track only `.env.example` with placeholders.
- Classify `session.resume` errors through one pure frontend helper. Clear the
  local session only for `SESSION_INVALID`, `UNAUTHORIZED`, or
  `MEMBER_NOT_FOUND`; all other failures preserve the session and show retry.
- Use one shared 3 MiB raw-photo constant on the frontend, and enforce the same
  byte limit in Apps Script and the Vercel proxy. Keep JPG, PNG, and WebP.
- Add explicit Vercel rewrites for every known SPA route so the API function is
  never matched by a catch-all rewrite.
- Store recovery failure timestamps in Script Properties under a SHA-256 hash
  of the normalized nickname. Under the existing script lock, allow at most
  five failures in a rolling 15-minute window, clear failures on success, and
  return a generic `RATE_LIMITED` error when blocked.
- Sanitize every string at the shared Spreadsheet write boundary. Prefix text
  beginning with `=`, `+`, `-`, or `@` with one apostrophe, without
  double-escaping an existing apostrophe.
- Remove `couple_settings` from Script Cache eligibility while preserving the
  per-request row cache.
- Use `bun:test` without new dependencies for pure session, upload, sanitizer,
  and recovery-limit behavior.

## Error Handling

Temporary resume failures show: “Koneksi ke OurSpace lagi bermasalah. Session
kamu belum dihapus, coba lagi sebentar.” Recovery failures remain generic.
Rate-limited recovery shows: “Terlalu banyak percobaan. Coba lagi nanti ya.”
Gallery oversize errors show: “Foto maksimal 3 MB dulu ya, biar upload-nya
aman.”

## Deployment

Backend changes require a new immutable Apps Script version and deployment.
The latest deployment URL must be placed in ignored local `.env` and Vercel,
then old deployments must be disabled manually. `SESSION_SECRET` is not
rotated automatically.

## Verification

Run `bun test`, `bun run lint`, `bun run build`, Apps Script syntax checks,
route smoke checks, tracked-secret scans, direct-URL scans, and live read-only
health checks where network and deployment configuration permit.
