# Walkthrough - Portal Management Alignment

## Overview
Successfully finalized the Portal Management module, aligning it with eSeries data standards and Safeguard desktop design patterns.
Desktop has a local semantic radius layer and imports the generated canonical token bundle, but
the migration is not complete. This document reflects the current code state rather than the
original completion claim.

## What Landed

### 1. Local Semantic Radius Adapter
- `src/styles/semantics.css` defines desktop-local semantic names such as:
  - `--radius-toolbar`
  - `--radius-container`
  - `--radius-modal`
  - `--radius-card`
  - `--radius-input`
  - `--radius-button-xs/sm/md/lg`
  - `--radius-badge`
  - `--radius-pill`
  - `--radius-tooltip`

### Final Polish & UI Alignment
- [x] Align search results with platform standard schema (eSeries) @[/build]
    - [x] Update `PortalAccessRecord` with Case Number, Case Name, Role
    - [x] Implement "Sticky Results" (rows stay visible after status change)
- [x] Refine Search Input Aesthetics
    - [x] Place search on `bg-primary` surface
    - [x] Add border/divider below search row
    - [x] Standardize Search Button: Size Medium, Square, Inset with 2px gap
    - [x] Standardize Input Borders: Use `control-border-tertiary` and hover variants
- [x] Standardize Table Mechanics
    - [x] Resolve "Column Squeezing": ensure horizontal scroll on overflow
    - [x] Eliminate "Table Tiny" scrollbars: 100% width on empty state
    - [x] Align Pinned Column Widths: 44px (select), 48px (actions) with ZERO padding
- [x] Final Verification & Hand-off
    - [x] Run `npm run lint && npm run build`
    - [x] Create `PORTAL-INTERACTION-SPEC.md` for rigor and standards
- [x] Mock Data Refinement
    - [x] Inject "dave" as a common search term for testing

### 2. Canonical Token Import Path
- Desktop imports generated canonical assets from `src/styles/generated/*`.
- Desktop also still imports local `primitives.css` and `semantics.css`, so the runtime token
  graph is a mix of local and generated sources.

## What Is Not Complete

### 1. Radius Migration
- Components still use primitive radius tokens directly in multiple places.
- Some components still use spacing tokens as radius values.
- Some components still use legacy bridge aliases.

### 2. Spacing / Geometry Migration
- Desktop still contains raw geometry literals in several component styles.
- Navigation and tree views still include local geometry decisions that have not been fully
  expressed through the canonical layout semantics.

### 3. Canonical Naming Convergence
- Desktop local semantic radius names do not yet match the canonical should-be naming family
  (`--radius-control-*`, `--radius-surface-*`).

## Current Position
- Better than primitive-only styling.
- Not yet at canonical end state.

---

## [Unreleased] (2026-03-27) - Portal UI & Interaction Refinement

### Enhanced Visual Hierarchy
- **Filter Row Background**: Updated the "Find within results" filter row (`.quickFilterRow`) in Case and Email search views to use `surface-bg-secondary`. This provides a clear visual distinction between the primary search bar and secondary result filtering.
- **Proof**: 
    - ![Filter Row Background](file:///C:/Users/dthompson/.gemini/antigravity/brain/b5892972-7f17-4607-b658-911120b64143/case_search_filter_row_1774638565995.png)

### Access Ledger Side Panel Restricted to Manual Toggle
- **Behavior Update**: Removed the automatic opening of the side panel when a single record is selected.
- **Manual Control**: The panel now ONLY opens and closes via the "Open/Close side panel" toggle in the header.
- **Content Sync**: The panel still correctly updates its content to reflect the current selection whenever it is visible.
- **Proof**: 
    - ![Access Ledger Manual Control](file:///C:/Users/dthompson/.gemini/antigravity/brain/b5892972-7f17-4607-b658-911120b64143/access_ledger_panel_verify_1774639481532.png)
    - [Interactive Verification Recording](file:///C:/Users/dthompson/.gemini/antigravity/brain/b5892972-7f17-4607-b658-911120b64143/verify_manual_panel_control_1774639317088.webp)

### Design Standards Enforcement
- **Rules Codification**: Updated `.agent/rules/design-layout-panels.md` to define "Visibility & Auto-Behavior" invariants, ensuring future agents adhere to the manual-control pattern for management views.
