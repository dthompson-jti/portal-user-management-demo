# Desktop Update List

Date: 2026-03-04
Project: safeguard-desktop

## Wrap-Up Status (Current)

This document tracks the implemented desktop token/state updates that were finalized during the nav + dark-mode refinement pass.

## Completed

1. Fixed generated spacing units in `src/styles/generated/figma-primitives-core.css` (`--spacing-*` now compile with `px`).
2. Unified panel-header semantics and applied in both left and right panel headers (`--panel-header-bg` in `NavigationPanel` and `DetailPanel`).
3. Normalized top-nav token usage (background, fg, divider, search states) and wired `TopNav.module.css` divider to `--top-nav-divider`.
4. Refined left-nav semantics and wiring for section/subsection open state behavior:
   - Added `data-open` state in section/subsection components.
   - Standardized selected/open hover behavior through `--nav-group-*` and `--nav-item-*` tokens.
5. Added explicit mode-toggle semantic family and migrated `ModeToggle` to token-driven styling:
   - `--nav-toggle-bg`
   - `--nav-toggle-border`
   - `--nav-toggle-fg`
   - `--nav-toggle-pill-bg`
   - `--nav-toggle-pill-fg`
   - `--nav-toggle-pill-shadow`
6. Corrected light-mode left-nav surfaces so white/primary areas remain consistent:
   - `--panel-header-bg` (light) -> `--surface-bg-primary`
   - `--nav-group-*` and `--nav-item-bg-hover` (light) now map to primary/primary-hover.
7. Corrected dark-mode left-nav container mismatch:
   - `--nav-bg` (dark) now matches panel surface (`--surface-bg-primary`).
8. Darkened/nav-branded dark mode chrome per review:
   - `--top-nav-bg` (dark) -> `--primitives-theme-975`
   - `--nav-group-bg` (dark) -> `--primitives-theme-950`
   - `--nav-group-bg-hover` (dark) -> `--primitives-theme-900`
   - `--nav-group-bg-selected` (dark) -> `--primitives-theme-950`
   - `--nav-group-bg-selected-hover` (dark) -> `--primitives-theme-900`
9. Reduced dark-mode border harshness for controls:
   - `--control-border-secondary` / hover / pressed stepped down.
   - `--control-border-selected` / hover / pressed stepped down.
10. Softened dark control visuals:
   - Checkbox hover/checked borders standardized to 1px in `forms.css` and `DataTable.module.css`.
   - Quick-filter lower-lip inset shadow reduced in `FilterSelect.module.css` and `MultiSelect.module.css`.

## Current Visual Baseline

1. Light mode:
   - Left-nav and panel surfaces align on primary white.
   - Top-nav remains brand section blue.
2. Dark mode:
   - Top-nav is deepest brand shade (`theme-975`).
   - Left-nav container aligns with panel primary surface.
   - Group rows use dark brand tokens (`theme-950` / `theme-900`).

## Verification

1. `npm run build` passes after each major token pass.
2. `npm run audit:tokens` currently reports:
   - canonical sync issues: `0`
   - unresolved token usages: `0`
   - raw geometry literal findings: `16`
3. `docs/token-audit-report.md` is the source of truth for current token sync/drift summary.
