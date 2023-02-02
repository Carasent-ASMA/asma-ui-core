import { Input } from 'antd'
import { TextAreaRef } from 'antd/lib/input/TextArea'
import { forwardRef } from 'react'
import { useErrorStatus } from '../helpers/hooks/useErrorState.hook'

import styles from './TextAreaField.module.scss'

const { TextArea } = Input

export interface TextAreaFieldProps extends React.ComponentPropsWithRef<typeof TextArea> {
    label?: string
    error?: string
}

export const TextAreaField = forwardRef<TextAreaRef, TextAreaFieldProps>(function TextAreaField(
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
