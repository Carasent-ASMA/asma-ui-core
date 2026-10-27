import { useEffect, useLayoutEffect, useRef } from 'react'
import { tableStorage } from '../helpers/tableStorage'

interface PersistedStateWriterOptions<T> {
    /** The entry this state is saved under; `undefined` means nothing is saved. */
    storageKey: string | undefined
    /** The table's current value, controlled state included. */
    state: T
    /** The app's default, taken from props on every render (never from `table.initialState`). */
    defaultValue: T
    /** The current key's validated saved value; `undefined` when nothing valid is saved. */
    saved: T | undefined
    /** `false` while the value is still being changed by a drag; nothing is written until it ends. */
    settled?: boolean
    /** The app owns this state: a key change blocks writes but does not set the state itself. */
    controlled?: boolean
    toSignature: (value: T) => string
    toStorage: (value: T) => string
    applyState: (value: T) => void
    /** Changes when the set of columns changes. A change after mount asks `reconcile` for a late load. */
    reconcileKey?: string
    /**
     * A late load for the current key, called when `reconcileKey` changes after mount: returns the state to
     * apply (for example widths saved for columns that have only just appeared), or `undefined`. Like a key
     * change, it is never written back.
     */
    reconcile?: (state: T) => T | undefined
}

/**
 * The storage rule for one saved table setting (ASMA-8597, REQ-004 and REQ-005).
 *
 * - A value equal to the default removes the entry; any other value writes it.
 * - Mounting, and loading a key, never write: only a change after that does.
 * - When `storageKey` changes, the new key's values are loaded into the table state in a layout effect, and
 *   nothing is written or removed under the new key until the state equals what was loaded. The old key's
 *   entry is never touched, so the old value can't be copied over the new key.
 * - When the key goes away (`undefined`), the table goes back to the app's defaults and writes nothing, so
 *   one user's values are not left on screen for whoever is shown next.
 */
export const usePersistedStateWriter = <T>(options: PersistedStateWriterOptions<T>): void => {
    const { storageKey, state, defaultValue, saved, settled = true, controlled = false } = options
    const { toSignature, toStorage, applyState, reconcileKey, reconcile } = options

    const signature = toSignature(state)
    const defaultSignature = toSignature(defaultValue)

    const hydratedKeyRef = useRef(storageKey)
    const lastSeenRef = useRef(signature)
    const blockRef = useRef<{ stale: string; loaded: string } | null>(null)

    // Runs only when the key changes, in the render that already holds the new key's `saved` value.
    useLayoutEffect(() => {
        if (hydratedKeyRef.current === storageKey) return

        hydratedKeyRef.current = storageKey
        blockRef.current = null
        lastSeenRef.current = signature

        if (!storageKey) {
            if (!controlled && signature !== defaultSignature) {
                applyState(defaultValue)
            }
            return
        }

        const target = saved ?? defaultValue
        const loaded = toSignature(target)

        blockRef.current = { stale: signature, loaded }

        if (!controlled && loaded !== signature) {
            applyState(target)
        }
        // Only a key change reloads; the closure is that render's, so it holds the new key's values.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey])

    const reconcileKeyRef = useRef(reconcileKey)

    // A late load, after the columns changed (ASMA-8597, F5). A key change has just loaded everything itself.
    useLayoutEffect(() => {
        if (reconcileKeyRef.current === reconcileKey) return

        reconcileKeyRef.current = reconcileKey

        if (!reconcile || !storageKey || blockRef.current || hydratedKeyRef.current !== storageKey) return

        const next = reconcile(state)

        if (next === undefined) return

        const loaded = toSignature(next)

        if (loaded === signature) return

        blockRef.current = { stale: signature, loaded }
        applyState(next)
        // Only a change of the columns asks for a late load; the closure is that render's.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reconcileKey])

    useEffect(() => {
        if (!storageKey || !settled) return

        const block = blockRef.current

        if (block) {
            if (signature === block.loaded) {
                blockRef.current = null
                lastSeenRef.current = signature
                return
            }

            // Still the old key's value: the load has not reached the state yet.
            if (signature === block.stale) return

            // Neither: the user changed it, which is a real change under the new key.
            blockRef.current = null
        }

        if (signature === lastSeenRef.current) return

        lastSeenRef.current = signature

        if (signature === defaultSignature) {
            tableStorage.remove(storageKey)
        } else {
            tableStorage.set(storageKey, toStorage(state))
        }
        // `state` is covered by `signature`; the callbacks are pure functions of it.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signature, storageKey, settled])
}
