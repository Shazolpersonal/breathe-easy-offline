## 2023-10-27 - O(N*M) to O(N+M) mapping in React Hooks
**Learning:** React hooks like `useMemo` can easily hide $O(N \times M)$ performance bottlenecks if you use `.filter()` over large historical datasets (like `sessions` stored in local storage) inside a loop (like iterating over days of a month).
**Action:** Always pre-compute hash maps (`Record<string, T[]>`) in $O(M)$ time before looping over the $N$ items to fetch the groups in $O(1)$ time. Also use `.substring(0, 10)` over `.split("T")[0]` or `.startsWith` for safer and faster ISO date prefix matching.

## 2024-04-18 - Caching Redundant JSON parsing
**Learning:** `localStorage.getItem` combined with `JSON.parse` is highly expensive for large datasets like `sessions` when called repeatedly in loops or render cycles, typical in React state initializations.
**Action:** Implemented a simple memoization technique (`jsonCache`) mapping the `key` to its raw string and parsed object. This avoids redundant `JSON.parse` operations if the raw string remains unchanged, achieving significant runtime reductions (e.g., from ~245ms to ~1.8ms per 100 iterations of 1000 items). Always ensure `setJSON` updates the cache to avoid stale reads.
## 2024-05-19 - React.memo() on pure presentation components
**Learning:** Components like `ScreenColorBreathing` and `ParticleBackground` receive stable primitive props (`phase`, `phaseDuration`) but were rendering on every single tick (1 second) of the parent `Session.tsx` component.
**Action:** Always wrap pure presentation components in `React.memo()` if they are placed inside a parent that has a rapid and frequent state update loop (like a timer tick) but their own props remain mostly static.
