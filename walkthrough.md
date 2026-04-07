# Project Walkthrough

This repository is not a single linear app. It is a prototype workspace that currently combines:

1. An older Safety Check desktop prototype.
2. A newer enhanced shell that hosts both Safety Check views and Portal Management experiments.
3. Two settings-navigation experiments.

The most important thing to know is that the default runtime is the enhanced shell, not the older desktop app.

## Runtime Entry

- [`src/main.tsx`](src/main.tsx) mounts `DesktopEnhancedApp` by default.
- If the URL path contains `alternate`, [`src/main.tsx`](src/main.tsx) mounts the legacy [`src/desktop/App.tsx`](src/desktop/App.tsx) instead.
- `activePageAtom` in [`src/data/activePageAtom.ts`](src/data/activePageAtom.ts) controls which prototype surface is shown inside the enhanced shell.

## Primary Shells

### 1. Legacy Desktop

[`src/desktop/App.tsx`](src/desktop/App.tsx)

This is the original Safety Check supervisor workflow: header, toolbar, live/historical tables, modals, and a right-side detail panel. It still matters because some shared controls, table patterns, and review docs were written against this version.

### 2. Desktop Enhanced

[`src/desktop-enhanced/DesktopEnhancedApp.tsx`](src/desktop-enhanced/DesktopEnhancedApp.tsx)

This is the active shell used by the repo today. It adds:

- top navigation
- left sidebar navigation
- optional secondary left panel
- portal-management variants
- settings variants
- enhanced Safety Check views

The enhanced shell is now the main host for nearly all current experimentation.

## Portal Management Versions

These are exposed directly in the sidebar in [`src/desktop/components/SideBar/SideBar.tsx`](src/desktop/components/SideBar/SideBar.tsx).

| Variant | Page id | Current shape |
| --- | --- | --- |
| A1 | `portal-email-search` | Exact-match email search using the shared omnisearch component locked to email mode. |
| A2 | `portal-case-search` | Exact-match case search locked to case mode. |
| A3 | `portal-case-example` | Case-scoped management view for a fixed case number, using the case access manager. |
| A5 | `portal-omnisearch` | Flexible search-first variant that auto-detects email vs case and changes table columns accordingly. |
| B1 | `portal-email-search-partial` | Partial-match email search with email-first result layout. |
| B2 | `portal-case-search-partial` | Partial-match case search with case-first result layout. |
| B3 | `portal-access-ledger` | Sticky-search audit view with row inspection via a dedicated side panel. |
| B4 | `portal-access` | Index-pattern style global access list with quick search, advanced filters, and bulk actions. |
| C1 | `portal-split-pane` | Split-pane browse/detail prototype. The shipped version is broader than the original spec because it supports browsing by either case or email. |

Notes:

- `A4` does not exist in code; the numbering follows earlier concept naming.
- Most portal variants share the same underlying mock records from `src/desktop-enhanced/data/portalMockData.ts`.
- The differences are mostly about search strategy, density, navigation, and context framing rather than different backend models.

## Settings Versions

Two settings concepts are currently present:

| Variant | Page id | Current shape |
| --- | --- | --- |
| Tree settings | `settings` | Split layout with a left settings tree, breadcrumbs, and a single implemented form (`Safety Check`). |
| Tab settings | `settings-tabs` | Alternate prototype that flattens the structure into tabs. |

The settings work is real but still partial:

- page-level routing is implemented
- the tree and tab shells are implemented
- only the `Safety Check` form is meaningfully filled in
- most other settings nodes still render placeholders

## Safety Check State

The Safety Check prototype still exists in two layers:

- the legacy desktop app
- the enhanced shell's `checks` page with tree navigation and enhanced views

That means older Safety Check plans are not necessarily wrong, but many of them describe an earlier project center of gravity. When reading docs, treat Safety Check material as background unless it clearly maps to the enhanced shell or the still-live settings/checks code.

## How To Read The Docs Now

- Start with [`README.md`](README.md) for the repo summary.
- Use [`docs/working/README.md`](docs/working/README.md) to see which working docs are current, partial, exploratory, or legacy.
- Use [`docs/archive/working-wrapped/README.md`](docs/archive/working-wrapped/README.md) for wrapped and superseded former working docs.
- Use [`docs/knowledge-base/REFERENCE-PORTAL-VARIANTS-AND-OPTIONS.md`](docs/knowledge-base/REFERENCE-PORTAL-VARIANTS-AND-OPTIONS.md) for the current-state variant matrix, menu options, terminology snapshot, and UX scoring.
- Use `docs/archive/` for older plans and completed historical work.

## Current Takeaway

The repo is best understood as an enhanced prototype shell that now centers on portal access management, while still carrying substantial Safety Check legacy code and documentation. The documentation cleanup work is mainly about making that split explicit so current portal/settings work is easy to find and older planning material is not mistaken for the current source of truth.
