import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DynamicInteractiveChipGroup } from './DynamicInteractiveChipGroup'

const baseProps = {
    dataTest: 'chips',
    options: ['a', 'b'],
    value: null,
    multiple: false as const,
    onChange: () => undefined,
}

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

    /*
     * The row used to render unconditionally, so a chip group with nothing to say still parked 28px
     * of empty space under the chips — visible as a gap between a chip row and whatever followed it.
     * `disableHelperText` was declared on the public props but only ever read by the autocomplete.
     */
    describe('disableHelperText', () => {
        const helperRow = /role="(alert|status)"/

        it('reserves the helper row by default, so existing layouts are unchanged', () => {
            const html = renderToStaticMarkup(createElement(DynamicInteractiveChipGroup, baseProps))
            expect(html).toMatch(helperRow)
        })

        it('drops the reserved row when asked', () => {
            const html = renderToStaticMarkup(
                createElement(DynamicInteractiveChipGroup, { ...baseProps, disableHelperText: true }),
            )
            expect(html).not.toMatch(helperRow)
        })

        it('still shows a real helper message, which grows the layout instead of filling a reservation', () => {
            const html = renderToStaticMarkup(
                createElement(DynamicInteractiveChipGroup, {
                    ...baseProps,
                    disableHelperText: true,
                    helperText: 'Applies to the whole schedule',
                }),
            )
            expect(html).toContain('Applies to the whole schedule')
        })

        it('still shows an error, which must never be swallowed by opting out of the reservation', () => {
            const html = renderToStaticMarkup(
                createElement(DynamicInteractiveChipGroup, {
                    ...baseProps,
                    disableHelperText: true,
                    error: true,
                    helperText: 'Pick one',
                }),
            )
            expect(html).toContain('role="alert"')
            expect(html).toContain('Pick one')
        })
    })

    describe('group semantics (SH-P04)', () => {
        const attr = (html: string, name: string): string | undefined =>
            new RegExp(`role="group"[^>]*\\s${name}="([^"]*)"`).exec(html)?.[1] ??
            new RegExp(`\\s${name}="([^"]*)"[^>]*role="group"`).exec(html)?.[1]

        it('names the group by its title', () => {
            const html = renderToStaticMarkup(
                createElement(DynamicInteractiveChipGroup, { ...baseProps, title: 'Shift' }),
            )
            const titleId = attr(html, 'aria-labelledby')
            expect(titleId).toBeTruthy()
            expect(html).toMatch(new RegExp(`id="${titleId}"[^>]*>Shift<`))
        })

        it('marks the group invalid and describes it by the error message', () => {
            const html = renderToStaticMarkup(
                createElement(DynamicInteractiveChipGroup, { ...baseProps, error: true, helperText: 'Pick one' }),
            )
            const helperId = attr(html, 'aria-describedby')
            expect(attr(html, 'aria-invalid')).toBe('true')
            expect(html).toMatch(new RegExp(`id="${helperId}" role="alert"`))
        })

        it('is not invalid without an error, and describes nothing when the helper row is gone', () => {
            const html = renderToStaticMarkup(
                createElement(DynamicInteractiveChipGroup, { ...baseProps, disableHelperText: true }),
            )
            expect(html).toContain('role="group"')
            expect(attr(html, 'aria-invalid')).toBeUndefined()
            expect(attr(html, 'aria-describedby')).toBeUndefined()
            expect(attr(html, 'aria-labelledby')).toBeUndefined()
        })
    })
})
