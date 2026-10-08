import {
    closeSnackbar as notistackCloseSnackbar,
    enqueueSnackbar as notistackEnqueueSnackbar,
    type ProviderContext,
    type SnackbarKey,
} from 'notistack'

/**
 * Where the global snackbar helpers (`message.*`, `processAlertSnackBar`, the exported
 * `enqueueSnackbar`/`closeSnackbar`, …) render: the **oldest still-mounted** ui-core
 * `SnackbarProvider` (ASMA-8414).
 *
 * notistack's own module-level `enqueueSnackbar` is bound to the LAST constructed provider and is
 * never restored when that provider unmounts. `asma-ui-core` is a shared kernel lib, so the shell and
 * every app share one notistack, and every app widget mounts its own provider through `AppProviders`.
 * The most recently mounted widget therefore captured every global toast in the page; once it
 * unmounted (e.g. a widget embedded in a dialog that just closed on save), toasts already shown died
 * with it and every later one was enqueued into a dead provider — silently.
 *
 * The oldest live provider is the host's (shell / AdVoca), which outlives every widget. The registry is
 * **window-scoped** for the same reason as the open-modal-dialog registry in `useTopLayer.hook`: in a
 * plain `vite dev` each micro-frontend bundles its own copy of this module, but they all share one
 * `window`.
 */
type SnackbarHost = Pick<ProviderContext, 'enqueueSnackbar' | 'closeSnackbar'>

declare global {
    interface Window {
        __asmaSnackbarHosts__?: SnackbarHost[]
    }
}

let nodeFallbackHosts: SnackbarHost[] | undefined

function getSnackbarHosts(): SnackbarHost[] {
    if (typeof window === 'undefined') return (nodeFallbackHosts ??= [])

    // Same sandbox escape as `getOpenModalDialogRegistry` in `useTopLayer.hook`.
    const globalWindow = window.rawWindow ?? document.defaultView ?? window

    return (globalWindow.__asmaSnackbarHosts__ ??= [])
}

/** Register a mounted provider's context; returns its unregister. Mount order is preserved. */
export function registerSnackbarHost(host: SnackbarHost): () => void {
    getSnackbarHosts().push(host)

    return () => {
        const hosts = getSnackbarHosts()
        const index = hosts.indexOf(host)
        if (index !== -1) hosts.splice(index, 1)
    }
}

/** Falls back to notistack's global when no ui-core provider is registered. */
const getHost = (): SnackbarHost =>
    getSnackbarHosts()[0] ?? { enqueueSnackbar: notistackEnqueueSnackbar, closeSnackbar: notistackCloseSnackbar }

// `enqueueSnackbar` is overloaded, so forward the arguments untouched rather than re-typing each form.
export const enqueueSnackbar = ((...args: unknown[]) =>
    (getHost().enqueueSnackbar as (...forwarded: unknown[]) => SnackbarKey)(...args)) as ProviderContext['enqueueSnackbar']

export const closeSnackbar: ProviderContext['closeSnackbar'] = (key) => getHost().closeSnackbar(key)
