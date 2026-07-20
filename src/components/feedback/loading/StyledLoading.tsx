import { LoadingIcon } from 'src/components/icons'
import clsx from 'clsx'
import type { FC } from 'react'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#21335-39606 (Design-System · "Loading spinner")
 *
 * Centered loading spinner in the primary accent (`gama-500` — teal/jade), matching the DS spinner
 * used in buttons/inline. Already conformant: primary colour + 16/24/32 sizes.
 */
interface StyledLoadingProps {
    /** @figmaProp none — visibility toggle */
    isLoading: boolean
    /** @figmaProp none — behavioral */
    className?: string
    /** @figmaProp Size = small→16 | medium→24 | large→32 (spinner px) */
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
