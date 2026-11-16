---
'asma-ui-core': minor
---

ASMA-8698: every `StyledTable` with a `uniqueKey` now remembers each user's sorting, as it already remembers their column
widths. The user's last sort comes back when they leave a table and return (another tab, another widget, a reload), and
**Reset columns** puts the app's `initialState.sorting` back and removes the saved entry. It no longer needs `persistSorting`.

**Publish only when every app is ready.** A table now saves its sort under its `uniqueKey` unless it opts out, so before an app
bumps to this version its keys must contain no patient, questionnaire or record id (they would store one user's sort per
patient), and every table whose order is the user's own, such as drag and drop rows, must say `persistSorting={false}`.

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
- **Less work and no write on mount.** A table with a `uniqueKey` no longer writes its page size when it mounts (it did, with
  the default, on every mount); the page size is saved when the user changes it. A setting that is not saved is no longer
  serialised on every render: for a table with no key, the ten `JSON.stringify` calls per render are gone, and a table that
  saves widths and sorting does two. Reads stay once per mount and key, and saving adds no render. Page size, widths, order and
  visibility behave as before.
