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
        description: 'Description message',
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
                description={showDescription ? 'Error message' : ''}
            />
            <StyledInput
                onChange={handleInputChange}
                value={inputText}
                disabled
                label='Disabled'
                description='Disabled message'
            />
            <StyledInput
                {...meta.args}
                onChange={handleInputChange}
                value={inputText}
                notEditable
                label='Not editable'
                description='Not editable message'
            />
            <StyledInput
                {...meta.args}
                onChange={handleInputChange}
                value={inputText}
                readOnly
                label='Read only'
                description='Read only message'
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
                <StyledButton dataTest='test'>Button Example</StyledButton>
            </div>
            <div className='flex gap-2 items-center justify-center bg-green-50 p-5'>
                <StyledInput
                    onChange={handleInputChange}
                    placeholder='StyledInput'
                    value={inputText}
                    dataTest='StyledInput'
                    size='small'
                />
                <StyledButton dataTest='test' size='small'>
                    Button Example Small
                </StyledButton>
            </div>
            <div className='flex gap-2 w-[500px]  relative bg-yellow-50 p-5'>
                <StyledInput
                    onChange={handleInputChange}
                    placeholder='Small input'
                    value={inputText}
                    dataTest='StyledInput'
                    size='small'
                    error
                    // description='Describe me'
                    label='Small with error'
                    className='flex flex-auto w-full'
                />
                <StyledButton dataTest='test' size='small'>
                    Button Example Small
                </StyledButton>
            </div>
            <div className='flex gap-2 w-[500px]  relative bg-green-50'>
                <StyledInput
                    onChange={handleInputChange}
                    placeholder='StyledInput'
                    value={inputText}
                    dataTest='StyledInput'
                    disabled={true}
                    error={false}
                    description='Describe me'
                    label='Pali Pali'
                    endIcon={<Icon icon='mdi:magnify' width={24} height={24} />}
                />
                <StyledButton dataTest='test'>Button Example Small</StyledButton>
            </div>
            <StyledInput
                onChange={handleInputChange}
                placeholder='StyledInput'
                value={inputText}
                dataTest='StyledInput'
                disabled={!!inputText}
                size='small'
                error={false}
                description='Describe me'
                label='ewfwefwe'
                endIcon={<Icon icon='mdi:magnify' width={24} height={24} />}
            />
        </div>
    )
}
