# Journal Design System: Dark Mode Specification

Date: 2026-03-17
Source of truth: `src/styles/semantics.css` (`[data-theme='dark']`)
Override layer: `src/styles/generated/figma-semantics-core.css` (loads after, wins on conflict)

## 1. Core Philosophy

Dark mode uses a linear darkening model:

1. `surface-bg-primary` (grey-910) is the base content surface.
2. Secondary/tertiary/quaternary step progressively darker in 15-step increments.
3. Controls (`control-bg-primary`) align with `surface-bg-tertiary` and are differentiated by borders.
4. Hover states are 20 steps lighter (lower number) than their resting state.
5. Chrome regions (top-nav, nav groups) use dedicated token families.

## 2. Surface Stack

OKLCH-balanced hierarchy. Primary at grey-910, tiers spaced for even perceptual ΔL (~0.022–0.026 per step).

| Semantic Token | Primitive | Hex | Rule |
| --- | --- | --- | --- |
| `--surface-bg-primary` | `grey-910` | `#161A24` | Base |
| `--surface-bg-primary_hover` | `grey-890` | `#1A1F2A` | Base -20 |
| `--surface-bg-secondary` | `grey-925` | `#12151C` | Base +15 (OKLCH-balanced) |
| `--surface-bg-secondary_subtle` | `grey-920` | `#141820` | Between prim & sec |
| `--surface-bg-secondary_strong` | `grey-935` | `#101219` | Between sec & tert |
| `--surface-bg-secondary_hover` | `grey-905` | `#171C26` | Secondary lighter |
| `--surface-bg-tertiary` | `grey-935` | `#101219` | +10 (chrome-compensated) |
| `--surface-bg-trim` | = `surface-bg-tertiary` | `#101219` | Chrome surfaces (see §8) |
| `--surface-bg-quaternary` | `grey-945` | `#0C0E15` | +10 (chrome-compensated) |
| `--surface-bg-active` | `grey-860` | `#202531` | Selection highlight |

## 3. Control Backgrounds

Form inputs (text, select, checkbox, combobox, textarea) use the `control-bg-primary` family.
This token aligns with `surface-bg-tertiary` so controls are visually recessed on primary surfaces
and differentiated by their borders.

| Token | Primitive | Hex | Purpose |
| --- | --- | --- | --- |
| `--control-bg-primary` | `grey-935` | `#101219` | = surface-bg-tertiary |
| `--control-bg-primary-hover` | `grey-915` | `#151922` | Hover state (-20 rule) |
| `--control-bg-primary-active` | `grey-860` | `#202531` | Active/focus state |
| `--control-bg-inset` | `grey-935` | `#101219` | Recessed wrapper (toggle pill) |

## 4. Navigation Chrome

### Top Navigation

| Token | Value | Intent |
| --- | --- | --- |
| `--top-nav-bg` | `theme-975` | Deepest brand chrome |
| `--top-nav-fg` | `surface-fg-primary` | Primary text/icons |
| `--top-nav-search-bg` | `grey-910` | Recessed search field |
| `--top-nav-search-bg-hover` | `grey-880` | Hover elevation cue |

### Left Navigation Container (Desktop Sidebar)

| Token | Value | Intent |
| --- | --- | --- |
| `--nav-bg` | `surface-bg-secondary` (= grey-925) | Slightly darker than content |
| `--nav-surface-border` | `surface-border-secondary` | Subtle separator |

### Left Navigation Groups (Desktop Sidebar Only)

Groups are lighter than the nav panel to create visible weight/hierarchy.

| Token | Value | Hex | Intent |
| --- | --- | --- | --- |
| `--nav-group-bg` | `grey-880` | `#1C212C` | Group row base (lighter than 915 panel) |
| `--nav-group-bg-hover` | `grey-860` | `#202531` | Group hover |
| `--nav-group-bg-selected` | `grey-880` | `#1C212C` | Open state = base |
| `--nav-group-bg-selected-hover` | `grey-860` | `#202531` | Open + hover |

Note: The enhanced TreeView does NOT use nav tokens. It uses `surface-bg-primary`.

### Mode Toggle (Historical / Live)

Uses dedicated `--nav-toggle-*` tokens with `--control-bg-inset` as wrapper background:

- `--nav-toggle-bg`: `var(--control-bg-inset)` (grey-935, darker/recessed)
- `--nav-toggle-border`: `var(--surface-border-tertiary)`
- `--nav-toggle-fg`: `var(--surface-fg-secondary)`
- `--nav-toggle-pill-bg`: `var(--control-bg-primary-active)`
- `--nav-toggle-pill-fg`: `var(--surface-fg-primary)`
- `--nav-toggle-pill-shadow`: `var(--surface-shadow-sm)`

## 5. Foreground Tokens

Dark mode foreground uses a stepped-down grey scale for text hierarchy:

| Token | Primitive | Hex | Purpose |
| --- | --- | --- | --- |
| `--surface-fg-primary` | `grey-50` | `#F5F6F7` | Primary text |
| `--surface-fg-secondary` | `grey-300` | `#9EA3AD` | Secondary text |
| `--surface-fg-tertiary` | `grey-350` | `#BCBEC3` | Tertiary text (brightened) |
| `--surface-fg-quaternary` | `grey-400` | `#717680` | Quaternary text (brightened) |
| `--surface-fg-quinary` | `grey-500` | `#535862` | Faintest text |

Note: `grey-350` (#BCBEC3) is a custom primitive added between 300 and 400 to allow finer
control over the tertiary/quaternary text contrast in dark mode.

## 6. Border Intensity Step-Down

To reduce border harshness on dark surfaces:

- `--control-border-secondary`: `grey-550` (#626771, ΔL=+0.330 vs control bg)
- `--control-border-secondary-hover`: `grey-400` (#A3A7AE, ΔL=+0.544 — matches light mode resting strength)
- `--control-border-secondary-pressed`: `grey-400`
- `--control-border-selected`: `theme-600`
- `--control-border-selected-hover`: `theme-500`
- `--control-border-selected-pressed`: `theme-400`

## 7. Generated File Override Warning

`figma-semantics-core.css` loads after `semantics.css` in the same `layer(tokens)`. Any token
defined in both files will resolve to the generated file's value. When tuning dark mode tokens:

1. Update BOTH `semantics.css` AND `figma-semantics-core.css`
2. The generated file uses `primitives-neutral-*`; semantics uses `primitives-grey-*` (aliased equivalents)
3. Run token audit after changes to detect drift

## 8. Chrome Style Toggle (`surface-bg-trim`)

`--surface-bg-trim` is a dedicated token for chrome surfaces: panel headers, modal headers/footers.
It defaults to `surface-bg-tertiary` in both light and dark modes.

An optional "elevated" chrome style sets trim to `grey-910` in dark mode (matching `surface-bg-primary`),
making headers blend with the content surface instead of appearing recessed.

### Implementation

- **Atom**: `chromeStyleAtom` in `src/desktop-enhanced/atoms.ts` (`'default' | 'elevated'`)
- **Toggle**: "Chrome Style" section in `TopNavMenu.tsx` hamburger menu
- **CSS**: `[data-theme='dark'][data-chrome-style='elevated']` selector in `semantics.css`
- **Sync**: `Layout.tsx` useEffect sets `data-chrome-style` attribute on `<html>`

### Token values

| Mode | Chrome Style | `--surface-bg-trim` resolves to |
| --- | --- | --- |
| Light | any | `surface-bg-tertiary` (grey-50 area) |
| Dark | default | `surface-bg-tertiary` = grey-935 (#101219) |
| Dark | elevated | `grey-910` (#161A24) = surface-bg-primary |

### Consumers

- `NavigationPanel.module.css` `.header`
- `DetailPanel.module.css` `.header`
- `SettingsNavigationPanel.module.css` `.header`
- `modal.css` `.modal-header`, `.modal-footer`

## 9. Theme Model

Supported runtime themes:

1. `light` (default)
2. `dark` (canonical dark)

Legacy values (`dark-a`, `dark-b`, `dark-c`) are migrated to `dark` by `useTheme.ts`.

## 10. Verification

1. Build: `npm run build`
2. Token sync/drift: `npm run audit:tokens` -> `docs/token-audit-report.md`
3. Visual check: toggle light/dark and verify surface hierarchy, control contrast, nav chrome
4. Chrome toggle: switch between Default/Elevated in hamburger menu, verify panel headers change
