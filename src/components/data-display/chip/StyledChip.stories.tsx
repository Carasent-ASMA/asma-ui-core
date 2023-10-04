import React from 'react'
import type { Meta } from '@storybook/react'
import { StyledChip } from './StyledChip'
import { Stack } from '@mui/material'

const meta = {
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
        <Stack direction="column" spacing={2}>
            <Stack direction="row" spacing={1}>
                <StyledChip label="Chip Filled" />
                <StyledChip label="Chip Outlined" variant="outlined" />
            </Stack>
            <Stack direction="row" spacing={1}>
                <StyledChip label="Clickable" onClick={handleClick} />
                <StyledChip label="Clickable" variant="outlined" onClick={handleClick} />
            </Stack>
            <Stack direction="row" spacing={1}>
                <StyledChip label="Deletable" onDelete={handleDelete} />
                <StyledChip label="Deletable" variant="outlined" onDelete={handleDelete} />
            </Stack>
            <Stack direction="row" spacing={1}>
                <StyledChip
                    className='bg-gama-500 text-white text-sm hover:bg-gama-600'
                    label="Styled Hover Chip"
                />
                <StyledChip
                    className='border-delta-500 text-delta-700 hover:border-delta-700 hover:bg-gama-50'
                    label="Styled Hover Chip"
                    variant="outlined"
                />
            </Stack>
        </Stack>
    )
}

