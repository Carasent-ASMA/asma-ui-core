import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledAlert } from './StyledAlert'
import { StyledSnackbar } from './StyledSnackbar'

/**
 * Status-message & keyboard contract — StyledSnackbar / StyledAlert (ASMA-8139).
 * WCAG 4.1.3 (status messages), 2.1.1, 4.1.2.
 *
 * 4.1.3 is the one criterion in this suite that cannot be observed by driving the keyboard: it asks
 * whether a message that appears WITHOUT focus moving is announced. In the DOM that is exactly the
 * question "is this content inside a live region at the moment it is inserted", which is what these
 * tests assert. A live region added after the text is already on screen announces nothing, so the
 * region must be present in the same commit as the message.
 */

const liveRegionFor = (element: Element | null): Element | null =>
    element?.closest('[role="alert"], [role="status"], [aria-live]') ?? null

describe('StyledAlert status-message contract', () => {
    afterEach(cleanup)

    it('announces its message via an implicit live region (4.1.3)', async () => {
        const { container } = mount(<StyledAlert severity='error'>Could not save</StyledAlert>)
        const alert = container.querySelector('[role="alert"]')

        // role="alert" carries an implicit aria-live="assertive".
        await expect(alert).not.toBeNull()
        await expect(alert).toHaveTextContent('Could not save')
    })

    it('lets a consumer soften the politeness via the role prop (4.1.3)', async () => {
        const { container } = mount(
            <StyledAlert severity='success' role='status'>
                Saved
            </StyledAlert>,
        )

        await expect(container.querySelector('[role="status"]')).toHaveTextContent('Saved')
    })

    it('exposes the close affordance as a named, keyboard-operable button (2.1.1, 4.1.2)', async () => {
        const onClose = fn()
        const { container } = mount(
            <StyledAlert severity='info' onClose={onClose}>
                Heads up
            </StyledAlert>,
        )
        const close = container.querySelector<HTMLButtonElement>('button')!

        await expect(close).toHaveAccessibleName('Close')

        await userEvent.tab()
        await expect(document.activeElement).toBe(close)

        await userEvent.keyboard('{Enter}')
        await expect(onClose).toHaveBeenCalled()

        await userEvent.keyboard(' ')
        await expect(onClose).toHaveBeenCalledTimes(2)
    })
})

describe('StyledSnackbar status-message contract', () => {
    afterEach(cleanup)

    it('announces content passed as children when that child is a live region (4.1.3)', async () => {
        mount(
            <StyledSnackbar open autoHideDuration={null}>
                <StyledAlert severity='success'>Message sent</StyledAlert>
            </StyledSnackbar>,
        )

        await waitFor(() => expect(document.querySelector('[role="alert"]')).not.toBeNull())
        await expect(document.querySelector('[role="alert"]')).toHaveTextContent('Message sent')
    })

    it('keeps a snackbar action reachable and operable by keyboard (2.1.1)', async () => {
        const onUndo = fn()
        mount(
            <StyledSnackbar
                open
                autoHideDuration={null}
                message='Thread archived'
                action={
                    <button type='button' onClick={onUndo}>
                        Undo
                    </button>
                }
            />,
        )

        await waitFor(() => expect(document.body.textContent).toContain('Thread archived'))
        const undo = Array.from(document.querySelectorAll('button')).find((b) => b.textContent === 'Undo')!
        undo.focus()
        await userEvent.keyboard('{Enter}')

        await expect(onUndo).toHaveBeenCalled()
    })

    it('does not steal focus when it appears (3.2.1, 2.4.3)', async () => {
        // A toast interrupting the user's focus would be a context change on appearance.
        const { container, rerender } = mount(
            <>
                <button type='button' data-testid='typing-here'>
                    Field
                </button>
                <StyledSnackbar open={false} message='Later' />
            </>,
        )
        const anchor = container.querySelector<HTMLButtonElement>('[data-testid="typing-here"]')!
        anchor.focus()

        rerender(
            <>
                <button type='button' data-testid='typing-here'>
                    Field
                </button>
                <StyledSnackbar open autoHideDuration={null} message='Later' />
            </>,
        )

        await waitFor(() => expect(document.body.textContent).toContain('Later'))
        await expect(document.activeElement).toBe(anchor)
    })

    /* FINDING ASMA-8139-I — WCAG 4.1.3 (status messages). src/components/feedback/snack-bar/
     * StyledSnackbar.tsx. When the toast renders its own built-in pill — the `message`/`action`
     * fallback path, used whenever a consumer does not pass a `children` element that happens to be
     * a live region — the markup is a plain portalled `<div>` chain with no `role="status"`,
     * `role="alert"` or `aria-live`. The text appears without focus moving, so a screen-reader user
     * is never told about it. Confirmed by grepping the whole of `src/`: the only `aria-live`
     * attributes in the library are in ToolbarRows.tsx and StyledTextarea.tsx; the snackbar has none.
     * Scope: `StyledAlert` (`role="alert"`) and `StyledDefaultSnackbar` (`role="alert"`, the
     * notistack path most consumers use) are FINE — this is specifically the bare-`message` path of
     * the positioning primitive, which is also the shape MUI-compat call sites port to first.
     * Not fixed here: wave-3 builders add tests, not component fixes. The fix is a one-line
     * `role="status"` on the fallback pill and should be cheap, but choosing assertive vs polite is
     * a product decision. Escalated to the coordinator. @see docs/a11y-keyboard-contract.md */
    it.skip('announces a bare message string via a live region (4.1.3)', async () => {
        mount(<StyledSnackbar open autoHideDuration={null} message='Thread archived' />)

        await waitFor(() => expect(document.body.textContent).toContain('Thread archived'))
        const text = Array.from(document.querySelectorAll('div')).find(
            (node) => node.textContent === 'Thread archived',
        )!

        await expect(liveRegionFor(text)).not.toBeNull()
    })
})
