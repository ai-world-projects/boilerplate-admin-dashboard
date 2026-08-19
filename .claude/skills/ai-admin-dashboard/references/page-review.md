# Reference: page review (Definition of Done)

Read this when reviewing a page/component or prepping a diff/PR ("is this done?").
Most UI complaints in this project are **consistency** problems, not missing
features. This turns `docs/ux.md`'s Definition of Done into a repeatable audit.

## How to run a review

1. Identify the surface and what data it renders. Read the file(s), the feature
   hook, and any `AVX*` components it composes.
2. Walk every item below, marking **Pass / Fail / Needs check**. Don't skip items
   that "look fine" — several traps only show with *filled* data or at `xs` width.
3. Report as a table: item, verdict, `file:line`, concrete fix (name the `AVX`
   component or theme token). Lead with Fails.
4. Re-verify the build gate. Not done until green.

## Checklist

### Compose, don't re-style
- [ ] Built from `AVX*` components — no one-off layout or MUI overrides.
- [ ] Missing primitives were added/extended as generic `AVX` components, not
      styled inline on one page.

### Spacing & alignment (the traps that bit this repo)
- [ ] Theme spacing scale, **no magic pixels** (`padding: '13px'`).
- [ ] Sibling spacing via flex `gap` on the container, not per-child margins.
- [ ] ⚠️ No `'& > * + *': { mt }` at normal specificity — MUI's `margin: 0` wins
      the tie and zeroes it. Must use `'&& > * + *'` or a flex `gap` container.
- [ ] Page outer padding matches other pages (shell/header-owned), not ad-hoc.

### Forms & inputs
- [ ] Inputs full-width in their column; related fields share a row that stacks on
      `xs` (`flexDirection: { xs: 'column', sm: 'row' }`, each `flex: 1, minWidth: 0`).
- [ ] Every field labeled; errors via `helperText`/`error`, not an ad-hoc line.
- [ ] Labels don't overlap — verified with a **filled/floated** value.
- [ ] Primary action bottom-right, Cancel left; both disabled while submitting.

### The four data states (all required)
- [ ] **Loading** — skeleton/spinner, no blank flash or layout jump.
- [ ] **Empty** — friendly empty state with the primary action.
- [ ] **Error** — surfaced via `notify` / `handleApiError`, never swallowed.
- [ ] **Success** — populated content.
- [ ] Lists use `keepPreviousData` (no flash on page/filter change).

### Interaction
- [ ] Destructive actions confirm via `AVXConfirmDialog`.
- [ ] Every mutation notifies on both success and failure.

### RBAC affordances
- [ ] Action buttons hidden/disabled without the permission
      (`useAuth().hasPermission` / `PermissionGate`), not just hidden in nav.

### Responsiveness
- [ ] Tested at `xs`; rows of fields/cards stack.
- [ ] **No horizontal page scroll** — wide content scrolls in its own
      `overflow-x: auto` container.
- [ ] Breakpoint objects used; no fixed pixel layout widths; media `max-width: 100%`.
      Overlays full-width at `xs`, fixed from `sm`.

### Visual consistency
- [ ] Colors via CSS vars (`rgb(var(--rgb-primary))`) — no hardcoded hex.
- [ ] Status/role colors via shared helpers (e.g. `roleColor`).
- [ ] Typography via theme `variant`s, not ad-hoc `fontSize`.
- [ ] Icon sizes consistent within a context.

### Build gate
- [ ] `npm run build` passes and `npx tsc --noEmit` is clean.

## Reporting format

```
## Review: <surface>
| Item | Verdict | Where | Fix |
| ---- | ------- | ----- | --- |
| Empty state | ❌ Fail | UsersPage.tsx:74 | Render AVXDataTable empty slot with Create action |
| Field spacing | ⚠️ Check | UserFormDrawer.tsx:40 | Uses `& > * + *`; switch to flex `gap` |
Verdict: <ready / N blockers before done>
```

Prioritize Fails and the spacing/specificity + four-state items — the project's
most frequent regressions.
