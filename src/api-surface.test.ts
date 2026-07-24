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
})
