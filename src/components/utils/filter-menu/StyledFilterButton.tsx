import { StyledButton, type StyledButtonProps } from '../../inputs/button'
import { FilterIcon } from '../../icons'
import { useDynamicToolbarLayout } from '../../custom/module/header-layout/DynamicToolbarLayoutContext'
import clsx from 'clsx'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#16741-35884 (Design-System · "Filter button") — button-only variant
 * of `StyledFilterMenu` (no popover). Aligned `StyledButton` (Outlined) + the "Filters applied" badge:
 * an 8px `gama-400` dot at top-right when `filterIsActive`.
 *
 * Custom props:
 * @param filterIsActive - needed to determine whether or not to show the dot in the top right corner indicating some changes were made
 * @param hideLabel - icon-only mode. When omitted, follows the surrounding DynamicToolbar layout (filterIconOnly).
 */

interface StyledFilterMenuProps {
    filterIsActive: boolean
    label?: string
    hideLabel?: boolean
}

export const StyledFilterButton: React.FC<StyledButtonProps & StyledFilterMenuProps> = ({
    filterIsActive,
    label,
    hideLabel,
    size = 'large',
    variant = 'outlined',
    ...props
}) => {
    const { filterIconOnly } = useDynamicToolbarLayout()
    const isLabelHidden = hideLabel ?? filterIconOnly

    return (
        <>
            <div className='relative h-fit w-fit'>
                <StyledButton
                    {...props}
                    type='button'
                    startIcon={<FilterIcon width={size === 'large' ? 24 : 20} height={size === 'large' ? 24 : 20} />}
                    variant={variant}
                    size={size}
                >
                    {!isLabelHidden && (label ?? 'Filter')}
                </StyledButton>
                {filterIsActive && (
                    <div
                        className={clsx(
                            'absolute h-2 w-2 rounded-full bg-gama-400',
                            size === 'large' ? 'right-2 top-2' : 'right-1 top-1',
                        )}
                    ></div>
                )}
            </div>
        </>
    )
}
