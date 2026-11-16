---
'asma-ui-core': minor
---

ASMA-8698: two fixes for a table whose settings are migrated later, after it is already showing (asma-app-editor#523). That is a table whose old
key holds a patient or questionnaire, so it opens with no patient selected, with its new per-user key, and its migration runs once one is selected.

- **A table no longer writes its page size when it mounts.** It saves the page size only when the user changes it (and the saved size still loads). Until now
  a table with a `uniqueKey` wrote its page size, the default 50 if the user had chosen none, as soon as it mounted. A table that opened before its migration
  therefore wrote 50 under the new key, and when a patient was selected the migration, which copies only what the new key lacks, kept that 50 and deleted the
  patient's 100. Loading another key's page size writes nothing either. Saving the sort, widths, order and visibility is unchanged, and so is `persistSorting`: still
  an opt-in.
- **`useLegacyTableSettingsMigration` returns a `revision`, and `migrateLegacyTableSettings` returns the number of entries it copied.** A `StyledTable` reads its saved
  settings when it mounts, and again only when its `uniqueKey` changes, so a table that is already showing when a deferred migration copies its widths keeps its
  defaults, and its next resize writes over what was migrated. The revision goes up by one each time a migration copied something, and only then (not for an entry
  the new key already had, and not for a copy that storage refused). Use it as the table's React `key`, so that it reads its storage again once, after the copy:

  ```tsx
  const revision = useLegacyTableSettingsMigration({ newKey: tableKey, oldKeys: patientId ? [oldKeyFor(patientId)] : undefined })
  <StyledTable key={revision} uniqueKey={tableKey} … />
  ```

  It remounts the table once, and only when something was copied; the React `key` is not persisted, so no patient id reaches a storage key. It is a key rather than a
  new `StyledTable` prop because the key reuses the table's one read-at-mount path for every setting, where a re-read prop would need a second path for each of the five.
  The return value of both is new; nothing that ignored them changes.

- **`defaultPageSize` repairs a browser that already holds the library's default.** Writing the page size on mount is fixed going forward, but a browser that ran
  3.138.2 or 3.139.0 may already hold the table's default under the new key, which the migration (copy only what is missing) would keep, dropping the old size. Pass the
  table's page size (its `pageSize` prop, or the new exported `DEFAULT_TABLE_PAGE_SIZE`, 50, when it sets none) as `defaultPageSize` to `migrateLegacyTableSettings` or the hook:
  **when the new `:page-size` equals it and the old entry holds a different valid page size, the old one wins**, is counted as a copy (so the revision goes up) and the old entry
  is removed as usual. A new page size that differs from the default is the user's and is kept. Without the option nothing changes. An app's migration wrapper must **return**
  the revision, the table must use it in its `key` (combine it with any key it already has: `key={`${tab}-${revision}`}`), and the app passes `defaultPageSize`.
