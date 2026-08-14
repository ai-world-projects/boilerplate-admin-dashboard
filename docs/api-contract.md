# API Contract

The frontend consumes these endpoints. During development they are served by MSW
(`src/mocks/handlers.ts`); in production the **real backend must implement the
same shapes**. Base path is `/api` (override with `NEXT_PUBLIC_API_BASE_URL`).

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

| Method | Path              | Body                      | `data`                                  |
| ------ | ----------------- | ------------------------- | --------------------------------------- |
| POST   | `/auth/login`     | `{ email, password }`     | `{ user: User, token, expiresIn }`      |

### Dashboard

| Method | Path          | `data`          |
| ------ | ------------- | --------------- |
| GET    | `/dashboard`  | `DashboardData` |

`DashboardData = { cardStats[], enrollmentTrend[], usersByRole[], recentUsers[] }`
(see `src/api/interfaces/Dashboard.ts`).

### Users

| Method | Path          | Body                  | `data`               |
| ------ | ------------- | --------------------- | -------------------- |
| GET    | `/users`      | — (query params)      | `Paginated<User>`    |
| POST   | `/users`      | `UserFormRequest`     | `User`               |
| PUT    | `/users/:id`  | `Partial<UserForm…>`  | `User`               |
| DELETE | `/users/:id`  | —                     | `GenericDeleteResponse` |

`GET /users` also accepts `role?`.

### Subjects

| Method | Path             | Body                    | `data`                  |
| ------ | ---------------- | ----------------------- | ----------------------- |
| GET    | `/subjects`      | — (query params)        | `Paginated<Subject>`    |
| POST   | `/subjects`      | `SubjectFormRequest`    | `Subject`               |
| PUT    | `/subjects/:id`  | `Partial<SubjectForm…>` | `Subject`               |
| DELETE | `/subjects/:id`  | —                       | `GenericDeleteResponse` |

## Entity shapes

Authoritative definitions live in `src/api/interfaces/`:

- `User.ts` — `User`, `UserFormRequest`
- `Subject.ts` — `Subject`, `SubjectFormRequest`
- `Dashboard.ts` — `DashboardData` and its parts
- `Common.ts` — envelope, pagination, delete response

Keep these files and the backend in sync — they are the single source of truth
for the client.
