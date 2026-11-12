---
'asma-ui-core': patch
---

ASMA-8597 (the owner, 2026-11-12): in the `StyledTable` column settings menu (the pin), a column is now shown or hidden
only from its checkbox. Clicking the row, the column's name or the drag icon, or pressing and releasing the drag icon
without dragging it, used to toggle the column too, because the whole row was a button that toggled it. The row is now plain
markup and the checkbox is its one control.

- Reordering by dragging the icon is unchanged (the 8px activation distance, fixed columns that cannot be moved, Reset and the
  pin's dot). Space on the focused checkbox toggles; Enter on it does not, as on any checkbox.
- The checkbox is named by its column (`aria-labelledby`: it used to have no name of its own, and its row button was called
  "Check iconRole") and its target is 24 x 24px, centred on the same 16px box, so the row looks as it did. A column that cannot
  be hidden has a read-only checkbox. The tooltip's reason for a fixed or unhideable column still describes the control it is
  about: the checkbox.
- A click on the row or the name leaves the focus where it was; the checkbox and the drag icon take it as usual. The checkbox is
  first in the tab order of its row, then the drag icon, as the toggle always was; the row itself is no longer a tab stop.
