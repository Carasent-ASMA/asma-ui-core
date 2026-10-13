import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'
import { StyledRadio } from './StyledRadio'
import { StyledRadioGroup } from './StyledRadioGroup'

const RadioFixture = (): JSX.Element => (
    <>
        {/* The question text lives outside the group, exactly as the questionnaire renderer puts it. */}
        <h2 id='delivery-method-question'>Delivery method</h2>
        <StyledRadioGroup
            aria-labelledby='delivery-method-question'
            dataTest='delivery-method'
            error
            errorText='Choose one method'
            name='delivery-method'
        >
            <StyledFormControlLabel label='Email' control={<StyledRadio dataTest='email' value='email' />} />
            <StyledFormControlLabel label='Post' control={<StyledRadio dataTest='post' value='post' />} />
            <StyledFormControlLabel label='Phone' control={<StyledRadio dataTest='phone' value='phone' disabled />} />
        </StyledRadioGroup>
        <button type='button'>After radios</button>
    </>
)

describe('StyledRadioGroup keyboard contract', () => {
    afterEach(cleanup)

    it('uses one tab stop and wrapping arrow navigation over enabled radios (2.1.1)', async () => {
        const { container } = mount(<RadioFixture />)
        const [email, post, phone] = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="radio"]'))
        const group = container.querySelector<HTMLElement>('[role="radiogroup"]')!

        // Pins the naming route the editor relies on (A-15): the group takes its name from the
        // visible question heading through `aria-labelledby`, with no label of its own.
        await expect(group).toHaveAccessibleName('Delivery method')
        await expect(group).toHaveAttribute('aria-describedby')
        await expect(document.getElementById(group.getAttribute('aria-describedby')!)).toHaveTextContent('Choose one method')
        await expect(email).toHaveAccessibleName('Email')
        await expect(phone).toBeDisabled()

        await userEvent.tab()
        await expect(document.activeElement).toBe(email)
        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(post)
        await expect(post).toBeChecked()
        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(email)
        await userEvent.tab()
        await expect(document.activeElement).toBe(container.querySelector('button'))
    })
})
