---
'asma-ui-core': minor
---

ASMA-8695: a `StyledTable` can save each user's column order and hidden columns under their own `uniqueKey`. Until now the
order was saved under an app-provided key that every user of a browser shared, and the visibility only lived in memory (or in
a copy of an app hook). It is an opt-in, so no table changes until its app asks.

- **Opt in with `persistColumnLayout`** (needs a per-user `uniqueKey`, from `getTableSettingsKey` of asma-core-helpers). The
  order is saved as `${uniqueKey}:column-order` and the visibility as `${uniqueKey}:column-visibility`, both versioned, with
  the storage rules of the saved sorting and widths: a layout equal to the default removes the entry, loading writes
  nothing, a key change loads the new key's layout, no key means the defaults, and blocked storage leaves the table working.
  Only the columns whose visibility differs from the default are saved, never ui-core's own columns.
- **The app declares the defaults in `initialState.columnOrder` and `initialState.columnVisibility`, and a saved layout beats
  them.** On a table that opts in the table owns the visibility: do not pass `state.columnVisibility` or
  `onColumnVisibilityChange` (a development build warns).
- **A column that is not in a saved order appears at its definition position,** not at the end, so an app no longer needs a
  helper that inserts a new column into the saved order.
- **The column settings dot follows the defaults** on a table that opts in: no dot for a column that is hidden by default; a
  dot once the order, or a column's visibility, differs from the default. Other tables keep today's rule.
- **Reset columns also restores the default visibility** on a table that opts in (it unhides what the user hid and hides what
  is hidden by default) and removes the saved entries.
- **The old entries are migrated once.** The first user who opens an opted-in table on a browser takes over the old
  unscoped order (`persistColumnOrderKey`) and the old visibility entry (`legacyColumnVisibilityKey`, a raw
  `{ [columnId]: boolean }` map): they are written to that user's entries and deleted, so they are never read again. Later
  users start from the defaults.
- A table that does not set `persistColumnLayout` behaves exactly as before, including its order of precedence: with
  `persistColumnOrderKey` and `initialState.columnOrder` the app's order still wins.
