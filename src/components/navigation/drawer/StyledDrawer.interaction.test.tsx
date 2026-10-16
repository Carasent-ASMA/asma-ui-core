import { afterEach, describe, it } from 'vitest'
import { expect, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { getOverlayBackStackSize } from 'src/hooks/useBackCloses.hook'
import { StyledDrawer } from './StyledDrawer'

describe('StyledDrawer back registration', () => {
    afterEach(cleanup)

    it('only a temporary drawer joins the back stack', async () => {
        mount(
            <StyledDrawer open variant='temporary' onClose={() => undefined}>
                Panel
            </StyledDrawer>,
        )
        await waitFor(() => expect(getOverlayBackStackSize()).toBe(1))

        cleanup()

        mount(
            <StyledDrawer open variant='persistent' onClose={() => undefined}>
                Panel
            </StyledDrawer>,
        )
        await expect(getOverlayBackStackSize()).toBe(0)
    })
})
