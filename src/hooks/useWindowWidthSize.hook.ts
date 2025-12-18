import { useEffect, useState } from 'react'

export function useWindowWidthSize(): number {
    const [windowSize, setWindowSize] = useState(window.innerWidth)

    const handleSize = () => {
        setWindowSize(window.innerWidth)
    }

    useEffect(() => {
        window.addEventListener('resize', handleSize)

        return () => {
            window.removeEventListener('resize', handleSize)
        }
    }, [])

    return windowSize
}

export const mobileView = (windowWidth: number | undefined): boolean => {
    /**
     * if return allways false it will breack mf widgets.
     */
    if (!windowWidth) return window.innerWidth < 768
    return windowWidth <= 768
}

export function useIsMobileView(): boolean {
    const windowsSize = useWindowWidthSize()

    const result = mobileView(windowsSize)

    return result
}

export function useIsTabletView(): boolean {
    const windowsSize = useWindowWidthSize()

    const result = tabletView(windowsSize)

    return result
}

export const tabletView = (windowWidth: number | undefined): boolean => {
    if (!windowWidth) return window.innerWidth < 1400
    return windowWidth <= 1400
}
