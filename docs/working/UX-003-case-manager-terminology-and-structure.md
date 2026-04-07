# UX-003 — Case Access Manager: terminology alignment and structural improvements

**Type:** UX / IA Improvement
**Priority:** Medium
**Source:** UX/IA Review — Finding 3; Jira reference (`docs/jira-reference-portal-management.md`)

---

## Context

The **Case Access Manager** (`PortalCaseAccessManager.tsx`) is the per-case view for managing portal access. It organizes participants into three expandable accordion sections. The **approved UX pattern** (A3) defined in the Jira reference establishes a specific terminology and structure for the inside-case view:

- **Tab 1:** "Active Portal Users" — participants who currently have access
- **Tab 2:** "Missing Access" — participants who do not have access, subdivided into Parties and Case Assignments

The current implementation uses accordions rather than tabs, and uses different labels than the approved terms.

---

## Terminology Misalignment

| Current accordion label | Approved term (Jira A3) |
|---|---|
| "Portal access" | Active Portal Users |
| "No Portal access: Parties" | Missing Access → Parties |
| "No Portal access: Case assignments" | Missing Access → Case Assignments |

The current labels read as ad hoc strings rather than defined system concepts. "No Portal access: Parties" as a section header is verbose and inconsistent with the terse, noun-first pattern used elsewhere in the product.

---

## Structural Improvements Beyond Terminology

### 1. Per-group counts in the summary header

The summary badges currently show two totals: "N with portal access" and "N without portal access." The "without" total combines Parties and Case Assignments into a single number. A user cannot determine from the header whether there is work to do in one sub-group, both, or neither — without opening each accordion.

**Proposed:** Break the "without" badge into two, or add a secondary line:
> "3 Parties · 1 Case Assignment without access"

This allows triage without expanding.

### 2. Data model gap — Revoked ≠ Never Granted

The Jira Vet Notes (`docs/jira-reference-portal-management.md`, Vet Notes section) flag a structural issue in the "Missing Access" group:

> "The 'missing' list requires a cross-system lookup, not a simple `status !== 'Active'` filter. Revoked users are not the same as users who never had access."

Currently, the "No Portal access" sections appear to use a filtered view of `PortalAccessRecord` with non-Active statuses. This conflates two distinct states:

- **Revoked** — the person previously had access; a deliberate action removed it.
- **Never granted** — the person is a party or case assignment but no portal access record exists.

These require different Grant actions (re-grant vs. first-time grant) and may trigger different downstream effects (re-invitation vs. first invitation). Presenting them in the same group without distinction is misleading to the officer performing the action.

**Proposed:** The "Missing Access" view should distinguish these two sub-states, either:
- With a column ("Previously granted / Never granted") within the existing section
- Or with a visual indicator on rows that are revoked vs. never-granted

This is a data model concern as much as a UX concern — the `PortalAccessRecord` type may need a `hasPortalAccess` boolean or a separate `CaseParty` type for participants with no existing access record.

---

## Scope

- `src/desktop-enhanced/components/PortalCaseAccessManager.tsx` — label updates, summary badge changes
- `src/desktop-enhanced/types/portalTypes.ts` — evaluate whether data model supports distinguishing Revoked vs. Never Granted
- Jira A3 tab structure vs. accordion: this ticket does not mandate switching from accordions to tabs — that is a separate structural decision. It does require the labels to match approved terminology.

---

## Out of Scope

- Changes to the global Portal Access List or Access Ledger
- The accordion vs. tab layout decision (treat as a separate prototype comparison)
- Navigation links to/from this view (see UX-001)
