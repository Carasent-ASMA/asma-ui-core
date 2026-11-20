---
'asma-ui-core': minor
---

ASMA-8698: every `StyledTable` with a `uniqueKey` now remembers each user's sorting, as it already remembers their column
widths. The user's last sort comes back when they leave a table and return (another tab, another widget, a reload), and
**Reset columns** puts the app's `initialState.sorting` back and removes the saved entry. It no longer needs `persistSorting`.

**This is the second release, and goes out last.** 3.138.0 carried it ahead of the plan and was reverted in 3.138.1. The order: the migration helper
(`migrateLegacyTableSettings`) is released first; each app's PR bumps to it, takes every patient, questionnaire or record id out of its table keys (a table
saves its sort under its `uniqueKey`, so an id there would store one user's sort per patient) and puts `persistSorting={false}` on every drag-and-drop table;
every one of those PRs is merged and a preflight over the apps passes; the docs for `uniqueKey` and `persistSorting` are merged; then this version is
released; then the apps bump to it.

- `persistSorting={false}` is the opt-out: nothing about sorting is read or written, a saved entry is ignored and left as it
  was, and Reset columns leaves the sorting alone. `persistSorting` and `persistSorting={true}` are accepted and mean the
  default; the prop stays until the next major version.
- **A table whose app owns the sorting is not saved by default.** That is a table that passes `state.sorting` or
  `onSortingChange` (TanStack hands every change to that handler, so it is the app's state too). A saved sort could not be applied
  to a state the table does not own, and an app that saves its own sort would have two writers. Such a table that wants
  `StyledTable` to save it keeps writing `persistSorting` (as `asma-app-crm` `OrganizationsTable` does with
  `usePersistedSorting`), which makes `StyledTable` the only writer and works as before.
- A saved sort of a column that is gone or cannot sort is ignored, and the declared default applies; a saved sort for some
  columns keeps the ones that still sort. Corrupt, full or blocked storage is ignored silently. The default comparison
  (empty cells last) sorts a restored sort like any other.
- **Less work per render.** A setting that is not saved is no longer serialised on every render: for a table with no key, the ten `JSON.stringify` calls per render are
  gone, and a table that saves widths and sorting does two. Reads stay once per mount and key, saving adds no render, and nothing is written on mount (the page size
  has been saved on change only since 3.140.0). Page size, widths, order and visibility behave as before.
- The layout reconcile stays correct for a table that is opted in at run time: a `persistColumnLayout` change from `false` to `true` on a mounted table is
  reconciled as it always was (`columnLayoutInputsChanged`), though a table that does not save its layout builds no signature on any render.
- `TABLE_SETTINGS_SUFFIXES`, the suffixes of the five entries a table saves under its `uniqueKey` (`:sorting`, `:column-sizing`, `:page-size`, `:column-order`,
  `:column-visibility`), is now exported from the package entry, for an app that cleans up or inventories those entries itself and should not keep its own copy of the list
  (3.139.0 had it only in the helper module). A test on the package entry pins it.
