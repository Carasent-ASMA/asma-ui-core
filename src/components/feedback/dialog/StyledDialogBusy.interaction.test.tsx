import { afterEach, describe, it, vi } from 'vitest'
import { useState } from 'react'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledButton } from '../../inputs/button/StyledButton'
import { StyledDialog } from './StyledDialog'
import { MinimizableDialogV2 } from '../minimizable-dialog/v2/MinimizableDialogV2'
import { StyledDialogFooter } from './dialog-footer/StyledDialogFooter'
import { PageHeader } from '../../custom/page/page-header/PageHeader'

const busyReason = 'Wait until saved'

describe('StyledDialog explains busy dismissal controls', () => {
    afterEach(() => {
        cleanup()
        localStorage.removeItem('lang')
    })

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

    it('lets a nested dialog close with Escape while the outer dialog is busy', async () => {
        const onOuterClose = vi.fn()
        const onInnerClose = vi.fn()
        const Nested = (): JSX.Element => {
            const [innerOpen, setInnerOpen] = useState(true)
            return (
                <StyledDialog open dataTest='outer' busyReason={busyReason} onClose={onOuterClose}>
                    <StyledButton dataTest='save' loading>
                        Save
                    </StyledButton>
                    <StyledDialog
                        open={innerOpen}
                        dataTest='inner'
                        onClose={() => {
                            onInnerClose()
                            setInnerOpen(false)
                        }}
                    >
                        <p>Inner</p>
                    </StyledDialog>
                </StyledDialog>
            )
        }
        const { container } = mount(<Nested />)
        await new Promise(requestAnimationFrame)
        const inner = container.querySelector<HTMLDialogElement>('[data-testid="inner"]')!
        // Prove the outer layer is busy before the key press: its close control is soft-disabled.
        const outerClose = container.querySelector<HTMLButtonElement>('[data-testid="close-button-outer"]')!
        await waitFor(() => expect(outerClose).toHaveAccessibleDescription(busyReason))

        // Focus sits in the inner layer; its Escape bubbles up through the busy outer dialog.
        inner.focus()
        await userEvent.keyboard('{Escape}')

        await waitFor(() => expect(container.querySelector('[data-testid="inner"]')).toBeNull())
        await expect(onInnerClose).toHaveBeenCalledTimes(1)
        await expect(onOuterClose).not.toHaveBeenCalled()
        await expect(container.querySelector('[data-testid="outer"]')).toHaveAttribute('open')
    })

    it('keeps the dialog busy while a loading action sits in the More menu', async () => {
        const onClose = vi.fn()
        const { container } = mount(
            <StyledDialog open dataTest='editor' onClose={onClose}>
                <StyledDialogFooter
                    leftActions={[
                        { id: 'edit', label: 'Edit', onClick: () => undefined },
                        { id: 'archive', label: 'Archive', loading: true, onClick: () => undefined },
                    ]}
                    secondaryAction={{ label: 'Cancel', dataTest: 'cancel', onClick: onClose }}
                />
            </StyledDialog>,
        )
        await new Promise(requestAnimationFrame)
        const close = container.querySelector<HTMLButtonElement>('[data-testid="close-button-editor"]')!
        const cancel = container.querySelector<HTMLButtonElement>('[data-testid="cancel"]')!
        await waitFor(() => expect(cancel).toHaveAccessibleDescription(busyReason))

        for (const button of [close, cancel]) {
            await expect(button).toHaveAttribute('aria-disabled', 'true')
            button.click()
        }
        await expect(container.querySelector('dialog')).toHaveAttribute('open')

        cancel.focus()
        await userEvent.keyboard('{Escape}')
        await expect(onClose).not.toHaveBeenCalled()
        await expect(cancel).toHaveFocus()
    })

    it('stays closable while a button that does not hold the dialog is loading', async () => {
        const onClose = vi.fn()
        const { container } = mount(
            <StyledDialog open dataTest='editor' onClose={onClose}>
                <StyledButton dataTest='search' loading holdsDialog={false}>
                    Search
                </StyledButton>
                <StyledDialogFooter secondaryAction={{ label: 'Cancel', dataTest: 'cancel', onClick: onClose }} />
            </StyledDialog>,
        )
        await new Promise(requestAnimationFrame)
        const close = container.querySelector<HTMLButtonElement>('[data-testid="close-button-editor"]')!
        const cancel = container.querySelector<HTMLButtonElement>('[data-testid="cancel"]')!
        await expect(container.querySelector('[data-testid="search"]')).toHaveAttribute('aria-busy', 'true')

        for (const button of [close, cancel]) {
            await expect(button).not.toHaveAttribute('aria-disabled')
            await expect(button).not.toHaveAccessibleDescription(busyReason)
            button.click()
        }
        cancel.focus()
        await userEvent.keyboard('{Escape}')
        await expect(onClose).toHaveBeenCalledTimes(3)
    })

    it('stays closable while a left action that does not hold the dialog is loading', async () => {
        const preview = { id: 'preview', label: 'Preview', loading: true, holdsDialog: false, onClick: () => undefined }
        const placements = {
            inline: [preview],
            more: [{ id: 'edit', label: 'Edit', onClick: () => undefined }, preview],
        }
        for (const [placement, leftActions] of Object.entries(placements)) {
            const onClose = vi.fn()
            const { container } = mount(
                <StyledDialog open dataTest='editor' onClose={onClose}>
                    <div style={{ width: 480 }}>
                        <StyledDialogFooter
                            leftActions={leftActions}
                            secondaryAction={{ label: 'Cancel', dataTest: 'cancel', onClick: onClose }}
                        />
                    </div>
                </StyledDialog>,
            )
            await new Promise(requestAnimationFrame)
            const busyMarker =
                placement === 'inline'
                    ? '[data-testid="dynamic-toolbar-action-preview"][aria-busy="true"]'
                    : '[data-testid="styled-dialog-footer-more"]'
            await waitFor(() => expect(container.querySelector(busyMarker)).not.toBeNull())
            const close = container.querySelector<HTMLButtonElement>('[data-testid="close-button-editor"]')!
            const cancel = container.querySelector<HTMLButtonElement>('[data-testid="cancel"]')!

            for (const button of [close, cancel]) {
                await expect(button).not.toHaveAttribute('aria-disabled')
                await expect(button).not.toHaveAccessibleDescription(busyReason)
                button.click()
            }
            cancel.focus()
            await userEvent.keyboard('{Escape}')
            await expect(onClose).toHaveBeenCalledTimes(3)
            cleanup()
        }
    })

    it('holds the dialog while a loading header action sits in the More menu, unless it opts out', async () => {
        for (const [holdsDialog, closes] of [
            [undefined, 0],
            [false, 3],
        ] as const) {
            const onClose = vi.fn()
            const { container } = mount(
                <StyledDialog open dataTest='editor' onClose={onClose}>
                    <div style={{ width: 240 }}>
                        <PageHeader
                            title='Editor'
                            actions={[
                                { id: 'edit', label: 'Edit', onClick: () => undefined },
                                {
                                    id: 'save',
                                    label: 'Save',
                                    loading: true,
                                    holdsDialog,
                                    measureInStrip: false,
                                    estimatedWidthPx: 120,
                                    onClick: () => undefined,
                                },
                            ]}
                        />
                    </div>
                    <StyledDialogFooter secondaryAction={{ label: 'Cancel', dataTest: 'cancel', onClick: onClose }} />
                </StyledDialog>,
            )
            await waitFor(() =>
                expect(container.querySelector('[data-testid="dynamic-toolbar-overflow-actions"]')).not.toBeNull(),
            )
            await new Promise(requestAnimationFrame)
            await expect(container.querySelector('[data-testid="dynamic-toolbar-action-save"]')).toBeNull()
            const close = container.querySelector<HTMLButtonElement>('[data-testid="close-button-editor"]')!
            const cancel = container.querySelector<HTMLButtonElement>('[data-testid="cancel"]')!

            for (const button of [close, cancel]) button.click()
            cancel.focus()
            await userEvent.keyboard('{Escape}')
            await expect(onClose).toHaveBeenCalledTimes(closes)
            cleanup()
        }
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

    it('defaults busy texts to English in a Norwegian shell when no reason or locale is supplied', async () => {
        localStorage.setItem('lang', 'no')
        const onClose = vi.fn()
        const { container } = mount(
            <StyledDialog open dataTest='editor' onClose={onClose}>
                <StyledDialogFooter
                    leftActions={[
                        { id: 'edit', label: 'Edit', onClick: () => undefined },
                        { id: 'delete', label: 'Delete', onClick: () => undefined },
                    ]}
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
        await expect(container.querySelector('[data-testid="styled-dialog-footer-more"]')).toHaveAccessibleName('More')
        const statuses = Array.from(container.querySelectorAll('[role="status"]'), (status) => status.textContent)
        await expect(statuses).toContain('In progress')
        await expect(statuses).not.toContain('Pågår')
    })

    it.each([
        ['en', 'Wait until saved', 'In progress'],
        ['no', 'Vent til lagringen er ferdig', 'Pågår'],
    ] as const)('uses the dialog and footer locale %s for busy texts', async (locale, reason, announcement) => {
        localStorage.setItem('lang', locale === 'en' ? 'no' : 'en')
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

    it('uses the app busy reason of a minimizable dialog for its close button and footer Cancel', async () => {
        const reason = 'Wait until the info line is deleted'
        const { container } = mount(
            <MinimizableDialogV2 open dataTest='editor' title='Editor' onClose={() => undefined} busyReason={reason}>
                <StyledDialogFooter
                    secondaryAction={{ label: 'Cancel', dataTest: 'cancel' }}
                    primaryAction={{ label: 'Delete', loading: true }}
                />
            </MinimizableDialogV2>,
        )
        for (const close of container.querySelectorAll('[data-testid="close-button"]')) {
            await expect(close).toHaveAccessibleDescription(reason)
        }
        await expect(container.querySelector('[data-testid="cancel"]')).toHaveAccessibleDescription(reason)
    })

})
