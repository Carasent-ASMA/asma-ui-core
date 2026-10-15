import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import type { DynamicToolbarAction } from './planToolbarActions'
import { ToolbarActionButton, ToolbarActionGroup } from './ToolbarActionGroup'

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

/* A disabled toolbar action stays in the Tab order (disabled-states DIS-3): `aria-disabled`, not
 * native `disabled`, which would leave a keyboard user unable to find it or its reason. */
describe('a disabled toolbar action', () => {
    afterEach(cleanup)

    it('is reachable with Tab, announced as disabled, and does nothing when pressed', async () => {
        const onClick = fn()
        const { container } = mount(
            <ToolbarActionButton action={{ id: 'add', label: 'Add', onClick, disabled: true }} showLabel />,
        )
        const button = container.querySelector<HTMLButtonElement>('[data-testid="dynamic-toolbar-action-add"]')!

        await expect(button).not.toBeDisabled()
        await expect(button).toHaveAttribute('aria-disabled', 'true')

        await userEvent.tab()
        await expect(document.activeElement).toBe(button)

        await userEvent.keyboard('{Enter}')
        // Playwright refuses to click an `aria-disabled` element, so the pointer press is dispatched directly.
        button.click()
        await expect(onClick).not.toHaveBeenCalled()
    })
})
