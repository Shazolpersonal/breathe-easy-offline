## 2024-06-25 - Prevent Accidental Deletion with AlertDialog & Enhance ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons mapping to destructive actions (like delete) on cards/lists frequently lack `aria-label` tags, causing poor screen reader experiences. Simultaneously, the lack of delete confirmations leads to inadvertent data loss.
**Action:** When auditing or building user lists/cards with icon actions, ensure all buttons are wrapped in tooltips that provide explicit `aria-label`s. Always safeguard destructive actions using an `AlertDialog` (or similar confirmation patterns) linked to an intermediate state variable (e.g., `deleteTarget`), confirming user intent before executing the deletion logic.

## 2024-06-25 - Prevent Accidental Deletion with AlertDialog & Enhance ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons mapping to destructive actions (like delete) on cards/lists frequently lack `aria-label` tags, causing poor screen reader experiences. Simultaneously, the lack of delete confirmations leads to inadvertent data loss.
**Action:** When auditing or building user lists/cards with icon actions, ensure all buttons are wrapped in tooltips that provide explicit `aria-label`s. Always safeguard destructive actions using an `AlertDialog` (or similar confirmation patterns) linked to an intermediate state variable (e.g., `deleteTarget`), confirming user intent before executing the deletion logic.

## 2024-06-25 - Replace Native Title Attributes with Accessible Tooltips for Icon-Only Buttons
**Learning:** Native HTML `title` attributes on icon-only buttons offer poor accessibility and an inconsistent visual experience, failing to properly support screen readers or keyboard focus navigation reliably.
**Action:** Always prefer the design system's custom `Tooltip` component (e.g., from `@/components/ui/tooltip`) over native `title` attributes. Wrap the button in a `TooltipTrigger asChild` inside a `Tooltip` and provide a descriptive `TooltipContent`, ensuring the button still maintains a corresponding `aria-label` or uses visually hidden text for ultimate screen reader clarity.
