import { useEffect, useRef } from 'react'

/**
 * ASMA-8471 — native Back closes the top ui-core overlay through its own close path.
 *
 * This module owns ONLY the overlay side of the contract: a LIFO registry of open overlays plus the
 * arbitration that decides which one a Back press (or a native dialog `cancel`/`close`) acts on. It
 * never touches browser history — no `pushState`, `back()` or `go()` — that lives in
 * `asma-core-helpers`' `getHistory()` adapter (PR #51, ASMA-8476), published at
 * `window.__ASMA__SHELL__.overlayBack = { v, enabled, register }`. When that adapter is live (`v ===
 * 1` and `register` is a function) this module registers ONE long-lived closer with it as soon as the
 * stack goes from empty to non-empty, and unregisters it once the stack drains back to empty — see
 * {@link registerOverlayBackCloser}. When the adapter is absent, or on a version this module doesn't
 * speak, it runs registry-only and never touches `window.__ASMA__SHELL__` at all.
 *
 * **Window-scoped, not module-scoped** — same reasoning as `useTopLayer.hook.ts`'s
 * `__asmaOpenModalDialogRegistry__`: a normal (non-`KERNEL_EXTERNAL`) build instantiates this module
 * once per micro-frontend bundle, so a module-level array would give every bundle its own stack and
 * "close only the top" would silently become "close only MY top" — and TWO bundles would each try to
 * register their own adapter closer. `document.defaultView` (or `rawWindow` under the `asma-micro-app`
 * sandbox) is the one object every bundle in the page shares, so the adapter registration state lives
 * there too.
 */
export const OVERLAY_BACK_REGISTRY_VERSION = 1

/** Returns nothing: no latch, a repeated Back repeats the dismissal. Returns a Promise: the entry
 *  latches until it settles, and Back on a latched top does nothing (see `requestCloseTopOverlayBack`). */
export type OverlayBackRequestClose = () => void | Promise<unknown>

interface OverlayBackEntry {
    requestClose: OverlayBackRequestClose
    pending: boolean
}

interface OverlayBackAdapterState {
    /** The adapter's own unregister for our one long-lived closer, once `register()` has been called. */
    unregister: (() => void) | null
}

interface OverlayBackRegistry {
    version: number
    entries: OverlayBackEntry[]
    adapter: OverlayBackAdapterState
}

/** The `asma-core-helpers` contract (PR #51, ASMA-8476): `register` hands it the current top's close
 *  function and gets back that registration's unregister. Absent, or `v` other than `1`, means no
 *  history adapter is live. */
interface OverlayBackAdapter {
    v?: number
    enabled?: boolean
    register?: (requestClose: OverlayBackRequestClose) => () => void
}

declare global {
    interface Window {
        rawWindow?: Window
        __asmaOverlayBackRegistry__?: OverlayBackRegistry
        __ASMA__SHELL__?: { overlayBack?: OverlayBackAdapter }
    }
}

function createRegistry(): OverlayBackRegistry {
    return { version: OVERLAY_BACK_REGISTRY_VERSION, entries: [], adapter: { unregister: null } }
}

/** The one window every micro-frontend in the page shares — see the module doc for why this can't be
 *  module-scoped. `undefined` only in this module's own Node-environment unit tests. */
function getSharedWindow(): Window | undefined {
    if (typeof window === 'undefined') return undefined
    return window.rawWindow ?? document.defaultView ?? window
}

function getOverlayBackRegistry(): OverlayBackRegistry {
    const sharedWindow = getSharedWindow()
    // No DOM at all — module-scope is a safe fallback since there is only ever one instance in that
    // process.
    if (!sharedWindow) return (nodeFallbackRegistry ??= createRegistry())
    return (sharedWindow.__asmaOverlayBackRegistry__ ??= createRegistry())
}
let nodeFallbackRegistry: OverlayBackRegistry | undefined

const isPromiseLike = (value: unknown): value is Promise<unknown> =>
    typeof value === 'object' && value !== null && typeof (value as Promise<unknown>).then === 'function'

/**
 * The stack went from empty to non-empty: register our ONE long-lived closer with the history
 * adapter, if a compatible one is live. The closer itself never goes stale — it always delegates to
 * {@link requestCloseTopOverlayBack}, i.e. whatever is on top of OUR stack *at the time the adapter
 * calls it* — so a single registration correctly tracks every later push/pop of our own stack without
 * ever calling `register()` again.
 */
function registerWithAdapterIfLive(registry: OverlayBackRegistry): void {
    // Already registered — including while a release is still pending one microtask out (see
    // `releaseAdapterIfStillEmpty`), since that function only clears this once it actually unregisters.
    if (registry.adapter.unregister) return

    const overlayBack = getSharedWindow()?.__ASMA__SHELL__?.overlayBack
    if (overlayBack?.v !== 1 || typeof overlayBack.register !== 'function') return // no adapter, or a version this module doesn't speak: registry-only

    registry.adapter.unregister = overlayBack.register(() => requestCloseTopOverlayBack())
}

/**
 * The stack went from non-empty to empty: release the adapter registration, but not THIS tick.
 * React StrictMode (and a very fast close-then-reopen) can unregister the last entry and register a
 * new one synchronously, back to back, before anything else runs — releasing immediately would
 * transiently drain the adapter's guard (and re-arm it) for no reason. Deferring one microtask and
 * re-checking the stack size there means a same-tick re-registration (which runs before any
 * microtask gets a turn) is observed as "still non-empty" and this becomes a no-op.
 */
function releaseAdapterIfStillEmpty(registry: OverlayBackRegistry): void {
    if (!registry.adapter.unregister) return

    void Promise.resolve().then(() => {
        if (registry.entries.length > 0) return // re-registered before this microtask ran
        const unregister = registry.adapter.unregister
        registry.adapter.unregister = null
        unregister?.()
    })
}

/**
 * Push a LIFO entry onto the overlay-back stack. The returned unregister must run when the overlay
 * stops being eligible to receive Back (closes, or is no longer the active layer) — see
 * {@link useBackCloses} for the React lifecycle wrapper every consumer actually uses.
 */
export function registerOverlayBackCloser(requestClose: OverlayBackRequestClose): () => void {
    const registry = getOverlayBackRegistry()
    const entry: OverlayBackEntry = { requestClose, pending: false }
    registry.entries.push(entry)
    if (registry.entries.length === 1) registerWithAdapterIfLive(registry)

    let unregistered = false
    return () => {
        if (unregistered) return
        unregistered = true
        const index = registry.entries.indexOf(entry)
        if (index !== -1) registry.entries.splice(index, 1)
        if (registry.entries.length === 0) releaseAdapterIfStillEmpty(registry)
    }
}

/**
 * Act on the topmost registered overlay, honouring the close contract's latch: a top entry whose
 * previous `requestClose` returned a Promise that hasn't settled yet is skipped entirely (one
 * documented dead press), never passed through to the next entry down — BACK-2 is "one press closes
 * one layer", not "closes the nearest dismissible one".
 *
 * `StyledDialog`'s native `cancel`/`close` arbitration calls this directly, and it is exactly what the
 * one closer registered with the history adapter (`asma-core-helpers`, a separate package) delegates
 * to on an owned traversal.
 */
export function requestCloseTopOverlayBack(): void | Promise<unknown> {
    const { entries } = getOverlayBackRegistry()
    const top = entries[entries.length - 1]
    if (!top || top.pending) return undefined

    const result = top.requestClose()
    if (isPromiseLike(result)) {
        top.pending = true
        const clearLatch = (): void => {
            top.pending = false
        }
        result.then(clearLatch, clearLatch)
    }
    return result
}

/** Number of overlays currently registered. */
export function getOverlayBackStackSize(): number {
    return getOverlayBackRegistry().entries.length
}

/** `true` when a live `asma-core-helpers` history adapter (PAT-002) has published `overlayBack.v === 1`. */
export function hasOverlayBackAdapter(): boolean {
    return getSharedWindow()?.__ASMA__SHELL__?.overlayBack?.v === 1
}

/**
 * Register a surface onto the overlay-back stack while `active`, so native Back closes it through its
 * own `requestClose` — see {@link requestCloseTopOverlayBack} for the arbitration. This hook never
 * installs a `popstate`/history listener of its own, with or without a live adapter — that would race
 * `asma-core-helpers`' own listener (CON-002/CON-009) and duplicate work the adapter already owns. The
 * adapter registration itself (see {@link registerOverlayBackCloser}) is driven purely by the stack's
 * empty/non-empty transitions, not by this hook.
 */
export function useBackCloses({
    active,
    requestClose,
}: {
    active: boolean
    requestClose: OverlayBackRequestClose
}): void {
    const requestCloseRef = useRef(requestClose)
    useEffect(() => {
        requestCloseRef.current = requestClose
    }, [requestClose])

    useEffect(() => {
        if (!active) return undefined
        return registerOverlayBackCloser(() => requestCloseRef.current())
    }, [active])
}
