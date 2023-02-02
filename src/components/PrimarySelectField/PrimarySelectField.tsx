import { Select } from 'antd'
import { clsx } from 'clsx'
import styles from './PrimarySelectField.module.scss'
import { BaseSelectRef } from 'rc-select'
import { forwardRef } from 'react'
import { useErrorStatus } from '../helpers/hooks'

export interface IPrimarySelectFieldProps extends React.ComponentPropsWithRef<typeof Select> {
    label?: string
    error?: string
}

export const PrimarySelectField = forwardRef<BaseSelectRef, IPrimarySelectFieldProps>(function PrimarySelectField(
    { error, label, children, ...props },
    ref,
) {
    const status = useErrorStatus(error)

    return (
        <div className={clsx(props.className, styles['wrapper'])}>
            <label className={styles['label-wrapper']}>
                {label && <span className={styles['label']}>{label}</span>}

                <Select
                    {...props}
                    ref={ref}
                    className={clsx(styles['content'], styles['select-field'])}
                    status={status}
                    suffixIcon={<span className='material-icons-outlined'>arrow_drop_down</span>}
                >
                    {children}
                </Select>
            </label>
            {error && <span className={styles['error']}>{error}</span>}
        </div>
    )
})
