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
  be hidden has a read-only checkbox.
- Each reason is now told by the control it is about, on hover and on keyboard focus, and a screen reader hears it on that
  control: the drag icon of a fixed column says it cannot be moved, the checkbox of a column that cannot be hidden says it
  cannot be hidden ("This column can’t be hidden." / "Denne kolonnen kan ikke skjules.", and it says "fixed" only for a column
  that is). The row's one tooltip, which described whichever control came first and called every unhideable column fixed, and
  its combined "reordered or hidden" text are gone, so the name no longer shows a reason.
- A click on the row or the name leaves the focus where it was; the checkbox and the drag icon take it as usual. The checkbox is
  first in the tab order of its row, then the drag icon, as the toggle always was; the row itself is no longer a tab stop.
