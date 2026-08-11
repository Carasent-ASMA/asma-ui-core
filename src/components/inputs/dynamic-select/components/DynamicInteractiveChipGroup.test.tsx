import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DynamicInteractiveChipGroup } from './DynamicInteractiveChipGroup'

const baseProps = {
    dataTest: 'chips',
    options: ['a', 'b'],
    value: null,
    multiple: false as const,
    onChange: () => {},
}

// The "Clear selection" button only renders when a value is set and the field isn't required.
const withSelection = { ...baseProps, value: 'a' }

describe('DynamicInteractiveChipGroup', () => {
    it('defaults the clear-selection label to the locale-based EN/NB text', () => {
        const html = renderToStaticMarkup(createElement(DynamicInteractiveChipGroup, withSelection))
        expect(html).toContain('Clear selection')
    })

    it('honours an explicit clearSelectionLabel override (additive escape hatch)', () => {
        const html = renderToStaticMarkup(
            createElement(DynamicInteractiveChipGroup, { ...withSelection, clearSelectionLabel: 'Reset' }),
        )
        expect(html).toContain('Reset')
        expect(html).not.toContain('Clear selection')
    })

    it('MUT-003 parity: error appearance uses role=alert', () => {
        const html = renderToStaticMarkup(
            createElement(DynamicInteractiveChipGroup, { ...baseProps, error: true, helperText: 'Pick one' }),
        )
        expect(html).toContain('role="alert"')
        expect(html).toContain('Pick one')
    })
})
