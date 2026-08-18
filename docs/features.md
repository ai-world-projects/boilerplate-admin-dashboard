# Features

All authenticated pages render inside `AppShell` (sidebar + header) via the
`(dashboard)` route group, gated by `RouteGuard` (per-route permission) and the
grouped, permission-filtered sidebar.

## Authentication — `/login`

- Public page (outside the app shell).
- React Hook Form + Zod validation (email + password).
- Calls `POST /api/auth/login`, stores the returned token in `localStorage`
  (`AUTH_STORAGE_KEY`) and the user in `CURRENT_USER_KEY`, then redirects to
  `/dashboard`.
- Prefilled with demo credentials since the mock accepts any input.
- Logout is handled from the header account menu.

> Route protection: `RouteGuard` (`src/auth/RouteGuard.tsx`) enforces the
> per-route permission from `navConfig` and renders a 403 for missing access —
> defense in depth alongside the sidebar hiding items. The login token is stored
> and read by the axios interceptor. When wiring the real backend, keep the same
> permission model and add server-side enforcement.

## Dashboard — `/dashboard`

- Loads a single summary payload from `GET /api/dashboard`.
- **KPI cards** (`AVXStatCard`): Total Users, Active Users, Pending Approvals,
  Records total, each with a period-over-period change indicator.
- **Records-by-status** and **approvals-throughput** (approved vs rejected) bar
  charts (Recharts), plus a quick link into the Pending Approvals queue.
- **Recent activity** feed is a placeholder until Phase 4c (it reads the audit log).

## Records — `/records`

- Paginated, searchable, filterable list in `AVXDataTable` (server pagination).
- Search by title/owner; filters for status, owner, and a created-date range.
- Status renders as a colored chip driven by the live Workflow config
  (`WorkflowStatusChip`), not a hardcoded map.
- Create/edit via `RecordFormDrawer`; detail (fields, attachments, approval
  history) via `RecordDetailDrawer`.
- Archive is a soft-delete (restorable), confirmed via `AVXConfirmDialog`.
- Row actions permission-gated: view, edit (`records:update`), archive/restore
  (`records:archive`); "Create record" gated by `records:create`.

## Approvals — `/approvals`

- Queue over records, with **Pending** (mine / all), **Approved**, **Rejected**
  tabs.
- **Approve** (optional remarks) and **Reject** (remarks required) via
  `ApprovalDecisionDialog`, gated by `approvals:approve` / `approvals:reject`.
- Multi-level state machine: approving a non-final level advances the record;
  the final level sets Approved; rejecting sets Rejected. Each transition appends
  an `ApprovalAction` and emits an `AuditEntry` + `Notification`.

## Workflow settings — `/settings/workflow`

- Single settings form (`GET/PUT /api/settings/workflow`): editable statuses
  (label + color via `AVXColorField`) and an ordered list of approval levels
  (name + approver-role multi-select), saved via PUT. Gated by `settings:workflow`.
- Feeds the Records and Approvals modules with statuses and levels.

## Users — `/users`

- Paginated list with **search** (name/email) and a **status filter**
  (active/pending/inactive).
- Create/edit via `UserFormDrawer`; fields: first/last name, email, **multiple
  roles** (multi-select chips), status.
- Columns: name, email, **role chips**, status chip (3 states), last login, actions.
- Row actions (permission-gated): edit, **activate/deactivate** toggle
  (`PATCH /users/:id/status`), delete. The "Create user" button is gated by
  `users:create`.

## Access / RBAC — `/settings/access`

- Roles table: name, description, permission count, System/Custom type, actions.
- Create/edit roles via `RoleFormDrawer` with a **grouped permission matrix**
  (select-all per group). System roles have a locked name and cannot be deleted.
- All actions gated by `settings:rbac`. Roles feed the user role picker and the
  permission set returned by `GET /auth/me`.

## Audit Log — `/audit`

- Read-only, paginated `AVXDataTable` over `GET /api/audit`.
- Filters: search, actor, action type, entity, created-date range, and an
  **Admin activity** toggle (`adminOnly`) that scopes to admin-role actors.
- Immutable — no mutations. Entries are written by the approval transitions.

## Notifications — `/notifications`

- In-app center: paginated list with read/unread styling and **Mark all read**.
- Clicking a notification marks it read and follows its deep `link`.
- The header **bell** (`NotificationBell`, in `AppShell`'s header) shows an unread
  badge and a dropdown of recent notifications, gated by `notifications:view`.

## Reports — `/reports`

- Summary sections: Users, Records by status, Approval turnaround — rendered with
  `AVXStatCard` tiles and status rows, consistent with the dashboard.
- Per-summary **CSV and PDF** export (gated by `reports:export`): fetches a blob
  from `GET /api/reports/export?type=&format=` and downloads it. PDF is
  backend-generated; the client only downloads the bytes.

## Security settings — `/settings/security`

- Single RHF/Zod form grouped into Password rules, Session, and Lockout, saved via
  `PUT /api/settings/security`. Gated by `settings:security`.

## Branding settings — `/settings/branding`

- Form for app name, logo URL, and primary color (`AVXColorField`), saved via
  `PUT /api/settings/branding`. Gated by `settings:branding`.
- The hex primary color is converted to an RGB triplet (`utils/color`) and written
  to the `--rgb-primary` CSS variable, re-skinning the theme live. `AppShell`
  applies the saved color on load via `useApplyBranding`.

## My Profile — `/profile`

- Available to any authenticated user. Shows account details and the user's
  roles/permissions from the auth context (`GET /auth/me`).
- Change-password form (RHF/Zod) posting to `PUT /api/profile/password`. No 2FA
  (deferred).

## Shared components used across pages

| Component          | Purpose                                             |
| ------------------ | --------------------------------------------------- |
| `AVXTextField`     | Standard text/select input (consistent height)      |
| `AVXPageHeader`    | Title + subtitle + right-aligned action slot        |
| `AVXSearchField`   | Debounced search input                              |
| `AVXDataTable`     | MUI X DataGrid wrapper (server pagination)          |
| `AVXFormDrawer`    | Right drawer wrapping a form (header/footer actions)|
| `AVXConfirmDialog` | Confirmation dialog (delete flows)                  |
| `AVXStatCard`      | Dashboard KPI card with trend indicator             |
| `AVXColorField`    | Labeled color picker + hex input (workflow/branding)|

## Adding a new feature (recipe)

1. Add types in `src/api/interfaces/<Domain>.ts`.
2. Add a service in `src/api/services/<domain>.ts`.
3. Add MSW handlers + mock data in `src/mocks/`.
4. Add a query-hooks file + Zod schema + form drawer in `src/features/<domain>/`.
5. Add the page in `src/app/(dashboard)/<domain>/page.tsx`.
6. Add a nav entry in `src/layouts/navConfig.ts`.
