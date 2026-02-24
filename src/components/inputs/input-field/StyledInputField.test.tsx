import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { StyledInputField } from './StyledInputField'

describe('StyledInputField', () => {
    it('renders label and value', () => {
        render(<StyledInputField dataTest='input' label='Name' value='Sebastian' onChange={() => {}} />)

        expect(screen.getByLabelText('Name')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Sebastian')).toBeInTheDocument()
    })

    it('renders helper text', () => {
        render(
            <StyledInputField dataTest='input' label='Email' helperText='Enter email' value='' onChange={() => {}} />,
        )

        expect(screen.getByText('Enter email')).toBeInTheDocument()
    })

    it('renders default Required when error and no helperText', () => {
        render(<StyledInputField dataTest='input' label='Email' error value='' onChange={() => {}} />)

        expect(screen.getByText('Required')).toBeInTheDocument()
    })

    it('does not render helper text when readOnly', () => {
        render(
            <StyledInputField
                dataTest='input'
                label='Email'
                error
                readOnly
                helperText='Error'
                value='test'
                onChange={() => {}}
            />,
        )

        expect(screen.queryByText('Error')).not.toBeInTheDocument()
    })

    it('renders clear button when allowClear and value exists', () => {
        render(<StyledInputField dataTest='input' label='Name' allowClear value='Hello' onChange={() => {}} />)

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('calls onClear when clear button clicked', async () => {
        const user = userEvent.setup()
        const onClear = vi.fn()

        render(
            <StyledInputField
                dataTest='input'
                label='Name'
                allowClear
                value='Hello'
                onClear={onClear}
                onChange={() => {}}
            />,
        )

        await user.click(screen.getByRole('button'))
        expect(onClear).toHaveBeenCalledTimes(1)
    })

    it('is disabled when readOnly=true', () => {
        render(<StyledInputField dataTest='input' label='Name' readOnly value='Hello' onChange={() => {}} />)

        const input = screen.getByLabelText('Name')
        expect(input).toBeDisabled()
    })
})
