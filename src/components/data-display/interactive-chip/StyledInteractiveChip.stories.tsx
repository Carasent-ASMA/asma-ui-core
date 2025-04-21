import React, { useState } from 'react'
import type { Meta } from '@storybook/react'
import { StyledInteractiveChip } from './StyledInteractiveChip'
import { StyledSwitch } from 'src'

const meta: Meta = {
    title: 'DataDisplay/InteractiveChip',
    component: StyledInteractiveChip,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledInteractiveChip>

export default meta

export const InteractiveChip = () => {
    const [readOnly, setReadOnly] = useState(false)
    const [selectedRadio, setSelectedRadio] = useState<string | null>('1')
    const [checkboxes, setCheckboxes] = useState({
        '1': true,
        '2': true,
        '3': false,
    })

    return (
        <div className={'flex flex-col gap-2'}>
            <StyledSwitch dataTest={'ic-readonly-switch'} value={readOnly} onChange={() => setReadOnly(!readOnly)} />

            <div>
                <p>Checkbox interactive chips</p>

                <div className={'flex gap-2 w-fit'}>
                    {options.map(({ value, label }) => (
                        <StyledInteractiveChip
                            key={value}
                            readOnly={readOnly}
                            type='radio'
                            dataTest={`ic-${value}`}
                            onClick={() => setSelectedRadio((prev) => (prev === value ? null : value))}
                            checked={selectedRadio === value}
                            label={label}
                        />
                    ))}
                </div>
            </div>

            <div>
                <p>Radio button interactive chips</p>

                <div className={'flex gap-2'}>
                    {options.map(({ value, label }) => (
                        <StyledInteractiveChip
                            key={value}
                            readOnly={readOnly}
                            dataTest={`${value}-ic`}
                            type={'checkbox'}
                            onClick={() =>
                                setCheckboxes((prev) => ({
                                    ...prev,
                                    [value]: !prev[value],
                                }))
                            }
                            checked={checkboxes[value]}
                            label={label}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

const options = [
    { value: '1', label: 'Single option' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
] as const
