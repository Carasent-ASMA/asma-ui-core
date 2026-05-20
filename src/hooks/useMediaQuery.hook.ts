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

    return function useMediaQuery(): boolean {
        return useSyncExternalStore(subscribe, getSnapshot)
    }
}

export const useMobileMediaQuery = makeMediaQueryStore('(max-width: 743px)')
