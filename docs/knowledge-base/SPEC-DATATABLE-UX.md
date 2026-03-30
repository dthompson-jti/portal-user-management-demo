# STRATEGY & SPEC: Data Table UX

**Version:** 1.0
**Status:** Living Document
**Scope:** Desktop Data Table Component (`DataTable.tsx`)

## 1. Core Philosophy: "Uncompromising Control"

The guiding principle for the Data Table user experience is **predictability over automation**. The user must feel absolute control over their view.

*   **No "Magic" Resizing**: Changing one column's width must **NEVER** inadvertently resize another data column.
*   **Persistence**: Once a user sets a column width, it stays that way until they explicitly change it again.
*   **No Deadspace**: The table must always fill the full width of the container, but never at the expense of user-defined constraints.

---

## 2. Layout Architecture: "The Phantom Spacer"

To solve the conflict between "Fixed Column Widths" and "Full Width Table", we utilize a **Hybrid Layout** with a **Spacer Column**.

### 2.1 CSS Foundation
The table operates in a hybrid mode to support both fixed-width locking and horizontal scrolling.

```css
.table {
    /* 1. Allows table to scroll horizontally if content exceeds screen */
    width: max-content;

    /* 2. Forces table to stretch to at least screen width if content is sparse */
    min-width: 100%;

    /* 3. Respects exact column pixel widths */
    table-layout: fixed;
}
```

### 2.2 The Spacer Column
A dummy column (`id: 'spacer'`) is injected as the **second-to-last** column (immediately before the pinned Actions column).

*   **Role**: The "Spring" of the table.
*   **Behavior**: It absorbs **ALL** remaining pixel space in the container.
    *   If `Content < Screen`: Spacer expands to fill the void.
    *   If `Content > Screen`: Spacer collapses to 0px (or `auto` minimum).
*   **Visuals**: Invisible. No header, no cell content, `padding: 0`.

### 2.3 Sticky Pinning
The "Actions" column is pinned to the right edge.

*   **Mechanism**: `position: sticky; right: 0;`
*   **Z-Index Layering**:
    *   Header: `z-index: 15` (Above sticky content)
    *   Content: `z-index: 5`
*   **Visuals**: A `::before` pseudo-element creates a shadow gradient to indicate depth when content scrolls underneath.

---

## 3. Interaction Behaviors

### 3.1 Resizing (Manual)
*   User drags a resize handle.
*   **Only** that specific column changes size.
*   The Spacer column absorbs the delta immediately.
*   **Constraint**: Data columns must never "jump" or resize themselves to fit the new layout.

### 3.2 Double-Click Auto-Fit
*   **Trigger**: User double-clicks a resize handle.
*   **Mechanism**: "What You See Is What You Get" (WYSIWYG) Measurement.
    1.  The system scans all **currently visible** rows (virtualized window).
    2.  It uses a Canvas 2D context to measure the text pixel width of the cell content and the header.
    3.  **Buffering**: Adds `44px` padding (Safety buffer + Cell Padding).
    4.  **Clamping**: Respects global `minSize` and `maxSize` constants.
*   **Visual Constraint**: `white-space: nowrap` is enforced on all data cells. Auto-fit targets a single-line view.

### 3.3 Smart Initial Widths (The "Balanced Load")
To avoid a jarring "empty table" on first load (where the Spacer takes up 80% of the screen), we perform a **One-Time Distribution**.

*   **Trigger**: Component Mount (Initial Render).
*   **Logic**:
    1.  Measure `Container Width`.
    2.  Measure `Total Default Width` of all columns.
    3.  Calculate `Excess Space`.
    4.  Distribute `Excess Space` to "Growable" columns based on weight:
        *   **Resident**: 3x share (Primary identifier)
        *   **Notes**: 2x share (Long-form text)
        *   **Officer**: 1x share (Secondary identifier)
*   **Persistence**: This distribution sets the *initial* state. It does not lock the columns. The user can immediately resize them, and the system reverts to standard rules.

### 3.4 Data Density & Action Layouts
Tables handling dense administrative tasks (e.g., Portal Management) should support user-selectable density modes to balance readability against single-click action speed:
*   **Quick Actions Mode:** Explicit primary buttons (`[ Grant ]`, `[ Revoke ]`) displayed inline on every row. Optimizes for rapid single-item operations but consumes horizontal space.
*   **Default / Compact Mode:** Standard table layout where actions are collapsed under an `[ ⋮ ]` overflow menu or relegated to bulk-action footers. Optimizes for maximum data visibility and multi-select workflows.

### 3.5 Explanatory Grouping
When flat datatables become overwhelming (e.g., returning 200+ results), they should support inline grouping.
*   **Controls:** Grouping should be primarily controlled by a localized, explicit dropdown filter (e.g., `Group by: Status ▼`) next to other table filters, **not** buried in a generic hamburger or settings menu. *(Note: For rapid prototyping purposes in some modules, this may temporarily reside in a hamburger menu, but production implementation must elevate it to the filter bar).*
*   **Behavior:** Tables group into collapsable header rows depicting the category and count (e.g., `Active Access (12)`).

---

## 4. Visual Specs & Constants

### 4.1 Typography & Sizing
*   **Font**: Inter (500 weight for headers/data).
*   **Row Height**: Minimum `56px`.
*   **Cell Padding**: `var(--spacing-3) var(--spacing-4)` (12px 16px).
*   **Borders**: `1px solid var(--surface-border-secondary)` (Horizontal only).

### 4.2 Column Constants (`tableConstants.ts`)
| Column | Default | Min | Max | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Checkbox** | 44px | 44px | 44px | Fixed touch target (44px standard). |
| **Actions** | 48px | 48px | 48px | Fixed icon button target. |
| **Status** | 130px | 130px | - | Fits "Missed"/"On Time" lozenges. |
| **Timestamp**| 110px | 100px | - | Fits "12:00 PM". |
| **Resident** | 250px | 200px | - | Long names require generous space. |
| **Location** | 90px | 70px | - | Fits room numbers. |
| **Notes** | 200px | 150px | - | Primary variable-length content. |

### 4.3 Styles
*   **Resizer**: 12px wide hit area, visible 1px line on hover, 2px brand-colored line on active.
*   **Sticky Shadow**: `linear-gradient(to right, transparent, rgba(0, 0, 0, 0.08))` (8px width).
*   **Text Overflow**: All custom renderers (Resident, Review) must handle overflow gracefully with `ellipsis` or strict layout boundaries to prevent wrapping.

---

## 5. Loading & States Pattern

To maintain a premium feel (`Premium Shimmer`), the table avoids generic spinners in favor of high-fidelity skeletons.

### 5.1 Skeleton Strategy
*   **Initial Load**: The table renders 15 skeleton rows to fill the viewport immediately.
*   **Shape Fidelity**: Skeletons match the content's `border-radius` and generic shape:
    *   **Checkbox**: **Square** (20x20px, `border-radius: 4px`).
    *   **Actions**: **Circle** (24x24px, `border-radius: 50%`).
    *   **Text**: **Bars** (`border-radius: var(--radius-sm)`).
*   **Animation**:
    *   **Duration**: 3s `ease-in-out` infinite (Standard "Breathing" cycle).
    *   **Gradient**: High-contrast `secondary` → `tertiary` → `secondary`.

---

## 6. Infinite Scroll UX ("The Sentinel")

The table uses a "Skeleton Sentinel" pattern to provide frictionless infinite scrolling without layout jumps or "Load More" buttons.

### 6.1 The Mechanism
1.  **Normal Render**: Render all currently loaded data rows.
2.  **Sentinel Row**: If `hasMore` is true, render **ONE** additional row at the very bottom.
3.  **Appearance**: This single row is fully composed of skeleton cells (checkbox, text, actions).
4.  **Interaction**:
    *   As the user scrolls and the sentinel enters the viewport (`IntersectionObserver`), a fetch is triggered.
    *   The sentinel remains visible until new data arrives.
    *   New data replaces the sentinel instantly, and a new sentinel is appended if more pages exist.

### 6.2 Footer Feedback
*   **While Fetching**: Footer text switches from "X of Y records" to "Loading records..." with a spinner.
*   **Goal**: Provides dual feedback (visual row + system status) without obscuring content.
