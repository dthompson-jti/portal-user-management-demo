# Ticket: Case View Data Integrity and Grouping (Option A3)

**Type:** Bug / UX Refinement
**Priority:** High
**Source:** Review Meeting 2026-04-08

---

## Overview

Just had a review meeting. The Case View (Option A3) is the current priority for the portal management implementation. We need to ensure the data integrity and correct grouping behavior as users interact with the system.

## Requirements

### 1. Prioritize Case View (Option A3)
The implementation should focus on the A3 structure for the per-case view. This includes the "Active Portal Users" and "Missing Access" sections as defined in the Jira reference.

### 2. No Details Panel
Unlike the global ledger or other views, the Case View for this specific ticket will **not** have a details panel. The focus is purely on the grouped lists and their accuracy.

### 3. Data Integrity & Interrogation
> [!IMPORTANT]
> **Interrogate the data.** The current data state can be inaccurate or outdated.
- As access is granted or revoked, the UI must reflect these changes immediately.
- The system needs to verify the actual state rather than relying on stale cached values.
- "Revoked" status must be distinct from "Never Granted".

### 4. Dynamic Grouping
Items need to move to the correct according (accordion) grouping dynamically:
- When access is granted to a party in "Missing Access", they should move to "Active Portal Users".
- When access is revoked from a user in "Active Portal Users", they should move to the "Missing Access" sub-group (Revoked).
- Ensure accordions update their counts and content without requiring a full page refresh.

### 5. Summary Badge Configuration (Hamburger Menu)
A new toggle will be added to the view's hamburger menu to control the visibility and granularity of the summary badges in the header.

**Options:**
- **Off**: No summary badges are displayed.
- **2 Badges (Default)**: Shows two high-level counts:
    - Total Active
    - Total Inactive (Parties + Case Assignments)
- **3 Badges (Detailed)**: Shows three counts aligning with the A3 accordion structure:
    - Total Active
    - Total Inactive: Parties
    - Total Inactive: Case Assignments

## Concept B3: Access Ledger Search (Prioritized)

This is the prioritized "down-selected" option for the search experience.

### 1. Header/Footer Visibility Toggle
- Add a toggle to show/hide the **Search Result Header** and **Search Result Footer**.
- **Constraint:** Logic should favor showing one or the other, but not both simultaneously.

### 2. Summary Badge Sub-Option
- Within the header/footer configuration, provide a sub-option to toggle the **Summary Badges** (Active/Inactive counts).

### 3. Details Panel & Link Style
- The Details Panel **will be visible** for Concept B3.
- **Audit Info:** Show **Who granted access** and **When they granted access** within the panel.
- **Case Number Link:**
    - Display Case Numbers as a "Ghost Link" (gray style).
    - **Hover Behavior:** On hover, provide an option/affordance to open the case in a new window.
    - **Pattern Reference:** Copy the link styling and interaction from the Safeguard desktop app nearly identically.

### 4. Simplified Table Filters
For the main table view:
- **Keep:** Status filter.
- **Keep:** Case Type filter.
- **Action:** Remove all other filter objects/options to simplify the interface.

---

## Action Items

### Concept A3 (Case View)
- [ ] Interrogate the data model to ensure `accessType` and `status` are handled correctly.
- [ ] Implement the A3 structure in `PortalCaseAccessManager.tsx`.
- [ ] Remove/Disable any details panel implementation for this specific view (A3).
- [ ] Implement logic for moving records between groups based on status changes.
- [ ] Add the summary badge toggle to the hamburger menu.
- [ ] Implement state management for the header badge display (Off / 2 / 3).

### Concept B3 (Access Ledger Search)
- [ ] Implement visibility toggles for search result header/footer.
- [ ] Implement sub-option for summary badges within search headers/footers.
- [ ] Ensure details panel visibility for B3 results.
- [ ] Style Case Number links as "Ghost Links" mirroring Safeguard desktop patterns.
- [ ] Implement "Open in New Window" interaction for Case Number links.
- [ ] Add **"Who granted"** and **"When granted"** fields to the details panel.

### General UI / Global Ledger
- [ ] Remove extraneous filter objects from the main table, keeping only **Status** and **Case Type**.
