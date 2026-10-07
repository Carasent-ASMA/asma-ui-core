import { afterEach, describe, it, vi } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { setUiCoreLocale } from 'src/helpers/uiCoreLocale'
import { StyledButton } from '../../inputs/button/StyledButton'
import { StyledDialog } from './StyledDialog'
import { MinimizableDialogV2 } from '../minimizable-dialog/v2/MinimizableDialogV2'
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

    it('explains busy dismissal in the shell language when no reason or locale is supplied', async () => {
        setUiCoreLocale('en')
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
            await expect(button).toHaveAttribute('aria-disabled', 'true')
            await expect(button).toHaveAccessibleDescription(busyReason)
            button.click()
        }
        await expect(onClose).not.toHaveBeenCalled()
        setUiCoreLocale(undefined)
    })

    it.each([
        ['en', 'Wait until saved', 'In progress'],
        ['no', 'Vent til lagringen er ferdig', 'Pågår'],
    ] as const)('uses the dialog and footer locale %s for busy texts', async (locale, reason, announcement) => {
        const { container } = mount(
            <StyledDialog open dataTest='editor' locale={locale}>
                <StyledDialogFooter
                    locale={locale}
                    secondaryAction={{ label: 'Cancel', dataTest: 'cancel' }}
                    primaryAction={{ label: 'Save', loading: true }}
                />
            </StyledDialog>,
        )
        for (const selector of ['[data-testid="close-button-editor"]', '[data-testid="cancel"]']) {
            await expect(container.querySelector(selector)).toHaveAccessibleDescription(reason)
        }
        const statuses = Array.from(container.querySelectorAll('[role="status"]'), (status) => status.textContent)
        await expect(statuses).toContain(announcement)
    })

    it('announces a footer action that starts loading after it rendered without a loading flag', async () => {
        const fixture = (loading?: boolean): JSX.Element => (
            <StyledDialog open dataTest='editor' locale='en'>
                <StyledDialogFooter locale='en' primaryAction={{ label: 'Save', dataTest: 'save', loading }} />
            </StyledDialog>
        )
        const { container, rerender } = mount(fixture())
        const status = container.querySelector('[role="status"]')
        await expect(status).toHaveTextContent('')
        rerender(fixture(true))
        await expect(container.querySelector('[role="status"]')).toBe(status)
        await expect(status).toHaveTextContent('In progress')
    })

    it('uses the footer locale for its fallback reason independently of the dialog locale', async () => {
        const { container } = mount(
            <StyledDialog open dataTest='editor' locale='en'>
                <StyledDialogFooter
                    locale='no'
                    secondaryAction={{ label: 'Avbryt', dataTest: 'cancel' }}
                    primaryAction={{ label: 'Lagre', loading: true }}
                />
            </StyledDialog>,
        )
        await expect(container.querySelector('[data-testid="cancel"]')).toHaveAccessibleDescription(
            'Vent til lagringen er ferdig',
        )
        await expect(container.querySelector('[data-testid="close-button-editor"]')).toHaveAccessibleDescription(
            'Wait until saved',
        )
    })

    it.each([
        ['en', 'Wait until saved'],
        ['no', 'Vent til lagringen er ferdig'],
    ] as const)('uses the minimizable dialog locale %s for its busy reason', async (locale, reason) => {
        const { container } = mount(
            <MinimizableDialogV2 open dataTest='editor' title='Editor' onClose={() => undefined} locale={locale}>
                <StyledButton dataTest='save' loading>Save</StyledButton>
            </MinimizableDialogV2>,
        )
        for (const close of container.querySelectorAll('[data-testid="close-button"]')) {
            await expect(close).toHaveAccessibleDescription(reason)
        }
    })

})
