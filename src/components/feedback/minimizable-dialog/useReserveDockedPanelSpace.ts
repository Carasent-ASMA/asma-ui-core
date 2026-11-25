import { useLayoutEffect, type RefObject } from 'react'

const DOCKED_PANEL_ATTRIBUTE = 'data-asma-docked-panel'
/** Below this the page would be squeezed past usefulness; the panel overlays it as before. */
const MIN_PAGE_WIDTH_PX = 640

/**
 * Pads `<body>` by the width of the docked panels on its right, so the page lays out beside them
 * instead of under them and keeps its toolbar and pager reachable. Read from the DOM rather than
 * from module state, so panels from every ui-core copy on the page (each micro-app bundles its own)
 * count, and the last panel to change writes the final value.
 */
const syncReservedSpace = (): void => {
    const viewportWidth = document.documentElement.clientWidth
    const panelLefts = Array.from(document.querySelectorAll(`[${DOCKED_PANEL_ATTRIBUTE}]`), (panel) =>
        panel.getBoundingClientRect().left,
    )
    const reserved = panelLefts.length ? viewportWidth - Math.min(...panelLefts) : 0
    const fits = reserved > 0 && viewportWidth - reserved >= MIN_PAGE_WIDTH_PX
    document.body.style.paddingRight = fits ? `${Math.ceil(reserved)}px` : ''
}

/** Keeps the page clear of `panelRef` while `docked` (shown at the screen edge, not fullscreen or minimized). */
export const useReserveDockedPanelSpace = (panelRef: RefObject<HTMLElement | null>, docked: boolean): void => {
    useLayoutEffect(() => {
        const panel = panelRef.current
        if (!docked || !panel) return

        panel.setAttribute(DOCKED_PANEL_ATTRIBUTE, '')
        syncReservedSpace()
        // The panel resizes with its content or a dialog stack, and the viewport can drop below the limit.
        const observer = new ResizeObserver(syncReservedSpace)
        observer.observe(panel)
        window.addEventListener('resize', syncReservedSpace)

        return () => {
            observer.disconnect()
            window.removeEventListener('resize', syncReservedSpace)
            panel.removeAttribute(DOCKED_PANEL_ATTRIBUTE)
            syncReservedSpace()
        }
    }, [docked, panelRef])
}
