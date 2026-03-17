# Walkthrough - Desktop Radius/Spacing Status

## Overview
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
- Should be treated as a partial adapter layer that still needs cleanup and renaming.
