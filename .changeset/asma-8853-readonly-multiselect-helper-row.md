---
'asma-ui-core': patch
---

ASMA-8853: drop the reserved helper row from a read-only multi-select `StyledDynamicSelect`.

`useHelperSlot` has always known the rule — `readOnly !== true && (...)` — but
`DynamicInteractiveChipGroup` called it with four arguments and never passed the fifth, so the row
rendered with nothing in it: `min-h-[24px]` plus `pt-1`, about 28px of dead space beneath the chips.
A saved-filter panel stacking several read-only multi-selects accumulated the gap visibly. The other
inputs with a read-only mode (`StyledInputField`, `StyledSelect`, `StyledRadioGroup`) have always
passed it; this component was the one not asking.

**Visible layout change.** Anything rendering a read-only multiple `StyledDynamicSelect` loses ~28px
of space under it, and content below moves up. Editable selects are untouched — the reserved row
still stops a validation message shifting the fields beneath it.

A message set on a read-only multi-select is now suppressed along with the space, which is what the
other three already do. No consumer in the workspace does that today: the one call site combining
read-only with a helper (`asma-app-calendar`'s `OfferSelect`) is `multiple={false}` and takes the
single-select path.
