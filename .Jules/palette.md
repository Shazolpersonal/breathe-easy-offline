## 2024-06-25 - Prevent Accidental Deletion with AlertDialog & Enhance ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons mapping to destructive actions (like delete) on cards/lists frequently lack `aria-label` tags, causing poor screen reader experiences. Simultaneously, the lack of delete confirmations leads to inadvertent data loss.
**Action:** When auditing or building user lists/cards with icon actions, ensure all buttons are wrapped in tooltips that provide explicit `aria-label`s. Always safeguard destructive actions using an `AlertDialog` (or similar confirmation patterns) linked to an intermediate state variable (e.g., `deleteTarget`), confirming user intent before executing the deletion logic.

## 2024-06-25 - Prevent Accidental Deletion with AlertDialog & Enhance ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons mapping to destructive actions (like delete) on cards/lists frequently lack `aria-label` tags, causing poor screen reader experiences. Simultaneously, the lack of delete confirmations leads to inadvertent data loss.
**Action:** When auditing or building user lists/cards with icon actions, ensure all buttons are wrapped in tooltips that provide explicit `aria-label`s. Always safeguard destructive actions using an `AlertDialog` (or similar confirmation patterns) linked to an intermediate state variable (e.g., `deleteTarget`), confirming user intent before executing the deletion logic.
## 2024-05-19 - Accessible Timezone-Safe Date Formatting
**Learning:** `new Date("YYYY-MM-DD")` defaults to UTC midnight, causing `toLocaleDateString()` to display the previous day for users in timezones behind UTC (like the Americas). When adding ARIA labels containing dates, this can severely disorient screen reader users with wrong day readings.
**Action:** Always append "T12:00:00" to ISO date-only strings before passing them to `new Date()` for local string formatting to ensure they resolve safely within the intended local day.
