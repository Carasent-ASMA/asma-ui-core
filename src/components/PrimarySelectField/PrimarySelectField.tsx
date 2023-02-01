import './custom-antd-select.scss'

import { type SelectProps, Select } from 'antd'
import { clsx } from 'clsx'
import styles from './PrimarySelectField.module.scss'
import { BaseSelectRef } from 'rc-select'
import { forwardRef } from 'react'
import { InputStatus } from 'antd/lib/_util/statusUtils'

type IPrimarySelectField = SelectProps & {
    children?: React.ReactNode
} & {
    label?: string
    error?: string
}

function useErrorStatus(error?: string) {
    let result: InputStatus | undefined

    if (error) {
        result = 'error'
    }

    return result
}

export const PrimarySelectField = forwardRef<BaseSelectRef, IPrimarySelectField>(function PrimarySelectField(
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
                    className={clsx(styles['content'], 'primary-select-field')}
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
