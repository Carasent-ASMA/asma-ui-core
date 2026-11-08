---
'asma-ui-core': patch
---

ASMA-8597: UX's answers on the `StyledTable` header (Jira comments 94750 and 94751).

- A sortable header that is not sorted no longer reserves the 20 px sort indicator slot at rest. The slot
  appears while the header is hovered or keyboard-focused, and a sorted header always keeps it. A truncated
  label of an unsorted header is therefore 20 px shorter while the header is hovered or focused. A right- or
  centre-aligned header's label moves by up to 20 px while it is hovered or focused.
- A sorted column's triangle turns `gama-400` while its header is hovered or keyboard-focused, and is `gama-500`
  otherwise. An unsorted column's triangle stays grey. On the header background `gama-400` is 3.02:1 in the jade
  theme, 2.62:1 in the default theme and 2.15:1 in the fretex theme, which UX accepted for the hover and focus state.
- The resize handle's visible bar is `delta-400` (it was `delta-300`). While a column is being resized it stays
  `gama-500`.
