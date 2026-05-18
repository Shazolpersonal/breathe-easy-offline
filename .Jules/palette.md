## 2024-05-18 - Missing Tooltip on Icon Buttons
**Learning:** Icon-only buttons without tooltips lack clear intent for visual users, even if they have `aria-label` for screen readers. Using Shadcn/Radix Tooltips provides a consistent, accessible way to reveal functionality on hover/focus.
**Action:** When auditing icon-only buttons (like share or donate buttons), wrap them in `Tooltip`, `TooltipTrigger` and `TooltipContent` instead of relying on native `title` attributes.

## 2024-05-18 - Missing Tooltip on Icon Buttons
**Learning:** Icon-only buttons without tooltips lack clear intent for visual users, even if they have `aria-label` for screen readers. Using Shadcn/Radix Tooltips provides a consistent, accessible way to reveal functionality on hover/focus.
**Action:** When auditing icon-only buttons (like share or donate buttons), wrap them in `Tooltip`, `TooltipTrigger` and `TooltipContent` instead of relying on native `title` attributes.
