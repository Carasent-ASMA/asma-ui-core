import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StyledInputField } from './StyledInputField'

const GRADIENT = 'bg-[linear-gradient(to_bottom,transparent_50%,var(--colors-delta-50)_50%)]'

const render = (readOnly: boolean) =>
    renderToStaticMarkup(
        createElement(StyledInputField, { dataTest: 'f', label: 'SMS 1', labelPlacement: 'floating', value: 'Hi', readOnly }),
    )

const classOf = (html: string, tag: 'label' | 'legend') => new RegExp(`<${tag}[^>]*class="([^"]*)"`).exec(html)?.[1] ?? ''

describe('StyledInputField floating label on a read-only field', () => {
    it('lets the grey fill run under the label and the notch instead of a white box (ASMA-8782)', () => {
        const html = render(true)
        expect(classOf(html, 'label')).toContain(GRADIENT)
        expect(classOf(html, 'label')).not.toContain('bg-white')
        expect(classOf(html, 'legend')).toContain(GRADIENT)
    })

    it('keeps the white label and notch on an editable field', () => {
        const html = render(false)
        expect(classOf(html, 'label')).toContain('bg-white')
        expect(classOf(html, 'legend')).toContain('bg-white')
    })
})
