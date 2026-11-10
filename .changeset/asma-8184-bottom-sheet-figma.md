---
'asma-ui-core': minor
---

ASMA-8184: `StyledBottomSheet` (and `PopoverSheet` below 744px) follows the approved Figma bottom sheet (DS_draft 7-10988):

- The drag handle is a 32 × 4 bar (`text-icon/body`) instead of the 24px minus icon.
- The sheet opens at most half the screen high and is as short as its content. When the content needs more, it expands to 90vh by dragging the handle up, or from the keyboard: `Tab` lands on the handle and `Space` / `Enter` toggle the two heights. The body scrolls internally.
- New optional `onBack` / `backLabel` (back control left of the header) and `titleIcon` (20px icon before the title), as in the Figma component.
