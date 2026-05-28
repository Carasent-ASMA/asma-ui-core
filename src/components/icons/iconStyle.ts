import type { CSSProperties } from 'react'

export const getSvgIconStyle = (color?: string, vFlip = false): CSSProperties | undefined => {
    if (!color && !vFlip) return undefined

    const style: CSSProperties = {}

    if (color) {
        style.color = color
    }

    if (vFlip) {
        style.transform = 'scaleY(-1)'
        style.transformOrigin = 'center'
    }

    return style
}
