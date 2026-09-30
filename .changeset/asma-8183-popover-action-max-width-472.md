---
'asma-ui-core': patch
---

ASMA-8183: raise the `PopoverSheet` max-width from 400px (action) / 360px (info) to 472px for both variants.

Wide filter content (a date-picker pair, a searchable multi-select) fits on one row at the wider bound instead of wrapping, and the two variants share one surface width.
