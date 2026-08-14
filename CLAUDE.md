# AVX Admin Dashboard — Project Guide

This is the canonical guide for both humans and AI assistants (Claude Code reads
this file automatically). It captures the architecture, conventions, and rules
so any session can be productive immediately. Keep it up to date as the project
evolves.

For detailed references see the `docs/` folder:

- [`docs/blueprint.md`](docs/blueprint.md) — **the target platform spec** (modules, IA, RBAC, approval workflow, data contract, phased build plan). Read this first.
- [`docs/features.md`](docs/features.md) — what each currently-built feature/page does
- [`docs/conventions.md`](docs/conventions.md) — coding conventions & patterns
- [`docs/ux.md`](docs/ux.md) — **UI/UX & consistency rules** (spacing, alignment, page structure, responsiveness, journeys). Follow when building or reviewing any screen.
- [`docs/api-contract.md`](docs/api-contract.md) — the endpoint contract the backend must satisfy

## Project status

The app is being built toward `docs/blueprint.md` in phases.

- **Phase 1 — done:** auth foundation + RBAC gating (permission catalogue,
  `AuthProvider`/`useAuth`, `PermissionGate`, route guard, grouped gated sidebar).
- **Phase 2 — done:** Users management (CRUD, status activate/deactivate, multi-role
  assignment, status filter) on the blueprint `User` shape, and Roles + permission
  matrix at `/settings/access`.

Not yet built (Records, Approvals, Audit, Notifications, Reports, and the
Workflow/Security/Branding settings) render a `ComingSoon` placeholder tagged with
their phase. The legacy `subjects` feature/page predates the blueprint and will be
replaced by the generic `records` module in Phase 3.

---

## What this is

A production-style **admin dashboard boilerplate** and the home of the **AVX
shared component library**. It is intended to be copied/extended for new admin
apps, and its `src/components/AVX*` set is designed to be extracted into a shared
package later with minimal churn.

## Tech stack

| Concern            | Choice                                             |
| ------------------ | -------------------------------------------------- |
| Framework          | Next.js 16 (App Router)                            |
| Language           | TypeScript (strict)                                |
| UI library         | MUI v9 + MUI X DataGrid + Emotion                  |
| Server state       | TanStack Query v5                                  |
| Forms + validation | React Hook Form + Zod v4                           |
| HTTP               | axios (single instance w/ interceptors)            |
| Mock API           | MSW (Mock Service Worker)                          |
| Charts             | Recharts                                           |
| Notifications      | notistack                                          |
| Font               | Poppins (`@fontsource/poppins`)                    |

## Commands

```bash
npm run dev     # start dev server (http://localhost:3000), MSW mocks enabled
npm run build   # production build (also the CI gate — must pass)
npm run start   # serve the production build
npm run lint    # eslint
npx tsc --noEmit  # type-check only
```

## Directory map

```
src/
  app/                      # Next App Router
    (dashboard)/            # authed route group (no URL prefix)
      layout.tsx            #   -> wraps pages in <AppShell>
      dashboard/ subjects/ users/   # pages
    login/                  # public login page
    layout.tsx              # root layout -> <Providers>
    providers.tsx           # Emotion cache, theme, QueryClient, snackbar, MSW
    MswProvider.tsx         # starts the MSW worker before render (dev only)
  api/
    client.ts               # axios instance + interceptors
    services/               # one file per domain: users, subjects, dashboard, auth
    interfaces/             # TS types per domain + Common (StandardResponse, Paginated)
  auth/                     # RBAC: permissions catalogue, AuthProvider/useAuth,
                            #   PermissionGate, RouteGuard, Forbidden
  components/               # AVX* shared component library (see conventions)
  features/                 # per-domain hooks (TanStack Query) + RHF/Zod forms
    users/ subjects/ dashboard/
  layouts/                  # AppShell, Sidebar, Header, navConfig
  mocks/                    # MSW handlers + in-memory mock data
  theme/                    # getTheme(enum) factory + palette module augmentation
  utils/                    # constants, errorHandler, formatDate, notify
```

## How data flows (read this before adding a feature)

```
Page (app/**/page.tsx)
  └─ feature hook (features/<domain>/use<Domain>.ts)   ← TanStack Query
       └─ service (api/services/<domain>.ts)           ← plain async fn
            └─ axios client (api/client.ts)            ← interceptors
                 └─ MSW handler (mocks/handlers.ts)    ← dev only; real backend in prod
```

- **Never call axios or a service directly from a component.** Go through a
  feature hook so caching, loading state, and cache invalidation are consistent.
- All responses use the `StandardResponse<T>` envelope; list endpoints return
  `Paginated<T>`. Hooks use `select` to unwrap `res.data`.

## Mock API ↔ real backend

Mocking is controlled by `.env.local`:

- `NEXT_PUBLIC_API_MOCKING=enabled` → MSW intercepts requests to `/api/*`.
- To use the real backend: set `NEXT_PUBLIC_API_BASE_URL=https://…` and set
  `NEXT_PUBLIC_API_MOCKING=disabled` (or remove it). **No component or service
  code changes** — services already call the real paths.

The backend must implement the contract in [`docs/api-contract.md`](docs/api-contract.md).

## Rules / conventions (short version)

1. **Shared components are prefixed `AVX`** and live in `src/components/<Name>/`
   using the folder-split convention (see conventions doc). They must stay
   generic — no feature-specific logic.
2. **Feature-specific code lives in `src/features/<domain>/`** (query hooks,
   forms, schemas) — not in `components/`.
3. **Server state → TanStack Query.** Don't hand-roll `useEffect` fetching.
4. **Forms → React Hook Form + Zod.** One schema per form; infer the TS type.
5. **Types come from `src/api/interfaces/`.** Don't redefine API shapes inline.
6. **Toasts → `notify` helper** (`src/utils/notify.ts`), not `useSnackbar`
   directly.
7. **The build must pass** (`npm run build`) before a change is considered done.
8. Zod v4: use top-level `z.email()` (not `z.string().email()`).

---

@AGENTS.md
