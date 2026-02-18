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
            data-test='empty-page-container'
            className={`flex animate-opacity-in min-h-[106px] items-center w-full h-full justify-center gap-2 duration-300 text-gray-600 text-sm ${className}`}
        >
            <EmptyPageIcon
                data-test='empty-page-icon'
                width={24}
                height={24}
                className='cursor-default text-gray-600'
            />
            <span className='font-normal'>{emptyText}</span>
        </div>
    )
}
