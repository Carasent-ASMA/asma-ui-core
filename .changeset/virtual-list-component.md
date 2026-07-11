---
'asma-ui-core': minor
---

Add `VirtualList` — a windowed list component on top of `@tanstack/react-virtual` covering fixed-size, variable-size, and measured (content-driven) row heights. Replaces app-level usage of `react-window` / `react-virtualized` so consuming apps can drop those dependencies. Deliberate addition to the frozen API surface (DEC-003): one new runtime export, no existing export touched.
