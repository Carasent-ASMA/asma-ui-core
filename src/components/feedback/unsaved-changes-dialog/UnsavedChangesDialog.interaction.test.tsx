import { afterEach, describe, it, vi } from 'vitest'
import { expect, page, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { getOverlayBackStackSize, requestCloseTopOverlayBack } from 'src/hooks/useBackCloses.hook'
import { UnsavedChangesDialog, type UnsavedChangesDialogProps } from './UnsavedChangesDialog'

/** A Promise the test settles itself, to hold an action in flight. */
const deferred = (): { promise: Promise<void>; resolve: () => void } => {
    let resolve = (): void => undefined
    const promise = new Promise<void>((done) => {
        resolve = done
    })
    return { promise, resolve }
}

const renderDialog = (props: Partial<UnsavedChangesDialogProps> = {}) => {
    const handlers = {
        onKeepEditing: vi.fn(),
        onDelete: vi.fn<() => void | Promise<unknown>>(),
        ...props,
    }
    const result = mount(<UnsavedChangesDialog open {...handlers} />)
    const dialog = (): HTMLDialogElement => result.container.querySelector('dialog')!
    const button = (dataTest: string): HTMLButtonElement | null =>
        result.container.querySelector<HTMLButtonElement>(`[data-testid="${dataTest}"]`)
    return { ...result, handlers, dialog, button }
}

const visibleButtonLabels = (dialog: HTMLElement): string[] =>
    Array.from(dialog.querySelectorAll('button')).map((button) => button.textContent ?? '')

describe('UnsavedChangesDialog (ASMA-8895)', () => {
    afterEach(async () => {
        cleanup()
        await page.viewport(1280, 720)
    })

    it('without save is the default: "Delete changes?", the two body lines, Delete changes and Keep editing', async () => {
        const { dialog, button } = renderDialog()
        await expect(dialog()).toHaveAccessibleName('Delete changes?')
        await expect(dialog()).toHaveTextContent('You have unsaved changes.')
        await expect(dialog()).toHaveTextContent('If you leave without saving, they are deleted.')
        await expect(visibleButtonLabels(dialog())).toEqual(['Delete changes', 'Keep editing'])
        await expect(button('save-and-leave-button')).toBeNull()
    })

    it('with save: "Save changes?" and the buttons Delete changes, Keep editing, Save and leave in that order', async () => {
        const { dialog } = renderDialog({ onSave: vi.fn() })
        await expect(dialog()).toHaveAccessibleName('Save changes?')
        await expect(visibleButtonLabels(dialog())).toEqual(['Delete changes', 'Keep editing', 'Save and leave'])
    })

    it('says "Save and refresh" only when the app asks for that label', async () => {
        const { button } = renderDialog({ onSave: vi.fn(), saveLabel: 'refresh' })
        await expect(button('save-and-leave-button')).toHaveAccessibleName('Save and refresh')
    })

    it('shows the agreed Norwegian texts', async () => {
        const { dialog } = renderDialog({ onSave: vi.fn(), locale: 'no' })
        await expect(dialog()).toHaveAccessibleName('Lagre endringene?')
        await expect(dialog()).toHaveTextContent('Du har endringer som ikke er lagret.')
        await expect(dialog()).toHaveTextContent('Hvis du går ut uten å lagre, blir de slettet.')
        await expect(visibleButtonLabels(dialog())).toEqual(['Slett endringer', 'Fortsett å redigere', 'Lagre og avslutt'])
        cleanup()
        const withoutSave = renderDialog({ locale: 'no' })
        await expect(withoutSave.dialog()).toHaveAccessibleName('Slette endringene?')
    })

    it('starts focus on Keep editing, so Enter keeps editing and never deletes', async () => {
        const onSave = vi.fn()
        const { button, handlers } = renderDialog({ onSave })
        await waitFor(() => expect(button('keep-editing-button')).toHaveFocus())
        await new Promise(requestAnimationFrame)
        await expect(button('keep-editing-button')).toHaveFocus()
        await userEvent.keyboard('{Enter}')
        await expect(handlers.onKeepEditing).toHaveBeenCalledTimes(1)
        await expect(handlers.onDelete).not.toHaveBeenCalled()
        await expect(onSave).not.toHaveBeenCalled()
    })

    it('Escape and a click outside mean Keep editing', async () => {
        const onSave = vi.fn()
        const { dialog, handlers } = renderDialog({ onSave })
        await waitFor(() => expect(document.activeElement?.textContent).toBe('Keep editing'))
        await userEvent.keyboard('{Escape}')
        await expect(handlers.onKeepEditing).toHaveBeenCalledTimes(1)
        const scrim = dialog().firstElementChild as HTMLElement
        scrim.click()
        await expect(handlers.onKeepEditing).toHaveBeenCalledTimes(2)
        await expect(handlers.onDelete).not.toHaveBeenCalled()
        await expect(onSave).not.toHaveBeenCalled()
    })

    it('registers with Back-closes-overlays, and Back means Keep editing (BACK-3)', async () => {
        const { handlers } = renderDialog({ onSave: vi.fn() })
        await waitFor(() => expect(getOverlayBackStackSize()).toBe(1))
        void requestCloseTopOverlayBack()
        await expect(handlers.onKeepEditing).toHaveBeenCalledTimes(1)
        await expect(handlers.onDelete).not.toHaveBeenCalled()
    })

    it('runs Delete changes and Save and leave once each', async () => {
        const onSave = vi.fn()
        const { button, handlers } = renderDialog({ onSave })
        button('delete-changes-button')!.click()
        await expect(handlers.onDelete).toHaveBeenCalledTimes(1)
        button('save-and-leave-button')!.click()
        await expect(onSave).toHaveBeenCalledTimes(1)
        await expect(handlers.onKeepEditing).not.toHaveBeenCalled()
    })

    it.each([
        ['delete-changes-button', 'Wait until deleted', 'onDelete'],
        ['save-and-leave-button', 'Wait until saved', 'onSave'],
    ] as const)('while %s runs it is busy, the others wait with "%s", and nothing closes the dialog', async (pressed, reason, handler) => {
        const action = deferred()
        const onDelete = vi.fn(() => (handler === 'onDelete' ? action.promise : undefined))
        const onSave = vi.fn(() => (handler === 'onSave' ? action.promise : undefined))
        const { button, dialog, handlers } = renderDialog({ onDelete, onSave })
        const pressedButton = button(pressed)!
        const others = ['delete-changes-button', 'keep-editing-button', 'save-and-leave-button']
            .filter((id) => id !== pressed)
            .map((id) => button(id)!)

        pressedButton.click()
        await waitFor(() => expect(pressedButton).toHaveAttribute('aria-busy', 'true'))
        // The label stays: the button keeps its text and its width (SUB-4).
        await expect(pressedButton).toHaveAccessibleName(pressed === 'delete-changes-button' ? 'Delete changes' : 'Save and leave')
        for (const other of others) {
            await expect(other).toHaveAttribute('aria-disabled', 'true')
            await expect(other).toHaveAccessibleDescription(reason)
            other.click()
        }
        pressedButton.click()
        await userEvent.keyboard('{Escape}')
        ;(dialog().firstElementChild as HTMLElement).click()
        void requestCloseTopOverlayBack()
        await expect(handlers.onKeepEditing).not.toHaveBeenCalled()
        await expect(onDelete).toHaveBeenCalledTimes(handler === 'onDelete' ? 1 : 0)
        await expect(onSave).toHaveBeenCalledTimes(handler === 'onSave' ? 1 : 0)
        await expect(dialog()).toHaveAttribute('open')

        action.resolve()
        await waitFor(() => expect(pressedButton).not.toHaveAttribute('aria-busy'))
        for (const other of others) await expect(other).not.toHaveAttribute('aria-disabled')
        await userEvent.keyboard('{Escape}')
        await expect(handlers.onKeepEditing).toHaveBeenCalledTimes(1)
    })

    it('shows a busy state the app drives through pendingAction', async () => {
        const { button, handlers, rerender } = renderDialog({ onSave: vi.fn(), pendingAction: 'save' })
        await expect(button('save-and-leave-button')).toHaveAttribute('aria-busy', 'true')
        await expect(button('keep-editing-button')).toHaveAccessibleDescription('Wait until saved')
        await userEvent.keyboard('{Escape}')
        await expect(handlers.onKeepEditing).not.toHaveBeenCalled()
        rerender(
            <UnsavedChangesDialog open onKeepEditing={handlers.onKeepEditing} onDelete={handlers.onDelete} onSave={vi.fn()} pendingAction='delete' />,
        )
        await expect(button('delete-changes-button')).toHaveAttribute('aria-busy', 'true')
        await expect(button('keep-editing-button')).toHaveAccessibleDescription('Wait until deleted')
        await expect(button('save-and-leave-button')).toHaveAccessibleDescription('Wait until deleted')
    })

    it('desktop: fits its content on one row, the red button 40 px left of Keep editing and Save 8 px apart', async () => {
        await page.viewport(1280, 720)
        const { button, container } = renderDialog({ onSave: vi.fn() })
        const row = container.querySelector<HTMLElement>('[data-testid="unsaved-changes-dialog-buttons"]')!
        await waitFor(() => expect(row).toHaveAttribute('data-stacked', 'false'))
        const remove = button('delete-changes-button')!.getBoundingClientRect()
        const keep = button('keep-editing-button')!.getBoundingClientRect()
        const save = button('save-and-leave-button')!.getBoundingClientRect()
        await expect(Math.round(keep.left - remove.right)).toBe(40)
        await expect(Math.round(save.left - keep.right)).toBe(8)
        await expect(remove.top).toBe(keep.top)
        const paper = row.closest('dialog > div:last-child')!
        await expect(Math.round(paper.getBoundingClientRect().width)).toBeLessThan(700)
    })

    it('small screens: 100vw − 32 px, and the buttons stack full width in the code order only when they do not fit', async () => {
        await page.viewport(320, 640)
        const { button, container } = renderDialog({ onSave: vi.fn() })
        const row = container.querySelector<HTMLElement>('[data-testid="unsaved-changes-dialog-buttons"]')!
        await waitFor(() => expect(row).toHaveAttribute('data-stacked', 'true'))
        const paper = row.closest('dialog > div:last-child')!
        await expect(Math.round(paper.getBoundingClientRect().width)).toBe(320 - 32)
        const remove = button('delete-changes-button')!.getBoundingClientRect()
        const keep = button('keep-editing-button')!.getBoundingClientRect()
        const save = button('save-and-leave-button')!.getBoundingClientRect()
        // Visual order top to bottom = DOM order, no CSS reordering (WCAG 1.3.2).
        await expect(Math.round(keep.top - remove.bottom)).toBe(24)
        await expect(Math.round(save.top - keep.bottom)).toBe(8)
        for (const rect of [remove, keep, save]) await expect(Math.round(rect.width)).toBe(320 - 32 - 32)

        // Room again: back on one row.
        await page.viewport(1280, 720)
        await waitFor(() => expect(row).toHaveAttribute('data-stacked', 'false'))
    })

    it('a phone wide enough for the row keeps the buttons on one row', async () => {
        await page.viewport(700, 640)
        const { container } = renderDialog()
        const row = container.querySelector<HTMLElement>('[data-testid="unsaved-changes-dialog-buttons"]')!
        await new Promise(requestAnimationFrame)
        await expect(row).toHaveAttribute('data-stacked', 'false')
        const paper = row.closest('dialog > div:last-child')!
        await expect(Math.round(paper.getBoundingClientRect().width)).toBe(700 - 32)
    })
})
