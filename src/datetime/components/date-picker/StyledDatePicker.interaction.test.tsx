import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledDatePicker } from './StyledDatePicker'

/**
 * Keyboard & focus contract — StyledDatePicker (ASMA-8139).
 * WCAG 2.1.1, 2.1.2, 2.4.3, 4.1.2.
 *
 * The typed-entry path is the one that matters most here: the field is driven by an imperative
 * input mask, so keyboard entry is genuinely custom code rather than a plain controlled input, and
 * it is the ONLY way a keyboard user can set a date if the calendar itself is hard to operate.
 */

const DatePickerFixture = ({ onPick = () => undefined }: { onPick?: (date?: Date) => void }): JSX.Element => {
    const [date, setDate] = useState<Date>()
    return (
        <StyledDatePicker
            dataTest='kbd-date'
            mode='single'
            selected={date}
            onSelect={setDate}
            onInputChange={(next) => {
                setDate(next)
                onPick(next)
            }}
            label='Date'
        />
    )
}

const field = (container: HTMLElement): HTMLInputElement =>
    container.querySelector<HTMLInputElement>('input[data-testid="kbd-date"]')!
/* The datetime StyledButton emits `data-test`, not the `data-testid` the rest of ui-core uses, so
 * query the trigger the way a user finds it — by its accessible name. */
const calendarButton = (container: HTMLElement): HTMLButtonElement =>
    container.querySelector<HTMLButtonElement>('button[aria-label="Open calendar"]')!
const calendar = (): HTMLElement | null => document.querySelector<HTMLElement>('.rdp, [role="grid"], table')

describe('StyledDatePicker keyboard contract', () => {
    afterEach(cleanup)

    it('exposes a named text field (4.1.2)', async () => {
        const { container } = mount(<DatePickerFixture />)

        await expect(field(container)).toHaveAccessibleName('Date')
        await expect(calendarButton(container)).toHaveAccessibleName('Open calendar')
    })

    it('is reachable by Tab: field first, then the calendar button (2.4.3)', async () => {
        const { container } = mount(<DatePickerFixture />)

        await userEvent.tab()
        await expect(document.activeElement).toBe(field(container))

        await userEvent.tab()
        await expect(document.activeElement).toBe(calendarButton(container))
    })

    it('parses a fully typed date and commits it on blur (2.1.1)', async () => {
        const onPick = fn()
        const { container } = mount(<DatePickerFixture onPick={onPick} />)
        const input = field(container)

        input.focus()
        await userEvent.keyboard('15062024')
        await waitFor(() => expect(input).toHaveValue('15/06/2024'))

        await userEvent.tab()

        // The typed value must survive blur + re-render (the mask writes imperatively, so a
        // desynced React value tracker silently clears it — the ASMA-7773 class of bug).
        await waitFor(() => expect(input).toHaveValue('15/06/2024'))
        await waitFor(() => expect(onPick).toHaveBeenCalled())
        const parsed = onPick.mock.calls.at(-1)?.[0] as Date
        await expect(parsed.getFullYear()).toBe(2024)
        await expect(parsed.getMonth()).toBe(5)
        await expect(parsed.getDate()).toBe(15)
    })

    it('reports an incomplete date as invalid rather than guessing (3.3.1, 4.1.2)', async () => {
        const { container } = mount(<DatePickerFixture />)
        const input = field(container)

        input.focus()
        await userEvent.keyboard('1506')
        await userEvent.tab()

        await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))
    })

    it('clears back to empty when the typed date is deleted (2.1.1)', async () => {
        const onPick = fn()
        const { container } = mount(<DatePickerFixture onPick={onPick} />)
        const input = field(container)

        input.focus()
        await userEvent.keyboard('15062024')
        await waitFor(() => expect(input).toHaveValue('15/06/2024'))
        await userEvent.tab()
        await waitFor(() => expect(onPick).toHaveBeenCalled())

        input.focus()
        await userEvent.keyboard(
            '{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}',
        )
        await userEvent.tab()

        await waitFor(() => expect(onPick).toHaveBeenLastCalledWith(undefined))
    })

    it('opens the calendar from the calendar button by keyboard (2.1.1)', async () => {
        const { container } = mount(<DatePickerFixture />)
        calendarButton(container).focus()

        await userEvent.keyboard('{Enter}')

        await waitFor(() => expect(calendar()).not.toBeNull())
    })

    it('closes the calendar on Escape — no keyboard trap (2.1.2, 1.4.13)', async () => {
        const { container } = mount(<DatePickerFixture />)
        calendarButton(container).focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(calendar()).not.toBeNull())

        await userEvent.keyboard('{Escape}')

        await waitFor(() => expect(calendar()).toBeNull())
    })

    it('takes a read-only picker out of the calendar path but keeps it announced (4.1.2)', async () => {
        const { container } = mount(
            <StyledDatePicker dataTest='ro-date' mode='single' readOnly label='Date' onSelect={() => undefined} />,
        )

        // Read-only keeps the value announced to AT but offers no calendar trigger to focus.
        await expect(container.querySelector('input')).toHaveAttribute('readonly')
        await expect(container.querySelector('button[aria-label="Open calendar"]')).toBeNull()
    })
})
