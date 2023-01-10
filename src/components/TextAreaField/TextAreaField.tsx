import { Input } from 'antd'
import type { TextAreaProps } from 'antd/lib/input'
import { omit } from 'lodash-es'
import type { FC } from 'react'

import { i18n } from '../helpers/i18n'
import styles from './Textarea.module.scss'

const { TextArea } = Input

interface TextAreaField extends TextAreaProps {
    value: string
    label?: string
    error?: string
    is_error?: boolean
    is_warning?: boolean
}

const TextAreaField: FC<TextAreaField> = (props) => {
    const isErrorOrNot = () => {
        if (props.is_error) {
            return 'error'
        }

        if (props.is_warning) {
            return 'warning'
        }
        return undefined
    }

    return (
        <div className={styles['textarea-wrapper']}>
            <label className={styles['label-wrapper']}>
                {props.label && <span className={styles['text-label']}>{props.label}</span>}
                <TextArea
                    placeholder={i18n.write_something}
                    rows={4}
                    {...omit(props, 'is_warning', 'iconPosition', 'is_error', 'error')}
                    status={isErrorOrNot()}
                    value={props.value}
                />
            </label>
            {isErrorOrNot() && (
                <span className={styles['error-message']}>{props.error ? props.error : i18n.required_field}</span>
            )}
        </div>
    )
}

export { TextAreaField }
