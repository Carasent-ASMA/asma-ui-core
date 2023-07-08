import { Box, Typography as MuiTypography } from '@mui/material'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
    title: 'DataDisplay/Styled Typography',
    component: MuiTypography,
    tags: ['autodocs'],
    argTypes: {},
} satisfies Meta<typeof MuiTypography>

export default meta
type Story = StoryObj<typeof meta>

export const Typography: Story = {
    args: { ...meta.argTypes },
    render: () => <BasicTypography />,
}

const BasicTypography = () => {
    return (
        <>
            <Box mb={4}>
                <MuiTypography variant='h1'>MUI Typography variants</MuiTypography>
                <MuiTypography variant='h1'>H1 - Page title (variant="h1")</MuiTypography>
                <MuiTypography variant='h2'>H2 - Section title (variant="h2")</MuiTypography>
                <MuiTypography>Base - (variant="body", default)</MuiTypography>
                <MuiTypography variant='caption'>Caption - caption (variant="caption")</MuiTypography>
            </Box>

            <Box mb={2}>
                <MuiTypography variant='h1'>Tailwind Typography variants</MuiTypography>

                <h1 className='text-h1'>H1 - Page title - (text-h1)</h1>
                <h2 className='text-h2'>H2 - Section title - (text-h2)</h2>
                <div className='text-base'>text-base (Standard no class)</div>
                <div className='text-small'>text-small (text-small)</div>
                <div className='text-xSmall'>text-xSmall (text-xSmall)</div>
            </Box>
        </>
    )
}
