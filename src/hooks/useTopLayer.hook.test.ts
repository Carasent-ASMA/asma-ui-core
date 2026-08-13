import { afterEach, describe, expect, it } from 'vitest'
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

    /**
     * The registry has to land on the ONE window the whole page shares. A micro-app sandbox hands the
     * app a per-app Proxy as `window`, so trusting it would strand the registry where the host's
     * SnackbarProvider can never read it — silently restoring the bug for that app. The two sandbox
     * flavours expose the real global differently: `asma-micro-app` publishes `rawWindow`, qiankun
     * only lets the real `document` through. Both are exercised here because neither is reachable
     * from the browser stories (they run outside any sandbox).
     */
    describe('resolves the shared global across micro-frontend sandboxes', () => {
        const globals = globalThis as { window?: unknown; document?: unknown }

        afterEach(() => {
            delete globals.window
            delete globals.document
        })

        /** Stand-in for a real window: only the registry slot matters to the code under test. */
        const fakeWindow = (over: Record<string, unknown> = {}): Record<string, unknown> => ({ ...over })

        it('prefers rawWindow — the asma-micro-app sandbox hatch', () => {
            const real = fakeWindow()
            const sandboxed = fakeWindow({ rawWindow: real })
            globals.window = sandboxed
            // A sandbox that proxies `document` too would still hand back the real one here.
            globals.document = { defaultView: real }

            const dialog = fakeDialog()
            const unregister = registerOpenModalDialog(dialog)

            expect(real['__asmaOpenModalDialogRegistry__']).toBeDefined()
            expect(sandboxed['__asmaOpenModalDialogRegistry__']).toBeUndefined()
            unregister()
        })

        it('falls back to document.defaultView — qiankun proxies window but not document', () => {
            const real = fakeWindow()
            // qiankun's proxy sandbox never sets `rawWindow`; its `get` trap returns the real document.
            const sandboxed = fakeWindow()
            globals.window = sandboxed
            globals.document = { defaultView: real }

            const dialog = fakeDialog()
            const unregister = registerOpenModalDialog(dialog)

            expect(real['__asmaOpenModalDialogRegistry__']).toBeDefined()
            expect(sandboxed['__asmaOpenModalDialogRegistry__']).toBeUndefined()
            unregister()
        })

        it('uses window itself when nothing proxies it — the shell and every plain page', () => {
            const real = fakeWindow()
            globals.window = real
            globals.document = { defaultView: real }

            const dialog = fakeDialog()
            const unregister = registerOpenModalDialog(dialog)

            expect(getTopmostOpenModalDialog()).toBe(dialog)
            expect(real['__asmaOpenModalDialogRegistry__']).toBeDefined()
            unregister()
        })
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
