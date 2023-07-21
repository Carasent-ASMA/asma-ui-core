import { LocalizationProvider, nbNO } from '@mui/x-date-pickers'
import type { Meta, StoryObj } from '@storybook/react'
import { StyledMobileTimePicker } from './StyledMobileTimePicker'
import { Stack, Typography } from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { nb } from 'date-fns/locale'

const meta = {
    title: 'DatePickers/Styled Mobile Time Picker',
    component: StyledMobileTimePicker,
    tags: ['autodocs'],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledMobileTimePicker>

export default meta

type Story = StoryObj<typeof meta>

export const MobileTimePicker: Story = {
    args: meta.args,
    render: (args) => {
        return (
            <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={nb}
                localeText={nbNO.components.MuiLocalizationProvider.defaultProps.localeText}
            >
                <Stack mt={2} mb={4}>
                    <Typography variant='h1'>Standard MobileTimePicker</Typography>

                    <StyledMobileTimePicker
                        {...meta.args}
                        {...args}
                        className='w-28'
                        slotProps={{
                            textField: {
                                size: 'small',
                            },
                        }}
                    />
                </Stack>
            </LocalizationProvider>
        )
    },
}
