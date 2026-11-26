import type { FC } from 'react'
import EmptyPageIcon from './EmptyPageIcon'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#22878-67600 (Design-System · "Empty state")
 *
 * Inline empty placeholder: icon 24 + Helper text (14/20 Regular), both in `text-icon/helper`
 * (= `delta-600`), gap 8, centered.
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
            // text-icon/helper, not text-icon/placeholder (delta-500 is 3.56:1 on white, below 4.5:1); design sign-off ASMA-8963.
            className={`animate-opacity-in text-delta-600 flex h-full min-h-[106px] w-full items-center justify-center gap-2 text-sm duration-300 ${className}`}
        >
            <EmptyPageIcon
                data-testid='empty-page-icon'
                width={24}
                height={24}
                className='text-delta-600 cursor-default'
            />
            <span className='font-normal'>{emptyText}</span>
        </div>
    )
}
