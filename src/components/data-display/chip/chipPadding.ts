import type { PaddingSides } from 'src/helpers/applyImportantPadding'

/** Figma _BASE_Tag (node 13248-31089) — medium h=32, radius=25, gap=4 */
export const getChipPadding = (
    size: 'small' | 'medium',
    hasStart: boolean,
    hasDelete: boolean,
): PaddingSides => {
    if (size === 'small') {
        if (hasStart && hasDelete) return { top: '4px', right: '4px', bottom: '4px', left: '4px' }
        if (hasDelete) return { top: '2px', right: '2px', bottom: '2px', left: '8px' }
        if (hasStart) return { top: '2px', right: '8px', bottom: '2px', left: '0' }
        return { top: '2px', right: '8px', bottom: '2px', left: '8px' }
    }
    if (hasStart && hasDelete) return { top: '4px', right: '4px', bottom: '4px', left: '4px' }
    if (hasDelete) return { top: '4px', right: '4px', bottom: '4px', left: '12px' }
    if (hasStart) return { top: '4px', right: '12px', bottom: '4px', left: '0' }
    return { top: '4px', right: '12px', bottom: '4px', left: '12px' }
}
