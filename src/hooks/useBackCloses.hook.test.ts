import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    getOverlayBackStackSize,
    hasOverlayBackAdapter,
    isOverlayBackEnabled,
    registerOverlayBackCloser,
    requestCloseTopOverlayBack,
} from './useBackCloses.hook'

/**
 * Coordinator state-machine suite for the overlay-back registry (ASMA-8471 TASK-021), exercised
 * through a fake adapter — these tests call {@link requestCloseTopOverlayBack} directly, exactly the
 * one function a real `asma-core-helpers` history adapter calls on an owned traversal. Covers
 * TEST-007, TEST-009, TEST-010, TEST-011 and TEST-012; TEST-008 (the native `cancel` dirty-dialog
 * round trip) and the rest of TEST-007 (the two-dialog BACK-2 fixture) live in
 * `StyledDialog.interaction.test.tsx`, since they need a real `<dialog>`.
 */
describe('overlay-back registry', () => {
    it('reports an empty stack and a no-op close until something registers', () => {
        expect(getOverlayBackStackSize()).toBe(0)
        expect(requestCloseTopOverlayBack()).toBeUndefined()
    })

    it('closes only the top of a LIFO stack (TEST-007 / BACK-2)', () => {
        const closeA = vi.fn()
        const closeB = vi.fn()
        const closeC = vi.fn()
        const unregisterA = registerOverlayBackCloser(closeA)
        const unregisterB = registerOverlayBackCloser(closeB)
        const unregisterC = registerOverlayBackCloser(closeC)
        expect(getOverlayBackStackSize()).toBe(3)

        void requestCloseTopOverlayBack()
        expect(closeC).toHaveBeenCalledTimes(1)
        expect(closeB).not.toHaveBeenCalled()
        expect(closeA).not.toHaveBeenCalled()

        // The real surface unregisters itself once it actually closes — the registry never pops an
        // entry on its own behalf, it only ever calls `requestClose`.
        unregisterC()
        void requestCloseTopOverlayBack()
        expect(closeB).toHaveBeenCalledTimes(1)
        expect(closeA).not.toHaveBeenCalled()

        unregisterB()
        void requestCloseTopOverlayBack()
        expect(closeA).toHaveBeenCalledTimes(1)

        unregisterA()
        expect(getOverlayBackStackSize()).toBe(0)
    })

    it('keeps a portalled child above its parent when React registers the child first', () => {
        const closeParent = vi.fn()
        const closeChild = vi.fn()
        const parentOwner = { contains: () => false } as unknown as Element
        const unregisterChild = registerOverlayBackCloser(closeChild, null, parentOwner)
        const unregisterParent = registerOverlayBackCloser(closeParent, parentOwner)

        void requestCloseTopOverlayBack()

        expect(closeChild).toHaveBeenCalledTimes(1)
        expect(closeParent).not.toHaveBeenCalled()
        unregisterChild()
        unregisterParent()
    })

    it('latches a Promise-returning close: Back does nothing until it settles (TEST-009)', async () => {
        let resolvePending: (() => void) | undefined
        const requestClose = vi.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolvePending = resolve
                }),
        )
        const unregister = registerOverlayBackCloser(requestClose)

        void requestCloseTopOverlayBack()
        expect(requestClose).toHaveBeenCalledTimes(1)

        // Latched: a repeated Back is a no-op while the promise is pending.
        void requestCloseTopOverlayBack()
        void requestCloseTopOverlayBack()
        expect(requestClose).toHaveBeenCalledTimes(1)

        resolvePending?.()
        await Promise.resolve()
        await Promise.resolve()

        // Settled: the latch clears and the next Back calls through again.
        void requestCloseTopOverlayBack()
        expect(requestClose).toHaveBeenCalledTimes(2)

        unregister()
    })

    it('a no-safe-choice top consumes Back without falling through to what is underneath (TEST-010)', () => {
        const closeLower = vi.fn()
        const noSafeChoice = vi.fn(() => undefined)
        const unregisterLower = registerOverlayBackCloser(closeLower)
        const unregisterTop = registerOverlayBackCloser(noSafeChoice)

        void requestCloseTopOverlayBack()

        expect(noSafeChoice).toHaveBeenCalledTimes(1)
        expect(closeLower).not.toHaveBeenCalled()
        // Nothing was popped — the guard still protects the page underneath.
        expect(getOverlayBackStackSize()).toBe(2)

        unregisterTop()
        unregisterLower()
    })

    it('register → unregister → register (StrictMode double-invoke) leaves exactly one entry (TEST-011)', () => {
        const requestClose = vi.fn()
        const firstUnregister = registerOverlayBackCloser(requestClose)
        firstUnregister()
        const secondUnregister = registerOverlayBackCloser(requestClose)

        expect(getOverlayBackStackSize()).toBe(1)

        void requestCloseTopOverlayBack()
        expect(requestClose).toHaveBeenCalledTimes(1)

        secondUnregister()
        expect(getOverlayBackStackSize()).toBe(0)
    })

    it('unregister is idempotent and cannot pop an unrelated entry', () => {
        const closeOuter = vi.fn()
        const closeInner = vi.fn()
        const unregisterOuter = registerOverlayBackCloser(closeOuter)
        const unregisterInner = registerOverlayBackCloser(closeInner)

        unregisterInner()
        unregisterInner()
        expect(getOverlayBackStackSize()).toBe(1)
        void requestCloseTopOverlayBack()
        expect(closeOuter).toHaveBeenCalledTimes(1)

        unregisterOuter()
    })

    describe('without a live history adapter (TEST-012)', () => {
        // This project runs in a plain Node environment (no DOM), same as `useTopLayer.hook.test.ts`
        // — so "no window at all" is exercised for free by every test above. This block adds back a
        // minimal fake `window` (mirroring the sandbox-resolution tests next to it) purely to prove
        // that even WITH a window present, this module calls nothing on `history` by itself.
        const globals = globalThis as { window?: unknown; document?: unknown }

        afterEach(() => {
            delete globals.window
            delete globals.document
        })

        const fakeWindow = (
            over: Record<string, unknown> = {},
        ): Window & { __ASMA__SHELL__?: { overlayBack?: { v?: number } } } =>
            ({
                history: { pushState: vi.fn(), replaceState: vi.fn(), back: vi.fn(), go: vi.fn() },
                ...over,
            }) as unknown as Window & { __ASMA__SHELL__?: { overlayBack?: { v?: number } } }

        it('reports no adapter when __ASMA__SHELL__ is absent, and never calls history itself', () => {
            const real = fakeWindow()
            globals.window = real
            globals.document = { defaultView: real }

            expect(hasOverlayBackAdapter()).toBe(false)

            const unregister = registerOverlayBackCloser(() => undefined)
            void requestCloseTopOverlayBack()
            unregister()

            expect(real.history.pushState).not.toHaveBeenCalled()
            expect(real.history.replaceState).not.toHaveBeenCalled()
            expect(real.history.back).not.toHaveBeenCalled()
            expect(real.history.go).not.toHaveBeenCalled()
        })

        it('reports an adapter only when overlayBack.v === 1', () => {
            const real = fakeWindow({ __ASMA__SHELL__: { overlayBack: { v: 1, enabled: false } } })
            globals.window = real
            globals.document = { defaultView: real }
            expect(hasOverlayBackAdapter()).toBe(true)
            expect(isOverlayBackEnabled()).toBe(false)

            real.__ASMA__SHELL__ = { overlayBack: { v: 1, enabled: true } }
            expect(isOverlayBackEnabled()).toBe(true)

            real.__ASMA__SHELL__ = { overlayBack: { v: 2, enabled: true } }
            expect(hasOverlayBackAdapter()).toBe(false)
            expect(isOverlayBackEnabled()).toBe(false)
        })
    })

    /**
     * The coordinator contract with the real `asma-core-helpers` adapter (PR #51, ASMA-8476):
     * `window.__ASMA__SHELL__.overlayBack = { v: 1, enabled, register }`. `register(requestClose)`
     * returns an unregister; ui-core calls it exactly once — when the stack goes empty → non-empty —
     * with a closer that always delegates to whatever is CURRENTLY on top, and calls the returned
     * unregister exactly once — when the stack drains back to empty.
     */
    describe('adapter integration (coordinator contract)', () => {
        const globals = globalThis as { window?: unknown; document?: unknown }

        afterEach(() => {
            delete globals.window
            delete globals.document
        })

        interface FakeOverlayBackAdapter {
            v?: number
            enabled?: boolean
            register?: (requestClose: () => void | Promise<unknown>) => () => void
        }

        const installFakeShell = (
            overlayBack: FakeOverlayBackAdapter | undefined,
        ): {
            registerSpy: ReturnType<typeof vi.fn>
            unregisterSpy: ReturnType<typeof vi.fn>
            history: { pushState: ReturnType<typeof vi.fn>; replaceState: ReturnType<typeof vi.fn>; back: ReturnType<typeof vi.fn>; go: ReturnType<typeof vi.fn> }
        } => {
            const unregisterSpy = vi.fn()
            const registerSpy = vi.fn(() => unregisterSpy)
            const history = { pushState: vi.fn(), replaceState: vi.fn(), back: vi.fn(), go: vi.fn() }
            const real = {
                history,
                __ASMA__SHELL__:
                    overlayBack === undefined
                        ? undefined
                        : {
                              overlayBack: {
                                  ...overlayBack,
                                  register: 'register' in overlayBack ? overlayBack.register : registerSpy,
                              },
                          },
            }
            globals.window = real
            globals.document = { defaultView: real }
            return { registerSpy, unregisterSpy, history }
        }

        const expectNoHistoryCalls = (history: ReturnType<typeof installFakeShell>['history']): void => {
            expect(history.pushState).not.toHaveBeenCalled()
            expect(history.replaceState).not.toHaveBeenCalled()
            expect(history.back).not.toHaveBeenCalled()
            expect(history.go).not.toHaveBeenCalled()
        }

        it('registers exactly once when the stack becomes non-empty, and the closer delegates to the CURRENT top', () => {
            const { registerSpy } = installFakeShell({ v: 1, enabled: false })
            const closeA = vi.fn()
            const closeB = vi.fn()

            const unregisterA = registerOverlayBackCloser(closeA)
            expect(registerSpy).toHaveBeenCalledTimes(1)
            const adapterCloser = registerSpy.mock.calls[0]?.[0] as () => void

            adapterCloser()
            expect(closeA).toHaveBeenCalledTimes(1)
            expect(closeB).not.toHaveBeenCalled()

            // A second overlay stacks on top — no second `register()` call, the SAME closer now
            // delegates to B, proving it reads the stack live rather than closing over A forever.
            const unregisterB = registerOverlayBackCloser(closeB)
            expect(registerSpy).toHaveBeenCalledTimes(1)

            adapterCloser()
            expect(closeB).toHaveBeenCalledTimes(1)
            expect(closeA).toHaveBeenCalledTimes(1)

            unregisterB()
            unregisterA()
        })

        it('unregisters the adapter once the stack drains to empty', async () => {
            const { registerSpy, unregisterSpy } = installFakeShell({ v: 1, enabled: false })
            const unregister = registerOverlayBackCloser(vi.fn())
            expect(registerSpy).toHaveBeenCalledTimes(1)

            unregister()
            expect(unregisterSpy).not.toHaveBeenCalled()

            await Promise.resolve()
            expect(unregisterSpy).toHaveBeenCalledTimes(1)
        })

        it('StrictMode cleanup/setup defers the release by a microtask, and re-registration cancels it (no transient drain)', async () => {
            const { registerSpy, unregisterSpy } = installFakeShell({ v: 1, enabled: false })
            const requestClose = vi.fn()

            // Mount, cleanup, mount again — synchronously, exactly like React StrictMode's dev-only
            // double effect invoke, before any microtask gets a turn.
            const firstUnregister = registerOverlayBackCloser(requestClose)
            firstUnregister()
            const secondUnregister = registerOverlayBackCloser(requestClose)

            expect(registerSpy).toHaveBeenCalledTimes(1)
            expect(unregisterSpy).not.toHaveBeenCalled()

            // Flush the deferred release — it must observe the stack is non-empty again and no-op.
            await Promise.resolve()
            await Promise.resolve()
            expect(unregisterSpy).not.toHaveBeenCalled()
            expect(registerSpy).toHaveBeenCalledTimes(1)

            secondUnregister()
            await Promise.resolve()
            expect(unregisterSpy).toHaveBeenCalledTimes(1)
        })

        it('never calls register or history when overlayBack is absent (TEST-012)', () => {
            const { registerSpy, history } = installFakeShell(undefined)
            const unregister = registerOverlayBackCloser(vi.fn())
            void requestCloseTopOverlayBack()
            unregister()
            expect(registerSpy).not.toHaveBeenCalled()
            expectNoHistoryCalls(history)
        })

        it('never calls register or history on a version other than 1 (TEST-012)', () => {
            const { registerSpy, history } = installFakeShell({ v: 2, enabled: false })
            const unregister = registerOverlayBackCloser(vi.fn())
            void requestCloseTopOverlayBack()
            unregister()
            expect(registerSpy).not.toHaveBeenCalled()
            expectNoHistoryCalls(history)
        })

        it('never calls register or history when overlayBack.register is not a function (TEST-012)', () => {
            const { registerSpy, history } = installFakeShell({ v: 1, enabled: false, register: undefined })
            const unregister = registerOverlayBackCloser(vi.fn())
            void requestCloseTopOverlayBack()
            unregister()
            expect(registerSpy).not.toHaveBeenCalled()
            expectNoHistoryCalls(history)
        })
    })
})
