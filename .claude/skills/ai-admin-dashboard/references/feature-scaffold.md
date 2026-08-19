# Reference: feature scaffold

Read this when building or extending a module (page, list, CRUD, form drawer,
service, query hook, interface, nav entry). It expands the recipe from
`docs/features.md` with the per-layer conventions. The universal rules and
step-0 checks live in `SKILL.md` — do those first.

## The recipe (follow in order)

1. **Types** — `src/api/interfaces/<Domain>.ts`. Reuse envelope/pagination from
   `Common.ts` (`StandardResponse<T>`, `Paginated<T>`, `ListParams`,
   `GenericDeleteResponse`). Match the blueprint entity exactly — field names,
   optionality, `_id`, `createdAt`/`updatedAt`. Never redefine API shapes inline.

2. **Service** — `src/api/services/<domain>.ts`. One plain async function per
   endpoint, returning `StandardResponse<T>`. Import the shared `client`. Use the
   real paths from blueprint §3.7 (e.g. `GET /records`, `POST /records/:id/approve`)
   so switching off the mock needs zero code change.

3. **Mock** — `src/mocks/`. Add MSW handlers + in-memory seed data. See
   `mock-endpoint.md` for the full pattern (envelope, pagination, filters, seeds).

4. **Feature layer** — `src/features/<domain>/`:
   - `use<Domain>.ts` — `useQuery` list + `useMutation` create/update/delete.
     `select` unwraps `res.data`; `keepPreviousData` for paginated lists;
     invalidate the list query on mutation success; report via `notify` +
     `handleApiError`.
   - `<domain>Schema.ts` — Zod schema + `z.infer` type + empty defaults. Zod v4:
     top-level `z.email()` (not `z.string().email()`).
   - `<Domain>FormDrawer.tsx` — RHF + `zodResolver` inside `<AVXFormDrawer>`,
     `<Controller>` for MUI inputs, reset from the edited entity in a `useEffect`
     keyed on `open`.

5. **Page** — `src/app/(dashboard)/<domain>/page.tsx`. Compose `AVXPageHeader` +
   filters/search row + content. Handle all four data states (see
   `page-review.md`). Wrap with the route guard for the module's permission.

6. **Nav** — add a permission-tagged entry in `src/layouts/navConfig.ts`, in the
   correct group. A group hides entirely when the user has none of its items.

## AVX component rules (compose, don't re-style)

Reach for an existing component before writing layout or overriding MUI:

| Need | Component |
| ---- | --------- |
| Page chrome (title/subtitle/action) | `AVXPageHeader` |
| Table (server pagination) | `AVXDataTable` |
| Text/select input | `AVXTextField` |
| Debounced search | `AVXSearchField` |
| Create/edit surface | `AVXFormDrawer` |
| Confirmation (delete flows) | `AVXConfirmDialog` |
| Stat/summary tile | `AVXStatCard` |
| Unbuilt area | `ComingSoon` |

If a primitive is missing, add/extend an `AVX` component rather than styling one
page. Shared components: prefix `AVX`; folder-split (`Name.tsx`, `Name.types.ts`,
`Name.styled.ts`, `index.ts` barrel); export via the barrel; stay **generic** (no
API calls, no "users"/"records" knowledge — that belongs in `src/features/`).
Client components start with `'use client';`. Small components may keep types
inline; large ones split into `.types.ts`.

## RBAC gating (three layers, all required)

1. **Nav** — item/group filtered by `hasPermission` in `navConfig`.
2. **Route** — guard the page; missing permission → 403 page (defense in depth;
   menu hiding alone is not security).
3. **Affordances** — hide/disable action buttons (Create, Approve, Delete, …)
   without the permission, via `useAuth().hasPermission(key)` / `PermissionGate`.

## Definition of done

Verify against `page-review.md` before calling the module finished, and confirm
the build gate (`npm run build` + `npx tsc --noEmit`) is green.
