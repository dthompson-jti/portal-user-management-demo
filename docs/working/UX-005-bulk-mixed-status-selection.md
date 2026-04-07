# UX-005 — Define behavior for bulk selection across mixed access statuses

**Type:** UX / IA Improvement
**Priority:** Medium
**Source:** UX/IA Review — Finding 5

---

## Context

All portal access tables (Portal Access List, Access Ledger, Omnisearch, Case Access Manager) support multi-select with a bulk action footer. The available bulk actions depend on the status of selected records:

- **Active** records → can be Revoked
- **Revoked / Expired** records → can be Granted (re-granted)
- **Expired** records → status TBD (see UX-004)

The current implementation allows selecting records with any combination of statuses. When a mixed-status selection exists, the bulk action footer renders a context-dependent button, but does not communicate to the user which records will be actioned, which will be skipped, or why.

This is a high-stakes ambiguity: Revoke is a meaningful action in a court case management context. An officer accidentally revoking a participant's access — or unknowingly skipping records they intended to act on — has real consequences.

---

## Options

### Option A — Status-aware footer with split action buttons *(most explicit)*

Display a status breakdown in the footer: "3 active · 1 revoked selected." Show separate action buttons for each applicable action: **"Revoke 3"** and **"Grant 1"**. The user sees exactly what will happen to each group before confirming.

**Pros:** Maximum clarity. No ambiguity about scope. Appropriate for a high-stakes workflow. Aligns with how the confirmation modal already breaks down counts.

**Cons:** Two buttons in the footer adds visual complexity. Users making a deliberate homogeneous selection (all Active) see an extra button that doesn't apply to them. Requires the footer to render different button configurations based on selection composition.

**Best for:** Power users managing access across a complex case with mixed participant states. The added visual weight is justified by the stakes.

---

### Option B — Single dominant action with transparent skip rule *(most efficient)*

A single action button, labeled with the most applicable action and a qualifier for the rest:

> **"Revoke active records (3)"** — *1 revoked record will be skipped*

The skip rule is visible but subordinate. For the common case — a mostly-homogeneous selection with one outlier — this is fast and clear enough.

**Pros:** Cleaner footer than Option A. Handles the common case efficiently. Skip rule is visible, so the user is not surprised by the outcome.

**Cons:** Users who *intended* to also act on the skipped records must re-select. The word "skipped" may feel like an error. Expired records (which may not be actionable) silently disappearing from the action set could confuse users who don't understand Expired status.

**Best for:** Workflows where the dominant-status selection is the norm and occasional outliers should be handled separately.

---

### Option C — Homogeneous selection enforcement *(most restrictive)*

When a row is selected, restrict further selection to rows with the same status. Attempting to select a different-status row shows a tooltip: **"Selection is limited to [Active / Revoked] records. Clear your selection to start a new one."**

Eliminates the ambiguity entirely by making mixed selections impossible.

**Pros:** Zero ambiguity. The confirmation modal is always for a single, clear action. No need for skip logic or split buttons.

**Cons:** Most restrictive option. A user who wants to act on two groups (revoke active, grant revoked) in a single workflow must do it in two separate select-and-action passes. Requires disabled-state styling and a tooltip explanation for checkboxes that are temporarily locked out — adds implementation complexity.

**Best for:** Environments where user error in bulk actions is the primary risk and the two-pass workflow is acceptable.

---

### Option D — Pre-action grouped review step *(highest confidence)*

Mixed-status selections trigger a grouped review modal *before* the confirmation step. The review modal lists records grouped by the action that will be applied:

```
Review pending actions

Will Revoke (3):
  agnes.schlauderheide@outlook.com  — Plaintiff 1  — Active
  luke.smith@example.com            — Defendant 1  — Active
  ...

Will Grant (1):
  clark.kent@dailyplanet.com        — Solicitor    — Revoked

No action available (2 Expired):
  [records listed or count only]
```

The user can remove records from the plan before confirming. Confirming proceeds to the standard confirmation modal.

**Pros:** Highest confidence before action. User can catch mistakes before committing. The "no action available" group surfaces Expired status handling explicitly.

**Cons:** Adds a step to every mixed-selection workflow. Modal can become long for large selections — needs truncation strategy (e.g., show first 5 per group, "and N more"). Significant implementation overhead compared to Options A–C.

**Best for:** High-stakes, high-volume workflows where the cost of a mistake outweighs the cost of an extra interaction step.

---

## Recommendation

**Default implementation:** Option B — efficient, transparent, and covers the dominant use case (mostly-homogeneous selections with occasional outliers). The skip rule makes behavior legible without restructuring the footer.

**Prototype variant:** Option D — worth building as a comparison for user testing. If officers frequently manage cases with a mix of Active and Revoked participants, the grouped review step may prove its value over Option B's implicit skip behavior.

Option A is viable if testing reveals that split-button clarity is preferred over footer cleanliness. Option C should only be considered if user error rates in bulk revoke are observed to be a real problem — the restriction is a significant UX trade-off.

---

## Scope

- `src/desktop-enhanced/components/PortalDataTable.tsx` — bulk action footer logic
- `src/desktop-enhanced/components/PortalAccess.tsx` — selection state handling
- `src/desktop-enhanced/components/AccessLedger.tsx` — same
- `src/desktop-enhanced/components/PortalCaseAccessManager.tsx` — same
- Confirmation modal components — count labeling

---

## Out of Scope

- Changes to single-row actions (unaffected)
- Changes to the confirmation modal structure for homogeneous selections
- Expired status definition (dependency — see UX-004)
