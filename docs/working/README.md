# Working Docs Status Board

`docs/working/` now contains only active or still-open items.

Docs that were wrapped, superseded, or kept only for reference were moved to `docs/archive/working-wrapped/`.

## Status Legend

- `Open`: still actionable and not fully resolved in code.
- `Partial`: some work landed, but the ticket is still not done.
- `Open issue`: documented problem still relevant or unresolved.

## Active Portal Management Docs

| Doc | Status | Current read |
| --- | --- | --- |
| `UX-001-global-to-case-navigation.md` | `Open` | Global tables still do not link into the case manager; C1 split pane addresses the same problem indirectly, but this exact bridge is not implemented. |
| `UX-002-ledger-statistics-labeling.md` | `Partial` | `AccessLedger.tsx` shows sticky-search stats and filtered-result counts, but the explicit two-scope labeling from the ticket is not present. |
| `UX-003-case-manager-terminology-and-structure.md` | `Open` | `PortalCaseAccessManager.tsx` still uses accordions and current labels rather than the approved terminology and structural refinements described here. |
| `UX-004-terminology-standardization.md` | `Partial` | Some labels are standardized (`Portal access`, `No Portal access`, `Case Participant Role`), but `Author`, `Shared with`, `Purpose`, and missing `Portal Role` remain unresolved. |
| `UX-005-bulk-mixed-status-selection.md` | `Partial` | Mixed selections are detected, but the current behavior is just a disabled footer message (`No valid actions`) rather than a full recommended workflow. |
| `UX-006-grant-confirmation-access-context.md` | `Open` | Grant confirmation modals are still minimal count-based confirmations with no access-type context. |

## Active Shared / Cross-Project Items

| Doc | Status | Current read |
| --- | --- | --- |
| `ISSUE-token-self-reference-semantics.md` | `Open issue` | Documents a real generated-token problem, but it is broader than this repo and not specific to the portal-management feature set. |
| `ARCH-token-self-reference-remediation-options.md` | `Open issue` | Good cross-project remediation analysis; implementation appears to still be pending outside this repo. |

## Wrapped Docs

Wrapped docs now live in `docs/archive/working-wrapped/`.

That archive includes:

- portal review and concept docs that already served their purpose
- settings and side-panel plans that were partially shipped or superseded
- older Safety Check-only plans
- QR-generation docs that are currently out of scope

## Practical Guidance

- For current product understanding, start with `README.md`, `walkthrough.md`, and the open tickets listed above.
- For historical rationale or superseded planning, check `docs/archive/working-wrapped/README.md`.
