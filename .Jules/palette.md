## 2024-06-25 - Prevent Accidental Deletion with AlertDialog & Enhance ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons mapping to destructive actions (like delete) on cards/lists frequently lack `aria-label` tags, causing poor screen reader experiences. Simultaneously, the lack of delete confirmations leads to inadvertent data loss.
**Action:** When auditing or building user lists/cards with icon actions, ensure all buttons are wrapped in tooltips that provide explicit `aria-label`s. Always safeguard destructive actions using an `AlertDialog` (or similar confirmation patterns) linked to an intermediate state variable (e.g., `deleteTarget`), confirming user intent before executing the deletion logic.

## 2024-06-25 - Prevent Accidental Deletion with AlertDialog & Enhance ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons mapping to destructive actions (like delete) on cards/lists frequently lack `aria-label` tags, causing poor screen reader experiences. Simultaneously, the lack of delete confirmations leads to inadvertent data loss.
**Action:** When auditing or building user lists/cards with icon actions, ensure all buttons are wrapped in tooltips that provide explicit `aria-label`s. Always safeguard destructive actions using an `AlertDialog` (or similar confirmation patterns) linked to an intermediate state variable (e.g., `deleteTarget`), confirming user intent before executing the deletion logic.

## 2024-07-26 - Keyboard Focus Accessibility for Interactive Buttons
**Learning:** Interactive `<button>` elements, especially those acting as structural cards, navigation items, or "big" action buttons, often rely on hover effects for mouse users but lack explicit visual focus indicators for keyboard navigation, severely hindering accessibility for users relying on Tab navigation.
**Action:** When creating or auditing buttons, navigation items, and interactive cards, always explicitly append standard focus utility classes (e.g., `focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2`) to ensure that users navigating via keyboard receive a clear visual indication of the currently focused element.
