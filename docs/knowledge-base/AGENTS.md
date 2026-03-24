# Agent Charter & Execution Protocol

This document defines the operating protocol for AI agents working on the Screen Studio codebase. Its purpose is to maximize the probability of a correct, complete, and architecturally sound "one-shot" outcome for any given task.

## Prime Directive: One-Shot Excellence

The agent's primary goal is to deliver a complete and correct solution in a single response, minimizing the need for iterative correction. This is achieved by adhering to three pillars:

1.  **Holistic Analysis:** Before writing code, the agent must ingest and synthesize **all** provided context: the user's request, the PRD, the project `README.md`, `CSS-PRINCIPLES.md`, and all relevant existing code files.
2.  **Systematic Diagnosis:** When faced with a bug, the agent must not guess. It must systematically form multiple hypotheses, gather evidence, and select a solution that addresses the root cause.
3.  **Comprehensive Delivery:** A "one-shot" response is not just code. It is a complete solution package, including all necessary file operations, code modifications, documentation updates, and a strategic verification plan.

## Standard Execution Algorithm (Internal)

For any non-trivial task (e.g., implementing a PRD), the agent must follow this internal thought process *before* generating the final output:

1.  **Ingestion & Synthesis:** Read and fully comprehend the entire user request and all context files.
2.  **Impact Analysis & Dependency Mapping:** Create a definitive list of all files that will be **Created, Read, Updated, or Deleted (CRUD)**.
3.  **Virtual Refactoring (The Mental Walkthrough):**
    *   **Example Simulation (Persistence Strategy):** *"I am adding a new user preference. Should this reset on reload? If no, I must use `atomWithStorage`. If yes, a standard `atom` is sufficient. I must clarify this distinction in the implementation."*
    *   **Example Simulation (Sensory Cohesion):** *"I am adding a 'Save' action. A visual change is not enough. The correct architecture is to trigger a visual success state to provide tangible confirmation."*
    *   **Example Simulation (List Stability / The "Ghost Item"):** *"I need to animate a list item freely leaving the screen. A naive approach is to filter it out of the data immediately. Hypothesis: This causes the item to vanish instantly or the list to jump. The correct architecture is to KEEP the item in the list (`AnimatePresence` requirement) but use a **Computed Display Group** (based on its original timestamp) to anchor it in place visually until the exit animation completes."*


## UI & Component Standards

### 1. High-Precision Implementation
*   **Verify Paths First:** never guess file locations. Always verify path existence (e.g., `src/types.ts` vs `src/data/types.ts`) before importing or editing to prevent build errors.
*   **Holistic Fixes:** Do not patch a symptom. Trace the root cause (e.g., if a style is missing, check the global theme variables first).
*   **Lint Proactively:** Run `npm run lint` immediately after making structural changes (moving files, refactoring atoms).
*   **Error Feedback Standard:** User-facing errors must follow the `[Problem].\n[Actionable Solution].` pattern (e.g., "Camera not responding.\nTry restarting your device."). Use the `alert` variant for blocking errors.

### 2. List Items
*   **Directive:** Do not create custom list item components (e.g., `MyFeatureListItem`, `RoomRow`).
*   **Solution:** Always use the `ActionListItem` component.
*   **Reasoning:** Enforces the "Golden Row" pattern (56px height, consistent padding, full-width separators) defined in `list.css`.

### 2. Context Switching
*   **Directive:** When displaying the Facility Group/Unit selector, use the `ContextSwitcherCard` component.
*   **Reasoning:** Ensures consistency between the Side Menu and the NFC Provisioning workflow.

### 3. Icons
*   **Material Symbols Rounded:** Use for icons inside the authenticated app shell.
*   **Icon Size Token Scale (`--icon-size-*`):**
    | Token | Size | Use Case |
    |:------|:-----|:---------:|
    | `xs` | 12px (0.75rem) | Hotkey hints, XS button text |
    | `sm` | 16px (1rem) | XS button icons, menu chevrons |
    | `md` | 20px (1.25rem) | **DEFAULT** - Standard UI icons (buttons, lists, toggles, toast close) |
    | `lg` | 24px (1.5rem) | Header icons, **Navigation icons (Side Menu, Switchers)** |
    | `xl` | 32px (2rem) | Feature icons, status indicators |
    | `2xl` | 48px (3rem) | Hero icons, empty states |
*   **Navigation Icon Promotion:** Side Menu list items, User Profile card icons, and Facility Switcher icons use `--icon-size-lg` (24px) for improved touch confidence. This is applied via contextual CSS overrides in `AppSideMenu.module.css` and `ContextSwitcherCard.module.css`.
*   **Button Size Pairing:** Use `size="lg"` for header/navigation icon buttons (menu, back, close) to get 48px touch targets with 24px icons. Never use `size="m"` + CSS override for header buttons.
*   **Fill Settings:**
    *   **UI Icons:** Filled (`font-variation-settings: 'FILL' 1`) for active/prominent states.
    *   **Hero Icons:** Outlined (`font-variation-settings: 'FILL' 0`) for Success/Error status screens.
*   **Critical Icons (SVG):** Login/splash use SVG components from `CriticalIcons.tsx` to avoid blocking on font download.
*   **Color:**
    *   Leading icons in lists: `var(--surface-fg-quaternary)`.
    *   Interactive icons: `var(--surface-fg-secondary)` (default) or `var(--surface-fg-primary)` (active).

### 4. Segmented Controls & Toggle Groups
*   **Directive:** Use `SegmentedControl` for all multi-option selectors with 2-7 options.
*   **Layout Options:**
    *   `layout="row"` (default): Horizontal button group.
    *   `layout="column"`: Vertical stack with left-aligned text.
    *   `layout="grid"`: 2-column grid for 4+ options.
*   **Item Direction:**
    *   `itemDirection="row"` (default): Icon + Label horizontally (side-by-side).
    *   `itemDirection="column"`: Icon above Label (vertically stacked, centered).
*   **Anti-Pattern:** Do not use `IconToggleGroup` when labels are needed. `SegmentedControl` is the unified component that supports both icon-only and icon+label patterns.
*   **Example:**
    ```tsx
    <SegmentedControl
      options={[
        { value: 'qr', label: 'QR Code', icon: 'qr_code_2' },
        { value: 'nfc', label: 'NFC', icon: 'nfc' },
      ]}
      value={scanMode}
      onValueChange={setScanMode}
      itemDirection="column"  // Icon above label
    />
    ```

### 5. Import Hygiene
*   **Directive:** When replacing a component (e.g., `IconToggleGroup` → `SegmentedControl`), **always remove the obsolete import** in the same commit.
*   **Why:** Unused imports cause lint errors (`'IconToggleGroup' is defined but never used`) and create confusion for future maintainers.
*   **Pattern:** After making component substitutions, verify all imports at the top of the file are actively used.



### 7. Layout Density Hygiene
*   **The Rule:** Choose padding based on the "Split Density" contract:
    *   **Headers/Nav (Chrome):** Use `var(--spacing-2)` (8px).
    *   **Cards/Lists (Content):** Use `var(--spacing-4)` (16px).
    *   **Contextual Overlays (Toasts):** Use `var(--spacing-3)` (12px) for padding/icon-gap, and `var(--spacing-1)` (4px) for title-to-description hierarchy.
    *   **Footers:** Use `var(--spacing-4)` (16px) to align with content.
*   **Anti-Pattern:** Do not use `spacing-4` for Headers or `spacing-2` for text-heavy content.

### 8. Form Sections & Spacing
*   **Directive:** When adding new sections to forms (like `CheckEntryView`), rely on the parent container's `gap` property for inter-section spacing.
*   **Anti-Pattern:** Do not add `margin-bottom` to section containers when the parent already uses `gap`. This causes double-spacing.
*   **Section Headers:** Use the `.sectionHeader` class (`--font-size-sm` / 14px, 600 weight, `--surface-fg-secondary` color) for form section labels.
*   **Dividers:** If a visual separator is needed, use `border-bottom: 1px solid var(--surface-border-secondary)` with symmetric `padding-bottom`. Do not add `margin-bottom`—the parent `gap` handles spacing to the next item.

### 8. Typography Hierarchy for Modals/Forms
*   **The Pattern:** Use a consistent 5-tier hierarchy in all settings modals and forms:
    | Tier | Role | Size | Weight | Color Token |
    |:-----|:-----|:-----|:-------|:------------|
    | 1 | Page Title | `--font-size-md` (16px) | 600 | `--surface-fg-primary` |
    | 2 | Section Header (h3) | `--font-size-sm` (14px) | 600 | `--surface-fg-secondary` |
    | 3 | Content Title | `--font-size-md` (16px) | 600 | `--surface-fg-primary` |
    | 4 | Field Label | `--font-size-md` (16px) | 500 | `--surface-fg-primary` |
    | 5 | Helper Text | `--font-size-2xs` (12px) | 400 | `--surface-fg-tertiary` |
*   **Critical Rule:** Always define explicit `color` on `.itemLabel` classes. Inherited colors can cause faded text.
*   **Anti-Pattern:** Do not use `--surface-fg-tertiary` for field labels—it's too faint.

### 9. Multi-Select Behavior
*   **Directive:** All data tables supporting multi-select must implement the **Stable Anchor** and **Visual Order** patterns.
*   **Stable Anchor Logic:** Use a `lastClickedRowRef` to track the "anchor" of a range selection.
    *   **Single Click / Ctrl+Click:** Update the anchor.
    *   **Shift+Click:** Keep the original anchor; select everything from anchor to new target.
*   **Visual Order Awareness:** Range selection MUST be calculated against the table's current visual state (sorted and filtered), not the raw data array.
    *   View components must receive a `visualIds: string[]` parameter from the `DataTable` during click events.
*   **Native Selection Suppression:** Intercept Shift-clicks in `onMouseDown` with `e.preventDefault()` to prevent blue text highlighting "flickers" during range selection.
*   **UI Isolation:** Apply `user-select: none` to interactive primitives (checkboxes, action buttons) to prevent them from interfering with intentional text drag-selection.

### 28. Confirmation Modal Pattern

Use this structure whenever an action requires explicit user confirmation before proceeding.

**Structure:**
```
Modal.Header  — "<Action> <Thing>"  (e.g. "Remove supervisor review")
─────────────────────────────────────────────────────────────
Modal.Content
  [Optional] Warning banner  — consequences explanation (see below)
  Confirmation sentence      — "Are you sure you want to <action> <bold subject>?"
─────────────────────────────────────────────────────────────
Modal.Footer  — [Confirm]  [Cancel]   ← primary LEFT, secondary RIGHT
```

**Warning banner** — include when the action has meaningful side effects. Keep it brief and factual. Two severity levels:

| Severity | Tokens | Icon | Button variant | Use when |
|:---|:---|:---|:---|:---|
| Warning (yellow) | `--surface-bg-warning-primary` / `--surface-border-warning-subtle` / `--surface-fg-warning-primary` | `warning` | `primary` | Reversible or recoverable, but noteworthy (e.g. removing a review) |
| Alert (red) | `--surface-bg-alert-primary` / `--surface-border-alert-subtle` / `--surface-fg-alert-primary` | `error` | `destructive` | Permanent / irreversible data loss |

```tsx
{/* Warning (yellow) — recoverable action */}
<div className={styles.warningBannerYellow}>
  <span className={`material-symbols-rounded ${styles.warningBannerIconYellow}`}>warning</span>
  <span>Brief plain-language description of what will change.</span>
</div>
```

**Confirmation sentence** — bold the specific subject (resident name for single, count for multi). For partial multi-select, explain the subset:
```tsx
<p className={styles.confirmText}>
  Are you sure you want to remove the review for <strong>{residentName}</strong>?
  {/* multi all: …for <strong>3 checks</strong>? */}
  {/* multi partial: banner says "N of M selected have a review. Only those will be cleared." */}
</p>
```

**Button order:** Confirm action on the **left**, Cancel on the **right** — opposite of many design system mockups.

**Button variant selection:**
- Irreversible / permanent data loss: `variant="destructive"` + red alert banner
- Recoverable / noteworthy: `variant="primary"` + yellow warning banner
- No side effects: `variant="primary"` + no banner

**Non-hazardous example** — no warning banner, plain confirmation sentence:
```tsx
<Modal.Content>
  <p className={styles.confirmText}>
    Are you sure you want to apply this review to <strong>5 checks</strong>?
  </p>
</Modal.Content>
<Modal.Footer>
  <div className={styles.footerActions}>
    <Button variant="primary" size="m" onClick={handleConfirm}>Apply review</Button>
    <Button variant="secondary" size="m" onClick={handleClose}>Cancel</Button>
  </div>
</Modal.Footer>
```

**Nested modal overlay:** When this confirmation renders on top of another open modal, pass `nested` to `<Modal>` to ensure correct z-index layering:
```tsx
<Modal isOpen={showConfirm} onClose={handleClose} title="..." nested>
```

**Reference implementations:** `src/desktop/components/SupervisorNoteModal.tsx`
- Hazardous: "Remove review" (`showDeleteConfirm`)
- Non-hazardous: "Apply review" (`showBulkConfirm`)

---

### 26. Desktop-First Architecture
*   **The Problem:** Desktop requires different patterns than mobile (Tree Views vs Stacked Lists).(
*   **The Strategy:** Use `PRD-desktop-enhanced.md` as the source of truth for the Desktop V2 experience.
*   **Key Files:** `src/desktop-enhanced/Layout.tsx`, `src/desktop-enhanced/components/*`.

### 27. Semantic Radii Token Hierarchy
*   **The Rule:** Never use primitive radius tokens (`--radius-md`, etc.) directly in component CSS. Use the semantic hierarchy:
    | Category | Semantic Token | Primitive | Value | Use Case |
    | :--- | :--- | :--- | :--- | :--- |
    | **Toolbar** | `--radius-toolbar` | `radius-2xl` | 16px | Floating action bars, high-elevation objects |
    | **Structural** | `--radius-modal` | `radius-xl` | 12px | Root-level dialogs, system modals |
    | | `--radius-container` | `radius-xl` | 12px | Menus, Popovers, Select dropdowns, Toasts |
    | | `--radius-card` | `radius-xl` | 12px | Dashboard cards, navigation panels |
    | **Interactive** | `--radius-input` | `radius-md` | 8px | Form fields, select triggers, search bars |
    | | `--radius-button-md` | `radius-md` | 8px | Standard action buttons |
    | | `--radius-button-lg` | `radius-lg` | 10px | Modal primary actions (Desktop Medium) |
    | **Dense** | `--radius-button-sm` | `radius-sm` | 6px | Small buttons, segmented items |
    | | `--radius-badge` | `radius-sm` | 6px | Non-pill chips, status labels |
    | | `--radius-pill` | `radius-full` | 9999px | Status lozenges, pill-shaped counters |
*   **Documentation:** Full mapping available in `docs/design-system/SEMANTIC_RADII.md`.

## CSS Architecture
*   **Directive:** Prefer CSS Modules (`*.module.css`) for feature-specific styles. Use Global CSS (`src/styles/*.css`) only for reusable design patterns (buttons, lists, inputs).

## 9. Bundle Optimization & Performance

### Lazy Loading Strategy
*   **Directive:** Major application states that represent distinct user flows should be lazy-loaded using `React.lazy()` with `Suspense`.
*   **Pattern (Named Exports with Context-Aware Fallback):**
    ```tsx
    // Named exports need explicit default mapping
    const AppShell = lazy(() => import('./AppShell').then(m => ({ default: m.AppShell })));
    const LoginView = lazy(() => withMinDelay(import('./features/Session/LoginView').then(m => ({ default: m.LoginView })), 500));
    
    // Persistent background + context-aware fallback
    <div style={{ position: 'fixed', inset: 0, background: 'var(--surface-bg-secondary)' }}>
      <Suspense fallback={
        <DelayedFallback delay={200}>
          {session.isAuthenticated ? <AppShellSkeleton /> : <SplashView />}
        </DelayedFallback>
      }>
        {session.isAuthenticated ? <AppShell /> : <LoginView />}
      </Suspense>
    </div>
    ```
*   **When to Use:** Authentication boundaries, admin tools, developer modals, or any feature used by <50% of users.
*   **When NOT to Use:** Components in the critical render path (headers, core UI primitives, state management).

### Button Loading State
*   **Directive:** For async actions (login, save, submit), use the `Button` component's `loading` prop.
*   **Pattern:**
    ```tsx
    <Button loading={isSubmitting} loadingText="Signing in...">Log In</Button>
    ```
*   **Behavior:**
    -   Shows spinning arc icon (left-aligned, matching icon size)
    -   Displays `loadingText` if provided, otherwise shows original children
    -   Disables button, sets `aria-busy="true"`
*   **Anti-Pattern:** Do not center a spinner and hide text. Show both for context.

### Vite Code Splitting (Manual Chunks)
*   **Directive:** When building for production, use `manualChunks` in `vite.config.ts` to separate vendor libraries by update frequency and size.
*   **Pattern:**
    ```ts
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'jotai'],
            'vendor-ui': ['@radix-ui/*'],  // All Radix packages
            'vendor-heavy': ['framer-motion', '@yudiel/react-qr-scanner'],
          }
        }
      }
    }
    ```
*   **Reasoning:**
    - `vendor-react`: Core framework (rarely changes, highly cacheable)
    - `vendor-ui`: UI primitives (moderate update frequency)
    - `vendor-heavy`: Large animation/feature libraries (defer loading when possible)

### Font Performance & Critical Path Assets
*   **Self-Hosted Fonts:** Fonts are served from `/public/fonts/` to enable offline PWA support.
*   **Async Loading for Heavy Fonts:** Material Symbols (~5MB) uses `fetchpriority="low"` preload to avoid blocking initial render.
*   **Critical Icons Pattern:** Login screen uses inline SVGs from `CriticalIcons.tsx` (`JournalLogo`, `ErrorIcon`) to render instantly.
*   **Brand Logo Token:** `--brand-logo-text` CSS variable adapts logo wordmark text: dark grey in light mode, white in dark modes.
*   **Shared LayoutId Transition:** `SplashView` (logo only, no text) and `LoginView` share `layoutId="app-logo"` for cinematic Framer Motion handoff:
    ```tsx
    // SplashView.tsx - Logo only, secondary background
    <motion.div layoutId="app-logo"><JournalLogo size={144} /></motion.div>

    // LoginView.tsx - Title and form stagger in AFTER logo settles
    <motion.div layoutId={isExiting ? undefined : "app-logo"}><JournalLogo size={144} /></motion.div>
    <motion.h3 variants={contentItemVariants}>Safeguard</motion.h3> // No layoutId, staggered entry
    ```
*   **Conditional LayoutId on Exit:** Set `layoutId={undefined}` when triggering navigation to AppShell to prevent logo distortion during unmount.
*   **Minimum Splash Time:** Wrap lazy imports with `withMinDelay(promise, 500)` for LoginView only. AppShell has no delay for faster post-login transition.
*   **Staggered Content Entry:** Use Framer Motion `variants` with `staggerChildren: 0.1` and `delayChildren: 0.3` for sequential title and form field fade-in after logo animation.
*   **DelayedFallback Component:** Wraps Suspense fallback to only show after 200ms delay, preventing spinner flash on fast loads.
*   **AppShellSkeleton:** For post-login transitions, show a skeleton (header/footer chrome + shimmer cards) instead of the brand splash—progressive disclosure feels faster.
*   **Persistent Background Wrapper:** Wrap Suspense in a `position: fixed; inset: 0` div with `background: var(--surface-bg-secondary)` to prevent black flash during AnimatePresence transitions.
*   **index.html Inline CSS:** Critical background colors (), dark mode detection, and the full Journal logo SVG are inlined for instant render.

### Dead Code Elimination
*   **Directive:** Before adding a new dependency, verify it will be actively used. Periodically audit `package.json` for unused libraries.
*   **Pattern:** Use `grep` to verify usage across `src/`: `grep -r "from 'library-name'" src/`
*   **Recent Example:** `gsap` was removed after confirming zero imports (saved ~50KB).

## 10. Common Pitfalls & Architectural Lessons

### Time-Based Logic & Race Conditions
*   **Lesson:** When deriving status from time (e.g., `elapsedMinutes < 15`), always account for the **gap** between the derived state and the side-effect trigger (e.g., `useCheckLifecycle`).
*   **Pattern:** If a side-effect (like "Mark Missed") triggers at `T=15m`, the UI derivation for the `14:59 -> 15:00` transition must be defensive. Force the "Missed" visual state immediately at `T=15` rather than falling back to a default "Pending" state if the side-effect is slightly delayed.

### Mock Data as Testing Infrastructure
*   **Lesson:** Do not fill mock data with random noise. Use it to construct **deterministic stress tests**.
*   **Pattern:** See `src/data/mock/checkData.ts` (A-Wing). Configured checks just seconds before major transitions allow for rapid visual verification of the entire lifecycle without waiting 15 minutes.

### 22. Terminology Precision
*   **Lesson:** User-facing terminology is a strict spec.
*   **Pattern:** "Due" means "Due". Do not use "Due Now", "Due Soon", or "Due!" unless explicitly specified.
*   **Pattern (Supervisor Review):** Standardize on "Supervisor review" rather than "Note" or "Comment".
*   **Status Labels:** Use "**Reviewed**" and "**not reviewed**" for missed checks.
*   **Mechanical Typography:** Always use the **en dash** (` – `) with surrounding spaces (e.g., "Missed – not reviewed").

### React Hooks vs. Raw Atoms
*   **Lesson:** When an atom has a side-effect (like updating the DOM), **never** use the raw atom setter directly. You must use the abstraction hook.
*   **The Bug:** `const setTheme = useSetAtom(themeAtom)` updates the state but fails to trigger the `useEffect` that applies `data-theme` to the `document.body`.
*   **The Fix:** Always use `const { setTheme } = useTheme()`. This ensures the side-effect (DOM update) fires correctly.

### Timer Stability Pattern (useRef for Callbacks)
*   **Lesson:** When a `useEffect` timer should only respond to state changes (not callback reference changes), store the callback in a ref.
*   **The Bug:** Including a `useCallback` in a `useEffect` dependency array causes the timer to reset whenever the callback's dependencies change, even if the state hasn't changed.
*   **The Pattern:**
    ```tsx
    // Store callback in ref to avoid resetting timer on callback changes
    const callbackRef = useRef(finalizeSuccess);
    useEffect(() => {
        callbackRef.current = finalizeSuccess;
    }, [finalizeSuccess]);

    // Timer only triggers on scanState change, not callback changes
    useEffect(() => {
        if (scanState === 'success') {
            const timer = setTimeout(() => callbackRef.current(), 1700);
            return () => clearTimeout(timer);
        }
    }, [scanState]); // Callback NOT in deps
    ```
*   **When to Use:** Any timed state transition where the callback has complex dependencies (e.g., `finalizeSuccess` in NFC scan flow).
*   **Reference:** See `NfcScanButton.tsx` success timer implementation.



### Feature Flag Presets
*   **Lesson:** For "Demo" or "Playground" modes, distinct "Unlock" and "Lock" actions are safer than individual toggles.
*   **Pattern:**
    *   **Unlock:** Applies a curated "Best View" preset (e.g., Dark + Haptics + Glass Tint).
    *   **Lock:** Performs a **strict reset** to a known safe state (Light Mode, All Flags Off).
    *   **Implementation:** See `src/data/featureFlags.ts` -> `lock()` / `unlock()`.

### Dark Mode Token Hygiene
*   **Directive:** When styling any themed element (badges, warnings, selected states, glows), **always use semantic tokens** from `semantics.css`, never primitive tokens directly.
*   **Why Primitives Fail:** Tokens like `var(--primitives-yellow-100)` are optimized for light mode (L≈95%). In dark mode, they remain unchanged, creating jarring bright spots.
*   **Anti-Pattern:**
    ```css
    /* WRONG - hardcoded primitive, won't adapt */
    box-shadow: 0 0 0 2px var(--primitives-yellow-100);
    background: var(--primitives-red-50);
    ```
*   **Correct Pattern:**
    ```css
    /* CORRECT - semantic token adapts per theme */
    box-shadow: 0 0 0 2px var(--surface-bg-warning-secondary);
    background: var(--surface-bg-error-primary);
    ```
*   **Semantic Token Selection (Primary Controls):**
    -   **Backgrounds:** Use `theme-800` (Dark) instead of `theme-700` (Light) for Primary Buttons.
    -   **Foregrounds:** Use `grey-50` (Dark) instead of `white` (Light) for text on Primary Buttons.
*   **Verification Rule:** If you add a new semantic token pairing, you **MUST** verify it meets WCAG AA (4.5:1) in all themes. Use the `contrast_audit.cjs` script if unsure.
*   **Reference:** See `docs/design-system/DARK_MODE.md` for full token mapping tables.

### Animation Synchronization Patterns (`The Zero-Time Protocol`)
*   **Lesson:** CSS `animation-delay` with JS-calculated offsets is unreliable due to execution latency and main-thread variance.
*   **Directive:** Do NOT use `animation-delay` offsets for synchronization.
*   **The Protocol:** Use the **Web Animations API (WAAPI)** to enforce absolute time alignment (`startTime = 0`).
*   **Standard Hook:** `useWaapiSync(ref, { isEnabled: boolean })`
*   **Pattern:**
    ```tsx
    // CORRECT - uses WAAPI to force alignment to document timeline origin
    useWaapiSync(containerRef, { isEnabled: isPulseActive });
    ```
*   **Why It Works:** `startTime = 0` aligns all animations to the exact same millisecond relative to the document origin, regardless of when they mounted or if the tab was backgrounded.
*   **Reference:** See `docs/WAAPI-STRATEGY.md`.

### Lint Prevention & TypeScript Hygiene
*   **Unused Imports:** When replacing a component (e.g., `ShieldIcon` → `JournalLogo`), **always remove the obsolete import** in the same commit, or lint will fail with `'X' is defined but never used`.
*   **Floating Promises:** If a function returns a `Promise` but you intentionally don't await it (e.g., `updateServiceWorker(true)`), mark it explicitly with `void`:
    ```tsx
    // WRONG - lint error: floating promise
    onClick={() => updateServiceWorker(true)}
    
    // CORRECT - explicitly ignored
    onClick={() => void updateServiceWorker(true)}
    ```
*   **Unnecessary Type Assertions:** Do not use `as Type` when TypeScript can already infer the type. ESLint flags this as `@typescript-eslint/no-unnecessary-type-assertion`.
*   **Environment-Agnostic Timer Types:** Use `ReturnType<typeof setTimeout>` instead of `NodeJS.Timeout` to avoid TS2503 in browser environments.


### Pulse Effects Pattern (Global Visuals)
*   **Lesson:** For continuous, global animations (like glass breathing or urgency gradients), avoid React render cycles.
*   **Pattern:**
    1.  **Manager Component:** `PulseEffectsManager.tsx` (Logic only, returns `null`).
    2.  **Data Attribute:** Sets `body[data-glass-pulse="basic|gradient"]` based on state.
    3.  **CSS Subscription:** Components (`.header`, `.footer`) subscribe to the body attribute via CSS selectors.
*   **Why:** Allows a single state update to trigger high-performance, synchronized animations across multiple DOM nodes without re-rendering the component tree.

### Font Weight Rendering ("Fake Bold" Pitfall)
*   **The Bug:** Text looks "suspiciously thin" (800 rendering as 400) or "super thick" (600 rendering as fake-bold).
*   **The Cause:** Using a **Static Font File** (e.g., Regular-only) while requesting different weights (600, 800). The browser synthesizes the weight, often poorly.
*   **The Fix:** Ensure the **Variable Font file** (`Inter-roman.var.woff2`) is loaded, which supports the full 100-900 axis. Verify file size is >200KB (Static files are typicaly <30KB).

### 11. Typography Hygiene & Token Handling
*   **Directive:** Do not valid hardcoded `px` or `rem` values for font-sizes in component CSS.
*   **The Contract:**
    *   **Scale:** 16px (`--font-size-md`) is the base. 14px (`--font-size-sm`) is the minimum for standard UI. 12px (`--font-size-2xs`) is strictly for badges/captions.
    *   **Weights:**
        *   **400 (Regular):** Standard body text, resident lists.
        *   **500 (Medium):** Badges, Labels, "Quiet" Headers.
        *   **600 (Semi-Bold):** Buttons, Section Headers, Screen Titles ("Safeguard").
        *   **Avoid:** 300 (Too thin), 700 (Use 600), and 800 (Use 600 for titles to reduce visual weight).
*   **Anti-Pattern:** `font-size: 15px` (Off-grid), `font-weight: bold` (Vague, usually maps to 700).
*   **Resident Lists:** Use tighter spacing (`gap: 2px` / `--spacing-0p5`) for multiple residents to group them visually distinct from the room name.

### 12. CSS Animation Negative Delay Pattern (Pre-Seeded Loops)
*   **The Problem:** Framer Motion keyframe arrays always start from the first value, ignoring the `initial` prop. This causes all rings/elements to "bunch up" at the start of a looping animation.
*   **The Solution:** Use **CSS @keyframes with negative `animation-delay`** to start each element mid-cycle.
*   **Pattern:**
    ```css
    .pulseRing {
      animation: pulseRingExpand 20s linear infinite;
    }
    ```
    ```tsx
    // Negative delay starts animation mid-cycle for steady-state appearance
    <circle
      className={styles.pulseRing}
      style={{ animationDelay: `${-i * 2}s` }}
    />
    ```
*   **Why It Works:** Negative `animation-delay` in CSS tells the browser to start the animation as if it had already been running for that duration, achieving instant "steady-state" spread.
*   **When to Use:** Radar/pulse effects, wave animations, any looping effect that should appear "already running" on mount.
*   **Reference:** See `src/features/Shell/NfcScanButton.tsx` and `NfcScanButton.module.css`.

### 13. Stale Closure Prevention in useEffect Timers
*   **The Problem:** When a callback function (like `finalizeSuccess`) is in a `useEffect` dependency array, and that function is regenerated on each render (due to upstream atom changes), the effect re-runs, resetting timers.
*   **The Symptom:** A 300ms timeout becomes seconds-long because the timer keeps restarting.
*   **The Solution:** Use a ref to store the latest callback, updating it outside the effect:
    ```tsx
    // Store current callback in ref to prevent timer resets
    const callbackRef = useRef(callback);
    callbackRef.current = callback;
    
    useEffect(() => {
      if (shouldRun) {
        const timer = setTimeout(() => {
          callbackRef.current(); // Always calls latest version
        }, 300);
        return () => clearTimeout(timer);
      }
    }, [shouldRun]); // Only depend on trigger, not callback
    ```
*   **Anti-Pattern:** Including regenerating callbacks directly in dependency arrays.
*   **Reference:** See `src/features/Shell/NfcScanButton.tsx` `ScanningVisualizer` component.

### 14. Framer Motion Keyframe Arrays Always Start from First Value
*   **The Pitfall:** When using keyframe arrays in Framer Motion, the animation **always starts from the first value in the array**, regardless of what `initial` is set to.
    ```tsx
    // initial={{ r: 50 }} is IGNORED - animation starts at r: 10
    initial={{ r: 50, opacity: 0.5 }}
    animate={{ r: [10, 80], opacity: [0, 1, 0] }}
    ```
*   **The Fix:** For pre-seeded looping animations, use CSS `@keyframes` with negative `animation-delay` instead (see Section 12).
*   **When This Works:** Framer Motion keyframes are fine for one-shot entrance/exit animations where starting from the first value is expected.



### 16. Future Ideas Feature Flag Pattern
*   **The Structure:** Experimental features are gated behind `featureFlagsAtom` with `atomWithStorage` for persistence.
*   **Unlock Behavior**:
    *   Triggered by 7-tap on logo.
    *   Applies "Dave's Favorites" preset (curated defaults for demonstration).
    *   Sets `futureIdeasUnlockedAtom = true`.
*   **Lock Behavior:**
    *   Triggered by re-activating Konami/7-tap while unlocked.
    *   Performs strict reset: all flags to `DEFAULT_FEATURE_FLAGS`, theme to light.
    *   Ring animation and other persistent flags are cleared.
*   **Feature Flag Persistence:**
    *   Flags persist across page reloads via `atomWithStorage`.
    *   Some flags (like ring animation) may require explicit reset paths if they shouldn't survive lock/unlock cycles.
*   **Modal Integration:**
    *   **Developer Tools:** Core debugging tools (NFC simulation, network status, toasts).
    *   **Future Ideas:** Experimental UI features and playground tools.
*   **Anti-Pattern:** Putting experimental playground features in Developer Tools—separate concerns.
*   **Reference:** See `src/data/featureFlags.ts`, `src/features/Overlays/FutureIdeasModal.tsx`.



### 18. AnimatePresence Coordination & CSS Animation Interference
*   **The Problem:** Multiple uncoordinated `AnimatePresence` blocks can cause elements to appear during transitions. Continuous CSS animations (e.g., `animation: pulse 2s infinite`) create compositing layers that remain visible during Framer Motion's exit animations.
*   **Symptoms:**
    *   Elements briefly flash or become visible during transitions
    *   Exit animations show remnants of CSS animations
    *   Timing mismatches between separate AnimatePresence blocks
*   **Root Cause Analysis:**
    1.  CSS `animation` property continues running on exiting elements
    2.  Independent AnimatePresence blocks don't coordinate timing
    3.  `mode="wait"` can cause delayed mounting/unmounting issues
*   **Solution Pattern:**
    ```tsx
    // Disable CSS animation during Framer Motion control
    <motion.div
        className={styles.animatedElement}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{ animation: 'none' }} // Override CSS animation
    >
    ```
*   **AnimatePresence Best Practices**:
    *   Avoid `mode="wait"` unless you specifically need sequential enter/exit
    *   Keep related animations in the same AnimatePresence block for coordination
    *   Use explicit `transition` props on exit animations (don't rely on MotionConfig)

### 19. Zero-CLS Header Offline Pattern (Badges + Pill Layout)
*   **The Problem:** Traditional banners push content down, causing Cumulative Layout Shift (CLS).
*   **The Solution:** Expand header height slightly (+6px), keep badges visible but shifted up, slide pill in below.
*   **Architecture:**
    1.  **Header Height:** Increases from `var(--modal-header-height)` to `calc(var(--modal-header-height) + 6px)` via CSS transition.
    2.  **Status Badges:** Remain visible, animated to `y: -2` in offline mode via Framer Motion.
    3.  **Offline Pill:** Slides up from below (`initial: y: 12` → `animate: y: -6`) using `AnimatePresence`.
    4.  **Background:** Fades to translucent dark (`rgba(37, 43, 55, 0.85)`) with blur.
    5.  **Menu/Avatar:** Remain stationary (no animation).
*   **Pill Content Morphing (Instant Exit, Slow Enter):**
    ```tsx
    // Eliminates empty pill gap during state changes
    animate={{ opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
    exit={{ opacity: 0, transition: { duration: 0.05 } }}
    ```
*   **Success Sequence (Connected State):**
    1.  Content settles (0.4s)
    2.  Background fades grey → green (0.3s, delayed 0.4s)
    3.  Pulse radiates outward (1s, delayed 0.7s) - matches `card-flash-complete`
*   **Key Files:** `AppHeader.tsx`, `AppHeader.module.css`.

### 20. Layout Registry Stability (Preventing Height Flash)
*   **The Problem:** During view transitions (offline→online, scanning), measured heights can flash to 0, causing content to jump under the header.
*   **Root Cause:** `useLayoutRegistration` previously reset height to 0 in its cleanup function.
*   **The Fix:** Do NOT reset height to 0 on cleanup. The header never truly unmounts in normal usage.
*   **Pattern:**
    ```tsx
    return () => {
        observer.disconnect();
        cancelAnimationFrame(frameId.current);
        // NOTE: Intentionally do NOT reset height to 0
        // Prevents layout flash during view transitions
    };
    ```
*   **Key File:** `src/data/useLayoutRegistration.ts`.

### 21. Sliding Overlay Z-Index Strategy
*   **The Problem:** When a background overlay slides in, it can cover interactive elements (menu, avatar) if z-index isn't carefully managed.
*   **The Solution:** Use a layered z-index strategy where interactive elements have higher z-index than the overlay.
*   **Pattern:**
    | Element | Z-Index | Purpose |
    |:--------|:--------|:--------|
    | `.greyOverlay` | 5 | Sliding background |
    | `.overlayContent` | 6 | Content inside overlay (offline pill) |
    | `.headerContent` | 10 | Contains menu/avatar, above overlay |
    | `.leftActions`, `.rightActions` | 10 | Interactive elements stay visible |
*   **Anti-Pattern:** Setting overlay z-index higher than interactive elements, making them unclickable.
*   **Key File:** `AppHeader.module.css`.

### 22. Skeleton Loading Strategy
*   **The Problem:** Generic loading spinners feel slow and disconnected from the final content layout.
*   **The Solution:** Use high-fidelity **Shimmer Skeletons** that mirror the final content shape.
*   **The Shape Contract:**
    *   **Text/Cells:** Use `width: 100%` variants or random widths. Class: `.skeletonCell`.
    *   **Checkboxes:** Use **Square** (20x20px). Class: `.skeletonCheckbox`.
    *   **Icons/Actions:** Use **Circle** (24x24px). Class: `.skeletonAction`.
*   **The Animation:** 
    *   **Duration:** 3s (slow, premium feel).
    *   **Gradient:** `secondary` → `tertiary` (high contrast) → `secondary`.
*   **Anti-Pattern:** Using generic bars for everything. A checkbox column should look like a checkbox, not a text bar.
*   **Reference:** `src/desktop/components/DataTable.module.css`.

### 23. Infinite Scroll Pattern (The Skeleton Sentinel)
*   **The Problem:** "Load More" buttons break flow, and replacing content with spinners causes layout jumps.
*   **The Solution:** Append a single **Skeleton Row** at the bottom of the list when fetching more data.
*   **The Logic:**
    1.  Render existing data rows.
    2.  If `hasMore` is true, render *one* additional `<tr>` with skeleton cells.
    3.  Attach the `IntersectionObserver` ref to this skeleton row.
*   **Behavior:** The user scrolls, sees a subtle ghost row, and real data swaps in in-place.
*   **Anti-Pattern:** Showing a spinner that replaces the entire list (flicker) or a "Load More" button (friction).

### 24. Framer Motion Transition Typing (Enter vs Exit Durations)
*   **The Problem:** You want different durations for enter (0.4s) and exit (0.05s) animations.
*   **The Wrong Pattern:** Using `transition: { exit: { duration: 0.05 } }` - TypeScript error, not supported.
*   **The Correct Pattern:** Embed transition inside animate/exit props:
    ```tsx
    // CORRECT - each state defines its own transition
    animate={{ opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
    exit={{ opacity: 0, transition: { duration: 0.05 } }}
    ```
*   **Anti-Pattern:** Putting `exit` as a nested object inside the shared `transition` prop.
*   **Reference:** See `AppHeader.tsx` pill content morphing.

### 25. CSS Module + Global Class Targeting Limitation
*   **The Problem:** CSS module selectors get hashed at build time (e.g., `.offlineContentRow` → `._offlineContentRow_abc123`), but global classes like `.material-symbols-rounded` remain unhashed.
*   **The Symptom:** Descendant selectors like `.offlineContentRow .material-symbols-rounded` fail to match because the parent is hashed but the child isn't.
*   **The Solution:** Use inline styles for properties that must target global classes:
    ```tsx
    // CORRECT - inline style guarantees application
    <span 
      className="material-symbols-rounded"
      style={{ color: 'var(--surface-fg-on-solid)' }}
    >check</span>
    ```
*   **When CSS Works:** If the element has a CSS module class directly applied (not as a descendant).
*   **Anti-Pattern:** Adding multiple selectors with `!important` hoping specificity wins - the selector never matches.
*   **Reference:** See `AppHeader.tsx` icon color application, comment in `AppHeader.module.css`.

### 26. High-Frequency Resize Management
*   **The Lesson:** Interactive resizing of complex layouts (e.g., side panels with DataTables) requires specific performance optimizations to avoid lag.
*   **The Constraints:**
    1.  **Flexbox Over Grid:** Grid track recalculation is significantly more expensive than Flexbox width adjustments during high-frequency updates.
    2.  **Transition Blocker:** Always disable CSS transitions (`transition: none`) on the resizable container **and all descendants** during active manipulation (e.g., using a `data-resizing` attribute and the `*` selector).
    3.  **Hardware Acceleration:** Apply `will-change: width` to promote the resizable container to its own compositor layer.
    4.  **Sync Control (Framer Motion):** If using Framer Motion wrappers, set `duration: 0` during `isResizing=true` to eliminate the 300ms transition lag. Use `animate={{ width: isResizing ? 'var(--panel-width)' : panelWidth }}` to bind the width directly to the live CSS variable during drag.
*   **Reference:** See `SPEC-ANIMATION.md` Section 3.D and `SPEC-CSS.md` Section 13.

