import { Input } from 'antd'
import { clsx } from 'clsx'

import styles from './TextField.module.scss'

export const TextField: React.FC<{
    className?: string
    label?: string
    placeholder?: string
    value?: string
    error?: string
    onChange?: (text: string) => void
    prefix?: React.ReactNode
    suffix?: React.ReactNode
}> = function TextField(props) {
    return (
        <div className={clsx(props.className, styles['wrapper'])}>
            <label className={styles['label-wrapper']}>
                <span className={styles['label']}>{props.label}</span>
                <Input
                    className={styles['content']}
                    placeholder={props.placeholder}
                    value={props.value}
                    onChange={(e) => {
                        if (props.onChange) {
                            props.onChange(e.currentTarget.value)
                        }
                    }}
                    status={props.error ? 'error' : undefined}
                    size='large'
                    prefix={props.prefix}
                    suffix={props.suffix}
                />
            </label>
            <span className={styles['error']}>{props.error}</span>
        </div>
    )
}
