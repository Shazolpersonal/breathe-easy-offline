## 2024-06-25 - Prevent Accidental Deletion with AlertDialog & Enhance ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons mapping to destructive actions (like delete) on cards/lists frequently lack `aria-label` tags, causing poor screen reader experiences. Simultaneously, the lack of delete confirmations leads to inadvertent data loss.
**Action:** When auditing or building user lists/cards with icon actions, ensure all buttons are wrapped in tooltips that provide explicit `aria-label`s. Always safeguard destructive actions using an `AlertDialog` (or similar confirmation patterns) linked to an intermediate state variable (e.g., `deleteTarget`), confirming user intent before executing the deletion logic.

## 2024-06-25 - Prevent Accidental Deletion with AlertDialog & Enhance ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons mapping to destructive actions (like delete) on cards/lists frequently lack `aria-label` tags, causing poor screen reader experiences. Simultaneously, the lack of delete confirmations leads to inadvertent data loss.
**Action:** When auditing or building user lists/cards with icon actions, ensure all buttons are wrapped in tooltips that provide explicit `aria-label`s. Always safeguard destructive actions using an `AlertDialog` (or similar confirmation patterns) linked to an intermediate state variable (e.g., `deleteTarget`), confirming user intent before executing the deletion logic.

## 2024-06-09 - Added Tooltips to MiniPlayer Controls
**Learning:** Icon-only buttons, even with `aria-label` attributes, can be ambiguous to sighted users on desktop devices who don't use screen readers. Tooltips bridge this gap by providing visual labels on hover.
**Action:** When auditing custom interactive components (like floating players or toolbars) with icon-only controls, always wrap the buttons in `Tooltip` components from the design system to expose the descriptive text visually, complementing the accessibility tree.
