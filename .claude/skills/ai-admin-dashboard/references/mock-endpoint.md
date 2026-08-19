# Reference: mock endpoint (MSW)

Read this when wiring a new endpoint's mock, adding/editing handlers in
`src/mocks/`, or seeding data. MSW stands in for the real backend in dev, so
handlers must return the **exact** shapes production will (`docs/api-contract.md`,
blueprint §3). If the mock drifts, the UI breaks the day the real API is enabled.

## Non-negotiables

- **Envelope every response** in `StandardResponse<T>`:
  `{ result: 'success' | 'error', message, data }`. `message` shows in toasts —
  make it human-readable.
- **List endpoints return `Paginated<T>`** as `data`:
  `{ total, page, limit, totalPages, data: T[] }`. `page` is **1-indexed**.
- **Use real paths** from blueprint §3.7, not mock-only paths — services already
  call these.
- **Seed data satisfies `src/api/interfaces/`** exactly (`_id`, timestamps,
  optionality). Don't invent fields.

## Handler recipe

1. **Read params:** `keyword?`, `page?` (1-indexed), `limit?`, plus per-module
   filters (e.g. `role?` for users; `status?`/`owner?`/date range for records).
   Default `page=1` and a sensible `limit`.
2. **Filter → search → paginate**, in that order, over the in-memory array. Apply
   filters, then case-insensitive `keyword` over the searchable fields, then slice
   by `page`/`limit`. Compute `total` from the **filtered** set and
   `totalPages = Math.ceil(total / limit)`.
3. **Wrap and return** `StandardResponse<Paginated<T>>` with `result: 'success'`.
4. **Mutations** (POST/PUT/PATCH/DELETE) mutate a module-level mutable array so
   changes persist across requests in a session, and return the affected entity
   (or `GenericDeleteResponse` for delete) in the envelope.

## Seed data — cover every state the UI must render

- **Multiple pages' worth** (e.g. 25–50+ items at `limit=10`) so pagination and
  `keepPreviousData` are exercised.
- **Every status/enum value** present (users: `active`/`inactive`/`pending`;
  records: each workflow status incl. `Archived`) so chips and filters have
  coverage.
- **Realistic denormalized fields** the list displays (`ownerName`, `actorName`,
  role chips). Several are `(assumed)` in the blueprint — keep but isolate.
- **A reachable empty state** — a keyword/filter combination matching nothing
  returns `data: []`, `total: 0`.

## Errors & auth (so interceptor paths are testable)

The axios client redirects to `/login` on `401`/`403` and broadcasts
`api:serverError` on failure. Keep a deterministic way to trigger an error path
in dev (e.g. a sentinel keyword or id) that returns an error status with an
`{ result: 'error', message }` envelope, so the Error state and toast wiring can
be verified without breaking the happy path.

## Checklist

- [ ] Path matches blueprint §3.7 (real path, not mock-only).
- [ ] `StandardResponse<T>`; lists use `Paginated<T>`, `page` 1-indexed,
      `totalPages` from the filtered set.
- [ ] `keyword` + all documented filters honored; empty result reachable.
- [ ] Seeds satisfy the interface, cover every status, span multiple pages.
- [ ] Mutations persist in-memory and return the entity in the envelope.
- [ ] An error/`401`/`403` path is reachable for testing.
- [ ] `npm run build` passes.
