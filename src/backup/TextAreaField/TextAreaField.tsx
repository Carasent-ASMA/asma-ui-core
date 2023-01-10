import { Input } from 'antd'
import { clsx } from 'clsx'

import styles from './TextAreaField.module.scss'

export const TextAreaField: React.FC<{
    className?: string
    label?: string
    placeholder?: string
    value?: string
    error?: string
    onChange?: (text: string) => void
}> = function TextAreaField(props) {
    return (
        <div className={clsx(props.className, styles['wrapper'])}>
            <label className={styles['label-wrapper']}>
                <span className={styles['label']}>{props.label}</span>
                <Input.TextArea
                    className={styles['content']}
                    placeholder={props.placeholder}
                    value={props.value}
                    onChange={(e) => {
                        if (props.onChange) {
                            props.onChange(e.currentTarget.value)
                        }
                    }}
                    autoSize={false}
                />
            </label>
            <span className={styles['error']}>{props.error}</span>
        </div>
    )
}
