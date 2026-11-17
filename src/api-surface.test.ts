import { describe, expect, it } from 'vitest'
import * as coreApi from './index'

/**
 * Frozen export contract (ASMA-7573 / DEC-003): the MUI removal must not add, remove, or rename a
 * single runtime export of the package barrel. If this snapshot changes, the change is a breaking
 * API event and must be an explicit, reviewed decision — never a side effect of a migration.
 * Type-only exports are not visible here; `tsc` plus consumer builds guard those.
 *
 * @see asma-modules/_docs/frontend/plans/2026-07-10-19-12-plan-asma-ui-core-mui-removal.md:29 — DEC-003
 */
describe('asma-ui-core public API surface', () => {
    it('keeps every runtime export of the package barrel stable', () => {
        expect(Object.keys(coreApi).sort()).toMatchSnapshot()
    })

    /**
     * ASMA-8698: the entries a table saves under its `uniqueKey`, for an app that has to clean up or inventory them itself (a
     * delete-only cleanup, a test) without keeping its own copy of the list. `migrateLegacyTableSettings` copies exactly these.
     */
    it('exports the suffixes of the entries a table saves, from the package entry', () => {
        expect(coreApi.TABLE_SETTINGS_SUFFIXES).toEqual([':sorting', ':column-sizing', ':page-size', ':column-order', ':column-visibility'])
    })

    /**
     * ASMA-8698: the page size a table opens with when it is given none, for an app that passes it as `defaultPageSize` to the
     * migration (a table that sets its own `pageSize` passes that one).
     */
    it('exports the default page size, from the package entry', () => {
        expect(coreApi.DEFAULT_TABLE_PAGE_SIZE).toBe(50)
    })
})

