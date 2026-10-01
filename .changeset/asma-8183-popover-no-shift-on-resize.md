---
'asma-ui-core': patch
---

ASMA-8183: `PopoverSheet` `width="hug" | "max"`, and stop re-running `shift` when the sheet's own content resizes.

Chip-autocomplete filters pass `width="max"` (472px) so tags wrap instead of growing the surface; radios and short chip-groups stay on the default hug. Position still follows the trigger on scroll and ancestor resize, but chip wrap no longer jumps the sheet left-right.
