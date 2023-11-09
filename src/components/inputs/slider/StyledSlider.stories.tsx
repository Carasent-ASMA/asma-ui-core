import { Stack, Typography } from '@mui/material'
import type { Meta } from '@storybook/react'
import { StyledSlider } from './StyledSlider'
import { useState, type SyntheticEvent } from 'react'

const meta = {
    title: 'Inputs/Styled Slider',
    component: StyledSlider,
    tags: ['autodocs'],
    argTypes: {},
    args: {
        size: 'medium',
        max: 10,
        min: 1,
        step: 1,
        marks: [
            {
                value: 1,
                label: '1',
            },
            {
                value: 2,
                label: '2',
            },
            {
                value: 3,
                label: '3',
            },
            {
                value: 4,
                label: '4',
            },
            {
                value: 5,
                label: '5',
            },
            {
                value: 6,
                label: '6',
            },
            {
                value: 7,
                label: '7',
            },
            {
                value: 8,
                label: '8',
            },
            {
                value: 9,
                label: '9',
            },
            {
                value: 10,
                label: '10',
            },
        ],
    },
} satisfies Meta<typeof StyledSlider>

export default meta

export const Slider = () => {
    const [value, setValue] = useState<number>(0)

    const handleChange = (_event: Event | SyntheticEvent<Element, Event>, newValue: number | number[]) => {
        setValue(newValue as number)
    }

    return (
        <>
            <Stack mt={2} mb={4} className='w-[700px]'>
                <Typography variant='h6'>Standard Slider</Typography>
                <StyledSlider dataTest='standard-slider' {...meta.args} value={value} onChangeCommitted={handleChange} />
            </Stack>
            <Stack mt={2}>
                <Typography variant='h6'>Disabled Slider</Typography>
                <StyledSlider dataTest='disabled-slider' {...meta.args} disabled value={value} />
            </Stack>
            <Stack mt={2} className='h-[400px]'>
                <Typography variant='h6'>Vertical Slider</Typography>
                <StyledSlider dataTest='vertical-slider' {...meta.args} orientation='vertical' value={value} onChangeCommitted={handleChange} />
            </Stack>
        </>
    )
}
