# <Project> — <Phase / date> handoff report

**Date:** YYYY-MM-DD · **Branch/commit:** <branch @ short-sha>
**Build:** `npm run build` <pass/fail> · **Types:** `npx tsc --noEmit` <clean/errs>
· **Lint:** <pass/fail/n-a>
**Prior state (1 line):** <e.g. Phases 1–2 done: auth + RBAC + users/roles.>

## What was built this phase
- <module/feature> — <one line>
- ...

## Deviations from the plan (and why)
- <what differed from the prompt/blueprint> — <rationale>
- (none) if truly none.

## Contract delta (endpoints added/changed this phase)
| Method | Path | Body | data |
| ------ | ---- | ---- | ---- |
| ... | ... | ... | ... |

### New/changed entity shapes
```ts
// only shapes added or changed this phase
```

## Permissions added + role grants
- `resource:action` — granted to <roles>
- ...

## Files added/changed (high level, by area)
- interfaces: <paths>
- services + mocks: <paths>
- features + pages: <paths>
- components (shared/AVX): <paths>
- nav/config/docs: <paths>

## Known issues
- <bug/limitation + impact>

## Deferred / not in scope
- <thing> — <why / when>

## Open questions for reviewer
- <decision needed, with options if any>

## How to run / verify
- <commands, seed/login notes, anything non-obvious to exercise the feature>
