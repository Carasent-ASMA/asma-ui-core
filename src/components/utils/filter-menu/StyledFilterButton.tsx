import { StyledButton, type StyledButtonProps } from '../../inputs/button'
import { FilterIcon } from '../../icons'
import clsx from 'clsx'

/**
 * Custom props:
 * @param filterIsActive - needed to determine whether or not to show the dot in the top right corner indicating some changes were made
 */

interface StyledFilterMenuProps {
    filterIsActive: boolean
    label?: string
    hideLabel?: boolean
}

export const StyledFilterButton: React.FC<StyledButtonProps & StyledFilterMenuProps> = ({
    filterIsActive,
    label,
    hideLabel = false,
    size = 'large',
    variant = 'outlined',
    ...props
}) => {
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
                    {!hideLabel && (label ?? 'Filter')}
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
