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
 * The full-screen picker's one-row header (ASMA-8468 REQ-007): a viewport that is short **and** wide
 * — a phone in landscape. Short alone is not enough: on an upright phone the on-screen keyboard also
 * brings the viewport under 480 px, and moving the focused search into the first row dropped the
 * keyboard, which moved the search back. Upright phones are at most about 440 px wide (iPhone Pro
 * Max); phones held sideways start at 568 px (iPhone SE).
 */
export const usePickerOneRowHeaderMediaQuery = makeMediaQueryStore('(max-height: 480px) and (min-width: 480px)')

/**
 * ASMA-8468 REQ-001: a searchable select opens as a full-screen picker below 744 CSS px wide or at
 * most 480 CSS px high. The height half is the same boundary as {@link useShortViewportMediaQuery}
 * (D-003), so a landscape phone counts as "small" for every overlay.
 */
export const useFullScreenPickerMediaQuery = makeMediaQueryStore('(max-width: 743px), (max-height: 480px)')
