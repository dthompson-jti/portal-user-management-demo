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
- [x] **Phase 1: Component Implementation**
    - [x] Add example search terms to `PortalLandingPage.tsx`
    - [x] Implement `handleCopy` logic
- [x] **Phase 2: Styling**
    - [x] Update `PortalLandingPage.module.css` with modern styling for examples
- [x] **Phase 3: Verification**
    - [x] Run `npm run lint`
    - [x] Verify functionality (manual check in browser view)
- [x] **Phase 4: Wrap-up**
    - [x] Call `/wrap-up`
    - [x] Create `PORTAL-INTERACTION-SPEC.md` for rigor and standards
- [x] Mock Data Refinement
    - [x] Inject "dave" as a common search term for testing
