# UX-007 — Portal Access Management: 10 Concepts for A/B Exploration

**Type:** UX Exploration / Concept Evaluation
**Priority:** Exploratory
**Source:** UX/IA Review — expanded from Finding 7
**Date:** 2026-04-05

---

## Context

This project is evaluating how court registry officers manage portal access — who can see what case information through the external portal. The core operations are:

- **Search/discover** which participants have or lack portal access
- **Grant** access to case participants who need it
- **Revoke** access from participants who should no longer have it
- **Audit** what access changes were made, by whom, and when

The current prototype explores 8 variants (A1–A5, B1–B4) across three axes: search paradigm (exact/partial/adaptive/index), scope (single-case vs. global), and purpose (management vs. audit). Those variants test **table/search UX** within a broadly similar interaction shell: toolbar → table → select → act.

This ticket steps back and evaluates **10 conceptually distinct approaches** to the overall portal access management experience. Some subsume or reframe existing variants; others introduce new paradigms. The goal is to identify which 2–4 are worth prototyping as genuine A/B comparisons.

---

## The 10 Concepts

---

### Concept 1 — Search-to-Table (Current A-series baseline)

**Mental model:** "I know who or what I'm looking for. Show me the results and let me act."

The officer enters a search term (email or case number), results appear in a flat table, and actions (Grant/Revoke) are available per-row or in bulk. The table is the primary workspace. Filters refine within search results.

This is the paradigm behind A1, A2, B1, B2, and A5 (Omnisearch). It assumes the officer arrives with a known query.

**Strengths:**
- Fastest path from intent to action when the officer knows the email or case number
- Minimal cognitive overhead — search, scan, act
- Well-understood pattern for registry staff accustomed to eSeries

**Weaknesses:**
- Cold-start problem: officer must already know what to search for
- No ambient awareness of the access landscape — the system is silent until queried
- Multiple separate search pages (A1 vs. A2 vs. A5) fragment what is fundamentally the same action

**What it tests:** Whether a search-first workflow is sufficient for the primary use case, and whether Omnisearch (A5) can collapse the separate email/case entry points.

---

### Concept 2 — Case-Centric Management (Current A3 baseline)

**Mental model:** "I'm working on this case. Show me the access picture for this case and let me fix it."

The officer is already inside a case context. The UI shows all participants segmented by access state: those with active access, and those missing access (subdivided by Parties and Case Assignments). No search required — the case scope defines the data.

This is the paradigm behind A3 and the Jira's "inside a case" reference.

**Strengths:**
- Perfect mental model for case-driven work — the officer's task is scoped to one case
- Eliminates search friction entirely
- The state segmentation (Active / Missing) maps directly to the two actions (Revoke / Grant)

**Weaknesses:**
- Only works inside a case context — no global visibility
- Requires a separate global view for cross-case work (auditing, investigating a person's access across cases)
- The "Missing Access" list depends on a cross-system lookup (eSeries case data vs. Portal access data) that may surface stale or incomplete data

**What it tests:** Whether in-case management is the primary workflow, and whether it can stand alone or requires a companion global view.

---

### Concept 3 — Person-Centric Dossier

**Mental model:** "I need to understand this person's portal access across all their cases."

The officer searches for a person (by email or name) and lands on a **person profile page** showing: identity details, all cases they have access to, all cases they are a party on but lack access to, and a timeline of access changes. Actions (Grant/Revoke) are available in context on each case row.

This inverts the current table model: instead of one flat table of access records, the primary object is the **person**, and cases are listed under them.

**Strengths:**
- Answers the question "what can this person see?" in one view — no need to search case by case
- Natural fit for investigations: "a solicitor called about their access" → look up the solicitor, see everything
- The person-scoped timeline gives immediate audit context without switching to the Ledger

**Weaknesses:**
- Requires a person identity layer that may not exist cleanly in the data model (people are currently identified by email, not a unified person entity)
- More complex layout than a flat table — person header + case list + timeline
- Less efficient for bulk cross-person operations (e.g., "revoke all access for this case")

**What it tests:** Whether person-centric navigation is a better primary entry point than case-centric or query-centric for officers handling portal access inquiries.

---

### Concept 4 — Case Dashboard with Access Scorecard

**Mental model:** "Show me the access health of this case at a glance — who's in, who's missing, what changed recently."

An enhanced version of Concept 2 (case-centric) that leads with a **summary scorecard** before the data table. The scorecard shows: total parties, count with access, count without, recent changes (last 7 days), and any flagged anomalies (e.g., a party was revoked but is still listed as active counsel).

The officer scans the scorecard, identifies whether action is needed, then drills into the table below only if they need to act.

**Strengths:**
- Triage-first: the officer can assess whether a case needs attention without reading every row
- The scorecard surfaces patterns that a flat table hides (e.g., "5 of 8 parties have no access — this case may not have been onboarded properly")
- Recent-change summary provides lightweight audit without the Ledger

**Weaknesses:**
- The scorecard is only as useful as the data feeding it — if the cross-system lookup (eSeries ↔ Portal) is stale or incomplete, the counts are misleading
- Adds a layer before the actionable table — officers who already know what to do may find it a speed bump
- Requires a definition of "anomaly" or "flag" that doesn't yet exist in the data model

**What it tests:** Whether a summary/triage layer reduces the cognitive load of case access management, or whether officers prefer to go straight to the table.

---

### Concept 5 — Global Access Matrix (Case × Person grid)

**Mental model:** "Show me which people have access to which cases — the whole picture."

A two-dimensional matrix view where rows are cases and columns are people (or vice versa). Each cell shows access state (Active / Revoked / None) with a click-to-toggle action. Filters narrow the matrix by case type, court, status, or role.

This is a power-user tool for officers managing access across multiple related cases — e.g., a set of linked civil matters where the same solicitors appear across all of them.

**Strengths:**
- The only concept that shows cross-case, cross-person relationships in a single view
- Identifies gaps and inconsistencies visually (e.g., Solicitor X has access to 4 of 5 related cases — the missing one is likely an oversight)
- Click-to-toggle is extremely fast for bulk corrections

**Weaknesses:**
- Scales poorly: a matrix of 50 cases × 30 people is 1,500 cells — unusable without aggressive filtering
- Requires the user to understand both axes simultaneously — high cognitive load
- Click-to-toggle bypasses the confirmation modal pattern, which is mandated for destructive actions

**What it tests:** Whether cross-case, cross-person visibility is a real workflow need, and whether a matrix is the right way to serve it — or whether it's an analyst tool, not an operational one.

---

### Concept 6 — Task Queue (Action-oriented inbox)

**Mental model:** "Show me what needs my attention — access requests pending, anomalies to review, bulk jobs to approve."

Instead of a search-first or browse-first interface, the officer sees a **task queue**: a prioritized list of actionable items. Items include: pending access requests, recently revoked access that may need re-granting, cases with parties who lack access, and flagged anomalies from automated checks.

Each item is a discrete task with a clear action. The officer works through the queue, completing or deferring items.

**Strengths:**
- Eliminates the discovery problem entirely — the system tells the officer what needs attention instead of waiting to be asked
- Natural fit for registry workflow: officers process a queue of work items, not open-ended exploration
- Supports prioritization and assignment (who should handle this item?)

**Weaknesses:**
- Requires a task-generation engine: something must create and prioritize the items. This does not exist in the current system.
- Officers may not trust a system-generated queue — "how do I know it caught everything?"
- Less useful for ad-hoc inquiries ("a solicitor just called about their access") — those still need a search path

**What it tests:** Whether shifting from officer-initiated search to system-initiated tasks changes the efficiency and accuracy of portal access management. This is the highest-investment concept — it requires backend infrastructure, not just UI.

---

### Concept 7 — Split-Pane: Global Browse + Case Detail

**Mental model:** "Let me browse the global list on the left, and see the full case access picture on the right when I click into one."

A two-panel layout: the left pane is a compact global list (similar to B3/B4, but narrower — showing case number, participant count, status summary). Clicking a row in the left pane loads the Case Access Manager view (Concept 2) in the right pane. The officer can browse, click, review, act, and return to the list without navigating away.

This is the navigation bridge identified in UX-001, made structural: instead of a link between two separate pages, the two views are permanently co-located.

**Strengths:**
- Solves the global-to-case navigation gap by eliminating the navigation entirely
- The officer maintains global context (left pane) while working on a specific case (right pane)
- Familiar pattern in enterprise tools: email clients (inbox + message), Jira (backlog + detail), court management systems (case list + case view)

**Weaknesses:**
- Each pane has less horizontal space than a full-width view — the global list must be compact enough to be readable in ~300px, and the case view must work in ~700px
- Two panes of complex interactive content compete for attention and increase cognitive load
- The split must be responsive — if the global list is searched/filtered, the right pane must not reset unexpectedly

**What it tests:** Whether co-locating global and case views in one screen is more efficient than separate pages with navigation, or whether it creates a cramped, noisy workspace.

---

### Concept 8 — Unified Ledger with Inline Expansion

**Mental model:** "One flat list of everything. Click to expand a row and see its full context without leaving the table."

A single global table (like B3/B4) but with **expandable rows**. Clicking a row expands it inline to show: full audit details (author, date, purpose), the complete case access picture (all participants for that case, not just this one), and inline Grant/Revoke actions for related participants.

The detail panel (B3/B4) is replaced by inline expansion — the officer never leaves the table flow.

**Strengths:**
- One view, no panels, no modals for inspection — everything is in the table
- The expansion naturally answers the follow-up question: "this person has access — who else on this case does?"
- Reduces navigation to zero: search, expand, act, collapse, next

**Weaknesses:**
- Inline expansion in a dense table can be disorienting — the table height jumps, scroll position shifts, and the expanded row may push other rows out of view
- The expanded content (full case participant list) is a substantial amount of data to render inline — it's a table-within-a-table
- Does not scale to bulk operations — expanding rows one by one is slower than multi-select for high-volume work

**What it tests:** Whether inline expansion can replace the detail panel and case-scoped view, or whether the information density is too high for inline treatment.

---

### Concept 9 — Contextual Command Bar

**Mental model:** "I type what I want to do and the system helps me do it — no need to navigate to a specific screen."

A command-bar interface (similar to Spotlight, VS Code's command palette, or Linear's Cmd+K) where the officer types natural-language or structured queries: "show access for CIV-24-0000016", "revoke agnes.schlauderheide@outlook.com from all cases", "who granted access to case CIV-24-0000013".

The command bar interprets the intent, shows a preview of the results or the action that will be taken, and the officer confirms or refines.

This is the "AI prompt pattern" referenced in the Jira discussion (Jimmy's suggestion) — taken seriously as a full concept rather than dismissed.

**Strengths:**
- Fastest possible path from intent to action for officers who can articulate their goal
- Subsumes all search paradigms — email search, case search, omnisearch, and audit queries are all expressible as natural-language commands
- Scales to complex queries that are hard to express with filters: "show all cases where a party has access but their solicitor doesn't"

**Weaknesses:**
- Requires the officer to learn a query language or trust natural-language interpretation — neither is guaranteed in a court registry environment
- Error handling is harder: a misinterpreted command that revokes the wrong access is worse than a misclick on a table row
- Preview/confirmation must be bulletproof — the officer must see exactly what will happen before it happens
- Does not replace browsing — officers who don't have a specific query still need a table

**What it tests:** Whether a command-bar interface can serve as the primary entry point for portal access management, or whether it works better as an accelerator alongside a traditional table view.

---

### Concept 10 — Workflow Builder (Multi-step Grant/Revoke with Review)

**Mental model:** "I need to set up access for a new case with 8 parties. Let me build the access plan, review it, then execute it all at once."

A multi-step wizard for complex access operations. The officer selects a case (or multiple cases), then builds an **access plan**: which participants should be granted, which should be revoked, which should remain unchanged. The plan is presented as a diff-like review step before execution. The officer confirms the plan and the system executes all changes as a batch.

This is not a table or a search — it is a structured workflow for onboarding or offboarding access at scale.

**Strengths:**
- The only concept that treats multi-record access changes as a single coherent operation rather than individual actions
- The review step catches mistakes before they happen — the officer sees the full plan before committing
- Natural fit for case onboarding: "new case filed, set up access for all 8 parties" is one task, not 8 separate Grant actions
- Batch execution eliminates the per-record API anxiety flagged in the Jira Vet Notes

**Weaknesses:**
- Only useful for complex multi-record operations — overkill for "revoke one person's access"
- The wizard is a separate interaction mode from the table — the officer must know to use it
- Requires a "plan" data structure that does not currently exist in the system
- If the Portal API is inherently per-record (as noted in the Jira), the batch execution is a UI abstraction over sequential calls — which may create its own failure-handling complexity

**What it tests:** Whether structured multi-step workflows are more effective than iterative table-based actions for complex access management operations like case onboarding.

---

## Comparison Matrix

| # | Concept | Primary paradigm | Entry point | Best for | Complexity |
|---|---|---|---|---|---|
| 1 | Search-to-Table | Query → results → act | Search bar | Known-target lookups | Low (exists) |
| 2 | Case-Centric Management | Fixed context → segmented state → act | Case navigation | In-case access work | Low (exists) |
| 3 | Person-Centric Dossier | Person lookup → case list → act | Person search | Inquiry-driven ("who can see what?") | Medium |
| 4 | Case Dashboard + Scorecard | Summary → triage → drill-in → act | Case navigation | Case access health at a glance | Medium |
| 5 | Global Access Matrix | Case × Person grid → click-to-toggle | Matrix view | Cross-case, cross-person patterns | High |
| 6 | Task Queue | System-generated → prioritized → process | Inbox/queue | Proactive access management | High (backend) |
| 7 | Split-Pane Browse + Detail | Browse left → detail right → act | Two-panel view | Officers who work across cases continuously | Medium |
| 8 | Unified Ledger + Inline Expand | Browse → expand row → act inline | Flat table | Officers who want one view with no nav | Medium |
| 9 | Contextual Command Bar | Type intent → preview → confirm | Command palette | Power users, complex queries | Medium-High |
| 10 | Workflow Builder | Build plan → review → batch execute | Wizard | Case onboarding, bulk operations | High |

---

## Recommended A/B Groupings

These groupings test distinct conceptual contrasts, not minor variations within the same paradigm:

**Group 1 — Primary management paradigm:**
Concept 1 (Search-to-Table) vs. Concept 7 (Split-Pane) vs. Concept 3 (Person-Centric Dossier)
*Tests:* Is the officer's mental model "I have a query", "I'm browsing cases", or "I'm investigating a person"?

**Group 2 — In-case management depth:**
Concept 2 (Case-Centric, current) vs. Concept 4 (Case Dashboard + Scorecard)
*Tests:* Does a triage layer improve decision-making, or is it a speed bump?

**Group 3 — Power-user acceleration:**
Concept 9 (Command Bar) as a supplemental layer on top of whichever management paradigm wins Group 1
*Tests:* Is a command bar a useful accelerator, or does it add confusion?

**Group 4 — Bulk operations:**
Concept 10 (Workflow Builder) as a supplemental flow alongside the primary management view
*Tests:* Are multi-record operations common enough to justify a dedicated wizard?

Concepts 5 (Matrix), 6 (Task Queue), and 8 (Inline Expand) are the highest-risk, highest-novelty ideas — worth evaluating in a design review before committing to prototype investment.
