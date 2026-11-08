import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StyledInputField } from './StyledInputField'

describe('StyledInputField helper-slot contract', () => {
    it('MUT-001: does not fall back to hardcoded Required when error has no message', () => {
        const html = renderToStaticMarkup(
            createElement(StyledInputField, { dataTest: 'f', error: true, label: 'Email' }),
        )
        expect(html).not.toContain('>Required<')
        expect(html).not.toContain('>Required</')
    })

    it('MUT-002: omits the empty helper slot by default (opt-in via reserveHelperText)', () => {
        const html = renderToStaticMarkup(
            createElement(StyledInputField, { dataTest: 'f', label: 'Email' }),
        )
        expect(html).not.toContain('role="status"')
        expect(html).not.toContain('role="alert"')
        expect(html).not.toContain('-helper-text')
    })

    it('MUT-002b: mounts the helper slot when reserveHelperText is true', () => {
        const html = renderToStaticMarkup(
            createElement(StyledInputField, { dataTest: 'f', label: 'Email', reserveHelperText: true }),
        )
        expect(html).toContain('role="status"')
        expect(html).toContain('min-h-[24px]')
        expect(html).toContain('-helper-text')
    })

    it('MUT-003: error appearance uses role=alert', () => {
        const html = renderToStaticMarkup(
            createElement(StyledInputField, {
                dataTest: 'f',
                error: true,
                helperText: 'Bad email',
                label: 'Email',
            }),
        )
        expect(html).toContain('role="alert"')
        expect(html).toContain('Bad email')
        expect(html).toContain('aria-invalid="true"')
    })

    it('MUT-019: hint and error states share the same layout classes, so the row cannot resize', () => {
        const layoutClasses = (html: string) => {
            const slotTag = /<div[^>]*id="[^"]*-helper-text"[^>]*>/.exec(html)?.[0] ?? ''
            const cls = /class="([^"]*)"/.exec(slotTag)?.[1] ?? ''
            const tokens = cls.split(/\s+/)
            return ['flex', 'items-start', 'gap-1', 'min-h-[24px]', 'pt-1', 'box-border'].filter((c) =>
                tokens.includes(c),
            )
        }

        const hint = renderToStaticMarkup(
            createElement(StyledInputField, { dataTest: 'f', helperText: 'Ex: +47 12 34 56 78', label: 'Phone' }),
        )
        const errored = renderToStaticMarkup(
            createElement(StyledInputField, {
                dataTest: 'f',
                error: true,
                helperText: 'Invalid phone — Ex: +47 12 34 56 78',
                label: 'Phone',
            }),
        )

        expect(layoutClasses(hint)).toEqual(layoutClasses(errored))
        expect(layoutClasses(hint)).toContain('flex')
        expect(layoutClasses(hint)).toContain('min-h-[24px]')
    })

    describe('ASMA-8777: helper area with a character counter', () => {
        const render = (props: Record<string, unknown>) =>
            renderToStaticMarkup(createElement(StyledInputField, { dataTest: 'f', label: 'Name', maxLength: 100, ...props }))

        it.each([
            ['reserveHelperText', { reserveHelperText: true }],
            ['a blank helperText', { helperText: ' ' }],
            ['an empty helperText', { helperText: '' }],
        ])('puts the counter directly under the input with %s', (_, props) => {
            const html = render(props)
            expect(html).not.toContain('-helper-text')
            expect(html).toContain('0 of 100 characters')
            expect(html).toMatch(/aria-describedby="[^" ]*-counter"/)
        })

        it('shows the helper text above the counter', () => {
            const html = render({ helperText: 'Visible to the client', reserveHelperText: true })
            expect(html).toContain('-helper-text')
            expect(html.indexOf('Visible to the client')).toBeLessThan(html.indexOf('0 of 100 characters'))
        })

        it('shows the error above the counter even with a blank message', () => {
            const html = render({ error: true, helperText: ' ', reserveHelperText: true })
            expect(html).toContain('role="alert"')
            expect(html.indexOf('-helper-text')).toBeLessThan(html.indexOf('0 of 100 characters'))
        })

        it('still reserves one line when there is no counter', () => {
            const html = render({ maxLength: undefined, reserveHelperText: true })
            expect(html).toContain('-helper-text')
            expect(html).not.toContain('characters')
        })
    })

    it('default (no reserveHelperText) omits the empty helper slot', () => {
        const html = renderToStaticMarkup(
            createElement(StyledInputField, {
                dataTest: 'f',
                label: 'Email',
            }),
        )
        expect(html).not.toContain('role="status"')
        expect(html).not.toContain('role="alert"')
    })
})
