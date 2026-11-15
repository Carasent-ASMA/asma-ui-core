---
'asma-ui-core': minor
---

ASMA-8698: `migrateLegacyTableSettings` and `useLegacyTableSettingsMigration`, for an app that changes a table's saved-settings
key (for example to take a patient or record id out of it) and must not lose what its users already saved. **This changes no sorting
behaviour**: saving a table's sort is still an opt-in (`persistSorting`, as in 3.138.1), so an app can take this version at once. Saving every
table's sort by default comes later, as a separate release; migrate a table's keys with this helper, and put `persistSorting={false}` on drag-and-drop
tables, before bumping to that one.

The app builds the keys, as it already does for the table's `uniqueKey`, and passes them:

```tsx
useLegacyTableSettingsMigration({
    newKey: tableKey, // the table's `uniqueKey` now
    oldKeys: patientId ? [tableKeyWithPatient(patientId)] : undefined, // the current scope, named exactly
    matchOldKey: (oldKey) => anotherPatientOfThisTable(oldKey), // optional: other patients' entries, removed
    rawEntries: [{ from: `${orderName}-${row.id}`, to: orderName }], // optional: keys the app named itself
})
<StyledTable uniqueKey={tableKey} persistColumnOrderKey={orderName} … />
```

- For each of the five entries `StyledTable` saves under a `uniqueKey` (`:sorting`, `:column-sizing`, `:page-size`,
  `:column-order`, `:column-visibility`), and for each old → new pair in `rawEntries`, the entry is **copied once, only if the new
  key has none**, and the old entry is **removed once the copy has been tried**. What the user saved under the new key is never
  overwritten; when storage is full or blocked, the old entries stay and the next call tries again.
- **With no current scope named** (`oldKeys` empty, `rawEntries` empty) it copies nothing and **removes nothing**, whatever a
  matcher would match: the old entries are what the next visit with a scope can still carry over.
- The matchers only remove. `matchOldKey` is asked about stored keys that end in one of the five suffixes (suffix taken off), never
  about `newKey` or an old key. `matchRawKey` is asked only about a stored key that starts with the `to` of a pair, and never about
  a `to`, a `from` or a table-settings entry. A matcher that throws is ignored. Match exactly and anchor both ends.
- It is safe to call again (React StrictMode runs the hook twice), never throws, and with nothing to migrate it only looks for the
  old entries and writes nothing. The hook runs while the component renders, so it has run before the `StyledTable` it renders
  reads its storage, and runs again when the scope (`newKey`, `oldKeys`, the pairs) changes.
- Fixes a leftover: when a table with `persistColumnLayout` has its own valid order or visibility entry **and** its old
  `persistColumnOrderKey` or `legacyColumnVisibilityKey` entry is still there, the old entry is now removed (it was only removed when
  the new one was missing). An invalid entry confirms nothing, so then the old one stays. The table now looks once for such a
  leftover on each mount (one read of a key that is normally absent), where it did not read the old key at all.
