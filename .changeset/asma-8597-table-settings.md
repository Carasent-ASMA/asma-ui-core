---
'asma-ui-core': minor
---

ASMA-8597: `StyledTable` can remember a user's sorting, and every table gets the Figma sort indicator, a
wider resize handle and a Reset columns action.

**New, opt-in.** A table with `uniqueKey` and the new `persistSorting` prop saves its sorting under
`${uniqueKey}:sorting` and shows it again on the first render after a reload. A saved "unsorted" stays
unsorted. `persistSorting` is a temporary opt-in; tables without it never read or write the entry. A table
that owns its sorting state (for example because the server sorts) can call the new
`readPersistedSorting` and `usePersistedSorting` to start from the saved sort. The root barrel gains exactly
these two names.

**Changes for every `StyledTable`:**

- Sortable headers draw the Figma indicator: a 20 × 28 px slot right after the label, with the glyph in the
  primary colour when sorted. An unsorted column shows a grey glyph, pointing the way the next click sorts,
  while its header is hovered or keyboard-focused; a sorted column keeps its primary glyph. Nothing is drawn
  behind the glyph. The label truncates with an ellipsis and the slot stays visible.
- Where column resizing is on, the resize handle's grab zone is 24 px wide at the column's right edge and the
  header content keeps clear of it. The visible bar looks as before.
- The column settings pin shows a `StyledBadge` dot, as the Filter button does, when a column is hidden or
  has been moved. The dot is visual, so the pin's accessible name says it too: "Column settings, changed"
  ("Kolonneinnstillinger, endret"); without the dot it stays "Column settings" ("Kolonneinnstillinger").
- _Reset order_ is now _Reset columns_ ("Tilbakestill kolonner"): it also resets the widths, restores the
  order to the current column definitions, removes the saved entries and shows "Columns reset". It never
  unhides columns and leaves page size alone. On a `persistSorting` table it resets the sorting to
  `initialState.sorting` too.

**Fixes for tables with `uniqueKey` or `persistColumnOrderKey`:**

- Saved widths are checked for shape: values that are not a width (not a finite number above 0) are dropped.
  A width saved for a column that is not there at the moment is kept in the entry, and shows when the column
  appears, as before; an id that matches no column has no effect. Entries saved before this change still load.
- A saved width or order equal to the default is removed instead of written, and mounting a table writes
  nothing.
- When `uniqueKey` changes while the table is shown, the new key's widths load and the old key's widths are
  no longer written over it.
- When `uniqueKey` becomes `undefined` (for example while the signed-in user is not known yet), the table goes
  back to its default widths and nothing is saved, so one user's values are not left on screen.
- Tab pressed on a control inside the header, such as the column settings popover, is no longer sent to the
  first body row by the header row's Tab handler. Tab pressed on the header row itself still goes to the
  active row.
- Broken, full or blocked `localStorage` (including page size and column order) leaves the table working in
  memory, with no thrown error and no `console.error`.

Apps pick up the visual changes the next time they move to this version of `asma-ui-core`.
