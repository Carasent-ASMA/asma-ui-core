import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'
import { StyledRadio } from './StyledRadio'
import { StyledRadioGroup } from './StyledRadioGroup'

const RadioFixture = (): JSX.Element => (
    <>
        <StyledRadioGroup dataTest='delivery-method' name='delivery-method' error errorText='Choose one method'>
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

    it('keeps a read-only selection unchanged and explains why (disabled-states DIS-6)', async () => {
        const { container } = mount(
            <StyledRadioGroup
                dataTest='delivery-method'
                name='delivery-method'
                defaultValue='email'
                readOnly
                readOnlyReason='Submitted questionnaires cannot be changed'
            >
                <StyledFormControlLabel label='Email' control={<StyledRadio dataTest='email' value='email' />} />
                <StyledFormControlLabel label='Post' control={<StyledRadio dataTest='post' value='post' />} />
            </StyledRadioGroup>,
        )
        const [email, post] = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="radio"]'))

        post!.click()

        await expect(email).toBeChecked()
        await expect(post).not.toBeChecked()
        await waitFor(() => expect(email).toHaveAccessibleDescription('Submitted questionnaires cannot be changed'))
    })

    it('describes the checked radio when it is not first, and every other radio', async () => {
        const reason = 'Submitted questionnaires cannot be changed'
        const fixture = (readOnly: boolean): JSX.Element => (
            <>
                <span id='delivery-help' hidden>Delivery preference</span>
                <StyledRadioGroup
                    name='delivery-method'
                    defaultValue='post'
                    readOnly={readOnly}
                    readOnlyReason={reason}
                >
                    <StyledFormControlLabel label='Email' control={<StyledRadio value='email' aria-describedby='delivery-help' />} />
                    <StyledFormControlLabel label='Post' control={<StyledRadio value='post' aria-describedby='delivery-help' />} />
                </StyledRadioGroup>
            </>
        )
        const { container, rerender } = mount(fixture(true))
        const [email, post] = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="radio"]'))
        await userEvent.tab()
        await expect(post).toHaveFocus()
        await expect(post).toBeChecked()
        for (const radio of [email, post]) {
            await expect(radio).toHaveAccessibleDescription(`Delivery preference ${reason}`)
            await expect(radio!.getAttribute('aria-describedby')!.split(/\s+/)).toHaveLength(2)
        }
        await userEvent.keyboard('{ArrowLeft}')
        await expect(email).toHaveFocus()
        await expect(post).toBeChecked()
        await expect(email).not.toBeChecked()
        rerender(fixture(false))
        await expect(email).toHaveFocus()
        for (const radio of [email, post]) {
            await expect(radio).toHaveAccessibleDescription('Delivery preference')
        }
    })

})
