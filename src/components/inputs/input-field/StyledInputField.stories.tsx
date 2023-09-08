import React from 'react'
import type { Meta } from '@storybook/react'

import { Stack } from '@mui/material'
import { StyledInputField } from './StyledInputField'
import { Icon } from '@iconify/react'
import { StyledButton } from '../button'

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
        <Stack direction='column' spacing={4}>
            <StyledInputField {...meta.args} label='Label text' />
            <StyledInputField {...meta.args} label='Active' value='Generated text' />
            <StyledInputField {...meta.args} error label='Error' />
            <StyledInputField {...meta.args} disabled label='Disabled' />
            <StyledInputField {...meta.args} readOnly label='Not editable' value='Input text' />
        </Stack>
        <Stack direction='column' spacing={3} mt={4} maxWidth={214}>
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
            <StyledInputField
                {...meta.args}
                size='small'
                type='search'
                label=''
                helperText='booga'
                startAdornment={null}
            />
            <StyledInputField {...meta.args} label='' helperText='' startAdornment={null} endAdornment={null} />
        </Stack>
    </>
)

export const MultiLineInputField = () => {
    const [text, setText] = React.useState(
        'Lorem ipsum dolor sit amet, ne sea eius verterem, facilis epicurei vis ut, omnis utinam in pro. Id corpora periculis scripserit sed, pro ne perfecto gubergren, his munere nullam civibus id. In duo vocent aliquando, eos ne omnium. Lorem ipsum dolor sit amet, ne sea eius verterem, facilis epicurei vis ut, omnis utinam in pro. Id corpora periculis scripserit sed, pro ne perfecto gubergren, his munere nullam civibus id. In duo vocent aliquando, eos ne omnium Lorem ipsum dolor sit amet, ne sea eius verterem, facilis epicurei vis ut, omnis utinam in pro. Id corpora periculis scripserit sed, pro ne perfecto gubergren, his munere nullam civibus id. In duo vocent aliquando, eos ne omnium',
    )

    return (
        <Stack direction='column' spacing={4}>
            <StyledInputField
                multiline
                label='Label text'
                descriptionMessage='Description message'
                placeholder='Placeholder text'
            />
            <StyledInputField
                counter
                multiline
                characterLimit={1000}
                minRows={3}
                label='Active'
                descriptionMessage='Description message'
                placeholder='Placeholder text'
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <StyledInputField
                multiline
                minRows={2}
                error
                label='Error'
                descriptionMessage='Description message'
                placeholder='Placeholder text'
                helperText='0/1000'
            />
            <StyledInputField
                multiline
                minRows={2}
                disabled
                label='Disabled'
                descriptionMessage='Description message'
                placeholder='Placeholder text'
                helperText='0/1000'
            />
            <StyledInputField
                multiline
                minRows={2}
                readOnly
                label='Not editable'
                descriptionMessage='Description message'
                placeholder='Placeholder text'
                value='Input text'
                helperText='0/1000'
            />
        </Stack>
    )
}

export const InputFieldValidation = () => {
    const [text, setText] = React.useState('')
    const [textNumeric, setTextNumeric] = React.useState('')

    return (
        <Stack direction='column' spacing={4}>
            <StyledInputField
                characterLimit={15}
                label='Label text'
                placeholder='Placeholder text'
                value={text}
                onChange={(e) => setText(e.target.value)}
                error={text.length < 5}
                helperText={text.length < 5 ? 'Text must be at least 5 characters' : 'Description message'}
            />

            <StyledInputField
                required
                characterLimit={15}
                label='Label text'
                placeholder='Placeholder text'
                value={textNumeric}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                onChange={(e) => {
                    setTextNumeric(e.target.value)
                }}
            />
        </Stack>
    )
}

export const InputHelperTextHeight = () => {
    return (
        <>
            <Stack direction='row' alignItems='end' mt={2} mb={4} spacing={4}>
                <StyledInputField
                    {...meta.args}
                    label='Uses align items end with helper text'
                    helperText='With helper text'
                />
                <StyledButton variant='contained'>Button</StyledButton>
            </Stack>

            <Stack direction='row' alignItems='center' mt={5} spacing={4}>
                <StyledInputField
                    {...meta.args}
                    label='Uses align items center with helper text'
                    helperText='test'
                    size='small'
                />
                <StyledButton variant='contained'>Button</StyledButton>
            </Stack>

            <Stack direction='row' alignItems='center' mt={4} mb={4} spacing={4}>
                <StyledInputField {...meta.args} helperText='With helper text' label='' />
                <StyledButton variant='contained'>Button</StyledButton>
            </Stack>

            <Stack direction='row' alignItems='center' mt={4} spacing={4}>
                <StyledInputField {...meta.args} label='' helperText='test' size='small' />
                <StyledButton variant='contained'>Button</StyledButton>
            </Stack>

            <Stack direction='row' alignItems='end' mt={5} mb={4} spacing={4}>
                <StyledInputField {...meta.args} label='Uses align items end' helperText='' />
                <StyledButton variant='contained'>Button</StyledButton>
            </Stack>
        </>
    )
}
