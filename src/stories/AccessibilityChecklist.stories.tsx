import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { StyledMenuItem } from 'src/components/navigation/menu/StyledMenuItem'
import { StyledSelect } from 'src/components/inputs/select/StyledSelect'
import { StyledSelectItem } from 'src/components/inputs/select/StyledSelectItem'
import { StyledSelectAutocomplete } from 'src/components/inputs/select-autocomplete/StyledSelectAutocomplete'
import { StyledInputField } from 'src/components/inputs/input-field/StyledInputField'
import { StyledTextarea } from 'src/components/inputs/textarea/StyledTextarea'
import { StyledCheckbox } from 'src/components/inputs/checkbox'
import { StyledRadio } from 'src/components/inputs/radio-button'
import { StyledSwitch } from 'src/components/inputs/switch'
import { SnackbarProvider } from 'src/components/feedback/snack-bar/SnackbarProvider'
import { message } from 'src/components/feedback/snack-bar/message'
import { StyledSnackbar } from 'src/components/feedback/snack-bar/StyledSnackbar'

const meta = { title: 'Accessibility/Developer checklist', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const pointerActions = { save: fn(), archive: fn(), select: fn(), autocomplete: fn() }

export const PointerCancellation: Story = {
    render: () => (
        <div>
            <StyledButton dataTest='save' onClick={pointerActions.save}>Save</StyledButton>
            <ul role='menu' aria-label='Actions'><StyledMenuItem onClick={pointerActions.archive}>Archive</StyledMenuItem></ul>
            <StyledSelect dataTest='person' name='Person' value='' onChange={pointerActions.select}>
                <StyledSelectItem value='Ada'>Ada</StyledSelectItem>
            </StyledSelect>
            <StyledSelectAutocomplete
                dataTest='autocomplete'
                options={['Ada', 'Grace']}
                value='Ada'
                onChange={pointerActions.autocomplete}
                renderInput={(params) => <StyledInputField {...params} dataTest='search' label='Search people' />}
            />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const body = within(canvasElement.ownerDocument.body)
        Object.values(pointerActions).forEach((action) => action.mockClear())
        for (const [control, action] of [
            [canvas.getByRole('button', { name: 'Save' }), pointerActions.save],
            [canvas.getByRole('menuitem'), pointerActions.archive],
        ] as const) {
            await userEvent.pointer({ target: control, keys: '[MouseLeft>]' })
            await expect(action).not.toHaveBeenCalled()
            await userEvent.pointer({ target: canvasElement, keys: '[/MouseLeft]' })
            await expect(action).not.toHaveBeenCalled()
            await userEvent.click(control)
            await expect(action).toHaveBeenCalledTimes(1)
        }
        const select = canvas.getByRole('combobox', { name: 'Person' })
        await userEvent.pointer({ target: select, keys: '[MouseLeft>]' })
        await expect(select).toHaveAttribute('aria-expanded', 'false')
        await userEvent.pointer({ target: canvasElement, keys: '[/MouseLeft]' })
        await userEvent.click(select)
        const option = await body.findByRole('option', { name: 'Ada' })
        await userEvent.pointer({ target: option, keys: '[MouseLeft>]' })
        await expect(select).toHaveAttribute('aria-expanded', 'true')
        await userEvent.pointer({ target: canvasElement, keys: '[/MouseLeft]' })
        await expect(pointerActions.select).not.toHaveBeenCalled()
        await userEvent.keyboard('{Escape}')
        await userEvent.click(select)
        await userEvent.click(await body.findByRole('option', { name: 'Ada' }))
        await expect(pointerActions.select).toHaveBeenCalledTimes(1)

        const input = canvas.getByRole('combobox', { name: 'Search people' })
        input.focus()
        await expect(input).toHaveFocus()
        const clear = canvas.getByRole('button', { name: 'Clear' })
        await userEvent.pointer({ target: clear, keys: '[MouseLeft>]' })
        await expect(input).toHaveValue('Ada')
        await userEvent.pointer({ target: canvasElement, keys: '[/MouseLeft]' })
        await expect(input).toHaveValue('Ada')
        await expect(pointerActions.autocomplete).not.toHaveBeenCalled()
        clear.focus()
        await userEvent.keyboard('{Enter}')
        await expect(input).toHaveValue('')
        await expect(pointerActions.autocomplete).toHaveBeenCalledTimes(1)
        const toggle = canvas.getByRole('button', { name: 'Toggle options' })
        await userEvent.keyboard('{Escape}')
        await userEvent.pointer({ target: toggle, keys: '[MouseLeft>]' })
        await expect(toggle).toHaveAttribute('aria-expanded', 'false')
        await userEvent.pointer({ target: canvasElement, keys: '[/MouseLeft]' })
        toggle.focus()
        await userEvent.keyboard('{Enter}')
        await expect(toggle).toHaveAttribute('aria-expanded', 'true')
        await userEvent.keyboard('{Escape}')
    },
}

export const LabelInName: Story = {
    render: () => (
        <div>
            <StyledButton dataTest='save' aria-label='Save patient'>Save</StyledButton>
            <StyledInputField dataTest='email' label='Email' value='ada@example.com' onChange={fn()} slotProps={{ htmlInput: { 'aria-label': 'Email address' } }} />
            <StyledTextarea label='Notes' aria-label='Notes about patient' onChange={fn()} />
            <span id='consent-label'>Consent</span><StyledCheckbox dataTest='consent' aria-labelledby='consent-label' aria-label='Consent to contact' />
            <span id='phone-label'>Phone</span><StyledRadio aria-labelledby='phone-label' aria-label='Phone contact' />
            <span id='alerts-label'>Alerts</span><StyledSwitch aria-labelledby='alerts-label' aria-label='Alerts enabled' />
            <span id='person-label'>Person</span>
            <StyledSelect dataTest='person-label-test' labelId='person-label' value='Ada'>
                <StyledSelectItem value='Ada'>Ada</StyledSelectItem>
            </StyledSelect>
            <StyledSelectAutocomplete dataTest='city' options={['Oslo']} value='Oslo' renderInput={(params) => (
                <StyledInputField {...params} dataTest='city-input' label='City' slotProps={{
                    ...params.slotProps,
                    htmlInput: { ...params.slotProps.htmlInput, 'aria-label': 'City of residence' },
                }} />
            )} />
        </div>
    ),
    play: async ({ canvasElement }) => {
        // Autocomplete populates its input after mount; let the 150ms label color transition settle before axe.
        await new Promise((resolve) => setTimeout(resolve, 250))
        const canvas = within(canvasElement)
        for (const [role, label] of [
            ['button', 'Save'], ['textbox', 'Email'], ['textbox', 'Notes'],
            ['checkbox', 'Consent'], ['radio', 'Phone'], ['switch', 'Alerts'],
            ['combobox', 'Person'], ['combobox', 'City'],
        ] as const) {
            await expect(canvas.getByRole(role, { name: new RegExp(label) })).toHaveAccessibleName(new RegExp(label))
        }
    },
}

const TimingExample = () => {
    const [open, setOpen] = useState(false)
    return <>
        <button type='button' onClick={() => setOpen(true)}>Show notification</button>
        <StyledSnackbar open={open} autoHideDuration={300} onClose={() => setOpen(false)}
            message='Saved' action={<button type='button'>Undo</button>} />
    </>
}

export const TimingAdjustable: Story = {
    render: () => <TimingExample />,
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body)
        await userEvent.click(within(canvasElement).getByRole('button', { name: 'Show notification' }))
        const undo = await body.findByRole('button', { name: 'Undo' })
        undo.focus()
        await userEvent.hover(undo)
        await new Promise((resolve) => setTimeout(resolve, 450))
        await expect(undo).toBeVisible()
        await userEvent.unhover(undo)
        await new Promise((resolve) => setTimeout(resolve, 450))
        await expect(undo).toBeVisible()
        undo.blur()
        await waitFor(() => expect(body.queryByRole('button', { name: 'Undo' })).toBeNull())
    },
}

export const UntimedNotifications: Story = {
    render: () => <SnackbarProvider autoHideDuration={null}>
        <button type='button' onClick={() => message.info('Persistent provider message', { closeButton: true })}>Notify</button>
        <StyledSnackbar open autoHideDuration={null} message='Persistent standalone message' />
    </SnackbarProvider>,
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body)
        await userEvent.click(within(canvasElement).getByRole('button', { name: 'Notify' }))
        await body.findByText('Persistent provider message')
        // Exceeds both legacy defaults (standalone 3s, provider/helper 6s).
        await new Promise((resolve) => setTimeout(resolve, 6500))
        await expect(body.getByText('Persistent provider message')).toBeVisible()
        await expect(body.getByText('Persistent standalone message')).toBeVisible()
        await userEvent.click(body.getByRole('button', { name: 'Close' }))
        await waitFor(() => expect(body.queryByText('Persistent provider message')).toBeNull())
    },
}
