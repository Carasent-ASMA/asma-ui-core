import React from 'react'
import type { Meta } from '@storybook/react'

import { IconButton, InputAdornment, Stack, TextField } from '@mui/material'
import { StyledInputField } from './StyledInputField'
import clsx from 'clsx'
import { Icon } from '@iconify/react'

const meta = {
    title: 'Inputs/Styled InputField',
    component: StyledInputField,
    tags: ['autodocs'],
    argTypes: {},
    args: {
        label: 'Label',
        helperText: 'Helper text',
        placeholder: 'Placeholder text',
        startAdornment: <Icon icon='mdi:account-outline' width={24} height={24} />,
        endAdornment: <Icon icon='mdi:magnify' width={24} height={24} />,
    },
} satisfies Meta<typeof StyledInputField>

export default meta

export const InputField = () => (
    <>
        <Stack direction='column' spacing={2}>
            <StyledInputField {...meta.args} label='Default' />
            <StyledInputField
                {...meta.args}
                error
                label='Start InputAdornment'
            />
            <StyledInputField
                {...meta.args}
                disabled
                label='End InputAdornment'
            />
        </Stack>
        <Stack direction='row' spacing={4} mt={4}>
            <StyledInputField {...meta.args} label='Full width' />

            <TextField
                size='small'
                label='Name'
                InputLabelProps={{
                    classes: {
                        root: clsx('text-medium text-delta-800 font-semibold'),
                        error: clsx('!text-error-700'),
                        disabled: clsx('!text-delta-300'),
                    },
                }}
                classes={{
                    root: `[&_fieldset]:!border-delta-500`,
                }}
            />
        </Stack>
    </>
)
