import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledInteractiveChip } from './StyledInteractiveChip'

const CheckboxChipFixture = (): JSX.Element => {
    const [checked, setChecked] = useState(false)
    return (
        <>
            <StyledInteractiveChip
                dataTest='active-chip'
                label='Receive updates'
                type='checkbox'
                checked={checked}
                onClick={() => setChecked(!checked)}
            />
            <StyledInteractiveChip dataTest='disabled-chip' label='Unavailable' type='checkbox' disabled />
        </>
    )
}

describe('StyledInteractiveChip keyboard contract', () => {
    afterEach(cleanup)

    it('is named by its visible label, reachable by Tab, and toggles with Space (2.1.1, 4.1.2)', async () => {
        const { container } = mount(<CheckboxChipFixture />)
        const chip = container.querySelector<HTMLElement>('[data-testid="active-chip"]')!

        await expect(chip).toHaveAccessibleName('Receive updates')
        await userEvent.tab()
        await expect(document.activeElement).toBe(chip)

        await userEvent.keyboard(' ')
        await expect(chip).toHaveAttribute('aria-checked', 'true')
    })

    it('keeps a disabled chip out of the Tab order (2.1.1)', async () => {
        const { container } = mount(
            <>
                <StyledInteractiveChip dataTest='disabled-chip' label='Unavailable' type='checkbox' disabled />
                <button type='button'>After</button>
            </>,
        )
        const disabledChip = container.querySelector<HTMLElement>('[data-testid="disabled-chip"]')!
        const after = container.querySelector<HTMLButtonElement>('button')!

        await userEvent.tab()
        await expect(document.activeElement).toBe(after)
        await expect(disabledChip).not.toHaveFocus()
    })
})
