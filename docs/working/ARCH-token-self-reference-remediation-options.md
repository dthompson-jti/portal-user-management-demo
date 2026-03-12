# ARCH - Token Self-Reference Remediation Options (Cross-Project)

Date: 2026-03-12  
Status: Analysis complete, implementation pending

## 1) Problem Statement
The canonical generator is emitting self-referential semantic aliases into `semantics-core.css`. Those declarations override valid earlier values in the same `:root` block and make the affected tokens invalid at computed-value time.

This is present in:
1. `design-tokens-canonical/output/semantics-core.css`
2. `safeguard-desktop/src/styles/generated/figma-semantics-core.css`
3. `safety-check-app-concept/src/styles/generated/figma-semantics-core.css`

## 2) Confirmed Root Cause
In `design-tokens-canonical/scripts/generate-canonical.mjs`, `buildSemanticAliases()` contains identity mappings in `explicitMap` (alias name equals source name).

Identity entries:
1. `--surface-border-alert-subtle`
2. `--surface-border-warning-subtle`
3. `--surface-border-success-subtle`
4. `--surface-border-info-subtle`
5. `--control-focus-ring-standard`
6. `--control-focus-ring-error`
7. `--control-bg-disabled-subtle`
8. `--control-fg-link-default`
9. `--control-fg-link-hover`
10. `--control-fg-link-active`

Those emit lines like:
- `--control-fg-link-default: var(--control-fg-link-default);`

## 3) Impacted Tokens and Scope
Self-referential declarations found: 10 (same 10 in both apps).

Affected behavior classes:
1. Link colors (`--control-fg-link-*`)
2. Focus rings (`--control-focus-ring-*`)
3. Disabled subtle background (`--control-bg-disabled-subtle` and underscore alias chain)
4. Subtle status border variants (`--surface-border-*-subtle`)

## 4) Related Issues Found (Both Projects)
1. Dual token-source layering still exists.
- Both apps import legacy `semantics.css` and generated `figma-semantics-core.css` in the same `tokens` layer.
- Overlap is high: desktop `166` shared token names, concept `159`.
- This increases drift risk and makes regressions harder to reason about.

2. Audit gap in CI/tooling.
- `npm run audit:tokens` currently passes while self-referential declarations exist.
- No guard currently fails on `--x: var(--x);` in generated outputs.

3. Bridge dependencies are not fully canonicalized.
- `token-bridges.css` references tokens not emitted by canonical outputs (resolved today by legacy project files), including:
  - `--radius-md`, `--radius-sm`
  - `--control-height-md`
  - `--surface-shadow-sm|md|lg`
  - `--font-weight-medium`, `--font-family-sans`
- This keeps hidden coupling to legacy files and can mask cross-project differences.

## 5) Fix Options (Well-Architected)
## Option A - Surgical Generator Fix (Fastest Safe Fix)
1. Remove identity mappings from `explicitMap`.
2. Add guard in alias emission:
   - Skip when `alias === source`.
3. Regenerate and sync outputs.
4. Add CI check that fails on self-reference regex in generated CSS.

Pros:
1. Minimal change, fast recovery.
2. Directly fixes current regression class.

Cons:
1. Alias and canonical tokens still mixed in one semantics file.
2. Does not reduce long-term layering complexity.

## Option B - Canonical/Compat Separation (Recommended)
1. Keep `semantics-core.css` canonical-only (no compatibility aliases).
2. Emit aliases to a separate `semantics-compat.css` (or move alias subset into bridges with clear scope).
3. Import order:
   - canonical core first
   - compat aliases second
4. Add guardrails:
   - Reject alias names that equal canonical names.
   - Reject alias names that already exist in canonical set.
   - Reject self-references.

Pros:
1. Prevents compatibility aliases from corrupting canonical definitions.
2. Easier debugging and safer future alias additions.
3. Cleaner contract for Figma parity checks.

Cons:
1. Slightly higher implementation effort.
2. Requires one-time import update in both projects.

## Option C - Full Token-Layer Simplification (Strategic)
1. Implement Option B.
2. Reduce/remove legacy `primitives.css` and `semantics.css` imports once remaining bridge dependencies are resolved.
3. Make generated outputs the single source of truth for token values.

Pros:
1. Best long-term architecture.
2. Lowest drift and ambiguity.

Cons:
1. Highest effort and migration testing scope.
2. Requires explicit handling of remaining non-canonical dependencies.

## 6) Recommendation
Use staged delivery:
1. Immediate: Option A to stop active regression risk quickly.
2. Next: Option B to harden architecture and prevent recurrence.
3. Planned cleanup: Option C after bridge dependency audit is complete.

This sequence gives fast safety now and a durable structure without overloading the current workstream.

## 7) Validation Criteria After Fix
1. Zero self-referential declarations in:
   - canonical `output/*.css`
   - both projects `src/styles/generated/*.css`
2. `audit:tokens` passes in both projects.
3. Link/focus/disabled/background styles resolve correctly in both light and dark.
4. Documented boundary between canonical tokens and compatibility aliases.
