import { Checkbox, type CheckboxProps } from '@mui/material'
import styles from './StyledCheckbox.module.scss'

export const StyledCheckbox = (props: CheckboxProps) => (
    <Checkbox
        {...props}
        classes={{
            ...props.classes,
            root: `${styles['root']}`,
            checked: `${styles['checked']}`,
            disabled: `${styles['disabled']}`,
            indeterminate: `${styles['indeterminate']}`,
        }}
    />
)
