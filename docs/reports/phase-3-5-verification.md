# AVX Admin Dashboard — Phase 3–5 verification report

**Date:** 2026-08-19 · **Branch/commit:** feat/phases-3-5-modules @ 7fb6480 (+ verification fixes)
**Build:** `npm run build` ✅ pass · **Types:** `npx tsc --noEmit` ✅ clean · **Lint:** n-a (not run)
**Prior state (1 line):** All five blueprint phases implemented (Records, Approvals, Workflow, Audit, Notifications, Reports, Settings, Profile); this pass verifies Phase 3–5 only — no features built.

This is a **verification pass**, not a build. Scope: the four checks below, low-risk
fixes only, and anything ambiguous parked under "Needs a decision".

## Summary of findings

| # | Item | Status | Where | Fix |
| - | ---- | ------ | ----- | --- |
| 1 | Permission-key coverage (all gated keys exist + seeded) | ✅ Pass | `src/auth/permissions.ts`, `src/mocks/data.ts:49` | None — every gated key is granted to Super Admin (`ALL_PERMISSION_KEYS`). |
| 2 | Approvals Pending queue not empty by default | ✅ Pass | `src/app/(dashboard)/approvals/page.tsx:37` | Default scope is `all`; queue shows all pending records. |
| 2b | Approvals "Mine" scope empty for dev Super Admin | ✅ Fixed | `src/mocks/data.ts:100-104` | Added `r-super` to both seeded approval levels so "Mine" populates. |
| 3 | Doc sync — CLAUDE.md ↔ progress.md | ✅ Pass | `CLAUDE.md:17-39` | In sync (5 phases done, no `ComingSoon`, no `subjects/` map). No change needed. |
| 3b | README "Pages" list stale (`/subjects`) | ✅ Fixed | `README.md:30-39` | Replaced with the real route set. |
| 4 | Reports PDF export returns a valid `application/pdf` | ✅ Pass | `src/mocks/handlers.ts:151-178, 396-404` | Real single-page PDF with correct xref offsets; not an empty/HTML stub. |

No blockers. Two low-risk fixes applied; details below.

---

## Check 1 — Permission-key coverage

**Gated-on keys** (nav, route guard, `PermissionGate`, `hasPermission`) across
records/approvals/reports/settings/notifications/audit and the shared surfaces:

| Key | Gated at | Exists in catalogue? | Seeded to a role? |
| --- | -------- | :---: | --- |
| `dashboard:view` | nav | ✅ | all roles |
| `notifications:view` | nav, `Header.tsx:92` | ✅ | Super/Admin/Approver/Editor |
| `users:read` | nav | ✅ | Super/Admin/Viewer |
| `users:create` | `users/page.tsx:193` | ✅ | Super/Admin |
| `users:update` | `users/page.tsx:145` | ✅ | Super/Admin |
| `users:delete` | `users/page.tsx:170` | ✅ | Super/Admin |
| `records:read` | nav | ✅ | Super/Admin/Approver/Editor/Viewer |
| `records:create` | `records/page.tsx:149` | ✅ | Super/Admin/Editor |
| `records:update` | `records/page.tsx:101` | ✅ | Super/Admin/Editor |
| `records:archive` | `records/page.tsx:108` | ✅ | Super/Admin |
| `approvals:read` | nav, `dashboard/page.tsx:64` | ✅ | Super/Admin/Approver |
| `approvals:approve` | `approvals/page.tsx:55` | ✅ | Super/Admin/Approver |
| `approvals:reject` | `approvals/page.tsx:56` | ✅ | Super/Admin/Approver |
| `audit:read` | nav, `dashboard/page.tsx:48` | ✅ | Super/Admin |
| `reports:view` | nav | ✅ | Super/Admin/Viewer |
| `reports:export` | `reports/page.tsx:33` | ✅ | Super/Admin |
| `settings:rbac` | nav, `settings/access/page.tsx:52,96` | ✅ | Super only |
| `settings:workflow` | nav, `settings/workflow/page.tsx:114` | ✅ | Super/Admin |
| `settings:security` | nav, `settings/security/page.tsx:93` | ✅ | Super only |
| `settings:branding` | nav, `settings/branding/page.tsx:82` | ✅ | Super only |

**Result: Pass.** No key is gated-on-but-unseeded. Super Admin is seeded with
`ALL_PERMISSION_KEYS` (`data.ts:49`), so every gated control is reachable by at
least one role and never silently vanishes.

Note (not a defect): `users:assignRole` exists in the catalogue but is not gated
on any control (role assignment lives in the user edit form under `users:update`).
It is seeded but unused — the inverse of the failure this check hunts, so harmless.

## Check 2 — Approvals "Pending → mine" in dev

The Approvals page defaults `scope = 'all'` (`approvals/page.tsx:37`), so the
Pending tab renders **all** pending, non-archived records on load — not empty.
Seeded pending records: rec1, rec2, rec6, rec9, rec12 (five visible).

The **"Mine"** toggle filters to records whose current level's `approverRoleIds`
overlap the signed-in user's roles. The dev session signs in as Super Admin
(`r-super`), which was **not** listed on either seeded approval level (level 0 →
`r-approver`, level 1 → `r-admin`). "Mine" therefore returned nothing for the
default user — the toggle looked functional but was always empty.

**Fix applied (low-risk seed):** added `r-super` to both approval levels
(`data.ts:100-104`). "Mine" now shows the five pending records for the dev user.
"All" is unchanged. No workflow semantics change for real backends — this only
affects seed data.

## Check 3 — Doc sync

`CLAUDE.md`'s "Project status" section (lines 17–39) and its rules match
`progress.md`: all five phases ✅, "no `ComingSoon` placeholders remain", 2FA
deferred. CLAUDE.md contains **no directory map** and no lingering `subjects/`
entry (its only `subjects` mention correctly says the feature "was retired").
**Result: Pass — no drift, no change needed.**

Adjacent finding (out of the check's stated scope but low-risk): `README.md`'s
"Pages" list still advertised `/subjects` and omitted every Phase 3–5 route.
Synced it to the real route set (`README.md:30-39`). Other `subjects` mentions
(`Record.ts:3`, `conventions.md:23`, `blueprint.md:287`) are intentional
historical/explanatory text and were left as-is.

## Check 4 — Reports PDF in dev

`GET /reports/export?format=pdf` returns a **real** single-page PDF built by
`buildStubPdf` (`handlers.ts:151-178`): `%PDF-1.4` header, 5 objects, a computed
`xref` table with correct byte offsets, and a `trailer`/`startxref`/`%%EOF`.
Response headers are `Content-Type: application/pdf` +
`Content-Disposition: attachment` (`handlers.ts:396-404`). The service requests it
as a blob (`services/reports.ts:27-31`). The bytes are pure ASCII, so JS string
length equals byte length and the xref offsets are valid — the file opens in a PDF
viewer. **Result: Pass — not an empty/HTML stub.**

---

## Needs a decision (nothing changed)

- **Reports PDF is text-only.** The dev PDF prints just a title line
  (`"<TYPE> report"`), no tabular data. Fine as a mock, but the real backend must
  render the actual figures. Decide whether the mock should embed the summary
  numbers for a more faithful preview, or stay a placeholder. (Left unchanged.)

## Known issues

- Attachments are read-only from seed — create/edit manages title/description/
  status only (already tracked in `progress.md` "Possible next steps").
- Client-side RBAC only; no server-side enforcement in the mock layer (expected —
  the real backend must mirror the gating).

## Deferred / not in scope

- 2FA — deferred per blueprint decision 5.
- Server-side persistence of Workflow/Security/Branding edits — in-memory only.

## Open questions for reviewer

- See "Needs a decision" — should the mock PDF embed real summary figures?

## How to run / verify

- `npm run dev` (MSW enabled via `.env.local`), sign in with any credentials —
  the mock session is Super Admin (Ava Reyes).
- Approvals → Pending → **Mine**: now lists five pending records (verifies the
  seed fix). **All** lists the same set.
- Reports → any summary → **Export PDF**: downloads a file that opens in a PDF
  viewer (verifies check 4).
- Build gate: `npm run build` and `npx tsc --noEmit` (see status line at top).
