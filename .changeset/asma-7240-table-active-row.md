---
'asma-ui-core': minor
---

ASMA-7240: `StyledTable` takes an opt-in `activeRowId` — the row the user is working with, such as
the one previewed beside a picker table. It is drawn in the Figma table-row **Focused** state (with a
ticked row, "Selected + focused"): the same 3px focus frame keyboard focus draws, now also on a row
that is not focused, so it stays visible after a mouse click and after focus moves on. The frame runs
the full row width, including the sticky actions cell. Tables that do not pass the prop are unchanged.
