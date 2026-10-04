---
'asma-ui-core': patch
---

ASMA-8183: draw the `PopoverSheet` surface edge as an inset box-shadow ring instead of a border.

A border consumes layout width, so at the 472px Action max-width a date-picker pair (200 + 16 + 200 = 416px with the 16px/40px body padding) had only 470px left after the two 1px borders and still wrapped to two rows. Figma's stroke takes no width from autolayout — the inset shadow ring (1px, delta-300, composed with the elevation shadow) matches that, follows the radius, and uses the package's existing non-layout line idiom (`StyledTab`/`StyledMenuItem` focus rings).
