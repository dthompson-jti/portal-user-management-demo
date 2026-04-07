# UX-002 — Clarify Access Ledger statistics with two-tier labeling

**Type:** UX / IA Improvement
**Priority:** High
**Source:** UX/IA Review — Finding 2

---

## Context

The **Access Ledger** (`AccessLedger.tsx`) is the historical audit view of portal access records. It implements a "sticky search" pattern:

1. The user enters a search term (email, case number, case name, participant, author).
2. The system returns matching records — the **search scope**.
3. The user then applies status/type filters *on top of* the search scope to narrow the visible results.

The four stat cards at the top of the Ledger (Total / Active / Revoked / Expired) reflect the **search scope** — not the current filtered view. This is intentional: the stats are meant to give the user a picture of the full search result set before filters are applied.

---

## Problem

There is no label or visual cue explaining that the stat cards and the table are scoped differently. A user who applies a Status filter (e.g., "Active only") will see the table show 12 rows while the "Active" stat card shows 42 — with no explanation. The natural interpretation is that the numbers are wrong, or that the filter isn't working.

This is a legibility gap, not a behavioral one. The underlying behavior is correct and intentional.

---

## Proposed Changes

### Two-tier labeling

Add explicit scope labels to disambiguate the two levels:

**Stat cards** — add a subtitle or label beneath the card group:
> "Results for search: '[search term]'"

or, if no search is active:
> "All records"

**Table header / results row** — add a results summary line above the table:
> "Showing 12 of 42 records — filtered by: Active"

When no filter is applied, show:
> "Showing 42 records"

### Behavior at zero-state

When no search term has been entered, the stat cards reflect the full dataset. The label should reflect this:
> "All records — no search applied"

When a search is active but no results are found, the stat cards should show zeroes and the table should show an empty state, not a mismatch.

---

## Label copy (working)

| State | Stat card subtitle | Table summary |
|---|---|---|
| No search, no filter | "All records" | "Showing [N] records" |
| Search active, no filter | "Search: '[term]'" | "Showing [N] of [N] records" |
| Search active, filter applied | "Search: '[term]'" | "Showing [N] of [N] — filtered by: [Status]" |
| No search, filter applied | "All records" | "Showing [N] of [N] — filtered by: [Status]" |

---

## Scope

- `src/desktop-enhanced/components/AccessLedger.tsx` — add stat card subtitle and table results summary
- No behavioral changes. Labels only.
- No changes to Portal Access List (which does not use sticky search) or other views.

---

## Out of Scope

- Changing the sticky search behavior itself
- Modifying the stat card design or layout
- Applying this pattern to the Portal Access List (different filtering model)
