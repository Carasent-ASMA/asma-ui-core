import type { Meta, StoryObj } from '@storybook/react'
import { StyledDateCalendar } from './StyledDateCalendar'
import { StyledMobileDateCalendar } from './StyledMobileDateCalendar'
import { Stack, Typography } from '@mui/material'
import { LocalizationProvider, nbNO } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { endOfYesterday } from 'date-fns'
import { nb } from 'date-fns/locale'

const meta = {
    title: 'DatePickers/Styled Date Calendar',
    component: StyledDateCalendar,
    tags: ['autodocs'],
    argTypes: {},
    args: {
        views: ['year', 'month', 'day'],
    },
} satisfies Meta<typeof StyledDateCalendar>

export default meta

type Story = StoryObj<typeof meta>

export const DateCalendar: Story = {
    args: meta.args,
    render: (args) => {
        return (
            <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={nb}
                localeText={nbNO.components.MuiLocalizationProvider.defaultProps.localeText}
            >
                <Stack mt={2} mb={4}>
                    <Typography variant='h1'>Standard DateCalendar</Typography>

                    <StyledDateCalendar {...meta.args} {...args} />
                </Stack>
                <Stack mt={2}>
                    <Typography variant='h1'>DateCalendar with figma options</Typography>

                    <StyledDateCalendar
                        {...meta.args}
                        {...args}
                        shouldDisableDate={(date) => {
                            return date < endOfYesterday() || date.getMonth() !== new Date().getMonth()
                        }}
                        showDaysOutsideCurrentMonth
                        views={['day']}
                    />
                </Stack>
                <Stack mt={2} mb={4}>
                    <Typography variant='h1'>DateCalendar mobile</Typography>

                    <StyledMobileDateCalendar {...meta.args} {...args} showDaysOutsideCurrentMonth views={['day']} />
                </Stack>
            </LocalizationProvider>
        )
    },
}
