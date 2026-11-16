import { useMemo } from 'react'
import {
    legacyTableSettingsScope,
    migrateLegacyTableSettings,
    type LegacyTableSettings,
} from '../helpers/migrateLegacyTableSettings'

/**
 * How many times a migration has copied something into a table's settings during this page's life, by table. Outside React on
 * purpose: React renders a component more than once (StrictMode runs the migration twice, and the second run finds nothing to copy),
 * so a count kept in state or a ref could lose or double a bump, where this one is raised exactly once per real copy.
 */
const revisions = new Map<string, number>()

/** The table a migration is for: its new key, or, for raw entries only, the first new key of a pair. */
const tableOf = ({ newKey, rawEntries }: LegacyTableSettings): string =>
    newKey ?? rawEntries?.find(({ to }) => !!to)?.to ?? ''

/**
 * Runs {@link migrateLegacyTableSettings} while the component renders, so it has run before the `StyledTable` it renders reads
 * its storage for the first time (a parent renders before its children), and again whenever the current scope changes: `newKey`
 * or `oldKeys`, which carry the user, tenant, context and patient or record. With no scope (`oldKeys` empty or missing, or no
 * `newKey`) it does nothing, and it does nothing again for the same scope.
 *
 * `matchOldKey` is read at the moment the scope changes and is not a dependency: whatever it depends on must also be in
 * `oldKeys`, so that a change of it changes the scope. The migration is idempotent, so StrictMode and a re-render that runs
 * it again change nothing.
 *
 * **Returns a `revision`: a number that goes up by one each time a migration copied something, and only then** (an entry the new
 * key already had, or a copy that storage refused, does not raise it). A `StyledTable` reads its saved settings (widths, page size,
 * sorting, order, visibility) when it **mounts**, and again only when its `uniqueKey` changes. A table that is already showing when
 * a deferred migration copies (it opened with no patient selected, and a patient was selected later: the table's `uniqueKey` does not
 * hold the patient, so it did not change) would keep its defaults, and its next resize or page size change would write over what was
 * migrated. Use the revision as the table's React `key`, so that it reads its storage again once, after the copy:
 *
 * ```tsx
 * const revision = useLegacyTableSettingsMigration({
 *     newKey: tableKey,
 *     oldKeys: patientId ? [oldKeyFor(patientId)] : undefined,
 * })
 * <StyledTable key={revision} uniqueKey={tableKey} … />
 * ```
 *
 * That remounts the table once (its row selection, expanded rows and scroll position start again), only when something was copied,
 * and the React `key` is not persisted, so no patient id reaches a storage key. A migration that copies before the table mounts
 * (a patient already selected on the first render) raises the revision before the table exists, so it costs no remount.
 *
 * Why a key and not a prop that makes a mounted `StyledTable` read its storage again: the key reuses the table's one read-at-mount path
 * for every setting, where a re-read prop would need a second path for each of the five, each with its own rule about what beats
 * what (saved values over the app's, initial state over state). It is the smaller change, and it cannot leave one setting stale.
 *
 * The number is per table (its `newKey`, or the first `to` of a raw pair when there is no `newKey`) and counts for the page's life,
 * so only a change of it means anything; do not compare it with a fixed number.
 *
 * **Several mounted instances that share one `newKey`** (the tables of sub-rows, each opened from its own row) **share the revision**:
 * a copy made for one raises it for all, so the others remount too, on their next render. That is harmless, and cheap, since a
 * remount only reads their storage again. **To combine the revision with a key the table already has**, put both in it:
 *
 * ```tsx
 * <StyledTable key={`${tab}-${revision}`} uniqueKey={tableKey} … />
 * ```
 *
 * **The page size.** A `StyledTable` saves its page size when it **changes** after mounting, never when it mounts. That includes a change
 * the app makes itself with `table.setPageSize()` after mount, which is saved as if the user had made it. 3.138.2 and 3.139.0 saved it
 * on mount, so a browser that ran them may already hold the table's default under the new key; pass `defaultPageSize` (the table's
 * `pageSize` prop, or `DEFAULT_TABLE_PAGE_SIZE` when it sets none) and the migration lets the old size replace that default, and counts it
 * as a copy, so the revision goes up and the table reads it. A new page size that is not the default is the user's and is kept.
 *
 * **What an app has to do:** its migration wrapper must **return** the revision, the table must use it in its `key`, and the app passes
 * `defaultPageSize`.
 */
export const useLegacyTableSettingsMigration = (migration: LegacyTableSettings): number => {
    const scope = legacyTableSettingsScope(migration)
    const table = tableOf(migration)

    useMemo(
        () => {
            if (migrateLegacyTableSettings(migration) > 0) revisions.set(table, (revisions.get(table) ?? 0) + 1)
        },
        // Only a new scope migrates again; `migration` and `table` are that render's.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [scope],
    )

    return revisions.get(table) ?? 0
}
