/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { focusFormField } from './focusFormField'

describe('focusFormField (REQ-010)', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
        Element.prototype.scrollIntoView = vi.fn()
    })

    it('focuses and reveals a field found by id', () => {
        document.body.innerHTML = `<input id="some-field" />`
        const input = document.getElementById('some-field') as HTMLInputElement

        expect(focusFormField('some-field')).toBe(true)
        expect(document.activeElement).toBe(input)
        expect(input.scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'center' })
    })

    it('falls back to data-testid when no element carries the id (StyledSelect trigger)', () => {
        document.body.innerHTML = `<button data-testid="employee-role-select"></button>`
        const trigger = document.querySelector('button')

        expect(focusFormField('employee-role-select')).toBe(true)
        expect(document.activeElement).toBe(trigger)
    })

    it('prefers a real id over a same-named data-testid', () => {
        document.body.innerHTML = `
            <button data-testid="dup"></button>
            <input id="dup" />
        `
        expect(focusFormField('dup')).toBe(true)
        expect(document.activeElement!.tagName).toBe('INPUT')
    })

    it('reports false when the field is not in the DOM, so callers can retry', () => {
        expect(focusFormField('missing-field')).toBe(false)
    })

    it('does not report success for a testid that exists on no element', () => {
        document.body.innerHTML = `<input data-testid="group-features-autocomplete-input-field" />`

        expect(focusFormField('group-features-autocomplete')).toBe(false)
        expect(focusFormField('group-features-autocomplete-input-field')).toBe(true)
    })

    it('focuses the contenteditable inside a wrapper that carries the id', () => {
        document.body.innerHTML = `
            <div id="privacy-policy-norsk-editor">
                <div class="ProseMirror" contenteditable="true"></div>
            </div>
        `

        expect(focusFormField('privacy-policy-norsk-editor')).toBe(true)
        expect(document.activeElement!.className).toBe('ProseMirror')    })

    it('still scrolls the matched wrapper, not just the focused descendant', () => {
        document.body.innerHTML = `
            <div id="wrapper"><textarea></textarea></div>
        `
        const wrapper = document.getElementById('wrapper')!

        expect(focusFormField('wrapper')).toBe(true)
        expect(document.activeElement?.tagName).toBe('TEXTAREA')
        expect(wrapper.scrollIntoView).toHaveBeenCalled()
    })
})
