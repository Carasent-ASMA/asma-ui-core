import { Checkbox, type CheckboxProps, styled } from '@mui/material'
import styles from './StyledCheckbox.module.scss'

export const StyledCheckbox = styled((props: CheckboxProps) => (
    <Checkbox
        {...props}
        classes={{
            ...props.classes,
            root: `${styles['root']}`,
            checked: `${styles['checked']}`,
        }}
    />
))``
