import { type InputRef, Input } from 'antd'
import { forwardRef } from 'react'
import { useErrorStatus } from '../helpers/hooks'

import styles from './PrimaryInputField.module.scss'

export type IPrimaryInputFieldProps = Omit<React.ComponentPropsWithRef<typeof Input>, 'status'> & {
    label?: string
    error?: string
}

export const PrimaryInputField: React.FC<IPrimaryInputFieldProps> = forwardRef<
    InputRef,
    React.PropsWithoutRef<IPrimaryInputFieldProps>
>(function PrimaryInputField({ label, error, ...props }, ref) {
    const status = useErrorStatus(error)

    return (
        <div className={styles['input-wrapper']}>
            <label>
                {label && <span className={styles['text-label']}>{label}</span>}
                <Input {...props} status={status} ref={ref} />
            </label>
            {error && <span className={styles['error-message']}>{error}</span>}
        </div>
    )
})
