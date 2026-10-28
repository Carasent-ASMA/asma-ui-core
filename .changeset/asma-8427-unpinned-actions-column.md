---
'asma-ui-core': minor
---

ASMA-8427: `StyledTable` no longer pins an empty actions column — one that only hosts the header pin
menu now scrolls with the data instead of covering the last column, while the header cell with the
pin menu stays pinned. A column that renders actions, or sits beside fixed-right columns, stays
pinned; `stickyActions` overrides the choice.

`PathfinderCard` collapsed keeps its content 8px clear of the absolutely positioned chevron and lets
items shrink, so a long value ellipsizes instead of being clipped underneath the icon.
