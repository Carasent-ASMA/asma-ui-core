import { Stack, Typography } from '@mui/material'
import { LocalizationProvider, nbNO } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import type { Meta, StoryObj } from '@storybook/react'
import { nb } from 'date-fns/locale'
import { StyledTimePicker } from './StyledTimePicker'

const meta = {
    title: 'DatePickers/Styled Time Picker',
    component: StyledTimePicker,
    tags: ['autodocs'],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledTimePicker>

export default meta

type Story = StoryObj<typeof meta>

export const TimePicker: Story = {
    args: meta.args,
    render: (args) => {
        return (
            <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={nb}
                localeText={nbNO.components.MuiLocalizationProvider.defaultProps.localeText}
            >
                <Stack mt={2} mb={4}>
                    <Typography variant='h1'>Standard TimePicker</Typography>

                    <StyledTimePicker {...meta.args} {...args} className='w-28' size='small' />
                </Stack>
            </LocalizationProvider>
        )
    },
}
