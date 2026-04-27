import { useSyncExternalStore } from 'react'

// ── Media query strings ───────────────────────────────────────────────────────
// Values must stay in sync with asma-types/src/interfaces/breakpoints.ts
// Inlined here to avoid a circular dependency between asma-ui-core and asma-types.

const mq = {
    mobile: '(max-width: 743px)',
    tablet: '(min-width: 744px) and (max-width: 1023px)',
    tabletDesktop: '(min-width: 1024px) and (max-width: 1279px)',
    desktop: '(min-width: 1280px)',
} as const

// ── Internal helpers ─────────────────────────────────────────────────────────

const subscribe = (query: string) => (callback: () => void) => {
    const media = window.matchMedia(query)
    media.addEventListener('change', callback)
    return () => media.removeEventListener('change', callback)
}

const getSnapshot = (query: string) => () => window.matchMedia(query).matches

const getServerSnapshot = () => false

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Low-level hook. Prefer useBreakpoints() in most cases.
 * Returns true while the given media query matches.
 */
export function useMediaQuery(query: string): boolean {
    return useSyncExternalStore(subscribe(query), getSnapshot(query), getServerSnapshot)
}

/**
 * Returns named boolean flags for all breakpoint ranges.
 * Re-renders only when a breakpoint boundary is crossed.
 */
export function useBreakpoints(): {
    isMobile: boolean
    isTablet: boolean
    isTabletDesktop: boolean
    isDesktop: boolean
    isMobileOrTablet: boolean
    isCompact: boolean
} {
    const isMobile = useMediaQuery(mq.mobile)
    const isTablet = useMediaQuery(mq.tablet)
    const isTabletDesktop = useMediaQuery(mq.tabletDesktop)
    const isDesktop = useMediaQuery(mq.desktop)

    return {
        isCompact: isMobile || isTablet || isTabletDesktop,
        isDesktop,
        isMobile,
        isMobileOrTablet: isMobile || isTablet,
        isTablet,
        isTabletDesktop,
    }
}

/**
 * One-time read helpers — used only by getViewport.ts to initialize the
 * MobX store at startup. Not for use in components.
 */
export const isMobileView = (windowWidth: number): boolean => windowWidth <= 743
export const isTabletView = (windowWidth: number): boolean => windowWidth <= 1279

/**
 * Convenience hook. Use useBreakpoints() if you need multiple flags.
 */
export function useIsMobileView(): boolean {
    const { isMobile } = useBreakpoints()
    return isMobile
}
