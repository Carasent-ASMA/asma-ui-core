import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { StyledRadio } from 'src/components/inputs/radio-button/base-ui/StyledRadio'
import { StyledRadioGroup } from 'src/components/inputs/radio-button/base-ui/StyledRadioGroup'
import { StyledFormControlLabel } from './StyledFormControlLabel'

/**
 * ASMA-8338: Figma draws the Checkbox+Label / Radio+Label Hovered state when the pointer is anywhere
 * on the option, so hovering the option *text* must show the control's grey circle — not only the
 * 40px control itself. A disabled control never shows it.
 */

const haloOpacity = (control: Element): string => {
    const container = control.querySelector('[class*="RippleContainer"]')!
    return getComputedStyle(container, '::after').opacity
}

const hoverText = async (text: string): Promise<void> => {
    const node = [...document.querySelectorAll('label span, label')].find((el) => el.textContent === text)!
    await userEvent.hover(node)
    // The circle fades in over 200 ms.
    await new Promise((resolve) => setTimeout(resolve, 300))
}

describe('hovering the option text shows the control hover circle', () => {
    afterEach(cleanup)

    it('checkbox', async () => {
        mount(<StyledFormControlLabel label='Receive updates' control={<StyledCheckbox dataTest='updates' />} />)
        const control = document.querySelector('[data-testid="updates"]')!
        await expect(haloOpacity(control)).toBe('0')

        await hoverText('Receive updates')
        await expect(haloOpacity(control), 'hovering the text shows the circle').toBe('1')
    })

    it('radio, and not on a disabled radio', async () => {
        mount(
            <StyledRadioGroup name='contact' value='email' onValueChange={() => undefined}>
                <StyledFormControlLabel label='Email' control={<StyledRadio dataTest='email' value='email' />} />
                <StyledFormControlLabel label='Phone' control={<StyledRadio dataTest='phone' value='phone' disabled />} />
            </StyledRadioGroup>,
        )

        await hoverText('Email')
        await expect(haloOpacity(document.querySelector('[data-testid="email"]')!), 'enabled radio').toBe('1')

        await hoverText('Phone')
        await expect(haloOpacity(document.querySelector('[data-testid="phone"]')!), 'disabled radio').toBe('0')
    })
})

describe('a read-only control', () => {
    afterEach(cleanup)

    it('shows the default cursor on its label, not a pointer', async () => {
        mount(<StyledFormControlLabel label='Read only' control={<StyledCheckbox dataTest='ro' readOnly checked />} />)
        const label = [...document.querySelectorAll('label')].find((el) => el.textContent === 'Read only')!

        await expect(getComputedStyle(label).cursor).toBe('default')
    })
})
