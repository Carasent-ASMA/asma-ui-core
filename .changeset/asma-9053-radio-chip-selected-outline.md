---
'asma-ui-core': patch
---

ASMA-9053: a selected radio chip (`StyledInteractiveChip type='radio'`, and the single-select chip group of `StyledDynamicSelect`) no longer gets a primary-colour border and tinted fill.

Figma Tag Chip Type=Radio, Selected=on (18869-29122) keeps the chip's `border/outline` 1px edge and white fill, like every other chip; only the radio inside the chip shows the selection. Hover, focus and pressed looks are unchanged and now match the checkbox chip: a pressed selected radio chip keeps the `delta-300` edge on its `gama-200` fill. Visible change: selected radio chips in all apps lose the teal frame and light-teal fill once they take this version.
