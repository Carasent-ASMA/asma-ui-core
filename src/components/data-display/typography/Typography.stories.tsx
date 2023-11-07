import { Box } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { StyledTypography } from './StyledTypography'

const meta = {
    title: 'DataDisplay/Styled Typography',
    component: StyledTypography,
    tags: ['autodocs'],
    argTypes: {},
} satisfies Meta<typeof StyledTypography>

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
                <StyledTypography dataTest='mui-typography-variants'>MUI Typography variants</StyledTypography>
                <StyledTypography dataTest='h1-page-title' variant='h1'>H1 - Page title (variant="h1")</StyledTypography>
                <StyledTypography dataTest='h2-section-title' variant='h2'>H2 - Section title (variant="h2")</StyledTypography>
                <StyledTypography dataTest='base'>Base - (variant="body", default)</StyledTypography>
                <StyledTypography dataTest='caption' variant='caption'>Caption - caption (variant="caption")</StyledTypography>
            </Box>

            <Box mb={2}>
                <StyledTypography dataTest='tailwind-typography-variants'>Tailwind Typography variants</StyledTypography>

                <h1 className='text-2xl'>H1 - Page title - (text-2xl)</h1>
                <h2 className='text-xl'>H2 - Section title - (text-xl)</h2>
                <div className='text-base'>text-base (Standard no class)</div>
                <div className='text-sm'>text-sm (text-sm)</div>
                <div className='text-xs'>text-xs (text-xs)</div>
            </Box>
        </>
    )
}
