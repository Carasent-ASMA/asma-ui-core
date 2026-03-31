import { useEffect, useState } from 'react'

function useWindowWidthSize(): number {
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

const mobileView = (windowWidth: number | undefined): boolean => {
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
