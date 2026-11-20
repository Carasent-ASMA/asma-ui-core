import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StyledEmptyValue } from './StyledEmptyValue'

describe('StyledEmptyValue', () => {
    it('hides the em dash from screen readers and gives them words instead', () => {
        expect(renderToStaticMarkup(<StyledEmptyValue />)).toBe(
            '<span aria-hidden="true">—</span><span class="sr-only">Not provided</span>',
        )
    })

    it('says "Ikke oppgitt" in Norwegian', () => {
        expect(renderToStaticMarkup(<StyledEmptyValue locale='no' />)).toContain(
            '<span class="sr-only">Ikke oppgitt</span>',
        )
    })

    it('reads the label it is given', () => {
        expect(renderToStaticMarkup(<StyledEmptyValue locale='no' label='Ubesvart' />)).toContain(
            '<span class="sr-only">Ubesvart</span>',
        )
    })
})
