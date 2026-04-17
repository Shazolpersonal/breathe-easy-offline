## 2023-10-27 - O(N*M) to O(N+M) mapping in React Hooks
**Learning:** React hooks like `useMemo` can easily hide $O(N \times M)$ performance bottlenecks if you use `.filter()` over large historical datasets (like `sessions` stored in local storage) inside a loop (like iterating over days of a month).
**Action:** Always pre-compute hash maps (`Record<string, T[]>`) in $O(M)$ time before looping over the $N$ items to fetch the groups in $O(1)$ time. Also use `.substring(0, 10)` over `.split("T")[0]` or `.startsWith` for safer and faster ISO date prefix matching.
