# PLAN: MultiSelect Architectural & Visual Parity

## Objective
The goal is to eliminate "jank" and egregious visual inconsistencies in the `MultiSelect` component. It must achieve 100% parity with the standard `Select` and `FilterSelect` components in both functionality (Radix behavior) and aesthetics (Design System).

## User Impact
- **Consistency**: The "Status" dropdown in Advanced Search will finally match "Resident" and "Officer" inputs.
- **Standards**: The Toolbar "Status" chip will match the "Time Range" chip exactly.
- **Accessibility**: Users will be able to navigate multi-select items via keyboard, matching the high-craft feel of the rest of the app.

## Approach Comparison

| Approach | Pros | Cons | Effort | Risk |
| :--- | :--- | :--- | :--- | :--- |
| **Piecemeal Fixes** | Fast to implement. | Leaves underlying architectural debt ("jank"). | Low | High |
| **Architectural Alignment** (Selected) | Fixes the root cause; inherits app-wide polish; future-proof. | Requires refactoring internal component logic. | Medium | Low |

## Selected Approach
We will treat `MultiSelect` as a twin to the standard `Select`. It will use Radix primitives for state propagation and global CSS classes (`menuItem`) for visual styles. This ensures that any theme or polish update to the main design system automatically flows into `MultiSelect`.

## Implementation Phases

### Phase 1: Core Architecture (MultiSelect.tsx)
- Refactor list items from raw `divs` to focusable `buttons`.
- Propagate `triggerClassName` and `data-state` to the Radix Popover.
- Map internal item styles to the global `:global(.menuItem)` contract.

### Phase 2: Form Integration (AdvancedSearch.tsx)
- Pass the correct `selectTrigger` styles to the component to enforce "Form Mode" (48px height, white background).

### Phase 3: Toolbar Integration (MultiFilterSelect.tsx)
- Align the "split-button" container logic and "Clear (X)" button with `FilterSelect.tsx`.
- Ensure the chip height and alignment match standard Toolbar filters.

## Verification Checklist
- [ ] **Focus Test**: Tab into "Status" in Advanced Search. The focus ring must match Resident/Officer.
- [ ] **Hover Test**: Hover over dropdown items. The highlight should be identical to the "Resident" select.
- [ ] **Visual Test**: "Status" in Advanced Search is 48px high, white background, full column width.
- [ ] **Toolbar Test**: "Status" chip in Toolbar is 36px high, grey background, with a matching "X" clear button.
- [ ] **Console**: No "invalid DOM property" or "nested interactive element" warnings.
