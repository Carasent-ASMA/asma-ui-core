import { forwardRef, type ComponentProps, type FC } from 'react'
import { StyledChip } from '../chip'
import type { CheckboxProps, RadioProps } from '@mui/material'
import { StyledCheckbox } from 'src/components/inputs/checkbox/StyledCheckbox'
import { StyledRadio } from 'src/components/inputs/radio-button/StyledRadio'

export interface StyledInteractiveChipProps extends ComponentProps<typeof StyledChip> {
    type?: 'checkbox' | 'radio'
    checked?: (CheckboxProps | RadioProps)['checked']
}

export const StyledInteractiveChip: FC<StyledInteractiveChipProps> = forwardRef<
    HTMLDivElement,
    StyledInteractiveChipProps
>(({ type = 'checkbox', checked, ...props }, ref) => {
    const isCheckboxControl = type === 'checkbox'

    const ControlComponent = isCheckboxControl ? StyledCheckbox : StyledRadio

    const shouldApplyRadioStyles = !props.readOnly && !isCheckboxControl && checked

    const interactionHoverStyles = {
        borderColor: 'var(--colors-gama-300)',
        backgroundColor: 'var(--colors-gama-25)',
        boxShadow: '0 0 0 1px inset var(--colors-gama-300)',
    }

    return (
        <StyledChip
            ref={ref}
            avatar={
                <ControlComponent
                    dataTest={props.dataTest}
                    disableRipple
                    checked={checked}
                    size={'small'}
                    sx={{ pointerEvents: 'none' }}
                />
            }
            clickable
            tabIndex={0}
            {...props}
            sx={{
                ...(shouldApplyRadioStyles && {
                    outline: 'none',
                    borderColor: 'var(--colors-gama-400)',
                    boxShadow: '0 0 0 1px inset var(--colors-gama-400)',
                    backgroundColor: 'var(--colors-gama-50)',
                    '&:hover': interactionHoverStyles,
                }),
                ...(props.readOnly && {
                    '& .MuiChip-avatar': {
                        '& .MuiSvgIcon-root': {
                            color: 'var(--colors-delta-500)',
                        },
                        '& .MuiCheckbox-root, & .MuiRadio-root': {
                            color: 'var(--colors-delta-500)',
                        },
                        '& .Mui-checked': {
                            color: 'var(--colors-delta-500)',
                        },
                    },
                }),
                ...(checked && {
                    '& .MuiChip-avatar': {
                        '& .MuiSvgIcon-root': {
                            color: 'var(--colors-gama-500)',
                        },
                    },
                }),
                '&:focus:hover': interactionHoverStyles,
                ...props.sx,
            }}
        />
    )
})
