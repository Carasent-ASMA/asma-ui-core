---
'asma-ui-core': minor
---

Align shared menus with the design system (Figma `16073-21583`):

- A separator between every menu row, none after the last. `StyledMenuList` marks the rows, so
  the table's own row-action item gets the line too — not just `StyledMenuItem`.
- Separator pinned to `gray-200` (`#d3d8df`); the fretex theme remaps `delta-200`, which would
  otherwise shift it. Hover stays `delta-50`, which already resolves to Figma's `#f0f2f4` in every
  theme. A selected row keeps its `gama-50` fill on hover, matching the node.
- New optional `tooltip` prop on `StyledMenuItem` for the already-in-use hint on a taken
  multiple-choice option. The caller supplies the text: this package ships no translations.
- `ToolbarActionGroup` drops its manual `<hr>` dividers, now redundant.
