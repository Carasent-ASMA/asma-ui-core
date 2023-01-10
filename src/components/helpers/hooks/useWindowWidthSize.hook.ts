import { useEffect, useState } from 'react'

export function useWindowWidthSize(): number | undefined {
    const [windowWidthSize, setWindowWidthSize] = useState<number | undefined>(undefined)

    useEffect(() => {
        const handleResize = () => setWindowWidthSize(window.innerWidth)

        window.addEventListener('resize', handleResize)

        handleResize()

        // Remove event listener on cleanup
        return () => window.removeEventListener('resize', handleResize)
    }, [window.innerWidth])

    return windowWidthSize
}

export const mobileView = (windowWidth: number | undefined) => {
    if (!windowWidth) return false
    return windowWidth <= 768
}

export const tabletView = (windowWidth: number | undefined) => {
    if (!windowWidth) return false
    return windowWidth <= 1400
}
