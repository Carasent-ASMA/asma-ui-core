import { Checkbox, type CheckboxProps } from '@mui/material'
import styles from './StyledCheckbox.module.scss'

export const StyledCheckbox = ({dataTest, ...props}: CheckboxProps & { dataTest?: string }) => (
    <Checkbox
        {...props}
        data-test={dataTest}
        classes={{
            ...props.classes,
            root: `${styles['root']}`,
            checked: `${styles['checked']}`,
            disabled: `${styles['disabled']}`,
            indeterminate: `${styles['indeterminate']}`,
        }}
    />
)
