import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { getOverlayBackStackSize, requestCloseTopOverlayBack } from 'src/hooks/useBackCloses.hook'
import { StyledDialog } from 'src/components/feedback/dialog/StyledDialog'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { StyledDrawer } from './StyledDrawer'

describe('StyledDrawer back registration', () => {
    afterEach(cleanup)

    it('only a temporary drawer joins the back stack', async () => {
        const closeTemporary = fn()
        mount(
            <StyledDrawer open variant='temporary' onClose={closeTemporary}>
                Panel
            </StyledDrawer>,
        )
        await waitFor(() => expect(getOverlayBackStackSize()).toBe(1))
        void requestCloseTopOverlayBack()
        await expect(closeTemporary).toHaveBeenCalledTimes(1)

        cleanup()

        mount(
            <StyledDrawer open variant='persistent' onClose={() => undefined}>
                Panel
            </StyledDrawer>,
        )
        await expect(getOverlayBackStackSize()).toBe(0)

        cleanup()

        mount(
            <StyledDrawer open variant='permanent' onClose={() => undefined}>
                Panel
            </StyledDrawer>,
        )
        await expect(getOverlayBackStackSize()).toBe(0)
    })

    it('Escape closes a nested temporary drawer without also closing its dialog', async () => {
        const closeDialog = fn()
        const Fixture = (): JSX.Element => {
            const [drawerOpen, setDrawerOpen] = useState(false)
            return (
                <StyledDialog dataTest='outer-dialog' dialogTitle='Outer' open onClose={closeDialog}>
                    <StyledButton dataTest='open-drawer' onClick={() => setDrawerOpen(true)}>
                        Open drawer
                    </StyledButton>
                    <StyledDrawer open={drawerOpen} variant='temporary' onClose={() => setDrawerOpen(false)}>
                        <StyledButton dataTest='drawer-control'>Drawer control</StyledButton>
                    </StyledDrawer>
                </StyledDialog>
            )
        }
        const { container } = mount(<Fixture />)
        await userEvent.click(container.querySelector<HTMLButtonElement>('[data-testid="open-drawer"]')!)
        const control = await waitFor(() => {
            const node = document.querySelector<HTMLButtonElement>('[data-testid="drawer-control"]')
            if (!node) throw new Error('drawer not mounted')
            return node
        })
        control.focus()

        await userEvent.keyboard('{Escape}')

        await waitFor(() => expect(document.querySelector('[data-testid="drawer-control"]')).toBeNull())
        await expect(container.querySelector('[data-testid="outer-dialog"]')).not.toBeNull()
        await expect(closeDialog).not.toHaveBeenCalled()
    })
})
