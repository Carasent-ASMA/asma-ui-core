import type { Meta, StoryObj } from '@storybook/react-vite'
import { StyledDayPicker } from 'src/datetime/components/date-picker/components/StyledDayPicker'

/**
 * Day-state coverage guard for the calendar grid — exercises every Figma "Day" state in one view:
 * default, today, selected (range ends), range-middle, disabled, and other-month.
 * Figma: Date picker (node 14333-90631), "Day" component 14333-90932.
 */
const meta = { title: 'Datetime/DatePicker Calendar States' } satisfies Meta
export default meta
type Story = StoryObj

const range = { from: new Date(2026, 0, 10), to: new Date(2026, 0, 18) }

export const AllDayStates: Story = {
    render: () => (
        <div className='inline-block rounded border border-delta-300 p-4' style={{ width: 360 }}>
            <StyledDayPicker
                datePickerProps={
                    {
                        mode: 'range',
                        selected: range,
                        onSelect: () => undefined,
                        disabledDays: [new Date(2026, 0, 5), new Date(2026, 0, 22), new Date(2026, 0, 23)],
                        dataTest: 'calendar-states',
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any
                }
                popoverProps={{ open: true, anchorEl: null, onClose: () => undefined }}
            />
        </div>
    ),
}
