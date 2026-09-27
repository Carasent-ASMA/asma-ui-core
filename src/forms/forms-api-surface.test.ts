import { describe, expect, it } from 'vitest'

/**
 * Frozen export contract for the forms subpath: adding, removing or renaming a runtime export is
 * a breaking change for every app binding (src/forms/index.ts in nine apps) and must be an
 * explicit, reviewed decision.
 */
describe('asma-ui-core/forms public API surface', () => {
    it('keeps every runtime export of the subpath stable', async () => {
        const formsApi = await import('./index')

        expect(Object.keys(formsApi).sort()).toMatchSnapshot()
    })
})
