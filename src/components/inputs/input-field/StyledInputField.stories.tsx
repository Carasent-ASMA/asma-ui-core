import React from 'react'
import type { Meta } from '@storybook/react'

import { Stack } from '@mui/material'
import { StyledInputField } from './StyledInputField'
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
            <StyledInputField {...meta.args} label='Label text' />
            <StyledInputField {...meta.args} label='Active' value='Generated text' />
            <StyledInputField {...meta.args} error label='Error' />
            <StyledInputField {...meta.args} disabled label='Disabled' />
            <StyledInputField {...meta.args} readOnly label='Not editable' value='Input text' />
        </Stack>
        <Stack direction='column' spacing={2} mt={4} maxWidth={214}>
            <StyledInputField {...meta.args} size='small' label='Enabled small' />
            <StyledInputField
                {...meta.args}
                label='End adornment'
                helperText=''
                placeholder='Placeholder long text'
                startAdornment={null}
            />
            <StyledInputField
                {...meta.args}
                label='Start adornment'
                helperText=''
                placeholder='Placeholder long text'
                endAdornment={null}
            />
            <StyledInputField
                {...meta.args}
                label=''
                helperText=''
                placeholder='Placeholder long text'
                startAdornment={null}
            />
            <StyledInputField
                {...meta.args}
                label=''
                helperText=''
                placeholder='Placeholder long text'
                endAdornment={null}
            />
            <StyledInputField {...meta.args} size='small' type='search' label='' helperText='' startAdornment={null} />
            <StyledInputField {...meta.args} label='' helperText='' startAdornment={null} endAdornment={null} />
        </Stack>
    </>
)
