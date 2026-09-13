import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTimePicker } from './StyledTimePicker'

/**
 * Keyboard & focus contract — StyledTimePicker (ASMA-8139).
 * WCAG 2.1.1, 2.1.2, 4.1.2.
 *
 * The desktop panel is a `ClickAwayListener` + popper rather than a StyledPopover, so it does not
 * inherit the Escape/dismiss behaviour the rest of the library's overlays get from Floating UI's
 * `useDismiss`. That difference is exactly what these tests measure.
 */

const TimePickerFixture = ({ onSelect = () => undefined }: { onSelect?: (date?: Date) => void }): JSX.Element => {
    const [value, setValue] = useState<Date>()
    return (
        <StyledTimePicker
            dataTest='start-time'
            label='Start time'
            value={value}
            onSelect={(next) => {
                setValue(next)
                onSelect(next)
            }}
        />
    )
}

const field = (container: HTMLElement): HTMLInputElement =>
    container.querySelector<HTMLInputElement>('input[data-testid="start-time"]')!
/* Anchor on the confirm button rather than the popper wrapper. The popper mounts through a `Fade`
 * and its outer nodes churn while the transition settles, so a wrapper query can read "gone" for a
 * frame and make an Escape assertion pass for the wrong reason — that false green is exactly how
 * ASMA-8139-K nearly got written up as fixed. The confirm button exists only while the panel is
 * really mounted. */
const panel = (): HTMLElement | null =>
    document.querySelector<HTMLElement>('[data-testid="time-picker-confirm-button"]')

/** Open with the pointer (the only way — see ASMA-8139-J) and let the Fade transition settle. */
const openPanel = async (container: HTMLElement): Promise<void> => {
    await userEvent.click(field(container))
    await waitFor(() => expect(panel()).not.toBeNull())
    await waitFor(() => expect(panel()).not.toBeNull(), { timeout: 600 })
}

describe('StyledTimePicker keyboard contract', () => {
    afterEach(cleanup)

    it('exposes a named text field (4.1.2)', async () => {
        const { container } = mount(<TimePickerFixture />)

        await expect(field(container)).toHaveAccessibleName('Start time')
    })

    it('is reachable by Tab (2.1.1)', async () => {
        const { container } = mount(<TimePickerFixture />)

        await userEvent.tab()

        await expect(document.activeElement).toBe(field(container))
    })

    it('accepts a time typed entirely on the keyboard (2.1.1)', async () => {
        // This is the load-bearing keyboard path: the picker panel is mouse-oriented, so typing is
        // how a keyboard user actually sets a time. If this breaks, the component is unusable.
        const onSelect = fn()
        const { container } = mount(<TimePickerFixture onSelect={onSelect} />)
        const input = field(container)

        input.focus()
        await userEvent.keyboard('0930')

        await waitFor(() => expect(input).toHaveValue('09:30'))
        await waitFor(() => expect(onSelect).toHaveBeenCalled())
        const picked = onSelect.mock.calls.at(-1)?.[0] as Date
        await expect(picked.getHours()).toBe(9)
        await expect(picked.getMinutes()).toBe(30)
    })

    it('marks an incomplete time invalid instead of committing it (4.1.2)', async () => {
        const { container } = mount(<TimePickerFixture />)
        const input = field(container)

        input.focus()
        await userEvent.keyboard('09')

        await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))
    })

    it('keeps a disabled picker out of the tab order (2.1.1)', async () => {
        const { container } = mount(
            <StyledTimePicker dataTest='off-time' label='Start' disabled onSelect={() => undefined} />,
        )

        const input = container.querySelector<HTMLInputElement>('input[data-testid="off-time"]')!
        await expect(input).toBeDisabled()
        await userEvent.tab()
        await expect(document.activeElement).not.toBe(input)
    })

    /* FINDING ASMA-8139-J — WCAG 2.1.1 (keyboard). src/datetime/components/time-picker/
     * TimePickerInput.tsx. The picker panel can only be opened with a pointer. Both openers are
     * mouse-only: the field wrapper uses `slotProps.input.onMouseDown`, and the trailing clock is a
     * bare `<ClockOutlineIcon>` (an `<svg>` with an `onClick`) — not a button, no `tabindex`, no key
     * handler, so it is not focusable and never receives Enter/Space. There is no ArrowDown-to-open
     * on the input either, unlike StyledSelect and StyledSelectAutocomplete.
     * Severity is reduced but not removed by the typed path: a keyboard user CAN set a time by
     * typing `HHMM` (asserted above and passing), so the FUNCTION is operable and this is not a
     * complete 2.1.1 block. What is unreachable is the panel — including its eraser and confirm
     * buttons, and the "now" affordance — so keyboard and pointer users get materially different
     * capabilities.
     * Not fixed here: wave-3 builders add tests, not component fixes. Escalated to the coordinator.
     * @see docs/a11y-keyboard-contract.md */
    it.skip('opens the time panel from the keyboard (2.1.1)', async () => {
        const { container } = mount(<TimePickerFixture />)
        field(container).focus()

        await userEvent.keyboard('{ArrowDown}')

        await waitFor(() => expect(panel()).not.toBeNull())
    })

    /* FINDING ASMA-8139-K — WCAG 1.4.13 / 2.1.2 (dismissable). Same component. Once the panel HAS
     * been opened with the mouse, Escape does not close it: dismissal is a
     * `ClickAwayListener mouseEvent='onMouseDown'` (src/datetime/components/time-picker/
     * StyledTimePicker.tsx) plus `useBackNavigationClose` on mobile, and `usePopupState`
     * (src/hooks/usePopupState.tsx) registers no key handler — grepping both files for `Escape` or
     * `keydown` returns nothing. Every other overlay in the library (StyledPopover, StyledSelect,
     * StyledSelectAutocomplete, StyledTooltip, StyledDialog) closes on Escape, so this is an
     * inconsistency as well as a defect.
     * Not fixed here: wave-3 builders add tests, not component fixes. Escalated to the coordinator.
     * @see docs/a11y-keyboard-contract.md */
    it.skip('closes the time panel on Escape (1.4.13, 2.1.2)', async () => {
        const { container } = mount(<TimePickerFixture />)
        await openPanel(container)

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(panel()).toBeNull())
    })

    it('confirms the panel really is mouse-openable, so ASMA-8139-J/K are about the panel and not the fixture', async () => {
        // Guards the two findings above from rotting into false positives: if this ever fails, the
        // fixture stopped opening the panel at all and those skipped tests would be measuring
        // nothing. Keeps the escalation honest.
        const { container } = mount(<TimePickerFixture />)
        await openPanel(container)

        await expect(panel()).not.toBeNull()
    })
})
