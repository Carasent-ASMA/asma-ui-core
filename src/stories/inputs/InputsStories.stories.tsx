import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { StyledInputField } from 'src/components/inputs/input-field'
import { StyledFormLabel } from 'src/components/data-display/form-label'

const meta = {
    title: '*/Form Inputs',
    component: StyledInputField,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledInputField>

export default meta

export const FormInputs = (): JSX.Element => {
    return (
        <div>
            <h2>Not filled</h2>
            <StyledFormLabel title='Enabled' size='xl' />
            <div className={'flex max-w-lg flex-col gap-5'}>
                <StyledInputField autoComplete='off' size='small' dataTest='not-filled' />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    label='Not filled - only label'
                />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    placeholder='Not filled - only placeholder'
                />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    label='Not filled - label and placeholder'
                    placeholder='Not filled - label and placeholder'
                />
                <h5>Error</h5>
                <StyledInputField autoComplete='off' size='small' dataTest='not-filled' error />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    error
                    placeholder='Not filled, only placeholder'
                />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    error
                    label='Not filled'
                    placeholder='Not filled'
                />
                <h5>Disabled</h5>
                <StyledInputField autoComplete='off' size='small' dataTest='not-filled' disabled />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    disabled
                    placeholder='Not filled'
                />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    disabled
                    label='Not filled'
                    placeholder='Not filled'
                />
                <h5>Readonly</h5>
                <StyledInputField autoComplete='off' size='small' dataTest='not-filled' readOnly />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    readOnly
                    placeholder='Not filled'
                />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    readOnly
                    label='Not filled'
                    placeholder='Not filled'
                />
            </div>
        </div>
    )
}

/** Every outlined single-line field in the matrix must measure 40px (Figma standard). */
export const FormInputsHeightConsistency: StoryObj<typeof StyledInputField> = {
    render: () => <FormInputs />,
    play: async ({ canvas }) => {
        const shells = canvas.getAllByTestId('not-filled-shell')
        await expect(shells.length).toBeGreaterThan(0)
        for (const shell of shells) {
            await expect(shell.getBoundingClientRect().height).toBe(40)
        }
    },
}
