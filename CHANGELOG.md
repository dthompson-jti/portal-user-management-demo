# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]
### Changed (2026-03-27) - Portal Management UI Refinement
- **Filter Row Background**:
    - Updated the "Find within results" filter row (`.quickFilterRow`) in `PortalCaseSearch` and `PortalEmailSearch` to use the `surface-bg-secondary` background token.
    - Improved visual hierarchy by distinguishing the secondary filter row from the primary search results.
- **Example Search Terms (Landing Page)**:
    - Added interactive example search terms (Case IDs and Emails) to each scenario card on the `PortalLandingPage`.
    - Implemented monospace styling and hover-state backgrounds for examples.
    - Added "Copy" functionality to each example for quick onboarding.
- **Access Ledger Detail Panel Behavior**:
    - Restricted the side panel visibility to purely manual control via the header toggle button.
    - Removed "auto-open" behavior that previously triggered whenever a single record was selected.
    - Simplified `DesktopEnhancedApp.tsx` logic by removing `portalSelectedCount` dependency for panel visibility.
- **Design System Rules**:
    - Codified new layout invariants for "Visibility & Auto-Behavior" in `.agent/rules/design-layout-panels.md` to prevent future regressions of manual-control patterns.
### Changed (2026-03-09) - Settings Refactoring
- **Safety Checks Settings Layout**:
    - Reorganized the settings page into a lean, single-column layout for better readability on desktop.
    - Consolidated timing parameters into distinct "Normal Observation" and "Enhanced Observation" sections.
    - Integrated "Missed Check Delay" into the "General" configuration section to clarify its scope.
    - Grouped hardware and form-level settings under "Device & Form Options".
    - Updated property descriptions in `settingsData.ts` to be more precise regarding observation types.
- **Facility Safety Checks Renaming**: (Completed in previous steps) Standardized terminology to "Safety Check" across the UI.

### Changed (2026-03-04) - Navigation and Dark Mode Refinement
- **Top Nav Dark Chrome**:
    - Dark mode top-nav background deepened to `--primitives-theme-975` for stronger brand contrast.
    - Top-nav search field remains neutral dark (`grey-900` -> hover `grey-880`) for legibility.
- **Left Nav Surface Alignment**:
    - Dark mode left-nav container (`--nav-bg`) now maps to `--surface-bg-primary` to match adjacent panel surfaces.
    - Light mode left-nav surfaces restored to primary white family for consistency.
- **Dark Brand Group Rows (Left Nav)**:
    - Group rows (`Quick Access`, `Workspace`, etc.) now use dark brand tokens:
        - base/selected: `theme-950`
        - hover/selected-hover: `theme-900`
    - Open/closed group states normalized to avoid uneven row color shifts.
- **Mode Toggle Stability**:
    - Added explicit `--nav-toggle-*` semantics and migrated `ModeToggle` to these tokens.
    - Prevents light/dark inversion artifacts in `Historical / Live` toggle elevation.
- **Control Edge Softening (Dark Mode)**:
    - Stepped down border intensity for secondary/selected controls:
        - `control-border-secondary`: `grey-600`, hover/pressed `grey-500`
        - `control-border-selected`: `theme-600`, hover `theme-500`, pressed `theme-400`
    - Reduced checkbox border weight to 1px in table and form contexts.
    - Reduced quick-filter/multi-select inset "bottom lip" shadows (`-2px` -> `-1px`).

- **Panel Dimension Standardisation**:
    - Updated the default width for both the Tree Panel (left) and Side Panel (right) to **320px** for improved information density.
    - Standardized interactive resize constraints to a range of **260px** (min) and **450px** (max).
    - Unified the multi-device experience by ensuring both panels adhere to the same mechanical constraints.
- **Dynamic Font Selection**:
    - Integrated **Atkinson Hyperlegible** (Google Fonts) and **Hyperlegible Sans v1.1** (locally hosted) for improved legibility.
    - Implemented `appFontAtom` and `useAppFont` hook to dynamically sync font selection to the document root without page refresh.
    - Added a Typography section to the main menu for instant font switching (Inter, Hyperlegible, Atkinson).
    - Fixed FOUC (Flash of Unstyled Content) by applying the stored font preference in a small blocking script in `index.html`.
- **Badge Refinements**:
    - Standardized all badge and chip components to use **Medium (500)** font weight.
    - Implemented a hard limit for resident status badges, capping display to a maximum of **3** badges in table views.
    - Removed the redundant `truncateBadges` toggle and the `+N` count indicator for a cleaner, high-density visual profile.
- **MultiSelect Dropdown Evolution**:
    - Replaced traditional checkmarks with themed checkbox indicators for multi-selection dropdowns.
    - Implemented high-fidelity checkbox styling using SVG data URIs for perfect parity with standard form controls.
    - Enhanced accessibility by adding `role="menuitemcheckbox"` and `aria-checked` to dropdown items.
    - Refined item spacing and padding for a high-density, professional appearance.

### Changed
- **Default Application Settings**: Updated the prototype's factory defaults to align with operational preferences:
    - **Resident Display Mode**: Defaults to "**Left**" (Name then badges, both left-aligned).
    - **Resident Badge Text**: Defaults to "**Short**" (Acronyms like "SR", "MW").
    - **Badge Color Mode**: Defaults to "**Mode B**" (Neutral Strong/Dark).
    - **Table Font Weight**: Defaults to "**Regular**" for improved data density.
    - **Supervisor Review Requirements**: Missed checks now require a reason by default.
    - **Reason Selection Mode**: Defaults to "**None**" (Explicit clear option in dropdown).
    - **Navigation Breadcrumbs**: Location breadcrumbs now default to "**Dimmed**" for better focus on room numbers.
- **Resident Display - Left Mode**: Corrected the visual layout for "Left" mode; status badges now appear to the right of the resident's name, but the entire group is left-aligned within the cell.
- **Fixed Prototype Stability**: Resolved critical syntax and structural errors in `mockData.ts` that were causing local development server failures.
- Renamed "Require review reason" to "Reason required for missed check" in the main menu for better clarity.
- Implemented "Placeholder Reversion" UX for missed check reasons: selecting the blank option resets the dropdown to its "Select a reason..." placeholder state.
- Integrated UX research findings for clearing single-select dropdowns.
- **Mock Data Scenarios & Lifecycle**:
    - **Refined Data Generation**: Implemented realistic unit-specific scenarios in `mockData.ts`:
        - **Maple Transitional**: Simulates neglected wing rounds (all rooms 🔴 Missed).
        - **Oak Integrated**: Simulates specific neglected residents (sequential "Missed (3)" status).
        - **Cedar Assessment**: Simulates sporadic historical missed checks across various residents.
        - **Oak Enhanced**: Simulates historical sequential missed checks ("volleys").
    - **History Logic Realignment**: Missed checks that are currently "Live" (overdue) are no longer automatically injected into the historical review view. They only appear in history once the current chain of missed checks is resolved/completed, as per operational requirements.
- **Badge Truncation Configuration**:
    - Added a main menu toggle "**Truncate more than 1 badge**" to control table density.
    - When enabled, multiple risk badges for a resident are collapsed into a single badge and a `+N` counter with a detailed tooltip.
    - Simplified `ResidentStatusGroup` to handle conditional truncation logic based on global state.
- **Location Breadcrumb Configuration**:
    - Added a main menu toggle "**Dim group/unit in location**" to improve scanning of room numbers.
    - When enabled, the Group and Unit path segments use secondary foreground colors and regular font weights.
- **Terminology Update**: Changed "**Overdue**" to "**Missed**" for all live view safety checks to align with operational language.
    - Updated Tree View tooltips for missed checks.
    - Updated Global Status Widget tooltips.
    - Updated countdown timer strings (e.g., "Missed 5m").
    - Standardized internal mock data labels.
    - [x] Verify Export button appearance
    - [ ] Verify Live View default sort
    - [ ] Verify Advanced Search Resident dropdown
    - [ ] Verify Advanced Search Reviewer dropdown for missed checks.
    - **Default Selection**: Standardized the "Add supervisor review" modal to default to "Unspecified" for all new reviews, reducing initial friction for officers.
    - **UI Consistency**: Updated the fallback logic to ensure "Unspecified" is selected when no matching reason exists in an existing note.
- **Multi-Select Behavior Improvements**:
    - **Stable Anchor Logic**: Implemented `lastClickedRowRef` to ensure Shift+Click expansion/contraction behaves predictably relative to the first non-modifier click point.
    - **Visual Order Aware**: Refactored range selection to use the `DataTable`'s current visual sorting and filtering state instead of raw data order.
    - **Flicker Suppression**: Added `mousedown` interception to prevent native browser text selection and blue highlighting during multi-select operations.
    - **UI Isolation**: Applied `user-select: none` to checkboxes and action buttons to keep them distinct from text drag-selection.
- **Semantic Type Migration**:
    - **Neutral Removal**: Completely removed the `neutral` semantic type across the application (Toasts, Badges, Timers).
    - **Info Adoption**: Migrated all informational states to use the `info` semantic type for better consistency and explicit intent.
    - **Defaults**: Updated default notification and badge states to `info`.
    - **UI Cleanup**: Removed the "Neutral" option from the Badge Color Mode selector in the Main Menu.
    - **Mock Data**: Updated all mock data generators to use `info` severity for neutral/upcoming statuses.

- **Unified Filter UI**:
    - **Consolidated Layout**: Merged the standalone `FilterBar` into the `DesktopToolbar`. Filters are now managed directly within the Advanced Search panel or quick filter dropdowns.
    - **Horizontal Alignment**: Search and Advanced Search remain left-aligned, while quick filter dropdowns float to the right (via `margin-left: auto`).
    - **Results Feedback**: Relocated the record count ("Showing X of Y results") to a prominent, sticky `DataTable` footer to maximize table viewport space.
    - **Simplified Views**: Removed all legacy `FilterBar` component usage and source files.
- **ComboBox UI Refinement**:
    - **Chevron Alignment**: Standardized the dropdown chevron's position (12px right offset) and size (20px) to match the standard `Select` component.
    - **Interaction**: Added a smooth 180-degree rotation transition when the menu is opened.
- **Toast Notification Redesign**:
    - **Visuals**: Implemented high-fidelity design using solid semantic backgrounds and high-contrast typography.
    - **Typography**: Refined text to use 14px (small) for both title (semi-bold) and description (regular).
    - **Spacing**: Standardized **12px padding/icon-gap** and a tighter **4px title-to-description gap** using design tokens.
    - **Alignment**: Standardized **vertical centering** for all toast elements.
    - **Positioning**: Moved to the **bottom-right** corner.
    - **Components**: Updated leading icon (24px) and close button (Large, 40x40 with 24px icon) to match "On Solid" button standards.
    - **Terminology**: Standardized on "**Supervisor review**" (Saved/Removed) to align with recent administrative refactors.
    - **Action Link**: Switched to a streamlined underlined link style.
- **Select Item Spacing (Holistic)**:
    - **Tighter Layout**: Reduced the gap between the checkmark/icon and text in all dropdown items from `12px` (var(--spacing-3)) to `8px` (var(--spacing-2)) for a more cohesive, high-density look.
    - **Search Popover**: Fixed missing spacing in `SearchableSelect` and aligned it with the new standard 8px gap using robust overrides.
    - **Token Compliance**: Refactored `Select` and `FilterSelect` internals to use standard spacing tokens instead of hardcoded 2px gaps.
- **Terminology & Mechanical Typography**:
    - **Status Refactor**: Renamed "Commented" status to "**Reviewed**" across types, atoms, and UI components (e.g., `missed-not-reviewed`, `missed-reviewed`).
    - **Mechanical Layout**: Enforced strict use of the **en dash** (`–`) with surrounding spaces in status strings (e.g., "Missed – not reviewed").
    - **Sentence Case**: Standardized all status badge labels and filter options to use sentence case. Removed legacy CSS `text-transform: capitalize` from badges.
- **Detail Panel Animation & Performance Mastery**:
    - **Animation Sync**: Coordinated the `DetailPanel` width transition with the internal content slide using Framer Motion's `AnimatePresence`, eliminating jerky layout shifts.
    - **Resize Optimization**: Hardened the resize behavior by bypassing Framer Motion transitions during active drags using the `--panel-width` CSS variable and `data-resizing` suppression logic.
    - **Aggressive Suppression**: Implemented a CSS "kill-switch" for nested transitions during resize events, ensuring zero-lag mouse tracking.
    - **Hardware Acceleration**: Added `will-change: width` to the panel wrapper to optimize compositor re-painting.
    - **Clean Specification**: Established the **Interactive Resizing Contract** in `SPEC-ANIMATION.md` and `AGENTS.md` to prevent future regressions.
- **Badge Color Configuration**: Added user-configurable color modes for Resident Badges (A=Neutral, B=Neutral Strong, C=Warning, D=Info, E=Solid).
- **Detail Panel Layout**: Refined resident status layout (removed visual connectors, tightened spacing for multi-resident lists).
- **Breadcrumb Styling**: Updated all text items to use semi-bold font weight.
- **Lint & Type Safety**:
    - Resolved `unsafe-member-access` and `no-explicit-any` errors in `DetailPanel.tsx` and `ResidentStatusGroup.tsx`.
    - Fixed missing `useCallback` dependencies in `DetailPanel.tsx`.
- Fixed Detail Panel layout bug (full height).
- Updated Detail Panel location display (Facility added, Room unlinked).
- Updated Tree View count logic (sums missed checks).
- Added "Missed - All" option to Advanced Search.
- Added "Last 12h" and "Last 72h" time presets.
- Renamed "Northwood JDC" to "Facility" in header.
- Fixed Resident Display Menu hook violation.
- Fixed ComboBox interaction issues (jank, flash open/closed) and visual inconsistencies.
- Removed unused ComboBox variables (lint fixes).

- **Officer Combo Box Archive**:
    - **Removal**: Removed the "Use Combo Box for Officer" toggle from the main menu as the component is incomplete.
    - **Archive**: Added deprecated/archived status comments to `ComboBox.tsx` to prevent accidental usage.

## [0.1.0] - 2026-01-22
- **Resident Display - Historical View**:
    - **Feature Parity**: Enabled "Resident display" settings (Left/Right Badge, Chips) and "Warning text" settings (Short/Full) in the Historical View to match Live Monitor capabilities.
    - **Visual Fix**: Integrated `ResidentChip` component for consistent chip-style rendering.
- **Badge Text Mode**:
    - **Table Support**: Live and Historical tables now support toggling between Full Text ("Suicide Risk") and Acronyms ("SR").
    - **Detail Panel**: Reverted to strict Full Text display for maximum clarity.
    - **Shared Logic**: Standardized acronym mappings (MW, SR, AR, ER, FR, SH) across the application.
- **Breadcrumb Styling**:
    - **Refinement**: Updated breadcrumbs to use semi-bold font weight for all items and primary foreground color for the selected item, improving readability and visual hierarchy.
- **Mock Data**:
    - **Update**: Explicitly set High Risk and Medical Watch statuses for "Victor Hunt" to facilitate testing of critical indicators.

## [0.1.0-pre] - 2026-01-20
- **Advanced Search - Date Filter Interaction**:
    - **Enhanced Clickability**: Modified "Start date" and "End date" inputs to trigger the native date picker when clicking anywhere on the input field, not just the calendar icon.
    - **Native API Adoption**: Leveraged the `showPicker()` API for a seamless, browser-native experience.

- **Detail Panel - Location Tree Refinement**:
    - **High-Craft Connectors**: Implemented pixel-perfect "L-bend" tree guides with clean 90-degree angles and technical precision.
    - **Custom Iconography**: Updated location hierarchy icons to more descriptive symbols: Group (`corporate_fare`), Unit (`view_cozy`), and Room (`door_front`).
    - **Technical Alignment**: Refined vertical tracking lines to connect precisely between hierarchical levels without "bleeding" or stray segments.
- **Table View - Vertical Centering**:
    - **Uniform Alignment**: Standardized all table cells to use `vertical-align: middle`, ensuring that single-resident rows remain perfectly centered even when adjacent rows expand for multi-resident rooms.
    - **Cell Refinement**: Removed manual padding-top "hacks" and fixed-top alignments in both Live Monitor and Historical Review views.
    - **Location Cell**: Added dedicated `.locationCell` styling to the shared design system to ensure consistent vertical centering of breadcrumb paths.

### Changed (2026-01-21) - Late Session
- **Mock Data Overhaul**:
    - **Northwood JDC**: Replaced generic Facility/Alpha/Beta names with a realistic "Northwood JDC" structure using "Nature" styled groups (Cedar, Oak, Maple, Pine) and descriptive unit names (e.g., "Cedar Intake").
    - **Hotel-Style Rooms**: Room locations now display as simple numbers ("100", "101") without redundant unit prefixes.
    - **Tree View**: Updated `NavigationPanel` and `useTreeData` to reflect the new facility name and cleaner unit display.
- **Table Layout**:
    - **Column Widths**: Adjusted default widths to accommodate longer descriptive unit names. Increased Location (260px), Officer (160px), and Group (110px) columns.

### Changed (2026-01-21) - Filter & UI Refinement
- **Advanced Search Filters**:
    - **Semantic Clarification**: Renamed ambiguous "Any [Status/Officer]" options to "**All [Status/Officer]**" to clearly indicate "No Filter".
    - **New Options**: Added "**Any enhanced observation**" option to filter for both Special Risk (SR) and Medical Watch (MW) records simultaneously.
    - **Casing**: Enforced sentence case for all filter dropdown options (e.g., "Missed – no comment").
    - **Comment Reason**: Simplified options by ensuring the default "All records" state covers the "Any reason" use case.
- **UI Experience**:
    - **Scroll Behavior**: Replaced non-standard "Scroll Buttons" in `Select` dropdowns with standard native scrolling (`overflow-y: auto`) for a more natural web experience.
- **Detail Panel**:
    - **Location Tree**: Fixed indentation for Room-level nodes (depth 3) to strictly visually nest under Units.
    - **Labeling**: Renamed the root location node from generic "Facility" to specific "**Northwood JDC**".

### Changed (2026-01-21) - Late Session 2
- **Default User Settings**:
    - **Resident Display**: Defaults to `Right` (Badges).
    - **Warning Text**: Defaults to `Show full text` (e.g., "Suicide risk") instead of abbreviation.
- **Side Panel Experience**:
    - **Preview Pane Model**: Moved to a strict "Preview Pane" paradigm (finder-style).
        - **Quiet Mode (Default)**: Selecting rows does NOT open the panel.
        - **Preview Mode**: Toggling the panel ON keeps it open; selection updates content live.
        - **Auto-Open**: Added a configuration setting in the Main Menu to opt-in to "Auto-open panel on select".
- **Bulk Action Logic**:
    - **Context Aware**: The footer action now intelligently switches between "Add comment" and "Edit comments".
        - **Add**: Shown when selecting items with NO comments.
        - **Edit**: Shown when any selected item already has a comment (including mixed selection).
- **Navigation**:
    - **Menu Polish**: Refined the Main Menu popover layout for better alignment and clarity.
    - **Avatar**: Updated session display to 'JB'.

### Changed (2026-01-21)
- **Live View - Resident Badges Toggle**:
    - **Toggle**: Added a main menu toggle "Show resident chips" to enable an alternate high-visibility display mode for residents.
    - **Visual Chip**: When enabled, high-risk residents (SR/MW) are displayed in a single warning-colored chip combining name and status (e.g., `Resident Name | ⚠ SR`).
    - **Status Styling**: Updated default "Special" (SR/MW) status badges to always use warning semantic colors (Yellow/Orange) instead of neutral gray.

### Changed (2026-01-20)
- **Live View - Badges and Interactivity**:
    - **Resident Badges**: Replaced resident name links with interactive neutral badges. Clicking opens a context menu with "View resident".
    - **Location Badges**: Replaced breadcrumbs (G > U > L) with interactive neutral badges. Clicking opens a context menu with "View in Facility Management".
    - **Toggle**: Added a "Show resident badges" toggle to the main menu to switch between this new view and the classic link view.
    - **Medical Watch Icon**: Updated "Medical Watch" badge icon to a warning triangle (`warning`) to align with "Suicide Risk" visual language.
- **Live View Refinement**: Removed the Details Panel and its toggle button from the Live Monitor view to optimize focus on real-time metrics. The panel remains available in Historical Review for administrative tasks.
- **Side Panel Refinement**: Implemented "Pinned" vs "Transient" visibility modes for the Details Panel.
    - **Transient Mode**: Panel automatically shows when exactly one record is selected and hides when selection is cleared or multiple items are selected.
    - **Pinned Mode**: Panel remains open regardless of selection when explicitly toggled via the header button.
    - **Universal Support**: Enabled the side panel and its toggle button for both Live Monitor and Historical Review views.
    - **UI Standardisation**: Standardized the panel toggle button with proper tooltips, icons, and consistent pinning behavior.
- **UI Content Audit**: Standardized and enforced **Sentence case** across the entire application interface.
    - Updated over 50+ strings including tooltips, button labels, dropdown options, and selection indicators.
    - Standardized interactive cues like "Add comment", "View resident", and "Reset filters".
- **Enhanced Breadcrumbs**:
    - Ancestor path levels and chevrons now use subtle `var(--surface-fg-quaternary)` to reduce visual noise.
    - Active location (the final item) now uses `var(--control-fg-selected)` (Blue) for clear orientation.
- **View Title Refinement**: Standardized the main content area title ("Safeguard checks – Live view/Historical view") to use `var(--surface-fg-secondary)` with 18px font-weight at a left-aligned position.
- **Sidebar Search Placeholder**: Updated to "Find nav items".
- **Toolbar Search Placeholder**: Updated to "Find checks".
- **Table Action Menu**: Refined the table row action menu visibility and styling.
    - **Live View**: Removed the rightmost action column entirely to maximize horizontal space for live metrics.
    - **Historical View**: Retained the action column for administrative tasks (Add/Edit comments, etc.).
    - **Uniform Styling**: Updated the `...` menu trigger to use the standard **Tertiary** button variant, replacing the previous non-standard style.

### Removed (2026-01-20)
- **Technical Debt Cleanup**: 
    - Removed unused "More Actions" popover from the Enhanced UI.
    - Cleaned up unused variables and imports (`isMoreActionsOpen`, `Popover`, `useState`) in `DesktopEnhancedApp.tsx`.
    - Renamed Navigation Panel header from "Safeguard Checks" to "Facility".


### Added
- **Design System Hardening**: Introduced a unified Z-Index semantic scale (`--z-overlay`, `--z-modal`, `--z-toast`) in `semantics.css` to prevent layering conflicts.
- **Layout Stability**: Added `useTableAutoFit` hook to `DataTable` to reliably calculate column widths based on content rendering, removing fragile "magic number" logic.

### Changed
- **Component Hygiene**: Refactored `SearchController` and `TopNavMenu` to use semantic `<button>` elements instead of `div onClick` for improved accessibility and focus management.
- **Row Context Menu**: Migrated from manual URL-based portal positioning to **Radix UI Popover**, ensuring robust positioning, collision handling, and proper focus containment.
- **Token Adoption**: Refactored `TreeView`, `BulkActionFooter`, and `toast` CSS modules to strictly use design system tokens for spacing, typography, and z-index.

### Fixed
- **Accessibility**: Fixed inaccessible interaction patterns in key navigation components ("div buttons").
- **Layout**: Fixed inconsistent z-index usage that could lead to stacking context warring (e.g., toasts appearing under modals).
- **Sticky Rows**: Implemented "Sticky Rows" for Historical View.
    - Rows now remain visible after adding a comment (even if they violate the active filter) until navigation/refresh.
    - Fixed initial race condition in multi-select updates by implementing atomic batch updates.
    - Significantly improved UX flow for bulk-commenting "Missed" items.

### Fixed (2026-01-19) - Late Session 2
- **Supervisor Comment Refinement**:
    - **Visual Clarity**: Split the Supervisor Comment section in the Details Panel into distinct "Date", "Supervisor", and "Comment" fields.
    - **Data Integrity**: Resolved an architectural issue where Supervisor Name and Review Date were not being generated or saved by the modal.
    - **Real-time Sync**: Implemented explicit synchronization of the `activeDetailRecordAtom` to ensure the Details Panel updates immediately upon saving a comment, eliminating stale data.

### Fixed (2026-01-19) - Late Session
- **Z-Index Hierarchy Fix**:
    - **Semantics**: Audited and updated semantic z-index scale (Modals: 2000, Dropdowns: 2100).
    - **Visual Fix**: Resolved issue where "Reason for missed checks" dropdown rendered BEHIND the Supervisor Note modal.
    - **Consistency**: All overlay components (`menu.css`, `modal.css`, `popover.css`, `tooltip.css`) now strictly use semantic z-index tokens.
- **Missed Checks Logic Refinement**:
    - **Live View Consistency**: Live "Overdue" checks (which display "Missed (N)") now generate distinct "missed" records in the Historical View for each missed interval (e.g., at 15m, 30m).
    - **Visual Clarity**:
        - Open checks (Upcoming/Due/Overdue) now display "—" (em dash) in the **Actual** time column of the Details Panel instead of misleading scheduled times.
        - Checks without an assigned officer now display "—" instead of "Pending" in the Details Panel.

### Removed (2026-01-19)
- **Save Default Filter**: Removed the ability for users to save their own default filters.
    - Simplified the reset logic to always revert to factory defaults.
    - Removed the "Save as my defaults" action from the More Actions menu.

### Fixed (2026-01-18)
- **Mock Data Reliability**: Fixed a critical `ReferenceError` in `mockData.ts` caused by circular initialization order of `seededRandom`.
- **Save Filters as Default**: Fixed the "Save as my defaults" action in the enhanced view which was previously non-functional.
    - Connected the action to `saveFiltersAsDefaultAtom` to properly save user preferences.
    - Added success toast notification.
    - Ensured that saving defaults correctly resets the "modified" state of dropdowns (returning them to normal gray appearance).

### Fixed (2026-01-17)
- **Architectural Overhaul of Control States**: Fixed pixel-perfect styling for all button and select components.
    - Added missing `--control-border-selected-pressed` token to `semantics.css` (all themes) - this was causing silent shadow failures.
    - Fixed Selected button hover/pressed states to show correct 2/2/4/2 visual border model (2px sides, 4px bottom).
    - Added `!important` to selected/active pressed state styles to override variant-level `!important` declarations.
    - FilterSelect split-button now has 2px gap between trigger and clear button.
    - FilterSelect chevron now inherits theme color (blue) in selected state.
    - FilterSelect state changes are now instant (no transition animations).
    - Added comprehensive architectural invariant comments to prevent future regressions.

### Fixed (2026-01-18) - Late Session
- **Tree Count Logic**: Refined Historical View tree counts.
    - Counts now strictly reflect "Missed & Un-commented" checks.
    - **Outcome**: Counts respect the **Global Date Range** (e.g., "Last 24 Hours"), but ignore the **Status** filter.
    - This ensures the tree serves as a stable "To-Do" list for the selected period, regardless of table view status.
- **Search Legibility**: Fixed "Find" input text color.
    - Applied appropriate semantic tokens to ensure search text is clearly visible against the background.
- **Nav Item Hover**: Added hover state for selected navigation items.
    - Implemented a 1-token darker hover effect for the currently selected nav item.
- **Resident Distribution**: Refined mock data generation.
    - Residents are now uniquely assigned to 1-2 per room, preventing duplicates across the facility.
- **Live View Order**: Updated default sort to Status (Missed First) -> Scheduled Time.
    - Fixed sorting priority so "Overdue" correctly appears before "Upcoming".
    - Automatically sorts oldest missed items to the top.
- **Micro-Interactions (Tooltips)**: Implemented comprehensive tooltip support using Radix UI.
    - Added meaningful tooltips to **Status Chips** ("Missed – No Comment", etc.).
    - Added stats tooltips to the **Global Status Widget** ("Overdue: 5", "Due: 2").
    - Added tooltips to sidebar badges for context-aware counts (e.g., "Missed – No Comment" in Historical vs. "Overdue" in Live).
    - Added full-text tooltips for truncated **Supervisor Comments** in the Historical View.
    - Implemented consistent "Special Risk (High Risk Resident)" tooltip for all "SR" badges.
    - **Visuals**: Styled tooltips with regular borders (`--surface-border-primary`) instead of theme colors for a clean, neutral look in both light and dark modes.
    - **Tree View Hover**: Added hover state for tree items.
        - Items now display a `control-border-tertiary` left border on hover, providing a clear interactive cue.
    - **Tree View Selection**: Implemented default selection behavior.
        - The facility (root) node is now automatically selected on load if no other node is selected, preventing an empty details panel state.
    - **Multi-Resident Display**: Flattened mock data generation.
        - Multi-resident rooms now display as separate rows (one per resident) in both Live and Historical views, matching the 1-check-per-resident requirement.
    - **Table Sort Indicators**: Fixed double sort arrow.
        - Merged scheduled time logic into the primary Status sort.
        - Removed the explicit secondary sort from the initial table state to prevent visual clutter.
    - **Default View**: Changed default landing view.
        - The application now defaults to the **Historical View** instead of the Live Monitor on fresh sessions.


    - **Live View Refinements (2026-01-19)**:
        - **Multiple Residents**: Rooms with multiple residents now stack names vertically within the "Resident" cell.
        - **Layout Alignment**: Content now aligns to the top of the cell for multi-line rows, while centered single-resident rows are visually preserved.
        - **Status Badges**:
            - Added **Medical Watch (MW)** support with badges.
            - "MW" and "SR" badges now right-aligned with specific residents.
            - **Missed Check Counts**: Added "(N)" count to the "Missed" status badge (e.g., "Missed (3)").
        - **Context Menu**: Removed "View resident" action.
    - **Detail Panel**:
        - **Typography**: `LabelValueRow` values now use **regular** font weight (was medium/bold).
        - **Interaction**: Panel **no longer auto-opens** on row selection; manual toggle only.
        - **Officer Details**: "Officer Log" demoted to "Officer Comments" row; empty names fallback to `—`.
    - **Historical View**:
        - **Columns**: Removed "Variance", moved "Comments" to end.
        - **Export**: Removed Export button.


- **View State Synchronization**: Unified view state management across the application.
    - Removed redundant `desktopEnhancedViewAtom`.
    - Migrated all components to use the canonical `desktopViewAtom`.
    - Ensured immediate and consistent synchronization between the sidebar tree, mode toggle, and toolbar filters.
- **Filter Experience Refinement**: Cleaned up toolbar filters for improved operational focus.
    - **Live View**:
        - Updated Status dropdown options to "All", "Due", "Missed", "Upcoming".
        - Removed irrelevant "Missed – No Comment" status option.
        - Removed redundant Time Range dropdown.
    - **Historical View**: Maintained full status and time range filtering capabilities.

- **Navigation Visuals**: Reached parity with high-fidelity visual design for Sidebar and Top Navigation.
    - **Visual Hierarchy**: Refined Sidebar with "Quick Access", "Recent Cases", and "Notes Library" sections.
    - **Semantic Theme**: Implemented "Hybrid" theme for navigation (Dark top nav, Light sidebar) using new `nav-*` semantic tokens.
    - **Hover States**: Added `--nav-item-selected-hover` token for selected items (1-token darker) naturally maintaining "on-solid" foreground color.
    - **Label Renames**: Renamed "Safeguard" to "Safeguard checks" in the left navigation to match operational specifications.
    - **3-Column Top Nav**: Overhauled header layout to support System Icons (Left), Global Search (Center), and Session Actions (Right).
    - **Refined Avatar**: Updated user avatar to use high-contrast initials on a white background.
    - **Unified Spacing**: Standardized left navigation item spacing to a consistent 1px gap using Flexbox.
    - **Token Alignment**: Removed `32px`/`48px` magic numbers, replacing them with standard sizing tokens (`control-height-sm`, `avatar-size-md`).

- **Enhanced Navigation Restructuring**: Split the navigation area into two distinct rows for better visual hierarchy.
    - Added Row 1 strictly for breadcrumbs, centered vertically in a 20px height.
    - Added Row 2 for right-aligned actions (Export, More Actions, Panel Toggle) with an 8px gap.
- **Button Styling Refinement**: Reached high-fidelity skeuomorphic standards for all button variants.
    - Standardized **Primary**, **Secondary**, and **Semantic** buttons to be flat at rest (1px border) with 3px visual bottom on hover.
    - Refined the **Pressed state** with a recessed skeuomorphic inner shadow (`inset 0 2px 4px`) across all solid variants.
    - Increased **Selected Hover** logic to 4px visual bottom (2px base + 2px extra emphasis) for distinct feedback on active toggles.
    - Unified all semantic variants (Destructive, Success, Info, Warning, Alert) to follow the "flat at rest" design system rule.
- **Dropdown Standardisation**: Refined Select and FilterSelect triggers.
    - Standard dropdowns now match text input hover states (subtle 1px border).
    - Filter dropdowns now explicitly match Secondary button characteristics for rest, hover (3px), and pressed (recessed) states.
- **Button Token Standardization**: Reached 100% Figma parity for quaternary button hover and active states.
    - Restored hover borders for `quaternary` buttons across the design system.
    - Refactored `TreeView` chevrons to use the standard root `Button` component for styling consistency.
- **Mode Toggle Refinement**: Standardized the view toggle switcher.
    - Applied quaternary styling to unselected items (with borderless hover specifically for the toggle row).
    - Reduced gap and internal padding to 2px (`var(--spacing-0p5)`) for a more compact vertical rhythm.
- **More Actions Popover**: Implemented a list-style menu for the `[...]` button in the Enhanced UI.
    - Includes actions: "Generate QR codes", "Manage facilities", "Save as my defaults", and "Settings".
    - Standardized sentence casing and concise wording across all action menus.
- **Improved Alignment**: Synchronized margins for `ModeToggle` and `Breadcrumbs` to 12px (`var(--spacing-3)`) for a perfectly balanced toolbar layout.

- Smooth auto-width transitions for filter controls using mechanical (linear) motion.
- "Save Filters as Default" feature with `localStorage` persistence and dynamic time presets.
- Sticky customization state: filters track explicit user modifications and remain "active" (blue) until cleared.
- High-fidelity split-button UI for active filters with 2px borders and rock-solid segment joining.
- "Today" and "Last 24 Hours" presets to the historical time range filter.
- "Expand All" and "Collapse All" actions to the Tree View navigation menu.
- Accurate "Last 8 Hours" and ISO timestamp filtering in mock data.
- Added `group` and `unit` fields to `PanelData` for enhanced monitoring metrics.

### Changed
- Custom Time Range filter from a Popover to a refined Centered Modal.
- Refined Custom Range UI with date-only inputs, internal button alignment, and tertiary Cancel variant.
- **Advanced Search Refinement**: Reached 100% Figma parity for the Historical filter panel.
    - Standardized control height to `44px` (`--control-height-lg`) and gaps to `16px`.
    - Applied `surface-bg-secondary` background to all toolbar search bars.
    - Migrated all dropdowns to Radix-based `Select` components with 8px radii.
    - Updated typography to 14px Medium with precise 6px vertical label spacing.
- **Toolbar**: Conditionally removed "Advanced search" trigger from the Live view.
- **Design System**: Redefined `size="m"` (36px) and `size="s"` (32px) buttons to align with desktop standards.
- **Selected States**: Refined active button appearance with a 2px visual border and 4px depth on hover (Figma parity).
- **Side Panel Resizers**: Standardized resizer width to 2px and applied `control-border-selected` blue theme.
- **Component Hierarchy**: Adjusted Navigation Panel action button to `tertiary` variant for correct visual weighting.
- **Button Icons**: Added `opsz: 20` to button icons for optical clarity.
- **UI Refinement**: Standardized all Modals to use "Desktop Medium" (36px) primary actions.
- **Menu Spacing**: Redefined menu item padding (`8px 12px`) and gap (`8px`) across all dropdowns and popovers for a more compact, balanced layout.
- **Detail Panel**: Simplified Supervisor Comments display and moved "Delete" action to the editing modal.
- **Modals**: Standardized all "Cancel" actions to use `variant="secondary"` and appear on the right side.
- **Supervisor Note Modal**: Refined layout, removed extra padding, and cleaned up helper text.
- **Mobile Cleanup**: Removed `desktop-overrides.css`, `touch-action: none` (except where necessary), and hardcoded mobile touch targets.

### Fixed
- Bulk Action Footer layering issue by increasing z-index to 102.
- Layout instability by enforcing max-width on the navigation panel.
- Border flicker on side panel resizers by syncing indicator width and background color.
- **Advanced Search**: Fixed critical `SyntaxError` and Radix Select empty-value crash.

---

## [Unreleased-Previous]

### Added
- `--spacing-2p5` (10px) token to spacing specification.
- `DesktopEnhancedApp.module.css` to replace inline styles.
- `@media (hover: hover)` wrappers to prevent sticky hover states on touch devices.

### Changed
- Updated `BulkActionFooter` to use correct design tokens for radius, border, and background.
- Fixed `BulkActionFooter` hardcoded shadow values to ensure visibility as per user request.
- Normalized Z-index values across all components to strictly adhere to the layering contract (Overlays: 106).
- Replaced primitive grey tokens with semantic surface tokens in global CSS files.
- Refactored `DesktopEnhancedApp`, `Breadcrumbs`, and `EnhancedLiveMonitorView` to remove inline styles.
- Consolidated selection synchronization logic into `Layout.tsx`.

### Removed
- Obsolete `NfcScanState` type from `types.ts`.
- Redundant `walkingOrderIndex` and `completionStatus` fields from `SafetyCheck` interface.
- Inline styles from major desktop components.

---

## [1.0.0] - YYYY-MM-DD

### Added
- [Describe what was added]

### Changed
- [Describe what was changed]

### Fixed
- [Describe what was fixed]

### Removed
- [Describe what was removed]

---
