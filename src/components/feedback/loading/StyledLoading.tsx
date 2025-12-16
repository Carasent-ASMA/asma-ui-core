import clsx from 'clsx'
import type { FC } from 'react'
import { LoadingIcon } from 'src/components/icons'

interface StyledLoadingProps {
    isLoading: boolean
    className?: string
    size?: 'small' | 'medium' | 'large'
}

const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
}

export const StyledLoading: FC<StyledLoadingProps> = ({ isLoading, className = '', size = 'medium' }) => {
    if (!isLoading) return null

    const iconSize = sizeMap[size]

    return (
        <div
            className={clsx(
                'flex h-[50px] w-full animate-opacity-appear-3 items-center justify-center text-gama-500',
                className,
            )}
        >
            <LoadingIcon width={iconSize} height={iconSize} />
        </div>
    )
}
