import { Checkbox, type CheckboxProps, styled } from '@mui/material'
import clsx from 'clsx'

export const StyledCheckbox = styled((props: CheckboxProps) => (
    <Checkbox
        {...props}
        classes={{
            ...props.classes,
            checked: 'text-primary-600 hover:text-primary-600',
        }}
        className={clsx(props.className, 'text-[#b5bec9] hover:text-primary-600 [&>svg]:h-6 [&>svg]:w-6')}
    />
))``
