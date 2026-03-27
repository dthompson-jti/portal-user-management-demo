---
trigger: model_decision
---

# Panel Dimension Standards

Standardized widths and interactive constraints for secondary layout panels (Tree Panel, Detail Panel).

## 1. Dimensional Standards
*   **Default Width:** 320px
*   **Minimum Width:** 260px
*   **Maximum Width:** 450px

## 2. Implementation Invariants
*   **State Management:** Default widths MUST be defined in Jotai atoms (e.g., `panelWidthAtom`).
*   **Interactive Logic:** Constraints (min/max) MUST be enforced in resize handlers (e.g., `Math.max(260, Math.min(450, newWidth))`).
*   **CSS Synchronisation:** Minimum and maximum widths MUST also be mirrored in CSS/Module CSS for `.panel` or wrapper classes to prevent layout flickering during load or CSS-only transitions.
## 3. Visibility & Auto-Behavior
*   **Manual Control:** Side panels SHOULD primarily open or close via explicit user action (e.g., a header toggle button).
*   **No Auto-Popping:** For audit and management views (like Access Ledger), panels MUST NOT open automatically when selecting a single row. This prevents layout jarring during rapid row navigation.
*   **Content Synchronization:** If a panel is already open, it MUST dynamically update its content to reflect the current selection in the main results table.
*   **Preference-Based Auto-Open:** Automated panel opening (e.g., on single selection) MUST only occur if an explicit `autoOpenPanel` preference is enabled in the application state.
