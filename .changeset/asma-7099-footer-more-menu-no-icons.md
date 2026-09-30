---
'asma-ui-core': patch
---

ASMA-7099: `StyledDialogFooter` "More" menu rows are now label-only.

An action's icon belongs to its inline button; repeating it on the overflow row was
off-spec for the Figma "More" state. Menu items in the footer's overflow now render
the label alone (keeping the danger tone for destructive actions), so an opened More
menu no longer shows icons next to each entry.
