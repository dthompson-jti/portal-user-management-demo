# Token Audit Report: safeguard-desktop

Generated: 2026-03-12T19:55:59.345Z
Strict mode: off

Scope note:
- This report verifies canonical sync, missing/unresolved tokens, self-references, and raw
  geometry literals.
- It is not a full migration-completeness report for spacing/layout/radius semantics.
- Tokenized but non-canonical patterns such as spacing-used-as-radius, legacy bridge alias
  consumption, or local-vs-canonical semantic naming drift may still exist even when this report
  passes.

## Summary
- canonical sync issues: 0
- missing canonical tokens: 0
- unresolved token usages: 0
- self-referential token definitions: 0
- raw geometry literal findings: 16

## Canonical Sync Issues
- none

## Missing Canonical Tokens
- none

## Unresolved Token Usages
- none

## Self-Referential Token Definitions
- none

## Raw Geometry Literal Inventory
- src/desktop/components/DesktopHeader.module.css:7 -> `height: 44px !important;`
- src/desktop/components/DetailPanel.module.css:24 -> `width: 2px !important;`
- src/desktop/components/DetailPanel.module.css:54 -> `width: 2px !important;`
- src/desktop/components/DetailPanel.module.css:76 -> `height: 44px !important;`
- src/desktop/components/SideBar/LeftNavigationSubTitle.module.css:5 -> `padding: 0 16px 0 34px;`
- src/desktop/components/SideBar/LeftNavigationSubTitle.module.css:7 -> `margin: 4px 0;`
- src/desktop-enhanced/components/NavigationPanel.module.css:3 -> `height: 32px !important;`
- src/desktop-enhanced/components/NavigationPanel.module.css:4 -> `width: 32px !important;`
- src/desktop-enhanced/components/NavigationPanel.module.css:21 -> `height: 44px !important;`
- src/desktop-enhanced/components/TreeView.module.css:12 -> `border-radius: 0 6px 6px 0;`
- src/desktop-enhanced/components/TreeView.module.css:57 -> `left: calc(12px + 4px - 1px);`
- src/desktop-enhanced/components/TreeView.module.css:164 -> `padding: 2px 8px;`
- src/desktop-enhanced/Layout.module.css:55 -> `width: 2px !important;`
- src/features/settings/components/SettingsBreadcrumbs.module.css:7 -> `padding: 12px 16px;`
- src/features/settings/components/SettingsNavigationPanel.module.css:32 -> `width: 28px !important;`
- src/features/settings/components/SettingsNavigationPanel.module.css:33 -> `height: 28px !important;`
