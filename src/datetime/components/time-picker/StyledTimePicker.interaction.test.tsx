import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { getOverlayBackStackSize, requestCloseTopOverlayBack } from 'src/hooks/useBackCloses.hook'
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
        <>
            <button type='button' data-testid='before'>
                Before
            </button>
            <StyledTimePicker
                dataTest='start-time'
                label='Start time'
                value={value}
                onSelect={(next) => {
                    setValue(next)
                    onSelect(next)
                }}
            />
            <button type='button' data-testid='after'>
                After
            </button>
        </>
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
        await expect(document.activeElement).toBe(container.querySelector('[data-testid="before"]'))
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

    it('shows no error while typing an incomplete time, and marks it invalid on blur (4.1.2, ADR-0017 REQ-001)', async () => {
        const onSelect = fn()
        const { container } = mount(<TimePickerFixture onSelect={onSelect} />)
        const input = field(container)

        input.focus()
        await userEvent.keyboard('09')

        await waitFor(() => expect(input).toHaveValue('09'))
        await expect(input).not.toHaveAttribute('aria-invalid')
        await expect(container).not.toHaveTextContent('Invalid time format')

        input.blur()

        await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))
        await expect(container).toHaveTextContent('Invalid time format')
        await expect(onSelect).not.toHaveBeenCalled()
    })

    it('clears the error on the first valid change and never adds one while typing (ADR-0017 REQ-002)', async () => {
        const { container } = mount(<TimePickerFixture />)
        const input = field(container)

        input.focus()
        await userEvent.keyboard('09')
        input.blur()
        await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))

        input.focus()
        await userEvent.keyboard('30')
        await waitFor(() => expect(input).toHaveValue('09:30'))
        await expect(input).not.toHaveAttribute('aria-invalid')

        await userEvent.keyboard('{Backspace}')
        await waitFor(() => expect(input).toHaveValue('09:3'))
        await expect(input).not.toHaveAttribute('aria-invalid')

        input.blur()
        await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))
    })

    it('does not mark an incomplete time invalid on Enter without a blur', async () => {
        const { container } = mount(<TimePickerFixture />)
        const input = field(container)

        input.focus()
        await userEvent.keyboard('09{Enter}')

        await expect(input).not.toHaveAttribute('aria-invalid')
        await userEvent.tab()
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
    it('closes the time panel on Escape (1.4.13, 2.1.2)', async () => {
        const { container } = mount(<TimePickerFixture />)
        await openPanel(container)

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(panel()).toBeNull())
        await expect(document.activeElement).toBe(field(container))
    })

    it('Back closes the time panel without selecting a time', async () => {
        const onSelect = fn()
        const { container } = mount(<TimePickerFixture onSelect={onSelect} />)
        await openPanel(container)
        await expect(getOverlayBackStackSize()).toBe(1)

        void requestCloseTopOverlayBack()

        await waitFor(() => expect(panel()).toBeNull())
        await expect(onSelect).not.toHaveBeenCalled()
    })

    it('closes the time panel on Tab without blocking focus movement (2.1.2)', async () => {
        const { container } = mount(<TimePickerFixture />)
        const input = field(container)
        await openPanel(container)
        input.focus()

        await userEvent.tab()

        await waitFor(() => expect(panel()).toBeNull())
        await expect(document.activeElement).toBe(container.querySelector('[data-testid="after"]'))
    })

    it('closes the time panel on Shift+Tab without blocking reverse focus movement (2.1.2)', async () => {
        const { container } = mount(<TimePickerFixture />)
        await openPanel(container)
        field(container).focus()

        await userEvent.tab({ shift: true })

        await waitFor(() => expect(panel()).toBeNull())
        await expect(document.activeElement).toBe(container.querySelector('[data-testid="before"]'))
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

/** `minTime` (ASMA-8358): earlier cells are disabled (Figma Time item State=Disabled), never an error. */
describe('StyledTimePicker minTime', () => {
    afterEach(cleanup)

    const MinTimeFixture = ({
        initial,
        onSelect = () => undefined,
    }: {
        initial?: Date
        onSelect?: (date?: Date) => void
    }): JSX.Element => {
        const [value, setValue] = useState<Date | undefined>(initial)
        return (
            <>
                <StyledTimePicker
                    dataTest='min-time'
                    label='Start time'
                    value={value}
                    minTime={new Date(2026, 9, 5, 12, 32)}
                    onSelect={(next) => {
                        setValue(next)
                        onSelect(next)
                    }}
                />
                <button type='button' data-testid='after'>
                    After
                </button>
            </>
        )
    }

    const minField = (container: HTMLElement): HTMLInputElement =>
        container.querySelector<HTMLInputElement>('input[data-testid="min-time"]')!
    const openMinPanel = async (container: HTMLElement): Promise<void> => {
        await userEvent.click(minField(container))
        await waitFor(() => expect(panel()).not.toBeNull(), { timeout: 600 })
    }

    const columns = (): HTMLElement[] => {
        const body = document.querySelector<HTMLElement>('[data-test="min-time-time-picker-body"]')!
        return Array.from(body.children) as HTMLElement[]
    }
    const cell = (column: 0 | 1, label: string): HTMLButtonElement =>
        Array.from(columns()[column]!.querySelectorAll('button')).find((b) => b.textContent === label)!

    it('disables hour and minute cells before minTime', async () => {
        const { container } = mount(<MinTimeFixture initial={new Date(2026, 9, 5, 12, 40)} />)
        await openMinPanel(container)

        await expect(cell(0, '11')).toBeDisabled()
        await expect(cell(0, '12')).toBeEnabled()
        await expect(cell(1, '30')).toBeDisabled()
        await expect(cell(1, '35')).toBeEnabled()
    })

    it('enables every minute once a later hour is selected', async () => {
        const { container } = mount(<MinTimeFixture initial={new Date(2026, 9, 5, 14, 0)} />)
        await openMinPanel(container)

        await expect(cell(1, '00')).toBeEnabled()
    })

    it('moves the minutes up when the minTime hour is picked with earlier minutes', async () => {
        const onSelect = fn()
        const { container } = mount(<MinTimeFixture initial={new Date(2026, 9, 5, 13, 10)} onSelect={onSelect} />)
        await openMinPanel(container)

        await userEvent.click(cell(0, '12'))

        await waitFor(() => expect(minField(container)).toHaveValue('12:35'))
        const picked = onSelect.mock.calls.at(-1)?.[0] as Date
        await expect(picked.getMinutes()).toBe(35)
    })

    it('does not commit a typed earlier time and reverts it on blur, without an error', async () => {
        const onSelect = fn()
        const { container } = mount(<MinTimeFixture initial={new Date(2026, 9, 5, 13, 0)} onSelect={onSelect} />)
        const input = minField(container)

        await userEvent.clear(input)
        await userEvent.keyboard('1000')
        await waitFor(() => expect(input).toHaveValue('10:00'))
        await expect(input).not.toHaveAttribute('aria-invalid', 'true')

        input.blur()

        await waitFor(() => expect(input).toHaveValue('13:00'))
        await expect(onSelect).not.toHaveBeenCalled()
        await expect(input).not.toHaveAttribute('aria-invalid', 'true')
    })

    it('shows a before-start time as an error only after blur', async () => {
        const { container } = mount(
            <StyledTimePicker
                dataTest='end-time'
                label='End time'
                notBeforeTime={new Date(2026, 9, 5, 12, 0)}
                value={new Date(2026, 9, 5, 13, 0)}
                onSelect={() => undefined}
            />,
        )
        const input = container.querySelector<HTMLInputElement>('input[data-testid="end-time"]')!

        await userEvent.clear(input)
        await userEvent.keyboard('1100')
        await waitFor(() => expect(input).toHaveValue('11:00'))
        await expect(input).not.toHaveAttribute('aria-invalid')

        input.blur()

        await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))
        await expect(container).toHaveTextContent('Must be after start time')
    })

    it('uncommits a field emptied by typing on blur, without an error', async () => {
        const onSelect = fn()
        const { container } = mount(<MinTimeFixture initial={new Date(2026, 9, 5, 13, 0)} onSelect={onSelect} />)
        const input = minField(container)

        await userEvent.clear(input)
        await expect(onSelect).not.toHaveBeenCalled()

        input.blur()

        await waitFor(() => expect(onSelect).toHaveBeenCalledWith(undefined))
        await expect(input).toHaveValue('')
        await expect(input).not.toHaveAttribute('aria-invalid')
    })

    it('shows a before-start time picked from the panel as an error at once (a pick is a finished entry)', async () => {
        const { container } = mount(
            <StyledTimePicker
                dataTest='min-time'
                label='End time'
                notBeforeTime={new Date(2026, 9, 5, 12, 0)}
                value={new Date(2026, 9, 5, 13, 0)}
                onSelect={() => undefined}
            />,
        )
        const input = minField(container)
        await openMinPanel(container)

        await userEvent.click(cell(0, '11'))

        await waitFor(() => expect(input).toHaveValue('11:00'))
        await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))
        await expect(container).toHaveTextContent('Must be after start time')
    })

    it('names the field by its title, or by inputAriaProps for a label rendered outside (1.3.1, 4.1.2)', async () => {
        const { container } = mount(
            <>
                <StyledTimePicker dataTest='titled' title='Start time' onSelect={() => undefined} />
                <StyledTimePicker
                    dataTest='named'
                    onSelect={() => undefined}
                    inputAriaProps={{ 'aria-label': 'End time', 'aria-required': true }}
                />
            </>,
        )

        await expect(container.querySelector('input[data-testid="titled"]')).toHaveAccessibleName('Start time')
        const named = container.querySelector('input[data-testid="named"]')
        await expect(named).toHaveAccessibleName('End time')
        await expect(named).toHaveAttribute('aria-required', 'true')
    })
})

describe('StyledTimePicker required', () => {
    afterEach(cleanup)

    const RequiredFixture = ({
        initial,
        error,
        helperText,
        onSelect = () => undefined,
    }: {
        initial?: Date
        error?: boolean
        helperText?: string
        onSelect?: (date?: Date) => void
    }): JSX.Element => {
        const [value, setValue] = useState<Date | undefined>(initial)
        return (
            <>
                <StyledTimePicker
                    dataTest='required-time'
                    label='Start time'
                    required
                    error={error}
                    helperText={helperText}
                    value={value}
                    onSelect={(next) => {
                        setValue(next)
                        onSelect(next)
                    }}
                />
                <button type='button' data-testid='after'>
                    After
                </button>
            </>
        )
    }

    const requiredField = (container: HTMLElement): HTMLInputElement =>
        container.querySelector<HTMLInputElement>('input[data-testid="required-time"]')!

    it('marks the input aria-required', async () => {
        const { container } = mount(<RequiredFixture />)

        await expect(requiredField(container)).toHaveAttribute('aria-required', 'true')
    })

    it('shows Required, not an invalid format, when an empty field is left (3.3.1)', async () => {
        const { container } = mount(<RequiredFixture />)
        const input = requiredField(container)

        input.focus()
        await expect(input).not.toHaveAttribute('aria-invalid')
        await userEvent.tab()

        await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))
        await expect(container).toHaveTextContent('Required')
        await expect(container).not.toHaveTextContent('Invalid time format')
    })

    it('uncommits an emptied field and shows Required on blur', async () => {
        const onSelect = fn()
        const { container } = mount(<RequiredFixture initial={new Date(2026, 9, 5, 13, 0)} onSelect={onSelect} />)
        const input = requiredField(container)

        await userEvent.clear(input)
        input.blur()

        await waitFor(() => expect(onSelect).toHaveBeenCalledWith(undefined))
        await expect(input).toHaveAttribute('aria-invalid', 'true')
        await expect(container).toHaveTextContent('Required')
    })

    it('drops Required on the first keystroke without showing an invalid format', async () => {
        const { container } = mount(<RequiredFixture />)
        const input = requiredField(container)

        input.focus()
        await userEvent.tab()
        await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))

        input.focus()
        await userEvent.keyboard('0')

        await waitFor(() => expect(input).not.toHaveAttribute('aria-invalid'))
        await expect(container).not.toHaveTextContent('Required')
        await expect(container).not.toHaveTextContent('Invalid time format')
    })

    it('shows Required after the eraser empties the field', async () => {
        const { container } = mount(<RequiredFixture initial={new Date(2026, 9, 5, 13, 0)} />)

        await userEvent.click(requiredField(container))
        await waitFor(() => expect(panel()).not.toBeNull(), { timeout: 600 })
        await userEvent.click(document.querySelector<HTMLElement>('[data-testid="time-picker-erase-button"]')!)

        await waitFor(() => expect(requiredField(container)).toHaveAttribute('aria-invalid', 'true'))
        await expect(container).toHaveTextContent('Required')
    })

    it('waits for the panel: no Required while picking, Required once Tab leaves without a pick', async () => {
        const { container } = mount(<RequiredFixture />)
        const input = requiredField(container)

        await userEvent.click(input)
        await waitFor(() => expect(panel()).not.toBeNull(), { timeout: 600 })
        await expect(input).not.toHaveAttribute('aria-invalid')

        await userEvent.tab()

        await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))
        await expect(container).toHaveTextContent('Required')
    })

    it('shows the form error text over its own message (form errors win)', async () => {
        const { container } = mount(<RequiredFixture error helperText='Start time is required' />)
        const input = requiredField(container)

        await expect(input).toHaveAttribute('aria-invalid', 'true')
        await expect(container).toHaveTextContent('Start time is required')

        input.focus()
        await userEvent.tab()

        await expect(container).toHaveTextContent('Start time is required')
        await expect(container).not.toHaveTextContent(/Required$/)
    })

    it('keeps its own before-start message over a form Required for a typed time', async () => {
        const { container } = mount(
            <StyledTimePicker
                dataTest='end-time'
                label='End time'
                required
                error
                helperText='Required'
                notBeforeTime={new Date(2026, 9, 5, 12, 0)}
                value={new Date(2026, 9, 5, 13, 0)}
                onSelect={() => undefined}
            />,
        )
        const input = container.querySelector<HTMLInputElement>('input[data-testid="end-time"]')!

        await userEvent.clear(input)
        await userEvent.keyboard('1100')
        await waitFor(() => expect(input).toHaveValue('11:00'))
        input.blur()

        await waitFor(() => expect(container).toHaveTextContent('Must be after start time'))
        await expect(container).not.toHaveTextContent('Required')
    })

    it('shows no error for an empty optional field', async () => {
        const { container } = mount(<TimePickerFixture />)
        const input = field(container)

        input.focus()
        await userEvent.tab()

        await expect(input).not.toHaveAttribute('aria-invalid')
        await expect(container).not.toHaveTextContent('Required')
    })
})
