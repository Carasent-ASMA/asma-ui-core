---
'asma-ui-core': patch
---

ASMA-8176: draw the "filters applied" dot with `StyledBadge` instead of a hand-rolled circle.

`StyledFilterMenu` and `StyledFilterButton` each built their own 8px `bg-gama-400` circle. That is
Figma's `Parent=Filter` dot, which `StyledBadge` now renders, and the specified token is `gama-500`
— so the dot was also a shade too light. Position and size are unchanged.
