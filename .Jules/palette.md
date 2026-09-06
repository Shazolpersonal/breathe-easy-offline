## 2024-06-25 - Prevent Accidental Deletion with AlertDialog & Enhance ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons mapping to destructive actions (like delete) on cards/lists frequently lack `aria-label` tags, causing poor screen reader experiences. Simultaneously, the lack of delete confirmations leads to inadvertent data loss.
**Action:** When auditing or building user lists/cards with icon actions, ensure all buttons are wrapped in tooltips that provide explicit `aria-label`s. Always safeguard destructive actions using an `AlertDialog` (or similar confirmation patterns) linked to an intermediate state variable (e.g., `deleteTarget`), confirming user intent before executing the deletion logic.

## 2024-06-25 - Prevent Accidental Deletion with AlertDialog & Enhance ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons mapping to destructive actions (like delete) on cards/lists frequently lack `aria-label` tags, causing poor screen reader experiences. Simultaneously, the lack of delete confirmations leads to inadvertent data loss.
**Action:** When auditing or building user lists/cards with icon actions, ensure all buttons are wrapped in tooltips that provide explicit `aria-label`s. Always safeguard destructive actions using an `AlertDialog` (or similar confirmation patterns) linked to an intermediate state variable (e.g., `deleteTarget`), confirming user intent before executing the deletion logic.
## 2024-05-18 - Tooltips for icon-only buttons
**Learning:** Radix UI's Tooltip requires wrapping the target button in `TooltipTrigger asChild` inside a `Tooltip`. A global `TooltipProvider` must be present (which is in `App.tsx`). This pattern is essential for accessible icon-only actions (like close buttons or next/prev arrows) where the visual affordance lacks descriptive text.
**Action:** Always verify if an icon-only button lacks a visible label and apply the `Tooltip` component pattern with localized text in the `TooltipContent`.
