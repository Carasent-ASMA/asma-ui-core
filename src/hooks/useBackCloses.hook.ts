import { useEffect, useRef } from 'react'

/**
 * ASMA-8471 — native Back closes the top ui-core overlay through its own close path.
 *
 * This module owns ONLY the overlay side of the contract: a LIFO registry of open overlays plus the
 * arbitration that decides which one a Back press (or a native dialog `cancel`/`close`) acts on. It
 * never touches browser history — no `pushState`, `back()` or `go()` — that lives in
 * `asma-core-helpers`' `getHistory()` adapter, a separate package. When that adapter is present it
 * discovers a live guard and, on a owned traversal, calls {@link requestCloseTopOverlayBack} directly;
 * when it is absent (an old host, or Storybook) this module still tracks the stack correctly, it is
 * only never driven by anything beyond `StyledDialog`'s own native `cancel`/`close` arbitration.
 *
 * **Window-scoped, not module-scoped** — same reasoning as `useTopLayer.hook.ts`'s
 * `__asmaOpenModalDialogRegistry__`: a normal (non-`KERNEL_EXTERNAL`) build instantiates this module
 * once per micro-frontend bundle, so a module-level array would give every bundle its own stack and
 * "close only the top" would silently become "close only MY top". `document.defaultView` (or
 * `rawWindow` under the `asma-micro-app` sandbox) is the one object every bundle in the page shares.
 */
export const OVERLAY_BACK_REGISTRY_VERSION = 1

/** Returns nothing: no latch, a repeated Back repeats the dismissal. Returns a Promise: the entry
 *  latches until it settles, and Back on a latched top does nothing (see `requestCloseTopOverlayBack`). */
export type OverlayBackRequestClose = () => void | Promise<unknown>

interface OverlayBackEntry {
    requestClose: OverlayBackRequestClose
    pending: boolean
}

interface OverlayBackRegistry {
    version: number
    entries: OverlayBackEntry[]
}

declare global {
    interface Window {
        rawWindow?: Window
        __asmaOverlayBackRegistry__?: OverlayBackRegistry
        /** Published by `asma-core-helpers`' `getHistory()` adapter (PAT-002). Absent, or `v` other
         *  than `1`, means no history adapter is live — this module then runs registry-only. */
        __ASMA__SHELL__?: { overlayBack?: { v?: number; enabled?: boolean } }
    }
}

function getOverlayBackRegistry(): OverlayBackRegistry {
    // No DOM (this module's own Node-environment unit tests) — module-scope is a safe fallback since
    // there is only ever one instance of the process.
    if (typeof window === 'undefined') {
        return (nodeFallbackRegistry ??= { version: OVERLAY_BACK_REGISTRY_VERSION, entries: [] })
    }

    const globalWindow = window.rawWindow ?? document.defaultView ?? window
    return (globalWindow.__asmaOverlayBackRegistry__ ??= { version: OVERLAY_BACK_REGISTRY_VERSION, entries: [] })
}
let nodeFallbackRegistry: OverlayBackRegistry | undefined

const isPromiseLike = (value: unknown): value is Promise<unknown> =>
    typeof value === 'object' && value !== null && typeof (value as Promise<unknown>).then === 'function'

/**
 * Push a LIFO entry onto the overlay-back stack. The returned unregister must run when the overlay
 * stops being eligible to receive Back (closes, or is no longer the active layer) — see
 * {@link useBackCloses} for the React lifecycle wrapper every consumer actually uses.
 */
export function registerOverlayBackCloser(requestClose: OverlayBackRequestClose): () => void {
    const entry: OverlayBackEntry = { requestClose, pending: false }
    getOverlayBackRegistry().entries.push(entry)

    return () => {
        const { entries } = getOverlayBackRegistry()
        const index = entries.indexOf(entry)
        if (index !== -1) entries.splice(index, 1)
    }
}

/**
 * Act on the topmost registered overlay, honouring the close contract's latch: a top entry whose
 * previous `requestClose` returned a Promise that hasn't settled yet is skipped entirely (one
 * documented dead press), never passed through to the next entry down — BACK-2 is "one press closes
 * one layer", not "closes the nearest dismissible one".
 *
 * `StyledDialog`'s native `cancel`/`close` arbitration calls this directly, and it is the one function
 * a history adapter (`asma-core-helpers`, a separate package) calls on an owned traversal.
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

/** Number of overlays currently registered. The core-helpers adapter reads this on each `popstate` to
 *  decide whether anything is left to arm a guard for (an empty stack drains rather than re-arming). */
export function getOverlayBackStackSize(): number {
    return getOverlayBackRegistry().entries.length
}

/** `true` when a live `asma-core-helpers` history adapter (PAT-002) has published `overlayBack.v === 1`. */
export function hasOverlayBackAdapter(): boolean {
    if (typeof window === 'undefined') return false
    const globalWindow = window.rawWindow ?? document.defaultView ?? window
    return globalWindow.__ASMA__SHELL__?.overlayBack?.v === 1
}

/**
 * Register a surface onto the overlay-back stack while `active`, so native Back closes it through its
 * own `requestClose` — see {@link requestCloseTopOverlayBack} for the arbitration. Registration is
 * ALWAYS registry-only: this hook never installs a `popstate`/history listener of its own, with or
 * without a live adapter (`hasOverlayBackAdapter`) — that would race `asma-core-helpers`' own listener
 * (CON-002/CON-009) and duplicate work the adapter already owns. Without an adapter, Back simply keeps
 * doing whatever the browser already does; ✕ and Escape are unaffected either way.
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
