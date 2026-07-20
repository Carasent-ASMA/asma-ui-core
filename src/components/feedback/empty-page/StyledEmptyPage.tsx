import type { FC } from 'react'
import EmptyPageIcon from './EmptyPageIcon'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#22878-67600 (Design-System · "Empty state")
 *
 * Inline empty placeholder: icon 24 + Helper text (14/20 Regular), both in the placeholder grey
 * `text-icon/placeholder` (= `delta-500`), gap 8, centered.
 */
export const StyledEmptyPage: FC<{ emptyText: string; isEmpty?: boolean; className?: string }> = ({
    emptyText,
    isEmpty = true,
    className = '',
}) => {
    if (!isEmpty) return null

    return (
        <div
            data-testid='empty-page-container'
            // Figma text-icon/placeholder #7a899e = delta-500 (semantic token → fretex/greenish-safe;
            // was raw `text-gray-600` = delta-600, wrong shade + broke theming).
            className={`flex h-full min-h-[106px] w-full animate-opacity-in items-center justify-center gap-2 text-sm text-delta-500 duration-300 ${className}`}
        >
            <EmptyPageIcon
                data-testid='empty-page-icon'
                width={24}
                height={24}
                className='cursor-default text-delta-500'
            />
            <span className='font-normal'>{emptyText}</span>
        </div>
    )
}
