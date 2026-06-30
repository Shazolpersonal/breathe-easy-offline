## 2024-06-25 - Prevent Accidental Deletion with AlertDialog & Enhance ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons mapping to destructive actions (like delete) on cards/lists frequently lack `aria-label` tags, causing poor screen reader experiences. Simultaneously, the lack of delete confirmations leads to inadvertent data loss.
**Action:** When auditing or building user lists/cards with icon actions, ensure all buttons are wrapped in tooltips that provide explicit `aria-label`s. Always safeguard destructive actions using an `AlertDialog` (or similar confirmation patterns) linked to an intermediate state variable (e.g., `deleteTarget`), confirming user intent before executing the deletion logic.

## 2024-06-25 - Prevent Accidental Deletion with AlertDialog & Enhance ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons mapping to destructive actions (like delete) on cards/lists frequently lack `aria-label` tags, causing poor screen reader experiences. Simultaneously, the lack of delete confirmations leads to inadvertent data loss.
**Action:** When auditing or building user lists/cards with icon actions, ensure all buttons are wrapped in tooltips that provide explicit `aria-label`s. Always safeguard destructive actions using an `AlertDialog` (or similar confirmation patterns) linked to an intermediate state variable (e.g., `deleteTarget`), confirming user intent before executing the deletion logic.

## 2024-06-30 - Tooltip Over Native Title Attributes for Icon-Only Buttons
**Learning:** While native HTML `title` attributes provide basic tooltips and some accessibility context on icon-only buttons, they lack consistent visual styling across browsers, don't adhere to the app's design system, and can interfere with custom Tooltip components if used simultaneously.
**Action:** Always prefer wrapping icon-only buttons in the application's `Tooltip` component (e.g., from `@/components/ui/tooltip`) instead of using the native `title` attribute. Ensure the button inside retains an explicit `aria-label` for screen readers and Tailwind `focus-visible` classes for keyboard navigation.
