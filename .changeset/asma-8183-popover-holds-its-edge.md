---
'asma-ui-core': patch
---

ASMA-8183: `PopoverSheet` stays in place while it is open when applying a filter moves its trigger. The label growing to "Filter (N)" squeezes a search field beside it, so the trigger's edge moved and the surface followed. The aligned edge now stays where the open placed it; the vertical position still follows the trigger, and a new open or a viewport resize aligns it to the trigger again.
