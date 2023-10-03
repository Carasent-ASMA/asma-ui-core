import React, { useState, type ChangeEvent } from 'react'
import type { Meta } from '@storybook/react'

import { Icon } from '@iconify/react'
import { StyledInput } from './StyledInput'
import { StyledButton } from 'src/components/inputs/button/StyledButton'

const meta = {
    title: 'Inputs/Styled Input',
    component: StyledInput,
    tags: ['autodocs'],
    argTypes: {},
    args: {
        label: 'Label',
        placeholder: 'Placeholder text',
        startIcon: <Icon icon='mdi:account-outline' width={24} height={24} />,
        endIcon: <Icon icon='mdi:magnify' width={24} height={24} />,
        descriptionMessage: 'Description message',
        required: false,
        value: '',
        type: 'text',
        id: '',
        dataTest: '',
        size: 'large',
        className: '',
    },
} satisfies Meta<typeof StyledInput>

export default meta
export const Inputs = () => {
    const [inputText, setInputText] = useState('some test text')

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value)
    }
    const showDescription = inputText.length < 5
    return (
        <div className='flex flex-col w-full gap-12'>
            <StyledInput {...meta.args} onChange={handleInputChange} value={inputText} label='Label text' />
            <StyledInput
                {...meta.args}
                onChange={handleInputChange}
                value={inputText}
                error={inputText.length < 5}
                label='Error'
                descriptionMessage={showDescription ? 'Error message' : ''}
            />
            <StyledInput
                onChange={handleInputChange}
                value={inputText}
                disabled
                label='Disabled'
                descriptionMessage='Disabled message'
            />
            <StyledInput
                {...meta.args}
                onChange={handleInputChange}
                value={inputText}
                notEditable
                label='Not editable'
                descriptionMessage='Not editable message'
            />
            <StyledInput
                {...meta.args}
                onChange={handleInputChange}
                value={inputText}
                readOnly
                label='Read only'
                descriptionMessage='Read only message'
            />
            <StyledInput
                onChange={handleInputChange}
                value={inputText}
                label='small input'
                dataTest='123'
                size='small'
            />
            <div className='flex gap-2 items-center justify-center'>
                <StyledInput
                    onChange={handleInputChange}
                    placeholder='StyledInput'
                    value={inputText}
                    dataTest='StyledInput'
                />
                <StyledButton>Button Example</StyledButton>
            </div>
            <div className='flex gap-2 items-center justify-center bg-green-50 p-5'>
                <StyledInput
                    onChange={handleInputChange}
                    placeholder='StyledInput'
                    value={inputText}
                    dataTest='StyledInput'
                    size='small'
                />
                <StyledButton size='small'>Button Example Small</StyledButton>
            </div>
            <div className='flex gap-2 w-[500px]  relative bg-yellow-50 p-5'>
                <StyledInput
                    onChange={handleInputChange}
                    placeholder='Small input'
                    value={inputText}
                    dataTest='StyledInput'
                    size='small'
                    error
                    // descriptionMessage='Describe me'
                    label='Small with error'
                    className='flex flex-auto w-full'
                />
                <StyledButton size='small'>Button Example Small</StyledButton>
            </div>
            <div className='flex gap-2 w-[500px]  relative bg-green-50'>
                <StyledInput
                    onChange={handleInputChange}
                    placeholder='StyledInput'
                    value={inputText}
                    dataTest='StyledInput'
                    error
                    descriptionMessage='Describe me'
                    label='ewfwefwe'
                    endIcon={<Icon icon='mdi:magnify' width={24} height={24} />}
                />
                <StyledButton>Button Example Small</StyledButton>
            </div>
            <StyledInput
                onChange={handleInputChange}
                placeholder='StyledInput'
                value={inputText}
                dataTest='StyledInput'
                disabled={!!inputText}
                size='small'
                error
                descriptionMessage='Describe me'
                label='ewfwefwe'
                endIcon={<Icon icon='mdi:magnify' width={24} height={24} />}
            />
        </div>
    )
}
