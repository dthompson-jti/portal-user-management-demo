# Task: Portal Management Alignment (eSeries)

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
