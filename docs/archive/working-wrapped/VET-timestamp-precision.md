# VET: Timestamp Precision Enhancements

**Reviewer**: vet-simple
**Date**: 2026-03-06
**Plan Reviewed**: [implementation_plan.md](file:///c:/Users/dthompson/.gemini/antigravity/brain/8084a023-43a7-43c9-829a-43fd580a7702/implementation_plan.md)

---

## Executive Summary
The plan is sound and well-targeted. The primary risks involve table column width overflow when seconds are enabled and the discoverability/accessibility of hover tooltips on mobile. 

**Overall Risk**: Low
**Recommendation**: Proceed with Changes

---

## Overlooked Aspects

### Edge Cases
- ⚠️ **Empty/Null Timestamps** (Low Impact)
  - **Finding**: Mock data sometimes has `null` values for `actualTime`.
  - **Recommendation**: Ensure `formatTime` returns a fallback (e.g., `--` or `—`) rather than crashing on `new Date(null)`.

### Accessibility
- ⚠️ **Tooltip Discoverability** (Med Impact)
  - **Finding**: Screen readers may not intuitively announce that a timestamp has "Precise" information available on hover.
  - **Discovery**: Use `aria-describedby` or ensure the tooltip trigger is focusable.

### Mobile
- ❌ **Hover Tooltips** (Med Impact)
  - **Finding**: Hover tooltips don't translate to touch interfaces.
  - **Recommendation**: Ensure the toggle for "Precise tooltips" only affects the *content* of the tooltip, and consider making timestamps focusable or tap-to-show for mobile users.

### Performance
- ⚠️ **Table Re-renders** (Low Impact)
  - **Finding**: Toggling `timestampPrecisionModeAtom` will trigger a re-render of every row in the `DataTable`.
  - **Assessment**: For ~50-100 rows, this is negligible. If the table grows to 500+, we should ensure the timestamp cell is memoized.

---

## Unintended Consequences

### 1. Ripple Effect: Column Width Overflow
- **Likelihood**: High
- **Severity**: Med
- **Issue**: Current `TIMESTAMP` column `minSize` is 160px. Adding seconds (`:00`) adds ~3 characters. 
- **Mitigation**: Increase `TIMESTAMP` size to 190px and `minSize` to 170px in `tableConstants.ts`.

### 2. User Confusion: Multiple Time Toggles
- **Likelihood**: Low
- **Severity**: Low
- **Issue**: Users might confuse "Seconds in table" with a global formatting rule.
- **Mitigation**: Label clearly: "Show seconds in table" vs "Detailed tooltips".

---

## Quick Wins

1. **Update `tableConstants.ts`** (1 min)
   - Proactively bump the `TIMESTAMP` width to accommodate the extra characters.

2. **Generic `TimestampCell`** (5 min)
   - Create a small local component for rendering timestamps with built-in tooltip logic to avoid duplication between `LiveMonitor` and `HistoricalReview`.

---

## Priority Breakdown

| Priority | Count | Items |
| :--- | :--- | :--- |
| Critical | 0 | — |
| High | 1 | Column width adjustment (`tableConstants.ts`) |
| Medium | 2 | Tooltip accessibility, Null date handling |
| Low | 1 | Memoization of cells |

---

## Recommendation

**Proceed with Changes**

The plan is solid. Specific adjustments recommended before starting implementation:
1.  **Modify `tableConstants.ts`**: Increase `TIMESTAMP` width to 190px/170px.
2.  **Safety First**: Ensure `formatTime` has a robust `null`/`undefined` check.
3.  **Consistency**: Use the same `formatTime` util in both views.
