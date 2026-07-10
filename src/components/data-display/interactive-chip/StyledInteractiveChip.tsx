import { forwardRef, type ComponentProps } from 'react'
import { StyledChip } from '../chip'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { StyledRadio } from 'src/components/inputs/radio-button/base-ui/StyledRadio'

export interface StyledInteractiveChipProps extends ComponentProps<typeof StyledChip> {
    type?: 'checkbox' | 'radio'
    checked?: boolean
    size?: 'small' | 'medium'
    ariaLabel?: string
}

// Radio-selected chips get a stronger gama border/fill. Applied as flat sx → inline style so it
// wins over StyledChip's base border class without tailwind-merge (dropped in Phase 0).
const SELECTED_CHIP_STYLE = {
    borderColor: 'var(--colors-gama-400)',
    backgroundColor: 'var(--colors-gama-50)',
    boxShadow: '0 0 0 1px inset var(--colors-gama-400)',
}

/**
 * A `StyledChip` whose avatar is a native checkbox or radio (base-ui controls now render their own
 * checked/read-only colours, so the old nested `.MuiChip-avatar .Mui*` `sx` is gone). Public props
 * preserved (DEC-003). TASK-101a.
 *
 * ponytail: a selected radio chip uses inline style for its border, so it shows no hover recolour
 * while selected — a minor known ceiling; upgrade path is REFACTOR-001 (className-based slots).
 */
export const StyledInteractiveChip = forwardRef<HTMLDivElement, StyledInteractiveChipProps>(
    ({ type = 'checkbox', checked, size = 'small', ariaLabel, ...props }, ref) => {
        const isCheckbox = type === 'checkbox'
        const accessibleName = ariaLabel ?? (typeof props.label === 'string' ? props.label : undefined)
        const isSelectedRadio = !props.readOnly && !isCheckbox && Boolean(checked)

        const control = isCheckbox ? (
            <StyledCheckbox
                dataTest={props.dataTest}
                disableRipple
                checked={checked}
                size={size}
                readOnly={props.readOnly}
                aria-label={accessibleName}
                className='pointer-events-none'
            />
        ) : (
            <StyledRadio
                dataTest={props.dataTest}
                checked={checked}
                size={size}
                aria-label={accessibleName}
                className='pointer-events-none'
            />
        )

        return (
            <StyledChip
                ref={ref}
                aria-label={accessibleName}
                avatar={control}
                clickable
                tabIndex={0}
                {...props}
                sx={isSelectedRadio ? { ...SELECTED_CHIP_STYLE, ...(props.sx as object) } : props.sx}
            />
        )
    },
)
