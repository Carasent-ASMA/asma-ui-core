import type { ReactElement } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { StyledDatePicker } from 'src/datetime/components/date-picker'
import { StyledInputField } from './input-field'
import { StyledSelect, StyledSelectItem } from './select'
import { StyledSelectAutocomplete } from './select-autocomplete'
import { StyledTextarea } from './textarea'

/**
 * Error + focused edge — ASMA-8561 REQ-001..003, REQ-012.
 * A focused field in error shows 1px error-500 border + 2px inset error-500 (3px, layout-neutral);
 * once valid while focused it shows the normal focus-ring edge; without focus it stays 1px.
 * `border-color` goes through `transition-colors`, so it is read inside `waitFor`.
 */

const insetEdge = (token: string): string => `${resolveTokenColor(token)} 0px 0px 0px 2px inset`
const ERROR_EDGE = (): string => insetEdge('--colors-error-500')
const FOCUS_EDGE = (): string => insetEdge('--colors-focus-ring')

/** The `notchedOutlineClass` overlay of a `StyledInputField` (a `fieldset` or `div`, last in the 40px shell). */
const inputOutline = (container: HTMLElement): Element =>
    container.querySelector('[data-testid$="-shell"] > .pointer-events-none.border-solid')!

/** `edge` = the inset shadow layer, or `'none'`. Tailwind prepends transparent ring layers, so match by inclusion. */
const expectEdge = async (outline: Element, edge: string, borderToken: string): Promise<void> => {
    await waitFor(() => {
        const { boxShadow } = getComputedStyle(outline)
        if (edge === 'none' ? boxShadow !== 'none' : !boxShadow.includes(edge))
            throw new Error(`box-shadow is "${boxShadow}", expected ${edge}`)
    })
    // Resolved outside `waitFor`: the probe element would re-trigger its MutationObserver on every retry.
    const borderColor = resolveTokenColor(borderToken)
    await waitFor(() => expect(getComputedStyle(outline).borderColor).toBe(borderColor))
    // Layout-neutral: the border box never thickens (CON-002).
    await expect(getComputedStyle(outline).borderTopWidth).toBe('1px')
}

describe('field error + focused edge (ASMA-8561)', () => {
    afterEach(cleanup)

    it('StyledInputField: error edge on focus, focus ring once valid, 1px on blur', async () => {
        const field = (error: boolean): ReactElement => (
            <StyledInputField dataTest='name' label='Name' value='x' error={error} helperText='Required' />
        )
        const { container, rerender } = mount(field(true))
        const input = container.querySelector<HTMLInputElement>('input')!
        const outline = inputOutline(container)

        await expectEdge(outline, 'none', '--colors-error-500')

        input.focus()
        await expectEdge(outline, ERROR_EDGE(), '--colors-error-500')

        rerender(field(false))
        await expect(input).toHaveFocus()
        await expectEdge(outline, FOCUS_EDGE(), '--colors-focus-ring')

        rerender(field(true))
        input.blur()
        await expectEdge(outline, 'none', '--colors-error-500')
    })

    it('StyledSelect: error edge on focus and while open, 1px on blur', async () => {
        const select = (error: boolean): ReactElement => (
            <>
                <StyledSelect dataTest='status' name='Status' value='a' error={error} onChange={() => undefined}>
                    <StyledSelectItem value='a'>Active</StyledSelectItem>
                    <StyledSelectItem value='b'>Paused</StyledSelectItem>
                </StyledSelect>
                <button type='button'>After</button>
            </>
        )
        const { container, rerender } = mount(select(true))
        const trigger = container.querySelector<HTMLElement>('[role="combobox"]')!
        const outline = trigger.lastElementChild!

        await expectEdge(outline, 'none', '--colors-error-500')

        trigger.focus()
        await expectEdge(outline, ERROR_EDGE(), '--colors-error-500')

        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
        await expectEdge(outline, ERROR_EDGE(), '--colors-error-500')
        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))

        rerender(select(false))
        await expectEdge(outline, FOCUS_EDGE(), '--colors-focus-ring')

        rerender(select(true))
        trigger.blur()
        await expectEdge(outline, 'none', '--colors-error-500')
    })

    it('StyledSelectAutocomplete: inherits the error edge from StyledInputField', async () => {
        const { container } = mount(
            <StyledSelectAutocomplete
                dataTest='team'
                options={['Alpha', 'Beta']}
                value={null}
                error
                onChange={() => undefined}
                renderInput={(params) => <StyledInputField {...params} dataTest='team-input' label='Team' />}
            />,
        )
        const input = container.querySelector<HTMLInputElement>('input')!

        input.focus()
        await expectEdge(inputOutline(container), ERROR_EDGE(), '--colors-error-500')
    })

    it('StyledDatePicker: inherits the error edge from StyledInputField', async () => {
        const { container } = mount(
            <StyledDatePicker
                dataTest='due'
                mode='single'
                label='Due date'
                selected={undefined}
                onSelect={() => undefined}
                error
                errorText='Required'
            />,
        )
        const input = container.querySelector<HTMLInputElement>('input[data-testid="due"]')!

        input.focus()
        await expectEdge(inputOutline(container), ERROR_EDGE(), '--colors-error-500')
    })

    it('StyledTextarea: error is 1px at rest and 3px error-500 inside the box on focus', async () => {
        const { container } = mount(
            <StyledTextarea dataTest='notes' label='Notes' value='abc' error errorMessage='Too short' onChange={() => undefined} />,
        )
        const textarea = container.querySelector<HTMLTextAreaElement>('textarea')!

        await expect(getComputedStyle(textarea).outlineWidth).toBe('1px')

        textarea.focus()
        await waitFor(() => expect(getComputedStyle(textarea).outlineWidth).toBe('3px'))
        await expect(getComputedStyle(textarea).outlineColor).toBe(resolveTokenColor('--colors-error-500'))
        await expect(getComputedStyle(textarea).outlineOffset).toBe('-3px')
    })
})
