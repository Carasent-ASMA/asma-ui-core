import { type InputProps, type InputRef, Input } from 'antd'
import { InputStatus } from 'antd/lib/_util/statusUtils'
import { forwardRef } from 'react'

import styles from './PrimaryInputField.module.scss'

export interface InputFieldProps extends InputProps {
    label?: string
    error?: string
    inputRef?: React.Ref<InputRef> | null
}

function useErrorStatus(error?: string) {
    let result: InputStatus | undefined

    if (error) {
        result = 'error'
    }

    return result
}

export const PrimaryInputField = forwardRef<InputRef, InputFieldProps>(function PrimaryInputField(
    { label, error, ...props },
    ref,
) {
    const status = useErrorStatus(error)

    return (
        <div className={styles['input-wrapper']}>
            <label>
                {label && <span className={styles['text-label']}>{label}</span>}
                <Input placeholder={props.placeholder} ref={ref} {...props} status={status} />
            </label>
            {error && <span className={styles['error-message']}>{error}</span>}
        </div>
    )
})
