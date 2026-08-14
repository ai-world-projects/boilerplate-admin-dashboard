# Coding Conventions

These are the patterns every file in this repo follows. Match them when adding
code so the project stays uniform and the `AVX` components stay extractable.

## Component library (`src/components/AVX*`)

Shared components use the **folder-split convention**:

```
AVXDataTable/
  AVXDataTable.tsx         # the component (default export)
  AVXDataTable.types.ts    # props/types (only when non-trivial)
  AVXDataTable.styled.ts   # styled() styles (only when non-trivial)
  index.ts                 # barrel: re-export component + types
```

Rules:

- **Prefix every shared component with `AVX`** and export it via the folder's
  `index.ts` barrel so imports are `import { AVXDataTable } from '@/components/AVXDataTable'`.
- Components must be **generic and reusable** — no API calls, no feature logic.
  If it knows about "users" or "subjects", it belongs in `src/features/`, not here.
- Client components start with `'use client';`.
- Small components (header, stat card) may keep types inline; large ones split
  into `.types.ts`.

## Features (`src/features/<domain>/`)

Each domain owns its data hooks and forms:

```
features/users/
  useUsers.ts          # TanStack Query: list query + create/update/delete mutations
  userSchema.ts        # Zod schema + inferred type + empty defaults
  UserFormDrawer.tsx   # RHF form rendered inside <AVXFormDrawer>
```

- **Query hooks** use `useQuery`/`useMutation`, unwrap the envelope with
  `select: (res) => res.data`, and invalidate the list query on mutation success.
- Use `keepPreviousData` for paginated lists so the grid doesn't flash on page
  changes.
- Mutations report success/failure through the `notify` helper and
  `handleApiError`.

## API layer (`src/api/`)

- **`client.ts`** exports a single configured axios instance. All services import
  it. It injects the auth token (request interceptor) and broadcasts
  `api:unauthorized` / `api:serverError` window events on failure (response
  interceptor). `AppShell` listens for these and redirects/notifies.
- **`services/<domain>.ts`** are plain async functions returning
  `StandardResponse<T>`. One function per endpoint.
- **`interfaces/`** hold all API types. `Common.ts` defines `StandardResponse<T>`,
  `Paginated<T>`, `ListParams`, `GenericDeleteResponse`.

## Forms

- React Hook Form with `zodResolver`. Define the schema in `<domain>Schema.ts`,
  infer the form values type with `z.infer`.
- Wire fields with `<Controller>` for MUI inputs.
- Reset the form from the edited entity inside a `useEffect` keyed on `open`.

## Theming

- `src/theme/theme.ts` exposes `getTheme(AppThemes.BASE_THEME)`; themes are stored
  in a `Map` keyed by the `AppThemes` enum so more brands/variants can be added.
- Brand colors are **CSS variables** (RGB triplets) in `src/app/globals.css`, read
  by the theme via `rgb(var(--rgb-primary))`. Re-skin by editing those variables.
- Extend MUI's palette types via module augmentation in `src/theme/types.ts`.

## Imports & misc

- Use the `@/*` path alias (maps to `src/`).
- Prefer named exports for utilities; default export for React components (plus a
  named re-export in the barrel).
- Keep the production build green: `npm run build` must pass.
