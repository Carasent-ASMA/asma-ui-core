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
