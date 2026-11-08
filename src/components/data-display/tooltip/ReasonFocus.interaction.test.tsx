import type { ReactElement } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledChip } from '../chip/StyledChip'
import { StyledMenuItem } from '../../navigation/menu/StyledMenuItem'
import { StyledTab } from '../../navigation/tabs/StyledTab'
import { StyledButton } from '../../inputs/button/StyledButton'
import { StyledLink } from '../../navigation/link/StyledLink'
import { StyledInteractiveChip } from '../interactive-chip/StyledInteractiveChip'

const reason = 'Locked after signing'
const fixtures: [string, string, (active: boolean, reason?: string) => ReactElement][] = [
    [
        'button',
        'button',
        (disabled, disabledReason) => (
            <StyledButton dataTest='button' disabled={disabled} disabledReason={disabledReason}>Action</StyledButton>
        ),
    ],
    [
        'link',
        'a',
        (disabled, disabledReason) => (
            <StyledLink href='#report' contentNode='Open report' disabled={disabled} disabledReason={disabledReason} />
        ),
    ],
    [
        'tab',
        'button',
        (disabled, disabledReason) => <StyledTab label='Tab' disabled={disabled} disabledReason={disabledReason} />,
    ],
    [
        'menu item',
        '[role="menuitem"]',
        (disabled, disabledReason) => (
            <StyledMenuItem disabled={disabled} disabledReason={disabledReason}>
                Action
            </StyledMenuItem>
        ),
    ],
    [
        'chip',
        '[role="button"]',
        (disabled, disabledReason) => (
            <StyledChip
                dataTest='chip'
                label='Action'
                onClick={() => undefined}
                disabled={disabled}
                disabledReason={disabledReason}
            />
        ),
    ],
    [
        'interactive chip',
        '[role="checkbox"]',
        (disabled, disabledReason) => (
            <StyledInteractiveChip
                dataTest='chip'
                label='Email'
                onClick={() => undefined}
                disabled={disabled}
                disabledReason={disabledReason}
            />
        ),
    ],
]

// Widget View more left this contract in ASMA-8699: a reason replaces the button
// with read-only text, so the node cannot stay. StyledWidget.test.tsx covers that.

describe('Controls keep their node when the reason changes', () => {
    afterEach(cleanup)

    for (const [name, selector, fixture] of fixtures) {
        it(`preserves ${name} focus when a reason is added, activated and removed`, async () => {
            const { container, rerender } = mount(fixture(false))
            const control = container.querySelector<HTMLElement>(selector)!
            control.focus()
            rerender(fixture(false, reason))
            await expect(document.activeElement).toBe(control)
            rerender(fixture(true, reason))
            await expect(container.querySelector(selector)).toBe(control)
            await expect(document.activeElement).toBe(control)
            rerender(fixture(false, reason))
            await expect(document.activeElement).toBe(control)
            rerender(fixture(false))
            await expect(document.activeElement).toBe(control)
            await expect(control).not.toHaveAccessibleDescription(reason)
            await expect(document.querySelector('[role="tooltip"]')).toBeNull()
        })
    }
})
