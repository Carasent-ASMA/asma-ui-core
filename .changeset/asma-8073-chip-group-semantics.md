---
'asma-ui-core': patch
---

ASMA-8073: the chip group of `StyledDynamicSelect` (1–5 options) is a `role="group"` named by its
title. With `error` it is `aria-invalid`, and it is described by its helper row, like the other
inputs that use the shared helper slot.
