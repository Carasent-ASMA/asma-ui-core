---
'asma-ui-core': minor
---

ASMA-8597: UX round 4 on `StyledTable` (the owner, after talking with Eugeniu Gutu, 2026-11-04). Two defaults change in
every table, so this is a minor release.

- **Every table resizes by default.** `enableColumnResizing` is now on unless a table passes `enableColumnResizing={false}`.
  Every data column gets a resize handle, except ui-core's own columns (select, expand, actions with the pin, drag handle,
  show full text), a column that opts out with `enableResizing: false` or has a fixed width (`minSize` equal to
  `maxSize`), and the last data column, which keeps filling the remaining width. 37 table files in the apps that were not
  resizable gain handles. Widths are drag-only until ASMA-8694.
- **Saving widths stays opt-in.** A table that gets resizing from the default resizes in memory and neither reads nor
  writes `${uniqueKey}:column-sizing`; an entry saved earlier stays untouched. A table that sets `enableColumnResizing`
  itself, as `true`, saves as before. To save widths, write `enableColumnResizing` and give the table a per-user
  `uniqueKey`.
- **A narrow column keeps its declared width as its minimum.** A column with no `minSize` now gets the smaller of 100 px
  and its default width, so turning resizing on never widens a column past its default. Columns declared below 100 px in
  tables that already resized (about 19) are no longer pushed up to 100 px.
- **Sortable columns are 20 px wider by default**, so the sort triangle fits: `size` (150 when none is set, or the table's
  `defaultColumn.size`), and `minSize` and `maxSize` when set, grow by 20 px. This includes sortable columns that opt out of
  resizing, which keep no handle (a `minSize === maxSize` column stays fixed, at the new width). Columns that cannot sort,
  ui-core's own columns and group headers keep their widths. A width a user saved, an app's `initialState.columnSizing` and a
  controlled `state.columnSizing` are applied as given, and Reset columns returns to the new defaults. An app that feeds a
  remembered width back as `size` gets the 20 px on it.
