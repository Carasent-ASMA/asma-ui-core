import { afterEach, describe, it } from 'vitest'
import { expect, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledDatePicker } from './date-picker/StyledDatePicker'
import { StyledTimePicker } from './time-picker/StyledTimePicker'

const REASON = 'Locked for editing after the end date'

describe('Locked date and time pickers (disabled-states DIS-9)', () => {
    afterEach(cleanup)

    it('shows a locked date as a read-only field with the lock and no calendar button', async () => {
        const { container } = mount(
            <StyledDatePicker
                dataTest='start-date'
                mode='single'
                label='Start date'
                selected={new Date(2026, 9, 20)}
                onSelect={() => undefined}
                lockedReason={REASON}
            />,
        )
        const input = container.querySelector<HTMLInputElement>('input[data-testid="start-date"]')!

        await expect(input).toHaveAttribute('readonly')
        await expect(input).toHaveValue('20.10.2026')
        await expect(container.querySelector('button')).toBeNull()
        await expect(container.querySelector('svg[aria-hidden="true"]')).not.toBeNull()
        await waitFor(() => expect(input).toHaveAccessibleDescription(REASON))
    })

    it('shows a locked time with the lock instead of the clock', async () => {
        const { container } = mount(
            <StyledTimePicker
                dataTest='start-time'
                label='Start time'
                value={new Date(2026, 9, 20, 9, 30)}
                onSelect={() => undefined}
                lockedReason={REASON}
            />,
        )
        const input = container.querySelector<HTMLInputElement>('input[data-testid="start-time"]')!

        await expect(input).toHaveAttribute('readonly')
        await expect(container.querySelectorAll('svg')).toHaveLength(1)
        await waitFor(() => expect(input).toHaveAccessibleDescription(REASON))
    })

    it('shows a read-only date value as text with its reason and no calendar button (DIS-6)', async () => {
        const { container } = mount(
            <StyledDatePicker
                dataTest='plan-start'
                mode='single'
                title='Start date'
                selected={new Date(2026, 9, 20)}
                onSelect={() => undefined}
                readOnlyReason='Set from the events in the plan'
            />,
        )
        const input = container.querySelector<HTMLInputElement>('input[data-testid="plan-start"]')!

        await expect(input).toHaveAttribute('readonly')
        await expect(input).toHaveValue('20.10.2026')
        await expect(container.querySelector('button')).toBeNull()
        await expect(container.querySelector('svg')).toBeNull()
        await waitFor(() => expect(input).toHaveAccessibleDescription('Set from the events in the plan'))
    })
})
