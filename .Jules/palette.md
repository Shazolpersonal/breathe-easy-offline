## 2024-06-25 - Prevent Accidental Deletion with AlertDialog & Enhance ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons mapping to destructive actions (like delete) on cards/lists frequently lack `aria-label` tags, causing poor screen reader experiences. Simultaneously, the lack of delete confirmations leads to inadvertent data loss.
**Action:** When auditing or building user lists/cards with icon actions, ensure all buttons are wrapped in tooltips that provide explicit `aria-label`s. Always safeguard destructive actions using an `AlertDialog` (or similar confirmation patterns) linked to an intermediate state variable (e.g., `deleteTarget`), confirming user intent before executing the deletion logic.

## 2024-06-25 - Prevent Accidental Deletion with AlertDialog & Enhance ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons mapping to destructive actions (like delete) on cards/lists frequently lack `aria-label` tags, causing poor screen reader experiences. Simultaneously, the lack of delete confirmations leads to inadvertent data loss.
**Action:** When auditing or building user lists/cards with icon actions, ensure all buttons are wrapped in tooltips that provide explicit `aria-label`s. Always safeguard destructive actions using an `AlertDialog` (or similar confirmation patterns) linked to an intermediate state variable (e.g., `deleteTarget`), confirming user intent before executing the deletion logic.
## 2025-01-09 - Added explicit tooltips to icon-only buttons
**Learning:** Icon-only buttons with ARIA labels are screen-reader accessible, but visually impaired users or users who rely on visual hints may struggle to understand the action if hover text is missing.
**Action:** When adding icon-only action buttons (especially critical controls like Play/Pause or Stop in a media player context), wrap them in a Tooltip to provide accessible visual labels on hover or focus, ensuring a comprehensive UX across different user needs.
