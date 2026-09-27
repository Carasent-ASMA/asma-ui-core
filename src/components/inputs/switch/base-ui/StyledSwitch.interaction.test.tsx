import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'
import { StyledSwitch } from './StyledSwitch'

const SwitchFixture = (): JSX.Element => {
    const [checked, setChecked] = useState(false)
    return (
        <>
            <StyledFormControlLabel
                label='Enable notifications'
                control={<StyledSwitch dataTest='notifications' checked={checked} onChange={(_, next) => setChecked(next)} />}
            />
            <StyledFormControlLabel label='Unavailable' control={<StyledSwitch dataTest='disabled-switch' disabled />} />
        </>
    )
}

describe('StyledSwitch keyboard contract', () => {
    afterEach(cleanup)

    it('is named by its visible label, reached by Tab, and toggled by Space (2.1.1, 4.1.2)', async () => {
        const { container } = mount(<SwitchFixture />)
        const control = container.querySelector<HTMLButtonElement>('[data-testid="notifications"]')!

        await expect(control).toHaveAccessibleName('Enable notifications')
        await userEvent.tab()
        await expect(document.activeElement).toBe(control)
        await userEvent.keyboard(' ')
        await expect(control).toHaveAttribute('aria-checked', 'true')
    })

    it('skips disabled controls in the Tab order (2.1.1)', async () => {
        const { container } = mount(
            <>
                <StyledFormControlLabel label='Unavailable' control={<StyledSwitch dataTest='disabled-switch' disabled />} />
                <button type='button'>After</button>
            </>,
        )

        await userEvent.tab()
        await expect(document.activeElement).toBe(
            Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'After'),
        )
    })
})
