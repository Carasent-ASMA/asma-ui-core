import { afterEach, describe, it } from 'vitest'
import { expect } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledDialogFooter } from './StyledDialogFooter'

const reason = 'Locked for editing'

describe('StyledDialogFooter availability changes', () => {
    afterEach(cleanup)

    for (const conditional of [false, true]) {
        for (const action of ['primaryAction', 'secondaryAction'] as const) {
            it(`keeps ${action} focus with a ${conditional ? 'conditional' : 'constant'} tooltip`, async () => {
                const fixture = (disabled: boolean): JSX.Element => (
                    <StyledDialogFooter {...{
                        [action]: {
                            label: 'Action',
                            dataTest: 'action',
                            disabled,
                            tooltip: conditional && !disabled ? undefined : reason,
                        },
                    }} />
                )
                const { container, rerender } = mount(fixture(true))
                const button = container.querySelector<HTMLButtonElement>('[data-testid="action"]')!
                button.focus()
                await expect(button).toHaveAccessibleDescription(reason)
                rerender(fixture(false))
                await expect(container.querySelector('[data-testid="action"]')).toBe(button)
                await expect(button).toHaveFocus()
                await expect(button).not.toHaveAttribute('aria-disabled')
                rerender(fixture(true))
                await expect(button).toHaveFocus()
                await expect(button).toHaveAccessibleDescription(reason)
            })
        }
    }
})
