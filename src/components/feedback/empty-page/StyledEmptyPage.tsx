import type { FC } from 'react'
import EmptyPageIcon from 'src/components/feedback/empty-page/EmptyPageIcon'

export const StyledEmptyPage: FC<{ emptyText: string; isEmpty?: boolean; className?: string }> = ({
    emptyText,
    isEmpty = true,
    className = '',
}) => {
    if (!isEmpty) return null

    return (
        <div
            data-testid='empty-page-container'
            className={`flex h-full min-h-[106px] w-full animate-opacity-in items-center justify-center gap-2 text-sm text-gray-600 duration-300 ${className}`}
        >
            <EmptyPageIcon
                data-testid='empty-page-icon'
                width={24}
                height={24}
                className='cursor-default text-gray-600'
            />
            <span className='font-normal'>{emptyText}</span>
        </div>
    )
}
