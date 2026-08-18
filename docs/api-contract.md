# API Contract

The frontend consumes these endpoints. During development they are served by MSW
(`src/mocks/handlers.ts`); in production the **real backend must implement the
same shapes**. Base path is `/api` (override with `NEXT_PUBLIC_API_BASE_URL`).

This file lists every endpoint the client consumes (all five blueprint phases are
implemented). It is kept in sync with [`blueprint.md` §3.7](blueprint.md).

## Conventions

- **Auth:** the client sends the token in a `token` header (see
  `api/client.ts`). `401`/`403` → the client redirects to `/login`.
- **Response envelope** — every endpoint returns:

  ```ts
  interface StandardResponse<T> {
    result: string;   // "success" | "error"
    message: string;  // human-readable, surfaced in toasts
    data: T;
  }
  ```

- **Pagination** — list endpoints return `data` as:

  ```ts
  interface Paginated<T> {
    total: number;
    page: number;      // 1-indexed
    limit: number;
    totalPages: number;
    data: T[];
  }
  ```

  Query params: `keyword?`, `page?` (1-indexed), `limit?`.

## Endpoints

### Auth

| Method | Path            | Body                  | `data`                             |
| ------ | --------------- | --------------------- | ---------------------------------- |
| POST   | `/auth/login`      | `{ email, password }`           | `{ user: User, token, expiresIn }` |
| POST   | `/auth/logout`     | —                               | `null`                             |
| GET    | `/auth/me`         | —                               | `{ user: User, roles: Role[], permissions: string[] }` |
| PUT    | `/profile/password`| `{ currentPassword, newPassword }` | `null`                          |

### Dashboard

| Method | Path         | `data`          |
| ------ | ------------ | --------------- |
| GET    | `/dashboard` | `DashboardData` |

`DashboardData = { cardStats[], recordsByStatus[], approvalsThroughput[] }`
(see `src/api/interfaces/Dashboard.ts`). The recent-activity feed is added in
Phase 4c.

### Users

| Method | Path                | Body                       | `data`                  |
| ------ | ------------------- | -------------------------- | ----------------------- |
| GET    | `/users`            | — (query params)           | `Paginated<User>`       |
| POST   | `/users`            | `UserFormRequest`          | `User`                  |
| PUT    | `/users/:id`        | `Partial<UserFormRequest>` | `User`                  |
| DELETE | `/users/:id`        | —                          | `GenericDeleteResponse` |
| PATCH  | `/users/:id/status` | `{ status }`               | `User`                  |
| PUT    | `/users/:id/roles`  | `{ roleIds }`              | `User`                  |

`GET /users` also accepts `status?` and `roleId?`.

### Roles & permissions

| Method | Path           | Body                       | `data`                  |
| ------ | -------------- | -------------------------- | ----------------------- |
| GET    | `/roles`       | —                          | `Role[]`                |
| POST   | `/roles`       | `RoleFormRequest`          | `Role`                  |
| PUT    | `/roles/:id`   | `Partial<RoleFormRequest>` | `Role`                  |
| DELETE | `/roles/:id`   | —                          | `GenericDeleteResponse` |
| GET    | `/permissions` | —                          | `Permission[]`          |

### Records

| Method | Path                    | Body                         | `data`                  |
| ------ | ----------------------- | ---------------------------- | ----------------------- |
| GET    | `/records`              | — (query params)             | `Paginated<RecordItem>` |
| POST   | `/records`              | `RecordFormRequest`          | `RecordItem`            |
| GET    | `/records/:id`          | —                            | `RecordItem`            |
| PUT    | `/records/:id`          | `Partial<RecordFormRequest>` | `RecordItem`            |
| PATCH  | `/records/:id/archive`  | `{ isArchived }`             | `RecordItem`            |
| GET    | `/records/:id/history`  | —                            | `ApprovalAction[]`      |

`GET /records` also accepts `status?`, `ownerId?`, `dateFrom?`, `dateTo?`.

### Approvals

| Method | Path                    | Body               | `data`                  |
| ------ | ----------------------- | ------------------ | ----------------------- |
| GET    | `/approvals`            | — (query params)   | `Paginated<RecordItem>` |
| POST   | `/records/:id/approve`  | `{ remarks? }`     | `RecordItem`            |
| POST   | `/records/:id/reject`   | `{ remarks }`      | `RecordItem`            |

`GET /approvals` accepts `tab` (`pending`\|`approved`\|`rejected`) and, for the
pending tab, `scope` (`mine`\|`all`). Every approve/reject transition also
appends an `ApprovalAction`, writes an `AuditEntry`, and fires a `Notification`
(blueprint §5).

### Audit

| Method | Path     | `data`                 |
| ------ | -------- | ---------------------- |
| GET    | `/audit` | `Paginated<AuditEntry>` |

`GET /audit` accepts `actorId?`, `action?`, `entity?`, `dateFrom?`, `dateTo?`,
and `adminOnly?` (the "Admin Activity" preset). Read-only — the log is immutable.

### Notifications

| Method | Path                       | `data`                                  |
| ------ | -------------------------- | --------------------------------------- |
| GET    | `/notifications`           | `Paginated<Notification> & { unreadCount }` |
| PATCH  | `/notifications/:id/read`  | `Notification`                          |
| POST   | `/notifications/read-all`  | `{ updated: number }`                   |

### Reports

| Method | Path                          | `data`                          |
| ------ | ----------------------------- | ------------------------------- |
| GET    | `/reports/summary`            | `ReportsSummary`                |
| GET    | `/reports/export?type=&format=` | binary blob (CSV or PDF)       |

`type` is `users` \| `records` \| `approvals`; `format` is `csv` \| `pdf`. The
backend owns file generation; the client requests a format and downloads the
bytes.

### Settings

| Method | Path                 | Body               | `data`             |
| ------ | -------------------- | ------------------ | ------------------ |
| GET    | `/settings/workflow` | —                  | `WorkflowSettings` |
| PUT    | `/settings/workflow` | `WorkflowSettings` | `WorkflowSettings` |
| GET    | `/settings/security` | —                  | `SecuritySettings` |
| PUT    | `/settings/security` | `SecuritySettings` | `SecuritySettings` |
| GET    | `/settings/branding` | —                  | `BrandingSettings` |
| PUT    | `/settings/branding` | `BrandingSettings` | `BrandingSettings` |

## Entity shapes

Authoritative definitions live in `src/api/interfaces/`:

- `User.ts` — `User`, `UserFormRequest`
- `Rbac.ts` — `Role`, `Permission`, `RoleFormRequest`
- `Record.ts` — `RecordItem`, `Attachment`, `ApprovalAction`, request bodies
- `Settings.ts` — `WorkflowSettings`, `SecuritySettings`, `BrandingSettings`
- `Audit.ts` — `AuditEntry`
- `Notification.ts` — `Notification`, `NotificationsPage`
- `Reports.ts` — `ReportsSummary`, `ReportType`, `ReportFormat`
- `Auth.ts` — `MeResponse`, `ChangePasswordRequest`
- `Dashboard.ts` — `DashboardData` and its parts
- `Common.ts` — envelope, pagination, delete response

Keep these files and the backend in sync — they are the single source of truth
for the client.
