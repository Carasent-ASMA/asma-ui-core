import { describe, expect, it } from 'vitest'
import { getTopmostOpenModalDialog, registerOpenModalDialog } from './useTopLayer.hook'

/**
 * The open-modal registry decides where an anchorless overlay (the snackbar stack) renders, and
 * "topmost" is the only correct answer: a modal `<dialog>` marks everything outside its own subtree
 * `inert`, so hosting the overlay in any other open dialog leaves it occluded AND unclickable.
 *
 * These cover the paths the browser stories can't reach — out-of-order teardown and a stale entry.
 * Ordering against a real top layer is covered by `Feedback/Snackbar` → `NestedDialogs`.
 */
const fakeDialog = (over: { open?: boolean; isConnected?: boolean } = {}): HTMLDialogElement =>
    ({ open: true, isConnected: true, ...over }) as unknown as HTMLDialogElement

describe('open modal dialog registry', () => {
    it('reports no dialog until one registers', () => {
        expect(getTopmostOpenModalDialog()).toBeUndefined()
    })

    it('reports the most recently opened dialog — showModal() order, not DOM order', () => {
        const outer = fakeDialog()
        const nested = fakeDialog()

        const unregisterOuter = registerOpenModalDialog(outer)
        const unregisterNested = registerOpenModalDialog(nested)
        expect(getTopmostOpenModalDialog()).toBe(nested)

        // Unwinding the stack hands the top layer back to the dialog underneath.
        unregisterNested()
        expect(getTopmostOpenModalDialog()).toBe(outer)

        unregisterOuter()
        expect(getTopmostOpenModalDialog()).toBeUndefined()
    })

    it('keeps the topmost dialog when one underneath closes out of order', () => {
        const first = fakeDialog()
        const second = fakeDialog()
        const third = fakeDialog()
        const unregisterFirst = registerOpenModalDialog(first)
        const unregisterSecond = registerOpenModalDialog(second)
        const unregisterThird = registerOpenModalDialog(third)

        unregisterSecond()
        expect(getTopmostOpenModalDialog()).toBe(third)

        unregisterThird()
        expect(getTopmostOpenModalDialog()).toBe(first)
        unregisterFirst()
    })

    it('is idempotent — a repeated unregister cannot pop an unrelated dialog', () => {
        const outer = fakeDialog()
        const nested = fakeDialog()
        const unregisterOuter = registerOpenModalDialog(outer)
        const unregisterNested = registerOpenModalDialog(nested)

        unregisterNested()
        unregisterNested()
        expect(getTopmostOpenModalDialog()).toBe(outer)
        unregisterOuter()
    })

    it('skips a stale entry instead of stranding the overlay in a detached subtree', () => {
        const live = fakeDialog()
        const detached = fakeDialog({ isConnected: false })
        const closed = fakeDialog({ open: false })
        const unregisterLive = registerOpenModalDialog(live)
        const unregisterDetached = registerOpenModalDialog(detached)
        const unregisterClosed = registerOpenModalDialog(closed)

        expect(getTopmostOpenModalDialog()).toBe(live)

        unregisterLive()
        expect(getTopmostOpenModalDialog()).toBeUndefined()
        unregisterDetached()
        unregisterClosed()
    })
})
