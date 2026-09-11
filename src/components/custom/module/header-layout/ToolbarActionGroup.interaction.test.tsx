import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import type { DynamicToolbarAction } from './planToolbarActions'
import { ToolbarActionGroup } from './ToolbarActionGroup'

/**
 * The overflow menu's trigger has to dismiss the menu it opened (ASMA-8151). `StyledPopover`
 * excludes the anchor from its outside-press handler on purpose, so a press on the trigger reaches
 * the button rather than closing the menu on its way — leaving dismissal to the trigger itself.
 */

const action = (id: string): DynamicToolbarAction => ({ id, label: id, onClick: () => undefined })

const plan = {
    inlineActions: [],
    overflowActions: [action('archive'), action('delete')],
    showMoreMenu: true,
}

const menu = (): HTMLElement | null => document.querySelector<HTMLElement>('[role="menu"]')

const trigger = (container: HTMLElement): HTMLButtonElement =>
    container.querySelector<HTMLButtonElement>('[data-testid="dynamic-toolbar-overflow-actions"]')!

describe('the toolbar overflow menu', () => {
    afterEach(cleanup)

    it('opens on the first press of More', async () => {
        const { container } = mount(<ToolbarActionGroup plan={plan} overflowMenuLabel='More' />)

        await userEvent.click(trigger(container))

        await waitFor(() => expect(menu()).not.toBeNull())
    })

    it('closes on the next press of More, rather than only on a press elsewhere', async () => {
        const { container } = mount(<ToolbarActionGroup plan={plan} overflowMenuLabel='More' />)

        await userEvent.click(trigger(container))
        await waitFor(() => expect(menu()).not.toBeNull())

        await userEvent.click(trigger(container))

        await waitFor(() => expect(menu()).toBeNull())
    })

    it('opens again on the press after that', async () => {
        const { container } = mount(<ToolbarActionGroup plan={plan} overflowMenuLabel='More' />)

        await userEvent.click(trigger(container))
        await waitFor(() => expect(menu()).not.toBeNull())
        await userEvent.click(trigger(container))
        await waitFor(() => expect(menu()).toBeNull())

        await userEvent.click(trigger(container))

        await waitFor(() => expect(menu()).not.toBeNull())
    })
})
