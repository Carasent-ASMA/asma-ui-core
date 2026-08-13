import { useLayoutEffect, useState } from 'react'
import type { AlertColor } from './StyledAlert'
import { SnackbarProvider as NotistackProvider, type SnackbarMessage, type SnackbarProviderProps } from 'notistack'

import { useTopmostOpenModalDialog } from 'src/hooks/useTopLayer.hook'
import { StyledAlertSnackbar } from './StyledAlertSnackbar'
import { StyledDefaultSnackbar } from './components/StyledDefaultSnackbar'
import { StyledInfoSnackbar } from './components/StyledInfoSnackbar'

/**
 * Portal host for the snackbar stack, kept parented to the topmost open modal `<dialog>` (else
 * `document.body`).
 *
 * `StyledDialog` opens via `showModal()`, which puts the dialog in the browser **top layer** — above
 * every z-index in the page. A body-portalled toast (notistack's own `z-index: 1400`) is therefore
 * painted *behind* an open dialog and is `inert` on top of that, so the only place it is both visible
 * and clickable is inside the dialog's own subtree — the same conclusion the tooltip fix reached for
 * anchored overlays (ASMA-7717).
 *
 * The host node identity is **stable for the provider's lifetime**: we MOVE it between parents rather
 * than swapping notistack's `domRoot`. A new container identity would re-create the portal and remount
 * every in-flight toast (restarting its auto-hide timer), and a toast enqueued by the same click that
 * closes the dialog — "SMS sent", the flow that reported this bug — would be lost with the unmounting
 * dialog. Moving the node re-parents the live DOM and leaves the React tree untouched.
 *
 * `display: contents` keeps the host box-less: notistack's container is `position: fixed`
 * (`pointer-events: none`), so it lays out against the viewport in either parent and never becomes a
 * flex child of the dialog's centering container. Its 1400 still clears the dialog's paper (`z-1`).
 */
const useSnackbarPortalHost = (): HTMLElement => {
    const [host] = useState(() => {
        const element = document.createElement('div')
        element.style.display = 'contents'
        element.setAttribute('data-asma-snackbar-host', '')

        return element
    })
    const topmostModalDialog = useTopmostOpenModalDialog()

    useLayoutEffect(() => {
        const parent = topmostModalDialog ?? document.body
        if (host.parentElement !== parent) parent.appendChild(host)
    }, [host, topmostModalDialog])

    // Unmount-only teardown — the re-parenting effect above must not remove the host on every move.
    useLayoutEffect(() => () => host.remove(), [host])

    return host
}

export const SnackbarProvider = (props: SnackbarProviderProps): JSX.Element => {
    const domRoot = useSnackbarPortalHost()

    return (
        <NotistackProvider
            {...props}
            Components={{
                alert: StyledAlertSnackbar,
                info: StyledInfoSnackbar,
                default: StyledDefaultSnackbar,
            }}
            autoHideDuration={6000}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            domRoot={domRoot}
            maxSnack={3}
            classes={{ root: 'min-w-fit flex justify-center' }}
            className='w-fit min-w-fit max-w-fit'
        >
            {props.children}
        </NotistackProvider>
    )
}

declare module 'notistack' {
    interface VariantOverrides {
        default: {
            severity: AlertColor
            title?: SnackbarMessage
        }
        alert: {
            alertClassName?: string
            alertVariant?: 'standard' | 'filled' | 'outlined'
            severity?: AlertColor
            closeButton?: boolean
        }
        info: {
            closeButton?: boolean
            type?: 'loading'
        }
    }
}
