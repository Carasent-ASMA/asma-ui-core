---
'asma-ui-core': minor
---

ASMA-8338: `activeRowId` now draws the Figma table-row **Selected** state — white with a 2px
`border/selected` (gama-400) frame around the row the user is working with (e.g. the one opened in a
side panel), kept white on hover so it never reads as the hover; a ticked row keeps its Checked fill
inside the frame. Keyboard focus still shows the 3px Focused frame. The select column's checkboxes,
including the select-all box in the header, show the pointer cursor (locked rows keep not-allowed).
Hovering a checkbox's or radio's option text (any enclosing `<label>`, e.g.
`StyledFormControlLabel`) now shows its grey hover circle, as Figma's Checkbox+Label / Radio+Label
Hovered state does; never on a disabled or read-only control. The 1px row line now sits under every row, the last one included, as
Figma's `border-b` does. New `RowStates` story shows the six Figma table-row states.
