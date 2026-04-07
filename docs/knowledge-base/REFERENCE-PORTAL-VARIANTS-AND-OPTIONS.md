# Portal Variants And Options Reference

**Date:** 2026-04-06  
**Purpose:** Current-state reference for the enhanced-shell variants, their UI/UX/IA tradeoffs, and the menu-controlled options that affect them.

> Status note: this document reflects the codebase as it exists today. Terminology surfaces are still in flux, and another in-progress workstream is adding more terminology options. Treat the terminology notes below as a current-state snapshot, not the final naming system.

## 1. Shell-Level IA

The default app runtime is the enhanced shell in `src/desktop-enhanced/DesktopEnhancedApp.tsx`.

Top-level routing is controlled by `activePageAtom` in `src/data/activePageAtom.ts`:

- `checks`
- `settings`
- `settings-tabs`
- `portal-email-search`
- `portal-case-search`
- `portal-case-example`
- `portal-omnisearch`
- `portal-email-search-partial`
- `portal-case-search-partial`
- `portal-access-ledger`
- `portal-access`
- `portal-split-pane`

### Shell hierarchy

1. **Top nav**
   - Hamburger prototype menu
   - Global search
   - Utility actions
   - Avatar/settings popover
2. **Sidebar**
   - Quick Access
   - Portal Management
   - Workspace
   - Additional legacy or placeholder sections
3. **Optional left panel**
   - Checks tree navigation, or
   - Settings navigation tree
4. **Main content**
   - Portal variant, settings variant, or checks view

### Important IA reality

- The sidebar exposes many entries, but only the portal pages and settings pages are currently wired into `activePageAtom`.
- The portal variants are presented as A/B/C prototype branches, not as a finished production navigation model.
- The settings work is real but partial.

## 2. Current Menu And Toggle Inventory

### 2.1 Top-nav hamburger menu

Source: `src/desktop-enhanced/components/TopNavMenu.tsx`

| Control | Options | Scope | Current effect |
| --- | --- | --- | --- |
| `portalDensityModeAtom` | `Compact mode`, `Quick actions` | Portal Omnisearch family only: A1, A2, A5, B1, B2 | `Compact` shows checkbox selection, row overflow actions, and bulk footer. `Quick actions` replaces those with inline row buttons and removes bulk-selection flow. |
| `skeletonForcedAtom` | `Simulate slow loading mode` on/off | Safety Check tables only | Forces minimum-duration skeleton loading in live/historical checks views. It does not materially affect the portal-management variants. |

### 2.2 Avatar/settings popover

Source: `src/desktop-enhanced/components/TopNavAvatar.tsx`

| Control | Options | Scope | Current effect |
| --- | --- | --- | --- |
| Appearance | `Light`, `Dark` | Global | Theme switch for the app shell. |
| Avatar color | Slider | Per-user preference | Adjusts avatar hue only. |

### 2.3 In-view toggles and overflow menus

These are not part of the top hamburger menu, but they materially change the prototype experience.

| Control | Location | Options | Current effect |
| --- | --- | --- | --- |
| Split-pane browse mode | `PortalSplitPane` left pane | `Search Email`, `Search Case` | Switches the browse list axis and the type of detail shown on the right. |
| Omnisearch grouping | Omnisearch quick-filter row | `No grouping`, `Group by Status`, `Group by Role` | Partitions result tables in A1, A2, A5, B1, and B2. |
| Access advanced search | B4 toolbar | Open/close panel | Replaces the quick-toolbar row with a full advanced-search panel. |
| Sidebar collapse | Sidebar search controller | expanded/collapsed | Reduces the sidebar footprint but keeps the same IA. |
| Checks/settings left-panel overflow | Navigation panel header | `Expand all`, `Collapse all` | Affects tree state only. |

### 2.4 Important documentation correction

Older docs describe **grouping and density as hamburger-menu artifacts**. That is only partially true now:

- **Density** still lives in the top hamburger menu.
- **Grouping** is currently inline in the Omnisearch filter row, not in the hamburger menu.

## 3. Variant Inventory

### A1. Email Search

- **Route:** `portal-email-search`
- **UI shape:** Triggered exact-match email search; case-oriented result table; within-results search; grouping filter; status filter.
- **Primary job:** “I know the email address and want to see what cases this person can access.”
- **IA notes:** Person-first entry, but case-first result framing. Uses `Case Number`, `Case Name`, `Case Participant Role`, `Access Type`, `Status`.
- **Pros:** Fast for exact known-email lookup; simple mental model; reusable table mechanics.
- **Cons:** Exact-match dependency is brittle; low ambient context; weak audit framing.

### A2. Case Search

- **Route:** `portal-case-search`
- **UI shape:** Triggered exact-match case search; participant-oriented result table; within-results search; grouping filter; status filter.
- **Primary job:** “I know the case number and want to see everyone with access.”
- **IA notes:** Case-first entry and participant-first result framing. Uses `Email Address`, `Participant Role`, `Portal Role(s)`, `Status`.
- **Pros:** Strong fit for known case lookup; low noise when the case number is precise.
- **Cons:** Exact-match brittleness; `Portal Role(s)` currently maps to `accessType`, which is semantically inconsistent with other views.

### A3. Case Example

- **Route:** `portal-case-example`
- **UI shape:** Full case header; summary badges; three accordions: `Portal access`, `No Portal access: Parties`, `No Portal access: Case assignments`.
- **Primary job:** Manage access inside a fixed case context.
- **IA notes:** Strong case hierarchy, but terminology and structure still diverge from the intended “Active/Missing” model. Uses current-state labels rather than the more canonical terminology proposed in UX tickets.
- **Pros:** Strong contextual focus; good grant/revoke separation; compact summary row.
- **Cons:** Not globally discoverable; no audit framing; terminology and grouping are still mid-transition.

### A5. Omnisearch

- **Route:** `portal-omnisearch`
- **UI shape:** One triggered search field that auto-detects email vs case; result columns switch based on inferred intent; within-results search; grouping; status filter.
- **Primary job:** Collapse email-search and case-search into one adaptable entry point.
- **IA notes:** Best current example of a single-entry IA. The table restructures itself rather than forcing separate navigation branches.
- **Pros:** Highest entry-point simplicity; flexible; best long-term consolidation candidate.
- **Cons:** Requires the user to trust auto-detection; still inherits terminology inconsistencies from the underlying table variants.

### B1. Email Search (Partial)

- **Route:** `portal-email-search-partial`
- **UI shape:** Same overall shell as A1, but partial-match email search and email-first result layout.
- **Primary job:** Investigate when the full email is unknown.
- **IA notes:** Still person-entered, but less deterministic than A1 because the result set broadens quickly.
- **Pros:** More forgiving input; good for incomplete lookups.
- **Cons:** Higher noise; weaker confidence than exact email search; still not audit-oriented.

### B2. Case Search (Partial)

- **Route:** `portal-case-search-partial`
- **UI shape:** Same overall shell as A2, but partial-match case search and case-email ordering.
- **Primary job:** Investigate related cases or incomplete case references.
- **IA notes:** Broader search, still case-led.
- **Pros:** Better recall than A2; supports prefix/partial case workflows.
- **Cons:** More scan effort; still dependent on table literacy and current labels.

### B3. Access Ledger

- **Route:** `portal-access-ledger`
- **UI shape:** Triggered global search; sticky search scope; quick filters; stats bar; detail panel for single-row inspection.
- **Primary job:** Audit and inspect access records historically.
- **IA notes:** Strongest audit-oriented framing. The search scope and filter scope are intentionally different, which is powerful but not fully explained in current copy.
- **Pros:** Best audit view; detail panel adds depth; good for record-level investigation.
- **Cons:** Sticky-search scope is not yet labeled clearly enough; terminology in the detail panel remains inconsistent (`Author`, `Shared with`, `Purpose`).

### B4. Index pattern

- **Route:** `portal-access`
- **UI shape:** Global table; instant search; advanced search panel; quick filters; detail-panel integration via selection.
- **Primary job:** Broad record discovery and filtering across many fields.
- **IA notes:** This is the most “index/search tool” interpretation of portal management. It has the richest filter model but the weakest case-centric framing.
- **Pros:** Strongest filter coverage; highest investigatory flexibility; closest thing to a power-user workbench.
- **Cons:** Less obvious for novice users; relies on terse labels like `Type`, `Participant`, `Access`; advanced search still contains terminology collisions such as `Granted or shared by`.

### C1. Split Pane

- **Route:** `portal-split-pane`
- **UI shape:** Resizable left browse list plus right detail pane; browse axis toggle between email and case; right side shows either person-across-cases or compact case manager.
- **Primary job:** Preserve browse context while acting on a selected person or case.
- **IA notes:** Best current bridge between global browsing and in-context action. The shipped version is broader than the earlier case-only concept because it supports both browse axes.
- **Pros:** Highest context preservation; strong browse-to-detail flow; best current compromise between search and structured management.
- **Cons:** More complex than single-pane options; less audit-rich than B3; relies on the user understanding the browse-axis toggle.

## 4. Current Terminology Snapshot

These labels are materially visible in the UI today and matter for IA evaluation.

| Area | Current labels | Notes |
| --- | --- | --- |
| Status language | `Portal access`, `No Portal access` | This pair is consistently visible across badges and many filters. |
| B4 detail/audit fields | `Author`, `Shared with`, `Purpose` | Still inconsistent with more task-oriented access-management language. |
| B4 advanced search | `Granted or shared by` | Conflates `author` and `sharedWith`. |
| A2 result table | `Portal Role(s)` | Currently backed by `accessType`, so the label is ahead of the actual data model. |
| Case manager structure | `Portal access`, `No Portal access: Parties`, `No Portal access: Case assignments` | Clear enough operationally, but not the final IA/terminology model. |
| Settings IA | `System Properties`, category labels from `SETTINGS_TREE` | Clear high-level IA, but implementation depth is uneven. |

## 5. UX Metric Framework

Scores are **1 to 5**, where **5 is better**.

| Metric | What it measures |
| --- | --- |
| Discoverability | How obvious the entry point and available actions are. |
| Targeting Speed | How quickly a user can reach the intended record(s) when they know their target. |
| Context Preservation | How well the UI keeps surrounding context visible while the user acts. |
| IA Clarity | How understandable the hierarchy, labels, and mental model are. |
| Action Safety | How clearly the consequences of grant/revoke behavior are communicated. |
| Audit Visibility | How well the option supports inspection of who has access, why, and what changed. |
| Scalability | How well the pattern handles larger result sets, repeated use, and broader workflows. |

## 6. Portal Variant Scores

| Variant | Discoverability | Targeting Speed | Context Preservation | IA Clarity | Action Safety | Audit Visibility | Scalability | Total / 35 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A1 Email Search | 4 | 5 | 2 | 4 | 3 | 2 | 3 | 23 |
| A2 Case Search | 4 | 5 | 2 | 4 | 4 | 2 | 3 | 24 |
| A3 Case Example | 3 | 4 | 5 | 3 | 4 | 2 | 3 | 24 |
| A5 Omnisearch | 5 | 4 | 3 | 4 | 3 | 2 | 5 | 26 |
| B1 Email Search (Partial) | 4 | 4 | 2 | 4 | 3 | 2 | 4 | 23 |
| B2 Case Search (Partial) | 4 | 4 | 2 | 4 | 4 | 2 | 4 | 24 |
| B3 Access Ledger | 4 | 3 | 3 | 3 | 3 | 5 | 4 | 25 |
| B4 Index pattern | 3 | 3 | 3 | 4 | 3 | 4 | 5 | 25 |
| C1 Split Pane | 4 | 4 | 5 | 4 | 4 | 3 | 4 | 28 |

### Score takeaways

- **Best overall current balance:** `C1 Split Pane`
- **Best single entry point:** `A5 Omnisearch`
- **Best audit surface:** `B3 Access Ledger`
- **Best power-user filter workbench:** `B4 Index pattern`
- **Best fixed-case management model:** `A3 Case Example`

## 7. Settings Variant Scores

| Variant | Discoverability | Hierarchy Clarity | Navigation Efficiency | Scalability | Implementation Completeness | Total / 25 |
| --- | --- | --- | --- | --- | --- | --- |
| Tree settings (`settings`) | 4 | 5 | 4 | 5 | 3 | 21 |
| Tab settings (`settings-tabs`) | 4 | 3 | 4 | 2 | 3 | 16 |

### Settings takeaways

- The **tree variant** is the stronger long-term IA because it can scale to more categories and preserves hierarchy.
- The **tabbed variant** is faster to scan at small scale, but it flattens the IA and does not age well as categories grow.

## 8. Recommendations

### Best variants to keep describing as active contenders

1. **C1 Split Pane**
   - Best context preservation.
   - Strongest bridge between browse and action.
2. **A5 Omnisearch**
   - Best single-entry pattern.
   - Strong production candidate if terminology is cleaned up.
3. **B3 Access Ledger**
   - Best audit/reference surface.
4. **B4 Index pattern**
   - Best investigatory and filter-heavy tool.

### Variants that now read more like comparison baselines

- `A1`, `A2`, `B1`, and `B2` are still useful as behavioral reference points, but they feel more like narrowed test harnesses than ideal destination IA.
- `A3` remains valuable as the fixed-case operational model, but it still needs terminology and structure cleanup.

### Menu/toggle guidance

- Keep documenting the **top hamburger menu** as a prototype settings menu, not as the production destination for density or grouping controls.
- Explicitly note that **density is hamburger-controlled today**, while **grouping is inline today**.
- Explicitly note that **slow loading mode currently affects checks views, not portal views**.

### Terminology guidance

- Treat `Portal access` / `No Portal access` as the most stable current terminology.
- Treat `Author`, `Shared with`, `Purpose`, and `Portal Role(s)` as active terminology debt.
- Expect additional terminology options to appear as the parallel terminology workstream lands.
