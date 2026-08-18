# Project Progress & Roadmap

Single source of truth for **where the build stands** and **what comes next**.
Update the status column as phases land. The phase numbering matches
[`blueprint.md` §7 "Phased build plan"](blueprint.md).

_Last updated: 2026-08-18._

## Status at a glance

| Phase | Scope | Status |
| ----- | ----- | ------ |
| 1 — Foundation | Auth context + `GET /auth/me` mock, permissions catalogue, `PermissionGate` + route guard, grouped permission-gated nav, 403 page | ✅ Done |
| 2 — Users + RBAC | Users CRUD (status + multi-role assignment, status filter), Roles CRUD + permission matrix at `/settings/access` | ✅ Done |
| 3 — Records + Approvals + Workflow | Records CRUD/archive, approval queue + approve/reject/remarks, record history, workflow-driven statuses | ✅ Done |
| 4 — Audit + Notifications | Audit log (+ admin filter), notification center + bell | ✅ Done |
| 5 — Reports + Settings | Summary + CSV/PDF export; Security + Branding settings; My Profile | ✅ Done |

## Done so far (Phases 1–5)

- **Auth & RBAC foundation:** permission catalogue, `AuthProvider`/`useAuth`,
  `PermissionGate`, `RouteGuard`, `Forbidden` (403), grouped gated sidebar.
- **Users management:** CRUD, activate/deactivate, multi-role assignment, status
  filter — built on the blueprint `User` shape.
- **Roles & access:** Roles CRUD + permission matrix at `/settings/access`.
- **Workflow settings:** admin-editable statuses (label + color) and ordered
  approval levels (approver roles per level) at `/settings/workflow`; consumed by
  Records and Approvals.
- **Records:** CRUD, workflow-driven status chips, search + status/owner/date
  filters, attachments and approval history in a detail drawer, archive/restore
  soft-delete.
- **Approvals:** queue with Pending (mine/all)/Approved/Rejected tabs, multi-level
  approve/reject with required reject remarks; every transition appends an
  `ApprovalAction` and emits an `AuditEntry` + `Notification`.
- **Dashboard:** reworked to records/approvals KPIs and charts; retired the legacy
  `subjects` feature and reconciled the docs to a single contract.
- **Audit log:** read-only, paginated log with actor/action/entity/date filters
  and an "Admin Activity" preset, over the store the approvals module writes to.
- **Notifications:** in-app center (read/unread, mark-all-read) plus a header bell
  with unread badge and a recent-notifications dropdown that deep-links.
- **Dashboard activity feed:** the Recent Activity card now reads the latest audit
  entries (gated by `audit:read`).
- **Reports:** users / records-by-status / approval-turnaround summaries with
  per-summary **CSV and PDF** export (blob download).
- **Security & Branding settings:** single settings forms; branding's primary
  color re-skins the theme live via the `--rgb-primary` CSS variable.
- **My Profile:** account details, roles/permissions, and a change-password form
  (`PUT /profile/password`).

## Build complete

All five blueprint phases are implemented. Every route renders a real module —
no `ComingSoon` placeholders remain. 2FA stays deferred (decision 5).

## Possible next steps (beyond the blueprint)

- Wire a real backend (`NEXT_PUBLIC_API_MOCKING=disabled` + base URL); the mock
  contract already matches `docs/api-contract.md`.
- Record attachment **upload** (create/edit currently manages title/description/
  status; attachments are read-only from seed).
- Persist Workflow/Security/Branding edits server-side and add server-side RBAC
  enforcement to mirror the client gating.

## Resolved product decisions (from `blueprint.md` §8)

1. Multiple roles per user (`roleIds: string[]`).
2. Record attachments in v1 (file URLs).
3. Approval levels fully admin-configurable from day one.
4. Reports export: **CSV and PDF**.
5. 2FA deferred (Profile ships without it for now).

## How to keep this current

When a phase completes, flip its row to ✅, move its bullets into "Done so far,"
promote the next phase to ⏳ **Next**, and bump the _Last updated_ date. Keep this
file in sync with `CLAUDE.md`'s "Project status" section.
