# Portal Prototype Patterns

This document is the current reference for the Portal Management prototype options in the desktop-enhanced shell.

It captures:

- what each prototype option is testing
- how each option differs from the others
- which patterns are exact-match vs partial-match
- which layouts are management-oriented vs audit/index-oriented
- the current design-system alignment expectations

## Design System Alignment

The current portal prototype work is expected to follow these rules:

- Use canonical semantic tokens for color, typography, spacing, borders, and radii.
- Prefer shared components over one-off inline styling.
- Use standardized portal terminology:
  - `Portal access`
  - `No Portal access`
- Keep row badges row-semantic. Counts belong in headers, summary cards, or section badges, not inside each row badge.
- Avoid non-canonical token names such as `--text-primary` and `--text-secondary`.

### Current Status

- The touched portal components have been normalized away from `--text-*` fallback tokens.
- The Case Example page now uses shared `OverviewBadge` patterns and canonical semantic tokens.
- `B4. Index pattern` uses the safeguard-style toolbar structure:
  - search on the left
  - icon-only advanced-search toggle beside search
  - quick filters floating on the right
- A broader repo-level token audit still depends on the external canonical output folder at `../design-tokens-canonical/output`, which is missing in the current workspace. That is an environment/repo dependency issue, not a portal-screen-specific token regression.

## Variant Matrix

| Option | Prototype label | Primary purpose | Search behavior | Layout pattern | Best used to evaluate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| A1 | Email Search | Exact email lookup | Exact match only | Search-first management table | Whether a dedicated exact email entry page is understandable |
| A2 | Case Search | Exact case lookup | Exact match only | Search-first management table | Whether a dedicated exact case entry page is understandable |
| A3 | Case Example | In-case access management | No search; fixed case context | Case header + segmented access management | Managing portal access from within a single case |
| A5 | Omnisearch | Flexible management lookup | Partial, context-switching | Adaptive result table | Whether one smart search can replace dedicated email/case pages |
| B1 | Email Search (Partial) | Email-first exploratory lookup | Partial match | Search-first management table | Broader recall when the user only knows part of an email |
| B2 | Case Search (Partial) | Case-first exploratory lookup | Partial match | Search-first management table | Broader recall when the user only knows part of a case number |
| B3 | Access Ledger | Audit-style record review | Partial/global filtering | Ledger table + detail panel | Reviewing and revoking existing access records |
| B4 | Index pattern | Safeguard-style index view | Partial/global filtering + expandable advanced search | Big table + left search + icon toggle + right quick filters | A denser, index-style browse/filter pattern |

## Detailed Pattern Notes

## A1. Email Search

- Dedicated exact-match email entry point.
- Returns rows only when the user enters an exact email value.
- Useful for evaluating precision-first workflows.
- Good comparison against B1 to measure exact vs exploratory lookup.

## A2. Case Search

- Dedicated exact-match case-number entry point.
- Returns rows only when the user enters an exact case number.
- Useful for evaluating precision-first case lookup.
- Good comparison against B2 to measure exact vs exploratory lookup.

## A3. Case Example

- Fixed-context management pattern for a single case.
- No top search bar because the case context is already known.
- Uses segmented sections for:
  - `Portal access`
  - `No Portal access: Parties`
  - `No Portal access: Case assignments`
- Best reference for the “inside a case” management workflow.

## A5. Omnisearch

- Unified management-oriented search.
- Adapts results based on whether the user effectively searched by email or case.
- Best reference when testing whether separate dedicated search pages should collapse into one smarter entry point.

## B1. Email Search (Partial)

- Same general page family as A1, but partial-match instead of exact-match.
- Keeps the email-first framing while improving recall.
- Best paired against A1 in demos and reviews.

## B2. Case Search (Partial)

- Same general page family as A2, but partial-match instead of exact-match.
- Supports short partial case fragments such as `24`.
- Best paired against A2 in demos and reviews.

## B3. Access Ledger

- Audit/log style view of portal access records.
- Best when the user is reviewing what access exists, rather than managing a single known case context.
- Uses the ledger-style column order:
  - `Case Number`
  - `Case Name`
  - `Email`
  - `Status`
  - `Type`
  - `Participant`
  - `Access`
- Includes a detail panel pattern appropriate for record inspection.

## B4. Index Pattern

- Derived from the ledger/index use case, but intentionally shaped after the safeguard desktop toolbar pattern.
- Closed-state toolbar follows the safeguard reference exactly in spirit:
  - search field on the left
  - icon-only advanced-search toggle immediately beside search
  - quick filters floating on the right
- Advanced search expands into a dedicated filter panel instead of stacking more controls into the closed toolbar.
- Uses the same ledger column order as B3.
- Unlike B3, the extra header row showing summary/result counts has been removed to keep the table entry tighter and more index-like.

## Key Comparisons

## Exact vs Partial Search

- A1 vs B1 is the cleanest email-search comparison.
- A2 vs B2 is the cleanest case-search comparison.
- A variants test precision-first entry.
- B variants test exploratory recall.

## Management vs Audit/Index

- A1, A2, A5 are management-search patterns.
- A3 is in-case management.
- B3 is an audit-ledger pattern.
- B4 is an index-pattern variant of the ledger family, borrowing the safeguard advanced-search interaction model.

## Single-Context vs Multi-Context

- A3 is single-context because the case is already known.
- A1, A2, A5, B1, B2, B3, and B4 all begin from a search or index context.

## Toolbar Philosophy

- A1, A2, B1, B2 use a simpler search-first toolbar.
- B3 uses a ledger toolbar with integrated filtering and panel review.
- B4 is the explicit “advanced-search index” option and should remain the closest portal analogue to the safeguard desktop pattern.

## Current Recommendation Framing

If the team wants the clearest prototype comparison set:

- Keep A1/A2 for exact dedicated entry.
- Keep B1/B2 for partial dedicated entry.
- Keep A3 for inside-case management.
- Keep A5 for unified smart search.
- Keep B3 for ledger review.
- Keep B4 for the safeguard-style index/advanced-search pattern.

That gives a clean comparison across:

- exact vs partial
- dedicated vs unified
- management vs ledger/index
- simple toolbar vs advanced-search toolbar
