import { afterEach, describe, it, vi } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledButton } from '../../inputs/button/StyledButton'
import { StyledDialog } from './StyledDialog'
import { StyledDialogFooter } from './dialog-footer/StyledDialogFooter'

const busyReason = 'Wait until saved'

describe('StyledDialog explains busy dismissal controls', () => {
    afterEach(cleanup)

    it('soft-disables close and Cancel, blocks Escape, and restores them after saving', async () => {
        const onClose = vi.fn()
        const fixture = (loading: boolean): JSX.Element => (
            <StyledDialog open dataTest='editor' onClose={onClose} busyReason={busyReason}>
                <StyledDialogFooter
                    secondaryAction={{ label: 'Cancel', dataTest: 'cancel', onClick: onClose }}
                    primaryAction={{ label: 'Save', loading }}
                />
            </StyledDialog>
        )
        const { container, rerender } = mount(fixture(false))
        await new Promise(requestAnimationFrame)
        const close = container.querySelector<HTMLButtonElement>('[data-testid="close-button-editor"]')!
        const cancel = container.querySelector<HTMLButtonElement>('[data-testid="cancel"]')!
        close.focus()
        rerender(fixture(true))
        for (const button of [close, cancel]) {
            await expect(button).not.toBeDisabled()
            await expect(button).toHaveAttribute('aria-disabled', 'true')
            await expect(button).toHaveAccessibleDescription(busyReason)
            button.click()
        }
        await expect(close).toHaveFocus()
        await userEvent.keyboard('{Enter}{Escape}')
        await expect(container.querySelector('dialog')).toHaveAttribute('open')
        cancel.focus()
        await userEvent.keyboard('{Enter}{Escape}')
        await expect(onClose).not.toHaveBeenCalled()
        await expect(cancel).toHaveFocus()
        rerender(fixture(false))
        await expect(cancel).toHaveFocus()
        for (const button of [close, cancel]) {
            await expect(button).not.toHaveAttribute('aria-disabled')
            await expect(button).not.toHaveAccessibleDescription(busyReason)
            button.click()
        }
        await expect(onClose).toHaveBeenCalledTimes(2)
    })

    it('tracks concurrent loading buttons across reason changes and unmounts', async () => {
        const fixture = (extra: boolean, loading: boolean, reason: string): JSX.Element => (
            <StyledDialog open dataTest='editor' busyReason={reason}>
                {extra && (
                    <StyledButton dataTest='extra' loading>
                        Extra save
                    </StyledButton>
                )}
                <StyledDialogFooter
                    secondaryAction={{ label: 'Cancel', dataTest: 'cancel' }}
                    primaryAction={{ label: 'Save', loading }}
                />
            </StyledDialog>
        )
        const { container, rerender } = mount(fixture(true, true, busyReason))
        const cancel = container.querySelector<HTMLButtonElement>('[data-testid="cancel"]')!
        await waitFor(() => expect(cancel).toHaveAccessibleDescription(busyReason))
        rerender(fixture(true, false, 'Saving in progress'))
        await expect(cancel).toHaveAttribute('aria-disabled', 'true')
        await expect(cancel).toHaveAccessibleDescription('Saving in progress')
        rerender(fixture(false, false, 'Saving in progress'))
        await expect(cancel).not.toHaveAttribute('aria-disabled')
    })

    it('blocks dismissal without inventing a default reason when none is supplied', async () => {
        const onClose = vi.fn()
        const { container } = mount(
            <StyledDialog open dataTest='editor' onClose={onClose}>
                <StyledDialogFooter
                    secondaryAction={{ label: 'Cancel', dataTest: 'cancel', onClick: onClose }}
                    primaryAction={{ label: 'Save', loading: true }}
                />
            </StyledDialog>,
        )
        for (const selector of ['[data-testid="close-button-editor"]', '[data-testid="cancel"]']) {
            const button = container.querySelector<HTMLButtonElement>(selector)!
            await expect(button).toBeDisabled()
            button.click()
        }
        await expect(onClose).not.toHaveBeenCalled()
        await expect(container).not.toHaveTextContent(busyReason)
    })
})
