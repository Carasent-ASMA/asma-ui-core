import { describe, expect, it } from 'vitest'

import { notchedOutlineClass, outlineClass } from './field-styles'

const ERROR_FOCUS_SHADOW = 'shadow-[inset_0_0_0_2px_var(--colors-error-500)]'
const FOCUS_RING = 'border-focus-ring shadow-[inset_0_0_0_2px_var(--colors-focus-ring)]'

// ASMA-8561: precedence disabled → read-only → error(+focused) → focused → resting.
describe.each([
    ['outlineClass', outlineClass],
    ['notchedOutlineClass', notchedOutlineClass],
])('%s border states', (_name, borderClass) => {
    it('rests at 1px delta-500', () => {
        const classes = borderClass({})
        expect(classes).toContain('border-delta-500')
        expect(classes).not.toContain('shadow-[')
    })

    it('shows the 3px focus-ring edge on focus', () => {
        expect(borderClass({ focused: true })).toContain(FOCUS_RING)
    })

    it('keeps the 1px error border without focus', () => {
        const classes = borderClass({ error: true })
        expect(classes).toContain('border-error-500')
        expect(classes).not.toContain('shadow-[')
    })

    it('thickens the error border to 3px error-500 on focus', () => {
        const classes = borderClass({ error: true, focused: true })
        expect(classes).toContain('border-error-500')
        expect(classes).toContain(ERROR_FOCUS_SHADOW)
        expect(classes).not.toContain('border-focus-ring')
    })

    it('never shows the error-focus edge when disabled or read-only', () => {
        const disabled = borderClass({ error: true, focused: true, disabled: true })
        expect(disabled).toContain('border-delta-300')
        expect(disabled).not.toContain('shadow-[')

        const readOnly = borderClass({ error: true, focused: true, readOnly: true })
        expect(readOnly).toContain('border-delta-200')
        expect(readOnly).not.toContain('shadow-[')
    })
})

describe('outlineClass borderless (variant="standard")', () => {
    it('hides the border until focus', () => {
        expect(outlineClass({ borderless: true, error: true })).toContain('border-transparent')
    })

    it('paints the error-focus edge once focused', () => {
        expect(outlineClass({ borderless: true, error: true, focused: true })).toContain(ERROR_FOCUS_SHADOW)
    })
})
