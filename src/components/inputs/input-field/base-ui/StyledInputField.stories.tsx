import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { StyledInputField } from './StyledInputField'
import { ErrorOutlineIcon, PlusIconCircle } from 'src/components/icons'

const meta: Meta<typeof StyledInputField> = {
    title: 'Base-ui/Styled Input Field',
    component: StyledInputField,
    tags: [],
    argTypes: {},
    args: {},
}

export default meta

export const Inputs = () => (
    <div className='flex flex-col gap-12'>
        {/* standart */}
        <StyledInputField
            dataTest='test'
            value='gfdgrgfdgr. gfdgrgfdgr vgfdgrgfdgr gfdgrgfdgr gfdgrgfdgr gfdgrgfdgr gfdgrgfdgr gfdgrgfdgr gfdgrgfdgr gfdgrgfdgr gfdgrgfdgr '
            onChange={() => undefined}
            label='Label text'
            multiline
            helperText={'Some helper text'}
            error
            // maxRows={5}
        />

        <StyledInputField
            dataTest='test'
            size='small'
            {...meta.args}
            onChange={() => undefined}
            value='Hello World'
            placeholder='Label text'
            label='Label text'
            InputProps={{
                endAdornment: (
                    <div className='flex items-center justify-between gap-2'>
                        <PlusIconCircle height={24} width={24} />
                        <ErrorOutlineIcon height={24} width={24} />
                    </div>
                ),
            }}
        />
        <StyledInputField
            dataTest='test'
            {...meta.args}
            placeholder='Label text'
            label='Label text'
            size='small'
            autoFocus
        />
        <StyledInputField
            variant='standard'
            dataTest='test'
            {...meta.args}
            onChange={() => undefined}
            value='bhjbhjbhbh'
            placeholder='Label text'
            label='Label text'
            error
            helperText={'Some helper text'}
            FormHelperTextProps={{ className: 'absolute top-12' }}
        />
        <StyledInputField
            variant='standard'
            dataTest='test'
            {...meta.args}
            placeholder='Label text'
            label='Label text'
        />
        <StyledInputField
            variant='standard'
            dataTest='test'
            {...meta.args}
            value='fdsae'
            placeholder='Label text'
            label='Label text'
            readOnly
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
            value={323}
            label='number'
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
            value=''
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
            label='Error label text'
            required
        />
    </div>
)
