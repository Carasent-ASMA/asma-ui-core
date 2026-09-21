import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTextarea } from './StyledTextarea'

const TextareaFixture = (): JSX.Element => {
    const [value, setValue] = useState('')
    return (
        <StyledTextarea
            dataTest='notes'
            label='Notes'
            description='Add any relevant details'
            value={value}
            onChange={event => setValue(event.target.value)}
        />
    )
}

describe('StyledTextarea keyboard contract', () => {
    afterEach(cleanup)

    it('is reached by Tab, named by its visible label, and describes its helper text (2.1.1, 4.1.2)', async () => {
        const { container } = mount(<TextareaFixture />)
        const textarea = container.querySelector<HTMLTextAreaElement>('textarea')!

        await expect(textarea).toHaveAccessibleName('Notes')
        await expect(textarea).toHaveAttribute('aria-describedby')
        await expect(document.getElementById(textarea.getAttribute('aria-describedby')!)).toHaveTextContent(
            'Add any relevant details',
        )
        await userEvent.tab()
        await expect(document.activeElement).toBe(textarea)
        await userEvent.keyboard('Keyboard entry')
        await expect(textarea).toHaveValue('Keyboard entry')
    })

    it('skips a disabled textarea in the Tab order (2.1.1)', async () => {
        const { container } = mount(
            <>
                <StyledTextarea label='Disabled notes' value='' disabled />
                <button type='button'>After</button>
            </>,
        )

        await userEvent.tab()
        await expect(document.activeElement).toBe(container.querySelector('button'))
    })
})
