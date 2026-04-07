# UX-006 — Grant confirmation modal: surface access-type context

**Type:** UX / IA Improvement
**Priority:** Low
**Source:** UX/IA Review — Finding 6

---

## Context

The portal management system uses confirmation modals before executing Grant and Revoke actions. The two modals are structurally parallel but not symmetric:

**Revoke modal:**
- Yellow warning banner: "Access will be removed from the selected records. You can add access again later if needed."
- Confirmation sentence with record count
- "Revoke access" button (destructive variant)

**Grant modal:**
- No banner — confirmation sentence with record count only
- "Grant access" button (primary variant)

The asymmetry is intentional: Revoke is the higher-stakes action and receives the warning treatment. Grant is treated as low-stakes and receives no contextual information.

This is an acceptable default for **Direct access** grants. However, the data model includes a second access type — **Delegated access** — where the implications of granting may differ meaningfully: a different invitation flow, a different set of permissions, or a relationship to another participant's account. The current Grant modal gives no indication that the action is different for Delegated access records.

The Jira reference also notes that each Grant action results in an individual Portal API call per record, which in some configurations may trigger an invitation email to the grantee. Users granting access to multiple Delegated records in bulk have no visibility into this before confirming.

---

## Options

### Option A — Access-type-conditional info banner *(mirrors Revoke pattern)*

Show a blue info banner *only* when the selection contains one or more Delegated access records. The banner explains what Delegated access means and what will happen next (e.g., whether an invitation is sent).

Example banner:
> **Delegated access included**
> Some selected records use Delegated access. These participants access the portal through another account holder. [Optional: "An invitation may be sent."]

Direct access grants: no banner, existing behavior unchanged.

**Pros:** Low implementation cost. Mirrors the established Revoke pattern — no new modal component needed. Only adds friction when the selection warrants it.

**Cons:** Requires the modal to inspect the selection's access types before rendering. If the distinction between Direct and Delegated is not yet well-defined in the product (see UX-004), the banner copy is hard to write accurately. Risk of writing a banner that is technically correct but not actionable.

**Best for:** Immediate implementation while the Delegated access definition is still being established.

---

### Option B — Type-aware confirmation sentence *(inline disambiguation)*

Replace the generic confirmation sentence with an access-type-aware version that names the split explicitly:

> "Grant Direct access for 2 records and Delegated access for 1 record?"

No banner required. The sentence itself carries the disambiguation.

**Pros:** No visual component additions. The type split is communicated in the primary confirmation text, where the user's attention already is.

**Cons:** The sentence becomes harder to parse as the selection grows in size or type diversity. Works cleanly for small homogeneous selections; degrades for large or mixed ones. Doesn't communicate *what* the types mean — just that they're different.

**Best for:** Simple, small selections where the user is already aware of the Direct / Delegated distinction.

---

### Option C — Record preview list in the modal *(highest pre-action visibility)*

For selections of ≤ 5 records, list each record inline within the modal body:

```
agnes.schlauderheide@outlook.com   Direct access    Active
clark.kent@dailyplanet.com         Delegated access Revoked
```

For selections > 5, summarize by type: "2 × Direct access · 1 × Delegated access."

The user can review exactly what they are about to grant before confirming — without needing to remember what they selected in the table.

**Pros:** Highest confidence before action. Catches cases where a user accidentally included an unintended record. Naturally exposes the type split without dedicated copy.

**Cons:** Modal height grows with selection size. Requires a truncation strategy for bulk operations (25+ records — the list becomes a scrollable component). Adds meaningful implementation effort. May slow down power users who are confident in their selection and just want to confirm quickly.

**Best for:** Long-term UX standard across the product once a record-preview pattern is established.

---

### Option D — Invitation preview for Delegated access *(highest specificity)*

When the selection contains Delegated access records, show an expandable "Preview invitations" section within the modal. The preview renders the invitation details that will be sent: email address, access level, case reference, and account relationship.

**Pros:** Maximum transparency. The officer can verify the right person will receive the right invitation before committing. Particularly valuable in court management contexts where a misdirected invitation to a portal case is a real operational risk.

**Cons:** Requires the system to know and render the invitation template at confirmation time — a non-trivial API integration. Most implementation-heavy option. The value is contingent on whether invitation previews are technically feasible from the Portal API. Best suited as a future-state enhancement.

**Best for:** Environments where the cost of a misdirected portal invitation is high and the API supports invitation preview.

---

## Recommendation

**Implement now:** Option A — conditional info banner for Delegated access. Low cost, targeted, consistent with the existing Revoke modal pattern.

**Future target:** Option C — record preview list. Strongest long-term UX. Revisit when preview patterns are established elsewhere in the product (e.g., bulk email send confirmations, bulk case assignment changes).

Options B and D are valid but narrower: B degrades at scale, D requires API work that may not be prioritized alongside the UX changes.

---

## Scope

- Confirmation modal for Grant action — conditional banner rendering
- `src/desktop-enhanced/types/portalTypes.ts` — confirm `accessType` field is available at the point of modal render
- No changes to the Revoke modal
- No changes to table selection behavior

---

## Out of Scope

- Defining what Delegated access means at a product level (a prerequisite — see UX-004)
- Portal API invitation preview integration (Option D prerequisite)
- Changes to the Revoke confirmation modal structure
