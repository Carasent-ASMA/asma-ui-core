---
'asma-ui-core': minor
---

ASMA-8427: `StyledTable` gains `stickyActions={false}` for tables whose actions column should scroll
with the data instead of covering the last column; the header cell with the pin menu stays pinned.
The default stays the current pinned behaviour.

`PathfinderCard` collapsed keeps its content clear of the absolutely positioned chevron and lets
items shrink, so a long value ellipsizes instead of being clipped underneath the icon.
