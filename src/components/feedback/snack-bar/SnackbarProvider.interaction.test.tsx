import { afterEach, describe, it } from 'vitest'
import { expect, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { SnackbarProvider } from './SnackbarProvider'
import { message } from './message'

/**
 * Global snackbar routing (ASMA-8414). The shell mounts a host `SnackbarProvider`, and every app
 * widget mounts its own through `AppProviders`. notistack alone routes global toasts to the LAST
 * constructed provider and never restores it, so a toast was lost whenever that widget unmounted —
 * e.g. "Event saved" after the calendar edit dialog (embedding other apps' widgets) closed on save.
 * Each `mount` is its own React root, as a widget loaded into the host page is.
 */

const isShown = (text: string): boolean =>
    [...document.querySelectorAll('*')].some(
        (element) =>
            element.childElementCount === 0 &&
            element.textContent === text &&
            (element as HTMLElement).checkVisibility(),
    )

// A dropped toast never shows up, so give a lost one the time it would have needed to render.
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 500))

describe('global snackbar routing', () => {
    afterEach(cleanup)

    it('shows a global message through the host provider', async () => {
        mount(<SnackbarProvider />)

        message.info('Host only')

        await waitFor(() => expect(isShown('Host only')).toBe(true))
    })

    it('still shows a global message after a later widget provider unmounted', async () => {
        mount(<SnackbarProvider />)
        const widget = mount(<SnackbarProvider />)
        widget.unmount()

        message.info('After widget unmount')
        await settle()

        await expect(isShown('After widget unmount')).toBe(true)
    })

    it('keeps a global message shown when the widget that raised it unmounts', async () => {
        mount(<SnackbarProvider />)
        const widget = mount(<SnackbarProvider />)

        message.info('Saved then closed')
        widget.unmount()
        await settle()

        await expect(isShown('Saved then closed')).toBe(true)
    })

    it('closes a global message through the provider that shows it', async () => {
        mount(<SnackbarProvider />)
        mount(<SnackbarProvider />)

        const close = message.info('Closable', { id: 'closable' })
        await waitFor(() => expect(isShown('Closable')).toBe(true))
        close()

        await waitFor(() => expect(isShown('Closable')).toBe(false))
    })
})
