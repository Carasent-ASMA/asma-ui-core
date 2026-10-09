import { afterEach, describe, it, vi } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledChip } from './StyledChip'

/**
 * Disabled contract — StyledChip (ASMA-8305). disabled-states DIS-1…DIS-3; WCAG 2.1.1, 4.1.2.
 */

const chip = (): HTMLElement => document.querySelector<HTMLElement>('[data-testid="filter"]')!

describe('StyledChip disabledReason', () => {
    afterEach(cleanup)

    it('keeps a plain disabled chip out of the tab order', async () => {
        mount(<StyledChip dataTest='filter' label='Open' onClick={() => undefined} disabled />)

        await expect(chip()).not.toHaveAttribute('tabindex')
        await expect(chip()).not.toHaveAttribute('aria-disabled')
    })

    it('stays focusable, announces the reason and ignores activation', async () => {
        const onClick = vi.fn()
        mount(
            <StyledChip
                dataTest='filter'
                label='Open'
                onClick={onClick}
                disabled
                disabledReason='No open items in this period'
            />,
        )

        await userEvent.tab()

        await expect(document.activeElement).toBe(chip())
        await expect(chip()).toHaveAttribute('role', 'button')
        await expect(chip()).toHaveAttribute('aria-disabled', 'true')
        await waitFor(() => expect(chip()).toHaveAccessibleDescription('No open items in this period'))

        await userEvent.keyboard('{Enter}')
        chip().click()
        await expect(onClick).not.toHaveBeenCalled()
    })
})
