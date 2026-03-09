# Implementation Plan: Refactor Safety Checks Settings Layout

Refactor the safety checks settings form to better align with user feedback regarding the relationship between Normal Observation, Enhanced Observation, and Missed Check Delay.

## Proposed Changes

### [settings]

#### [MODIFY] [SafetyChecksForm.tsx](file:///c:/Users/dthompson/Documents/CODE/safeguard-desktop/src/features/settings/components/SafetyChecksForm.tsx)
- Reorganize sections:
    - **"General"**: For "Enabled" and **"Missed Check Delay"**.
    - **"Device & Form Options"**: For **"Default Scan Type"**, "Enable Check Form", and "Enable Check Type".
    - **"Normal Observation"**: Maximum Interval, Minimum Interval, and Buffer Time (non-enhanced).
    - **"Enhanced Observation"**: Maximum Interval, Minimum Interval, and Buffer Time (enhanced).
- **Single Column Layout**: Sections are stacked vertically instead of using a side-by-side grid.

#### [MODIFY] [settingsData.ts](file:///c:/Users/dthompson/Documents/CODE/safeguard-desktop/src/features/settings/settingsData.ts)
- Update `SETTINGS_TREE` if needed to match the new UI sections (optional, depends on if we want navigation to link directly to these specific sections).
- Update `PROPERTY_DESCRIPTIONS` if any wording needs clarifying based on the new grouping.

## Verification Plan

### Manual Verification
1.  Navigate to the Settings page.
2.  Verify the "Safety Check" form sections are organized as planned:
    - Parallel sections for "Normal Observation" and "Enhanced Observation".
    - "Missed Check Delay" is in its own category.
3.  Verify that changing values in these sections still correctly updates the `safetyChecksAtom` and persists after reload.
4.  Verify the "two versions" of the settings page:
    - Normal `SettingsPage.tsx` (side navigation).
    - `SettingsTabbedPage.tsx` (tabbed navigation).
    - *Note*: I need to check where `SettingsTabbedPage` is used to verify it.
