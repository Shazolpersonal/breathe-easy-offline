## 2023-10-27 - O(N*M) to O(N+M) mapping in React Hooks
**Learning:** React hooks like `useMemo` can easily hide $O(N \times M)$ performance bottlenecks if you use `.filter()` over large historical datasets (like `sessions` stored in local storage) inside a loop (like iterating over days of a month).
**Action:** Always pre-compute hash maps (`Record<string, T[]>`) in $O(M)$ time before looping over the $N$ items to fetch the groups in $O(1)$ time. Also use `.substring(0, 10)` over `.split("T")[0]` or `.startsWith` for safer and faster ISO date prefix matching.

## 2024-04-18 - Caching Redundant JSON parsing
**Learning:** `localStorage.getItem` combined with `JSON.parse` is highly expensive for large datasets like `sessions` when called repeatedly in loops or render cycles, typical in React state initializations.
**Action:** Implemented a simple memoization technique (`jsonCache`) mapping the `key` to its raw string and parsed object. This avoids redundant `JSON.parse` operations if the raw string remains unchanged, achieving significant runtime reductions (e.g., from ~245ms to ~1.8ms per 100 iterations of 1000 items). Always ensure `setJSON` updates the cache to avoid stale reads.
## 2024-05-19 - React.memo() on pure presentation components
**Learning:** Components like `ScreenColorBreathing` and `ParticleBackground` receive stable primitive props (`phase`, `phaseDuration`) but were rendering on every single tick (1 second) of the parent `Session.tsx` component.
**Action:** Always wrap pure presentation components in `React.memo()` if they are placed inside a parent that has a rapid and frequent state update loop (like a timer tick) but their own props remain mostly static.

## 2024-05-20 - O(N*M) in Array Filtering inside a Date Loop
**Learning:** `monthSessions.filter(s => s.date.startsWith(dateStr)).reduce(...)` inside a `for (let d = 1; d <= daysInMonth; d++)` loop evaluates to an O(N*M) time complexity. For heavy users tracking many sessions over a month, this degrades performance noticeably on every render or dependency change.
**Action:** Always pre-compute a lookup table (e.g. `Record<string, number>`) in a single O(N) pass, then use it for O(1) lookups during the O(M) loop to build chart data, bringing the total cost down to O(N+M).
## 2024-05-21 - Avoiding Multiple Passes over Large Data Arrays
**Learning:** Chaining array methods like `.map().size` and `.reduce()` multiple times sequentially over large sets (e.g., historical user sessions) triggers multiple full sweeps through the dataset. This results in (3N)$ or higher runtime execution in React component render cycles, which degrades performance as the user's history grows.
**Action:** Replace sequential passes with a single (N)$ loop (using a basic `for...of` construct). Inside this single pass, perform all calculations (e.g., adding to a Set for unique counting, summing values for totals, or finding extremums). This scales much more reliably.
## 2024-05-22 - Performant String Substring for ISO Dates
**Learning:** Extracting dates from an ISO string using `.split("T")[0]` creates intermediate arrays and forces the Javascript engine to scan the entire string. When iterated over thousands of items in a map or filter callback, the overhead from this garbage-collection and allocation degrades performance.
**Action:** Use `.substring(0, 10)` to extract the `YYYY-MM-DD` portion directly. It avoids array allocations and executes significantly faster, acting as an easy micro-optimization when parsing arrays of dates.
## 2024-04-23 - Simultaneous O(N) Aggregation over Chained Methods
**Learning:** In a heavily analytics-focused page (`Stats.tsx`), React `useMemo` hooks frequently re-evaluate operations over large lists (like `sessions`). Chaining array methods (`.filter().map().reduce()`) creates implicit O(N * M) complexities and excessive garbage collection from intermediate arrays.
**Action:** When computing multiple aggregates (e.g., total duration, unique days, calm score averages, and technique counts) for a single time period, use a single O(N) `for` loop to compute all of them simultaneously.
