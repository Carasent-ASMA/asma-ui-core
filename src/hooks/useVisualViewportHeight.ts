import { useSyncExternalStore } from 'react'

const subscribe = (callback: () => void): (() => void) => {
    const viewport = window.visualViewport
    if (!viewport) {
        window.addEventListener('resize', callback)
        return () => window.removeEventListener('resize', callback)
    }
    viewport.addEventListener('resize', callback)
    viewport.addEventListener('scroll', callback)
    return () => {
        viewport.removeEventListener('resize', callback)
        viewport.removeEventListener('scroll', callback)
    }
}

const getSnapshot = (): number => Math.round(window.visualViewport?.height ?? window.innerHeight)
// The picker only renders open on the client; any height keeps a server render from throwing.
const getServerSnapshot = (): number => 0

/**
 * The visible height in CSS px — the part of the screen the on-screen keyboard does not cover.
 *
 * iOS Safari keeps `100%`/`dvh` at the full layout height while the keyboard is up, so a list sized
 * by CSS alone ends behind the keyboard. The picker sizes its column with this instead (ASMA-8468
 * REQ-008, RISK-004 — verify on a real device).
 */
export const useVisualViewportHeight = (): number => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
