# Remove Auto-Open/Close Behavior for Access Ledger Details Panel

The Access Ledger details panel currently auto-opens when a single record is selected. This change will restrict panel visibility control exclusively to the manual toggle button in the header.

## Proposed Changes

### [App Shell Layer]

#### [MODIFY] [DesktopEnhancedApp.tsx](file:///c:/Users/dthompson/Documents/CODE/portal-management/src/desktop-enhanced/DesktopEnhancedApp.tsx)
- Update `showLedgerPanel` logic to only depend on the `isPanelOpen` state.
- Remove the dependency on `portalSelectedCount === 1` for automatic visibility.

```diff
-const showLedgerPanel = isLedger && (isPanelOpen || portalSelectedCount === 1);
+const showLedgerPanel = isLedger && isPanelOpen;
```

### [Access Ledger Component]

#### [MODIFY] [AccessLedger.tsx](file:///c:/Users/dthompson/Documents/CODE/portal-management/src/desktop-enhanced/components/AccessLedger.tsx)
- Ensure that selecting a row still updates the `portalInspectedRecordAtom` so that its details are shown *if/when* the user manually opens the panel.
- *Wait/Check*: Observe `handleSelectionChange` to ensure no side effects that might force `isPanelOpen` to true (verified: it only sets the record atom).

## Verification Plan

### Manual Verification
1. Navigate to Access Ledger.
2. Perform a search to get results.
3. Select a single row.
    - **Expected**: The side panel should **NOT** open automatically.
4. Manually click the "Open side panel" button in the header.
    - **Expected**: The side panel opens and shows the details for the selected record.
5. While the panel is open, select a different row.
    - **Expected**: The panel stays open and updates its content to the new record.
6. While the panel is open, click the "Close side panel" button in the header.
    - **Expected**: The panel closes.
7. Deselect all rows.
    - **Expected**: The panel should NOT close automatically if it was manually pinned open (standard behavior).
