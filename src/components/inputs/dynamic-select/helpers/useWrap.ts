import { useLayoutEffect, useRef, useState, type DependencyList, type RefObject } from 'react'

export const useWrap = ({ dependencyList = [] }: { dependencyList?: DependencyList }): { wrapDisabled: boolean; containerRef: RefObject<HTMLDivElement>; } => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [wrapDisabled, setWrapDisabled] = useState(false)

    useLayoutEffect(() => {
        const container = containerRef.current
        if (!container) return

        const measure = () => {
            const chips = Array.from(container.children) as HTMLElement[]

            const hasOversizedChip = chips.some((chip) => {
                const label = chip.querySelector('.MuiChip-label') as HTMLElement | null
                if (!label) return false

                const root = chip.querySelector('.MuiButtonBase-root') as HTMLElement | null

                const isOverflowingWidth = label.scrollWidth > container.clientWidth
                const isWrapped = root ? label.scrollHeight > root.clientHeight : false

                return isOverflowingWidth || isWrapped
            })

            setWrapDisabled((prev) => (prev !== hasOversizedChip ? hasOversizedChip : prev))
        }

        const ro = new ResizeObserver(measure)
        ro.observe(container)

        return () => ro.disconnect()
    }, [...dependencyList])

    return { wrapDisabled, containerRef }
}
