# Portal Management: Approved UX Patterns

Related knowledge-base reference: `docs/knowledge-base/SPEC-PORTAL-PROTOTYPE-PATTERNS.md`

This document outlines the formalized UI patterns for the Portal Management prototype, synthesizing the exploration of UX scalability and specific interaction paradigms.

## 1. Omnisearch Logic (vs. Access Ledger)

**The Pattern:** Replacing strict "Email Search" and "Case Search" segments with a unified search bar.

**Differentiation from Access Ledger:**
The existing Access Ledger search is a global lookup that filters a static, flattened log table (returning columns: Case, Email, Role, Status). It always shows the intersection of those objects. 
The **Portal Management Omnisearch** is a context-switching management tool, not an audit log:
*   If the user searches an **Email Address**, the table columns dynamically adapt to display **Cases** (because the User is known).
*   If the user searches a **Case ID**, the table columns adapt to display **Portal Users** (because the Case is known). 

This dynamic column restructuring is what makes it an "Omnisearch" rather than simply filtering a static table.

## 2. Managing Data Density (Collapsible Grouping)

**The Pattern:** Grouping dense tables (e.g. by Role or by Status) to make long lists manageable.

*   *Prototype Implementation Note:* We will place a "Group By" toggle within the Hamburger view menu solely for the sake of exploring UI combinations in the prototype.
*   *Production Reality:* In a real enterprise product, grouping settings should not be hidden behind a generic hamburger menu. We will build a dedicated `[ Group by ▼ ]` dropdown control (e.g., `No grouping`, `Group by Status`, `Group by Court`) explicitly next to the quick filters. 

## 3. Inline Actions

**The Pattern:** Reducing friction for single-item operations without abandoning bulk multi-select capabilities.

*   **View Settings Toggle (Hamburger Menu):** We will implement a setting to toggle the user's preferred density and action layout:
    *   **Quick Actions Mode:** Explicit primary buttons (e.g., `[ Grant ]` or `[ Revoke ]`) displayed inline on every row, optimizing for speed and single-item changes.
    *   **Default/Compact Mode:** Actions hidden under an `[ ⋮ ]` row overflow menu, prioritizing data density over one-click actions, and encouraging bulk checkbox workflows.

## 4. "Inside a Case" Layout

**The Pattern:** Segmenting states vertically when context is fixed.

*   Inside a case context, search is irrelevant. The UI will strictly adopt a **Tabbed Layout**:
    *   **Tab 1:** `Active Portal Access` (Renders current users, actions = Revoke)
    *   **Tab 2:** `Missing Access` (Renders case participants lacking access, actions = Grant)
*   *Note:* The concept of a toggleable "Master List view" was rejected. The mental model remains strictly isolated by these two tabs when managing users from within a case.
