---
'asma-ui-core': patch
---

ASMA-8414: route the global snackbar helpers to the oldest still-mounted `SnackbarProvider`.

notistack binds its module-level `enqueueSnackbar` to the most recently constructed provider and never
restores it on unmount. Because ui-core is a shared kernel library, every app widget that mounted its
own provider through `AppProviders` captured the global helpers; when that widget unmounted (for
example a widget embedded in a dialog that closed on save), toasts raised from the global helpers were
enqueued into a dead provider and silently lost.

`message.info/error/loading`, `processAlertSnackBar`, `processDefaultSnackbar`,
`processInfoSnackbar` and the `enqueueSnackbar`/`closeSnackbar` exported by ui-core now go through a
window-scoped registry of mounted providers and use the oldest live one, so a toast raised before or
after a widget-level provider unmounts stays visible. The exported `enqueueSnackbar`/`closeSnackbar`
no longer come straight from notistack; when no ui-core provider is registered they fall back to
notistack's global. Context-based `useSnackbar()` callers keep using their nearest provider.
