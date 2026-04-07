# UX-001 — Add navigation link from global list to Case Access Manager

**Type:** UX / IA Improvement
**Priority:** High
**Source:** UX/IA Review — Finding 1

---

## Context

The portal management system has two separate views of access records:

- **Global Access List** (`PortalAccess.tsx`) — a table of every portal access record across all cases, searchable and filterable by case number, email, status, case type, and access type.
- **Case Access Manager** (`PortalCaseAccessManager.tsx`) — a per-case view showing all participants grouped by access status (Active Portal Users / Missing Access), scoped to a single case. This is the operational view for case-level Grant / Revoke workflows.

These two views are currently not connected. A user who identifies a case of interest in the global list has no way to navigate to the Case Access Manager for that case from within the table. Equally, a user working inside the Case Access Manager has no path back to the global list pre-filtered to that case.

---

## Problem

There is no navigational bridge between the two views. Users who need to move between the global picture and a case-level operation must independently re-navigate, losing their filter context in the process.

This breaks the natural task flow: a user scanning the global list for a case, intending to manage all participants on that case, must abandon the global list entirely and re-enter the Case Access Manager through a separate path.

---

## Proposed Changes

### 1. Case number as a navigation link — Global list → Case Access Manager

In the global Portal Access List and Access Ledger tables, make the **Case Number** column value a clickable link. Clicking navigates to the Case Access Manager for that case.

- The link should be visually distinguished (e.g., underline on hover or a subtle link color) but not so prominent that it competes with the row's primary actions.
- This is consistent with standard enterprise table patterns where ID / reference fields navigate to the detail view.

### 2. Contextual "View all records for this case" link — Case Access Manager → Global list

In the Case Access Manager header (where case metadata is already displayed), add a secondary link: **"View all records for this case"**. Clicking navigates to the global Portal Access List pre-filtered by that case number.

This allows a user to exit the structured accordion view and work with the flat, filterable table if they prefer — or to see the full audit history for a case via the Access Ledger.

### 3. Filter preservation (stretch)

When navigating from the global list to a case view and back, preserve the user's prior filter state rather than resetting to defaults. This reduces the cost of switching contexts mid-investigation.

---

## Scope

- `src/desktop-enhanced/components/PortalAccess.tsx` — make Case Number column a link
- `src/desktop-enhanced/components/AccessLedger.tsx` — same treatment
- `src/desktop-enhanced/components/PortalCaseAccessManager.tsx` — add contextual link in header
- No data model changes required. Navigation is routing-only.

---

## Out of Scope

- Changes to the Access Ledger's sticky search behavior
- Changes to the Case Access Manager's accordion structure or labeling
- Deep linking with full filter state serialization (noted as a stretch goal)
