# OurSpace Production Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the identified production blockers without adding product features or dependencies.

**Architecture:** Keep fixes at existing shared boundaries: environment configuration, session error classification, Spreadsheet writers, and Apps Script recovery. Use pure helpers and Bun's built-in test runner for the smallest useful regression suite.

**Tech Stack:** React 19, TypeScript, Vite, Bun, Vercel Functions, Google Apps Script, Google Sheets.

## Global Constraints

- Do not add product features or redesign the app.
- Do not rotate `SESSION_SECRET` automatically.
- Do not add dependencies.
- Never print real Apps Script URLs or session tokens.
- Preserve all existing user changes in the dirty worktree.

---

### Task 1: Add failing critical-behavior tests

**Files:**
- Create: `src/lib/session-resume-error.ts`
- Create: `src/lib/upload-limits.ts`
- Create: `tests/session-resume-error.test.ts`
- Create: `tests/upload-limits.test.ts`
- Create: `tests/apps-script-security.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `shouldClearSessionAfterResume(error: unknown): boolean`
- Produces: `MAX_GALLERY_UPLOAD_BYTES` and `MAX_GALLERY_UPLOAD_MB`
- Tests Apps Script globals `sanitizeSheetCellValue` and `getRecoveryRateLimitState`

- [ ] Write Bun tests for the required session codes, temporary errors, 3 MiB limit, formula prefixes, no double escaping, and five failures per 15 minutes.
- [ ] Add `"test": "bun test"` to `package.json`.
- [ ] Run `bun test` and confirm the tests fail because the helpers do not exist yet.

### Task 2: Fix session resume handling

**Files:**
- Modify: `src/lib/session-resume-error.ts`
- Modify: `src/components/session-gate.tsx`
- Modify: `src/pages/pairing.tsx`

**Interfaces:**
- Consumes: `shouldClearSessionAfterResume(error)`
- Produces: retryable temporary-error states that preserve local session

- [ ] Implement the minimal pure classifier.
- [ ] Clear session/cache only for explicit invalid-session codes.
- [ ] Add friendly retry UI in `SessionGate` and `/pairing` temporary resume paths.
- [ ] Run the session tests and confirm they pass.

### Task 3: Enforce the 3 MiB Gallery limit

**Files:**
- Modify: `src/lib/upload-limits.ts`
- Modify: `src/pages/gallery.tsx`
- Modify: `api/apps-script.ts`
- Modify: `apps-script/07_actions.gs`
- Modify: `docs/live-testing.md`
- Modify: `docs/production-checklist.md`

**Interfaces:**
- Consumes: `MAX_GALLERY_UPLOAD_BYTES`
- Produces: consistent client, proxy, backend, and documentation limits

- [ ] Implement and use the shared frontend constant.
- [ ] Set proxy and Apps Script raw-photo validation to 3 MiB.
- [ ] Update all legacy Gallery size copy to the approved 3 MB copy.
- [ ] Run upload-limit tests.

### Task 4: Add Apps Script recovery protection and Spreadsheet sanitization

**Files:**
- Modify: `apps-script/05_spreadsheet.gs`
- Modify: `apps-script/06_session.gs`
- Modify: `src/pages/pairing.tsx`
- Modify: `docs/production-checklist.md`
- Test: `tests/apps-script-security.test.ts`

**Interfaces:**
- Produces: `sanitizeSheetCellValue(value)`
- Produces: `getRecoveryRateLimitState(failures, nowMs)`
- Produces: hashed Script Property recovery keys and `RATE_LIMITED`

- [ ] Implement Spreadsheet-boundary escaping and use it for append/update values.
- [ ] Implement pure rolling-window calculation.
- [ ] Under `withScriptLock`, check failures before verification, record generic failures, clear them on success, and issue the token only after the checks.
- [ ] Map `RATE_LIMITED` to friendly recovery copy.
- [ ] Run security tests.

### Task 5: Remove stale settings cache and fix production routes

**Files:**
- Modify: `apps-script/05_cache.gs`
- Modify: `vercel.json`

**Interfaces:**
- Preserves: request-local `couple_settings` caching
- Produces: explicit rewrites for every SPA route

- [ ] Remove only `couple_settings` from `CACHEABLE_SHEET_TTLS`.
- [ ] Add `/offline` and nested Settings rewrites without an API-matching catch-all.
- [ ] Run JSON and route smoke checks.

### Task 6: Clean environment tracking and deployment documentation

**Files:**
- Modify: `.gitignore`
- Modify: `.env.example`
- Remove from Git tracking: `.env`, `env`
- Modify: `docs/deployment.md`
- Modify: `docs/production-checklist.md`

**Interfaces:**
- Produces: placeholder-only tracked configuration and manual deployment cleanup instructions

- [ ] Ignore `.env`, `.env.*`, `env`, while explicitly allowing `.env.example`.
- [ ] Ensure `.env.example` contains exactly the approved placeholders.
- [ ] Remove accidental resume text locally and untrack both secret env files without printing their values.
- [ ] Document Vercel variables, latest deployment selection, and manual disabling of old Apps Script deployments.
- [ ] Scan all tracked files for real `/macros/s/<deployment>/exec` URLs.

### Task 7: Full verification and deployment handoff

**Files:**
- Modify if needed: `docs/production-checklist.md`

**Interfaces:**
- Produces: evidence for production readiness and a precise manual-action list

- [ ] Run `bun test`, `bun run lint`, and `bun run build`.
- [ ] Run syntax checks for every Apps Script file.
- [ ] Verify all eleven routes return HTTP 200 in preview.
- [ ] Verify no direct Apps Script URLs occur in `src` or `dist`.
- [ ] Verify `.env` and `env` are ignored and absent from `git ls-files`.
- [ ] Verify `setupSchema()` remains non-destructive by static inspection.
- [ ] Run read-only health checks when network is available without printing URLs.
- [ ] Review final diff and report files changed plus required manual deployment actions.
