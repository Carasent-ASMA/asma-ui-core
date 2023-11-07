import React, { useState } from 'react'
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
    const [value, setValue] = useState('')
    return (
        <div className='flex flex-col w-full gap-12'>
            <StyledInputField
                size='small'
                {...meta.args}
                onChange={(e) => setValue(e.target.value)}
                value={value}
                label='Label text'
                dataTest='input-field-1'
            />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Small label text'
                size='small'
                dataTest='input-field-2'
            />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label=''
                size='small'
                dataTest='input-field-3'
            />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Error label text'
                error
                dataTest='input-field-4'
            />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Small label text'
                size='small'
                error
                dataTest='input-field-5'
            />

            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label=''
                size='small'
                error
                dataTest='input-field-6'
            />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Required text'
                error
                helperText={'Required field'}
                dataTest='input-field-7'
            />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Small required text'
                size='small'
                error
                helperText={'Required field'}
                dataTest='input-field-8'
            />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label=''
                size='small'
                error
                helperText={'Required field'}
                dataTest='input-field-9'
            />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                label='Disabled'
                disabled
                dataTest='input-field-10'
            />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                disabled
                label='Small disabled'
                size='small'
                dataTest='input-field-11'
            />
            <StyledInputField
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                disabled
                label=''
                size='small'
                dataTest='input-field-12'
            />
        </div>
    )
}
