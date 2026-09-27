import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DynamicSelectAutocomplete } from './DynamicSelectAutocomplete'

describe('DynamicSelectAutocomplete', () => {
    it('keeps selected-tag delete buttons out of sequential keyboard navigation', () => {
        const html = renderToStaticMarkup(
            <DynamicSelectAutocomplete
                dataTest='dynamic-select'
                multiple
                options={['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot']}
                value={['Alpha', 'Bravo']}
                maxTags={1}
                onChange={() => undefined}
            />,
        )

        expect(html).toContain('data-testid="Alpha-chip-delete"')
        expect(html).toContain('tabindex="-1"')
        expect(html).toMatch(/data-testid="remaining-count-tag-chip"[^>]*tabindex="-1"/)
    })
})
