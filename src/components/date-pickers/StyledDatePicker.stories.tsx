import type { Meta, StoryObj } from '@storybook/react'
import { Stack, Typography } from '@mui/material'
import { LocalizationProvider, nbNO } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { nb } from 'date-fns/locale'
import { StyledDatePicker } from './StyledDatePicker'
import { StyledMobileDatePicker } from './StyledMobileDatePicker'

const meta = {
    title: 'DatePickers/Styled Date Picker',
    component: StyledDatePicker,
    tags: ['autodocs'],
    argTypes: {},
    args: {
        showDaysOutsideCurrentMonth: true,
        views: ['year', 'month', 'day'],
    },
} satisfies Meta<typeof StyledDatePicker>

export default meta

type Story = StoryObj<typeof meta>

export const DatePicker: Story = {
    args: meta.args,
    render: (args) => {
        return (
            <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={nb}
                localeText={nbNO.components.MuiLocalizationProvider.defaultProps.localeText}
            >
                <Stack mt={2} mb={4}>
                    <Typography variant='h1'>Standard DatePicker</Typography>

                    <StyledDatePicker
                        {...meta.args}
                        {...args}
                        actions={['clear', 'today']}
                        className='w-40'
                        placeholder='Velg dato'
                        size='small'
                    />
                </Stack>
                <Stack mt={2}>
                    <Typography variant='h1'>DatePicker disabled</Typography>

                    <StyledDatePicker {...meta.args} {...args} disabled className='w-40' />
                </Stack>
                <Stack mt={2} mb={4}>
                    <Typography variant='h1'>DatePicker mobile</Typography>
                    <StyledMobileDatePicker
                        {...meta.args}
                        {...args}
                        className='w-[100px]'
                        placeholder='Velg dato'
                        size='small'
                    />
                </Stack>
            </LocalizationProvider>
        )
    },
}
