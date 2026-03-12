# ISSUE - Self-Referential Semantic Tokens Breaking Link Color and Other States

Date: 2026-03-12
Status: Open
Severity: High
Scope: `src/styles/generated/figma-semantics-core.css`

## Summary
In light mode, several semantic tokens are overwritten by self-referential declarations in the generated semantics file. This makes the tokens invalid at computed-value time.

One user-visible symptom is in the Details panel location links (`LinkButton`): they render as body text color (`#181D27`) instead of link blue.

## Reproduction (Details Panel Link)
1. Open desktop enhanced app and select a row to open the Details panel.
2. Inspect a Location tree link (e.g., `Northwood JDC`) rendered via `LinkButton variant="primary"`.
3. Computed style shows `color: var(--control-fg-link-default)` unresolved; browser falls back to inherited text color.

Observed: `rgb(24, 29, 39)` (`#181D27`) in light mode.
Expected: theme link color (light mode token chain resolves to `#155ACA`).

## Evidence Trace
- Link source in details panel:
  - `src/desktop/components/DetailPanel.tsx:268`
  - `src/desktop/components/DetailPanel.tsx:277`
  - `src/desktop/components/DetailPanel.tsx:286`
- LinkButton primary uses link token:
  - `src/components/LinkButton.module.css:25`
- Inherited fallback text color source in panel rows:
  - `src/components/LabelValueRow.module.css:47`

## Root Cause
In `src/styles/generated/figma-semantics-core.css`, the same tokens are first defined correctly and then redefined later as self references, e.g.:

- Correct definitions:
  - `:168 --control-fg-link-default: var(--primitives-theme-700);`
  - `:169 --control-fg-link-hover: var(--primitives-theme-900);`
  - `:170 --control-fg-link-active: var(--primitives-theme-975);`
- Broken overriding self-references later in the same cascade block:
  - `:236 --control-fg-link-default: var(--control-fg-link-default);`
  - `:237 --control-fg-link-hover: var(--control-fg-link-hover);`
  - `:238 --control-fg-link-active: var(--control-fg-link-active);`

Because the later declarations win the cascade and are self-referential, these tokens become unusable.

## Similar Issues Found (Repo Sweep)
A repository-wide CSS sweep for self-referential declarations found the following additional cases (same file):

- `:212 --surface-border-alert-subtle: var(--surface-border-alert-subtle);`
- `:213 --surface-border-warning-subtle: var(--surface-border-warning-subtle);`
- `:214 --surface-border-success-subtle: var(--surface-border-success-subtle);`
- `:215 --surface-border-info-subtle: var(--surface-border-info-subtle);`
- `:216 --control-focus-ring-standard: var(--control-focus-ring-standard);`
- `:217 --control-focus-ring-error: var(--control-focus-ring-error);`
- `:222 --control-bg-disabled-subtle: var(--control-bg-disabled-subtle);`

Total self-referential token declarations found in `src/**/*.css`: 10 (all in `figma-semantics-core.css`).

## Potential User Impact Beyond Links
These tokens are actively consumed across the app and can silently degrade styles in light mode:

- Focus ring tokens used by form fields/table/search (`--control-focus-ring-standard`, `--control-focus-ring-error`)
- Subtle status borders used by badges/chips (`--surface-border-*_subtle` aliases depend on the hyphen tokens)
- Disabled subtle background (`--control-bg-disabled_subtle` alias depends on the hyphen token)

## Recommended Fix
1. Remove or prevent emission of self-referential declarations in token generation output.
2. Ensure alias tokens map to concrete source tokens, not to themselves.
3. Add CI audit guard:
   - Fail build on regex match of `^\s*(--token):\s*var\(--same-token\);` in generated CSS.
4. Regenerate `figma-semantics-core.css` and verify:
   - Details panel links render theme link blue in light mode.
   - Focus rings and subtle borders still resolve in light and dark themes.

## Validation Commands Used
- `rg -n -P "^\s*(--[a-zA-Z0-9_-]+)\s*:\s*var\(\1\)\s*;" src --glob "**/*.css"`
- Usage cross-checks with `rg -n -F` for affected tokens in non-generated source.
