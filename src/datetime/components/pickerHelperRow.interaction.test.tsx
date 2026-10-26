import { afterEach, describe, it } from 'vitest'
import { expect, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledInputField } from 'src/components/inputs/input-field/StyledInputField'
import { StyledDatePicker } from './date-picker/StyledDatePicker'
import { StyledTimePicker } from './time-picker/StyledTimePicker'

/**
 * ASMA-8667. A date or time picker error stays on one line: it may run past the narrow field to the
 * right as far as the row allows, and is cut with an ellipsis only where the row has no room left.
 */

const LONG_ERROR = 'End time must be later than the start time'
const ONE_LINE = 24

const input = (container: HTMLElement, testId: string): HTMLInputElement =>
    container.querySelector<HTMLInputElement>(`input[data-testid="${testId}"]`)!

const helperRow = (container: HTMLElement, testId: string): HTMLElement => {
    const id = input(container, testId).getAttribute('aria-describedby')!.split(' ')[0]!
    return document.getElementById(id)!
}

const truncated = (row: HTMLElement): boolean => {
    const text = row.querySelector<HTMLElement>('.truncate')!
    return text.scrollWidth > text.clientWidth
}

const noop = (): void => undefined

describe('date and time picker helper row', () => {
    afterEach(cleanup)

    it('keeps a time error on one line, using the free room to the right of the field', async () => {
        const { container } = mount(
            <div style={{ display: 'flex', gap: 16, width: 600 }}>
                <StyledTimePicker dataTest='alone' label='End time' error helperText={LONG_ERROR} onSelect={noop} />
            </div>,
        )
        const row = helperRow(container, 'alone')

        await waitFor(() => expect(row.getBoundingClientRect().width).toBeGreaterThan(128))
        await expect(row.getBoundingClientRect().height).toBeLessThanOrEqual(ONE_LINE)
        await expect(truncated(row)).toBe(false)
    })

    it('stops a time error short of the next field and cuts it to one line', async () => {
        const { container } = mount(
            <div style={{ display: 'flex', gap: 16, width: 600 }}>
                <StyledTimePicker dataTest='start' label='Start time' error helperText={LONG_ERROR} onSelect={noop} />
                <StyledTimePicker dataTest='end' label='End time' onSelect={noop} />
            </div>,
        )
        const row = helperRow(container, 'start')
        const next = input(container, 'end').getBoundingClientRect()

        await waitFor(() => expect(truncated(row)).toBe(true))
        await expect(row.getBoundingClientRect().right).toBeLessThanOrEqual(next.left)
        await expect(row.getBoundingClientRect().height).toBeLessThanOrEqual(ONE_LINE)
    })

    it('runs a date error under the calendar button on one line', async () => {
        const { container } = mount(
            <div style={{ display: 'flex', width: 600 }}>
                <StyledDatePicker
                    dataTest='date'
                    mode='single'
                    selected={undefined}
                    label='Start date'
                    error
                    errorText={LONG_ERROR}
                    onSelect={noop}
                />
            </div>,
        )
        const row = helperRow(container, 'date')

        await waitFor(() => expect(row.getBoundingClientRect().width).toBeGreaterThan(200))
        await expect(row.getBoundingClientRect().height).toBeLessThanOrEqual(ONE_LINE)
        await expect(truncated(row)).toBe(false)
    })

    it('reserves the date helper row, so an error does not move the layout', async () => {
        const picker = (error: boolean): JSX.Element => (
            <div style={{ width: 600 }}>
                <StyledDatePicker
                    dataTest='reserved'
                    mode='single'
                    selected={undefined}
                    label='Start date'
                    hideDefaultHelperText
                    reserveHelperText
                    error={error}
                    errorText={error ? 'Required' : undefined}
                    onSelect={noop}
                />
            </div>
        )
        const { container, rerender } = mount(picker(false))
        const before = container.getBoundingClientRect().height

        await expect(helperRow(container, 'reserved')).toBeTruthy()

        rerender(picker(true))

        await waitFor(() => expect(container).toHaveTextContent('Required'))
        await expect(container.getBoundingClientRect().height).toBe(before)
    })

    it('leaves a plain field measured against its own parent', async () => {
        const { container } = mount(
            <div style={{ display: 'flex', width: 600 }}>
                <div style={{ width: 160 }}>
                    <StyledInputField dataTest='plain' label='Plain' error helperText={LONG_ERROR} />
                </div>
            </div>,
        )
        const row = helperRow(container, 'plain')

        await expect(row.getBoundingClientRect().width).toBeLessThanOrEqual(160)
    })
})
