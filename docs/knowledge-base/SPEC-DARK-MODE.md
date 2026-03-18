# Dark Mode Strategy and Specification

Date: 2026-03-17
Primary implementation files:
- `src/styles/semantics.css` (hand-tuned values)
- `src/styles/generated/figma-semantics-core.css` (generated, loads after, wins on conflict)

## 1. Runtime Contract

Only two runtime themes are supported:

1. `light`
2. `dark`

`useTheme.ts` migrates legacy `dark-*` persisted values into canonical `dark`.

## 2. Surface Hierarchy (Dark)

Linear darkening from primary. Each tier is +15 steps darker. Hover is -20 lighter.

- Content surface: `--surface-bg-primary` = `grey-910` (#161A24)
- Secondary: `--surface-bg-secondary` = `grey-925` (subtle=920, strong=935, hover=905)
- Tertiary: `--surface-bg-tertiary` = `grey-935` (#101219)
- Trim (chrome): `--surface-bg-trim` = `surface-bg-tertiary` (#101219, toggleable, see §8)
- Quaternary: `--surface-bg-quaternary` = `grey-945` (#0C0E15)
- Active: `--surface-bg-active` = `grey-860` (#202531)

### Foreground Hierarchy (Dark)

- `--surface-fg-primary`: `grey-50` (#F5F6F7)
- `--surface-fg-secondary`: `grey-300` (#9EA3AD)
- `--surface-fg-tertiary`: `grey-350` (#BCBEC3) — custom primitive
- `--surface-fg-quaternary`: `grey-400` (#717680)
- `--surface-fg-quinary`: `grey-500` (#535862)

## 3. Control Background Contract

All form inputs (text, select, checkbox, combobox, textarea) use `--control-bg-primary` family.
This token is aligned with `--surface-bg-tertiary` (both grey-935). Controls are differentiated
from surfaces by their borders, not their background fill.

- `--control-bg-primary` = `grey-935` (= surface-bg-tertiary)
- `--control-bg-primary-hover` = `grey-915` (−20 rule: 935−20=915)
- `--control-bg-primary-active` = `grey-860`
- `--control-bg-inset` = `grey-935` (recessed wrapper, e.g. mode toggle)

## 4. Navigation Contract

### Top Nav

- `--top-nav-bg`: `var(--primitives-theme-975)` (deepest brand)
- `--top-nav-fg`: `var(--surface-fg-primary)`
- `--top-nav-search-bg`: `var(--primitives-grey-910)`
- `--top-nav-search-bg-hover`: `var(--primitives-grey-880)`

### Left Nav Container (Desktop Sidebar)

- `--nav-bg`: `var(--surface-bg-secondary)` = grey-925 (darker than content area)

### Left Nav Group Rows (Desktop Sidebar Only)

Groups are lighter than the panel to show visual weight:

- `--nav-group-bg`: `grey-880` (lighter than 915 panel)
- `--nav-group-bg-hover`: `grey-860`
- `--nav-group-bg-selected`: `grey-880`
- `--nav-group-bg-selected-hover`: `grey-860`

### Enhanced TreeView

The enhanced TreeView uses `--surface-bg-primary`, NOT nav tokens.

### Mode Toggle

Uses `--nav-toggle-bg: var(--control-bg-inset)` (grey-935, recessed/darker than panel).

## 5. Control Border Softening

Dark mode borders stepped down to reduce harshness:

- `--control-border-secondary`: `grey-550` (#626771, ΔL=+0.330)
- `--control-border-secondary-hover`: `grey-400` (ΔL=+0.544, matches light mode resting)
- `--control-border-secondary-pressed`: `grey-400`
- `--control-border-selected`: `theme-600`
- `--control-border-selected-hover`: `theme-500`
- `--control-border-selected-pressed`: `theme-400`

## 6. Generated File Override Rule

`figma-semantics-core.css` loads after `semantics.css` in the same CSS `layer(tokens)`.
Any token defined in both files resolves to the generated file's value. When tuning tokens,
BOTH files must be updated or the change will be silently overridden.

## 7. New Primitives (March 17)

Custom primitives added to `primitives.css` and `figma-primitives-core.css`:

- `grey-350` / `neutral-350`: `#BCBEC3` (between 300 and 400, for fg-tertiary)
- `grey-895` / `neutral-895`: `#191E29` (for secondary_hover)
- `grey-925` / `neutral-925`: `#12151C` (new secondary — OKLCH balanced)
- `grey-935` / `neutral-940`: `#101219` (new tertiary — OKLCH balanced)
- `grey-945` / `neutral-955`: `#0C0E15` (for quaternary)
- `grey-800` updated: `#252B37` → `#2C313D` (OKLCH-balanced between 700 and 860)

## 8. Chrome Style Toggle (`surface-bg-trim`)

`--surface-bg-trim` is a token for chrome surfaces (panel headers, modal headers/footers).
Defaults to `surface-bg-tertiary`. An optional "elevated" mode sets it to `grey-910` in dark mode.

- Atom: `chromeStyleAtom` (`'default' | 'elevated'`)
- Toggle: hamburger menu "Chrome Style" section
- CSS: `[data-theme='dark'][data-chrome-style='elevated']` overrides `--surface-bg-trim`
- Sync: `Layout.tsx` useEffect → `data-chrome-style` attribute on `<html>`

## 9. Missed Count Mode

Default changed from `'checks'` (total missed checks) to `'rooms'` (number of rooms with missed checks).
Atom: `missedCountModeAtom` in `src/desktop-enhanced/atoms.ts`.

## 10. Verification Checklist

1. Toggle `light` / `dark` and verify:
   - Surface hierarchy visible: primary < secondary < tertiary (progressively darker)
   - Form controls match surface-bg-tertiary, distinguished by borders
   - Left-nav panel darker than content, groups lighter than panel
   - Top-nav is deepest brand chrome
   - Mode toggle wrapper is recessed (darker than panel)
   - fg-tertiary and fg-quaternary are legible (not too faint)
2. Chrome toggle: switch Default/Elevated, verify panel headers change
3. Run:
   - `npm run build`
   - `npm run audit:tokens`
