import { StyledButton, type StyledButtonProps } from '../../inputs/button'
import { StyledBadge } from '../../data-display/badge'
import { FilterIcon } from '../../icons'
import { useDynamicToolbarLayout } from '../../custom/module/header-layout/DynamicToolbarLayoutContext'
import clsx from 'clsx'
import { filterButtonText, isFilterDotShown } from './filterButtonText'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#16741-35884 (Design-System · "Filter button") — button-only variant
 * of `StyledFilterMenu` (no popover). Aligned `StyledButton` (Outlined) + the "Filters applied" badge:
 * Figma's `Parent=Filter` dot at top-right when `filterIsActive`.
 *
 * Custom props:
 * @param filterIsActive - shows the dot in the top right corner indicating some changes were made
 * @param activeCount - the number of filter controls that differ from the page default (the page computes it); shown as `Filter (N)`, dot when N > 0
 * @param hideLabel - icon-only mode. When omitted, follows the surrounding DynamicToolbar layout (filterIconOnly).
 */

interface StyledFilterMenuProps {
    /** Ignored when `activeCount` is given. */
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
    const isDotShown = isFilterDotShown(filterIsActive, activeCount)

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
