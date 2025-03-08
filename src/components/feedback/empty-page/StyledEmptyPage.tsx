import type { FC } from 'react'
import EmptyPageIcon from 'src/components/feedback/empty-page/EmptyPageIcon'

/**
 * @props `isEmpty` is redundant and kept optional for backward compatibility
 */
export const StyledEmptyPage: FC<{ isEmpty?: boolean; emptyText: string; className?: string }> = ({
    emptyText,
    className = '',
}) => {
    return (
        <div
            data-test='empty-page-container'
            className={`flex animate-opacity-in items-center w-full h-full justify-center gap-2 duration-300 text-gray-600 text-sm ${className}`}
        >
            <EmptyPageIcon
                data-test='empty-page-icon'
                width={24}
                height={24}
                className='text-gray-600 cursor-default'
            />
            <p className='font-normal'>{emptyText}</p>
        </div>
    )
}
