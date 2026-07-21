import type { Meta } from '@storybook/react-vite'
import { add } from 'date-fns'
import { useState, type CSSProperties } from 'react'
import { StyledTimePicker } from 'src/datetime/components/time-picker'

const meta = {
    title: 'Datetime/TimePicker',
    component: StyledTimePicker,
    tags: [],
} satisfies Meta<typeof StyledTimePicker>

export default meta

export const TimePicker = () => {
    const [value, setValue] = useState<Date | undefined>()
    const [value2, setValue2] = useState<Date | undefined>()

    return (
        <div className='flex-col' style={{ display: 'flex', width: '100%', gap: '20px' }}>
            <div className='w-fit gap-7 flex'>
                <StyledTimePicker
                    dataTest='test'
                    value={value}
                    onSelect={setValue}
                    label='Time'
                    placeholder='Time'
                    helperText={'haha'}
                />
                <StyledTimePicker
                    dataTest='test'
                    value={value}
                    onSelect={setValue}
                    error
                    helperText='Some error'
                    label='Time'
                    placeholder='Time'
                    locale={'no'}
                    title='some title '
                />
                <StyledTimePicker
                    dataTest='test'
                    value={value}
                    onSelect={setValue}
                    disabled
                    label='Time'
                    placeholder='Time'
                />
                <StyledTimePicker
                    dataTest='test'
                    value={value}
                    onSelect={setValue}
                    readOnly
                    label='Time'
                    placeholder='Time'
                />
            </div>
            <div>
                <div className='pb-2'>Range</div>
                <div className='flex gap-5'>
                    <StyledTimePicker
                        dataTest='test'
                        error={!value}
                        helperText={!value && 'Required'}
                        value={value}
                        onSelect={(date) => {
                            setValue(date)
                            date && setValue2(add(date, { minutes: 30 }))
                        }}
                        label='Time'
                        placeholder='Time'
                        locale={'no'}
                    />
                    <StyledTimePicker
                        dataTest='test'
                        error={!value2}
                        helperText={!value2 && 'Required'}
                        value={value2}
                        onSelect={setValue2}
                        label='Time'
                        placeholder='Time'
                    />
                </div>
            </div>
        </div>
    )
}

// ─── Gallery ────────────────────────────────────────────────────────────────
// Figma has no distinct time-picker symbol — the trigger is the outlined Input field (node
// 15561-37391) + a trailing clock icon (delta-700, delta-300 when disabled); the popper follows the
// Menus surface. This gallery replicates the field State × Filled matrix (bordered), showing the
// clock-icon treatment per state. Hover is forced via `inputClassName` (pseudo-state addon); the
// open-popper (hour/minute columns) is exercised by the live `TimePicker` story + interaction capture.
const FILLED_TIME = new Date(2024, 0, 1, 14, 30)
const noopSelect = () => undefined

export const Gallery = () => {
    const cell: CSSProperties = { padding: 16, border: '1px solid #bdc4cf', verticalAlign: 'top', width: 260 }
    const head: CSSProperties = {
        ...cell,
        width: 'auto',
        textAlign: 'left',
        fontWeight: 600,
        color: '#49525f',
        whiteSpace: 'nowrap',
        background: '#f0f2f4',
    }

    const ROWS: { label: string; props: Record<string, unknown> }[] = [
        { label: 'Enabled', props: {} },
        { label: 'Hovered', props: { inputClassName: 'pseudo-hover' } },
        { label: 'Error', props: { error: true, helperText: 'Error text' } },
        { label: 'Disabled', props: { disabled: true } },
        { label: 'Read-only', props: { readOnly: true } },
    ]
    const COLS = [
        { key: 'off', label: 'Filled = off', value: undefined },
        { key: 'on', label: 'Filled = on', value: FILLED_TIME },
    ] as const

    return (
        <div>
            <h3 style={{ marginBottom: 12 }}>Time picker — State × Filled</h3>
            <table style={{ borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={head}>State \ Filled</th>
                        {COLS.map((c) => (
                            <th key={c.key} style={head}>
                                {c.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {ROWS.map((row) => (
                        <tr key={row.label}>
                            <th scope='row' style={head}>
                                {row.label}
                            </th>
                            {COLS.map((col) => (
                                <td key={col.key} style={cell}>
                                    <StyledTimePicker
                                        dataTest={`gallery-${row.label}-${col.key}`}
                                        label='Time'
                                        placeholder='Time'
                                        value={col.value}
                                        onSelect={noopSelect}
                                        {...row.props}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
