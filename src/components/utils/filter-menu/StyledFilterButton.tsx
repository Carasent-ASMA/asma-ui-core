import { StyledButton, type StyledButtonProps } from '../../inputs/button'
import { StyledBadge } from '../../data-display/badge'
import { FilterIcon } from '../../icons'
import { useDynamicToolbarLayout } from '../../custom/module/header-layout/DynamicToolbarLayoutContext'
import clsx from 'clsx'
import { filterButtonText } from './filterButtonText'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#16741-35884 (Design-System · "Filter button") — button-only variant
 * of `StyledFilterMenu` (no popover). Aligned `StyledButton` (Outlined) + the "Filters applied" badge:
 * Figma's `Parent=Filter` dot at top-right when `filterIsActive`.
 *
 * Custom props:
 * @param filterIsActive - needed to determine whether or not to show the dot in the top right corner indicating some changes were made
 * @param activeCount - how many filter values differ from the page default; shown as `Filter (N)` and implies the dot when `filterIsActive` is omitted
 * @param hideLabel - icon-only mode. When omitted, follows the surrounding DynamicToolbar layout (filterIconOnly).
 */

interface StyledFilterMenuProps {
    filterIsActive?: boolean
    activeCount?: number
    label?: string
    hideLabel?: boolean
}

export const StyledFilterButton: React.FC<StyledButtonProps & StyledFilterMenuProps> = ({
    filterIsActive,
    activeCount,
    label,
    hideLabel,
    size = 'large',
    variant = 'outlined',
    ...props
}) => {
    const { filterIconOnly } = useDynamicToolbarLayout()
    const isLabelHidden = hideLabel ?? filterIconOnly
    const text = filterButtonText(label, activeCount)
    const isDotShown = filterIsActive ?? !!activeCount

    return (
        <>
            <div className='relative h-fit w-fit'>
                <StyledButton
                    {...props}
                    type='button'
                    aria-label={isLabelHidden ? text : undefined}
                    startIcon={<FilterIcon width={size === 'large' ? 24 : 20} height={size === 'large' ? 24 : 20} />}
                    variant={variant}
                    size={size}
                >
                    {!isLabelHidden && text}
                </StyledButton>
                {isDotShown && (
                    <StyledBadge
                        dataTest='filter-button-active-dot'
                        variant='dot'
                        purpose='filter'
                        className={clsx('absolute', size === 'large' ? 'right-2 top-2' : 'right-1 top-1')}
                    />
                )}
            </div>
        </>
    )
}
