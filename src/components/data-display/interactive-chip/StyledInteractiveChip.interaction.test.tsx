import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent } from 'src/test-utils/interaction-api'
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

    it('keeps a disabled chip in the Tab order, announced as disabled, and inert (2.1.1, DIS-3)', async () => {
        /* Reversed from "out of the Tab order" (ASMA-8139): the disabled-states pattern keeps a
         * disabled action focusable with `aria-disabled`, so keyboard users can find it and its reason. */
        const onClick = fn()
        const { container } = mount(
            <StyledInteractiveChip dataTest='disabled-chip' label='Unavailable' type='checkbox' disabled onClick={onClick} />,
        )
        const disabledChip = container.querySelector<HTMLElement>('[data-testid="disabled-chip"]')!

        await expect(disabledChip).toHaveAttribute('aria-disabled', 'true')
        await userEvent.tab()
        await expect(document.activeElement).toBe(disabledChip)

        await userEvent.keyboard(' ')
        await userEvent.keyboard('{Enter}')
        disabledChip.click()
        await expect(onClick).not.toHaveBeenCalled()
        await expect(disabledChip).toHaveAttribute('aria-checked', 'false')
    })
})
