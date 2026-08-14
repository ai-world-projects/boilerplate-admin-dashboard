# UI/UX & Consistency Rules

These rules keep every page, form, and flow feeling like one product. Follow
them when building or reviewing any screen. They exist because most UI
complaints in this project are **consistency** problems — spacing, alignment,
and responsiveness that drift page to page — not missing features.

Treat this as a checklist: a page is not "done" until it passes the
[Definition of done](#definition-of-done) at the bottom.

## First principle: compose, don't re-style

The `AVX*` component library already encodes the correct look. **Reach for an
existing component before writing layout or overriding MUI.** New visual styling
in a page or feature is a smell — if a primitive is missing, add/extend an `AVX`
component so every screen benefits, rather than styling one page.

- Page chrome → `AVXPageHeader` (title + subtitle + actions).
- Tables → `AVXDataTable`. Inputs → `AVXTextField`. Search → `AVXSearchField`.
- Create/edit surfaces → `AVXFormDrawer`. Confirmations → `AVXConfirmDialog`.
- Stat/summary tiles → `AVXStatCard`. Unbuilt areas → `ComingSoon`.

## Spacing & alignment

- **Use the theme spacing scale, never magic pixels.** Spacing is `theme.spacing`
  multiples (MUI `gap`, `p`, `m`, `mt`, … take unit numbers: `2` = 16px). Do not
  hardcode `padding: '13px'`.
- **Page content padding is uniform** across pages (owned by `AppShell`/the page
  header). Don't add ad-hoc outer padding that makes one page inset differently.
- **Vertical rhythm inside a form/section uses one stacking gap**, applied by the
  container — not per-field margins sprinkled on each control. Fields keep their
  natural height; the parent owns the gaps.
- **Prefer flex `gap` over margins for spacing between siblings.** `gap` cannot be
  overridden by a child's own styles, so spacing stays predictable.
- ⚠️ **Specificity trap (this bit us):** an adjacent-sibling margin like
  `'& > * + *': { mt: 2.5 }` has the *same* CSS specificity as MUI's own
  component classes (`MuiTextField-root`, `MuiFormControl-root`), which emit
  `margin: 0`. MUI's rule is injected later, so it **wins the tie and zeroes your
  gap** — fields render flush with no spacing. If you must use a sibling-margin
  selector, raise specificity (emotion `'&& > * + *'`) or, better, use a flex
  container with `gap`.

## Forms & inputs

- **Full-width by default.** Inputs fill their column (`AVXTextField` already
  defaults `fullWidth`); don't leave inputs at intrinsic width inside a full-width
  form.
- **Group related fields on a row, stack on mobile:**
  `flexDirection: { xs: 'column', sm: 'row' }` with `gap`, each field
  `flex: 1, minWidth: 0` so long values don't blow out the row.
- **Every field has a label**, and error text uses the field's `helperText` /
  `error` props (RHF + Zod), never a separate ad-hoc error line.
- **Labels must not overlap.** Selects/inputs with a floating label need enough
  vertical gap above them; verify with a *filled* value (a floated label sits
  above the box and eats into the gap).
- Primary action is bottom-right, secondary (Cancel) to its left; disable both
  while submitting.

## Page structure & journeys

Every page follows the same skeleton so users always know where to look:

1. **`AVXPageHeader`** — title, one-line subtitle, primary action top-right.
2. **Filters/search row** (if the page lists data), consistent placement.
3. **Content** — table, form, or cards.

Handle **all four data states** explicitly — a page that only renders the happy
path is incomplete:

- **Loading** — skeleton or spinner, never a blank flash or layout jump.
- **Empty** — a friendly empty state with the primary action, not a bare table.
- **Error** — surfaced via the `notify` helper / `handleApiError`, not swallowed.
- **Success** — populated content.

Interaction rules:

- **Destructive actions confirm first** via `AVXConfirmDialog`.
- **Mutations give feedback** through `notify` (success and failure).
- **Optimistic-feeling lists**: use `keepPreviousData` so grids don't flash on
  page/filter changes.

## Responsiveness

- **Design mobile-first and test at `xs`.** Use MUI breakpoint objects
  (`{ xs, sm, md }`) rather than one fixed layout.
- **Nothing may cause horizontal page scroll.** Wide content (tables, code,
  diagrams) scrolls inside its own `overflow-x: auto` container.
- **Rows of fields/cards stack vertically on small screens.**
- Drawers/dialogs go **full-width on `xs`**, fixed width from `sm` up
  (`AVXFormDrawer` already does this — match it for new overlays).
- Use relative units and `max-width: 100%` on media; avoid fixed pixel widths on
  layout containers.

## Visual consistency

- **Colors come from the theme/palette**, read via CSS variables
  (`rgb(var(--rgb-primary))`) — never hardcode hex values in a component.
- Status/role colors go through the shared helpers (e.g. `roleColor`), so the
  same entity is the same color everywhere.
- Typography uses theme `variant`s (`h1`…`h6`, `body1`, …), not ad-hoc
  `fontSize`.
- Icons and their sizes are consistent within a context (all row actions the same
  size, etc.).

## Definition of done

Before calling a screen finished, verify:

- [ ] Built from `AVX*` components; no one-off restyling of MUI.
- [ ] Spacing uses the theme scale; consistent gaps, no flush/cramped controls.
- [ ] Labels/inputs aligned, nothing overlapping (checked with real/filled data).
- [ ] Loading, empty, error, and success states all handled.
- [ ] Destructive actions confirm; all mutations notify.
- [ ] Works at `xs` (mobile) with no horizontal scroll; rows stack.
- [ ] Colors/typography come from the theme, not hardcoded.
- [ ] `npm run build` passes.
