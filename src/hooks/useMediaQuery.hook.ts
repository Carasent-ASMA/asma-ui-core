import { useSyncExternalStore } from 'react'

export function makeMediaQueryStore(mediaQuery: string) {
    function getSnapshot() {
        return window.matchMedia(mediaQuery).matches
    }

    function subscribe(callback: () => void) {
        const mediaQueryList = window.matchMedia(mediaQuery)
        mediaQueryList.addEventListener('change', callback)
        return () => {
            mediaQueryList.removeEventListener('change', callback)
        }
    }

    // No `window` on the server: render the desktop branch, the client corrects it on hydration.
    function getServerSnapshot() {
        return false
    }

    return function useMediaQuery(): boolean {
        return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
    }
}

export const useMobileMediaQuery = makeMediaQueryStore('(max-width: 743px)')

/** A phone in landscape: too short for a sheet capped at 90vh to leave a usable body. */
export const useShortViewportMediaQuery = makeMediaQueryStore('(max-height: 480px)')

/**
 * ASMA-8468 REQ-001: a searchable select opens as a full-screen picker below 744 CSS px wide or at
 * most 480 CSS px high. The height half is the same boundary as {@link useShortViewportMediaQuery}
 * (D-003), so a landscape phone counts as "small" for every overlay.
 */
export const useFullScreenPickerMediaQuery = makeMediaQueryStore('(max-width: 743px), (max-height: 480px)')
