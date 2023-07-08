import React from 'react'
import type { Meta } from '@storybook/react'

import { IconButton, InputAdornment, Stack } from '@mui/material'
import { StyledTextField } from './StyledTextField'

const meta = {
    title: 'Inputs/Styled TextField',
    component: StyledTextField,
    tags: ['autodocs'],
    argTypes: {},
    args: { label: 'Label' },
} satisfies Meta<typeof StyledTextField>

export default meta

export const TextField = () => (
    <>
        <Stack direction='row' spacing={2}>
            <StyledTextField {...meta.args} label='Default' />
            <StyledTextField
                {...meta.args}
                label='Start InputAdornment'
                InputProps={{
                    startAdornment: <InputAdornment position='start'>kg</InputAdornment>,
                }}
            />
            <StyledTextField
                {...meta.args}
                label='End InputAdornment'
                InputProps={{
                    endAdornment: (
                        <InputAdornment position='end'>
                            <IconButton aria-label='toggle password visibility' edge='end'>
                                X
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                placeholder='Password'
            />
        </Stack>
        <Stack direction='row' mt={4}>
            <StyledTextField {...meta.args} label='Full width' FormControlProps={{ fullWidth: true }} />
        </Stack>
    </>
)
