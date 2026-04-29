import { useSyncExternalStore } from 'react'

// Breakpoint values — kept in sync with asma-types breakpoints.ts and _breakpoints.scss
const mobileMax = 743
const tabletMin = 744
const tabletMax = 1023
const tabletDesktopMin = 1024
const tabletDesktopMax = 1279
const desktopMin = 1280

const mediaQueries = {
    mobile: `(max-width: ${mobileMax}px)`,
    tablet: `(min-width: ${tabletMin}px) and (max-width: ${tabletMax}px)`,
    tabletDesktop: `(min-width: ${tabletDesktopMin}px) and (max-width: ${tabletDesktopMax}px)`,
    desktop: `(min-width: ${desktopMin}px)`,
} as const

const subscribe = (query: string) => (callback: () => void) => {
    const media = window.matchMedia(query)
    media.addEventListener('change', callback)
    return () => media.removeEventListener('change', callback)
}

const getSnapshot = (query: string) => () => window.matchMedia(query).matches

const getServerSnapshot = () => false

export function useMediaQuery(query: string): boolean {
    return useSyncExternalStore(subscribe(query), getSnapshot(query), getServerSnapshot)
}

export function useBreakpoints(): {
    isMobile: boolean
    isTablet: boolean
    isTabletDesktop: boolean
    isDesktop: boolean
    isMobileOrTablet: boolean
    isCompact: boolean
} {
    const isMobile = useMediaQuery(mediaQueries.mobile)
    const isTablet = useMediaQuery(mediaQueries.tablet)
    const isTabletDesktop = useMediaQuery(mediaQueries.tabletDesktop)
    const isDesktop = useMediaQuery(mediaQueries.desktop)

    return {
        isCompact: isMobile || isTablet || isTabletDesktop,
        isDesktop,
        isMobile,
        isMobileOrTablet: isMobile || isTablet,
        isTablet,
        isTabletDesktop,
    }
}

export function useIsMobileView(): boolean {
    const { isMobile } = useBreakpoints()
    return isMobile
}

export function useIsTabletView(): boolean {
    const { isTablet } = useBreakpoints()
    return isTablet
}
