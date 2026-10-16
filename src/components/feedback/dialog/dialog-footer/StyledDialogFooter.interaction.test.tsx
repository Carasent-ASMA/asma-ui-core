import { afterEach, describe, it, vi } from 'vitest'
import { expect, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledDialogFooter } from './StyledDialogFooter'

const reason = 'Locked for editing'

const tip = (): HTMLElement | null => document.querySelector<HTMLElement>('[role="tooltip"]')

const pointer = (node: Element, type: 'pointerdown' | 'pointerup'): void => {
    node.dispatchEvent(new PointerEvent(type, { pointerType: 'touch', bubbles: true }))
}

// A mobile browser follows the touch pointer events with emulated mouse events and a click.
const tap = (node: HTMLElement): void => {
    pointer(node, 'pointerdown')
    pointer(node, 'pointerup')
    node.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    node.click()
}

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

describe('StyledDialogFooter disabled reason on touch (ASMA-8308, disabled-states DIS-2, DIS-4, §5)', () => {
    afterEach(cleanup)

    for (const action of ['primaryAction', 'secondaryAction'] as const) {
        const mountDisabled = (): { button: HTMLButtonElement; onClick: ReturnType<typeof vi.fn> } => {
            const onClick = vi.fn()
            const { container } = mount(
                <div data-testid='scroller' style={{ height: 80, overflow: 'auto' }}>
                    <div style={{ height: 400, paddingTop: 40 }}>
                        <StyledDialogFooter
                            {...{ [action]: { label: 'Action', dataTest: 'action', disabled: true, tooltip: reason, onClick } }}
                        />
                    </div>
                    <p data-testid='outside'>Elsewhere</p>
                </div>,
            )
            return { button: container.querySelector<HTMLButtonElement>('[data-testid="action"]')!, onClick }
        }

        it(`${action}: a tap opens the reason without running the action, and no timer closes it`, async () => {
            const { button, onClick } = mountDisabled()

            tap(button)

            await waitFor(() => expect(tip()).toHaveTextContent(reason))
            await expect(onClick).not.toHaveBeenCalled()
            await new Promise((resolve) => setTimeout(resolve, 2000))
            await expect(tip()).toHaveTextContent(reason)
        })

        it(`${action}: a second tap on the button closes the reason`, async () => {
            const { button, onClick } = mountDisabled()

            tap(button)
            await waitFor(() => expect(tip()).not.toBeNull())
            tap(button)

            await waitFor(() => expect(tip()).toBeNull())
            await expect(onClick).not.toHaveBeenCalled()
        })

        it(`${action}: a tap elsewhere closes the reason`, async () => {
            const { button } = mountDisabled()

            tap(button)
            await waitFor(() => expect(tip()).not.toBeNull())
            pointer(document.querySelector('[data-testid="outside"]')!, 'pointerdown')

            await waitFor(() => expect(tip()).toBeNull())
        })

        it(`${action}: scrolling closes the reason`, async () => {
            const { button } = mountDisabled()
            const scroller = document.querySelector<HTMLElement>('[data-testid="scroller"]')!

            tap(button)
            await waitFor(() => expect(tip()).not.toBeNull())
            scroller.scrollTop = 40
            scroller.dispatchEvent(new Event('scroll'))

            await waitFor(() => expect(tip()).toBeNull())
        })
    }
})
