import type { StoryObj, Meta } from '@storybook/react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { nb } from 'date-fns/locale'

import { StyledDatePicker } from './StyledDatePicker'
import { StyledButton } from '../button'
import { StyledTypography } from 'src/components/data-display/typography'
import { StyledPopover } from 'src/components/utils/popover'
import { StyledCheckbox } from '../checkbox'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'

const meta = {
    title: 'Inputs/Styled Date Picker',
    component: StyledDatePicker,
    tags: ['autodocs'],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledDatePicker>

export default meta
type Story = StoryObj<typeof StyledDatePicker>

export const DatePicker: Story = {
    render: () => <StyledDatePickerExample />,
}

export const StyledDatePickerExample = () => {
    const [date, setDate] = useState<Date>()
    const [range, setRange] = useState<DateRange>()
    const [rangeCompact, setRangeCompact] = useState<DateRange>()
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const open = Boolean(anchorEl)
    const id = open ? 'simple-popover' : undefined

    const windowHeight = window.innerHeight
    const buttonRect = anchorEl?.getBoundingClientRect() || { top: 0, bottom: 0 }
    const spaceBelow = windowHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top

    const menuAbove = spaceBelow < 300 && spaceAbove > spaceBelow
    return (
        <div className={'flex flex-col gap-5'}>
            <StyledDatePicker dataTest='' placeholder='Pick a date' mode='single' selected={date} onSelect={setDate} />
            <StyledDatePicker dataTest='' placeholder='Disabled' mode='single' disabled />
            <StyledDatePicker 
                dataTest=''
                disabledDays={{ before: new Date() }}
                placeholder='Disabled days'
                mode='single'
                selected={date}
                onSelect={setDate}
            />
            <StyledDatePicker
                dataTest=''
                placeholder='Pick a range date'
                numberOfMonths={2}
                mode='range'
                selected={range}
                onSelect={setRange}
                locale={nb}
                dateFormat={'dd.MM.y'}
                onClear={() => setRange({ to: undefined, from: undefined })}
                allowClear
            />
            <StyledDatePicker
                dataTest=''
                placeholderFrom='Fra'
                placeholderTo='Til'
                numberOfMonths={2}
                compact={true}
                mode='range'
                selected={rangeCompact}
                onSelect={setRangeCompact}
                dateFormat={'dd.MM.yy'}
                onClearFrom={() => setRangeCompact({ ...rangeCompact, from: undefined })}
                onClearTo={() => setRangeCompact({ from: rangeCompact?.from, to: undefined })}
                allowClear
            />
            <StyledDatePicker
                dataTest=''
                placeholderFrom='Fra'
                placeholderTo='Til'
                numberOfMonths={2}
                compact={true}
                mode='range'
                disabled
            />

            {/* Popover like in InOutBox */}
            <StyledButton dataTest='test' variant='contained' className='w-28' onClick={handleClick}>
                Open popover
            </StyledButton>

            <StyledPopover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: menuAbove ? 'top' : 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: menuAbove ? 'bottom' : 'top',
                    horizontal: 'center',
                }}
            >
                <StyledTypography sx={{ p: 2 }}>
                    <div className='flex flex-col '>
                        <StyledFormControlLabel
                            label={'test'}
                            control={<StyledCheckbox dataTest='test' size='small' />}
                        />
                        <StyledFormControlLabel
                            label={'test'}
                            control={<StyledCheckbox dataTest='test' size='small' />}
                        />
                        <StyledFormControlLabel
                            label={'test'}
                            control={<StyledCheckbox dataTest='test' size='small' />}
                        />
                    </div>

                    <StyledDatePicker
                        dataTest=''
                        placeholder='Pick a start date'
                        mode='single'
                        selected={date}
                        onSelect={setDate}
                    />
                    <div className='my-2'></div>
                    <StyledDatePicker dataTest='' placeholder='Pick a end date' mode='single' selected={date} onSelect={setDate} />
                </StyledTypography>
            </StyledPopover>
        </div>
    )
}
