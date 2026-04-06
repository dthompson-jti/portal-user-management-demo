# UX / IA Review: Portal User Management

**Date:** 2026-04-05
**Scope:** Portal user management screens — information architecture and UX flows only. No design system or visual changes.

---

## What This System Is

This is a **Case-Participant Portal Access Manager**: it controls which external parties (case participants, solicitors, representatives) can access specific case information through the portal. There is no internal staff or team management.

---

## Screen Inventory

### 1. Portal Access List
**File:** `src/desktop-enhanced/components/PortalAccess.tsx`

Global table of every access record across all cases. Columns: case number, case name, email, status (Active / Revoked / Expired), case type, participant role, access type. Supports quick search, an advanced filter panel (7 fields), multi-select with bulk Grant / Revoke, and single-row context menu actions.

### 2. Access Ledger
**File:** `src/desktop-enhanced/components/AccessLedger.tsx`

A historical audit view of the same records. Distinguishes itself with "sticky" search — statistics reflect the pre-filter search scope, not the currently filtered results. Bulk Grant / Revoke available. Structurally near-identical to the Access List.

### 3. Case Access Manager
**File:** `src/desktop-enhanced/components/PortalCaseAccessManager.tsx`

A per-case view organized into three accordions: participants *with* access, parties *without* access, and case assignments *without* access. Case header shows case metadata. Summary badges show counts of with / without. Row actions are Grant or Revoke; bulk actions available within sections.

### 4. Portal Omnisearch
**File:** `src/desktop-enhanced/components/PortalOmnisearch.tsx`

A flexible search interface on the same underlying data. Auto-detects whether the query is an email or case number, or can be locked to one mode. Adds grouping options (by Status, by Role). Configurable for exact vs. partial match.

### 5. Specialized Search Modes
**File:** Same component as Omnisearch, different route props.

Four additional route entries: Email Search (exact), Email Search (partial), Case Search (exact), Case Search (partial). Each is a separate navigation destination rather than a configuration toggle within one screen.

### 6. Detail Panel
**File:** `src/desktop-enhanced/components/AccessLedgerDetailPanel.tsx`

A slide-in right panel showing full record detail: case info, participant info (email, role, access type), and audit fields (author, shared with, purpose). Appears on single-row selection. Shows placeholder states for no selection or multi-selection. Resizable via drag handle.

### 7. Confirmation Modals

**Revoke:** Yellow warning banner ("Access will be removed. You can add access again later.") + count confirmation. Loading state on confirm. Fires success toast on completion.

**Grant:** Count confirmation only — no warning banner. Fires success toast on completion.

### 8. User Menu
**File:** `src/components/UserMenu.tsx`

Dropdown from avatar in the top-right: user name display, light/dark theme toggle, avatar hue slider, Log Out. No account management options.

---

## UX / IA Findings

### Finding 1 — Too many overlapping entry points for the same data
**Priority: High**

The Portal Access List, Access Ledger, Omnisearch, Email Search (×2), and Case Search (×2) are six to seven navigation destinations that all surface the same table of access records. From a user's perspective, it is not clear which one to use for a given task.

The distinction between "Portal Access" and "Access Ledger" needs a sharper conceptual frame. If Ledger is the historical / audit view, it should be scoped away from operational Grant / Revoke actions entirely. The search modes (exact / partial, email / case lock) are configuration options, not fundamentally different tasks — they should be toggles within a single search interface, not separate routes.

**Opportunity:** Consolidate search entry points. Separate operational management from audit review at the navigation level.

---

### Finding 2 — No navigational bridge between global list and per-case view
**Priority: High**

There is no link from the global Portal Access List to the Case Access Manager for a specific case. A user who spots a case in the global list has no path to "zoom in" to that case's full access picture without navigating elsewhere independently. The reverse path — from the Case Manager back to the global list filtered by that case — is also absent.

**Opportunity:** Make case numbers in the global list clickable entry points to the Case Access Manager. Add a breadcrumb or contextual "view all records" link from the case view back to the global list pre-filtered to that case.

---

### Finding 3 — Access Ledger statistics are misleading without explanation
**Priority: High**

The Access Ledger shows summary statistics (total, active, revoked, expired counts) that reflect the *search scope* — not the currently filtered results. A user who applies a Status filter will see counts that don't match what's in the table, with no explanation for the discrepancy.

**Opportunity:** Add explicit labeling to disambiguate. For example: "42 search matches" on the stat cards, and "Showing 12 active" in the table header. The current behavior is a deliberate design decision but needs to be surfaced clearly to users.

---

### Finding 4 — Case Access Manager accordions obscure the full picture
**Priority: Medium**

The three accordion sections (With Access / Parties Without / Assignments Without) require the user to open each one to understand the complete case. The summary badges show total "with" and total "without" but don't break down the "without" category by type, so a user cannot tell from the header how many accordions have content worth opening.

**Opportunity:** Show per-section counts in the summary area before expanding (e.g., "3 parties without access · 1 assignment without access"). Evaluate whether Parties and Case Assignments need to be two separate accordions, or whether a single "Without Access" section with a type column would reduce navigation friction.

---

### Finding 5 — Inconsistent terminology across views
**Priority: Medium**

The same field is labeled "Granted or shared by" in the filter panel but "Author" in the detail panel. "Direct access" vs. "Delegated access" appears as a column value with no definition visible in context. "Purpose" surfaces system-generated strings (e.g., "Portal invitation for named party") that read as internal codes to an end user.

**Opportunity:** Standardize the author field label across all views. Rename or define "Access Type" values in context (e.g., a column header tooltip). Review whether "Purpose" should display a human-readable description rather than a system string.

---

### Finding 6 — Bulk selection across mixed statuses is ambiguous
**Priority: Medium**

Multi-select allows choosing records with different statuses (Active, Revoked, Expired) simultaneously. The bulk action footer shows context-dependent buttons, but if a selection contains both Active and Revoked records, the available actions and their scope are unclear.

**Opportunity:** Show a status breakdown in the selection footer (e.g., "3 active · 1 revoked selected") and clarify which action applies to which records — or disallow cross-status bulk selection with an inline explanation of why.

---

### Finding 7 — Grant confirmation modal lacks context for delegated access
**Priority: Low**

The Revoke modal explains consequences (access removed, reversible). The Grant modal only confirms a count with no context about what access is being granted — particularly relevant for Delegated access records, where the implications may differ from Direct access grants.

**Opportunity:** When granting delegated access, include a brief note in the confirmation explaining what delegated access means or what action will follow (e.g., whether an invitation email is sent).

---

### Finding 8 — User Menu has no account management path
**Priority: Low**

The user menu only offers appearance settings and logout. The system tracks who made each access change (the "author" field), so there is an implicit account identity — but no way to view or manage it from the interface.

**Opportunity:** If account management exists elsewhere in the system, link to it from the user menu. If not, this is a gap to flag for future planning.

---

## Summary Table

| # | Finding | Priority |
|---|---------|----------|
| 1 | Too many overlapping navigation entry points for the same data | High |
| 2 | No navigational bridge between global list and per-case view | High |
| 3 | Access Ledger statistics are misleading without explanation | High |
| 4 | Case Manager accordions obscure per-section counts before expanding | Medium |
| 5 | Inconsistent terminology across views (author, access type, purpose) | Medium |
| 6 | Bulk selection across mixed statuses is ambiguous | Medium |
| 7 | Grant confirmation lacks context for delegated access | Low |
| 8 | User Menu has no account management path | Low |
