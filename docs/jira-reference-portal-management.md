# Portal Management — JIRA Reference

> **Source:** Original JIRA ticket and submitter comments.
> These screenshots and notes serve as **reference material and inspiration** — not gospel.
> The goal is to improve UX, UI, scalability, and functionality beyond what was originally built.

---

## Context

A module built into eSeries to provide greater control and flexibility for managing Portal case access. Two core search screens were built, with actions for the results. The original implementation uses the legacy eSeries UI and is **not aligned** with the new UI mandate (Steven's directive: new functionality must use new UI).

---

## Screenshot 1: Email Search (Search via Email Address)

**Access:** Outside of a case.

**Purpose:** Enter an email address to find all cases that user has access to on Portal.

### Columns (in order)

| # | Column | Notes |
|---|--------|-------|
| 1 | Checkbox | Row selection, includes select-all |
| 2 | Case Number | e.g. `CIV-24-0000013` |
| 3 | Case Name | e.g. `Agnes Schlauderheide v Luke Smith` |
| 4 | Case Participant Role | e.g. `Plaintiff 1 Agnes Schlauderheide` |
| 5 | Access Type | e.g. `Direct access` |
| 6 | Removal Result | Populated after a remove action is executed |

### Behavior

- Single search field for email address.
- Results returned with select checkboxes (including select all).
- "Remove access" button (red) triggers a confirmation modal — continuing removes access for each selected portal user.
- A message is shown if there are no cases this user has access to on Portal.
- After removal, the system iteratively works through selected records, calling the Portal API per record, with a corresponding response message for each.

---

## Screenshot 2: Case Search (Search via Case Number)

**Access:** Outside of a case (also available inside a case with modified behavior).

**Purpose:** Enter a case number to find all portal users who have access to that case.

### Columns (in order)

| # | Column | Notes |
|---|--------|-------|
| 1 | Checkbox | Row selection, includes select-all |
| 2 | Email Address | e.g. `agnes.schlauderheide@outlook.com` |
| 3 | Case Participant Role | e.g. `Plaintiff 1 Agnes Schlauderheide` |
| 4 | Portal Role(s) | e.g. `Individual`, `Organisation User`, `Organisation Administrator` |
| 5 | Result | Populated after a remove action; e.g. `Access removed` (rows highlight green) |

### Behavior — Outside a Case

- Single search field for case number.
- Results returned with select checkboxes (including select all).
- "Remove access" button (red) triggers a confirmation modal — continuing removes access for each selected portal user.
- A message is shown if there are no Portal users with access to the case.

### Behavior — Inside a Case

- Case Number search field is **hidden** (already in a case context).
- A check runs on form load comparing Portal access against Parties/CaseAssignments on the case.
- Results split into **two sections**:
  1. **Parties/CaseAssignments on the case but WITHOUT Portal access** — "Grant Access" button available.
  2. **Users WITH Portal access** (including non-party users) — "Remove Access" button available.
- Grant/Remove actions iteratively call the Portal API per selected record, returning a result for each.

---

## Design Direction Notes (from JIRA discussion)

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| Old search style | Legacy eSeries UX (as shown in screenshots) | Familiar | Not new UI, misaligned with mandate |
| New search style (generic) | Leverage existing patterns | High reuse, moderate UX | Less optimal for this specific use case |
| Admin pattern (Sean's) | Existing admin UI pattern | Proven pattern | May not fit all scenarios |
| AI prompt pattern (Jimmy's) | Existing search/prompt pattern | Modern feel | May not fit tabular results |
| Purpose-built tool | Custom-designed for this module | Most optimal UX | Low reuse |

### Key Constraint

> **Mandate from Steven:** New functionality must use new UI.

The legacy screenshots are provided for **functional reference only** — the actual implementation will be fully re-skinned with the project's design system.

---

## Data Model Notes

- Each grant/remove action is an individual API call to Portal per selected record.
- Each record returns its own result/status — the UI must support showing per-row results.
- Portal roles include: `Individual`, `Organisation User`, `Organisation Administrator`.
- Access types include: `Direct access`.

---

## Approved UX Patterns for Prototype

Based on the exploration of these notes, the following patterns have been agreed upon for Prototype implementation (see `docs/working/PRD-portal-management-ux.md` for full breakdown):

1. **Omnisearch Context Switching**: Unlike the Access Ledger's static audit table, searching an email will restructure the table columns to display **Cases** (since the user is known), and searching a Case ID will restructure columns to display **Portal Users**.
2. **Collapsible Grouping**: Provided via a `[ Group by ▼ ]` dropdown control (e.g. "No grouping", "Group by Status") to condense long lists. For prototype exploration, this option will be housed in a hamburger menu (noted as an artifact of the prototype, not production placement).
3. **Inline Actions vs. Density Toggle**: A view settings toggle allowing users to swap between "Quick Actions Mode" (explicit `[Grant]` / `[Revoke]` buttons on every row) and "Compact Mode" (actions hidden under `[⋮]`, prioritizing data density).
4. **Inside a Case Tabs**: When inside a case, the UI strictly adopts a tabbed layout dividing `[Active Portal Users]` and `[Missing Access]`. Master/merged list views are rejected.
