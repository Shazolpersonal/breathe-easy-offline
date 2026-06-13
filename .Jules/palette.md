## 2024-06-25 - Prevent Accidental Deletion with AlertDialog & Enhance ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons mapping to destructive actions (like delete) on cards/lists frequently lack `aria-label` tags, causing poor screen reader experiences. Simultaneously, the lack of delete confirmations leads to inadvertent data loss.
**Action:** When auditing or building user lists/cards with icon actions, ensure all buttons are wrapped in tooltips that provide explicit `aria-label`s. Always safeguard destructive actions using an `AlertDialog` (or similar confirmation patterns) linked to an intermediate state variable (e.g., `deleteTarget`), confirming user intent before executing the deletion logic.

## 2024-06-25 - Prevent Accidental Deletion with AlertDialog & Enhance ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons mapping to destructive actions (like delete) on cards/lists frequently lack `aria-label` tags, causing poor screen reader experiences. Simultaneously, the lack of delete confirmations leads to inadvertent data loss.
**Action:** When auditing or building user lists/cards with icon actions, ensure all buttons are wrapped in tooltips that provide explicit `aria-label`s. Always safeguard destructive actions using an `AlertDialog` (or similar confirmation patterns) linked to an intermediate state variable (e.g., `deleteTarget`), confirming user intent before executing the deletion logic.

## 2024-03-20 - Missing Focus States on Custom Icons
**Learning:** Custom, icon-only buttons (like the `WeeklySummary` close button) often forget to include `focus-visible` states during implementation, leading to broken keyboard navigation visually. This is especially true when native `<button>` elements are used instead of the custom `Button` component, which usually handles this state automatically.
**Action:** When implementing or modifying plain `<button>` elements across the codebase—particularly for icon-only components—ensure `focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2` is explicitly added if not wrapping with a `Button` element.
