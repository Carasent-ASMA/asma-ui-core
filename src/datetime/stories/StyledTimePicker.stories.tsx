import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { add } from 'date-fns'
import { useState, type CSSProperties } from 'react'
import { StyledTimePicker } from 'src/datetime/components/time-picker'
import { StyledDatePicker } from 'src/datetime/components/date-picker'
import { StyledFieldPair } from 'src/components/inputs/form-layout/StyledFieldPair'
import { TimePickerPanel } from 'src/datetime/components/time-picker/components/TimePickerPanel'

const meta = {
    title: 'Datetime/TimePicker',
    component: StyledTimePicker,
    tags: [],
    parameters: {
        docs: {
            description: {
                component: [
                    'Time input with a trailing clock icon (Figma field node 15561-37391) that opens scrollable',
                    'hour/minute columns. On desktop the panel is a DS Menus popper; on mobile (≤768px) the same',
                    'panel opens in a bottom-sheet drawer, matching the date picker — see the Mobile story.',
                    'Brand theming (Green/Blue/Fretex) comes from the semantic `gama` tokens — see Color themes.',
                ].join(' '),
            },
        },
    },
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

// axe: color-contrast (text/background contrast below the 4.5:1 threshold). ASMA-8136 allowlist - see docs/a11y-allowlist.md
TimePicker.parameters = { a11y: { test: 'todo' } }

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

// ─── Color themes ───────────────────────────────────────────────────────────
// The picker carries no theme props — the "now" (gama-50), selected (gama-500) and confirm-button
// colors resolve from the semantic gama tokens, so `data-theme` on any ancestor re-brands it.
const THEME_BY_NAME = {
    Green: 'greenish',
    Blue: 'default',
    Fretex: 'fretex',
} as const

/** Filled field + open panel under each brand theme — selected cell and confirm button follow `gama`. */
// axe: color-contrast (text/background contrast below the 4.5:1 threshold). ASMA-8136 allowlist - see docs/a11y-allowlist.md
Gallery.parameters = { a11y: { test: 'todo' } }

export const ColorThemes = () => (
    <div className='flex flex-col gap-10'>
        {Object.entries(THEME_BY_NAME).map(([name, theme]) => (
            <div key={name} data-theme={theme} className='flex items-start gap-8'>
                <span className='w-16 pt-2 text-sm font-semibold text-delta-600'>{name}</span>
                <StyledTimePicker
                    dataTest={`themed-input-${theme}`}
                    label='Time'
                    placeholder='Time'
                    value={FILLED_TIME}
                    onSelect={noopSelect}
                />
                {/* Static open panel on the DS Menus surface (mirrors time-picker-surface). */}
                <div className='w-44 rounded-lg border border-solid border-delta-300 bg-white pb-px shadow-[0px_2px_4px_0px_rgba(34,33,51,0.15)]'>
                    <TimePickerPanel
                        dataTest={`themed-panel-${theme}`}
                        value={FILLED_TIME}
                        onSelect={noopSelect}
                        handleClear={noopSelect}
                        onConfirm={noopSelect}
                    />
                </div>
            </div>
        ))}
    </div>
)

// ─── Min time ───────────────────────────────────────────────────────────────
// `minTime` disables earlier cells with the Figma Time item `State=Disabled` treatment (node
// 15086-19871: delta-400 text, no fill, not-allowed cursor). Fixed times keep the static panel
// deterministic: hour 11 and minutes 30 and earlier are disabled, 35 is the first enabled minute.
const MIN_TIME = new Date(2024, 0, 1, 12, 32)
const MIN_TIME_VALUE = new Date(2024, 0, 1, 12, 40)

/** Live field (pick or type a time before 12:32 to see it refused) + a static open panel. */
export const MinTime = () => {
    const [value, setValue] = useState<Date | undefined>(MIN_TIME_VALUE)
    return (
        <div className='flex items-start gap-8'>
            <StyledTimePicker
                dataTest='min-time'
                label='Time'
                placeholder='Time'
                value={value}
                minTime={MIN_TIME}
                onSelect={setValue}
            />
            <div className='w-44 rounded-lg border border-solid border-delta-300 bg-white pb-px shadow-[0px_2px_4px_0px_rgba(34,33,51,0.15)]'>
                <TimePickerPanel
                    dataTest='min-time-panel'
                    value={MIN_TIME_VALUE}
                    minTime={MIN_TIME}
                    onSelect={noopSelect}
                    handleClear={noopSelect}
                    onConfirm={noopSelect}
                />
            </div>
        </div>
    )
}

// ─── Mobile ─────────────────────────────────────────────────────────────────
const MobileExample = () => {
    const [value, setValue] = useState<Date | undefined>()
    return (
        <StyledTimePicker
            dataTest='mobile-time'
            value={value}
            onSelect={setValue}
            label='Time'
            placeholder='Time'
            error={!value}
            helperText={!value && 'Required'}
        />
    )
}

/**
 * On viewports ≤768px the picker opens as a bottom-sheet drawer (backdrop, Escape/back-navigation
 * dismissal) instead of the anchored popper — same split as the date picker. This story pins the
 * Storybook viewport to a phone; on a desktop-sized canvas the same component renders the popper.
 */
export const Mobile: StoryObj<typeof StyledTimePicker> = {
    globals: { viewport: { value: 'mobile1', isRotated: false } },
    render: () => <MobileExample />,
}

// ─── Error ──────────────────────────────────────────────────────────────────
const ErrorExample = () => {
    const [value, setValue] = useState<Date | undefined>()
    return (
        <StyledTimePicker
            dataTest='error-time'
            value={value}
            onSelect={setValue}
            label='Time'
            placeholder='Time'
            error
            helperText='Required'
        />
    )
}

export const Error: StoryObj<typeof StyledTimePicker> = {
    render: () => <ErrorExample />,
}

/** ASMA-8561: error + focused = 1px error-500 border + 2px inset error-500 edge (3px, layout-neutral). */
export const ErrorFocused: StoryObj<typeof StyledTimePicker> = {
    render: () => <ErrorExample />,
    play: async ({ canvas }) => {
        const input = canvas.getByTestId('error-time')
        input.focus()

        await expect(input).toHaveFocus()
        await expect(input).toHaveAttribute('aria-invalid', 'true')
    },
}

/** ADR-0017 REQ-001: an incomplete time stays neutral while typing and shows the error after blur. */
export const IncompleteTimeOnBlur: StoryObj<typeof StyledTimePicker> = {
    render: () => {
        const Example = () => {
            const [value, setValue] = useState<Date | undefined>()
            return <StyledTimePicker dataTest='blur-time' value={value} onSelect={setValue} label='Time' />
        }
        return <Example />
    },
    play: async ({ canvas, userEvent }) => {
        const input = canvas.getByTestId('blur-time')
        input.focus()
        await userEvent.keyboard('09')
        await expect(input).not.toHaveAttribute('aria-invalid')

        input.blur()
        await expect(await canvas.findByText('Invalid time format')).toBeInTheDocument()
        await expect(input).toHaveAttribute('aria-invalid', 'true')
    },
}

/** ASMA-8667: an empty required time shows "Required" after blur, not an invalid format. */
export const RequiredOnBlur: StoryObj<typeof StyledTimePicker> = {
    render: () => {
        const Example = () => {
            const [value, setValue] = useState<Date | undefined>()
            return (
                <StyledTimePicker
                    dataTest='required-time'
                    value={value}
                    onSelect={setValue}
                    title='Start time*'
                    required
                />
            )
        }
        return <Example />
    },
    play: async ({ canvas }) => {
        const input = canvas.getByTestId('required-time')
        input.focus()
        input.blur()

        await expect(await canvas.findByText('Required')).toBeInTheDocument()
        await expect(input).toHaveAttribute('aria-invalid', 'true')
    },
}

/**
 * ASMA-8667: date, start time and end time in one 600px row, each with a reserved helper line.
 * Errors stay on one line: the last field's message runs into the free room on its right, and a
 * message with no room left before the next field is cut with an ellipsis.
 */
export const ErrorsInARow: StoryObj<typeof StyledTimePicker> = {
    render: () => (
        <div style={{ width: 600 }}>
            <StyledFieldPair>
                <StyledDatePicker
                    dataTest='row-date'
                    mode='single'
                    selected={undefined}
                    title='Start date*'
                    required
                    reserveHelperText
                    hideDefaultHelperText
                    error
                    errorText='Required'
                    onSelect={() => undefined}
                />
                <StyledTimePicker
                    dataTest='row-start'
                    title='Start time*'
                    required
                    error
                    helperText='Ugyldig tidsformat, prøv igjen'
                    onSelect={() => undefined}
                />
                <StyledTimePicker
                    dataTest='row-end'
                    title='End time*'
                    required
                    error
                    helperText='Must be after start time'
                    onSelect={() => undefined}
                />
            </StyledFieldPair>
        </div>
    ),
}
