# Features

The app ships four pages. All authenticated pages render inside `AppShell`
(sidebar + header) via the `(dashboard)` route group.

## Authentication — `/login`

- Public page (outside the app shell).
- React Hook Form + Zod validation (email + password).
- Calls `POST /api/auth/login`, stores the returned token in `localStorage`
  (`AUTH_STORAGE_KEY`) and the user in `CURRENT_USER_KEY`, then redirects to
  `/dashboard`.
- Prefilled with demo credentials since the mock accepts any input.
- Logout is handled from the header account menu.

> Note: route protection is intentionally minimal in the boilerplate (token is
> stored and read by the axios interceptor). Add a real guard — middleware or a
> layout check — when wiring the real backend.

## Dashboard — `/dashboard`

- Loads a single summary payload from `GET /api/dashboard`.
- **KPI cards** (`AVXStatCard`): total users, subjects, enrollments, active users,
  each with a period-over-period change indicator.
- **Enrollment trend** area chart and **users-by-role** bar chart (Recharts).
- **Recent users** table.

## Subjects — `/subjects`

- Paginated, searchable list in `AVXDataTable` (server-side pagination).
- Search by name/code (debounced via `AVXSearchField`).
- Create/edit via `SubjectFormDrawer` (`AVXFormDrawer` + RHF/Zod).
- Delete via `AVXConfirmDialog`.
- Columns: name, code, instructor, enrolled count, published status, row actions.

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

## Adding a new feature (recipe)

1. Add types in `src/api/interfaces/<Domain>.ts`.
2. Add a service in `src/api/services/<domain>.ts`.
3. Add MSW handlers + mock data in `src/mocks/`.
4. Add a query-hooks file + Zod schema + form drawer in `src/features/<domain>/`.
5. Add the page in `src/app/(dashboard)/<domain>/page.tsx`.
6. Add a nav entry in `src/layouts/navConfig.ts`.
