---
'asma-ui-core': minor
---

ASMA-7240: `StyledDynamicSelect`'s chip-group variant (1–5 options) now honours `disableHelperText`.
The prop was already part of the public props and documented, but only the autocomplete variant ever
read it — the chip group rendered its helper row unconditionally, parking an empty 28px band under
the chips and pushing whatever followed them out of a caller's spacing rhythm.

Pass `disableHelperText` and the reservation goes; a real `helperText` or an `error` still renders the
row, growing the layout at that moment, so nothing is swallowed. Chip groups that do not pass the
prop keep the reserved row and are unchanged. The row's slot rule and its ARIA role now come from the
shared `useHelperSlot` hook, which the component previously duplicated by hand.
