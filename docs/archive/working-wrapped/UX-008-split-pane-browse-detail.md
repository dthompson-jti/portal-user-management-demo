# UX-008 — Split-Pane: Global Browse + Case Detail

> Status note (2026-04-06): A split-pane prototype now exists as `C1`, but the shipped version is broader than this exact spec. It supports browsing by either case or email and reuses more of the existing portal-management scaffolding than this document originally proposed.

**Type:** UX Exploration / Prototype Build
**Priority:** Medium
**Source:** UX-007 Concept 7; addresses UX-001 (global-to-case navigation gap)
**Date:** 2026-04-06

---

## Mental Model

"Let me browse the global list on the left, and see the full case access picture on the right when I click into one."

A two-panel layout where the **left pane** is a compact, searchable case list and the **right pane** is the full Case Access Manager for the selected case. The officer browses, clicks, reviews, acts, and moves to the next case — without navigating away.

This is the navigation bridge identified in UX-001, made structural: instead of a link between two separate pages, the two views are permanently co-located.

---

## What This Concept Tests

1. **Is co-location more efficient than separate pages?** The current prototype requires navigating between the global list (B3/B4) and the case view (A3) as distinct routes. This concept eliminates that transition.

2. **Does persistent global context help or hurt?** Officers who work across cases may benefit from seeing the case list while managing a single case. Officers who focus deeply on one case may find the left pane distracting.

3. **Can the Case Access Manager work in a reduced-width pane?** The current A3 view is full-width (~1000px+). In a split layout, it must function in ~650–750px while remaining usable for Grant/Revoke operations.

---

## Left Pane — Case List

The left pane presents a **compact case-level summary** — not individual access records. This is a different data shape than the existing B3/B4 tables (which show one row per access record). Here, each row represents **one case** with aggregated access metadata.

### Columns

| Column | Width | Content |
|---|---|---|
| Case Number | ~120px | e.g., `CIV-24-0000016` — clickable, selects the case |
| Case Name | flex | Truncated with tooltip, e.g., `Schlauderheide v Smith` |
| Access Summary | ~100px | Compact indicator: `5 / 8` (5 with access, 8 total parties) or status dot |

The Access Summary column is the key differentiator from a standard case list. It tells the officer at a glance whether a case needs attention — a ratio like `5 / 8` signals that 3 parties are missing access.

### Search & Filters

- **Quick search** at the top: filters by case number or case name (partial match).
- **Optional status filter**: "All", "Cases with missing access", "Cases fully provisioned". This lets the officer focus on cases that need work.
- No advanced search panel in the left pane — keep it lean. Officers who need complex cross-field search should use B4 (Index Pattern).

### Selection Behavior

- Single-click on a row selects the case and loads it in the right pane.
- The selected row stays highlighted while the officer works in the right pane.
- Clicking a different row in the left pane swaps the right pane content. If the officer has an unsaved selection (bulk checkboxes) in the right pane, show a lightweight confirmation: "You have X records selected. Switch case?" — or simply clear the selection without confirmation (lower friction, revisit based on testing).

### Empty / Default State

When no case is selected, the right pane shows a centered prompt: "Select a case to manage portal access." This mirrors the existing detail panel empty state pattern in `AccessLedgerDetailPanel.tsx`.

---

## Right Pane — Case Access Manager

The right pane renders the **Case Access Manager** (currently `PortalCaseAccessManager.tsx`) for the selected case. The content is the same: case header, summary badges, accordion sections (Active Portal Users / Missing Access: Parties / Missing Access: Case Assignments), with per-row and bulk Grant/Revoke actions.

### Adaptations for Reduced Width

The current Case Access Manager is full-width. In a split layout with the left pane taking ~300px, the right pane has ~650–750px. Key adaptations:

1. **Case header:** Compact the toolbar row. The current `CaseHeader` renders a full toolbar with split buttons (Summary, Parties, Documents, etc.) that are not relevant to portal access management. In the split-pane context, show only the case metadata (number, name, court, type) — the toolbar tabs are navigation for the full case view, not the access management view.

2. **Summary badges:** These already render compactly. No change needed.

3. **Accordion tables:** The `PortalDataTable` component already supports `densityMode: 'quick-actions'` which hides checkboxes and shows inline action buttons — well-suited for narrower widths. For the split pane, consider defaulting to `quick-actions` mode and keeping `compact` (with bulk checkboxes) as a toggle.

4. **Column visibility:** At ~650px, the table should hide lower-priority columns. Priority order:
   - Always show: Email, Access Status, Action button
   - Show if space permits: Case Participant Role
   - Hide: Access Type, Portal Role (available in a row expansion or detail click)

5. **Pagination:** Reduce default page size from 10 to 5–7 rows to minimize scrolling within the right pane.

---

## Layout & Resize

### Structure

```
splitPaneContainer (display: flex; flex-direction: row; flex: 1; overflow: hidden)
├── leftPane (width: var(--left-pane-width); min-width: 280px; max-width: 400px)
│   ├── searchBar
│   └── caseListTable (overflow-y: auto)
├── resizeHandle (width: 9px; cursor: col-resize)
└── rightPane (flex: 1; min-width: 500px; overflow-y: auto)
    └── PortalCaseAccessManager | EmptyState
```

### Resize

Follow the existing resize pattern used in `AccessLedgerDetailPanel.tsx` and `Layout.tsx`:
- `onMouseDown` on the handle → global `mousemove`/`mouseup` listeners
- CSS variable `--left-pane-width` updated during drag
- Width committed to Jotai atom (`splitPaneWidthAtom`) on `mouseup`
- Transitions disabled during active drag
- Clamped between 280px (min, enough for case number + truncated name) and 400px (max, before the right pane gets too narrow)

### Animation

When a case is selected for the first time (right pane goes from empty state to content), use the existing Framer Motion tween:
```
transition: { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.3 }
```

Subsequent case switches: crossfade or instant swap (no slide animation — the pane is already open).

---

## Data Shape

The left pane requires a **case-level aggregation** that does not currently exist as a first-class data structure. The existing data model (`PortalAccessRecord`) is record-level — one row per person-case-access combination.

### Derivation

Group `PortalAccessRecord[]` by `caseNumber` to produce:

```typescript
interface CaseAccessSummary {
  caseNumber: string;
  caseName: string;
  caseType: 'Civil' | 'Criminal' | 'Juvenile';
  totalParties: number;         // count of distinct participants (from eSeries case data)
  withAccess: number;           // count with status === 'Active'
  withoutAccess: number;        // totalParties - withAccess
  hasAnomalies: boolean;        // e.g., revoked records that may need re-granting
}
```

Note: `totalParties` requires the same cross-system lookup flagged in UX-003 — the Portal API knows who has access, but the full party list comes from eSeries case data. For the prototype, derive this from the mock data's `accessGroup` field which already distinguishes "with access", "parties without", and "assignments without".

---

## Interaction Flows

### Flow 1 — Officer investigating a specific case

1. Officer opens the split-pane view.
2. Types "CIV-24" in the left-pane search. List filters to matching cases.
3. Clicks `CIV-24-0000016`. Right pane loads the Case Access Manager.
4. Scans the summary badges: "5 Portal access · 3 No Portal access."
5. Opens the "Missing Access: Parties" accordion. Selects 2 parties. Clicks "Grant."
6. Confirmation modal → confirms → toast: "Access granted for 2 records."
7. Summary badges update: "7 Portal access · 1 No Portal access."
8. Left-pane row for `CIV-24-0000016` updates its access summary: `7 / 8`.

### Flow 2 — Officer triaging across cases

1. Officer opens the split-pane view. Filters left pane to "Cases with missing access."
2. Left pane shows 4 cases. Officer clicks the first one.
3. Reviews the case in the right pane. Grants access where needed.
4. Clicks the next case in the left pane. Right pane swaps instantly.
5. Repeats until all 4 cases are resolved.
6. Changes the left-pane filter to "All." Confirms no remaining gaps.

### Flow 3 — Officer responding to an inquiry

1. A solicitor calls about their access to a case.
2. Officer types the case number in the left-pane search. Clicks the case.
3. Scans the right-pane accordions: finds the solicitor in "Active Portal Users." Confirms access is active.
4. Reports back to the solicitor.
5. While on the call, the solicitor mentions a second case. Officer types the new case number, clicks it. Right pane swaps. Confirms access on that case too.

---

## What This Replaces / Overlaps

| Existing variant | Relationship |
|---|---|
| A3 (Case Example) | The right pane **is** A3, embedded in a split layout. A3 as a standalone route remains useful for deep-link / direct-navigation scenarios. |
| B3 (Access Ledger) | The left pane serves a similar "browse all records" purpose, but at the case level rather than the record level. B3 remains the audit/record-level view. |
| B4 (Index Pattern) | B4's advanced search is more powerful than the left pane's quick search. B4 remains the power-user search tool. This concept is for case-level browsing, not record-level investigation. |
| UX-001 (Navigation link) | This concept solves the same problem structurally. If this concept ships, UX-001's clickable case numbers are still valuable for B3/B4 but no longer the primary global-to-case bridge. |

---

## Scope

### New files
- `src/desktop-enhanced/components/PortalSplitPane.tsx` — the split-pane container with left list + right detail
- `src/desktop-enhanced/components/CaseListPane.tsx` — compact case-level list with search and filter
- `src/desktop-enhanced/atoms.ts` — add `splitPaneWidthAtom`, `selectedCaseAtom`

### Modified files
- `src/desktop-enhanced/components/PortalManagementView.tsx` — add route case for the split-pane variant
- `src/desktop-enhanced/components/PortalCaseAccessManager.tsx` — accept an optional `compact` prop to suppress the full case toolbar and adjust column visibility
- `src/data/activePageAtom.ts` — add `'portal-split-pane'` to `ActivePage` type
- Sidebar navigation — add "C1. Split Pane" entry

### Reused as-is
- `PortalDataTable.tsx` — already supports `densityMode` prop
- `PortalCaseAccessManager.tsx` — core logic unchanged, layout adapts via prop
- Confirmation modals, toast notifications, bulk action footer — no changes
- Resize handle pattern — lifted from `AccessLedgerDetailPanel.tsx`

---

## Out of Scope

- Changes to B3/B4 table views (remain as separate variants)
- Record-level detail panel in the left pane (the left pane shows cases, not records)
- Mobile/tablet responsive behavior
- Keyboard navigation between panes (future enhancement)
- Case data API integration (prototype uses existing mock data)
