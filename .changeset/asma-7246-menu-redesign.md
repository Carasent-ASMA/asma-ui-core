---
'asma-ui-core': minor
---

Align shared menus with the design system (Figma `16073-21583`):

- A separator between every menu row, none after the last. `StyledMenuList` marks the rows, so
  the table's own row-action item gets the line too — not just `StyledMenuItem`.
- Separator pinned to `gray-200` (`#d3d8df`); the fretex theme remaps `delta-200`, which would
  otherwise shift it. Hover stays `delta-50`, which already resolves to Figma's `#f0f2f4` in every
  theme. A selected row keeps its `gama-50` fill on hover, matching the node.
- Optional `tooltip` on `StyledMenuItem`. When omitted, a checked and disabled checkbox
  (already selected, not pickable again) shows "Allerede lagt til", or "Already added" when
  `<html lang>` is English. Pass `tooltip` for another phrase, such as "Already in use".
- `ToolbarActionGroup` drops its manual `<hr>` dividers, now redundant.
