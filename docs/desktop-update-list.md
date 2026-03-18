# Desktop Update List

Date: 2026-03-17
Project: safeguard-desktop

## Wrap-Up Status (Current)

This document tracks the implemented desktop token/state updates across the nav + dark-mode refinement passes.

## Completed (March 4 Pass)

1. Fixed generated spacing units in `src/styles/generated/figma-primitives-core.css` (`--spacing-*` now compile with `px`).
2. Unified panel-header semantics and applied in both left and right panel headers.
3. Normalized top-nav token usage (background, fg, divider, search states).
4. Refined left-nav semantics and wiring for section/subsection open state behavior:
   - Added `data-open` state in section/subsection components.
   - Standardized selected/open hover behavior through `--nav-group-*` and `--nav-item-*` tokens.
5. Added explicit mode-toggle semantic family (`--nav-toggle-*`).
6. Corrected light-mode left-nav surfaces to primary white.
7. Reduced dark-mode border harshness for controls.
8. Softened dark control visuals (checkbox borders, quick-filter inset shadow).

## Completed (March 17 Pass — Dark Mode Token Overhaul)

### Surface Hierarchy Redesign
9. Established 15-step surface hierarchy in dark mode:
   - `--surface-bg-primary`: grey-900 (base)
   - `--surface-bg-secondary`: grey-915 (subtle=910, strong=920, hover=895)
   - `--surface-bg-tertiary`: grey-930
   - `--surface-bg-quaternary`: grey-945
   - Hover states: -20 from resting value
10. Created new primitives `grey-895` and `grey-945` to support the hierarchy.

### Control-BG-Primary Migration
11. Aligned `--control-bg-primary` with `--surface-bg-tertiary` (grey-930).
12. Migrated ALL form controls from `surface-bg-primary` to `control-bg-primary`:
    - `forms.css` — text inputs, textareas, checkboxes (global base styles)
    - `DataTable.module.css` — table checkboxes
    - `Select.module.css` — select trigger
    - `ComboBox.module.css` — combobox input container
    - `MultiSelect.module.css` — multi-select trigger, checkbox indicator, clear button hover
    - `SearchableSelect.module.css` — search header
    - `AdvancedSearch.module.css` — input fields and select triggers
    - `SupervisorNoteModal.module.css` — textarea
    - `SegmentedControl.module.css` — segmented control items
    - `ColorSlider.module.css` — track wrapper and thumb
    - `DesktopToolbar.module.css` — search container and date input
    - `toggles.css` — toggle group items
    - `Switch.module.css` — disabled state (→ control-bg-disabled_subtle)

### New Token: control-bg-inset
13. Created `--control-bg-inset` token for recessed wrappers:
    - Light: `grey-50`
    - Dark: `grey-930`
14. Wired `--nav-toggle-bg` to `var(--control-bg-inset)` in both modes.

### Navigation Token Updates
15. Updated left nav container (`--nav-bg`) to `surface-bg-secondary` (grey-915 in dark).
16. Updated nav group backgrounds for visible contrast against panel:
    - `--nav-group-bg` (dark): grey-880 (lighter than 915 panel)
    - `--nav-group-bg-hover` (dark): grey-860
    - `--nav-group-bg-selected` (dark): grey-880
    - `--nav-group-bg-selected-hover` (dark): grey-860
17. Changed nav groups from theme-tinted to neutral grey in dark mode.

### Enhanced TreeView Separation
18. Changed enhanced TreeView panel from `--nav-bg` to `--surface-bg-primary`.
    - `Layout.module.css` `.leftPanelWrapper`: surface-bg-primary
    - `NavigationPanel.module.css` `.navPanel`: surface-bg-primary

### Generated File Alignment
19. Updated `figma-semantics-core.css` dark block to match all surface and control token changes.
    - Surface hierarchy (primary/secondary/tertiary/quaternary) aligned
    - control-bg-primary aligned to grey-930

### Foreground Brightness Tuning
20. Brightened `--surface-fg-tertiary` in dark mode: `grey-350` (#BCBEC3) — custom primitive.
21. Brightened `--surface-fg-quaternary` in dark mode: `grey-400` (#717680).
22. Created new primitive `grey-350` / `neutral-350` (#BCBEC3) in both `primitives.css` and `figma-primitives-core.css`.

### Chrome Style Toggle (surface-bg-trim)
23. Created `--surface-bg-trim` token for chrome surfaces (panel headers, modal headers/footers):
    - Light: = `surface-bg-tertiary`
    - Dark default: = `surface-bg-tertiary` (grey-935)
    - Dark elevated: = `grey-910` (#161A24, matches surface-bg-primary)
    - CSS override: `[data-theme='dark'][data-chrome-style='elevated']` in `semantics.css`
    - Consumers: `NavigationPanel.module.css`, `DetailPanel.module.css`, `SettingsNavigationPanel.module.css`, `modal.css`
24. Created `chromeStyleAtom` (`'default' | 'elevated'`) in `src/desktop-enhanced/atoms.ts`.
25. Added "Chrome Style" toggle to `TopNavMenu.tsx` hamburger menu.
26. Added `data-chrome-style` attribute sync via useEffect in `Layout.tsx`.

### Missed Count Mode Default
27. Changed `missedCountModeAtom` default from `'checks'` to `'rooms'`.


## Completed (March 18 Pass — Control, Border & Ramp Refinements)

### Hover State Corrections (coherent with -20 rule)
28. Fixed `--control-bg-primary-hover`: grey-880 → grey-915 (rule: 935−20=915, ΔL=+0.030)
29. Fixed `--control-bg-secondary-hover` (dark): grey-890 → grey-905 (rule: 925−20=905, ΔL=+0.030)
30. Fixed `--control-bg-secondary-pressed` (dark): grey-880 → grey-860 (avoids collision with hover)
31. Fixed TreeView row hover: `surface-bg-secondary_hover` → `surface-bg-primary_hover` (items sit on primary, correct -20 token)

### Control-BG-Secondary Model Fix
32. Changed `--control-bg-secondary` (dark): grey-905 → grey-925 (= surface-bg-secondary)
    - Was LIGHTER than surface-bg-primary (wrong) — now correctly DARKER, matching light mode direction
    - Hover chain: rest=925 → hover=905 → pressed=860

### Border Strengthening (dark mode)
33. Added new primitive `grey-550` / `neutral-550`: #626771 (midpoint between 600 and 500)
34. `--control-border-secondary` (dark): grey-600 → grey-550 (ΔL +0.330, "a pinch stronger")
35. `--control-border-secondary-hover` (dark): grey-500 → grey-400 (ΔL +0.544, "more than a pinch", matches light mode resting strength)
36. `--control-border-secondary-pressed` (dark): grey-500 → grey-400

### Light Mode Border Hierarchy Fix
37. Fixed surface-border hierarchy ordering (was inverted: secondary was more subtle than tertiary):
    - `--surface-border-secondary`: restored to grey-200 (ΔL=−0.090 vs white, medium)
    - `--surface-border-tertiary`: restored to grey-100 (ΔL=−0.058 vs white, most subtle)
    - New ordering: primary(−0.124) > secondary(−0.090) > tertiary(−0.058) ✓

### Light Grey Scale Fix (100/120/200)
38. Fixed grey-200 (#E9E9EB → #E0E1E3): was LIGHTER than grey-100, now correctly darker
39. Updated grey-100 (#E2E2E4 → #EBECEC): adjusted to form proper 50→300 ramp
40. Updated grey-120 (#DDDDDD → #E9E9EA): repositioned between new 100 and 200
    - Scale now monotonically darkens: 100 (L=0.942) → 120 (L=0.934) → 200 (L=0.910) → 300 (L=0.876)

## Current Visual Baseline

1. Light mode:
   - Content area and tree panel: white (surface-bg-primary)
   - Left-nav sidebar: white with grey-50 group headers
   - Form controls: white with 1px borders
   - Top-nav: brand section blue
   - Panel headers / modal chrome: surface-bg-trim (= surface-bg-tertiary)
2. Dark mode:
   - Content area and tree panel: grey-910 (surface-bg-primary)
   - Left-nav sidebar: grey-925 (surface-bg-secondary), groups grey-880
   - Form controls: grey-935 (= surface-bg-tertiary), differentiated by borders
   - Table deadspace: grey-935 (surface-bg-tertiary)
   - Table rows: grey-920 (surface-bg-secondary_subtle)
   - Mode toggle wrapper: grey-935 (control-bg-inset, recessed)
   - Panel headers / modal chrome: surface-bg-trim (default=grey-935, elevated=grey-910)
   - Top-nav: deepest brand (theme-975)
   - Text: fg-primary=grey-50, fg-secondary=grey-300, fg-tertiary=grey-350, fg-quaternary=grey-400

## Known Issue: Generated File Override

`figma-semantics-core.css` loads after `semantics.css` in the same `layer(tokens)`. Any token
defined in both files resolves to the generated value. Both files MUST be updated in tandem.

## Verification

1. `npm run build` passes after each major token pass.
2. `npm run audit:tokens` for token sync/drift.
3. Visual toggle light/dark to verify hierarchy.
4. Chrome toggle: switch Default/Elevated in hamburger menu, verify panel headers.
