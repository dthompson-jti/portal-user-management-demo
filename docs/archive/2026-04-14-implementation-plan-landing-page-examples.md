# Add Example Search Terms to Landing Page

The user wants to add example search terms (Case IDs and Emails) to the landing page scenarios to help users understand what they can search for. Each example will have a copy button for quick interaction.

## Proposed Changes

### [Component Name]

#### [MODIFY] [PortalLandingPage.tsx](file:///c:/Users/dthompson/Documents/CODE/portal-user-management-demo/src/desktop-enhanced/components/PortalLandingPage.tsx)
- Add a list of example search terms to each scenario card.
- Implement `handleCopy` function to copy terms to the clipboard.


#### [MODIFY] [PortalLandingPage.module.css](file:///c:/Users/dthompson/Documents/CODE/portal-user-management-demo/src/desktop-enhanced/components/PortalLandingPage.module.css)
- Add styles for the `exampleList`, `exampleItem`, and `copyIcon`.
- Ensure the examples look like "code" or "data" snippets (monospace font, subtle background).
- Add hover states for the copy action.

## Verification Plan

### Manual Verification
- Navigate to the landing page.
- Verify that each scenario card displays 2-3 example search terms.
- Click the copy button for an example term.
- Paste the copied text into a notepad or the search bar on the next page to verify it was copied correctly.
