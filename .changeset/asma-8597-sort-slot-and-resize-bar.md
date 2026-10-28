---
'asma-ui-core': patch
---

ASMA-8597: UX's answers on the `StyledTable` header (Jira comments 94750 and 94751).

- A sortable header that is not sorted no longer reserves the 20 px sort indicator slot at rest. The slot
  appears while the header is hovered or keyboard-focused, and a sorted header always keeps it. A truncated
  label of an unsorted header is therefore 20 px shorter while the header is hovered or focused.
- The resize handle's visible bar is `delta-400` (it was `delta-300`). While a column is being resized it stays
  `gama-500`.
