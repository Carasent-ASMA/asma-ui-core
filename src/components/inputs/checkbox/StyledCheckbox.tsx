import { Checkbox, type CheckboxProps } from '@mui/material'
import styles from './StyledCheckbox.module.scss'

export const StyledCheckbox: React.FC<CheckboxProps & { dataTest: string }> = ({ dataTest, ...props }) => (
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
