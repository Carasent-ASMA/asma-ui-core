---
'asma-ui-core': patch
---

ASMA-8183: stop `PopoverSheet` re-running `shift` when its own content resizes.

Chip wrap and autocomplete tags change the sheet size; default `autoUpdate` observed that and the surface jumped left-right. Position still follows the trigger on scroll and ancestor resize.
