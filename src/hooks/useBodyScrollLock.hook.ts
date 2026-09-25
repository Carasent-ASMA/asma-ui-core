import { useEffect } from 'react'

/**
 * Locks page scroll while `active` and puts the page back exactly where it was afterwards.
 *
 * `overflow: hidden` on both roots stops wheel and touch scrolling; the saved offset is restored on
 * release because some mobile engines jump to the top when overflow is toggled back.
 */
export const useBodyScrollLock = (active: boolean): void => {
    useEffect(() => {
        if (!active) return

        const { body, documentElement } = document
        const scrollY = window.scrollY
        const bodyOverflow = body.style.overflow
        const documentOverflow = documentElement.style.overflow
        body.style.overflow = 'hidden'
        documentElement.style.overflow = 'hidden'

        return () => {
            body.style.overflow = bodyOverflow
            documentElement.style.overflow = documentOverflow
            window.scrollTo(window.scrollX, scrollY)
        }
    }, [active])
}
