## 2025-02-27 - Date Parsing and DST Optimization in Streak Calculations
**Learning:** Instantiating `new Date()` and chaining `.map().substring()` inside loops creates a large volume of temporary objects and is a significant bottleneck for array-heavy calculations like streak counting. Additionally, doing raw 24h subtraction (`time -= 86400000`) on exact current local time (`new Date().getTime()`) fails at Daylight Saving Time boundaries if the shift moves the time past midnight on the same day.
**Action:** Use `Date.parse()` to retrieve timestamps quickly without `Date` object allocation. When iterating backwards by 24h intervals, explicitly normalize the baseline Date to local noon (`today.setHours(12, 0, 0, 0)`) to ensure the subtraction safely steps over DST transitions without skipping or repeating calendar dates.

## 2025-02-27 - O(N * M) Progression Map Construction Optimization
**Learning:** In heavily used list views (`Techniques.tsx`, `Home.tsx`), checking `progressions.find(...)` inside a `.map` or loop over techniques causes an $O(N \times M)$ operation on every render.
**Action:** Replace `Array.prototype.find()` inside loops with an upfront dictionary lookup ($O(N)$ to build map, $O(1)$ to look up).

## 2025-02-27 - O(N) Array.includes Replacement
**Learning:** `favorites.includes(tech.id)` runs in $O(M)$ time and is executed $O(N)$ times during filtering, leading to $O(N \times M)$ checks.
**Action:** Use a memoized `Set(favorites)` for $O(1)$ `.has()` lookups during filtering loops.
