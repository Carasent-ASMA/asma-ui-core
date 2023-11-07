import React from 'react'
import type { Meta } from '@storybook/react'

import { StyledInputField } from './StyledInputField'

const meta = {
    title: 'Inputs/Styled Input Field',
    component: StyledInputField,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledInputField>

export default meta
export const Inputs = () => {
    return (
        <div className='flex flex-col w-full gap-12'>
            <StyledInputField {...meta.args} onChange={() => undefined} value='Hello World' label='Label text' />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Small label text'
                size='small'
            />
            <StyledInputField {...meta.args} onChange={() => undefined} value='Hello World' label='' size='small' />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Error label text'
                error
            />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Small label text'
                size='small'
                error
            />

            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label=''
                size='small'
                error
            />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Required text'
                error
                helperText={'Required field'}
            />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Small required text'
                size='small'
                error
                helperText={'Required field'}
            />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label=''
                size='small'
                error
                helperText={'Required field'}
            />
            <StyledInputField {...meta.args} onChange={() => undefined} value='Hello World' label='Disabled' disabled />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                disabled
                label='Small disabled'
                size='small'
            />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                disabled
                label=''
                size='small'
            />
        </div>
    )
}
