---
'asma-ui-core': patch
---

ASMA-8782: on a read-only `StyledInputField` the shrunk floating label and the border notch no longer paint a white box over the grey fill. Above the border they are clear and below it they take the field's fill, as Figma draws it. The read-only fill is Figma's `delta/10` (#f9fafb) instead of `delta-50` (#f0f2f4).
