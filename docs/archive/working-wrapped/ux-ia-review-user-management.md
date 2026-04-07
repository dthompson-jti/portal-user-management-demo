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

Four additional route entries: Email Search (exact), Email Search (partial), Case Search (exact), Case Search (partial). Each is a separate navigation destination used for prototype comparison.

### 6. Detail Panel
**File:** `src/desktop-enhanced/components/AccessLedgerDetailPanel.tsx`

A slide-in right panel showing full record detail: case info, participant info (email, role, access type), and audit fields (author, shared with, purpose). Appears on single-row selection. Shows placeholder states for no selection or multi-selection. Resizable via drag handle.

### 7. Confirmation Modals

**Revoke:** Yellow warning banner ("Access will be removed. You can add access again later.") + count confirmation. Loading state on confirm. Fires success toast on completion.

**Grant:** Count confirmation only — no warning banner. Fires success toast on completion.

### 8. User Menu
**File:** `src/components/UserMenu.tsx`

Avatar-triggered dropdown in the top-right: user name display, light/dark theme toggle, avatar hue slider, Log Out. One of several UI patterns being explored for account access and settings placement.

---

## UX / IA Findings

---

### Finding 1 — No navigational bridge between global list and per-case view
**Priority: High**

There is no link from the global Portal Access List to the Case Access Manager for a specific case. A user who spots a case in the global list has no path to "zoom in" to that case's full access picture. The reverse path — from the Case Manager back to the global list filtered by that case — is also absent.

**Recommendation:** Make case numbers in the global list clickable entry points to the Case Access Manager. Add a breadcrumb or "View all records for this case" link from the case view back to the global list pre-filtered to that case number.

---

### Finding 2 — Access Ledger statistics don't reflect filtered state
**Priority: High**

The Access Ledger shows summary statistics (total, active, revoked, expired counts) that reflect the *search scope* — not the currently filtered results. A user who applies a Status filter sees counts that don't match what's in the table. There is no label explaining this intentional separation.

**Recommendation:** Add two-tier labeling to make the scope explicit:

- **Stat cards** → label as "Search matches" (e.g., "42 search matches")
- **Table header** → "Showing 12 of 42 — filtered by: Active"

This preserves the intentional sticky-search behavior while making the relationship between the two levels legible to users who haven't learned the pattern.

---

### Finding 3 — Case Manager: accordion structure and section labels need alignment with approved terminology
**Priority: Medium**

The current accordion labels ("Portal access", "No Portal access: Parties", "No Portal access: Case assignments") diverge from the approved inside-case UX pattern established in the Jira reference. The approved pattern (A3) uses **tabs** — "Active Portal Users" and "Missing Access" — not three separate accordions. Within "Missing Access", the two sub-groups are **Parties** and **Case Assignments**.

**Alignment with Jira terminology:**

| Current label | Approved term |
|---|---|
| "Portal access" | Active Portal Users |
| "No Portal access: Parties" | Missing Access → Parties |
| "No Portal access: Case assignments" | Missing Access → Case Assignments |

**Improvements beyond terminology:**

- The summary badges show a single "without access" total. A user cannot tell from the header whether the missing access involves parties, case assignments, or both — requiring accordion expansion to triage. Showing per-group counts (e.g., "3 parties · 1 case assignment without access") eliminates that step.
- The Jira Vet Notes also flag a data model gap: "Missing Access" requires a cross-system lookup to distinguish participants who *never had access* from those who are *revoked*. These are different states and should not be visually merged. Revoked records in the "Missing Access" group are currently indistinguishable from never-granted ones.

---

### Finding 4 — Terminology inconsistency across views
**Priority: Medium**

Multiple fields use different labels for the same concept depending on which screen the user is on. This creates friction when users try to correlate information between views (e.g., filtering in the Ledger, then reading the detail panel).

**Field-by-field breakdown:**

| Field | Filter panel label | Column label | Detail panel label | Jira reference label |
|---|---|---|---|---|
| Who granted access | "Granted or shared by" | — | "Author" | Not specified |
| Access type | "Access type" | "Access type" | "Access type" | "Access Type" ✓ |
| Participant's role | "Participant role" | "Case Participant Role" | "Role" | "Case Participant Role" ✓ |
| Access status | "Portal access status" | "Status" (badge) | *(no label — just badge)* | Not specified |
| Portal role | Not filterable | Not shown | Not shown | "Portal Role(s)" (Individual / Organisation User / Organisation Administrator) |

**Specific issues:**

1. **"Author" vs "Granted or shared by":** These refer to the same field. Recommend standardizing to one term across all surfaces. "Granted by" is shorter and accurate; "shared by" implies a different action.

2. **"Portal Role(s)" is missing from the current UI:** The Jira reference includes `Individual`, `Organisation User`, and `Organisation Administrator` as a column in the Case Search results. These are distinct portal account types, not the same as Case Participant Role. The current implementation does not surface this field anywhere — it may be in the data model but not exposed.

3. **Status label inconsistency:** The filter calls it "Portal access status"; the column badge just shows "Active / Revoked / Expired" with no column header label in some views. "Expired" is a status in the data model but the Jira reference only references Active and Removed (Revoked). It's unclear whether Expired is a legacy state or a live system-driven transition — this should be defined and the label made consistent.

4. **"Purpose" field:** Surfaces system-generated strings (e.g., "Portal invitation for named party") that are not meaningful to an end user. If this field is useful for audit, it should be renamed to something that sets expectation — e.g., "Access reason" or "Grant type" — and the values should be written in plain language.

5. **"Shared with" field:** Appears in the detail panel with values like "Case participant account". The meaning and utility of this field for the user's task is unclear. If it refers to the portal account type, it overlaps with "Portal Role(s)" and should be consolidated.

---

### Finding 5 — Bulk action behavior for mixed-status selections
**Priority: Medium**

Multi-select allows choosing records with different statuses (Active, Revoked, Expired) simultaneously. The bulk action footer is status-dependent, but with a mixed selection the available actions and their scope are not communicated to the user.

**Options (evaluated):**

**Option A — Status-aware footer with split action buttons**
Show a breakdown in the footer ("3 active · 1 revoked selected") with separate, labeled action buttons for each applicable action ("Revoke 3" / "Grant 1"). The user sees exactly what will happen to each group before confirming. Most explicit, highest control — appropriate for a high-stakes workflow where revocation has consequences.
*Trade-off: Two buttons in the footer adds visual complexity; users must read both.*

**Option B — Smart action with transparent skip rule**
A single dominant action button with a qualifier: "Revoke active records (3) — 1 revoked record will be skipped." Faster for the common case (bulk revoke of mostly-active records); the skip rule is visible but doesn't require a separate button. Works well when one status type dominates the selection.
*Trade-off: Users who specifically want to act on skipped records must re-select. Skipping silently for Expired records (which can't be actioned either way) is fine; skipping Revoked records may feel wrong.*

**Option C — Homogeneous selection enforcement**
When a row is selected, lock further selection to the same status. Attempting to select a different-status row shows a tooltip explaining why ("You can only select records with the same status at once"). Eliminates the ambiguity entirely by making mixed selections impossible.
*Trade-off: Most restrictive. Power users who want to bulk-act across statuses in two steps will find this acceptable, but it removes flexibility. Requires a clear visual indicator of why some checkboxes are disabled.*

**Option D — Pre-action grouping review**
Mixed selections open a grouped review step before the confirmation modal. The review lists records grouped by pending action: "Will revoke: [3 records]" / "Will grant: [1 record]" / "No action available: [2 expired]". User approves or adjusts the grouped plan before committing.
*Trade-off: Adds a step to every mixed-selection workflow. Justified if the action set is high-stakes (e.g., bulk revoking court case access), but may feel heavy for common cases.*

**Recommendation:** Option B for the standard table (fast, transparent, covers the dominant case); Option D as a prototype variant where the stakes of the action warrant a review step.

---

### Finding 6 — Grant confirmation modal lacks access-type context
**Priority: Low**

The Revoke modal explains consequences (access removed, reversible). The Grant modal only confirms a count with no context about what is being granted — a gap that is most significant when granting Delegated access, where the implications and downstream actions (e.g., an invitation being sent) may differ from Direct access.

**Options (evaluated):**

**Option A — Access-type-conditional info banner**
Mirror the Revoke pattern: show a blue/info banner *only* when the selection contains Delegated access records. Banner content: what delegated access means and what action will follow (e.g., "An invitation will be sent to each email address"). Direct access grants require no banner — the action is understood.
*Trade-off: Requires the UI to inspect the selection's access types before rendering the modal. Clean conditional logic, minimal added complexity for the common Direct access case.*

**Option B — Inline access-type breakdown in the confirmation sentence**
Replace "Are you sure you want to grant portal access for 3 record(s)?" with a type-aware sentence: "Grant Direct access for 2 records and Delegated access for 1 record?" No banner needed — disambiguation lives in the question itself.
*Trade-off: Sentence becomes harder to parse as selection size and type diversity increase. Works cleanly for small, homogeneous selections; degrades for large or mixed ones.*

**Option C — Record preview list in the modal**
For selections of ≤5 records, list each record inline (email + access type) within the modal body. For larger selections, summarize by type ("2 × Direct access, 1 × Delegated access"). Gives the user maximum pre-confirmation visibility without requiring them to remember what they selected.
*Trade-off: Modal height grows with selection size. The list adds meaningful signal for small selections but becomes a scrollable liability for bulk operations (25+ records). Needs a truncation strategy.*

**Option D — Invitation preview for Delegated access**
When the selection contains Delegated access records, show a preview of the invitation that will be sent (email address, access level, case reference) as an expandable section. The staff member can verify the right person gets the right message before committing.
*Trade-off: Highest signal, but requires the system to know and render the invitation template at confirmation time. Most implementation-heavy option; best suited as a future-state enhancement rather than an immediate prototype target.*

**Recommendation:** Option A for the current prototype (low implementation cost, targeted, mirrors the existing Revoke pattern). Option C is the strongest long-term UX; revisit when record-preview patterns are established elsewhere in the product.

---

### Finding 7 — Account access and settings placement: options for A/B/C testing
**Priority: Exploratory**

The current avatar dropdown (appearance settings + logout) is one of several UI patterns being evaluated for where account identity and settings live. The hamburger menu variant is a deliberate prototype artifact. The goal is to identify which placement best serves a power-user enterprise tool where users are logged in continuously.

**Options for comparison:**

**Option A — Avatar dropdown (current)**
Click avatar → compact dropdown with name display, appearance settings, logout. Low screen footprint. Familiar pattern from consumer products (Gmail, Notion). The appearance controls (theme, avatar color) are immediately accessible but feel lightweight relative to enterprise user expectations.
*Best when:* Settings are minimal and users rarely need them.

**Option B — Avatar → dedicated settings panel (slide-in)**
Click avatar → slides open a full-width settings panel (similar to a right-side drawer). Supports richer content: account identity, session info, appearance, notifications, activity log. Preserves the avatar as the access point without navigating away.
*Best when:* Account and settings content will grow over time; the panel can expand to accommodate it without redesign. Keeps the main content visible.

**Option C — Persistent identity chip in the header**
Instead of avatar-only, display an avatar + display name chip as a persistent header element (e.g., top-right: `[avatar] D. Thompson ▾`). Clicking opens the same dropdown. Makes the "this is a clickable account control" affordance explicit — reduces discovery friction for first-time users.
*Best when:* The product has multiple user roles and knowing *who you are* in the system is contextually important (e.g., an auditor vs. a registry officer sees different access).

**Option D — Settings in the main Settings section; avatar for identity and logout only**
Account and profile settings live in the primary Settings navigation (consistent with most enterprise tools: Jira, Salesforce, court management systems). The avatar dropdown shows only: display name, role/position, logout. No settings in the avatar at all — settings are found where users expect them.
*Best when:* The Settings section is already established and users are trained to go there for configuration. Reduces the avatar's cognitive load to a single job: "this is who I am / log out."

**Recommendation for testing:** Options A and D are the clearest contrast to evaluate — they represent opposite philosophies (everything-in-avatar vs. nothing-in-avatar). Option C is worth including as a middle path if discoverability of the account menu is a concern raised in testing.

---

## Summary Table

| # | Finding | Priority |
|---|---------|----------|
| 1 | No navigational bridge between global list and per-case view | High |
| 2 | Access Ledger statistics don't reflect filtered state | High |
| 3 | Case Manager accordion labels and structure need Jira alignment | Medium |
| 4 | Terminology inconsistency across views — 5 specific fields | Medium |
| 5 | Bulk action behavior for mixed-status selections — 4 options | Medium |
| 6 | Grant confirmation lacks access-type context — 4 options | Low |
| 7 | Account/settings placement — 4 options for A/B/C testing | Exploratory |
