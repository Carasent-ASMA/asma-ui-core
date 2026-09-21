import { useState, type FormEvent } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledInteractiveChip } from 'src/components/data-display/interactive-chip/StyledInteractiveChip'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'
import { StyledCheckbox } from './checkbox/base-ui/StyledCheckbox'
import { StyledInputField } from './input-field/StyledInputField'
import { StyledRadio } from './radio-button/base-ui/StyledRadio'
import { StyledRadioGroup } from './radio-button/base-ui/StyledRadioGroup'
import { StyledSwitch } from './switch/base-ui/StyledSwitch'
import { StyledTextarea } from './textarea/StyledTextarea'

interface SubmittedValues {
    email: string
    updates: boolean
    enabled: boolean
    topic: boolean
    notes: string
}

const KeyboardOnlyForm = ({ onSubmit }: { onSubmit: (values: SubmittedValues) => void }): JSX.Element => {
    const [email, setEmail] = useState('')
    const [notes, setNotes] = useState('')
    const [updates, setUpdates] = useState(false)
    const [enabled, setEnabled] = useState(false)
    const [topic, setTopic] = useState(false)
    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault()
        onSubmit({ email, updates, enabled, topic, notes })
    }

    return (
        <form onSubmit={submit}>
            <StyledInputField dataTest='email' label='Email' value={email} onChange={event => setEmail(event.target.value)} />
            <StyledFormControlLabel
                label='Receive updates'
                control={<StyledCheckbox dataTest='updates' checked={updates} onChange={(_, next) => setUpdates(next)} />}
            />
            <StyledRadioGroup name='delivery'>
                <StyledFormControlLabel label='Email delivery' control={<StyledRadio dataTest='email-delivery' value='email' />} />
                <StyledFormControlLabel label='Post delivery' control={<StyledRadio dataTest='post-delivery' value='post' />} />
            </StyledRadioGroup>
            <StyledFormControlLabel
                label='Enable reminders'
                control={<StyledSwitch dataTest='reminders' checked={enabled} onChange={(_, next) => setEnabled(next)} />}
            />
            <StyledInteractiveChip
                dataTest='topic'
                label='Product news'
                type='checkbox'
                checked={topic}
                onClick={() => setTopic(!topic)}
            />
            <StyledTextarea
                label='Notes'
                value={notes}
                onChange={event => setNotes(event.target.value)}
            />
            <button type='submit'>Submit</button>
        </form>
    )
}

describe('form controls keyboard-only submission', () => {
    afterEach(cleanup)

    it('completes and submits a form without pointer input (2.1.1)', async () => {
        const onSubmit = fn()
        mount(<KeyboardOnlyForm onSubmit={onSubmit} />)

        await userEvent.tab()
        await userEvent.keyboard('person@example.test')
        await userEvent.tab()
        await userEvent.keyboard(' ')
        await userEvent.tab()
        await userEvent.keyboard('{ArrowDown}')
        await userEvent.tab()
        await userEvent.keyboard(' ')
        await userEvent.tab()
        await userEvent.keyboard(' ')
        await userEvent.tab()
        await userEvent.keyboard('Keyboard-only notes')
        await userEvent.tab()
        await userEvent.keyboard('{Enter}')

        await expect(onSubmit).toHaveBeenCalledTimes(1)
        // Assert the values, not just that Enter submitted: a control that silently ignored its
        // keystroke would still let a call-count-only assertion pass.
        await expect(onSubmit).toHaveBeenCalledWith({
            email: 'person@example.test',
            updates: true,
            enabled: true,
            topic: true,
            notes: 'Keyboard-only notes',
        })
    })
})
