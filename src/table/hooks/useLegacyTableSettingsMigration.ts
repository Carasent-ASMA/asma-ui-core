import { useMemo } from 'react'
import {
    legacyTableSettingsScope,
    migrateLegacyTableSettings,
    type LegacyTableSettings,
} from '../helpers/migrateLegacyTableSettings'

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
 * ```tsx
 * useLegacyTableSettingsMigration({ newKey: tableKey, oldKeys: patientId ? [oldKeyFor(patientId)] : undefined })
 * <StyledTable uniqueKey={tableKey} … />
 * ```
 */
export const useLegacyTableSettingsMigration = (migration: LegacyTableSettings): void => {
    const scope = legacyTableSettingsScope(migration)

    useMemo(
        () => migrateLegacyTableSettings(migration),
        // Only a new scope migrates again; `migration` is that render's.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [scope],
    )
}
