# Safety Check: eSeries Prototype

This repository contains a prototype for the **Safety Check eSeries** experience, designed to explore desktop-optimized workflows for compliance monitoring.

---

## 🔬 Core Focus Areas

-   **Dialed-in Table Mechanics:** High-performance data grids using TanStack Table with sticky headers and responsive column fitting, synchronized to Adaptive Ticking (Slow/Fast timer loops).
-   **Draft Navigation Concepts:** Includes early concepts for Left Navigation and Top Navigation layouts (currently draft - needs more work).
-   **High-Density Layouts:** Designing views to maximize data visibility for supervisors, balancing grid densities and collapsible context-aware panels.
-   **Atomic State Management:** testing performance with Jotai for global ticker subscriptions and layout measurement registration.

## 🛠️ Technology Stack

-   **Build Tool:** Vite
-   **Framework:** React 19
-   **Language:** TypeScript
-   **Data Grid:** TanStack Table (Headless)
-   **State Management:** Jotai
-   **Animation:** Framer Motion
-   **UI Primitives:** Radix UI
-   **Styling:** CSS Modules & Design Tokens

## 📂 Directory Structure

-   **/src/desktop**: Standard Safety Check views and components.
-   **/src/desktop-enhanced**: High-hierarchy navigation concepts and optimized wireframes.
-   **/src/components**: Accessible shared UI primitives.
-   **/src/data**: State (Jotai), logic, and mock data.
-   **/src/styles**: Design system tokens and global themes.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```
