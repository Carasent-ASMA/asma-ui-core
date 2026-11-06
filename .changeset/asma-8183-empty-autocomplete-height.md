---
'asma-ui-core': patch
---

ASMA-8183: an empty multiple autocomplete (`StyledDynamicSelect` with `multiple`, `StyledSelectAutocomplete` with chips) is 40px high, as the Figma empty state, instead of 64px. With chips selected it keeps the taller Figma filled layout.
