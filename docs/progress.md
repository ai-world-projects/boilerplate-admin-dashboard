# Project Progress & Roadmap

Single source of truth for **where the build stands** and **what comes next**.
Update the status column as phases land. The phase numbering matches
[`blueprint.md` §7 "Phased build plan"](blueprint.md).

_Last updated: 2026-08-14._

## Status at a glance

| Phase | Scope | Status |
| ----- | ----- | ------ |
| 1 — Foundation | Auth context + `GET /auth/me` mock, permissions catalogue, `PermissionGate` + route guard, grouped permission-gated nav, 403 page | ✅ Done |
| 2 — Users + RBAC | Users CRUD (status + multi-role assignment, status filter), Roles CRUD + permission matrix at `/settings/access` | ✅ Done |
| 3 — Records + Approvals + Workflow | Records CRUD/archive, approval queue + approve/reject/remarks, record history, workflow-driven statuses | ⏳ **Next** |
| 4 — Audit + Notifications | Audit log (+ admin filter), notification center + bell | ⬜ Not started |
| 5 — Reports + Settings | Summary + CSV/PDF export; Security + Branding settings | ⬜ Not started |

## Done so far (Phases 1–2)

- **Auth & RBAC foundation:** permission catalogue, `AuthProvider`/`useAuth`,
  `PermissionGate`, `RouteGuard`, `Forbidden` (403), grouped gated sidebar.
- **Users management:** CRUD, activate/deactivate, multi-role assignment, status
  filter — built on the blueprint `User` shape.
- **Roles & access:** Roles CRUD + permission matrix at `/settings/access`.

## Next up — Phase 3 (Records + Approvals + Workflow)

This is the current target. Key notes:

- The legacy `subjects` feature/page **predates the blueprint and is replaced by
  the generic `records` module** in this phase — build `records`, then retire
  `subjects`.
- Approval levels are **admin-configurable from day one** via Workflow Settings.
- Record **attachments ship in v1** (API returns `Attachment.fileUrl`; mock uses
  placeholder URLs).
- Record **history / status changes are workflow-driven.**

## Placeholders currently rendering `ComingSoon`

These routes exist but show the `ComingSoon` placeholder tagged with their phase:
Records, Approvals, Audit, Notifications, Reports, and the Workflow / Security /
Branding settings.

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
