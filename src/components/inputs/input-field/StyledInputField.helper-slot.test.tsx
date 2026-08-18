import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StyledInputField } from './StyledInputField'

/**
 * ASMA-7729 helper-slot contract — node-side assertions that kill MUT-001..003 without Playwright.
 * Browser Storybook plays remain the visual/CLS gate when chromium is available.
 */
describe('StyledInputField helper-slot contract', () => {
    it('MUT-001: does not fall back to hardcoded Required when error has no message', () => {
        const html = renderToStaticMarkup(
            createElement(StyledInputField, { dataTest: 'f', error: true, label: 'Email' }),
        )
        expect(html).not.toContain('>Required<')
        expect(html).not.toContain('>Required</')
    })

    it('MUT-002: always mounts the helper slot when reserveHelperText defaults to true', () => {
        const html = renderToStaticMarkup(
            createElement(StyledInputField, { dataTest: 'f', label: 'Email' }),
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

    /**
     * The slot only prevents layout shift if both states occupy the same box. The error branch used
     * to be the only one that got `flex`, which made the row 4px *shorter* with an error than with a
     * hint — everything below the field nudged up on error and back down on recovery.
     */
    it('MUT-019: hint and error states share the same layout classes, so the row cannot resize', () => {
        // Read the helper row's own class attribute; anchoring anywhere inside it would silently
        // drop the classes that precede the anchor.
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

    it('reserveHelperText=false omits the empty helper slot', () => {
        const html = renderToStaticMarkup(
            createElement(StyledInputField, {
                dataTest: 'f',
                label: 'Email',
                reserveHelperText: false,
            }),
        )
        expect(html).not.toContain('role="status"')
        expect(html).not.toContain('role="alert"')
    })
})
