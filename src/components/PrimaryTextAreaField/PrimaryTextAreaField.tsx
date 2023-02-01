import { Input } from 'antd'
import type { TextAreaProps } from 'antd/lib/input'
import { TextAreaRef } from 'antd/lib/input/TextArea'
import { InputStatus } from 'antd/lib/_util/statusUtils'
import { type FC, forwardRef } from 'react'

import styles from './PrimaryTextAreaField.module.scss'

const { TextArea } = Input

type PrimaryTextAreaFieldProps = TextAreaProps & {
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

export const PrimaryTextAreaField = forwardRef<TextAreaRef, PrimaryTextAreaFieldProps>(function PrimaryTextAreaField(
    { error, label, ...props },
    ref,
) {
    const status = useErrorStatus(error)

    return (
        <div className={styles['textarea-wrapper']}>
            <label className={styles['label-wrapper']}>
                {label && <span className={styles['text-label']}>{label}</span>}
                <TextArea ref={ref} rows={4} {...props} status={status} />
            </label>
            {error && <span className={styles['error-message']}>{error}</span>}
        </div>
    )
})
