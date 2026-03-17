# Desktop Semantic Radii Layer

This document describes the semantic radius tokens used in the desktop project.

The canonical cross-project naming model is documented in
`design-tokens-canonical/reports/confluence-semantic-radius-tokens.md`.

## Design Philosophy

Rounded corners communicate component role and elevation:

- **Toolbars (16px)**: Floating action bars that sit above the UI.
- **Structural (12px)**: Root-level boundaries — Modals, Cards, Popovers, Menus.
- **Interactive (8px)**: Standard touch-points — Inputs, Buttons, Tooltips.
- **Dense/Subtle (6px)**: Nested or high-density elements — Badges, Small Buttons.

Popover containers use **concentric radii**: container radius = inner item radius + container padding.

---

## Canonical Semantic Tokens

All shared components use these canonical names. Defined in `semantics.css`.

### Control (interactive elements)

| Token | Points to | Resolved | Use |
|---|---|---|---|
| `--radius-control-input` | `var(--radius-md)` | 8px | Text inputs, selects, textareas |
| `--radius-control-button-xs` | `var(--radius-sm)` | 6px | Extra-small buttons |
| `--radius-control-button-sm` | `var(--radius-sm)` | 6px | Small buttons |
| `--radius-control-button-md` | `var(--radius-md)` | 8px | Standard buttons |
| `--radius-control-button-lg` | `var(--radius-lg)` | 10px | Large buttons |

### Surface (passive containers)

| Token | Points to | Resolved | Use |
|---|---|---|---|
| `--radius-surface-card` | `var(--radius-xl)` | 12px | Cards, list tiles, panels |
| `--radius-surface-modal` | `var(--radius-xl)` | 12px | Modals and sheets |
| `--radius-surface-toolbar` | `var(--radius-2xl)` | 16px | Floating action bars (BulkActionFooter) |
| `--radius-surface-popover` | `var(--radius-xl)` | 12px | Menus, dropdowns, context menus |
| `--radius-surface-tooltip` | `var(--radius-md)` | 8px | Tooltips and info popovers |
| `--radius-surface-badge` | `var(--radius-sm)` | 6px | Status badges, attribute chips |
| `--radius-surface-pill` | `var(--radius-full)` | 9999px | Fully rounded pills, avatars, tags |

---

## Legacy Names (Retired)

The following desktop-local names have been replaced by canonical tokens:

| Legacy Name | Replaced By |
|---|---|
| `--radius-toolbar` | `--radius-surface-toolbar` |
| `--radius-container` | `--radius-surface-popover` |
| `--radius-modal` | `--radius-surface-modal` |
| `--radius-card` | `--radius-surface-card` |
| `--radius-button-lg` | `--radius-control-button-lg` |
| `--radius-input` | `--radius-control-input` |
| `--radius-button-md` | `--radius-control-button-md` |
| `--radius-tooltip` | `--radius-surface-tooltip` |
| `--radius-button-sm` | `--radius-control-button-sm` |
| `--radius-button-xs` | `--radius-control-button-xs` |
| `--radius-badge` | `--radius-surface-badge` |
| `--radius-pill` | `--radius-surface-pill` |

---

## Usage Rules

1. All shared components use canonical semantic radius tokens.
2. Primitive radii are acceptable only for local, one-off work.
3. Do not use spacing tokens (`--spacing-*`) as radius values.
4. Bridge aliases (`--radius-3`, `--radius-s`) are migration-only — do not use in new code.
