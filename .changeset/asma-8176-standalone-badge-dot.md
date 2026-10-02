---
'asma-ui-core': minor
---

ASMA-8176: add `StyledBadgeDot`, the notification dot as a flow element.

`StyledBadge` anchors its dot to the corner of a host it wraps, so a dot with no
host had nowhere to sit and consumers hand-rolled an 8px circle instead. The new
component renders the documented 12px lime circle with its 2px `Badge/border-dot`
ring in normal flow, for table cells and markers in a row.

It is hidden from assistive technology by default, matching the anchored dot. Pass
`ariaLabel` where nothing nearby announces the state, so a standalone dot is not
carrying meaning by colour alone.
