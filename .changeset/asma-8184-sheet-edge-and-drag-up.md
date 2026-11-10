---
'asma-ui-core': patch
---

ASMA-8184: `StyledBottomSheet` (and `PopoverSheet` below 744px):

- The 1px edge no longer takes width, so the sheet's content is the full 640px, as in Figma.
- Dragging the handle up on a sheet that can expand now follows the finger. On release it eases to 90vh (after 48px) or back to its height; the keyboard toggle eases the same way.
- The screen stays white below the sheet down to its bottom edge, under iOS Safari's floating toolbar, instead of showing the scrim there on some pages.
