# PRD: Side Panel Behavior Refinement

## 1. Problem Statement
The current side panel implementation conflates "Transient" (auto-open on selection) and "Pinned" (manually open) states. This leads to user confusion, specifically:
- Clicking "Close" on a transiently open panel paradoxically "Pins" it open because the toggle logic manages a boolean `isPanelOpen` state separate from the selection-driven visibility.
- Users cannot easily "Close" the panel without also clearing their selection, or understanding if they are clearing selection.

## 2. Goals
- **Eliminate Ambiguity**: Establish clear, distinct states for the side panel (Transient vs. Pinned).
- **Predictable Control**: Ensure the "Close" button always hides the panel.
- **Persistent Context**: Allow users to "Pin" the panel to keep it open while changing selections or navigating.

## 3. Proposed Solution: The "Pin" Interaction Model
We will adopt a "Transient by Default, Pin to Persist" model, similar to patterns found in Slack threads or VS Code sidebars.

### 3.1 Core States (Refined)

| State | Visibility | Trigger | Description |
| :--- | :--- | :--- | :--- |
| **Closed** | Hidden | Default on load / Explicit Close | Panel is hidden. |
| **Transient** | Visible | Single Row Selection | Panel opens automatically to show context. Closes if selection clears. |
| **Pinned** | Visible | User clicks "Open" or "Pin" | Panel stays open regardless of selection. Shows empty state if nothing selected. |

### 3.2 Interaction Matrix (Split Control Model)

| Current State | User Action | Resulting State | Selection Impact |
| :--- | :--- | :--- | :--- |
| **Closed** | Select Row | **Transient** | Updates |
| **Closed** | Click Toolbar "Open" | **Pinned** | none (Empty State) |
| **Transient** | Select Another Row | **Transient** | Updates |
| **Transient** | Click Toolbar "Close" | **Closed** | **Clears Selection** (Primary hide action) |
| **Transient** | Click Panel "Pin" Btn | **Pinned** | none |
| **Transient** | Click Panel "Close" (X) | **Closed** | **Clears Selection** |
| **Pinned** | Select Row | **Pinned** | Updates |
| **Pinned** | Click Toolbar "Close" | **Closed** | **Preserves Selection** (just hides panel) |
| **Pinned** | Click Panel "Unpin" Btn | **Transient** | none |
| **Pinned** | Click Panel "Close" (X) | **Closed** | **Preserves Selection** |

### 3.3 UI Changes

#### Toolbar (Above Table)
- **Button**: Standard "Right Panel" toggle icon (`right_panel_open` / `right_panel_close`).
- **Behavior**: STRICTLY Open/Close.
    - **Crucial Fix**: If the panel is open (even transiently), this button should look "Active/Navigated" and clicking it should Close the panel.

#### Panel Header
- **Actions**:
    1.  **Pin/Unpin**: New icon button.
        - Icon: `keep` (Pin) vs `keep_off` (Unpin) or Outline/Filled variants.
        - Tooltip: "Keep panel open".
    2.  **Close**: Standard `close` (X) icon.

## 4. Technical Requirements
- **State Migration**: Refactor `isPanelOpen` to `isPanelPinned`.
- **Visibility Logic**:
    ```typescript
    const showPanel = isPanelPinned || (selectedCount === 1);
    ```
- **"Close" Logic**:
    ```typescript
    const handleClose = () => {
        if (isPanelPinned) setIsPanelPinned(false);
        if (selection) clearSelection();
    }
    ```

## 5. Accessibility
- **Focus Management**:
    - Opening panel (Transient) should NOT steal focus (keep it on grid).
    - Opening panel (Manual) should move focus to first interactive element in panel.
- **Announcements**: Screen readers should announce "Detail panel opened" or "pinned".

## 6. Validation Risks
- **Risk**: Users expecting "Close" to just hide the panel (keep selection) might be annoyed if it clears selection.
- **Mitigation**: Ensure row selection is clearly linked to panel presence. (Closing panel = "I am done with this item").

