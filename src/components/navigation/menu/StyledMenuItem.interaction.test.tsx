import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledMenuItem } from './StyledMenuItem'

describe('StyledMenuItem disabled with a reason (ASMA-8137)', () => {
    afterEach(cleanup)

    it('opens the reason on the requested side', async () => {
        const { container } = mount(
            <ul style={{ margin: 300, width: 100 }}>
                <StyledMenuItem disabled disabledReason='Unavailable' reasonPlacement='right'>
                    Delete
                </StyledMenuItem>
            </ul>,
        )
        const item = container.querySelector('li')!

        await userEvent.hover(item)
        const tooltip = await waitFor(() => {
            const found = document.querySelector('[role="tooltip"]')
            if (!found) throw new Error('reason not open')
            return found
        })
        await waitFor(() => expect(tooltip.getBoundingClientRect().left).toBeGreaterThan(item.getBoundingClientRect().right))
    })

    it('ignores the click but still forwards mouse down and up, so a menu can keep its focus', async () => {
        const onClick = fn()
        const onMouseDown = fn()
        const onMouseUp = fn()
        const { container } = mount(
            <ul>
                <StyledMenuItem disabled onClick={onClick} onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
                    Delete
                </StyledMenuItem>
            </ul>,
        )

        // `force`: Playwright will not click an `aria-disabled` element, a user can.
        await userEvent.click(container.querySelector('li')!, { force: true })

        await expect(onClick).not.toHaveBeenCalled()
        await expect(onMouseDown).toHaveBeenCalledTimes(1)
        await expect(onMouseUp).toHaveBeenCalledTimes(1)
    })
})
