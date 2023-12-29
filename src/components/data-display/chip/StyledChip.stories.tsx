import React from 'react'
import type { Meta } from '@storybook/react'
import { StyledChip } from './StyledChip'
import { Stack } from '@mui/material'

const meta: Meta = {
    title: 'DataDisplay/Styled Chip',
    component: StyledChip,
    tags: ['autodocs'],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledChip>

export default meta

export const Chip = () => {
    const handleClick = () => {
        console.info('You clicked the Chip.')
    }

    const handleDelete = () => {
        console.info('You clicked the delete icon.')
    }

    return (
        <Stack direction='column' spacing={2}>
            <Stack direction='row' spacing={1}>
                <StyledChip dataTest='chip-filled' label='Chip Filled' />
                <StyledChip dataTest='chip-outlined' label='Chip Outlined' variant='outlined' />
            </Stack>
            <Stack direction='row' spacing={1}>
                <StyledChip dataTest='chip-clickable' label='Clickable' onClick={handleClick} />
                <StyledChip
                    dataTest='chip-clickable-outlined'
                    label='Clickable'
                    variant='outlined'
                    onClick={handleClick}
                />
            </Stack>
            <Stack direction='row' spacing={1}>
                <StyledChip dataTest='chip-deletable' label='Deletable' onDelete={handleDelete} />
                <StyledChip
                    dataTest='chip-deletable-outlined'
                    label='Deletable'
                    variant='outlined'
                    onDelete={handleDelete}
                />
            </Stack>
            <Stack direction='row' spacing={1}>
                <StyledChip
                    dataTest='chip-hover'
                    className='bg-gama-500 text-white text-sm hover:bg-gama-600'
                    label='Styled Hover Chip'
                />
                <StyledChip
                    dataTest='chip-hover-outlined'
                    className='border-delta-500 text-delta-700 hover:border-delta-700 hover:bg-gama-50'
                    label='Styled Hover Chip'
                    variant='outlined'
                />
            </Stack>
        </Stack>
    )
}
