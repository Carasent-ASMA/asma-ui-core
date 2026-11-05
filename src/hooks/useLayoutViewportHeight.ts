import { useSyncExternalStore } from 'react'

const subscribe = (callback: () => void): (() => void) => {
    window.addEventListener('resize', callback)
    return () => window.removeEventListener('resize', callback)
}

const getSnapshot = (): number => window.innerHeight
const getServerSnapshot = (): number => 0

/**
 * `window.innerHeight`: the layout viewport, which an on-screen keyboard does not shrink on iOS
 * Safari or Android Chrome. Layout decisions use this one; the visual viewport is only a keyboard
 * signal (see `useOnScreenKeyboardOpen`).
 */
export const useLayoutViewportHeight = (): number => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
