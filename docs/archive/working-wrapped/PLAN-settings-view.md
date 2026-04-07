# Implementation Plan: Settings View

> Status note (2026-04-06): This plan is only partially reflected in the current codebase. The settings page, routing, tree, tabbed variant, and Safety Check form exist, but several planned sub-sections still render placeholders. See `docs/working/README.md` for the current status board.

## Overview

Add a **System Properties / Settings** page to the desktop-enhanced app, accessible from a new "Settings" link in the Quick Access navigation. The page uses a left-side category tree and a breadcrumb-topped content area to display and edit system configuration properties.

> [!IMPORTANT]
> This plan incorporates all corrections from the senior staff review. Key decisions:
> - **No refactoring** of existing `TreeView` or `Breadcrumbs` — purpose-built settings components instead.
> - **New `activePageAtom`** for page-level routing, leaving `desktopViewAtom` untouched.
> - **Feature-colocated** under `src/features/settings/`.

---

## Phase 1: Data Layer

### [NEW] `src/features/settings/settingsData.ts`

Define the settings tree structure and mock data.

#### Settings Tree Constant

```ts
export interface SettingsNode {
  id: string;
  label: string;
  icon?: string;           // Material symbol name
  children?: SettingsNode[];
}

export const SETTINGS_TREE: SettingsNode[] = [
  {
    id: 'general',
    label: 'General',
    icon: 'settings',
    children: [
      { id: 'general.top-navigation', label: 'Top Navigation' },
      { id: 'general.email-settings', label: 'Email Settings' },
    ],
  },
  { id: 'privacy-security', label: 'Privacy & Security', icon: 'lock' },
  { id: 'race-blind-charging', label: 'Race-Blind Charging', icon: 'visibility_off' },
  { id: 'sms', label: 'SMS', icon: 'sms' },
  { id: 'telemetry', label: 'Telemetry', icon: 'monitoring' },
  {
    id: 'safety-check',
    label: 'Safety Check',
    icon: 'verified_user',
    children: [
      { id: 'safety-check.intervals', label: 'Intervals & Timing' },
      { id: 'safety-check.enhanced-observation', label: 'Enhanced Observation' },
      { id: 'safety-check.form-options', label: 'Form & Options' },
    ],
  },
];
```

#### Safety Check Properties (Mock)

```ts
export interface SafetyChecksConfig {
  bufferTime: number;                    // Minutes before max interval when check is "due" (default: 2)
  enableCheckForm: boolean;              // Whether the safety check form is enabled (default: true)
  enableCheckType: boolean;              // Whether the check type field shows on form (default: false)
  enabled: boolean;                      // Master feature toggle (default: true)
  enhancedObservation: {
    bufferTime: number;                  // Buffer before enhanced obs max interval (default: 1)
    maximumInterval: number;             // Max minutes between enhanced obs checks (default: 5)
    minimumInterval: number;             // Min interval; early warning if below (default: 1)
  };
  maximumInterval: number;              // Max minutes between standard checks (default: 15)
  minimumInterval: number;              // Min interval; early warning if below (default: 1)
  missedCheckDelay: number;             // Grace period after max before missed (default: 5)
  scanType: 'NFC' | 'QR_CODE';         // Default device scan mode (default: 'NFC')
}

export const DEFAULT_SAFETY_CHECKS: SafetyChecksConfig = {
  bufferTime: 2,
  enableCheckForm: true,
  enableCheckType: false,
  enabled: true,
  enhancedObservation: {
    bufferTime: 1,
    maximumInterval: 5,
    minimumInterval: 1,
  },
  maximumInterval: 15,
  minimumInterval: 1,
  missedCheckDelay: 5,
  scanType: 'NFC',
};
```

Each property includes a human-readable description constant for rendering help text:

```ts
export const PROPERTY_DESCRIPTIONS: Record<string, string> = {
  'bufferTime': 'Number of minutes before the maximum interval when a check is considered due.',
  'enableCheckForm': 'Determines whether the safety check form is enabled. When disabled, the app performs quick checks without prompting for details.',
  'enableCheckType': 'Determines whether the safety check type field is enabled on the safety check form.',
  'enabled': 'Determines whether the safety check feature is enabled. When disabled, no safety checks are created and related API endpoints are unavailable.',
  'enhancedObservation.bufferTime': 'Number of minutes before the enhanced observation maximum interval at which a check is considered due.',
  'enhancedObservation.maximumInterval': 'Maximum allowable time between enhanced observation safety checks before a check is marked as missed.',
  'enhancedObservation.minimumInterval': 'If an enhanced observation check is performed before the minimum interval, a warning is displayed indicating the check is early. Setting the value to 0 disables the warning.',
  'maximumInterval': 'Maximum allowable time between safety checks before a check is marked as missed.',
  'minimumInterval': 'If a check is performed before the minimum interval, a warning is displayed indicating the check is early. Setting the value to 0 disables the warning.',
  'missedCheckDelay': 'Number of minutes to wait after the maximum interval is reached before a check is marked as missed. This grace period allows time for checks completed offline to be received before a missed check is recorded. A value of 0 enables near-real-time recording of missed checks.',
  'scanType': 'Default scan mode used by devices for safety checks (NFC or QR code).',
};
```

### [NEW] `src/features/settings/settingsAtoms.ts`

```ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { STORAGE_PREFIX } from '../../config';
import { DEFAULT_SAFETY_CHECKS, SafetyChecksConfig } from './settingsData';

/** Currently selected settings tree node ID */
export const settingsSelectedNodeAtom = atom<string>('general');

/** Expanded node IDs in the settings tree */
export const settingsExpandedNodesAtom = atom<Set<string>>(new Set(['general', 'safety-check']));

/** Safety Check configuration (persisted) */
export const safetyChecksAtom = atomWithStorage<SafetyChecksConfig>(
  `${STORAGE_PREFIX}safety_checks_config`,
  DEFAULT_SAFETY_CHECKS
);
```

### [NEW] `src/data/activePageAtom.ts`

Page-level routing atom, separate from the checks view-mode atom.

```ts
import { atom } from 'jotai';

export type ActivePage = 'checks' | 'settings';

/** Top-level page routing — NOT the same as desktopViewAtom (live/historical) */
export const activePageAtom = atom<ActivePage>('checks');
```

---

## Phase 2: Components

All new components live under `src/features/settings/components/`.

### [NEW] `SettingsTree.tsx` + `SettingsTree.module.css`

A simple, purpose-built tree component for settings navigation (~80 lines).

- Takes no external state — reads `settingsSelectedNodeAtom` and `settingsExpandedNodesAtom` directly.
- Renders `SETTINGS_TREE` with expand/collapse chevrons and optional Material icons.
- **No badges, no counts** — unlike the facility `TreeView`.
- Supports two levels (category → subcategory).
- Uses project patterns: `Button` for chevrons, CSS Modules for styling.

### [NEW] `SettingsBreadcrumbs.tsx` + `SettingsBreadcrumbs.module.css`

Simple breadcrumbs derived from the currently selected settings node (~40 lines).

- Reads `settingsSelectedNodeAtom` and resolves the path from `SETTINGS_TREE`.
- Renders: `Home > Category > Subcategory` with clickable segments.
- Clicking a segment updates `settingsSelectedNodeAtom`.

### [NEW] `SettingsPage.tsx` + `SettingsPage.module.css`

The top-level settings page layout.

```
┌────────────────────────────────────────────────┐
│ [SettingsBreadcrumbs]                          │
├──────────────┬─────────────────────────────────┤
│              │                                 │
│ SettingsTree │  SettingsContent                │
│              │  (title + description +         │
│              │   form fields for selected      │
│              │   node)                         │
│              │                                 │
└──────────────┴─────────────────────────────────┘
```

- Left panel: `SettingsTree` with fixed width (~260px).
- Right panel: `SettingsBreadcrumbs` + `SettingsContent`.
- Follows dual-pane pattern from `pattern-structure.md`.

### [NEW] `SettingsContent.tsx`

Routes to the correct form based on `settingsSelectedNodeAtom`:

```ts
// Node ID → Component mapping
switch (selectedNode) {
  case 'safety-check':
  case 'safety-check.intervals':
  case 'safety-check.enhanced-observation':
  case 'safety-check.form-options':
    return <SafetyChecksForm section={selectedNode} />;
  default:
    return <PlaceholderSection title={nodeLabel} />;
}
```

### [NEW] `FacilitySafetyChecksForm.tsx`

Renders the form fields for facility safety checks configuration.

- Uses existing primitives: `Switch`, `TextInput`, `Select`.
- Each field renders with its label + description text from `PROPERTY_DESCRIPTIONS`.
- Numeric inputs use `type="number"` with `min={0}` constraints.
- Boolean fields use `Switch`.
- Enum fields (scanType) use `Select`.
- Changes write directly to `facilitySafetyChecksAtom` (auto-save via `atomWithStorage`).

### [NEW] `PlaceholderSection.tsx`

Simple "Coming soon" placeholder for unimplemented settings categories (~15 lines).

---

## Phase 3: Navigation Integration

### [MODIFY] `src/data/activePageAtom.ts` → already created in Phase 1

### [MODIFY] `src/desktop/components/SideBar/SideBar.tsx`

Two changes:

1. **Extend `NavNode` interface** with optional `action` callback:

```diff
 interface NavNode {
     type: 'section' | 'sub-section' | 'link' | 'sub-title' | 'divider';
     id: string;
     label: string;
     icon?: React.ReactNode;
     href?: string;
+    action?: () => void;
     children?: NavNode[];
 }
```

2. **Add Settings link** to `NAVIGATION_DATA` under `quick-access` and wire the action:

```diff
 {
     type: 'section',
     id: 'quick-access',
     label: 'Quick Access',
     children: [
+        { type: 'link', id: 'settings', label: 'Settings', icon: <span className="material-symbols-rounded">settings</span> },
         { type: 'link', id: 'action-items', label: 'Action Items' },
         // ... rest
     ]
 },
```

However, since `NAVIGATION_DATA` is a static constant and can't import atoms directly (it's not inside a component), we need to wire the action inside `renderNode`:

```diff
 case 'link': {
-    const isSelected = node.label === 'Safeguard checks';
+    const isSettings = node.id === 'settings';
+    const isSafeguard = node.id === 'safeguard';
+    const isSelected = isSettings
+        ? activePage === 'settings'
+        : isSafeguard
+        ? activePage === 'checks'
+        : false;
     return (
         <LeftNavigationLinkItem
             key={node.id}
             label={node.label}
             icon={node.icon}
             href="#"
             selected={isSelected}
-            onClick={(e) => e.preventDefault()}
+            onClick={(e) => {
+                e.preventDefault();
+                if (isSettings) setActivePage('settings');
+                else if (isSafeguard) setActivePage('checks');
+            }}
             level={depth}
         />
     );
 }
```

This requires adding `useAtom(activePageAtom)` to the `SideBar` component. Small, clean change.

### [MODIFY] `src/desktop-enhanced/DesktopEnhancedApp.tsx`

Wrap the existing content in a page-level conditional:

```diff
+import { useAtomValue } from 'jotai';
+import { activePageAtom } from '../data/activePageAtom';
+import { SettingsPage } from '../features/settings/components/SettingsPage';

 export default function DesktopEnhancedApp() {
+    const activePage = useAtomValue(activePageAtom);
     // ... existing code ...

     return (
         <Layout leftPanel={activePage === 'checks' ? <NavigationPanel /> : undefined}>
-            {/* existing checks UI */}
+            {activePage === 'settings' ? (
+                <SettingsPage />
+            ) : (
+                // existing checks UI (unchanged)
+            )}
         </Layout>
     );
 }
```

**Key detail**: When `activePage === 'settings'`, we pass `leftPanel={undefined}` to `Layout` so the facility tree panel is hidden and the settings page gets the full content area.

### [MODIFY] `src/desktop-enhanced/Layout.tsx`

Add a guard to skip facility filter sync when not on the checks page:

```diff
+import { activePageAtom } from '../data/activePageAtom';

 export const Layout: React.FC<LayoutProps> = ({ leftPanel, children }) => {
+    const activePage = useAtomValue(activePageAtom);

     // Sync selection to filter
     useEffect(() => {
+        if (activePage !== 'checks') return; // Guard: skip filter sync on settings
         // ... existing sync logic
-    }, [selection, setFilter]);
+    }, [selection, setFilter, activePage]);
```

---

## Phase 4: CSS Modules

### New Styles (all CSS Modules, following project conventions)

| File | Notes |
|:---|:---|
| `SettingsPage.module.css` | Dual-pane flex layout, `--panel-header-height` for header |
| `SettingsTree.module.css` | Tree rows, hover, selected state, chevron rotation |
| `SettingsBreadcrumbs.module.css` | Inline flex, chevron separators, clickable segments |
| `FacilitySafetyChecksForm.module.css` | Form field rows, label/description/input grid, section dividers |

All styles use semantic design tokens (no hex values) per project rules.

---

## File Summary

| Action | Path | Lines (est.) |
|:---|:---|:---|
| NEW | `src/data/activePageAtom.ts` | ~8 |
| NEW | `src/features/settings/settingsData.ts` | ~120 |
| NEW | `src/features/settings/settingsAtoms.ts` | ~20 |
| NEW | `src/features/settings/components/SettingsPage.tsx` | ~50 |
| NEW | `src/features/settings/components/SettingsTree.tsx` | ~80 |
| NEW | `src/features/settings/components/SettingsBreadcrumbs.tsx` | ~45 |
| NEW | `src/features/settings/components/SettingsContent.tsx` | ~35 |
| NEW | `src/features/settings/components/FacilitySafetyChecksForm.tsx` | ~120 |
| NEW | `src/features/settings/components/PlaceholderSection.tsx` | ~15 |
| NEW | 5× CSS Modules | ~250 total |
| MODIFY | `src/desktop/components/SideBar/SideBar.tsx` | ~20 lines changed |
| MODIFY | `src/desktop-enhanced/DesktopEnhancedApp.tsx` | ~15 lines changed |
| MODIFY | `src/desktop-enhanced/Layout.tsx` | ~3 lines changed |

**Total**: ~10 new files, 3 modified files. Zero existing components refactored.

---

## Verification Plan

### Automated Checks
- `npx tsc --noEmit` — Type safety across all new and modified files.
- `npm run lint` — Lint compliance.

### Browser Verification
1. Click "Settings" in Quick Access → Settings page renders with tree and breadcrumbs.
2. Click "Safeguard checks" → Returns to checks view; live/historical toggle works correctly.
3. Navigate settings tree → Breadcrumbs update, content area switches.
4. Edit a numeric field → Value persists on page reload (atomWithStorage).
5. Toggle a boolean → Switch reflects immediately, value persists.
6. Verify no `ResizeObserver` errors or filter sync side effects on Settings page.
7. Verify facility tree panel is hidden when on Settings page.

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|:---|:---|:---|
| `atomWithStorage` version bomb on new key | Low | Covered by existing `APP_VERSION` bomb in `main.tsx` |
| SideBar selected state flicker during page switch | Low | `activePageAtom` is synchronous — no async gap |
| Future settings categories need different form shapes | Med | `SettingsContent` switch pattern is extensible by design |
