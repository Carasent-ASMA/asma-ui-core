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
  while its header is hovered or keyboard-focused, on a grey rounded square (provisional until UX confirms).
  The label truncates with an ellipsis and the slot stays visible.
- Where column resizing is on, the resize handle's grab zone is 24 px wide at the column's right edge and the
  header content keeps clear of it. The visible bar looks as before.
- The column settings pin shows a `StyledBadge` dot, as the Filter button does, when a column is hidden or
  has been moved.
- _Reset order_ is now _Reset columns_ ("Tilbakestill kolonner"): it also resets the widths, restores the
  order to the current column definitions, removes the saved entries and shows "Columns reset". It never
  unhides columns and leaves page size alone. On a `persistSorting` table it resets the sorting to
  `initialState.sorting` too.

**Fixes for tables with `uniqueKey` or `persistColumnOrderKey`:**

- Saved widths are checked against the columns: unknown columns and values that are not a width are dropped
  and the rest is kept. Entries saved before this change still load.
- A saved width or order equal to the default is removed instead of written, and mounting a table writes
  nothing.
- When `uniqueKey` changes while the table is shown, the new key's widths load and the old key's widths are
  no longer written over it.
- Broken, full or blocked `localStorage` (including page size and column order) leaves the table working in
  memory, with no thrown error and no `console.error`.

Apps pick up the visual changes the next time they move to this version of `asma-ui-core`.
