# Portal Management Prototype Lab

This repository is a prototype workspace for two overlapping tracks:

1. A legacy Safety Check desktop prototype.
2. A newer portal access management prototype built inside the enhanced desktop shell.

The repo is mock-data driven, intentionally exploratory, and includes several side-by-side UI variants used for internal comparison rather than a single finished product.

## Current App Structure

- The default app entry in [`src/main.tsx`](src/main.tsx) mounts `DesktopEnhancedApp`.
- The legacy desktop app in [`src/desktop/App.tsx`](src/desktop/App.tsx) is still available through the `/alternate` pathname check in [`src/main.tsx`](src/main.tsx).
- The enhanced shell combines:
  - Safety Check monitoring views (`live` and `historical`)
  - Portal Management variants (`A1` to `C1`)
  - Two settings prototypes (`System Properties` and `System Properties (Tabs)`)

The default `activePageAtom` value is `portal-email-search`, so the repo currently opens on the first portal-management variant rather than the Safety Check screens.

## Version Guide

| Surface | Entry point | What it is |
| --- | --- | --- |
| Legacy Desktop | `src/desktop/App.tsx` | Original Safety Check desktop table workflow with header tabs, toolbar, and right detail panel. |
| Desktop Enhanced | `src/desktop-enhanced/DesktopEnhancedApp.tsx` | The main shell used today. Adds top nav, sidebar navigation, portal-management variants, and settings experiments. |
| Settings: Tree | `activePage = 'settings'` | Split layout with a dedicated settings tree and one implemented form (`Safety Check`). |
| Settings: Tabs | `activePage = 'settings-tabs'` | Alternate settings prototype using horizontal tabs instead of left-tree navigation. |
| Portal A-series | `portal-email-search`, `portal-case-search`, `portal-case-example`, `portal-omnisearch` | Search-first and case-first management concepts. |
| Portal B-series | `portal-email-search-partial`, `portal-case-search-partial`, `portal-access-ledger`, `portal-access` | Partial-match search, audit/ledger, and index-pattern variants. |
| Portal C-series | `portal-split-pane` | Split-pane browse-and-detail prototype that combines a browse list with inline case/email detail. |

Notes:

- The original concept numbering is preserved in the sidebar, so `A4` is intentionally absent.
- Most portal variants share the same mock dataset and differ mainly in search behavior, presentation, and navigation model.

## Repo Layout

- `src/desktop/`: Legacy Safety Check desktop app.
- `src/desktop-enhanced/`: Enhanced shell, portal prototypes, and upgraded checks views.
- `src/features/settings/`: Settings feature prototypes.
- `src/components/`: Shared UI primitives.
- `src/data/`: Atoms, hooks, and shared state.
- `docs/working/`: Active and recently active working notes, now indexed by status.
- `docs/archive/`: Older plans, wrapped working docs, audits, and completed historical material.

## Documentation Map

- [`walkthrough.md`](walkthrough.md): current walkthrough of the project structure and version set.
- [`docs/working/README.md`](docs/working/README.md): status board for the working docs, including what is implemented, partial, exploratory, or legacy.
- [`docs/archive/working-wrapped/README.md`](docs/archive/working-wrapped/README.md): wrapped tickets and superseded planning docs that are no longer active.
- [`docs/knowledge-base/REFERENCE-PORTAL-VARIANTS-AND-OPTIONS.md`](docs/knowledge-base/REFERENCE-PORTAL-VARIANTS-AND-OPTIONS.md): detailed current-state comparison of portal variants, IA patterns, toggles, and UX scoring.
- `docs/knowledge-base/`: longer-form reference material and older background specs.
- `docs/archive/`: historical material that is no longer the best starting point.

## Getting Started

```bash
npm install
npm run dev
npm run build
```
