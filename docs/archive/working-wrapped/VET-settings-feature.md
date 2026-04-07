# Staff Review: Settings Implementation Plan

**Reviewer**: Senior Staff Engineer
**Date**: 2026-03-05
**Verdict**: ⚠️ **Revise Plan** — Scope creep risk and several architectural misalignments

---

## 1. Don't Refactor `TreeView` and `Breadcrumbs` — Wrong Scope

> [!CAUTION]
> The plan proposes refactoring two working, domain-specific components (`TreeView`, `Breadcrumbs`) into generic, controlled components. This is premature abstraction and violates YAGNI.

**Problem**: `TreeView` is tightly coupled to facility data for good reason — it renders badges (missed/due counts), uses facility-specific node types (`root`/`group`/`unit`), and has domain-specific expand/select logic. Ripping it apart to share with a settings tree that has *no badges, no counts, and completely different node types (category/subcategory)* creates a leaky abstraction.

**Recommendation**: Build a **new, simple `SettingsTree`** component for settings navigation. It's ~60 lines of JSX, it needs no badges, no counts, and no sophistication. Trying to make a single tree serve both facility hierarchy and settings categories is over-engineering. Same applies to `Breadcrumbs` — build a trivial `SettingsBreadcrumbs` or just inline the breadcrumb rendering.

---

## 2. `DesktopView` is the Wrong State Mechanism

> [!WARNING]
> Adding `'settings'` to the `DesktopView` type conflates **application navigation** with **view mode switching**.

**Problem**: `desktopViewAtom` currently toggles between `'live'` and `'historical'` — these are *modes* of the same data view. "Settings" is an entirely different *page/route*. Stuffing it into the same atom means:

- `DesktopEnhancedApp` becomes a router with `if/else` for completely unrelated views.
- `Layout.tsx` still syncs `desktopEnhancedSelectionAtom` to `desktopFilterAtom` — this will fire and set facility filters even when you're on the Settings page, because the layout doesn't know you're not looking at checks.
- `ModeToggle` (live/history tabs), `DesktopToolbar`, and the detail panel are all rendered unconditionally and will need to be hidden with `view !== 'settings'` guards everywhere.

**Recommendation**: Introduce an `activePageAtom` (e.g. `'checks' | 'settings'`) that sits *above* `desktopViewAtom`. The `Layout` renders either `<ChecksPage />` (existing `DesktopEnhancedApp` guts) or `<SettingsPage />`, cleanly. `desktopViewAtom` stays untouched.

---

## 3. Settings Belongs Under `desktop-enhanced`, Not `desktop`

**Problem**: The plan puts new files in `src/desktop/components/Settings/`. But this app runs in two modes — `desktop` (alternate) and `desktop-enhanced` (default). The Settings feature is being triggered from `DesktopEnhancedApp.tsx`, uses `Layout.tsx` from `desktop-enhanced`, and is accessed via the `SideBar` which is rendered inside `Layout`. Placing the components under `src/desktop/` creates a confusing cross-module import.

**Recommendation**: Place new settings components under `src/desktop-enhanced/components/Settings/` or under `src/features/settings/` if you want feature-colocation.

---

## 4. Missing: The Actual Settings Tree Structure

The plan lists categories from screenshot 2 (General, Privacy & Security, Race-Blind Charging, SMS, Telemetry) but never defines the **data structure** for the settings tree. This is a critical gap — the tree data determines:
- What nodes exist and their hierarchy (are subcategories children or siblings?)
- Which form component renders for each node
- How breadcrumbs are computed

**Recommendation**: Define a `SETTINGS_TREE` constant (similar to `NAVIGATION_DATA` in `SideBar.tsx`) as part of Phase 1, with explicit mapping from node IDs to form components.

---

## 5. SideBar `onClick` Architecture is Wrong

**Problem**: `SideBar.tsx` currently treats all links identically — `onClick={(e) => e.preventDefault()}`. The plan says to "bind the onClick event of this specific link to set `desktopViewAtom`", but `SideBar` has no mechanism for per-link callbacks. The data is static (`NAVIGATION_DATA`) and `renderNode` uses a generic renderer. Adding a special case for `id === 'settings'` inside `renderNode` is a code smell.

**Recommendation**: Either extend `NavNode` interface with an optional `action` callback, or let the SideBar emit a generic `onNavigate(id)` event that the parent (`Layout`) handles.

---

## Summary Table

| Issue | Severity | Action |
|:---|:---|:---|
| Premature TreeView/Breadcrumbs refactoring | High | Build new, simple settings-specific components |
| `DesktopView` conflation | High | Introduce `activePageAtom` for page-level routing |
| Wrong module location (`desktop/` vs `desktop-enhanced/`) | Med | Move to `desktop-enhanced/components/Settings/` or `features/settings/` |
| Missing settings tree data structure | Med | Define `SETTINGS_TREE` constant in Phase 1 |
| SideBar lacks per-link action mechanism | Med | Extend `NavNode` with `action` callback |

---

## Recommended Revised Approach

1. **Phase 1 (Data)**: Define `SETTINGS_TREE` constant + `settingsAtoms.ts` with navigation and form state. Introduce `activePageAtom` for page routing.
2. **Phase 2 (Components)**: Build `SettingsTree` (simple, ~60 lines), `SettingsPage`, and `SettingsForm` — all under `desktop-enhanced/components/Settings/` or `features/settings/`.
3. **Phase 3 (Integration)**: Add `NavNode.action` to SideBar. Wire "Settings" link to set `activePageAtom`. Conditionally render `<SettingsPage />` or `<ChecksPage />` in `DesktopEnhancedApp`.
4. **Phase 4 (Guard)**: Add guard in `Layout.tsx` to skip filter sync when `activePage !== 'checks'`.
