# AVX Admin Dashboard

A production-style **admin dashboard boilerplate** and home of the **AVX shared
component library**. Built to be copied/extended for new admin apps.

**Stack:** Next.js 16 (App Router) · TypeScript · MUI v9 + MUI X DataGrid ·
TanStack Query · React Hook Form + Zod · axios · MSW · Recharts · notistack.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000  (redirects to /dashboard)
```

The dev server runs with **mock APIs enabled** (MSW) — no backend required. The
login page is prefilled with demo credentials; any values are accepted.

## Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Dev server with hot reload + MSW mocks   |
| `npm run build`     | Production build (must pass)             |
| `npm run start`     | Serve the production build               |
| `npm run lint`      | Lint                                     |
| `npx tsc --noEmit`  | Type-check                               |

## Pages

- `/login` — authentication
- `/dashboard` — KPIs + charts + recent activity
- `/users` — searchable, paginated user CRUD table
- `/records` — records CRUD, workflow status chips, filters, detail + history
- `/approvals` — approval queue (pending/approved/rejected; approve/reject)
- `/audit` — read-only audit log with filters
- `/notifications` — notification center
- `/reports` — summaries with CSV + PDF export
- `/settings/access` · `/settings/workflow` · `/settings/security` · `/settings/branding` — settings
- `/profile` — account details + change password

## Connecting a real backend

The app talks to `/api/*` through typed axios services. To switch from mocks to a
real backend, edit `.env.local`:

```bash
NEXT_PUBLIC_API_MOCKING=disabled
NEXT_PUBLIC_API_BASE_URL=https://api.yourbackend.com
```

No component or service code changes are needed — the backend just has to satisfy
[`docs/api-contract.md`](docs/api-contract.md).

## Documentation

- [`CLAUDE.md`](CLAUDE.md) — architecture, conventions & rules (AI + human guide)
- [`docs/features.md`](docs/features.md) — feature/page details
- [`docs/conventions.md`](docs/conventions.md) — coding conventions
- [`docs/api-contract.md`](docs/api-contract.md) — backend endpoint contract
