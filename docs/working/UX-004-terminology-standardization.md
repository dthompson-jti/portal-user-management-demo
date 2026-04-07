# UX-004 — Standardize field terminology across all portal management views

**Type:** UX / IA Improvement
**Priority:** Medium
**Source:** UX/IA Review — Finding 4; Jira reference (`docs/jira-reference-portal-management.md`)

---

## Context

The portal management system surfaces the same underlying data fields across multiple views: the Portal Access List, the Access Ledger, the Case Access Manager, the Omnisearch, the Advanced Filter panel, and the Detail Panel. These views were built independently and use different labels for the same fields. Users correlating information across views (e.g., filtering in the Ledger and reading the Detail Panel) encounter inconsistent names for the same concept.

---

## Field-by-Field Audit

### 1. Who granted access

| Surface | Current label |
|---|---|
| Advanced filter panel | "Granted or shared by" |
| Detail panel | "Author" |
| Column header | *(not present)* |
| Jira reference | Not specified |

**Issue:** Two labels for one field. "Author" is a generic technical term that doesn't communicate the field's meaning. "Granted or shared by" is accurate but verbose, and "shared by" implies a different action than granting.

**Recommendation:** Standardize to **"Granted by"** across all surfaces. Short, accurate, and consistent with the action vocabulary used elsewhere (Grant / Revoke).

---

### 2. Portal Role(s)

| Surface | Current label | Status |
|---|---|---|
| Case Search results (Jira) | "Portal Role(s)" — values: Individual, Organisation User, Organisation Administrator | Reference only — not implemented |
| Any current view | *(not surfaced)* | Missing |

**Issue:** The Jira reference includes Portal Role as a column in Case Search results (`Individual`, `Organisation User`, `Organisation Administrator`). These are distinct portal account types, separate from the Case Participant Role. The current implementation does not expose this field in any view.

**Recommendation:** Determine whether Portal Role data is available from the API. If so, add it as a column in the Case Access Manager and Case Search results, using the Jira-specified label **"Portal Role"** and values (Individual / Organisation User / Organisation Administrator). This field is relevant to the Grant action — granting access to an Organisation Administrator has different implications than granting to an Individual.

---

### 3. Access Status

| Surface | Current label |
|---|---|
| Filter panel | "Portal access status" |
| Column badge | Active / Revoked / Expired *(no column header label in some views)* |
| Detail panel | *(shown as badge only, no label)* |
| Jira reference | Active / Removed (Revoked) — no Expired mentioned |

**Issue:** "Expired" appears in the data model and UI but is not referenced in the Jira specification. It is unclear whether Expired is a system-driven state transition (e.g., time-limited access), a legacy data state, or a third distinct status with its own meaning and actions. If it exists, it needs a definition and consistent label. The column header label ("Portal access status" in filters vs. unlabeled in some table headers) should also be standardized.

**Recommendation:** Define "Expired" in the system's terminology reference. Standardize the column header to **"Access Status"** (shorter than "Portal access status", consistent with the values it contains). Confirm whether Expired records can be re-granted or require a different flow than Revoked records.

---

### 4. Participant's role on the case

| Surface | Current label |
|---|---|
| Filter panel | "Participant role" |
| Global list column | "Case Participant Role" |
| Detail panel | "Role" |
| Jira reference | "Case Participant Role" ✓ |

**Issue:** Three labels for one field. The Jira reference specifies "Case Participant Role" as the canonical term.

**Recommendation:** Standardize to **"Case Participant Role"** across all surfaces including the filter panel ("Participant role" → "Case Participant Role") and the detail panel ("Role" → "Case Participant Role").

---

### 5. "Purpose" field

| Surface | Current label | Example values |
|---|---|---|
| Detail panel | "Purpose" | "Portal invitation for named party" |
| Any filter/column | *(not filterable or shown in columns)* | — |

**Issue:** "Purpose" surfaces system-generated strings that read as internal technical codes rather than meaningful descriptions for end users. The field name "Purpose" does not set expectations about what type of content will appear. If this field is useful for audit, it should be renamed and the values written in plain language.

**Recommendation:** Rename to **"Grant type"** or **"Access reason"** in the Detail Panel. Review the set of possible values and rewrite them in plain language. If the values are system-generated and cannot be edited, document them in the terminology reference so users and support staff can interpret them.

---

### 6. "Shared with" field

| Surface | Current label | Example values |
|---|---|---|
| Detail panel | "Shared with" | "Case participant account" |

**Issue:** The meaning and utility of this field is unclear. If it describes the type of portal account the access was granted to, it overlaps with Portal Role(s) (Issue 2 above) and may be redundant once Portal Role is surfaced properly. "Shared with" is also an unusual phrase for an access management context — it implies the record was shared, not that access was granted to a particular account type.

**Recommendation:** Clarify whether "Shared with" is distinct from Portal Role. If it represents the same data, consolidate into one field under the **"Portal Role"** label and remove the duplicate. If it is distinct, rename it to something that communicates its actual meaning.

---

## Proposed Canonical Labels

| Concept | Approved label |
|---|---|
| Who granted access | Granted by |
| Portal account type | Portal Role |
| Access status | Access Status |
| Case role | Case Participant Role |
| System grant description | Grant type *(pending review of values)* |
| Shared with | Consolidate with Portal Role *(pending investigation)* |

---

## Scope

- `src/desktop-enhanced/components/PortalAccess.tsx` — column headers, filter panel labels
- `src/desktop-enhanced/components/AccessLedger.tsx` — column headers, filter panel labels
- `src/desktop-enhanced/components/AccessLedgerDetailPanel.tsx` — detail panel field labels
- `src/desktop-enhanced/components/PortalCaseAccessManager.tsx` — column headers
- `src/desktop-enhanced/components/PortalOmnisearch.tsx` — filter and column labels
- `src/desktop-enhanced/types/portalTypes.ts` — field naming in types (if renamed)

---

## Out of Scope

- Data model changes beyond field naming
- Portal Role API integration (noted as a dependency, but a separate engineering task)
- Changes to accordion structure or navigation (see UX-001, UX-003)
