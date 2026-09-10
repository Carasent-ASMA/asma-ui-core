import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { StyledInputField } from 'src/components/inputs/input-field'
import { StyledSelectAutocomplete } from 'src/components/inputs/select-autocomplete'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { StyledDatePicker } from 'src/datetime/components/date-picker/StyledDatePicker'
import { cleanup, isEntirelyObscured, mount } from 'src/test-utils/renderInteraction'
import { StyledSelect } from './StyledSelect'
import { StyledSelectItem } from './StyledSelectItem'

/**
 * SC 2.4.11 Focus Not Obscured (Minimum) — AA, WCAG 2.2. (ASMA-8139)
 *
 * Distinct from the 2.4.7 assertions elsewhere in this suite: those ask whether a focus indicator
 * is *painted*, this asks whether the focused control is *visible at all* once the component's own
 * overlay is on screen. A control can have a perfect focus ring and still fail this criterion by
 * being covered by the very popup it opened.
 *
 * Two notes on scope. The usual 2.4.11 failure — a focused control scrolled under an app's sticky
 * header — is not something a component library can be responsible for; what IS in scope is a
 * library overlay covering its own trigger. And this is currently ungated everywhere else: axe has
 * no rule for it, and VRT cannot see it because a baseline records the obscured state as correct.
 *
 * Relevant to ASMA-8080, which deliberately attached the Select popover flush to the field (the
 * `offset(0)` middleware). Flush is one pixel away from overlapping, so this is worth pinning.
 */

const SelectFixture = (): JSX.Element => {
    const [value, setValue] = useState<unknown>('b')
    return (
        <StyledSelect dataTest='status' name='Status' value={value} onChange={(e) => setValue(e.target.value)}>
            <StyledSelectItem value='a'>Active</StyledSelectItem>
            <StyledSelectItem value='b'>Paused</StyledSelectItem>
            <StyledSelectItem value='c'>Closed</StyledSelectItem>
        </StyledSelect>
    )
}

describe('Focus Not Obscured — overlays must not cover their own trigger (2.4.11)', () => {
    afterEach(cleanup)

    it('StyledSelect: the open listbox does not hide the combobox trigger', async () => {
        const { container } = mount(<SelectFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="status"]')!

        trigger.focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())

        await expect(isEntirelyObscured(trigger), 'the Select listbox entirely covers its own trigger').toBe(false)
    })

    it('StyledSelect: the trigger is visible again once focus returns to it on Escape', async () => {
        const { container } = mount(<SelectFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="status"]')!

        trigger.focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())
        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).toBeNull())

        await expect(document.activeElement).toBe(trigger)
        await expect(isEntirelyObscured(trigger)).toBe(false)
    })

    it('StyledSelectAutocomplete: the open listbox does not hide the focused input', async () => {
        mount(
            <StyledSelectAutocomplete<string, false, false, false>
                dataTest='ac'
                options={['Alpha', 'Bravo', 'Charlie']}
                renderInput={(params) => <StyledInputField {...params} dataTest='ac-input' label='Team' />}
            />,
        )
        const input = document.querySelector<HTMLInputElement>('input[role="combobox"]')!

        input.focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('ul[role="listbox"]')).not.toBeNull())

        // Focus genuinely stays on the input here (the aria-activedescendant pattern), so the
        // criterion applies to the input itself rather than to an option.
        await expect(document.activeElement).toBe(input)
        await expect(isEntirelyObscured(input), 'the autocomplete popup entirely covers its own input').toBe(false)
    })

    it('StyledDatePicker: the open calendar does not hide the button that opened it', async () => {
        const { container } = mount(
            <StyledDatePicker dataTest='d' mode='single' label='Date' onSelect={() => undefined} />,
        )
        const button = container.querySelector<HTMLButtonElement>('button[aria-label="Open calendar"]')!

        button.focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(document.querySelector('table, [role="grid"], .rdp')).not.toBeNull())

        await expect(isEntirelyObscured(button), 'the calendar entirely covers the button that opened it').toBe(false)
    })

    it('StyledTooltip: the bubble does not hide the control it describes', async () => {
        const { container } = mount(
            <StyledTooltip title='Archive this thread'>
                <StyledButton dataTest='tip-target'>Archive</StyledButton>
            </StyledTooltip>,
        )
        const target = container.querySelector<HTMLButtonElement>('[data-testid="tip-target"]')!

        await userEvent.tab()
        await waitFor(() => expect(document.querySelector('[role="tooltip"]')).not.toBeNull())

        await expect(document.activeElement).toBe(target)
        await expect(isEntirelyObscured(target), 'the tooltip entirely covers the control it describes').toBe(false)
    })

    it('the check itself detects a genuinely covered control', async () => {
        // Guards the assertion above from rotting into a tautology: if `isEntirelyObscured` ever
        // returned false unconditionally, every test in this file would pass while measuring nothing.
        const { container } = mount(<StyledButton dataTest='covered'>Hidden</StyledButton>)
        const button = container.querySelector<HTMLButtonElement>('[data-testid="covered"]')!
        await expect(isEntirelyObscured(button)).toBe(false)

        const rect = button.getBoundingClientRect()
        const cover = document.createElement('div')
        Object.assign(cover.style, {
            position: 'fixed',
            left: `${rect.left - 4}px`,
            top: `${rect.top - 4}px`,
            width: `${rect.width + 8}px`,
            height: `${rect.height + 8}px`,
            background: 'red',
            zIndex: '9999',
        })
        document.body.appendChild(cover)

        await expect(isEntirelyObscured(button)).toBe(true)

        cover.remove()
    })
})
