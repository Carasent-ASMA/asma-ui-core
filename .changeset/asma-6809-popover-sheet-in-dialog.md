---
'asma-ui-core': patch
---

ASMA-6809: keep `PopoverSheet` at its trigger when it opens inside a modal `<dialog>`.

The surface class carried `relative`, and ui-core utilities ship `!important`, so it beat Floating
UI's inline `position: fixed`. Outside a dialog the browser masks this — a top-layer popover forces
`relative` to compute as `absolute` — but inside a modal dialog the sheet portals into the dialog
instead of the top layer, so it rendered off-screen past the right edge and focusing it scrolled the
dialog sideways. Drop `relative` from the shared surface class; the sheet's own inline `fixed` (and
the Gallery story's `relative`) is now the containing block for the edge and Close layers.
