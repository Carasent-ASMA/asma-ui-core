import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { StyledRadio } from 'src/components/inputs/radio-button/base-ui/StyledRadio'
import { StyledRadioGroup } from 'src/components/inputs/radio-button/base-ui/StyledRadioGroup'
import { StyledCheckbox as TableStyledCheckbox } from 'src/table/shared-components/StyledCheckbox'
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

/**
 * ASMA-8338: next to a long label that wraps, the checkbox must keep its 40x40 target. The label is a
 * flex row, and a shrinkable checkbox was squeezed narrower than it is tall, so its round hover
 * circle (sized to the target, `border-radius: 50%`) turned into an oval. The radio never shrank.
 */
describe('a long wrapping label does not squeeze the control', () => {
    afterEach(cleanup)

    const LONG =
        'Show/hide transition: ~300–400ms slide + fade — matches NN/g recommended duration for partially persistent headers, keeping the button and header feeling like one system.'

    it.each([
        ['checkbox', <StyledCheckbox key='c' dataTest='long' />],
        ['table checkbox', <TableStyledCheckbox key='t' dataTest='long' />],
        ['radio', <StyledRadio key='r' dataTest='long' value='a' />],
    ] as const)('%s keeps its 40x40 target', async (_kind, control) => {
        mount(
            <div style={{ width: 320 }}>
                <StyledFormControlLabel label={LONG} control={control} />
            </div>,
        )
        const target = document.querySelector<HTMLElement>('[data-testid="long"], [data-test="long"]')!
        const { width, height } = target.getBoundingClientRect()
        await expect({ width, height }, 'the control target next to wrapping text').toEqual({ width: 40, height: 40 })
    })
})
