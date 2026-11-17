---
'asma-ui-core': patch
---

fix(table): ASMA-8698 `StyledTable` loads the column order when `persistColumnOrderKey` changes on a mounted table.

An app can now keep one mounted table across tabs and only change `uniqueKey` and `persistColumnOrderKey`, instead of giving the table a React `key` per tab, which rebuilt the whole subtree on every switch. Sort, widths and page size already loaded per key; the legacy column order did not, so the previous tab's order stayed on screen under the new key.

- On a key change the table loads the new key's order in a layout effect (no flash): the order a fresh mount with that key would open with, that is `initialState.columnOrder` when the table has one, else the saved order, else `[]`. Legacy tables keep their order of precedence (the table's own order beats a saved one).
- Nothing is written or removed under the new key by the switch, the old key's entry is never touched, and a reorder afterwards is saved under the new key only. A key that goes away returns the order to the default, and a key that arrives late loads its saved order. A table that owns `state.columnOrder` is not set by a key change; it only blocks the write.
- Tables with `persistColumnLayout` are unchanged: they already do this.

Dropping the per-tab React `key` in an app:

- Pass the per-tab `uniqueKey` and `persistColumnOrderKey`, and no `key`.
- A table with `persistSorting` takes the new key's saved sort, or `initialState.sorting`. A table without it keeps its in-memory sort across a key change, so the app must reset the sort itself when the tab changes.
- Keep the `columns` and `initialState` the new tab needs in the same render as the new keys.
