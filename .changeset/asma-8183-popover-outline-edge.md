---
'asma-ui-core': patch
---

ASMA-8183: draw the `PopoverSheet` surface edge as a 1px outline instead of a border.

A border consumes layout width, so at the new 472px Action max-width a date-picker pair (200 + 16 + 200 = 416px with the 16px/40px body padding) had only 470px left after the two 1px borders and still wrapped to two rows. Figma's stroke takes no width from autolayout — the outline (1px, -1px offset, delta-300) matches that, keeping the full 472px for the frame's padding and content, and stays inside the surface where an ancestor's overflow cannot clip it.
