import React from 'react'
import type { Meta } from '@storybook/react'

import { StyledInputField } from '../StyledInputField'

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
            <StyledInputField
                dataTest='test'
                {...meta.args}
                onChange={() => undefined}
                value=''
                placeholder='Label text'
                label='Label text'
            />
            <StyledInputField
                dataTest='test'
                {...meta.args}
                onChange={() => undefined}
                value=''
                placeholder='Label text'
                label='Label text'
                size='small'
            />
            <StyledInputField
                variant='standard'
                dataTest='test'
                {...meta.args}
                onChange={() => undefined}
                value=''
                placeholder='Label text'
                label='Label text'
            />
            <StyledInputField
                dataTest='test'
                variant='standard'
                disabled
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Small label text'
                size='small'
            />
            <StyledInputField
                dataTest='test'
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label=''
                size='small'
            />
            <StyledInputField
                dataTest='test'
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Error label text'
                error
            />
            <StyledInputField
                dataTest='test'
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Small label text'
                size='small'
                error
            />

            <StyledInputField
                dataTest='test'
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label=''
                size='small'
                error
            />
            <StyledInputField
                dataTest='test'
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Required text'
                error
                helperText={'Required field'}
            />
            <StyledInputField
                dataTest='test'
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Small required text'
                size='small'
                error
                helperText={'Required field'}
            />
            <StyledInputField
                dataTest='test'
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label=''
                size='small'
                error
                helperText={'Required field'}
            />
            <StyledInputField
                dataTest='test'
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Disabled'
                disabled
            />
            <StyledInputField
                dataTest='test'
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                disabled
                label='Small disabled'
                size='small'
            />
            <StyledInputField
                dataTest='test'
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                disabled
                label=''
                size='small'
            />
            <StyledInputField
                dataTest='test'
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Read only'
                readOnly
            />
            <StyledInputField
                dataTest='test'
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                readOnly
                label='Small read only'
                size='small'
            />
            <StyledInputField
                dataTest='test'
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                readOnly
                label=''
                size='small'
            />
        </div>
    )
}
