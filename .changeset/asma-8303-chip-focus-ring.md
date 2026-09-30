---
'asma-ui-core': patch
---

Fix `StyledChip`/`StyledInteractiveChip` (and everything built on it — tag chips, filter checkboxes/
radios) painting the focus ring on **any** focus, not just a visible/keyboard one.

`.focus-ring` (`StyledChip.module.scss`) matched `:focus-within` in addition to `:focus-visible` —
`:focus-within` has no input-modality awareness, so a chip programmatically focused after a mouse
click (e.g. `PopoverSheet`'s "focus moves to first control" on open) always showed the ring, even
though the trigger was never reached via keyboard. Replaced with `:has(button:focus-visible)`,
scoped to the chip's own delete button (the one real case that needed the ring painted on the parent
rather than the button itself) — matching the `:has(...:focus-visible)` pattern already used by
`StyledRadio`/`StyledCheckbox`/`StyledAccordion`/`StyledTable` elsewhere in this package.

Same audit found the same class of bug in the table's column-reorder drag handle
(`HeaderActionMenu.module.scss`'s `.drag-icon--enabled`): its outline color was set on bare `:focus`
instead of `:focus-visible`, so any mouse-triggered focus on the drag icon tinted its outline too.
Fixed the same way.
