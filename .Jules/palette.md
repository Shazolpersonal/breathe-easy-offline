## 2024-05-18 - Improve Keyboard Accessibility and ARIA roles for custom buttons
**Learning:** Found several custom interactive buttons (e.g. language toggle, donate, MiniPlayer controls, TechniqueCard actions) lacking focus states and ARIA definitions, which negatively impacts keyboard navigation and screen readers. Specifically, using `focus-visible` combined with Tailwind CSS ring utilities provides non-disruptive, clear focus indicators.
**Action:** Consistently applied `focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2` across custom interactive elements to ensure visual feedback for keyboard users without affecting mouse users. Added missing ARIA menu roles to the BottomNav "More" dropdown.

## 2024-05-19 - Ensure Custom Icon Controls Are Accessible
**Learning:** Found custom icon-only buttons (like calendar navigation in `MoodHeatmapCalendar` and custom option buttons in `SoundscapePicker`) lacking `aria-label` attributes and focus outlines, making them essentially invisible or unusable to screen reader users and keyboard navigators.
**Action:** When implementing custom icon-only buttons or interactive components lacking visible text, always include `aria-label={t("...")}` using translated keys, and apply `focus-visible` ring utilities to ensure keyboard users can track their position.
