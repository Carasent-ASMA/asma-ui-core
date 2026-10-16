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

    it('Back closes an initially-open nested drawer before its parent dialog', async () => {
        const closeDialog = fn()
        const Fixture = (): JSX.Element => {
            const [drawerOpen, setDrawerOpen] = useState(true)
            return (
                <StyledDialog dataTest='outer-dialog' dialogTitle='Outer' open onClose={closeDialog}>
                    <StyledDrawer open={drawerOpen} variant='temporary' onClose={() => setDrawerOpen(false)}>
                        <StyledButton dataTest='drawer-control'>Drawer control</StyledButton>
                    </StyledDrawer>
                </StyledDialog>
            )
        }
        const { container } = mount(<Fixture />)
        await waitFor(() => expect(document.querySelector('[data-testid="drawer-control"]')).not.toBeNull())

        void requestCloseTopOverlayBack()

        await waitFor(() => expect(document.querySelector('[data-testid="drawer-control"]')).toBeNull())
        await expect(container.querySelector('[data-testid="outer-dialog"]')).not.toBeNull()
        await expect(closeDialog).not.toHaveBeenCalled()
    })

    it('Back closes an initially-open nested drawer before its parent drawer', async () => {
        const closeOuter = fn()
        const Fixture = (): JSX.Element => {
            const [innerOpen, setInnerOpen] = useState(true)
            return (
                <StyledDrawer open variant='temporary' onClose={closeOuter}>
                    <StyledButton dataTest='outer-control'>Outer control</StyledButton>
                    <StyledDrawer open={innerOpen} variant='temporary' onClose={() => setInnerOpen(false)}>
                        <StyledButton dataTest='inner-control'>Inner control</StyledButton>
                    </StyledDrawer>
                </StyledDrawer>
            )
        }
        mount(<Fixture />)
        await waitFor(() => expect(document.querySelector('[data-testid="inner-control"]')).not.toBeNull())

        void requestCloseTopOverlayBack()

        await waitFor(() => expect(document.querySelector('[data-testid="inner-control"]')).toBeNull())
        await expect(document.querySelector('[data-testid="outer-control"]')).not.toBeNull()
        await expect(closeOuter).not.toHaveBeenCalled()
    })
})
