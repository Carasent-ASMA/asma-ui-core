---
'asma-ui-core': minor
---

ASMA-8183: `PopoverSheet` stays where it opened and handles the controls inside it.

- The side is chosen once per open from where the trigger sits (right half → right-aligned), not from
  whether the current width fits. A growing `Filter (N)` label, added chips or a reopen no longer move
  the surface. New optional `align` prop (`'start' | 'end' | 'auto'`, default `'auto'`) overrides it.
- Top/bottom is chosen the same way on every open, and the width never shrinks while open; it grows
  away from the aligned edge.
- Escape closes the innermost open layer first (calendar, select, autocomplete or full-screen
  picker), then the popover. Presses inside those layers keep it open. New optional `ignoreOutside`
  prop lists CSS selectors of non-React overlays that must not close it.
- Focus that falls outside an Action popover returns to the control it came from; an Info popover no
  longer closes when focus moves into a portalled child such as a tooltip.
- The surface edge stays visible above the Close button's hover fill.
