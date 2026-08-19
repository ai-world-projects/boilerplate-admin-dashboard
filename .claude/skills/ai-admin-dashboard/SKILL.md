---
name: ai-admin-dashboard
description: >
  End-to-end implementation guide for the AI admin dashboard (Next.js 16 + MUI v9
  + TanStack Query v5 + RHF/Zod + MSW). Use this skill WHENEVER you build, extend,
  mock, or review any feature/module/page/component in this repo — adding a page,
  list, CRUD, form drawer, service, query hook, interface, or nav entry; writing
  MSW handlers or seed data; or reviewing a screen for consistency before it's
  done. Covers the blueprint phases (Records, Approvals, Workflow, Audit,
  Notifications, Reports, Settings, Profile) even when the user just says "add X",
  "make the X list work", or "is this done?". It wires the correct layers,
  contract shapes, RBAC gating, and four-state UX so new work matches the product
  on the first pass.
---

# AI admin dashboard — implementation

A production-style admin boilerplate and the home of the `AVX*` component
library. New code must be indistinguishable from existing code. This `SKILL.md`
is the always-loaded workflow; the detailed playbooks live in `references/` and
should be read when the task calls for them.

## 0. Before writing ANY code (every time)

- **This is a modified Next.js 16.** `AGENTS.md` warns that APIs, conventions,
  and file structure may differ from your training data. Read the relevant guide
  in `node_modules/next/dist/docs/` (resolved from `AGENTS.md`'s directory) before
  writing App Router / server / config code. Do not assume Next APIs from memory.
- Read `CLAUDE.md`, `docs/blueprint.md` (target spec + data contract),
  `docs/progress.md` (which phase you're in), `docs/conventions.md`, `docs/ux.md`,
  and `docs/api-contract.md`. Blueprint §3 is the authoritative entity contract;
  `src/api/interfaces/` is the source of truth in code.
- Confirm the module's blueprint spec (fields, endpoints, permissions, states)
  before coding. Fields marked **(assumed)** are provisional — isolate them so
  they're cheap to change.

## Which reference to read

- **Building/extending a module** (page, CRUD, hook, form, service, nav) →
  read `references/feature-scaffold.md`.
- **Writing/editing MSW handlers or seed data** → read `references/mock-endpoint.md`.
- **Reviewing a screen, or prepping a diff/PR / "is this done?"** →
  read `references/page-review.md`.

A full module usually needs all three: scaffold the layers, wire the mock, then
review before calling it done.

## Data flow (never shortcut a layer)

```
Page (app/(dashboard)/<domain>/page.tsx)
  └─ feature hook (features/<domain>/use<Domain>.ts)   ← TanStack Query
       └─ service (api/services/<domain>.ts)            ← plain async fn
            └─ axios client (api/client.ts)             ← interceptors (don't touch per-call)
                 └─ MSW handler (mocks/handlers.ts)      ← dev only; real backend in prod
```

Never call axios or a service directly from a component — always go through a
feature hook. All responses use `StandardResponse<T>`; list endpoints return
`Paginated<T>`; hooks unwrap with `select: (res) => res.data`.

## Universal rules (apply to all work)

- **Contract shapes:** `StandardResponse<T> = { result, message, data }`;
  `Paginated<T> = { total, page (1-indexed), limit, totalPages, data[] }`. Types
  come from `src/api/interfaces/` — never redefine API shapes inline. Use the real
  paths from blueprint §3.7 so nothing changes when the mock is swapped out.
- **Compose, don't re-style:** reach for an existing `AVX*` component before
  writing layout or overriding MUI. If a primitive is missing, add/extend a
  generic `AVX` component (folder-split, barrel export, no feature logic) so every
  screen benefits — don't style one page.
- **RBAC in three layers:** nav (`hasPermission` in `navConfig`), route (guard →
  403), and affordance (hide/disable buttons via `useAuth`/`PermissionGate`).
  Keys are `resource:action`.
- **Forms:** RHF + `zodResolver`; schema in `<domain>Schema.ts` with `z.infer`;
  `<Controller>` for MUI inputs; reset from the edited entity in a `useEffect`
  keyed on `open`. Zod v4 — top-level `z.email()`.
- **Feedback & state:** toasts via the `notify` helper (not `useSnackbar`);
  mutations invalidate the list query and report through `notify` +
  `handleApiError`; lists use `keepPreviousData`. Handle all four data states
  (loading / empty / error / success) — never just the happy path.
- **Theme, not hardcode:** colors via CSS vars (`rgb(var(--rgb-primary))`),
  spacing via the theme scale (no magic pixels), typography via theme variants.
- **Build gate:** `npm run build` passes and `npx tsc --noEmit` is clean before a
  change is done. This is the CI gate.

## Cross-cutting: approval / audit / notification

Per blueprint §5, every approval transition must write an `ApprovalAction`
(record history) **and** an `AuditEntry` **and** fire a `Notification`. Even if
the Audit/Notification UI is a later phase, define the event contract and emit
these from the approval mutations now, so later phases only add the read side
rather than forcing a refactor of already-shipped approval code.
