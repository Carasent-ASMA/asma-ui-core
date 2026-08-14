import { useCallback, useSyncExternalStore, type CSSProperties } from 'react'

/**
 * Promote a Floating UI element into the browser **top layer** so it paints above a native modal
 * `<dialog>` — but **only when the floating node is NOT already portalled into that dialog**.
 *
 * `StyledDialog` opens via `<dialog>.showModal()`, which puts the dialog in the top layer. The top
 * layer sits above the entire normal stacking context, so a popover/menu/listbox portalled to
 * `document.body` is occluded by the dialog **no matter how high its `z-index`** (and is `inert`
 * while the modal is open).
 *
 * Two complementary fixes:
 * 1. **Portal into the open modal `<dialog>`** (see {@link getOpenModalDialogAncestor}) — escapes
 *    `inert` and paints inside the dialog's own top-layer entry via normal z-index.
 * 2. **Popover API** (`popover="manual"` + `showPopover()`) — only when portalling to `document.body`
 *    (e.g. nested under another top-layer `StyledPopover`). Nested `showPopover()` *inside* a modal
 *    dialog is unreliable on mobile Safari: it either no-ops (UA keeps
 *    `[popover]:not(:popover-open){display:none!important}` → looks like it never opened) or stacks
 *    the popover *under* the dialog. Use {@link shouldUsePopoverTopLayer} to gate (1) vs (2).
 *
 * Usage when body-portalled: spread {@link TOP_LAYER_PROPS}, put {@link TOP_LAYER_RESET_STYLE} before
 * `...floatingStyles`, `strategy: 'fixed'`, and pass `refs.setFloating` to {@link useTopLayerRef}.
 * Promoting on the ref callback (not a `useEffect`) runs the instant the node is connected.
 */
export const TOP_LAYER_PROPS = { popover: 'manual' } as const

/**
 * Neutralises the UA popover box styles (`[popover]{ inset: 0; margin: auto }`) that would
 * otherwise fight Floating UI's `top`/`left`. Spread this BEFORE `...floatingStyles`.
 */
export const TOP_LAYER_RESET_STYLE: CSSProperties = { margin: 0, inset: 'auto' }

/**
 * Find the nearest **open modal** `<dialog>` ancestor of a reference node, or `undefined`.
 *
 * A native modal `<dialog>` (`showModal()`) marks every node **outside its own subtree** as `inert`
 * — including a popover we promote into the top layer. An inert popover still *paints* (so it looks
 * fine, even on top), but it is skipped by hit-testing: pointer clicks fall through to the dialog
 * behind it and options can't be selected. Promoting to the top layer only fixes painting/z-order,
 * NOT inertness. The one place a popover is both unclipped *and* interactive is **inside the modal
 * dialog's own subtree** (descendant of the dialog → not inert; dialog is already fullscreen
 * `inset-0`, so in-dialog `position:fixed` + z-index clears the paper without a nested Popover API
 * entry). Returns `undefined` for the non-dialog case (and for non-modal containers like
 * `MinimizableDialog`, which are plain z-indexed `<div>`s), so the caller falls back to the default
 * body portal.
 */
export function getOpenModalDialogAncestor(node: unknown): HTMLElement | undefined {
    if (!(node instanceof Element)) return undefined
    const dialog = node.closest('dialog')
    return dialog instanceof HTMLDialogElement && dialog.open ? dialog : undefined
}

declare global {
    interface Window {
        // Set by the micro-app sandbox (see `asma-micro-app`'s `with` sandbox) to the UN-proxied
        // global when `window` itself is a per-microapp Proxy. `asma-event-bus` uses the same escape
        // hatch for the same reason. Only ONE of the two sandbox flavours publishes it — see
        // `getOpenModalDialogRegistry` below for how qiankun's is escaped.
        rawWindow?: Window
        __asmaOpenModalDialogRegistry__?: OpenModalDialogRegistry
    }
}

interface OpenModalDialogRegistry {
    dialogs: HTMLDialogElement[]
    listeners: Set<() => void>
}

/**
 * Open modal `<dialog>`s in **top-layer order**: index 0 = first opened (bottom), last = topmost.
 *
 * `getOpenModalDialogAncestor` covers every overlay that has an *anchor* inside the dialog. A global,
 * imperatively-raised overlay (the snackbar stack — `enqueueSnackbar` can fire from anywhere) has no
 * anchor, so it needs the topmost open modal of the *document* instead. That order is NOT derivable
 * from the DOM: top-layer paint order is `showModal()` CALL order, while `querySelectorAll` returns
 * document order — for nested dialogs the two can disagree, and portalling into anything but the
 * topmost modal leaves the overlay both occluded and `inert`. So `StyledDialog` publishes here.
 *
 * **Window-scoped, not module-scoped** (ASMA-7719 follow-up): `StyledDialog` (e.g. the Reject
 * dialog, loaded as a remote widget via `EsmWidgetHost`) and the `SnackbarProvider`/`StyledSnackbar`
 * reading this registry (hosted by the shell) routinely live in SEPARATE micro-frontend bundles.
 * `import()`-ing a URL instantiates that module fresh per bundle unless the specifier is genuinely
 * deduped by the browser's native-ESM loader via the kernel import map — and that only happens for
 * `KERNEL_EXTERNAL=true` builds (CI/preview/prod), never plain local `vite dev`. A module-level array
 * would silently give each bundle its own registry, so `registerOpenModalDialog` calls from one
 * app's copy would never reach another app's `getTopmostOpenModalDialog` — reproducing this exact
 * bug locally no matter how the fix is deployed. `EsmWidgetHost` mounts widgets via `import()` into
 * the HOST's own `document` (no iframe), so `window` — unlike the JS module graph — genuinely is one
 * shared object across every micro-frontend in the page; this mirrors `asma-event-bus`'s
 * `window.ASMA_EVENT_BUS` singleton, including its `rawWindow` escape hatch for when the micro-app
 * sandbox proxies `window` itself.
 */
function getOpenModalDialogRegistry(): OpenModalDialogRegistry {
    // No DOM at all (e.g. this module's own Node-environment unit tests) — module-scope is a safe
    // fallback there since there is only ever one instance in that process.
    if (typeof window === 'undefined') return (nodeFallbackRegistry ??= { dialogs: [], listeners: new Set() })

    // Reach the ONE window every micro-frontend in the page shares, escaping EITHER sandbox flavour.
    // A sandboxed micro-app sees a per-app Proxy as `window`, so writing the registry there would
    // strand it where the host's SnackbarProvider can never read it — the module-scope bug one level
    // down. `asma-micro-app` publishes the un-proxied global as `rawWindow`; qiankun's proxy sandbox
    // does NOT, but its `get` trap returns the REAL `document` (only `window`/`self`/`globalThis`/
    // `top`/`parent` are trapped back to the Proxy), so `document.defaultView` escapes it. Outside a
    // sandbox — and in the shell itself — all three resolve to the same object.
    const globalWindow = window.rawWindow ?? document.defaultView ?? window

    return (globalWindow.__asmaOpenModalDialogRegistry__ ??= { dialogs: [], listeners: new Set() })
}
let nodeFallbackRegistry: OpenModalDialogRegistry | undefined

// Copy first: a listener may re-render a subscriber that unsubscribes mid-notify.
const notifyOpenModalDialogListeners = (): void => {
    for (const listener of [...getOpenModalDialogRegistry().listeners]) listener()
}

/**
 * Publish an open modal `<dialog>` as the current top-layer occupant. Call right after
 * `showModal()`; the returned unregister must run before/as the dialog closes. `StyledDialog` wires
 * this from the same layout effect that opens the dialog.
 */
export function registerOpenModalDialog(dialog: HTMLDialogElement): () => void {
    getOpenModalDialogRegistry().dialogs.push(dialog)
    notifyOpenModalDialogListeners()

    return () => {
        const { dialogs } = getOpenModalDialogRegistry()
        const index = dialogs.indexOf(dialog)
        if (index === -1) return
        dialogs.splice(index, 1)
        notifyOpenModalDialogListeners()
    }
}

/**
 * The modal `<dialog>` currently at the top of the browser top layer, or `undefined` when no ui-core
 * modal is open. Stale entries (a dialog torn down without its cleanup running) are skipped rather
 * than trusted, so a missed unregister can never strand an overlay in a detached subtree.
 */
export function getTopmostOpenModalDialog(): HTMLDialogElement | undefined {
    const { dialogs } = getOpenModalDialogRegistry()
    for (let index = dialogs.length - 1; index >= 0; index -= 1) {
        const dialog = dialogs[index]
        if (dialog?.isConnected && dialog.open) return dialog
    }

    return undefined
}

const subscribeToOpenModalDialogs = (listener: () => void): (() => void) => {
    getOpenModalDialogRegistry().listeners.add(listener)
    return () => {
        getOpenModalDialogRegistry().listeners.delete(listener)
    }
}

/**
 * Reactive {@link getTopmostOpenModalDialog} — re-renders the caller when a modal `<dialog>` opens or
 * closes. Use as the portal root for an **anchorless** overlay that must clear an open modal
 * (`SnackbarProvider`, `StyledSnackbar`); anchored overlays use {@link getOpenModalDialogAncestor}.
 */
export function useTopmostOpenModalDialog(): HTMLDialogElement | undefined {
    return useSyncExternalStore(subscribeToOpenModalDialogs, getTopmostOpenModalDialog, () => undefined)
}

/**
 * `true` when the floating node should join the top layer via the Popover API.
 * `false` when it is (or will be) portalled into an open modal `<dialog>` — see hook docs.
 */
export function shouldUsePopoverTopLayer(portalRoot: HTMLElement | undefined | null): boolean {
    return portalRoot == null
}

type RefSetter = (node: HTMLElement | null) => void

/**
 * Returns a ref callback that wires the node into Floating UI (`setFloating`) and, when `enabled`,
 * promotes it to the top layer via the Popover API. Pass `enabled: false` inside a modal dialog
 * (see {@link shouldUsePopoverTopLayer}). Degrades to plain z-index if unsupported.
 */
export function useTopLayerRef(setFloating: RefSetter, enabled = true): RefSetter {
    return useCallback(
        (node: HTMLElement | null) => {
            setFloating(node)
            if (!node || !enabled) return
            try {
                if (typeof node.showPopover === 'function' && !node.matches(':popover-open')) node.showPopover()
            } catch {
                // Popover API unavailable / element not eligible — degrade to plain z-index stacking.
            }
        },
        [setFloating, enabled],
    )
}
