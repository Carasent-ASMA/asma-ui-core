import { useState, type ReactElement, type ReactNode } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledInputField } from './input-field'
import { StyledTextarea } from './textarea'

/**
 * ASMA-9033: an auto-growing field taller than the screen must not move the page while the user types.
 * Measuring drops the field to `height: auto`; if the page shrinks with it, the browser clamps the scroll
 * position and the caret jumps from mid-screen to the screen edge on the first keystroke.
 */

const SCROLLER_HEIGHT = 400
const CARET_LINE = 75
const LONG_TEXT = Array.from({ length: 150 }, (_, i) => `Line ${i + 1}`).join('\n')

/** A scrolling page area: the tall field and a short block after it, like a journal question. */
const Scroller = ({ children }: { children: ReactNode }): ReactElement => (
    <div data-testid='scroller' style={{ height: SCROLLER_HEIGHT, overflow: 'auto', width: 640 }}>
        {children}
        <div style={{ height: 40 }}>Next question</div>
    </div>
)

const ControlledInputField = (): ReactElement => {
    const [value, setValue] = useState(LONG_TEXT)
    return (
        <StyledInputField
            dataTest='field'
            label='Notes'
            multiline
            minRows={2}
            value={value}
            onChange={(event) => setValue(event.target.value)}
        />
    )
}

const ControlledTextarea = (): ReactElement => {
    const [value, setValue] = useState(LONG_TEXT)
    return (
        <StyledTextarea
            dataTest='field'
            label='Notes'
            value={value}
            onChange={(event) => setValue(event.target.value)}
        />
    )
}

/** Puts the caret at the end of `CARET_LINE` and scrolls so that line sits in the middle of the scroller. */
const centreCaret = (container: HTMLElement): { scroller: HTMLElement; textarea: HTMLTextAreaElement } => {
    const scroller = container.querySelector<HTMLElement>('[data-testid="scroller"]')!
    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')!
    if (textarea.clientHeight < SCROLLER_HEIGHT * 2)
        throw new Error('needs real layout (browser mode) and a tall field')

    const caret = LONG_TEXT.indexOf(`Line ${CARET_LINE}`) + `Line ${CARET_LINE}`.length
    textarea.focus({ preventScroll: true })
    textarea.setSelectionRange(caret, caret)

    const style = getComputedStyle(textarea)
    const fieldTop = textarea.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
    const lineTop =
        fieldTop + Number.parseFloat(style.paddingTop) + (CARET_LINE - 1) * Number.parseFloat(style.lineHeight)
    scroller.scrollTop = lineTop - SCROLLER_HEIGHT / 2
    return { scroller, textarea }
}

describe('Auto-growing multiline fields keep the page still while typing (ASMA-9033)', () => {
    afterEach(cleanup)

    it.each([
        ['StyledInputField, controlled', <ControlledInputField key='controlled' />],
        [
            'StyledInputField, uncontrolled',
            <StyledInputField
                key='uncontrolled'
                dataTest='field'
                label='Notes'
                multiline
                minRows={2}
                defaultValue={LONG_TEXT}
            />,
        ],
        ['StyledTextarea', <ControlledTextarea key='textarea' />],
    ])('%s: a visible caret does not jump to the screen edge', async (_name, field) => {
        const { container } = mount(<Scroller>{field}</Scroller>)
        const { scroller, textarea } = centreCaret(container)
        const before = scroller.scrollTop
        await expect(before).toBeGreaterThan(0)

        await userEvent.keyboard('abc')

        await expect(textarea.value).toContain(`Line ${CARET_LINE}abc`)
        await expect(scroller.scrollTop).toBe(before)
    })
})
